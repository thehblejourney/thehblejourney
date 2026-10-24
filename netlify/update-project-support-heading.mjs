import { readFile, writeFile } from 'node:fs/promises';

const file = 'index.html';
let html = await readFile(file, 'utf8');
const from = '<div class="eyebrow">Start a Project</div>';
const to = '<div class="eyebrow">Start a Project or Get Support</div>';

if (html.includes(from)) {
  html = html.replace(from, to);
  await writeFile(file, html, 'utf8');
  console.log('Updated HBLE project/support heading.');
} else if (html.includes(to)) {
  console.log('HBLE project/support heading already updated.');
} else {
  throw new Error('Expected HBLE project/support heading was not found.');
}
