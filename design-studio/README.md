# HBLE Design Studio module

This folder is intentionally isolated from the core HBLE website so future Design Studio changes do not require editing the main site structure.

## Files
- `index.html` — page shell and Netlify quote form. Change only when the page structure itself needs to change.
- `studio.css` — Design Studio-only styling.
- `config.js` — page settings, category names, add-ons, and reusable question templates.
- `services.js` — service catalog. Most future additions/removals/wording changes belong here.
- `studio.js` — selection/form engine. Usually leave this file alone.

## Add a service
Add one object to `services.js`:

```js
{
  id: 'unique-service-id',
  title: 'Service Name',
  category: 'Invitations & Celebrations',
  description: 'Short customer-facing description.',
  template: 'event',
  extraFields: [
    { id:'custom_question', label:'Question shown to customer', type:'text' }
  ]
}
```

Supported templates are maintained in `config.js`: `event`, `memorial`, `business`, `media`, `sports`, and `custom`.

Supported field types include `text`, `date`, `textarea`, and `select`. A `select` field uses an `options` array.

## Change add-ons or categories
Edit `config.js` only.

## Core-site integration
The main site links to `/design-studio/` through the dedicated Netlify injector `netlify/inject-design-studio-link.mjs`. The purpose of that injector is to provide one stable integration point so Design Studio catalog changes never require editing `index.html`.
