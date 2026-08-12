# Auping Taiwan Parity｜Canonical Roadmap & Next Steps

版本：2026-08-13 02:18 +08:00
狀態：**AUTHORITATIVE / CANONICAL**
適用專案：`damienkuo123/auping-staging`

> 本文件是後續 ChatGPT 對話串、人工施工與最終驗收的正式路線來源。
> 若舊 Handoff、舊 PLAN、舊 Census 或舊對話與本文件衝突，以「日期較新、且已通過 receipt / Git / browser evidence 的 checkpoint」為準。

## 1. 最終產品目標

不是「大致像 Auping」，而是完成一個可公開使用的 **Auping Taiwan Traditional Chinese parity site**：

- Official Auping live route census：262 routes。
- Desktop / Mobile 同等重要。
- 每個需要保留的 route 應達成官方可見 UI / UX、內容結構、媒體與互動的實質 parity。
- 公開語言固定為 `zh-Hant-TW`。
- 不使用 placeholder、猜測媒體、虛構聯絡資料或 filler。
- 不因為官方網站有荷蘭客服 / Store Locator，就把台灣站導回荷蘭資訊。
- Taiwan Store Locator 固定保留本地 Leaflet / OSM + 6 個台灣地點。
- 最終完成不以「GitHub Actions 綠」或單一 `accepted=true` 判斷，而以完整 Final Acceptance evidence 判斷。

## 2. 目前已鎖定的正式 Git checkpoint

截至 2026-08-13：

- Remote `main`：
  `2924457898a04662983d15791cac38bb7718cb8d`
- Parent：
  `93ea15e8dea97516f9b2e73fe2d295eeea61da15`
- 最新 commit：
  `feat: add localized Auping B Corp route`

已正式完成並 Push：

1. `/about-auping/design/`
2. `/about-auping/b-corp/`

兩頁均完成 Gold → Materialize → Static → Desktop/Mobile Browser → Visual Review → Safe Commit → Push。

## 3. 目前 ACTIVE checkpoint

### Route
`/about-auping/proudly-manufactured-netherlands/`

### Gold Capture
Receipt：
`Auping_TierA_ProudlyManufacturedNL_GoldCapture_V1_Receipt_20260813_021624.zip`

狀態：

- `READY_FOR_GOLD_ANALYSIS = true`
- Capture exit = 0
- Repo unchanged = true
- Official Desktop = 200
- Official Mobile = 200
- Local Desktop/Mobile = 404
- Official direct section sequence：
  1. `Breadcrumbs`
  2. `HeaderImage`
  3. `TruncatedText`
  4. `VideoPlayer`
  5. `TwoColumn`
  6. `TwoColumn`
  7. `TwoColumn`
  8. `TwoColumn`
  9. `TruncatedText`
  10. `StoreLocator`
- H1：
  `Proudly manufactured in The Netherlands`
- Official video：
  `https://api.auping.com/sites/default/files/2026-04/auping_fabrieksvideo_clean.mp4#t=0.1`
- Video element readyState was 4 in Gold evidence。
- Capture network 有 MP4 `ERR_ABORTED` request records，但 video element 本身可解析且 readyState 4；Materialize/Browser acceptance 必須重新驗「實際可播放 / 顯示」，不能單看 request-failed 陣列。
- Hero：
  `fabriek-04.png`
- 主要 TwoColumn media 已包含：
  - `fabriek-22.png`
  - `fabriek-18.png`
  - `fabriek-02.png`
  - `slaapkamer_-_kapellen_-_10-edit.jpg`
- Official 最後一段是 `StoreLocator`；台灣版本不得照搬荷蘭 Google Store Locator，應保留 / 導向既有 Taiwan Store Locator contract。

### 下一個動作

**不要重跑 Gold Capture。**

下一步是：
1. 以此 Gold evidence Materialize `/about-auping/proudly-manufactured-netherlands/`
2. 完整繁中
3. Official media / video
4. Taiwan Store Locator integration
5. Desktop/Mobile browser + video acceptance
6. Visual review
7. Safe Commit
8. Push

除非 Gold evidence 被證明不完整、官方頁面發生重大變更，否則新對話串不得自行重抓或回退。

## 4. Tier A Missing Route 順序

已完成：
- [x] `/about-auping/design/`
- [x] `/about-auping/b-corp/`

目前：
- [ ] `/about-auping/proudly-manufactured-netherlands/` ← ACTIVE

接著依序：
- [ ] `/about-auping/design/advertising-classics/`
- [ ] `/about-auping/design/design-heritage/`
- [ ] `/about-auping/design/designers/`
- [ ] `/about-auping/design/fabrics/`
- [ ] Customer Service true-missing family
- [ ] Accessories true-missing family

注意：
- 舊 census 的 Tier A = 28，不代表 28 頁都要手工 materialize。
- 舊規劃中 Tier A 「likely true missing」約 16；Design + B Corp 完成後，規劃估計約剩 14 個，但這只是 planning estimate。
- 每個 route 必須分類成：True Missing / Existing Equivalent / Alias / Redirect / Approved Fallback / Not Applicable。
- 不得把歷史 missing queue 數字直接當成當前剩餘施工頁數。

## 5. 完整 Roadmap

### Phase A — Tier A true-missing closure
目標：
- 消滅最明顯的 404 / 缺頁。
- 再拿 2–3 種不同頁型驗證 Generic Tier-A Factory。

預估：
**3–5 focused working days**

完成條件：
- Tier A route disposition 全部有 evidence。
- True Missing 都 materialize。
- Equivalent / Alias / Redirect 有明確 mapping，不是假裝完成。

### Phase B — Tier B / Tier C classification closure

歷史 census：
- Tier A：28
- Tier B：32
- Tier C：41
- Historical missing queue：101

101 是調查 queue，不是 101 個必做新頁。

工作：
- True Missing
- Existing Equivalent
- Alias
- Redirect
- Approved Fallback
- Not Applicable

預估：
**2–4 focused working days**

### Phase C — Official Interaction Reconstruction

既有 evidence：
- 340 raw interaction observations
- 可收斂為約 15 個 interaction patterns

重點：
- Read More / show more
- Accordion
- Carousel / gallery
- Selector / filters
- Mobile navigation
- Search
- Product interactions
- Video controls
- 其他官方可見互動

預估：
**2–4 focused working days**

原則：
不要逐頁手工重寫相同 interaction；應建立 pattern contract / reusable runtime。

### Phase D — Structure + Spatial Media + Video

既有 evidence：
- 64 structure observations → 約 8 種 templates
- Spatial media candidates：775
- High-confidence spatial media：約 554
- Video gap：6 events / 4 routes

工作：
- template parity
- image position / ratio / lazy state
- background media
- video source / playback / visibility
- Desktop/Mobile geometry

預估：
**3–6 focused working days**

### Phase E — Full Translation + Dependency Closure

既有 translation census：
- 328 unique strings
- whitelist 後約 327

工作：
- visible UI English residual
- metadata / accessibility text
- official NL support residual
- wrong local / external route
- dependency / redirect audit
- Store Locator / configurator policy verification

預估：
**1–3 focused working days**

### Phase F — Final 262-route Acceptance

最終至少：

- 262 routes
- Desktop + Mobile
- = 524 viewport route cases

再加：
- interactions
- images
- videos
- routing
- external dependencies
- Traditional Chinese
- console / critical network
- Taiwan support / Store Locator policy

預估：
**4–7 focused working days**

完成條件：
完整 acceptance artifacts，而不是只看 CI。

## 6. ETA

截至 2026-08-13 的合理估計：

### 正常安全施工
**15–29 focused working days**
約 **3–5 週**

### Factory 化成功、同 template 可批次處理
有機會壓到：
**約 2–3 週**

這個 ETA 每完成一個大 Phase 必須重算，不能永久沿用。

## 7. Factory 化決策

Design 與 B Corp 已完成足夠多的探索，後續不能繼續每頁都重新發明 verifier。

再完成 2–3 個不同 template 的 Tier A 頁後，要建立：

**Generic Tier-A Factory**

輸入：
- route
- Gold rendered main
- translation map
- page policy
- media/video policy
- local dependencies

輸出：
- localized route
- static acceptance
- Desktop/Mobile acceptance
- visual evidence
- exact scope receipt

目標：
將相同 template 的 routes 批次化，而不是 V1 → V1.1 → V1.1.1 無限循環。

## 8. 已知失敗模式 / 必須永久避免

近期已實際踩過：

1. Playwright `page.evaluate()` 使用 Node closure helper → browser context ReferenceError。
2. 只看 `naturalWidth > 0` → 圖片其實仍可能 opacity 0 / 未顯示。
3. Lazy image 必須檢查 computed `opacity / visibility / display` 與 loaded class。
4. Mobile Footer parent visible 不代表 child contact block visible。
5. Hero srcset 可能產生 duplicate domain：
   `https://www.auping.comhttps://www.auping.com/...`
6. DOTALL regex 大範圍 replacement 曾破壞整個 Design main。
7. Python regex `r'<img\\b'` 曾造成 false zero-image failure；正確為 `r'<img\b'`。
8. Static PASS 不等於 Browser / Visual PASS。
9. Browser PASS 也不能取代人工 screenshot review。
10. 官方 video `requestfailed ERR_ABORTED` 不能單獨判死刑；要看 video readyState、source、實際顯示 / playback。
11. 不得 blind reset / hard reset 來處理工具錯誤；先判斷 source 是否真的被修改。
12. 不得在 repo 執行 npm install；Playwright 只能 tool-local bootstrap。

## 9. 安全施工規則

每個施工包：

1. `git fetch origin main`
2. branch 必須 `main`
3. HEAD / origin/main 必須鎖定指定 baseline
4. 檢查 tracked / staged / untracked scope
5. 建 transaction backup branch（需要 source edit 時）
6. 只修改 declared scope
7. Static gate
8. Browser Desktop/Mobile
9. Visual review
10. route SHA browser 前後不可被 verifier 改動
11. Safe Commit 單獨執行
12. Push 前先審 commit receipt
13. Push 後重新讀 remote main 精確 SHA

禁止：
- blind patch
- blind reset
- 未審 receipt 就 push
- GitHub Actions 綠勾當成 Final Acceptance

## 10. Taiwan-specific immutable policy

- 公開語言：Traditional Chinese `zh-Hant-TW`
- 不顯示 Netherlands phone / `info@auping.com`
- Taiwan support CTA 需可見
- Taiwan Store Locator：
  本地 Leaflet / OSM + 6 locations
- 不恢復 official English Store Locator redirect
- Configurator 若必須 external，需依 approved hybrid policy
- 不虛構台灣聯絡資訊
- 不猜商品 / image / video

## 11. 新對話串交接程序

新對話串第一步必須讀：

1. `docs/AI_HANDOFF_CURRENT.md`
2. `docs/07_ROADMAP_NEXT_STEPS.md`
3. `docs/ROADMAP_STATUS.json`
4. `docs/PLAN.md`
5. `docs/CLIENT_HANDOFF.md`

然後：

1. 查 GitHub remote `main`
2. 必須等於 `AI_HANDOFF_CURRENT.md` 的 accepted checkpoint，或是有更新、更晚且已驗證的 checkpoint
3. 讀 ACTIVE route
4. **從 ACTIVE route 的 nextAction 繼續**
5. 不重跑已 accepted 的 Gold / Materialize / Commit
6. 若發現更晚 Receipt，以更晚 receipt 更新 checkpoint
7. 每完成一頁：
   - 更新 `AI_HANDOFF_CURRENT.md`
   - 更新 `ROADMAP_STATUS.json`
8. 每完成一個 Phase：
   - 更新本 Roadmap
   - 重算 ETA

## 12. 最終終點

只有在以下全部成立才叫「完成」：

- 262 official live routes 全部有 disposition
- 所有應本地存在 routes 可用
- Desktop/Mobile parity acceptance
- interaction patterns closure
- media + video closure
- Traditional Chinese closure
- dependency / routing closure
- Taiwan Store Locator policy preserved
- Final 524+ route viewport cases acceptance
- 最終 evidence / manifest / handoff 已封存

在此之前，不得使用「整站完成」的字樣。
