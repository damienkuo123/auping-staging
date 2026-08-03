#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REQUIRED = [
    "assets/snapshot-interactions.js",
    "assets/snapshot-fixes.css",
    "assets/hybrid-functions.json",
    ".github/workflows/deploy-pages.yml",
    ".github/workflows/ui-audit.yml",
    "en/index.html",
    "en/box-springs/index.html",
    "en/beds/index.html",
    "en/mattresses/index.html",
    "en/toppers/index.html",
    "en/bed-bases/index.html",
    "en/bed-linen/index.html",
    "en/bed-linen/pillows/index.html",
]
POSTERS = [
    "193fbd75c0b38f98e24babb9116b.jpg",
    "1c887ed4fb0aa061cf0eeca786c3.jpg",
    "1e148dd8972b04e0fe919757c882.jpg",
    "2a7be2063982a32f62c283deeca6.jpg",
    "2c7f60394e11ffca478b4cf3324f.jpg",
    "7a6e9914db47f88e9c9415e507ed.jpg",
    "927e13502742db5ff7e642b84de9.jpg",
    "a3315162a17e816d46aa5b3f1a3b.jpg",
    "e9b877417b0f4a580bed30e01448.jpg",
    "fdfaecfdf94deb4e840c6b83c202.jpg",
]


def check(condition: bool, label: str, results: list[dict]) -> None:
    results.append({"passed": bool(condition), "label": label})
    print(("PASS" if condition else "FAIL"), label)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: verify_level2_5.py <repo-root>")
        return 2
    root = Path(sys.argv[1]).expanduser().resolve()
    results: list[dict] = []

    check((root / ".git").exists(), "Git repository", results)
    for rel in REQUIRED:
        check((root / rel).exists(), rel, results)

    for poster in POSTERS:
        check((root / "assets/hybrid-posters" / poster).exists(), f"poster {poster}", results)

    try:
        config = json.loads((root / "assets/hybrid-functions.json").read_text(encoding="utf-8"))
        functions = config.get("functions", {})
        check(len(functions) >= 6, "hybrid function configuration", results)
        for key in ["storeLocator", "configurator", "contact", "myAuping", "shoppingCart"]:
            check(str(functions.get(key, {}).get("destination", "")).startswith("https://"), f"destination {key}", results)
    except Exception as exc:
        check(False, f"hybrid config parses: {exc}", results)

    js = (root / "assets/snapshot-interactions.js").read_text(encoding="utf-8", errors="ignore")
    css = (root / "assets/snapshot-fixes.css").read_text(encoding="utf-8", errors="ignore")
    check("Auping Level 2.5 Hybrid RC1" in js, "Level 2.5 runtime installed", results)
    check("auping-video-poster-fallback" in css, "video poster CSS installed", results)

    for rel in REQUIRED[5:]:
        path = root / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        check("snapshot-interactions.js" in text, f"runtime linked: {rel}", results)
        check("snapshot-fixes.css" in text, f"CSS linked: {rel}", results)

    workflow = (root / ".github/workflows/ui-audit.yml").read_text(encoding="utf-8", errors="ignore")
    check("workflow_dispatch" in workflow, "manual audit trigger present", results)
    check("workflow_run" not in workflow, "automatic heavy audit disabled", results)

    failed = [item for item in results if not item["passed"]]
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "root": str(root),
        "passed": len(results) - len(failed),
        "failed": len(failed),
        "results": results,
    }
    docs = root / "docs"
    docs.mkdir(exist_ok=True)
    (docs / "STATIC_VERIFY_REPORT.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    lines = [
        "# Static Verify Report",
        "",
        f"Generated: {report['generatedAt']}",
        f"Passed: {report['passed']}",
        f"Failed: {report['failed']}",
        "",
    ]
    lines.extend(f"- [{'x' if r['passed'] else ' '}] {r['label']}" for r in results)
    (docs / "STATIC_VERIFY_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
