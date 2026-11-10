/* ============================================================
   THE LITTLE THINGS — scenes: Chapel Lane, the clock shop, the station
   ============================================================ */
(function () {
  const LT = (window.LT = window.LT || {});
  const U = LT.util;
  const A = LT.art;
  const TAU = Math.PI * 2;
  const rr = A.rr;
  const rgba = A.rgba;
  const grad = A.grad;
  const blob = A.blob;

  function cobbles(ctx, x, y, w, h, base) {
    for (let row = 0; row < 16; row++) {
      const yy = y + row * 23;
      const off = (row % 2) * 31;
      const scale = 0.7 + row * 0.025;
      for (let i = -1; i < w / 60 + 2; i++) {
        const xx = x + i * 60 * scale + off;
        const tone = base + ((i * 7 + row * 3) % 5) * 4;
        ctx.fillStyle = `rgba(${tone},${tone - 2},${tone - 7},.82)`;
        ctx.beginPath();
        ctx.ellipse(xx, yy, 27 * scale, 9 * scale, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(150,145,130,.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,190,165,.035)';
        ctx.beginPath();
        ctx.ellipse(xx - 5, yy - 3, 12 * scale, 3 * scale, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  function rainStatic(ctx, x, y, w, h, n, alpha) {
    for (let i = 0; i < n; i++) {
      ctx.strokeStyle = `rgba(190,210,220,${alpha + (i % 4) * 0.012})`;
      ctx.lineWidth = 0.7;
      const rx = x + ((i * 47) % w);
      const ry = y + ((i * 83) % h);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 9);
      ctx.stroke();
    }
  }

  function warmWindow(ctx, x, y, w, h, tone) {
    ctx.fillStyle = '#221d17';
    ctx.fillRect(x - 7, y - 7, w + 14, h + 14);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (tone === 'warm') {
      g.addColorStop(0, '#e7b26d');
      g.addColorStop(0.5, '#b87c40');
      g.addColorStop(1, '#5e3b20');
    } else if (tone === 'cool') {
      g.addColorStop(0, '#4a5c60');
      g.addColorStop(1, '#1a2629');
    } else {
      g.addColorStop(0, '#8e7956');
      g.addColorStop(1, '#3a2f22');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#392e22';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
    if (tone === 'warm') blob(ctx, x + w / 2, y + h * 0.65, w * 0.55, h * 0.4, '#ffd08a', 0.16);
  }

  /* ------------------------------------------------------------
     STREET
     ------------------------------------------------------------ */
  A.paintStreet = function (S) {
    const W = 1900;
    const H = 1000;
    return A.makeScene(W, H, (ctx) => {
      // sky
      ctx.fillStyle = grad(ctx, 0, 0, 0, 640, [
        [0, '#0c171d'],
        [0.35, '#1d2c33'],
        [0.6, '#3d4245'],
        [0.78, '#6a5a50'],
        [1, '#4a3d33'],
      ]);
      ctx.fillRect(0, 0, W, 640);
      for (let i = 0; i < 18; i++) {
        blob(ctx, (i * 137) % W, 60 + (i % 5) * 46, 200 + (i % 4) * 60, 36, i % 3 ? '#7d8a8b' : '#b49a83', 0.03);
      }
      // distant roofs
      ctx.fillStyle = 'rgba(9,14,16,.9)';
      ctx.beginPath();
      ctx.moveTo(0, 400);
      for (let i = 0; i < 30; i++) {
        const x = i * 70;
        const bh = 80 + ((i * 61) % 150);
        ctx.lineTo(x, 400 - bh);
        ctx.lineTo(x + 30, 400 - bh);
        ctx.lineTo(x + 30, 400 - bh + 14);
        ctx.lineTo(x + 50, 400 - bh + 14);
        ctx.lineTo(x + 50, 400 - bh);
        ctx.lineTo(x + 70, 400 - bh);
      }
      ctx.lineTo(W, 400);
      ctx.closePath();
      ctx.fill();
      // church spire
      ctx.fillStyle = 'rgba(8,12,14,.92)';
      ctx.beginPath();
      ctx.moveTo(1080, 400);
      ctx.lineTo(1080, 210);
      ctx.lineTo(1100, 150);
      ctx.lineTo(1120, 210);
      ctx.lineTo(1120, 400);
      ctx.closePath();
      ctx.fill();

      /* ---------------- left shop ---------------- */
      const lx = 20, ly = 200, lw = 540, lh = 430;
      ctx.fillStyle = grad(ctx, lx, ly, lx, ly + lh, [
        [0, '#6a5a45'],
        [0.55, '#75624a'],
        [1, '#4d4030'],
      ]);
      ctx.fillRect(lx, ly, lw, lh);
      // plaster mottling
      for (let i = 0; i < 30; i++) {
        blob(ctx, lx + ((i * 91) % lw), ly + ((i * 57) % lh), 34, 16, i % 2 ? '#a89070' : '#3c3022', 0.045);
      }
      // roof
      ctx.fillStyle = '#29241e';
      ctx.beginPath();
      ctx.moveTo(lx - 26, ly);
      ctx.lineTo(lx + 54, ly - 68);
      ctx.lineTo(lx + lw - 40, ly - 68);
      ctx.lineTo(lx + lw + 26, ly);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(130,115,92,.16)';
        ctx.fillRect(lx + 10 + i * 68, ly - 62, 44, 3);
      }
      // timber
      ctx.strokeStyle = 'rgba(42,32,22,.8)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(lx, ly + 146);
      ctx.lineTo(lx + lw, ly + 146);
      ctx.moveTo(lx + 180, ly);
      ctx.lineTo(lx + 180, ly + lh);
      ctx.moveTo(lx + 420, ly);
      ctx.lineTo(lx + 420, ly + lh);
      ctx.stroke();
      // upper windows
      warmWindow(ctx, lx + 44, ly + 26, 92, 88, 'warm');
      warmWindow(ctx, lx + 226, ly + 26, 100, 88, 'cool');
      warmWindow(ctx, lx + 458, ly + 26, 60, 88, 'warm');
      // sign
      ctx.fillStyle = '#2e2921';
      ctx.fillRect(lx + 16, ly + 158, 350, 50);
      ctx.strokeStyle = 'rgba(200,164,102,.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(lx + 22, ly + 164, 338, 38);
      ctx.fillStyle = '#d8c7a4';
      ctx.font = '500 24px Cormorant, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE LITTLE THINGS', lx + 191, ly + 191);
      ctx.font = '8px Karla, sans-serif';
      ctx.fillStyle = 'rgba(216,199,164,.7)';
      ctx.fillText('ANTIQUES · LOST OBJECTS', lx + 191, ly + 203);
      // awning
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lx + 4, ly + 236);
      ctx.lineTo(lx + 340, ly + 236);
      ctx.lineTo(lx + 314, ly + 272);
      ctx.lineTo(lx + 28, ly + 272);
      ctx.closePath();
      ctx.fillStyle = '#3f4d43';
      ctx.fill();
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(205,190,158,.75)' : 'rgba(66,82,70,.95)';
        ctx.beginPath();
        ctx.moveTo(lx + 4 + i * 48, ly + 236);
        ctx.lineTo(lx + 52 + i * 48, ly + 236);
        ctx.lineTo(lx + 46 + i * 48, ly + 272);
        ctx.lineTo(lx - 2 + i * 48, ly + 272);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      // window
      const wx = lx + 28, wy = ly + 288, ww = 286, wh = 160;
      ctx.fillStyle = '#211c16';
      ctx.fillRect(wx - 10, wy - 10, ww + 20, wh + 20);
      const wg = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      wg.addColorStop(0, '#f0c383');
      wg.addColorStop(0.4, '#cf9552');
      wg.addColorStop(1, '#6a4527');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = 'rgba(50,32,18,.55)';
      ctx.fillRect(wx + 16, wy + 70, ww - 32, 55);
      ctx.fillStyle = 'rgba(40,25,14,.7)';
      ctx.fillRect(wx + 30, wy + 40, 80, 36);
      ctx.fillRect(wx + 150, wy + 32, 90, 40);
      blob(ctx, wx + 145, wy + 35, 55, 55, '#ffe0a0', 0.5);
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 8;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.moveTo(wx, wy + wh / 2);
      ctx.lineTo(wx + ww, wy + wh / 2);
      ctx.stroke();
      // door
      const dx = lx + 340, dy = ly + 286, dw = 120, dh = 172;
      ctx.fillStyle = '#241d15';
      ctx.fillRect(dx - 8, dy - 8, dw + 16, dh + 16);
      const dg = ctx.createLinearGradient(dx, dy, dx, dy + dh);
      dg.addColorStop(0, '#3a4a4b');
      dg.addColorStop(1, '#1a272a');
      ctx.fillStyle = dg;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 5;
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.beginPath();
      ctx.moveTo(dx, dy + dh * 0.55);
      ctx.lineTo(dx + dw, dy + dh * 0.55);
      ctx.stroke();
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(dx + dw - 18, dy + dh * 0.6, 3.5, 0, TAU);
      ctx.fill();
      // window box
      ctx.fillStyle = '#3b2c1d';
      ctx.fillRect(wx - 8, wy + wh + 8, ww + 16, 14);
      for (let i = 0; i < 8; i++) {
        blob(ctx, wx + 16 + i * 36, wy + wh + 4, 15, 11, i % 2 ? '#5f7040' : '#6d7f49', 0.65);
      }
      // hanging lamp at shop
      blob(ctx, lx + 300, ly + 250, 90, 90, '#ffcf88', 0.22);

      /* ---------------- middle buildings ---------------- */
      // pale building
      ctx.fillStyle = grad(ctx, 580, 250, 580, 620, [[0, '#5c574a'], [1, '#3f3b32']]);
      ctx.fillRect(580, 250, 190, 370);
      ctx.fillStyle = '#292520';
      ctx.beginPath();
      ctx.moveTo(568, 250);
      ctx.lineTo(620, 190);
      ctx.lineTo(742, 190);
      ctx.lineTo(782, 250);
      ctx.closePath();
      ctx.fill();
      warmWindow(ctx, 610, 300, 54, 72, 'cool');
      warmWindow(ctx, 690, 300, 54, 72, 'warm');
      warmWindow(ctx, 610, 420, 54, 72, 'warm');
      warmWindow(ctx, 690, 420, 54, 72, 'dim');
      // brick building
      ctx.fillStyle = grad(ctx, 790, 210, 790, 620, [[0, '#5c4033'], [1, '#3f2c23']]);
      ctx.fillRect(790, 210, 220, 410);
      ctx.fillStyle = '#2b211c';
      ctx.beginPath();
      ctx.moveTo(780, 210);
      ctx.lineTo(900, 150);
      ctx.lineTo(1020, 210);
      ctx.closePath();
      ctx.fill();
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 8; c++) {
          ctx.fillStyle = `rgba(120,82,64,${0.03 + ((r + c) % 3) * 0.02})`;
          ctx.fillRect(790 + c * 28, 220 + r * 40, 26, 2);
        }
      }
      warmWindow(ctx, 820, 270, 58, 78, 'warm');
      warmWindow(ctx, 920, 270, 58, 78, 'cool');
      warmWindow(ctx, 820, 410, 58, 78, 'dim');
      warmWindow(ctx, 920, 410, 58, 78, 'warm');
      // dark timber building
      ctx.fillStyle = grad(ctx, 1030, 260, 1030, 620, [[0, '#4a4034'], [1, '#2e2820']]);
      ctx.fillRect(1030, 260, 210, 360);
      ctx.fillStyle = '#241f19';
      ctx.beginPath();
      ctx.moveTo(1020, 260);
      ctx.lineTo(1135, 205);
      ctx.lineTo(1250, 260);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,24,18,.7)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(1030, 370);
      ctx.lineTo(1240, 370);
      ctx.moveTo(1135, 260);
      ctx.lineTo(1135, 620);
      ctx.stroke();
      warmWindow(ctx, 1060, 300, 52, 56, 'warm');
      warmWindow(ctx, 1160, 300, 52, 56, 'cool');
      warmWindow(ctx, 1060, 420, 52, 56, 'dim');
      warmWindow(ctx, 1160, 420, 52, 56, 'warm');

      /* ---------------- clock shop ---------------- */
      const cx = 1270, cy = 180, cw = 430, ch = 450;
      ctx.fillStyle = grad(ctx, cx, cy, cx, cy + ch, [[0, '#5f3f31'], [0.6, '#53372c'], [1, '#39241d']]);
      ctx.fillRect(cx, cy, cw, ch);
      // brick lines
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 14; c++) {
          ctx.fillStyle = `rgba(130,86,66,${0.025 + ((r + c) % 4) * 0.014})`;
          ctx.fillRect(cx + c * 32, cy + 20 + r * 27, 30, 2);
        }
      }
      // gable roof
      ctx.fillStyle = '#28211b';
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy);
      ctx.lineTo(cx + cw / 2, cy - 100);
      ctx.lineTo(cx + cw + 24, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(130,112,86,.14)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(cx + 10 + i * 52, cy - 22 - i * 8, 34, 3);
      }
      // upper windows
      warmWindow(ctx, cx + 40, cy + 30, 64, 80, 'warm');
      warmWindow(ctx, cx + 170, cy + 30, 90, 80, 'cool');
      warmWindow(ctx, cx + 320, cy + 30, 64, 80, 'warm');
      // sign
      ctx.fillStyle = '#26221b';
      ctx.fillRect(cx + 34, cy + 138, 360, 58);
      ctx.strokeStyle = 'rgba(200,164,102,.45)';
      ctx.strokeRect(cx + 40, cy + 144, 348, 46);
      ctx.fillStyle = '#d8c7a4';
      ctx.font = '500 25px Cormorant, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('MARCHETTI & SON', cx + 214, cy + 168);
      ctx.font = '8px Karla, sans-serif';
      ctx.fillStyle = 'rgba(216,199,164,.7)';
      ctx.fillText('CLOCK REPAIR  ·  EST. 1921', cx + 214, cy + 181);
      // bow window
      const bw = 170, bh = 150, bx = cx + 42, by = cy + 226;
      ctx.fillStyle = '#221b15';
      ctx.fillRect(bx - 12, by - 12, bw + 24, bh + 24);
      const bg = ctx.createLinearGradient(bx, by, bx, by + bh);
      bg.addColorStop(0, '#f1c47f');
      bg.addColorStop(0.45, '#c78c4a');
      bg.addColorStop(1, '#5e3c22');
      ctx.fillStyle = bg;
      ctx.fillRect(bx, by, bw, bh);
      // clocks in window
      for (let i = 0; i < 6; i++) {
        const px = bx + 30 + (i % 3) * 55;
        const py = by + 42 + Math.floor(i / 3) * 62;
        ctx.fillStyle = '#4a3620';
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#efe3cd';
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#4a3820';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(i) * 11, py + Math.sin(i) * 11);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 8;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by);
      ctx.lineTo(bx + bw / 2, by + bh);
      ctx.stroke();
      // door
      const ddx = cx + 290, ddy = cy + 226, ddw = 110, ddh = 220;
      ctx.fillStyle = '#241d15';
      ctx.fillRect(ddx - 8, ddy - 8, ddw + 16, ddh + 16);
      const ddg = ctx.createLinearGradient(ddx, ddy, ddx, ddy + ddh);
      ddg.addColorStop(0, '#4a3a28');
      ddg.addColorStop(1, '#241a12');
      ctx.fillStyle = ddg;
      ctx.fillRect(ddx, ddy, ddw, ddh);
      ctx.strokeStyle = 'rgba(200,164,102,.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ddx + 14, ddy + 16, ddw - 28, 80);
      ctx.strokeRect(ddx + 14, ddy + 116, ddw - 28, 80);
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(ddx + ddw - 20, ddy + 120, 3.5, 0, TAU);
      ctx.fill();
      // hanging clock sign
      ctx.strokeStyle = '#2b241a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 250, cy - 10);
      ctx.lineTo(cx + 250, cy + 40);
      ctx.stroke();
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.arc(cx + 250, cy + 58, 24, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2b2720';
      ctx.beginPath();
      ctx.arc(cx + 250, cy + 58, 19, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#d8c7a4';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx + 250, cy + 58);
      ctx.lineTo(cx + 250, cy + 46);
      ctx.moveTo(cx + 250, cy + 58);
      ctx.lineTo(cx + 260, cy + 62);
      ctx.stroke();

      /* ---------------- far right arch ---------------- */
      ctx.fillStyle = '#3a352d';
      ctx.fillRect(1700, 330, 200, 310);
      ctx.fillStyle = '#2b2823';
      ctx.fillRect(1720, 360, 180, 280);
      // arch opening
      ctx.fillStyle = '#111c1f';
      ctx.beginPath();
      ctx.moveTo(1740, 640);
      ctx.lineTo(1740, 470);
      ctx.arc(1810, 470, 70, Math.PI, TAU);
      ctx.lineTo(1880, 640);
      ctx.closePath();
      ctx.fill();
      // fog in arch
      const fg = ctx.createLinearGradient(1740, 420, 1880, 640);
      fg.addColorStop(0, 'rgba(150,170,175,.05)');
      fg.addColorStop(0.6, 'rgba(170,190,190,.14)');
      fg.addColorStop(1, 'rgba(170,190,190,.02)');
      ctx.fillStyle = fg;
      ctx.fillRect(1740, 420, 140, 220);
      // signpost
      ctx.fillStyle = '#2d2820';
      ctx.fillRect(1660, 500, 8, 150);
      ctx.fillStyle = '#d8c7a4';
      rr(ctx, 1600, 500, 110, 26, 2);
      ctx.fill();
      ctx.fillStyle = '#4a3b28';
      ctx.font = '8px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HARROWMERE STATION', 1655, 517);
      ctx.beginPath();
      ctx.moveTo(1598, 513);
      ctx.lineTo(1588, 507);
      ctx.lineTo(1588, 519);
      ctx.fill();

      /* ---------------- street floor ---------------- */
      ctx.fillStyle = '#3e3b35';
      ctx.fillRect(0, 620, W, 60);
      // sidewalk seams
      ctx.strokeStyle = 'rgba(18,18,16,.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 84, 620);
        ctx.lineTo(i * 84 - 24, 680);
        ctx.stroke();
      }
      ctx.fillStyle = '#1b1a17';
      ctx.fillRect(0, 678, W, 8);
      const sg = ctx.createLinearGradient(0, 686, 0, H);
      sg.addColorStop(0, '#34322d');
      sg.addColorStop(0.4, '#2a2925');
      sg.addColorStop(1, '#181817');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 686, W, H - 686);
      cobbles(ctx, 0, 700, W, 300, 50);
      // wet sheen
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const sheen = ctx.createLinearGradient(0, 690, 0, 980);
      sheen.addColorStop(0, 'rgba(180,200,205,.04)');
      sheen.addColorStop(0.4, 'rgba(255,190,110,.03)');
      sheen.addColorStop(1, 'rgba(180,200,205,.01)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 690, W, 300);
      ctx.restore();
      // reflections
      const refl = (x, w, color, alpha) => {
        const g = ctx.createLinearGradient(0, 690, 0, 940);
        g.addColorStop(0, rgba(color, alpha));
        g.addColorStop(0.5, rgba(color, alpha * 0.35));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x, 690, w, 250);
      };
      refl(wx + 20, ww - 40, '#ffc477', 0.12);
      refl(dx + 20, dw - 40, '#ffc477', 0.09);
      refl(1580, 80, '#ffc477', 0.08);
      refl(1100, 50, '#ffc477', 0.06);
      // puddle
      ctx.fillStyle = 'rgba(120,145,150,.09)';
      ctx.beginPath();
      ctx.ellipse(1245, 845, 120, 20, -0.03, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,205,205,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(1245, 845, 120, 20, -0.03, 0, TAU);
      ctx.stroke();
      blob(ctx, 1245, 842, 80, 12, '#ffc477', 0.08);

      /* ---------------- lamp posts ---------------- */
      const lamp = (x) => {
        ctx.strokeStyle = '#181d1c';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(x, 700);
        ctx.lineTo(x, 400);
        ctx.quadraticCurveTo(x, 372, x + 30, 372);
        ctx.stroke();
        ctx.fillStyle = '#222927';
        ctx.beginPath();
        ctx.moveTo(x + 18, 372);
        ctx.lineTo(x + 44, 372);
        ctx.lineTo(x + 38, 398);
        ctx.lineTo(x + 24, 398);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f4c982';
        ctx.beginPath();
        ctx.ellipse(x + 31, 386, 7, 9, 0, 0, TAU);
        ctx.fill();
        blob(ctx, x + 31, 386, 130, 130, '#ffd08a', 0.22);
        blob(ctx, x + 31, 386, 50, 50, '#ffe0a0', 0.25);
      };
      lamp(560);
      lamp(1190);

      /* ---------------- notice board ---------------- */
      ctx.fillStyle = '#3a2a1b';
      ctx.fillRect(606, 452, 118, 150);
      ctx.fillStyle = '#6b5a3e';
      ctx.fillRect(612, 458, 106, 138);
      ctx.fillStyle = '#d8cbb4';
      rr(ctx, 622, 470, 40, 52, 1);
      ctx.fill();
      rr(ctx, 668, 476, 40, 44, 1);
      ctx.fill();
      rr(ctx, 626, 532, 80, 36, 1);
      ctx.fill();
      ctx.fillStyle = 'rgba(70,58,40,.6)';
      ctx.font = '6px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOST', 642, 484);
      ctx.fillText('CAT', 642, 492);
      ctx.fillText('PIANO', 688, 490);
      ctx.fillText('FOR SALE', 688, 498);
      ctx.fillText('LAST TRAIN', 666, 548);
      ctx.fillText('EXHIBITION', 666, 556);
      // pins
      ctx.fillStyle = '#a8463c';
      ctx.beginPath();
      ctx.arc(642, 472, 2, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(688, 478, 2, 0, TAU);
      ctx.fill();

      /* ---------------- flower cart ---------------- */
      const fx = 800, fy = 560, fw = 250;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.4)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 14;
      // wheels
      ctx.strokeStyle = '#3b2b1c';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(fx + 40, fy + 200, 30, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(fx + 210, fy + 200, 30, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(fx + 40, fy + 200);
        ctx.lineTo(fx + 40 + Math.cos(a) * 28, fy + 200 + Math.sin(a) * 28);
        ctx.moveTo(fx + 210, fy + 200);
        ctx.lineTo(fx + 210 + Math.cos(a) * 28, fy + 200 + Math.sin(a) * 28);
        ctx.stroke();
      }
      // body
      ctx.fillStyle = '#4a3320';
      rr(ctx, fx, fy + 96, fw, 106, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,180,120,.12)';
      ctx.fillRect(fx, fy + 96, fw, 3);
      ctx.strokeStyle = 'rgba(20,12,7,.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) ctx.strokeRect(fx + 18 + i * 78, fy + 114, 62, 70);
      // canopy poles
      ctx.strokeStyle = '#3b2b1c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fx + 16, fy + 100);
      ctx.lineTo(fx + 16, fy - 40);
      ctx.moveTo(fx + fw - 16, fy + 100);
      ctx.lineTo(fx + fw - 16, fy - 40);
      ctx.stroke();
      // canopy
      ctx.fillStyle = '#42553f';
      ctx.beginPath();
      ctx.moveTo(fx - 24, fy - 34);
      ctx.lineTo(fx + fw + 24, fy - 34);
      ctx.lineTo(fx + fw + 8, fy + 6);
      ctx.lineTo(fx - 8, fy + 6);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(210,196,165,.8)' : 'rgba(66,85,63,.9)';
        ctx.beginPath();
        ctx.moveTo(fx - 24 + i * 37, fy - 34);
        ctx.lineTo(fx + 13 + i * 37, fy - 34);
        ctx.lineTo(fx + 6 + i * 37, fy + 6);
        ctx.lineTo(fx - 31 + i * 37, fy + 6);
        ctx.closePath();
        ctx.fill();
      }
      // scallop
      ctx.strokeStyle = 'rgba(230,215,185,.55)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(fx - 6 + i * 27, fy + 8, 12, 0, Math.PI);
        ctx.stroke();
      }
      // flowers
      const flowerColors = ['#c47a4a', '#d8c08a', '#7d8fae', '#b85e58', '#e0d6b8'];
      for (let bucket = 0; bucket < 4; bucket++) {
        const bx2 = fx + 28 + bucket * 54;
        ctx.fillStyle = '#5c5c56';
        rr(ctx, bx2, fy + 56, 40, 44, 3);
        ctx.fill();
        for (let i = 0; i < 10; i++) {
          const px = bx2 + 6 + (i % 5) * 7;
          const py = fy + 48 - Math.floor(i / 5) * 8 + (i % 3) * 2;
          ctx.strokeStyle = '#4f6b45';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(px, fy + 70);
          ctx.lineTo(px + (i % 3 - 1) * 3, py);
          ctx.stroke();
          ctx.fillStyle = flowerColors[(bucket + i) % flowerColors.length];
          ctx.beginPath();
          ctx.arc(px + (i % 3 - 1) * 3, py, 4 + (i % 2), 0, TAU);
          ctx.fill();
        }
      }
      // lantern
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(fx + fw + 6, fy - 18, 7, 0, TAU);
      ctx.fill();
      blob(ctx, fx + fw + 6, fy - 18, 55, 55, '#ffd08a', 0.35);
      // chalkboard
      ctx.fillStyle = '#3a2a1b';
      rr(ctx, fx - 42, fy + 116, 34, 44, 2);
      ctx.fill();
      ctx.fillStyle = '#232620';
      ctx.fillRect(fx - 38, fy + 120, 26, 36);
      ctx.fillStyle = 'rgba(220,215,190,.6)';
      ctx.font = '5px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FLOWERS', fx - 25, fy + 132);
      ctx.fillText('FOR', fx - 25, fy + 140);
      ctx.fillText('THE WET', fx - 25, fy + 148);
      ctx.restore();

      // foreground fog / rain
      A.grain(ctx, 0, 0, W, H, 0.06, 71);
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.42, 200, W * 0.5, H * 0.55, 950);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.75, 'rgba(4,8,8,.18)');
      vg.addColorStop(1, 'rgba(3,6,6,.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    });
  };

  /* ------------------------------------------------------------
     CLOCK SHOP
     ------------------------------------------------------------ */
  A.paintClock = function (S) {
    const W = 1500;
    const H = 1000;
    return A.makeScene(W, H, (ctx) => {
      // wall
      ctx.fillStyle = grad(ctx, 0, 0, 0, 500, [
        [0, '#1c1712'],
        [0.35, '#33271c'],
        [0.75, '#423224'],
        [1, '#2a2018'],
      ]);
      ctx.fillRect(0, 0, W, 500);
      // wood paneling
      for (let x = 0; x < W; x += 150) {
        ctx.strokeStyle = 'rgba(15,10,7,.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 470);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(210,170,110,.05)';
        ctx.beginPath();
        ctx.moveTo(x + 2, 0);
        ctx.lineTo(x + 2, 470);
        ctx.stroke();
      }
      // shelves
      const shelf = (y) => {
        ctx.fillStyle = '#4a3320';
        ctx.fillRect(40, y, 1420, 10);
        ctx.fillStyle = 'rgba(230,190,130,.14)';
        ctx.fillRect(40, y, 1420, 2);
        ctx.fillStyle = 'rgba(12,8,5,.4)';
        ctx.fillRect(40, y + 10, 1420, 4);
      };
      shelf(150);
      shelf(270);
      shelf(390);
      // clock faces on wall
      const face = (x, y, r, warm, broken) => {
        ctx.fillStyle = '#3b2a1a';
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, TAU);
        ctx.fill();
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
        g.addColorStop(0, warm ? '#f2e2c4' : '#d8d0bc');
        g.addColorStop(0.7, warm ? '#d8c19c' : '#b8b2a2');
        g.addColorStop(1, warm ? '#a9875c' : '#8a8578');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(60,44,26,.55)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82);
          ctx.lineTo(x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(45,34,22,.8)';
        ctx.lineWidth = Math.max(1, r * 0.05);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(broken ? 2.4 : 1.2) * r * 0.5, y + Math.sin(broken ? 2.4 : 1.2) * r * 0.5);
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(4.2) * r * 0.7, y + Math.sin(4.2) * r * 0.7);
        ctx.stroke();
        ctx.fillStyle = 'rgba(45,34,22,.8)';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.5, r * 0.05), 0, TAU);
        ctx.fill();
      };
      // top shelf clocks
      face(110, 105, 30, true, false);
      face(210, 100, 22, false, true);
      face(300, 108, 34, true, false);
      face(410, 100, 20, false, false);
      // cuckoo clock
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(480, 66, 80, 78);
      ctx.fillStyle = '#332417';
      ctx.beginPath();
      ctx.moveTo(470, 66);
      ctx.lineTo(520, 30);
      ctx.lineTo(570, 66);
      ctx.closePath();
      ctx.fill();
      face(520, 106, 18, true, false);
      ctx.fillStyle = '#c9a45c';
      ctx.fillRect(514, 128, 12, 6);
      // pendulum
      ctx.strokeStyle = '#b58c4e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(520, 138);
      ctx.lineTo(520, 172);
      ctx.stroke();
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.arc(520, 174, 7, 0, TAU);
      ctx.fill();
      face(640, 104, 40, false, false);
      // gears
      const gear = (x, y, r, teeth) => {
        ctx.strokeStyle = 'rgba(180,140,80,.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * TAU;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
          ctx.lineTo(x + Math.cos(a) * (r + 4), y + Math.sin(a) * (r + 4));
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, TAU);
        ctx.stroke();
      };
      gear(730, 92, 18, 10);
      gear(772, 114, 13, 8);
      face(860, 102, 26, true, false);
      // shelf clocks row
      face(960, 105, 20, false, true);
      face(1030, 104, 30, true, false);
      face(1130, 100, 24, false, false);
      face(1210, 105, 36, true, false);
      // big wall clock
      face(1340, 110, 40, true, false);

      // middle shelf objects: jars of parts, clock movements
      const jar = (x, y, w, h) => {
        ctx.fillStyle = 'rgba(150,170,150,.28)';
        rr(ctx, x, y, w, h, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(220,190,130,.4)';
        ctx.fillRect(x, y - 4, w, 5);
        ctx.fillStyle = 'rgba(240,230,200,.15)';
        ctx.fillRect(x + 3, y + 4, 2, h - 8);
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = 'rgba(190,150,80,.4)';
          ctx.beginPath();
          ctx.arc(x + 6 + (i * 7) % (w - 10), y + h - 8 - (i % 4) * 5, 1.6, 0, TAU);
          ctx.fill();
        }
      };
      jar(80, 218, 40, 52);
      jar(136, 228, 32, 42);
      jar(185, 214, 46, 56);
      // clock movements
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = 'rgba(190,150,90,.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(280 + i * 55, 240, 18, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(280 + i * 55, 240, 6, 0, TAU);
        ctx.stroke();
      }
      // books / ledgers
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? '#5b3d2a' : '#3e3026';
        ctx.fillRect(520 + i * 12, 212 + (i % 3) * 4, 10, 58);
      }
      // stacked clocks
      face(720, 240, 22, true, false);
      face(760, 236, 16, false, false);
      face(800, 242, 26, true, false);
      // big shelf clock
      ctx.fillStyle = '#4a3320';
      rr(ctx, 900, 200, 90, 90, 4);
      ctx.fill();
      face(945, 245, 32, true, false);
      // small clocks
      face(1040, 240, 18, false, false);
      face(1090, 242, 26, true, false);
      face(1160, 238, 20, false, true);
      // tools on shelf
      ctx.strokeStyle = 'rgba(190,170,140,.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(1230 + i * 14, 250);
        ctx.lineTo(1236 + i * 14, 214);
        ctx.stroke();
      }
      // bottom shelf
      face(110, 360, 24, true, false);
      face(170, 356, 18, false, false);
      face(250, 360, 30, true, true);
      face(330, 356, 20, false, false);
      face(410, 360, 26, true, false);
      face(490, 356, 18, false, false);
      face(570, 360, 32, true, false);
      face(660, 356, 22, false, false);
      face(740, 360, 28, true, false);
      face(830, 356, 18, false, true);
      face(910, 360, 24, true, false);
      face(990, 356, 30, false, false);
      face(1080, 360, 20, true, false);
      face(1170, 356, 26, false, false);
      face(1260, 360, 32, true, false);
      face(1350, 356, 22, false, false);

      // floor
      ctx.fillStyle = grad(ctx, 0, 480, 0, H, [[0, '#3a2a1d'], [0.5, '#553d28'], [1, '#3a2a1d']]);
      ctx.fillRect(0, 480, W, H - 480);
      for (let row = 0; row < 10; row++) {
        const y = 492 + row * 52;
        ctx.strokeStyle = 'rgba(20,13,8,.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y + 2);
        ctx.stroke();
        const off = (row % 2) * 80;
        for (let x = off; x < W; x += 170) {
          ctx.strokeStyle = 'rgba(20,13,8,.25)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2, y + 50);
          ctx.stroke();
        }
      }

      // door
      const dx = 50, dy = 210, dw = 150, dh = 280;
      ctx.fillStyle = '#241a12';
      ctx.fillRect(dx - 12, dy - 12, dw + 24, dh + 24);
      const dg = ctx.createLinearGradient(dx, dy, dx, dy + dh);
      dg.addColorStop(0, '#3d3328');
      dg.addColorStop(1, '#221a13');
      ctx.fillStyle = dg;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = 'rgba(200,164,102,.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx + 16, dy + 18, dw - 32, 90);
      ctx.strokeRect(dx + 16, dy + 124, dw - 32, 130);
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(dx + dw - 24, dy + 150, 3.5, 0, TAU);
      ctx.fill();
      // door glass
      ctx.fillStyle = 'rgba(70,100,105,.16)';
      ctx.fillRect(dx + 20, dy + 22, dw - 40, 82);

      // window right
      const wx = 1290, wy = 130, ww = 160, wh = 250;
      ctx.fillStyle = '#241a12';
      ctx.fillRect(wx - 12, wy - 12, ww + 24, wh + 24);
      const wg = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      wg.addColorStop(0, '#3d5055');
      wg.addColorStop(0.5, '#2a3a3e');
      wg.addColorStop(1, '#172326');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, wy, ww, wh);
      rainStatic(ctx, wx, wy, ww, wh, 26, 0.06);
      blob(ctx, wx + 50, wy + 170, 55, 50, '#ffc477', 0.2);
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 6;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.moveTo(wx, wy + wh * 0.5);
      ctx.lineTo(wx + ww, wy + wh * 0.5);
      ctx.stroke();

      // longcase clock
      const lcx = 340, lcy = 100;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#3d2a1b';
      rr(ctx, lcx, lcy + 50, 150, 340, 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#4d3622';
      rr(ctx, lcx + 10, lcy + 60, 130, 320, 3);
      ctx.fill();
      // hood
      ctx.fillStyle = '#3d2a1b';
      rr(ctx, lcx - 6, lcy, 162, 100, 3);
      ctx.fill();
      // face
      const fcx = lcx + 75, fcy = lcy + 50;
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.arc(fcx, fcy, 44, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#efe3cd';
      ctx.beginPath();
      ctx.arc(fcx, fcy, 37, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,44,26,.7)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(fcx + Math.cos(a) * 29, fcy + Math.sin(a) * 29);
        ctx.lineTo(fcx + Math.cos(a) * 34, fcy + Math.sin(a) * 34);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3d2c1a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fcx, fcy);
      ctx.lineTo(fcx - 12, fcy - 20);
      ctx.moveTo(fcx, fcy);
      ctx.lineTo(fcx + 22, fcy + 12);
      ctx.stroke();
      // glass door + pendulum
      ctx.fillStyle = 'rgba(30,40,38,.5)';
      rr(ctx, lcx + 28, lcy + 120, 94, 230, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,220,.12)';
      ctx.strokeRect(lcx + 32, lcy + 124, 86, 222);
      ctx.strokeStyle = '#b58c4e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fcx, lcy + 130);
      ctx.lineTo(fcx, lcy + 290);
      ctx.stroke();
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(fcx, lcy + 298, 16, 0, TAU);
      ctx.fill();
      // base
      ctx.fillStyle = '#3d2a1b';
      rr(ctx, lcx - 10, lcy + 380, 170, 20, 2);
      ctx.fill();
      ctx.restore();

      // workbench
      const bx = 760, by = 500, bw = 560;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 18;
      // top
      ctx.fillStyle = '#5b3f26';
      ctx.beginPath();
      ctx.moveTo(bx + 12, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw - 16, by + 64);
      ctx.lineTo(bx - 4, by + 64);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // front
      ctx.fillStyle = grad(ctx, bx, by + 64, bx, by + 240, [[0, '#4a3220'], [1, '#2a1b11']]);
      ctx.beginPath();
      ctx.moveTo(bx - 4, by + 64);
      ctx.lineTo(bx + bw - 16, by + 64);
      ctx.lineTo(bx + bw - 22, by + 240);
      ctx.lineTo(bx, by + 240);
      ctx.closePath();
      ctx.fill();
      // drawers
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(15,9,5,.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + 24 + i * 168, by + 84, 140, 120);
        ctx.strokeStyle = 'rgba(220,180,120,.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 29 + i * 168, by + 89, 130, 110);
        ctx.fillStyle = '#c9a45c';
        ctx.beginPath();
        ctx.arc(bx + 94 + i * 168, by + 140, 3, 0, TAU);
        ctx.fill();
      }
      // top highlight
      ctx.strokeStyle = 'rgba(235,195,135,.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 12, by + 1);
      ctx.lineTo(bx + bw, by + 1);
      ctx.stroke();
      // green banker lamp
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(bx + 40, by - 60, 6, 60);
      ctx.fillStyle = '#2f5a45';
      ctx.beginPath();
      ctx.moveTo(bx + 8, by - 54);
      ctx.lineTo(bx + 82, by - 54);
      ctx.quadraticCurveTo(bx + 72, by - 86, bx + 45, by - 86);
      ctx.quadraticCurveTo(bx + 18, by - 86, bx + 8, by - 54);
      ctx.fill();
      ctx.fillStyle = '#a8c4a0';
      ctx.beginPath();
      ctx.ellipse(bx + 45, by - 55, 30, 5, 0, 0, TAU);
      ctx.fill();
      blob(ctx, bx + 45, by - 30, 110, 90, '#b8e0a8', 0.18);
      // clock under repair
      const ccx = bx + 210, ccy = by + 22;
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(ccx, ccy, 34, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#efe3cd';
      ctx.beginPath();
      ctx.arc(ccx, ccy, 28, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#3d2c1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ccx, ccy);
      ctx.lineTo(ccx - 10, ccy - 14);
      ctx.moveTo(ccx, ccy);
      ctx.lineTo(ccx + 16, ccy + 8);
      ctx.stroke();
      // gears beside
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = 'rgba(190,150,90,.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx + 280 + i * 26, by + 36, 9 + (i % 2) * 3, 0, TAU);
        ctx.stroke();
      }
      // tools
      ctx.strokeStyle = 'rgba(190,170,140,.6)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(bx + 340 + i * 16, by + 26);
        ctx.lineTo(bx + 350 + i * 16, by + 8);
        ctx.stroke();
      }
      // magnifier
      ctx.strokeStyle = '#b58c4e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx + 430, by + 20, 16, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(180,200,200,.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx + 430, by + 20, 13, 0, TAU);
      ctx.stroke();
      // teacup
      ctx.fillStyle = '#d8cbb4';
      rr(ctx, bx + 470, by + 12, 22, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#8a5f3a';
      rr(ctx, bx + 468, by + 18, 26, 4, 2);
      ctx.fill();
      blob(ctx, bx + 481, by - 2, 12, 16, '#e8dcc4', 0.12);
      ctx.restore();

      // stool
      ctx.fillStyle = '#4a3320';
      ctx.beginPath();
      ctx.ellipse(700, 760, 40, 12, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(690, 760, 8, 70);
      ctx.fillRect(730, 760, 8, 70);

      // hanging bulbs
      const bulb = (x, y) => {
        ctx.strokeStyle = '#2b241a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y - 20);
        ctx.stroke();
        ctx.fillStyle = '#3b2a1a';
        ctx.beginPath();
        ctx.ellipse(x, y - 16, 16, 5, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffe0a0';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, TAU);
        ctx.fill();
        blob(ctx, x, y + 10, 140, 140, '#ffcf88', 0.15);
        blob(ctx, x, y + 10, 50, 50, '#ffe0a0', 0.2);
      };
      bulb(600, 190);
      bulb(1020, 170);

      // clutter foreground
      ctx.fillStyle = '#3d2a1b';
      rr(ctx, 1200, 790, 120, 80, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,180,120,.1)';
      ctx.fillRect(1200, 790, 120, 3);
      ctx.fillStyle = '#2c2118';
      rr(ctx, 1240, 780, 60, 14, 2);
      ctx.fill();

      A.grain(ctx, 0, 0, W, H, 0.075, 91);
      const vg = ctx.createRadialGradient(W * 0.52, H * 0.4, 200, W * 0.5, H * 0.55, 900);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.75, 'rgba(4,7,6,.18)');
      vg.addColorStop(1, 'rgba(3,6,5,.58)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      blob(ctx, 980, 480, 260, 180, '#ffc477', 0.1);
      blob(ctx, 600, 190, 200, 160, '#ffc477', 0.08);
      ctx.restore();
    });
  };

  /* ------------------------------------------------------------
     STATION
     ------------------------------------------------------------ */
  A.paintStation = function (S) {
    const W = 1900;
    const H = 1000;
    return A.makeScene(W, H, (ctx) => {
      // sky
      ctx.fillStyle = grad(ctx, 0, 0, 0, 620, [
        [0, '#0b171d'],
        [0.3, '#182930'],
        [0.55, '#304247'],
        [0.75, '#5a615e'],
        [1, '#6b6257'],
      ]);
      ctx.fillRect(0, 0, W, 620);
      for (let i = 0; i < 16; i++) {
        blob(ctx, (i * 151) % W, 70 + (i % 4) * 50, 220, 40, i % 3 ? '#7d8d90' : '#a99a86', 0.03);
      }
      // distant fog / town
      ctx.fillStyle = 'rgba(12,18,20,.8)';
      ctx.beginPath();
      ctx.moveTo(0, 500);
      for (let i = 0; i < 28; i++) {
        const x = i * 72;
        const bh = 40 + ((i * 53) % 100);
        ctx.lineTo(x, 500 - bh);
        ctx.lineTo(x + 50, 500 - bh);
      }
      ctx.lineTo(W, 500);
      ctx.closePath();
      ctx.fill();
      const fogBand = ctx.createLinearGradient(0, 400, 0, 620);
      fogBand.addColorStop(0, 'rgba(170,190,190,0)');
      fogBand.addColorStop(0.6, 'rgba(170,190,190,.1)');
      fogBand.addColorStop(1, 'rgba(170,190,190,.02)');
      ctx.fillStyle = fogBand;
      ctx.fillRect(0, 400, W, 220);

      // canopy roof
      ctx.fillStyle = '#1a1c1b';
      ctx.beginPath();
      ctx.moveTo(0, 90);
      ctx.lineTo(1640, 90);
      ctx.lineTo(1700, 150);
      ctx.lineTo(0, 150);
      ctx.closePath();
      ctx.fill();
      // roof ribs
      ctx.strokeStyle = 'rgba(90,80,64,.4)';
      ctx.lineWidth = 5;
      for (let x = 40; x < 1650; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 92);
        ctx.lineTo(x + 16, 148);
        ctx.stroke();
      }
      // canopy underside
      ctx.fillStyle = '#242622';
      ctx.fillRect(0, 150, 1700, 24);
      ctx.fillStyle = 'rgba(200,170,120,.08)';
      ctx.fillRect(0, 150, 1700, 2);
      // scalloped valance
      ctx.fillStyle = '#1f211e';
      ctx.beginPath();
      ctx.moveTo(0, 174);
      for (let x = 0; x < 1700; x += 70) {
        ctx.quadraticCurveTo(x + 35, 214, x + 70, 174);
      }
      ctx.lineTo(1700, 174);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,170,120,.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 176);
      for (let x = 0; x < 1700; x += 70) {
        ctx.quadraticCurveTo(x + 35, 216, x + 70, 176);
      }
      ctx.stroke();

      // back wall / station house
      ctx.fillStyle = grad(ctx, 0, 198, 0, 580, [
        [0, '#4c4a3d'],
        [0.35, '#5c5747'],
        [1, '#3a362c'],
      ]);
      ctx.fillRect(0, 198, 1250, 382);
      // brick courses
      for (let r = 0; r < 14; r++) {
        for (let c = 0; c < 26; c++) {
          ctx.fillStyle = `rgba(130,110,84,${0.02 + ((r + c) % 4) * 0.012})`;
          ctx.fillRect(c * 50 + (r % 2) * 25, 210 + r * 26, 48, 2);
        }
      }
      // posters
      const poster = (x, y, w, h, text) => {
        ctx.fillStyle = '#d8cbb4';
        rr(ctx, x, y, w, h, 1);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90,72,48,.4)';
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(70,58,40,.65)';
        ctx.font = '7px Karla, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w / 2, y + h / 2);
      };
      poster(80, 260, 70, 92, 'LAST TRAIN');
      poster(170, 270, 56, 74, 'TIMETABLE');
      // station door
      ctx.fillStyle = '#262019';
      ctx.fillRect(300, 300, 120, 280);
      ctx.fillStyle = '#3b3328';
      ctx.fillRect(310, 310, 100, 260);
      ctx.strokeStyle = 'rgba(200,164,102,.16)';
      ctx.lineWidth = 2;
      ctx.strokeRect(322, 326, 76, 100);
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(398, 450, 3, 0, TAU);
      ctx.fill();
      // window on door
      ctx.fillStyle = 'rgba(70,95,100,.18)';
      ctx.fillRect(326, 330, 68, 92);

      // timetable board
      const tx = 470, ty = 280, tw = 190, th = 190;
      ctx.fillStyle = '#3b2a1b';
      ctx.fillRect(tx - 10, ty - 10, tw + 20, th + 20);
      ctx.fillStyle = '#5f4a2c';
      ctx.fillRect(tx - 4, ty - 4, tw + 8, th + 8);
      ctx.fillStyle = '#e3d5b8';
      ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = 'rgba(74,58,37,.75)';
      ctx.font = '600 8px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HARROWMERE', tx + tw / 2, ty + 20);
      ctx.font = 'italic 7px Cormorant, Georgia, serif';
      ctx.fillStyle = 'rgba(74,58,37,.6)';
      ctx.fillText('EVENING DEPARTURES', tx + tw / 2, ty + 32);
      const rows = [['6:02', 'Ashcombe'], ['6:40', 'Marlowe'], ['7:15', 'Ashcombe'], ['8:17', 'Ashcombe'], ['9:04', 'Wrenfield']];
      rows.forEach((r, i) => {
        const ry = ty + 50 + i * 22;
        ctx.textAlign = 'left';
        ctx.font = '9px Cormorant, Georgia, serif';
        ctx.fillStyle = i === 3 ? 'rgba(60,45,28,.95)' : 'rgba(60,45,28,.65)';
        ctx.fillText(r[0], tx + 24, ry);
        ctx.fillText(r[1], tx + 70, ry);
        if (i === 3) {
          ctx.strokeStyle = 'rgba(150,54,42,.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx + 20, ry + 3);
          ctx.lineTo(tx + 170, ry + 3);
          ctx.stroke();
        }
      });
      ctx.fillStyle = 'rgba(44,70,110,.6)';
      ctx.font = 'italic 7px Cormorant, Georgia, serif';
      ctx.fillText('E.V. — platform 2', tx + 116, ty + 56);
      // glass
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(tx, ty, tw, th);

      // ticket window
      const kx = 760, ky = 300, kw = 230, kh = 170;
      ctx.fillStyle = '#3b2a1b';
      ctx.fillRect(kx - 10, ky - 10, kw + 20, kh + 20);
      ctx.fillStyle = '#5c4a2e';
      ctx.fillRect(kx - 4, ky - 4, kw + 8, kh + 8);
      ctx.fillStyle = '#171f20';
      ctx.fillRect(kx, ky, kw, kh);
      // grille
      ctx.strokeStyle = 'rgba(190,160,110,.55)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(kx + 24 + i * 22, ky + 20);
        ctx.lineTo(kx + 24 + i * 22, ky + kh - 20);
        ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(kx + 20, ky + 40 + i * 26);
        ctx.lineTo(kx + kw - 20, ky + 40 + i * 26);
        ctx.stroke();
      }
      // brass counter
      ctx.fillStyle = '#b58c4e';
      ctx.fillRect(kx + 10, ky + kh - 26, kw - 20, 10);
      // CLOSED sign
      ctx.save();
      ctx.translate(kx + kw / 2, ky + kh / 2);
      ctx.rotate(-0.04);
      ctx.fillStyle = 'rgba(230,220,198,.9)';
      rr(ctx, -38, -14, 76, 28, 2);
      ctx.fill();
      ctx.fillStyle = '#4a3b28';
      ctx.font = '600 9px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLOSED', 0, 3);
      ctx.restore();
      // biro train
      ctx.strokeStyle = 'rgba(90,90,110,.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(kx + 100, ky + 136);
      ctx.lineTo(kx + 130, ky + 136);
      ctx.lineTo(kx + 136, ky + 128);
      ctx.lineTo(kx + 124, ky + 128);
      ctx.closePath();
      ctx.stroke();

      // station clock
      const scx = 1090, scy = 320;
      ctx.fillStyle = '#2b241a';
      ctx.fillRect(scx - 8, scy - 8, 120, 120);
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(scx + 52, scy + 52, 48, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#efe3cd';
      ctx.beginPath();
      ctx.arc(scx + 52, scy + 52, 41, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,44,26,.65)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(scx + 52 + Math.cos(a) * 33, scy + 52 + Math.sin(a) * 33);
        ctx.lineTo(scx + 52 + Math.cos(a) * 38, scy + 52 + Math.sin(a) * 38);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3d2c1a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(scx + 52, scy + 52);
      ctx.lineTo(scx + 52, scy + 28);
      ctx.moveTo(scx + 52, scy + 52);
      ctx.lineTo(scx + 70, scy + 62);
      ctx.stroke();

      // HARROWMERE sign
      ctx.save();
      ctx.translate(880, 226);
      ctx.rotate(-0.01);
      ctx.fillStyle = '#2f2a21';
      ctx.fillRect(-160, -22, 320, 44);
      ctx.strokeStyle = 'rgba(200,164,102,.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-154, -16, 308, 32);
      ctx.fillStyle = '#e3d5b8';
      ctx.font = '600 22px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HARROWMERE', 0, 7);
      ctx.restore();
      // hanging chains
      ctx.strokeStyle = 'rgba(40,36,30,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(740, 174);
      ctx.lineTo(740, 204);
      ctx.moveTo(1020, 174);
      ctx.lineTo(1020, 204);
      ctx.stroke();

      // platform floor
      ctx.fillStyle = grad(ctx, 0, 570, 0, 830, [
        [0, '#4a4841'],
        [0.4, '#3d3b35'],
        [1, '#2b2a26'],
      ]);
      ctx.fillRect(0, 570, W, 260);
      // slabs
      for (let row = 0; row < 6; row++) {
        const y = 580 + row * 42;
        for (let i = 0; i < 24; i++) {
          const x = i * 84 + (row % 2) * 42;
          ctx.strokeStyle = 'rgba(20,20,18,.35)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, 82, 40);
          ctx.fillStyle = `rgba(160,155,140,${0.01 + ((i + row) % 3) * 0.008})`;
          ctx.fillRect(x + 2, y + 2, 78, 36);
        }
      }
      // yellow line
      ctx.fillStyle = 'rgba(210,175,80,.5)';
      ctx.fillRect(0, 780, W, 5);
      // wet sheen + puddles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const sheen = ctx.createLinearGradient(0, 570, 0, 830);
      sheen.addColorStop(0, 'rgba(170,190,195,.03)');
      sheen.addColorStop(0.5, 'rgba(255,190,110,.02)');
      sheen.addColorStop(1, 'rgba(170,190,195,.01)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 570, W, 260);
      ctx.restore();
      ctx.fillStyle = 'rgba(120,145,150,.1)';
      ctx.beginPath();
      ctx.ellipse(680, 730, 90, 14, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1450, 760, 120, 16, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,205,205,.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(1450, 760, 120, 16, 0, 0, TAU);
      ctx.stroke();

      // tracks
      ctx.fillStyle = '#25241f';
      ctx.fillRect(0, 830, W, 170);
      // ballast
      for (let i = 0; i < 900; i++) {
        const x = (i * 173) % W;
        const y = 840 + ((i * 67) % 150);
        ctx.fillStyle = `rgba(${80 + (i % 3) * 15},${76 + (i % 3) * 12},${66 + (i % 3) * 10},.5)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + (i % 3), 0, TAU);
        ctx.fill();
      }
      // sleepers
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = 'rgba(58,44,32,.8)';
        ctx.fillRect(i * 68, 880, 48, 12);
      }
      // rails
      ctx.strokeStyle = 'rgba(150,160,160,.5)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 890);
      ctx.lineTo(W, 890);
      ctx.moveTo(0, 940);
      ctx.lineTo(W, 940);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(230,240,240,.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 888);
      ctx.lineTo(W, 888);
      ctx.moveTo(0, 938);
      ctx.lineTo(W, 938);
      ctx.stroke();
      // fog over tracks
      const tf = ctx.createLinearGradient(0, 820, 0, 1000);
      tf.addColorStop(0, 'rgba(170,190,190,.02)');
      tf.addColorStop(0.5, 'rgba(170,190,190,.1)');
      tf.addColorStop(1, 'rgba(170,190,190,.02)');
      ctx.fillStyle = tf;
      ctx.fillRect(0, 820, W, 180);

      // benches
      const bench = (x, y, w, old) => {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = old ? '#4a3624' : '#3d2e20';
        ctx.fillRect(x, y, w, 14);
        ctx.fillRect(x, y + 38, w, 14);
        ctx.fillRect(x + 10, y + 52, 12, 56);
        ctx.fillRect(x + w - 22, y + 52, 12, 56);
        ctx.shadowColor = 'transparent';
        // slats
        ctx.fillStyle = old ? '#5b4530' : '#4a3828';
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 10, y + 18 + i * 7, w - 20, 5);
        // back slats
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 10, y + 58 + i * 8, w - 20, 5);
        // armrests
        ctx.fillStyle = old ? '#4a3624' : '#3d2e20';
        ctx.fillRect(x + 6, y + 30, 12, 6);
        ctx.fillRect(x + w - 18, y + 30, 12, 6);
        ctx.restore();
      };
      bench(230, 630, 220, true);
      bench(1250, 630, 280, false);

      // bench carving
      ctx.strokeStyle = 'rgba(210,190,160,.4)';
      ctx.lineWidth = 1.2;
      ctx.font = 'italic 10px Cormorant, Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText('E + J  1962', 280, 690);

      // lost property crate
      ctx.fillStyle = '#4a3624';
      rr(ctx, 1560, 560, 150, 80, 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,180,120,.12)';
      ctx.fillRect(1560, 560, 150, 3);
      ctx.strokeStyle = 'rgba(20,12,7,.4)';
      ctx.strokeRect(1560, 560, 150, 80);
      ctx.strokeStyle = 'rgba(190,170,140,.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1560, 590);
      ctx.lineTo(1710, 590);
      ctx.stroke();
      // crate label
      ctx.fillStyle = '#d8cbb4';
      rr(ctx, 1590, 570, 90, 16, 1);
      ctx.fill();
      ctx.fillStyle = 'rgba(70,58,40,.7)';
      ctx.font = '6px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOST PROPERTY', 1635, 580);

      // lamp posts under canopy
      const lamp = (x) => {
        ctx.strokeStyle = '#1a1d1b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(x, 700);
        ctx.lineTo(x, 420);
        ctx.stroke();
        ctx.fillStyle = '#2b2a24';
        ctx.beginPath();
        ctx.moveTo(x - 16, 420);
        ctx.lineTo(x + 16, 420);
        ctx.lineTo(x + 10, 442);
        ctx.lineTo(x - 10, 442);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f4c982';
        ctx.beginPath();
        ctx.ellipse(x, 432, 7, 9, 0, 0, TAU);
        ctx.fill();
        blob(ctx, x, 432, 150, 150, '#ffd08a', 0.16);
      };
      lamp(700);
      lamp(1200);
      // canopy hanging lamps
      for (let i = 0; i < 4; i++) {
        const x = 380 + i * 330;
        ctx.strokeStyle = '#2b241a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, 174);
        ctx.lineTo(x, 240);
        ctx.stroke();
        ctx.fillStyle = '#3b2a1a';
        ctx.beginPath();
        ctx.ellipse(x, 244, 14, 5, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffe0a0';
        ctx.beginPath();
        ctx.arc(x, 256, 6, 0, TAU);
        ctx.fill();
        blob(ctx, x, 260, 120, 120, '#ffcf88', 0.12);
      }

      // planters
      ctx.fillStyle = '#4a4034';
      rr(ctx, 1130, 700, 60, 44, 3);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = i % 2 ? '#4e6b50' : '#5f7c5c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(1160, 700);
        ctx.quadraticCurveTo(1140 + i * 6, 670, 1140 + i * 6, 650 - (i % 3) * 8);
        ctx.stroke();
      }

      // exit arch left
      ctx.fillStyle = '#2b2822';
      ctx.fillRect(30, 500, 150, 300);
      ctx.fillStyle = '#141d1f';
      ctx.beginPath();
      ctx.moveTo(60, 800);
      ctx.lineTo(60, 560);
      ctx.arc(105, 560, 45, Math.PI, TAU);
      ctx.lineTo(150, 800);
      ctx.closePath();
      ctx.fill();
      const ef = ctx.createLinearGradient(60, 500, 150, 800);
      ef.addColorStop(0, 'rgba(150,170,175,.02)');
      ef.addColorStop(0.6, 'rgba(170,190,190,.12)');
      ef.addColorStop(1, 'rgba(170,190,190,.02)');
      ctx.fillStyle = ef;
      ctx.fillRect(60, 500, 90, 300);
      // arch sign
      ctx.fillStyle = '#d8cbb4';
      rr(ctx, 48, 490, 114, 22, 2);
      ctx.fill();
      ctx.fillStyle = '#4a3b28';
      ctx.font = '7px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHAPEL LANE', 105, 504);

      // signal at far right
      ctx.strokeStyle = '#2b2a24';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(1840, 820);
      ctx.lineTo(1840, 520);
      ctx.stroke();
      ctx.fillStyle = '#3d3a30';
      ctx.fillRect(1815, 520, 50, 14);
      ctx.fillStyle = '#b8463c';
      ctx.beginPath();
      ctx.arc(1840, 527, 5, 0, TAU);
      ctx.fill();
      blob(ctx, 1840, 527, 40, 40, '#b8463c', 0.2);

      // rain beyond canopy (right side)
      rainStatic(ctx, 1250, 200, 650, 620, 90, 0.04);
      // foreground fog
      A.grain(ctx, 0, 0, W, H, 0.065, 117);
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.4, 220, W * 0.5, H * 0.55, 1000);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.75, 'rgba(4,8,8,.18)');
      vg.addColorStop(1, 'rgba(3,6,6,.6)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      blob(ctx, 880, 360, 300, 180, '#ffc477', 0.05);
      ctx.restore();
    });
  };
})();
