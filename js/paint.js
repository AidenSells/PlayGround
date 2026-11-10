// ---------------------------------------------------------------
// THE LITTLE THINGS — painterly primitives
// ---------------------------------------------------------------
export const W = 1280;
export const H = 720;

let grainCanvas = null;
let textureCanvas = null;

export function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t * t * (3 - 2 * t);

export function rr(ctx, x, y, w, h, r = 4) {
  const rad = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
export function fillRR(ctx, x, y, w, h, r, color) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}
export function clipRR(ctx, x, y, w, h, r) {
  rr(ctx, x, y, w, h, r);
  ctx.clip();
}

export function linear(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}
export function radial(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}

export function glow(ctx, x, y, r, color = 'rgba(255,201,128,.35)', core = 0) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, core, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.45, fade(color, 0.35));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function fade(color, mul) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const parts = m[1].split(',').map(s => parseFloat(s));
  return `rgba(${parts[0]},${parts[1]},${parts[2]},${(parts[3] ?? 1) * mul})`;
}

export function blob(ctx, x, y, rx, ry, color, alpha = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Loose overlapping ellipses create a dry-brush wash.
export function wash(ctx, x, y, w, h, color, { count = 14, alpha = 0.08, seed = 1, spread = 0.3 } = {}) {
  const rand = seeded(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const px = x + (rand() - 0.5) * w * spread * 2;
    const py = y + (rand() - 0.5) * h * spread * 2;
    ctx.globalAlpha = alpha * (0.4 + rand() * 0.8);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, w * (0.12 + rand() * 0.22), h * (0.1 + rand() * 0.2), (rand() - 0.5) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function stroke(ctx, pts, color, width = 2, alpha = 1, closed = false) {
  if (!pts.length) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    if (p.length === 2) ctx.lineTo(p[0], p[1]);
    else ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
  }
  if (closed) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function wood(ctx, x, y, w, h, opts = {}) {
  const {
    base = '#4b3221', light = '#6a4a2e', dark = '#2e1f14',
    vertical = false, seed = 7, grain = 0.5
  } = opts;
  ctx.save();
  ctx.fillStyle = vertical
    ? linear(ctx, x, y, x + w, y, [[0, dark], [0.12, base], [0.5, light], [0.8, base], [1, dark]])
    : linear(ctx, x, y, x, y + h, [[0, light], [0.16, base], [0.7, base], [1, dark]]);
  ctx.fillRect(x, y, w, h);
  const rand = seeded(seed);
  ctx.globalAlpha = 0.22 * grain;
  for (let i = 0; i < Math.max(10, Math.floor((vertical ? w : h) / 4)); i++) {
    const t = rand();
    ctx.strokeStyle = rand() > 0.5 ? dark : light;
    ctx.lineWidth = 0.5 + rand() * 1.2;
    ctx.beginPath();
    if (vertical) {
      const px = x + t * w;
      ctx.moveTo(px, y);
      ctx.bezierCurveTo(px + (rand() - 0.5) * 7, y + h * 0.3, px + (rand() - 0.5) * 7, y + h * 0.7, px + (rand() - 0.5) * 4, y + h);
    } else {
      const py = y + t * h;
      ctx.moveTo(x, py);
      ctx.bezierCurveTo(x + w * 0.3, py + (rand() - 0.5) * 5, x + w * 0.7, py + (rand() - 0.5) * 5, x + w, py + (rand() - 0.5) * 3);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 2; i++) {
    const kx = x + rand() * w, ky = y + rand() * h;
    ctx.strokeStyle = dark;
    for (let j = 1; j < 4; j++) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, 5 + j * 4, 2 + j * 2, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function floorBoards(ctx, x, y, w, h, opts = {}) {
  const { base = '#4a3423', light = '#61452c', dark = '#2b1d13', board = 46, vertical = false, seed = 4 } = opts;
  ctx.save();
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const rand = seeded(seed);
  if (vertical) {
    for (let px = x; px < x + w; px += board) {
      const bw = board;
      const shade = 0.85 + rand() * 0.25;
      ctx.fillStyle = mix(base, light, (shade - 0.85) / 0.25);
      ctx.fillRect(px + 1, y, bw - 2, h);
      ctx.fillStyle = 'rgba(20,12,7,.5)';
      ctx.fillRect(px, y, 1.2, h);
      ctx.fillStyle = 'rgba(255,230,190,.045)';
      ctx.fillRect(px + 2, y, 1, h);
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = rand() > 0.5 ? light : dark;
        ctx.lineWidth = 0.7;
        const gx = px + 3 + rand() * (bw - 6);
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.bezierCurveTo(gx + 3, y + h * 0.3, gx - 3, y + h * 0.7, gx + 1, y + h); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  } else {
    for (let py = y; py < y + h; py += board) {
      const bh = board;
      const shade = 0.86 + rand() * 0.22;
      ctx.fillStyle = mix(base, light, (shade - 0.86) / 0.22);
      ctx.fillRect(x, py + 1, w, bh - 2);
      ctx.fillStyle = 'rgba(15,9,5,.45)';
      ctx.fillRect(x, py, w, 1.2);
      ctx.fillStyle = 'rgba(255,232,190,.05)';
      ctx.fillRect(x, py + 2, w, 1);
      const seam = x + (0.2 + rand() * 0.6) * w;
      ctx.fillStyle = 'rgba(20,12,7,.35)';
      ctx.fillRect(seam, py, 1, bh);
      for (let i = 0; i < 6; i++) {
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = rand() > 0.5 ? light : dark;
        ctx.lineWidth = 0.6;
        const gy = py + 3 + rand() * (bh - 6);
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.bezierCurveTo(x + w * 0.3, gy + 2, x + w * 0.7, gy - 2, x + w, gy); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.restore();
}

export function mix(a, b, t) {
  const pa = hex(a), pb = hex(b);
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], t)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function hex(c) {
  if (c.startsWith('#')) {
    const h = c.slice(1);
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = c.match(/\d+/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
}

export function wallpaper(ctx, x, y, w, h, opts = {}) {
  const { base = '#3f4a44', stripe = 'rgba(255,240,210,.035)', seed = 2, motif = true } = opts;
  ctx.save();
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = stripe;
  for (let px = x; px < x + w; px += 26) ctx.fillRect(px, y, 9, h);
  if (motif) {
    const rand = seeded(seed);
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = '#e8cfa2';
    for (let py = y + 20; py < y + h; py += 46) {
      for (let px = x + 18; px < x + w; px += 52) {
        const ox = ((py / 46) % 2) * 26;
        ctx.beginPath();
        ctx.ellipse(px + ox, py, 2.2, 4.2, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + ox, py, 2.2, 4.2, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  wash(ctx, x, y, w, h, '#000', { count: 14, alpha: 0.04, seed });
  ctx.restore();
}

export function brick(ctx, x, y, w, h, opts = {}) {
  const { base = '#5a3e31', light = '#75513e', dark = '#3b2820', bw = 52, bh = 22, seed = 11 } = opts;
  const rand = seeded(seed);
  ctx.save();
  ctx.fillStyle = '#2b1e18';
  ctx.fillRect(x, y, w, h);
  for (let py = y, row = 0; py < y + h; py += bh, row++) {
    for (let px = x - (row % 2) * bw / 2; px < x + w; px += bw) {
      const jx = px + rand() * 2, jy = py + rand() * 1.5;
      ctx.fillStyle = mix(dark, light, rand() * 0.7 + 0.15);
      ctx.fillRect(jx + 1, jy + 1, bw - 3, bh - 3);
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = '#000';
      ctx.fillRect(jx + 1, jy + bh - 5, bw - 3, 3);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

export function stone(ctx, x, y, w, h, opts = {}) {
  const { base = '#4b4a45', seed = 19, scale = 1 } = opts;
  const rand = seeded(seed);
  ctx.save();
  ctx.fillStyle = '#252420';
  ctx.fillRect(x, y, w, h);
  let py = y;
  while (py < y + h) {
    const rowH = (16 + rand() * 12) * scale;
    let px = x - rand() * 20;
    while (px < x + w) {
      const rw = (26 + rand() * 38) * scale;
      const shade = 0.75 + rand() * 0.35;
      ctx.fillStyle = mix('#32312c', base, shade);
      ctx.beginPath();
      ctx.moveTo(px + 2, py + 2);
      ctx.lineTo(px + rw - 3, py + 2 + rand() * 3);
      ctx.lineTo(px + rw - 2, py + rowH - 2 - rand() * 3);
      ctx.lineTo(px + 2 + rand() * 3, py + rowH - 2);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 4, py + 3, rw - 10, 1.2);
      ctx.globalAlpha = 1;
      px += rw;
    }
    py += rowH;
  }
  wash(ctx, x, y, w, h, '#000', { count: 8, alpha: 0.04, seed });
  ctx.restore();
}

export function cobbles(ctx, x, y, w, h, opts = {}) {
  const { base = '#303a3d', seed = 21, alpha = 1 } = opts;
  const rand = seeded(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#20282b';
  ctx.fillRect(x, y, w, h);
  for (let py = y, row = 0; py < y + h; py += 17, row++) {
    for (let px = x - (row % 2) * 14; px < x + w; px += 28) {
      const shade = 0.7 + rand() * 0.5;
      ctx.fillStyle = mix('#253034', base, shade);
      ctx.beginPath();
      ctx.ellipse(px + rand() * 3, py + rand() * 2, 13 + rand() * 2, 7.5 + rand() * 1.5, (rand() - 0.5) * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 0.22;
      ctx.strokeStyle = '#7d8c8e';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(px - 2, py - 1, 10, 5, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
  }
  wash(ctx, x, y, w, h, '#8fa3a8', { count: 10, alpha: 0.03, seed });
  ctx.restore();
}

export function roofTiles(ctx, x, y, w, h, opts = {}) {
  const { base = '#2c3038', light = '#454a52', dark = '#191c21', seed = 8 } = opts;
  const rand = seeded(seed);
  ctx.save();
  const g = linear(ctx, x, y, x, y + h, [[0, light], [0.1, base], [1, dark]]);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let py = y; py < y + h; py += 16) {
    for (let px = x - ((py / 16) % 2) * 15; px < x + w; px += 30) {
      ctx.strokeStyle = 'rgba(10,12,15,.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px + 15, py + 14, 15, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(190,190,180,.07)';
      ctx.beginPath();
      ctx.arc(px + 15, py + 12, 14, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    }
  }
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#6b7066';
    ctx.beginPath();
    ctx.ellipse(x + rand() * w, y + rand() * h, 10 + rand() * 20, 4 + rand() * 7, rand(), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function windowFrame(ctx, x, y, w, h, opts = {}) {
  const {
    frame = '#2a1e15', warm = true, panes = [2, 2], glowAlpha = 0.55,
    rain = true, seed = 5, interior = null, sill = true, arch = false
  } = opts;
  ctx.save();
  // outer light spill
  ctx.globalCompositeOperation = 'screen';
  const spill = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.9);
  spill.addColorStop(0, warm ? `rgba(255,196,118,${glowAlpha * 0.35})` : 'rgba(130,170,200,.18)');
  spill.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spill;
  ctx.fillRect(x - w * 0.4, y - h * 0.4, w * 1.8, h * 1.8);
  ctx.globalCompositeOperation = 'source-over';
  // glass
  const g = warm
    ? linear(ctx, x, y, x, y + h, [[0, '#ffd79a'], [0.45, '#e8a761'], [1, '#9f5d32']])
    : linear(ctx, x, y, x, y + h, [[0, '#6e8ea6'], [0.55, '#44637a'], [1, '#273e51']]);
  ctx.fillStyle = g;
  if (arch) {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + w / 2);
    ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  } else ctx.fillRect(x, y, w, h);
  // interior shapes
  if (interior) {
    ctx.save();
    ctx.beginPath();
    if (arch) {
      ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2);
      ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
      ctx.lineTo(x + w, y + h); ctx.closePath();
    } else ctx.rect(x, y, w, h);
    ctx.clip();
    interior(ctx, x, y, w, h);
    ctx.restore();
  }
  // mullions
  ctx.strokeStyle = frame;
  ctx.lineWidth = Math.max(3, w * 0.025);
  for (let i = 1; i < panes[0]; i++) {
    const px = x + (w / panes[0]) * i;
    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
  }
  for (let i = 1; i < panes[1]; i++) {
    const py = y + (h / panes[1]) * i;
    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
  }
  // frame
  ctx.lineWidth = Math.max(5, w * 0.045);
  ctx.strokeStyle = frame;
  if (arch) {
    ctx.beginPath();
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2);
    ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
  } else ctx.strokeRect(x - ctx.lineWidth / 2, y - ctx.lineWidth / 2, w + ctx.lineWidth, h + ctx.lineWidth);
  // glass highlight
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#fff6df';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, y + h * 0.04);
  ctx.lineTo(x + w * 0.46, y + h * 0.04);
  ctx.lineTo(x + w * 0.2, y + h * 0.9);
  ctx.lineTo(x + w * 0.06, y + h * 0.9);
  ctx.closePath(); ctx.fill();
  // rain on glass
  if (rain) {
    const rand = seeded(seed);
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#d7e4e8';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 14; i++) {
      const px = x + rand() * w, py = y + rand() * h;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 1, py + 5 + rand() * 14); ctx.stroke();
    }
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + rand() * w, y + rand() * h, 1 + rand() * 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  if (sill) {
    ctx.fillStyle = mix(frame, '#a57a48', 0.25);
    ctx.fillRect(x - 6, y + h, w + 12, 7);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(x - 6, y + h + 7, w + 12, 3);
  }
  ctx.restore();
}

export function lamp(ctx, x, y, opts = {}) {
  const { scale = 1, warm = true, h = 160, style = 'street' } = opts;
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.strokeStyle = '#1d2428';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -h + 18); ctx.quadraticCurveTo(14, -h + 12, 15, -h + 26); ctx.stroke();
  ctx.fillStyle = '#151b1f';
  fillRR(ctx, -9, -h - 4, 18, 8, 2, '#1a2024');
  // lantern
  const g = warm
    ? linear(ctx, -12, -h - 2, 12, -h - 2, [[0, '#f7c27d'], [0.5, '#ffe2ad'], [1, '#d89452']])
    : linear(ctx, -12, -h - 2, 12, -h - 2, [[0, '#9ab5c6'], [0.5, '#d4e3e8'], [1, '#7293a7']]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-10, -h + 2);
  ctx.lineTo(-7, -h + 26);
  ctx.lineTo(7, -h + 26);
  ctx.lineTo(10, -h + 2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1a2024';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -h + 2); ctx.lineTo(0, -h + 26); ctx.stroke();
  ctx.fillStyle = '#1a2024';
  fillRR(ctx, -13, -h + 26, 26, 5, 2, '#1a2024');
  // base
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#1a2024'; ctx.fill();
  ctx.restore();
  glow(ctx, x, y - h * scale + 16 * scale, 120 * scale, warm ? 'rgba(255,198,116,.34)' : 'rgba(139,180,205,.24)');
}

export function puddle(ctx, x, y, rx, ry, opts = {}) {
  const { warm = true, reflection = true, seed = 3 } = opts;
  ctx.save();
  ctx.translate(x, y);
  const rand = seeded(seed);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 0.82 + Math.sin(a * 3 + seed) * 0.1 + rand() * 0.08;
    const px = Math.cos(a) * rx * r, py = Math.sin(a) * ry * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = linear(ctx, 0, -ry, 0, ry, [[0, '#1b2b35'], [0.5, warm ? '#2f3b3b' : '#263640'], [1, '#101b24']]);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#c8d7d9';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (reflection) {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = radial(ctx, 0, 0, 2, rx, [[0, warm ? 'rgba(255,195,112,.35)' : 'rgba(145,185,208,.25)'], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = '#d5e0df';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse((rand() - 0.5) * rx, (rand() - 0.5) * ry, 6 + rand() * rx * 0.25, 1.5 + rand() * ry * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function plant(ctx, x, y, opts = {}) {
  const { scale = 1, pot = '#7a4b32', leaf = '#4d6144', seed = 1, style = 'fern' } = opts;
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  const rand = seeded(seed);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  // pot
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.moveTo(-17, -30); ctx.lineTo(17, -30); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,230,200,.12)';
  ctx.fillRect(-17, -30, 5, 30);
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.fillRect(9, -30, 8, 30);
  ctx.fillStyle = mix(pot, '#000', 0.3);
  fillRR(ctx, -19, -34, 38, 7, 2, mix(pot, '#000', 0.3));
  const n = style === 'fern' ? 18 : 12;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 1.7;
    const len = 24 + rand() * 40;
    ctx.save();
    ctx.translate((rand() - 0.5) * 8, -32);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = mix(leaf, '#8fa27c', rand() * 0.45);
    ctx.globalAlpha = 0.8 + rand() * 0.2;
    ctx.beginPath();
    ctx.ellipse(0, -len / 2, 4 + rand() * 5, len / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function books(ctx, x, y, w, opts = {}) {
  const { seed = 1, count = 8, palette = ['#6b3f34', '#3e5a55', '#7c6236', '#3b465c', '#735243'] } = opts;
  const rand = seeded(seed);
  ctx.save();
  let px = x;
  for (let i = 0; i < count; i++) {
    const bw = 4 + rand() * 8;
    const bh = 18 + rand() * 26;
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    fillRR(ctx, px, y - bh, bw, bh, 1, ctx.fillStyle);
    ctx.fillStyle = 'rgba(255,240,210,.2)';
    ctx.fillRect(px + 1, y - bh + 3, bw - 2, 1);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(px + bw - 1.5, y - bh, 1.5, bh);
    px += bw + 1;
  }
  ctx.restore();
}

export function clockFace(ctx, cx, cy, r, opts = {}) {
  const { time = [6, 40], face = '#e9ddc2', rim = '#7d5b32', numerals = true, small = false, shadow = true } = opts;
  ctx.save();
  if (shadow) {
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(cx, cy + r + 3, r * 0.9, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = rim;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = face;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(80,55,30,.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.stroke();
  if (numerals && r > 16) {
    const roman = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.fillStyle = 'rgba(40,30,20,.75)';
    ctx.font = `${Math.max(5, r * 0.16)}px "Fraunces", serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(roman[i], cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68);
    }
  }
  const [hh, mm] = time;
  const hAngle = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  const mAngle = (mm / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = 'rgba(30,22,15,.85)';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, r * 0.055);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(hAngle) * r * 0.42, cy + Math.sin(hAngle) * r * 0.42); ctx.stroke();
  ctx.lineWidth = Math.max(1, r * 0.035);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(mAngle) * r * 0.62, cy + Math.sin(mAngle) * r * 0.62); ctx.stroke();
  ctx.fillStyle = 'rgba(40,28,15,.9)';
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.5, r * 0.04), 0, Math.PI * 2); ctx.fill();
  if (!small) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.55, cy - r * 0.2);
    ctx.quadraticCurveTo(cx - r * 0.2, cy - r * 0.7, cx + r * 0.35, cy - r * 0.55);
    ctx.lineTo(cx - r * 0.15, cy + r * 0.1);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function gearShape(ctx, x, y, r, teeth = 10, color = '#9a7a45', opts = {}) {
  const { hole = 0.32, alpha = 1 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.arc(0, 0, r * hole, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(0, 0);
    const a = (i / 3) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); ctx.stroke();
  }
  ctx.restore();
}

export function rain(ctx, t, opts = {}) {
  const { count = 190, alpha = 0.35, wind = -0.22, speed = 1, ground = 400, color = '205,225,235' } = opts;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const seedx = (i * 97.3) % 1400;
    const seedy = (i * 53.7) % 760;
    const sp = (620 + (i % 7) * 90) * speed;
    const x = (seedx + t * 40 * wind + t * 20) % 1400 - 60;
    const y = ((seedy + t * sp) % 780) - 40;
    const len = 9 + (i % 5) * 3;
    ctx.globalAlpha = alpha * (0.3 + ((i % 9) / 12));
    ctx.strokeStyle = `rgba(${color},.8)`;
    ctx.lineWidth = 0.7 + (i % 3) * 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + wind * len * 2.2, y + len);
    ctx.stroke();
    if (i % 23 === 0 && y > ground && y < 700) {
      const phase = (t * 1.4 + i * 0.17) % 1;
      ctx.globalAlpha = (1 - phase) * 0.22;
      ctx.strokeStyle = 'rgba(205,225,235,.8)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + phase * 8, 0.7 + phase * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function mist(ctx, t, opts = {}) {
  const { y = 540, alpha = 0.07, count = 4, color = '175,198,210' } = opts;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < count; i++) {
    const x = ((t * (6 + i * 2) + i * 330) % (W + 500)) - 250;
    const yy = y + Math.sin(t * 0.12 + i) * 22 + i * 18;
    const g = ctx.createRadialGradient(x, yy, 0, x, yy, 260 + i * 40);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - 300, yy - 120, 600, 240);
  }
  ctx.restore();
}

export function dust(ctx, t, opts = {}) {
  const { count = 30, color = '255,214,150', area = [0, 0, W, H], alpha = 0.22 } = opts;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < count; i++) {
    const x = area[0] + ((i * 173 + t * (5 + i % 4) * 3) % area[2]);
    const y = area[1] + ((i * 83 + Math.sin(t * 0.3 + i) * 14 + t * (1 + i % 3)) % area[3]);
    const r = 0.5 + (i % 4) * 0.35;
    ctx.globalAlpha = alpha * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.5 + i)));
    ctx.fillStyle = `rgba(${color},.8)`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function vignette(ctx, strength = 0.55, tint = '0,0,0') {
  ctx.save();
  const g = ctx.createRadialGradient(W * 0.5, H * 0.46, H * 0.2, W * 0.5, H * 0.5, H * 0.85);
  g.addColorStop(0, `rgba(${tint},0)`);
  g.addColorStop(0.65, `rgba(${tint},${strength * 0.12})`);
  g.addColorStop(1, `rgba(${tint},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function getTexture() {
  if (textureCanvas) return textureCanvas;
  textureCanvas = makeCanvas(W, H);
  const c = textureCanvas.getContext('2d');
  const img = c.createImageData(W, H);
  const rand = seeded(9182);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + rand() * 135;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 18 + rand() * 22;
  }
  c.putImageData(img, 0, 0);
  return textureCanvas;
}

export function grain(ctx, alpha = 0.05) {
  const tex = getTexture();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(tex, 0, 0);
  ctx.restore();
}

// A soft, irregular painted edge for notes / cards.
export function paintedCard(ctx, x, y, w, h, opts = {}) {
  const { fill = '#efe2c8', border = 'rgba(90,60,30,.25)', seed = 4, shadow = true, rotate = 0 } = opts;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotate);
  const rand = seeded(seed);
  if (shadow) {
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.ellipse(4, 7, w * 0.51, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = fill;
  ctx.beginPath();
  const j = () => (rand() - 0.5) * 2.4;
  ctx.moveTo(-w / 2 + j(), -h / 2 + j());
  ctx.lineTo(w / 2 + j(), -h / 2 + j());
  ctx.lineTo(w / 2 + j(), h / 2 + j());
  ctx.lineTo(-w / 2 + j(), h / 2 + j());
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.restore();
}

export function label(ctx, text, x, y, opts = {}) {
  const { font = '10px Karla, sans-serif', color = 'rgba(240,229,207,.7)', align = 'center', spacing = 1, baseline = 'middle' } = opts;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (spacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function textWrap(ctx, text, x, y, maxW, lineH, opts = {}) {
  const { font = '14px Fraunces, serif', color = '#f0e5cf', align = 'left' } = opts;
  ctx.save();
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top';
  const words = text.split(' ');
  let line = '', yy = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = word; yy += lineH;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
  ctx.restore();
}

export function softShadow(ctx, x, y, rx, ry, alpha = 0.28) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(0.7, `rgba(0,0,0,${alpha * 0.45})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
