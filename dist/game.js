(() => {
  const canvas = document.getElementById('header-game');
  const stage = document.getElementById('game-stage');
  const frameElement = document.querySelector('.game-frame');
  const toggle = document.getElementById('game-toggle');
  const scoreLabel = document.getElementById('game-score');
  const statusLabel = document.getElementById('game-status');
  if (!canvas || !stage || !frameElement || !toggle || !scoreLabel || !statusLabel) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const COLS = 10, ROWS = 20, CELL = 10, BX = 33, BY = 25;
  const colors = { I: '#55ead6', O: '#ffd36e', T: '#ad8af1', S: '#71db91', Z: '#fa7c9c', J: '#6f9dff', L: '#ffad74' };
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
    statusLabel.textContent = gameOver ? 'GAME OVER • RESTART TO PLAY' : paused ? 'PAUSED' : mode === 'demo' ? 'AUTO DEMO • SELECT GAME TO PLAY' : 'YOUR TURN • CLEAR THE LINES';
    toggle.textContent = paused ? '▶ PLAY' : '❚❚ PAUSE';
    toggle.setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
  }
  function playCommand(action) {
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
    ctx.fillStyle = ghost ? '#4c6981' : color;
    ctx.fillRect(px, py, size - 1, size - 1);
    if (!ghost) {
      ctx.fillStyle = '#ffffff4d'; ctx.fillRect(px + 1, py + 1, size - 3, 1);
      ctx.fillStyle = '#07142980'; ctx.fillRect(px + size - 3, py + 2, 1, size - 3);
    }
  }
  function label(text, x, y, color = '#c3d6ec', size = 9) {
    ctx.font = `bold ${size}px monospace`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  function render() {
    ctx.fillStyle = '#10213e'; ctx.fillRect(0, 0, 360, 250);
    for (let i = 0; i < 19; i++) {
      const x = (i * 73 + 17) % 360, y = (i * 47 + 9) % 250;
      ctx.fillStyle = i % 3 ? '#395777' : '#a784ce'; ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = '#293957'; ctx.fillRect(BX - 4, BY - 4, COLS * CELL + 8, ROWS * CELL + 8);
    ctx.fillStyle = '#4d7091'; ctx.fillRect(BX - 3, BY - 3, COLS * CELL + 6, ROWS * CELL + 6);
    ctx.fillStyle = '#0a1329'; ctx.fillRect(BX, BY, COLS * CELL, ROWS * CELL);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#132039' : '#14223e';
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
    label('TETRIS', 157, 37, '#5df3d0', 16);
    label('BUILD MODE', 157, 52, '#94adc9', 9);
    ctx.fillStyle = '#213653'; ctx.fillRect(151, 64, 185, 72);
    ctx.strokeStyle = '#6684a8'; ctx.lineWidth = 2; ctx.strokeRect(151, 64, 185, 72);
    label('NEXT', 163, 80, '#ffd176', 10);
    if (nextKind) {
      const shape = shapes[nextKind], size = 11;
      shape.forEach((row, y) => row.forEach((cell, x) => {
        if (cell) block(175 + x * size, 89 + y * size, colors[nextKind], false, size);
      }));
    }
    label(`LEVEL ${String(1 + Math.floor(lines / 10)).padStart(2, '0')}`, 246, 94, '#e7edff', 10);
    label(`LINES ${String(lines).padStart(3, '0')}`, 246, 113, '#e7edff', 10);
    label(mode === 'demo' ? 'DEMO PLAYING' : 'YOU ARE PLAYING', 155, 157, '#ffd176', 9);
    label('A/D + LEFT/RIGHT MOVE', 155, 175, '#9db4ce', 8);
    label('W / UP / TAP   ROTATE', 155, 190, '#9db4ce', 8);
    label('S / DOWN      SOFT DROP', 155, 205, '#9db4ce', 8);
    label('SPACE         HARD DROP', 155, 220, '#9db4ce', 8);
    if (paused || gameOver) {
      ctx.fillStyle = '#08132bd9'; ctx.fillRect(37, 88, 93, 65);
      ctx.strokeStyle = '#5df3d0'; ctx.lineWidth = 2; ctx.strokeRect(37, 88, 93, 65);
      label(gameOver ? 'GAME' : 'PAUSED', gameOver ? 62 : 59, 116, '#f6eccc', 12);
      if (gameOver) label('OVER', 66, 132, '#ff75b9', 12);
      else label('PRESS PLAY', 54, 134, '#9ddccc', 8);
    }
  }
  function update(dt) {
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
  frameElement.querySelectorAll('[data-game-action]').forEach(button => button.addEventListener('click', () => playCommand(button.dataset.gameAction)));
  stage.addEventListener('click', () => playCommand('rotate'));
  document.addEventListener('keydown', event => {
    if (!frameElement.contains(document.activeElement)) return;
    const action = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'rotate', KeyW: 'rotate',
      ArrowDown: 'down', KeyS: 'down',
      Space: 'drop'
    }[event.code];
    if (!action) return;
    event.preventDefault(); playCommand(action);
  });
  toggle.addEventListener('click', () => {
    if (gameOver && mode === 'manual') {
      reset(); paused = false; updateStatus(); render(); schedule(); return;
    }
    paused = !paused; updateStatus();
    if (paused) { stop(); render(); } else schedule();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { paused = true; stop(); updateStatus(); render(); }
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else stop();
  });
  observer.observe(canvas);
  nextKind = takeFromBag(); reset(true); updateStatus(); render(); schedule();
})();
