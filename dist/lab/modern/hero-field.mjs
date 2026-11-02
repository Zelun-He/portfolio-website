// Surface settings measured from the reference: a two-tone, tiled mesh field.
export const SETTINGS = Object.freeze({
  distortion: 0.4, swirl: 0.6, phase: 41.5, speed: 1,
  rotation: Math.PI / 2, tile: 1.5, scale: 1,
  pointerRadius: 0.05, pointerForce: 0.8, pointerDisplacement: 0.35,
  pointerCap: 0.12, pointerLinger: 0.9, pointerFade: 1.4
});

const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

// Original reflective surface, shaded analytically rather than borrowing a sprite sheet.
// Coordinates are CSS pixels so the halftone keeps the same pitch on retina displays.
export function orbAt(x, y, width, height, seconds) {
  const compact = width / height < 1;
  const radius = Math.min(width * (compact ? 0.65 : 0.32), height * 0.44);
  const px = (x - width * (compact ? 0.22 : 0.27)) / radius;
  const py = (y - height * 0.39) / radius;
  const angle = Math.atan2(py, px);
  const edge = 1 + 0.035 * Math.sin(angle * 3 + seconds * 0.4) + 0.025 * Math.sin(angle * 5 - seconds * 0.6);
  const r = Math.hypot(px, py) / edge;
  if (r >= 1) return 0;
  const z = Math.sqrt(1 - r * r);
  const nx = px + 0.1 * Math.sin(py * 5 + seconds * 0.8) * z;
  const ny = py + 0.12 * Math.sin(px * 4 + seconds * 0.6) * z;
  const reflection = Math.abs(Math.sin(nx * 4.8 + ny * 3.1 + z * 6.2 + Math.sin(ny * 7.5 - seconds * 0.6) * 0.5 + seconds * 0.38));
  const ribbon = Math.exp(-Math.pow((reflection - 0.15) / 0.13, 2));
  const rim = Math.exp(-Math.pow((r - 0.96) / 0.045, 2));
  const light = 0.35 + 0.65 * Math.max(0, -nx * 0.55 - ny * 0.65 + z * 0.6);
  const mask = (1 - smooth((y / height - 0.44) / 0.2)) * smooth(y / height / 0.14);
  const right = 1 - smooth((x / width - (compact ? 0.27 : 0.5)) / 0.2);
  return Math.min(1, Math.max(ribbon * light, rim * (0.5 + 0.5 * Math.sin(angle - 0.8)))) * mask * right;
}

// The worker and GPU evaluate the same field. CPU fallback stays off the UI thread.
export function shadeAt(x, y, width, height, seconds, trails = []) {
  const unit = Math.min(width, height);
  let ux = (x - width / 2) / unit;
  let uy = (height / 2 - y) / unit;
  let dx = 0, dy = 0;
  for (const trail of trails) {
    const age = seconds - trail.time;
    if (age < 0 || age > 2.3) continue;
    const fall = 1 - smooth((age - 0.9) / 1.4);
    const px = x / width - trail.x;
    const py = (height - y) / height - trail.y;
    const radius = 0.05 + age * 0.03;
    const influence = Math.exp(-(px * px + py * py) / (radius * radius * 2)) * fall;
    const curl = Math.sin(age * 6) * 0.18;
    dx += (trail.dx - py * curl) * influence;
    dy += (trail.dy + px * curl) * influence;
  }
  const length = Math.hypot(dx, dy);
  if (length > 0.12) { dx *= 0.12 / length; dy *= 0.12 / length; }
  ux += dx;
  uy += dy;
  // A ninety-degree field rotation, independent of the viewport's aspect ratio.
  const lx = -uy, ly = ux;
  const radius = smooth(Math.hypot(lx, ly));
  const centre = 1 - radius;
  const t = (seconds + SETTINGS.phase) * 0.5;
  let wx = lx + 0.5, wy = ly + 0.5;
  for (let octave = 1; octave <= 2; octave++) {
    wx += 0.4 * centre / octave * Math.sin(t + octave * 0.4 * smooth(wy)) * Math.cos(t * 0.2 + octave * 2.4 * smooth(wy));
    wy += 0.4 * centre / octave * Math.cos(t + octave * 2 * smooth(wx));
  }
  const angle = -1.8 * radius;
  const sx = (wx - 0.5) * Math.cos(angle) - (wy - 0.5) * Math.sin(angle) + 0.5;
  const sy = (wx - 0.5) * Math.sin(angle) + (wy - 0.5) * Math.cos(angle) + 0.5;
  let total = 0, colour = 0;
  for (let i = 0; i < 2; i++) {
    const a = i * 0.37;
    const px = 0.5 + 0.5 * Math.sin(t * (0.6 + i / 3 * 0.9) + a);
    const py = 0.5 + 0.5 * Math.cos(t * (0.8 + (i + 1) / 4) + a * 1.5);
    const tile = Math.floor((sx - px) / 1.5);
    for (let neighbor = 0; neighbor < 2; neighbor++) {
      const distance = Math.hypot(sx - px - (tile + neighbor) * 1.5, sy - py);
      const weight = 1 / (Math.pow(distance, 3.5) + 0.001);
      total += weight;
      colour += (i === 0 ? 130 : 84) * weight;
    }
  }
  return colour / total;
}

export const vertexShader = `
attribute vec2 position;
varying vec2 screenUV;
void main() {
  screenUV = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export const fragmentShader = `
precision highp float;
varying vec2 screenUV;
uniform vec2 resolution;
uniform vec2 cssResolution;
uniform float elapsed;
uniform vec4 trails[10];
uniform vec2 trailMotion[10];
uniform vec4 clearAreas[4];

float ease(float x) { x = clamp(x, 0.0, 1.0); return x*x*(3.0-2.0*x); }
float hash(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 cell = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(cell),hash(cell+vec2(1.,0.)),f.x),
             mix(hash(cell+vec2(0.,1.)),hash(cell+vec2(1.,1.)),f.x),f.y);
}
vec2 turn(vec2 p, float a) {
  return vec2(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a));
}
float orb(vec2 p) {
  bool compact = cssResolution.x / cssResolution.y < 1.0;
  float radius = min(cssResolution.x * (compact ? 0.65 : 0.32), cssResolution.y * 0.44);
  vec2 n = (p - cssResolution * vec2(compact ? 0.22 : 0.27, 0.39)) / radius;
  float angle = atan(n.y,n.x);
  float edge = 1.0+0.035*sin(angle*3.0+elapsed*0.4)+0.025*sin(angle*5.0-elapsed*0.6);
  float r = length(n)/edge;
  if(r >= 1.0) return 0.0;
  float z = sqrt(1.0-r*r);
  n += vec2(0.1*sin(n.y*5.0+elapsed*0.8),0.12*sin(n.x*4.0+elapsed*0.6))*z;
  float reflection = abs(sin(n.x*4.8+n.y*3.1+z*6.2+sin(n.y*7.5-elapsed*0.6)*0.5+elapsed*0.38));
  float ribbonDistance = (reflection-0.15)/0.13;
  float rimDistance = (r-0.96)/0.045;
  float ribbon = exp(-ribbonDistance*ribbonDistance);
  float rim = exp(-rimDistance*rimDistance);
  float light = 0.35+0.65*max(0.0,-n.x*0.55-n.y*0.65+z*0.6);
  float mask = (1.0-ease((p.y/cssResolution.y-0.44)/0.2))*ease(p.y/cssResolution.y/0.14);
  float right = 1.0-ease((p.x/cssResolution.x-(compact ? 0.27 : 0.5))/0.2);
  return min(1.0,max(ribbon*light,rim*(0.5+0.5*sin(angle-0.8))))*mask*right;
}
void main() {
  vec2 displacement = vec2(0.0);
  for (int i=0; i<10; i++) {
    float age = elapsed - trails[i].z;
    if (age < 0.0 || age > 2.3 || trails[i].w < 0.5) continue;
    vec2 d = screenUV - trails[i].xy;
    float radius = 0.05 + age * 0.03;
    float influence = exp(-dot(d,d)/(radius*radius*2.0)) * (1.0-ease((age-0.9)/1.4));
    vec2 curl = vec2(-d.y,d.x) * sin(age*6.0) * 0.18;
    displacement += (trailMotion[i]+curl) * influence;
  }
  float amplitude = length(displacement);
  if (amplitude > 0.12) displacement *= 0.12/amplitude;
  vec2 object = (screenUV-0.5)*resolution/min(resolution.x,resolution.y)+displacement;
  vec2 lens = turn(object,1.57079632679);
  float radius = ease(length(lens));
  float centre = 1.0-radius;
  float time = (elapsed+41.5)*0.5;
  vec2 warped = lens+0.5;
  for (int octave=1; octave<=2; octave++) {
    float frequency = float(octave);
    warped.x += 0.4*centre/frequency*sin(time+frequency*0.4*ease(warped.y))
                *cos(0.2*time+frequency*2.4*ease(warped.y));
    warped.y += 0.4*centre/frequency*cos(time+frequency*2.0*ease(warped.x));
  }
  vec2 field = turn(warped-0.5,-1.8*radius)+0.5;
  float grain = 0.04*(noise((lens+0.5)*1000.0)-0.5);
  float value=0.0, weights=0.0;
  for (int i=0; i<2; i++) {
    float n=float(i), phase=n*0.37;
    vec2 centre = 0.5+0.5*vec2(sin(time*(0.6+n*0.3)+phase),cos(time*(0.8+(n+1.0)/4.0)+phase*1.5));
    centre += grain;
    float tile=floor((field.x-centre.x)/1.5);
    for (int side=0; side<2; side++) {
      vec2 offset=field-centre-vec2((tile+float(side))*1.5,0.0);
      float weight=1.0/(pow(length(offset),3.5)+0.001);
      value+=(i==0?130.0:84.0)/255.0*weight;
      weights+=weight;
    }
  }
  float tone=value/weights;
  vec2 grainUV=(lens+0.5)*1000.0;
  float overlay=(noise(turn(grainUV,1.0)+3.0)+noise(turn(grainUV,2.0)-1.0))*0.5;
  float signedNoise=pow(overlay,1.3)*2.0-1.0;
  tone=mix(tone,step(0.0,signedNoise),0.35*pow(0.1*abs(signedNoise),0.8));
  vec2 pixel = vec2(screenUV.x,1.0-screenUV.y)*cssResolution;
  vec2 cell = (floor(pixel/6.93)+0.5)*6.93;
  float surface = orb(cell + displacement*cssResolution);
  for(int i=0; i<4; i++) {
    vec2 delta = max(max(clearAreas[i].xy-cell,cell-clearAreas[i].xy-clearAreas[i].zw),0.0);
    surface *= ease((length(delta)-7.0)/22.0);
  }
  float dotRadius = 6.93*(0.1+0.7*pow(surface,1.6));
  float coverage = surface > 0.003 ? 1.0-smoothstep(dotRadius-0.5,dotRadius+0.5,length(pixel-cell)) : 0.0;
  tone=mix(tone,0.98,coverage*0.95);
  gl_FragColor=vec4(vec3(tone),1.0);
}`;
