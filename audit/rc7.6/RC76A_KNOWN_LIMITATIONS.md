# RC7.6A — Known limitations

- This package fixes only the two manually confirmed shared CTA image failures.
- Local files flagged only during the high-load localhost scan were not replaced because the repository copies are present, valid images and the failures were `ERR_CONNECTION_RESET`, indicating a scanner/server transient rather than missing assets.
- Five thin Noa derivative pages, the incomplete `/news/awards/` page, missing mobile category videos, article coverage gaps and remote-runtime reduction remain later RC7.6 work.
- Store Locator behavior is unchanged.
