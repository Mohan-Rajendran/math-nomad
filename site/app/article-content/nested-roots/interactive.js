import { ALPHA, L_ALPHA, g, h, Lstar, Mpeak, restPoints, orbit, settleSteps, fmt, startBehavior, converges } from "./numerics.mjs";

/** Initialize the supplied companion's diagrams inside the shared article shell. */
export function initializeNestedRoots(root) {
const listeners = new AbortController();
let active = true;
function listen(target, event, callback) {
  target.addEventListener(event, callback, { signal: listeners.signal });
}

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
  c.font = "12px 'Source Sans 3', system-ui, sans-serif";
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
Frame.prototype.clip=function(){
  var c=this.s.ctx;
  c.beginPath(); c.rect(this.L,this.T,this.R-this.L,this.B-this.T); c.clip();
};
Frame.prototype.poly=function(pts,color,width,dash){
  var c=this.s.ctx, i, started=false;
  c.save(); this.clip(); c.beginPath(); c.strokeStyle=color; c.lineWidth=width||2;
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
  if(!Number.isFinite(x) || !Number.isFinite(y)) return;
  c.save(); this.clip();
  c.beginPath(); c.arc(this.X(x),this.Y(y),r||4,0,6.284);
  if(hollow){ c.fillStyle=tok("--surface"); c.fill(); c.lineWidth=2.2;
              c.strokeStyle=color; c.stroke(); }
  else { c.fillStyle=color; c.fill(); }
  c.restore();
};
Frame.prototype.band=function(a,b,color){
  var c=this.s.ctx;
  c.save(); this.clip();
  c.fillStyle=color; c.fillRect(this.X(a),this.T,this.X(b)-this.X(a),this.B-this.T);
  c.restore();
};
Frame.prototype.gapbar=function(x,y0,y1,color,cap){
  var c=this.s.ctx, X=this.X(x), A=this.Y(y0), B=this.Y(y1);
  if(Math.abs(A-B) < 2) return;
  cap = cap===undefined ? 6 : cap;
  c.save(); this.clip(); c.strokeStyle=color; c.lineCap="butt";
  c.lineWidth=3.4; c.beginPath(); c.moveTo(X,A); c.lineTo(X,B); c.stroke();
  c.lineWidth=2.4; c.beginPath();
  c.moveTo(X-cap,A); c.lineTo(X+cap,A);
  c.moveTo(X-cap,B); c.lineTo(X+cap,B);
  c.stroke(); c.restore();
};
Frame.prototype.vline=function(x,color,dash){
  var c=this.s.ctx;
  c.save(); this.clip(); c.setLineDash(dash||[5,4]); c.strokeStyle=color; c.lineWidth=1.4;
  c.beginPath(); c.moveTo(this.X(x),this.T); c.lineTo(this.X(x),this.B);
  c.stroke(); c.restore();
};
Frame.prototype.label=function(x,y,text,color,align){
  var c=this.s.ctx;
  c.font="12px 'Source Sans 3', system-ui, sans-serif";
  c.fillStyle=color; c.textAlign=align||"center"; c.textBaseline="middle";
  var half=c.measureText(text).width/2, px=this.X(x);
  if(c.textAlign === "center") px=Math.max(this.L+half,Math.min(this.R-half,px));
  else if(c.textAlign === "left") px=Math.min(this.R-2*half,Math.max(this.L,px));
  else px=Math.max(this.L+2*half,Math.min(this.R,px));
  c.save(); this.clip();
  c.fillText(text,px,Math.max(this.T+8,Math.min(this.B-8,this.Y(y))));
  c.restore();
};

// ---------- the steps-to-settle curve, one per stopping rule ----------
var curveCache = {};
function stepsCurve(dec){
  if(curveCache[dec]) return curveCache[dec];
  var left=[], right=[], i, x, r;
  for(i=0;i<=170;i++){
    x = 0.02 + (ALPHA-0.02)*Math.pow(i/170, 2.2);
    r = settleSteps(x, dec, 60000);
    left.push([x, r.status === "reached" ? Math.log10(r.steps) : NaN]);
  }
  for(i=0;i<=170;i++){
    x = 1.001 + (3-1.001)*Math.pow(i/170, 2.0);
    r = settleSteps(x, dec, 60000);
    right.push([x, r.status === "reached" ? Math.log10(r.steps) : NaN]);
  }
  curveCache[dec] = {left:left, right:right};
  return curveCache[dec];
}
function curveTop(dec, selected){
  var cu = stepsCurve(dec), high = 1;
  cu.left.concat(cu.right).forEach(function(p){ if(Number.isFinite(p[1])) high=Math.max(high,p[1]); });
  if(selected.status === "reached") high=Math.max(high,Math.log10(selected.steps));
  return Math.ceil(high+0.15);
}

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

function drawOrbit(x){
  var s = setup(cOrbit, 300);
  var f = new Frame(s, {l:88,r:18,t:16,b:32});
  var N=40, o=orbit(x,N).values, i, mx=0;
  var roots=restPoints(x), limit=roots[0], top;
  if(converges(x) && Number.isFinite(limit)){ top = Math.max(limit*1.3, o[0]*1.2); }
  else { for(i=0;i<o.length;i++) mx=Math.max(mx,o[i]); top = Math.min(mx*1.1,1e7); }
  if(!Number.isFinite(top) || top<=0) top = 1;
  f.setRange(0.5, N+0.5, 0, top);
  f.axes([10,20,30,40], [0, top/2, top], "term n", "value aₙ",
         null, function(v){ return fmt(v,2); });
  if(converges(x) && Number.isFinite(limit)){
    f.poly([[0.5,limit],[N+0.5,limit]], tok("--amber-fill"), 1.6, [7,5]);
    f.label(N*0.64, limit*1.09, "limit ≈ "+fmt(limit), tok("--amber"));
  }
  var pts=[];
  for(i=0;i<o.length;i++) pts.push([i+1, o[i]]);
  f.poly(pts, tok("--accent-2"), 2.2);
  for(i=0;i<o.length && i<N;i++) if(o[i]<=top) f.dot(i+1, o[i], tok("--accent"), 3.1);
}
function drawSteps(x,dec){
  var s = setup(cSteps, 300), r = settleSteps(x, dec, 60000);
  var top = curveTop(dec,r);
  var f = new Frame(s, {l:88,r:18,t:16,b:32}).setRange(0,3,-0.05*top,top);
  f.band(ALPHA, 1, tok("--amber-wash"));
  var yt=[], k;
  for(k=0;k<=Math.floor(top);k++) yt.push(k);
  f.axes([0,1,2,3], yt, "x", "step index n (log scale)",
         null, function(v){ return v<3 ? String(Math.pow(10,v)) : Math.pow(10,v-3)+"k"; });
  f.label((ALPHA+1)/2, top*0.78, "diverges", tok("--amber"));
  var cu = stepsCurve(dec);
  f.poly(cu.left,  tok("--accent-2"), 2.2);
  f.poly(cu.right, tok("--accent-2"), 2.2);
  f.vline(x, tok("--ink-3"));
  if(r.status === "reached") f.dot(x, Math.log10(r.steps), tok("--accent"), 5.5);
}
function update1(){
  var x = s1ExactX === null ? parseFloat(s1x.value) : s1ExactX, dec = parseInt(s1dec.value,10);
  var xLabel = x === ALPHA ? "α ≈ 0.360130" : x.toFixed(3);
  s1xv.textContent = xLabel;
  s1x.setAttribute("aria-valuetext", "x = "+xLabel);
  drawOrbit(x); drawSteps(x,dec);

  var res = settleSteps(x, dec, 60000), msg, cls="verdict";
  if(res.status === "reached"){
    msg = "<b>Converges.</b> At x = "+xLabel+", the first change smaller than 10<sup>−"+dec+
          "</sup> occurs between terms <b>"+group(res.steps)+"</b> and <b>"+group(res.steps+1)+
          "</b>. The latter term is <b>"+fmt(res.value,Math.min(dec+1,9))+"</b>. "+
          "A small change between terms does not guarantee that many correct decimal places in the limit.";
  } else if(res.status === "diverges") {
    var o = orbit(x, 40).values, k=0;
    for(var i=0;i<o.length;i++){ if(o[i]>1000){ k=i+1; break; } }
    msg = "<b>Diverges to infinity.</b> At x = "+xLabel+", the sequence has no finite limit"+
          (k? "; it passes 1,000 at term <b>"+k+"</b>." : ".")+
          " A temporarily small change between terms would not establish convergence.";
    cls = "verdict escapes";
  } else {
    msg = "<b>Converges mathematically.</b> At x = "+xLabel+", "+
          (res.status === "budget" ? "the change threshold was not reached within the 60,000-step calculation limit." :
           "the calculation exceeded numerical range before the change threshold was reached.");
  }
  if(x === 1){
    msg += " Here the rule is exactly ‘add 1’, so a<sub>n</sub> = n.";
  }
  if(x === ALPHA && res.status === "reached"){
    msg += " At α the two fixed points merge. The error decreases only like 0.634/n; the true limit is approximately 0.2026874498.";
  }
  var plotOrbit=orbit(x,40);
  if(plotOrbit.stopped) msg += plotOrbit.stopped === "display-limit" ?
    " The orbit plot is cut off at its display limit of 10,000,000." :
    " The orbit plot is truncated because later terms exceed numerical range.";
  v1.className = cls; v1.innerHTML = msg;

  cOrbit.setAttribute("aria-label", "Plot of up to the first 40 terms at x = "+xLabel+". "+
    (converges(x)? "The sequence converges to approximately "+fmt(restPoints(x)[0])+"."
        : "The terms increase without bound.")+
    (plotOrbit.stopped ? " The displayed orbit is cut off once it exceeds the plotting or numerical range." : ""));
  cSteps.setAttribute("aria-label", "For convergent x, the first step index n for which the absolute change from term n to term n plus 1 is below 10 to the power minus "+dec+
    ", plotted on a logarithmic vertical scale. The selected x is "+xLabel+
    ". The shaded gap, alpha less than x less than or equal to 1, diverges. Calculations are limited to 60,000 steps.");

  var sequence = orbit(x, 9), o2=sequence.values, rows="";
  for(var j=0;j<o2.length;j++){
    rows += "<tr><td>"+(j+1)+"</td><td>"+fmt(o2[j],6)+"</td></tr>";
  }
  if(sequence.stopped) rows += "<tr><td colspan='2'>Further terms exceed the display or numerical range.</td></tr>";
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
  var f = new Frame(s, {l:88,r:18,t:16,b:32}).setRange(0, 1.05, -0.1, 1.02);
  f.axes([0,0.5,1],[0,0.5,1], "candidate t", "height", null,
         function(v){ return v.toFixed(2); });
  var pts=[[0,0]], i, L;
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
  // Identical y-ranges keep the gap bars the same length throughout the slider.
  var f = new Frame(s, {l:88,r:18,t:16,b:32}).setRange(0.08, 0.88, -0.1, 1.02);
  f.axes([0.1,0.3,0.5,0.7],[0,0.5,1], "x", "height",
         function(v){ return v.toFixed(1); }, function(v){ return v.toFixed(2); });
  var pts=[], i, xx;
  for(i=0;i<=200;i++){ xx = 0.08 + (0.88-0.08)*i/200; pts.push([xx, Mpeak(xx)]); }
  f.poly(pts, tok("--accent-2"), 2.4);
  f.poly([[0.08,0.08],[0.88,0.88]], tok("--amber-fill"), 2, [8,5]);
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
          "</b>. There is no finite fixed point, so the sequence diverges to infinity.";
    cls="verdict escapes";
  }
  v2.className=cls; v2.innerHTML=msg;
  var xDescription=x === ALPHA ? "alpha, approximately 0.360130" : x.toFixed(3);
  var gapDescription=x === ALPHA ? "zero" : fmt(Math.abs(Mpeak(x)-x));
  cHill.setAttribute("aria-label","The curve t to the power x minus t, with x equal to "+xDescription+
    ", against a horizontal line at height x. They meet "+
    (r.length===2?"twice.":r.length===1?"once, tangentially.":"not at all.")+
    " The gap is "+gapDescription+
    " between the peak and the line.");
  cRace.setAttribute("aria-label","Peak height and required height, both against x. At x equal to "+
    xDescription+", the gap is "+gapDescription+
    " between the two curves. They cross at alpha, approximately 0.360130.");
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
var web = {x:0.33, t0:0.05, pts:[[0.05,0]], n:0, stopped:null};

function webReset(){
  web.x = parseFloat(s3x.value); web.t0 = parseFloat(s3s.value);
  web.pts = [[web.t0, 0]]; web.n = 0; web.stopped=null; drawWeb(); drawSol(); say3();
}
function webStep(k){
  for(var i=0;i<(k||1) && !web.stopped;i++){
    var cur = web.pts[web.pts.length-1][0];
    var gt = g(cur, web.x);
    if(!Number.isFinite(gt)){ web.stopped="overflow"; break; }
    web.pts.push([cur, gt]); web.pts.push([gt, gt]); web.n++;
    if(gt>50) web.stopped="display-limit";
  }
  drawWeb(); say3();
}
function drawWeb(){
  var x = web.x, r = restPoints(x);
  var top = r.length ? Math.max(r[r.length-1]*1.5, web.t0*1.3, 0.35)
                     : Math.max(0.9, web.t0*1.4);
  top = Math.min(Math.max(top, 0.3), 1.25);
  var s = setup(cWeb, 330);
  var f = new Frame(s, {l:88,r:18,t:16,b:34}).setRange(0, top, 0, top);
  f.axes([0, top/2, top],[0, top/2, top], "current value", "next value",
         function(v){ return v.toFixed(2); }, function(v){ return v.toFixed(2); });
  f.poly([[0,0],[top,top]], tok("--ink-3"), 1.6, [7,5]);
  var pts=[], i, t;
  for(i=0;i<=220;i++){ t = top*i/220; pts.push([t, g(t,x)]); }
  f.poly(pts, tok("--accent-2"), 2.6);
  if(r.length===2){
    f.dot(r[0], r[0], tok("--accent"), 5.5);
    f.dot(r[1], r[1], tok("--ink-2"), 5.5, true);
    f.label(r[0], 0.065*top, "L", tok("--accent"));
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
  var f = new Frame(s, {l:88,r:18,t:16,b:34}).setRange(0, 2.6, 0, 3.0);
  f.band(ALPHA, 1, tok("--panel"));
  f.axes([0,1,2],[0,1,2,3], "x", "positive fixed points");
  f.label((ALPHA+1)/2, 2.48, "diverges", tok("--ink-3"));
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
  var x=web.x, r=restPoints(x), cur=web.pts[web.pts.length-1][0], msg, cls="verdict";
  var behavior=startBehavior(x,web.t0,r);
  if(behavior === "fixed"){
    msg = "The chosen start is a fixed point, so the sequence stays there.";
  } else if(behavior === "increases" || behavior === "decreases"){
    msg = "The sequence "+(behavior === "increases" ? "increases" : "decreases")+
      " toward the smaller fixed point, <b>"+fmt(r[0])+"</b>.";
    if(x === ALPHA) msg = "At α, the sequence approaches the merged fixed point <b>"+fmt(r[0])+"</b> slowly from below.";
  } else {
    msg = r.length ? "The start is above the upper fixed point <b>"+fmt(r[r.length-1])+"</b>, so this sequence grows without bound." :
      "There is no finite fixed point at this x, so the sequence grows without bound.";
    cls="verdict escapes";
  }
  msg += " After <b>"+web.n+"</b> update"+(web.n===1?"":"s")+", its value is <b>"+fmt(cur,6)+"</b>.";
  if(web.stopped) msg += web.stopped === "overflow" ?
    " The simulation has stopped: the next value exceeds numerical range. Reset to try another start." :
    " The simulation has stopped after exceeding its display limit of 50. Reset to try another start.";
  v3.className=cls; v3.innerHTML=msg;
  root.querySelector("#step3").disabled=!!web.stopped;
  root.querySelector("#run3").disabled=!!web.stopped;
  cWeb.setAttribute("aria-label","Staircase diagram at x = "+x.toFixed(3)+". "+
    (r.length===2 ? "The curve crosses the diagonal twice, at "+fmt(r[0])+" and "+fmt(r[1])+"."
     : r.length===1 ? "The curve touches the diagonal once."
     : "The curve never touches the diagonal.")+
    " The chosen sequence "+(behavior === "fixed" ? "stays fixed" : behavior === "diverges" ? "diverges" : behavior)+
    ". After "+web.n+" updates its value is "+fmt(cur,6)+"."+
    (web.stopped ? " Simulation stopped at the display or numerical limit." : ""));
  cSol.setAttribute("aria-label","Positive fixed points plotted against x. The solid lower "+
    "branch is the nested-root limit; the dashed upper branch is the other fixed point. They meet at alpha and "+
    "vanish for alpha less than x less than or equal to 1; a single solution returns for x greater than 1. A marker sits at x = "+x.toFixed(3)+".");
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
