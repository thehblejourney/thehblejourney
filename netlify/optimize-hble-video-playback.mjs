import { readFile, writeFile } from 'node:fs/promises';

// HBLE web-playback optimization.
// Keeps the approved Services master untouched and changes only browser loading behavior.

const indexPath = 'index.html';
const motionJsPath = 'hble-motion.js';

let html = await readFile(indexPath, 'utf8');

// Do not preload the heavy Services master in the hidden full-screen modal.
html = html.replace(
  '<video class="hble-services-master-video" src="media/hble-services-master.mp4" controls playsinline preload="metadata" loop></video>',
  '<video class="hble-services-master-video" data-src="media/hble-services-master.mp4" controls playsinline preload="none" loop></video>'
);

// Load the Services master only after the visitor actually presses Services.
html = html.replace(
  "    if (video) {\n      video.currentTime = 0;\n      const playPromise = video.play();",
  "    if (video) {\n      if (!video.getAttribute('src') && video.dataset.src) {\n        video.setAttribute('src', video.dataset.src);\n        video.load();\n      }\n      if (video.readyState > 0) video.currentTime = 0;\n      const playPromise = video.play();"
);

html = html.replace(
  "      video.pause();\n      video.currentTime = 0;",
  "      video.pause();\n      if (video.readyState > 0) video.currentTime = 0;"
);

await writeFile(indexPath, html, 'utf8');

// HBLE In Motion uses the same master. Keep the poster visible, but prevent background metadata loading.
let motionJs = await readFile(motionJsPath, 'utf8');
motionJs = motionJs.replace("video.preload = 'metadata';", "video.preload = 'none';");
await writeFile(motionJsPath, motionJs, 'utf8');

console.log('HBLE video playback optimized: Services loads on demand; HBLE In Motion preload disabled.');
