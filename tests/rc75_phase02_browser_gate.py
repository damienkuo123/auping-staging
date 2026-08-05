#!/usr/bin/env python3
from __future__ import annotations
import argparse, asyncio, json, mimetypes
from pathlib import Path
from urllib.parse import urlparse, unquote
from playwright.async_api import async_playwright


def args():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--base-url',default='https://auping.test/auping-staging');p.add_argument('--chromium-executable',default='/usr/bin/chromium');p.add_argument('--output',type=Path,required=True);return p.parse_args()

def product_matches(p,state):
    return all(not vals or any(v in p.get('attributes',{}).get(k,[]) for v in vals) for k,vals in state.items())

async def install_local_router(page, root: Path, base: str):
    parsed_base=urlparse(base); prefix=parsed_base.path.rstrip('/')
    async def handler(route):
        req=route.request; u=urlparse(req.url)
        if u.scheme==parsed_base.scheme and u.netloc==parsed_base.netloc and u.path.startswith(prefix):
            rel=unquote(u.path[len(prefix):]).lstrip('/')
            target=root/rel
            if u.path.endswith('/') or target.is_dir(): target=target/'index.html'
            allowed = req.resource_type == 'document' or rel.endswith((
                'assets/rc75-combobox.js','assets/rc75-catalog.js','assets/rc73-page.js',
                'data/rc75-combobox-variants.json','data/rc75-catalog-parity.json'
            ))
            if allowed and target.is_file():
                ctype=mimetypes.guess_type(target.name)[0] or 'application/octet-stream'
                await route.fulfill(status=200,body=target.read_bytes(),content_type=ctype); return
            await route.abort(); return
        await route.abort()
    await page.route('**/*',handler)

async def combo_case(browser,root,base,pid,page_cfg,viewport):
    ctx=await browser.new_context(viewport=viewport);page=await ctx.new_page();errs=[];await install_local_router(page,root,base)
    page.on('console',lambda m: errs.append(m.text) if m.type=='error' and '[Auping RC7.5 Phase 02]' in m.text else None)
    resp=await page.goto(base.rstrip('/')+page_cfg['localPath'],wait_until='domcontentloaded',timeout=45000)
    await page.wait_for_function("document.documentElement.dataset.aupingComboboxStatus === 'ready'",timeout=15000)
    controls={}
    for c in page_cfg['controls']:
        loc=page.locator(f'[data-auping-combobox-native="{c["key"]}"]');await loc.wait_for(state='attached')
        count=await loc.locator('option').count();expected=len(c['options']);value=c['options'][-1]['value'];await loc.select_option(value)
        selected=await loc.input_value();host=await page.locator(f'[data-auping-combobox-control="{c["key"]}"]').get_attribute('data-auping-selected-value')
        query=await page.evaluate("k=>new URL(location.href).searchParams.get(k)",c.get('queryParam',c['key']))
        stored=await page.evaluate("([p,k])=>localStorage.getItem(`auping:rc75:${p}:${k}`)",[pid,c['key']])
        assert count==expected and selected==host==query==stored==value,(pid,c['key'],count,expected,selected,host,query,stored,value)
        controls[c['key']]={'mode':c['mode'],'options':count,'selected':selected}
    await page.reload(wait_until='domcontentloaded');await page.wait_for_function("document.documentElement.dataset.aupingComboboxStatus === 'ready'",timeout=15000)
    for c in page_cfg['controls']: assert await page.locator(f'[data-auping-combobox-native="{c["key"]}"]').input_value()==c['options'][-1]['value']
    assert not errs,errs
    result={'pageId':pid,'viewport':viewport,'status':resp.status if resp else None,'controls':controls};await ctx.close();return result

async def catalog_case(browser,root,base,pid,cfg,viewport):
    ctx=await browser.new_context(viewport=viewport);page=await ctx.new_page();errs=[];await install_local_router(page,root,base)
    page.on('console',lambda m: errs.append(m.text) if m.type=='error' and '[Auping RC7.5 Phase 02]' in m.text else None)
    resp=await page.goto(base.rstrip('/')+cfg['localPath'],wait_until='domcontentloaded',timeout=45000)
    await page.wait_for_function(f"document.documentElement.dataset.aupingCatalogReady === '{pid}'",timeout=15000)
    initial=int(await page.locator('html').get_attribute('data-auping-catalog-visible'));assert initial==len(cfg['products']),(pid,initial,len(cfg['products']))
    group=cfg['groups'][0];option=group['options'][0];expected=sum(product_matches(p,{group['key']:[option['value']]}) for p in cfg['products'])
    await page.locator(f'[id="{option["inputId"]}"]').check();await page.wait_for_function(f"document.documentElement.dataset.aupingCatalogVisible === '{expected}'",timeout=5000)
    visible=int(await page.locator('html').get_attribute('data-auping-catalog-visible'));query=await page.evaluate("k=>new URL(location.href).searchParams.get(k)",group.get('queryKey',group['key']))
    count_text=await page.locator('text=/^共\\s*\\d+\\s*件商品$/').first.inner_text();assert visible==expected and query==option['value'] and count_text==f'共 {expected} 件商品',(pid,visible,expected,query,count_text)
    assert not errs,errs
    result={'pageId':pid,'viewport':viewport,'status':resp.status if resp else None,'initial':initial,'filter':option['value'],'visible':visible};await ctx.close();return result

async def main():
    a=args();root=a.root.resolve();combo=json.loads((root/'data/rc75-combobox-variants.json').read_text())['pages'];cat=json.loads((root/'data/rc75-catalog-parity.json').read_text())['pages'];results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path=a.chromium_executable,args=['--no-sandbox','--ignore-certificate-errors'])
        try:
            for pid,cfg in combo.items(): results.append(await combo_case(browser,root,a.base_url,pid,cfg,{'width':1440,'height':1000}))
            for pid,cfg in cat.items(): results.append(await catalog_case(browser,root,a.base_url,pid,cfg,{'width':1440,'height':1000}))
            for pid in ['bed-bases--electrically-adjustable-bed-base-1m','mattresses--elite-mattress']: results.append(await combo_case(browser,root,a.base_url,pid,combo[pid],{'width':390,'height':844}))
            for pid in ['bed-linen-fitted-sheets','bed-linen-duvets']: results.append(await catalog_case(browser,root,a.base_url,pid,cat[pid],{'width':390,'height':844}))
        finally: await browser.close()
    payload={'schema':'AUPING-RC7.5-PHASE02-BROWSER-GATE-V1','engine':'chromium','passed':True,'cases':results,'summary':{'cases':len(results),'comboboxDesktop':len(combo),'catalogDesktop':len(cat),'mobileSamples':4}}
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n');print(json.dumps(payload['summary'],ensure_ascii=False,indent=2));return 0
if __name__=='__main__': raise SystemExit(asyncio.run(main()))
