#!/usr/bin/env python3
from __future__ import annotations
import argparse, html, json, re, subprocess
from pathlib import Path

BASELINE = "5a6ff309016fab4a0c42c7a3d957baedf8149840"
BASE_PATH = "/auping-staging"
LOCAL_URL = f"{BASE_PATH}/store-locator/"
OFFICIAL_RE = re.compile(r"https?://(?:www\.)?auping\.com/(?:en/)?store-locator/?", re.I)

def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()

def patch_anchor_tag(tag: str):
    if 'data-auping-external-global-locator="true"' in tag:
        return tag, False
    href = re.search(r"href=([\"'])(.*?)\1", tag, re.I | re.S)
    if not href:
        return tag, False
    value = html.unescape(href.group(2))
    official = bool(OFFICIAL_RE.fullmatch(value.rstrip("/")))
    any_locator = bool(re.search(r"/store-locator/?(?:[?#].*)?$", value, re.I))
    if not (official or any_locator):
        return tag, False
    tag = tag[:href.start()] + f'href="{LOCAL_URL}"' + tag[href.end():]
    tag = re.sub(r"\s+target=([\"']).*?\1", "", tag, flags=re.I | re.S)
    tag = re.sub(r"\s+rel=([\"']).*?\1", "", tag, flags=re.I | re.S)
    if "data-auping-local-store-locator" not in tag:
        tag = tag[:-1] + ' data-auping-local-store-locator="true">'
    return tag, True

def rewrite_locator_links(text: str):
    count = 0
    def repl(match):
        nonlocal count
        out, changed = patch_anchor_tag(match.group(0))
        count += int(changed)
        return out
    return re.sub(r"<a\b[^>]*>", repl, text, flags=re.I | re.S), count

def replace_main(shell: str, new_main: str) -> str:
    start = re.search(r"<main\b", shell, re.I)
    if not start:
        raise RuntimeError("Noble shell has no <main>")
    end = re.search(r"</main>", shell[start.start():], re.I)
    if not end:
        raise RuntimeError("Noble shell has no </main>")
    end_pos = start.start() + end.end()
    return shell[:start.start()] + new_main + shell[end_pos:]

def build_store_locator_page(shell: str) -> str:
    shell = re.sub(r"<title>.*?</title>", "<title>尋找門市｜Auping</title>", shell, count=1, flags=re.I | re.S)
    shell = re.sub(
        r"<link\b[^>]*rel=([\"'])canonical\1[^>]*>",
        f'<link rel="canonical" href="{LOCAL_URL}"/>',
        shell, count=1, flags=re.I | re.S
    )
    shell = re.sub(r"data-auping-page-id=([\"']).*?\1", 'data-auping-page-id="store-locator"', shell, count=1)
    shell = re.sub(r"data-rc73-page=([\"']).*?\1", 'data-rc73-page="store-locator"', shell, count=1)
    shell = re.sub(r"data-auping-page-type=([\"']).*?\1", 'data-auping-page-type="service"', shell, count=1)

    main = f"""<main class="auping-tw-locator-page" data-auping-tw-standalone>
      <div class="auping-tw-locator-page__inner">
        <div class="auping-tw-locator-page__heading">
          <h1>尋找 Auping 台灣門市</h1>
          <p>搜尋台灣縣市或行政區，查看附近的 Auping 展示與試躺據點。</p>
        </div>
        <section class="auping-tw-locator-page__layout" aria-label="Auping 台灣門市搜尋">
          <aside class="auping-tw-locator-page__sidebar">
            <div data-auping-tw-standalone-panel>
              <p class="auping-tw-locator-eyebrow">Auping 台灣</p>
              <h2 class="auping-tw-locator-title">從所在地開始搜尋</h2>
              <p class="auping-tw-locator-copy">輸入縣市、行政區或郵遞區號，或允許瀏覽器使用目前位置。</p>
              <label class="auping-tw-locator-label" for="auping-tw-standalone-search">地區</label>
              <input id="auping-tw-standalone-search" class="auping-tw-locator-input"
                     type="search" placeholder="例如：台北、台中、高雄"
                     autocomplete="postal-code" data-auping-tw-standalone-search>
              <p class="auping-tw-locator-status" role="status"
                 data-auping-tw-standalone-status>地圖預設顯示台灣全區。</p>
              <a class="auping-tw-locator-global-link"
                 href="https://www.auping.com/en/store-locator"
                 target="_blank" rel="noopener noreferrer"
                 data-auping-external-global-locator="true">Auping 全球門市（外部網站）</a>
            </div>
          </aside>
          <div class="auping-tw-locator-page__map">
            <iframe class="auping-tw-map-frame" title="Auping 台灣門市地圖"
                    loading="eager" referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen data-auping-tw-standalone-frame></iframe>
          </div>
        </section>
      </div>
    </main>"""
    shell = replace_main(shell, main)
    shell, _ = rewrite_locator_links(shell)
    return shell

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--payload", type=Path, required=True)
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    repo = args.repo.resolve()
    payload = args.payload.resolve()

    head = git(repo, "rev-parse", "HEAD")
    if head != BASELINE:
        raise SystemExit(f"Baseline mismatch: expected {BASELINE}, got {head}")

    changed = []
    for rel in ["assets/rc76/taiwan-store-locator.js", "assets/rc76/taiwan-store-locator.css"]:
        src, dst = payload / rel, repo / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        new = src.read_bytes()
        old = dst.read_bytes() if dst.exists() else None
        if old != new:
            dst.write_bytes(new)
            changed.append(rel)

    link_replacements = 0
    for path in sorted(repo.rglob("index.html")):
        if "store-locator" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        updated, count = rewrite_locator_links(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(repo).as_posix())
            link_replacements += count

    shell_path = repo / "beds/noble/index.html"
    local_page = repo / "store-locator/index.html"
    local_page.parent.mkdir(parents=True, exist_ok=True)
    generated = build_store_locator_page(shell_path.read_text(encoding="utf-8", errors="replace"))
    old = local_page.read_text(encoding="utf-8", errors="replace") if local_page.exists() else None
    if old != generated:
        local_page.write_text(generated, encoding="utf-8")
        changed.append("store-locator/index.html")

    routes_path = repo / "data/rc6-routes.json"
    routes = json.loads(routes_path.read_text(encoding="utf-8"))
    if not any(r.get("localPath") == "/store-locator/" for r in routes.get("routes", [])):
        routes["routes"].append({
            "id": "store-locator",
            "title": "尋找門市",
            "localPath": "/store-locator/",
            "mode": "LOCAL_BRIDGE",
            "reason": "RC7.6A.2 台灣本地門市入口；地圖以台灣為預設視角。"
        })
        routes["version"] = "2026-08-06-rc7.6a2-local-taiwan-store-locator"
        routes_path.write_text(json.dumps(routes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed.append("data/rc6-routes.json")

    report = {
        "schema": "AUPING-RC7.6A2-APPLY-V1",
        "baseline": BASELINE,
        "changedFileCount": len(dict.fromkeys(changed)),
        "changedFiles": list(dict.fromkeys(changed)),
        "localizedLocatorLinks": link_replacements,
        "localStoreLocator": "/store-locator/",
        "routeCount": len(routes.get("routes", []))
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())