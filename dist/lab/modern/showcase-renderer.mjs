import { COIL, localPoint, worldPoint, projectPoint } from './showcase-geometry.mjs';
import { paintMesh } from './showcase-painter.mjs';
import { galleryBudget, textureDimensions, textureBytes } from './gallery-resources.mjs';

function currentBudget(){
  return galleryBudget({width:innerWidth,dpr:devicePixelRatio||1,coarse:matchMedia('(pointer: coarse)').matches,
    memory:navigator.deviceMemory??8,saveData:navigator.connection?.saveData??false});
}

// Test a small projected grid so offscreen cards need neither textures nor mesh paint.
export function visibleFrames(scene,frames){
  return frames.filter(frame=>{
    if(frame.opacity<=.005)return false;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const u of [0,.25,.5,.75,1])for(const v of [0,.5,1]){
      const [x,y]=projectPoint(scene,worldPoint(localPoint(scene,frame,u,v),frame));
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    return right>=-32&&left<=scene.width+32&&bottom>=-32&&top<=scene.height+32;
  });
}

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

export async function makeSurfaces(projects,{signal}={}) {
  const budget=currentBudget(),loaded=new Array(projects.length);
  let cursor=0;
  const check=()=>{if(signal?.aborted)throw new DOMException('Gallery cancelled','AbortError');};
  async function next(){
    while(cursor<projects.length){
      check();const index=cursor++,project=projects[index],image=new Image();
      let surface;
      const cancel=()=>{image.src='';};
      signal?.addEventListener('abort',cancel,{once:true});
      try{
        image.decoding='async';image.src=project.image;await image.decode();check();
        if(!image.naturalWidth||!image.naturalHeight)throw new Error('Image dimensions unavailable');
        surface=document.createElement('canvas');
        const scale=Math.min(1,budget.textureEdge/Math.max(image.naturalWidth,image.naturalHeight));
        surface.width=Math.max(1,Math.round(image.naturalWidth*scale));
        surface.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const ctx=surface.getContext('2d');
        if(!ctx)throw new Error('Image surface unavailable');
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.beginPath();ctx.roundRect(0,0,surface.width,surface.height,surface.width*.0265);ctx.clip();
        ctx.drawImage(image,0,0,surface.width,surface.height);
        loaded[index]={surface,aspect:image.naturalWidth/image.naturalHeight};
      }catch(error){
        if(surface)surface.width=surface.height=1;throw error;
      }finally{
        signal?.removeEventListener('abort',cancel);image.src='';
      }
    }
  }
  // Wait for both decoders to settle so a late decode cannot retain a surface.
  const results=await Promise.allSettled(Array.from({length:Math.min(budget.decoders,projects.length)},next));
  const failure=results.find(result=>result.status==='rejected');
  if(failure||signal?.aborted){
    loaded.forEach(item=>{if(item)item.surface.width=item.surface.height=1;});
    throw failure?.reason??new DOMException('Gallery cancelled','AbortError');
  }
  return loaded;
}

export async function createCanvasRenderer(stage, surfaces) {
  let canvas=document.createElement('canvas');canvas.className='coil-mesh-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
  let worker,scene,density=1,busy=false,latest=null,destroyed=false;
  const pixelRatio=()=>Math.min(currentBudget().density,4096/Math.max(scene.width,scene.height));
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
      draw(frames){latest=visibleFrames(scene,frames);flush();},
      suspend(){latest=null;},
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
      draw(frames){paintMesh(ctx,surfaces.map(item=>item.surface),scene,visibleFrames(scene,frames),density);},
      destroy(){destroyed=true;canvas.remove();}
    };
  }
}

export function createGLRenderer(canvas, surfaces) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders = [], textures = new Map(); let program, buffer;
  const budget=currentBudget(),maxTextureSize=gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
  function report(){
    canvas.dataset.textureEstimateBytes=String([...textures.values()].reduce((sum,item)=>sum+item.bytes,0));
    canvas.dataset.textureCount=String(textures.size);
  }
  function releaseTextures(keep=new Set()){
    for(const [index,item] of textures)if(!keep.has(index)){gl.deleteTexture(item.texture);textures.delete(index);}
    report();
  }
  function dispose() {
    releaseTextures();
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
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.clearColor(0,0,0,0);
    function textureFor(index){
      if(textures.has(index))return textures.get(index).texture;
      const {surface}=surfaces[index];
      const dimensions=textureDimensions(surface.width,surface.height,budget.textureEdge,maxTextureSize);
      const texture=gl.createTexture();if(!texture)throw new Error('Gallery image unavailable');
      const upload=document.createElement('canvas');
      try{
        upload.width=dimensions.width;upload.height=dimensions.height;
        const ctx=upload.getContext('2d');if(!ctx)throw new Error('Gallery texture unavailable');
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(surface,0,0,upload.width,upload.height);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        if(gl.getError()!==gl.NO_ERROR)throw new Error('Gallery texture allocation failed');
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        textures.set(index,{texture,bytes:textureBytes(upload.width,upload.height)});report();
        return texture;
      }catch(error){gl.deleteTexture(texture);throw error;}
      finally{upload.width=upload.height=1;}
    }
    let scene;
    return {
      resize(next) {
        scene=next;const density=Math.min(budget.density,4096/Math.max(scene.width,scene.height));
        canvas.width=Math.round(scene.width*density);canvas.height=Math.round(scene.height*density);
        gl.viewport(0,0,canvas.width,canvas.height);
      },
      draw(frames) {
        frames=visibleFrames(scene,frames);
        releaseTextures(new Set(frames.map(frame=>frame.index)));
        gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.view,scene.width,scene.height);
        gl.uniform1i(uniforms.image,0);
        for(const frame of frames){
          gl.uniform2f(uniforms.size,frame.width ?? scene.cardWidth,frame.height ?? scene.cardHeight);
          gl.uniform3f(uniforms.offset,frame.x,frame.y,frame.z);gl.uniform3f(uniforms.rotation,frame.rx,frame.ry,frame.rz);
          gl.uniform1f(uniforms.curve,frame.curve);gl.uniform1f(uniforms.flex,frame.flex);
          gl.uniform1f(uniforms.opacity,frame.opacity);gl.uniform1f(uniforms.wash,frame.wash);
          gl.bindTexture(gl.TEXTURE_2D,textureFor(frame.index));gl.drawArrays(gl.TRIANGLES,0,mesh.length/2);
        }
      },
      suspend:releaseTextures,
      destroy:dispose
    };
  } catch { dispose(); return null; }
}
