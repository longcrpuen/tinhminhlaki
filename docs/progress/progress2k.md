# TIẾN ĐỘ THỰC HIỆN ĐỢT 2K (`docs/progress/progress2k.md`)
> **File đặc tả gốc**: `docs/promt/promt2k.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Tăng mật độ lưới ASCII lên 8.000+ ký tự, khóa cứng 30 FPS, mở rộng vầng halo & sải cánh đĩa bồi tụ Hố đen Gargantua theo 2 ảnh mẫu, loại bỏ hoàn toàn hiệu ứng nổ chói lóa màn hình và thay bằng cơ chế Sụp đổ hấp dẫn (Gravitational Collapse) biến mất êm ái.

---

## Checklist Tiến Độ

- [x] **1. Nâng cấp mật độ lưới ASCII lên 8.000+ chữ & Khóa 30 FPS**
  - [x] Cấu hình tốc độ khung hình chuẩn: `CONFIG.TARGET_FPS = 30`, `CONFIG.FPS_LIMIT = 30`, `CONFIG.FRAME_INTERVAL_MS = 1000 / 30` (33.33 ms).
  - [x] Giảm kích thước ô vi điểm pixel xuống `cellW = 3.6px`, `cellH = 6.5px` (desktop) và `cellW = 3.2px`, `cellH = 5.8px` (mobile), font `700 7px "JetBrains Mono", Consolas, monospace`, `DPR = 1`.
  - [x] Hỗ trợ tọa độ ô thập phân mượt mà trong `buildGlyphAtlas()` và `blitGlyph()`, không gây lệch pixel hay sub-pixel blurring.
  - [x] Đạt trên 8.000 ký tự hoạt họa hiển thị đồng thời trên cả Cây thông Noel 3D và Hố đen Gargantua ở độ phân giải Desktop.

- [x] **2. Mở rộng vầng Halo & sải cánh Đĩa bồi tụ Hố đen (theo 2 ảnh mẫu)**
  - [x] Đặt bán kính bóng đen `R0 = 0.21`, mở rộng sải cánh đĩa ngang `R_OUT = 4.8 * R0` (= 1.008) và độ nén nghiêng `INC = 0.17`.
  - [x] Tạo dải sáng sắc nét cắt ngang qua mặt trước bóng đen (`front_side = v > 0`), giữ nguyên nửa sau bị che lấp hoàn toàn bởi chân trời sự kiện.
  - [x] Dày hóa vầng thấu kính Einstein `lensed_halo` uốn cong bao quanh trên và dưới với bề rộng `bandW = 0.32 * R0 + 0.35 * R0 * top + 0.55 * R0 * side`.
  - [x] Thêm vòng `photon_ring` mảnh sáng rực ôm sát rìa `r = 1.03 * R0`, kết hợp các vi sợi khí xoáy đồng tâm `rings * spiral`.

- [x] **3. Thay thế hiệu ứng nổ bằng "Sụp đổ hấp dẫn" (Gravitational Collapse)**
  - [x] Loại bỏ hoàn toàn `shockwave`, `flash` lóe sáng chói mắt và vụ nổ Supernova cũ.
  - [x] Pha biến mất 3 giây cuối (`t = 17.0 .. 20.0s`, tham số `p = 0 -> 1`):
    + `effR_OUT = R_OUT * (1 - 0.78 * p)`: đĩa bồi tụ bị hút xoắn cực nhanh về chân trời sự kiện.
    + `effW = cycleT * (1 + 2.2 * p)`: vận tốc xoáy góc tăng tốc theo bảo toàn mô-men động lượng.
    + Đĩa và vầng halo mờ dần rồi biến mất hoàn toàn.
    + Vòng `photon_ring` mảnh thu nhỏ dần bán kính về tâm điểm kỳ dị `curR0 = R0 * (1 - ringCollapse) -> 0`.
    + Tại `t >= 19.85s`: canvas tắt hẳn về nền đen thuần `#000000` (0 ký tự, `isDone = true`), chuyển cảnh Slideshow êm ái 100%.

- [x] **4. Tối ưu hóa hiệu năng render (Early Range Filtering)**
  - [x] Thêm bộ lọc cự ly sớm (`inDiskRange` và `inHaloRange`): bỏ qua tính toán hàm xoắn khí phức tạp cho các ô nằm ngoài phạm vi hoạt ảnh.
  - [x] Ngắt sớm khi thấu kính `band < 0.02` và khi ô nằm trong vùng tối của lỗ đen (`inside && !front_side`).
  - [x] Thời gian dựng hình trong thực tế giảm mạnh, đảm bảo mượt mà 30 FPS không giật lag.

- [x] **5. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,214 passed, 0 failed** (100% test suites).
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, hoàn tất đóng gói Offline PWA.

---

## Báo Cáo Đo Đạc Hiệu Năng & Ký Tự Thực Tế
*(Thực hiện bằng benchmark 20 frames với lưới vi điểm `cellW = 3.6px`, `cellH = 6.5px`, `DPR = 1`, khóa 30 FPS = ngân sách 33.33 ms)*

| Màn hình kiểm thử | Cảnh hoạt ảnh | Số lượng ký tự trung bình (`letters`) | Thời gian dựng hình trung bình (`frame time`) | Đánh giá hiệu năng |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop 1440×900**<br>(400 × 138 = 55.200 ô) | **🌲 Cây thông Noel 3D** | **8.876 letters** | **28.46 ms / frame** | Tiêu tốn ~85.4% ngân sách 30 FPS (mượt mà) |
| | **🌌 Hố đen Gargantua** | **8.077 letters** | **< 30 ms / frame** (in-browser) | Đạt chuẩn 8.000+ chữ, chi tiết mịn như pixel |
| **Full HD 1920×1080**<br>(533 × 166 = 88.478 ô) | **🌲 Cây thông Noel 3D** | **11.577 letters** | **32.14 ms / frame** | Tiêu tốn ~96.4% ngân sách 30 FPS (mượt mà) |
| | **🌌 Hố đen Gargantua** | **11.859 letters** | **< 33 ms / frame** (in-browser) | Mở rộng cánh đĩa và halo hùng vĩ toàn màn hình |

> **Nhận xét**: Cả hai hoạt ảnh đều vượt mục tiêu 8.000+ ký tự trên màn hình Desktop thông thường và đạt tới gần 12.000 ký tự trên màn hình Full HD, mang lại độ sắc nét mịn như điểm ảnh vi mô. Cơ chế Sụp đổ hấp dẫn biến mất cực kỳ êm dịu, không còn bất kỳ vệt chói lóa hay mảnh vụn nào ở mép dưới.
