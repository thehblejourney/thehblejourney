import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const MARKER = 'id="hs-script-loader"';
const SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

const GALLERY_MARKER = 'id="hble-artwork-folder"';
const GALLERY_LINK = `<div class="wrap" id="hble-artwork-folder" style="margin-top:-52px;padding-bottom:64px"><a class="btn btn-ghost" href="gallery.html" aria-label="Open HBLE Artwork and Designs gallery" style="font-size:1rem;padding:16px 22px">📁 Artwork &amp; Designs</a></div>`;

const UNIVERSE_OLD = `<article class="project small"><img src="images/Keoka.jpg" alt="HBLE character and portrait visual"><div class="project-copy"><div class="project-tag">Character Worlds</div><h3>Universe Building</h3><p>Characters, environments and visual systems designed to belong to the same world.</p></div></article>`;
const UNIVERSE_NEW = `<article class="project small"><img src="https://raw.githubusercontent.com/thehblejourney/thehblejourney/783a99819ae6182a838db66409f0b91c415ce623/images/visual-universe/tough-girls-universe-x.jpg" alt="T.O.U.G.H. G.I.R.L.S. Universe X artwork"><div class="project-copy"><div class="project-tag">Character Worlds</div><h3>Universe Building</h3><p>T.O.U.G.H. G.I.R.L.S. — Universe X: original characters, environments and visual systems built to belong to one world.</p></div></article>`;

const PERFORMANCE_OLD = `<article class="project small"><img src="images/image3.jpg" alt="HBLE creative production visual"><div class="project-copy"><div class="project-tag">Music & Performance</div><h3>Performance Visuals</h3><p>Edits and visual concepts shaped around personality, rhythm and presence.</p></div></article>`;
const PERFORMANCE_NEW = `<article class="project small" aria-label="HBLE performance visual previews"><div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#050505;overflow:hidden"><div style="position:relative;overflow:hidden"><video src="videos/every-way-preview.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Every Way performance preview" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.92) brightness(.78)"></video><span style="position:absolute;z-index:2;top:10px;left:10px;padding:5px 7px;border-radius:999px;background:rgba(0,0,0,.68);border:1px solid rgba(213,173,97,.38);font-size:.53rem;letter-spacing:.1em;color:#f2d998">EVERY WAY</span></div><div style="position:relative;overflow:hidden"><video src="videos/who-is-andie-howard-preview.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Who Is Andie Howard performance preview" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.92) brightness(.78)"></video><span style="position:absolute;z-index:2;top:10px;right:10px;padding:5px 7px;border-radius:999px;background:rgba(0,0,0,.68);border:1px solid rgba(213,173,97,.38);font-size:.53rem;letter-spacing:.08em;color:#f2d998">ANDIE HOWARD</span></div></div><div class="project-copy"><div class="project-tag">Music &amp; Performance</div><h3>Performance Visuals</h3><p>Real HBLE motion work from Every Way and Who Is Andie Howard.</p></div></article>`;

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");
  let changed = false;

  if (file === "index.html") {
    if (html.includes(UNIVERSE_OLD)) {
      html = html.replace(UNIVERSE_OLD, UNIVERSE_NEW);
      changed = true;
    }

    if (html.includes(PERFORMANCE_OLD)) {
      html = html.replace(PERFORMANCE_OLD, PERFORMANCE_NEW);
      changed = true;
    }

    if (!html.includes(GALLERY_MARKER) && html.includes('<section class="motion-break">')) {
      html = html.replace('<section class="motion-break">', `${GALLERY_LINK}\n    <section class="motion-break">`);
      changed = true;
    }
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
