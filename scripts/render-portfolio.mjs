// Render the initial experience before the browser resolves deep-link positions.
// The interactive page and static HTML share the same data and renderers.
import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const htmlFile = new URL('../dist/index.html', import.meta.url);
const source = await readFile(new URL('../dist/quest-log.js', import.meta.url), 'utf8');
const boundary = source.indexOf('\n(() => {');
if (boundary < 0) throw new Error('Could not find the pure quest renderer boundary.');
const rendered = runInNewContext(`${source.slice(0, boundary)}\n({
  LIST: renderQuestList(QUEST_ENTRIES.main, 'main'),
  DETAIL: renderQuestDetail(QUEST_ENTRIES.main[0])
})`, Object.create(null), { timeout: 1000 });
let html = await readFile(htmlFile, 'utf8');
const original = html;
for (const [key, value] of Object.entries(rendered)) {
  const start = `<!-- INITIAL_QUEST_${key}_START -->`;
  const end = `<!-- INITIAL_QUEST_${key}_END -->`;
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex < 0 || endIndex < startIndex) throw new Error(`Missing ${key} markers.`);
  html = html.slice(0, startIndex + start.length) + value + html.slice(endIndex);
}
if (process.argv.includes('--check')) {
  if (html !== original) throw new Error('Initial experience is stale. Run node scripts/render-portfolio.mjs.');
  console.log('Initial experience matches the interactive data and renderers.');
} else {
  await writeFile(htmlFile, html);
  console.log('Rendered initial experience.');
}
