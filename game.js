(() => {
  'use strict';
  const canvas = document.querySelector('#scene');
  const ctx = canvas.getContext('2d');
  const $ = (s) => document.querySelector(s);
  const stage = $('#gameStage');
  const aimControl = $('#aimControl');
  const padKnob = $('#padKnob');
  const fireButton = $('#fireButton');
  const modal = $('#modalBackdrop');
  const modalContent = $('#modalContent');
  const levels = [
    { name:'The Quiet Range', caption:'RANGE 01 — DUST & TIN', sky:'#d8a57b', far:'#9b755e', near:'#74584b', ground:'#51493d', wind:2, ammo:3, targets:[['can',570,365],['can',660,365],['can',750,365]], decor:'range' },
    { name:'Balloon Weather', caption:'RANGE 02 — UP IN THE AIR', sky:'#a6c1b5', far:'#718f86', near:'#526f66', ground:'#4c5043', wind:-3, ammo:4, targets:[['balloon',500,285],['balloon',655,235],['balloon',805,300]], decor:'pines', moving:true },
    { name:'The Wind Yard', caption:'RANGE 03 — READ THE GUST', sky:'#d1a26d', far:'#937550', near:'#70563f', ground:'#48473b', wind:5, ammo:4, targets:[['plate',510,347],['plate',625,310],['plate',747,350],['can',850,357]], decor:'yard', moving:true },
    { name:'Last Light', caption:'RANGE 04 — ALL EARS', sky:'#8a7892', far:'#655c70', near:'#454b55', ground:'#343e40', wind:-4, ammo:3, targets:[['chime',545,320],['chime',700,272],['chime',835,342]], decor:'night' }
  ];
  const state = { level:0, unlocked:0, shots:0, ammo:3, targets:[], bullets:[], particles:[], padX:.5, padY:.36, wind:2, steady:false, pointer:null, dragTimer:0, movingAim:false, lastTime:0, elapsed:0, toastTimer:0, overlay:'intro', bestAccuracy:null, sound:true, gameOver:false };
  const groundY = 425;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const rand = (a,b) => a + Math.random()*(b-a);
  const currentLevel = () => levels[state.level];
  const angle = () => .04 + (.84-state.padY)*.58;
  const gunX = () => 112 + (state.padX-.5)*155;
  const gunY = () => groundAt(gunX())-18;
  const muzzle = () => { const a=angle(), x=gunX()+Math.cos(a)*63, y=gunY()-Math.sin(a)*63; return {x,y}; };
  function groundAt(x){ return 424 + Math.sin(x*.012 + state.level)*3 + Math.sin(x*.031)*2; }
  function initTargets(){
    const l=currentLevel(); state.targets=l.targets.map(([type,x,y],i)=>({type,x,y,baseY:y,r:type==='balloon'?23:type==='plate'?23:type==='chime'?19:18,hit:false,phase:i*2.15,vy:0,vx:0,rotation:0,opacity:1}));
    state.ammo=l.ammo; state.shots=0; state.bullets=[]; state.particles=[]; state.gameOver=false; state.wind=l.wind; state.padX=.5; state.padY=.36; state.bestAccuracy=null;
    $('#ammoText').textContent=String(state.ammo).padStart(2,'0')+' ROUNDS';
    $('#levelNumber').textContent=String(state.level+1).padStart(2,'0'); $('#levelName').textContent=l.name; $('#stageCaption').textContent=l.caption;
    $('#windText').textContent=`WIND ${String(Math.abs(l.wind)).padStart(2,'0')}`; $('#windSpeed').textContent=(Math.abs(l.wind)*.4).toFixed(1); $('#windArrow').textContent=l.wind<0?'←':'→'; $('#windArrow').style.transform=l.wind<0?'scaleX(-1)':'';
    $('#scoreValue').innerHTML='—<small> px</small>'; $('#progressText').innerHTML=`${String(state.level+1).padStart(2,'0')} <i>/</i> 04`;
    updateProgress(); updatePad();
  }
  function updateProgress(){
    $('#progressTrack').innerHTML=levels.map((_,i)=>`<span class="progress-segment ${i<state.level?'done':''} ${i===state.level?'current':''}"></span>`).join('');
  }
  function updatePad(){
    padKnob.style.left=`${50+(state.padX-.5)*76}%`; padKnob.style.top=`${54+(state.padY-.5)*76}%`;
    aimControl.setAttribute('aria-valuenow',String(Math.round((.84-state.padY)*100)));
    $('#angleReadout').textContent=`${(angle()*180/Math.PI).toFixed(1)}°`;
  }
  function openIntro(){
    state.overlay='intro'; modalContent.innerHTML=`<h2>A little<br><em>lead goes a long way.</em></h2><p>Four quiet ranges. A handful of rounds. Mind the wind, follow the arc, and let gravity do the clever bit.</p><div class="modal-actions"><button class="primary-action" data-action="start">TAKE THE SHOT&nbsp; ↗</button><button class="secondary-action" data-action="manual">FIELD MANUAL</button></div>`; modal.classList.add('open');
  }
  function showManual(){
    state.overlay='manual'; modalContent.innerHTML=`<h2>Read the <em>range.</em></h2><p>Every round follows a real little arc. The lime dot is the predicted impact — not your line of sight.</p><div class="manual-list"><div class="manual-row"><span class="manual-key">DRAG</span><span>Use the left pad to reposition the rifle and raise or lower the muzzle.</span></div><div class="manual-row"><span class="manual-key">LIME DOT</span><span>Track the impact dot. Raise your aim to account for bullet drop and wind.</span></div><div class="manual-row"><span class="manual-key">FIRE</span><span>Tap the right button or press Space. Clear every target before you run dry.</span></div><div class="manual-row"><span class="manual-key">STEADY</span><span>Hold still on the aim pad to settle your shot and calm the breeze.</span></div></div><div class="modal-actions"><button class="primary-action" data-action="resume">GOT IT</button></div>`; modal.classList.add('open');
  }
  function showLevels(){
    state.overlay='levels';
    const best=JSON.parse(localStorage.getItem('deadeye-best')||'{}');
    modalContent.innerHTML=`<h2>Pick your <em>range.</em></h2><p>New ground opens as you clear the last. Each range brings its own wind and moving targets.</p><div class="range-grid">${levels.map((l,i)=>`<button class="range-card ${i===state.level?'active':''} ${i<=state.unlocked?'':'locked'} ${best[i]?'done':''}" data-level="${i}" ${i>state.unlocked?'disabled':''}><small>RANGE ${String(i+1).padStart(2,'0')} · ${i<=state.unlocked?'OPEN':'LOCKED'}</small><b>${l.name}</b></button>`).join('')}</div><div class="modal-actions"><button class="secondary-action" data-action="resume">CLOSE</button></div>`; modal.classList.add('open');
  }
  function showResult(won){
    state.overlay=won?'won':'failed';
    if(won){ state.unlocked=Math.max(state.unlocked,Math.min(state.level+1,levels.length-1)); localStorage.setItem('deadeye-unlocked',state.unlocked); const best=JSON.parse(localStorage.getItem('deadeye-best')||'{}'); if(!best[state.level]||state.shots<best[state.level])best[state.level]=state.shots; localStorage.setItem('deadeye-best',JSON.stringify(best)); }
    const next=state.level<levels.length-1;
    modalContent.innerHTML=won?`<h2>Range <em>clear.</em></h2><p>${state.shots} round${state.shots===1?'':'s'} spent. ${next?'The next stretch is waiting.':'That’s all four ranges. Lovely shooting.'} ${state.bestAccuracy!==null?`Closest impact: ${state.bestAccuracy} px.`:''}</p><div class="modal-actions"><button class="primary-action" data-action="${next?'next':'again'}">${next?'NEXT RANGE&nbsp; ↗':'SHOOT AGAIN'}</button><button class="secondary-action" data-action="levels">RANGES</button></div>`:`<h2>Out of <em>rounds.</em></h2><p>The targets are still out there. Nudge the muzzle higher to compensate for drop, then give it another go.</p><div class="modal-actions"><button class="primary-action" data-action="retry">RELOAD & RETRY&nbsp; ↗</button><button class="secondary-action" data-action="levels">RANGES</button></div>`;
    modal.classList.add('open');
  }
  function closeModal(){modal.classList.remove('open');state.overlay='playing';}
  function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove('show'),1250);}
  modal.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]')?.dataset.action;
    const level=e.target.closest('[data-level]');
    if(level&&!level.disabled){state.level=Number(level.dataset.level);initTargets();closeModal();return;}
    if(!action)return;
    if(action==='start'||action==='resume'){closeModal();}
    if(action==='manual')showManual();
    if(action==='levels')showLevels();
    if(action==='retry'){initTargets();closeModal();}
    if(action==='again'){initTargets();closeModal();}
    if(action==='next'){state.level=Math.min(state.level+1,levels.length-1);initTargets();closeModal();}
  });
  $('#helpButton').addEventListener('click',showManual);
  $('#levelsButton').addEventListener('click',showLevels);
  $('#soundButton').addEventListener('click',()=>{state.sound=!state.sound;$('#soundButton').textContent=state.sound?'♫':'♪';toast(state.sound?'SOUND ON':'SOUND OFF');});
  function pointerPad(e){const r=aimControl.getBoundingClientRect(),nx=clamp((e.clientX-r.left)/r.width,.12,.88),ny=clamp((e.clientY-r.top)/r.height,.14,.86);state.padX=nx;state.padY=ny;state.steady=false;state.movingAim=true;state.dragTimer=performance.now();updatePad();}
  aimControl.addEventListener('pointerdown',e=>{e.preventDefault();aimControl.setPointerCapture(e.pointerId);pointerPad(e);state.pointer=e.pointerId;});
  aimControl.addEventListener('pointermove',e=>{if(state.pointer===e.pointerId)pointerPad(e);});
  aimControl.addEventListener('pointerup',e=>{if(state.pointer===e.pointerId){state.pointer=null;state.movingAim=false;}});
  aimControl.addEventListener('pointercancel',()=>{state.pointer=null;state.movingAim=false;});
  aimControl.addEventListener('keydown',e=>{let d=.035;if(e.key==='ArrowLeft')state.padX-=d;else if(e.key==='ArrowRight')state.padX+=d;else if(e.key==='ArrowUp')state.padY-=d;else if(e.key==='ArrowDown')state.padY+=d;else return;e.preventDefault();state.padX=clamp(state.padX,.12,.88);state.padY=clamp(state.padY,.14,.86);updatePad();});
  let audio;
  function soundShot(){if(!state.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(115,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(42,audio.currentTime+.14);gain.gain.setValueAtTime(.14,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.19);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.2);}catch(_){}}
  function fire(){
    if(state.overlay!=='playing'||state.gameOver)return;
    if(state.ammo<=0){toast('NO ROUNDS LEFT');return;}
    const m=muzzle(),a=angle(),speed=570,variation=state.steady?0:rand(-.006,.006);
    state.bullets.push({x:m.x,y:m.y,vx:Math.cos(a+variation)*speed,vy:-Math.sin(a+variation)*speed,life:0,trail:[],hit:false});
    state.ammo--;state.shots++;$('#ammoText').textContent=String(state.ammo).padStart(2,'0')+' ROUNDS';fireButton.classList.add('firing');setTimeout(()=>fireButton.classList.remove('firing'),110);stage.classList.remove('shot');void stage.offsetWidth;stage.classList.add('shot');soundShot();state.steady=false;
  }
  fireButton.addEventListener('pointerdown',e=>{e.preventDefault();fire();});
  window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(!e.repeat)fire();}if(e.key==='Escape'&&modal.classList.contains('open'))closeModal();});
  function predict(){
    const m=muzzle(),a=angle(),speed=570,dt=.018,wind=(state.steady?state.wind*.42:state.wind)*8;
    let x=m.x,y=m.y,vx=Math.cos(a)*speed,vy=-Math.sin(a)*speed;
    for(let i=0;i<180;i++){
      const nx=x+vx*dt,ny=y+vy*dt;
      for(const t of state.targets){if(t.hit)continue;const ty=targetY(t);const rr=t.r*.78;if((nx-t.x)**2+(ny-ty)**2<rr*rr)return {x:nx,y:ny,target:t};}
      if(ny>=groundAt(nx)-5)return {x:nx,y:groundAt(nx)-5,target:null};
      if(nx>955||ny<10)return{x:clamp(nx,10,950),y:clamp(ny,10,500),target:null};
      x=nx;y=ny;vx+=wind*dt;vy+=190*dt;
    }
    return{x,y,target:null};
  }
  function targetY(t){return t.y+(currentLevel().moving?Math.sin(state.elapsed*1.6+t.phase)*11:0);}
  function update(dt){
    state.elapsed+=dt;
    if(state.pointer!==null){state.steady=performance.now()-state.dragTimer>350;state.movingAim=!state.steady;}else state.steady=false;
    const windAcc=(state.steady?state.wind*.42:state.wind)*8;
    for(const t of state.targets){if(t.hit){t.x+=t.vx*dt;t.y+=t.vy*dt;t.vy+=210*dt;t.rotation+=t.vx*dt*.03;t.opacity=Math.max(0,t.opacity-dt*.24);continue;}if(currentLevel().moving)t.x=t.x;}
    for(const b of state.bullets){if(b.hit)continue;b.life+=dt;b.trail.push({x:b.x,y:b.y});if(b.trail.length>8)b.trail.shift();b.vx+=windAcc*dt;b.vy+=190*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      let hit=null;for(const t of state.targets){if(t.hit)continue;const cy=targetY(t),r=t.r*.78;if((b.x-t.x)**2+(b.y-cy)**2<r*r){hit=t;break;}}
      if(hit){hit.hit=true;hit.vx=rand(-45,45);hit.vy=rand(-95,-35);b.hit=true;spawnBurst(b.x,b.y,hit.type);const err=Math.round(Math.hypot(b.x-hit.x,b.y-targetY(hit)));state.bestAccuracy=state.bestAccuracy===null?err:Math.min(state.bestAccuracy,err);$('#scoreValue').innerHTML=`${String(state.bestAccuracy).padStart(3,'0')}<small> px</small>`;toast(`${hit.type==='balloon'?'POP!':'NICE HIT'}  ·  ${err} PX`);if(state.targets.every(t=>t.hit))setTimeout(()=>showResult(true),800);}
      else if(b.y>=groundAt(b.x)-5||b.x>975||b.life>3.5){b.hit=true;if(b.y>=groundAt(b.x)-5)spawnBurst(b.x,groundAt(b.x)-4,'dust');}
    }
    state.bullets=state.bullets.filter(b=>!b.hit);state.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;p.life-=dt;});state.particles=state.particles.filter(p=>p.life>0);
    if(state.ammo===0&&!state.bullets.length&&!state.gameOver&&!state.targets.every(t=>t.hit)){state.gameOver=true;setTimeout(()=>showResult(false),450);}
  }
  function spawnBurst(x,y,type){const n=type==='dust'?5:10;for(let i=0;i<n;i++)state.particles.push({x,y,vx:rand(-80,80),vy:rand(-105,10),life:rand(.25,.65),size:rand(2,5),color:type==='dust'?'#d8bd8a':['#f4cb69','#d4ff5d','#ec8358'][i%3]});}
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function drawBackground(){
    const l=currentLevel();ctx.clearRect(0,0,960,540);
    const sky=ctx.createLinearGradient(0,0,0,groundY);sky.addColorStop(0,l.sky);sky.addColorStop(1,l.sky+'');ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);
    // chunky pixel-clouds and far ridgeline
    ctx.globalAlpha=.18;for(let i=0;i<8;i++){const x=((i*157-state.elapsed*4)%1080+1080)%1080-70;rect(x,70+(i%3)*26,80+(i%3)*28,6,'#fff0d6');rect(x+15,64+(i%3)*26,42,6,'#fff0d6');}ctx.globalAlpha=1;
    if(l.decor==='night'){rect(0,0,960,270,'#322f48');for(let i=0;i<70;i++){const x=(i*137)%960,y=(i*79)%210;rect(x,y,2,2,i%5===0?'#ead598':'#d6d3bf');}ctx.fillStyle='#e7d29b';ctx.beginPath();ctx.arc(790,92,29,0,Math.PI*2);ctx.fill();ctx.fillStyle='#51465a';ctx.beginPath();ctx.arc(803,82,28,0,Math.PI*2);ctx.fill();}
    // distant hills
    ctx.fillStyle=l.far;ctx.beginPath();ctx.moveTo(0,325);for(let x=0;x<=960;x+=32)ctx.lineTo(x,278+Math.sin(x*.012+state.level)*19+Math.sin(x*.027)*8);ctx.lineTo(960,440);ctx.lineTo(0,440);ctx.fill();
    ctx.fillStyle=l.near;ctx.beginPath();ctx.moveTo(0,365);for(let x=0;x<=960;x+=24)ctx.lineTo(x,320+Math.sin(x*.015+1)*16+Math.sin(x*.033)*7);ctx.lineTo(960,450);ctx.lineTo(0,450);ctx.fill();
    // distant pines
    if(l.decor==='pines'||l.decor==='night'){for(let i=0;i<23;i++){const x=i*47+((i%3)*7),y=332+Math.sin(x*.014)*8,s=14+(i%4)*4;rect(x-2,y-s,4,s,'#394e48');rect(x-7,y-s+8,14,4,'#405950');rect(x-10,y-s+14,20,4,'#465e53');}}
    ctx.fillStyle=l.ground;ctx.beginPath();ctx.moveTo(0,groundY);for(let x=0;x<=960;x+=20)ctx.lineTo(x,groundAt(x));ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
    // pixelated ground flecks
    for(let i=0;i<100;i++){const x=(i*83+17)%960,y=435+((i*47)%100);rect(x,y,2+(i%4),1+(i%2),i%3===0?'#8a7554':'#c3a06b');}
    if(l.decor==='range')drawRangeDecor();if(l.decor==='yard')drawYardDecor();if(l.decor==='night')drawNightDecor();
  }
  function drawRangeDecor(){
    // ochre berm and range flags
    for(let i=0;i<5;i++){const x=470+i*118;line(x,355,x,405,'#55483b',2);rect(x,355,15,7,i%2?'#e7d5ad':'#d56b50');}
    rect(28,388,193,7,'#4e4b40');rect(38,396,173,3,'#b88d5a');
    // old watch board
    rect(836,317,67,48,'#493f35');rect(842,323,55,34,'#c59865');rect(846,327,47,26,'#d7aa70');
    ctx.fillStyle='#756345';ctx.font='9px monospace';ctx.fillText('RANGE',850,342);
  }
  function drawYardDecor(){
    // rusted scaffold, hanging chains
    rect(390,260,5,148,'#574939');rect(882,253,5,155,'#574939');rect(390,260,497,5,'#574939');
    for(let i=0;i<9;i++){const x=414+i*55;line(x,266,x,296+(i%3)*11,'#443e35',1);}
    rect(20,365,165,11,'#53463a');rect(35,354,12,11,'#655443');rect(160,346,10,19,'#655443');
    rect(792,334,106,5,'#6a503b');rect(803,339,4,70,'#51493d');rect(884,339,4,70,'#51493d');
  }
  function drawNightDecor(){
    // moonlit silhouettes, fireflies
    rect(0,399,960,5,'#29363a');for(let i=0;i<10;i++){let x=i*111+18;rect(x,390-(i%3)*8,13,16,'#293b3b');rect(x+4,381-(i%3)*8,5,14,'#293b3b');}
    for(let i=0;i<10;i++){const x=(i*103+state.elapsed*9)%960,y=245+(i*59)%150;rect(x,y,2,2,'#dcdf8e');}
    rect(88,354,40,44,'#293638');rect(94,360,28,8,'#b38954');rect(101,368,4,20,'#293638');
  }
  function drawTarget(t){
    const x=t.x,y=targetY(t);ctx.save();ctx.translate(x,y);ctx.rotate(t.rotation||0);ctx.globalAlpha=t.hit?t.opacity:1;
    if(t.type==='can'){
      rect(-13,-17,26,34,'#ba603f');rect(-11,-15,22,4,'#dfa46e');rect(-12,13,24,3,'#744837');rect(-13,-10,26,3,'#d58659');rect(-13,2,26,3,'#df9b63');rect(-3,-8,6,9,'#ebc57c');rect(-17,-18,34,3,'#d8c093');rect(-15,17,30,3,'#463d34');
    } else if(t.type==='balloon'){
      ctx.fillStyle='#e97456';ctx.beginPath();ctx.ellipse(0,-3,17,21,0,0,Math.PI*2);ctx.fill();rect(-9,-16,8,7,'#f8b17b');rect(-3,17,6,5,'#b65143');line(0,21,0,45,'#52483c',1);rect(-10,43,20,5,'#574c3c');rect(-13,48,26,3,'#b9a17c');
    }else if(t.type==='plate'){
      line(0,19,0,47,'#413e34',3);rect(-9,43,18,4,'#605646');rect(-18,-19,36,37,'#bcac87');rect(-14,-15,28,29,'#68796e');rect(-9,-10,18,19,'#e1d3a9');rect(-4,-5,8,9,'#cb6245');rect(-1,-17,2,34,'#c5b88f');rect(-16,-4,32,2,'#c5b88f');
    }else{
      line(0,-37,0,-13,'#514638',2);rect(-21,-13,42,5,'#c59f63');rect(-17,-8,5,20,'#bd9b62');rect(-2,-8,5,26,'#bd9b62');rect(13,-8,5,18,'#bd9b62');rect(-22,12,44,4,'#766347');
      for(let i=0;i<3;i++){const sx=-15+i*15;line(sx,13,sx,29+i%2*4,'#c9b47d',1);rect(sx-3,28+i%2*4,7,3,'#e6d39e');}
    }
    if(t.hit){ctx.globalAlpha=1;for(let i=0;i<3;i++)rect(rand(-20,20),rand(-15,15),2,2,'#d4ff5d');}
    ctx.restore();ctx.globalAlpha=1;
  }
  function drawGun(){
    const x=gunX(),y=gunY(),a=angle();
    // cast shadow / small field positioner
    ctx.fillStyle='#2e342d';ctx.beginPath();ctx.ellipse(x-1,y+17,35,6,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(x,y);ctx.rotate(-a);
    rect(-26,-13,29,16,'#37423e');rect(-20,-18,21,6,'#65705e');rect(-6,-8,48,9,'#303a37');rect(35,-7,34,6,'#282f2d');rect(64,-6,8,4,'#858877');rect(2,1,16,19,'#493d32');rect(-20,0,10,14,'#5d4c3a');rect(-26,12,20,5,'#393c34');rect(-16,-18,3,7,'#d4ff5d');
    // stock grain
    rect(-25,-9,4,2,'#8a7152');rect(-20,-4,3,2,'#8a7152');
    ctx.restore();
    // glint
    ctx.fillStyle='#d4ff5d';ctx.globalAlpha=.35;ctx.fillRect(muzzle().x-1,muzzle().y-1,2,2);ctx.globalAlpha=1;
  }
  function drawPrediction(){
    const p=predict();ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle='#e8f3c258';ctx.lineWidth=1;ctx.beginPath();const m=muzzle();ctx.moveTo(m.x,m.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);
    const pulse=.72+Math.sin(state.elapsed*5)*.16;ctx.globalAlpha=pulse;ctx.strokeStyle='#d4ff5d';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d4ff5d';ctx.fillRect(p.x-1,p.y-1,2,2);ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function draw(){
    drawBackground();
    for(const t of state.targets)drawTarget(t);
    // line up shot against target silhouette
    drawGun();drawPrediction();
    for(const b of state.bullets){ctx.fillStyle='#fff4c6';ctx.fillRect(b.x-2,b.y-2,4,4);for(let i=0;i<b.trail.length;i++){ctx.globalAlpha=(i/b.trail.length)*.4;ctx.fillStyle='#ffe9ae';ctx.fillRect(b.trail[i].x,b.trail[i].y,2,2);}ctx.globalAlpha=1;}
    for(const p of state.particles){ctx.globalAlpha=clamp(p.life*2,0,1);rect(p.x,p.y,p.size,p.size,p.color);}ctx.globalAlpha=1;
    if(state.steady){ctx.fillStyle='#d4ff5d';ctx.font='8px monospace';ctx.fillText('STEADY',gunX()-24,groundAt(gunX())+32);}
  }
  function frame(t){const dt=Math.min(.04,(t-state.lastTime)/1000||0);state.lastTime=t;if(state.overlay==='playing')update(dt);draw();requestAnimationFrame(frame);}
  state.unlocked=Number(localStorage.getItem('deadeye-unlocked')||0);initTargets();openIntro();requestAnimationFrame(frame);
})();
