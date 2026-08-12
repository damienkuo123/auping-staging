# Client handoff

## Deployment

The repository deploys through `.github/workflows/deploy-pages.yml` to GitHub Pages.

## Updating content

1. Work in a local repository copy.
2. Update HTML or assets.
3. Run `python3 tools/verify_level2_5.py <repo-root>`.
4. Commit and push through GitHub Desktop.
5. Confirm the Pages workflow completes.
6. Run the heavy UI Audit manually only for major releases.

## Updating official functions

Edit `assets/hybrid-functions.json`. Keep the embedded fallback configuration in `assets/snapshot-interactions.js` aligned.

## Rollback

The installer creates a local Git branch named `backup/pre-level2-5-<timestamp>` before applying changes.


---

<!-- AUPING_AI_CONTINUITY_POINTER_V1 -->
## Current AI / parity handoff protocol（2026-08-13）

任何新 ChatGPT 對話串或新的執行者，在修改網站前先讀：

1. `docs/AI_HANDOFF_CURRENT.md`
2. `docs/07_ROADMAP_NEXT_STEPS.md`
3. `docs/ROADMAP_STATUS.json`
4. `docs/PLAN.md`

再確認 GitHub remote `main` 是否等於 current checkpoint。

不要重跑已 accepted 的 Gold / Materialize / Commit；直接從 `AI_HANDOFF_CURRENT.md` 的 ACTIVE route / nextAction 接續。

目前 accepted remote baseline：
`2924457898a04662983d15791cac38bb7718cb8d`

目前 ACTIVE：
`/about-auping/proudly-manufactured-netherlands/`
Gold 已 accepted，下一步是 Materialize，不是 recapture。
