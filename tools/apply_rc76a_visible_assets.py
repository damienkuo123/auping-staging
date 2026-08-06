#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, re, shutil
from datetime import datetime, timezone
from pathlib import Path

BASELINE = "aec2289fead07f50643fedc7e0e283e6d85e3e19"
PAGES = [
    "beds/noa/index.html",
    "beds/noble/index.html",
    "beds/original/index.html",
    "box-springs/criade/index.html",
    "box-springs/kiruna/index.html",
]
TARGETS = {
    "aurondepastillegreen_1.png": "/auping-staging/assets/rc76/common/explore-beds.avif",
    "auping_aw25_bedlinen_dessin_playful_bricks_065.png": "/auping-staging/assets/rc76/common/create-bedroom.avif",
}
PATTERNS = {
    name: re.compile(
        r"(?:https://www\.auping\.com)?/_next/image\?url=https%3A%2F%2Fapi\.auping\.com%2Fsites%2Fdefault%2Ffiles%2F"
        + (r"2025-11%2F" if name.startswith("auronde") else r"2025-10%2F")
        + re.escape(name)
        + r"(?:&amp;|&)w=\d+(?:&amp;|&)q=75"
    )
    for name in TARGETS
}


def sha(path: Path) -> str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()


def copy_if_changed(src: Path, dst: Path) -> bool:
    if dst.is_file() and sha(src)==sha(dst): return False
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)
    return True


def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo",required=True)
    ap.add_argument("--payload",required=True)
    ap.add_argument("--report",required=True)
    args=ap.parse_args()
    repo=Path(args.repo).expanduser().resolve(); payload=Path(args.payload).resolve()
    changed=[]; replacements={}
    # Persist payload files in the repository.
    for rel in [
        "assets/rc76/common/explore-beds.avif",
        "assets/rc76/common/create-bedroom.avif",
        "tools/apply_rc76a_visible_assets.py",
        "tools/validate_rc76a_visible_assets.py",
        "audit/rc7.6/RC76A_README.md",
        "audit/rc7.6/RC76A_KNOWN_LIMITATIONS.md",
    ]:
        if copy_if_changed(payload/rel,repo/rel): changed.append(rel)
    for rel in PAGES:
        path=repo/rel
        text=path.read_text(encoding="utf-8")
        original=text
        page_counts={}
        for name,pattern in PATTERNS.items():
            text,count=pattern.subn(TARGETS[name],text)
            page_counts[name]=count
        if text!=original:
            path.write_text(text,encoding="utf-8")
            changed.append(rel)
        replacements[rel]=page_counts
    report={
        "schema":"AUPING-RC7.6A-APPLY-REPORT-V1",
        "baseline":BASELINE,
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "changedFileCount":len(changed),
        "changedFiles":changed,
        "replacements":replacements,
    }
    out=repo/args.report; out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0
if __name__=="__main__": raise SystemExit(main())
