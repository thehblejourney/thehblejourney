import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
let html = await readFile(file, 'utf8');

const style = `<style id="hble-hero-portrait-final">
html body .hero{position:relative!important;isolation:isolate!important;overflow:hidden!important;background:#060606!important}
html body .hero::after{
  content:""!important;
  display:block!important;
  position:absolute!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  width:min(62vw,860px)!important;
  z-index:0!important;
  pointer-events:none!important;
  opacity:.94!important;
  filter:grayscale(1) contrast(1.05)!important;
  background-image:
    linear-gradient(to right,#060606 0%,rgba(6,6,6,.82) 12%,rgba(6,6,6,.38) 38%,rgba(6,6,6,0) 68%),
    linear-gradient(to top,#060606 0%,rgba(6,6,6,.56) 8%,rgba(6,6,6,.12) 30%,rgba(6,6,6,0) 54%),
    url('/images/hble-hero-portrait-bleezy-v2.webp')!important;
  background-repeat:no-repeat!important;
  background-size:100% 100%,100% 100%,cover!important;
  background-position:center,center,50% 14%!important;
}
html body .hero .hero-grid{position:relative!important;z-index:1!important}
@media(max-width:950px){
  html body .hero::after{
    width:70vw!important;
    opacity:.82!important;
    background-position:center,center,50% 12%!important;
  }
}
@media(max-width:720px){
  html body .hero::after{
    width:100%!important;
    opacity:.72!important;
    background-image:
      linear-gradient(to right,#060606 0%,rgba(6,6,6,.74) 10%,rgba(6,6,6,.34) 42%,rgba(6,6,6,0) 76%),
      linear-gradient(to top,#060606 0%,rgba(6,6,6,.58) 8%,rgba(6,6,6,.14) 32%,rgba(6,6,6,0) 58%),
      url('/images/hble-hero-portrait-bleezy-v2.webp')!important;
    background-position:center,center,52% 10%!important;
  }
}
</style>`;

html = html.replace(/<style\b[^>]*(?:data-hble-hero-portrait-style|id=["'](?:hble-hero-portrait-final|hble-hero-portrait-source)["'])[^>]*>[\s\S]*?<\/style>/gi, '');
html = html.replace(/<link\b[^>]*data-hble-hero-portrait-style[^>]*>/gi, '');

if (!/<\/head>/i.test(html)) throw new Error('Final HBLE hero portrait injector could not find </head>.');
html = html.replace(/<\/head>/i, `${style}\n</head>`);

await writeFile(file, html, 'utf8');
console.log('Final HBLE grayscale hero portrait injected.');
