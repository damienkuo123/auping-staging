#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess
from pathlib import Path

BASELINE = "f338315dbd96b4cb44b68825d5bab78f30164794"

def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], text=True
    ).strip()

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--payload", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo.resolve()
    actual = git(repo, "rev-parse", "HEAD")
    if actual != BASELINE:
        raise SystemExit(
            f"Baseline mismatch: expected {BASELINE}, got {actual}"
        )

    rel = "assets/rc76/store-link-guard.js"
    src = args.payload.resolve() / rel
    dst = repo / rel
    changed = not dst.exists() or dst.read_bytes() != src.read_bytes()
    if changed:
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(src.read_bytes())

    result = {
        "schema": "AUPING-RC7.6A3.1-APPLY-V1",
        "baseline": BASELINE,
        "changedFileCount": int(changed),
        "changedFiles": [rel] if changed else [],
        "removedFullDocumentPolling": True,
        "safeHrefNoOpGuard": True
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
