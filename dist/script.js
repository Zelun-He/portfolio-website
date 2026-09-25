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
  { id: 'top', label: 'Start', x: 7.5, y: 66 },
  { id: 'about', label: 'About', x: 30, y: 60 },
  { id: 'work', label: 'Work', x: 55, y: 70 },
  { id: 'projects', label: 'Projects', x: 78, y: 62 },
  { id: 'contact', label: 'Contact', x: 92.5, y: 58 }
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
