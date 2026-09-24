document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });

document.querySelectorAll('.section-heading, .project-card, .about-left, .about-right, .contact-panel').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

const filters = document.querySelectorAll('.project-filter');
const galleryCards = document.querySelectorAll('.gallery-card');
const filterStatus = document.getElementById('project-filter-status');

filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let visible = 0;
    galleryCards.forEach(card => {
      const matches = category === 'all' || card.dataset.categories.split(' ').includes(category);
      card.hidden = !matches;
      if (matches) visible++;
    });
    filterStatus.textContent = category === 'all'
      ? `Showing all ${visible} projects.`
      : `Showing ${visible} ${category === 'cpp' ? 'C++' : category} ${visible === 1 ? 'project' : 'projects'}.`;
    scheduleMapUpdate();
  });
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
  { id: 'about', label: 'About', x: 24.5, y: 60 },
  { id: 'experience', label: 'Experience', x: 42, y: 70 },
  { id: 'internships', label: 'Internships', x: 59, y: 56 },
  { id: 'projects', label: 'Projects', x: 76, y: 68 },
  { id: 'contact', label: 'Contact', x: 92.5, y: 58 }
].map(point => ({
  ...point,
  element: document.getElementById(point.id),
  link: document.querySelector(`[data-map-stop="${point.id}"]`)
}));

let mapFrame = null;
let movementTimeout = null;

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
  mapProgressText.textContent = `${String(active + 1).padStart(2, '0')} / 06`;
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
  mapCharacter.classList.add('is-traveling');
  clearTimeout(movementTimeout);
  movementTimeout = setTimeout(() => mapCharacter.classList.remove('is-traveling'), 160);
}, { passive: true });
window.addEventListener('resize', scheduleMapUpdate);
window.addEventListener('hashchange', scheduleMapUpdate);
window.addEventListener('pageshow', scheduleMapUpdate);
scheduleMapUpdate();
