import { readFile, writeFile } from 'node:fs/promises';

// HBLE web-playback optimization.
// Keeps the approved Services master untouched and changes only browser loading behavior.
// This is intentionally idempotent and does not depend on one exact generated HTML string.

const indexPath = 'index.html';
const motionJsPath = 'hble-motion.js';

let html = await readFile(indexPath, 'utf8');

// Convert the hidden full-screen Services player to on-demand loading.
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
  let startTimer = null;

  const status = document.createElement('div');
  status.className = 'hble-services-buffer-status';
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  status.textContent = 'Preparing video…';
  status.style.cssText = 'position:fixed;left:50%;bottom:max(28px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:10003;background:rgba(0,0,0,.82);color:#f2d998;border:1px solid rgba(213,173,97,.5);border-radius:999px;padding:10px 16px;font:700 13px/1.2 Inter,Arial,sans-serif;letter-spacing:.02em;display:none;pointer-events:none;white-space:nowrap;';
  modal.appendChild(status);

  function bufferedAhead(){
    if (!video.buffered || !video.buffered.length) return 0;
    const now = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    for (let i = 0; i < video.buffered.length; i++) {
      const start = video.buffered.start(i);
      const end = video.buffered.end(i);
      if (now >= start - 0.25 && now <= end + 0.25) return Math.max(0, end - now);
      if (now === 0 && start <= 0.5) return Math.max(0, end);
    }
    return 0;
  }

  function showStatus(text){ status.textContent = text; status.style.display = 'block'; }
  function hideStatus(){ status.style.display = 'none'; }

  function playWhenBuffered(mySession){
    const targetBuffer = 12;
    let finished = false;

    function cleanup(){
      video.removeEventListener('progress', maybePlay);
      video.removeEventListener('canplaythrough', maybePlay);
      video.removeEventListener('loadedmetadata', maybePlay);
      video.removeEventListener('canplay', maybePlay);
      if (startTimer) { clearTimeout(startTimer); startTimer = null; }
    }

    function startPlayback(){
      if (finished || mySession !== session || !modal.classList.contains('is-open')) return;
      finished = true;
      cleanup();
      hideStatus();
      if (video.readyState > 0) video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function(){ showStatus('Tap play to continue'); });
    }

    function maybePlay(){
      if (finished || mySession !== session || !modal.classList.contains('is-open')) return;
      const ahead = bufferedAhead();
      if (video.readyState >= 4 || ahead >= targetBuffer) startPlayback();
      else showStatus('Preparing video… ' + Math.min(99, Math.round((ahead / targetBuffer) * 100)) + '%');
    }

    video.addEventListener('progress', maybePlay);
    video.addEventListener('canplaythrough', maybePlay);
    video.addEventListener('loadedmetadata', maybePlay);
    video.addEventListener('canplay', maybePlay);

    startTimer = setTimeout(function(){
      if (mySession !== session || finished) return;
      if (video.readyState >= 3 && bufferedAhead() >= 6) startPlayback();
      else showStatus('Still preparing video…');
    }, 7000);

    maybePlay();
  }

  function openServices(){
    session += 1;
    const mySession = session;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('services-video-open');
    showStatus('Preparing video…');

    // Stay idle on page load, but once the user taps Services let the browser
    // buffer aggressively before playback starts.
    video.preload = 'auto';
    if (!video.getAttribute('src') && video.dataset.src) {
      video.setAttribute('src', video.dataset.src);
    }
    video.load();
    playWhenBuffered(mySession);

    if (modal.requestFullscreen) {
      const fsPromise = modal.requestFullscreen();
      if (fsPromise && typeof fsPromise.catch === 'function') fsPromise.catch(function(){});
    }
  }

  function closeServices(){
    session += 1;
    if (startTimer) { clearTimeout(startTimer); startTimer = null; }
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
  document.addEventListener('keydown', function(event){ if (event.key === 'Escape' && modal.classList.contains('is-open')) closeServices(); });
})();
</script>`;

if (/<script\s+id="hble-services-video-controller">[\s\S]*?<\/script>/i.test(html)) {
  html = html.replace(/<script\s+id="hble-services-video-controller">[\s\S]*?<\/script>/i, controllerScript);
} else if (/<\/body>/i.test(html)) {
  html = html.replace(/<\/body>/i, `${controllerScript}\n</body>`);
}

html = html.replace(/<script\s+id="hble-services-lazyload-guard">[\s\S]*?<\/script>\s*/gi, '');
await writeFile(indexPath, html, 'utf8');

let motionJs = await readFile(motionJsPath, 'utf8');
motionJs = motionJs.replace(/video\.preload\s*=\s*['"]metadata['"];?/g, "video.preload = 'none';");
await writeFile(motionJsPath, motionJs, 'utf8');

console.log('HBLE video playback buffered: idle preload none; user-triggered preload auto; HBLE In Motion preload disabled.');
