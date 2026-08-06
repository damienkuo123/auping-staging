#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess
from pathlib import Path

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    path = args.repo.resolve() / "assets/rc76/store-link-guard.js"
    failures = []
    text = path.read_text(encoding="utf-8") if path.exists() else ""

    if not text:
        failures.append({"code": "GUARD_MISSING"})

    for needle, code in {
        "setInterval(": "POLLING_STILL_PRESENT",
        "lock(mutation.target.parentElement": "PARENT_RESCAN_PRESENT",
        "anchor.setAttribute(\"href\", LOCAL);": "OLD_UNCONDITIONAL_WRITE_PRESENT",
    }.items():
        if needle in text:
            failures.append({"code": code})

    for needle, code in {
        "raw === LOCAL_PATH": "LOCAL_NOOP_GUARD_MISSING",
        'attributeFilter: ["href"]': "HREF_FILTER_MISSING",
        'dataset.aupingStoreLinkGuard = "safe-v2"': "SAFE_VERSION_MISSING",
    }.items():
        if needle not in text:
            failures.append({"code": code})

    try:
        subprocess.run(
            ["node", "--check", str(path)],
            check=True, capture_output=True, text=True
        )
    except FileNotFoundError:
        pass
    except subprocess.CalledProcessError as exc:
        failures.append({"code": "JS_SYNTAX", "stderr": exc.stderr})

    result = {
        "schema": "AUPING-RC7.6A3.1-VALIDATION-V1",
        "passed": not failures,
        "pollingRemoved": "setInterval(" not in text,
        "failures": failures
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1

if __name__ == "__main__":
    raise SystemExit(main())
