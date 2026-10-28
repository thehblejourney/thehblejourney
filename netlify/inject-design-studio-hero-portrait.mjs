import { readFile, writeFile } from 'node:fs/promises';

const file = 'design-studio/studio.css';
let css = await readFile(file, 'utf8');

const start = '/* HBLE DESIGN STUDIO HERO PORTRAIT START */';
const end = '/* HBLE DESIGN STUDIO HERO PORTRAIT END */';
const block = `${start}
.hero::before{
  content:"";
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  width:min(48vw,720px);
  z-index:0;
  pointer-events:none;
  background:url('/images/hble-hero-portrait-bleezy-v2.webp') center 16%/cover no-repeat;
  filter:grayscale(1) contrast(1.05);
  opacity:.78;
}
.hero::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background:
    linear-gradient(to right,#060606 0%,#060606 38%,rgba(6,6,6,.90) 48%,rgba(6,6,6,.50) 68%,rgba(6,6,6,.08) 100%),
    linear-gradient(to top,#060606 0%,rgba(6,6,6,.70) 12%,rgba(6,6,6,.20) 34%,rgba(6,6,6,0) 60%);
}
.hero-inner{position:relative;z-index:1;}
@media(max-width:950px){
  .hero::before{width:58vw;opacity:.64;background-position:center 13%;}
}
@media(max-width:650px){
  .hero::before{width:72vw;opacity:.48;background-position:center 10%;}
  .hero::after{background:
    linear-gradient(to right,#060606 0%,rgba(6,6,6,.96) 26%,rgba(6,6,6,.68) 54%,rgba(6,6,6,.18) 100%),
    linear-gradient(to top,#060606 0%,rgba(6,6,6,.68) 14%,rgba(6,6,6,.14) 42%,rgba(6,6,6,0) 64%);
  }
}
${end}`;

const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
css = css.replace(pattern, '').trimEnd() + '\n\n' + block + '\n';
await writeFile(file, css, 'utf8');
console.log('Injected grayscale Design Studio hero portrait.');
