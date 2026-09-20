/**
 * ==========================================================================
 * MINDSARKS - CẤU HÌNH THAM SỐ ÂM THANH RETRO 8-BIT (AUDIO CONFIG)
 * 
 * HƯỚNG DẪN TỰ TÙY BIẾN CHO BẠN:
 * - Ứng dụng tự động tổng hợp âm thanh bằng Web Audio API (không cần file mp3 ngoài).
 * - Bạn có thể tùy ý sửa tần số (Hz), thời lượng (giây), âm lượng hoặc dạng sóng:
 *   + waveType: 'square'  (sóng vuông giống game 8-bit cổ điển, sắc nét, retro)
 *               'triangle' (sóng tam giác, mềm hơn nhưng vẫn retro)
 *               'sine'    (sóng sin êm ái, hiện đại hơn)
 *               'sawtooth' (sóng răng cưa, sắc bén, mạnh mẽ)
 *   + volume: từ 0.01 (rất nhỏ) đến 1.0 (to nhất). Gợi ý: giữ <= 0.25.
 *   + duration: thời gian kêu tính bằng giây (VD: 0.15 là 150 mili-giây)
 * ==========================================================================
 */

window.AUDIO_CONFIG = {
  // 1. ÂM THANH CHUYỂN TAB (Pixel Zap / Blip ngắn)
  tabWhoosh: {
    enabled: true,
    waveType: 'square',    // Sóng vuông retro 8-bit
    startFreq: 220,        // Tần số nốt mở đầu (A3)
    peakFreq: 440,         // Tần số đỉnh (A4)
    endFreq: 330,          // Tần số kết thúc (E4)
    duration: 0.12,        // 120ms — nhanh gọn như game chuyển màn
    volume: 0.10           // Âm lượng dịu nhẹ
  },

  // 2. ÂM THANH TRẢ LỜI ĐÚNG (Chiptune "Level Up" vui tươi — 3 nốt nảy lên)
  correct: {
    enabled: true,
    waveType: 'square',    // Sóng vuông 8-bit game
    notes: [392, 523.25, 784],  // Sol4, Đô5, Sol5 — hợp âm "đúng rồi!" retro
    staggerDelay: 0.07,    // Độ trễ giữa các nốt
    duration: 0.12,        // Mỗi nốt kêu 120ms
    volume: 0.14
  },

  // 3. ÂM THANH TRẢ LỜI SAI (Buzzer retro — nốt trầm đổ xuống)
  incorrect: {
    enabled: true,
    waveType: 'square',    // Sóng vuông — tiếng "BZZZ" game 8-bit
    startFreq: 220,        // A3
    endFreq: 98,           // G2 — trầm xuống rõ ràng
    duration: 0.22,        // 220ms
    volume: 0.14
  },

  // 4. ÂM THANH LẬT THẺ / BẤM PHÍM (Pixel Click ngắn)
  flip: {
    enabled: true,
    waveType: 'square',    // Tiếng "click" pixel gọn
    startFreq: 660,
    endFreq: 880,
    duration: 0.06,        // Cực nhanh, 60ms
    volume: 0.08
  },

  // 5. ÂM THANH HOÀN THÀNH BÀI THI (Chiptune Fanfare 8-bit khải hoàn!)
  fanfare: {
    enabled: true,
    waveType: 'square',    // Sóng vuông — kiểu âm nhạc game NES/SNES
    melody: [
      { f: 262,  t: 0.00, d: 0.10 }, // Đô4
      { f: 330,  t: 0.10, d: 0.10 }, // Mi4
      { f: 392,  t: 0.20, d: 0.10 }, // Sol4
      { f: 523,  t: 0.30, d: 0.10 }, // Đô5
      { f: 659,  t: 0.40, d: 0.10 }, // Mi5
      { f: 784,  t: 0.50, d: 0.32 }  // Sol5 — nốt kết dài
    ],
    volume: 0.14
  },

  // 6. ÂM THANH ĐIỂM SỐ HOÀN HẢO 100% (Pixel Power Up!)
  batteryCharged: {
    enabled: true,
    waveType: 'square',    // Sóng vuông retro 8-bit hoài cổ
    notes: [330, 392, 494, 659],  // Mi4, Sol4, Si4, Mi5 — arpeggio lên
    staggerDelay: 0.07,
    duration: 0.10,
    volume: 0.13
  }
};
