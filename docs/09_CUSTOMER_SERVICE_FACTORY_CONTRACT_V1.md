# 09｜Customer Service Factory Contract v1

狀態：**ACTIVE FACTORY BOOTSTRAP**
Baseline evidence：`d31e22ff69a8297d22d810fe5e058c238757328e`

## 1. Family disposition

Historical Customer Service family: 26 routes.

Existing exact local:
- `/customer-service/`
- `/customer-service/ordering/`

Approved official service exit:
- `/customer-service/contact/`

Missing local content routes:
- 23

The 23-route exact evidence snapshot completed 46 Desktop/Mobile machine cases with `machineAccepted=true`.

Human visual status for this snapshot:
**NOT PRESENTED BY TOOL / NOT PERFORMED**.
The final visual requirement remains open.

## 2. Six implementation-mechanic families

### CS_A_LEGAL_TEXT_ONLY — 3
- `/customer-service/auping-disclaimer/`
- `/customer-service/cookies/`
- `/customer-service/privacy-policy/`

Mechanic:
`Breadcrumbs + TruncatedText`

Special rule:
Do not blindly publish translated jurisdiction/company-specific policy language as Taiwan policy. Requires applicability classification.

### CS_B_HEADER_TRUNCATEDTEXT_SERIES — 16
- `/customer-service/frequently-asked-questions/`
- `/customer-service/frequently-asked-questions/bed-bases/`
- `/customer-service/frequently-asked-questions/bed-linen/`
- `/customer-service/frequently-asked-questions/beds-and-box-springs/`
- `/customer-service/frequently-asked-questions/mattresses-and-mattress-toppers/`
- `/customer-service/manuals/`
- `/customer-service/niaga-label/one/`
- `/customer-service/niaga-label/swl2/`
- `/customer-service/niaga-label/two/`
- `/customer-service/smartbase-support/auping-smart-base-auping-connect-app/`
- `/customer-service/smartbase-support/auping-smart-base-faq/`
- `/customer-service/smartbase-support/auping-smart-base-installation/`
- `/customer-service/smartbase-support/installation/`
- `/customer-service/smartbase-support/troubleshooting/`
- `/customer-service/smartbase-support/usage/`
- `/customer-service/warranty/`

Mechanic:
`Breadcrumbs + HeaderImage + N × TruncatedText`

N remains route-specific.
Text/media/links remain route-specific.
Do not normalize different routes into one generic copy.

### CS_C_REVIVE_SUPPORT_VIDEO — 1
`/customer-service/auping-revive-support/`

Mechanic:
`Breadcrumbs + HeaderImage + TruncatedText + VideoPlayer + TruncatedText`

Video playback is a hard gate.

### CS_D_QUICK_START_OVERVIEW — 1
`/customer-service/quick-start-guide/`

Mechanic includes `OverviewTiles`.
All tile destinations and mobile layout must be route-verified.

### CS_E_SMARTBASE_SUPPORT_HUB — 1
`/customer-service/smartbase-support/`

Composite route:
`Breadcrumbs + HeaderImage + TruncatedText + TwoColumn + TruncatedText + OverviewTiles + Image + TruncatedText + OverviewTiles + TruncatedText`

Responsive media participates per current viewport only.
Zero-layout responsive twins/icons must not create false failures.

### CS_F_INSTRUCTION_VIDEO_SERIES — 1
`/customer-service/smartbase-support/instruction-videos/`

Mechanic:
`Breadcrumbs + HeaderImage + TruncatedText + VideoPlayer ×4`

All four video sources and real playback must be accepted independently.

## 3. Factory architecture

Build-time only:
- exact Official evidence → route descriptor
- route descriptor + Taiwan localization/dependency map → output HTML
- canonical Customer Service shell/shared components reused where safe
- no fuzzy runtime string guessing
- no new shared runtime unless evidence proves a common missing interaction requires it

Factory output may be batch-generated.

Acceptance remains every-route.

## 4. Route descriptor contract

Each route descriptor must include:
- path
- Official URL
- metadata
- breadcrumb labels
- direct section sequence
- section-specific text
- image/media source inventory
- responsive source exceptions
- links + classification
- video inventory/playback requirement
- interaction inventory
- Taiwan localization notes
- legal/applicability flags
- expected Desktop/Mobile geometry fingerprints

## 5. Link policy

Classify every link as:
- local existing
- local being materialized in same batch
- approved official backend/service
- external third-party source
- unresolved dependency

Do not create accidental English-site fallbacks for ordinary Customer Service content.

## 6. Wave order

Recommended:
1. Lock route-data/localization/link/media contracts for all 23.
2. First batch: low-risk `CS_B` routes with dependencies closed in-batch.
3. `CS_D` Overview.
4. `CS_C` + `CS_F` video families.
5. `CS_E` composite Smart Base hub.
6. `CS_A` legal/policy only after Taiwan applicability decision.

## 7. Acceptance

Every generated route must independently pass:
- static structure
- D/M browser
- effective media
- video where present
- links/dependencies
- interaction replay where present
- visual differential
- Traditional Chinese
- no unexplained external English route
- route-safe source scope

Final release still requires the global same-commit sweep defined in `08_EFFECTIVE_1_TO_1_PARITY_ACCEPTANCE_CONTRACT.md`.
