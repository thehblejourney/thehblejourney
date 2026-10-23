import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const file = 'netlify/inject-hubspot.mjs';
let source = await readFile(file, 'utf8');

const NEW_SERVICES_BYTES = 64433923;
const NEW_SERVICES_SHA256 = '9c2d2453a33e45dd275b03dd6b492b2210eaa7fbdcf92549e7bd0b24ec1f35eb';
const NEW_SERVICES_BOOTSTRAP_URL = 'https://at.adobe.com/8b2vAOnz1pFMShgm';
const NEW_SERVICES_LIVE_URL = 'https://hble.org/media/hble-services-master.mp4';

async function liveServicesMatchesNewMaster() {
  try {
    const response = await fetch(NEW_SERVICES_LIVE_URL, { redirect: 'follow', cache: 'no-store' });
    if (!response.ok) return false;
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length !== NEW_SERVICES_BYTES) return false;
    const sha256 = createHash('sha256').update(data).digest('hex');
    return sha256 === NEW_SERVICES_SHA256;
  } catch {
    return false;
  }
}

const servicesSource = await liveServicesMatchesNewMaster()
  ? NEW_SERVICES_LIVE_URL
  : NEW_SERVICES_BOOTSTRAP_URL;

const replacements = new Map([
  ['https://at.adobe.com/TcAn0B2We8tPtWJm', servicesSource],
  ['bytes: 3233732', `bytes: ${NEW_SERVICES_BYTES}`],
  ['cf1a75704dc2e992d4d424d591370f12a178ac6aaee7d398aee4d6a086ada6fe', NEW_SERVICES_SHA256],
  ['https://at.adobe.com/vZED7feX3fuHhcBA', 'https://hble.org/images/ticker/hble-squat.png'],
  ['https://at.adobe.com/zWGXI94fLtdJZlRi', 'https://hble.org/images/ticker/hble-standing.png'],
  ['https://at.adobe.com/5RIfu7HdccSbcZSX', 'https://hble.org/images/ticker/hble-crouch.png'],
  ['https://at.adobe.com/zeTfIiDQaPlaXJHM', 'https://hble.org/images/ticker/hble-services.jpg']
]);

for (const [from, to] of replacements) {
  source = source.split(from).join(to);
}

await writeFile(file, source, 'utf8');
console.log(`HBLE Services source selected: ${servicesSource}`);
console.log(`HBLE Services expected bytes: ${NEW_SERVICES_BYTES}`);
console.log(`HBLE Services expected SHA-256: ${NEW_SERVICES_SHA256}`);
