(() => {
  const world = document.documentElement.dataset.world;
  document.querySelectorAll('[data-world-choice]').forEach(link => {
    if (link.dataset.worldChoice === world) link.setAttribute('aria-current', 'true');
  });
  if (world !== 'magikarp') return;

  document.querySelectorAll('[data-magikarp-asset]').forEach(image => {
    image.src = image.dataset.src;
  });
  const mapHeading = document.querySelector('.map-heading > span:nth-child(2)');
  if (mapHeading) mapHeading.textContent = 'REGION MAP';
  const portrait = document.querySelector('.hero-card__scene img');
  if (portrait) {
    portrait.src = 'Images/magikarp-sprite.webp';
    portrait.alt = 'A pixel-art Magikarp, the main character of this portfolio world';
    portrait.width = 256;
    portrait.height = 256;
  }

  const character = document.getElementById('karp-character');
  const line = document.getElementById('karp-line');
  const scene = document.getElementById('karp-scene');
  const dialogue = document.getElementById('karp-dialogue');
  if (!character || !line || !scene || !dialogue) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const replies = [
    'Magikarp used SPLASH! But nothing happened…',
    'Magikarp used SPLASH! A little enthusiasm goes a long way.',
    'Magikarp used SPLASH! Still making waves.',
    'Magikarp used SPLASH! Every great adventure starts somewhere.'
  ];
  let splashes = 0;
  let timer = null;
  function dismissDialogue() {
    dialogue.hidden = true;
    character.setAttribute('aria-expanded', 'false');
  }
  character.addEventListener('click', () => {
    if (timer !== null) return;
    line.textContent = replies[splashes % replies.length];
    dialogue.hidden = false;
    character.setAttribute('aria-expanded', 'true');
    splashes++;
    if (motion.matches) return;
    scene.classList.add('is-splashing');
    timer = window.setTimeout(() => {
      scene.classList.remove('is-splashing');
      timer = null;
    }, 850);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismissDialogue();
  });
  document.addEventListener('click', event => {
    if (!character.contains(event.target) && !dialogue.contains(event.target)) dismissDialogue();
  });
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    window.clearTimeout(timer);
    timer = null;
    scene.classList.remove('is-splashing');
  });
})();
