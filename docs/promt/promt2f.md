# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2F (`docs/promt/promt2f.md`)
## Khắc Phục Triệt Để 6 Lỗi Hiển Thị, Parser LaTeX & Nâng Cấp Template Prompt Mẫu AI

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2f.md`  
> **Phạm vi tác động**: `js/app.js`, `js/parser.js`, `css/style.css`, `tests/test-runner.js`.

---

## 1. MỤC TIÊU & BỐI CẢNH

Sau các đợt tối ưu hóa công thức toán và bảng Markdown, hệ thống xuất hiện một số hiện tượng biên (edge cases) trong quá trình hiển thị và sinh đề:
1. **Lỗi `\$` (ký hiệu đô-la tiền tệ)**: Khi đề bài có chứa ký hiệu tiền tệ đã escape như `\$50` kết hợp với công thức toán `$x, y$`, regex `mathRegex` bắt nhầm từ `$50` tới `$x` thành một khối KaTeX, làm nuốt mất khoảng trắng tiếng Việt và gây lỗi font.
2. **Lỗi ngoặc vuông ma trận (`\begin{bmatrix}`) & dấu căn (`\sqrt{8}`)**: CSS cha đặt `line-height: 1.55` làm hỏng metric tính toán `vlist` của KaTeX, khiến dấu căn và ngoặc vuông co giãn bị biến dạng thành các tam giác trắng hoặc bị mất nét.
3. **Bố cục đáp án 2x2 vs 1 cột dọc**: Logic trước đó tự động ép sang 1 cột mỗi khi gặp bất kỳ ma trận nào (kể cả vectơ cột 1 chiều hoặc ma trận nhỏ 2x2), làm mất cân đối bố cục trên Desktop.
4. **Rớt dấu chấm nhãn phương án (`A .`, `D .`)**: Trong giao diện Ngân hàng câu hỏi (`#view-bank`), nhãn phương án dùng thẻ `<b>` chưa có `min-width: 1.6em` và `white-space: nowrap !important`, dẫn tới việc dấu chấm bị rớt xuống dòng khi độ rộng hẹp.
5. **Cảnh báo thiếu hình minh họa**: Nhiều câu hỏi AI sinh có chứa `[Cần hình minh họa]`, `hình vẽ minh họa`, `đồ thị bên` nhưng trường `card.image` đang để trống, khiến người học không biết câu hỏi đang thiếu dữ kiện trực quan.
6. **Prompt template AI cần kỷ luật 5 quy tắc cứng**: Bỏ hoàn toàn việc cho phép chia nhiều lượt; ép AI xuất toàn bộ câu hỏi trong DUY NHẤT 1 block JSON hoàn chỉnh từ đầu đến cuối; nghiêm cấm gọi tên chữ cái A/B/C/D trong phần giải thích.

---

## 2. NỘI DUNG CHI TIẾT CẢI TIẾN

### 2.1. Tách Biệt Ký Hiệu Tiền Tệ `\$` Khỏi Công Thức KaTeX (`js/app.js`)
- Trong `App.renderLatexText`:
  + Sử dụng cơ chế thay thế tạm thời placeholder `@@@MS_ESCAPED_DOLLAR@@@` đối với mọi ký tự `\$` đã escape (`/(?<!\\)\\\$/g`) trước khi bước vào tokenize công thức `mathRegex`.
  + Phục hồi nguyên vẹn ký tự `$` thông thường trong các text block và fast-path, đồng thời khôi phục `\$` nếu nằm trong khối toán học.
  + Đảm bảo các chuỗi như `"giá là \$50 cho mỗi đơn vị... hàm của $x, y$"` giữ nguyên vẹn dấu cách và kiểu chữ tiếng Việt, không bị nuốt thành khối toán.

### 2.2. CSS Shield Cô Lập Tuyệt Đối KaTeX Metric & SVG (`css/style.css`)
- Đặt `line-height: normal !important;` cho toàn bộ `.katex` và mọi con cháu `.katex *`.
- Thiết lập cách ly SVG cho `.katex svg`, `.delimsizing svg`, `.stretchy svg`, `.hide-tail svg`:
  + `display: block !important; position: absolute !important; width: 100% !important; height: inherit !important; overflow: visible !important;`
  + `stroke: none !important; fill: currentColor !important;` cho `.katex svg path`.

### 2.3. Chuẩn Hóa Bố Cục Đáp Án 2x2 vs 1 Cột Dọc (`css/style.css`, `js/app.js`)
- Đảm bảo trong `css/style.css`: `.quiz-options`, `.quiz-options-list`, `#quiz-options-container`, `#exam-options-container` mặc định luôn là 2 cột `repeat(2, minmax(0, 1fr))` trên desktop, 1 cột trên mobile.
- Siết chặt điều kiện gán `.quiz-options--single-col` trong `js/app.js`:
  + Tuyệt đối **KHÔNG** dựa vào độ dài chuỗi LaTeX thô (vì `\frac`, `\begin{cases}` viết dài nhưng hiển thị rất gọn) và **KHÔNG** gộp vectơ 1 cột hay hệ phương trình nhỏ vào 1 cột.
  + **CHỈ** gán `.quiz-options--single-col` khi có ít nhất 1 đáp án chứa `<table class="md-table">` (bảng Markdown) **HOẶC** ma trận rộng có từ 3 cột trở lên (tức bên trong `\begin{...matrix}` / `\begin{array}` có ít nhất 2 dấu `&` trên cùng một hàng).
  + Mọi câu hỏi thông thường, công thức LaTeX, hệ phương trình `\begin{cases}`, vectơ cột đều giữ nguyên lưới 2x2 cân đối.

### 2.4. Sửa Dứt Điểm Rớt Dấu Chấm Nhãn Phương Án (`css/style.css`, `js/app.js`)
- Đồng bộ hóa class `.quiz-option-letter` với các thuộc tính:
  `white-space: nowrap !important; flex-shrink: 0 !important; align-self: flex-start !important; min-width: 1.6em !important;`.
- Áp dụng trên toàn bộ: `#view-study`, `#view-exam`, `#view-bank`, `.bank-option-cell`.
- Trong `renderQuestionBank`: thay thẻ `<b>${letter}.</b>` bằng `<span class="quiz-option-letter select-none">${letter}.</span>`.

### 2.5. Badge Cảnh Báo Thiếu Hình Minh Họa Gốc (`js/app.js`, `css/style.css`)
- Thêm `isQuestionMissingImage(card)` và `renderMissingImageBadgeHtml(card)`.
- Nhận diện khi `!card.image` kết hợp với:
  + Thẻ `[Cần hình minh họa]`.
  + Cụm từ `hình vẽ minh họa`, `đồ thị bên`, `trên hình vẽ`, `hình bên`, `đồ thị dưới đây`.
  + Cụm từ `bảng bên dưới`, `bảng dưới đây` mà câu hỏi không kèm bảng Markdown.
- Hiển thị thông báo màu hổ phách/vàng kèm icon cảnh báo:
  `"⚠️ Câu hỏi này cần hình minh họa gốc — bấm biểu tượng ✏️ Sửa thẻ để dán/tải ảnh lên"`.
- Hỗ trợ đầy đủ bảng màu đặc thù trên cả 4 theme: Default Violet-Rose, Monochrome, White-Orange, ASCII Terminal.

### 2.6. Viết Lại Template Prompt AI 5 Quy Tắc Kỷ Luật Cứng (`js/parser.js`)
- Nâng cấp `AIParser.generateAIPromptTemplate`:
  1. *Vai trò & Đầu ra JSON chuẩn*: Trả về duy nhất 1 block JSON hoàn chỉnh, đầy đủ schema.
  2. *Xuất 1 lần duy nhất — Cấm tự ý chia nhiều lượt*: Xuất toàn bộ ${count} câu trong 1 lần, nghiêm cấm ngắt dở dang khi chưa chạm token limit.
  3. *Kỷ luật cú pháp JSON*: Cấm nối chuỗi `" + "`, cấm xuống dòng thô, chuẩn hóa escape `\"` và `\\`. Code nhiều dòng dùng ```` ```c\n...\n``` ````, code ngắn dùng inline backtick `` `...` ``.
  4. *Chiến lược Hybrid xử lý hình ảnh*: OCR bảng và công thức sang Markdown/LaTeX, giữ `"image": ""` cho sơ đồ đồ thị hình học.
  5. *Quy tắc giải thích*: CẤM GỌI TÊN CHỮ CÁI ĐÁP ÁN (A, B, C, D); giải thích chi tiết tại sao đúng, tại sao sai theo bản chất câu hỏi.

---

## 3. DANH SÁCH TEST VERIFICATION
1. **Test Suite 37**: Kiểm tra cách ly `\$`, render `\sqrt{8}`, nhận diện ma trận rộng vs vectơ cột, cảnh báo thiếu ảnh minh họa, CSS cô lập KaTeX, và template prompt 5 quy tắc.
2. Toàn bộ 818/818 tests trong `tests/test-runner.js` đạt PASS 100%.
3. `scripts/build.js` xuất bản thành công bản dựng production hoàn chỉnh 99 files (4.58 MB).

---

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
