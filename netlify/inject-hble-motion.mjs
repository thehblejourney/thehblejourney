import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
let html = await readFile(file, 'utf8');
const marker = 'id="hble-in-motion"';

const headAssets = `\n<link rel="stylesheet" href="/hble-motion.css">\n<script src="/hble-motion.js" defer></script>\n`;

const section = `<section id="hble-in-motion" aria-labelledby="hble-motion-heading">
  <div class="hble-motion-shell">
    <div class="hble-motion-kicker">HBLE ENTERPRISES INC. • MOTION SYSTEM</div>
    <h2 id="hble-motion-heading" class="hble-motion-title"><span data-motion-section-title>HBLE IN MOTION</span></h2>
    <p class="hble-motion-sub" data-motion-section-subtitle>Where Ideas Become Experiences.</p>

    <div class="hble-motion-stage" aria-label="HBLE animated brand sequence">
      <div>
        <img class="hble-motion-emblem" src="/images/Crown.jpg" alt="HBLE crown logo" style="display:block!important">
        <div class="hble-motion-story" aria-live="off">
          <div class="hble-motion-line">HUMBLE <strong>BEGINNINGS</strong></div>
          <div class="hble-motion-line">LEGENDARY <strong>ENDINGS</strong></div>
          <div class="hble-motion-line">WE ARE <strong>HBLE.</strong></div>
        </div>
        <div class="hble-motion-pillars" aria-label="HBLE creative pillars">
          <span>Media</span><span>Consulting</span><span>Community</span><span>Creation</span>
        </div>
      </div>
    </div>

    <div class="hble-motion-hub">
      <div class="hble-motion-toolbar">
        <div class="hble-motion-filters" data-motion-filters></div>
        <div class="hble-motion-count" data-motion-count></div>
      </div>
      <div class="hble-motion-featured" data-motion-featured>
        <div class="hble-motion-empty">Loading HBLE In Motion…</div>
      </div>
      <div class="hble-motion-strip" data-motion-strip aria-label="HBLE In Motion media"></div>
    </div>
  </div>
</section>`;

if (!html.includes('/hble-motion.css')) {
  html = html.replace(/<\/head>/i, `${headAssets}</head>`);
}

if (!html.includes(marker)) {
  const tickerStart = html.indexOf('id="hble-image-ticker"');
  if (tickerStart !== -1) {
    const tickerEnd = html.indexOf('</section>', tickerStart);
    if (tickerEnd !== -1) {
      const insertAt = tickerEnd + '</section>'.length;
      html = html.slice(0, insertAt) + '\n\n' + section + html.slice(insertAt);
    }
  }

  if (!html.includes(marker)) {
    const heroStart = html.indexOf('class="hero"');
    const heroEnd = heroStart !== -1 ? html.indexOf('</section>', heroStart) : -1;
    if (heroEnd !== -1) {
      const insertAt = heroEnd + '</section>'.length;
      html = html.slice(0, insertAt) + '\n\n' + section + html.slice(insertAt);
    } else {
      html = html.replace(/<main id="top">/i, `<main id="top">\n${section}`);
    }
  }
}

await writeFile(file, html, 'utf8');
console.log('HBLE In Motion section injected.');
