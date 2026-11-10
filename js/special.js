// ---------------------------------------------------------------
// THE LITTLE THINGS — title, ending and evidence art
// ---------------------------------------------------------------
import {
  W, H, fillRR, linear, radial, glow, wash, wood, cobbles, windowFrame,
  lamp, puddle, plant, rain, mist, vignette, seeded, mix, roofTiles, brick,
  softShadow, grain
} from './paint.js';
import { drawCat, drawPerson } from './chars.js';

function titleShop(ctx) {
  const x = 306, y = 160, w = 668;
  ctx.save();
  // neighbouring silhouettes
  ctx.fillStyle = '#0a1219';
  ctx.fillRect(0, 214, 320, 360);
  ctx.fillRect(960, 206, 320, 370);
  ctx.fillStyle = 'rgba(255,190,105,.18)';
  ctx.fillRect(72, 300, 12, 18);
  ctx.fillRect(120, 342, 10, 15);
  ctx.fillRect(1104, 320, 12, 18);
  ctx.fillStyle = 'rgba(255,190,105,.12)';
  ctx.fillRect(1188, 284, 9, 14);

  // shop upper wall
  ctx.fillStyle = linear(ctx, x, y, x + w, y, [[0, '#5b4b3a'], [0.45, '#78634c'], [1, '#4a3d31']]);
  ctx.fillRect(x, y + 62, w, 300);
  brick(ctx, x, y + 58, w, 306, { base: '#6a5843', light: '#7f6a50', dark: '#493b2d', bw: 66, bh: 26, seed: 3 });
  roofTiles(ctx, x - 28, y - 12, w + 56, 110, { base: '#25292e', light: '#464a4e', dark: '#14171a' });
  ctx.fillStyle = '#1b1e22';
  ctx.fillRect(x - 34, y + 90, w + 68, 14);
  ctx.fillStyle = 'rgba(255,225,180,.09)';
  ctx.fillRect(x - 30, y + 92, w + 60, 2);

  // timber frame
  ctx.fillStyle = 'rgba(45,32,20,.72)';
  ctx.fillRect(x + 4, y + 102, 12, 262);
  ctx.fillRect(x + w - 16, y + 102, 12, 262);
  ctx.fillRect(x + 4, y + 104, w - 8, 9);

  // sign board (emblem only; the title is the sign)
  ctx.save();
  ctx.translate(x + w / 2, y + 78);
  ctx.fillStyle = '#21180f';
  fillRR(ctx, -120, -20, 240, 42, 2, '#21180f');
  ctx.strokeStyle = 'rgba(225,190,130,.4)'; ctx.lineWidth = 1;
  ctx.strokeRect(-116, -16, 232, 34);
  // little watch emblem
  ctx.strokeStyle = '#d6b578'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, 1, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(-4, -4); ctx.moveTo(0, 1); ctx.lineTo(2, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -15); ctx.stroke();
  ctx.restore();

  // big warm window left
  windowFrame(ctx, x + 42, y + 146, 228, 176, {
    frame: '#241b12', warm: true, panes: [2, 2], glowAlpha: 1, seed: 12,
    interior: (c, ix, iy, iw, ih) => {
      c.fillStyle = 'rgba(72,38,16,.4)'; c.fillRect(ix, iy, iw, ih);
      c.fillStyle = 'rgba(95,52,23,.6)';
      for (let i = 0; i < 3; i++) c.fillRect(ix, iy + ih * (0.3 + i * 0.22), iw, 4);
      const rand = seeded(8);
      for (let i = 0; i < 12; i++) {
        const px = ix + 8 + rand() * (iw - 18), py = iy + ih * (0.28 + Math.floor(rand() * 3) * 0.22);
        c.fillStyle = ['rgba(57,32,15,.85)', 'rgba(105,54,24,.8)', 'rgba(40,52,42,.8)'][i % 3];
        fillRR(c, px, py - 8 - rand() * 10, 5 + rand() * 8, 10 + rand() * 9, 1, c.fillStyle);
      }
    }
  });
  drawCat(ctx, x + 238, y + 300, 0, { scale: 1.1, sleeping: false });

  // big warm window right
  windowFrame(ctx, x + 396, y + 146, 228, 176, {
    frame: '#241b12', warm: true, panes: [2, 2], glowAlpha: .9, seed: 18,
    interior: (c, ix, iy, iw, ih) => {
      c.fillStyle = 'rgba(70,38,17,.45)'; c.fillRect(ix, iy, iw, ih);
      // hanging lamp silhouettes
      c.strokeStyle = 'rgba(55,31,14,.7)'; c.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        c.beginPath(); c.moveTo(ix + iw * (0.3 + i * .4), iy); c.lineTo(ix + iw * (0.3 + i * .4), iy + ih * .3); c.stroke();
        c.fillStyle = 'rgba(255,205,130,.9)';
        c.beginPath(); c.arc(ix + iw * (0.3 + i * .4), iy + ih * .34, 9, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = 'rgba(90,50,24,.55)';
      c.fillRect(ix, iy + ih * .68, iw, 6);
    }
  });

  // door center
  const dx = x + 300, dy = y + 166;
  ctx.fillStyle = '#1d1610';
  fillRR(ctx, dx - 8, dy - 8, 84, 198, 2, '#1d1610');
  wood(ctx, dx, dy, 68, 190, { base: '#603d24', light: '#7d5030', dark: '#412817', vertical: true, seed: 6 });
  windowFrame(ctx, dx + 11, dy + 16, 46, 70, { frame: '#241b13', warm: true, panes: [1, 2], glowAlpha: .8, seed: 4, sill: false });
  ctx.fillStyle = '#c9a35e';
  ctx.beginPath(); ctx.arc(dx + 60, dy + 112, 3.5, 0, Math.PI * 2); ctx.fill();
  // transom
  windowFrame(ctx, dx + 6, dy - 30, 56, 20, { frame: '#241b13', warm: true, panes: [1, 1], glowAlpha: .7, seed: 4, sill: false, rain: false });
  // steps
  ctx.fillStyle = '#4d4a42';
  ctx.fillRect(dx - 16, dy + 188, 100, 8);
  ctx.fillStyle = '#3b3a34';
  ctx.fillRect(dx - 24, dy + 196, 116, 10);

  // flower boxes
  ctx.fillStyle = '#43301e';
  fillRR(ctx, x + 46, y + 322, 220, 14, 2, '#43301e');
  fillRR(ctx, x + 400, y + 322, 220, 14, 2, '#43301e');
  const rand = seeded(9);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = ['#6a4950', '#8a6a59', '#5a6d55'][i % 3];
    const px = (i < 10 ? x + 58 + i * 20 : x + 412 + (i - 10) * 20);
    const py = y + 318 - rand() * 8;
    ctx.beginPath(); ctx.arc(px, py, 2.5 + rand() * 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // awning over windows
  ctx.save();
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = i % 2 ? '#6e4635' : '#c4b18b';
    ctx.beginPath();
    ctx.moveTo(x + 24 + i * 45, y + 126);
    ctx.lineTo(x + 69 + i * 45, y + 126);
    ctx.lineTo(x + 62 + i * 45, y + 150);
    ctx.lineTo(x + 24 + i * 45, y + 150);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(x + 24, y + 146, 632, 4);
  ctx.restore();

  ctx.restore();
}

export function drawTitleBase(ctx) {
  ctx.clearRect(0, 0, W, H);
  // sky
  ctx.fillStyle = linear(ctx, 0, 0, 0, 520, [[0, '#07111a'], [0.45, '#102433'], [0.8, '#1b3543'], [1, '#273f49']]);
  ctx.fillRect(0, 0, W, 520);
  // clouds
  const rand = seeded(31);
  for (let i = 0; i < 12; i++) {
    wash(ctx, rand() * W, 20 + rand() * 220, 200 + rand() * 280, 40 + rand() * 50, i % 2 ? '#2b4355' : '#172c3a', {
      count: 8, alpha: 0.07, seed: 40 + i, spread: 0.5
    });
  }
  // moon haze
  glow(ctx, 1050, 120, 240, 'rgba(185,210,220,.05)');
  // distant rooftops
  ctx.fillStyle = '#0b1720';
  for (let i = 0; i < 15; i++) {
    const bx = i * 94 - 20, bh = 50 + (i % 4) * 22;
    ctx.fillRect(bx, 330 - bh, 78, bh + 120);
    ctx.fillStyle = 'rgba(255,190,108,.2)';
    if (i % 3 === 0) ctx.fillRect(bx + 20, 350 - bh, 8, 12);
    ctx.fillStyle = '#0b1720';
  }
  // chimneys
  ctx.fillStyle = '#0a151d';
  ctx.fillRect(170, 246, 24, 86);
  ctx.fillRect(1090, 260, 22, 72);

  titleShop(ctx);

  // street
  cobbles(ctx, 0, 470, W, 250, { base: '#2b383d', seed: 7 });
  ctx.fillStyle = 'rgba(8,14,18,.3)';
  ctx.fillRect(0, 470, W, 8);
  // wet highlights
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8; i++) {
    const gx = 60 + i * 165;
    const g = linear(ctx, gx, 480, gx, 720, [[0, 'rgba(255,190,110,.07)'], [1, 'rgba(255,190,110,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(gx - 35, 480, 70, 240);
  }
  ctx.restore();
  // puddles
  puddle(ctx, 520, 632, 150, 34, { warm: true, seed: 4 });
  puddle(ctx, 944, 590, 98, 24, { warm: true, seed: 8 });
  puddle(ctx, 246, 676, 66, 16, { warm: false, seed: 2 });
  // lamp posts
  lamp(ctx, 250, 560, { h: 190, scale: 1.2 });
  lamp(ctx, 1030, 566, { h: 190, scale: 1.2 });
  // planters
  plant(ctx, 206, 600, { scale: 1.2, seed: 3, pot: '#4f3726' });
  plant(ctx, 1070, 620, { scale: 1.05, seed: 6, pot: '#4f3726' });
  // shop glow
  glow(ctx, 520, 380, 300, 'rgba(255,190,110,.13)');
  glow(ctx, 790, 380, 260, 'rgba(255,190,110,.1)');
  glow(ctx, 640, 500, 260, 'rgba(255,190,110,.07)');
  // foreground shadow
  const fg = linear(ctx, 0, 620, 0, 720, [[0, 'rgba(4,8,12,0)'], [1, 'rgba(4,8,12,.62)']]);
  ctx.fillStyle = fg; ctx.fillRect(0, 620, W, 100);
  vignette(ctx, 0.72, '2,5,8');
  grain(ctx, 0.04);
}

export function drawTitleDynamic(ctx, t) {
  mist(ctx, t, { y: 620, alpha: 0.04, count: 3 });
  // rain
  rain(ctx, t, { count: 210, alpha: 0.34, wind: -0.25, speed: 1, ground: 470 });
  // window light flicker
  const flick = 0.92 + Math.sin(t * 4.3) * 0.04 + Math.sin(t * 9.1) * 0.02;
  glow(ctx, 520, 380, 260 * flick, 'rgba(255,190,110,.06)');
  glow(ctx, 790, 380, 220 * flick, 'rgba(255,190,110,.05)');
  // cat tail
  drawCat(ctx, 544, 460, t, { scale: 1.1, sleeping: false });
  // steam
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    const p = (t * 0.1 + i * 0.14) % 1;
    const x = 194 + Math.sin(t * 0.5 + i) * 8 + p * 12;
    const y = 250 - p * 120;
    ctx.globalAlpha = (1 - p) * 0.06;
    ctx.fillStyle = '#b9cacc';
    ctx.beginPath(); ctx.ellipse(x, y, 10 + p * 26, 6 + p * 14, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // occasional lightning handled by main via overlay
}

// ---------------------------------------------------------------
// Ending vignettes
// ---------------------------------------------------------------
export function drawEndingBase(ctx, key) {
  ctx.clearRect(0, 0, W, H);
  const rand = seeded(17);
  if (key === 'june') {
    // dawn in the lighthouse
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#1a2d3a'], [0.5, '#334b55'], [1, '#1a2429']]);
    ctx.fillRect(0, 0, W, H);
    // window
    const g = linear(ctx, 0, 60, 0, 610, [[0, '#8c9aa2'], [0.35, '#c6b28f'], [0.6, '#e0b07a'], [1, '#54717b']]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(690, 610); ctx.lineTo(690, 330);
    ctx.arc(890, 330, 200, Math.PI, 0);
    ctx.lineTo(1090, 610); ctx.closePath(); ctx.fill();
    // sea
    ctx.fillStyle = 'rgba(58,89,102,.55)';
    ctx.fillRect(700, 470, 380, 140);
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = `rgba(245,215,170,${0.06 + rand() * 0.1})`;
      ctx.lineWidth = 1 + rand();
      ctx.beginPath();
      ctx.moveTo(700 + rand() * 380, 480 + rand() * 120);
      ctx.quadraticCurveTo(760 + rand() * 260, 476 + rand() * 120, 940 + rand() * 140, 482 + rand() * 120);
      ctx.stroke();
    }
    // window frame
    ctx.strokeStyle = '#1f2628'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(690, 610); ctx.lineTo(690, 330); ctx.arc(890, 330, 200, Math.PI, 0); ctx.lineTo(1090, 610); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(890, 132); ctx.lineTo(890, 610); ctx.moveTo(690, 390); ctx.lineTo(1090, 390); ctx.stroke();
    // lens on left
    ctx.strokeStyle = '#9b804d'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(330, 330, 95, 120, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,225,165,.25)'; ctx.lineWidth = 1.2;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath(); ctx.ellipse(330, 330, i * 15, i * 20, 0, 0, Math.PI * 2); ctx.stroke();
    }
    glow(ctx, 330, 330, 300, 'rgba(255,215,160,.18)');
    glow(ctx, 890, 360, 340, 'rgba(255,190,120,.12)');
    // desk with watch
    wood(ctx, 130, 590, 280, 100, { base: '#4a3322', light: '#68482c', dark: '#2c1e12', seed: 3 });
    // stone floor
    ctx.fillStyle = 'rgba(20,26,28,.35)';
    ctx.fillRect(0, 610, W, 110);
    // dust
    ctx.fillStyle = 'rgba(255,225,175,.18)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath(); ctx.arc(rand() * W, rand() * 600, .5 + rand() * 1.2, 0, Math.PI * 2); ctx.fill();
    }
    vignette(ctx, 0.75, '2,4,6');
  } else if (key === 'silas') {
    // clock workshop at dawn
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#12100d'], [0.5, '#2b2118'], [1, '#14100c']]);
    ctx.fillRect(0, 0, W, H);
    // wall clocks
    for (let i = 0; i < 14; i++) {
      clockFace(ctx, 180 + (i % 7) * 140, 120 + Math.floor(i / 7) * 120, 34 + (i % 3) * 6, {
        time: [[8, 17], [6, 40], [3, 12], [11, 48]][i % 4], face: '#b9a987', rim: '#5e4529', numerals: false, shadow: false
      });
    }
    // workbench close-up
    wood(ctx, 170, 520, 940, 200, { base: '#4a321f', light: '#6b4728', dark: '#2b1b0e', seed: 8 });
    // lamp
    ctx.strokeStyle = '#2f2c25'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(930, 520); ctx.quadraticCurveTo(900, 430, 830, 420); ctx.stroke();
    ctx.fillStyle = '#3f4d43';
    ctx.beginPath(); ctx.ellipse(790, 410, 65, 28, 0.15, Math.PI, 0); ctx.fill();
    glow(ctx, 790, 430, 260, 'rgba(255,205,130,.28)');
    // watch
    ctx.fillStyle = '#d8b878';
    ctx.beginPath(); ctx.arc(520, 560, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e9dfc6';
    ctx.beginPath(); ctx.arc(520, 560, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a2a1b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(520, 560); ctx.lineTo(500, 548); ctx.moveTo(520, 560); ctx.lineTo(534, 534); ctx.stroke();
    // gears
    for (let i = 0; i < 18; i++) {
      const x = 180 + rand() * 820, y = 580 + rand() * 100;
      ctx.fillStyle = 'rgba(180,145,85,.3)';
      ctx.beginPath(); ctx.arc(x, y, 3 + rand() * 8, 0, Math.PI * 2); ctx.fill();
    }
    glow(ctx, 520, 560, 160, 'rgba(255,210,145,.08)');
    vignette(ctx, 0.72, '2,1,0');
  } else if (key === 'keep') {
    // shop cabinet, warm
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#101b1e'], [0.6, '#2b2a20'], [1, '#15130e']]);
    ctx.fillRect(0, 0, W, H);
    // cabinet frame
    wood(ctx, 390, 150, 500, 470, { base: '#3c2a1b', light: '#5c4229', dark: '#24170f', seed: 6 });
    ctx.fillStyle = 'rgba(130,160,155,.06)';
    fillRR(ctx, 420, 180, 440, 410, 3, 'rgba(130,160,155,.06)');
    ctx.strokeStyle = 'rgba(230,205,160,.24)'; ctx.lineWidth = 2;
    ctx.strokeRect(422, 182, 436, 406);
    // shelf lines
    for (let i = 1; i < 3; i++) {
      ctx.strokeStyle = 'rgba(230,205,160,.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(422, 182 + i * 135); ctx.lineTo(858, 182 + i * 135); ctx.stroke();
    }
    // watch under glass on middle shelf
    const cx = 640, cy = 440;
    ctx.fillStyle = '#201a12';
    fillRR(ctx, cx - 90, cy + 40, 180, 12, 2, '#201a12');
    ctx.fillStyle = '#d4b16d';
    ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eee3ca';
    ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3d2c1c'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 18, cy - 9); ctx.moveTo(cx, cy); ctx.lineTo(cx + 14, cy - 24); ctx.stroke();
    // glass dome
    ctx.strokeStyle = 'rgba(220,240,235,.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy + 36, 62, Math.PI, 0); ctx.stroke();
    // card
    ctx.save(); ctx.translate(cx, cy + 82); ctx.rotate(-0.02);
    ctx.fillStyle = '#e5d8b9'; fillRR(ctx, -50, -12, 100, 28, 1, '#e5d8b9');
    ctx.fillStyle = 'rgba(80,60,40,.55)'; ctx.font = '7px Karla, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FOR JUNE · 8:17 · E.', 0, 0);
    ctx.font = '6px Karla, sans-serif';
    ctx.fillText('SOME HOURS ARE FOR KEEPING', 0, 9);
    ctx.restore();
    // surrounding shelves with warm objects
    for (let i = 0; i < 12; i++) {
      const x = 70 + rand() * 250, y = 240 + rand() * 300;
      if (rand() > 0.5) {
        ctx.fillStyle = 'rgba(110,80,45,.5)';
        ctx.fillRect(x, y, 18 + rand() * 18, 8 + rand() * 20);
      }
    }
    glow(ctx, cx, cy, 260, 'rgba(255,205,130,.2)');
    glow(ctx, 1040, 480, 220, 'rgba(255,190,110,.1)');
    vignette(ctx, 0.74, '3,3,1');
  } else {
    // the last platform
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#101d26'], [0.55, '#263a43'], [1, '#2c3c3e']]);
    ctx.fillRect(0, 0, W, H);
    // station wall
    ctx.fillStyle = 'rgba(58,72,72,.55)';
    ctx.fillRect(0, 0, W, 400);
    // big clock
    clockFace(ctx, 640, 180, 90, { time: [8, 17], face: '#e2d7bd', rim: '#645136', numerals: true });
    ctx.strokeStyle = '#3a3024'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(640, 180, 100, 0, Math.PI * 2); ctx.stroke();
    // platform opening
    const g = linear(ctx, 0, 300, 0, 610, [[0, '#74888c'], [0.4, '#9ba397'], [1, '#5a6d6d']]);
    ctx.fillStyle = g;
    ctx.fillRect(760, 250, 430, 360);
    // rain outside
    ctx.save(); ctx.globalAlpha = .16; ctx.strokeStyle = '#e0ecec'; ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const x = 760 + rand() * 430, y = 250 + rand() * 360;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke();
    }
    ctx.restore();
    // opening frame
    ctx.strokeStyle = '#222a2a'; ctx.lineWidth = 12;
    ctx.strokeRect(760, 250, 430, 360);
    // bench
    wood(ctx, 330, 520, 360, 80, { base: '#3f2c1d', light: '#5c4127', dark: '#271a10', seed: 5 });
    ctx.fillStyle = '#4f3520';
    fillRR(ctx, 326, 500, 368, 30, 3, '#4f3520');
    ctx.fillStyle = '#2b2a27';
    ctx.fillRect(350, 600, 14, 50); ctx.fillRect(656, 600, 14, 50);
    // watch on bench
    ctx.fillStyle = '#d0ae6a';
    ctx.beginPath(); ctx.arc(520, 536, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e9dfc8';
    ctx.beginPath(); ctx.arc(520, 536, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#38281a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(520, 536); ctx.lineTo(512, 532); ctx.moveTo(520, 536); ctx.lineTo(525, 526); ctx.stroke();
    // blue thread
    ctx.strokeStyle = 'rgba(120,165,195,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(470, 552); ctx.bezierCurveTo(500, 566, 548, 544, 574, 558); ctx.stroke();
    // floor
    ctx.fillStyle = 'rgba(22,30,31,.28)';
    ctx.fillRect(0, 610, W, 110);
    // lamplight
    glow(ctx, 1000, 480, 200, 'rgba(255,205,130,.12)');
    glow(ctx, 520, 520, 220, 'rgba(255,210,140,.1)');
    vignette(ctx, 0.76, '2,4,5');
  }
  grain(ctx, 0.04);
}

export function drawEndingDynamic(ctx, key, t) {
  if (key === 'june') {
    // drifting dust and a warm beam
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(330, 330);
    ctx.rotate(-0.2);
    const g = ctx.createLinearGradient(0, 0, 600, 0);
    g.addColorStop(0, 'rgba(255,220,160,.07)');
    g.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(600, -160); ctx.lineTo(600, 160); ctx.lineTo(0, 20); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 26; i++) {
      const x = 180 + ((i * 137 + t * 4) % 900);
      const y = 120 + ((i * 71 + Math.sin(t * 0.3 + i) * 10 + t * 2) % 480);
      ctx.globalAlpha = 0.16 * (0.4 + Math.abs(Math.sin(t * 0.4 + i)));
      ctx.fillStyle = '#ffe2b2';
      ctx.beginPath(); ctx.arc(x, y, 0.7 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (key === 'silas' || key === 'keep') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 24; i++) {
      const x = 100 + ((i * 173 + t * 6) % 1080);
      const y = 300 + ((i * 83 + Math.sin(t * 0.4 + i) * 12 + t * 2) % 400);
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffd9a0';
      ctx.beginPath(); ctx.arc(x, y, 0.6 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else {
    // rain easing, one blue thread drifting
    mist(ctx, t, { y: 580, alpha: 0.05, count: 2 });
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 20; i++) {
      const x = 200 + ((i * 131 + t * 8) % 900);
      const y = 200 + ((i * 59 + t * 3) % 400);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#fff1cf';
      ctx.beginPath(); ctx.arc(x, y, 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------
// The photograph at the Larkspur
// ---------------------------------------------------------------
export function drawPhoto(ctx) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const rand = seeded(44);
  // warm dark room
  const bg = linear(ctx, 0, 0, 0, h, [[0, '#4a4033'], [0.5, '#6b5a42'], [1, '#2f2a22']]);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // stage curtains
  ctx.fillStyle = '#5b4234';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.18, 0); ctx.quadraticCurveTo(w * 0.1, h * 0.6, 0, h); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w * 0.82, 0); ctx.quadraticCurveTo(w * 0.9, h * 0.6, w, h); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = 'rgba(30,20,14,.18)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * rand(), 0); ctx.quadraticCurveTo(w * rand(), h * 0.5, w * rand(), h); ctx.stroke();
  }
  // spotlight
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const spot = ctx.createRadialGradient(w * 0.5, h * 0.25, 5, w * 0.5, h * 0.55, w * 0.4);
  spot.addColorStop(0, 'rgba(255,226,170,.5)');
  spot.addColorStop(0.4, 'rgba(255,205,130,.2)');
  spot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spot; ctx.fillRect(0, 0, w, h);
  ctx.restore();
  // stage floor
  ctx.fillStyle = 'rgba(38,30,22,.7)';
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  // tables in foreground silhouettes
  for (let i = 0; i < 4; i++) {
    const x = 40 + i * 200, y = h - 30 - (i % 2) * 24;
    ctx.fillStyle = 'rgba(25,20,16,.85)';
    ctx.beginPath(); ctx.ellipse(x, y, 62, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(18,14,11,.9)';
    ctx.beginPath(); ctx.arc(x - 22, y - 28, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 30, y - 24, 13, 0, Math.PI * 2); ctx.fill();
  }
  // June on stage
  ctx.save();
  ctx.translate(w * 0.5, h * 0.7);
  ctx.scale(2.6, 2.6);
  drawPerson(ctx, 'june', 0, 0, { dir: 'down', still: true });
  ctx.restore();
  // microphone
  ctx.strokeStyle = 'rgba(30,24,18,.85)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.42); ctx.lineTo(w * 0.56, h * 0.66); ctx.stroke();
  ctx.fillStyle = 'rgba(40,32,24,.9)';
  ctx.beginPath(); ctx.ellipse(w * 0.56, h * 0.4, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
  // lamps
  for (let i = 0; i < 3; i++) {
    const x = w * (0.25 + i * 0.25), y = 38;
    ctx.strokeStyle = 'rgba(35,28,20,.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,215,150,.7)';
    ctx.beginPath(); ctx.arc(x, y + 6, 10, 0, Math.PI * 2); ctx.fill();
  }
  // sepia wash
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(120,80,40,.38)';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  // hand-tinted blue scarf suggestion
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#4a6c86';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.49, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // grain + vignette
  grain(ctx, 0.12);
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(25,16,9,.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
}
