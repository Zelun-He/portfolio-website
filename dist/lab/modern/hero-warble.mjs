export function mountHeroWarble(hero){
  const art=hero?.querySelector('.hero-art'),canvas=art?.querySelector('canvas');
  if(!canvas||!canvas.transferControlToOffscreen||typeof Worker!=='function')return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover: hover) and (pointer: fine)');
  let worker,visible=false,previous=null,strokes=[],raf=0;
  const stop=()=>{worker?.terminate();worker=null;art.classList.remove('warble-ready');art.dataset.renderer='poster';};
  function resize(){
    if(!worker)return;
    const bounds=art.getBoundingClientRect(),heading=hero.querySelector('h1').getBoundingClientRect(),offer=hero.querySelector('.hero-offer').getBoundingClientRect(),composition=hero.querySelector('.hero-composition').getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    previous=null;strokes=[];
    const holes=[...hero.querySelectorAll('h1,.hero-locator,.hero-small,.hero-employer,.hero .pill'),document.querySelector('.brand')].filter(Boolean).map(e=>{const r=e.getBoundingClientRect();return [r.left-bounds.left,r.top-bounds.top,r.width,r.height];});
    worker.postMessage({type:'resize',width:bounds.width,height:bounds.height,
      contentBottom:composition.bottom-bounds.top,headingLeft:heading.left-bounds.left,
      headingBottom:heading.bottom-bounds.top,headingHeight:heading.height,offerTop:offer.top-bounds.top,holes,
      density:Math.min(devicePixelRatio||1,1.5,2000/Math.max(bounds.width,bounds.height))});
  }
  function state(){
    previous=null;strokes=[];
    worker?.postMessage({type:'state',running:visible&&!document.hidden,reduced:motion.matches});
  }
  function flush(){raf=0;if(strokes.length&&worker)worker.postMessage({type:'pointer',strokes});strokes=[];}
  try{
    worker=new Worker(new URL('./hero-warble-worker.mjs',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{
      if(data.type==='painted'){art.classList.add('warble-ready');art.dataset.renderer='worker';}
      if(data.type==='error')stop();
    };
    worker.onerror=stop;
    const surface=canvas.transferControlToOffscreen();
    worker.postMessage({type:'init',canvas:surface},[surface]);resize();
  }catch{stop();return;}
  hero.addEventListener('pointermove',event=>{
    if(!worker||motion.matches||!pointer.matches||event.pointerType==='touch'||!event.isPrimary)return;
    const bounds=art.getBoundingClientRect();
    const point={x:(event.clientX-bounds.left)/bounds.width,y:(event.clientY-bounds.top)/bounds.height};
    if(previous&&event.timeStamp-previous.time<160){
      strokes.push({from:previous.point,to:point,seconds:Math.max(.008,(event.timeStamp-previous.time)/1000)});
      if(strokes.length>24)strokes.shift();
      if(!raf)raf=requestAnimationFrame(flush);
    }
    previous={point,time:event.timeStamp};
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{previous=null;},{passive:true});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;state();});observer.observe(hero);
  const resizer=new ResizeObserver(resize);resizer.observe(art);
  document.fonts?.ready.then(resize);
  document.addEventListener('visibilitychange',state);
  motion.addEventListener('change',state);
}
