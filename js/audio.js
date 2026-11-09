/**
 * Synthesized Web Audio Module for MindSparks — Acoustic Glass & Marimba Edition
 * Generates organic, tactile, harmonic sounds without any external audio files.
 * Uses Acoustic Glass & Wooden Marimba synthesis based on window.AUDIO_CONFIG.
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.tabSoundEnabled = true;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Create a low-pass filter to smooth transients and emulate physical acoustic materials.
   */
  _createFilter(cutoff = 2400) {
    if (!this.ctx) return null;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    f.Q.value = 0.8;
    return f;
  }

  _connect(osc, gain, filter) {
    if (filter) {
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.ctx.destination);
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  setTabSoundEnabled(val) {
    this.tabSoundEnabled = !!val;
  }

  /**
   * 1. Soft Tactile Bubble Pop for tab transitions (320Hz -> 580Hz)
   */
  playTabWhoosh() {
    if (!this.enabled || !this.tabSoundEnabled) return;
    const cfg = window.AUDIO_CONFIG?.tabWhoosh || {
      waveType: 'sine', startFreq: 320, endFreq: 580, duration: 0.065, volume: 0.08
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this._createFilter(3000);

      osc.type = cfg.waveType || 'sine';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(cfg.volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);

      this._connect(osc, gain, filter);

      osc.start(now);
      osc.stop(now + cfg.duration + 0.01);

      // Warm acoustic body thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(140, now);
      thud.frequency.exponentialRampToValueAtTime(80, now + 0.035);
      thudGain.gain.setValueAtTime(cfg.volume * 0.45, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(now);
      thud.stop(now + 0.038);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * 2. Acoustic Glass Marimba Chord — Correct answer (E5 -> B5 -> E6)
   */
  playCorrect() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.correct || {
      waveType: 'sine', notes: [659.25, 987.77, 1318.5], staggerDelay: 0.06, duration: 0.24, volume: 0.12
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = cfg.notes || [659.25, 987.77, 1318.5];

      notes.forEach((freq, idx) => {
        const start = now + idx * (cfg.staggerDelay || 0.06);

        // Fundamental sine note
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(3600);

        osc.type = cfg.waveType || 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(cfg.volume, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + (cfg.duration || 0.24));

        this._connect(osc, gain, filter);
        osc.start(start);
        osc.stop(start + (cfg.duration || 0.24) + 0.02);

        // Subtly resonant harmonic overtone (triangle at 2x frequency)
        const harm = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(freq * 2, start);

        harmGain.gain.setValueAtTime(0.001, start);
        harmGain.gain.linearRampToValueAtTime(cfg.volume * 0.18, start + 0.006);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, start + (cfg.duration * 0.45));

        harm.connect(harmGain);
        harmGain.connect(this.ctx.destination);
        harm.start(start);
        harm.stop(start + (cfg.duration * 0.45) + 0.01);
      });
    } catch (e) {
      // Ignore
    }
  }

  /**
   * 3. Wooden Muted Double-Tap — Incorrect answer (220Hz -> 164.8Hz)
   */
  playIncorrect() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.incorrect || {
      waveType: 'triangle', notes: [220, 164.81], staggerDelay: 0.08, duration: 0.18, volume: 0.12
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = cfg.notes || [220, 164.81];

      notes.forEach((freq, idx) => {
        const start = now + idx * (cfg.staggerDelay || 0.08);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(600); // Warm wooden low-pass filter

        osc.type = cfg.waveType || 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.88, start + 0.09);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(cfg.volume, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.095);

        this._connect(osc, gain, filter);
        osc.start(start);
        osc.stop(start + 0.10);
      });
    } catch (e) {
      // Ignore
    }
  }

  /**
   * 4. Velvet Mechanical Card Snap / Tactile Tap (520Hz -> 960Hz)
   */
  playFlip() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.flip || {
      waveType: 'triangle', startFreq: 520, endFreq: 960, duration: 0.042, volume: 0.08
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this._createFilter(1600);

      osc.type = cfg.waveType || 'triangle';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(cfg.volume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);

      this._connect(osc, gain, filter);
      osc.start(now);
      osc.stop(now + cfg.duration + 0.01);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * 5. Glass Harp Major 9th Fanfare — Completion celebration
   */
  playFanfare() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.fanfare || {
      waveType: 'sine',
      melody: [
        { f: 523.25, t: 0.00, d: 0.22 },
        { f: 659.25, t: 0.07, d: 0.22 },
        { f: 783.99, t: 0.14, d: 0.24 },
        { f: 987.77, t: 0.21, d: 0.26 },
        { f: 1174.66, t: 0.28, d: 0.45 }
      ],
      volume: 0.13
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const melody = cfg.melody;

      melody.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(3200);

        osc.type = cfg.waveType || 'sine';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.001, now + note.t);
        gain.gain.linearRampToValueAtTime(cfg.volume, now + note.t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);

        this._connect(osc, gain, filter);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.02);
      });
    } catch (e) {
      // Ignore
    }
  }

  /**
   * 6. Glass Harp Arpeggio Major 9th — Perfect score chime
   */
  playBatteryCharged() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.batteryCharged || {
      waveType: 'sine',
      notes: [523.25, 659.25, 783.99, 987.77, 1174.66],
      staggerDelay: 0.06,
      duration: 0.45,
      volume: 0.13
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = cfg.notes || [523.25, 659.25, 783.99, 987.77, 1174.66];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(3200);

        osc.type = cfg.waveType || 'sine';
        const start = now + idx * (cfg.staggerDelay || 0.06);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(cfg.volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + (cfg.duration || 0.45));

        this._connect(osc, gain, filter);
        osc.start(start);
        osc.stop(start + (cfg.duration || 0.45) + 0.02);
      });
    } catch (e) {
      // Ignore
    }
  }
}

const sounds = new SoundEffects();
