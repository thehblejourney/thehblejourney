import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
const designNavMarker = 'data-hble-design-studio-nav';
const designHeroMarker = 'data-hble-design-studio-hero';
const restorationNavMarker = 'data-hble-restoration-nav';
const restorationHeroMarker = 'data-hble-restoration-hero';
const portraitStyleMarker = 'data-hble-hero-portrait-style';

const designNavLink = '<a data-hble-design-studio-nav href="/design-studio/">Design Studio</a>';
const designHeroLink = '<a data-hble-design-studio-hero class="btn btn-ghost" href="/design-studio/">Open Design Studio</a>';
const restorationNavLink = '<a data-hble-restoration-nav href="/image-restoration/">Image Restoration</a>';
const restorationHeroLink = '<a data-hble-restoration-hero class="btn btn-ghost" href="/image-restoration/">Restore a Photo</a>';
const portraitStyleLink = '<link data-hble-hero-portrait-style rel="stylesheet" href="/home-hero-portrait.css">';

let html = await readFile(file, 'utf8');
let changed = false;

const navAnchor = '<div class="nav-links">';
if (!html.includes(navAnchor)) throw new Error('HBLE modular nav injector could not find the main nav-links container.');

if (!html.includes(designNavMarker)) {
  html = html.replace(navAnchor, `${navAnchor}${designNavLink}`);
  changed = true;
}
if (!html.includes(restorationNavMarker)) {
  html = html.replace(navAnchor, `${navAnchor}${restorationNavLink}`);
  changed = true;
}

const heroAnchor = '<div class="hero-actions">';
if (!html.includes(heroAnchor)) throw new Error('HBLE modular nav injector could not find the homepage hero-actions container.');

if (!html.includes(designHeroMarker)) {
  html = html.replace(heroAnchor, `${heroAnchor}${designHeroLink}`);
  changed = true;
}
if (!html.includes(restorationHeroMarker)) {
  html = html.replace(heroAnchor, `${heroAnchor}${restorationHeroLink}`);
  changed = true;
}

// The portrait is presentation-only and remains isolated in its own stylesheet.
// If the head marker is ever unavailable, skip the portrait instead of failing the site build.
if (!html.includes(portraitStyleMarker)) {
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${portraitStyleLink}\n</head>`);
    changed = true;
  } else {
    console.warn('HBLE hero portrait stylesheet was skipped because </head> was not found.');
  }
}

if (changed) {
  await writeFile(file, html, 'utf8');
  console.log('HBLE modular homepage entry points and portrait styling injected.');
} else {
  console.log('HBLE modular homepage enhancements already present.');
}
