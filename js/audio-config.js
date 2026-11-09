/**
 * ==========================================================================
 * MINDSARKS - CẤU HÌNH THAM SỐ ÂM THANH ACOUSTIC GLASS & WOODEN MARIMBA
 * ==========================================================================
 * 
 * Hệ thống âm thanh tổng hợp trực tiếp bằng Web Audio API:
 * - Acoustic Glass & Wooden Marimba Harmonic Synthesis (sine + triangle)
 * - Âm sắc sang trọng, hiện đại, êm dịu theo phong cách Apple iOS / Duolingo
 * ==========================================================================
 */

window.AUDIO_CONFIG = {
  // 1. ÂM THANH CHUYỂN TAB (Soft Tactile Bubble Pop: 320Hz -> 580Hz)
  tabWhoosh: {
    enabled: true,
    waveType: 'sine',
    startFreq: 320,
    endFreq: 580,
    duration: 0.065,
    volume: 0.08
  },

  // 2. ÂM THANH TRẢ LỜI ĐÚNG (Acoustic Glass Marimba Chord: E5 -> B5 -> E6)
  correct: {
    enabled: true,
    waveType: 'sine',
    notes: [659.25, 987.77, 1318.5],
    staggerDelay: 0.06,
    duration: 0.24,
    volume: 0.12
  },

  // 3. ÂM THANH TRẢ LỜI SAI (Wooden Muted Double-Tap: 220Hz -> 164.8Hz)
  incorrect: {
    enabled: true,
    waveType: 'triangle',
    notes: [220, 164.81],
    staggerDelay: 0.08,
    duration: 0.18,
    volume: 0.12
  },

  // 4. ÂM THANH LẬT THẺ / BẤM PHÍM (Velvet Mechanical Card Snap: 520Hz -> 960Hz)
  flip: {
    enabled: true,
    waveType: 'triangle',
    startFreq: 520,
    endFreq: 960,
    duration: 0.042,
    volume: 0.08
  },

  // 5. ÂM THANH HOÀN THÀNH BÀI THI (Glass Harp Major 9th Fanfare: C5 - E5 - G5 - B5 - D6)
  fanfare: {
    enabled: true,
    waveType: 'sine',
    melody: [
      { f: 523.25, t: 0.00, d: 0.22 }, // C5
      { f: 659.25, t: 0.07, d: 0.22 }, // E5
      { f: 783.99, t: 0.14, d: 0.24 }, // G5
      { f: 987.77, t: 0.21, d: 0.26 }, // B5
      { f: 1174.66, t: 0.28, d: 0.45 }  // D6 (Major 9th chime)
    ],
    volume: 0.13
  },

  // 6. ÂM THANH ĐIỂM SỐ HOÀN HẢO 100% (Glass Harp Arpeggio Major 9th)
  batteryCharged: {
    enabled: true,
    waveType: 'sine',
    notes: [523.25, 659.25, 783.99, 987.77, 1174.66],
    staggerDelay: 0.06,
    duration: 0.45,
    volume: 0.13
  }
};
