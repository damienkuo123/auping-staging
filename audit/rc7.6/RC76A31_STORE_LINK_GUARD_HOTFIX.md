# RC7.6A.3.1 Store Link Guard Performance Hotfix

Baseline: `f338315dbd96b4cb44b68825d5bab78f30164794`

## Confirmed regression

RC7.6A.3 injected a global Store Locator link guard into every page. The first
version combined:

- full-document anchor scans every 1.5 seconds;
- subtree-wide observation of every href mutation;
- unconditional href writes even when the value was already local;
- parent-subtree rescans after an observed href mutation.

That design could repeatedly generate new MutationObserver records and starve
the browser main thread.

## Hotfix

- Removes setInterval polling.
- Performs one initial scan only.
- Processes only newly inserted nodes.
- Processes only the directly changed anchor for href mutations.
- Exits without writing when the href is already local.
- Retains capture-phase click interception as the final navigation safety net.
- Does not alter Leaflet maps, dealer data, routes, or store pages.
