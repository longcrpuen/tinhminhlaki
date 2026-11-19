# TIẾN ĐỘ THỰC HIỆN ĐỢT 2H (`docs/progress/progress2h.md`)
> **File đặc tả gốc**: `docs/promt/promt2h.md`  
> **Mục tiêu**: Xử lý dứt điểm lỗi tam giác trắng dấu ngoặc `bmatrix`, lỗi mất ngoặc tròn `pmatrix` và cơ chế vượt bộ lọc Recitation trong AI Prompt.

---

## Checklist Tiến Độ

- [x] **1. Kiểm tra 4 nguyên tắc kỹ thuật trong codebase & tìm đúng nguyên nhân gốc**
  - [x] **Nguyên nhân 1 (Asset/Font/SW)**: Kiểm tra `index.html`, `sw.js`, `lib/katex/`:
    + Bản KaTeX JS + CSS là 0.18.7 đồng nhất.
    + Bổ sung đầy đủ precache các font KaTeX cốt lõi (`KaTeX_Size1/2/3/4-Regular.woff2`, `KaTeX_Main-Regular.woff2`, `KaTeX_Math-Italic.woff2`, `KaTeX_AMS-Regular.woff2`) vào `STATIC_ASSETS` trong `sw.js` để PWA offline hoạt động hoàn hảo.
  - [x] **Nguyên nhân 2 (CSS Isolation)**: Grep `css/style.css` và `css/theme.css`:
    + Đã cách ly hoàn toàn KaTeX khỏi CSS base reset (`*:not(.katex, .katex *)`).
    + Không có rule toàn cục nào đè lên `svg` hay `path` hay `font-family` của `.katex`.
  - [x] **Nguyên nhân 3 & 4 (Root Cause)**: Tìm thấy lỗi trong `formatRichText()` (`js/app.js`):
    + KaTeX sinh SVG delimiter với `\n` bên trong chuỗi thuộc tính `d="..."`.
    + Dòng lệnh `rendered = rendered.replace(/\r?\n/g, '<br>');` đã chạy đè lên HTML KaTeX, chèn `<br>` vào giữa tọa độ path SVG!
    + Ký tự `<` vi phạm cú pháp SVG path data khiến trình duyệt cắt đứt đường vẽ:
      * `bmatrix` bị đứt ở góc dưới trái $\rightarrow$ hình thành tam giác trắng.
      * `pmatrix` bị đứt ngay tại ký tự 80 $\rightarrow$ mất sạch đường cong ngoặc tròn, chỉ còn 2 chấm nhỏ ở đỉnh.

- [x] **2. Sửa triệt để kiến trúc render trong `js/app.js`**
  - [x] Tách hàm helper `_renderMathCode(rawCode, isBlock)` dùng chung cơ chế cache và chuẩn hóa cú pháp.
  - [x] Trong `formatRichText(text)`: Tokenize toàn bộ công thức toán học (`mathBlocks`) thành `@@@MS_MATH_BLOCK_${idx}@@@` và `@@@MS_MATH_INLINE_${idx}@@@` **TRƯỚC KHI** xử lý xuống dòng.
  - [x] Chỉ chạy `replace(/\r?\n/g, '<br>')` trên plain text đã tách token.
  - [x] Khôi phục `mathBlocks` sau cùng, bảo vệ 100% SVG path và newlines bên trong KaTeX không bị biến đổi.
  - [x] Chụp ảnh headless thực tế xác nhận cả `\begin{bmatrix}` 3 dòng lẫn `\begin{pmatrix}` 5x5 đều hiển thị sắc nét, thẳng thớm và cong mượt 100%.

- [x] **3. Bổ sung cơ chế chống ngắt bộ lọc Recitation vào `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Bổ sung câu chỉ dẫn vào Quy tắc 1:
    `"Với bài toán lời văn dài quen thuộc từ sách giáo khoa/đề mẫu, hãy diễn đạt lại câu dẫn ngắn gọn, tự nhiên (giữ nguyên 100% số liệu, bảng biểu, công thức và đáp án) để tránh bị bộ lọc hệ thống ngắt giữa chừng."`
  - [x] Giữ nguyên 5 nguyên tắc chuẩn mực sư phạm, súc tích và tiết kiệm token tối đa.

- [x] **4. Kiểm thử & Đóng gói sản phẩm**
  - [x] Thêm Test Suite 39 kiểm tra bảo vệ đường dẫn SVG delimiter KaTeX khỏi bị chèn `<br>`.
  - [x] Chạy `node tests/test-runner.js` $\rightarrow$ **865 passed, 0 failed (100% PASS)**.
  - [x] Chạy `node scripts/build.js` $\rightarrow$ **100% hoàn thành (99 assets, 4.60 MB)**.
