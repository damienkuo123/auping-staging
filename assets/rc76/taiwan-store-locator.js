(() => {
  "use strict";
  const BASE = "/auping-staging";
  const DATA_URL = `${BASE}/data/rc76-taiwan-dealers.json`;
  const DETAIL_BASE = `${BASE}/stores`;
  const MAP_CENTER = [23.6978, 120.9605];
  const MAP_ZOOM = 7;
  let payloadPromise;

  const fetchDealers = () => payloadPromise ||= fetch(DATA_URL, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`dealer-data-${response.status}`);
      return response.json();
    });

  const telHref = (value) => `tel:${String(value || "").replace(/[^\d+]/g, "")}`;
  const routeHref = (dealer) =>
    `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`;
  const normalize = (value) => String(value || "").toLowerCase().replace(/\s+/g, "");
  const distanceKm = (a, b) => {
    const rad = (value) => value * Math.PI / 180;
    const r = 6371;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const lat1 = rad(a.lat);
    const lat2 = rad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * r * Math.asin(Math.sqrt(h));
  };

  const markerIcon = (label) => L.divIcon({
    className: "auping-dealer-marker-shell",
    html: `<span class="auping-dealer-marker" aria-label="${label}">a</span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
  });

  function createMap(element, dealers, options = {}) {
    const map = L.map(element, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    }).setView(options.center || MAP_CENTER, options.zoom || MAP_ZOOM);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
    }).addTo(map);

    const markers = new Map();
    const bounds = [];
    dealers.forEach((dealer) => {
      const marker = L.marker([dealer.lat, dealer.lng], {
        icon: markerIcon(dealer.shortName)
      }).addTo(map);
      marker.bindPopup(`
        <strong>${dealer.name}</strong><br>
        ${dealer.address}<br>
        <a href="${DETAIL_BASE}/${dealer.slug}/">查看門市</a>
      `);
      markers.set(dealer.id, marker);
      bounds.push([dealer.lat, dealer.lng]);
    });
    if (options.fit !== false && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [34, 34], maxZoom: 9 });
    }
    setTimeout(() => map.invalidateSize(), 80);
    return { map, markers };
  }

  function cardHtml(dealer, compact = false) {
    const hours = (dealer.hours || []).map((line) => `<li>${line}</li>`).join("");
    return `
      <article class="auping-dealer-card" data-dealer-id="${dealer.id}">
        <button class="auping-dealer-card__focus" type="button" data-dealer-focus="${dealer.id}">
          <span class="auping-dealer-card__pin">a</span>
          <span>
            <strong>${dealer.name}</strong>
            <small>${dealer.city}${dealer.district} · ${dealer.address}</small>
          </span>
        </button>
        ${compact ? "" : `
          <div class="auping-dealer-card__body">
            <a href="${telHref(dealer.phone)}">${dealer.phone}</a>
            <ul>${hours}</ul>
            <div class="auping-dealer-card__actions">
              <a href="${DETAIL_BASE}/${dealer.slug}/">門市資訊</a>
              <a href="${routeHref(dealer)}" target="_blank" rel="noopener">規劃路線</a>
              <a href="${telHref(dealer.appointmentPhone)}">預約試躺</a>
            </div>
          </div>
        `}
      </article>`;
  }

  function connectList(list, mapState) {
    list.__aupingDealerMapState = mapState;
    if (list.dataset.aupingDealerConnected === "true") return;
    list.dataset.aupingDealerConnected = "true";
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-dealer-focus]");
      if (!button) return;
      const state = list.__aupingDealerMapState;
      const marker = state?.markers.get(button.dataset.dealerFocus);
      if (!marker) return;
      state.map.flyTo(marker.getLatLng(), 14, { duration: .7 });
      marker.openPopup();
      list.querySelectorAll(".auping-dealer-card").forEach((card) =>
        card.classList.toggle(
          "is-active",
          card.dataset.dealerId === button.dataset.dealerFocus
        )
      );
    });
  }

  function mountLocatorPage(root, dealers) {
    const mapElement = root.querySelector("[data-auping-dealer-map]");
    const list = root.querySelector("[data-auping-dealer-list]");
    const search = root.querySelector("[data-auping-dealer-search]");
    const count = root.querySelector("[data-auping-dealer-count]");
    const locate = root.querySelector("[data-auping-dealer-locate]");
    if (!mapElement || !list) return;

    let visible = [...dealers];
    const mapState = createMap(mapElement, visible);
    const render = () => {
      list.innerHTML = visible.map((dealer) => cardHtml(dealer)).join("");
      count.textContent = `${visible.length} 間門市`;
      connectList(list, mapState);
    };
    render();

    search?.addEventListener("input", () => {
      const query = normalize(search.value);
      visible = query
        ? dealers.filter((dealer) =>
            normalize([dealer.name, dealer.shortName, dealer.city, dealer.district, dealer.address].join(" ")).includes(query))
        : [...dealers];
      render();
      const visibleIds = new Set(visible.map((dealer) => dealer.id));
      mapState.markers.forEach((marker, id) => {
        const shouldShow = visibleIds.has(id);
        const isShown = mapState.map.hasLayer(marker);
        if (shouldShow && !isShown) marker.addTo(mapState.map);
        if (!shouldShow && isShown) marker.remove();
      });
      const matches = visible.map((dealer) => mapState.markers.get(dealer.id)).filter(Boolean);
      if (matches.length === 1) mapState.map.flyTo(matches[0].getLatLng(), 14);
      else if (matches.length > 1) {
        mapState.map.fitBounds(L.featureGroup(matches).getBounds(), { padding: [34, 34], maxZoom: 10 });
      }
    });

    locate?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        root.querySelector("[data-auping-dealer-status]").textContent = "此瀏覽器不支援定位。";
        return;
      }
      locate.disabled = true;
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const here = { lat: coords.latitude, lng: coords.longitude };
          visible = [...dealers].map((dealer) => ({
            ...dealer, distanceKm: distanceKm(here, dealer)
          })).sort((a, b) => a.distanceKm - b.distanceKm);
          list.innerHTML = visible.map((dealer) =>
            cardHtml(dealer).replace("</small>", ` · 約 ${dealer.distanceKm.toFixed(1)} 公里</small>`)
          ).join("");
          count.textContent = "已依距離排序";
          connectList(list, mapState);
          mapState.map.flyTo([here.lat, here.lng], 10);
          L.circleMarker([here.lat, here.lng], {
            radius: 8, color: "#00539f", fillColor: "#fff", fillOpacity: 1, weight: 4
          }).addTo(mapState.map).bindPopup("您的位置").openPopup();
          root.querySelector("[data-auping-dealer-status]").textContent = "已依目前位置由近到遠排序。";
          locate.disabled = false;
        },
        () => {
          root.querySelector("[data-auping-dealer-status]").textContent = "無法取得位置權限。";
          locate.disabled = false;
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  function mountDetailPage(root, dealers) {
    const id = root.dataset.dealerId;
    const dealer = dealers.find((item) => item.id === id);
    const mapElement = root.querySelector("[data-auping-dealer-map]");
    if (!dealer || !mapElement) return;
    createMap(mapElement, [dealer], {
      center: [dealer.lat, dealer.lng],
      zoom: 15,
      fit: false
    });
  }

  function mountEmbedded(section, dealers, index) {
    if (section.dataset.aupingDealerEmbeddedReady === "true") return;
    const mapHost = section.querySelector('[class*="GoogleMaps_GoogleMaps__"]');
    if (!mapHost) return;
    section.dataset.aupingDealerEmbeddedReady = "true";

    const title = section.querySelector(
      '[class*="StoreLocator_StoreLocator__Title"]'
    );
    const subtitle = section.querySelector(
      '[class*="StoreLocator_StoreLocator__SubTitle"]'
    );
    if (title) title.textContent = "Auping 台灣門市";
    if (subtitle) subtitle.textContent = "尋找展示與試躺據點";

    const sidebarCandidates = [
      ...section.querySelectorAll('[class*="Sidebar_Sidebar__"]')
    ];
    const sidebar = sidebarCandidates.find((node) =>
      !sidebarCandidates.some(
        (other) => other !== node && other.contains(node)
      )
    );

    const list = document.createElement("div");
    list.className = "auping-embedded-dealer-list";
    const nearest = dealers.slice(0, 3);
    list.innerHTML = `
      <div class="auping-embedded-dealer-heading">
        <strong>台灣展示門市</strong>
        <a href="${BASE}/store-locator/">查看全部 ${dealers.length} 間</a>
      </div>
      ${nearest.map((dealer) => cardHtml(dealer, true)).join("")}
    `;

    const layout = document.createElement("div");
    layout.className = "auping-embedded-dealer-layout";
    mapHost.replaceWith(layout);
    layout.append(list, mapHost);
    if (sidebar && !layout.contains(sidebar)) sidebar.remove();

    mapHost.replaceChildren();
    mapHost.classList.add("auping-leaflet-map");
    const mapState = createMap(mapHost, dealers);
    connectList(list, mapState);
  }

  Promise.all([
    fetchDealers(),
    new Promise((resolve) => {
      if (window.L) return resolve();
      let attempts = 0;
      const timer = setInterval(() => {
        if (window.L || attempts++ > 80) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    })
  ]).then(([payload]) => {
    if (!window.L) throw new Error("leaflet-not-loaded");
    const dealers = payload.dealers || [];
    document.querySelectorAll("[data-auping-dealer-locator-page]").forEach((root) =>
      mountLocatorPage(root, dealers)
    );
    document.querySelectorAll("[data-auping-dealer-detail]").forEach((root) =>
      mountDetailPage(root, dealers)
    );
    const sections = [...document.querySelectorAll('[data-section="StoreLocator"], [class*="StoreLocator_StoreLocator__"]')]
      .filter((node) => node.querySelector?.('[class*="GoogleMaps_GoogleMaps__"]'))
      .filter((node, i, all) => !all.some((other, j) => i !== j && other.contains(node)));
    sections.forEach((section, index) => mountEmbedded(section, dealers, index));
    document.documentElement.dataset.aupingDealerRuntime = "ready";
  }).catch((error) => {
    console.error("[Auping Dealer Locator]", error);
    document.documentElement.dataset.aupingDealerRuntime = "error";
  });
})();