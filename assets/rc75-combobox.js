(() => {
  "use strict";

  const script = document.querySelector('script[data-auping-rc75-combobox="runtime"]');
  const configUrl = script?.dataset.config || "/auping-staging/data/rc75-combobox-variants.json";
  const pageId = document.documentElement.dataset.aupingPageId || "";

  const storageKey = (key) => `auping:rc75:${pageId}:${key}`;

  function initialValue(control) {
    const query = new URLSearchParams(location.search).get(control.queryParam || control.key);
    let stored = null;
    try { stored = localStorage.getItem(storageKey(control.key)); } catch (_) {}
    const allowed = new Set(control.options.map((option) => option.value));
    if (query && allowed.has(query)) return query;
    if (stored && allowed.has(stored)) return stored;
    return allowed.has(control.defaultValue) ? control.defaultValue : control.options[0]?.value || "";
  }

  function updateUrl(control, value) {
    const url = new URL(location.href);
    url.searchParams.set(control.queryParam || control.key, value);
    history.replaceState({ ...(history.state || {}), [control.key]: value }, "", url);
  }

  function updateState(binding, value, { updateAddress = true } = {}) {
    const { control, select, input, display, host } = binding;
    const option = control.options.find((item) => item.value === value);
    if (!option) return;

    select.value = option.value;
    select.dataset.aupingSelectedValue = option.value;
    host.dataset.aupingSelectedValue = option.value;
    if (input) {
      input.dataset.aupingSelectedValue = option.value;
      input.value = option.value;
    }
    if (display) display.textContent = option.label;

    try { localStorage.setItem(storageKey(control.key), option.value); } catch (_) {}
    if (updateAddress) updateUrl(control, option.value);

    document.dispatchEvent(new CustomEvent("auping:variant-change", {
      detail: { pageId, key: control.key, value: option.value, label: option.label, mode: control.mode }
    }));
  }

  function findHost(select, control) {
    if (control.mode === "react-overlay") {
      return select.parentElement?.parentElement || select.parentElement;
    }
    return select.closest('[class*="ProductOptionsSelect_ProductOption"]') || select.parentElement;
  }

  function bindControl(control) {
    const select = document.querySelector(`[data-auping-combobox-native="${CSS.escape(control.key)}"]`);
    const input = document.querySelector(`[data-auping-combobox="${CSS.escape(control.key)}"]`);
    if (!(select instanceof HTMLSelectElement)) return { ok: false, reason: `missing-select-${control.key}` };
    if (control.mode === "react-overlay" && !(input instanceof HTMLInputElement)) {
      return { ok: false, reason: `missing-input-${control.key}` };
    }

    const host = findHost(select, control);
    if (!(host instanceof HTMLElement)) return { ok: false, reason: `missing-host-${control.key}` };
    host.dataset.aupingComboboxControl = control.key;
    host.dataset.aupingComboboxMode = control.mode;
    host.dataset.aupingComboboxReady = "false";

    select.replaceChildren(...control.options.map((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      return option;
    }));
    select.setAttribute("aria-label", control.label);
    select.dataset.aupingComboboxNative = control.key;

    let display = null;
    if (control.mode === "react-overlay") {
      const valueWrapper = select.parentElement;
      display = valueWrapper?.querySelector('[class*="singleValue"]') || select.previousElementSibling;
      input.tabIndex = -1;
      input.setAttribute("aria-hidden", "true");
      input.setAttribute("readonly", "");
    }

    const binding = { control, select, input: input instanceof HTMLInputElement ? input : null, display, host };
    updateState(binding, initialValue(control), { updateAddress: false });
    select.addEventListener("change", () => updateState(binding, select.value));
    select.addEventListener("focus", () => { host.dataset.aupingFocusVisible = "true"; });
    select.addEventListener("blur", () => { delete host.dataset.aupingFocusVisible; });
    host.dataset.aupingComboboxReady = "true";
    return { ok: true, key: control.key, mode: control.mode, optionCount: control.options.length };
  }

  async function init() {
    if (!pageId) return;
    try {
      const response = await fetch(configUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`config-http-${response.status}`);
      const config = await response.json();
      const page = config.pages?.[pageId];
      if (!page) return;
      const results = page.controls.map(bindControl);
      document.documentElement.dataset.aupingComboboxStatus = results.every((item) => item.ok) ? "ready" : "error";
      document.documentElement.dataset.aupingComboboxCount = String(results.filter((item) => item.ok).length);
      document.dispatchEvent(new CustomEvent("auping:combobox-ready", { detail: { pageId, results } }));
    } catch (error) {
      document.documentElement.dataset.aupingComboboxStatus = "error";
      console.error("[Auping RC7.5 Phase 02] Combobox initialization failed", error);
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
