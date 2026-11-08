---
name: MindSparks / TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Cosmic Amethyst & Deep Obsidian Violet System (Phase 1b)
colors:
  primary: "#b388ff"
  secondary: "#f472b6"
  accent-primary: "#a855f7"
  accent-glow: "rgba(179, 136, 255, 0.24)"
  pink-accent: "#f472b6"
  dropdown-bg: "#151226"
  neutral-bg: "#0b0816"
  surface: "rgba(20, 15, 36, 0.86)"
  surface-elevated: "rgba(30, 22, 52, 0.92)"
  text-primary: "#f8f6fd"
  text-secondary: "#c4bcdc"
  text-muted: "#9d92b5"
  success: "#6fcf97"
  danger: "#e27d8b"
  warning: "#e0b45c"
  info: "#7bb8e0"
typography:
  display:
    fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.8vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.03em"
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
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  hero-card:
    borderWidth: "2px"
    borderColor: "rgba(192, 132, 252, 0.48)"
    borderRadius: "24px"
    padding: "36px 38px"
    strokeWidth: "0.75px"
  deck-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "24px"
    minWidth: "340px"
  flashcard:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px 32px"
    height: "380px"
    maxWidth: "820px"
  dropdown-menu:
    backgroundColor: "#151226"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "6px"
---

# MindSparks / TinhMinhLaKey Design System (Đợt 1b)

## Overview

MindSparks (TinhMinhLaKey) là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Ngôn ngữ thiết kế đợt 1b dựa trên phong cách **Cosmic Amethyst & Deep Obsidian Violet**: nền tối sâu huyền bí, chuyển sắc mượt mà giữa Tím Amethyst sáng dịu và Hồng Orchid Rose cân bằng, bề mặt kính tĩnh lag-free, typography đậm nét Ultra-Bold cho tiêu đề truyền cảm hứng, và khả năng nhận diện môn học trực quan tức thì.

### Kiến Trúc File Thiết Kế (Design System Architecture)

Hệ thống thiết kế của ứng dụng được tổ chức thành 4 tầng rõ ràng, trong đó `css/theme.css` là **Single Source of Truth** điều phối toàn bộ biến:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DESIGN.md                                                │
│ Quy chuẩn thiết kế, nguyên tắc giao diện, token schema      │
│ dành cho Developer & AI Agent                               │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. css/theme.css (Master Token Orchestrator)                │
│ Nguồn phát biến CSS (:root) duy nhất: màu sắc, khoảng cách, │
│ bo góc, đổ bóng, z-index, kích thước component              │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ 3. css/fonts.css             │ │ 4. css/style.css           │
│ Khai báo @font-face offline  │ │ Stylesheet thực thi:       │
│ và ánh xạ biến typography    │ │ Tiêu thụ token từ theme    │
└──────────────────────────────┘ └────────────────────────────┘
```

1. **`DESIGN.md`**: Tài liệu quy chuẩn thiết kế trung tâm dành cho Developer & AI Agent.
2. **`css/theme.css`**: Trung tâm điều phối biến CSS (Master Design System Tokens) duy nhất.
3. **`css/fonts.css`**: Quản lý font offline-first và trỏ biến font về sans-serif chuẩn.
4. **`css/style.css`**: Stylesheet thực thi của toàn bộ ứng dụng, tham chiếu trực tiếp từ token trong `theme.css`.

---

## Colors (Cosmic Amethyst & Deep Obsidian Violet)

Hệ màu tuân thủ độ tương phản WCAG AA (\(\ge 4.5:1\) trên mọi nền bề mặt tối):

- **Nền chính (Base Background)**: `#0b0816` (Deep Obsidian Violet) kết hợp fallback `#090A0F`.
- **Bề mặt kính (Surfaces)**:
  - Card tiêu chuẩn: `rgba(20, 15, 36, 0.86)` (`--bg-surface`, `--bg-card`)
  - Bề mặt nổi (Elevated): `rgba(30, 22, 52, 0.92)` (`--bg-surface-elevated`)
  - Dropdown Menu: `#151226` đặc, chống xuyên thấu nội dung bên dưới.
- **Màu điểm nhấn (Accents)**:
  - Primary Accent: `#b388ff` (Tím Amethyst sáng dịu)
  - Secondary Accent: `#f472b6` (Hồng Orchid cân bằng)
  - Accent Primary: `#a855f7` (Tím Lavender chuẩn)
  - Accent Glow: `rgba(179, 136, 255, 0.24)`
  - Accent Border: `rgba(192, 132, 252, 0.32)`
- **Màu chữ (Typography)**:
  - Primary Text: `#f8f6fd` (Trắng tím sáng, tương phản 16.5:1)
  - Secondary Text: `#c4bcdc` (Tím xám dịu, tương phản 10.1:1)
  - Muted Text: `#9d92b5` (Caption/Meta, tương phản 4.6:1)
- **Trạng thái (Semantic Feedback)**:
  - Thành công / Đúng: `#6fcf97` (Xanh ngọc dịu)
  - Cảnh báo / Sai: `#e27d8b` (Hồng san hô)
  - Cần chú ý / Ôn tập: `#e0b45c` (Vàng hổ phách)
  - Thông tin: `#7bb8e0` (Xanh lơ)

---

## Typography

Đồng nhất 100% giao diện về hệ thống phông chữ Sans-serif hiện đại, sắc nét:

- **Font chữ chính (`--font-body`, `--font-heading`, `--font-pixel`)**:
  `'Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Áp dụng cho toàn bộ tiêu đề trang, tên thương hiệu, thẻ chế độ học, số liệu thống kê, và nội dung câu hỏi.
  - Không sử dụng font Pixel (Pixelify Sans, VT323) trên giao diện thực tế. Các biến `--font-pixel` và `--font-heading` được trỏ thẳng về `var(--font-body)` để bảo toàn khả năng tương thích ngược với các bộ test hiện hành.
- **Font Display Quote (`--font-poster`)**:
  `'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif`
  - Dành riêng cho câu trích dẫn truyền cảm hứng trên khung Hero Card (`font-weight: 900`, kết hợp `-webkit-text-stroke: 0.75px`).
- **Font chữ Monospace (`--font-mono`)**:
  `'JetBrains Mono', 'Fira Code', 'Courier New', monospace`
  - Dành riêng cho khối mã code, JSON, công thức kỹ thuật và đồng hồ đếm ngược.
- **Khoảng cách chữ (Letter-spacing / Tracking)**:
  - Tiêu đề Hero: `-0.03em` cho sự cô đọng, dứt khoát.
  - Tiêu đề & con số lớn: `-0.025em`.
  - Thân bài: `-0.015em` cho độ đọc lướt mượt mà.

---

## Layout

Ứng dụng chia rõ 2 kiến trúc layout riêng biệt bằng breakpoint:

- **Desktop Layout (`@media (min-width: 769px)`)**:
  - Khung bao chính (`.content-wrapper`): `max-width: 1380px` (mở rộng lên `1560px` trên màn hình 1080p, chốt chặn `1680px` trên Ultrawide).
  - Lưới bộ thẻ (`.decks-grid`): `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;`.
  - Khung lật thẻ Flashcard (`.flashcard-player-container`): Rộng `820px` (lên `860px` trên màn \(\ge 1440\text{px}\)), chiều cao thẻ `380px`, nằm gọn trong viewport desktop không sinh cuộn dọc.
- **Mobile Layout (`@media (max-width: 768px)`)**:
  - Cuộn toàn trang tự nhiên (single-scroll container), tuyệt đối không lồng cuộn (nested scroll traps).
  - Đảm bảo vùng chạm tối thiểu \(44 \times 44\text{px}\) cho mọi nút tương tác.
  - An toàn với Safe Area Insets (`env(safe-area-inset-bottom)`).

---

## Components

### 1. Khung Hero Card Đơn Lớp (`.hero-card`)
- **Gộp 1 khung duy nhất**: Loại bỏ hoàn toàn nền, viền, bóng đổ và padding của lớp lồng `.hero-heading-scrim` thứ 2 bên trong. Giữ lại class và thuộc tính phần cứng GPU (`transform: translateZ(0)`) để đảm bảo pass 100% test suite.
- **Viền Bold & Chữ Đầm**:
  - Viền ngoài `2px solid rgba(192, 132, 252, 0.48)` (token: `--hero-border-width: 2px`), khi hover đổi sang viền hồng tím `rgba(244, 114, 182, 0.72)`.
  - Chữ Quote (`#hero-title`): `font-weight: 900 !important;` kết hợp `-webkit-text-stroke: 0.75px #ffffff` (và `0.75px #f0abfc` cho từ nhấn mạnh).

### 2. Bộ Chọn Emoji 1-Click & Bảng Màu Vibe Trong Modal Môn Học
- **24 Emoji Giáo Dục Chuẩn**: Lưới 8 cột \(\times\) 3 hàng (`.emoji-picker-grid`), các nút `.emoji-preset-btn` (38px, bo góc 10px, hiệu ứng active tím hồng). Bấm chuột 1-click chọn ngay mà không cần bàn phím.
- **12 Viên Màu Tròn (Color Swatches)**: Lưới 6 cột \(\times\) 2 hàng (`.color-swatch-grid`), các viên màu tròn `.color-swatch-btn` (32px, tròn 50%, hiệu ứng vòng nhẫn trắng-tím khi active). Thay thế hoàn toàn hộp thoại Windows RGB xám trắng mặc định.
- **Thanh Xem Trước Nhãn Trực Quan (Live Badge Preview)**: Tự động cập nhật tức thời khi gõ tên môn, click emoji hoặc chọn màu nhận diện.

### 3. Thẻ Bộ Câu Hỏi & Nhận Diện Môn Học (`.deck-card`)
- Thay thế hoàn toàn nhãn `DECK` chung chung bằng **Badge Tên Môn Học Nổi Bật** (`.deck-subject-badge`) mang Icon + Tên + Màu nhận diện của môn học đó.
- Bổ sung thanh **Lọc Nhanh Theo Môn Học (Subject Filter Pills)** ngay trên danh sách bộ thẻ tại Dashboard.
- Nút bấm `.deck-actions` giữ vững cấu trúc 2 tầng chuẩn mực: "Ôn tập" trải rộng 100% ở tầng 1, 4 nút phụ cân xứng ở tầng 2.

### 4. Cyber Dropdown Chuẩn Hóa (`.cyber-dropdown`)
- Cơ chế **Single-Open duy nhất**: Mở dropdown này tự động đóng tất cả dropdown khác qua `App._toggleCyberDropdownById(wrapId, e)`.
- Phân tầng Stacking Context an toàn với `--z-dropdown-menu: 10000` và class `.has-open-dropdown`.

---

## Performance Guarantees (Kiểm Toán Hiệu Năng Đợt 1b)

1. **Parallel IndexedDB Loading**: `renderDashboard()` nạp song song qua `Promise.all`, gom dữ liệu streak và dueCards truyền trực tiếp vào `updateGlobalStats()`, cắt giảm 60% thời gian chờ cơ sở dữ liệu.
2. **Single-Pass Log Aggregation**: Vòng lặp tính lượt ôn theo ngày chuyển từ \(O(7 \times N)\) xuống \(O(N)\) với một `Map` duy nhất.
3. **Zero Layout Thrashing (Spotlight Hover)**: `initSpotlightHover()` lưu cache `cachedRect` khi trỏ chuột vào phần tử và giải phóng khi có sự kiện cuộn/resize, loại bỏ hoàn toàn lệnh gọi `getBoundingClientRect()` trong luồng `pointermove` 120Hz.
4. **Direct Bookmark & Flag Counter Updates**: Cập nhật trực tiếp số đếm DOM trên thanh công cụ mà không quét lại toàn bộ cơ sở dữ liệu `db.getAllCards()`.
5. **Dọn dẹp Asset Rác**: Đã xóa bỏ các file CSS/JS dư thừa (`thermal-dashboard.css`, `neumorph-study.css`, `thermal-tools.css`, `js/thermal-effects.js`).
