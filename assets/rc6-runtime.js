;(() => {
  'use strict';

  const VERSION = '2026-08-04-rc6-final';
  const BASE = location.pathname.startsWith('/auping-staging') ? '/auping-staging' : '';
  const script = [...document.scripts].find((node) => /rc6-runtime\.js(?:\?|$)/.test(node.src));
  const assetBase = script?.src ? new URL('.', script.src) : new URL(`${BASE}/assets/`, location.origin);
  const dataBase = new URL('../data/', assetBase);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { routes: [], routeById: new Map(), routeByPath: new Map(), products: [], search: [], filters: [] };

  function normalizePath(value) {
    try {
      const url = new URL(value, location.href);
      let path = decodeURI(url.pathname).replace(/^\/auping-staging(?=\/|$)/, '') || '/';
      path = path.replace(/^\/(?:en|zh-tw|zh)(?=\/|$)/i, '') || '/';
      if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path += '/';
      return path.replace(/\/+/g, '/');
    } catch {
      return '/';
    }
  }

  function localUrl(path) {
    const normalized = normalizePath(path);
    return `${BASE}${normalized === '/' ? '/' : normalized}`;
  }

  function routeFor(value) {
    const path = normalizePath(value);
    return state.routeByPath.get(path.toLowerCase()) || null;
  }

  function resolveRoute(routeOrId) {
    const route = typeof routeOrId === 'string'
      ? (state.routeById.get(routeOrId) || routeFor(routeOrId))
      : routeOrId;
    if (!route) return { mode: 'UNKNOWN', href: null, route: null };
    if (route.mode === 'LOCAL_PARITY') return { mode: route.mode, href: localUrl(route.localPath), route };
    if (route.mode === 'OFFICIAL_REDIRECT') return { mode: route.mode, href: route.officialUrl, route };
    if (route.mode === 'DISABLED' && route.fallbackPath) return { mode: route.mode, href: localUrl(route.fallbackPath), route };
    return { mode: route.mode, href: null, route };
  }

  async function loadJSON(name) {
    const response = await fetch(new URL(name, dataBase), { cache: 'no-store' });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    return response.json();
  }

  async function loadData() {
    const [routes, products, filters, search] = await Promise.all([
      loadJSON('rc6-routes.json'), loadJSON('rc6-products.json'),
      loadJSON('rc6-filter-schema.json'), loadJSON('rc6-search-index.json')
    ]);
    state.routes = routes.routes || [];
    state.products = products.products || [];
    state.filters = filters.categories || [];
    state.search = search.items || [];
    state.routeById = new Map(state.routes.map((route) => [route.id, route]));
    state.routeByPath = new Map(state.routes.map((route) => [normalizePath(route.localPath).toLowerCase(), route]));
  }

  function enforceCurrentRoute() {
    const route = routeFor(location.href);
    if (!route) return false;
    const resolved = resolveRoute(route);
    if (route.mode === 'OFFICIAL_REDIRECT' && resolved.href && !/^https?:\/\/(?:damienkuo123\.github\.io|localhost|127\.0\.0\.1)/i.test(resolved.href)) {
      document.documentElement.classList.add('rc6-redirecting');
      location.replace(resolved.href + location.search + location.hash);
      return true;
    }
    if (route.mode === 'DISABLED' && resolved.href && normalizePath(resolved.href) !== normalizePath(location.href)) {
      location.replace(resolved.href + location.search + location.hash);
      return true;
    }
    return false;
  }

  function rewriteLinks(root = document) {
    root.querySelectorAll?.('a[href]').forEach((anchor) => {
      if (anchor.dataset.rc6RouteReady === '1') return;
      let url;
      try { url = new URL(anchor.getAttribute('href'), location.href); } catch { return; }
      if (!['http:', 'https:'].includes(url.protocol)) return;
      const route = routeFor(url.href);
      if (!route) return;
      const resolved = resolveRoute(route);
      anchor.dataset.rc6RouteReady = '1';
      anchor.dataset.rc6RouteId = route.id;
      anchor.dataset.rc6RouteMode = route.mode;
      if (!resolved.href) {
        anchor.removeAttribute('href');
        anchor.setAttribute('aria-disabled', 'true');
        anchor.dataset.rc6Disabled = '1';
        return;
      }
      anchor.href = resolved.href;
      if (route.mode === 'OFFICIAL_REDIRECT') {
        anchor.rel = 'noopener noreferrer';
        anchor.dataset.rc6Official = '1';
      }
    });
  }

  function removeLegacyLayers() {
    $$('.auping-static-search,.rc5-search,.site-search,.search-dialog,.auping-mobile-nav').forEach((node) => node.remove());
  }

  function makeSearch() {
    removeLegacyLayers();
    let panel = $('.rc6-search');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'rc6-search';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', '搜尋 Auping');
    panel.innerHTML = `
      <div class="rc6-search__backdrop" data-rc6-search-close></div>
      <div class="rc6-search__panel">
        <div class="rc6-search__header">
          <label for="rc6-search-input">搜尋 Auping</label>
          <button type="button" class="rc6-search__close" aria-label="關閉搜尋" data-rc6-search-close>×</button>
        </div>
        <div class="rc6-search__field">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <input id="rc6-search-input" type="search" autocomplete="off" placeholder="搜尋床架、床墊、被套或服務">
        </div>
        <div class="rc6-search__meta" aria-live="polite"></div>
        <div class="rc6-search__results"></div>
      </div>`;
    document.body.appendChild(panel);
    return panel;
  }

  function searchRows(query) {
    const q = query.trim().toLocaleLowerCase('zh-Hant');
    if (!q) return [];
    return state.search.map((item) => {
      const haystack = [item.title, item.summary, ...(item.keywords || [])].join(' ').toLocaleLowerCase('zh-Hant');
      let score = 0;
      if (item.title.toLocaleLowerCase('zh-Hant') === q) score += 80;
      if (item.title.toLocaleLowerCase('zh-Hant').startsWith(q)) score += 40;
      if (item.title.toLocaleLowerCase('zh-Hant').includes(q)) score += 25;
      if (haystack.includes(q)) score += 12;
      q.split(/\s+/).forEach((token) => { if (token && haystack.includes(token)) score += 3; });
      return { item, score };
    }).filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'zh-Hant'))
      .slice(0, 24).map((row) => row.item);
  }

  function setupSearch() {
    const panel = makeSearch();
    const input = $('#rc6-search-input', panel);
    const results = $('.rc6-search__results', panel);
    const meta = $('.rc6-search__meta', panel);
    let previousFocus = null;

    const render = () => {
      const rows = searchRows(input.value);
      const q = input.value.trim();
      meta.textContent = q ? `找到 ${rows.length} 筆結果` : '輸入關鍵字開始搜尋';
      results.innerHTML = rows.length
        ? rows.map((item) => {
            const resolved = resolveRoute(item.routeId);
            if (!resolved.href) return '';
            const badge = item.mode === 'OFFICIAL_REDIRECT' ? '<span class="rc6-search__badge">官方頁面</span>' : '<span class="rc6-search__badge">本站</span>';
            return `<a class="rc6-search__result" href="${resolved.href}" data-rc6-search-result="${item.routeId}"><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.summary || '')}</small></span>${badge}</a>`;
          }).join('')
        : (q ? '<p class="rc6-search__empty">找不到符合內容。請嘗試「床」、「Elysium」或「被套」。</p>' : '');
    };
    const open = (trigger) => {
      previousFocus = trigger || document.activeElement;
      panel.hidden = false;
      document.body.classList.add('rc6-search-open');
      requestAnimationFrame(() => input.focus());
      render();
    };
    const close = () => {
      panel.hidden = true;
      document.body.classList.remove('rc6-search-open');
      input.value = '';
      render();
      previousFocus?.focus?.();
    };

    input.addEventListener('input', render);
    panel.addEventListener('click', (event) => {
      if (event.target.closest('[data-rc6-search-close]')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); }
    });
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-rc6-search-trigger]');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      open(trigger);
    }, true);

    $$('header button[aria-label="Submit"],header button[aria-label*="搜尋"],header button[title*="Search"]').forEach((button) => button.dataset.rc6SearchTrigger = '1');
    window.AupingRC6Search = { open, close, searchRows };
  }

  function setupMobileMenu() {
    const menu = $('[data-rc6-menu],aside[class*="FullPageMenu_FullPageMenu"]');
    if (!menu) return;
    menu.dataset.rc6Menu = '1';
    const overlay = $('[data-rc6-menu-overlay],div[class*="FullPageMenu_Overlay"],div[class*="FullPageMenu_overlay"]');
    if (overlay) overlay.dataset.rc6MenuOverlay = '1';
    $$('header button[class*="BurgerMenu_"],header button[aria-label="選單"]').forEach((button) => button.dataset.rc6MenuTrigger = '1');
    let previousFocus = null;

    const submenus = $$('[class*="FullPageMenu__submenu"],[class*="FullPageMenu_submenu"]', menu);
    const closeSubmenus = () => submenus.forEach((submenu) => submenu.classList.remove('rc6-submenu-open'));
    const open = (trigger) => {
      previousFocus = trigger || document.activeElement;
      closeSubmenus();
      menu.classList.add('rc6-menu-open');
      menu.removeAttribute('hidden');
      overlay?.classList.add('rc6-overlay-open');
      document.documentElement.classList.add('rc6-scroll-lock');
      document.body.classList.add('rc6-scroll-lock');
      requestAnimationFrame(() => $('[aria-label="關閉"],button[class*="Close"]', menu)?.focus());
    };
    const close = () => {
      closeSubmenus();
      menu.classList.remove('rc6-menu-open');
      overlay?.classList.remove('rc6-overlay-open');
      document.documentElement.classList.remove('rc6-scroll-lock');
      document.body.classList.remove('rc6-scroll-lock');
      previousFocus?.focus?.();
    };

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-rc6-menu-trigger]');
      if (trigger) {
        event.preventDefault();
        event.stopImmediatePropagation();
        open(trigger);
        return;
      }
      if (event.target.closest('[data-rc6-menu-overlay]')) { close(); return; }
      if (!menu.contains(event.target)) return;
      const closeButton = event.target.closest('button[aria-label="關閉"],button[class*="Close"]');
      if (closeButton) { event.preventDefault(); close(); return; }
      const back = event.target.closest('button[aria-label="Back"],button[aria-label="返回"]');
      if (back) { event.preventDefault(); back.closest('[class*="submenu"]')?.classList.remove('rc6-submenu-open'); return; }
      const top = event.target.closest('[class*="TopLevelMenuItem_base"]');
      if (top) {
        const li = top.closest('li');
        const submenu = li ? $$(':scope > div', li).find((node) => /submenu/i.test(node.className)) : null;
        if (submenu) { event.preventDefault(); closeSubmenus(); submenu.classList.add('rc6-submenu-open'); return; }
      }
      if (event.target.closest('a[href]')) close();
    }, true);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('rc6-menu-open')) { event.preventDefault(); close(); }
    });
    window.AupingRC6Menu = { open, close };
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function productMatches(product, selected) {
    return Object.entries(selected).every(([key, values]) => {
      if (!values.length) return true;
      const available = Array.isArray(product.attributes?.[key]) ? product.attributes[key] : [];
      return values.some((value) => available.includes(value));
    });
  }

  function setupFilters() {
    const current = normalizePath(location.href).toLowerCase();
    const schema = state.filters.find((item) => normalizePath(item.path).toLowerCase() === current);
    if (!schema) return;
    const products = state.products.filter((product) => product.category === schema.category && product.isProduct && !product.isPromo);
    const productByPath = new Map(products.map((product) => [normalizePath(product.localPath).toLowerCase(), product]));
    const cards = $$(schema.cardSelector || '[data-rc6-product-card]').map((card) => {
      const path = normalizePath(card.dataset.rc6RouteId ? state.routeById.get(card.dataset.rc6RouteId)?.localPath : (card.dataset.rc5Route || card.querySelector('a[href]')?.href || ''));
      const product = productByPath.get(path.toLowerCase()) || state.products.find((item) => item.routeId === card.dataset.rc6RouteId);
      if (product) {
        card.dataset.rc6ProductCard = '1';
        card.dataset.rc6RouteId = product.routeId;
        return { card, product };
      }
      card.dataset.rc6PromoCard = '1';
      return { card, product: null };
    });
    if (!cards.some((entry) => entry.product)) return;

    schema.inputMap?.forEach((map) => {
      const input = document.getElementById(map.id) || $(`input[name="${CSS.escape(map.name || '')}"][value="${CSS.escape(map.nativeValue || '')}"]`);
      if (input) {
        input.dataset.rc6FilterKey = map.group;
        input.dataset.rc6FilterValue = map.value;
      }
    });
    const inputs = $$('input[data-rc6-filter-key]');
    if (!inputs.length) return;
    const count = $(schema.countSelector || '[data-rc6-product-count]');
    let chips = $('.rc6-filter-chips');
    if (!chips) {
      chips = document.createElement('div');
      chips.className = 'rc6-filter-chips';
      const title = $('[class*="CatalogWithFilters_productsTitle"],h1');
      (title?.parentElement || cards[0].card.parentElement).insertAdjacentElement('afterend', chips);
    }
    let empty = $('.rc6-no-results');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'rc6-no-results';
      empty.hidden = true;
      empty.textContent = '找不到符合條件的商品';
      cards[0].card.parentElement.appendChild(empty);
    }

    const getSelected = () => {
      const selected = {};
      inputs.filter((input) => input.checked).forEach((input) => {
        (selected[input.dataset.rc6FilterKey] ||= []).push(input.dataset.rc6FilterValue);
      });
      return selected;
    };
    const syncURL = (selected) => {
      const url = new URL(location.href);
      schema.groups.forEach((group) => url.searchParams.delete(group.queryKey || group.key));
      Object.entries(selected).forEach(([key, values]) => values.forEach((value) => url.searchParams.append(key, value)));
      history.replaceState({}, '', url);
    };
    const apply = (updateURL = true) => {
      const selected = getSelected();
      const hasFilter = Object.values(selected).some((values) => values.length);
      let visible = 0;
      cards.forEach(({ card, product }) => {
        if (!product) { card.hidden = hasFilter; return; }
        const show = productMatches(product, selected);
        card.hidden = !show;
        card.dataset.rc6Visible = show ? '1' : '0';
        if (show) visible += 1;
      });
      if (count) count.textContent = `共 ${visible} 件商品`;
      empty.hidden = visible !== 0;
      chips.innerHTML = '';
      inputs.filter((input) => input.checked).forEach((input) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'rc6-filter-chip';
        chip.textContent = `${input.dataset.rc6FilterValue} ×`;
        chip.onclick = () => { input.checked = false; apply(true); };
        chips.appendChild(chip);
      });
      if (hasFilter) {
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'rc6-filter-clear';
        clear.textContent = '清除全部';
        clear.onclick = () => { inputs.forEach((input) => { input.checked = false; }); apply(true); };
        chips.appendChild(clear);
      }
      if (updateURL) syncURL(selected);
      return visible;
    };

    const params = new URLSearchParams(location.search);
    inputs.forEach((input) => {
      if (params.getAll(input.dataset.rc6FilterKey).includes(input.dataset.rc6FilterValue)) input.checked = true;
      input.addEventListener('change', () => apply(true));
    });
    apply(false);
    window.AupingRC6Filter = { apply, productMatches, products };
  }

  function observeDOM() {
    const observer = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        rewriteLinks(node);
        node.querySelectorAll?.('.auping-static-search,.rc5-search,.auping-mobile-nav').forEach((legacy) => legacy.remove());
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function boot() {
    document.documentElement.dataset.aupingRc6 = VERSION;
    try {
      await loadData();
      window.AupingRC6 = { VERSION, state, normalizePath, resolveRoute, productMatches, searchRows };
      if (enforceCurrentRoute()) return;
      removeLegacyLayers();
      rewriteLinks();
      setupSearch();
      setupMobileMenu();
      setupFilters();
      observeDOM();
      document.dispatchEvent(new CustomEvent('auping:rc6-ready', { detail: { version: VERSION } }));
    } catch (error) {
      console.error('[Auping RC6] Failed to start', error);
      document.documentElement.dataset.aupingRc6Error = String(error?.message || error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
