// Small CPU fluid grid: velocity transports a persistent optical displacement.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export class MistFlow {
  constructor(width,height){
    this.width=width;this.height=height;this.size=width*height;
    for(const name of ['vx','vy','nextX','nextY','dx','dy','nextDX','nextDY','pressure','nextPressure','divergence'])this[name]=new Float32Array(this.size);
    this.activity=0;
  }
  sample(field,x,y){
    x=clamp(x,0,this.width-1.001);y=clamp(y,0,this.height-1.001);
    const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,i=iy*this.width+ix;
    return (field[i]*(1-u)+field[i+1]*u)*(1-v)+(field[i+this.width]*(1-u)+field[i+this.width+1]*u)*v;
  }
  inject(from,to,seconds=.016){
    const w=this.width,h=this.height;
    const dx=to.x-from.x,dy=to.y-from.y;
    const length=Math.hypot(dx*w,dy*h);
    if(length<.05)return;
    const speed=Math.hypot(dx,dy)/Math.max(.008,seconds);
    const strength=Math.min(1,2/Math.max(.001,speed));
    const vx=dx*w/Math.max(.008,seconds)*strength*.65;
    const vy=dy*h/Math.max(.008,seconds)*strength*.65;
    const radius=Math.max(3,w*.065),steps=Math.min(12,Math.max(1,Math.ceil(length/(radius*.65))));
    for(let s=1;s<=steps;s++){
      const x=(from.x+dx*s/steps)*(w-1),y=(from.y+dy*s/steps)*(h-1);
      const left=Math.max(1,Math.floor(x-radius*2)),right=Math.min(w-2,Math.ceil(x+radius*2));
      const top=Math.max(1,Math.floor(y-radius*2)),bottom=Math.min(h-2,Math.ceil(y+radius*2));
      for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++){
        const weight=Math.exp(-((col-x)**2+(row-y)**2)/(radius*radius))*.52;
        const i=row*w+col;
        this.vx[i]=clamp(this.vx[i]+vx*weight,-w*2,w*2);
        this.vy[i]=clamp(this.vy[i]+vy*weight,-h*2,h*2);
      }
    }
    this.activity=1;
  }
  step(seconds){
    const dt=clamp(seconds,.001,.05),w=this.width,h=this.height;
    const drag=Math.exp(-dt*2.1),settle=Math.exp(-dt/1.65);
    this.nextX.fill(0);this.nextY.fill(0);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const i=y*w+x,bx=x-this.vx[i]*dt,by=y-this.vy[i]*dt;
      this.nextX[i]=this.sample(this.vx,bx,by)*drag;
      this.nextY[i]=this.sample(this.vy,bx,by)*drag;
    }
    [this.vx,this.nextX]=[this.nextX,this.vx];[this.vy,this.nextY]=[this.nextY,this.vy];
    this.pressure.fill(0);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const i=y*w+x;
      this.divergence[i]=-.5*(this.vx[i+1]-this.vx[i-1]+this.vy[i+w]-this.vy[i-w]);
    }
    for(let pass=0;pass<8;pass++){
      this.nextPressure.fill(0);
      for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
        const i=y*w+x;
        this.nextPressure[i]=(this.divergence[i]+this.pressure[i-1]+this.pressure[i+1]+this.pressure[i-w]+this.pressure[i+w])*.25;
      }
      [this.pressure,this.nextPressure]=[this.nextPressure,this.pressure];
    }
    let peak=0;this.nextDX.fill(0);this.nextDY.fill(0);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const i=y*w+x;
      this.vx[i]-=.5*(this.pressure[i+1]-this.pressure[i-1]);
      this.vy[i]-=.5*(this.pressure[i+w]-this.pressure[i-w]);
      const bx=x-this.vx[i]*dt,by=y-this.vy[i]*dt;
      this.nextDX[i]=clamp((this.sample(this.dx,bx,by)+this.vx[i]/w*dt)*settle,-.12,.12);
      this.nextDY[i]=clamp((this.sample(this.dy,bx,by)+this.vy[i]/h*dt)*settle,-.12,.12);
      peak=Math.max(peak,Math.abs(this.nextDX[i]),Math.abs(this.nextDY[i]));
    }
    [this.dx,this.nextDX]=[this.nextDX,this.dx];[this.dy,this.nextDY]=[this.nextDY,this.dy];
    this.activity=peak;
  }
  clear(){
    for(const value of Object.values(this))if(value instanceof Float32Array)value.fill(0);
    this.activity=0;
  }
}
