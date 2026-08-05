# RC7.5 Phase 03 — Known limitations

- Phase 03 browser execution is recorded as **DEFERRED**, not PASS. The available Chromium process was blocked from loopback navigation by the execution environment, and WebKit was unavailable.
- Phase 02 already verified the shared combobox and catalog runtimes in Chromium desktop and mobile. Phase 03 reuses those runtimes, but the newly materialized routes still require post-deployment sampling on the live GitHub Pages URL.
- The 71 pages are deterministic materializations from captured same-family DOM, captured category-card assets and locked local catalog attributes. They are not independent new MHTML captures of every official product-detail URL.
- Copy that is not supported by the locked local catalog datasets is intentionally omitted rather than inferred. This prevents source-template facts from leaking into another product variant.
- The current phase closes local route and product-card link gaps. Full editorial translation and pixel-by-pixel comparison of every page remain separate acceptance work.
