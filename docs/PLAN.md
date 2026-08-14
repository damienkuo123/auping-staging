# Auping Taiwan｜Effective 1:1 Parity Final Plan

版本：2026-08-14 Factory/Differential v1
Accepted remote baseline：`d31e22ff69a8297d22d810fe5e058c238757328e`

## 1. Current product target

唯一公開網站為繁體中文台灣版。

Final target is **Effective 1:1 parity**:
除繁體中文與明確核准的台灣在地化差異外，UI、layout、media、responsive、navigation、interaction state and user experience must match Official Auping.

Canonical contract:
- `docs/08_EFFECTIVE_1_TO_1_PARITY_ACCEPTANCE_CONTRACT.md`

Canonical roadmap:
- `docs/07_ROADMAP_NEXT_STEPS.md`

Current AI handoff:
- `docs/AI_HANDOFF_CURRENT.md`

Machine status:
- `docs/ROADMAP_STATUS.json`

## 2. New manufacturing model

Stop using page-by-page hand reconstruction as the main production method.

Use:
`Official truth → template/factory → route descriptor → batch output`

Factory handles shared mechanics.
Route descriptor preserves exact route-specific:
- content
- media
- links
- responsive exceptions
- interactions
- metadata

## 3. Acceptance model

Batch production does not mean batch acceptance.

Each route independently passes:
- D/M
- structure/content
- media/video
- links
- interactions
- visual differential
- zh-Hant-TW
- Taiwan exception ledger

Final release requires a same-commit global sweep.

## 4. Customer Service current state

23 missing content routes now have 46-case D/M exact machine evidence.

Customer Service Factory v1 is active:
- 6 implementation-mechanic families
- first major shared family covers 16/23 routes

Legal/policy pages are not blindly translated into Taiwan legal claims.

## 5. Final Definition of Done

At minimum:
- 262 live route dispositions
- 524 D/M route cases
- all required interactions
- all required media/videos
- routing/dependencies
- responsive representatives
- visual differential
- Traditional Chinese/accessibility/metadata
- approved Taiwan exceptions only
- public deployment/artifact identity
- one final Git commit

GitHub Actions green, HTTP 200 or a Factory PASS are insufficient.

## 6. Legacy note

`docs/PLAN.docx` and older Level 2.5 documents are historical context only where they conflict with this plan.

This file, `07_ROADMAP_NEXT_STEPS.md`, `AI_HANDOFF_CURRENT.md`, `ROADMAP_STATUS.json` and the Effective 1:1 contract are current authority.
