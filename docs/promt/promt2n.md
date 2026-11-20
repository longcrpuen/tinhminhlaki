# ĐẶC TẢ YÊU CẦU ĐỢT 2N (`docs/promt/promt2n.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Ràng buộc giữ nguyên**: `DPR = 1`, khóa cứng `30 FPS`, mật độ cao vi điểm, tương thích PWA Offline.

---

## Nhiệm Vụ 1: Sửa Tận Gốc Lỗi Hoạt Ảnh ASCII Tự Dừng Khi Chưa Click Vào Trang

### Nguyên Nhân Gốc Rễ (Root Cause)
1. Trong `js/app.js` (`setupIdleAndVisibilityListeners`), bộ đếm `idleTimeout = 30000ms` tự gắn class `app-idle` lên `document.body` khi không có thao tác chuột/bàn phím và gọi `window.AsciiBg.syncVisibility()`.
2. Trong `js/ascii-bg.js` (`_isAppActiveForRender`), điều kiện `if (document.body.classList.contains('app-idle')) return false;` khiến `_tick()` gọi `_pauseLoop()`, làm hoạt ảnh ASCII **đứng im hoàn toàn** cho tới khi người dùng click chuột (`pointerdown`).
3. Khi chuyển cảnh (`setScene` / `selectPreset`) hoặc gọi `start()`, vòng lặp `requestAnimationFrame` không hủy triệt để `rafId` cũ, đặt `_scheduleTick()` cuối hàm `_tick()` sau throttle 30 FPS và không reset `_lastRenderMs = 0` nên có nguy cơ chết vòng lặp khi lệch timestamp khung đầu.

### Giải Pháp Triệt Để
- **Xóa bỏ cơ chế pause theo idle cho ASCII**:
  + `js/ascii-bg.js`: `_isAppActiveForRender()` chỉ kiểm tra `document.hidden === false` và `data-theme === 'ascii'`. Tuyệt đối không kiểm tra `app-idle` hay tương tác chuột.
  + `js/app.js`: `setupIdleAndVisibilityListeners()` chỉ gọi `syncVisibility()` khi xảy ra sự kiện `visibilitychange` (tab ẩn `document.hidden === true` thì tạm dừng, tab hiện `document.hidden === false` thì tự chạy tiếp ngay); không gắn `app-idle` khi đang ở theme `ascii`.
- **Vòng lặp RAF bất tử & sạch**:
  + Bổ sung `_cancelLoop()` và `_startLoop()`: luôn gọi `cancelAnimationFrame(this._rafId)` trước khi khởi động vòng lặp mới.
  + Trong `_tick(now)`: gọi `requestAnimationFrame` **ngay đầu vòng lặp**, hoàn toàn độc lập với điều kiện throttle 30 FPS (`now - this._lastRenderMs >= CONFIG.FRAME_INTERVAL_MS || elapsed < 0`).
  + Trong `start()`, `setScene()`, `selectPreset()`, `syncVisibility()`: reset sạch `_lastRenderMs = 0`, `_lastTickMs = 0` và đảm bảo gọi `_startLoop()`.

---

## Nhiệm Vụ 2: Thêm Hoạt Ảnh Thứ 3 — Hiệp Sĩ Mèo Áo Choàng Bay (`cat`)

### 1. Tài Nguyên & PWA Cache
- Lưu ảnh gốc vào `assets/cat-knight.jpg` (736×955).
- Bổ sung `./assets/cat-knight.jpg` vào `STATIC_ASSETS` trong `sw.js` (nâng cache lên `mindsparks-v4.15.1`).
- Bổ sung thư mục `assets` và kiểm tra đầu ra `assets/cat-knight.jpg` trong `scripts/build.js`.

### 2. Kiến Trúc Tách Nền 1 Lần & Phân Vùng Mask (`buildCatKnightFromRGBA`)
- Khi khởi tạo engine, nạp `assets/cat-knight.jpg` 1 lần duy nhất qua offscreen `<canvas>` kích thước **140 × 182** (`CAT_W × CAT_H`, đúng tỷ lệ ảnh gốc).
- Tách bỏ toàn bộ vùng nền sương mù xám lam (`B - R > 7 && lum > 145`) và cỏ xa hậu cảnh, phân loại từng pixel vào 5 lớp mask:
  + `CAT_MASK.BODY (1)`: Thân mèo, gương mặt, nơ hồng, bộ giáp bạc, găng tay, ủng, đuôi.
  + `CAT_MASK.SWORD (2)`: Thanh kiếm bạc dựng đứng & chắn kiếm ngang.
  + `CAT_MASK.CAPE (3)`: Áo choàng trắng kem bay dài sang trái kèm bản đồ `reach ∈ [0, 1]` từ cổ áo ra đuôi áo.
  + `CAT_MASK.GRASS (4)`: Lớp cỏ mảnh tự nhiên dưới chân hiệp sĩ.
  + `CAT_MASK.EYE (5)`: Hai mắt tròn đen của chú mèo phục vụ chớp mắt định kỳ.
- Dự phòng `buildProceduralCatKnight(140, 182)` cho khung đầu trước khi ảnh giải mã xong và kiểm thử headless Node.

### 3. Hiệu Ứng Chuyển Động Sống Động (30 FPS, nhẹ CPU, 20 giây/chu kỳ)
- **Camera Zoom-Out điện ảnh (`0.0s → 6.5s`)**: Mở đầu zoom cận gương mặt chú mèo (`zoom = 2.55`, mở dần theo vòng sáng tròn) rồi kéo lùi mượt theo đường cong bậc 3 ra toàn thân cầm kiếm trên nền cỏ (`zoom = 1.00`).
- **Áo choàng bay phần phật theo gió (`MASK_CAPE`)**: Sóng sin đa tần số kết hợp gió giật (`gust`) dịch chuyển ngược tọa độ mẫu `(capeDx, capeDy)` với biên độ tăng theo `reach^1.35` từ cổ ra đuôi áo, kèm tạo bóng nếp vải động (`capeFoldShade`).
- **Cỏ dưới chân đung đưa (`MASK_GRASS`)**: Đung đưa đồng pha với chiều gió từ phải sang trái (`grassDx`), gốc cỏ giữ cố định, ngọn cỏ lắc mạnh nhất.
- **Chớp mắt định kỳ (`MASK_EYE`)**: Cứ mỗi ~4.0 giây (`2.6s, 6.6s, 10.6s, 14.6s`), đôi mắt khép nhẹ `0.16s` hòa vào màu mí lông kem ấm.
- **Vệt sáng lóe chạy dọc lưỡi kiếm bạc (`MASK_SWORD`)**: Định kỳ mỗi ~4.2 giây (`4.5s, 8.7s, 12.9s, 16.4s`), dải ánh sáng bạc quét dọc từ chuôi lên mũi kiếm.
- **Pha biến mất mượt theo gió (`17.2s → 19.85s`)**: Các hạt ASCII tách dần từ đuôi áo choàng bên trái lan qua toàn thân, hóa thành bụi sáng bạc-vàng bay tạt theo gió sang trái rồi tan sạch về `#000000` (`0` ký tự, `isDone = true`).

### 4. Tích Hợp Scene Manager & UI
- `SCENES.cat` (`Hiệp sĩ Mèo`, `duration: 20.0s`), cập nhật `SCENE_ORDER = ['tree', 'gargantua', 'cat']` để Slideshow tự động luân chuyển **Cây thông → Hố đen → Hiệp sĩ Mèo**.
- Đặt chú mèo tại vùng trống bên phải desktop (`cx = cols * 0.72`), giảm sáng dịu nếu bụi gió tạt qua nửa trái chứa chữ UI.
- Bổ sung nút chọn `🐱 Hiệp sĩ Mèo` vào cả popover trên top bar (`index.html`), thanh cài đặt Settings (`index.html`) và bộ điều khiển đồng bộ (`js/app.js`).

---

## Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,254 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công PWA Offline (bao gồm `dist/assets/cat-knight.jpg`).
3. Hoạt ảnh chạy liên tục không cần click chuột, chỉ tạm dừng khi tab ẩn và tự chạy tiếp ngay khi quay lại tab.
