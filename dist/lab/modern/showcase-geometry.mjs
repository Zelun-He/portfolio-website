// A camera-space coil shared by the GPU and canvas renderers. No scroll interception.
export const COIL = Object.freeze({
  camera: 8.1, fov: 65.7, turn: 0.73, bend: 0.42,
  aspect: 2.38 / 1.5771, width: 2.38, height: 1.5771,
  print: 0.4, printTall: 0.69, ribbon: 1.5,
  columns: 64, rows: 12, phase: 0.2, spread: 1.28, originX: 0.49, originY: 0.483
});
export const clamp = (x, low = 0, high = 1) => Math.min(high, Math.max(low, x));
const smooth = x => { x = clamp(x); return x*x*(3-2*x); };

export function sceneFor(width, height) {
  const tangent = Math.tan(COIL.fov * Math.PI / 360);
  const blend = smooth((width / height - 0.85) / 0.2);
  const share = COIL.printTall + (COIL.print - COIL.printTall) * blend;
  let radius = 3;
  let halfFrame, size;
  for (let i = 0; i < 24; i++) {
    halfFrame = Math.max(1, COIL.camera + 0.28 - radius) * tangent;
    size = share * 2 * halfFrame / COIL.width;
    const next = Math.max(0.05, halfFrame * 1.5 - COIL.width / 2 * size);
    radius += (next - radius) * 0.55;
  }
  const focal = width / (2 * tangent);
  const scene = {
    width, height, tangent, focal, unit: focal / COIL.camera,
    radius, depth: radius, size, spread: 1 + (COIL.spread-1)*blend,
    pitch: Math.max(0.75, 0.42 * COIL.height * size),
    cardWidth: COIL.width * size, cardHeight: COIL.height * size,
    originY: height * COIL.originY
  };
  // Stand the coil up on narrow screens so adjacent wide surfaces stay separated.
  scene.pitch = Math.max(scene.pitch, 0.75 + 3.15 * (1-blend)*(1-blend));
  return scene;
}

export function framesFor(scene, count, position, clock, spin = 0, lag = 0) {
  return Array.from({ length: count }, (_, index) => {
    // The incoming card rises from the lower left; outgoing work travels upper right.
    let relative = position - index;
    while (relative > count / 2) relative -= count;
    while (relative < -count / 2) relative += count;
    const angle = relative * COIL.turn;
    const facing = Math.cos(angle);
    const profile = smooth(facing / 0.12);
    const bob = Math.sin(clock * 0.48 + index * 1.37) * 0.035;
    return {
      index, relative,
      x: Math.sin(angle) * scene.radius * scene.spread * (1 + Math.abs(spin) * 0.055),
      y: relative * scene.pitch + bob,
      z: Math.cos(angle) * scene.depth - 0.28,
      rx: -relative * 0.01,
      ry: angle - spin * 0.13,
      rz: Math.sin(relative * 0.68) * 0.042 + spin * 0.2,
      curve: COIL.bend,
      flex: clamp(lag, -0.45, 0.45) * scene.cardHeight * 0.16,
      opacity: Math.abs(angle) < Math.PI / 2 + 0.05 ? profile : 0,
      wash: clamp((1 - facing) * 0.22),
    };
  }).filter(frame => frame.opacity > 0.005).sort((a, b) => a.z - b.z);
}

export function localPoint(scene, frame, u, v) {
  const angle = (u - 0.5) * 2 * frame.curve;
  const radius = scene.cardWidth / (2 * frame.curve);
  return [
    Math.sin(angle) * radius,
    (v - 0.5) * scene.cardHeight + Math.sin((u - 0.5) * Math.PI) * frame.flex,
    (Math.cos(angle) - 1) * radius
  ];
}

export function worldPoint(point, frame) {
  let [x, y, z] = point;
  let a = y * Math.cos(frame.rx) - z * Math.sin(frame.rx);
  z = y * Math.sin(frame.rx) + z * Math.cos(frame.rx); y = a;
  a = x * Math.cos(frame.ry) + z * Math.sin(frame.ry);
  z = -x * Math.sin(frame.ry) + z * Math.cos(frame.ry); x = a;
  a = x * Math.cos(frame.rz) - y * Math.sin(frame.rz);
  y = x * Math.sin(frame.rz) + y * Math.cos(frame.rz); x = a;
  return [x + frame.x, y + frame.y, z + frame.z];
}

export function projectPoint(scene, point) {
  const scale = scene.focal / Math.max(0.05, COIL.camera - point[2]);
  return [scene.width * COIL.originX + point[0] * scale, scene.originY - point[1] * scale];
}

export function advanceEdge(state, target, dt) {
  // Exact integration of the slower, damped edge response; stable after a dropped frame.
  const omega = Math.PI * 2 * 3.6, damping = 0.75;
  const frequency = omega * Math.sqrt(1 - damping * damping);
  const offset = state.position - target;
  const b = (state.velocity + damping * omega * offset) / frequency;
  const decay = Math.exp(-damping * omega * dt);
  const cosine = Math.cos(frequency * dt), sine = Math.sin(frequency * dt);
  return {
    position: target + decay * (offset * cosine + b * sine),
    velocity: decay * (-damping * omega * (offset * cosine + b * sine) + frequency * (b * cosine - offset * sine))
  };
}
