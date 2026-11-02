import { COIL } from './showcase-geometry.mjs';
import { paintMesh } from './showcase-painter.mjs';

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
  gl_Position=vec4(p.x*focal-0.02*distance,p.y*focal*view.x/view.y+0.034*distance,0.0,distance);
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
    surface.width = Math.min(image.naturalWidth, 2048); surface.height = Math.round(surface.width / COIL.aspect);
    const ctx = surface.getContext('2d');
    if (!ctx) throw new Error('Image surface unavailable');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // Use the project itself: no invented browser chrome or surrounding mockup frame.
    ctx.beginPath(); ctx.roundRect(0, 0, surface.width, surface.height, surface.width * 0.0265); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, surface.width, surface.height);
    const scale = Math.min(surface.width / image.naturalWidth, surface.height / image.naturalHeight);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    ctx.drawImage(image, (surface.width-w)/2, 0, w, h);
    return { surface };
  }));
  const loaded = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (loaded.length !== projects.length) {
    throw new Error('A project image could not be prepared');
  }
  return loaded;
}

export async function createCanvasRenderer(stage, surfaces) {
  let canvas=document.createElement('canvas');canvas.className='coil-mesh-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
  let worker,scene,density=1,busy=false,latest=null,destroyed=false;
  const pixelRatio=()=>Math.min(devicePixelRatio||1,2,4096/Math.max(scene.width,scene.height));
  try {
    if(!canvas.transferControlToOffscreen||typeof Worker!=='function')throw new Error('Worker canvas unavailable');
    const images=await Promise.all(surfaces.map(({surface})=>createImageBitmap(surface)));
    worker=new Worker(new URL('./showcase-worker.mjs',import.meta.url),{type:'module'});
    const offscreen=canvas.transferControlToOffscreen();
    await new Promise((resolve,reject)=>{
      worker.onerror=reject;
      worker.onmessage=event=>event.data.type==='ready'?resolve():reject(new Error('Worker canvas unavailable'));
      worker.postMessage({type:'init',canvas:offscreen,images},[offscreen,...images]);
    });
    const flush=()=>{
      if(!busy&&latest&&!destroyed){busy=true;const frames=latest;latest=null;worker.postMessage({type:'frame',frames});}
    };
    worker.onmessage=event=>{
      if(event.data.type==='painted'){busy=false;canvas.dataset.paintMs=String(Math.round(event.data.milliseconds));flush();}
    };
    worker.onerror=()=>{stage.dispatchEvent(new Event('showcase:renderer-error'));};
    return {
      resize(next){scene=next;density=pixelRatio();worker.postMessage({type:'resize',scene,density});},
      draw(frames){latest=frames;flush();},
      destroy(){destroyed=true;worker.terminate();canvas.remove();}
    };
  }catch{
    worker?.terminate();
    // An offscreen transfer owns its original element; replace it for main-thread 2D.
    const next=document.createElement('canvas');next.className='coil-mesh-canvas';next.setAttribute('aria-hidden','true');canvas.replaceWith(next);canvas=next;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx){canvas.remove();throw new Error('Gallery canvas unavailable');}
    return {
      resize(next){scene=next;density=pixelRatio();canvas.width=Math.round(scene.width*density);canvas.height=Math.round(scene.height*density);},
      draw(frames){paintMesh(ctx,surfaces.map(item=>item.surface),scene,frames,density);},
      destroy(){destroyed=true;canvas.remove();}
    };
  }
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
      // WebGL 1 needs power-of-two dimensions for mipmaps. UV mapping restores the card's aspect.
      const upload=document.createElement('canvas');upload.width=2048;upload.height=2048;
      const uploadContext=upload.getContext('2d');
      if(!uploadContext)throw new Error('Gallery texture unavailable');
      uploadContext.imageSmoothingQuality='high';uploadContext.drawImage(surface,0,0,2048,2048);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);
      upload.width=upload.height=1;
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
      if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    }
    let scene;
    return {
      resize(next) {
        scene=next;const density=Math.min(devicePixelRatio||1,2,4096/Math.max(scene.width,scene.height));
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
