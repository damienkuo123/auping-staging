import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repo = path.resolve(process.argv[2] || process.cwd());
const read = (p) => fs.readFileSync(path.join(repo, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const failures = [];
const ok = (condition, message) => { if (!condition) failures.push(message); };
const normalize = (p) => { p = String(p || '/').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/auping-staging(?=\/|$)/, '') || '/'; if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/'; return p; };

const routes = json('data/rc6-routes.json').routes;
const products = json('data/rc6-products.json').products;
const filters = json('data/rc6-filter-schema.json');
const search = json('data/rc6-search-index.json').items;
const routeById = new Map(routes.map((r) => [r.id, r]));
const productMatches = (product, selected) => Object.entries(selected).every(([key, values]) => !values.length || values.some((value) => (product.attributes?.[key] || []).includes(value)));
const visible = (category, selected) => products.filter((p) => p.category === category && p.isProduct && !p.isPromo && productMatches(p, selected));

ok(filters.logic.withinGroup === 'OR' && filters.logic.betweenGroups === 'AND', 'Filter logic must be same-group OR and cross-group AND.');
const blackBox = visible('box-springs', { color: ['黑色'] });
ok(blackBox.length === 2, `Box Springs black expected 2, got ${blackBox.length}.`);
ok(new Set(blackBox.map((p) => p.routeId)).size === 2 && blackBox.some((p) => /Criade/.test(p.title)) && blackBox.some((p) => /Kiruna/.test(p.title)), 'Box Springs black must be Criade + Kiruna.');
const blackCriade = visible('box-springs', { color: ['黑色'], model: ['Criade'] });
ok(blackCriade.length === 1 && blackCriade[0].routeId === 'box-springs--criade-deep-black', 'Black + Criade must return exactly Criade deep black.');
ok(!blackCriade.some((p) => /Revive|Original/i.test(p.title)), 'Black + Criade must not contain Revive or Original.');
const aurondeBlack = visible('beds', { model: ['Auronde'], color: ['黑色'] });
ok(aurondeBlack.length === 1 && aurondeBlack[0].routeId === 'beds--auronde-deep-black', 'Beds Auronde + black must return exactly Auronde deep black.');
const orCheck = visible('box-springs', { model: ['Criade', 'Kiruna'], color: ['黑色'] });
ok(orCheck.length === 2, 'Same-group OR acceptance failed.');

for (const product of products) ok(routeById.has(product.routeId), `Product route missing: ${product.routeId}`);
for (const item of search) ok(routeById.has(item.routeId) && routeById.get(item.routeId).mode !== 'DISABLED', `Search item invalid route: ${item.routeId}`);
ok(search.some((x) => `${x.title} ${x.summary}`.includes('床')), 'Search index must contain Chinese 床 results.');
ok(search.some((x) => /Elysium/i.test(x.title)), 'Search index must contain Elysium.');
ok(search.some((x) => x.title.includes('被套')), 'Search index must contain 被套.');

const generatedReasons = routes.filter((r) => /Generated\/Generic/.test(r.reason || ''));
ok(generatedReasons.length > 0 && generatedReasons.every((r) => r.mode === 'OFFICIAL_REDIRECT'), 'Generated/Generic deep pages must all be OFFICIAL_REDIRECT.');
const unknownHome = read('404.html');
ok(!/location\.replace\(['"]\/auping-staging\/?['"]\)/.test(unknownHome), '404 must not unconditionally redirect to home.');
ok(unknownHome.includes('找不到這個頁面'), '404 must provide a real Traditional Chinese not-found page.');

const snapshot = read('assets/snapshot-interactions.js');
ok(!snapshot.includes('auping-static-search') && !snapshot.includes('auping-mobile-nav') && !snapshot.includes('function searchUI') && !snapshot.includes('function mobileNav'), 'snapshot-interactions.js must not own Search or Mobile Menu.');
ok(snapshot.includes('setupMegaMenus') && snapshot.includes('enableVideos'), 'snapshot-interactions.js must preserve desktop mega menu and media.');
const runtime = read('assets/rc6-runtime.js');
ok(runtime.includes('.rc6-search') && runtime.includes('data-rc6-menu') && runtime.includes('productMatches'), 'RC6 runtime is missing Search/Menu/Filter ownership.');

for (const page of ['index.html','box-springs/index.html','beds/index.html','mattresses/index.html','bed-linen/index.html']) {
  const full = path.join(repo, page);
  ok(fs.existsSync(full), `Required page missing: ${page}`);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, 'utf8');
  ok(text.includes('assets/rc6-runtime.js') && text.includes('assets/rc6-runtime.css'), `${page} missing RC6 assets.`);
  ok(!/rc5-bridge\.js|site-data\.js|cn-site\.js|generated\.js|assets\/site\.js/.test(text), `${page} still loads a legacy functional runtime.`);
}

if (failures.length) {
  console.error(`RC6 STATIC SMOKE FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(JSON.stringify({status:'PASS',routes:routes.length,products:products.length,searchItems:search.length,blackBox:blackBox.map((p)=>p.routeId),blackCriade:blackCriade[0].routeId,aurondeBlack:aurondeBlack[0].routeId}, null, 2));
