// Resource budgets are allocation policies, not measurements of device GPU memory.
export function galleryBudget({width=1440,dpr=1,coarse=false,memory=8,saveData=false}={}){
  const compact=width<=760||coarse||memory<=4||saveData;
  return {textureEdge:compact?1024:2048,density:Math.min(Math.max(1,dpr),compact?1.5:2),decoders:2};
}
export function textureDimensions(width,height,maxEdge=2048,maxTextureSize=4096){
  const cap=2**Math.floor(Math.log2(Math.max(1,Math.min(maxEdge,maxTextureSize))));
  const scale=Math.min(1,cap/Math.max(width,height));
  const pot=value=>Math.min(cap,2**Math.max(0,Math.round(Math.log2(Math.max(1,value*scale)))));
  return {width:pot(width),height:pot(height)};
}
export function textureBytes(width,height){
  let bytes=0;
  do {bytes+=width*height*4;if(width===1&&height===1)break;width=Math.max(1,width>>1);height=Math.max(1,height>>1);}while(true);
  return bytes;
}
export function needsGalleryFrame(position,target,edge,spin){
  return Math.abs(target-position)>.0001||Math.abs(position-edge.position)>.0001||Math.abs(edge.velocity)>.001||Math.abs(spin)>.0001;
}
