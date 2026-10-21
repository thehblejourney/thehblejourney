import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const HUBSPOT_MARKER = 'id="hs-script-loader"';
const HUBSPOT_SNIPPET = `<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>\n<!-- End of HubSpot Embed Code -->`;

// HBLE VISUAL RESET
// All legacy/compressed visual media remains blocked.
// Only explicitly approved master-quality media can opt in with .hble-master-video.
const MEDIA_RESET_MARKER = 'id="hble-media-reset"';
const MEDIA_RESET = `<style id="hble-media-reset">\n/* HBLE visual reset: approved master-quality media only */\nimg, picture, svg, canvas { display:none !important; }\nvideo:not(.hble-master-video) { display:none !important; }\n*, *::before, *::after { background-image:none !important; }\n.hero-media, .hero-reel, .portfolio, .project, .about-art, .motion-break, #hble-artwork-folder { display:none !important; }\n.hero { min-height:auto !important; }\n.hero-grid, .about-grid { grid-template-columns:1fr !important; max-width:900px !important; }\n.hero-grid { padding:100px 0 !important; }\n.btn-primary { background:#d5ad61 !important; color:#111 !important; }\n</style>`;

const SERVICES_PREVIEW_MARKER = 'id="hble-services-preview"';
const SERVICES_MASTER_URL = "https://at.adobe.com/au51qVXwazABKI5z";
const SERVICES_PREVIEW = `
<style id="hble-services-preview">
  .nav-services-trigger{appearance:none;border:0;background:transparent;color:#d3cec4;font:inherit;cursor:pointer;padding:0}
  .nav-services-trigger:hover{color:#f2d998}
  .services-video-modal[hidden]{display:none!important}
  .services-video-modal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.93);backdrop-filter:blur(12px)}
  .services-video-shell{position:relative;width:min(520px,94vw);max-height:92vh;border:1px solid rgba(213,173,97,.48);border-radius:24px;background:#050505;box-shadow:0 34px 110px rgba(0,0,0,.8);overflow:hidden}
  .services-video-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07)}
  .services-video-head strong{letter-spacing:.12em;font-size:.78rem;color:#f2d998}
  .services-video-close{width:40px;height:40px;border-radius:50%;border:1px solid rgba(213,173,97,.4);background:#0b0b0b;color:#fff;font-size:1.35rem;cursor:pointer}
  .services-video-stage{background:#000;display:grid;place-items:center;max-height:72vh;overflow:hidden}
  .hble-master-video{display:block!important;width:100%;height:auto;max-height:72vh;object-fit:contain;background:#000}
  .services-video-actions{display:flex;gap:10px;flex-wrap:wrap;padding:14px 16px 17px}
  .services-video-actions .btn{flex:1;min-width:150px}
  @media(max-width:620px){.services-video-modal{padding:10px}.services-video-shell{border-radius:18px}.services-video-head{padding:10px 12px}.services-video-actions{padding:12px}.nav-services-trigger{font-weight:800;color:#f2d998}}
</style>`;

const SERVICES_MODAL_MARKUP = `
<div class="services-video-modal" id="servicesVideoModal" hidden role="dialog" aria-modal="true" aria-labelledby="servicesVideoTitle">
  <div class="services-video-shell">
    <div class="services-video-head"><strong id="servicesVideoTitle">HBLE SERVICES</strong><button class="services-video-close" id="servicesVideoClose" type="button" aria-label="Close services video">×</button></div>
    <div class="services-video-stage"><video class="hble-master-video" id="servicesMasterVideo" src="${SERVICES_MASTER_URL}" muted loop playsinline preload="metadata" aria-label="HBLE services HD preview"></video></div>
    <div class="services-video-actions"><button class="btn btn-ghost" id="servicesSoundToggle" type="button">Turn Sound On</button><a class="btn btn-primary" id="servicesDetailsLink" href="#services">View Services</a></div>
  </div>
</div>
<script>
(() => {
  const openBtn=document.getElementById('servicesPreviewButton');
  const modal=document.getElementById('servicesVideoModal');
  const closeBtn=document.getElementById('servicesVideoClose');
  const video=document.getElementById('servicesMasterVideo');
  const soundBtn=document.getElementById('servicesSoundToggle');
  const details=document.getElementById('servicesDetailsLink');
  if(!openBtn||!modal||!video)return;
  const play=()=>{video.muted=true;video.currentTime=0;const p=video.play();if(p&&p.catch)p.catch(()=>{});};
  const open=()=>{modal.hidden=false;document.body.style.overflow='hidden';play();closeBtn&&closeBtn.focus();};
  const close=()=>{video.pause();modal.hidden=true;document.body.style.overflow='';openBtn.focus();};
  openBtn.addEventListener('click',open);
  closeBtn&&closeBtn.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
  soundBtn&&soundBtn.addEventListener('click',()=>{video.muted=!video.muted;soundBtn.textContent=video.muted?'Turn Sound On':'Mute Sound';if(video.paused){const p=video.play();if(p&&p.catch)p.catch(()=>{});}});
  details&&details.addEventListener('click',()=>{video.pause();modal.hidden=true;document.body.style.overflow='';});
})();
</script>`;

const entries = await readdir(".", { withFileTypes: true });
const htmlFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name);

let updated = 0;

for (const file of htmlFiles) {
  const fullPath = path.join(".", file);
  let html = await readFile(fullPath, "utf8");
  let changed = false;

  if (!html.includes(MEDIA_RESET_MARKER) && /<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${MEDIA_RESET}\n</head>`);
    changed = true;
  }

  if (file === "index.html") {
    if (!html.includes(SERVICES_PREVIEW_MARKER) && /<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${SERVICES_PREVIEW}\n</head>`);
      changed = true;
    }

    const oldServicesLink = '<a href="#services">Services</a>';
    const newServicesButton = '<button class="nav-services-trigger" id="servicesPreviewButton" type="button" aria-haspopup="dialog" aria-controls="servicesVideoModal">Services</button>';
    if (html.includes(oldServicesLink)) {
      html = html.replace(oldServicesLink, newServicesButton);
      changed = true;
    }

    if (!html.includes('id="servicesVideoModal"') && /<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${SERVICES_MODAL_MARKUP}\n</body>`);
      changed = true;
    }
  }

  if (!html.includes(HUBSPOT_MARKER) && /<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${HUBSPOT_SNIPPET}\n</body>`);
    changed = true;
  }

  if (changed) {
    await writeFile(fullPath, html, "utf8");
    updated += 1;
  }
}

console.log(`HBLE build injection complete. Updated ${updated} HTML file(s).`);
