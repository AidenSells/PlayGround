// ---------------------------------------------------------------
// THE LITTLE THINGS — the town, assembled
// ---------------------------------------------------------------
import { shop, tea, clock, lighthouse } from './scenes-indoor.js';
import { street, station, cliff } from './scenes-town.js';

export const scenes = { shop, street, tea, clock, station, cliff, lighthouse };

// A few hotspots share the same patch of wall in the scene files.
// Nudge them apart so both things can actually be examined.
const HOTSPOT_PATCHES = {
  tea: {
    photo: { x: 806, y: 334, r: 52 },
    fire: { x: 868, y: 372, r: 46 }
  }
};

// Where the player appears when walking through a particular door.
const ENTRIES = {
  'street>shop': { x: 152, y: 392, dir: 'right' },
  'shop>street': { x: 1146, y: 438, dir: 'down' },
  'street>tea': { x: 1120, y: 420, dir: 'left' },
  'tea>street': { x: 700, y: 438, dir: 'down' },
  'street>clock': { x: 1146, y: 420, dir: 'left' },
  'clock>street': { x: 306, y: 438, dir: 'down' },
  'street>station': { x: 156, y: 430, dir: 'right' },
  'station>street': { x: 92, y: 516, dir: 'right' },
  'station>cliff': { x: 104, y: 648, dir: 'right' },
  'cliff>station': { x: 1128, y: 420, dir: 'left' },
  'cliff>lighthouse': { x: 1120, y: 422, dir: 'left' },
  'lighthouse>cliff': { x: 1000, y: 654, dir: 'left' }
};

export function getEntry(sceneId, fromId) {
  return ENTRIES[`${fromId}>${sceneId}`] || scenes[sceneId].spawn;
}

// Each person is drawn in the world and can be spoken to.
// Alma, Silas and June already have talk hotspots in their scene files;
// Mara needs one added because she is only present in the opening.
const NPCS = {
  shop: [
    {
      id: 'mara',
      who: 'mara',
      name: 'Mara Bell',
      x: 966, y: 592, dir: 'left',
      when: (s) => !s.flags.talkedMara && !s.flags.finished,
      hotspot: {
        x: 966, y: 560, r: 82,
        label: 'Speak with Mara Bell',
        action: 'talk:mara',
        kind: 'npc'
      }
    },
    {
      id: 'maraPost',
      who: 'mara',
      name: 'Mara Bell',
      x: 1008, y: 602, dir: 'left',
      when: (s) => s.flags.finished && s.flags.ending === 'keep',
      hotspot: {
        x: 1008, y: 572, r: 78,
        label: 'Talk with Mara',
        action: 'talk:mara',
        kind: 'npc'
      }
    }
  ],
  tea: [
    {
      id: 'alma',
      who: 'alma',
      name: 'Alma Finch',
      x: 306, y: 476, dir: 'down',
      when: () => true
    }
  ],
  clock: [
    {
      id: 'silas',
      who: 'silas',
      name: 'Silas Voss',
      x: 680, y: 514, dir: 'down',
      when: () => true
    }
  ],
  lighthouse: [
    {
      id: 'june',
      who: 'june',
      name: 'June Alder',
      x: 750, y: 500, dir: 'down',
      when: (s) => s.flags.metJune || s.flags.finalReady || s.flags.finished
    }
  ]
};

export function npcsAt(sceneId, state) {
  const list = NPCS[sceneId] || [];
  return list.filter((npc) => !npc.when || npc.when(state));
}

function patchHotspot(sceneId, h) {
  const patch = HOTSPOT_PATCHES[sceneId]?.[h.id];
  return patch ? { ...h, ...patch } : h;
}

export function hotspotsAt(sceneId, state) {
  const scene = scenes[sceneId];
  if (!scene) return [];
  const base = (scene.hotspots || [])
    .filter((h) => !h.when || h.when(state))
    .map((h) => patchHotspot(sceneId, h));
  const npcSpots = [];
  for (const npc of npcsAt(sceneId, state)) {
    if (!npc.hotspot) continue;
    if (base.some((h) => h.action === npc.hotspot.action)) continue;
    npcSpots.push({ ...npc.hotspot });
  }
  return [...base, ...npcSpots];
}

export function sceneInfo(sceneId) {
  const s = scenes[sceneId];
  return s?.info || { name: 'Ember Hollow', sub: '' };
}

export function sceneWeather(sceneId) {
  return scenes[sceneId]?.weather || { indoor: true, rain: 0, fog: false, lightning: false };
}

export function isWalkable(sceneId, x, y, radius = 12) {
  const scene = scenes[sceneId];
  if (!scene) return false;
  const inside = (rect, px, py, pad = 0) => (
    px >= rect.x + pad && px <= rect.x + rect.w - pad &&
    py >= rect.y + pad && py <= rect.y + rect.h - pad
  );
  if (!(scene.walk || []).some((rect) => inside(rect, x, y, 2))) return false;
  for (const b of scene.blockers || []) {
    if (
      x + radius > b.x && x - radius < b.x + b.w &&
      y + radius * 0.5 > b.y && y - radius * 0.5 < b.y + b.h
    ) {
      return false;
    }
  }
  return true;
}

export function nearestWalkable(sceneId, x, y, radius = 12) {
  if (isWalkable(sceneId, x, y, radius)) return { x, y };
  for (let ring = 1; ring <= 24; ring++) {
    const d = ring * 7;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d * 0.65;
      if (isWalkable(sceneId, px, py, radius)) return { x: px, y: py };
    }
  }
  return null;
}

export function approachPoint(sceneId, from, hotspot) {
  const dx = from.x - hotspot.x;
  const dy = from.y - hotspot.y;
  const dist = Math.hypot(dx, dy) || 1;
  const angles = [Math.atan2(dy, dx), Math.atan2(dy, dx) + 0.6, Math.atan2(dy, dx) - 0.6, Math.PI / 2, -Math.PI / 2, 0, Math.PI];
  const radii = [Math.max(34, hotspot.r * 0.55), Math.max(48, hotspot.r * 0.8), 16, 8];
  for (const r of radii) {
    for (const a of angles) {
      const p = nearestWalkable(sceneId, hotspot.x + Math.cos(a) * r, hotspot.y + Math.sin(a) * r);
      if (p) return p;
    }
  }
  return nearestWalkable(sceneId, hotspot.x, hotspot.y);
}

export function canStand(sceneId, x, y) {
  return isWalkable(sceneId, x, y, 12);
}
