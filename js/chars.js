// ---------------------------------------------------------------
// THE LITTLE THINGS — people, portraits, small creatures
// ---------------------------------------------------------------
import { fillRR, linear, radial, glow, seeded, makeCanvas, mix } from './paint.js';

const PEOPLE = {
  player: {
    skin: '#d6a982', skinShade: '#b98761', hair: '#2b211b', hair2: '#433228',
    coat: '#36575b', coat2: '#264247', coat3: '#4d7274', scarf: '#c08055',
    trousers: '#27343b', boots: '#171d21', bag: '#6e4a32', hairStyle: 'short',
    eyes: '#3c3026', accent: '#3d6668'
  },
  mara: {
    skin: '#ddb18d', skinShade: '#bf8c68', hair: '#6f382b', hair2: '#8a4a36',
    coat: '#964b3b', coat2: '#74382e', coat3: '#b3644f', scarf: '#7a8b70',
    trousers: '#3d3030', boots: '#241b18', hairStyle: 'bob', eyes: '#597452',
    freckles: true, accent: '#a85a42'
  },
  alma: {
    skin: '#b9825e', skinShade: '#966244', hair: '#cec6b7', hair2: '#b4ab9c',
    coat: '#3e5e58', coat2: '#2f4a45', coat3: '#5a7d74', apron: '#ded0b4',
    trousers: '#3b3a34', boots: '#24211d', hairStyle: 'bun', glasses: true,
    eyes: '#463227', wrinkles: true, accent: '#4b7a74'
  },
  silas: {
    skin: '#c49b7d', skinShade: '#a07659', hair: '#d9d2c5', hair2: '#bdb6a9',
    coat: '#4d3c2f', coat2: '#392c22', coat3: '#6b5541', vest: '#6c4d35',
    shirt: '#d8cbb1', trousers: '#3b332b', boots: '#221c17', hairStyle: 'short',
    beard: true, glasses: true, stoop: true, eyes: '#3b2e24', wrinkles: true,
    accent: '#b98a52'
  },
  june: {
    skin: '#a9775a', skinShade: '#875a42', hair: '#ddd6ca', hair2: '#c2baad',
    coat: '#46657a', coat2: '#344f62', coat3: '#62869c', shawl: '#5b7f95',
    trousers: '#3d4148', boots: '#24262a', hairStyle: 'long', eyes: '#3f2f28',
    accent: '#6f92ab'
  },
  elias: {
    skin: '#c69a77', skinShade: '#a17758', hair: '#3e2e23', hair2: '#594236',
    coat: '#4b4236', coat2: '#383129', coat3: '#6a5c4a', vest: '#6d5239',
    shirt: '#d5c7ae', trousers: '#3b342c', boots: '#211b16', hairStyle: 'short',
    moustache: true, eyes: '#3b2b21', accent: '#8f7448'
  },
  arthur: {
    skin: '#c9a78c', skinShade: '#a7826a', hair: '#b9b3a7', hair2: '#9a958b',
    coat: '#35414a', coat2: '#27323a', coat3: '#50606a', shirt: '#d8d0bf',
    trousers: '#2f353a', boots: '#1d2024', hairStyle: 'short', cap: true,
    moustache: true, eyes: '#3b3a37', accent: '#5d7482'
  }
};

export function personConfig(id) {
  return PEOPLE[id] || PEOPLE.player;
}

// Feet-centered, slightly angled top-down figure.
export function drawPerson(ctx, id, x, y, opts = {}) {
  const c = personConfig(id);
  const {
    dir = 'down', walk = 0, t = 0, scale = 1, umbrella = false,
    sitting = false, still = false, coatOverride = null, alpha = 1
  } = opts;
  const bob = still ? 0 : Math.sin(walk * Math.PI * 2) * 1.1;
  const swing = still ? 0 : Math.sin(walk * Math.PI * 2);
  const side = dir === 'left' ? -1 : 1;
  const facingSide = dir === 'left' || dir === 'right';
  const facingUp = dir === 'up';
  const stoop = c.stoop ? 3 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (dir === 'left' ? -1 : 1), scale);
  ctx.globalAlpha = alpha;

  // ground shadow
  const sh = ctx.createRadialGradient(0, 1, 0, 0, 1, 22);
  sh.addColorStop(0, 'rgba(0,0,0,.34)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.beginPath(); ctx.ellipse(0, 1, 21, 6, 0, 0, Math.PI * 2); ctx.fill();

  if (umbrella) drawUmbrella(ctx, c, bob, t);

  // legs
  const legY = sitting ? -13 : -17;
  if (!sitting) {
    ctx.strokeStyle = c.trousers;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, -20); ctx.lineTo(-5 + swing * 4, legY + 9);
    ctx.moveTo(5, -20); ctx.lineTo(5 - swing * 4, legY + 9);
    ctx.stroke();
    // boots
    ctx.fillStyle = c.boots;
    fillRR(ctx, -8 + swing * 4, legY + 7, 8, 4, 2, c.boots);
    fillRR(ctx, 1 - swing * 4, legY + 7, 8, 4, 2, c.boots);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(-7 + swing * 4, legY + 7, 4, 1);
  }

  // coat body
  const by = -48 + bob - stoop;
  const coatCol = coatOverride || c.coat;
  const bodyGrad = linear(ctx, -14, by, 14, by + 34, [[0, c.coat3], [0.35, coatCol], [1, c.coat2]]);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-8, by);
  ctx.quadraticCurveTo(-17, by + 4, -16, by + 16);
  ctx.lineTo(-13, by + 30);
  ctx.quadraticCurveTo(0, by + 34, 13, by + 30);
  ctx.lineTo(16, by + 16);
  ctx.quadraticCurveTo(17, by + 4, 8, by);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,14,16,.35)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // coat opening / shirt
  ctx.fillStyle = c.shirt || mix(coatCol, '#e9dcc2', 0.35);
  ctx.beginPath();
  ctx.moveTo(-2, by + 1);
  ctx.lineTo(2, by + 1);
  ctx.lineTo(1, by + 14);
  ctx.lineTo(-1, by + 14);
  ctx.closePath(); ctx.fill();
  if (c.vest) {
    ctx.fillStyle = c.vest;
    ctx.beginPath();
    ctx.moveTo(-13, by + 3);
    ctx.lineTo(-2, by + 1);
    ctx.lineTo(-1, by + 24);
    ctx.lineTo(-12, by + 27);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, by + 3);
    ctx.lineTo(2, by + 1);
    ctx.lineTo(1, by + 24);
    ctx.lineTo(12, by + 27);
    ctx.closePath(); ctx.fill();
  }
  // buttons
  ctx.fillStyle = 'rgba(20,15,12,.55)';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0.6, by + 17 + i * 5, 0.9, 0, Math.PI * 2); ctx.fill(); }

  // apron
  if (c.apron) {
    ctx.fillStyle = c.apron;
    ctx.beginPath();
    ctx.moveTo(-6, by + 11);
    ctx.lineTo(7, by + 11);
    ctx.lineTo(9, by + 29);
    ctx.lineTo(-8, by + 29);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(90,70,45,.2)';
    ctx.lineWidth = .7; ctx.stroke();
  }

  // arms
  ctx.strokeStyle = coatCol;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const armSwing = swing * 2.4;
  ctx.beginPath();
  ctx.moveTo(-11, by + 6);
  ctx.quadraticCurveTo(-16 - armSwing, by + 17, -12 - armSwing, by + 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11, by + 6);
  ctx.quadraticCurveTo(15 + armSwing, by + 16, 12 + armSwing, by + 25);
  ctx.stroke();
  // hands
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(-12 - armSwing, by + 27, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12 + armSwing, by + 26, 2.4, 0, Math.PI * 2); ctx.fill();

  // scarf
  if (c.scarf) {
    ctx.strokeStyle = c.scarf;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, by + 1);
    ctx.quadraticCurveTo(0, by + 4, 8, by + 1);
    ctx.stroke();
    ctx.lineWidth = 3;
    const sway = Math.sin(t * 2 + x * 0.03) * 2;
    ctx.beginPath();
    ctx.moveTo(6, by + 2);
    ctx.quadraticCurveTo(10 + sway, by + 12, 8 + sway, by + 20);
    ctx.stroke();
  }

  // shawl
  if (c.shawl) {
    ctx.fillStyle = c.shawl;
    ctx.beginPath();
    ctx.moveTo(-13, by + 2);
    ctx.quadraticCurveTo(0, by + 8, 13, by + 2);
    ctx.lineTo(11, by + 18);
    ctx.quadraticCurveTo(0, by + 24, -11, by + 18);
    ctx.closePath();
    ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
  }

  // satchel (player)
  if (id === 'player') {
    ctx.fillStyle = c.bag;
    fillRR(ctx, 12, by + 18, 9, 10, 2, c.bag);
    ctx.strokeStyle = 'rgba(30,20,12,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, by + 4); ctx.lineTo(15, by + 19); ctx.stroke();
    ctx.fillStyle = '#c4a15f'; fillRR(ctx, 15, by + 21, 3, 2, 1, '#c4a15f');
  }

  // neck
  ctx.fillStyle = c.skinShade;
  ctx.fillRect(-3.5, by - 5, 7, 7);

  // head
  const hx = 0, hy = by - 14;
  ctx.save();
  ctx.translate(hx, hy);
  // hair back
  drawHairBack(ctx, c, facingUp);

  // face
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.6, 9.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.skinShade;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(-4.5, 2, 3.5, 7, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const eyeY = -1.4;
  if (!facingUp) {
    // ears
    ctx.fillStyle = c.skin;
    ctx.beginPath(); ctx.ellipse(-8.2, 1, 1.6, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8.2, 1, 1.6, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    // brows
    ctx.strokeStyle = c.hair2; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    if (facingSide) {
      ctx.beginPath(); ctx.moveTo(2, eyeY - 2); ctx.lineTo(5, eyeY - 2.4); ctx.stroke();
      ctx.fillStyle = c.eyes;
      ctx.beginPath(); ctx.ellipse(4.3, eyeY, 1.2, 1.3, 0, 0, Math.PI * 2); ctx.fill();
      // nose
      ctx.strokeStyle = c.skinShade; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(7.2, eyeY + 0.4); ctx.lineTo(8.6, eyeY + 2); ctx.stroke();
      // mouth
      ctx.strokeStyle = 'rgba(110,60,50,.8)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(4.6, eyeY + 4); ctx.lineTo(7, eyeY + 4.2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-5.4, eyeY - 2); ctx.lineTo(-2.3, eyeY - 2.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2.3, eyeY - 2.2); ctx.lineTo(5.4, eyeY - 2); ctx.stroke();
      ctx.fillStyle = c.eyes;
      ctx.beginPath(); ctx.ellipse(-3.6, eyeY, 1.05, 1.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3.6, eyeY, 1.05, 1.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,235,.65)';
      ctx.beginPath(); ctx.arc(-3.3, eyeY - 0.35, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3.9, eyeY - 0.35, 0.3, 0, Math.PI * 2); ctx.fill();
      // nose
      ctx.strokeStyle = c.skinShade; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(0, eyeY + 0.7); ctx.lineTo(-0.3, eyeY + 2.7); ctx.stroke();
      // mouth
      ctx.strokeStyle = 'rgba(115,62,52,.75)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-1.7, eyeY + 4.2); ctx.quadraticCurveTo(0, eyeY + 5, 1.7, eyeY + 4.2); ctx.stroke();
      // cheeks
      ctx.fillStyle = 'rgba(190,100,80,.14)';
      ctx.beginPath(); ctx.ellipse(-5.6, 3.5, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5.6, 3.5, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (c.freckles) {
      ctx.fillStyle = 'rgba(130,75,50,.35)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-5 + i * 2.4, 2.7 + (i % 2) * 0.8, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (c.wrinkles) {
      ctx.strokeStyle = 'rgba(105,70,50,.22)'; ctx.lineWidth = 0.55;
      ctx.beginPath(); ctx.moveTo(-6, -3.3); ctx.lineTo(-2.8, -3.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2.8, -3.6); ctx.lineTo(6, -3.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5.4, 5.7); ctx.quadraticCurveTo(0, 6.6, 5.4, 5.7); ctx.stroke();
    }
  }

  // glasses
  if (c.glasses && !facingUp) {
    ctx.strokeStyle = 'rgba(45,35,25,.72)'; ctx.lineWidth = 0.7;
    if (facingSide) {
      ctx.beginPath(); ctx.arc(4.4, eyeY, 2.6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, eyeY); ctx.lineTo(8.8, eyeY - 1); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(-3.6, eyeY, 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(3.6, eyeY, 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1.1, eyeY); ctx.lineTo(1.1, eyeY); ctx.stroke();
    }
  }
  // beard
  if (c.beard && !facingUp) {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.moveTo(-7.3, 2.8);
    ctx.quadraticCurveTo(-6, 10.5, 0, 11.8);
    ctx.quadraticCurveTo(6, 10.5, 7.3, 2.8);
    ctx.quadraticCurveTo(4, 6.2, 0, 6.4);
    ctx.quadraticCurveTo(-4, 6.2, -7.3, 2.8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = .6;
    ctx.beginPath(); ctx.moveTo(-3, 8); ctx.quadraticCurveTo(0, 10, 3, 8); ctx.stroke();
    ctx.fillStyle = 'rgba(110,65,50,.75)';
    ctx.beginPath(); ctx.ellipse(0, 5.6, 1.6, 0.7, 0, 0, Math.PI * 2); ctx.fill();
  } else if (c.moustache && !facingUp) {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.ellipse(-1.4, 4.2, 2.3, 0.9, 0.15, 0, Math.PI * 2);
    ctx.ellipse(1.4, 4.2, 2.3, 0.9, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHairFront(ctx, c, facingUp, facingSide);

  // cap
  if (c.cap) {
    ctx.fillStyle = '#2f3a42';
    ctx.beginPath();
    ctx.ellipse(0, -6.8, 9.5, 4.6, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(9.5, -7);
    ctx.lineTo(-9.5, -7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#222b32';
    ctx.beginPath(); ctx.ellipse(0, -6.8, 11, 3.2, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#b79a5d';
    ctx.beginPath(); ctx.arc(0, -9.4, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore(); // head

  ctx.restore();
}

function drawHairBack(ctx, c, facingUp) {
  ctx.fillStyle = c.hair2;
  if (c.hairStyle === 'bob') {
    ctx.beginPath(); ctx.ellipse(0, 1.5, 10.4, 11.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (c.hairStyle === 'bun') {
    ctx.beginPath(); ctx.ellipse(0, 0.5, 9.2, 10.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -11.5, 4.2, 0, Math.PI * 2); ctx.fill();
  } else if (c.hairStyle === 'long') {
    ctx.beginPath();
    ctx.ellipse(0, 3, 10.8, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, 1); ctx.quadraticCurveTo(-14, 12, -9, 22); ctx.quadraticCurveTo(-5, 15, -5, 5); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, 1); ctx.quadraticCurveTo(14, 12, 9, 22); ctx.quadraticCurveTo(5, 15, 5, 5); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(0, -0.5, 9.2, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHairFront(ctx, c, facingUp, facingSide) {
  if (c.cap) return;
  ctx.fillStyle = c.hair;
  if (facingUp) {
    // Seen from behind the whole head is hair, not a face.
    ctx.beginPath(); ctx.ellipse(0, -0.4, 9.1, 10.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,215,.16)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-5.4, -2.2);
    ctx.quadraticCurveTo(-1.6, -6.6, 3.4, -5.2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20,14,10,.18)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -8.6);
    ctx.quadraticCurveTo(1.2, -2, 0.6, 7.4);
    ctx.stroke();
    return;
  }
  if (c.hairStyle === 'bob') {
    ctx.beginPath();
    ctx.moveTo(-9.5, -4);
    ctx.quadraticCurveTo(-8.5, -11.8, 0, -11);
    ctx.quadraticCurveTo(8.5, -11.8, 9.5, -4);
    ctx.quadraticCurveTo(7, -7.2, 3.5, -6.6);
    ctx.quadraticCurveTo(0, -4.8, -3.5, -6.6);
    ctx.quadraticCurveTo(-7, -7.2, -9.5, -4);
    ctx.closePath(); ctx.fill();
    if (facingSide) {
      ctx.beginPath(); ctx.ellipse(-1, -2.5, 3.5, 5.2, 0.15, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(0, -3.4, 6, -8);
      ctx.quadraticCurveTo(4, -1.5, -1, -1);
      ctx.quadraticCurveTo(-5, -1.5, -6, -8);
      ctx.closePath(); ctx.fill();
    }
  } else if (c.hairStyle === 'bun') {
    ctx.beginPath();
    ctx.moveTo(-9, -4.5);
    ctx.quadraticCurveTo(-8.5, -11.5, 0, -10.8);
    ctx.quadraticCurveTo(8.5, -11.5, 9, -4.5);
    ctx.quadraticCurveTo(6.5, -7.5, 2, -7);
    ctx.quadraticCurveTo(-3, -6.2, -9, -4.5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = .6;
    ctx.beginPath(); ctx.moveTo(-6, -8.4); ctx.quadraticCurveTo(0, -10.5, 6, -8); ctx.stroke();
  } else if (c.hairStyle === 'long') {
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(-11, -12, 0, -11.5);
    ctx.quadraticCurveTo(11, -12, 10, 0);
    ctx.quadraticCurveTo(8, -7, 0, -7.5);
    ctx.quadraticCurveTo(-8, -7, -10, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = .6;
    ctx.beginPath(); ctx.moveTo(-6, -9); ctx.quadraticCurveTo(-2, -5, 2, -8); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-9.4, -3.6);
    ctx.quadraticCurveTo(-9, -11.6, 0, -11);
    ctx.quadraticCurveTo(9, -11.6, 9.4, -3.6);
    ctx.quadraticCurveTo(5.5, -7.2, 0, -6.8);
    ctx.quadraticCurveTo(-5.5, -7.2, -9.4, -3.6);
    ctx.closePath(); ctx.fill();
  }
  // hair highlights
  ctx.strokeStyle = 'rgba(255,240,215,.18)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -8.8);
  ctx.quadraticCurveTo(-1, -10.4, 3, -9.2);
  ctx.stroke();
}

function drawUmbrella(ctx, c, bob, t) {
  const sway = Math.sin(t * 1.2) * 0.02;
  ctx.save();
  ctx.translate(9, -58 + bob);
  ctx.rotate(sway);
  ctx.strokeStyle = '#3a2c22'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-2, 38); ctx.stroke();
  ctx.fillStyle = c.umbrella || '#3f4b57';
  ctx.beginPath();
  ctx.moveTo(-29, 4);
  ctx.quadraticCurveTo(-25, -21, 0, -23);
  ctx.quadraticCurveTo(25, -21, 29, 4);
  ctx.quadraticCurveTo(20, -1, 14, 4);
  ctx.quadraticCurveTo(7, -1, 0, 4);
  ctx.quadraticCurveTo(-7, -1, -14, 4);
  ctx.quadraticCurveTo(-20, -1, -29, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,240,245,.2)'; ctx.lineWidth = .7;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(i * 9, -12, i * 14, 4); ctx.stroke();
  }
  ctx.restore();
}

export function drawCat(ctx, x, y, t, opts = {}) {
  const { scale = 1, sleeping = false } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
  const breathe = Math.sin(t * 1.6) * 0.7;
  ctx.fillStyle = '#1e2429';
  // body
  ctx.beginPath();
  ctx.ellipse(0, -10 + breathe * 0.3, 15, 11, -0.08, 0, Math.PI * 2);
  ctx.fill();
  // tail
  ctx.strokeStyle = '#1e2429'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, -7);
  const tw = sleeping ? 0 : Math.sin(t * 1.3) * 6;
  ctx.bezierCurveTo(24, -6, 23, -24, 14, -22 + tw);
  ctx.stroke();
  // head
  ctx.fillStyle = '#232a30';
  ctx.beginPath(); ctx.arc(-7, -20 + breathe * 0.3, sleeping ? 8 : 7, 0, Math.PI * 2); ctx.fill();
  // ears
  ctx.beginPath(); ctx.moveTo(-13, -25); ctx.lineTo(-11, -32); ctx.lineTo(-7, -26); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-5, -26); ctx.lineTo(-2, -32); ctx.lineTo(0, -25); ctx.closePath(); ctx.fill();
  // eyes
  if (!sleeping) {
    ctx.fillStyle = '#e6b45f';
    ctx.beginPath(); ctx.ellipse(-9.6, -21, 1.5, 1.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-5.2, -21, 1.5, 1.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1c12';
    ctx.beginPath(); ctx.ellipse(-9.6, -21, 0.55, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-5.2, -21, 0.55, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(210,220,220,.5)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-10.5, -21); ctx.quadraticCurveTo(-9.5, -20, -8.5, -21); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6.5, -21); ctx.quadraticCurveTo(-5.5, -20, -4.5, -21); ctx.stroke();
  }
  // whiskers
  ctx.strokeStyle = 'rgba(220,230,230,.35)'; ctx.lineWidth = 0.4;
  ctx.beginPath(); ctx.moveTo(-12, -19); ctx.lineTo(-18, -20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-12, -18); ctx.lineTo(-18, -17); ctx.stroke();
  ctx.restore();
}

export function drawUmbrellaWalker(ctx, x, y, t, opts = {}) {
  const { scale = 1, hue = '#3d4a56', dir = 1, phase = 0 } = opts;
  const bob = Math.sin(t * 2.2 + phase) * 1.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = '#20282e'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  const sw = Math.sin(t * 3 + phase) * 3;
  ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(-4 + sw, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -18); ctx.lineTo(4 - sw, -2); ctx.stroke();
  // coat
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.moveTo(-8, -45 + bob); ctx.quadraticCurveTo(-14, -30, -12, -14);
  ctx.lineTo(12, -14); ctx.quadraticCurveTo(14, -30, 8, -45 + bob);
  ctx.closePath(); ctx.fill();
  // head
  ctx.fillStyle = '#2a3036';
  ctx.beginPath(); ctx.arc(0, -51 + bob, 7.5, 0, Math.PI * 2); ctx.fill();
  // umbrella
  ctx.save();
  ctx.translate(4, -58 + bob);
  ctx.rotate(Math.sin(t + phase) * 0.025);
  ctx.strokeStyle = '#31312e'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-1, 37); ctx.stroke();
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.moveTo(-27, 0);
  ctx.quadraticCurveTo(-22, -22, 0, -24);
  ctx.quadraticCurveTo(22, -22, 27, 0);
  ctx.quadraticCurveTo(14, -5, 0, 0);
  ctx.quadraticCurveTo(-14, -5, -27, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------
// Portraits
// ---------------------------------------------------------------
const portraitCache = new Map();

export function drawPortrait(canvas, id) {
  const size = canvas.width || 360;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const s = size / 180;
  ctx.save();
  ctx.scale(s, s);
  const c = personConfig(id);
  const isMemory = id === 'arthur' || id === 'elias';
  const bg = isMemory ? '#5a4b3b' : '#1a2832';
  const accent = c.accent || '#a85a42';

  // wash background
  const g = ctx.createRadialGradient(72, 54, 10, 90, 84, 115);
  g.addColorStop(0, mix(bg, accent, 0.28));
  g.addColorStop(0.55, bg);
  g.addColorStop(1, '#0b1217');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 180, 180);
  // abstract window glow
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = radial(ctx, 128, 30, 2, 80, [[0, 'rgba(255,213,150,.22)'], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(40, 0, 140, 120);
  ctx.restore();
  // brush texture
  const rand = seeded(id.length * 71 + 13);
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.04 + rand() * 0.04;
    ctx.fillStyle = rand() > 0.5 ? '#f0d8ae' : '#000';
    ctx.beginPath();
    ctx.ellipse(rand() * 180, rand() * 180, 6 + rand() * 26, 2 + rand() * 8, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // shoulders / clothing
  const shoulderY = 152;
  ctx.fillStyle = isMemory ? mix(c.coat, '#9b8a6f', 0.35) : c.coat;
  ctx.beginPath();
  ctx.moveTo(10, 180);
  ctx.quadraticCurveTo(22, 142, 52, 132);
  ctx.quadraticCurveTo(90, 145, 128, 132);
  ctx.quadraticCurveTo(158, 142, 170, 180);
  ctx.closePath();
  ctx.fill();
  // coat lapels
  ctx.fillStyle = c.coat2;
  ctx.beginPath();
  ctx.moveTo(54, 136); ctx.quadraticCurveTo(72, 152, 66, 180); ctx.lineTo(35, 180);
  ctx.quadraticCurveTo(44, 155, 54, 136); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(126, 136); ctx.quadraticCurveTo(108, 152, 114, 180); ctx.lineTo(145, 180);
  ctx.quadraticCurveTo(136, 155, 126, 136); ctx.closePath(); ctx.fill();
  // shirt
  ctx.fillStyle = c.shirt || '#d9ccb4';
  ctx.beginPath();
  ctx.moveTo(70, 136); ctx.lineTo(110, 136); ctx.lineTo(106, 172); ctx.lineTo(74, 172); ctx.closePath(); ctx.fill();
  if (c.vest) {
    ctx.fillStyle = c.vest;
    ctx.beginPath(); ctx.moveTo(54, 138); ctx.lineTo(72, 140); ctx.lineTo(72, 180); ctx.lineTo(44, 180); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(126, 138); ctx.lineTo(108, 140); ctx.lineTo(108, 180); ctx.lineTo(136, 180); ctx.closePath(); ctx.fill();
  }
  if (c.apron) {
    ctx.fillStyle = c.apron;
    ctx.beginPath(); ctx.moveTo(66, 162); ctx.lineTo(114, 162); ctx.lineTo(120, 180); ctx.lineTo(60, 180); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(100,80,55,.2)'; ctx.lineWidth = .6; ctx.stroke();
  }
  if (c.shawl) {
    ctx.fillStyle = c.shawl;
    ctx.beginPath();
    ctx.moveTo(34, 140); ctx.quadraticCurveTo(90, 156, 146, 140);
    ctx.lineTo(152, 174); ctx.quadraticCurveTo(90, 190, 28, 174); ctx.closePath();
    ctx.globalAlpha = .92; ctx.fill(); ctx.globalAlpha = 1;
  }
  // scarf
  if (c.scarf) {
    ctx.fillStyle = c.scarf;
    ctx.beginPath();
    ctx.moveTo(62, 130); ctx.quadraticCurveTo(90, 144, 118, 130);
    ctx.lineTo(122, 144); ctx.quadraticCurveTo(90, 158, 58, 144); ctx.closePath(); ctx.fill();
  }
  // neck
  ctx.fillStyle = c.skinShade;
  ctx.fillRect(76, 112, 28, 26);
  ctx.fillStyle = c.skin;
  ctx.fillRect(78, 110, 24, 20);
  // neck shadow
  ctx.fillStyle = 'rgba(80,45,30,.22)';
  ctx.beginPath(); ctx.ellipse(90, 129, 15, 5, 0, 0, Math.PI); ctx.fill();

  // head shape
  const headY = 82;
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.ellipse(90, headY, 36, 43, 0, 0, Math.PI * 2);
  ctx.fill();
  // jaw shading
  ctx.fillStyle = 'rgba(80,45,30,.13)';
  ctx.beginPath(); ctx.ellipse(90, 104, 24, 14, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = c.skinShade;
  ctx.globalAlpha = .35;
  ctx.beginPath(); ctx.ellipse(63, 88, 9, 27, .12, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // ears
  ctx.fillStyle = c.skinShade;
  ctx.beginPath(); ctx.ellipse(54, 88, 7, 12, -.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(126, 88, 7, 12, .1, 0, Math.PI * 2); ctx.fill();

  // hair back
  drawPortraitHairBack(ctx, c, headY, isMemory);

  // features
  const eyeY = 79;
  // brows
  ctx.strokeStyle = c.hair2; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(68, eyeY - 9); ctx.quadraticCurveTo(74, eyeY - 12, 81, eyeY - 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(99, eyeY - 9); ctx.quadraticCurveTo(106, eyeY - 12, 112, eyeY - 9); ctx.stroke();
  // eyes
  ctx.fillStyle = '#f4ead8';
  ctx.beginPath(); ctx.ellipse(75, eyeY, 7, 4.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(105, eyeY, 7, 4.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c.eyes;
  ctx.beginPath(); ctx.arc(75.5, eyeY + .4, 2.9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(104.5, eyeY + .4, 2.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#16110d';
  ctx.beginPath(); ctx.arc(75.5, eyeY + .4, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(104.5, eyeY + .4, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,.8)';
  ctx.beginPath(); ctx.arc(76.7, eyeY - 0.7, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(105.7, eyeY - 0.7, 0.8, 0, Math.PI * 2); ctx.fill();
  // upper lash
  ctx.strokeStyle = 'rgba(50,35,25,.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(68, eyeY - 2); ctx.quadraticCurveTo(75, eyeY - 5.5, 82, eyeY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(98, eyeY - 2); ctx.quadraticCurveTo(105, eyeY - 5.5, 112, eyeY - 2); ctx.stroke();

  // nose
  ctx.strokeStyle = 'rgba(110,70,50,.45)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(88, 84); ctx.quadraticCurveTo(84, 94, 90, 97); ctx.stroke();
  ctx.globalAlpha = .35;
  ctx.beginPath(); ctx.moveTo(84, 97); ctx.quadraticCurveTo(89, 99, 93, 97); ctx.stroke();
  ctx.globalAlpha = 1;

  // mouth
  const smile = id === 'silas' ? -1 : 1;
  ctx.strokeStyle = id === 'june' ? 'rgba(130,70,62,.7)' : 'rgba(145,80,70,.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 107);
  ctx.quadraticCurveTo(90, 111 + smile * 2.4, 100, 107);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,235,220,.18)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(84, 108.4); ctx.quadraticCurveTo(90, 110.5, 96, 108.4); ctx.stroke();

  // cheeks
  ctx.fillStyle = 'rgba(190,95,80,.13)';
  ctx.beginPath(); ctx.ellipse(68, 98, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(112, 98, 9, 5, 0, 0, Math.PI * 2); ctx.fill();

  if (c.freckles) {
    ctx.fillStyle = 'rgba(120,65,45,.38)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(67 + (i % 4) * 4.2, 96 + Math.floor(i / 4) * 4, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(99 + (i % 4) * 4.2, 96 + Math.floor(i / 4) * 4, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (c.wrinkles) {
    ctx.strokeStyle = 'rgba(90,60,45,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(61, 88); ctx.quadraticCurveTo(54, 94, 60, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(119, 88); ctx.quadraticCurveTo(126, 94, 120, 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(84, 46); ctx.quadraticCurveTo(90, 43, 96, 46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(81, 116); ctx.quadraticCurveTo(90, 119, 99, 116); ctx.stroke();
  }

  // glasses
  if (c.glasses) {
    ctx.strokeStyle = 'rgba(58,45,32,.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(75, eyeY, 12.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(105, eyeY, 12.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(87.5, eyeY); ctx.lineTo(92.5, eyeY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(62.5, eyeY - 1); ctx.lineTo(55, eyeY - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(117.5, eyeY - 1); ctx.lineTo(125, eyeY - 4); ctx.stroke();
    ctx.globalAlpha = .1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(71, eyeY - 3, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(101, eyeY - 3, 6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // beard
  if (c.beard) {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.moveTo(56, 92);
    ctx.quadraticCurveTo(54, 124, 90, 136);
    ctx.quadraticCurveTo(126, 124, 124, 92);
    ctx.quadraticCurveTo(116, 104, 104, 108);
    ctx.quadraticCurveTo(90, 114, 76, 108);
    ctx.quadraticCurveTo(64, 104, 56, 92);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    ctx.beginPath(); ctx.ellipse(75, 115, 10, 15, .3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(90,70,55,.25)'; ctx.lineWidth = .8;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(68 + i * 8, 108);
      ctx.quadraticCurveTo(66 + i * 8, 118, 70 + i * 7, 126);
      ctx.stroke();
    }
    // moustache over mouth
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.ellipse(83, 101, 10, 4.2, .12, 0, Math.PI * 2);
    ctx.ellipse(97, 101, 10, 4.2, -.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (c.moustache) {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.ellipse(83, 103, 9, 3.2, .12, 0, Math.PI * 2);
    ctx.ellipse(97, 103, 9, 3.2, -.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // hair front
  drawPortraitHairFront(ctx, c, headY, isMemory);

  // cap
  if (c.cap) {
    ctx.fillStyle = '#2f3b44';
    ctx.beginPath();
    ctx.ellipse(90, 58, 38, 17, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(128, 60); ctx.lineTo(52, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#232d34';
    ctx.beginPath(); ctx.ellipse(90, 60, 45, 9, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#b79a5d';
    ctx.beginPath(); ctx.arc(90, 51, 4, 0, Math.PI * 2); ctx.fill();
  }

  // rim light
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(255,205,140,.22)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(90, headY, 37, 44, 0, -1.1, 0.4);
  ctx.stroke();
  ctx.restore();

  // texture
  ctx.save();
  ctx.globalAlpha = .08;
  const tex = getPortraitTexture();
  if (tex) ctx.drawImage(tex, 0, 0, 180, 180);
  ctx.restore();

  // vignette
  const vg = ctx.createRadialGradient(90, 86, 40, 90, 90, 110);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 180, 180);

  ctx.restore();
}

function drawPortraitHairBack(ctx, c, headY, isMemory) {
  ctx.fillStyle = c.hair2;
  if (c.hairStyle === 'bob') {
    ctx.beginPath(); ctx.ellipse(90, headY - 3, 43, 48, 0, Math.PI * .85, Math.PI * 2.15); ctx.fill();
    ctx.beginPath(); ctx.ellipse(58, headY + 10, 9, 22, .1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(122, headY + 10, 9, 22, -.1, 0, Math.PI * 2); ctx.fill();
  } else if (c.hairStyle === 'bun') {
    ctx.beginPath(); ctx.ellipse(90, headY - 4, 39, 42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(90, headY - 45, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(90, headY - 45, 11, 0, Math.PI * 2); ctx.stroke();
  } else if (c.hairStyle === 'long') {
    ctx.beginPath(); ctx.ellipse(90, headY + 4, 45, 54, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(48, headY + 6); ctx.quadraticCurveTo(34, headY + 56, 52, headY + 86); ctx.quadraticCurveTo(63, headY + 46, 61, headY + 14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(132, headY + 6); ctx.quadraticCurveTo(146, headY + 56, 128, headY + 86); ctx.quadraticCurveTo(117, headY + 46, 119, headY + 14); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(90, headY - 2, 39, 44, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPortraitHairFront(ctx, c, headY, isMemory) {
  if (c.cap) return;
  ctx.fillStyle = c.hair;
  if (c.hairStyle === 'bob') {
    ctx.beginPath();
    ctx.moveTo(52, headY - 14);
    ctx.quadraticCurveTo(56, headY - 46, 90, headY - 45);
    ctx.quadraticCurveTo(124, headY - 46, 128, headY - 14);
    ctx.quadraticCurveTo(116, headY - 30, 99, headY - 28);
    ctx.quadraticCurveTo(90, headY - 19, 77, headY - 29);
    ctx.quadraticCurveTo(62, headY - 32, 52, headY - 14);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(54, headY + 4, 6, 15, .1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(126, headY + 4, 6, 15, -.1, 0, Math.PI * 2); ctx.fill();
  } else if (c.hairStyle === 'bun') {
    ctx.beginPath();
    ctx.moveTo(52, headY - 12);
    ctx.quadraticCurveTo(54, headY - 46, 90, headY - 45);
    ctx.quadraticCurveTo(126, headY - 46, 128, headY - 12);
    ctx.quadraticCurveTo(116, headY - 27, 98, headY - 26);
    ctx.quadraticCurveTo(90, headY - 17, 80, headY - 26);
    ctx.quadraticCurveTo(62, headY - 27, 52, headY - 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.13)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(66, headY - 34); ctx.quadraticCurveTo(90, headY - 42, 114, headY - 33); ctx.stroke();
  } else if (c.hairStyle === 'long') {
    ctx.beginPath();
    ctx.moveTo(50, headY - 10);
    ctx.quadraticCurveTo(53, headY - 48, 90, headY - 47);
    ctx.quadraticCurveTo(127, headY - 48, 130, headY - 10);
    ctx.quadraticCurveTo(122, headY - 27, 106, headY - 25);
    ctx.quadraticCurveTo(95, headY - 16, 80, headY - 27);
    ctx.quadraticCurveTo(62, headY - 30, 50, headY - 10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(60, headY - 33); ctx.quadraticCurveTo(80, headY - 43, 103, headY - 30); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(51, headY - 13);
    ctx.quadraticCurveTo(54, headY - 47, 90, headY - 45);
    ctx.quadraticCurveTo(126, headY - 47, 129, headY - 13);
    ctx.quadraticCurveTo(114, headY - 28, 90, headY - 25);
    ctx.quadraticCurveTo(66, headY - 28, 51, headY - 13);
    ctx.closePath(); ctx.fill();
  }
  // highlight
  ctx.strokeStyle = 'rgba(255,235,200,.16)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(64, headY - 34); ctx.quadraticCurveTo(76, headY - 41, 90, headY - 38); ctx.stroke();
}

let portraitTexture = null;
function getPortraitTexture() {
  if (portraitTexture) return portraitTexture;
  portraitTexture = makeCanvas(180, 180);
  const ctx = portraitTexture.getContext('2d');
  const img = ctx.createImageData(180, 180);
  const rand = seeded(331);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + rand() * 120;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 40 + rand() * 40;
  }
  ctx.putImageData(img, 0, 0);
  return portraitTexture;
}

export function portraitDataURL(id) {
  if (portraitCache.has(id)) return portraitCache.get(id);
  const canvas = makeCanvas(360, 360);
  drawPortrait(canvas, id);
  const url = canvas.toDataURL('image/png');
  portraitCache.set(id, url);
  return url;
}
