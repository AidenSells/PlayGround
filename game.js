(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const x = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const $ = (id) => document.getElementById(id);
  const ui = {
    title: $('title-screen'), map: $('map-screen'), result: $('result-screen'), top: $('topbar'),
    hint: $('control-hint'), pad: $('aim-pad'), fire: $('fire-btn'), grid: $('level-grid'),
    mission: $('mission-name'), wind: $('wind-label'), shots: $('shot-count'),
    kicker: $('result-kicker'), resultTitle: $('result-title'), stars: $('result-stars'),
    copy: $('result-copy'), resultShots: $('result-shots'), score: $('result-score'), next: $('next-btn')
  };

  const levels = [
    { name: 'TIN TOWN', place: 'Dusty range', sky: '#b67f59', far: '#697561', near: '#34483e', wind: 0, goal: 1, kind: 'tin', targets: [{x: 738,y: 322,r: 16}], blocks: [{x: 610,y: 360,w: 75,h: 64,c:'#645543'}] },
    { name: 'THE WATCH', place: 'Old signal post', sky: '#c19b69', far: '#747452', near: '#454a38', wind: 1, goal: 1, kind: 'bell', targets: [{x: 785,y: 268,r: 18}], blocks: [{x: 710,y: 292,w: 116,h: 132,c:'#65533e'}] },
    { name: 'DEEP BLUE', place: 'Low tide', sky: '#83a4a1', far: '#557b76', near: '#294b4b', wind: -2, goal: 2, kind: 'float', targets: [{x: 672,y: 330,r: 16},{x: 824,y: 300,r: 15}], blocks: [{x: 737,y: 386,w: 34,h: 30,c:'#394d49'}] },
    { name: 'LAST LIGHT', place: 'Rail yard', sky: '#b77b64', far: '#685858', near: '#353c3b', wind: 2, goal: 2, kind: 'lamp', targets: [{x: 701,y: 277,r: 17},{x: 843,y: 340,r: 18}], blocks: [{x: 775,y: 352,w: 88,h: 72,c:'#51443a'}] },
    { name: 'MOONSHOT', place: 'Night garden', sky: '#506781', far: '#425c64', near: '#263b42', wind: -1, goal: 3, kind: 'orb', targets: [{x: 640,y: 296,r: 15},{x: 754,y: 258,r: 16},{x: 850,y: 319,r: 15}], blocks: [{x: 686,y: 355,w: 48,h: 68,c:'#34423f'}] }
  ];
  let state = 'title', index = 0, aim = 8, shotCount = 0, targets = [], bullets = [], particles = [];
  let recoil = 0, soundOn = false, dragging = false, pointer = null, last = performance.now(), clock = 0;
  const groundY = 425;
  const rifleOrigin = {x: 67, y: 399};

  function setScreen(next) {
    state = next;
    ui.title.hidden = next !== 'title';
    ui.map.hidden = next !== 'map';
    ui.result.hidden = next !== 'result';
    ui.top.hidden = next !== 'playing';
    ui.hint.hidden = next !== 'playing';
    ui.pad.hidden = next !== 'playing';
    ui.fire.hidden = next !== 'playing';
  }
  function updateHud() {
    const level = levels[index];
    ui.mission.textContent = level.name;
    ui.wind.textContent = level.wind === 0 ? 'CALM AIR' : `WIND ${level.wind > 0 ? '→' : '←'} ${Math.abs(level.wind)}`;
    ui.shots.textContent = String(shotCount).padStart(2, '0');
  }
  function startLevel(i) {
    index = (i + levels.length) % levels.length;
    targets = levels[index].targets.map((t, n) => ({...t, alive: true, number:n}));
    bullets = []; particles = []; shotCount = 0; aim = 8; recoil = 0; clock = 0;
    updateHud(); setScreen('playing');
  }
  function showMap() { setScreen('map'); }
  function makeMap() {
    ui.grid.innerHTML = '';
    levels.forEach((level, i) => {
      const card = document.createElement('button');
      card.className = 'level-card';
      card.setAttribute('aria-label', `Play range ${i + 1}: ${level.name}`);
      card.innerHTML = `<span class="card-number">0${i + 1} / 05</span><div class="card-art"></div><div class="card-info"><b>${level.name}</b><small>${level.place.toUpperCase()}</small></div><span class="card-stars">${'★'.repeat(level.goal)}</span>`;
      card.addEventListener('click', () => startLevel(i));
      ui.grid.appendChild(card);
    });
  }
  function finishLevel(won) {
    if (!won) return;
    setScreen('result');
    const rating = shotCount <= targets.length ? 3 : shotCount <= targets.length + 2 ? 2 : 1;
    ui.kicker.textContent = 'OPERATION COMPLETE';
    ui.resultTitle.textContent = rating === 3 ? 'CLEAN HIT.' : 'RANGE CLEAR.';
    ui.stars.textContent = '★'.repeat(rating) + '☆'.repeat(3 - rating);
    ui.copy.textContent = rating === 3 ? 'One clean line. Just like the manual.' : 'Every target down. Room to sharpen the shot.';
    ui.resultShots.textContent = String(shotCount).padStart(2, '0');
    ui.score.textContent = String(Math.max(100, 1000 - Math.max(0, shotCount - targets.length) * 125));
    ui.next.innerHTML = index === levels.length - 1 ? 'FIELD NOTES <span>→</span>' : 'NEXT RANGE <span>→</span>';
  }

  function rect(a,b,c,d,color) { x.fillStyle=color; x.fillRect(Math.round(a),Math.round(b),Math.round(c),Math.round(d)); }
  function polygon(points,color) { x.fillStyle=color; x.beginPath(); x.moveTo(points[0][0],points[0][1]); for(let i=1;i<points.length;i++)x.lineTo(points[i][0],points[i][1]); x.closePath(); x.fill(); }
  function background() {
    const L = levels[index];
    const g = x.createLinearGradient(0,0,0,H); g.addColorStop(0,L.sky); g.addColorStop(.59,'#d0ad7b'); g.addColorStop(1,'#66705b');
    x.fillStyle=g; x.fillRect(0,0,W,H);
    // Sun, distant ridges and a soft atmospheric band.
    x.globalAlpha=.72; x.fillStyle=index===4?'#e7d59b':'#f1d89a'; x.beginPath(); x.arc(index===4?760:790,index===4?107:105, index===4?21:30,0,Math.PI*2); x.fill(); x.globalAlpha=1;
    polygon([[0,280],[95,198],[187,273],[291,177],[414,280],[526,207],[645,285],[773,184],[960,272],[960,425],[0,425]],L.far);
    polygon([[0,330],[136,274],[250,327],[380,244],[510,332],[674,267],[798,328],[912,250],[960,283],[960,425],[0,425]],L.near);
    rect(0,groundY,W,H-groundY,'#4e5947'); rect(0,groundY,W,4,'#a2a077');
    // Pixel scrub and pebbles.
    for(let i=0;i<42;i++){let px=(i*173+31)%W, py=groundY+13+(i*29)%99;rect(px,py,2+(i%3),2,i%2?'#697256':'#3c4d40');}
    for(let i=0;i<8;i++){const px=i*137+34;rect(px,groundY-17-(i%3)*7,3,17,'#35493d');rect(px-4,groundY-20-(i%3)*7,11,5,'#435746');}
    // Distant range markers.
    rect(218,286,2,83,'#3f5145'); rect(206,284,25,3,'#3f5145'); rect(210,296,16,2,'#8e9873');
    if(index===1 || index===3){rect(456,260,5,165,'#454842');rect(438,267,40,5,'#454842');rect(442,280,31,3,'#9b8a69');}
  }
  function obstacle(o) {
    rect(o.x,o.y,o.w,o.h,o.c); rect(o.x,o.y,o.w,5,'#9b8662');
    rect(o.x+6,o.y+12,Math.max(3,o.w-12),2,'#302f2a');
    for(let j=0;j<Math.floor(o.w/20);j++) rect(o.x+10+j*20,o.y+o.h-12,7,3,'#827056');
  }
  function drawTarget(t) {
    const kind=levels[index].kind, cx=t.x, cy=t.y;
    x.save(); x.translate(Math.round(cx),Math.round(cy));
    if(kind==='tin'){
      rect(-10,-13,20,27,'#c6b28a');rect(-8,-16,16,4,'#e1d3ac');rect(-8,10,16,4,'#796347');rect(-7,-7,14,2,'#8b7959');rect(-4,-2,8,7,'#f1d9a0');
    } else if(kind==='bell') {
      rect(-3,-34,6,36,'#403d33');rect(-12,-19,24,17,'#d7c58e');rect(-9,-23,18,5,'#a88a5b');rect(-5,-2,10,5,'#644e36');rect(-2,3,4,6,'#a88a5b');
    } else if(kind==='float') {
      x.fillStyle='#ed704b';x.beginPath();x.arc(0,0,10,0,Math.PI*2);x.fill();rect(-3,-13,6,5,'#e7d39b');rect(-2,10,4,9,'#d5c293');rect(-11,19,22,3,'#d5c293');rect(-5,-2,3,3,'#f6dda0');
    } else if(kind==='lamp') {
      rect(-2,-30,4,32,'#393c35');rect(-13,-29,26,17,'#d6da8a');rect(-17,-33,34,5,'#5a5141');rect(-9,-24,18,7,'#f4e3a2');rect(-6,2,12,4,'#9d8760');
    } else {
      x.fillStyle='#e3d99b';x.beginPath();x.arc(0,0,11,0,Math.PI*2);x.fill();x.fillStyle='#f0a769';x.beginPath();x.arc(0,0,6,0,Math.PI*2);x.fill();rect(-2,-20,4,7,'#dfd5a0');rect(-2,13,4,7,'#dfd5a0');rect(-18,-2,7,4,'#dfd5a0');rect(11,-2,7,4,'#dfd5a0');
    }
    x.restore();
  }
  function rifle() {
    x.save(); x.translate(rifleOrigin.x,rifleOrigin.y+recoil*5); x.rotate(-aim*Math.PI/180);
    rect(-14,-7,42,15,'#654633');rect(-3,-10,38,5,'#9b7049');rect(16,-11,75,5,'#273332');rect(24,-14,68,3,'#59645c');rect(88,-14,5,8,'#252d2b');rect(25,-6,9,13,'#c1a06b');rect(38,-6,6,6,'#28312f');rect(-12,7,28,5,'#453a2e');rect(26,-17,7,4,'#a9a681');rect(81,-18,3,7,'#b3ad82');rect(5,9,8,18,'#57412f');rect(49,-2,7,4,'#d7c58d');
    x.restore();
  }
  function muzzle() { return {x: rifleOrigin.x+94*Math.cos(aim*Math.PI/180), y: rifleOrigin.y-94*Math.sin(aim*Math.PI/180)+recoil*5}; }
  function trajectory() {
    const from=muzzle(), points=[from], wind=levels[index].wind;
    const radians=aim*Math.PI/180, vx=690, vy=-Math.tan(radians)*vx, gravity=210;
    let hit=null, end=from;
    for(let t=0.025;t<=1.5;t+=0.025){
      const px=from.x+vx*t+wind*3.1*t*t, py=from.y+vy*t+gravity*t*t/2;
      const p={x:px,y:py}; points.push(p); end=p;
      if(py>=groundY || px>=W-8 || py<30) break;
      for(const target of targets){if(!target.alive)continue;const rad=target.r+4;if(Math.hypot(px-target.x,py-target.y)<rad){hit=target;end=p;return {from,points,hit,to:end};}}
    }
    return {from,points,hit,to:end};
  }
  function drawReticle() {
    if(state!=='playing')return;
    const tr=trajectory(), p=tr.to, r=tr.hit?10:7;
    x.save();x.setLineDash([3,5]);x.strokeStyle='#e7e5c27a';x.lineWidth=1;x.beginPath();x.moveTo(tr.from.x,tr.from.y);for(let i=1;i<tr.points.length;i+=2)x.lineTo(tr.points[i].x,tr.points[i].y);x.stroke();x.restore();
    x.strokeStyle=tr.hit?'#f06b3d':'#e6e9c8';x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.y,r,0,Math.PI*2);x.stroke();x.fillStyle=tr.hit?'#f06b3d':'#e6e9c8';x.fillRect(Math.round(p.x-1),Math.round(p.y-1),3,3);
    x.beginPath();x.moveTo(p.x-r-5,p.y);x.lineTo(p.x-r,p.y);x.moveTo(p.x+r,p.y);x.lineTo(p.x+r+5,p.y);x.moveTo(p.x,p.y-r-5);x.lineTo(p.x,p.y-r);x.moveTo(p.x,p.y+r);x.lineTo(p.x,p.y+r+5);x.stroke();
    if(tr.hit){x.font='8px monospace';x.fillStyle='#f6d2a2';x.textAlign='center';x.fillText('ON TARGET',p.x,p.y+23);}
  }
  function hud() {
    if(state!=='playing')return;
    rect(748,77,184,30,'#101a1bbd');x.font='8px monospace';x.textAlign='left';x.fillStyle='#c7d0bc';x.fillText('TARGETS',760,89);
    const remaining=targets.filter(t=>t.alive).length;
    for(let i=0;i<levels[index].goal;i++){x.fillStyle=i<remaining?'#f06b3d':'#657261';x.fillRect(817+i*18,84,11,11);x.fillStyle=i<remaining?'#241e1a':'#26312c';x.fillRect(820+i*18,87,5,5);}
  }
  function addBurst(px,py,color) { for(let i=0;i<12;i++){const a=i*Math.PI/6, speed=35+(i%4)*15;particles.push({x:px,y:py,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-15,life:.65,size:2+(i%3),color});} }
  function fire() {
    if(state!=='playing' || bullets.length>0)return;
    shotCount++;ui.shots.textContent=String(shotCount).padStart(2,'0');recoil=1;
    const tr=trajectory();
    bullets.push({points:tr.points.map(p=>({...p})),progress:0,hit:tr.hit});
    playTone(150,.045,'square');
  }
  function update(dt) {
    clock+=dt;recoil=Math.max(0,recoil-dt*4.5);
    for(let i=bullets.length-1;i>=0;i--){
      const b=bullets[i];b.progress+=dt*520;const at=Math.min(Math.floor(b.progress/8),b.points.length-1);b.x=b.points[at].x;b.y=b.points[at].y;
      if(at>=b.points.length-1){
        if(b.hit&&b.hit.alive){b.hit.alive=false;addBurst(b.hit.x,b.hit.y,'#f6bf70');playTone(480,.12,'triangle');}
        else addBurst(b.x,b.y,'#d4c397');
        bullets.splice(i,1);
        if(targets.every(t=>!t.alive)){finishLevel(true);}
      }
    }
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=85*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  }
  function draw() {
    background();levels[index].blocks.forEach(obstacle);
    targets.forEach(t=>{if(t.alive)drawTarget(t)});
    rifle();drawReticle();
    for(const b of bullets){for(let i=Math.max(0,Math.floor(b.progress/8)-7);i<Math.floor(b.progress/8);i++){const p=b.points[i];if(p) {x.globalAlpha=(i%7+1)/18;rect(p.x,p.y,3,2,'#ffecaa');}}x.globalAlpha=1;rect(b.x-2,b.y-2,5,4,'#fff2c2');rect(b.x-7,b.y-1,5,2,'#f39853');}
    for(const p of particles){x.globalAlpha=Math.max(0,p.life);rect(p.x,p.y,p.size,p.size,p.color);}x.globalAlpha=1;hud();
    // Title-screen still life gives the menu a clear range silhouette.
    if(state==='title'){rect(690,389,12,65,'#25352e');rect(682,383,30,7,'#d7c69a');rect(686,365,22,18,'#f2df9e');rect(694,357,6,8,'#f2df9e');rect(716,418,34,4,'#c7ae78');rect(730,399,4,19,'#9a8056');}
  }
  function playTone(freq,duration,type='sine') {
    if(!soundOn)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ctx=playTone.ctx||(playTone.ctx=new Audio());const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);}catch(_){/* Audio is optional. */}
  }
  function pointerDown(e) {
    if(state!=='playing')return;
    const r=canvas.getBoundingClientRect(), px=(e.clientX-r.left)*W/r.width;
    if(px<W*.72){dragging=true;pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);e.preventDefault();}
  }
  function pointerMove(e) {
    if(!dragging||!pointer)return;
    const dy=e.clientY-pointer.y, dx=e.clientX-pointer.x;pointer={x:e.clientX,y:e.clientY};
    aim=Math.max(-4,Math.min(32,aim-dy*.17+dx*.012));e.preventDefault();
  }
  function pointerUp(){dragging=false;pointer=null;}
  $('play-btn').addEventListener('click',showMap);
  $('menu-btn').addEventListener('click',showMap);
  $('retry-btn').addEventListener('click',()=>startLevel(index));
  ui.next.addEventListener('click',()=>index===levels.length-1?showMap():startLevel(index+1));
  $('sound-btn').addEventListener('click',()=>{soundOn=!soundOn;$('sound-btn').textContent=soundOn?'♫':'♩';if(soundOn)playTone(520,.08);});
  ui.fire.addEventListener('pointerdown',e=>{e.preventDefault();ui.fire.classList.add('pressed');fire();});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>ui.fire.addEventListener(ev,()=>ui.fire.classList.remove('pressed')));
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);window.addEventListener('pointerup',pointerUp);window.addEventListener('pointercancel',pointerUp);
  canvas.addEventListener('click',e=>{if(state!=='playing')return;const r=canvas.getBoundingClientRect();if((e.clientX-r.left)/r.width>.72)fire();});
  window.addEventListener('keydown',e=>{if(state!=='playing')return;if(e.key==='ArrowUp'||e.key==='w')aim=Math.min(32,aim+1);if(e.key==='ArrowDown'||e.key==='s')aim=Math.max(-4,aim-1);if(e.key===' '||e.key==='Enter'){e.preventDefault();fire();}});
  makeMap();setScreen('title');
  function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
