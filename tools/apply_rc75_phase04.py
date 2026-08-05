#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

BASE_PATH = "/auping-staging"


def route_file(repo: Path, local_path: str) -> Path:
    rel = local_path.strip("/")
    return repo / ("index.html" if not rel else f"{rel}/index.html")


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply Auping RC7.5 Phase 04 route hardening")
    parser.add_argument("repo", type=Path)
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo.resolve()
    routes_path = repo / "data/rc6-routes.json"
    if not routes_path.exists():
        raise SystemExit(f"Missing route manifest: {routes_path}")

    routes_payload = json.loads(routes_path.read_text(encoding="utf-8"))
    local_routes = [r for r in routes_payload.get("routes", []) if str(r.get("mode", "")).startswith("LOCAL_")]
    mapping = json.loads(args.mapping.read_text(encoding="utf-8"))

    replacements: dict[str, tuple[str, str]] = {}
    for rule in mapping.get("rules", []):
        replacements[BASE_PATH + rule["sourcePath"]] = (
            BASE_PATH + rule["fallbackPath"],
            "nearest-local-route",
        )
    for rule in mapping.get("externalRules", []):
        replacements[rule["sourceHref"]] = (
            BASE_PATH + rule["fallbackPath"],
            "captured-external-local-route",
        )

    href_pattern = re.compile(
        r'((?<![\w-])href\s*=\s*)(["\'])(' + "|".join(re.escape(x) for x in sorted(replacements, key=len, reverse=True)) + r')\2',
        re.I,
    )

    changed_files: list[str] = []
    replacement_total = 0
    replacement_by_source: dict[str, int] = {}

    for route in local_routes:
        path = route_file(repo, route["localPath"])
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8")
        original = html

        def repl(match: re.Match[str]) -> str:
            nonlocal replacement_total
            prefix, quote, source = match.group(1), match.group(2), match.group(3)
            target, marker = replacements[source]
            replacement_total += 1
            replacement_by_source[source] = replacement_by_source.get(source, 0) + 1
            return (
                f'{prefix}{quote}{target}{quote} '
                f'data-auping-original-href={quote}{source}{quote} '
                f'data-auping-link-fallback={quote}{marker}{quote}'
            )

        html = href_pattern.sub(repl, html)

        if route["localPath"] == "/box-springs/":
            html = html.replace(
                '<h1 class="ProductListBanner_Title__YjVmX" style="color:#fff"></h1>',
                '<div class="ProductListBanner_Title__YjVmX" style="color:#fff" aria-hidden="true"></div>',
            )

        captured_empty_h1 = {
            "/about-auping/sustainability/": "永續理念",
            "/customer-service/ordering/": "訂購方式",
            "/news/auping-opens-mattress-factory-future/": "Auping 啟用未來床墊工廠",
        }
        heading = captured_empty_h1.get(route["localPath"])
        if heading:
            html = html.replace(
                '<h1 class="HeaderImage_title__OXoMP" style="color:#fff"></h1>',
                f'<h1 class="HeaderImage_title__OXoMP" style="color:#fff">{heading}</h1>',
                1,
            )

        if route["localPath"] == "/news/awards/" and 'rel="canonical"' not in html:
            canonical = '<link rel="canonical" href="/auping-staging/news/awards/">'
            marker = '<meta name="robots" content="noindex,nofollow">'
            if marker in html:
                html = html.replace(marker, marker + canonical, 1)
            else:
                html = html.replace("</head>", canonical + "</head>", 1)

        if html != original:
            path.write_text(html, encoding="utf-8")
            changed_files.append(str(path.relative_to(repo)))

    args.report.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "schema": "AUPING-RC7.5-PHASE04-APPLY-REPORT-V1",
        "localRouteCount": len(local_routes),
        "changedFileCount": len(changed_files),
        "changedFiles": changed_files,
        "linkReplacementCount": replacement_total,
        "replacementBySource": replacement_by_source,
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "localRouteCount": len(local_routes),
        "changedFileCount": len(changed_files),
        "linkReplacementCount": replacement_total,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
