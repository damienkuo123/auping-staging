# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-14 13:40 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：`damienkuo123/auping-staging`

Remote `main`：
`b1ed4d31355d087a77e063867102a002ca21b183`

Commit：
`docs: track Designers local acceptance`

Push verified：**YES**

## Completed Tier A routes

- `/about-auping/design/`
- `/about-auping/b-corp/`
- `/about-auping/proudly-manufactured-netherlands/`
- `/about-auping/design/advertising-classics/`
- `/about-auping/design/design-heritage/`
- `/about-auping/design/designers/`

PMNL accepted route SHA：
`1b5a7c902cc198cb906888837d6dc676e8ac96a7a64e8c0654b5c392c74359cb`

Do not recapture/rematerialize completed routes unless a later evidence-backed regression demands it.

## Completed maintenance debt

Design Gold CSS source hygiene is **CLOSED / PUSHED**:
- malformed tags: `11 → 0`
- commit: `0d72d48bec595d4d9cf4f892e174d0c27cc6377b`
- Desktop/Mobile before-after machine gate PASS
- human review `VISUAL_OK`

## ACTIVE missing route

`/about-auping/design/fabrics/`

Stage：
`MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH`

Accepted warmed Gold:
- Official Desktop/Mobile `200`
- Local Desktop/Mobile `404` before materialization
- direct sections: `Breadcrumbs → HeaderImage → TruncatedText ×6` (8 direct)
- all `[data-section]`: Desktop 9 / Mobile 9 including footer
- H1: `Our fabrics` ×1; local `我們的布料`
- effective main media: 6 / 6, all warmed loaded and visible
- Desktop/Mobile content-section text mismatch: 0; breadcrumb differs intentionally by responsive presentation
- Hero media differs intentionally by viewport: Desktop `onze-stoffen-desktop.jpg`; Mobile `onze-stoffen-mobile_0.jpg`
- videos: 0
- template: `EDITORIAL_RESPONSIVE_HEADERIMAGE_PLUS_TRUNCATEDTEXT_FABRIC_GROUPS`
- Gold Analysis SHA: `41acc9e09f133281c5cd4f53e98620c6f2cf95d070101c4e7bd222fca3256562`
- dependency routing: Original / Kiruna / Criade / Essential all local

Local acceptance:
- route safe commit: `87daeba63549d6739ad7297a23391e7074bc236a`
- canonical Taiwan/global Design shell reuse: PASS
- accepted warmed Gold main reuse: PASS
- responsive Hero source preserved: PASS
- Static: PASS
- Browser Desktop/Mobile: PASS
- human warmed screenshot review: `VISUAL_OK`
- push verified: **NO — pending**

Exact next action：
**Push origin, verify remote, then start Customer Service true-missing family disposition / warmed Gold Capture. Do not recapture or rematerialize Fabrics.**

## Cross-cutting visual-truth regression

Accepted after Advertising Classics exposed incomplete lazy-media state in raw full-page capture:
- Design: PASS
- B Corp: PASS
- PMNL: PASS

Factory rule: group responsive twins into effective media slots; scroll-warm only the rendered instance(s) and wait for `currentSrc + complete + naturalWidth` before final full-page screenshot/human review. This audit did not mutate any completed route source.

## Route order

1. advertising-classics ✅ COMPLETED
2. design-heritage ✅ COMPLETED
3. designers ✅ COMPLETED
4. fabrics ← ACTIVE / LOCAL ACCEPTED / AWAITING PUSH
5. Customer Service true-missing family ← NEXT AFTER PUSH
6. Accessories true-missing family

## Progress tracking rule

Construction progress and Final Acceptance progress are tracked separately.

- Historical Tier-A likely-true-missing planning subset: approx 16
- Completed + pushed Tier-A routes at accepted remote checkpoint: 6
- Locally accepted including Fabrics: 7
- Pushed planning-subset share: 6/16 = 37.5%; after Fabrics Push verification: 7/16 = 43.75% (planning subset only; **not whole-site completion**)
- Final target remains 262 live routes × Desktop/Mobile = minimum 524 viewport cases plus interactions/media/video/translation/dependency closure.

## Factory rules

- search/reuse canonical Taiwan/global components before reconstructing shared UI
- DOM structural counts, never raw substring counts
- Python stdlib on Mac; do not assume bs4
- image computed visibility/currentSrc/actual rect
- video official currentSrc + actual playback
- mobile carousel/USP actual text/icon visibility, not parent box
- machine PASS requires screenshot/manual review
- verifier bugs do not justify damaging correct source
- avoid shared runtime edits when an existing safe route-level opt-out solves the conflict
