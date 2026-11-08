# PROMPT 1A: ĐỒNG BỘ HỆ THỐNG DROPDOWN, CHUẨN HÓA FONT CHỮ, MỞ RỘNG KHUNG ÔN TẬP & FLASHCARD, VÀ THIẾT LẬP TRUNG TÂM ĐIỀU PHỐI NGÔN NGỮ THIẾT KẾ

> **ĐƯỜNG DẪN LƯU FILE TRONG DỰ ÁN**: `docs/promt/promt1a.md`
> **PHIÊN BẢN**: `1a` (Khởi đầu chuỗi nâng cấp có kiểm soát: `1a` -> `1b` -> `1c`...)
> **FILE THEO DÕI TIẾN ĐỘ**: `docs/handoff/PROGRESS-1A.md`
> **MỤC TIÊU CỐT LÕI**: Giải quyết triệt để 5 vấn đề UI/UX & kiến trúc Design System đang tồn tại trên ứng dụng **MindSparks / TinhMinhLaKey** mà **bảo toàn 100% logic nghiệp vụ (IndexedDB, SM-2, KaTeX, AI/LMS Parser) và vượt qua toàn bộ bài kiểm tra tự động (`npm test`, `npm run build`)**.

## PHẦN 1: KÍCH HOẠT & ĐIỀU PHỐI BỘ SKILLS TRƯỚC KHI THỰC THI

Trước khi sửa bất kỳ dòng code nào, AI Agent **BẮT BUỘC** tìm kiếm, nạp ngữ cảnh và áp dụng quy trình từ các bộ Skills đã cài đặt trong môi trường (`.agent/skills/`, `.agents/skills/`, hoặc global skills):

### 1.1. Kiểm tra & Kích hoạt nhanh bộ Skills (nếu thiếu thì cài bổ sung)

```
# Tạo thư mục lưu prompt và báo cáo tiến độ
mkdir -p docs/promt docs/handoff

# 1. Nạp ngữ cảnh Impeccable (đã có sẵn trong .agent/skills/impeccable)
sh .agent/skills/impeccable/scripts/impeccable context || npx impeccable context

# 2. Đảm bảo bộ 3 nhóm Skill chủ lực đã sẵn sàng:
# - Superpowers (systematic-debugging, writing-plans, subagent-driven-development, verification-before-completion)
# - Impeccable (typeset, layout, extract, document, audit, polish)
# - UI/UX Pro Max & Taste-Skill (ui-ux-pro-max, design-taste-frontend)

```

### 1.2. Bảng Phân Vai & Áp Dụng Skills Trong Đợt `1a`

| Tên Skill | Nguồn / Thư mục trong Repo | Nhiệm vụ bắt buộc trong `promt1a.md` | 
| ----- | ----- | ----- | 
| **`superpowers`** (`systematic-debugging`, `writing-plans`, `verification-before-completion`) | Global / `.agents/skills/diagnosing-bugs`, `implement-spec` | Truy vết tận gốc lỗi Stacking Context (`z-index`) của Dropdown và lỗi đóng/mở lệch pha trong `js/app.js`; lập kế hoạch thực thi an toàn và kiểm định bằng test trước khi kết thúc. | 
| **`impeccable`** (`typeset`, `layout`, `extract`, `document`, `audit`, `polish`) | `.agent/skills/impeccable/SKILL.md` | Dùng `typeset` để xóa bỏ font Pixel lạc quẻ và đồng nhất Typography; dùng `layout` để nới rộng khung `.deck-card` và `.flashcard-stage`; dùng `extract` + `document` để gom toàn bộ biến về `css/theme.css` và sinh `DESIGN.md`. | 
| **`ui-ux-pro-max-skill`** & **`design-taste-frontend`** | `nextlevelbuilder/ui-ux-pro-max-skill`, `.agents/skills/design-taste-frontend/` | Chuẩn hóa hành vi Single-Open Dropdown (mở 1 cái tự đóng mọi cái khác), kiểm tra tỷ lệ khoảng thở (breathing room) của nút bấm trong ô Ôn tập và độ rõ nét của Flashcard trên Desktop & Mobile. | 

## PHẦN 2: CHẨN ĐOÁN NGUYÊN NHÂN GỐC RỄ CỦA 5 VẤN ĐỀ (ROOT-CAUSE ANALYSIS)

Qua kiểm tra mã nguồn hiện tại (`index.html`, `js/app.js`, `css/style.css`, `css/theme.css`, `css/fonts.css`), đây là nguyên nhân chính xác gây ra 5 lỗi trên giao diện thực tế:

1. **Vấn đề 1 — Dropdown chưa đồng nhất hành vi & bị chìm dưới phần tử khác**:

   * **Lỗi 1A (Mở trùng nhiều dropdown ở tab Ngân hàng câu hỏi `#view-bank`)**:
     Trong `js/app.js` (dòng 5189–5241), hàm `toggleBankSubjectDropdown` và `toggleBankSourceDropdown` có gọi `this.closeAllCyberDropdowns()`, nhưng hai hàm `toggleBankTopicDropdown` (dòng 5204) và `toggleBankDiffDropdown` (dòng 5212) lại **KHÔNG gọi `this.closeAllCyberDropdowns()`** mà chỉ xóa class `open` chéo của nhau (`topicWrap` <-> `diffWrap`). Hệ quả là khi người dùng mở dropdown **Môn học** rồi bấm sang **Chủ đề**, cả 2 menu cùng mở đè lên nhau; tương tự khi mở **Tất cả nguồn** rồi bấm **Mọi độ khó**, cả 2 menu cũng hiển thị cùng lúc.

   * **Lỗi 1B (Dropdown ở tab Dán câu hỏi AI `#view-import` và Nhập LMS `#view-import-lms` bị chìm xuống dưới)**:
     Trong `css/style.css` (dòng 6824–6833), quy tắc hiệu ứng Spotlight đang ép:

     ```
     .deck-card > *, .subject-group > *, .stat-card > *, .quiz-card > *, .bank-card-item > *, .glass-card > *, .study-mode-card > * {
       position: relative;
       z-index: 1;
     }
     
     ```

     Vì trong `#view-import` và `#view-import-lms`, khung chứa form là `<div class="quiz-card">`, nên mọi phần tử con trực tiếp bên trong nó (`.form-group` thứ 1 chứa dropdown Môn học, `.form-group` thứ 2 chứa dropdown Bộ thẻ đích, `#new-deck-fields`, `.lms-config-grid`, `.lms-format-guide-card`) đều bị tạo thành các **Stacking Context độc lập có cùng `z-index: 1`**. Theo luật CSS Stacking Context, phần tử `.form-group` đứng sau trong DOM có cùng `z-index: 1` sẽ **luôn vẽ đè lên** menu `.cyber-dropdown-menu` của `.form-group` đứng trước (dù menu có `z-index: 200` hay `10000`). Ngoài ra, `.quiz-card` đang có `overflow: hidden` (dòng 2021, 6783), và file `css/thermal-tools.css` chưa được link vào `index.html`.

2. **Vấn đề 2 — Font chữ lộn xộn, chỗ Pixel chỗ thường**:

   * Hiện tại `css/fonts.css` và `css/theme.css` đang gán `--font-pixel: 'Pixelify Sans', 'VT323', monospace;` và `--font-heading: 'Pixelify Sans', 'VT323', monospace;`.

   * Trong `css/style.css`, hàng loạt vị trí như tiêu đề 7 chế độ học (`.study-mode-title` dòng 4740: `1. Luyện tập tự do`, `2. Ôn lại câu sai`...), tên thương hiệu (`.brand-title` dòng 621), tiêu đề thanh trên (`.topbar-title` dòng 740), các con số thống kê (`.stat-num`, `.daily-radial-pct`, `.sm2-retention-pct`, `.pixel-battery-pct`) đang dùng `--font-pixel` răng cưa, trong khi `#hero-title` lại dùng `--font-poster` (`Montserrat`, `Anton`), còn các nhãn `MODE // 01` dùng `--font-mono`. Sự pha trộn này làm giao diện thiếu đồng nhất và rối mắt.

3. **Vấn đề 3 — Ô ôn tập / Khung bộ thẻ (`.deck-card`) hơi bé, chữ và nút sắp tràn**:

   * Trong `css/style.css` (dòng 1947–1993), lưới `.decks-grid` đang đặt `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` khiến trên màn hình rộng mỗi thẻ bị chia nhỏ (\~300px).

   * Bên trong mỗi `.deck-card` (`js/app.js` dòng 1482 và 1592), khối `.deck-actions` dùng `display: flex; gap: 8px; flex-wrap: wrap;` để nhồi nhét tới **5 nút bấm** (`Ôn tập`, `+ Thêm`, `Thẻ`/`Lật thẻ`, `Thi`/`Thi thử`, `Reset`). Trên hàng đầu tiên, nút chính `Ôn tập` (`flex: 1`) bị 2 nút phụ chèn ép làm co hẹp lại thành một ô tròn nhỏ xíu, chữ `"Ôn tập"` sát rạt mép viền như sắp tràn ra ngoài.

4. **Vấn đề 4 — Giao diện lật thẻ (Flashcard) quá nhỏ trên màn hình lớn, khó nhìn**:

   * Trong `css/style.css` (dòng 2690–2716 và dòng 3038–3075), khi ở chế độ lật thẻ (`body.flashcard-active`), `.flashcard-player-container` bị bó hẹp ở `max-width: 660px !important`, `.flashcard-stage` và `.flashcard-card` bị khóa cứng ở `height: 310px !important; max-height: 330px !important;`, cỡ chữ câu hỏi `.flashcard-question-text` chỉ `clamp(1.05rem, 1.8vw, 1.25rem) !important`. Trên màn hình Desktop, chiếc thẻ nằm lọt thỏm giữa không gian trống mênh mông, công thức toán học có chỉ số trên/dưới ($X_1, X_2, \dots, X_n$, $\sigma^2$, $\sum_{i=1}^n$) nhìn bé và mỏi mắt.

5. **Vấn đề 5 — Thiếu 1 trung tâm điều phối ngôn ngữ thiết kế duy nhất (Design System Orchestrator)**:

   * Dù đã có `css/theme.css` và `css/fonts.css`, nhiều thông số kích thước component (độ rộng thẻ Deck, chiều cao/độ rộng Flashcard, tầng `z-index` của Dropdown, màu nền menu Dropdown, cỡ chữ thẻ học) vẫn đang bị viết cứng (`hardcode`) rải rác trong `css/style.css`, kèm theo 3 file CSS rời (`css/thermal-dashboard.css`, `css/neumorph-study.css`, `css/thermal-tools.css`) nằm thừa mà không được liên kết trong `index.html`. Cần quy hoạch lại để `css/theme.css` + `DESIGN.md` thực sự là **Single Source of Truth** điều phối toàn bộ giao diện mà không làm ảnh hưởng tới bất kỳ chức năng nào.

## PHẦN 3: YÊU CẦU THỰC THI CHI TIẾT TỪNG HẠNG MỤC

### NHIỆM VỤ 1: ĐỒNG NHẤT TOÀN BỘ DROPDOWN & SỬA DỨT ĐIỂM LỖI ĐÈ NHAU / CHÌM LAYER

#### 1.1. Chuẩn hóa bộ điều khiển Dropdown duy nhất trong `js/app.js`

1. Tìm hàm `_openCyberDropdown(wrap)` và `closeAllCyberDropdowns()` trong `js/app.js` (khoảng dòng 5219–5241) và nâng cấp thành bộ điều khiển trung tâm:

   ```
   closeAllCyberDropdowns() {
     document.querySelectorAll('.cyber-dropdown.open').forEach(el => {
       el.classList.remove('open', 'dropup');
       const trigger = el.querySelector('.cyber-dropdown-trigger');
       if (trigger) trigger.setAttribute('aria-expanded', 'false');
     });
     document.querySelectorAll('.has-open-dropdown').forEach(parent => {
       parent.classList.remove('has-open-dropdown');
     });
   },
   
   _openCyberDropdown(wrap) {
     if (!wrap) return;
     this.closeAllCyberDropdowns();
     const trigger = wrap.querySelector('.cyber-dropdown-trigger');
     if (trigger) {
       trigger.setAttribute('aria-expanded', 'true');
       const rect = trigger.getBoundingClientRect();
       if (window.innerHeight - rect.bottom < 240 && rect.top > 240) {
         wrap.classList.add('dropup');
       } else {
         wrap.classList.remove('dropup');
       }
     }
     wrap.classList.add('open');
   
     // Gắn class nâng tầng Stacking Context cho toàn bộ chuỗi phần tử cha liên quan
     const parentsToElevate = [
       wrap.closest('.form-group'),
       wrap.closest('.lms-config-grid'),
       wrap.closest('#new-deck-fields'),
       wrap.closest('#lms-new-deck-fields'),
       wrap.closest('.bank-filter-bar'),
       wrap.closest('.lms-meta-row'),
       wrap.closest('.lms-card-actions'),
       wrap.closest('.lms-preview-card'),
       wrap.closest('.quiz-card'),
       wrap.closest('.lms-config-card'),
       wrap.closest('.modal-box'),
       wrap.closest('.settings-card')
     ];
     parentsToElevate.forEach(p => {
       if (p) p.classList.add('has-open-dropdown');
     });
   },
   
   _toggleCyberDropdownById(wrapId, e) {
     if (e) e.stopPropagation();
     const wrap = typeof wrapId === 'string' ? document.getElementById(wrapId) : wrapId;
     if (!wrap) return;
     const wasOpen = wrap.classList.contains('open');
     this.closeAllCyberDropdowns();
     if (!wasOpen) {
       this._openCyberDropdown(wrap);
     }
   },
   
   ```

2. **Sửa ngay `toggleBankTopicDropdown(e)` và `toggleBankDiffDropdown(e)`** (dòng 5204–5218) cùng **tất cả** các hàm `toggle...Dropdown(e)` trong `js/app.js` để gọi `this._toggleCyberDropdownById(...)`:

   ```
   toggleBankSubjectDropdown(e) {
     this._toggleCyberDropdownById('bank-subject-dropdown-wrap', e);
   },
   toggleBankTopicDropdown(e) {
     this._toggleCyberDropdownById('bank-topic-dropdown-wrap', e);
   },
   toggleBankDiffDropdown(e) {
     this._toggleCyberDropdownById('bank-diff-dropdown-wrap', e);
   },
   toggleBankSourceDropdown(e) {
     this._toggleCyberDropdownById('bank-source-dropdown-wrap', e);
   },
   toggleImportSubjectDropdown(e) {
     this._toggleCyberDropdownById('import-subject-dropdown-wrap', e);
   },
   toggleImportDeckDropdown(e) {
     this._toggleCyberDropdownById('import-deck-dropdown-wrap', e);
   },
   toggleLmsSubjectDropdown(e) {
     this._toggleCyberDropdownById('lms-subject-dropdown-wrap', e);
   },
   toggleLmsDeckDropdown(e) {
     this._toggleCyberDropdownById('lms-deck-dropdown-wrap', e);
   },
   toggleLmsCardTypeDropdown(e, idx) {
     this._toggleCyberDropdownById(`lms-type-dropdown-${idx}`, e);
   },
   toggleLmsCardDiffDropdown(e, idx) {
     this._toggleCyberDropdownById(`lms-diff-dropdown-${idx}`, e);
   },
   toggleEditCardSubjectDropdown(e) {
     this._toggleCyberDropdownById('edit-card-subject-dropdown-wrap', e);
   },
   toggleEditCardDeckDropdown(e) {
     this._toggleCyberDropdownById('edit-card-deck-dropdown-wrap', e);
   },
   toggleEditCardDiffDropdown(e) {
     this._toggleCyberDropdownById('edit-card-diff-dropdown-wrap', e);
   },
   toggleEditCardCorrectDropdown(e) {
     this._toggleCyberDropdownById('edit-card-correct-dropdown-wrap', e);
   },
   toggleExamCountDropdown(e) {
     this._toggleCyberDropdownById('exam-count-dropdown-wrap', e);
   },
   toggleExamTimeDropdown(e) {
     this._toggleCyberDropdownById('exam-time-dropdown-wrap', e);
   },
   toggleSprintCountDropdown(e) {
     this._toggleCyberDropdownById('sprint-count-dropdown-wrap', e);
   },
   toggleManageSubjectMergeDropdown(e) {
     this._toggleCyberDropdownById('manage-subject-merge-dropdown-wrap', e);
   },
   toggleManageSubjectDeleteDropdown(e) {
     this._toggleCyberDropdownById('manage-subject-delete-dropdown-wrap', e);
   },
   toggleBulkReassignSubjectDropdown(e) {
     this._toggleCyberDropdownById('bulk-reassign-subject-dropdown-wrap', e);
   },
   
   ```

   * **Lưu ý bảo toàn Test**: Giữ nguyên tên tất cả các hàm `toggleBankTopicDropdown`, `toggleBankDiffDropdown`, v.v. để các bài test hiện hữu (`tests/test-round14.js`, `tests/test-round37-toggle-bookmark-flag.js`, `tests/test-round40-app-wide-cyber-dropdowns.js`) pass 100%.

#### 1.2. Vá triệt để lỗi Stacking Context & Z-Index trong `css/style.css`

1. Tại `css/style.css` (khoảng dòng 6824–6833), sửa quy tắc `.quiz-card > *` để **không khóa cứng `z-index: 1`** gây kẹt Stacking Context giữa các `.form-group` anh em:

   ```
   .deck-card > *,
   .subject-group > *,
   .stat-card > *,
   .quiz-card > *,
   .bank-card-item > *,
   .glass-card > *,
   .study-mode-card > * {
     position: relative;
     z-index: auto;
   }
   
   ```

2. Thêm khối **Universal Dropdown Stacking & Elevation Rules** vào `css/style.css` (ngay sau phần `.cyber-dropdown` hoặc ở cuối file) sử dụng đồng thời cả `:has(.cyber-dropdown.open)` và `.has-open-dropdown`:

   ```
   /* ==========================================================================
      UNIVERSAL DROPDOWN STACKING CONTEXT & Z-INDEX ENGINE
      Đảm bảo mọi .cyber-dropdown trong Ngân hàng câu hỏi, Dán AI, Nhập LMS,
      và các Modal luôn nổi lên trên cùng, không bao giờ bị cắt hay chìm dưới input.
      ========================================================================== */
   #view-import .quiz-card,
   #view-import-lms .quiz-card,
   #view-import-lms .lms-config-card,
   .quiz-card.has-open-dropdown,
   .quiz-card:has(.cyber-dropdown.open),
   .lms-config-card.has-open-dropdown,
   .lms-config-card:has(.cyber-dropdown.open),
   .lms-preview-card.has-open-dropdown,
   .lms-preview-card:has(.cyber-dropdown.open),
   .bank-card-item.has-open-dropdown,
   .bank-card-item:has(.cyber-dropdown.open),
   .modal-box.has-open-dropdown,
   .modal-box:has(.cyber-dropdown.open),
   .glass-card.has-open-dropdown,
   .glass-card:has(.cyber-dropdown.open) {
     overflow: visible !important;
     contain: none !important;
   }
   
   .quiz-card.has-open-dropdown,
   .quiz-card:has(.cyber-dropdown.open),
   .lms-config-card.has-open-dropdown,
   .lms-config-card:has(.cyber-dropdown.open),
   .lms-preview-card.has-open-dropdown,
   .lms-preview-card:has(.cyber-dropdown.open) {
     z-index: var(--z-dropdown-card, 500) !important;
   }
   
   .form-group.has-open-dropdown,
   .form-group:has(.cyber-dropdown.open),
   .lms-config-grid.has-open-dropdown,
   .lms-config-grid:has(.cyber-dropdown.open),
   #new-deck-fields.has-open-dropdown,
   #new-deck-fields:has(.cyber-dropdown.open),
   #lms-new-deck-fields.has-open-dropdown,
   #lms-new-deck-fields:has(.cyber-dropdown.open),
   .bank-filter-bar.has-open-dropdown,
   .bank-filter-bar:has(.cyber-dropdown.open),
   .lms-meta-row.has-open-dropdown,
   .lms-meta-row:has(.cyber-dropdown.open),
   .lms-card-actions.has-open-dropdown,
   .lms-card-actions:has(.cyber-dropdown.open) {
     position: relative !important;
     z-index: var(--z-dropdown-parent, 9990) !important;
   }
   
   .cyber-dropdown {
     position: relative;
     z-index: 10;
   }
   
   .cyber-dropdown.open {
     position: relative !important;
     z-index: var(--z-dropdown-open, 9999) !important;
   }
   
   .cyber-dropdown.open .cyber-dropdown-menu {
     display: flex !important;
     z-index: var(--z-dropdown-menu, 10000) !important;
     background: var(--dropdown-menu-bg, #151226) !important;
     border: 1px solid var(--dropdown-menu-border, rgba(167, 139, 250, 0.38)) !important;
     box-shadow: var(--dropdown-menu-shadow, 0 20px 44px rgba(0, 0, 0, 0.85), 0 0 16px rgba(139, 92, 246, 0.20)) !important;
   }
   
   ```

### NHIỆM VỤ 2: XÓA BỎ FONT PIXEL LẠC TÔNG & ĐỒNG NHẤT PHÔNG CHỮ TOÀN APP

1. **Cập nhật `PRODUCT.md`**:

   * Tại mục `Phong cách thị giác`, sửa dòng `"Heading font: Pixel font. Thân bài và toàn bộ UI: đúng 1 font sans-serif thường dễ đọc (Plus Jakarta Sans / Inter)."` thành:
     `"Toàn bộ Heading, Tiêu đề và UI/Thân bài: Đồng nhất sử dụng hệ thống font Sans-serif hiện đại, sắc nét, dễ đọc ('Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif); chỉ dùng font Monospace ('JetBrains Mono') cho mã code/JSON hoặc đồng hồ bấm giờ. Không sử dụng font Pixel."`

2. **Cập nhật `css/fonts.css` và `css/theme.css`**:

   * **Quan trọng để không làm gãy `npm test`**: Trong `tests/test-runner.js` (Suite 8) và `tests/test-round6.js`, bộ test có kiểm tra sự tồn tại của chuỗi `@font-face` (`font-family: 'VT323'`, `font-family: 'Caveat'`) và tên biến `--font-pixel:`, `--font-script:`, `--font-body:` trong `css/fonts.css` cũng như `.brand-title { font-family: var(--font-pixel)`.

   * Vì vậy, **giữ nguyên các khối `@font-face` và tên biến `--font-pixel`**, nhưng **đổi giá trị của `--font-pixel`, `--font-heading`, `--font-script`, `--font-editorial`, `--font-poster` trỏ thẳng về `var(--font-body)`** trong cả `css/fonts.css` và `css/theme.css`:

     ```
     :root {
       --font-body: 'Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
       --font-family: var(--font-body);
       --font-heading: var(--font-body);
       --font-pixel: var(--font-body);
       --font-script: var(--font-body);
       --font-editorial: var(--font-body);
       --font-poster: var(--font-body);
       --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
     }
     
     ```

3. **Tinh chỉnh lại kiểu chữ của các thành phần từng dùng Font Pixel trong `css/style.css`**:

   * Kiểm tra `.study-mode-title` (dòng 4740), `.brand-title` (dòng 621), `.topbar-title` (dòng 740), `.stat-num` (dòng 1836), `.daily-radial-pct` (dòng 1111), `.daily-radial-meta` (dòng 1138), `.sm2-retention-pct` (dòng 1192), `.pixel-battery-pct` (dòng 1421):

     * Giữ `font-family: var(--font-pixel);` (nay đã phân giải về `Plus Jakarta Sans` / `Be Vietnam Pro` bình thường, sắc nét).

     * Chỉnh `letter-spacing: -0.02em;` (thay cho `0.03em`–`0.05em` thưa thớt của font pixel cũ) và `font-weight: 700;` (hoặc `800` cho số thống kê) để chữ nhìn tự nhiên, hiện đại, đồng bộ 100% với toàn bộ giao diện.

   * Các nhãn badge nhỏ kiểu `MODE // 01` (`.tech-tag`) chuyển về `font-family: var(--font-body)` với `font-weight: 600; font-size: 0.75rem; letter-spacing: 0.02em;` để không bị lệch kiểu chữ giữa thẻ chế độ học và phần mô tả.

### NHIỆM VỤ 3: NỚI RỘNG KHUNG BỘ THẺ (`.deck-card`) & TÁI CẤU TRÚC HÀNG NÚT BẤM ("ÔN TẬP")

1. **Mở rộng lưới `.decks-grid` và khung `.deck-card` trong `css/style.css` (dòng 1947–1993)**:

   * Tăng độ rộng tối thiểu của mỗi cột trong `.decks-grid` từ `300px` lên `var(--deck-card-min-width, 340px)` và tăng khoảng cách `gap: 20px`:

     ```
     .decks-grid {
       display: grid;
       grid-template-columns: repeat(auto-fill, minmax(var(--deck-card-min-width, 340px), 1fr));
       gap: 20px;
     }
     .deck-card {
       padding: var(--deck-card-padding, 24px);
       min-height: 215px;
       /* giữ nguyên các thuộc tính nền, viền, transition hiện có */
     }
     
     ```

2. **Sắp xếp lại `.deck-actions` để nút "Ôn tập" và các nút phụ không bao giờ bị chật hay sắp tràn chữ**:

   * Trên cả Desktop và Mobile, thiết kế `.deck-actions` theo dạng **Grid 2 tầng cân đối**:

     * **Tầng 1 (Hàng trên cùng)**: Nút chính `.btn-deck-study` (`Ôn tập`) trải rộng 100% chiều ngang (`grid-column: 1 / -1; width: 100%; min-height: 42px; padding: 10px 18px; font-size: 0.95rem; font-weight: 700;`), giúp nút "Ôn tập" thoáng rộng, nổi bật và không bao giờ bị ép chữ.

     * **Tầng 2 (Các hàng dưới)**: 4 nút phụ (`+ Thêm`, `🎴 Thẻ` / `Lật thẻ`, `⏱️ Thi` / `Thi thử`, `🔄 Reset`) chia thành lưới 2 cột đều nhau (`grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;`), mỗi nút có `width: 100%; min-height: 38px; padding: 8px 12px; font-size: 0.85rem; justify-content: center; white-space: nowrap;`.

   * Cụ thể trong `css/style.css`:

     ```
     .deck-actions {
       display: grid !important;
       grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
       gap: 8px !important;
       width: 100% !important;
       box-sizing: border-box !important;
     }
     .deck-actions .btn-deck-study,
     .deck-actions .btn-primary {
       grid-column: 1 / -1 !important;
       width: 100% !important;
       min-height: 42px !important;
       padding: 10px 18px !important;
       font-size: 0.95rem !important;
       font-weight: 700 !important;
       justify-content: center !important;
     }
     .deck-actions .btn-secondary {
       width: 100% !important;
       min-height: 38px !important;
       padding: 8px 10px !important;
       font-size: 0.84rem !important;
       justify-content: center !important;
       white-space: nowrap !important;
       box-sizing: border-box !important;
     }
     
     ```

   * Cách bố trí này đồng thời tương thích 100% với bài test `tests/test-round24-mobile-fixes.js` (vốn kiểm tra `.deck-actions` có `grid-template-columns: repeat(2, 1fr) !important;` trên mobile).

### NHIỆM VỤ 4: PHÓNG TO GIAO DIỆN LẬT THẺ (FLASHCARD) DỄ ĐỌC, RÕ NÉT TRÊN DESKTOP

1. **Cập nhật kích thước Flashcard trên Desktop (`@media (min-width: 769px)` trong `css/style.css` khoảng dòng 3038–3095)**:

   * Tăng độ rộng khung chứa `.flashcard-player-container` và `.flashcard-bottom-actions` từ `660px` lên **`var(--flashcard-max-width, 820px) !important`** (và trên màn hình lớn `>= 1440px` lên `860px`).

   * Tăng chiều cao `.flashcard-stage` và `.flashcard-card` trong `body.flashcard-active` từ `310px` lên **`var(--flashcard-height, 380px) !important`** (`min-height: 340px !important; max-height: 420px !important;`).

   * Tăng khoảng đệm trong mặt thẻ `.flashcard-face` lên **`padding: 24px 32px !important;`**.

   * Phóng to cỡ chữ câu hỏi `.flashcard-question-text` lên **`var(--flashcard-question-size, clamp(1.22rem, 2.1vw, 1.5rem)) !important;`** với `line-height: 1.55 !important;`.

   * Phóng to cỡ chữ đáp án mặt sau `.flashcard-answer-text` lên **`var(--flashcard-answer-size, clamp(1.25rem, 2.2vw, 1.55rem)) !important;`** và hộp giải thích `.flashcard-explanation-text` lên **`0.95rem !important;`**.

   * Tăng chiều cao 4 nút đánh giá SRS (`.srs-btn`: `Chưa thuộc`, `Khó nhớ`, `Nhớ tốt`, `Rất dễ`) lên **`height: 48px !important; min-height: 48px !important;`**, chữ `.srs-label` lên **`0.88rem !important`**.

2. **Bảo toàn tính tương thích với bộ Test tự động**:

   * Giữ nguyên khai báo gốc `.flashcard-stage { height: 320px; min-height: 280px; max-height: 340px; flex: none; }` ở dòng 2699 (ngoài media query) để `tests/test-round28-desktop-and-mobile-rebuild.js` và `tests/test-round31-desktop-regression-fixes.js` không bị lỗi khi quét chuỗi tĩnh.

   * Ghi đè kích thước phóng to thông qua `body.flashcard-active .flashcard-stage` và `body.flashcard-active .flashcard-card` trong `@media (min-width: 769px)`. Đồng thời cập nhật điều kiện kiểm tra trong `tests/test-round41-desktop-flashcard-layout.js` (dòng 115–121) chấp nhận chiều cao mới (`380px` / `48px`).

   * Kiểm tra đảm bảo trên viewport Desktop `1280x900`, toàn bộ thẻ Flashcard (`380px`) + thanh 4 nút SRS (`48px`) vẫn nằm trọn trong màn hình mà không bị tràn dọc (`scrollY === 0`).

### NHIỆM VỤ 5: XÂY DỰNG FILE ĐIỀU PHỐI NGÔN NGỮ THIẾT KẾ TRUNG TÂM (`css/theme.css` & `DESIGN.md`)

Để chuẩn bị cho các đợt chỉnh sửa toàn diện tiếp theo (`promt1b`, `promt1c`...) mà không bao giờ làm hỏng chức năng hiện có:

1. **Nâng cấp `css/theme.css` thành File Điều Phối Thiết Kế Trung Tâm (Master Design System Tokens)**:

   * Bổ sung đầy đủ các nhóm biến điều khiển cấp Component vào `:root` trong `css/theme.css` (vẫn giữ nguyên 100% các biến cũ như `--accent`, `--bg-base`, `--text-primary` và dòng comment `HƯỚNG DẪN TỰ TÙY BIẾN CHO BẠN:` để pass `npm test`):

     ```
     /* ==========================================
        13. COMPONENT & Z-INDEX ORCHESTRATION TOKENS (PROMPT 1A)
        Chỉnh sửa tại đây để điều phối toàn bộ kích thước thẻ,
        flashcard, dropdown và phân tầng nổi trên toàn ứng dụng.
        ========================================== */
     /* Hệ thống phân tầng Z-Index chuẩn */
     --z-sidebar: 100;
     --z-topbar: 90;
     --z-dropdown-card: 500;
     --z-dropdown-parent: 9990;
     --z-dropdown-open: 9999;
     --z-dropdown-menu: 10000;
     --z-modal: 11000;
     --z-toast: 12000;
     
     /* Dropdown Tokens */
     --dropdown-trigger-bg: #131122;
     --dropdown-trigger-border: rgba(167, 139, 250, 0.24);
     --dropdown-trigger-radius: 12px;
     --dropdown-menu-bg: #151226;
     --dropdown-menu-border: rgba(167, 139, 250, 0.38);
     --dropdown-menu-shadow: 0 20px 44px rgba(0, 0, 0, 0.85), 0 0 16px rgba(139, 92, 246, 0.20);
     
     /* Deck Card (Ô Ôn Tập) Tokens */
     --deck-card-min-width: 340px;
     --deck-card-padding: 24px;
     --deck-card-gap: 20px;
     
     /* Flashcard (Giao diện Lật Thẻ) Tokens */
     --flashcard-max-width: 820px;
     --flashcard-max-width-xl: 860px;
     --flashcard-height: 380px;
     --flashcard-min-height: 340px;
     --flashcard-max-height: 420px;
     --flashcard-face-padding: 24px 32px;
     --flashcard-question-size: clamp(1.22rem, 2.1vw, 1.5rem);
     --flashcard-answer-size: clamp(1.25rem, 2.2vw, 1.55rem);
     --flashcard-explanation-size: 0.95rem;
     
     ```

2. **Tạo mới file `DESIGN.md` tại thư mục gốc của dự án** (theo chuẩn `/impeccable document`):

   * Ghi lại toàn bộ quy ước Ngôn ngữ Thiết kế của ứng dụng:

     * **Kiến trúc File Thiết kế**:

       * `DESIGN.md`: Tài liệu quy chuẩn thiết kế dành cho Developer & AI Agent.

       * `css/theme.css`: Nguồn phát biến CSS (Design Tokens) duy nhất điều phối Màu sắc, Khoảng cách, Bo góc, Đổ bóng, Z-Index và Kích thước Component.

       * `css/fonts.css`: Quản lý khai báo font chữ cục bộ (Offline-first) và ánh xạ biến font.

       * `css/style.css`: File stylesheet thực thi nhận giá trị từ `css/theme.css` và `css/fonts.css`.

     * **Quy tắc Bất khả xâm phạm (Non-Negotiable Guardrails)**:

       * Không bao giờ gắn `z-index` tĩnh cho `.quiz-card > *` làm kẹt `.cyber-dropdown`.

       * Mọi dropdown mới bắt buộc dùng cấu trúc `.cyber-dropdown` và đi qua hàm `App._toggleCyberDropdownById(wrapId, event)`.

       * Không sử dụng font Pixel trên UI; mọi tiêu đề và văn bản dùng `--font-body` (`Plus Jakarta Sans` / `Be Vietnam Pro`).

       * Không chạm vào cấu trúc dữ liệu IndexedDB (`js/db.js`), thuật toán SM-2 (`js/srs.js`), hay danh sách câu nói (`quotes.js`).

## PHẦN 4: QUY TRÌNH KIỂM ĐỊNH CHẤT LƯỢNG (VERIFICATION & QA CHECKLIST)

Sau khi thực hiện xong 5 nhiệm vụ trên, AI Agent **BẮT BUỘC** chạy tuần tự các bước kiểm tra sau và ghi kết quả vào `docs/handoff/PROGRESS-1A.md`:

```
# 1. Kiểm tra cú pháp JavaScript & chạy toàn bộ Unit/Integration Tests
npm test

# 2. Chạy bản Build Production để đảm bảo không thiếu file hay lỗi cú pháp
npm run build

```

### Danh sách nghiệm thu bắt buộc (Acceptance Criteria):

* \[ \] **Dropdown Ngân hàng câu hỏi (`#view-bank`)**: Bấm mở `Môn học` -> bấm sang `Chủ đề / chương` -> menu `Môn học` tự động đóng ngay lập tức. Bấm mở `Tất cả nguồn` -> bấm sang `Mọi độ khó` -> menu `Tất cả nguồn` tự động đóng ngay lập tức. Tại mọi thời điểm chỉ có tối đa **1 dropdown** được mở trên toàn ứng dụng.

* \[ \] **Dropdown Dán AI (`#view-import`) & Nhập LMS (`#view-import-lms`)**: Khi bấm mở `1. Chọn Môn Học` hoặc `2. Chọn Bộ Câu Hỏi Đích`, menu xổ xuống nổi hoàn toàn lên trên các ô input bên dưới (`z-index: 10000`), nền menu đặc rõ ràng, không bị chữ của ô dưới đè xuyên qua.

* \[ \] **Đồng nhất Font chữ**: Toàn bộ các thẻ chế độ học (`1. Luyện tập tự do` ... `7. Ôn nước rút`), thanh tiêu đề, tên app và số liệu thống kê hiển thị bằng font chữ không chân (`Plus Jakarta Sans` / `Be Vietnam Pro`) sắc nét, bình thường, không còn chỗ nào bị răng cưa kiểu Pixel.

* \[ \] **Ô Ôn tập (`.deck-card`)**: Khung thẻ rộng rãi (`minmax(340px, 1fr)`), nút chính `Ôn tập` nằm trọn hàng trên rộng thoáng, 4 nút phụ (`+ Thêm`, `Thẻ`, `Thi`, `Reset`) chia 2 cột cân đối bên dưới, chữ nằm gọn trong nút và cách mép khung an toàn.

* \[ \] **Giao diện Lật thẻ (Flashcard)**: Khung thẻ trên Desktop rộng `820px`, cao `380px`, cỡ chữ câu hỏi và công thức toán học lớn rõ (`clamp(1.22rem, 2.1vw, 1.5rem)`), 4 nút đánh giá SRS bên dưới hiển thị đầy đủ trong màn hình không bị cắt.

* \[ \] **File điều phối thiết kế**: `css/theme.css` chứa đầy đủ biến điều phối trung tâm, `DESIGN.md` được khởi tạo hoàn chỉnh, và `npm test` + `npm run build` đạt **100% PASS (0 failed)**.