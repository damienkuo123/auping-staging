#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re, subprocess
from pathlib import Path

BASE_PATH = "/auping-staging"

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    repo = args.repo.resolve()
    failures = []

    data_path = repo / "data/rc76-taiwan-dealers.json"
    if not data_path.exists():
        failures.append({"code": "DEALER_DATA_MISSING"})
        dealers = []
    else:
        payload = json.loads(data_path.read_text(encoding="utf-8"))
        dealers = payload.get("dealers", [])
        if len(dealers) != 6:
            failures.append({"code": "DEALER_COUNT", "actual": len(dealers)})
        for dealer in dealers:
            for key in ["id","slug","name","address","phone","lat","lng","sourceUrl"]:
                if not dealer.get(key):
                    failures.append({"code": "DEALER_FIELD", "dealer": dealer.get("id"), "field": key})

    locator = repo / "store-locator/index.html"
    if not locator.exists():
        failures.append({"code": "LOCATOR_PAGE_MISSING"})
    else:
        text = locator.read_text(encoding="utf-8", errors="replace")
        for needle, code in [
            ("data-auping-dealer-locator-page", "LOCATOR_CONTRACT"),
            ("data-auping-dealer-map", "LOCATOR_MAP"),
            ("data-auping-dealer-list", "LOCATOR_LIST"),
            ("leaflet@1.9.4", "LEAFLET_MISSING"),
            ("assets/rc76/store-link-guard.js", "LINK_GUARD_MISSING"),
        ]:
            if needle not in text:
                failures.append({"code": code})

    for dealer in dealers:
        page = repo / "stores" / dealer["slug"] / "index.html"
        if not page.exists():
            failures.append({"code": "STORE_PAGE_MISSING", "dealer": dealer["id"]})
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        if dealer["name"] not in text or 'data-auping-dealer-detail' not in text:
            failures.append({"code": "STORE_PAGE_IDENTITY", "dealer": dealer["id"]})

    guard_count = 0
    external_locator_links = []
    for path in repo.rglob("index.html"):
        text = path.read_text(encoding="utf-8", errors="replace")
        guard_count += text.count("assets/rc76/store-link-guard.js")
        for tag in re.findall(r"<a\b[^>]*>", text, flags=re.I | re.S):
            if "auping.com/en/store-locator" in tag and 'data-auping-external-source="true"' not in tag:
                external_locator_links.append(path.relative_to(repo).as_posix())
    if external_locator_links:
        failures.append({"code": "EXTERNAL_LOCATOR_LINKS", "files": external_locator_links[:20]})
    route_target = len(json.loads((repo / "data/rc6-routes.json").read_text(encoding="utf-8")).get("routes", []))
    if guard_count < route_target:
        failures.append({"code": "GLOBAL_GUARD_COVERAGE", "actual": guard_count, "expected": route_target})

    for rel in [
        "assets/rc76/taiwan-store-locator.js",
        "assets/rc76/taiwan-store-locator.css",
        "assets/rc76/store-link-guard.js",
    ]:
        if not (repo / rel).exists():
            failures.append({"code": "ASSET_MISSING", "path": rel})
    try:
        for rel in ["assets/rc76/taiwan-store-locator.js", "assets/rc76/store-link-guard.js"]:
            subprocess.run(["node", "--check", str(repo / rel)], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        pass
    except subprocess.CalledProcessError as exc:
        failures.append({"code": "JS_SYNTAX", "stderr": exc.stderr})

    js = (repo / "assets/rc76/taiwan-store-locator.js").read_text(encoding="utf-8")
    if "tile.openstreetmap.org" not in js or "OpenStreetMap contributors" not in js:
        failures.append({"code": "OSM_POLICY_CONTRACT"})
    if "googleapis.com" in js or "maps.googleapis.com" in js:
        failures.append({"code": "GOOGLE_API_PRESENT"})

    route_report = repo / "audit/rc7.6/rc76a3-phase04-validation.json"
    validator = repo / "tools/validate_rc75_phase04.py"
    if validator.exists():
        result = subprocess.run(
            ["python3", str(validator), str(repo), "--report", str(route_report)],
            capture_output=True, text=True
        )
        if result.returncode:
            failures.append({
                "code": "RC75_ROUTE_GATE_FAILED",
                "stdout": result.stdout[-1200:],
                "stderr": result.stderr[-1200:]
            })

    routes = json.loads((repo / "data/rc6-routes.json").read_text(encoding="utf-8"))
    result = {
        "schema": "AUPING-RC7.6A3-VALIDATION-V1",
        "passed": not failures,
        "dealerCount": len(dealers),
        "routeCount": len(routes.get("routes", [])),
        "globalGuardPages": guard_count,
        "failures": failures
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not failures else 1

if __name__ == "__main__":
    raise SystemExit(main())
