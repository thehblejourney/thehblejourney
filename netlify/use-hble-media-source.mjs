import { readFile, writeFile } from 'node:fs/promises';

const file = 'netlify/inject-hubspot.mjs';
let source = await readFile(file, 'utf8');

const replacements = new Map([
  ['https://at.adobe.com/TcAn0B2We8tPtWJm', 'https://hble.org/media/hble-services-master.mp4'],
  ['https://at.adobe.com/vZED7feX3fuHhcBA', 'https://hble.org/images/ticker/hble-squat.png'],
  ['https://at.adobe.com/zWGXI94fLtdJZlRi', 'https://hble.org/images/ticker/hble-standing.png'],
  ['https://at.adobe.com/5RIfu7HdccSbcZSX', 'https://hble.org/images/ticker/hble-crouch.png'],
  ['https://at.adobe.com/zeTfIiDQaPlaXJHM', 'https://hble.org/images/ticker/hble-services.jpg']
]);

for (const [temporaryUrl, permanentUrl] of replacements) {
  source = source.split(temporaryUrl).join(permanentUrl);
}

await writeFile(file, source, 'utf8');
console.log('HBLE verified media sources switched to permanent hble.org URLs for this build.');
