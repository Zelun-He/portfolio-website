import { paintMesh } from './showcase-painter.mjs';
let canvas,ctx,images,scene,density=1;
onmessage=({data})=>{
  if(data.type==='init'){
    canvas=data.canvas;images=data.images;ctx=canvas.getContext('2d',{alpha:true});
    postMessage({type:ctx?'ready':'error'});
  }
  if(data.type==='resize'&&ctx){
    scene=data.scene;density=data.density;
    canvas.width=Math.max(1,Math.round(scene.width*density));
    canvas.height=Math.max(1,Math.round(scene.height*density));
  }
  if(data.type==='frame'&&ctx&&scene){
    const start=performance.now();paintMesh(ctx,images,scene,data.frames,density);
    postMessage({type:'painted',milliseconds:performance.now()-start});
  }
};
