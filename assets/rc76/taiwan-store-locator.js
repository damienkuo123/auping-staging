(() => {
  "use strict";

  const LOCAL_LOCATOR = "/auping-staging/store-locator/";
  const TAIWAN_CENTER = { lat: 23.6978, lng: 120.9605 };
  const DEFAULT_ZOOM = 7;

  const defaultMapUrl = () =>
    `https://www.google.com/maps?ll=${TAIWAN_CENTER.lat},${TAIWAN_CENTER.lng}&z=${DEFAULT_ZOOM}&hl=zh-TW&output=embed`;

  const searchMapUrl = (query, zoom = 11) =>
    `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${encodeURIComponent(String(zoom))}&hl=zh-TW&output=embed`;

  const cleanSearch = (value) => String(value || "")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  function localizeLocatorLinks() {
    document.querySelectorAll("a[href]").forEach((anchor) => {
      if (anchor.dataset.aupingExternalGlobalLocator === "true") return;
      let url;
      try { url = new URL(anchor.href, location.href); } catch (_) { return; }
      const official = /(^|\.)auping\.com$/i.test(url.hostname) && /\/(?:en\/)?store-locator\/?$/i.test(url.pathname);
      const capturedLocal = /\/store-locator\/?$/i.test(url.pathname) && url.hostname === location.hostname;
      if (!official && !capturedLocal) return;
      anchor.href = LOCAL_LOCATOR;
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
      anchor.dataset.aupingLocalStoreLocator = "true";
    });
  }

  function makeButton(label, variant, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `auping-tw-locator-button auping-tw-locator-button--${variant}`;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function createMapFrame(title) {
    const frame = document.createElement("iframe");
    frame.className = "auping-tw-map-frame";
    frame.title = title;
    frame.loading = "eager";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.setAttribute("allowfullscreen", "");
    frame.src = defaultMapUrl();
    return frame;
  }

  function bindPanel({ panel, frame, input, status }) {
    const setMap = (src, message) => {
      frame.src = src;
      status.textContent = message;
    };

    const runSearch = () => {
      const value = cleanSearch(input.value);
      if (!value) {
        setMap(defaultMapUrl(), "已回到台灣全區。請輸入縣市、行政區或郵遞區號縮小範圍。");
        return;
      }
      setMap(
        searchMapUrl(`Auping ${value} Taiwan`, 11),
        `正在搜尋「${value}」附近的 Auping 據點。門市資訊請再向經銷據點確認。`
      );
    };

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      runSearch();
    });

    const actions = document.createElement("div");
    actions.className = "auping-tw-locator-actions";
    actions.appendChild(makeButton("搜尋台灣門市", "primary", runSearch));

    const locate = makeButton("使用目前位置", "secondary", () => {
      if (!navigator.geolocation) {
        status.textContent = "此瀏覽器不支援定位，請輸入縣市或行政區搜尋。";
        return;
      }
      locate.disabled = true;
      locate.textContent = "定位中…";
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const coordinate = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
          setMap(searchMapUrl(coordinate, 12), "已定位到目前位置。請在地圖中查看附近據點。");
          locate.disabled = false;
          locate.textContent = "使用目前位置";
        },
        () => {
          status.textContent = "無法取得位置權限，請輸入縣市或行政區搜尋。";
          locate.disabled = false;
          locate.textContent = "使用目前位置";
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
    actions.appendChild(locate);
    panel.appendChild(actions);
  }

  function buildEmbeddedPanel(section, map, index) {
    const sidebarCandidates = [...section.querySelectorAll('[class*="Sidebar_Sidebar__"]')];
    const sidebar = sidebarCandidates.find((node) =>
      !sidebarCandidates.some((other) => other !== node && other.contains(node))
    ) || null;

    const panel = document.createElement("div");
    panel.className = "auping-tw-locator-panel";
    panel.innerHTML = `
      <p class="auping-tw-locator-eyebrow">Auping 台灣</p>
      <h3 class="auping-tw-locator-title">尋找試躺門市</h3>
      <p class="auping-tw-locator-copy">輸入縣市、行政區或郵遞區號，查看台灣附近據點。</p>
      <label class="auping-tw-locator-label" for="auping-tw-map-search-${index}">地區</label>
    `;

    const input = document.createElement("input");
    input.id = `auping-tw-map-search-${index}`;
    input.className = "auping-tw-locator-input";
    input.type = "search";
    input.placeholder = "例如：台北、台中、高雄";
    input.autocomplete = "postal-code";
    input.dataset.aupingTwMapSearch = "true";
    panel.appendChild(input);

    const status = document.createElement("p");
    status.className = "auping-tw-locator-status";
    status.setAttribute("role", "status");
    status.textContent = "地圖預設顯示台灣全區。";
    bindPanel({ panel, frame: map.querySelector("iframe"), input, status });
    panel.appendChild(status);

    if (sidebar instanceof HTMLElement) {
      sidebar.replaceChildren(panel);
      sidebar.dataset.aupingTaiwanSidebar = "clean";
    } else {
      section.insertBefore(panel, map);
    }
  }

  function findStoreLocatorSections() {
    const explicit = [...document.querySelectorAll('[data-section="StoreLocator"]')]
      .filter((node) => node instanceof HTMLElement)
      .filter((node) => node.querySelector('[class*="GoogleMaps_GoogleMaps__"]'));
    if (explicit.length) return explicit;

    const candidates = [...document.querySelectorAll('[class*="StoreLocator_StoreLocator__"]')]
      .filter((node) => node instanceof HTMLElement)
      .filter((node) => node.querySelector('[class*="GoogleMaps_GoogleMaps__"]'));
    return candidates.filter((node) =>
      !candidates.some((other) => other !== node && other.contains(node))
    );
  }

  function mountEmbedded(section, index) {
    if (section.dataset.aupingTaiwanMapReady === "true") return;
    const map = section.querySelector('[class*="GoogleMaps_GoogleMaps__"]');
    if (!(map instanceof HTMLElement)) return;

    section.querySelectorAll(
      ".auping-tw-map-toolbar,.auping-tw-map-status,.auping-tw-map-search-actions,.auping-tw-map-note,.auping-tw-locator-panel"
    ).forEach((node) => node.remove());

    section.dataset.aupingTaiwanMapReady = "true";
    section.dataset.aupingTaiwanMapIndex = String(index);

    const title = section.querySelector('[class*="StoreLocator_StoreLocator__Title"]');
    const subtitle = section.querySelector('[class*="StoreLocator_StoreLocator__SubTitle"]');
    if (title) title.textContent = "Auping 台灣門市";
    if (subtitle) subtitle.textContent = "在台灣尋找展示與試躺據點";

    const frame = createMapFrame("Auping 台灣門市地圖");
    map.replaceChildren(frame);
    map.classList.add("auping-tw-map");
    buildEmbeddedPanel(section, map, index);
  }

  function mountStandalone(root) {
    if (!(root instanceof HTMLElement) || root.dataset.aupingTaiwanMapReady === "true") return;
    const frame = root.querySelector("[data-auping-tw-standalone-frame]");
    const input = root.querySelector("[data-auping-tw-standalone-search]");
    const panel = root.querySelector("[data-auping-tw-standalone-panel]");
    const status = root.querySelector("[data-auping-tw-standalone-status]");
    if (!(frame instanceof HTMLIFrameElement) || !(input instanceof HTMLInputElement) ||
        !(panel instanceof HTMLElement) || !(status instanceof HTMLElement)) return;

    frame.src = defaultMapUrl();
    bindPanel({ panel, frame, input, status });
    root.dataset.aupingTaiwanMapReady = "true";
  }

  function init() {
    localizeLocatorLinks();
    findStoreLocatorSections().forEach(mountEmbedded);
    document.querySelectorAll("[data-auping-tw-standalone]").forEach(mountStandalone);
    document.documentElement.dataset.aupingTaiwanMapCount =
      String(document.querySelectorAll('[data-auping-taiwan-map-ready="true"]').length);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();