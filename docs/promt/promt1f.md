# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1F — TỔNG VỆ SINH HỆ THỐNG TOKEN MÀU THEO THEME (ZERO PURPLE BLEED), XÓA SẠCH 100% EMOJI ĐA SẮC, CHUYỂN POPUP & TOPBAR HUD SANG LIQUID GLASS, ĐẨY 7 CHẾ ĐỘ HỌC LÊN ĐẦU DASHBOARD & KHÔI PHỤC MODE 5 (promt1f.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
>
> * **Phiên bản đặc tả:** `1f` (Nối tiếp sau `1a`, `1b`, `1c`, `1d`, `1e`)
>
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **22 lỗi tồn đọng** qua 3 nhóm yêu cầu (`1. Chung` — 13 mục, `2. Mode Trắng Cam` — 6 mục, `3. Mode Trắng Đen` — 2 mục + Kiến trúc Token trung tâm). Đảm bảo **không còn bất kỳ mảng màu tím cứng (`#8b5cf6`, `#7c3aed`, `#a78bfa`, `rgba(124, 58, 237, ...)`, `rgba(36, 29, 58, ...)`) hay emoji nhiều màu (`📚`, `🥀`, `📁`, `🎯`, `⚡`, `🌟`, `📊`, `🔥`, `💡`, `🚀`...) nào lọt qua khi chuyển sang Mode Trắng Đen hoặc Mode Trắng Cam**.
>
> * **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>
>   1. **Zero Data Loss:** Giữ nguyên cấu trúc IndexedDB (`MindSparksQuizDB`), `localStorage`, thuật toán SM-2 (`js/sm2.js`), bộ parse AI/LMS (`js/parser.js`).
>
>   2. **Automated Sanitizer First:** Phải chạy script tự động quét và thay thế toàn bộ mã màu tím cứng trong `css/style.css` và toàn bộ emoji Unicode trong `index.html` + `js/app.js` thay vì sửa thủ công từng chỗ rồi bỏ sót.
>
>   3. **100% Test & Build Pass:** Mọi thay đổi phải vượt qua `npm test` và `npm run build`.

## PHẦN 0: TẠI SAO CÁC LẦN TRƯỚC VẪN SÓT MÀU TÍM & EMOJI? (BẮT BUỘC ĐỌC KỸ)

Qua kiểm tra trực tiếp mã nguồn `css/style.css`, `index.html`, và `js/app.js`, có **4 nguyên nhân gốc rễ** khiến AI Agent ở các đợt trước sửa mãi vẫn sót:

1. **Inline Style từ IndexedDB (`s.color` và `s.icon`) trong `js/app.js`:**

   * Trong IndexedDB (`subjects` store), mỗi môn học được lưu mặc định `s.color = '#8b5cf6'` (tím) và `s.icon = '📚'` (hoặc `'🥀🥀'`, `'📁'`).

   * Trong `js/app.js` (các hàm `renderDecks` dòng 1551, `renderQuestionBank` dòng 4947 & 5573, `openCreateSubjectModal` dòng 4880, `openManageSubjectModal`, `openBulkReassignModal` dòng 5920, `renderSubjectPerformanceTable` dòng 5852), code đang viết cứng inline style:
     `style="color: ${s.color || '#8b5cf6'}; background: ${s.color}22; border: 1px solid ${s.color}44;"`

   * Vì là `style="..."` gắn trực tiếp vào thẻ HTML nên mọi file CSS bên ngoài đều bị đè! Kết quả là dù chuyển sang **Trắng Cam** hay **Trắng Đen**, các thẻ môn học (`Chưa phân loại`, `tkt`, `tuh`, `csdl`) vẫn hiện khung tím chữ tím và emoji hoa hồng đỏ / sách nhiều màu!

2. **Hơn 80 dòng CSS viết cứng mã màu Tím (`!important`) nằm rải rác trong `css/style.css`:**

   * `.btn-primary:hover`, `.btn-secondary:hover` (dòng 1322–1339, 6882–6887): viết cứng `background: rgba(36, 29, 58, 0.95) !important; box-shadow: 0 0 16px rgba(167, 139, 250, 0.3) !important;` -> Trỏ chuột vào nút `"Thi thử"` bị biến thành màu tím!

   * `.cyber-dropdown-trigger`, `.cyber-dropdown-menu`, `.cyber-dropdown-item.active`, `.cyber-dropdown-item:hover` (dòng 5068–5428): viết cứng `#131122 !important`, `#12101e !important`, `rgba(124, 58, 237, 0.20) !important`, `#c4b5fd !important` -> Toàn bộ dropdown ở Ngân hàng câu hỏi và trang chủ vẫn giữ nguyên màu tím đen!

   * `.pixel-battery-wrapper`, `.pixel-battery-segment.active`, `.pixel-sparkle-badge` (dòng 1381–1560): viết cứng `#00f5d4` (xanh neon), `#e879f9` (hồng), `#7c3aed` (tím), nền đen `rgba(14, 11, 24, 0.9)` -> Hộp sạc pin khi hoàn thành bài học ở cả Trắng Đen lẫn Trắng Cam đều giữ nguyên màu hộp đêm tím/xanh neon!

   * `.btn-quiz-fast-next`, `.btn-quiz-card-next` (dòng 2268, 2323, 4252): viết cứng `background: linear-gradient(135deg, var(--accent) 0%, #c084fc 100%) !important;` -> Nút `"Tiếp theo"` trên điện thoại vẫn bị gradient tím!

3. **Nút Sidebar "Tổng quan" bị giãn cao gấp đôi và nháy 2 hiệu ứng chồng nhau:**

   * Trong `<li class="nav-item active" data-view="dashboard"><button>`, phần tử thứ 3 là `<span class="due-count-badge">205</span>` bị rớt xuống dòng thứ 2 của Grid 2 cột (`grid-template-columns: 44px 1fr`), làm ô "Tổng quan" phình to gấp đôi. Đồng thời `.nav-item::before` (thanh dọc bên trái) xung đột với hiệu ứng pill tròn của `.nav-item.active button`.

4. **Chế độ 5 ("Ôn theo môn học & chương") bị liệt khi bấm:**

   * Hàm `openTopicPickerModal()` trong `js/app.js` đang tham chiếu các phần tử cũ hoặc không khởi tạo danh sách môn học + chương trong `#modal-topic-picker`, khiến click vào thẻ số 5 hoặc nút `"Chọn môn & chương"` không mở được popup.

## PHẦN 1: KIẾN TRÚC BẢNG ĐIỀU PHỐI MÀU TRUNG TÂM (`css/theme.css`) — QUY CHỤP 100% MÀU SẮC THEO 3 THEME (MỤC 1.5, 1.6, 1.7, 2.4, 3.1, 3.2)

### 1.1. Nguyên tắc "Single Source of Truth" cho màu sắc

Toàn bộ các thành phần có màu trong ứng dụng **BẮT BUỘC** phải sử dụng biến CSS từ `css/theme.css`. Tuyệt đối cấm viết cứng mã màu `#7c3aed`, `#8b5cf6`, `#a78bfa`, `#c084fc`, `#c4b5fd`, `#e879f9`, `#ec4899`, `#131122`, `#12101e`, `rgba(36, 29, 58, ...)`, `rgba(124, 58, 237, ...)`, `rgba(167, 139, 250, ...)` trong `css/style.css` hoặc `js/app.js`.

### 1.2. Cập nhật toàn diện bảng biến màu trong `css/theme.css`

Mở `css/theme.css` và định nghĩa đầy đủ bộ biến điều phối sau cho cả 3 chế độ (`purple-pink`, `monochrome`, `white-orange`):

```
/* ==========================================================================
   CENTRAL THEME TOKEN SYSTEM — SINGLE SOURCE OF TRUTH (PHASE 1F)
   ========================================================================== */

:root,
html[data-theme="purple-pink"] {
  /* Core Surfaces */
  --bg-base: #0d0b14;
  --bg-surface-1: rgba(22, 18, 36, 0.78);
  --bg-surface-2: rgba(32, 26, 52, 0.84);
  --bg-elevated: rgba(28, 22, 46, 0.92);
  --bg-glass-liquid: rgba(24, 19, 40, 0.82);
  --bg-glass-hud: rgba(24, 19, 40, 0.65);

  /* Typography */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-on-accent: #0d0b14;

  /* Accents & Interactive Tokens */
  --accent: #c084fc;
  --accent-strong: #a855f7;
  --accent-soft: rgba(192, 132, 252, 0.16);
  --accent-border: rgba(192, 132, 252, 0.38);
  --accent-glow: rgba(192, 132, 252, 0.22);

  /* Buttons & Hover States (No hardcoded purple!) */
  --btn-primary-bg: #c084fc;
  --btn-primary-text: #0d0b14;
  --btn-primary-hover-bg: #d8b4fe;
  --btn-secondary-bg: rgba(255, 255, 255, 0.06);
  --btn-secondary-text: #f1f5f9;
  --btn-secondary-border: rgba(255, 255, 255, 0.14);
  --btn-secondary-hover-bg: rgba(192, 132, 252, 0.18);
  --btn-secondary-hover-border: rgba(192, 132, 252, 0.45);
  --btn-secondary-hover-text: #ffffff;

  /* Card & Spotlight Overlay */
  --card-border: rgba(255, 255, 255, 0.10);
  --card-hover-border: rgba(192, 132, 252, 0.45);
  --card-hover-bg: rgba(38, 30, 62, 0.88);
  --card-spotlight: rgba(192, 132, 252, 0.10);
  --card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.55);

  /* Dropdown System */
  --dropdown-bg: rgba(24, 19, 40, 0.95);
  --dropdown-menu-bg: rgba(20, 16, 34, 0.96);
  --dropdown-border: rgba(192, 132, 252, 0.28);
  --dropdown-item-hover-bg: rgba(192, 132, 252, 0.18);
  --dropdown-item-active-bg: rgba(192, 132, 252, 0.24);
  --dropdown-item-active-text: #e9d5ff;

  /* Subject Pill & Badge Tokens */
  --subject-pill-bg: rgba(192, 132, 252, 0.16);
  --subject-pill-text: #e9d5ff;
  --subject-pill-border: rgba(192, 132, 252, 0.36);
  --subject-pill-active-bg: #c084fc;
  --subject-pill-active-text: #0d0b14;

  /* Battery / Energy Charge Widget */
  --battery-box-bg: rgba(20, 16, 34, 0.88);
  --battery-box-border: rgba(192, 132, 252, 0.40);
  --battery-box-glow: rgba(192, 132, 252, 0.18);
  --battery-segment-bg: rgba(255, 255, 255, 0.08);
  --battery-segment-active-bg: #c084fc;
  --battery-segment-active-glow: rgba(192, 132, 252, 0.45);
  --battery-label-color: #e9d5ff;
  --battery-badge-color: #f472b6;
}

/* ==========================================================================
   MODE 2: TRẮNG ĐEN (MONOCHROME) — TUYỆT ĐỐI CHỈ TRẮNG, XÁM, ĐEN (ZERO COLOR)
   ========================================================================== */
html[data-theme="monochrome"] {
  --bg-base: #09090b;
  --bg-surface-1: rgba(20, 20, 23, 0.82);
  --bg-surface-2: rgba(30, 30, 35, 0.88);
  --bg-elevated: rgba(24, 24, 28, 0.94);
  --bg-glass-liquid: rgba(22, 22, 26, 0.84);
  --bg-glass-hud: rgba(24, 24, 28, 0.72);

  --text-primary: #ffffff;
  --text-secondary: #d4d4d8;
  --text-muted: #a1a1aa;
  --text-on-accent: #09090b;

  --accent: #ffffff;
  --accent-strong: #e4e4e7;
  --accent-soft: rgba(255, 255, 255, 0.12);
  --accent-border: rgba(255, 255, 255, 0.35);
  --accent-glow: rgba(255, 255, 255, 0.14);

  --btn-primary-bg: #ffffff;
  --btn-primary-text: #09090b;
  --btn-primary-hover-bg: #e4e4e7;
  --btn-secondary-bg: rgba(255, 255, 255, 0.07);
  --btn-secondary-text: #f4f4f5;
  --btn-secondary-border: rgba(255, 255, 255, 0.18);
  --btn-secondary-hover-bg: rgba(255, 255, 255, 0.18);
  --btn-secondary-hover-border: rgba(255, 255, 255, 0.55);
  --btn-secondary-hover-text: #ffffff;

  --card-border: rgba(255, 255, 255, 0.14);
  --card-hover-border: rgba(255, 255, 255, 0.48);
  --card-hover-bg: rgba(36, 36, 42, 0.92);
  --card-spotlight: rgba(255, 255, 255, 0.08);
  --card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.75);

  --dropdown-bg: rgba(20, 20, 23, 0.96);
  --dropdown-menu-bg: rgba(16, 16, 19, 0.98);
  --dropdown-border: rgba(255, 255, 255, 0.24);
  --dropdown-item-hover-bg: rgba(255, 255, 255, 0.14);
  --dropdown-item-active-bg: #ffffff;
  --dropdown-item-active-text: #09090b;

  --subject-pill-bg: rgba(255, 255, 255, 0.10);
  --subject-pill-text: #f4f4f5;
  --subject-pill-border: rgba(255, 255, 255, 0.26);
  --subject-pill-active-bg: #ffffff;
  --subject-pill-active-text: #09090b;

  /* Battery Widget in Monochrome: 100% Crisp White/Silver on Matte Black */
  --battery-box-bg: rgba(18, 18, 20, 0.95);
  --battery-box-border: rgba(255, 255, 255, 0.35);
  --battery-box-glow: rgba(255, 255, 255, 0.12);
  --battery-segment-bg: rgba(255, 255, 255, 0.10);
  --battery-segment-active-bg: #ffffff;
  --battery-segment-active-glow: rgba(255, 255, 255, 0.45);
  --battery-label-color: #ffffff;
  --battery-badge-color: #e4e4e7;
}

/* ==========================================================================
   MODE 3: TRẮNG CAM (WHITE-ORANGE) — TƯƠNG PHẢN CAO, NỀN KEM ẤM, KHÔNG CÒN TÍM
   ========================================================================== */
html[data-theme="white-orange"] {
  --bg-base: #fff7ed;
  --bg-surface-1: rgba(255, 255, 255, 0.92);
  --bg-surface-2: rgba(255, 247, 237, 0.96);
  --bg-elevated: rgba(255, 255, 255, 0.98);
  --bg-glass-liquid: rgba(255, 252, 248, 0.88);
  --bg-glass-hud: rgba(255, 250, 245, 0.82);

  /* High-Contrast Typography for Daylight Readability */
  --text-primary: #1c1917;
  --text-secondary: #44403c;
  --text-muted: #78716c;
  --text-on-accent: #ffffff;

  --accent: #ea580c;
  --accent-strong: #c2410c;
  --accent-soft: rgba(234, 88, 12, 0.12);
  --accent-border: rgba(234, 88, 12, 0.38);
  --accent-glow: rgba(234, 88, 12, 0.18);

  --btn-primary-bg: #ea580c;
  --btn-primary-text: #ffffff;
  --btn-primary-hover-bg: #c2410c;
  --btn-secondary-bg: #fff7ed;
  --btn-secondary-text: #292524;
  --btn-secondary-border: rgba(234, 88, 12, 0.28);
  --btn-secondary-hover-bg: #ffedd5;
  --btn-secondary-hover-border: #ea580c;
  --btn-secondary-hover-text: #9a3412;

  /* Cards Stand Out Clearly Without Needing Hover (Item 2.4 & 2.5) */
  --card-border: rgba(234, 88, 12, 0.26);
  --card-hover-border: #ea580c;
  --card-hover-bg: #ffffff;
  --card-spotlight: rgba(234, 88, 12, 0.07);
  --card-shadow: 0 8px 24px -6px rgba(154, 52, 18, 0.12), 0 2px 6px -1px rgba(154, 52, 18, 0.07);

  /* Dropdown System in White-Orange (Item 2.3) */
  --dropdown-bg: #ffffff;
  --dropdown-menu-bg: #ffffff;
  --dropdown-border: rgba(234, 88, 12, 0.32);
  --dropdown-item-hover-bg: #ffedd5;
  --dropdown-item-active-bg: #ea580c;
  --dropdown-item-active-text: #ffffff;

  /* Subject Pill & Badge in White-Orange (Item 2.1) */
  --subject-pill-bg: #ffedd5;
  --subject-pill-text: #9a3412;
  --subject-pill-border: rgba(234, 88, 12, 0.35);
  --subject-pill-active-bg: #ea580c;
  --subject-pill-active-text: #ffffff;

  /* Battery Widget in White-Orange: Clean Warm Ivory Surface + Vibrant Orange Bars (Item 1.3) */
  --battery-box-bg: #fff7ed;
  --battery-box-border: rgba(234, 88, 12, 0.42);
  --battery-box-glow: rgba(234, 88, 12, 0.14);
  --battery-segment-bg: rgba(234, 88, 12, 0.14);
  --battery-segment-active-bg: #ea580c;
  --battery-segment-active-glow: rgba(234, 88, 12, 0.35);
  --battery-label-color: #9a3412;
  --battery-badge-color: #ea580c;
}

```

## PHẦN 2: GIẢI QUYẾT TRIỆT ĐỂ 13 YÊU CẦU NHÓM 1 (`1. CHUNG`)

### Mục 1.1 & 1.10: Xóa bỏ Noti Badge ở Sidebar "Tổng quan" & Sửa dứt điểm Animation chuyển Tab Sidebar (`image_a96ab3.png`)

* **Hiện trạng lỗi (`image_a96ab3.png`):**

  1. Nút `"Tổng quan"` trong Sidebar bị phình to chiều dọc gấp đôi các nút khác vì chứa thẻ `<span id="sidebar-due-badge" class="due-count-badge">...</span>`.

  2. Khi chuyển tab trong Sidebar, lúc đầu nảy 1 thanh dọc bên trái (`::before`), sau đó lại biến thành hình tròn/pill bao trọn gây xung đột thị giác.

* **Cách sửa bắt buộc:**

  1. Trong `index.html`, tìm bên trong `<li class="nav-item active" data-view="dashboard">` và **xóa hẳn phần tử `.due-count-badge` / `#sidebar-due-badge`** (trong `js/app.js`, nếu có hàm cập nhật `sidebar-due-badge` thì kiểm tra `if (badgeEl)` an toàn hoặc bỏ qua).

  2. Trong `css/style.css` và `css/theme.css`, xóa hoàn toàn pseudo-element thanh dọc bên trái `.app-sidebar .nav-item::before`, `.app-sidebar .nav-item.active::before`, `.nav-links li::before` (`display: none !important; content: none !important;`).

  3. Cố định chiều cao mọi nút trong Sidebar đúng `44px`, căn giữa chuẩn xác, chỉ dùng **1 kiểu hiệu ứng Pill bo tròn mượt mà duy nhất**:

     ```
     .app-sidebar .nav-item::before,
     .app-sidebar .nav-item::after,
     .app-sidebar .nav-item button::before,
     .app-sidebar .nav-item button::after {
       display: none !important;
       content: none !important;
     }
     
     .app-sidebar .nav-item button {
       display: flex !important;
       align-items: center !important;
       justify-content: flex-start !important;
       gap: 12px !important;
       width: 100% !important;
       height: 44px !important;
       min-height: 44px !important;
       max-height: 44px !important;
       padding: 0 12px !important;
       border-radius: 999px !important;
       border: 1px solid transparent !important;
       background: transparent !important;
       color: var(--text-secondary) !important;
       transition: background-color 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                   color 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                   transform 0.2s cubic-bezier(0.22, 1, 0.36, 1) !important;
     }
     
     .app-sidebar.is-collapsed .nav-item button {
       width: 44px !important;
       padding: 0 !important;
       margin: 0 auto !important;
       justify-content: center !important;
     }
     
     .app-sidebar .nav-item.active button {
       background: var(--btn-primary-bg) !important;
       color: var(--btn-primary-text) !important;
       font-weight: 600 !important;
       box-shadow: 0 4px 14px var(--accent-glow) !important;
     }
     
     .app-sidebar .nav-item:not(.active) button:hover {
       background: var(--accent-soft) !important;
       color: var(--text-primary) !important;
     }
     
     ```

### Mục 1.2 & 1.3: Đồng bộ Thanh Pin Năng Lượng (`.pixel-battery-wrapper`) cho Trắng Đen & Trắng Cam (`image_a969d9.png`, `image_a97175.png`)

* **Hiện trạng lỗi:**

  * Ở chế độ **Trắng Đen** (`image_a969d9.png`), popup hoàn thành bài học vẫn hiện hộp pin viền xanh neon `#00f5d4`, 10 vạch pin xanh ngọc, icon tia sét cam và dòng chữ `OVERCHARGED 100%` màu tím hồng `#e879f9`.

  * Ở chế độ **Trắng Cam** (`image_a97175.png`), trên nền popup trắng lại lòi ra hộp đen xì, vạch xanh neon và chữ tím hồng rất lệch tông.

* **Cách sửa bắt buộc trong `css/style.css` (dòng 1381–1560) và `css/theme.css`:**
  Thay thế toàn bộ màu cứng của `.pixel-battery-wrapper`, `.pixel-battery-header`, `.pixel-battery-body`, `.pixel-battery-segment`, và `.pixel-sparkle-badge` bằng hệ biến `--battery-*`:

  ```
  .pixel-battery-wrapper {
    background: var(--battery-box-bg) !important;
    border: 1.5px solid var(--battery-box-border) !important;
    box-shadow: 0 8px 24px var(--battery-box-glow) !important;
    border-radius: 18px !important;
    padding: 16px 20px !important;
  }
  
  .pixel-battery-title,
  .pixel-battery-percent {
    color: var(--battery-label-color) !important;
    text-shadow: none !important;
  }
  
  .pixel-battery-body {
    background: var(--bg-base) !important;
    border: 1.5px solid var(--battery-box-border) !important;
    border-radius: 10px !important;
  }
  
  .pixel-battery-body::after {
    background: var(--battery-box-border) !important;
  }
  
  .pixel-battery-segment,
  .pixel-battery-segment[data-segment] {
    background: var(--battery-segment-bg) !important;
    box-shadow: none !important;
  }
  
  .pixel-battery-segment.active,
  .pixel-battery-segment[data-segment].active {
    background: var(--battery-segment-active-bg) !important;
    box-shadow: 0 0 8px var(--battery-segment-active-glow) !important;
  }
  
  .pixel-sparkle-badge {
    color: var(--battery-badge-color) !important;
    text-shadow: none !important;
    font-weight: 700 !important;
  }
  
  ```

### Mục 1.4 & 2.2: Xóa sạch 100% Icon Emoji Đa Sắc trên toàn bộ App — Thay bằng SVG Đơn Sắc (`currentColor`)

* **Hiện trạng lỗi (`image_a96659.png`, `image_a95ecf.png`, `image_a96290.png`, `image_a90c19.jpg`, `image_a904d5.png`, `image_a97175.png`):**
  Vẫn còn hàng loạt emoji nhiều màu chưa được chuyển sang SVG đơn sắc:

  * Tab **Ngân hàng câu hỏi** (`image_a96659.png`): `📚 Chọn môn học`, `🥀 tuh`, `📚 tkt`, `📁 Chưa phân loại`, `🌐 Tất cả môn`, `➕ Tạo môn mới...`, `⚡ Mọi độ khó`, `🏷️ Tất cả nguồn`, nút `+ Tạo môn học`, nút `⚙️ Quản lý môn`.

  * Khu vực **Bộ câu hỏi** (`image_a96290.png`): nút `🎯 Ôn cả môn`, `⚙️ Quản lý môn`, pill môn học `📚 Tất cả môn`, `🥀 tuh`, `📚 tkt`, `🥀🥀 csdl`, `📁 Chưa phân loại`.

  * Màn hình **Quiz / Luyện tập** (`image_a95ecf.png`): nút `🧠 Đoán đáp án`, badge `🔥 1`.

  * Màn hình **Hoàn thành phiên học** (`image_a97175.png`, `image_a969d9.png`): icon `⚡ PIN NĂNG LƯỢNG`, `⚡ OVERCHARGED 100% ⚡`, `🌟`, nút `Xem thống kê 📊`.

  * Modal **Tạo môn học mới** (`image_a904d5.png`): lưới chọn biểu tượng môn học vẫn là các emoji màu (`📚`, `📐`, `🧪`, `🧬`, `💻`, `🌐`, `🏛️`, `⚖️`, `🎨`, `🎵`, `🧠`, `🩺`, `📊`, `🚀`, `⚡`, `🔥`, `💡`, `🎯`, `🏆`, `🌟`).

* **Giải pháp triệt để (2 lớp bảo vệ):**

  1. **Tạo bộ helper `App.getMonoSvg(key)` trong `js/app.js`:**

     * Xây dựng bảng ánh xạ toàn bộ các khóa icon và mọi ký tự emoji cũ (`📚`, `🥀`, `📁`, `🌐`, `➕`, `⚡`, `🏷️`, `🎯`, `⚙️`, `🧠`, `🔥`, `🌟`, `📊`, `📐`, `🧪`, `🧬`, `💻`, `🏛️`, `⚖️`, `🎨`, `🎵`, `🩺`, `🚀`, `💡`, `🏆`, `🎲`, `⏱️`, `✨`, `🔍`, `🗑️`, `✏️`) sang **inline `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ...>`**.

     * Khi dữ liệu môn học cũ trong IndexedDB có `s.icon = '🥀🥀'` hoặc `'📚'`, hàm `App.renderSubjectIcon(s.icon)` sẽ **tự động chuyển đổi sang SVG đơn sắc tương ứng** (ví dụ `🥀` -> SVG bông hoa/lá nét mảnh đơn sắc `currentColor`, `📚` -> SVG quyển sách đơn sắc `currentColor`, `📁` -> SVG thư mục đơn sắc `currentColor`) — **tuyệt đối không bao giờ in ký tự emoji màu ra DOM!**

  2. **Trong Modal Tạo/Sửa Môn Học (`#modal-create-subject` - `image_a904d5.png`):**

     * Thay thế lưới 20 nút emoji màu bằng **20 nút biểu tượng SVG đơn sắc (`stroke="currentColor"`)** sử dụng `data-icon-key="book"`, `"math"`, `"flask"`, `"dna"`, `"code"`, `"globe"`, `"landmark"`, `"scale"`, `"palette"`, `"music"`, `"brain"`, `"pulse"`, `"chart"`, `"rocket"`, `"zap"`, `"flame"`, `"bulb"`, `"target"`, `"trophy"`, `"star"`.

     * Toàn bộ icon trong modal kế thừa màu `var(--text-primary)` và khi được chọn (`.active`) sẽ mang màu `var(--btn-primary-bg)` / `var(--btn-primary-text)`.

### Mục 1.5, 1.6, 1.7: Sửa toàn bộ hiệu ứng Hover Nút & Ô sáng / Spotlight bị lòi màu Tím (`image_a962d4.png`)

* **Hiện trạng lỗi (`image_a962d4.png`):**

  * Trỏ chuột vào nút `"Thi thử"` (`.btn-secondary:hover`), nút bị đổi sang nền tím sẫm `rgba(36, 29, 58, 0.95)` và viền/bóng tím.

  * Trỏ chuột vào các thẻ hoặc ô sáng sẵn, lớp radial-gradient / spotlight lòi ra ánh tím.

* **Cách sửa bắt buộc trong `css/style.css`:**

  1. Tại dòng `1320–1345` và `6880–6895` của `css/style.css`, thay thế toàn bộ rule `.btn-primary:hover`, `.btn-secondary`, `.btn-secondary:hover`:

     ```
     .btn-primary {
       background: var(--btn-primary-bg) !important;
       color: var(--btn-primary-text) !important;
       border: 1px solid transparent !important;
       box-shadow: none !important;
     }
     .btn-primary:hover {
       background: var(--btn-primary-hover-bg) !important;
       color: var(--btn-primary-text) !important;
       box-shadow: 0 6px 20px var(--accent-glow) !important;
       transform: translateY(-1px);
     }
     .btn-secondary {
       background: var(--btn-secondary-bg) !important;
       color: var(--btn-secondary-text) !important;
       border: 1px solid var(--btn-secondary-border) !important;
       box-shadow: none !important;
     }
     .btn-secondary:hover {
       background: var(--btn-secondary-hover-bg) !important;
       color: var(--btn-secondary-hover-text) !important;
       border-color: var(--btn-secondary-hover-border) !important;
       box-shadow: 0 4px 14px var(--accent-glow) !important;
       transform: translateY(-1px);
     }
     
     ```

  2. Thay thế toàn bộ các hiệu ứng ánh sáng nền / spotlight (`.deck-card::before`, `.deck-card::after`, `.mode-card::before`, `.stat-card::before`, `#bg-layer::after`) để dùng `var(--card-spotlight)` thay vì `rgba(167, 139, 250, ...)` hay `rgba(192, 132, 252, ...)`.

### Mục 1.8: Nút `"Tiếp theo"` đặt ở trên trên Điện thoại (Mobile) phải đơn sắc & đồng bộ theo Theme (`image_a95ecf.png`)

* **Hiện trạng lỗi (`image_a95ecf.png`):**
  Ở giao diện câu hỏi (`#view-quiz`), nút `"Tiếp theo ->"` đặt ở góc trên bên phải của thẻ câu hỏi (`#btn-quiz-card-next` / `.btn-quiz-card-next` và `#btn-quiz-fast-next`) đang dùng `background: linear-gradient(135deg, var(--accent) 0%, #c084fc 100%) !important;`, khiến ở chế độ Trắng Cam hoặc Trắng Đen nó vẫn bị pha màu tím `#c084fc` và có dải màu gradient!

* **Cách sửa bắt buộc trong `css/style.css` (dòng 2265–2330 và 4248–4265):**

  ```
  .btn-quiz-fast-next,
  .btn-quiz-card-next,
  #btn-quiz-card-next,
  #btn-quiz-fast-next {
    background: var(--btn-primary-bg) !important;
    color: var(--btn-primary-text) !important;
    border: 1px solid var(--accent-border) !important;
    box-shadow: 0 4px 12px var(--accent-glow) !important;
    border-radius: 999px !important;
    font-weight: 600 !important;
  }
  .btn-quiz-fast-next:hover,
  .btn-quiz-card-next:hover {
    background: var(--btn-primary-hover-bg) !important;
    color: var(--btn-primary-text) !important;
  }
  
  ```

### Mục 1.9: Khung bao ngoài phần Chọn Theme & Chuỗi ở góc trên phải chuyển sang kiểu Liquid Glass

* **Yêu cầu:** Cụm góc trên bên phải (chứa 3 nút icon chuyển Theme và huy hiệu Chuỗi ngày học) được đặt trong một khung bao ngoài kiểu **Liquid Glass** tinh tế, đồng bộ kích thước và hiệu ứng kính mờ trên cả 3 theme.

* **Cách sửa bắt buộc:**

  ```
  .topbar-hud-capsule,
  .floating-top-right-hud {
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    height: 44px !important;
    padding: 4px 8px !important;
    border-radius: 999px !important;
    background: var(--bg-glass-hud) !important;
    backdrop-filter: blur(20px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
    border: 1px solid var(--card-border) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14),
                inset 0 1px 0 rgba(255, 255, 255, 0.16) !important;
  }
  
  ```

### Mục 1.11: Chuyển toàn bộ Popup / Modal sang kiểu Liquid Glass (Độ đục vừa phải, không xuyên thấu quá mức gây giảm tương phản)

* **Yêu cầu:** Các popup (`.modal-box` trong `#modal-create-subject`, `#modal-manage-subject`, `#modal-session-complete`, `#modal-topic-picker`, `#modal-exam-setup`, `#modal-sprint-setup`, `#modal-edit-card`) chuyển sang phong cách **Liquid Glass** (kính mờ có chiều sâu, nhưng giữ `opacity` nền khoảng `0.82–0.90` để chữ bên trong luôn rõ nét, tương phản cao, không bị chữ phía sau đâm xuyên qua gây rối mắt).

* **Cách sửa bắt buộc:**

  ```
  .modal-overlay {
    background: rgba(0, 0, 0, 0.55) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
  }
  html[data-theme="white-orange"] .modal-overlay {
    background: rgba(28, 25, 23, 0.35) !important;
  }
  
  .modal-box {
    background: var(--bg-glass-liquid) !important;
    backdrop-filter: blur(28px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(160%) !important;
    border: 1px solid var(--card-border) !important;
    box-shadow: var(--card-shadow),
                inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
    color: var(--text-primary) !important;
    border-radius: 24px !important;
  }
  
  ```

### Mục 1.12: Khôi phục Chế độ 5 ("Ôn theo môn học & chương") VÀ Đẩy Khối 7 Chế Độ Ôn Tập lên trên Khối Bộ Câu Hỏi ở Trang chủ (`#view-dashboard`)

* **Yêu cầu kép:**

  1. **Thứ tự bố cục Trang chủ (`#view-dashboard` trong `index.html`):**

     * Ngay dưới màn hình **Hero Quote (`100vh`)**, khi người dùng cuộn xuống, khối xuất hiện **ĐẦU TIÊN** phải là **7 Chế độ ôn tập thông minh (`.study-modes-section` / `.study-modes-grid`)**, sau đó mới đến khối **Bộ câu hỏi của bạn (`#dashboard-decks-section` / `#dashboard-decks-grid`)**.

  2. **Sửa lỗi bấm vào Chế độ 5 ("5. Ôn theo môn học & chương") không hoạt động:**

     * Kiểm tra cả thẻ `.mode-card[data-mode="topic"]` ở Trang chủ (`#view-dashboard`) và nút `#btn-mode-topic` ở Thư viện thẻ (`#view-decks`).

     * Viết lại hàm `openTopicPickerModal()` và `startTopicSession()` trong `js/app.js` để:

       * Khi bấm vào thẻ Mode 5 hoặc nút `"Chọn môn & chương"`, mở ngay `#modal-topic-picker` (`.modal-overlay.active`, `display: flex`).

       * Bên trong `#modal-topic-picker`, hiển thị danh sách **Môn học** ở phía trên (cho phép lọc theo môn hoặc chọn "Tất cả môn") và danh sách **Chương (`topic`)** tương ứng ở phía dưới (kèm số lượng câu hỏi của từng chương, nút "Chọn tất cả / Bỏ chọn tất cả").

       * Khi bấm nút `"Bắt đầu ôn tập"`, nếu người dùng đã chọn ít nhất 1 chương (hoặc chọn 1 môn học), lọc danh sách câu hỏi khớp điều kiện và khởi chạy `this.startSession(filteredCards, '5. Ôn theo môn học & chương')` rồi đóng modal.

### Mục 1.13: Tối ưu Hiệu năng toàn diện 140+ FPS

* Loại bỏ các bộ lọc `filter: blur(...)` nặng trên các lớp nền chuyển động liên tục; chỉ dùng `backdrop-filter` trên các thành phần tĩnh như `.app-sidebar`, `.topbar-hud-capsule`, và `.modal-box` khi mở.

* Sử dụng `transform: translate3d(...)` và `will-change: transform` cho animation đóng/mở Sidebar và lật thẻ Flashcard.

* Không gắn listener `mousemove` toàn cục gây reflow trên từng card nếu không cần thiết.

## PHẦN 3: GIẢI QUYẾT TRIỆT ĐỂ 6 YÊU CẦU NHÓM 2 (`2. MODE TRẮNG CAM`) & 2 YÊU CẦU NHÓM 3 (`3. MODE TRẮNG ĐEN`)

### Mục 2.1 & 3.1: Đồng bộ Chữ & Khung Tên Môn Học (`subject-pill`, `deck-subject-badge`) sang Trắng Cam và Trắng Đen (`image_a97210.jpg`)

* **Nguyên nhân:** Như đã phân tích ở Phần 0, `js/app.js` đang gắn cứng `style="color: ${s.color || '#8b5cf6'}; background: ${s.color}22; border: 1px solid ${s.color}44;"` vào các badge môn học trên thẻ Bộ câu hỏi (`Chưa phân loại`, `tkt`) và thanh pill lọc môn học (`tuh`, `tkt`, `csdl`).

* **Cách sửa bắt buộc trong `js/app.js` và `css/theme.css`:**

  1. Trong `js/app.js` (tại tất cả các hàm `renderDecks`, `renderDashboardDecks`, `renderSubjectFilterBar`, `renderQuestionBank`, `renderSubjectPerformanceTable`, `openManageSubjectModal`, `openBulkReassignModal`):

     * **XÓA BỎ** việc gắn inline `style="background: ${s.color}...; color: ${s.color}..."` trên các badge môn học và nút pill môn học!

     * Thay vào đó, sử dụng class chuẩn `.subject-badge-pill` và `.subject-filter-pill` (chỉ truyền biến `--subj-custom-color: ${s.color || 'var(--accent)'}` nếu cần cho mode Tím Hồng, còn ở mode Trắng Đen và Trắng Cam thì ép dùng hoàn toàn biến `--subject-pill-*` của theme!).

  2. Trong `css/theme.css`:

     ```
     .subject-badge-pill,
     .deck-subject-badge,
     .subject-filter-pill:not(.active) {
       background: var(--subject-pill-bg) !important;
       color: var(--subject-pill-text) !important;
       border: 1px solid var(--subject-pill-border) !important;
       border-radius: 999px !important;
       font-weight: 600 !important;
     }
     
     .subject-filter-pill.active {
       background: var(--subject-pill-active-bg) !important;
       color: var(--subject-pill-active-text) !important;
       border-color: var(--subject-pill-active-bg) !important;
     }
     
     ```

### Mục 2.3 & 3.2: Đồng bộ toàn bộ Dropdown (`.cyber-dropdown-*`) sang Trắng Cam & Trắng Đen (`image_a90c19.jpg`, `image_a96659.png`)

* **Hiện trạng lỗi:**

  * Trong `image_a90c19.jpg` (Mode Trắng Cam): Khi mở dropdown chọn môn (`tkt`), dòng đang chọn `tkt` vẫn có nền tím `rgba(124, 58, 237, 0.20)` và chữ tím `#c4b5fd`, nút `+ Tạo môn mới...` cũng màu tím.

  * Trong `image_a96659.png` (Mode Trắng Đen): Toàn bộ 4 ô dropdown ở Ngân hàng câu hỏi (`tkt`, `Chọn chủ đề / chương`, `Mọi độ khó`, `Tất cả nguồn`) và menu xổ xuống đều có nền tím đen `#131122` và highlight tím.

* **Cách sửa bắt buộc trong `css/style.css` (dòng 5068–5428):**
  Thay thế toàn bộ màu cứng của `.cyber-dropdown-trigger`, `.cyber-dropdown-menu`, `.cyber-dropdown-item` bằng biến `--dropdown-*`:

  ```
  .cyber-dropdown-trigger {
    background-color: var(--dropdown-bg) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--dropdown-border) !important;
    box-shadow: var(--card-shadow) !important;
  }
  
  .cyber-dropdown.open .cyber-dropdown-trigger,
  .cyber-dropdown-trigger:hover {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-soft) !important;
  }
  
  .cyber-dropdown-menu {
    background-color: var(--dropdown-menu-bg) !important;
    border: 1px solid var(--dropdown-border) !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28) !important;
  }
  
  .cyber-dropdown-item {
    color: var(--text-primary) !important;
  }
  
  .cyber-dropdown-item:hover {
    background-color: var(--dropdown-item-hover-bg) !important;
    color: var(--text-primary) !important;
  }
  
  .cyber-dropdown-item.active {
    background-color: var(--dropdown-item-active-bg) !important;
    color: var(--dropdown-item-active-text) !important;
    font-weight: 600 !important;
  }
  
  .cyber-dropdown-item .item-count,
  .cyber-dropdown-item:hover .item-count {
    color: inherit !important;
    opacity: 0.78;
  }
  
  ```

### Mục 2.4 & 2.5: Tăng độ tương phản Mode Trắng Cam — Các thẻ ở trang đầu phải rõ nét ngay ở trạng thái bình thường (không cần trỏ chuột vào mới hiện màu cam)

* **Hiện trạng lỗi (`image_a97210.jpg`, `image_a962d4.png`):**
  Ở chế độ Trắng Cam, các thẻ Bộ câu hỏi và 7 Chế độ ôn tập có nền trắng nhạt nhòa, viền gần như tàng hình, chữ phụ mờ nhạt; phải di chuột vào từng thẻ thì viền/nền cam mới hiện lên.

* **Cách sửa bắt buộc cho `html[data-theme="white-orange"]`:**

  ```
  html[data-theme="white-orange"] .deck-card,
  html[data-theme="white-orange"] .mode-card,
  html[data-theme="white-orange"] .stat-card,
  html[data-theme="white-orange"] .question-bank-item {
    background: #ffffff !important;
    border: 1.5px solid rgba(234, 88, 12, 0.28) !important;
    box-shadow: 0 6px 20px -4px rgba(154, 52, 18, 0.10),
                0 2px 6px -1px rgba(154, 52, 18, 0.06) !important;
    color: #1c1917 !important;
  }
  
  /* Tạo điểm nhấn sắc cam tinh tế ngay ở trạng thái nghỉ (Resting State) */
  html[data-theme="white-orange"] .deck-card .deck-title,
  html[data-theme="white-orange"] .mode-card h3 {
    color: #1c1917 !important;
    font-weight: 700 !important;
  }
  
  html[data-theme="white-orange"] .mode-card .mode-badge {
    background: #ffedd5 !important;
    color: #c2410c !important;
    border: 1px solid rgba(234, 88, 12, 0.35) !important;
    font-weight: 600 !important;
  }
  
  html[data-theme="white-orange"] .mode-card .mode-icon-box {
    background: #fff7ed !important;
    color: #ea580c !important;
    border: 1px solid rgba(234, 88, 12, 0.30) !important;
  }
  
  html[data-theme="white-orange"] .deck-card:hover,
  html[data-theme="white-orange"] .mode-card:hover {
    border-color: #ea580c !important;
    background: #fffaf5 !important;
    box-shadow: 0 12px 28px -6px rgba(234, 88, 12, 0.22) !important;
    transform: translateY(-2px);
  }
  
  ```

### Mục 2.6: Tinh chỉnh Typography Quote Hero riêng cho Mode Trắng Cam

* **Yêu cầu của người dùng:**

  * Ở chế độ **Trắng Cam (`white-orange`)**:

    1. **Các chữ bình thường trong Quote (`.hero-title-main`, `.hero-title-sub`):** Chuyển sang **font chữ có chân (Serif)** nhưng **nét vẫn dày (`font-weight: 700`) và các chữ xếp sát nhau (`letter-spacing: -0.03em`)**.

    2. **Các chữ in nghiêng điểm nhấn (`.hero-title-accent`):** **Bỏ in đậm (`font-weight: 400 !important; font-style: italic !important;`)** để tạo sự tương phản thanh lịch giữa nét dày đứng và nét mảnh nghiêng.

* **Cách sửa bắt buộc trong `css/theme.css`:**

  ```
  /* Google Fonts import bổ sung Playfair Display / Newsreader hoặc Lora + fallback Georgia/Times */
  html[data-theme="white-orange"] .hero-quote-line .hero-title-main,
  html[data-theme="white-orange"] .hero-quote-line .hero-title-sub {
    font-family: 'Playfair Display', 'Newsreader', 'Noto Serif Display', Georgia, serif !important;
    font-weight: 700 !important;
    font-style: normal !important;
    letter-spacing: -0.035em !important;
    color: #1c1917 !important;
  }
  
  html[data-theme="white-orange"] .hero-quote-line .hero-title-accent {
    font-family: 'Playfair Display', 'Instrument Serif', Georgia, serif !important;
    font-weight: 400 !important; /* Bỏ in đậm cho chữ in nghiêng */
    font-style: italic !important;
    letter-spacing: -0.02em !important;
    color: #ea580c !important;
  }
  
  ```

## PHẦN 4: SCRIPT TỰ ĐỘNG QUÉT SẠCH MÀU TÍM CỨNG & EMOJI ĐA SẮC (`scripts/sanitize-1f.js`)

Để đảm bảo AI Agent không bỏ sót bất kỳ dòng nào trong 7.000 dòng CSS và 6.200 dòng JS, hãy tạo và chạy script Node.js sau trước khi tinh chỉnh:

```
// File: scripts/sanitize-1f.js
const fs = require('fs');
const path = require('path');

// 1. Quét và thay thế toàn bộ mã màu tím viết cứng trong css/style.css
const stylePath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(stylePath, 'utf8');

const cssReplacements = [
  // Hover nút bị tím
  [/rgba\(\s*36\s*,\s*29\s*,\s*58\s*,\s*0\.95\s*\)\s*!important/gi, 'var(--btn-secondary-hover-bg) !important'],
  [/rgba\(\s*36\s*,\s*29\s*,\s*58\s*,\s*[0-9.]+\s*\)/gi, 'var(--btn-secondary-hover-bg)'],
  // Dropdown nền đen tím & item active tím
  [/#131122\s*!important/gi, 'var(--dropdown-bg) !important'],
  [/#12101e\s*!important/gi, 'var(--dropdown-menu-bg) !important'],
  [/rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*0\.20\s*\)\s*!important/gi, 'var(--dropdown-item-active-bg) !important'],
  [/#c4b5fd\s*!important/gi, 'var(--dropdown-item-active-text) !important'],
  // Nút Tiếp theo trên Mobile bị gradient tím
  [/linear-gradient\(\s*135deg\s*,\s*var\(--accent\)\s*0%\s*,\s*#c084fc\s*100%\s*\)\s*!important/gi, 'var(--btn-primary-bg) !important'],
  // Các mã màu tím rời rạc còn sót
  [/rgba\(\s*167\s*,\s*139\s*,\s*250\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-glow)'],
  [/rgba\(\s*192\s*,\s*132\s*,\s*252\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-soft)'],
  [/rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-soft)'],
  [/#a78bfa/gi, 'var(--accent)'],
  [/#8b5cf6/gi, 'var(--accent)'],
  [/#7c3aed/gi, 'var(--accent-strong)']
];

for (const [pattern, replacement] of cssReplacements) {
  css = css.replace(pattern, replacement);
}
fs.writeFileSync(stylePath, css, 'utf8');
console.log('[sanitize-1f] Đã đồng bộ xong toàn bộ mã màu cứng trong css/style.css');

```

Sau khi chạy script trên, AI Agent phải kiểm tra bằng lệnh:

```
node -e "
const css = require('fs').readFileSync('css/style.css', 'utf8');
const matches = css.match(/#8b5cf6|#7c3aed|#a78bfa|#131122|#12101e|rgba\(36,\s*29,\s*58|rgba\(124,\s*58,\s*237/gi);
console.log('Remaining hardcoded purple tokens in style.css:', matches ? matches.length : 0);
"

```

Kết quả bắt buộc phải là **`0`**!

## PHẦN 5: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

AI Coding Agent chỉ được phép kết thúc nhiệm vụ khi **toàn bộ 12 tiêu chí nghiệm thu dưới đây đều đạt 100%**:

 1. \[ \] **Sidebar "Tổng quan" (`1.1`, `1.10`):** Đã xóa `.due-count-badge`; nút "Tổng quan" có chiều cao `44px` bằng khít các nút khác; chuyển tab mượt mà bằng 1 kiểu pill duy nhất, không còn vạch dọc `::before` bên trái.

 2. \[ \] **Thanh Pin Năng Lượng (`1.2`, `1.3`):** Trong `#modal-session-complete`, khi ở chế độ **Trắng Đen** chỉ hiển thị trắng/xám/đen sắc nét; khi ở chế độ **Trắng Cam** hiển thị nền kem sáng + vạch pin cam `#ea580c` (tuyệt đối không còn hộp đen viền xanh neon `#00f5d4` hay chữ hồng `#e879f9`).

 3. \[ \] **Zero Color Emoji (`1.4`, `2.2`):** Đã thay thế 100% emoji màu trong `index.html`, `js/app.js`, và dữ liệu môn học (`s.icon`) bằng SVG đơn sắc (`stroke="currentColor"`). Kiểm tra tại: Ngân hàng câu hỏi (`#view-bank`), Thư viện thẻ (`#view-decks`), Màn hình Quiz (`#view-quiz`), Modal tạo môn học (`#modal-create-subject`), và Modal hoàn thành phiên học (`#modal-session-complete`).

 4. \[ \] **Zero Purple Hover & Spotlight (`1.5`, `1.6`, `1.7`):** Trỏ chuột vào nút `"Thi thử"` (`.btn-secondary:hover`) hoặc bất kỳ thẻ/ô sáng nào ở chế độ Trắng Đen và Trắng Cam đều hiển thị đúng màu của theme đó, không còn bóng hay nền tím.

 5. \[ \] **Nút `"Tiếp theo"` trên Mobile (`1.8`):** `#btn-quiz-card-next` và `#btn-quiz-fast-next` dùng màu đơn sắc `var(--btn-primary-bg)`, không còn gradient tím.

 6. \[ \] **Topbar HUD Liquid Glass (`1.9`):** Khung bao ngoài cụm chọn Theme và Chuỗi ngày học ở góc trên phải có hiệu ứng Liquid Glass đồng bộ.

 7. \[ \] **Popup / Modal Liquid Glass (`1.11`):** Toàn bộ `.modal-box` sử dụng `var(--bg-glass-liquid)` với `backdrop-filter: blur(28px)` và độ đục chuẩn xác, chữ tương phản rõ nét.

 8. \[ \] **Chế độ 5 ("Ôn theo môn học & chương") & Thứ tự Dashboard (`1.12`):** Khối **7 Chế độ ôn tập** nằm ngay phía trên khối **Bộ câu hỏi của bạn** ở Trang chủ (`#view-dashboard`). Bấm vào thẻ số 5 mở ngay popup chọn Môn học & Chương và bắt đầu bài ôn tập mượt mà.

 9. \[ \] **Badge Môn học & Dropdown ở Mode Trắng Cam và Trắng Đen (`2.1`, `2.3`, `3.1`, `3.2`):** Toàn bộ badge môn học (`Chưa phân loại`, `tkt`, `tuh`, `csdl`) và toàn bộ `.cyber-dropdown` đã xóa inline style tím `#8b5cf6` và nền tím `#131122`, hiển thị chuẩn cam/trắng ở Mode Trắng Cam và trắng/đen ở Mode Trắng Đen.

10. \[ \] **Tương phản Thẻ ở Mode Trắng Cam (`2.4`, `2.5`):** Các thẻ ở trang chủ nổi bật rõ viền cam nhạt, bóng đổ ấm và chữ sắc nét ngay ở trạng thái bình thường mà không cần di chuột vào.

11. \[ \] **Typography Quote ở Mode Trắng Cam (`2.6`):** Chữ thường (`.hero-title-main`, `.hero-title-sub`) dùng font có chân (Serif) nét dày sát nhau (`font-weight: 700; letter-spacing: -0.035em`); chữ nghiêng điểm nhấn (`.hero-title-accent`) bỏ in đậm (`font-weight: 400; font-style: italic`).

12. \[ \] **Tests & Build (`1.13`):** Chạy `npm test` và `npm run build` đạt 100% PASS.