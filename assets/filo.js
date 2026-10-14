(function(){
var fig=document.querySelector('.filo');if(!fig||!window.fetch)return;
var BASE='/assets/filo/',Q=function(q){return fig.querySelector(q)};
function boot(G){
var NS='http://www.w3.org/2000/svg',BB=G.bb,YEL='#f2ff00';
var $=function(i){return document.getElementById(i)},cl=function(x){return x<0?0:x>1?1:x},ease=function(x){x=cl(x);return x*x*(3-2*x)},lerp=function(a,b,u){return a+(b-a)*u};
var svg=Q('.filo-svg'),zg=Q('.filo-z'),stage=Q('.filo-stage'),cvs=Q('.filo-cv'),ctx=cvs.getContext('2d'),gridEl=Q('.filo-grid'),rep=Q('.filo-rep'),ttl=Q('.filo-title');
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||zg).appendChild(e);return e}
function lay(h,m,o){return el('image',{href:h,x:800-800*m,y:450-450*m,width:1600*m,height:900*m,preserveAspectRatio:'none',opacity:o})}
var l0=lay(BASE+'l0.webp',24,1),l1=lay(BASE+'l1.webp',4,0),det=lay(BASE+'detail.webp',1,0);
var cp=el('clipPath',{id:'filo-rev'}),rc=el('circle',{cx:800,cy:450,r:0},cp);
var net=el('g',{'class':'oth','clip-path':'url(#filo-rev)'});
G.others.forEach(function(o){el('path',{d:o[0]},net)});
var chain=G.chain.map(function(d){return el('path',{d:d,'class':'ch'},net)});
var area=el('path',{d:G.perim,'class':'area'});
var fc=el('image',{href:BASE+'fc.webp',x:BB[0],y:BB[1],width:BB[2]-BB[0],height:BB[3]-BB[1],opacity:0});
var chm=el('image',{href:BASE+'chm.webp',x:BB[0],y:BB[1],width:BB[2]-BB[0],height:BB[3]-BB[1],opacity:0});
var per=el('path',{d:G.perim,'class':'per',pathLength:1000});
var pts=G.pts.map(function(p){return el('circle',{cx:p[0],cy:p[1],r:8,'class':'pt'})});
var SEL=0,best=1e9;G.pts.forEach(function(p,i){var d=Math.hypot(p[0]-800,p[1]-450);if(d<best){best=d;SEL=i}});
var P=G.pts[SEL],LL=G.ll[SEL];
var mob=false,VBW=1600;
function view(){mob=window.matchMedia('(max-width:600px)').matches;VBW=mob?900:1600;svg.setAttribute('viewBox',mob?'350 0 900 900':'0 130 1600 640');var cw=Math.max(640,Math.min(1600,Math.round((stage.clientWidth||1280)*Math.min(window.devicePixelRatio||1,1.5))));cvs.width=cw;cvs.height=mob?cw:Math.round(cw*.4)}
view();window.addEventListener('resize',function(){view();draw(cur)});
/* ---- alberi poligonali (vertici indicizzati), terreno, bosco ---- */
function rng(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function tree(H,CR,NR,NV,seed,tiers){var r=rng(seed),u=function(a,b){return a+(b-a)*r()},zb=.14*H,V=[],i,j;
 for(i=0;i<NR;i++){var f=i/(NR-1),saw=1-((f*tiers)%1),rad=CR*Math.pow(1-f,.82)*(.62+.38*saw)*u(.92,1.08),z=zb+(H*.985-zb)*f;
  for(j=0;j<NV;j++){var a=(j+(i%2)*.5)/NV*6.2832+u(-.05,.05),rr=rad*u(.9,1.1);V.push(rr*Math.cos(a),rr*Math.sin(a),z)}}
 var apex=V.length/3;V.push(0,0,H);var bot=V.length/3;V.push(0,0,zb);
 var tw=Math.max(.12,H*.012),tt=zb+.5,tb=V.length/3,NT=6;
 for(j=0;j<NT;j++){var a=j/NT*6.2832;V.push(tw*Math.cos(a),tw*Math.sin(a),0)}
 for(j=0;j<NT;j++){var a=j/NT*6.2832;V.push(tw*Math.cos(a),tw*Math.sin(a),tt)}
 var T=[];function add(a,b,c,tr){T.push([a,b,c,tr?1:0,(V[a*3+2]+V[b*3+2]+V[c*3+2])/3/H])}
 for(i=0;i<NR-1;i++)for(j=0;j<NV;j++){var A=i*NV+j,B=i*NV+(j+1)%NV,C=(i+1)*NV+j,D=(i+1)*NV+(j+1)%NV;add(A,B,C);add(B,D,C)}
 for(j=0;j<NV;j++){add((NR-1)*NV+j,(NR-1)*NV+(j+1)%NV,apex);add(j,(j+1)%NV,bot)}
 for(j=0;j<NT;j++){var j1=(j+1)%NT;add(tb+j,tb+j1,tb+NT+j,1);add(tb+j1,tb+NT+j1,tb+NT+j,1)}
 var Es={},E=[];T.forEach(function(t){for(var k=0;k<3;k++){var a=t[k],b=t[(k+1)%3],key=a<b?a+'_'+b:b+'_'+a;if(!Es[key]){Es[key]=1;E.push(a,b)}}});
 return{V:new Float32Array(V),T:T,E:new Uint16Array(E),n:V.length/3}}
var H=26.5,CR=3.3,DBH=1.25*H+6,VOL=.45*Math.PI/4*Math.pow(DBH/100,2)*H;
var HERO=tree(H,CR,26,18,77,7);
/* illuminazione fissa dell'albero campione */
(function(){var L=[-.5,-.4,.77],ln=Math.hypot(L[0],L[1],L[2]);HERO.lit=HERO.T.map(function(t){var V=HERO.V,a=t[0]*3,b=t[1]*3,c=t[2]*3;
 var e1=[V[b]-V[a],V[b+1]-V[a+1],V[b+2]-V[a+2]],e2=[V[c]-V[a],V[c+1]-V[a+1],V[c+2]-V[a+2]];
 var n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],nl=Math.hypot(n[0],n[1],n[2])||1;
 var gx=(V[a]+V[b]+V[c])/3,gy=(V[a+1]+V[b+1]+V[c+1])/3;if(n[0]*gx+n[1]*gy<0)n=[-n[0],-n[1],-n[2]];
 return{n:[n[0]/nl,n[1]/nl,n[2]/nl],lit:Math.max(0,(n[0]*L[0]+n[1]*L[1]+n[2]*L[2])/(nl*ln))}})})();
function ter(x,y){return .34*y+4.2*Math.sin(x*.052+1.1)+3.1*Math.sin(y*.047+.4)+1.8*Math.sin((x+y)*.083)}
var T0=ter(0,0),TN=13,TR=new Float32Array((TN+1)*(TN+1)*3),ti=0;
for(var gi=0;gi<=TN;gi++)for(var gj=0;gj<=TN;gj++){var gx=(gi/TN-.5)*2*125,gy=(gj/TN-.5)*2*125;TR[ti++]=gx;TR[ti++]=gy;TR[ti++]=ter(gx,gy)-T0+(Math.sin(gx*.31)*Math.cos(gy*.27))*.5}
/* bosco digitalizzato: molti alberi, due livelli di dettaglio */
var rr=rng(4242),FOREST=[],VAR=[tree(24,3.0,10,7,11,6),tree(19,2.5,9,7,12,5),tree(28,3.4,11,8,13,6)];
var SP=6.4,RX=215,RY=140;
for(var gx_=-RX;gx_<=RX;gx_+=SP)for(var gy_=-RY;gy_<=RY;gy_+=SP){var x=gx_+(rr()-.5)*SP*.8,y=gy_+(rr()-.5)*SP*.8;
 if(Math.hypot(x,y)<5.5||rr()<.12)continue;
 var s_=.75+.5*rr(),m=VAR[Math.floor(rr()*3)],r_=rr()*6.28,z_=ter(x,y)-T0,ca=Math.cos(r_),sa=Math.sin(r_),d_=Math.hypot(x,y),lod=d_<52?1:2,fr=rr();
 var f={x:x,y:y,z:z_,s:s_,lod:lod,fr:fr,d:d_};
 if(lod===1){var W3=new Float32Array(m.n*3);for(var q=0;q<m.n;q++){var px=m.V[q*3],py=m.V[q*3+1],pz=m.V[q*3+2];W3[q*3]=x+(px*ca-py*sa)*s_;W3[q*3+1]=y+(px*sa+py*ca)*s_;W3[q*3+2]=z_+pz*s_}f.W=W3;f.m=m}
 else{var R=3.0*s_,Hh_=22*s_,W3=new Float32Array(15*3);for(var q=0;q<8;q++){W3[q*3]=x+R*Math.cos(q/8*6.2832);W3[q*3+1]=y+R*Math.sin(q/8*6.2832);W3[q*3+2]=z_+Hh_*.12}
  for(var q=0;q<4;q++){W3[(8+q)*3]=x+R*.62*Math.cos(q/4*6.2832+.4);W3[(8+q)*3+1]=y+R*.62*Math.sin(q/4*6.2832+.4);W3[(8+q)*3+2]=z_+Hh_*.55}
  W3[36]=x;W3[37]=y;W3[38]=z_+Hh_;f.W=W3}
 FOREST.push(f)}
function dms(v,pos,neg){var s=v<0?neg:pos;v=Math.abs(v);var d=Math.floor(v),m=Math.floor((v-d)*60),sec=Math.round(((v-d)*60-m)*60);return d+'°'+('0'+m).slice(-2)+'′'+('0'+sec).slice(-2)+'″'+s}
var ROWS=[['Survey date','2 October 2026, 14:00 (UTC+2)'],['Position',dms(LL[0],'N','S')+' '+dms(LL[1],'E','W')],['Species','Picea abies'],['Height',H.toFixed(1)+' m'],['Diameter at 1.3 m',Math.round(DBH)+' cm'],['Crown diameter',(CR*2.1).toFixed(1)+' m'],['Volume',VOL.toFixed(2)+' m³']];
/* camera */
var C={};
function setCam(phi,el_,D,cxp,cyp,f){var tz=H*.42,ce=Math.cos(el_),se=Math.sin(el_);
 C.px=D*ce*Math.cos(phi);C.py=D*ce*Math.sin(phi);C.pz=tz+D*se;
 var fx=-C.px,fy=-C.py,fz=tz-C.pz,fl=Math.hypot(fx,fy,fz);fx/=fl;fy/=fl;fz/=fl;
 var rx=fy,ry=-fx,rz=0,rl=Math.hypot(rx,ry);rx/=rl;ry/=rl;
 C.fx=fx;C.fy=fy;C.fz=fz;C.rx=rx;C.ry=ry;C.ux=ry*fz-rz*fy;C.uy=rz*fx-rx*fz;C.uz=rx*fy-ry*fx;C.cx=cxp;C.cy=cyp;C.f=f}
var O=[0,0,0];
function pj(x,y,z){var vx=x-C.px,vy=y-C.py,vz=z-C.pz,d=vx*C.fx+vy*C.fy+vz*C.fz;if(d<1)return false;
 var k=C.f/d;O[0]=C.cx+k*(vx*C.rx+vy*C.ry);O[1]=C.cy-k*(vx*C.ux+vy*C.uy+vz*C.uz);O[2]=d;return true}

var NB=9,SEGB=[],SN=new Int32Array(NB);for(var qb=0;qb<NB;qb++)SEGB.push(new Float32Array(560000));
var AL=[.75,.5,.3],FADEL=[1,.62,.3];
var SX=new Float32Array(400),SY=new Float32Array(400),SOK=new Uint8Array(400);
function seg(b,x1,y1,x2,y2){var n=SN[b];if(n>=559996)return;var A=SEGB[b];A[n]=x1;A[n+1]=y1;A[n+2]=x2;A[n+3]=y2;SN[b]=n+4}
function forest(t,a,rowsU,top,fdim){
 var W=cvs.width,Hh=cvs.height;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,Hh);if(a<=0)return;
 var f0=(mob?1.9:2.35)*Hh;
 var pit=ease(t/2.4),dl=ease((t-2.4)/1.8),rf=ease(rowsU/.55);
 var pxpm=top.k*(1600/G.wm)*(W/VBW),Dtop=f0/pxpm;
 var el_=lerp(1.5,.30,pit);el_=lerp(el_,.19,dl);
 var D=lerp(Dtop,205,pit);D=lerp(D,72,dl);
 var cxp=lerp(W/2,mob?W/2:W*.31,dl),cyp=lerp(Hh/2,mob?Hh*.36:Hh*.52,dl);
 var alpha=Math.max(0,t)*.07;setCam(.5+alpha,el_,D,cxp,cyp,f0);
 SN.fill(0);
 var grow=cl(t/1.0),hz=pj(0,0,H*.4),zh=hz?O[2]:100,hcx=O[0];
 var zoneF=function(sx,sy){return mob?cl((sy-Hh*.42)/(Hh*.08)):cl((sx-W*.42)/(W*.1))};
 /* terreno (sfuma quando la vista è dall'alto) */
 var terA=a*ease((1.35-el_)/.5)*fdim;
 if(terA>0){var TP=[],ok=[];for(var i=0;i<(TN+1)*(TN+1);i++){ok[i]=pj(TR[i*3],TR[i*3+1],TR[i*3+2]);TP[i]=[O[0],O[1],O[2]]}
  ctx.beginPath();
  for(var i=0;i<TN;i++)for(var j=0;j<TN;j++){var A=i*(TN+1)+j,B=(i+1)*(TN+1)+j,Cc=i*(TN+1)+j+1,Dd=(i+1)*(TN+1)+j+1;
   if(!(ok[A]&&ok[B]&&ok[Cc]&&ok[Dd]))continue;
   var mx=(TP[A][0]+TP[Dd][0])/2,my=(TP[A][1]+TP[Dd][1])/2;if(zoneF(mx,my)*rf>.9)continue;
   ctx.moveTo(TP[A][0],TP[A][1]);ctx.lineTo(TP[B][0],TP[B][1]);ctx.lineTo(TP[Dd][0],TP[Dd][1]);ctx.lineTo(TP[Cc][0],TP[Cc][1]);ctx.closePath();ctx.moveTo(TP[A][0],TP[A][1]);ctx.lineTo(TP[Dd][0],TP[Dd][1])}
  ctx.strokeStyle='rgba(255,255,255,'+(.13*terA*(1-rf*.7)).toFixed(3)+')';ctx.lineWidth=.8;ctx.lineJoin='round';ctx.stroke()}
 /* bosco */
 for(var q=0;q<FOREST.length;q++){var f=FOREST[q];
  if(!pj(f.x,f.y,f.z+f.s*10))continue;var sx=O[0],sy=O[1],zc=O[2];
  if(sx<-80||sx>W+80||sy<-100||sy>Hh+160)continue;
  var vis=cl((grow*1.3-f.fr*.5)/.5);if(vis<=0)continue;
  var gyy=sy;if(mob&&pj(f.x,f.y,f.z))gyy=O[1];var zf=zoneF(sx,gyy),fd=zf?cl(rf*1.6*zf-f.fr*.6):0;if(fd>=.98)continue;
  var lv=fd<.2?0:fd<.6?1:2;
  var bz=el_>1.0?(zc<D*.97?0:1):(zc<D*.9?0:zc<D*1.15?1:2),b=bz*3+lv;
  var Wv=f.W,n=Wv.length/3,i,j;
  for(i=0;i<n;i++){SOK[i]=pj(Wv[i*3],Wv[i*3+1],Wv[i*3+2])?1:0;SX[i]=O[0];SY[i]=O[1]}
  if(f.lod===2){for(i=0;i<8;i++){j=(i+1)&7;if(SOK[i]&&SOK[j])seg(b,SX[i],SY[i],SX[j],SY[j])}
   for(i=0;i<4;i++){j=8+((i+1)&3);if(SOK[8+i]&&SOK[j])seg(b,SX[8+i],SY[8+i],SX[j],SY[j]);if(SOK[8+i]&&SOK[12])seg(b,SX[8+i],SY[8+i],SX[12],SY[12]);if(SOK[2*i]&&SOK[8+i])seg(b,SX[2*i],SY[2*i],SX[8+i],SY[8+i])}}
  else{var E=f.m.E,lim=vis*f.m.V[(f.m.n-1)*3+2]*0+vis*30*f.s;for(var e=0;e<E.length;e+=2){var u=E[e],v=E[e+1];if(!SOK[u]||!SOK[v])continue;
    if(vis<1&&Wv[u*3+2]-f.z>lim)continue;seg(b,SX[u],SY[u],SX[v],SY[v])}}
 }
 ctx.lineJoin='round';ctx.lineWidth=.8;
 for(var b=0;b<NB;b++){if(!SN[b])continue;var A=SEGB[b],bz=Math.floor(b/3),lv=b%3,al=AL[bz]*FADEL[lv]*a*fdim;
  ctx.beginPath();for(var k=0;k<SN[b];k+=4){ctx.moveTo(A[k],A[k+1]);ctx.lineTo(A[k+2],A[k+3])}
  ctx.strokeStyle='rgba(255,255,255,'+al.toFixed(3)+')';ctx.stroke()}
 /* albero campione: poligonale piena in giallo fluo, si costruisce dal basso */
 var rev=cl(grow*1.4),V=HERO.V,P_=new Array(HERO.n),i;
 var ca_=Math.cos(alpha),sa_=Math.sin(alpha),lx=C.px*ca_+C.py*sa_,ly=-C.px*sa_+C.py*ca_;
 for(i=0;i<HERO.n;i++){var hx=V[i*3],hy=V[i*3+1];P_[i]=pj(hx*ca_-hy*sa_,hx*sa_+hy*ca_,V[i*3+2])?[O[0],O[1],O[2]]:null}
 var tris=[];
 HERO.T.forEach(function(tr,ti){if(tr[4]>rev)return;var A=P_[tr[0]],B=P_[tr[1]],Cc=P_[tr[2]];if(!A||!B||!Cc)return;
  var nm=HERO.lit[ti].n,gx=(V[tr[0]*3]+V[tr[1]*3]+V[tr[2]*3])/3,gy=(V[tr[0]*3+1]+V[tr[1]*3+1]+V[tr[2]*3+1])/3,gz=(V[tr[0]*3+2]+V[tr[1]*3+2]+V[tr[2]*3+2])/3;
  if(nm[0]*(lx-gx)+nm[1]*(ly-gy)+nm[2]*(C.pz-gz)<=0&&!tr[3])return;
  tris.push([A,B,Cc,(A[2]+B[2]+Cc[2])/3,tr[3],HERO.lit[ti].lit])});
 tris.sort(function(x,y){return y[3]-x[3]});
 ctx.globalAlpha=a;ctx.lineWidth=.6;
 tris.forEach(function(f){var m=.66+.34*f[5],c=f[4]?'rgb(110,92,76)':'rgb('+Math.round(242*m)+','+Math.round(255*m)+',0)';
  ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.lineTo(f[1][0],f[1][1]);ctx.lineTo(f[2][0],f[2][1]);ctx.closePath();
  ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='rgba(17,17,17,.38)';ctx.stroke()});
 ctx.globalAlpha=1;
 /* dati allometrici, nello spazio lasciato libero a destra (nessun riquadro) */
 var s=W/1280;if(mob)s=W/640;
 if(!mob){var x=W*.65,y0=Hh*.5-ROWS.length*22*s+8*s,step=44*s;
  ROWS.forEach(function(r,i){var al=cl((rowsU-.4-i*.07)/.14);if(al<=0)return;ctx.globalAlpha=al;var y=y0+i*step;
   ctx.font=Math.round(13*s)+'px "Space Grotesk",system-ui,sans-serif';ctx.fillStyle='#888';ctx.fillText(r[0],x,y);
   ctx.font=Math.round(16*s)+'px "Space Mono",ui-monospace,monospace';ctx.fillStyle='#fff';ctx.fillText(r[1],x,y+21*s)});
 }else{
  ROWS.forEach(function(r,i){var al=cl((rowsU-.4-i*.07)/.14);if(al<=0)return;ctx.globalAlpha=al;
   var j=i-2,cx_=i<2?W*.06:(j%2?W*.52:W*.06),y=i<2?Hh*(.56+.085*i):Hh*(.74+.085*Math.floor(j/2));
   ctx.font=Math.round(15*s)+'px "Space Grotesk",system-ui,sans-serif';ctx.fillStyle='#888';ctx.fillText(r[0],cx_,y);
   ctx.font=Math.round((i<2?17:20)*s)+'px "Space Mono",ui-monospace,monospace';ctx.fillStyle='#fff';ctx.fillText(r[1],cx_,y+24*s)});
 }
 ctx.globalAlpha=1}
/* ---- regia ---- */
var T_END=20.0,cur=0,K0=1/16,IDLE=20;
function draw(t){cur=t;t+=.25;
 var kA=mob?1.12:1.38,kp=mob?2.0:2.6;
 var ez=ease((t-1.0)/3.0),k=ez<1?Math.exp(Math.log(K0)*(1-ez)):1;
 gridEl.style.opacity=(1-ease((t-1.0)/0.8)).toFixed(3);
 var z2=ease((t-7.1)/0.8);k=k+(kA-k)*z2;
 var ox=(mob?240:400)*(1-ez),oy=(mob?-240:-150)*(1-ez);   /* sorvolo: l'area parte nel quarto alto a destra */
 var cx=800-ox/k,cy=450-oy/k,z3=ease((t-10.0)/1.0);
 if(z3>0){k=k+(kp-k)*z3;cx=lerp(800,P[0],z3);cy=lerp(450,P[1],z3)}
 var ta=ease((t-10.7)/0.8);
 if(ta<.995){
  zg.setAttribute('transform','translate(800 450) scale('+k.toFixed(4)+') translate('+(-cx).toFixed(1)+' '+(-cy).toFixed(1)+')');
  l1.setAttribute('opacity',ease((ez-.12)/.3).toFixed(3));
  det.setAttribute('opacity',ease((ez-.55)/.35).toFixed(3));
  rc.setAttribute('r',(1100*ease((t-4.0)/1.3)).toFixed(0));
  net.style.opacity=(1-0.5*ease((t-7.1)/0.8)).toFixed(3);
  for(var i=0;i<chain.length;i++){var s=5.3+i*(0.7/chain.length),u=(t-s)/0.35,o=u<0||u>1?0:(u<.3?u/.3:u<.7?1:(1-u)/.3);chain[i].style.fillOpacity=(.3*o).toFixed(3)}
  per.style.opacity=t>6.1?1:0;per.style.strokeDashoffset=(1000*(1-ease((t-6.1)/1.0))).toFixed(1);
  var fa=ease((t-7.1)/0.5),fcA=ease((t-7.8)/0.8),chA=ease((t-8.5)/0.6);
  area.style.opacity=(fa*(1-fcA)).toFixed(3);
  fc.setAttribute('opacity',(fcA*(1-chA)).toFixed(3));chm.setAttribute('opacity',chA.toFixed(3));
  pts.forEach(function(c,i){var own=(i===SEL),ph=.5+.5*Math.sin(t*6.2832*1.1+i*.9),vis=ease((t-9.1-i*.05)/.3);
   c.style.opacity=vis.toFixed(3);c.setAttribute('r',(7+4*ph).toFixed(1)+'');
   c.style.fillOpacity=(.18+.32*ph).toFixed(2);
   if(!own&&z3>0)c.style.opacity=(vis*(1-z3)).toFixed(3)});
  svg.style.visibility='';
 }else svg.style.visibility='hidden';
 stage.style.setProperty('--tv',ta.toFixed(3));
 var dim=ease((t-18.0)/1.5);
 ttl.style.opacity=ease((t-18.4)/1.0).toFixed(3);
 forest(t-11.1,ta,cl((t-14.9)/2.4),{k:kp},1-.82*dim);
}
var paused=false,vis=true,last=0,clock=0,done=false;
var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
function frame(n){var dt=Math.min((n-last)/1000,.1);last=n;
 if(!paused&&vis&&!document.hidden){clock+=dt;
  if(!done&&clock>=T_END){done=true;rep.hidden=false}
  if(clock>=T_END+IDLE){clock=T_END+IDLE;paused=true}
  draw(clock)}
 requestAnimationFrame(frame)}
function tog(){if(clock>=T_END+IDLE){return}paused=!paused}
function restart(){done=false;paused=false;clock=0;rep.hidden=true;fig.classList.add('is-anim');draw(0)}
stage.addEventListener('click',tog);stage.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();tog()}});
rep.addEventListener('click',restart);
new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:.4}).observe(stage);
fig.classList.add('is-anim');
if(reduce){fig.classList.remove('is-anim');done=true;paused=true;clock=T_END+IDLE;draw(clock);rep.hidden=true}else{draw(0);requestAnimationFrame(function(n){last=n;frame(n)})}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){draw(cur)});
}
/* carica geometria e immagini solo quando la figura sta per entrare in vista */
var started=false;
function preload(){return new Promise(function(res){var n=0,need=3,done=function(){if(++n>=need)res()};
  ['l0.webp','l1.webp','detail.webp'].forEach(function(f){var i=new Image();i.onload=i.onerror=done;i.src=BASE+f});
  setTimeout(res,4000)})}
function start(){if(started)return;started=true;Promise.all([fetch(BASE+'geom.json').then(function(r){return r.json()}),preload()]).then(function(r){boot(r[0])}).catch(function(){})}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();start()}},{rootMargin:'500px 0px'}).observe(fig)}else start();
})();
