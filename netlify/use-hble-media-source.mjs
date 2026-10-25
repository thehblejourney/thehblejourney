import { readFile, writeFile } from 'node:fs/promises';

// Safety-only source normalizer.
// The lightweight Services MP4 already tracked in the repository is authoritative.
// This script must never replace it with the 64 MB archive/master.
const file = 'netlify/inject-hubspot.mjs';
let source = await readFile(file, 'utf8');

const replacements = new Map([
  ['https://at.adobe.com/vZED7feX3fuHhcBA', 'https://hble.org/images/ticker/hble-squat.png'],
  ['https://at.adobe.com/zWGXI94fLtdJZlRi', 'https://hble.org/images/ticker/hble-standing.png'],
  ['https://at.adobe.com/5RIfu7HdccSbcZSX', 'https://hble.org/images/ticker/hble-crouch.png'],
  ['https://at.adobe.com/zeTfIiDQaPlaXJHM', 'https://hble.org/images/ticker/hble-services.jpg']
]);

for (const [from, to] of replacements) {
  source = source.split(from).join(to);
}

await writeFile(file, source, 'utf8');
console.log('HBLE media sources normalized without replacing the lightweight Services video.');
