#!/usr/bin/env python3
"""Materialize the RC7.5 semantic contract into Auping static HTML.

The script is intentionally build-time only. It reads an explicit route contract
file and writes stable data attributes into the generated HTML; no browser-time
DOM guessing is used.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from typing import Any

CONTRACT_VERSION = "rc7.5"
LOCAL_MODES = {"LOCAL_PARITY", "LOCAL_EXISTING", "LOCAL_BRIDGE"}
LANGUAGE_IDS = (
    "react-select-languageSwitchHeader-input",
    "react-select-languageSwitchFooter-input",
)
SR_CSS = (
    '<style data-auping-rc75="semantic">'
    '.auping-sr-only{position:absolute!important;width:1px!important;height:1px!important;'
    'padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;'
    'white-space:nowrap!important;border:0!important}'
    '.auping-language-fixed{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;'
    'border:1px solid currentColor;border-radius:999px;font:inherit;line-height:1;cursor:default}'
    '</style>'
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, required=True, help="Static site root")
    p.add_argument(
        "--contracts",
        type=Path,
        default=None,
        help="Explicit contract JSON (defaults to data/rc75-page-contracts.json)",
    )
    p.add_argument("--check", action="store_true", help="Do not write HTML")
    return p.parse_args()


def route_file(root: Path, local_path: str) -> Path:
    return root / ("index.html" if local_path == "/" else f"{local_path.strip('/')}/index.html")


def set_attr(tag: str, name: str, value: str | None) -> str:
    pattern = re.compile(
        rf"\s{re.escape(name)}(?:\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+))?",
        re.I | re.S,
    )
    tag = pattern.sub("", tag)
    base = tag[:-1].rstrip().rstrip("/").rstrip()
    if value is None:
        return base + f" {name}>"
    return base + f' {name}="{html.escape(value, quote=True)}">'


def patch_html_tag(text: str, contract: dict[str, Any]) -> str:
    def repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        tag = set_attr(tag, "lang", "zh-Hant-TW")
        tag = set_attr(tag, "data-auping-page-id", contract["pageId"])
        tag = set_attr(tag, "data-auping-page-type", contract["pageType"])
        tag = set_attr(tag, "data-auping-contract-version", CONTRACT_VERSION)
        return tag

    return re.sub(r"<html\b[^>]*>", repl, text, count=1, flags=re.I | re.S)


def patch_exact_input(text: str, input_id: str, attrs: dict[str, str | None]) -> tuple[str, int]:
    pattern = re.compile(rf"<input\b(?=[^>]*\bid=(['\"]){re.escape(input_id)}\1)[^>]*>", re.I | re.S)

    def repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        for key, value in attrs.items():
            tag = set_attr(tag, key, value)
        return tag

    return pattern.subn(repl, text)


def replace_language_value(text: str, input_id: str) -> str:
    # Scope the text replacement to the exact React Select container that owns the
    # known language input. This runs at build time, never in the browser.
    pos = text.find(f'id="{input_id}"')
    if pos < 0:
        pos = text.find(f"id='{input_id}'")
    if pos < 0:
        return text
    start = max(0, text.rfind('<div class="css-b62m3t-container"', 0, pos))
    if start == 0:
        start = max(0, text.rfind("<div", 0, pos))
    end = text.find("</div></div></div>", pos)
    if end < 0:
        end = min(len(text), pos + 2500)
    else:
        end += len("</div></div></div>")
    segment = text[start:end]
    segment = re.sub(
        r'(<div\b[^>]*class=(?:"[^"]*singleValue[^"]*"|\'[^\']*singleValue[^\']*\')[^>]*>)(?:英文|English)(</div>)',
        r"\1繁體中文\2",
        segment,
        count=1,
        flags=re.I | re.S,
    )
    return text[:start] + segment + text[end:]


def patch_language(text: str) -> tuple[str, int, bool]:
    count = 0
    for input_id in LANGUAGE_IDS:
        text, n = patch_exact_input(
            text,
            input_id,
            {
                "data-auping-language-control": input_id.removeprefix("react-select-").removesuffix("-input"),
                "data-auping-language-value": "zh-TW",
                "aria-disabled": "true",
                "aria-readonly": "true",
                "tabindex": "-1",
                "disabled": None,
            },
        )
        if n:
            text = replace_language_value(text, input_id)
            count += n

    fallback = False
    has_fixed = bool(re.search(r"data-auping-language-control=([\"\'])fixed\1", text, re.I))
    if count == 0 and not has_fixed:
        control = (
            '<div class="auping-language-fixed" data-auping-language-control="fixed" '
            'data-auping-language-value="zh-TW" aria-disabled="true">繁體中文</div>'
        )
        text, n = re.subn(r"<body\b[^>]*>", lambda m: m.group(0) + control, text, count=1, flags=re.I | re.S)
        fallback = bool(n)
    return text, count, fallback


def normalize_key(raw: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", raw.strip().lower()).strip("-") or "select"


def patch_comboboxes(text: str, enabled_keys: set[str]) -> tuple[str, list[str], list[str]]:
    keys: list[str] = []
    native_keys: list[str] = []
    pattern = re.compile(
        r"<input\b(?=[^>]*\bid=(['\"])react-select-([A-Za-z0-9_-]+)-input\1)[^>]*>",
        re.I | re.S,
    )

    def repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        raw = m.group(2)
        if raw.lower().startswith("languageswitch"):
            return tag
        key = normalize_key(raw)
        keys.append(key)
        tag = set_attr(tag, "data-auping-combobox", key)
        tag = set_attr(tag, "data-auping-selected-value", "")
        if key not in enabled_keys:
            return tag
        tag = set_attr(tag, "aria-hidden", "true")
        tag = set_attr(tag, "tabindex", "-1")
        context = text[max(0, m.start() - 500):m.start()]
        marker_double = f'data-auping-combobox-native="{key}"'
        marker_single = f"data-auping-combobox-native='{key}'"
        if marker_double in context or marker_single in context:
            return tag
        native_keys.append(key)
        native = (
            f'<select data-auping-combobox-native="{html.escape(key, quote=True)}" '
            f'data-auping-selected-value="" aria-label="{html.escape(key, quote=True)}"></select>'
        )
        return native + tag

    patched = pattern.sub(repl, text)
    return patched, sorted(set(keys)), sorted(set(native_keys))


def ensure_combobox_assets(text: str, base_path: str) -> str:
    if 'data-auping-rc75-combobox="style"' not in text:
        link = (
            f'<link data-auping-rc75-combobox="style" rel="stylesheet" '
            f'href="{base_path}/assets/rc75-combobox.css?v=20260805-1">'
        )
        text = re.sub(r"</head>", link + "</head>", text, count=1, flags=re.I)
    if 'data-auping-rc75-combobox="runtime"' not in text:
        script = (
            f'<script data-auping-rc75-combobox="runtime" '
            f'data-config="{base_path}/data/rc75-combobox-variants.json" defer '
            f'src="{base_path}/assets/rc75-combobox.js?v=20260805-1"></script>'
        )
        text = re.sub(r"</head>", script + "</head>", text, count=1, flags=re.I)
    return text


def patch_product_cards(text: str, products: dict[str, str], base_path: str) -> tuple[str, int]:
    """Tag only build-time card nodes that already declare an exact route."""
    changed = 0
    pattern = re.compile(r'<(?P<tag>[a-z0-9]+)\b(?=[^>]*\bdata-rc5-route=(["\'])(?P<href>[^"\']+)\2)[^>]*>', re.I | re.S)

    def repl(m: re.Match[str]) -> str:
        nonlocal changed
        tag = m.group(0)
        href = m.group("href")
        local_path = href
        if local_path.startswith(base_path):
            local_path = local_path[len(base_path):] or "/"
        if not local_path.startswith("/"):
            local_path = "/" + local_path
        if not local_path.endswith("/"):
            local_path += "/"
        slug = products.get(local_path)
        if not slug:
            return tag
        tag = set_attr(tag, "data-auping-product-card", "true")
        tag = set_attr(tag, "data-auping-product-slug", slug)
        changed += 1
        return tag

    return pattern.sub(repl, text), changed


def patch_title(text: str, title: str) -> tuple[str, bool]:
    pattern = re.compile(r"<title\b[^>]*>.*?</title>", re.I | re.S)
    m = pattern.search(text)
    value = f"<title>{html.escape(title)}｜Auping</title>"
    if not m:
        text, n = re.subn(r"</head>", value + "</head>", text, count=1, flags=re.I)
        return text, bool(n)
    if "前往官方 Auping 頁面" not in m.group(0):
        return text, False
    return text[: m.start()] + value + text[m.end() :], True


def ensure_heading(text: str, title: str) -> tuple[str, bool]:
    if re.search(r"<h1\b", text, re.I):
        return text, False
    heading = f'<h1 class="auping-sr-only" data-auping-generated-heading="true">{html.escape(title)}</h1>'
    text, n = re.subn(r"<body\b[^>]*>", lambda m: m.group(0) + heading, text, count=1, flags=re.I | re.S)
    return text, bool(n)


def ensure_css(text: str) -> str:
    if 'data-auping-rc75="semantic"' in text:
        return text
    return re.sub(r"</head>", SR_CSS + "</head>", text, count=1, flags=re.I)


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    contracts_path = (args.contracts or root / "data/rc75-page-contracts.json").resolve()
    payload = json.loads(contracts_path.read_text(encoding="utf-8"))
    contracts = payload["routes"]
    if len(contracts) != 121:
        raise SystemExit(f"Expected 121 local contracts, got {len(contracts)}")
    variants_path = root / "data/rc75-combobox-variants.json"
    variant_pages: dict[str, Any] = {}
    if variants_path.is_file():
        variant_pages = json.loads(variants_path.read_text(encoding="utf-8")).get("pages", {})
    products = {
        item["localPath"]: item["slug"]
        for item in contracts
        if item["pageType"] == "product"
    }
    report: dict[str, Any] = {
        "schema": "AUPING-RC7.5-SEMANTIC-APPLY-REPORT-V1",
        "contractVersion": CONTRACT_VERSION,
        "checkOnly": args.check,
        "routes": [],
    }
    for contract in contracts:
        file_path = route_file(root, contract["localPath"])
        if not file_path.is_file():
            raise SystemExit(f"Missing route file: {file_path}")
        original = file_path.read_text(encoding="utf-8", errors="replace")
        text = patch_html_tag(original, contract)
        text, language_inputs, language_fallback = patch_language(text)
        page_variant = variant_pages.get(contract["pageId"], {})
        enabled_keys = {item["key"] for item in page_variant.get("controls", [])}
        text, combo_keys, native_combo_keys = patch_comboboxes(text, enabled_keys)
        if native_combo_keys:
            text = ensure_combobox_assets(text, payload["basePath"])
        text, product_links = patch_product_cards(text, products, payload["basePath"])
        text, title_fixed = patch_title(text, contract["title"])
        text, h1_added = ensure_heading(text, contract["title"])
        text = ensure_css(text)
        changed = text != original
        if changed and not args.check:
            tmp = file_path.with_suffix(file_path.suffix + ".tmp")
            tmp.write_text(text, encoding="utf-8")
            tmp.replace(file_path)
        report["routes"].append(
            {
                "pageId": contract["pageId"],
                "localPath": contract["localPath"],
                "changed": changed,
                "languageInputs": language_inputs,
                "languageFallback": language_fallback,
                "comboboxes": combo_keys,
                "nativeComboboxes": native_combo_keys,
                "productCards": product_links,
                "titleFixed": title_fixed,
                "h1Added": h1_added,
            }
        )
    summary = {
        "routeCount": len(report["routes"]),
        "changedRoutes": sum(bool(x["changed"]) for x in report["routes"]),
        "existingLanguageInputs": sum(x["languageInputs"] for x in report["routes"]),
        "fallbackLanguageControls": sum(bool(x["languageFallback"]) for x in report["routes"]),
        "comboboxRoutes": sum(bool(x["comboboxes"]) for x in report["routes"]),
        "nativeComboboxRoutes": sum(bool(x["nativeComboboxes"]) for x in report["routes"]),
        "productCardsTagged": sum(x["productCards"] for x in report["routes"]),
        "titlesFixed": sum(bool(x["titleFixed"]) for x in report["routes"]),
        "headingsAdded": sum(bool(x["h1Added"]) for x in report["routes"]),
    }
    report["summary"] = summary
    out = root / "audit/rc7.5/semantic-contract-apply-report.json"
    if not args.check:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
