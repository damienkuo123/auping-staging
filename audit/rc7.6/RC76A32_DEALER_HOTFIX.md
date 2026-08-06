# RC7.6A.3.2 Dealer Routing + Layout Hotfix

Baseline: `8c8bce5b4003ef9a0d766e9d05fb07fc491f5d0c`

修正項目：

- 阻止 `/store-locator/` 被 RC7 Runtime 導回官方英文頁。
- 將 Leaflet 地圖限制在 Header 下方的 stacking context。
- 補回門市總覽與門市詳情頁的固定 Header 高度。
- 商品頁即使找不到官方雜湊 Sidebar class，也會建立穩定的門市清單＋地圖版面。
- 商品頁地圖高度改為 480px，手機 420px。
- 搜尋門市時同步隱藏不符合的地圖標記。
- 防止清單每次重繪都重複綁定 click listener。
- 修正 Store Locator 仍沿用 Noble 的 SEO／社群 metadata。
- 移除 Store Locator 不需要的 Noble 圖片 preload。
- 全頁更新 CSS／JS cache-buster，避免瀏覽器繼續使用舊地圖檔。

未包含：Noa 頁面的灰色空白媒體區塊。那是另一個商品素材問題，
不能在尚未確認正確來源圖片前任意替換。
