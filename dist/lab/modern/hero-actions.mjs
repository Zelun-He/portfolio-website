// Keep the two primary actions independent of the animation modules.
// Anchors remain usable without JavaScript; modified clicks retain browser behavior.
document.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target instanceof Element?event.target.closest('.hero .pill[href]'):null;
  if(!link)return;
  const destination=new URL(link.href,location.href);
  if(destination.origin!==location.origin)return;
  if(destination.hash==='#work-intro'){
    const target=document.getElementById('work-intro');
    if(!target)return;
    event.preventDefault();
    if(location.hash!==destination.hash)history.pushState(null,'',destination.hash);
    target.scrollIntoView({block:'start',behavior:'auto'});
  }else if(destination.pathname==='/resume.pdf'){
    event.preventDefault();
    location.assign(destination.href);
  }
},{capture:true});
