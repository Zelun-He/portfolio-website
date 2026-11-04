import { SETTINGS, TRAIL_LIFETIME, smoothPointerMotion, vertexShader, fragmentShader } from './hero-field.mjs';

export function mountHeroWarble(hero) {
  const art = hero.querySelector('.hero-art');
  if (!art) return;
  let canvas = art.querySelector('canvas');
  if (!canvas) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let gl, program, vertexBuffer, uniforms, worker;
  let raf = 0, visible = false, elapsed = 0, last = 0;
  let width = 1, height = 1, previousPointer, lastSplat = 0;
  let pointerMotion={x:0,y:0};
  let trails = [];
  const trailData = new Float32Array(40);
  const trailMotion = new Float32Array(20);
  const clearAreas = [...hero.querySelectorAll('.hero-locator, h1, .hero-offer'), document.querySelector('.brand')];
  const clearData = new Float32Array(16);

  function expose(renderer) {
    art.dataset.renderer = renderer;
    art.classList.add('warble-ready');
  }

  function activateFallback() {
    cancelAnimationFrame(raf); raf = 0;
    if (gl) {
      if (program) gl.deleteProgram(program);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      gl = null;
    }
    // A canvas that had a GL context cannot subsequently become a 2D canvas.
    const next = document.createElement('canvas');
    next.className = 'hero-warble-canvas';
    next.setAttribute('aria-hidden', 'true');
    canvas.replaceWith(next);
    canvas = next;
    if (!canvas.transferControlToOffscreen || typeof Worker !== 'function') return;
    try {
      worker = new Worker(new URL('./hero-warble-worker.mjs', import.meta.url), { type: 'module' });
      worker.onmessage = event => {
        if (event.data.type === 'painted') expose('worker');
        if (event.data.type === 'error') stopWorker();
      };
      worker.onerror = stopWorker;
      const surface = canvas.transferControlToOffscreen();
      worker.postMessage({ type: 'init', canvas: surface }, [surface]);
      resize();
      updateState();
    } catch { stopWorker(); }
  }

  function stopWorker() {
    worker?.terminate(); worker = null;
    art.classList.remove('warble-ready');
    art.dataset.renderer = 'poster';
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Header shader compilation failed');
    }
    return shader;
  }

  function initializeGL() {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const vertex = compile(gl.VERTEX_SHADER, vertexShader);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();
      gl.attachShader(program, vertex); gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);
      vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['resolution', 'cssResolution', 'elapsed', 'trails[0]', 'trailMotion[0]', 'clearAreas[0]'].map(name => [name, gl.getUniformLocation(program, name)]));
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); activateFallback(); }, { once: true });
      return true;
    } catch { return false; }
  }

  function resize() {
    const bounds = art.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    width = bounds.width; height = bounds.height;
    const holes = clearAreas.map(element => {
      const rect = element.getBoundingClientRect();
      return [rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height];
    });
    clearData.set(holes.flat());
    if (worker) {
      worker.postMessage({ type: 'resize', width, height, holes, density: Math.min(devicePixelRatio || 1, 1.25, 1600 / Math.max(width,height)) });
    } else if (gl) {
      const scale = Math.min(devicePixelRatio || 1, 1.5, 1800 / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      render();
    }
  }

  function render() {
    if (!gl) return;
    trails = trails.filter(trail => elapsed - trail.time <= TRAIL_LIFETIME);
    trailData.fill(0); trailMotion.fill(0);
    for (let i = 0; i < trails.length; i++) {
      const trail = trails[i];
      trailData.set([trail.x, trail.y, trail.time, 1], i * 4);
      trailMotion.set([trail.dx, trail.dy], i * 2);
    }
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.cssResolution, width, height);
    gl.uniform1f(uniforms.elapsed, elapsed);
    gl.uniform4fv(uniforms['trails[0]'], trailData);
    gl.uniform2fv(uniforms['trailMotion[0]'], trailMotion);
    gl.uniform4fv(uniforms['clearAreas[0]'], clearData);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    expose('webgl');
  }

  function tick(now) {
    raf = 0;
    if (!gl || !visible || document.hidden || motion.matches) return;
    if (now - last >= 33) {
      elapsed += Math.min(now - last || 33, 100) / 1000;
      last = now;
      render();
    }
    raf = requestAnimationFrame(tick);
  }

  function updateState() {
    const running = visible && !document.hidden;
    if(!running||motion.matches){previousPointer=null;pointerMotion={x:0,y:0};}
    if (worker) worker.postMessage({ type: 'state', running, reduced: motion.matches });
    if (motion.matches) { elapsed = 0; trails = []; render(); }
    if (!running || motion.matches) { cancelAnimationFrame(raf); raf = 0; }
    else if (gl && !raf) { last = 0; raf = requestAnimationFrame(tick); }
  }

  hero.addEventListener('pointermove', event => {
    if (motion.matches || !event.isPrimary || event.pointerType==='touch') return;
    const now = performance.now();
    const bounds = art.getBoundingClientRect();
    const point = { x: (event.clientX - bounds.left) / width, y: 1 - (event.clientY - bounds.top) / height, time: now };
    if (previousPointer && now-previousPointer.time<160) {
      const dt = Math.max(8, now - previousPointer.time) / 1000;
      const factor = SETTINGS.pointerForce * SETTINGS.pointerDisplacement;
      const unit=Math.min(width,height);
      pointerMotion=smoothPointerMotion(pointerMotion,(point.x-previousPointer.x)*width/unit/dt*factor,(point.y-previousPointer.y)*height/unit/dt*factor,dt);
      if(now-lastSplat>=32){
        const trail={x:point.x,y:point.y,time:elapsed,dx:pointerMotion.x,dy:pointerMotion.y};
        trails.push(trail);if(trails.length>10)trails.shift();
        worker?.postMessage({type:'pointer',trail});lastSplat=now;
      }
    }else{pointerMotion={x:0,y:0};}
    previousPointer = point;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { previousPointer = null;pointerMotion={x:0,y:0}; });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateState(); });
  observer.observe(hero);
  const resizer = new ResizeObserver(resize);
  resizer.observe(art);
  clearAreas.forEach(element => resizer.observe(element));
  document.fonts.ready.then(resize);
  document.addEventListener('visibilitychange', updateState);
  motion.addEventListener('change', updateState);
  addEventListener('pagehide', event => {
    cancelAnimationFrame(raf); raf = 0;
    worker?.postMessage({ type: 'state', running: false, reduced: motion.matches });
    if (!event.persisted) { worker?.terminate(); observer.disconnect(); resizer.disconnect(); }
  });
  addEventListener('pageshow', updateState);
  if (initializeGL()) resize();
  else activateFallback();
}
