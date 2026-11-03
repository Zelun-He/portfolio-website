// Low-resolution, domain-warped clouds. The browser scales and softens this
// separate background surface; project textures remain sharp and untouched.
export function mountGalleryMist(stage) {
  const canvas=document.createElement('canvas');
  canvas.className='gallery-mist';canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return;
  stage.prepend(canvas);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const table=new Float32Array(128*128);
  let seed=41751;
  for(let i=0;i<table.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;table[i]=seed/4294967296;}
  const fade=x=>x*x*(3-2*x);
  function noise(x,y){
    const ix=Math.floor(x),iy=Math.floor(y),u=fade(x-ix),v=fade(y-iy);
    const a=table[((iy&127)<<7)+(ix&127)],b=table[((iy&127)<<7)+((ix+1)&127)];
    const c=table[(((iy+1)&127)<<7)+(ix&127)],d=table[(((iy+1)&127)<<7)+((ix+1)&127)];
    return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
  }
  let pixels,width=1,height=1,visible=false,raf=0,last=0,time=0;
  let mouse={x:.5,y:.5,force:0},pointer={x:.5,y:.5,force:0};
  function resize(){
    const bounds=stage.getBoundingClientRect();
    width=192;height=Math.max(64,Math.min(256,Math.round(width*bounds.height/Math.max(1,bounds.width))));
    canvas.width=width;canvas.height=height;pixels=ctx.createImageData(width,height);
    paint();queue();
  }
  function paint(){
    if(!pixels)return;
    const bounds=stage.getBoundingClientRect();
    const scroll=motion.matches?0:-bounds.top/Math.max(1,bounds.height)*.06;
    const t=time*.22,aspect=width/height;
    const data=pixels.data;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      let u=x/width,v=y/height;
      const dx=(u-mouse.x)*aspect,dy=v-mouse.y;
      const wake=Math.exp(-(dx*dx+dy*dy)*7)*mouse.force;
      u+=dy*wake*.3;v-=dx*wake*.3;
      const sx=u*2.1,sy=v*2.1+scroll;
      const warpX=noise(sx*.8+t*.35,sy*.8-t*.22)-.5;
      const warpY=noise(sx*.8-t*.27+19,sy*.8+t*.31+7)-.5;
      const broad=noise(sx+warpX*.9+t*.18,sy+warpY*.9-t*.12);
      const detail=noise(sx*2.3+warpY*.35-t*.13+11,sy*2.3+warpX*.35+t*.17);
      const cloud=fade(Math.min(1,Math.max(0,(broad*.82+detail*.18-.15)/.7)));
      const tone=216+cloud*39;
      const i=(y*width+x)*4;data[i]=tone;data[i+1]=tone;data[i+2]=tone-.8;data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  }
  function frame(now){
    raf=0;if(!visible||document.hidden||motion.matches)return;
    if(now-last<80){queue();return;}
    const dt=Math.min((now-(last||now-80))/1000,.12);last=now;time+=dt;
    const follow=1-Math.exp(-3*dt);
    mouse.x+=(pointer.x-mouse.x)*follow;mouse.y+=(pointer.y-mouse.y)*follow;
    mouse.force+=(pointer.force-mouse.force)*follow;
    paint();queue();
  }
  function queue(){if(!raf&&visible&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(frame);}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){last=0;paint();queue();}else stop();
  }).observe(stage);
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||motion.matches)return;
    const bounds=stage.getBoundingClientRect();
    pointer={x:(event.clientX-bounds.left)/bounds.width,y:(event.clientY-bounds.top)/bounds.height,force:1};queue();
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{pointer.force=0;},{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():queue());
  motion.addEventListener('change',()=>{stop();paint();queue();});
  resize();
}
