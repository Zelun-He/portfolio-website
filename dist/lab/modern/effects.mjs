const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
const contact = document.querySelector('.contact');
const surfaces = [...document.querySelectorAll('[data-surface]')];
const dialog = document.querySelector('#menu-dialog');
const menuButton = document.querySelector('#menu-toggle');
const soundButton = document.querySelector('#sound-toggle');
const initialHash = location.hash;
let hasInteracted = false;
for (const event of ['wheel', 'pointerdown', 'touchstart', 'keydown']) {
  addEventListener(event, () => { hasInteracted = true; }, { once: true, passive: true });
}
addEventListener('portfolio:layout-ready', () => {
  if (hasInteracted || !initialHash || location.hash !== initialHash) return;
  const destination = document.getElementById(initialHash.slice(1));
  if (destination) requestAnimationFrame(() => {
    if (!hasInteracted) destination.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
});

// Native dialog supplies focus trapping, Escape, and focus restoration.
menuButton.hidden = false;
soundButton.hidden = false;
document.documentElement.classList.add('effects-ready');
menuButton.addEventListener('click', () => dialog.showModal());
dialog.querySelector('.menu-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => dialog.close()));

// Sounds are synthesized locally and require an explicit opt-in.
let audio;
let soundOn = false;
function playTone(frequency = 520) {
  if (!soundOn || !audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, audio.currentTime + 0.09);
  gain.gain.setValueAtTime(0.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.13);
}
soundButton.addEventListener('click', async () => {
  try {
    if (!soundOn) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      await audio.resume();
    }
    soundOn = !soundOn;
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
    if (soundOn) playTone(680);
    else await audio?.suspend();
  } catch {
    soundOn = false;
    soundButton.setAttribute('aria-pressed', 'false');
    soundButton.setAttribute('aria-label', 'Turn sound on');
  }
});
document.addEventListener('click', event => {
  if (event.target.closest('a, button, summary') && !event.target.closest('#sound-toggle')) playTone(480);
});

// Four small, deterministic diagrams. No runtime charting library is needed.
const barChart = document.querySelector('.bar-chart');
for (let i = 0; i < 14; i++) {
  const bar = document.createElement('i');
  bar.style.setProperty('--bar-height', `${35 + ((i * 29) % 50)}px`);
  bar.style.setProperty('--delay', `${i * -0.17}s`);
  barChart.append(bar);
}
const mosaic = document.querySelector('.mosaic-art');
for (let i = 0; i < 32; i++) {
  const tile = document.createElement('i');
  tile.style.setProperty('--tile-opacity', String(0.25 + ((i * 7) % 10) / 13));
  tile.style.setProperty('--delay', `${i * -0.19}s`);
  mosaic.append(tile);
}
const ticks = document.querySelector('.tuner-ticks');
for (let i = 0; i < 23; i++) {
  const tick = document.createElement('i');
  tick.style.setProperty('--tick-height', `${Math.sin(i / 4) * 8}px`);
  ticks.append(tick);
}
const panelObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
}, { threshold: 0.12 });
document.querySelectorAll('.motion-panel').forEach(panel => panelObserver.observe(panel));

// The archive remains a set of regular details elements when JavaScript is off.
const filters = [...document.querySelectorAll('[data-filter]')];
const rows = [...document.querySelectorAll('.archive-row')];
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  let count = 0;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  rows.forEach(row => {
    row.hidden = filter !== 'all' && row.dataset.category !== filter;
    if (!row.hidden) count++;
    else row.open = false;
  });
  document.querySelector('.archive-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
}));

// All animation reads native scroll position; wheel, keyboard, and touch stay native.
let scrollFrame = 0;
let updateStory = () => {};
function updateScroll() {
  scrollFrame = 0;
  const heroBounds = hero.getBoundingClientRect();
  hero.style.setProperty('--hero-scroll', String(clamp(-heroBounds.top / heroBounds.height)));
  const contactBounds = contact.getBoundingClientRect();
  contact.style.setProperty('--contact-progress', String(clamp((innerHeight - contactBounds.top) / innerHeight)));
  let tone = 'dark';
  for (const surface of surfaces) {
    const bounds = surface.getBoundingClientRect();
    if (bounds.top <= 75 && bounds.bottom > 75) tone = surface.dataset.surface;
  }
  header.dataset.tone = tone;
  updateStory();
}
function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
addEventListener('scroll', queueScroll, { passive: true });
addEventListener('resize', queueScroll, { passive: true });
updateScroll();

// A contour sculpture uses compositor transforms, keeping idle motion off the main thread.
function setupSculpture() {
  if (reducedMotion.matches) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  hero.addEventListener('pointermove', event => {
    x = (event.clientX / innerWidth - 0.5) * 9;
    y = (event.clientY / innerHeight - 0.5) * -7;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      hero.style.setProperty('--pointer-x', `${x}deg`);
      hero.style.setProperty('--pointer-y', `${y}deg`);
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0deg');
    hero.style.setProperty('--pointer-y', '0deg');
  });
}

function setupStory() {
  if (reducedMotion.matches) {
    document.documentElement.classList.remove('story-pending');
    return;
  }
  const section = document.querySelector('.story');
  const stage = document.querySelector('.story-stage');
  const chapters = [...document.querySelectorAll('.story-chapter')];
  const buttons = [...document.querySelectorAll('[data-chapter]')];
  const controls = document.querySelector('.story-controls');
  const canvas = document.querySelector('.story-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.documentElement.classList.remove('story-pending');
    return;
  }
  document.documentElement.classList.add('story-enhanced');
  document.documentElement.classList.remove('story-pending');
  controls.hidden = false;
  let selected = -1;
  let progress = 0;
  let frame = 0;
  let visible = false;
  let width = 1;
  let height = 1;
  let tick = 0;
  let lastTime = 0;
  let active = true;
  const count = innerWidth < 700 ? 520 : 950;
  const shapes = [[], [], []];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = i * 2.399963;
    const y = 1 - t * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    shapes[0].push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    const row = Math.floor(i / 30);
    const x = (i % 30) / 29 * 2 - 1;
    const z = row / Math.ceil(count / 30) * 2 - 1;
    shapes[1].push([x * 1.4, Math.sin(x * 4 + z * 3) * 0.35 + z * 0.6, z * 0.5]);
    const a = t * Math.PI * 9;
    const rung = (i % 10) / 9;
    shapes[2].push([Math.sin(a) * 0.6 * (1 - rung * 2), (t - 0.5) * 2.5, Math.cos(a) * 0.6 * (1 - rung * 2)]);
  }
  function draw(time) {
    frame = 0;
    if (!active || !visible || document.hidden) return;
    if (time - lastTime < 45) { frame = requestAnimationFrame(draw); return; }
    tick += Math.min(time - lastTime || 45, 80) / 1000;
    lastTime = time;
    ctx.clearRect(0, 0, width, height);
    const from = Math.min(1, Math.floor(progress));
    const to = from + 1;
    const mix = clamp(progress - from);
    const eased = mix * mix * (3 - 2 * mix);
    const rotation = tick * 0.06 + progress * 0.3;
    const size = Math.min(width, height) * 0.31;
    const points = [];
    for (let i = 0; i < count; i++) {
      const a = shapes[from][i];
      const b = shapes[to][i];
      const x = a[0] + (b[0] - a[0]) * eased;
      const y = a[1] + (b[1] - a[1]) * eased;
      const z = a[2] + (b[2] - a[2]) * eased;
      const px = x * Math.cos(rotation) + z * Math.sin(rotation);
      const pz = -x * Math.sin(rotation) + z * Math.cos(rotation);
      points.push([width * 0.5 + px * size, height * 0.48 + y * size, pz]);
    }
    points.sort((a, b) => a[2] - b[2]);
    for (const p of points) {
      const alpha = clamp(0.25 + (p[2] + 1) * 0.34);
      ctx.fillStyle = `rgba(235,235,235,${alpha})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.1 + (p[2] + 1) * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  updateStory = () => {
    if (!active) return;
    const bounds = section.getBoundingClientRect();
    const range = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const rawProgress = clamp((-bounds.top / range - 0.06) / 0.88) * 2;
    const base = Math.floor(rawProgress);
    const blend = clamp((rawProgress - base - 0.35) / 0.3);
    progress = base + blend * blend * (3 - 2 * blend);
    const index = Math.round(progress);
    for (const [i, chapter] of chapters.entries()) {
      const distance = i - progress;
      chapter.style.opacity = String(clamp(1 - Math.abs(distance) * 1.8));
      chapter.style.transform = `translateY(${distance * 70}px)`;
      chapter.classList.toggle('is-active', i === index);
      chapter.setAttribute('aria-hidden', String(i !== index));
    }
    if (index !== selected) {
      selected = index;
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      const counter = document.querySelector('.story-position');
      counter.firstChild.textContent = `0${index + 1} `;
    }
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const top = scrollY + section.getBoundingClientRect().top;
    const range = Math.max(1, section.offsetHeight - stage.offsetHeight);
    scrollTo({ top: top + range * (0.06 + Number(button.dataset.chapter) / 2 * 0.88), behavior: 'smooth' });
  }));
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && active && !frame) { lastTime = 0; frame = requestAnimationFrame(draw); }
    else if (!visible) { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(stage);
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else if (active && visible && !frame) { lastTime = 0; frame = requestAnimationFrame(draw); }
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    active = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizer.disconnect();
    document.documentElement.classList.remove('story-enhanced');
    controls.hidden = true;
    chapters.forEach(chapter => {
      chapter.style.removeProperty('opacity');
      chapter.style.removeProperty('transform');
      chapter.removeAttribute('aria-hidden');
    });
  });
  resize();
  updateStory();
}

setupSculpture();
setupStory();
queueScroll();
