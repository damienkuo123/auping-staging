;(() => {
  'use strict';
  const VERSION = '20260804-rc62';
  if (window.__AUPING_RC6_BOOTSTRAP__) return;
  window.__AUPING_RC6_BOOTSTRAP__ = VERSION;
  const own = document.currentScript || [...document.scripts].find((node) => /(?:snapshot-interactions|rc5-bridge)\.js(?:\?|$)/.test(node.src));
  const assetBase = own?.src ? new URL('.', own.src) : new URL('/auping-staging/assets/', location.origin);
  if (!document.querySelector('link[data-auping-rc6="style"],link[href*="rc6-runtime.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.aupingRc6 = 'style';
    link.href = new URL(`rc6-runtime.css?v=${VERSION}`, assetBase).href;
    document.head.appendChild(link);
  }
  if (!window.__AUPING_RC6_RUNTIME_LOADING__ && !document.querySelector('script[data-auping-rc6-bootstrap],script[src*="rc6-runtime.js"]')) {
    const script = document.createElement('script');
    script.src = new URL(`rc6-runtime.js?v=${VERSION}`, assetBase).href;
    script.async = false;
    script.dataset.aupingRc6Bootstrap = VERSION;
    document.head.appendChild(script);
  }
})();
