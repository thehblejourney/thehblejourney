import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
const navMarker = 'data-hble-design-studio-nav';
const heroMarker = 'data-hble-design-studio-hero';
const navLink = '<a data-hble-design-studio-nav href="/design-studio/">Design Studio</a>';
const heroLink = '<a data-hble-design-studio-hero class="btn btn-ghost" href="/design-studio/">Open Design Studio</a>';

let html = await readFile(file, 'utf8');
let changed = false;

if (!html.includes(navMarker)) {
  const navAnchor = '<div class="nav-links">';
  if (!html.includes(navAnchor)) throw new Error('HBLE Design Studio nav injector could not find the main nav-links container.');
  html = html.replace(navAnchor, `${navAnchor}${navLink}`);
  changed = true;
}

if (!html.includes(heroMarker)) {
  const heroAnchor = '<div class="hero-actions">';
  if (!html.includes(heroAnchor)) throw new Error('HBLE Design Studio nav injector could not find the homepage hero-actions container.');
  html = html.replace(heroAnchor, `${heroAnchor}${heroLink}`);
  changed = true;
}

if (changed) {
  await writeFile(file, html, 'utf8');
  console.log('HBLE Design Studio homepage entry points injected.');
} else {
  console.log('HBLE Design Studio homepage entry points already present.');
}
