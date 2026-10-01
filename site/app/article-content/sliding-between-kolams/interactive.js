  'use strict';
  const seeds = [
    [9,10,3,1,13,11,14,7,12,15,2,5,0,4,8,6],
    [9,10,3,1,13,11,7,5,4,12,15,6,0,8,14,2],
    [8,11,10,3,9,7,1,5,13,14,15,6,4,0,12,2],
    [8,10,3,1,9,11,7,5,13,14,15,6,4,0,12,2],
    [8,11,2,1,9,15,10,7,13,14,3,5,4,0,12,6],
    [8,11,10,2,9,15,3,1,13,14,7,5,4,0,12,6]
  ];
  const pairs = [
    {from:0,to:1,path:[4,8,2,14,7,5,6,2,14,15,12,4]},
    {from:2,to:3,path:[14,15,6,5,1,7,11,10,3,1,5,6,15,14]},
    {from:4,to:5,path:[12,6,5,7,1,2,10,3,7,5,6,12]}
  ];
  const same = (a,b) => a.length === b.length && a.every((x,i) => x === b[i]);
  const word = tile => tile.toString(2).padStart(4,'0');
  function neighbours(index) {
    const row = Math.floor(index/4), col = index%4, result=[];
    if(row>0) result.push(index-4);
    if(row<3) result.push(index+4);
    if(col>0) result.push(index-1);
    if(col<3) result.push(index+1);
    return result;
  }
  function slide(board,tile) {
    const blank=board.indexOf(0), index=board.indexOf(tile);
    if(tile===0 || !neighbours(blank).includes(index)) return null;
    const next=board.slice(); next[blank]=tile; next[index]=0; return next;
  }
  function gapPath(start,moves) {
    let state=start.slice();
    const path=[state.indexOf(0)];
    if(path[0]<0)throw new Error('The starting board must contain an empty square.');
    for(const tile of moves) {
      const next=slide(state,tile);
      if(!next)throw new Error(`Tile ${tile} cannot slide into the empty square.`);
      state=next;path.push(state.indexOf(0));
    }
    return path;
  }
  function gapDirection(from,to) {
    if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>15||to<0||to>15||!neighbours(from).includes(to))throw new Error('A gap move must join neighbouring squares.');
    return ({'-4':{arrow:'↑',word:'up'},'4':{arrow:'↓',word:'down'},'-1':{arrow:'←',word:'left'},'1':{arrow:'→',word:'right'}})[to-from];
  }
  function epsilon(board) {
    let inversions=0;
    for(let a=0;a<16;a++) for(let b=a+1;b<16;b++) if(board[a]>board[b]) inversions++;
    const blank=board.indexOf(0), a0=blank%4+1, b0=4-Math.floor(blank/4);
    return (inversions+a0+b0)%2===0 ? 1 : -1;
  }
  function rotate(board) {
    const result=Array(16);
    board.forEach((tile,index)=>{
      const row=Math.floor(index/4), col=index%4;
      result[col*4+3-row]=((tile<<1)&15)|((tile>>3)&1);
    });
    return result;
  }
  function analyse(board) {
    if(board.length!==16 || new Set(board).size!==16 || board.some(x=>!Number.isInteger(x)||x<0||x>15)) return {correct:false,issues:1,components:0};
    let issues=0;
    for(let i=0;i<16;i++) {
      const t=board[i],r=Math.floor(i/4),c=i%4;
      if(r===0 && (t&4)) issues++;
      if(r===3 && (t&1)) issues++;
      if(c===0 && (t&2)) issues++;
      if(c===3 && (t&8)) issues++;
      if(c<3 && Boolean(t&8)!==Boolean(board[i+1]&2)) issues++;
      if(r<3 && Boolean(t&1)!==Boolean(board[i+4]&4)) issues++;
    }
    const unseen=new Set(board.map((t,i)=>t===0?-1:i).filter(i=>i>=0));
    let components=0;
    while(unseen.size) {
      components++;
      const first=unseen.values().next().value, stack=[first]; unseen.delete(first);
      while(stack.length) {
        const i=stack.pop();
        for(const j of neighbours(i)) {
          const bits=j===i+1?[8,2]:j===i-1?[2,8]:j===i+4?[1,4]:[4,1];
          if(unseen.has(j)&&(board[i]&bits[0])&&(board[j]&bits[1])) {unseen.delete(j);stack.push(j);}
        }
      }
    }
    return {correct:issues===0&&components===1,issues,components};
  }
  function tilePath(tile) {
    const e=tile&8,n=tile&4,w=tile&2,s=tile&1,r=25*Math.SQRT2;
    const segment=(bit,x,y,ex,ey)=>bit?`L ${x} ${y} L ${ex} ${ey}`:`A ${r} ${r} 0 0 1 ${ex} ${ey}`;
    return `M 75 25 ${segment(e,100,50,75,75)} ${segment(s,50,100,25,75)} ${segment(w,0,50,25,25)} ${segment(n,50,0,75,25)} Z`;
  }
  function artwork(tile) {
    if(tile===0) return '<span class="kp-empty-label">empty</span>';
    return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${tilePath(tile)}"/><circle cx="50" cy="50" r="4"/></svg>`;
  }
  function gapMapSvg(path,step,markerPrefix='kp-route') {
    const current=path[step],first=path[0],last=path[path.length-1];
    const point=index=>({x:20+(index%4)*40,y:20+Math.floor(index/4)*40});
    const cells=Array.from({length:16},(_,i)=>`<rect class="kp-route-cell" x="${(i%4)*40+2}" y="${Math.floor(i/4)*40+2}" width="36" height="36" rx="4"/>`).join('');
    const edge=(index,i,state)=>{
      const a=point(path[i]),b=point(index),dx=(b.x-a.x)/40,dy=(b.y-a.y)/40;
      return `<line class="kp-route-line kp-route-${state}" x1="${a.x+dx*9}" y1="${a.y+dy*9}" x2="${b.x-dx*9}" y2="${b.y-dy*9}" stroke-width="${state==='current'?3:2}"${state==='future'?' stroke-dasharray="2 3"':''} marker-end="url(#${markerPrefix}-${state})"/>`;
    };
    const future=path.slice(1).map((index,i)=>edge(index,i,'future')).join('');
    const travelled=path.slice(1,step+1).map((index,i)=>edge(index,i,i===step-1?'current':'done')).join('');
    const s=point(first),e=point(last),c=point(current);
    const rowFromTop=index=>Math.floor(index/4)+1;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Gap route on a four by four grid. Start: display row ${rowFromTop(first)} from the top, column ${first%4+1}. Finish: display row ${rowFromTop(last)} from the top, column ${last%4+1}. Gap now: display row ${rowFromTop(current)} from the top, column ${current%4+1}. Numbered directions follow below."><defs>${['future','done','current'].map(name=>`<marker id="${markerPrefix}-${name}" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" markerUnits="userSpaceOnUse"><path class="kp-route-marker kp-route-${name}" d="M 0 0 L 5 2.5 L 0 5 Z"/></marker>`).join('')}</defs>${cells}${future}${travelled}<circle class="kp-route-start" cx="${s.x}" cy="${s.y}" r="11"/><rect class="kp-route-finish" x="${e.x-14}" y="${e.y-14}" width="28" height="28" rx="5"/><circle class="kp-route-current" cx="${c.x}" cy="${c.y}" r="7"/></svg>`;
  }
  let widgetNumber=0;
  function initialise(container) {
    const compare=container.dataset.kolamGame==='reachability';
    const widgetId=`kp-${++widgetNumber}`;
    let pairIndex=0,mode='reachable',board=seeds[0].slice(),start=board.slice(),target=seeds[1].slice();
    let history=[],timer=null,routeStep=0,playing=false,showingRoute=false,routePath=[],notice='';
    const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.classList.add('kp-widget');
    container.innerHTML=`
      <div class="kp-intro"><span class="kp-eyebrow">${compare?'Compare two kolams':'Play with the tiles'}</span><h3>${compare?'Move X to Y':'Slide to a new kolam'}</h3>
      <p><strong>How to play:</strong> ${compare?'select a highlighted tile on X to slide it into the gap. Try to match the fixed target Y, and watch the signs as you move.':'select a highlighted tile beside the gap. The tile moves into that space. Reach a different complete kolam, with all the curves joined.'}</p></div>
      ${compare?'<div class="kp-mode" role="group" aria-label="Choose a pair"><button type="button" data-mode="reachable" aria-pressed="true">Reachable pair</button><button type="button" data-mode="unreachable" aria-pressed="false">Unreachable pair</button></div>':''}
      <div class="kp-boards${compare?' kp-two-boards':''}">
        <div class="kp-board-panel"><div class="kp-board-heading"><strong>${compare?'Movable configuration X':'15-puzzle board'}</strong><span class="kp-count">0 moves</span></div><div class="kp-board kp-playing-board" role="group" tabindex="0" aria-label="Sliding kolam board. Use arrow keys to move the empty square."></div>${compare?'<div class="kp-sign kp-current-sign"></div>':''}</div>
        ${compare?'<div class="kp-board-panel"><div class="kp-board-heading"><strong>Target Y</strong><span class="kp-fixed">fixed</span></div><div class="kp-board kp-target-board" role="img" aria-label="The fixed target kolam"></div><div class="kp-sign kp-target-sign"></div></div>':''}
      </div>
      <div class="kp-feedback" aria-live="polite" aria-atomic="true"></div>
      <div class="kp-actions" role="group" aria-label="Puzzle controls">${compare?'':'<button type="button" class="kp-primary" data-action="new">Scramble</button>'}<button type="button" data-action="reset">Reset</button><button type="button" data-action="undo">Undo</button><button type="button" class="kp-route" data-action="route">Show a route from the start</button></div>
      <div class="kp-bottom">Arrow keys move the gap.</div>
      <p class="kp-help">${compare?'A slide exchanges a neighbouring tile and the empty square. Rotating or swapping two tiles is not a legal move.':'The curves may break while you play. A finished kolam joins all fifteen tiles into one connected pattern.'}</p>
      <p class="kp-route-note">“Show a route” returns to the starting kolam and traces the gap’s path as the tiles slide.</p>
      <section class="kp-route-panel" aria-label="Path followed by the gap" hidden>
        <div class="kp-route-heading"><h4>The gap’s path</h4><span class="kp-route-progress" role="status" aria-live="polite"></span></div>
        <div class="kp-route-body"><div class="kp-route-map"></div><div class="kp-route-description"><p class="kp-route-position"></p><p>The arrows follow the gap, in the opposite direction to the sliding tile. Read the numbered steps in order to follow every turn and return.</p><div class="kp-route-key"><span><i class="kp-key-start"></i>Start</span><span><i class="kp-key-finish"></i>Finish</span><span><i class="kp-key-current"></i>Gap now</span></div></div></div>
        <ol class="kp-route-steps" aria-label="Gap movements, in order"></ol>
        <div class="kp-actions kp-route-controls" role="group" aria-label="Route playback"><button type="button" data-action="pause">Pause</button><button type="button" data-action="step">Next step</button></div>
      </section>`;
    const playingBoard=container.querySelector('.kp-playing-board');
    const targetBoard=container.querySelector('.kp-target-board');
    const cellButtons=Array.from({length:16},(_,i)=>{
      const cell=document.createElement('button');cell.type='button';cell.className='kp-cell';cell.tabIndex=-1;
      cell.addEventListener('click',()=>{if(board[i]!==0)makeMove(board[i],true);}); playingBoard.appendChild(cell);return cell;
    });
    const action=name=>container.querySelector(`[data-action="${name}"]`);
    function stop() {if(timer!==null)window.clearTimeout(timer);timer=null;playing=false;}
    function clearRoute() {stop();showingRoute=false;routePath=[];routeStep=0;}
    function configure() {
      clearRoute();const pair=pairs[pairIndex];start=seeds[pair.from].slice();board=start.slice();
      target=mode==='unreachable'?rotate(start):seeds[pair.to].slice();history=[];routeStep=0;notice='';render();
    }
    function renderRoute() {
      const panel=container.querySelector('.kp-route-panel');panel.hidden=!showingRoute;
      if(!showingRoute)return;
      const total=routePath.length-1,complete=routeStep===total;
      const current=routePath[routeStep],first=routePath[0],last=routePath[total];
      const map=container.querySelector('.kp-route-map');
      map.innerHTML=gapMapSvg(routePath,routeStep,widgetId);
      container.querySelector('.kp-route-progress').textContent=`${complete?'Complete':playing?'Playing':'Paused'} · ${routeStep} of ${total} steps`;
      container.querySelector('.kp-route-position').textContent=`Gap now: display row ${Math.floor(current/4)+1} from the top, column ${current%4+1}.${first===last?' This route returns the gap to its starting square.':''}`;
      container.querySelector('.kp-route-steps').innerHTML=routePath.slice(1).map((index,i)=>{
        const direction=gapDirection(routePath[i],index);
        return `<li class="kp-route-step${i<routeStep?' kp-step-done':''}${i===routeStep-1?' kp-step-current':''}"${i===routeStep-1?' aria-current="step"':''} aria-label="Step ${i+1}: gap ${direction.word} to display row ${Math.floor(index/4)+1} from the top, column ${index%4+1}${i<routeStep?', completed':', remaining'}"><span aria-hidden="true">${i+1}</span><strong aria-hidden="true">${direction.arrow}</strong></li>`;
      }).join('');
      action('pause').textContent=playing?'Pause':'Resume';
      action('pause').disabled=complete;action('step').disabled=complete;
      action('route').textContent='Restart route from the start';
    }
    function render() {
      const adjacent=neighbours(board.indexOf(0));
      cellButtons.forEach((cell,i)=>{
        const empty=board[i]===0,movable=!empty&&adjacent.includes(i);
        cell.className=`kp-cell${empty?' kp-empty':''}${movable?' kp-movable':''}`;
        cell.innerHTML=artwork(board[i]);cell.disabled=!movable;
        cell.setAttribute('aria-label',empty?`Empty square, display row ${Math.floor(i/4)+1} from the top, column ${i%4+1}`:`${movable?'Slide tile':'Tile'} ${word(board[i])} at display row ${Math.floor(i/4)+1} from the top, column ${i%4+1}${movable?' into the empty square':''}`);
      });
      if(targetBoard) {
        targetBoard.innerHTML=target.map(t=>`<div class="kp-cell${t===0?' kp-empty':''}">${artwork(t)}</div>`).join('');
        const rows=Array.from({length:4},(_,row)=>`Display row ${row+1} from the top: ${target.slice(row*4,row*4+4).map(t=>t===0?'empty square':word(t)).join(', ')}`).join('. ');
        targetBoard.setAttribute('aria-label',`Fixed target kolam, read from the top and left to right. ${rows}.`);
      }
      container.querySelector('.kp-count').textContent=`${history.length} ${history.length===1?'move':'moves'}`;
      action('undo').disabled=history.length===0;
      action('reset').disabled=history.length===0&&!showingRoute;
      action('route').hidden=compare&&mode==='unreachable';
      container.querySelector('.kp-route-note').hidden=compare&&mode==='unreachable';
      action('route').textContent='Show a route from the start';
      const valid=analyse(board).correct,newKolam=valid&&!same(board,start),reached=compare&&same(board,target);
      let status;
      if(compare) {
        const sign=n=>n===1?'+1':'−1';
        container.querySelector('.kp-current-sign').textContent=`ε(X) = ${sign(epsilon(board))}`;
        container.querySelector('.kp-target-sign').textContent=`ε(Y) = ${sign(epsilon(target))}`;
        status=mode==='unreachable'?'Different signs: no sequence of legal slides can reach this target. Try a move — ε(X) stays the same.':reached?'Target reached! The slides have transformed X into Y.':'Same sign: this target is reachable. Every legal slide preserves ε(X).';
        container.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
      } else status=newKolam?'You made a different complete kolam! Select Scramble to try another starting arrangement.':valid?'A complete kolam to start from. Slide a tile and look for another.':'The lines are open. Keep sliding until all the curves join again.';
      const feedback=container.querySelector('.kp-feedback');feedback.classList.toggle('kp-success',compare?reached:newKolam);
      feedback.textContent=notice||status;
      renderRoute();
    }
    function makeMove(tile,manual) {
      const next=slide(board,tile);if(!next)return false;
      if(manual){clearRoute();notice='';}
      history.push(board.slice());board=next;render();
      if(manual)playingBoard.focus({preventScroll:true});return true;
    }
    function advanceRoute() {
      const path=pairs[pairIndex].path;
      if(!showingRoute||routeStep>=path.length)return;
      const tile=path[routeStep++];
      if(routeStep===path.length)stop();
      notice='';makeMove(tile,false);
    }
    function nextRouteStep() {
      timer=null;if(!playing)return;advanceRoute();
      if(playing)timer=window.setTimeout(nextRouteStep,reduced?1300:850);
    }
    action('undo').addEventListener('click',()=>{clearRoute();notice='';if(history.length)board=history.pop();render();});
    action('reset').addEventListener('click',()=>configure());
    if(!compare) action('new').addEventListener('click',()=>{pairIndex=(pairIndex+1)%pairs.length;configure();});
    action('route').addEventListener('click',()=>{configure();showingRoute=true;routePath=gapPath(start,pairs[pairIndex].path);playing=!reduced;notice=reduced?'The route is ready. Use Next step to move the gap, or Resume to play the route.':'';render();if(playing)timer=window.setTimeout(nextRouteStep,1000);});
    action('pause').addEventListener('click',()=>{if(playing)stop();else{playing=true;notice='';timer=window.setTimeout(nextRouteStep,reduced?1300:850);}render();});
    action('step').addEventListener('click',()=>{stop();advanceRoute();});
    container.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;configure();}));
    playingBoard.addEventListener('keydown',event=>{
      const offsets={ArrowUp:-4,ArrowDown:4,ArrowLeft:-1,ArrowRight:1};
      if(!(event.key in offsets)||event.altKey||event.ctrlKey||event.metaKey)return;
      event.preventDefault();const blank=board.indexOf(0),next=blank+offsets[event.key];
      if(neighbours(blank).includes(next))makeMove(board[next],true);
    });
    configure();
    return () => {
      stop();
      container.replaceChildren();
      container.classList.remove('kp-widget');
    };
  }

export const slidingKolamApi={seeds,pairs,same,neighbours,slide,gapPath,gapDirection,gapMapSvg,epsilon,rotate,analyse,tilePath};

export function initializeSlidingKolams(root) {
  const cleanups=Array.from(root.querySelectorAll('[data-kolam-game]')).map(initialise);
  return () => cleanups.forEach(cleanup=>cleanup());
}
