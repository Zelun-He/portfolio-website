import { MistFlow } from './mist-flow.mjs';
import { SPHERE, sphereLayout, sampleSphere, shadeAt, smooth } from './hero-field.mjs';

let canvas,context,field,fieldContext,pixels,width=1,height=1,density=1,fw=1,fh=1;
let atlas=null,layout,flow,cells=[],running=false,reduced=false,time=0,last=0,timer=0,announced=false;
const interval=1000/30;

async function loadSphere(){
  // Reference rotation sheet: https://www.sybiosme.com/media/hero-sphere.avif
  const response=await fetch(new URL('./hero-sphere.avif',import.meta.url));
  if(!response.ok)throw new Error('Sphere image unavailable');
  const bitmap=await createImageBitmap(await response.blob());
  // Keep a small luminance atlas; it is interpolated spatially and between frames.
  const sheet=new OffscreenCanvas(128*SPHERE.columns,128*SPHERE.rows),ctx=sheet.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(bitmap,0,0,sheet.width,sheet.height);bitmap.close();
  const rgba=ctx.getImageData(0,0,sheet.width,sheet.height).data,data=new Uint8Array(sheet.width*sheet.height);
  for(let i=0;i<data.length;i++)data[i]=rgba[i*4];
  atlas={data,width:sheet.width,height:sheet.height,cell:128};paint();
}

function paint(){
  if(!pixels)return;
  const data=pixels.data;
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
    const fx=x/(fw-1)*(flow.width-1),fy=y/(fh-1)*(flow.height-1);
    const dx=reduced?0:flow.sample(flow.dx,fx,fy)*.35,dy=reduced?0:flow.sample(flow.dy,fx,fy)*.35;
    const tone=shadeAt(x+.5,y+.5,fw,fh,time,dx,dy),i=(y*fw+x)*4;
    data[i]=data[i+1]=data[i+2]=tone;data[i+3]=255;
  }
  fieldContext.putImageData(pixels,0,0);
  context.setTransform(density,0,0,density,0,0);context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
  context.drawImage(field,0,0,width,height);
  if(atlas){
    // A fixed page-aligned lattice with round, overlapping highlights. No clipped squares.
    context.save();context.beginPath();context.arc(layout.x,layout.y,layout.radius,0,Math.PI*2);context.clip();
    const pitch=layout.pitch;context.fillStyle='#fff';context.beginPath();
    for(const [x,y,keep] of cells){
      const ink=sampleSphere(atlas,x,y,layout,time)*keep;
      if(ink<.0001)continue;
      const radius=pitch*(.1+.7*ink);
      context.moveTo(x+radius,y);context.arc(x,y,radius,0,Math.PI*2);
    }
    context.fill();context.restore();
  }
  if(!announced&&atlas){announced=true;postMessage({type:'painted'});}
}
function tick(){
  timer=0;if(!running||reduced||!pixels)return;
  const now=performance.now(),dt=Math.min(.064,(now-last)/1000||1/30);last=now;time+=dt;
  const steps=Math.ceil(dt/.025);for(let n=0;n<steps;n++)flow.step(dt/steps);
  paint();timer=setTimeout(tick,Math.max(0,interval-(performance.now()-now)));
}
function schedule(){if(running&&!reduced&&!timer&&pixels){last=performance.now();timer=setTimeout(tick,interval);}}
onmessage=({data})=>{
  if(data.type==='init'){
    canvas=data.canvas;context=canvas.getContext('2d',{alpha:false});
    if(!context){postMessage({type:'error'});return;}
    field=new OffscreenCanvas(1,1);fieldContext=field.getContext('2d',{alpha:false});
    loadSphere().catch(()=>postMessage({type:'error'}));
  }
  if(!context)return;
  if(data.type==='resize'){
    width=data.width;height=data.height;density=data.density;
    canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
    const scale=Math.min(1,160/Math.max(width,height),120/Math.min(width,height));
    fw=Math.max(2,Math.round(width*scale));fh=Math.max(2,Math.round(height*scale));
    field.width=fw;field.height=fh;pixels=fieldContext.createImageData(fw,fh);
    flow=new MistFlow(64,Math.max(32,Math.min(112,Math.round(64*height/width))));
    layout=sphereLayout(width,height,data.headingBottom,data.offerTop);cells=[];
    const pitch=layout.pitch;
    for(let y=pitch/2;y<layout.bottom;y+=pitch)for(let x=pitch/2;x<layout.right;x+=pitch){
      let keep=1;
      for(const [left,top,w,h] of data.holes){
        const dx=Math.max(left-x,x-left-w,0),dy=Math.max(top-y,y-top-h,0);
        keep*=smooth((Math.hypot(dx,dy)-8)/28);
      }
      if(keep>.0001)cells.push([x,y,keep]);
    }
    paint();schedule();
  }
  if(data.type==='pointer'&&!reduced&&running&&flow)for(const stroke of data.strokes)flow.inject(stroke.from,stroke.to,stroke.seconds);
  if(data.type==='state'){
    running=data.running;reduced=data.reduced;
    if(reduced){time=0;flow?.clear();paint();}
    if(!running||reduced){clearTimeout(timer);timer=0;flow?.clear();}else schedule();
  }
};
