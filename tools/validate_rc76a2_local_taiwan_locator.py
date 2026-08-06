#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re, subprocess
from pathlib import Path

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    repo = args.repo.resolve()
    failures = []

    page = repo / "store-locator/index.html"
    if not page.exists():
        failures.append({"code": "LOCAL_LOCATOR_MISSING"})
        text = ""
    else:
        text = page.read_text(encoding="utf-8", errors="replace")
        for needle, code in [
            ("尋找 Auping 台灣門市", "LOCAL_LOCATOR_H1"),
            ('href="/auping-staging/store-locator/"', "LOCAL_LOCATOR_CANONICAL"),
            ("data-auping-tw-standalone", "LOCAL_LOCATOR_RUNTIME_MARKER"),
        ]:
            if needle not in text:
                failures.append({"code": code})

    routes = json.loads((repo / "data/rc6-routes.json").read_text(encoding="utf-8"))
    if not any(r.get("localPath") == "/store-locator/" for r in routes.get("routes", [])):
        failures.append({"code": "ROUTE_MANIFEST_MISSING"})

    external_header_links = []
    local_links = 0
    for path in repo.rglob("index.html"):
        data = path.read_text(encoding="utf-8", errors="replace")
        local_links += data.count('href="/auping-staging/store-locator/"')
        for tag in re.findall(r"<a\b[^>]*>", data, flags=re.I | re.S):
            if "auping.com/en/store-locator" in tag and 'data-auping-external-global-locator="true"' not in tag:
                external_header_links.append(path.relative_to(repo).as_posix())
    if external_header_links:
        failures.append({"code": "UNAPPROVED_EXTERNAL_LOCATOR_LINKS", "files": external_header_links[:20]})
    if local_links < 1:
        failures.append({"code": "LOCAL_LOCATOR_LINKS_MISSING"})

    js = repo / "assets/rc76/taiwan-store-locator.js"
    css = repo / "assets/rc76/taiwan-store-locator.css"
    if not js.exists() or not css.exists():
        failures.append({"code": "RUNTIME_ASSET_MISSING"})
    else:
        js_text = js.read_text(encoding="utf-8")
        if "findStoreLocatorSections" not in js_text or "replaceChildren(panel)" not in js_text:
            failures.append({"code": "CLEAN_SINGLE_MOUNT_CONTRACT_MISSING"})
        try:
            subprocess.run(["node", "--check", str(js)], check=True, capture_output=True, text=True)
        except FileNotFoundError:
            pass
        except subprocess.CalledProcessError as exc:
            failures.append({"code": "JAVASCRIPT_SYNTAX", "stderr": exc.stderr})

    phase_report = repo / "audit/rc7.6/rc76a2-phase04-validation.json"
    validator = repo / "tools/validate_rc75_phase04.py"
    if validator.exists():
        result = subprocess.run(
            ["python3", str(validator), str(repo), "--report", str(phase_report)],
            capture_output=True, text=True
        )
        if result.returncode:
            failures.append({"code": "RC75_ROUTE_GATE_FAILED", "stdout": result.stdout[-1000:], "stderr": result.stderr[-1000:]})

    payload = {
        "schema": "AUPING-RC7.6A2-VALIDATION-V1",
        "passed": not failures,
        "routeCount": len(routes.get("routes", [])),
        "localLocatorLinks": local_links,
        "failures": failures
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if not failures else 1

if __name__ == "__main__":
    raise SystemExit(main())