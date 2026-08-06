# RC7.6A.3 Known limitations

- OpenStreetMap public raster tiles are best-effort and have no SLA.
- The implementation does not prefetch or bulk-download map tiles.
- Google Maps is used only as an external route-planning webpage; no Google API is called.
- Appointment actions currently use telephone links because no local booking backend exists.
- Store data must be periodically rechecked against Auping Taiwan and dealer sources.
