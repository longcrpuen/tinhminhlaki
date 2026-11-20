# ĐẶC TẢ YÊU CẦU ĐỢT 2K (`docs/promt/promt2k.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. Tăng mật độ lưới ASCII lên 8.000+ ký tự & khóa cứng 30 FPS (`TARGET_FPS: 30`, `FRAME_INTERVAL_MS = 1000 / 30 = 33.33ms`, ô vi điểm pixel `cellW ≈ 3.6–4.0px`, `cellH ≈ 6.5–7.0px`, font `700 7px monospace`, `DPR = 1`).
> 2. Mở rộng vầng Halo và sải cánh Đĩa bồi tụ của Hố đen Gargantua bám sát 2 ảnh mẫu điện ảnh (`R0 = 0.21`, sải cánh đĩa ngang `R_OUT = 4.8 * R0`, độ nén nghiêng `INC = 0.17`, dải sáng sắc nét băng ngang trước mặt bóng đen `front_side = v > 0`, vầng thấu kính Einstein cong dày và vành `photon_ring` mảnh sáng rực ôm sát rìa `r = 1.03 * R0`).
> 3. Bỏ hoàn toàn hiệu ứng nổ chói lóa màn hình (`flash` / `shock` / supernova burst) — Thay bằng cơ chế **"Sụp đổ hấp dẫn" (Gravitational Collapse)**: 3 giây cuối chu kỳ (`p = 0 -> 1`), đĩa và halo bị hút xoắn cực nhanh về chân trời sự kiện, ánh sáng dịu dần rồi chỉ còn lại vòng `photon_ring` mảnh thu nhỏ về tâm `r -> 0` biến mất êm dịu vào hư vô `#000000`.

---

## 1. Chi Tiết Kỹ Thuật

### 1.1. Lưới ASCII 8.000+ ký tự & Khóa 30 FPS
- **Thang đo kích thước ô vi điểm**:
  + Desktop (>= 768px): `cellW = 3.6px`, `cellH = 6.5px`, font `700 7px "JetBrains Mono", Consolas, monospace`.
  + Mobile (< 768px): `cellW = 3.2px`, `cellH = 5.8px`, font `700 6.5px "JetBrains Mono", Consolas, monospace`.
  + Trên màn hình chuẩn Desktop 1440×900: lưới đạt 400 × 138 = 55.200 ô; số lượng ký tự kích hoạt đạt **8.876 letters** (cây thông) và **8.077 letters** (hố đen).
  + Trên màn hình Full HD 1920×1080: lưới đạt 533 × 166 = 88.478 ô; số lượng ký tự kích hoạt đạt **11.577 letters** (cây thông) và **11.859 letters** (hố đen).
- **Khóa tốc độ khung hình 30 FPS**:
  + `FPS_LIMIT: 30`, `TARGET_FPS: 30`, `FRAME_INTERVAL_MS: 1000 / 30` (~33.33ms).
  + Bộ điều tiết `_tick(now)` chỉ gọi `renderAt()` khi `now - lastRenderMs >= FRAME_INTERVAL_MS`.

### 1.2. Mở Rộng Halo & Sải Cánh Đĩa Bồi Tụ (Theo 2 ảnh mẫu)
- **Hằng số vật lý**:
  + `R0 = 0.21`, `R_IN = 1.0 * R0`, `R_OUT = 4.8 * R0` (= 1.008), `INC = 0.17`, `TILT = -0.23 rad`.
- **Dải sáng băng ngang mặt trước bóng đen (`front_side = v > 0`)**:
  + Tọa độ nghiêng: `u = X * cos(TILT) + Y * sin(TILT)`, `v = -X * sin(TILT) + Y * cos(TILT)`.
  + Nếu `r < curR0 * 0.97`:
    * `front_side = v > 0`: dải đĩa phía trước đè cắt ngang qua bóng đen (`heat = disk_heat > 0.12 ? disk_heat : 0.0`).
    * `v <= 0`: nửa đĩa sau bị che khuất tuyệt đối bởi bóng đen (`heat = 0.0`, ghi nền `#000000`).
- **Vầng thấu kính Einstein (`lensed_halo`)**:
  + Bề rộng dải: `bandW = 0.32 * baseR + 0.35 * baseR * top + 0.55 * baseR * side`.
  + Phân bố: `band = exp(-pow(out / bandW, 1.45))` với `top = 0.5 - 0.5 * sin(ang - TILT)` và `side = cos(ang - TILT)^6`.
- **Vành photon mỏng sáng rực (`photon_ring`)**:
  + Ôm sát chân trời sự kiện tại `r = 1.03 * curR0`: `exp(-pow((r - 1.03 * curR0) / (0.028 * curR0), 2)) * 1.6`.

### 1.3. Cơ chế Sụp Đổ Hấp Dẫn (Gravitational Collapse - 100% Eye-Comfort)
- **Loại bỏ triệt để**:
  + Xóa toàn bộ `shockwave`, `flash` nhấp nháy, các vụ nổ Supernova gây chói lóa mắt người dùng.
- **Tiến trình biến mất êm dịu (3 giây cuối, `t = 17.0s .. 20.0s`, tham số `p = (cycleT - 17.0) / 3.0`)**:
  + `effR_OUT = R_OUT * (1 - 0.78 * p)`: rìa ngoài đĩa bồi tụ co xoắn hút mạnh vào trong chân trời sự kiện.
  + `effW = cycleT * (1 + 2.2 * p)`: vận tốc xoay góc tăng tốc theo định luật bảo toàn mô-men động lượng.
  + `haloFade = max(0, 1 - 1.35 * p)`, `diskFade = max(0, 1 - 1.20 * p)`: đĩa và vầng halo mờ dần rồi biến mất hoàn toàn.
  + Ở pha cuối (`p = 0.65 .. 0.98`): chỉ còn lại vòng `photon_ring` mảnh thu nhỏ dần bán kính về tâm điểm kỳ dị `curR0 = R0 * (1 - ringCollapse) -> 0`.
  + Tại `cycleT >= 19.85s`: toàn bộ canvas quay về nền đen thuần khiết `#000000` (0 ký tự, `isDone = true`), tự động chuyển cảnh Slideshow êm ái mà không có bất kỳ xung đột nào.

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,214 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline (100 files, 4.66 MB).
3. Đo đạc thực tế số lượng `letters` trung bình đạt 8.000+ và `frame time (ms)`.
