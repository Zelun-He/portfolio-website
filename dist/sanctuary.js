(() => {
  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero-copy');
  const relic = document.getElementById('forest-relic');
  const blade = document.getElementById('forest-secret');
  const message = document.getElementById('forest-message');
  const hint = blade?.querySelector('.hero-secret__hint');
  const jake = document.getElementById('jake-brick');
  if (!hero || !copy || !relic || !blade || !message || !hint) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingOutcome = null;
  let attemptTimer = null;

  function positionScene() {
    const area = hero.getBoundingClientRect();
    const origin = copy.getBoundingClientRect();
    const style = getComputedStyle(hero);
    const scale = Math.max(area.width / 1774, area.height / 887);
    const position = value => value === 'center' ? .5 : (parseFloat(value) || 0) / 100;
    const offsetX = (area.width - 1774 * scale) * position(style.backgroundPositionX);
    const offsetY = (area.height - 887 * scale) * position(style.backgroundPositionY);
    // Anchor both discoveries to the existing artwork, including its cover crop.
    relic.style.left = `${area.left - origin.left + offsetX + 1288 * scale}px`;
    relic.style.top = `${area.top - origin.top + offsetY + 329 * scale}px`;
    relic.style.setProperty('--scene-unit', `${scale}px`);
    message.style.left = relic.style.left;
    message.style.top = `${area.top - origin.top + offsetY + 329 * scale + 14}px`;
    if (jake) {
      // Replace the right-hand pillar; Jake is a full yellow masonry course.
      jake.style.left = `${offsetX + 1465 * scale}px`;
      jake.style.top = `${offsetY + 427 * scale}px`;
      jake.style.width = `${112 * scale}px`;
      jake.hidden = false;
    }
  }
  function finishAttempt() {
    if (pendingOutcome === null) return;
    clearTimeout(attemptTimer);
    attemptTimer = null;
    const won = pendingOutcome;
    pendingOutcome = null;
    relic.dataset.state = won ? 'revealed' : 'resting';
    blade.removeAttribute('aria-disabled');
    blade.setAttribute('aria-label', won ? 'Return the Master Sword to the stone' : 'Try to draw the Master Sword from the stone');
    hint.textContent = won ? 'Return the blade' : 'Try again';
    message.textContent = won ? 'You are the hero of legend.' : 'The blade holds fast. Try again.';
  }
  blade.addEventListener('click', () => {
    // Ignore repeated clicks during a pull: one random roll per attempt.
    if (pendingOutcome !== null) return;
    if (relic.dataset.state === 'revealed') {
      relic.dataset.state = 'resting';
      blade.setAttribute('aria-label', 'Try to draw the Master Sword from the stone');
      hint.textContent = 'Draw the blade';
      message.textContent = '';
      return;
    }
    pendingOutcome = Math.random() < .1;
    relic.dataset.state = pendingOutcome ? 'drawing' : 'tugging';
    blade.setAttribute('aria-disabled', 'true');
    message.textContent = '';
    if (motion.matches) finishAttempt();
    else attemptTimer = setTimeout(finishAttempt, pendingOutcome ? 1400 : 650);
  });
  motion.addEventListener('change', event => { if (event.matches) finishAttempt(); });
  const resize = new ResizeObserver(positionScene);
  resize.observe(hero);
  window.addEventListener('resize', positionScene);
  document.fonts?.ready.then(positionScene);
  positionScene();
  relic.hidden = false;
})();
