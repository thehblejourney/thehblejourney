import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const WEB_FILE = path.join('media', 'hble-services-web.mp4');
const WEB_URL = 'https://hble.org/media/hble-services-web.mp4';
const BOOTSTRAP_URL = 'https://at.adobe.com/BMmW8JMoWkUHCWoP';
const EXPECTED_BYTES = 19828701;
const EXPECTED_SHA256 = '67d76cac162411644709c3aea88cff009f2f2d287d45a4833678fe22a68bb945';

function verify(data, label) {
  if (data.length !== EXPECTED_BYTES) {
    throw new Error(`${label} size mismatch: expected ${EXPECTED_BYTES}, got ${data.length}`);
  }
  const sha256 = createHash('sha256').update(data).digest('hex');
  if (sha256 !== EXPECTED_SHA256) {
    throw new Error(`${label} SHA-256 mismatch: ${sha256}`);
  }
  return sha256;
}

async function fetchBytes(url, label) {
  const response = await fetch(url, { redirect: 'follow', cache: 'no-store' });
  if (!response.ok) throw new Error(`${label} download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

let data = null;
let source = null;

try {
  const live = await fetchBytes(WEB_URL, 'Live HBLE web video');
  verify(live, 'Live HBLE web video');
  data = live;
  source = WEB_URL;
} catch (error) {
  console.log(`Live web copy unavailable or not current: ${error.message}`);
}

if (!data) {
  const bootstrap = await fetchBytes(BOOTSTRAP_URL, 'Adobe HBLE web video');
  verify(bootstrap, 'Adobe HBLE web video');
  data = bootstrap;
  source = BOOTSTRAP_URL;
}

await mkdir(path.dirname(WEB_FILE), { recursive: true });
await writeFile(WEB_FILE, data);
console.log(`Installed HBLE Services web playback copy from ${source} — ${data.length} bytes — ${EXPECTED_SHA256}`);

// Point only the Services modal at the web copy. Leave the archived/master asset untouched.
const hubspotPath = 'netlify/inject-hubspot.mjs';
let hubspot = await readFile(hubspotPath, 'utf8');
hubspot = hubspot.replace(
  '<video class="hble-services-master-video" src="media/hble-services-master.mp4"',
  '<video class="hble-services-master-video" src="media/hble-services-web.mp4"'
);
await writeFile(hubspotPath, hubspot, 'utf8');

// HBLE In Motion should use the same verified web-delivery copy.
const manifestPath = 'media/hble-motion/manifest.json';
let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest.replace('/media/hble-services-master.mp4', '/media/hble-services-web.mp4');
await writeFile(manifestPath, manifest, 'utf8');

// Keep the mobile playback hardening, but make its source the web copy rather than the archive/master.
const optimizerPath = 'netlify/optimize-hble-video-playback.mjs';
let optimizer = await readFile(optimizerPath, 'utf8');
optimizer = optimizer.replaceAll('media/hble-services-master.mp4', 'media/hble-services-web.mp4');
optimizer = optimizer.replaceAll('heavy master', 'web playback copy');
await writeFile(optimizerPath, optimizer, 'utf8');

console.log('HBLE Services players now target media/hble-services-web.mp4; archive/master files remain untouched.');
