# Auping RC7.6A.3 — Leaflet Taiwan Dealer Parity

Baseline: `297608f381b3521ec9ec6f7eade44bbeda4e7187`

## Scope

- Replaces Google iframe maps with Leaflet 1.9.4 and OpenStreetMap tiles.
- No Google API key and no Google Cloud billing.
- Adds verified Taiwan dealer data for six Auping locations.
- Creates `/store-locator/` plus six local `/stores/.../` detail pages.
- Adds local search, marker/list synchronization, geolocation distance sorting,
  telephone actions, route links, and appointment actions.
- Rebuilds embedded product-page store locator blocks from the same dealer JSON.
- Adds a MutationObserver and capture-phase click guard so the official runtime
  cannot restore the external Store Locator URL.
- Keeps visible OpenStreetMap attribution and a map-issue reporting link.

## Data sources

- Auping Taiwan official plaza page for all six official showroom records.
- Dutchhaves official contact page for current Taichung hours and entrance note.
- Coordinates are extracted from the official embedded map URLs.
- Last verified: 2026-08-06.
