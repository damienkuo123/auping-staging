# Known differences from the original Auping system

This release is a Level 2.5 Hybrid build, not a copy of the original backend.

## Intentionally delegated to the official site

- Store database and maps
- Product configurator logic
- Account and session handling
- Shopping cart
- Contact-form processing
- Live availability or pricing

## Local limitations

- Deep pages have not all received manual pixel-by-pixel QA.
- The original search algorithm is not reproduced; the local search is a static content index.
- Remote Auping CSS may still be used by captured pages to preserve visual fidelity.
- Font rendering can differ slightly by operating system and browser.
- Video playback depends on browser codec support and media hosting; poster fallback is guaranteed for the audited videos.

## Correct product description

“High-fidelity Auping brand site with official Auping service integration.”
