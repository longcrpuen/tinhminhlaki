# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1G — ĐỒNG BỘ HÓA KIẾN TRÚC COMPONENT TOKEN, FROSTED LIQUID GLASS POPUP, HIỆU ỨNG CON TRỎ KÍNH LƯỚI (GLASS TILE MATRIX), SMOKED GLASS CHO MODE TRẮNG CAM & XÓA SẠCH 100% EMOJI/MÀU TÍM CÒN SÓT (promt1g.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
> - **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> - **Phiên bản đặc tả:** `1g` (Nối tiếp sau `1a` -> `1f`)
> - **Mục tiêu cốt lõi:** Giải quyết triệt để **13 vấn đề giao diện, kiến trúc đồng bộ theme và tính năng** từ 8 ảnh chụp màn hình thực tế mới nhất (`image_a7ab5e.jpg` đến `image_a7203e.png`).
> - **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Tuyệt đối giữ nguyên dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`), `localStorage`, thuật toán SM-2 (`js/srs.js`) và bộ phân tích cú pháp (`js/parser.js`).
>   2. **Zero Unicode Emoji Policy:** Chạy script tự động quét và thay thế 100% ký tự emoji màu (`\p{Extended_Pictographic}`) trong cả `index.html` và `js/app.js` bằng SVG đơn sắc (`stroke="currentColor" fill="none"`).
>   3. **Unified Component Token Architecture:** Gom toàn bộ đặc điểm của mọi thành phần UI (Card, Modal, Dropdown, Scrollbar, Toast, Restore Banner, Bottom Nav, Badge) về một bộ biến chuẩn duy nhất trong `css/theme.css` để 3 theme tự động đồng bộ 100%.

---

## PHẦN 0: CHẨN ĐOÁN CHÍNH XÁC TỪNG LỖI TRONG CODE TỪ 8 ẢNH CHỤP MÀN HÌNH

Trước khi sửa code, AI Agent cần nắm rõ **vị trí dòng code gây ra từng lỗi** trong 8 ảnh người dùng gửi:

1. **Tại sao Dropdown bị mờ chữ khi chưa bấm & Thanh cuộn (Scrollbar) vẫn màu tím (`image_a7ab5e.jpg` — Mục 1.4 & 1.5)?**
   - Trong `css/style.css` dòng `5071`: `.cyber-dropdown-trigger` đang bị gán cứng `color: #e4e4e7 !important;` (màu chữ trắng xám của Dark Mode). Khi nền dropdown ở chế độ Trắng Cam đổi sang màu sáng, chữ `#e4e4e7` gần như tàng hình trên mọi tab!
   - Trong `css/style.css` dòng `5083–5084`: `.cyber-dropdown-trigger:hover, .cyber-dropdown.open .cyber-dropdown-trigger` gán cứng `border-color: rgba(139, 92, 246, 0.40) !important; box-shadow: 0 0 14px rgba(139, 92, 246, 0.25);` (viền tím!).
   - Trong `css/style.css` dòng `5126`: `.cyber-dropdown-menu` gán cứng `scrollbar-color: rgba(139, 92, 246, 0.35) transparent;` và dòng `5737`: `::-webkit-scrollbar-thumb` dùng `rgba(var(--accent-rgb, 167,139,250), 0.15)` -> Thanh cuộn trong dropdown và toàn app vẫn giữ màu tím!
2. **Tại sao Toast thông báo & Thanh báo "Phiên học đang làm dở" vẫn màu tím, kèm đầy Emoji màu (`image_a724d3.png` — Mục 1.1 & 1.2)?**
   - Trong `css/style.css` dòng `3426`: `.toast` gán cứng `background: #221e36; color: #ede9f6;` (tím đen).
   - Trong `css/style.css` dòng `5581`: `.restore-banner` (`#session-restore-banner` — hiện lên khi thoát giữa chừng bài test/ôn tập) gán cứng `background: #221e36; color: #ede9f6;` (tím đen) và trong `index.html` dòng `1964` có emoji `💾 Bạn có phiên học chưa hoàn tất trước đó.`.
   - Trong `js/app.js` dòng `5947–5950`: hàm `showToast()` gắn cứng emoji màu `ℹ️`, `✅`, `⚠️`, `❌` và các lệnh gọi `showToast` gắn thêm `🚩`, `⭐`, `🎯`, `🎉`, `🚀`.
   - Trên màn hình Quiz (`image_a724d3.png`), nút `#btn-quiz-blind-toggle` (`🧠 Đoán trước: Tắt`) và 4 nút góc phải thẻ câu hỏi (`⭐`, `🚩`, `✏️`, `🎯`) vẫn là ký tự emoji màu trong `index.html`!
3. **Tại sao Thanh điều hướng dưới cùng trên Mobile bị lỗi cục vuông màu cam (`image_a7203e.png` — Mục 1.3)?**
   - Trong `.bottom-nav-item.active svg`, một rule CSS đã gán `fill: var(--accent)` hoặc `background: var(--accent)` trực tiếp lên thẻ `<svg>` của nút `"Bộ thẻ"`, làm toàn bộ khung hình chữ nhật của icon bị đổ đặc màu cam!
   - Ngoài ra `.bottom-nav` ở dòng `3447`, `3530`, `5777` của `css/style.css` vẫn gán cứng `background: rgba(18, 19, 26, 0.95) !important;`.
4. **Tại sao các Popup bị lỗi thanh đáy màu đen/tím và danh sách bên trong bị lệch màu ở cả Trắng Cam & Trắng Đen (`image_a79fbd.jpg`, `image_a79fbb.jpg` — Mục 1.1, 1.7, 1.9)?**
   - Trong `css/style.css` dòng `3415`: `.modal-footer` gán cứng `background: rgba(22, 19, 36, 0.98);` -> Tạo ra một dải màu tím đen xấu xí ở đáy mọi popup!
   - Trong `index.html` dòng `1950`: `#bulk-reassign-deck-list` viết cứng inline `style="... background: rgba(19, 17, 34, 0.75); border: 1px solid rgba(139, 92, 246, 0.25);"` và dòng `1946` viết cứng `color: #a78bfa;`.
   - Trong `#modal-create-subject` (`image_a79fbd.jpg`), vẫn còn mục **"Màu nhận diện (Vibe Swatches)"** với 12 chấm tròn đủ màu và ô preview icon sách nhiều màu `📚` không có tác dụng thực tế vì toàn app đã đồng bộ theo theme.
   - Đặc biệt (Mục 1.9): Agent trước đó đã làm mờ nền `.modal-overlay` phía sau nhưng lại để khối `.modal-box` đặc quánh. Yêu cầu đúng của người dùng là **không làm mờ đục màn hình phía sau, mà chính khối `.modal-box` phải là tấm kính mờ trong suốt (Frosted / Liquid Glass) như ảnh 5 (`image_a79570.jpg`)**!

---

## PHẦN 1: GOM TOÀN BỘ ĐẶC ĐIỂM UI VÀO HỆ THỐNG BIẾN TRUNG TÂM (`css/theme.css`) — ĐỒNG BỘ 100% QUA 3 THEME (MỤC 1.8)

Mở `css/theme.css` và thiết lập kiến trúc **Component Token thống nhất**. Mọi thành phần trong `css/style.css` chỉ được phép tham chiếu các biến dưới đây, tuyệt đối không viết mã màu rời bên ngoài:

```css
/* ==========================================================================
   UNIFIED COMPONENT TOKEN SYSTEM — PHASE 1G (SINGLE SOURCE OF TRUTH)
   ========================================================================== */

:root,
html[data-theme="purple-pink"] {
  /* 1. Surfaces & Smoked/Frosted Glass Cards */
  --bg-base: #0d0b14;
  --card-glass-bg: rgba(24, 19, 40, 0.62);
  --card-glass-hover-bg: rgba(38, 30, 62, 0.42);
  --card-glass-border: rgba(255, 255, 255, 0.12);
  --card-glass-hover-border: rgba(192, 132, 252, 0.55);
  --card-glass-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.55);
  --card-inner-specular: inset 0 1px 1px rgba(255, 255, 255, 0.18);

  /* 2. Frosted Liquid Glass Modal Block (Image 5 Reference) */
  --modal-backdrop-dim: rgba(6, 5, 12, 0.35); /* Không blur nặng nền sau, chỉ dim nhẹ */
  --modal-glass-bg: rgba(26, 20, 44, 0.58);
  --modal-glass-border: rgba(255, 255, 255, 0.22);
  --modal-glass-shadow: 0 28px 64px -12px rgba(0, 0, 0, 0.65),
                        inset 0 1px 1px rgba(255, 255, 255, 0.28),
                        inset 0 -1px 1px rgba(255, 255, 255, 0.08);
  --modal-inner-box-bg: rgba(255, 255, 255, 0.06);
  --modal-inner-box-border: rgba(255, 255, 255, 0.14);

  /* 3. Typography */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-on-card: #f8fafc;
  --text-on-card-sub: #cbd5e1;

  /* 4. Accents & Buttons */
  --accent: #c084fc;
  --accent-strong: #a855f7;
  --accent-soft: rgba(192, 132, 252, 0.16);
  --accent-border: rgba(192, 132, 252, 0.42);
  --accent-glow: rgba(192, 132, 252, 0.26);
  --btn-primary-bg: #c084fc;
  --btn-primary-text: #0d0b14;
  --btn-primary-hover-bg: #d8b4fe;
  --btn-secondary-bg: rgba(255, 255, 255, 0.08);
  --btn-secondary-text: #f8fafc;
  --btn-secondary-border: rgba(255, 255, 255, 0.16);
  --btn-secondary-hover-bg: rgba(192, 132, 252, 0.20);
  --btn-secondary-hover-border: rgba(192, 132, 252, 0.50);

  /* 5. Dropdowns & Scrollbars */
  --dropdown-bg: rgba(24, 19, 40, 0.88);
  --dropdown-text: #f8fafc;
  --dropdown-border: rgba(255, 255, 255, 0.16);
  --dropdown-menu-bg: rgba(20, 16, 34, 0.94);
  --dropdown-item-hover-bg: rgba(192, 132, 252, 0.18);
  --dropdown-item-active-bg: #c084fc;
  --dropdown-item-active-text: #0d0b14;
  --scrollbar-thumb: rgba(192, 132, 252, 0.38);
  --scrollbar-thumb-hover: rgba(192, 132, 252, 0.65);

  /* 6. Toast, Session Restore Banner & Mobile Bottom Nav */
  --status-glass-bg: rgba(26, 20, 44, 0.82);
  --status-glass-border: rgba(192, 132, 252, 0.42);
  --status-glass-text: #f8fafc;
  --bottom-nav-bg: rgba(22, 18, 38, 0.78);
  --bottom-nav-border: rgba(255, 255, 255, 0.14);

  /* 7. Interactive Glass Tile Matrix (Hero Quote Hover Effect) */
  --matrix-glow-color: rgba(192, 132, 252, 0.55);
  --matrix-glow-secondary: rgba(244, 114, 182, 0.40);
}

/* ==========================================================================
   MODE 2: TRẮNG ĐEN (MONOCHROME) — 100% TRẮNG, XÁM BẠC & ĐEN TUYỀN
   ========================================================================== */
html[data-theme="monochrome"] {
  --bg-base: #09090b;
  --card-glass-bg: rgba(24, 24, 28, 0.64);
  --card-glass-hover-bg: rgba(38, 38, 44, 0.44);
  --card-glass-border: rgba(255, 255, 255, 0.14);
  --card-glass-hover-border: rgba(255, 255, 255, 0.55);
  --card-glass-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.75);
  --card-inner-specular: inset 0 1px 1px rgba(255, 255, 255, 0.22);

  /* Frosted Liquid Glass Modal in Monochrome */
  --modal-backdrop-dim: rgba(0, 0, 0, 0.40);
  --modal-glass-bg: rgba(24, 24, 28, 0.56);
  --modal-glass-border: rgba(255, 255, 255, 0.26);
  --modal-glass-shadow: 0 28px 64px -12px rgba(0, 0, 0, 0.80),
                        inset 0 1px 1px rgba(255, 255, 255, 0.32),
                        inset 0 -1px 1px rgba(255, 255, 255, 0.10);
  --modal-inner-box-bg: rgba(255, 255, 255, 0.06);
  --modal-inner-box-border: rgba(255, 255, 255, 0.16);

  --text-primary: #ffffff;
  --text-secondary: #d4d4d8;
  --text-muted: #a1a1aa;
  --text-on-card: #ffffff;
  --text-on-card-sub: #d4d4d8;

  --accent: #ffffff;
  --accent-strong: #e4e4e7;
  --accent-soft: rgba(255, 255, 255, 0.14);
  --accent-border: rgba(255, 255, 255, 0.40);
  --accent-glow: rgba(255, 255, 255, 0.18);
  --btn-primary-bg: #ffffff;
  --btn-primary-text: #09090b;
  --btn-primary-hover-bg: #e4e4e7;
  --btn-secondary-bg: rgba(255, 255, 255, 0.08);
  --btn-secondary-text: #ffffff;
  --btn-secondary-border: rgba(255, 255, 255, 0.20);
  --btn-secondary-hover-bg: rgba(255, 255, 255, 0.18);
  --btn-secondary-hover-border: rgba(255, 255, 255, 0.55);

  --dropdown-bg: rgba(24, 24, 28, 0.90);
  --dropdown-text: #ffffff;
  --dropdown-border: rgba(255, 255, 255, 0.22);
  --dropdown-menu-bg: rgba(18, 18, 22, 0.94);
  --dropdown-item-hover-bg: rgba(255, 255, 255, 0.14);
  --dropdown-item-active-bg: #ffffff;
  --dropdown-item-active-text: #09090b;
  --scrollbar-thumb: rgba(255, 255, 255, 0.35);
  --scrollbar-thumb-hover: rgba(255, 255, 255, 0.65);

  --status-glass-bg: rgba(24, 24, 28, 0.84);
  --status-glass-border: rgba(255, 255, 255, 0.35);
  --status-glass-text: #ffffff;
  --bottom-nav-bg: rgba(20, 20, 24, 0.80);
  --bottom-nav-border: rgba(255, 255, 255, 0.18);

  --matrix-glow-color: rgba(255, 255, 255, 0.48);
  --matrix-glow-secondary: rgba(212, 212, 216, 0.30);
}

/* ==========================================================================
   MODE 3: TRẮNG CAM (WHITE-ORANGE) — SMOKED FROSTED GLASS CARDS & LIQUID POPUP
   ========================================================================== */
html[data-theme="white-orange"] {
  --bg-base: #fff7ed;

  /* Mục 2.2 & 2.3: Các ô 4 thống kê, chế độ học, thẻ bộ câu hỏi ở trạng thái đầu
     là kính mờ tối (Smoked Warm Glass), khi trỏ vào thì trong suốt hơn 1 chút + ánh cam */
  --card-glass-bg: rgba(34, 27, 22, 0.72);
  --card-glass-hover-bg: rgba(48, 36, 28, 0.52);
  --card-glass-border: rgba(255, 255, 255, 0.24);
  --card-glass-hover-border: #fb923c;
  --card-glass-shadow: 0 14px 34px -8px rgba(28, 25, 23, 0.28);
  --card-inner-specular: inset 0 1px 1px rgba(255, 255, 255, 0.32);

  /* Chữ bên trong các thẻ Smoked Glass luôn sáng rõ */
  --text-on-card: #fff7ed;
  --text-on-card-sub: #fed7aa;

  /* Mục 1.9: Khối Popup là Frosted Liquid Glass trong trẻo (như ảnh 5) */
  --modal-backdrop-dim: rgba(28, 25, 23, 0.22);
  --modal-glass-bg: rgba(255, 250, 245, 0.62);
  --modal-glass-border: rgba(255, 255, 255, 0.68);
  --modal-glass-shadow: 0 28px 64px -12px rgba(124, 45, 18, 0.22),
                        inset 0 1px 2px rgba(255, 255, 255, 0.85),
                        inset 0 -1px 1px rgba(234, 88, 12, 0.14);
  --modal-inner-box-bg: rgba(255, 255, 255, 0.48);
  --modal-inner-box-border: rgba(234, 88, 12, 0.24);

  /* Chữ trên nền sáng chính của trang */
  --text-primary: #1c1917;
  --text-secondary: #44403c;
  --text-muted: #78716c;

  --accent: #ea580c;
  --accent-strong: #c2410c;
  --accent-soft: rgba(234, 88, 12, 0.14);
  --accent-border: rgba(234, 88, 12, 0.42);
  --accent-glow: rgba(234, 88, 12, 0.24);
  --btn-primary-bg: #ea580c;
  --btn-primary-text: #ffffff;
  --btn-primary-hover-bg: #f97316;
  --btn-secondary-bg: rgba(255, 255, 255, 0.72);
  --btn-secondary-text: #1c1917;
  --btn-secondary-border: rgba(234, 88, 12, 0.28);
  --btn-secondary-hover-bg: #ffedd5;
  --btn-secondary-hover-border: #ea580c;

  /* Mục 1.4 & 1.5: Dropdown chữ đậm rõ nét (#1c1917) khi chưa bấm, thanh cuộn màu cam */
  --dropdown-bg: rgba(255, 255, 255, 0.88);
  --dropdown-text: #1c1917;
  --dropdown-border: rgba(234, 88, 12, 0.32);
  --dropdown-menu-bg: rgba(255, 252, 248, 0.95);
  --dropdown-item-hover-bg: rgba(234, 88, 12, 0.12);
  --dropdown-item-active-bg: #ea580c;
  --dropdown-item-active-text: #ffffff;
  --scrollbar-thumb: rgba(234, 88, 12, 0.42);
  --scrollbar-thumb-hover: rgba(234, 88, 12, 0.72);

  /* Mục 1.2 & 1.3: Toast, Session Restore Banner & Mobile Bottom Nav đồng bộ Trắng Cam */
  --status-glass-bg: rgba(255, 250, 245, 0.88);
  --status-glass-border: rgba(234, 88, 12, 0.45);
  --status-glass-text: #1c1917;
  --bottom-nav-bg: rgba(255, 250, 245, 0.84);
  --bottom-nav-border: rgba(234, 88, 12, 0.24);

  /* Mục 1.10: Ánh sáng cam rực rỡ dưới các ô kính Hero */
  --matrix-glow-color: rgba(249, 115, 22, 0.62);
  --matrix-glow-secondary: rgba(251, 191, 36, 0.45);
}
```

---

## PHẦN 2: GIẢI QUYẾT TRIỆT ĐỂ 10 YÊU CẦU NHÓM 1 (`1. CHUNG`)

### Mục 1.1: Quét sạch 100% Emoji màu trong toàn bộ App & Bỏ hẳn phần chọn "Màu nhận diện (Vibe Swatches)" vô tác dụng
1. **Xóa bỏ hoàn toàn mục chọn "Màu nhận diện (Vibe Swatches)" và ô nhập Emoji trong `#modal-create-subject` và `#modal-manage-subject` (`image_a79fbd.jpg`):**
   - Trong `index.html` (khu vực `#modal-create-subject` và `#modal-manage-subject`) và `js/app.js` (`openCreateSubjectModal`, `openManageSubjectModal`):
     - **Xóa hẳn** khối `Màu nhận diện (Vibe Swatches):` (12 nút tròn màu sắc / `<input type="color">`) và **xóa hẳn** ô preview emoji `📚` góc phải cùng khung `Xem trước nhãn:` nền xám đen.
     - Trong `#modal-create-subject` và `#modal-manage-subject`, chỉ giữ lại:
       1. Ô nhập **Tên môn học** (`#create-subject-name` / `#manage-subject-name`).
       2. Lưới **20 nút biểu tượng SVG đơn sắc (`stroke="currentColor" fill="none"`)** có nền kính mờ đồng bộ theo theme (`background: var(--modal-inner-box-bg)`, khi chọn `.active` thì `background: var(--btn-primary-bg); color: var(--btn-primary-text)`).
2. **Xóa sạch 100% Emoji còn sót ở Tab Ngân hàng câu hỏi (`image_a7ab5e.jpg`), Màn hình Quiz (`image_a724d3.png`), và các Popup (`index.html` & `js/app.js`):**
   - Trong `#view-bank` (`image_a7ab5e.jpg`):
     - Xóa emoji `⭐` và `🚩` trong dòng mô tả phụ `Duyệt nhanh theo Môn học, lọc theo chủ đề/độ khó hoặc lọc riêng câu Bookmark và câu Diễn đạt chưa rõ.`.
     - Trong placeholder của `#bank-search-input`: đổi `"🔍 Tìm kiếm câu hỏi, đáp án, giải thích..."` thành `"Tìm kiếm câu hỏi, đáp án, giải thích..."` (không chèn emoji kính lúp màu xanh vào placeholder).
     - Nút `#bank-filter-review` (`⚠️ Cần kiểm tra ( 0 )`): thay `⚠️` bằng SVG tam giác cảnh báo đơn sắc `stroke="currentColor"`.
     - Trên từng thẻ câu hỏi trong Ngân hàng câu hỏi (`renderQuestionBank` trong `js/app.js`): thay các icon `🏷️` (chủ đề), `📁` (bộ thẻ), `⏰` (cần ôn hôm nay), `💡` (`Giải thích:`), và nút `✏️` (sửa câu hỏi) bằng SVG đơn sắc `stroke="currentColor"`.
   - Trong màn hình Quiz / Chế độ đoán trước (`image_a724d3.png`):
     - Nút `#btn-quiz-blind-toggle` (`🧠 Đoán trước: Tắt`): thay `🧠` bằng SVG đơn sắc `stroke="currentColor"`.
     - 4 nút công cụ góc trên bên phải thẻ câu hỏi (`#btn-quiz-bookmark`, `#btn-quiz-flag`, `#btn-quiz-edit`, `#btn-quiz-focus`): thay toàn bộ `⭐`, `🚩`, `✏️`, `🎯` bằng 4 icon SVG đơn sắc (`star`, `flag`, `edit-3`, `crosshair`) dùng `stroke="currentColor" fill="none"`. Khi nút ở trạng thái `.active` (đã lưu hoặc đã gắn cờ), đổi `color: var(--accent); border-color: var(--accent-border); background: var(--accent-soft);`.
   - Trong tất cả các Modal (`#modal-exam-setup`, `#modal-topic-picker`, `#modal-sprint-setup`, `#modal-session-complete`, `#modal-edit-card`, `#modal-create-subject`, `#modal-manage-subject`, `#modal-bulk-reassign-decks`):
     - Thay toàn bộ các emoji trong tiêu đề và nút bấm (`⏱️`, `🚀`, `🎯`, `⚡`, `📚`, `🔥`, `✨`, `📊`, `✏️`, `🎴`, `🟢`, `🟡`, `🔴`, `👁️`, `💾`, `➕`, `⚙️`, `🔀`, `🗑️`) bằng SVG đơn sắc hoặc chữ thuần.

### Mục 1.2: Đồng bộ Màu Trạng Thái Toast Thông Báo & Thanh Báo "Đang Làm Dở" (`#session-restore-banner`) theo từng Theme (`image_a724d3.png`)
- **Hiện trạng lỗi (`image_a724d3.png`):**
  - Khi bấm Lưu câu hỏi, Gắn cờ, hoặc khi đang làm dở bài test rồi thoát ra ngoài (hiện thanh `#session-restore-banner` `"Bạn có phiên học chưa hoàn tất trước đó"`), cả `.toast` lẫn `.restore-banner` đều bị viết cứng `background: #221e36; color: #ede9f6;` (màu tím đen) trong `css/style.css` dòng `3426` và `5584`.
- **Cách sửa bắt buộc:**
  1. Trong `css/style.css` (dòng `3420–3441` và `5580–5592`), thay thế hoàn toàn bằng biến `--status-glass-*`:
     ```css
     .toast,
     .restore-banner,
     #session-restore-banner {
       background: var(--status-glass-bg) !important;
       color: var(--status-glass-text) !important;
       border: 1px solid var(--status-glass-border) !important;
       backdrop-filter: blur(24px) saturate(160%) !important;
       -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
       box-shadow: var(--card-glass-shadow), var(--card-inner-specular) !important;
       border-radius: 999px !important;
     }
     ```
  2. Trong `js/app.js` (hàm `showToast` dòng `5935`):
     - Xóa sạch 4 emoji `ℹ️`, `✅`, `⚠️`, `❌` và xóa mọi emoji ở cuối chuỗi truyền vào `showToast(...)`.
     - Thay bằng 4 icon SVG đơn sắc (`stroke="currentColor" fill="none"`) kế thừa màu `var(--accent)` hoặc `var(--status-glass-text)`.
  3. Trong `index.html` (dòng `1964` — `#session-restore-banner`):
     - Đổi `💾 Bạn có phiên học chưa hoàn tất trước đó.` thành icon SVG đồng hồ/khôi phục đơn sắc + `Bạn có phiên học chưa hoàn tất trước đó.`.

### Mục 1.3: Sửa lỗi Thanh Điều Hướng Dưới Cùng trên Mobile (`.bottom-nav`) bị cục vuông màu cam (`image_a7203e.png`) & Đồng bộ Mobile toàn diện
- **Hiện trạng lỗi (`image_a7203e.png`):**
  Icon `"Bộ thẻ"` trong `.bottom-nav-item.active` bị tô đặc kín thành một hình vuông màu cam chỉ còn 1 chấm nhỏ ở giữa! Nguyên nhân là CSS đang gán `fill: var(--accent)` hoặc `background: var(--accent)` lên thẻ `<svg>` hoặc `<rect>` bên trong `.bottom-nav-item.active`.
- **Cách sửa bắt buộc trong `css/style.css` và `css/theme.css`:**
  ```css
  .bottom-nav {
    background: var(--bottom-nav-bg) !important;
    backdrop-filter: blur(24px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    border: 1px solid var(--bottom-nav-border) !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22), var(--card-inner-specular) !important;
  }

  /* Tuyệt đối cấm tô đặc fill hoặc background lên SVG icon của Bottom Nav */
  .bottom-nav-item svg,
  .bottom-nav-item.active svg,
  .bottom-nav-item svg *,
  .bottom-nav-item.active svg * {
    fill: none !important;
    background: transparent !important;
    stroke: currentColor !important;
    stroke-width: 2px !important;
  }

  .bottom-nav-item {
    color: var(--text-secondary) !important;
    border-radius: 999px !important;
    transition: background-color 0.2s ease, color 0.2s ease !important;
  }

  .bottom-nav-item.active {
    background: var(--accent-soft) !important;
    color: var(--accent) !important;
    font-weight: 700 !important;
  }
  html[data-theme="white-orange"] .bottom-nav-item.active {
    background: rgba(234, 88, 12, 0.16) !important;
    color: #ea580c !important;
  }
  ```

### Mục 1.4 & 1.5: Sửa dứt điểm Chữ Dropdown bị mờ nhạt khi chưa bấm & Thanh cuộn (Scrollbar) màu tím (`image_a7ab5e.jpg`)
- **Cách sửa bắt buộc trong `css/style.css` (dòng `5062–5170` và `5735–5738`):**
  1. Trên `.cyber-dropdown-trigger` và `.cyber-dropdown-label`:
     ```css
     .cyber-dropdown-trigger {
       background: var(--dropdown-bg) !important;
       color: var(--dropdown-text) !important;
       border: 1px solid var(--dropdown-border) !important;
       backdrop-filter: blur(16px) !important;
       -webkit-backdrop-filter: blur(16px) !important;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
     }

     .cyber-dropdown-trigger .cyber-dropdown-label,
     .cyber-dropdown-trigger .cyber-dropdown-icon {
       color: var(--dropdown-text) !important;
       opacity: 1 !important;
       font-weight: 600 !important;
     }

     .cyber-dropdown-trigger .cyber-dropdown-chevron {
       color: var(--dropdown-text) !important;
       opacity: 0.75 !important;
     }

     .cyber-dropdown-trigger:hover,
     .cyber-dropdown.open .cyber-dropdown-trigger {
       border-color: var(--accent) !important;
       box-shadow: 0 0 0 3px var(--accent-soft) !important;
     }

     .cyber-dropdown.open .cyber-dropdown-chevron {
       color: var(--accent) !important;
       transform: rotate(180deg);
     }
     ```
  2. Trên `.cyber-dropdown-menu` và toàn bộ Scrollbar trong app:
     ```css
     .cyber-dropdown-menu,
     .bulk-deck-list,
     .modal-body {
       scrollbar-width: thin !important;
       scrollbar-color: var(--scrollbar-thumb) transparent !important;
     }

     ::-webkit-scrollbar {
       width: 6px !important;
       height: 6px !important;
     }
     ::-webkit-scrollbar-track {
       background: transparent !important;
     }
     ::-webkit-scrollbar-thumb {
       background: var(--scrollbar-thumb) !important;
       border-radius: 999px !important;
     }
     ::-webkit-scrollbar-thumb:hover {
       background: var(--scrollbar-thumb-hover) !important;
     }
     ```

### Mục 1.6: Khôi phục 100% Chế độ 5 ("5. Ôn theo môn học & chương") — Bấm vào mở ngay, lọc theo Môn & Chương mượt mà
- **Nguyên nhân lỗi:** Thẻ Chế độ 5 hoặc hàm `openTopicPickerModal` / `startTopicReview` bị lệch cấu trúc DOM hoặc lỗi truyền chuỗi có ký tự đặc biệt trong inline `onclick`.
- **Cách sửa bắt buộc trong `index.html` và `js/app.js`:**
  1. Trong `index.html`, đảm bảo thẻ số 5 ở cả `#view-dashboard` và `#view-decks` có `onclick="App.openTopicPickerModal()"` và cấu trúc `#modal-topic-picker` chuẩn xác như sau:
     ```html
     <!-- MODAL: Topic & Subject Picker for Mode 5 -->
     <div id="modal-topic-picker" class="modal-overlay">
       <div class="modal-box" style="max-width: 580px;">
         <div class="modal-header">
           <h3 class="modal-title">5. Ôn Theo Môn Học & Chương</h3>
           <button type="button" class="icon-btn modal-close" onclick="App._closeModal('modal-topic-picker')" style="width: 32px; height: 32px;">✕</button>
         </div>
         <div class="modal-body">
           <div class="form-group" style="margin-bottom: 14px;">
             <label class="form-label" style="font-weight: 600; margin-bottom: 8px; display: block;">1. Lọc theo Môn học:</label>
             <div id="topic-picker-subjects" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
           </div>
           <div class="form-group" style="margin-bottom: 0;">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
               <label class="form-label" style="font-weight: 600; margin: 0;">2. Chọn Chương / Chủ đề cần ôn:</label>
               <button type="button" class="btn btn-secondary" style="padding: 4px 12px; font-size: 0.78rem;" onclick="App.toggleAllTopicsInPicker()">Chọn tất cả</button>
             </div>
             <div id="topic-picker-chips" class="topic-chips-container" style="max-height: 280px; overflow-y: auto; padding: 4px;"></div>
           </div>
         </div>
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary modal-close" onclick="App._closeModal('modal-topic-picker')">Hủy</button>
           <button type="button" class="btn btn-primary" onclick="App.startTopicReview()">Bắt đầu ôn tập</button>
         </div>
       </div>
     </div>
     ```
  2. Trong `js/app.js`, thay thế hoàn toàn cụm hàm `openTopicPickerModal`, `toggleTopicSelection`, và `startTopicReview` bằng phiên bản chống lỗi 100% (dùng `dataset.topic` thay vì nối chuỗi inline `onclick`):
     ```javascript
     selectedSubjectForTopicPicker: 'all',
     selectedTopicsForReview: new Set(),

     async openTopicPickerModal(deckId = null) {
       this.currentDeckIdForTopic = deckId || null;
       this.selectedSubjectForTopicPicker = 'all';
       this.selectedTopicsForReview = new Set();

       await this.renderTopicPickerModalContent();
       const modal = document.getElementById('modal-topic-picker');
       if (modal) {
         this._showModal(modal);
       }
     },

     async renderTopicPickerModalContent() {
       const subjContainer = document.getElementById('topic-picker-subjects');
       const chipsContainer = document.getElementById('topic-picker-chips');
       if (!chipsContainer) return;

       const subjects = await db.getAllSubjects();
       if (subjContainer) {
         const allBtn = `<button type="button" class="subject-filter-pill ${this.selectedSubjectForTopicPicker === 'all' ? 'active' : ''}" data-subj-id="all">Tất cả môn</button>`;
         const subjBtns = subjects.map(s => `
           <button type="button" class="subject-filter-pill ${String(this.selectedSubjectForTopicPicker) === String(s.id) ? 'active' : ''}" data-subj-id="${this._escapeHtml(String(s.id))}">
             ${this._escapeHtml(s.name)}
           </button>
         `).join('');
         subjContainer.innerHTML = allBtn + subjBtns;

         subjContainer.querySelectorAll('button[data-subj-id]').forEach(btn => {
           btn.onclick = async () => {
             this.selectedSubjectForTopicPicker = btn.getAttribute('data-subj-id');
             this.selectedTopicsForReview.clear();
             await this.renderTopicPickerModalContent();
           };
         });
       }

       const subjectFilter = this.selectedSubjectForTopicPicker === 'all' ? null : this.selectedSubjectForTopicPicker;
       const topics = await db.getAllTopics(this.currentDeckIdForTopic, subjectFilter);

       if (!topics || topics.length === 0) {
         chipsContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 12px 4px;">Chưa có chương/chủ đề nào trong mục này.</p>';
         return;
       }

       chipsContainer.innerHTML = topics.map(t => {
         const isSelected = this.selectedTopicsForReview.has(t.topic);
         return `
           <button type="button" class="topic-chip ${isSelected ? 'selected' : ''}" data-topic-val="${this._escapeHtml(t.topic)}">
             <span class="topic-chip-name">${this._escapeHtml(t.topic)}</span>
             <span class="topic-chip-count">${t.count} câu</span>
           </button>
         `;
       }).join('');

       chipsContainer.querySelectorAll('.topic-chip').forEach(chip => {
         chip.onclick = () => {
           const val = chip.getAttribute('data-topic-val');
           if (!val) return;
           if (this.selectedTopicsForReview.has(val)) {
             this.selectedTopicsForReview.delete(val);
             chip.classList.remove('selected');
           } else {
             this.selectedTopicsForReview.add(val);
             chip.classList.add('selected');
           }
         };
       });
     },

     async toggleAllTopicsInPicker() {
       const chips = Array.from(document.querySelectorAll('#topic-picker-chips .topic-chip'));
       if (chips.length === 0) return;
       const allSelected = chips.every(c => c.classList.contains('selected'));
       chips.forEach(c => {
         const val = c.getAttribute('data-topic-val');
         if (!val) return;
         if (allSelected) {
           this.selectedTopicsForReview.delete(val);
           c.classList.remove('selected');
         } else {
           this.selectedTopicsForReview.add(val);
           c.classList.add('selected');
         }
       });
     },

     async startTopicReview() {
       let topics = Array.from(this.selectedTopicsForReview);
       // Nếu người dùng đã chọn 1 môn cụ thể mà chưa tích chọn từng chương, tự động lấy toàn bộ chương của môn đó
       if (topics.length === 0 && this.selectedSubjectForTopicPicker !== 'all') {
         const allSubjTopics = await db.getAllTopics(this.currentDeckIdForTopic, this.selectedSubjectForTopicPicker);
         topics = allSubjTopics.map(t => t.topic);
       }
       if (topics.length === 0) {
         this.showToast('Vui lòng chọn ít nhất 1 chương hoặc 1 môn học để bắt đầu', 'warning');
         return;
       }
       const modal = document.getElementById('modal-topic-picker');
       if (modal) this._closeModal(modal);
       const subjectId = this.selectedSubjectForTopicPicker === 'all' ? null : this.selectedSubjectForTopicPicker;
       await this.startSession(this.currentDeckIdForTopic, 'topic', { topics, subjectId });
     },
     ```
  3. Trong `db.getCardsByTopics(topics = [], deckId = null, subjectId = null)` (`js/db.js` dòng `792`), hỗ trợ thêm tham số `subjectId`:
     ```javascript
     async getCardsByTopics(topics = [], deckId = null, subjectId = null) {
       let all;
       if (deckId) {
         all = await this.getCardsByDeck(deckId);
       } else if (subjectId) {
         all = await this.getCardsBySubject(subjectId);
       } else {
         all = await this.getAllCards();
       }
       const selectedSet = new Set(topics.map(t => t.trim().toLowerCase()));
       return all.filter(c => {
         const cardTopic = (c.topic || c.tag || 'Chung').trim().toLowerCase();
         return selectedSet.has(cardTopic);
       });
     }
     ```
     Và tại `js/app.js` dòng `1728`: gọi `cards = await db.getCardsByTopics(topics, deckId, options.subjectId);`.

### Mục 1.7 & 1.9: Thiết kế lại toàn bộ Popup (`.modal-box`) sang chuẩn Frosted Liquid Glass như Ảnh 5 (`image_a79570.jpg`) — Xóa sạch thanh đáy đen/tím (`.modal-footer`)
- **Hiện trạng lỗi (`image_a79fbd.jpg`, `image_a79fbb.jpg` vs `image_a79570.jpg`):**
  1. Người dùng yêu cầu rõ: **"về phần popup, t không phải muốn là blur bg, mà là cả cái block popup đó là blur, một chút liquid glass, như ảnh 5 (`image_a79570.jpg`)"**.
  2. Hiện tại `.modal-footer` (dòng 3415 `css/style.css`) bị gán cứng `background: rgba(22, 19, 36, 0.98)` và `#bulk-reassign-deck-list` (dòng 1950 `index.html`) bị gán cứng `background: rgba(19, 17, 34, 0.75)`, làm xuất hiện các mảng đen/tím xấu xí bên trong popup ở cả chế độ Trắng Cam và Trắng Đen!
- **Cách sửa bắt buộc:**
  1. Trong `index.html` (dòng `1867–1955`), xóa toàn bộ inline `background: rgba(19, 17, 34, 0.75)`, `border: 1px solid rgba(139, 92, 246, 0.25)`, `color: #a78bfa` trên `#bulk-reassign-deck-list`, `#bulk-reassign-count` và `#modal-manage-subject`.
  2. Trong `css/style.css` và `css/theme.css`, áp dụng kiến trúc **Frosted Liquid Glass Block** cho toàn bộ `.modal-overlay` và `.modal-box`:
     ```css
     /* 1. Lớp phủ màn hình phía sau (.modal-overlay): KHÔNG BLUR, chỉ làm dịu sáng nhẹ để các vật thể phía sau khúc xạ xuyên qua tấm kính .modal-box */
     .modal-overlay {
       background: var(--modal-backdrop-dim) !important;
       backdrop-filter: none !important;
       -webkit-backdrop-filter: none !important;
     }

     /* 2. Bản thân khối Popup (.modal-box) là một tấm kính mờ Frosted Liquid Glass (như ảnh 5) */
     .modal-box {
       background: var(--modal-glass-bg) !important;
       backdrop-filter: blur(28px) saturate(180%) !important;
       -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
       border: 1px solid var(--modal-glass-border) !important;
       box-shadow: var(--modal-glass-shadow) !important;
       border-radius: 28px !important;
       color: var(--text-primary) !important;
       overflow: hidden !important;
     }

     /* 3. Xóa sạch nền đen/tím của .modal-header, .modal-body, .modal-footer để cả khối popup liền mạch 1 tấm kính */
     .modal-header,
     .modal-body,
     .modal-footer {
       background: transparent !important;
       border-color: var(--modal-inner-box-border) !important;
     }

     /* 4. Các khung danh sách bên trong Popup (như #bulk-reassign-deck-list, .topic-chips-container) dùng kính mờ đồng bộ */
     #bulk-reassign-deck-list,
     .bulk-deck-list,
     #topic-picker-chips,
     .subject-icon-picker-grid button {
       background: var(--modal-inner-box-bg) !important;
       border: 1px solid var(--modal-inner-box-border) !important;
       color: var(--text-primary) !important;
     }

     #bulk-reassign-count {
       color: var(--accent) !important;
       font-weight: 600 !important;
     }
     ```

### Mục 1.10: Hiệu ứng Con Trỏ Kính Lưới (Interactive Glass Tile Matrix) tại Khung Quote Trang Đầu Tiên (`image_a79513.jpg`)
- **Mô tả hiệu ứng (`image_a79513.jpg`):**
  Khi di chuyển con trỏ chuột bên trong khung kính Quote truyền cảm hứng ở Trang chủ (`.hero-inspiration-stage` / `.hero-quote-container`), bề mặt kính hiển thị một lưới các **ô kính vuông bo góc (`border-radius: 16px`)** với viền khúc xạ 3D (`inset 2px 2px 4px rgba(255,255,255,0.35), inset -2px -2px 4px rgba(0,0,0,0.08)`), bên dưới là vầng sáng màu chủ đạo của theme (`--matrix-glow-color`) di chuyển mượt mà theo tọa độ con trỏ chuột `(mx, my)` và tỏa sáng xuyên qua các ô kính lân cận đúng như ảnh 6 (`image_a79513.jpg`).
- **Cách cài đặt tối ưu 140+ FPS (Chỉ áp dụng cho khung Quote ở Trang chủ `#view-dashboard`):**
  1. Trong `index.html`, bên trong `.hero-inspiration-stage` (ngay dưới lớp nền của khung Quote, trước nội dung chữ Quote), chèn lớp:
     ```html
     <div class="hero-glass-matrix-layer" id="hero-glass-matrix" aria-hidden="true"></div>
     ```
  2. Trong `js/app.js`, viết hàm khởi tạo `initHeroGlassMatrix()`:
     - Tạo lưới các ô `.glass-matrix-cell` (ví dụ lưới tự động co giãn `grid-template-columns: repeat(auto-fill, minmax(64px, 1fr))`) bên trong `#hero-glass-matrix`.
     - Khi chuột di chuyển trong `.hero-inspiration-stage`, dùng `requestAnimationFrame` cập nhật 2 biến CSS `--mx` và `--my` (tọa độ tương đối `px` trong khung Quote) và bật class `.is-hovering`.
  3. Trong `css/theme.css`:
     ```css
     .hero-inspiration-stage {
       position: relative;
       overflow: hidden;
     }

     .hero-glass-matrix-layer {
       position: absolute;
       inset: 0;
       z-index: 0;
       pointer-events: none;
       display: grid;
       grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
       grid-auto-rows: 68px;
       gap: 6px;
       padding: 16px;
       opacity: 0;
       transition: opacity 0.35s ease;
       /* Vầng sáng theo con trỏ nằm ngay dưới các ô kính */
       background:
         radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), var(--matrix-glow-color), var(--matrix-glow-secondary) 45%, transparent 75%);
       /* Chỉ hiện rõ vùng lưới kính xung quanh con trỏ chuột (bán kính 320px) để vừa sang trọng như ảnh 6 vừa siêu nhẹ GPU */
       -webkit-mask-image: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), #000 0%, rgba(0,0,0,0.65) 55%, transparent 100%);
       mask-image: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), #000 0%, rgba(0,0,0,0.65) 55%, transparent 100%);
     }

     .hero-inspiration-stage:hover .hero-glass-matrix-layer {
       opacity: 1;
     }

     .glass-matrix-cell {
       border-radius: 14px;
       background: rgba(255, 255, 255, 0.06);
       border: 1px solid rgba(255, 255, 255, 0.22);
       box-shadow:
         inset 2px 2px 5px rgba(255, 255, 255, 0.32),
         inset -2px -2px 5px rgba(0, 0, 0, 0.12);
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
     }
     ```
     *Ưu điểm kỹ thuật:* Nhờ dùng `mask-image` kết hợp `radial-gradient` theo `--mx, --my` trên GPU, trình duyệt không phải tính toán khoảng cách JS trên từng ô vuông mỗi frame, đảm bảo hiệu ứng **giống hệt ảnh 6 (`image_a79513.jpg`)** và giữ nguyên **140+ FPS**!

---

## PHẦN 3: GIẢI QUYẾT TRIỆT ĐỂ 3 YÊU CẦU NHÓM 2 (`2. MODE TRẮNG CAM`)

### Mục 2.1: Sửa Font Chữ Đen trong Quote của Mode Trắng Cam — Đứng Thẳng (`font-style: normal`), Có Chân Phẳng, Không Cong Móc (`image_a7a79c.jpg`)
- **Hiện trạng lỗi (`image_a7a79c.jpg`):**
  Trong `image_a7a79c.jpg`, phần chữ đen (`DON'T ASK THE` ... `YOUR FARTS`) đang bị nghiêng (`italic`) và có các đầu móc tròn cong vút ở chữ `T`, `K`, `S`, `R`.
- **Yêu cầu của người dùng:**
  - Phần chữ đen bình thường (`.hero-title-main`, `.hero-title-sub`): **Phải đứng thẳng (`font-style: normal !important`), không được nghiêng, không được cong móc quá**, dùng font chữ có chân (Serif) nhưng phần đầu chữ thẳng, khỏe khoắn (như `'Merriweather'`, `'Lora'`, hoặc `'Noto Serif'`).
  - Chỉ phần chữ màu cam điểm nhấn (`.hero-title-accent`) mới in nghiêng nét thường (`font-weight: 400; font-style: italic`).
- **Cách sửa bắt buộc trong `index.html` (thêm Google Font `Lora:wght@700;800` & `Merriweather:wght@700;900`) và `css/theme.css`:**
  ```css
  /* Đảm bảo thẻ cha của Quote không ép font-style: italic xuống các chữ con */
  html[data-theme="white-orange"] .hero-quote-title,
  html[data-theme="white-orange"] .hero-quote-line {
    font-style: normal !important;
  }

  /* Chữ đen trong Quote ở Mode Trắng Cam: Đứng thẳng 100%, có chân thẳng hiện đại, không cong móc */
  html[data-theme="white-orange"] .hero-title-main,
  html[data-theme="white-orange"] .hero-title-sub {
    font-family: 'Merriweather', 'Lora', 'Noto Serif', Georgia, serif !important;
    font-style: normal !important; /* TUYỆT ĐỐI THẲNG, KHÔNG NGHIÊNG */
    font-weight: 800 !important;
    letter-spacing: -0.03em !important;
    color: #1c1917 !important;
    font-variant-ligatures: none !important;
    font-feature-settings: "swsh" 0, "calt" 0 !important; /* Tắt mọi nét móc cong swash */
  }

  /* Chữ điểm nhấn màu cam: Nét mảnh nghiêng thanh lịch */
  html[data-theme="white-orange"] .hero-title-accent {
    font-family: 'Lora', 'Merriweather', Georgia, serif !important;
    font-style: italic !important;
    font-weight: 400 !important;
    letter-spacing: -0.02em !important;
    color: #ea580c !important;
  }
  ```

### Mục 2.2 & 2.3: Đồng bộ 4 Ô Vuông Thống Kê dưới Quote, 7 Ô Chế Độ Học & Thẻ Bộ Câu Hỏi ở Mode Trắng Cam theo phong cách Smoked Frosted Glass (Lúc đầu Blur Tối, Trỏ vào Trong Suốt hơn + Hiệu ứng Màu)
- **Hiện trạng lỗi (`image_a7a79c.jpg`):**
  Ở chế độ Trắng Cam, 4 ô thống kê dưới Quote (`01 // 228 TỔNG KHO THẺ`...) và các thẻ Chế độ học / Bộ câu hỏi đang là các hộp màu trắng phẳng lì, thiếu chiều sâu kính mờ như ở Dark Mode.
- **Yêu cầu của người dùng:**
  - **Mục 2.2:** 4 ô vuông ở dưới khung Quote làm kiểu như ở Dark Mode: nền kính mờ (blur), khi trỏ chuột vào mới sáng hiệu ứng màu cam lên.
  - **Mục 2.3:** Các ô/object Chế độ học (`.study-mode-card` / `.mode-card`) và Thẻ bộ câu hỏi (`.deck-card`) ở chế độ Trắng Cam làm giống kiểu Dark Mode: **lúc đầu là kính mờ tối (`smoked frosted glass`), khi trỏ chuột vào thì trong suốt hơn 1 tí** kèm viền và ánh sáng màu cam.
- **Cách sửa bắt buộc trong `css/theme.css` cho `html[data-theme="white-orange"]`:**
  ```css
  /* 1. 4 Ô thống kê dưới Quote (.hero-stat-bento-card / .stat-card),
        7 Ô Chế độ học (.study-mode-card / .mode-card),
        và Thẻ Bộ câu hỏi (.deck-card) ở Mode Trắng Cam:
        Lúc đầu ở trạng thái nghỉ là Kính Mờ Tối (Smoked Frosted Blur) */
  html[data-theme="white-orange"] .hero-stat-bento-card,
  html[data-theme="white-orange"] .stat-card,
  html[data-theme="white-orange"] .study-mode-card,
  html[data-theme="white-orange"] .mode-card,
  html[data-theme="white-orange"] .deck-card {
    background: var(--card-glass-bg) !important; /* rgba(34, 27, 22, 0.72) */
    backdrop-filter: blur(22px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(22px) saturate(160%) !important;
    border: 1px solid var(--card-glass-border) !important;
    box-shadow: var(--card-glass-shadow), var(--card-inner-specular) !important;
    color: var(--text-on-card) !important; /* #fff7ed */
    border-radius: 22px !important;
    transition: background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.28s cubic-bezier(0.22, 1, 0.36, 1) !important;
  }

  /* Chữ bên trong các thẻ Smoked Glass ở Mode Trắng Cam */
  html[data-theme="white-orange"] .hero-stat-bento-card *,
  html[data-theme="white-orange"] .stat-card .stat-value,
  html[data-theme="white-orange"] .study-mode-card .study-mode-title,
  html[data-theme="white-orange"] .mode-card h3,
  html[data-theme="white-orange"] .deck-card .deck-title {
    color: #fff7ed !important;
  }

  html[data-theme="white-orange"] .study-mode-card p,
  html[data-theme="white-orange"] .mode-card p,
  html[data-theme="white-orange"] .deck-card .deck-meta,
  html[data-theme="white-orange"] .hero-stat-bento-card .stat-label {
    color: rgba(255, 237, 213, 0.78) !important;
  }

  /*Các nút phụ bên trong thẻ Smoked Glass (Lật thẻ, Thi thử, Thêm câu, Đặt lại) */
  html[data-theme="white-orange"] .deck-card .btn-secondary,
  html[data-theme="white-orange"] .study-mode-card .study-mode-pill-btn {
    background: rgba(255, 255, 255, 0.10) !important;
    color: #fff7ed !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
  }
  html[data-theme="white-orange"] .deck-card .btn-secondary:hover,
  html[data-theme="white-orange"] .study-mode-card:hover .study-mode-pill-btn {
    background: #ea580c !important;
    color: #ffffff !important;
    border-color: #fb923c !important;
  }

  /* 2. KHI TRỎ CHUỘT VÀO (HOVER):
        Trở nên TRONG SUỐT HƠN MỘT CHÚT (alpha giảm từ 0.72 xuống 0.48)
        kèm hiệu ứng ánh sáng màu cam lan tỏa */
  html[data-theme="white-orange"] .hero-stat-bento-card:hover,
  html[data-theme="white-orange"] .stat-card:hover,
  html[data-theme="white-orange"] .study-mode-card:hover,
  html[data-theme="white-orange"] .mode-card:hover,
  html[data-theme="white-orange"] .deck-card:hover {
    background:
      radial-gradient(120% 120% at 50% 0%, rgba(249, 115, 22, 0.28) 0%, rgba(48, 36, 28, 0.48) 70%) !important;
    border-color: #fb923c !important;
    box-shadow: 0 18px 40px -8px rgba(234, 88, 12, 0.28),
                inset 0 1px 2px rgba(255, 255, 255, 0.55) !important;
    transform: translateY(-3px) !important;
  }
  ```

---

## PHẦN 4: SCRIPT TỰ ĐỘNG QUÉT SẠCH 100% EMOJI MÀU & MÀU TÍM CÒN SÓT (`scripts/sanitize-1g.js`)

AI Coding Agent **BẮT BUỘC** tạo và chạy script `scripts/sanitize-1g.js` để kiểm tra và xóa sạch mọi ký tự emoji màu (`\p{Extended_Pictographic}`) trong `index.html` và `js/app.js`, cũng như mọi mã màu tím cứng trong `css/style.css`:

```javascript
// File: scripts/sanitize-1g.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Kiểm tra và thay thế các mã màu tím/đen cứng còn sót trong css/style.css
const cssPath = path.join(root, 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css
  // Xóa màu chữ trắng cứng trên dropdown trigger gây mờ chữ ở Light/White-Orange mode
  .replace(/color:\s*#e4e4e7\s*!important;/gi, 'color: var(--dropdown-text) !important;')
  // Xóa màu tím cứng trên scrollbar của dropdown và toàn cục
  .replace(/scrollbar-color:\s*rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*0\.[0-9]+\s*\)\s*transparent;/gi, 'scrollbar-color: var(--scrollbar-thumb) transparent;')
  // Xóa nền đen tím cứng của .modal-footer, .toast, .restore-banner
  .replace(/background:\s*rgba\(\s*22\s*,\s*19\s*,\s*36\s*,\s*0\.98\s*\);/gi, 'background: transparent;')
  .replace(/background:\s*#221e36;/gi, 'background: var(--status-glass-bg);')
  .replace(/color:\s*#ede9f6;/gi, 'color: var(--status-glass-text);');

fs.writeFileSync(cssPath, css, 'utf8');

// 2. Liệt kê bất kỳ dòng nào trong index.html và js/app.js còn chứa Unicode Emoji để thay bằng SVG đơn sắc
const emojiRegex = /\p{Extended_Pictographic}/gu;
for (const rel of ['index.html', 'js/app.js']) {
  const full = path.join(root, rel);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  let count = 0;
  lines.forEach((line, idx) => {
    const m = line.match(emojiRegex);
    if (m) {
      count += m.length;
      console.log(`[Emoji Audit] ${rel}:${idx + 1} -> ${m.join(' ')} | ${line.trim().slice(0, 90)}`);
    }
  });
  console.log(`[Emoji Audit Summary] ${rel} total remaining emojis: ${count}`);
}
```

> **Yêu cầu bắt buộc sau khi chạy `node scripts/sanitize-1g.js`:**
> AI Agent phải thay thế toàn bộ các vị trí báo `[Emoji Audit]` bằng SVG đơn sắc (`stroke="currentColor" fill="none"`) hoặc xóa các emoji trang trí dư thừa trong chuỗi thông báo cho đến khi chạy lại `node scripts/sanitize-1g.js` báo **`total remaining emojis: 0`** trên cả `index.html` và `js/app.js`!

---

## PHẦN 5: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI HOÀN THÀNH

1. [ ] **Zero Emoji Audit (`1.1`):** Chạy `node scripts/sanitize-1g.js` xác nhận `total remaining emojis: 0` trong `index.html` và `js/app.js`. Đã xóa bỏ hoàn toàn mục chọn `"Màu nhận diện (Vibe Swatches)"` và ô nhập emoji trong `#modal-create-subject` & `#modal-manage-subject`.
2. [ ] **Toast & Thanh Báo Đang Làm Dở (`1.2`):** `.toast` và `#session-restore-banner` (`.restore-banner`) đã chuyển sang dùng `--status-glass-*` (kính mờ đồng bộ theo từng theme, không còn màu tím `#221e36`), và 4 nút công cụ trên thẻ Quiz (`⭐`, `🚩`, `✏️`, `🎯`) + nút `Đoán trước` đã chuyển sang SVG đơn sắc.
3. [ ] **Mobile Bottom Nav (`1.3`):** Nút `"Bộ thẻ"` và tất cả các nút trên `.bottom-nav` ở điện thoại hiển thị đúng nét vẽ SVG (`fill: none !important; stroke: currentColor !important`), tuyệt đối không bị tô đặc thành hình vuông màu cam.
4. [ ] **Dropdown & Scrollbar (`1.4`, `1.5`):** Chữ trên tất cả các `.cyber-dropdown-trigger` khi chưa bấm vào có màu `var(--dropdown-text)` rõ nét ở mọi tab; thanh cuộn (`.cyber-dropdown-menu` và `::-webkit-scrollbar-thumb`) đồng bộ theo `--scrollbar-thumb` của từng theme (không còn màu tím).
5. [ ] **Chế độ 5 — Ôn theo môn học & chương (`1.6`):** Click vào thẻ số 5 ở Trang chủ hoặc Thư viện thẻ mở ngay `#modal-topic-picker`, lọc môn học, chọn chương và bắt đầu phiên học thành công 100%.
6. [ ] **Frosted Liquid Glass Popup (`1.7`, `1.9`):** `.modal-overlay` không làm blur mờ đục màn hình phía sau; chính khối `.modal-box` là tấm kính mờ trong trẻo (`backdrop-filter: blur(28px) saturate(180%)`) như ảnh 5 (`image_a79570.jpg`), và đã xóa bỏ hoàn toàn mảng đen/tím ở `.modal-footer` cũng như `#bulk-reassign-deck-list`.
7. [ ] **Interactive Glass Tile Matrix trên Khung Quote (`1.10`):** Khi di chuột vào khung Quote ở Trang chủ (`#view-dashboard`), xuất hiện hiệu ứng các ô kính vuông bo góc khúc xạ ánh sáng theo vị trí con trỏ như ảnh 6 (`image_a79513.jpg`), mượt 140+ FPS.
8. [ ] **Mode Trắng Cam — Font Quote & Smoked Glass Cards (`2.1`, `2.2`, `2.3`):** Chữ đen trong Quote đứng thẳng (`font-style: normal`), có chân phẳng không cong móc; 4 ô thống kê dưới Quote, 7 ô Chế độ học và các Thẻ bộ câu hỏi có nền kính mờ tối (`smoked frosted glass`) ở trạng thái nghỉ và trở nên trong suốt hơn kèm ánh sáng cam khi trỏ chuột vào.
9. [ ] **Tests & Build:** Chạy `npm test` và `npm run build` đạt 100% PASS.
