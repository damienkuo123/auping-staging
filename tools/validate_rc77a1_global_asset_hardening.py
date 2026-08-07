#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

SCHEMA = "AUPING-RC7.7A1-GLOBAL-ASSET-HARDENING-VALIDATION-V1"
SKIP_PARTS = {".git", "node_modules", "Auping_Parity_Reports", "dist", "build"}
ATTR_RE = re.compile(r'\b(src|href|poster|srcset|imagesrcset)\s*=\s*(["\'])(.*?)\2', re.I | re.S)
DESCRIPTOR_RE = re.compile(r"^(?:\d+(?:\.\d+)?[wx])$", re.I)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def srcset_urls(value: str) -> list[str]:
    urls=[]
    for candidate in value.split(','):
        part=candidate.strip()
        if not part:
            continue
        bits=part.rsplit(None,1)
        if len(bits)==2 and DESCRIPTOR_RE.match(bits[1]):
            urls.append(bits[0])
        else:
            urls.append(part)
    return urls


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--repo',required=True)
    parser.add_argument('--report',default='audit/rc7.7/rc77a1_validation_report.json')
    args=parser.parse_args()
    repo=Path(args.repo).expanduser().resolve()

    failures=[]
    stats={
        'htmlFileCount':0,
        'srcsetCandidateCount':0,
        'localAssetReferenceCount':0,
        'officialNextImageReferenceCount':0,
    }

    for path in sorted(repo.rglob('*.html')):
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        stats['htmlFileCount']+=1
        rel=path.relative_to(repo).as_posix()
        text=path.read_text(encoding='utf-8')
        if 'icons/languages/EN_GB.svg' in text:
            failures.append({'code':'BROKEN_LANGUAGE_ICON_REFERENCE','file':rel})
        if re.search(r'<link\b(?=[^>]*\brel\s*=\s*["\']preload["\'])(?=[^>]*\bas\s*=\s*["\']font["\'])[^>]*\bhref\s*=\s*["\'](?:https://damienkuo123\.github\.io)?/_next/static/media/',text,re.I|re.S):
            failures.append({'code':'BROKEN_ROOT_FONT_PRELOAD','file':rel})

        for attr,_,raw in ATTR_RE.findall(text):
            value=html.unescape(raw)
            values=srcset_urls(value) if attr.lower() in {'srcset','imagesrcset'} else [value]
            if attr.lower() in {'srcset','imagesrcset'}:
                stats['srcsetCandidateCount']+=len(values)
            for url in values:
                clean=url.strip()
                if clean.startswith('/assets/') or clean.startswith('https://damienkuo123.github.io/assets/'):
                    failures.append({'code':'MISSING_PROJECT_BASE_ASSET','file':rel,'attribute':attr,'url':clean[:500]})
                if clean.startswith('/_next/image?') or clean.startswith('https://damienkuo123.github.io/_next/image?'):
                    failures.append({'code':'BROKEN_LOCAL_NEXT_IMAGE_ENDPOINT','file':rel,'attribute':attr,'url':clean[:500]})
                if clean.startswith('/_next/static/media/') or clean.startswith('https://damienkuo123.github.io/_next/static/media/'):
                    failures.append({'code':'BROKEN_LOCAL_NEXT_STATIC_MEDIA','file':rel,'attribute':attr,'url':clean[:500]})
                if clean.startswith('https://www.auping.com/_next/image?'):
                    stats['officialNextImageReferenceCount']+=1
                if clean.startswith('/auping-staging/'):
                    stats['localAssetReferenceCount']+=1
                    path_part=clean.split('?',1)[0].split('#',1)[0][len('/auping-staging/'):]
                    name=Path(path_part).name
                    if path_part and '.' in name and not (repo/path_part).is_file():
                        failures.append({'code':'MISSING_LOCAL_FILE','file':rel,'attribute':attr,'url':clean[:500]})

    routes=repo/'data/rc6-routes.json'
    if not routes.is_file():
        failures.append({'code':'ROUTE_MANIFEST_MISSING','file':'data/rc6-routes.json'})
    else:
        data=json.loads(routes.read_text(encoding='utf-8'))
        store=next((r for r in data.get('routes',[]) if r.get('id')=='service-store-locator' or r.get('localPath')=='/store-locator/'),None)
        if not store:
            failures.append({'code':'STORE_LOCATOR_ROUTE_MISSING'})
        elif store.get('mode')!='LOCAL_PARITY':
            failures.append({'code':'STORE_LOCATOR_REDIRECT_REGRESSION','mode':store.get('mode'),'officialUrl':store.get('officialUrl')})

    required=[
        'assets/rc76/taiwan-store-locator.css',
        'assets/rc76/taiwan-store-locator.js',
        'store-locator/index.html',
        'tools/apply_rc77a1_global_asset_hardening.py',
        'tools/validate_rc77a1_global_asset_hardening.py',
    ]
    for rel in required:
        if not (repo/rel).is_file():
            failures.append({'code':'REQUIRED_FILE_MISSING','file':rel})

    report={
        'schema':SCHEMA,
        'generatedAt':utc_now(),
        'passed':not failures,
        'stats':stats,
        'failureCount':len(failures),
        'failures':failures[:500],
        'storeLocatorPolicy':'LOCAL_PARITY_REQUIRED',
    }
    out=repo/args.report
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['passed'] else 1


if __name__=='__main__':
    raise SystemExit(main())
