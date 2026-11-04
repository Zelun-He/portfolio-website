import { localPoint, worldPoint, projectPoint } from './showcase-geometry.mjs';

const translucentLayers=new WeakMap();
function layerFor(ctx){
  let layer=translucentLayers.get(ctx);
  if(!layer){
    const canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1):ctx.canvas.ownerDocument.createElement('canvas');
    layer=canvas.getContext('2d',{alpha:true});
    if(!layer)throw new Error('Transparent gallery surface unavailable');
    translucentLayers.set(ctx,layer);
  }
  if(layer.canvas.width!==ctx.canvas.width||layer.canvas.height!==ctx.canvas.height){
    layer.canvas.width=ctx.canvas.width;layer.canvas.height=ctx.canvas.height;
  }
  return layer;
}

// Rasterize the curved surface at final screen resolution, without CSS layer upscaling.
export function paintMesh(ctx, images, scene, frames, density = 1) {
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.setTransform(density,0,0,density,0,0);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const columns=scene.width<700?36:48,rows=scene.width<700?6:8;
  for(const frame of frames){
    const image=images[frame.index];ctx.globalAlpha=frame.opacity;
    const paint=frame.translucent?layerFor(ctx):ctx;
    if(frame.translucent){
      paint.setTransform(1,0,0,1,0,0);paint.clearRect(0,0,paint.canvas.width,paint.canvas.height);
      paint.setTransform(density,0,0,density,0,0);
      // Replace overlapping triangle edges so the tint does not darken at each seam.
      paint.globalCompositeOperation='copy';paint.globalAlpha=1;
      paint.imageSmoothingEnabled=true;paint.imageSmoothingQuality='high';
    }
    const vertices=[];
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
      const u=x/columns,v=y/rows;
      const screen=projectPoint(scene,worldPoint(localPoint(scene,frame,u,v),frame));
      vertices.push({x:screen[0],y:screen[1],s:u*image.width,t:(1-v)*image.height});
    }
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const i=y*(columns+1)+x;
      triangle(paint,image,vertices[i],vertices[i+1],vertices[i+columns+1]);
      triangle(paint,image,vertices[i+columns+1],vertices[i+1],vertices[i+columns+2]);
    }
    if(frame.translucent)ctx.drawImage(paint.canvas,0,0,scene.width,scene.height);
  }
  ctx.globalAlpha=1;
}

function triangle(ctx,image,p,q,r){
  // Cull the back-facing half as the card turns edge-on.
  const area=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  if(area>=-0.01)return;
  const denominator=p.s*(q.t-r.t)+q.s*(r.t-p.t)+r.s*(p.t-q.t);
  if(Math.abs(denominator)<1e-8)return;
  function coefficients(key){
    return [
      (p[key]*(q.t-r.t)+q[key]*(r.t-p.t)+r[key]*(p.t-q.t))/denominator,
      (p[key]*(r.s-q.s)+q[key]*(p.s-r.s)+r[key]*(q.s-p.s))/denominator,
      (p[key]*(q.s*r.t-r.s*q.t)+q[key]*(r.s*p.t-p.s*r.t)+r[key]*(p.s*q.t-q.s*p.t))/denominator
    ];
  }
  const [a,c,e]=coefficients('x'),[b,d,f]=coefficients('y');
  const cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;
  ctx.save();ctx.beginPath();
  for(const [i,point] of [p,q,r].entries()){
    const dx=point.x-cx,dy=point.y-cy,length=Math.max(1,Math.hypot(dx,dy));
    const x=point.x+dx/length*.45,y=point.y+dy/length*.45;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,e,f);
  // Include enough source texels for the expanded clip, even when the card is small.
  const determinant=Math.abs(a*d-b*c);
  const padding=Math.min(64,Math.ceil(.75*Math.max(Math.hypot(d,b),Math.hypot(c,a))/Math.max(determinant,1e-8))+1);
  const left=Math.max(0,Math.floor(Math.min(p.s,q.s,r.s))-padding);
  const top=Math.max(0,Math.floor(Math.min(p.t,q.t,r.t))-padding);
  const width=Math.min(image.width-left,Math.ceil(Math.max(p.s,q.s,r.s))-left+padding);
  const height=Math.min(image.height-top,Math.ceil(Math.max(p.t,q.t,r.t))-top+padding);
  if(width>0&&height>0)ctx.drawImage(image,left,top,width,height,left,top,width,height);
  ctx.restore();
}
