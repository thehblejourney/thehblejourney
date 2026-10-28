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

const portraitStyleBlock = `<style ${portraitStyleMarker}>
html body .hero{position:relative!important;isolation:isolate!important;overflow:hidden!important}
html body .hero::after{
  content:""!important;
  display:block!important;
  position:absolute!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  width:min(58vw,800px)!important;
  z-index:0!important;
  pointer-events:none!important;
  opacity:.92!important;
  transform:scaleX(-1)!important;
  transform-origin:center!important;
  background-image:linear-gradient(270deg,#060606 0%,rgba(6,6,6,.95) 14%,rgba(6,6,6,.52) 43%,rgba(6,6,6,.06) 78%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.72) 9%,rgba(6,6,6,.12) 36%,rgba(6,6,6,0) 62%),url('/images/hble-hero-portrait-bleezy-v2.webp')!important;
  background-repeat:no-repeat!important;
  background-size:100% 100%,100% 100%,cover!important;
  background-position:center,center,44% 16%!important;
}
html body .hero .hero-grid{position:relative!important;z-index:1!important}
@media(max-width:950px){html body .hero::after{width:64vw!important;opacity:.72!important;background-position:center,center,42% 15%!important}}
@media(max-width:720px){html body .hero::after{width:100%!important;opacity:.44!important;background-image:linear-gradient(270deg,rgba(6,6,6,.82) 0%,rgba(6,6,6,.52) 48%,rgba(6,6,6,.10) 100%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.70) 10%,rgba(6,6,6,.08) 56%),url('/images/hble-hero-portrait-bleezy-v2.webp')!important;background-position:center,center,30% 12%!important}}
</style>`;

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

const portraitElement = /<(?:link|style)\b[^>]*data-hble-hero-portrait-style[^>]*>(?:[\s\S]*?<\/style>)?/i;
if (portraitElement.test(html)) {
  html = html.replace(portraitElement, portraitStyleBlock);
  changed = true;
} else if (/<\/head>/i.test(html)) {
  html = html.replace(/<\/head>/i, `${portraitStyleBlock}\n</head>`);
  changed = true;
} else {
  console.warn('HBLE hero portrait styling was skipped because </head> was not found.');
}

if (changed) {
  await writeFile(file, html, 'utf8');
  console.log('HBLE modular homepage entry points and cache-busted mirrored portrait styling injected.');
} else {
  console.log('HBLE modular homepage enhancements already present.');
}
