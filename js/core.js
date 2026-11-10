/* ============================================================
   THE LITTLE THINGS — core: utilities, save, audio
   ============================================================ */
(function () {
  const LT = (window.LT = window.LT || {});

  const TAU = Math.PI * 2;
  const util = (LT.util = {
    TAU,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    damp: (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt)),
    smooth: (t) => t * t * (3 - 2 * t),
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    rand: (a = 0, b = 1) => a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    chance: (p) => Math.random() < p,
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    rectContains: (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h,
    pointInRect: (r, x, y, pad = 0) =>
      x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad,
    makeCanvas(w, h, scale = 1) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * scale));
      c.height = Math.max(1, Math.round(h * scale));
      const ctx = c.getContext('2d');
      ctx.scale(scale, scale);
      return { canvas: c, ctx };
    },
    formatClock(totalSeconds) {
      const m = Math.floor(totalSeconds / 60);
      return m < 1 ? 'just now' : m === 1 ? '1 minute' : m + ' minutes';
    },
    uid: () => Math.random().toString(36).slice(2, 9),
  });

  /* ------------------------------------------------------------
     Save
     ------------------------------------------------------------ */
  const GAME_KEY = 'littlethings.save.v2';
  const SETTINGS_KEY = 'littlethings.settings.v2';

  const defaultSettings = {
    music: 0.5,
    ambience: 0.65,
    sfx: 0.7,
    textSpeed: 1,
    reduceMotion: false,
  };

  const save = (LT.save = {
    GAME_KEY,
    SETTINGS_KEY,
    defaultSettings,
    readSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...defaultSettings };
        return { ...defaultSettings, ...JSON.parse(raw) };
      } catch (e) {
        return { ...defaultSettings };
      }
    },
    writeSettings(s) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      } catch (e) {}
    },
    has() {
      try {
        return !!localStorage.getItem(GAME_KEY);
      } catch (e) {
        return false;
      }
    },
    read() {
      try {
        const raw = localStorage.getItem(GAME_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || data.version !== 2) return null;
        return data;
      } catch (e) {
        return null;
      }
    },
    write(state) {
      try {
        state.savedAt = Date.now();
        localStorage.setItem(GAME_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      try {
        localStorage.removeItem(GAME_KEY);
      } catch (e) {}
    },
    meta() {
      const d = save.read();
      if (!d) return null;
      return {
        scene: d.scene,
        ending: d.ending,
        savedAt: d.savedAt,
        playtime: d.playtime || 0,
        name: d.playerName || 'the shopkeeper',
      };
    },
  });

  /* ------------------------------------------------------------
     Audio — entirely synthesized. Rain, rooms, a small piano.
     ------------------------------------------------------------ */
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.ready = false;
      this.settings = save.readSettings();
      this.scene = 'shop';
      this.started = false;
      this.musicTimer = null;
      this.rainNodes = null;
      this.rainGain = null;
      this.rainFilter = null;
      this.roomGain = null;
      this.musicBus = null;
      this.ambBus = null;
      this.sfxBus = null;
      this.wet = null;
      this.musicStep = 0;
      this.mood = 'shop';
      this.dialogueOpen = false;
      this.tickTimer = null;
      this.lastStep = 0;
      this.clockScene = false;
      this.thunderTimer = null;
      this.noiseBuffer = null;
      this.volume = 1;
    }

    init() {
      if (this.ready) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
      } catch (e) {
        return;
      }
      const ctx = this.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(ctx.destination);

      this.musicBus = ctx.createGain();
      this.ambBus = ctx.createGain();
      this.sfxBus = ctx.createGain();
      this.musicBus.connect(this.master);
      this.ambBus.connect(this.master);
      this.sfxBus.connect(this.master);

      // reverb
      const convolver = ctx.createConvolver();
      convolver.buffer = this.makeImpulse(2.6, 2.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.36;
      convolver.connect(wet);
      wet.connect(this.master);
      this.reverb = convolver;
      this.wet = wet;
      // send buses
      this.musicSend = ctx.createGain();
      this.musicSend.gain.value = 0.45;
      this.musicSend.connect(convolver);
      this.sfxSend = ctx.createGain();
      this.sfxSend.gain.value = 0.22;
      this.sfxSend.connect(convolver);
      this.musicBus.connect(this.musicSend);
      this.sfxBus.connect(this.sfxSend);

      // noise
      this.noiseBuffer = this.makeNoise(3.5);

      // rain bed
      const rain = ctx.createBufferSource();
      rain.buffer = this.noiseBuffer;
      rain.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 420;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 5200;
      lp.Q.value = 0.4;
      const rg = ctx.createGain();
      rg.gain.value = 0;
      rain.connect(hp);
      hp.connect(lp);
      lp.connect(rg);
      rg.connect(this.ambBus);
      rain.start();
      this.rainNodes = { rain, hp, lp };
      this.rainGain = rg;
      this.rainFilter = lp;

      // low room tone
      const room = ctx.createBufferSource();
      room.buffer = this.noiseBuffer;
      room.loop = true;
      const rlp = ctx.createBiquadFilter();
      rlp.type = 'lowpass';
      rlp.frequency.value = 180;
      const rgn = ctx.createGain();
      rgn.gain.value = 0.18;
      room.connect(rlp);
      rlp.connect(rgn);
      rgn.connect(this.ambBus);
      room.start();
      this.roomGain = rgn;

      this.ready = true;
      this.started = true;
      this.applyVolumes();
      this.setScene(this.scene, true);
      this.startMusic();
      this.startAmbientEvents();
    }

    makeNoise(seconds) {
      const ctx = this.ctx;
      const len = Math.floor(ctx.sampleRate * seconds);
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          d[i] = last * 3.2 + white * 0.35;
        }
      }
      return buf;
    }

    makeImpulse(seconds, decay) {
      const ctx = this.ctx;
      const rate = ctx.sampleRate;
      const len = Math.floor(rate * seconds);
      const buf = ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
      }
      return buf;
    }

    applyVolumes() {
      if (!this.ready) return;
      const s = this.settings;
      this.musicBus.gain.setTargetAtTime(s.music * 0.5, this.ctx.currentTime, 0.2);
      this.ambBus.gain.setTargetAtTime(s.ambience * 0.75, this.ctx.currentTime, 0.2);
      this.sfxBus.gain.setTargetAtTime(s.sfx * 0.9, this.ctx.currentTime, 0.1);
    }

    setSettings(settings) {
      this.settings = settings;
      if (!this.ready) return;
      this.applyVolumes();
      if (settings.music <= 0.001) {
        this.stopMusic();
      } else if (!this.musicTimer) {
        this.startMusic();
      }
    }

    setDialogue(open) {
      this.dialogueOpen = open;
      if (!this.ready) return;
      const target = this.settings.music * 0.5 * (open ? 0.55 : 1);
      this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.6);
    }

    setScene(scene, immediate) {
      this.scene = scene;
      this.clockScene = scene === 'clock';
      if (!this.ready) return;
      const t = this.ctx.currentTime;
      const indoor = scene === 'shop' || scene === 'clock';
      const station = scene === 'station';
      const rainTarget = station ? 0.23 : indoor ? 0.09 : 0.18;
      const cut = station ? 1400 : indoor ? 780 : 4600;
      this.rainGain.gain.setTargetAtTime(rainTarget, t, immediate ? 0.05 : 1.4);
      this.rainFilter.frequency.setTargetAtTime(cut, t, immediate ? 0.05 : 1.2);
      this.roomGain.gain.setTargetAtTime(indoor ? 0.2 : 0.08, t, 1.2);
      this.mood = scene;
      this.musicStep = 0;
    }

    startMusic() {
      if (!this.ready || this.musicTimer) return;
      const loop = () => {
        if (!this.ready) return;
        if (this.settings.music > 0.001) this.playBar();
        const wait = 3400 + Math.random() * 2600;
        this.musicTimer = setTimeout(loop, wait);
      };
      this.musicTimer = setTimeout(loop, 1200);
    }

    stopMusic() {
      if (this.musicTimer) clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }

    moods() {
      return {
        shop: { root: 146.83, scale: [0, 3, 5, 7, 10, 12, 15], bells: [0, 7, 10, 12, 15] },
        street: { root: 130.81, scale: [0, 2, 3, 7, 9, 10, 14], bells: [0, 3, 7, 10, 14] },
        station: { root: 123.47, scale: [0, 2, 5, 7, 9, 12, 17], bells: [0, 5, 7, 12, 17] },
        clock: { root: 164.81, scale: [0, 2, 4, 7, 9, 12, 16], bells: [0, 4, 7, 12, 16] },
        title: { root: 110, scale: [0, 3, 5, 7, 10, 12, 15], bells: [0, 7, 10, 15] },
        ending: { root: 130.81, scale: [0, 3, 5, 7, 10, 12, 15], bells: [0, 5, 7, 12, 15] },
      };
    }

    playBar() {
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;
      const mood = this.moods()[this.mood] || this.moods().shop;
      const t = ctx.currentTime + 0.05;
      const step = this.musicStep++;
      const chordSets = [
        [0, 7, 12, 15],
        [0, 5, 12, 17],
        [0, 3, 10, 15],
        [-2, 7, 12, 19],
      ];
      const chord = chordSets[step % chordSets.length];
      chord.forEach((semi, i) => {
        this.pad(mood.root * Math.pow(2, semi / 12), 4.6 + i * 0.4, 0.028 - i * 0.004, t + i * 0.08, i === 0 ? 'triangle' : 'sine');
      });
      // sparse melody
      if (Math.random() < 0.78) {
        const n = util.pick(mood.bells);
        const oct = Math.random() < 0.35 ? 2 : 1;
        this.bell(mood.root * 2 * oct * Math.pow(2, n / 12), 0.05 + Math.random() * 0.035, t + 1.1 + Math.random() * 1.8);
      }
      if (Math.random() < 0.35) {
        const n = util.pick(mood.bells);
        this.bell(mood.root * 4 * Math.pow(2, n / 12), 0.022, t + 2.8 + Math.random() * 1.4);
      }
    }

    pad(freq, dur, vol, when, type) {
      const ctx = this.ctx;
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.type = type || 'sine';
      o2.type = 'sine';
      o.frequency.value = freq;
      o2.frequency.value = freq * 1.004;
      f.type = 'lowpass';
      f.frequency.value = 900;
      f.Q.value = 0.3;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol, when + 1.4);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(f);
      o2.connect(f);
      f.connect(g);
      g.connect(this.musicBus);
      o.start(when);
      o2.start(when);
      o.stop(when + dur + 0.2);
      o2.stop(when + dur + 0.2);
    }

    bell(freq, vol, when) {
      const ctx = this.ctx;
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o2.type = 'sine';
      o.frequency.value = freq;
      o2.frequency.value = freq * 2.01;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol, when + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 2.6);
      o.connect(g);
      o2.connect(g);
      g.connect(this.musicBus);
      o.start(when);
      o2.start(when);
      o.stop(when + 2.7);
      o2.stop(when + 2.7);
    }

    startAmbientEvents() {
      const drop = () => {
        if (!this.ready) return;
        if (this.scene === 'shop' || this.scene === 'clock') {
          if (Math.random() < 0.35) this.softTick();
        } else {
          this.droplet();
        }
        this.dropletTimer = setTimeout(drop, 700 + Math.random() * 2400);
      };
      this.dropletTimer = setTimeout(drop, 1500);

      const thunder = () => {
        if (!this.ready) return;
        if ((this.scene === 'street' || this.scene === 'station') && Math.random() < 0.4) this.thunder();
        this.thunderTimer = setTimeout(thunder, 42000 + Math.random() * 55000);
      };
      this.thunderTimer = setTimeout(thunder, 25000);

      const tickLoop = () => {
        if (!this.ready) return;
        if (this.clockScene) this.tick();
        this.tickTimer = setTimeout(tickLoop, 1000);
      };
      this.tickTimer = setTimeout(tickLoop, 1000);
    }

    droplet() {
      if (!this.ready) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const freq = 1200 + Math.random() * 2600;
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.06);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.006 + Math.random() * 0.01, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(g);
      if (p) {
        p.pan.value = Math.random() * 1.6 - 0.8;
        g.connect(p);
        p.connect(this.ambBus);
      } else g.connect(this.ambBus);
      o.start(t);
      o.stop(t + 0.12);
    }

    thunder() {
      if (!this.ready) return;
      const ctx = this.ctx;
      const t = ctx.currentTime + 0.1;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(220, t);
      f.frequency.exponentialRampToValueAtTime(70, t + 3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      src.connect(f);
      f.connect(g);
      g.connect(this.ambBus);
      src.start(t);
      src.stop(t + 4.2);
    }

    tick() {
      if (!this.ready) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2400;
      f.Q.value = 8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.012, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      src.start(t);
      src.stop(t + 0.05);
    }

    softTick() {
      if (!this.ready) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 3200;
      f.Q.value = 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.004, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      src.start(t);
      src.stop(t + 0.08);
    }

    step(surface) {
      if (!this.ready || this.settings.sfx <= 0.001) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = surface === 'stone' ? 'bandpass' : 'lowpass';
      f.frequency.value = surface === 'stone' ? 900 : 500;
      f.Q.value = surface === 'stone' ? 1.2 : 0.5;
      const g = ctx.createGain();
      const vol = surface === 'stone' ? 0.028 : 0.04;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      src.start(t);
      src.stop(t + 0.16);
      // low body
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(100 + Math.random() * 25, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
      og.gain.setValueAtTime(0.02, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(og);
      og.connect(this.sfxBus);
      o.start(t);
      o.stop(t + 0.12);
    }

    play(name, opt) {
      if (!this.ready || this.settings.sfx <= 0.001) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const o = (freq, type, dur, vol, slide) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(this.sfxBus);
        osc.start(t);
        osc.stop(t + dur + 0.05);
        return { osc, g };
      };
      const noise = (freq, dur, vol, type, q) => {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const f = ctx.createBiquadFilter();
        f.type = type || 'bandpass';
        f.frequency.value = freq;
        f.Q.value = q || 1;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f);
        f.connect(g);
        g.connect(this.sfxBus);
        src.start(t);
        src.stop(t + dur + 0.05);
      };
      switch (name) {
        case 'click':
          o(520, 'sine', 0.06, 0.035, 340);
          noise(1600, 0.04, 0.012);
          break;
        case 'page':
          noise(2200, 0.16, 0.03, 'highpass', 0.7);
          noise(900, 0.12, 0.015, 'bandpass', 1.2);
          break;
        case 'chime':
          [880, 1320, 1760].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.05);
            g.gain.linearRampToValueAtTime(0.05 - i * 0.01, t + i * 0.05 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 1.8);
            osc.connect(g);
            g.connect(this.sfxBus);
            g.connect(this.sfxSend);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 2);
          });
          break;
        case 'discover':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.075);
            g.gain.linearRampToValueAtTime(0.038, t + i * 0.075 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.075 + 1.4);
            osc.connect(g);
            g.connect(this.sfxBus);
            g.connect(this.sfxSend);
            osc.start(t + i * 0.075);
            osc.stop(t + i * 0.075 + 1.5);
          });
          break;
        case 'string':
          o(220, 'triangle', 0.35, 0.05, 210);
          o(330, 'sine', 0.3, 0.025, 320);
          break;
        case 'wrong':
          o(180, 'sine', 0.22, 0.03, 140);
          break;
        case 'door':
          o(240, 'triangle', 0.35, 0.035, 170);
          noise(700, 0.4, 0.025, 'bandpass', 2);
          setTimeout(() => {
            if (!this.ready) return;
            const t2 = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 1568;
            g.gain.setValueAtTime(0, t2);
            g.gain.linearRampToValueAtTime(0.025, t2 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.2);
            osc.connect(g);
            g.connect(this.sfxBus);
            osc.start(t2);
            osc.stop(t2 + 1.3);
          }, 220);
          break;
        case 'purr':
          noise(120, 0.8, 0.025, 'lowpass', 0.5);
          o(48, 'sine', 0.9, 0.018, 42);
          break;
        case 'steam':
          noise(1100, 0.6, 0.008, 'highpass', 0.8);
          break;
        case 'decision':
          [261.6, 329.6, 392, 523.25].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.setValueAtTime(0, t + i * 0.16);
            g.gain.linearRampToValueAtTime(0.035, t + i * 0.16 + 0.04);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.16 + 2.2);
            osc.connect(g);
            g.connect(this.sfxBus);
            g.connect(this.sfxSend);
            osc.start(t + i * 0.16);
            osc.stop(t + i * 0.16 + 2.3);
          });
          break;
        default:
          break;
      }
    }

    setMood(mood) {
      this.mood = mood;
    }
  }

  LT.audio = new AudioEngine();
})();
