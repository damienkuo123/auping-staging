#!/usr/bin/env python3
from pathlib import Path
import json, sys, subprocess
root=Path(sys.argv[1]).resolve()
required=[
    root/'assets/snapshot-interactions.js',
    root/'tests/ui-audit.mjs',
]
media=[
'193fbd75c0b38f98e24babb9116b.webm',
'1c887ed4fb0aa061cf0eeca786c3.webm',
'1e148dd8972b04e0fe919757c882.webm',
'2a7be2063982a32f62c283deeca6.webm',
'2c7f60394e11ffca478b4cf3324f.webm',
'7a6e9914db47f88e9c9415e507ed.webm',
'927e13502742db5ff7e642b84de9.webm',
'a3315162a17e816d46aa5b3f1a3b.webm',
'e9b877417b0f4a580bed30e01448.webm',
'fdfaecfdf94deb4e840c6b83c202.webm',
]
errors=[]
for p in required:
    if not p.is_file() or p.stat().st_size<1000: errors.append(f'MISSING {p.relative_to(root)}')
for name in media:
    p=root/'assets/light-catalog/media'/name
    if not p.is_file() or p.stat().st_size<10000: errors.append(f'MISSING {p.relative_to(root)}')
js=(root/'assets/snapshot-interactions.js').read_text(encoding='utf-8')
audit=(root/'tests/ui-audit.mjs').read_text(encoding='utf-8')
checks={
'VP8 WebM routing':'RAW_WEBM_BASE' in js and "webmFile" in js,
'Mega Menu scroll close':"window.addEventListener('scroll', close" in js,
'Audit menu reset':"document.body.classList.remove('auping-mega-open')" in audit,
'RC2 marker':'Hybrid RC2' in js,
}
for label,ok in checks.items():
    print(('PASS ' if ok else 'FAIL ')+label)
    if not ok: errors.append(label)
print(f"PASS WebM files {sum((root/'assets/light-catalog/media'/n).is_file() for n in media)}/10")
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('RC2 static verification PASS')
