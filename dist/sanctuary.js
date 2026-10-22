(() => {
  const opener = document.getElementById('forest-secret');
  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero-copy');
  const dialog = document.getElementById('sanctuary-dialog');
  const stage = dialog?.querySelector('.sanctuary-stage');
  const blade = document.getElementById('sanctuary-blade');
  const draw = document.getElementById('sanctuary-draw');
  const restore = document.getElementById('sanctuary-restore');
  const status = document.getElementById('sanctuary-status');
  const note = document.getElementById('sanctuary-note');
  const close = dialog?.querySelector('.sanctuary__close');
  if (!opener || !hero || !copy || !dialog || !stage || !blade || !draw || !restore || !status || !note || !close) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 850px)');
  let revealTimer = null;
  let focusedAction = false;

  function positionScene() {
    const area = hero.getBoundingClientRect();
    const origin = copy.getBoundingClientRect();
    const style = getComputedStyle(hero);
    const scale = Math.max(area.width / 1774, area.height / 887);
    const position = value => value === 'center' ? .5 : (parseFloat(value) || 0) / 100;
    // Project the sword's point onto the same cover image used by the hero.
    opener.style.left = `${area.left - origin.left + (area.width - 1774 * scale) * position(style.backgroundPositionX) + 1288 * scale}px`;
    opener.style.top = `${area.top - origin.top + (area.height - 887 * scale) * position(style.backgroundPositionY) + 329 * scale}px`;
    opener.style.setProperty('--scene-unit', `${compact.matches ? .5 : scale}px`);
    const width = stage.getBoundingClientRect().width;
    if (width) stage.style.setProperty('--scene-unit', `${width / 1000}px`);
  }
  function resetScene() {
    clearTimeout(revealTimer);
    revealTimer = null;
    focusedAction = false;
    stage.dataset.state = 'resting';
    blade.disabled = false;
    draw.disabled = false;
    draw.hidden = false;
    restore.hidden = true;
    status.textContent = 'An old blade rests in the stone.';
    note.textContent = 'Click the sword or choose “Draw the blade.”';
  }
  function finishDrawing() {
    if (!dialog.open || stage.dataset.state !== 'drawing') return;
    clearTimeout(revealTimer);
    revealTimer = null;
    stage.dataset.state = 'revealed';
    status.textContent = 'Master Sword acquired.';
    note.textContent = 'Secret discovered. Thanks for taking the scenic route.';
    draw.hidden = true;
    restore.hidden = false;
    // Keep keyboard focus on an available action when Draw disappears.
    if (focusedAction && (document.activeElement === document.body || document.activeElement === draw || document.activeElement === blade)) restore.focus({ preventScroll: true });
  }
  function drawBlade() {
    if (!dialog.open || stage.dataset.state !== 'resting') return;
    focusedAction = document.activeElement === draw || document.activeElement === blade;
    stage.dataset.state = 'drawing';
    blade.disabled = true;
    draw.disabled = true;
    status.textContent = 'The grove stirs…';
    note.textContent = 'The blade rises from the stone.';
    if (motion.matches) finishDrawing();
    else revealTimer = setTimeout(finishDrawing, 1600);
  }
  opener.addEventListener('click', () => {
    if (dialog.open) return;
    resetScene();
    dialog.showModal();
    document.body.classList.add('sanctuary-open');
    positionScene();
    draw.focus({ preventScroll: true });
  });
  blade.addEventListener('click', drawBlade);
  draw.addEventListener('click', drawBlade);
  restore.addEventListener('click', () => { resetScene(); draw.focus({ preventScroll: true }); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    clearTimeout(revealTimer);
    revealTimer = null;
    document.body.classList.remove('sanctuary-open');
    opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const buttons = [...dialog.querySelectorAll('button:not(:disabled)')].filter(button => button.getClientRects().length && !button.hidden);
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  motion.addEventListener('change', event => { if (event.matches && stage.dataset.state === 'drawing') finishDrawing(); });
  const resize = new ResizeObserver(positionScene);
  resize.observe(hero);
  resize.observe(stage);
  window.addEventListener('resize', positionScene);
  document.fonts?.ready.then(positionScene);
  positionScene();
  opener.hidden = false;
})();
