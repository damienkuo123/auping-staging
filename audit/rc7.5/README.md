# Auping RC7.5 Semantic Contract + Combobox Vertical Slices

Locked source commit: `231f44d0222395ced9d5424f00d4cf129e7c82da`

## Static contract result

- Local routes processed: **121**
- Routes passing semantic validation: **121 / 121**
- Second installer pass: **0 HTML changes**
- Existing language inputs fixed to `zh-TW`: **136**
- Missing language controls materialized: **53**
- Missing or stale titles repaired: **51**
- Missing H1 headings repaired: **55**
- Exact existing product-card nodes tagged: **88**

## Interactive vertical slices

### 電動可調式床底 1M

- Width: **9** official values from the locked product dataset.
- Length: **4** official values from the locked product dataset.
- Selection updates visible value, URL query, semantic state, and localStorage.
- Reload restores the selected values.

### 白線棉緞被套

- Size: **4** official values from the locked product dataset.
- Selection updates visible value, URL query, semantic state, and localStorage.
- Reload restores the selected value.

## Browser evidence

Chromium passed all four cases:

- 1440×1000 — bed-base 1M
- 1440×1000 — White Lines Satin duvet cover
- 390×844 — bed-base 1M
- 390×844 — White Lines Satin duvet cover

Keyboard `End` → state update → `Escape` also passed for the bed-base Width control.
WebKit is explicitly recorded as **SKIP**, not PASS, because the executable is unavailable in this environment.
