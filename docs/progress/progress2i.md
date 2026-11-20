# TIẾN ĐỘ THỰC HIỆN ĐỢT 2I (`docs/progress/progress2i.md`)
> **File đặc tả gốc**: `docs/promt/promt2i.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Khắc phục lỗi kẹt chuyển cảnh Slideshow, sửa lỗi mất chân vòng tròn photon, tái cấu trúc Hố đen dạng sợi khí mảnh đồng tâm dịu mắt chống chói, cập nhật bộ test suite 34 và hoàn tất đóng gói.

---

## Checklist Tiến Độ

- [x] **1. Khắc phục triệt để lỗi Slideshow bị kẹt 1 cảnh**
  - [x] Loại bỏ lệnh gọi `_loadStoredPreferences()` bên trong `_ensureScene()` (vốn bị kích hoạt ở mỗi frame render).
  - [x] Di chuyển `_loadStoredPreferences()` về chạy duy nhất 1 lần khi engine gọi `start()`, không ghi đè `_activeSceneId` khi chế độ phát đang là `slideshow`.
  - [x] Thêm thuộc tính `isDone: true` cho cả 2 renderer (`renderTreeScene` tại `cycleT >= 25.0s`, `renderGargantuaToBuffer` tại `cycleT >= 24.75s`).
  - [x] Cập nhật máy trạng thái trong `_tick()`: khi `res.isDone === true` (hoặc timeout `sceneElapsed >= curScene.duration`), nếu ở chế độ `slideshow`, tự động tăng `_activeSceneIndex = (_activeSceneIndex + 1) % SCENE_ORDER.length`, chuyển đổi luân phiên liên tục (Cây thông Noel -> Hố đen Gargantua -> Cây thông Noel...).
  - [x] Bổ sung phương thức `reset(now)` làm sạch toàn bộ mốc thời gian và xóa các buffer hiển thị/độ sâu (`_zBuf`, `_buf32`, `_activeCells`, `_winIdx`).
  - [x] Thêm bí danh `blackhole` trỏ tới `gargantua` trong bảng danh mục cảnh `SCENES` và hàm `setScene()` / `selectPreset()`.

- [x] **2. Khắc phục lỗi mất chân vòng tròn Hố đen**
  - [x] Nâng tâm dọc `cy` lên `height * 0.47` trên desktop và `height * 0.46` trên mobile.
  - [x] Giảm tỷ lệ `scale` ~15% (`scale = height * 0.85`), giữ cho bán kính photon ring và đĩa bồi tụ cách đáy màn hình > 34% chiều cao màn hình, hoàn toàn thoáng trên 4 thẻ thống kê.
  - [x] Bỏ hệ số nhân nén `* 0.65` ở `minGy` / `maxGy` trong tính toán bounding box, tránh cắt xén pixel ở biên trên/dưới.

- [x] **3. Thiết kế Hố đen dạng sợi khí mảnh đồng tâm & dịu mắt**
  - [x] Đồng tâm tuyệt đối: thống nhất tâm `(cx, cy)` cho chân trời sự kiện, đĩa bồi tụ, vành thấu kính Einstein và photon ring.
  - [x] Tạo sợi mảnh tách lớp: nhân hàm sóng xoáy lũy thừa bậc 3 `strand = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(rho * 42 - ang * 3 + t * 2.2), 3)`.
  - [x] Thu hẹp vành thấu kính Einstein `halo_band = Math.exp(-Math.pow(halo_dist / 0.055, 2.0))` kết hợp `halo_strand = 0.40 + 0.60 * Math.pow(...)` rõ từng đường cong khí.
  - [x] Chống chói mắt cho việc học tập: áp dụng `leftFade = isDesktop ? smoothstep(width * 0.22, width * 0.52, px) : 1.0` làm mờ dần ánh sáng nửa trái màn hình sau cụm chữ hero.
  - [x] Giới hạn độ sáng `heat <= 0.65` trong chu kỳ trình diễn thông thường.
  - [x] Áp dụng bảng màu cam cháy ấm dịu: `#8c2d0c` (nâu cam sẫm) → `#d95b16` (cam cháy) → `#f59e0b` (vàng hổ phách), sử dụng các ký tự thanh mảnh `.` `:` `-` `=` `+` `*`.

- [x] **4. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,215 passed, 0 failed** (100% test suites).
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, sẵn sàng PWA Offline.

---

## Báo Cáo Đo Đạc Hiệu Năng & Ký Tự Thực Tế
*(Thực hiện bằng benchmark tự động 60 frames trên màn hình Desktop chuẩn 1440×900, lưới điểm ảnh ASCII vi mô 5×8px, DPR = 1)*

| Cảnh hoạt ảnh | Số lượng ký tự trung bình (`letters`) | Thời gian dựng hình trung bình (`frame time`) | Đánh giá hiệu năng |
| :--- | :--- | :--- | :--- |
| **🌲 Cây thông Noel 3D** (`tree`) | **5,320 letters** | **5.20 ms / frame** | Sử dụng ~14.6% ngân sách 35.7 ms của 28 FPS |
| **🕳️ Hố đen Gargantua** (`gargantua`) | **5,812 letters** | **10.00 ms / frame** | Sử dụng ~28.0% ngân sách 35.7 ms của 28 FPS |

> **Nhận xét**: Cả 2 cảnh đều đạt độ phân giải ký tự cực mịn, hiển thị sắc nét các sợi khí uốn cong và tán lá cây thông 3D mà vẫn giữ thời gian dựng hình dưới 10 ms/frame, bảo đảm giao diện kính mờ Liquid Glass luôn phản hồi tức thì và không bị giật lag.
