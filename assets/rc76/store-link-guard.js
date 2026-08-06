(() => {
  "use strict";
  const LOCAL = "/auping-staging/store-locator/";
  const isLocator = (anchor) => {
    if (!(anchor instanceof HTMLAnchorElement)) return false;
    if (anchor.dataset.aupingExternalSource === "true") return false;
    try {
      const url = new URL(anchor.href, location.href);
      return /\/(?:en\/)?store-locator\/?$/.test(url.pathname) ||
             /\/auping-staging\/store-locator\/?$/.test(url.pathname);
    } catch (_) {
      return false;
    }
  };
  const lock = (root = document) => {
    root.querySelectorAll?.("a[href]").forEach((a) => {
      if (!isLocator(a)) return;
      a.setAttribute("href", LOCAL);
      a.removeAttribute("target");
      a.removeAttribute("rel");
      a.dataset.aupingLocalStoreLocator = "true";
    });
  };
  lock();
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) lock(node);
      });
      if (mutation.type === "attributes" && mutation.target instanceof HTMLAnchorElement) {
        lock(mutation.target.parentElement || document);
      }
    }
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ["href"]
  });
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!isLocator(anchor)) return;
    event.preventDefault();
    location.assign(LOCAL);
  }, true);
  setInterval(lock, 1500);
})();