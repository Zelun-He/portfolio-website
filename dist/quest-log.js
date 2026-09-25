const QUEST_ENTRIES = {
  main: [
    {
      name: 'Arrows Up', role: 'Software engineer', dates: 'May 2026 – present', place: 'St. Louis, MO', status: 'Current role',
      summary: 'Modernizing client web platforms for service businesses.',
      objectives: [
        'Rebuilt more than 21 client sites with SvelteKit, including routing, CMS integrations, and SEO migrations.',
        'Built reusable templates that cut delivery time by 50%.',
        'Configured Sanity CMS, Cloudflare Workers, analytics, and GitHub Actions deployment pipelines.'
      ],
      rewards: [['21+', 'client sites'], ['50%', 'faster delivery']],
      art: { src: 'holcomb-tree-service.webp', alt: 'Holcomb Tree Service website designed for a Dallas tree care company' },
      links: [{ href: 'https://staging-holcomb-tree-service.arbor-alliance.workers.dev/', label: 'View Holcomb client website' }]
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
      name: 'N-of-1 AI', role: 'Software engineering intern · Scribsy', dates: 'Jun – Aug 2025', place: 'Remote', status: 'Internship',
      summary: 'Built clinical documentation software to help practitioners prepare session notes.',
      objectives: [
        'Architected audio transcription, structured SOAP note generation, and note management.',
        'Built the product with FastAPI and Next.js.'
      ],
      art: { src: 'Images/scribsy.png', alt: 'Scribsy clinical documentation dashboard with notes and calendar' },
      links: [{ href: 'https://github.com/Zelun-He/Scribsy', label: 'View Scribsy code' }]
    }
  ],
  side: [
    {
      name: 'Holcomb Tree Service', role: 'Client website · Arrows Up', status: 'Selected project', category: 'web', current: true,
      summary: 'A service website for a Dallas tree care company.',
      objectives: ['Created clear navigation across the company’s services.', 'Made it easy for prospective customers to request a consultation.'],
      art: { src: 'holcomb-tree-service.webp', alt: 'Holcomb Tree Service homepage and consultation form' },
      links: [{ href: 'https://staging-holcomb-tree-service.arbor-alliance.workers.dev/', label: 'View website' }]
    },
    {
      name: 'Scribsy', role: 'Clinical documentation · N-of-1 AI', status: 'Selected project', category: 'web',
      summary: 'A clinical documentation app for practitioners.',
      objectives: ['Built audio transcription and structured SOAP notes.', 'Implemented note management in a FastAPI and Next.js application.'],
      art: { src: 'Images/scribsy.png', alt: 'Scribsy dashboard with note creation and calendar' },
      links: [{ href: 'https://github.com/Zelun-He/Scribsy', label: 'View code' }]
    },
    {
      name: 'Narrator', role: 'Full-stack audiobook app', status: 'Selected project', category: 'web', current: true,
      summary: 'Turns uploaded manuscripts into audiobooks with AI narration.',
      objectives: ['Built manuscript upload and voice selection workflows.', 'Added generation progress, chapter playback, and audiobook downloads.'],
      art: { src: 'narrator-dashboard.webp', alt: 'Narrator dashboard showing audiobook progress and playback' },
      links: [{ href: 'https://narrator-eight.vercel.app/', label: 'View app' }, { href: 'https://github.com/Zelun-He/Narrator', label: 'View code' }]
    },
    {
      name: 'MyOasis.ai', role: 'Wellbeing platform · internship', status: 'Selected project', category: 'web',
      summary: 'A responsive landing page for a wellbeing platform.',
      objectives: ['Led front-end development of the landing page.', 'Improved the site’s responsive layouts and React performance.'],
      art: { src: 'Images/myoasis.jpg', alt: 'MyOasis public website homepage' },
      links: [{ href: 'https://www.myoasis.ai/', label: 'Visit website' }]
    },
    {
      name: 'Gene Classifier', role: 'Machine learning research', status: 'Selected project', category: 'research',
      summary: 'Classifies oncogenes and tumor suppressors from genomic sequences.',
      objectives: ['Fine-tuned DNABERT for DNA sequence classification.', 'Presented classification results and confidence scores.'],
      art: { src: 'Images/gene-classifier.png', alt: 'DNA sequence classification output and confidence scores' },
      links: [{ href: 'https://github.com/Zelun-He/gene_classifier_project', label: 'View code' }]
    },
    {
      name: 'Transformer Research', role: 'Published time series research', dates: '2025 – 2026', status: 'Selected project', category: 'research',
      summary: 'Studied encoder and decoder contributions to time series forecasting for an ITNG 2026 paper.',
      objectives: ['Ran targeted ablation experiments to compare transformer architectures.', 'Won first place in Computer Science at the 2025 CNAS Undergraduate Research Symposium.'],
      rewards: [['1st', 'CNAS symposium']],
      art: { src: 'Images/transformer.png', alt: 'Time series forecasting training and validation plots' }
    },
    {
      name: 'Real-Time Translation', role: 'Android speech app', status: 'Selected project', category: 'mobile',
      summary: 'A mobile app for speech transcription and translation.',
      objectives: ['Built the Android interface in Kotlin.', 'Connected Whisper and Google Cloud APIs through a FastAPI backend.'],
      art: { src: 'translation-screen.webp', alt: 'Translation app language options and speech indicator' },
      links: [{ href: 'https://github.com/Zelun-He/RealTimeTranslationApp', label: 'View code' }]
    },
    {
      name: 'Space Invaders', role: 'C++ game development', status: 'Selected project', category: 'systems',
      summary: 'A recreation of the arcade game in C++ and Raylib.',
      objectives: ['Built alien waves, player controls, and scoring.', 'Used the project to explore game programming.'],
      art: { src: 'Images/space-invaders.png', alt: 'Space Invaders game with rows of pixel art aliens' },
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

const PROJECT_ENTRIES = QUEST_ENTRIES.side;
QUEST_ENTRIES.side = PROJECT_ENTRIES.filter(entry => entry.current).map(entry => ({ ...entry, status: 'Current project' }));
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

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
      <span class="quest-detail__status ${entry.status === 'Internship' ? 'quest-detail__status--past' : ''}">${escapeHTML(entry.status)}</span>
      <h3>${escapeHTML(entry.name)}</h3>
      <p class="quest-detail__meta">${[entry.role, entry.dates, entry.place].filter(Boolean).map(escapeHTML).join(' · ')}</p>
      <p class="quest-detail__summary">${escapeHTML(entry.summary)}</p>
      <h4>Objectives</h4>
      <ul class="quest-objectives">${entry.objectives.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      ${entry.rewards?.length ? `<h4>Results</h4><div class="quest-rewards">${entry.rewards.map(([number, label]) => `<div class="quest-reward"><b>${escapeHTML(number)}</b><span>${escapeHTML(label)}</span></div>`).join('')}</div>` : ''}
      ${entry.links?.length ? `<div class="quest-detail__links">${entry.links.map(link => `<a href="${escapeHTML(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} ↗</a>`).join('')}</div>` : ''}
      <a class="quest-art" href="${escapeHTML(entry.art.src)}" target="_blank" rel="noopener noreferrer" aria-label="Open full image: ${escapeHTML(entry.name)}"><img src="${escapeHTML(entry.art.src)}" alt="${escapeHTML(entry.art.alt)}" loading="lazy" decoding="async"><span>VIEW FULL IMAGE ↗</span></a>`;
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
        <span class="quest-entry__status ${entry.status === 'Internship' ? 'quest-entry__status--past' : ''}">${escapeHTML(entry.status)}</span>
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
  if (!grid || !filters.length) return;

  grid.innerHTML = PROJECT_ENTRIES.map(entry => {
    const links = entry.links?.map(link => `<a href="${escapeHTML(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} ↗</a>`).join('') || '';
    return `<article class="project-card" data-project-category="${escapeHTML(entry.category)}">
      <a class="project-card__image" href="${escapeHTML(entry.art.src)}" target="_blank" rel="noopener noreferrer" aria-label="View full image of ${escapeHTML(entry.name)}">
        <img src="${escapeHTML(entry.art.src)}" alt="${escapeHTML(entry.art.alt)}" loading="lazy" decoding="async">
      </a>
      <div class="project-card__content">
        <span class="project-card__type">${escapeHTML(entry.role)}</span>
        <h3>${escapeHTML(entry.name)}</h3>
        <p>${escapeHTML(entry.summary)}</p>
        ${links ? `<div class="project-card__links">${links}</div>` : ''}
      </div>
    </article>`;
  }).join('');

  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.projectFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    grid.querySelectorAll('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.projectCategory !== filter;
    });
    window.dispatchEvent(new Event('resize'));
  }));
})();
