// A camera-space coil shared by the GPU and canvas renderers. No scroll interception.
export const COIL = Object.freeze({
  camera: 8.1, fov: 65.7, turn: 0.73, bend: 0.42,
  aspect: 2.38 / 1.5771, width: 2.38, height: 1.5771,
  print: 0.33, printTall: 0.69, ribbon: 1.5,
  columns: 64, rows: 12, phase: 0.2, entry: -2.6, scrollStart: 0.4, cardStep: 0.75, hold: 0.25, expand: 1.25, tail: 1, spread: 1, originX: 0.49, originY: 0.483
});
export function travelForProject(index) {
  return COIL.scrollStart + (index + COIL.phase - COIL.entry) * COIL.cardStep;
}
export function positionForTravel(travel, count) {
  return Math.min(count-1+COIL.phase, Math.max(COIL.entry, COIL.entry+(travel-COIL.scrollStart)/COIL.cardStep));
}
export function runwayForProjects(count) {
  return travelForProject(count-1) + COIL.hold + COIL.expand + COIL.tail + 1;
}
export function handoffForTravel(travel,count) {
  return clamp((travel-travelForProject(count-1)-COIL.hold)/COIL.expand);
}
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

export function framesFor(scene, count, position, clock, spin = 0, lag = 0, aspects = []) {
  return Array.from({ length: count }, (_, index) => {
    // The incoming card rises from the lower left; outgoing work travels upper right.
    // An unwrapped helix brings each image through the frame naturally, in order.
    const relative = position - index;
    const height = scene.cardWidth / (aspects[index] || COIL.aspect);
    const angle = relative * COIL.turn;
    const facing = Math.cos(angle);
    const profile = smooth(facing / 0.12);
    const bob = Math.sin(clock * 0.48 + index * 1.37) * 0.035;
    return {
      index, relative, height,
      x: Math.sin(angle) * scene.radius * scene.spread * (1 + Math.abs(spin) * 0.055),
      y: relative * scene.pitch + bob,
      z: Math.cos(angle) * scene.depth - 0.28,
      rx: -relative * 0.01,
      ry: angle - spin * 0.13,
      rz: Math.sin(relative * 0.68) * 0.042 + spin * 0.2,
      curve: COIL.bend,
      flex: clamp(lag, -0.45, 0.45) * height * 0.16,
      opacity: Math.abs(angle) < Math.PI / 2 + 0.05 ? profile : 0,
      wash: clamp((1 - facing) * 0.22),
    };
  }).filter(frame => frame.opacity > 0.005).sort((a, b) => a.z - b.z);
}

// Straighten the last surface, preserve its image aspect, and let it cover the view.
export function expandFinalFrame(scene,frames,lastIndex,progress,aspect=COIL.aspect){
  const amount=smooth(progress);
  if(!amount)return frames;
  const mix=(from,to)=>from+(to-from)*amount;
  const z=scene.depth-.28;
  const scale=scene.focal/(COIL.camera-z);
  const coverWidth=Math.max(scene.width,scene.height*aspect)*1.08/scale;
  return frames.map(frame=>frame.index!==lastIndex?frame:{
    ...frame,
    width:mix(scene.cardWidth,coverWidth),
    height:mix(frame.height,coverWidth/aspect),
    x:mix(frame.x,(.5-COIL.originX)*scene.width/scale),
    y:mix(frame.y,(COIL.originY-.5)*scene.height/scale),
    z:mix(frame.z,z),
    rx:frame.rx*(1-amount),ry:frame.ry*(1-amount),rz:frame.rz*(1-amount),
    curve:mix(frame.curve,.001),flex:frame.flex*(1-amount),wash:frame.wash*(1-amount),opacity:1
  }).sort((a,b)=>a.z-b.z);
}

export function localPoint(scene, frame, u, v) {
  const angle = (u - 0.5) * 2 * frame.curve;
  const radius = (frame.width ?? scene.cardWidth) / (2 * frame.curve);
  return [
    Math.sin(angle) * radius,
    (v - 0.5) * (frame.height ?? scene.cardHeight) + Math.sin((u - 0.5) * Math.PI) * frame.flex,
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
