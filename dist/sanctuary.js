(() => {
  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero-copy');
  const relic = document.getElementById('forest-relic');
  const blade = document.getElementById('forest-secret');
  const message = document.getElementById('forest-message');
  const hint = blade?.querySelector('.hero-secret__hint');
  const jake = document.getElementById('jake-brick');
  const conversation = document.getElementById('jake-conversation');
  const jakeTrigger = document.getElementById('jake-trigger');
  const jakeBubble = document.getElementById('jake-bubble');
  const jakeLine = document.getElementById('jake-line');
  if (!hero || !copy || !relic || !blade || !message || !hint) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingOutcome = null;
  let attemptTimer = null;
  const introKey = 'portfolio-jake-introduced';
  let introduced = false;
  let lastQuote = -1;
  const quotes = [
    'Dude, suckin’ at somethin’ is the first step towards bein’ sorta good at somethin’.',
    'To live life, you need problems.',
    'Bad, bad biscuits make the baker broke, bro.'
  ];
  try { introduced = window.localStorage.getItem(introKey) === '1'; } catch { /* Keep the first-click state in memory when storage is unavailable. */ }

  function closeJakeBubble() {
    if (!jakeBubble || !jakeTrigger) return;
    jakeBubble.hidden = true;
    jakeTrigger.setAttribute('aria-expanded', 'false');
  }

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
    if (conversation && jakeTrigger && jakeBubble) {
      // The transparent hit target follows the yellow brick, not the whole pillar.
      const x = offsetX + 1457 * scale;
      const y = offsetY + 279 * scale;
      const visible = x >= 22 && x <= area.width - 22 && y >= 22 && y <= area.height - 22;
      conversation.style.left = `${x}px`;
      conversation.style.top = `${y}px`;
      conversation.style.setProperty('--scene-unit', `${scale}px`);
      conversation.hidden = !visible;
      if (!visible) closeJakeBubble();
      const width = Math.min(300, Math.max(0, area.width - 32));
      const left = Math.max(16, Math.min(x - width / 2, area.width - width - 16));
      jakeBubble.style.width = `${width}px`;
      jakeBubble.style.left = `${left - x}px`;
      jakeBubble.style.setProperty('--tail-left', `${Math.max(22, Math.min(width - 22, x - left))}px`);
      jakeBubble.dataset.placement = y - 38 - jakeBubble.getBoundingClientRect().height >= 12 ? 'above' : 'below';
    }
  }
  if (conversation && jakeTrigger && jakeBubble && jakeLine) {
    jakeTrigger.addEventListener('click', () => {
      if (!introduced) {
        jakeLine.textContent = 'Whoa, dude. I’m load-bearing.';
        introduced = true;
        try { window.localStorage.setItem(introKey, '1'); } catch { /* The in-memory flag still prevents repeating the introduction. */ }
      } else {
        const choices = quotes.map((_, index) => index).filter(index => index !== lastQuote);
        lastQuote = choices[Math.floor(Math.random() * choices.length)];
        jakeLine.textContent = quotes[lastQuote];
      }
      jakeBubble.hidden = false;
      jakeTrigger.setAttribute('aria-expanded', 'true');
      positionScene();
    });
    document.addEventListener('click', event => {
      if (!conversation.contains(event.target)) closeJakeBubble();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeJakeBubble();
    });
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
