import { MistFlow } from './mist-flow.mjs';

// One viewport-sized background is shared by the light sections of the page.
export function mountPortfolioMist(){
  const canvas=document.createElement('canvas');canvas.className='portfolio-mist';canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
  document.body.prepend(canvas);document.documentElement.classList.add('portfolio-mist-ready');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const table=new Float32Array(16384);let seed=41751;
  for(let i=0;i<table.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;table[i]=seed/4294967296;}
  const fade=x=>x*x*(3-2*x);
  function noise(x,y){
    const ix=Math.floor(x),iy=Math.floor(y),u=fade(x-ix),v=fade(y-iy);
    const a=table[((iy&127)<<7)+(ix&127)],b=table[((iy&127)<<7)+((ix+1)&127)];
    const c=table[(((iy+1)&127)<<7)+(ix&127)],d=table[(((iy+1)&127)<<7)+((ix+1)&127)];
    return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
  }
  let width=1,height=1,pixels,flow,raf=0,last=0,time=0,previousPointer=null;
  let strokes=[];const visibleSections=new Set();
  function paint(){
    if(!pixels)return;
    const t=time*.22,scroll=motion.matches?0:scrollY/Math.max(1,innerHeight)*.035;
    const data=pixels.data;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const u=x/width,v=y/height;
      const fx=u*(flow.width-1),fy=v*(flow.height-1);
      const wakeX=motion.matches?0:flow.sample(flow.dx,fx,fy)*1.8;
      const wakeY=motion.matches?0:flow.sample(flow.dy,fx,fy)*1.8;
      const sx=(u+wakeX)*2.8,sy=(v+wakeY)*2.8+scroll;
      const warpX=noise(sx*.8+t*.35,sy*.8-t*.22)-.5;
      const warpY=noise(sx*.8-t*.27+19,sy*.8+t*.31+7)-.5;
      const broad=noise(sx+warpX*1.1+t*.18,sy+warpY*1.1-t*.12);
      const detail=noise(sx*2.3+warpY*.35-t*.13+11,sy*2.3+warpX*.35+t*.17);
      const cloud=fade(Math.min(1,Math.max(0,(broad*.82+detail*.18-.2)/.6)));
      const tone=211+cloud*44;
      const i=(y*width+x)*4;data[i]=tone;data[i+1]=tone;data[i+2]=tone-.8;data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  }
  function resize(){
    width=192;height=Math.max(80,Math.min(320,Math.round(width*innerHeight/Math.max(1,innerWidth))));
    canvas.width=width;canvas.height=height;pixels=ctx.createImageData(width,height);
    flow=new MistFlow(64,Math.max(32,Math.min(112,Math.round(64*innerHeight/Math.max(1,innerWidth)))));
    strokes=[];previousPointer=null;paint();queue();
  }
  function frame(now){
    raf=0;if(!visibleSections.size||document.hidden||motion.matches)return;
    const interval=finePointer.matches&&(strokes.length||flow.activity>.001)?32:80;
    if(now-last<interval){queue();return;}
    const dt=Math.min((now-(last||now-interval))/1000,.1);last=now;time+=dt;
    for(const stroke of strokes)flow.inject(stroke.from,stroke.to,stroke.seconds);strokes=[];
    // Substeps keep advection stable after an idle frame or a short stall.
    const steps=Math.ceil(dt/.033);
    for(let i=0;i<steps;i++)flow.step(dt/steps);
    paint();queue();
  }
  function queue(){if(!raf&&visibleSections.size&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(frame);}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;previousPointer=null;strokes=[];}
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)entry.isIntersecting?visibleSections.add(entry.target):visibleSections.delete(entry.target);
    if(visibleSections.size){paint();queue();}else{stop();flow?.clear();}
  });
  document.querySelectorAll('[data-surface="light"]').forEach(section=>observer.observe(section));
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||motion.matches||!finePointer.matches||!visibleSections.size)return;
    const point={x:event.clientX/innerWidth,y:event.clientY/innerHeight};
    if(previousPointer){
      strokes.push({from:previousPointer.point,to:point,seconds:Math.max(.008,(event.timeStamp-previousPointer.time)/1000)});
      if(strokes.length>12)strokes.shift();
    }
    previousPointer={point,time:event.timeStamp};queue();
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{previousPointer=null;},{passive:true});
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():queue());
  motion.addEventListener('change',()=>{stop();flow.clear();paint();queue();});
  resize();
}
