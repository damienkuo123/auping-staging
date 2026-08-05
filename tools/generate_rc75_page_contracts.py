#!/usr/bin/env python3
"""Generate the reviewed RC7.5 route contract inventory from one locked build."""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

LOCAL_MODES = {"LOCAL_PARITY", "LOCAL_EXISTING", "LOCAL_BRIDGE"}
EDITORIAL_PREFIXES = (
    "/about-auping/",
    "/better-sleep/",
    "/contact/",
    "/frequently-asked-questions/",
    "/news/",
    "/privacy-policy/",
    "/terms-and-conditions/",
    "/warranty/",
    "/working-at-auping/",
    "/customer-service/",
    "/stories/",
)
LISTING_EXACT = {
    "/beds/", "/box-springs/", "/mattresses/", "/bed-bases/", "/bed-linen/",
    "/duvet-covers/", "/duvets/", "/pillows/", "/toppers/", "/stores/",
    "/bed-linen/duvets/", "/bed-linen/fitted-sheets/",
    "/bed-linen/mattress-protectors/", "/bed-linen/bedspreads/",
    "/bed-linen/pillowcases/",
    "/beds/essential/", "/beds/original/", "/beds/auronde/",
    "/beds/noa/", "/beds/noble/",
    "/box-springs/original-boxspring/", "/box-springs/criade/",
    "/box-springs/kiruna/",
}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, required=True)
    p.add_argument("--audit", type=Path, default=None)
    p.add_argument("--output", type=Path, required=True)
    return p.parse_args()


def route_file(root: Path, local_path: str) -> Path:
    return root / ("index.html" if local_path == "/" else f"{local_path.strip('/')}/index.html")


def slug(local_path: str) -> str:
    if local_path == "/":
        return "home"
    return local_path.strip("/").split("/")[-1]


def classify(route: dict, local_paths: set[str]) -> str:
    path = route["localPath"]
    if path == "/":
        return "home"
    if route["mode"] == "LOCAL_BRIDGE":
        return "bridge"
    if any(path.startswith(prefix) for prefix in EDITORIAL_PREFIXES):
        return "editorial"
    if path in LISTING_EXACT or any(other != path and other.startswith(path) for other in local_paths):
        return "listing"
    return "product"


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    route_payload = json.loads((root / "data/rc6-routes.json").read_text(encoding="utf-8"))
    routes = [r for r in route_payload["routes"] if r["mode"] in LOCAL_MODES]
    if len(routes) != 121:
        raise SystemExit(f"Expected 121 routes, got {len(routes)}")
    local_paths = {r["localPath"] for r in routes}

    issues_by_path: dict[str, list[dict]] = defaultdict(list)
    if args.audit and args.audit.is_file():
        audit = json.loads(args.audit.read_text(encoding="utf-8"))
        for issue in audit.get("issues", []):
            path = issue.get("path") or urlparse(issue.get("url", "")).path
            if path:
                if not path.endswith("/"):
                    path += "/"
                issues_by_path[path].append(issue)

    output_routes = []
    for route in routes:
        path = route["localPath"]
        file_path = route_file(root, path)
        if not file_path.is_file():
            raise SystemExit(f"Missing route HTML: {file_path}")
        text = file_path.read_text(encoding="utf-8", errors="replace")
        combo_keys = sorted({
            re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")
            for raw in re.findall(r'id=["\']react-select-([A-Za-z0-9_-]+)-input["\']', text, re.I)
            if not raw.lower().startswith("languageswitch")
        })
        issue_codes = sorted({item.get("code", "UNKNOWN") for item in issues_by_path.get(path, [])})
        page_type = classify(route, local_paths)
        output_routes.append({
            "pageId": route["id"],
            "title": route["title"],
            "localPath": path,
            "file": "index.html" if path == "/" else f"{path.strip('/')}/index.html",
            "mode": route["mode"],
            "pageType": page_type,
            "slug": slug(path),
            "selectors": {
                "page": f'html[data-auping-page-id="{route["id"]}"]',
                "language": [
                    "#react-select-languageSwitchHeader-input",
                    "#react-select-languageSwitchFooter-input",
                    '[data-auping-language-control="fixed"]',
                ],
                "combobox": [f'[data-auping-combobox="{key}"]' for key in combo_keys],
                "productCard": f'[data-auping-product-slug="{slug(path)}"]' if page_type == "product" else None,
            },
            "baseline": {
                "bytes": len(text.encode("utf-8")),
                "h1Count": len(re.findall(r"<h1\b", text, re.I)),
                "languageInputCount": len(re.findall(r'id=["\']react-select-languageSwitch(?:Header|Footer)-input["\']', text, re.I)),
                "comboboxKeys": combo_keys,
                "staleRedirectTitle": "前往官方 Auping 頁面" in text,
            },
            "auditIssueCodes": issue_codes,
        })

    counts = Counter(item["pageType"] for item in output_routes)
    payload = {
        "schema": "AUPING-RC7.5-PAGE-CONTRACTS-V1",
        "contractVersion": "rc7.5",
        "sourceCommit": "231f44d0222395ced9d5424f00d4cf129e7c82da",
        "sourceRoutesSchema": route_payload.get("schema"),
        "basePath": route_payload.get("basePath", "/auping-staging"),
        "routeCount": len(output_routes),
        "pageTypeCounts": dict(sorted(counts.items())),
        "rules": {
            "localModes": sorted(LOCAL_MODES),
            "runtimeGuessing": False,
            "languageValue": "zh-TW",
            "languageInteractive": False,
        },
        "routes": output_routes,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"routeCount": len(output_routes), "pageTypeCounts": payload["pageTypeCounts"]}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
