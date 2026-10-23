# HBLE In Motion — Add Media

HBLE In Motion is controlled by `media/hble-motion/manifest.json`.

## Add a new item

1. Upload the original media file to the site repository (recommended folders: `media/hble-motion/videos/` or `media/hble-motion/images/`).
2. Add one object to the `items` array in `manifest.json`.
3. Deploy the site. The section updates automatically; no homepage HTML rewrite is required.

### Video entry

```json
{
  "id": "unique-video-name",
  "title": "Display Title",
  "category": "Commercials",
  "type": "video",
  "src": "/media/hble-motion/videos/file.mp4",
  "poster": "/media/hble-motion/images/poster.jpg"
}
```

### Image entry

```json
{
  "id": "unique-image-name",
  "title": "Display Title",
  "category": "Brand",
  "type": "image",
  "src": "/media/hble-motion/images/file.jpg"
}
```

Set `"featured": true` on one item to make it the default featured piece. New category names automatically become filter buttons.

## HBLE media rule

Use approved master files. Do not create reduced WebP copies or re-encode original video just to add it to this section.
