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
  width:min(56vw,780px)!important;
  z-index:0!important;
  pointer-events:none!important;
  opacity:.82!important;
  transform:scaleX(-1)!important;
  transform-origin:center!important;
  background-image:linear-gradient(270deg,#060606 0%,rgba(6,6,6,.96) 18%,rgba(6,6,6,.58) 48%,rgba(6,6,6,.08) 82%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.78) 10%,rgba(6,6,6,.18) 38%,rgba(6,6,6,0) 64%),url('/images/hble-hero-portrait.webp')!important;
  background-repeat:no-repeat!important;
  background-size:100% 100%,100% 100%,cover!important;
  background-position:center,center,44% 18%!important;
}
html body .hero .hero-grid{position:relative!important;z-index:1!important}
@media(max-width:950px){html body .hero::after{width:60vw!important;opacity:.58!important;background-position:center,center,42% 16%!important}}
@media(max-width:720px){html body .hero::after{width:100%!important;opacity:.24!important;background-image:linear-gradient(270deg,rgba(6,6,6,.88) 0%,rgba(6,6,6,.62) 52%,rgba(6,6,6,.18) 100%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.78) 12%,rgba(6,6,6,.12) 58%),url('/images/hble-hero-portrait.webp')!important;background-position:center,center,30% 14%!important}}
@media(prefers-reduced-data:reduce){html body .hero::after{display:none!important}}
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

// Replace any prior portrait link/style with one inline, build-stable portrait block.
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
  console.log('HBLE modular homepage entry points and exact mirrored portrait styling injected.');
} else {
  console.log('HBLE modular homepage enhancements already present.');
}
