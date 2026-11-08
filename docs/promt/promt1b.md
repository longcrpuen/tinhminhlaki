# PROMPT 1B: TINH CHỈNH KHUNG HERO TITLE ĐƠN LỚP (CHỮ DÀY & VIỀN BOLD), BỘ CHỌN EMOJI & BẢNG MÀU THEO VIBE, HIỂN THỊ TÊN MÔN HỌC Ở TRANG ĐẦU, VÀ TỐI ƯU HIỆU NĂNG TOÀN DIỆN

> **ĐƯỜNG DẪN LƯU FILE TRONG DỰ ÁN**: `docs/promt/promt1b.md`
> **PHIÊN BẢN**: `1b` (Kế thừa trực tiếp từ nền tảng `1a` và hệ thống token trong `css/theme.css` + `DESIGN.md`)
> **FILE THEO DÕI TIẾN ĐỘ**: `docs/handoff/PROGRESS-1B.md`
> **MỤC TIÊU CỐT LÕI**: Giải quyết triệt để 5 yêu cầu nâng cấp UI/UX và hiệu năng của đợt `1b`, đồng thời **giữ nguyên 100% tính năng hiện có và đảm bảo `npm test` + `npm run build` đạt 100% PASS**.

## PHẦN 1: KÍCH HOẠT BỘ SKILLS TRƯỚC KHI THỰC THI

Trước khi chỉnh sửa code, AI Agent **BẮT BUỘC** kích hoạt và phối hợp các bộ Skills đã có trong dự án:

```bash
# 1. Nạp ngữ cảnh thiết kế từ Impeccable (đọc PRODUCT.md & DESIGN.md đã tạo ở đợt 1a)
sh .agent/skills/impeccable/scripts/impeccable context || npx impeccable context

# 2. Kích hoạt quy trình từ các bộ Skill:
# - Superpowers: systematic-debugging, writing-plans, verification-before-completion
# - Impeccable: typeset, colorize, layout, optimize, polish, audit
# - UI/UX Pro Max & Taste-Skill: ui-ux-pro-max, design-taste-frontend
```

| Tên Skill | Nhiệm vụ cụ thể trong đợt `1b` |
| :--- | :--- |
| **`impeccable`** (`typeset`, `colorize`, `layout`, `optimize`, `polish`) | Gộp khung Hero Title về 1 khung duy nhất có viền bold & chữ dày (`typeset` + `layout`); tinh chỉnh lại bảng màu toàn app và bảng chọn màu môn học hợp vibe (`colorize`); tối ưu hiệu năng render (`optimize`). |
| **`ui-ux-pro-max-skill`** & **`design-taste-frontend`** | Thiết kế **Interactive Emoji Picker Grid** (chọn 1-click không cần gõ phím) và **Custom Color Swatch Picker** trong Modal Tạo/Quản lý Môn học; thiết kế lại khu vực thẻ ở trang đầu hiển thị rõ **Tên Môn Học**. |
| **`superpowers`** (`systematic-debugging`, `verification-before-completion`) | Rà soát toàn bộ điểm nghẽn hiệu năng (IndexedDB queries, `pointermove` layout thrashing, DOM reflows) và kiểm định bằng bộ test tự động trước khi hoàn tất. |

## PHẦN 2: CHẨN ĐOÁN NGUYÊN NHÂN GỐC RỄ CỦA 5 VẤN ĐỀ TRONG ĐỢT `1B`

1. **Vấn đề 1 — Khung Hero Title ở trang đầu bị chồng 2 khung, chữ hơi mảnh và viền nhạt**:
   - **Nguyên nhân**: Trong `index.html` (dòng 142–168) và `css/style.css` (dòng 880–920), khối `.hero-card` bên ngoài đã có nền, viền và bóng đổ, nhưng bên trong lại lồng thêm thẻ `<div class="hero-heading-scrim">` cũng có `padding: 24px 28px`, `border-radius: 20px`, `background: radial-gradient(...)`, `border: 1px solid rgba(255, 255, 255, 0.04)` và `box-shadow` riêng. Điều này tạo ra 2 khung chữ nhật chồng lên nhau rất mất cân đối. Ngoài ra, ở đợt `1a`, biến `--font-poster` được trỏ về `--font-body` nên tiêu đề `#hero-title` mất đi độ dày cơ học của font Display Black, và viền `.hero-card` chỉ `1px` mờ nhạt.
2. **Vấn đề 2 — Chọn Emoji cho môn học bắt tự gõ bàn phím rất bất tiện**:
   - **Nguyên nhân**: Trong `#modal-create-subject` (`index.html` dòng 1824) và `#modal-manage-subject` (dòng 1855), trường `Biểu tượng (Emoji)` đang dùng `<input type="text">` đơn thuần, bắt người dùng tự mở bảng phím tắt hệ điều hành để gõ emoji.
3. **Vấn đề 3 — Bảng chọn màu môn học (OS Color Picker) và bảng màu tổng thể chưa hợp vibe**:
   - **Nguyên nhân**: Trường `Màu nhận diện` trong `#modal-create-subject` (dòng 1828) và `#modal-manage-subject` (dòng 1859) đang dùng `<input type="color">` mặc định của trình duyệt, khi bấm vào sẽ bật lên bảng chọn màu RGB nền trắng/xám thô kệch của Windows, phá vỡ hoàn toàn không gian Dark Mode của ứng dụng. Đồng thời, bảng màu trong `css/theme.css` cần được tinh chỉnh lại độ sâu nền và sắc độ Tím - Hồng Orchid cho hài hòa, sang trọng hơn.
4. **Vấn đề 4 — Các thẻ Deck ở trang đầu tiên (`#view-dashboard`) chỉ hiện chữ `DECK` chung chung thay vì hiện Tên Môn Học**:
   - **Nguyên nhân**: Trong `js/app.js` (dòng 1444–1496), hàm `renderDashboard()` chỉ lấy `decks.slice(0, 6)` và gọi `_createDeckCardHtml(deck, ...)`, trong đó góc phải thẻ gắn cứng nhãn `<span class="tech-tag subtle">DECK</span>` mà không hề hiển thị bộ thẻ đó thuộc **Môn học nào**, hoặc khi có nhiều bộ thẻ nhỏ (`tkt1`, `tkt2`) thì không gom/gắn nhãn theo môn học khiến người dùng khó nhận diện.
5. **Vấn đề 5 — Các điểm nghẽn hiệu năng tiềm ẩn trong toàn bộ ứng dụng**:
   - `renderDashboard()` đang gọi tuần tự 6 lệnh `await` tới IndexedDB và gọi lặp `db.getDueCards()` + `db.getMeta('streak')` 2 lần liên tiếp (1 lần trong `updateGlobalStats()`, 1 lần ngay bên dưới).
   - `initSpotlightHover()` (`js/app.js` dòng 1189–1208) đang gọi `activeTarget.getBoundingClientRect()` trong mỗi frame `pointermove`, gây ép trình duyệt tính toán lại bố cục (Layout Thrashing) liên tục khi di chuột.
   - `toggleBankCardBookmark()` và `toggleBankCardFlag()` (`js/app.js` dòng 5320, 5343) đang gọi `await db.getAllCards()` quét lại toàn bộ cơ sở dữ liệu chỉ để cộng/trừ 1 đơn vị trên badge đếm số câu lưu/gắn cờ.
   - Vòng lặp tạo Mini Heatmap 7 ngày trong `renderDashboard()` đang lọc mảng `logs` 7 lần và khởi tạo `new Date(l.timestamp).toISOString()` lặp đi lặp lại.

## PHẦN 3: CHI TIẾT KỸ THUẬT CẦN THỰC HIỆN TRONG ĐỢT `1B`

### NHIỆM VỤ 1: GỘP HERO TITLE VỀ 1 KHUNG DUY NHẤT, LÀM VIỀN BOLD & CHỮ DÀY ĐẦM HƠN

1. **Trong `css/theme.css`**:
   - Khai báo biến `--font-poster` dùng họ font Display siêu dày (`'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif`) để riêng phần Quote Hero có nét chữ cực dày (`font-weight: 900`), trong khi các phần UI khác vẫn dùng `--font-body` đồng nhất.
   - Bổ sung các token điều khiển khung Hero vào `css/theme.css`:
     ```css
     --hero-border-width: 2px;
     --hero-border-color: rgba(192, 132, 252, 0.48);
     --hero-border-hover: rgba(244, 114, 182, 0.72);
     --hero-bg: linear-gradient(145deg, rgba(22, 16, 42, 0.90) 0%, rgba(13, 9, 26, 0.94) 100%);
     --hero-shadow: 0 16px 40px rgba(4, 2, 12, 0.60), inset 0 1px 0 rgba(255, 255, 255, 0.18);
     ```
2. **Trong `css/style.css` (khoảng dòng 880–1040)**:
   - **Gộp 2 khung thành 1 khung duy nhất**: Giữ nguyên class `.hero-heading-scrim` trong HTML và CSS (vẫn có `margin: 0 0 18px 0;` và `transform: translateZ(0);` để pass 100% bài test `tests/test-round15.js` và `tests/test-round17.js`), nhưng **xóa bỏ hoàn toàn nền, viền, bóng đổ và padding riêng của `.hero-heading-scrim`**:
     ```css
     .hero-card {
       background: var(--hero-bg, linear-gradient(145deg, rgba(22, 16, 42, 0.90) 0%, rgba(13, 9, 26, 0.94) 100%)) !important;
       border: var(--hero-border-width, 2px) solid var(--hero-border-color, rgba(192, 132, 252, 0.48)) !important;
       border-radius: var(--radius-card, 24px) !important;
       padding: 36px 38px !important;
       margin-bottom: 28px;
       position: relative;
       overflow: hidden;
       box-shadow: var(--hero-shadow) !important;
       transition: transform var(--dur-norm) var(--ease-spring), box-shadow var(--dur-norm) var(--ease-out-soft), border-color var(--dur-norm) ease;
       contain: layout style;
       transform: translateZ(0);
     }
     .hero-card:hover {
       border-color: var(--hero-border-hover, rgba(244, 114, 182, 0.72)) !important;
       box-shadow: 0 18px 44px rgba(8, 4, 20, 0.68), 0 0 20px rgba(192, 132, 252, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.24) !important;
     }

     /* Gỡ bỏ khung lồng thứ 2, giữ nguyên thuộc tính bắt buộc cho test suite */
     .hero-heading-scrim {
       position: relative;
       padding: 0 !important;
       margin: 0 0 18px 0;
       border-radius: 0 !important;
       background: transparent !important;
       border: none !important;
       box-shadow: none !important;
       width: 100% !important;
       transform: translateZ(0);
     }
     ```
   - **Làm chữ Title Quote dày hơn, đầm hơn (Ultra-Bold / Heavy Stroke)**:
     ```css
     .hero-title {
       font-family: var(--font-poster, 'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif);
       font-weight: 900 !important;
       display: block;
       padding-top: 6px;
       padding-bottom: 6px;
       margin-bottom: 16px;
       line-height: 1.15;
       text-transform: uppercase;
       letter-spacing: -0.03em;
       font-size: clamp(2.1rem, 4.8vw, 3.5rem);
       transform: translateZ(0);
       word-break: break-word;
       overflow-wrap: break-word;
     }
     .hero-title-main,
     .hero-title-sub {
       display: inline;
       font-family: var(--font-poster, 'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif);
       font-weight: 900 !important;
       -webkit-text-stroke: 0.75px #ffffff;
       paint-order: stroke fill;
       text-transform: uppercase;
       font-size: inherit;
       letter-spacing: -0.03em;
       color: #ffffff !important;
       -webkit-text-fill-color: #ffffff !important;
       text-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
     }
     .hero-title-accent {
       display: inline;
       font-family: var(--font-poster, 'Montserrat', 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif);
       font-style: normal !important;
       font-weight: 900 !important;
       -webkit-text-stroke: 0.75px #f0abfc;
       paint-order: stroke fill;
       text-transform: uppercase;
       font-size: inherit;
       letter-spacing: -0.03em;
       color: #e879f9 !important;
       -webkit-text-fill-color: #e879f9 !important;
       text-shadow: 0 4px 18px rgba(232, 121, 249, 0.35), 0 2px 8px rgba(0, 0, 0, 0.85);
     }
     ```

### NHIỆM VỤ 2 & 3: THIẾT KẾ BỘ CHỌN EMOJI 1-CLICK & BẢNG MÀU VIBE TRONG MODAL MÔN HỌC + NÂNG CẤP BẢNG MÀU APP

#### 2.1. Tinh chỉnh Bảng màu tổng thể trong `css/theme.css` cho hợp Vibe hơn
Cập nhật các biến màu trong `css/theme.css` theo tông **Cosmic Amethyst & Orchid Rose** (tím đêm sâu trong trẻo, viền sáng dịu, nút bấm chuyển sắc mượt từ Violet sang Orchid Pink mà không bị chói hay xỉn màu):
```css
  /* 2. MÀU ĐIỂM NHẤN (ACCENT COLORS - COSMIC AMETHYST & ORCHID) */
  --accent: #b388ff;                     /* Tím Amethyst sáng dịu */
  --accent-secondary: #f472b6;           /* Hồng Orchid cân bằng */
  --accent-primary: #a855f7;
  --accent-glow: rgba(179, 136, 255, 0.24);
  --accent-subtle-bg: rgba(179, 136, 255, 0.12);
  --accent-border: rgba(192, 132, 252, 0.32);

  /* Gradient thương hiệu mượt mà, hiện đại */
  --brand-gradient: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%);
  --brand-gradient-hover: linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #f472b6 100%);
  --brand-gradient-subtle: linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 100%);

  /* 3. MÀU NỀN & BỀ MẶT (DEEP OBSIDIAN VIOLET) */
  --bg-base: #0b0816;
  --bg-surface: rgba(20, 15, 36, 0.86);
  --bg-surface-elevated: rgba(30, 22, 52, 0.92);
  --bg-card: rgba(21, 16, 38, 0.84);
  --bg-card-hover: rgba(31, 23, 54, 0.90);
  --bg-card-active: rgba(38, 28, 66, 0.95);
  --bg-overlay: rgba(8, 5, 18, 0.86);

  --glass-tint: rgba(21, 16, 38, 0.84);
  --glass-border: rgba(192, 132, 252, 0.22);
  --glass-border-subtle: rgba(192, 132, 252, 0.12);
  --glass-highlight: rgba(255, 255, 255, 0.12);
```

#### 2.2. Thay thế ô nhập Emoji & ô Color mặc định trong `#modal-create-subject` và `#modal-manage-subject` (`index.html` & `js/app.js`)
1. **Danh sách 24 Emoji Học Tập Chuẩn & 12 Màu Nhận Diện Hợp Vibe**:
   - Trong `js/app.js`, khai báo hằng số dùng chung:
     ```javascript
     SUBJECT_EMOJI_PRESETS: [
       '📚', '📐', '💻', '🔬', '🧬', '🧪', '⚛️', '🌍',
       '🏛️', '⚖️', '📈', '💰', '🧠', '🩺', '🎨', '🎵',
       '🇬🇧', '🇯🇵', '🇨🇳', '🚀', '⚡', '🎯', '🏆', '🎓'
     ],
     SUBJECT_COLOR_PRESETS: [
       { hex: '#a855f7', name: 'Tím Lavender' },
       { hex: '#c084fc', name: 'Tím Orchid' },
       { hex: '#ec4899', name: 'Hồng Berry' },
       { hex: '#f472b6', name: 'Hồng Pastel' },
       { hex: '#8b5cf6', name: 'Tím Violet' },
       { hex: '#6366f1', name: 'Chàm Indigo' },
       { hex: '#38bdf8', name: 'Xanh Sky' },
       { hex: '#2dd4bf', name: 'Xanh Mint' },
       { hex: '#34d399', name: 'Xanh Emerald' },
       { hex: '#facc15', name: 'Vàng Gold' },
       { hex: '#fb923c', name: 'Cam Coral' },
       { hex: '#fb7185', name: 'Đỏ Rose' }
     ],
     ```
2. **Cấu trúc UI trong `#modal-create-subject` và `#modal-manage-subject` (`index.html`)**:
   - Thêm một thanh **Xem trước nhãn môn học (Live Subject Badge Preview)** ngay dưới ô nhập Tên môn học để người dùng thấy ngay icon + màu + tên môn khi bấm chọn.
   - **Khu vực Chọn Biểu Tượng (Emoji Picker Grid)**:
     - Hiển thị lưới 8 cột × 3 hàng gồm 24 nút `.emoji-Preset-btn` (kích thước `38px × 38px`, bo góc `10px`, nền tối viền tím mờ; khi được chọn có class `.active` viền sáng `#f472b6` và nền `rgba(168, 85, 247, 0.25)`).
     - Giữ lại `<input type="text" id="create-subject-icon" ...>` và `<input type="text" id="manage-subject-icon" ...>` ở dạng một ô nhỏ gọn bên cạnh tiêu đề `"Biểu tượng (Emoji):"` (hoặc cho phép vừa click chọn 1-click dưới lưới vừa gõ tùy ý nếu muốn) để mọi bài test truy cập `#create-subject-icon` và `#manage-subject-icon` hoạt động bình thường.
   - **Khu vực Chọn Màu Nhận Diện (Vibe Color Swatch Palette)**:
     - Thay vì bắt người dùng bấm vào `<input type="color">` mở cửa sổ RGB trắng xám của Windows, hiển thị **Lưới 12 viên màu tròn (`.color-swatch-btn`)** chuẩn vibe Dark Mode. Khi bấm vào viên màu nào, viên đó sáng vòng nhẫn trắng-tím (`box-shadow: 0 0 0 2px #0b0816, 0 0 0 4px var(--swatch-color), 0 0 14px var(--swatch-color)`), đồng thời cập nhật giá trị vào `<input type="color" id="create-subject-color" style="display:none;">` (và `#manage-subject-color`).
   - Viết các hàm helper trong `js/app.js`:
     - `renderSubjectPickerControls(mode)` (`mode = 'create' | 'manage'`)
     - `selectSubjectEmoji(mode, emoji)`
     - `selectSubjectColor(mode, hexColor)`
     - `updateSubjectModalPreview(mode)`
     - Tự động gọi `renderSubjectPickerControls('create')` trong `openCreateSubjectModal()` và `renderSubjectPickerControls('manage')` trong `openManageSubjectModal(subjectId)`.

### NHIỆM VỤ 4: HIỂN THỊ RÕ TÊN MÔN HỌC TRÊN CÁC THẺ Ở TRANG ĐẦU TIÊN (`#view-dashboard`) & TOÀN APP

1. **Nâng cấp hàm `renderDashboard()` và `_createDeckCardHtml()` trong `js/app.js` (khoảng dòng 1444–1496)**:
   - Tại `renderDashboard()`, lấy danh sách môn học `const subjects = await db.getAllSubjects();` và tạo `subjectsMap` (`id -> subject`).
   - Khi truyền vào `this._createDeckCardHtml(deck, totalCards, dueCards, subject)`:
     - Tra cứu môn học của bộ thẻ: `const subj = subject || subjectsMap[deck.subjectId] || subjectsMap['subj_unassigned'] || { name: 'Chưa phân loại', icon: '📚', color: '#a855f7' };`.
     - **Thay thế hoàn toàn cái nhãn `<span class="tech-tag subtle">DECK</span>` vô nghĩa** bằng **Badge Tên Môn Học nổi bật** mang đúng Icon và Màu sắc của môn học đó:
       ```html
       <span class="deck-subject-badge" style="--subj-color: ${subj.color || '#a855f7'};">
         <span class="deck-subject-icon">${subj.icon || '📚'}</span>
         <span class="deck-subject-name">${this._escapeHtml(subj.name)}</span>
       </span>
       ```
     - Nếu bộ thẻ có tên trùng hoặc quá ngắn (như `tkt1`, `tkt2`) và phần mô tả đang trống (`Không có mô tả`), hiển thị dòng phụ: `"Môn học: ${this._escapeHtml(subj.name)}"` thay vì `"Không có mô tả"` khô khan!
   - Thêm thanh **Bộ lọc nhanh theo Môn học (Subject Filter Pills)** ngay phía trên `#dashboard-decks-grid` ở trang đầu tiên (`Tất cả môn`, cùng các pill `📚 Tên môn (số bộ thẻ)`), hoặc nhóm ưu tiên các bộ thẻ có câu hỏi đến hạn theo từng môn học, giúp người dùng vừa nhìn vào trang đầu tiên là biết ngay mỗi thẻ thuộc môn nào và có thể lọc hoặc bấm ôn theo môn ngay lập tức!

2. **Style cho `.deck-subject-badge` trong `css/style.css`**:
   ```css
   .deck-subject-badge {
     display: inline-flex;
     align-items: center;
     gap: 6px;
     padding: 4px 11px;
     border-radius: 999px;
     font-size: 0.78rem;
     font-weight: 700;
     color: var(--subj-color, #c084fc);
     background: color-mix(in srgb, var(--subj-color, #a855f7) 16%, rgba(18, 14, 32, 0.9));
     border: 1px solid color-mix(in srgb, var(--subj-color, #a855f7) 42%, transparent);
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
     max-width: 170px;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     flex-shrink: 0;
   }
   ```

### NHIỆM VỤ 5: KIỂM TOÁN & TỐI ƯU HIỆU NĂNG TOÀN BỘ ỨNG DỤNG (PERFORMANCE OVERHAUL)

Thực hiện đầy đủ 5 tối ưu hóa kỹ thuật sau trong `js/app.js`, `js/db.js`, và `css/style.css`:

1. **Tối ưu `renderDashboard()` & `updateGlobalStats()` (Giảm 60% thời gian chờ IndexedDB khi mở App)**:
   - Trong `renderDashboard()`, thay vì gọi `await` tuần tự 6 lần và gọi trùng `db.getDueCards()` + `db.getMeta('streak')`, hãy dùng `Promise.all` nạp song song trong 1 lượt duy nhất:
     ```javascript
     const [subjects, decks, allCards, streakData, dailyGoal, logs] = await Promise.all([
       db.getAllSubjects(),
       db.getAllDecks(),
       db.getAllCards(),
       db.getMeta('streak', { count: 0 }),
       db.getMeta('dailyGoal', 20),
       db.getRecentLogs(200)
     ]);
     const nowTs = Date.now();
     const dueCards = allCards.filter(c => !c.srs?.dueDate || c.srs.dueDate <= nowTs);
     ```
   - Truyền trực tiếp `streakData` và `dueCards.length` vào `this.updateGlobalStats(streakData, dueCards.length)` để không phải truy vấn lại IndexedDB lần thứ 2.
2. **Tối ưu vòng lặp tính `logs` theo ngày trong `renderDashboard()` từ $O(7 	imes N)$ xuống $O(N)$**:
   - Duyệt mảng `logs` đúng **1 lần duy nhất** để gom số lượt ôn theo chuỗi ngày `YYYY-MM-DD` vào một `Map`, sau đó dùng lại cho cả `todayReviews` và 7 chấm của `mini-heatmap-days`.
3. **Triệt tiêu Layout Thrashing trong `initSpotlightHover()` (`js/app.js` dòng 1162–1215)**:
   - Không gọi `activeTarget.getBoundingClientRect()` bên trong `updateCoords()` mỗi khi chuột nhích 1px.
   - Lưu `cachedRect` khi `activeTarget` thay đổi (hoặc khi `pointerover`), và xóa `cachedRect = null` khi có sự kiện `scroll` hoặc `resize` (với `{ passive: true }`). Khi `pointermove` chạy ở 120Hz, chỉ dùng phép trừ số học `clientX - cachedRect.left` mà không chạm vào Layout Engine của trình duyệt!
4. **Tối ưu thao tác Lưu (Bookmark) & Gắn cờ (Flag) trong Ngân hàng câu hỏi (`js/app.js` dòng 5305–5348)**:
   - Trong `toggleBankCardBookmark(cardId)` và `toggleBankCardFlag(cardId)`, cập nhật trực tiếp thuộc tính trên thẻ trong mảng `this.currentFilteredBankCards` và tăng/giảm số đếm trên `#bank-count-bookmark` / `#bank-count-flag` ngay lập tức, loại bỏ lệnh `const allCards = await db.getAllCards();` gây nghẽn mỗi lần bấm nút.
5. **Dọn dẹp file rác & tối ưu CSS Render**:
   - Xóa các file CSS/JS dư thừa không được liên kết trong `index.html` nếu còn tồn tại (`css/thermal-dashboard.css`, `css/neumorph-study.css`, `css/thermal-tools.css`, `js/thermal-effects.js`) để giảm dung lượng bản build `dist/`.
   - Cập nhật `DESIGN.md` và `css/theme.css` đồng bộ với các token mới của đợt `1b`.

## PHẦN 4: KIỂM ĐỊNH CHẤT LƯỢNG TRƯỚC KHI HOÀN TẤT (VERIFICATION)

Sau khi hoàn thành, AI Agent chạy kiểm tra (nhớ tắt các tiến trình `node server.js` chạy nền sau khi test xong để không bị treo thông báo `1 task running` trên IDE):

```bash
# 1. Chạy toàn bộ Unit & Integration Tests
npm test

# 2. Chạy bản Build Production
npm run build
```

### Checklist Nghiệm Thu Đợt `1b` (Ghi vào `docs/handoff/PROGRESS-1B.md`):
- [ ] **Khung Hero Title (`#view-dashboard`)**: Chỉ còn đúng 1 khung `.hero-card` duy nhất (không còn khung lồng `.hero-heading-scrim` thứ 2 bên trong), viền khung `2px` rõ nét, chữ Quote dày dặn (`font-weight: 900` + `text-stroke`).
- [ ] **Chọn Emoji Môn học**: Có lưới 24 Emoji học tập trong cả 2 modal Tạo Môn Học & Quản Lý Môn Học, bấm chuột 1-click là chọn được ngay kèm Live Preview, không cần gõ phím.
- [ ] **Bảng màu Môn học & Bảng màu App**: Có lưới 12 ô màu tròn (Color Swatches) hợp vibe Tím-Hồng-Neon ngay trong modal (không bật hộp thoại RGB trắng xám của Windows), màu tổng thể của app hài hòa, dịu mắt.
- [ ] **Thẻ ở trang đầu tiên (`#view-dashboard`)**: Hiển thị rõ ràng **Badge Tên Môn Học + Icon + Màu nhận diện** trên từng thẻ (thay cho chữ `DECK` vô nghĩa) và có thanh lọc nhanh theo môn học.
- [ ] **Hiệu năng & Kiểm thử**: `renderDashboard()` nạp dữ liệu song song qua `Promise.all`, `initSpotlightHover()` không gây layout thrashing, không để thừa tiến trình `node server.js` treo nền, và `npm test` + `npm run build` đạt **100% PASS**.
