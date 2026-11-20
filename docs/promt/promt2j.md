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

---

# ĐẶC TẢ YÊU CẦU ĐỢT 2J (`docs/promt/promt2j.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. Viết lại hàm render Hố đen Gargantua trong `js/ascii-bg.js` bám sát 100% thuật toán `py art.py` từ video gốc (không tự chế công thức ellipse mỏng, không dùng vòng tròn đen xóa đè lên nửa trước của đĩa bồi tụ).
> 2. Cài đặt chính xác các hàm toán học của `art.py`: `gas(phi, rho, t, w)`, `accretion_disk(X, Y, t, w, inc)`, `lensed_halo(r, ang, t, w)`.
> 3. Cài đặt các pha chuyển động camera `cam`, `zoom`, `inc`, `flash` tại `FLASH = 8.2s`, hòa trộn Screen Blend và che khuất 3D chuẩn (`front_side = v > 0` đè cắt ngang qua bóng đen chân trời sự kiện).
> 4. Ký tự xoáy theo 4 level (`..::--~~,,;;`, `--==++//\\||`, `++**##%%xxoo`, `##%%@@$$&&88`) và bảng màu nhiệt ấm dịu (`rgb(115, 48, 24)` → `rgb(175, 88, 42)` → `rgb(225, 148, 78)` → `rgb(250, 215, 155)`).
> 5. Pha kết thúc Galaxy Impact (Supernova Burst) tại `t = 16.5 .. 19.5s` với lực hút xoáy co tụ vào tâm và phát nổ sóng xung kích trước khi tắt hẳn về `#000000` và chuyển cảnh Slideshow.

---

## 1. Chi Tiết Thuật Toán Toán Học `art.py`

### 1.1. Hằng số & Hệ tọa độ chuẩn hóa
- Tâm hố đen: `cx = cols * 0.70`, `cy = rows * 0.48`.
- Quy đổi ô `(col, row)` sang `(X, Y)` chuẩn hóa theo tỷ lệ `cellW / cellH` và `rows * 0.5`.
- Hằng số: `R0 = 0.24`, `R_IN = 1.0 * R0`, `R_OUT = 3.8 * R0`, `TILT = -0.23`, `INC = 0.22`, `FLASH = 8.2`, `GARG_DURATION = 19.5`.
- Chuyển động camera quanh thời điểm `FLASH`:
  ```js
  const cam = smooth(smooth((t - FLASH + 0.3) / 2.6));
  const zoom = 1 + 0.28 * cam;
  const inc = INC + 0.09 * cam;
  const Xc = X / zoom;
  const Yc = (Y + 0.02 * cam) / zoom;
  const r = Math.hypot(Xc, Yc);
  const ang = Math.atan2(Yc, Xc);
  const flash = Math.exp(-Math.pow((t - FLASH) / 0.22, 2));
  ```

### 1.2. Hàm vân khí xoáy `gas(phi, rho, t, w)`
```js
const lr = Math.log(Math.max(rho, 1e-4) / R_IN);
const phase = phi + 2.6 * lr - w * 1.8;
const rings = 0.55 + 0.45 * Math.sin(lr * 14.0 - w * 0.8);
const spiral = 0.6 + 0.4 * Math.sin(phase * 2.0 + Math.sin(lr * 8.0 + w));
const fine = 0.7 + 0.3 * Math.cos(phi * 5.0 - lr * 18.0 + w * 2.2);
const streak = Math.pow(rings * spiral * fine, 0.85);
return { streak, phase, lr };
```

### 1.3. Hàm đĩa bồi tụ `accretion_disk(X, Y, t, w, inc)`
```js
const u = X * Math.cos(TILT) + Y * Math.sin(TILT);
const v = -X * Math.sin(TILT) + Y * Math.cos(TILT);
const rho = Math.hypot(u, v / inc);
const phi = Math.atan2(v / inc, u);
const { streak, phase, lr } = gas(phi, rho, t, w);
const edge = smooth((rho - R_IN) / (0.25 * R0)) * smooth((R_OUT - rho) / (0.45 * R_OUT));
let heat = 1.5 * edge * streak * (R_IN / Math.max(rho, 1e-4));
heat *= 1 - 0.25 * (u / Math.max(rho, 1e-6));
return { heat, u, v, rho, phi, phase, lr };
```

### 1.4. Hàm thấu kính hấp dẫn `lensed_halo(r, ang, t, w)`
```js
const top = 0.5 - 0.5 * Math.sin(ang - TILT);
const side = Math.pow(Math.abs(Math.cos(ang - TILT)), 10);
const out = Math.max(r - 1.1 * R0, 0);
const band = Math.exp(-Math.pow(out / (0.2 * R0 + 0.24 * R0 * top + 0.45 * R0 * side), 2));
const rhoHalo = (1 - side) * (R_IN + Math.max(r - 1.0 * R0, 0) * 2.6) + side * r;
const { streak: flow } = gas(ang - TILT, rhoHalo, t, w);
const halo = 1.2 * band * flow * (0.5 + 0.8 * top) * (1 - 0.25 * Math.cos(ang - TILT));
return halo;
```

### 1.5. Screen Blend & Che khuất 3D chuẩn
```js
let soft = 1 - (1 - clamp(aura * 0.55, 0, 1)) * (1 - clamp(haloScaled, 0, 1));
soft = Math.max(soft, disk, haloScaled);
let heat = Math.max(ring * (0.9 + 0.3 * smooth((t - 5) / 2)), soft, shock * 0.9);
heat *= (1 + 1.4 * flash);

const inside = r < R0 * 0.97;
const front_side = v > 0; // nửa trước của đĩa nghiêng băng qua trước mặt lỗ đen
if (inside && !front_side) {
  heat = 0.0; // bóng đen chỉ che nửa đĩa phía sau
} else if (inside && front_side) {
  heat = disk > 0.2 ? disk : 0.0; // dải đĩa phía trước đè cắt ngang qua bóng đen!
}
```

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,215 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline.
3. Đo đạc thực tế số lượng `letters` trung bình và `frame time (ms)`.
