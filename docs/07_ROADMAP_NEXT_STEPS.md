# 07｜Canonical Roadmap — Updated 2026-08-13 16:57 +08:00

狀態：**AUTHORITATIVE / CANONICAL**
Repo：`damienkuo123/auping-staging`

## Current accepted remote checkpoint

`0d72d48bec595d4d9cf4f892e174d0c27cc6377b`
`fix: normalize Design Gold CSS link syntax`

Completed Tier A:
- [x] `/about-auping/design/`
- [x] `/about-auping/b-corp/`
- [x] `/about-auping/proudly-manufactured-netherlands/`

PMNL remote push has been verified. Do not recapture or rematerialize PMNL unless a later evidence-backed regression requires it.

## Step 1 — Design source hygiene — COMPLETED / PUSHED

- malformed Gold CSS tags: `11 → 0`
- exact route scope only: `about-auping/design/index.html`
- Desktop/Mobile machine before-after gate PASS
- human review `VISUAL_OK`
- commit: `0d72d48bec595d4d9cf4f892e174d0c27cc6377b`

## Step 2 — Tier A Missing Routes

Next:
- [ ] `/about-auping/design/advertising-classics/`
- [ ] `/about-auping/design/design-heritage/`
- [ ] `/about-auping/design/designers/`
- [ ] `/about-auping/design/fabrics/`
- [ ] Customer Service true-missing family
- [ ] Accessories true-missing family

Planning estimate:
historical 16 likely true missing → after the first 3 completed, approximately 13 remain, subject to route disposition review.

Advertising Classics current stage:
**GOLD_ANALYSIS_ACCEPTED_AWAITING_MATERIALIZE**

Accepted Gold structure:
`Breadcrumbs → HeaderImage → TruncatedText ×16`

Template candidate:
`EDITORIAL_HEADERIMAGE_PLUS_TRUNCATEDTEXT_SERIES`

Exact next route action:
Materialize from accepted Gold Analysis with canonical Taiwan/global component reuse. **Do not recapture Gold.**

## Phase A progress tracking

- historical likely-true-missing planning subset: approx 16
- completed + pushed Tier-A routes: 3
- active: Advertising Classics at Gold Analysis accepted
- 3/16 = 18.75% of that planning subset only; this is **not** whole-site completion
- whole-site completion remains evidence-based against 262 routes / 524+ viewport cases plus cross-cutting closure

## Step 3 — Generic Tier-A Factory

After 2–3 more distinct page templates:
- reusable Gold capture
- translation map
- canonical Taiwan component lookup/reuse
- source-safe materializer
- static DOM acceptance
- Desktop/Mobile browser
- media/video playback
- screenshot/manual review
- one-route safe commit

No per-page verifier reinvention.

Permanent Factory rules:
- canonical component reuse first
- exact scope + baseline lock
- structure counts via DOM, not raw substring
- Python stdlib on user Mac; do not assume bs4
- image computed visibility + actual rect/currentSrc
- video official currentSrc + actual playback/currentTime advance
- mobile carousel/USP uses actual text/icon intersection, not parent box
- machine PASS still requires screenshot human review
- machine FAIL caused by verifier coding bug must not trigger source damage
- prefer safe route-level opt-out over shared runtime edits when available

## Step 4 — Tier B/C disposition

Historical:
- Tier B 32
- Tier C 41

Classify each route:
True Missing / Existing Equivalent / Alias / Redirect / Approved Fallback / Not Applicable.

## Step 5 — Official Gold Read More reconstruction

Confirmed first four:
1. Auping Cloud
2. Dew Pillow
3. Nest Pillow
4. 1M electrically adjustable bed base

Read More full official content must exist in local DOM/template; generic JS cannot invent missing content.

## Step 6 — Interaction patterns

340 raw → about 15 patterns.
Prioritize Read More, accordion, carousel/gallery, selector/filter, mobile navigation, search, product controls, video controls, and official mobile USP/projection patterns where required.

## Step 7 — Structure templates

64 raw → about 8 templates. Fix shared template/root causes rather than route-by-route symptoms.

## Step 8 — Spatial Media + Video

Spatial queue: 775 candidates / about 554 high-confidence.
Known video gap: 6 events / 4 routes.
Every repair requires traceable official source.

## Step 9 — Full Traditional Chinese + dependency closure

Translation census: 328 unique / approx 327 after whitelist.
Audit visible English, accessibility/metadata, NL contact residual, external route/dependency, Store Locator policy, configurator policy, fonts/media critical dependencies.

## Step 10 — Final Acceptance

At minimum:
**262 official live routes × Desktop/Mobile = 524 viewport cases**

Plus interaction replay, image/video, routing/dependencies, language, critical console/network, Taiwan support/Store Locator, deployed public URL, and evidence archive.

Final completion only with evidence. GitHub Actions green, HTTP 200, DOM existence, or one-route machine `accepted=true` are not final completion.

## ETA

Current planning:
- normal safe path: about 3–5 weeks
- roughly 14–28 focused working days
- factoryized potential: about 2–3 weeks

Recalculate after every major phase.
