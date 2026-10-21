import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const HUBSPOT_MARKER = 'id="hs-script-loader"';
const HUBSPOT_SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

// HBLE CLEAN TEXT-ONLY MODE
// Source media files remain preserved for a future controlled HD rebuild.
// The public site renders no visual media while preserving useful business copy.
const TEXT_ONLY_MARKER = 'id="hble-text-only"';
const TEXT_ONLY_STYLE = `<style id="hble-text-only">\n/* No visible raster/vector/video graphics */\nimg, picture, svg, canvas, video { display:none !important; }\n*, *::before, *::after { background-image:none !important; }\n\n/* Remove media-only shells */\n.brand-mark, .hero-media, .hero-reel, .about-art, #hble-artwork-folder, .services-video-modal { display:none !important; }\n\n/* Keep the page clean and readable without artwork */\n.hero { min-height:auto !important; }\n.hero-grid, .about-grid { grid-template-columns:1fr !important; max-width:900px !important; }\n.hero-grid { padding:100px 0 !important; }\n\n/* Preserve portfolio copy as text cards instead of hiding the whole section */\n.portfolio { grid-template-columns:repeat(3,minmax(0,1fr)) !important; }\n.project, .project.small { min-height:0 !important; padding:28px !important; background:#101010 !important; box-shadow:none !important; }\n.project::after { display:none !important; }\n.project-copy { position:static !important; }\n.project-stack { display:contents !important; }\n\n/* Keep statement section, remove its former artwork behavior */\n.motion-break { min-height:auto !important; padding:94px 0 !important; background:#070707 !important; }\n.motion-break::before, .motion-break::after { display:none !important; }\n.motion-copy { position:relative !important; }\n\n.btn-primary { background:#d5ad61 !important; color:#111 !important; }\n\n@media(max-width:950px){\n  .portfolio { grid-template-columns:1fr !important; }\n}\n</style>`;

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
