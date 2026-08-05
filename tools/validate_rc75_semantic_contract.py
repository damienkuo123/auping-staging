#!/usr/bin/env python3
"""Validate the materialized RC7.5 semantic contract."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, required=True)
    p.add_argument("--contracts", type=Path, default=None)
    p.add_argument("--report", type=Path, default=None)
    return p.parse_args()


def route_file(root: Path, local_path: str) -> Path:
    return root / ("index.html" if local_path == "/" else f"{local_path.strip('/')}/index.html")


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    contracts_path = (args.contracts or root / "data/rc75-page-contracts.json").resolve()
    contracts_payload = json.loads(contracts_path.read_text(encoding="utf-8"))
    contracts = contracts_payload["routes"]
    variants_path = root / "data/rc75-combobox-variants.json"
    variant_pages: dict[str, Any] = {}
    if variants_path.is_file():
        variant_pages = json.loads(variants_path.read_text(encoding="utf-8")).get("pages", {})
    rows: list[dict[str, Any]] = []
    for contract in contracts:
        p = route_file(root, contract["localPath"])
        failures: list[str] = []
        if not p.is_file():
            rows.append({"localPath": contract["localPath"], "failures": ["missing-file"]})
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        html_tag = re.search(r"<html\b[^>]*>", text, re.I | re.S)
        tag = html_tag.group(0) if html_tag else ""
        expected = {
            "data-auping-page-id": contract["pageId"],
            "data-auping-page-type": contract["pageType"],
            "data-auping-contract-version": "rc7.5",
            "lang": "zh-Hant-TW",
        }
        for key, value in expected.items():
            if not re.search(rf"\b{re.escape(key)}=(['\"]){re.escape(value)}\1", tag, re.I):
                failures.append(f"missing-or-wrong:{key}")
        h1_count = len(re.findall(r"<h1\b", text, re.I))
        if h1_count < 1:
            failures.append("missing-h1")
        title = re.search(r"<title\b[^>]*>(.*?)</title>", text, re.I | re.S)
        if not title:
            failures.append("missing-title")
        elif "前往官方 Auping 頁面" in title.group(1):
            failures.append("stale-title")
        controls = re.findall(r"<[^>]+data-auping-language-control=(['\"])[^>]+>", text, re.I | re.S)
        if not controls:
            failures.append("missing-language-control")
        if 'data-auping-language-value="zh-TW"' not in text and "data-auping-language-value='zh-TW'" not in text:
            failures.append("missing-language-value")
        for input_id in ("react-select-languageSwitchHeader-input", "react-select-languageSwitchFooter-input"):
            input_match = re.search(rf"<input\b(?=[^>]*id=(['\"]){input_id}\1)[^>]*>", text, re.I | re.S)
            if not input_match:
                continue
            input_tag = input_match.group(0)
            for required in ("data-auping-language-control", "data-auping-language-value", "aria-disabled", "disabled"):
                if not re.search(rf"(?:\s|<){required}(?:=|\s|>)", input_tag, re.I):
                    failures.append(f"language-input-missing:{input_id}:{required}")
            context = text[max(0, input_match.start() - 1000):input_match.start()]
            values = re.findall(r"<div\b[^>]*singleValue[^>]*>(.*?)</div>", context, re.I | re.S)
            if values and "繁體中文" not in re.sub(r"<[^>]+>", "", values[-1]):
                failures.append(f"language-visible-value:{input_id}")
        if 'data-auping-language-control="fixed"' in text:
            fixed = re.search(r'<[^>]*data-auping-language-control="fixed"[^>]*>(.*?)</[^>]+>', text, re.I | re.S)
            if not fixed or "繁體中文" not in re.sub(r"<[^>]+>", "", fixed.group(1)):
                failures.append("fixed-language-visible-value")
        page_variant = variant_pages.get(contract["pageId"], {})
        for control in page_variant.get("controls", []):
            key = re.escape(control["key"])
            if not re.search(rf'<select\b[^>]*data-auping-combobox-native=(["\']){key}\1', text, re.I | re.S):
                failures.append(f"missing-native-combobox:{control['key']}")
        if page_variant:
            if 'data-auping-rc75-combobox="runtime"' not in text:
                failures.append("missing-combobox-runtime")
            if 'data-auping-rc75-combobox="style"' not in text:
                failures.append("missing-combobox-style")
        rows.append(
            {
                "pageId": contract["pageId"],
                "localPath": contract["localPath"],
                "h1Count": h1_count,
                "failureCount": len(failures),
                "failures": failures,
            }
        )
    summary = {
        "routeCount": len(rows),
        "passedRoutes": sum(not row["failures"] for row in rows),
        "failedRoutes": sum(bool(row["failures"]) for row in rows),
        "totalFailures": sum(len(row["failures"]) for row in rows),
    }
    report = {
        "schema": "AUPING-RC7.5-SEMANTIC-VALIDATION-V1",
        "summary": summary,
        "routes": rows,
    }
    out = args.report or root / "audit/rc7.5/semantic-contract-validation.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if summary["failedRoutes"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
