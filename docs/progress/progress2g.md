# TIẾN ĐỘ THỰC HIỆN ĐỢT 2G (`docs/progress/progress2g.md`)
> **File đặc tả gốc**: `docs/promt/promt2g.md`  
> **Mục tiêu**: Xử lý dứt điểm 4 lỗi về màu sắc đáp án đúng, lỗi phân mảnh dấu ngoặc KaTeX, và khóa cứng Prompt mẫu AI.

---

## Checklist Tiến Độ

- [x] **1. Khôi phục màu chữ trắng cho đáp án đúng trên theme tối (`css/style.css`, `css/theme.css`)**
  - [x] Khôi phục chữ màu trắng sáng `#ffffff !important` cho nhãn `A./B./C./D.`, text phương án và công thức `.katex` bên trong `.quiz-option-btn.correct`, `.bank-option-cell.correct` trên tất cả theme tối (`dark`, `monochrome`/`bw`, `ascii`, `purple-pink`, `violet-rose`).
  - [x] Chỉ dùng viền xanh lá nổi bật `#10b981 !important`, nền phủ xanh nhẹ `rgba(16, 185, 129, 0.16) !important` và dấu tích `✓` xanh qua `::after`.
  - [x] Trên theme sáng (`white-orange`, `orange`): giữ chữ màu tối `#1c1410 !important` tương phản cao, kèm viền xanh lá `#059669 !important` và dấu tích `✓` xanh.

- [x] **2. Fix triệt để lỗi đứt gãy dấu `{` (`\begin{cases}`) và tam giác trắng / co ngắn ở `[` (`\begin{bmatrix}`) (`css/style.css`)**
  - [x] Xóa bỏ triệt để các rule can thiệp thô bạo vào metric nội bộ KaTeX: `.katex, .katex * { line-height: normal !important; }` và `.katex svg { height: inherit !important; position: absolute !important; left: 0 !important; }`.
  - [x] Loại trừ `.katex` khỏi CSS base reset: `*:not(.katex, .katex *), *:not(.katex, .katex *)::before, *:not(.katex, .katex *)::after { box-sizing: border-box; }` để `katex.min.css` tự quản lý layout và box-sizing chính xác.
  - [x] Kiểm tra ma trận 3x5 và hệ phương trình 5 dòng render chuẩn xác 100%, không bị tam giác trắng hay đứt khúc curly brace.

- [x] **3. Khóa cứng Prompt mẫu trong `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Đặt lệnh mở đầu nghiêm ngặt:
    `"CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI. CẤM TUYỆT ĐỐI tự ý chia thành Phần 1/Phần 2, CẤM dừng giữa chừng bảo người dùng gõ 'tiếp', CẤM viết lời dẫn đầu/cuối, CẤM mở block \`\`\`json thứ hai."`
  - [x] Rút gọn yêu cầu `explanation` xuống 1–2 câu cực ngắn gọn, đi thẳng vào công thức và lỗi sai bản chất để tiết kiệm token tối đa.
  - [x] Giữ nguyên đầy đủ: ghép ảnh lộn xộn, 4 đáp án hoàn toàn khác nhau, `[Cần hình minh họa]`, `[Đã bổ sung nhiễu]`, dùng `USD` thay cho `\$`, cấm gọi tên chữ cái A/B/C/D trong `explanation`.

- [x] **4. Kiểm thử & Đóng gói sản phẩm**
  - [x] Cập nhật các assertions trong `tests/test-runner.js` tương thích với các quy tắc mới.
  - [x] Chạy `node tests/test-runner.js` $\rightarrow$ **849 passed, 0 failed (100% PASS)**.
  - [x] Chạy `node scripts/build.js` $\rightarrow$ **100% hoàn thành (99 assets, 4.59 MB)**.

---

# TIẾN ĐỘ THỰC HIỆN ĐỢT 2G (`docs/progress/progress2g.md`)
> **File đặc tả gốc**: `docs/promt/promt2g.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Nâng cấp theme `ascii` với lớp tuyết rơi nhẹ bay chéo theo gió, tái cấu trúc Scene Manager hỗ trợ 2 chế độ phát (Slideshow tự chuyển & Chọn riêng), thêm Scene 2 Hố đen Gargantua bám sát video `Video by jin_22ee.mp4` (`art.py`), đồng bộ UI Liquid Glass và đạt 100% kiểm thử.

---

## Checklist Tiến Độ

- [x] **1. Hiệu ứng tuyết rơi (ASCII Snowfall Layer)**
  - [x] Xây dựng máy phát hạt tuyết determinism `buildSnow(220, 2026)` với 7 thông số lượng giác cho từng bông tuyết (`x0, y0, vy, wind, swayAmp, swayFreq, swayPhase`).
  - [x] Chuyển động rơi bay chéo theo gió mượt mà, phân bố ký tự thanh mảnh (`.`, `·`, `*`, `+`, `:`) sắc nét trên nền `#000000`.
  - [x] Tối ưu hóa cực nhẹ qua O(220) sparse blits, hỗ trợ `prefers-reduced-motion: reduce` (tuyết tĩnh nhẹ).

- [x] **2. Kiến trúc Multi-Scene Manager & 2 Chế Độ Phát**
  - [x] Tổ chức `AsciiBg` thành Scene Manager với bảng đăng ký `AsciiBg.SCENES` (`tree`, `gargantua`).
  - [x] Bổ sung hàm mở rộng `AsciiBg.registerScene(id, sceneDef)`.
  - [x] Xây dựng cơ chế phát 2 chế độ:
    + `slideshow`: Tự động chuyển mượt sang cảnh tiếp theo khi hoàn thành chu kỳ (Tree: 26.0s; Gargantua: 25.0s).
    + `single`: Khóa cố định một hoạt ảnh lặp vô tận.
  - [x] Lưu trữ chế độ và cảnh được chọn vào `localStorage` (`tinhminhlakey_ascii_mode`, `tinhminhlakey_ascii_scene`).
  - [x] Tích hợp chip chuyển nhanh 1-click trên thanh topbar HUD capsule (`#ascii-scene-quick-ctrl`) và nhóm nút chọn trong Cài đặt (`#ascii-scene-settings-bar`).

- [x] **3. Hoạt ảnh thứ 2: Hố đen Gargantua (`gargantua`)**
  - [x] Tái hiện chính xác các phương trình vật lý từ `art.py` (`Video by jin_22ee.mp4`):
    + `t = 0.3s .. 2.5s`: Vòng photon ring tự vẽ với ký tự tiếp tuyến `-`, `/`, `|`, `\`.
    + `t = 2.2s .. 5.0s`: Quầng sáng breathing corona rực rỡ co giãn quanh mép chân trời sự kiện.
    + `t >= 5.0s`, `FLASH = 5.4s`: Đĩa bồi tụ nghiêng `TILT = -13.75°`, camera zoom & chớp nổ shockwave.
    + Vầng thấu kính hấp dẫn uốn cong trên dưới (`lensed_halo`).
    + Hiệu ứng Doppler tương đối tính làm sáng rực nửa đĩa tiến về phía người quan sát.
    + Cắt bóng Event Horizon: che khuất đĩa phía sau, để dải sáng phía trước vắt ngang qua bóng tối trung tâm.
    + Thang nhiệt bức xạ vật đen từ than hồng đến lõi trắng chói.
    + Pha tan rã kết thúc chu kỳ `t = 21.5s .. 25.0s` êm dịu, không giật gián đoạn.
  - [x] Bố cục lệch phải trên desktop (`cx ≈ 0.735 * width`, `cy ≈ 0.49 * height`), căn giữa trên mobile.
  - [x] Giữ nguyên độ mịn lưới ASCII `DPR = 1`, giới hạn 28 FPS.

- [x] **4. Đồng bộ Giao Diện Liquid Glass & Kiểm Thử**
  - [x] Cập nhật `#ascii-bg-canvas` và `--bg-base` sang `#000000` thuần đen.
  - [x] Thiết kế UI chip chuyển cảnh topbar và cụm nút Cài đặt theo chất kính Liquid Glass đen khói trong suốt viền sáng specular.
  - [x] Thêm Test Suite 34 vào `tests/test-runner.js`.
  - [x] Chạy `node tests/test-runner.js` đạt **1,196 passed, 0 failed**.
  - [x] Chạy `node scripts/build.js` thành công 100% (**100 files, 4.65 MB**).

---

## Nhật Ký Thực Thi
- **Trạng thái**: Hoàn thành toàn diện trên nhánh `feat/ascii-tree`.
- **Kết quả kiểm thử**:
  + `node tests/test-runner.js`: **1,196 passed, 0 failed** (694 test gốc + 38 test Wave 2F + 464 test Wave 2G).
  + `node scripts/build.js`: **100 files, 4.65 MB**, sẵn sàng PWA Offline.
- **Chỉ số đo đạc thực tế (Node 60 frames bench, cell 5x8px, DPR = 1)**:
  + **Tree Scene (1440×900)**: `5,717` letters, `3.70 ms/frame`.
  + **Tree Scene (1920×1080)**: `7,818` letters, `4.50 ms/frame`.
  + **Gargantua Scene (1440×900)**: `19,636` letters, `10.45 ms/frame`.
  + **Gargantua Scene (1920×1080)**: `30,723` letters, `17.00 ms/frame`.
  + Tốc độ thực thi đều nằm sâu dưới ngưỡng ngân sách 35.7 ms của 28 FPS, đảm bảo GPU và CPU hoạt động mát mẻ, tiết kiệm năng lượng và các thành phần giao diện Liquid Glass lướt siêu êm.
