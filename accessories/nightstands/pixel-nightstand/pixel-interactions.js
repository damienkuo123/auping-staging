(() => {
  "use strict";
  const MEDIA = {
    "Blush":"https://shop.auping.com/media/catalog/product/b/l/blush.jpg",
    "Burgundy":"https://shop.auping.com/media/catalog/product/b/u/burgundy.jpg",
    "Deep black":"https://shop.auping.com/media/catalog/product/d/e/deep_black.jpg",
    "Mustard":"https://shop.auping.com/media/catalog/product/m/u/mustard.jpg",
    "Pastille green":"https://shop.auping.com/media/catalog/product/p/a/pastille_green.jpg",
    "Pine green":"https://shop.auping.com/media/catalog/product/p/i/pine_green.jpg",
    "Pure white":"https://shop.auping.com/media/catalog/product/p/u/pure_white.jpg",
    "Royal blue":"https://shop.auping.com/media/catalog/product/r/o/royal_blue.jpg",
    "Sand beige":"https://shop.auping.com/media/catalog/product/s/a/sand_beige.jpg",
    "Warm grey":"https://shop.auping.com/media/catalog/product/w/a/warm_grey.jpg"
  };
  let generation = 0;
  const proxy = (u) => `https://www.auping.com/_next/image?url=${encodeURIComponent(u)}&w=2048&q=75`;

  async function settleMedia(label){
    const source = MEDIA[label];
    if (!source) return;
    const my = ++generation;
    const url = proxy(source);
    await new Promise((resolve, reject) => {
      const pre = new Image();
      pre.onload = resolve;
      pre.onerror = () => reject(new Error(`pixel-media-load-failed:${label}`));
      pre.src = url;
      if (pre.complete && pre.naturalWidth > 0) resolve();
    }).catch((error) => {
      document.documentElement.dataset.aupingPixelMediaStatus = "error";
      console.error("[Auping Pixel]", error);
    });
    if (my !== generation) return;
    const images = [...document.querySelectorAll('main [data-section="ProductHeader"] img')];
    for (const image of images){
      image.removeAttribute("srcset");
      image.src = url;
      image.dataset.aupingPixelMediaIdentity = source;
    }
    await Promise.all(images.map((image) => image.complete && image.naturalWidth > 0
      ? Promise.resolve()
      : new Promise((resolve) => {
          const done = () => resolve();
          image.addEventListener("load", done, {once:true});
          image.addEventListener("error", done, {once:true});
        })
    ));
    if (my !== generation) return;
    document.documentElement.dataset.aupingPixelMedia = label;
    document.documentElement.dataset.aupingPixelMediaIdentity = source;
    document.documentElement.dataset.aupingPixelMediaStatus =
      images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0) ? "ready" : "error";
    document.dispatchEvent(new CustomEvent("auping:pixel-media-settled", {
      detail:{label, source, imageCount:images.length}
    }));
  }

  function bind(){
    const select = document.querySelector('[data-auping-combobox-native="color"]');
    if (select instanceof HTMLSelectElement){
      settleMedia(select.value || "Deep black");
      select.addEventListener("change", () => settleMedia(select.value));
    }
    document.addEventListener("auping:variant-change", (event) => {
      if (event.detail?.pageId === "accessories--nightstands--pixel-nightstand" && event.detail?.key === "color"){
        settleMedia(event.detail.value);
      }
    });

    const button = document.querySelector("[data-auping-pixel-readmore]");
    const copy = document.querySelector("[data-auping-pixel-readmore-copy]");
    if (button instanceof HTMLButtonElement && copy instanceof HTMLElement){
      let expanded = false;
      const label = button.querySelector("span:last-child") || button;
      const collapsedCopy = copy.dataset.collapsed || copy.textContent || "";
      const expandedCopy = copy.dataset.expanded || collapsedCopy;
      button.addEventListener("click", () => {
        expanded = !expanded;
        button.setAttribute("aria-expanded", expanded ? "true" : "false");
        copy.textContent = expanded ? expandedCopy : collapsedCopy;
        if (label) label.textContent = expanded ? "收合" : "閱讀更多";
        document.documentElement.dataset.aupingPixelReadMore = expanded ? "expanded" : "collapsed";
      });
      document.documentElement.dataset.aupingPixelReadMore = "collapsed";
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", bind, {once:true})
    : bind();
})();
