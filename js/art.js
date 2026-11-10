/* ============================================================
   THE LITTLE THINGS — painting engine: tools & objects
   ============================================================ */
(function () {
  const LT = (window.LT = window.LT || {});
  const U = LT.util;
  const A = (LT.art = {});
  const TAU = Math.PI * 2;

  function hex(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgba(c, a) {
    if (c.startsWith('rgb')) return c.replace(/rgba?\(([^)]+)\)/, (m, p) => `rgba(${p},${a})`);
    const [r, g, b] = hex(c);
    return `rgba(${r},${g},${b},${a})`;
  }
  A.rgba = rgba;
  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  A.rr = rr;
  function grad(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    return g;
  }
  A.grad = grad;
  function rgrad(ctx, x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    return g;
  }
  A.rgrad = rgrad;
  function blob(ctx, x, y, rx, ry, color, alpha, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(0.6, rgba(color, alpha * 0.55));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  A.blob = blob;
  function grain(ctx, x, y, w, h, alpha, seed) {
    let s = seed || 1;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    const count = Math.min(9000, Math.floor((w * h) / 380));
    ctx.save();
    for (let i = 0; i < count; i++) {
      const px = x + rnd() * w;
      const py = y + rnd() * h;
      const a = rnd() * alpha;
      ctx.fillStyle = rnd() > 0.5 ? `rgba(255,240,215,${a})` : `rgba(20,14,8,${a * 1.2})`;
      const sz = rnd() > 0.92 ? 1.8 : 0.8;
      ctx.fillRect(px, py, sz, sz);
    }
    ctx.restore();
  }
  A.grain = grain;
  function stroke(ctx, x1, y1, x2, y2, width, color, alpha) {
    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  A.stroke = stroke;
  function vine(ctx, x, y, s, color, alpha) {
    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = 1.1 * s;
    ctx.beginPath();
    ctx.moveTo(x, y + 12 * s);
    ctx.bezierCurveTo(x - 8 * s, y + 4 * s, x + 7 * s, y - 4 * s, x, y - 13 * s);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const yy = y + 8 * s - i * 8 * s;
      ctx.beginPath();
      ctx.ellipse(x + (i % 2 ? 5 : -5) * s, yy, 4.5 * s, 2 * s, i % 2 ? 0.5 : -0.5, 0, TAU);
      ctx.fillStyle = rgba(color, alpha * 0.7);
      ctx.fill();
    }
    ctx.restore();
  }
  A.vine = vine;

  function brushLine(ctx, pts, width, color, alpha) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
    ctx.restore();
  }
  A.brushLine = brushLine;

  A.makeScene = function (w, h, painter) {
    const { canvas, ctx } = U.makeCanvas(w, h, 1.5);
    ctx.save();
    painter(ctx, w, h);
    ctx.restore();
    return canvas;
  };

  /* ------------------------------------------------------------
     Object framing
     ------------------------------------------------------------ */
  A.objectBox = function (id, W, H) {
    const m = Math.min(W, H);
    const sizes = {
      watch: [m * 0.86, m * 0.86],
      photo: [Math.min(W * 0.82, 660), Math.min(H * 0.78, 520)],
      timetable: [Math.min(W * 0.84, 680), Math.min(H * 0.76, 540)],
      ticket: [Math.min(W * 0.66, 540), Math.min(H * 0.56, 330)],
      letter: [Math.min(W * 0.72, 620), Math.min(H * 0.84, 540)],
      ledger: [Math.min(W * 0.86, 700), Math.min(H * 0.76, 520)],
      bluebird: [Math.min(W * 0.66, 470), Math.min(H * 0.62, 400)],
    };
    const [w, h] = sizes[id] || [m * 0.7, m * 0.7];
    return { x: (W - w) / 2, y: (H - h) / 2, w, h, cx: W / 2, cy: H / 2 };
  };

  /* ------------------------------------------------------------
     Watch
     ------------------------------------------------------------ */
  function drawWatch(ctx, W, H, angle, t) {
    const b = A.objectBox('watch', W, H);
    const cx = b.cx;
    const cy = b.cy + 10;
    const R = b.w * 0.34;
    const flip = Math.cos(angle);
    const front = flip >= 0;
    const sy = 0.12 + 0.88 * Math.abs(flip);

    // shadow
    ctx.save();
    ctx.translate(cx, cy + R * 0.92);
    ctx.scale(1, 0.22);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.4);
    sh.addColorStop(0, 'rgba(0,0,0,.55)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.4, 0, TAU);
    ctx.fill();
    ctx.restore();

    // chain
    ctx.save();
    ctx.strokeStyle = 'rgba(196,154,88,.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + R * 0.1, cy - R * 1.12);
    ctx.bezierCurveTo(cx + R * 1.3, cy - R * 1.4, cx + R * 1.6, cy - R * 0.2, cx + R * 1.42, cy + R * 0.55);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const tt = i / 12;
      const px = cx + R * (0.1 + 1.45 * tt);
      const py = cy - R * 1.12 + Math.sin(tt * Math.PI) * R * 0.5 + tt * R * 1.4;
      ctx.beginPath();
      ctx.ellipse(px, py, 2.4, 3.6, tt * 1.2, 0, TAU);
      ctx.strokeStyle = 'rgba(220,180,110,.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // bow + crown
    ctx.save();
    ctx.translate(cx, cy - R * 1.04 * sy - 4);
    ctx.strokeStyle = '#a47b3e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 4, R * 0.14, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.stroke();
    ctx.fillStyle = grad(ctx, 0, -12, 0, 10, [[0, '#e2bf7e'], [0.5, '#b48945'], [1, '#6f4e24']]);
    rr(ctx, -8, -4, 16, 16, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,180,.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, sy);

    // edge thickness
    if (Math.abs(flip) < 0.45) {
      ctx.fillStyle = '#5d431f';
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.015, R * 0.92, 0, 0, TAU);
      ctx.fill();
    }

    // case outer
    const caseGrad = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.12);
    caseGrad.addColorStop(0, '#f0d29a');
    caseGrad.addColorStop(0.35, '#c9a15c');
    caseGrad.addColorStop(0.72, '#a47a3c');
    caseGrad.addColorStop(1, '#6e4d22');
    ctx.fillStyle = caseGrad;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();

    // bezel rings
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, R * (0.96 - i * 0.025), 0, TAU);
      ctx.strokeStyle = i % 2 ? 'rgba(255,236,192,.3)' : 'rgba(80,55,22,.35)';
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.stroke();
    }

    if (front) {
      // dial
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.84, 0, TAU);
      ctx.clip();
      const dial = ctx.createRadialGradient(-R * 0.2, -R * 0.25, R * 0.05, 0, 0, R * 0.95);
      dial.addColorStop(0, '#fbf3df');
      dial.addColorStop(0.6, '#eee0c3');
      dial.addColorStop(1, '#cdb894');
      ctx.fillStyle = dial;
      ctx.fillRect(-R, -R, R * 2, R * 2);

      // patina
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4;
        blob(ctx, Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.5, R * 0.16, R * 0.1, '#8b6f42', 0.09);
      }

      // minute ticks
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU;
        const inner = i % 5 === 0 ? R * 0.7 : R * 0.755;
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(50,38,24,.75)' : 'rgba(70,54,32,.38)';
        ctx.lineWidth = i % 5 === 0 ? 1.8 : 0.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
        ctx.lineTo(Math.cos(a) * R * 0.79, Math.sin(a) * R * 0.79);
        ctx.stroke();
      }
      // numerals
      ctx.fillStyle = 'rgba(48,36,22,.82)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${Math.round(R * 0.17)}px Cormorant, Georgia, serif`;
      const nums = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
      nums.forEach((n, i) => {
        const a = (i / 12) * TAU - Math.PI / 2;
        ctx.fillText(n, Math.cos(a) * R * 0.59, Math.sin(a) * R * 0.59);
      });
      // brand
      ctx.font = `italic ${Math.round(R * 0.075)}px Cormorant, Georgia, serif`;
      ctx.fillStyle = 'rgba(70,52,30,.62)';
      ctx.fillText('H. FINCH', 0, -R * 0.28);
      ctx.font = `${Math.round(R * 0.05)}px Karla, sans-serif`;
      ctx.fillText('HARROWMERE', 0, -R * 0.19);

      // hands at 8:17
      const hourA = ((8 + 17 / 60) / 12) * TAU - Math.PI / 2;
      const minA = (17 / 60) * TAU - Math.PI / 2;
      ctx.strokeStyle = '#2e2418';
      ctx.lineCap = 'round';
      ctx.lineWidth = R * 0.035;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(hourA) * R * 0.4, Math.sin(hourA) * R * 0.4);
      ctx.stroke();
      ctx.lineWidth = R * 0.024;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(minA) * R * 0.62, Math.sin(minA) * R * 0.62);
      ctx.stroke();
      // seconds at 8:17:40
      const secA = (40 / 60) * TAU - Math.PI / 2;
      ctx.strokeStyle = '#8e4b36';
      ctx.lineWidth = R * 0.011;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(secA) * R * 0.7, Math.sin(secA) * R * 0.7);
      ctx.stroke();
      // pin
      ctx.fillStyle = '#3a2b1a';
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.035, 0, TAU);
      ctx.fill();
      // glass shine
      const gl = ctx.createLinearGradient(-R, -R, R * 0.4, R * 0.4);
      gl.addColorStop(0, 'rgba(255,255,255,.25)');
      gl.addColorStop(0.4, 'rgba(255,255,255,.03)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(-R, -R, R * 2, R * 2);
      ctx.restore();
    } else {
      // back
      const backGrad = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
      backGrad.addColorStop(0, '#e2c184');
      backGrad.addColorStop(0.5, '#bd9453');
      backGrad.addColorStop(1, '#7d5a2a');
      ctx.fillStyle = backGrad;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.84, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, R * (0.2 + i * 0.1), 0, TAU);
        ctx.strokeStyle = `rgba(90,64,28,${0.11 - i * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // engraving
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(74,50,20,.72)';
      ctx.font = `italic ${Math.round(R * 0.14)}px Cormorant, Georgia, serif`;
      ctx.fillText('For June', 0, -R * 0.18);
      ctx.font = `${Math.round(R * 0.12)}px Cormorant, Georgia, serif`;
      ctx.fillText('8 : 17', 0, R * 0.06);
      ctx.font = `italic ${Math.round(R * 0.17)}px Cormorant, Georgia, serif`;
      ctx.fillText('E.', 0, R * 0.3);
      // engraving highlights
      ctx.fillStyle = 'rgba(255,232,180,.18)';
      ctx.fillText('For June', 0.7, -R * 0.18 + 0.7);
      // seam
      ctx.strokeStyle = 'rgba(72,50,22,.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.76, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,232,180,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.745, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
      // hinge
      ctx.fillStyle = 'rgba(100,72,32,.7)';
      rr(ctx, -R * 0.06, -R * 0.86, R * 0.12, R * 0.06, 2);
      ctx.fill();
      // shine
      const gl2 = ctx.createLinearGradient(-R, -R, R * 0.3, R * 0.5);
      gl2.addColorStop(0, 'rgba(255,245,210,.2)');
      gl2.addColorStop(0.45, 'rgba(255,245,210,.02)');
      gl2.addColorStop(1, 'rgba(255,245,210,0)');
      ctx.fillStyle = gl2;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.84, 0, TAU);
      ctx.fill();
    }

    // scratches
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 12; i++) {
      const a = (i * 2.7 + 0.4) % TAU;
      const r1 = R * (0.86 + Math.random() * 0.08);
      ctx.strokeStyle = i % 2 ? '#f6dfb0' : '#5b3f1b';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a + 0.06) * r1 * 1.01, Math.sin(a + 0.06) * r1 * 1.01);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Photograph
     ------------------------------------------------------------ */
  function drawPhoto(ctx, W, H, angle) {
    const b = A.objectBox('photo', W, H);
    const flip = Math.cos(angle);
    const front = flip >= 0;
    const sy = 0.16 + 0.84 * Math.abs(flip);
    ctx.save();
    ctx.translate(b.cx, b.cy + b.h * 0.02);
    ctx.rotate(-0.022);
    ctx.scale(1, sy);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    // paper
    ctx.fillStyle = front ? '#e8dcc4' : '#d8c9ab';
    rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 3);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // border inner
    const pad = b.w * 0.055;
    const iw = b.w - pad * 2;
    const ih = b.h - pad * 2.35;
    if (front) {
      // sepia image
      ctx.save();
      rr(ctx, -iw / 2, -b.h / 2 + pad, iw, ih, 1);
      ctx.clip();
      const g = ctx.createLinearGradient(0, -b.h / 2, 0, -b.h / 2 + ih);
      g.addColorStop(0, '#a99a7d');
      g.addColorStop(0.45, '#c3b393');
      g.addColorStop(1, '#8d7c62');
      ctx.fillStyle = g;
      ctx.fillRect(-iw / 2, -b.h / 2, iw, ih);
      // sky / station
      ctx.fillStyle = 'rgba(235,222,197,.35)';
      ctx.fillRect(-iw / 2, -b.h / 2, iw, ih * 0.35);
      ctx.fillStyle = 'rgba(84,70,52,.55)';
      ctx.fillRect(-iw / 2, -b.h / 2 + ih * 0.3, iw, 5);
      // roof
      ctx.fillStyle = 'rgba(61,51,38,.62)';
      ctx.beginPath();
      ctx.moveTo(-iw / 2, -b.h / 2 + ih * 0.28);
      ctx.lineTo(-iw * 0.2, -b.h / 2 + ih * 0.16);
      ctx.lineTo(iw * 0.42, -b.h / 2 + ih * 0.16);
      ctx.lineTo(iw / 2, -b.h / 2 + ih * 0.28);
      ctx.lineTo(iw / 2, -b.h / 2 + ih * 0.34);
      ctx.lineTo(-iw / 2, -b.h / 2 + ih * 0.34);
      ctx.fill();
      // station sign
      ctx.fillStyle = 'rgba(236,224,198,.72)';
      rr(ctx, iw * 0.2, -b.h / 2 + ih * 0.2, iw * 0.25, ih * 0.055, 1);
      ctx.fill();
      ctx.fillStyle = 'rgba(60,50,36,.75)';
      ctx.font = `${Math.round(ih * 0.035)}px Karla, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('HARROWMERE', iw * 0.325, -b.h / 2 + ih * 0.24);
      // ground
      ctx.fillStyle = 'rgba(91,79,60,.55)';
      ctx.fillRect(-iw / 2, -b.h / 2 + ih * 0.68, iw, ih * 0.32);
      // figures
      drawPhotoPerson(ctx, -iw * 0.15, -b.h / 2 + ih * 0.34, ih * 0.32, 'elias', ih);
      drawPhotoPerson(ctx, iw * 0.14, -b.h / 2 + ih * 0.33, ih * 0.31, 'june', ih);
      // grain
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#2e261a';
        ctx.fillRect(-iw / 2 + Math.random() * iw, -b.h / 2 + pad + Math.random() * ih, 1, 1);
      }
      ctx.globalAlpha = 1;
      // vignette
      const vg = ctx.createRadialGradient(0, -b.h / 2 + ih * 0.45, ih * 0.1, 0, -b.h / 2 + ih * 0.45, ih * 0.8);
      vg.addColorStop(0, 'rgba(40,30,18,0)');
      vg.addColorStop(1, 'rgba(40,30,18,.4)');
      ctx.fillStyle = vg;
      ctx.fillRect(-iw / 2, -b.h / 2, iw, ih);
      ctx.restore();
      // pencil note on front bottom border
      ctx.fillStyle = 'rgba(70,55,36,.55)';
      ctx.font = `italic ${Math.round(b.h * 0.04)}px Cormorant, Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Harrowmere, September 1962', 0, b.h / 2 - pad * 0.55);
    } else {
      // back of photo
      const g = ctx.createLinearGradient(-b.w / 2, -b.h / 2, b.w / 2, b.h / 2);
      g.addColorStop(0, '#e0d2b5');
      g.addColorStop(0.5, '#cdbb99');
      g.addColorStop(1, '#ddcfb0');
      ctx.fillStyle = g;
      rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 3);
      ctx.fill();
      // stains
      blob(ctx, -b.w * 0.25, b.h * 0.2, b.w * 0.22, b.h * 0.16, '#8a6f45', 0.1);
      blob(ctx, b.w * 0.3, -b.h * 0.25, b.w * 0.2, b.h * 0.15, '#8a6f45', 0.08);
      // pencil writing
      ctx.save();
      ctx.rotate(-0.035);
      ctx.fillStyle = 'rgba(66,53,37,.72)';
      ctx.textAlign = 'center';
      ctx.font = `italic ${Math.round(b.h * 0.075)}px Cormorant, Georgia, serif`;
      ctx.fillText('The 8:17 — don’t be late.', 0, -b.h * 0.12);
      ctx.fillText('J. Sept ’62', 0, b.h * 0.02);
      ctx.font = `italic ${Math.round(b.h * 0.05)}px Cormorant, Georgia, serif`;
      ctx.fillStyle = 'rgba(66,53,37,.45)';
      ctx.fillText('for E.', 0, b.h * 0.2);
      ctx.restore();
      // creases
      ctx.strokeStyle = 'rgba(92,74,48,.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-b.w * 0.42, -b.h * 0.4);
      ctx.lineTo(-b.w * 0.36, b.h * 0.42);
      ctx.moveTo(b.w * 0.4, -b.h * 0.35);
      ctx.lineTo(b.w * 0.34, b.h * 0.4);
      ctx.stroke();
    }
    // paper wear
    ctx.strokeStyle = 'rgba(90,70,42,.2)';
    ctx.lineWidth = 1;
    rr(ctx, -b.w / 2 + 1, -b.h / 2 + 1, b.w - 2, b.h - 2, 3);
    ctx.stroke();
    // corner wear
    ctx.fillStyle = 'rgba(239,231,211,.8)';
    ctx.beginPath();
    ctx.moveTo(b.w / 2 - b.w * 0.1, -b.h / 2);
    ctx.lineTo(b.w / 2, -b.h / 2);
    ctx.lineTo(b.w / 2, -b.h / 2 + b.h * 0.07);
    ctx.fill();
    ctx.restore();
  }

  function drawPhotoPerson(ctx, x, y, h, who, ih) {
    const w = h * 0.36;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = who === 'elias' ? 'rgba(62,52,38,.88)' : 'rgba(72,56,42,.88)';
    // legs
    ctx.fillRect(-w * 0.32, h * 0.48, w * 0.24, h * 0.52);
    ctx.fillRect(w * 0.08, h * 0.48, w * 0.24, h * 0.52);
    // body
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 0.12);
    ctx.quadraticCurveTo(-w * 0.42, h * 0.48, -w * 0.34, h * 0.56);
    ctx.lineTo(w * 0.34, h * 0.56);
    ctx.quadraticCurveTo(w * 0.42, h * 0.48, w * 0.5, h * 0.12);
    ctx.quadraticCurveTo(0, h * 0.02, -w * 0.5, h * 0.12);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(0, -h * 0.03, w * 0.3, 0, TAU);
    ctx.fill();
    if (who === 'june') {
      // coat skirt + hat
      ctx.beginPath();
      ctx.moveTo(-w * 0.34, h * 0.5);
      ctx.lineTo(-w * 0.5, h * 0.95);
      ctx.lineTo(w * 0.5, h * 0.95);
      ctx.lineTo(w * 0.34, h * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.11, w * 0.46, h * 0.035, 0, 0, TAU);
      ctx.fill();
    } else {
      // suspenders
      ctx.strokeStyle = 'rgba(210,196,168,.55)';
      ctx.lineWidth = Math.max(1, w * 0.05);
      ctx.beginPath();
      ctx.moveTo(-w * 0.2, h * 0.12);
      ctx.lineTo(-w * 0.1, h * 0.5);
      ctx.moveTo(w * 0.2, h * 0.12);
      ctx.lineTo(w * 0.1, h * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Timetable
     ------------------------------------------------------------ */
  function drawTimetable(ctx, W, H) {
    const b = A.objectBox('timetable', W, H);
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(-0.012);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    // frame
    ctx.fillStyle = '#4c3a25';
    rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 4);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#6b5234';
    rr(ctx, -b.w / 2 + 3, -b.h / 2 + 3, b.w - 6, b.h - 6, 3);
    ctx.fill();
    // paper
    const pad = b.w * 0.055;
    const px = -b.w / 2 + pad;
    const py = -b.h / 2 + pad;
    const pw = b.w - pad * 2;
    const ph = b.h - pad * 2;
    ctx.fillStyle = '#e7d9bc';
    ctx.fillRect(px, py, pw, ph);
    // aging
    const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, 'rgba(120,90,48,.18)');
    g.addColorStop(0.35, 'rgba(255,250,235,.08)');
    g.addColorStop(1, 'rgba(120,90,48,.22)');
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    // header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a3a25';
    ctx.font = `600 ${Math.round(ph * 0.048)}px Karla, sans-serif`;
    ctx.fillText('HARROWMERE STATION', 0, py + ph * 0.12);
    ctx.font = `italic ${Math.round(ph * 0.04)}px Cormorant, Georgia, serif`;
    ctx.fillStyle = 'rgba(74,58,37,.7)';
    ctx.fillText('Evening departures · platform two', 0, py + ph * 0.175);
    // rules
    ctx.strokeStyle = 'rgba(74,58,37,.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.08, py + ph * 0.21);
    ctx.lineTo(px + pw * 0.92, py + ph * 0.21);
    ctx.stroke();
    // rows
    const rows = [
      ['6:02', 'Ashcombe', '2'],
      ['6:40', 'Marlowe', '1'],
      ['7:15', 'Ashcombe', '2'],
      ['8:17', 'Ashcombe', '2'],
      ['9:04', 'Wrenfield', '1'],
      ['10:22', 'Ashcombe', '2'],
    ];
    const startY = py + ph * 0.29;
    rows.forEach((r, i) => {
      const y = startY + i * ph * 0.085;
      ctx.textAlign = 'left';
      ctx.font = `${Math.round(ph * 0.045)}px Cormorant, Georgia, serif`;
      ctx.fillStyle = i === 3 ? 'rgba(60,45,28,.95)' : 'rgba(60,45,28,.68)';
      ctx.fillText(r[0], px + pw * 0.14, y);
      ctx.fillText(r[1], px + pw * 0.33, y);
      ctx.textAlign = 'right';
      ctx.fillText(r[2], px + pw * 0.82, y);
      if (i === 3) {
        ctx.strokeStyle = 'rgba(150,54,42,.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + pw * 0.12, y + ph * 0.014);
        ctx.lineTo(px + pw * 0.84, y + ph * 0.014);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(150,54,42,.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + pw * 0.12, y + ph * 0.024);
        ctx.lineTo(px + pw * 0.84, y + ph * 0.024);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(74,58,37,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.1, y + ph * 0.025);
      ctx.lineTo(px + pw * 0.9, y + ph * 0.025);
      ctx.stroke();
    });
    // footer
    ctx.textAlign = 'center';
    ctx.font = `italic ${Math.round(ph * 0.032)}px Cormorant, Georgia, serif`;
    ctx.fillStyle = 'rgba(74,58,37,.6)';
    ctx.fillText('Last 8:17 service: October 1963. The line closed the following spring.', 0, py + ph * 0.88);
    // margin note
    ctx.save();
    ctx.rotate(-0.04);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(44,70,110,.65)';
    ctx.font = `italic ${Math.round(ph * 0.045)}px Cormorant, Georgia, serif`;
    ctx.fillText('E.V. — platform 2.', px + pw * 0.57, py + ph * 0.27);
    ctx.fillText('Don’t let him forget.', px + pw * 0.6, py + ph * 0.325);
    ctx.restore();
    // glass shine
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sh = ctx.createLinearGradient(px, py, px + pw, py + ph);
    sh.addColorStop(0, 'rgba(255,255,255,.12)');
    sh.addColorStop(0.35, 'rgba(255,255,255,.02)');
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Ticket
     ------------------------------------------------------------ */
  function drawTicket(ctx, W, H) {
    const b = A.objectBox('ticket', W, H);
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(-0.06);
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#9daf8e';
    rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 5);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(-b.w / 2, -b.h / 2, b.w / 2, b.h / 2);
    g.addColorStop(0, '#b7c6a4');
    g.addColorStop(0.45, '#9aad8b');
    g.addColorStop(1, '#829774');
    ctx.fillStyle = g;
    rr(ctx, -b.w / 2 + 3, -b.h / 2 + 3, b.w - 6, b.h - 6, 4);
    ctx.fill();
    // border
    ctx.strokeStyle = 'rgba(50,68,42,.5)';
    ctx.lineWidth = 1.2;
    rr(ctx, -b.w / 2 + 12, -b.h / 2 + 12, b.w - 24, b.h - 24, 2);
    ctx.stroke();
    // text
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(40,56,34,.82)';
    ctx.font = `600 ${Math.round(b.h * 0.085)}px Karla, sans-serif`;
    ctx.fillText('HARROWMERE', 0, -b.h * 0.22);
    ctx.font = `${Math.round(b.h * 0.06)}px Karla, sans-serif`;
    ctx.fillText('PLATFORM TICKET', 0, -b.h * 0.1);
    ctx.font = `italic ${Math.round(b.h * 0.11)}px Cormorant, Georgia, serif`;
    ctx.fillText('Platform 2', 0, b.h * 0.07);
    ctx.font = `${Math.round(b.h * 0.055)}px Karla, sans-serif`;
    ctx.fillText('14 SEP 1962', 0, b.h * 0.23);
    ctx.font = `${Math.round(b.h * 0.04)}px Karla, sans-serif`;
    ctx.fillStyle = 'rgba(40,56,34,.55)';
    ctx.fillText('NOT TRANSFERABLE', 0, b.h * 0.34);
    // punch hole
    ctx.fillStyle = '#28331f';
    ctx.beginPath();
    ctx.arc(-b.w * 0.26, -b.h * 0.2, b.h * 0.045, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,240,220,.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-b.w * 0.26, -b.h * 0.2, b.h * 0.055, 0, TAU);
    ctx.stroke();
    // crease
    ctx.strokeStyle = 'rgba(235,242,222,.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-b.w * 0.02, -b.h / 2 + 6);
    ctx.lineTo(-b.w * 0.06, b.h / 2 - 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(40,56,34,.16)';
    ctx.beginPath();
    ctx.moveTo(-b.w * 0.03, -b.h / 2 + 6);
    ctx.lineTo(-b.w * 0.07, b.h / 2 - 6);
    ctx.stroke();
    // worn edges
    ctx.fillStyle = 'rgba(225,234,210,.5)';
    ctx.beginPath();
    ctx.moveTo(b.w / 2 - b.w * 0.09, b.h / 2);
    ctx.lineTo(b.w / 2, b.h / 2);
    ctx.lineTo(b.w / 2, b.h / 2 - b.h * 0.12);
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Letter
     ------------------------------------------------------------ */
  function drawLetter(ctx, W, H) {
    const b = A.objectBox('letter', W, H);
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(-0.014);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#e7d8bb';
    rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // paper tone
    const g = ctx.createLinearGradient(-b.w / 2, -b.h / 2, b.w / 2, b.h / 2);
    g.addColorStop(0, 'rgba(150,120,72,.2)');
    g.addColorStop(0.4, 'rgba(255,250,235,.15)');
    g.addColorStop(1, 'rgba(150,120,72,.24)');
    ctx.fillStyle = g;
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    // folds
    const folds = [-b.h * 0.3, 0, b.h * 0.3];
    folds.forEach((fy) => {
      ctx.strokeStyle = 'rgba(120,96,58,.18)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-b.w / 2 + 8, fy);
      ctx.lineTo(b.w / 2 - 8, fy + 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,250,238,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-b.w / 2 + 8, fy + 2);
      ctx.lineTo(b.w / 2 - 8, fy + 4);
      ctx.stroke();
    });
    // handwriting
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(58,48,35,.82)';
    const left = -b.w * 0.37;
    const top = -b.h * 0.35;
    const lh = b.h * 0.052;
    ctx.font = `italic ${Math.round(b.h * 0.055)}px Cormorant, Georgia, serif`;
    ctx.fillText('Dear June,', left, top);
    ctx.font = `italic ${Math.round(b.h * 0.043)}px Cormorant, Georgia, serif`;
    const lines = [
      'I have started this letter eleven times.',
      'My father is ill. The doctor says weeks,',
      'then says months, then stops saying anything',
      'at all. I could not leave him, and I could not',
      'ask you to stay. I got as far as the bridge',
      'and turned back. I heard the 8:17 go.',
      '',
      'I am sorry I was not braver.',
      'I will not send this. I think you will hate me',
      'less if I am only a person who didn’t come.',
    ];
    lines.forEach((line, i) => {
      if (!line) return;
      ctx.fillStyle = `rgba(58,48,35,${0.82 - i * 0.012})`;
      ctx.fillText(line, left, top + lh * (i + 1.4));
    });
    // signature
    ctx.font = `italic ${Math.round(b.h * 0.075)}px Cormorant, Georgia, serif`;
    ctx.fillStyle = 'rgba(58,48,35,.86)';
    ctx.fillText('Elias', -b.w * 0.22, b.h * 0.33);
    ctx.font = `${Math.round(b.h * 0.035)}px Cormorant, Georgia, serif`;
    ctx.fillStyle = 'rgba(58,48,35,.6)';
    ctx.fillText('14 September 1962', -b.w * 0.22, b.h * 0.38);
    // cornflower
    drawCornflower(ctx, b.w * 0.27, -b.h * 0.28, b.h * 0.09, 0.8);
    // worn edges
    ctx.strokeStyle = 'rgba(120,96,58,.18)';
    ctx.lineWidth = 1;
    rr(ctx, -b.w / 2 + 2, -b.h / 2 + 2, b.w - 4, b.h - 4, 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCornflower(ctx, x, y, r, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.2);
    ctx.globalAlpha = alpha;
    // stem
    ctx.strokeStyle = 'rgba(70,90,74,.65)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.4);
    ctx.quadraticCurveTo(r * 0.4, r * 0.4, 0, -r * 0.2);
    ctx.stroke();
    // leaves
    ctx.fillStyle = 'rgba(74,92,68,.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, r * 0.7, r * 0.42, r * 0.1, -0.7, 0, TAU);
    ctx.fill();
    // petals
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.fillStyle = i % 2 ? 'rgba(74,104,168,.62)' : 'rgba(96,126,186,.7)';
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.36, r * 0.14, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(46,58,92,.8)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  A.drawCornflower = drawCornflower;

  /* ------------------------------------------------------------
     Ledger
     ------------------------------------------------------------ */
  function drawLedger(ctx, W, H) {
    const b = A.objectBox('ledger', W, H);
    ctx.save();
    ctx.translate(b.cx, b.cy);
    ctx.rotate(-0.01);
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    // leather
    ctx.fillStyle = '#4a2f20';
    rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 6);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // pages
    const pw = b.w * 0.46;
    const ph = b.h * 0.84;
    const py = -ph / 2;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = side < 0 ? '#e3d4b6' : '#e8dabd';
      ctx.beginPath();
      ctx.moveTo(0, py + 4);
      ctx.lineTo(side * pw, py);
      ctx.lineTo(side * pw, py + ph);
      ctx.lineTo(0, py + ph - 4);
      ctx.closePath();
      ctx.fill();
      // page edge
      ctx.fillStyle = 'rgba(255,250,235,.4)';
      ctx.beginPath();
      ctx.moveTo(0, py + 4);
      ctx.lineTo(0, py + ph - 4);
      ctx.lineTo(side * 4, py + ph - 4);
      ctx.lineTo(side * 4, py + 4);
      ctx.closePath();
      ctx.fill();
      // ruled lines
      ctx.strokeStyle = 'rgba(90,70,44,.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 9; i++) {
        const y = py + ph * 0.18 + i * ph * 0.075;
        ctx.beginPath();
        ctx.moveTo(side * pw * 0.08, y);
        ctx.lineTo(side * pw * 0.92, y);
        ctx.stroke();
      }
    }
    // spine
    ctx.fillStyle = 'rgba(80,52,34,.7)';
    ctx.fillRect(-4, py, 8, ph);
    // left page entries
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(62,50,34,.72)';
    ctx.font = `italic ${Math.round(ph * 0.045)}px Cormorant, Georgia, serif`;
    ctx.fillText('Marchetti & Son', -pw * 0.82, py + ph * 0.1);
    ctx.font = `${Math.round(ph * 0.032)}px Karla, sans-serif`;
    ctx.fillText('REPAIRS · 1963—1989', -pw * 0.82, py + ph * 0.14);
    ctx.font = `italic ${Math.round(ph * 0.04)}px Cormorant, Georgia, serif`;
    const entries = [
      '1964   E. Voss — clean & oil.',
      '1969   E. Voss — do not reset hands.',
      '1977   E. Voss — new crystal. time as before.',
      '1989   E. Voss — clean & oil. paid.',
    ];
    entries.forEach((e, i) => {
      ctx.fillStyle = i === 1 ? 'rgba(62,50,34,.92)' : 'rgba(62,50,34,.6)';
      ctx.fillText(e, -pw * 0.86, py + ph * 0.26 + i * ph * 0.075);
    });
    ctx.restore();
    // right page: big entry + margin note
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(62,50,34,.8)';
    ctx.font = `italic ${Math.round(ph * 0.055)}px Cormorant, Georgia, serif`;
    ctx.fillText('E. Voss', pw * 0.12, py + ph * 0.25);
    ctx.font = `italic ${Math.round(ph * 0.04)}px Cormorant, Georgia, serif`;
    ctx.fillText('clean and oil.', pw * 0.12, py + ph * 0.32);
    ctx.fillStyle = 'rgba(62,50,34,.9)';
    ctx.fillText('Do not reset hands.', pw * 0.12, py + ph * 0.39);
    ctx.strokeStyle = 'rgba(62,50,34,.3)';
    ctx.beginPath();
    ctx.moveTo(pw * 0.12, py + ph * 0.42);
    ctx.lineTo(pw * 0.86, py + ph * 0.42);
    ctx.stroke();
    ctx.save();
    ctx.rotate(0.05);
    ctx.fillStyle = 'rgba(70,55,36,.55)';
    ctx.font = `italic ${Math.round(ph * 0.032)}px Cormorant, Georgia, serif`;
    ctx.fillText('Says it keeps good time.', pw * 0.16, py + ph * 0.55);
    ctx.fillText('It doesn’t. He pays anyway.', pw * 0.16, py + ph * 0.6);
    ctx.restore();
    ctx.restore();
    // ribbon
    ctx.strokeStyle = 'rgba(126,58,48,.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pw * 0.86, py + ph * 0.1);
    ctx.lineTo(pw * 0.9, py + ph * 0.95);
    ctx.stroke();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Bluebird
     ------------------------------------------------------------ */
  function drawBluebird(ctx, W, H) {
    const b = A.objectBox('bluebird', W, H);
    ctx.save();
    ctx.translate(b.cx, b.cy);
    // wooden block
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#5b432b';
    rr(ctx, -b.w * 0.3, b.h * 0.26, b.w * 0.6, b.h * 0.1, 3);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // body
    const g = ctx.createLinearGradient(-b.w * 0.2, -b.h * 0.2, b.w * 0.2, b.h * 0.2);
    g.addColorStop(0, '#7f9fc4');
    g.addColorStop(0.45, '#4f7099');
    g.addColorStop(1, '#334e72');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, b.h * 0.05, b.w * 0.23, b.h * 0.17, -0.1, 0, TAU);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(b.w * 0.15, -b.h * 0.12, b.w * 0.1, 0, TAU);
    ctx.fill();
    // tail
    ctx.beginPath();
    ctx.moveTo(-b.w * 0.2, b.h * 0.06);
    ctx.lineTo(-b.w * 0.38, b.h * 0.02);
    ctx.lineTo(-b.w * 0.34, b.h * 0.16);
    ctx.closePath();
    ctx.fill();
    // wing
    ctx.fillStyle = 'rgba(38,62,92,.8)';
    ctx.beginPath();
    ctx.ellipse(-b.w * 0.02, b.h * 0.06, b.w * 0.12, b.h * 0.11, 0.4, 0, TAU);
    ctx.fill();
    // chip
    ctx.fillStyle = 'rgba(20,30,42,.9)';
    ctx.beginPath();
    ctx.moveTo(b.w * 0.04, -b.h * 0.02);
    ctx.lineTo(b.w * 0.09, b.h * 0.01);
    ctx.lineTo(b.w * 0.04, b.h * 0.05);
    ctx.closePath();
    ctx.fill();
    // eye + beak
    ctx.fillStyle = 'rgba(15,20,26,.9)';
    ctx.beginPath();
    ctx.arc(b.w * 0.18, -b.h * 0.14, 2.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#c9a45c';
    ctx.beginPath();
    ctx.moveTo(b.w * 0.24, -b.h * 0.12);
    ctx.lineTo(b.w * 0.31, -b.h * 0.09);
    ctx.lineTo(b.w * 0.24, -b.h * 0.07);
    ctx.closePath();
    ctx.fill();
    // highlight
    ctx.fillStyle = 'rgba(200,225,245,.25)';
    ctx.beginPath();
    ctx.ellipse(-b.w * 0.06, -b.h * 0.02, b.w * 0.09, b.h * 0.04, -0.4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     Object dispatcher + icons
     ------------------------------------------------------------ */
  A.drawObject = function (ctx, id, W, H, opts) {
    const angle = (opts && opts.angle) || 0;
    const t = (opts && opts.t) || 0;
    // cloth backdrop
    if (!opts || !opts.icon) {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 10, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      g.addColorStop(0, 'rgba(62,72,66,.6)');
      g.addColorStop(0.55, 'rgba(27,36,34,.9)');
      g.addColorStop(1, 'rgba(12,18,17,1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // folds
      for (let i = 0; i < 5; i++) {
        const x = W * (0.12 + i * 0.19);
        ctx.strokeStyle = 'rgba(255,240,210,.025)';
        ctx.lineWidth = 24;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.quadraticCurveTo(x + 40, H * 0.5, x - 20, H);
        ctx.stroke();
      }
      // pool of light
      const pool = ctx.createRadialGradient(W * 0.5, H * 0.45, 10, W * 0.5, H * 0.5, Math.min(W, H) * 0.55);
      pool.addColorStop(0, 'rgba(255,220,160,.13)');
      pool.addColorStop(0.6, 'rgba(255,200,130,.04)');
      pool.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, W, H);
    }
    switch (id) {
      case 'watch':
        drawWatch(ctx, W, H, angle, t);
        break;
      case 'photo':
        drawPhoto(ctx, W, H, angle);
        break;
      case 'timetable':
        drawTimetable(ctx, W, H);
        break;
      case 'ticket':
        drawTicket(ctx, W, H);
        break;
      case 'letter':
        drawLetter(ctx, W, H);
        break;
      case 'ledger':
        drawLedger(ctx, W, H);
        break;
      case 'bluebird':
        drawBluebird(ctx, W, H);
        break;
    }
  };

  const iconCache = {};
  A.icon = function (id, size) {
    const key = id + ':' + size;
    if (iconCache[key]) return iconCache[key];
    const { canvas, ctx } = U.makeCanvas(size, size, 1);
    ctx.clearRect(0, 0, size, size);
    // scale object into square
    ctx.save();
    ctx.translate(size * 0.05, size * 0.08);
    A.drawObject(ctx, id, size * 0.9, size * 0.84, { icon: true });
    ctx.restore();
    iconCache[key] = canvas.toDataURL('image/jpeg', 0.9);
    return iconCache[key];
  };

  /* ------------------------------------------------------------
     Dynamic atmosphere helpers (screen space)
     ------------------------------------------------------------ */
  A.rain = function (ctx, w, h, t, intensity, wind) {
    const n = Math.round(intensity * (w / 14));
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const seed = (i * 97.13) % 1;
      const speed = 520 + ((i * 37) % 260);
      const x = ((i * 173.7 + t * (wind || 30)) % (w + 220)) - 110;
      const y = ((i * 311.3 + t * speed) % (h + 160)) - 80;
      const len = 12 + (i % 7) * 3;
      ctx.strokeStyle = `rgba(190,210,220,${0.06 + (i % 5) * 0.018})`;
      ctx.lineWidth = 0.8 + (i % 3) * 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - len * 0.16, y + len);
      ctx.stroke();
    }
    ctx.restore();
  };

  A.dust = function (ctx, w, h, t) {
    ctx.save();
    for (let i = 0; i < 42; i++) {
      const x = (i * 173 + Math.sin(t * 0.2 + i) * 18) % w;
      const y = (i * 97 + Math.cos(t * 0.16 + i * 1.7) * 14) % h;
      const a = 0.05 + (Math.sin(t * 0.7 + i) + 1) * 0.05;
      ctx.fillStyle = `rgba(255,225,170,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.7 + (i % 3) * 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  };

  A.fog = function (ctx, w, h, t) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const x = ((t * (8 + i * 3) + i * 420) % (w + 600)) - 300;
      const y = h * (0.55 + i * 0.07);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 300 + i * 60);
      g.addColorStop(0, 'rgba(170,190,190,.05)');
      g.addColorStop(0.6, 'rgba(170,190,190,.02)');
      g.addColorStop(1, 'rgba(170,190,190,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 420, y - 180, 840, 360);
    }
    ctx.restore();
  };

  A.leaves = function (ctx, w, h, t) {
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const x = ((i * 211 + t * (16 + i * 2)) % (w + 200)) - 100;
      const y = h * 0.35 + ((i * 137 + Math.sin(t * 0.7 + i) * 40) % (h * 0.6));
      const a = 0.2 + (i % 3) * 0.08;
      ctx.fillStyle = i % 2 ? `rgba(190,140,70,${a})` : `rgba(150,120,60,${a})`;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.5 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.2, 1.8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  };

  A.glow = function (ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(0.45, `rgba(${color},${alpha * 0.35})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  A.lights = {
    shop: [
      { x: 620, y: 215, r: 330, c: '255,190,112', a: 0.16, f: 1.1 },
      { x: 1100, y: 195, r: 300, c: '255,184,108', a: 0.14, f: 0.8 },
      { x: 1070, y: 545, r: 200, c: '255,196,120', a: 0.13, f: 1.5 },
      { x: 225, y: 320, r: 220, c: '140,180,200', a: 0.05, f: 0.4 },
    ],
    street: [
      { x: 560, y: 520, r: 260, c: '255,190,110', a: 0.14, f: 0.9 },
      { x: 1190, y: 520, r: 260, c: '255,188,108', a: 0.14, f: 1.2 },
      { x: 900, y: 640, r: 220, c: '255,196,120', a: 0.1, f: 1.4 },
      { x: 160, y: 470, r: 240, c: '255,190,120', a: 0.1, f: 0.7 },
      { x: 1460, y: 470, r: 240, c: '255,186,110', a: 0.12, f: 1.1 },
    ],
    clock: [
      { x: 610, y: 200, r: 320, c: '255,186,108', a: 0.16, f: 0.9 },
      { x: 1030, y: 180, r: 300, c: '255,182,100', a: 0.14, f: 1.3 },
      { x: 1020, y: 580, r: 260, c: '255,198,124', a: 0.15, f: 1.7 },
      { x: 1370, y: 300, r: 220, c: '130,160,170', a: 0.05, f: 0.4 },
    ],
    station: [
      { x: 700, y: 380, r: 300, c: '255,192,120', a: 0.12, f: 1.1 },
      { x: 1200, y: 380, r: 300, c: '255,190,116', a: 0.12, f: 0.8 },
      { x: 870, y: 380, r: 260, c: '255,196,126', a: 0.1, f: 1.4 },
      { x: 1450, y: 470, r: 260, c: '255,190,120', a: 0.1, f: 1.2 },
    ],
  };
})();
