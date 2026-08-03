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
