---
name: TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Liquid Glass, 6 Standard Token Groups, HUD Capsule, 360° 3D Card Flip, Dual Mode 5 & SM-2 Mastery Spectrum (Phase 1e)
themes:
  violet-rose:
    label: "Tím Hồng (Violet Rose - Default)"
    base: "#0c0916"
    accent: "#b388ff"
    accentSecondary: "#f472b6"
    btnPrimaryBg: "#d8b4fe"
    btnPrimaryText: "#140e24"
    wallpaper: "./backgrounds/bg-2.webp"
  monochrome:
    label: "Trắng Đen (Monochrome - Pure Noir B&W)"
    base: "#050505"
    accent: "#ffffff"
    accentSecondary: "#d4d4d4"
    btnPrimaryBg: "#ffffff"
    btnPrimaryText: "#000000"
    wallpaper: "./backgrounds/bg-noir-mono.webp"
  white-orange:
    label: "Trắng Cam Liquid Glass (White Orange Claude UI)"
    base: "#f8f4ef"
    accent: "#ea580c"
    accentSecondary: "#f97316"
    btnPrimaryBg: "#f97316"
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

# TinhMinhLaKey Design System (Đợt 1e)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

**TinhMinhLaKey** là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1e**, toàn bộ hệ thống giao diện, hiệu năng và tương tác được quy hoạch bài bản theo 5 Phase chuẩn công nghiệp:
- **Quy Hoạch 6 Nhóm Token Tập Trung**: Gom 100% biến màu, bề mặt kính, viền khúc xạ và tương tác về 6 nhóm biến chuẩn tại `css/theme.css` cho cả 3 chế độ (`violet-rose`, `monochrome`, `white-orange`). Xóa sạch 100% mã màu tím/đen gắn cứng trong CSS và inline HTML.
- **19 Quy Tắc Chống AI Slop & Hệ Thống SVG Đơn Sắc**: Xóa toàn bộ các badge terminal rườm rà (`MODE // 01`, `REF//MS-...`, `ADAPTIVE`), thay thế toàn bộ emoji màu bằng Inline SVG đường nét thanh mảnh (`stroke="currentColor"`), kích hoạt `tabular-nums` cho mọi con số và hỗ trợ cú pháp in đậm markdown `**bold**` trong công thức LaTeX.
- **Hợp Nhất Component `.deck-card`**: Dùng chung một hàm dựng HTML chuẩn (`_createDeckCardHtml`) cho cả Trang chủ và Thư viện thẻ, nút bấm đơn sắc đầm chắc không icon thừa.
- **Topbar HUD Capsule & Icon Morph Animation**: Gộp bộ chọn 3 theme và chuỗi ngày học thành một viên nang kính mờ (`.topbar-hud-capsule`) ở thanh Top Utility Row không bao giờ che khuất nội dung trang; nút chuyển theme có hiệu ứng trượt trơn chu kèm hoạt ảnh Morphing icon xoay co giãn tâm.
- **Liquid Glass Sidebar (Ảnh 8/9)**: Cấu trúc kính khúc xạ viền specular sáng; cột icon 44px đứng yên tuyệt đối; nhãn chuyển động trượt mờ không tràn viền; thanh active phát sáng sát mép trái 3.5px.
- **360° 3D Card Flip**: Lật thẻ không gian 3 chiều với `perspective: 1600px`, nhấc thẻ trục Z mượt mà (`flashcardArcLift`) và chuyển tiếp vòng xoay thẻ tức thì.
- **Chế Độ 5: Ôn theo Môn & Chương (Dual Picker)**: Modal chọn kép thông minh với Phần 1 (Chọn môn học / Ôn cả môn) và Phần 2 (Lọc & chọn nhiều chương). AI Prompt bắt buộc phân loại trường `topic` theo cấp độ Chương (`Chương 1: ...`, `Chương 2: ...`).
- **Khối Phân Bố Cấp Độ Ghi Nhớ SM-2**: Thanh Phổ Trí Nhớ Tổng Thể (Mastery Spectrum Bar) 14px chia 4 đoạn tỷ lệ % trực quan và 4 thẻ cấp độ lớn đẳng cấp (`clamp(2.0rem, 3.2vw, 2.75rem)`).
- **144+ FPS Jank-Free Deck Library**: Loại bỏ `backdrop-filter` lặp trên từng card con; dùng Optical Liquid Glass Surface; áp dụng `content-visibility: auto` cho danh sách môn và ngân hàng câu hỏi.
- **Chuẩn Hóa Tương Phản Mode Trắng Cam**: Chữ Nâu Đen Espresso `#1c1410`, Cam Đậm `#c2410c`, Xanh Rừng Đậm `#064e3b`, Đỏ Đậm `#7f1d1d` sắc nét tuyệt đối trên nền kính sáng.

---

## 2. Kiến Trúc 6 Nhóm Token Trong `css/theme.css`

Mỗi Theme được phân vùng chính xác theo 6 nhóm thuộc tính:
1. **Nhóm 1 — Bề Mặt Kính Khúc Xạ (Surfaces & Glass)**: `--bg-base`, `--surface-card`, `--surface-card-hover`, `--surface-elevated`, `--surface-header`, `--surface-dropdown`, `--surface-dropdown-menu`, `--surface-sidebar`, `--surface-hud`, `--glass-border`, `--glass-border-strong`, `--glass-highlight`, `--glass-specular`.
2. **Nhóm 2 — Màu Chữ & Phân Cấp Nội Dung (Typography & Contrast)**: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent`.
3. **Nhóm 3 — Điểm Nhấn Nhận Diện & Nút Bấm Đơn Sắc (Accents & Solid Tonal Buttons)**: `--accent`, `--accent-strong`, `--accent-primary`, `--accent-secondary`, `--accent-glow`, `--accent-subtle-bg`, `--accent-border`, `--brand-gradient`, `--btn-primary-bg`, `--btn-primary-text`, `--btn-primary-hover`, `--btn-secondary-bg`, `--btn-secondary-text`, `--btn-secondary-border`, `--progress-track-bg`, `--progress-fill-bg`.
4. **Nhóm 4 — Đèn Rọi & Đổ Bóng Tương Tác (Spotlights & Shadows)**: `--spotlight-primary`, `--spotlight-secondary`, `--card-hover-border`, `--card-hover-shadow`.
5. **Nhóm 5 — Trạng Thái Lựa Chọn Quiz & Flashcard (Options & Feedback States)**: `--option-bg`, `--option-border`, `--option-text`, `--option-letter`, `--option-correct-bg`, `--option-correct-border`, `--option-correct-text`, `--option-wrong-bg`, `--option-wrong-border`, `--option-wrong-text`.
6. **Nhóm 6 — Chuỗi Ngày Học & Đoạn Phổ SM-2 (Streak & SRS Palette)**: Đồng bộ màu sắc các trạng thái Thẻ Mới, Đang học, Đang ôn tập, Đã thành thạo.

---

## 3. Quy Chuẩn Kỹ Thuật Nghiệm Thu (Quality Floor)

- **Backdrop-Filter Budget**: Chỉ duy trì hiệu ứng blur trên tối đa 3 phần tử cố định (`.app-sidebar`, `.topbar-hud-capsule` / `.bottom-nav`, `.hero-card` / `.modal-box`). Mọi card lặp (`.deck-card`, `.subject-group`, `.bank-card-item`) dùng Optical Liquid Glass Surface không tốn GPU.
- **Layout Stability**: 0px Layout Shift khi chuyển câu hỏi, mở dropdown hoặc lật thẻ 360°.
- **Hiệu năng chuyển động**: 100% animation chạy trên compositor (`transform`, `opacity`), đạt chuẩn 144Hz mượt mà.
- **Bảo toàn dữ liệu**: Database `MindSparksQuizDB` và sao lưu JSON toàn vẹn 100%.
- **Tương thích toàn diện**: Vượt qua 100% bài test tự động (`npm test`: 283/283 passed) và build production (`npm run build`: 100% success).
