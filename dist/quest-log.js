const QUEST_ENTRIES = {
  main: [
    {
      name: 'Arrows Up', role: 'Software engineer', dates: 'May 2026 – present', place: 'St. Louis, MO', status: 'Current role',
      summary: 'Modernizing client web platforms for service businesses.',
      objectives: [
        'Rebuilt more than 21 client sites with SvelteKit, including routing, CMS integrations, and SEO migrations.',
        'Built reusable client-site templates that reduced delivery time by 50%.',
        'Configured Sanity CMS, Cloudflare Workers, analytics, and GitHub Actions deployment pipelines.'
      ],
      rewards: [['21+', 'client sites'], ['50%', 'shorter delivery']],
      art: { src: 'holcomb-tree-service.webp', alt: 'Holcomb Tree Service website designed for a Dallas tree care company' },
      links: [{ href: 'https://staging-holcomb-tree-service.arbor-alliance.workers.dev/', label: 'View Holcomb client preview' }]
    },
    {
      name: 'MyOasis.ai', role: 'Software engineering intern', dates: 'Jun 2025 – May 2026', place: 'Remote', status: 'Internship',
      summary: 'Built the public facing experience for a wellbeing platform.',
      objectives: [
        'Led front-end work on the landing page.',
        'Improved responsive layouts and React performance across devices.'
      ],
      art: { src: 'Images/myoasis.jpg', alt: 'MyOasis homepage for its mental wellness platform' },
      links: [{ href: 'https://www.myoasis.ai/', label: 'Visit MyOasis.ai' }]
    },
    {
      name: 'Missouri State University', role: 'Research assistant · deep learning', dates: 'Jan – Dec 2025', place: 'Springfield, MO', status: 'Research appointment',
      summary: 'Studied transformer architectures for time series forecasting and applied deep learning to genomic classification.',
      objectives: [
        'Ran Dozerformer ablation studies to compare encoder and decoder contributions to forecasting accuracy.',
        'Applied DNABERT to distinguish oncogenes from tumor suppressor genes.',
        'Coauthored a paper for ITNG 2026; the forecasting research won first place in Computer Science at the 2025 CNAS symposium.'
      ],
      rewards: [['1st', 'CNAS symposium']],
      art: { src: 'Images/transformer.png', alt: 'Training and validation plots from transformer time series forecasting research' }
    },
    {
      name: 'N-of-1 AI', role: 'Software engineering intern · Scribsy', dates: 'Jun – Aug 2025', place: 'Remote', status: 'Internship',
      summary: 'Built clinical documentation software to help practitioners prepare session notes.',
      objectives: [
        'Architected audio transcription, structured SOAP note generation, and note management.',
        'Built the product with FastAPI and Next.js.'
      ],
      art: { src: 'Images/scribsy.png', alt: 'Scribsy clinical documentation dashboard with notes and calendar' },
      links: [{ href: 'https://scribsy.vercel.app/sample-visit', label: 'Try a sample visit · no signup' }, { href: 'https://github.com/Zelun-He/Scribsy', label: 'View Scribsy code' }]
    }
  ],
  side: [
    {
      name: 'Orbit Image Converter', role: 'Browser image converter · Personal project', dates: 'Oct 2026 – present', status: 'In progress', category: 'web', current: true,
      addedAt: '2026-10-20T00:00:00Z',
      summary: 'Building a faster image conversion workflow: drop in photos, choose a format from a radial wheel, and export them locally.',
      objectives: [
        'Implemented PNG, WebP, JPG, BMP, and ICO exports using browser-native image encoding and custom BMP and ICO encoders.',
        'Added quality controls, resizing, transparency handling, and individual or batch ZIP downloads.',
        'Keep image processing on the user’s device with JavaScript, the Canvas API, and the File API.'
      ],
      art: { src: 'Images/orbit-image-converter.svg', alt: 'Orbit interface preview with a drag-and-drop image area and radial format picker' }
    },
    {
      name: 'Eastern Asteria', role: 'Corporate & coffee brand website · Arrows Up', status: 'Selected project', category: 'web',
      addedAt: '2026-10-06T20:10:33Z',
      summary: 'A corporate website connecting coffee sourcing, the Deep Thrill brand, hospitality, and technology through a cohesive visual story.',
      objectives: ['Created a cohesive presentation across the company and its coffee brand.', 'Organized its coffee, hospitality, and technology strategy into clear, responsive pages.'],
      art: { src: 'Images/eastern-asteria-home.webp', alt: 'Eastern Asteria homepage with the heading From Source to Sip above green coffee fields' },
      links: [{ href: 'https://www.easternasteriainc.com/', label: 'Visit website' }]
    },
    {
      name: 'Holcomb Tree Service', role: 'Client website · Arrows Up', status: 'Selected project', category: 'web', current: true,
      addedAt: '2026-09-25T06:40:50Z',
      summary: 'A service website for a Dallas tree care company.',
      objectives: ['Created clear navigation across the company’s services.', 'Made it easy for prospective customers to request a consultation.'],
      art: { src: 'holcomb-tree-service.webp', alt: 'Holcomb Tree Service homepage and consultation form' },
      links: [{ href: 'https://staging-holcomb-tree-service.arbor-alliance.workers.dev/', label: 'View preview' }]
    },
    {
      name: 'Scribsy', role: 'Clinical documentation · N-of-1 AI', status: 'Selected project', category: 'web',
      addedAt: '2026-09-25T06:40:50Z',
      summary: 'A clinical documentation app for practitioners.',
      objectives: ['Built audio transcription and structured SOAP notes.', 'Implemented note management in a FastAPI and Next.js application.'],
      art: { src: 'Images/scribsy.png', alt: 'Scribsy dashboard with note creation and calendar' },
      links: [{ href: 'https://scribsy.vercel.app/sample-visit', label: 'Try a sample visit · no signup' }, { href: 'https://github.com/Zelun-He/Scribsy', label: 'View code' }]
    },
    {
      name: 'Narrator', role: 'Full-stack audiobook app', status: 'Selected project', category: 'web', current: true,
      addedAt: '2026-09-25T06:40:50Z',
      summary: 'Turns uploaded manuscripts into audiobooks with AI narration.',
      objectives: ['Built manuscript upload and voice selection workflows.', 'Added generation progress, chapter playback, and audiobook downloads.'],
      art: { src: 'narrator-dashboard.webp', alt: 'Narrator author studio dashboard showing the library and audiobook creation' },
      links: [{ href: 'https://narrator-eight.vercel.app/demo/library', label: 'Explore the demo · no signup' }, { href: 'https://github.com/Zelun-He/Narrator', label: 'View code' }]
    },
    {
      name: 'MyOasis.ai', role: 'Wellbeing platform · internship', status: 'Selected project', category: 'web',
      addedAt: '2026-09-25T06:40:50Z',
      summary: 'A responsive landing page for a wellbeing platform.',
      objectives: ['Led front-end development of the landing page.', 'Improved the site’s responsive layouts and React performance.'],
      art: { src: 'Images/myoasis.jpg', alt: 'MyOasis public website homepage' },
      links: [{ href: 'https://www.myoasis.ai/', label: 'Visit website' }]
    },
    {
      name: 'Gene Classifier', role: 'Machine learning research', status: 'Selected project', category: 'research',
      summary: 'Benchmarks DNA representations against simple sequence features on 809 genes; short fine-tuning showed no established advantage.',
      objectives: ['Completed 40 fresh DNABERT fits with fixed nested gene and homology-grouped folds.', 'Audited gene-level predictions and reported paired uncertainty intervals. Working manuscript, not peer reviewed.'],
      art: { src: 'research/dnabert-cds/results-figure.png', alt: 'Balanced accuracy and uncertainty intervals for six gene classification methods' },
      links: [{ href: '/research/dnabert-cds/', label: 'Read research' }, { href: 'https://github.com/Zelun-He/gene_classifier_project', label: 'View code' }]
    },
    {
      name: 'Transformer Research', role: 'Published time series research', dates: '2025 – 2026', status: 'Selected project', category: 'research',
      summary: 'Studied encoder and decoder contributions to time series forecasting for an ITNG 2026 paper.',
      objectives: ['Ran targeted ablation experiments to compare transformer architectures.', 'Won first place in Computer Science at the 2025 CNAS Undergraduate Research Symposium.'],
      rewards: [['1st', 'CNAS symposium']],
      art: { src: 'Images/transformer.png', alt: 'Time series forecasting training and validation plots', frame: 'charts' }
    },
    {
      name: 'Real-Time Translation', role: 'Android speech app', status: 'Selected project', category: 'mobile',
      summary: 'A mobile app for speech transcription and translation.',
      objectives: ['Built the Android interface in Kotlin.', 'Connected Whisper and Google Cloud APIs through a FastAPI backend.'],
      art: { src: 'translation-screen.webp', alt: 'Translation app language options and speech indicator', frame: 'phone' },
      links: [{ href: 'https://github.com/Zelun-He/RealTimeTranslationApp', label: 'View code' }]
    },
    {
      name: 'Space Invaders', role: 'C++ game development', status: 'Selected project', category: 'systems',
      summary: 'A recreation of the arcade game in C++ and Raylib.',
      objectives: ['Built alien waves, player controls, and scoring.', 'Used the project to explore game programming.'],
      art: { src: 'Images/space-invaders.png', alt: 'Space Invaders game with rows of pixel art aliens', frame: 'game' },
      links: [{ href: 'https://github.com/Zelun-He/Space_Invaders', label: 'View code' }]
    },
    {
      name: 'Limit Order Book', role: 'C++ systems project', status: 'Selected project', category: 'systems',
      summary: 'A low-latency limit order book and matching engine.',
      objectives: ['Matched orders using FIFO price-time priority.', 'Added latency metrics and a React demo interface.'],
      art: { src: 'Images/order-book.svg', alt: 'Order book interface displaying bids, asks, and market statistics' },
      links: [{ href: 'https://github.com/Zelun-He/low_latency_lob', label: 'View code' }]
    }
  ]
};

// Give new website entries an addedAt timestamp; the gallery places the latest
// websites first regardless of their position in the source list. Keep the
// experience/current-project quest log in its existing order.
const PROJECT_ENTRIES = [...QUEST_ENTRIES.side].sort((a, b) => {
  const websiteOrder = Number(b.category === 'web') - Number(a.category === 'web');
  if (websiteOrder) return websiteOrder;
  if (a.category !== 'web') return 0;
  return (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0);
});
QUEST_ENTRIES.side = QUEST_ENTRIES.side.filter(entry => entry.current).map(entry => ({ ...entry, status: entry.status === 'Selected project' ? 'Current project' : entry.status }));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const isPastEntry = entry => entry.status === 'Internship' || entry.status === 'Research appointment';

(() => {
  const list = document.getElementById('quest-list');
  const detail = document.getElementById('quest-detail');
  const body = document.getElementById('quest-log-body');
  const tabs = [...document.querySelectorAll('[data-quest-category]')];
  if (!list || !detail || !body || tabs.length !== 2) return;

  let category = 'main';
  let selected = 0;

  function renderDetail() {
    const entry = QUEST_ENTRIES[category][selected];
    const active = list.querySelector(`[data-quest-index="${selected}"]`);
    detail.setAttribute('aria-labelledby', active.id);
    detail.innerHTML = `
      <span class="quest-detail__status ${isPastEntry(entry) ? 'quest-detail__status--past' : ''}">${escapeHTML(entry.status)}</span>
      <h3>${escapeHTML(entry.name)}</h3>
      <p class="quest-detail__meta">${[entry.role, entry.dates, entry.place].filter(Boolean).map(escapeHTML).join(' · ')}</p>
      <p class="quest-detail__summary">${escapeHTML(entry.summary)}</p>
      <h4>Contributions</h4>
      <ul class="quest-objectives">${entry.objectives.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      ${entry.rewards?.length ? `<h4>Results</h4><div class="quest-rewards">${entry.rewards.map(([number, label]) => `<div class="quest-reward"><b>${escapeHTML(number)}</b><span>${escapeHTML(label)}</span></div>`).join('')}</div>` : ''}
      ${entry.links?.length ? `<div class="quest-detail__links">${entry.links.map(link => `<a href="${escapeHTML(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} ↗</a>`).join('')}</div>` : ''}
      <a class="quest-art" href="${escapeHTML(entry.art.src)}" data-image-viewer aria-haspopup="dialog" target="_blank" rel="noopener noreferrer" aria-label="Open full image: ${escapeHTML(entry.name)}"><img src="${escapeHTML(entry.art.src)}" alt="${escapeHTML(entry.art.alt)}" loading="lazy" decoding="async"><span>View full image</span></a>`;
    detail.querySelector('img')?.addEventListener('load', () => window.dispatchEvent(new Event('resize')), { once: true });
  }

  function selectEntry(index, moveFocus = false) {
    selected = index;
    const entries = [...list.querySelectorAll('.quest-entry')];
    entries.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    renderDetail();
    window.dispatchEvent(new Event('resize'));
    if (moveFocus) {
      entries[index].focus({ preventScroll: true });
      const container = list.getBoundingClientRect();
      const item = entries[index].getBoundingClientRect();
      if (item.top < container.top) list.scrollTop -= container.top - item.top;
      else if (item.bottom > container.bottom) list.scrollTop += item.bottom - container.bottom;
    }
  }

  function renderList() {
    list.innerHTML = QUEST_ENTRIES[category].map((entry, index) => `
      <button class="quest-entry" type="button" role="tab" id="quest-${category}-${index}" aria-selected="${index === 0}" aria-controls="quest-detail" tabindex="${index === 0 ? 0 : -1}" data-quest-index="${index}">
        <span class="quest-entry__status ${isPastEntry(entry) ? 'quest-entry__status--past' : ''}">${escapeHTML(entry.status)}</span>
        <span class="quest-entry__name">${escapeHTML(entry.name)}</span>
        <span class="quest-entry__meta">${[entry.role, entry.dates].filter(Boolean).map(escapeHTML).join(' · ')}</span>
      </button>`).join('');
    selectEntry(0);
  }

  function selectCategory(next, moveFocus = false) {
    if (next !== 'main' && next !== 'side') return;
    category = next;
    tabs.forEach(tab => {
      const active = tab.dataset.questCategory === next;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus({ preventScroll: true });
    });
    body.setAttribute('aria-labelledby', `quest-tab-${next}`);
    renderList();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCategory(tab.dataset.questCategory));
    tab.addEventListener('keydown', event => {
      const moves = { ArrowRight: 1, ArrowLeft: -1 };
      if (event.key in moves) {
        event.preventDefault();
        selectCategory(tabs[(index + moves[event.key] + tabs.length) % tabs.length].dataset.questCategory, true);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        selectCategory(tabs[event.key === 'Home' ? 0 : tabs.length - 1].dataset.questCategory, true);
      }
    });
  });

  document.querySelectorAll('[data-current-project]').forEach(link => {
    link.addEventListener('click', () => {
      const index = QUEST_ENTRIES.side.findIndex(entry => entry.name === link.dataset.currentProject);
      if (index < 0) return;
      selectCategory('side');
      selectEntry(index, true);
    });
  });

  list.addEventListener('click', event => {
    const button = event.target.closest('.quest-entry');
    if (button && list.contains(button)) selectEntry(Number(button.dataset.questIndex));
  });
  list.addEventListener('keydown', event => {
    const entries = [...list.querySelectorAll('.quest-entry')];
    const index = entries.indexOf(document.activeElement);
    if (index < 0) return;
    const moves = { ArrowDown: 1, ArrowUp: -1 };
    let next;
    if (event.key in moves) next = (index + moves[event.key] + entries.length) % entries.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = entries.length - 1;
    else return;
    event.preventDefault();
    selectEntry(next, true);
  });

  selectCategory('main');
})();

(() => {
  const grid = document.getElementById('project-grid');
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const gallery = document.getElementById('project-gallery');
  const galleryToggle = document.getElementById('project-gallery-toggle');
  const shortcuts = [...document.querySelectorAll('[data-project-shortcut]')];
  if (!grid || !filters.length) return;

  const featuredNames = new Set([...document.querySelectorAll('[data-featured-project]')].map(card => card.dataset.featuredProject));
  const archiveEntries = PROJECT_ENTRIES.filter(entry => !featuredNames.has(entry.name));
  const archiveCount = document.getElementById('project-archive-count');
  if (archiveCount) archiveCount.textContent = String(archiveEntries.length);
  grid.innerHTML = archiveEntries.map(entry => {
    const actions = entry.links?.map(link => {
      const label = link.href.includes('github.com') ? 'View code' : link.href.includes('staging-') ? 'View preview' : link.label.toLowerCase().includes('app') ? 'Open app' : link.label === 'Read research' ? 'Read research' : 'Visit website';
      return `<a href="${escapeHTML(link.href)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
    }).join('') || '';
    return `<article class="project-card" data-project-category="${escapeHTML(entry.category)}">
      <div class="project-card__media">
        <div class="project-card__image" data-preview-frame="${escapeHTML(entry.art.frame || 'screen')}">
          <div class="project-card__viewport"><img src="${escapeHTML(entry.art.src)}" alt="${escapeHTML(entry.art.alt)}" loading="lazy" decoding="async"></div>
        </div>
        <nav class="project-card__actions" aria-label="${escapeHTML(entry.name)} preview actions">
          ${actions}
          <a class="project-card__action-image" href="${escapeHTML(entry.art.src)}" data-image-viewer aria-haspopup="dialog" target="_blank" rel="noopener noreferrer">Full image</a>
        </nav>
      </div>
      <div class="project-card__content">
        <span class="project-card__type">${escapeHTML(entry.role)}</span>
        <h3>${escapeHTML(entry.name)}</h3>
        <p>${escapeHTML(entry.summary)}</p>
        <nav class="project-links" aria-label="${escapeHTML(entry.name)} quick links">${actions}<a href="${escapeHTML(entry.art.src)}" data-image-viewer aria-haspopup="dialog" target="_blank" rel="noopener noreferrer">Screenshot</a></nav>
      </div>
    </article>`;
  }).join('');
  grid.dataset.resultCount = String(archiveEntries.length);

  function selectFilter(filter) {
    const button = filters.find(item => item.dataset.projectFilter === filter);
    if (!button) return;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visibleCount = 0;
    grid.querySelectorAll('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.projectCategory !== filter;
      if (!card.hidden) visibleCount += 1;
    });
    grid.dataset.resultCount = String(visibleCount);
    window.dispatchEvent(new Event('resize'));
    return button;
  }

  filters.forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.projectFilter)));

  if (gallery && galleryToggle) {
    function setGalleryOpen(open) {
      gallery.hidden = !open;
      galleryToggle.setAttribute('aria-expanded', String(open));
      window.dispatchEvent(new Event('resize'));
    }

    galleryToggle.addEventListener('click', () => setGalleryOpen(gallery.hidden));
    shortcuts.forEach(shortcut => shortcut.addEventListener('click', () => {
      const selectedFilter = selectFilter(shortcut.dataset.projectShortcut);
      if (!selectedFilter) return;
      setGalleryOpen(true);
      selectedFilter.focus({ preventScroll: true });
      gallery.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }));
  }
})();
