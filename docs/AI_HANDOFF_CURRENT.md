# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-14 02:35 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：`damienkuo123/auping-staging`

Remote `main`：
`249a8c3a3ee4725b9ab0c29c062105fc1f927025`

Commit：
`docs: track Design Heritage local acceptance`

Push verified：**YES**

## Completed Tier A routes

- `/about-auping/design/`
- `/about-auping/b-corp/`
- `/about-auping/proudly-manufactured-netherlands/`
- `/about-auping/design/advertising-classics/`
- `/about-auping/design/design-heritage/`

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

`/about-auping/design/designers/`

Stage：
`MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH`

Accepted warmed Gold:
- Official Desktop/Mobile `200`
- Local Desktop/Mobile `404` before materialization
- direct sections: `Breadcrumbs → HeaderImage → HeaderText → TruncatedText ×7` (10 direct)
- all `[data-section]`: Desktop 11 / Mobile 11 including footer
- H1: `Designers for Auping` ×2 in Official; local preserves two H1 and localizes both to `Auping 的設計師`
- effective main media: 7 / 7, all warmed loaded and visible
- Desktop/Mobile content-section text mismatch: 0; breadcrumb text differs intentionally by responsive presentation
- videos: 0
- template: `EDITORIAL_HEADERIMAGE_HEADERTEXT_PLUS_DESIGNER_PROFILES`
- Gold Analysis SHA: `eba1206ad40cb7fc2ed44907cdc63c7d34c112c98723949767d6999c18aa185b`
- dependency routing: Auronde + Essential local; Eva Harlou detail remains official external pending local-route closure

Local acceptance:
- route safe commit: `f5043e1e0db2b03695e3b35e520182321c8e0e02`
- canonical Taiwan/global Design shell reuse: PASS
- accepted warmed Gold main reuse: PASS
- Static: PASS
- Browser Desktop/Mobile: PASS
- human warmed screenshot review: `VISUAL_OK`
- push verified: **NO — pending**

Exact next action：
**Push origin, verify remote, then start `/about-auping/design/fabrics/` from warmed Gold Capture. Do not recapture or rematerialize Designers.**

## Cross-cutting visual-truth regression

Accepted after Advertising Classics exposed incomplete lazy-media state in raw full-page capture:
- Design: PASS
- B Corp: PASS
- PMNL: PASS

Factory rule: group responsive twins into effective media slots; scroll-warm only the rendered instance(s) and wait for `currentSrc + complete + naturalWidth` before final full-page screenshot/human review. This audit did not mutate any completed route source.

## Route order

1. advertising-classics ✅ COMPLETED
2. design-heritage ✅ COMPLETED
3. designers ← ACTIVE / LOCAL ACCEPTED / AWAITING PUSH
4. fabrics ← NEXT AFTER PUSH
5. Customer Service true-missing family
6. Accessories true-missing family

## Progress tracking rule

Construction progress and Final Acceptance progress are tracked separately.

- Historical Tier-A likely-true-missing planning subset: approx 16
- Completed + pushed Tier-A routes at accepted remote checkpoint: 5
- Locally accepted including Designers: 6
- Pushed planning-subset share: 5/16 = 31.25%; after Designers Push verification: 6/16 = 37.5% (planning subset only; **not whole-site completion**)
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
