# TIẾN ĐỘ THỰC HIỆN ĐỢT 2F (`docs/progress/progress2f.md`)
> **File đặc tả gốc**: `docs/promt/promt2f.md`  
> **Mục tiêu**: Xử lý triệt để 6 lỗi hiển thị, parser LaTeX và Prompt mẫu trong `js/app.js`, `js/parser.js`, `css/style.css`, cập nhật hệ thống test suite và tài liệu theo quy ước.

---

## Checklist Tiến Độ

- [x] **1. Sửa lỗi `\$` (ký hiệu đô-la tiền tệ) và mất dấu căn `\sqrt{8}` (`js/app.js` - `renderLatexText`)**
  - [x] Đặt cơ chế bảo vệ placeholder `@@@MS_ESCAPED_DOLLAR@@@` đối với regex `/(?<!\\)\\\$/g` trước khi tokenize math.
  - [x] Phục hồi ký hiệu `$` thường trong các khối text, fast-path, và giữ nguyên cấu trúc `\$` trong KaTeX nếu có.
  - [x] Không để `"giá là \$50 cho mỗi đơn vị... hàm của $x, y$"` bị bắt nhầm thành khối công thức.
  - [x] Đảm bảo `\sqrt{8}` trong `"biết $-0,828 \approx 2 - \sqrt{8}$"` render đầy đủ SVG và cấu trúc `hide-tail`.

- [x] **2. Sửa triệt để lỗi tam giác trắng ở ngoặc vuông ma trận KaTeX và dấu căn (`css/style.css`)**
  - [x] Bổ sung cấu hình `line-height: normal !important;` cho `.katex` và mọi con cháu `.katex *`.
  - [x] Thiết lập cách ly SVG cho `.katex svg`, `.katex .delimsizing svg`, `.katex .stretchy svg`, `.katex .hide-tail svg` với `display: block !important; position: absolute !important; width: 100% !important; height: inherit !important; overflow: visible !important;`.
  - [x] Đặt `fill: currentColor !important; stroke: none !important;` cho `.katex svg path`.

- [x] **3. Chuẩn hóa bố cục đáp án 2x2 vs 1 cột dọc (`js/app.js`, `css/style.css`)**
  - [x] Đảm bảo trong `css/style.css`: `.quiz-options`, `.quiz-options-list`, `#quiz-options-container`, `#exam-options-container` mặc định luôn là 2 cột `repeat(2, minmax(0, 1fr))` trên desktop, 1 cột trên mobile.
  - [x] Siết chặt logic trong `isWideMatrixOrTableOption(text)` (`js/app.js`): Tuyệt đối KHÔNG dựa vào độ dài chuỗi LaTeX thô (như `\frac`, `\begin{cases}`).
  - [x] CHỈ gán `.quiz-options--single-col` khi có ít nhất 1 đáp án chứa bảng Markdown (`<table class="md-table">`) HOẶC ma trận rộng $\ge 3$ cột ($\ge 2$ dấu `&` trên cùng 1 hàng).
  - [x] Vectơ cột 1 chiều, hệ phương trình nhỏ `\begin{cases}`, công thức LaTeX thông thường đều giữ nguyên lưới 2x2.
  - [x] Cập nhật logic trong `adaptOptionsLayout`, `_renderOptionsBlock`, `renderExamQuestion`, và `renderExamLMSView`.

- [x] **4. Sửa dứt điểm rớt dấu chấm `A .` / `D .` trên tất cả màn hình (`css/style.css`, `js/app.js`)**
  - [x] Áp dụng `white-space: nowrap !important; flex-shrink: 0 !important; align-self: flex-start !important; min-width: 1.6em !important;` cho `.quiz-option-letter` ở cả `#view-study`, `#view-exam`, `#view-bank`, và `.bank-option-cell`.
  - [x] Trong `renderQuestionBank`: thay `<b>${letter}.</b>` bằng `<span class="quiz-option-letter select-none">${letter}.</span>`.

- [x] **5. Thêm Badge cảnh báo cho câu hỏi cần hình minh họa nhưng chưa có ảnh (`js/app.js`, `css/style.css`)**
  - [x] Cài đặt `isQuestionMissingImage(card)` và `renderMissingImageBadgeHtml(card)`.
  - [x] Nhận diện câu hỏi có `[Cần hình minh họa]`, `hình vẽ minh họa`, `đồ thị bên`, hoặc `bảng bên dưới` mà không có bảng Markdown.
  - [x] Hiển thị badge: `"⚠️ Câu hỏi này cần hình minh họa gốc — bấm biểu tượng ✏️ Sửa thẻ để dán/tải ảnh lên"`.
  - [x] Gắn badge vào Study view, Exam view, Exam LMS view, Flashcard, và Question Bank.
  - [x] Thiết kế CSS đẹp mắt và hỗ trợ đầy đủ 4 theme (`default`, `monochrome`, `white-orange`, `ascii`).

- [x] **6. Viết lại `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Nâng cấp template prompt với 5 quy tắc chuẩn kỷ luật cứng, súc tích và mạch lạc.
  - [x] Quy tắc 1: Ghép ảnh & Đủ 100% số câu (tự đối chiếu ghép mép ảnh, đủ 4 lựa chọn a-d, bảng Markdown `|...|`).
  - [x] Quy tắc 2: Xử lý câu bị thiếu dữ kiện/ảnh (tìm kiếm bổ sung chính xác 100%, bổ sung nhiễu `[Đã bổ sung nhiễu]`, giữ chỗ sơ đồ/đồ thị `[Cần hình minh họa]`).
  - [x] Quy tắc 3: Kỷ luật cú pháp JSON (chống lỗi parse, escape LaTeX, code blocks, cấm ký hiệu trích dẫn `[cite: 1, 2]`).
  - [x] Quy tắc 4: Chiến lược Hybrid xử lý hình ảnh & bảng biểu (OCR công thức/bảng, giữ ảnh sơ đồ/đồ thị).
  - [x] Quy tắc 5: Cấm tuyệt đối gọi tên chữ cái đáp án A/B/C/D trong `explanation` (phù hợp tính năng shuffle).
  - [x] Tương thích 100% với toàn bộ các assertion kiểm tra prompt template trong các test suite trước.

- [x] **7. Kiểm thử & Đóng gói sản phẩm**
  - [x] Bổ sung Test Suite 37 vào `tests/test-runner.js` với các assertions kiểm tra toàn diện.
  - [x] Chạy `node tests/test-runner.js` $\rightarrow$ **826 passed, 0 failed (100% PASS)**.
  - [x] Chạy `node scripts/build.js` $\rightarrow$ **100% hoàn thành (99 assets, 4.58 MB)**.

- [x] **8. Nâng cấp bổ sung 5 hạng mục hiển thị & dữ liệu nâng cao**
  - [x] **Mục 1**: Fix triệt để lỗi tam giác trắng ở ngoặc `[` ma trận KaTeX (`box-sizing: content-box !important`, `position: absolute; left: 0; top: 0;`, `stroke: none !important; stroke-width: 0 !important;` trên path, bảo vệ container `.katex .stretchy`).
  - [x] **Mục 2**: Thu gọn khoảng cách thừa quanh khối công thức Toán `$$...$$` (`margin: 0.4em 0 !important;`, khử triệt để `<br>` thừa trước/sau `.katex-display-wrap` trong `formatRichText`).
  - [x] **Mục 3**: Căn thẳng hàng LaTeX với chữ tiếng Việt trên Ngân hàng câu hỏi & các màn hình (`.bank-question-text`, `.bank-option-text`, `line-height: 1.55 !important;`, `vertical-align: baseline !important;`, `font-size: 1.02em !important;`).
  - [x] **Mục 4**: Đồng bộ màu xanh lá cho toàn bộ đáp án đúng (nhãn A-D, text nội dung và `.katex` bên trong) trên Study, Bank, Exam. Thiết lập `--success-text`: theme tối `#34d399` / `#4ade80`, theme sáng `#047857`. Tách riêng `selected` và `correct` trong Exam mode.
  - [x] **Mục 5**: Chống sinh 2 đáp án trùng nhau: bổ sung chỉ thị nghiêm cấm trùng lặp vào Quy tắc 1 của `AIParser.generateAIPromptTemplate`; tự động phát hiện đáp án trùng lặp trong `AIParser.parse()` (chuẩn hóa khoảng trắng) và gắn tag `[Cần kiểm tra: trùng đáp án]` + cờ `hasDuplicateOptions`.
  - [x] Bổ sung Test Suite 38 với 25 assertions kiểm tra toàn bộ 5 hạng mục.

---

## Nhật Ký Thực Thi
- **Trạng thái**: Hoàn thành 100% (Completed)
- **Files thay đổi**:
  + `js/app.js`: Khử `<br>` thừa quanh `$$...$$`, gán `bank-question-text` & `bank-option-text`, hiển thị badge cảnh báo trùng lặp đáp án.
  + `js/parser.js`: Thêm chỉ thị chống trùng đáp án trong template prompt, phát hiện và gắn tag `[Cần kiểm tra: trùng đáp án]` trong cả JSON và Text parser.
  + `css/style.css`: KaTeX SVG isolation & content-box shield, `margin: 0.4em 0 !important;` cho display math, baseline alignment, đồng bộ màu xanh lá cho đáp án đúng ở cả 3 chế độ.
  + `css/theme.css`: Định nghĩa biến `--success-text` cho cả 4 theme.
  + `tests/test-runner.js`: Thêm Test Suite 38 kiểm tra đầy đủ 5 hạng mục.
  + `docs/progress/progress2f.md`: Cập nhật tiến độ đợt 2F.
- **Kết quả Kiểm thử**:
  + `tests/test-runner.js`: **851 passed, 0 failed (100% PASS)**.
  + `scripts/build.js`: **Thành công 100% (99 assets, 4.59 MB)**.

---

# TIẾN ĐỘ THỰC HIỆN ĐỢT 2F (`docs/progress/progress2f.md`)
> **File đặc tả gốc**: `docs/promt/promt2f.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Xây dựng theme thứ 4 `ascii` với nền cây thông Noel ASCII 3D (`js/ascii-bg.js`) bám sát video `ok.mp4` (`agac.py`), bổ sung góc nhìn 20°, sóng đèn LED/kim tuyến domino, pha tan rã lặp chu kỳ, tối ưu `DPR = 1` ở 28 FPS, đồng thời bảo toàn 100% 3 theme hiện tại.

---

## Checklist Tiến Độ

- [x] **1. Khởi tạo nhánh `feat/ascii-tree` từ `main`**
  - [x] Tạo nhánh `feat/ascii-tree` sạch từ `main` (`b038081`).

- [x] **2. Xây dựng Engine cây thông ASCII 3D (`js/ascii-bg.js`)**
  - [x] Tái hiện hình học & tỷ lệ `agac.py` với mật độ điểm cao (~242,711 điểm): `Y0 = 0.42`, `Y1 = 2.55`, `envelope(y)`, `fib(n)`, 26 tầng cành (`NEEDLE`), tuyết đỉnh (`SNOWCAP`), thân cây vỏ sần (`TRUNK`), 3.6 vòng kim tuyến rủ (`2600 × 5` điểm `GARLAND`), 44 quả châu bóng (`BALL`, `fib(144)`), 170 bóng đèn (`LIGHT`, `fib(22)`), ngôi sao vát 3D + quầng sáng (`STAR`), 5 hộp quà thắt nơ (`GIFT`, `RIBBON`) và mặt sàn chấm tròn đồng tâm (`GROUND`) + 160 sao đêm.
  - [x] Tái hiện pha mọc phát sáng trắng từ tâm sàn & từ thân cây lan ra ngọn cành (`t0`).
  - [x] Điều chỉnh #1: Góc nhìn camera chéo từ trên xuống `20°` (`CAMERA_PITCH_DEG = 20`), tâm chiếu desktop `cx = 0.74`, tỷ lệ phóng lớn hơn ~18% (`focal = min(height * 1.13, width * 0.82)`).
  - [x] Điều chỉnh #2: Dải kim tuyến & 170 đèn LED chạy sóng domino nối tiếp (`computeDominoIntensity`).
  - [x] Điều chỉnh #3: Pha tan rã nhẹ thành bụi sao (`21.2s–25.2s`) và lặp lại chu kỳ `26.0s`.
  - [x] Điều chỉnh #4: Khóa `DPR = 1`, ô ký tự siêu mịn (`5×8px` desktop / `4×7px` mobile), pre-bake Sparse Glyph Atlas + Deferred Z-Buffer + blit `Uint32Array` có fast-path `allBorn`, giới hạn **28 FPS**, tự tạm dừng khi idle / ẩn tab / đổi theme, hỗ trợ `prefers-reduced-motion: reduce`.

- [x] **3. Tích hợp & đồng bộ Liquid Glass toàn app cho theme `ascii`**
  - [x] Thêm `#ascii-bg-canvas`, nút chọn theme `ascii`, nút trong buồng sóng Cài đặt và script `./js/ascii-bg.js` vào `index.html`.
  - [x] Đồng bộ toàn bộ hệ thống Liquid Glass đen-xám khói trong suốt (`0%` tím) trong `css/theme.css` (bao gồm `--glass-slab-*`, `--modal-convex-*`, `--card-frosted-*`, `--shadow-*`) và `GROUP 5` ở cuối `css/style.css` cho sidebar trái, khung hero (tắt blur lên cây thông), 4 thẻ thống kê, thanh nhạc, nút bấm, pill chọn theme, modal/popup và mobile bottom nav.
  - [x] Mở rộng `App.setTheme`, `syncThemeEnergyChamber`, `selectThemeViaEnergyWave`, `triggerThemeWaveTransition` và đồng bộ `setupIdleAndVisibilityListeners` trong `js/app.js` (bảo toàn nguyên vẹn hình nền lưu trữ của các theme khác).
  - [x] Đăng ký `js/ascii-bg.js` trong `scripts/build.js` và cập nhật cache `sw.js` (`mindsparks-v4.15.0`).

- [x] **4. Kiểm thử & Build Verification**
  - [x] Bổ sung Test Suite 33 (38 assertions) vào `tests/test-runner.js`.
  - [x] Chạy `node tests/test-runner.js` pass 100% (`732/732 passed, 0 failed`).
  - [x] Chạy `node scripts/build.js` pass 100% (`100 files`, `4.62 MB`, xác nhận `dist/js/ascii-bg.js`).

---

## Nhật Ký Thực Thi
- **Trạng thái**: Hoàn thành 100% trên nhánh `feat/ascii-tree` tách từ `main` (`b038081`).
- **Chi tiết thực hiện**:
  + Tạo mới `js/ascii-bg.js` (`AsciiBg`): dựng hình học 3D theo `agac.py` với mật độ cao (~242,711 điểm): `Y0 = 0.42`, `Y1 = 2.55`, `envelope(y)`, `fib(n)`, 26 tầng cành `NEEDLE` + `SNOWCAP`, `TRUNK` vỏ sần, 3.6 vòng `GARLAND` (`2600 × 5` điểm) rủ lượn sóng, 44 quả châu `BALL` (`fib(144)`), 170 bóng đèn `LIGHT` (`fib(22)`), ngôi sao vát khối 3D + quầng sáng `STAR`, 5 hộp quà thắt nơ `GIFT`/`RIBBON` và sàn chấm tròn đồng tâm `GROUND` trên bầu trời 160 sao đêm.
  + Áp dụng đủ 4 điều chỉnh + bố cục rộng phải: camera nghiêng xuống `20°` (`15°–25°`), tâm chiếu desktop `cx = 0.74`, phóng tỷ lệ chiếu lớn hơn ~18% (`focal = min(height * 1.13, width * 0.82)`), sóng domino trên kim tuyến & 170 đèn LED, pha tan rã bụi sao (`21.2s–25.2s`) lặp chu kỳ `26.0s`, khóa `DPR = 1` ở **28 FPS** với ô siêu mịn (`5×8px` desktop / `4×7px` mobile), fast-path `allBorn` và `blitGlyph`, hỗ trợ `prefers-reduced-motion: reduce`.
  + Đồng bộ toàn bộ Liquid Glass tông đen-xám khói trong suốt (`0%` tím) cho theme thứ 4 `ascii` trong `css/theme.css` và `GROUP 5` ở cuối `css/style.css` (sidebar trái, khung hero không làm nhòe cây thông bên phải, 4 thẻ thống kê, thanh nhạc, nút bấm, pill chọn theme, modal/popup và mobile bottom nav); bảo toàn nguyên vẹn 3 theme cũ (`violet-rose`, `monochrome`, `white-orange`).
  + Bổ sung Test Suite 33 (38 assertions) vào `tests/test-runner.js`.
- **Kết quả `node tests/test-runner.js`**: **732 passed, 0 failed** (gồm toàn bộ 694 test cũ và 38 test mới).
- **Kết quả `node scripts/build.js`**: **Pass 100%** (`100 files`, `4.62 MB`).
- **Hiệu năng đo thực tế (Node `renderFrameToBuffer`, `5×8px`, `DPR=1`, 60 khung hình xoay 360°)**:
  + `1440×900`: trung bình `5,714` `letters`, `3.72 ms/frame`.
  + `1920×1080`: trung bình `7,815` `letters`, `4.46 ms/frame`.
