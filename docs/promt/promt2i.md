# ĐẶC TẢ YÊU CẦU ĐỢT 2I (`docs/promt/promt2i.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. Sửa lỗi Slideshow bị kẹt chỉ lặp 1 cảnh (chuyển đổi mượt mà giữa Cây thông Noel 3D và Hố đen Gargantua).
> 2. Khắc phục lỗi mất chân vòng tròn khi Hố đen xuất hiện (nâng tâm dọc `cy`, giảm scale ~15%, giữ khoảng trống đáy thoáng).
> 3. Tái thiết kế Hố đen Gargantua thành các sợi khí mảnh đồng tâm (concentric filaments) dịu mắt chống chói, có dải làm mờ bên trái (leftFade) bảo vệ typography và các nút điều khiển.
> 4. Cập nhật hệ thống kiểm thử tự động và đóng gói sản xuất PWA Offline.

---

## 1. Bối Cảnh & Yêu Cầu Cụ Thể

### 1.1. Fix lỗi Slideshow chỉ chạy 1 hoạt ảnh (`js/ascii-bg.js`)
- **Hiện tượng**:
  - Khi bật chế độ `Slideshow`, hệ thống bị kẹt chỉ phát đi phát lại một hoạt ảnh duy nhất (trước đó là Cây thông, sau đó là Hố đen).
- **Nguyên nhân cốt lõi**:
  - `_loadStoredPreferences()` bị gọi lặp lại ở hàm `_ensureScene()` trên mỗi frame, liên tục đọc giá trị từ `localStorage` và ghi đè `_activeSceneId` trở lại cảnh đơn đã lưu, làm vô hiệu hóa bước chuyển cảnh của máy trạng thái trong `_tick()`.
- **Giải pháp xử lý**:
  - Bổ sung tín hiệu hoàn thành chu kỳ `isDone: true` cho từng renderer cảnh (`tree` khi `cycleT >= 25.0s`, `gargantua` khi `cycleT >= 24.75s`).
  - Trong máy trạng thái `_tick()`: khi nhận `res.isDone === true` (hoặc timeout an toàn `sceneElapsed >= curScene.duration`), nếu đang ở chế độ `slideshow`, tự động tăng chỉ số cảnh `_activeSceneIndex = (_activeSceneIndex + 1) % SCENE_ORDER.length`, cập nhật `_activeSceneId`, gọi `this.reset(now)` để làm sạch state và đồng bộ giao diện người dùng qua `window.App.syncAsciiSceneUI()`.
  - Chỉ gọi `_loadStoredPreferences()` đúng 1 lần khi engine khởi động (`start()`), và không ghi đè `_activeSceneId` nếu `_playbackMode === 'slideshow'`.
  - Hỗ trợ bí danh `blackhole` trỏ trực tiếp đến `gargantua` trong bảng danh mục cảnh `SCENES` để tương thích mọi lệnh gọi.

### 1.2. Fix lỗi mất chân vòng tròn khi Hố đen xuất hiện (`js/ascii-bg.js`)
- **Hiện tượng**:
  - Ở giai đoạn vẽ vòng tròn ban đầu (`ring_k`, `t = 1.5s`), vòng tròn photon bị cắt cụt mất phần đáy ở mép dưới màn hình.
- **Giải pháp xử lý**:
  - Điều chỉnh tâm chiếu dọc `cy`: trên desktop đặt tại `height * 0.47` (thay vì `0.49`), trên mobile đặt tại `height * 0.46`.
  - Giảm nhẹ tỷ lệ `scale` ~15% (`scale = height * 0.85`), giúp bán kính vòng tròn photon `curR0 * scale = 0.187 * height` nằm gọn ở vùng giữa, đáy vòng tròn đạt `cy + 0.187 * height ≈ 0.657 * height` (cách mép dưới > 34% chiều cao màn hình, hoàn toàn thoáng trên 4 thẻ thống kê).
  - Loại bỏ hệ số nén `* 0.65` trong tính toán bounding box dọc (`minGy`, `maxGy`), bảo đảm toàn bộ chiều cao đĩa bồi tụ và vòng hào quang được đánh giá đầy đủ không bị xén cạnh.

### 1.3. Làm lại Hố đen dạng sợi khí mảnh đồng tâm & dịu mắt (`js/ascii-bg.js`)
- **Đồng tâm tuyệt đối**:
  - Dùng chung một tâm chiếu `(cx, cy)` (desktop `cx = 0.72 * width`, `cy = 0.47 * height`) cho toàn bộ cấu trúc: bóng đen chân trời sự kiện `r < R0`, đĩa bồi tụ nghiêng `accretion_disk`, vành hào quang thấu kính Einstein `lensed_halo`, và vành photon ban đầu `ring_k`.
- **Sợi khí mảnh tách lớp (Concentric Filaments)**:
  - Thay thế mảng pixel trắng đặc bằng các dải sợi khí xoáy mảnh, xen kẽ các rãnh tối sâu thông qua hàm sóng lũy thừa 3:
    `strand = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(rho * 42 - ang * 3 + t * 2.2), 3)`
  - Thu hẹp bề rộng dải hào quang thấu kính Einstein:
    `halo_band = Math.exp(-Math.pow(halo_dist / 0.055, 2.0))`
    kết hợp sợi sóng `halo_strand = 0.40 + 0.60 * Math.pow(0.5 + 0.5 * Math.sin(r * 48 - relAng * 3 + t * 2.2), 3)`
- **Chống chói khi học tập & làm việc**:
  - Áp dụng mặt nạ làm mờ mượt mà ở nửa trái màn hình:
    `const leftFade = isDesktop ? smoothstep(width * 0.22, width * 0.52, px) : 1.0; heat *= leftFade;`
    giúp vùng chữ tiêu đề hero, thanh phát nhạc và các nút điều khiển hoàn toàn trong trẻo, không bị ánh sáng hố đen che lấp hay gây chói.
  - Giới hạn cường độ ánh sáng `heat <= 0.65` trong suốt giai đoạn trình diễn thông thường (chỉ cho phép cực đại chói lòa tại tâm điểm nổ Supernova Impact `cycleT >= 22.5s`).
  - Chuyển sang bảng màu cam cháy ấm áp:
    `#8c2d0c` (nâu cam sẫm) → `#d95b16` (cam cháy) → `#f59e0b` (vàng hổ phách), sử dụng các ký tự thanh mảnh `.` `:` `-` `=` `+` `*` thay cho các khối `@` `#` dày đặc.

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,215 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline.
3. Đo đạc thực tế số lượng `letters` trung bình và `frame time (ms)` bảo đảm chuẩn 28 FPS mượt mà.
