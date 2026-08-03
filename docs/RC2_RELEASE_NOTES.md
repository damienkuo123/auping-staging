# Auping Level 2.5 Hybrid RC2

## Why RC2 exists

Audit #6 reported high mid-page visual differences, but the evidence showed that most of the large desktop difference was caused by the reconstructed Mega Menu backdrop remaining open after the automated hover test. The screenshots were comparing normal original content against dimmed staging content.

RC2 fixes the cause instead of cosmetically changing page content.

## Changes

1. **WebM VP8 primary video delivery**
   - Adds WebM versions for all 10 captured videos.
   - Chromium, Chrome and Firefox use WebM first.
   - Safari and browsers without WebM support retain MP4 fallback.
   - Four fallback candidates are available: GitHub Raw WebM, GitHub WebM alternate URL, GitHub Raw MP4, GitHub MP4 alternate URL.
   - Existing local poster fallback remains in place.

2. **Deterministic Mega Menu close**
   - Closes on scroll, resize, window blur, page hide and pointer movement outside primary navigation.
   - Prevents the dim backdrop from remaining over page content.

3. **Audit correction**
   - Explicitly closes the Mega Menu after every hover capture.
   - Clears menu state before scroll screenshots.
   - Adds video network state, media error and active media candidate diagnostics.
   - Heavy Audit remains manual-only.

## Scope

This release does not redesign captured page content. Initial viewport evidence showed that Bed bases, Toppers and Bed linen were already very close, while Beds, Box springs and Mattresses were primarily affected by different video frames. Page content is not removed simply to improve a misleading pixel score.

## Deployment gate

After installation and Push:
- Wait only for the GitHub Pages deployment.
- Manually open `/en/`, `/en/beds/`, `/en/mattresses/` in Chrome and Safari.
- Confirm video playback or poster fallback.
- Do not run the heavy Audit unless a final metric is required.
