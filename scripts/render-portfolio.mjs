// Render the initial experience before the browser resolves deep-link positions.
// The interactive page and static HTML share the same data and renderers.
import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { renderProjectArchive } from './project-archive.mjs';
import { runwayForProjects, travelForProject } from '../dist/lab/modern/showcase-geometry.mjs';

const htmlFile = new URL('../dist/lab/forest/index.html', import.meta.url);
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

// Keep the modern page as the single editable source for the public homepage.
const homepageFile = new URL('../dist/index.html', import.meta.url);
const modernFile = new URL('../dist/lab/modern/index.html', import.meta.url);
const modernSource = await readFile(modernFile, 'utf8');
const archive = await renderProjectArchive();
const archivePattern = /<!-- PROJECT_ARCHIVE_START -->[\s\S]*?<!-- PROJECT_ARCHIVE_END -->/;
if (!archivePattern.test(modernSource)) throw new Error('Missing project archive markers.');
const modernBase = modernSource
  .replace(archivePattern, () => `<!-- PROJECT_ARCHIVE_START -->\n${archive.html}\n<!-- PROJECT_ARCHIVE_END -->`)
  .replace(/(<p class="archive-count" aria-live="polite">)[^<]*(<\/p>)/, `$1${archive.count} projects$2`);
const galleryCount = [...modernBase.matchAll(/\bdata-gallery-order="\d+"/g)].length;
const modern = modernBase.replace(/(<section class="work showcase" id="work")(?: style="[^"]*")?/, `$1 style="--gallery-runway:${runwayForProjects(galleryCount)};--gallery-last:${travelForProject(galleryCount-1)}"`);
if (process.argv.includes('--check')) {
  if (modern !== modernSource) throw new Error('Project archive is stale. Run node scripts/render-portfolio.mjs.');
} else {
  await writeFile(modernFile, modern);
}
console.log(`Project archive: ${archive.count} entries.`);
const homepage = modern
  .replace(/^[ \t]*<meta name="(?:robots|googlebot)" content="noindex, nofollow">\n/gm, '')
  .replace(/((?:href|src)=")\.\//g, '$1/lab/modern/');
if (process.argv.includes('--check')) {
  if (await readFile(homepageFile, 'utf8') !== homepage) throw new Error('Homepage is stale. Run node scripts/render-portfolio.mjs.');
  console.log('Modern homepage matches its source.');
} else {
  await writeFile(homepageFile, homepage);
  console.log('Published modern design to the homepage.');
}
