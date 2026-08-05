#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from pathlib import Path
from typing import Any

BASE = "/auping-staging"
VERSION = "20260805-2"


def args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, required=True)
    p.add_argument("--payload", type=Path, required=True)
    p.add_argument("--check", action="store_true")
    p.add_argument("--report", type=Path, default=None)
    return p.parse_args()


def set_attr(tag: str, name: str, value: str | None) -> str:
    pattern = re.compile(rf"\s{re.escape(name)}(?:\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+))?", re.I | re.S)
    tag = pattern.sub("", tag)
    base = tag[:-1].rstrip().rstrip("/").rstrip()
    if value is None:
        return base + f" {name}>"
    return base + f' {name}="{html.escape(value, quote=True)}">'


def route_file(root: Path, local_path: str) -> Path:
    return root / local_path.strip("/") / "index.html"


def patch_input(text: str, input_id: str, attrs: dict[str, str | None], prefix: str = "") -> tuple[str, int]:
    pattern = re.compile(rf"<input\b(?=[^>]*\bid=(['\"]){re.escape(input_id)}\1)[^>]*>", re.I | re.S)
    def repl(m: re.Match[str]) -> str:
        tag = m.group(0)
        for key, value in attrs.items():
            tag = set_attr(tag, key, value)
        return prefix + tag
    return pattern.subn(repl, text, count=1)


def patch_react_control(text: str, control: dict[str, Any]) -> tuple[str, bool]:
    key = control["key"]
    input_id = control["inputId"]
    # Remove a prior injected select so reruns remain exactly idempotent.
    text = re.sub(
        rf"<select\b(?=[^>]*\bdata-auping-combobox-native=(['\"]){re.escape(key)}\1)[^>]*>.*?</select>",
        "",
        text,
        flags=re.I | re.S,
    )
    native = (
        f'<select data-auping-combobox-native="{html.escape(key, quote=True)}" '
        f'data-auping-selected-value="" aria-label="{html.escape(control["label"], quote=True)}"></select>'
    )
    text, n = patch_input(text, input_id, {
        "data-auping-combobox": key,
        "data-auping-selected-value": "",
        "aria-hidden": "true",
        "tabindex": "-1",
        "readonly": None,
    }, prefix=native)
    return text, bool(n)


def patch_native_control(text: str, control: dict[str, Any]) -> tuple[str, bool]:
    name = str(control["selectName"])
    key = control["key"]
    pattern = re.compile(
        rf"(?P<open><select\b(?=[^>]*\bname=(['\"]){re.escape(name)}\2)[^>]*>).*?</select>",
        re.I | re.S,
    )
    options = "".join(
        f'<option value="{html.escape(item["value"], quote=True)}">{html.escape(item["label"])}</option>'
        for item in control["options"]
    )
    def repl(m: re.Match[str]) -> str:
        tag = m.group("open")
        tag = set_attr(tag, "data-auping-combobox-native", key)
        tag = set_attr(tag, "data-auping-selected-value", "")
        tag = set_attr(tag, "aria-label", control["label"])
        return tag + options + "</select>"
    text, n = pattern.subn(repl, text, count=1)
    return text, bool(n)


def ensure_combobox_assets(text: str) -> str:
    text = re.sub(r'<link\b[^>]*data-auping-rc75-combobox="style"[^>]*>', "", text, flags=re.I | re.S)
    text = re.sub(r'<script\b[^>]*data-auping-rc75-combobox="runtime"[^>]*>\s*</script>', "", text, flags=re.I | re.S)
    asset = (
        f'<link data-auping-rc75-combobox="style" rel="stylesheet" href="{BASE}/assets/rc75-combobox.css?v={VERSION}">'
        f'<script data-auping-rc75-combobox="runtime" data-config="{BASE}/data/rc75-combobox-variants.json" '
        f'defer src="{BASE}/assets/rc75-combobox.js?v={VERSION}"></script>'
    )
    return re.sub(r"</head>", asset + "</head>", text, count=1, flags=re.I)


def ensure_catalog_asset(text: str) -> str:
    text = re.sub(r'<script\b[^>]*data-auping-rc75-catalog="runtime"[^>]*>\s*</script>', "", text, flags=re.I | re.S)
    asset = (
        f'<script data-auping-rc75-catalog="runtime" data-config="{BASE}/data/rc75-catalog-parity.json" '
        f'defer src="{BASE}/assets/rc75-catalog.js?v={VERSION}"></script>'
    )
    return re.sub(r"</head>", asset + "</head>", text, count=1, flags=re.I)


def copy_payload(payload: Path, root: Path, check: bool) -> list[str]:
    changed: list[str] = []
    rels = [
        "assets/rc75-combobox.js",
        "assets/rc75-combobox.css",
        "assets/rc75-catalog.js",
        "data/rc75-combobox-variants.json",
        "data/rc75-catalog-parity.json",
    ]
    for rel in rels:
        src, dst = payload / rel, root / rel
        if not src.is_file():
            raise SystemExit(f"Missing payload file: {src}")
        content = src.read_bytes()
        if not dst.is_file() or dst.read_bytes() != content:
            changed.append(rel)
            if not check:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
    return changed


def main() -> int:
    a = args()
    root = a.root.resolve()
    payload = a.payload.resolve()
    combo = json.loads((payload / "data/rc75-combobox-variants.json").read_text(encoding="utf-8"))
    catalog = json.loads((payload / "data/rc75-catalog-parity.json").read_text(encoding="utf-8"))
    changed = copy_payload(payload, root, a.check)
    report: dict[str, Any] = {
        "schema": "AUPING-RC7.5-PHASE02-APPLY-V1",
        "checkOnly": a.check,
        "comboboxPages": [],
        "catalogPages": [],
        "payloadFilesChanged": changed,
    }

    for page_id, page in combo["pages"].items():
        path = route_file(root, page["localPath"])
        if not path.is_file():
            raise SystemExit(f"Missing combobox page: {path}")
        original = path.read_text(encoding="utf-8", errors="replace")
        text = original
        controls = []
        for control in page["controls"]:
            if control["mode"] == "react-overlay":
                text, found = patch_react_control(text, control)
            else:
                text, found = patch_native_control(text, control)
            if not found:
                raise SystemExit(f"Missing {control['mode']} control {page_id}:{control['key']}")
            controls.append({"key": control["key"], "mode": control["mode"], "found": found})
        text = ensure_combobox_assets(text)
        is_changed = text != original
        if is_changed and not a.check:
            path.write_text(text, encoding="utf-8")
        if is_changed:
            changed.append(str(path.relative_to(root)))
        report["comboboxPages"].append({"pageId": page_id, "localPath": page["localPath"], "changed": is_changed, "controls": controls})

    for page_id, page in catalog["pages"].items():
        path = route_file(root, page["localPath"])
        if not path.is_file():
            raise SystemExit(f"Missing catalog page: {path}")
        original = path.read_text(encoding="utf-8", errors="replace")
        text = original
        mapped = []
        for group in page["groups"]:
            for option in group["options"]:
                text, n = patch_input(text, option["inputId"], {
                    "data-auping-filter-group": group["key"],
                    "data-auping-filter-value": option["value"],
                    "data-auping-filter-query": group.get("queryKey", group["key"]),
                })
                if not n:
                    raise SystemExit(f"Missing filter input {page_id}:{option['inputId']}")
                mapped.append(option["inputId"])
        text = ensure_catalog_asset(text)
        is_changed = text != original
        if is_changed and not a.check:
            path.write_text(text, encoding="utf-8")
        if is_changed:
            changed.append(str(path.relative_to(root)))
        report["catalogPages"].append({"pageId": page_id, "localPath": page["localPath"], "changed": is_changed, "mappedInputs": mapped, "productCount": len(page["products"])})

    report["summary"] = {
        "comboboxPageCount": len(report["comboboxPages"]),
        "comboboxControlCount": sum(len(x["controls"]) for x in report["comboboxPages"]),
        "catalogPageCount": len(report["catalogPages"]),
        "catalogProductCount": sum(x["productCount"] for x in report["catalogPages"]),
        "changedFileCount": len(set(changed)),
    }
    out = a.report or root / "audit/rc7.5/phase02-apply-report.json"
    if not a.check:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
