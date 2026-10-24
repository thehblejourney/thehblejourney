import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const targetPath = path.join('images', 'hble-support-tip-jar.png');
const expectedBytes = 2279609;
const expectedSha256 = 'fec87742734ba0dbc325e2f67678a9f8f023e995ae6b56c3d9dc9c8925224d82';

const sources = [
  'https://hble.org/images/hble-support-tip-jar.png',
  'https://at.adobe.com/ZpOOlR27fv0pTaLW'
];

async function downloadVerified(url) {
  const response = await fetch(url, { redirect: 'follow', cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length !== expectedBytes) {
    throw new Error(`size mismatch: expected ${expectedBytes}, got ${data.length}`);
  }
  const sha256 = createHash('sha256').update(data).digest('hex');
  if (sha256 !== expectedSha256) {
    throw new Error(`SHA-256 mismatch: ${sha256}`);
  }
  return data;
}

let asset = null;
let lastError = null;

for (const source of sources) {
  try {
    asset = await downloadVerified(source);
    console.log(`HBLE Tip Jar asset verified from ${source}`);
    break;
  } catch (error) {
    lastError = error;
    console.warn(`HBLE Tip Jar asset source unavailable: ${source} — ${error.message}`);
  }
}

if (!asset) {
  throw new Error(`Unable to install HBLE Tip Jar asset. ${lastError?.message || ''}`);
}

await mkdir(path.dirname(targetPath), { recursive: true });
await writeFile(targetPath, asset);
console.log(`HBLE Tip Jar asset installed unchanged: ${asset.length} bytes — ${expectedSha256}`);
