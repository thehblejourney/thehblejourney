import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
let html = await readFile(file, 'utf8');

const TIP_JAR_MARKER = 'id="hble-tip-jar"';
const TIP_JAR_STYLE_MARKER = 'id="hble-tip-jar-style"';
const TIP_JAR_URL = 'https://buy.stripe.com/9B6eVd9TldAdem9boH8g006';
const TIP_JAR_IMAGE = 'images/hble-support-tip-jar.png';

const TIP_JAR_STYLE = `<style id="hble-tip-jar-style">
#hble-tip-jar{padding:74px 0;border-top:1px solid rgba(255,255,255,.06);background:#070707}
#hble-tip-jar .hble-tip-card{border:1px solid rgba(213,173,97,.34);border-radius:28px;background:#0d0d0d;padding:38px;display:grid;grid-template-columns:minmax(260px,.72fr) minmax(0,1.28fr);gap:38px;align-items:center;box-shadow:0 18px 60px rgba(0,0,0,.28);overflow:hidden}
#hble-tip-jar .hble-tip-visual{display:flex;align-items:center;justify-content:center;min-width:0}
#hble-tip-jar img.hble-tip-jar-img{display:block!important;width:min(100%,360px)!important;height:auto!important;max-width:360px!important;object-fit:contain!important;background:transparent!important;filter:drop-shadow(0 18px 28px rgba(0,0,0,.42)) drop-shadow(0 0 22px rgba(213,173,97,.12))}
#hble-tip-jar .hble-tip-content{min-width:0}
#hble-tip-jar .hble-tip-title{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,4.6rem);line-height:.95;letter-spacing:-.04em;margin:.45rem 0 .8rem;color:#f8f4ec}
#hble-tip-jar .hble-tip-title span{color:#f2d998}
#hble-tip-jar .hble-tip-copy{color:#aaa49a;max-width:720px;margin:0}
#hble-tip-jar .hble-tip-note{display:block;margin-top:13px;color:#817b72;font-size:.77rem}
#hble-tip-jar .hble-tip-action{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin-top:24px;max-width:320px}
#hble-tip-jar .hble-tip-action .btn{width:100%;font-size:1rem}
#hble-tip-jar .hble-tip-action span{text-align:center;width:100%;color:#8f897f;font-size:.75rem}
@media(max-width:860px){#hble-tip-jar .hble-tip-card{grid-template-columns:minmax(210px,.65fr) minmax(0,1.35fr);gap:26px;padding:32px}#hble-tip-jar img.hble-tip-jar-img{max-width:300px!important}}
@media(max-width:680px){#hble-tip-jar{padding:58px 0}#hble-tip-jar .hble-tip-card{grid-template-columns:1fr;padding:26px;gap:20px;text-align:center}#hble-tip-jar .hble-tip-visual{order:1}#hble-tip-jar .hble-tip-content{order:2}#hble-tip-jar img.hble-tip-jar-img{width:min(88%,290px)!important;max-width:290px!important}#hble-tip-jar .hble-tip-action{margin:22px auto 0;max-width:100%}#hble-tip-jar .hble-tip-copy{margin-left:auto;margin-right:auto}}
</style>`;

const TIP_JAR_HTML = `<section id="hble-tip-jar" aria-labelledby="hble-tip-title">
  <div class="wrap hble-tip-card">
    <div class="hble-tip-visual" aria-hidden="true">
      <img class="hble-tip-jar-img" src="${TIP_JAR_IMAGE}" alt="" loading="lazy" decoding="async">
    </div>
    <div class="hble-tip-content">
      <div class="eyebrow">SUPPORT HBLE</div>
      <h2 class="hble-tip-title" id="hble-tip-title">HBLE <span>TIP JAR</span></h2>
      <p class="hble-tip-copy">Believe in what we’re building? Show some love and help HBLE keep creating, building and moving the mission forward.</p>
      <small class="hble-tip-note">Tips are voluntary support payments to HBLE and are not charitable donations.</small>
      <div class="hble-tip-action">
        <a class="btn btn-primary hble-tip-button" href="${TIP_JAR_URL}" target="_blank" rel="noopener noreferrer" onclick="if(window.fbq){fbq('track','InitiateCheckout',{content_name:'HBLE Tip Jar',content_category:'Support'});}">Leave a Tip →</a>
        <span>Choose your own amount • $1 minimum</span>
      </div>
    </div>
  </div>
</section>`;

let changed = false;

if (!html.includes(TIP_JAR_STYLE_MARKER) && /<\/head>/i.test(html)) {
  html = html.replace(/<\/head>/i, `${TIP_JAR_STYLE}\n</head>`);
  changed = true;
}

if (!html.includes(TIP_JAR_MARKER) && /<footer\b/i.test(html)) {
  html = html.replace(/<footer\b/i, `${TIP_JAR_HTML}\n<footer`);
  changed = true;
}

if (changed) {
  await writeFile(file, html, 'utf8');
  console.log('HBLE Tip Jar with support image injected.');
} else {
  console.log('HBLE Tip Jar already present or footer/head marker unavailable.');
}
