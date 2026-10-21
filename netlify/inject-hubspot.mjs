import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const HUBSPOT_MARKER = 'id="hs-script-loader"';
const HUBSPOT_SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

// HBLE LOGO-FIRST MODE
// The HBLE logo is the only approved graphic. All other images/video remain blocked
// until each master asset is deliberately restored and verified.
const TEXT_ONLY_MARKER = 'id="hble-text-only"';
const TEXT_ONLY_STYLE = `<style id="hble-text-only">\n/* Block every visual asset except the approved HBLE logo */\nimg:not(.hble-logo), picture, svg, canvas, video { display:none !important; }\n*, *::before, *::after { background-image:none !important; }\n\n/* Approved logo */\n.hble-logo { display:block !important; width:54px !important; height:54px !important; object-fit:contain !important; flex:0 0 54px !important; }\n.brand { display:flex !important; align-items:center !important; gap:12px !important; }\n\n/* Remove old media-only shells */\n.brand-mark, .hero-media, .hero-reel, .about-art, #hble-artwork-folder, .services-video-modal { display:none !important; }\n\n/* Keep the page clean and readable without other artwork */\n.hero { min-height:auto !important; }\n.hero-grid, .about-grid { grid-template-columns:1fr !important; max-width:900px !important; }\n.hero-grid { padding:100px 0 !important; }\n\n/* Preserve portfolio copy as text cards */\n.portfolio { grid-template-columns:repeat(3,minmax(0,1fr)) !important; }\n.project, .project.small { min-height:0 !important; padding:28px !important; background:#101010 !important; box-shadow:none !important; }\n.project::after { display:none !important; }\n.project-copy { position:static !important; }\n.project-stack { display:contents !important; }\n\n/* Keep statement section text-only */\n.motion-break { min-height:auto !important; padding:94px 0 !important; background:#070707 !important; }\n.motion-break::before, .motion-break::after { display:none !important; }\n.motion-copy { position:relative !important; }\n\n.btn-primary { background:#d5ad61 !important; color:#111 !important; }\n\n@media(max-width:950px){\n  .portfolio { grid-template-columns:1fr !important; }\n}\n@media(max-width:620px){\n  .hble-logo { width:46px !important; height:46px !important; flex-basis:46px !important; }\n}\n</style>`;

const LOGO_MARKER = 'class="hble-logo"';
const HOME_BRAND = '<a class="brand" href="#top">HBLE STUDIOS<small>HBLE ENTERPRISES INC.</small></a>';
const HOME_BRAND_WITH_LOGO = '<a class="brand" href="#top"><img class="hble-logo" src="images/Crown.jpg" alt="HBLE logo"><span>HBLE STUDIOS<small>HBLE ENTERPRISES INC.</small></span></a>';

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");
  let changed = false;

  if (file === "index.html" && !html.includes(LOGO_MARKER) && html.includes(HOME_BRAND)) {
    html = html.replace(HOME_BRAND, HOME_BRAND_WITH_LOGO);
    changed = true;
  }

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

console.log(`HBLE logo-first build complete. Updated ${updated} HTML file(s).`);
