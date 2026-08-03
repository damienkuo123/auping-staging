# Auping Level 2.5｜單一繁體中文網站 Final Plan

版本：2026-08-04 RC4  
基線：`damienkuo123/auping-staging` / commit `f4850b1`  
最終決策：**只保留一個繁體中文公開網站，不再維護英文、簡中或語言切換。**

## 1. 最終公開架構

- 唯一入口：`https://damienkuo123.github.io/auping-staging/`
- 所有主導覽、分類、商品、搜尋與篩選皆使用繁體中文。
- 不顯示語言切換器。
- 舊 `/en/`、`/zh/`、`/zh-tw/` 網址只負責重新導向到單一中文網站。
- Store Locator、Configurator 等依賴原站後端的特殊功能，仍轉接 Auping 官方網站。

## 2. Level 2.5 完成範圍

### 中文品牌網站
- 中文首頁
- Box Springs 床組、床架、床墊、床墊舒適層、床底、枕頭、寢具、被套
- 中文商品列表與中文商品詳情模板
- 關於 Auping、最新消息、客戶服務
- 中文 Header、Mega Menu、行動選單、Footer

### 真正可操作功能
- 全站中文搜尋索引
- 商品 Filter：跨群組 AND、同群組 OR
- Filter Chip、清除全部、網址參數同步、商品數量同步
- News 標籤篩選
- 商品圖片縮圖切換
- 手機版 Filter 展開與主選單

### Hybrid 官方功能
- 尋找門市
- Configurator / 設計並訂購
- 其他需要帳號、Session、即時資料或官方 API 的功能

## 3. 不再採用的舊架構

- 不再將英文網站與中文網站並列。
- 不再只靠零散文字替換翻譯既有英文 DOM。
- 不再保留 EN 按鈕或語言下拉選單。
- 不再讓商品連結落回 `/en/`。
- 不再使用無法辨識商品卡片的舊 Filter selector。
- 不再依賴原始搜尋按鈕的錯誤 `aria-label="Submit"`。

## 4. 驗收 Gate

- [ ] 根網址直接顯示繁體中文首頁
- [ ] 導覽與 Footer 無英文介面文字
- [ ] 商品卡連結留在單一中文網站
- [ ] Filter 點擊後商品數量與卡片同步
- [ ] Filter Chip 可移除條件
- [ ] Search 按鈕可開啟並回傳中文結果
- [ ] 手機選單、搜尋、Filter 可操作
- [ ] 舊語言網址會重新導向
- [ ] 特殊功能正確前往官方 Auping
- [ ] 部署後不需再次執行 18 分鐘大型 Audit

## 5. 後續升級

Level 2.5 完成後，如需更完整內容，可進入 Level 3：增加更多中文編輯內容、SEO、門市在地化資料與自建 CMS；不再重新引入多語言架構。
