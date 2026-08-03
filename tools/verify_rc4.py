#!/usr/bin/env python3
from pathlib import Path
import json,sys,re
root=Path(sys.argv[1]).resolve(); errors=[]
required=['index.html','box-springs/index.html','beds/index.html','mattresses/index.html','toppers/index.html','bed-bases/index.html','pillows/index.html','bed-linen/index.html','bed-linen/duvet-covers/index.html','news/index.html','about-auping/index.html','customer-service/index.html','assets/cn-site.css','assets/cn-site.js','assets/site-data.js','404.html']
for rel in required:
 p=root/rel
 if not p.is_file() or p.stat().st_size<20: errors.append('MISSING '+rel)
js=(root/'assets/cn-site.js').read_text(encoding='utf-8')
for token in ['setupSearch','setupFilters','setupNews','filter-chip','site-search-input']:
 if token not in js: errors.append('JS TOKEN '+token)
for rel in ['index.html','mattresses/index.html','bed-linen/duvet-covers/index.html']:
 t=(root/rel).read_text(encoding='utf-8')
 if '/auping-staging/en/' in t or '/auping-staging/zh-tw/' in t: errors.append('LANG LINK '+rel)
 if 'English' in t or '>EN<' in t: errors.append('LANG SWITCH '+rel)
print('PASS required routes' if not any(x.startswith('MISSING') for x in errors) else 'FAIL required routes')
print('PASS Chinese-only links' if not any(x.startswith('LANG') for x in errors) else 'FAIL Chinese-only links')
print('PASS functional runtime markers' if not any(x.startswith('JS') for x in errors) else 'FAIL functional runtime markers')
if errors:
 print('\n'.join(errors)); raise SystemExit(1)
print('RC4 static verification PASS')
