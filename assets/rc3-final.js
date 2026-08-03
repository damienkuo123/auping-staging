(() => {
  'use strict';

  const ROOT_PREFIX = location.pathname.startsWith('/auping-staging/') ? '/auping-staging' : '';
  const isZh = /^\/(?:auping-staging\/)?zh-tw(?:\/|$)/i.test(location.pathname);
  const routePath = location.pathname.replace(/^\/auping-staging(?=\/|$)/, '');
  const zh = (en, tc) => isZh ? tc : en;
  const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const TAGS = ['About Auping', 'Design', 'Hotels', 'Sponsorship', 'Sustainability', 'Products', 'Awards', 'Sleep', 'Sport'];
  const TAG_TRANSLATIONS = {
    '關於 Auping':'About Auping','設計':'Design','飯店':'Hotels','贊助合作':'Sponsorship',
    '永續':'Sustainability','產品':'Products','獎項':'Awards','睡眠':'Sleep','運動':'Sport'
  };
  const canonicalTag = (value) => TAG_TRANSLATIONS[norm(value)] || norm(value);

  const MIRRORED = new Set([
    '/', '/box-springs', '/beds', '/mattresses', '/toppers', '/bed-bases', '/bed-linen',
    '/bed-linen/pillows', '/news', '/about-auping', '/customer-service',
    '/mattresses/elysium-mattress', '/bed-linen/duvet-covers/playful-bricks-duvet-cover'
  ]);

  const toLocalePath = (targetZh) => {
    let path = routePath.replace(/\/+$/, '') || '/';
    path = path.replace(/^\/en(?=\/|$)/, '') || '/';
    path = path.replace(/^\/zh-tw(?=\/|$)/, '') || '/';
    const mirrored = MIRRORED.has(path);
    if (targetZh) return `${ROOT_PREFIX}/zh-tw${mirrored ? path : '/'}/`.replace(/\/+/g, '/');
    return `${ROOT_PREFIX}/en${path === '/' ? '/' : `${path}/`}`.replace(/\/+/g, '/');
  };

  function setupLanguageSwitcher() {
    if (document.querySelector('.auping-language-toggle')) return;
    const nav = document.querySelector('nav[aria-label="primary"]');
    const header = nav?.closest('header') || document.querySelector('header') || document.body;
    const target = nav?.parentElement || header;
    const switcher = document.createElement('a');
    switcher.className = 'auping-language-toggle';
    switcher.href = toLocalePath(!isZh);
    switcher.hreflang = isZh ? 'en' : 'zh-Hant';
    switcher.lang = isZh ? 'en' : 'zh-Hant';
    switcher.textContent = isZh ? 'EN' : '中文';
    switcher.title = isZh ? 'Switch to English' : '切換為繁體中文';
    target.appendChild(switcher);
  }

  function removeLegacySearch() {
    document.querySelectorAll('.auping-static-search').forEach((el) => el.remove());
  }

  function getSearchIndex() {
    if (isZh && Array.isArray(window.AUPING_ZH_SEARCH_INDEX)) return window.AUPING_ZH_SEARCH_INDEX;
    return Array.isArray(window.AUPING_SEARCH_INDEX) ? window.AUPING_SEARCH_INDEX : [];
  }

  function searchPanel() {
    let panel = document.querySelector('.auping-search-inline');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'auping-search-inline';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="auping-search-inline__inner">
        <div class="auping-search-inline__field">
          <input type="search" autocomplete="off" placeholder="${zh('What are you looking for?', '你正在尋找什麼？')}" aria-label="${zh('Search Auping', '搜尋 Auping')}" />
          <button type="button" class="auping-search-inline__submit" aria-label="${zh('Search', '搜尋')}">⌕</button>
          <button type="button" class="auping-search-inline__close" aria-label="${zh('Close search', '關閉搜尋')}">×</button>
        </div>
        <div class="auping-search-inline__results" aria-live="polite"></div>
      </div>`;

    const nav = document.querySelector('nav[aria-label="primary"]');
    const header = nav?.closest('header') || document.querySelector('header');
    (header || document.body).insertAdjacentElement('afterend', panel);

    const input = panel.querySelector('input');
    const results = panel.querySelector('.auping-search-inline__results');

    const render = () => {
      const query = norm(input.value).toLowerCase();
      if (query.length < 2) {
        results.innerHTML = '';
        return;
      }
      const items = getSearchIndex().filter((item) => {
        const hay = `${item.title || ''} ${item.text || ''} ${item.type || ''}`.toLowerCase();
        return hay.includes(query);
      }).slice(0, 8);
      results.innerHTML = items.map((item) => {
        let href = item.url || '/en/';
        if (!href.startsWith('http')) href = `${ROOT_PREFIX}${href.startsWith('/') ? href : `/${href}`}`;
        if (isZh && href.includes('/en')) {
          const stripped = href.replace(ROOT_PREFIX, '').replace(/^\/en/, '') || '/';
          if (MIRRORED.has(stripped.replace(/\/+$/, '') || '/')) href = `${ROOT_PREFIX}/zh-tw${stripped}`;
        }
        return `<a href="${href}"><strong>${item.title || ''}</strong><span>${norm(item.text || '').slice(0, 150)}</span></a>`;
      }).join('') || `
        <div class="auping-search-inline__empty">
          <span>${zh('No local results found.', '找不到符合的本站內容。')}</span>
          <a target="_blank" rel="noopener noreferrer" href="https://www.auping.com/en/search?search=${encodeURIComponent(query)}">${zh('Search the official Auping website', '前往 Auping 官方網站搜尋')}</a>
        </div>`;
    };

    input.addEventListener('input', render);
    panel.querySelector('.auping-search-inline__submit').addEventListener('click', render);
    panel.querySelector('.auping-search-inline__close').addEventListener('click', () => {
      panel.hidden = true;
      input.value = '';
      results.innerHTML = '';
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') panel.querySelector('.auping-search-inline__close').click();
      if (event.key === 'Enter') render();
    });
    return panel;
  }

  function isSearchControl(control) {
    const text = `${control.getAttribute('aria-label') || ''} ${control.title || ''} ${control.textContent || ''}`.toLowerCase();
    if (control.closest('.auping-search-inline')) return false;
    return /\bsearch\b|搜尋/.test(text) || (control.classList.contains('icon-button') && /⌕|🔍/.test(text));
  }

  function setupSearchInterception() {
    removeLegacySearch();
    document.addEventListener('click', (event) => {
      const control = event.target.closest('button,a');
      if (!control || !isSearchControl(control)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      removeLegacySearch();
      const panel = searchPanel();
      panel.hidden = false;
      setTimeout(() => panel.querySelector('input')?.focus(), 20);
    }, true);
    new MutationObserver(removeLegacySearch).observe(document.documentElement, { childList: true, subtree: true });
  }

  function labelForInput(input) {
    const byFor = input.id ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`) : null;
    if (byFor) return norm(byFor.textContent);
    const parent = input.closest('label') || input.parentElement;
    return norm(parent?.textContent || '');
  }

  function cardMatchesFilter(cardText, group, label) {
    const text = cardText.toLowerCase();
    let value = label.toLowerCase();
    const localized = {
      '黑色':'black','米色':'beige','藍色':'blue','綠色':'green','灰色':'grey','粉紅色':'pink','紅色':'red','棕色':'brown','白色':'white',
      '單人':'single','雙人':'double'
    };
    value = localized[label] || value;
    if (/model/.test(group)) return text.includes(value);
    if (/color|colour/.test(group)) {
      const aliases = {
        black: ['black', 'deep', 'anthracite'], beige: ['beige', 'sand', 'natural'],
        blue: ['blue', 'indigo', 'night'], green: ['green', 'forest', 'olive'],
        grey: ['grey', 'gray', 'stone', 'ash'], pink: ['pink', 'rose', 'blush'],
        red: ['red', 'brick', 'burgundy'], brown: ['brown', 'walnut', 'oak'], white: ['white', 'ivory']
      };
      return (aliases[value] || [value]).some((word) => text.includes(word));
    }
    if (/version|size_person/.test(group)) {
      if (value === 'double') return /double|2-person|two person|tweepersoons/.test(text) || !/single|1-person|one person/.test(text);
      if (value === 'single') return /single|1-person|one person/.test(text);
    }
    return true;
  }

  function setupCatalogFilters() {
    const catalog = document.querySelector('[class*="CatalogWithFilters_base"]');
    if (!catalog) return;
    const inputs = [...catalog.querySelectorAll('input[type="checkbox"][name]')];
    const cards = [...catalog.querySelectorAll('[class*="EnrichedProductCard_Base"]')];
    if (!inputs.length || !cards.length) return;

    const params = new URLSearchParams(location.search);
    inputs.forEach((input) => {
      const values = params.getAll(input.name);
      if (values.includes(input.value)) input.checked = true;
    });

    const titleWrap = catalog.querySelector('[class*="CatalogWithFilters_productsTitle"]') || catalog.querySelector('h1')?.parentElement;
    const activeBar = document.createElement('div');
    activeBar.className = 'auping-active-filters';
    titleWrap?.insertAdjacentElement('afterend', activeBar);
    const count = catalog.querySelector('[class*="CatalogWithFilters_productsTotal"]');

    const update = (pushUrl = true) => {
      const selected = inputs.filter((input) => input.checked).map((input) => ({
        input, group: input.name, label: labelForInput(input)
      }));

      let visible = 0;
      cards.forEach((card) => {
        const text = norm(card.textContent);
        let show = selected.every(({ group, label }) => cardMatchesFilter(text, group, label));
        if (/\/box-springs\/?$/i.test(routePath) && selected.some((x) => x.group === 'boxspring_color' && x.input.value === '7202')) {
          show = /Criade Deep black|Kiruna Deep black/i.test(text);
        }
        card.hidden = !show;
        card.classList.toggle('auping-filter-hidden', !show);
        if (show) visible += 1;
      });

      if (count) count.textContent = selected.length ? `${visible} of ${visible}` : `${visible} of ${cards.length}`;
      activeBar.innerHTML = selected.length ? `<strong>${zh('Filters:', '篩選條件：')}</strong>` : '';
      selected.forEach(({ input, label }) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'auping-filter-chip';
        chip.textContent = `${label} ×`;
        chip.addEventListener('click', () => {
          input.checked = false;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        activeBar.appendChild(chip);
      });

      if (pushUrl) {
        const next = new URL(location.href);
        [...new Set(inputs.map((input) => input.name))].forEach((name) => next.searchParams.delete(name));
        inputs.filter((input) => input.checked).forEach((input) => next.searchParams.append(input.name, input.value));
        history.replaceState({}, '', next);
      }
    };

    inputs.forEach((input) => input.addEventListener('change', () => update(true)));
    update(false);
  }

  function setupNewsTags() {
    if (!/\/news\/?$/i.test(routePath)) return;
    const cards = [...document.querySelectorAll('[class*="BlogListItem_base"]')];
    if (!cards.length) return;
    const params = new URLSearchParams(location.search);
    let current = norm(params.get('tags') || '').toLowerCase();

    const controls = [...document.querySelectorAll('button,a')].filter((el) => TAGS.includes(canonicalTag(el.textContent)));
    const apply = (tag, updateUrl = true) => {
      current = canonicalTag(tag).toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const text = norm(card.textContent).toLowerCase();
        const localizedNeedle = Object.entries(TAG_TRANSLATIONS).find(([, en]) => en.toLowerCase() === current)?.[0]?.toLowerCase() || '';
        const match = !current || text.includes(current) || (localizedNeedle && text.includes(localizedNeedle));
        card.hidden = !match;
        card.classList.toggle('auping-news-hidden', !match);
        if (match) visible += 1;
      });
      controls.forEach((control) => {
        const active = canonicalTag(control.textContent).toLowerCase() === current;
        control.classList.toggle('auping-tag-active', active);
        control.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (updateUrl) {
        const next = new URL(location.href);
        if (current) next.searchParams.set('tags', current);
        else next.searchParams.delete('tags');
        history.replaceState({}, '', next);
      }
      const first = cards.find((card) => !card.hidden);
      if (first) first.parentElement?.prepend(first);
      document.documentElement.dataset.aupingNewsResults = String(visible);
    };

    controls.forEach((control) => {
      control.addEventListener('click', (event) => {
        event.preventDefault();
        apply(norm(control.textContent), true);
      });
    });
    apply(current, false);
  }

  function selectOptionByText(select, text) {
    const option = [...select.options].find((item) => norm(item.textContent).toLowerCase() === text.toLowerCase());
    if (option) select.value = option.value;
  }

  function setupProductDefaults() {
    document.querySelectorAll('[class*="ProductOptions_Wrapper"] select').forEach((select) => {
      if (select.value && !/^select/i.test(select.selectedOptions?.[0]?.textContent || '')) return;
      const labelId = select.closest('[class*="ProductOption"]')?.querySelector('[id$="-label"]')?.textContent || '';
      const label = norm(labelId).toLowerCase();
      if (label.startsWith('width') || label.includes('寬度')) selectOptionByText(select, '70 cm');
      else if (label.startsWith('length') || label.includes('長度')) selectOptionByText(select, '200 cm');
      else if (label.startsWith('body type') || label.includes('體型')) selectOptionByText(select, 'Y');
      else if (label.startsWith('firmness') || label.includes('硬度')) selectOptionByText(select, 'Medium');
    });
  }

  function cleanGeneratedCopy(text, title) {
    let value = norm(text);
    const markers = ['Add a splash of colour', 'An extra-long tuck-in strip', 'Sustainable and unique', 'Designed for'];
    const marker = markers.map((x) => value.indexOf(x)).filter((x) => x >= 0).sort((a, b) => a - b)[0];
    if (Number.isFinite(marker)) value = value.slice(marker);
    value = value.replace(new RegExp(`^.*?${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), title);
    return value;
  }

  function enhanceGeneratedProductPage() {
    const hero = document.querySelector('.generated-product-hero');
    if (!hero || hero.dataset.rc3Ready) return;
    hero.dataset.rc3Ready = 'true';
    document.body.classList.add('rc3-generated-product-page');

    const media = hero.querySelector('.generated-product-media');
    const copy = hero.querySelector('.generated-product-copy');
    const title = norm(copy?.querySelector('h1')?.textContent || document.querySelector('h1')?.textContent || 'Auping product');
    const gallery = document.querySelector('.generated-gallery');
    const galleryImages = [...(gallery?.querySelectorAll('img') || [])];
    const heroImage = media?.querySelector('img');
    const validGallery = galleryImages.find((img) => !/bat\.bing\.com|\.gif(?:\?|$)/i.test(img.src));
    if (heroImage && (/bat\.bing\.com|\.gif(?:\?|$)/i.test(heroImage.src) || heroImage.naturalWidth <= 2)) {
      if (validGallery) heroImage.src = validGallery.src;
    }
    heroImage?.removeAttribute('onerror');

    if (copy) {
      const isDuvet = /duvet cover|被套/i.test(title);
      const displayTitle = title.replace(/\s+/g, ' ');
      copy.innerHTML = `
        <span class="eyebrow">${zh('Product variant', '商品款式')}</span>
        <h1>${displayTitle}</h1>
        <p class="rc3-product-type">${isDuvet ? zh('Duvet Cover', '被套') : zh('Auping product', 'Auping 商品')}</p>
        <ul class="rc3-product-facts">
          ${isDuvet ? `<li>✓ ${zh('Including 1 pillowcase 60x70cm', '內含 1 個 60×70 公分枕套')}</li>` : ''}
          <li>✓ ${zh('Collection: Seasonal collection', '系列：季節限定系列')}</li>
        </ul>
        <button type="button" class="rc3-specs-toggle">${zh('View all specifications', '查看所有規格')}⌄</button>
        <div class="rc3-product-option-panel">
          <label>${zh('Size', '尺寸')}</label>
          <select aria-label="${zh('Size', '尺寸')}">
            <option>${isDuvet ? '140 x 200/220 cm' : zh('Standard size', '標準尺寸')}</option>
          </select>
          <a class="primary-button" target="_blank" rel="noopener noreferrer" href="https://www.auping.com/en/store-locator">${zh('Find a store', '尋找門市')}</a>
          <a class="outline-button" target="_blank" rel="noopener noreferrer" href="https://configurator.auping.com/en-gb">${zh('Design and order', '設計並訂購')}</a>
        </div>`;
    }

    document.querySelectorAll('.generated-gallery img').forEach((img) => {
      if (/bat\.bing\.com\/action/i.test(img.src)) {
        img.src = validGallery?.src || `${ROOT_PREFIX}/assets/images/bed-linen/category-1.jpg`;
      }
    });

    const copySections = [...document.querySelectorAll('.generated-copy-section')];
    let description = '';
    copySections.forEach((section) => {
      const heading = norm(section.querySelector('h2')?.textContent);
      const paragraph = norm(section.querySelector('p')?.textContent);
      const navNoise = /(Bed linen Duvet covers Duvets Fitted sheets|Products Box springs Beds Mattresses)/i.test(paragraph);
      if (navNoise || paragraph.length < 20) {
        section.hidden = true;
        return;
      }
      if (!description && /playful bricks|product|easy to make|sustainable|comfort/i.test(`${heading} ${paragraph}`)) {
        description = cleanGeneratedCopy(paragraph, title);
      }
      section.classList.add('rc3-clean-copy-section');
    });

    if (/playful-bricks-duvet-cover/i.test(routePath)) {
      description = zh(
        'Add a splash of colour to your bedroom with Playful Bricks. The cheerful, rounded blocks in warm shades turn your bed into a true statement piece. Prefer a calmer look? Simply flip it over to reveal the solid blue reverse side. The Playful Bricks duvet cover is made from 100% organic cotton satin for a wonderfully smooth and comfortable feel.',
        '用 Playful Bricks 為臥室注入鮮明色彩。溫暖色調的圓潤幾何圖形，讓床鋪成為空間中的視覺焦點。想要更沉靜的氛圍時，只要翻面即可使用純藍色背面。這款被套採用 100% 有機棉緞製成，觸感柔滑舒適。'
      );
    }

    if (description && !document.querySelector('.rc3-product-description')) {
      const section = document.createElement('section');
      section.className = 'page-shell rc3-product-description';
      section.innerHTML = `<h2>${zh('Designed for a colourful bedroom', '為臥室增添鮮明個性')}</h2><p>${description}</p>`;
      (gallery || hero).insertAdjacentElement('afterend', section);
    }

    document.querySelector('.rc3-specs-toggle')?.addEventListener('click', () => {
      const spec = copySections.find((section) => /spec/i.test(norm(section.querySelector('h2')?.textContent)));
      if (spec) {
        spec.hidden = false;
        spec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function localizeRuntimeLabels() {
    if (!isZh) return;
    const exact = {
      'Auping Elysium Mattress': 'Auping Elysium 床墊', 'Read More': '閱讀更多', 'More Info': '更多資訊', 'More information': '更多資訊',
      'Make an appointment': '預約諮詢', 'Find an Auping store': '尋找 Auping 門市',
      'Personalise your order': '客製化您的訂單', 'Related products': '相關商品',
      'Product specifications': '商品規格', 'More Specifications': '更多規格',
      'Select...': '請選擇…', 'Soft': '柔軟', 'Medium': '適中', 'Firm': '偏硬',
      'Width': '寬度', 'Length': '長度', 'Body type': '體型', 'Firmness': '硬度'
    };
    document.querySelectorAll('button,a,label,option,span,h1,h2,h3,h4').forEach((el) => {
      const text = norm(el.textContent);
      if (exact[text] && el.childElementCount === 0) el.textContent = exact[text];
    });
  }

  function boot() {
    setupLanguageSwitcher();
    setupSearchInterception();
    setupCatalogFilters();
    setupNewsTags();
    setupProductDefaults();
    enhanceGeneratedProductPage();
    localizeRuntimeLabels();
    document.documentElement.classList.add('auping-rc3-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  setTimeout(boot, 700);
})();
