import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
let html = await readFile(file, 'utf8');

// Final build safeguard: the top navigation Services link must always open Design Studio.
html = html.replace(
  /<a\b([^>]*)href=["'][^"']*["']([^>]*)>\s*Services\s*<\/a>/i,
  '<a href="/design-studio/">Services</a>'
);

await writeFile(file, html, 'utf8');
console.log('Final Services navigation target forced to /design-studio/.');
