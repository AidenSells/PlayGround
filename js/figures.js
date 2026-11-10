/* ============================================================
   THE LITTLE THINGS — people
   ============================================================ */
(function () {
  const LT = (window.LT = window.LT || {});
  const U = LT.util;
  const A = LT.art;
  const TAU = Math.PI * 2;
  const rr = A.rr;
  const rgba = A.rgba;

  const P = {
    mara: {
      skin: '#a97452', skinLight: '#c08a65', skinShade: '#7e5037',
      hair: '#2c1d19', hairLight: '#4b3028', coat: '#b98545', coatShade: '#8a5c2c',
      scarf: '#3f6560', pants: '#4a4038', shoes: '#2c231d', bag: '#6d4a30', seed: 1.2,
    },
    june: {
      skin: '#c9b3a2', skinLight: '#ddc9b8', skinShade: '#9c8371',
      hair: '#b8b2a6', hairLight: '#d6d1c7', coat: '#40576a', coatShade: '#2c3e4d',
      scarf: '#c7b08a', pants: '#3b3a3a', shoes: '#2b2724', seed: 2.4,
    },
    theo: {
      skin: '#b9825d', skinLight: '#cf9a73', skinShade: '#8b5a3a',
      hair: '#6f665c', hairLight: '#92877b', coat: '#5f4632', coatShade: '#3f2c1f',
      scarf: '#7d5a3b', pants: '#4b4036', shoes: '#2c241e', seed: 3.1,
    },
    wren: {
      skin: '#b77e5f', skinLight: '#d09a78', skinShade: '#8a563c',
      hair: '#7b3f2a', hairLight: '#a45c3e', coat: '#4e5c3c', coatShade: '#354027',
      scarf: '#c8a85a', pants: '#4b4236', shoes: '#3a3025', seed: 4.2,
    },
    player: {
      skin: '#b98b68', skinLight: '#cfa07b', skinShade: '#8c6245',
      hair: '#332b26', hairLight: '#4e4038', coat: '#2f4a45', coatShade: '#203430',
      scarf: '#c9b58d', pants: '#3f3a34', shoes: '#2a231f', seed: 5.3,
    },
    elias: {
      skin: '#a98d70', skinLight: '#c0a486', skinShade: '#82684f',
      hair: '#3a2d24', hairLight: '#5c4838', coat: '#6d6252', coatShade: '#4c4438',
      scarf: '#8d7c62', pants: '#4c453b', shoes: '#2e2822', seed: 6.1,
    },
  };

  A.people = P;

  /* ------------------------------------------------------------
     World characters
     ------------------------------------------------------------ */
  A.drawCharacter = function (ctx, id, x, y, t, dir, opts) {
    const p = P[id] || P.player;
    opts = opts || {};
    const walking = !!opts.walking;
    const phase = opts.phase || 0;
    const sitting = !!opts.sitting;
    const scale = opts.scale || 1;
    const bob = walking ? Math.abs(Math.sin(phase)) * 1.3 : Math.sin(t * 1.45 + p.seed) * 0.5;
    const swing = walking ? Math.sin(phase) * 5 : 0;
    const armSwing = walking ? -Math.sin(phase) * 4 : 0;
    const d = dir || 'down';
    const profile = d === 'left' || d === 'right';
    const facing = d === 'down' || d === 'left' || d === 'right';

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // shadow
    ctx.save();
    ctx.scale(1, 0.28);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    sh.addColorStop(0, 'rgba(0,0,0,.42)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU);
    ctx.fill();
    ctx.restore();

    const bodyTop = sitting ? -50 : -58;
    const hip = sitting ? -16 : -25;
    const headY = sitting ? -57 : -67;
    const headR = 9.2;

    // legs
    if (!sitting) {
      const legY = -24;
      ctx.strokeStyle = p.pants;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.5, legY);
      ctx.lineTo(-5 + swing * 0.6, -2);
      ctx.moveTo(4.5, legY);
      ctx.lineTo(5 - swing * 0.6, -2);
      ctx.stroke();
      // shoes
      ctx.fillStyle = p.shoes;
      ctx.beginPath();
      ctx.ellipse(-5 + swing * 0.7, -1, 5.4, 2.8, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(5 - swing * 0.7, -1, 5.4, 2.8, 0, 0, TAU);
      ctx.fill();
    } else {
      // seated legs
      ctx.strokeStyle = p.pants;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, hip);
      ctx.quadraticCurveTo(-9, -6, -7, -2);
      ctx.moveTo(5, hip);
      ctx.quadraticCurveTo(9, -6, 7, -2);
      ctx.stroke();
      ctx.fillStyle = p.shoes;
      ctx.beginPath();
      ctx.ellipse(-7, -1, 5.2, 2.6, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, -1, 5.2, 2.6, 0, 0, TAU);
      ctx.fill();
    }

    // coat / body
    ctx.save();
    ctx.translate(0, bob);
    const coatGrad = ctx.createLinearGradient(-16, bodyTop, 18, -12);
    coatGrad.addColorStop(0, p.coat);
    coatGrad.addColorStop(0.55, p.coat);
    coatGrad.addColorStop(1, p.coatShade);
    ctx.fillStyle = coatGrad;
    ctx.beginPath();
    ctx.moveTo(-12.5, bodyTop);
    ctx.quadraticCurveTo(-17, bodyTop + 16, -13.5, hip - 3);
    ctx.lineTo(-16, -12);
    ctx.quadraticCurveTo(0, -9, 16, -12);
    ctx.lineTo(13.5, hip - 3);
    ctx.quadraticCurveTo(17, bodyTop + 16, 12.5, bodyTop);
    ctx.quadraticCurveTo(0, bodyTop - 3, -12.5, bodyTop);
    ctx.closePath();
    ctx.fill();
    // coat opening
    ctx.strokeStyle = rgba(p.coatShade, 0.8);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, bodyTop + 2);
    ctx.lineTo(0, -13);
    ctx.stroke();
    // warm rim
    ctx.strokeStyle = 'rgba(255,214,150,.22)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-12, bodyTop + 4);
    ctx.quadraticCurveTo(-15.5, bodyTop + 20, -12.5, hip - 2);
    ctx.stroke();
    ctx.restore();

    // arms
    ctx.save();
    ctx.translate(0, bob);
    ctx.strokeStyle = p.coatShade;
    ctx.lineWidth = 6.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11.5, bodyTop + 5);
    ctx.lineTo(-14 + armSwing, hip + 2);
    ctx.moveTo(11.5, bodyTop + 5);
    ctx.lineTo(14 - armSwing, hip + 2);
    ctx.stroke();
    // hands
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(-14 + armSwing, hip + 2, 3, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14 - armSwing, hip + 2, 3, 0, TAU);
    ctx.fill();
    ctx.restore();

    // scarf
    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = p.scarf;
    ctx.beginPath();
    ctx.ellipse(0, bodyTop + 1.5, 10, 3.6, 0, 0, TAU);
    ctx.fill();
    if (id === 'mara' || id === 'player') {
      ctx.beginPath();
      ctx.moveTo(4, bodyTop + 3);
      ctx.quadraticCurveTo(7, bodyTop + 14, 3, bodyTop + 20);
      ctx.lineTo(7, bodyTop + 19);
      ctx.quadraticCurveTo(10, bodyTop + 10, 7, bodyTop + 3);
      ctx.fill();
    }
    ctx.restore();

    // neck + head
    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = p.skinShade;
    ctx.fillRect(-3, headY + headR - 4, 6, 8);
    const headGrad = ctx.createRadialGradient(-3, headY - 4, 1, 0, headY, headR * 1.4);
    headGrad.addColorStop(0, p.skinLight);
    headGrad.addColorStop(0.65, p.skin);
    headGrad.addColorStop(1, p.skinShade);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, headR, headR * 1.06, 0, 0, TAU);
    ctx.fill();
    // ears
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.ellipse(-headR + 0.5, headY + 1, 2.2, 3.2, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headR - 0.5, headY + 1, 2.2, 3.2, 0, 0, TAU);
    ctx.fill();

    // hair back / shape
    ctx.fillStyle = p.hair;
    if (id === 'mara') {
      // loose curls
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.85 + i * 0.14);
        const cx = Math.cos(a) * headR * 0.95;
        const cy = headY + Math.sin(a) * headR * 0.85;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.2, 0, TAU);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(0, headY - 5.5, headR * 1.03, headR * 0.66, 0, Math.PI, TAU);
      ctx.fill();
    } else if (id === 'june') {
      ctx.beginPath();
      ctx.ellipse(0, headY - 4, headR * 1.02, headR * 0.72, 0, Math.PI, TAU);
      ctx.fill();
      // bun
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.95, 4.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.hairLight;
      ctx.beginPath();
      ctx.arc(-1, headY - headR * 1.02, 2, 0, TAU);
      ctx.fill();
    } else if (id === 'theo') {
      // side fringe
      ctx.beginPath();
      ctx.ellipse(-headR * 0.55, headY - 2, 4.2, headR * 0.65, -0.2, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headR * 0.55, headY - 2, 4.2, headR * 0.65, 0.2, 0, TAU);
      ctx.fill();
    } else if (id === 'wren') {
      ctx.beginPath();
      ctx.ellipse(0, headY - 4.5, headR * 1.06, headR * 0.78, 0, Math.PI, TAU);
      ctx.fill();
      // braid
      ctx.strokeStyle = p.hair;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headR * 0.8, headY + 3);
      ctx.quadraticCurveTo(headR * 1.1, headY + 16, headR * 0.7, headY + 26);
      ctx.stroke();
      ctx.fillStyle = p.hairLight;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(headR * 0.82 - i * 1.2, headY + 9 + i * 6, 2.2, 0, TAU);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(0, headY - 5, headR * 1.03, headR * 0.64, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = p.hairLight;
      ctx.beginPath();
      ctx.ellipse(-2, headY - 7, 4, 2.2, -0.3, 0, TAU);
      ctx.fill();
    }

    // face
    if (facing) {
      const off = profile ? (d === 'left' ? -2.4 : 2.4) : 0;
      ctx.fillStyle = 'rgba(38,28,22,.85)';
      if (profile) {
        ctx.beginPath();
        ctx.arc(off * 0.8, headY - 1, 1.05, 0, TAU);
        ctx.fill();
        // nose profile
        ctx.strokeStyle = rgba(p.skinShade, 0.7);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(off + (d === 'left' ? -4.4 : 4.4), headY - 1);
        ctx.lineTo(off + (d === 'left' ? -6 : 6), headY + 2.2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-3.2, headY - 1, 1.15, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3.2, headY - 1, 1.15, 0, TAU);
        ctx.fill();
        // brows
        ctx.strokeStyle = rgba(p.hair, 0.6);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-5, headY - 3.8);
        ctx.lineTo(-2, headY - 4.1);
        ctx.moveTo(2, headY - 4.1);
        ctx.lineTo(5, headY - 3.8);
        ctx.stroke();
        // nose
        ctx.strokeStyle = rgba(p.skinShade, 0.55);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, headY + 0.5);
        ctx.lineTo(0.7, headY + 2.8);
        ctx.stroke();
        // mouth
        ctx.strokeStyle = rgba(id === 'wren' ? '#7c3f34' : '#6d4038', 0.75);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2.2, headY + 5.4);
        ctx.quadraticCurveTo(0, headY + 6.2, 2.2, headY + 5.4);
        ctx.stroke();
      }
    }

    // accessories
    if (id === 'theo') {
      // glasses
      ctx.strokeStyle = 'rgba(196,158,96,.9)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(-3.4, headY - 0.8, 2.7, 0, TAU);
      ctx.moveTo(0.7, headY - 0.8);
      ctx.arc(3.4, headY - 0.8, 2.7, 0, TAU);
      ctx.moveTo(-6.1, headY - 0.8);
      ctx.lineTo(-headR + 0.5, headY - 0.4);
      ctx.moveTo(6.1, headY - 0.8);
      ctx.lineTo(headR - 0.5, headY - 0.4);
      ctx.stroke();
      // mustache
      ctx.strokeStyle = 'rgba(120,110,98,.95)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-3.4, headY + 3.8);
      ctx.quadraticCurveTo(-1, headY + 4.8, 0, headY + 3.6);
      ctx.quadraticCurveTo(1, headY + 4.8, 3.4, headY + 3.8);
      ctx.stroke();
    }
    if (id === 'mara') {
      // gold earrings
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(-headR + 0.5, headY + 4.2, 1.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headR - 0.5, headY + 4.2, 1.1, 0, TAU);
      ctx.fill();
    }
    if (id === 'june') {
      // glasses on chain
      ctx.strokeStyle = 'rgba(200,190,170,.55)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-headR + 1, headY + 5);
      ctx.quadraticCurveTo(-headR - 2, headY + 15, -6, bodyTop + 4);
      ctx.stroke();
    }
    if (id === 'wren') {
      // freckles
      ctx.fillStyle = 'rgba(110,60,40,.35)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-4 + (i % 3) * 3, headY + 1 + Math.floor(i / 3) * 1.6, 0.55, 0, TAU);
        ctx.fill();
      }
    }
    if (id === 'player') {
      // glasses
      ctx.strokeStyle = 'rgba(190,170,140,.55)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(-3.3, headY - 0.8, 2.2, 0, TAU);
      ctx.moveTo(1.1, headY - 0.8);
      ctx.arc(3.3, headY - 0.8, 2.2, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    // satchel
    if (id === 'mara' || id === 'player') {
      ctx.save();
      ctx.translate(0, bob);
      ctx.strokeStyle = p.bag;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-9, bodyTop + 5);
      ctx.lineTo(10, -17);
      ctx.stroke();
      ctx.fillStyle = p.bag;
      rr(ctx, 7, -22, 9, 10, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,180,120,.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // June's cane / thermos
    if (id === 'june') {
      ctx.save();
      ctx.translate(0, bob);
      ctx.strokeStyle = 'rgba(80,58,38,.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(16, hip - 2);
      ctx.lineTo(19, -1);
      ctx.stroke();
      if (sitting) {
        // thermos beside her
        ctx.fillStyle = '#8d5f42';
        rr(ctx, 15, -12, 6, 13, 2);
        ctx.fill();
        ctx.fillStyle = '#c9b58d';
        rr(ctx, 16, -15, 4, 4, 1);
        ctx.fill();
      }
      ctx.restore();
    }

    // Theo's apron
    if (id === 'theo') {
      ctx.save();
      ctx.translate(0, bob);
      ctx.fillStyle = '#4b3525';
      ctx.beginPath();
      ctx.moveTo(-8, bodyTop + 6);
      ctx.lineTo(-9, -15);
      ctx.lineTo(9, -15);
      ctx.lineTo(8, bodyTop + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,200,160,.16)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // magnifier on head
      ctx.strokeStyle = 'rgba(190,150,90,.8)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-7, headY - headR - 3, 3.2, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Wren's apron/basket
    if (id === 'wren') {
      ctx.save();
      ctx.translate(0, bob);
      ctx.fillStyle = 'rgba(92,110,74,.9)';
      ctx.beginPath();
      ctx.moveTo(-8, bodyTop + 10);
      ctx.lineTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(8, bodyTop + 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  /* ------------------------------------------------------------
     Pepper the cat
     ------------------------------------------------------------ */
  A.drawCat = function (ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    const breath = Math.sin(t * 1.1) * 0.8;
    // shadow
    ctx.save();
    ctx.scale(1, 0.3);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    sh.addColorStop(0, 'rgba(0,0,0,.35)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, TAU);
    ctx.fill();
    ctx.restore();
    // tail
    ctx.strokeStyle = '#2e2b28';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(18, -4);
    ctx.bezierCurveTo(30, -8, 32, 2, 22, 6);
    ctx.stroke();
    // body
    const g = ctx.createRadialGradient(-6, -12, 2, 0, -6, 24);
    g.addColorStop(0, '#4b4640');
    g.addColorStop(0.65, '#35322e');
    g.addColorStop(1, '#242220');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -8 + breath * 0.3, 22, 13 + breath, 0.06, 0, TAU);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.ellipse(-13, -14 + breath * 0.3, 10, 8.5, -0.1, 0, TAU);
    ctx.fill();
    // ears
    ctx.beginPath();
    ctx.moveTo(-20, -20);
    ctx.lineTo(-19, -28);
    ctx.lineTo(-13, -22);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.lineTo(-7, -28);
    ctx.lineTo(-5, -19);
    ctx.closePath();
    ctx.fill();
    // closed eyes
    ctx.strokeStyle = 'rgba(210,180,120,.65)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(-16.5, -14, 2.4, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-9.5, -14, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
    // muzzle
    ctx.fillStyle = 'rgba(190,170,145,.3)';
    ctx.beginPath();
    ctx.ellipse(-13, -11, 4, 2.4, 0, 0, TAU);
    ctx.fill();
    // stripes
    ctx.strokeStyle = 'rgba(15,14,13,.35)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(2 + i * 5, -17);
      ctx.quadraticCurveTo(3 + i * 5, -12, 1 + i * 5, -8);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------
     Portraits
     ------------------------------------------------------------ */
  function backdrop(ctx, c1, c2, glowColor) {
    const g = ctx.createLinearGradient(0, 0, 340, 420);
    g.addColorStop(0, c1);
    g.addColorStop(0.6, c2);
    g.addColorStop(1, '#0d1414');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 340, 420);
    // warm pool
    const p = ctx.createRadialGradient(120, 140, 10, 120, 160, 240);
    p.addColorStop(0, rgba(glowColor, 0.28));
    p.addColorStop(0.55, rgba(glowColor, 0.08));
    p.addColorStop(1, rgba(glowColor, 0));
    ctx.fillStyle = p;
    ctx.fillRect(0, 0, 340, 420);
    // brush strokes
    for (let i = 0; i < 14; i++) {
      ctx.strokeStyle = `rgba(255,240,210,${0.01 + (i % 3) * 0.008})`;
      ctx.lineWidth = 10 + (i % 5) * 6;
      ctx.beginPath();
      const x = (i * 53) % 380 - 20;
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + 40, 210, x - 20, 420);
      ctx.stroke();
    }
    // vignette
    const v = ctx.createRadialGradient(170, 190, 60, 170, 200, 300);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(4,8,8,.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 340, 420);
  }

  function headShape(ctx, cx, cy, rx, ry, p) {
    const g = ctx.createRadialGradient(cx - rx * 0.4, cy - ry * 0.35, rx * 0.1, cx, cy, rx * 1.5);
    g.addColorStop(0, p.skinLight);
    g.addColorStop(0.55, p.skin);
    g.addColorStop(1, p.skinShade);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy - ry * 0.12);
    ctx.bezierCurveTo(cx - rx, cy - ry * 0.88, cx + rx, cy - ry * 0.88, cx + rx, cy - ry * 0.12);
    ctx.bezierCurveTo(cx + rx * 0.98, cy + ry * 0.42, cx + rx * 0.5, cy + ry * 0.95, cx, cy + ry * 0.98);
    ctx.bezierCurveTo(cx - rx * 0.5, cy + ry * 0.95, cx - rx * 0.98, cy + ry * 0.42, cx - rx, cy - ry * 0.12);
    ctx.closePath();
    ctx.fill();
    // cheek warmth
    ctx.save();
    ctx.globalAlpha = 0.18;
    const blush = ctx.createRadialGradient(cx - rx * 0.45, cy + ry * 0.25, 1, cx - rx * 0.45, cy + ry * 0.25, rx * 0.45);
    blush.addColorStop(0, '#b66550');
    blush.addColorStop(1, 'rgba(182,101,80,0)');
    ctx.fillStyle = blush;
    ctx.fillRect(cx - rx, cy, rx * 2, ry);
    const blush2 = ctx.createRadialGradient(cx + rx * 0.45, cy + ry * 0.25, 1, cx + rx * 0.45, cy + ry * 0.25, rx * 0.45);
    blush2.addColorStop(0, '#b66550');
    blush2.addColorStop(1, 'rgba(182,101,80,0)');
    ctx.fillStyle = blush2;
    ctx.fillRect(cx - rx, cy, rx * 2, ry);
    ctx.restore();
  }

  function eye(ctx, x, y, w, h, iris, opts) {
    opts = opts || {};
    // socket shadow
    ctx.save();
    ctx.fillStyle = 'rgba(60,40,28,.16)';
    ctx.beginPath();
    ctx.ellipse(x, y - 1, w * 1.15, h * 1.5, 0, 0, TAU);
    ctx.fill();
    // white
    ctx.fillStyle = opts.white || '#e9e1d4';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, TAU);
    ctx.fill();
    // iris
    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(x + (opts.look || 0), y, h * 0.82, 0, TAU);
    ctx.fill();
    // pupil
    ctx.fillStyle = 'rgba(18,14,12,.9)';
    ctx.beginPath();
    ctx.arc(x + (opts.look || 0), y, h * 0.36, 0, TAU);
    ctx.fill();
    // catchlight
    ctx.fillStyle = 'rgba(255,250,235,.85)';
    ctx.beginPath();
    ctx.arc(x - w * 0.25, y - h * 0.25, h * 0.18, 0, TAU);
    ctx.fill();
    // upper lid
    ctx.strokeStyle = opts.lid || 'rgba(48,32,24,.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, Math.PI * 1.03, Math.PI * 1.97);
    ctx.stroke();
    // lower lid
    ctx.strokeStyle = 'rgba(90,60,42,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.95, h, 0, Math.PI * 0.05, Math.PI * 0.95);
    ctx.stroke();
    ctx.restore();
  }

  function brow(ctx, x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 2.5, x2, y2);
    ctx.stroke();
  }

  function nose(ctx, cx, cy, w, h, shade) {
    ctx.strokeStyle = rgba(shade, 0.5);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.12, cy - h * 0.45);
    ctx.quadraticCurveTo(cx - w * 0.22, cy + h * 0.2, cx - w * 0.08, cy + h * 0.38);
    ctx.stroke();
    ctx.strokeStyle = rgba(shade, 0.35);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.12, cy + h * 0.38);
    ctx.quadraticCurveTo(cx, cy + h * 0.48, cx + w * 0.15, cy + h * 0.32);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,245,225,.12)';
    ctx.beginPath();
    ctx.ellipse(cx + w * 0.06, cy - h * 0.05, w * 0.1, h * 0.22, 0, 0, TAU);
    ctx.fill();
  }

  function lips(ctx, cx, cy, w, color, opts) {
    opts = opts || {};
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy);
    ctx.quadraticCurveTo(cx - w * 0.22, cy - 2.2, cx, cy - 0.4);
    ctx.quadraticCurveTo(cx + w * 0.22, cy - 2.2, cx + w / 2, cy);
    ctx.stroke();
    if (!opts.thin) {
      ctx.strokeStyle = rgba(color, 0.55);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.38, cy + 1.8);
      ctx.quadraticCurveTo(cx, cy + 4.2, cx + w * 0.38, cy + 1.8);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,240,220,.14)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2.4, w * 0.2, 1.6, 0, 0, TAU);
      ctx.fill();
    }
    if (opts.smile) {
      ctx.strokeStyle = rgba(color, 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.6, cy - 3);
      ctx.quadraticCurveTo(cx - w * 0.55, cy + 1, cx - w * 0.48, cy + 2);
      ctx.moveTo(cx + w * 0.6, cy - 3);
      ctx.quadraticCurveTo(cx + w * 0.55, cy + 1, cx + w * 0.48, cy + 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function shoulders(ctx, p, opts) {
    opts = opts || {};
    const g = ctx.createLinearGradient(40, 280, 300, 420);
    g.addColorStop(0, p.coat);
    g.addColorStop(0.55, p.coat);
    g.addColorStop(1, p.coatShade);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.lineTo(0, 352);
    ctx.bezierCurveTo(20, 296, 92, 278, 128, 276);
    ctx.lineTo(212, 276);
    ctx.bezierCurveTo(248, 278, 320, 296, 340, 352);
    ctx.lineTo(340, 420);
    ctx.closePath();
    ctx.fill();
    // collar
    ctx.fillStyle = opts.collar || 'rgba(235,220,195,.8)';
    ctx.beginPath();
    ctx.moveTo(128, 280);
    ctx.lineTo(170, 330);
    ctx.lineTo(212, 280);
    ctx.quadraticCurveTo(170, 292, 128, 280);
    ctx.fill();
    // lapels
    ctx.strokeStyle = rgba(p.coatShade, 0.9);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(126, 282);
    ctx.quadraticCurveTo(146, 330, 138, 390);
    ctx.moveTo(214, 282);
    ctx.quadraticCurveTo(194, 330, 202, 390);
    ctx.stroke();
    // warm rim
    ctx.strokeStyle = 'rgba(255,214,150,.18)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(12, 360);
    ctx.bezierCurveTo(30, 306, 90, 286, 124, 282);
    ctx.stroke();
  }

  function neck(ctx, p) {
    const g = ctx.createLinearGradient(150, 235, 190, 290);
    g.addColorStop(0, p.skinLight);
    g.addColorStop(1, p.skinShade);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(148, 232);
    ctx.quadraticCurveTo(146, 276, 132, 288);
    ctx.lineTo(208, 288);
    ctx.quadraticCurveTo(194, 276, 192, 232);
    ctx.closePath();
    ctx.fill();
    // shadow
    ctx.fillStyle = 'rgba(70,45,30,.18)';
    ctx.beginPath();
    ctx.ellipse(170, 284, 34, 10, 0, 0, TAU);
    ctx.fill();
  }

  A.drawPortrait = function (canvas, id) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.scale(w / 340, h / 420);
    const p = P[id] || P.player;
    if (id === 'mara') {
      backdrop(ctx, '#1b2c2a', '#111b1b', '255,190,110');
      shoulders(ctx, p, { collar: '#d9c6a4' });
      // scarf
      ctx.fillStyle = p.scarf;
      ctx.beginPath();
      ctx.moveTo(130, 286);
      ctx.quadraticCurveTo(170, 320, 210, 286);
      ctx.quadraticCurveTo(190, 330, 170, 350);
      ctx.quadraticCurveTo(150, 330, 130, 286);
      ctx.fill();
      neck(ctx, p);
      // hair back
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.ellipse(170, 150, 88, 100, 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        const rx = 170 + Math.cos(a) * 80;
        const ry = 150 + Math.sin(a) * 92;
        ctx.beginPath();
        ctx.arc(rx, ry, 14 + (i % 3) * 5, 0, TAU);
        ctx.fill();
      }
      headShape(ctx, 170, 164, 60, 74, p);
      // ears
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(110, 168, 8, 13, -0.15, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(230, 168, 8, 13, 0.15, 0, TAU);
      ctx.fill();
      // hair front
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.moveTo(108, 152);
      ctx.bezierCurveTo(108, 90, 148, 72, 178, 76);
      ctx.bezierCurveTo(222, 72, 238, 108, 232, 150);
      ctx.bezierCurveTo(218, 120, 205, 110, 185, 114);
      ctx.bezierCurveTo(172, 98, 142, 104, 130, 130);
      ctx.bezierCurveTo(120, 140, 114, 148, 108, 152);
      ctx.fill();
      // curls at temple
      ctx.fillStyle = p.hairLight;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(116 + i * 3, 130 + i * 8, 6 - i * 0.4, 0, TAU);
        ctx.fill();
      }
      // brows
      brow(ctx, 136, 150, 158, 147, 'rgba(55,35,28,.75)', 3);
      brow(ctx, 182, 147, 204, 150, 'rgba(55,35,28,.75)', 3);
      // eyes
      eye(ctx, 147, 164, 11, 7, '#5b3f2c', { look: 1 });
      eye(ctx, 193, 164, 11, 7, '#5b3f2c', { look: 1 });
      // nose, lips
      nose(ctx, 170, 180, 24, 30, p.skinShade);
      lips(ctx, 170, 208, 26, '#7d4a3e', { smile: true });
      // chin shadow
      ctx.fillStyle = 'rgba(110,70,50,.1)';
      ctx.beginPath();
      ctx.ellipse(170, 224, 20, 6, 0, 0, TAU);
      ctx.fill();
      // earrings
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(109, 181, 3, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(231, 181, 3, 0, TAU);
      ctx.fill();
      // strap
      ctx.strokeStyle = p.bag;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(104, 340);
      ctx.lineTo(190, 286);
      ctx.stroke();
    } else if (id === 'june') {
      backdrop(ctx, '#1b2930', '#0e181b', '190,210,210');
      shoulders(ctx, p, { collar: '#e4d8c4' });
      // blouse collar
      ctx.fillStyle = '#ddd0ba';
      ctx.beginPath();
      ctx.moveTo(140, 282);
      ctx.lineTo(170, 330);
      ctx.lineTo(200, 282);
      ctx.quadraticCurveTo(170, 300, 140, 282);
      ctx.fill();
      // cardigan edges
      ctx.fillStyle = p.coat;
      ctx.beginPath();
      ctx.moveTo(128, 282);
      ctx.quadraticCurveTo(146, 320, 150, 420);
      ctx.lineTo(80, 420);
      ctx.quadraticCurveTo(100, 330, 112, 286);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(212, 282);
      ctx.quadraticCurveTo(194, 320, 190, 420);
      ctx.lineTo(260, 420);
      ctx.quadraticCurveTo(240, 330, 228, 286);
      ctx.fill();
      neck(ctx, p);
      // hair back / bun
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.ellipse(170, 145, 74, 84, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(170, 74, 30, 0, TAU);
      ctx.fill();
      ctx.fillStyle = p.hairLight;
      ctx.beginPath();
      ctx.arc(162, 70, 12, 0, TAU);
      ctx.fill();
      // face
      headShape(ctx, 170, 166, 57, 72, p);
      // ears
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(113, 170, 7, 12, -0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(227, 170, 7, 12, 0.1, 0, TAU);
      ctx.fill();
      // silver hair front
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.moveTo(114, 148);
      ctx.bezierCurveTo(116, 94, 150, 82, 172, 84);
      ctx.bezierCurveTo(210, 82, 226, 108, 226, 148);
      ctx.bezierCurveTo(210, 118, 198, 110, 180, 114);
      ctx.bezierCurveTo(160, 100, 132, 110, 126, 138);
      ctx.fill();
      ctx.strokeStyle = p.hairLight;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(122 + i * 11, 100 + (i % 3) * 8);
        ctx.quadraticCurveTo(128 + i * 10, 128, 124 + i * 11, 152);
        ctx.stroke();
      }
      // brows (thin)
      brow(ctx, 138, 151, 158, 149, 'rgba(90,84,74,.6)', 1.8);
      brow(ctx, 182, 149, 202, 151, 'rgba(90,84,74,.6)', 1.8);
      // eyes
      eye(ctx, 148, 166, 10, 6.5, '#6b7d84', { look: -1, lid: 'rgba(60,52,44,.7)' });
      eye(ctx, 192, 166, 10, 6.5, '#6b7d84', { look: -1, lid: 'rgba(60,52,44,.7)' });
      // crow's feet
      ctx.strokeStyle = 'rgba(110,80,60,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(133, 166);
      ctx.lineTo(126, 163);
      ctx.moveTo(133, 169);
      ctx.lineTo(126, 172);
      ctx.moveTo(207, 166);
      ctx.lineTo(214, 163);
      ctx.moveTo(207, 169);
      ctx.lineTo(214, 172);
      ctx.stroke();
      // nose, lips
      nose(ctx, 170, 182, 22, 30, p.skinShade);
      lips(ctx, 170, 210, 24, '#7d5a52', { thin: true });
      // mouth line (dry)
      ctx.strokeStyle = 'rgba(80,50,44,.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(160, 213);
      ctx.lineTo(180, 213);
      ctx.stroke();
      // glasses chain + brooch
      ctx.strokeStyle = 'rgba(205,190,160,.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(112, 175);
      ctx.quadraticCurveTo(104, 230, 140, 282);
      ctx.stroke();
      ctx.fillStyle = '#b98d55';
      ctx.beginPath();
      ctx.ellipse(170, 304, 12, 15, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#d8c7a8';
      ctx.beginPath();
      ctx.ellipse(170, 302, 7, 9, 0, 0, TAU);
      ctx.fill();
      // cardigan buttons
      ctx.fillStyle = 'rgba(200,180,140,.5)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(206, 340 + i * 24, 2, 0, TAU);
        ctx.fill();
      }
    } else if (id === 'theo') {
      backdrop(ctx, '#2c241b', '#17130f', '255,180,100');
      shoulders(ctx, p, { collar: '#8a6a4a' });
      // checked shirt collar
      ctx.strokeStyle = 'rgba(210,170,120,.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 50, 290);
        ctx.lineTo(70 + i * 50, 420);
        ctx.stroke();
      }
      // apron
      ctx.fillStyle = '#4b3525';
      ctx.beginPath();
      ctx.moveTo(110, 310);
      ctx.lineTo(230, 310);
      ctx.lineTo(250, 420);
      ctx.lineTo(90, 420);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(235,200,150,.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
      neck(ctx, p);
      headShape(ctx, 170, 164, 64, 76, p);
      // ears
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(105, 168, 9, 14, -0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(235, 168, 9, 14, 0.1, 0, TAU);
      ctx.fill();
      // bald crown + side hair
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.ellipse(170, 116, 58, 32, 0, Math.PI, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(112, 162, 10, 26, 0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(228, 162, 10, 26, -0.1, 0, TAU);
      ctx.fill();
      // sideburns
      ctx.fillStyle = p.hairLight;
      ctx.beginPath();
      ctx.ellipse(115, 185, 6, 13, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(225, 185, 6, 13, 0, 0, TAU);
      ctx.fill();
      // brows bushy
      brow(ctx, 130, 144, 158, 142, 'rgba(100,92,82,.9)', 4.2);
      brow(ctx, 182, 142, 210, 144, 'rgba(100,92,82,.9)', 4.2);
      // eyes
      eye(ctx, 146, 163, 10.5, 6.5, '#6e5841', { look: 0 });
      eye(ctx, 194, 163, 10.5, 6.5, '#6e5841', { look: 0 });
      // smile lines
      ctx.strokeStyle = 'rgba(120,75,48,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(134, 184);
      ctx.quadraticCurveTo(128, 196, 134, 206);
      ctx.moveTo(206, 184);
      ctx.quadraticCurveTo(212, 196, 206, 206);
      ctx.stroke();
      nose(ctx, 170, 180, 26, 32, p.skinShade);
      // mustache
      ctx.strokeStyle = '#7d7367';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(146, 202);
      ctx.quadraticCurveTo(158, 198, 170, 203);
      ctx.quadraticCurveTo(182, 198, 194, 202);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(230,220,200,.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(148, 199);
      ctx.quadraticCurveTo(160, 195, 170, 200);
      ctx.stroke();
      lips(ctx, 170, 214, 24, '#7d4f42', { thin: true });
      // glasses
      ctx.strokeStyle = '#c9a45c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(146, 164, 13, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(194, 164, 13, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(159, 164);
      ctx.lineTo(181, 164);
      ctx.moveTo(133, 162);
      ctx.lineTo(118, 159);
      ctx.moveTo(207, 162);
      ctx.lineTo(222, 159);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,245,220,.08)';
      ctx.beginPath();
      ctx.ellipse(141, 159, 7, 4, -0.4, 0, TAU);
      ctx.fill();
      // magnifier on forehead
      ctx.strokeStyle = '#b98d55';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(210, 100, 12, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(180,200,200,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(210, 100, 9, 0, TAU);
      ctx.stroke();
    } else if (id === 'wren') {
      backdrop(ctx, '#26301f', '#121a12', '240,200,110');
      shoulders(ctx, p, { collar: '#d9c69c' });
      // raincoat collar
      ctx.fillStyle = p.coatShade;
      ctx.beginPath();
      ctx.moveTo(120, 278);
      ctx.lineTo(170, 322);
      ctx.lineTo(220, 278);
      ctx.lineTo(236, 300);
      ctx.lineTo(170, 342);
      ctx.lineTo(104, 300);
      ctx.closePath();
      ctx.fill();
      // yellow scarf
      ctx.fillStyle = p.scarf;
      ctx.beginPath();
      ctx.moveTo(136, 286);
      ctx.quadraticCurveTo(170, 310, 204, 286);
      ctx.lineTo(212, 310);
      ctx.quadraticCurveTo(170, 336, 128, 310);
      ctx.closePath();
      ctx.fill();
      neck(ctx, p);
      // hair back
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.ellipse(170, 148, 74, 88, 0, 0, TAU);
      ctx.fill();
      headShape(ctx, 170, 166, 58, 72, p);
      // ears
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(113, 170, 8, 13, -0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(227, 170, 8, 13, 0.1, 0, TAU);
      ctx.fill();
      // hair front, side part
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.moveTo(114, 150);
      ctx.bezierCurveTo(114, 96, 150, 82, 178, 84);
      ctx.bezierCurveTo(214, 82, 228, 108, 226, 148);
      ctx.bezierCurveTo(214, 124, 200, 114, 182, 116);
      ctx.bezierCurveTo(160, 106, 138, 112, 128, 140);
      ctx.closePath();
      ctx.fill();
      // braid
      ctx.strokeStyle = p.hair;
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(226, 180);
      ctx.bezierCurveTo(250, 230, 232, 290, 242, 360);
      ctx.stroke();
      ctx.strokeStyle = p.hairLight;
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(232 + (i % 2) * 6, 200 + i * 22);
        ctx.lineTo(238 + (i % 2) * 6, 212 + i * 22);
        ctx.stroke();
      }
      // brows
      brow(ctx, 136, 150, 158, 147, 'rgba(95,55,36,.8)', 2.6);
      brow(ctx, 182, 146, 204, 148, 'rgba(95,55,36,.8)', 2.6);
      // eyes
      eye(ctx, 147, 164, 10.5, 6.8, '#6d6a3f', { look: 1 });
      eye(ctx, 193, 164, 10.5, 6.8, '#6d6a3f', { look: 1 });
      // laugh lines
      ctx.strokeStyle = 'rgba(130,80,55,.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(133, 180);
      ctx.quadraticCurveTo(126, 192, 132, 202);
      ctx.moveTo(207, 180);
      ctx.quadraticCurveTo(214, 192, 208, 202);
      ctx.stroke();
      nose(ctx, 170, 180, 24, 30, p.skinShade);
      lips(ctx, 170, 208, 28, '#8c4f42', { smile: true });
      // freckles
      ctx.fillStyle = 'rgba(110,60,40,.4)';
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(146 + (i % 5) * 6, 184 + Math.floor(i / 5) * 5, 1, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(176 + (i % 4) * 6, 184 + Math.floor(i / 4) * 5, 1, 0, TAU);
        ctx.fill();
      }
      // earrings
      ctx.strokeStyle = '#c9a45c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(109, 183, 5, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(231, 183, 5, 0, TAU);
      ctx.stroke();
    } else if (id === 'elias') {
      backdrop(ctx, '#2a2923', '#151513', '210,180,130');
      // desaturate look via sepia overlay later
      shoulders(ctx, p, { collar: '#d8ccb6' });
      // shirt
      ctx.fillStyle = '#cfc3ac';
      ctx.beginPath();
      ctx.moveTo(136, 278);
      ctx.lineTo(170, 330);
      ctx.lineTo(204, 278);
      ctx.lineTo(212, 420);
      ctx.lineTo(128, 420);
      ctx.closePath();
      ctx.fill();
      // suspenders
      ctx.strokeStyle = '#5a4a38';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(144, 300);
      ctx.lineTo(138, 420);
      ctx.moveTo(196, 300);
      ctx.lineTo(202, 420);
      ctx.stroke();
      // tie
      ctx.fillStyle = '#6d5a44';
      ctx.beginPath();
      ctx.moveTo(170, 320);
      ctx.lineTo(162, 344);
      ctx.lineTo(170, 380);
      ctx.lineTo(178, 344);
      ctx.closePath();
      ctx.fill();
      neck(ctx, p);
      headShape(ctx, 170, 164, 57, 72, p);
      // ears
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(113, 168, 7, 12, -0.1, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(227, 168, 7, 12, 0.1, 0, TAU);
      ctx.fill();
      // hair side part
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.moveTo(114, 146);
      ctx.bezierCurveTo(116, 92, 152, 80, 180, 84);
      ctx.bezierCurveTo(214, 82, 226, 106, 226, 146);
      ctx.bezierCurveTo(214, 122, 202, 112, 186, 114);
      ctx.bezierCurveTo(170, 100, 144, 108, 132, 134);
      ctx.closePath();
      ctx.fill();
      // brows
      brow(ctx, 136, 150, 158, 148, 'rgba(55,42,32,.75)', 2.4);
      brow(ctx, 182, 148, 204, 150, 'rgba(55,42,32,.75)', 2.4);
      // eyes
      eye(ctx, 147, 165, 10, 6.5, '#5b4a38', { look: 0 });
      eye(ctx, 193, 165, 10, 6.5, '#5b4a38', { look: 0 });
      nose(ctx, 170, 181, 22, 30, p.skinShade);
      lips(ctx, 170, 209, 24, '#7a5447', { smile: true });
      // soft sadness
      ctx.strokeStyle = 'rgba(90,70,50,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(136, 157);
      ctx.quadraticCurveTo(147, 153, 158, 156);
      ctx.moveTo(182, 156);
      ctx.quadraticCurveTo(193, 153, 204, 157);
      ctx.stroke();
    }
    // grain + vignette
    A.grain(ctx, 0, 0, 340, 420, 0.1, 7);
    const v = ctx.createRadialGradient(170, 190, 100, 170, 200, 330);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(3,6,6,.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 340, 420);
    // sepia for Elias
    if (id === 'elias') {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(160,125,80,.35)';
      ctx.fillRect(0, 0, 340, 420);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  };
})();
