# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2E (`docs/promt/promt2e.md`)
## Tự Sửa Lỗi JSON, Tự Cứu Block Bị Cắt Cụt, Hỗ Trợ Multi-Block/Khử Trùng Lặp & Tinh Chỉnh Template Prompt AI (`js/parser.js`)

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2e.md`  
> **Phạm vi**: Chỉ cập nhật trong `js/parser.js` và test trong `tests/test-runner.js`. Không sửa UI hay các file khác.

---

## 1. MỤC TIÊU & BỐI CẢNH

Trong quá trình sử dụng thực tế khi người dùng paste đề do AI sinh vào MindSparks, thường phát sinh 2 nhóm lỗi:
1. **AI sinh JSON lỗi hoặc tự reset giữa chừng**:
   - Nối chuỗi kiểu code JavaScript (`" + "`, `' + '`) trong các trường văn bản dài (như `explanation`).
   - Xuống dòng thô (raw newline) hoặc ký tự điều khiển trong string literal.
   - Dấu phẩy thừa (trailing comma) trước `}` hoặc `]`.
   - Bị cắt cụt giữa chừng do chạm token limit (ví dụ đang viết dở ở câu `q10`).
   - AI tự ý ngắt rồi viết lại từ `q1` ở khối tiếp theo bên dưới khiến dữ liệu bị trùng lặp hoặc lặp câu.
2. **Hệ thống parser của app trước đây chưa tự cứu được**:
   - Nếu `JSON.parse` vấp phải bất kỳ lỗi cú pháp nào ở trên, app lập tức quăng lỗi SyntaxError ra UI, làm mất toàn bộ các câu hỏi đã sinh thành công trước đó.
   - Chưa hỗ trợ ghép nối nhiều block ```json nối tiếp (ví dụ 1–20 và 21–40).

Đợt 2E nâng cấp toàn diện `AIParser` để vừa tối ưu hóa prompt hướng dẫn AI, vừa trang bị cơ chế tự sửa lỗi (self-healing) và tự cứu dữ liệu thông minh trước khi parse.

---

## 2. NỘI DUNG CẢI TIẾN

### 2.1. Tinh Chỉnh Prompt Template (`AIParser.generateAIPromptTemplate`)
- **Vai trò & Đầu ra**: Xuất duy nhất 1 block JSON hợp lệ theo schema hiện tại, giữ nguyên trường `"image": ""` cho câu hỏi và options. Không kèm lời dẫn. Chỉ xuất tiếp ở lượt sau nếu chạm giới hạn độ dài của model (mỗi lượt là 1 block JSON hoàn chỉnh, nối tiếp thứ tự, không lặp lại câu cũ).
- **Kỷ luật cú pháp**: Cấm tuyệt đối:
  + Nối chuỗi kiểu code (`" + "`, `' + '`).
  + Xuống dòng thô trong chuỗi JSON (dùng `\n`).
  + Tự ngắt để viết lại từ `q1` giữa chừng khi gặp câu có hình ảnh/bảng biểu.
- **Escape chuẩn**: `\"` và `\\` (đặc biệt với LaTeX `\\frac`, `\\le`, ký tự C `\\0`); ưu tiên dùng backtick `` `...` `` thay cho ngoặc kép `"` trong văn bản.
- **Chất lượng nội dung**: Giữ nguyên vẹn đủ câu hỏi và 4 đáp án; `explanation` dài 2–3 câu giải thích trực tiếp vì sao đúng, vì sao nhiễu sai.

### 2.2. Cơ Chế Tự Sửa & Tự Cứu Trong `AIParser.parse(rawInput)`
- **Làm sạch lỗi cú pháp (`_sanitizeJsonString`)**:
  - Tự động xóa phép nối chuỗi `(?<!\\)"\s*\+\s*"` và `(?<!\\)'\s*\+\s*'` kết nối các string literal.
  - State machine duyệt chuỗi: chuyển đổi raw newline (`\r`, `\n`) và control characters bên trong string literal thành `\n`, `\t`; loại bỏ trailing comma `,` trước `}` hoặc `]` bên ngoài string literal.
- **Tự cứu JSON bị cắt cụt (`_tryRepairAndParseJson`)**:
  - Khi JSON bị cắt dở dang do chạm token limit, thuật toán dò ngược tìm dấu `}` của object câu hỏi hoàn chỉnh gần nhất.
  - Cắt bỏ phần dở dang và tự động đóng ngoặc `\n]}` hoặc `\n]` hợp lệ, cứu toàn bộ các câu hỏi nguyên vẹn phía trước.
- **Hỗ trợ Multi-Block & Tự Ghép Nối (`_extractJsonBlocks` & `_mergeParsedJsonBlocks`)**:
  - Tách tất cả các block ```json hoặc các JSON object riêng biệt trong văn bản dán vào.
  - Khử trùng lặp thông minh (`_areQuestionsDuplicate`): Nếu phát hiện câu hỏi trùng lặp (do AI bị ngắt rồi viết lại từ đầu), tự động ưu tiên giữ bản mới/đầy đủ hơn (`_isQuestionMoreComplete`) và chỉ gộp nối tiếp các câu không trùng.
  - Đánh lại `id` tuần tự `q1..qN` sau khi gộp để đảm bảo tính nhất quán.

---

## 3. DANH SÁCH KIỂM THỬ BẮT BUỘC
1. **Case (a)**: Chuỗi `" + "` ở `explanation` và trailing comma được tự động sửa và parse thành công.
2. **Case (b)**: JSON bị cắt cụt giữa câu `q10` rồi nối tiếp block ```json thứ hai bên dưới: tự cứu `q1..q9` từ block 1, gộp với block 2, deduplicate câu 10 hoàn chỉnh và đánh lại ID `q1..q11`.
3. **Case (c)**: Multi-block nối tiếp 1–20 và 21–40: gộp đủ 40 câu hỏi, renumber từ `q1` đến `q40`.
4. Toàn bộ test suite `node tests/test-runner.js` đạt 100% Pass (694/694 passed, 0 failures).
5. `node scripts/build.js` hoàn thành thành công 100%.
