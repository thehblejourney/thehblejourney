import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
const marker = 'href="/design-studio/"';
const link = '<a href="/design-studio/">Design Studio</a>';

let html = await readFile(file, 'utf8');

if (html.includes(marker)) {
  console.log('HBLE Design Studio navigation link already present.');
  process.exit(0);
}

const navAnchor = '<div class="nav-links">';
if (!html.includes(navAnchor)) {
  throw new Error('HBLE Design Studio nav injector could not find the main nav-links container.');
}

html = html.replace(navAnchor, `${navAnchor}${link}`);
await writeFile(file, html, 'utf8');
console.log('HBLE Design Studio navigation link injected.');
