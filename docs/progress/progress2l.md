# TIẾN ĐỘ THỰC HIỆN ĐỢT 2L (`docs/progress/progress2l.md`)
> **Nhánh**: `feat/ascii-tree`  
> **Thời điểm hoàn thành**: 2026-11-19  
> **Trạng thái**: Hoàn tất 100% mục tiêu Đợt 2l

---

## 1. Kết Quả Thực Hiện

| Hạng mục | Trạng thái | Chi tiết triển khai |
| :--- | :---: | :--- |
| **Lớp hạt nền liên tục (`ambientParticles`)** | Hoàn thành | Đưa `_ambientParticles` và `_snowDistance` lên cấp toàn cục Engine. Tách biệt hoàn toàn khỏi `reset()`, tuyết rơi liên tục mượt mà khi Cây thông loop lại vòng mới, không bao giờ bị khựng hay teleport hạt. |
| **Chuyển mượt Tuyết <-> Sao (`snowBlend`)** | Hoàn thành | Nội suy tuyến tính 2.0 giây (`0.0 <-> 1.0`): ở chế độ Cây thông hạt rơi chéo thành tuyết; ở chế độ Hố đen vận tốc mượt về 0 thành bầu trời sao tĩnh lấp lánh; khi đổi cảnh hạt tăng/giảm tốc êm dịu. |
| **Nhịp xuất hiện Cây thông chậm rãi (9–10s)** | Hoàn thành | Phân tách rành mạch `t0`: Sàn (0s–1.5s) -> Thân (1.2s–2.5s) -> Tán lá (2.2s–6.8s) -> Dải LED xoắn & Quả châu & Đèn (6.5s–8.0s) -> 8 Hộp quà (7.8s–9.2s) -> Ngôi sao đỉnh & Hào quang (9.2s–10.0s). Trạng thái `allBorn` kích hoạt tại `10.0s`. |
| **Bổ sung 8 Hộp quà 3D rải rộng** | Hoàn thành | Thiết lập 8 hộp quà phong phú màu sắc tại các bán kính `r: 0.58 .. 1.10` (trong dải `0.55 .. 1.15`), xoay đều quanh gốc cây không bị tán lá dưới che khuất. |
| **Phủ ánh sáng vàng ấm Giáng sinh** | Hoàn thành | Ngôi sao đỉnh và dải LED rực rỡ sắc vàng kim `rgb(255, 215, 95)` (`[1.0, 0.843, 0.373]`). Nhuộm hòa sắc vàng ấm `25%–35%` lên tán lá thông, quả châu, nắp hộp quà theo khoảng cách. |
| **Đồng bộ thị giác Hố đen Gargantua** | Hoàn thành | Tinh chỉnh bảng màu heat và hiệu ứng Doppler tương đối tính bám sát 2 ảnh điện ảnh Interstellar: vành photon ring và đĩa trước trắng nung rực rỡ (`rgb(255, 252, 235)`), cánh đĩa bồi tụ vàng kim chuyển cam hổ phách. |

---

## 2. Báo Cáo Kiểm Thử & Đóng Gói

### 2.1. Kiểm thử tự động (`node tests/test-runner.js`)
- Tổng số test case thực thi: **1,226 passed, 0 failed**.
- Bổ sung kiểm thử tự động chuyên biệt cho Đợt 2l:
  + `buildAmbientParticles` sinh 240 hạt vi điểm với đầy đủ 8 trường thuộc tính.
  + `_snowDistance` và `_globalElapsedSec` bảo toàn nguyên vẹn qua các lần gọi `reset()`.
  + `buildSceneData` tạo lập chính xác 8 hộp quà 3D.
  + Kiểm tra chặn trên chặt chẽ tiến trình sinh tuần tự `t0`: Mặt sàn (`<= 1.5s`), Thân cây (`<= 2.5s`), Tán lá (`<= 6.8s`), Dải LED xoắn (`<= 8.0s`), 8 Hộp quà (`<= 9.2s`), Ngôi sao đỉnh (`<= 10.0s`).
  + Kiểm tra hòa sắc vàng ấm `rgb(255, 215, 95)` và `goldMix` trong Pass 2 deferred shading.

### 2.2. Đóng gói sản phẩm (`node scripts/build.js`)
- Xác thực cú pháp JS: **100% Passed**.
- Toàn bộ 100 tài nguyên runtime được sao chép sang `dist/`.
- Kích thước bundle: **4.67 MB**, sẵn sàng hoạt động ngoại tuyến (Offline-First PWA).

---

## 3. Các Tệp Tin Đã Chỉnh Sửa & Bổ Sung
1. `js/ascii-bg.js`: Cài đặt `buildAmbientParticles`, `renderAmbientParticlesToBuffer`, biến nội suy `snowBlend`, biến tích lũy `_snowDistance`, phân kỳ `t0` 0s–10s, 8 hộp quà rải rộng, ánh sáng vàng ấm `rgb(255, 215, 95)`, và bảng màu Doppler điện ảnh của Gargantua.
2. `tests/test-runner.js`: Cập nhật assertion `giftCount === 8` và bổ sung bộ kiểm thử chuyên sâu cho Wave 2l.
3. `docs/promt/promt2l.md`: Tài liệu đặc tả kỹ thuật Đợt 2l.
4. `docs/progress/progress2l.md`: Báo cáo tiến độ nghiệm thu Đợt 2l.
