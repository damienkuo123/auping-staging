#!/usr/bin/env python3
from __future__ import annotations
import argparse, html, json, re, subprocess
from pathlib import Path

BASELINE = "297608f381b3521ec9ec6f7eade44bbeda4e7187"
BASE_PATH = "/auping-staging"
LOCAL_LOCATOR = BASE_PATH + "/store-locator/"
LEAFLET_CSS = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>'
LEAFLET_JS = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>'
RUNTIME_CSS = '<link rel="stylesheet" href="' + BASE_PATH + '/assets/rc76/taiwan-store-locator.css"/>'
RUNTIME_JS = '<script defer src="' + BASE_PATH + '/assets/rc76/taiwan-store-locator.js"></script>'
GUARD_JS = '<script defer src="' + BASE_PATH + '/assets/rc76/store-link-guard.js"></script>'

def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()

def inject_once(text: str, needle: str, marker: str, before: str) -> str:
    if marker in text:
        return text
    pos = text.lower().rfind(before.lower())
    if pos < 0:
        return text + needle
    return text[:pos] + needle + "\n" + text[pos:]

def rewrite_locator_links(text: str) -> tuple[str, int]:
    count = 0
    def repl(match):
        nonlocal count
        tag = match.group(0)
        if 'data-auping-external-source="true"' in tag:
            return tag
        href = re.search(r'href=(["\'])(.*?)\1', tag, re.I | re.S)
        if not href:
            return tag
        value = html.unescape(href.group(2))
        if not re.search(r'(?:auping\.com/(?:en/)?store-locator|/store-locator/?(?:[?#].*)?$)', value, re.I):
            return tag
        tag = tag[:href.start()] + f'href="{LOCAL_LOCATOR}"' + tag[href.end():]
        tag = re.sub(r'\s+target=(["\']).*?\1', "", tag, flags=re.I | re.S)
        tag = re.sub(r'\s+rel=(["\']).*?\1', "", tag, flags=re.I | re.S)
        if "data-auping-local-store-locator" not in tag:
            tag = tag[:-1] + ' data-auping-local-store-locator="true">'
        count += 1
        return tag
    return re.sub(r"<a\b[^>]*>", repl, text, flags=re.I | re.S), count

def replace_main(shell: str, main_html: str) -> str:
    start = re.search(r"<main\b", shell, re.I)
    if not start:
        raise RuntimeError("Shell has no <main>")
    end = re.search(r"</main>", shell[start.start():], re.I)
    if not end:
        raise RuntimeError("Shell has no </main>")
    finish = start.start() + end.end()
    return shell[:start.start()] + main_html + shell[finish:]

def set_page_meta(shell: str, page_id: str, title: str, canonical: str, page_type: str) -> str:
    shell = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", shell, count=1, flags=re.I | re.S)
    shell = re.sub(r'<link\b[^>]*rel=(["\'])canonical\1[^>]*>',
                   f'<link rel="canonical" href="{canonical}"/>',
                   shell, count=1, flags=re.I | re.S)
    shell = re.sub(r'data-auping-page-id=(["\']).*?\1', f'data-auping-page-id="{page_id}"', shell, count=1)
    shell = re.sub(r'data-rc73-page=(["\']).*?\1', f'data-rc73-page="{page_id}"', shell, count=1)
    shell = re.sub(r'data-auping-page-type=(["\']).*?\1', f'data-auping-page-type="{page_type}"', shell, count=1)
    return shell

def ensure_assets(text: str, include_leaflet: bool) -> str:
    text = inject_once(text, RUNTIME_CSS, "assets/rc76/taiwan-store-locator.css", "</head>")
    text = inject_once(text, GUARD_JS, "assets/rc76/store-link-guard.js", "</body>")
    if include_leaflet:
        text = inject_once(text, LEAFLET_CSS, "leaflet@1.9.4/dist/leaflet.css", "</head>")
        if "assets/rc76/taiwan-store-locator.js" in text:
            text = text.replace(RUNTIME_JS, "")
            text = text.replace(LEAFLET_JS, "")
        text = inject_once(text, LEAFLET_JS + "\n" + RUNTIME_JS,
                           "leaflet@1.9.4/dist/leaflet.js", "</body>")
    return text

def locator_main() -> str:
    return f"""<main class="auping-dealer-locator" data-auping-dealer-locator-page>
      <div class="auping-dealer-locator__intro">
        <h1>尋找 Auping 台灣門市</h1>
        <p>查看台灣六個展示與試躺據點，搜尋縣市、行政區、門市名稱或地址。</p>
      </div>
      <div class="auping-dealer-tools">
        <input type="search" placeholder="搜尋台北、桃園、新竹、台中、高雄、宜蘭"
               aria-label="搜尋 Auping 台灣門市" data-auping-dealer-search>
        <button type="button" data-auping-dealer-locate>使用目前位置</button>
        <a class="auping-dealer-button" href="https://www.openstreetmap.org/fixthemap"
           target="_blank" rel="noopener">回報地圖問題</a>
      </div>
      <p aria-live="polite" data-auping-dealer-status></p>
      <section class="auping-dealer-locator__layout">
        <aside class="auping-dealer-locator__sidebar">
          <div class="auping-dealer-list-meta">
            <strong>台灣展示門市</strong><span data-auping-dealer-count>6 間門市</span>
          </div>
          <div data-auping-dealer-list></div>
        </aside>
        <div class="auping-leaflet-map" data-auping-dealer-map aria-label="Auping 台灣門市地圖"></div>
      </section>
    </main>"""

def dealer_main(dealer: dict) -> str:
    hours = "".join(f"<li>{html.escape(line)}</li>" for line in dealer.get("hours", []))
    phone_digits = re.sub(r"[^\d+]", "", dealer["phone"])
    appointment_digits = re.sub(r"[^\d+]", "", dealer["appointmentPhone"])
    route = f"https://www.google.com/maps/dir/?api=1&destination={dealer['lat']},{dealer['lng']}"
    return f"""<main class="auping-dealer-detail" data-auping-dealer-detail data-dealer-id="{dealer['id']}">
      <nav class="auping-dealer-detail__crumb" aria-label="麵包屑">
        <a href="{LOCAL_LOCATOR}">尋找門市</a> › {html.escape(dealer['shortName'])}
      </nav>
      <section class="auping-dealer-detail__hero">
        <div>
          <p class="auping-tw-locator-eyebrow">Auping 授權展示據點</p>
          <h1>{html.escape(dealer['name'])}</h1>
          <div class="auping-dealer-detail__meta">
            <p><strong>地址：</strong>{html.escape(dealer['address'])}</p>
            <p><strong>電話：</strong><a href="tel:{phone_digits}">{html.escape(dealer['phone'])}</a></p>
            <p><strong>營業時間：</strong></p><ul>{hours}</ul>
            <p><strong>預約聯絡：</strong>{html.escape(dealer['contactName'])}／
              <a href="tel:{appointment_digits}">{html.escape(dealer['appointmentPhone'])}</a></p>
          </div>
          <div class="auping-dealer-detail__actions">
            <a class="auping-dealer-button" href="tel:{appointment_digits}">預約試躺</a>
            <a class="auping-dealer-button secondary" href="{route}" target="_blank" rel="noopener">規劃路線</a>
            <a class="auping-dealer-button secondary" href="{LOCAL_LOCATOR}">查看全部門市</a>
          </div>
          <p class="auping-dealer-source">資料最後核對：2026-08-06｜
            <a href="{html.escape(dealer['sourceUrl'])}" target="_blank" rel="noopener"
               data-auping-external-source="true">{html.escape(dealer['sourceLabel'])}</a>
          </p>
        </div>
        <div class="auping-dealer-detail__map auping-leaflet-map"
             data-auping-dealer-map aria-label="{html.escape(dealer['name'])}地圖"></div>
      </section>
    </main>"""

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--payload", type=Path, required=True)
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    repo, payload = args.repo.resolve(), args.payload.resolve()
    head = git(repo, "rev-parse", "HEAD")
    if head != BASELINE:
        raise SystemExit(f"Baseline mismatch: expected {BASELINE}, got {head}")

    changed = []
    for rel in [
        "assets/rc76/store-link-guard.js",
        "assets/rc76/taiwan-store-locator.js",
        "assets/rc76/taiwan-store-locator.css",
        "data/rc76-taiwan-dealers.json",
    ]:
        src, dst = payload / rel, repo / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        new = src.read_bytes()
        if not dst.exists() or dst.read_bytes() != new:
            dst.write_bytes(new)
            changed.append(rel)

    link_changes = 0
    for path in sorted(repo.rglob("index.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated, count = rewrite_locator_links(text)
        include_leaflet = (
            "StoreLocator_StoreLocator__" in updated or
            "data-auping-dealer-locator-page" in updated or
            "data-auping-dealer-detail" in updated or
            path.relative_to(repo).as_posix() == "store-locator/index.html"
        )
        updated = ensure_assets(updated, include_leaflet)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(repo).as_posix())
            link_changes += count

    data = json.loads((repo / "data/rc76-taiwan-dealers.json").read_text(encoding="utf-8"))
    shell_path = repo / "store-locator/index.html"
    if not shell_path.exists():
        shell_path = repo / "beds/noble/index.html"
    shell = shell_path.read_text(encoding="utf-8", errors="replace")

    locator = set_page_meta(shell, "store-locator", "尋找 Auping 台灣門市｜Auping",
                            LOCAL_LOCATOR, "service")
    locator = replace_main(locator, locator_main())
    locator, _ = rewrite_locator_links(locator)
    locator = ensure_assets(locator, True)
    target = repo / "store-locator/index.html"
    if not target.exists() or target.read_text(encoding="utf-8", errors="replace") != locator:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(locator, encoding="utf-8")
        changed.append("store-locator/index.html")

    for dealer in data["dealers"]:
        local_path = f"/stores/{dealer['slug']}/"
        page_id = f"store-{dealer['slug']}"
        page = set_page_meta(shell, page_id, f"{dealer['name']}｜Auping",
                             BASE_PATH + local_path, "store")
        page = replace_main(page, dealer_main(dealer))
        page, _ = rewrite_locator_links(page)
        page = ensure_assets(page, True)
        out = repo / local_path.strip("/") / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        if not out.exists() or out.read_text(encoding="utf-8", errors="replace") != page:
            out.write_text(page, encoding="utf-8")
            changed.append(out.relative_to(repo).as_posix())

    routes_path = repo / "data/rc6-routes.json"
    routes = json.loads(routes_path.read_text(encoding="utf-8"))
    existing = {r.get("localPath") for r in routes.get("routes", [])}
    additions = []
    if "/store-locator/" not in existing:
        additions.append({
            "id": "store-locator", "title": "尋找門市",
            "localPath": "/store-locator/", "mode": "LOCAL_PARITY",
            "reason": "RC7.6A.3 Leaflet 台灣門市總覽。"
        })
    for dealer in data["dealers"]:
        path = f"/stores/{dealer['slug']}/"
        if path not in existing:
            additions.append({
                "id": f"store-{dealer['slug']}",
                "title": dealer["name"],
                "localPath": path,
                "mode": "LOCAL_PARITY",
                "reason": "RC7.6A.3 台灣門市詳情頁。"
            })
    if additions:
        routes["routes"].extend(additions)
        routes["version"] = "2026-08-06-rc7.6a3-leaflet-taiwan-dealer-parity"
        routes_path.write_text(json.dumps(routes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed.append("data/rc6-routes.json")

    report = {
        "schema": "AUPING-RC7.6A3-APPLY-V1",
        "baseline": BASELINE,
        "changedFileCount": len(dict.fromkeys(changed)),
        "changedFiles": list(dict.fromkeys(changed)),
        "localizedStoreLocatorLinks": link_changes,
        "dealerCount": len(data["dealers"]),
        "routeCount": len(routes["routes"])
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
