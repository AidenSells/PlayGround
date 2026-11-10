// ---------------------------------------------------------------
// THE LITTLE THINGS — small sounds for a rainy evening
// A tiny WebAudio engine: rain, warm room-tone, sparse piano, chimes.
// ---------------------------------------------------------------

const SCALES = {
  title: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23],
  shop: [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23],
  street: [130.81, 146.83, 174.61, 196.0, 220.0, 261.63],
  tea: [174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0],
  clock: [130.81, 155.56, 174.61, 196.0, 233.08, 261.63],
  station: [123.47, 146.83, 164.81, 185.0, 220.0, 246.94],
  cliff: [110.0, 130.81, 146.83, 164.81, 196.0, 220.0],
  lighthouse: [130.81, 164.81, 196.0, 220.0, 261.63, 329.63],
  ending: [130.81, 164.81, 196.0, 246.94, 261.63, 329.63]
};

const CHORDS = {
  title: [73.42, 110.0, 146.83],
  shop: [73.42, 110.0, 146.83],
  street: [65.41, 98.0, 130.81],
  tea: [87.31, 130.81, 174.61],
  clock: [65.41, 98.0, 123.47],
  station: [61.74, 92.5, 123.47],
  cliff: [55.0, 82.41, 110.0],
  lighthouse: [65.41, 98.0, 130.81],
  ending: [65.41, 98.0, 130.81]
};

function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.rainBus = null;
    this.roomBus = null;
    this.delay = null;
    this.rainSource = null;
    this.padNodes = [];
    this.scene = 'title';
    this.started = false;
    this.timer = null;
    this.echoTimer = null;
    this.lastNote = 0;
    this.stepToggle = 0;
  }

  get supported() {
    return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
  }

  init() {
    if (this.ctx || !this.supported) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(ctx.destination);

    this.music = ctx.createGain();
    this.music.gain.value = 0.32;
    this.music.connect(this.master);

    // a small, soft room echo
    this.delay = ctx.createDelay(1.2);
    this.delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 1800;
    this.delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(this.delay);
    damp.connect(this.music);

    this.rainBus = ctx.createGain();
    this.rainBus.gain.value = 0;
    this.rainBus.connect(this.master);

    this.roomBus = ctx.createGain();
    this.roomBus.gain.value = 0.26;
    this.roomBus.connect(this.master);

    this._startRain();
    this._startRoomTone();
    this._startPads();
    this._scheduleNotes();
    this.started = true;
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(muted) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.7, now, 0.15);
  }

  setScene(scene) {
    if (!this.ctx) { this.scene = scene; return; }
    this.scene = scene;
    const outdoor = scene === 'street' || scene === 'cliff' || scene === 'title';
    const now = this.ctx.currentTime;
    this.rainBus.gain.cancelScheduledValues(now);
    this.rainBus.gain.setTargetAtTime(outdoor ? 0.11 : 0.018, now, 1.4);
    this.roomBus.gain.setTargetAtTime(outdoor ? 0.12 : 0.3, now, 1.2);
    this._retunePads();
  }

  _startRain() {
    const ctx = this.ctx;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.86 + white * 0.14;
      data[i] = last * 1.8;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const high = ctx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 480;
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 5200;
    const shimmer = ctx.createBiquadFilter();
    shimmer.type = 'peaking';
    shimmer.frequency.value = 2400;
    shimmer.gain.value = 2.5;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    src.connect(high);
    high.connect(low);
    low.connect(shimmer);
    shimmer.connect(g);
    g.connect(this.rainBus);
    src.start();
    this.rainSource = src;
  }

  _startRoomTone() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 58;
    const g = ctx.createGain();
    g.gain.value = 0.028;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    osc.connect(g);
    g.connect(this.roomBus);
    osc.start();
    lfo.start();
    this.roomOsc = osc;
  }

  _startPads() {
    if (!this.ctx) return;
    this.stopPads();
    const ctx = this.ctx;
    const chord = CHORDS[this.scene] || CHORDS.shop;
    for (let i = 0; i < chord.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = chord[i];
      osc.detune.value = (i - 1) * 3.5;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420 + i * 90;
      filter.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.setTargetAtTime(0.026 / (i * 0.6 + 1), ctx.currentTime, 2.2);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.011;
      const lg = ctx.createGain();
      lg.gain.value = 0.01;
      lfo.connect(lg);
      lg.connect(g.gain);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.music);
      osc.start();
      lfo.start();
      this.padNodes.push({ osc, lfo, g, filter });
    }
  }

  stopPads() {
    for (const p of this.padNodes) {
      try {
        p.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.7);
        p.osc.stop(this.ctx.currentTime + 3);
        p.lfo.stop(this.ctx.currentTime + 3);
      } catch { /* already stopped */ }
    }
    this.padNodes = [];
  }

  _retunePads() {
    if (!this.ctx) return;
    // use the existing pads; gentle retune rather than restarting
    const chord = CHORDS[this.scene] || CHORDS.shop;
    const now = this.ctx.currentTime;
    this.padNodes.forEach((p, i) => {
      if (chord[i]) p.osc.frequency.setTargetAtTime(chord[i], now, 2.5);
    });
  }

  _scheduleNotes() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this._playSparseNote(), 7600);
    this.echoTimer = setInterval(() => {
      if (this.scene === 'clock' || this.scene === 'station') this.chime(0.04, 0.5);
    }, 15000);
  }

  _playSparseNote() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    if (Math.random() < 0.34) return;
    const scale = SCALES[this.scene] || SCALES.shop;
    const note = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.22 ? 2 : 1);
    this.note(note, { gain: 0.035 + Math.random() * 0.02, dur: 3.4 + Math.random() * 2.4 });
  }

  note(freq, { gain = 0.05, dur = 2.6, type = 'sine', when = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc.type = type;
    osc2.type = 'triangle';
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2.005;
    const g = ctx.createGain();
    const g2 = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(gain * 0.18, t + 0.015);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2600;
    osc.connect(filter); filter.connect(g); g.connect(this.music); g.connect(this.delay);
    osc2.connect(g2); g2.connect(this.music);
    osc.start(t); osc2.start(t);
    osc.stop(t + dur + 0.1); osc2.stop(t + dur + 0.1);
  }

  click() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400 + Math.random() * 500;
    bp.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t);
  }

  paper() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.28, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const fade = Math.sin((i / data.length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * fade * 0.7;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.035;
    src.connect(hp); hp.connect(g); g.connect(this.master);
    src.start(t);
  }

  chime(gain = 0.05, detune = 1) {
    if (!this.ctx) return;
    const base = this.scene === 'lighthouse' ? 392 : 523.25;
    this.note(base * detune, { gain, dur: 3.8, type: 'sine', when: 0 });
    this.note(base * 1.5 * detune, { gain: gain * 0.55, dur: 3.0, type: 'sine', when: 0.09 });
    this.note(base * 2 * detune, { gain: gain * 0.22, dur: 2.4, type: 'sine', when: 0.18 });
  }

  warm() {
    if (!this.ctx) return;
    this.note(midiHz(72), { gain: 0.045, dur: 2.2 });
    this.note(midiHz(76), { gain: 0.035, dur: 2.6, when: 0.06 });
    this.note(midiHz(79), { gain: 0.03, dur: 3.0, when: 0.12 });
  }

  thunder() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.8, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.995 + white * 0.005;
      data[i] = last * 22 * Math.pow(1 - i / data.length, 1.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.value = 0.14;
    src.connect(lp); lp.connect(g); g.connect(this.master);
    src.start(t);
  }

  door() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.35);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 300;
    bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    osc.connect(bp); bp.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + 0.5);
  }

  step(outdoor = false) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.stepToggle = 1 - this.stepToggle;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 5);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = outdoor ? 900 : 420;
    const g = ctx.createGain();
    g.gain.value = outdoor ? 0.022 : 0.014;
    src.connect(lp); lp.connect(g); g.connect(this.master);
    src.start(t);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.echoTimer) clearInterval(this.echoTimer);
    this.stopPads();
    try { this.rainSource?.stop(); } catch { /* noop */ }
    try { this.ctx?.close(); } catch { /* noop */ }
    this.ctx = null;
  }
}

export const sound = new SoundEngine();
