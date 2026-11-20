# ĐẶC TẢ YÊU CẦU ĐỢT 2L (`docs/promt/promt2l.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. **Lớp hạt nền liên tục (Continuous Ambient Particles)**: Đưa mảng hạt nền (`ambientParticles`) lên cấp toàn cục của Engine, tách biệt hoàn toàn khỏi hàm `reset()` của từng Scene. Khi Cây thông lặp lại chu kỳ mới, tuyết vẫn rơi liên tục mượt mà, tuyệt đối không bị khựng, giật hay tạo lại mảng hạt. Dùng biến nội suy mượt `snowBlend` (`0.0 <-> 1.0` trong 2.0 giây) để chuyển đổi giữa Tuyết rơi chéo theo gió và Bầu trời sao lấp lánh trong không gian sâu.
> 2. **Nhịp xuất hiện Cây thông chậm rãi, lần lượt (9s–10s) + 8 Hộp quà**: Giãn tiến trình sinh cây thông (`t0`) ra dài hơn (~9–10 giây) theo đúng thứ tự logic: Mặt sàn (0s–1.5s) -> Thân cây (1.2s–2.5s) -> Tán lá mọc từ gốc lên ngọn và từ thân ra cành (2.2s–6.8s) -> Dải LED xoắn, Quả châu & Đèn (6.5s–8.0s) -> 8 Hộp quà xuất hiện lần lượt từng hộp (7.8s–9.2s) -> Ngôi sao đỉnh & Hào quang tỏa sáng (9.2s–10.0s). Bố trí 8 hộp quà rải rộng ra xung quanh mặt sàn (bán kính `0.55` đến `1.15`).
> 3. **Phủ ánh sáng vàng ấm đêm Giáng sinh (Warm Golden Ambient Glow)**: Chuyển tông ánh sáng chủ đạo sang ánh vàng ấm đêm Giáng sinh với Ngôi sao đỉnh và dải LED đuổi màu vàng kim rực rỡ `rgb(255, 215, 95)` (`[1.0, 0.843, 0.373]`), tỏa quầng sáng vàng ấm lan rộng ra xung quanh và nhuộm ánh vàng ấm áp lên tán lá thông xanh, quả châu, ngôi sao nhỏ và mặt nắp hộp quà (~25–35% hòa sắc vàng kim theo khoảng cách).
> 4. **Tinh chỉnh diện mạo Hố đen Gargantua theo ảnh điện ảnh Interstellar**: Vành photon ring và đĩa trước mặt bóng đen đạt độ chói trắng vàng nung sáng rực rỡ (`rgb(255, 252, 235)`), thân đĩa chuyển từ vàng kim sang cam hổ phách, hiệu ứng Doppler tương đối tính làm nổi bật cánh tiến về người quan sát.

---

## 1. Chi Tiết Kỹ Thuật

### 1.1. Hệ Thống Hạt Nền Toàn Cục & Chuyển Đổi Mượt `snowBlend`
- **Mảng hạt nền liên tục (`ambientParticles`)**:
  + Được khởi tạo 1 lần duy nhất trong `AsciiBg._ensureScene()` gồm 240 hạt vi điểm.
  + Mỗi hạt chứa vector 8 thuộc tính float: `x0, y0, vy (tốc độ rơi), wind (độ trôi gió), swayAmp (biên độ lắc), swayFreq, swayPhase, starBrightness`.
  + Tọa độ dọc được tính qua biến tích lũy khoảng cách đơn điệu `_snowDistance` của Engine:
    `yNorm = ((pos.y0 + vy * _snowDistance) % 1.0 + 1.0) % 1.0;`
  + Khi Scene hoàn tất vòng chạy và gọi `AsciiBg.reset()`, hàm `reset()` **chỉ reset thời gian riêng của cảnh (`_sceneStartMs`)**, tuyệt đối **KHÔNG chạm vào `_snowDistance` và `_ambientParticles`**. Nhờ đó tuyết rơi xuyên suốt liên tục, không bao giờ bị khựng, dịch chuyển tức thời hay giật hạt.
- **Biến nội suy mượt `snowBlend` (Thời gian chuyển tiếp 2.0s)**:
  + Cảnh Cây thông: mục tiêu `targetSnowBlend = 1.0`.
  + Cảnh Hố đen Gargantua: mục tiêu `targetSnowBlend = 0.0`.
  + Mỗi khung hình: `_snowBlend += clamp((target - _snowBlend) * (dt / 2.0), -dt/2, dt/2)`.
  + Tốc độ tích lũy khoảng cách: `_snowDistance += _snowBlend * dt`.
  + Khi `_snowBlend = 1.0`: hạt rơi chéo nhẹ xuống dưới làm tuyết với dao động lắc nhẹ (`sway`).
  + Khi chuyển sang Hố đen (`_snowBlend -> 0.0`): vận tốc rơi giảm mượt về `0`, dao động lắc triệt tiêu, hạt dừng lại tự nhiên thành bầu trời sao lấp lánh trong không gian sâu với chu kỳ chớp nhẹ (`< 0.35 Hz`).
  + Màu sắc và ký tự hạt được nội suy mượt giữa sắc trắng tuyết băng giá (`rgb(220, 235, 255)`) và sắc sao vũ trụ lung linh (`rgb(lum, lum, lum + 25)`).

### 1.2. Nhịp Sinh Cây Thông Chậm Rãi Lần Lượt (9s–10s) & 8 Hộp Quà Rải Rộng
- **Phân kỳ thời gian sinh (`t0`)**:
  1. *Mặt sàn tuyết băng*: `0.05s – 1.50s` (`t0Floor = 0.05 + 1.45 * (r / rMaxFloor)`).
  2. *Thân cây (Trunk & Stem)*: `1.20s – 2.50s` (Gốc `1.20s – 1.80s`, Thân lõi vươn cao `1.80s – 2.50s`).
  3. *Tán lá thông (Needles & Snowcaps)*: `2.20s – 6.80s` (`t0Needle = 2.20 + 4.00 * tierF + 0.60 * s`), mọc tuần tự từ tầng gốc lên ngọn (`tierF: 0 -> 1`) và từ thân ra đầu cành (`s: 0 -> 1`).
  4. *Dải LED xoắn & Quả châu & Đèn*: `6.50s – 8.00s` (`t0Garland = 6.50 + 1.20 * u`, `t0Ball = 6.80 + 1.00 * ...`, `t0Light = 6.60 + 1.30 * ...`).
  5. *8 Hộp quà 3D dưới đất*: `7.80s – 9.20s` (`t0 = 7.80 + (1.40 * gi) / 7`), xuất hiện lần lượt từng hộp một.
  6. *Ngôi sao đỉnh & Hào quang rực rỡ*: `9.20s – 10.00s` (`t0Star = 9.20 + 0.60 * rf`, `t0Halo = 9.80 + 0.20 * ...`).
  7. *Kích hoạt trạng thái nở trọn vẹn*: `allBorn = cycleT >= 10.0s`.
- **8 Hộp quà 3D rải rộng thoáng**:
  + Bố trí tại các bán kính `r` trải dài từ `0.58` đến `1.10` (nằm gọn trong dải an toàn `0.55 .. 1.15`), góc phương vị `ang` quay đều xung quanh chân cây (`0.35, 1.10, 1.85, 2.65, 3.45, 4.25, 5.05, 5.85 rad`).
  + Các tông màu lễ hội phong phú: Đỏ Ruby, Xanh Sapphire, Ngọc lục bảo Emerald, Vàng Hổ Phách, Tím Hoàng Gia, Lam Băng Cyan, Hồng Cổ Điển, Vàng Sâm panh kèm ruy băng và nơ 3D uốn lượn.

### 1.3. Phủ Ánh Sáng Vàng Ấm Đêm Giáng Sinh (Warm Golden Ambient Glow)
- **Tông màu chủ đạo**: `rgb(255, 215, 95)` (`[1.0, 0.843, 0.373]`).
- Ngôi sao đỉnh và dải LED xoắn domino tỏa màu vàng kim rực rỡ, vòng hào quang mở rộng tỏa ánh sáng ấm vào không gian tối.
- Trong Pass 2 deferred shading, tính toán khoảng cách từ từng điểm vật thể tới đỉnh sao `(0, starY, 0)` và dải đèn:
  + Tán lá, quả châu, quả nắp hộp quà, nơ và chóp tuyết được phủ hòa sắc `goldMix` từ `25%` đến `35%` sắc vàng kim `rgb(255, 215, 95)`.
  + Cây thông mang không khí ấm áp, lung linh đậm chất lễ hội Giáng sinh giữa đêm tối.

### 1.4. Diện Mạo Hố Đen Gargantua Theo Ảnh Điện Ảnh Interstellar
- Vùng chân trời sự kiện, photon ring và dải đĩa cắt ngang mặt trước bóng đen (`front_side = v > 0`) đạt độ chói trắng nung nóng rực rỡ `rgb(255, 252, 235)`.
- Cánh đĩa bồi tụ và vầng thấu kính Einstein chuyển gradient mềm mại từ trắng vàng sang cam hổ phách và đồng cháy.
- Hiệu ứng Doppler tương đối tính: phía tiến về người quan sát (`u < 0`) được gia tăng độ sáng và phủ ánh xanh-trắng nhẹ, phía lùi xa (`u > 0`) thiên về đỏ cam ấm.

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,226 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline (100 assets, 4.67 MB).
3. Tuyết rơi liên tục mượt mà khi Cây thông loop lại vòng mới; chuyển đổi êm dịu giữa Tuyết và Sao trong 2.0s.
4. Cây thông sinh lần lượt theo đúng tiến trình 0s – 10s với 8 hộp quà rải rộng.
5. Ánh vàng ấm `rgb(255, 215, 95)` bao phủ không gian lung linh.
