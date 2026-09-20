/**
 * Synthesized Web Audio Module for MindSparks — Retro 8-bit Edition
 * Generates tactile, chiptune-style sounds without any external audio files.
 * All waveforms use config from window.AUDIO_CONFIG (js/audio-config.js).
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
   * Create a simple low-pass filter to slightly tame harsh square/sawtooth waves.
   * Sine/triangle pass through as-is.
   */
  _createFilter(waveType, cutoff = 2200) {
    if (!this.ctx) return null;
    if (waveType === 'square' || waveType === 'sawtooth') {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      f.Q.value = 0.7;
      return f;
    }
    return null;
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
   * Short pixel blip for tab transitions
   */
  playTabWhoosh() {
    if (!this.enabled || !this.tabSoundEnabled) return;
    const cfg = window.AUDIO_CONFIG?.tabWhoosh || {
      waveType: 'square', startFreq: 220, peakFreq: 440, endFreq: 330, duration: 0.12, volume: 0.10
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this._createFilter(cfg.waveType || 'square', 1800);

      osc.type = cfg.waveType || 'square';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.linearRampToValueAtTime(cfg.peakFreq || cfg.startFreq * 2, now + (cfg.duration * 0.4));
      osc.frequency.linearRampToValueAtTime(cfg.endFreq || cfg.startFreq, now + cfg.duration - 0.01);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(cfg.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);

      this._connect(osc, gain, filter);

      osc.start(now);
      osc.stop(now + cfg.duration + 0.01);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Retro "correct" chiptune — rising arpeggio
   */
  playCorrect() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.correct || {
      waveType: 'square', notes: [392, 523.25, 784], staggerDelay: 0.07, duration: 0.12, volume: 0.14
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = cfg.notes || [392, 523.25, 784];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(cfg.waveType || 'square', 2500);

        osc.type = cfg.waveType || 'square';
        const start = now + idx * (cfg.staggerDelay || 0.07);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(cfg.volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + (cfg.duration || 0.12));

        this._connect(osc, gain, filter);

        osc.start(start);
        osc.stop(start + (cfg.duration || 0.12) + 0.02);
      });
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Retro "incorrect" buzzer — falling pitch
   */
  playIncorrect() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.incorrect || {
      waveType: 'square', startFreq: 220, endFreq: 98, duration: 0.22, volume: 0.14
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this._createFilter(cfg.waveType || 'square', 1400);

      osc.type = cfg.waveType || 'square';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + (cfg.duration - 0.04));

      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

      this._connect(osc, gain, filter);

      osc.start(now);
      osc.stop(now + cfg.duration + 0.02);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Short pixel click for card flips / button presses
   */
  playFlip() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.flip || {
      waveType: 'square', startFreq: 660, endFreq: 880, duration: 0.06, volume: 0.08
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this._createFilter(cfg.waveType || 'square', 3000);

      osc.type = cfg.waveType || 'square';
      osc.frequency.setValueAtTime(cfg.startFreq, now);
      osc.frequency.linearRampToValueAtTime(cfg.endFreq, now + cfg.duration);

      gain.gain.setValueAtTime(cfg.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

      this._connect(osc, gain, filter);

      osc.start(now);
      osc.stop(now + cfg.duration + 0.01);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Chiptune fanfare — ascending melody like an old game win screen
   */
  playFanfare() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.fanfare || {
      waveType: 'square',
      melody: [
        { f: 262,  t: 0.00, d: 0.10 },
        { f: 330,  t: 0.10, d: 0.10 },
        { f: 392,  t: 0.20, d: 0.10 },
        { f: 523,  t: 0.30, d: 0.10 },
        { f: 659,  t: 0.40, d: 0.10 },
        { f: 784,  t: 0.50, d: 0.32 }
      ],
      volume: 0.14
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
        const filter = this._createFilter(cfg.waveType || 'square', 2800);

        osc.type = cfg.waveType || 'square';
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
   * Retro 8-bit arpeggio chime for perfect score / battery fully charged
   */
  playBatteryCharged() {
    if (!this.enabled) return;
    const cfg = window.AUDIO_CONFIG?.batteryCharged || {
      waveType: 'square', notes: [330, 392, 494, 659], staggerDelay: 0.07, duration: 0.10, volume: 0.13
    };
    if (cfg.enabled === false) return;

    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = cfg.notes || [330, 392, 494, 659];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this._createFilter(cfg.waveType || 'square', 2500);

        osc.type = cfg.waveType || 'square';
        const start = now + idx * (cfg.staggerDelay || 0.07);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(cfg.volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + (cfg.duration || 0.10));

        this._connect(osc, gain, filter);

        osc.start(start);
        osc.stop(start + (cfg.duration || 0.10) + 0.02);
      });
    } catch (e) {
      // Ignore
    }
  }
}

const sounds = new SoundEffects();
