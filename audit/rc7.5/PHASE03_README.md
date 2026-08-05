# Auping RC7.5 Phase 03 — Route Completion

Baseline commit: `bcf1bc9b4b498fba2953f9878b77d771108e7a9e`

## Scope completed

### 50 broken core product routes

The previous `LOCAL_EXISTING` files were approximately 1.4 KB self-redirect pages. Phase 03 replaces them with deterministic local product pages built from:

- an existing captured product-detail DOM from the same product family;
- the target product card images already present in the captured category page;
- the target route identity from `rc6-routes.json` and `rc6-products.json`;
- only the target catalog attributes available in the locked local datasets.

Families covered:

- 15 bed variants;
- 14 Box Springs variants;
- 21 duvet-cover variants.

### 21 unresolved catalog product links

All product cards on the four Phase 02 repaired catalog pages now resolve to local product-detail pages:

- 9 duvets;
- 7 fitted sheets;
- 4 mattress protectors;
- 1 bedspread.

The generated pages reuse the captured product-detail DOM and the exact card assets already present in those catalog pages. Their visible product copy and specification rows are restricted to attributes available in `rc75-catalog-parity.json`; inherited duvet-cover claims are removed.

## Resulting inventory

- Local routes: **142**
- Product records: **112**
- Materialized pages in this phase: **71**
- Product pages with semantic controls: **62**
- Remaining local self-redirect loops: **0**
- Dead product links on the four repaired catalogs: **0**

## Validation

`tools/validate_rc75_phase03.py` uses only the Python standard library and validates:

- route and product inventory counts;
- page identity, title, H1 and canonical URL;
- removal of meta-refresh and same-route JavaScript loops;
- product hero identity and control markers;
- catalog-attribute-only copy policy;
- resolution of all four repaired catalog product links.

Latest static result: **PASS — 0 failures**.
