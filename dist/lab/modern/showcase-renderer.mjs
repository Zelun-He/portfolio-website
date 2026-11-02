import { COIL, localPoint } from './showcase-geometry.mjs';

export const vertexShader = `
attribute vec2 uv;
uniform vec2 view;
uniform vec2 size;
uniform vec3 offset;
uniform vec3 rotation;
uniform float curve;
uniform float flex;
varying vec2 textureUV;
varying float surfaceAngle;
void main(){
  textureUV=uv;
  float angle=(uv.x-0.5)*2.0*curve;
  float radius=size.x/(2.0*curve);
  vec3 p=vec3(sin(angle)*radius,(uv.y-0.5)*size.y+sin((uv.x-0.5)*3.14159265)*flex,(cos(angle)-1.0)*radius);
  p.yz=mat2(cos(rotation.x),sin(rotation.x),-sin(rotation.x),cos(rotation.x))*p.yz;
  p.xz=mat2(cos(rotation.y),-sin(rotation.y),sin(rotation.y),cos(rotation.y))*p.xz;
  p.xy=mat2(cos(rotation.z),sin(rotation.z),-sin(rotation.z),cos(rotation.z))*p.xy;
  p+=offset;
  surfaceAngle=angle+rotation.y;
  float distance=8.1-p.z;
  float focal=1.0/tan(65.7*3.14159265/360.0);
  gl_Position=vec4(p.x*focal+0.04*distance,p.y*focal*view.x/view.y,0.0,distance);
}`;
export const fragmentShader = `
precision mediump float;
uniform sampler2D image;
uniform float opacity;
uniform float wash;
varying vec2 textureUV;
varying float surfaceAngle;
void main(){
  vec4 pixel=texture2D(image,textureUV);
  float fresnel=pow(1.0-abs(cos(surfaceAngle)),2.0)*0.12;
  pixel.rgb=mix(pixel.rgb,vec3(1.0),wash+fresnel);
  gl_FragColor=vec4(pixel.rgb,pixel.a*opacity);
}`;

export async function makeSurfaces(projects) {
  const results = await Promise.allSettled(projects.map(async project => {
    const image = new Image(); image.decoding = 'async'; image.src = project.image;
    await image.decode();
    const surface = document.createElement('canvas');
    surface.width = 1280; surface.height = Math.round(1280 / COIL.aspect);
    const ctx = surface.getContext('2d');
    if (!ctx) throw new Error('Image surface unavailable');
    // Use the project itself: no invented browser chrome or surrounding mockup frame.
    ctx.beginPath(); ctx.roundRect(0, 0, surface.width, surface.height, surface.width * 0.0265); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, surface.width, surface.height);
    const scale = Math.min(surface.width / image.naturalWidth, surface.height / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    ctx.drawImage(image, (surface.width-w)/2, 0, w, h);
    const blob = await new Promise(resolve => surface.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Image surface could not be encoded');
    return { surface, url: URL.createObjectURL(blob) };
  }));
  const loaded = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (loaded.length !== projects.length) {
    loaded.forEach(surface => URL.revokeObjectURL(surface.url));
    throw new Error('A project image could not be prepared');
  }
  return loaded;
}

export function createCSSRenderer(stage, surfaces) {
  const layer = document.createElement('div');
  layer.className = 'coil-css'; layer.setAttribute('aria-hidden', 'true');
  const cards = surfaces.map(({ url }) => {
    const card = document.createElement('div'); card.className = 'coil-card';
    const strips = Array.from({ length: COIL.columns }, () => {
      const strip = document.createElement('div'); strip.className = 'coil-strip';
      strip.style.backgroundImage = `url("${url}")`; strip.style.maskImage = `url("${url}")`; card.append(strip); return strip;
    });
    layer.append(card); return { card, strips, lastFlex: NaN, lastYaw: NaN };
  });
  stage.append(layer);
  let scene;
  function shape(item, frame) {
    const width = scene.cardWidth * scene.unit, height = scene.cardHeight * scene.unit;
    item.strips.forEach((strip, i) => {
      const u = (i + 0.5) / COIL.columns;
      const [x, y, z] = localPoint(scene, frame, u, 0.5);
      strip.style.width = `${width/COIL.columns + 1.2}px`;
      strip.style.height = `${height}px`;
      strip.style.backgroundSize = `${width}px ${height}px`;
      strip.style.backgroundPosition = `${-i*width/COIL.columns + 0.6}px 0`;
      strip.style.maskSize = `${width}px ${height}px`;
      strip.style.maskPosition = strip.style.backgroundPosition;
      strip.style.transform = `translate3d(${x*scene.unit}px,${-y*scene.unit}px,${z*scene.unit}px) rotateY(${(u-0.5)*2*frame.curve}rad) translate(-50%,-50%)`;
      const angle = (u-0.5)*2*frame.curve+frame.ry;
      strip.style.setProperty('--strip-wash', String((1-Math.abs(Math.cos(angle)))**2*0.12));
    });
    item.lastFlex = frame.flex; item.lastYaw = frame.ry;
  }
  return {
    resize(next) {
      scene = next;
      layer.style.perspective = `${scene.focal}px`;
      layer.style.perspectiveOrigin = `50% ${scene.originY}px`;
      cards.forEach(item => { item.lastFlex = NaN; });
    },
    draw(frames) {
      cards.forEach(({ card }) => { card.style.visibility = 'hidden'; });
      for (const frame of frames) {
        const item = cards[frame.index], card = item.card;
        card.style.visibility = 'visible';
        card.style.setProperty('--card-opacity', String(frame.opacity));
        card.style.setProperty('--card-blur', `${frame.blur > 0.15 ? frame.blur : 0}px`);
        card.style.setProperty('--card-wash', String(frame.wash));
        card.style.transform = `translate3d(${frame.x*scene.unit}px,${-frame.y*scene.unit}px,${frame.z*scene.unit}px) rotateZ(${-frame.rz}rad) rotateY(${frame.ry}rad) rotateX(${-frame.rx}rad)`;
        if (!Number.isFinite(item.lastFlex) || Math.abs(item.lastFlex-frame.flex)>0.0015 || Math.abs(frame.flex)>0.002 || Math.abs(item.lastYaw-frame.ry)>0.01) shape(item, frame);
      }
    },
    destroy() { layer.remove(); }
  };
}

export function createGLRenderer(canvas, surfaces) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders = [], textures = []; let program, buffer;
  function dispose() {
    textures.forEach(texture => gl.deleteTexture(texture));
    shaders.forEach(shader => gl.deleteShader(shader));
    if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program);
  }
  try {
    function compile(type, source) {
      const shader = gl.createShader(type); shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Gallery shader unavailable');
      return shader;
    }
    program = gl.createProgram();
    if (!program) throw new Error('Gallery program unavailable');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Gallery program unavailable');
    gl.useProgram(program);
    const mesh = [];
    for (let y=0; y<COIL.rows; y++) for (let x=0; x<COIL.columns; x++) {
      const u=x/COIL.columns,v=y/COIL.rows,r=(x+1)/COIL.columns,t=(y+1)/COIL.rows;
      mesh.push(u,v,r,v,u,t,u,t,r,v,r,t);
    }
    buffer=gl.createBuffer();if(!buffer)throw new Error('Gallery mesh unavailable');gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh),gl.STATIC_DRAW);
    const at=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['view','size','offset','rotation','curve','flex','image','opacity','wash'].map(key=>[key,gl.getUniformLocation(program,key)]));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.clearColor(0,0,0,0);
    for (const {surface} of surfaces) {
      const texture=gl.createTexture();if(!texture)throw new Error('Gallery image unavailable');textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,surface);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    }
    let scene;
    return {
      resize(next) {
        scene=next;const density=Math.min(devicePixelRatio||1,1.75,2600/Math.max(scene.width,scene.height));
        canvas.width=Math.round(scene.width*density);canvas.height=Math.round(scene.height*density);
        gl.viewport(0,0,canvas.width,canvas.height);
      },
      draw(frames) {
        gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.view,scene.width,scene.height);
        gl.uniform2f(uniforms.size,scene.cardWidth,scene.cardHeight);gl.uniform1i(uniforms.image,0);
        for(const frame of frames){
          gl.uniform3f(uniforms.offset,frame.x,frame.y,frame.z);gl.uniform3f(uniforms.rotation,frame.rx,frame.ry,frame.rz);
          gl.uniform1f(uniforms.curve,frame.curve);gl.uniform1f(uniforms.flex,frame.flex);
          gl.uniform1f(uniforms.opacity,frame.opacity);gl.uniform1f(uniforms.wash,frame.wash);
          gl.bindTexture(gl.TEXTURE_2D,textures[frame.index]);gl.drawArrays(gl.TRIANGLES,0,mesh.length/2);
        }
      },
      destroy:dispose
    };
  } catch { dispose(); return null; }
}
