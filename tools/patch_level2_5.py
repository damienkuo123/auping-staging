#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import shutil
import sys
from pathlib import Path

CRITICAL_HTML = [
    "en/index.html",
    "en/box-springs/index.html",
    "en/beds/index.html",
    "en/mattresses/index.html",
    "en/toppers/index.html",
    "en/bed-bases/index.html",
    "en/bed-linen/index.html",
    "en/bed-linen/pillows/index.html",
    "en/store-locator/index.html",
    "en/myauping/index.html",
    "en/shoppingcart/index.html",
    "en/customer-service/contact/index.html",
    "en/contact-us/index.html",
]


def rel_asset(root: Path, html: Path, name: str) -> str:
    return os.path.relpath(root / "assets" / name, html.parent).replace(os.sep, "/")


def ensure_runtime_tags(root: Path, html: Path) -> bool:
    text = html.read_text(encoding="utf-8", errors="ignore")
    changed = False
    css = rel_asset(root, html, "snapshot-fixes.css")
    js = rel_asset(root, html, "snapshot-interactions.js")

    if "snapshot-fixes.css" not in text:
        tag = f'<link rel="stylesheet" href="{css}" data-auping-snapshot-fixes="true"/>'
        if re.search(r"</head\s*>", text, re.I):
            text = re.sub(r"</head\s*>", tag + "</head>", text, count=1, flags=re.I)
        else:
            text = tag + text
        changed = True

    if "snapshot-interactions.js" not in text:
        tag = f'<script defer src="{js}" data-auping-snapshot-interactions="true"></script>'
        if re.search(r"</body\s*>", text, re.I):
            text = re.sub(r"</body\s*>", tag + "</body>", text, count=1, flags=re.I)
        else:
            text += tag
        changed = True

    if changed:
        html.write_text(text, encoding="utf-8")
    return changed


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: patch_level2_5.py <repo-root>")
        return 2
    root = Path(sys.argv[1]).expanduser().resolve()
    if not (root / ".git").exists():
        print(f"ERROR: not a Git repository: {root}")
        return 1

    toppers = root / "en/toppers/index.html"
    source = root / "en/mattress-toppers/index.html"
    if not toppers.exists() and source.exists():
        toppers.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, toppers)
        print("CREATED en/toppers/index.html")

    patched = 0
    missing = []
    for rel in CRITICAL_HTML:
        path = root / rel
        if not path.exists():
            missing.append(rel)
            continue
        if ensure_runtime_tags(root, path):
            patched += 1

    print(f"PATCHED critical HTML files: {patched}")
    if missing:
        print("MISSING optional/critical HTML:")
        for rel in missing:
            print(f"  - {rel}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
