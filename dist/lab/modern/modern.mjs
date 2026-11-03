import { COIL, clamp, sceneFor, framesFor, advanceEdge } from './showcase-geometry.mjs';
import { makeSurfaces, createCanvasRenderer, createGLRenderer } from './showcase-renderer.mjs';

// Semantic project entries remain the content source for both views of the work.
const work = document.querySelector('.showcase');
const stage = work.querySelector('.gallery-stage');
const canvas = stage.querySelector('.gallery-canvas');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const articles = [...document.querySelectorAll('.project[data-gallery-order]')]
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
  let raf=0, visible=false, destroyed=false, position=COIL.phase, target=COIL.phase;
  let clock=0,last=0,spin=0,selected=-1;
  let edge={position:COIL.phase,velocity:0};
  const readout=stage.querySelector('.gallery-readout');
  const controls=stage.querySelector('.gallery-controls');
  const dots=stage.querySelector('.project-dots');
  const previous=stage.querySelector('#previous-project');
  const next=stage.querySelector('#next-project');

  function dispose() {
    if(destroyed)return;destroyed=true;
    cancelAnimationFrame(raf);observer?.disconnect();resizer?.disconnect();
    removeEventListener('scroll',queue);document.removeEventListener('visibilitychange',visibility);
    renderer?.destroy();
    root.classList.remove('gallery-pending','gallery-enhanced');
    readout.hidden=true;controls.hidden=true;canvas.hidden=true;
  }
  function select(index) {
    if(index===selected)return;selected=index;const project=projects[index];
    stage.querySelector('#active-type').textContent=project.type;
    stage.querySelector('#active-title').textContent=project.title;
    stage.querySelector('#active-description').textContent=project.description;
    const link=stage.querySelector('#active-link');link.href=project.link;link.textContent=`${project.label} ↗`;
    const detail=stage.querySelector('#active-case-study');detail.href=project.detail;
    detail.textContent=project.detailLabel;
    stage.querySelector('#project-number').textContent=String(index+1).padStart(2,'0');
    [...dots.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    previous.disabled=index===0;next.disabled=index===projects.length-1;
  }
  function updateTarget() {
    const bounds=work.getBoundingClientRect();
    const range=Math.max(1,work.offsetHeight-stage.offsetHeight);
    const progress=clamp(-bounds.top/range);
    target=COIL.phase+clamp((progress-0.04)/0.92)*(projects.length-1);
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
    renderer.draw(framesFor(scene,projects.length,position,clock,spin,position-edge.position,aspects));
    queue();
  }
  function queue(){if(!raf&&!destroyed&&renderer&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;queue();}}
  function resize(){
    if(destroyed||!renderer)return;
    const bounds=stage.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    scene=sceneFor(bounds.width,bounds.height);renderer.resize(scene);queue();
  }
  function goToProject(index){
    const destination=clamp(index,0,projects.length-1);
    if(location.hash!=='#work')history.replaceState(null,'','#work');
    const top=scrollY+work.getBoundingClientRect().top;
    const range=Math.max(1,work.offsetHeight-stage.offsetHeight);
    scrollTo({top:top+range*(0.04+destination/(projects.length-1)*0.92),behavior:'smooth'});
  }
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
    projects.forEach((project,index)=>{
      const button=document.createElement('button');button.type='button';button.className='project-dot';
      button.setAttribute('aria-label',`Show ${project.title}`);button.setAttribute('aria-pressed','false');
      button.addEventListener('click',()=>goToProject(index));dots.append(button);
    });
    stage.querySelector('.project-count .muted').textContent=` / ${String(projects.length).padStart(2,'0')}`;
    previous.addEventListener('click',()=>goToProject(selected-1));next.addEventListener('click',()=>goToProject(selected+1));
    root.classList.add('gallery-enhanced');root.classList.remove('gallery-pending');
    readout.hidden=false;controls.hidden=false;select(0);resize();
    observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible){updateTarget();position=target;edge={position,velocity:0};last=0;queue();}
      else{cancelAnimationFrame(raf);raf=0;}
    });observer.observe(stage);
    resizer=new ResizeObserver(resize);resizer.observe(stage);
    addEventListener('scroll',queue,{passive:true});document.addEventListener('visibilitychange',visibility);
    motion.addEventListener('change',event=>{if(event.matches)dispose();},{once:true});
    dispatchEvent(new Event('portfolio:layout-ready'));
  }catch{dispose();}
}
enhanceGallery();
