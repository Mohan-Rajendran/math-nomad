/** Initialize the supplied companion's diagrams inside the shared article shell. */
export function initializeNestedRoots(root) {
const listeners = new AbortController();
let active = true;
function listen(target, event, callback) {
  target.addEventListener(event, callback, { signal: listeners.signal });
}

// ---------- the mathematics ----------
var ALPHA = 0.3601300017321704;
var L_ALPHA = ALPHA*ALPHA/(1-ALPHA);

function g(t,x){ return Math.pow(x+t, 1/x); }
function h(L,x){ return Math.pow(L,x) - L; }
function Lstar(x){ return Math.pow(x, 1/(1-x)); }
function Mpeak(x){ return Math.pow(x, x/(1-x))*(1-x); }

function bisect(f,a,b,it){
  var fa=f(a), m, fm;
  for(var i=0;i<(it||90);i++){ m=0.5*(a+b); fm=f(m);
    if((fa<0)===(fm<0)){ a=m; fa=fm; } else { b=m; } }
  return 0.5*(a+b);
}
// the positive solutions of L^x - L = x
function restPoints(x){
  if(x>=1) return [bisect(function(t){return Math.pow(t,x)-t-x;},1,1e6)];
  var ls=Lstar(x);
  if(Math.abs(Mpeak(x)-x) < 1e-12) return [ls];
  if(Mpeak(x) < x) return [];
  return [ bisect(function(L){return h(L,x)-x;},1e-14,ls),
           bisect(function(L){return h(L,x)-x;},ls,1e6) ];
}
function orbit(x,n,cap){
  cap = cap || 1e7;
  var t=Math.pow(x,1/x), out=[t];
  for(var i=1;i<n;i++){
    t=g(t,x);
    if(!isFinite(t) || t>cap){ out.push(cap*2); break; }
    out.push(t);
  }
  return out;
}
// "settled" = two consecutive terms agree to `dec` decimals
function tolFor(dec){ return 0.5*Math.pow(10,-dec); }
function settleSteps(x,dec,cap){
  var tol=tolFor(dec); cap = cap || 60000;
  var t=Math.pow(x,1/x), nt;
  for(var k=1;k<=cap;k++){
    nt=g(t,x);
    if(!isFinite(nt) || nt>1e12) return null;
    if(Math.abs(nt-t) < tol*Math.max(1,Math.abs(nt))) return {steps:k, value:nt};
    t=nt;
  }
  return null;
}
function fmt(v,d){ return v.toFixed(d===undefined?4:d); }
function group(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

// ---------- canvas plumbing ----------
function tok(name){
  return getComputedStyle(root).getPropertyValue(name).trim() || "#888";
}
function setup(cv, cssH){
  var dpr = Math.min(window.devicePixelRatio||1, 2);
  var w = cv.clientWidth || 320, h = cssH;
  cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
  cv.style.height = h+"px";
  var ctx = cv.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  return {ctx:ctx, w:w, h:h};
}
function Frame(s, pad){
  this.s=s; this.L=pad.l; this.R=s.w-pad.r; this.T=pad.t; this.B=s.h-pad.b;
}
Frame.prototype.setRange=function(x0,x1,y0,y1){
  this.x0=x0; this.x1=x1; this.y0=y0; this.y1=y1; return this;
};
Frame.prototype.X=function(v){ return this.L + (v-this.x0)/(this.x1-this.x0)*(this.R-this.L); };
Frame.prototype.Y=function(v){ return this.B - (v-this.y0)/(this.y1-this.y0)*(this.B-this.T); };
Frame.prototype.axes=function(xt,yt,xl,yl,fx,fy){
  var c=this.s.ctx, i;
  c.font = "11px 'Source Sans 3', system-ui, sans-serif";
  c.strokeStyle = tok("--line"); c.lineWidth = 1;
  c.fillStyle = tok("--ink-3"); c.textAlign="center"; c.textBaseline="top";
  for(i=0;i<xt.length;i++){
    var px=this.X(xt[i]);
    c.beginPath(); c.moveTo(px,this.T); c.lineTo(px,this.B); c.stroke();
    c.fillText(fx?fx(xt[i]):String(xt[i]), px, this.B+6);
  }
  c.textAlign="right"; c.textBaseline="middle";
  for(i=0;i<yt.length;i++){
    var py=this.Y(yt[i]);
    c.beginPath(); c.moveTo(this.L,py); c.lineTo(this.R,py); c.stroke();
    c.fillText(fy?fy(yt[i]):String(yt[i]), this.L-8, py);
  }
  c.strokeStyle = tok("--line-2"); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(this.L,this.T); c.lineTo(this.L,this.B);
  c.lineTo(this.R,this.B); c.stroke();
  c.fillStyle = tok("--ink-3"); c.textAlign="center"; c.textBaseline="bottom";
  if(xl) c.fillText(xl, (this.L+this.R)/2, this.s.h-1);
  if(yl){ c.save(); c.translate(11,(this.T+this.B)/2); c.rotate(-Math.PI/2);
    c.textBaseline="top"; c.fillText(yl,0,0); c.restore(); }
};
Frame.prototype.poly=function(pts,color,width,dash){
  var c=this.s.ctx, i, started=false;
  c.save(); c.beginPath(); c.strokeStyle=color; c.lineWidth=width||2;
  c.setLineDash(dash||[]); c.lineJoin="round"; c.lineCap="round";
  for(i=0;i<pts.length;i++){
    var p=pts[i];
    if(!isFinite(p[1])){ started=false; continue; }
    var X=this.X(p[0]), Y=this.Y(p[1]);
    if(!started){ c.moveTo(X,Y); started=true; } else c.lineTo(X,Y);
  }
  c.stroke(); c.restore();
};
Frame.prototype.dot=function(x,y,color,r,hollow){
  var c=this.s.ctx;
  c.beginPath(); c.arc(this.X(x),this.Y(y),r||4,0,6.284);
  if(hollow){ c.fillStyle=tok("--surface"); c.fill(); c.lineWidth=2.2;
              c.strokeStyle=color; c.stroke(); }
  else { c.fillStyle=color; c.fill(); }
};
Frame.prototype.band=function(a,b,color){
  var c=this.s.ctx;
  c.fillStyle=color; c.fillRect(this.X(a),this.T,this.X(b)-this.X(a),this.B-this.T);
};
Frame.prototype.gapbar=function(x,y0,y1,color,cap){
  var c=this.s.ctx, X=this.X(x), A=this.Y(y0), B=this.Y(y1);
  if(Math.abs(A-B) < 2) return;
  cap = cap===undefined ? 6 : cap;
  c.save(); c.strokeStyle=color; c.lineCap="butt";
  c.lineWidth=3.4; c.beginPath(); c.moveTo(X,A); c.lineTo(X,B); c.stroke();
  c.lineWidth=2.4; c.beginPath();
  c.moveTo(X-cap,A); c.lineTo(X+cap,A);
  c.moveTo(X-cap,B); c.lineTo(X+cap,B);
  c.stroke(); c.restore();
};
Frame.prototype.vline=function(x,color,dash){
  var c=this.s.ctx;
  c.save(); c.setLineDash(dash||[5,4]); c.strokeStyle=color; c.lineWidth=1.4;
  c.beginPath(); c.moveTo(this.X(x),this.T); c.lineTo(this.X(x),this.B);
  c.stroke(); c.restore();
};
Frame.prototype.label=function(x,y,text,color,align){
  var c=this.s.ctx;
  c.font="12px 'Source Sans 3', system-ui, sans-serif";
  c.fillStyle=color; c.textAlign=align||"center"; c.textBaseline="middle";
  c.fillText(text,this.X(x),this.Y(y));
};

// ---------- the steps-to-settle curve, one per stopping rule ----------
var curveCache = {};
function stepsCurve(dec){
  if(curveCache[dec]) return curveCache[dec];
  var left=[], right=[], i, x, r;
  for(i=0;i<=170;i++){
    x = 0.02 + (ALPHA-0.02)*Math.pow(i/170, 2.2);
    r = settleSteps(x, dec, 60000);
    left.push([x, r? Math.log10(r.steps) : NaN]);
  }
  for(i=0;i<=170;i++){
    x = 1.004 + (3-1.004)*Math.pow(i/170, 2.0);
    r = settleSteps(x, dec, 60000);
    right.push([x, r? Math.log10(r.steps) : NaN]);
  }
  curveCache[dec] = {left:left, right:right};
  return curveCache[dec];
}
function curveTop(dec){ return dec<=2 ? 1.6 : dec<=4 ? 2.6 : dec<=6 ? 3.6 : 4.9; }

// ---------- the two solution branches, for panel 3 ----------
var branches = (function(){
  var lower=[], upper=[], single=[], i, x, r, L;
  for(i=0;i<=220;i++){
    x = 0.004 + (ALPHA-0.004)*Math.pow(i/220, 1.6);
    r = restPoints(x);
    if(r.length===2){ lower.push([x,r[0]]); upper.push([x,r[1]]); }
  }
  lower.push([ALPHA, L_ALPHA]); upper.push([ALPHA, L_ALPHA]);
  for(i=0;i<=160;i++){
    x = 1.3 + (2.6-1.3)*i/160;
    L = restPoints(x)[0];
    if(L<=3.02) single.push([x,L]);
  }
  return {lower:lower, upper:upper, single:single};
})();

// ================= SANDBOX 1 =================
var s1x   = root.querySelector("#x1");
var s1ExactX = null;
var s1xv  = root.querySelector("#x1v");
var s1dec = root.querySelector("#dec1");
var v1 = root.querySelector("#v1");
var t1body = root.querySelector("#t1 tbody");
var cOrbit = root.querySelector("#c-orbit");
var cSteps = root.querySelector("#c-steps");

function drawOrbit(x,dec){
  var s = setup(cOrbit, 300);
  var f = new Frame(s, {l:56,r:14,t:16,b:32});
  var N=40, o=orbit(x,N), i, mx=0;
  var res = settleSteps(x, dec, 60000), top;
  if(res){ top = Math.max(res.value*1.35, o[0]*1.2); }
  else { for(i=0;i<Math.min(o.length,9);i++) mx=Math.max(mx,o[i]); top = mx*1.1; }
  if(!isFinite(top) || top<=0) top = 1;
  f.setRange(0.5, N+0.5, 0, top);
  f.axes([10,20,30,40], [0, top/2, top], "step n", "value of the nth term",
         null, function(v){ return v.toFixed(top<1?3:2); });
  if(res){
    f.poly([[0.5,res.value],[N+0.5,res.value]], tok("--amber-fill"), 1.6, [7,5]);
    f.label(N*0.72, res.value*1.09, "settles near "+fmt(res.value), tok("--amber"));
  }
  var pts=[];
  for(i=0;i<o.length;i++) pts.push([i+1, o[i]]);
  f.poly(pts, tok("--accent-2"), 2.2);
  for(i=0;i<o.length && i<N;i++) if(o[i]<=top) f.dot(i+1, o[i], tok("--accent"), 3.1);
}
function drawSteps(x,dec){
  var s = setup(cSteps, 300);
  var top = curveTop(dec);
  var f = new Frame(s, {l:56,r:14,t:16,b:32}).setRange(0,3,-0.05*top,top);
  f.band(ALPHA, 1, tok("--amber-wash"));
  var yt=[], k;
  for(k=0;k<=Math.floor(top);k++) yt.push(k);
  f.axes([0,1,2,3], yt, "x", "steps until two terms agree to "+dec+" decimals",
         null, function(v){ return ["1","10","100","1k","10k"][v]; });
  f.label((ALPHA+1)/2, top*0.74, "never settles", tok("--amber"));
  var cu = stepsCurve(dec);
  f.poly(cu.left,  tok("--accent-2"), 2.2);
  f.poly(cu.right, tok("--accent-2"), 2.2);
  f.vline(x, tok("--ink-3"));
  var r = settleSteps(x, dec, 60000);
  if(r) f.dot(x, Math.min(Math.log10(r.steps), top), tok("--accent"), 5.5);
}
function update1(){
  var x = s1ExactX === null ? parseFloat(s1x.value) : s1ExactX, dec = parseInt(s1dec.value,10);
  s1xv.textContent = s1ExactX === ALPHA ? "α ≈ 0.360130" : x.toFixed(3);
  s1x.setAttribute("aria-valuetext", s1ExactX === ALPHA ? "x = alpha, approximately 0.360130" : "x = "+x.toFixed(3));
  drawOrbit(x,dec); drawSteps(x,dec);

  var res = settleSteps(x, dec, 60000), msg, cls;
  if(res){
    msg = "<b>Settles.</b> At x = "+x.toFixed(3)+" the terms agree to "+dec+
          " decimals after <b>"+group(res.steps)+"</b> step"+(res.steps===1?"":"s")+
          ", by which point the value is <b>"+fmt(res.value,Math.min(dec+1,9))+"</b>.";
    cls = "verdict";
  } else {
    var o = orbit(x, 30), k=0;
    for(var i=0;i<o.length;i++){ if(o[i]>1000){ k=i+1; break; } }
    msg = "<b>Runs away.</b> At x = "+x.toFixed(3)+" the terms never stop growing"+
          (k? " — they pass 1000 by step <b>"+k+"</b>." : ".");
    cls = "verdict escapes";
  }
  if(Math.abs(x-1)<0.004){
    msg += " At x = 1 exactly the rule becomes &ldquo;add 1&rdquo;, so the nth term is just n.";
  }
  if(Math.abs(x-ALPHA)<0.002 && res && dec>=6){
    msg += " Careful here: at &alpha; the two solutions have merged, so the approach is "+
           "slow (the error falls like 0.634/n). The terms have stopped moving at this "+
           "resolution but are still well short of the true value 0.2026874.";
  }
  v1.className = cls; v1.innerHTML = msg;

  cOrbit.setAttribute("aria-label", "Plot of the first 40 terms at x = "+x.toFixed(3)+". "+
    (res? "They level off near "+fmt(res.value)+"."
        : "They keep growing off the top of the chart."));
  cSteps.setAttribute("aria-label", "Steps until two terms agree to "+dec+
    " decimals, against x; a marker sits at "+x.toFixed(3)+
    ". The band between alpha and 1 is empty because the terms never settle there.");

  var o2 = orbit(x, 9), rows="";
  for(var j=0;j<o2.length;j++){
    rows += "<tr><td>"+(j+1)+"</td><td>"+
            (o2[j]>1e6? "larger than a million" : fmt(o2[j],6))+"</td></tr>";
  }
  t1body.innerHTML = rows;
}
listen(s1x, "input", function(){ s1ExactX = null; update1(); });
listen(s1dec, "change", update1);
Array.prototype.forEach.call(root.querySelectorAll("[data-x]"), function(b){
  listen(b, "click", function(){ s1ExactX = b.getAttribute("data-x") === "0.3601300017" ? ALPHA : null; s1x.value = b.getAttribute("data-x"); update1(); });
});

// ================= SANDBOX 2 =================
var s2x = root.querySelector("#x2");
var s2ExactX = null;
var s2xv = root.querySelector("#x2v");
var v2 = root.querySelector("#v2");
var cHill = root.querySelector("#c-hill");
var cRace = root.querySelector("#c-race");

function drawHill(x){
  var s = setup(cHill, 300);
  var f = new Frame(s, {l:56,r:14,t:16,b:32}).setRange(0, 1.05, -0.18, 0.62);
  f.axes([0,0.5,1],[0,0.25,0.5], "candidate value L", "height", null,
         function(v){ return v.toFixed(2); });
  var pts=[], i, L;
  for(i=0;i<=240;i++){ L = 1e-4 + (1.05-1e-4)*i/240; pts.push([L, h(L,x)]); }
  f.poly(pts, tok("--accent-2"), 2.4);
  f.poly([[0,x],[1.05,x]], tok("--amber-fill"), 2, [8,5]);
  f.label(0.92, x+0.055, "height x", tok("--amber"), "right");
  var r = restPoints(x), j;
  for(j=0;j<r.length;j++) f.dot(r[j], x, tok("--accent"), 5);
  var ls = Lstar(x), pk = Mpeak(x);
  var gc = pk >= x ? tok("--accent") : tok("--ink-2");
  f.gapbar(ls, Math.min(pk,x), Math.max(pk,x), gc);
  f.dot(ls, pk, gc, 3.2);
}
function drawRace(x){
  var s = setup(cRace, 300);
  // y-span 0.80 matches the hill chart's, so the gap bar is the same length
  var f = new Frame(s, {l:56,r:14,t:16,b:32}).setRange(0.08, 0.88, 0, 0.80);
  f.axes([0.1,0.3,0.5,0.7],[0,0.25,0.5,0.75], "x", "height",
         function(v){ return v.toFixed(1); }, function(v){ return v.toFixed(2); });
  var pts=[], i, xx;
  for(i=0;i<=200;i++){ xx = 0.08 + (0.88-0.08)*i/200; pts.push([xx, Mpeak(xx)]); }
  f.poly(pts, tok("--accent-2"), 2.4);
  f.poly([[0.08,0.08],[0.80,0.80]], tok("--amber-fill"), 2, [8,5]);
  f.dot(ALPHA, ALPHA, tok("--amber-fill"), 5.5);
  f.label(0.60, 0.40, "they cross at α", tok("--amber"));
  f.vline(x, tok("--ink-3"));
  var pk2 = Mpeak(x);
  var gc2 = pk2 >= x ? tok("--accent") : tok("--ink-2");
  f.gapbar(x, Math.min(pk2,x), Math.max(pk2,x), gc2);
  f.dot(x, pk2, gc2, 4.2);
}
function update2(){
  var x = s2ExactX === null ? parseFloat(s2x.value) : s2ExactX;
  s2xv.textContent = s2ExactX === ALPHA ? "α ≈ 0.360130" : x.toFixed(3);
  s2x.setAttribute("aria-valuetext", s2ExactX === ALPHA ? "x = alpha, approximately 0.360130" : "x = "+x.toFixed(3));
  drawHill(x); drawRace(x);
  var r = restPoints(x), msg, cls;
  if(r.length===2){
    msg = "<b>The hill reaches the line twice.</b> Solutions at <b>"+fmt(r[0])+
          "</b> and <b>"+fmt(r[1])+"</b>. The peak clears the line by <b>"+
          fmt(Mpeak(x)-x)+"</b> — that is the bar, in both charts.";
    cls="verdict";
  } else if(r.length===1){
    msg = "<b>The hill just touches the line.</b> The two solutions have merged into "+
          "one, at <b>"+fmt(r[0])+"</b>. This is the boundary value, x = α.";
    cls="verdict";
  } else {
    msg = "<b>The hill never reaches the line.</b> The peak only gets to "+fmt(Mpeak(x))+
          ", falling short of the required "+fmt(x)+" by <b>"+fmt(x-Mpeak(x))+
          "</b>. There is no solution, so L = ∞.";
    cls="verdict escapes";
  }
  v2.className=cls; v2.innerHTML=msg;
  cHill.setAttribute("aria-label","The curve L to the power "+x.toFixed(2)+
    " minus L, against a horizontal line at height "+x.toFixed(2)+". They meet "+
    (r.length===2?"twice.":r.length===1?"once, tangentially.":"not at all.")+
    " A bar marks the gap of "+fmt(Math.abs(Mpeak(x)-x))+
    " between the peak and the line.");
  cRace.setAttribute("aria-label","Peak height and required height, both against x. At "+
    x.toFixed(2)+" the same bar marks the gap of "+fmt(Math.abs(Mpeak(x)-x))+
    " between the two curves. They cross at alpha, 0.36.");
}
listen(s2x, "input", function(){ s2ExactX = null; update2(); });
Array.prototype.forEach.call(root.querySelectorAll("[data-x2]"), function(b){
  listen(b, "click", function(){ s2ExactX = b.getAttribute("data-x2") === "0.3601300017" ? ALPHA : null; s2x.value = b.getAttribute("data-x2"); update2(); });
});

// ================= SANDBOX 3 =================
var s3x=root.querySelector("#x3"), s3xv=root.querySelector("#x3v");
var s3s=root.querySelector("#start3"), s3sv=root.querySelector("#start3v");
var v3=root.querySelector("#v3");
var cWeb=root.querySelector("#c-web"), cSol=root.querySelector("#c-sol");
var web = {x:0.33, t0:0.05, pts:[[0.05,0]], n:0};

function webReset(){
  web.x = parseFloat(s3x.value); web.t0 = parseFloat(s3s.value);
  web.pts = [[web.t0, 0]]; web.n = 0; drawWeb(); drawSol(); say3();
}
function webStep(k){
  for(var i=0;i<(k||1);i++){
    var cur = web.pts[web.pts.length-1][0];
    var gt = g(cur, web.x);
    if(!isFinite(gt) || gt>50) break;
    web.pts.push([cur, gt]); web.pts.push([gt, gt]); web.n++;
  }
  drawWeb(); say3();
}
function drawWeb(){
  var x = web.x, r = restPoints(x);
  var top = r.length ? Math.max(r[r.length-1]*1.5, web.t0*1.3, 0.35)
                     : Math.max(0.9, web.t0*1.4);
  top = Math.min(Math.max(top, 0.3), 1.25);
  var s = setup(cWeb, 330);
  var f = new Frame(s, {l:56,r:14,t:16,b:34}).setRange(0, top, 0, top);
  f.axes([0, top/2, top],[0, top/2, top], "current value", "next value",
         function(v){ return v.toFixed(2); }, function(v){ return v.toFixed(2); });
  f.poly([[0,0],[top,top]], tok("--ink-3"), 1.6, [7,5]);
  var pts=[], i, t;
  for(i=0;i<=220;i++){ t = top*i/220; pts.push([t, g(t,x)]); }
  f.poly(pts, tok("--accent-2"), 2.6);
  if(r.length===2){
    f.dot(r[0], r[0], tok("--accent"), 5.5);
    f.dot(r[1], r[1], tok("--ink-2"), 5.5, true);
    f.label(r[0], -0.035*top, "L", tok("--accent"));
    f.label(r[1], r[1]+top*0.085, "ceiling", tok("--ink-2"));
  } else if(r.length===1){
    f.dot(r[0], r[0], tok("--amber-fill"), 5.5);
  }
  if(web.pts.length>1) f.poly(web.pts, tok("--amber-fill"), 1.8);
  f.dot(web.t0, 0, tok("--amber-fill"), 4);
}
function drawSol(){
  var x = web.x;
  var s = setup(cSol, 330);
  var f = new Frame(s, {l:56,r:14,t:16,b:34}).setRange(0, 2.6, 0, 3.0);
  f.band(ALPHA, 1, tok("--panel"));
  f.axes([0,1,2],[0,1,2,3], "x", "both solutions");
  f.label((ALPHA+1)/2, 2.48, "no solution:", tok("--ink-3"));
  f.label((ALPHA+1)/2, 2.22, "L = ∞", tok("--ink-3"));
  f.poly(branches.lower,  tok("--accent"), 2.4);
  f.poly(branches.single, tok("--accent"), 2.4);
  f.poly(branches.upper,  tok("--ink-2"), 2.2, [6,5]);
  f.dot(ALPHA, L_ALPHA, tok("--amber-fill"), 5);
  f.label(0.45, 0.62, "they collide here", tok("--amber"), "left");
  f.vline(x, tok("--ink-3"));
  var r = restPoints(x);
  if(r.length===2){ f.dot(x,r[0],tok("--accent"),5); f.dot(x,r[1],tok("--ink-2"),5,true); }
  else if(r.length===1) f.dot(x,r[0],tok("--accent"),5);
}
function say3(){
  var x=web.x, r=restPoints(x), cur=web.pts[web.pts.length-1][0], msg, cls;
  if(r.length===2 && web.t0 < r[1]){
    msg = "Started below the ceiling <b>"+fmt(r[1])+"</b>, so it climbs to <b>"+
          fmt(r[0])+"</b>. After <b>"+web.n+"</b> step"+(web.n===1?"":"s")+
          " the value is <b>"+fmt(cur,6)+"</b>.";
    cls="verdict";
  } else if(r.length===2){
    msg = "Started above the ceiling <b>"+fmt(r[1])+"</b>, so it escapes. After <b>"+
          web.n+"</b> step"+(web.n===1?"":"s")+" the value is <b>"+fmt(cur,4)+
          "</b>. The infinite root of the poster starts at the x-th root of x, "+
          "which never lands up here.";
    cls="verdict escapes";
  } else if(r.length===1 && web.t0 < r[0]){
    msg = "At the boundary value x = α, where the two solutions have merged. "+
          "Creeping up to <b>"+fmt(r[0])+"</b> — slowly. After <b>"+web.n+
          "</b> step"+(web.n===1?"":"s")+" the value is <b>"+fmt(cur,6)+"</b>.";
    cls="verdict";
  } else {
    msg = "No solution at this value of x: the curve stays above the diagonal, so the "+
          "staircase climbs for ever. After <b>"+web.n+"</b> step"+(web.n===1?"":"s")+
          " the value is <b>"+fmt(cur,4)+"</b>.";
    cls="verdict escapes";
  }
  v3.className=cls; v3.innerHTML=msg;
  cWeb.setAttribute("aria-label","Staircase diagram at x = "+x.toFixed(3)+". "+
    (r.length===2 ? "The curve crosses the diagonal twice, at "+fmt(r[0])+" and "+fmt(r[1])+"."
     : r.length===1 ? "The curve touches the diagonal once."
     : "The curve never touches the diagonal.")+
    " The staircase has taken "+web.n+" steps and stands at "+fmt(cur,4)+".");
  cSol.setAttribute("aria-label","Both solutions plotted against x. The solid lower "+
    "branch is L; the dotted upper branch is the ceiling. They meet at alpha and "+
    "vanish; a single solution returns past x = 1. A marker sits at x = "+x.toFixed(3)+".");
}
listen(s3x, "input", function(){
  s3xv.textContent=parseFloat(s3x.value).toFixed(3); webReset(); });
listen(s3s, "input", function(){
  s3sv.textContent=parseFloat(s3s.value).toFixed(3); webReset(); });
listen(root.querySelector("#step3"), "click", function(){ webStep(1); });
listen(root.querySelector("#run3"), "click", function(){ webStep(20); });
listen(root.querySelector("#reset3"), "click", webReset);

// Keep the diagrams in sync with Math Nomad's theme and reading preferences.
function redrawAll(){
  if (!active) return;
  update1(); update2(); drawWeb(); drawSol();
}
update1(); update2(); webReset();
let timer;
function scheduleRedraw() {
  clearTimeout(timer);
  timer = setTimeout(redrawAll, 140);
}
listen(window, "resize", scheduleRedraw);
const shell = root.closest(".site-shell");
const themeObserver = new MutationObserver(scheduleRedraw);
if (shell) themeObserver.observe(shell, {
  attributes: true, attributeFilter: ["data-theme", "data-font-size"],
});
let lastWidth = root.clientWidth;
const sizeObserver = new ResizeObserver(() => {
  if (root.clientWidth !== lastWidth) {
    lastWidth = root.clientWidth;
    scheduleRedraw();
  }
});
sizeObserver.observe(root);
if (document.fonts) document.fonts.ready.then(redrawAll);
return () => {
  active = false;
  listeners.abort();
  clearTimeout(timer);
  themeObserver.disconnect();
  sizeObserver.disconnect();
};
}
