import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const HUBSPOT_MARKER = 'id="hs-script-loader"';
const HUBSPOT_SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

// HBLE CLEAN TEXT-ONLY MODE
// Visual files remain preserved in the repository for a future controlled rebuild,
// but no images, video, SVG, canvas art, or CSS background graphics are rendered.
const TEXT_ONLY_MARKER = 'id="hble-text-only"';
const TEXT_ONLY_STYLE = `<style id="hble-text-only">\nimg, picture, svg, canvas, video { display:none !important; }\n*, *::before, *::after { background-image:none !important; }\n.hero-media, .hero-reel, .portfolio, .project, .about-art, .motion-break, #hble-artwork-folder, .services-video-modal { display:none !important; }\n.hero { min-height:auto !important; }\n.hero-grid, .about-grid { grid-template-columns:1fr !important; max-width:900px !important; }\n.hero-grid { padding:100px 0 !important; }\n.btn-primary { background:#d5ad61 !important; color:#111 !important; }\n</style>`;

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");
  let changed = false;

  if (!html.includes(TEXT_ONLY_MARKER) && /<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${TEXT_ONLY_STYLE}\n</head>`);
    changed = true;
  }

  if (!html.includes(HUBSPOT_MARKER) && /<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${HUBSPOT_SNIPPET}\n</body>`);
    changed = true;
  }

  if (changed) {
    await writeFile(fullPath, html, "utf8");
    updated += 1;
  }
}

console.log(`HBLE text-only build complete. Updated ${updated} HTML file(s).`);
