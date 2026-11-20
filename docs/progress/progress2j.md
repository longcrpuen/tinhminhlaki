# TIẾN ĐỘ THỰC HIỆN ĐỢT 2J (`docs/progress/progress2j.md`)
> **File đặc tả gốc**: `docs/promt/promt2j.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Viết lại renderer Hố đen Gargantua theo 100% thuật toán `py art.py` từ video gốc (hàm vân khí `gas()`, đĩa bồi tụ `accretion_disk()`, thấu kính Einstein `lensed_halo()`, chuyển động camera quanh `FLASH = 8.2s`, che khuất 3D nửa trước đĩa đè qua bóng đen, bảng ký tự 4 cấp độ và bảng màu nhiệt ấm dịu).

---

## Checklist Tiến Độ

- [x] **1. Cài đặt các hàm toán học cốt lõi từ `art.py`**
  - [x] Hàm `smooth(x)`: `clamp(x, 0, 1)` kết hợp Hermite interpolation `x * x * (3 - 2 * x)`.
  - [x] Hàm vân khí xoáy `gas(phi, rho, t, w)`: kết hợp vòng đồng tâm logarit `rings`, xoắn ốc kép `spiral` và vi sợi `fine`.
  - [x] Hàm đĩa bồi tụ `accretion_disk(X, Y, t, w, inc)`: xoay nghiêng `TILT = -0.23`, nén trục độ nghiêng `v / inc`, suy giảm biên `edge`, nhân tỷ lệ bán kính trong `R_IN / rho` và hiệu ứng Doppler beaming tương đối tính.
  - [x] Hàm thấu kính hấp dẫn Einstein `lensed_halo(r, ang, t, w)`: phân tách nửa trên/dưới `top`, nối liền hai bên hông `side = cos(ang - TILT)^10` với bán kính ảo `rhoHalo`.

- [x] **2. Camera & Các pha tiến trình**
  - [x] Chuyển động camera mượt quanh `FLASH = 8.2s`: `cam`, `zoom = 1 + 0.28 * cam`, `inc = INC + 0.09 * cam`, bù tâm dọc `Yc = (Y + 0.02 * cam) / zoom`.
  - [x] Pha 1 (Vành photon `ring`): vẽ vòng tròn tiếp tuyến tại `r ≈ 1.02 * R0` theo góc quay `around`.
  - [x] Pha 2 (Vầng hào quang `aura`): mở rộng tỏa nhiệt quanh lỗ đen.
  - [x] Pha 3 (Đĩa bồi tụ + thấu kính + sóng shockwave): mở rộng khẩu độ `span`, phóng đại thấu kính `haloScale`, bùng nổ sóng shockwave tại `t > FLASH`.

- [x] **3. Hòa trộn Screen Blend & Che khuất 3D chuẩn**
  - [x] Áp dụng công thức Screen Blend: `soft = 1 - (1 - aura * 0.55) * (1 - halo)`.
  - [x] Che khuất 3D thực tế: nửa trước đĩa `front_side = v > 0` đè cắt ngang qua bóng đen chân trời sự kiện `inside = r < R0 * 0.97`; nửa sau đĩa `v <= 0` bị che khuất hoàn toàn về `#000000`.

- [x] **4. Ký tự xoáy & Màu sắc nhiệt ấm dịu**
  - [x] Mở rộng bảng `ALL_GLYPHS` và bộ tạo pixel fallback hỗ trợ đầy đủ ký tự của 4 cấp độ:
    + Cấp 0: `..::--~~,,;;`
    + Cấp 1: `--==++//\\||`
    + Cấp 2: `++**##%%xxoo`
    + Cấp 3: `##%%@@$$&&88`
    + Tiếp tuyến photon ring: `- / | \`
  - [x] Bảng màu nhiệt chuyển tiếp mượt mà:
    + `heat < 0.20`: nâu đỏ trầm `rgb(115, 48, 24)`
    + `heat < 0.45`: cam đất ấm `rgb(175, 88, 42)`
    + `heat < 0.75`: vàng cam hổ phách `rgb(225, 148, 78)`
    + `heat >= 0.75`: kem vàng ấm `rgb(250, 215, 155)`
  - [x] Nhân hệ số dịu mắt `0.78` tại nửa trái màn hình (phía sau khối text hero).

- [x] **5. Pha kết thúc Galaxy Impact (Supernova Burst)**
  - [x] `t = 16.5 .. 17.5s`: Co xoáy toàn bộ đĩa vào tâm điểm kỳ dị (singularity).
  - [x] `t = 17.5 .. 19.5s`: Phát nổ sóng xung kích tròn, tia sáng 4 hướng và bụi sao văng ra trước khi tắt hẳn về 0 và báo `isDone = true` chuyển cảnh Slideshow.

- [x] **6. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,215 passed, 0 failed** (100% test suites).
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, hoàn tất đóng gói Offline PWA.

---

## Báo Cáo Đo Đạc Hiệu Năng & Ký Tự Thực Tế
*(Thực hiện bằng benchmark 60 frames trên màn hình Desktop chuẩn 1440×900, lưới điểm ảnh ASCII vi mô 5×8px, DPR = 1)*

| Cảnh hoạt ảnh | Số lượng ký tự trung bình (`letters`) | Thời gian dựng hình trung bình (`frame time`) | Đánh giá hiệu năng |
| :--- | :--- | :--- | :--- |
| **🌲 Cây thông Noel 3D** (`tree`) | **5,505 letters** | **4.19 ms / frame** | Tiêu tốn ~11.7% ngân sách 35.7 ms (28 FPS) |
| **🕳️ Hố đen Gargantua (`art.py`)** | **3,055 letters** | **9.64 ms / frame** | Tiêu tốn ~27.0% ngân sách 35.7 ms (28 FPS) |

> **Nhận xét**: Cảnh Hố đen Gargantua được render bám sát 100% công thức `art.py`, thể hiện trọn vẹn dải đĩa nghiêng trước đè qua bóng đen, các vòng khí xoắn ốc tinh tế và màu cam đất ấm dịu mắt, đồng thời giữ tốc độ xử lý dưới 10 ms/frame, bảo đảm độ mượt mà tuyệt đối cho toàn bộ ứng dụng.
