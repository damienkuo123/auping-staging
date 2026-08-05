(() => {
  "use strict";

  const script = document.querySelector("script[data-auping-rc75-combobox]");
  const configUrl = script?.dataset.config || "/auping-staging/data/rc75-combobox-variants.json";
  const pageId = document.documentElement.dataset.aupingPageId || "";

  const storageKey = (key) => `auping:rc75:${pageId}:${key}`;

  function getInitialValue(control) {
    const query = new URLSearchParams(location.search).get(control.queryParam);
    const stored = (() => {
      try { return localStorage.getItem(storageKey(control.key)); }
      catch (_) { return null; }
    })();
    const allowed = new Set(control.options.map((option) => option.value));
    if (query && allowed.has(query)) return query;
    if (stored && allowed.has(stored)) return stored;
    return allowed.has(control.defaultValue) ? control.defaultValue : control.options[0]?.value || "";
  }

  function updateState(binding, value, { updateUrl = true } = {}) {
    const { control, select, input, display, host } = binding;
    const option = control.options.find((item) => item.value === value);
    if (!option) return;

    select.value = option.value;
    select.dataset.aupingSelectedValue = option.value;
    input.dataset.aupingSelectedValue = option.value;
    input.value = option.value;
    if (display) display.textContent = option.label;
    host.dataset.aupingSelectedValue = option.value;

    try { localStorage.setItem(storageKey(control.key), option.value); }
    catch (_) { /* Storage can be disabled without breaking the control. */ }

    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set(control.queryParam, option.value);
      history.replaceState({ ...(history.state || {}), [control.key]: option.value }, "", url);
    }

    document.dispatchEvent(new CustomEvent("auping:variant-change", {
      detail: { pageId, key: control.key, value: option.value, label: option.label }
    }));
  }

  function bindControl(control) {
    const select = document.querySelector(`[data-auping-combobox-native="${CSS.escape(control.key)}"]`);
    const input = document.querySelector(`[data-auping-combobox="${CSS.escape(control.key)}"]`);
    if (!(select instanceof HTMLSelectElement) || !(input instanceof HTMLInputElement)) {
      return { ok: false, reason: `missing-${control.key}` };
    }

    const valueHost = select.parentElement;
    const display = select.previousElementSibling;
    const host = valueHost?.parentElement;
    if (!(host instanceof HTMLElement)) return { ok: false, reason: `missing-host-${control.key}` };

    host.dataset.aupingComboboxControl = control.key;
    host.dataset.aupingComboboxReady = "false";
    host.appendChild(select);

    select.setAttribute("aria-label", control.label);
    select.dataset.aupingComboboxNative = control.key;
    select.replaceChildren(...control.options.map((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      return option;
    }));

    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.setAttribute("readonly", "");

    const binding = { control, select, input, display, host };
    updateState(binding, getInitialValue(control), { updateUrl: false });

    select.addEventListener("change", () => updateState(binding, select.value));
    select.addEventListener("focus", () => { host.dataset.aupingFocusVisible = "true"; });
    select.addEventListener("blur", () => { delete host.dataset.aupingFocusVisible; });
    host.dataset.aupingComboboxReady = "true";
    return { ok: true, key: control.key, optionCount: control.options.length };
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
      document.dispatchEvent(new CustomEvent("auping:combobox-ready", { detail: { pageId, results } }));
    } catch (error) {
      document.documentElement.dataset.aupingComboboxStatus = "error";
      console.error("[Auping RC7.5] Combobox initialization failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
