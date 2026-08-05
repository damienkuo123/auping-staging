# Auping RC7.5 Phase 02 — Catalog Parity + Combobox Expansion

Baseline commit: `0e3946ca46b9f6c34d1388fb37d8492bffb3565a`

## What this package changes

### Product controls

- **20** existing local product pages upgraded.
- **41** captured product controls receive stable semantic state, URL query persistence, localStorage persistence, and reload restoration.
- Supports both captured React-Select DOM and native `<select>` controls.
- Covers bed bases, mattresses, mattress toppers, two pillows, and the approved White Lines duvet-cover page.

### Bed-linen catalog parity

Four captured category pages are moved from translated-label guessing to explicit semantic mappings:

- `/bed-linen/fitted-sheets/` — **8** existing cards; `一般床墊` correctly shows **3**.
- `/bed-linen/duvets/` — **9** existing cards; season and filling are correctly separated.
- `/bed-linen/mattress-protectors/` — **4** existing cards.
- `/bed-linen/bedspreads/` — **1** existing card.

The duvet contract is now:

- `season`: 四季被 / 春秋被 / 夏被
- `filling`: 鵝絨 / 再生羽絨 / 再生聚酯纖維
- No incorrect `fabric` mapping.

## Verification

- Static validation: **PASS**
- Installer second pass: **0 changed files**
- Chromium gate: **28 / 28 PASS**
  - 20 product pages, desktop
  - 4 catalog pages, desktop
  - 4 representative mobile cases
- All tested pages returned HTTP 200 in the local artifact harness.

Evidence is under `audit/rc7.5-phase02/`.

## Install

Double-click:

`APPLY_RC75_PHASE02_MAC.command`

The installer:

1. Requires the exact merged Phase 01 baseline.
2. Requires a clean `main` branch.
3. Creates a timestamped local backup branch.
4. Creates and switches to `rc75-phase02-catalog-parity`.
5. Applies the files and runs static validation.
6. Does **not** commit, push, or merge.

## Important scope boundary

This package does not invent simplified product-detail pages. Several captured bed-linen cards point to deep product routes that are not yet present in the 121-route local manifest. Those missing local detail captures belong to the next catalog-completion phase.
