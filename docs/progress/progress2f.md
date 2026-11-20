# TIẾN ĐỘ THỰC HIỆN ĐỢT 2F (`docs/progress/progress2f.md`)
> **File đặc tả gốc**: `docs/promt/promt2f.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Xây dựng theme thứ 4 `ascii` với nền cây thông Noel ASCII 3D (`js/ascii-bg.js`) bám sát video `ok.mp4` (`agac.py`), bổ sung góc nhìn 20°, sóng đèn LED/kim tuyến domino, pha tan rã lặp chu kỳ, tối ưu `DPR = 1` ở 28 FPS, đồng thời bảo toàn 100% 3 theme hiện tại.

---

## Checklist Tiến Độ

- [x] **1. Khởi tạo nhánh `feat/ascii-tree` từ `main`**
  - [x] Tạo nhánh `feat/ascii-tree` sạch từ `main` (`b038081`).

- [x] **2. Xây dựng Engine cây thông ASCII 3D (`js/ascii-bg.js`)**
  - [x] Tái hiện hình học & tỷ lệ `agac.py` với mật độ điểm cao (~242,711 điểm): `Y0 = 0.42`, `Y1 = 2.55`, `envelope(y)`, `fib(n)`, 26 tầng cành (`NEEDLE`), tuyết đỉnh (`SNOWCAP`), thân cây vỏ sần (`TRUNK`), 3.6 vòng kim tuyến rủ (`2600 × 5` điểm `GARLAND`), 44 quả châu bóng (`BALL`, `fib(144)`), 170 bóng đèn (`LIGHT`, `fib(22)`), ngôi sao vát 3D + quầng sáng (`STAR`), 5 hộp quà thắt nơ (`GIFT`, `RIBBON`) và mặt sàn chấm tròn đồng tâm (`GROUND`) + 160 sao đêm.
  - [x] Tái hiện pha mọc phát sáng trắng từ tâm sàn & từ thân cây lan ra ngọn cành (`t0`).
  - [x] Điều chỉnh #1: Góc nhìn camera chéo từ trên xuống `20°` (`CAMERA_PITCH_DEG = 20`), tâm chiếu desktop `cx = 0.74`, tỷ lệ phóng lớn hơn ~18% (`focal = min(height * 1.13, width * 0.82)`).
  - [x] Điều chỉnh #2: Dải kim tuyến & 170 đèn LED chạy sóng domino nối tiếp (`computeDominoIntensity`).
  - [x] Điều chỉnh #3: Pha tan rã nhẹ thành bụi sao (`21.2s–25.2s`) và lặp lại chu kỳ `26.0s`.
  - [x] Điều chỉnh #4: Khóa `DPR = 1`, ô ký tự siêu mịn (`5×8px` desktop / `4×7px` mobile), pre-bake Sparse Glyph Atlas + Deferred Z-Buffer + blit `Uint32Array` có fast-path `allBorn`, giới hạn **28 FPS**, tự tạm dừng khi idle / ẩn tab / đổi theme, hỗ trợ `prefers-reduced-motion: reduce`.

- [x] **3. Tích hợp & đồng bộ Liquid Glass toàn app cho theme `ascii`**
  - [x] Thêm `#ascii-bg-canvas`, nút chọn theme `ascii`, nút trong buồng sóng Cài đặt và script `./js/ascii-bg.js` vào `index.html`.
  - [x] Đồng bộ toàn bộ hệ thống Liquid Glass đen-xám khói trong suốt (`0%` tím) trong `css/theme.css` (bao gồm `--glass-slab-*`, `--modal-convex-*`, `--card-frosted-*`, `--shadow-*`) và `GROUP 5` ở cuối `css/style.css` cho sidebar trái, khung hero (tắt blur lên cây thông), 4 thẻ thống kê, thanh nhạc, nút bấm, pill chọn theme, modal/popup và mobile bottom nav.
  - [x] Mở rộng `App.setTheme`, `syncThemeEnergyChamber`, `selectThemeViaEnergyWave`, `triggerThemeWaveTransition` và đồng bộ `setupIdleAndVisibilityListeners` trong `js/app.js` (bảo toàn nguyên vẹn hình nền lưu trữ của các theme khác).
  - [x] Đăng ký `js/ascii-bg.js` trong `scripts/build.js` và cập nhật cache `sw.js` (`mindsparks-v4.15.0`).

- [x] **4. Kiểm thử & Build Verification**
  - [x] Bổ sung Test Suite 33 (38 assertions) vào `tests/test-runner.js`.
  - [x] Chạy `node tests/test-runner.js` pass 100% (`732/732 passed, 0 failed`).
  - [x] Chạy `node scripts/build.js` pass 100% (`100 files`, `4.62 MB`, xác nhận `dist/js/ascii-bg.js`).

---

## Nhật Ký Thực Thi
- **Trạng thái**: Hoàn thành 100% trên nhánh `feat/ascii-tree` tách từ `main` (`b038081`).
- **Chi tiết thực hiện**:
  + Tạo mới `js/ascii-bg.js` (`AsciiBg`): dựng hình học 3D theo `agac.py` với mật độ cao (~242,711 điểm): `Y0 = 0.42`, `Y1 = 2.55`, `envelope(y)`, `fib(n)`, 26 tầng cành `NEEDLE` + `SNOWCAP`, `TRUNK` vỏ sần, 3.6 vòng `GARLAND` (`2600 × 5` điểm) rủ lượn sóng, 44 quả châu `BALL` (`fib(144)`), 170 bóng đèn `LIGHT` (`fib(22)`), ngôi sao vát khối 3D + quầng sáng `STAR`, 5 hộp quà thắt nơ `GIFT`/`RIBBON` và sàn chấm tròn đồng tâm `GROUND` trên bầu trời 160 sao đêm.
  + Áp dụng đủ 4 điều chỉnh + bố cục rộng phải: camera nghiêng xuống `20°` (`15°–25°`), tâm chiếu desktop `cx = 0.74`, phóng tỷ lệ chiếu lớn hơn ~18% (`focal = min(height * 1.13, width * 0.82)`), sóng domino trên kim tuyến & 170 đèn LED, pha tan rã bụi sao (`21.2s–25.2s`) lặp chu kỳ `26.0s`, khóa `DPR = 1` ở **28 FPS** với ô siêu mịn (`5×8px` desktop / `4×7px` mobile), fast-path `allBorn` và `blitGlyph`, hỗ trợ `prefers-reduced-motion: reduce`.
  + Đồng bộ toàn bộ Liquid Glass tông đen-xám khói trong suốt (`0%` tím) cho theme thứ 4 `ascii` trong `css/theme.css` và `GROUP 5` ở cuối `css/style.css` (sidebar trái, khung hero không làm nhòe cây thông bên phải, 4 thẻ thống kê, thanh nhạc, nút bấm, pill chọn theme, modal/popup và mobile bottom nav); bảo toàn nguyên vẹn 3 theme cũ (`violet-rose`, `monochrome`, `white-orange`).
  + Bổ sung Test Suite 33 (38 assertions) vào `tests/test-runner.js`.
- **Kết quả `node tests/test-runner.js`**: **732 passed, 0 failed** (gồm toàn bộ 694 test cũ và 38 test mới).
- **Kết quả `node scripts/build.js`**: **Pass 100%** (`100 files`, `4.62 MB`).
- **Hiệu năng đo thực tế (Node `renderFrameToBuffer`, `5×8px`, `DPR=1`, 60 khung hình xoay 360°)**:
  + `1440×900`: trung bình `5,714` `letters`, `3.72 ms/frame`.
  + `1920×1080`: trung bình `7,815` `letters`, `4.46 ms/frame`.
