# TIẾN ĐỘ THỰC HIỆN ĐỢT 2N (`docs/progress/progress2n.md`)
> **Nhánh**: `feat/ascii-tree`  
> **Thời điểm hoàn thành**: 2026-11-20  
> **Trạng thái**: Hoàn tất 100% mục tiêu Đợt 2n

---

## 1. Kết Quả Thực Hiện

| Hạng mục | Trạng thái | Chi tiết triển khai |
| :--- | :---: | :--- |
| **Nhiệm vụ 1: Root-Cause Fix lỗi tự dừng ASCII khi chưa click** | Hoàn thành | Xóa hoàn toàn kiểm tra `app-idle` trong `AsciiBg._isAppActiveForRender()` và ngừng pause ASCII trong `App.setupIdleAndVisibilityListeners()`. Bổ sung `_cancelLoop()` / `_startLoop()` (luôn `cancelAnimationFrame` trước khi tạo loop mới), gọi `requestAnimationFrame` đầu `_tick()` độc lập với throttle 30 FPS và reset `_lastRenderMs = 0` khi đổi cảnh/resume. Chỉ tạm dừng khi `document.hidden === true` và tự resume ngay khi `document.hidden === false`. |
| **Nhiệm vụ 2.1: Lưu tài nguyên & PWA Cache** | Hoàn thành | Lưu `assets/cat-knight.jpg` (736×955), thêm `./assets/cat-knight.jpg` vào `STATIC_ASSETS` trong `sw.js` (`mindsparks-v4.15.1`), cập nhật `scripts/build.js` sao chép `assets/` sang `dist/assets/` và kiểm định file đầu ra. |
| **Nhiệm vụ 2.2: Tách nền 1 lần & Phân vùng 5 Mask** | Hoàn thành | Đọc `assets/cat-knight.jpg` 1 lần duy nhất qua offscreen `<canvas>` `140×182`, tách sạch nền sương mù xám lam và cỏ xa, giữ sắc nét `BODY`, `SWORD`, `CAPE` (kèm `reach`), `GRASS` và `EYE`, kèm fallback `buildProceduralCatKnight` không gây khung trống. |
| **Nhiệm vụ 2.3: Chuyển động sống động 30 FPS** | Hoàn thành | Hoàn thiện: Camera Zoom-Out (`0s–6.5s`, zoom `2.55 → 1.00`), áo choàng bay sóng sin đa tần + bóng nếp vải động, cỏ dưới chân đung đưa đồng pha gió, chớp mắt mỗi `4.0s` (`0.16s`), tia sáng lóe chạy dọc lưỡi kiếm bạc mỗi `4.2s`, và pha tan biến thành bụi gió bay sang trái (`17.2s–19.85s` về `0` ký tự, `isDone = true`). |
| **Nhiệm vụ 2.4: Tích hợp Slideshow 3 cảnh & UI** | Hoàn thành | Cập nhật `SCENE_ORDER = ['tree', 'gargantua', 'cat']`, thêm nút `🐱 Hiệp sĩ Mèo` vào popover topbar và thanh Settings trong `index.html`, đồng bộ `cycleAsciiScene()` / `syncAsciiSceneUI()` trong `js/app.js`. Đặt chú mèo bên phải desktop (`cx = 0.72`) với tông màu bạc-ấm dịu mắt. |

---

## 2. Kết Quả Đo Đạc Hiệu Năng & Kiểm Thử

### 2.1. Hiệu năng Cảnh Hiệp sĩ Mèo tại Desktop `1440×900` (`DPR = 1`, khóa `30 FPS`)
- Mở đầu Zoom-In gương mặt (`t = 1.5s`): **18,607 ký tự**, **8.92 ms/frame**.
- Đang kéo lùi camera (`t = 3.5s`): **13,573 ký tự**, **5.21 ms/frame**.
- Toàn thân oai phong + áo choàng bay + kiếm lóe + chớp mắt (`t = 6.6s – 12.0s`): **5,951 – 6,007 ký tự**, **5.82 – 6.61 ms/frame**.
- Tan biến thành bụi gió (`t = 18.5s – 19.3s`): **4,913 → 3 ký tự**, **1.58 – 3.47 ms/frame**.
- Kết thúc sạch (`t = 19.85s`): **0 ký tự**, `isDone = true`, **0.41 ms**.

### 2.2. Kiểm thử tự động (`node tests/test-runner.js`)
- Tổng số test case: **1,254 passed, 0 failed** (100% pass).
- Đã bổ sung kiểm thử mô phỏng thực tế vòng lặp RAF (`_tick`, `_startLoop`, `cancelAnimationFrame`, `app-idle`, `document.hidden`) và kiểm thử trọn vòng đời Scene 3 (`cat`).

### 2.3. Đóng gói sản phẩm (`node scripts/build.js`)
- Xác thực cú pháp toàn bộ JS: **100% Passed**.
- Đóng gói đầy đủ **101 assets** (bao gồm `dist/assets/cat-knight.jpg`), sẵn sàng PWA Offline.

---

## 3. Các Tệp Tin Đã Chỉnh Sửa & Bổ Sung
1. `assets/cat-knight.jpg`: Ảnh gốc Hiệp sĩ Mèo áo choàng bay.
2. `js/ascii-bg.js`: Root-cause fix vòng lặp RAF + Scene 3 `cat` (`buildCatKnightFromRGBA`, `buildProceduralCatKnight`, `renderCatKnightToBuffer`, `_loadCatKnightAsset`, `SCENE_ORDER` 3 cảnh).
3. `js/app.js`: Bỏ pause ASCII theo idle + bổ sung điều khiển UI cảnh `cat`.
4. `index.html`: Bổ sung tùy chọn `🐱 Hiệp sĩ Mèo` trong popover topbar và Settings.
5. `sw.js`: Thêm `./assets/cat-knight.jpg` vào cache PWA (`mindsparks-v4.15.1`).
6. `scripts/build.js`: Sao chép thư mục `assets/` và xác nhận `dist/assets/cat-knight.jpg`.
7. `tests/test-runner.js`: Bổ sung 22 test mới xác minh cả 2 nhiệm vụ Đợt 2n.
8. `docs/promt/promt2n.md` & `docs/progress/progress2n.md`: Hồ sơ đặc tả & tiến độ Đợt 2n.
