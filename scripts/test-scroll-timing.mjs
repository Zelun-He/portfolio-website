import assert from 'node:assert/strict';
import {approach,chapterProgress,shouldRenderFrame} from '../dist/lab/modern/scroll-motion.mjs';

for(const last of [1,3,5]){
  let previous=-1;
  for(let i=0;i<=last*1000;i++){
    const p=chapterProgress(i/1000,last);
    assert.ok(p>=previous-1e-9 && p>=0 && p<=last,'Continuous monotonic chapter interpolation');
    previous=p;
  }
  assert.equal(chapterProgress(last,last),last);
}
assert.ok(chapterProgress(.2,3)>.01,'Chapter transition starts early');
assert.ok(chapterProgress(.8,3)<1,'Chapter transition lasts to the exit');
assert.equal(chapterProgress(.5,3),.5,'Chapter midpoint remains centered');
function settle(frameMs){
  let p=0;
  for(let t=0;t<200;t+=frameMs){
    p=approach(p,1,frameMs/1000,20);
    assert.ok(p>=0 && p<=1,'No smoothing overshoot');
  }
  return p;
}
assert.ok(settle(1000/60)>.97 && settle(1000/30)>.97,'Settles quickly at 30/60Hz');
assert.ok(Math.abs(settle(1000/60)-settle(1000/30))<.02,'Frame-rate independent damping');
assert.equal(approach(0,1,0),0);
assert.equal(approach(1,1,1/60),1);
function count(refresh,renderer){
  let last=0,frames=0;
  for(let i=1;i<=refresh;i++){
    const now=i*1000/refresh;
    if(shouldRenderFrame(now,last,renderer)){frames++;last=now;}
  }
  return frames;
}
for(const hz of [60,120,144]){
  assert.ok(count(hz,'webgl')>=55,'WebGL can update at 60Hz');
  assert.ok(count(hz,'canvas-mesh')<=40,'Canvas fallback remains protected');
}
console.log('Scroll timing regressions passed.');
