/* ============================================================
   THE LITTLE THINGS — engine, input, and all the quiet wiring
   ============================================================ */
(function () {
  'use strict';

  const LT = window.LT;
  const U = LT.util;
  const A = LT.art;
  const D = LT.data;
  const SAVE = LT.save;
  const AUDIO = LT.audio;
  const TAU = U.TAU;

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const stage = $('stage');
  const ctx = stage.getContext('2d');
  const view = { w: 1, h: 1, dpr: 1 };
  const PANELS = ['dialogue', 'inspect', 'journal', 'inventory', 'board', 'decision', 'pause', 'settings', 'howto', 'confirm', 'decor'];

  let settings = SAVE.readSettings();
  let S = null;
  let mode = 'title';
  let overlayStack = [];
  let dialogueState = null;
  let inspectState = null;
  let confirmCb = null;
  let titleSave = null;
  let titleCanvas = null;
  let sceneCache = {};
  let cam = { x: 0, y: 0, scale: 1, init: false };
  let transitioning = false;
  let lastFrame = 0;
  let tGlobal = 0;
  let dtGlobal = 1 / 60;
  let keys = {};
  let joystickVec = null;
  let walkTarget = null;
  let pendingHotspot = null;
  let playerWalking = false;
  let playerPhase = 0;
  let stepClock = 0;
  let autosaveClock = 0;
  let hovered = null;
  let pointerDown = null;
  let boardDrag = null;
  let suppressBoardClick = false;
  let selectedCards = [];
  let selectedItem = null;
  let journalTab = 'case';
  let clueBatch = [];
  let clueTimer = null;
  let saveTimer = null;
  let pipTimer = null;
  let chapterTimer = null;
  let mobileHintTimer = null;
  let lastSaveAt = 0;
  let saveFailed = false;
  const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------ */
  const show = (el) => el && el.classList.remove('hidden');
  const hide = (el) => el && el.classList.add('hidden');
  const isOpen = (id) => overlayStack.indexOf(id) !== -1;
  const endingOpen = () => !$('ending').classList.contains('hidden');
  const clamp = U.clamp;
  const dist = U.dist;

  function toast(kicker, text, icon) {
    const wrap = $('toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML =
      `<span class="toast-icon">${esc(icon || '·')}</span><div><p class="toast-kicker">${esc(kicker || '')}</p><p class="toast-text">${esc(text || '')}</p></div>`;
    wrap.appendChild(el);
    while (wrap.children.length > 4) wrap.removeChild(wrap.firstElementChild);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 520);
    }, 4300);
  }

  function showPip(failed) {
    const pip = $('savePip');
    if (!pip) return;
    pip.textContent = failed ? 'Save failed' : 'Saved';
    pip.classList.toggle('failed', !!failed);
    pip.classList.add('show');
    clearTimeout(pipTimer);
    pipTimer = setTimeout(() => pip.classList.remove('show'), failed ? 5000 : 1600);
  }

  function ago(ms) {
    if (!ms) return 'not yet';
    const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (sec < 25) return 'just now';
    if (sec < 90) return 'a minute ago';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + (min === 1 ? ' minute ago' : ' minutes ago');
    const hr = Math.floor(min / 60);
    return hr + (hr === 1 ? ' hour ago' : ' hours ago');
  }

  function chapter(eyebrow, title, sub, dur) {
    let el = document.querySelector('.chapter-card');
    if (!el) {
      el = document.createElement('div');
      el.className = 'chapter-card';
      el.innerHTML = '<div><p class="cc-eyebrow"></p><h2></h2><p class="cc-sub"></p></div>';
      $('ui').appendChild(el);
    }
    el.querySelector('.cc-eyebrow').textContent = eyebrow || '';
    el.querySelector('h2').textContent = title || '';
    el.querySelector('.cc-sub').textContent = sub || '';
    el.classList.add('show');
    clearTimeout(chapterTimer);
    chapterTimer = setTimeout(() => el.classList.remove('show'), dur || 2600);
  }

  function hideChapter() {
    clearTimeout(chapterTimer);
    const el = document.querySelector('.chapter-card');
    if (el) el.classList.remove('show');
  }

  function showMobileHint() {
    if (!coarsePointer) return;
    const el = $('mobileHint');
    if (!el) return;
    show(el);
    clearTimeout(mobileHintTimer);
    mobileHintTimer = setTimeout(() => hide(el), 6200);
  }

  function ensureAudio() {
    AUDIO.settings = settings;
    if (!AUDIO.ready) AUDIO.init();
    if (AUDIO.ctx && AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume();
  }

  /* ------------------------------------------------------------
     State & saving
     ------------------------------------------------------------ */
  function newState() {
    return {
      version: 2,
      scene: 'shop',
      player: { x: 760, y: 810, dir: 'up' },
      playtime: 0,
      items: {},
      clues: {},
      flags: {},
      notes: {},
      cards: {},
      cardPos: {},
      deductions: {},
      usedTopics: {},
      discoveries: {},
      newItems: {},
      memory: {},
      decor: { lamp: 'amber', rug: 'rose', sill: 'fern', wall: 'empty' },
      ending: null,
      visited: { shop: true },
      savedAt: null,
    };
  }

  function hydrate(raw) {
    const base = newState();
    if (!raw || raw.version !== 2) return base;
    const s = Object.assign({}, base, raw);
    s.player = Object.assign({}, base.player, raw.player || {});
    s.decor = Object.assign({}, base.decor, raw.decor || {});
    ['items', 'clues', 'flags', 'notes', 'cards', 'cardPos', 'deductions', 'usedTopics', 'discoveries', 'newItems', 'memory', 'visited'].forEach(
      (k) => {
        s[k] = Object.assign({}, base[k], raw[k] || {});
      }
    );
    s.ending = raw.ending || null;
    s.scene = D.scenes[raw.scene] ? raw.scene : 'shop';
    s.playtime = raw.playtime || 0;
    s.version = 2;
    return s;
  }

  function saveNow(pip) {
    if (!S) return false;
    const previousSavedAt = S.savedAt;
    const saved = SAVE.write(S);
    if (saved) {
      lastSaveAt = S.savedAt || Date.now();
      saveFailed = false;
      clearTimeout(pipTimer);
      const pipEl = $('savePip');
      if (pipEl) {
        pipEl.textContent = 'Saved';
        pipEl.classList.remove('show', 'failed');
      }
    } else {
      S.savedAt = previousSavedAt;
      saveFailed = true;
    }
    if (pip !== false || !saved) showPip(!saved);
    updatePauseSave();
    return saved;
  }

  function queueSave() {
    if (!S) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveNow(true), 700);
  }

  function updatePauseSave() {
    const el = $('pauseSave');
    if (!el) return;
    if (saveFailed) {
      el.textContent = 'Save failed — changes may not be kept';
      el.classList.add('save-failed');
      return;
    }
    const at = lastSaveAt || (S && S.savedAt);
    el.textContent = at ? 'Autosaved ' + ago(at) : 'Not saved yet';
    el.classList.remove('save-failed');
  }

  function currentScene() {
    return S ? D.scenes[S.scene] : null;
  }

  function readyToDecide() {
    return !!(S && !S.ending && S.flags.letterFound && S.flags.juneStory && D.coreDeductions(S) >= 4);
  }

  function updateHUD() {
    if (!S) return;
    const sc = currentScene();
    if (sc) {
      $('locName').textContent = sc.name;
      $('locSub').textContent = sc.sub;
    }
    let status = 'The rain is making its mind up';
    if (S.ending) status = 'An evening kept';
    else if (readyToDecide()) status = 'The counter is waiting';
    else if (S.flags.caseOpen) status = D.coreDeductions(S) + ' of 4 threads';
    $('hudStatus').textContent = status;
    updateThought();
    updatePauseSave();
  }

  function updateThought() {
    if (!S) return;
    const el = $('thoughtText');
    if (!el) return;
    const text = D.thought(S);
    if (el.textContent !== text) el.textContent = text;
  }

  /* ------------------------------------------------------------
     Effects used by the authored story
     ------------------------------------------------------------ */
  function flushClues() {
    clueTimer = null;
    if (!clueBatch.length) return;
    const ids = clueBatch.slice();
    clueBatch = [];
    if (ids.length === 1) {
      const c = D.clues[ids[0]];
      toast('A detail', c ? c.title : 'Something noticed', '✦');
    } else {
      toast('New details', ids.length + ' details added to the journal and the board.', '✦');
    }
    AUDIO.play('discover');
    updateHUD();
    checkReady();
  }

  function checkReady() {
    if (!S || !readyToDecide() || S.flags.readyNotified) return;
    S.flags.readyNotified = true;
    queueSave();
    updateHUD();
    setTimeout(() => {
      if (S && !S.ending) toast('The whole story', 'The counter is waiting. Decide what should happen to the watch.', '✓');
    }, 500);
    AUDIO.play('chime');
  }

  const effect = {
    item(id) {
      if (!S || !D.objects[id]) return;
      if (!S.items[id]) {
        S.items[id] = true;
        S.newItems[id] = true;
        toast('Into the satchel', D.objects[id].name, '+');
        AUDIO.play('click');
        queueSave();
        if (isOpen('inventory')) renderInventory();
      }
    },
    clue(id, silent) {
      if (!S || !D.clues[id] || S.clues[id]) return;
      S.clues[id] = true;
      if (!silent) {
        clueBatch.push(id);
        clearTimeout(clueTimer);
        clueTimer = setTimeout(flushClues, 90);
      }
      queueSave();
      updateHUD();
      if (isOpen('journal')) renderJournal();
      if (isOpen('board')) renderBoard();
      if (silent) checkReady();
    },
    flag(key, value) {
      if (!S) return;
      S.flags[key] = value === undefined ? true : value;
      queueSave();
      updateHUD();
      if (isOpen('journal')) renderJournal();
    },
    note(id) {
      if (!S || !id) return;
      S.notes[id] = true;
      queueSave();
      if (isOpen('journal')) renderJournal();
    },
    card(id) {
      if (!S || !D.cards[id]) return;
      if (!S.cards[id]) {
        S.cards[id] = true;
        toast('Pinned to the board', D.cards[id].title, '⌖');
        AUDIO.play('string');
        queueSave();
        if (isOpen('board')) renderBoard();
      }
      checkReady();
    },
  };

  function noteText(id) {
    if (D.notes[id]) return D.notes[id];
    const chars = Object.values(D.characters);
    for (let i = 0; i < chars.length; i++) {
      if (chars[i].notes && chars[i].notes[id]) return chars[i].notes[id];
    }
    return null;
  }

  /* ------------------------------------------------------------
     Overlay stack
     ------------------------------------------------------------ */
  function isBlocking() {
    return mode !== 'game' || transitioning || endingOpen() || overlayStack.length > 0;
  }

  function showOverlay(id, opts) {
    opts = opts || {};
    const el = $(id);
    if (!el) return;
    if (opts.exclusive) {
      overlayStack.slice().forEach((other) => {
        if (other !== id) closeOverlay(other);
      });
      keys = {};
      joystickVec = null;
      walkTarget = null;
      pendingHotspot = null;
    }
    if (overlayStack.indexOf(id) === -1) overlayStack.push(id);
    el.classList.remove('hidden');
    const above = !!opts.above || (mode === 'title' && id !== 'dialogue' && id !== 'inspect');
    el.classList.toggle('above-title', above);
    el.style.zIndex = String((above ? 60 : 30) + overlayStack.indexOf(id));
    updatePrompt();
  }

  function closeDialogue() {
    if (dialogueState && dialogueState.timer) clearTimeout(dialogueState.timer);
    dialogueState = null;
    hide($('dialogue'));
    overlayStack = overlayStack.filter((x) => x !== 'dialogue');
    AUDIO.setDialogue(false);
    updatePrompt();
  }

  function closeOverlay(id) {
    if (id === 'dialogue') {
      closeDialogue();
      return;
    }
    hide($(id));
    overlayStack = overlayStack.filter((x) => x !== id);
    if (id === 'inspect') inspectState = null;
    if (id === 'confirm') confirmCb = null;
    updatePrompt();
  }

  function closeAllOverlays(silent) {
    overlayStack.slice().forEach((id) => closeOverlay(id));
    PANELS.forEach((id) => hide($(id)));
    overlayStack = [];
    if (dialogueState) {
      if (dialogueState.timer) clearTimeout(dialogueState.timer);
      dialogueState = null;
      AUDIO.setDialogue(false);
    }
    inspectState = null;
    if (!silent) updatePrompt();
  }

  function showConfirm(kicker, title, text, onYes) {
    $('confirmKicker').textContent = kicker || 'A small caution';
    $('confirmTitle').textContent = title || 'Are you sure?';
    $('confirmText').textContent = text || '';
    confirmCb = onYes || null;
    showOverlay('confirm', { stacked: true, above: mode === 'title' });
    AUDIO.play('click');
  }

  /* ------------------------------------------------------------
     Scenes & camera
     ------------------------------------------------------------ */
  function sceneSignature(id) {
    if (id !== 'shop') return '';
    return [S.decor.lamp, S.decor.rug, S.decor.sill, S.decor.wall, S.ending || '', S.flags.bluebirdPlaced ? 'b' : ''].join(',');
  }

  function getSceneCanvas(id) {
    const key = id + '|' + sceneSignature(id);
    if (sceneCache[key]) return sceneCache[key];
    let canvas;
    if (id === 'street') canvas = A.paintStreet(S);
    else if (id === 'clock') canvas = A.paintClock(S);
    else if (id === 'station') canvas = A.paintStation(S);
    else canvas = A.paintShop(S);
    sceneCache[key] = canvas;
    return canvas;
  }

  function invalidateShop() {
    Object.keys(sceneCache).forEach((k) => {
      if (k.indexOf('shop|') === 0) delete sceneCache[k];
    });
  }

  function updateCamera(dt, snap) {
    const sc = currentScene();
    if (!sc || !S) return;
    const scale = Math.max(view.w / sc.w, view.h / sc.h);
    const visW = view.w / scale;
    const visH = view.h / scale;
    const maxX = Math.max(0, sc.w - visW);
    const maxY = Math.max(0, sc.h - visH);
    const tx = clamp(S.player.x - visW / 2, 0, maxX);
    const ty = clamp(S.player.y - visH / 2, 0, maxY);
    if (snap || !cam.init) {
      cam.x = tx;
      cam.y = ty;
      cam.scale = scale;
      cam.init = true;
    } else {
      cam.x = U.damp(cam.x, tx, 6.5, dt);
      cam.y = U.damp(cam.y, ty, 6.5, dt);
      cam.scale = U.damp(cam.scale, scale, 6.5, dt);
    }
  }

  function entryFor(id, from) {
    const sc = D.scenes[id];
    const entries = {
      shop: {
        street: { x: 1260, y: 705, dir: 'left' },
      },
      street: {
        shop: { x: 405, y: 650, dir: 'right' },
        clock: { x: 1435, y: 635, dir: 'right' },
        station: { x: 1690, y: 620, dir: 'left' },
      },
      clock: {
        street: { x: 285, y: 620, dir: 'right' },
      },
      station: {
        street: { x: 205, y: 660, dir: 'right' },
      },
    };
    const m = entries[id] && entries[id][from];
    return m || sc.spawn;
  }

  function transitionTo(id) {
    if (!S || transitioning || !D.scenes[id] || id === S.scene) return;
    transitioning = true;
    closeAllOverlays(true);
    hideChapter();
    $('sceneFade').classList.add('on');
    AUDIO.play('door');
    setTimeout(() => {
      const from = S.scene;
      S.scene = id;
      const first = !S.visited[id];
      S.visited[id] = true;
      const pos = entryFor(id, from);
      S.player = { x: pos.x, y: pos.y, dir: pos.dir || 'down' };
      walkTarget = null;
      pendingHotspot = null;
      playerWalking = false;
      cam.init = false;
      updateCamera(0, true);
      updateHUD();
      AUDIO.setScene(id, true);
      saveNow(false);
      setTimeout(() => {
        $('sceneFade').classList.remove('on');
        transitioning = false;
        if (first) chapter('Harrowmere', D.scenes[id].name, D.scenes[id].sub, 2500);
      }, 220);
    }, 320);
  }

  /* ------------------------------------------------------------
     Hotspots, walking & interaction
     ------------------------------------------------------------ */
  function activeHotspots() {
    const sc = currentScene();
    if (!sc) return [];
    return sc.hotspots.filter((h) => !h.cond || h.cond(S));
  }

  function blockedAt(x, y, pad) {
    const sc = currentScene();
    if (!sc) return false;
    pad = pad == null ? 10 : pad;
    for (let i = 0; i < sc.blockers.length; i++) {
      if (U.pointInRect(sc.blockers[i], x, y, pad)) return true;
    }
    return false;
  }

  function hotspotApproach(h) {
    const sc = currentScene();
    if (!sc || !S) return { x: h.x, y: h.y };
    const walk = sc.walk;
    const r = h.r || 70;
    const radii = [r + 24, r + 58, r + 100, r + 150, r + 210];
    let best = null;
    let bestD = Infinity;
    for (let ri = 0; ri < radii.length; ri++) {
      const rad = radii[ri];
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * TAU;
        const x = clamp(h.x + Math.cos(a) * rad, walk.x + 18, walk.x + walk.w - 18);
        const y = clamp(h.y + Math.sin(a) * rad, walk.y + 18, walk.y + walk.h - 18);
        if (blockedAt(x, y, 12)) continue;
        const d = dist(S.player.x, S.player.y, x, y);
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
    if (best) return best;
    return {
      x: clamp(h.x, walk.x + 18, walk.x + walk.w - 18),
      y: clamp(h.y, walk.y + 18, walk.y + walk.h - 18),
    };
  }

  function nearestHotspot() {
    const list = activeHotspots();
    let best = null;
    let bestD = Infinity;
    let bestAp = null;
    for (let i = 0; i < list.length; i++) {
      const h = list[i];
      const ap = hotspotApproach(h);
      const d = Math.min(dist(S.player.x, S.player.y, ap.x, ap.y), dist(S.player.x, S.player.y, h.x, h.y));
      if (d < bestD) {
        bestD = d;
        best = h;
        bestAp = ap;
      }
    }
    return bestD < 72 ? { h: best, ap: bestAp } : null;
  }

  function updatePrompt() {
    const prompt = $('prompt');
    if (!prompt) return;
    if (mode !== 'game' || isBlocking() || !S) {
      hide(prompt);
      return;
    }
    if (walkTarget || pendingHotspot) {
      hide(prompt);
      return;
    }
    const near = nearestHotspot();
    if (!near) {
      hide(prompt);
      return;
    }
    $('promptText').textContent = near.h.label;
    show(prompt);
  }

  function interactWith(h) {
    if (!h || !S) return;
    const ap = hotspotApproach(h);
    const closeEnough = dist(S.player.x, S.player.y, ap.x, ap.y) < 72 || dist(S.player.x, S.player.y, h.x, h.y) < 76;
    if (closeEnough) {
      doAction(h);
    } else {
      walkTarget = { x: ap.x, y: ap.y };
      pendingHotspot = h;
      hide($('prompt'));
    }
  }

  function tapAt(sx, sy) {
    if (!S) return;
    const wx = sx / cam.scale + cam.x;
    const wy = sy / cam.scale + cam.y;
    const list = activeHotspots();
    for (let i = 0; i < list.length; i++) {
      const h = list[i];
      const rr = Math.max(32, (h.r || 70) * 0.95);
      if (dist(wx, wy, h.x, h.y) < rr) {
        interactWith(h);
        return;
      }
    }
    const walk = currentScene().walk;
    if (!U.pointInRect(walk, wx, wy, 0)) return;
    let tx = clamp(wx, walk.x + 14, walk.x + walk.w - 14);
    let ty = clamp(wy, walk.y + 14, walk.y + walk.h - 14);
    if (blockedAt(tx, ty, 11)) {
      let found = false;
      for (let rad = 24; rad <= 140 && !found; rad += 22) {
        for (let i = 0; i < 16 && !found; i++) {
          const a = (i / 16) * TAU;
          const nx = clamp(tx + Math.cos(a) * rad, walk.x + 14, walk.x + walk.w - 14);
          const ny = clamp(ty + Math.sin(a) * rad, walk.y + 14, walk.y + walk.h - 14);
          if (!blockedAt(nx, ny, 11)) {
            tx = nx;
            ty = ny;
            found = true;
          }
        }
      }
    }
    walkTarget = { x: tx, y: ty };
    pendingHotspot = null;
  }

  function movePlayer(dx, dy) {
    if (!S) return;
    const sc = currentScene();
    const walk = sc.walk;
    const p = S.player;
    const nx = clamp(p.x + dx, walk.x + 12, walk.x + walk.w - 12);
    if (!blockedAt(nx, p.y, 10)) p.x = nx;
    const ny = clamp(p.y + dy, walk.y + 12, walk.y + walk.h - 12);
    if (!blockedAt(p.x, ny, 10)) p.y = ny;
  }

  function faceVector(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'up' : 'down';
  }

  function update(dt) {
    if (!S) return;
    S.playtime += dt;
    const sc = currentScene();
    let vx = 0;
    let vy = 0;

    if (keys['w'] || keys['arrowup']) vy -= 1;
    if (keys['s'] || keys['arrowdown']) vy += 1;
    if (keys['a'] || keys['arrowleft']) vx -= 1;
    if (keys['d'] || keys['arrowright']) vx += 1;

    if (joystickVec && Math.hypot(joystickVec.x, joystickVec.y) > 0.16) {
      vx = joystickVec.x;
      vy = joystickVec.y;
    }

    if (vx || vy) {
      walkTarget = null;
      pendingHotspot = null;
      const len = Math.hypot(vx, vy) || 1;
      const nx = vx / len;
      const ny = vy / len;
      S.player.dir = faceVector(nx, ny);
      movePlayer(nx * 178 * dt, ny * 178 * dt);
      playerWalking = true;
      playerPhase += dt * 9.4;
      stepClock -= dt;
      if (stepClock <= 0) {
        AUDIO.step(sc.surface);
        stepClock = 0.35;
      }
    } else if (walkTarget) {
      const dx = walkTarget.x - S.player.x;
      const dy = walkTarget.y - S.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 5) {
        S.player.x = walkTarget.x;
        S.player.y = walkTarget.y;
        walkTarget = null;
        playerWalking = false;
        if (pendingHotspot) {
          const h = pendingHotspot;
          pendingHotspot = null;
          doAction(h);
        }
      } else {
        S.player.dir = faceVector(dx, dy);
        movePlayer((dx / d) * 178 * dt, (dy / d) * 178 * dt);
        playerWalking = true;
        playerPhase += dt * 9.4;
        stepClock -= dt;
        if (stepClock <= 0) {
          AUDIO.step(sc.surface);
          stepClock = 0.35;
        }
      }
    } else {
      playerWalking = false;
      stepClock = 0;
    }

    updateCamera(dt, false);

    autosaveClock += dt;
    if (autosaveClock > 22) {
      autosaveClock = 0;
      saveNow(false);
    }
  }

  /* ------------------------------------------------------------
     Actions
     ------------------------------------------------------------ */
  function narrate(lines) {
    startDialogue({ speaker: null, lines: Array.isArray(lines) ? lines : [lines], topics: null, allowLeave: true });
  }

  function talkWren() {
    const node = D.dialogues.wren(S);
    effect.flag('metWren', true);
    startDialogue(node);
  }

  function talkTheo() {
    const node = D.dialogues.theo(S);
    effect.flag('metTheo', true);
    startDialogue(node);
  }

  function talkJune() {
    const node = D.dialogues.june(S);
    effect.flag('metJune', true);
    startDialogue(node);
  }

  function talkMara() {
    const node = D.dialogues.mara(S);
    effect.flag('metMara', true);
    startDialogue(node);
  }

  function doAction(h) {
    if (!h) return;
    hide($('prompt'));
    switch (h.action) {
      case 'counter':
        if (!S.flags.caseOpen) {
          effect.flag('metMara', true);
          startDialogue(D.dialogues.maraIntro(S));
        } else if (readyToDecide()) {
          openDecision();
        } else if (S.flags.epilogue) {
          talkMara();
        } else {
          narrate([D.notes.counter]);
        }
        break;
      case 'decorate':
        openPanel('decor');
        break;
      case 'shop_window':
        narrate([D.notes.shop_window]);
        break;
      case 'gramophone':
        AUDIO.play('string');
        narrate([D.notes.gramophone]);
        break;
      case 'cat':
        AUDIO.play('purr');
        narrate([D.notes.cat]);
        break;
      case 'mug':
        AUDIO.play('steam');
        narrate([D.notes.mug]);
        break;
      case 'bluebird':
        openInspect('bluebird');
        break;
      case 'go_street':
        transitionTo('street');
        break;
      case 'go_shop':
        transitionTo('shop');
        break;
      case 'go_clock':
        transitionTo('clock');
        break;
      case 'go_street_clock':
        transitionTo('street');
        break;
      case 'go_station':
        transitionTo('station');
        break;
      case 'go_street_station':
        transitionTo('street');
        break;
      case 'talk_wren':
        talkWren();
        break;
      case 'talk_theo':
        talkTheo();
        break;
      case 'talk_june':
        talkJune();
        break;
      case 'inspect_timetable':
        openInspect('timetable');
        break;
      case 'bench':
        if (!S.clues.bench_carving) {
          effect.clue('bench_carving');
          effect.card('bench');
        }
        narrate([D.notes.bench]);
        break;
      case 'notice':
        narrate([D.notes.notice]);
        break;
      case 'puddle':
        narrate([D.notes.puddle]);
        break;
      case 'street_lamp':
        narrate([D.notes.street_lamp]);
        break;
      case 'workbench':
        narrate([D.notes.workbench]);
        break;
      case 'bigclock':
        narrate([D.notes.bigclock]);
        break;
      case 'ticket_window':
        narrate([D.notes.ticket_window]);
        break;
      case 'station_clock':
        narrate([D.notes.station_clock]);
        break;
      case 'rails':
        narrate([D.notes.rails]);
        break;
      case 'crate':
        narrate([D.notes.crate]);
        break;
      case 'door':
        transitionTo('street');
        break;
      default:
        break;
    }
  }

  function finishIntro() {
    if (!S) return;
    S.flags.introDone = true;
    S.flags.caseOpen = true;
    S.flags.metMara = true;
    effect.item('watch');
    effect.card('watch');
    effect.note('mara_account');
    closeDialogue();
    updateHUD();
    saveNow(true);
    toast('The watch', 'Stopped at 8:17. Turn it over. Look closely.', '✦');
    setTimeout(() => {
      if (mode === 'game' && S) openInspect('watch');
    }, 420);
  }

  /* ------------------------------------------------------------
     Dialogue runner
     ------------------------------------------------------------ */
  function startDialogue(node) {
    if (!node || endingOpen()) return;
    ensureAudio();
    hideChapter();
    showOverlay('dialogue', { exclusive: true });
    dialogueState = {
      node: null,
      stack: [],
      lineIndex: 0,
      typing: false,
      timer: null,
      phase: 'line',
      closeAction: 'close',
      portrait: null,
    };
    AUDIO.setDialogue(true);
    renderNode(node);
  }

  function renderNode(node, opts) {
    const st = dialogueState;
    if (!st || !node) return;
    opts = opts || {};
    st.node = node;
    st.phase = 'line';
    st.closeAction = 'close';
    st.lineIndex = 0;
    $('dlgTopics').innerHTML = '';
    const dlg = $('dialogue');
    if (node.speaker && D.characters[node.speaker]) {
      const c = D.characters[node.speaker];
      dlg.classList.remove('narration');
      $('dlgPortraitWrap').style.display = '';
      $('dlgName').textContent = c.name;
      $('dlgRole').textContent = c.role;
      if (st.portrait !== c.portrait) {
        A.drawPortrait($('dlgPortrait'), c.portrait || node.speaker);
        st.portrait = c.portrait;
      }
      $('dlgClose').hidden = node.allowLeave === false;
    } else {
      dlg.classList.add('narration');
      $('dlgPortraitWrap').style.display = 'none';
      $('dlgName').textContent = '';
      $('dlgRole').textContent = '';
      $('dlgClose').hidden = node.allowLeave === false;
    }
    if (node.onEnter) node.onEnter();
    if (node.note) effect.note(node.note);

    const lines = node.lines || [];
    if (!lines.length) {
      finishLines();
      return;
    }
    if (opts.skipLines) {
      st.lineIndex = lines.length - 1;
      $('dlgText').textContent = lines[st.lineIndex];
      $('dlgText').classList.toggle('narration', !node.speaker);
      finishLines();
    } else {
      showLine();
    }
  }

  function showLine() {
    const st = dialogueState;
    if (!st || !st.node) return;
    const lines = st.node.lines || [];
    if (!lines.length) {
      finishLines();
      return;
    }
    if (st.lineIndex >= lines.length) st.lineIndex = lines.length - 1;
    const text = lines[st.lineIndex];
    const chars = Array.from(String(text));
    const speed = Math.max(10, 44 * settings.textSpeed);
    st.typing = true;
    st.shown = 0;
    st.full = chars;
    st.timer = null;
    $('dlgText').textContent = '';
    $('dlgText').classList.toggle('narration', !st.node.speaker);
    $('dlgHint').textContent = 'click, or press space';
    let last = performance.now();
    const tick = () => {
      if (!dialogueState || dialogueState !== st || !st.typing) return;
      const now = performance.now();
      const add = Math.max(1, Math.floor(((now - last) / 1000) * speed));
      last = now;
      st.shown = Math.min(chars.length, st.shown + add);
      $('dlgText').textContent = chars.slice(0, st.shown).join('');
      if (st.shown >= chars.length) {
        st.typing = false;
        lineDone();
      } else {
        st.timer = setTimeout(tick, 16);
      }
    };
    st.timer = setTimeout(tick, 18);
  }

  function completeLine() {
    const st = dialogueState;
    if (!st || !st.typing) return false;
    st.typing = false;
    if (st.timer) clearTimeout(st.timer);
    $('dlgText').textContent = st.full.join('');
    lineDone();
    return true;
  }

  function lineDone() {
    const st = dialogueState;
    if (!st || !st.node) return;
    const lines = st.node.lines || [];
    if (st.lineIndex < lines.length - 1) {
      st.phase = 'line';
      $('dlgHint').textContent = 'click to continue';
      return;
    }
    finishLines();
  }

  function finishLines() {
    const st = dialogueState;
    if (!st || !st.node) return;
    const node = st.node;
    if (node.end) {
      st.phase = 'close';
      st.closeAction = 'end';
      $('dlgHint').textContent = 'click to finish';
      return;
    }
    if (node.back) {
      st.phase = 'close';
      st.closeAction = 'back';
      $('dlgHint').textContent = 'click to continue';
      return;
    }
    const topics = (node.topics || []).filter((topic) => !topic.cond || topic.cond(S));
    if (topics.length) {
      st.phase = 'topics';
      showTopics();
      return;
    }
    st.phase = 'close';
    st.closeAction = 'close';
    $('dlgHint').textContent = node.allowLeave === false ? 'click to continue' : 'click to close';
  }

  function topicUsed(topic) {
    const st = dialogueState;
    if (!st || !st.node) return false;
    const key = (st.node.speaker || 'narrator') + ':' + topic.id;
    return !!S.usedTopics[key];
  }

  function markTopicUsed(topic) {
    const st = dialogueState;
    if (!st || !st.node) return;
    const key = (st.node.speaker || 'narrator') + ':' + topic.id;
    S.usedTopics[key] = true;
  }

  function showTopics() {
    const st = dialogueState;
    if (!st || !st.node) return;
    const wrap = $('dlgTopics');
    wrap.innerHTML = '';
    const topics = (st.node.topics || []).filter((topic) => {
      if (topic.cond && !topic.cond(S)) return false;
      if (topic.once && topicUsed(topic)) return false;
      return true;
    });
    if (!topics.length) {
      st.phase = 'close';
      st.closeAction = 'close';
      $('dlgHint').textContent = 'click to close';
      return;
    }
    st.phase = 'topics';
    $('dlgHint').textContent = 'choose a question';
    topics.forEach((topic) => {
      const b = document.createElement('button');
      b.className = 'dlg-topic';
      b.type = 'button';
      b.textContent = topic.label;
      b.addEventListener('click', () => chooseTopic(topic));
      wrap.appendChild(b);
    });
  }

  function chooseTopic(topic) {
    const st = dialogueState;
    if (!st || st.phase !== 'topics' || !st.node) return;
    if (topic.once) markTopicUsed(topic);
    if (topic.note) effect.note(topic.note);
    const parent = st.node;
    const next = topic.run ? topic.run(S) : null;
    if (next) {
      st.stack.push(parent);
      renderNode(next);
      return;
    }
    if (topic.id === 'photo_show') {
      showTopics();
      return;
    }
    closeDialogue();
  }

  function returnToParent() {
    const st = dialogueState;
    if (!st) return;
    const parent = st.stack.pop();
    if (!parent) {
      closeDialogue();
      return;
    }
    renderNode(parent, { skipLines: true });
  }

  function finishEnd() {
    const st = dialogueState;
    if (!st || !st.node) return;
    const node = st.node;
    closeDialogue();
    if (node.onEnd) setTimeout(() => node.onEnd(), 30);
  }

  function advanceDialogue() {
    const st = dialogueState;
    if (!st) return;
    if (st.typing) {
      completeLine();
      return;
    }
    if (st.phase === 'topics') return;
    if (st.phase === 'close') {
      if (st.closeAction === 'end') finishEnd();
      else if (st.closeAction === 'back') returnToParent();
      else closeDialogue();
      return;
    }
    const lines = st.node && st.node.lines ? st.node.lines : [];
    if (st.lineIndex < lines.length - 1) {
      st.lineIndex++;
      showLine();
    } else {
      finishLines();
    }
  }

  /* ------------------------------------------------------------
     Inspect overlay
     ------------------------------------------------------------ */
  function currentInspectSide() {
    return inspectState && Math.cos(inspectState.angle) < 0 ? 'back' : 'front';
  }

  function detailDiscovered(detail) {
    if (!inspectState) return false;
    const key = inspectState.obj.id + ':' + detail.id;
    return !!S.discoveries[key] || !!(detail.clue && S.clues[detail.clue]);
  }

  function openInspect(id) {
    const obj = D.objects[id];
    if (!obj || !S) return;
    ensureAudio();
    inspectState = {
      obj,
      angle: 0,
      targetAngle: null,
      dragging: false,
      startX: 0,
      startAngle: 0,
      moved: 0,
      timer: 0,
    };
    $('inspectKicker').textContent = obj.kicker || 'Object';
    $('inspectTitle').textContent = obj.name;
    $('inspectDesc').textContent = obj.desc || '';
    $('inspectInstruction').textContent = obj.instruction || (obj.sides ? 'Drag to turn it over · click the small warm glimmers' : 'Click the small warm glimmers');
    $('inspectCanvas').classList.remove('dragging');
    updateInspectDetails();
    renderInspectActions();
    showOverlay('inspect');
    AUDIO.play('page');

    if (id === 'timetable') {
      effect.flag('timetableFound', true);
      effect.card('timetable');
    }
    if (id === 'bluebird') {
      effect.flag('bluebirdFound', true);
      effect.item('bluebird');
      effect.note('bluebird');
    }
  }

  function isDetailDiscovered(detail) {
    if (!inspectState) return false;
    return detailDiscovered(detail);
  }

  function updateInspectDetails() {
    if (!inspectState) return;
    const side = currentInspectSide();
    const html = inspectState.obj.details
      .map((detail) => {
        const disc = isDetailDiscovered(detail);
        const other = detail.side && detail.side !== side;
        return (
          '<div class="detail-item ' + (disc ? 'discovered ' : '') + (other ? 'other-side' : '') + '">' +
          '<h4>' + (disc ? '<span class="dot"></span>' : '') + esc(detail.label) + '</h4>' +
          '<p>' + esc(detail.text || '') + '</p></div>'
        );
      })
      .join('');
    $('inspectDetails').innerHTML = html;
  }

  function renderInspectActions() {
    if (!inspectState) return;
    let html = '<button class="small-btn" data-inspect-close="1">Close</button>';
    if (inspectState.obj.sides) {
      html = '<button class="small-btn" data-inspect-turn="1">Turn it over</button>' + html;
    }
    $('inspectActions').innerHTML = html;
  }

  function discoverDetail(detail) {
    if (!inspectState || !S) return;
    const key = inspectState.obj.id + ':' + detail.id;
    if (S.discoveries[key]) return;
    S.discoveries[key] = true;
    if (detail.clue) effect.clue(detail.clue, true);
    if (detail.noteId) effect.note(detail.noteId);
    AUDIO.play('discover');
    toast('A detail', detail.label, '✦');
    updateInspectDetails();
    updateThought();
    queueSave();
    checkReady();
  }

  function inspectClick(e) {
    if (!inspectState) return;
    const c = $('inspectCanvas');
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 900;
    const y = ((e.clientY - rect.top) / rect.height) * 620;
    const side = currentInspectSide();
    let found = null;
    let foundD = Infinity;
    inspectState.obj.details.forEach((detail) => {
      if (detail.side && detail.side !== side) return;
      if (isDetailDiscovered(detail)) return;
      const dx = detail.x * 900;
      const dy = detail.y * 620;
      const rr = Math.max(30, detail.r * Math.min(900, 620));
      const d = dist(x, y, dx, dy);
      if (d < rr && d < foundD) {
        foundD = d;
        found = detail;
      }
    });
    if (found) discoverDetail(found);
  }

  function renderInspect() {
    if (!inspectState) return;
    const c = $('inspectCanvas');
    const g = c.getContext('2d');
    const W = 900;
    const H = 620;
    if (inspectState.targetAngle != null) {
      inspectState.angle = U.damp(inspectState.angle, inspectState.targetAngle, 12, dtGlobal);
      if (Math.abs(inspectState.angle - inspectState.targetAngle) < 0.008) {
        inspectState.angle = inspectState.targetAngle;
        inspectState.targetAngle = null;
      }
    }
    g.setTransform(1.5, 0, 0, 1.5, 0, 0);
    g.clearRect(0, 0, W, H);
    A.drawObject(g, inspectState.obj.id, W, H, { angle: inspectState.angle, t: tGlobal });
    const side = currentInspectSide();
    inspectState.obj.details.forEach((detail) => {
      if (detail.side && detail.side !== side) return;
      if (isDetailDiscovered(detail)) return;
      const x = detail.x * W;
      const y = detail.y * H;
      const pulse = (Math.sin(tGlobal * 2.6 + detail.x * 9 + detail.y * 7) + 1) / 2;
      const rr = Math.max(18, detail.r * Math.min(W, H));
      A.glow(g, x, y, rr * 2.4, '255,200,130', 0.12 + pulse * 0.08);
      g.strokeStyle = 'rgba(255,220,168,' + (0.5 + pulse * 0.3) + ')';
      g.lineWidth = 1.3;
      g.beginPath();
      g.arc(x, y, 9 + pulse * 3, 0, TAU);
      g.stroke();
      g.fillStyle = 'rgba(255,232,184,.9)';
      g.beginPath();
      g.arc(x, y, 2.4, 0, TAU);
      g.fill();
    });
  }

  /* ------------------------------------------------------------
     Journal
     ------------------------------------------------------------ */
  function renderJournal() {
    if (!S) return;
    $$('#journalTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === journalTab));
    const pages = $('journalPages');
    if (journalTab === 'people') {
      pages.innerHTML = renderPeople();
      $$('.person-portrait canvas').forEach((cv) => {
        const id = cv.dataset.person;
        if (id) A.drawPortrait(cv, id);
      });
      return;
    }
    if (journalTab === 'places') {
      pages.innerHTML = renderPlaces();
      return;
    }
    if (journalTab === 'evidence') {
      pages.innerHTML = renderEvidence();
      return;
    }
    pages.innerHTML = renderCase();
  }

  function renderCase() {
    const sc = D.scenes.shop;
    const acts = D.acts
      .map((act) => {
        const done = act.done(S);
        return (
          '<div class="act ' + (done ? 'done' : '') + '"><span class="act-mark"></span><div><p>' +
          esc(act.title) + '</p><small>' + esc(act.text) + '</small></div></div>'
        );
      })
      .join('');
    const notes = Object.keys(S.notes)
      .map((id) => noteText(id))
      .filter(Boolean);
    const unique = notes.filter((n, i) => notes.indexOf(n) === i);
    const notesHtml = unique.length
      ? '<ul class="notes-list">' + unique.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>'
      : '<p class="case-sub">No notes yet. The shop is good at changing that.</p>';
    const endingText = S.ending && D.endings[S.ending] ? '<p class="case-lede" style="margin-top:18px">' + esc(D.endings[S.ending].after) + '</p>' : '';
    return (
      '<div class="journal-grid">' +
      '<div class="journal-col">' +
      '<p class="journal-h3">The case</p>' +
      '<h2 class="case-title">The watch that waited</h2>' +
      '<p class="case-sub">Harrowmere · September, then and now</p>' +
      '<p class="case-lede">A brass watch stopped at 8:17. A name cut into the back. An hour that somebody kept for sixty years.</p>' +
      '<div class="act-list">' + acts + '</div>' +
      endingText +
      '</div>' +
      '<div class="journal-col">' +
      '<p class="journal-h3">A thought</p>' +
      '<div class="thought-box"><p class="eyebrow">Where you are</p><p>' + esc(D.thought(S)) + '</p></div>' +
      '<p class="journal-h3" style="margin-top:24px">Kept notes</p>' + notesHtml +
      '<p class="journal-h3" style="margin-top:24px">The shop</p>' +
      '<p class="case-sub">' + esc(D.placeNotes.shop.text) + '</p>' +
      '</div></div>'
    );
  }

  function personKnown(id) {
    if (id === 'mara') return !!(S.flags.introDone || S.flags.metMara);
    if (id === 'wren') return !!S.flags.metWren;
    if (id === 'theo') return !!S.flags.metTheo;
    if (id === 'june') return !!S.flags.metJune;
    if (id === 'elias') return !!(S.flags.photoFound || S.flags.letterFound);
    return false;
  }

  function renderPeople() {
    const order = ['mara', 'june', 'theo', 'wren', 'elias'];
    const cards = order
      .map((id) => {
        const c = D.characters[id];
        const known = personKnown(id);
        if (!known) {
          return (
            '<div class="person-card"><div class="person-portrait" style="display:grid;place-items:center;color:#6f6758;font-family:var(--serif);font-size:22px">?</div>' +
            '<div class="person-info"><h3>' + esc(c.name) + '</h3><p class="person-role">' + esc(c.role) + '</p>' +
            '<p class="person-locked">You haven’t met yet. The town keeps its people close.</p></div></div>'
          );
        }
        return (
          '<div class="person-card"><div class="person-portrait"><canvas width="140" height="176" data-person="' + id + '"></canvas></div>' +
          '<div class="person-info"><h3>' + esc(c.name) + '</h3><p class="person-role">' + esc(c.role) + '</p>' +
          '<p>' + esc(c.journal) + '</p></div></div>'
        );
      })
      .join('');
    return '<div class="people-grid">' + cards + '</div>';
  }

  function renderPlaces() {
    return Object.keys(D.placeNotes)
      .map((id) => {
        const p = D.placeNotes[id];
        const visited = !!S.visited[id];
        return (
          '<div class="place-card ' + (visited ? '' : 'unvisited') + '"><h3>' + esc(p.name) + '</h3>' +
          '<p class="place-sub">' + esc(p.sub) + '</p>' +
          '<p>' + esc(visited ? p.text : 'You haven’t been here yet. The rain has.') + '</p></div>'
        );
      })
      .join('');
  }

  function renderEvidence() {
    const ids = Object.keys(S.clues);
    if (!ids.length) return '<p class="evidence-empty">Nothing yet. Look closely at what people give you.</p>';
    return (
      '<div class="evidence-list">' +
      ids
        .map((id) => {
          const c = D.clues[id];
          if (!c) return '';
          const obj = D.objects[c.object] ? c.object : c.card === 'bench' ? 'photo' : 'watch';
          return (
            '<div class="evidence-row" data-object="' + esc(obj) + '">' +
            '<div class="evidence-thumb"><img alt="" src="' + A.icon(obj, 96) + '"></div>' +
            '<div class="evidence-info"><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p>' +
            '<p class="ev-source">' + esc(c.source) + '</p></div></div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  /* ------------------------------------------------------------
     Satchel
     ------------------------------------------------------------ */
  function renderInventory() {
    if (!S) return;
    const ids = Object.keys(D.objects).filter((id) => D.objects[id].item && S.items[id]);
    if (!selectedItem || !S.items[selectedItem]) selectedItem = ids[0] || null;
    $('inventoryEmpty').classList.toggle('hidden', ids.length > 0);
    $('inventoryGrid').innerHTML = ids
      .map((id) => {
        const o = D.objects[id];
        const isNew = !!S.newItems[id];
        return (
          '<button class="inv-item ' + (isNew ? 'new' : '') + '" data-item="' + id + '">' +
          '<span class="inv-thumb"><img alt="" src="' + A.icon(id, 160) + '"></span>' +
          '<span class="inv-name">' + esc(o.name) + '</span><span class="inv-tag">' + esc(o.kicker || 'Object') + '</span></button>'
        );
      })
      .join('');
    renderInventoryDetail();
  }

  function renderInventoryDetail() {
    const box = $('inventoryDetail');
    if (!selectedItem || !S.items[selectedItem]) {
      box.innerHTML = '<p class="inventory-empty" style="padding:0">The satchel is quiet.</p>';
      return;
    }
    const o = D.objects[selectedItem];
    box.innerHTML =
      '<h3>' + esc(o.name) + '</h3><p>' + esc(o.desc) + '</p>' +
      '<div style="margin-top:12px"><button class="small-btn" data-inspect-item="' + selectedItem + '">Look closer</button></div>';
  }

  /* ------------------------------------------------------------
     Decorating
     ------------------------------------------------------------ */
  const swatches = {
    amber: '#e2a95f',
    rose: '#c98f6f',
    sea: '#8fb6a0',
    midnight: '#2f4557',
    cornflower: '#4a6483',
    fern: '#5f7a4e',
    narcissus: '#e8e2cc',
    bluebird: '#5b8bb0',
    empty: '#b8a888',
    leaves: '#8a7a4f',
    station: '#c9b08a',
    watch: '#d1b26f',
  };

  function renderDecor() {
    if (!S) return;
    const body = $('decorBody');
    body.innerHTML = D.decor
      .map((cat) => {
        const opts = cat.options
          .map((opt) => {
            const unlocked = opt.unlocked(S);
            const selected = S.decor[cat.id] === opt.id;
            const color = swatches[opt.id] || '#b8a888';
            return (
              '<button class="decor-option ' + (selected ? 'selected' : '') + '" data-decor-cat="' + cat.id + '" data-decor-opt="' + opt.id + '"' +
              (unlocked ? '' : ' disabled') + '>' +
              '<span class="decor-swatch" style="background:' + color + '"></span>' +
              '<span><span class="do-name">' + esc(opt.name) + '</span><span class="do-desc">' +
              esc(unlocked ? opt.desc : 'Something still to be found.') + '</span></span>' +
              (selected ? '<span class="do-check">✓</span>' : '') +
              '</button>'
            );
          })
          .join('');
        return (
          '<div class="decor-cat"><h3>' + esc(cat.name) + '</h3>' +
          '<p class="decor-cat-sub">Choose what the shop keeps close</p>' +
          '<div class="decor-options">' + opts + '</div></div>'
        );
      })
      .join('');
  }

  function setDecor(catId, optId) {
    const cat = D.decor.find((c) => c.id === catId);
    if (!cat) return;
    const opt = cat.options.find((o) => o.id === optId);
    if (!opt || !opt.unlocked(S)) return;
    S.decor[catId] = optId;
    if (catId === 'sill' && optId === 'bluebird') S.flags.bluebirdPlaced = true;
    invalidateShop();
    saveNow(true);
    renderDecor();
    updateThought();
    AUDIO.play('click');
    toast('The shop changes', opt.name + ' — ' + opt.desc, '✦');
  }

  /* ------------------------------------------------------------
     Clue board
     ------------------------------------------------------------ */
  const cardDefaults = {
    watch: [0.18, 0.24],
    photo: [0.45, 0.17],
    timetable: [0.72, 0.24],
    letter: [0.23, 0.57],
    ledger: [0.49, 0.64],
    ticket: [0.75, 0.57],
    june: [0.39, 0.84],
    bench: [0.82, 0.82],
  };

  function ensureCardPositions() {
    if (!S) return;
    Object.keys(S.cards).forEach((id) => {
      if (!S.cardPos[id]) {
        const d = cardDefaults[id] || [0.5, 0.5];
        S.cardPos[id] = { x: d[0], y: d[1] };
      }
    });
  }

  function fitBoardCards() {
    const wrap = $('boardCanvas');
    const width = wrap && wrap.clientWidth;
    const height = wrap && wrap.clientHeight;
    if (!width || !height) return;
    let changed = false;
    $$('.clue-card', $('boardCards')).forEach((card) => {
      const minX = Math.min(0.5, (card.offsetWidth / 2 + 4) / width);
      const minY = Math.min(0.5, (card.offsetHeight / 2 + 4) / height);
      const x = clamp(parseFloat(card.style.left) / 100, minX, 1 - minX);
      const y = clamp(parseFloat(card.style.top) / 100, minY, 1 - minY);
      if (Math.abs(parseFloat(card.style.left) / 100 - x) > 0.0001 || Math.abs(parseFloat(card.style.top) / 100 - y) > 0.0001) {
        changed = true;
        const id = card.dataset.card;
        S.cardPos[id] = { x, y };
      }
      card.style.left = x * 100 + '%';
      card.style.top = y * 100 + '%';
    });
    if (changed) queueSave();
  }

  function renderBoard() {
    if (!S) return;
    ensureCardPositions();
    const ids = Object.keys(S.cards).filter((id) => D.cards[id]);
    $('boardEmpty').classList.toggle('hidden', ids.length > 0);
    $('boardCards').innerHTML = ids
      .map((id) => {
        const c = D.cards[id];
        const p = S.cardPos[id];
        const sel = selectedCards.indexOf(id) !== -1;
        return (
          '<button class="clue-card ' + (sel ? 'selected' : '') + '" data-card="' + id + '" ' +
          'style="left:' + (p.x * 100) + '%;top:' + (p.y * 100) + '%;transform:translate(-50%,-50%);text-align:left">' +
          '<span class="cc-kicker">' + esc(c.kicker) + '</span>' +
          '<span class="cc-title">' + esc(c.title) + '</span>' +
          '<span class="cc-sub">' + esc(c.sub) + '</span></button>'
        );
      })
      .join('');
    fitBoardCards();
    renderBoardSide();
    updateBoardInstruction();
    requestAnimationFrame(renderBoardLines);
  }

  function renderBoardSide() {
    const foundCore = D.coreDeductions(S);
    const visible = D.connections.filter((c) => (S.cards[c.a] && S.cards[c.b]) || S.deductions[c.id]);
    $('deductions').innerHTML = visible.length
      ? visible
          .map((c) => {
            const found = !!S.deductions[c.id];
            return (
              '<div class="deduction ' + (found ? 'found' : '') + '">' +
              '<span class="d-mark">' + (c.core ? 'Essential thread' : 'A thread for you') + '</span>' +
              '<h4>' + esc(found ? c.title : 'Thread not yet tied') + '</h4>' +
              '<p>' + esc(found ? c.text : '') + '</p></div>'
            );
          })
          .join('')
      : '<p class="board-instruction">No threads yet. The cards will come.</p>';
    const optional = D.connections.filter((c) => !c.core && S.deductions[c.id]).length;
    let progress =
      '<strong>' + foundCore + ' of 4</strong> essential threads · ' + optional + ' optional';
    if (readyToDecide()) {
      progress += '<br><button class="text-btn board-decide" id="boardDecide">Take it to the counter →</button>';
    }
    $('boardProgress').innerHTML = progress;
  }

  function updateBoardInstruction() {
    const el = $('boardInstruction');
    if (!el) return;
    if (selectedCards.length === 1) el.textContent = 'Now choose the other thread.';
    else if (selectedCards.length === 2) el.textContent = 'Tying them together…';
    else el.textContent = 'Choose two cards to tie them together.';
  }

  function renderBoardLines() {
    if (!S || !isOpen('board')) return;
    const svg = $('boardLines');
    const wrap = $('boardCanvas');
    if (!svg || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return;
    svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
    let html = '';
    D.connections.forEach((c) => {
      if (!S.deductions[c.id]) return;
      const ca = document.querySelector('.clue-card[data-card="' + c.a + '"]');
      const cb = document.querySelector('.clue-card[data-card="' + c.b + '"]');
      if (!ca || !cb) return;
      const ax = ca.offsetLeft;
      const ay = ca.offsetTop;
      const bx = cb.offsetLeft;
      const by = cb.offsetTop;
      html +=
        '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#a8463c" stroke-width="1.7" opacity=".72" stroke-linecap="round"/>' +
        '<circle cx="' + ax + '" cy="' + ay + '" r="2.8" fill="#c8a466" opacity=".9"/>' +
        '<circle cx="' + bx + '" cy="' + by + '" r="2.8" fill="#c8a466" opacity=".9"/>';
    });
    svg.innerHTML = html;
  }

  function boardCardClick(id) {
    if (suppressBoardClick) {
      suppressBoardClick = false;
      return;
    }
    const idx = selectedCards.indexOf(id);
    if (idx !== -1) {
      selectedCards.splice(idx, 1);
    } else {
      selectedCards.push(id);
      if (selectedCards.length > 2) selectedCards.shift();
    }
    if (selectedCards.length === 2) attemptConnection();
    else {
      renderBoard();
    }
  }

  function attemptConnection() {
    const a = selectedCards[0];
    const b = selectedCards[1];
    const conn = D.connections.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
    if (conn) {
      if (S.deductions[conn.id]) {
        $('boardInstruction').textContent = 'Those two are already tied. The thread is still there.';
        selectedCards = [];
        AUDIO.play('wrong');
        setTimeout(() => renderBoard(), 700);
        return;
      }
      S.deductions[conn.id] = true;
      selectedCards = [];
      saveNow(false);
      AUDIO.play('chime');
      toast('A thread tied', conn.title, '✦');
      renderBoard();
      checkReady();
      if (conn.core && D.coreDeductions(S) >= 4) {
        setTimeout(() => {
          if (S && !S.ending) toast('The whole story', 'The counter is waiting. Decide what should happen to the watch.', '✓');
        }, 900);
      }
      return;
    }
    selectedCards = [];
    AUDIO.play('wrong');
    $('boardInstruction').textContent = 'Nothing connects those. Not yet.';
    $$('.clue-card').forEach((el) => el.classList.add('wrong'));
    setTimeout(() => renderBoard(), 520);
  }

  function boardHint() {
    if (!S) return;
    const candidates = D.connections.filter((c) => !S.deductions[c.id] && S.cards[c.a] && S.cards[c.b]);
    if (candidates.length) {
      const c = candidates[0];
      $('boardInstruction').textContent = D.boardHints[c.id] || 'Two cards are waiting for a reason.';
    } else if (D.coreDeductions(S) >= 4) {
      $('boardInstruction').textContent = 'Every essential thread is tied. The counter is waiting.';
    } else {
      $('boardInstruction').textContent = 'You need more of the story before the thread will hold.';
    }
    AUDIO.play('page');
  }

  /* ------------------------------------------------------------
     Painting the world
     ------------------------------------------------------------ */
  function resize() {
    view.w = Math.max(1, window.innerWidth);
    view.h = Math.max(1, window.innerHeight);
    view.dpr = Math.min(2, window.devicePixelRatio || 1);
    stage.width = Math.round(view.w * view.dpr);
    stage.height = Math.round(view.h * view.dpr);
    stage.style.width = view.w + 'px';
    stage.style.height = view.h + 'px';
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    if (S && mode === 'game') updateCamera(0, true);
    if (isOpen('board')) {
      fitBoardCards();
      requestAnimationFrame(renderBoardLines);
    }
  }

  function renderTitle(t) {
    if (!titleCanvas) titleCanvas = A.paintTitle(1280, 800);
    const g = ctx;
    g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    g.clearRect(0, 0, view.w, view.h);
    const sc = Math.max(view.w / 1280, view.h / 800);
    const dx = (view.w - 1280 * sc) / 2 + Math.sin(t * 0.055) * 7 * sc;
    const dy = (view.h - 800 * sc) / 2;
    g.drawImage(titleCanvas, dx, dy, 1280 * sc, 800 * sc);
    const motion = settings.reduceMotion ? 0.34 : 0.9;
    A.rain(g, view.w, view.h, t, motion, 26);
    if (!settings.reduceMotion) A.fog(g, view.w, view.h, t * 0.5);
  }

  function renderWorld() {
    const sc = currentScene();
    if (!sc || !S) return;
    const bg = getSceneCanvas(S.scene);
    const g = ctx;
    g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    g.clearRect(0, 0, view.w, view.h);
    g.save();
    g.scale(cam.scale, cam.scale);
    g.translate(-cam.x, -cam.y);
    g.drawImage(bg, 0, 0, sc.w, sc.h);
    drawLights(sc, tGlobal);
    drawHotspots(sc, tGlobal);
    drawEntities(sc, tGlobal);
    g.restore();
    drawWeather(sc, tGlobal);
  }

  function drawLights(sc, t) {
    const lights = A.lights[S.scene] || [];
    const g = ctx;
    g.save();
    g.globalCompositeOperation = 'lighter';
    lights.forEach((l, i) => {
      const f = 0.82 + 0.18 * Math.sin(t * l.f + i * 1.7);
      A.glow(g, l.x, l.y, l.r * (0.96 + 0.05 * f), l.c, l.a * f);
    });
    g.restore();
  }

  function drawHotspots(sc, t) {
    const g = ctx;
    activeHotspots().forEach((h) => {
      if (!h.marker) return;
      const pulse = (Math.sin(t * 2.2 + h.x * 0.012 + h.y * 0.01) + 1) / 2;
      const active = hovered === h;
      A.glow(g, h.x, h.y, (active ? 50 : 34) + pulse * 8, '255,198,120', active ? 0.2 : 0.11);
      g.save();
      g.strokeStyle = 'rgba(255,214,158,' + (active ? 0.9 : 0.46 + pulse * 0.2) + ')';
      g.lineWidth = active ? 1.6 : 1.1;
      g.beginPath();
      g.arc(h.x, h.y, 7 + pulse * 2.2, 0, TAU);
      g.stroke();
      g.fillStyle = 'rgba(255,231,181,' + (active ? 0.95 : 0.65) + ')';
      g.beginPath();
      g.arc(h.x, h.y, 1.8, 0, TAU);
      g.fill();
      g.restore();
    });
  }

  function drawEntities(sc, t) {
    const g = ctx;
    const list = [];
    (sc.characters || []).forEach((c) => {
      if (c.cond && !c.cond(S)) return;
      const pos = (c.schedule && c.schedule(S)) || c;
      list.push({
        id: c.id,
        x: pos.x,
        y: pos.y,
        dir: pos.dir || c.dir || 'down',
        sitting: c.id === 'june' && S.scene === 'station',
      });
    });
    list.push({ id: 'player', x: S.player.x, y: S.player.y, dir: S.player.dir, player: true });
    list.sort((a, b) => a.y - b.y);
    list.forEach((e) => {
      if (e.player) {
        A.glow(g, e.x, e.y - 28, 74, '255,202,132', 0.055);
        A.drawCharacter(g, 'player', e.x, e.y, t, e.dir, {
          walking: playerWalking,
          phase: playerPhase,
        });
      } else {
        A.drawCharacter(g, e.id, e.x, e.y, t, e.dir, { sitting: e.sitting });
      }
    });
  }

  function drawWeather(sc, t) {
    const g = ctx;
    if (S.scene === 'street' || S.scene === 'station') {
      A.rain(g, view.w, view.h, t, S.scene === 'street' ? 0.92 : 0.56, 28);
      A.fog(g, view.w, view.h, t);
      if (S.scene === 'street' && !settings.reduceMotion) A.leaves(g, view.w, view.h, t * 0.6);
    } else {
      A.dust(g, view.w, view.h, t);
    }
  }

  /* ------------------------------------------------------------
     The decision & endings
     ------------------------------------------------------------ */
  function openDecision() {
    if (!S || !readyToDecide()) {
      toast('Not yet', 'There are still threads to tie. The board is where they meet.', '·');
      return;
    }
    showOverlay('decision', { exclusive: true });
    paintDecision();
    AUDIO.play('decision');
  }

  function paintDecision() {
    const c = $('decisionCanvas');
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, 520, 320);
    A.drawObject(g, 'watch', 520, 320, { angle: 0, t: 0 });
  }

  function paintEnding(which) {
    const c = $('endingCanvas');
    const g = c.getContext('2d');
    const W = 1280;
    const H = 800;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    const id = which === 'returned' ? 'station' : 'shop';
    const src = getSceneCanvas(id);
    const sw = id === 'station' ? 1900 : 1500;
    const sh = 1000;
    const sc = Math.max(W / sw, H / sh);
    const ox = (W - sw * sc) / 2;
    const oy = (H - sh * sc) / 2;
    g.drawImage(src, ox, oy, sw * sc, sh * sc);

    if (which === 'returned') {
      g.save();
      g.translate(ox, oy);
      g.scale(sc, sc);
      A.glow(g, 1390, 590, 190, '255,198,122', 0.16);
      A.drawCharacter(g, 'june', 1390, 645, 0, 'left', { sitting: true });
      g.restore();
    } else {
      g.save();
      g.globalCompositeOperation = 'lighter';
      A.glow(g, 1085, 575, 190, '255,196,120', 0.14);
      g.restore();
    }

    const wash = g.createLinearGradient(0, 0, W, 0);
    wash.addColorStop(0, 'rgba(4,8,9,.74)');
    wash.addColorStop(0.42, 'rgba(4,8,9,.38)');
    wash.addColorStop(0.75, 'rgba(4,8,9,.06)');
    wash.addColorStop(1, 'rgba(4,8,9,.3)');
    g.fillStyle = wash;
    g.fillRect(0, 0, W, H);
    const vig = g.createRadialGradient(W * 0.62, H * 0.48, H * 0.15, W * 0.62, H * 0.48, H * 0.86);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);
  }

  function showEnding(which) {
    const e = D.endings[which];
    if (!e) return;
    $('endingEyebrow').textContent = e.eyebrow;
    $('endingTitle').textContent = e.title;
    $('endingProse').innerHTML = e.prose.map((p) => '<p>' + esc(p) + '</p>').join('');
    $('endingQuote').textContent = e.quote;
    paintEnding(which);
    hide($('hud'));
    show($('ending'));
    AUDIO.setScene(which === 'returned' ? 'station' : 'shop', true);
    AUDIO.setMood('ending');
  }

  function chooseEnding(which) {
    if (!S || !D.endings[which] || S.ending) return;
    if (which === 'returned') {
      delete S.items.watch;
      delete S.items.letter;
    }
    S.ending = which;
    S.flags.epilogue = true;
    S.flags.bluebirdFound = true;
    S.flags.endingSeen = true;
    S.flags.readyNotified = true;
    effect.note('bluebird');
    closeAllOverlays(true);
    saveNow(false);
    AUDIO.play('decision');
    AUDIO.setMood('ending');
    $('sceneFade').classList.add('on');
    $('cinemaBars').classList.add('on');
    setTimeout(() => {
      showEnding(which);
      $('sceneFade').classList.remove('on');
      setTimeout(() => $('cinemaBars').classList.remove('on'), 800);
    }, 900);
  }

  function endingContinue() {
    if (!S) return;
    hide($('ending'));
    show($('hud'));
    S.scene = 'shop';
    S.visited.shop = true;
    const pos = entryFor('shop', 'street');
    S.player = { x: pos.x, y: pos.y, dir: pos.dir || 'down' };
    cam.init = false;
    updateCamera(0, true);
    updateHUD();
    updateThought();
    AUDIO.setScene('shop', true);
    AUDIO.setMood('shop');
    saveNow(true);
    chapter('After', 'The Little Things', 'The lamps are still on.', 3000);
    setTimeout(() => {
      if (S && S.flags.epilogue && !S.flags.bluebirdPlaced) {
        toast('A small thing', 'Wren left a chipped blue bird on the counter.', '✦');
      }
    }, 900);
  }

  /* ------------------------------------------------------------
     Panels & title
     ------------------------------------------------------------ */
  function openPanel(name) {
    if (!S && name !== 'settings' && name !== 'howto') return;
    if (name === 'journal') {
      renderJournal();
      showOverlay('journal', { exclusive: true });
      AUDIO.play('page');
    } else if (name === 'inventory') {
      renderInventory();
      showOverlay('inventory', { exclusive: true });
      AUDIO.play('page');
    } else if (name === 'board') {
      renderBoard();
      showOverlay('board', { exclusive: true });
      AUDIO.play('page');
      requestAnimationFrame(() => {
        fitBoardCards();
        renderBoardLines();
      });
    } else if (name === 'decor') {
      renderDecor();
      showOverlay('decor', { exclusive: true });
      AUDIO.play('page');
    } else if (name === 'pause') {
      updatePauseSave();
      showOverlay('pause', { exclusive: true });
      AUDIO.play('click');
    } else if (name === 'settings') {
      syncSettingsUI();
      showOverlay('settings', { stacked: true, above: mode === 'title' });
      AUDIO.play('click');
    } else if (name === 'howto') {
      showOverlay('howto', { stacked: true, above: mode === 'title' });
      AUDIO.play('page');
    }
  }

  function titleArrow() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  }

  function buildTitle() {
    titleSave = SAVE.meta();
    const wrap = $('titleActions');
    wrap.innerHTML = '';
    const primary = document.createElement('button');
    primary.className = 'title-primary';
    primary.type = 'button';
    if (titleSave) {
      primary.setAttribute('aria-label', 'Continue');
      const place = D.scenes[titleSave.scene] ? D.scenes[titleSave.scene].name : 'The Little Things';
      const sub = titleSave.ending ? 'after the ending · ' + place : place + ' · ' + ago(titleSave.savedAt);
      primary.innerHTML =
        '<span class="tp-copy"><span class="tp-label">Continue</span><span class="tp-sub">' + esc(sub) + '</span></span>' + titleArrow();
      primary.addEventListener('click', continueGame);
    } else {
      primary.setAttribute('aria-label', 'Start');
      primary.innerHTML =
        '<span class="tp-copy"><span class="tp-label">Start</span><span class="tp-sub">a short mystery in four rooms</span></span>' + titleArrow();
      primary.addEventListener('click', beginNewGame);
    }
    wrap.appendChild(primary);

    if (titleSave) {
      const again = document.createElement('button');
      again.className = 'title-secondary';
      again.type = 'button';
      again.innerHTML = '<span>Begin a new evening</span><span>start again from the rain</span>';
      again.addEventListener('click', beginNewGame);
      wrap.appendChild(again);
    }

    const how = document.createElement('button');
    how.className = 'title-secondary';
    how.type = 'button';
    how.innerHTML = '<span>How to play</span><span>a gentle reminder</span>';
    how.addEventListener('click', () => openPanel('howto'));
    wrap.appendChild(how);

    const minor = document.createElement('div');
    minor.className = 'title-minor';
    const set = document.createElement('button');
    set.type = 'button';
    set.textContent = 'Settings';
    set.addEventListener('click', () => openPanel('settings'));
    const about = document.createElement('button');
    about.type = 'button';
    about.textContent = 'About the voices';
    about.addEventListener('click', () => openPanel('settings'));
    minor.appendChild(set);
    minor.appendChild(about);
    wrap.appendChild(minor);
  }

  function actuallyStartNew() {
    SAVE.clear();
    S = newState();
    mode = 'game';
    lastSaveAt = 0;
    ensureAudio();
    hide($('title'));
    hide($('loading'));
    show($('hud'));
    closeAllOverlays(true);
    const sp = D.scenes.shop.spawn;
    S.player = { x: sp.x, y: sp.y, dir: sp.dir };
    cam.init = false;
    updateCamera(0, true);
    updateHUD();
    AUDIO.setScene('shop', true);
    AUDIO.setMood('shop');
    saveNow(false);
    chapter('Harrowmere · 6:40 p.m.', 'The Little Things', 'An evening in the rain', 2800);
    showMobileHint();
    setTimeout(() => {
      if (mode === 'game' && S && !S.flags.introDone) {
        effect.flag('metMara', true);
        startDialogue(D.dialogues.maraIntro(S));
      }
    }, 1500);
  }

  function beginNewGame() {
    ensureAudio();
    if (SAVE.has()) {
      showConfirm(
        'Begin again?',
        'Start a new evening?',
        'Your current evening will be replaced. Settings and sound choices will stay.',
        () => actuallyStartNew()
      );
      return;
    }
    actuallyStartNew();
  }

  function continueGame() {
    const raw = SAVE.read();
    if (!raw) {
      beginNewGame();
      return;
    }
    S = hydrate(raw);
    mode = 'game';
    lastSaveAt = S.savedAt || 0;
    ensureAudio();
    hide($('title'));
    hide($('loading'));
    show($('hud'));
    closeAllOverlays(true);
    cam.init = false;
    updateCamera(0, true);
    updateHUD();
    AUDIO.setScene(S.scene, true);
    AUDIO.setMood(S.scene);
    showMobileHint();
    setTimeout(() => {
      if (S) toast('Welcome back', S.ending ? 'The shop kept its evening.' : 'Picking up where you left off.', '·');
    }, 600);
  }

  function doReturnTitle() {
    saveNow(false);
    mode = 'title';
    hide($('ending'));
    hide($('hud'));
    show($('title'));
    closeAllOverlays(true);
    hideChapter();
    $('sceneFade').classList.remove('on');
    $('cinemaBars').classList.remove('on');
    buildTitle();
    AUDIO.setScene('shop', true);
    AUDIO.setMood('title');
  }

  /* ------------------------------------------------------------
     Settings
     ------------------------------------------------------------ */
  function applySettings() {
    AUDIO.setSettings(settings);
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
  }

  function syncSettingsUI() {
    const set = (id, value, out, fmt) => {
      const input = $(id);
      if (input) input.value = value;
      const o = $(out);
      if (o) o.textContent = fmt ? fmt(value) : Math.round(value * 100) + '%';
    };
    set('volMusic', settings.music, 'volMusicOut');
    set('volAmb', settings.ambience, 'volAmbOut');
    set('volSfx', settings.sfx, 'volSfxOut');
    set('textSpeed', settings.textSpeed, 'textSpeedOut', (v) => Number(v).toFixed(1) + '×');
    const rm = $('reduceMotion');
    if (rm) rm.checked = !!settings.reduceMotion;
  }

  function bindSettings() {
    const bindVol = (id, key, out) => {
      const input = $(id);
      if (!input) return;
      input.addEventListener('input', () => {
        settings[key] = parseFloat(input.value);
        const o = $(out);
        if (o) o.textContent = Math.round(settings[key] * 100) + '%';
        AUDIO.setSettings(settings);
        SAVE.writeSettings(settings);
      });
    };
    bindVol('volMusic', 'music', 'volMusicOut');
    bindVol('volAmb', 'ambience', 'volAmbOut');
    bindVol('volSfx', 'sfx', 'volSfxOut');
    const speed = $('textSpeed');
    if (speed) {
      speed.addEventListener('input', () => {
        settings.textSpeed = parseFloat(speed.value);
        const o = $('textSpeedOut');
        if (o) o.textContent = settings.textSpeed.toFixed(1) + '×';
        SAVE.writeSettings(settings);
      });
    }
    const rm = $('reduceMotion');
    if (rm) {
      rm.addEventListener('change', () => {
        settings.reduceMotion = rm.checked;
        SAVE.writeSettings(settings);
        applySettings();
      });
    }
    const fs = $('fullscreenBtn');
    if (fs) {
      fs.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          const root = document.documentElement;
          if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  /* ------------------------------------------------------------
     Events
     ------------------------------------------------------------ */
  function bindEvents() {
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 120));
    window.addEventListener('beforeunload', () => {
      if (S) saveNow(false);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && S) saveNow(false);
    });

    document.addEventListener('pointerdown', () => {
      if (mode === 'game') ensureAudio();
    }, { once: true });

    document.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open]');
      if (open) {
        e.preventDefault();
        openPanel(open.dataset.open);
        return;
      }
      const close = e.target.closest('[data-close]');
      if (close) {
        e.preventDefault();
        closeOverlay(close.dataset.close);
      }
    });

    $('dlgClose').addEventListener('click', closeDialogue);
    $('dlgText').addEventListener('click', advanceDialogue);
    $('dlgHint').addEventListener('click', advanceDialogue);

    $('prompt').addEventListener('click', () => {
      const near = nearestHotspot();
      if (near) interactWith(near.h);
    });

    $('journalTabs').addEventListener('click', (e) => {
      const b = e.target.closest('.tab');
      if (!b) return;
      journalTab = b.dataset.tab || 'case';
      AUDIO.play('page');
      renderJournal();
    });

    $('journalPages').addEventListener('click', (e) => {
      const row = e.target.closest('[data-object]');
      if (!row) return;
      const id = row.dataset.object;
      if (D.objects[id]) openInspect(id);
      else toast('A detail', 'It is already in the journal.', '·');
    });

    $('inventoryGrid').addEventListener('click', (e) => {
      const item = e.target.closest('[data-item]');
      if (!item) return;
      selectedItem = item.dataset.item;
      if (S.newItems[selectedItem]) {
        delete S.newItems[selectedItem];
        queueSave();
      }
      renderInventory();
      AUDIO.play('click');
    });

    $('inventoryDetail').addEventListener('click', (e) => {
      const b = e.target.closest('[data-inspect-item]');
      if (b) openInspect(b.dataset.inspectItem);
    });

    $('decorBody').addEventListener('click', (e) => {
      const b = e.target.closest('[data-decor-cat]');
      if (!b || b.disabled) return;
      setDecor(b.dataset.decorCat, b.dataset.decorOpt);
    });

    $('boardHintBtn').addEventListener('click', boardHint);
    $('boardCards').addEventListener('click', (e) => {
      const card = e.target.closest('.clue-card');
      if (!card) return;
      boardCardClick(card.dataset.card);
    });
    $('boardCards').addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.clue-card');
      if (!card || !S) return;
      const id = card.dataset.card;
      const pos = S.cardPos[id];
      if (!pos) return;
      boardDrag = {
        id,
        card,
        startX: e.clientX,
        startY: e.clientY,
        origX: parseFloat(card.style.left) / 100,
        origY: parseFloat(card.style.top) / 100,
        moved: false,
      };
      try {
        card.setPointerCapture(e.pointerId);
      } catch (err) {}
    });
    document.addEventListener('pointermove', (e) => {
      if (!boardDrag) return;
      const dx = e.clientX - boardDrag.startX;
      const dy = e.clientY - boardDrag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) boardDrag.moved = true;
      if (!boardDrag.moved) return;
      const wrap = $('boardCanvas');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const cardWidth = boardDrag.card.offsetWidth;
      const cardHeight = boardDrag.card.offsetHeight;
      const minX = Math.min(0.5, (cardWidth / 2 + 4) / Math.max(1, rect.width));
      const minY = Math.min(0.5, (cardHeight / 2 + 4) / Math.max(1, rect.height));
      const x = clamp(boardDrag.origX + dx / Math.max(1, rect.width), minX, 1 - minX);
      const y = clamp(boardDrag.origY + dy / Math.max(1, rect.height), minY, 1 - minY);
      S.cardPos[boardDrag.id] = { x, y };
      boardDrag.card.style.left = x * 100 + '%';
      boardDrag.card.style.top = y * 100 + '%';
      renderBoardLines();
    });
    document.addEventListener('pointerup', () => {
      if (!boardDrag) return;
      if (boardDrag.moved) {
        suppressBoardClick = true;
        queueSave();
        setTimeout(() => {
          suppressBoardClick = false;
        }, 80);
      }
      boardDrag = null;
      if (suppressBoardClick && S) {
        Object.keys(S.cardPos).forEach((id) => {
          const card = document.querySelector('.clue-card[data-card="' + id + '"]');
          if (card) S.cardPos[id] = {
            x: parseFloat(card.style.left) / 100,
            y: parseFloat(card.style.top) / 100,
          };
        });
      }
      renderBoardLines();
    });

    $('boardProgress').addEventListener('click', (e) => {
      if (e.target.closest('#boardDecide')) {
        closeOverlay('board');
        openDecision();
      }
    });

    const canvas = $('inspectCanvas');
    canvas.addEventListener('pointerdown', (e) => {
      if (!inspectState) return;
      inspectState.dragging = !!inspectState.obj.sides;
      inspectState.startX = e.clientX;
      inspectState.startAngle = inspectState.angle;
      inspectState.moved = 0;
      inspectState.targetAngle = null;
      if (inspectState.dragging) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err) {}
        canvas.classList.add('dragging');
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!inspectState || !inspectState.dragging) return;
      const dx = e.clientX - inspectState.startX;
      inspectState.moved = Math.max(inspectState.moved, Math.abs(dx));
      inspectState.angle = inspectState.startAngle + dx * 0.018;
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!inspectState) return;
      const moved = inspectState.moved;
      const wasDragging = inspectState.dragging;
      inspectState.dragging = false;
      canvas.classList.remove('dragging');
      if (wasDragging && moved > 5) {
        inspectState.targetAngle = Math.round(inspectState.angle / Math.PI) * Math.PI;
        updateInspectDetails();
        AUDIO.play('page');
        return;
      }
      inspectClick(e);
    });
    canvas.addEventListener('pointercancel', () => {
      if (!inspectState) return;
      inspectState.dragging = false;
      canvas.classList.remove('dragging');
    });

    $('inspectActions').addEventListener('click', (e) => {
      if (!inspectState) return;
      if (e.target.closest('[data-inspect-close]')) {
        closeOverlay('inspect');
        return;
      }
      if (e.target.closest('[data-inspect-turn]')) {
        inspectState.targetAngle = currentInspectSide() === 'front' ? Math.PI : 0;
        AUDIO.play('page');
      }
    });

    $('saveNowBtn').addEventListener('click', () => {
      saveNow(true);
      toast('Saved', 'The evening is tucked away safely.', '✓');
    });
    $('howToBtn').addEventListener('click', () => openPanel('howto'));
    $('toTitleBtn').addEventListener('click', () => {
      showConfirm(
        'Leave the shop?',
        'Return to the title?',
        'Your evening is saved. You can continue from here whenever you like.',
        doReturnTitle
      );
    });

    $('confirmYes').addEventListener('click', () => {
      const cb = confirmCb;
      confirmCb = null;
      closeOverlay('confirm');
      if (cb) cb();
    });
    $('confirmNo').addEventListener('click', () => closeOverlay('confirm'));

    $$('.decision-choice').forEach((b) => {
      b.addEventListener('click', () => chooseEnding(b.dataset.choice));
    });
    $('endingContinue').addEventListener('click', endingContinue);
    $('endingTitleBtn').addEventListener('click', doReturnTitle);

    bindSettings();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    bindStagePointer();
  }

  function onKeyDown(e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      e.preventDefault();
      const top = overlayStack[overlayStack.length - 1];
      if (!top) {
        if (mode === 'game' && !endingOpen()) openPanel('pause');
        return;
      }
      if (top === 'dialogue') {
        if (dialogueState && dialogueState.node && dialogueState.node.allowLeave !== false) closeDialogue();
        return;
      }
      closeOverlay(top);
      return;
    }

    if (mode !== 'game' || endingOpen()) return;
    if (dialogueState) {
      if (k === ' ' || k === 'enter' || k === 'e') {
        e.preventDefault();
        advanceDialogue();
      }
      return;
    }
    if (isOpen('inspect')) return;

    if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') {
      keys[k] = true;
      e.preventDefault();
      return;
    }
    if (k === 'e' || k === 'enter') {
      e.preventDefault();
      const near = nearestHotspot();
      if (near) interactWith(near.h);
      return;
    }
    if (k === ' ') {
      e.preventDefault();
      return;
    }
    if (k === 'j') {
      e.preventDefault();
      openPanel('journal');
      return;
    }
    if (k === 'i') {
      e.preventDefault();
      openPanel('inventory');
      return;
    }
    if (k === 'c') {
      e.preventDefault();
      openPanel('board');
      return;
    }
    if (k === 'm') {
      e.preventDefault();
      openPanel('pause');
    }
  }

  function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
  }

  function bindStagePointer() {
    stage.addEventListener('pointerdown', (e) => {
      if (mode !== 'game' || isBlocking()) return;
      ensureAudio();
      const rect = stage.getBoundingClientRect();
      pointerDown = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        sx: e.clientX - rect.left,
        sy: e.clientY - rect.top,
        type: e.pointerType,
        moved: false,
      };
      if (e.pointerType === 'touch') {
        try {
          stage.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
    });
    stage.addEventListener('pointermove', (e) => {
      if (mode !== 'game' || isBlocking()) {
        hovered = null;
        return;
      }
      const rect = stage.getBoundingClientRect();
      if (pointerDown && pointerDown.id === e.pointerId) {
        const dx = e.clientX - pointerDown.x;
        const dy = e.clientY - pointerDown.y;
        if (Math.hypot(dx, dy) > 14) pointerDown.moved = true;
        if (pointerDown.moved && pointerDown.type === 'touch') {
          joystickVec = { x: clamp(dx / 58, -1, 1), y: clamp(dy / 58, -1, 1) };
          showJoystickAt(pointerDown.x, pointerDown.y, joystickVec);
          hovered = null;
          return;
        }
      } else if (e.pointerType !== 'touch') {
        updateHover(e.clientX - rect.left, e.clientY - rect.top);
      }
    });
    const endPointer = (e) => {
      if (!pointerDown || pointerDown.id !== e.pointerId) return;
      const p = pointerDown;
      pointerDown = null;
      joystickVec = null;
      hideJoystick();
      if (p.moved) return;
      const rect = stage.getBoundingClientRect();
      tapAt(e.clientX - rect.left, e.clientY - rect.top);
    };
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', () => {
      pointerDown = null;
      joystickVec = null;
      hideJoystick();
    });
    stage.addEventListener('pointerleave', () => {
      if (mode === 'game' && !pointerDown) hovered = null;
    });
  }

  function updateHover(sx, sy) {
    const wx = sx / cam.scale + cam.x;
    const wy = sy / cam.scale + cam.y;
    let found = null;
    activeHotspots().forEach((h) => {
      if (found) return;
      const rr = Math.max(32, (h.r || 70) * 0.95);
      if (dist(wx, wy, h.x, h.y) < rr) found = h;
    });
    hovered = found;
    stage.style.cursor = found ? 'pointer' : 'default';
  }

  function showJoystickAt(x, y, vec) {
    const joy = $('joystick');
    const stick = $('stick');
    if (!joy) return;
    joy.classList.remove('hidden');
    joy.style.left = x - 56 + 'px';
    joy.style.top = y - 56 + 'px';
    joy.style.bottom = 'auto';
    if (stick) stick.style.transform = 'translate(' + vec.x * 26 + 'px,' + vec.y * 26 + 'px)';
  }

  function hideJoystick() {
    const joy = $('joystick');
    if (!joy) return;
    joy.classList.add('hidden');
    joy.style.top = '';
    joy.style.bottom = '';
    const stick = $('stick');
    if (stick) stick.style.transform = '';
  }

  /* ------------------------------------------------------------
     Main loop
     ------------------------------------------------------------ */
  function frame(now) {
    if (!lastFrame) lastFrame = now;
    dtGlobal = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    tGlobal = now / 1000;
    if (mode === 'title') {
      renderTitle(tGlobal);
    } else if (S) {
      if (!isBlocking()) update(dtGlobal);
      renderWorld();
      if (inspectState) renderInspect();
    }
    if (mode === 'game' && !isBlocking()) updatePrompt();
    else hide($('prompt'));
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  function init() {
    resize();
    applySettings();
    syncSettingsUI();
    buildTitle();
    bindEvents();
    const ic = $('inspectCanvas');
    if (ic) {
      ic.width = 1350;
      ic.height = 930;
    }
    show($('loading'));
    setTimeout(() => hide($('loading')), 480);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        titleCanvas = null;
        sceneCache = {};
      });
    }
    requestAnimationFrame(frame);
  }

  /* Public API used by the authored story in data.js */
  LT.game = {
    effect,
    openInspect,
    closeDialogue,
    finishIntro,
    saveNow,
    openPanel,
    openDecision,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
