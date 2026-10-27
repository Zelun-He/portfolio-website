import { STATIONS } from './data.mjs';
export const TILE=16, WIDTH=44, HEIGHT=36, SPAWN={x:22,y:23};
export const keyFor=(x,y)=>`${x},${y}`;
export function createWorld(){
 const tiles=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>{
  if(x<3||x>40||y<2||y>33)return 'sea';
  if(x<5||x>38||y<4||y>31)return 'sand';
  return 'grass';
 }));
 const blocked=new Set(),decor=[];
 // A continuous canal. Magikarp can swim or flop; both banks remain reachable.
 for(let y=18;y<=21;y++)for(let x=3;x<=40;x++)tiles[y][x]='water';
 const path=(x0,y0,x1,y1)=>{for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)for(let d=-1;d<=1;d++){if(tiles[y0+d]?.[x]&&!['sea','water'].includes(tiles[y0+d][x]))tiles[y0+d][x]='path';}for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let d=-1;d<=1;d++){if(tiles[y]?.[x1+d]&&!['sea','water'].includes(tiles[y][x1+d]))tiles[y][x1+d]='path';}};
 path(10,14,33,14);path(10,30,33,30);path(22,8,22,31);path(11,12,11,14);path(32,11,32,14);path(10,23,10,30);path(32,23,32,30);path(10,23,33,23);
 for(let y=17;y<=22;y++)for(let x=21;x<=23;x++)tiles[y][x]='bridge';
 for(const s of STATIONS)for(let y=s.y;y<s.y+s.h;y++)for(let x=s.x;x<s.x+s.w;x++)blocked.add(keyFor(x,y));
 const reserved=(x,y)=>STATIONS.some(s=>x>=s.x-2&&x<=s.x+s.w+1&&y>=s.y-1&&y<=s.y+s.h+2)||Math.abs(x-SPAWN.x)<4&&Math.abs(y-SPAWN.y)<3;
 const tree=(x,y)=>{if(tiles[y]?.[x]!=='grass'||reserved(x,y)||blocked.has(keyFor(x,y)))return;blocked.add(keyFor(x,y));decor.push({kind:'tree',x,y});};
 for(let y=4;y<=31;y+=2)for(let x=5;x<=38;x+=2){if(x<7||x>36||y===4||y===31||(x*19+y*7)%23<4)tree(x,y);}
 for(let y=4;y<32;y++)for(let x=5;x<39;x++){if(tiles[y][x]==='grass'&&!blocked.has(keyFor(x,y))&&!reserved(x,y)&&(x*31+y*17)%39===0)decor.push({kind:'flower',x,y});}
 // Boundary rocks make the edge visible and keep the camera inside the world.
 for(let x=2;x<42;x++){blocked.add(keyFor(x,1));blocked.add(keyFor(x,34));}
 for(let y=1;y<35;y++){blocked.add(keyFor(2,y));blocked.add(keyFor(41,y));}
 return {tiles,blocked,decor,stations:STATIONS};
}
export function canWalk(world,x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=3&&x<=40&&y>=2&&y<=33&&!world.blocked.has(keyFor(x,y));}
export function findPath(world,start,goal){
 if(!canWalk(world,goal.x,goal.y)||!canWalk(world,start.x,start.y))return [];
 const queue=[start],parents=new Map([[keyFor(start.x,start.y),null]]);let cursor=0;
 while(cursor<queue.length){const p=queue[cursor++];if(p.x===goal.x&&p.y===goal.y){const out=[];let k=keyFor(p.x,p.y);while(parents.get(k)!==null){const [x,y]=k.split(',').map(Number);out.push({x,y});k=parents.get(k);}return out.reverse();}
  for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const n={x:p.x+dx,y:p.y+dy},k=keyFor(n.x,n.y);if(canWalk(world,n.x,n.y)&&!parents.has(k)){parents.set(k,keyFor(p.x,p.y));queue.push(n);}}
 }return [];
}
export function nearestStation(x,y,radius=2){return STATIONS.map(s=>({station:s,distance:Math.abs(s.door[0]-x)+Math.abs(s.door[1]-y)})).filter(s=>s.distance<=radius).sort((a,b)=>a.distance-b.distance)[0]?.station??null;}
export function loadProgress(storage){try{const value=JSON.parse(storage.getItem('zelun-splash-v1')||'[]');return new Set(Array.isArray(value)?value.filter(x=>STATIONS.some(s=>s.id===x)):[]);}catch{return new Set();}}
export function saveProgress(storage,visited){try{storage.setItem('zelun-splash-v1',JSON.stringify([...visited].filter(id=>STATIONS.some(s=>s.id===id))));return true;}catch{return false;}}
