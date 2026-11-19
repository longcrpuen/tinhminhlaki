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
