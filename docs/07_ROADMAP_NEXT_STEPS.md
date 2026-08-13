# 07｜Canonical Roadmap — Updated 2026-08-14 01:47 +08:00

狀態：**AUTHORITATIVE / CANONICAL**
Repo：`damienkuo123/auping-staging`

## Current accepted remote checkpoint

`ead6733b8afa335bc5a95f00faff458cbcd5b46d`
`docs: record legacy lazy-media visual truth audit`

Completed Tier A:
- [x] `/about-auping/design/`
- [x] `/about-auping/b-corp/`
- [x] `/about-auping/proudly-manufactured-netherlands/`
- [x] `/about-auping/design/advertising-classics/`

PMNL remote push has been verified. Do not recapture or rematerialize PMNL unless a later evidence-backed regression requires it.

## Step 1 — Design source hygiene — COMPLETED / PUSHED

- malformed Gold CSS tags: `11 → 0`
- exact route scope only: `about-auping/design/index.html`
- Desktop/Mobile machine before-after gate PASS
- human review `VISUAL_OK`
- commit: `0d72d48bec595d4d9cf4f892e174d0c27cc6377b`

## Step 2 — Tier A Missing Routes

Next:
- [x] `/about-auping/design/advertising-classics/`
- [ ] `/about-auping/design/design-heritage/` ← ACTIVE / LOCAL ACCEPTED / AWAITING PUSH
- [ ] `/about-auping/design/designers/`
- [ ] `/about-auping/design/fabrics/`
- [ ] Customer Service true-missing family
- [ ] Accessories true-missing family

Planning estimate:
historical likely-true-missing Tier-A planning subset remains approximately 16; 4 are completed+pushed at the accepted remote checkpoint.

Design Heritage current stage:
**MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH**

Accepted warmed Gold:
- Official Desktop/Mobile `200`
- local public + repo preview Desktop/Mobile `404` before materialization
- direct main structure: `Breadcrumbs → TruncatedText ×17` (18 direct sections)
- all `[data-section]`: 19 including footer
- H1: none; do not invent one
- effective main media: 17 Desktop / 17 Mobile, all scroll-warmed loaded + visible
- videos: 0
- template: `EDITORIAL_TRUNCATEDTEXT_MEDIA_TIMELINE`
- Gold Analysis SHA: `b15a8ae6b218ca0adf73b9def8b5494a484cd3971edadf8aec69976a66850cdd`

Local acceptance:
- route safe commit: `ffab113fc1f05203873298aa434dcbb3d6b33c65`
- canonical Design/Taiwan shell reused
- accepted warmed Gold main reused
- Static gate PASS
- Desktop/Mobile browser + effective-media gate PASS
- human warmed screenshot review `VISUAL_OK`
- remote push verified: **NO — pending user Push origin**

Exact next route action:
Push the Design Heritage route + progress docs commits, verify remote, then advance to `/about-auping/design/designers/`. Do not recapture or rematerialize Design Heritage once pushed.

## Phase A progress tracking

- historical likely-true-missing Tier-A planning subset: approx 16
- completed + pushed Tier-A routes at accepted remote checkpoint: 4
- locally accepted routes including Design Heritage: 5
- pushed planning-subset share: `4/16 = 25%`
- expected after Design Heritage Push + remote verification: `5/16 = 31.25%`
- these percentages describe the Tier-A planning subset only; they are **not whole-site completion**
- whole-site final acceptance remains 262 live routes / 524+ viewport cases plus interaction, media/video, language and dependency closure

## Legacy completed-route lazy-media visual truth — ACCEPTED

Advertising Classics exposed a capture-methodology issue: a raw full-page screenshot can be taken before lower lazy images receive `currentSrc`. The completed-route regression audit therefore scroll-warmed every **rendered responsive instance of each effective `<main>` media slot** on Official + Local, Desktop + Mobile before full-page capture. Hidden desktop/mobile twins are preserved and are not required to load in the opposite viewport.

Audited with zero route-source mutation:
- [x] `/about-auping/design/`
- [x] `/about-auping/b-corp/`
- [x] `/about-auping/proudly-manufactured-netherlands/`

Permanent visual acceptance rule:
`navigate → identify effective media slots → ignore intentionally hidden responsive twins → scroll each rendered instance into viewport → wait currentSrc + complete + naturalWidth → return top → full-page screenshot → human review`

PMNL Taiwan Store Locator media is excluded from exact Official/Local media-set comparison because Taiwan deliberately uses the local locator contract. PMNL video remains governed by its already-accepted actual-currentSrc + playback gate.

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
