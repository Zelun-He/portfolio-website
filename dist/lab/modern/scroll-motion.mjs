// Browser-native scrolling; only visual animation catches up to its position.
export function approach(current,target,seconds,response=20){
  const dt=Math.max(0,Math.min(0.05,seconds));
  const value=current+(target-current)*(1-Math.exp(-Math.max(0,response)*dt));
  return Math.abs(target-value)<.002?target:value;
}
// The previous middle-30% transition let coarse wheel steps skip most of a chapter.
export function chapterProgress(raw,lastChapter){
  const end=Math.max(1,lastChapter),value=Math.max(0,Math.min(end,raw));
  if(value>=end)return end;
  const whole=Math.floor(value),phase=Math.max(0,Math.min(1,(value-whole-.08)/.84));
  return whole+phase*phase*(3-2*phase);
}
// WebGL uses the display's cadence; the CPU-heavy Canvas fallback stays near 30 fps.
export function shouldRenderFrame(now,last,rendererKind){
  return !last||now-last>=(rendererKind==='webgl'?12:30);
}
