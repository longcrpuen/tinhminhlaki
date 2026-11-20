# ĐẶC TẢ YÊU CẦU ĐỢT 2M (`docs/promt/promt2m.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Ràng buộc giữ nguyên**: `DPR = 1`, khóa cứng `30 FPS`, mật độ cao 8.000+ ký tự, lớp hạt nền Tuyết $\leftrightarrow$ Sao chuyển đổi mượt không khựng khi Slideshow luân chuyển.

---

## A. Cảnh Cây Thông (`tree` trong `js/ascii-bg.js`)

### 1. Thân Cây Mọc Đồng Bộ Theo Tán Lá
- **Vấn đề cũ**: Thân cây lõi phía trên mọc xong toàn bộ tại `2.5s` trong khi tán lá phải tới `6.8s` mới lên tới ngọn, làm lộ cột thân nâu trống trơn phía trên tán lá.
- **Giải pháp**:
  + Phần gốc thân dưới tán (`h <= CONFIG.Y0`): mọc từ `1.20s -> 1.95s`.
  + Phần thân lõi trong vùng tán (`h > CONFIG.Y0`): đồng bộ hoàn toàn theo chiều cao `y` của từng tầng tán lá:
    `t0Stem = 1.95 + 4.00 * clamp((h - CONFIG.Y0) / (CONFIG.Y1 - CONFIG.Y0), 0, 1)`
    so với tán lá `t0Needle = 2.20 + 4.00 * tierF + 0.60 * s`.
  + Ở mọi cao độ `y`, thân cây luôn đi trước tán lá đúng **0.25s** (trong ngưỡng `0.2s–0.3s`), tuyệt đối không để lộ cột thân trống phía trên.

### 2. Hiệu Ứng Tia Sáng Chạy Đuổi Xoắn Ốc Kích Hoạt Ngôi Sao Đỉnh
- **Tiến trình luồng năng lượng (`PULSE_START = 8.00s -> PULSE_END = 9.35s`, thời lượng `1.35s`)**:
  + Sau khi tán lá (`2.2s–6.8s`), dải LED xoắn (`6.5s–7.7s`), quả châu & đèn (`6.6s–8.0s`) hoàn thành, 1 luồng sáng vàng kim rực rỡ (`pulseHead: 0 -> 1`) chạy xoắn ốc mượt mà dọc theo dải đèn từ gốc đuổi lên chóp (`0.00 -> 0.88` trên vòng xoắn garland, `0.88 -> 1.00` xoắn siết vào tâm đỉnh `starY`).
  + Đầu sao chổi 3D (22 hạt đuôi tỏa sáng) + kích sáng trực tiếp lên dải LED garland nơi luồng sáng lướt qua.
- **Kích hoạt Ngôi sao đỉnh (`t = 9.35s -> 10.0s`)**:
  + Đúng khoảnh khắc tia sáng chạm chóp (`9.35s`), Ngôi sao đỉnh bùng sáng nở từ tâm ra 5 cánh (`t0Star = 9.35 + 0.40 * rf`), kèm vầng hào quang vàng ấm 28 tia tỏa nhẹ ra xung quanh (`9.35s -> 11.20s`).

---

## B. Cảnh Hố Đen Gargantua (`gargantua` trong `js/ascii-bg.js`)

### 3. Pha Mở Đầu Ấn Tượng — Tidal Disruption / Accretion Capture (`0s–3.5s`)
- Thay thế vòng tròn mở đầu đơn điệu bằng **54 dải hạt/sợi sao** (`GARG_TIDAL_STREAMS`, mỗi sợi kéo giãn thành vệt cong 12 phân đoạn xoắn ốc logarit) từ vòng ngoài (`r = 0.68..1.18`) bị lực hấp dẫn kéo giãn, tăng tốc xoáy hút dồn về chân trời sự kiện `R0`.
- Khi các dòng vật chất tụ lại quanh `R0` (`1.35s–2.6s`), vành `photon_ring` bùng sáng sắc nét (`ringIgnite + ringFlare`), rồi mở bung 2 cánh đĩa bồi tụ (`disk_on`, `diskGrow`) và vầng thấu kính trên/dưới (`haloScale`) ra toàn bộ sải cánh.

### 4. Tăng Độ Dày, Sắc Nét & Lực Cho 2 Cánh Đĩa Bồi Tụ
- Giữ nguyên tâm, tỷ lệ `R0 = 0.21`, `R_OUT = 4.8 * R0`, `INC = 0.17`, `TILT = -0.23` và vầng thấu kính Einstein.
- Trong `accretion_disk`:
  + Giảm suy hao theo bán kính với `Math.pow(R_IN / Math.max(rho, 1e-4), 0.62)`.
  + Gia cường biên độ sợi khí `streak` ở vùng cánh ngoài `R0 * 1.4 .. R_OUT` (`wingMask`, `streakAmp`).
  + Tăng độ dày và độ nổi cho dải sáng cắt ngang mặt trước bóng đen (`front_side = v > 0`, `frontBoost = 1.25`, `thickness = inc * 0.76 * R0 + 0.052 * |u|`) giúp 2 cánh đĩa nhìn khỏe, dày sợi và rõ chiều sâu 3D.

### 5. Pha Biến Mất Galaxy Impact Dịu Mắt — Quasar Relativistic Jets + Hollow Shockwave (`17.0s–19.85s`)
- **Nén xoắn & Tụ năng lượng (`17.0s–17.9s`)**: Đĩa bồi tụ tăng tốc quay (`effW = cycleT * (1 + 2.8 * p)`) và nén nhanh vào chân trời sự kiện, tụ năng lượng gọn tại tâm trong `0.5s` (`17.4s–17.9s`).
- **Phóng tia Quasar & Sóng xung kích rỗng ruột (`17.9s–19.80s`)**:
  + **2 Luồng Relativistic Jets mảnh** bắn ngược chiều lên trên và xuống dưới dọc đúng trục cực nghiêng của hố đen (`u ≈ 0`, `±v`), có các nút năng lượng chạy dọc tia (`jetW = 0.017 + 0.022 * |v| * ...`).
  + **1 Vòng sóng xung kích mảnh rỗng ruột (Hollow Shockwave Ring)**: độ dày giới hạn chặt `shockW = 0.025 .. 0.033` (trong ngưỡng chống lóa `0.025–0.04`), rỗng tuyệt đối bên trong.
  + **48 Vệt tàn sao (`GARG_EMBERS`)** văng tỏa theo phương xuyên tâm cùng 4 chấm đuôi mờ dần về nền sao `#000000` (tại `19.85s` đạt `0` ký tự, `isDone = true`).
- **Ràng buộc chống lóa**: Không bao giờ sáng trắng diện rộng; nửa trái màn hình Desktop chứa tiêu đề & nút UI (`px < width * 0.52`) được giảm cường độ dịu (`leftFloor = 0.34` cho shockwave/embers) với bảng màu hổ phách / vàng kem ấm mắt.

---

## C. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Pass 100%, 0 failed (bao gồm toàn bộ test đồng bộ thân-lá, tia sáng đuổi đỉnh sao, Tidal Disruption, đĩa bồi tụ dày sợi, Quasar Jets + Hollow Shockwave).
2. `node scripts/build.js`: Build PWA Offline thành công 100%.
3. Slideshow luân chuyển mượt Cây thông $\leftrightarrow$ Hố đen, tuyết/sao chuyển đổi êm không khựng, giữ hiệu năng cao dưới 33ms/frame tại 1440×900.
