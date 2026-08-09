#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import re
import subprocess

NOA_PAGES = [
    "beds/noa-chocolate-brown-oak/index.html",
    "beds/noa-midnight-black-oak/index.html",
    "beds/noa-soft-white-oak/index.html",
]

FORBIDDEN_COMMON = [
    'aria-label="Close"',
    'aria-label="Back"',
    'aria-label="Next slide"',
    'aria-label="Previous slide"',
    'aria-label="primary"',
    'aria-label="secondary"',
    'aria-label="breadcrumbs"',
    'title="Head home"',
    'title="A JavaScript library for interactive maps"',
    '>Read more<',
    '>More Info<',
    '>Contact us<',
    '>Do you need us?<',
    '>Do you live outside of the Netherlands?<',
]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repo")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()

    failures = []
    stats = {
        "htmlFileCount": 0,
        "wrongLangCount": 0,
        "forbiddenCommonCount": 0,
        "noaPageCount": 0,
        "localNoaAssetCount": 0,
    }

    for path in sorted(repo.rglob("*.html")):
        rel_parts = path.relative_to(repo).parts
        if any(part in {".git", "node_modules", "audit", "tools"} for part in rel_parts):
            continue
        stats["htmlFileCount"] += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        match = re.search(r"<html\b[^>]*\blang=[\"']([^\"']+)", text, re.I)
        lang = match.group(1) if match else ""
        if lang != "zh-Hant-TW":
            stats["wrongLangCount"] += 1
            failures.append(f"{path.relative_to(repo)} lang={lang or '(missing)'}")
        for phrase in FORBIDDEN_COMMON:
            count = text.count(phrase)
            if count:
                stats["forbiddenCommonCount"] += count
                failures.append(f"{path.relative_to(repo)} 保留 {phrase!r} x{count}")

    for rel in NOA_PAGES:
        path = repo / rel
        if not path.is_file():
            failures.append(f"缺少 Noa 頁面：{rel}")
            continue
        stats["noaPageCount"] += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        required = [
            "RC78A1_NOA_PRE_START",
            "RC78A1_NOA_POST_START",
            "為什麼選擇這款 Noa？",
            "目前展示組合包含",
            "Noa 的設計",
            "Noa 配件",
            "選擇適合您的床墊",
            "更多 Noa 款式",
            "/auping-staging/assets/rc78/noa/",
        ]
        for token in required:
            if token not in text:
                failures.append(f"{rel} 缺少 {token}")

        pre_block = re.search(
            r"<!-- RC78A1_NOA_PRE_START -->(.*?)<!-- RC78A1_NOA_PRE_END -->",
            text,
            re.S,
        )
        post_block = re.search(
            r"<!-- RC78A1_NOA_POST_START -->(.*?)<!-- RC78A1_NOA_POST_END -->",
            text,
            re.S,
        )
        if not pre_block or not post_block:
            failures.append(f"{rel} 找不到完整 RC78A1 區塊")
        else:
            injected = pre_block.group(1) + post_block.group(1)
            if "https://api.auping.com" in injected or "https://shop.auping.com" in injected:
                failures.append(f"{rel} 新增內容仍使用遠端商品圖片")

    asset_dir = repo / "assets/rc78/noa"
    if not asset_dir.is_dir():
        failures.append("缺少 assets/rc78/noa")
    else:
        for path in asset_dir.iterdir():
            if not path.is_file():
                continue
            stats["localNoaAssetCount"] += 1
            data = path.read_bytes()
            if len(data) < 5000:
                failures.append(f"資產過小：{path.relative_to(repo)}")
            if not (
                data.startswith(b"\xff\xd8\xff")
                or data.startswith(b"\x89PNG\r\n\x1a\n")
            ):
                failures.append(f"資產格式異常：{path.relative_to(repo)}")

    route_path = repo / "data/rc6-routes.json"
    if not route_path.is_file():
        failures.append("缺少 data/rc6-routes.json")
    else:
        routes = json.loads(route_path.read_text(encoding="utf-8"))["routes"]
        store = next(
            (route for route in routes if route.get("id") == "service-store-locator"),
            None,
        )
        if not store or store.get("mode") != "LOCAL_PARITY":
            failures.append("Store Locator 不是 LOCAL_PARITY")
        bed_linen = next(
            (route for route in routes if route.get("id") == "bed-linen"),
            None,
        )
        if bed_linen and bed_linen.get("title") != "寢具":
            failures.append("bed-linen 路由標題不是「寢具」")

    diffcheck = subprocess.run(
        ["git", "diff", "--check"],
        cwd=repo,
        text=True,
        capture_output=True,
    )
    if diffcheck.returncode:
        failures.append(
            "git diff --check failed：" + diffcheck.stdout + diffcheck.stderr
        )

    report = {
        "schema": "AUPING-RC7.8A1-NOA-ZHTW-FOUNDATION-VALIDATION-V1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "passed": not failures,
        "failureCount": len(failures),
        "failures": failures,
        "stats": stats,
        "scopeLimit": "共通繁中基礎＋3 個 Noa 頁；各頁長篇英文正文仍須後續分批翻譯。",
        "policyLocks": {
            "storeLocator": "LOCAL_PARITY_REQUIRED",
            "traditionalChineseRequired": True,
        },
    }
    output = repo / "audit/rc7.8/rc78a1_validation_report.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)

if __name__ == "__main__":
    main()
