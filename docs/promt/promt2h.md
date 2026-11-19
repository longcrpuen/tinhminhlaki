# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2H (`docs/promt/promt2h.md`)
## Diệt Tận Gốc Lỗi Tam Giác Trắng KaTeX Bracket, Lỗi Mất Ngoặc Tròn Pmatrix & Cơ Chế Vượt Bộ Lọc Recitation

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2h.md`  
> **Phạm vi tác động**: `js/app.js`, `js/parser.js`, `sw.js`, `css/style.css`, `css/theme.css`, `index.html`, `tests/test-runner.js`.

---

## 1. MỤC TIÊU & BỐI CẢNH

1. **Diệt tận gốc lỗi tam giác trắng ở góc dưới trái dấu ngoặc `[` (`bmatrix` 3 dòng) và lỗi mất sạch 2 dấu ngoặc tròn `(` `)` (`pmatrix` 5x5)**:
   - **Check 1 (Asset & Font)**: Kiểm tra `index.html`, `sw.js`, `lib/katex/`:
     + `katex.min.js` và `katex.min.css` phiên bản 0.18.7 đồng bộ 100%.
     + Precache đầy đủ các font KaTeX cốt lõi (`KaTeX_Size1/2/3/4-Regular.woff2`, `KaTeX_Main-Regular.woff2`, `KaTeX_Math-Italic.woff2`, `KaTeX_AMS-Regular.woff2`) trong `sw.js` `STATIC_ASSETS` để PWA offline không bao giờ bị lỗi font glyph.
   - **Check 2 (CSS Grep)**:
     + Cách ly CSS base reset (`*:not(.katex, .katex *)`).
     + Không có rule toàn cục nào đè lên `svg`, `path`, `font-family` của `.katex`.
   - **Check 3 & 4 (Root Cause - Phá hỏng SVG Path do `\n -> <br>`)**:
     + KaTeX khi render ma trận từ 3 dòng trở lên sẽ sinh các delimiter dạng SVG: `<span style="..."><svg ...><path d="..."/></svg></span>`.
     + Do thuộc tính `d` của path dài, KaTeX chèn các ký tự xuống dòng `\n` bên trong chuỗi thuộc tính `d`.
     + Trước đây, trong `formatRichText()` (`js/app.js`), sau khi `renderLatexText` sinh xong HTML KaTeX, app chạy:
       `rendered = rendered.replace(/\r?\n/g, '<br>');`
       Dòng lệnh này đã biến toàn bộ `\n` bên trong thuộc tính `d="..."` thành thẻ `<br>`!
     + Hậu quả:
       * Trong SVG path syntax, ký tự `<` là token không hợp lệ (illegal character). Trình duyệt lập tức ngắt (abort) quá trình parse path tại vị trí đó!
       * Với `bmatrix` 3 dòng: `<br>` rơi vào trước lệnh `H403z` ở góc dưới trái, khiến path bị hở và browser tự vẽ nét khép kín về điểm đầu tạo thành hình **tam giác trắng** ở góc dưới trái!
       * Với `pmatrix` 5 dòng: `<br>` rơi ngay ký tự thứ 80 (chỉ sau 20px đầu tiên của vòng cung), khiến browser ngắt bỏ 5980px còn lại của đường cong ngoặc tròn trên cả 2 bên $\rightarrow$ **mất sạch ngoặc tròn, chỉ còn 2 chấm nhỏ ở góc trên**!
     + **Giải pháp triệt để**:
       * Đưa việc parse & render KaTeX Math lên trước bước xử lý xuống dòng.
       * Lưu toàn bộ HTML KaTeX vào mảng `mathBlocks` và thay bằng token giữ chỗ `@@@MS_MATH_BLOCK_${idx}@@@` và `@@@MS_MATH_INLINE_${idx}@@@`.
       * Bước biến đổi `\n -> <br>` CHỈ chạy trên text thuần túy đã tách token.
       * Phục hồi lại `mathBlocks` nguyên vẹn 100%, bảo vệ tuyệt đối chuỗi SVG `<path d="...">` không bao giờ bị dính `<br>`.

2. **Bổ sung giải pháp chống bộ lọc ngắt ngang (Recitation / Copyright filter của AI) vào `AIParser.generateAIPromptTemplate` (`js/parser.js`)**:
   - Bổ sung vào Quy tắc 1 câu chỉ thị:
     `"Với bài toán lời văn dài quen thuộc từ sách giáo khoa/đề mẫu, hãy diễn đạt lại câu dẫn ngắn gọn, tự nhiên (giữ nguyên 100% số liệu, bảng biểu, công thức và đáp án) để tránh bị bộ lọc hệ thống ngắt giữa chừng."`
   - Giữ nguyên cấu trúc JSON chuẩn, kỷ luật cú pháp 5 nguyên tắc súc tích, token-efficient.

3. **Kiểm thử và Đóng gói**:
   - `node tests/test-runner.js` đạt 100% (865/865 tests).
   - `node scripts/build.js` thành công 100% (99 assets, 4.60 MB).
