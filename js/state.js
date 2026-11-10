import { CLUES, DEDUCTIONS, KEEPSAKES, PEOPLE, OBJECTIVES } from './data.js';

const SAVE_KEY = 'littlethings.save.v1';
const META_KEY = 'littlethings.meta.v1';

const freshFlags = () => ({
  introDone: false,
  maraGaveWatch: false,
  watchInspected: false,
  watchedAll: false,
  talkedMara: false,
  metAlma: false,
  almaJune: false,
  almaKeeper: false,
  almaTea: false,
  metSilas: false,
  silasLedger: false,
  silasMemory: false,
  stationVisited: false,
  hasKey: false,
  keyFound: false,
  letterRead: false,
  arthurKnown: false,
  metJune: false,
  juneConfession: false,
  finalReady: false,
  finished: false,
  postgame: false,
  ending: null,
  boat: false,
  button: false,
  gearKeep: false,
  violet: false,
  glass: false,
  helpedSilas: false
});

const freshState = () => ({
  version: 1,
  started: false,
  scene: 'shop',
  player: { x: 640, y: 548, dir: 'up' },
  flags: freshFlags(),
  clues: [],
  deductions: [],
  keepsakes: [],
  peopleUnlocked: { mara: true },
  visited: { shop: true },
  settings: { muted: false, gentleMotion: false, textSpeed: 1 },
  playtime: 0,
  savedAt: Date.now()
});

export let state = freshState();

export function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { endings: [], watches: 0 };
    const parsed = JSON.parse(raw);
    return { endings: Array.isArray(parsed.endings) ? parsed.endings : [], watches: parsed.watches || 0 };
  } catch {
    return { endings: [], watches: 0 };
  }
}

export function saveMeta(meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch { /* private mode */ }
}

export function recordEnding(key) {
  const meta = loadMeta();
  if (!meta.endings.includes(key)) meta.endings.push(key);
  meta.watches = (meta.watches || 0) + 1;
  saveMeta(meta);
  return meta;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    state = deepMerge(freshState(), parsed);
    state.flags = { ...freshFlags(), ...(parsed.flags || {}) };
    state.settings = { ...freshState().settings, ...(parsed.settings || {}) };
    state.peopleUnlocked = { mara: true, ...(parsed.peopleUnlocked || {}) };
    state.visited = { shop: true, ...(parsed.visited || {}) };
    if (!Array.isArray(state.clues)) state.clues = [];
    if (!Array.isArray(state.deductions)) state.deductions = [];
    if (!Array.isArray(state.keepsakes)) state.keepsakes = [];
    return state;
  } catch {
    return null;
  }
}

function deepMerge(base, patch) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(patch || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function saveState() {
  try {
    state.savedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function hasSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed && parsed.version === 1;
  } catch { return false; }
}

export function resetState({ keepSettings = true } = {}) {
  const oldSettings = { ...state.settings };
  state = freshState();
  if (keepSettings) state.settings = oldSettings;
  saveState();
}

export function hasClue(id) { return state.clues.includes(id); }
export function hasDeduction(id) { return state.deductions.includes(id); }

export function addClue(id, { silent = false } = {}) {
  if (!CLUES[id] || state.clues.includes(id)) return false;
  state.clues.push(id);
  if (id === 'keeper') unlockPerson('june');
  if (id === 'silas') unlockPerson('elias');
  if (id === 'letter') { state.flags.letterRead = true; state.flags.arthurKnown = true; unlockPerson('arthur'); }
  if (id === 'confession') state.flags.juneConfession = true;
  if (!silent) saveState();
  return CLUES[id];
}

export function addDeduction(id, { silent = false } = {}) {
  if (!DEDUCTIONS[id] || state.deductions.includes(id)) return false;
  state.deductions.push(id);
  checkFinalReady();
  if (!silent) saveState();
  return DEDUCTIONS[id];
}

export function checkFinalReady() {
  const all = Object.keys(DEDUCTIONS).every(k => state.deductions.includes(k));
  if (all && state.flags.metJune) state.flags.finalReady = true;
  return state.flags.finalReady;
}

export function unlockPerson(id) {
  if (PEOPLE[id] && !state.peopleUnlocked[id]) {
    state.peopleUnlocked[id] = true;
    return true;
  }
  return false;
}

export function addKeepsake(id) {
  if (!KEEPSAKES[id] || state.keepsakes.includes(id)) return false;
  state.keepsakes.push(id);
  saveState();
  return KEEPSAKES[id];
}

export function getObjective() {
  const f = state.flags;
  if (f.finished) return OBJECTIVES.post;
  if (!state.started) return 'Open the shop.';
  if (!f.watchInspected) return OBJECTIVES.inspect;
  if (!f.talkedMara) return OBJECTIVES.talkMara;
  if (!f.metAlma || !f.metSilas) return OBJECTIVES.lookAround;
  if (!f.hasKey) return OBJECTIVES.key;
  if (!f.letterRead) return OBJECTIVES.station;
  if (!f.metJune) {
    if (hasDeduction('keeperIsJune')) return OBJECTIVES.june;
    return OBJECTIVES.keeper;
  }
  if (!f.finalReady) return OBJECTIVES.tie;
  return OBJECTIVES.decide;
}

export function foundEndingsCount() {
  return loadMeta().endings.length;
}

export function formatPlaytime(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return 'a few minutes';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hour${hrs === 1 ? '' : 's'}`;
}

export function syncFromSave() {
  // ensure derived flags stay truthful after loading
  if (state.flags.letterRead) state.flags.arthurKnown = true;
  if (state.flags.juneConfession) state.flags.metJune = true;
  checkFinalReady();
  if (state.flags.finished) state.flags.postgame = true;
}

export { CLUES, DEDUCTIONS, KEEPSAKES, PEOPLE };
