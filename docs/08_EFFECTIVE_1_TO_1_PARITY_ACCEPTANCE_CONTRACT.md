# 08｜Effective 1:1 Parity Acceptance Contract v1

狀態：**LOCKED / AUTHORITATIVE**
適用範圍：Auping Taiwan Traditional Chinese parity project

## 1. Product Definition

Effective 1:1 parity means:

> 除繁體中文與明確核准的台灣在地化差異外，使用者在對應 viewport 所看到、操作、導航、觀看媒體與切換狀態的體驗，都應與 Official Auping 的對應版本一致。

這不是 literal pixel clone。繁中造成的合理文字寬度、換行與頁高 reflow 可以不同；但 UI component、layout intent、media、responsive behavior、interaction state 與 UX result 不可有未解釋差異。

## 2. Non-negotiable source of truth

Official Auping live/captured evidence is the source of truth for:
- route existence/disposition
- DOM/section structure
- visible text/content semantics
- image/video source
- component geometry and visual treatment
- responsive behavior
- interaction behavior and state transitions
- navigation destinations

No placeholders, guessed media, fabricated contact information or generic filler.

## 3. Production and Acceptance are separate

### Production may be factoryized
A validated Factory may generate many routes from route-specific data.

### Acceptance may NOT be inherited
Factory correctness does not prove every generated route is correct.

Every route must independently close:
- content
- structure
- media/video
- links/dependencies
- responsive behavior
- interaction behavior
- visual differential
- Traditional Chinese / Taiwan policy

## 4. Route Acceptance Matrix

Every route must have explicit fields:

- Route disposition
- Desktop status
- Mobile status
- representative breakpoint status where required
- structure parity
- content parity
- media parity
- video playback parity
- interaction parity
- navigation/link parity
- UI style/geometry parity
- visual differential
- zh-Hant-TW localization
- Taiwan exception ledger
- console/network critical failures
- final same-commit result

A route cannot become FINAL PASS while a required cell is UNKNOWN, SKIPPED, NOT_PRESENTED or UNVERIFIED.

## 5. Viewport policy

Formal minimum:
- Desktop
- Mobile

Whole-site minimum:
**262 live routes × 2 = 524 viewport cases**

Additionally:
- representative templates/components must cover tablet / breakpoint transitions (for example 768 and 1024 when relevant)
- any route with viewport-specific content/media must explicitly verify those responsive differences

## 6. Media truth

Image acceptance uses:
- current viewport participation
- actual rendered rect
- display/visibility state
- currentSrc
- complete
- naturalWidth

Hidden responsive counterparts are preserved but do not have to load in the opposite viewport.

Gold/final screenshot methodology:
`navigate → identify eligible/effective media → scroll participating media into viewport → wait currentSrc+complete+naturalWidth → return top → capture`

A raw full-page screenshot alone is not lazy-media truth.

## 7. Video truth

Required video acceptance:
- Official currentSrc/source inventory
- Local expected source
- poster where relevant
- real playback
- `currentTime` advancement
- visible player geometry/state
- controls/interaction parity where exposed

DOM existence is not video acceptance.

## 8. Interaction truth

For every actual interaction pattern/instance, differential replay must compare Official and Taiwan behavior.

Examples:
- Header / mega menu
- mobile navigation
- accordion
- Read More
- tabs
- carousel/gallery
- filter
- combobox / selector
- search
- modal
- forms
- video controls
- hover/focus/keyboard
- touch/swipe when relevant
- sticky/scroll-dependent UI
- back/forward or stateful navigation where relevant

Compare:
- visible state
- aria/selected/expanded state
- resulting DOM
- URL/navigation
- scroll/state
- critical network/console outcome

## 9. Visual truth

All final route cases receive machine visual differential.

Visual gate combines:
- geometry/bounding-box comparison
- component/style comparison
- screenshot/perceptual comparison

Translation text regions allow reasonable reflow.
Media/chrome/component regions remain strict.

Human review policy:
- machine outliers and ambiguous cases must be presented for human review
- machine-green pages may be sampled/spot-reviewed, but the machine visual diff still runs on all
- if screenshot/visual evidence was not actually presented, status must be `NOT_PRESENTED_BY_TOOL`, never `VISUAL_OK`

## 10. Taiwan exceptions

Allowed differences must be explicit.

Current examples:
- public language: `zh-Hant-TW`
- Taiwan Store Locator: local Leaflet/OSM + six Taiwan locations
- approved official backend/service exits: Configurator, Contact, My Auping, Shop, Shopping Cart
- translation-induced text reflow

Every other difference requires a recorded waiver or repair.

## 11. Legal/policy content

Legal, privacy, cookie and terms pages may contain jurisdiction/company-specific statements.

Do not convert Official Netherlands facts into Taiwan legal claims merely by translating them.
Before publication, classify each legal statement as:
- source-exact global company fact
- Taiwan-applicable statement with evidence
- approved external/legal-service boundary
- requires owner/legal review

## 12. Same-commit Final Sweep

Historical route PASS is not Final Release PASS.

Final completion requires rerunning the global differential acceptance on one final Git commit:
- all 262 route dispositions
- minimum 524 Desktop/Mobile route cases
- all required interactions
- all required media/video
- all internal/external dependencies
- language/localization
- visual differential
- critical console/network
- deployed public URL/artifact identity

Only then may the project emit:
`EFFECTIVE_1_TO_1_PARITY_ACCEPTED`

## 13. Forbidden shortcuts

Never treat any of the following as full acceptance:
- GitHub Actions green
- HTTP 200
- file existence
- DOM existence
- one route verifier PASS
- one template Factory PASS
- screenshot not presented
- stale historical PASS after shared/global changes
