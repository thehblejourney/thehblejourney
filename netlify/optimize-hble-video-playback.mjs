import { readFile, writeFile } from 'node:fs/promises';

// HBLE Services playback hardening.
// The approved master stays byte-for-byte untouched on disk.
// The browser waits until the file has downloaded locally before playback,
// eliminating mid-play stalls on mobile connections.

const indexPath = 'index.html';
const motionJsPath = 'hble-motion.js';

let html = await readFile(indexPath, 'utf8');

// Keep the heavy master completely idle until Services is tapped.
html = html.replace(
  /<video\b([^>]*\bclass="hble-services-master-video"[^>]*)><\/video>/i,
  (match, attrs) => {
    let next = attrs;
    next = next.replace(/\s+src="media\/hble-services-master\.mp4"/i, ' data-src="media/hble-services-master.mp4"');
    if (!/\bdata-src="media\/hble-services-master\.mp4"/i.test(next)) next += ' data-src="media/hble-services-master.mp4"';
    if (/\bpreload="[^"]*"/i.test(next)) next = next.replace(/\bpreload="[^"]*"/i, 'preload="none"');
    else next += ' preload="none"';
    return `<video${next}></video>`;
  }
);

const controllerScript = `<script id="hble-services-video-controller">
(function(){
  const modal = document.getElementById('services-video-modal');
  if (!modal) return;
  const video = modal.querySelector('.hble-services-master-video');
  const trigger = document.querySelector('.services-video-trigger');
  const close = modal.querySelector('.services-video-close');
  if (!video || !trigger) return;

  let session = 0;

  const status = document.createElement('div');
  status.className = 'hble-services-buffer-status';
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  status.textContent = 'Preparing video…';
  status.style.cssText = 'position:fixed;left:50%;bottom:max(28px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10003;background:rgba(0,0,0,.86);color:#f2d998;border:1px solid rgba(213,173,97,.5);border-radius:999px;padding:11px 17px;font:700 13px/1.2 Inter,Arial,sans-serif;letter-spacing:.02em;display:none;pointer-events:none;white-space:nowrap;';
  modal.appendChild(status);

  function showStatus(text){
    status.textContent = text;
    status.style.display = 'block';
  }

  function hideStatus(){
    status.style.display = 'none';
  }

  const loader = window.HBLEVideoLoader || (window.HBLEVideoLoader = (function(){
    let objectUrl = null;
    let inFlight = null;

    async function get(url, onProgress){
      if (objectUrl) {
        if (onProgress) onProgress(100);
        return objectUrl;
      }
      if (inFlight) return inFlight;

      inFlight = (async function(){
        const response = await fetch(url, { cache:'force-cache' });
        if (!response.ok) throw new Error('Video download failed: ' + response.status);

        const total = Number(response.headers.get('content-length')) || 0;

        if (!response.body || !response.body.getReader) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          if (onProgress) onProgress(100);
          return objectUrl;
        }

        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
          const part = await reader.read();
          if (part.done) break;
          if (part.value) {
            chunks.push(part.value);
            received += part.value.byteLength;
            if (total && onProgress) onProgress(Math.min(99, Math.round((received / total) * 100)));
          }
        }

        const blob = new Blob(chunks, { type:'video/mp4' });
        objectUrl = URL.createObjectURL(blob);
        if (onProgress) onProgress(100);
        return objectUrl;
      })().catch(function(error){
        inFlight = null;
        throw error;
      });

      return inFlight;
    }

    window.addEventListener('pagehide', function(){
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });

    return { get:get };
  })());

  async function openServices(){
    session += 1;
    const mySession = session;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('services-video-open');
    showStatus('Preparing video… 0%');

    // Request fullscreen while we still have the original user gesture.
    if (modal.requestFullscreen) {
      const fsPromise = modal.requestFullscreen();
      if (fsPromise && typeof fsPromise.catch === 'function') fsPromise.catch(function(){});
    }

    const source = video.dataset.src || 'media/hble-services-master.mp4';

    try {
      const localUrl = await loader.get(source, function(percent){
        if (mySession === session) showStatus('Preparing video… ' + percent + '%');
      });

      if (mySession !== session || !modal.classList.contains('is-open')) return;

      video.pause();
      video.src = localUrl;
      video.preload = 'auto';
      video.load();

      const start = function(){
        if (mySession !== session || !modal.classList.contains('is-open')) return;
        video.removeEventListener('canplay', start);
        hideStatus();
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function(){ showStatus('Tap play to continue'); });
        }
      };

      if (video.readyState >= 3) start();
      else video.addEventListener('canplay', start);
    } catch (error) {
      if (mySession !== session) return;
      // Network fallback: still allow manual playback if the full-file download fails.
      showStatus('Connection issue — tap play to retry');
      video.src = source;
      video.preload = 'auto';
      video.load();
    }
  }

  function closeServices(){
    session += 1;
    hideStatus();
    video.pause();
    video.removeAttribute('src');
    video.preload = 'none';
    video.load();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('services-video-open');

    if (document.fullscreenElement && document.exitFullscreen) {
      const exitPromise = document.exitFullscreen();
      if (exitPromise && typeof exitPromise.catch === 'function') exitPromise.catch(function(){});
    }

    trigger.focus();
  }

  trigger.addEventListener('click', openServices);
  if (close) close.addEventListener('click', closeServices);
  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeServices();
  });
})();
</script>`;

if (/<script\s+id="hble-services-video-controller">[\s\S]*?<\/script>/i.test(html)) {
  html = html.replace(/<script\s+id="hble-services-video-controller">[\s\S]*?<\/script>/i, controllerScript);
} else if (/<\/body>/i.test(html)) {
  html = html.replace(/<\/body>/i, `${controllerScript}\n</body>`);
}

// Remove obsolete lazy-load guards from earlier builds.
html = html.replace(/<script\s+id="hble-services-lazyload-guard">[\s\S]*?<\/script>\s*/gi, '');

await writeFile(indexPath, html, 'utf8');

// HBLE In Motion must never preload the heavy master in the background.
let motionJs = await readFile(motionJsPath, 'utf8');
motionJs = motionJs.replace(/video\.preload\s*=\s*['"]metadata['"];?/g, "video.preload = 'none';");
await writeFile(motionJsPath, motionJs, 'utf8');

console.log('HBLE Services playback hardened: full file downloads locally before playback; HBLE In Motion preload disabled.');
