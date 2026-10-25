import { readFile, writeFile } from 'node:fs/promises';

// HBLE Services progressive playback.
// The committed web copy is H.264/AAC with the MP4 moov atom at the front (fast-start),
// so browsers should stream it directly instead of downloading the entire file into a Blob first.

const indexPath = 'index.html';
const motionJsPath = 'hble-motion.js';
const webSource = 'media/hble-services-web.mp4';

let html = await readFile(indexPath, 'utf8');
html = html.replaceAll('media/hble-services-master.mp4', webSource);

html = html.replace(
  /<video\b([^>]*\bclass="hble-services-master-video"[^>]*)><\/video>/i,
  (match, attrs) => {
    let next = attrs.replace(/\s+data-src="[^"]*"/gi, '');
    if (/\bsrc="[^"]*"/i.test(next)) next = next.replace(/\bsrc="[^"]*"/i, `src="${webSource}"`);
    else next += ` src="${webSource}"`;
    if (/\bpreload="[^"]*"/i.test(next)) next = next.replace(/\bpreload="[^"]*"/i, 'preload="metadata"');
    else next += ' preload="metadata"';
    if (!/\bcontrols\b/i.test(next)) next += ' controls';
    if (!/\bplaysinline\b/i.test(next)) next += ' playsinline';
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

  const source = 'media/hble-services-web.mp4';

  function ensureSource(){
    const current = video.getAttribute('src') || '';
    if (current !== source) {
      video.src = source;
      video.load();
    }
    video.preload = 'metadata';
    video.playsInline = true;
  }

  function openServices(){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('services-video-open');
    ensureSource();
    try { video.currentTime = 0; } catch (error) {}
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function(){});
    }
    if (modal.requestFullscreen) {
      const fsPromise = modal.requestFullscreen();
      if (fsPromise && typeof fsPromise.catch === 'function') fsPromise.catch(function(){});
    }
  }

  function closeServices(){
    video.pause();
    try { video.currentTime = 0; } catch (error) {}
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

html = html.replace(/<script\s+id="hble-services-lazyload-guard">[\s\S]*?<\/script>\s*/gi, '');
await writeFile(indexPath, html, 'utf8');

let motionJs = await readFile(motionJsPath, 'utf8');
motionJs = motionJs.replace(/video\.preload\s*=\s*['"]metadata['"];?/g, "video.preload = 'none';");
await writeFile(motionJsPath, motionJs, 'utf8');

console.log('HBLE Services playback: direct fast-start streaming enabled; full-file Blob download removed.');