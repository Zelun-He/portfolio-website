// Scroll stays native. The gallery is progressive enhancement over the project list.
const work = document.querySelector('.work');
const stage = document.querySelector('.gallery-stage');
const canvas = document.querySelector('.gallery-canvas');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const articles = [...document.querySelectorAll('.project')];
const projects = articles.map(article => ({
  title: article.querySelector('h3').textContent,
  type: article.dataset.type,
  description: article.querySelector('.project-description').textContent,
  link: article.querySelector('.project-link').href,
  label: article.dataset.linkLabel,
  image: article.querySelector('img').src
}));
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

async function enhanceGallery() {
  if (motion.matches) {
    document.documentElement.classList.remove('gallery-pending');
    return;
  }
  let gl = window.innerWidth > 700 ? canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, powerPreference: 'low-power' }) : null;

  let raf = 0;
  let stopped = false;
  let visible = false;
  let position = 0;
  let target = 0;
  let selected = -1;
  let width = 0;
  let height = 0;
  let lastTime = 0;
  let render;
  const readout = document.querySelector('.gallery-readout');
  const controls = document.querySelector('.gallery-controls');
  const dots = document.querySelector('.project-dots');
  const previous = document.querySelector('#previous-project');
  const next = document.querySelector('#next-project');
  const cssGallery = document.createElement('div');
  cssGallery.className = 'css-gallery';
  cssGallery.setAttribute('aria-hidden', 'true');
  const cssFrames = projects.map(project => {
    const frame = document.createElement('div');
    frame.className = 'css-project';
    frame.style.visibility = 'hidden';
    const bar = document.createElement('div');
    bar.className = 'css-project-bar';
    bar.textContent = new URL(project.link).hostname.replace('www.', '');
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = '';
    image.decoding = 'async';
    frame.append(bar, image);
    cssGallery.append(frame);
    return frame;
  });
  stage.append(cssGallery);
  let uniforms;
  let vertices;
  let orderedTextures;
  const textures = [];
  const buffers = [];
  const shaders = [];
  let program;
  let observer;
  let resizeObserver;

  function fallback() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    observer?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    document.documentElement.classList.remove('gallery-enhanced');
    document.documentElement.classList.remove('gallery-pending');
    readout.hidden = true;
    controls.hidden = true;
    canvas.hidden = true;
    cssGallery.remove();
    if (!gl) return;
    for (const texture of textures) gl.deleteTexture(texture);
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    for (const shader of shaders) gl.deleteShader(shader);
    if (program) gl.deleteProgram(program);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    gl = null;
    canvas.hidden = true;
    cssGallery.hidden = false;
    queueFrame();
  });
  motion.addEventListener('change', event => { if (event.matches) fallback(); });

  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader unavailable');
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
    return shader;
  }

  try {
    try {
      if (gl) {
        const vertex = compile(gl.VERTEX_SHADER, `
          attribute vec2 a_position;
          uniform vec2 u_view;
          uniform vec2 u_size;
          uniform vec3 u_offset;
          uniform float u_angle;
          uniform float u_camera;
          varying vec2 v_uv;
          void main() {
            v_uv = a_position + 0.5;
            // Subdivided plane gently wraps around a vertical cylinder.
            float bend = a_position.x * 0.68;
            float radius = u_size.x / 0.68;
            float x = sin(bend) * radius;
            float z = (cos(bend) - 1.0) * radius;
            vec3 world = vec3(
              x * cos(u_angle) + z * sin(u_angle),
              a_position.y * u_size.y,
              -x * sin(u_angle) + z * cos(u_angle)
            ) + u_offset;
            float distance = u_camera - world.z;
            gl_Position = vec4(world.x * 2.0 / u_view.x * u_camera,
                               world.y * 2.0 / u_view.y * u_camera,
                               0.0, distance);
          }
        `);
        const fragment = compile(gl.FRAGMENT_SHADER, `
          precision mediump float;
          uniform sampler2D u_image;
          uniform float u_opacity;
          varying vec2 v_uv;
          void main() {
            vec4 color = texture2D(u_image, v_uv);
            gl_FragColor = vec4(color.rgb, color.a * u_opacity);
          }
        `);
        program = gl.createProgram();
        if (!program) throw new Error('Program unavailable');
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed');
        gl.useProgram(program);

        vertices = [];
        const columns = 48;
        for (let column = 0; column < columns; column++) {
          const left = column / columns - 0.5;
          const right = (column + 1) / columns - 0.5;
          vertices.push(left, -0.5, right, -0.5, left, 0.5, left, 0.5, right, -0.5, right, 0.5);
        }
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error('Buffer unavailable');
        buffers.push(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        const attribute = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        uniforms = Object.fromEntries(['view', 'size', 'offset', 'angle', 'camera', 'image', 'opacity'].map(name => [name, gl.getUniformLocation(program, `u_${name}`)]));
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.clearColor(0, 0, 0, 0);

        const results = await Promise.allSettled(projects.map(async project => {
          const image = new Image();
          image.src = project.image;
          await image.decode();
          if (stopped) return;
          // A small browser frame and a soft shadow are baked into an in-memory texture.
          const surface = document.createElement('canvas');
          surface.width = 1280;
          surface.height = 800;
          const ctx = surface.getContext('2d');
          if (!ctx) throw new Error('Texture surface unavailable');
          ctx.shadowColor = 'rgba(35,46,28,0.2)';
          ctx.shadowBlur = 22;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = '#f9faf6';
          ctx.beginPath();
          ctx.roundRect(26, 20, 1228, 742, 13);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(26, 20, 1228, 742, 13);
          ctx.clip();
          ctx.fillStyle = '#f9faf6';
          ctx.fillRect(26, 20, 1228, 742);
          ctx.fillStyle = '#d2d7cd';
          for (let dot = 0; dot < 3; dot++) {
            ctx.beginPath();
            ctx.arc(48 + dot * 15, 41, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#68725f';
          ctx.fillText(new URL(project.link).hostname.replace('www.', ''), 640, 46);
          const scale = Math.min(1228 / image.naturalWidth, 700 / image.naturalHeight);
          const iw = image.naturalWidth * scale;
          const ih = image.naturalHeight * scale;
          ctx.drawImage(image, 26 + (1228 - iw) / 2, 62 + (700 - ih) / 2, iw, ih);
          ctx.restore();
          const texture = gl.createTexture();
          if (!texture) throw new Error('Texture unavailable');
          textures.push(texture);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          return texture;
        }));
        if (stopped) return;
        if (results.some(result => result.status === 'rejected')) throw new Error('Project preview unavailable');
        orderedTextures = results.map(result => result.value);
      }
    } catch {
      // A shader or texture failure should retain the CSS animation.
      if (gl) {
        for (const texture of textures) gl.deleteTexture(texture);
        for (const buffer of buffers) gl.deleteBuffer(buffer);
        for (const shader of shaders) gl.deleteShader(shader);
        if (program) gl.deleteProgram(program);
      }
      gl = null;
    }
    canvas.hidden = !gl;
    cssGallery.hidden = !!gl;

    const dotButtons = projects.map((project, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-dot';
      button.setAttribute('aria-label', `Show ${project.title}`);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => goToProject(index));
      dots.append(button);
      return button;
    });

    function setSelected(index) {
      if (selected === index) return;
      selected = index;
      const project = projects[index];
      document.querySelector('#active-type').textContent = project.type;
      document.querySelector('#active-title').textContent = project.title;
      document.querySelector('#active-description').textContent = project.description;
      const link = document.querySelector('#active-link');
      link.href = project.link;
      link.textContent = `${project.label} ↗`;
      document.querySelector('#project-number').textContent = String(index + 1).padStart(2, '0');
      for (const [i, button] of dotButtons.entries()) button.setAttribute('aria-pressed', String(i === index));
      previous.disabled = index === 0;
      next.disabled = index === projects.length - 1;
    }

    function draw(time) {
      raf = 0;
      if (stopped || document.hidden || !visible) return;
      updateTarget();
      const dt = Math.min((time - (lastTime || time - 16)) / 1000, 0.05);
      lastTime = time;
      position += (target - position) * (1 - Math.exp(-12 * dt));
      if (Math.abs(target - position) < 0.0005) position = target;
      setSelected(clamp(Math.round(position), 0, projects.length - 1));
      const mobile = width < 600;
      const cardWidth = Math.min(width * (mobile ? 0.88 : 0.48), height * (mobile ? 0.64 : 0.98), 850);
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uniforms.view, width, height);
        gl.uniform1f(uniforms.camera, mobile ? width * 2.4 : width * 1.1);
        gl.uniform1i(uniforms.image, 0);
        gl.uniform2f(uniforms.size, cardWidth, cardWidth * 0.625);
      }
      if (!gl) cssFrames.forEach(frame => { frame.style.visibility = 'hidden'; });
      // Painter's order keeps the nearer cards in front without a depth buffer.
      const frames = projects.map((project, index) => {
        let difference = index - position;
        // Neighbours wrap around the arc, while the scroll narrative stays finite.
        if (difference > projects.length / 2) difference -= projects.length;
        if (difference < -projects.length / 2) difference += projects.length;
        const angle = difference * (mobile ? 1.05 : 0.92);
        return { index, difference, angle, z: (Math.cos(angle) - 1) * width * 0.72 };
      }).filter(frame => Math.abs(frame.difference) < 2.15).sort((a, b) => a.z - b.z);
      for (const frame of frames) {
        const radius = width * (mobile ? 1.04 : 0.61);
        const x = Math.sin(frame.angle) * radius;
        // A little vertical staggering makes the arc feel spatial, not like a slider.
        const y = height * (mobile ? 0.07 : 0.025) + Math.sin(frame.angle * 1.3) * height * 0.075;
        if (!gl) {
          const element = cssFrames[frame.index];
          element.style.visibility = 'visible';
          element.style.width = `${cardWidth}px`;
          element.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${-y}px, ${frame.z}px) rotateY(${frame.angle * 0.82}rad)`;
          element.style.opacity = String(clamp(2.15 - Math.abs(frame.difference), 0, 1));
          continue;
        }
        gl.uniform3f(uniforms.offset, x, y, frame.z);
        gl.uniform1f(uniforms.angle, frame.angle * 0.82);
        gl.uniform1f(uniforms.opacity, clamp(2.15 - Math.abs(frame.difference), 0, 1));
        gl.bindTexture(gl.TEXTURE_2D, orderedTextures[frame.index]);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
      }
      if (position !== target) queueFrame();
    }

    function resize() {
      if (stopped) return;
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
      cssGallery.style.perspective = `${width < 600 ? width * 2.4 : width * 1.1}px`;
      queueFrame();
    }

    // Keep these closures available to the lifecycle handlers below.
    render = draw;
    document.documentElement.classList.add('gallery-enhanced');
    document.documentElement.classList.remove('gallery-pending');
    dispatchEvent(new Event('portfolio:layout-ready'));
    readout.hidden = false;
    controls.hidden = false;
    setSelected(0);
    previous.addEventListener('click', () => goToProject(selected - 1));
    next.addEventListener('click', () => goToProject(selected + 1));
    observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) {
        updateTarget();
        position = target;
        lastTime = 0;
        queueFrame();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(stage);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    resize();
  } catch {
    fallback();
  }

  // Function declarations are hoisted; rendering is assigned only after setup succeeds.
  function updateTarget() {
    const bounds = work.getBoundingClientRect();
    const range = Math.max(1, work.offsetHeight - stage.offsetHeight);
    const progress = clamp(-bounds.top / range, 0, 1);
    target = clamp((progress - 0.06) / 0.88, 0, 1) * (projects.length - 1);
  }
  function queueFrame() {
    if (!raf && !stopped && visible && !document.hidden && render) raf = requestAnimationFrame(render);
  }
  function onScroll() { queueFrame(); }
  function onVisibility() {
    if (!document.hidden) { lastTime = 0; queueFrame(); }
    else { cancelAnimationFrame(raf); raf = 0; }
  }
  function goToProject(index) {
    if (window.location.hash === '#project-index') history.replaceState(null, '', '#work');
    const destination = clamp(index, 0, projects.length - 1);
    const top = window.scrollY + work.getBoundingClientRect().top;
    const range = Math.max(1, work.offsetHeight - stage.offsetHeight);
    window.scrollTo({ top: top + range * (0.06 + destination / (projects.length - 1) * 0.88), behavior: 'smooth' });
  }
}

enhanceGallery();
