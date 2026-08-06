(() => {
  "use strict";

  const LOCAL_PATH = "/auping-staging/store-locator/";

  function isExternalStoreLocator(anchor) {
    if (!(anchor instanceof HTMLAnchorElement)) return false;
    if (anchor.dataset.aupingExternalSource === "true") return false;

    const raw = anchor.getAttribute("href") || "";
    if (raw === LOCAL_PATH) return false;

    try {
      const url = new URL(anchor.href, location.href);
      const alreadyLocal =
        url.pathname === LOCAL_PATH && url.hostname === location.hostname;
      if (alreadyLocal) return false;

      return (
        /(^|\.)auping\.com$/i.test(url.hostname) &&
        /\/(?:en\/)?store-locator\/?$/i.test(url.pathname)
      );
    } catch (_) {
      return false;
    }
  }

  function localize(anchor) {
    if (!isExternalStoreLocator(anchor)) return false;
    anchor.setAttribute("href", LOCAL_PATH);
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
    anchor.dataset.aupingLocalStoreLocator = "true";
    return true;
  }

  function scan(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof HTMLAnchorElement) localize(root);
    root.querySelectorAll?.("a[href]").forEach(localize);
  }

  scan(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        localize(mutation.target);
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
      });
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["href"],
  });

  document.addEventListener(
    "click",
    (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!isExternalStoreLocator(anchor)) return;
      event.preventDefault();
      location.assign(LOCAL_PATH);
    },
    true
  );

  document.documentElement.dataset.aupingStoreLinkGuard = "safe-v2";
})();