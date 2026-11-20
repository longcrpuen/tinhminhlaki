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

---

# TIẾN ĐỘ THỰC HIỆN ĐỢT 2J (`docs/progress/progress2j.md`)
> **File đặc tả gốc**: `docs/promt/promt2j.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Viết lại renderer Hố đen Gargantua theo 100% thuật toán `py art.py` từ video gốc (hàm vân khí `gas()`, đĩa bồi tụ `accretion_disk()`, thấu kính Einstein `lensed_halo()`, chuyển động camera quanh `FLASH = 8.2s`, che khuất 3D nửa trước đĩa đè qua bóng đen, bảng ký tự 4 cấp độ và bảng màu nhiệt ấm dịu).

---

## Checklist Tiến Độ

- [x] **1. Cài đặt các hàm toán học cốt lõi từ `art.py`**
  - [x] Hàm `smooth(x)`: `clamp(x, 0, 1)` kết hợp Hermite interpolation `x * x * (3 - 2 * x)`.
  - [x] Hàm vân khí xoáy `gas(phi, rho, t, w)`: kết hợp vòng đồng tâm logarit `rings`, xoắn ốc kép `spiral` và vi sợi `fine`.
  - [x] Hàm đĩa bồi tụ `accretion_disk(X, Y, t, w, inc)`: xoay nghiêng `TILT = -0.23`, nén trục độ nghiêng `v / inc`, suy giảm biên `edge`, nhân tỷ lệ bán kính trong `R_IN / rho` và hiệu ứng Doppler beaming tương đối tính.
  - [x] Hàm thấu kính hấp dẫn Einstein `lensed_halo(r, ang, t, w)`: phân tách nửa trên/dưới `top`, nối liền hai bên hông `side = cos(ang - TILT)^10` với bán kính ảo `rhoHalo`.

- [x] **2. Camera & Các pha tiến trình**
  - [x] Chuyển động camera mượt quanh `FLASH = 8.2s`: `cam`, `zoom = 1 + 0.28 * cam`, `inc = INC + 0.09 * cam`, bù tâm dọc `Yc = (Y + 0.02 * cam) / zoom`.
  - [x] Pha 1 (Vành photon `ring`): vẽ vòng tròn tiếp tuyến tại `r ≈ 1.02 * R0` theo góc quay `around`.
  - [x] Pha 2 (Vầng hào quang `aura`): mở rộng tỏa nhiệt quanh lỗ đen.
  - [x] Pha 3 (Đĩa bồi tụ + thấu kính + sóng shockwave): mở rộng khẩu độ `span`, phóng đại thấu kính `haloScale`, bùng nổ sóng shockwave tại `t > FLASH`.

- [x] **3. Hòa trộn Screen Blend & Che khuất 3D chuẩn**
  - [x] Áp dụng công thức Screen Blend: `soft = 1 - (1 - aura * 0.55) * (1 - halo)`.
  - [x] Che khuất 3D thực tế: nửa trước đĩa `front_side = v > 0` đè cắt ngang qua bóng đen chân trời sự kiện `inside = r < R0 * 0.97`; nửa sau đĩa `v <= 0` bị che khuất hoàn toàn về `#000000`.

- [x] **4. Ký tự xoáy & Màu sắc nhiệt ấm dịu**
  - [x] Mở rộng bảng `ALL_GLYPHS` và bộ tạo pixel fallback hỗ trợ đầy đủ ký tự của 4 cấp độ:
    + Cấp 0: `..::--~~,,;;`
    + Cấp 1: `--==++//\\||`
    + Cấp 2: `++**##%%xxoo`
    + Cấp 3: `##%%@@$$&&88`
    + Tiếp tuyến photon ring: `- / | \`
  - [x] Bảng màu nhiệt chuyển tiếp mượt mà:
    + `heat < 0.20`: nâu đỏ trầm `rgb(115, 48, 24)`
    + `heat < 0.45`: cam đất ấm `rgb(175, 88, 42)`
    + `heat < 0.75`: vàng cam hổ phách `rgb(225, 148, 78)`
    + `heat >= 0.75`: kem vàng ấm `rgb(250, 215, 155)`
  - [x] Nhân hệ số dịu mắt `0.78` tại nửa trái màn hình (phía sau khối text hero).

- [x] **5. Pha kết thúc Galaxy Impact (Supernova Burst)**
  - [x] `t = 16.5 .. 17.5s`: Co xoáy toàn bộ đĩa vào tâm điểm kỳ dị (singularity).
  - [x] `t = 17.5 .. 19.5s`: Phát nổ sóng xung kích tròn, tia sáng 4 hướng và bụi sao văng ra trước khi tắt hẳn về 0 và báo `isDone = true` chuyển cảnh Slideshow.

- [x] **6. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,215 passed, 0 failed** (100% test suites).
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, hoàn tất đóng gói Offline PWA.

---

## Báo Cáo Đo Đạc Hiệu Năng & Ký Tự Thực Tế
*(Thực hiện bằng benchmark 60 frames trên màn hình Desktop chuẩn 1440×900, lưới điểm ảnh ASCII vi mô 5×8px, DPR = 1)*

| Cảnh hoạt ảnh | Số lượng ký tự trung bình (`letters`) | Thời gian dựng hình trung bình (`frame time`) | Đánh giá hiệu năng |
| :--- | :--- | :--- | :--- |
| **🌲 Cây thông Noel 3D** (`tree`) | **5,505 letters** | **4.19 ms / frame** | Tiêu tốn ~11.7% ngân sách 35.7 ms (28 FPS) |
| **🕳️ Hố đen Gargantua (`art.py`)** | **3,055 letters** | **9.64 ms / frame** | Tiêu tốn ~27.0% ngân sách 35.7 ms (28 FPS) |

> **Nhận xét**: Cảnh Hố đen Gargantua được render bám sát 100% công thức `art.py`, thể hiện trọn vẹn dải đĩa nghiêng trước đè qua bóng đen, các vòng khí xoắn ốc tinh tế và màu cam đất ấm dịu mắt, đồng thời giữ tốc độ xử lý dưới 10 ms/frame, bảo đảm độ mượt mà tuyệt đối cho toàn bộ ứng dụng.
