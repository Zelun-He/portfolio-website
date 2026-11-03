import { COIL, clamp, sceneFor, framesFor, advanceEdge, travelForProject, positionForTravel, runwayForProjects, handoffForTravel, expandFinalFrame } from './showcase-geometry.mjs';
import { mountPortfolioMist } from './showcase-mist.mjs';
import { makeSurfaces, createCanvasRenderer, createGLRenderer } from './showcase-renderer.mjs';

// Semantic project entries remain the content source for both views of the work.
const work = document.querySelector('.showcase');
const stage = work.querySelector('.gallery-stage');
const canvas = stage.querySelector('.gallery-canvas');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
mountPortfolioMist();
const articles = [...document.querySelectorAll('[data-gallery-order]')]
  .sort((a,b) => Number(a.dataset.galleryOrder)-Number(b.dataset.galleryOrder));
const projects = articles.map(article => ({
  title: article.querySelector('h3').textContent,
  type: article.dataset.type,
  description: article.querySelector('.project-description').textContent,
  link: article.querySelector('.project-link').href,
  label: article.dataset.linkLabel,
  image: new URL(article.dataset.galleryImage || article.querySelector('img').src, location.href).href,
  detail: `#${article.id}`,
  detailLabel: article.classList.contains('case-study') ? 'Engineering notes ↗' : 'Project details ↗'
}));

async function enhanceGallery() {
  const root = document.documentElement;
  if (motion.matches || projects.length < 2) { root.classList.remove('gallery-pending'); return; }
  let renderer, surfaces=[], aspects=[], scene, observer, resizer;
  let raf=0, visible=false, destroyed=false, position=COIL.entry, target=COIL.entry;
  let clock=0,last=0,spin=0,selected=-1,handoff=0;
  let edge={position:COIL.entry,velocity:0};
  // Keep one continuous scroll rate through the entrance and every project.
  work.style.setProperty('--gallery-runway',String(runwayForProjects(projects.length)));
  work.style.setProperty('--gallery-last',String(travelForProject(projects.length-1)));
  const nextSection=work.nextElementSibling;
  const topBar=stage.querySelector('.gallery-top');
  const ease = value => { value=clamp(value); return value*value*(3-2*value); };
  const accent = stage.querySelector('.work-title-accent');
  const accentText = accent.textContent;
  const letters = [...accentText].map(character => {
    const span=document.createElement('span');span.className='work-title-char';
    span.textContent=character;span.setAttribute('aria-hidden','true');return span;
  });
  accent.setAttribute('aria-label',accentText);accent.replaceChildren(...letters);
  const readout=stage.querySelector('.gallery-readout');

  function dispose() {
    if(destroyed)return;destroyed=true;
    cancelAnimationFrame(raf);observer?.disconnect();resizer?.disconnect();
    removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);document.removeEventListener('visibilitychange',visibility);
    renderer?.destroy();
    accent.textContent=accentText;accent.removeAttribute('aria-label');
    [readout,topBar].forEach(el=>el.inert=false);
    delete work.dataset.frontVisible;
    root.classList.remove('gallery-pending','gallery-enhanced');
    readout.hidden=true;canvas.hidden=true;stage.style.removeProperty('clip-path');stage.style.removeProperty('mask-image');
  }
  function select(index) {
    if(index===selected)return;selected=index;const project=projects[index];
    stage.querySelector('#active-type').textContent=project.type;
    stage.querySelector('#active-title').textContent=project.title;
    stage.querySelector('#active-description').textContent=project.description;
    const link=stage.querySelector('#active-link');link.href=project.link;link.textContent=`${project.label} ↗`;
    const detail=stage.querySelector('#active-case-study');detail.href=project.detail;
    detail.textContent=project.detailLabel;
  }
  function updateTarget() {
    const bounds=work.getBoundingClientRect();
    const travel=-bounds.top;
    const height=stage.offsetHeight;
    target=positionForTravel(travel/height,projects.length);
    handoff=handoffForTravel(travel/height,projects.length);
    stage.style.setProperty('--gallery-expand',String(handoff));
    const nextTop=nextSection.getBoundingClientRect().top;
    const cover=clamp((height-nextTop)/height);
    stage.style.clipPath=`inset(0 0 ${cover*100}% 0)`;
    stage.style.maskImage=cover>0?`linear-gradient(to bottom,#000 ${Math.max(0,nextTop-90)}px,transparent ${Math.max(0,nextTop)}px)`:'';
    stage.style.setProperty('--work-rise',String(ease((travel/height+.55)/.55)));
    const writing=clamp((travel/height+.04)/.57);
    letters.forEach((letter,index)=>letter.style.setProperty('--letter-reveal',String(ease(writing*(letters.length+2)-index))));
    const front=ease((travel/height-.72)/.65)*(1-ease(handoff*3));
    stage.style.setProperty('--work-front',String(front));
    const frontVisible=front>.05;
    work.toggleAttribute('data-front-visible',frontVisible);
    [readout,topBar].forEach(el=>el.inert=!frontVisible);
  }
  function draw(now) {
    raf=0;
    if(destroyed||!visible||document.hidden)return;
    if(now-last<32){queue();return;}
    const dt=Math.min((now-(last||now-33))/1000,0.05);last=now;clock+=dt;
    updateTarget();const before=position;
    position+=(target-position)*(1-Math.exp(-13*dt));
    if(Math.abs(target-position)<0.0001)position=target;
    edge=advanceEdge(edge,position,dt);
    const velocity=(position-before)/Math.max(dt,0.001);
    const demand=clamp(velocity/5,-1,1),rate=Math.abs(demand)>Math.abs(spin)?7:2.2;
    spin+=(demand-spin)*(1-Math.exp(-rate*dt));
    select(clamp(Math.round(position),0,projects.length-1));
    const frames=framesFor(scene,projects.length,position,clock,spin,position-edge.position,aspects);
    renderer.draw(expandFinalFrame(scene,frames,projects.length-1,handoff,aspects.at(-1)));
    queue();
  }
  function onScroll(){updateTarget();queue();}
  function queue(){if(!raf&&!destroyed&&renderer&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;queue();}}
  function resize(){
    if(destroyed||!renderer)return;
    root.style.setProperty('--gallery-stage-height',`${stage.offsetHeight}px`);
    const bounds=stage.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    scene=sceneFor(bounds.width,bounds.height);renderer.resize(scene);queue();
  }
  updateTarget();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  try {
    surfaces=await makeSurfaces(projects);
    aspects=surfaces.map(({aspect})=>aspect);
    if(motion.matches){dispose();return;}
    renderer=createGLRenderer(canvas,surfaces);
    if(!renderer){renderer=await createCanvasRenderer(stage,surfaces);canvas.hidden=true;stage.dataset.renderer='canvas-mesh';}
    else{canvas.hidden=false;stage.dataset.renderer='webgl';}
    canvas.addEventListener('webglcontextlost',async event=>{
      event.preventDefault();if(destroyed)return;
      try {
        renderer.destroy();renderer=await createCanvasRenderer(stage,surfaces);
        if(destroyed){renderer.destroy();return;}renderer.resize(scene);
        canvas.hidden=true;stage.dataset.renderer='canvas-mesh';queue();
      }catch{dispose();}
    },{once:true});
    if(motion.matches){dispose();return;}
    stage.addEventListener('showcase:renderer-error',dispose,{once:true});
    root.classList.add('gallery-enhanced');root.classList.remove('gallery-pending');
    readout.hidden=false;select(0);resize();
    observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible){updateTarget();position=target;edge={position,velocity:0};last=0;queue();}
      else{cancelAnimationFrame(raf);raf=0;}
    });observer.observe(stage);
    resizer=new ResizeObserver(resize);resizer.observe(stage);
    document.addEventListener('visibilitychange',visibility);
    motion.addEventListener('change',event=>{if(event.matches)dispose();},{once:true});
    dispatchEvent(new Event('portfolio:layout-ready'));
  }catch{dispose();}
}
enhanceGallery();
