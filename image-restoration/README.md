# HBLE Image Restoration Module

This folder is intentionally isolated from the core HBLE website so restoration pricing and workflow can change without rewriting the main site.

## Files
- `index.html` — page and Netlify request form
- `restoration.css` — page-only styling
- `config.js` — pricing tiers, add-ons, file limit, and optional promotions
- `restoration.js` — estimator and upload workflow

## Common future changes
### Change a price
Edit only `config.js`.

### Add or remove an add-on
Edit the `addOns` array in `config.js`.

### Run a $2 Quick Restore promotion
In `config.js`, set `promo.enabled` to `true`. The current promo is configured for $2 per photo on Quick Restore with a minimum of 10 photos. Change `minimumPhotos` if needed.

### Change the maximum number of photos
Edit `maxFiles` in `config.js`.

### Change customer wording or form questions
Edit `index.html` only.

## Core-site isolation
The homepage connection is handled by `netlify/inject-design-studio-link.mjs`. The restoration module itself does not require changes to the main `index.html` source.
