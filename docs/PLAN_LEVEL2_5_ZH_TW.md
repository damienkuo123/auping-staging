# Auping Level 2.5 Hybrid + 繁體中文網站｜Final Plan

版本：2026-08-04  
正式目標：**Level 2.5 Hybrid 英文站 + 同範圍繁體中文站**  
英文基線：`damienkuo123/auping-staging` / commit `6521454`

## 1. 最終交付定義

### 英文站

- 首頁、Header、Mega Menu、Mobile Menu、Footer
- 七個主要分類頁：Box Springs、Beds、Mattresses、Toppers、Bed Bases、Pillows、Bed Linen
- News Tag 篩選
- 商品列表 Filter 與網址 Query 同步
- 原站式 Header 下方 Search Bar，搜尋本站索引
- Mattress 商品模板與預設選項
- Bed Linen／Duvet Cover 商品模板
- 影片 WebM 優先、MP4 與 Poster fallback
- Store Locator、Configurator、Contact、My Auping、Cart 等特殊功能轉接官方網站

### 繁體中文站

繁體中文版本與 Level 2.5 英文範圍對齊，路徑使用：

```text
/zh-tw/
```

本次提供：

- 繁體中文首頁
- 七個主要分類頁
- News
- About Auping
- Customer Service
- Elysium Mattress 代表商品頁
- Playful Bricks Duvet Cover 代表商品頁／共用 Bed Linen 商品模板
- 中文 Header、導覽、篩選、Search、CTA、商品欄位、主要標題與主要說明內容
- EN／中文語言切換
- 中文站內搜尋索引

Level 2.5 範圍外的深層頁面，暫時保留英文內容或轉接官方 Auping；完整 1,000+ 頁繁中逐頁翻譯屬於 Level 3 Localization。

## 2. RC3 一次性完成項目

1. **Filter Finalization**
   - Checkbox 實際篩選商品卡
   - URL Query 自動還原選項
   - 顯示選取中的 Filter Chip
   - 商品數量即時更新
   - Box Springs `boxspring_color=7202` 對應 Black 並顯示相符商品

2. **News Tag Finalization**
   - `?tags=awards` 等參數生效
   - 選中的 Tag 顯示藍底狀態
   - 只顯示相符文章
   - 點擊 Tag 不需重新載入整頁

3. **Search Finalization**
   - 搜尋列於 Header 下方展開
   - 使用既有本站搜尋索引
   - 顯示前 8 筆結果與摘要
   - 無本地結果時可轉官方 Auping Search

4. **Product Detail Finalization**
   - Elysium 預設：70 cm／200 cm／Y／Medium
   - 將 RC3 商品詳情模板套用至 161 個 generated English product pages
   - Generated Bed Linen 商品頁改成左圖右資訊模板
   - 修正 1×1 GIF／追蹤像素造成的空白商品圖
   - Size、Find a store、Design and order、Specifications 可用
   - 清除抓取後堆疊的導覽噪音文字

5. **繁體中文 Localization**
   - 13 個 Level 2.5 核心路徑建立 `/zh-tw/` 鏡像
   - 共享 UI 與主要內容繁體中文化
   - 中文 Search Index
   - EN／中文切換
   - `hreflang` 標籤

## 3. Level 2.5 Final Gate

| Gate | 完成條件 |
|---|---|
| G1 部署 | GitHub Pages Deploy 成功 |
| G2 共用 UI | Header、Mega Menu、Mobile Menu、Search、Footer 正常 |
| G3 分類 | 七個分類頁可用，Filter 可操作 |
| G4 商品頁 | Mattress 與 Bed Linen 代表模板通過 |
| G5 Hybrid | 特殊功能正確轉接官方 Auping |
| G6 中文 | 13 個核心繁中路徑、語言切換與中文搜尋可用 |
| G7 QA | Chrome Desktop、Safari Desktop、iPhone 實機抽測 |
| G8 交付 | ZIP、Plan、Handoff、Manifest、Checksums 完整 |

## 4. 一次性執行策略

```text
RC3 整合安裝
→ 一次 Push
→ 等 Pages Deploy
→ 只做聚焦實機 QA
→ 若無 P0 阻斷，宣告 Level 2.5 + 繁中完成
```

不再每個小修正重跑 18 分鐘完整 Audit。完整 Audit 只在最終需要量化差異時手動執行。

## 5. 本次不擴張項目

- 1,000+ 深層頁面逐頁繁中翻譯
- 原站搜尋後端與排名演算法
- Store Locator、Configurator、帳號與購物車後端
- CMS 管理後台
- 所有商品頁逐頁 Pixel QA

這些項目可在 Level 3／4／5 繼續升級，不阻擋 Level 2.5 正式完成。
