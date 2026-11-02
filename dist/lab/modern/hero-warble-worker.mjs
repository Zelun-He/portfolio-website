import { shadeAt, orbAt } from './hero-field.mjs';

let canvas, context, pixels, width = 0, height = 0, density = 1;
let field, fieldContext, fieldWidth = 0, fieldHeight = 0;
let time = 0, running = false, reduced = false;
let frame = 0, last = 0, trails = [];
let holes = [];
const smooth = x => { x = Math.min(1, Math.max(0, x)); return x*x*(3-2*x); };
const schedule = typeof requestAnimationFrame === 'function'
  ? callback => requestAnimationFrame(callback)
  : callback => setTimeout(() => callback(performance.now()), 67);
const cancel = typeof cancelAnimationFrame === 'function'
  ? frame => cancelAnimationFrame(frame)
  : frame => clearTimeout(frame);

function paint() {
  const data = pixels.data;
  for (let y = 0; y < fieldHeight; y++) {
    for (let x = 0; x < fieldWidth; x++) {
      const tone = shadeAt(x + 0.5, y + 0.5, fieldWidth, fieldHeight, time, trails);
      const index = (y * fieldWidth + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = tone;
      data[index + 3] = 255;
    }
  }
  fieldContext.putImageData(pixels, 0, 0);
  context.setTransform(density, 0, 0, density, 0, 0);
  context.drawImage(field, 0, 0, width, height);
  context.fillStyle = '#fafafa';
  context.globalAlpha = 0.95;
  context.beginPath();
  const pitch = 6.93;
  for (let y = pitch / 2; y < height * 0.65; y += pitch) {
    for (let x = pitch / 2; x < width * 0.71; x += pitch) {
      let tone = orbAt(x, y, width, height, time);
      for (const [left, top, w, h] of holes) {
        const dx = Math.max(left-x,x-left-w,0), dy = Math.max(top-y,y-top-h,0);
        tone *= smooth((Math.hypot(dx,dy)-7)/22);
      }
      if (tone <= 0.003) continue;
      const radius = pitch * (0.1 + 0.7 * Math.pow(tone, 1.6));
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, Math.PI * 2);
    }
  }
  context.fill();
  context.globalAlpha = 1;
}

function tick(now) {
  frame = 0;
  if (!running || reduced) return;
  if (now - last >= 66) {
    time += Math.min(now - last || 66, 100) / 1000;
    last = now;
    trails = trails.filter(trail => time - trail.time < 2.3);
    paint();
  }
  frame = schedule(tick);
}

onmessage = ({ data }) => {
  if (data.type === 'init') {
    canvas = data.canvas;
    context = canvas.getContext('2d', { alpha: false });
    field = new OffscreenCanvas(1, 1);
    fieldContext = field.getContext('2d', { alpha: false });
    if (!context) { postMessage({ type: 'error' }); return; }
  }
  if (!context) return;
  if (data.type === 'resize') {
    width = data.width; height = data.height;
    holes = data.holes;
    density = data.density;
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    const scale = Math.min(1, 140 / Math.min(width, height), 224 / Math.max(width, height));
    fieldWidth = Math.max(1, Math.round(width * scale));
    fieldHeight = Math.max(1, Math.round(height * scale));
    field.width = fieldWidth; field.height = fieldHeight;
    pixels = fieldContext.createImageData(fieldWidth, fieldHeight);
    paint();
    postMessage({ type: 'painted' });
  }
  if (data.type === 'pointer') {
    trails.push({ ...data.trail, time });
    if (trails.length > 10) trails.shift();
  }
  if (data.type === 'state') {
    running = data.running;
    reduced = data.reduced;
    if (reduced) { time = 0; trails = []; if (pixels) paint(); }
    if (running && !reduced && !frame) { last = 0; frame = schedule(tick); }
    if (!running || reduced) { cancel(frame); frame = 0; }
  }
};
