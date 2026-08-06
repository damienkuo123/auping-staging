(() => {
  "use strict";

  const OFFICIAL_LOCATOR = "https://www.auping.com/en/store-locator";
  const DEFAULT_QUERY = "Auping Taiwan";
  const DEFAULT_ZOOM = 7;

  const mapUrl = (query, zoom = DEFAULT_ZOOM) =>
    `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${encodeURIComponent(String(zoom))}&output=embed`;

  const cleanSearch = (value) => String(value || "")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  function addButton(parent, label, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    parent.appendChild(button);
    return button;
  }

  function mount(section, index) {
    if (!(section instanceof HTMLElement) || section.dataset.aupingTaiwanMapReady === "true") return;

    const map = section.querySelector('[class*="GoogleMaps_GoogleMaps__"]');
    if (!(map instanceof HTMLElement)) return;

    section.dataset.aupingTaiwanMapReady = "true";
    section.dataset.aupingTaiwanMapIndex = String(index);

    const title = section.querySelector('[class*="StoreLocator_StoreLocator__Title"]');
    const subtitle = section.querySelector('[class*="StoreLocator_StoreLocator__SubTitle"]');
    if (title) title.textContent = "Auping 台灣門市";
    if (subtitle) subtitle.textContent = "查看台灣地區門市與試躺資訊";

    const frame = document.createElement("iframe");
    frame.className = "auping-tw-map-frame";
    frame.title = "Auping 台灣門市地圖";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.setAttribute("allowfullscreen", "");
    frame.src = mapUrl(DEFAULT_QUERY, DEFAULT_ZOOM);

    const toolbar = document.createElement("div");
    toolbar.className = "auping-tw-map-toolbar";

    const officialLink = document.createElement("a");
    officialLink.className = "auping-tw-map-link";
    officialLink.href = OFFICIAL_LOCATOR;
    officialLink.target = "_blank";
    officialLink.rel = "noopener noreferrer";
    officialLink.textContent = "官方門市資料 ↗";
    toolbar.appendChild(officialLink);

    const status = document.createElement("div");
    status.className = "auping-tw-map-status";
    status.setAttribute("role", "status");
    status.textContent = "地圖預設顯示台灣。門市名稱、營業時間與最新據點請以 Auping 官方門市資料為準。";

    map.replaceChildren(frame, toolbar, status);
    map.classList.add("auping-tw-map");

    const input = section.querySelector('input[type="text"], input:not([type])');
    const searchBox = section.querySelector('[class*="Sidebar_Sidebar__SearchBox"]') || input?.parentElement;

    const setMap = (query, zoom, message) => {
      frame.src = mapUrl(query, zoom);
      status.textContent = message;
      section.dataset.aupingTaiwanMapQuery = query;
    };

    const runSearch = () => {
      const value = cleanSearch(input?.value);
      if (!value) {
        setMap(DEFAULT_QUERY, DEFAULT_ZOOM, "已回到台灣全區。請輸入縣市、地區或郵遞區號縮小範圍。");
        return;
      }
      const query = `Auping ${value} Taiwan`;
      setMap(query, 11, `正在 Google Maps 搜尋「Auping ${value}」；正式門市資料請以官方 Store Locator 為準。`);
    };

    if (input instanceof HTMLInputElement) {
      input.disabled = false;
      input.readOnly = false;
      input.value = "";
      input.placeholder = "輸入台灣縣市、地區或郵遞區號";
      input.setAttribute("aria-label", "搜尋台灣 Auping 門市地區");
      input.dataset.aupingTwMapSearch = "true";
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          runSearch();
        }
      });
    }

    if (searchBox instanceof HTMLElement) {
      const actions = document.createElement("div");
      actions.className = "auping-tw-map-search-actions";
      addButton(actions, "搜尋台灣門市", "auping-tw-map-button", runSearch);

      const locate = addButton(actions, "使用目前位置", "auping-tw-map-button", () => {
        if (!navigator.geolocation) {
          status.textContent = "此瀏覽器不支援定位。請輸入台灣縣市或地區搜尋。";
          return;
        }
        locate.disabled = true;
        locate.textContent = "定位中…";
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const query = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
            setMap(query, 12, "已定位到目前位置。附近 Auping 門市請按「官方門市資料」確認。 ");
            locate.disabled = false;
            locate.textContent = "使用目前位置";
          },
          () => {
            status.textContent = "無法取得位置權限。請輸入縣市、地區或郵遞區號搜尋。";
            locate.disabled = false;
            locate.textContent = "使用目前位置";
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      });

      const sidebarOfficial = officialLink.cloneNode(true);
      sidebarOfficial.className = "auping-tw-map-link";
      actions.appendChild(sidebarOfficial);
      searchBox.appendChild(actions);

      const note = document.createElement("small");
      note.className = "auping-tw-map-note";
      note.textContent = "本地地圖以台灣為預設視角；經銷據點與營業資訊由 Auping 官方網站維護。";
      searchBox.appendChild(note);
    }

    section.dispatchEvent(new CustomEvent("auping:taiwan-map-ready", {
      bubbles: true,
      detail: { index, defaultQuery: DEFAULT_QUERY, officialLocator: OFFICIAL_LOCATOR }
    }));
  }

  function init() {
    const sections = [...document.querySelectorAll('[data-section="StoreLocator"], [class*="StoreLocator_StoreLocator__"]')]
      .filter((node, index, list) => node instanceof HTMLElement && list.indexOf(node) === index)
      .filter((node) => node.querySelector('[class*="GoogleMaps_GoogleMaps__"]'));
    sections.forEach(mount);
    document.documentElement.dataset.aupingTaiwanMapCount = String(sections.length);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
