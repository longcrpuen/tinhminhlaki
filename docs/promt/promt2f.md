# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2F (`docs/promt/promt2f.md`)
## Giao Diện Nền Cây Thông ASCII 3D (`theme="ascii"`, `js/ascii-bg.js`) & Tối Ưu Hóa Render Liquid Glass 24–30 FPS

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2f.md`  
> **Nhánh Git thực thi**: `feat/ascii-tree` (tách trực tiếp từ `main`)  
> **Phạm vi**: Bổ sung theme thứ 4 `ascii` (`js/ascii-bg.js`, `css/theme.css`, `css/style.css`, `index.html`, `js/app.js`, `scripts/build.js`, `sw.js`) và Test Suite 33 trong `tests/test-runner.js`. **Không ảnh hưởng 3 theme hiện có** (`violet-rose`, `monochrome`, `white-orange`).

---

## 1. MỤC TIÊU & BỐI CẢNH

Xây dựng theme thứ 4 mang tên **`ascii`** cho TinhMinhLaKey với hiệu ứng nền 3D cây thông Noel ASCII tái hiện chính xác cấu trúc, tỷ lệ, bảng màu và nhịp mọc phát sáng của mã nguồn `agac.py` trong video tham chiếu `ok.mp4`:
- **Tỷ lệ & hình học chuẩn `agac.py`**: `Y0 = 0.42`, `Y1 = 2.55`, hàm bao tán lá `envelope(y)`, phân bố cầu Fibonacci `fib(n)`, 26 tầng cành rủ tự nhiên (`NEEDLE`), lớp tuyết đọng ngọn cành (`SNOWCAP`), thân cây vỏ sần (`TRUNK`), dải kim tuyến xoắn ốc 3.6 vòng (`2600 × 5` điểm `GARLAND`), 44 quả châu bóng bẩy (`BALL`, `fib(144)`), 170 bóng đèn nhỏ (`LIGHT`, `fib(22)`), ngôi sao 5 cánh vát khối 3D + quầng sáng trên đỉnh (`STAR`), 5 hộp quà thắt nơ (`GIFT`, `RIBBON`) và mặt sàn chấm tròn đồng tâm tỏa sáng dưới gốc (`GROUND`) trên bầu trời đêm đầy sao.
- **Nhịp mọc phát sáng (`t0`)**: Mặt sàn lan dần từ tâm ra ngoài, thân mọc lên, tán lá bừng sáng trắng từ thân ra ngọn và từ dưới lên trên, tiếp nối bởi kim tuyến, quả châu, hộp quà, đèn và ngôi sao đỉnh.

---

## 2. 4 ĐIỂM BỔ SUNG / ĐIỀU CHỈNH SO VỚI VIDEO

1. **Góc nhìn camera hơi chéo từ trên xuống (`15°–25°`)**:
   - Đặt góc nghiêng `CAMERA_PITCH_DEG = 20°` nhìn chếch từ trên xuống (`yCam = dy * cosP + z1 * sinP`, `zCam = -dy * sinP + z1 * cosP + CAM_DIST`), giúp thấy rõ độ sâu 3D của các vòng tán lá, hộp quà quanh gốc và hình elip phối cảnh của mặt sàn chấm tròn.
2. **Dải LED / kim tuyến phát sáng lần lượt kiểu wave/domino**:
   - Dải kim tuyến `GARLAND` (chia 42 hạt theo pha xoắn `ph`) và 170 bóng đèn `LIGHT` chạy hai sóng ánh sáng đuổi nhau (`computeDominoIntensity`), làm từng đoạn kim tuyến và cụm đèn bừng sáng lần lượt kiểu domino/wave (tần số nhấp nháy nhẹ đảm bảo chuẩn an toàn WCAG 2.3.1 `< 3 Hz`).
3. **Pha biến mất tan rã nhẹ rồi lặp lại chu kỳ (`CYCLE_DURATION = 26.0s`)**:
   - Sau pha xoay trình diễn (`9.4s–21.2s`), toàn bộ hạt bước vào pha tan rã stardust (`21.2s–25.2s`): hạt trôi nhẹ lên trên và lan ra ngoài theo độ cao + pha ngẫu nhiên, độ sáng giảm dần và hạ cấp ký tự mượt mà qua `:` -> `·` -> `.` rồi biến mất hẳn trong khoảnh khắc nền sao đêm trước khi lặp lại chu kỳ mới.
4. **Mật độ ký tự cao, mịn như điểm ảnh (`DPR = 1`), giới hạn 24–30 FPS & tối ưu cho Liquid Glass**:
   - Khóa cứng `DPR = 1`, kích thước ô ký tự siêu mịn (`5×8px` trên desktop `font 7.5px`, `4×7px` trên mobile `font 6.5px`), phóng tỷ lệ chiếu lớn hơn ~18% (`focal = min(height * 1.13, width * 0.82)`) tại tâm vùng trống bên phải `cx = width * 0.74` trên desktop.
   - Pre-bake bảng tra ký tự thưa (**Sparse Glyph Atlas**), dùng thuật toán **Deferred Z-Buffer** bằng `Float32Array` / `Int32Array` và ghi pixel trực tiếp qua `Uint32Array` (`buf32`) với nhánh tối ưu nội vùng và fast-path `allBorn` (0 cấp phát object mỗi khung hình).
   - Giới hạn tốc độ khung hình ở **28 FPS** (`FPS_LIMIT = 28`), tự động tạm dừng khi đổi sang theme khác, khi ẩn tab (`visibilitychange`), khi app idle 30s (`app-idle`), hoặc hiển thị khung hình tĩnh hoàn chỉnh khi bật `prefers-reduced-motion: reduce`.

---

## 3. ĐỒNG BỘ GIAO DIỆN LIQUID GLASS CHO THEME `ascii`

- Bổ sung bộ biến token hoàn chỉnh `[data-theme="ascii"]` (bao gồm `--glass-slab-*`, `--modal-convex-*`, `--card-frosted-*`, `--shadow-*`) trong `css/theme.css` và khối `GROUP 5` ở cuối `css/style.css` theo tông **đen-xám khói trong suốt** (`backdrop-filter: blur(...)` + viền sáng specular mảnh cạnh trên/trái + đổ bóng mềm, **0% sắc tím**), phủ đồng bộ lên sidebar trái, khung hero (tắt blur vùng cây bên phải để cây nét 100%), 4 thẻ thống kê, thanh nhạc, nút bấm, pill chọn theme, modal/popup và mobile bottom nav.
- Ẩn `#bg-layer` và ánh nền tím `body::before` khi `data-theme="ascii"` đang kích hoạt; giữ nguyên 100% ảnh nền đã lưu của người dùng khi chuyển trở lại 3 theme còn lại.
- Tích hợp nút chuyển nhanh trên topbar, nút chọn trong buồng sóng năng lượng Cài đặt, mobile bottom nav (`css/style.css`), danh sách kiểm tra build (`scripts/build.js`) và Service Worker cache (`sw.js`).

---

## 4. DANH SÁCH KIỂM THỬ BẮT BUỘC

1. Kiểm tra cú pháp JS (`node --check js/ascii-bg.js`, `js/app.js`, `tests/test-runner.js`).
2. Test Suite 33 trong `tests/test-runner.js` xác minh: cấu hình `DPR = 1`, `24 <= FPS_LIMIT <= 30`, `15 <= CAMERA_PITCH_DEG <= 25`, đầy đủ 10 nhóm phần tử 3D, hiệu ứng domino, pha tan rã, render buffer không lỗi và giữ nguyên vẹn 3 theme cũ.
3. Chạy `node tests/test-runner.js` đạt 100% Pass (0 failed).
4. Chạy `node scripts/build.js` đóng gói thành công 100% và xác nhận có `dist/js/ascii-bg.js`.
