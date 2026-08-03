#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, Iterable

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(sys.argv[1]).resolve()
PKG = Path(__file__).resolve().parent.parent
I18N = json.loads((ROOT / 'assets/i18n-zh-tw.json').read_text(encoding='utf-8'))
EXACT: Dict[str, str] = I18N['exact']
LONG: Dict[str, str] = I18N['long']
TITLES: Dict[str, str] = I18N['titles']

ROUTES = [
    'en/index.html',
    'en/box-springs/index.html',
    'en/beds/index.html',
    'en/mattresses/index.html',
    'en/toppers/index.html',
    'en/bed-bases/index.html',
    'en/bed-linen/index.html',
    'en/bed-linen/pillows/index.html',
    'en/news/index.html',
    'en/mattresses/elysium-mattress/index.html',
    'en/bed-linen/duvet-covers/playful-bricks-duvet-cover/index.html',
    'en/about-auping/index.html',
    'en/customer-service/index.html',
]

MIRRORED = {
    '/', '/box-springs', '/beds', '/mattresses', '/toppers', '/bed-bases', '/bed-linen',
    '/bed-linen/pillows', '/news', '/about-auping', '/customer-service',
    '/mattresses/elysium-mattress', '/bed-linen/duvet-covers/playful-bricks-duvet-cover'
}

ASSET_STYLE = '<link rel="stylesheet" href="/auping-staging/assets/rc3-final.css" data-auping-rc3="style">\n'
EN_SEARCH_TAG = '<script src="/auping-staging/assets/search-index.js" defer data-auping-rc3="en-search"></script>\n'
ZH_SEARCH_TAG = '<script src="/auping-staging/assets/search-index-zh-tw.js" defer data-auping-rc3="zh-search"></script>\n'
RC3_SCRIPT = '<script src="/auping-staging/assets/rc3-final.js" defer data-auping-rc3="runtime"></script>\n'



def normalized(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def route_from_file(rel: str) -> str:
    route = '/' + rel.removeprefix('en/').removesuffix('/index.html').removesuffix('index.html').strip('/')
    return route if route != '/' else '/'


def ensure_runtime_tags(text: str, zh: bool = False) -> str:
    tags = []
    if 'data-auping-rc3="style"' not in text:
        tags.append(ASSET_STYLE)
    if 'data-auping-rc3="en-search"' not in text and 'assets/search-index.js' not in text:
        tags.append(EN_SEARCH_TAG)
    if zh and 'data-auping-rc3="zh-search"' not in text:
        tags.append(ZH_SEARCH_TAG)
    if 'data-auping-rc3="runtime"' not in text:
        tags.append(RC3_SCRIPT)
    if tags:
        text = text.replace('</head>', ''.join(tags) + '</head>', 1)
    return text


def add_alternates(text: str, route: str, current_lang: str) -> str:
    route_suffix = '' if route == '/' else route
    en_href = f'/auping-staging/en{route_suffix}/'.replace('//', '/')
    zh_href = f'/auping-staging/zh-tw{route_suffix}/'.replace('//', '/')
    block = (
        f'\n<link data-auping-rc3-alt="true" rel="alternate" hreflang="en" href="{en_href}">'
        f'\n<link data-auping-rc3-alt="true" rel="alternate" hreflang="zh-Hant" href="{zh_href}">'
        f'\n<link data-auping-rc3-alt="true" rel="alternate" hreflang="x-default" href="{en_href}">\n'
    )
    if 'data-auping-rc3-alt="true"' not in text:
        text = text.replace('</head>', block + '</head>', 1)
    return text


def set_elysium_defaults(soup: BeautifulSoup) -> None:
    defaults = {'490': '70 cm', '491': '200 cm', '498': 'Y', '493': 'Medium'}
    for name, wanted in defaults.items():
        select = soup.find('select', attrs={'name': name})
        if not select:
            continue
        for option in select.find_all('option'):
            option.attrs.pop('selected', None)
            if normalized(option.get_text()) == wanted:
                option['selected'] = 'selected'


def translate_value(value: str) -> str:
    key = normalized(value)
    if key in LONG:
        return LONG[key]
    if key in EXACT:
        return EXACT[key]
    # Conservative phrase-level substitutions for mixed strings.
    result = value
    replacements = [
        ('Find a store', '尋找門市'), ('Read More', '閱讀更多'), ('Read more', '閱讀更多'),
        ('More Info', '更多資訊'), ('Product variant', '商品款式'), ('Duvet Cover', '被套'),
        ('Mattress', '床墊'), ('Bed linen', '寢具'), ('Box springs', 'Box Springs 床組'),
        ('Bed bases', '床底'), ('Pillows', '枕頭'), ('Customer Service', '客戶服務'),
    ]
    for source, target in replacements:
        result = result.replace(source, target)
    return result


def translate_soup(soup: BeautifulSoup) -> None:
    if soup.html:
        soup.html['lang'] = 'zh-Hant'
    if soup.title:
        title = normalized(soup.title.get_text())
        soup.title.string = TITLES.get(title, translate_value(title))
    for meta in soup.find_all('meta'):
        if meta.get('name') in {'description', 'twitter:description'} or meta.get('property') in {'og:description', 'og:title'}:
            if meta.get('content'):
                meta['content'] = translate_value(meta['content'])

    blocked = {'script', 'style', 'noscript', 'svg', 'code', 'pre'}
    for node in list(soup.find_all(string=True)):
        if not isinstance(node, NavigableString):
            continue
        parent = node.parent
        if parent is None or parent.name in blocked:
            continue
        raw = str(node)
        key = normalized(raw)
        if not key:
            continue
        translated = LONG.get(key) or EXACT.get(key)
        if translated is None:
            continue
        leading = raw[: len(raw) - len(raw.lstrip())]
        trailing = raw[len(raw.rstrip()):]
        node.replace_with(leading + translated + trailing)

    for el in soup.find_all(['h1','h2','h3','h4']):
        key = normalized(el.get_text(' ', strip=True))
        if key in EXACT:
            el.clear()
            el.append(EXACT[key])


def clean_internal_path(href: str) -> str | None:
    if not href or href.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
        return None
    if href.startswith('http://') or href.startswith('https://'):
        return None
    path = href.split('?', 1)[0].split('#', 1)[0]
    path = re.sub(r'^/auping-staging', '', path)
    path = re.sub(r'^/en(?=/|$)', '', path)
    path = re.sub(r'^/zh-tw(?=/|$)', '', path)
    aliases = {
        '/box-springs': '/box-springs', '/beds': '/beds', '/mattresses': '/mattresses',
        '/mattress-toppers': '/toppers', '/toppers': '/toppers', '/bed-bases': '/bed-bases',
        '/pillows': '/bed-linen/pillows', '/bed-linen': '/bed-linen', '/news': '/news',
        '/about-auping': '/about-auping', '/customer-service': '/customer-service',
    }
    normalized_path = '/' + path.strip('/') if path.strip('/') else '/'
    return aliases.get(normalized_path, normalized_path)


def rewrite_links_for_zh(soup: BeautifulSoup) -> None:
    for el in soup.find_all('a', href=True):
        href = el.get('href', '')
        path = clean_internal_path(href)
        if path is None:
            continue
        query = ('?' + href.split('?', 1)[1]) if '?' in href else ''
        fragment = ('#' + href.split('#', 1)[1]) if '#' in href else ''
        if path in MIRRORED:
            suffix = '' if path == '/' else path
            el['href'] = f'/auping-staging/zh-tw{suffix}/{query}{fragment}'.replace('//?', '/?')
        else:
            el['data-auping-language-fallback'] = 'en'


def create_zh_page(source: Path, destination: Path, route: str) -> None:
    soup = BeautifulSoup(source.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    set_elysium_defaults(soup)
    for old in soup.select('link[data-auping-rc3-alt]'):
        old.decompose()
    translate_soup(soup)
    rewrite_links_for_zh(soup)
    text = str(soup)
    text = ensure_runtime_tags(text, zh=True)
    text = add_alternates(text, route, 'zh-Hant')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(text, encoding='utf-8')


def patch_english_page(path: Path, route: str) -> None:
    text = path.read_text(encoding='utf-8', errors='ignore')
    text = ensure_runtime_tags(text, zh=False)
    text = add_alternates(text, route, 'en')
    if path.as_posix().endswith('/mattresses/elysium-mattress/index.html'):
        soup = BeautifulSoup(text, 'html.parser')
        set_elysium_defaults(soup)
        text = str(soup)
    path.write_text(text, encoding='utf-8')


def translate_search_title(title: str) -> str:
    value = TITLES.get(normalized(title), EXACT.get(normalized(title), title))
    for source, target in [
        ('Box springs', 'Box Springs 床組'), ('Beds', '床架'), ('Mattresses', '床墊'),
        ('Toppers', '床墊舒適層'), ('Bed bases', '床底'), ('Bed linen', '寢具'),
        ('Pillows', '枕頭'), ('News', '最新消息'), ('About Auping', '關於 Auping'),
        ('Customer Service', '客戶服務'), ('Duvet Cover', '被套'), ('Mattress', '床墊')
    ]:
        value = value.replace(source, target)
    return value


def build_zh_search_index() -> None:
    source = ROOT / 'assets/search-index.js'
    output = ROOT / 'assets/search-index-zh-tw.js'
    if not source.is_file():
        output.write_text('window.AUPING_ZH_SEARCH_INDEX=[];\n', encoding='utf-8')
        return
    raw = source.read_text(encoding='utf-8', errors='ignore').strip()
    raw = re.sub(r'^window\.AUPING_SEARCH_INDEX\s*=\s*', '', raw)
    raw = raw[:-1] if raw.endswith(';') else raw
    data = json.loads(raw)
    localized = []
    for item in data:
        url = item.get('url', '')
        clean = re.sub(r'^/en(?=/|$)', '', url).rstrip('/') or '/'
        if clean not in MIRRORED:
            continue
        new = dict(item)
        new['title'] = translate_search_title(item.get('title', ''))
        new['url'] = '/zh-tw' + ('' if clean == '/' else clean)
        text = item.get('text', '')
        new['text'] = LONG.get(normalized(text), translate_value(text[:260]))
        localized.append(new)
    output.write_text('window.AUPING_ZH_SEARCH_INDEX=' + json.dumps(localized, ensure_ascii=False) + ';\n', encoding='utf-8')


def create_zh_redirect() -> None:
    target = ROOT / 'zh/index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/auping-staging/zh-tw/"><link rel="canonical" href="/auping-staging/zh-tw/"><title>Auping 繁體中文</title></head><body><a href="/auping-staging/zh-tw/">前往 Auping 繁體中文網站</a></body></html>''', encoding='utf-8')


def main() -> None:
    missing = [rel for rel in ROUTES if not (ROOT / rel).is_file()]
    if missing:
        raise SystemExit('Missing target pages:\n' + '\n'.join(missing))

    core_paths = set()
    for rel in ROUTES:
        source = ROOT / rel
        core_paths.add(source.resolve())
        route = route_from_file(rel)
        patch_english_page(source, route)
        zh_rel = rel.replace('en/', 'zh-tw/', 1)
        create_zh_page(source, ROOT / zh_rel, route)

    generated_count = 0
    for product_page in (ROOT / 'en').rglob('*.html'):
        if product_page.resolve() in core_paths:
            continue
        raw = product_page.read_text(encoding='utf-8', errors='ignore')
        if 'generated-product-hero' not in raw:
            continue
        product_page.write_text(ensure_runtime_tags(raw, zh=False), encoding='utf-8')
        generated_count += 1

    build_zh_search_index()
    create_zh_redirect()

    scope = {
        'version': '2026-08-04-rc3',
        'target': 'Level 2.5 Hybrid + Traditional Chinese',
        'english_routes': [route_from_file(rel) for rel in ROUTES],
        'chinese_base': '/zh-tw/',
        'deep_page_fallback': 'English/local or official Auping',
    }
    (ROOT / 'assets/zh-tw-scope.json').write_text(json.dumps(scope, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'PASS patched English Level 2.5 pages: {len(ROUTES)}')
    print(f'PASS generated Traditional Chinese pages: {len(ROUTES)}')
    print(f'PASS upgraded generated English product pages: {generated_count}')
    print('PASS generated Traditional Chinese search index')
    print('PASS Elysium default product options')
    print('PASS RC3 filter/search/news/product-template runtime links')


if __name__ == '__main__':
    main()
