import { readFileSync } from 'node:fs';
import { galleryBudget, textureDimensions, textureBytes, needsGalleryFrame } from '../dist/lab/modern/gallery-resources.mjs';
import { COIL, localPoint, worldPoint, projectPoint, sceneFor, framesFor, expandFinalFrame, advanceEdge } from '../dist/lab/modern/showcase-geometry.mjs';

export async function runGalleryResourceTests({galleryBudget,textureDimensions,textureBytes,needsGalleryFrame,
  rendererSource,COIL,localPoint,worldPoint,projectPoint,sceneFor,framesFor,expandFinalFrame,advanceEdge}){
  let assertions=0;
  const assert=(condition,message)=>{assertions++;if(!condition)throw new Error(message);};
  const phone=galleryBudget({width:390,dpr:3,coarse:true,memory:4});
  assert(phone.textureEdge===1024&&phone.density===1.5,'Phone resource cap');
  assert(galleryBudget({width:1600,dpr:2}).textureEdge===2048,'Desktop resolution retained');
  for(const [w,h] of [[4000,2500],[1350,1010],[800,1600],[1,1]]){
    const size=textureDimensions(w,h,phone.textureEdge,512);
    assert(size.width<=512&&size.height<=512,'Hardware texture limit');
    assert((size.width&(size.width-1))===0&&(size.height&(size.height-1))===0,'Mipmapped POT dimensions');
  }
  assert(textureBytes(2048,2048)*6===134217720,'Original estimate');
  assert(textureBytes(1024,1024)*6<32*1024*1024,'Phone upper bound');

  const canvases=[],calls=[],images=[];let decodes=0,peak=0,created=0,deleted=0;
  class FakeImage{
    constructor(){this.naturalWidth=4000;this.naturalHeight=2400;images.push(this);}
    async decode(){decodes++;peak=Math.max(peak,decodes);try{await Promise.resolve();if(this.src==='bad')throw new Error('Decode failed');}finally{decodes--;}}
  }
  const document={createElement(){
    const canvas={width:1,height:1,dataset:{},getContext(){return {beginPath(){},roundRect(){},clip(){},drawImage(){}};}};
    canvases.push(canvas);return canvas;
  }};
  const gl=new Proxy({
    MAX_TEXTURE_SIZE:'MAX_TEXTURE_SIZE',
    getParameter:()=>4096,getExtension:()=>null,getError:()=>0,NO_ERROR:0,
    createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({}),
    getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:()=>({}),getAttribLocation:()=>0,
    createTexture:()=>({id:++created}),deleteTexture:()=>{deleted++;},
    texImage2D(...args){const upload=args.at(-1);calls.push({width:upload.width,height:upload.height});}
  },{get(target,key){return key in target?target[key]:(()=>{});}});
  const code=rendererSource.replace(/^import .*;$/gm,'').replace(/export /g,'').replace(/import\.meta\.url/g,"'https://example.test/'");
  const api=new Function('COIL','localPoint','worldPoint','projectPoint','paintMesh','galleryBudget','textureDimensions','textureBytes',
    'document','Image','innerWidth','devicePixelRatio','matchMedia','navigator',
    code+'\nreturn {makeSurfaces,createGLRenderer,visibleFrames};'
  )(COIL,localPoint,worldPoint,projectPoint,()=>{},galleryBudget,textureDimensions,textureBytes,document,FakeImage,390,3,
    ()=>({matches:true}),{deviceMemory:4});
  const surfaces=await api.makeSurfaces(Array.from({length:6},(_,i)=>({image:'image-'+i})));
  assert(peak===2,'Two concurrent decoders');
  assert(surfaces.length===6&&surfaces.every(x=>Math.max(x.surface.width,x.surface.height)<=1024),'Bounded source surfaces');
  assert(images.every(image=>image.src===''),'Release image references after decode');
  const partialStart=canvases.length;let failed=false;
  try{await api.makeSurfaces([{image:'good'},{image:'bad'},{image:'good'}]);}catch{failed=true;}
  assert(failed,'Image failure propagates');
  assert(canvases.slice(partialStart).every(c=>c.width===1&&c.height===1),'Release partial surfaces after failure');
  const canvas={dataset:{},getContext:()=>gl};
  const renderer=api.createGLRenderer(canvas,surfaces);
  assert(renderer&&created===0,'No eager GPU texture allocations');
  const scene=sceneFor(390,844);renderer.resize(scene);
  const front={index:0,x:0,y:0,z:0,rx:0,ry:0,rz:0,curve:.42,flex:0,opacity:1,wash:0};
  renderer.draw([front]);
  assert(created===1&&canvas.dataset.textureCount==='1','Upload only a visible card');
  assert(calls[0].width===1024&&calls[0].height===512,'Aspect-aware phone texture');
  renderer.draw([front]);assert(created===1,'Reuse resident texture');
  renderer.draw([{...front,index:1}]);
  assert(created===2&&deleted===1,'Evict unused texture before loading next');
  const before=created;
  renderer.draw([{...front,x:10000,index:2}]);
  assert(created===before&&canvas.dataset.textureCount==='0','Offscreen card does not allocate');
  renderer.draw([front]);renderer.suspend();
  assert(canvas.dataset.textureEstimateBytes==='0'&&canvas.dataset.textureCount==='0','Release textures on suspension');
  renderer.destroy();

  for(const [width,height] of [[390,844],[768,1024],[1440,900]]){
    const s=sceneFor(width,height);
    const frames=expandFinalFrame(s,framesFor(s,6,5.2,0,0,0,Array(6).fill(1.51)),5,1,1.51);
    assert(api.visibleFrames(s,frames).some(frame=>frame.index===5),'Keep expanded finale visible');
  }
  let position=0,target=2,edge={position:0,velocity:0},spin=.5,ticks=0;
  do{
    const dt=1/30;position+=(target-position)*(1-Math.exp(-13*dt));
    if(Math.abs(target-position)<.0001)position=target;
    edge=advanceEdge(edge,position,dt);spin*=Math.exp(-2.2*dt);ticks++;
  }while(needsGalleryFrame(position,target,edge,spin)&&ticks<300);
  assert(ticks<150,'Stop requesting frames after settling');
  assert(!needsGalleryFrame(position,target,edge,spin),'Idle requires no render');
  assert(needsGalleryFrame(position,target+1,edge,spin),'New scroll wakes rendering');
  return {assertions,peakConcurrentDecoders:peak,firstPhoneTexture:calls[0],settleFrames:ticks,
    oldSixTextureMiB:textureBytes(2048,2048)*6/1048576,phoneSixTextureMaxMiB:textureBytes(1024,1024)*6/1048576};
}

const rendererSource=readFileSync(new URL('../dist/lab/modern/showcase-renderer.mjs',import.meta.url),'utf8');
console.log(await runGalleryResourceTests({galleryBudget,textureDimensions,textureBytes,needsGalleryFrame,rendererSource,
  COIL,localPoint,worldPoint,projectPoint,sceneFor,framesFor,expandFinalFrame,advanceEdge}));
