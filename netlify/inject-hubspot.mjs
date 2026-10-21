import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const MARKER = 'id="hs-script-loader"';
const SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

const GALLERY_MARKER = 'id="hble-artwork-folder"';
const GALLERY_LINK = `<div class="wrap" id="hble-artwork-folder" style="margin-top:-52px;padding-bottom:64px"><a class="btn btn-ghost" href="gallery.html" aria-label="Open HBLE Artwork and Designs gallery" style="font-size:1rem;padding:16px 22px">📁 Artwork &amp; Designs</a></div>`;

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");
  let changed = false;

  if (file === "index.html" && !html.includes(GALLERY_MARKER) && html.includes('<section class="motion-break">')) {
    html = html.replace('<section class="motion-break">', `${GALLERY_LINK}\n    <section class="motion-break">`);
    changed = true;
  }

  if (!html.includes(MARKER) && /<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${SNIPPET}\n</body>`);
    changed = true;
  }

  if (changed) {
    await writeFile(fullPath, html, "utf8");
    updated += 1;
  }
}

console.log(`HBLE build injection complete. Updated ${updated} HTML file(s).`);
