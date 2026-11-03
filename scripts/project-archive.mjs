import { readFile } from 'node:fs/promises';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

export async function renderProjectArchive() {
  const projects = JSON.parse(await readFile(new URL('../content/more-projects.json', import.meta.url), 'utf8'));
  const ids = new Set();
  const categories = new Set(['web', 'ai', 'systems', 'games', 'learning']);
  const html = projects.map((project, index) => {
    if (!/^[a-z][a-z0-9-]*$/.test(project.id) || ids.has(project.id)) throw new Error(`Invalid project ID: ${project.id}`);
    ids.add(project.id);
    if (!project.categories.length || project.categories.some(category => !categories.has(category))) throw new Error(`Invalid categories: ${project.id}`);
    const links = project.links.map(link => {
      if (!/^(https:\/\/|\/(?!\/)|#)/.test(link.href)) throw new Error(`Invalid project link: ${project.id}`);
      const external = link.href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="text-link" href="${escape(link.href)}"${external}>${escape(link.label)} ↗</a>`;
    }).join('');
    const status = project.status ? `<p class="project-state">${escape(project.status)}</p>` : '';
    const media = project.image
      ? `<img src="${escape(project.image.src)}" alt="${escape(project.image.alt)}" width="${project.image.width}" height="${project.image.height}" loading="lazy" decoding="async">`
      : `<div class="archive-context"><p class="eyebrow">${escape(project.label)}</p><p class="stack">${escape(project.stack)}</p>${status}</div>`;
    return `        <details class="archive-row" data-category="${escape(project.categories.join(' '))}"><summary><span class="archive-number">${String(index + 1).padStart(2, '0')}</span><h3>${escape(project.title)}</h3><span class="row-category">${escape(project.label)}</span><span class="row-plus" aria-hidden="true">+</span></summary><div class="archive-detail${project.image ? '' : ' archive-detail--text'}" id="${escape(project.id)}">${media}<div class="archive-description"><p class="project-description">${escape(project.description)}</p>${project.image ? `<p class="stack">${escape(project.stack)}</p>${status}` : ''}${links ? `<div class="archive-links">${links}</div>` : ''}${project.note ? `<p class="case-demo-note">${escape(project.note)}</p>` : ''}</div></div></details>`;
  }).join('\n');
  return { html, count: projects.length };
}
