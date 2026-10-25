import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";


const HUBSPOT_PORTAL_ID = "247748751";
const HUBSPOT_REGION = "na2";
const HUBSPOT_MARKER = 'id="hs-script-loader"';
const HUBSPOT_SNIPPET = `<!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js"></script>
<!-- End of HubSpot Embed Code -->`;

// HBLE APPROVED MEDIA MODE
// Approved media files are committed directly in the repository.
// Netlify must not depend on temporary third-party asset URLs during build.

const TEXT_ONLY_MARKER = 'id="hble-text-only"';
const TEXT_ONLY_STYLE = `<style id="hble-text-only">
/* Only intentionally approved media may display */
img:not(.hble-logo):not(.hble-ticker-img), picture, svg, canvas, video:not(.hble-services-master-video) { display:none !important; }
*, *::before, *::after { background-image:none !important; }

/* Approved logo */
.hble-logo { display:block !important; width:54px !important; height:54px !important; object-fit:contain !important; flex:0 0 54px !important; }
.brand { display:flex !important; align-items:center !important; gap:12px !important; }

/* Remove old media-only shells */
.brand-mark, .hero-media, .hero-reel, .about-art, #hble-artwork-folder { display:none !important; }

/* Keep the page clean and readable */
.hero { min-height:auto !important; }
.hero-grid, .about-grid { grid-template-columns:1fr !important; max-width:900px !important; }
.hero-grid { padding:100px 0 !important; }

/* HBLE image ticker */
.hble-image-ticker {
  position:relative;
  overflow:hidden;
  padding:18px 0 20px;
  background:#050505;
  border-top:1px solid rgba(213,173,97,.25);
  border-bottom:1px solid rgba(213,173,97,.25);
}
.hble-image-ticker::before,
.hble-image-ticker::after {
  content:"";
  position:absolute;
  top:0;
  bottom:0;
  width:min(11vw,120px);
  z-index:2;
  pointer-events:none;
}
.hble-image-ticker::before { left:0; background:linear-gradient(90deg,#050505,rgba(5,5,5,0)); }
.hble-image-ticker::after { right:0; background:linear-gradient(270deg,#050505,rgba(5,5,5,0)); }
.hble-image-ticker-track {
  display:flex;
  width:max-content;
  animation:hbleTickerScroll 38s linear infinite;
  will-change:transform;
}
.hble-image-ticker:hover .hble-image-ticker-track { animation-play-state:paused; }
.hble-image-ticker-set {
  display:flex;
  align-items:center;
  gap:18px;
  padding-right:18px;
}
.hble-ticker-card {
  height:clamp(230px,31vw,390px);
  width:auto;
  flex:0 0 auto;
  border:1px solid rgba(213,173,97,.42);
  border-radius:18px;
  overflow:hidden;
  background:#080808;
  box-shadow:0 10px 35px rgba(0,0,0,.32);
}
.hble-ticker-img {
  display:block !important;
  height:100% !important;
  width:auto !important;
  max-width:none !important;
  object-fit:contain !important;
}
@keyframes hbleTickerScroll {
  from { transform:translateX(0); }
  to { transform:translateX(-50%); }
}

/* Preserve portfolio copy as text cards */
.portfolio { grid-template-columns:repeat(3,minmax(0,1fr)) !important; }
.project, .project.small { min-height:0 !important; padding:28px !important; background:#101010 !important; box-shadow:none !important; }
.project::after { display:none !important; }
.project-copy { position:static !important; }
.project-stack { display:contents !important; }

/* Keep statement section text-only */
.motion-break { min-height:auto !important; padding:94px 0 !important; background:#070707 !important; }
.motion-break::before, .motion-break::after { display:none !important; }
.motion-copy { position:relative !important; }

.btn-primary { background:#d5ad61 !important; color:#111 !important; }

/* Full-screen Services web playback */
.services-video-trigger {
  appearance:none;
  border:1px solid rgba(213,173,97,.55);
  background:#0b0b0b;
  color:#f2d998;
  border-radius:999px;
  padding:9px 15px;
  font:inherit;
  font-weight:800;
  cursor:pointer;
  letter-spacing:.02em;
}
.services-video-trigger:hover { border-color:#d5ad61; }
.services-video-modal {
  position:fixed;
  inset:0;
  z-index:10000;
  display:none;
  align-items:center;
  justify-content:center;
  width:100vw;
  height:100dvh;
  background:#000;
}
.services-video-modal.is-open { display:flex !important; }
.services-video-modal .hble-services-master-video {
  display:block !important;
  width:100vw !important;
  height:100dvh !important;
  max-width:none !important;
  max-height:none !important;
  object-fit:contain !important;
  background:#000 !important;
}
.services-video-close {
  position:fixed;
  top:max(16px, env(safe-area-inset-top));
  right:max(16px, env(safe-area-inset-right));
  z-index:10002;
  min-width:48px;
  min-height:48px;
  border:1px solid rgba(255,255,255,.35);
  border-radius:999px;
  background:rgba(0,0,0,.72);
  color:#fff;
  font:700 14px/1 Inter,Arial,sans-serif;
  cursor:pointer;
  padding:0 16px;
}
body.services-video-open { overflow:hidden !important; }

@media(max-width:950px){
  .portfolio { grid-template-columns:1fr !important; }
  .hble-ticker-card { height:clamp(220px,46vw,330px); }
}
@media(max-width:620px){
  .hble-logo { width:46px !important; height:46px !important; flex-basis:46px !important; }
  .services-video-trigger { padding:8px 12px; }
  .hble-image-ticker { padding:12px 0 14px; }
  .hble-image-ticker-set { gap:12px; padding-right:12px; }
  .hble-ticker-card { height:245px; border-radius:14px; }
  .hble-image-ticker-track { animation-duration:30s; }
}
@media(prefers-reduced-motion:reduce){
  .hble-image-ticker { overflow-x:auto; }
  .hble-image-ticker-track { animation:none; }
  .hble-image-ticker-set[aria-hidden="true"] { display:none; }
}
</style>`;

const LOGO_MARKER = 'class="hble-logo"';
const HOME_BRAND = '<a class="brand" href="#top">HBLE STUDIOS<small>HBLE ENTERPRISES INC.</small></a>';
const HOME_BRAND_WITH_LOGO = '<a class="brand" href="#top"><img class="hble-logo" src="images/Crown.jpg" alt="HBLE logo"><span>HBLE STUDIOS<small>HBLE ENTERPRISES INC.</small></span></a>';
const SERVICES_LINK = '<a href="#services">Services</a>';
const SERVICES_BUTTON = '<button type="button" class="services-video-trigger" aria-haspopup="dialog" aria-controls="services-video-modal">Services</button>';

const IMAGE_TICKER_MARKER = 'id="hble-image-ticker"';
const IMAGE_TICKER_HTML = `<section id="hble-image-ticker" class="hble-image-ticker" aria-label="HBLE brand showcase">
  <div class="hble-image-ticker-track">
    <div class="hble-image-ticker-set">
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-squat.png" alt="HBLE Enterprises brand portrait"></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-standing.png" alt="HBLE Enterprises standing brand portrait"></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-crouch.png" alt="HBLE Enterprises crouching brand portrait"></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-services.jpg" alt="HBLE Enterprises services showcase"></div>
    </div>
    <div class="hble-image-ticker-set" aria-hidden="true">
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-squat.png" alt=""></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-standing.png" alt=""></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-crouch.png" alt=""></div>
      <div class="hble-ticker-card"><img class="hble-ticker-img" src="images/ticker/hble-services.jpg" alt=""></div>
    </div>
  </div>
</section>`;

const SERVICES_MODAL_MARKER = 'id="services-video-modal"';
const SERVICES_MODAL = `<div id="services-video-modal" class="services-video-modal" role="dialog" aria-modal="true" aria-label="HBLE Services video" aria-hidden="true">
  <button type="button" class="services-video-close" aria-label="Close Services video">Close</button>
  <video class="hble-services-master-video" src="media/hble-services-web.mp4" controls playsinline preload="metadata" loop></video>
</div>
<script id="hble-services-video-controller">
(function(){
  const modal = document.getElementById('services-video-modal');
  if (!modal) return;
  const video = modal.querySelector('.hble-services-master-video');
  const trigger = document.querySelector('.services-video-trigger');
  const close = modal.querySelector('.services-video-close');

  function openServices(){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('services-video-open');
    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function(){});
    }
    if (modal.requestFullscreen) {
      const fsPromise = modal.requestFullscreen();
      if (fsPromise && typeof fsPromise.catch === 'function') fsPromise.catch(function(){});
    }
  }

  function closeServices(){
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('services-video-open');
    if (document.fullscreenElement && document.exitFullscreen) {
      const exitPromise = document.exitFullscreen();
      if (exitPromise && typeof exitPromise.catch === 'function') exitPromise.catch(function(){});
    }
    if (trigger) trigger.focus();
  }

  if (trigger) trigger.addEventListener('click', openServices);
  if (close) close.addEventListener('click', closeServices);
  document.addEventListener('keydown', function(event){ if (event.key === 'Escape' && modal.classList.contains('is-open')) closeServices(); });
  document.addEventListener('fullscreenchange', function(){
    if (!document.fullscreenElement && modal.classList.contains('is-open') && video && video.paused) closeServices();
  });
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

  if (file === "index.html" && !html.includes(LOGO_MARKER) && html.includes(HOME_BRAND)) {
    html = html.replace(HOME_BRAND, HOME_BRAND_WITH_LOGO);
    changed = true;
  }

  if (file === "index.html" && html.includes(SERVICES_LINK)) {
    html = html.replace(SERVICES_LINK, SERVICES_BUTTON);
    changed = true;
  }

  if (file === "index.html" && !html.includes(IMAGE_TICKER_MARKER) && html.includes('<div class="ticker">')) {
    html = html.replace('<div class="ticker">', `${IMAGE_TICKER_HTML}\n\n    <div class="ticker">`);
    changed = true;
  }

  if (!html.includes(TEXT_ONLY_MARKER) && /<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${TEXT_ONLY_STYLE}\n</head>`);
    changed = true;
  }

  if (file === "index.html" && !html.includes(SERVICES_MODAL_MARKER) && /<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${SERVICES_MODAL}\n</body>`);
    changed = true;
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

console.log(`HBLE approved-media build complete. Updated ${updated} HTML file(s).`);
