(() => {
  "use strict";
  const script = document.querySelector('script[data-auping-rc75-catalog="runtime"]');
  const configUrl = script?.dataset.config || "/auping-staging/data/rc75-catalog-parity.json";
  const pageId = document.documentElement.dataset.aupingPageId || document.documentElement.dataset.rc73Page || "";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const matches = (product, selected) => Object.entries(selected).every(([key, values]) =>
    !values.length || values.some((value) => (product.attributes?.[key] || []).includes(value))
  );

  function findCountNode() {
    return $$('*').find((node) => /^共\s*\d+\s*件商品$/.test((node.textContent || '').trim())) || null;
  }

  async function init() {
    if (!pageId) return;
    try {
      const response = await fetch(configUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`config-http-${response.status}`);
      const payload = await response.json();
      const config = payload.pages?.[pageId];
      if (!config) return;

      const list = $('[class*="ProductList_container"]');
      if (!list) throw new Error('missing-product-list');
      const productMap = new Map(config.products.map((product) => [product.title, product]));
      const cards = [...list.children].map((card) => {
        const title = ($('[class*="ProductCard_Title"]', card)?.textContent || '').trim().replace(/\s+/g, ' ');
        const product = productMap.get(title) || null;
        card.dataset.aupingProductKind = product ? 'product' : 'promotion';
        if (product) card.dataset.aupingProductTitle = title;
        return { card, title, product };
      });

      const inputs = [];
      config.groups.forEach((group) => group.options.forEach((option) => {
        const input = document.getElementById(option.inputId);
        if (!(input instanceof HTMLInputElement)) return;
        input.dataset.aupingFilterGroup = group.key;
        input.dataset.aupingFilterValue = option.value;
        input.dataset.aupingFilterQuery = group.queryKey || group.key;
        inputs.push(input);
      }));
      if (!inputs.length) throw new Error('missing-filter-inputs');

      const selected = () => {
        const state = {};
        inputs.filter((input) => input.checked).forEach((input) => {
          (state[input.dataset.aupingFilterGroup] ||= []).push(input.dataset.aupingFilterValue);
        });
        return state;
      };

      const syncUrl = (state) => {
        const url = new URL(location.href);
        config.groups.forEach((group) => url.searchParams.delete(group.queryKey || group.key));
        Object.entries(state).forEach(([key, values]) => {
          const group = config.groups.find((item) => item.key === key);
          values.forEach((value) => url.searchParams.append(group?.queryKey || key, value));
        });
        history.replaceState({}, '', url);
      };

      const countNode = findCountNode();
      const apply = (updateAddress = true) => {
        const state = selected();
        const active = Object.values(state).some((values) => values.length);
        let visible = 0;
        cards.forEach(({ card, product }) => {
          const show = !product || !active || matches(product, state);
          card.hidden = !show;
          card.dataset.aupingVisible = show ? '1' : '0';
          if (product && show) visible += 1;
        });
        if (countNode) countNode.textContent = `共 ${visible} 件商品`;
        document.documentElement.dataset.aupingCatalogVisible = String(visible);
        if (updateAddress) syncUrl(state);
        document.dispatchEvent(new CustomEvent('auping:catalog-filter', { detail: { pageId, visible, state } }));
        return visible;
      };

      const params = new URLSearchParams(location.search);
      inputs.forEach((input) => {
        if (params.getAll(input.dataset.aupingFilterQuery).includes(input.dataset.aupingFilterValue)) input.checked = true;
        input.addEventListener('change', () => apply(true));
      });

      apply(false);
      document.documentElement.dataset.aupingCatalogReady = pageId;
      document.documentElement.dataset.aupingCatalogProducts = String(config.products.length);
      window.AupingRC75Catalog = { apply, matches, config, cards, inputs };
    } catch (error) {
      document.documentElement.dataset.aupingCatalogError = String(error?.message || error);
      console.error('[Auping RC7.5 Phase 02] Catalog initialization failed', error);
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0), { once: true })
    : setTimeout(init, 0);
})();
