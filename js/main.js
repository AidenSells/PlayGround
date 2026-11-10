// ---------------------------------------------------------------
// THE LITTLE THINGS — the evening, running
// ---------------------------------------------------------------
import { W, H, makeCanvas, rain, mist } from './paint.js';
import { drawPerson } from './chars.js';
import { drawTitleBase, drawTitleDynamic, drawEndingBase, drawEndingDynamic } from './special.js';
import {
  state, loadState, saveState, resetState, syncFromSave, recordEnding
} from './state.js';
import {
  scenes, getEntry, npcsAt, hotspotsAt, sceneInfo, sceneWeather,
  isWalkable, nearestWalkable, approachPoint
} from './world.js';
import * as ui from './ui.js';
import { sound } from './audio.js';
import { initStory, startIntro, handleAction, onSceneEnter } from './story.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const stageInner = document.getElementById('stage-inner');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let dpr = 1;
let mode = 'title';          // title | game | ending
let currentScene = 'shop';
let endingKey = null;
let time = 0;
let lastFrame = 0;
let baseCache = null;
let baseScene = null;
let fgLayers = [];
let titleCache = null;
let endingCache = null;
let endingCacheKey = null;
let transitioning = false;
let storyBusy = false;
let interacting = false;
let currentPrompt = null;
let moveTarget = null;
let pendingHotspot = null;
let lightning = 0;
let lastLightning = -20;
let playSaveTimer = 0;

const player = { x: 640, y: 610, dir: 'up', walk: 0, moving: false, step: 0 };
const keys = new Set();
const touchVector = { x: 0, y: 0, active: false };
let joyPointer = null;

// Foreground furniture is inserted into the depth sort at these depths.
// Each layer is a pre-rendered slice of the scene's foreground painting.
const FG_LAYERS = {
  shop: [{ from: 0, to: 720, y: 512 }],
  tea: [{ from: 0, to: 720, y: 516 }],
  clock: [{ from: 0, to: 720, y: 528 }],
  station: [{ from: 0, to: 500, y: 456 }, { from: 500, to: 720, y: 600 }],
  lighthouse: [{ from: 0, to: 400, y: 346 }, { from: 400, to: 720, y: 638 }],
  street: [{ from: 0, to: 720, y: 9999 }],
  cliff: [{ from: 0, to: 720, y: 9999 }]
};

// ---------------------------------------------------------------
// Canvas + caches
// ---------------------------------------------------------------
function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  baseCache = null;
  baseScene = null;
  fgLayers = [];
  titleCache = null;
  endingCache = null;
  endingCacheKey = null;
}

function renderCache(width, height, draw) {
  const c = makeCanvas(Math.round(width * dpr), Math.round(height * dpr));
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  draw(g);
  return c;
}

function buildSceneCache(sceneId) {
  const scene = scenes[sceneId];
  if (!scene) return;
  baseCache = renderCache(W, H, (g) => scene.draw(g, state));
  baseScene = sceneId;
  fgLayers = [];
  const layers = FG_LAYERS[sceneId] || [];
  if (scene.drawForeground) {
    for (const layer of layers) {
      const c = renderCache(W, H, (g) => {
        g.save();
        g.beginPath();
        g.rect(0, layer.from, W, layer.to - layer.from);
        g.clip();
        scene.drawForeground(g, state, 0);
        g.restore();
      });
      fgLayers.push({ y: layer.y, canvas: c });
    }
  } else {
    fgLayers = [];
  }
}

function buildTitleCache() {
  titleCache = renderCache(W, H, (g) => drawTitleBase(g));
}

function buildEndingCache(key) {
  endingCache = renderCache(W, H, (g) => drawEndingBase(g, key));
  endingCacheKey = key;
}

// ---------------------------------------------------------------
// Title / ending switches
// ---------------------------------------------------------------
async function newGame() {
  sound.init();
  sound.resume();
  ui.hideTitleInstant();
  resetState();
  state.started = true;
  state.scene = 'shop';
  // Mark the watch present immediately so a save made during the opening
  // dialogue can still be continued without a missing object.
  state.flags.introDone = true;
  state.flags.maraGaveWatch = true;
  state.player = { x: scenes.shop.spawn.x, y: scenes.shop.spawn.y, dir: scenes.shop.spawn.dir };
  currentScene = 'shop';
  endingKey = null;
  mode = 'game';
  storyBusy = true;
  moveTarget = null;
  pendingHotspot = null;
  syncPlayer();
  baseCache = null;
  baseScene = null;
  ui.showHUD();
  ui.setPlace(sceneInfo('shop').name, sceneInfo('shop').sub);
  ui.resetObjectiveTracking();
  sound.setMuted(state.settings.muted);
  sound.setScene('shop');
  saveState();
  try {
    await startIntro();
  } catch (err) {
    console.error('Intro error', err);
  }
  storyBusy = false;
  ui.refreshHUD();
  saveState();
}

async function continueGame() {
  sound.init();
  sound.resume();
  await ui.fadeOut(420);
  ui.hideTitleInstant();
  const loaded = loadState();
  if (!loaded) {
    ui.hideTitleInstant();
    await ui.fadeIn(300);
    newGame();
    return;
  }
  syncFromSave();
  mode = 'game';
  currentScene = scenes[state.scene] ? state.scene : 'shop';
  state.scene = currentScene;
  endingKey = null;
  storyBusy = false;
  moveTarget = null;
  pendingHotspot = null;
  syncPlayer();
  baseCache = null;
  baseScene = null;
  ui.showHUD();
  ui.setPlace(sceneInfo(currentScene).name, sceneInfo(currentScene).sub);
  ui.resetObjectiveTracking();
  sound.setMuted(state.settings.muted);
  sound.setScene(currentScene);
  await ui.fadeIn(850);
  ui.locationCard(sceneInfo(currentScene).name, sceneInfo(currentScene).sub);
  if (state.flags.finished) {
    setTimeout(() => ui.toast('The shop is open', 'Some things are still waiting to be found.', 'watch'), 1000);
  }
  onSceneEnter(currentScene, null).catch((err) => console.error(err));
}

async function saveAndTitle() {
  saveState();
  await ui.fadeOut(400);
  mode = 'title';
  currentScene = state.scene;
  endingKey = null;
  ui.hideHUD();
  ui.showTitle({ instant: true });
  ui.updateTitle();
  sound.setScene('title');
  await ui.fadeIn(650);
}

async function goTitleFromEnding() {
  await ui.fadeOut(300);
  endingKey = null;
  mode = 'title';
  ui.hideHUD();
  ui.showTitle({ instant: true });
  ui.updateTitle();
  sound.setScene('title');
  await ui.fadeIn(650);
}

async function returnToShop() {
  await ui.fadeOut(280);
  mode = 'game';
  currentScene = 'shop';
  state.scene = 'shop';
  state.flags.postgame = true;
  state.flags.finished = true;
  const sp = scenes.shop.spawn;
  setPlayer(sp.x, sp.y, sp.dir);
  state.player = { x: sp.x, y: sp.y, dir: sp.dir };
  endingKey = null;
  baseCache = null;
  baseScene = null;
  ui.showHUD();
  ui.setPlace(sceneInfo('shop').name, sceneInfo('shop').sub);
  ui.resetObjectiveTracking();
  ui.refreshHUD({ announce: true });
  sound.setScene('shop');
  await ui.fadeIn(850);
  ui.locationCard('The Little Things', 'Your shop · Ember Hollow');
  saveState();
}

function playEnding(key) {
  if (!key) return;
  state.flags.finished = true;
  state.flags.postgame = true;
  state.flags.ending = key;
  state.scene = 'shop';
  state.player = { x: scenes.shop.spawn.x, y: scenes.shop.spawn.y, dir: scenes.shop.spawn.dir };
  saveState();
  recordEnding(key);
  ui.updateTitle();
  endingKey = key;
  endingCache = null;
  endingCacheKey = null;
  mode = 'ending';
  ui.hideHUD();
  ui.showEnding(key);
  sound.setScene('ending');
  sound.chime(0.06, 0.86);
}

// ---------------------------------------------------------------
// Scene changes
// ---------------------------------------------------------------
async function changeScene(id) {
  if (!scenes[id] || transitioning) return;
  if (id === currentScene) return;
  transitioning = true;
  moveTarget = null;
  pendingHotspot = null;
  await ui.fadeOut(430);
  const from = currentScene;
  currentScene = id;
  state.scene = id;
  state.visited[id] = true;
  const entry = getEntry(id, from);
  setPlayer(entry.x, entry.y, entry.dir || 'down');
  state.player = { x: player.x, y: player.y, dir: player.dir };
  baseCache = null;
  baseScene = null;
  fgLayers = [];
  ui.setPlace(sceneInfo(id).name, sceneInfo(id).sub);
  sound.setScene(id);
  sound.door();
  saveState();
  await ui.fadeIn(700);
  ui.locationCard(sceneInfo(id).name, sceneInfo(id).sub);
  transitioning = false;
  ui.refreshHUD();
  onSceneEnter(id, from).catch((err) => console.error(err));
}

function setPlayer(x, y, dir) {
  player.x = x;
  player.y = y;
  player.dir = dir || 'down';
  player.walk = 0;
  player.moving = false;
  player.step = 0;
  state.player = { x, y, dir: player.dir };
}

function syncPlayer() {
  const p = state.player || { x: 640, y: 610, dir: 'up' };
  player.x = p.x;
  player.y = p.y;
  player.dir = p.dir || 'down';
  player.walk = 0;
  player.step = 0;
  // A save made in the old build may point into scenery; nudge it free.
  if (!isWalkable(currentScene, player.x, player.y, 12)) {
    const p2 = nearestWalkable(currentScene, player.x, player.y, 12);
    if (p2) { player.x = p2.x; player.y = p2.y; }
  }
}

// ---------------------------------------------------------------
// Input and movement
// ---------------------------------------------------------------
window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (ui.isDialogueOpen()) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();

  if (mode === 'title') {
    return;
  }
  if (mode === 'ending') {
    return;
  }
  if (e.repeat) {
    if (k === 'e' || k === 'E' || k === 'Escape') return;
  }
  if (k === 'Escape') {
    if (ui.closeTop()) return;
    if (!ui.overlayOpen() && !ui.isDialogueOpen()) ui.openPause();
    return;
  }
  if (k === 'j' || k === 'J') {
    if (ui.isJournalOpen()) ui.closeJournal();
    else if (!ui.overlayOpen() && !ui.isDialogueOpen()) ui.openJournal('case');
    return;
  }
  if (k === 'e' || k === 'E') {
    if (!ui.isBlocking() && !transitioning) interactNearest();
    return;
  }
  const lower = k.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(lower)) {
    keys.add(lower);
  }
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
});

window.addEventListener('blur', () => keys.clear());

canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'game' || ui.isBlocking() || transitioning || storyBusy) return;
  if (e.button !== undefined && e.button !== 0) return;
  const p = canvasPoint(e);
  const h = hotspotAtPoint(p.x, p.y);
  if (h) {
    if (nearHotspot(h)) {
      interactHotspot(h);
    } else {
      const approach = approachPoint(currentScene, player, h);
      if (approach) {
        moveTarget = approach;
        pendingHotspot = h;
      } else if (Math.hypot(h.x - player.x, h.y - player.y) < h.r + 80) {
        interactHotspot(h);
      }
    }
    return;
  }
  const target = nearestWalkable(currentScene, p.x, p.y, 12);
  if (target) {
    moveTarget = target;
    pendingHotspot = null;
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (mode !== 'game' || ui.isBlocking()) {
    stageInner?.classList.remove('clickable');
    return;
  }
  const p = canvasPoint(e);
  stageInner?.classList.toggle('clickable', !!hotspotAtPoint(p.x, p.y));
});

function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H
  };
}

function hotspotAtPoint(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const h of hotspotsAt(currentScene, state)) {
    const d = Math.hypot(h.x - x, h.y - y);
    const reach = Math.max(36, h.r * 0.9);
    if (d < reach && d < bestD) { best = h; bestD = d; }
  }
  return best;
}

function nearestHotspot() {
  let best = null;
  let bestD = Infinity;
  for (const h of hotspotsAt(currentScene, state)) {
    const d = Math.hypot(h.x - player.x, h.y - player.y);
    if (d < h.r + 30 && d < bestD) { best = h; bestD = d; }
  }
  return best;
}

function nearHotspot(h) {
  return Math.hypot(h.x - player.x, h.y - player.y) < h.r + 32;
}

function interactNearest() {
  const h = nearestHotspot();
  if (h) interactHotspot(h);
}

async function interactHotspot(h) {
  if (!h || interacting || ui.isBlocking() || mode !== 'game') return;
  interacting = true;
  moveTarget = null;
  pendingHotspot = null;
  ui.setPrompt(null);
  currentPrompt = null;
  sound.click();
  try {
    await handleAction(h.action, h);
  } catch (err) {
    console.error('Interaction error', err);
    await ui.say([{ who: null, text: 'The evening stutters. Some small thing has gone missing. Try again.' }]);
  }
  interacting = false;
  saveState();
  ui.refreshHUD();
}

function updatePlayer(dt) {
  if (mode !== 'game' || ui.isBlocking() || transitioning || storyBusy) {
    player.moving = false;
    return;
  }
  let dx = 0;
  let dy = 0;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (touchVector.active) { dx += touchVector.x; dy += touchVector.y; }

  if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
    moveTarget = null;
    pendingHotspot = null;
  } else if (moveTarget) {
    const tx = moveTarget.x - player.x;
    const ty = moveTarget.y - player.y;
    const dist = Math.hypot(tx, ty);
    if (dist < 6) {
      moveTarget = null;
      if (pendingHotspot) {
        const h = pendingHotspot;
        pendingHotspot = null;
        if (nearHotspot(h)) interactHotspot(h);
      }
      player.moving = false;
      return;
    }
    dx = tx / dist;
    dy = ty / dist;
  }

  const len = Math.hypot(dx, dy);
  if (len < 0.02) { player.moving = false; return; }
  dx /= len;
  dy /= len;
  const speed = 156;
  const step = speed * dt;
  const ox = player.x;
  const oy = player.y;
  const nx = player.x + dx * step;
  const ny = player.y + dy * step;
  if (isWalkable(currentScene, nx, player.y, 12)) player.x = nx;
  if (isWalkable(currentScene, player.x, ny, 12)) player.y = ny;

  const moved = Math.hypot(player.x - ox, player.y - oy);
  if (moved > 0.01) {
    player.moving = true;
    player.walk += dt * 7.2;
    player.step += moved;
    if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? 'right' : 'left';
    else player.dir = dy > 0 ? 'down' : 'up';
    if (player.step > 34) {
      player.step = 0;
      sound.step(!sceneWeather(currentScene).indoor);
    }
  } else {
    player.moving = false;
  }
  state.player.x = player.x;
  state.player.y = player.y;
  state.player.dir = player.dir;
}

function updatePrompt() {
  if (mode !== 'game' || ui.isBlocking() || transitioning || storyBusy || interacting) {
    if (currentPrompt !== null) { ui.setPrompt(null); currentPrompt = null; }
    return;
  }
  const h = nearestHotspot();
  if (!h) {
    if (currentPrompt !== null) { ui.setPrompt(null); currentPrompt = null; }
    return;
  }
  if (h.label !== currentPrompt) {
    ui.setPrompt(h.label);
    currentPrompt = h.label;
  }
}

// ---------------------------------------------------------------
// Touch
// ---------------------------------------------------------------
function setupTouch() {
  const coarse = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const touch = document.getElementById('touch-controls');
  if (coarse) touch?.classList.remove('hidden');
  else touch?.classList.add('hidden');

  const joy = document.getElementById('joystick');
  const knob = document.getElementById('joystick-knob');
  if (joy && knob) {
    joy.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      joyPointer = e.pointerId;
      try { joy.setPointerCapture(e.pointerId); } catch { /* noop */ }
      updateJoystick(e);
      knob.style.transition = 'none';
    });
    joy.addEventListener('pointermove', (e) => {
      if (e.pointerId !== joyPointer) return;
      e.preventDefault();
      updateJoystick(e);
    });
    const end = (e) => {
      if (e.pointerId !== joyPointer) return;
      joyPointer = null;
      touchVector.x = 0; touchVector.y = 0; touchVector.active = false;
      knob.style.transition = 'transform .18s ease';
      knob.style.transform = 'translate(0px, 0px)';
    };
    joy.addEventListener('pointerup', end);
    joy.addEventListener('pointercancel', end);
  }

  function updateJoystick(e) {
    const rect = joy.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width / 2 - 16;
    const d = Math.hypot(dx, dy);
    if (d > max) { dx = (dx / d) * max; dy = (dy / d) * max; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    touchVector.x = dx / max;
    touchVector.y = dy / max;
    touchVector.active = Math.hypot(touchVector.x, touchVector.y) > 0.14;
  }

  document.getElementById('touch-use')?.addEventListener('click', () => {
    sound.click();
    if (ui.isDialogueOpen()) { ui.advanceDialogue(); return; }
    if (!ui.isBlocking() && !transitioning) interactNearest();
  });
  document.getElementById('touch-journal')?.addEventListener('click', () => {
    sound.click();
    if (ui.isJournalOpen()) ui.closeJournal();
    else if (!ui.overlayOpen() && !ui.isDialogueOpen()) ui.openJournal('case');
  });
  document.getElementById('touch-menu')?.addEventListener('click', () => {
    sound.click();
    if (ui.closeTop()) return;
    if (!ui.isDialogueOpen()) ui.openPause();
  });

  let rotateDismissed = false;
  const checkRotate = () => {
    if (rotateDismissed) return;
    const portrait = window.innerHeight > window.innerWidth;
    document.getElementById('rotate-hint')?.classList.toggle('hidden', !(coarse && portrait && window.innerWidth < 760));
  };
  window.addEventListener('resize', checkRotate);
  document.getElementById('rotate-dismiss')?.addEventListener('click', () => { rotateDismissed = true; });
  checkRotate();
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (mode === 'title') {
    if (!titleCache) buildTitleCache();
    ctx.drawImage(titleCache, 0, 0, W, H);
    drawTitleDynamic(ctx, time);
    return;
  }
  if (mode === 'ending') {
    if (!endingCache || endingCacheKey !== endingKey) buildEndingCache(endingKey);
    ctx.drawImage(endingCache, 0, 0, W, H);
    drawEndingDynamic(ctx, endingKey, time);
    return;
  }
  renderGame();
}

function renderGame() {
  if (baseScene !== currentScene || !baseCache) buildSceneCache(currentScene);
  ctx.drawImage(baseCache, 0, 0, W, H);

  const scene = scenes[currentScene];
  if (scene.ambientDraw) scene.ambientDraw(ctx, state, time);

  const drawables = [];
  for (const npc of npcsAt(currentScene, state)) {
    drawables.push({
      y: npc.y,
      draw: () => drawPerson(ctx, npc.who, npc.x, npc.y, {
        dir: npc.dir || 'down', still: true, t: time, scale: 1.8
      })
    });
  }
  drawables.push({
    y: player.y,
    draw: () => drawPerson(ctx, 'player', player.x, player.y, {
      dir: player.dir,
      walk: player.moving ? player.walk : 0,
      still: !player.moving,
      t: time,
      scale: 1.8
    })
  });
  for (const layer of fgLayers) {
    drawables.push({ y: layer.y, draw: () => ctx.drawImage(layer.canvas, 0, 0, W, H) });
  }
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  if (scene.dynamic) scene.dynamic(ctx, state, time);
  drawWeather();
}

function drawWeather() {
  const w = sceneWeather(currentScene);
  if (w.rain) {
    rain(ctx, time, {
      count: state.settings.gentleMotion ? Math.round(w.rain * 0.5) : w.rain,
      alpha: 0.3,
      wind: w.wind ?? -0.25,
      speed: state.settings.gentleMotion ? 0.75 : 1,
      ground: 380
    });
  }
  if (w.fog) mist(ctx, time, { y: 590, alpha: 0.028, count: 3 });
  if (w.lightning && !state.settings.gentleMotion) {
    if (time - lastLightning > 9 && Math.random() < 0.012) {
      lastLightning = time;
      lightning = 1;
      setTimeout(() => sound.thunder(), 420);
    }
    if (lightning > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(186,208,224,${0.13 * lightning})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      lightning = Math.max(0, lightning - 0.045);
    }
  }
}

// ---------------------------------------------------------------
// Loop
// ---------------------------------------------------------------
function frame(now) {
  requestAnimationFrame(frame);
  if (!lastFrame) lastFrame = now;
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (document.hidden) return;
  time += dt;
  if (mode === 'game') {
    updatePlayer(dt);
    updatePrompt();
    state.playtime += dt;
    playSaveTimer += dt;
    if (playSaveTimer > 30) { playSaveTimer = 0; saveState(); }
  }
  try { render(); } catch (err) { console.error('Render error', err); }
}

// ---------------------------------------------------------------
// Development hooks (?debug=1)
// ---------------------------------------------------------------
if (new URLSearchParams(location.search).has('debug')) {
  window.__LT = {
    get state() { return state; },
    get mode() { return mode; },
    get scene() { return currentScene; },
    get player() { return player; },
    get storyBusy() { return storyBusy; },
    get transitioning() { return transitioning; },
    ui,
    scenes,
    sceneInfo,
    hotspotsAt,
    npcsAt,
    sound,
    newGame,
    continueGame,
    changeScene,
    playEnding,
    saveState,
    resetState,
    setPlayer,
    action: (action) => handleAction(action),
    async gotoScene(id) {
      if (!scenes[id]) return false;
      if (mode !== 'game') {
        ui.hideTitleInstant();
        mode = 'game';
        ui.showHUD();
      }
      if (id === currentScene) return true;
      await ui.fadeOut(60);
      const from = currentScene;
      currentScene = id;
      state.scene = id;
      state.visited[id] = true;
      const entry = getEntry(id, from);
      setPlayer(entry.x, entry.y, entry.dir || 'down');
      baseCache = null;
      baseScene = null;
      fgLayers = [];
      ui.setPlace(sceneInfo(id).name, sceneInfo(id).sub);
      sound.setScene(id);
      saveState();
      await ui.fadeIn(60);
      ui.locationCard(sceneInfo(id).name, sceneInfo(id).sub);
      ui.refreshHUD();
      onSceneEnter(id, from).catch((err) => console.error(err));
      return true;
    }
  };
}

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
ui.initUI({
  onNew: () => { newGame().catch((err) => console.error(err)); },
  onContinue: () => { continueGame().catch((err) => console.error(err)); },
  onResume: () => {},
  onSaveTitle: () => { saveAndTitle().catch((err) => console.error(err)); },
  onSound: (muted) => sound.setMuted(muted),
  onMotion: () => {},
  onEndingContinue: () => { returnToShop().catch((err) => console.error(err)); },
  onEndingTitle: () => { goTitleFromEnding().catch((err) => console.error(err)); }
});
ui.setSoundApi(sound);
initStory({ go: changeScene, playEnding });
setupTouch();
resizeCanvas();
syncPlayer();
ui.showTitle();
ui.hideHUD();
sound.setScene('title');
requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  resizeCanvas();
});
window.addEventListener('beforeunload', () => {
  if (mode === 'game') saveState();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mode === 'game') saveState();
});

window.addEventListener('pointerdown', () => {
  sound.init();
  sound.resume();
  if (!sound.started) return;
}, { once: true });
