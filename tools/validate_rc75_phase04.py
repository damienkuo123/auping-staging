#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import os
import posixpath
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_PATH = "/auping-staging"
LOCAL_MODES = {"LOCAL_PARITY", "LOCAL_EXISTING", "LOCAL_BRIDGE"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.html_attrs: dict[str, str | None] = {}
        self.title_parts: list[str] = []
        self.h1_parts: list[list[str]] = []
        self._capture_title = False
        self._h1_depth = 0
        self.canonical: str | None = None
        self.meta_refresh = False
        self.anchors: list[dict[str, str | None]] = []
        self.inputs: list[dict[str, str | None]] = []
        self.all_attrs: list[tuple[str, dict[str, str | None]]] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        self.all_attrs.append((tag, attrs))
        if tag == "html":
            self.html_attrs = attrs
        elif tag == "title":
            self._capture_title = True
        elif tag == "h1":
            self.h1_parts.append([])
            self._h1_depth += 1
        elif tag == "link" and "canonical" in (attrs.get("rel") or "").split():
            self.canonical = attrs.get("href")
        elif tag == "meta" and (attrs.get("http-equiv") or "").lower() == "refresh":
            self.meta_refresh = True
        elif tag == "a":
            self.anchors.append(attrs)
        elif tag == "input":
            self.inputs.append(attrs)

    def handle_startendtag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs_list)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
        elif tag == "h1" and self._h1_depth:
            self._h1_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self.title_parts.append(data)
        if self._h1_depth and self.h1_parts:
            self.h1_parts[-1].append(data)

    @property
    def title(self) -> str:
        return re.sub(r"\s+", " ", "".join(self.title_parts)).strip()

    @property
    def h1s(self) -> list[str]:
        return [re.sub(r"\s+", " ", "".join(parts)).strip() for parts in self.h1_parts]


def route_file(repo: Path, local_path: str) -> Path:
    rel = local_path.strip("/")
    return repo / ("index.html" if not rel else f"{rel}/index.html")


def normalize_text(value: str) -> str:
    return re.sub(r"[\s｜|–—\-]+", "", value).lower()


def normalize_internal(href: str, current_path: str) -> str | None:
    href = html.unescape(href.strip())
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "blob:")):
        return None
    parsed = urlparse(href)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != "damienkuo123.github.io" or not parsed.path.startswith(BASE_PATH):
            return None
        path = parsed.path[len(BASE_PATH):] or "/"
    elif href.startswith(BASE_PATH):
        path = parsed.path[len(BASE_PATH):] or "/"
    elif href.startswith("/"):
        path = parsed.path
    else:
        path = posixpath.normpath(posixpath.join(current_path, parsed.path))
        if not path.startswith("/"):
            path = "/" + path
    path = unquote(path)
    if path.endswith("/index.html"):
        path = path[:-10]
    leaf = path.rsplit("/", 1)[-1]
    if not path.endswith("/") and "." not in leaf:
        path += "/"
    return re.sub(r"/{2,}", "/", path)


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    return parser


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate Auping RC7.5 Phase 04")
    ap.add_argument("repo", type=Path)
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    repo = args.repo.resolve()

    routes_payload = json.loads((repo / "data/rc6-routes.json").read_text(encoding="utf-8"))
    routes = routes_payload.get("routes", [])
    local_routes = [r for r in routes if r.get("mode") in LOCAL_MODES]
    route_paths = {r["localPath"] for r in routes}

    html_paths: set[str] = set()
    for path in repo.rglob("index.html"):
        rel = path.relative_to(repo)
        html_paths.add("/" if str(rel) == "index.html" else "/" + rel.parent.as_posix() + "/")

    failures: list[dict[str, object]] = []
    page_reports: list[dict[str, object]] = []
    parsers: dict[str, PageParser] = {}
    fallback_count = 0
    unknown_links: list[dict[str, str]] = []

    for route in local_routes:
        local_path = route["localPath"]
        path = route_file(repo, local_path)
        if not path.exists():
            failures.append({"path": local_path, "code": "MISSING_ROUTE_FILE"})
            continue
        parser = parse_page(path)
        parsers[local_path] = parser
        expected_canonical = BASE_PATH + local_path
        h1s = parser.h1s

        if parser.html_attrs.get("data-auping-page-id") != route["id"]:
            failures.append({"path": local_path, "code": "PAGE_ID_MISMATCH", "actual": parser.html_attrs.get("data-auping-page-id"), "expected": route["id"]})
        if parser.html_attrs.get("lang") not in {"zh-Hant-TW", "zh-TW"}:
            failures.append({"path": local_path, "code": "LANGUAGE_MISMATCH", "actual": parser.html_attrs.get("lang")})
        if not parser.title or "前往官方 Auping 頁面" in parser.title:
            failures.append({"path": local_path, "code": "INVALID_TITLE", "actual": parser.title})
        if len(h1s) != 1 or not h1s[0]:
            failures.append({"path": local_path, "code": "INVALID_H1", "actual": h1s})
        if parser.canonical != expected_canonical:
            failures.append({"path": local_path, "code": "CANONICAL_MISMATCH", "actual": parser.canonical, "expected": expected_canonical})
        if parser.meta_refresh:
            failures.append({"path": local_path, "code": "META_REFRESH_PRESENT"})

        language_inputs = [x for x in parser.inputs if "languageSwitch" in (x.get("id") or "")]
        fixed_language = any(attrs.get("data-auping-language-control") == "fixed" for _, attrs in parser.all_attrs)
        for input_attrs in language_inputs:
            if input_attrs.get("data-auping-language-value") != "zh-TW":
                failures.append({"path": local_path, "code": "LANGUAGE_INPUT_VALUE", "id": input_attrs.get("id")})
            if "disabled" not in input_attrs or input_attrs.get("aria-disabled") != "true" or input_attrs.get("aria-readonly") != "true":
                failures.append({"path": local_path, "code": "LANGUAGE_INPUT_INTERACTIVE", "id": input_attrs.get("id")})
        if not language_inputs and not fixed_language:
            failures.append({"path": local_path, "code": "LANGUAGE_CONTROL_MISSING"})

        for anchor in parser.anchors:
            href = anchor.get("href")
            if not href:
                continue
            if anchor.get("data-auping-link-fallback"):
                fallback_count += 1
                if not anchor.get("data-auping-original-href"):
                    failures.append({"path": local_path, "code": "FALLBACK_ORIGINAL_MISSING", "href": href})
            target = normalize_internal(href, local_path)
            if target is None or target.startswith(("/assets/", "/data/", "/docs/", "/tests/", "/tools/", "/.github/")):
                continue
            target_file = repo / target.lstrip("/")
            if target not in route_paths and target not in html_paths and not target_file.exists():
                item = {"path": local_path, "href": href, "target": target}
                unknown_links.append(item)
                failures.append({**item, "code": "UNKNOWN_INTERNAL_LINK"})

        page_reports.append({
            "pageId": route["id"],
            "path": local_path,
            "title": parser.title,
            "h1": h1s[0] if len(h1s) == 1 else h1s,
            "canonical": parser.canonical,
            "fallbackLinks": sum(1 for a in parser.anchors if a.get("data-auping-link-fallback")),
        })

    products_payload = json.loads((repo / "data/rc6-products.json").read_text(encoding="utf-8"))
    products = products_payload.get("products", [])
    for product in products:
        local_path = product["localPath"]
        parser = parsers.get(local_path)
        if parser is None:
            failures.append({"path": local_path, "code": "PRODUCT_PAGE_MISSING", "title": product.get("title")})
            continue
        expected = normalize_text(product.get("title", ""))
        actual_h1 = normalize_text(parser.h1s[0] if parser.h1s else "")
        actual_title = normalize_text(parser.title)
        if expected not in actual_h1 and actual_h1 not in expected:
            failures.append({"path": local_path, "code": "PRODUCT_H1_IDENTITY", "actual": parser.h1s, "expected": product.get("title")})
        if expected not in actual_title:
            failures.append({"path": local_path, "code": "PRODUCT_TITLE_IDENTITY", "actual": parser.title, "expected": product.get("title")})

    combo_payload = json.loads((repo / "data/rc75-combobox-variants.json").read_text(encoding="utf-8"))
    combo_controls = 0
    for page_id, config in combo_payload.get("pages", {}).items():
        local_path = config["localPath"]
        parser = parsers.get(local_path)
        if parser is None:
            failures.append({"path": local_path, "code": "COMBOBOX_PAGE_MISSING"})
            continue
        attrs_rows = [attrs for _, attrs in parser.all_attrs]
        if not any(attrs.get("data-auping-rc75-combobox") == "runtime" for attrs in attrs_rows):
            failures.append({"path": local_path, "code": "COMBOBOX_RUNTIME_MISSING"})
        for control in config.get("controls", []):
            combo_controls += 1
            key = control["key"]
            if not any(attrs.get("data-auping-combobox-native") == key for attrs in attrs_rows):
                failures.append({"path": local_path, "code": "COMBOBOX_SELECT_MISSING", "key": key})
            if control.get("mode") == "react-overlay" and not any(attrs.get("data-auping-combobox") == key for attrs in attrs_rows):
                failures.append({"path": local_path, "code": "COMBOBOX_INPUT_MISSING", "key": key})

    catalog_payload = json.loads((repo / "data/rc75-catalog-parity.json").read_text(encoding="utf-8"))
    catalog_products = 0
    for page_id, config in catalog_payload.get("pages", {}).items():
        local_path = config["localPath"]
        parser = parsers.get(local_path)
        if parser is None:
            failures.append({"path": local_path, "code": "CATALOG_PAGE_MISSING"})
            continue
        attrs_rows = [attrs for _, attrs in parser.all_attrs]
        if not any(attrs.get("data-auping-rc75-catalog") == "runtime" for attrs in attrs_rows):
            failures.append({"path": local_path, "code": "CATALOG_RUNTIME_MISSING"})
        input_ids = {x.get("id") for x in parser.inputs}
        for group in config.get("groups", []):
            for option in group.get("options", []):
                if option.get("inputId") not in input_ids:
                    failures.append({"path": local_path, "code": "CATALOG_INPUT_MISSING", "inputId": option.get("inputId")})
        catalog_products += len(config.get("products", []))

    report = {
        "schema": "AUPING-RC7.5-PHASE04-VALIDATION-V1",
        "passed": not failures,
        "localRoutes": len(local_routes),
        "products": len(products),
        "comboboxPages": len(combo_payload.get("pages", {})),
        "comboboxControls": combo_controls,
        "catalogPages": len(catalog_payload.get("pages", {})),
        "catalogProducts": catalog_products,
        "fallbackLinks": fallback_count,
        "unknownInternalLinks": len(unknown_links),
        "failures": failures,
        "pages": page_reports,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in [
        "passed", "localRoutes", "products", "comboboxPages", "comboboxControls",
        "catalogPages", "catalogProducts", "fallbackLinks", "unknownInternalLinks"
    ]}, ensure_ascii=False, indent=2))
    if failures:
        print(json.dumps(failures[:20], ensure_ascii=False, indent=2))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
