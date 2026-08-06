#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

BASELINE = "8c8bce5b4003ef9a0d766e9d05fb07fc491f5d0c"
OLD_VERSION = "20260806-1"
NEW_VERSION = "20260806-2"
CSS_BEGIN = "/* RC7.6A.3.2 DEALER HOTFIX BEGIN */"
CSS_END = "/* RC7.6A.3.2 DEALER HOTFIX END */"

CSS_PATCH = r'''
/* RC7.6A.3.2 DEALER HOTFIX BEGIN */
body > header[class*="Header_"] {
  z-index: 1200 !important;
}
body > aside[class*="FullPageMenu_"] {
  z-index: 1300 !important;
}
.auping-leaflet-map,
[data-auping-dealer-map],
.leaflet-container {
  position: relative;
  z-index: 0 !important;
  isolation: isolate;
  overflow: hidden;
}
.auping-dealer-locator,
.auping-dealer-detail {
  padding-top: calc(var(--header-height, 74px) + 36px) !important;
  scroll-margin-top: calc(var(--header-height, 74px) + 18px);
}
.auping-embedded-dealer-layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  grid-column: 1 / -1;
  width: 100%;
  min-width: 0;
  min-height: 480px;
  overflow: hidden;
  border: 1px solid #dde1e4;
  background: #fff;
}
.auping-embedded-dealer-layout .auping-embedded-dealer-list {
  min-width: 0;
  max-height: 480px;
  overflow: auto;
  border-right: 1px solid #dde1e4;
}
.auping-embedded-dealer-layout .auping-leaflet-map {
  min-width: 0;
  min-height: 480px !important;
}
@media (max-width: 840px) {
  .auping-embedded-dealer-layout {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .auping-embedded-dealer-layout .auping-embedded-dealer-list {
    max-height: none;
    border-right: 0;
    border-bottom: 1px solid #dde1e4;
  }
  .auping-embedded-dealer-layout .auping-leaflet-map {
    min-height: 420px !important;
  }
}
@media (max-width: 520px) {
  .auping-dealer-locator,
  .auping-dealer-detail {
    padding-top: calc(var(--header-height, 64px) + 24px) !important;
  }
}
/* RC7.6A.3.2 DEALER HOTFIX END */
'''

NEW_CONNECT = r'''  function connectList(list, mapState) {
    list.__aupingDealerMapState = mapState;
    if (list.dataset.aupingDealerConnected === "true") return;
    list.dataset.aupingDealerConnected = "true";
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-dealer-focus]");
      if (!button) return;
      const state = list.__aupingDealerMapState;
      const marker = state?.markers.get(button.dataset.dealerFocus);
      if (!marker) return;
      state.map.flyTo(marker.getLatLng(), 14, { duration: .7 });
      marker.openPopup();
      list.querySelectorAll(".auping-dealer-card").forEach((card) =>
        card.classList.toggle(
          "is-active",
          card.dataset.dealerId === button.dataset.dealerFocus
        )
      );
    });
  }
'''

NEW_EMBEDDED = r'''  function mountEmbedded(section, dealers, index) {
    if (section.dataset.aupingDealerEmbeddedReady === "true") return;
    const mapHost = section.querySelector('[class*="GoogleMaps_GoogleMaps__"]');
    if (!mapHost) return;
    section.dataset.aupingDealerEmbeddedReady = "true";

    const title = section.querySelector(
      '[class*="StoreLocator_StoreLocator__Title"]'
    );
    const subtitle = section.querySelector(
      '[class*="StoreLocator_StoreLocator__SubTitle"]'
    );
    if (title) title.textContent = "Auping 台灣門市";
    if (subtitle) subtitle.textContent = "尋找展示與試躺據點";

    const sidebarCandidates = [
      ...section.querySelectorAll('[class*="Sidebar_Sidebar__"]')
    ];
    const sidebar = sidebarCandidates.find((node) =>
      !sidebarCandidates.some(
        (other) => other !== node && other.contains(node)
      )
    );

    const list = document.createElement("div");
    list.className = "auping-embedded-dealer-list";
    const nearest = dealers.slice(0, 3);
    list.innerHTML = `
      <div class="auping-embedded-dealer-heading">
        <strong>台灣展示門市</strong>
        <a href="${BASE}/store-locator/">查看全部 ${dealers.length} 間</a>
      </div>
      ${nearest.map((dealer) => cardHtml(dealer, true)).join("")}
    `;

    const layout = document.createElement("div");
    layout.className = "auping-embedded-dealer-layout";
    mapHost.replaceWith(layout);
    layout.append(list, mapHost);
    if (sidebar && !layout.contains(sidebar)) sidebar.remove();

    mapHost.replaceChildren();
    mapHost.classList.add("auping-leaflet-map");
    const mapState = createMap(mapHost, dealers);
    connectList(list, mapState);
  }
'''

def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(repo), *args],
        text=True,
    ).strip()

def write_changed(
    path: Path,
    text: str,
    changed: list[str],
    repo: Path,
) -> None:
    before = path.read_text(encoding="utf-8")
    if before == text:
        return
    path.write_text(text, encoding="utf-8")
    changed.append(path.relative_to(repo).as_posix())

def replace_function(
    text: str,
    function_name: str,
    next_function_name: str,
    replacement: str,
) -> str:
    pattern = re.compile(
        rf"  function {re.escape(function_name)}\(.*?"
        rf"(?=  function {re.escape(next_function_name)}\()",
        re.S,
    )
    updated, count = pattern.subn(replacement + "\n", text, count=1)
    if count != 1:
        raise RuntimeError(
            f"Could not replace function {function_name}: {count} matches"
        )
    return updated

def replace_meta(
    html: str,
    attr: str,
    key: str,
    content: str,
) -> str:
    pattern = re.compile(
        rf'<meta\b(?=[^>]*\b{re.escape(attr)}=["\']'
        rf'{re.escape(key)}["\'])[^>]*>',
        re.I,
    )
    replacement = f'<meta {attr}="{key}" content="{content}"/>'
    updated, count = pattern.subn(replacement, html, count=1)
    if count != 1:
        raise RuntimeError(f"Missing metadata: {attr}={key}")
    return updated

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repo.resolve()
    actual = git(repo, "rev-parse", "HEAD")
    if actual != BASELINE:
        raise SystemExit(
            f"Baseline mismatch: expected {BASELINE}, got {actual}"
        )

    changed: list[str] = []

    routes_path = repo / "data/rc6-routes.json"
    routes = json.loads(routes_path.read_text(encoding="utf-8"))
    matches = [
        item for item in routes.get("routes", [])
        if item.get("localPath") == "/store-locator/"
    ]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected one /store-locator/ route, got {len(matches)}"
        )
    route = matches[0]
    route["mode"] = "LOCAL_PARITY"
    route.pop("officialUrl", None)
    route["reason"] = (
        "RC7.6A.3.2：台灣六間門市頁已本地實作，禁止 Runtime 導回官方英文頁。"
    )
    routes["version"] = (
        "2026-08-06-rc7.6a3.2-dealer-routing-layout"
    )
    write_changed(
        routes_path,
        json.dumps(routes, ensure_ascii=False, indent=2) + "\n",
        changed,
        repo,
    )

    css_path = repo / "assets/rc76/taiwan-store-locator.css"
    css = css_path.read_text(encoding="utf-8")
    css = re.sub(
        re.escape(CSS_BEGIN) + r".*?" + re.escape(CSS_END),
        "",
        css,
        flags=re.S,
    ).rstrip()
    css += "\n\n" + CSS_PATCH.strip() + "\n"
    write_changed(css_path, css, changed, repo)

    js_path = repo / "assets/rc76/taiwan-store-locator.js"
    js = js_path.read_text(encoding="utf-8")
    js = replace_function(
        js,
        "connectList",
        "mountLocatorPage",
        NEW_CONNECT,
    )

    old_search = '''      render();
      const matches = visible.map((dealer) => mapState.markers.get(dealer.id)).filter(Boolean);'''
    new_search = '''      render();
      const visibleIds = new Set(visible.map((dealer) => dealer.id));
      mapState.markers.forEach((marker, id) => {
        const shouldShow = visibleIds.has(id);
        const isShown = mapState.map.hasLayer(marker);
        if (shouldShow && !isShown) marker.addTo(mapState.map);
        if (!shouldShow && isShown) marker.remove();
      });
      const matches = visible.map((dealer) => mapState.markers.get(dealer.id)).filter(Boolean);'''
    if js.count(old_search) != 1:
        raise RuntimeError(
            f"Search marker patch expected 1 match, got {js.count(old_search)}"
        )
    js = js.replace(old_search, new_search, 1)

    embedded_pattern = re.compile(
        r"  function mountEmbedded\(.*?(?=  Promise\.all\()",
        re.S,
    )
    js, embedded_count = embedded_pattern.subn(
        NEW_EMBEDDED + "\n",
        js,
        count=1,
    )
    if embedded_count != 1:
        raise RuntimeError(
            f"mountEmbedded replacement count: {embedded_count}"
        )
    write_changed(js_path, js, changed, repo)

    locator_path = repo / "store-locator/index.html"
    html = locator_path.read_text(encoding="utf-8")
    html, count = re.subn(
        r"<title>.*?</title>",
        "<title>尋找 Auping 台灣門市｜Auping</title>",
        html,
        count=1,
        flags=re.I | re.S,
    )
    if count != 1:
        raise RuntimeError("Store Locator title missing")

    description = (
        "搜尋 Auping 台灣展示與試躺門市，查看地址、電話、營業時間與路線。"
    )
    html = replace_meta(html, "name", "description", description)
    html = replace_meta(
        html, "property", "og:title", "尋找 Auping 台灣門市"
    )
    html = replace_meta(
        html, "property", "og:description", description
    )
    html = replace_meta(
        html,
        "property",
        "og:url",
        "/auping-staging/store-locator/",
    )
    html = replace_meta(
        html, "name", "twitter:title", "尋找 Auping 台灣門市"
    )
    html = replace_meta(
        html, "name", "twitter:description", description
    )
    html = re.sub(
        r'<link\b(?=[^>]*\bas=["\']image["\'])'
        r'(?=[^>]*\brel=["\']preload["\'])[^>]*>',
        "",
        html,
        flags=re.I,
    )
    write_changed(locator_path, html, changed, repo)

    cache_busted = 0
    for page in repo.rglob("*.html"):
        before = page.read_text(encoding="utf-8")
        after = before.replace(
            "taiwan-store-locator.css?v=" + OLD_VERSION,
            "taiwan-store-locator.css?v=" + NEW_VERSION,
        ).replace(
            "taiwan-store-locator.js?v=" + OLD_VERSION,
            "taiwan-store-locator.js?v=" + NEW_VERSION,
        )
        if after != before:
            write_changed(page, after, changed, repo)
            cache_busted += 1

    report = {
        "schema": "AUPING-RC7.6A3.2-APPLY-V1",
        "baseline": BASELINE,
        "changedFileCount": len(changed),
        "changedFiles": changed,
        "htmlCacheBusterFileCount": cache_busted,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
