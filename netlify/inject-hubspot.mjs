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
  .services-video-modal{position:fixed;inset:0;z-index:1000;display:block;width:100vw;height:100vh;height:100dvh;background:#000;overflow:hidden}
  .services-video-shell{position:relative;width:100vw;height:100vh;height:100dvh;border:0;border-radius:0;background:#000;box-shadow:none;overflow:hidden}
  .services-video-head{position:absolute;z-index:5;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:calc(14px + env(safe-area-inset-top)) calc(18px + env(safe-area-inset-right)) 18px calc(18px + env(safe-area-inset-left));background:linear-gradient(180deg,rgba(0,0,0,.86),rgba(0,0,0,0));pointer-events:none}
  .services-video-head strong{letter-spacing:.12em;font-size:.78rem;color:#f2d998;text-shadow:0 2px 12px #000}
  .services-video-close{pointer-events:auto;width:44px;height:44px;border-radius:50%;border:1px solid rgba(213,173,97,.5);background:rgba(5,5,5,.72);backdrop-filter:blur(8px);color:#fff;font-size:1.45rem;cursor:pointer}
  .services-video-stage{position:absolute;inset:0;width:100%;height:100%;background:#000;display:grid;place-items:center;overflow:hidden}
  .hble-master-video{display:block!important;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;object-fit:contain;background:#000}
  .services-video-actions{position:absolute;z-index:5;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding:34px calc(16px + env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));background:linear-gradient(0deg,rgba(0,0,0,.9),rgba(0,0,0,0))}
  .services-video-actions .btn{min-width:150px;background:rgba(5,5,5,.72);backdrop-filter:blur(8px)}
  .services-video-actions .btn-primary{background:#d5ad61!important;color:#111!important}
  @media(max-width:620px){.services-video-head{padding-top:calc(10px + env(safe-area-inset-top))}.services-video-actions{gap:8px}.services-video-actions .btn{flex:1;min-width:0;padding:12px 14px}.nav-services-trigger{font-weight:800;color:#f2d998}}
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
  const enterFullscreen=()=>{if(modal.requestFullscreen){const f=modal.requestFullscreen();if(f&&f.catch)f.catch(()=>{});}else if(video.webkitEnterFullscreen){try{video.webkitEnterFullscreen();}catch(e){}}};
  const exitFullscreen=()=>{if(document.fullscreenElement===modal&&document.exitFullscreen){const f=document.exitFullscreen();if(f&&f.catch)f.catch(()=>{});}};
  const play=()=>{video.muted=true;video.currentTime=0;const p=video.play();if(p&&p.catch)p.catch(()=>{});};
  const open=()=>{modal.hidden=false;document.body.style.overflow='hidden';play();enterFullscreen();closeBtn&&closeBtn.focus();};
  const close=()=>{video.pause();exitFullscreen();modal.hidden=true;document.body.style.overflow='';openBtn.focus();};
  openBtn.addEventListener('click',open);
  closeBtn&&closeBtn.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&!modal.hidden&&video.paused){const p=video.play();if(p&&p.catch)p.catch(()=>{});}});
  soundBtn&&soundBtn.addEventListener('click',()=>{video.muted=!video.muted;soundBtn.textContent=video.muted?'Turn Sound On':'Mute Sound';if(video.paused){const p=video.play();if(p&&p.catch)p.catch(()=>{});}});
  details&&details.addEventListener('click',()=>{video.pause();exitFullscreen();modal.hidden=true;document.body.style.overflow='';});
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
