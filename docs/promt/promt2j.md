# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2J (`docs/promt/promt2j.md`)
## Audit Hiệu Năng & Kiến Trúc — Đợt 2 (Khoảng Cách Lofi Bar + Mục #4, #7, #9)

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2j.md`  
> **Phạm vi tác động**: `css/style.css`, `css/theme.css`, `index.html`, `js/app.js`, `js/db.js`, `tests/test-runner.js`, `ARCHITECTURE_GRAPH.md`, `docs/ARCHITECTURE_GRAPH.md`.  
> **Giới hạn an toàn bắt buộc**: KHÔNG thực hiện đại tu xóa hàng loạt `!important` trong CSS (mục `#11`) để bảo toàn tuyệt đối giao diện 3 theme (`violet-rose`, `monochrome`, `white-orange`).

---

## 1. MỤC TIÊU & PHẠM VI 4 HẠNG MỤC ĐỢT 2

1. **Căn chỉnh khoảng cách thanh nhạc nền Lofi Bar (`css/theme.css`, `css/style.css`)**:
   - Khắc phục triệt để việc reset toàn cục `*:not(.katex, .katex *) { margin: 0; padding: 0; }` ghi đè `.hero-lofi-bar` (cùng specificity `(0,1,0)` nhưng `style.css` nạp sau `theme.css`).
   - Nâng specificity bằng `.hero-heading-scrim #hero-lofi-bar.hero-lofi-bar` (`margin: 12px 0 18px 0; padding: 8px 16px;` trên desktop; `10px 0 16px 0; padding: 6px 12px;` tại `@media (max-width: 640px)`), tạo khoảng thở `16px–18px` giữa thanh Lofi Bar và hàng 3 nút `.hero-actions` đồng đều trên cả 3 theme và mobile mà không lạm dụng `!important`.

2. **#4 — Loại bỏ Double/Triple Execution khi click tab & đóng modal (`index.html`, `js/app.js`)**:
   - Thống nhất 1 cơ chế điều hướng duy nhất: xóa `onclick="App.navigateTo(...)"` trùng lặp ở 7 thẻ `<button>` con bên trong `<ul class="nav-list">`, và cho listener `[data-view]` trong `setupEventListeners()` bỏ qua các phần tử đã có attribute `onclick` (tránh gọi `navigateTo()` 2–3 lần trên mỗi cú click). Bảo toàn `data-view="dashboard" onclick="App.navigateTo('dashboard')"` trên `<li class="nav-item">` và `<button class="bottom-nav-item">` theo hợp đồng test.
   - Thống nhất 1 cơ chế đóng modal duy nhất trong listener capture-phase trên `document`: xóa vòng lặp per-element `.modal-close` và `.modal-overlay` dư thừa trong `setupEventListeners()`, gỡ 4 `onclick="App._closeModal(...)"` dư thừa trong `#modal-confirm-delete-deck` & `#modal-suggest-merge-subjects`, thêm `e.preventDefault(); e.stopPropagation();`, xử lý dọn `#lightbox-image` và giữ biến `overlay` cho `#modal-session-complete` tương thích ngược với Test Suite hiện có.

3. **#7 — Giảm DOM Reflow, bỏ `renderMath()` thừa & tối ưu cuộn/resize (`js/app.js`, `css/style.css`)**:
   - Gỡ 8 lời gọi `this.renderMath(...)` dư thừa ngay sau các container đã đi qua `formatRichText()` (vẫn giữ `renderMath()` ở `renderLmsPreview()` và `toggleEditCardPreview()`).
   - Nâng cấp `adaptOptionsLayout(container)` (giữ nguyên header `adaptOptionsLayout(container) {`): đọc hint `arguments[1]` hoặc `container.dataset.hasWideOption`, chỉ serialize `innerHTML` với mock DOM không có `nodeType`, dùng selector nhẹ (`table.md-table, pre, annotation`) trên DOM thật; gắn `data-has-wide-option` tại `_renderOptionsBlock()`, `renderExamQuestion()`, và `_generateBankCardHtml()`.
   - Debounce `window.resize` (`150ms`), gộp 2 listener `scroll` thành 1 listener `{ passive: true }` có cache `.app-topbar` và biến trạng thái `isTopbarScrolled`.
   - Gộp hiệu ứng float-up các card lô đầu ở Bank vào 1 `requestAnimationFrame` duy nhất (gỡ rAF tách lẻ trên từng card).
   - Chuyển thanh đếm ngược `startPerQuestionTimer()` sang GPU-composited `transform: scaleX(0)` qua `_perQTimerRafId`, loại bỏ `void bar.offsetWidth` và `width !important` trên `.per-q-timer-fill`.

4. **#9 — Hợp nhất RAM cache & cập nhật in-place trong `js/db.js`**:
   - Hợp nhất `_cardsCache`/`_decksCache`/`_subjectsCache` thành getter/setter alias trỏ trực tiếp tới `this._memCache` (bảo toàn tên thuộc tính tương thích test).
   - Cho `getAllSubjects()`, `getAllDecks()`, `getAllCards()` trả shallow copy (`.slice()`) để caller như `_shuffleArray()` không làm bẩn RAM cache.
   - Cho `saveCard()`, `saveCardsBatch()`, và `deleteCard()` cập nhật in-place trên `_memCache.cards` (chỉ khi cache đang ấm và không chuyển sang fallback sync localStorage) thay vì xóa trắng cache buộc đọc lại toàn bộ IndexedDB; đồng bộ `_bumpRevision()` với `invalidateSubjectCache()`.

---

## 2. TIÊU CHÍ NGHIỆM THU
- `node tests/test-runner.js` đạt 100% PASS (bao gồm Test Suite 41 bảo vệ Wave 2j).
- `node scripts/build.js` chạy thành công 100% (`exit 0`) và sinh `CACHE_NAME` gắn hash + timestamp trong `dist/sw.js`.
- Cập nhật đồng bộ `ARCHITECTURE_GRAPH.md` & `docs/ARCHITECTURE_GRAPH.md` sang Phase 2j và hoàn thiện `docs/progress/progress2j.md`.
