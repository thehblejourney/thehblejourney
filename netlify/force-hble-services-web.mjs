import { readFile, writeFile } from 'node:fs/promises';

const files = [
  'index.html',
  'media/hble-motion/manifest.json',
  'hble-motion.js'
];

for (const file of files) {
  try {
    const original = await readFile(file, 'utf8');
    const updated = original
      .replaceAll('media/hble-services-master.mp4', 'media/hble-services-web.mp4')
      .replaceAll('/media/hble-services-master.mp4', '/media/hble-services-web.mp4');

    if (updated !== original) {
      await writeFile(file, updated, 'utf8');
      console.log(`HBLE web video source enforced in ${file}`);
    } else {
      console.log(`HBLE web video source already correct in ${file}`);
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      console.log(`Skipped missing optional file: ${file}`);
      continue;
    }
    throw error;
  }
}

console.log('Final HBLE Services playback source: media/hble-services-web.mp4');
