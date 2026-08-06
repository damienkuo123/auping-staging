# Auping RC7.6A — Visible Asset Recovery

Baseline commit: `aec2289fead07f50643fedc7e0e283e6d85e3e19`

## Scope

The v1.1 parity scan and manual inspection confirmed that two shared below-fold CTA images were visibly broken on five family landing pages:

- `/beds/noa/`
- `/beds/noble/`
- `/beds/original/`
- `/box-springs/criade/`
- `/box-springs/kiruna/`

The captured HTML still selected remote `/_next/image` candidates for:

- `aurondepastillegreen_1.png` — 「探索床架」
- `auping_aw25_bedlinen_dessin_playful_bricks_065.png` — 「打造您的臥室」

RC7.6A replaces every responsive candidate for those two cards with stable local AVIF assets. It does not change the card links, text, layout, map module, product controls, filters, or route structure.

## Validation

- Five target pages contain both local RC7.6 asset paths.
- The two unstable remote Next Image targets are absent from all five pages.
- Both local AVIF payloads are present and non-empty.
- RC7.5 Phase 04 route-integrity validation continues to pass.
- A second installer pass must produce zero changes.
