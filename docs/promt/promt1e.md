# PROMPT 1E: TÁI CẤU TRÚC PHÂN VÙNG DESIGN TOKENS, ÁP DỤNG 19 QUY TẮC CHỐNG AI SLOP, XÓA SẠCH EMOJI ĐA SẮC, NÂNG CẤP LIQUID GLASS & ANIMATION MORPH, ÔN TẬP THEO MÔN/CHƯƠNG, ĐẠI TU TRANG PHÂN TÍCH SM-2 VÀ TỐI ƯU 144 FPS+

> **ĐƯỜNG DẪN LƯU FILE TRONG DỰ ÁN**: `docs/promt/promt1e.md`
> **PHIÊN BẢN**: `1e` (Bản đóng gói phân vùng khoa học, xử lý triệt để toàn bộ tồn đọng sau `1d`)
> **FILE THEO DÕI TIẾN ĐỘ**: `docs/handoff/PROGRESS-1E.md`
> **MỤC TIÊU CỐT LÕI**: Thực thi theo **5 Phân Vùng Ưu Tiên Khoa Học (Phase 1 -> Phase 5)** để giải quyết tận gốc sự thiếu đồng bộ giữa 3 chế độ Theme (`violet-rose`, `monochrome`, `white-orange`), áp dụng **19 quy tắc chống AI Slop**, thay thế 100% emoji đa sắc bằng SVG đơn sắc, hợp nhất component `.deck-card`, làm mượt hiệu ứng Morph Sidebar / Theme Icon / Lật thẻ 360°, nâng cấp chế độ Ôn theo Môn & Chương, làm mới bảng Phân bố cấp độ ghi nhớ SM-2, và đẩy tốc độ khung hình ở tab Thư viện thẻ (`#view-decks`) lên **144 FPS+** trên cả Desktop và Mobile.

## BƯỚC 0: SAO LƯU GIT & KIỂM TRA BỘ SKILLS TRƯỚC KHI THỰC THI

```
# 1. Sao lưu trạng thái hiện tại vào Git
git status
git add -A
git commit -m "backup: state after prompt 1d before 1e zoned architecture overhaul"
git branch backup-before-1e

# 2. Cài đặt / kích hoạt đầy đủ Taste-Skill, Animation Skills & Impeccable (nếu chưa có)
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" || true
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "high-end-visual-design" || true
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "minimalist-ui" || true
npx skills add emilkowalski/skill || true
npx skills add LottieFiles/motion-design-skill || true
sh .agent/skills/impeccable/scripts/impeccable context || npx impeccable context

```

### Quy hoạch Thứ Tự Ưu Tiên Thực Thi (5 Phases Khoa Học):

Để không bị rối hay sót lỗi như các lần trước, AI Agent **BẮT BUỘC** làm việc theo đúng thứ tự từ gốc đến ngọn sau đây:

1. **PHASE 1 (Nền tảng Token & Diệt Màu Hardcode)**: Khoanh vùng toàn bộ màu sắc, bề mặt, viền, spotlight, dropdown, khung LMS, thanh tiến độ vào các nhóm biến trong `css/theme.css` và xóa sạch 100% mã màu tím/đen viết cứng trong `css/style.css` & `index.html`.

2. **PHASE 2 (19 Quy tắc Anti-AI-Slop, Hệ thống SVG Đơn Sắc & Hợp nhất Component `.deck-card`)**: Xóa toàn bộ emoji đa sắc trên toàn app, xóa các badge rác (`MODE // 01`, `REF//MS-...`), và gộp 2 hàm render `.deck-card` ở Trang chủ và Thư viện thẻ về **1 hàm duy nhất**.

3. **PHASE 3 (Liquid Glass Sidebar, Cụm Top-Right HUD Không Che Nội Dung & Animation Morph / Lật Thẻ 360°)**: Đồng bộ cụm Theme + Streak góc trên phải kèm hiệu ứng Morph icon, làm lại Sidebar kính mờ chuẩn mẫu và hiệu ứng lật thẻ quay trọn vòng mượt mà.

4. **PHASE 4 (Nâng cấp Tính năng Ôn Tập Theo Môn & Chương + Đại Tu Khối Phân Bố Cấp Độ Ghi Nhớ SM-2)**: Tách/thêm chế độ Ôn theo Môn học & Chương trong Mode 5, và thiết kế lại khối Phân bố cấp độ ghi nhớ ở trang Thống kê (`#view-stats`).

5. **PHASE 5 (Tối ưu 144 FPS+ cho Tab Thư Viện Thẻ & Đồng bộ Mobile)**: Tắt `backdrop-filter` lặp trên danh sách thẻ dài để đạt 144 FPS+, sửa tương phản Light Mode Trắng Cam và đồng bộ Mobile.

## PHASE 1: KHOANH VÙNG & PHÂN NHÓM DESIGN TOKENS CHO 3 THEME (DIỆT TẬN GỐC MÀU TÍM/ĐEN CÒN SÓT)

### 1.1. Nguyên nhân vì sao Mode Trắng Đen và Mode Trắng Cam vẫn bị lẫn màu Tím và màu Đen đặc

Qua kiểm tra ảnh chụp màn hình thực tế, có **7 vùng trong `css/style.css` và `index.html` đang viết cứng mã màu** thay vì dùng biến của `css/theme.css`:

1. **Các nút `.study-mode-card` trong `index.html` (dòng 315–408)** và **`.study-mode-card:hover .study-mode-pill-btn` trong `css/style.css` (dòng 4760)**: Đang viết cứng `style="color: #F43F5E..."` trên HTML và `background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)` khi trỏ chuột vào, khiến nút `"Bắt đầu luyện tập"` biến thành màu tím ngay cả trong mode Trắng Đen!

2. **Các Dropdown `.cyber-dropdown-trigger` và `.cyber-dropdown-menu` trong `css/style.css` (dòng 5068, 5117, 5394, 5420)**: Đang bị ép `background-color: #131122 !important;` và `background-color: #12101e !important;`, khiến 4 dropdown ở Ngân hàng câu hỏi và LMS đen xì giữa nền Trắng Cam!

3. **Khung hướng dẫn LMS `.lms-format-guide-card` và `.lms-sample-snippet` (`css/style.css` dòng 5459–5514)**: Đang bị ép `background: rgba(16, 15, 26, 0.75);` và `background: rgba(0, 0, 0, 0.4);`, làm khung mẫu LMS đen kịt và chữ xám bên trong không thể đọc nổi ở mode Trắng Cam!

4. **Thanh tiêu đề môn học `.subject-group` và `.subject-group-header` (`css/style.css` dòng 6584–6610)**: Đang bị ép `background: rgba(19, 17, 34, 0.70); border: 1px solid rgba(139, 92, 246, 0.22);` và `background: rgba(26, 23, 48, 0.65);`, tạo ra thanh ngang màu tím than tối sầm trong mode Trắng Cam!

5. **Thanh tiến độ làm bài `.quiz-progress-fill`, `.sm2-retention-fill`, `.pixel-battery-fill` và pill lọc môn `.topic-filter-chip.active` (`css/style.css` dòng 1938, 2012)**: Đang dùng màu tím `#a78bfa` / `rgba(124, 58, 237, 0.30)` cố định!

6. **Hiệu ứng trỏ chuột Spotlight & Hover ở cuối `css/style.css` (dòng 6800–6890)**: Vẫn còn các selector `.subject-group:hover`, `.btn-primary:hover`, `.btn-secondary:hover`, `.quiz-option-btn:hover` dùng `rgba(192, 132, 252, ...)` và `rgba(167, 139, 250, ...)`!

### 1.2. Thiết lập Kiến trúc 6 Nhóm Token Chuẩn trong `css/theme.css`

Trong `css/theme.css`, tổ chức lại toàn bộ biến thành **6 nhóm khoa học** và định nghĩa đầy đủ cho cả 3 chế độ (`:root, [data-theme="violet-rose"]`, `[data-theme="monochrome"]`, `[data-theme="white-orange"]`):

```
/* ==========================================================================
   NHÓM 1: SURFACES & LIQUID GLASS (BỀ MẶT KHUNG, DROPDOWN, LMS, SUBJECT HEADER)
   ========================================================================== */
:root,
[data-theme="violet-rose"] {
  --bg-base: #0d0a18;
  --surface-card: rgba(22, 17, 38, 0.62);
  --surface-card-hover: rgba(30, 23, 52, 0.76);
  --surface-elevated: rgba(32, 25, 54, 0.78);
  --surface-header: rgba(28, 21, 48, 0.72);
  --surface-dropdown: #161228;
  --surface-dropdown-menu: #18132c;
  --surface-code: rgba(12, 9, 22, 0.65);
  --surface-sidebar: rgba(18, 14, 32, 0.48);
  --surface-hud: rgba(22, 17, 38, 0.65);
  --glass-border: rgba(216, 180, 254, 0.20);
  --glass-border-strong: rgba(244, 114, 182, 0.42);
  --glass-highlight: rgba(255, 255, 255, 0.14);
  --glass-specular: inset 0 1px 0 rgba(255, 255, 255, 0.18);

  /* NHÓM 2: TYPOGRAPHY & CONTRAST */
  --text-primary: #f5f3ff;
  --text-secondary: #cdc4e6;
  --text-muted: #9a8fb8;
  --text-on-accent: #140d26;

  /* NHÓM 3: ACCENT, BUTTONS & PROGRESS BARS */
  --accent: #d8b4fe;
  --accent-strong: #f472b6;
  --accent-subtle-bg: rgba(216, 180, 254, 0.14);
  --accent-border: rgba(216, 180, 254, 0.30);
  --btn-primary-bg: #d8b4fe;
  --btn-primary-text: #140d26;
  --btn-primary-hover: #f472b6;
  --btn-secondary-bg: rgba(36, 28, 60, 0.75);
  --btn-secondary-text: #f5f3ff;
  --btn-secondary-border: rgba(216, 180, 254, 0.24);
  --progress-track-bg: rgba(255, 255, 255, 0.10);
  --progress-fill-bg: #d8b4fe;

  /* NHÓM 4: HOVER, SPOTLIGHT & FOCUS */
  --spotlight-primary: rgba(216, 180, 254, 0.14);
  --spotlight-secondary: rgba(244, 114, 182, 0.04);
  --card-hover-border: rgba(244, 114, 182, 0.48);
  --card-hover-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 10px 28px rgba(8, 4, 20, 0.45);

  /* NHÓM 5: QUIZ OPTIONS & FLASHCARD SRS */
  --option-bg: rgba(28, 22, 48, 0.72);
  --option-border: rgba(216, 180, 254, 0.22);
  --option-text: #f5f3ff;
  --option-letter: #f472b6;
  --option-correct-bg: rgba(16, 185, 129, 0.18);
  --option-correct-border: #10b981;
  --option-correct-text: #6ee7b7;
  --option-wrong-bg: rgba(244, 63, 94, 0.18);
  --option-wrong-border: #f43f5e;
  --option-wrong-text: #fda4af;
}

/* ==========================================================================
   CHẾ ĐỘ 2: TRẮNG ĐEN THUẦN KHIẾT (MONOCHROME NOIR — ZERO PURPLE)
   ========================================================================== */
[data-theme="monochrome"] {
  --bg-base: #050505;
  --surface-card: rgba(16, 16, 16, 0.56);
  --surface-card-hover: rgba(26, 26, 26, 0.72);
  --surface-elevated: rgba(24, 24, 24, 0.78);
  --surface-header: rgba(20, 20, 20, 0.72);
  --surface-dropdown: #111111;
  --surface-dropdown-menu: #141414;
  --surface-code: rgba(8, 8, 8, 0.75);
  --surface-sidebar: rgba(10, 10, 10, 0.42);
  --surface-hud: rgba(16, 16, 16, 0.68);
  --glass-border: rgba(255, 255, 255, 0.16);
  --glass-border-strong: rgba(255, 255, 255, 0.48);
  --glass-highlight: rgba(255, 255, 255, 0.22);
  --glass-specular: inset 0 1px 0 rgba(255, 255, 255, 0.24);

  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #737373;
  --text-on-accent: #000000;

  --accent: #ffffff;
  --accent-strong: #ffffff;
  --accent-primary: #ffffff;
  --accent-secondary: #d4d4d4;
  --accent-glow: rgba(255, 255, 255, 0.18);
  --accent-subtle-bg: rgba(255, 255, 255, 0.10);
  --accent-border: rgba(255, 255, 255, 0.28);
  --brand-gradient: #ffffff;
  --brand-gradient-subtle: rgba(255, 255, 255, 0.08);
  --btn-primary-bg: #ffffff;
  --btn-primary-text: #000000;
  --btn-primary-hover: #e5e5e5;
  --btn-secondary-bg: rgba(28, 28, 28, 0.82);
  --btn-secondary-text: #ffffff;
  --btn-secondary-border: rgba(255, 255, 255, 0.22);
  --progress-track-bg: rgba(255, 255, 255, 0.12);
  --progress-fill-bg: #ffffff;

  --spotlight-primary: rgba(255, 255, 255, 0.12);
  --spotlight-secondary: rgba(255, 255, 255, 0.03);
  --card-hover-border: rgba(255, 255, 255, 0.52);
  --card-hover-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 10px 28px rgba(0, 0, 0, 0.70);

  --option-bg: rgba(22, 22, 22, 0.75);
  --option-border: rgba(255, 255, 255, 0.20);
  --option-text: #ffffff;
  --option-letter: #ffffff;
  --option-correct-bg: rgba(255, 255, 255, 0.18);
  --option-correct-border: #ffffff;
  --option-correct-text: #ffffff;
  --option-wrong-bg: rgba(90, 90, 90, 0.20);
  --option-wrong-border: rgba(255, 255, 255, 0.40);
  --option-wrong-text: #a3a3a3;
}

/* ==========================================================================
   CHẾ ĐỘ 3: TRẮNG CAM LIQUID GLASS (WHITE-ORANGE — WARM TRANSLUCENT GLASS)
   ========================================================================== */
[data-theme="white-orange"] {
  color-scheme: light;
  --bg-base: #f8f4ef;
  --surface-card: rgba(255, 255, 255, 0.62);
  --surface-card-hover: rgba(255, 255, 255, 0.78);
  --surface-elevated: rgba(255, 250, 245, 0.82);
  --surface-header: rgba(255, 247, 238, 0.85);
  --surface-dropdown: rgba(255, 255, 255, 0.88);
  --surface-dropdown-menu: #ffffff;
  --surface-code: rgba(255, 245, 235, 0.88);
  --surface-sidebar: rgba(255, 252, 248, 0.52);
  --surface-hud: rgba(255, 252, 248, 0.72);
  --glass-border: rgba(255, 255, 255, 0.82);
  --glass-border-strong: rgba(234, 88, 12, 0.42);
  --glass-highlight: rgba(255, 255, 255, 0.96);
  --glass-specular: inset 0 1.5px 1px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(234, 88, 12, 0.08);

  /* Chữ Nâu Đen Espresso sâu, dịu mắt & tương phản cao trên nền kính sáng */
  --text-primary: #1c1410;
  --text-secondary: #524339;
  --text-muted: #7c6a5e;
  --text-on-accent: #ffffff;

  --accent: #ea580c;
  --accent-strong: #c2410c;
  --accent-primary: #f97316;
  --accent-secondary: #ea580c;
  --accent-glow: rgba(249, 115, 22, 0.20);
  --accent-subtle-bg: rgba(249, 115, 22, 0.12);
  --accent-border: rgba(234, 88, 12, 0.28);
  --brand-gradient: #f97316;
  --brand-gradient-subtle: rgba(249, 115, 22, 0.10);
  --btn-primary-bg: #f97316;
  --btn-primary-text: #ffffff;
  --btn-primary-hover: #ea580c;
  --btn-secondary-bg: rgba(255, 255, 255, 0.72);
  --btn-secondary-text: #1c1410;
  --btn-secondary-border: rgba(234, 88, 12, 0.24);
  --progress-track-bg: rgba(234, 88, 12, 0.14);
  --progress-fill-bg: #f97316;

  --spotlight-primary: rgba(251, 146, 60, 0.18);
  --spotlight-secondary: rgba(254, 215, 170, 0.06);
  --card-hover-border: rgba(234, 88, 12, 0.48);
  --card-hover-shadow: inset 0 1.5px 1px rgba(255, 255, 255, 0.98), 0 12px 28px rgba(154, 52, 18, 0.10);

  /* Tương phản cao tuyệt đối cho Quiz & Flashcard trên nền sáng */
  --option-bg: rgba(255, 255, 255, 0.78);
  --option-border: rgba(234, 88, 12, 0.25);
  --option-text: #1c1410;
  --option-letter: #c2410c;
  --option-correct-bg: rgba(16, 185, 129, 0.22);
  --option-correct-border: #059669;
  --option-correct-text: #064e3b;
  --option-wrong-bg: rgba(239, 68, 68, 0.18);
  --option-wrong-border: #dc2626;
  --option-wrong-text: #7f1d1d;
}

```

### 1.3. Thay thế toàn bộ CSS viết cứng trong `css/style.css` bằng Token của Phase 1

* **Dropdowns**: Trong `css/style.css` (dòng 5068, 5117, 5394, 5420), đổi `background-color: #131122 !important;` thành `background: var(--surface-dropdown) !important; color: var(--text-primary) !important; border: 1px solid var(--accent-border) !important;` và `.cyber-dropdown-menu` thành `background: var(--surface-dropdown-menu) !important; color: var(--text-primary) !important; border: 1px solid var(--accent-border) !important;`.

* **Khung hướng dẫn LMS (`.lms-format-guide-card` & `.lms-sample-snippet`, dòng 5459–5514)**:

  * `.lms-format-guide-card { background: var(--surface-elevated) !important; border: 1px dashed var(--accent-border) !important; }`

  * `.lms-sample-snippet { background: var(--surface-code) !important; color: var(--text-secondary) !important; border: 1px solid var(--glass-border) !important; }`

  * `.lms-sample-snippet .q-line { color: var(--text-primary) !important; font-weight: 600; }`

  * `.lms-sample-snippet .choice-line { color: var(--text-secondary) !important; }`

* **Khung nhóm môn học (`.subject-group` & `.subject-group-header`, dòng 6584–6610)**:

  * `.subject-group { background: var(--surface-card) !important; border: 1px solid var(--glass-border) !important; }`

  * `.subject-group-header { background: var(--surface-header) !important; border-bottom: 1px solid var(--glass-border) !important; color: var(--text-primary) !important; }`

* **Thẻ 7 chế độ học (`.study-mode-card` trong `index.html` & `css/style.css`)**:

  * Xóa toàn bộ `style="background: rgba(...); color: ..."` viết cứng trên 7 thẻ `.study-mode-icon` và `.tech-tag` trong `index.html` (dòng 315–408).

  * Trong `css/style.css` (dòng 4760), đổi `.study-mode-card:hover .study-mode-pill-btn` sang dùng `background: var(--btn-primary-bg) !important; color: var(--btn-primary-text) !important; border-color: transparent !important; box-shadow: none !important;`.

## PHASE 2: ÁP DỤNG 19 QUY TẮC CHỐNG AI SLOP, ĐƠN SẮC HÓA 100% ICON & HỢP NHẤT COMPONENT `.deck-card`

### 2.1. Thực thi 19 Quy Tắc Chống AI Slop (Từ Ảnh 10)

1. **Rule 1 (Delete filler badges)**: Xóa hoàn toàn khỏi `index.html` và `js/app.js` các badge rác: `MODE // 01`..`07`, `ADAPTIVE`, `LIBRARY // ALL`, `LMS // AUTO-PARSER`, `ANALYTICS // SM-2`, `REF//MS-...` (trong `_renderQuizContent`), `HỌC ĐỀU ĐẶN // SM-2`.

2. **Rule 2 & 3 (Drop redundant labels & Unitalicize random words)**:

   * Trên `.deck-card`, khi góc trên phải đã có Badge Tên Môn Học (`.deck-subject-badge`), **không in lặp lại dòng chữ nghiêng `Môn học: ...`** ở phần mô tả `.deck-desc`! Nếu bộ thẻ không có mô tả riêng, chỉ hiển thị số câu hỏi & số câu đến hạn gọn gàng.

   * Bỏ `font-style: italic` trên các dòng phụ (chỉ giữ font chữ nghiêng nghệ thuật duy nhất cho từ khóa `.hero-title-accent` ở mode Trắng Cam).

3. **Rule 12 (Keep icons consistent — Thay thế 100% Emoji đa sắc bằng SVG Đơn Sắc)**:

   * Tìm và thay thế **toàn bộ emoji còn sót trong `index.html` và `js/app.js`**:

     * Trong `.study-mode-card` (7 chế độ học): Thay `🎲`, `🎯`, `⚡`, `⏱️`, `🏷️`, `🧠`, `🚀` bằng 7 **Inline SVG đường nét đơn sắc (`stroke="currentColor" stroke-width="1.8" fill="none"`)** (Shuffle, Target, Repeat Clock, Timer, Layers/Book, Eye-Off, Zap).

     * Trong `.stat-card`, `.deck-meta`, `.bank-filter-bar`, `.cyber-dropdown-icon`, `.bank-card-header`, `.topic-filter-chip`: Thay toàn bộ `📚`, `⏰`, `🏆`, `🔥`, `🏷️`, `📁`, `⭐`, `🚩`, `✏️`, `🗑️`, `🔄`, `💡`, `🔍`, `➕`, `🎴`, `⏱️` bằng SVG đơn sắc hoặc chữ thuần khiết!

     * Đối với icon môn học do người dùng chọn (Subject Icon), hiển thị qua SVG/vòng tròn màu đơn sắc của theme hoặc áp dụng `filter: grayscale(100%)` tuyệt đối trong mode `monochrome`.

4. **Rule 14, 15, 18 (Inner radius = outer - padding, Text contrast & Tabular nums)**:

   * Đặt `font-variant-numeric: tabular-nums;` cho mọi con số (`.stat-num`, `.deck-meta`, `.item-count`, `#exam-timer-display`, `.sm2-stage-num`).

   * Hỗ trợ hiển thị in đậm Markdown `**...**` trong `renderLatexText(text)` (`js/app.js` dòng 315): Sau khi `_escapeHtml` phần text thường, thêm `.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')` để các cụm từ như `**ràng buộc tích cực (active constraint)**` hiển thị thành chữ **in đậm** chuẩn mực thay vì lộ dấu `**`.

### 2.2. Hợp nhất `.deck-card` ở Trang Chủ (`#view-dashboard`) và Thư Viện Thẻ (`#view-decks`) về 1 Hàm Duy Nhất (`_createDeckCardHtml`) & Loại bỏ Icon thừa trên nút

* **Nguyên nhân**: Hiện tại `_createDeckCardHtml()` (dòng 1467, dùng cho Trang chủ) và vòng lặp trong `renderDecks()` (dòng 1579, dùng cho Thư viện thẻ) đang viết 2 đoạn HTML riêng biệt!

* **Cách sửa trong `js/app.js`**:

  * Gộp cả hai nơi về gọi chung **1 hàm duy nhất `_createDeckCardHtml(deck, totalCards, dueCards, subject, options = { showDelete: false })`**.

  * **Thiết kế tối giản, bỏ các icon thừa trên các nút của `.deck-card`**:

    ```
    _createDeckCardHtml(deck, totalCards, dueCards, subject = null, options = {}) {
      const subjName = subject?.name || 'Chưa phân loại';
      const hasDesc = deck.description && deck.description.trim() && deck.description.trim() !== 'Không có mô tả';
      return `
        <div class="deck-card" data-deck-id="${deck.id}">
          <div>
            <div class="deck-header">
              <h3 class="deck-name">${this._escapeHtml(deck.name)}</h3>
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                <span class="deck-subject-badge">${this._escapeHtml(subjName)}</span>
                ${options.showDelete ? `
                  <button class="icon-btn deck-delete-btn" title="Xóa bộ thẻ" onclick="App.confirmDeleteDeck('${deck.id}')" aria-label="Xóa bộ thẻ">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                ` : ''}
              </div>
            </div>
            ${hasDesc ? `<p class="deck-desc">${this._escapeHtml(deck.description)}</p>` : ''}
          </div>
          <div>
            <div class="deck-meta">
              <span><strong>${totalCards}</strong> câu hỏi</span>
              <span class="deck-meta-dot">•</span>
              <span class="${dueCards > 0 ? 'due-highlight' : ''}"><strong>${dueCards}</strong> cần ôn</span>
            </div>
            <div class="deck-actions">
              <button class="btn btn-primary btn-deck-study" onclick="App.startSession('${deck.id}', 'srs')">
                Ôn tập
              </button>
              <button class="btn btn-secondary" onclick="App.startSession('${deck.id}', 'flashcard')">
                Lật thẻ
              </button>
              <button class="btn btn-secondary" onclick="App.openExamModal('${deck.id}')">
                Thi thử
              </button>
              <button class="btn btn-secondary" onclick="App.openAddCardModal('${deck.id}')">
                Thêm câu
              </button>
              <button class="btn btn-secondary" title="Đặt lại tiến trình học về ban đầu" onclick="App.confirmResetDeckProgress('${deck.id}')">
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    ```

## PHASE 3: ĐỒNG BỘ TOP-RIGHT HUD (KHÔNG CHE NỘI DUNG + MORPH ICON), LIQUID GLASS SIDEBAR & LẬT THẺ 360° LIỀN MẠCH

### 3.1. Giải quyết triệt để cụm Theme & Chuỗi ngày học ở góc trên phải (Mục 1.3, 1.4, 1.5)

* **Hiện trạng**:

  1. Cụm 3 icon chọn mode màu có blur còn chip Chuỗi ngày học (`2 ngày`) lại không có blur và lệch chiều cao/viền.

  2. Vì đặt `position: fixed; top: 16px; right: 24px;`, cụm này đè thẳng lên các nút `+ Tạo / Dán thẻ mới` ở tab Thư viện thẻ (`#view-decks`).

* **Giải pháp toàn diện**:

  1. **Không để đè lên nội dung bất kỳ trang nào**:

     * Chuyển `.app-topbar` từ `position: fixed` đè lên chữ sang một thanh **Top Utility Row gọn nhẹ (`position: relative; display: flex; justify-content: flex-end; align-items: center; padding: 14px 32px 0 32px; margin-bottom: -8px; z-index: 100;`)** nằm ngay phía trên `.content-wrapper` (hoặc tích hợp gọn vào chân `.sidebar-footer` trên Desktop), đảm bảo **không bao giờ che khuất bất kỳ nút bấm hay thông tin nào** khi xem hoặc cuộn trang!

  2. **Hợp nhất Theme Switcher & Streak vào 1 Viên Nang Kính Đồng Nhất (`.topbar-hud-capsule`)**:

     * Cả cụm chọn Theme và Chuỗi ngày học nằm chung trong **1 khung viên nang kính mờ duy nhất (`height: 38px; padding: 4px 6px; border-radius: 999px; background: var(--surface-hud); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: var(--glass-specular), var(--shadow-xs); display: inline-flex; align-items: center; gap: 6px;`)**.

     * Ngăn cách giữa phần chọn Theme và phần Chuỗi ngày học bằng một vạch mảnh `1px solid var(--glass-border)` cao `18px`.

  3. **Hiệu ứng Morphing Icon mượt mà khi chuyển Mode màu**:

     * Khi bấm chuyển mode (`violet-rose` / `monochrome` / `white-orange`), viên thuốc chỉ thị nền (`.theme-active-pill`) trượt mượt bằng `transform: translateX(...)` với spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)`, đồng thời SVG icon bên trong thực hiện chuyển động **Morph xoay & co giãn tâm (`transform: rotate(360deg) scale(1.15)` + `stroke-dashoffset` transition `320ms cubic-bezier(0.22, 1, 0.36, 1)`)**.

### 3.2. Hiệu ứng Đóng/Mở Sidebar Mượt Mà & Giao diện Liquid Glass Sidebar (Theo Ảnh 8 `image_c34892.jpg` & Ảnh 9 `image_c3483a.jpg`)

* **Nguyên nhân Sidebar hiện tại đóng/mở bị ngứa mắt, tràn viền**:

  * Do khi đóng/mở, chiều rộng `.app-sidebar` thay đổi nhưng các nút bên trong bị co kéo padding hoặc bị tháo/gắn DOM đột ngột.

* **Cách sửa chuẩn Liquid Glass Sidebar (Ảnh 8)**:

  1. **Cấu trúc kính khúc xạ ánh sáng**:

     * `.app-sidebar` dùng kính mờ liền khối với viền specular sáng ở mép trên-trái (`border: 1px solid var(--glass-border); box-shadow: var(--glass-specular), 0 16px 40px rgba(0,0,0,0.22); overflow: hidden !important;`).

  2. **Mục đang chọn (`.nav-item.active button`) chuẩn Ảnh 8**:

     * Có một **thanh chỉ thị dọc phát sáng ở sát mép trái (`::before` rộng `3.5px`, cao `22px`, `border-radius: 4px`, `background: var(--accent)`)** kết hợp một **dải sáng kính ngang mờ dần sang phải (`background: linear-gradient(90deg, var(--accent-subtle-bg) 0%, transparent 100%)`)**, không dùng hình tròn to thô kệch bị cắt viền khi thu phóng!

  3. **Chuyển động Morph đóng/mở 60–144 FPS không tràn viền**:

     * Mọi `.nav-item button` có `display: grid; grid-template-columns: 44px 1fr; align-items: center; width: 100%; height: 44px; padding: 0; overflow: hidden;`.

     * Cột đầu tiên (`44px`) chứa SVG icon luôn **đứng yên tại một tọa độ cố định tuyệt đối** dù Sidebar đang đóng (`68px`) hay mở (`240px`).

     * Cột thứ hai (`.nav-label`) chuyển trạng thái đóng/mở bằng `opacity` + `transform: translate3d(-8px, 0, 0)` + `filter: blur(4px -> 0px)` trong `260ms cubic-bezier(0.22, 1, 0.36, 1)`. Nhờ đó khi bấm vào con mèo (`meo.png`), khung kính trượt mở ra và thu vào êm ái như lụa, không bao giờ tràn viền!

### 3.3. Hiệu ứng Lật Thẻ (Flashcard) Quay Trọn Vòng 3D Liền Mạch (Mục 1.7)

* **Hiện trạng**: Hiệu ứng lật thẻ đang bị đứt đoạn, gắt và thiếu cảm giác xoay 3D trọn vẹn.

* **Cách sửa trong `css/style.css` và `js/app.js`**:

  1. Đặt `perspective: 1600px;` trên `.flashcard-stage`.

  2. Trên `.flashcard-card`, sử dụng chuyển động **3D Arc Flip (Nhấc thẻ lên theo trục Z rồi xoay tròn mượt mà)**:

     ```
     .flashcard-card {
       transform-style: preserve-3d;
       -webkit-transform-style: preserve-3d;
       transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
       will-change: transform;
     }
     .flashcard-card.is-flipping {
       animation: flashcardArcLift 0.52s cubic-bezier(0.22, 1, 0.36, 1);
     }
     .flashcard-card.flipped {
       transform: rotateY(180deg);
       -webkit-transform: rotateY(180deg);
     }
     @keyframes flashcardArcLift {
       0%   { scale: 1; }
       45%  { scale: 1.035; }
       100% { scale: 1; }
     }
     
     ```

  3. Khi chuyển sang thẻ tiếp theo (`rateFlashcard`), thay vì cắt bụp đột ngột, cho thẻ thực hiện một vòng xoay chuyển tiếp mượt mà (**Full 360° Spin-and-Swap** hoặc **Smooth 3D Deck Deal** trong `280ms` trước khi hiện câu mới) để người học cảm nhận rõ thẻ quay trọn vòng liền mạch!

## PHASE 4: NÂNG CẤP CHẾ ĐỘ ÔN THEO MÔN & CHƯƠNG + ĐẠI TU TRANG PHÂN TÍCH CẤP ĐỘ GHI NHỚ SM-2

### 4.1. Nâng cấp Chế Độ Học Số 5 thành "Ôn theo Môn học & Chương" (Mục 1.8)

1. **Kiểm tra & đảm bảo Prompt AI tạo câu hỏi theo Chương**:

   * Xác nhận trong `js/parser.js` (`generateAIPromptTemplate`) và `js/app.js` (`copyAIPrompt`, `copyFlaggedAIPrompt`), AI luôn được yêu cầu gán trường `"topic"` theo tên **Chương (`Chương 1: ...`, `Chương 2: ...`)** đồng nhất.

2. **Nâng cấp Chế độ số 5 trên Trang chủ (`#view-dashboard`) và Modal (`#modal-topic-picker`)**:

   * Đổi tiêu đề thẻ Mode 5 trong `index.html` từ `"5. Ôn theo chủ đề/tag"` thành **`"5. Ôn theo Môn & Chương"`**, mô tả: *"Lựa chọn ôn tập toàn diện theo từng Môn học hoặc đi sâu vào từng Chương cụ thể."* (Nút: `"Chọn môn / chương"`).

   * Nâng cấp hàm `openTopicPickerModal()` trong `js/app.js` và `#modal-topic-picker` trong `index.html` thành **Bộ Chọn Kép (Môn Học & Chương)**:

     * **Phần 1 — Chọn Môn Học (`Ôn theo Môn`)**: Hiển thị danh sách các Môn học hiện có dưới dạng các thẻ/pill tương tác (`Tất cả môn`, `tuh`, `tkt`, `csdl`...). Bên cạnh mỗi môn có nút **"Ôn cả môn"** (`App.startSubjectSession(subjectId, 'free')`) VÀ khi click vào tên môn sẽ lọc danh sách Chương bên dưới chỉ thuộc môn học đó!

     * **Phần 2 — Chọn Chương (`Ôn theo Chương`)**: Hiển thị danh sách các Chương thuộc môn đang chọn (kèm số lượng câu hỏi của từng Chương), cho phép người dùng chọn 1 hoặc nhiều Chương rồi bấm **"Bắt đầu ôn các chương đã chọn"**.

### 4.2. Thiết kế lại khối "Phân bố cấp độ ghi nhớ (SM-2)" ở trang Phân tích (`#view-stats` — Mục 1.9 & Ảnh 7)

* **Hiện trạng**: Trong Ảnh 7 (`image_c34f3e.png`), 4 ô `Thẻ Mới`, `Đang học`, `Đang ôn tập`, `Đã thành thạo` nhìn quá chìm, chữ bé và rời rạc.

* **Cách nâng cấp trong `index.html`, `css/style.css` và `js/app.js` (`renderStatsView`)**:

  1. Thêm một **Thanh Phổ Trí Nhớ Tổng Thể (SM-2 Stacked Mastery Spectrum Bar)** cao `14px`, bo tròn `999px` nằm ngay dưới tiêu đề `"Phân bố cấp độ ghi nhớ (SM-2)"`, chia làm 4 đoạn màu tương ứng với tỷ lệ % của 4 cấp độ (`#sm2-bar-new`, `#sm2-bar-learning`, `#sm2-bar-review`, `#sm2-bar-mastered`).

  2. Thiết kế 4 thẻ cấp độ (`.sm2-stage-card`) lớn, sang trọng, có chiều sâu:

     * Giữ nguyên 4 ID `#stat-breakdown-new`, `#stat-breakdown-learning`, `#stat-breakdown-review`, `#stat-breakdown-mastered` nhưng nâng cỡ chữ số lên **`clamp(2.0rem, 3.2vw, 2.75rem)`**, `font-weight: 800`, `font-variant-numeric: tabular-nums`.

     * Hiển thị kèm **Badge Tỷ lệ % (`#stat-pct-new`, `#stat-pct-learning`, `#stat-pct-review`, `#stat-pct-mastered`)** ở góc trên phải mỗi thẻ.

     * Thêm dòng mô tả chu kỳ SM-2 rõ ràng bên dưới tên cấp độ:

       * `Thẻ Mới` (`Chưa học lần nào`)

       * `Đang học` (`Chu kỳ ngắn < 3 ngày`)

       * `Đang ôn tập` (`Chu kỳ củng cố 3–21 ngày`)

       * `Đã thành thạo` (`Trí nhớ dài hạn > 21 ngày`)

## PHASE 5: TỐI ƯU HIỆU NĂNG 144 FPS+ Ở TAB THƯ VIỆN THẺ, HOÀN THIỆN LIGHT MODE TRẮNG CAM & ĐỒNG BỘ MOBILE

### 5.1. Giải quyết dứt điểm hiện tượng tụt FPS ở Tab Thư Viện Thẻ (`#view-decks`) — Đảm bảo 144 FPS+ (Mục 3.7)

* **Nguyên nhân gây tụt FPS ở `#view-decks`**:

  * Khi tab Thư viện thẻ hiển thị hàng chục `.deck-card` nằm bên trong các `.subject-group`, việc bật `backdrop-filter: blur(22px)` trên từng `.deck-card` và `.subject-group` buộc GPU phải chụp và làm mờ nền 20+ lần trên mỗi khung hình khi cuộn!

* **Cách sửa bắt buộc để đạt 144 FPS+**:

  1. **Quy tắc cứng về `backdrop-filter`**:

     * **CHỈ cho phép `backdrop-filter: blur(...)` trên tối đa 3 phần tử cố định**: `.app-sidebar`, `.topbar-hud-capsule` / `.bottom-nav`, và `.hero-card` / `.modal-box`.

     * **Trên toàn bộ danh sách thẻ lặp (`.deck-card`, `.subject-group`, `.bank-card-item`, `.study-mode-card`, `.lms-preview-card`)**: Bắt buộc đặt `backdrop-filter: none !important; -webkit-backdrop-filter: none !important;` ở cả 3 chế độ Theme!

     * Để vẫn giữ vẻ đẹp **Liquid Glass** như Ảnh 9 (`image_c3483a.jpg`) mà không tốn GPU blur trên từng thẻ con, sử dụng **Optical Liquid Glass Surface** (nền gradient bán trong suốt + viền sáng khúc xạ `border: 1px solid var(--glass-border)` + `box-shadow: var(--glass-specular), var(--shadow-sm)`).

  2. **Bật `content-visibility: auto` và Caching**:

     * Trên `.subject-group` và `.bank-card-item`, áp dụng `content-visibility: auto; contain-intrinsic-size: 0 260px;` để trình duyệt bỏ qua việc dựng hình các thẻ nằm ngoài khung nhìn.

     * Trong `renderDecks()`, gom toàn bộ HTML vào 1 biến chuỗi duy nhất rồi gán `container.innerHTML = html` đúng 1 lần.

### 5.2. Chuẩn hóa Độ Tương Phản Ở Mode Trắng Cam (`white-orange`) Trong Quiz, Lật Thẻ & LMS (Mục 3.1 – 3.6)

* Trong `[data-theme="white-orange"]`:

  * **Không dùng màu chữ trắng/xám nhạt hay xanh nhạt trên nền sáng**:

    * Câu hỏi Quiz (`.quiz-question-text`, `#flashcard-question-text`): Chữ Nâu Đen Espresso `#1c1410 !important` (`font-weight: 700`).

    * Các lựa chọn Quiz (`.quiz-option-btn`): Nền kính sáng `rgba(255, 255, 255, 0.82) !important`, viền `1.5px solid rgba(234, 88, 12, 0.25) !important`, chữ `.quiz-option-content` màu `#1c1410 !important` (`font-weight: 500`), chữ cái `.quiz-option-letter` (`A.`, `B.`, `C.`, `D.`) màu Cam Đậm `#c2410c !important` (`font-weight: 800`).

    * **Đáp án Đúng (`.quiz-option-btn.correct`, `.bank-option-cell` đúng)**: Nền `rgba(16, 185, 129, 0.20) !important`, viền `2px solid #059669 !important`, chữ **Xanh Rừng Đậm `#064e3b !important`** (`font-weight: 700`).

    * **Đáp án Sai (`.quiz-option-btn.incorrect`)**: Nền `rgba(239, 68, 68, 0.16) !important`, viền `2px solid #dc2626 !important`, chữ **Đỏ Đậm `#7f1d1d !important`** (`font-weight: 700`).

    * **Hộp giải thích (`.quiz-explanation-box`, `.flashcard-explanation-box`)**: Nền `rgba(255, 247, 237, 0.90) !important`, viền trái `4px solid #ea580c !important`, chữ `#29201a !important` cực kỳ rõ nét.

    * **Mặt sau Lật thẻ (`.flashcard-answer-text`, `.flashcard-answer-label`)**: Đổi màu xanh lá nhạt sang **Xanh Ngọc Lục Bảo Đậm `#047857 !important`** hoặc **Cam Đậm `#c2410c !important`** để nổi bật rõ ràng trên mặt thẻ sáng.

### 5.3. Đồng bộ 100% lên Chế Độ Mobile (`@media (max-width: 768px)`) (Mục 5)

* Cụm `.topbar-hud-capsule` (chứa nút Morph Theme + Chuỗi ngày học) căn gọn ở góc trên phải của Mobile, không đè lên tiêu đề trang.

* Thanh `.bottom-nav` ở đáy màn hình Mobile: Dùng bề mặt Liquid Glass (`background: var(--surface-hud); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: var(--glass-specular), 0 10px 28px rgba(0,0,0,0.25);`), các icon bên trong là SVG đơn sắc đồng bộ, mục `.active` đánh dấu bằng pill kính sáng gọn trong lòng thanh bar (không nhô cao che khuất thao tác).

* Kiểm tra toàn bộ các màn hình Mobile ở cả 3 chế độ (`violet-rose`, `monochrome`, `white-orange`) đảm bảo 0px tràn ngang, chữ rõ nét và tốc độ cuộn mượt mà.

## PHẦN 3: KIỂM ĐỊNH CHẤT LƯỢNG & NGHIỆM THU (VERIFICATION)

Sau khi hoàn tất cả 5 Phase, AI Agent chạy bộ test và build production, đồng thời đóng mọi tiến trình server chạy ngầm:

```
npm test
npm run build

```

### Checklist Nghiệm Thu Đợt `1e` (Ghi vào `docs/handoff/PROGRESS-1E.md`):

* \[ \] **Phase 1 (Token Zoning & Zero Hardcoded Purple/Black)**: Đã gom 6 nhóm token trong `css/theme.css`; xóa sạch 100% màu tím/đen viết cứng ở `.study-mode-card`, `.cyber-dropdown`, `.lms-format-guide-card`, `.subject-group-header`, thanh tiến độ và spotlight hover.

* \[ \] **Phase 2 (19 Anti-Slop Rules, Monochrome SVG Icons & Unified `.deck-card`)**: Xóa toàn bộ emoji đa sắc và các badge rác (`MODE // 01`, `REF//MS-...`); gộp `_createDeckCardHtml` và `renderDecks` dùng chung 1 hàm duy nhất với nút bấm sạch sẽ không chèn icon thừa; hỗ trợ in đậm `**...**` trong câu hỏi.

* \[ \] **Phase 3 (HUD, Liquid Glass Sidebar & 360° Card Flip)**: Cụm Theme + Streak nằm chung 1 viên nang kính đồng nhất, không che nút ở bất kỳ tab nào, có hiệu ứng Morph icon; Sidebar đóng/mở mượt theo chuẩn Liquid Glass (Ảnh 8); Lật thẻ quay trọn vòng 3D liền mạch.

* \[ \] **Phase 4 (Ôn theo Môn/Chương & Phân bố SM-2)**: Mode 5 hỗ trợ chọn ôn theo cả Môn học lẫn Chương; khối Phân bố cấp độ ghi nhớ (SM-2) ở trang Thống kê có thanh phổ tỷ lệ % và 4 thẻ lớn đẳng cấp.

* \[ \] **Phase 5 (144 FPS+ `#view-decks`, Light Mode Contrast & Mobile)**: Tab Thư viện thẻ bỏ `backdrop-filter` lặp trên từng card đạt 144 FPS+; Mode Trắng Cam tương phản chữ cực rõ ở Quiz/Lật thẻ/LMS; Mobile đồng bộ hoàn hảo; `npm test` và `npm run build` đạt **100% PASS**.