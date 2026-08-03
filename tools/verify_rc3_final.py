#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(sys.argv[1]).resolve()
ROUTES = [
    'index.html','box-springs/index.html','beds/index.html','mattresses/index.html','toppers/index.html',
    'bed-bases/index.html','bed-linen/index.html','bed-linen/pillows/index.html','news/index.html',
    'mattresses/elysium-mattress/index.html','bed-linen/duvet-covers/playful-bricks-duvet-cover/index.html',
    'about-auping/index.html','customer-service/index.html'
]
errors=[]

for rel in ROUTES:
    p=ROOT/'zh-tw'/rel
    if not p.is_file() or p.stat().st_size<1000:
        errors.append(f'MISSING zh-tw/{rel}')
        continue
    text=p.read_text(encoding='utf-8',errors='ignore')
    if 'lang="zh-Hant"' not in text and "lang='zh-Hant'" not in text:
        errors.append(f'LANG zh-tw/{rel}')
    if 'rc3-final.js' not in text or 'rc3-final.css' not in text:
        errors.append(f'RUNTIME zh-tw/{rel}')

required=[
    ROOT/'assets/rc3-final.js',ROOT/'assets/rc3-final.css',ROOT/'assets/i18n-zh-tw.json',
    ROOT/'assets/search-index-zh-tw.js',ROOT/'assets/zh-tw-scope.json'
]
for p in required:
    if not p.is_file() or p.stat().st_size<100:
        errors.append(f'MISSING {p.relative_to(ROOT)}')

js=(ROOT/'assets/rc3-final.js').read_text(encoding='utf-8')
checks={
    'inline search bar':'auping-search-inline' in js,
    'catalog filter runtime':'setupCatalogFilters' in js and 'auping-filter-chip' in js,
    'news tag runtime':'setupNewsTags' in js and 'auping-tag-active' in js,
    'product detail enhancement':'enhanceGeneratedProductPage' in js,
    'language switcher':'setupLanguageSwitcher' in js,
    'Traditional Chinese path':'/zh-tw' in js,
}
for label,ok in checks.items():
    print(('PASS ' if ok else 'FAIL ')+label)
    if not ok: errors.append(label)


# Confirm that the shared RC3 runtime was attached to the broad generated-product template family.
generated_pages=[]
for page in (ROOT/'en').rglob('*.html'):
    raw=page.read_text(encoding='utf-8',errors='ignore')
    if 'generated-product-hero' in raw:
        generated_pages.append((page, 'rc3-final.js' in raw and 'rc3-final.css' in raw))
missing_generated=[str(p.relative_to(ROOT)) for p,ok in generated_pages if not ok]
if missing_generated:
    errors.extend('RUNTIME '+x for x in missing_generated[:10])
print(f"PASS generated English product templates {sum(ok for _,ok in generated_pages)}/{len(generated_pages)}")

# Validate JSON.
for rel in ['assets/i18n-zh-tw.json','assets/zh-tw-scope.json']:
    try: json.loads((ROOT/rel).read_text(encoding='utf-8'))
    except Exception as exc: errors.append(f'JSON {rel}: {exc}')

# Validate selected defaults.
ely=BeautifulSoup((ROOT/'en/mattresses/elysium-mattress/index.html').read_text(encoding='utf-8',errors='ignore'),'html.parser')
defaults={'490':'70 cm','491':'200 cm','498':'Y','493':'Medium'}
for name,wanted in defaults.items():
    select=ely.find('select',attrs={'name':name})
    selected=select.find('option',selected=True) if select else None
    if not selected or ' '.join(selected.get_text(' ',strip=True).split())!=wanted:
        errors.append(f'Elysium default {name} != {wanted}')

# Validate representative Chinese content.
representative=(ROOT/'zh-tw/bed-linen/duvet-covers/playful-bricks-duvet-cover/index.html').read_text(encoding='utf-8',errors='ignore')
for token in ['Playful Bricks 被套','商品規格','尋找門市']:
    if token not in representative: errors.append(f'Chinese representative missing: {token}')

# Node syntax if available.
try:
    proc=subprocess.run(['node','--check',str(ROOT/'assets/rc3-final.js')],capture_output=True,text=True)
    if proc.returncode:
        errors.append('JavaScript syntax: '+proc.stdout+proc.stderr)
    else:
        print('PASS JavaScript syntax')
except FileNotFoundError:
    print('WARN Node unavailable; JavaScript syntax not locally checked')

if errors:
    print('\n'.join('ERROR '+e for e in errors))
    raise SystemExit(1)
print(f'PASS Traditional Chinese pages {len(ROUTES)}/{len(ROUTES)}')
print('PASS Elysium defaults 4/4')
print('RC3 final static verification PASS')
