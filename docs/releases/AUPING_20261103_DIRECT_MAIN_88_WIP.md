# Auping Taiwan — 88-file main integration (WIP, not 1:1 acceptance)

This is an explicit direct-main progress release requested on 2026-11-03.

- Previous main: `65c6c077a6dae609be2b1eeb38bc63e516a85ae6`
- Scope: 88 original SHA-locked integrated preview source files + this release note + one file-level provenance ledger
- Known hard holds: **10**, including Auping Two visual FAIL, six mattress prose/content holds, C2 and Safari media controller architectural review
- W3C navigation: 65 candidate files with partial live click coverage
- This commit **does not** mean complete desktop/iPhone Safari or sitewide Effective 1:1 parity
- Existing user-reported deficiencies: Noa media and ImageGallery; Molton Read More; Essential Other Beds CtaSlider; Two whole-page parity; Stories BlogList
- Per-file status/authority: `docs/releases/AUPING_20261103_88_SOURCE_LEDGER.json`
- Restore point: tag `safety/pre-88-main-20261103-65c6c077` (original main) and ordinary Git history
- Rollback: use the separate guarded rollback command; it creates a new revert commit, never force-pushes

## The ten original hard holds
- `assets/auping-shared/w4-safari-official-video-v110.js`
- `assets/c2-catalog/controller.js`
- `mattress-toppers/index.html`
- `mattresses/elite-mattress/index.html`
- `mattresses/elysium-mattress/index.html`
- `mattresses/evolve-mattress/index.html`
- `mattresses/one-mattress/index.html`
- `mattresses/revive-mattress/index.html`
- `mattresses/two-mattress/index.html`
- `toppers/index.html`

Do not classify these holds as accepted. The current main is the canonical integration baseline for future chats; the release-note status is authoritative for what remains unfinished.
