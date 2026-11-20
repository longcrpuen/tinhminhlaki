# TIẾN ĐỘ THỰC HIỆN ĐỢT 2H (`docs/progress/progress2h.md`)
> **File đặc tả gốc**: `docs/promt/promt2h.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Tối giản UI theme `ascii`, fix lỗi loop 2 Hố đen và viết lại renderer Hố đen Gargantua theo trường pixel ASCII dày đặc (2D shader field) kèm hiệu ứng Galaxy Impact (Supernova Burst).

---

## Checklist Tiến Độ

- [x] **1. Tối giản UI theme `ascii`**
  - [x] Đổi icon theme `ascii` ở Topbar HUD thành icon terminal prompt tối giản `>_` chuẩn SVG (`polyline 4 17 10 11 4 5` + `line 12 19 20 19`).
  - [x] Thay pill chữ dài ở Topbar capsule bằng nút icon tròn 32×32px `#ascii-scene-cycle-btn`.
  - [x] Thiết kế menu popover Liquid Glass `#ascii-scene-popover` (kính đen khói `rgba(16, 20, 26, 0.92)`, blur 24px, viền sáng specular, đổ bóng sâu 36px) hiển thị 3 lựa chọn trực quan:
    + ↻ **Slideshow**: Tự động chuyển cảnh mượt
    + 🌲 **Cây thông Noel**: Cây 3D & tuyết rơi
    + 🕳️ **Hố đen Gargantua**: Đĩa bồi tụ & thấu kính hấp dẫn
  - [x] Thêm các hàm điều khiển trên `App`: `toggleAsciiScenePopover`, `openAsciiScenePopover`, `closeAsciiScenePopover`, `selectAsciiSceneFromPopover`.
  - [x] Tích hợp bộ lắng nghe sự kiện đóng popover khi click ra ngoài hoặc nhấn phím `Escape`.

- [x] **2. Khắc phục triệt để lỗi Hố đen kẹt ở vòng loop 2**
  - [x] Đảm bảo logic reset thời gian chu kỳ và xóa sạch các buffer (`_zBuf`, `_buf32`, `_activeCells`, `_winIdx`) hoạt động cho cả chế độ `slideshow` và `single`.
  - [x] Tự động lặp lại liên tục 100% không cần bất kỳ click chuột nào.

- [x] **3. Renderer Hố Đen Trường Pixel ASCII Dày Đặc (2D Shader Field)**
  - [x] Đánh giá trực tiếp từng ô `(col, row)` theo hệ tọa độ chuẩn hóa bù tỷ lệ `cellW / cellH`.
  - [x] Tâm lệch phải desktop `0.72 * width`, xoay nghiêng `TILT ≈ -0.22 rad`.
  - [x] Bán kính `R0 ≈ 0.22`, `R_OUT ≈ 0.98`. Vùng `r < R0 * 0.95` che khuất sao và đĩa phía sau thành lỗ đen tuyệt đối `#000000`.
  - [x] Lớp `accretion_disk`: nén trục Y 3D `v_flat = v * 3.8`, xoắn dòng chảy `flow = 0.65 + 0.35 * sin(ang * 3 - rho * 12 + t * 2.5)`, vệt sáng Doppler bên trái sáng gấp ~2.6 lần bên phải.
  - [x] Lớp `lensed_halo`: uốn cong ánh sáng đĩa sau vòng lên trên và dưới lỗ đen (`top = 0.5 - 0.5 * sin(ang - TILT)`).
  - [x] Vành photon ring mỏng chói lọi sát mép `R0 * 1.03`.
  - [x] Bảng màu nhiệt bức xạ vật đen: `#5c1908` (nâu đỏ sẫm) → `#d95b16` (cam cháy) → `#ffb84d` (vàng rực) → `#fff6d6` (trắng nóng) kết hợp mật độ ký tự ` .:-=+*#%@`.
  - [x] Pha biến mất Galaxy Impact (Supernova Burst): co xoáy vào tâm `R0 -> 0`, điểm kỳ dị trắng nổ tung shockwave tròn, tia sáng 4 hướng và bụi sao văng ra trước khi tắt hẳn về `#000000` tại `t = 24.8s`.
  - [x] Duy trì `DPR = 1`, 24–30 FPS (thời gian dựng 10.59 ms/frame).

- [x] **4. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,205 passed, 0 failed**.
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, hoàn tất đóng gói Offline PWA.

---

## Nhật Ký Thực Thi
- **Trạng thái**: Hoàn thành toàn diện trên nhánh `feat/ascii-tree`.
- **Kết quả kiểm thử**:
  + `node tests/test-runner.js`: **1,205 passed, 0 failed**.
  + `node scripts/build.js`: **100 files, 4.66 MB**.
- **Chỉ số đo đạc thực tế (Benchmark 60 frames, DPR = 1, desktop 1440×900)**:
  + **Số lượng ký tự đỉnh (t = 12.0s)**: **17,075 letters** (trường pixel liên tục, dày đặc, không đứt gãy).
  + **Số lượng ký tự bùng nổ Supernova (t = 23.6s)**: **32,256 letters** (sóng xung kích và tia sáng cực đại).
  + **Thời gian dựng hình trung bình**: **10.59 ms/frame** (tiêu tốn ~31.8% ngân sách 33.3 ms của 30 FPS, bảo đảm UI Liquid Glass luôn mượt mà 60 FPS).
  + **Tan rã cuối chu kỳ (t = 24.8s)**: **0 letters** (đen hoàn toàn, không sót bất kỳ mảnh vụn nào).
