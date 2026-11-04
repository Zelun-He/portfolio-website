// Hero geometry follows the reference's responsive sphere crop and 63-frame rotation.
export const clamp = (n,a=0,b=1) => Math.min(b,Math.max(a,n));
export const smooth = n => { n=clamp(n);return n*n*(3-2*n); };
export const SPHERE = Object.freeze({columns:8,rows:8,frames:63,fps:20});

export function sphereLayout(width,height,headingBottom=0){
  const desktop=width>=1024,tablet=width>=768;
  const d=desktop?1.64:tablet?2:2.98;
  const x=desktop?.29:tablet?.35:.22,y=desktop?.69:tablet?.55:.60;
  const mask=desktop?[.02,.328,.33,.10]:tablet?[.22,0,.36,0]:[0,0,.28,0];
  return {size:Math.min(width*d,height*4)*1.09,x:width*(x-.06),y:height*(y+.05),
    left:width*mask[3],right:width*(1-mask[1]),
    top:Math.max(height*mask[0],desktop?0:headingBottom),bottom:height*(1-mask[2]),
    softLeft:width*.17,softRight:width*.005,
    softTop:desktop?height*.005:Math.max(1,headingBottom*.12),softBottom:height*.125,
    pitch:6.93};
}

export function sphereMask(x,y,layout){
  return smooth((x-layout.left)/layout.softLeft)*smooth((layout.right-x)/layout.softRight)
    *smooth((y-layout.top)/layout.softTop)*smooth((layout.bottom-y)/layout.softBottom);
}

export function sampleSphere(atlas,x,y,layout,seconds){
  if(!atlas)return 0;
  // The sprite stores highlights, not a finished halftone. Sample between frames.
  const u=.5-(x-layout.x)/layout.size,v=.5+(y-layout.y)/layout.size;
  if(u<0||u>1||v<0||v>1)return 0;
  const frame=(Math.max(0,seconds)*SPHERE.fps)%SPHERE.frames;
  const a=Math.floor(frame),b=(a+1)%SPHERE.frames,f=frame-a;
  const tap=index=>{
    const tx=(index%8)*atlas.cell+clamp(u)* (atlas.cell-1);
    const ty=Math.floor(index/8)*atlas.cell+clamp(v)* (atlas.cell-1);
    const ix=Math.floor(tx),iy=Math.floor(ty),sx=tx-ix,sy=ty-iy;
    const j=iy*atlas.width+ix,right=Math.min(ix+1,atlas.width-1)-ix,down=Math.min(iy+1,atlas.height-1)-iy;
    const top=atlas.data[j]*(1-sx)+atlas.data[j+right]*sx;
    const bottom=atlas.data[j+down*atlas.width]*(1-sx)+atlas.data[j+down*atlas.width+right]*sx;
    return (top*(1-sy)+bottom*sy)/255;
  };
  const level=tap(a)*(1-f)+tap(b)*f;
  return Math.pow(clamp((level-.1)/.9),1.6)*sphereMask(x,y,layout);
}

// Two moving grey fields, with the same scale, phase and pace as the reference.
// The fluid wake displaces only this field; it does not drag the rotating sphere.
export function shadeAt(x,y,width,height,seconds,dx=0,dy=0){
  const unit=Math.min(width,height),ux=(x-width/2)/unit+dx,uy=(height/2-y)/unit-dy;
  const lx=-uy,ly=ux,radius=smooth(Math.hypot(lx,ly)),centre=1-radius;
  const t=(seconds+41.5)*.5;
  let wx=lx+.5,wy=ly+.5;
  for(let octave=1;octave<=2;octave++){
    wx+=.4*centre/octave*Math.sin(t+octave*.4*smooth(wy))*Math.cos(t*.2+octave*2.4*smooth(wy));
    wy+=.4*centre/octave*Math.cos(t+octave*2*smooth(wx));
  }
  const angle=-1.8*radius;
  const sx=(wx-.5)*Math.cos(angle)-(wy-.5)*Math.sin(angle)+.5;
  const sy=(wx-.5)*Math.sin(angle)+(wy-.5)*Math.cos(angle)+.5;
  let total=0,colour=0;
  for(let i=0;i<2;i++){
    const a=i*.37,px=.5+.5*Math.sin(t*(.6+i*.3)+a),py=.5+.5*Math.cos(t*(.8+(i+1)/4)+a*1.5);
    const tile=Math.floor((sx-px)/1.5);
    for(let neighbor=0;neighbor<2;neighbor++){
      const distance=Math.hypot(sx-px-(tile+neighbor)*1.5,sy-py),weight=1/(distance**3.5+.001);
      total+=weight;colour+=(i===0?130:84)*weight;
    }
  }
  return colour/total;
}
