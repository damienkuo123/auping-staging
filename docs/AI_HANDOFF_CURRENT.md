# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-14 01:47 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：`damienkuo123/auping-staging`

Remote `main`：
`ead6733b8afa335bc5a95f00faff458cbcd5b46d`

Commit：
`docs: record legacy lazy-media visual truth audit`

Push verified：**YES**

## Completed Tier A routes

- `/about-auping/design/`
- `/about-auping/b-corp/`
- `/about-auping/proudly-manufactured-netherlands/`
- `/about-auping/design/advertising-classics/`

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

`/about-auping/design/design-heritage/`

Stage：
`MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH`

Accepted warmed Gold:
- Official Desktop/Mobile `200`
- Local Desktop/Mobile `404` before materialization
- direct sections: `Breadcrumbs → TruncatedText ×17` (18 direct)
- all `[data-section]`: Desktop 19 / Mobile 19 including footer
- effective main media: 17 / 17, all warmed loaded and visible
- Desktop/Mobile content-section text mismatch: 0; breadcrumb text differs intentionally by responsive presentation (Desktop trail / Mobile Back to Design)
- videos: 0
- H1: none; do not invent one
- template: `EDITORIAL_TRUNCATEDTEXT_MEDIA_TIMELINE`
- Gold Analysis SHA: `b15a8ae6b218ca0adf73b9def8b5494a484cd3971edadf8aec69976a66850cdd`

Local acceptance:
- route safe commit: `ffab113fc1f05203873298aa434dcbb3d6b33c65`
- canonical Taiwan/global Design shell reuse: PASS
- accepted warmed Gold main reuse: PASS
- Static: PASS
- Browser Desktop/Mobile: PASS
- human warmed screenshot review: `VISUAL_OK`
- push verified: **NO — pending**

Exact next action：
**Push origin, verify remote, then start `/about-auping/design/designers/` from warmed Gold Capture. Do not recapture or rematerialize Design Heritage.**

## Cross-cutting visual-truth regression

Accepted after Advertising Classics exposed incomplete lazy-media state in raw full-page capture:
- Design: PASS
- B Corp: PASS
- PMNL: PASS

Factory rule: group responsive twins into effective media slots; scroll-warm only the rendered instance(s) and wait for `currentSrc + complete + naturalWidth` before final full-page screenshot/human review. This audit did not mutate any completed route source.

## Route order

1. advertising-classics ✅ COMPLETED
2. design-heritage ← ACTIVE / LOCAL ACCEPTED / AWAITING PUSH
3. designers ← NEXT AFTER PUSH
4. fabrics
5. Customer Service true-missing family
6. Accessories true-missing family

## Progress tracking rule

Construction progress and Final Acceptance progress are tracked separately.

- Historical Tier-A likely-true-missing planning subset: approx 16
- Completed + pushed Tier-A routes at accepted remote checkpoint: 4
- Locally accepted including Design Heritage: 5
- Pushed planning-subset share: 4/16 = 25%; after Design Heritage Push verification: 5/16 = 31.25% (planning subset only; **not whole-site completion**)
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
