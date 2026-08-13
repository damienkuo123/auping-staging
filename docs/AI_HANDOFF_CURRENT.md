# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-13 19:20 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：`damienkuo123/auping-staging`

Remote `main`：
`25c7acc449c16264df297a8ea13e76469247c989`

Commit：
`docs: track Advertising Classics Gold analysis`

Push verified：**YES**

## Completed Tier A routes

- `/about-auping/design/`
- `/about-auping/b-corp/`
- `/about-auping/proudly-manufactured-netherlands/`

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

`/about-auping/design/advertising-classics/`

Stage：
`MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH`

Accepted Gold facts:
- Official Desktop/Mobile `200`
- Local Desktop/Mobile `404`
- direct sections: `Breadcrumbs → HeaderImage → TruncatedText ×15` (17 direct)
- all `[data-section]` elements recorded by Gold: Desktop 18 / Mobile 18; this is a separate metric from direct-section count
- official images: Desktop 121 / Mobile 121
- videos: 0
- H1 captured as empty string; do not invent an H1
- repo unchanged by Gold Capture

Gold Analysis:
- template candidate: `EDITORIAL_HEADERIMAGE_PLUS_TRUNCATEDTEXT_SERIES`
- unique main text fragments: 41
- unique section media sources: 15
- Desktop/Mobile section text mismatches: 0

Local acceptance:
- route safe commit: `17011fa506ae226e562d104f96a2e4b06a5de268`
- canonical Taiwan/global shell reuse: PASS
- accepted Gold main reuse: PASS
- Static: PASS
- Browser Desktop/Mobile: PASS
- computed visible/loaded official main media: 15/15
- human screenshot review: `VISUAL_OK`
- push verified: **NO — pending**

Exact next action：
**Advertising Classics is locally accepted at `17011fa506ae226e562d104f96a2e4b06a5de268`. Push origin, then verify remote. Do not recapture Gold or rematerialize this route.**

## Route order

1. advertising-classics ← ACTIVE
2. design-heritage
3. designers
4. fabrics
5. Customer Service true-missing family
6. Accessories true-missing family

## Progress tracking rule

Construction progress and Final Acceptance progress are tracked separately.

- Historical Tier-A likely-true-missing planning subset: approx 16
- Completed + pushed Tier-A routes so far: 3
- Planning-subset materialized share: 3/16 = 18.75% (planning subset only; **not whole-site completion**)
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
