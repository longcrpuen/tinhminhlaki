---
name: MindSparks / TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Editorial Inspirational Stage & 3-Theme Architecture (Phase 1c)
themes:
  violet-rose:
    label: "Tím Hồng (Violet Rose - Default)"
    base: "#0e0b18"
    accent: "#b388ff"
    accentSecondary: "#f472b6"
    btnPrimaryBg: "#d8b4fe"
    btnPrimaryText: "#140e24"
    wallpaper: "./backgrounds/bg-pixel-meadow.webp"
  monochrome:
    label: "Trắng Đen (Monochrome - Pure Noir B&W)"
    base: "#050505"
    accent: "#ffffff"
    accentSecondary: "#e5e5e5"
    btnPrimaryBg: "#ffffff"
    btnPrimaryText: "#000000"
    wallpaper: "./backgrounds/bg-noir-mono.webp"
  white-orange:
    label: "Trắng Cam (White Orange - Warm Daylight Orange)"
    base: "#faf7f2"
    accent: "#f97316"
    accentSecondary: "#ea580c"
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

# MindSparks / TinhMinhLaKey Design System (Đợt 1c)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

MindSparks (TinhMinhLaKey) là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1c**, toàn bộ ngôn ngữ thiết kế được nâng cấp toàn diện theo chuẩn mực:
- **Google Material 3 Expressive (Tonal Surfaces & Solid Pill Controls)**: Chuyển dịch 100% các nút bấm từ chuyển sắc Gradient sang màu Đơn Sắc (Solid Tonal Fill), loại bỏ hiệu ứng phát sáng lòe loẹt và các nhãn terminal giả lập, xóa bỏ hoàn toàn cảm giác "AI Slop".
- **Editorial Inspirational Stage**: Màn hình đầu tiên khi truy cập trang chủ là một bức Poster nghệ thuật truyền cảm hứng thuần túy (Monumental Random Quote từ `quotes.js` kết hợp 4 cột chỉ số tối giản), cuộn xuống mới tiến vào khu vực Bộ câu hỏi theo môn học và 7 Chế độ luyện tập.
- **Floating Capsule Sidebar (Desktop) & Liquid Notch Bubble (Mobile)**: Thiết kế thanh điều hướng nổi tách khỏi mép màn hình với trạng thái active là hình tròn đặc tương phản cao trên Desktop và viên bi nổi có vành khuyết lõm mượt mà trên Mobile.
- **Hệ Thống 3 Chế Độ Theme Hoàn Chỉnh**: Tùy biến toàn diện giữa `violet-rose` (Tím hồng mộng mơ), `monochrome` (100% Trắng & Đen tuyệt đối), và `white-orange` (Sáng ấm hiện đại phối cam năng lượng).

---

## 2. Kiến Trúc 3 Chế Độ Theme (3-Theme Token Architecture)

Điều phối tập trung 100% tại `css/theme.css` thông qua thuộc tính `data-theme` trên thẻ `<html>` và `<body>`:

| Đặc tính / Thành phần | 1. Tím Hồng (`violet-rose` - Mặc định) | 2. Trắng Đen (`monochrome` - Pure Noir B&W) | 3. Trắng Cam (`white-orange` - Daylight Orange) |
| :--- | :--- | :--- | :--- |
| **Phong cách chủ đạo** | Tím Lavender & Hồng Phấn dịu nhẹ, mộng mơ | 100% Trắng & Đen tuyệt đối, sắc lạnh | Nền sáng kem ấm Alabaster phối Cam Tươi |
| **Hình nền mặc định** | `./backgrounds/bg-pixel-meadow.webp` | `./backgrounds/bg-noir-mono.webp` | `./backgrounds/bg-white-orange.webp` |
| **Lớp phủ nền (`#bg-layer::before/after`)** | Tím khói dịu `rgba(14, 11, 24, 0.68)` | Đen mờ `rgba(5, 5, 5, 0.52)` | Trắng kem mờ `rgba(255, 250, 245, 0.38)` |
| **Nền chính (`--bg-base`)** | `#0e0b18` | `#050505` (OLED Pure Black) | `#faf7f2` (Alabaster Cream) |
| **Chữ chính (`--text-primary`)** | `#f5f3ff` | `#ffffff` | `#18181b` (Charcoal Black) |
| **Chữ phụ (`--text-secondary`)** | `#cbc3e3` | `#a3a3a3` | `#52525b` |
| **Nút chính (`--btn-primary-bg` / `text`)** | Nền `#d8b4fe`, chữ `#140e24` (hover `#f472b6`) | Nền `#ffffff`, chữ `#000000` (hover `#e5e5e5`) | Nền `#f97316`, chữ `#ffffff` (hover `#ea580c`) |
| **Nút phụ (`--btn-secondary-bg` / `text`)** | Nền `rgba(38, 30, 62, 0.85)`, chữ `#f5f3ff` | Nền `#171717`, viền trắng mờ, chữ `#ffffff` | Nền `rgba(255, 255, 255, 0.92)`, viền cam mờ, chữ `#18181b` |
| **Từ khóa Quote (`.hero-title-accent`)** | Chữ Hồng Pastel `#f472b6` | Nền Trắng `#ffffff`, chữ Đen `#000000` | Chữ Cam Đậm `#ea580c` |
| **Bôi đen văn bản (`::selection`)** | Nền `rgba(244, 114, 182, 0.35)`, chữ `#ffffff` | Nền `#ffffff`, chữ `#000000` | Nền `#f97316`, chữ `#ffffff` |
| **Dropdown Menu (`.cyber-dropdown-menu`)** | Nền `#17132a`, viền tím mờ | Nền `#0f0f0f`, viền trắng mờ | Nền `#ffffff`, viền cam mờ, chữ than |

---

## 3. Typography & Quote Poster Khổng Lồ

- **Font Poster Display (`--font-poster`)**:
  `'Montserrat', 'Be Vietnam Pro', 'Arial Black', sans-serif;`
  - Nạp đầy đủ trọng số `800` & `900` hỗ trợ 100% tiếng Việt có dấu.
  - Áp dụng kỹ thuật viền kép đầm chắc: `-webkit-text-stroke: 1.1px` kết hợp `paint-order: stroke fill;`.
  - Cỡ chữ thích ứng tự động trong `App.updateHeroQuote()`:
    - Câu \(\le 32\) ký tự: `clamp(3.0rem, 7.0vw, 5.4rem)`
    - Câu \(\le 60\) ký tự: `clamp(2.6rem, 6.0vw, 4.6rem)`
    - Câu \(\le 90\) ký tự: `clamp(2.2rem, 4.8vw, 3.8rem)`
    - Câu \(> 90\) ký tự: `clamp(1.85rem, 3.8vw, 3.0rem)`
- **Loại bỏ viền đóng hộp cũ**: Loại bỏ hoàn toàn viền hồng mỏng đóng hộp xung quanh Hero Title.

---

## 4. Kiến Trúc Trang Chủ Mới: Editorial Inspirational Stage

Màn hình đầu tiên (`#view-dashboard`) đạt độ cao `min-height: calc(100dvh - 108px)` trên Desktop và `min-height: calc(100dvh - 150px)` trên Mobile:
1. **Tầng Đỉnh (Header Bar)**: Nhãn tọa độ tối giản `[ MINDSPARKS ] • [ ACTIVE RECALL ] • [ SM-2 ]` cùng nút `↻ Đổi cảm hứng` và cụm chuyển nhanh 3 Theme (`◐ Tím Hồng` | `◑ Trắng Đen` | `◒ Trắng Cam`).
2. **Tầng Giữa (Monumental Quote Canvas)**: Câu quote lớn nổi bật, mô tả ngắn gọn và 3 nút hành động đơn sắc: Nút chính `⚡ Ôn tập hôm nay` (`#dashboard-study-btn`), 2 nút phụ `🎯 Ôn câu hay sai` và `✨ Dán câu hỏi AI`.
3. **Tầng Đáy (Editorial Metrics Footer)**: Đường kẻ chỉ mảnh chia 4 cột thông số (`01 // TỔNG KHO THẺ`, `02 // CẦN ÔN HÔM NAY`, `03 // ĐÃ THÀNH THẠO`, `04 // CHUỖI BỀN BỈ`) kèm nút chỉ dẫn cuộn xuống `↓ CUỘN XUỐNG BỘ CÂU HỎI & CHẾ ĐỘ LUYỆN TẬP`.
4. **Khu vực Below the Fold (`#dashboard-content-below`)**:
   - Khu vực 1: Bộ câu hỏi theo Môn học (`#dashboard-decks-grid` + `#dashboard-subject-filters`).
   - Khu vực 2: 7 Chế độ ôn tập thông minh (`.study-modes-grid`).

---

## 5. Thanh Điều Hướng Desktop & Mobile

- **Desktop Sidebar (`.app-sidebar`)**:
  - Tách rời mép màn hình: `top: 16px; bottom: 16px; left: 16px; width: 248px; border-radius: 28px; background: var(--sidebar-bg); backdrop-filter: blur(20px);`.
  - Khi thu gọn (`.app-sidebar.collapsed`): `width: 68px; border-radius: 999px;`.
  - Mục active là một hình tròn đặc tương phản cao `46px × 46px` (`background: var(--nav-active-bg); color: var(--nav-active-text);`).
  - Bảo toàn 7 mục điều hướng và thuộc tính `data-tooltip` phục vụ kiểm thử.
- **Mobile Bottom Nav (`.bottom-nav`)**:
  - Dạng thanh viên nang nổi: `bottom: 12px; left: 16px; right: 16px; height: 64px; border-radius: 32px; background: var(--bottom-nav-bg);`.
  - Mục active: Icon SVG được nâng cao thành viên bi tròn nổi `44px` với vành khuyết đồng màu nền trang (`box-shadow: 0 0 0 6px var(--bg-base), 0 8px 18px rgba(0,0,0,0.35)`), tạo hiệu ứng hốc lõm Liquid Notch mượt mà.
  - Hiển thị đúng 5 tab chính trên Mobile, ẩn 2 nút `import` và `import-lms`.
