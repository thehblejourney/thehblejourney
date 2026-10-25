import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const WEB_FILE = path.join('media', 'hble-services-web.mp4');
const WEB_URL = 'https://hble.org/media/hble-services-web.mp4';
const BOOTSTRAP_URLS = [
  'https://at.adobe.com/cdUaJ4PDmScpV2xd',
  'https://at.adobe.com/RhC2QsSFizplmidf',
  'https://at.adobe.com/bIrJkLNV6t4d22I8'
];
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

async function fetchVerified(url, label) {
  const response = await fetch(url, { redirect: 'follow', cache: 'no-store' });
  if (!response.ok) throw new Error(`${label} download failed: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  verify(data, label);
  return data;
}

let data = null;
let source = null;

// Once the file has been published by hble.org, future builds self-host from HBLE.
try {
  data = await fetchVerified(WEB_URL, 'Live HBLE web video');
  source = WEB_URL;
} catch (error) {
  console.log(`Live web copy not available yet: ${error.message}`);
}

// First-deploy bootstrap: try fresh auth-free Adobe renditions in order.
if (!data) {
  for (const url of BOOTSTRAP_URLS) {
    try {
      data = await fetchVerified(url, 'Adobe HBLE web video');
      source = url;
      break;
    } catch (error) {
      console.log(`Adobe bootstrap candidate failed: ${error.message}`);
    }
  }
}

if (!data) {
  throw new Error('HBLE Services web video could not be installed from HBLE or any verified Adobe bootstrap source.');
}

await mkdir(path.dirname(WEB_FILE), { recursive: true });
await writeFile(WEB_FILE, data);
console.log(`Installed HBLE Services web playback copy from ${source} — ${data.length} bytes — ${EXPECTED_SHA256}`);

// Remove the obsolete old Services-master download from the build. The archive/master
// remains untouched in storage; it is simply no longer fetched or used for web playback.
const hubspotPath = 'netlify/inject-hubspot.mjs';
let hubspot = await readFile(hubspotPath, 'utf8');
hubspot = hubspot.replace(
  /\s*\{\s*label:\s*"Services master",[\s\S]*?sha256:\s*"cf1a75704dc2e992d4d424d591370f12a178ac6aaee7d398aee4d6a086ada6fe"\s*\},?\s*/,
  '\n  '
);
hubspot = hubspot.replace(
  'Approved visuals: HBLE logo, verified Services master MP4, and four verified ticker images.',
  'Approved visuals: HBLE logo, verified Services web MP4, and four verified ticker images.'
);
hubspot = hubspot.replaceAll('media/hble-services-master.mp4', 'media/hble-services-web.mp4');
hubspot = hubspot.replaceAll('Full-screen Services master', 'Full-screen Services web playback');
await writeFile(hubspotPath, hubspot, 'utf8');

// HBLE In Motion uses the same verified web-delivery copy.
const manifestPath = 'media/hble-motion/manifest.json';
let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest.replaceAll('/media/hble-services-master.mp4', '/media/hble-services-web.mp4');
await writeFile(manifestPath, manifest, 'utf8');

// Mobile playback hardening must target the web copy, never the archive/master.
const optimizerPath = 'netlify/optimize-hble-video-playback.mjs';
let optimizer = await readFile(optimizerPath, 'utf8');
optimizer = optimizer.replaceAll('media/hble-services-master.mp4', 'media/hble-services-web.mp4');
optimizer = optimizer.replaceAll('heavy master', 'web playback copy');
await writeFile(optimizerPath, optimizer, 'utf8');

console.log('HBLE Services modal and HBLE In Motion now target media/hble-services-web.mp4.');
