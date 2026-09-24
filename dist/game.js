(() => {
  const canvas = document.getElementById('header-game');
  const stage = document.getElementById('game-stage');
  const toggle = document.getElementById('game-toggle');
  const scoreLabel = document.getElementById('game-score');
  const statusLabel = document.getElementById('game-status');
  if (!canvas || !stage || !toggle || !scoreLabel || !statusLabel) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height, floor = 205, playerX = 82;
  const worldLength = 940, speed = 66;
  const coins = [170, 310, 438, 574, 716, 850];
  const bugs = [250, 516, 782];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reduceMotion.matches;
  let visible = true, frame = null, lastTime = 0, distance = 0, score = 0;
  let height = 0, velocity = 0, pickupFlash = 0;

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function jump() {
    if (height === 0) velocity = 167;
  }

  function update(dt) {
    const previous = distance + playerX;
    distance += speed * dt;
    const current = distance + playerX;
    const nextBug = bugs.map(x => x + Math.floor(current / worldLength) * worldLength)
      .concat(bugs.map(x => x + (Math.floor(current / worldLength) + 1) * worldLength))
      .find(x => x - current > 38 && x - current < 57);
    if (nextBug && height === 0) jump();

    height = Math.max(0, height + velocity * dt);
    velocity -= 430 * dt;
    if (height === 0) velocity = 0;

    for (let lap = Math.floor(previous / worldLength); lap <= Math.floor(current / worldLength); lap++) {
      for (const coin of coins) {
        const x = lap * worldLength + coin;
        if (previous < x && current >= x) {
          score += 100;
          pickupFlash = .38;
          scoreLabel.textContent = String(score).padStart(6, '0');
        }
      }
    }
    pickupFlash = Math.max(0, pickupFlash - dt);
    statusLabel.textContent = `AUTO PLAY • LEVEL ${String(1 + Math.floor(distance / worldLength)).padStart(2, '0')}`;
  }

  function background() {
    rect(0, 0, W, H, '#10213e');
    for (let i = 0; i < 25; i++) {
      const x = ((i * 79 - distance * .09) % (W + 30) + W + 30) % (W + 30);
      rect(x, 14 + (i * 37) % 116, i % 5 === 0 ? 3 : 2, 2, i % 3 ? '#536e9c' : '#f9d57c');
    }
    rect(282, 31, 30, 30, '#f8d17e');
    rect(278, 37, 4, 18, '#f8d17e'); rect(312, 37, 4, 18, '#f8d17e');
    rect(288, 27, 18, 4, '#f8d17e'); rect(288, 61, 18, 4, '#f8d17e');
    rect(289, 37, 5, 5, '#ffe7a8'); rect(302, 48, 5, 5, '#deaf66');
    for (let i = -1; i < 9; i++) {
      const x = Math.floor(i * 54 - (distance * .27) % 54);
      const top = 122 + (Math.abs(i * 17) % 30);
      rect(x, top, 43, 64, '#1a3456');
      rect(x + 8, top - 13, 6, 13, '#1a3456');
      for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
        if ((i + row + col) % 3 !== 0) rect(x + 7 + col * 12, top + 9 + row * 14, 4, 5, '#46708d');
      }
    }
    rect(0, 187, W, 19, '#294764');
    for (let i = -1; i < 17; i++) {
      const x = Math.floor(i * 24 - (distance * .6) % 24);
      rect(x, 195, 13, 3, '#37627c');
    }
    rect(0, floor, W, H - floor, '#33486b');
    rect(0, floor, W, 5, '#5df3d0');
    for (let i = -1; i < 17; i++) {
      const x = Math.floor(i * 24 - distance % 24);
      rect(x, floor + 5, 22, 3, '#516586');
      rect(x + 6, floor + 17, 4, 4, '#273954');
      rect(x + 16, floor + 29, 4, 4, '#273954');
    }
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#a8fce3';
    ctx.fillText('01 / BUILD • TEST • SHIP', 14, 19);
  }

  function drawCoin(x, y, t) {
    const wobble = Math.round(Math.sin(t * 7 + x) * 2);
    rect(x - 2, y - 10 + wobble, 10, 18, '#dc9d4c');
    rect(x, y - 12 + wobble, 6, 18, '#ffdd78');
    rect(x + 2, y - 7 + wobble, 2, 8, '#fff2bb');
    rect(x - 4, y - 6 + wobble, 2, 7, '#f8c769');
  }

  function drawBug(x) {
    rect(x - 2, floor - 13, 24, 13, '#7e478b');
    rect(x + 1, floor - 18, 18, 5, '#b961ae');
    rect(x + 4, floor - 11, 4, 4, '#fff2bb');
    rect(x + 13, floor - 11, 4, 4, '#fff2bb');
    rect(x + 5, floor - 10, 2, 2, '#151327');
    rect(x + 14, floor - 10, 2, 2, '#151327');
    rect(x, floor - 3, 4, 5, '#532d66');
    rect(x + 17, floor - 3, 4, 5, '#532d66');
  }

  function drawPlayer(t) {
    const x = playerX - 10, y = floor - 31 - Math.round(height);
    if (height > 0) {
      rect(x - 5, floor + 3, 27, 3, '#132846');
      rect(x + 23, y + 12, 3, 3, '#ffd176');
    }
    rect(x + 3, y, 16, 6, '#19152e');
    rect(x, y + 5, 22, 7, '#19152e');
    rect(x + 2, y + 12, 19, 10, '#c79276');
    rect(x + 4, y + 15, 3, 3, '#1e1930');
    rect(x + 15, y + 15, 3, 3, '#1e1930');
    rect(x + 6, y + 21, 16, 11, '#7564bd');
    rect(x + 20, y + 24, 6, 5, '#bc8d76');
    const step = height > 0 ? 2 : (Math.floor(t * 9) % 2) * 3;
    rect(x + 7, y + 31, 5, 4 + step, '#d4a17e');
    rect(x + 17, y + 31, 5, 7 - step, '#d4a17e');
  }

  function render(t = 0) {
    background();
    for (let lap = Math.floor(distance / worldLength); lap <= Math.floor(distance / worldLength) + 1; lap++) {
      for (const coin of coins) {
        const worldX = lap * worldLength + coin;
        const x = Math.round(worldX - distance);
        if (x > -15 && x < W + 15 && worldX > distance + playerX) drawCoin(x, 165, t);
      }
      for (const bug of bugs) {
        const x = Math.round(lap * worldLength + bug - distance);
        if (x > -28 && x < W + 20) drawBug(x);
      }
    }
    drawPlayer(t);
    if (pickupFlash > 0) {
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#ffe58e';
      ctx.fillText('+100!', playerX - 7, floor - 51 - height - (1 - pickupFlash / .38) * 10);
    }
    if (!playing) {
      rect(106, 94, 148, 49, '#0b1731');
      ctx.strokeStyle = '#5df3d0'; ctx.lineWidth = 2; ctx.strokeRect(106, 94, 148, 49);
      ctx.font = 'bold 14px monospace'; ctx.fillStyle = '#f6eccf';
      ctx.fillText('PAUSED', 147, 124);
    }
  }

  function tick(now) {
    frame = null;
    if (!playing || !visible || document.hidden) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    update(dt);
    render(now / 1000);
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (playing && visible && !document.hidden && frame === null) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() { if (frame !== null) cancelAnimationFrame(frame); frame = null; lastTime = 0; }
  function setPlaying(value) {
    playing = value;
    toggle.textContent = value ? '❚❚ PAUSE' : '▶ PLAY';
    toggle.setAttribute('aria-label', value ? 'Pause game' : 'Play game');
    statusLabel.textContent = value ? `AUTO PLAY • LEVEL ${String(1 + Math.floor(distance / worldLength)).padStart(2, '0')}` : 'GAME PAUSED';
    if (value) schedule(); else { stop(); render(); }
  }
  stage.addEventListener('click', jump);
  stage.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); jump(); } });
  toggle.addEventListener('click', () => setPlaying(!playing));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  reduceMotion.addEventListener('change', e => { if (e.matches) setPlaying(false); });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); else stop(); });
  observer.observe(canvas);
  if (!playing) setPlaying(false);
  else { render(); schedule(); }
})();
