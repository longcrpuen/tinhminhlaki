---
name: TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Liquid Glass, 6 Standard Token Groups, HUD Capsule, 360° 3D Card Flip, Dual Mode 5 & SM-2 Mastery Spectrum, Universal Monochrome SVG Icons & Zero Hardcoded Purple (Phase 1f)
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
    fontFamily: "'Playfair Display', 'Newsreader', Georgia, serif"
    fontWeight: 700
    letterSpacing: "-0.035em"
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

# TinhMinhLaKey Design System (Đợt 1f)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

**TinhMinhLaKey** là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1f**, toàn bộ hệ thống giao diện, hiệu năng và tương tác được hoàn thiện sâu:
- **Zero Hardcoded Purple Tokens**: Quét sạch 100% mã màu tím viết cứng (`#8b5cf6`, `#7c3aed`, `#a78bfa`, `#131122`, `#12101e`, `rgba(36, 29, 58, ...)`, `rgba(124, 58, 237, ...)`) trong `css/style.css` và `js/app.js`, quy tụ toàn bộ về hệ biến trung tâm trong `css/theme.css`.
- **Hệ Thống SVG Đơn Sắc Toàn Diện (`App.getMonoSvg` & `App.renderSubjectIcon`)**: Xóa bỏ hoàn toàn emoji màu ra khỏi DOM. Tất cả icon môn học (kể cả icon lưu trong DB như `📚`, `🥀`, `📁`), bộ lọc Ngân hàng câu hỏi, Modal tạo môn học và Modal hoàn tất buổi học đều chuyển sang Inline SVG đơn sắc (`stroke="currentColor"`).
- **Đồng Bộ Nút Sidebar & 44px Uniform Pill Animation**: Xóa bỏ badge thông báo gây giãn nút "Tổng quan", loại bỏ xung đột pseudo-element `::before`, chuyển toàn bộ 7 nút Sidebar sang hiệu ứng 1 pill bo tròn mượt mà 44px.
- **Thanh Pin Năng Lượng Đa Theme (`--battery-*`)**: Hiển thị trắng/xám matte ở Trắng Đen, nền kem sáng ấm + vạch pin cam `#ea580c` ở Trắng Cam; xóa sạch hộp đen viền xanh neon `#00f5d4` và chữ hồng `#e879f9`.
- **Thứ Tự Bố Cục Dashboard & Khôi Phục Chế Độ 5**: Đẩy khối 7 Chế Độ Ôn Tập Thông Minh lên ngay dưới màn hình Hero Quote, trước khối Bộ câu hỏi; sửa dứt điểm hàm `openTopicPickerModal()` và `startTopicSession()` cho Chế độ 5 ("5. Ôn theo môn học & chương").
- **Liquid Glass Popups & Topbar HUD**: Toàn bộ `.modal-box` sử dụng `var(--bg-glass-liquid)` kèm `backdrop-filter: blur(28px) saturate(160%)`; `.topbar-hud-capsule` áp dụng `var(--bg-glass-hud)` kèm `backdrop-filter: blur(20px)`; nút chuyển câu trên Mobile đơn sắc theo theme.
- **Tương Phản Nghỉ & Typography Serif Cho Mode Trắng Cam**: Thẻ `.deck-card`, `.mode-card`, `.study-mode-card` có viền cam nhạt `1.5px solid rgba(234, 88, 12, 0.28)` và bóng đổ ấm ngay ở trạng thái nghỉ; Quote Hero dùng Serif dày (`Playfair Display`, `font-weight: 700; letter-spacing: -0.035em`) cho chữ thường và bỏ in đậm (`font-weight: 400; font-style: italic`) cho chữ nghiêng điểm nhấn.

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
