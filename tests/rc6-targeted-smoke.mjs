import process from 'node:process';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('RC6 BROWSER SMOKE SKIP: Playwright is not installed. Static smoke remains mandatory.');
  process.exit(0);
}

const base = (process.env.RC6_BASE_URL || 'http://127.0.0.1:4173/auping-staging').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
const check = async (name, fn) => {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
};
const open = async (path) => {
  await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('html[data-auping-rc6]', { timeout: 15000 });
  if (await page.locator('[data-rc6-search-trigger]').count() < 1) throw new Error(`missing fixed Search trigger on ${path}`);
};

for (const path of ['/', '/box-springs/', '/beds/', '/mattresses/', '/bed-linen/', '/bed-linen/duvet-covers/', '/mattresses/elysium-mattress/']) {
  await check(`route ${path}`, async () => { await open(path); });
}

await check('single Chinese Search layer', async () => {
  await open('/');
  const trigger = page.locator('[data-rc6-search-trigger]').first();
  await trigger.click();
  if (await page.locator('.rc6-search:not([hidden])').count() !== 1) throw new Error('expected exactly one open RC6 search layer');
  if (await page.locator('.auping-static-search,.rc5-search,.site-search,.search-dialog').count()) throw new Error('legacy search layer still exists');
  await page.locator('#rc6-search-input').fill('床');
  await page.waitForSelector('.rc6-search__result');
  const count = await page.locator('.rc6-search__result').count();
  if (count < 1) throw new Error('Chinese search returned no result');
  await page.keyboard.press('Escape');
});

await check('original FullPageMenu mobile controller', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open('/');
  await page.locator('[data-rc6-menu-trigger]').first().click();
  const menu = page.locator('[data-rc6-menu].rc6-menu-open');
  if (await menu.count() !== 1) throw new Error('captured FullPageMenu did not open');
  const locked = await page.evaluate(() => document.body.classList.contains('rc6-scroll-lock'));
  if (!locked) throw new Error('scroll lock missing');
  await page.keyboard.press('Escape');
  if (await page.locator('[data-rc6-menu].rc6-menu-open').count()) throw new Error('Escape did not close menu');
  await page.setViewportSize({ width: 1440, height: 1000 });
});

const setFilter = async (path, selections, expectedIds) => {
  await open(path);
  for (const [key, values] of Object.entries(selections)) {
    for (const value of values) await page.locator(`input[data-rc6-filter-key="${key}"][data-rc6-filter-value="${value}"]`).check();
  }
  const ids = await page.locator('[data-rc6-product-card]:not([hidden])').evaluateAll((nodes) => nodes.map((node) => node.dataset.rc6RouteId).sort());
  const expected = [...expectedIds].sort();
  if (JSON.stringify(ids) !== JSON.stringify(expected)) throw new Error(`expected ${expected.join(', ')}, got ${ids.join(', ')}`);
  for (const [key, values] of Object.entries(selections)) for (const value of values) {
    if (!new URL(page.url()).searchParams.getAll(key).includes(value)) throw new Error(`URL missing ${key}=${value}`);
  }
};

await check('Box Springs black = 2', async () => setFilter('/box-springs/', { color: ['黑色'] }, ['box-springs--criade-deep-black','box-springs--kiruna-deep-black']));
await check('Box Springs black + Criade = 1', async () => setFilter('/box-springs/', { color: ['黑色'], model: ['Criade'] }, ['box-springs--criade-deep-black']));
await check('Beds Auronde + black = 1', async () => setFilter('/beds/', { model: ['Auronde'], color: ['黑色'] }, ['beds--auronde-deep-black']));

await browser.close();
if (failures.length) {
  console.error(`RC6 TARGETED BROWSER SMOKE FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('RC6 TARGETED BROWSER SMOKE PASS');
