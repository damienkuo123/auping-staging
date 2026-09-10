# Auping Current Scope Re-baseline v2 — Production Roadmap

## Authority now established by this package

- Current canonical scope: **328**
- Formally accepted and preserved: **193**
- True remaining backlog: **135**
- Minimum final Desktop/Mobile cases: **656**
- Canonical328 SHA256: `ce37796cf8f94d3eeaea5235ac9681d8a8be45d86eafee291e6eb4ac4a4598fd`
- Remaining135 SHA256: `40e7b0c5a6c5b79949811810ee81a52dc9db394aa2500f6da66f81d7cc0218a6`

This does **not** redo any accepted route.

## Backlog135 engineering partition

- **78 existing exact routes** → differential revalidation first; repair only when evidence shows a defect.
- **7 `/mattress-toppers/...` exact paths absent but `/toppers/...` donor routes already exist** → path-bridge/reuse proof before any rebuild.
- **50 true-missing routes** → actual materialization work.

### Existing78 by family
{'about-auping': 2, 'bed-bases': 6, 'beds': 33, 'box-springs': 26, 'mattresses': 7, 'news': 2, 'store-locator': 1, 'stories': 1}

### True-missing50 by family
{'about-auping': 4, 'beds': 3, 'box-springs': 2, 'klantenservice': 1, 'mattresses': 1, 'news': 29, 'stories': 10}

## Fastest safe execution order

1. **Scope v2 PRECOMMIT** — run the included Mac command. It writes only new scope/ledger files, never stages/commits/pushes.
2. User commits/pushes with GitHub Desktop.
3. **Existing78 differential census** in family batches. Do not rebuild first.
4. **PathBridge7** prove `/toppers/` donors against Current Official `/mattress-toppers/`; materialize route-path twins only if donor parity is valid.
5. **TrueMissing50 production**, split:
   - Product/detail: Beds 3 + Box Springs 2 + Mattresses 1 = 6
   - Editorial About Auping: 4
   - News: 29
   - Stories: 10
   - Legacy Smart Base video route: 1
6. Formal Remote Final by cohort.
7. Same-commit global 328-route sweep before final token.

## Git safety

The runner:
- requires clean `main`;
- fetches origin read-only;
- requires local HEAD == origin/main == `6c64a9a...`;
- verifies current v1 contract remains 262;
- verifies all 193 accepted routes are in embedded 328;
- recomputes local repo presence for all Remaining135;
- requires exact `78 present / 57 absent`;
- requires all 7 `/toppers/` donors present;
- copies only new v2 scope/ledger files;
- never runs `git add`, `git commit`, or `git push`.
