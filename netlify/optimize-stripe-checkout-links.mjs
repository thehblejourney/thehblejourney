import { readdir, readFile, writeFile } from 'node:fs/promises';

const entries = await readdir('.', { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
  .map((entry) => entry.name);

let updated = 0;
let linksUpdated = 0;

for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  let changed = false;

  html = html.replace(/<a\b([^>]*\bhref=["']https:\/\/buy\.stripe\.com\/[^"']+["'][^>]*)>/gi, (match, attrs) => {
    let next = attrs;
    if (!/\btarget\s*=/.test(next)) next += ' target="_blank"';
    if (!/\brel\s*=/.test(next)) next += ' rel="noopener noreferrer external"';
    else if (!/\bnoopener\b/i.test(next)) {
      next = next.replace(/\brel=(["'])(.*?)\1/i, (_m, q, value) => `rel=${q}${value} noopener noreferrer external${q}`);
    }
    if (!/\baria-describedby\s*=/.test(next)) next += ' aria-describedby="hble-stripe-window-note"';
    changed = true;
    linksUpdated += 1;
    return `<a${next}>`;
  });

  if (changed && !html.includes('id="hble-stripe-window-note"')) {
    html = html.replace(/<\/body>/i, '<p id="hble-stripe-window-note" hidden>Secure Stripe Checkout opens in a separate browser tab.</p>\n</body>');
  }

  if (changed) {
    await writeFile(file, html, 'utf8');
    updated += 1;
  }
}

console.log(`HBLE Stripe checkout optimization complete. Updated ${linksUpdated} link(s) across ${updated} HTML file(s).`);
