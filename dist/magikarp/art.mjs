// Original, code-drawn pixel art. Native pixels stay aligned at every scale.
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
const FONT={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],J:['001','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],Q:['010','101','101','011','001'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],Z:['111','001','010','100','111'],'!':['010','010','010','000','010'],'←':['010','100','111','100','010'],'→':['010','001','111','001','010']};
export function pixelText(c,text,x,y,color='#24493d'){
 const chars=[...text.toUpperCase()],left=Math.round(x-(chars.length*4-1)/2);c.fillStyle=color;
 chars.forEach((char,i)=>(FONT[char]||[]).forEach((row,dy)=>[...row].forEach((bit,dx)=>{if(bit==='1')c.fillRect(left+i*4+dx,Math.round(y)+dy,1,1);})))
}
export function fishSprite(frame=0){
 const a=document.createElement('canvas');a.width=40;a.height=30;const c=a.getContext('2d');
 const p=(color,x,y,w,h)=>rect(c,color,x,y,w,h);
 // A round coral body, split cream tail, three-point crown, open mouth and whiskers.
 for(const [x,y,w,h] of [[1,7,2,15],[3,9,2,11],[5,11,2,7],[7,13,3,3]])p('#8d653e',x,y,w,h);
 p('#fff2ce',2,8,1,13);p('#f4e4b5',3,10,2,9);p('#d4bd86',4,12,2,5);p('#f8e9ba',6,12,2,5);
 p('#9a7734',15,3,3,6);p('#f2d369',16,3,2,6);p('#977333',19,0,3,9);p('#ffe18b',20,1,2,8);p('#f5d06a',23,3,3,6);
 const widths=[12,16,20,22,24,25,26,26,26,25,24,23,21,18,14];
 widths.forEach((w,i)=>{const x=20-Math.floor(w/2),y=7+i;p('#934b33',x,y,w,1);p(i<5?'#f19a59':i<10?'#e47b43':'#cc6339',x+1,y,w-2,1);});
 p('#f7b76d',14,8,12,2);p('#f9bd77',10,11,6,3);p('#b14f31',12,19,15,2);
 for(const [x,y] of [[17,11],[13,14],[20,14],[17,17],[24,18]]){p('#ffc583',x,y,3,1);p('#bb5937',x+2,y+1,1,1);}
 const fy=frame?19:18;p('#ad8649',17,fy,2,9);p('#fff0c9',18,fy,3,8);p('#f4d78d',21,fy+2,3,5);p('#d8b46e',21,fy+6,4,1);p('#8e693c',19,fy+8,4,1);
 p('#8d5439',27,9,6,7);p('#fff6d9',27,9,5,6);p('#183c38',30,10,2,4);p('#fff9e9',30,10,1,1);
 p('#f4d2a2',32,15,3,7);p('#9b5037',33,16,2,4);p('#ffedc6',34,15,2,1);p('#ffedc6',34,21,2,1);
 const wy=frame?19:18;p('#f1cf68',35,wy,4,1);p('#f1cf68',38,wy-3,1,4);p('#f1cf68',31,22,1,5);p('#f1cf68',32,26,5,1);
 return a;
}
export function tree(c,x,y,variant=0){
 const p=(color,dx,dy,w,h)=>rect(c,color,x+dx,y+dy,w,h);
 p('#274e4335',-8,9,28,8);p('#735e3b',4,0,7,17);p('#af8450',7,4,3,11);
 p('#245b41',-5,-13,26,18);p('#245b41',-2,-22,20,10);p('#245b41',3,-27,10,8);p('#34794a',-3,-14,22,15);p('#34794a',0,-22,16,12);p('#4a9453',2,-22,11,8);p('#5ca25c',5,-26,6,6);p('#6caf63',0,-10,8,3);p('#4a9453',8,-5,11,6);p('#1e513b',-4,3,25,3);p('#264e39',2,6,14,2);
 if(variant)p('#8eb66b',7,-20,3,2);
}
export function building(c,s,visited){
 const x=s.x*16,y=s.y*16,w=s.w*16,h=s.h*16;const p=(color,dx,dy,rw,rh)=>rect(c,color,x+dx,y+dy,rw,rh);
 p('#254a392b',4,h-4,w+5,10);
 if(s.kind==='lighthouse'){
  p('#899583',14,10,w-28,h-8);p('#f4edd1',17,10,w-34,h-11);p('#d9d5b9',17,44,w-34,9);p('#aab39d',13,17,w-26,4);p('#e3ac61',14,3,w-28,17);p('#f7dc89',19,6,w-38,10);p('#406f68',23,8,w-46,7);p('#d9a152',12,0,w-24,5);p('#ecdcb1',8,20,w-16,5);p('#304e42',w/2-7,h-19,14,17);p('#b8d8c4',w/2-5,30,10,10);
 }else{
  p('#58705a',0,23,w,h-23);p('#e7dfbd',3,25,w-6,h-28);p('#f1e8cb',3,27,w-6,8);p('#c1bd9d',3,h-10,w-6,6);
  p('#74564d',-4,9,w+8,23);p(s.color,-2,7,w+4,22);p(s.color,4,2,w-8,6);p('#f5e1b477',4,4,w-8,2);
  for(let row=12;row<29;row+=6){p('#563c4733',-1,row,w+2,1);for(let col=6+(row%12);col<w-2;col+=14)p('#fff1c022',col,row-3,1,3);}
  p('#664f48',-4,30,w+8,3);p('#f2dec2',0,33,w,3);
  for(const wx of [12,w-28]){p('#687b6c',wx,43,18,17);p('#80bbc4',wx+2,45,14,12);p('#d6f0dd',wx+3,46,7,2);p('#d3d8b8',wx+8,44,2,14);p('#d3d8b8',wx+1,51,16,2);p('#b7b99a',wx-2,60,22,3);}
  const dx=s.door[0]*16-x;p('#6b694f',dx-2,h-24,20,22);p('#38564b',dx,h-22,16,20);p('#54715a',dx+2,h-20,11,18);p('#e6c673',dx+11,h-12,2,2);
  if(s.kind==='market'){for(let k=0;k<w;k+=12)p(k%24?'#fff0bc':'#d7a64e',k,32,12,9);p('#eadbb6',2,41,3,25);p('#eadbb6',w-5,41,3,25);}
  if(s.kind==='lab'){p('#778a82',w-21,-7,8,14);p('#b7d8c8',w-19,-6,4,7);p('#eeeacb',w-23,-9,12,3);}
  if(s.kind==='school'){p('#e9cf78',w/2-10,12,20,14);pixelText(c,'MSU',x+w/2,y+16,'#5f6345',6);}
  if(s.kind==='studio'){p('#f1dbbb',w/2-14,11,28,13);pixelText(c,'UP',x+w/2,y+14,'#8a4d42',7);}
 }
 // Stepping stone and a readable floating destination plaque.
 const doorX=s.door[0]*16;rect(c,'#d3c294',doorX-3,(s.door[1])*16,22,9);rect(c,'#b9ad82',doorX-3,s.door[1]*16+9,22,2);
 const labelW=s.short.length*5+15,lx=x+w/2-labelW/2;
 rect(c,'#294f43',lx,y-19,labelW,12);rect(c,'#fff4d8',lx+1,y-18,labelW-2,10);pixelText(c,s.short,x+w/2,y-16,'#345548',6);
 if(visited){rect(c,'#9e7836',lx+labelW-4,y-22,7,7);rect(c,'#f3ce67',lx+labelW-3,y-21,5,5);}
}
export function npc(c,x,y,kind,time){
 const p=(color,dx,dy,w,h)=>rect(c,color,x+dx,y+dy,w,h);p('#264d3b35',-5,10,12,4);p('#44584a',-3,8,3,4);p('#44584a',2,8,3,4);p(kind==='lab'?'#ede9cf':'#8f7fba',-4,0,10,9);p('#f1ce9d',-4,-7,10,8);p('#7c6348',-5,-9,12,4);p(kind==='lab'?'#dddcc5':'#d3ba75',-3,-12,8,4);p('#304c42',2,-4,1,2);p('#f1ce9d',-6,2,2,5);p('#f1ce9d',6,2,2,5);
}
export function terrain(c,world){
 const colors={sea:'#4e91b2',water:'#5fa6b9',grass:'#8fbd6d',sand:'#e4d39d',path:'#e5cea0',bridge:'#bb9860'};
 for(let y=0;y<world.tiles.length;y++)for(let x=0;x<world.tiles[y].length;x++){
  const type=world.tiles[y][x],px=x*16,py=y*16,n=(x*137+y*331)%19;rect(c,colors[type],px,py,16,16);
  if(type==='grass'){if(n<11){rect(c,'#75a95d',px+3+n%5,py+4,1,2);rect(c,'#9cc779',px+7,py+9+n%3,3,1);}if(world.tiles[y+1]?.[x]==='water')rect(c,'#477c56',px,py+14,16,2);}
  if(type==='sand'||type==='path'){rect(c,type==='sand'?'#c9b982':'#cdb78a',px+3+n%8,py+4+n%6,1,1);if(n<4)rect(c,'#eee0b2',px+10,py+12,2,1);}
  if(type==='water'||type==='sea'){rect(c,type==='sea'?'#66a6bc':'#83c0c5',px+3+(n%3),py+6,6,1);rect(c,'#3c8da6',px+10,py+12,3,1);}
  if(type==='bridge'){rect(c,'#d5b57b',px+1,py+1,14,3);rect(c,'#846d4d',px,py+7,16,1);rect(c,'#846d4d',px,py+15,16,1);if(x===21||x===23){rect(c,'#785f43',px+(x===21?0:14),py,2,16);rect(c,'#e6c58b',px+(x===21?0:14),py,2,3);}}
 }
 // Shore rocks, tiny flowers, and dock mooring posts.
 for(let y=2;y<34;y+=3)for(const x of [2,41]){rect(c,'#5c8f90',x*16,y*16,13,10);rect(c,'#8aaba1',x*16+2,y*16,8,3);}
 for(const d of world.decor.filter(d=>d.kind==='flower')){const x=d.x*16,y=d.y*16;rect(c,'#669455',x+6,y+4,2,7);rect(c,'#eacd79',x+3,y+3,7,2);rect(c,'#f6ead1',x+5,y+1,3,6);rect(c,'#d88d63',x+6,y+3,1,2);}
 rect(c,'#a78656',20*16,23*16,16,18);rect(c,'#d9be83',20*16+2,23*16,12,3);rect(c,'#f1ddab',20*16-2,23*16-14,20,13);pixelText(c,'HI!',20*16+8,23*16-11,'#557457',6);
}
