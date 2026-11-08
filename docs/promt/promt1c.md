# PROMPT 1C: ĐẠI TU UI/UX TOÀN DIỆN — EDITORIAL INSPIRATIONAL HOME, GOOGLE MATERIAL 3 TONAL DESIGN, SIDEBAR & MOBILE NAV MỚI, NÚT ĐƠN SẮC, VÀ HỆ THỐNG 3 CHẾ ĐỘ THEME (TÍM HỒNG / TRẮNG ĐEN / TRẮNG CAM)

> **ĐƯỜNG DẪN LƯU FILE TRONG DỰ ÁN**: `docs/promt/promt1c.md`
> **PHIÊN BẢN**: `1c` (Nâng cấp lột xác toàn diện từ nền tảng `1a` & `1b`)
> **FILE THEO DÕI TIẾN ĐỘ**: `docs/handoff/PROGRESS-1C.md`
> **MỤC TIÊU CỐT LÕI**: Lột xác toàn bộ ngôn ngữ thiết kế của **MindSparks / TinhMinhLaKey** theo phong cách **Google Material 3 Expressive (Tonal Surfaces, Solid Buttons, Anti-AI-Slop)** kết hợp **Editorial Poster Homepage** (truyền cảm hứng thuần túy ở khung hình đầu tiên, cuộn xuống mới vào khu vực câu hỏi), làm mới **Desktop Sidebar & Mobile Bottom Nav**, và bổ sung **3 Chế Độ Theme hoàn chỉnh (`violet-rose`, `monochrome`, `white-orange`)** kèm hình nền mặc định riêng cho từng chế độ, trong khi **bảo toàn 100% dữ liệu IndexedDB và vượt qua mọi bài kiểm thử (`npm test`, `npm run build`)**.

## BƯỚC 0: SAO LƯU GIT AN TOÀN TRƯỚC KHI CHẠY (BẮT BUỘC)

Trước khi thực hiện bất kỳ thay đổi nào trong đợt `1c`, hãy đảm bảo code hiện tại đã được commit và tạo nhánh sao lưu để có thể khôi phục trong 1 giây nếu cần:

```bash
# 1. Kiểm tra trạng thái các file đã sửa ở đợt 1a & 1b
git status

# 2. Đưa toàn bộ thay đổi hiện tại vào staging và commit
git add -A
git commit -m "backup: stable state after prompt 1b before 1c UI overhaul"

# 3. Tạo một nhánh backup cố định (phòng trường hợp muốn quay lại bản 1b)
git branch backup-before-1c

# 4. Đẩy cả nhánh chính và nhánh backup lên GitHub/GitLab
git push origin HEAD
git push origin backup-before-1c
```

## PHẦN 1: CHUẨN BỊ HÌNH NỀN MẶC ĐỊNH CHO 3 CHẾ ĐỘ THEME (`backgrounds/`)

Đợt nâng cấp `1c` sử dụng 2 hình nền mới trong thư mục **`backgrounds/`** (nằm ngay tại gốc dự án: `./backgrounds/`):
1. **Theme Trắng Cam (`white-orange`)**: File `./backgrounds/bg-white-orange.webp` (từ Hình 8 bạn gửi, đã được chuyển toàn bộ sắc tím sang sắc cam ấm hiện đại).
2. **Theme Trắng Đen (`monochrome`)**: File `./backgrounds/bg-noir-mono.webp` (từ Hình 9 `riel.jpg` trắng đen nghệ thuật bạn gửi).
3. **Theme Tím Hồng (`violet-rose`)**: Sử dụng `./backgrounds/bg-pixel-meadow.webp` hoặc `./backgrounds/bg-starry-garden.webp` sẵn có.

> **Cơ chế tự động kép cho AI Agent**:
> - Nếu người dùng đã copy 2 file `bg-white-orange.webp` và `bg-noir-mono.webp` (hoặc ảnh gốc `.jpg`/`.png`) vào thư mục `backgrounds/`, AI Agent sẽ tự động nhận diện, cập nhật vào `sw.js` và gắn làm hình nền mặc định khi chuyển theme.
> - Nếu người dùng chỉ bỏ file ảnh gốc chưa đổi màu (ví dụ `image_8.jpg` màu tím và `riel.jpg`) vào `backgrounds/`, AI Agent sẽ chạy script Node/Canvas hoặc áp dụng bộ lọc màu CSS (`filter: hue-rotate(145deg) saturate(1.25)` cho ảnh 8 và `filter: grayscale(1) contrast(1.15)` cho ảnh 9) để đảm bảo hiển thị đúng 100% tông Trắng Cam và Trắng Đen!

## PHẦN 2: KÍCH HOẠT & ĐIỀU PHỐI BỘ SKILLS TRONG ĐỢT `1C`

AI Agent **BẮT BUỘC** kích hoạt và áp dụng quy trình từ các bộ Skills đã cài đặt trước khi viết code:

```bash
# 1. Nạp ngữ cảnh Impeccable (PRODUCT.md & DESIGN.md)
sh .agent/skills/impeccable/scripts/impeccable context || npx impeccable context

# 2. Phối hợp các bộ Skill chủ lực:
# - impeccable: distill, typeset, colorize, layout, animate, polish, audit
# - ui-ux-pro-max-skill & design-taste-frontend: Editorial Hero, Anti-Slop, 3-Theme Token Architecture
# - superpowers: writing-plans, subagent-driven-development, verification-before-completion
```

| Tên Skill | Nhiệm vụ bắt buộc trong đợt `1c` |
| :--- | :--- |
| **`impeccable`** (`distill`, `typeset`, `colorize`, `layout`, `polish`) | Dọn sạch chi tiết rườm rà kiểu AI Slop (`distill`); khôi phục chữ Quote siêu dày kiểu Poster (`typeset`); thiết kế hệ màu 3 Theme chuẩn độ tương phản WCAG AA (`colorize`); dựng bố cục Editorial Homepage & Navigation (`layout`). |
| **`ui-ux-pro-max-skill`** & **`design-taste-frontend`** | Áp dụng ngôn ngữ thiết kế **Google Material 3 Expressive (Tonal Surfaces & Solid Pill Controls)**, dựng **Floating Capsule Sidebar** (Desktop) và **Liquid Notch Bottom Nav** (Mobile). |
| **`superpowers`** (`writing-plans`, `verification-before-completion`) | Kiểm soát thay đổi trên toàn bộ các view Desktop & Mobile, đảm bảo không phá vỡ bất kỳ bài test nào trong `npm test` và đóng sạch các tiến trình ngầm sau khi kiểm thử. |

## PHẦN 3: CHI TIẾT 6 HẠNG MỤC ĐẠI TU UI/UX TRONG ĐỢT `1C`

### HẠNG MỤC 1: NGÔN NGỮ THIẾT KẾ HIỆN ĐẠI KIỂU GOOGLE (MATERIAL 3 TONAL SURFACES & ANTI-AI-SLOP) + NÚT BẤM ĐƠN SẮC 100%

1. **Chuyển toàn bộ nút bấm Gradient về Đơn Sắc (Solid Tonal Fill)**:
   - **Xóa bỏ hoàn toàn `background: linear-gradient(...)`** trên tất cả các nút bấm trong toàn ứng dụng (`.btn-primary`, `.btn-deck-study`, `#dashboard-study-btn`, `.subject-group-actions .btn-primary`, `.topic-filter-chip.active`, `.srs-btn`, `.cyber-dropdown-item.active`).
   - Thay thế bằng **Nút Đơn Sắc (Solid Fill)** theo đúng chuẩn **Google Material 3 Expressive**:
     - Nút chính (`.btn-primary`, `.btn-deck-study`): Dùng màu nền đặc `--btn-primary-bg` và màu chữ `--btn-primary-text` tương phản sắc nét, bo góc viên nang (`border-radius: 9999px`), không viền trắng dày, không bóng phát sáng lòe loẹt. Khi hover chỉ chuyển nhẹ sắc độ bề mặt (`--btn-primary-hover`) và nhích nhẹ `transform: translateY(-1px)`.
     - Nút phụ (`.btn-secondary`): Dùng bề mặt Tonal Container (`--surface-container-high`) đơn sắc, viền mảnh tinh tế `1px solid var(--border-subtle)`, chữ `--text-primary`.
2. **Diệt tận gốc cảm giác "AI Slop"**:
   - Ẩn hoặc làm tối giản các nhãn giả lập terminal cũ (`SYSTEM // SM-2 ACTIVE`, `OFFLINE PWA`, `MODE // 01`..`07`, `LMS // AUTO-PARSER`) thành các nhãn chữ thường hoặc chữ in hoa nhỏ thanh lịch kiểu Editorial (`font-size: 0.72rem; letter-spacing: 0.08em; color: var(--text-muted); background: transparent; border: none;`).
   - Giảm thiểu việc lạm dụng emoji sặc sỡ trên giao diện điều hướng; ưu tiên các đường nét SVG tối giản, khoảng trắng rộng rãi và phân cấp thị giác bằng độ đậm nhạt của bề mặt (Tonal Elevation).

### HẠNG MỤC 2: KHÔI PHỤC FONT CHỮ QUOTE SIÊU DÀY, BÈ NGANG & CỠ LỚN NHƯ ẢNH MẪU 1

1. **Nguyên nhân chữ hiện tại bị mỏng và bé**:
   - Do `--font-poster` bị rơi về `Plus Jakarta Sans` (nét chữ hẹp và mỏng hơn) và hàm `updateHeroQuote()` trong `js/app.js` đang thu nhỏ `font-size` quá mức.
2. **Cách khắc phục triệt để trong `index.html`, `css/fonts.css`, `css/style.css` và `js/app.js`**:
   - Trong `index.html`, đảm bảo link Google Fonts nạp đầy đủ **`Montserrat:wght@800;900`** (hỗ trợ đầy đủ tiếng Việt & tiếng Anh nét dày bản rộng):
     ```html
     <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Montserrat:wght@800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
     ```
   - Trong `css/fonts.css` và `css/theme.css`:
     ```css
     --font-poster: 'Montserrat', 'Be Vietnam Pro', 'Arial Black', sans-serif;
     ```
   - Trong `css/style.css`, định kiểu `.hero-title`, `.hero-title-main`, `.hero-title-sub`, `.hero-title-accent` để có nét chữ **siêu dày, bè ngang, đầm chắc và không có viền khung hồng bao quanh**:
     ```css
     .hero-title {
       font-family: var(--font-poster) !important;
       font-weight: 900 !important;
       display: block;
       padding-top: 8px;
       padding-bottom: 8px;
       margin-bottom: 20px;
       line-height: 1.08 !important;
       text-transform: uppercase;
       letter-spacing: -0.035em !important;
       font-size: clamp(2.6rem, 6.2vw, 4.8rem);
       transform: translateZ(0);
       word-break: break-word;
       overflow-wrap: break-word;
     }
     .hero-title-main,
     .hero-title-sub {
       display: inline;
       font-family: var(--font-poster) !important;
       font-weight: 900 !important;
       -webkit-text-stroke: 1.1px var(--hero-title-color, #ffffff);
       paint-order: stroke fill;
       color: var(--hero-title-color, #ffffff) !important;
       -webkit-text-fill-color: var(--hero-title-color, #ffffff) !important;
       text-shadow: var(--hero-title-shadow, 0 8px 24px rgba(0, 0, 0, 0.45));
       will-change: transform;
     }
     .hero-title-accent {
       display: inline;
       font-family: var(--font-poster) !important;
       font-style: normal !important;
       font-weight: 900 !important;
       -webkit-text-stroke: 1.1px var(--hero-accent-stroke, var(--hero-accent-color));
       paint-order: stroke fill;
       color: var(--hero-accent-color, #e879f9) !important;
       -webkit-text-fill-color: var(--hero-accent-color, #e879f9) !important;
       background: var(--hero-accent-bg, none) !important;
       padding: var(--hero-accent-padding, 0);
       border-radius: var(--hero-accent-radius, 0);
       margin: 0 0.04em;
       text-shadow: var(--hero-accent-shadow, none);
     }
     ```
   - Trong `js/app.js` (hàm `updateHeroQuote()` dòng 1306–1320), nâng kích thước chữ tự động lên to và hoành tráng hơn:
     ```javascript
     const cleanLength = String(selectedQuote).replace(/\*\*/g, '').trim().length;
     let responsiveFontSize = 'clamp(2.5rem, 5.8vw, 4.4rem)';
     if (cleanLength <= 32) {
       responsiveFontSize = 'clamp(3.0rem, 7.0vw, 5.4rem)';
     } else if (cleanLength <= 60) {
       responsiveFontSize = 'clamp(2.6rem, 6.0vw, 4.6rem)';
     } else if (cleanLength <= 90) {
       responsiveFontSize = 'clamp(2.2rem, 4.8vw, 3.8rem)';
     } else {
       responsiveFontSize = 'clamp(1.85rem, 3.8vw, 3.0rem)';
     }
     heroTitle.style.fontSize = responsiveFontSize;
     ```

### HẠNG MỤC 3: ĐẬP ĐI XÂY LẠI TRANG CHỦ (`#view-dashboard`) THEO PHONG CÁCH POSTER TRUYỀN CẢM HỨNG (EDITORIAL FIRST-VIEWPORT CANVAS)

Lấy cảm hứng từ các poster nghệ thuật đương đại (Ảnh 6 & Ảnh 7): **Màn hình đầu tiên khi mở ứng dụng là một không gian truyền cảm hứng thuần túy, ấn tượng mạnh mẽ; khi người dùng cuộn xuống mới tiến vào khu vực Chế độ ôn luyện và Bộ câu hỏi.**

1. **Cấu trúc Bố cục Khung hình đầu tiên (First Viewport — `.hero-card` biến thành `.editorial-hero-stage`)**:
   - Chiều cao tối thiểu trên Desktop: `min-height: calc(100dvh - 108px)` (trên Mobile: `min-height: calc(100dvh - 150px)`), sử dụng Flexbox/Grid xếp 3 tầng dọc (`justify-content: space-between`), **bỏ khung viền hồng đóng hộp cứng nhắc**, thay bằng bề mặt kính Tonal tinh tế (`background: var(--hero-stage-bg); backdrop-filter: blur(16px); border: 1px solid var(--border-subtle); border-radius: 28px; padding: clamp(28px, 4vw, 52px);`):
     - **Tầng Đỉnh (Editorial Header Bar)**:
       - Bên trái: Nhãn tọa độ tối giản `[ MINDSPARKS ]  [ ACTIVE RECALL ]  [ SM-2 ]`.
       - Bên phải: Nút đổi Quote nhanh (`↻ Đổi cảm hứng`) + Bộ chuyển đổi nhanh 3 Theme (`◐ Tím Hồng` / `◑ Trắng Đen` / `◒ Trắng Cam`).
     - **Tầng Giữa (Monumental Quote Canvas)**:
       - Khối Quote khổng lồ (`#hero-title`) lấy ngẫu nhiên từ `quotes.js` với chữ siêu dày, chiếm trọn chiều ngang truyền cảm hứng mạnh mẽ.
       - Phía dưới Quote là dòng mô tả ngắn gọn và cụm nút hành động đơn sắc:
         - Nút chính đơn sắc lớn: `Ôn tập hôm nay` (`App.startSession(null, 'srs')`)
         - 2 nút Tonal phụ: `Ôn câu hay sai` & `Dán câu hỏi AI`
     - **Tầng Đáy của Poster (Editorial 4-Column Metrics Footer + Scroll Indicator)**:
       - Kẻ một đường chỉ ngang mảnh `1px solid var(--border-subtle)` chia 4 cột thông số theo phong cách tạp chí (sử dụng lại đúng 4 thẻ `.stat-card` và ID `#stat-total-cards`, `#stat-due-today`, `#stat-mastered-cards`, `#stat-streak-days` ngay tại chân trang Hero hoặc ngay sát dưới để bảo toàn 100% DOM IDs):
         - `01 // TỔNG KHO THẺ` (`#stat-total-cards`)
         - `02 // CẦN ÔN HÔM NAY` (`#stat-due-today`)
         - `03 // ĐÃ THÀNH THẠO` (`#stat-mastered-cards`)
         - `04 // CHUỖI BỀN BỈ` (`#stat-streak-days`)
       - Kèm dòng điều hướng cuộn tinh tế ở chính giữa đáy: `↓ CUỘN XUỐNG KHÔNG GIAN HỌC TẬP & BỘ CÂU HỎI`.
2. **Khu vực Phía Dưới Khi Cuộn Xuống (Below the Fold)**:
   - Cách tầng Hero một khoảng thoáng (`margin-top: 48px`), người dùng cuộn xuống sẽ gặp:
     - **Khu vực 1: Bộ câu hỏi theo Môn học (`#dashboard-decks-grid`)** — đưa lên ngay dưới Hero để người dùng kéo xuống là thấy ngay các môn học & câu hỏi của mình!
     - **Khu vực 2: 7 Chế độ luyện tập chuyên sâu (`.study-modes-grid`)** — được thiết kế lại gọn gàng, sạch sẽ, nút bấm đơn sắc đồng bộ.

### HẠNG MỤC 4: THIẾT KẾ LẠI SIDEBAR DESKTOP (FLOATING CAPSULE) & MOBILE BOTTOM NAV (LIQUID NOTCH BUBBLE)

#### 4.1. Desktop Sidebar (`.app-sidebar` — Theo chuẩn Ảnh tham khảo 4)
1. **Hình dáng tổng thể**:
   - Biến `.app-sidebar` thành một **Thanh Viên Nang Nổi (Floating Capsule)** tách nhẹ khỏi mép trái màn hình:
     - Khi mở rộng (`expanded`): `top: 16px; bottom: 16px; left: 16px; height: calc(100dvh - 32px); width: 248px; border-radius: 28px; padding: 18px 14px; background: var(--sidebar-bg); backdrop-filter: blur(20px); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-md);`.
     - Khi thu gọn (`.app-sidebar.collapsed` — giống hệt thanh pill nhỏ bên trái của Ảnh 4): `width: 68px; min-width: 68px; border-radius: 999px; padding: 18px 10px; align-items: center;`.
2. **Hiệu ứng mục đang chọn (`.nav-item.active button`)**:
   - **Khi mở rộng**: Mục đang chọn có nền đặc tương phản cao (`background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-radius: 999px; font-weight: 700; box-shadow: 0 4px 14px var(--nav-active-glow);`), các mục chưa chọn có khung pill viền mờ nhẹ khi hover (`border-radius: 999px`).
   - **Khi thu gọn (`.app-sidebar.collapsed`)**: Mỗi nút là một hình tròn hoàn hảo `46px × 46px` (`border-radius: 50%`); mục đang chọn (`.nav-item.active button`) là một **Hình Tròn Đặc Tương Phản Cao** (ví dụ màu Trắng tinh hoặc màu Accent đặc với icon màu tối bên trong, đúng y hệt nút tròn sáng lên trong Ảnh 4!).
   - **Lưu ý bảo toàn Test**: Giữ nguyên toàn bộ 7 phần tử `.nav-item`, thuộc tính `data-tooltip`, `.nav-label`, và hai hàm `_detachSidebarLabels()` / `_attachSidebarLabels()`.

#### 4.2. Mobile Bottom Navigation (`.bottom-nav` — Theo chuẩn Ảnh tham khảo 5)
1. **Hình dáng Viên Nang Nổi Đáy Màn Hình kèm Hốc Lõm Tròn (Liquid Notch / Elevated Circle Indicator)**:
   - Trên Mobile (`@media (max-width: 768px)`), thiết kế `.bottom-nav` thành một thanh pill nổi cách đáy màn hình:
     ```css
     .bottom-nav {
       position: fixed !important;
       bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
       left: 16px !important;
       right: 16px !important;
       width: auto !important;
       height: 64px !important;
       border-radius: 32px !important;
       background: var(--bottom-nav-bg) !important;
       border: 1px solid var(--border-subtle) !important;
       box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35) !important;
       padding: 0 10px !important;
       display: flex !important;
       align-items: center !important;
       justify-content: space-around !important;
       z-index: 9500 !important;
       overflow: visible !important;
     }
     ```
2. **Hiệu ứng Nút Tròn Nổi Trong Hốc Lõm (Active Bubble Cutout như Ảnh 5)**:
   - Giữ nguyên `min-height: 44px !important; flex: 1 1 0% !important;` trên `.bottom-nav-item` và ẩn 2 nút `.bottom-nav-hidden` (`import`, `import-lms`) để pass 100% `tests/test-round35-mobile-lms-and-natural-scroll.js` và `tests/test-round39-mobile-nav-and-lms-layout.js`.
   - Khi một `.bottom-nav-item` có class `.active`:
     - Icon SVG bên trong được bọc/định kiểu thành một **Viên Bi Tròn Đặc (`width: 48px; height: 48px; border-radius: 50%;`)** nhô lên khỏi mặt thanh điều hướng (`transform: translateY(-16px)`).
     - Viên bi tròn này có `background: var(--nav-bubble-bg)` (màu đặc nổi bật của theme) và một **vành khuyết đồng màu nền trang (`box-shadow: 0 0 0 6px var(--bg-base), 0 6px 14px rgba(0,0,0,0.28)`)** tạo hiệu ứng khoét lõm chữ U mượt mà vào thân thanh `.bottom-nav` giống hệt thiết kế ở Ảnh 5!

### HẠNG MỤC 5: HỆ THỐNG 3 CHẾ ĐỘ THEME HOÀN CHỈNH (`violet-rose`, `monochrome`, `white-orange`) TRONG `css/theme.css` & `js/app.js`

Thiết lập 3 chế độ giao diện thông qua thuộc tính `data-theme` trên thẻ `<html>` (`document.documentElement.setAttribute('data-theme', themeName)`), điều phối tập trung 100% tại **`css/theme.css`**:

#### 5.1. Bảng Thông Số Thiết Kế Của 3 Chế Độ Theme

| Thuộc tính / Thành phần | 1. Theme Tím Hồng (`violet-rose` - Mặc định) | 2. Theme Trắng Đen (`monochrome` - Pure Noir B&W) | 3. Theme Trắng Cam (`white-orange` - Warm Daylight Orange) |
| :--- | :--- | :--- | :--- |
| **Phong cách chủ đạo** | Tím Lavender & Hồng Phấn dịu nhẹ, mộng mơ, không chói gắt | **100% Trắng & Đen tuyệt đối**, tối giản, tương phản cao, sắc lạnh | Sáng - Ấm hiện đại, nền kem kính mờ trong trẻo phối Cam Tươi năng lượng |
| **Hình nền mặc định** | `./backgrounds/bg-pixel-meadow.webp` | **`./backgrounds/bg-noir-mono.webp`** (Ảnh 9 `riel.jpg`) | **`./backgrounds/bg-white-orange.webp`** (Ảnh 8 đổi sang Cam) |
| **Lớp phủ nền (`#bg-layer::after`)** | Tím khói dịu `rgba(14, 11, 24, 0.68)` | Đen mờ trong suốt `rgba(5, 5, 5, 0.52)` giữ trọn ánh sáng trắng của ảnh 9 | Trắng kem mờ `rgba(255, 250, 245, 0.38)` tôn khối kính cam của ảnh 8 |
| **Nền chính (`--bg-base`)** | `#0e0b18` (Tím đêm dịu) | `#050505` (Đen thuần OLED) | `#faf7f2` (Trắng kem Alabaster) |
| **Bề mặt Thẻ / Kính (`--bg-card` / `--glass-tint`)** | `rgba(24, 19, 40, 0.78)` + `blur(16px)` | `rgba(16, 16, 16, 0.78)` + `blur(18px)` | `rgba(255, 255, 255, 0.82)` + `blur(20px)` |
| **Viền Thẻ (`--glass-border`)** | `rgba(216, 180, 254, 0.18)` | `rgba(255, 255, 255, 0.18)` | `rgba(234, 88, 12, 0.18)` |
| **Chữ chính (`--text-primary`)** | `#f5f3ff` (Trắng tím dịu) | `#ffffff` (Trắng tinh khiết) | `#18181b` (Đen than sắc nét) |
| **Chữ phụ (`--text-secondary`)** | `#cbc3e3` (Tím khói nhạt) | `#a3a3a3` (Xám bạc) | `#52525b` (Xám đá ấm) |
| **Nút chính Đơn sắc (`--btn-primary-bg` / `text`)** | Nền Hồng Tím Pastel `#d8b4fe` (hover `#f472b6`), chữ tối `#140e24` đậm | **Nền Trắng `#ffffff`, chữ Đen `#000000`** (hover `#e5e5e5`) | **Nền Cam Tươi `#f97316`, chữ Trắng `#ffffff`** (hover `#ea580c`) |
| **Nút phụ Đơn sắc (`--btn-secondary-bg` / `text`)** | Nền `rgba(38, 30, 62, 0.85)`, chữ `#f5f3ff` | Nền `#171717`, viền `rgba(255,255,255,0.24)`, chữ `#ffffff` | Nền `rgba(255, 255, 255, 0.92)`, viền `rgba(234, 88, 12, 0.25)`, chữ `#18181b` |
| **Từ khóa nhấn Quote (`.hero-title-accent`)** | Chữ Hồng Pastel `#f472b6` | **Nền Trắng `#ffffff`, chữ Đen `#000000`** (`padding: 0 12px; border-radius: 8px;`) | Chữ **Cam Đậm `#ea580c`** trên nền câu hỏi chữ Đen `#18181b` |
| **Bôi đen văn bản (`::selection`)** | Nền `rgba(244, 114, 182, 0.35)`, chữ `#ffffff` | **Nền Trắng `#ffffff`, chữ Đen `#000000`** | **Nền Cam `#f97316`, chữ Trắng `#ffffff`** |
| **Menu Dropdown (`.cyber-dropdown-menu`)** | Nền `#17132a`, viền `rgba(216, 180, 254, 0.30)` | Nền `#0f0f0f`, viền `rgba(255, 255, 255, 0.28)` | Nền `#ffffff`, viền `rgba(234, 88, 12, 0.28)`, bóng đổ cam nhạt |

#### 5.2. Triển khai hàm `setTheme(themeName)` trong `js/app.js` và UI Chọn Theme
1. Trong `js/app.js`, thêm phương thức `async setTheme(themeId, options = { syncDefaultBg: true })`:
   - Hỗ trợ 3 giá trị: `'violet-rose'`, `'monochrome'`, `'white-orange'`.
   - Gán `document.documentElement.setAttribute('data-theme', themeId)` và `document.body.dataset.theme = themeId`.
   - Lưu vào `localStorage.setItem('mindsparks_theme', themeId)` và `await db.setMeta('appTheme', themeId)`.
   - **Tự động đổi Hình nền mặc định theo Theme** (khi người dùng bấm chuyển Theme):
     - Nếu `themeId === 'monochrome'`: Tự động gọi `await this.setBackground('./backgrounds/bg-noir-mono.webp')`.
     - Nếu `themeId === 'white-orange'`: Tự động gọi `await this.setBackground('./backgrounds/bg-white-orange.webp')`.
     - Nếu `themeId === 'violet-rose'`: Tự động gọi `await this.setBackground('./backgrounds/bg-pixel-meadow.webp')`.
2. **Đặt bộ chọn 3 Chế độ Theme ở 2 vị trí tiện lợi**:
   - **Vị trí 1 (Ngay trên thanh Topbar & Header trang chủ)**: Cụm 3 pill chuyển nhanh `Tím Hồng` | `Trắng Đen` | `Trắng Cam` để đổi vibe trong 1 cú click.
   - **Vị trí 2 (Trong mục `🎨 Giao Diện & Hình Nền` ở trang `#view-settings`)**: Hiển thị 3 thẻ chọn Theme trực quan kèm 2 hình nền mới (`bg-white-orange.webp` và `bg-noir-mono.webp`) trong lưới `#bg-picker-grid`.

### HẠNG MỤC 6: ĐỒNG BỘ HOÀN HẢO DESKTOP & MOBILE + KIỂM ĐỊNH TOÀN DIỆN

1. **Đồng bộ Desktop & Mobile**:
   - Kiểm tra tất cả các trang (`#view-dashboard`, `#view-decks`, `#view-bank`, `#view-import`, `#view-import-lms`, `#view-study`, `#view-exam`, `#view-stats`, `#view-settings`) dưới cả **3 chế độ Theme** (`violet-rose`, `monochrome`, `white-orange`).
   - Đặc biệt ở **Theme Trắng Cam (`white-orange`)** (nền sáng) và **Theme Trắng Đen (`monochrome`)**:
     - Đảm bảo không có bất kỳ dòng chữ nào bị gắn cứng `color: #ffffff !important` hoặc `background-color: #131122 !important` làm chìm chữ trên nền sáng của Theme Trắng Cam! Thay toàn bộ các màu nền/chữ viết cứng trong `css/style.css` và inline style trong `js/app.js` bằng biến CSS (`var(--text-primary)`, `var(--bg-card)`, `var(--dropdown-menu-bg)`, `var(--dropdown-trigger-bg)`).
     - Công thức toán học KaTeX (`.katex`) tự động nhận `color: var(--text-primary)` để hiển thị màu Đen sắc nét trên Theme Trắng Cam và màu Trắng tinh trên Theme Trắng Đen / Tím Hồng.
2. **Cập nhật `sw.js` và `DESIGN.md`**:
   - Thêm `'./backgrounds/bg-white-orange.webp'` và `'./backgrounds/bg-noir-mono.webp'` vào danh sách `STATIC_ASSETS` trong `sw.js` (nếu file tồn tại) và tăng `CACHE_NAME`.
   - Cập nhật `DESIGN.md` ghi nhận kiến trúc 3 Theme, quy tắc Nút Đơn Sắc (Zero Gradient Buttons), Floating Capsule Sidebar và Liquid Notch Mobile Nav.

## PHẦN 4: QUY TRÌNH KIỂM THỬ & NGHIỆM THU (VERIFICATION)

Sau khi hoàn tất, AI Agent chạy đầy đủ các bước kiểm tra và tắt mọi server chạy nền trước khi kết thúc:

```bash
# 1. Chạy toàn bộ Unit & Integration Tests
npm test

# 2. Chạy Build Production
npm run build
```

### Checklist Nghiệm Thu Đợt `1c` (Ghi vào `docs/handoff/PROGRESS-1C.md`):
- [ ] **Git Backup**: Đã commit và tạo nhánh backup an toàn trước khi sửa code.
- [ ] **Typography Quote**: Chữ Quote dùng `Montserrat` 900 Black siêu dày, bè ngang, cỡ chữ lớn và không bị đóng khung viền hồng mỏng như Ảnh 2.
- [ ] **100% Nút Đơn Sắc & Google M3 Clean UI**: Tất cả nút bấm đã bỏ gradient sang màu đơn sắc tinh tế; loại bỏ cảm giác AI Slop.
- [ ] **Trang chủ Truyền Cảm Hứng (Editorial First Viewport)**: Mới vào trang chủ là khung Poster truyền cảm hứng ấn tượng, kéo xuống mới vào khu vực Bộ câu hỏi & Chế độ học; câu Quote vẫn random từ `quotes.js`.
- [ ] **Sidebar Desktop & Bottom Nav Mobile**: Sidebar Desktop dạng viên nang nổi với nút tròn active như Ảnh 4; Bottom Nav Mobile có viên bi tròn nổi trong hốc lõm cong mượt như Ảnh 5.
- [ ] **3 Chế Độ Theme (`violet-rose`, `monochrome`, `white-orange`)**:
  - Chế độ **Trắng Đen (`monochrome`)**: Mọi thứ 100% trắng đen từ nút bấm, viền, thẻ, chữ nhấn Quote đến màu bôi đen văn bản (`::selection`), tự động dùng nền Ảnh 9 (`bg-noir-mono.webp`).
  - Chế độ **Trắng Cam (`white-orange`)**: Kính sáng ấm kết hợp nút Cam đơn sắc, chữ đen than rõ nét, tự động dùng nền Ảnh 8 đã chuyển sang màu cam (`bg-white-orange.webp`).
  - Chế độ **Tím Hồng (`violet-rose`)**: Vibe tím hồng nhẹ nhàng, thanh thoát, nút đơn sắc pastel.
- [ ] **Tests & Build**: `npm test` và `npm run build` đạt **100% PASS**, không còn tiến trình `node server.js` treo ngầm.
