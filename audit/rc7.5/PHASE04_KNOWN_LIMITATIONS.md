# RC7.5 Phase 04 — Known limitations

- The execution environment blocks Chromium navigation to both loopback and the live GitHub Pages host. Browser execution is therefore not reported as PASS in this phase.
- Phase 01 and Phase 02 already passed Chromium desktop/mobile gates for the shared control and catalog runtimes.
- Phase 03 representative routes were checked successfully by the site owner after deployment.
- Phase 04 changes route destinations, H1 text and one canonical tag; it does not alter product-control or catalog runtime behavior.
- Fallback links lead to the nearest valid local category/content hub. They are intentionally not substitutes for independently captured missing product or article detail pages.
- Full editorial translation of every inherited official paragraph and pixel-by-pixel approval of every route remain outside the RC7.5 semantic-control and route-integrity gate.
