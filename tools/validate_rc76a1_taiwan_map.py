#!/usr/bin/env python3
from __future__ import annotations
import json
import subprocess
import sys
from pathlib import Path

TARGETS = [
    'beds/index.html', 'toppers/index.html', 'box-springs/index.html', 'mattresses/index.html',
    'bed-linen/index.html', 'bed-bases/index.html', 'bed-linen/mattress-protectors/index.html',
    'bed-linen/pillowcases/index.html', 'bed-linen/duvet-covers/index.html',
    'bed-linen/pillows/index.html', 'bed-linen/duvets/index.html', 'bed-linen/bedspreads/index.html',
    'bed-linen/fitted-sheets/index.html', 'box-springs/criade/index.html',
    'box-springs/kiruna/index.html', 'beds/noa/index.html', 'beds/original/index.html',
    'beds/noble/index.html'
]

def main() -> int:
    if len(sys.argv) != 2:
        print('usage: validate_rc76a1_taiwan_map.py <repo-root>', file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    failures = []
    js = root / 'assets/rc76/taiwan-store-locator.js'
    css = root / 'assets/rc76/taiwan-store-locator.css'
    config = root / 'data/rc76-taiwan-store-locator.json'
    for path in (js, css, config):
        if not path.is_file() or path.stat().st_size < 100:
            failures.append(f'missing-or-empty:{path.relative_to(root)}')
    if js.is_file():
        result = subprocess.run(['node', '--check', str(js)], text=True, capture_output=True)
        if result.returncode != 0:
            failures.append('javascript-syntax:' + (result.stderr.strip() or 'unknown'))
        source = js.read_text('utf-8')
        for token in ('Auping Taiwan', 'navigator.geolocation', 'officialLocator', 'auping-tw-map-frame'):
            if token not in source:
                failures.append(f'js-missing-token:{token}')
    ready = 0
    for rel in TARGETS:
        path = root / rel
        if not path.is_file():
            failures.append(f'missing:{rel}')
            continue
        text = path.read_text('utf-8')
        if text.count('data-auping-rc76-map="style"') != 1:
            failures.append(f'style-count:{rel}')
        if text.count('data-auping-rc76-map="runtime"') != 1:
            failures.append(f'runtime-count:{rel}')
        if 'StoreLocator_StoreLocator__' not in text or 'GoogleMaps_GoogleMaps__' not in text:
            failures.append(f'map-contract:{rel}')
        else:
            ready += 1
    report = {
        'schema': 'AUPING-RC7.6A1-TAIWAN-MAP-VALIDATION-V1',
        'passed': not failures,
        'targetPages': len(TARGETS),
        'readyPages': ready,
        'failures': failures,
    }
    out = root / 'audit/rc7.6/rc76a1-taiwan-map-validation.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if failures else 0

if __name__ == '__main__':
    raise SystemExit(main())
