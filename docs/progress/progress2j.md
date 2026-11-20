# TIẾN ĐỘ THỰC HIỆN ĐỢT 2J (`docs/progress/progress2j.md`)
> **File đặc tả gốc**: `docs/promt/promt2j.md`  
> **Mục tiêu**: Căn chỉnh khoảng cách thanh nhạc nền Lofi Bar và triển khai 3 hạng mục hiệu năng Đợt 2 (`#4`, `#7`, `#9`) từ báo cáo audit, giữ nguyên các `!important` của hệ thống 3 theme (`#11`).

---

## Checklist Tiến Độ

- [x] **Lofi Bar Spacing — Khoảng cách Lofi Bar trên Desktop & Mobile (`css/theme.css`, `css/style.css`)**
  - [x] `css/theme.css`: Mở rộng selector thành `.hero-lofi-bar, .hero-heading-scrim #hero-lofi-bar.hero-lofi-bar` (`margin: 12px 0 18px 0; padding: 8px 16px;` desktop và `10px 0 16px 0; padding: 6px 12px;` ở `@media (max-width: 640px)`), thắng specificity `(0,1,0)` của reset toàn cục ở `css/style.css#L17`.
  - [x] `css/style.css`: Bổ sung block spacing đồng nhất dưới `.hero-heading-scrim #hero-lofi-bar.hero-lofi-bar` và `.hero-heading-scrim .hero-actions` cho cả 3 theme (`violet-rose`, `monochrome`, `white-orange`).

- [x] **#4 — Single-Fire Điều Hướng & Đóng Modal (`index.html`, `js/app.js`)**
  - [x] `index.html`: Gỡ `onclick="App.navigateTo(...)"` trùng lặp ở 7 `<button>` con trong `<ul class="nav-list">`, giữ nguyên `onclick` ở `<li data-view>` và `.bottom-nav-item`; gỡ 4 `onclick="App._closeModal(...)"` dư thừa trong `#modal-confirm-delete-deck` & `#modal-suggest-merge-subjects`.
  - [x] `js/app.js`: Listener `[data-view]` trong `setupEventListeners()` bỏ qua phần tử đã có `onclick`; xóa 2 vòng lặp per-element `.modal-close` và `.modal-overlay` dư thừa; bổ sung `e.preventDefault(); e.stopPropagation();` và dọn `#lightbox-image` trong capture-phase listener duy nhất (giữ biến `overlay` cho kiểm tra `#modal-session-complete`).

- [x] **#7 — Giảm Reflow, Bỏ `renderMath()` Thừa, Scroll/Resize & ScaleX Timer (`js/app.js`, `css/style.css`)**
  - [x] Gỡ 8 lời gọi `this.renderMath(...)` dư thừa sau `formatRichText()` (giữ lại `renderLmsPreview()` và `toggleEditCardPreview()`).
  - [x] `adaptOptionsLayout(container)`: đọc hint `arguments[1]` hoặc `container.dataset.hasWideOption`, kiểm tra selector nhẹ `.md-table, pre, annotation` thay vì serialize `innerHTML` trên DOM thật; gắn sẵn `data-has-wide-option` tại `_renderOptionsBlock()`, `renderExamQuestion()` và `_generateBankCardHtml()`.
  - [x] Debounce `window.resize` (`150ms`) và gộp 2 `scroll` listener thành 1 listener `{ passive: true }` có cache `.app-topbar` + cờ `isTopbarScrolled`.
  - [x] Gộp batch reveal ban đầu của View Bank thành 1 `requestAnimationFrame` duy nhất (`initialRevealEls`), bỏ `rAF` rời rạc cho từng card.
  - [x] Chuyển `startPerQuestionTimer()` + `.per-q-timer-fill` (`css/style.css`) từ animate `width` + `void bar.offsetWidth` sang `transform: scaleX(0)` qua `_perQTimerRafId` (`clearPerQuestionTimer()` hủy rAF an toàn).

- [x] **#9 — Hợp Nhất RAM Cache & Cập Nhật In-Place (`js/db.js`)**
  - [x] Hợp nhất `_cardsCache`/`_decksCache`/`_subjectsCache` thành getter/setter alias trỏ vào `_memCache`; `_bumpRevision()` ủy quyền `invalidateSubjectCache()`.
  - [x] `getAllSubjects()`, `getAllDecks()`, `getAllCards()` trả shallow copy (`.slice()`) tránh caller bên ngoài mutate bẩn cache.
  - [x] `saveCard()`, `saveCardsBatch()` và `deleteCard()` cập nhật in-place mảng `_memCache.cards` thay vì xóa trắng buộc đọc lại IndexedDB; giữ `_memCache.revision` đồng bộ ở `logReview()`.

- [x] **Kiểm thử, Đóng gói & Tài liệu**
  - [x] Bổ sung Test Suite 41 vào `tests/test-runner.js` (bao gồm runtime check shallow-copy & in-place `saveCard()`).
  - [x] `node tests/test-runner.js` $\rightarrow$ **908 passed, 0 failed (100% PASS)**.
  - [x] `node scripts/build.js` $\rightarrow$ **Thành công (99 files, 4.62 MB, `CACHE_NAME` = `mindsparks-v4.15.0-150f30e9-202611200645`)**.
  - [x] Cập nhật đồng bộ `ARCHITECTURE_GRAPH.md` & `docs/ARCHITECTURE_GRAPH.md` sang Phase 2j và tạo cặp `docs/promt/promt2j.md` + `docs/progress/progress2j.md`.
