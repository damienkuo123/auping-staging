# 07｜Canonical Roadmap — Updated 2026-08-14 13:40 +08:00

狀態：**AUTHORITATIVE / CANONICAL**
Repo：`damienkuo123/auping-staging`

## Current accepted remote checkpoint

`b1ed4d31355d087a77e063867102a002ca21b183`
`docs: track Designers local acceptance`

Completed Tier A:
- [x] `/about-auping/design/`
- [x] `/about-auping/b-corp/`
- [x] `/about-auping/proudly-manufactured-netherlands/`
- [x] `/about-auping/design/advertising-classics/`
- [x] `/about-auping/design/design-heritage/`
- [x] `/about-auping/design/designers/`

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
- [x] `/about-auping/design/design-heritage/`
- [x] `/about-auping/design/designers/`
- [ ] `/about-auping/design/fabrics/` ← ACTIVE / LOCAL ACCEPTED / AWAITING PUSH
- [ ] Customer Service true-missing family
- [ ] Accessories true-missing family

Planning estimate:
historical likely-true-missing Tier-A planning subset remains approximately 16; 6 are completed+pushed at the accepted remote checkpoint.

Fabrics current stage:
**MATERIALIZE_ACCEPTED_LOCAL_AWAITING_PUSH**

Accepted warmed Gold:
- Official Desktop/Mobile `200`
- local public + repo preview Desktop/Mobile `404` before materialization
- direct main structure: `Breadcrumbs → HeaderImage → TruncatedText ×6` (8 direct sections)
- all `[data-section]`: 9 including footer
- H1: `Our fabrics` ×1, localized to `我們的布料`
- effective main media: 6 Desktop / 6 Mobile, all scroll-warmed loaded + visible
- responsive Hero source intentionally differs: Desktop `onze-stoffen-desktop.jpg`, Mobile `onze-stoffen-mobile_0.jpg`
- videos: 0
- template: `EDITORIAL_RESPONSIVE_HEADERIMAGE_PLUS_TRUNCATEDTEXT_FABRIC_GROUPS`
- Gold Analysis SHA: `41acc9e09f133281c5cd4f53e98620c6f2cf95d070101c4e7bd222fca3256562`
- Original / Kiruna / Criade / Essential links use existing Taiwan local routes

Local acceptance:
- route safe commit: `87daeba63549d6739ad7297a23391e7074bc236a`
- canonical Design/Taiwan shell reused
- accepted warmed Gold main reused
- responsive Hero source override preserved
- Static gate PASS
- Desktop/Mobile browser + effective-media gate PASS
- human warmed screenshot review `VISUAL_OK`
- remote push verified: **NO — pending user Push origin**

Exact next route action:
Push the Fabrics route + progress docs commits, verify remote, then advance to Customer Service true-missing family disposition / warmed Gold Capture. Do not recapture or rematerialize Fabrics once pushed.

## Phase A progress tracking

- historical likely-true-missing Tier-A planning subset: approx 16
- completed + pushed Tier-A routes at accepted remote checkpoint: 6
- locally accepted routes including Fabrics: 7
- pushed planning-subset share: `6/16 = 37.5%`
- expected after Fabrics Push + remote verification: `7/16 = 43.75%`
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
