#!/usr/bin/env python3
"""RC7.5 browser gate for the two approved combobox vertical slices."""
from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

PAGES = [
    {
        "name": "bed-base-1m",
        "path": "/bed-bases/electrically-adjustable-bed-base-1m/",
        "controls": {
            "width": {"count": 9, "select": "140 cm"},
            "length": {"count": 4, "select": "220 cm"},
        },
    },
    {
        "name": "duvet-white-lines",
        "path": "/bed-linen/duvet-covers/white-lines-satin-duvet-cover/",
        "controls": {"size": {"count": 4, "select": "240 x 200/220 cm"}},
    },
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", default="http://127.0.0.1:8766/auping-staging")
    p.add_argument("--chromium-executable", default=None)
    p.add_argument("--output", type=Path, default=Path("audit/rc7.5/combobox-browser-gate.json"))
    return p.parse_args()


async def test_page(browser, base_url: str, spec: dict, viewport: dict) -> dict:
    context = await browser.new_context(viewport=viewport)
    page = await context.new_page()
    errors: list[str] = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" and "[Auping RC7.5]" in msg.text else None)
    response = await page.goto(base_url.rstrip("/") + spec["path"], wait_until="domcontentloaded", timeout=45000)
    await page.wait_for_function("document.documentElement.dataset.aupingComboboxStatus === 'ready'", timeout=15000)
    result = {
        "viewport": viewport,
        "page": spec["name"],
        "httpStatus": response.status if response else None,
        "controls": {},
        "errors": errors,
    }
    language = page.locator("[data-auping-language-control]").first
    result["language"] = {
        "count": await page.locator("[data-auping-language-control]").count(),
        "value": await language.get_attribute("data-auping-language-value"),
        "disabled": await language.get_attribute("disabled") is not None
        or await language.get_attribute("aria-disabled") == "true",
    }
    page_id = await page.locator("html").get_attribute("data-auping-page-id")
    for key, expected in spec["controls"].items():
        select = page.locator(f'[data-auping-combobox-native="{key}"]')
        await select.wait_for(state="attached")
        count = await select.locator("option").count()
        box = await select.bounding_box()
        await select.select_option(expected["select"])
        display = await page.locator(f'[data-auping-combobox-control="{key}"] [class*="singleValue"]').inner_text()
        selected = await select.input_value()
        query = await page.evaluate("key => new URL(location.href).searchParams.get(key)", key)
        stored = await page.evaluate(
            "([pageId,key]) => localStorage.getItem(`auping:rc75:${pageId}:${key}`)", [page_id, key]
        )
        assert count == expected["count"]
        assert box and box["width"] > 0 and box["height"] > 0
        assert selected == expected["select"] == display == query == stored
        result["controls"][key] = {
            "optionCount": count,
            "box": box,
            "selected": selected,
            "display": display,
            "query": query,
            "stored": stored,
        }
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function("document.documentElement.dataset.aupingComboboxStatus === 'ready'", timeout=15000)
    result["reload"] = {}
    for key, expected in spec["controls"].items():
        value = await page.locator(f'[data-auping-combobox-native="{key}"]').input_value()
        assert value == expected["select"]
        result["reload"][key] = value
    assert not errors
    await context.close()
    return result


async def run(args: argparse.Namespace) -> int:
    results = []
    async with async_playwright() as p:
        launch = {"headless": True}
        if args.chromium_executable:
            launch["executable_path"] = args.chromium_executable
        browser = await p.chromium.launch(**launch)
        try:
            for viewport in ({"width": 1440, "height": 1000}, {"width": 390, "height": 844}):
                for spec in PAGES:
                    results.append(await test_page(browser, args.base_url, spec, viewport))
        finally:
            await browser.close()
    payload = {"schema": "AUPING-RC7.5-COMBOBOX-BROWSER-GATE-V1", "engine": "chromium", "results": results}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"cases": len(results), "passed": len(results)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run(parse_args())))
