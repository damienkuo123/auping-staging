#!/usr/bin/env python3
from __future__ import annotations
import json
import sys
from pathlib import Path

STYLE = '<link data-auping-rc76-map="style" rel="stylesheet" href="/auping-staging/assets/rc76/taiwan-store-locator.css?v=20260806-1">'
SCRIPT = '<script data-auping-rc76-map="runtime" defer src="/auping-staging/assets/rc76/taiwan-store-locator.js?v=20260806-1"></script>'
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
        print('usage: apply_rc76a1_taiwan_map.py <repo-root>', file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    changed = []
    failures = []
    for rel in TARGETS:
        path = root / rel
        if not path.is_file():
            failures.append(f'missing:{rel}')
            continue
        text = path.read_text('utf-8')
        if 'StoreLocator_StoreLocator__' not in text or 'GoogleMaps_GoogleMaps__' not in text:
            failures.append(f'missing-map-contract:{rel}')
            continue
        before = text
        if 'data-auping-rc76-map="style"' not in text:
            text = text.replace('</head>', STYLE + SCRIPT + '</head>', 1)
        elif 'data-auping-rc76-map="runtime"' not in text:
            text = text.replace('</head>', SCRIPT + '</head>', 1)
        if text != before:
            path.write_text(text, 'utf-8')
            changed.append(rel)
    report = {
        'schema': 'AUPING-RC7.6A1-TAIWAN-MAP-APPLY-V1',
        'targetPageCount': len(TARGETS),
        'changedFileCount': len(changed),
        'changedFiles': changed,
        'failures': failures,
    }
    out = root / 'audit/rc7.6/rc76a1-taiwan-map-apply-report.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if failures else 0

if __name__ == '__main__':
    raise SystemExit(main())
