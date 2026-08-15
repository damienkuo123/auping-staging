# Auping Taiwan Parity｜AI Handoff Current Checkpoint

更新：2026-08-14 15:37 +08:00
狀態：**CURRENT / READ THIS FIRST**

## Accepted remote checkpoint

Repository：`damienkuo123/auping-staging`

Remote `main`：
`d31e22ff69a8297d22d810fe5e058c238757328e`

Commit：
`docs: track Fabrics local acceptance`

Push verified：**YES**

## Locked product goal — Effective 1:1 Parity

最終目標不是「看起來差不多」，而是 **Effective 1:1 parity**：

> 除繁體中文與明確核准的台灣在地化差異外，使用者在對應 viewport 所看到的 UI、版型、媒體、responsive 行為、可操作狀態、導航與互動結果，都必須與 Official Auping 對應頁一致。

Factory 只負責提高「製造效率」，**Factory PASS 絕對不等於 Route PASS**。
最終 Acceptance 仍必須 route-by-route / viewport-by-viewport / interaction-state-by-interaction-state 對 Official 做 differential validation。

Canonical acceptance contract：
`docs/08_EFFECTIVE_1_TO_1_PARITY_ACCEPTANCE_CONTRACT.md`

## Completed + pushed Tier A routes

- `/about-auping/design/`
- `/about-auping/b-corp/`
- `/about-auping/proudly-manufactured-netherlands/`
- `/about-auping/design/advertising-classics/`
- `/about-auping/design/design-heritage/`
- `/about-auping/design/designers/`
- `/about-auping/design/fabrics/`

Fabrics accepted route commit：
`87daeba63549d6739ad7297a23391e7074bc236a`

Fabrics progress docs / accepted remote：
`d31e22ff69a8297d22d810fe5e058c238757328e`

Do not recapture/rematerialize completed routes unless a later evidence-backed regression demands it.

## Customer Service family — current checkpoint

Historical family：26 routes.

Disposition:
- Existing exact local:
  - `/customer-service/`
  - `/customer-service/ordering/`
- Approved official backend/service exit:
  - `/customer-service/contact/`
- Missing local content routes requiring materialization:
  - **23**

23-route exact evidence snapshot:
- baseline: `d31e22ff69a8297d22d810fe5e058c238757328e`
- route count: **23**
- Desktop + Mobile cases: **46**
- Official HTTP 200 / main evidence / effective media gate: **46/46 machine accepted**
- videos captured and actual playback probed where present
- responsive hidden media excluded only when non-participating in current viewport
- source/runtime/docs mutation: **NONE**
- human visual review: **NOT PRESENTED BY TOOL / NOT PERFORMED**
- final visual acceptance therefore remains open and must be covered by route differential + final global visual sweep

Exact evidence Receipt SHA-256:
`e3e2cf5eb17f53f4a5cb4f5f5540b91a11874c7033aeedc97bffdca651f0543a`

Important correction:
A previous tool asked for `GOLD_OK` without actually presenting screenshots when the input was a ZIP. That is a tool defect. Never record such a case as human visual acceptance. If screenshots are not presented, record `NOT_PRESENTED_BY_TOOL`.

## Customer Service Factory v1

Factory contract:
`docs/09_CUSTOMER_SERVICE_FACTORY_CONTRACT_V1.md`

Machine-readable:
- `data/parity/customer-service-factory-v1.json`
- `data/parity/effective-1to1-acceptance-v1.json`

Build-time validator/bootstrap:
- `tools/parity/customer_service_factory_v1.py`

The 23 routes are generalized into six implementation-mechanic families:

1. `CS_A_LEGAL_TEXT_ONLY` — 3
2. `CS_B_HEADER_TRUNCATEDTEXT_SERIES` — 16
3. `CS_C_REVIVE_SUPPORT_VIDEO` — 1
4. `CS_D_QUICK_START_OVERVIEW` — 1
5. `CS_E_SMARTBASE_SUPPORT_HUB` — 1
6. `CS_F_INSTRUCTION_VIDEO_SERIES` — 1

These are **production mechanics**, not a claim that route content/visuals are identical.

Legal/privacy/cookie pages require Taiwan applicability review before local publication; do not blindly translate Netherlands legal facts into a Taiwan policy claim.

## New canonical workflow

`Official Truth Database → Factory / route-data generation → batch materialization → every-route differential acceptance → final same-commit global sweep`

Permanent rules:

- Production can be batch/factory based.
- Acceptance can **never** be inherited from the factory.
- Every live route must receive its own final disposition.
- Minimum formal final gate remains **262 official live routes × Desktop/Mobile = 524 viewport cases**.
- Template representatives also receive intermediate breakpoint coverage (tablet / breakpoint transitions).
- Every actual interaction instance must be replayed against Official where applicable.
- Visual comparison runs on every final route case; human review focuses on machine outliers, but missing visual evidence can never be silently called PASS.
- final acceptance evidence must come from the **same final Git commit**.
- translation-induced reflow is allowed; unexplained visual/behavioral differences are not.
- Taiwan exceptions must be explicitly ledgered.
- GitHub Actions green / HTTP 200 / DOM existence / one verifier PASS are never whole-site completion.

## Current next action

**Customer Service Factory Wave 7 Legal Closure is LOCAL ACCEPTED / AWAITING PUSH.**

Accepted routes:
- `/customer-service/auping-disclaimer/`
- `/customer-service/cookies/`
- `/customer-service/privacy-policy/`

Acceptance:
- 3 routes × Desktop/Mobile = 6 formal differential cases
- all 3 legal routes also passed 768/1024 representative coverage = 6 extra cases
- Official `Breadcrumbs + TruncatedText` mechanics preserved route-by-route
- machine horizontal geometry differential PASS; legal localization vertical reflow allowed
- Official/Local screenshots actually presented in REVIEW.html
- human review: `VISUAL_OK`
- Disclaimer: Official global liability language is qualified so Taiwan non-waivable rights are not purportedly excluded
- Cookies: Official Cookiebot dynamic consent state / cookie inventory is not republished as Taiwan runtime truth
- Privacy: Royal Auping bv global-policy facts are separated from Taiwan collection; Taiwan PDPA rights are summarized without inventing a Taiwan data controller
- Wave 6 Warranty remote main verified at `1195859b24d8095be4c4338e2e60d1603a5d514e`
- route safe commit: `ba40dd84b6fbb3dd676e77aa183de8793c8f42f7`
- remote push verified: **NO — pending**

Customer Service missing-content status:
- **23/23 locally accepted = 100%**
- this does NOT yet equal Customer Service family final closure or whole-site completion

Next after push:
**Verify Wave 7 remote exact SHA, then run Customer Service 26-route family closure: 2 existing exact + 1 approved Contact service-boundary + 23 accepted materialized routes, with a same-commit D/M family sweep.**

## Progress interpretation

- Tier-A historical likely-true-missing planning subset: approx 16
- completed+pushed before Customer Service batch: 7
- planning-subset share: `7/16 = 43.75%`
- this is **not whole-site completion**
- global final same-commit sweep has **not started**


## Customer Service 26-route family closure — verified
- baseline tested: `c311e34d51dc3c29e69dedc8b3bd00c693ba295e`
- 26/26 route dispositions closed
- 52/52 Desktop/Mobile formal cases PASS
- 20/20 representative midwidth cases PASS
- interaction replay hard gate PASS
- 23/23 materialized + 2 existing exact + 1 approved Contact service-boundary
- human visual review: `VISUAL_OK`
- shared runtime mutation: NONE
- whole-site Effective 1:1 final acceptance: NOT YET
