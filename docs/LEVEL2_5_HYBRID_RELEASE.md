# Auping Level 2.5 Hybrid RC1

## Release target

High-fidelity local public pages with official Auping routing for services that depend on the original backend.

## Local experience

- Homepage
- Header and mega menu
- Mobile navigation
- Local search overlay
- Box springs
- Beds
- Mattresses
- Toppers
- Bed bases
- Pillows
- Bed linen
- About and customer-service content pages

## Official-service routing

- Find a store
- Auping configurator
- Contact
- My Auping
- Shopping cart
- Official shop

The destination list is maintained in `assets/hybrid-functions.json`.

## Video policy

The existing MP4 sources remain available. Every audited key video now has a local poster generated from the actual video. The poster is shown immediately and fades away after the video reaches a playable state. If the MP4 or browser codec fails, the page keeps the correct visual composition instead of showing a black rectangle.

## Audit policy

The heavy GitHub Actions visual audit is manual-only. Routine pushes run only the Pages deployment. This avoids an additional 17–19 minute audit after each small update.
