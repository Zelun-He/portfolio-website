(() => {
  const canvas = document.getElementById('header-game');
  const stage = document.getElementById('game-stage');
  const frameElement = document.querySelector('.game-frame');
  const toggle = document.getElementById('game-toggle');
  const scoreLabel = document.getElementById('game-score');
  const statusLabel = document.getElementById('game-status');
  if (!canvas || !stage || !frameElement || !toggle || !scoreLabel || !statusLabel) return;
  const gameButtons = [...frameElement.querySelectorAll('.game-mode-switch [data-game-kind]')];

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const COLS = 10, ROWS = 20, CELL = 10, BX = 33, BY = 25;
  const colors = { I: '#77d1bd', O: '#edc66e', T: '#b29bd0', S: '#9aca75', Z: '#d9756b', J: '#85b3c9', L: '#dcaa68' };
  const shapes = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let board, piece, nextKind, bag = [], seed = 72863;
  let score = 0, lines = 0, mode = 'demo', paused = reducedMotion.matches;
  let gameOver = false, gameOverTime = 0, elapsed = 0, gravityTime = 0, aiTime = 0;
  let visible = true, raf = null, lastFrame = 0;
  let gameKind = 'tetris', galagaMode = 'demo', galaga;
  const heldDirections = new Set();

  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function takeFromBag() {
    if (!bag.length) {
      bag = Object.keys(shapes);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }
  const rotate = shape => shape[0].map((_, column) => shape.map(row => row[column]).reverse());
  const copyBoard = source => source.map(row => [...row]);
  function fits(shape, x, y, grid = board) {
    for (let row = 0; row < shape.length; row++) for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const px = x + col, py = y + row;
      if (px < 0 || px >= COLS || py >= ROWS || (py >= 0 && grid[py][px])) return false;
    }
    return true;
  }
  function landingY(shape, x, grid = board) {
    if (!fits(shape, x, 0, grid)) return -1;
    let y = 0;
    while (fits(shape, x, y + 1, grid)) y++;
    return y;
  }
  function clearRows(grid) {
    let removed = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (grid[y].every(Boolean)) {
        grid.splice(y, 1); grid.unshift(Array(COLS).fill(null));
        removed++; y++;
      }
    }
    return removed;
  }
  function rate(grid, cleared) {
    const heights = [];
    let holes = 0;
    for (let x = 0; x < COLS; x++) {
      let found = false, height = 0;
      for (let y = 0; y < ROWS; y++) {
        if (grid[y][x]) { if (!found) height = ROWS - y; found = true; }
        else if (found) holes++;
      }
      heights.push(height);
    }
    const bump = heights.slice(1).reduce((sum, h, i) => sum + Math.abs(h - heights[i]), 0);
    return cleared * 8 - heights.reduce((a, b) => a + b, 0) * .48 - holes * 3.8 - bump * .35;
  }
  function planMove() {
    let best = { value: -Infinity, x: piece.x, rotation: 0 };
    let shape = shapes[piece.kind];
    const rotations = piece.kind === 'O' ? 1 : 4;
    for (let turn = 0; turn < rotations; turn++) {
      for (let x = -shape.length + 1; x < COLS; x++) {
        const y = landingY(shape, x);
        if (y < 0) continue;
        const trial = copyBoard(board);
        shape.forEach((row, ry) => row.forEach((cell, cx) => { if (cell && y + ry >= 0) trial[y + ry][x + cx] = piece.kind; }));
        const cleared = clearRows(trial);
        const value = rate(trial, cleared) + random() * .02;
        if (value > best.value) best = { value, x, rotation: turn };
      }
      shape = rotate(shape);
    }
    piece.targetX = best.x;
    piece.targetRotation = best.rotation;
  }
  function spawn() {
    const kind = nextKind;
    nextKind = takeFromBag();
    const shape = shapes[kind];
    piece = { kind, shape, x: Math.floor((COLS - shape.length) / 2), y: 0, rotation: 0, targetX: 0, targetRotation: 0 };
    if (!fits(shape, piece.x, piece.y)) {
      gameOver = true;
      gameOverTime = 0;
      updateStatus();
      return;
    }
    if (mode === 'demo') planMove();
  }
  function reset(keepMode = false) {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0; lines = 0; elapsed = 0; gravityTime = 0; aiTime = 0;
    gameOver = false; gameOverTime = 0;
    if (!keepMode) mode = 'manual';
    nextKind = takeFromBag();
    spawn();
    scoreLabel.textContent = '000000';
    updateStatus(); render();
  }
  function lock() {
    piece.shape.forEach((row, y) => row.forEach((cell, x) => {
      if (cell && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.kind;
    }));
    const cleared = clearRows(board);
    lines += cleared;
    score += 10 + ([0, 100, 300, 500, 800][cleared] || 800) * (1 + Math.floor(lines / 10));
    scoreLabel.textContent = String(score).padStart(6, '0');
    spawn();
  }
  function move(dx) { if (!gameOver && fits(piece.shape, piece.x + dx, piece.y)) piece.x += dx; }
  function spin() {
    if (gameOver || piece.kind === 'O') return;
    const shape = rotate(piece.shape);
    for (const offset of [0, -1, 1, -2, 2]) {
      if (fits(shape, piece.x + offset, piece.y)) {
        piece.shape = shape; piece.x += offset; piece.rotation = (piece.rotation + 1) % 4;
        return;
      }
    }
  }
  function descend() {
    if (gameOver) return;
    if (fits(piece.shape, piece.x, piece.y + 1)) piece.y++;
    else lock();
  }
  function drop() {
    if (gameOver) return;
    piece.y = landingY(piece.shape, piece.x);
    if (piece.y >= 0) lock();
  }
  function updateStatus() {
    const over = gameKind === 'galaga' ? galaga.over : gameOver;
    const demo = gameKind === 'galaga' ? galagaMode === 'demo' : mode === 'demo';
    statusLabel.textContent = over ? 'GAME OVER • RESTART' : paused ? 'PAUSED' : demo ? 'AUTO PLAY • CLICK TO CONTROL' : gameKind === 'galaga' ? 'A/D MOVE · SPACE FIRE' : 'MANUAL PLAY • WASD / ARROWS';
    toggle.textContent = paused ? '▶ PLAY' : '❚❚ PAUSE';
    toggle.setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
  }
  function playCommand(action) {
    if (gameKind === 'galaga') {
      if (action === 'reset' || galaga.over) resetGalaga(false);
      galagaMode = 'manual'; paused = false;
      if (action === 'left') galaga.playerX = Math.max(37, galaga.playerX - 13);
      if (action === 'right') galaga.playerX = Math.min(323, galaga.playerX + 13);
      if (action === 'fire' || action === 'drop') shootGalaga();
      updateStatus(); render(); schedule(); return;
    }
    if (action === 'reset') { reset(); paused = false; updateStatus(); schedule(); return; }
    if (gameOver) { reset(); paused = false; }
    if (mode !== 'manual') mode = 'manual';
    paused = false;
    if (action === 'left') move(-1);
    if (action === 'right') move(1);
    if (action === 'rotate') spin();
    if (action === 'down') { descend(); score++; scoreLabel.textContent = String(score).padStart(6, '0'); }
    if (action === 'drop') drop();
    updateStatus(); render(); schedule();
  }

  function block(x, y, color, ghost = false, size = CELL) {
    const px = Math.round(x), py = Math.round(y);
    ctx.fillStyle = ghost ? '#607f65' : color;
    ctx.fillRect(px, py, size - 1, size - 1);
    if (!ghost) {
      ctx.fillStyle = '#ffffff4d'; ctx.fillRect(px + 1, py + 1, size - 3, 1);
      ctx.fillStyle = '#071b1380'; ctx.fillRect(px + size - 3, py + 2, 1, size - 3);
    }
  }
  function label(text, x, y, color = '#e5e8ca', size = 9) {
    ctx.font = `bold ${size}px monospace`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function render() {
    if (gameKind === 'galaga') { renderGalaga(); return; }
    ctx.fillStyle = '#142c22'; ctx.fillRect(0, 0, 360, 250);
    for (let i = 0; i < 19; i++) {
      const x = (i * 73 + 17) % 360, y = (i * 47 + 9) % 250;
      ctx.fillStyle = i % 3 ? '#446c48' : '#d2ad60'; ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = '#355c3e'; ctx.fillRect(BX - 4, BY - 4, COLS * CELL + 8, ROWS * CELL + 8);
    ctx.fillStyle = '#9cab73'; ctx.fillRect(BX - 3, BY - 3, COLS * CELL + 6, ROWS * CELL + 6);
    ctx.fillStyle = '#0b2118'; ctx.fillRect(BX, BY, COLS * CELL, ROWS * CELL);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#193b29' : '#173624';
      ctx.fillRect(BX + x * CELL, BY + y * CELL, CELL - 1, CELL - 1);
      if (board[y][x]) block(BX + x * CELL, BY + y * CELL, colors[board[y][x]]);
    }
    if (piece && !gameOver) {
      const ghostY = landingY(piece.shape, piece.x);
      piece.shape.forEach((row, y) => row.forEach((cell, x) => {
        if (!cell) return;
        if (ghostY >= 0 && ghostY + y >= 0) block(BX + (piece.x + x) * CELL, BY + (ghostY + y) * CELL, '', true);
        if (piece.y + y >= 0) block(BX + (piece.x + x) * CELL, BY + (piece.y + y) * CELL, colors[piece.kind]);
      }));
    }
    label('TETRIS', 157, 37, '#9ed6b0', 16);
    label('FALLING BLOCKS', 157, 52, '#bfd3ac', 9);
    ctx.fillStyle = '#284a32'; ctx.fillRect(151, 64, 185, 72);
    ctx.strokeStyle = '#91a976'; ctx.lineWidth = 2; ctx.strokeRect(151, 64, 185, 72);
    label('NEXT', 163, 80, '#f1cf79', 10);
    if (nextKind) {
      const shape = shapes[nextKind], size = 11;
      shape.forEach((row, y) => row.forEach((cell, x) => {
        if (cell) block(175 + x * size, 89 + y * size, colors[nextKind], false, size);
      }));
    }
    label(`SCORE ${String(score).padStart(5, '0')}`, 246, 94, '#f2ead0', 10);
    label(`LINES ${String(lines).padStart(3, '0')}`, 246, 113, '#f2ead0', 10);
    label(mode === 'demo' ? 'AUTO PLAY' : 'MANUAL PLAY', 155, 157, '#f1cf79', 9);
    label('A/D + LEFT/RIGHT MOVE', 155, 175, '#d8e0c0', 8);
    label('W / UP / TAP   ROTATE', 155, 190, '#d8e0c0', 8);
    label('S / DOWN      SOFT DROP', 155, 205, '#d8e0c0', 8);
    label('SPACE         HARD DROP', 155, 220, '#d8e0c0', 8);
    if (paused || gameOver) {
      ctx.fillStyle = '#0a2018e0'; ctx.fillRect(37, 88, 93, 65);
      ctx.strokeStyle = '#9ed6b0'; ctx.lineWidth = 2; ctx.strokeRect(37, 88, 93, 65);
      label(gameOver ? 'GAME' : 'PAUSED', gameOver ? 62 : 59, 116, '#fff0c3', 12);
      if (gameOver) label('OVER', 66, 132, '#dc8d7a', 12);
      else label('PRESS PLAY', 54, 134, '#c0e0b0', 8);
    }
  }
  function update(dt) {
    if (gameKind === 'galaga') { updateGalaga(dt); return; }
    elapsed += dt;
    if (gameOver) {
      gameOverTime += dt;
      if (mode === 'demo' && gameOverTime > 2) { reset(true); updateStatus(); }
      return;
    }
    if (mode === 'demo') {
      aiTime += dt;
      if (aiTime >= .1) {
        aiTime = 0;
        if (piece.rotation !== piece.targetRotation) spin();
        else if (piece.x < piece.targetX) move(1);
        else if (piece.x > piece.targetX) move(-1);
      }
    }
    gravityTime += dt;
    const interval = mode === 'demo' ? .20 : Math.max(.12, .62 - Math.floor(lines / 10) * .05);
    if (gravityTime >= interval) { gravityTime = 0; descend(); }
  }

  const enemyPixels = [
    '1000000001', '0100110010', '0011111100', '0112112110',
    '1111111111', '1011111101', '1001001001', '0010000100'
  ];
  const shipPixels = [
    '000010000', '000111000', '001111100', '011222110',
    '111222111', '110101011', '100000001'
  ];
  function resetGalaga(demo = true) {
    galagaMode = demo ? 'demo' : 'manual';
    galaga = {
      playerX: 180, bullets: [], enemyBullets: [], score: 0, lives: 3, wave: 1,
      time: 0, offset: 0, direction: 1, fireCooldown: 0, enemyFire: 1.3,
      diveTimer: 2.7, invulnerable: 0, over: false, overTime: 0, enemies: []
    };
    spawnWave();
    scoreLabel.textContent = '000000';
  }
  function spawnWave() {
    galaga.enemies = Array.from({ length: 18 }, (_, i) => ({
      col: i % 6, row: Math.floor(i / 6), alive: true, dive: 0
    }));
    galaga.offset = 0; galaga.direction = 1;
    galaga.enemyBullets = []; galaga.diveTimer = 2.7;
  }
  function enemyPosition(enemy) {
    const baseX = 58 + enemy.col * 43 + galaga.offset;
    const baseY = 45 + enemy.row * 31;
    return enemy.dive > 0 ? {
      x: baseX + Math.sin(enemy.dive * 5) * 25,
      y: baseY + enemy.dive * (67 + galaga.wave * 4)
    } : { x: baseX, y: baseY + Math.sin(galaga.time * 3 + enemy.col) * 2 };
  }
  function shootGalaga() {
    if (galaga.over || galaga.fireCooldown > 0) return;
    galaga.bullets.push({ x: galaga.playerX, y: 202 });
    galaga.fireCooldown = .25;
  }
  function hitGalagaShip() {
    if (galaga.invulnerable > 0 || galaga.over) return;
    galaga.lives--;
    galaga.invulnerable = 1.4;
    galaga.enemyBullets = [];
    if (galaga.lives <= 0) { galaga.over = true; updateStatus(); }
  }
  function updateGalaga(dt) {
    galaga.time += dt;
    if (galaga.over) {
      galaga.overTime += dt;
      if (galagaMode === 'demo' && galaga.overTime > 2) { resetGalaga(true); updateStatus(); }
      return;
    }
    galaga.fireCooldown = Math.max(0, galaga.fireCooldown - dt);
    galaga.invulnerable = Math.max(0, galaga.invulnerable - dt);
    if (galagaMode === 'demo') {
      const target = galaga.enemies.find(enemy => enemy.alive && enemy.dive === 0);
      if (target) {
        const dx = enemyPosition(target).x + 10 - galaga.playerX;
        galaga.playerX += Math.sign(dx) * Math.min(Math.abs(dx), 120 * dt);
      }
      shootGalaga();
    } else {
      const direction = Number(heldDirections.has('right')) - Number(heldDirections.has('left'));
      galaga.playerX = Math.max(37, Math.min(323, galaga.playerX + direction * 165 * dt));
    }
    galaga.offset += galaga.direction * (28 + galaga.wave * 3) * dt;
    if (Math.abs(galaga.offset) > 28) galaga.direction *= -1;
    galaga.diveTimer -= dt;
    if (galaga.diveTimer <= 0) {
      const candidates = galaga.enemies.filter(enemy => enemy.alive && enemy.dive === 0);
      if (candidates.length) candidates[Math.floor(random() * candidates.length)].dive = .01;
      galaga.diveTimer = Math.max(1.5, 3.2 - galaga.wave * .12);
    }
    galaga.enemies.forEach(enemy => {
      if (!enemy.alive || !enemy.dive) return;
      enemy.dive += dt;
      const pos = enemyPosition(enemy);
      if (Math.abs(pos.x + 10 - galaga.playerX) < 14 && pos.y > 194 && pos.y < 226) hitGalagaShip();
      if (pos.y > 240) enemy.dive = 0;
    });
    galaga.bullets.forEach(bullet => { bullet.y -= 205 * dt; });
    galaga.bullets = galaga.bullets.filter(bullet => {
      if (bullet.y < 24) return false;
      const enemy = galaga.enemies.find(item => {
        if (!item.alive) return false;
        const pos = enemyPosition(item);
        return bullet.x >= pos.x - 2 && bullet.x <= pos.x + 22 && bullet.y >= pos.y - 2 && bullet.y <= pos.y + 17;
      });
      if (!enemy) return true;
      enemy.alive = false;
      galaga.score += enemy.dive ? 150 : 100;
      scoreLabel.textContent = String(galaga.score).padStart(6, '0');
      return false;
    });
    galaga.enemyFire -= dt;
    if (galaga.enemyFire <= 0) {
      const candidates = galaga.enemies.filter(enemy => enemy.alive);
      if (candidates.length) {
        const pos = enemyPosition(candidates[Math.floor(random() * candidates.length)]);
        galaga.enemyBullets.push({ x: pos.x + 10, y: pos.y + 17 });
      }
      galaga.enemyFire = Math.max(.45, 1.3 - galaga.wave * .08);
    }
    galaga.enemyBullets.forEach(bullet => { bullet.y += (85 + galaga.wave * 7) * dt; });
    galaga.enemyBullets = galaga.enemyBullets.filter(bullet => {
      if (Math.abs(bullet.x - galaga.playerX) < 10 && bullet.y > 205 && bullet.y < 223) {
        hitGalagaShip(); return false;
      }
      return bullet.y < 235;
    });
    if (galaga.enemies.every(enemy => !enemy.alive)) {
      galaga.wave++; spawnWave();
    }
  }
  function drawPixels(rows, x, y, palette) {
    rows.forEach((row, ry) => [...row].forEach((cell, rx) => {
      if (cell === '0') return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect(Math.round(x + rx * 2), Math.round(y + ry * 2), 2, 2);
    }));
  }
  function renderGalaga() {
    ctx.fillStyle = '#071c16'; ctx.fillRect(0, 0, 360, 250);
    for (let i = 0; i < 42; i++) {
      const x = (i * 79 + 17) % 354 + 3;
      const y = (i * 53 + Math.floor(galaga.time * (i % 3 + 1) * 8)) % 220 + 22;
      ctx.fillStyle = i % 4 ? '#578367' : '#e9c578';
      ctx.fillRect(x, y, i % 7 ? 1 : 2, i % 7 ? 1 : 2);
    }
    ctx.strokeStyle = '#6d8d63'; ctx.lineWidth = 2; ctx.strokeRect(25, 24, 310, 207);
    label('GALAGA', 31, 16, '#f0d17f', 11);
    label(`WAVE ${String(galaga.wave).padStart(2, '0')}`, 149, 16, '#bed5ae', 9);
    label(`LIVES ${galaga.lives}`, 267, 16, '#bed5ae', 9);
    galaga.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      const pos = enemyPosition(enemy);
      const colors = enemy.row === 0 ? { '1': '#e9bd65', '2': '#a97948' } : enemy.row === 1 ? { '1': '#98c88d', '2': '#48785a' } : { '1': '#bba3d9', '2': '#765c9d' };
      drawPixels(enemyPixels, pos.x, pos.y, colors);
    });
    ctx.fillStyle = '#f8d987';
    galaga.bullets.forEach(bullet => ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), 2, 7));
    ctx.fillStyle = '#eb806f';
    galaga.enemyBullets.forEach(bullet => ctx.fillRect(Math.round(bullet.x), Math.round(bullet.y), 3, 5));
    if (!galaga.over && (galaga.invulnerable <= 0 || Math.floor(galaga.time * 12) % 2)) {
      drawPixels(shipPixels, galaga.playerX - 9, 205, { '1': '#f0cf75', '2': '#85d2b3' });
    }
    if (paused || galaga.over) {
      ctx.fillStyle = '#0a2018e8'; ctx.fillRect(94, 87, 172, 75);
      ctx.strokeStyle = '#d8bb70'; ctx.lineWidth = 2; ctx.strokeRect(94, 87, 172, 75);
      label(galaga.over ? 'GAME OVER' : 'PAUSED', galaga.over ? 129 : 149, 116, '#fff0c3', 14);
      label(galaga.over ? 'PRESS RESTART' : 'PRESS PLAY', galaga.over ? 137 : 143, 140, '#bfe0b4', 9);
    }
  }
  function tick(now) {
    raf = null;
    if (paused || !visible || document.hidden) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .06) : 0;
    lastFrame = now;
    update(dt); render(); schedule();
  }
  function schedule() {
    if (!paused && visible && !document.hidden && raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }
  function stop() { if (raf !== null) cancelAnimationFrame(raf); raf = null; lastFrame = 0; }
  function switchGame(next) {
    if (next === gameKind || (next !== 'tetris' && next !== 'galaga')) return;
    stop(); heldDirections.clear();
    gameKind = next;
    frameElement.dataset.gameKind = next;
    gameButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gameKind === next)));
    stage.setAttribute('aria-label', next === 'galaga'
      ? 'Galaga game. Use A and D or arrow keys to move, W, Up, or Space to fire, or tap the controls below.'
      : 'Falling-block game. Use W A S D or arrow keys to move and rotate, Space to drop, or tap the controls below.');
    scoreLabel.textContent = String(next === 'galaga' ? galaga.score : score).padStart(6, '0');
    updateStatus(); render(); schedule();
  }
  gameButtons.forEach(button => button.addEventListener('click', () => switchGame(button.dataset.gameKind)));
  frameElement.querySelectorAll('[data-game-action]').forEach(button => {
    button.addEventListener('click', () => playCommand(button.dataset.gameAction));
    if (button.dataset.gameAction === 'left' || button.dataset.gameAction === 'right') {
      button.addEventListener('pointerdown', () => {
        if (gameKind !== 'galaga') return;
        galagaMode = 'manual'; paused = false;
        heldDirections.add(button.dataset.gameAction);
        updateStatus(); schedule();
      });
      for (const name of ['pointerup', 'pointercancel', 'pointerleave']) {
        button.addEventListener(name, () => heldDirections.delete(button.dataset.gameAction));
      }
    }
  });
  stage.addEventListener('click', () => playCommand(gameKind === 'galaga' ? 'fire' : 'rotate'));
  document.addEventListener('keydown', event => {
    if (!frameElement.contains(document.activeElement) || document.activeElement.closest('.game-mode-switch')) return;
    const action = (gameKind === 'galaga' ? {
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'fire', KeyW: 'fire', Space: 'fire'
    } : {
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'rotate', KeyW: 'rotate', ArrowDown: 'down', KeyS: 'down', Space: 'drop'
    })[event.code];
    if (!action) return;
    event.preventDefault();
    if (gameKind === 'galaga' && (action === 'left' || action === 'right')) {
      heldDirections.add(action);
      if (event.repeat) return;
    }
    playCommand(action);
  });
  document.addEventListener('keyup', event => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') heldDirections.delete('left');
    if (event.code === 'ArrowRight' || event.code === 'KeyD') heldDirections.delete('right');
  });
  window.addEventListener('blur', () => heldDirections.clear());
  toggle.addEventListener('click', () => {
    if (gameKind === 'galaga' && galaga.over && galagaMode === 'manual') {
      resetGalaga(false); paused = false; updateStatus(); render(); schedule(); return;
    }
    if (gameKind === 'tetris' && gameOver && mode === 'manual') {
      reset(); paused = false; updateStatus(); render(); schedule(); return;
    }
    paused = !paused; updateStatus();
    if (paused) { stop(); render(); } else schedule();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { heldDirections.clear(); stop(); } else schedule(); });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { paused = true; stop(); updateStatus(); render(); }
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else stop();
  });
  observer.observe(canvas);
  resetGalaga(true);
  nextKind = takeFromBag(); reset(true); updateStatus(); render(); schedule();
})();
