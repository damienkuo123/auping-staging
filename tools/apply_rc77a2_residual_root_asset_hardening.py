#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import argparse, json, re

BASELINE = "bde296227bfdc4ed7de5b0f25a30df82c0fea4c3"

FONT_ROOT_RE = re.compile(r'url\(\s*(["\']?)/_next/static/media/')
LANG_ICON_RE = re.compile(
    r'content\s*:\s*url\(\s*(["\']?)/icons/languages/EN_GB\.svg\1\s*\)\s*;',
    re.I,
)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo")
    args = ap.parse_args()
    repo = Path(args.repo).resolve()
    css_root = repo / "assets"
    if not css_root.is_dir():
        raise SystemExit("ERROR: assets directory missing")

    changed = []
    totals = {
        "cssFilesScanned": 0,
        "cssFilesChanged": 0,
        "rootNextStaticUrlsRewritten": 0,
        "legacyLanguageIconRulesRemoved": 0,
    }

    for path in sorted(css_root.rglob("*.css")):
        totals["cssFilesScanned"] += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        original = text

        def repl_font(match):
            quote = match.group(1)
            return f'url({quote}https://www.auping.com/_next/static/media/'

        text, n_font = FONT_ROOT_RE.subn(repl_font, text)
        text, n_icon = LANG_ICON_RE.subn("content: none;", text)

        if text != original:
            path.write_text(text, encoding="utf-8")
            changed.append(str(path.relative_to(repo)))
            totals["cssFilesChanged"] += 1
            totals["rootNextStaticUrlsRewritten"] += n_font
            totals["legacyLanguageIconRulesRemoved"] += n_icon

    report = {
        "schema": "AUPING-RC7.7A2-RESIDUAL-ROOT-ASSET-HARDENING-APPLY-V1",
        "baseline": BASELINE,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "changedFileCount": len(changed),
        "changedFiles": changed,
        "totals": totals,
        "storeLocatorPolicy": "LOCAL_PARITY_REQUIRED",
    }
    out = repo / "audit/rc7.7/rc77a2_apply_report.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))

    if not changed:
        raise SystemExit("ERROR: no CSS files changed; baseline may be unexpected")
    if totals["rootNextStaticUrlsRewritten"] < 1:
        raise SystemExit("ERROR: no root Next static URL was rewritten")
    if totals["legacyLanguageIconRulesRemoved"] < 1:
        raise SystemExit("ERROR: no legacy language icon rule was removed")

if __name__ == "__main__":
    main()
