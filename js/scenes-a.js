/* ============================================================
   THE LITTLE THINGS — scenes: title & shop
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
  const vine = A.vine;

  /* ------------------------------------------------------------
     TITLE — the shop from the street, in the rain
     ------------------------------------------------------------ */
  A.paintTitle = function (w, h) {
    return A.makeScene(w, h, (ctx) => {
      // sky
      ctx.fillStyle = grad(ctx, 0, 0, 0, h, [
        [0, '#0a1418'],
        [0.35, '#14232a'],
        [0.62, '#2c3a3d'],
        [0.8, '#4a4a45'],
        [1, '#2a2620'],
      ]);
      ctx.fillRect(0, 0, w, h);
      // clouds
      for (let i = 0; i < 14; i++) {
        blob(ctx, (i * 173) % w, 80 + (i % 5) * 42, 180 + (i % 4) * 50, 34 + (i % 3) * 16, i % 3 ? '#8a9694' : '#c1a58c', 0.035);
      }
      // distant town
      ctx.fillStyle = 'rgba(10,16,18,.85)';
      ctx.beginPath();
      ctx.moveTo(0, 520);
      ctx.lineTo(0, 430);
      for (let i = 0; i < 26; i++) {
        const x = i * 68;
        const bh = 70 + ((i * 47) % 130);
        ctx.lineTo(x, 520 - bh);
        ctx.lineTo(x + 20, 520 - bh);
        ctx.lineTo(x + 20, 520 - bh + 20);
        ctx.lineTo(x + 48, 520 - bh + 20);
        ctx.lineTo(x + 48, 520 - bh);
        ctx.lineTo(x + 68, 520 - bh);
      }
      ctx.lineTo(w, 520);
      ctx.closePath();
      ctx.fill();
      // church spire
      ctx.fillStyle = 'rgba(8,13,15,.9)';
      ctx.beginPath();
      ctx.moveTo(420, 520);
      ctx.lineTo(420, 330);
      ctx.lineTo(440, 270);
      ctx.lineTo(460, 330);
      ctx.lineTo(460, 520);
      ctx.closePath();
      ctx.fill();

      // shop building
      const bx = 640;
      const by = 230;
      const bw = 570;
      const bh = 500;
      // wall
      ctx.fillStyle = grad(ctx, bx, by, bx, by + bh, [
        [0, '#6b5b45'],
        [0.5, '#7a684e'],
        [1, '#4e4131'],
      ]);
      ctx.fillRect(bx, by, bw, bh);
      // plaster texture
      for (let i = 0; i < 40; i++) {
        blob(ctx, bx + ((i * 97) % bw), by + ((i * 53) % bh), 30, 14, i % 2 ? '#b9a17a' : '#3c3022', 0.05);
      }
      // roof
      ctx.fillStyle = '#2d2721';
      ctx.beginPath();
      ctx.moveTo(bx - 30, by);
      ctx.lineTo(bx + 60, by - 70);
      ctx.lineTo(bx + bw - 50, by - 70);
      ctx.lineTo(bx + bw + 30, by);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(120,105,84,.2)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(bx - 20 + i * 78, by - 66, 50, 4);
      }
      // timber beams
      ctx.strokeStyle = 'rgba(44,34,24,.8)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(bx, by + 150);
      ctx.lineTo(bx + bw, by + 150);
      ctx.moveTo(bx + 200, by);
      ctx.lineTo(bx + 200, by + 500);
      ctx.moveTo(bx + 430, by);
      ctx.lineTo(bx + 430, by + 500);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(44,34,24,.5)';
      ctx.beginPath();
      ctx.moveTo(bx + 40, by + 40);
      ctx.lineTo(bx + 160, by + 140);
      ctx.moveTo(bx + 520, by + 40);
      ctx.lineTo(bx + 400, by + 140);
      ctx.stroke();

      // upper windows
      const win = (x, y, ww, hh, warm) => {
        ctx.fillStyle = '#241f19';
        ctx.fillRect(x - 8, y - 8, ww + 16, hh + 16);
        const g = ctx.createLinearGradient(x, y, x, y + hh);
        if (warm) {
          g.addColorStop(0, '#e3ad68');
          g.addColorStop(0.55, '#b97e42');
          g.addColorStop(1, '#5c3b21');
        } else {
          g.addColorStop(0, '#3a4a4e');
          g.addColorStop(1, '#1a2528');
        }
        ctx.fillStyle = g;
        ctx.fillRect(x, y, ww, hh);
        ctx.strokeStyle = '#3a2f24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + ww / 2, y);
        ctx.lineTo(x + ww / 2, y + hh);
        ctx.moveTo(x, y + hh / 2);
        ctx.lineTo(x + ww, y + hh / 2);
        ctx.stroke();
        if (warm) {
          blob(ctx, x + ww / 2, y + hh * 0.7, ww * 0.6, hh * 0.45, '#ffd18a', 0.18);
        }
      };
      win(bx + 60, by + 30, 90, 95, true);
      win(bx + 250, by + 30, 100, 95, false);
      win(bx + 460, by + 30, 80, 95, true);

      // shop sign
      ctx.fillStyle = '#2f2a20';
      ctx.fillRect(bx + 20, by + 160, 330, 52);
      ctx.strokeStyle = 'rgba(200,164,102,.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 26, by + 166, 318, 40);
      ctx.fillStyle = '#d8c7a4';
      ctx.font = '500 27px Cormorant, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE LITTLE THINGS', bx + 185, by + 195);
      ctx.font = '9px Karla, sans-serif';
      ctx.fillStyle = 'rgba(216,199,164,.7)';
      ctx.fillText('ANTIQUES  ·  LOST OBJECTS', bx + 185, by + 209);

      // awning
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx + 10, by + 245);
      ctx.lineTo(bx + 360, by + 245);
      ctx.lineTo(bx + 330, by + 285);
      ctx.lineTo(bx + 40, by + 285);
      ctx.closePath();
      ctx.fillStyle = '#3f4d43';
      ctx.fill();
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(210,192,158,.7)' : 'rgba(70,86,74,.9)';
        ctx.beginPath();
        ctx.moveTo(bx + 10 + i * 50, by + 245);
        ctx.lineTo(bx + 60 + i * 50, by + 245);
        ctx.lineTo(bx + 54 + i * 50, by + 285);
        ctx.lineTo(bx + 4 + i * 50, by + 285);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // big shop window
      const wx = bx + 30;
      const wy = by + 300;
      const ww = 300;
      const wh = 200;
      ctx.fillStyle = '#211c16';
      ctx.fillRect(wx - 12, wy - 12, ww + 24, wh + 24);
      const wg = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      wg.addColorStop(0, '#f2c98c');
      wg.addColorStop(0.35, '#d69b58');
      wg.addColorStop(0.75, '#8d5a2f');
      wg.addColorStop(1, '#4d301b');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, wy, ww, wh);
      // interior silhouettes
      ctx.fillStyle = 'rgba(50,32,18,.55)';
      ctx.fillRect(wx + 20, wy + 95, ww - 40, 70);
      ctx.fillStyle = 'rgba(40,25,14,.7)';
      ctx.fillRect(wx + 34, wy + 60, 90, 40);
      ctx.fillRect(wx + 150, wy + 50, 100, 55);
      // hanging lamp
      blob(ctx, wx + 150, wy + 45, 60, 60, '#ffe0a0', 0.55);
      ctx.fillStyle = '#5c3b1f';
      ctx.beginPath();
      ctx.arc(wx + 150, wy + 40, 12, Math.PI, TAU);
      ctx.fill();
      // cat silhouette
      ctx.fillStyle = 'rgba(32,24,18,.8)';
      ctx.beginPath();
      ctx.ellipse(wx + 238, wy + 155, 18, 10, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wx + 224, wy + 146, 8, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(wx + 218, wy + 140);
      ctx.lineTo(wx + 218, wy + 133);
      ctx.lineTo(wx + 224, wy + 138);
      ctx.fill();
      // mullions
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 9;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.moveTo(wx, wy + wh / 2);
      ctx.lineTo(wx + ww, wy + wh / 2);
      ctx.stroke();
      // glass shine
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const shine = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
      shine.addColorStop(0, 'rgba(255,255,255,.18)');
      shine.addColorStop(0.4, 'rgba(255,255,255,.02)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(wx, wy, ww, wh);
      ctx.restore();
      // window boxes
      ctx.fillStyle = '#3b2c1d';
      ctx.fillRect(wx - 10, wy + wh + 12, ww + 20, 18);
      for (let i = 0; i < 9; i++) {
        blob(ctx, wx + 20 + i * 32, wy + wh + 6, 16, 12, i % 2 ? '#5f7040' : '#6d7f49', 0.6);
      }

      // door
      const dx = bx + 370;
      const dy = by + 290;
      const dw = 150;
      const dh = 230;
      ctx.fillStyle = '#241d15';
      ctx.fillRect(dx - 10, dy - 10, dw + 20, dh + 20);
      const dg = ctx.createLinearGradient(dx, dy, dx, dy + dh);
      dg.addColorStop(0, '#2d3b3d');
      dg.addColorStop(0.6, '#1b282b');
      dg.addColorStop(1, '#141d1f');
      ctx.fillStyle = dg;
      ctx.fillRect(dx, dy, dw, dh);
      // glass reflection
      ctx.fillStyle = 'rgba(226,169,95,.16)';
      ctx.fillRect(dx + 12, dy + 12, dw - 24, dh * 0.42);
      // door panes
      ctx.strokeStyle = '#3a2b1d';
      ctx.lineWidth = 6;
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.beginPath();
      ctx.moveTo(dx, dy + dh * 0.5);
      ctx.lineTo(dx + dw, dy + dh * 0.5);
      ctx.moveTo(dx + dw / 2, dy);
      ctx.lineTo(dx + dw / 2, dy + dh * 0.5);
      ctx.stroke();
      // handle + light
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(dx + dw - 22, dy + dh * 0.55, 4, 0, TAU);
      ctx.fill();
      // open sign
      ctx.save();
      ctx.translate(dx + dw / 2, dy + 40);
      ctx.rotate(-0.06);
      ctx.fillStyle = 'rgba(238,228,205,.92)';
      rr(ctx, -42, -16, 84, 32, 2);
      ctx.fill();
      ctx.fillStyle = '#4a3b28';
      ctx.font = '600 11px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPEN', 0, 4);
      ctx.strokeStyle = 'rgba(74,59,40,.5)';
      ctx.strokeRect(-42, -16, 84, 32);
      ctx.restore();
      // warm light spill
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const spill = ctx.createRadialGradient(dx + dw / 2, dy + dh + 30, 10, dx + dw / 2, dy + dh + 30, 150);
      spill.addColorStop(0, 'rgba(255,190,110,.22)');
      spill.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = spill;
      ctx.fillRect(dx - 100, dy + dh - 20, dw + 200, 200);
      ctx.restore();

      // streetlamp
      const lx = 1360;
      ctx.strokeStyle = '#191e1d';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(lx, 700);
      ctx.lineTo(lx, 300);
      ctx.quadraticCurveTo(lx, 270, lx + 34, 270);
      ctx.stroke();
      ctx.fillStyle = '#232a28';
      ctx.beginPath();
      ctx.moveTo(lx + 20, 270);
      ctx.lineTo(lx + 48, 270);
      ctx.lineTo(lx + 42, 296);
      ctx.lineTo(lx + 26, 296);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4c982';
      ctx.beginPath();
      ctx.ellipse(lx + 34, 284, 8, 10, 0, 0, TAU);
      ctx.fill();
      blob(ctx, lx + 34, 284, 120, 120, '#ffd08a', 0.28);

      // street
      const sg = ctx.createLinearGradient(0, 690, 0, h);
      sg.addColorStop(0, '#3a3530');
      sg.addColorStop(0.5, '#292724');
      sg.addColorStop(1, '#17191a');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 690, w, h - 690);
      // sidewalk
      ctx.fillStyle = '#4a453d';
      ctx.fillRect(0, 690, w, 34);
      ctx.strokeStyle = 'rgba(20,20,18,.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 90, 690);
        ctx.lineTo(i * 90 - 30, 724);
        ctx.stroke();
      }
      // cobbles
      for (let row = 0; row < 8; row++) {
        const y = 735 + row * 24;
        const off = row % 2 ? 28 : 0;
        for (let i = 0; i < 30; i++) {
          const x = i * 62 + off;
          ctx.fillStyle = `rgba(${52 + (i % 3) * 8},${50 + (i % 3) * 6},${46 + (i % 3) * 5},.85)`;
          ctx.beginPath();
          ctx.ellipse(x, y, 28, 10, 0, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = 'rgba(120,115,100,.09)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // wet reflections
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const refl = ctx.createLinearGradient(0, 730, 0, 900);
      refl.addColorStop(0, 'rgba(255,190,110,.16)');
      refl.addColorStop(0.5, 'rgba(255,170,90,.05)');
      refl.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = refl;
      ctx.fillRect(wx + 30, 724, ww - 60, 180);
      ctx.fillRect(dx + 30, 724, dw - 60, 140);
      ctx.fillStyle = 'rgba(255,200,130,.12)';
      ctx.fillRect(lx - 20, 724, 100, 150);
      ctx.restore();
      // puddle
      ctx.fillStyle = 'rgba(120,145,150,.08)';
      ctx.beginPath();
      ctx.ellipse(1080, 860, 150, 22, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,210,210,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(1080, 860, 150, 22, 0, 0, TAU);
      ctx.stroke();

      // foreground rain-wet blur / vignette
      blob(ctx, 200, 780, 300, 180, '#0a1113', 0.5);
      blob(ctx, 1450, 820, 300, 160, '#0a1113', 0.45);
      A.grain(ctx, 0, 0, w, h, 0.07, 12);
      // warm bloom
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      blob(ctx, wx + ww / 2, wy + wh / 2, 260, 160, '#ffc477', 0.16);
      blob(ctx, lx + 34, 284, 150, 150, '#ffd08a', 0.1);
      ctx.restore();
    });
  };

  /* ------------------------------------------------------------
     SHOP
     ------------------------------------------------------------ */
  const decorOf = (S, key, fallback) => (S && S.decor && S.decor[key]) || fallback;

  A.paintShop = function (S) {
    const W = 1500;
    const H = 1000;
    return A.makeScene(W, H, (ctx) => {
      const lampColor = decorOf(S, 'lamp', 'amber');
      const rugColor = decorOf(S, 'rug', 'rose');
      const sill = decorOf(S, 'sill', 'fern');
      const wall = decorOf(S, 'wall', 'empty');
      const lampHex = lampColor === 'rose' ? '#d99280' : lampColor === 'sea' ? '#8fb6a0' : '#e2a95f';
      const rugHex = rugColor === 'midnight' ? ['#2f4557', '#22313e', '#4a6070'] : rugColor === 'cornflower' ? ['#4a6483', '#334a63', '#6d87a4'] : ['#7b4a45', '#5e3835', '#9a6258'];

      // wall
      ctx.fillStyle = grad(ctx, 0, 0, 0, 460, [
        [0, '#141f1d'],
        [0.4, '#2a3a35'],
        [0.78, '#37453d'],
        [1, '#2c251b'],
      ]);
      ctx.fillRect(0, 0, W, 460);
      // wallpaper damask
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let y = 26; y < 330; y += 64) {
        for (let x = 26; x < W; x += 84) {
          const ox = (Math.floor(y / 64) % 2) * 42;
          vine(ctx, x + ox, y, 1.1, '#8fa58f', 0.05);
        }
      }
      ctx.restore();
      // ceiling beam
      ctx.fillStyle = '#211a13';
      ctx.fillRect(0, 0, W, 34);
      ctx.fillStyle = 'rgba(200,170,120,.06)';
      ctx.fillRect(0, 32, W, 3);
      // chair rail
      ctx.fillStyle = '#3d2d1f';
      ctx.fillRect(0, 326, W, 16);
      ctx.fillStyle = 'rgba(220,180,120,.13)';
      ctx.fillRect(0, 326, W, 2);
      // wainscot
      ctx.fillStyle = grad(ctx, 0, 342, 0, 460, [
        [0, '#3c2c1e'],
        [1, '#2a1e15'],
      ]);
      ctx.fillRect(0, 342, W, 118);
      for (let x = 20; x < W; x += 128) {
        ctx.strokeStyle = 'rgba(20,14,9,.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, 352, 108, 98);
        ctx.strokeStyle = 'rgba(210,170,110,.07)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, 356, 100, 90);
      }
      // baseboard
      ctx.fillStyle = '#1b140e';
      ctx.fillRect(0, 452, W, 18);

      // floor
      ctx.fillStyle = grad(ctx, 0, 460, 0, H, [
        [0, '#3a2a1d'],
        [0.35, '#553d28'],
        [0.75, '#63482e'],
        [1, '#402e20'],
      ]);
      ctx.fillRect(0, 460, W, H - 460);
      // planks
      for (let row = 0; row < 10; row++) {
        const y = 470 + row * 55;
        ctx.strokeStyle = 'rgba(28,18,10,.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y + 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(230,190,130,.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + 2);
        ctx.lineTo(W, y + 4);
        ctx.stroke();
        const off = (row % 2) * 90;
        for (let x = off; x < W; x += 180) {
          ctx.strokeStyle = 'rgba(30,20,12,.28)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2, y + 54);
          ctx.stroke();
        }
        // grain
        for (let i = 0; i < 8; i++) {
          const gx = (row * 113 + i * 197) % W;
          ctx.strokeStyle = 'rgba(210,170,110,.045)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, y + 12 + (i % 3) * 9);
          ctx.bezierCurveTo(gx + 30, y + 8, gx + 60, y + 18, gx + 100, y + 12);
          ctx.stroke();
        }
      }
      // cool window light on floor
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const winLight = ctx.createLinearGradient(180, 460, 330, 900);
      winLight.addColorStop(0, 'rgba(130,170,190,.08)');
      winLight.addColorStop(1, 'rgba(130,170,190,0)');
      ctx.fillStyle = winLight;
      ctx.beginPath();
      ctx.moveTo(120, 460);
      ctx.lineTo(380, 460);
      ctx.lineTo(500, 900);
      ctx.lineTo(160, 900);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // rug
      ctx.save();
      const rTop = 640;
      const rBot = 970;
      ctx.beginPath();
      ctx.moveTo(440, rTop);
      ctx.lineTo(930, rTop);
      ctx.lineTo(1000, rBot);
      ctx.lineTo(370, rBot);
      ctx.closePath();
      ctx.fillStyle = rugHex[0];
      ctx.fill();
      ctx.save();
      ctx.clip();
      // border
      ctx.strokeStyle = rugHex[2];
      ctx.lineWidth = 18;
      ctx.strokeRect(410, rTop - 10, 550, rBot - rTop + 20);
      ctx.strokeStyle = 'rgba(30,20,15,.25)';
      ctx.lineWidth = 4;
      ctx.strokeRect(432, rTop + 8, 500, rBot - rTop - 16);
      // pattern
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          const px = 470 + i * 80;
          const py = 700 + j * 62;
          ctx.strokeStyle = rugHex[2];
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py - 14);
          ctx.lineTo(px + 14, py);
          ctx.lineTo(px, py + 14);
          ctx.lineTo(px - 14, py);
          ctx.closePath();
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      // wear
      for (let i = 0; i < 10; i++) {
        blob(ctx, 480 + i * 55, 760 + (i % 3) * 60, 40, 20, '#c8a880', 0.05);
      }
      ctx.restore();
      // fringe
      ctx.strokeStyle = 'rgba(200,170,130,.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(380 + i * 31, rBot);
        ctx.lineTo(376 + i * 31, rBot + 12);
        ctx.stroke();
      }
      ctx.restore();

      /* ---------------- window ---------------- */
      const wx = 70, wy = 60, ww = 320, wh = 290;
      // arch frame
      ctx.fillStyle = '#241a12';
      ctx.beginPath();
      ctx.moveTo(wx - 18, wy + wh + 18);
      ctx.lineTo(wx - 18, wy + 60);
      ctx.arc(wx + ww / 2, wy + 60, ww / 2 + 18, Math.PI, TAU);
      ctx.lineTo(wx + ww + 18, wy + wh + 18);
      ctx.closePath();
      ctx.fill();
      // glass
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh);
      ctx.lineTo(wx, wy + 60);
      ctx.arc(wx + ww / 2, wy + 60, ww / 2, Math.PI, TAU);
      ctx.lineTo(wx + ww, wy + wh);
      ctx.closePath();
      ctx.clip();
      const wg = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      wg.addColorStop(0, '#2c3f48');
      wg.addColorStop(0.5, '#4a5b5e');
      wg.addColorStop(1, '#1b272b');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, wy, ww, wh);
      // street outside
      blob(ctx, wx + 80, wy + 190, 60, 40, '#ffc477', 0.35);
      blob(ctx, wx + 240, wy + 200, 50, 34, '#ffc477', 0.22);
      ctx.fillStyle = 'rgba(15,22,24,.6)';
      ctx.fillRect(wx, wy + 210, ww, 80);
      // rain streaks static
      for (let i = 0; i < 45; i++) {
        ctx.strokeStyle = `rgba(190,210,220,${0.05 + (i % 4) * 0.02})`;
        ctx.lineWidth = 0.8;
        const rx = wx + ((i * 53) % ww);
        const ry = wy + 40 + ((i * 71) % (wh - 60));
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 10);
        ctx.stroke();
      }
      // glass reflection
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gl = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
      gl.addColorStop(0, 'rgba(255,255,255,.14)');
      gl.addColorStop(0.4, 'rgba(255,255,255,.03)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(wx, wy, ww, wh);
      ctx.restore();
      ctx.restore();
      // mullions
      ctx.strokeStyle = '#2b1f15';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy + 8);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.moveTo(wx, wy + wh * 0.55);
      ctx.lineTo(wx + ww, wy + wh * 0.55);
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh * 0.3);
      ctx.lineTo(wx + ww, wy + wh * 0.3);
      ctx.stroke();
      // sill
      ctx.fillStyle = '#3b2a1b';
      ctx.fillRect(wx - 28, wy + wh + 6, ww + 56, 18);
      ctx.fillStyle = 'rgba(230,190,130,.12)';
      ctx.fillRect(wx - 28, wy + wh + 6, ww + 56, 2);
      // curtains
      ctx.fillStyle = 'rgba(76,64,40,.9)';
      ctx.beginPath();
      ctx.moveTo(wx - 30, wy + 20);
      ctx.quadraticCurveTo(wx + 10, wy + 130, wx - 8, wy + wh);
      ctx.lineTo(wx - 46, wy + wh);
      ctx.lineTo(wx - 46, wy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(wx + ww + 30, wy + 20);
      ctx.quadraticCurveTo(wx + ww - 10, wy + 130, wx + ww + 8, wy + wh);
      ctx.lineTo(wx + ww + 46, wy + wh);
      ctx.lineTo(wx + ww + 46, wy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,170,110,.14)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(wx - 38 + i * 7, wy + 40);
        ctx.quadraticCurveTo(wx - 10 + i * 5, wy + 150, wx - 26 + i * 5, wy + wh - 10);
        ctx.stroke();
      }
      // sill plant
      if (sill === 'fern') {
        ctx.fillStyle = '#6f5b3d';
        rr(ctx, wx + 230, wy + wh - 20, 40, 26, 4);
        ctx.fill();
        for (let i = 0; i < 9; i++) {
          ctx.strokeStyle = i % 2 ? '#4e6b46' : '#5d7c50';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(wx + 250, wy + wh - 20);
          ctx.quadraticCurveTo(wx + 210 + i * 12, wy + wh - 80 - (i % 3) * 14, wx + 200 + i * 14, wy + wh - 100 - (i % 4) * 10);
          ctx.stroke();
        }
      } else if (sill === 'narcissus') {
        ctx.fillStyle = '#7d6b4a';
        rr(ctx, wx + 225, wy + wh - 24, 50, 30, 4);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = '#5f7d4d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(wx + 250, wy + wh - 24);
          ctx.quadraticCurveTo(wx + 230 + i * 9, wy + wh - 60, wx + 220 + i * 12, wy + wh - 92);
          ctx.stroke();
          ctx.fillStyle = '#e9e3cf';
          ctx.beginPath();
          ctx.arc(wx + 220 + i * 12, wy + wh - 94, 5, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#d9b25f';
          ctx.beginPath();
          ctx.arc(wx + 220 + i * 12, wy + wh - 94, 2, 0, TAU);
          ctx.fill();
        }
      } else if (sill === 'bluebird') {
        A.drawObject(ctx, 'bluebird', 150, 120, { icon: true });
      }
      // cool pool
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      blob(ctx, wx + ww / 2, wy + wh + 100, 190, 130, '#9cc0cc', 0.07);
      ctx.restore();

      /* ---------------- shelves ---------------- */
      const sx = 430, sy = 58, sw = 490;
      ctx.fillStyle = '#241a12';
      ctx.fillRect(sx - 14, sy - 10, sw + 28, 280);
      ctx.fillStyle = '#332417';
      ctx.fillRect(sx, sy, sw, 260);
      // back panel
      ctx.fillStyle = grad(ctx, sx, sy, sx, sy + 260, [
        [0, '#2a1d13'],
        [1, '#1d140e'],
      ]);
      ctx.fillRect(sx + 6, sy + 6, sw - 12, 248);
      const shelfYs = [sy + 82, sy + 168, sy + 252];
      shelfYs.forEach((y) => {
        ctx.fillStyle = '#4a3320';
        ctx.fillRect(sx - 6, y, sw + 12, 12);
        ctx.fillStyle = 'rgba(230,190,130,.16)';
        ctx.fillRect(sx - 6, y, sw + 12, 2);
        ctx.fillStyle = 'rgba(15,10,6,.35)';
        ctx.fillRect(sx - 6, y + 12, sw + 12, 5);
        // brackets
        ctx.fillStyle = '#2c1e13';
        ctx.beginPath();
        ctx.moveTo(sx + 30, y + 14);
        ctx.lineTo(sx + 30, y + 34);
        ctx.lineTo(sx + 52, y + 14);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + sw - 30, y + 14);
        ctx.lineTo(sx + sw - 30, y + 34);
        ctx.lineTo(sx + sw - 52, y + 14);
        ctx.fill();
      });

      // shelf objects
      const item = (x, baseY, fn) => {
        ctx.save();
        ctx.translate(x, baseY);
        fn();
        ctx.restore();
      };
      // top shelf
      item(sx + 34, sy + 82, () => {
        // books
        const cols = ['#6b3b2c', '#4a5540', '#7b603a', '#3e4c55'];
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = cols[i % 4];
          const hh = 30 + (i % 3) * 6;
          ctx.fillRect(i * 10, -hh, 9, hh);
          ctx.fillStyle = 'rgba(220,190,140,.2)';
          ctx.fillRect(i * 10 + 1, -hh + 4, 7, 1);
        }
      });
      item(sx + 140, sy + 82, () => {
        // jug
        ctx.fillStyle = '#8b9a8a';
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.quadraticCurveTo(-20, -22, -10, -36);
        ctx.lineTo(10, -36);
        ctx.quadraticCurveTo(20, -22, 14, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(230,240,230,.2)';
        ctx.beginPath();
        ctx.ellipse(-5, -20, 3, 9, 0.2, 0, TAU);
        ctx.fill();
      });
      item(sx + 205, sy + 82, () => {
        // brass clock
        ctx.fillStyle = '#6b4d26';
        ctx.fillRect(-4, -18, 8, 18);
        ctx.fillStyle = '#b58c4e';
        ctx.beginPath();
        ctx.arc(0, -30, 15, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e8dcc0';
        ctx.beginPath();
        ctx.arc(0, -30, 11, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#4a3820';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -38);
        ctx.moveTo(0, -30);
        ctx.lineTo(5, -28);
        ctx.stroke();
      });
      item(sx + 290, sy + 82, () => {
        // birdcage
        ctx.strokeStyle = '#9c8352';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, -32, 22, Math.PI, TAU);
        ctx.stroke();
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.moveTo(-20 + i * 6.6, -32);
          ctx.lineTo(-20 + i * 6.6, -10);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-23, -10);
        ctx.lineTo(23, -10);
        ctx.moveTo(-23, -32);
        ctx.lineTo(23, -32);
        ctx.stroke();
        ctx.fillStyle = '#c9a45c';
        ctx.beginPath();
        ctx.arc(0, -44, 2, 0, TAU);
        ctx.fill();
      });
      item(sx + 380, sy + 82, () => {
        // framed miniature
        ctx.fillStyle = '#5b4328';
        ctx.fillRect(-22, -40, 44, 40);
        ctx.fillStyle = '#6d5a3d';
        ctx.fillRect(-17, -35, 34, 30);
        ctx.fillStyle = 'rgba(210,190,150,.5)';
        ctx.beginPath();
        ctx.arc(0, -22, 8, 0, TAU);
        ctx.fill();
      });
      item(sx + 450, sy + 82, () => {
        // vase + dried stems
        ctx.fillStyle = '#7d5a3e';
        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.quadraticCurveTo(-12, -16, -5, -22);
        ctx.lineTo(5, -22);
        ctx.quadraticCurveTo(12, -16, 9, 0);
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = '#7d6a45';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -22);
          ctx.quadraticCurveTo(-10 + i * 7, -46, -4 + i * 4, -58);
          ctx.stroke();
        }
      });

      // middle shelf
      item(sx + 40, sy + 168, () => {
        const cols = ['#4f6b5a', '#8a5f3a', '#6b4a2f', '#3f5560'];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = cols[i % 4];
          ctx.beginPath();
          ctx.moveTo(i * 13 - 16, 0);
          ctx.lineTo(i * 13 - 16, -24 - (i % 3) * 5);
          ctx.lineTo(i * 13 - 8, -30 - (i % 3) * 5);
          ctx.lineTo(i * 13 - 8, 0);
          ctx.fill();
          ctx.fillStyle = 'rgba(230,200,150,.18)';
          ctx.fillRect(i * 13 - 16, -22, 8, 1);
        }
      });
      item(sx + 125, sy + 168, () => {
        // bowls
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i % 2 ? '#9a8a6c' : '#7f8c7d';
          ctx.beginPath();
          ctx.ellipse(0, -6 - i * 8, 18 - i * 2, 5, 0, 0, TAU);
          ctx.fill();
        }
      });
      item(sx + 205, sy + 168, () => {
        // globe
        ctx.strokeStyle = '#8a6a3e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -30, 18, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = '#5b6d60';
        ctx.beginPath();
        ctx.arc(0, -30, 15, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(210,200,160,.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-4, -34, 8, 0.3, 2.4);
        ctx.stroke();
        ctx.fillStyle = '#6b4a2c';
        ctx.fillRect(-3, -14, 6, 14);
      });
      item(sx + 285, sy + 168, () => {
        // wooden box
        ctx.fillStyle = '#5b4028';
        ctx.fillRect(-20, -20, 40, 20);
        ctx.fillStyle = 'rgba(220,180,120,.16)';
        ctx.fillRect(-20, -20, 40, 2);
        ctx.strokeStyle = '#3d2b1a';
        ctx.strokeRect(-20, -20, 40, 20);
        ctx.fillStyle = '#c9a45c';
        ctx.fillRect(-3, -12, 6, 4);
      });
      item(sx + 360, sy + 168, () => {
        // candlestick
        ctx.fillStyle = '#9c8352';
        ctx.fillRect(-2, -34, 4, 34);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 4, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -34, 8, 3, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e9dcc0';
        ctx.fillRect(-2, -48, 4, 14);
        blob(ctx, 0, -50, 8, 10, '#ffd08a', 0.5);
      });
      item(sx + 440, sy + 168, () => {
        // owl
        ctx.fillStyle = '#6b5a44';
        ctx.beginPath();
        ctx.ellipse(0, -20, 12, 20, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-4, -34, 6, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#d8c08a';
        ctx.beginPath();
        ctx.arc(-6, -35, 2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2b241c';
        ctx.beginPath();
        ctx.arc(-6, -35, 1, 0, TAU);
        ctx.fill();
      });

      // bottom shelf
      item(sx + 38, sy + 252, () => {
        // jars
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = 'rgba(150,170,150,.55)';
          rr(ctx, i * 22 - 30, -28, 16, 28, 4);
          ctx.fill();
          ctx.fillStyle = 'rgba(220,190,130,.5)';
          ctx.fillRect(i * 22 - 30, -30, 16, 4);
          ctx.fillStyle = 'rgba(240,230,200,.25)';
          ctx.fillRect(i * 22 - 27, -24, 2, 18);
        }
      });
      item(sx + 155, sy + 252, () => {
        // typewriter
        ctx.fillStyle = '#3b3a36';
        rr(ctx, -28, -22, 56, 22, 3);
        ctx.fill();
        ctx.fillStyle = '#262622';
        rr(ctx, -20, -34, 40, 14, 2);
        ctx.fill();
        ctx.fillStyle = '#d8cbb4';
        ctx.fillRect(-14, -32, 28, 6);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = '#6b675d';
          ctx.beginPath();
          ctx.arc(-16 + i * 8, -18, 3, 0, TAU);
          ctx.fill();
        }
      });
      item(sx + 255, sy + 252, () => {
        // records
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = i % 2 ? '#2f2c28' : '#3e3830';
          ctx.fillRect(-30 + i * 4, -26, 4, 26);
        }
        ctx.fillStyle = '#1e1c19';
        ctx.fillRect(-24, -26, 2, 26);
      });
      item(sx + 350, sy + 252, () => {
        // folded cloth
        ctx.fillStyle = '#7d5a55';
        ctx.beginPath();
        ctx.moveTo(-24, 0);
        ctx.lineTo(-18, -16);
        ctx.lineTo(20, -14);
        ctx.lineTo(24, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(230,190,150,.2)';
        ctx.fillRect(-16, -12, 30, 2);
      });
      item(sx + 430, sy + 252, () => {
        // camera
        ctx.fillStyle = '#2e2a24';
        rr(ctx, -18, -22, 36, 22, 3);
        ctx.fill();
        ctx.fillStyle = '#4c463c';
        ctx.beginPath();
        ctx.arc(0, -11, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#1c1a16';
        ctx.beginPath();
        ctx.arc(0, -11, 5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#c9a45c';
        ctx.beginPath();
        ctx.arc(12, -18, 2, 0, TAU);
        ctx.fill();
      });

      /* ---------------- wall art ---------------- */
      const ax = 990, ay = 100, aw = 170, ah = 160;
      if (wall === 'empty') {
        ctx.fillStyle = '#4a3620';
        ctx.fillRect(ax - 10, ay - 10, aw + 20, ah + 20);
        ctx.fillStyle = '#5f4a2c';
        ctx.fillRect(ax - 4, ay - 4, aw + 8, ah + 8);
        ctx.fillStyle = '#2a2118';
        ctx.fillRect(ax + 8, ay + 8, aw - 16, ah - 16);
        ctx.strokeStyle = 'rgba(220,190,140,.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(ax + 16, ay + 16, aw - 32, ah - 32);
      } else if (wall === 'leaves') {
        ctx.fillStyle = '#4a3620';
        ctx.fillRect(ax - 10, ay - 10, aw + 20, ah + 20);
        ctx.fillStyle = '#e3d5b8';
        ctx.fillRect(ax, ay, aw, ah);
        for (let i = 0; i < 7; i++) {
          ctx.strokeStyle = i % 2 ? '#6b5a3a' : '#7d6a45';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(ax + 30 + i * 16, ay + ah - 20);
          ctx.quadraticCurveTo(ax + 20 + i * 18, ay + 70, ax + 36 + i * 14, ay + 28);
          ctx.stroke();
          ctx.fillStyle = i % 2 ? '#8a7a52' : '#6f7a4e';
          ctx.beginPath();
          ctx.ellipse(ax + 34 + i * 14, ay + 44 + (i % 3) * 8, 9, 4, -0.5, 0, TAU);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(74,58,37,.3)';
        ctx.strokeRect(ax + 8, ay + 8, aw - 16, ah - 16);
      } else if (wall === 'station') {
        ctx.fillStyle = '#4a3620';
        ctx.fillRect(ax - 10, ay - 10, aw + 20, ah + 20);
        ctx.fillStyle = '#d8c9aa';
        ctx.fillRect(ax, ay, aw, ah);
        // mini sepia station
        ctx.fillStyle = '#a9987a';
        ctx.fillRect(ax + 10, ay + 10, aw - 20, ah - 20);
        ctx.fillStyle = '#7d6b52';
        ctx.fillRect(ax + 10, ay + ah * 0.55, aw - 20, ah * 0.35);
        ctx.fillStyle = '#5e4f3a';
        ctx.fillRect(ax + 40, ay + 50, 90, 8);
        // two figures
        ctx.fillStyle = 'rgba(60,48,34,.8)';
        ctx.beginPath();
        ctx.arc(ax + 70, ay + 88, 7, 0, TAU);
        ctx.fill();
        ctx.fillRect(ax + 65, ay + 95, 10, 28);
        ctx.beginPath();
        ctx.arc(ax + 102, ay + 88, 7, 0, TAU);
        ctx.fill();
        ctx.fillRect(ax + 97, ay + 95, 10, 28);
        ctx.strokeStyle = 'rgba(74,58,37,.3)';
        ctx.strokeRect(ax + 8, ay + 8, aw - 16, ah - 16);
      } else {
        // watch card shadow box
        ctx.fillStyle = '#4a3620';
        ctx.fillRect(ax - 10, ay - 10, aw + 20, ah + 20);
        ctx.fillStyle = '#2b2720';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.fillStyle = '#d8c9aa';
        ctx.fillRect(ax + 26, ay + 30, aw - 52, ah - 60);
        ctx.fillStyle = 'rgba(60,48,34,.8)';
        ctx.font = 'italic 13px Cormorant, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('E. Voss', ax + aw / 2, ay + 62);
        ctx.fillText('8:17', ax + aw / 2, ay + 80);
        ctx.font = '8px Karla, sans-serif';
        ctx.fillText('THE REST IS PRIVATE', ax + aw / 2, ay + 100);
        // small watch
        ctx.fillStyle = '#b58c4e';
        ctx.beginPath();
        ctx.arc(ax + aw / 2, ay + 118, 12, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#efe3cd';
        ctx.beginPath();
        ctx.arc(ax + aw / 2, ay + 118, 9, 0, TAU);
        ctx.fill();
      }

      /* ---------------- door ---------------- */
      const dx = 1265, dy = 80, dw = 180, dh = 370;
      ctx.fillStyle = '#241a12';
      ctx.fillRect(dx - 16, dy - 16, dw + 32, dh + 32);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(dx - 8, dy - 8, dw + 16, dh + 16);
      const dg = ctx.createLinearGradient(dx, dy, dx, dy + dh);
      dg.addColorStop(0, '#33454a');
      dg.addColorStop(0.4, '#25373c');
      dg.addColorStop(1, '#162327');
      ctx.fillStyle = dg;
      ctx.fillRect(dx, dy, dw, dh);
      // street through glass
      blob(ctx, dx + 50, dy + 180, 70, 90, '#ffc477', 0.18);
      blob(ctx, dx + 130, dy + 200, 50, 70, '#ffc477', 0.12);
      ctx.fillStyle = 'rgba(10,16,18,.4)';
      ctx.fillRect(dx, dy + 230, dw, 140);
      // rain on glass
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(190,210,220,${0.05 + (i % 4) * 0.02})`;
        ctx.lineWidth = 0.8;
        const rx = dx + ((i * 43) % dw);
        const ry = dy + 30 + ((i * 67) % (dh - 60));
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 1, ry + 8);
        ctx.stroke();
      }
      // mullions
      ctx.strokeStyle = '#2b1f15';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(dx + dw / 2, dy);
      ctx.lineTo(dx + dw / 2, dy + dh * 0.62);
      ctx.moveTo(dx, dy + dh * 0.3);
      ctx.lineTo(dx + dw, dy + dh * 0.3);
      ctx.stroke();
      // lower wood panel
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(dx + 10, dy + dh * 0.64, dw - 20, dh * 0.32);
      ctx.strokeStyle = 'rgba(220,180,120,.1)';
      ctx.strokeRect(dx + 22, dy + dh * 0.68, dw - 44, dh * 0.23);
      // handle
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(dx + dw - 26, dy + dh * 0.55, 4, 0, TAU);
      ctx.fill();
      // sign
      ctx.save();
      ctx.translate(dx + dw / 2, dy + 52);
      ctx.rotate(-0.04);
      ctx.fillStyle = 'rgba(238,228,205,.92)';
      rr(ctx, -48, -18, 96, 36, 2);
      ctx.fill();
      ctx.fillStyle = '#4a3b28';
      ctx.font = '600 11px Karla, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPEN', 0, 4);
      ctx.restore();
      // bell
      ctx.strokeStyle = '#c9a45c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dx + dw / 2, dy - 22, 7, Math.PI, TAU);
      ctx.stroke();
      ctx.fillStyle = '#c9a45c';
      ctx.beginPath();
      ctx.arc(dx + dw / 2, dy - 15, 2, 0, TAU);
      ctx.fill();
      // mat
      ctx.fillStyle = '#3d3022';
      rr(ctx, dx + 20, dy + dh + 10, dw - 40, 16, 2);
      ctx.fill();

      /* ---------------- counter ---------------- */
      const cx = 900, cy = 452, cw = 350;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.45)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 20;
      // top
      ctx.fillStyle = '#5b3f26';
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + cw, cy);
      ctx.lineTo(cx + cw - 18, cy + 62);
      ctx.lineTo(cx - 6, cy + 62);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // front
      ctx.fillStyle = grad(ctx, cx, cy + 62, cx, cy + 250, [
        [0, '#4a3220'],
        [0.55, '#3b2718'],
        [1, '#2a1b11'],
      ]);
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 62);
      ctx.lineTo(cx + cw - 18, cy + 62);
      ctx.lineTo(cx + cw - 24, cy + 250);
      ctx.lineTo(cx, cy + 250);
      ctx.closePath();
      ctx.fill();
      // front panels
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = 'rgba(15,9,5,.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx + 20 + i * 105, cy + 84, 86, 140);
        ctx.strokeStyle = 'rgba(220,180,120,.09)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 25 + i * 105, cy + 89, 76, 130);
      }
      // top highlight
      ctx.strokeStyle = 'rgba(235,195,135,.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 1);
      ctx.lineTo(cx + cw, cy + 1);
      ctx.stroke();
      // glass display inset
      ctx.fillStyle = 'rgba(20,28,27,.6)';
      rr(ctx, cx + 120, cy + 10, 120, 44, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,164,102,.25)';
      ctx.strokeRect(cx + 122, cy + 12, 116, 40);
      // register
      ctx.fillStyle = '#3b3327';
      rr(ctx, cx + 250, cy - 8, 60, 34, 3);
      ctx.fill();
      ctx.fillStyle = '#5c503e';
      rr(ctx, cx + 256, cy - 16, 48, 12, 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#d8cbb4';
        ctx.beginPath();
        ctx.arc(cx + 264 + i * 10, cy + 8, 3, 0, TAU);
        ctx.fill();
      }
      // ledger
      ctx.fillStyle = '#6b4a2f';
      rr(ctx, cx + 24, cy + 10, 70, 18, 2);
      ctx.fill();
      ctx.fillStyle = '#d8cbb4';
      ctx.fillRect(cx + 30, cy + 12, 58, 12);
      // bell
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.arc(cx + 208, cy + 20, 8, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#5a4326';
      ctx.fillRect(cx + 205, cy + 20, 6, 4);
      // lamp
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(cx + 12, cy - 50, 6, 50);
      ctx.fillStyle = '#5c4a2e';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 48);
      ctx.lineTo(cx + 36, cy - 48);
      ctx.lineTo(cx + 28, cy - 64);
      ctx.lineTo(cx + 2, cy - 64);
      ctx.closePath();
      ctx.fill();
      blob(ctx, cx + 15, cy - 36, 80, 70, '#ffd08a', 0.3);
      // watch on cushion / display
      const ending = S && S.ending;
      if (ending === 'kept') {
        // glass dome
        ctx.fillStyle = 'rgba(30,40,38,.45)';
        ctx.beginPath();
        ctx.ellipse(cx + 180, cy + 44, 54, 12, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,235,235,.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 28, 40, Math.PI, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 140, cy + 28);
        ctx.lineTo(cx + 140, cy + 44);
        ctx.moveTo(cx + 220, cy + 28);
        ctx.lineTo(cx + 220, cy + 44);
        ctx.stroke();
        // watch
        ctx.fillStyle = '#b58c4e';
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 34, 18, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#efe3cd';
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 34, 14, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#3d3022';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 180, cy + 34);
        ctx.lineTo(cx + 180, cy + 25);
        ctx.moveTo(cx + 180, cy + 34);
        ctx.lineTo(cx + 187, cy + 37);
        ctx.stroke();
        // card
        ctx.fillStyle = '#e8dcc4';
        rr(ctx, cx + 232, cy + 22, 34, 22, 1);
        ctx.fill();
        ctx.fillStyle = 'rgba(60,48,34,.7)';
        ctx.font = 'italic 5px Cormorant, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('E. Voss', cx + 249, cy + 32);
        ctx.fillText('8:17', cx + 249, cy + 38);
      } else if (ending === 'returned') {
        // framed photo + cornflowers
        ctx.fillStyle = '#4a3620';
        ctx.fillRect(cx + 140, cy + 6, 54, 42);
        ctx.fillStyle = '#c9b99b';
        ctx.fillRect(cx + 145, cy + 11, 44, 32);
        ctx.fillStyle = 'rgba(80,66,48,.6)';
        ctx.fillRect(cx + 145, cy + 27, 44, 16);
        ctx.beginPath();
        ctx.arc(cx + 160, cy + 24, 4, 0, TAU);
        ctx.arc(cx + 174, cy + 24, 4, 0, TAU);
        ctx.fill();
        // cornflowers
        for (let i = 0; i < 4; i++) {
          A.drawCornflower(ctx, cx + 220 + i * 12, cy + 20 + (i % 2) * 6, 7, 0.9);
        }
        ctx.fillStyle = '#7d5a3e';
        rr(ctx, cx + 214, cy + 28, 36, 14, 2);
        ctx.fill();
      } else if (S && S.flags && S.flags.caseOpen) {
        // watch on a cushion
        ctx.fillStyle = '#6d4a3a';
        ctx.beginPath();
        ctx.ellipse(cx + 180, cy + 40, 32, 12, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#b58c4e';
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 30, 18, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#efe3cd';
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 30, 14, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#3d3022';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx + 180, cy + 30);
        ctx.lineTo(cx + 180, cy + 22);
        ctx.moveTo(cx + 180, cy + 30);
        ctx.lineTo(cx + 186, cy + 34);
        ctx.stroke();
        // glass case edge
        ctx.strokeStyle = 'rgba(200,220,220,.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + 180, cy + 30, 24, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();

      /* ---------------- armchair + cat ---------------- */
      const axc = 120, ayc = 545, awc = 300;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.4)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 16;
      // back
      ctx.fillStyle = '#6e4b48';
      rr(ctx, axc + 20, ayc, awc - 40, 190, 40);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      // back inner
      ctx.fillStyle = '#7d5651';
      rr(ctx, axc + 42, ayc + 22, awc - 84, 130, 28);
      ctx.fill();
      // tufting
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.fillStyle = 'rgba(40,22,20,.25)';
          ctx.beginPath();
          ctx.arc(axc + 95 + i * 55, ayc + 60 + j * 44, 2, 0, TAU);
          ctx.fill();
        }
      }
      // seat
      ctx.fillStyle = '#7d5651';
      rr(ctx, axc + 26, ayc + 148, awc - 52, 62, 20);
      ctx.fill();
      // arms
      ctx.fillStyle = '#664440';
      rr(ctx, axc + 8, ayc + 120, 40, 100, 18);
      ctx.fill();
      rr(ctx, axc + awc - 48, ayc + 120, 40, 100, 18);
      ctx.fill();
      // legs
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(axc + 40, ayc + 205, 12, 30);
      ctx.fillRect(axc + awc - 52, ayc + 205, 12, 30);
      // blanket
      ctx.fillStyle = 'rgba(200,170,120,.4)';
      ctx.beginPath();
      ctx.moveTo(axc + 20, ayc + 160);
      ctx.quadraticCurveTo(axc + 70, ayc + 150, axc + 90, ayc + 190);
      ctx.lineTo(axc + 60, ayc + 205);
      ctx.closePath();
      ctx.fill();
      // cat
      A.drawCat(ctx, axc + 170, ayc + 166, 0);
      ctx.restore();

      // side table + mug
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(400, 590, 74, 12);
      ctx.fillRect(410, 602, 8, 58);
      ctx.fillRect(456, 602, 8, 58);
      ctx.fillStyle = '#d8cbb4';
      rr(ctx, 420, 570, 22, 20, 3);
      ctx.fill();
      ctx.fillStyle = '#8a5f3a';
      rr(ctx, 418, 578, 26, 5, 2);
      ctx.fill();
      blob(ctx, 431, 558, 14, 20, '#e8dcc4', 0.12);

      /* ---------------- sideboard + gramophone ---------------- */
      const gx = 420, gy = 462, gw = 250;
      ctx.fillStyle = '#3b2718';
      rr(ctx, gx, gy, gw, 112, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,180,120,.08)';
      ctx.fillRect(gx, gy, gw, 3);
      for (let i = 0; i < 2; i++) {
        ctx.strokeStyle = 'rgba(15,9,5,.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(gx + 18 + i * 112, gy + 20, 96, 70);
        ctx.fillStyle = '#c9a45c';
        ctx.beginPath();
        ctx.arc(gx + 62 + i * 112, gy + 55, 3, 0, TAU);
        ctx.fill();
      }
      // gramophone
      ctx.fillStyle = '#4a3020';
      rr(ctx, gx + 40, gy - 14, 70, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.arc(gx + 75, gy - 12, 26, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#5b3f26';
      ctx.beginPath();
      ctx.arc(gx + 75, gy - 12, 20, 0, TAU);
      ctx.fill();
      // horn
      ctx.fillStyle = '#b58c4e';
      ctx.beginPath();
      ctx.moveTo(gx + 105, gy - 20);
      ctx.quadraticCurveTo(gx + 160, gy - 100, gx + 195, gy - 58);
      ctx.quadraticCurveTo(gx + 160, gy - 46, gx + 120, gy - 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,180,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx + 110, gy - 18);
      ctx.quadraticCurveTo(gx + 160, gy - 90, gx + 190, gy - 58);
      ctx.stroke();
      // records
      ctx.fillStyle = '#2b2723';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(gx + 170 + i * 3, gy + 30, 3, 34);
      }

      /* ---------------- plant ---------------- */
      ctx.fillStyle = '#7d5a3e';
      rr(ctx, 1390, 500, 62, 54, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(20,14,9,.25)';
      ctx.beginPath();
      ctx.ellipse(1421, 552, 40, 9, 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + (i - 5.5) * 0.22;
        const len = 90 + (i % 4) * 24;
        ctx.strokeStyle = i % 2 ? '#3f5c45' : '#4e6b50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(1421, 505);
        ctx.quadraticCurveTo(1421 + Math.cos(a) * len * 0.6, 505 + Math.sin(a) * len * 0.7, 1421 + Math.cos(a) * len, 505 + Math.sin(a) * len);
        ctx.stroke();
        ctx.fillStyle = i % 2 ? '#4e6b50' : '#5f7c5c';
        ctx.beginPath();
        ctx.ellipse(1421 + Math.cos(a) * len, 505 + Math.sin(a) * len, 13, 7, a, 0, TAU);
        ctx.fill();
      }

      /* ---------------- hanging lamps ---------------- */
      const lamp = (x, color) => {
        ctx.strokeStyle = '#2b241a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 150);
        ctx.stroke();
        ctx.fillStyle = '#3b2a1a';
        ctx.beginPath();
        ctx.ellipse(x, 154, 38, 12, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 38, 154);
        ctx.quadraticCurveTo(x, 218, x + 38, 154);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,245,215,.55)';
        ctx.beginPath();
        ctx.ellipse(x, 156, 30, 8, 0, 0, TAU);
        ctx.fill();
        // bulb
        ctx.fillStyle = '#ffe6b0';
        ctx.beginPath();
        ctx.arc(x, 172, 8, 0, TAU);
        ctx.fill();
        // glow
        blob(ctx, x, 190, 150, 150, lampHex, 0.14);
        blob(ctx, x, 190, 60, 60, '#ffe0a0', 0.16);
      };
      lamp(620, lampHex);
      lamp(1100, lampHex);
      // third small lamp on counter already drawn

      // foreground shadow / vignette
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.42, 180, W * 0.5, H * 0.55, 820);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.75, 'rgba(4,8,7,.18)');
      vg.addColorStop(1, 'rgba(3,6,6,.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      A.grain(ctx, 0, 0, W, H, 0.075, 33);
      // warm bloom
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      blob(ctx, 620, 210, 280, 220, '#ffc477', 0.1);
      blob(ctx, 1100, 200, 260, 200, '#ffc477', 0.09);
      blob(ctx, 1080, 520, 180, 130, '#ffc477', 0.1);
      ctx.restore();
    });
  };
})();
