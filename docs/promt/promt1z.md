# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 1Z (`docs/promt/promt1z.md`)
## Nâng Cấp Hiệu Ứng **Cây Thông Noel 3D ASCII** Lên Phiên Bản Cinematic: **Xoắn Ốc Phát Sáng, Sóng Bloom & Tan Biến Thành Hạt Sáng (Loop Liên Tục, 24 FPS, 0 Lag)**

> **File theo dõi tiến độ / handoff đi kèm**: `docs/handoff/handoff1z.md`

---

## 1. CHẨN ĐOÁN HIỆN TRẠNG (TỪ ẢNH MÀN HÌNH THỰC TẾ)

Cây thông hiện tại trông còn đơn điệu và chìm nền vì 3 lý do:
1. **Độ tương phản & bảng màu quá tối**: Các ký tự `.,-~:;=` màu xanh tối bị chìm vào nền `#070b0f`, đặc biệt khi đi qua các thẻ Liquid Glass.
2. **Thiếu hiệu ứng ánh sáng & chuyển động theo chu kỳ**: Cây chỉ xoay đều một kiểu tĩnh, các vòng tròn `oooooo` trông thô, chưa có dải đèn xoắn ốc phát sáng, chưa có ngôi sao tỏa tia và chưa có chu kỳ **hình thành $\rightarrow$ rực sáng $\rightarrow$ tan biến $\rightarrow$ lặp lại**.
3. **Chưa có Selective Glow (Phát sáng có chọn lọc)**: Thiếu lớp ánh sáng tỏa (bloom) quanh đỉnh sao, dải đèn và làn sóng năng lượng quét qua thân cây.

---

## 2. NÂNG CẤP THUẬT TOÁN `christmas-tree` TRONG `js/ascii-bg.js`

Giữ nguyên kiến trúc **1 `<canvas id="ascii-bg-canvas">`** trong `#bg-layer`, khóa **24 FPS**, tự tạm dừng khi ẩn tab / mở modal / đổi sang theme khác. Thay thế toàn bộ hàm render của preset `'christmas-tree'` bằng **Chu kỳ 4 Pha Liên Tục (Continuous 11-Second Cinematic Loop)**:

### 2.1. Chu kỳ 4 Pha Loop Mượt Mà (`cycleTime = t % 11.0`)
1. **Pha 1 — Khởi tạo & Quấn Xoắn Ốc (`0.0s -> 2.4s`)**:
   - Cây thông không hiện đùng một cái mà được **vẽ dần từ đáy lên đỉnh** theo đường xoắn ốc năng lượng, các ký tự chuyển từ thưa mờ (`. :`) sang dày sắc nét (`* # @`), dẫn dắt ánh nhìn lên tới khi ngôi sao đỉnh bùng sáng.
2. **Pha 2 — Đỉnh Cao 3D Xoay & Đèn Kép (`2.4s -> 6.8s`)**:
   - **Tán thông 3D phân tầng sắc nét**: Dùng phép chiếu 3D + Z-buffer với 5 tầng cành thông xếp lớp (`tier = 0..4`), độ sáng mặt trước dùng dải xanh ngọc phát quang (`#34d399`, `#6ee7b7`, `#a7f3d0`), mặt khuất dùng xanh thông trầm (`#064e3b`, `#065f46`) để tạo khối 3D rõ rệt.
   - **Dải đèn xoắn ốc kép (Double Helix Garland)**: Hai dải đèn quấn ngược chiều nhau quanh thân nón 3D bằng ký tự mảnh đẹp (`*`, `+`, `✦`, `·`), đổi màu luân phiên **Vàng hổ phách (`#fde047`) $\leftrightarrow$ Xanh băng (`#38bdf8`) $\leftrightarrow$ Hồng ngọc (`#fb7185`)** và nhấp nháy theo sóng sin.
   - **Ngôi sao đỉnh tỏa hào quang**: Ngôi sao 3D ở đỉnh (`★` / `✦`) có các tia sáng nhấp nháy xung quanh (`\ | / -`) thở theo nhịp `sin(t * 4)`.
3. **Pha 3 — Sóng Phát Sáng & Tan Biến Thành Hạt (`6.8s -> 9.8s`, "Phát sáng rồi biến mất")**:
   - Một **làn sóng ánh sáng (Luminous Scan Wave)** quét từ gốc lên đỉnh (kèm dải sáng trắng-mint `#ecfdf5` & vàng `#fef08a`).
   - Những ký tự mà làn sóng đi qua sẽ **bùng sáng rực lên** (chuyển sang ký tự mật độ cao `@ # *` với ánh sáng glow), rồi ngay phía sau làn sóng đó, từng ký tự **tách khỏi thân cây thành các hạt ánh sáng ASCII (`* + · .`) bay lơ lửng tản ra theo gió** và mờ dần (`alpha -> 0`) cho tới khi cây tan biến hoàn toàn vào nền đêm!
4. **Pha 4 — Khoảng Lặng & Tái Sinh (`9.8s -> 11.0s`)**:
   - Chỉ còn tuyết rơi nhẹ và vài tia sao tàn lấp lánh trong ~1.2 giây trước khi quay lại Pha 1 mượt mà vô tận.

### 2.2. Kỹ thuật "Selective Glow" (Phát Sáng Đẳng Cấp Mà 0 Lag)
- **Tuyệt đối KHÔNG bật `ctx.shadowBlur` cho toàn bộ lưới cây** (sẽ gây nặng GPU).
- Chia làm **2 pass vẽ trong mỗi frame**:
  1. **Pass 1 (Base Tree & Snow — `shadowBlur = 0`)**: Vẽ toàn bộ thân cây, bóng tối 3D và tuyết rơi với tốc độ siêu nhanh (< 0.5ms).
  2. **Pass 2 (Luminous Bloom Pass — `shadowBlur = 12`)**: Chỉ lọc ra **~50–90 ký tự đặc biệt** (ngôi sao đỉnh, hạt trên dải đèn xoắn ốc, các ký tự nằm đúng đỉnh sóng phát sáng ở Pha 3, và hạt tan biến đang sáng) để vẽ lại với `ctx.shadowColor` + `ctx.shadowBlur = 12` và `globalCompositeOperation = 'lighter'` (hoặc alpha cộng hưởng).
- Kết quả: Hiệu ứng phát sáng neon/hào quang **rực rỡ, có chiều sâu điện ảnh** nhưng GPU vẫn nhẹ tênh, giữ vững **90–120 FPS** cho giao diện Liquid Glass phía trên!

---

## 3. TỐI ƯU BỐ CỤC & ĐỘ DỄ NHÌN TRÊN NỀN APP

1. **Tăng độ sắc nét & căn vị trí thông minh**:
   - Trên màn hình rộng Desktop (`>= 1024px`), đặt trục tâm cây thông lệch nhẹ sang phải (khoảng `58%–62%` chiều rộng vùng content) hoặc giữ trung tâm với lớp phủ vignette mượt quanh khối chữ tiêu đề, giúp cây thông **vừa nổi bật nguyên vẹn dáng cây, vừa không bị chữ lớn đè che mất phần đỉnh và thân**.
   - Thay thế chữ `######` ở gốc cây bằng thân cây 3D mảnh gọn có đổ bóng (`||#||` với màu nâu ấm `#b45309` / `#d97706`) và thêm vòng phản chiếu ánh sáng mờ dưới chân cây (`~ . * . ~`).
2. **Thanh chỉnh độ sáng nền (`#ascii-opacity-slider`)**:
   - Đặt mặc định ở mức `0.78` (78%) cho preset mới để cây nổi rõ và sắc nét ngay từ đầu, người dùng vẫn có thể kéo giảm xuống nếu muốn dịu hơn khi làm bài thi dài.

---

## 4. DANH SÁCH KIỂM THỬ BẮT BUỘC

1. Mở theme **ASCII Động** (`🎄 Cây Thông Noel 3D`):
   - Quan sát đủ 4 pha trong ~11 giây: **Xoắn ốc hiện hình $\rightarrow$ Xoay 3D với dải đèn kép & sao tỏa tia $\rightarrow$ Sóng quét phát sáng rực $\rightarrow$ Tan biến thành hạt bay mờ dần $\rightarrow$ Loop lại mượt mà**.
2. Kiểm tra hiệu năng: Cuộn trang Ngân hàng câu hỏi / lật thẻ Flashcard 3D khi hiệu ứng đang chạy $\rightarrow$ UI vẫn mượt, không khựng lag.
3. Chạy `node tests/test-runner.js` và `node scripts/build.js` đảm bảo pass 100%, và cập nhật đầy đủ dấu `[x]` cùng kết quả vào `docs/handoff/handoff1z.md`.
