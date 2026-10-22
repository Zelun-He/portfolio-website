document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });

document.querySelectorAll('.quest-frame, .hero-card, .about__story, .inventory, .projects-title, .contact-title, .contact-menu').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

const contactOptions = [...document.querySelectorAll('[data-contact-option]')];
function selectContactOption(index) {
  contactOptions.forEach((option, optionIndex) => {
    option.classList.toggle('is-selected', index === optionIndex);
  });
}
contactOptions.forEach((option, index) => {
  option.addEventListener('pointerenter', () => selectContactOption(index));
  option.addEventListener('focus', () => selectContactOption(index));
});

const contactSection = document.getElementById('contact');
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]')) return;
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const active = document.activeElement;
  if (active?.isContentEditable || active?.matches('input, textarea, select') || active?.closest('.game-frame, .quest-work')) return;
  const rect = contactSection.getBoundingClientRect();
  const contactInView = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
  if (!contactOptions.includes(active) && !contactInView) return;

  event.preventDefault();
  const selected = contactOptions.findIndex(option => option.classList.contains('is-selected'));
  const direction = event.key === 'ArrowDown' ? 1 : -1;
  const next = ((selected < 0 ? 0 : selected) + direction + contactOptions.length) % contactOptions.length;
  selectContactOption(next);
  contactOptions[next].focus({ preventScroll: true });
});

const mapBar = document.querySelector('.journey-map');
const mapCharacter = document.getElementById('map-character');
const mapRouteComplete = document.getElementById('map-route-complete');
const mapCurrentLabel = document.getElementById('map-current-label');
const mapProgressText = document.getElementById('map-progress-text');
const mapProgressTrack = document.getElementById('map-progress-track');
const mapProgressFill = document.getElementById('map-progress-fill');
const waypoints = [
  { id: 'top', label: 'Start', x: 10, y: 60 },
  { id: 'work', label: 'Experience', x: 30, y: 58 },
  { id: 'projects', label: 'Projects', x: 50, y: 64 },
  { id: 'about', label: 'About', x: 70, y: 60 },
  { id: 'contact', label: 'Contact', x: 90, y: 58 }
].map(point => ({
  ...point,
  element: document.getElementById(point.id),
  link: document.querySelector(`[data-map-stop="${point.id}"]`)
}));

let mapFrame = null;
let movementTimeout = null;
let runFrameInterval = null;
let runFrame = 0;
let lastScrollY = window.scrollY;
const idleSprite = 'map-character-idle.png';
const runSprites = ['map-character-run-a.png', 'map-character-run-b.png'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
runSprites.forEach(src => { const image = new Image(); image.src = src; });

function stopCharacterRunning() {
  clearInterval(runFrameInterval);
  runFrameInterval = null;
  mapCharacter.src = idleSprite;
  mapCharacter.classList.remove('is-traveling');
}

function updateMap() {
  mapFrame = null;
  if (!mapBar || !mapCharacter || waypoints.some(point => !point.element || !point.link)) return;

  const positions = waypoints.map(point => point.element.getBoundingClientRect().top + window.scrollY);
  const focusY = window.scrollY + mapBar.offsetHeight + 13;
  let segment = 0;
  let portion = 0;
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    segment = waypoints.length - 1;
  } else {
    while (segment < positions.length - 2 && focusY >= positions[segment + 1]) segment++;
    const span = positions[segment + 1] - positions[segment];
    portion = Math.max(0, Math.min(1, span > 0 ? (focusY - positions[segment]) / span : 0));
  }

  const next = Math.min(segment + 1, waypoints.length - 1);
  const x = waypoints[segment].x + (waypoints[next].x - waypoints[segment].x) * portion;
  const y = waypoints[segment].y + (waypoints[next].y - waypoints[segment].y) * portion;
  mapCharacter.style.left = `${x}%`;
  mapCharacter.style.top = `${y}%`;
  mapRouteComplete.setAttribute('points', [
    ...waypoints.slice(0, segment + 1).map(point => `${point.x * 10},${point.y}`),
    `${x * 10},${y}`
  ].join(' '));

  const active = Math.min(waypoints.length - 1, Math.round(segment + portion));
  waypoints.forEach((point, index) => {
    if (index === active) point.link.setAttribute('aria-current', 'location');
    else point.link.removeAttribute('aria-current');
  });
  mapCurrentLabel.textContent = waypoints[active].label.toUpperCase();
  mapProgressText.textContent = `${String(active + 1).padStart(2, '0')} / ${String(waypoints.length).padStart(2, '0')}`;
  const progress = Math.round(((segment + portion) / (waypoints.length - 1)) * 100);
  mapProgressFill.style.width = `${progress}%`;
  mapProgressTrack.setAttribute('aria-valuenow', String(progress));
  mapProgressTrack.setAttribute('aria-valuetext', waypoints[active].label);
}

function scheduleMapUpdate() {
  if (mapFrame === null) mapFrame = requestAnimationFrame(updateMap);
}

window.addEventListener('scroll', () => {
  scheduleMapUpdate();
  const scrollY = window.scrollY;
  if (scrollY === lastScrollY) return;
  mapCharacter.style.setProperty('--facing', scrollY < lastScrollY ? -1 : 1);
  lastScrollY = scrollY;
  if (reducedMotion.matches) return;
  mapCharacter.classList.add('is-traveling');
  if (runFrameInterval === null) {
    runFrame = 0;
    mapCharacter.src = runSprites[runFrame];
    runFrameInterval = setInterval(() => {
      runFrame = (runFrame + 1) % runSprites.length;
      mapCharacter.src = runSprites[runFrame];
    }, 110);
  }
  clearTimeout(movementTimeout);
  movementTimeout = setTimeout(stopCharacterRunning, 180);
}, { passive: true });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    clearTimeout(movementTimeout);
    stopCharacterRunning();
  }
});
window.addEventListener('resize', scheduleMapUpdate);
window.addEventListener('hashchange', scheduleMapUpdate);
window.addEventListener('pageshow', scheduleMapUpdate);
scheduleMapUpdate();

// Expanded previews, filters, image loads, and fonts can change the route lengths.
if ('ResizeObserver' in window) {
  const mapSectionObserver = new ResizeObserver(scheduleMapUpdate);
  waypoints.forEach(point => { if (point.element) mapSectionObserver.observe(point.element); });
}

// Native modal behavior keeps keyboard focus inside the screenshot viewer.
(() => {
  const viewer = document.getElementById('image-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;
  const image = document.getElementById('image-viewer-image');
  const title = document.getElementById('image-viewer-title');
  const caption = document.getElementById('image-viewer-caption');
  const original = document.getElementById('image-viewer-original');
  let trigger = null;

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-image-viewer]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const project = link.closest('.project-card, .featured-card, .quest-detail, .next-project');
    const preview = link.querySelector('img') || project?.querySelector('img');
    const name = project?.querySelector('h3')?.textContent.trim() || 'Project screenshot';
    const description = preview?.alt || name;
    event.preventDefault();
    trigger = link;
    title.textContent = name;
    caption.textContent = description;
    image.alt = description;
    image.src = link.href;
    original.href = link.href;
    viewer.showModal();
    document.body.classList.add('image-viewer-open');
  });

  viewer.querySelector('.image-viewer__close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...viewer.querySelectorAll('button:not([disabled]), a[href]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    // A queued close event must not clear a newly opened screenshot.
    if (viewer.open) return;
    document.body.classList.remove('image-viewer-open');
    image.removeAttribute('src');
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    trigger = null;
  });
})();
