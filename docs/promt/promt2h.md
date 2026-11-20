# ĐẶC TẢ YÊU CẦU ĐỢT 2H (`docs/promt/promt2h.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. Tối giản UI theme `ascii` (icon `>_` terminal, nút tròn 32×32px mở popover Liquid Glass chọn hoạt ảnh).
> 2. Khắc phục triệt để lỗi Hố đen kẹt vòng lặp 2 và dọn sạch mảnh sót ở vành dưới chân trời sự kiện.
> 3. Viết lại renderer của cảnh Hố đen Gargantua theo dạng **trường pixel ASCII dày đặc** (2D shader field per-cell, không dùng các vòng ellipse thưa) với đĩa bồi tụ nén 3.8x, thấu kính uốn cong trên dưới, bảng màu nhiệt bức xạ vật đen (`#5c1908` → `#d95b16` → `#ffb84d` → `#fff6d6`), và pha biến mất Supernova Burst (Galaxy Impact).

---

## 1. Bối Cảnh & Yêu Cầu Cụ Thể

### 1.1. Tối giản UI theme `ascii` (`index.html`, `css/theme.css`, `css/style.css`, `js/app.js`)
- **Icon theme `ascii`**:
  - Đổi icon chọn theme `ascii` từ hình cây thông Noel (`polygon`) sang ký hiệu terminal prompt tối giản `>_` (`<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`).
- **Nút chuyển hoạt ảnh trên thanh Topbar HUD**:
  - Thay pill chữ dài (`🌲 Cây thông` / `🔄 Slideshow`) bằng nút icon tròn nhỏ gọn kích thước 32×32px (`#ascii-scene-cycle-btn`).
  - Khi click vào nút icon, mở popover nhỏ Liquid Glass (`#ascii-scene-popover`) ngay dưới nút để chọn:
    1. `Slideshow`: Tự chuyển mượt giữa các cảnh
    2. `Cây thông Noel`: Cây 3D & tuyết rơi
    3. `Hố đen Gargantua`: Thấu kính hấp dẫn & đĩa bồi tụ
  - Đóng popover mượt mà khi chọn xong, click ra ngoài hoặc bấm phím `Escape`.

### 1.2. Khắc phục lỗi Hố đen kẹt ở vòng loop 2 (`js/ascii-bg.js`)
- Đưa logic reset thời gian chu kỳ (`_sceneStartMs = now`, `_pausedSceneElapsedSec = 0`) và xóa sạch buffer hiển thị/độ sâu (`_zBuf.fill(1e9)`, `_buf32.fill(BG_PACKED)`, `_activeCells.fill(0)`, `_winIdx.fill(0)`) ra ngoài điều kiện kiểm tra chế độ phát trong `_tick()`, giúp cả 2 chế độ Slideshow lẫn Single đều tự động lặp liên tục không cần click chuột.

### 1.3. Renderer Hố Đen Trường Pixel ASCII Dày Đặc (2D Shader Field)
- **Hệ tọa độ & Lưới**:
  - Tâm hố đen lệch phải desktop `cx ≈ 0.72 * width`, căn giữa mobile `0.50 * width`.
  - Quy đổi tọa độ mỗi ô `(col, row)` sang `(X, Y)` chuẩn hóa theo `scale = height`, bù tỷ lệ `cellW / cellH`.
  - Xoay nghiêng `TILT ≈ -0.22 rad`.
  - Bán kính chân trời sự kiện `R0 ≈ 0.22`, đĩa bồi tụ `R_OUT ≈ 0.98`. Vùng `r < R0 * 0.95` là lỗ đen tuyệt đối (đen `#000000`, che khuất sao và đĩa phía sau).
- **2 Lớp ánh sáng bẻ cong không gian (cộng dồn độ sáng `heat`)**:
  - **Lớp `accretion_disk`**: nén trục `v` (`v_flat = v * 3.8`), tính `rho = hypot(u, v_flat)` và góc `ang`. Xoắn dòng chảy `flow = 0.65 + 0.35 * sin(ang * 3 - rho * 12 + t * 2.5)`. Độ sáng tập trung từ `R0` đến `R_OUT`, kết hợp vệt sáng Doppler đối xứng tương đối tính (bên trái `u < 0` sáng gấp ~2.6 lần bên phải).
  - **Lớp `lensed_halo`**: uốn cong phần đĩa phía sau vòng lên trên và dưới lỗ đen (`top = 0.5 - 0.5 * sin(ang - TILT)`), tạo vòm cong Einstein ôm sát mép `R0` như ảnh mẫu.
  - **Photon Ring**: vành photon mỏng sắc sảo ôm sát mép `R0 * 1.03`.
  - **Bảng màu theo `heat`**: từ nâu đỏ sẫm (`#5c1908`) → cam cháy (`#d95b16`) → vàng rực (`#ffb84d`) → trắng nóng (`#fff6d6`), kết hợp bộ ký tự mật độ ` .:-=+*#%@`.
- **Pha biến mất Galaxy Impact (Supernova Burst)**:
  - Ở 2.5 giây cuối chu kỳ (`cycleT >= 22.5s`):
    + `t = 22.5s .. 23.5s`: Lực hút kéo toàn bộ đĩa bồi tụ xoáy co mạnh vào tâm (`R0 -> 0`), tụ thành 1 điểm trắng chói lòa (singularity).
    + `t = 23.5s .. 24.3s`: Supernova nổ tung, bắn ra sóng xung kích tròn (`shockwave`) kèm tia sáng 4 hướng (cross beams) và hạt bụi sao văng ra.
    + `t = 24.3s .. 24.8s`: Nguội dần và tắt hẳn về `#000000` trước khi loop lại hoặc chuyển cảnh.
  - Giữ `DPR = 1`, giới hạn 24–30 FPS.

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,205 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline.
