import { access, readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
const asset = 'images/hble-hero-portrait-bleezy-grayscale-v3.webp';
const marker = 'id="hble-hero-portrait-final"';

await access(asset);
let html = await readFile(file, 'utf8');

const style = `<style id="hble-hero-portrait-final">
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
  opacity:.86!important;
  transform:scaleX(-1)!important;
  transform-origin:center!important;
  background-image:linear-gradient(270deg,#060606 0%,rgba(6,6,6,.96) 14%,rgba(6,6,6,.54) 44%,rgba(6,6,6,.06) 80%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.76) 10%,rgba(6,6,6,.12) 38%,rgba(6,6,6,0) 64%),url('/images/hble-hero-portrait-bleezy-grayscale-v3.webp')!important;
  background-repeat:no-repeat!important;
  background-size:100% 100%,100% 100%,cover!important;
  background-position:center,center,44% 15%!important;
}
html body .hero .hero-grid{position:relative!important;z-index:1!important}
@media(max-width:950px){html body .hero::after{width:64vw!important;opacity:.66!important;background-position:center,center,42% 14%!important}}
@media(max-width:720px){html body .hero::after{width:100%!important;opacity:.38!important;background-image:linear-gradient(270deg,rgba(6,6,6,.84) 0%,rgba(6,6,6,.54) 48%,rgba(6,6,6,.10) 100%),linear-gradient(0deg,#060606 0%,rgba(6,6,6,.70) 10%,rgba(6,6,6,.08) 56%),url('/images/hble-hero-portrait-bleezy-grayscale-v3.webp')!important;background-position:center,center,30% 11%!important}}
</style>`;

// Remove every earlier portrait treatment so this final build step is authoritative.
html = html.replace(/<style\b[^>]*(?:data-hble-hero-portrait-style|id=["'](?:hble-hero-portrait-final|hble-hero-portrait-source)["'])[^>]*>[\s\S]*?<\/style>/gi, '');
html = html.replace(/<link\b[^>]*data-hble-hero-portrait-style[^>]*>/gi, '');

if (!/<\/head>/i.test(html)) throw new Error('Final HBLE hero portrait injector could not find </head>.');
html = html.replace(/<\/head>/i, `${style}\n</head>`);

await writeFile(file, html, 'utf8');
console.log(`Final HBLE grayscale hero portrait injected from ${asset}`);
