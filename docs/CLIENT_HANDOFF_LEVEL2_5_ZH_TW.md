# Client Handoff｜Level 2.5 + Traditional Chinese

## Public entry points

- English: `/en/`
- Traditional Chinese: `/zh-tw/`

## Local content

Homepage, seven principal product categories, News, About Auping, Customer Service, Elysium Mattress representative detail, and Playful Bricks / shared bed-linen product detail.

## Official Auping services

Store Locator, Configurator, Contact, My Auping, Cart and official shop remain official Auping services and open on Auping-owned domains.

## Content updates

- English captured pages remain the visual/source baseline.
- Traditional Chinese localization strings are stored in `assets/i18n-zh-tw.json`.
- Chinese mirrored routes are listed in `assets/zh-tw-scope.json`.
- Local search data comes from `assets/search-index.js` and `assets/search-index-zh-tw.js`.

## Known boundary

Level 2.5 does not claim that every deep page, backend service, API, account flow or product configurator has been independently rebuilt. Deep pages outside the scope use English or official-service fallback.
