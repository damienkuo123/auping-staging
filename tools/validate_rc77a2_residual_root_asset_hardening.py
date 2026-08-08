#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import argparse, json, re, subprocess

ROOT_NEXT_RE = re.compile(r'url\(\s*["\']?/_next/static/media/', re.I)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo")
    args = ap.parse_args()
    repo = Path(args.repo).resolve()

    failures = []
    stats = {
        "cssFileCount": 0,
        "officialNextStaticCssReferenceCount": 0,
        "residualRootNextStaticCssReferenceCount": 0,
        "residualLanguageIconCssReferenceCount": 0,
    }

    for path in sorted((repo/"assets").rglob("*.css")):
        stats["cssFileCount"] += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        stats["officialNextStaticCssReferenceCount"] += text.count(
            "https://www.auping.com/_next/static/media/"
        )
        residual = len(ROOT_NEXT_RE.findall(text))
        if residual:
            stats["residualRootNextStaticCssReferenceCount"] += residual
            failures.append(f"Root /_next/static remains: {path.relative_to(repo)} ({residual})")
        if "/icons/languages/EN_GB.svg" in text:
            stats["residualLanguageIconCssReferenceCount"] += text.count(
                "/icons/languages/EN_GB.svg"
            )
            failures.append(f"Legacy language icon remains: {path.relative_to(repo)}")

    route_file = repo/"data/rc6-routes.json"
    routes = json.loads(route_file.read_text(encoding="utf-8"))["routes"]
    store = next((r for r in routes if r.get("id") == "service-store-locator"), None)
    if not store or store.get("mode") != "LOCAL_PARITY":
        failures.append("Store Locator is not LOCAL_PARITY")

    diffcheck = subprocess.run(
        ["git", "diff", "--check"],
        cwd=repo, text=True, capture_output=True
    )
    if diffcheck.returncode != 0:
        failures.append("git diff --check failed: " + diffcheck.stdout + diffcheck.stderr)

    if stats["officialNextStaticCssReferenceCount"] < 1:
        failures.append("Expected absolute official Next static CSS references were not found")

    report = {
        "schema": "AUPING-RC7.7A2-RESIDUAL-ROOT-ASSET-HARDENING-VALIDATION-V1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "passed": not failures,
        "failureCount": len(failures),
        "failures": failures,
        "stats": stats,
        "storeLocatorPolicy": "LOCAL_PARITY_REQUIRED",
    }
    out = repo/"audit/rc7.7/rc77a2_validation_report.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)

if __name__ == "__main__":
    main()
