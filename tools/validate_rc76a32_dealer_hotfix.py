#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    repo = args.repo.resolve()
    failures = []

    routes = json.loads(
        (repo / "data/rc6-routes.json").read_text(encoding="utf-8")
    )
    matches = [
        item for item in routes.get("routes", [])
        if item.get("localPath") == "/store-locator/"
    ]
    if len(matches) != 1:
        failures.append({
            "code": "STORE_ROUTE_COUNT",
            "count": len(matches),
        })
    else:
        route = matches[0]
        if route.get("mode") not in {
            "LOCAL_PARITY",
            "LOCAL_EXISTING",
        }:
            failures.append({
                "code": "STORE_ROUTE_NOT_LOCAL",
                "mode": route.get("mode"),
            })
        if route.get("officialUrl"):
            failures.append({
                "code": "STORE_ROUTE_OFFICIAL_URL_REMAINS"
            })

    css = (
        repo / "assets/rc76/taiwan-store-locator.css"
    ).read_text(encoding="utf-8")
    for needle, code in {
        "isolation: isolate": "MAP_ISOLATION_MISSING",
        "z-index: 1200 !important": "HEADER_Z_MISSING",
        "calc(var(--header-height, 74px) + 36px)":
            "HEADER_OFFSET_MISSING",
        ".auping-embedded-dealer-layout":
            "EMBEDDED_LAYOUT_CSS_MISSING",
        "min-height: 480px": "EMBEDDED_HEIGHT_MISSING",
    }.items():
        if needle not in css:
            failures.append({"code": code})

    js_path = repo / "assets/rc76/taiwan-store-locator.js"
    js = js_path.read_text(encoding="utf-8")
    for needle, code in {
        "list.dataset.aupingDealerConnected":
            "LISTENER_GUARD_MISSING",
        "const visibleIds = new Set":
            "MARKER_FILTER_MISSING",
        'layout.className = "auping-embedded-dealer-layout"':
            "EMBEDDED_LAYOUT_JS_MISSING",
        "mapHost.replaceWith(layout)":
            "MAP_REPARENT_MISSING",
    }.items():
        if needle not in js:
            failures.append({"code": code})
    if "sidebar?.replaceChildren(list)" in js:
        failures.append({"code": "OLD_SIDEBAR_BUG_REMAINS"})

    try:
        subprocess.run(
            ["node", "--check", str(js_path)],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        pass
    except subprocess.CalledProcessError as exc:
        failures.append({
            "code": "JS_SYNTAX",
            "stderr": exc.stderr,
        })

    locator = (
        repo / "store-locator/index.html"
    ).read_text(encoding="utf-8")
    if "Noble is an elegant design bed" in locator:
        failures.append({"code": "STALE_NOBLE_METADATA"})
    if (
        'property="og:url" '
        'content="/auping-staging/store-locator/"'
        not in locator
    ):
        failures.append({"code": "STORE_OG_URL"})
    if re.search(
        r'<link\b(?=[^>]*\bas=["\']image["\'])'
        r'(?=[^>]*\brel=["\']preload["\'])',
        locator,
        re.I,
    ):
        failures.append({"code": "STALE_IMAGE_PRELOADS"})

    old_refs = []
    new_refs = 0
    for page in repo.rglob("*.html"):
        text = page.read_text(encoding="utf-8")
        if "taiwan-store-locator." not in text:
            continue
        if "v=20260806-1" in text:
            old_refs.append(page.relative_to(repo).as_posix())
        if "v=20260806-2" in text:
            new_refs += 1

    if old_refs:
        failures.append({
            "code": "OLD_CACHE_BUSTERS",
            "files": old_refs[:20],
        })
    if new_refs == 0:
        failures.append({"code": "NO_NEW_CACHE_BUSTERS"})

    result = {
        "schema": "AUPING-RC7.6A3.2-VALIDATION-V1",
        "passed": not failures,
        "newVersionHtmlCount": new_refs,
        "failures": failures,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1

if __name__ == "__main__":
    raise SystemExit(main())
