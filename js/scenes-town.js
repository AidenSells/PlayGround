// ---------------------------------------------------------------
// THE LITTLE THINGS — town scenes
// ---------------------------------------------------------------
import {
  W, H, fillRR, linear, radial, glow, wash, wood, floorBoards, wallpaper,
  windowFrame, lamp, puddle, plant, books, clockFace, rain, mist, dust,
  vignette, label, cobbles, brick, roofTiles, seeded, mix, softShadow, stone
} from './paint.js';
import { drawCat, drawUmbrellaWalker, drawPerson } from './chars.js';

function sky(ctx, top, bottom, clouds = true) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, 400, [[0, top], [0.55, bottom], [1, mix(bottom, '#101a24', 0.4)]]);
  ctx.fillRect(0, 0, W, 430);
  if (clouds) {
    const rand = seeded(21);
    for (let i = 0; i < 11; i++) {
      const x = rand() * W, y = 30 + rand() * 190;
      wash(ctx, x, y, 170 + rand() * 220, 40 + rand() * 40, rand() > 0.5 ? '#30485a' : '#1b2d3c', {
        count: 8, alpha: 0.08, seed: 30 + i, spread: 0.5
      });
    }
  }
}

function signBoard(ctx, x, y, w, h, text, opts = {}) {
  const { bg = '#2c2116', color = '#e8c88d', bracket = true, rotate = 0, sub = '' } = opts;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotate);
  if (bracket) {
    ctx.strokeStyle = '#1a1d20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 12, -h / 2 - 14);
    ctx.lineTo(-w / 2 + 7, -h / 2 - 14);
    ctx.lineTo(-w / 2 + 7, -h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2 + 12, -h / 2 - 14);
    ctx.lineTo(w / 2 - 7, -h / 2 - 14);
    ctx.lineTo(w / 2 - 7, -h / 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  fillRR(ctx, -w / 2 + 2, -h / 2 + 3, w, h, 2, 'rgba(0,0,0,.3)');
  ctx.fillStyle = bg;
  fillRR(ctx, -w / 2, -h / 2, w, h, 2, bg);
  ctx.strokeStyle = 'rgba(220,182,118,.42)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = Math.min(h * 0.34, w / Math.max(8, text.length) * 1.8);
  ctx.font = `500 ${size}px Fraunces, serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
  ctx.fillText(text, 0, sub ? -h * 0.07 : 0);
  if (sub) {
    ctx.font = '8px Karla, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillStyle = 'rgba(232,200,141,.55)';
    ctx.fillText(sub, 0, h * 0.25);
  }
  ctx.restore();
}

function windowWarmInterior(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(50,28,14,.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(84,48,24,.7)';
  ctx.fillRect(x + 5, y + h * 0.64, w - 10, 4);
  // shelves
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = 'rgba(70,40,20,.6)';
    ctx.fillRect(x + 6, y + h * (0.3 + i * 0.22), w - 12, 3);
  }
  const rand = seeded(Math.round(x + y));
  for (let i = 0; i < 6; i++) {
    const px = x + 9 + rand() * (w - 24);
    const py = y + h * (0.28 + Math.floor(rand() * 2) * 0.22);
    ctx.fillStyle = ['rgba(60,35,18,.85)', 'rgba(104,54,28,.8)', 'rgba(37,42,35,.8)'][i % 3];
    fillRR(ctx, px, py - 8 - rand() * 8, 5 + rand() * 7, 10 + rand() * 8, 1, ctx.fillStyle);
  }
}

function shopFacade(ctx) {
  // Right-hand shop: The Little Things
  const x = 818, y = 128, w = 438;
  ctx.save();
  // upper wall
  ctx.fillStyle = linear(ctx, x, y, x + w, y, [[0, '#584e42'], [0.5, '#6b5d4a'], [1, '#443b33']]);
  ctx.fillRect(x, y + 40, w, 220);
  brick(ctx, x, y + 38, w, 224, { base: '#655443', light: '#7d695200', dark: '#42352a', bw: 58, bh: 24, seed: 44 });
  roofTiles(ctx, x - 14, y - 6, w + 28, 82, { base: '#2d3037', light: '#4b4e53', dark: '#181a1f' });
  // roof edge
  ctx.fillStyle = '#24262b';
  ctx.fillRect(x - 18, y + 68, w + 36, 10);
  // timber frame
  ctx.fillStyle = 'rgba(46,35,24,.75)';
  ctx.fillRect(x + 4, y + 74, 9, 214);
  ctx.fillRect(x + w - 13, y + 74, 9, 214);
  ctx.fillRect(x + 4, y + 76, w - 8, 7);
  // big window
  windowFrame(ctx, x + 46, y + 124, 208, 130, {
    frame: '#2b2118', warm: true, panes: [2, 1], glowAlpha: 0.8, seed: 12,
    interior: (c, ix, iy, iw, ih) => windowWarmInterior(c, ix, iy, iw, ih)
  });
  // cat in window
  drawCat(ctx, x + 205, y + 240, 0, { scale: 0.72, sleeping: false });
  // door
  const dx = x + 292, dy = y + 118;
  ctx.fillStyle = '#241c15';
  fillRR(ctx, dx - 5, dy - 5, 84, 188, 2, '#241c15');
  ctx.fillStyle = linear(ctx, dx, dy, dx + 72, dy, [[0, '#5c3a24'], [0.5, '#7b4f30'], [1, '#4a2e1c']]);
  fillRR(ctx, dx, dy, 72, 180, 2, ctx.fillStyle);
  wood(ctx, dx + 4, dy + 4, 64, 172, { base: '#6a4328', light: '#895a36', dark: '#422a19', vertical: true, seed: 65, grain: 0.5 });
  // door glass
  windowFrame(ctx, dx + 12, dy + 14, 48, 66, { frame: '#2c2118', warm: true, panes: [1, 2], glowAlpha: 0.55, seed: 8, sill: false });
  // handle
  ctx.fillStyle = '#c49a5c';
  ctx.beginPath(); ctx.arc(dx + 62, dy + 108, 3, 0, Math.PI * 2); ctx.fill();
  // sign
  signBoard(ctx, x + 68, y + 38, 300, 56, 'THE LITTLE THINGS', { bg: '#241a11', sub: 'LOST · FOUND · REMEMBERED' });
  // hanging sign
  signBoard(ctx, x - 44, y + 170, 92, 46, 'OPEN', { bg: '#3a2a1b', color: '#e2b875', rotate: -0.04, sub: 'TIL LATE' });
  // flower box
  ctx.fillStyle = '#4b3423';
  fillRR(ctx, x + 48, y + 252, 204, 14, 2, '#4b3423');
  const rand = seeded(9);
  for (let i = 0; i < 14; i++) {
    const px = x + 58 + rand() * 180;
    const py = y + 248;
    ctx.fillStyle = ['#7a4a4d', '#8f6a5b', '#5c6d53'][i % 3];
    ctx.beginPath(); ctx.arc(px, py - rand() * 8, 3 + rand() * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function teaFacade(ctx) {
  const x = 404, y = 152, w = 366;
  ctx.save();
  ctx.fillStyle = linear(ctx, x, y, x + w, y, [[0, '#3d4841'], [0.5, '#4f5a4d'], [1, '#313a34']]);
  ctx.fillRect(x, y + 46, w, 190);
  // timber
  ctx.fillStyle = 'rgba(46,36,24,.45)';
  for (let px = x + 18; px < x + w; px += 72) ctx.fillRect(px, y + 40, 5, 196);
  roofTiles(ctx, x - 12, y - 4, w + 24, 70, { base: '#2b3135', light: '#414a4c', dark: '#181d20' });
  ctx.fillStyle = '#24292a';
  ctx.fillRect(x - 14, y + 58, w + 28, 8);
  // chimney
  ctx.fillStyle = '#3b3a37';
  ctx.fillRect(x + 46, y - 62, 34, 66);
  ctx.fillStyle = '#20211f';
  ctx.fillRect(x + 42, y - 68, 42, 8);
  // big bay window
  windowFrame(ctx, x + 36, y + 110, 150, 126, {
    frame: '#2b2118', warm: true, panes: [2, 2], glowAlpha: 0.85, seed: 14,
    interior: (c, ix, iy, iw, ih) => {
      c.fillStyle = 'rgba(70,38,17,.55)';
      c.fillRect(ix, iy, iw, ih);
      // hanging lamps
      for (let i = 0; i < 2; i++) {
        c.fillStyle = 'rgba(255,207,130,.8)';
        c.beginPath(); c.arc(ix + iw * (0.3 + i * 0.4), iy + ih * 0.27, 8, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(55,32,17,.6)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(ix + iw * (0.3 + i * 0.4), iy); c.lineTo(ix + iw * (0.3 + i * 0.4), iy + ih * 0.22); c.stroke();
      }
      c.fillStyle = 'rgba(60,35,20,.55)';
      c.fillRect(ix, iy + ih * 0.64, iw, 5);
      for (let i = 0; i < 3; i++) {
        c.beginPath(); c.arc(ix + 24 + i * 34, iy + ih * 0.55, 7, 0, Math.PI * 2); c.fill();
      }
    }
  });
  // door
  const dx = x + 222, dy = y + 108;
  ctx.fillStyle = '#221a13';
  fillRR(ctx, dx - 5, dy - 5, 88, 190, 2, '#221a13');
  ctx.fillStyle = '#3d4a3c';
  fillRR(ctx, dx, dy, 78, 182, 2, '#3d4a3c');
  wood(ctx, dx + 5, dy + 5, 68, 172, { base: '#354237', light: '#4e5d4a', dark: '#263027', vertical: true, seed: 19, grain: 0.4 });
  windowFrame(ctx, dx + 13, dy + 16, 52, 62, { frame: '#2b241b', warm: true, panes: [1, 2], glowAlpha: 0.55, seed: 22, sill: false });
  ctx.fillStyle = '#c49a5c';
  ctx.beginPath(); ctx.arc(dx + 68, dy + 108, 3, 0, Math.PI * 2); ctx.fill();
  // awning
  const ay = y + 88;
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#7f4f3c' : '#d6c39e';
    ctx.beginPath();
    ctx.moveTo(x + 22 + i * 42, ay);
    ctx.lineTo(x + 64 + i * 42, ay);
    ctx.lineTo(x + 56 + i * 42, ay + 26);
    ctx.lineTo(x + 22 + i * 42, ay + 26);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.fillRect(x + 22, ay + 22, 336, 4);
  // sign
  signBoard(ctx, x + 48, y + 44, 270, 46, 'THE LARKSPUR', { bg: '#2d2d1f', sub: 'TEA · CAKE · CONVERSATION' });
  // flower boxes
  ctx.fillStyle = '#463322';
  fillRR(ctx, x + 30, y + 238, 162, 12, 2, '#463322');
  const rand = seeded(33);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = ['#9a6b54', '#b28b6d', '#67795b'][i % 3];
    ctx.beginPath(); ctx.arc(x + 40 + rand() * 140, y + 233 - rand() * 6, 2.5 + rand() * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function clockFacade(ctx) {
  const x = 24, y = 142, w = 346;
  ctx.save();
  ctx.fillStyle = linear(ctx, x, y, x + w, y, [[0, '#39342f'], [0.5, '#4a4239'], [1, '#2c2925']]);
  ctx.fillRect(x, y + 48, w, 200);
  brick(ctx, x, y + 44, w, 204, { base: '#4d4036', light: '#625244', dark: '#332a23', bw: 50, bh: 22, seed: 7 });
  roofTiles(ctx, x - 12, y - 6, w + 24, 76, { base: '#262b30', light: '#3d4348', dark: '#15191c' });
  ctx.fillStyle = '#202326';
  ctx.fillRect(x - 14, y + 64, w + 28, 9);
  // shop window with clock faces
  windowFrame(ctx, x + 34, y + 122, 142, 116, {
    frame: '#251d15', warm: true, panes: [2, 2], glowAlpha: 0.7, seed: 17,
    interior: (c, ix, iy, iw, ih) => {
      c.fillStyle = 'rgba(65,36,16,.6)';
      c.fillRect(ix, iy, iw, ih);
      clockFace(c, ix + iw * 0.3, iy + ih * 0.36, 16, { time: [3, 10], face: '#dcc79e', rim: '#7d5a33', numerals: false });
      clockFace(c, ix + iw * 0.68, iy + ih * 0.56, 12, { time: [9, 45], face: '#d5c29b', rim: '#6d4f2d', numerals: false });
      c.fillStyle = 'rgba(45,27,15,.6)';
      c.fillRect(ix, iy + ih * 0.72, iw, 4);
    }
  });
  // door
  const dx = x + 212, dy = y + 120;
  ctx.fillStyle = '#1e1812';
  fillRR(ctx, dx - 5, dy - 5, 84, 186, 2, '#1e1812');
  wood(ctx, dx, dy, 74, 178, { base: '#45301f', light: '#5f442b', dark: '#2b1e14', vertical: true, seed: 4 });
  windowFrame(ctx, dx + 12, dy + 14, 50, 60, { frame: '#271f18', warm: true, panes: [1, 2], glowAlpha: 0.6, seed: 4, sill: false });
  ctx.fillStyle = '#b89358';
  ctx.beginPath(); ctx.arc(dx + 64, dy + 104, 3, 0, Math.PI * 2); ctx.fill();
  // sign
  signBoard(ctx, x + 38, y + 44, 270, 46, 'VOSS & SONS', { bg: '#2b231a', sub: 'CLOCKMAKERS · SINCE 1902' });
  // hanging gear sign
  ctx.save();
  ctx.translate(x + w + 8, y + 150);
  ctx.strokeStyle = '#1b1e20'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(28, -32); ctx.lineTo(28, -10); ctx.stroke();
  ctx.restore();
  signBoard(ctx, x + w - 60, y + 168, 76, 76, '', { bg: '#2f2519', bracket: false, rotate: 0.05 });
  ctx.save();
  ctx.translate(x + w - 22, y + 206);
  ctx.strokeStyle = '#c8a465'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -11); ctx.moveTo(0, 0); ctx.lineTo(8, 5); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function streetLamp(ctx, x, y) {
  ctx.save();
  // bracket arm wall lamp
  ctx.strokeStyle = '#1a1e21'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 34); ctx.quadraticCurveTo(x, y - 50, x + 18, y - 50); ctx.lineTo(x + 28, y - 50); ctx.stroke();
  ctx.fillStyle = '#1a1e21';
  ctx.beginPath(); ctx.moveTo(x + 18, y - 50); ctx.lineTo(x + 38, y - 50); ctx.lineTo(x + 34, y - 26); ctx.lineTo(x + 22, y - 26); ctx.closePath(); ctx.fill();
  const g = linear(ctx, x + 22, y - 48, x + 34, y - 48, [[0, '#ffcf88'], [0.5, '#ffe7b4'], [1, '#d9924d']]);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x + 23, y - 47); ctx.lineTo(x + 33, y - 47); ctx.lineTo(x + 32, y - 30); ctx.lineTo(x + 24, y - 30); ctx.closePath(); ctx.fill();
  ctx.restore();
  glow(ctx, x + 28, y - 34, 94, 'rgba(255,198,116,.28)');
}

function streetPost(ctx, x, y, h = 190) {
  lamp(ctx, x, y, { scale: 1, warm: true, h: 155 });
  // base
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(x, y + 3, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
}

function shopWindowInterior(ctx, x, y, w, h) {
  // little museum shelves seen through glass
  ctx.fillStyle = 'rgba(48,26,13,.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(94,55,27,.68)';
  for (let i = 0; i < 2; i++) ctx.fillRect(x, y + h * (0.38 + i * 0.26), w, 5);
  const rand = seeded(77);
  for (let i = 0; i < 10; i++) {
    const px = x + 8 + rand() * (w - 20);
    const shelf = Math.floor(rand() * 3);
    const py = y + h * (0.34 + shelf * 0.26);
    ctx.fillStyle = ['rgba(50,30,17,.8)', 'rgba(97,54,28,.8)', 'rgba(38,52,42,.8)'][i % 3];
    fillRR(ctx, px, py - 5 - rand() * 10, 5 + rand() * 9, 8 + rand() * 12, 1, ctx.fillStyle);
  }
}

export const street = {
  id: 'street',
  info: { name: 'Lantern Row', sub: 'Ember Hollow · 6:52 p.m.' },
  outdoor: true,
  weather: { rain: 170, fog: true, lightning: true },
  spawn: { x: 1160, y: 458, dir: 'down' },

  draw(ctx) {
    sky(ctx, '#0d1a27', '#1a2d3a', true);
    // distant town silhouette and clock tower
    ctx.fillStyle = '#111b23';
    ctx.fillRect(0, 270, W, 130);
    for (let i = 0; i < 14; i++) {
      const bx = i * 96 - 20, bh = 40 + (i % 4) * 18;
      ctx.fillRect(bx, 300 - bh, 82, bh + 90);
      ctx.fillStyle = 'rgba(255,198,112,.2)';
      if (i % 3 === 0) ctx.fillRect(bx + 18, 300 - bh + 12, 7, 10);
      ctx.fillStyle = '#111b23';
    }
    // clock tower
    ctx.fillStyle = '#16222b';
    ctx.fillRect(596, 124, 88, 210);
    ctx.beginPath(); ctx.moveTo(586, 130); ctx.lineTo(640, 38); ctx.lineTo(694, 130); ctx.closePath(); ctx.fill();
    clockFace(ctx, 640, 196, 28, { time: [6, 52], face: '#c7b58d', rim: '#4e4434', numerals: true });
    ctx.fillStyle = '#0b1319';
    ctx.fillRect(630, 92, 20, 30);
    glow(ctx, 640, 196, 44, 'rgba(255,201,128,.12)');

    // facades
    clockFacade(ctx);
    teaFacade(ctx);
    shopFacade(ctx);

    // warm wall lamps
    streetLamp(ctx, 372, 318);
    streetLamp(ctx, 802, 300);
    streetLamp(ctx, 1218, 318);

    // street surface
    cobbles(ctx, 0, 348, W, H - 348, { base: '#39464a', seed: 31 });
    ctx.fillStyle = 'rgba(14,23,28,.35)';
    ctx.fillRect(0, 348, W, 7);
    // kerb
    ctx.fillStyle = '#4d5552';
    ctx.fillRect(0, 352, W, 5);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(0, 352, W, 1);
    // wet sheen bands
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) {
      const gx = 100 + i * 180;
      const g = linear(ctx, gx, 360, gx, 700, [[0, 'rgba(255,198,118,.1)'], [1, 'rgba(255,198,118,0)']]);
      ctx.fillStyle = g;
      ctx.fillRect(gx - 40, 360, 80, 340);
    }
    ctx.restore();

    // puddles
    puddle(ctx, 520, 628, 115, 34, { warm: true, seed: 5 });
    puddle(ctx, 962, 558, 88, 26, { warm: true, seed: 9 });
    puddle(ctx, 214, 676, 74, 20, { warm: false, seed: 4 });
    // roof-drip ripples
    for (let i = 0; i < 8; i++) {
      const rx = 80 + i * 145;
      ctx.strokeStyle = 'rgba(190,215,225,.08)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(rx, 610 + (i % 3) * 28, 13, 3.4, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // street furniture
    // bench
    const bx = 690, by = 522;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(bx + 80, by + 34, 88, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2b1e';
    fillRR(ctx, bx, by, 160, 9, 2, '#3a2b1e');
    fillRR(ctx, bx + 6, by + 10, 148, 7, 2, '#33261b');
    fillRR(ctx, bx, by - 24, 160, 8, 2, '#43301f');
    ctx.fillStyle = '#24282a';
    ctx.fillRect(bx + 8, by + 16, 6, 22);
    ctx.fillRect(bx + 146, by + 16, 6, 22);
    // planter
    plant(ctx, 444, 404, { scale: 1.05, seed: 3, pot: '#5a3b29' });
    plant(ctx, 474, 420, { scale: 0.7, seed: 7, pot: '#5a3b29' });
    // crates by clock shop
    ctx.fillStyle = '#4a3522';
    fillRR(ctx, 324, 592, 46, 34, 2, '#4a3522');
    fillRR(ctx, 364, 604, 34, 24, 2, '#3e2c1c');
    ctx.strokeStyle = 'rgba(255,235,190,.12)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(324, 598 + i * 9); ctx.lineTo(370, 598 + i * 9); ctx.stroke();
    }
    // parcels by tea house
    ctx.fillStyle = '#8a6a45';
    fillRR(ctx, 760, 408, 30, 22, 1, '#8a6a45');
    ctx.fillStyle = '#a05e44';
    fillRR(ctx, 773, 398, 24, 14, 1, '#a05e44');
    // paper boat in puddle
    if (!window.__boatTaken) {
      ctx.save();
      ctx.translate(504, 622);
      ctx.rotate(-0.12);
      ctx.fillStyle = '#e6dcc6';
      ctx.beginPath();
      ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.lineTo(6, 7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f3ead6';
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,70,45,.4)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 0); ctx.stroke();
      ctx.restore();
    }

    // signpost to station
    const sx = 82, sy = 486;
    ctx.strokeStyle = '#2c2b27'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 60); ctx.stroke();
    ctx.fillStyle = '#2c2b27';
    ctx.beginPath(); ctx.moveTo(sx, sy - 60); ctx.lineTo(sx + 76, sy - 60); ctx.lineTo(sx + 88, sy - 52); ctx.lineTo(sx + 76, sy - 44); ctx.lineTo(sx, sy - 44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9c69e';
    ctx.font = '9px Karla, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    ctx.fillText('STATION  ·  CLIFF', sx + 10, sy - 52);
    // post base
    ctx.fillStyle = '#242421';
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 9, 3, 0, 0, Math.PI * 2); ctx.fill();

    // noticeboard by tea
    ctx.fillStyle = '#33251a';
    fillRR(ctx, 792, 394, 52, 66, 1, '#33251a');
    ctx.fillStyle = '#d8c7a0';
    ctx.fillRect(797, 399, 42, 54);
    ctx.fillStyle = 'rgba(70,50,30,.5)';
    for (let i = 0; i < 4; i++) ctx.fillRect(801, 404 + i * 11, 30 - (i % 2) * 8, 2);
    ctx.fillStyle = '#9d5b42';
    ctx.beginPath(); ctx.arc(818, 398, 2, 0, Math.PI * 2); ctx.fill();

    // light pools
    glow(ctx, 500, 510, 250, 'rgba(255,196,116,.09)');
    glow(ctx, 960, 500, 280, 'rgba(255,196,116,.1)');
    glow(ctx, 200, 460, 180, 'rgba(255,196,116,.07)');

    vignette(ctx, 0.6, '2,6,10');
  },

  dynamic(ctx, state, t) {
    // rain ripples + steam
    mist(ctx, t, { y: 600, alpha: 0.035, count: 3 });
    // chimney smoke
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const p = (t * 0.18 + i * 0.12) % 1;
      const x = 490 + Math.sin(t * 0.6 + i) * 9 + p * 18;
      const y = 70 - p * 130;
      ctx.globalAlpha = (1 - p) * 0.09;
      ctx.fillStyle = '#c8d3d2';
      ctx.beginPath(); ctx.ellipse(x, y, 12 + p * 28, 7 + p * 16, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // window lamp flicker
    const flick = 0.94 + Math.sin(t * 5.3) * 0.03 + Math.sin(t * 11.7) * 0.02;
    glow(ctx, 980, 320, 120 * flick, 'rgba(255,197,116,.09)');
    glow(ctx, 520, 320, 100 * flick, 'rgba(255,197,116,.07)');
  },

  drawForeground(ctx, state, t) {
    // gentle foreground rain haze at very bottom
    const g = linear(ctx, 0, 640, 0, 720, [[0, 'rgba(8,14,19,0)'], [1, 'rgba(8,14,19,.24)']]);
    ctx.fillStyle = g; ctx.fillRect(0, 640, W, 80);
  },

  walk: [
    { x: 36, y: 386, w: 1210, h: 312 }
  ],
  blockers: [
    { x: 356, y: 492, w: 48, h: 34 },
    { x: 786, y: 494, w: 48, h: 34 },
    { x: 1202, y: 496, w: 52, h: 34 },
    { x: 686, y: 508, w: 170, h: 56 },
    { x: 424, y: 382, w: 76, h: 40 },
    { x: 248, y: 588, w: 160, h: 56 },
    { x: 748, y: 390, w: 42, h: 30 }
  ],
  hotspots: [
    { id: 'clockDoor', x: 246, y: 394, r: 86, label: 'Enter Voss & Sons', kind: 'exit', action: 'go:clock' },
    { id: 'teaDoor', x: 638, y: 394, r: 86, label: 'Enter the Larkspur', kind: 'exit', action: 'go:tea' },
    { id: 'shopDoor', x: 1152, y: 394, r: 92, label: 'Enter The Little Things', kind: 'exit', action: 'go:shop' },
    { id: 'stationExit', x: 56, y: 554, r: 74, label: 'Take the lane to the station', kind: 'exit', action: 'go:station' },
    { id: 'boat', x: 504, y: 624, r: 58, label: 'A paper boat in the puddle', kind: 'keepsake', action: 'keepsake:boat', when: s => !s.keepsakes.includes('boat') },
    { id: 'notice', x: 818, y: 432, r: 56, label: 'Read the rain-soaked notice', action: 'look:notice' },
    { id: 'signpost', x: 88, y: 448, r: 54, label: 'Read the signpost', action: 'look:signpost' },
    { id: 'puddle', x: 528, y: 628, r: 70, label: 'Look into the puddle', action: 'look:puddle' },
    { id: 'shopWindow', x: 960, y: 398, r: 74, label: 'Look into your shop window', action: 'look:shopwindow' },
    { id: 'teaWindow', x: 530, y: 394, r: 78, label: 'Peek into the tea house', action: 'look:teawindow' },
    { id: 'clockWindow', x: 160, y: 394, r: 64, label: 'Look at the clock shop window', action: 'look:clockwindow' }
  ],
  ambient: true,
  ambientDraw(ctx, state, t) {
    // umbrella walkers
    const x1 = ((t * 18) % 1600) - 200;
    const x2 = 1380 - ((t * 13 + 400) % 1600);
    drawUmbrellaWalker(ctx, x1, 590, t, { hue: '#314652', phase: 0 });
    drawUmbrellaWalker(ctx, x2, 668, t, { hue: '#413b4a', phase: 2.2 });
  }
};

// ---------------------------------------------------------------
// Station interior
// ---------------------------------------------------------------
export const station = {
  id: 'station',
  info: { name: 'Ember Hollow Station', sub: 'The last stop before the sea' },
  weather: { rain: 0, fog: false, lightning: false, indoor: true },
  spawn: { x: 180, y: 520, dir: 'right' },

  draw(ctx, state) {
    // back wall
    ctx.fillStyle = linear(ctx, 0, 0, 0, 340, [[0, '#1b2a31'], [0.55, '#31444a'], [1, '#28383d']]);
    ctx.fillRect(0, 0, W, 340);
    wallpaper(ctx, 0, 34, W, 244, { base: '#33484b', stripe: 'rgba(215,235,230,.025)', seed: 3, motif: false });
    // tile wainscot
    ctx.fillStyle = '#1c2b2f';
    ctx.fillRect(0, 274, W, 68);
    for (let x = 0; x < W; x += 52) {
      ctx.strokeStyle = 'rgba(190,215,210,.09)';
      ctx.strokeRect(x + 2, 278, 48, 60);
    }
    ctx.fillStyle = '#1a2428';
    ctx.fillRect(0, 270, W, 7);
    ctx.fillStyle = 'rgba(220,235,230,.14)';
    ctx.fillRect(0, 270, W, 1);

    // floor
    floorBoards(ctx, 0, 338, W, H - 338, { base: '#4b4236', light: '#625443', dark: '#2f2922', board: 54, seed: 12 });
    // central worn rug
    ctx.fillStyle = 'rgba(70,58,44,.36)';
    ctx.beginPath();
    ctx.ellipse(530, 585, 245, 92, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(158,128,89,.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(530, 585, 225, 82, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(530, 585, 190, 67, 0, 0, Math.PI * 2); ctx.stroke();

    // large arched window left
    windowFrame(ctx, 130, 74, 260, 204, {
      frame: '#1d1a15', warm: false, panes: [3, 2], glowAlpha: 0.6, arch: true, seed: 6,
      interior: (c, x, y, w, h) => {
        c.fillStyle = 'rgba(60,90,110,.4)'; c.fillRect(x, y, w, h);
        // platform lamps beyond
        for (let i = 0; i < 2; i++) {
          c.fillStyle = 'rgba(255,200,120,.5)';
          c.beginPath(); c.arc(x + w * (0.3 + i * 0.45), y + h * 0.52, 5, 0, Math.PI * 2); c.fill();
        }
      }
    });
    // rain streaks through window
    ctx.save();
    ctx.globalAlpha = 0.12;
    const rand = seeded(41);
    ctx.strokeStyle = '#bcd4dd';
    for (let i = 0; i < 30; i++) {
      const x = 130 + rand() * 260, y = 74 + rand() * 204;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 8 + rand() * 12); ctx.stroke();
    }
    ctx.restore();

    // station sign
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '500 34px Fraunces, serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '5px';
    ctx.fillStyle = '#d8c9a7';
    ctx.fillText('EMBER HOLLOW', 636, 72);
    ctx.font = '8px Karla, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
    ctx.fillStyle = 'rgba(232,200,141,.55)';
    ctx.fillText('COASTAL RAILWAY  ·  EST. 1881', 636, 98);
    ctx.restore();
    ctx.strokeStyle = 'rgba(218,199,161,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(480, 90); ctx.lineTo(792, 90); ctx.stroke();

    // timetable board
    const tx = 484, ty = 122, tw = 316, th = 142;
    ctx.fillStyle = '#221a13';
    fillRR(ctx, tx, ty, tw, th, 2, '#221a13');
    ctx.fillStyle = '#c8b486';
    fillRR(ctx, tx + 5, ty + 5, tw - 10, th - 10, 1, '#c8b486');
    ctx.fillStyle = '#2c241a';
    ctx.font = '500 11px Fraunces, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText('DEPARTURES', tx + tw / 2, ty + 20);
    ctx.strokeStyle = 'rgba(70,55,35,.5)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(tx + 18, ty + 31); ctx.lineTo(tx + tw - 18, ty + 31); ctx.stroke();
    const rows = [['4:05', 'Saltmarsh'], ['5:22', 'Wrenfield'], ['6:40', 'Coast'], ['8:17', 'Terminus']];
    rows.forEach((r, i) => {
      ctx.textAlign = 'left';
      ctx.font = `${i === 3 ? '500' : '400'} 10px Karla, sans-serif`;
      ctx.fillStyle = i === 3 ? '#7b3f2e' : '#3b3023';
      ctx.fillText(r[1], tx + 22, ty + 51 + i * 20);
      ctx.textAlign = 'right';
      ctx.fillText(r[0], tx + tw - 22, ty + 51 + i * 20);
      if (i === 3) {
        ctx.strokeStyle = 'rgba(140,70,50,.55)';
        ctx.beginPath(); ctx.ellipse(tx + tw - 46, ty + 51 + i * 20, 22, 8, 0, 0, Math.PI * 2); ctx.stroke();
      }
    });
    ctx.save();
    ctx.translate(tx + tw - 26, ty + 134);
    ctx.fillStyle = '#8a5a3a';
    ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // notice board
    const nx = 292, ny = 130, nw = 136, nh = 118;
    ctx.fillStyle = '#2f2419';
    fillRR(ctx, nx, ny, nw, nh, 2, '#2f2419');
    ctx.fillStyle = '#c5b08a';
    ctx.fillRect(nx + 5, ny + 5, nw - 10, nh - 10);
    const pr = seeded(17);
    for (let i = 0; i < 4; i++) {
      const px = nx + 12 + (i % 2) * 58, py = ny + 12 + Math.floor(i / 2) * 48;
      ctx.fillStyle = ['#e6d9b9', '#d8c59e', '#eee2c6'][i % 3];
      ctx.save(); ctx.translate(px, py); ctx.rotate((pr() - 0.5) * 0.06);
      ctx.fillRect(0, 0, 50, 40);
      ctx.fillStyle = 'rgba(75,55,35,.4)';
      for (let j = 0; j < 4; j++) ctx.fillRect(5, 8 + j * 7, 40 - (j % 2) * 12, 1.5);
      ctx.restore();
      ctx.fillStyle = '#8a4a3a';
      ctx.beginPath(); ctx.arc(px + 8, py + 2, 1.8, 0, Math.PI * 2); ctx.fill();
    }

    // clock above
    clockFace(ctx, 640, 210, 40, { time: [8, 17], face: '#ddd0b2', rim: '#594b37', numerals: true, shadow: false });
    ctx.strokeStyle = '#3a2f22'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(640, 210, 45, 0, Math.PI * 2); ctx.stroke();
    glow(ctx, 640, 210, 60, 'rgba(255,215,160,.06)');

    // ticket window right
    const wx = 900, wy = 134, ww = 250, wh = 160;
    ctx.fillStyle = '#292019';
    fillRR(ctx, wx - 8, wy - 8, ww + 16, wh + 16, 3, '#292019');
    ctx.fillStyle = linear(ctx, wx, wy, wx, wy + wh, [[0, '#5b4a33'], [1, '#372c20']]);
    ctx.fillRect(wx, wy, ww, wh);
    // grille
    ctx.strokeStyle = 'rgba(190,160,100,.42)';
    ctx.lineWidth = 1.1;
    for (let x = wx + 24; x < wx + ww - 16; x += 19) {
      ctx.beginPath(); ctx.moveTo(x, wy + 16); ctx.lineTo(x, wy + wh - 16); ctx.stroke();
    }
    for (let y = wy + 30; y < wy + wh - 16; y += 26) {
      ctx.beginPath(); ctx.moveTo(wx + 16, y); ctx.lineTo(wx + ww - 12, y); ctx.stroke();
    }
    // window opening
    ctx.fillStyle = 'rgba(14,22,26,.6)';
    fillRR(ctx, wx + 18, wy + 36, ww - 36, wh - 62, 2, 'rgba(14,22,26,.6)');
    // brass plate
    ctx.fillStyle = '#9a7b45';
    fillRR(ctx, wx + 52, wy + wh + 14, 146, 18, 2, '#9a7b45');
    ctx.fillStyle = '#2b2115';
    ctx.font = '8px Karla, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.6px';
    ctx.fillText('TICKETS  ·  ENQUIRIES', wx + ww / 2, wy + wh + 23);

    // platform door right
    const px = 1174, py = 178;
    ctx.fillStyle = '#1b1813';
    fillRR(ctx, px - 6, py - 6, 84, 166, 2, '#1b1813');
    ctx.fillStyle = '#26363d';
    fillRR(ctx, px, py, 72, 160, 2, '#26363d');
    // glass door with cool platform light
    windowFrame(ctx, px + 9, py + 12, 54, 108, { frame: '#1d1a15', warm: false, panes: [1, 2], glowAlpha: 0.7, seed: 9, sill: false });
    // push bar
    ctx.fillStyle = '#b0975f';
    fillRR(ctx, px + 10, py + 94, 52, 3, 1, '#b0975f');
    // sign above
    ctx.fillStyle = '#27352f';
    fillRR(ctx, px - 26, py - 38, 124, 22, 1, '#27352f');
    ctx.fillStyle = '#d8c9a7';
    ctx.font = '9px Karla, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText('TO THE CLIFF', px + 36, py - 27);
    glow(ctx, px + 36, py + 70, 80, 'rgba(140,175,195,.13)');

    // street door left
    const sx = 52, sy = 168;
    ctx.fillStyle = '#1b1813';
    fillRR(ctx, sx - 6, sy - 6, 86, 178, 2, '#1b1813');
    wood(ctx, sx, sy, 74, 172, { base: '#3f2d1e', light: '#58402a', dark: '#291d13', vertical: true, seed: 23 });
    windowFrame(ctx, sx + 12, sy + 14, 50, 60, { frame: '#241d16', warm: true, panes: [1, 2], glowAlpha: 0.35, seed: 5, sill: false });
    ctx.fillStyle = '#b29357';
    ctx.beginPath(); ctx.arc(sx + 64, sy + 104, 3, 0, Math.PI * 2); ctx.fill();
    // "WAY OUT"
    ctx.fillStyle = 'rgba(226,207,170,.7)';
    ctx.font = '8px Karla, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText('LANTERN ROW', sx + 37, sy - 16);

    // benches
    for (const by of [476, 590]) {
      const bx = 356;
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(bx + 100, by + 37, 110, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4e3521'; fillRR(ctx, bx, by, 200, 10, 2, '#4e3521');
      ctx.fillStyle = '#402b1b'; fillRR(ctx, bx + 4, by + 11, 192, 8, 2, '#402b1b');
      ctx.fillStyle = '#573a24'; fillRR(ctx, bx, by - 26, 200, 9, 2, '#573a24');
      ctx.fillStyle = '#2b2a26';
      ctx.fillRect(bx + 12, by + 18, 7, 22);
      ctx.fillRect(bx + 181, by + 18, 7, 22);
    }

    // ticket counter
    const cx = 854, cy = 372, cw = 320, ch = 66;
    wood(ctx, cx, cy, cw, ch, { base: '#4a3523', light: '#60452a', dark: '#301f13', seed: 31 });
    ctx.fillStyle = '#5f452b';
    fillRR(ctx, cx - 8, cy - 8, cw + 16, 12, 2, '#5f452b');
    ctx.fillStyle = 'rgba(255,230,190,.08)';
    ctx.fillRect(cx - 4, cy - 5, cw + 8, 2);
    // logbook on counter
    ctx.save();
    ctx.translate(930, 352);
    ctx.rotate(-0.03);
    ctx.fillStyle = '#251c14';
    fillRR(ctx, -56, -12, 112, 30, 2, '#251c14');
    ctx.fillStyle = '#d9cba9';
    fillRR(ctx, -52, -16, 104, 28, 1, '#d9cba9');
    ctx.strokeStyle = 'rgba(80,60,35,.3)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-44, -9 + i * 7); ctx.lineTo(44, -9 + i * 7); ctx.stroke();
    }
    ctx.restore();
    // bell
    ctx.fillStyle = '#a88744';
    ctx.beginPath(); ctx.arc(1100, 350, 7, Math.PI, 0); ctx.lineTo(1109, 358); ctx.lineTo(1091, 358); ctx.closePath(); ctx.fill();
    // small lamp
    ctx.fillStyle = '#23321f';
    fillRR(ctx, 864, 320, 18, 30, 2, '#23321f');
    glow(ctx, 873, 334, 35, 'rgba(255,205,130,.25)');

    // stationmaster's desk
    const dx = 1052, dy = 516, dw = 186, dh = 76;
    wood(ctx, dx, dy, dw, dh, { base: '#4b3321', light: '#68492b', dark: '#2e1e12', seed: 42 });
    ctx.fillStyle = 'rgba(255,232,190,.05)';
    ctx.fillRect(dx + 6, dy + 4, dw - 12, 2);
    // drawers
    ctx.strokeStyle = 'rgba(35,22,12,.6)'; ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.strokeRect(dx + 18, dy + 18 + i * 24, 60, 18);
      ctx.fillStyle = '#b0915c';
      ctx.beginPath(); ctx.arc(dx + 48, dy + 27 + i * 24, 2, 0, Math.PI * 2); ctx.fill();
    }
    // green desk lamp
    ctx.fillStyle = '#21372e';
    ctx.beginPath(); ctx.ellipse(dx + 136, dy + 16, 20, 8, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(dx + 134, dy + 16, 3, 14);
    ctx.fillRect(dx + 125, dy + 29, 22, 3);
    glow(ctx, dx + 136, dy + 22, 55, 'rgba(255,205,130,.18)');
    // papers + keyhole
    ctx.fillStyle = '#d6c7a5';
    ctx.save(); ctx.translate(dx + 96, dy + 8); ctx.rotate(-0.06); ctx.fillRect(0, 0, 26, 22); ctx.restore();
    ctx.fillStyle = '#1f1912';
    ctx.beginPath(); ctx.arc(dx + 18, dy + 43, 2.5, 0, Math.PI * 2); ctx.fill();

    // luggage
    ctx.fillStyle = '#3f2b1c';
    fillRR(ctx, 154, 566, 52, 38, 4, '#3f2b1c');
    ctx.fillStyle = '#5c4026';
    fillRR(ctx, 158, 570, 44, 30, 2, '#5c4026');
    ctx.strokeStyle = '#2d2015'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(158, 585); ctx.lineTo(202, 585); ctx.stroke();
    ctx.fillStyle = '#b5975f';
    ctx.fillRect(176, 570, 8, 4);
    // small case
    ctx.fillStyle = '#40342b';
    fillRR(ctx, 212, 592, 36, 24, 3, '#40342b');
    // sleeping dog
    ctx.save();
    ctx.translate(280, 630);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(0, 2, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5c4936';
    ctx.beginPath(); ctx.ellipse(0, -8, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-24, -14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#47382a';
    ctx.beginPath(); ctx.ellipse(-29, -20, 4.5, 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-19, -20, 4.5, 6, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(220,205,180,.45)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-30, -15); ctx.quadraticCurveTo(-28, -14, -27, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-21, -15); ctx.quadraticCurveTo(-19, -14, -18, -15); ctx.stroke();
    ctx.strokeStyle = '#5c4936'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(24, -8); ctx.quadraticCurveTo(36, -4, 30, -16); ctx.stroke();
    ctx.restore();

    // floor light pools
    glow(ctx, 530, 420, 190, 'rgba(140,175,195,.1)');
    glow(ctx, 960, 560, 160, 'rgba(255,200,130,.12)');
    glow(ctx, 960, 180, 100, 'rgba(140,175,195,.12)');
    vignette(ctx, 0.55, '2,6,9');
  },

  dynamic(ctx, state, t) {
    dust(ctx, t, { count: 20, color: '200,220,230', area: [100, 80, 1080, 500], alpha: 0.12 });
    // clock is stopped at 8:17. After the station ending it quietly runs again.
    if (state.flags.ending === 'station') {
      ctx.save();
      ctx.globalAlpha = 0.9;
      const sec = Math.floor(t) % 60;
      clockFace(ctx, 640, 210, 40, { time: [8, 17], face: '#ddd0b2', rim: '#594b37', numerals: true, shadow: false });
      // second hand
      const a = (sec / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = 'rgba(70,50,35,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(640, 210); ctx.lineTo(640 + Math.cos(a) * 31, 210 + Math.sin(a) * 31); ctx.stroke();
      ctx.restore();
    }
    // rain on window
    const rand = seeded(5);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#c7dce2'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 18; i++) {
      const px = 140 + ((rand() * 240 + t * 4) % 240);
      const py = 86 + ((rand() * 180 + t * 22) % 180);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 1, py + 7); ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, t) {
    // counter front, drawn over the player when they stand behind it
    const cx = 854, cy = 430, cw = 320, ch = 24;
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(cx - 4, cy, cw + 8, 18);
    ctx.fillStyle = 'rgba(255,235,195,.05)';
    ctx.fillRect(cx, cy, cw, 2);
    ctx.strokeStyle = 'rgba(20,12,7,.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) ctx.strokeRect(cx + 20 + i * 100, cy + 4, 80, 10);
    // desk front
    ctx.fillStyle = '#3b2718';
    ctx.fillRect(1048, 560, 194, 32);
    ctx.fillStyle = 'rgba(255,235,195,.04)';
    ctx.fillRect(1050, 562, 190, 2);
  },

  walk: [
    { x: 36, y: 336, w: 1210, h: 368 }
  ],
  blockers: [
    { x: 50, y: 160, w: 90, h: 186 },
    { x: 352, y: 446, w: 210, h: 100 },
    { x: 352, y: 560, w: 210, h: 100 },
    { x: 850, y: 366, w: 330, h: 84 },
    { x: 1046, y: 510, w: 200, h: 88 },
    { x: 148, y: 560, w: 110, h: 70 },
    { x: 256, y: 618, w: 66, h: 34 },
    { x: 1170, y: 176, w: 80, h: 150 }
  ],
  hotspots: [
    { id: 'streetDoor', x: 92, y: 356, r: 76, label: 'Step back onto Lantern Row', kind: 'exit', action: 'go:street' },
    { id: 'platformDoor', x: 1206, y: 356, r: 78, label: 'Go out to the cliff path', kind: 'exit', action: 'go:cliff' },
    { id: 'timetable', x: 634, y: 306, r: 76, label: 'Read the departures board', action: 'evidence:timetable' },
    { id: 'logbook', x: 930, y: 402, r: 64, label: 'Open the station log', action: 'evidence:log' },
    { id: 'desk', x: 1128, y: 552, r: 72, label: 'Search the stationmaster’s desk', action: 'station:desk' },
    { id: 'stationClock', x: 640, y: 260, r: 62, label: 'Look at the station clock', action: 'look:stationclock' },
    { id: 'bench', x: 456, y: 516, r: 64, label: 'Sit for a moment', action: 'look:bench' },
    { id: 'luggage', x: 178, y: 588, r: 62, label: 'Look at the left luggage', action: 'look:luggage' },
    { id: 'violet', x: 260, y: 650, r: 54, label: 'Something pressed under the bench', kind: 'keepsake', action: 'keepsake:violet', when: s => !s.keepsakes.includes('violet') },
    { id: 'noticeBoard', x: 360, y: 306, r: 58, label: 'Read the notice board', action: 'look:notices' }
  ]
};

// ---------------------------------------------------------------
// Cliff path
// ---------------------------------------------------------------
export const cliff = {
  id: 'cliff',
  info: { name: 'The Cliff Path', sub: 'Salt, gorse, and weather' },
  outdoor: true,
  weather: { rain: 220, fog: true, lightning: true, wind: -0.4 },
  spawn: { x: 150, y: 584, dir: 'right' },

  draw(ctx, state) {
    // sky
    sky(ctx, '#0a1520', '#253747', true);
    // sea
    const sea = linear(ctx, 0, 302, 0, 500, [[0, '#203842'], [0.4, '#2b4a53'], [1, '#35565c']]);
    ctx.fillStyle = sea;
    ctx.fillRect(0, 300, W, 240);
    // horizon glow
    glow(ctx, 330, 350, 420, 'rgba(210,190,150,.08)');
    // distant lighthouse on headland left
    ctx.fillStyle = '#1a262d';
    ctx.fillRect(182, 236, 20, 76);
    ctx.beginPath(); ctx.moveTo(177, 240); ctx.lineTo(192, 214); ctx.lineTo(207, 240); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,210,150,.35)';
    ctx.beginPath(); ctx.arc(192, 230, 3, 0, Math.PI * 2); ctx.fill();
    // waves
    const rand = seeded(61);
    for (let i = 0; i < 70; i++) {
      const y = 322 + rand() * 190;
      const x = rand() * W;
      const len = 8 + rand() * 40;
      ctx.strokeStyle = `rgba(${150 + rand() * 50},${185 + rand() * 40},${190 + rand() * 30},${0.06 + rand() * 0.14})`;
      ctx.lineWidth = 0.7 + rand() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.5, y - 2 - rand() * 3, x + len, y);
      ctx.stroke();
    }
    // whitecaps
    for (let i = 0; i < 16; i++) {
      const x = rand() * W, y = 430 + rand() * 60;
      ctx.strokeStyle = 'rgba(215,230,228,.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 12, y - 4, x + 26, y); ctx.stroke();
    }

    // cliffs
    ctx.fillStyle = '#1b2528';
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.quadraticCurveTo(160, 400, 330, 430);
    ctx.quadraticCurveTo(520, 460, 690, 442);
    ctx.quadraticCurveTo(860, 420, 1000, 430);
    ctx.lineTo(1000, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
    stone(ctx, 0, 430, 1000, 290, { base: '#3d4542', seed: 44, scale: 0.9 });
    // darken left cliff
    ctx.fillStyle = 'rgba(8,14,17,.35)';
    ctx.beginPath();
    ctx.moveTo(0, 430); ctx.quadraticCurveTo(170, 404, 330, 432);
    ctx.lineTo(330, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();

    // path
    ctx.fillStyle = '#5c5a4b';
    ctx.beginPath();
    ctx.moveTo(0, 640);
    ctx.quadraticCurveTo(180, 600, 360, 620);
    ctx.quadraticCurveTo(560, 644, 760, 616);
    ctx.quadraticCurveTo(940, 594, 1150, 610);
    ctx.lineTo(1150, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
    // path texture
    const pth = seeded(72);
    for (let i = 0; i < 180; i++) {
      const x = pth() * 1150, y = 612 + pth() * 105;
      ctx.fillStyle = `rgba(${120 + pth() * 40},${112 + pth() * 35},${92 + pth() * 25},${0.05 + pth() * 0.12})`;
      ctx.beginPath(); ctx.ellipse(x, y, 3 + pth() * 12, 1 + pth() * 4, pth() * 3, 0, Math.PI * 2); ctx.fill();
    }
    // grass edges
    for (let i = 0; i < 90; i++) {
      const x = pth() * 1100, y = 585 + pth() * 30;
      ctx.strokeStyle = `rgba(${70 + pth() * 30},${88 + pth() * 35},${62 + pth() * 20},${0.2 + pth() * 0.3})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1, y - 5, x + 4, y - 8 - pth() * 8); ctx.stroke();
    }

    // fence along path
    const fx0 = 60, fx1 = 760, fy = 588;
    ctx.strokeStyle = '#3c3224'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(fx0, fy); ctx.quadraticCurveTo(400, fy - 14, fx1, fy - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx0, fy + 16); ctx.quadraticCurveTo(400, fy + 2, fx1, fy + 12); ctx.stroke();
    for (let x = fx0; x <= fx1; x += 64) {
      const yy = fy + Math.sin((x - fx0) / 120) * -4;
      ctx.strokeStyle = '#3c3224'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, yy - 12); ctx.lineTo(x + 1, yy + 30); ctx.stroke();
      ctx.fillStyle = 'rgba(230,210,170,.12)';
      ctx.fillRect(x - 1, yy - 12, 1, 6);
    }

    // gorse bushes
    const bush = seeded(88);
    for (let i = 0; i < 9; i++) {
      const x = 60 + bush() * 720, y = 500 + bush() * 60;
      ctx.fillStyle = `rgba(${48 + bush() * 20},${62 + bush() * 25},${44 + bush() * 15},.75)`;
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + bush() * 22, 10 + bush() * 12, bush(), 0, Math.PI * 2);
      ctx.fill();
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(200,170,75,.4)';
        for (let j = 0; j < 5; j++) {
          ctx.beginPath(); ctx.arc(x - 10 + bush() * 20, y - 4 + bush() * 8, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // lighthouse
    const lx = 1010, ly = 100;
    ctx.save();
    // rock base
    ctx.fillStyle = '#2c3434';
    ctx.beginPath();
    ctx.moveTo(900, 560); ctx.lineTo(920, 470); ctx.lineTo(960, 430);
    ctx.lineTo(1020, 416); ctx.lineTo(1100, 432); ctx.lineTo(1160, 480);
    ctx.lineTo(1190, 570); ctx.lineTo(1170, 620); ctx.lineTo(940, 620); ctx.closePath(); ctx.fill();
    stone(ctx, 930, 500, 240, 110, { base: '#3a4140', seed: 12, scale: 0.8 });
    // tower
    const towerGrad = linear(ctx, lx - 55, 0, lx + 55, 0, [[0, '#c8c1ae'], [0.32, '#e0d9c6'], [0.7, '#bfb7a4'], [1, '#918b7c']]);
    ctx.fillStyle = towerGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 44, 210);
    ctx.lineTo(lx + 44, 210);
    ctx.lineTo(lx + 58, 500);
    ctx.lineTo(lx - 58, 500);
    ctx.closePath(); ctx.fill();
    // red bands
    ctx.fillStyle = 'rgba(143,75,56,.7)';
    ctx.beginPath();
    ctx.moveTo(lx - 50, 330); ctx.lineTo(lx + 50, 330); ctx.lineTo(lx + 53, 375); ctx.lineTo(lx - 53, 375); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx - 55, 440); ctx.lineTo(lx + 55, 440); ctx.lineTo(lx + 57, 470); ctx.lineTo(lx - 57, 470); ctx.closePath(); ctx.fill();
    // shading
    ctx.fillStyle = 'rgba(25,30,32,.24)';
    ctx.beginPath(); ctx.moveTo(lx + 8, 210); ctx.lineTo(lx + 44, 210); ctx.lineTo(lx + 58, 500); ctx.lineTo(lx + 16, 500); ctx.closePath(); ctx.fill();
    // gallery
    ctx.fillStyle = '#2b3234';
    ctx.fillRect(lx - 54, 202, 108, 12);
    ctx.fillStyle = '#3a4143';
    for (let i = -48; i <= 48; i += 12) ctx.fillRect(lx + i, 190, 2.4, 16);
    // lantern room
    ctx.fillStyle = 'rgba(255,215,150,.22)';
    ctx.beginPath();
    ctx.moveTo(lx - 30, 188); ctx.lineTo(lx + 30, 188); ctx.lineTo(lx + 30, 142); ctx.lineTo(lx - 30, 142); ctx.closePath(); ctx.fill();
    windowFrame(ctx, lx - 26, 144, 52, 44, { frame: '#232b2e', warm: true, panes: [2, 1], glowAlpha: 0.95, seed: 3, sill: false });
    // dome
    ctx.fillStyle = '#2b3234';
    ctx.beginPath(); ctx.ellipse(lx, 142, 34, 16, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(lx - 2, 118, 4, 12);
    ctx.beginPath(); ctx.arc(lx, 116, 4, 0, Math.PI * 2); ctx.fill();
    // door
    const dx = lx - 26, dy = 452;
    ctx.fillStyle = '#20282a';
    fillRR(ctx, dx - 4, dy - 4, 60, 112, 3, '#20282a');
    wood(ctx, dx, dy, 52, 108, { base: '#2e3a3c', light: '#435154', dark: '#1c2426', vertical: true, seed: 18 });
    windowFrame(ctx, dx + 10, dy + 12, 32, 36, { frame: '#1d2426', warm: true, panes: [1, 1], glowAlpha: 0.8, seed: 7, sill: false });
    ctx.fillStyle = '#b99a62';
    ctx.beginPath(); ctx.arc(dx + 44, dy + 70, 2.5, 0, Math.PI * 2); ctx.fill();
    glow(ctx, lx, 166, 120, 'rgba(255,215,150,.18)');
    ctx.restore();
    glow(ctx, lx, 166, 180, 'rgba(255,215,150,.08)');

    // path sign
    ctx.save();
    ctx.translate(108, 526);
    ctx.strokeStyle = '#3c3224'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -56); ctx.stroke();
    ctx.fillStyle = '#3c3224';
    ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(64, -56); ctx.lineTo(74, -48); ctx.lineTo(64, -40); ctx.lineTo(0, -40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8c9a7'; ctx.font = '8px Karla, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    ctx.fillText('STATION', 10, -48);
    ctx.restore();

    // puddles
    puddle(ctx, 430, 646, 76, 16, { warm: false, seed: 7 });
    puddle(ctx, 860, 668, 54, 12, { warm: true, seed: 3 });

    // sea glass glint spot
    ctx.fillStyle = 'rgba(155,190,170,.55)';
    ctx.beginPath(); ctx.ellipse(760, 654, 4, 2.4, 0.4, 0, Math.PI * 2); ctx.fill();

    vignette(ctx, 0.62, '1,5,8');
  },

  dynamic(ctx, state, t) {
    // sweeping beam
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const angle = Math.sin(t * 0.22) * 0.5 - 0.16;
    ctx.translate(1010, 166);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, 900, 0);
    g.addColorStop(0, 'rgba(255,218,155,.14)');
    g.addColorStop(0.4, 'rgba(255,218,155,.05)');
    g.addColorStop(1, 'rgba(255,218,155,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(900, -110); ctx.lineTo(900, 110); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
    // waves and spray
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const x = ((t * 6 + i * 260) % (W + 200)) - 100;
      const y = 500 + Math.sin(t * 0.8 + i) * 8;
      ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t + i);
      ctx.fillStyle = '#d9e6e4';
      ctx.beginPath(); ctx.ellipse(x, y, 130, 14, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    mist(ctx, t, { y: 500, alpha: 0.05, count: 3 });
    // gulls
    ctx.save();
    ctx.strokeStyle = 'rgba(210,225,230,.4)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const gx = 300 + ((t * 9 + i * 220) % 900);
      const gy = 240 + i * 34 + Math.sin(t * 0.7 + i) * 12;
      ctx.beginPath();
      ctx.moveTo(gx - 7, gy); ctx.quadraticCurveTo(gx - 3, gy - 4, gx, gy);
      ctx.quadraticCurveTo(gx + 3, gy - 4, gx + 7, gy);
      ctx.stroke();
    }
    ctx.restore();
    // door light
    glow(ctx, 1010, 500, 70, 'rgba(255,205,140,.12)');
  },

  drawForeground(ctx, state, t) {
    // foreground gorse
    ctx.fillStyle = 'rgba(10,16,18,.5)';
    ctx.beginPath();
    ctx.moveTo(0, 694);
    ctx.quadraticCurveTo(90, 666, 180, 690);
    ctx.quadraticCurveTo(250, 706, 300, 700);
    ctx.lineTo(300, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
  },

  walk: [
    { x: 30, y: 596, w: 1120, h: 108 }
  ],
  blockers: [
    { x: 900, y: 400, w: 280, h: 210 },
    { x: 90, y: 526, w: 20, h: 46 },
    { x: 400, y: 640, w: 70, h: 20 }
  ],
  hotspots: [
    { id: 'lighthouseDoor', x: 1010, y: 594, r: 82, label: 'Knock at the lighthouse door', action: 'lighthouse:door' },
    { id: 'glass', x: 760, y: 654, r: 52, label: 'A piece of sea glass', kind: 'keepsake', action: 'keepsake:glass', when: s => !s.keepsakes.includes('glass') },
    { id: 'seaView', x: 420, y: 570, r: 66, label: 'Look out at the sea', action: 'look:sea' },
    { id: 'cliffExit', x: 42, y: 642, r: 64, label: 'Return to the station', kind: 'exit', action: 'go:station' },
    { id: 'lighthouseWindow', x: 1010, y: 540, r: 54, label: 'Look up at the light', action: 'look:light' }
  ]
};
