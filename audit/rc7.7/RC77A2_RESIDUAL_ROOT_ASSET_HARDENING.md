# RC7.7A2 Residual Root Asset Hardening

Baseline: `bde296227bfdc4ed7de5b0f25a30df82c0fea4c3`

RC7.7A1 deployed verification found that selected RC73 page cohorts still requested:

- `https://damienkuo123.github.io/icons/languages/EN_GB.svg`
- `https://damienkuo123.github.io/_next/static/media/*.woff2`

The product media repaired by RC7.7A1 remained visible. These new P1 results were caused by root-relative references inside legacy CSS when deployed under `/auping-staging`.

RC7.7A2:

- removes the obsolete EN_GB pseudo-element image from legacy CSS;
- changes legacy root-relative Next static media URLs to absolute official Auping URLs as an interim hardening step;
- preserves Taiwan Store Locator as `LOCAL_PARITY`;
- does not replace or guess product media;
- does not claim final remote-dependency localization.
