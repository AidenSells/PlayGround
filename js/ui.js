// ---------------------------------------------------------------
// THE LITTLE THINGS — interface, journal, documents, title
// ---------------------------------------------------------------
import {
  CLUES, DEDUCTIONS, PEOPLE, KEEPSAKES, ENDINGS, EVIDENCE,
  WATCH_DETAILS, SCENE_INFO
} from './data.js';
import {
  state, hasClue, hasDeduction, addClue, addDeduction, addKeepsake,
  saveState, getObjective, loadMeta, hasSave, formatPlaytime
} from './state.js';
import { drawPortrait } from './chars.js';
import { drawPhoto } from './special.js';

const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (s = '') => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

// ---------------------------------------------------------------
// Little hand-drawn glyphs
// ---------------------------------------------------------------
const ICON_PATHS = {
  watch: '<circle cx="12" cy="13" r="7.2"/><path d="M12 9v4l2.8 1.8M9.6 3h4.8M12 3v2.2M18.6 6.2l1.4-1.4"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6v4.7l3.2 2M12 2.8v1.4M12 19.8v1.4M2.8 12h1.4M19.8 12h1.4"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
  thread: '<path d="M4 7.5c3.2-3 5.6 2.4 8.6-.4s3.8 2.2 7.4-.6M4 15.5c3.2-3 5.6 2.4 8.6-.4s3.8 2.2 7.4-.6"/><circle cx="4.4" cy="7.5" r="1"/><circle cx="19.6" cy="14.2" r="1"/>',
  letter: '<rect x="3.5" y="6" width="17" height="12" rx="1"/><path d="m4 7 8 6.4L20 7"/>',
  photo: '<rect x="4" y="5" width="16" height="14" rx="1"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 4.8-4.6 3.4 3.2 2.8-2.4 3.8 3.8"/>',
  lighthouse: '<path d="M9 20h6l-1.2-9H10.2L9 20ZM10.6 8h2.8v3h-2.8zM9.2 6.2h5.6M12 3.2v3M7.2 8.6 3.8 7M16.8 8.6 20.2 7"/>',
  train: '<rect x="5" y="5.5" width="14" height="11" rx="2"/><path d="M5 10h14M9 16.5v2M15 16.5v2M8 20h.1M16 20h.1M8.2 8h3.2"/>',
  engraving: '<path d="M5 6.5c2.4-2.2 4.2.7 6.4-.3s3.4 1.4 6.6-.5M5 12h14M5 17.5h9"/><path d="M16 16.8c1.4-1.4 2.5 1.5 4-.2"/>',
  photo2: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 16.5 9 12l3 2.8 2.4-2 5.6 5"/>',
  boat: '<path d="M4 14.5h16l-3.2 4H7.2L4 14.5ZM9.5 14V5.6L18 9.8l-8.5 2.8"/>',
  button: '<circle cx="12" cy="12" r="7.4"/><circle cx="12" cy="12" r="2.6"/><path d="M12 6.5v1.2M12 16.3v1.2M6.5 12h1.2M16.3 12h1.2"/>',
  violet: '<path d="M12 13.5c-2.8 0-4.6-1.5-4.6-3.5S9 6.2 12 6.2s4.6 1.8 4.6 3.8-1.8 3.5-4.6 3.5ZM12 13.5V20M12 17c-2.2 0-3.4-1.2-4-2.4M12 18.4c1.8 0 3-1 3.6-2.2"/>',
  shell: '<path d="M12 20c-4 0-7-3.3-7-7.4C5 8.6 8.2 4.6 12 3.2c3.8 1.4 7 5.4 7 9.4 0 4.1-3 7.4-7 7.4Z"/><path d="M12 20V5.4M8.4 18.2 11.2 5.8M15.6 18.2 12.8 5.8"/>',
  lock: '<rect x="5.5" y="10" width="13" height="9.5" rx="1.6"/><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10M12 13.6v2.2"/>',
  sparkle: '<path d="M12 3.5c.7 4.6 2.8 6.7 7.4 7.4-4.6.7-6.7 2.8-7.4 7.4-.7-4.6-2.8-6.7-7.4-7.4 4.6-.7 6.7-2.8 7.4-7.4Z"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.1C5 8 7 6.3 9.4 6.3c1.3 0 2.2.6 2.6 1.4.4-.8 1.3-1.4 2.6-1.4C17 6.3 19 8 19 10.9 19 15.6 12 20 12 20Z"/>'
};

export function glyph(name, cls = '') {
  const path = ICON_PATHS[name] || ICON_PATHS.sparkle;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

// ---------------------------------------------------------------
// Hooks + module state
// ---------------------------------------------------------------
let hooks = {};
let lastObjective = '';
let objectiveTimer = null;
let locationTimer = null;
let selectedThreads = [];
let threadNoteTimer = null;
let inspectResolve = null;
let inspectView = 'front';
let inspectOpen = false;
let evidenceOpen = false;
let journalOpen = false;
let pauseOpen = false;
let galleryOpen = false;
let endingOpen = false;
let previousFocus = null;

const dlg = {
  open: false,
  typing: false,
  timer: null,
  lineResolve: null,
  choiceResolve: null,
  choices: [],
  keyed: 0,
  fullText: '',
  visibleText: '',
  index: 0
};

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
export function initUI(h = {}) {
  hooks = h || {};

  // title
  $('#btn-new')?.addEventListener('click', () => { safeSound('init'); hooks.onNew?.(); });
  $('#btn-continue')?.addEventListener('click', () => { safeSound('init'); hooks.onContinue?.(); });
  $('#btn-endings')?.addEventListener('click', () => { safeSound('click'); openEndings(); });
  $('#endings-close')?.addEventListener('click', closeEndings);

  // journal
  $('#journal-close')?.addEventListener('click', closeJournal);
  document.querySelectorAll('#journal .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#journal .tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('#journal .tab-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.dataset.tab;
      $('#tab-' + id)?.classList.add('active');
      selectedThreads = [];
      renderJournal();
      safeSound('click');
    });
  });
  $('#journal')?.addEventListener('click', (e) => {
    if (e.target === $('#journal')) closeJournal();
  });

  // inspect
  $('#inspect-close')?.addEventListener('click', closeInspect);
  $('#watch-flip')?.addEventListener('click', () => {
    inspectView = inspectView === 'front' ? 'back' : 'front';
    renderInspect(true);
    safeSound('click');
  });
  $('#watch-open')?.addEventListener('click', () => {
    inspectView = inspectView === 'back' ? 'movement' : 'back';
    renderInspect(true);
    safeSound('click');
  });
  $('#watch-svg-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.watch-hotspot');
    if (!btn) return;
    noticeWatchDetail(btn.dataset.detail);
  });

  // evidence
  $('#evidence-close')?.addEventListener('click', closeEvidence);
  $('#evidence-close-2')?.addEventListener('click', closeEvidence);
  $('#evidence')?.addEventListener('click', (e) => {
    if (e.target === $('#evidence')) closeEvidence();
  });

  // pause
  $('#pause-resume')?.addEventListener('click', () => { closePause(); hooks.onResume?.(); });
  $('#pause-journal')?.addEventListener('click', () => { closePause(); openJournal('case'); });
  $('#pause-sound')?.addEventListener('click', () => {
    state.settings.muted = !state.settings.muted;
    saveState();
    updateSettingsLabels();
    hooks.onSound?.(state.settings.muted);
    safeSound('click');
  });
  $('#pause-motion')?.addEventListener('click', () => {
    state.settings.gentleMotion = !state.settings.gentleMotion;
    saveState();
    updateSettingsLabels();
    hooks.onMotion?.(state.settings.gentleMotion);
    safeSound('click');
  });
  $('#pause-title')?.addEventListener('click', () => { closePause(); hooks.onSaveTitle?.(); });

  // ending screen
  $('#ending-continue')?.addEventListener('click', () => {
    const key = state.flags.ending;
    closeEnding();
    hooks.onEndingContinue?.(key);
  });
  $('#ending-title-btn')?.addEventListener('click', () => {
    closeEnding();
    hooks.onEndingTitle?.();
  });

  // misc
  $('#rotate-dismiss')?.addEventListener('click', () => $('#rotate-hint')?.classList.add('hidden'));

  // dialogue advance by click/tap
  $('#dialogue')?.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#dlg-choices')) return;
    advanceDialogue();
  });

  // threads board delegation
  $('#tab-threads')?.addEventListener('click', (e) => {
    const hint = e.target.closest('.thread-hint');
    if (hint) { useThreadHint(); return; }
    const card = e.target.closest('.clue-card');
    if (!card || dlg.open) return;
    toggleThread(card.dataset.clue);
  });

  // document keyboard/escape is managed by main, but keep dialogue keys here
  window.addEventListener('keydown', onDialogueKey, true);

  updateSettingsLabels();
  updateTitle();
}

// ---------------------------------------------------------------
// Sound passthrough (main supplies the engine)
// ---------------------------------------------------------------
let soundApi = null;
export function setSoundApi(api) { soundApi = api; }
function safeSound(name, ...args) {
  try { soundApi?.[name]?.(...args); } catch { /* audio is a luxury */ }
}

// ---------------------------------------------------------------
// Dialogue
// ---------------------------------------------------------------
export function isDialogueOpen() { return dlg.open; }

export function isBlocking() {
  return dlg.open || journalOpen || inspectOpen || evidenceOpen || pauseOpen || galleryOpen || endingOpen;
}

export function overlayOpen() {
  return journalOpen || inspectOpen || evidenceOpen || pauseOpen || galleryOpen || endingOpen;
}

function personName(id) {
  if (!id) return '';
  if (id === 'you') return 'You';
  const p = PEOPLE[id];
  return p ? p.name.split(' ')[0] : (id.charAt(0).toUpperCase() + id.slice(1));
}

function personNote(id, line) {
  if (line.note) return line.note;
  if (!id) return 'Ember Hollow';
  if (id === 'you') return 'the shopkeeper';
  const p = PEOPLE[id];
  return p ? p.role : '';
}

function setPortrait(id) {
  const canvas = $('#dlg-portrait');
  if (!canvas) return;
  try { drawPortrait(canvas, id === 'you' ? 'player' : id); } catch { /* keep previous */ }
}

function setContinueCue(show) {
  $('#dlg-continue')?.classList.toggle('hidden', !show);
}

export function say(lines) {
  if (!Array.isArray(lines)) lines = [lines];
  return (async () => {
    dlg.open = true;
    $('#dialogue')?.classList.remove('hidden');
    for (const raw of lines) {
      const line = typeof raw === 'string' ? { who: null, text: raw } : raw;
      await showLine(line);
    }
    closeDialogue();
  })();
}

async function showLine(line) {
  const el = $('#dialogue');
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.toggle('narration', !line.who);
  $('#dlg-speaker').textContent = line.who ? personName(line.who) : (line.speaker || 'The Little Things');
  $('#dlg-note').textContent = personNote(line.who, line);
  if (line.who) setPortrait(line.who);
  if (line.sound) safeSound(line.sound);

  const text = line.text || '';
  dlg.fullText = fmt(text);
  dlg.visibleText = text.replace(/\*([^*]+)\*/g, '$1');
  dlg.index = 0;
  dlg.typing = true;
  dlg.lineResolve = null;
  setContinueCue(false);
  $('#dlg-choices')?.classList.add('hidden');
  const textEl = $('#dlg-text');
  if (textEl) textEl.textContent = '';

  return new Promise((resolve) => {
    dlg.lineResolve = resolve;
    startTyping();
  });
}

function startTyping() {
  if (dlg.timer) clearInterval(dlg.timer);
  const speed = state.settings.textSpeed || 1;
  const delay = Math.max(8, 17 / speed);
  dlg.timer = setInterval(() => {
    dlg.index += 1;
    const textEl = $('#dlg-text');
    if (textEl) textEl.textContent = dlg.visibleText.slice(0, dlg.index);
    if (dlg.index >= dlg.visibleText.length) completeTyping();
  }, delay);
}

function completeTyping() {
  if (!dlg.typing) return;
  if (dlg.timer) { clearInterval(dlg.timer); dlg.timer = null; }
  dlg.typing = false;
  const textEl = $('#dlg-text');
  if (textEl) textEl.innerHTML = dlg.fullText;
  if (!dlg.choiceResolve) setContinueCue(true);
}

export function advanceDialogue() {
  if (!dlg.open || !dlg.lineResolve) return false;
  if (dlg.choiceResolve) return false;
  if (dlg.typing) {
    dlg.index = dlg.visibleText.length;
    completeTyping();
    return true;
  }
  setContinueCue(false);
  const resolve = dlg.lineResolve;
  dlg.lineResolve = null;
  resolve();
  return true;
}

export function closeDialogue() {
  if (dlg.timer) { clearInterval(dlg.timer); dlg.timer = null; }
  dlg.typing = false;
  dlg.open = false;
  dlg.lineResolve = null;
  dlg.choiceResolve = null;
  dlg.choices = [];
  $('#dialogue')?.classList.add('hidden');
  setContinueCue(false);
  $('#dlg-choices')?.classList.add('hidden');
}

export function choose(options) {
  const usable = (options || []).filter((o) => !o.when || o.when(state));
  return new Promise((resolve) => {
    dlg.open = true;
    dlg.keyed = 0;
    dlg.choices = usable;
    // A choice often follows the final line of a say() block, which closes the
    // dialogue frame. Bring it back so the options are visible and clickable.
    $('#dialogue')?.classList.remove('hidden');
    dlg.typing = false;
    const wrap = $('#dlg-choices');
    if (!wrap) { resolve(usable[0]?.key ?? 0); return; }
    wrap.innerHTML = usable.map((o, i) => (
      `<button class="choice" data-index="${i}"><span class="num">${i + 1}</span><span>${fmt(o.text)}</span></button>`
    )).join('');
    wrap.classList.remove('hidden');
    setContinueCue(false);
    wrap.querySelectorAll('.choice').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pickChoice(Number(btn.dataset.index));
      });
    });
    dlg.choiceResolve = (idx) => {
      const chosen = usable[idx];
      wrap.classList.add('hidden');
      dlg.choiceResolve = null;
      dlg.choices = [];
      resolve(chosen?.key ?? chosen?.text ?? idx);
    };
  });
}

function pickChoice(index) {
  if (!dlg.choiceResolve) return;
  const fn = dlg.choiceResolve;
  dlg.choiceResolve = null;
  safeSound('click');
  fn(index);
}

function onDialogueKey(e) {
  if (!dlg.open) return;
  const k = e.key;
  if (dlg.choiceResolve) {
    if (/^[1-9]$/.test(k)) {
      const idx = Number(k) - 1;
      if (dlg.choices[idx]) {
        e.preventDefault();
        e.stopImmediatePropagation();
        pickChoice(idx);
      }
      return;
    }
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      e.stopImmediatePropagation();
      dlg.keyed = (dlg.keyed + (k === 'ArrowDown' ? 1 : -1) + dlg.choices.length) % dlg.choices.length;
      document.querySelectorAll('#dlg-choices .choice').forEach((b, i) => b.classList.toggle('keyed', i === dlg.keyed));
      return;
    }
    if (k === 'e' || k === 'E' || k === 'Enter' || k === ' ') {
      e.preventDefault();
      e.stopImmediatePropagation();
      pickChoice(dlg.keyed);
      return;
    }
    return;
  }
  if (k === 'e' || k === 'E' || k === 'Enter' || k === ' ') {
    e.preventDefault();
    e.stopImmediatePropagation();
    advanceDialogue();
  }
}

// ---------------------------------------------------------------
// HUD, toasts, fades, location
// ---------------------------------------------------------------
export function showHUD() { $('#hud')?.classList.remove('hidden'); }
export function hideHUD() { $('#hud')?.classList.add('hidden'); }

export function setPlace(name, sub) {
  if ($('#hud-place')) $('#hud-place').textContent = name;
  if ($('#hud-sub')) $('#hud-sub').textContent = sub;
}

export function refreshHUD({ announce = true } = {}) {
  const objective = getObjective();
  const el = $('#hud-objective');
  if (el) el.textContent = objective;
  if (announce && state.started && objective !== lastObjective && !state.flags.finished) {
    showObjectiveToast(objective);
  }
  lastObjective = objective;
}

export function resetObjectiveTracking() {
  lastObjective = getObjective();
  const el = $('#hud-objective');
  if (el) el.textContent = lastObjective;
}

export function showObjectiveToast(text) {
  const box = $('#objective-toast');
  const el = $('#objective-toast-text');
  if (!box || !el) return;
  el.textContent = text;
  box.classList.remove('hidden');
  requestAnimationFrame(() => box.classList.add('show'));
  if (objectiveTimer) clearTimeout(objectiveTimer);
  objectiveTimer = setTimeout(() => {
    box.classList.remove('show');
    setTimeout(() => box.classList.add('hidden'), 500);
  }, 4300);
}

export function toast(kicker, title, icon = 'sparkle') {
  const wrap = $('#toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-icon">${glyph(icon)}</span><span class="toast-body"><span class="toast-kicker">${esc(kicker)}</span><span class="toast-title">${esc(title)}</span></span>`;
  wrap.appendChild(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3800);
}

export function setPrompt(label) {
  const p = $('#interact-prompt');
  if (!p) return;
  if (!label) { p.classList.add('hidden'); return; }
  p.classList.remove('hidden');
  const l = $('#prompt-label');
  if (l) l.textContent = label;
}

export function fadeOut(ms = 550) {
  $('#fade')?.classList.add('black');
  return wait(ms);
}
export function fadeIn(ms = 700) {
  $('#fade')?.classList.remove('black');
  return wait(ms);
}

export function locationCard(name, sub, hold = 2600) {
  const card = $('#location-card');
  if (!card) return;
  $('#location-name').textContent = name;
  $('#location-sub').textContent = sub;
  card.classList.remove('hidden');
  requestAnimationFrame(() => card.classList.add('show'));
  if (locationTimer) clearTimeout(locationTimer);
  locationTimer = setTimeout(() => {
    card.classList.remove('show');
    setTimeout(() => card.classList.add('hidden'), 900);
  }, hold);
}

export async function curtain(lines, { hold = 1900, gap = 550 } = {}) {
  const el = $('#curtain');
  const text = $('#curtain-line');
  if (!el || !text) return;
  el.style.opacity = '1';
  el.classList.remove('hidden');
  for (const line of lines) {
    text.textContent = line;
    text.classList.remove('show');
    void text.offsetWidth;
    text.classList.add('show');
    await wait(hold);
    text.classList.remove('show');
    await wait(gap);
  }
  el.style.opacity = '0';
  await wait(1100);
  el.classList.add('hidden');
}

// ---------------------------------------------------------------
// Journal
// ---------------------------------------------------------------
export function openJournal(tab = 'case') {
  if (dlg.open || inspectOpen || evidenceOpen || pauseOpen || endingOpen) return;
  journalOpen = true;
  selectedThreads = [];
  previousFocus = document.activeElement;
  const overlay = $('#journal');
  overlay?.classList.remove('hidden');
  document.querySelectorAll('#journal .tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('#journal .tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tab));
  renderJournal();
  safeSound('paper');
  setTimeout(() => $('#journal-close')?.focus(), 60);
}

export function closeJournal() {
  if (!journalOpen) return;
  journalOpen = false;
  $('#journal')?.classList.add('hidden');
  selectedThreads = [];
  if (previousFocus && previousFocus.focus) { try { previousFocus.focus(); } catch { /* noop */ } }
}

export function isJournalOpen() { return journalOpen; }

function currentTab() {
  return document.querySelector('#journal .tab.active')?.dataset.tab || 'case';
}

export function renderJournal() {
  if (!journalOpen) return;
  const tab = currentTab();
  if (tab === 'case') renderCase();
  else if (tab === 'threads') renderThreads();
  else if (tab === 'people') renderPeople();
  else renderKeepsakes();
  const clueCount = state.clues.length;
  const threadCount = state.deductions.length;
  const keepCount = state.keepsakes.length;
  if ($('#journal-count')) $('#journal-count').textContent = `${clueCount} clues · ${threadCount} threads · ${keepCount} little things`;
}

function clueListHtml() {
  if (!state.clues.length) {
    return `<p class="case-empty">Nothing yet. The watch is waiting on the counter.</p>`;
  }
  return `<div class="clue-list">${state.clues.map((id) => {
    const c = CLUES[id];
    if (!c) return '';
    return `<div class="clue-item"><span class="clue-icon">${glyph(c.icon)}</span><div><h4>${esc(c.title)}</h4><p>${esc(c.short)}</p><span class="clue-src">${esc(c.source)}</span></div></div>`;
  }).join('')}</div>`;
}

function deductionListHtml() {
  if (!state.deductions.length) return `<p class="thread-empty">No threads tied yet.</p>`;
  return state.deductions.map((id) => {
    const d = DEDUCTIONS[id];
    if (!d) return '';
    return `<div class="deduction"><span class="thread-glyph">${glyph('thread')}</span><div><strong>${esc(d.title)}</strong><br>${esc(d.text)}</div></div>`;
  }).join('');
}

function renderCase() {
  const panel = $('#tab-case');
  if (!panel) return;
  panel.innerHTML = `
    <div class="case-layout">
      <div class="case-object">
        <div class="case-object-visual">${watchGlyphArt()}</div>
        <span class="obj-meta">Object 001 · brass &amp; glass</span>
        <h3>A watch stopped at 8:17</h3>
        <p>For June. 8:17. E. A small thing with a long silence inside it.</p>
        <p class="obj-quote">“Some hours are not for spending. Some are for keeping.”</p>
      </div>
      <div class="case-findings">
        <h3>What you know <span>${state.clues.length} of 12</span></h3>
        <p>Every small thing remembers something.</p>
        ${clueListHtml()}
        <div class="deduction-list">
          <h3>Threads tied <span>${state.deductions.length} of 6</span></h3>
          ${deductionListHtml()}
        </div>
        <div class="case-objective"><b>Tonight</b>${esc(getObjective())}</div>
      </div>
    </div>`;
}

function renderThreads() {
  const panel = $('#tab-threads');
  if (!panel) return;
  const found = state.clues;
  const linked = new Set();
  for (const d of state.deductions) {
    if (DEDUCTIONS[d]) { linked.add(DEDUCTIONS[d].a); linked.add(DEDUCTIONS[d].b); }
  }
  const available = findAvailableDeduction();
  const cards = found.length
    ? found.map((id) => {
      const c = CLUES[id];
      if (!c) return '';
      const sel = selectedThreads.includes(id) ? ' selected' : '';
      const link = linked.has(id) ? ' linked' : '';
      return `<button class="clue-card${sel}${link}" data-clue="${id}"><span class="cc-kicker">${esc(c.source)}</span><span class="cc-title">${esc(c.title)}</span></button>`;
    }).join('')
    : `<p class="thread-empty">Find a few clues first. Threads need things to tie together.</p>`;

  panel.innerHTML = `
    <div class="threads-wrap">
      <div class="thread-board">
        <svg class="thread-svg" aria-hidden="true"></svg>
        <div class="thread-help"><span class="pulse-dot"></span>Choose two cards that belong together.</div>
        <div class="thread-cards">${cards}</div>
        <div class="thread-note" id="thread-note"></div>
      </div>
      <aside class="thread-side">
        <h3>Threads</h3>
        <p>Truths need to be seen together.</p>
        <div class="deduction-list">${deductionListHtml()}</div>
        ${available ? `<button class="thread-hint">Show me a thread</button>` : ''}
      </aside>
    </div>`;
  requestAnimationFrame(drawThreads);
}

function findAvailableDeduction() {
  for (const [id, d] of Object.entries(DEDUCTIONS)) {
    if (hasDeduction(id)) continue;
    if (hasClue(d.a) && hasClue(d.b)) return { id, ...d };
  }
  return null;
}

function toggleThread(clueId) {
  if (selectedThreads.includes(clueId)) {
    selectedThreads = selectedThreads.filter((id) => id !== clueId);
  } else {
    if (selectedThreads.length >= 2) selectedThreads = [];
    selectedThreads.push(clueId);
  }
  document.querySelectorAll('#tab-threads .clue-card').forEach((card) => {
    card.classList.toggle('selected', selectedThreads.includes(card.dataset.clue));
  });
  drawThreads();
  if (selectedThreads.length === 2) attemptTie();
}

function attemptTie() {
  if (selectedThreads.length !== 2) return;
  const [a, b] = selectedThreads;
  const entry = Object.entries(DEDUCTIONS).find(([id, d]) => (
    !hasDeduction(id) && ((d.a === a && d.b === b) || (d.a === b && d.b === a))
  ));
  if (entry) {
    const [id, d] = entry;
    addDeduction(id);
    saveState();
    selectedThreads = [];
    safeSound('warm');
    toast('A thread tied', d.title, 'thread');
    if (id === 'keeperIsJune') {
      setTimeout(() => toast('The cliff path', 'The lighthouse is waiting at the end of the path.', 'lighthouse'), 450);
    }
    if (state.flags.finalReady) {
      setTimeout(() => toast('Every thread', 'You know what happened. Now decide what the watch should be.', 'watch'), 900);
    }
    renderJournal();
    refreshHUD();
    hooks.onTie?.(id);
  } else {
    const board = document.querySelector('.thread-board');
    board?.classList.add('thread-shake');
    showThreadNote('These two don’t touch. Try another pair.');
    safeSound('click');
    setTimeout(() => {
      board?.classList.remove('thread-shake');
      selectedThreads = [];
      document.querySelectorAll('#tab-threads .clue-card.selected').forEach((c) => c.classList.remove('selected'));
      drawThreads();
    }, 650);
  }
}

function useThreadHint() {
  const found = findAvailableDeduction();
  if (!found) return;
  selectedThreads = [found.a, found.b];
  document.querySelectorAll('#tab-threads .clue-card').forEach((card) => {
    card.classList.toggle('selected', selectedThreads.includes(card.dataset.clue));
  });
  drawThreads();
  showThreadNote('Try these two together.');
  setTimeout(attemptTie, 420);
}

function showThreadNote(message) {
  const note = $('#thread-note');
  if (!note) return;
  note.textContent = message;
  note.classList.add('show');
  if (threadNoteTimer) clearTimeout(threadNoteTimer);
  threadNoteTimer = setTimeout(() => note.classList.remove('show'), 1900);
}

function drawThreads() {
  if (!journalOpen) return;
  const board = document.querySelector('.thread-board');
  const cards = document.querySelector('.thread-cards');
  const svg = document.querySelector('.thread-svg');
  if (!board || !cards || !svg) return;
  svg.innerHTML = '';
  const pos = (id) => {
    const el = cards.querySelector(`[data-clue="${id}"]`);
    if (!el) return null;
    return {
      x: el.offsetLeft + cards.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + cards.offsetTop + 4
    };
  };
  const lines = [];
  for (const dId of state.deductions) {
    const d = DEDUCTIONS[dId];
    if (!d) continue;
    const a = pos(d.a), b = pos(d.b);
    if (a && b) lines.push({ a, b, strong: true });
  }
  if (selectedThreads.length === 2) {
    const a = pos(selectedThreads[0]), b = pos(selectedThreads[1]);
    if (a && b) lines.push({ a, b, strong: false });
  }
  for (const line of lines) {
    const midX = (line.a.x + line.b.x) / 2;
    const sag = Math.abs(line.a.x - line.b.x) * 0.1 + 8;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${line.a.x} ${line.a.y} Q ${midX} ${(line.a.y + line.b.y) / 2 + sag} ${line.b.x} ${line.b.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', line.strong ? 'rgba(176,70,52,.8)' : 'rgba(232,176,106,.85)');
    path.setAttribute('stroke-width', line.strong ? '1.7' : '1.2');
    path.setAttribute('stroke-dasharray', line.strong ? 'none' : '3 3');
    svg.appendChild(path);
    for (const p of [line.a, line.b]) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', '2.2');
      dot.setAttribute('fill', line.strong ? '#a85a42' : '#e8b06a');
      svg.appendChild(dot);
    }
  }
}

function renderPeople() {
  const panel = $('#tab-people');
  if (!panel) return;
  const list = Object.entries(PEOPLE).map(([id, p]) => {
    const unlocked = typeof p.unlock === 'function' ? p.unlock(state) : true;
    return { id, p, unlocked };
  });
  panel.innerHTML = `
    <div class="people-grid">
      ${list.map(({ id, p, unlocked }) => {
        if (!unlocked) {
          return `<div class="person-card locked">
            <div class="person-portrait"><canvas width="128" height="128" data-person="${id}"></canvas></div>
            <div><span class="person-role">an untold story</span><h4>Someone you haven’t met</h4><p>Keep looking. Ember Hollow is small, but it keeps its people close.</p></div>
          </div>`;
        }
        const bio = typeof p.bio === 'function' ? p.bio(state) : p.bio;
        return `<div class="person-card">
          <div class="person-portrait"><canvas width="128" height="128" data-person="${p.portrait}"></canvas></div>
          <div><span class="person-role">${esc(p.role)}</span><h4>${esc(p.name)}</h4><p>${esc(bio)}</p></div>
        </div>`;
      }).join('')}
    </div>`;
  panel.querySelectorAll('canvas[data-person]').forEach((canvas) => {
    try { drawPortrait(canvas, canvas.dataset.person); } catch { /* noop */ }
  });
}

function renderKeepsakes() {
  const panel = $('#tab-keepsakes');
  if (!panel) return;
  panel.innerHTML = `
    <p class="keepsake-progress">${state.keepsakes.length} of ${Object.keys(KEEPSAKES).length} small things found.</p>
    <div class="keepsakes-grid">
      ${Object.entries(KEEPSAKES).map(([id, k]) => {
        const has = state.keepsakes.includes(id);
        return `<div class="keepsake-card${has ? '' : ' locked'}">
          <div class="keepsake-glyph">${glyph(has ? k.glyph : 'lock')}</div>
          <h4>${has ? esc(k.title) : 'A small thing'}</h4>
          <p>${has ? esc(k.text) : 'Still waiting somewhere in Ember Hollow.'}</p>
          ${has ? `<span class="keepsake-where">${esc(k.where)}</span>` : ''}
        </div>`;
      }).join('')}
    </div>
    <p class="keepsake-note">The shop is full of them, if you look.</p>`;
}

// ---------------------------------------------------------------
// Watch inspection
// ---------------------------------------------------------------
export function openInspect() {
  if (dlg.open || !state.flags.maraGaveWatch) return Promise.resolve();
  inspectOpen = true;
  inspectView = 'front';
  previousFocus = document.activeElement;
  const overlay = $('#inspect');
  overlay?.classList.remove('hidden');
  renderInspect(true);
  safeSound('click');
  setTimeout(() => $('#inspect-close')?.focus(), 60);
  return new Promise((resolve) => { inspectResolve = resolve; });
}

export function closeInspect() {
  if (!inspectOpen) return;
  inspectOpen = false;
  $('#inspect')?.classList.add('hidden');
  const resolve = inspectResolve;
  inspectResolve = null;
  refreshHUD();
  resolve?.({ foundAll: state.flags.watchInspected });
  if (previousFocus && previousFocus.focus) { try { previousFocus.focus(); } catch { /* noop */ } }
}

export function isInspectOpen() { return inspectOpen; }

function noticeWatchDetail(detailId) {
  const detail = WATCH_DETAILS.find((d) => d.id === detailId);
  if (!detail) return;
  const isNew = !hasClue(detail.clue);
  if (isNew) {
    const clue = addClue(detail.clue);
    if (clue) {
      toast('Clue noted', clue.title, CLUES[detail.clue]?.icon || 'watch');
      safeSound('paper');
    }
  }
  const caption = $('#inspect-caption');
  if (caption) caption.textContent = detail.caption;
  if (isNew) {
    const all = WATCH_DETAILS.every((d) => hasClue(d.clue));
    if (all && !state.flags.watchInspected) {
      state.flags.watchInspected = true;
      state.flags.watchedAll = true;
      saveState();
      setTimeout(() => {
        toast('The watch, understood', 'Four details. One stopped hour. Someone meant all of this.', 'watch');
        safeSound('warm');
      }, 380);
    }
    refreshHUD();
  }
  renderInspect(false);
  drawInspectDetails();
}

function drawInspectDetails() {
  const found = WATCH_DETAILS.filter((d) => hasClue(d.clue)).length;
  const fill = $('#inspect-progress-fill');
  if (fill) fill.style.width = `${(found / WATCH_DETAILS.length) * 100}%`;
  const label = $('#inspect-progress-label');
  if (label) label.textContent = `${found} of ${WATCH_DETAILS.length} details noticed`;
  const list = $('#inspect-details');
  if (list) {
    list.innerHTML = WATCH_DETAILS.map((d) => {
      const has = hasClue(d.clue);
      return `<li class="${has ? 'found' : ''}"><span class="found-mark">${has ? '✓' : '·'}</span><span>${has ? esc(d.label) : 'A detail you have not found yet'}</span></li>`;
    }).join('');
  }
}

function renderInspect(animate) {
  const wrap = $('#watch-svg-wrap');
  if (!wrap) return;
  const viewDetails = {
    front: ['wool'],
    back: ['engraving'],
    movement: ['maker', 'heartstop']
  }[inspectView] || [];
  const buttons = WATCH_DETAILS.filter((d) => viewDetails.includes(d.id)).map((d) => {
    const found = hasClue(d.clue);
    return `<button class="watch-hotspot${found ? ' found' : ''}" style="left:${d.hotspot.x}%;top:${d.hotspot.y}%" data-detail="${d.id}" aria-label="${esc(d.label)}">${glyph(found ? 'sparkle' : 'watch')}</button>`;
  }).join('');
  wrap.innerHTML = `<div class="${animate ? 'watch-view' : ''}">${watchSvg(inspectView)}</div>${buttons}`;
  drawInspectDetails();

  const flip = $('#watch-flip');
  const openBtn = $('#watch-open');
  if (flip) {
    flip.textContent = inspectView === 'movement' ? 'Turn it over' : (inspectView === 'back' ? 'Turn it back' : 'Turn it over');
    flip.classList.toggle('hidden', inspectView === 'movement');
  }
  if (openBtn) {
    openBtn.textContent = inspectView === 'movement' ? 'Close the case back' : 'Open the case back';
    openBtn.classList.toggle('hidden', inspectView === 'front');
  }
  const caption = $('#inspect-caption');
  if (caption && !WATCH_DETAILS.some((d) => hasClue(d.clue))) {
    caption.textContent = 'Click the small glints on the watch. Look closely.';
  }
}

function watchSvg(view) {
  const tickMarks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = 137;
    const r2 = major ? 124 : 130;
    return `<line x1="${200 + Math.cos(a) * r1}" y1="${200 + Math.sin(a) * r1}" x2="${200 + Math.cos(a) * r2}" y2="${200 + Math.sin(a) * r2}" stroke="${major ? '#58432c' : 'rgba(88,67,44,.46)'}" stroke-width="${major ? 2 : .8}"/>`;
  }).join('');
  const numerals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const n = i === 0 ? 12 : i;
    return `<text x="${200 + Math.cos(a) * 103}" y="${200 + Math.sin(a) * 103 + 4}" text-anchor="middle" font-family="Fraunces,serif" font-size="14" fill="#4f3b27">${n}</text>`;
  }).join('');

  const bezel = `
    <defs>
      <radialGradient id="brass" cx="42%" cy="36%" r="65%">
        <stop offset="0" stop-color="#f0d29a"/><stop offset=".38" stop-color="#c79a58"/>
        <stop offset=".72" stop-color="#8f6634"/><stop offset="1" stop-color="#4b321c"/>
      </radialGradient>
      <radialGradient id="dial" cx="46%" cy="40%" r="64%">
        <stop offset="0" stop-color="#fbf1d8"/><stop offset=".72" stop-color="#ead8b2"/><stop offset="1" stop-color="#c8ad7d"/>
      </radialGradient>
      <radialGradient id="glass" cx="38%" cy="30%" r="65%">
        <stop offset="0" stop-color="rgba(255,255,255,.38)"/><stop offset=".5" stop-color="rgba(255,255,255,.05)"/><stop offset="1" stop-color="rgba(30,20,12,.08)"/>
      </radialGradient>
      <linearGradient id="brassEdge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4dca7"/><stop offset=".45" stop-color="#b48545"/><stop offset="1" stop-color="#5d3e20"/>
      </linearGradient>
      <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dfe2dd"/><stop offset=".5" stop-color="#88918f"/><stop offset="1" stop-color="#4a5555"/>
      </linearGradient>
    </defs>`;

  const caseOutline = `
    <circle cx="200" cy="200" r="168" fill="url(#brass)"/>
    <circle cx="200" cy="200" r="163" fill="none" stroke="rgba(255,238,196,.35)" stroke-width="1"/>
    <circle cx="200" cy="200" r="152" fill="none" stroke="rgba(70,45,20,.5)" stroke-width="2"/>
    <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(255,235,190,.22)" stroke-width="1"/>
    <g transform="translate(200 26)">
      <rect x="-13" y="-14" width="26" height="18" rx="5" fill="url(#brassEdge)" stroke="#4d321b" stroke-width="1"/>
      <rect x="-16" y="1" width="32" height="7" rx="3" fill="#7e592e"/>
      <circle cx="0" cy="-23" r="13" fill="none" stroke="url(#brassEdge)" stroke-width="6"/>
    </g>`;

  if (view === 'front') {
    return `<svg viewBox="0 0 400 400" role="img" aria-label="The front of a brass pocket watch, stopped at 8:17">
      ${bezel}
      ${caseOutline}
      <circle cx="200" cy="200" r="142" fill="url(#dial)" stroke="#6b4c28" stroke-width="2.5"/>
      ${tickMarks}${numerals}
      <g stroke="#3e2d1c" stroke-linecap="round">
        <line x1="200" y1="200" x2="200" y2="125" stroke-width="6" transform="rotate(248.5 200 200)"/>
        <line x1="200" y1="200" x2="200" y2="92" stroke-width="3.2" transform="rotate(102 200 200)"/>
      </g>
      <circle cx="200" cy="200" r="5" fill="#43301d"/>
      <circle cx="200" cy="200" r="2" fill="#c9a86a"/>
      <circle cx="200" cy="292" r="32" fill="rgba(80,55,30,.06)" stroke="rgba(80,55,30,.25)" stroke-width="1"/>
      <text x="200" y="286" text-anchor="middle" font-family="Karla,sans-serif" font-size="7" letter-spacing="1.5" fill="#6d5437">VOSS &amp; SONS</text>
      <circle cx="200" cy="302" r="2.2" fill="#5d452b"/>
      <path d="M230 350 C 260 370, 300 376, 338 350 C 356 338, 350 318, 332 324 C 314 330, 318 350, 338 352" fill="none" stroke="#a88952" stroke-width="3" stroke-linecap="round"/>
      <circle cx="200" cy="200" r="146" fill="url(#glass)"/>
      <ellipse cx="160" cy="150" rx="60" ry="34" fill="rgba(255,255,255,.13)" transform="rotate(-34 160 150)"/>
    </svg>`;
  }
  if (view === 'back') {
    return `<svg viewBox="0 0 400 400" role="img" aria-label="The engraved back of the pocket watch">
      ${bezel}
      ${caseOutline}
      <circle cx="200" cy="200" r="142" fill="url(#brassEdge)" stroke="#60411f" stroke-width="2.5"/>
      <circle cx="200" cy="200" r="132" fill="none" stroke="rgba(70,45,20,.45)" stroke-width="1"/>
      <circle cx="200" cy="200" r="124" fill="none" stroke="rgba(255,235,190,.3)" stroke-width=".8"/>
      ${Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const x = 200 + Math.cos(a) * 133;
        const y = 200 + Math.sin(a) * 133;
        return `<ellipse cx="${x}" cy="${y}" rx="8" ry="3.4" fill="rgba(86,56,26,.48)" transform="rotate(${(a * 180 / Math.PI) + 90} ${x} ${y})"/>`;
      }).join('')}
      <g font-family="Fraunces, serif" fill="#4a311b" text-anchor="middle">
        <text x="200" y="172" font-size="18" font-style="italic">For June.</text>
        <text x="200" y="212" font-size="28" letter-spacing="4">8:17</text>
        <text x="200" y="248" font-size="18" font-style="italic">E.</text>
      </g>
      <path d="M138 146 C 160 132, 176 146, 194 138 M262 146 C 240 132, 224 146, 206 138" fill="none" stroke="rgba(75,48,22,.4)" stroke-width="1.2"/>
      <path d="M138 258 C 160 272, 176 258, 194 266 M262 258 C 240 272, 224 258, 206 266" fill="none" stroke="rgba(75,48,22,.4)" stroke-width="1.2"/>
      <circle cx="200" cy="200" r="146" fill="url(#glass)" opacity=".4"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 400 400" role="img" aria-label="The movement inside the pocket watch">
    ${bezel}
    ${caseOutline}
    <circle cx="200" cy="200" r="142" fill="#3a2a18" stroke="#694a27" stroke-width="2.5"/>
    <circle cx="200" cy="200" r="132" fill="none" stroke="rgba(230,195,135,.2)" stroke-width="1"/>
    <g opacity=".95">
      ${[0, 1, 2, 3].map((i) => {
        const x = [142, 252, 215, 166][i];
        const y = [158, 160, 260, 254][i];
        const r = [34, 27, 38, 22][i];
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#c59c5b" stroke-width="2.4"/>
          <circle cx="${x}" cy="${y}" r="${r - 9}" fill="none" stroke="rgba(197,156,91,.45)" stroke-width="1"/>
          ${Array.from({ length: 12 }, (_, j) => {
            const a = (j / 12) * Math.PI * 2;
            return `<line x1="${x + Math.cos(a) * (r - 2)}" y1="${y + Math.sin(a) * (r - 2)}" x2="${x + Math.cos(a) * (r + 5)}" y2="${y + Math.sin(a) * (r + 5)}" stroke="#c59c5b" stroke-width="3"/>`;
          }).join('')}
          <circle cx="${x}" cy="${y}" r="3" fill="#7e5a2f"/>`;
      }).join('')}
      <path d="M110 196 C 140 180, 168 196, 196 184 C 222 172, 250 190, 286 176" fill="none" stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>
      <path d="M126 230 C 152 214, 184 230, 210 218 C 236 206, 262 222, 290 210" fill="none" stroke="#8b7348" stroke-width="4" stroke-linecap="round"/>
      <circle cx="220" cy="216" r="20" fill="none" stroke="#d5d8d1" stroke-width="3"/>
      <circle cx="220" cy="216" r="13" fill="none" stroke="rgba(220,225,218,.45)" stroke-width="1"/>
      <path d="M150 208 L 196 208 L 206 196 L 188 186 L 146 192 Z" fill="rgba(210,214,206,.38)" stroke="#cfd4cc" stroke-width="1.2"/>
      <path d="M168 250 L 206 262" stroke="#b98946" stroke-width="3" stroke-linecap="round"/>
      <circle cx="170" cy="249" r="4" fill="#e0b46c"/>
      <text x="200" y="318" text-anchor="middle" font-family="Karla,sans-serif" font-size="7" letter-spacing="2" fill="rgba(232,204,157,.72)">VOSS &amp; SONS · 1962</text>
    </g>
    <circle cx="200" cy="200" r="146" fill="url(#glass)" opacity=".22"/>
  </svg>`;
}

function watchGlyphArt() {
  return `<svg viewBox="0 0 400 400" aria-hidden="true">
    <defs><radialGradient id="jbrass" cx="42%" cy="36%" r="65%"><stop offset="0" stop-color="#f0d29a"/><stop offset=".4" stop-color="#c79a58"/><stop offset=".74" stop-color="#8f6634"/><stop offset="1" stop-color="#4b321c"/></radialGradient>
    <radialGradient id="jdial" cx="46%" cy="40%" r="64%"><stop offset="0" stop-color="#fbf1d8"/><stop offset=".72" stop-color="#ead8b2"/><stop offset="1" stop-color="#c8ad7d"/></radialGradient></defs>
    <circle cx="200" cy="204" r="168" fill="url(#jbrass)"/>
    <circle cx="200" cy="204" r="146" fill="url(#jdial)" stroke="#6b4c28" stroke-width="2.5"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return `<circle cx="${200 + Math.cos(a) * 112}" cy="${204 + Math.sin(a) * 112}" r="2.2" fill="#7b6040"/>`;
    }).join('')}
    <g stroke="#3e2d1c" stroke-linecap="round">
      <line x1="200" y1="204" x2="200" y2="130" stroke-width="6" transform="rotate(248.5 200 204)"/>
      <line x1="200" y1="204" x2="200" y2="98" stroke-width="3" transform="rotate(102 200 204)"/>
    </g>
    <circle cx="200" cy="204" r="5" fill="#43301d"/>
    <g transform="translate(200 30)"><rect x="-13" y="-12" width="26" height="18" rx="5" fill="#a8793f"/><circle cx="0" cy="-21" r="13" fill="none" stroke="#a8793f" stroke-width="6"/></g>
    <path d="M236 356 C 268 376, 306 380, 342 352" fill="none" stroke="#a88952" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

// ---------------------------------------------------------------
// Evidence / documents
// ---------------------------------------------------------------
export function openEvidence(kind) {
  const data = EVIDENCE[kind];
  if (!data || dlg.open) return false;
  evidenceOpen = true;
  const overlay = $('#evidence');
  overlay?.classList.remove('hidden');
  const body = $('#evidence-body');
  if (body) body.innerHTML = evidenceHtml(kind, data);
  const added = addClue(data.clue);
  if (added) {
    toast('Clue noted', CLUES[data.clue]?.title || data.title, CLUES[data.clue]?.icon || 'letter');
    refreshHUD();
  }
  const clueEl = $('#evidence-clue');
  if (clueEl) {
    const c = CLUES[data.clue];
    clueEl.innerHTML = c ? `<b>${added ? 'New clue' : 'In your journal'}</b>${esc(c.title)}` : '';
  }
  if (data.kind === 'photo') {
    const canvas = body?.querySelector('canvas[data-photo]');
    if (canvas) { try { drawPhoto(canvas.getContext('2d')); } catch { /* noop */ } }
  }
  safeSound('paper');
  setTimeout(() => $('#evidence-close')?.focus(), 60);
  return true;
}

export function closeEvidence() {
  if (!evidenceOpen) return;
  evidenceOpen = false;
  $('#evidence')?.classList.add('hidden');
  refreshHUD();
}

export function isEvidenceOpen() { return evidenceOpen; }

function evidenceHtml(kind, data) {
  const head = `<div class="ev-head"><div><span class="book-kicker">${kind === 'photo' ? 'Photograph' : 'Document'}</span><h2>${data.title}</h2></div><div class="ev-meta">${data.meta}</div></div><p class="ev-lede">${data.lede}</p>`;
  if (kind === 'photo') {
    return `${head}<div class="ev-photo-frame"><canvas data-photo width="900" height="540"></canvas></div><p class="ev-photo-caption">June Alder, autumn 1961. The night the clocks were slow.</p>`;
  }
  if (kind === 'ledger') {
    const rows = [
      ['02 Mar', 'Longcase, Mrs. Pyle. New suspension spring. Pine.', false],
      ['18 Jun', 'Station clock. Regulate. The platform runs four minutes fast.', false],
      ['14 Oct', 'J.A.’s watch. Fit heart-stop at 8:17. She asked me to keep this hour, whatever happens. <span class="hand">— E.V.</span>', true],
      ['21 Oct', 'Weather turning. Sea in the locks again.', false],
      ['04 Nov', 'Ordered brass. Will not need it now.', false]
    ];
    return `${head}<div class="ev-ledger"><div class="ev-ledger-head"><span>Voss &amp; Sons · repairs</span><span>1961 – 1962</span></div>${rows.map(([d, t, hi]) => `<div class="ev-ledger-row${hi ? ' highlight' : ''}"><span class="date">${d}</span><span class="${hi ? '' : ''}">${t}</span></div>`).join('')}</div><div class="ev-stamp">VOSS &amp; SONS · EMBER HOLLOW</div>`;
  }
  if (kind === 'timetable') {
    const rows = [
      ['6:40', 'Coastal local', 'to Wrenmouth'],
      ['7:05', 'Market service', 'to Bellhaven'],
      ['7:32', 'Coastal local', 'to Wrenmouth'],
      ['8:17', 'Last evening service', 'to the coast']
    ];
    return `${head}<div class="ev-timetable"><h3>Ember Hollow &amp; Coastal Railway</h3><div class="tt-sub">Departures · autumn 1962</div>${rows.map(([t, n, d], i) => `<div class="tt-row${i === 3 ? ' last' : ''}"><span>${n}</span><span class="tt-time">${t}</span><span>${d}</span></div>`).join('')}<p class="tt-note">Last train of the evening — 8:17</p></div>`;
  }
  if (kind === 'log') {
    const rows = [
      ['8:02', 'Downpour. Platform lamps lit early.', 'A. Bell'],
      ['8:17', '8:17 service delayed four minutes. Passenger E. Voss boarded.', 'A. Bell'],
      ['8:21', 'Platform empty at 8:21. Rain.', 'A. Bell'],
      ['8:26', 'Service departed. Line closed to passengers at 9:10.', 'A. Bell']
    ];
    return `${head}<div class="ev-log">${rows.map(([t, n, w], i) => `<div class="ev-log-row${i === 1 || i === 2 ? ' special' : ''}"><span>${t}</span><span class="hand">${n}</span><span>${w}</span></div>`).join('')}</div>`;
  }
  if (kind === 'letter') {
    return `${head}<div class="ev-letter">
      <p class="salutation">Dear June,</p>
      <p>You asked me to tell him you weren’t coming. I did.</p>
      <p>I did not tell you that he waited until the guard pulled him aboard. I did not tell you he left something for you. I have kept it. I am sorry.</p>
      <p class="signature">— A.</p>
      <p style="font-size:11px;letter-spacing:.14em;color:#9d7954;font-family:Karla,sans-serif;text-transform:uppercase;">Ember Hollow Station · never sent</p>
    </div>`;
  }
  return head;
}

// ---------------------------------------------------------------
// Pause
// ---------------------------------------------------------------
export function openPause() {
  if (dlg.open || inspectOpen || evidenceOpen || journalOpen || galleryOpen || endingOpen) return;
  pauseOpen = true;
  $('#pause')?.classList.remove('hidden');
  updateSettingsLabels();
  safeSound('click');
}

export function closePause() {
  if (!pauseOpen) return;
  pauseOpen = false;
  $('#pause')?.classList.add('hidden');
}

export function isPauseOpen() { return pauseOpen; }

function updateSettingsLabels() {
  const s = $('#pause-sound');
  if (s) s.textContent = `Sound: ${state.settings.muted ? 'off' : 'on'}`;
  const m = $('#pause-motion');
  if (m) m.textContent = `Gentle motion: ${state.settings.gentleMotion ? 'on' : 'off'}`;
}

// ---------------------------------------------------------------
// Ending gallery
// ---------------------------------------------------------------
export function openEndings() {
  galleryOpen = true;
  const overlay = $('#endings');
  const grid = $('#endings-grid');
  const meta = loadMeta();
  if (grid) {
    grid.innerHTML = Object.entries(ENDINGS).map(([key, e], i) => {
      const found = meta.endings.includes(key);
      if (!found) {
        return `<div class="ending-tile locked"><span class="et-num">Hour ${i + 1} · not yet kept</span><h3>An unopened hour</h3><p>Some endings are still waiting in the rain.</p><span class="et-lock">${glyph('lock')}</span></div>`;
      }
      return `<div class="ending-tile"><span class="et-num">Hour ${i + 1} · ${esc(e.kicker)}</span><h3>${esc(e.title)}</h3><p>${esc(e.short)}</p><span class="et-glyph">${glyph(e.glyph)}</span></div>`;
    }).join('');
    if (meta.endings.length === Object.keys(ENDINGS).length) {
      grid.insertAdjacentHTML('afterend', '<p class="endings-all">Every hour kept. The watch is quiet now.</p>');
    } else {
      document.querySelector('.endings-all')?.remove();
    }
  }
  overlay?.classList.remove('hidden');
  safeSound('paper');
}

export function closeEndings() {
  galleryOpen = false;
  $('#endings')?.classList.add('hidden');
  document.querySelector('.endings-all')?.remove();
}

export function isGalleryOpen() { return galleryOpen; }

// ---------------------------------------------------------------
// Ending screen
// ---------------------------------------------------------------
export function showEnding(key) {
  const e = ENDINGS[key];
  if (!e) return;
  endingOpen = true;
  const meta = loadMeta();
  $('#ending-kicker').textContent = `${e.kicker} · ${meta.endings.length} of ${Object.keys(ENDINGS).length}`;
  $('#ending-title').textContent = e.title;
  $('#ending-text').textContent = e.text;
  const shelf = $('#ending-shelf');
  if (shelf) shelf.innerHTML = `<span class="shelf-glyph">${glyph(e.glyph)}</span><span><b>Kept in the shop</b>${esc(e.shelf)}</span>`;
  $('#ending-screen')?.classList.remove('hidden');
  safeSound('warm');
}

export function closeEnding() {
  endingOpen = false;
  $('#ending-screen')?.classList.add('hidden');
}

export function isEndingOpen() { return endingOpen; }

// ---------------------------------------------------------------
// Title
// ---------------------------------------------------------------
let titleHidden = false;

export function updateTitle() {
  const meta = loadMeta();
  const count = $('#ending-count');
  if (count) count.textContent = `${meta.endings.length} / ${Object.keys(ENDINGS).length}`;
  const cont = $('#btn-continue');
  if (!cont) return;
  if (!hasSave()) {
    cont.classList.add('hidden');
    return;
  }
  cont.classList.remove('hidden');
  try {
    const raw = JSON.parse(localStorage.getItem('littlethings.save.v1'));
    const metaTime = formatPlaytime(raw?.playtime || 0);
    const sub = $('#continue-meta');
    if (sub) sub.textContent = raw?.flags?.finished ? '· the shop is open' : `· ${metaTime}`;
  } catch { /* no save metadata */ }
}

export function showTitle({ instant = false } = {}) {
  const el = $('#title-screen');
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.remove('out');
  titleHidden = false;
  updateTitle();
  if (instant) el.style.transition = 'none';
  if (instant) requestAnimationFrame(() => { el.style.transition = ''; });
}

export function hideTitle() {
  const el = $('#title-screen');
  if (!el) return;
  el.classList.add('out');
  titleHidden = true;
  setTimeout(() => { if (titleHidden) el.classList.add('hidden'); }, 1050);
}

export function hideTitleInstant() {
  const el = $('#title-screen');
  if (!el) return;
  titleHidden = true;
  el.classList.add('hidden');
  el.classList.add('out');
}

export function isTitleVisible() {
  const el = $('#title-screen');
  return !!el && !el.classList.contains('hidden');
}

// ---------------------------------------------------------------
// Toast for new clues / keepsakes, used by story
// ---------------------------------------------------------------
export function noteClue(id) {
  const c = CLUES[id];
  if (!c) return;
  toast('Clue noted', c.title, c.icon);
  refreshHUD();
  saveState();
}

export function noteKeepsake(id) {
  const k = KEEPSAKES[id];
  if (!k) return;
  const added = addKeepsake(id);
  if (added) {
    toast('A little thing', k.title, k.glyph);
    refreshHUD();
  }
  return !!added;
}

export function noteStateChange() {
  refreshHUD();
  saveState();
}

// Close whatever interface is on top. Returns true if something closed.
export function closeTop() {
  if (galleryOpen) { closeEndings(); return true; }
  if (endingOpen) { return false; }
  if (evidenceOpen) { closeEvidence(); return true; }
  if (inspectOpen) { closeInspect(); return true; }
  if (pauseOpen) { closePause(); return true; }
  if (journalOpen) { closeJournal(); return true; }
  return false;
}

export { SCENE_INFO };
