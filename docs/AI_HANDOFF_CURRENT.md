# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-13 02:18 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：
`damienkuo123/auping-staging`

Remote `main`：
`2924457898a04662983d15791cac38bb7718cb8d`

Latest accepted commit：
`feat: add localized Auping B Corp route`

Completed Tier A routes：
- `/about-auping/design/`
- `/about-auping/b-corp/`

## ACTIVE route

`/about-auping/proudly-manufactured-netherlands/`

Gold Capture V1 已完成且安全：

- Receipt：
  `Auping_TierA_ProudlyManufacturedNL_GoldCapture_V1_Receipt_20260813_021624.zip`
- Capture PASS
- repo unchanged
- Official Desktop/Mobile 200
- Local 404
- direct sections：
  `Breadcrumbs → HeaderImage → TruncatedText → VideoPlayer → TwoColumn ×4 → TruncatedText → StoreLocator`
- video：
  `auping_fabrieksvideo_clean.mp4#t=0.1`
- official video readyState = 4 in captured snapshot
- Gold request log有 MP4 ERR_ABORTED；不得因此直接判 video failure，下一步要做 actual visibility/playback acceptance
- Hero：
  `fabriek-04.png`
- final official section = `StoreLocator`
- Taiwan implementation must preserve local Taiwan Store Locator policy

## Exact next action

**DO NOT recapture Gold.**

Next:
1. Materialize this route from accepted Gold
2. Translate fully to zh-Hant-TW
3. Preserve official structure/media
4. Implement official video with explicit Desktop/Mobile playback/visibility gate
5. Replace/route final StoreLocator to approved Taiwan local Store Locator behavior
6. Static
7. Browser Desktop/Mobile
8. Visual review
9. Safe Commit
10. Push
11. Update this checkpoint

## Next Tier A routes

After active route:
1. `/about-auping/design/advertising-classics/`
2. `/about-auping/design/design-heritage/`
3. `/about-auping/design/designers/`
4. `/about-auping/design/fabrics/`
5. Customer Service true-missing family
6. Accessories true-missing family

## Project ETA

Current planning range:
- normal safe path: 15–29 focused working days / about 3–5 weeks
- factoryized path: potentially about 2–3 weeks

Canonical detail：
`docs/07_ROADMAP_NEXT_STEPS.md`

## Critical continuity rules

- 101 historical missing queue != 101 new pages.
- Do not use stale census as current TODO without route disposition review.
- Do not call project complete until final 262-route / Desktop+Mobile acceptance closes.
- Do not replace Taiwan Store Locator with official NL/English locator.
- No placeholders / fabricated content / guessed media.
- Do not blind reset after tool failures.
- Verify actual visual visibility, not only downloaded image dimensions.
- Receipt > assumption.
- Latest accepted Git checkpoint > conversational memory.
