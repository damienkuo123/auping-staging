#!/usr/bin/env python3
"""RC7.5 Phase 03 post-apply validator. Python standard library only."""
from pathlib import Path
import html
import json
import re
import sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
BASE = "/auping-staging"
EXPECTED = {
    "coreMaterializedCount": 50,
    "linkedMaterializedCount": 21,
    "totalLocalRouteCount": 142,
    "productCount": 112,
    "comboboxPageCount": 62,
}
FORBIDDEN_VISIBLE_COPY = (
    "內含 1 個 60×70 公分枕套",
    "140 x 200/220 cm 內含 1 枕套",
    "100% 有機棉",
    "奢華飯店等級",
    "White lines satin duvet cover",
    "This 被套",
    "這款 Auping 被套",
)

def load_json(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))

def route_file(local_path):
    return ROOT / (local_path.strip("/") or ".") / "index.html"

def attr_value(tag, name):
    match = re.search(rf"\b{re.escape(name)}\s*=\s*([\"'])(.*?)\1", tag, re.I | re.S)
    return html.unescape(match.group(2)) if match else None

def first_tag(text, name):
    match = re.search(rf"<{name}\b[^>]*>", text, re.I | re.S)
    return match.group(0) if match else ""

def tag_text(text, name):
    match = re.search(rf"<{name}\b[^>]*>(.*?)</{name}>", text, re.I | re.S)
    if not match:
        return ""
    value = re.sub(r"<(script|style)\b.*?</\1>", "", match.group(1), flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return " ".join(html.unescape(value).split())

def visible_main(text):
    match = re.search(r"<main\b.*?</main>", text, re.I | re.S)
    value = match.group(0) if match else text
    value = re.sub(r"<(script|style|noscript)\b.*?</\1>", "", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return " ".join(html.unescape(value).split())

def canonical_href(text):
    for tag in re.findall(r"<link\b[^>]*>", text, re.I | re.S):
        rel = (attr_value(tag, "rel") or "").lower()
        if "canonical" in rel:
            return attr_value(tag, "href")
    return None

def has_meta_refresh(text):
    for tag in re.findall(r"<meta\b[^>]*>", text, re.I | re.S):
        if (attr_value(tag, "http-equiv") or "").lower() == "refresh":
            return True
    return False

def same_path_redirect(text, local_path):
    target = re.escape(BASE + local_path)
    return bool(re.search(rf"location\.replace\(\s*[\"']?{target}", text, re.I))

def main():
    failures = []
    checks = []
    required = [
        "data/rc6-routes.json",
        "data/rc6-products.json",
        "data/rc75-combobox-variants.json",
        "data/rc75-page-contracts.json",
        "data/rc75-linked-product-routes.json",
        "audit/rc7.5/phase03-apply-report.json",
    ]
    for rel in required:
        if not (ROOT / rel).is_file():
            failures.append([rel, "missing-required-file"])
    if failures:
        print(json.dumps({"passed": False, "failures": failures}, ensure_ascii=False, indent=2))
        return 1

    routes_payload = load_json("data/rc6-routes.json")
    products_payload = load_json("data/rc6-products.json")
    variants = load_json("data/rc75-combobox-variants.json").get("pages", {})
    linked = load_json("data/rc75-linked-product-routes.json")
    report = load_json("audit/rc7.5/phase03-apply-report.json")
    routes = routes_payload.get("routes", [])
    products = products_payload.get("products", [])
    product_by_id = {item.get("routeId"): item for item in products}

    for key, value in EXPECTED.items():
        actual = report.get(key)
        if actual != value:
            failures.append(["phase03-report", key, actual, value])
    local_routes = [r for r in routes if str(r.get("mode", "")).startswith("LOCAL")]
    if len(local_routes) != EXPECTED["totalLocalRouteCount"]:
        failures.append(["route-manifest", "local-route-count", len(local_routes), EXPECTED["totalLocalRouteCount"]])
    if len(products) != EXPECTED["productCount"]:
        failures.append(["product-manifest", "product-count", len(products), EXPECTED["productCount"]])
    if len(variants) != EXPECTED["comboboxPageCount"]:
        failures.append(["combobox-manifest", "page-count", len(variants), EXPECTED["comboboxPageCount"]])
    if linked.get("count") != EXPECTED["linkedMaterializedCount"]:
        failures.append(["linked-routes", "count", linked.get("count"), EXPECTED["linkedMaterializedCount"]])

    for item in report.get("pages", []):
        page_id = item["pageId"]
        local_path = item["localPath"]
        path = route_file(local_path)
        if not path.is_file():
            failures.append([page_id, "missing-file"])
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        html_tag = first_tag(text, "html")
        page_checks = {
            "page-id": attr_value(html_tag, "data-auping-page-id") == page_id,
            "materialized": attr_value(html_tag, "data-auping-materialized") == "phase03",
            "title": item["title"] in tag_text(text, "title"),
            "h1": item["title"] in tag_text(text, "h1"),
            "canonical": canonical_href(text) == BASE + local_path,
            "no-meta-refresh": not has_meta_refresh(text),
            "no-self-redirect": not same_path_redirect(text, local_path),
            "hero-image": "ProductHeader_base" in text and bool(re.search(rf"<img\b[^>]*\balt=([\"']){re.escape(item['title'])}\1", text, re.I | re.S)),
        }
        if item.get("control"):
            control = item["control"]
            page_checks["control"] = bool(re.search(rf"data-auping-combobox-native=([\"']){re.escape(control)}\1", text)) and page_id in variants
        visible = visible_main(text)
        page_checks["copy-clean"] = not any(value in visible for value in FORBIDDEN_VISIBLE_COPY)
        page_checks["copy-source"] = attr_value(html_tag, "data-auping-materialized-copy") == "catalog-attributes-only"
        product = product_by_id.get(page_id) or {}
        attribute_values = [str(value) for values in (product.get("attributes") or {}).values() for value in values]
        page_checks["catalog-attributes"] = all(value in visible for value in attribute_values)
        for key, passed in page_checks.items():
            if not passed:
                failures.append([page_id, key])
        checks.append({"pageId": page_id, "checks": page_checks})

    # Every local route must exist and must not redirect back to itself.
    for route in local_routes:
        path = route_file(route["localPath"])
        if not path.is_file():
            failures.append([route["id"], "route-missing"])
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if has_meta_refresh(text) or same_path_redirect(text, route["localPath"]):
            failures.append([route["id"], "route-self-loop"])

    # Every product link on the four repaired catalog pages must resolve locally.
    catalog_paths = (
        "/bed-linen/duvets/",
        "/bed-linen/fitted-sheets/",
        "/bed-linen/mattress-protectors/",
        "/bed-linen/bedspreads/",
    )
    for catalog_path in catalog_paths:
        text = route_file(catalog_path).read_text(encoding="utf-8", errors="ignore")
        hrefs = set(html.unescape(x[1]) for x in re.findall(r"\bhref\s*=\s*([\"'])(.*?)\1", text, re.I | re.S))
        for href in hrefs:
            if href.startswith(BASE + catalog_path) and href != BASE + catalog_path:
                local_path = href[len(BASE):].split("?", 1)[0].split("#", 1)[0]
                if not route_file(local_path).is_file():
                    failures.append([catalog_path, "dead-product-link", href])

    output = {
        "schema": "AUPING-RC7.5-PHASE03-VALIDATION-V1",
        "passed": not failures,
        "summary": {
            "coreMaterialized": report.get("coreMaterializedCount"),
            "linkedMaterialized": report.get("linkedMaterializedCount"),
            "localRoutes": len(local_routes),
            "products": len(products),
            "comboboxPages": len(variants),
        },
        "checks": checks,
        "failures": failures,
    }
    out_path = ROOT / "audit/rc7.5/phase03-validation.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "passed": output["passed"],
        "summary": output["summary"],
        "failureCount": len(failures),
        "failures": failures[:20],
    }, ensure_ascii=False, indent=2))
    return 0 if output["passed"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
