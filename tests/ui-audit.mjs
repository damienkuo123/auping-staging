import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const ORIGINAL_BASE = process.env.ORIGINAL_BASE || 'https://www.auping.com';
const STAGING_BASE = process.env.STAGING_BASE || 'https://damienkuo123.github.io/auping-staging';
const OUT = path.resolve('ui-audit-output');
const routes = [
  '/en/', '/en/box-springs/', '/en/beds/', '/en/mattresses/',
  '/en/toppers/', '/en/bed-bases/', '/en/bed-linen/', '/en/store-locator/'
];
const profiles = {
  desktop: { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 },
  tablet: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 },
  mobile: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }
};
const safe = (v) => v.replace(/^\/+|\/+$/g, '').replaceAll('/', '__') || 'root';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function dir(p) { await fs.mkdir(p, { recursive: true }); }

async function suppressNoise(page) {
  await page.addStyleTag({ content: `
    [id*="Cookie" i],[class*="Cookie" i],[id*="Cybot" i],[class*="Cybot" i],
    [id*="consent" i],[class*="consent" i]{display:none!important}
    *,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}
  ` }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('#CybotCookiebotDialog,#CybotCookiebotDialogBodyUnderlay').forEach((e) => e.remove());
  }).catch(() => {});
}

async function videos(page) {
  return page.evaluate(() => [...document.querySelectorAll('video')].map((v, index) => ({
    index, paused: v.paused, muted: v.muted, autoplay: v.autoplay,
    playsInline: v.playsInline, readyState: v.readyState,
    currentTime: Number(v.currentTime.toFixed(2)),
    duration: Number.isFinite(v.duration) ? Number(v.duration.toFixed(2)) : null,
    src: v.currentSrc || v.src || ''
  })));
}

async function freezeVideoFrames(page) {
  await page.evaluate(() => {
    for (const v of document.querySelectorAll('video')) {
      try { v.muted = true; v.currentTime = 1; v.pause(); } catch {}
    }
  }).catch(() => {});
}

async function shot(page, file, options = {}) {
  await dir(path.dirname(file));
  await page.screenshot({ path: file, animations: 'disabled', ...options });
}

async function audit(browser, site, base, route, profileName, profile) {
  const output = path.join(OUT, site, profileName, safe(route));
  await dir(output);
  const context = await browser.newContext({
    ...profile, locale: 'en-GB', colorScheme: 'light', reducedMotion: 'reduce',
    recordVideo: { dir: path.join(output, 'video'), size: profile.viewport }
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  const report = { site, route, profileName, url: new URL(route, base).href, consoleErrors: [], failedRequests: [], hovers: [] };
  page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
  page.on('requestfailed', (r) => report.failedRequests.push({ url: r.url(), error: r.failure()?.errorText || '' }));
  try {
    const response = await page.goto(report.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    report.status = response?.status() ?? null;
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await suppressNoise(page);
    await wait(1200);
    report.videoAtLoad = await videos(page);
    await wait(4500);
    report.videoAfter4500ms = await videos(page);
    await freezeVideoFrames(page);
    await shot(page, path.join(output, '00-initial.png'));

    if (profileName === 'desktop') {
      for (const label of ['Box springs','Beds','Mattresses','Toppers','Bed bases','Pillows','Bed linen']) {
        const link = page.getByRole('link', { name: label, exact: true }).first();
        if (await link.count()) {
          try {
            await link.hover({ timeout: 5000 });
            await wait(700);
            const file = `hover-${safe(label)}.png`;
            await shot(page, path.join(output, file));
            const visibleMenus = await page.locator('[role="menu"]:visible,[class*="menu" i]:visible,[class*="dropdown" i]:visible').count();
            report.hovers.push({ label, captured: true, visibleMenus });
          } catch (error) { report.hovers.push({ label, captured: false, error: String(error) }); }
        }
      }
    }

    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const stops = [...new Set([0, Math.round(height*.25), Math.round(height*.5), Math.round(height*.75), Math.max(0, height-profile.viewport.height)])];
    for (let i=0;i<stops.length;i++) {
      await page.evaluate((y) => window.scrollTo({ top:y, behavior:'instant' }), stops[i]);
      await wait(450);
      await shot(page, path.join(output, `scroll-${String(i).padStart(2,'0')}.png`));
    }
    await page.evaluate(() => window.scrollTo(0,0));
    await shot(page, path.join(output, 'full-page.png'), { fullPage: true });

    if (profileName === 'mobile') {
      const target = page.locator('[aria-label*="menu" i],[aria-label*="navigation" i]').first();
      if (await target.count()) {
        try { await target.click(); await wait(500); await shot(page, path.join(output,'mobile-menu-open.png')); report.mobileMenu = true; }
        catch (error) { report.mobileMenuError = String(error); }
      }
    }
    const search = page.locator('[aria-label*="search" i],button:has-text("Search"),a:has-text("Search")').first();
    if (await search.count()) {
      try { await search.click(); await wait(500); await shot(page, path.join(output,'search-open.png')); report.searchOpen = true; }
      catch (error) { report.searchError = String(error); }
    }
  } catch (error) { report.fatalError = String(error); }
  await fs.writeFile(path.join(output,'result.json'), JSON.stringify(report,null,2));
  await context.tracing.stop({ path: path.join(output,'trace.zip') }).catch(() => {});
  await context.close();
  return report;
}

async function diff(aFile,bFile,outFile) {
  try {
    const [aRaw,bRaw] = await Promise.all([fs.readFile(aFile),fs.readFile(bFile)]);
    const a=PNG.sync.read(aRaw), b=PNG.sync.read(bRaw);
    if(a.width!==b.width||a.height!==b.height) return { comparable:false,reason:'different dimensions' };
    const d=new PNG({width:a.width,height:a.height});
    const pixels=pixelmatch(a.data,b.data,d.data,a.width,a.height,{threshold:.12,includeAA:false});
    await dir(path.dirname(outFile)); await fs.writeFile(outFile,PNG.sync.write(d));
    return {comparable:true,pixels,total:a.width*a.height,ratio:pixels/(a.width*a.height)};
  } catch(error) { return {comparable:false,reason:String(error)}; }
}

await fs.rm(OUT,{recursive:true,force:true}); await dir(OUT);
const browser=await chromium.launch({headless:true});
const results=[];
for(const [profileName,profile] of Object.entries(profiles)) {
  for(const route of routes) {
    results.push(await audit(browser,'original',ORIGINAL_BASE,route,profileName,profile));
    results.push(await audit(browser,'staging',STAGING_BASE,route,profileName,profile));
  }
}
await browser.close();
const diffs=[];
for(const profileName of Object.keys(profiles)) for(const route of routes) for(const name of ['00-initial.png','scroll-01.png','scroll-02.png','full-page.png']) {
  diffs.push({profileName,route,name,...await diff(
    path.join(OUT,'original',profileName,safe(route),name),
    path.join(OUT,'staging',profileName,safe(route),name),
    path.join(OUT,'diff',profileName,safe(route),name)
  )});
}
const staging=results.filter((r)=>r.site==='staging');
const summary={
  generatedAt:new Date().toISOString(), originalBase:ORIGINAL_BASE, stagingBase:STAGING_BASE,
  routes, profiles:Object.keys(profiles), results,
  autoplayFailures:staging.filter((r)=>(r.videoAfter4500ms||[]).some((v)=>v.paused||v.currentTime<=.05)).map((r)=>({route:r.route,profileName:r.profileName,videos:r.videoAfter4500ms})),
  hoverFailures:staging.flatMap((r)=>(r.hovers||[]).filter((h)=>!h.captured||h.visibleMenus===0).map((h)=>({route:r.route,profileName:r.profileName,...h}))),
  diffs
};
await fs.writeFile(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({autoplayFailures:summary.autoplayFailures.length,hoverFailures:summary.hoverFailures.length},null,2));
