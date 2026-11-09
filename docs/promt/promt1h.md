# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1H — CHUẨN HÓA NGÔN NGỮ THIẾT KẾ FROSTED MILKY LIQUID GLASS (ẢNH 1 & ẢNH 4), ĐẬP ĐI XÂY LẠI FLASHCARD 3D & CHẾ ĐỘ BÀI THI 2 MODE, SỬA TRIỆT ĐỂ CHẾ ĐỘ ÔN THEO MÔN, ĐỒNG BỘ LIGHT MODE TRẮNG CAM & KHỞI TẠO SƠ ĐỒ KIẾN TRÚC APP (`ARCHITECTURE_GRAPH.md`) (promt1h.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
>
> * **Phiên bản đặc tả:** `1h` (Nối tiếp sau `1a` -> `1g`)
>
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **20 yêu cầu chi tiết** (14 mục nhóm `1. Chung`, 5 mục nhóm `2. Mode Trắng Cam`, 1 mục nhóm `3. Mode Trắng Đen`) kèm tạo mới tài liệu sơ đồ cấu trúc toàn cục `docs/ARCHITECTURE_GRAPH.md`.
>
> * **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>
>   1. **Zero Data Loss:** Bảo toàn 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>
>   2. **Full-Branch Synchronization:** Không bao giờ chỉ sửa 1 chỗ rồi bỏ quên các nhánh liên kết; phải tạo và đối chiếu `docs/ARCHITECTURE_GRAPH.md` để cập nhật đồng bộ tất cả các vị trí cùng sử dụng chung 1 component.
>
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

## PHẦN 0: GIẢI PHẪU NGUYÊN NHÂN GỐC RỄ CÁC LỖI "SỬA MÃI VẪN BỊ" TRONG CODE HIỆN TẠI

AI Coding Agent **BẮT BUỘC** đọc kỹ 6 phát hiện kỹ thuật dưới đây trước khi chạm vào bất kỳ dòng code nào:

1. **Tại sao Popup (`.modal-box`) ở lượt `1g` bị trong suốt nhìn xuyên thấu chữ phía sau mà KHÔNG hề có hiệu ứng Blur (`image_3b06c1.png`, `image_3b1981.png` — Mục 1.2, 1.5, 1.6)?**

   * **Thủ phạm trong `css/style.css` dòng `3231–3242`:**

     ```
     .modal-overlay {
       transform: translateZ(0);
       will-change: opacity;
       animation: modalFadeIn ...;
     }
     
     ```

   * **Cơ chế trình duyệt Chromium/Edge:** Theo chuẩn W3C Filter Effects Level 2, khi phần tử cha `.modal-overlay` có `transform !== none`, `will-change: opacity`, hoặc `opacity < 1`, trình duyệt tạo một **Backdrop Root cô lập** ngay tại `.modal-overlay`. Khi đó, `backdrop-filter: blur(...)` đặt trên phần tử con `.modal-box` **chỉ lấy mẫu lớp nền rỗng của `.modal-overlay` chứ KHÔNG lấy mẫu nội dung trang web bên dưới `.modal-overlay`**! Kết quả là `.modal-box` mất sạch hiệu ứng blur, biến thành một tấm nhựa trong suốt nhìn xuyên thấu toàn bộ chữ phía sau!

   * **Cách khắc phục bắt buộc:** Trên `.modal-overlay`, phải đặt `transform: none !important; will-change: auto !important; animation: none !important; filter: none !important;` VÀ tăng độ đục trắng sữa/khói mờ (`Milky Frosted Tint`) kết hợp `backdrop-filter: blur(44px) saturate(180%)` trên `.modal-box` để đạt đúng chất liệu **Frosted Milky Liquid Glass** như Ảnh 1 (`image_4515eb.jpg`) và Ảnh 4 (`image_450020.jpg`).

2. **Tại sao trỏ chuột vào Khung Quote, Thẻ, hoặc Nút ở Mode Trắng Đen & Trắng Cam vẫn lòi ra ánh sáng Tím (`Mục 1.7, 2.3, 3.1`)?**

   * **Thủ phạm 1 (`css/style.css` dòng `948–965`):** `.hero-title-accent::after` viết cứng `background: radial-gradient(ellipse at center, rgba(232, 121, 249, 0.8) 0%, rgba(244, 63, 94, 0.6) 50%, transparent 75%);` và bật `opacity: 0.85` khi `:hover` vào khung Quote!

   * **Thủ phạm 2 (`css/style.css` dòng `6768–6920` — `DYNAMIC SPOTLIGHT & HOVER GLOW SYSTEM` ở cuối file):** Toàn bộ `.deck-card::before`, `.stat-card::before`, `.quiz-card::before`, `.study-mode-card::before`, `.deck-card:hover`, `.btn-primary:hover`, `.btn-secondary:hover` ở cuối file đang viết cứng `rgba(192, 132, 252, 0.16)` và `rgba(167, 139, 250, 0.20)`!

   * **Thủ phạm 3 (`css/style.css` dòng `2765–2766` và `2863–2871`):** Mặt sau Flashcard (`.flashcard-back`) viết cứng `background: var(--bg-surface-elevated, #1a1829); border-color: rgba(168, 85, 247, 0.35);` và nút Xem lời giải chi tiết (`.flashcard-exp-toggle-btn`) viết cứng `background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.28);`.

3. **Tại sao Nút "Ôn cả môn" & Chế độ "Ôn theo môn" test tự động báo PASS nhưng người dùng bấm thực tế lại KHÔNG vào được (`Mục 1.13`)?**

   * **Thủ phạm 1 (`js/app.js` dòng `1633–1635`):**

     ```
     async startSubjectSession(subjectId, mode = 'srs') {
       const subject = await db.getSubject(subjectId);
       if (!subject) return; // <--- LỖI CHẾT NGƯỜI!
     
     ```

     Ở tab Thư viện bộ câu hỏi (`#view-decks` — như trong `image_3b0b37.jpg`), khi người dùng đang đứng ở tab lọc `"Tất cả môn"` (`subjectId = 'all'`) hoặc `"Chưa phân loại"` (`subjectId = 'subj_unassigned'`), bấm nút **`[Ôn cả môn]`** sẽ truyền `'all'` hoặc `'subj_unassigned'` vào `startSubjectSession(subjectId)`. Hàm `db.getSubject('all')` trả về `undefined` -> `if (!subject) return;` **âm thầm thoát hàm ngay lập tức mà không báo lỗi hay chuyển trang**!

   * **Thủ phạm 2 (`js/db.js` dòng `405–415` — `getCardsBySubject(subjectId)`):**

     ```
     if (store.indexNames.contains('subjectId')) {
       const index = store.index('subjectId');
       return this._promisify(index.getAll(subjectId));
     }
     
     ```

     Trong dữ liệu thực tế của người dùng, nhiều bộ thẻ (`deck`) đã được gán `deck.subjectId = 'subj_xyz'`, nhưng các câu hỏi (`card`) bên trong bộ thẻ đó được tạo từ các phiên bản trước nên chỉ có `card.deckId` mà chưa có trường `card.subjectId` (hoặc `card.subjectId === undefined`). Khi chạy unit test trên DB giả lập mới tạo, `card.subjectId` luôn có sẵn nên test PASS; nhưng trên trình duyệt thật của người dùng, `index.getAll(subjectId)` trả về mảng rỗng `[]`!

4. **Tại sao Dropdown "Chuyển sang môn khác" không chọn được VÀ bị lòi 2 viền đổ bóng kỳ dị bên ngoài khi mở ở popup Sửa/Quản lý môn học (`image_3b1981.png` — Mục 1.12 & 2.4)?**

   * **Thủ phạm 1 (`js/app.js` dòng `6137`, `6178`, `6430`):** Trong `openManageSubjectModal` và `openBulkReassignModal`, câu lệnh tạo nút item trong dropdown viết:
     `onclick="App.selectManageSubjectDeleteTarget('${s.id}', '${this._escapeHtml(s.name)}', '${s.icon}')"`
     Khi `s.icon` chứa mã `<svg class="mono-icon"...>` (có dấu nháy kép `"` và nháy đơn `'`), thuộc tính `onclick="..."` bị **vỡ cú pháp HTML/JS (`SyntaxError`)**, làm toàn bộ các mục trong dropdown bấm vào đều bị liệt!

   * **Thủ phạm 2 (`image_3b1981.png`):** Khi môn học đang mở không tìm thấy môn đích hoặc danh sách môn rỗng, `#manage-subject-delete-dropdown-menu` vẫn mở lên theo hướng `.dropup` (`bottom: calc(100% + 6px)`) với chiều cao bẹp dí `14px` nằm đè lên dòng chữ phía trên, cộng thêm `box-shadow` kép của `.cyber-dropdown.open .cyber-dropdown-trigger` tạo ra 2 vòng viền lòi ra ngoài!

5. **Tại sao khi ấn Độ am hiểu ở Flashcard thẻ bị khựng rồi mới chuyển câu (`Mục 1.8`)?**

   * Trong `js/app.js` dòng `2792–2805` (`rateFlashcard`), hàm đang `await db.saveCard(card)` và `await db.logReview(...)` chặn cứng luồng UI trước khi tăng `session.currentIndex++`, đồng thời gỡ class `.flipped` ngay lúc đang nạp câu hỏi mới khiến thẻ quay ngược lộ đề mới một cách giật cục.

6. **Tại sao Font chữ trong ô nhập câu hỏi (`textarea`) lại biến thành font máy đánh chữ dị hợm (`image_3b06c1.png` — Mục 1.11)?**

   * Trong `css/style.css` dòng `3219–3223`, `2068`, `5486`: `textarea.form-control, .cyber-textarea, textarea { font-family: var(--font-mono); }` ép toàn bộ `<textarea>` sang font Monospace!

## PHẦN 1: NGHIÊN CỨU & QUY CHUẨN NGÔN NGỮ THIẾT KẾ "FROSTED MILKY LIQUID GLASS" (MỤC 1.2, 1.4, 1.5, 1.6, 2.1, 2.2)

### 1.1. Bản chất vật lý của thiết kế Frosted Milky Liquid Glass (Đối chiếu Ảnh 1 `image_4515eb.jpg` & Ảnh 4 `image_450020.jpg`)

Từ nay về sau, mọi thành phần được yêu cầu làm kiểu **"blur, đục trong suốt / Liquid Glass"** (bao gồm: **Khung Popup `.modal-box`**, **Thanh Sidebar `.app-sidebar`**, **Cụm HUD góc trên phải `.topbar-hud-capsule`**, **4 ô thống kê dưới Quote**, **7 ô Chế độ học**, **Thẻ Bộ câu hỏi**, **Thẻ Flashcard/Quiz**) phải tuân thủ nghiêm ngặt công thức **4 Lớp Vật Lý** sau đây:

1. **Lớp 1 — Tán xạ mờ đục sâu (`Deep Diffusion Blur`):**

   * Sử dụng `backdrop-filter: blur(40px) saturate(180%)` (`-webkit-backdrop-filter: blur(40px) saturate(180%)`).

   * Độ mờ (`blur`) lớn kết hợp tăng độ bão hòa (`saturate(180%)`) giúp các khối màu phía sau tấm kính hòa quyện thành dải màu mượt như nhung (giống hệt khối cầu và cây xương rồng phía sau tấm kính trong Ảnh 1 `image_4515eb.jpg`, hay ánh cam phía sau tấm kính trong Ảnh 4 `image_450020.jpg`), **tuyệt đối không để lộ nét chữ sắc cạnh phía sau xuyên qua gây nhiễu thị giác**.

2. **Lớp 2 — Độ đục nền (`Milky / Smoked Translucent Body`):**

   * **Ở Light Mode (`white-orange` — Ảnh 1 `image_4515eb.jpg`):** Phải là **kính trắng kem mờ đục (`Milky Warm White Glass`)**, tuyệt đối KHÔNG được làm màu đen/nâu tối! Dùng gradient bề mặt kính nghiêng nhẹ:
     `background: linear-gradient(145deg, rgba(255, 253, 250, 0.84) 0%, rgba(248, 238, 228, 0.74) 100%)`.

   * **Ở Dark Mode (`monochrome` & `purple-pink` — Ảnh 4 `image_450020.jpg`):** Là **kính khói mờ đục (`Smoked Frosted Glass`)**:

     * `monochrome`: `linear-gradient(145deg, rgba(36, 36, 42, 0.84) 0%, rgba(20, 20, 24, 0.76) 100%)`.

     * `purple-pink`: `linear-gradient(145deg, rgba(38, 30, 60, 0.84) 0%, rgba(22, 17, 38, 0.76) 100%)`.

3. **Lớp 3 — Viền khúc xạ ánh sáng (`Specular Refractive Rim`):**

   * Bí quyết tạo cảm giác "Liquid Glass" có độ dày thật như Ảnh 1 và Ảnh 4 nằm ở **viền ngoài bán trong suốt kết hợp bóng sáng nội tâm (`inset box-shadow`) ở cạnh đón sáng (trên & trái)**:

     * Light Mode (`white-orange`):
       `border: 1.5px solid rgba(255, 255, 255, 0.82);`
       `box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.95), inset 1px 0 1.5px rgba(255, 255, 255, 0.65), inset 0 -1px 2px rgba(180, 83, 9, 0.08), 0 20px 48px -12px rgba(120, 53, 15, 0.14);`

     * Dark Mode (`monochrome` / `purple-pink`):
       `border: 1px solid rgba(255, 255, 255, 0.22);`
       `box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.28), inset 1px 0 1px rgba(255, 255, 255, 0.14), inset 0 -1px 2px rgba(0, 0, 0, 0.35), 0 24px 56px -12px rgba(0, 0, 0, 0.65);`

4. **Lớp 4 — Tương tác trạng thái nghỉ vs. khi trỏ chuột (`Resting Frosted vs. Hover State`):**

   * Áp dụng thống nhất theo đúng yêu cầu Mục 2.1 & 2.2.

### 1.2. Bảng Token Điều Phối Trung Tâm Mới trong `css/theme.css`

Cập nhật `css/theme.css` với bộ biến hoàn chỉnh sau (và xóa toàn bộ mã màu tím cứng ở cuối `css/style.css` dòng `6768–6920`, `948–965`, `2765`, `2863`):

```
/* ==========================================================================
   MASTER FROSTED LIQUID GLASS & THEME TOKEN SYSTEM (PHASE 1H)
   ========================================================================== */

:root,
html[data-theme="purple-pink"] {
  --bg-base: #0d0b14;
  --bg-surface: rgba(28, 22, 46, 0.78);
  --bg-surface-elevated: rgba(38, 30, 62, 0.84);

  /* Frosted Milky/Smoked Liquid Glass — Popup & Sidebar (Mục 1.2, 1.4, 1.5) */
  --glass-slab-bg: linear-gradient(145deg, rgba(38, 30, 62, 0.86) 0%, rgba(22, 17, 38, 0.80) 100%);
  --glass-slab-blur: blur(42px) saturate(180%);
  --glass-slab-border: rgba(255, 255, 255, 0.22);
  --glass-slab-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.28),
                       inset 1px 0 1px rgba(255, 255, 255, 0.14),
                       0 24px 60px -12px rgba(0, 0, 0, 0.70);

  /* Cards (4 Stat Boxes, 7 Modes, Decks, Flashcard, Quiz) */
  --card-frosted-bg: linear-gradient(145deg, rgba(34, 27, 54, 0.78) 0%, rgba(22, 17, 36, 0.70) 100%);
  --card-frosted-hover-bg: linear-gradient(145deg, rgba(48, 38, 76, 0.56) 0%, rgba(32, 24, 52, 0.48) 100%);
  --card-frosted-border: rgba(255, 255, 255, 0.16);
  --card-frosted-hover-border: rgba(192, 132, 252, 0.60);
  --card-frosted-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.20),
                         0 14px 36px -10px rgba(0, 0, 0, 0.55);

  /* 4 Stat Boxes Hover Color */
  --stat-box-hover-bg: linear-gradient(135deg, rgba(168, 85, 247, 0.32) 0%, rgba(236, 72, 153, 0.24) 100%);
  --stat-box-hover-border: rgba(192, 132, 252, 0.65);
  --stat-box-hover-text: #ffffff;

  /* Typography */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;

  /* Accents & Spotlight (Synced!) */
  --accent: #c084fc;
  --accent-strong: #a855f7;
  --accent-soft: rgba(192, 132, 252, 0.16);
  --accent-border: rgba(192, 132, 252, 0.40);
  --accent-glow: rgba(192, 132, 252, 0.24);
  --spotlight-color-1: rgba(192, 132, 252, 0.14);
  --spotlight-color-2: rgba(167, 139, 250, 0.04);

  /* Buttons */
  --btn-primary-bg: #c084fc;
  --btn-primary-text: #0d0b14;
  --btn-primary-hover-bg: #d8b4fe;
  --btn-secondary-bg: rgba(255, 255, 255, 0.08);
  --btn-secondary-text: #f8fafc;
  --btn-secondary-border: rgba(255, 255, 255, 0.18);
  --btn-secondary-hover-bg: rgba(192, 132, 252, 0.20);
  --btn-secondary-hover-border: rgba(192, 132, 252, 0.50);

  /* Inputs & Dropdowns */
  --input-bg: rgba(255, 255, 255, 0.07);
  --input-border: rgba(255, 255, 255, 0.18);
  --input-text: #f8fafc;
  --input-placeholder: rgba(203, 213, 225, 0.72);
  --dropdown-bg: rgba(28, 22, 46, 0.90);
  --dropdown-menu-bg: rgba(24, 19, 40, 0.96);
  --dropdown-text: #f8fafc;
  --dropdown-border: rgba(255, 255, 255, 0.20);
  --dropdown-item-hover-bg: rgba(192, 132, 252, 0.18);
  --dropdown-item-active-bg: #c084fc;
  --dropdown-item-active-text: #0d0b14;
  --scrollbar-thumb: rgba(192, 132, 252, 0.40);
}

/* ==========================================================================
   MODE 2: TRẮNG ĐEN (MONOCHROME) — TUYỆT ĐỐI KHÔNG CÒN ÁNH TÍM (MỤC 3.1)
   ========================================================================== */
html[data-theme="monochrome"] {
  --bg-base: #09090b;
  --bg-surface: rgba(24, 24, 28, 0.80);
  --bg-surface-elevated: rgba(34, 34, 40, 0.86);

  --glass-slab-bg: linear-gradient(145deg, rgba(36, 36, 42, 0.86) 0%, rgba(20, 20, 24, 0.80) 100%);
  --glass-slab-blur: blur(42px) saturate(150%);
  --glass-slab-border: rgba(255, 255, 255, 0.26);
  --glass-slab-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.32),
                       inset 1px 0 1px rgba(255, 255, 255, 0.16),
                       0 24px 60px -12px rgba(0, 0, 0, 0.80);

  --card-frosted-bg: linear-gradient(145deg, rgba(32, 32, 38, 0.78) 0%, rgba(20, 20, 24, 0.70) 100%);
  --card-frosted-hover-bg: linear-gradient(145deg, rgba(46, 46, 54, 0.56) 0%, rgba(28, 28, 34, 0.46) 100%);
  --card-frosted-border: rgba(255, 255, 255, 0.18);
  --card-frosted-hover-border: rgba(255, 255, 255, 0.65);
  --card-frosted-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.24),
                         0 14px 36px -10px rgba(0, 0, 0, 0.75);

  --stat-box-hover-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(161, 161, 170, 0.14) 100%);
  --stat-box-hover-border: #ffffff;
  --stat-box-hover-text: #ffffff;

  --text-primary: #ffffff;
  --text-secondary: #d4d4d8;
  --text-muted: #a1a1aa;

  --accent: #ffffff;
  --accent-strong: #e4e4e7;
  --accent-soft: rgba(255, 255, 255, 0.14);
  --accent-border: rgba(255, 255, 255, 0.42);
  --accent-glow: rgba(255, 255, 255, 0.18);
  --spotlight-color-1: rgba(255, 255, 255, 0.12);
  --spotlight-color-2: rgba(255, 255, 255, 0.03);

  --btn-primary-bg: #ffffff;
  --btn-primary-text: #09090b;
  --btn-primary-hover-bg: #e4e4e7;
  --btn-secondary-bg: rgba(255, 255, 255, 0.08);
  --btn-secondary-text: #ffffff;
  --btn-secondary-border: rgba(255, 255, 255, 0.22);
  --btn-secondary-hover-bg: rgba(255, 255, 255, 0.18);
  --btn-secondary-hover-border: rgba(255, 255, 255, 0.60);

  --input-bg: rgba(255, 255, 255, 0.07);
  --input-border: rgba(255, 255, 255, 0.22);
  --input-text: #ffffff;
  --input-placeholder: rgba(212, 212, 216, 0.72);
  --dropdown-bg: rgba(24, 24, 28, 0.92);
  --dropdown-menu-bg: rgba(18, 18, 22, 0.96);
  --dropdown-text: #ffffff;
  --dropdown-border: rgba(255, 255, 255, 0.24);
  --dropdown-item-hover-bg: rgba(255, 255, 255, 0.14);
  --dropdown-item-active-bg: #ffffff;
  --dropdown-item-active-text: #09090b;
  --scrollbar-thumb: rgba(255, 255, 255, 0.38);
}

/* ==========================================================================
   MODE 3: TRẮNG CAM (WHITE-ORANGE) — PURE LIGHT MODE MILKY LIQUID GLASS
   (Chuẩn Ảnh 1 image_4515eb.jpg: Đục mờ màu trắng kem, tuyệt đối không tối đen!)
   ========================================================================== */
html[data-theme="white-orange"] {
  --bg-base: #fdf6ee;
  --bg-surface: rgba(255, 252, 248, 0.82);
  --bg-surface-elevated: rgba(255, 248, 240, 0.90);

  /* Popup & Sidebar: Kính trắng kem mờ đục dày dặn như Ảnh 1 (Spatial Designer) */
  --glass-slab-bg: linear-gradient(145deg, rgba(255, 253, 250, 0.86) 0%, rgba(247, 237, 226, 0.78) 100%);
  --glass-slab-blur: blur(44px) saturate(180%);
  --glass-slab-border: rgba(255, 255, 255, 0.88);
  --glass-slab-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.98),
                       inset 1px 0 1.5px rgba(255, 255, 255, 0.75),
                       inset 0 -1px 2px rgba(180, 83, 9, 0.08),
                       0 24px 60px -12px rgba(120, 53, 15, 0.16);

  /* Mục 2.1 & 2.2: Các ô ở trạng thái nghỉ là Kính Trắng Kem Mờ Đục (Milky Frosted White),
     khi trỏ chuột vào (Hover) thì TRONG SUỐT HƠN (alpha giảm từ 0.84 xuống 0.48) */
  --card-frosted-bg: linear-gradient(145deg, rgba(255, 253, 250, 0.84) 0%, rgba(250, 240, 230, 0.76) 100%);
  --card-frosted-hover-bg: linear-gradient(145deg, rgba(255, 250, 245, 0.50) 0%, rgba(255, 237, 213, 0.42) 100%);
  --card-frosted-border: rgba(255, 255, 255, 0.88);
  --card-frosted-hover-border: rgba(234, 88, 12, 0.55);
  --card-frosted-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
                         inset 0 -1px 1.5px rgba(180, 83, 9, 0.06),
                         0 12px 32px -8px rgba(120, 53, 15, 0.10);

  /* Mục 2.1: 4 ô ở trang Quote khi trỏ chuột vào thì đổi sang màu Cam Đào / Terracotta hiện đại */
  --stat-box-hover-bg: linear-gradient(135deg, rgba(234, 88, 12, 0.88) 0%, rgba(249, 115, 22, 0.80) 100%);
  --stat-box-hover-border: rgba(255, 255, 255, 0.92);
  --stat-box-hover-text: #ffffff;

  /* Chữ Light Mode độ tương phản cao, sắc nét tuyệt đối (Mục 2.3) */
  --text-primary: #1c1917;
  --text-secondary: #44403c;
  --text-muted: #78716c;

  --accent: #ea580c;
  --accent-strong: #c2410c;
  --accent-soft: rgba(234, 88, 12, 0.12);
  --accent-border: rgba(234, 88, 12, 0.38);
  --accent-glow: rgba(234, 88, 12, 0.20);
  --spotlight-color-1: rgba(249, 115, 22, 0.14);
  --spotlight-color-2: rgba(251, 146, 60, 0.04);

  --btn-primary-bg: #ea580c;
  --btn-primary-text: #ffffff;
  --btn-primary-hover-bg: #c2410c;
  --btn-secondary-bg: rgba(255, 255, 255, 0.68);
  --btn-secondary-text: #1c1917;
  --btn-secondary-border: rgba(120, 53, 15, 0.18);
  --btn-secondary-hover-bg: rgba(255, 237, 213, 0.85);
  --btn-secondary-hover-border: rgba(234, 88, 12, 0.45);

  --input-bg: rgba(255, 255, 255, 0.72);
  --input-border: rgba(120, 53, 15, 0.22);
  --input-text: #1c1917;
  --input-placeholder: rgba(68, 64, 60, 0.68);
  --dropdown-bg: rgba(255, 255, 255, 0.88);
  --dropdown-menu-bg: rgba(255, 252, 248, 0.96);
  --dropdown-text: #1c1917;
  --dropdown-border: rgba(234, 88, 12, 0.28);
  --dropdown-item-hover-bg: rgba(234, 88, 12, 0.12);
  --dropdown-item-active-bg: #ea580c;
  --dropdown-item-active-text: #ffffff;
  --scrollbar-thumb: rgba(234, 88, 12, 0.42);
}

```

## PHẦN 2: CHI TIẾT THỰC THI 14 MỤC NHÓM 1 (`1. CHUNG`), 5 MỤC NHÓM 2 (`2. MODE TRẮNG CAM`) & 1 MỤC NHÓM 3 (`3. MODE TRẮNG ĐEN`)

### Mục 1.1 & 3.1: Xóa bỏ hoàn toàn hiệu ứng Con Trỏ Ô Vuông ở Trang chủ & Xóa Ánh Sáng Tím dưới Khung Quote

1. Trong `index.html`, `js/app.js`, và `css/theme.css`:

   * Xóa thẻ `<div class="hero-glass-matrix-layer" id="hero-glass-matrix"></div>`, xóa hàm `initHeroGlassMatrix()` và xóa mọi listener `mousemove` tạo ô vuông trên `.hero-inspiration-stage`.

2. Trong `css/style.css` (dòng `945–965` và `899–908`):

   * Xóa hoặc đặt `display: none !important; opacity: 0 !important;` cho `.hero-title-accent::after` và `.hero-card::before` (đây chính là thủ phạm phát ra ánh sáng tím hồng `rgba(232, 121, 249, 0.8)` dưới khung Quote khi trỏ chuột vào ở Mode Trắng Đen!).

   * Đặt `text-shadow: none !important; filter: none !important;` cho `.hero-title-accent` ở cả `monochrome` và `white-orange`.

### Mục 1.2 & 1.4: Biến toàn bộ Khung Popup (`.modal-box`) và Sidebar (`.app-sidebar`) thành Frosted Milky Liquid Glass chuẩn Ảnh 1 (`image_4515eb.jpg`)

```
/* 1. BẮT BUỘC: Gỡ bỏ Backdrop Root trên .modal-overlay để .modal-box thực sự blur được trang phía sau! */
.modal-overlay {
  background: rgba(12, 10, 18, 0.28) !important;
  transform: none !important;
  will-change: auto !important;
  animation: none !important;
  filter: none !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}
html[data-theme="white-orange"] .modal-overlay {
  background: rgba(68, 40, 20, 0.16) !important;
}

/* 2. Khung Popup (.modal-box) và Sidebar (.app-sidebar) dùng chung chuẩn Frosted Milky Liquid Glass */
.modal-box,
.app-sidebar {
  background: var(--glass-slab-bg) !important;
  backdrop-filter: var(--glass-slab-blur) !important;
  -webkit-backdrop-filter: var(--glass-slab-blur) !important;
  border: 1.5px solid var(--glass-slab-border) !important;
  box-shadow: var(--glass-slab-shadow) !important;
  color: var(--text-primary) !important;
}

.modal-box {
  border-radius: 28px !important;
}

.modal-header,
.modal-body,
.modal-footer {
  background: transparent !important;
  border-color: rgba(128, 128, 128, 0.14) !important;
}

.modal-title {
  color: var(--text-primary) !important;
}

/* Bắt buộc vô hiệu hóa mọi rule tắt backdrop-filter cũ trong css/style.css */
body.disable-backdrop-blur .modal-box,
body.disable-backdrop-blur .app-sidebar {
  backdrop-filter: var(--glass-slab-blur) !important;
  -webkit-backdrop-filter: var(--glass-slab-blur) !important;
}

```

### Mục 1.3, 2.1 & 2.2: Đồng bộ 4 Khung ở Khung Quote (Bỏ `01 //`, `02 //`...) & Thiết kế chuẩn Light Mode Frosted Glass cho 4 Ô Quote + 7 Ô Mode + Thẻ Bộ Câu Hỏi

1. **Xóa nhãn đánh số `01 //`, `02 //`, `03 //`, `04 //` (Mục 1.3):**

   * Trong `index.html` (khu vực 4 ô thống kê dưới khung Quote) và `js/app.js` (nếu có render động): **xóa hoàn toàn** các phần tử hiển thị `01 //`, `02 //`, `03 //`, `04 //`.

   * Chỉ giữ lại **Con số thống kê lớn** (`228`, `197`, `9`, `3 ngày`) và **Chữ mô tả bên dưới** (`TỔNG KHO THẺ`, `CẦN ÔN HÔM NAY`, `ĐÃ THÀNH THẠO`, `CHUỖI BỀN BỈ`), căn bố cục đồng nhất 100% giữa cả 3 theme!

2. **Thiết kế chuẩn Frosted Milky Glass cho 4 Ô Thống Kê, 7 Ô Chế Độ Học & Thẻ Bộ Câu Hỏi (Mục 1.3, 2.1, 2.2):**

   * **Ở trạng thái bình thường (Resting State):** Cả 4 ô thống kê, 7 ô chế độ học và các thẻ bộ câu hỏi đều mang chất liệu **kính mờ đục (`--card-frosted-bg`)** với `backdrop-filter: blur(36px) saturate(170%)`, viền sáng khúc xạ `--card-frosted-border` và chữ `--text-primary` (ở Mode Trắng Cam là kính trắng sữa đục mờ, chữ nâu đen đậm `#1c1917` rõ nét).

   * **Khi trỏ chuột vào 4 ô ở khung Quote (Mục 2.1):**

     ```
     .hero-stat-bento-card:hover,
     .stats-grid .stat-card:hover {
       background: var(--stat-box-hover-bg) !important;
       border-color: var(--stat-box-hover-border) !important;
       color: var(--stat-box-hover-text) !important;
       transform: translateY(-3px) !important;
       box-shadow: 0 18px 38px -8px var(--accent-glow),
                   inset 0 1.5px 2px rgba(255, 255, 255, 0.65) !important;
     }
     .hero-stat-bento-card:hover *,
     .stats-grid .stat-card:hover * {
       color: var(--stat-box-hover-text) !important;
     }
     
     ```

   * **Khi trỏ chuột vào 7 ô Chế độ học & Thẻ Bộ câu hỏi (Mục 2.2):**

     * Từ trạng thái kính mờ đục (`--card-frosted-bg`), khi trỏ chuột vào sẽ chuyển sang **`--card-frosted-hover-bg` (trong suốt hơn — độ đục giảm từ `0.84` xuống `0.46`)**, để lộ màu nền phía dưới ánh xuyên qua lớp kính mờ kèm viền sáng `--card-frosted-hover-border`!

### Mục 1.7 & 2.3: Xóa sạch Sắc Tím còn sót ở Khung Flashcard, Phần Xem Lời Giải Chi Tiết, Bảng Gán Lại Môn Học & Toàn Bộ Khối Spotlight Cuối File `css/style.css`

1. **Trong `css/style.css` (dòng `2228–2253` và `2737–2875`):**

   * Đổi `.flashcard-face` và `.flashcard-back` sang dùng `background: var(--card-frosted-bg) !important; border: 1.5px solid var(--card-frosted-border) !important; backdrop-filter: blur(36px) saturate(170%) !important; color: var(--text-primary) !important;`.

   * Đổi `.flashcard-explanation-box` và `.quiz-explanation-box` sang dùng:

     ```
     .flashcard-explanation-box,
     .quiz-explanation-box {
       background: var(--accent-soft) !important;
       border: 1px solid var(--accent-border) !important;
       border-left: 4px solid var(--accent) !important;
       color: var(--text-primary) !important;
       border-radius: 14px !important;
     }
     .flashcard-exp-toggle-btn {
       background: var(--btn-secondary-bg) !important;
       color: var(--text-primary) !important;
       border: 1px solid var(--accent-border) !important;
     }
     .flashcard-exp-toggle-btn:hover {
       background: var(--accent) !important;
       color: var(--btn-primary-text) !important;
     }
     
     ```

2. **Trong `css/style.css` (dòng `6768–6920` — `DYNAMIC SPOTLIGHT & HOVER GLOW SYSTEM`):**

   * Thay thế toàn bộ `rgba(192, 132, 252, ...)` và `rgba(167, 139, 250, ...)` bằng `var(--spotlight-color-1)`, `var(--spotlight-color-2)`, `var(--card-frosted-hover-border)`, và `var(--accent-glow)`!

3. **Trong `#modal-bulk-reassign-decks` (`image_3b0b37.jpg` — Mục 2.3):**

   * Đảm bảo `.bulk-deck-row` và tên bộ thẻ bên trong (`tkt1`, `tkt2`, `Bộ câu hỏi LMS`) có `color: var(--text-primary) !important; font-weight: 600 !important; background: var(--btn-secondary-bg) !important; border: 1px solid var(--input-border) !important;`, khi hover hoặc được tích chọn (`.selected`) thì dùng `background: var(--accent-soft) !important; border-color: var(--accent) !important;` (tuyệt đối không còn chữ trắng mờ hay ánh tím!).

### Mục 1.8: Đập Đi Làm Lại Từ Đầu Hiệu Ứng Lật Thẻ (Flashcard Flip) & Chuyển Câu Mượt Tức Thì Khi Ấn Độ Am Hiểu

1. **Cơ chế CSS 3D Flip mượt 140+ FPS:**

   ```
   .flashcard-stage {
     perspective: 1600px !important;
   }
   .flashcard-card {
     position: relative;
     transform-style: preserve-3d !important;
     -webkit-transform-style: preserve-3d !important;
     transition: transform 0.44s cubic-bezier(0.22, 1, 0.36, 1),
                 opacity 0.18s ease !important;
     will-change: transform, opacity;
   }
   .flashcard-card.flipped {
     transform: rotateY(180deg) !important;
   }
   .flashcard-card.switching-out {
     transition: transform 0.15s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease !important;
     transform: translate3d(-42px, 0, 0) scale(0.96) !important;
     opacity: 0 !important;
   }
   .flashcard-card.switching-in-start {
     transition: none !important;
     transform: translate3d(42px, 0, 0) scale(0.96) rotateY(0deg) !important;
     opacity: 0 !important;
   }
   
   ```

2. **Viết lại hàm `rateFlashcard(rating)` trong `js/app.js` (dòng `2767`) — Không bao giờ `await` DB làm khựng UI và không bao giờ lật ngược lộ đề mới:**

   ```
   rateFlashcard(rating) {
     if (this._isSwitchingFlashcard) return;
     this.clearPerQuestionTimer();
     const session = this.activeSession;
     if (!session) return;
     const card = session.cards[session.currentIndex];
     if (!card) return;
   
     const isCorrect = rating >= 3;
     if (isCorrect) {
       sounds.playCorrect();
       session.correctCount++;
     } else {
       sounds.playIncorrect();
       session.incorrectCount++;
     }
   
     // Tính toán SM-2 ngay trong RAM và ghi DB bất đồng bộ ở hậu trường (Zero UI Blocking!)
     const nextSrs = SRS.calculateNext(card.srs, rating);
     card.srs = nextSrs;
     card.stats = card.stats || {};
     card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
     if (isCorrect) {
       card.stats.correctCount = (card.stats.correctCount || 0) + 1;
     } else {
       card.stats.incorrectCount = (card.stats.incorrectCount || 0) + 1;
     }
     card.stats.lastReviewed = Date.now();
   
     Promise.all([
       db.saveCard(card),
       db.logReview({
         deckId: card.deckId,
         cardId: card.id,
         rating: rating,
         isCorrect: isCorrect,
         mode: 'flashcard'
       })
     ]).catch(err => console.error('Background SRS save error:', err));
   
     this.saveActiveSessionState();
   
     const flashcardEl = document.getElementById('active-flashcard');
     session.currentIndex++;
   
     // Nếu đã hết câu hỏi trong phiên thì hoàn thành ngay
     if (session.currentIndex >= session.cards.length) {
       this.renderActiveStudyCard();
       return;
     }
   
     // Hiệu ứng lướt thẻ cũ ra -> nạp thẻ mới ở mặt trước -> lướt thẻ mới vào mượt 140+ FPS
     if (flashcardEl) {
       this._isSwitchingFlashcard = true;
       flashcardEl.classList.add('switching-out');
       setTimeout(() => {
         flashcardEl.classList.remove('switching-out', 'flipped');
         flashcardEl.classList.add('switching-in-start');
         this.renderActiveStudyCard();
         void flashcardEl.offsetWidth; // Force reflow
         requestAnimationFrame(() => {
           flashcardEl.classList.remove('switching-in-start');
           this._isSwitchingFlashcard = false;
         });
       }, 145);
     } else {
       this.renderActiveStudyCard();
     }
   },
   
   ```

### Mục 1.9: Chế Độ Bài Thi (`#modal-exam-setup` & `#view-exam`) — Thêm lựa chọn 2 Chế Độ: (1) Hiện từng câu 1, (2) Hiện toàn bộ kéo xuống như LMS

1. **Trong `#modal-exam-setup` (`index.html` dòng `1442`):**
   Thêm mục chọn **"Chế độ hiển thị bài thi"** (dạng 2 nút pill chọn nhanh hoặc dropdown):

   * `single`: **Hiện từng câu một** (Tập trung từng câu, có nút Câu trước / Câu sau).

   * `all`: **Hiện toàn bộ câu hỏi (Cuộn dọc như LMS)** (Hiển thị tất cả câu hỏi từ 1 đến N trên cùng một trang để kéo xuống làm liền mạch như trên LMS Moodle).

2. **Trong `#view-exam` (`index.html` dòng `793`) và `js/app.js` (`startExamFromModal`, `initExamSession`, `renderExamQuestion`):**

   * Lưu `displayMode: examDisplayMode` (`'single'` hoặc `'all'`) vào `this.activeSession`.

   * Khi `session.displayMode === 'single'`: Hiển thị `#exam-single-card-wrap` như hiện tại.

   * Khi `session.displayMode === 'all'`:

     * Ẩn `#exam-single-card-wrap` và hiển thị `#exam-all-questions-list`.

     * Render toàn bộ `session.cards` thành danh sách các thẻ `.exam-lms-item` xếp dọc từ `Câu 1` đến `Câu N`, kèm thanh **Bảng điều hướng câu hỏi (Question Palette `1..N`)** dính (`sticky`) ở phía trên để biết câu nào đã làm (đổi màu `active`) và bấm vào nhảy mượt (`scrollIntoView({ behavior: 'smooth' })`) tới câu đó.

     * Ở cuối danh sách (và góc trên thanh header bài thi) có nút **`"Nộp bài thi"`** gọi `App.submitExam()`.

### Mục 1.10: Các Câu Đánh Dấu Sao (Bookmark) hoặc Gắn Cờ (Flag) Phải Khác Biệt Rõ Rệt Giữa Có Và Không (Icon Bôi Đặc `fill="currentColor"` + Nền Đậm Sắc Nét)

* Áp dụng đồng bộ tại **Màn hình Học/Quiz/Flashcard (`#view-study`)** và **Ngân hàng câu hỏi (`#view-bank`)**:

  ```
  /* Khi CHƯA chọn: Icon rỗng chỉ có nét stroke */
  .card-action-btn svg,
  .bank-action-btn svg,
  #btn-quiz-bookmark svg,
  #btn-quiz-flag svg {
    fill: none !important;
    stroke: currentColor !important;
    stroke-width: 2px !important;
    transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), fill 0.18s ease !important;
  }
  
  /* Khi ĐÃ ĐÁNH DẤU SAO (.active / .is-bookmarked): Icon ngôi sao TÔ ĐẶC 100% + Nền Vàng Hổ Phách Nổi Bật */
  #btn-quiz-bookmark.active,
  .bank-bookmark-btn.active,
  .card-action-btn.bookmark-active {
    background: #f59e0b !important;
    color: #ffffff !important;
    border-color: #f59e0b !important;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.40) !important;
    transform: scale(1.06);
  }
  #btn-quiz-bookmark.active svg,
  #btn-quiz-bookmark.active svg *,
  .bank-bookmark-btn.active svg,
  .bank-bookmark-btn.active svg * {
    fill: currentColor !important;
    stroke: currentColor !important;
  }
  
  /* Khi ĐÃ GẮN CỜ (.active / .is-flagged): Icon lá cờ TÔ ĐẶC 100% + Nền Đỏ San Hô Nổi Bật */
  #btn-quiz-flag.active,
  .bank-flag-btn.active,
  .card-action-btn.flag-active {
    background: #ef4444 !important;
    color: #ffffff !important;
    border-color: #ef4444 !important;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.40) !important;
    transform: scale(1.06);
  }
  #btn-quiz-flag.active svg,
  #btn-quiz-flag.active svg *,
  .bank-flag-btn.active svg,
  .bank-flag-btn.active svg * {
    fill: currentColor !important;
    stroke: currentColor !important;
  }
  
  ```

### Mục 1.11: Đồng Nhất 1 Loại Font Chữ Dễ Nhìn Cho Mọi Input, Textarea & Placeholder (`image_3b06c1.png`)

* Trong `css/style.css` (dòng `3170–3228`, `1119`, `2068`, `4564`, `5486`, `5515`), xóa bỏ hoàn toàn `font-family: var(--font-mono)` trên `textarea`, `.cyber-textarea`, `#edit-card-question`, `#lms-raw-input`, `#ai-raw-input`:

  ```
  input,
  textarea,
  select,
  .form-control,
  .cyber-input,
  .cyber-textarea,
  #edit-card-question,
  #edit-card-explanation,
  #lms-raw-input,
  #import-raw-input {
    font-family: var(--font-sans, 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif) !important;
    font-size: 0.95rem !important;
    line-height: 1.55 !important;
    font-weight: 500 !important;
    background: var(--input-bg) !important;
    color: var(--input-text) !important;
    border: 1.5px solid var(--input-border) !important;
  }
  
  input::placeholder,
  textarea::placeholder,
  .form-control::placeholder,
  .cyber-textarea::placeholder {
    font-family: var(--font-sans, 'Plus Jakarta Sans', 'Inter', sans-serif) !important;
    color: var(--input-placeholder) !important;
    opacity: 1 !important;
    font-weight: 400 !important;
  }
  
  ```

### Mục 1.12 & 2.4: Sửa Dứt Điểm Lỗi Dropdown "Chuyển Sang Môn Khác" Không Chọn Được & Lỗi 2 Viền Đổ Bóng Lòi Ra Ngoài (`image_3b1981.png`)

1. **Sửa lỗi bấm không chọn được môn học trong mọi Dropdown (`js/app.js` dòng `6127–6258` và `6422–6447`):**

   * **Tuyệt đối không truyền `s.icon` hoặc tên môn học qua chuỗi `onclick="App.select...('${s.id}', '${s.name}', '${s.icon}')"`** (vì `s.icon` chứa thẻ `<svg ...>` làm vỡ cú pháp thuộc tính `onclick`)!

   * Thay thế bằng `data-subject-id="${s.id}"` và gán sự kiện bằng DOM API:

     ```
     // Trong openManageSubjectModal(subjectId):
     const targetOptions = [
       ...otherSubjects,
       ...(subject.id !== 'subj_unassigned' ? [{ id: 'subj_unassigned', name: 'Chưa phân loại' }] : [])
     ];
     
     ```

     Khi render các nút `.cyber-dropdown-item` trong `#manage-subject-merge-dropdown-menu`, `#manage-subject-delete-dropdown-menu`, và `#bulk-reassign-subject-dropdown-menu`:

     ```
     menuEl.innerHTML = targetOptions.map((s, idx) => `
       <button type="button" class="cyber-dropdown-item ${idx === 0 ? 'active' : ''}" data-target-subj-id="${s.id}" data-target-subj-name="${this._escapeHtml(s.name)}">
         <span style="display: inline-flex; align-items: center; gap: 8px;">
           ${this.getMonoSvg ? this.getMonoSvg('folder') : ''}
           <span>${this._escapeHtml(s.name)}</span>
         </span>
       </button>
     `).join('');
     
     menuEl.querySelectorAll('.cyber-dropdown-item').forEach(btn => {
       btn.addEventListener('click', (ev) => {
         ev.stopPropagation();
         const targetId = btn.getAttribute('data-target-subj-id');
         const targetName = btn.getAttribute('data-target-subj-name');
         // Cập nhật select ẩn, nhãn hiển thị, trạng thái active và đóng menu
         if (selectEl) selectEl.value = targetId;
         if (labelEl) labelEl.textContent = targetName;
         menuEl.querySelectorAll('.cyber-dropdown-item').forEach(b => b.classList.toggle('active', b === btn));
         this.closeAllCyberDropdowns();
       });
     });
     
     ```

2. **Sửa lỗi 2 viền đổ bóng lòi ra ngoài khi mở Dropdown trong Modal (`image_3b1981.png` — Mục 2.4):**

   * Trong `css/style.css`:

     * Đặt `outline: none !important; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08) !important;` trên `.cyber-dropdown-trigger:focus`, `.cyber-dropdown-trigger:hover`, `.cyber-dropdown.open .cyber-dropdown-trigger` (không vẽ vòng `0 0 0 3px` chồng lên viền của thẻ cha).

     * Đặt `.modal-body { overflow: visible !important; }` (hoặc đảm bảo `.cyber-dropdown-menu` có `min-height: 44px; padding: 6px;` và khi không có mục nào thì ẩn hoàn toàn `display: none !important` thay vì hiện một thanh rỗng bẹp dí `14px` đè lên chữ phía trên như trong `image_3b1981.png`!).

### Mục 1.13: Sửa Triệt Để Nút & Chế Độ "Ôn Theo Môn" (`startSubjectSession`, `getCardsBySubject`, và `openTopicPickerModal`)

1. **Trong `js/db.js` (dòng `405` — hàm `getCardsBySubject(subjectId)`):**
   Bỏ việc chỉ truy vấn `store.index('subjectId').getAll(subjectId)` (vì nó bỏ sót toàn bộ các câu hỏi nằm trong bộ thẻ thuộc môn đó nhưng bản thân câu hỏi chưa có trường `card.subjectId`, hoặc các câu chưa phân loại có `card.subjectId === undefined`). Viết lại chuẩn xác như sau:

   ```
   async getCardsBySubject(subjectId) {
     await this.init();
     const allCards = await this.getAllCards();
     if (!subjectId || subjectId === 'all') {
       return allCards;
     }
     const allDecks = await this.getAllDecks();
     const subjectDeckIds = new Set(
       allDecks
         .filter(d => (d.subjectId || 'subj_unassigned') === subjectId)
         .map(d => d.id)
     );
     return allCards.filter(c => {
       const cardSubj = c.subjectId || 'subj_unassigned';
       return cardSubj === subjectId || subjectDeckIds.has(c.deckId);
     });
   }
   
   ```

2. **Trong `js/app.js` (dòng `1633` — hàm `startSubjectSession(subjectId, mode = 'srs')`):**
   Xóa bỏ dòng `if (!subject) return;` gây liệt nút **`[Ôn cả môn]`** khi đang chọn `"Tất cả môn"` (`'all'`) hoặc `"Chưa phân loại"` (`'subj_unassigned'`):

   ```
   async startSubjectSession(subjectId = null, mode = 'srs') {
     const targetSubjId = subjectId || this.activeDeckSubjectFilter || 'all';
     let subjectName = 'Tất cả môn học';
     if (targetSubjId === 'subj_unassigned') {
       subjectName = 'Chưa phân loại';
     } else if (targetSubjId !== 'all') {
       const subjObj = await db.getSubject(targetSubjId);
       if (subjObj) subjectName = subjObj.name;
     }
   
     let sessionCards = await db.getDueCards(null, targetSubjId === 'all' ? null : targetSubjId);
     let title = `Ôn Tập Môn: ${subjectName}`;
     if (!sessionCards || sessionCards.length === 0) {
       sessionCards = await db.getCardsBySubject(targetSubjId);
       title = `Luyện Tập Môn: ${subjectName}`;
     }
     if (!sessionCards || sessionCards.length === 0) {
       this.showToast(`Môn "${subjectName}" hiện chưa có câu hỏi nào để ôn tập.`, 'warning');
       return;
     }
   
     this._shuffleArray(sessionCards);
     this.activeSession = {
       mode: mode,
       subjectId: targetSubjId,
       deckId: null,
       title: title,
       cards: sessionCards,
       currentIndex: 0,
       score: 0,
       correctCount: 0,
       incorrectCount: 0,
       blindMode: mode === 'blind',
       blindRevealed: false,
       userAnswers: {},
       answeredList: []
     };
     this.navigateTo('study');
     this.renderActiveStudyCard();
   },
   
   ```

3. **Kiểm tra toàn bộ các nút kích hoạt "Ôn theo môn" và "Mode 5" trên toàn ứng dụng:**

   * Nút `#btn-study-entire-subject` / `.btn-study-subject` (`[Ôn cả môn]` ở góc phải thanh lọc môn trong `#view-decks` và trên từng nhóm môn học) phải gọi `App.startSubjectSession(this.activeDeckSubjectFilter || 'all', 'srs')` hoặc `App.startSubjectSession('${s.id}', 'srs')`.

   * Thẻ Mode 5 ở `#view-dashboard` và `#view-decks` phải gọi `App.openTopicPickerModal()`, cho phép chọn **Môn học** (bấm `"Ôn cả môn này"` hoặc chọn từng **Chương** cụ thể) và bắt đầu học ngay lập tức!

### Mục 2.5: Điều Chỉnh Lại Font Chữ Cái Thường / Chữ Đen ở Quote của Mode Trắng Cam (Chữ Thẳng, Không Múa Máy Ở Phần Trên, Hơi Có Chân Nhẹ Ở Dưới; Giữ Nguyên Chữ Cam)

* **Yêu cầu:**

  * Chữ màu cam điểm nhấn (`.hero-title-accent`): **Giữ nguyên 100% như hiện tại**.

  * Chữ màu đen bình thường (`.hero-title-main`, `.hero-title-sub`): Bỏ các font serif có đầu chữ uốn lượn/múa máy rối mắt (như `Playfair Display`). Chuyển sang font chữ đứng thẳng tắp, phần trên gọn gàng tối giản, chỉ hơi có chân nhẹ nhàng ở dưới (giống hệt dòng chữ `"Spatial Designer"` trong Ảnh 1 `image_4515eb.jpg`) bằng font **`'Newsreader'` hoặc `'PT Serif'` / `'Noto Serif'`** ở độ đậm vừa phải (`font-weight: 600 !important`):

  ```
  /* Trong index.html, nạp Google Font: Newsreader:opsz,wght@6..72,500;6..72,600 & PT+Serif:wght@400;700 */
  html[data-theme="white-orange"] .hero-title-main,
  html[data-theme="white-orange"] .hero-title-sub {
    font-family: 'Newsreader', 'PT Serif', 'Georgia', serif !important;
    font-weight: 600 !important; /* Độ dày vừa phải, thanh lịch như "Spatial Designer" ở Ảnh 1, không bị phình đầu chữ */
    font-style: normal !important;
    letter-spacing: -0.025em !important;
    color: #292524 !important;
    text-shadow: none !important;
    filter: none !important;
  }
  
  ```

## PHẦN 3: KHỞI TẠO SƠ ĐỒ KIẾN TRÚC & ĐỒ THỊ LIÊN KẾT TOÀN APP (`docs/ARCHITECTURE_GRAPH.md`) — MỤC 1.14

Để giải quyết triệt để tình trạng *"fix 1 chỗ mà chỗ kia không được link phải tìm rất mất công"*, AI Coding Agent **BẮT BUỘC** quét toàn bộ mã nguồn và tạo file **`docs/ARCHITECTURE_GRAPH.md`** (người dùng sẽ dùng file này làm bản đồ gốc cho các phiên bản tiếp theo).

File `docs/ARCHITECTURE_GRAPH.md` phải bao gồm đầy đủ **4 phần cấu trúc sau**:

1. **Sơ đồ cây Root-to-Branch (Mermaid Graph + Danh mục chi tiết):**

   * Từ `App Root (index.html + js/app.js + js/db.js + css/theme.css + css/style.css)` phân nhánh xuống 9 View chính:

     * `Branch 1: Global Shell (Sidebar .app-sidebar, Mobile Bottom Nav .bottom-nav, Topbar HUD .topbar-hud-capsule, Theme Switcher, Toast & Session Restore Banner)`

     * `Branch 2: #view-dashboard (Hero Quote Stage, 4 Stat Bento Cards, 7 Study Mode Cards, Dashboard Decks Preview Grid)`

     * `Branch 3: #view-decks (Subject Filter Pill Bar, Subject Header Actions [Ôn cả môn / Quản lý], Subject Groups, Deck Cards Grid)`

     * `Branch 4: #view-bank (Search Bar, 4 CyberDropdown Filters [Subject, Topic, Difficulty, Source], Quick Filter Pills [Bookmark, Flag, Review], Virtualized Bank Question Cards)`

     * `Branch 5: #view-study (Quiz Player, Blind Recall Box, Numeric Input Box, Flashcard 3D Player, SRS 2x2 Rating Bar, Explanation Box)`

     * `Branch 6: #view-exam (Mode A: Single Question Player, Mode B: All-Questions LMS Scroll View + Sticky Question Palette)`

     * `Branch 7: #view-import & #view-import-lms (AI Prompt Harness, LMS Raw Parser, Preview Cards List)`

     * `Branch 8: #view-stats & #view-settings (Heatmap, Subject Performance Table, Theme/Wallpaper/Audio/Backup Controls)`

     * `Branch 9: Modal System (8 Modals: #modal-create-subject, #modal-manage-subject, #modal-bulk-reassign-decks, #modal-topic-picker, #modal-exam-setup, #modal-sprint-setup, #modal-edit-card, #modal-session-complete)`

2. **Bảng Ma Trận Liên Kết Component Dùng Chung (Cross-Branch Dependency Matrix):**

   * Liệt kê từng Component dùng chung (`CyberDropdown`, `DeckCard`, `StudyModeCard`, `StatCard`, `SubjectPill`, `ModalBox`, `BookmarkFlagButtons`, `ExplanationBox`) -> Chỉ rõ **mọi vị trí HTML (`dòng số`)**, **mọi hàm JS sinh HTML động hoặc gắn sự kiện (`tên hàm + dòng số`)**, và **mọi block CSS (`dòng số` ở cả Desktop, Mobile `@media`, và Spotlight)** để khi sửa bất kỳ Component nào, Agent phải cập nhật tất cả các nhánh trong bảng!

3. **Đồ Thị Luồng Dữ Liệu & Hành Động (Action -> Handler -> DB -> Render):**

   * Truy vết từng luồng nghiệp vụ từ nút bấm HTML -> hàm xử lý trong `js/app.js` -> hàm truy vấn trong `js/db.js` -> hàm cập nhật giao diện.

4. **Danh Mục Token Thiết Kế Trung Tâm (`css/theme.css` Token Registry):**

   * Liệt kê toàn bộ biến CSS điều phối 3 theme (`purple-pink`, `monochrome`, `white-orange`).

## PHẦN 4: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

AI Coding Agent chỉ được phép kết thúc nhiệm vụ khi kiểm tra và đánh dấu hoàn thành **100% cả 14 tiêu chí dưới đây**:

 1. \[ \] **Xóa Con Trỏ Ô Vuông & Ánh Sáng Tím Dưới Quote (`1.1`, `3.1`):** Đã xóa `#hero-glass-matrix`, `.hero-title-accent::after`, `.hero-card::before`. Trỏ chuột vào khung Quote ở Mode Trắng Đen hoàn toàn không còn ánh tím.

 2. \[ \] **Popup & Sidebar chuẩn Frosted Milky Liquid Glass (`1.2`, `1.4`, `1.5`, `1.6`):** Đã gỡ `transform` / `will-change` trên `.modal-overlay` để `.modal-box` thực sự blur sâu (`blur(44px) saturate(180%)`) và có độ đục trắng sữa/khói mờ đạt chuẩn Ảnh 1 (`image_4515eb.jpg`) & Ảnh 4 (`image_450020.jpg`), chữ tương phản cao, không bị chữ phía sau đâm xuyên qua.

 3. \[ \] **4 Ô Thống Kê Khung Quote (`1.3`, `2.1`):** Đã xóa sạch `01 //`, `02 //`, `03 //`, `04 //`; đồng bộ 1 kiểu thiết kế kính mờ cho cả 3 theme; ở Mode Trắng Cam lúc đầu là kính trắng sữa mờ đục, trỏ vào đổi sang màu cam đào hiện đại.

 4. \[ \] **7 Ô Chế Độ Học & Thẻ Bộ Câu Hỏi ở Mode Trắng Cam (`2.1`, `2.2`):** Lúc đầu là kính trắng kem mờ đục (`opacity ~0.84`, chữ đen nâu sắc nét `#1c1917`), khi trỏ chuột vào thì trở nên trong suốt hơn (`opacity ~0.48`) kèm viền sáng cam.

 5. \[ \] **Xóa Sạch Sắc Tím ở Flashcard, Lời Giải Chi Tiết & Spotlight (`1.7`, `2.3`):** `.flashcard-back`, `.flashcard-exp-toggle-btn`, `.quiz-explanation-box`, `#modal-bulk-reassign-decks` và khối Spotlight dòng `6768–6920` của `css/style.css` đã đồng bộ 100% theo token của từng theme.

 6. \[ \] **Lật Thẻ & Chuyển Câu Mượt Tức Thì (`1.8`):** `rateFlashcard()` ghi DB ngầm không chặn UI và dùng hiệu ứng lướt thẻ (`switching-out` -> `switching-in-start`) mượt 140+ FPS, không bị khựng hay lật ngược lộ câu mới.

 7. \[ \] **Chế Độ Bài Thi 2 Mode (`1.9`):** `#modal-exam-setup` cho phép chọn giữa **(1) Hiện từng câu một** và **(2) Hiện toàn bộ câu hỏi kéo xuống như LMS** (kèm bảng số câu nhảy nhanh và nút Nộp bài).

 8. \[ \] **Bookmark & Flag Tô Đặc Nổi Bật (`1.10`):** Khi câu hỏi được đánh dấu sao hoặc gắn cờ (ở cả màn hình học và Ngân hàng câu hỏi), icon SVG được bôi đặc hoàn toàn (`fill: currentColor !important`) trên nền nút màu vàng hổ phách (`#f59e0b`) / đỏ san hô (`#ef4444`) rõ nét.

 9. \[ \] **Font Input, Textarea & Placeholder Đồng Nhất (`1.11`):** Đã xóa `font-family: var(--font-mono)` khỏi mọi `textarea` / `.form-control`; toàn bộ ô nhập liệu và chữ gợi ý dùng chung 1 font Sans-serif rõ nét, dễ đọc.

10. \[ \] **Dropdown Chuyển Môn & Sửa Lỗi 2 Viền Đổ Bóng (`1.12`, `2.4`):** Đã bỏ việc truyền chuỗi `<svg>` vào `onclick="..."` trong dropdown của Quản lý môn học / Xóa môn / Gộp môn / Gán lại môn; chọn môn đích hoạt động 100% và không còn thanh đen 2 viền lòi ra ngoài.

11. \[ \] **Nút & Chế Độ Ôn Theo Môn Hoạt Động 100% Trên DB Thật (`1.13`):** Đã cập nhật `db.getCardsBySubject()` (lấy cả theo `card.subjectId` lẫn `deck.subjectId`) và `App.startSubjectSession()` (hỗ trợ cả `'all'` và `'subj_unassigned'`), bấm vào học được ngay.

12. \[ \] **Font Chữ Đen Trong Quote ở Mode Trắng Cam (`2.5`):** Đổi sang font chữ thẳng, hơi có chân nhẹ bên dưới (`Newsreader` / `PT Serif` weight 600), không bị múa máy ở phần trên; giữ nguyên chữ màu cam như hiện tại.

13. \[ \] **Sơ Đồ Kiến Trúc Toàn App (`1.14`):** Đã tạo đầy đủ file `docs/ARCHITECTURE_GRAPH.md` mô tả toàn bộ cây cấu trúc, ma trận component dùng chung và luồng dữ liệu của ứng dụng.

14. \[ \] **Tests & Build:** Chạy `npm test` và `npm run build` đạt 100% PASS.