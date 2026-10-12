/* Auping | Product catalog interaction parity v1.0.3 | source-locked 2026-10-12
 * Browser-only enhancement of captured listing DOM; no remote scripts, no writes.
 * Does NOT replace catalog's own product-detail pages or unrelated interactions.
 */
;(() => {
  'use strict';
  if (window.__AUPING_PRODUCT_CATALOG_PARITY_V1__) return;
  window.__AUPING_PRODUCT_CATALOG_PARITY_V1__ = { version: '1.0.3', initialized: false };
  const V = window.__AUPING_PRODUCT_CATALOG_PARITY_V1__;
  const root = document.documentElement;
  const canonicalPath = location.pathname.replace(/^\/auping-staging(?=\/|$)/, '').replace(/\/+$/, '') || '/';
  const q = (sel, scope = document) => scope.querySelector(sel);
  const qa = (sel, scope = document) => [...scope.querySelectorAll(sel)];
  const PREFIX = location.pathname.startsWith('/auping-staging/') ? '/auping-staging' : '';
  const err = (reason) => { root.dataset.aupingCatalogParityError = reason; console.warn('[Auping Catalog Parity]', reason); };
  function modelFromTitle(s) {
    return ['Criade','Kiruna','Original','Auronde','Essential','Noa','Noble','Tone'].find(m => new RegExp('^'+m+'(?:[\\s-]|$)','i').test((s||'').trim())) || '';
  }
  function applyHover(card) {
    // The source-proven supplemental 1M card has a distinct remote gallery and a local fallback;
    // leave that one static until the human visual audit confirms both angles.
    if (card.dataset.aupingSupplemental) {card.dataset.aupingHoverReady='manual-gallery-review';return;}
    const slider = q('[class*="ProductCardImageSlide_Base"]', card);
    if (!slider) return;
    const imgs = qa('[class*="ProductCardImageSlide_Slide"] img', slider);
    if (imgs.length < 2 || imgs[0].getAttribute('src') === imgs[1].getAttribute('src')) return;
    const main = imgs[0], second = imgs[1];
    const attrs = ['src','srcset','sizes'];
    const first = Object.fromEntries(attrs.map(a => [a, main.getAttribute(a)]));
    const alternative = Object.fromEntries(attrs.map(a => [a, second.getAttribute(a)]));
    let alternate = false;
    function paint(useAlternative) {
      alternate = useAlternative;
      const data = useAlternative ? alternative : first;
      // srcset first ensures the browser displays the intended angle after src update.
      ['srcset','sizes','src'].forEach(a => { if (data[a] === null) main.removeAttribute(a); else main.setAttribute(a,data[a]); });
      card.dataset.aupingHoverAngle = useAlternative ? '2' : '1';
    }
    const imgLink = q('a[href]', slider);
    slider.addEventListener('mouseenter', () => paint(true));
    slider.addEventListener('mouseleave', () => paint(false));
    imgLink?.addEventListener('focusin', () => paint(true));
    imgLink?.addEventListener('focusout', () => paint(false));
    const next = q('button[class*="ProductCardImageSlide_NextButton"]',slider);
    next?.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); paint(!alternate); }, true);
    card.dataset.aupingHoverReady = '1';
  }
  function supplementalOriginal1M(cards,list) {
    if (canonicalPath !== '/box-springs') return null;
    const dest = '/box-springs/original-box-spring-1m-deep-black/';
    if (cards.some(c => (c.dataset.rc5Route||'').includes('original-box-spring-1m-deep-black'))) return null;
    const origin = cards.find(c => (c.dataset.aupingProductSlug||'') === 'original-box-spring-deep-black');
    if (!origin) { err('MISSING_ORIGINAL_DEEP_BLACK_CARD'); return null; }
    // This variant has an existing authored, local, actual product-detail page.
    // Its gallery URL below is taken from that page, not synthesized product data.
    const variant = origin.cloneNode(true);
    variant.dataset.aupingSupplemental = 'source-proven-1m';
    variant.dataset.aupingProductSlug = 'original-box-spring-1m-deep-black';
    variant.dataset.rc5Route = dest;
    variant.dataset.rc5Model = 'Original';
    variant.dataset.rc5Color = '黑色';
    variant.dataset.rc5Split = '單人';
    qa('a[href]',variant).forEach(a => {
      const u = a.getAttribute('href') || '';
      if (u.includes('original-box-spring-deep-black')) a.setAttribute('href', PREFIX + dest);
      if (a.hasAttribute('title') && a.getAttribute('title').includes('Original')) a.setAttribute('title','Original 深黑色（1M）');
    });
    const title = q('[class*="EnrichedProductCard_Title"] strong', variant);
    if (title) title.textContent = 'Original 深黑色（1M）';
    const desc = q('[class*="EnrichedProductCard_ProductInfoDescription"]',variant);
    if (desc) desc.textContent = '款式：Original | 床墊：Comfort 床墊 | 舒適墊：Comfort 舒適墊 | 床底：電動可調式';
    const galleryImg = q('[class*="ProductCardImageSlide_Slide"] img',variant);
    if (galleryImg) {
      // Existing local Original Deep Black card artwork is retained as a loading fallback.
      // Source-proven variant image from authored 1M product page takes precedence when available.
      const fallbackSrc = galleryImg.getAttribute('src');
      const fallbackSrcset = galleryImg.getAttribute('srcset');
      const officialSrc = 'https://shop.auping.com/media/catalog/product/e/i/eiyq5a-ad7804d9a30d274038c565a457c5e53c_1.png';
      // Keep the existing locally-hosted Original artwork visible while the
      // actual 1M detail-page image is preloaded. A lazy external image assigned
      // to a page-2-only card can remain blank during the first mobile paint.
      // Never swap the visible image until the separate request has loaded.
      variant.dataset.aupingVariantImageSource = 'local-until-1m-ready';
      const preload = new Image();
      preload.decoding = 'async';
      preload.onload = () => {
        if (!preload.naturalWidth) return;
        // The validated 1M image should already be cached; preserve the local
        // fallback in case decoding/load of the displayed element still fails.
        galleryImg.addEventListener('error', () => {
          galleryImg.setAttribute('src', fallbackSrc);
          if (fallbackSrcset) galleryImg.setAttribute('srcset', fallbackSrcset);
          variant.dataset.aupingVariantImageFallback = '1';
          variant.dataset.aupingVariantImageSource = 'local-on-image-error';
        }, {once:true});
        galleryImg.removeAttribute('srcset');
        galleryImg.setAttribute('src',officialSrc);
        variant.dataset.aupingVariantImageSource = '1m-remote-loaded';
      };
      preload.onerror = () => {
        variant.dataset.aupingVariantImageFallback = '1';
        variant.dataset.aupingVariantImageSource = 'local-on-preload-error';
      };
      preload.src = officialSrc;
    }
    list.append(variant);
    return variant;
  }
  function init() {
    if (V.initialized) return;
    const section = q('[class*="CatalogWithFilters_base"]');
    const list = q('[class*="ProductList_container"]',section||document);
    const title = q('[class*="CatalogWithFilters_productsTitle"]',section||document);
    const filterPane = q('[class*="CatalogWithFilters_filters"]',section||document);
    if (!section || !list || !title || !filterPane) return;
    // IMPORTANT: ProductList has a promotional banner child in the real snapshot.
    // It is NOT one of the products: count/filter/paginate only actual product cards.
    // The v1.0 fixture omitted the banner and incorrectly passed 28 even though the
    // real site reported 29. Keep the banner visually on unfiltered page 1 only.
    const listChildren = qa(':scope > *',list);
    const promotions = listChildren.filter(el => el.matches('[class*="ProductList_BannerColumn"]'));
    const cards = listChildren.filter(el => !promotions.includes(el) && el.matches('[class*="EnrichedProductCard_Base"],[data-rc5-filter-card]'));
    if (!cards.length) return;
    if (canonicalPath === '/box-springs' && (cards.length !== 27 || promotions.length !== 1)) {
      err('UNEXPECTED_BOX_SPRINGS_DOM_27_PRODUCTS_1_PROMO_EXPECTED');return;
    }
    const rawInputs = qa('input[type="checkbox"]',filterPane).filter(el => el.dataset.aupingFilterKey);
    if (!rawInputs.length) { err('NO_RC7_FILTER_INPUT_MAPPING');return; }
    V.initialized = true;
    root.dataset.aupingCatalogParity = 'ready';
    section.dataset.aupingCatalogParity = '1';
    const isBox = canonicalPath === '/box-springs';
    if (isBox) {
      // Scope the retired filter to the *group*, never the similarly named
      // Accordion_itemTrigger button. The v1.0.2 broad substring hid only
      // the heading while leaving the single/double checkboxes visible.
      const versionTrigger = q('button[aria-controls="boxspring_size_person"]',filterPane);
      const versionBox = versionTrigger?.closest('[class*="Accordion_item__"]');
      if (!versionTrigger || !versionBox || !q('#boxspring_size_person',versionBox)) {
        err('BOX_VERSION_GROUP_CONTAINER_AUTHORITY_MISMATCH'); return;
      }
      versionBox.classList.add('auping-catalog-retired-version');
      qa('input',versionBox).forEach(i => {i.checked=false;i.disabled=true;});
    }
    // Captured Next.js markup contains a visible mobile 篩選 button but no
    // restored open/close interaction. The zero-height sidebar therefore lets
    // the main content intercept touch events. This scoped drawer makes the
    // actual checkbox reachable without force clicks or synthetic changes.
    const mobileButton = q('button[class*="CatalogWithFilters_filterButton"]',section);
    const MOBILE_QUERY = '(max-width:700px)';
    let mobileOpen = false;
    if (!mobileButton) { err('MISSING_MOBILE_FILTER_TOGGLE'); return; }
    const mobileFilterId = 'auping-catalog-mobile-filter-panel';
    if (filterPane.id && filterPane.id !== mobileFilterId) { err('MOBILE_FILTER_PANEL_ID_COLLISION'); return; }
    filterPane.id = mobileFilterId;
    mobileButton.setAttribute('aria-controls',mobileFilterId);
    function mobileSync() {
      const onMobile = window.matchMedia(MOBILE_QUERY).matches;
      section.classList.toggle('auping-mobile-filter-open',onMobile && mobileOpen);
      mobileButton.setAttribute('aria-expanded',String(onMobile && mobileOpen));
      if (onMobile) filterPane.setAttribute('aria-hidden',String(!mobileOpen));
      else filterPane.removeAttribute('aria-hidden');
    }
    mobileButton.addEventListener('click',e => {
      if (!window.matchMedia(MOBILE_QUERY).matches) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      mobileOpen = !mobileOpen;
      mobileSync();
    },true);
    section.addEventListener('keydown',e => {
      if (e.key === 'Escape' && mobileOpen && window.matchMedia(MOBILE_QUERY).matches) {
        mobileOpen = false; mobileSync(); mobileButton.focus();
      }
    });
    window.addEventListener('resize',mobileSync);
    mobileSync();
    const inputs = rawInputs.filter(i => !i.disabled);
    const supplemental = supplementalOriginal1M(cards,list);
    if (supplemental) cards.push(supplemental);
    V.sourceCardCount = cards.length;
    V.promotionCardCount = promotions.length;
    V.addedSourceProvenOneM = !!supplemental;
    const chips = q('.rc7-filter-chips',section) || q('.rc7-filter-chips');
    const chipHost = chips || document.createElement('div');
    chipHost.className = 'rc7-filter-chips auping-catalog-filter-chips';
    chipHost.setAttribute('aria-label','目前篩選條件');
    title.insertAdjacentElement('afterend',chipHost);
    const count = q('[class*="CatalogWithFilters_productsTotal"]',section);
    const pageNav = q('nav[aria-label="Pagination"]',section);
    const pageBtns = pageNav ? qa('ul[class*="Pagination_pageNumbers"] button',pageNav) : [];
    const outerBtns = pageNav ? qa('button[class*="Pagination_paginationButton"]',pageNav) : [];
    const pageSize = pageNav ? 27 : Number.POSITIVE_INFINITY;
    let page = 1;
    let matching = [];
    const info = new Map(cards.map(card => {
      const product = window.AupingRC7Filter?.cards?.find(c => c.card === card)?.product;
      const name = q('[class*="EnrichedProductCard_Title"] strong',card)?.textContent?.trim() || '';
      const model = card.dataset.rc5Model || product?.attributes?.model?.[0] || modelFromTitle(name);
      const colors = (card.dataset.rc5Color||'').split('|').filter(Boolean);
      if (!colors.length && product?.attributes?.color) colors.push(...product.attributes.color);
      if (!colors.length) {
        const palette = [['黑','黑色'],['灰','灰色'],['藍','藍色'],['綠','綠色'],['米','米色'],['粉','粉紅色'],['紅','紅色'],['白','白色']];
        for (const [needle,value] of palette) if(name.includes(needle)) colors.push(value);
      }
      const split = (card.dataset.rc5Split||'').split('|').filter(Boolean);
      return [card, { product, model, colors, version:split, title:name }];
    }));
    cards.forEach(card=>applyHover(card));
    function selected() {const s={};inputs.filter(i=>i.checked).forEach(i => { (s[i.dataset.aupingFilterKey] ||= []).push(i.dataset.aupingFilterValue); });return s;}
    function matches(card,s) {
      const dat = info.get(card), source = dat?.product?.attributes || {};
      return Object.entries(s).every(([k,vs]) => {
        if (!vs.length) return true;
        const values = k === 'model' ? [dat.model] : k === 'color' ? dat.colors : k === 'version' ? dat.version : source[k] || [];
        return vs.some(v => values.includes(v));
      });
    }
    function urlUpdate(state, nextPage, usePush=false) {
      const u = new URL(location.href);
      const keys = new Set(inputs.map(i => i.dataset.aupingFilterKey));
      keys.forEach(k => u.searchParams.delete(k));
      Object.entries(state).forEach(([key,values])=>values.forEach(val=>u.searchParams.append(key,val)));
      if(isBox) u.searchParams.delete('version');
      if(nextPage>1) u.searchParams.set('page',String(nextPage));else u.searchParams.delete('page');
      if (u.href !== location.href) history[usePush?'pushState':'replaceState']({},'',u);
    }
    function paintChips(s) {
      chipHost.replaceChildren();
      if(!Object.keys(s).length){chipHost.hidden=true;return;}
      chipHost.hidden=false;
      const lbl = document.createElement('strong'); lbl.className='auping-filters-heading';lbl.textContent='Filters:';chipHost.append(lbl);
      inputs.filter(i=>i.checked).forEach(input => {
        const chip=document.createElement('button');chip.type='button';chip.className='rc7-filter-chip';
        const label=q(`label[for="${CSS.escape(input.id)}"]`,filterPane)?.textContent?.trim() || input.dataset.aupingFilterValue;
        chip.textContent=label+' ×';chip.setAttribute('aria-label','移除篩選：'+label);
        chip.addEventListener('click',()=> { input.checked=false; render(true); });chipHost.append(chip);
      });
      const clear=document.createElement('button');clear.type='button';clear.className='auping-filter-reset';clear.textContent='清除全部';
      clear.addEventListener('click',()=>{inputs.forEach(i=>i.checked=false);render(true)});chipHost.append(clear);
    }
    function paintPaging(total) {
      if(!pageNav)return;
      const pages=Math.max(1,Math.ceil(total/pageSize));
      pageNav.hidden=pages<2;
      pageBtns.forEach((b,i)=>{
        const n=i+1;b.hidden=n>pages;
        b.textContent=String(n);b.setAttribute('aria-label',n===page?'目前頁面 '+n:'前往第 '+n+' 頁');
        b.classList.toggle('Pagination_currentPage__SKKen',n===page);
        b.disabled=n>pages;
        b.setAttribute('aria-current',n===page?'page':'false');
      });
      if (outerBtns[0]) outerBtns[0].disabled=page<=1;
      if (outerBtns.length>1) outerBtns[outerBtns.length-1].disabled=page>=pages;
    }
    function render(fromChange=false, pushPage=false) {
      const s=selected();matching=cards.filter(card=>matches(card,s));
      const pages=Math.max(1,Math.ceil(matching.length/pageSize));
      if(fromChange)page=1;else page=Math.min(Math.max(1,page),pages);
      const start=(page-1)*pageSize;const view=new Set(matching.slice(start,start+pageSize));
      cards.forEach(c=>{c.hidden=!view.has(c);c.dataset.aupingVisible=view.has(c)?'1':'0';});
      // Preserves the original promotional tile but excludes it from all product counts.
      const showPromotions = page===1 && !Object.values(s).some(v=>v.length);
      promotions.forEach(p=>{p.hidden=!showPromotions;p.dataset.aupingPromoVisible=showPromotions?'1':'0';});
      if(count){ const visible=view.size;count.textContent=(visible||0)+' of '+matching.length;}
      chipHost.dataset.aupingFilterCount=String(Object.values(s).reduce((n,a)=>n+a.length,0));
      paintChips(s);paintPaging(matching.length);
      root.dataset.aupingCatalogVisible=String(view.size);
      root.dataset.aupingCatalogTotal=String(matching.length);
      root.dataset.aupingCatalogPage=String(page);
      urlUpdate(s,page,pushPage);
      document.dispatchEvent(new CustomEvent('auping:catalog-parity',{detail:{path:canonicalPath,page,total:matching.length,visible:view.size}}));
    }
    const initialUrl = new URL(location.href);
    const initialPage = Number(initialUrl.searchParams.get('page'));
    if (Number.isSafeInteger(initialPage) && initialPage>1) page=initialPage;
    inputs.forEach(input => {
      input.addEventListener('change',()=>render(true),false);
    });
    if(pageNav){pageNav.addEventListener('click', e=>{
      const b=e.target.closest('button');if(!b||!pageNav.contains(b))return;
      e.preventDefault();e.stopImmediatePropagation();
      const n=pageBtns.indexOf(b), max=Math.max(1,Math.ceil(matching.length/pageSize));
      if(n>=0)page=n+1;
      else if(b===outerBtns[0])page--;
      else if(b===outerBtns[outerBtns.length-1])page++;
      else return;
      page=Math.min(Math.max(1,page),max);render(false,true);
      // Page 1 -> 2 collapses 27 cards to 1. Browser scroll anchoring can
      // override a synchronous scrollIntoView after this layout contraction.
      // Reposition at the catalog heading again after layout has settled.
      function alignCatalogAfterPageChange() {
        const margin = parseFloat(getComputedStyle(title).scrollMarginTop) || 110;
        const target = Math.max(0, window.scrollY + title.getBoundingClientRect().top - margin);
        if(Number.isFinite(target)) window.scrollTo({top:target,left:0,behavior:'instant'});
      }
      alignCatalogAfterPageChange();
      requestAnimationFrame(() => requestAnimationFrame(alignCatalogAfterPageChange));
      setTimeout(() => {
        const y=title.getBoundingClientRect().top;
        if (y < 10 || y > 240) alignCatalogAfterPageChange();
      },120);
    },true);}
    window.addEventListener('popstate',()=>{
      const u=new URL(location.href);inputs.forEach(i=>i.checked=u.searchParams.getAll(i.dataset.aupingFilterKey).includes(i.dataset.aupingFilterValue));
      page=Math.max(1,Number(u.searchParams.get('page'))||1);render(false,false);
    });
    render(false,false);
    V.getState=()=>({page,total:matching.length,selected:selected(),visible:cards.filter(c=>!c.hidden).length,sourceCount:cards.length,promotionCount:promotions.length});
  }
  document.addEventListener('auping:rc7-ready',()=>setTimeout(init,0),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700),{once:true});
  else setTimeout(init,700);
})();
