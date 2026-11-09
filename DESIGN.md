---
name: TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Liquid Glass, 6 Standard Token Groups, HUD Capsule, 360° 3D Card Flip, Dual Mode 5 & SM-2 Mastery Spectrum, Universal Monochrome SVG Icons & Zero Unicode Emoji Policy (Phase 1g)
themes:
  violet-rose:
    label: "Tím Hồng (Violet Rose - Default)"
    base: "#0c0916"
    accent: "#c084fc"
    accentSecondary: "#f472b6"
    btnPrimaryBg: "#c084fc"
    btnPrimaryText: "#0d0b14"
    wallpaper: "./backgrounds/bg-2.webp"
  monochrome:
    label: "Trắng Đen (Monochrome - Pure Noir B&W)"
    base: "#09090b"
    accent: "#ffffff"
    accentSecondary: "#e4e4e7"
    btnPrimaryBg: "#ffffff"
    btnPrimaryText: "#09090b"
    wallpaper: "./backgrounds/bg-noir-mono.webp"
  white-orange:
    label: "Trắng Cam Liquid Glass (White Orange Claude UI)"
    base: "#fff7ed"
    accent: "#ea580c"
    accentSecondary: "#c2410c"
    btnPrimaryBg: "#ea580c"
    btnPrimaryText: "#ffffff"
    wallpaper: "./backgrounds/bg-white-orange.webp"
typography:
  posterDisplay:
    fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Arial Black', sans-serif"
    fontSize: "clamp(2.6rem, 6.2vw, 4.8rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.035em"
    strokeWidth: "1.1px"
  quoteSerifWhiteOrange:
    fontFamily: "'Merriweather', 'Lora', 'Newsreader', Georgia, serif"
    fontStyle: "normal"
    fontWeight: 700
    letterSpacing: "-0.02em"
  quoteAccentWhiteOrange:
    fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif"
    fontStyle: "italic"
    fontWeight: 400
    letterSpacing: "-0.02em"
  quoteAccentClaude:
    fontFamily: "'Instrument Serif', 'Playfair Display', 'Caveat', Georgia, serif"
    fontStyle: "italic"
    fontWeight: 600
    fontSize: "1.14em"
  headline:
    fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 2.2vw + 0.8rem, 2rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif"
    fontSize: "clamp(0.92rem, 0.4vw + 0.8rem, 1rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.015em"
  code:
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  card: "24px"
  sidebar: "28px"
  hud: "999px"
  bottomNav: "32px"
  full: "9999px"
---

# TinhMinhLaKey Design System (Đợt 1g)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

**TinhMinhLaKey** là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1g**, toàn bộ hệ thống giao diện, hiệu năng và tương tác được hoàn thiện sâu:
- **Zero Unicode Emoji Policy**: Quét sạch 100% ký tự emoji màu (`\p{Extended_Pictographic}`) khỏi `index.html` và `js/app.js`, duy trì kết quả kiểm toán 0 emoji thông qua script `scripts/sanitize-1g.js`. Mọi biểu tượng chức năng (Quiz toolbar, bookmark, flag, toast, modal, completion banner) đều dùng SVG đơn sắc (`stroke="currentColor" fill="none"`).
- **Hệ Thống Token Trung Tâm Cho Toàn Bộ Component**: Gom Card, Modal, Dropdown, Scrollbar, Toast, Session Restore Banner, Mobile Bottom Nav về hệ biến trung tâm trong `css/theme.css`. Khắc phục hoàn toàn lỗi chữ dropdown mờ, đồng bộ scrollbar thumb và toast notification theo theme.
- **Xóa Bỏ "Màu Nhận Diện" (Vibe Swatches) Trong Modal Môn Học**: Loại bỏ hoàn toàn hộp màu `<input type="color">` và ô xem trước emoji, quy về lưới 20 icon SVG đơn sắc thanh lịch, tối giản.
- **Frosted Liquid Glass Modals**: Tái thiết kế toàn bộ modal box sang hiệu ứng kính mờ chất lỏng (`backdrop-filter: blur(28px) saturate(180%)`), gỡ bỏ blur nặng trên `.modal-overlay` (`backdrop-filter: none !important`), xóa bỏ màu nền cứng trên modal footer và danh sách gán thẻ.
- **Interactive Glass Tile Matrix (Dashboard Hero)**: Lưới ô kính phản chiếu tương tác đa chiều trên Hero Quote (`.hero-glass-matrix-layer`), đón ánh sáng spotlight di chuyển theo con trỏ chuột (`--mx`, `--my`) với hiệu năng GPU tối ưu (>140 FPS).
- **Tối Ưu Chế Độ 5 ("Ôn theo môn học & chương")**: Tái cấu trúc `#modal-topic-picker` và phương thức `db.getCardsByTopics` hỗ trợ `subjectId`, điều khiển thông qua `dataset.topicVal` và event delegation mượt mà.
- **Hoàn Thiện Mode Trắng Cam (`white-orange`)**: Kiểu chữ Quote Serif thẳng đứng phẳng phiu (`Merriweather` / `Lora`, `font-style: normal !important`) không cong móc; các thẻ Bento và Chế độ học áp dụng Smoked Frosted Glass ở trạng thái nghỉ (`rgba(34, 27, 22, 0.72)` + blur 22px), chuyển sang độ trong suốt thanh thoát khi hover kèm ánh cam tinh tế.

---

## 2. Kiến Trúc Token Trung Tâm Trong `css/theme.css`

Mỗi Theme được quản lý đầy đủ các nhóm token:
1. **Surfaces & Glass**: `--bg-base`, `--bg-surface-1`, `--bg-surface-2`, `--bg-elevated`, `--bg-glass-liquid`, `--bg-glass-hud`.
2. **Typography**: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent`.
3. **Accents & Buttons**: `--accent`, `--accent-strong`, `--accent-soft`, `--accent-border`, `--accent-glow`, `--btn-primary-bg`, `--btn-primary-text`, `--btn-primary-hover-bg`, `--btn-secondary-bg`, `--btn-secondary-text`, `--btn-secondary-border`, `--btn-secondary-hover-bg`.
4. **Cards & Spotlight**: `--card-border`, `--card-hover-border`, `--card-hover-bg`, `--card-spotlight`, `--card-shadow`.
5. **Dropdown System**: `--dropdown-bg`, `--dropdown-menu-bg`, `--dropdown-border`, `--dropdown-item-hover-bg`, `--dropdown-item-active-bg`, `--dropdown-item-active-text`.
6. **Subject Badges & Pills**: `--subject-pill-bg`, `--subject-pill-text`, `--subject-pill-border`, `--subject-pill-active-bg`, `--subject-pill-active-text`.
7. **Energy Charge Battery**: `--battery-box-bg`, `--battery-box-border`, `--battery-box-glow`, `--battery-segment-bg`, `--battery-segment-active-bg`, `--battery-segment-active-glow`, `--battery-label-color`, `--battery-badge-color`.

---

## 3. Quy Chuẩn Kỹ Thuật Nghiệm Thu (Quality Floor)

- **Backdrop-Filter Budget**: Chỉ duy trì blur trên các thành phần cố định (`.app-sidebar`, `.topbar-hud-capsule`, `.modal-box`).
- **Layout Stability**: 0px Layout Shift khi chuyển câu hỏi, mở dropdown hoặc lật thẻ.
- **Hiệu năng chuyển động**: 100% animation chạy trên compositor (`transform`, `opacity`), đạt chuẩn 144Hz mượt mà.
- **Bảo toàn dữ liệu**: Database `MindSparksQuizDB` và sao lưu JSON toàn vẹn 100%.
- **Tương thích toàn diện**: Vượt qua 100% bài test tự động (`npm test`: 283/283 passed, round 37/39/40 passed) và build production (`npm run build`: 100% success).
