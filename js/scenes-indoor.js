// ---------------------------------------------------------------
// THE LITTLE THINGS — interior scenes
// ---------------------------------------------------------------
import {
  W, H, fillRR, linear, radial, glow, wash, wood, floorBoards, wallpaper,
  windowFrame, plant, books, clockFace, gearShape, mist, dust, vignette,
  label, seeded, mix, softShadow, puddle, brick, stone
} from './paint.js';
import { drawCat, drawPerson } from './chars.js';

function hangingLamp(ctx, x, y, opts = {}) {
  const { len = 90, scale = 1, shade = '#3b2c1e', light = 'rgba(255,205,130,.3)' } = opts;
  ctx.save();
  ctx.strokeStyle = '#211a13'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - len); ctx.stroke();
  ctx.translate(x, y - len);
  ctx.scale(scale, scale);
  // shade
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(-28, 8);
  ctx.quadraticCurveTo(-22, -10, 0, -12);
  ctx.quadraticCurveTo(22, -10, 28, 8);
  ctx.lineTo(14, 14);
  ctx.lineTo(-14, 14);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(230,195,140,.22)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-26, 6); ctx.quadraticCurveTo(0, -8, 26, 6); ctx.stroke();
  // bulb
  ctx.fillStyle = 'rgba(255,220,160,.9)';
  ctx.beginPath(); ctx.ellipse(0, 13, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  glow(ctx, x, y - len + 16, 120 * scale, light);
  // warm pool on floor
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = radial(ctx, x, y + 75, 0, 130 * scale, [[0, 'rgba(255,200,120,.08)'], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(x - 160, y - 40, 320, 300);
  ctx.restore();
}

function shelfUnit(ctx, x, y, w, h, opts = {}) {
  const { shelves = 3, seed = 1, base = '#3a281a', goods = true } = opts;
  wood(ctx, x, y, w, h, { base, light: mix(base, '#b08852', 0.2), dark: mix(base, '#000', 0.35), seed });
  const rand = seeded(seed + 4);
  for (let i = 1; i <= shelves; i++) {
    const sy = y + (h / (shelves + 1)) * i;
    ctx.fillStyle = mix(base, '#000', 0.35);
    ctx.fillRect(x + 4, sy, w - 8, 5);
    ctx.fillStyle = 'rgba(255,235,190,.07)';
    ctx.fillRect(x + 4, sy, w - 8, 1);
    if (goods) {
      let px = x + 10;
      while (px < x + w - 12) {
        const gw = 6 + rand() * 14, gh = 8 + rand() * 22;
        const kind = Math.floor(rand() * 4);
        if (kind === 0) {
          ctx.fillStyle = ['#6c4530', '#4b5a4a', '#7b6236', '#3f4c5e'][Math.floor(rand() * 4)];
          fillRR(ctx, px, sy - gh, gw, gh, 1.5, ctx.fillStyle);
          ctx.fillStyle = 'rgba(255,240,205,.14)';
          ctx.fillRect(px + 1, sy - gh + 2, gw - 2, 1);
        } else if (kind === 1) {
          ctx.strokeStyle = '#b0945b'; ctx.lineWidth = 1; ctx.fillStyle = 'rgba(60,45,30,.55)';
          ctx.beginPath(); ctx.arc(px + 6, sy - 8, 6, Math.PI, 0); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#8a6a3d'; ctx.fillRect(px + 5, sy - 8, 2, 8);
        } else if (kind === 2) {
          ctx.fillStyle = '#8a6d42';
          ctx.beginPath(); ctx.ellipse(px + 7, sy - 5, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,240,200,.15)';
          ctx.beginPath(); ctx.ellipse(px + 5, sy - 7, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = ['#5a3c29', '#3e4d43', '#584b34'][Math.floor(rand() * 3)];
          fillRR(ctx, px, sy - 10, gw + 3, 10, 1, ctx.fillStyle);
        }
        px += gw + 8 + rand() * 6;
      }
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2;
  ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
}

function roundRug(ctx, x, y, rx, ry, opts = {}) {
  const { c1 = '#5a3d2d', c2 = '#8a5a3f', c3 = '#3c4f48' } = opts;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = c2; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(x, y, rx * 0.9, ry * 0.88, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = c3; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.ellipse(x, y, rx * 0.7, ry * 0.66, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(230,210,170,.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y, rx * 0.52, ry * 0.48, 0, 0, Math.PI * 2); ctx.stroke();
  // painted motifs
  const rand = seeded(rx + ry);
  ctx.fillStyle = 'rgba(210,180,130,.14)';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * rx * 0.56, y + Math.sin(a) * ry * 0.54, 4, 2.4, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function chair(ctx, x, y, opts = {}) {
  const { scale = 1, facing = 'down', color = '#4a3220' } = opts;
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  fillRR(ctx, -17, -13, 34, 15, 2, color);
  ctx.fillStyle = mix(color, '#000', 0.25);
  ctx.fillRect(-16, 0, 6, 16);
  ctx.fillRect(10, 0, 6, 16);
  if (facing === 'down') {
    ctx.fillStyle = mix(color, '#a98252', 0.16);
    fillRR(ctx, -18, -23, 36, 12, 2, ctx.fillStyle);
    ctx.fillStyle = mix(color, '#000', 0.2);
    for (let i = -1; i <= 1; i++) ctx.fillRect(i * 11 - 1.5, -22, 3, 10);
  } else {
    ctx.fillStyle = mix(color, '#000', 0.2);
    fillRR(ctx, -18, 4, 36, 6, 2, '#33241a');
  }
  ctx.restore();
}

function roundTable(ctx, x, y, opts = {}) {
  const { scale = 1, lamps = 1 } = opts;
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(0, 8, 52, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f2a1b';
  ctx.fillRect(-4, 0, 8, 32);
  ctx.fillStyle = '#2f2015';
  ctx.beginPath(); ctx.ellipse(0, 32, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  // top
  ctx.fillStyle = '#5f4128';
  ctx.beginPath(); ctx.ellipse(0, -2, 50, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6f4b2e';
  ctx.beginPath(); ctx.ellipse(0, -6, 50, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,235,195,.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, -6, 44, 20, 0, 0, Math.PI * 2); ctx.stroke();
  // cloth
  ctx.fillStyle = 'rgba(230,218,190,.82)';
  ctx.beginPath(); ctx.ellipse(14, -8, 27, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,250,.2)';
  ctx.beginPath(); ctx.ellipse(12, -10, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
  // cups
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = '#e6dcc5';
    ctx.beginPath(); ctx.ellipse(-2 + i * 22, -12 - i * 2, 4.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a6a45';
    ctx.beginPath(); ctx.ellipse(-2 + i * 22, -12.6 - i * 2, 2.7, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  }
  // candle/lamp
  ctx.fillStyle = '#b0945b'; ctx.fillRect(-22, -20, 3, 7);
  ctx.fillStyle = 'rgba(255,220,160,.9)';
  ctx.beginPath(); ctx.ellipse(-20.5, -22, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  glow(ctx, -20.5, -22, 36, 'rgba(255,205,130,.22)');
  ctx.restore();
}

function drawSmallWatch(ctx, x, y, s = 1, t = 0, lit = true) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  // chain
  ctx.strokeStyle = '#a88448'; ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(6, -7);
  ctx.bezierCurveTo(20, -4, 22, 6, 12, 8);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#c9a35e' : '#9d793e';
    ctx.beginPath(); ctx.ellipse(9 + i * 4, -7 + Math.sin(i) * 2, 1.6, 1, 0.5, 0, Math.PI * 2); ctx.fill();
  }
  // case
  const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
  g.addColorStop(0, '#f0cf8a'); g.addColorStop(0.6, '#c39a4f'); g.addColorStop(1, '#7d5b2d');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eadfc4';
  ctx.beginPath(); ctx.arc(0, 0, 6.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(60,45,25,.8)'; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-3, -2.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1.8, -4.6); ctx.stroke();
  ctx.fillStyle = '#6f5028';
  ctx.beginPath(); ctx.arc(0, 0, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a58144'; ctx.fillRect(-1.4, -11, 2.8, 3);
  if (lit) {
    glow(ctx, 0, 0, 24, 'rgba(255,215,150,.16)');
  }
  ctx.restore();
}

// ---------------------------------------------------------------
// Shop
// ---------------------------------------------------------------
export const shop = {
  id: 'shop',
  info: { name: 'The Little Things', sub: 'Your shop · Ember Hollow' },
  weather: { rain: 0, fog: false, lightning: false, indoor: true },
  spawn: { x: 640, y: 610, dir: 'up' },

  draw(ctx, state) {
    // wall
    ctx.fillStyle = '#15252a';
    ctx.fillRect(0, 0, W, 348);
    wallpaper(ctx, 0, 0, W, 250, { base: '#344a4a', stripe: 'rgba(240,225,190,.025)', seed: 8, motif: true });
    // top ceiling shadow
    const top = linear(ctx, 0, 0, 0, 60, [[0, 'rgba(4,8,10,.7)'], [1, 'rgba(4,8,10,0)']]);
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, 60);
    // wainscot
    ctx.fillStyle = '#241d16';
    ctx.fillRect(0, 248, W, 100);
    for (let x = 10; x < W; x += 72) {
      ctx.fillStyle = 'rgba(10,7,5,.35)';
      ctx.fillRect(x, 262, 62, 78);
      ctx.strokeStyle = 'rgba(230,195,140,.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, 265, 56, 72);
    }
    ctx.fillStyle = '#3a2a1b';
    ctx.fillRect(0, 246, W, 8);
    ctx.fillStyle = 'rgba(240,210,160,.14)';
    ctx.fillRect(0, 246, W, 1.5);

    // floor
    floorBoards(ctx, 0, 344, W, H - 344, { base: '#4a3322', light: '#64452b', dark: '#2b1c11', board: 52, seed: 5 });
    roundRug(ctx, 650, 600, 270, 96, { c1: '#4b3226', c2: '#82553c', c3: '#364b43' });

    // left window with rain and street
    windowFrame(ctx, 224, 82, 232, 172, {
      frame: '#241a12', warm: true, panes: [2, 2], glowAlpha: 0.7, seed: 11,
      interior: (c, x, y, w, h) => {
        const g = linear(c, 0, y, 0, y + h, [[0, '#4f6b78'], [0.55, '#8f9a8c'], [1, '#b4814f']]);
        c.fillStyle = g; c.fillRect(x, y, w, h);
        // street lamp outside
        c.fillStyle = 'rgba(35,45,48,.7)';
        c.fillRect(x + w * 0.18, y + h * 0.2, 3, h * 0.65);
        c.fillStyle = 'rgba(255,205,130,.85)';
        c.beginPath(); c.arc(x + w * 0.2, y + h * 0.22, 8, 0, Math.PI * 2); c.fill();
        // distant buildings
        c.fillStyle = 'rgba(28,40,45,.65)';
        c.fillRect(x, y + h * 0.62, w, h * 0.38);
        c.fillStyle = 'rgba(255,195,120,.3)';
        c.fillRect(x + w * 0.64, y + h * 0.7, 6, 8);
        c.fillRect(x + w * 0.76, y + h * 0.74, 5, 7);
      }
    });
    // window sill plants
    plant(ctx, 232, 258, { scale: 0.52, seed: 4, pot: '#6d4730' });
    books(ctx, 340, 252, 50, { seed: 3, count: 5 });

    // door back-left
    const dx = 68, dy = 128;
    ctx.fillStyle = '#1e1711';
    fillRR(ctx, dx - 7, dy - 7, 96, 220, 2, '#1e1711');
    wood(ctx, dx, dy, 82, 210, { base: '#573922', light: '#724b2d', dark: '#382416', vertical: true, seed: 12 });
    windowFrame(ctx, dx + 14, dy + 14, 54, 74, {
      frame: '#271d15', warm: true, panes: [1, 2], glowAlpha: 0.5, seed: 4, sill: false,
      interior: (c, x, y, w, h) => { c.fillStyle = 'rgba(92,61,35,.3)'; c.fillRect(x, y, w, h); }
    });
    ctx.fillStyle = '#c7a45f';
    ctx.beginPath(); ctx.arc(dx + 70, dy + 118, 3.2, 0, Math.PI * 2); ctx.fill();
    // transom
    windowFrame(ctx, dx + 10, dy - 27, 62, 22, { frame: '#271d15', warm: true, panes: [1, 1], glowAlpha: 0.5, seed: 4, sill: false, rain: false });
    // bell above door
    ctx.strokeStyle = '#b28d4e'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(dx + 41, dy - 30); ctx.lineTo(dx + 41, dy - 38); ctx.stroke();
    ctx.fillStyle = '#b28d4e';
    ctx.beginPath(); ctx.arc(dx + 41, dy - 31, 5, Math.PI, 0); ctx.lineTo(dx + 46, dy - 26); ctx.lineTo(dx + 36, dy - 26); ctx.closePath(); ctx.fill();

    // shelves with objects
    shelfUnit(ctx, 500, 90, 430, 158, { shelves: 3, seed: 21 });
    // individual larger objects on top of shelf
    clockFace(ctx, 556, 74, 20, { time: [8, 17], face: '#d9c9a7', rim: '#6a4f2d', numerals: true });
    // teapot
    ctx.fillStyle = '#566a63';
    ctx.beginPath(); ctx.ellipse(900, 70, 17, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#566a63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(920, 68, 8, -1.2, 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(884, 69, 7, -1.2, 1.2); ctx.stroke();

    // sign on wall
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic 13px Fraunces, serif';
    ctx.fillStyle = 'rgba(230,203,157,.62)';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText('Lost things, found.', 712, 276);
    ctx.restore();

    // memory cabinet right
    const mx = 972, my = 244, mw = 238, mh = 100;
    wood(ctx, mx, my, mw, mh, { base: '#3b2a1b', light: '#5b4028', dark: '#24170f', seed: 9 });
    // glass front
    ctx.fillStyle = 'rgba(120,150,150,.08)';
    fillRR(ctx, mx + 12, my + 12, mw - 24, mh - 24, 1, 'rgba(120,150,150,.08)');
    ctx.strokeStyle = 'rgba(225,200,155,.24)'; ctx.lineWidth = 1;
    ctx.strokeRect(mx + 12.5, my + 12.5, mw - 25, mh - 25);
    ctx.beginPath(); ctx.moveTo(mx + mw / 2, my + 12); ctx.lineTo(mx + mw / 2, my + mh - 12); ctx.stroke();
    // shelves
    ctx.strokeStyle = 'rgba(225,200,155,.16)';
    ctx.beginPath(); ctx.moveTo(mx + 12, my + mh * 0.58); ctx.lineTo(mx + mw - 12, my + mh * 0.58); ctx.stroke();
    // display objects
    ctx.fillStyle = '#9a7b47';
    ctx.beginPath(); ctx.arc(mx + 52, my + 54, 8, Math.PI, 0); ctx.fill();
    ctx.fillRect(mx + 49, my + 54, 6, 12);
    ctx.fillStyle = '#5c7068';
    ctx.beginPath(); ctx.ellipse(mx + 106, my + 72, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a4c38';
    fillRR(ctx, mx + 160, my + 48, 18, 28, 2, '#7a4c38');
    ctx.fillStyle = '#b39b67';
    ctx.beginPath(); ctx.arc(mx + 196, my + 66, 6, 0, Math.PI * 2); ctx.fill();

    // counter
    const cx = 512, cy = 414, cw = 412, ch = 82;
    wood(ctx, cx, cy, cw, ch, { base: '#4d3320', light: '#6b482b', dark: '#2f1e12', seed: 33 });
    ctx.fillStyle = '#634328';
    fillRR(ctx, cx - 10, cy - 9, cw + 20, 14, 2, '#634328');
    ctx.fillStyle = 'rgba(255,232,190,.12)';
    ctx.fillRect(cx - 4, cy - 5, cw + 8, 2);
    // register
    ctx.fillStyle = '#3a2d21';
    fillRR(ctx, cx + 30, cy - 24, 90, 28, 3, '#3a2d21');
    ctx.fillStyle = '#5d4a31';
    fillRR(ctx, cx + 36, cy - 44, 78, 24, 2, '#5d4a31');
    ctx.fillStyle = '#c8b98d';
    fillRR(ctx, cx + 44, cy - 39, 30, 12, 1, '#c8b98d');
    ctx.fillStyle = 'rgba(50,40,28,.6)';
    for (let i = 0; i < 4; i++) ctx.fillRect(cx + 47 + i * 7, cy - 36, 4, 5);
    // bell
    ctx.fillStyle = '#b79554';
    ctx.beginPath(); ctx.arc(cx + 332, cy - 14, 9, Math.PI, 0); ctx.lineTo(cx + 341, cy - 6); ctx.lineTo(cx + 323, cy - 6); ctx.closePath(); ctx.fill();
    // receipt book
    ctx.save(); ctx.translate(cx + 230, cy - 12); ctx.rotate(-0.05);
    ctx.fillStyle = '#d8c9a7'; fillRR(ctx, 0, 0, 58, 18, 1, '#d8c9a7');
    ctx.strokeStyle = 'rgba(80,60,35,.3)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(5, 6 + i * 6); ctx.lineTo(53, 6 + i * 6); ctx.stroke(); }
    ctx.restore();
    // little price tags
    ctx.fillStyle = '#b9a47b'; fillRR(ctx, cx + 108, cy - 8, 16, 10, 1, '#b9a47b');
    ctx.fillStyle = '#6b4b2e'; ctx.fillRect(cx + 110, cy - 7, 1, 4);

    // cat chair
    const chx = 180, chy = 434;
    chair(ctx, chx, chy, { scale: 1.2, color: '#463224' });
    drawCat(ctx, chx, chy - 16, 0, { scale: 1.05, sleeping: true });
    // blanket
    ctx.fillStyle = 'rgba(150,90,60,.45)';
    ctx.beginPath(); ctx.ellipse(chx - 8, chy - 7, 18, 8, 0.1, 0, Math.PI * 2); ctx.fill();

    // side table with gramophone
    const gx = 1050, gy = 432;
    wood(ctx, gx, gy, 152, 58, { base: '#3d2b1c', light: '#5a4028', dark: '#26180f', seed: 7 });
    ctx.fillStyle = '#6c4a2e';
    fillRR(ctx, gx + 24, gy - 34, 100, 38, 4, '#6c4a2e');
    ctx.fillStyle = '#8f6a42';
    ctx.beginPath(); ctx.ellipse(gx + 118, gy - 38, 14, 20, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b18c52'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(gx + 76, gy - 20, 20, 0.4, 2.4); ctx.stroke();
    ctx.fillStyle = '#221a13';
    ctx.beginPath(); ctx.arc(gx + 76, gy - 20, 9, 0, Math.PI * 2); ctx.fill();

    // parcels and crates on floor
    ctx.fillStyle = '#6b4b30';
    fillRR(ctx, 318, 602, 58, 42, 2, '#6b4b30');
    ctx.fillStyle = '#d3c3a1';
    fillRR(ctx, 366, 572, 46, 30, 1, '#d3c3a1');
    ctx.strokeStyle = '#8f4b38'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(389, 572); ctx.lineTo(389, 602); ctx.moveTo(366, 587); ctx.lineTo(412, 587); ctx.stroke();
    ctx.fillStyle = '#55402a';
    fillRR(ctx, 910, 632, 74, 38, 2, '#55402a');
    // plant by door
    plant(ctx, 196, 334, { scale: 0.8, seed: 8, pot: '#64412b' });

    // hanging lamps
    hangingLamp(ctx, 540, 290, { len: 58, scale: 0.9 });
    hangingLamp(ctx, 760, 280, { len: 52, scale: 1.05 });
    // warm window glow
    glow(ctx, 340, 190, 180, 'rgba(255,198,120,.12)');
    glow(ctx, 680, 160, 220, 'rgba(255,198,120,.08)');
    vignette(ctx, 0.5, '3,7,9');
  },

  dynamic(ctx, state, t) {
    dust(ctx, t, { count: 28, color: '255,214,150', area: [120, 100, 1050, 560], alpha: 0.16 });
    // watch on the counter
    if (state.flags.maraGaveWatch) {
      const pulse = 0.8 + Math.sin(t * 2.2) * 0.2;
      drawSmallWatch(ctx, 738, 446, 1.25, t, true);
      if (!state.flags.watchInspected) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.2 * pulse;
        ctx.fillStyle = '#ffd9a0';
        ctx.beginPath(); ctx.arc(744, 438, 12 + pulse * 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    // key drawer glint
    if (state.flags.talkedMara && !state.flags.hasKey) {
      drawKey(ctx, 606, 464, t);
    }
    // cat tail animation (redrawn lightly over base)
    // cabinet display after an ending
    if (state.flags.finished && state.flags.ending) {
      drawShelfKeepsake(ctx, state.flags.ending, t);
    }
    // gentle lamp flicker
    glow(ctx, 760, 312, 90, `rgba(255,205,130,${0.05 + Math.sin(t * 3.1) * 0.012})`);
    // window rain streaks
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = '#d1e0e4'; ctx.lineWidth = 0.8;
    const rand = seeded(3);
    for (let i = 0; i < 14; i++) {
      const x = 230 + ((rand() * 220 + t * 3) % 220);
      const y = 90 + ((rand() * 150 + t * 18) % 150);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.6, y + 5 + rand() * 6); ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, t) {
    // counter front
    const cx = 512, cy = 476, cw = 412;
    ctx.fillStyle = '#3b2717';
    ctx.fillRect(cx - 6, cy, cw + 12, 24);
    ctx.fillStyle = '#332113';
    ctx.fillRect(cx - 6, cy + 22, cw + 12, 4);
    ctx.strokeStyle = 'rgba(20,12,7,.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(cx + 16 + i * 98, cy + 4, 82, 14);
      ctx.fillStyle = 'rgba(220,185,130,.2)';
      ctx.beginPath(); ctx.arc(cx + 57 + i * 98, cy + 11, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    // drawer front hint
    ctx.fillStyle = 'rgba(255,235,190,.05)';
    ctx.fillRect(cx + 44, cy + 4, 40, 2);
  },

  walk: [{ x: 44, y: 338, w: 1192, h: 354 }],
  blockers: [
    { x: 66, y: 120, w: 90, h: 222 },
    { x: 504, y: 404, w: 428, h: 98 },
    { x: 148, y: 410, w: 86, h: 80 },
    { x: 1040, y: 424, w: 172, h: 76 },
    { x: 310, y: 592, w: 110, h: 60 },
    { x: 900, y: 622, w: 94, h: 52 },
    { x: 960, y: 238, w: 256, h: 112 },
    { x: 216, y: 244, w: 250, h: 28 }
  ],
  hotspots: [
    { id: 'watch', x: 740, y: 470, r: 70, label: 'Examine the pocket watch', action: 'inspectWatch', when: s => s.flags.maraGaveWatch },
    { id: 'drawer', x: 604, y: 498, r: 64, label: 'Search the counter drawer', action: 'shop:drawer', when: s => s.flags.talkedMara },
    { id: 'door', x: 110, y: 362, r: 76, label: 'Step out onto Lantern Row', kind: 'exit', action: 'go:street' },
    { id: 'cat', x: 180, y: 454, r: 58, label: 'Pet Moth, the shop cat', action: 'look:cat' },
    { id: 'window', x: 340, y: 300, r: 64, label: 'Watch the rain in the window', action: 'look:shopWindow' },
    { id: 'cabinet', x: 1090, y: 366, r: 66, label: 'Look at the memory cabinet', action: 'shop:cabinet' },
    { id: 'shelves', x: 704, y: 312, r: 74, label: 'Look over the shelves', action: 'look:shopShelves' },
    { id: 'gramophone', x: 1126, y: 466, r: 62, label: 'The gramophone', action: 'look:gramophone' }
  ]
};

function drawKey(ctx, x, y, t) {
  const bob = Math.sin(t * 2.4) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.strokeStyle = '#b8985a'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-8, 0, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(12, 0); ctx.moveTo(7, 0); ctx.lineTo(7, 5); ctx.moveTo(11, 0); ctx.lineTo(11, 4); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath(); ctx.arc(x, y + bob, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawShelfKeepsake(ctx, ending, t) {
  const mx = 972, my = 264;
  ctx.save();
  ctx.translate(mx + 119, my + 18);
  if (ending === 'june') {
    // blue thread
    ctx.strokeStyle = 'rgba(130,175,210,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.bezierCurveTo(-10, 18, 10, -16, 30, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(100,140,175,.8)';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  } else if (ending === 'silas') {
    gearShape(ctx, 0, 4, 12, 9, '#b88a4e');
  } else if (ending === 'keep') {
    // watch under a little glass dome
    drawSmallWatch(ctx, 0, 4, 1.2, t, true);
    ctx.strokeStyle = 'rgba(220,235,230,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 4, 18, Math.PI, 0); ctx.lineTo(18, 4); ctx.stroke();
  } else if (ending === 'station') {
    // violet + thread
    ctx.strokeStyle = 'rgba(140,105,165,.85)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-24, 12); ctx.quadraticCurveTo(-8, -2, 8, 10); ctx.stroke();
    ctx.fillStyle = 'rgba(140,120,165,.85)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.ellipse(8 + Math.cos(i * 1.6) * 4, 10 + Math.sin(i * 1.6) * 4, 3.4, 2.4, i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(110,160,190,.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-18, 14); ctx.bezierCurveTo(-8, 20, 2, 2, 18, 14); ctx.stroke();
  }
  ctx.restore();
  glow(ctx, mx + 119, my + 40, 34, 'rgba(255,215,160,.08)');
}

// ---------------------------------------------------------------
// Tea house
// ---------------------------------------------------------------
export const tea = {
  id: 'tea',
  info: { name: 'The Larkspur', sub: 'Tea & small comforts' },
  weather: { rain: 0, fog: false, lightning: false, indoor: true },
  spawn: { x: 1092, y: 574, dir: 'left' },

  draw(ctx, state) {
    ctx.fillStyle = '#2a211d';
    ctx.fillRect(0, 0, W, 344);
    wallpaper(ctx, 0, 0, W, 250, { base: '#5a4a40', stripe: 'rgba(255,235,200,.03)', seed: 14, motif: true });
    // wainscot
    ctx.fillStyle = '#3f2c1e';
    ctx.fillRect(0, 246, W, 98);
    for (let x = 8; x < W; x += 78) {
      ctx.fillStyle = 'rgba(20,12,7,.25)';
      ctx.fillRect(x, 258, 68, 78);
      ctx.strokeStyle = 'rgba(240,210,165,.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, 261, 62, 72);
    }
    ctx.fillStyle = '#5a4128';
    ctx.fillRect(0, 244, W, 7);

    floorBoards(ctx, 0, 340, W, H - 340, { base: '#4e3724', light: '#6b4c2c', dark: '#2e1f12', board: 54, seed: 11 });
    roundRug(ctx, 780, 600, 240, 86, { c1: '#4a3a2b', c2: '#8c6541', c3: '#4d6151' });

    // left window
    windowFrame(ctx, 108, 76, 218, 172, {
      frame: '#2a1d14', warm: true, panes: [2, 2], glowAlpha: 0.55, seed: 18,
      interior: (c, x, y, w, h) => {
        const g = linear(c, 0, y, 0, y + h, [[0, '#526f7e'], [0.5, '#8c9c92'], [1, '#b48455']]);
        c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(30,42,47,.6)';
        c.fillRect(x, y + h * 0.66, w, h * 0.34);
        c.fillStyle = 'rgba(255,200,125,.35)';
        c.fillRect(x + w * 0.2, y + h * 0.72, 7, 10);
        c.fillRect(x + w * 0.65, y + h * 0.76, 6, 9);
      }
    });
    plant(ctx, 116, 252, { scale: 0.5, seed: 5, pot: '#6c4530' });

    // shelves
    shelfUnit(ctx, 372, 92, 190, 152, { shelves: 3, seed: 23 });
    // jars of tea
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = ['#8a6c44', '#6c7a5a', '#8c5b48'][i % 3];
      ctx.beginPath(); ctx.ellipse(392 + i * 34, 74, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9b58c';
      ctx.fillRect(388 + i * 34, 66, 8, 4);
    }

    // fireplace
    const fx = 716, fy = 150, fw = 230, fh = 188;
    ctx.fillStyle = '#3b2a1d';
    fillRR(ctx, fx - 10, fy - 10, fw + 20, fh + 14, 3, '#3b2a1d');
    brick(ctx, fx, fy, fw, fh, { base: '#5e4432', light: '#76543d', dark: '#38271b', bw: 42, bh: 20, seed: 6 });
    // hearth
    ctx.fillStyle = '#18120d';
    fillRR(ctx, fx + 48, fy + 70, fw - 96, fh - 70, 3, '#18120d');
    // fire
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const fireG = radial(ctx, fx + fw / 2, fy + 168, 5, 68, [[0, 'rgba(255,190,95,.8)'], [0.5, 'rgba(230,115,45,.3)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillStyle = fireG;
    ctx.fillRect(fx + 30, fy + 80, fw - 60, 108);
    ctx.restore();
    ctx.fillStyle = '#3a2516';
    fillRR(ctx, fx + 40, fy + 162, fw - 80, 12, 2, '#3a2516');
    // mantel
    ctx.fillStyle = '#4b3321';
    ctx.fillRect(fx - 18, fy - 18, fw + 36, 12);
    ctx.fillStyle = 'rgba(255,235,195,.1)';
    ctx.fillRect(fx - 18, fy - 18, fw + 36, 2);
    // framed photo on mantel
    const px = fx + 84, py = fy - 74;
    ctx.fillStyle = '#553d24';
    ctx.fillRect(px - 5, py - 5, 82, 64);
    ctx.fillStyle = '#b39258';
    ctx.strokeStyle = '#c8a96b'; ctx.lineWidth = 2;
    ctx.strokeRect(px, py, 72, 54);
    ctx.fillStyle = '#4a3d30';
    ctx.fillRect(px + 4, py + 4, 64, 46);
    // sepia figure silhouette
    ctx.fillStyle = 'rgba(210,185,145,.7)';
    ctx.beginPath(); ctx.arc(px + 36, py + 22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(px + 36, py + 40, 14, 12, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,205,140,.25)';
    ctx.beginPath(); ctx.arc(px + 20, py + 12, 8, 0, Math.PI * 2); ctx.fill();
    glow(ctx, fx + fw / 2, fy + 130, 180, 'rgba(255,170,90,.14)');

    // cake display on counter
    // door right
    const dx = 1132, dy = 156;
    ctx.fillStyle = '#1f1710';
    fillRR(ctx, dx - 7, dy - 7, 88, 184, 2, '#1f1710');
    wood(ctx, dx, dy, 74, 174, { base: '#4e3420', light: '#6b4a2c', dark: '#32200f', vertical: true, seed: 15 });
    windowFrame(ctx, dx + 12, dy + 14, 50, 62, { frame: '#271d15', warm: true, panes: [1, 2], glowAlpha: 0.4, seed: 14, sill: false });
    ctx.fillStyle = '#c7a45f';
    ctx.beginPath(); ctx.arc(dx + 64, dy + 104, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(230,205,160,.7)'; ctx.font = '8px Karla, sans-serif'; ctx.textAlign = 'center';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    ctx.fillText('LANTERN ROW', dx + 37, dy - 16);

    // counter left
    const cx = 106, cy = 408, cw = 366, ch = 84;
    wood(ctx, cx, cy, cw, ch, { base: '#54371f', light: '#724c2a', dark: '#34200f', seed: 4 });
    ctx.fillStyle = '#6a4828';
    fillRR(ctx, cx - 10, cy - 10, cw + 20, 14, 2, '#6a4828');
    ctx.fillStyle = 'rgba(255,235,195,.12)';
    ctx.fillRect(cx - 4, cy - 6, cw + 8, 2);
    // glass cake stands
    for (let i = 0; i < 3; i++) {
      const gx = cx + 42 + i * 92;
      ctx.fillStyle = 'rgba(220,235,230,.07)';
      ctx.beginPath(); ctx.ellipse(gx, cy - 18, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(225,235,225,.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(gx, cy - 18, 28, 12, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(gx, cy - 18, 28, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = ['#b58a62', '#8a5f44', '#c7a06e'][i];
      ctx.beginPath(); ctx.ellipse(gx, cy - 16, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,220,.25)';
      ctx.beginPath(); ctx.ellipse(gx - 4, cy - 19, 6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    }
    // teapot + cups
    ctx.fillStyle = '#5b746b';
    ctx.beginPath(); ctx.ellipse(cx + 292, cy - 14, 19, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5b746b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx + 314, cy - 16, 9, -1.2, 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 270, cy - 15, 8, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = '#e2d6bd';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(cx + 250 + i * 26, cy - 4, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    // till
    ctx.fillStyle = '#6b4b2d';
    fillRR(ctx, cx + 24, cy - 30, 42, 24, 2, '#6b4b2d');

    // tables
    roundTable(ctx, 760, 510, { scale: 1.0 });
    roundTable(ctx, 1018, 600, { scale: 1.1 });
    chair(ctx, 652, 530, { scale: 0.9, facing: 'right' });
    chair(ctx, 880, 530, { scale: 0.9, facing: 'left' });
    chair(ctx, 950, 642, { scale: 0.9, facing: 'right' });
    chair(ctx, 1090, 646, { scale: 0.9, facing: 'left' });
    // a blue shawl left on a chair after June's ending
    if (state.flags.finished && state.flags.ending === 'june') {
      ctx.fillStyle = 'rgba(91,127,149,.7)';
      ctx.beginPath(); ctx.ellipse(880, 512, 25, 13, 0.2, 0, Math.PI * 2); ctx.fill();
    }

    // bookshelf right wall
    shelfUnit(ctx, 1000, 100, 170, 100, { shelves: 2, seed: 41 });
    // coat rack
    ctx.strokeStyle = '#3b2c1e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(58, 398); ctx.lineTo(58, 280); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 310); ctx.lineTo(88, 310); ctx.stroke();
    ctx.fillStyle = '#6f4a35';
    ctx.beginPath(); ctx.ellipse(36, 316, 10, 18, 0.2, 0, Math.PI * 2); ctx.fill();

    // lamps
    hangingLamp(ctx, 250, 300, { len: 70, scale: 0.85, shade: '#5a3a2a' });
    hangingLamp(ctx, 710, 300, { len: 72, scale: 0.8, shade: '#5a3a2a' });
    hangingLamp(ctx, 980, 280, { len: 62, scale: 0.9, shade: '#5a3a2a' });
    // flowers
    plant(ctx, 1110, 390, { scale: 0.65, seed: 2, pot: '#68452c' });

    glow(ctx, 820, 200, 240, 'rgba(255,170,90,.12)');
    glow(ctx, 760, 400, 200, 'rgba(255,195,120,.09)');
    vignette(ctx, 0.5, '5,3,2');
  },

  dynamic(ctx, state, t) {
    dust(ctx, t, { count: 20, color: '255,220,165', area: [100, 120, 1080, 540], alpha: 0.14 });
    // fire flicker
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flick = 0.84 + Math.sin(t * 5.2) * 0.1 + Math.sin(t * 9.7) * 0.06;
    const g = radial(ctx, 831, 300, 5, 120 * flick, [[0, 'rgba(255,190,100,.24)'], [0.5, 'rgba(230,110,45,.08)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(700, 210, 270, 200);
    ctx.restore();
    // steam from teapot
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 12; i++) {
      const p = (t * 0.22 + i * 0.08) % 1;
      const x = 398 + Math.sin(t * 0.9 + i) * 5 + p * 10;
      const y = 382 - p * 54;
      ctx.globalAlpha = (1 - p) * 0.09;
      ctx.fillStyle = '#e8e0cf';
      ctx.beginPath(); ctx.arc(x, y, 2 + p * 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // rain window
    ctx.save();
    ctx.globalAlpha = 0.12; ctx.strokeStyle = '#d3e1e5'; ctx.lineWidth = 0.8;
    const rand = seeded(7);
    for (let i = 0; i < 12; i++) {
      const x = 114 + ((rand() * 206 + t * 3) % 206);
      const y = 84 + ((rand() * 156 + t * 16) % 156);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.5, y + 5 + rand() * 6); ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, t) {
    // counter front
    ctx.fillStyle = '#3e2817';
    ctx.fillRect(100, 484, 386, 26);
    ctx.fillStyle = '#301f12';
    ctx.fillRect(100, 507, 386, 3);
    ctx.strokeStyle = 'rgba(20,12,7,.45)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(116 + i * 92, 489, 76, 14);
      ctx.fillStyle = 'rgba(225,190,135,.2)';
      ctx.beginPath(); ctx.arc(154 + i * 92, 496, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  },

  walk: [{ x: 40, y: 338, w: 1200, h: 354 }],
  blockers: [
    { x: 100, y: 398, w: 390, h: 100 },
    { x: 1000, y: 92, w: 180, h: 120 },
    { x: 1130, y: 150, w: 90, h: 190 },
    { x: 660, y: 472, w: 196, h: 132 },
    { x: 908, y: 568, w: 230, h: 120 },
    { x: 44, y: 274, w: 44, h: 130 }
  ],
  hotspots: [
    { id: 'alma', x: 306, y: 452, r: 82, label: 'Speak with Alma Finch', action: 'talk:alma' },
    { id: 'teaDoor', x: 1168, y: 360, r: 80, label: 'Step back onto Lantern Row', kind: 'exit', action: 'go:street' },
    { id: 'photo', x: 831, y: 334, r: 64, label: 'Look at the framed photograph', action: 'evidence:photo' },
    { id: 'cake', x: 300, y: 492, r: 60, label: 'Look at the cakes', action: 'look:cakes' },
    { id: 'fire', x: 831, y: 342, r: 56, label: 'Warm your hands at the fire', action: 'look:fire' },
    { id: 'teaWindow', x: 216, y: 300, r: 58, label: 'Watch the rain', action: 'look:teaWindow' },
    { id: 'button', x: 762, y: 590, r: 52, label: 'Something under the table', kind: 'keepsake', action: 'keepsake:button', when: s => !s.keepsakes.includes('button') },
    { id: 'table', x: 760, y: 530, r: 56, label: 'The corner table', action: 'look:teatable' }
  ]
};

// ---------------------------------------------------------------
// Clock workshop
// ---------------------------------------------------------------
export const clock = {
  id: 'clock',
  info: { name: 'Voss & Sons', sub: 'Clockmakers since 1902' },
  weather: { rain: 0, fog: false, lightning: false, indoor: true },
  spawn: { x: 1094, y: 566, dir: 'left' },

  draw(ctx, state) {
    ctx.fillStyle = '#201811';
    ctx.fillRect(0, 0, W, 344);
    // wall panels
    wood(ctx, 0, 0, W, 250, { base: '#3e2c1d', light: '#57402a', dark: '#24170f', vertical: true, seed: 3, grain: 0.7 });
    ctx.fillStyle = 'rgba(8,5,3,.3)';
    for (let x = 0; x < W; x += 96) ctx.fillRect(x, 0, 2, 250);
    ctx.fillStyle = '#24190f';
    ctx.fillRect(0, 246, W, 100);
    ctx.fillStyle = '#171009';
    ctx.fillRect(0, 244, W, 8);
    ctx.fillStyle = 'rgba(235,195,135,.07)';
    ctx.fillRect(0, 244, W, 1.5);

    floorBoards(ctx, 0, 340, W, H - 340, { base: '#3d2c1d', light: '#563e26', dark: '#24180e', board: 50, seed: 17 });
    // sawdust / scraps
    const rand = seeded(27);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${150 + rand() * 50},${120 + rand() * 30},${70 + rand() * 30},${0.03 + rand() * 0.06})`;
      ctx.beginPath(); ctx.ellipse(rand() * W, 430 + rand() * 260, 3 + rand() * 8, 1 + rand() * 2, rand() * 3, 0, Math.PI * 2); ctx.fill();
    }

    // window left
    windowFrame(ctx, 236, 72, 200, 160, {
      frame: '#221a12', warm: false, panes: [2, 2], glowAlpha: 0.45, seed: 31,
      interior: (c, x, y, w, h) => {
        const g = linear(c, 0, y, 0, y + h, [[0, '#485f6e'], [0.5, '#6d7f82'], [1, '#3d4b4f']]);
        c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(18,28,32,.6)';
        c.fillRect(x, y + h * 0.68, w, h * 0.32);
        c.fillStyle = 'rgba(255,195,120,.3)';
        c.fillRect(x + w * 0.22, y + h * 0.73, 6, 8);
        c.fillRect(x + w * 0.7, y + h * 0.77, 5, 7);
      }
    });
    // rain
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#c9dbe0';
    const rr2 = seeded(9);
    for (let i = 0; i < 25; i++) {
      const x = 240 + rr2() * 192, y = 78 + rr2() * 148;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 7 + rr2() * 9); ctx.stroke();
    }
    ctx.restore();

    // clock wall — shelves of clocks
    shelfUnit(ctx, 474, 68, 748, 182, { shelves: 3, seed: 37, goods: false });
    const times = [[8, 17], [3, 12], [11, 48], [6, 40], [1, 25], [9, 5], [4, 52], [7, 33]];
    const randc = seeded(71);
    for (let i = 0; i < 18; i++) {
      const col = i % 9, row = Math.floor(i / 9);
      const cx2 = 500 + col * 80 + (randc() - 0.5) * 12;
      const cy2 = 100 + row * 72 + (randc() - 0.5) * 10;
      const r = 14 + randc() * 8;
      const style = randc();
      if (style < 0.7) clockFace(ctx, cx2, cy2, r, { time: times[i % times.length], face: randc() > 0.5 ? '#d8c8a7' : '#cbb98f', rim: randc() > 0.5 ? '#7b5a32' : '#4b3b28', numerals: r > 16, shadow: false });
      else {
        // square clock
        ctx.fillStyle = '#4d3926'; fillRR(ctx, cx2 - r, cy2 - r, r * 2, r * 2, 2, '#4d3926');
        clockFace(ctx, cx2, cy2, r * 0.78, { time: times[i % times.length], face: '#d6c6a3', rim: '#6d4f2e', numerals: false, shadow: false });
      }
    }
    // big clock above door
    clockFace(ctx, 1090, 112, 34, { time: [8, 17], face: '#ddcfb0', rim: '#5f472a', numerals: true });

    // door right
    const dx = 1140, dy = 168;
    ctx.fillStyle = '#1a130d';
    fillRR(ctx, dx - 7, dy - 7, 88, 176, 2, '#1a130d');
    wood(ctx, dx, dy, 74, 166, { base: '#4a301d', light: '#624126', dark: '#2c1b0f', vertical: true, seed: 6 });
    windowFrame(ctx, dx + 12, dy + 14, 50, 58, { frame: '#231a12', warm: false, panes: [1, 2], glowAlpha: 0.3, seed: 6, sill: false });
    ctx.fillStyle = '#b89358'; ctx.beginPath(); ctx.arc(dx + 64, dy + 100, 3, 0, Math.PI * 2); ctx.fill();

    // workbench
    const wx = 436, wy = 410, ww = 530, wh = 92;
    wood(ctx, wx, wy, ww, wh, { base: '#4b321e', light: '#6b4728', dark: '#2b1b0f', seed: 32 });
    ctx.fillStyle = '#5c3f25';
    fillRR(ctx, wx - 12, wy - 12, ww + 24, 16, 2, '#5c3f25');
    ctx.fillStyle = 'rgba(255,232,190,.1)';
    ctx.fillRect(wx - 6, wy - 7, ww + 12, 2.5);
    // leather mat
    ctx.fillStyle = 'rgba(52,38,27,.7)';
    fillRR(ctx, wx + 160, wy - 8, 220, 50, 3, 'rgba(52,38,27,.7)');
    // watch parts, gears
    for (let i = 0; i < 12; i++) {
      const gx = wx + 175 + (i % 6) * 32 + (rand() - 0.5) * 8;
      const gy = wy + 8 + Math.floor(i / 6) * 20 + (rand() - 0.5) * 5;
      gearShape(ctx, gx, gy, 3 + rand() * 5, 8, i % 3 ? '#b28d52' : '#8c734a', { alpha: 0.8 });
    }
    // open movement
    ctx.fillStyle = '#c5a365';
    ctx.beginPath(); ctx.arc(wx + 300, wy + 18, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2015';
    ctx.beginPath(); ctx.arc(wx + 300, wy + 18, 13, 0, Math.PI * 2); ctx.fill();
    gearShape(ctx, wx + 300, wy + 18, 8, 10, '#c7a566');
    // tools
    ctx.strokeStyle = '#b8a887'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx + 60, wy + 2); ctx.lineTo(wx + 104, wy + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx + 420, wy + 2); ctx.lineTo(wx + 456, wy + 14); ctx.stroke();
    // screwdrivers
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 ? '#9b7b42' : '#6b5838'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wx + 470 + i * 9, wy + 2); ctx.lineTo(wx + 478 + i * 9, wy + 24); ctx.stroke();
    }
    // ledger
    ctx.save();
    ctx.translate(wx + 400, wy + 56);
    ctx.rotate(-0.04);
    ctx.fillStyle = '#2b1e13';
    fillRR(ctx, -54, -18, 108, 34, 2, '#2b1e13');
    ctx.fillStyle = '#d9cba9';
    fillRR(ctx, -50, -22, 100, 32, 1, '#d9cba9');
    ctx.strokeStyle = 'rgba(80,60,35,.3)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-42, -14 + i * 8); ctx.lineTo(42, -14 + i * 8); ctx.stroke(); }
    ctx.fillStyle = 'rgba(140,70,50,.4)';
    ctx.beginPath(); ctx.arc(28, -5, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // desk lamp
    const lx = wx + 500, ly = wy - 34;
    ctx.strokeStyle = '#2b2b26'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, wy + 4); ctx.quadraticCurveTo(lx - 6, ly + 16, lx - 18, ly + 4); ctx.stroke();
    ctx.fillStyle = '#435047';
    ctx.beginPath(); ctx.ellipse(lx - 26, ly - 2, 20, 10, -0.3, Math.PI, 0); ctx.fill();
    ctx.fillRect(lx - 44, ly + 6, 30, 3);
    glow(ctx, lx - 30, ly + 6, 140, 'rgba(255,210,135,.24)');

    // longcase clock
    const gx2 = 1002, gy2 = 288;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(gx2 + 48, gy2 + 280, 56, 10, 0, 0, Math.PI * 2); ctx.fill();
    wood(ctx, gx2, gy2, 96, 252, { base: '#3d2816', light: '#5a3c22', dark: '#24160c', seed: 12 });
    ctx.fillStyle = '#4c321c';
    fillRR(ctx, gx2 - 8, gy2 - 8, 112, 42, 3, '#4c321c');
    clockFace(ctx, gx2 + 48, gy2 + 12, 30, { time: [6, 40], face: '#d8cbb0', rim: '#5c4329', numerals: true, shadow: false });
    // glass door
    ctx.fillStyle = 'rgba(120,140,135,.08)';
    fillRR(ctx, gx2 + 18, gy2 + 52, 60, 164, 2, 'rgba(120,140,135,.08)');
    ctx.strokeStyle = 'rgba(220,200,160,.18)'; ctx.lineWidth = 1;
    ctx.strokeRect(gx2 + 18.5, gy2 + 52.5, 59, 163);
    // pendulum
    ctx.strokeStyle = '#b8985a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx2 + 48, gy2 + 70); ctx.lineTo(gx2 + 48, gy2 + 174); ctx.stroke();
    ctx.fillStyle = '#c9a45f';
    ctx.beginPath(); ctx.arc(gx2 + 48, gy2 + 178, 12, 0, Math.PI * 2); ctx.fill();
    // base
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    fillRR(ctx, gx2 - 4, gy2 + 246, 104, 12, 2, 'rgba(0,0,0,.2)');

    // hanging tools, magnifier
    ctx.strokeStyle = 'rgba(200,180,140,.15)'; ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(300 + i * 24, 0); ctx.lineTo(300 + i * 24, 40 + (i % 3) * 18); ctx.stroke();
    }
    // shelf above window
    ctx.fillStyle = '#3a2818'; ctx.fillRect(238, 60, 198, 8);

    // stool
    ctx.fillStyle = '#3f2b1a';
    ctx.beginPath(); ctx.ellipse(720, 610, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f2014';
    ctx.fillRect(712, 610, 5, 28); ctx.fillRect(725, 610, 5, 28);
    ctx.fillStyle = '#543923';
    ctx.beginPath(); ctx.ellipse(720, 602, 24, 8, 0, 0, Math.PI * 2); ctx.fill();

    // leaning clock faces
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(330 + i * 32, 590);
      ctx.rotate((i - 1) * 0.18);
      clockFace(ctx, 0, 0, 17, { time: [5 + i, 12 + i * 7], face: '#cbbd9d', rim: '#6b4e2f', numerals: false, shadow: false });
      ctx.restore();
    }

    hangingLamp(ctx, 690, 300, { len: 48, scale: 0.8, shade: '#2e3a32' });
    glow(ctx, 710, 340, 180, 'rgba(255,200,130,.12)');
    vignette(ctx, 0.58, '3,2,1');
  },

  dynamic(ctx, state, t) {
    dust(ctx, t, { count: 30, color: '230,200,150', area: [100, 100, 1100, 540], alpha: 0.18 });
    // pendulums
    const swing = Math.sin(t * 1.5) * 0.09;
    const gx2 = 1002 + 48, gy2 = 288;
    ctx.save();
    ctx.translate(gx2, gy2 + 70);
    ctx.rotate(swing);
    ctx.strokeStyle = 'rgba(190,155,90,.9)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 104); ctx.stroke();
    ctx.fillStyle = 'rgba(200,165,95,.9)';
    ctx.beginPath(); ctx.arc(0, 108, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // ledger glow when available
    if (state.flags.metSilas) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.12 + Math.sin(t * 2) * 0.04;
      ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(836, 466, 14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // lamp flicker
    glow(ctx, 970, 380, 110, `rgba(255,205,130,${0.1 + Math.sin(t * 4.3) * 0.015})`);
    // steam from a small kettle
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 9; i++) {
      const p = (t * 0.2 + i * 0.11) % 1;
      const x = 900 + Math.sin(t * 0.8 + i) * 4 + p * 6;
      const y = 390 - p * 42;
      ctx.globalAlpha = (1 - p) * 0.07;
      ctx.fillStyle = '#e8e0cf';
      ctx.beginPath(); ctx.arc(x, y, 2 + p * 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // repaired watch on bench after Silas ending
    if (state.flags.finished && state.flags.ending === 'silas') {
      drawSmallWatch(ctx, 838, 448, 1.1, t, true);
    }
  },

  drawForeground(ctx, state, t) {
    // workbench front
    ctx.fillStyle = '#3a2716';
    ctx.fillRect(430, 492, 542, 28);
    ctx.fillStyle = '#2d1c0f';
    ctx.fillRect(430, 517, 542, 4);
    ctx.strokeStyle = 'rgba(15,9,5,.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.strokeRect(448 + i * 104, 496, 88, 16);
      ctx.fillStyle = 'rgba(220,185,130,.18)';
      ctx.beginPath(); ctx.arc(492 + i * 104, 504, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    // longcase base front
    ctx.fillStyle = '#2c1c0f';
    ctx.fillRect(1002, 530, 96, 20);
  },

  walk: [{ x: 40, y: 338, w: 1202, h: 354 }],
  blockers: [
    { x: 100, y: 150, w: 90, h: 190 },
    { x: 428, y: 398, w: 546, h: 132 },
    { x: 992, y: 282, w: 122, h: 270 },
    { x: 690, y: 592, w: 64, h: 46 },
    { x: 296, y: 574, w: 120, h: 46 },
    { x: 236, y: 64, w: 204, h: 170 }
  ],
  hotspots: [
    { id: 'silas', x: 680, y: 482, r: 84, label: 'Speak with Silas Voss', action: 'talk:silas' },
    { id: 'clockDoor', x: 1176, y: 362, r: 78, label: 'Step back onto Lantern Row', kind: 'exit', action: 'go:street' },
    { id: 'ledger', x: 836, y: 468, r: 66, label: 'Read the repair ledger', action: 'evidence:ledger' },
    { id: 'workbench', x: 600, y: 476, r: 62, label: 'Look over the workbench', action: 'look:workbench' },
    { id: 'clockWall', x: 700, y: 300, r: 76, label: 'Listen to the clocks', action: 'look:clockwall' },
    { id: 'longcase', x: 1054, y: 420, r: 60, label: 'The longcase clock', action: 'look:longcase' },
    { id: 'gear', x: 536, y: 650, r: 54, label: 'A practice gear on the floor', kind: 'keepsake', action: 'keepsake:gear', when: s => !s.keepsakes.includes('gear') },
    { id: 'clockWindow', x: 336, y: 300, r: 56, label: 'Watch the rain', action: 'look:clockWindow' }
  ]
};

// ---------------------------------------------------------------
// Lighthouse interior
// ---------------------------------------------------------------
export const lighthouse = {
  id: 'lighthouse',
  info: { name: 'The Light', sub: 'The keeper’s room' },
  weather: { rain: 0, fog: false, lightning: false, indoor: true },
  spawn: { x: 1104, y: 560, dir: 'left' },

  draw(ctx, state) {
    // stone curved wall
    ctx.fillStyle = '#242a2b';
    ctx.fillRect(0, 0, W, 350);
    stone(ctx, 0, 0, W, 260, { base: '#5a5a52', seed: 51, scale: 1 });
    ctx.fillStyle = 'rgba(20,25,26,.55)';
    ctx.fillRect(0, 0, W, 260);
    // curved shading
    const wallG = linear(ctx, 0, 0, W, 0, [[0, 'rgba(0,0,0,.5)'], [0.3, 'rgba(0,0,0,.05)'], [0.7, 'rgba(0,0,0,.06)'], [1, 'rgba(0,0,0,.5)']]);
    ctx.fillStyle = wallG; ctx.fillRect(0, 0, W, 260);
    // floor
    stone(ctx, 0, 258, W, H - 258, { base: '#4b4a43', seed: 33, scale: 1.2 });
    ctx.fillStyle = 'rgba(24,28,28,.32)';
    ctx.fillRect(0, 258, W, H - 258);
    roundRug(ctx, 700, 588, 260, 92, { c1: '#4a3a2c', c2: '#856445', c3: '#3e5559' });

    // huge arched windows (right/back)
    for (let i = 0; i < 2; i++) {
      const wx = 676 + i * 218;
      windowFrame(ctx, wx, 62, 180, 220, {
        frame: '#1f2424', warm: false, panes: [2, 2], glowAlpha: 0.55, arch: true, seed: 4 + i,
        interior: (c, x, y, w, h) => {
          const g = linear(c, 0, y, 0, y + h, [[0, '#35505f'], [0.45, '#67808a'], [0.7, '#8f9a8e'], [1, '#3f5860']]);
          c.fillStyle = g; c.fillRect(x, y, w, h);
          // sea horizon and moon glow
          c.fillStyle = 'rgba(30,50,60,.55)';
          c.fillRect(x, y + h * 0.64, w, h * 0.36);
          c.fillStyle = 'rgba(230,215,185,.12)';
          c.beginPath(); c.arc(x + w * 0.7, y + h * 0.3, 20, 0, Math.PI * 2); c.fill();
          // waves
          for (let j = 0; j < 5; j++) {
            c.strokeStyle = 'rgba(190,210,215,.12)'; c.lineWidth = 0.8;
            c.beginPath(); c.moveTo(x, y + h * (0.72 + j * 0.04)); c.quadraticCurveTo(x + w * 0.5, y + h * (0.7 + j * 0.04), x + w, y + h * (0.73 + j * 0.04)); c.stroke();
          }
        }
      });
    }
    // rain on windows
    ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = '#c9dce3'; ctx.lineWidth = 0.8;
    const rand = seeded(12);
    for (let i = 0; i < 30; i++) {
      const x = 680 + rand() * 388, y = 70 + rand() * 208;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.8, y + 6 + rand() * 8); ctx.stroke();
    }
    ctx.restore();

    // door right
    const dx = 1122, dy = 184;
    ctx.fillStyle = '#1b1d1c';
    fillRR(ctx, dx - 7, dy - 7, 86, 172, 3, '#1b1d1c');
    wood(ctx, dx, dy, 72, 164, { base: '#3d2d1f', light: '#57412b', dark: '#241910', vertical: true, seed: 9 });
    windowFrame(ctx, dx + 12, dy + 14, 48, 54, { frame: '#22221d', warm: true, panes: [1, 2], glowAlpha: 0.35, seed: 4, sill: false });
    ctx.fillStyle = '#b39358'; ctx.beginPath(); ctx.arc(dx + 62, dy + 100, 3, 0, Math.PI * 2); ctx.fill();

    // spiral stairs left
    const sx = 106, sy = 256;
    ctx.strokeStyle = '#2e2d28'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx + 64, sy); ctx.lineTo(sx + 64, 70); ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const y = sy - i * 22;
      ctx.strokeStyle = '#575148'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + 64, y);
      ctx.lineTo(sx + 64 - 46 - (i % 2) * 6, y - 5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx + 18, y - 5); ctx.lineTo(sx + 18, y - 14); ctx.stroke();
    }
    // railing
    ctx.strokeStyle = 'rgba(160,145,115,.24)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(sx + 80, sy - i * 24); ctx.lineTo(sx + 96, sy - i * 24); ctx.stroke();
    }

    // Fresnel lens left-center
    const lx = 520, ly = 222;
    // pedestal
    ctx.fillStyle = '#3a3429';
    fillRR(ctx, lx - 48, ly + 94, 96, 58, 3, '#3a3429');
    wood(ctx, lx - 40, ly + 98, 80, 46, { base: '#3a2a1b', light: '#58402a', dark: '#24180f', seed: 2 });
    // brass frame
    ctx.strokeStyle = '#a98a4e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(lx, ly, 66, 76, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(lx, ly, 54, 64, 0, 0, Math.PI * 2); ctx.stroke();
    // glass rings
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lensG = radial(ctx, lx, ly, 8, 70, [[0, 'rgba(255,235,185,.55)'], [0.4, 'rgba(255,205,135,.2)'], [1, 'rgba(255,205,135,0)']]);
    ctx.fillStyle = lensG;
    ctx.beginPath(); ctx.ellipse(lx, ly, 62, 72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = `rgba(255,225,170,${0.1 + i * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(lx, ly, i * 10, i * 12, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,170,110,.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(lx - 54, ly); ctx.lineTo(lx + 54, ly); ctx.moveTo(lx, ly - 64); ctx.lineTo(lx, ly + 64); ctx.stroke();
    // vertical brass bars
    for (let i = -2; i <= 2; i++) {
      ctx.strokeStyle = 'rgba(190,155,95,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(lx + i * 20, ly - Math.sqrt(Math.max(0, 1 - (i / 3.2) ** 2)) * 64); ctx.lineTo(lx + i * 20, ly + Math.sqrt(Math.max(0, 1 - (i / 3.2) ** 2)) * 64); ctx.stroke();
    }
    glow(ctx, lx, ly, 200, 'rgba(255,220,160,.18)');

    // desk left-front
    const dkx = 272, dky = 530;
    wood(ctx, dkx, dky, 230, 76, { base: '#43301f', light: '#5e432a', dark: '#2a1b10', seed: 21 });
    ctx.fillStyle = '#4f3924';
    fillRR(ctx, dkx - 6, dky - 8, 242, 12, 2, '#4f3924');
    // letters, logbook
    ctx.save(); ctx.translate(dkx + 38, dky - 12); ctx.rotate(-0.05);
    ctx.fillStyle = '#d8c9a7'; fillRR(ctx, 0, 0, 44, 26, 1, '#d8c9a7');
    ctx.strokeStyle = 'rgba(80,60,35,.35)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(5, 7 + i * 6); ctx.lineTo(39, 7 + i * 6); ctx.stroke(); }
    ctx.restore();
    // teacup
    ctx.fillStyle = '#e0d5bd';
    ctx.beginPath(); ctx.ellipse(dkx + 130, dky - 6, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e0d5bd'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(dkx + 138, dky - 7, 4, -1.2, 1.2); ctx.stroke();
    // oil lamp
    ctx.fillStyle = '#6a4e2d';
    ctx.fillRect(dkx + 186, dky - 22, 12, 18);
    ctx.fillStyle = 'rgba(255,220,160,.9)';
    ctx.beginPath(); ctx.ellipse(dkx + 192, dky - 24, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    glow(ctx, dkx + 192, dky - 24, 90, 'rgba(255,205,135,.2)');

    // armchair by lens
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.ellipse(880, 590, 48, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#405052';
    ctx.beginPath(); ctx.ellipse(880, 558, 42, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4e6062';
    ctx.beginPath(); ctx.ellipse(880, 546, 40, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a494b';
    ctx.beginPath(); ctx.ellipse(844, 560, 12, 26, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(916, 560, 12, 26, -0.2, 0, Math.PI * 2); ctx.fill();
    // blue shawl on chair
    ctx.fillStyle = 'rgba(91,127,149,.6)';
    ctx.beginPath(); ctx.ellipse(880, 538, 34, 18, 0.3, 0, Math.PI * 2); ctx.fill();

    // books and shelf on right wall
    shelfUnit(ctx, 900, 92, 120, 92, { shelves: 1, seed: 8 });
    // picture on wall
    ctx.fillStyle = '#4b3824';
    ctx.fillRect(786, 116, 58, 70);
    ctx.strokeStyle = '#c8a96b'; ctx.lineWidth = 1.5;
    ctx.strokeRect(790, 120, 50, 62);
    ctx.fillStyle = '#5a4b3b';
    ctx.fillRect(794, 124, 42, 54);
    ctx.fillStyle = 'rgba(220,190,150,.5)';
    ctx.beginPath(); ctx.arc(815, 144, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(815, 158, 10, 10, 0, Math.PI, 0); ctx.fill();

    // kettle stove? small wood stove
    ctx.fillStyle = '#33302a';
    fillRR(ctx, 498, 612, 56, 60, 4, '#33302a');
    ctx.fillStyle = '#4a453c';
    ctx.beginPath(); ctx.ellipse(526, 612, 28, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6c5740';
    ctx.beginPath(); ctx.ellipse(526, 604, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8f7b5e';
    ctx.fillRect(518, 596, 16, 5);
    glow(ctx, 526, 606, 50, 'rgba(255,190,105,.08)');

    // hanging lamp
    hangingLamp(ctx, 960, 260, { len: 54, scale: 0.9, shade: '#2f3a36', light: 'rgba(255,210,145,.22)' });
    // window moonlight
    glow(ctx, 800, 180, 240, 'rgba(140,175,195,.12)');
    vignette(ctx, 0.62, '3,5,5');
  },

  dynamic(ctx, state, t) {
    dust(ctx, t, { count: 26, color: '255,225,175', area: [180, 100, 900, 540], alpha: 0.16 });
    // lens pulse
    const pulse = 0.85 + Math.sin(t * 0.7) * 0.15;
    glow(ctx, 520, 222, 170 * pulse, 'rgba(255,220,160,.12)');
    // sweeping faint beam across room
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(520, 222);
    ctx.rotate(-0.22 + Math.sin(t * 0.18) * 0.12);
    const beam = ctx.createLinearGradient(0, 0, 700, 0);
    beam.addColorStop(0, 'rgba(255,225,170,.09)');
    beam.addColorStop(1, 'rgba(255,225,170,0)');
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(700, -180); ctx.lineTo(700, 180); ctx.lineTo(0, 20); ctx.closePath(); ctx.fill();
    ctx.restore();
    // rain on windows
    ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = '#cadedf'; ctx.lineWidth = 0.8;
    const rand = seeded(22);
    for (let i = 0; i < 18; i++) {
      const x = 680 + ((rand() * 380 + t * 2.5) % 380);
      const y = 70 + ((rand() * 200 + t * 20) % 200);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.7, y + 6); ctx.stroke();
    }
    ctx.restore();
    // steam from kettle
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 10; i++) {
      const p = (t * 0.16 + i * 0.1) % 1;
      const x = 526 + Math.sin(t * 0.8 + i) * 4 + p * 8;
      const y = 590 - p * 62;
      ctx.globalAlpha = (1 - p) * 0.06;
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath(); ctx.arc(x, y, 2 + p * 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // after endings, small signs of change
    if (state.flags.finished) {
      if (state.flags.ending === 'june') {
        drawSmallWatch(ctx, 380, 516, 1.2, t, true);
        ctx.strokeStyle = 'rgba(130,175,205,.55)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(370, 528); ctx.bezierCurveTo(390, 536, 410, 520, 430, 530); ctx.stroke();
      } else if (state.flags.ending === 'station') {
        // a single violet on the desk
        ctx.fillStyle = 'rgba(140,120,170,.8)';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.ellipse(330 + Math.cos(i * 1.6) * 4, 512 + Math.sin(i * 1.6) * 4, 3, 2, i, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  },

  drawForeground(ctx, state, t) {
    // desk front
    ctx.fillStyle = '#342415';
    ctx.fillRect(266, 606, 242, 26);
    ctx.fillStyle = '#281b0f';
    ctx.fillRect(266, 629, 242, 3);
    // pedestal front
    ctx.fillStyle = '#2f2a21';
    ctx.fillRect(474, 318, 92, 22);
  },

  walk: [{ x: 40, y: 340, w: 1200, h: 352 }],
  blockers: [
    { x: 1100, y: 178, w: 90, h: 176 },
    { x: 260, y: 522, w: 258, h: 96 },
    { x: 470, y: 312, w: 102, h: 62 },
    { x: 832, y: 530, w: 96, h: 72 },
    { x: 490, y: 596, w: 74, h: 84 },
    { x: 88, y: 70, w: 100, h: 250 },
    { x: 892, y: 88, w: 136, h: 100 }
  ],
  hotspots: [
    { id: 'june', x: 750, y: 470, r: 90, label: 'Speak with June', action: 'talk:june' },
    { id: 'lightDoor', x: 1160, y: 368, r: 78, label: 'Step back onto the cliff path', kind: 'exit', action: 'go:cliff' },
    { id: 'lens', x: 520, y: 290, r: 76, label: 'Look into the great lens', action: 'look:lens' },
    { id: 'desk', x: 386, y: 566, r: 66, label: 'Look at June’s desk', action: 'look:juneDesk' },
    { id: 'window', x: 760, y: 300, r: 70, label: 'Look out at the sea', action: 'look:lightWindow' },
    { id: 'chair', x: 884, y: 560, r: 54, label: 'The blue shawl', action: 'look:shawl' },
    { id: 'photoWall', x: 816, y: 168, r: 46, label: 'The photograph on the wall', action: 'look:junePhoto' }
  ]
};
