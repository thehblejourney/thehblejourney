import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const MARKER = 'id="hs-script-loader"';
const SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");

  if (html.includes(MARKER)) continue;
  if (!/<\/body>/i.test(html)) continue;

  html = html.replace(/<\/body>/i, `${SNIPPET}\n</body>`);
  await writeFile(fullPath, html, "utf8");
  updated += 1;
}

console.log(`HubSpot tracking injection complete. Updated ${updated} HTML file(s).`);
