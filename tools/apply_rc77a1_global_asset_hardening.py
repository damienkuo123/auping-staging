#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

BASELINE = "3c4d29fc41228683af3e468661c3d5ce5dbfc200"
SCHEMA = "AUPING-RC7.7A1-GLOBAL-ASSET-HARDENING-APPLY-V1"
SKIP_PARTS = {".git", "node_modules", "Auping_Parity_Reports", "dist", "build"}

ATTR_RE_TEMPLATE = r'(\s{attr}\s*=\s*)(["\'])(.*?)\2'
PICTURE_RE = re.compile(r"<picture\b[^>]*>.*?</picture\s*>", re.I | re.S)
TAG_RE = re.compile(r"<(?:img|source|link)\b[^>]*>", re.I | re.S)
FONT_PRELOAD_RE = re.compile(
    r'<link\b(?=[^>]*\brel\s*=\s*["\']preload["\'])(?=[^>]*\bas\s*=\s*["\']font["\'])[^>]*\bhref\s*=\s*["\'](?:https://damienkuo123\.github\.io)?/_next/static/media/[^"\']+["\'][^>]*>\s*',
    re.I | re.S,
)
LANG_ICON_PATTERNS = [
    re.compile(r'content\s*:\s*url\(\s*["\']?/icons/languages/EN_GB\.svg["\']?\s*\)', re.I),
    re.compile(r'content\s*:\s*url\(\s*["\']?https://damienkuo123\.github\.io/icons/languages/EN_GB\.svg["\']?\s*\)', re.I),
]
DESCRIPTOR_RE = re.compile(r"^(?:\d+(?:\.\d+)?[wx])$", re.I)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def copy_if_changed(src: Path, dst: Path) -> bool:
    data = src.read_bytes()
    if dst.is_file() and dst.read_bytes() == data:
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(data)
    return True


def get_attr(tag: str, name: str) -> str | None:
    pattern = re.compile(ATTR_RE_TEMPLATE.format(attr=re.escape(name)), re.I | re.S)
    match = pattern.search(tag)
    return html.unescape(match.group(3)) if match else None


def set_attr(tag: str, name: str, value: str) -> str:
    pattern = re.compile(ATTR_RE_TEMPLATE.format(attr=re.escape(name)), re.I | re.S)
    match = pattern.search(tag)
    if not match:
        return tag
    quote = match.group(2)
    encoded = value.replace("&", "&amp;") if "&amp;" in match.group(3) else value
    return tag[: match.start(3)] + encoded.replace(quote, f"&#{ord(quote)};") + tag[match.end(3) :]


def normalize_url(url: str, fallback_src: str | None = None) -> tuple[str, str | None]:
    raw = html.unescape(url.strip())
    if raw.startswith("/assets/"):
        return "/auping-staging" + raw, "project-base-assets"
    if raw.startswith("https://damienkuo123.github.io/assets/"):
        return raw.replace("https://damienkuo123.github.io/assets/", "/auping-staging/assets/", 1), "project-base-assets-absolute"
    if raw.startswith("/_next/image?"):
        if fallback_src:
            fallback = html.unescape(fallback_src.strip())
            if fallback.startswith("/auping-staging/"):
                return fallback, "next-image-to-local-src"
            if fallback.startswith("https://www.auping.com/") or fallback.startswith("https://api.auping.com/") or fallback.startswith("https://shop.auping.com/"):
                return fallback, "next-image-to-explicit-src"
        return "https://www.auping.com" + raw, "next-image-to-official"
    if raw.startswith("https://damienkuo123.github.io/_next/image?"):
        if fallback_src:
            fallback = html.unescape(fallback_src.strip())
            if fallback.startswith("/auping-staging/"):
                return fallback, "github-next-image-to-local-src"
            if fallback.startswith("https://www.auping.com/"):
                return fallback, "github-next-image-to-explicit-src"
        return raw.replace("https://damienkuo123.github.io/_next/image?", "https://www.auping.com/_next/image?", 1), "github-next-image-to-official"
    return raw, None


def normalize_srcset(value: str, fallback_src: str | None) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    out: list[str] = []
    for candidate in value.split(","):
        part = candidate.strip()
        if not part:
            continue
        bits = part.rsplit(None, 1)
        if len(bits) == 2 and DESCRIPTOR_RE.match(bits[1]):
            url, descriptor = bits
        else:
            url, descriptor = part, ""
        fixed, reason = normalize_url(url, fallback_src)
        if reason:
            counts[reason] = counts.get(reason, 0) + 1
        out.append(f"{fixed} {descriptor}".strip())
    return ", ".join(out), counts


def merge_counts(target: dict[str, int], source: dict[str, int]) -> None:
    for key, value in source.items():
        target[key] = target.get(key, 0) + value


def process_tag(tag: str, inherited_fallback: str | None = None) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    original = tag
    src = get_attr(tag, "src")
    href = get_attr(tag, "href")
    fallback = inherited_fallback or src or href

    for attr in ("src", "href"):
        value = get_attr(tag, attr)
        if value is None:
            continue
        fixed, reason = normalize_url(value, None)
        if reason and fixed != value:
            tag = set_attr(tag, attr, fixed)
            counts[reason] = counts.get(reason, 0) + 1
            if attr == "src":
                fallback = fixed
            elif not fallback:
                fallback = fixed

    for attr in ("srcset", "imagesrcset"):
        value = get_attr(tag, attr)
        if value is None:
            continue
        fixed, local_counts = normalize_srcset(value, fallback)
        if fixed != value:
            tag = set_attr(tag, attr, fixed)
        merge_counts(counts, local_counts)

    if tag != original:
        counts["tags-changed"] = counts.get("tags-changed", 0) + 1
    return tag, counts


def process_picture(match: re.Match[str]) -> str:
    block = match.group(0)
    img_match = re.search(r"<img\b[^>]*>", block, re.I | re.S)
    fallback = get_attr(img_match.group(0), "src") if img_match else None
    return TAG_RE.sub(lambda m: process_tag(m.group(0), fallback)[0], block)


def process_html(text: str) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    original = text

    text, removed_fonts = FONT_PRELOAD_RE.subn("", text)
    if removed_fonts:
        counts["broken-root-font-preloads-removed"] = removed_fonts

    for pattern in LANG_ICON_PATTERNS:
        text, n = pattern.subn("content:none", text)
        if n:
            counts["broken-language-icon-rules-removed"] = counts.get("broken-language-icon-rules-removed", 0) + n

    text = PICTURE_RE.sub(process_picture, text)

    def tag_repl(match: re.Match[str]) -> str:
        new_tag, local_counts = process_tag(match.group(0))
        merge_counts(counts, local_counts)
        return new_tag

    text = TAG_RE.sub(tag_repl, text)
    if text != original:
        counts["html-files-changed"] = 1
    return text, counts


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--payload", required=True)
    parser.add_argument("--report", default="audit/rc7.7/rc77a1_apply_report.json")
    args = parser.parse_args()

    repo = Path(args.repo).expanduser().resolve()
    payload = Path(args.payload).expanduser().resolve()
    changed_files: list[str] = []
    totals: dict[str, int] = {}

    payload_files = [
        "tools/apply_rc77a1_global_asset_hardening.py",
        "tools/validate_rc77a1_global_asset_hardening.py",
        "audit/rc7.7/RC77A1_GLOBAL_ASSET_HARDENING.md",
    ]
    for rel in payload_files:
        if copy_if_changed(payload / rel, repo / rel):
            changed_files.append(rel)

    for path in sorted(repo.rglob("*.html")):
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        rel = path.relative_to(repo).as_posix()
        original = path.read_text(encoding="utf-8")
        updated, counts = process_html(original)
        merge_counts(totals, counts)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed_files.append(rel)

    report = {
        "schema": SCHEMA,
        "baseline": BASELINE,
        "generatedAt": utc_now(),
        "changedFileCount": len(changed_files),
        "changedFiles": changed_files,
        "totals": totals,
        "storeLocatorPolicy": "LOCAL_PARITY_REQUIRED",
    }
    report_path = repo / args.report
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if report_path.relative_to(repo).as_posix() not in changed_files:
        changed_files.append(report_path.relative_to(repo).as_posix())
        report["changedFileCount"] = len(changed_files)
        report["changedFiles"] = changed_files
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
