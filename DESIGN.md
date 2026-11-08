---
name: TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Liquid Glass, Claude UI Italic Serif, Monochrome Icon System & 3-Theme Architecture (Phase 1d)
themes:
  violet-rose:
    label: "Tím Hồng (Violet Rose - Default)"
    base: "#0b0816"
    accent: "#b388ff"
    accentSecondary: "#f472b6"
    btnPrimaryBg: "#d8b4fe"
    btnPrimaryText: "#140e24"
    wallpaper: "./backgrounds/bg-2.webp"
  monochrome:
    label: "Trắng Đen (Monochrome - Pure Noir B&W)"
    base: "#050505"
    accent: "#ffffff"
    accentSecondary: "#e5e5e5"
    btnPrimaryBg: "#ffffff"
    btnPrimaryText: "#000000"
    wallpaper: "./backgrounds/bg-noir-mono.webp"
  white-orange:
    label: "Trắng Cam Liquid Glass (White Orange Claude UI)"
    base: "#f7f3ee"
    accent: "#ea580c"
    accentSecondary: "#f97316"
    btnPrimaryBg: "rgba(249, 115, 22, 0.92)"
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
  bottomNav: "32px"
  full: "9999px"
---

# TinhMinhLaKey Design System (Đợt 1d)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

**TinhMinhLaKey** là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1d**, toàn bộ ngôn ngữ thiết kế và trải nghiệm tương tác đạt đến độ hoàn thiện sâu:
- **Topbar Tối Giản Nổi Gọn**: Bỏ dải băng nền tối choán đỉnh màn hình, ẩn `.topbar-left`, chuyển bộ chọn 3 theme góc phải thành viên nang 3 Nút Icon tinh tế (`34px × 34px`).
- **Khung Quote Hero Thanh Thoát**: Xóa bỏ hoàn toàn các tag kỹ thuật dư thừa (`SYSTEM // SM-2 ACTIVE`, `OFFLINE PWA`), xóa nút đổi cảm hứng lặp lại, biến Quote thành một tác phẩm nghệ thuật truyền cảm hứng thuần khiết.
- **Tổ Hợp Icon & Emoji Đơn Sắc (Monochrome Icon System)**: Áp bộ lọc CSS thông minh (`filter: grayscale(...)`) thích ứng 100% theo từng Theme, triệt tiêu hiện tượng lệch màu của emoji hệ điều hành.
- **Sidebar Kính Mờ Chuẩn Mẫu**: Đóng/mở 2 chiều mượt mà 260ms bằng cách click trực tiếp vào icon chú mèo mascot (`meo.png`), ẩn nút mũi tên ngang thừa, cấu trúc vòng tròn và viên nang kính mờ chuẩn mực.
- **Quick-Jump Subject Bar & Căn Chỉnh Hàng Nút**: Bổ sung thanh nhảy nhanh môn học ở Thư viện thẻ và căn chỉnh thẳng hàng cụm nút hành động tại Ngân hàng câu hỏi.
- **Flashcard 120FPS Jank-Free Engine**: Giữ chỗ cố định 0px layout shift cho thanh đánh giá SRS, chuyển câu tức thì < 16ms nhờ ghi dữ liệu nền không chặn UI.
- **Chế Độ Trắng Cam 3D Liquid Glass & Claude UI**: Bề mặt kính lỏng trong suốt, đổ bóng 3D tinh tế, từ khóa Quote viết nghiêng nghệ thuật phong cách Claude UI (`Instrument Serif`), độ tương phản chữ đạt chuẩn tối đa.
- **Tối Ưu Mobile Ergonomics**: Hạ thấp độ nhô của icon active trên thanh Bottom Nav, chống cản trở thao tác chạm.

---

## 2. Kiến Trúc 3 Chế Độ Theme (3-Theme Token Architecture)

Điều phối tập trung 100% tại `css/theme.css` thông qua thuộc tính `data-theme` trên thẻ `<html>` và `<body>`:

### 2.1. Theme Tím Hồng (`violet-rose` — Mặc Định)
- **Tông màu**: Tím Amethyst `#b388ff`, Hồng Orchid `#f472b6`, Nền sâu `#0b0816`.
- **Khung Quote**: Nền kính trong suốt `rgba(20, 15, 36, 0.44)` kết hợp `backdrop-filter: blur(16px)` làm hiện rõ hình nền.
- **Hình nền mặc định**: `./backgrounds/bg-2.webp`.
- **Nút bấm**: Solid Tonal Pill tím pastel `#d8b4fe` chữ đen đậm `#140e24`.

### 2.2. Theme Trắng Đen (`monochrome` — Noir B&W)
- **Tông màu**: Trắng `#ffffff`, Đen Noir `#050505`, Xám khói `#171717`.
- **Sidebar & Card**: Kính mờ trong suốt `rgba(12, 12, 12, 0.40)` thấy rõ hình nền `bg-noir-mono.webp`.
- **Triệt tiêu ánh tím**: Không còn bất kỳ mã màu tím nào; spotlight và hover dùng biến theme sáng bạc `rgba(255, 255, 255, 0.14)`.
- **Nút bấm**: Nút chính trắng sáng `#ffffff` chữ đen than `#000000`, nút phụ đen nhám viền xám mờ.

### 2.3. Theme Trắng Cam (`white-orange` — 3D Liquid Glass)
- **Tông màu**: Nền kem ấm `#f7f3ee`, Cam tươi `#f97316`, Cam đậm `#ea580c`, Chữ đen nâu `#181512`.
- **Bề mặt 3D Liquid Glass**: Kính lỏng xuyên thấu `linear-gradient(135deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 248, 240, 0.28) 100%)` kết hợp `backdrop-filter: blur(22px) saturate(160%)`.
- **Từ khóa Quote (.hero-title-accent)**: Font nghệ thuật nghiêng kiểu Claude UI (`Instrument Serif`, `Playfair Display Italic`).
- **Tương phản rõ nét**: Toàn bộ chữ trong Quiz, 4 nút SRS Lật thẻ, Flashcard front/back và Dropdown đều dùng tông tương phản cao trên nền sáng, không còn chữ chìm.
- **Hình nền mặc định**: `./backgrounds/bg-white-orange.webp`.

---

## 3. Quy Chuẩn Kỹ Thuật Nghiệm Thu (Quality Floor)

- **Layout Stability**: 0px Layout Shift khi lật thẻ hoặc tương tác Dropdown.
- **Hiệu năng chuyển động**: 100% animation chạy trên compositor (`transform`, `opacity`), đạt chuẩn 120Hz mượt mà.
- **Bảo toàn dữ liệu**: Kết nối IndexedDB `MindSparksQuizDB` và cơ chế sao lưu `tinhminhlakey-backup-*.json` hoạt động bền vững.
- **Tương thích toàn diện**: Vượt qua 100% bài test tự động (`npm test`) và build production (`npm run build`).
