#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse
import hashlib
import json
import re
import shutil

BASELINE = "4dc8b98fd51fb62c87d266302d149a61f95139a9"

COMMON_REPLACEMENTS = {
    'lang="zh-Hant"': 'lang="zh-Hant-TW"',
    "lang='zh-Hant'": "lang='zh-Hant-TW'",

    'aria-label="Close"': 'aria-label="關閉"',
    "aria-label='Close'": "aria-label='關閉'",
    'aria-label="Back"': 'aria-label="返回"',
    "aria-label='Back'": "aria-label='返回'",
    'aria-label="Next slide"': 'aria-label="下一張"',
    "aria-label='Next slide'": "aria-label='下一張'",
    'aria-label="Previous slide"': 'aria-label="上一張"',
    "aria-label='Previous slide'": "aria-label='上一張'",
    'aria-label="next"': 'aria-label="下一個"',
    "aria-label='next'": "aria-label='下一個'",
    'aria-label="previous"': 'aria-label="上一個"',
    "aria-label='previous'": "aria-label='上一個'",
    'aria-label="primary"': 'aria-label="主要導覽"',
    "aria-label='primary'": "aria-label='主要導覽'",
    'aria-label="secondary"': 'aria-label="次要導覽"',
    "aria-label='secondary'": "aria-label='次要導覽'",
    'aria-label="breadcrumbs"': 'aria-label="麵包屑導覽"',
    "aria-label='breadcrumbs'": "aria-label='麵包屑導覽'",
    'aria-label="Submit"': 'aria-label="送出"',
    "aria-label='Submit'": "aria-label='送出'",
    'aria-label="Select..."': 'aria-label="請選擇"',
    "aria-label='Select...'": "aria-label='請選擇'",
    'aria-label="Zoom in"': 'aria-label="放大"',
    'aria-label="Zoom out"': 'aria-label="縮小"',
    'aria-label="Keyboard shortcuts"': 'aria-label="鍵盤快速鍵"',

    'title="Head home"': 'title="回到首頁"',
    "title='Head home'": "title='回到首頁'",
    'title="Zoom in"': 'title="放大"',
    'title="Zoom out"': 'title="縮小"',
    'title="A JavaScript library for interactive maps"': 'title="互動式地圖函式庫"',
    'title="Find a store"': 'title="尋找門市"',
    'title="Configure your own bed"': 'title="自行搭配床架"',
    'title="Configure your own box spring"': 'title="自行搭配床組"',

    'alt="As Auping we envision a global economy that uses business as a force for good."':
        'alt="Auping B 型企業認證標章"',
    'alt="Find a store"': 'alt="尋找門市"',
    'alt="Box springs"': 'alt="Box Springs 床組"',
    'alt="Original box"': 'alt="Original 床組"',
    'alt="Beds"': 'alt="床架"',
    'alt="Mattresses"': 'alt="床墊"',
    'alt="Toppers"': 'alt="舒適墊"',
    'alt="Bed bases"': 'alt="床底"',
    'alt="Pillows"': 'alt="枕頭"',
    'alt="Bed linen"': 'alt="寢具"',
    'alt="Duvet covers"': 'alt="被套"',
    'alt="Duvets"': 'alt="棉被"',
    'alt="Fitted sheets"': 'alt="包覆式床包"',
    'alt="Mattress protectors"': 'alt="保潔墊"',
    'alt="Bedspreads"': 'alt="床罩"',
    'alt="Pillow cases"': 'alt="枕套"',
    'alt="Flat bed base"': 'alt="固定式床底"',
    'alt="Manually adjustable bed base"': 'alt="手動可調式床底"',
    'alt="Electrically adjustable bed base 1M"': 'alt="電動可調式床底 1M"',
    'alt="Electrically adjustable bed base 2M"': 'alt="電動可調式床底 2M"',
    'alt="Electrically adjustable bed base 3M"': 'alt="電動可調式床底 3M"',
    'alt="Comfort mattress topper"': 'alt="Comfort 舒適墊"',
    'alt="Deluxe mattress topper"': 'alt="Deluxe 舒適墊"',
    'alt="Prestige mattress topper"': 'alt="Prestige 舒適墊"',
    'alt="Auping box spring"': 'alt="Auping Box Springs 床組"',
    'alt="Auping Criade box spring"': 'alt="Auping Criade 床組"',
    'alt="Auping Kiruna box spring"': 'alt="Auping Kiruna 床組"',
    'alt="Spiraalbodem vlak"': 'alt="固定式網狀床底"',
    'alt="icon_sustainability"': 'alt="永續圖示"',
    'alt="auronde_warm_grey"': 'alt="Auronde 暖灰色"',
    'alt="Auping Inizio 1persoons matras"': 'alt="Auping Inizio 單人床墊"',
    'alt="Hoofdbord Soft white oak Noa"': 'alt="Noa 柔白橡木床頭板"',
    'alt="noa_mid.jpg"': 'alt="Noa 午夜黑橡木腳輪細節"',
    'alt="10_detail.jpg"': 'alt="Noa 午夜黑橡木細節"',
    'alt="noa_table_600.png"': 'alt="Noa 床邊桌"',

    '>Contact us<': '>聯絡我們<',
    '>Cookie Policy<': '>Cookie 政策<',
    '>Do you live outside of the Netherlands?<': '>您居住在荷蘭以外的地區嗎？<',
    '>Do you need us?<': '>需要我們協助嗎？<',
    '>Manuals<': '>使用手冊<',
    '>More from Auping<': '>更多 Auping 內容<',
    '>Privacy<': '>隱私權<',
    '>Products<': '>產品<',
    '>Service &amp; Contact<': '>服務與聯絡<',
    '>Service & Contact<': '>服務與聯絡<',
    '>Smart Base support<': '>智慧床底支援<',
    '>Stores<': '>門市<',
    '>Terms &amp; Conditions<': '>條款與細則<',
    '>Terms & Conditions<': '>條款與細則<',
    '>Warranty<': '>保固<',
    '>Read more<': '>閱讀更多<',
    '>Read More<': '>閱讀更多<',
    '>More Info<': '>更多資訊<',
    '>Find a store<': '>尋找門市<',
    '>Build your own<': '>自行搭配<',
    '>View all specifications<': '>查看所有規格<',
    '>More of Auping<': '>更多 Auping 內容<',
    '>More Box Springs 床組 床組 from Auping<': '>更多 Auping Box Springs 床組<',
    '>More Criade Box Springs 床組 床組<': '>更多 Criade Box Springs 床組<',
    '>More Kiruna Box Springs 床組 床組<': '>更多 Kiruna Box Springs 床組<',
    '>配件 for your Criade Box Springs 床組<': '>Criade Box Springs 床組配件<',

    'Contact Customer Service in one of our other office. See contact details':
        '請透過台灣門市頁面聯絡鄰近門市，由門市人員為您提供協助。',
    'You can reach us every business day between 08:30 – 17:00 at the telephone number +31 570 681820 or send an email to':
        '請前往台灣門市頁面，聯絡鄰近門市取得協助。',
}

def validate_cached_asset(source: Path, expected_url: str) -> dict:
    if not source.is_file():
        raise RuntimeError(f"缺少已下載資產：{source.name}")
    data = source.read_bytes()
    if len(data) < 5000:
        raise RuntimeError(f"下載檔案過小：{source.name}（{len(data)} bytes）")
    is_jpeg = data.startswith(b"\xff\xd8\xff")
    is_png = data.startswith(b"\x89PNG\r\n\x1a\n")
    if not (is_jpeg or is_png):
        raise RuntimeError(f"下載結果不是 JPEG/PNG：{source.name}")
    return {
        "url": expected_url,
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "type": "png" if is_png else "jpeg",
    }

def replace_metadata(text: str, title: str, description: str) -> str:
    text = re.sub(
        r"<title>.*?</title>",
        f"<title>{title}</title>",
        text,
        count=1,
        flags=re.I | re.S,
    )
    items = [
        ("name", "description", description),
        ("property", "og:title", title),
        ("property", "og:description", description),
        ("name", "twitter:title", title),
        ("name", "twitter:description", description),
    ]
    for attr, key, value in items:
        pattern = rf"<meta\b(?=[^>]*\b{attr}=[\"']{re.escape(key)}[\"'])[^>]*>"
        replacement = f'<meta {attr}="{key}" content="{value}"/>'
        if re.search(pattern, text, flags=re.I):
            text = re.sub(pattern, replacement, text, count=1, flags=re.I)
        else:
            text = text.replace("</head>", replacement + "</head>", 1)
    return text

def find_section_bounds(text: str, heading: str):
    heading_match = re.search(rf">{re.escape(heading)}</h2>", text)
    if not heading_match:
        return None
    start = text.rfind("<section", 0, heading_match.start())
    if start < 0:
        return None
    tag_re = re.compile(r"<section\b|</section\s*>", re.I)
    depth = 0
    for tag in tag_re.finditer(text, start):
        if tag.group(0).lower().startswith("<section"):
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return start, tag.end()
    return None

def combo_card(item) -> str:
    label, value, image, alt = item
    return f"""<article class="rc78-noa-card">
<img src="/auping-staging/assets/rc78/noa/{image}" alt="{alt}" loading="lazy" decoding="async"/>
<div class="rc78-noa-card__body">
<p class="rc78-noa-card__label">{label}</p>
<p class="rc78-noa-card__value">{value}</p>
</div></article>"""

def build_pre(config: dict) -> str:
    combo = "".join(combo_card(item) for item in config["combo"])
    life = "".join(
        f'<img src="/auping-staging/assets/rc78/noa/{image}" alt="{alt}" loading="lazy" decoding="async"/>'
        for image, alt in config["life"]
    )
    return f"""<!-- RC78A1_NOA_PRE_START -->
<div class="rc78-noa-content" data-rc78-noa="{config['id']}">
<section class="rc78-noa-block"><div class="rc78-noa-shell">
<p class="rc78-noa-eyebrow">{config['subtitle']}</p>
<h2>為什麼選擇這款 Noa？</h2>
<p class="rc78-noa-lead">{config['why']}</p>
</div></section>
<section class="rc78-noa-block rc78-noa-block--soft"><div class="rc78-noa-shell">
<h2>目前展示組合包含</h2>
<div class="rc78-noa-combo">{combo}</div>
</div></section>
<section class="rc78-noa-block"><div class="rc78-noa-shell">
<div class="rc78-noa-life">{life}</div>
</div></section>
<section class="rc78-noa-block rc78-noa-block--soft"><div class="rc78-noa-shell rc78-noa-split">
<div><p class="rc78-noa-eyebrow">丹麥設計</p><h2>Noa 的設計</h2></div>
<div><p>Noa 由丹麥設計師 Eva Harlou 設計。經典的斯堪地那維亞風格帶來平靜、簡潔的感受，也能自然融入不同臥室。床架採用高強度山毛櫸木，兼具耐用性與長久使用價值。</p>
<div class="rc78-noa-actions"><a class="rc78-noa-button rc78-noa-button--secondary" href="/auping-staging/beds/noa/">查看 Noa 系列</a></div></div>
</div></section>
</div>
<!-- RC78A1_NOA_PRE_END -->"""

def build_post(config: dict) -> str:
    accessories = [
        ("accessory-chocolate.jpg", "Noa 巧克力棕橡木配件"),
        ("accessory-daybed.jpg", "Noa Daybed"),
        ("accessory-table.png", "Noa 床邊桌"),
        ("accessory-balanced.jpg", "Noa 開放式柵板床頭板"),
    ]
    accessory_html = "".join(
        f'<img src="/auping-staging/assets/rc78/noa/{image}" alt="{alt}" loading="lazy" decoding="async"/>'
        for image, alt in accessories
    )
    related = [
        ("/auping-staging/beds/noa-chocolate-brown-oak/", "/auping-staging/assets/light-catalog/images/36237955bc105734cb098dc94bbb.webp", "Noa 巧克力棕橡木"),
        ("/auping-staging/beds/noa-midnight-black-oak/", "/auping-staging/assets/light-catalog/images/8a078178d95e821c25f38db17780.webp", "Noa 午夜黑橡木"),
        ("/auping-staging/beds/noa-soft-white-oak/", "/auping-staging/assets/light-catalog/images/ec550287db70a63e8f744f581f2a.webp", "Noa 柔白橡木"),
        ("/auping-staging/beds/noa-balanced-oak/", "/auping-staging/assets/light-catalog/images/285e04b6296db8aeade7f74f34fd.webp", "Noa 平衡橡木"),
    ]
    related_html = "".join(
        f'<a href="{href}"><img src="{src}" alt="{label}" loading="lazy" decoding="async"/><span>{label}</span></a>'
        for href, src, label in related
    )
    return f"""<!-- RC78A1_NOA_POST_START -->
<div class="rc78-noa-content" data-rc78-noa-after-spec="{config['id']}">
<section class="rc78-noa-block"><div class="rc78-noa-shell">
<h2>Noa 配件</h2>
<p>可搭配實心或開放式柵板床頭板、Noa 床邊桌，並依喜好選擇床腳或腳輪，打造適合臥室與生活方式的完整組合。</p>
<div class="rc78-noa-accessories">{accessory_html}</div>
</div></section>
<section class="rc78-noa-block rc78-noa-block--soft"><div class="rc78-noa-shell rc78-noa-split">
<div><p class="rc78-noa-eyebrow">睡眠舒適度</p><h2>選擇適合您的床墊</h2></div>
<div><p>{config['mattress']}</p>
<div class="rc78-noa-actions">
<a class="rc78-noa-button" href="/auping-staging/mattresses/">查看床墊</a>
<a class="rc78-noa-button rc78-noa-button--secondary" href="/auping-staging/store-locator/">尋找台灣門市</a>
</div></div></div></section>
<section class="rc78-noa-block"><div class="rc78-noa-shell">
<h2>更多 Auping 床架</h2>
<p>Auping 床架可依顏色、材質、床頭板與配件進行搭配。探索其他床架系列，尋找適合臥室風格與睡眠需求的組合。</p>
<div class="rc78-noa-actions">
<a class="rc78-noa-button" href="/auping-staging/beds/">查看所有床架</a>
<a class="rc78-noa-button rc78-noa-button--secondary" href="/auping-staging/box-springs/">查看 Box Springs 床組</a>
</div></div></section>
<section class="rc78-noa-block rc78-noa-block--soft"><div class="rc78-noa-shell">
<h2>更多 Noa 款式</h2>
<p>以下款式皆可在本站查看，並可前往台灣門市了解實際材質、顏色與搭配選項。</p>
<div class="rc78-noa-related">{related_html}</div>
</div></section>
</div>
<!-- RC78A1_NOA_POST_END -->"""

def apply_common(text: str, counters: dict) -> str:
    for old, new in COMMON_REPLACEMENTS.items():
        count = text.count(old)
        if count:
            counters[old] = counters.get(old, 0) + count
            text = text.replace(old, new)
    text = re.sub(
        r'alt="(?:17|18|19|20|26|27)_auronde_warm_grey_?"',
        'alt="Auronde 暖灰色情境圖"',
        text,
    )
    return text

def modify_noa(text: str, config: dict, counters: dict) -> str:
    text = re.sub(
        r"<!-- RC78A1_NOA_PRE_START -->.*?<!-- RC78A1_NOA_PRE_END -->",
        "",
        text,
        flags=re.S,
    )
    text = re.sub(
        r"<!-- RC78A1_NOA_POST_START -->.*?<!-- RC78A1_NOA_POST_END -->",
        "",
        text,
        flags=re.S,
    )
    text = apply_common(text, counters)
    text = text.replace("Noa 柔白 橡木", "Noa 柔白橡木")
    text = replace_metadata(text, config["pageTitle"], config["description"])

    css_link = '<link rel="stylesheet" href="/auping-staging/assets/rc78-noa-zhtw.css?v=20260809-rc78a1"/>'
    if "assets/rc78-noa-zhtw.css" not in text:
        text = text.replace("</head>", css_link + "</head>", 1)

    bounds = find_section_bounds(text, "規格")
    pre = build_pre(config)
    post = build_post(config)
    if bounds:
        start, end = bounds
        return text[:start] + pre + text[start:end] + post + text[end:]

    main_end = text.rfind("</main>")
    if main_end < 0:
        raise RuntimeError("找不到規格 section 或 </main>")
    return text[:main_end] + pre + post + text[main_end:]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repo")
    parser.add_argument("payload")
    parser.add_argument("asset_cache")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    payload = Path(args.payload).resolve()
    asset_cache = Path(args.asset_cache).resolve()
    manifest = json.loads((payload / "noa_manifest.json").read_text(encoding="utf-8"))

    changed = []
    replacement_counts = {}
    download_report = {}

    with TemporaryDirectory(prefix="auping-rc78a1-") as temp_name:
        temp = Path(temp_name)
        for filename, url in manifest["assets"].items():
            cached = asset_cache / filename
            download_report[filename] = validate_cached_asset(cached, url)
            shutil.copy2(cached, temp / filename)

        pending_text = {}

        # Build every text transformation in memory first.
        for path in sorted(repo.rglob("*.html")):
            rel_parts = path.relative_to(repo).parts
            if any(part in {".git", "node_modules", "audit", "tools"} for part in rel_parts):
                continue
            original = path.read_text(encoding="utf-8", errors="ignore")
            transformed = apply_common(original, replacement_counts)
            if transformed != original:
                pending_text[path] = transformed

        for rel in [
            "data/rc6-routes.json",
            "data/rc6-search-index.json",
            "data/rc6-products.json",
        ]:
            path = repo / rel
            if not path.is_file():
                continue
            original = path.read_text(encoding="utf-8")
            transformed = original.replace('"Bed Linen"', '"寢具"')
            if transformed != original:
                pending_text[path] = transformed

        for rel, config in manifest["pages"].items():
            path = repo / rel
            if not path.is_file():
                raise RuntimeError(f"缺少 Noa 頁面：{rel}")
            source = pending_text.get(
                path,
                path.read_text(encoding="utf-8", errors="ignore"),
            )
            transformed = modify_noa(source, config, replacement_counts)
            pending_text[path] = transformed

        # Only mutate the Repo after all downloads and transformations succeed.
        for path, transformed in pending_text.items():
            path.write_text(transformed, encoding="utf-8")
            changed.append(str(path.relative_to(repo)))

        asset_dir = repo / "assets/rc78/noa"
        asset_dir.mkdir(parents=True, exist_ok=True)
        for filename in manifest["assets"]:
            shutil.copy2(temp / filename, asset_dir / filename)

    css_target = repo / "assets/rc78-noa-zhtw.css"
    shutil.copy2(payload / "assets/rc78-noa-zhtw.css", css_target)

    changed.extend(
        ["assets/rc78-noa-zhtw.css"]
        + [f"assets/rc78/noa/{name}" for name in manifest["assets"]]
    )

    report = {
        "schema": "AUPING-RC7.8A1-NOA-ZHTW-FOUNDATION-APPLY-V1",
        "baseline": BASELINE,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "changedFileCount": len(set(changed)),
        "changedFiles": sorted(set(changed)),
        "downloadedAssetCount": len(download_report),
        "downloadedAssets": download_report,
        "commonReplacementCounts": replacement_counts,
        "noaPages": list(manifest["pages"]),
        "policyLocks": {
            "storeLocator": "LOCAL_PARITY_REQUIRED",
            "noPlaceholderMedia": True,
            "noGuessedAssets": True,
            "desktopAndMobileEqualQuality": True,
            "traditionalChineseRequired": True,
        },
    }
    report_path = repo / "audit/rc7.8/rc78a1_apply_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
