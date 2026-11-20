# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2G (`docs/promt/promt2g.md`)
## Nâng Cấp Nền ASCII: Hiệu Ứng Tuyết Rơi, Kiến Trúc Multi-Scene & Hoạt Ảnh Hố Đen Gargantua

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2g.md`  
> **Nhánh Git thực thi**: `feat/ascii-tree` (tách trực tiếp từ `main`)  
> **Phạm vi**: 
> 1. Hiệu ứng tuyết rơi ASCII nhẹ bay chéo trên nền `#000000` (Scene Cây thông).
> 2. Tách kiến trúc Scene Manager quản lý nhiều hoạt ảnh + 2 chế độ phát (`Slideshow` tự động chuyển mượt chu kỳ và `Chọn riêng` khóa cố định một cảnh).
> 3. Hoạt ảnh thứ 2: Hố đen Gargantua clone sát video tham chiếu `Video by jin_22ee.mp4` (`art.py`), lệch phải trên desktop, giữ lưới ASCII mịn `DPR = 1`, 24–30 FPS.
> 4. Cập nhật UI điều khiển chuyển cảnh (topbar HUD capsule chip & Settings pill group) đồng bộ Liquid Glass đen khói trong suốt, bổ sung Test Suite 34 vào `tests/test-runner.js`.

---

## 1. MỤC TIÊU & YÊU CẦU CHI TIẾT

### 1. Hiệu ứng tuyết rơi (ASCII Snowfall Layer)
- Thêm lớp hạt tuyết ASCII rơi nhẹ, bay hơi chéo theo chiều gió trên nền đen `#000000`.
- Phân bố ~220 hạt tuyết đa tầng với tốc độ rơi `vy` và độ trôi ngang `wind` kết hợp dao động điều hòa `sway` nhẹ.
- Ký tự thanh mảnh, sắc nét: `.`, `·`, `*`, `+`, `:` với tông màu trắng băng/xanh tuyết mát lạnh `rgb(210..255, 225..255, 255)`.
- Tối ưu cực đại qua Sparse Blit O(N), không gây sụt giảm khung hình, bảo đảm 28 FPS và UI Liquid Glass mượt mà. Hỗ trợ `prefers-reduced-motion: reduce` (tuyết tĩnh nhẹ).

### 2. Kiến trúc Multi-Scene Manager & 2 Chế Độ Phát
- Tổ chức `js/ascii-bg.js` thành hệ thống Scene Manager linh hoạt:
  + `AsciiBg.SCENES`: bảng đăng ký hoạt ảnh (`tree`, `gargantua`).
  + `AsciiBg.registerScene(id, sceneDef)`: hàm mở rộng cho phép bổ sung các cảnh ASCII mới trong tương lai.
- Hỗ trợ 2 chế độ phát lưu trữ bền vững trong `localStorage`:
  + **Slideshow (`slideshow`)**: Tự động chuyển mượt sang hoạt ảnh tiếp theo khi kết thúc chu kỳ của cảnh hiện tại (Tree: 26.0s; Gargantua: 25.0s), quá trình chuyển cảnh tự nhiên giữa các pha tan rã không giật cục.
  + **Chọn riêng (`single`)**: Khóa cố định một hoạt ảnh (ví dụ chỉ chạy Cây thông hoặc chỉ chạy Hố đen Gargantua) lặp vô tận.
- Giao diện chuyển đổi tiện lợi:
  + Nút chip bấm nhanh trên thanh topbar HUD capsule (`#ascii-scene-quick-ctrl`): 1-click xoay vòng `Slideshow ↻` → `Cây thông 🌲` → `Hố đen 🪐`.
  + Cụm 3 nút chọn phân đoạn trong Cài đặt (`#ascii-scene-settings-bar`): hiển thị rõ ràng chế độ đang kích hoạt.

### 3. Hoạt Ảnh Hố Đen Gargantua (Scene 2)
- Clone sát cấu trúc vật lý quang học từ mã nguồn `art.py` trong video `Video by jin_22ee.mp4`:
  1. **Vòng sáng quang tử tự vẽ (`t = 0.3s .. 2.5s`)**: Vòng photon ring bán kính `r ≈ 1.02 * R0` tự vẽ quanh chân trời sự kiện, hiển thị bằng các ký tự tiếp tuyến `-`, `/`, `|`, `\`.
  2. **Quầng sáng thở & bụi khí quyển (`t = 2.2s .. 5.0s`)**: Vùng breathing corona rực sáng và co giãn gợn sóng quanh mép trong của đĩa bồi tụ.
  3. **Đĩa bồi tụ tỏa ngang + Chớp nổ & Sóng xung kích (`t >= 5.0s`, `FLASH = 5.4s`)**: Đĩa bồi tụ nghiêng góc `TILT ≈ -13.75°`, camera zoom & nghiêng theo nhịp flash, sóng shockwave lan tỏa hình cầu.
  4. **Thấu kính hấp dẫn uốn cong trên dưới (`lensed_halo`)**: Vầng ánh sáng đĩa bồi tụ phía xa bị lực hấp dẫn bẻ cong vồng lên trên và cuộn xuống dưới bóng tối chân trời sự kiện.
  5. **Hiệu ứng Doppler tương đối tính & Cắt bóng Event Horizon**: Nửa đĩa quay về phía người quan sát sáng rực hơn hẳn nửa quay ra xa; phần trước của đĩa (`v > 0`) vắt ngang qua bóng tối trung tâm, phần sau (`v <= 0`) bị bóng hố đen che khuất hoàn toàn.
  6. **Bảng màu bức xạ vật đen**: Thang nhiệt `heat` chuyển từ than hồng `rgb(95, 32, 10)` → cam rực `rgb(140, 52, 20)` → vàng hổ phách `rgb(205, 102, 35)` → kem đào ấm `rgb(245, 172, 65)` → lõi trắng chói `rgb(255, 237, 175)`.
  7. **Pha tan rã kết thúc chu kỳ (`t = 21.5s .. 25.0s`)**: Đĩa bồi tụ nguội dần và thu nhỏ mượt mà vào hư không vũ trụ trước khi chu kỳ lặp lại hoặc chuyển tiếp slideshow.
- Bố cục lệch phải trên desktop (`cx ≈ 0.735 * width`, `cy ≈ 0.49 * height`), căn giữa trên mobile, không bị cụm chữ hero và các nút che khuất.

---

## 2. KẾT QUẢ KIỂM THỬ & CHỈ SỐ ĐO ĐẠC

1. `node --check js/ascii-bg.js`, `node --check js/app.js`, `node --check tests/test-runner.js`: Đạt chuẩn 100%.
2. Test Suite 34 (464 assertions mở rộng) tích hợp vào `tests/test-runner.js`: **1,196 passed, 0 failed**.
3. `node scripts/build.js`: Đóng gói thành công 100 files, 4.65 MB.
4. **Chỉ số hiệu năng thực tế (Node 60 frames bench, cell 5x8px, DPR = 1)**:
   - **Scene Cây thông**:
     + `1440×900`: trung bình `5,717` letters, `3.70 ms/frame`.
     + `1920×1080`: trung bình `7,818` letters, `4.50 ms/frame`.
   - **Scene Hố đen Gargantua**:
     + `1440×900`: trung bình `19,636` letters, `10.45 ms/frame`.
     + `1920×1080`: trung bình `30,723` letters, `17.00 ms/frame`.
   - Cả hai hoạt ảnh đều nằm sâu dưới ngưỡng frame budget của 28 FPS (~35.7 ms), bảo đảm UI Liquid Glass hoạt động mượt mà không tụt FPS.
