# TIẾN ĐỘ THỰC HIỆN ĐỢT 2M (`docs/progress/progress2m.md`)
> **Nhánh**: `feat/ascii-tree`  
> **Thời điểm hoàn thành**: 2026-11-20  
> **Trạng thái**: Hoàn tất 100% mục tiêu Đợt 2m

---

## 1. Kết Quả Thực Hiện

| Hạng mục | Trạng thái | Chi tiết triển khai |
| :--- | :---: | :--- |
| **A1. Thân cây mọc đồng bộ theo tán lá** | Hoàn thành | Gốc thân dưới tán mọc `1.20s–1.95s`; thân lõi từ `Y0` lên đỉnh bám sát từng tầng lá (`t0Stem = 1.95 + 4.00 * tierF`), luôn đi trước lá tại cùng cao độ `y` đúng **0.25s**, loại bỏ triệt để cột thân trống phía trên tán lá. |
| **A2. Tia sáng xoắn ốc đuổi lên chóp kích hoạt Ngôi sao đỉnh** | Hoàn thành | Cài đặt luồng sáng vàng rực `PULSE_START = 8.00s -> PULSE_END = 9.35s` (1.35s) chạy xoắn dọc dải LED lên đúng tâm đỉnh kèm sao chổi 3D 22 hạt đuôi. Đúng khoảnh khắc chạm đỉnh (`9.35s`), ngôi sao 5 cánh bùng sáng nở ra cùng vầng hào quang vàng ấm 28 tia tỏa nhẹ. |
| **B3. Pha mở đầu Tidal Disruption / Accretion Capture** | Hoàn thành | Triển khai `GARG_TIDAL_STREAMS` (54 sợi sao kéo giãn 12 phân đoạn xoắn ốc logarit có khử trùng ô) hút dồn từ vòng ngoài về `R0` trong `0s–3.5s`. Khi hội tụ quanh `R0`, vành photon bùng sáng sắc nét rồi mở bung 2 cánh đĩa bồi tụ và vầng thấu kính trên/dưới. |
| **B4. Gia cường 2 cánh đĩa bồi tụ & dải sáng mặt trước** | Hoàn thành | Cập nhật `accretion_disk` với suy hao `Math.pow(R_IN / Math.max(rho, 1e-4), 0.62)`, tăng biên độ sợi khí vùng cánh ngoài (`R0 * 1.4 .. R_OUT` qua `wingMask`), tăng độ dày & độ nổi cho dải đĩa băng ngang phía trước bóng đen (`front_side = v > 0`, `frontBoost = 1.25`). |
| **B5. Pha biến mất Quasar Relativistic Jets + Hollow Shockwave** | Hoàn thành | 3 giây cuối (`17.0s–19.85s`): Đĩa xoáy nén nhanh vào chân trời sự kiện, tụ năng lượng gọn tại tâm trong `0.5s` (`17.4s–17.9s`), phóng **2 luồng Relativistic Jets mảnh** ngược chiều dọc trục nghiêng (`±v`) + **1 vòng sóng xung kích rỗng ruột mảnh** (`shockW = 0.025–0.033`) + **48 vệt tàn sao (`GARG_EMBERS`)**, kèm giảm alpha dịu mắt cho nửa trái chứa chữ UI. Về đúng `0` ký tự và `isDone = true` tại `19.85s`. |
| **C. Lớp hạt nền liên tục & đồng nhất** | Hoàn thành | Tối ưu `renderTreeScene` sử dụng chung duy nhất lớp `ambientParticles` với `renderGargantuaToBuffer` (bỏ vẽ đè mảng `stars` cũ khi `particles` hoạt động), đảm bảo Slideshow luân chuyển Tuyết $\leftrightarrow$ Sao cực mượt, không khựng. |

---

## 2. Kết Quả Đo Đạc Hiệu Năng & Kiểm Thử

### 2.1. Hiệu năng Render Desktop `1440×900` (`DPR = 1`, khóa `30 FPS` — ngân sách 33.33ms/frame)
- **Cảnh Cây thông**:
  + Đang mọc & tia sáng đuổi chóp (`t = 8.5s – 9.8s`): **8,796 – 9,023 ký tự**, ~8–14 ms/frame.
  + Toàn cảnh (`t = 12.0s`): **8,967 ký tự**, đạt chuẩn 8.000+ ký tự vi điểm.
- **Cảnh Hố đen Gargantua**:
  + Mở đầu Tidal Disruption (`t = 1.0s – 2.8s`): **548 → 1,016 → 1,764 ký tự**, ~2–13 ms/frame.
  + Bung đĩa & Halo (`t = 3.5s – 5.0s`): **4,823 → 8,568 ký tự**, ~9–10 ms/frame.
  + Toàn cảnh (`t = 8.2s – 12.0s`): **8,577 – 8,651 ký tự**, **~9.9 – 10.6 ms/frame**.
  + Quasar Impact (`t = 18.0s – 19.4s`): **1,743 → 5,479 → 1,648 ký tự**, **~3.1 – 14.1 ms/frame**.
  + Kết thúc sạch (`t = 19.85s`): **0 ký tự**, `isDone = true`, **0.88 ms**.

### 2.2. Kiểm thử tự động (`node tests/test-runner.js`)
- Tổng số test case: **1,232 passed, 0 failed** (100% pass).
- Bổ sung kiểm thử xác minh đồng bộ chiều cao thân-lá (`0.2s–0.3s`), tia sáng đuổi đỉnh sao (`PULSE_START/END`), Tidal Disruption (`GARG_TIDAL_STREAMS`), công thức đĩa bồi tụ `pow(R_IN/rho, 0.62)`, và Quasar Relativistic Jets + Hollow Shockwave chống lóa.

### 2.3. Đóng gói sản phẩm (`node scripts/build.js`)
- Xác thực cú pháp JS: **100% Passed**.
- Đóng gói đầy đủ **100 assets** vào `dist/`, sẵn sàng chạy PWA Offline.

---

## 3. Các Tệp Tin Đã Chỉnh Sửa & Bổ Sung
1. `js/ascii-bg.js`: Toàn bộ nâng cấp Đợt 2m cho cả 2 cảnh `tree` và `gargantua`.
2. `tests/test-runner.js`: Cập nhật và bổ sung kiểm thử chuyên sâu cho Đợt 2m.
3. `docs/promt/promt2m.md`: Đặc tả kỹ thuật Đợt 2m.
4. `docs/progress/progress2m.md`: Báo cáo tiến độ & hiệu năng Đợt 2m.
