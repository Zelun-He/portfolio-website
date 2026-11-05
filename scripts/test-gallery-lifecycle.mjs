import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as geometry from '../dist/lab/modern/showcase-geometry.mjs';

const source=readFileSync(new URL('../dist/lab/modern/modern.mjs',import.meta.url),'utf8');
let checks=0;
function check(condition,message){checks++;assert.ok(condition,message);}
class Node extends EventTarget{
  constructor(){super();this.dataset={};this.hidden=false;this.inert=false;this.textContent='';this.style={setProperty(){},removeProperty(){}};this.attributes=new Set();const classes=new Set(['gallery-pending']);this.classList={add:(...x)=>x.forEach(v=>classes.add(v)),remove:(...x)=>x.forEach(v=>classes.delete(v)),contains:x=>classes.has(x)};}
  setAttribute(name){this.attributes.add(name);}
  removeAttribute(name){this.attributes.delete(name);}
  toggleAttribute(name,on){if(on)this.attributes.add(name);else this.attributes.delete(name);}
  replaceChildren(...children){this.textContent=children.map(x=>x.textContent).join('');}
}
function harness({reduced=false,gl=true,failFallback=false}={}){
  const state={top:0,width:390,height:844,now:0,raf:new Map(),rafId:0,observers:[],resizers:[],renderers:[],surfaceCalls:0,fallbackCalls:0};
  const root=new Node(),windowEvents=new EventTarget(),document=new Node(),work=new Node(),stage=new Node(),canvas=new Node(),motion=new Node();
  document.documentElement=root;document.hidden=false;document.createElement=()=>new Node();motion.matches=reduced;
  const children=new Map();
  for(const key of ['.gallery-top','.work-title-accent','.gallery-readout','#active-type','#active-title','#active-description','#active-link','#active-case-study'])children.set(key,new Node());
  children.get('.work-title-accent').textContent='Built to be used.';
  stage.querySelector=key=>key==='.gallery-canvas'?canvas:children.get(key);
  Object.defineProperty(stage,'offsetHeight',{get:()=>state.height});
  stage.getBoundingClientRect=()=>({width:state.width,height:state.height});
  work.getBoundingClientRect=()=>({top:state.top});work.querySelector=()=>stage;
  document.querySelector=()=>work;
  const articles=Array.from({length:6},(_,index)=>({
    id:'project-'+index,dataset:{galleryOrder:String(index),type:'Test',linkLabel:'Explore',galleryImage:'/image-'+index,...(index===5?{galleryKind:'closing'}:{})},
    classList:{contains:()=>false},querySelector:selector=>({textContent:selector==='h3'?'Project '+index:'Description',href:'#detail',src:'/image'})
  }));
  document.querySelectorAll=()=>articles;
  class IntersectionObserver{
    constructor(callback){this.callback=callback;state.observers.push(this);}
    observe(){}disconnect(){this.disconnected=true;}
    emit(value){this.callback([{isIntersecting:value}]);}
  }
  class ResizeObserver{constructor(callback){this.callback=callback;state.resizers.push(this);}observe(){}disconnect(){}}
  function renderer(kind){const value={kind,draws:0,resizes:[],suspends:0,destroyed:false,
    draw(frames){this.draws++;this.lastFrames=frames;},resize(scene){this.resizes.push(scene);},
    suspend(){this.suspends++;},destroy(){this.destroyed=true;}};
    state.renderers.push(value);return value;
  }
  const names=['COIL','clamp','sceneFor','framesFor','advanceEdge','travelForProject','positionForTravel','runwayForProjects','handoffForTravel','expandFinalFrame'];
  const values=names.map(name=>geometry[name]);
  const stripped=source.replace(/^import .*;$/gm,'').replace(/enhanceGallery\(\);\s*$/,'const ready=enhanceGallery();return {ready};');
  const api=new Function(...names,'mountPortfolioMist','makeSurfaces','createCanvasRenderer','createGLRenderer','needsGalleryFrame',
    'document','matchMedia','IntersectionObserver','ResizeObserver','addEventListener','removeEventListener','dispatchEvent',
    'requestAnimationFrame','cancelAnimationFrame','performance','URLSearchParams','location',stripped)(
    ...values,()=>{},async()=>{state.surfaceCalls++;return Array.from({length:6},()=>({surface:{width:1024,height:679},aspect:2048/1357}));},
    async()=>{state.fallbackCalls++;if(failFallback)throw Error('Fallback unavailable');return renderer('canvas');},
    ()=>gl?renderer('webgl'):null,
    (position,target,edge,spin)=>Math.abs(target-position)>.0001||Math.abs(position-edge.position)>.0001||Math.abs(edge.velocity)>.001||Math.abs(spin)>.0001,
    document,()=>motion,IntersectionObserver,ResizeObserver,windowEvents.addEventListener.bind(windowEvents),
    windowEvents.removeEventListener.bind(windowEvents),windowEvents.dispatchEvent.bind(windowEvents),
    callback=>{const id=++state.rafId;state.raf.set(id,callback);return id;},id=>state.raf.delete(id),
    {now:()=>state.now},URLSearchParams,{search:'?gallery-profile=1',href:'https://example.test/'});
  const flush=()=>{let count=0;while(state.raf.size&&count++<600){state.now+=34;const batch=[...state.raf.values()];state.raf.clear();batch.forEach(callback=>callback(state.now));}check(count<600,'Animation settles under controlled scheduling');};
  async function start(){check(state.surfaceCalls===0,'Proximity gate defers image preparation');state.observers[0].emit(true);await api.ready;state.observers[1].emit(true);flush();}
  return {state,root,document,work,stage,canvas,motion,children,flush,start,api,
    scroll(travel){state.top=-travel*state.height;windowEvents.dispatchEvent(new Event('scroll'));flush();},
    resize(width,height){state.width=width;state.height=height;state.resizers[0].callback();flush();},
    visibility(hidden){document.hidden=hidden;document.dispatchEvent(new Event('visibilitychange'));flush();}
  };
}
{
  const h=harness();await h.start();
  check(h.stage.dataset.renderer==='webgl','GL initialization selected');
  for(const index of [0,1,2,3,4,5,3,1]){h.scroll(geometry.travelForProject(index));check(h.children.get('#active-title').textContent==='Project '+index,'Scroll selects project '+index);}
  for(const [width,height] of [[844,390],[390,844],[800,360],[360,800]]){h.resize(width,height);const last=h.state.renderers[0].resizes.at(-1);check(last.width===width&&last.height===height,'Resize uses current stage dimensions');}
  h.state.observers[1].emit(false);const beforeReentry=h.state.renderers[0].draws;h.scroll(geometry.travelForProject(2));
  check(h.state.renderers[0].draws===beforeReentry&&h.state.raf.size===0,'Offscreen stage stops frame submission');
  h.state.observers[1].emit(true);h.flush();check(h.state.renderers[0].draws>beforeReentry,'Stage reentry resumes drawing');
  h.visibility(true);check(h.state.renderers[0].suspends>0&&h.state.raf.size===0,'Hidden document suspends work');
  h.visibility(false);check(h.state.renderers[0].draws>0,'Visibility return draws');
  const lost=new Event('webglcontextlost',{cancelable:true});h.canvas.dispatchEvent(lost);
  await Promise.resolve();await Promise.resolve();h.flush();
  check(lost.defaultPrevented,'Context-loss handler prevents default');
  check(h.state.renderers[0].destroyed&&h.stage.dataset.renderer==='canvas-mesh','Context loss selects Canvas fallback');
  check(h.state.renderers[1].draws>0,'Replacement renderer draws');
  h.scroll(geometry.runwayForProjects(6)-1+.01);check(h.work.attributes.has('data-final-expanded'),'Final expansion completes');
  check(h.state.renderers[1].suspends>0,'Final expansion suspends raster renderer');
  h.scroll(geometry.travelForProject(4));check(!h.work.attributes.has('data-final-expanded')&&h.children.get('#active-title').textContent==='Project 4','Reverse scroll restores project rendering');
  h.motion.matches=true;h.motion.dispatchEvent(Object.assign(new Event('change'),{matches:true}));
  h.flush();check(!h.root.classList.contains('gallery-enhanced')&&!h.root.classList.contains('gallery-pending'),'Runtime reduced motion restores static mode');
  check(h.state.renderers[1].destroyed&&h.canvas.hidden,'Reduced motion disposes renderer');
}
{
  const h=harness({reduced:true});await h.api.ready;
  check(h.state.surfaceCalls===0&&h.state.renderers.length===0&&h.state.raf.size===0,'Initial reduced motion allocates no gallery renderer');
  check(!h.root.classList.contains('gallery-pending'),'Initial reduced motion clears pending state');
}
{
  const h=harness({gl:false});await h.start();check(h.stage.dataset.renderer==='canvas-mesh'&&h.canvas.hidden,'WebGL unavailable uses Canvas');
}
{
  const h=harness({failFallback:true});await h.start();
  h.canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));await Promise.resolve();await Promise.resolve();h.flush();
  check(!h.root.classList.contains('gallery-enhanced')&&h.canvas.hidden,'Failed recovery restores semantic static content');
}
{
  const h=harness();await h.start();h.stage.dispatchEvent(new Event('showcase:renderer-error'));h.flush();
  check(!h.root.classList.contains('gallery-enhanced')&&h.canvas.hidden,'Renderer error restores semantic static content');
}
const orientationCases=[];
for(const [width,height] of [[320,568],[375,667],[390,844],[360,800],[412,915],[568,320],[667,375],[844,390],[800,360],[915,412]]){
  const stageHeight=Math.max(height,width<=450?700:width<=760?740:660);
  const scene=geometry.sceneFor(width,stageHeight),aspect=2048/1357;
  const frames=geometry.framesFor(scene,6,5.2,0,0,0,Array(6).fill(aspect));
  const frame=geometry.expandFinalFrame(scene,frames,5,1,aspect).find(x=>x.index===5);
  const projected=[];
  for(const u of [0,.25,.5,.75,1])for(const v of [0,.5,1])projected.push(geometry.projectPoint(scene,geometry.worldPoint(geometry.localPoint(scene,frame,u,v),frame)));
  const left=Math.min(...projected.map(p=>p[0])),right=Math.max(...projected.map(p=>p[0]));
  check(left>=0&&right<=width,'Final geometry stays within width '+width);
  check(Math.abs((right-left)/width-.905)<.001,'Final image width remains 90.5% at '+width);
  orientationCases.push({width,height,stageHeight,finalCssWidth:Number((right-left).toFixed(2)),rasterBufferWidth:Math.round(width*1.5),svgTextCssPx:Number((106*width*.905/2048).toFixed(2))});
}
console.log(JSON.stringify({scope:'Controlled DOM/renderer mocks and projection math; no real browser/GPU/phone measurements',checks,orientationCases},null,2));
