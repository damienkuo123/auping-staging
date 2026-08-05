# Auping RC7.5 Phase 04 — Final Route Hardening

Baseline commit: `8f544a4b4107c9441cadaf2cf41ab8230ca28ca3`

## Scope

This phase closes the remaining static route-integrity issues found after Phase 03 passed live sampling.

### Internal-link hardening

- Rewrites **389** captured links that pointed to unmaterialized or preview-only destinations.
- Uses **58 explicit fallback rules**.
- Sends each unavailable deep link to the nearest valid local category or content hub.
- Preserves the original destination in `data-auping-original-href`.
- Marks every fallback using `data-auping-link-fallback`.
- Does not fabricate unsupported product or article detail pages.

### Semantic cleanup

- Removes the empty duplicate H1 on `/box-springs/` while preserving layout.
- Restores meaningful H1 text on:
  - `/about-auping/sustainability/`
  - `/customer-service/ordering/`
  - `/news/auping-opens-mattress-factory-future/`
- Adds the missing canonical URL to `/news/awards/`.

## Final static gate

- Local routes: **142 / 142**
- Product records: **112 / 112**
- Combobox pages: **62**
- Combobox controls: **83**
- Catalog pages: **4**
- Catalog products: **22**
- Fallback links: **389**
- Unknown internal links: **0**
- Validation failures: **0**
- Second installer pass: **0 changed files**

## Files added to the repository

- `data/rc75-phase04-link-fallbacks.json`
- `tools/apply_rc75_phase04.py`
- `tools/validate_rc75_phase04.py`
- `audit/rc7.5/PHASE04_README.md`
- `audit/rc7.5/PHASE04_KNOWN_LIMITATIONS.md`
- `audit/rc7.5/phase04-apply-report.json`
- `audit/rc7.5/phase04-validation.json`
- `audit/rc7.5/phase04-idempotency-report.json`
- `audit/rc7.5/phase04-route-audit.csv`
