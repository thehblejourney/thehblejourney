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

    // Move the heavy MP4 out of src so the browser cannot preload it on page load.
    next = next.replace(/\s+src="media\/hble-services-master\.mp4"/i, ' data-src="media/hble-services-master.mp4"');

    if (!/\bdata-src="media\/hble-services-master\.mp4"/i.test(next)) {
      next += ' data-src="media/hble-services-master.mp4"';
    }

    if (/\bpreload="[^"]*"/i.test(next)) {
      next = next.replace(/\bpreload="[^"]*"/i, 'preload="none"');
    } else {
      next += ' preload="none"';
    }

    return `<video${next}></video>`;
  }
);

// Keep the original controller compatible when its exact source is present.
html = html.replace(
  "    if (video) {\n      video.currentTime = 0;\n      const playPromise = video.play();",
  "    if (video) {\n      if (!video.getAttribute('src') && video.dataset.src) {\n        video.setAttribute('src', video.dataset.src);\n        video.load();\n      }\n      if (video.readyState > 0) video.currentTime = 0;\n      const playPromise = video.play();"
);

html = html.replace(
  "      video.pause();\n      video.currentTime = 0;",
  "      video.pause();\n      if (video.readyState > 0) video.currentTime = 0;"
);

// Independent capture-phase guard: even if the generated controller changes later,
// load the MP4 only when the visitor actually presses the Services button.
const guardMarker = 'id="hble-services-lazyload-guard"';
if (!html.includes(guardMarker) && /<\/body>/i.test(html)) {
  const guardScript = `<script id="hble-services-lazyload-guard">
(function(){
  document.addEventListener('click', function(event){
    const trigger = event.target && event.target.closest ? event.target.closest('.services-video-trigger') : null;
    if (!trigger) return;
    const video = document.querySelector('.hble-services-master-video');
    if (!video) return;
    if (!video.getAttribute('src') && video.dataset.src) {
      video.setAttribute('src', video.dataset.src);
      video.load();
    }
  }, true);
})();
</script>`;
  html = html.replace(/<\/body>/i, `${guardScript}\n</body>`);
}

await writeFile(indexPath, html, 'utf8');

// HBLE In Motion uses the same master. Never preload it in the background.
let motionJs = await readFile(motionJsPath, 'utf8');
motionJs = motionJs.replace(/video\.preload\s*=\s*['"]metadata['"];?/g, "video.preload = 'none';");
await writeFile(motionJsPath, motionJs, 'utf8');

console.log('HBLE video playback hardened: Services loads only on click; HBLE In Motion preload disabled at source and build time.');
