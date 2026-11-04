# AUPING TAIWAN — 全站共用元件／版型權威登記（AGENTS.md）

> **所有新對話串、AI 程式助手、修復工程在修改任何檔案前，必須先閱讀本文件。** 這是一份「修改前的硬性檢查契約」，不是「所有元件已修好」的證書。
>
> **本次文件基準：2026-11-04，GitHub `damienkuo123/auping-staging`，`main` = `cd74b2e95f84de6482d9b87969b191c44cfedf86`。**
> 正式權威永遠是 **GitHub 遠端 `main` 當下的 HEAD＋該 Commit 的實際檔案**，不是這個固定 SHA、舊 ZIP、先前聊天摘要，也不是名為 `CURRENT` 的舊交接文件。HEAD 前進後，本表須重新驗證並更新。
> **重要：本檔目前是新產生的待加入文件，若尚未 Commit 到 `main`，就不能宣稱它已在 GitHub 被保護。**

## 0. 不可違反的工程規則（修改前先讀）

1. **一個功能只有一個控制者。** 先查目前 DOM 使用的 CSS、JS、inline event、原生 `<details>`、第三方 Slick／React 是否已有控制權。已有主人就修原主人，**禁止再疊一支全域 JavaScript 攔截 click、複製事件或直接重寫 HTML**。
2. **不打掉重練已驗收的共用元件。** 保留當前 RC7 Read More 的短文門檻、實體截斷、全文開合、資料來源、原生 owner 特例；保留 U1/U2/U3/U4D、C2、導航、台灣店家、產品選項、Safari 已接受範圍。只修證據確認的缺陷。
3. **共用修復不是全站強制覆蓋。** 同一 `data-section` 未必同一種 DOM 結構／事件 owner／版型；先列出所有命中路由與例外，再修改最小共用責任區域，最後驗證所有受影響家族。`body`、全站 `[class*=...]`、通用 `button` 的 `!important` 預設禁止。
4. **官方實際行為＋畫面＋來源才是對照真相。** DOM 存在、SHA、CI 綠燈、按鈕可點、`aria-expanded=true`、Chrome 模擬 iPhone，單獨都不等於官方 1:1。台灣繁中換行可合理重排；不能因此改掉版型、圖片身份、文章順序與互動結果。
5. **媒體不能猜。** 少圖、影片不可播要先核對官方媒體 URL／本地檔案是否存在及 `currentSrc`、`naturalWidth`、播放時間是否推進；不得拿看起來相似的照片／影片／占位卡替代。
6. **內容不可任意重寫。** 禁止 `innerHTML` 重建既有正文、截取原文、翻譯成沒有來源的敘述，禁止用自行拼湊的 Stories 卡片陣列取代官方首篇大圖＋實際 BlogList 模板。
7. **已通過的頁面優先保護。** 寫入前列出白名單、每檔原始 Git blob/SHA、受影響路由；只修改有證據的元件。同步驗證 1440px desktop、390/440px mobile（真實 iPhone Safari 另行人工驗收）、hover/focus/swipe、媒體與相關路由。不要把舊代表性 PASS 推廣成全站 PASS。
8. **`main` 是唯一工作版本，沒有平行版權威。** 不擅自 Push、Reset、Force Push、還原已接受的 88 檔；Mac 有未提交異動先比對、決定保留或撤銷，絕不覆蓋。最終只在使用者確認後於 `main` Commit／Push，並記錄新 HEAD。
9. **有既有 owner 就先追查既有 contract，找不到才能設計新 owner。** 新 owner 需有明確 selector、作用路由、排他性標記、雙控制器衝突測試、官方對照及回退方案；不准因某頁沒反應就新增通用攔截器。
10. **修復範圍依元件家族，而非回報的單一頁面。** 但「同一套程式碼」與「全部路由已正確」要分別登記，不能互相推論。

## 1. GitHub 中已存在的主要控制權與模板

下表是 **`cd74b2e` 真實 GitHub 來源程式／歷史驗收契約** 的交叉核對。`存在` 表示程式已存在，**不代表完整端對端驗收**。本文件本身不改任何 runtime。

| 元件／領域 | 現存 owner／檔案 | 作用、既有規則（修改前保護） | 風險與現況 |
|---|---|---|---|
| **Global Navigation／搜尋／Mobile Menu** | `assets/rc7-runtime.js`, `assets/rc7-runtime.css`; `assets/auping-shared/mobile-menu-v200.css`; `assets/rc73-page.js`; `assets/rc76/store-link-guard.js` | RC7 為導覽與 Read More 的核心橋接；mobile-menu CSS 是預防未開啟選單遮擋點擊，不是重建選單。 | **共用高波及**；舊資料顯示 RC7 被數百路由引用。保持既有翻譯與導航；全站 Safari 尚未完成驗收。 |
| **Read More / TruncatedText** | **`assets/rc7-runtime.js` → `setupReadMore()`**；部分頁面另有 *native disclosure owner* (`data-auping-disclosure-control`／`data-auping-disclosure-key`) | 現有 RC7 用**實際渲染文字行數**判斷：≤3 行及沒有實質截斷時顯示全文、隱藏按鈕；必要時依第 3 行實際座標折疊；展開應真的恢復完整文字高度。依 PROVEN/NO_BUTTON/SOURCE_REQUIRED 名單保護原文，遇 native owner **跳過**。保持官方透明／白底初始樣式及收合外觀。**不要自行指定字元數量或 `max-height:4.8em`。** | 歷史清冊 284 個路由使用 TruncatedText；**Molton 的 native owner 與按鈕／層級目前故障**，不是批准新增第二個 ReadMore controller。 |
| **Product Header／General Info／Overview／Options** | 各商品頁原始 HTML＋CSS、`assets/snapshot-interactions.js`、`assets/rc75-combobox.js`、依家族不同的規格與產品選項邏輯 | 保留名稱、價格、產品身份、變體/combobox、gallery 原始 HTML、CTA、資料來源；不以其他產品模板直接覆蓋。 | 相關產品模板遍布多頁；不能假設一份全域 CSS 可套所有家族。 |
| **Product Specifications** | `assets/auping-shared/product-specifications-v1.js` | 只在頁面標註 `[data-auping-spec-contract="v1"]` 時啟用；控制規格表前三行／更多規格及 anchor；不碰 Gallery、Read More、導覽與篩選。 | **只找到有限 opt-in，不能因有 227 個 ProductSpecifications 模板就說 227 頁都有此 controller。** 原 88 檔規格代表案例在 `beds/noa-soft-white-oak` 等，注意不要混淆 `beds/noa`。 |
| **Catalog U1/C2（床架／Box Springs）** | `assets/c2-catalog/controller.js`, `facet-engine.mjs`, `ui-contract.mjs`, `controller.css` | U1/C2 只處理其明確路由；已有 shared card/gallery/filter 與狀態控制，不得新增第二個 owner。 | `controller.js` 在 `cd74b2e` 仍列 **ARCHITECTURE_DECISION**；英文回退、page2、篩選組合需重驗。 |
| **U2 Standard Product Catalog** | `assets/u2-standard/u2-standard.mjs`、`.css` | 標準商品卡 DOM adapter；原註解明確要求**不得**改產品文字、徽章、CTA、色片、篩選歸屬；現有 U1／RC7 分工需依實際載入鏈確認。 | 不能在各商品卡重新搭建孤立 gallery。 |
| **U3 Special（Mattresses／Circular Mattresses landing）** | `assets/u3-special/u3-special.mjs`、`.css`、`assets/finalv2-mattress-geometry-v120.css` | 特殊床墊 landing 的 DOM 結構保護與版型；程式自述**不新增互動 owner**。 | 不能錯把 U3 當六款床墊 detail 的萬用模板。 |
| **U4D 標準篩選** | `assets/u4d-standard/owner.mjs`、`.css`; 另有 `assets/u4b-official/u4b-filter-owner.mjs` | 已有官方選項 evidence、facet/URL/篩選/分頁邏輯；U4D 跟 U1／U2 的事件責任須分開。 | 歷史 9 類、10 route，非宣告每個產品 listing 已驗收。 |
| **ModelSlider（非一般 Gallery）** | `assets/snapshot-interactions.js` → `setupModelSlider()` | 已有 transform/Slick fallback，原註解：**僅兩個已知 ModelSlider 路由**。保護卡片順序、transform 與手機滑動。 | **不能拿它的 selector 直接修 ImageGallery、CtaInspirationComponents 或其他輪播。** |
| **ImageGallery／商品主圖與縮圖** | 原始 page HTML＋CSS／可能的 source-owned gallery；**尚未確認一個已通過全家族驗收的統一 owner** | Gallery 主圖、縮圖 active、slide 及 modal/zoom 是不同狀態，必須逐一驗證。 | 歷史清冊 9 route；Noa 有空白圖片、圖片無法放大／點擊與切換欠缺，**不得宣稱已修復**。 |
| **CtaInspirationComponents／相關床架輪播** | 各頁原始 `CtaInspirationComponents` 區塊／其 CSS；需要查 runtime owner | 確認 Essential「其他床架」用的實際 slider class，再在該**元件家族**實現原尺寸與行為；不得改頁面其他圖片。 | 46 route 使用同類 section；Essential 左右在被拒收的 Batch1 曾能動，**該補丁已拒收，不是可靠共用成果**。 |
| **VideoPlayer／Media** | `assets/snapshot-interactions.js` 的 native video controls；`assets/auping-shared/w4-safari-official-video-v110.js`; `assets/auping-shared/p0e-essential-only-v1.css`; `assets/finalv2-mattresses-video-v110.js` | W4 Safari video 修補只鎖 `/mattresses/` 與 `/bed-linen/` 特定影片；P0E CSS 僅 Essential 桌機 native video。**不更換媒體、不能用 poster 冒充播放**；檢查 currentTime 前進。 | 19 route 使用 VideoPlayer；Noa 影片未驗收、Essential 桌機曾接受但手機官方例外，須保護。 |
| **BlogList／文章首頁** | 原始 `/stories/`／`/news/` HTML `BlogList`、`RelatedBlogs`、頁面版型；動態資料可能另有來源 | 保留官方**首篇大圖、分類導航、長頁卡片/排列順序**及媒體身份，先確認官方資料來源。不能拿其他文章頁縮圖組成自製三欄首頁。 | 歷史 BlogList 2 route；Stories 尚有圖片／內容缺失。**Batch1 三欄 fallback 已拒收**。 |
| **Mattress Product Detail（六款）** | `mattresses/{one,two,evolve,revive,elysium,elite}-mattress/index.html` 與各頁 CSS；ProductHeader／Specifications／RelatedProducts 等原有機制 | 版型要以官方完整 section 順序、媒體／比較 CTA／實際文字對帳，相關產品資料分開，不能從 one-mattress 複製一張內容版。 | Two 仍 **VISUAL_FAIL**；其他 5 款內容與版型未完成正式認可。不可把 P0D geometry-only PASS 當 1:1。 |
| **Taiwan Store Locator／店家連結** | `assets/rc76/taiwan-store-locator.js`, `assets/rc76/store-link-guard.js` | 保護台灣 Leaflet／OSM 與 6 店家，保留本地/官方服務 exit 的已核准範圍。 | 對 StoreLocator 類元件的修改需驗地圖和其他路由連結。 |
| **網站字型／RWD／Safari geometry** | `assets/auping-shared/w4-safari-media-geometry-v1.css`, `assets/auping-shared/mobile-menu-v200.css`, 各 route 原 CSS | 共用樣式只處理來源證明過的 section/媒體容器；不能用全站 !important 覆蓋空間／圖片比例；手機圖片零高度鏈需保護。 | 部分 Safari 代表性 PASS，但不是所有 iPhone 頁面已驗收。 |

### 1.1 這些是「GitHub 已存在的檔案」，不是「可以重寫的空白架構」

`cd74b2e` 查到的 Git blob SHA（**Git Blob SHA-1，不是 SHA-256**；供 Git 逐檔比對）：

| 受保護檔案 | Git blob SHA（建立登記時） |
|---|---|
| `assets/rc7-runtime.js` | `8aea4a7f62fe29a35de028977364ea2a44f1597d` |
| `assets/snapshot-interactions.js` | `48ae51de84f3fcf47ee1597e24f42ec66638c12c` |
| `assets/rc73-page.js` | `18ae790adc3b4b9bf56bed2e7478c882d35aa92f` |
| `assets/rc75-combobox.js` | `7cd3f9b80501bb3f6b1ef0b59c3fc1c42b66d469` |
| `assets/auping-shared/product-specifications-v1.js` | `001d44837b83576d0294098b490d4bfa75cca031` |
| `assets/c2-catalog/controller.js` | `069f0bd07460fa9ed93fa3f94b701da833a50194` |
| `assets/u2-standard/u2-standard.mjs` | `f37ed7bacb4a66764037c94ab0e92d5ba7d5ac61` |
| `assets/u3-special/u3-special.mjs` | `0240f7fedac88faaa470695769c83246e3ba2016` |
| `assets/u4d-standard/owner.mjs` | `d0ef6ada676d9d6d5947b392ba9eccd61d8a97cf` |
| `assets/auping-shared/mobile-menu-v200.css` | `1fa961349450b77d025cb9731dc9682484042ef6` |
| `assets/auping-shared/p0e-essential-only-v1.css` | `9aaae2f7cee5893f326e08c5c9705e20b2357ccc` |
| `assets/auping-shared/w4-safari-media-geometry-v1.css` | `6534e91434aa7ce80d0ad0c4eda8450ed009e9ca` |

**每次改檔前**要重新算 Git Blob SHA、查 HEAD 和載入頁面；上表只保護本次建檔基準，不是永久鎖死未來合法修改。

## 2. 既有結構類型／家族路由關聯

以下是 **2026-10-31 P0G 封存元件清冊＋2026-11-03 88 檔交叉整理**，**尚不是 2026-11-04 目前 Mac 全站實際互動驗收**。這張表的用途是 **搜尋影響面**；真正寫入前要在當下 HEAD 重新掃描命中，並記錄例外。

| 現有 `data-section`／模板族 | 歷史命中路由數 | 允許繼承的部分 | 不允許直接推論 |
|---|---:|---|---|
| `TruncatedText` | 284 | 尋找 RC7 / native owner 與 Read More 保護區 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductSpecifications` | 227 | 尋找規格表 owner 與內容身分 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductGeneralInfo` | 216 | 資料與說明、不可跨產品覆寫 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductHeader` | 152 | 保護產品身份／選項與來源 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `TwoColumn` | 78 | 版型及 responsive 欄寬 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `RelatedProducts` | 49 | 相同卡片元素但不同推薦商品 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductOverviewHeader` | 49 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `CtaInspirationComponents` | 46 | 同一元件族、不同內容與動態狀態 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `HeaderText` | 44 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `HeaderImage` | 44 | 來源圖片、裁切與版型 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `BlogAttributes` | 41 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `Image` | 39 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `RelatedBlogs` | 27 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `StoreLocator` | 20 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `VideoPlayer` | 19 | 同一播放器型別但影片身份需驗 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `UpSellProducts` | 16 | 原商品 CTA/內容 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductCatalog` | 14 | Catalog 按 route 決定 U1/U2/U3/U4D owner | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ImageGallery` | 9 | 同一區塊外觀／媒體，但控制器仍需查 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `CtaHeader` | 6 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProCon` | 6 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `UspContentBlock` | 5 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `CategoryTiles` | 5 | Safari 圖片幾何保護 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `FaqAccordion` | 3 | FAQ 原生展開 owner | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `CtaBasic` | 3 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `Auping Design Studio` | 3 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ModelSlider` | 2 | `snapshot-interactions.js` scoped fallback | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `OverviewTiles` | 2 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `BlogList` | 2 | BlogList 版型與文章資料對帳 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `ProductCategories` | 1 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `CtaProduct` | 1 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `Frans de la Haye` | 1 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `Claudia Köhler & Irmy Wilms` | 1 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `Eva Harlou` | 1 | 僅作元件使用／相似版型發現 | **不可據此判定同家族互動、內容或視覺全部 PASS** |
| `RichContentTiles` | 1 | 只有單頁專用，勿推成全站 | **不可據此判定同家族互動、內容或視覺全部 PASS** |

### 2.1 路由影響範圍如何取得

上表是 **34 類 section 在歷史 384 路由清冊中的分布**，不是固定授權的修改名單。

- 修改 `ImageGallery`：先查當前 `main` 中 **全部** `section[data-section="ImageGallery"]` 頁面；Noa 另有主圖／縮圖 DOM，必須辨識是否同一 owner。
- 修改 `CtaInspirationComponents`：先查全部 46 個歷史路由與當前 `CtaSlider` DOM／事件；不要直接套 `ModelSlider` 選擇器。
- 修改 Read More：先查 `ReadMore_base`／`TruncatedText` 以及 `data-auping-disclosure-control`、`data-auping-disclosure-key` 的例外。
- 修改 BlogList：先查 `/stories/`、`/news/` 的原版模板、首頁大圖、官方文章資料來源。
- 修改床墊：逐一核對 `/mattresses/one-mattress/`、`/two-mattress/`、`/evolve-mattress/`、`/revive-mattress/`、`/elysium-mattress/`、`/elite-mattress/`。
- 修改 RC7、`snapshot-interactions.js` 或共用 CSS：先列**所有實際引用資源的頁面**；不能只查 `data-section`。

歷史全路由關聯資料保存在 2026-11-03 封存 `Auping_Main_cd74_Sitewide_Component_Family_Closure_READONLY_20261103.zip` 的 `REPORTS/PRECHECK_FAMILY_COUNTS.csv` 與 `DATA/ARCHIVED_P0G_LOCAL_SECTIONS_2732.csv`（非目前 HEAD）。**不必製作新的全站掃描 ZIP；應直接在現行 Git 工作樹唯讀搜尋並核對變更影響。**

## 3. 已驗收／未驗收／被拒絕 — 絕不混為一談

| 功能 | 目前可作為基礎的證據 | 目前禁止宣稱 |
|---|---|---|
| W1–W4／P0E 既有成果 | `main=cd74b2e` 已部署的 88 檔、來源與 release ledger (`docs/releases/AUPING_20261103_88_SOURCE_LEDGER.json`) | 整個網站／所有同家族頁面均 1:1 PASS |
| RC7 Read More | 已存在共用程式、三行渲染截斷與 native owner 排他規則 | Molton 完整正常、所有 TruncatedText 已驗收 |
| Noa 規格 | 有 opt-in 共用 JS 與 W1 代表案例 | Noa /beds/noa/ 的四圖 gallery、缺圖、播放／放大都 PASS |
| Essential 桌機影片 | P0E 曾獲得限定 Desktop 實際播放接受，CSS 維持獨立 | Essential 所有互動（尤其「其他床架」）都 PASS；手機改成與官方不同的播放行為 |
| C2／U4D 目錄篩選 | 已有 owner，產品族路由明確存在 | page2、篩選組合、繁中回退全數回歸完成 |
| Stories | 原本 HTML 與官方首頁截圖可當版型基準 | 拿自行拼的十篇文章視為官方相同文章順序與大圖排版 |
| Six Mattresses | `Two` 曾通過幾何限定測試，其餘有 source draft | `Two` 整頁 1:1；六款文字與版型已全部正式認可 |
| **2026-11-04 被拒絕 Batch 1** | Mac 曾以局部 JS/CSS 讓兩個輪播能動；使用者實測回報重大回歸 | **不得合併／不得升格為共用元件！** |

### 3.1 2026-11-04 反例：Batch 1 明確拒收，避免重演

先前未提交的本地改動（**GitHub `main` 內不存在**）：

- `assets/rc7-runtime.js` 增加一個共用載入器；
- `assets/auping-shared/family-interactions-v1.js`；
- `assets/auping-shared/family-interactions-v1.css`。

**拒收原因**：攔截 Read More 事件、強行重寫全文與高度／樣式，破壞 Molton 既有契約；以十篇文章組合的 Stories 三欄列表取代官方首篇大圖版型；Noa 仍有空白圖片和無法打開的圖片。部分輪播能動並不能抵消上述破壞。這些檔案不可當作已接受 shared owner、不可再次直接推廣全站。

**本地復原狀態（2026-11-05 01:02 前置報告）**：使用者 Mac 唯讀檢查 `Auping_Local_Status_READONLY_20261105_010205.zip` 證實 `HEAD=cd74b2e...` 且上述三個 Batch 1 變更都與拒收原版 SHA 完全相同，無其他未提交變更。**此證據只代表「可安全做精準回復」，不代表已回復成功**；應以隨後的 `RESTORE_SUCCESS` 報告及 `git status` 為準。不得使用 `git reset --hard`。

### 3.2 已知五組待修工程（以「家族」為單位，而非五頁個別 patch）

1. `/beds/noa/`：VideoPlayer 官方影片 source/playback；ImageGallery 缺圖、四張圖片主圖切換、點圖/放大；同家族頁一起列入回歸。
2. `/bed-linen/mattress-protectors/molton-mattress-protector/`：**先查 native disclosure owner 與 RC7 跳過規則**，修原有控制器的事件／層級／正文來源，還原官方透明／白底按鈕，不重寫短文門檻。所有相同 native owner 頁一起驗收。
3. `/beds/essential/`：「其他床架」CtaInspirationComponents／CtaSlider 箭頭與滑動，保持已接受 Desktop video 不變，查同家族。
4. `/mattresses/two-mattress/`：整頁 section 順序、內容、官方圖片及 RWD 大幅不符；和六款床墊模板整體對帳，禁止套入未核准的 Two 結構或錯誤共用 CSS。
5. `/stories/`：BlogList 內容載入、首篇大圖、分類、卡片與版型；並查 `/news/` 等同元件使用頁，依官方來源而非自製列表修復。

## 4. 每次修復的 **PRECHANGE GATE**（不做就不能開始改檔）

所有對話串／工程助手開工時必須在工作紀錄中填完以下八欄（UNKNOWN 即 STOP，不得把 UNKNOWN 寫成 PASS）：

| 必填欄 | 正確做法 |
|---|---|
| `CURRENT_MAIN` | 從 GitHub 重新取得遠端 `main` HEAD；檢查本地分支／dirty 檔案；不要直接用這份文檔建立時的 `cd74b2e` 充當最新。 |
| `EXISTING_OWNER` | 用搜尋定位 DOM selector／既有事件 owner／script 引用，包括 inline JS、RC7、native disclosure、U1/U2/U3/U4D、snapshot-interactions；沒有查完不能再加新 handler。 |
| `TEMPLATE_AND_DATA` | 列出 `data-section`、版型相同與不同的路由；明確區分「呈現模板」「資料」「互動控制器」。 |
| `AFFECTED_ROUTES` | 真正列出所有引用同一資源／元件的路由，不能只列使用者回報的單頁；有例外就註明。 |
| `EXISTING_ACCEPTANCE` | 清楚寫出既有通過的是 Source/SHA、Chrome 功能、Safari 人工代表性、Geometry 還是完整視覺；保護其界線。 |
| `OFFICIAL_TRUTH` | 官方對應頁／區塊 UUID／來源圖影片／完整正文、桌機和手機對照；官方取得失敗標 UNKNOWN，不能編造。 |
| `MINIMAL_PATCH` | 說明修改哪個**原有 owner**，是否有替代方案；列白名單、衝突與回復方式，不得全域注入未知相容性的 CSS/JS。 |
| `REGRESSION_AND_RECEIPT` | 功能要有真實狀態改變（主圖、全文、currentTime），同家族 Desktop + Mobile 受影響路由驗證，失敗記錄，才可要求使用者驗收及 GitHub Desktop Commit。 |

**更新本檔是每次合法修改的一部分**：若 owner、routes、例外、驗收狀態改變，必須與程式碼放在 **同一個 main Commit** 更新表格及證據路徑，不能留在聊天訊息、下代 ZIP 裡。

## 5. 既有正式規範與資料所在（不要把「舊版本說明」當最新 HEAD）

- `docs/08_EFFECTIVE_1_TO_1_PARITY_ACCEPTANCE_CONTRACT.md` — 有效 1:1／媒體與互動證據的正式準則（但內含 262 route 的舊版統計，**不能取代目前 384 路由清冊**）。
- `docs/ROUND3_SHARED_READMORE_BRIDGE7_20260912.md`、`data/parity/round3-shared-readmore-runtime-v1.json` — RC7 早期 Read More 共用修復及跨模板繼承歷史，不要因為它早就存在就另寫第二個。
- `docs/releases/AUPING_20261103_88_SOURCE_LEDGER.json`、`docs/releases/AUPING_20261103_DIRECT_MAIN_88_WIP.md` — `cd74b2e` 真實的 88 檔變更權威、10 個硬性 hold 與 release 狀態。
- 舊 D0/D1/D2/P0G/10-30 handoff 封存（不在 main）：可參考的 **歷史** route/family/section/owner 影響證據；不得以 10-30 / 11-02 當成 11-04 已修好。
- `docs/AI_HANDOFF_CURRENT.md`、`docs/07_ROADMAP_NEXT_STEPS.md` 目前仍含 **2026-08** 舊 HEAD；**不能依其「CURRENT／AUTHORITATIVE」字眼直接切回舊程式權威**。

## 6. 下一個對話串的開頭操作規範

> 這是 Auping Taiwan 官方 Effective 1:1 Parity 專案。GitHub `damienkuo123/auping-staging` 的即時 `main` 是唯一程式碼權威。**先抓 HEAD，再讀根目錄 `AGENTS.md`，再讀 `docs/releases/AUPING_20261103_88_SOURCE_LEDGER.json` 與現存 JS/CSS owner。** 先查已存在的共用元件、模板、功能與驗收狀態，再以同家族範圍修改最少來源檔。禁止第二個 Read More／Slider／Gallery 控制器、禁重排 Stories、禁編造內容、禁只修回報頁。工作樹如果有未提交 Batch1，先釐清復原，不得覆蓋。沒有官方／實機證據不得宣布 1:1。所有合法的新 owner／套版變化，跟著同一個 main Commit 更新 `AGENTS.md`。不要自行 Push。

---

**狀態說明：** 本文件是「現存資產索引＋禁止事項＋已知 hold＋家族待辦＋修改前門檻」，**不是網站已全部修復／驗收的證明**。路由關聯表來自歷史檔案；若與現行程式不同，以現行遠端 `main` 為準並更新此檔。
