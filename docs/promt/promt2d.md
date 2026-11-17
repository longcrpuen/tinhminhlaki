# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2D (`docs/promt/promt2d.md`)
## Tối Ưu Hóa & Tinh Gọn Template Prompt Sinh Câu Hỏi AI (`AIParser.generateAIPromptTemplate` Trong `js/parser.js`) — Chống Cắt Ngang JSON & Chống Lỗi Nối Chuỗi JS

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2d.md`  
> **Phạm vi**: Chỉ cập nhật hàm `AIParser.generateAIPromptTemplate` trong `js/parser.js`. Không can thiệp UI hoặc logic khác.

---

## 1. MỤC TIÊU & BỐI CẢNH

Khi người dùng sao chép prompt để sinh câu hỏi từ các LLM (ChatGPT, Claude, Gemini, DeepSeek), có 2 lỗi cú pháp JSON phổ biến làm gián đoạn quá trình nhập liệu:
1. **Bị cắt ngang giữa chừng (Token Limit Truncation)**: Tài liệu/bộ đề dài trên 25–30 câu khiến AI sinh dở dang làm JSON không đóng ngoặc, sinh raw newline hoặc đứt đoạn ở câu cuối.
2. **Lỗi nối chuỗi kiểu lập trình JS (`" + "`, `' + '`)**: Một số model ghép chuỗi code bên trong giá trị chuỗi của JSON làm vỡ cú pháp parse của `JSON.parse`.
3. **Lỗi escape ký tự**: Thiếu escape cho dấu ngoặc kép `"` trong câu hỏi/giải thích hoặc sai escape LaTeX (`\frac` thay vì `\\frac`).

Đợt 2D tái cấu trúc lại nội dung prompt mẫu thành 4 nguyên tắc cô đọng, dứt khoát, dễ hiểu nhất cho các mô hình ngôn ngữ lớn.

---

## 2. NỘI DUNG 4 NGUYÊN TẮC CỐT LÕI CỦA PROMPT TEMPLATE

### 2.1. Vai trò & Đầu ra JSON chuẩn
- Đóng vai trò chuyên gia giáo dục, biên soạn số câu hỏi theo yêu cầu (`${count}`) bám sát chủ đề (`${topic}`).
- Trả về **DUY NHẤT 1 block JSON hợp lệ**, tuyệt đối không kèm lời chào, lời dẫn hay giải thích bên ngoài JSON.
- Tuân thủ cấu trúc schema chuẩn:
  - `quiz_title`: Tiêu đề bộ đề.
  - `questions`: Mảng câu hỏi gồm `id`, `topic`, `difficulty` ("easy"|"medium"|"hard"), `question`, `image`: "", `options` (mảng object `{"id", "text", "image": ""}`), `correct_option_id`, `explanation`.
  - Nội dung `text` của `options` không chứa tiền tố `A.`, `B.`. Hỗ trợ công thức LaTeX inline `$..$` và block `$$..$$`.
  - Nghiêm cấm chèn ký hiệu trích dẫn nguồn `[cite: ...]`, `【...】`.

### 2.2. Chia lô chống cắt ngang (Batching)
- Nếu tài liệu hoặc đề thi dài hơn 25 câu: Tự động chia thành từng phần độc lập (mỗi phần 20–25 câu).
- Mỗi phần xuất thành một block JSON hoàn chỉnh, độc lập để người dùng có thể copy và import từng phần một cách an toàn.
- Tuyệt đối không xuất lửng, không cắt ngang giữa câu hoặc bỏ dở JSON.

### 2.3. Kỷ luật cú pháp JSON (Chống lỗi Parse)
- Cấm tuyệt đối dùng phép nối chuỗi code (`" + "`, `' + '`) hoặc xuống dòng thô (raw newline) bên trong giá trị chuỗi JSON; mọi ký tự xuống dòng phải dùng `\n`.
- Escape chính xác `\"` và `\\` (đặc biệt với công thức LaTeX như `\\frac`, `\\le`, `\\ge` hoặc ký tự thoát như `\\0`, `\\n`).
- Trong văn bản giải thích/câu hỏi, ưu tiên dùng dấu backtick `` `...` `` thay cho ngoặc kép `"` để hạn chế tối đa lỗi escape.
- Tích hợp chiến lược Hybrid cho đề thi có hình ảnh:
  - Bắt buộc OCR chữ, công thức, bảng số liệu sang Text + LaTeX + Bảng Markdown.
  - Sơ đồ ER, UML, mạch điện, đồ thị hình học: Giữ cấu trúc `"image": ""` để đính kèm ảnh WebP trực tiếp trên app.

### 2.4. Chất lượng nội dung & Giải thích (Sư phạm)
- Giữ nguyên vẹn nội dung câu hỏi và cả 4 đáp án (không tự ý cắt xén hay rút gọn).
- Trường `explanation` (2–3 câu rõ ý):
  - Giải thích trực tiếp *tại sao* đáp án đúng là đúng (nêu công thức, định lý, quy tắc hoặc trace từng bước).
  - Chỉ rõ *tại sao* các phương án nhiễu còn lại sai (chỉ rõ lỗi bản chất hoặc bẫy thường gặp).
  - Cấm tuyệt đối văn mẫu sáo rỗng (như "Theo quy tắc chuẩn, đáp án đúng là...").
  - Chống lười biếng: Mỗi câu hỏi phải có lời giải thích riêng biệt bám sát đề bài.

---

## 3. DANH SÁCH KIỂM THỬ BẮT BUỘC
1. Cú pháp JS trong `js/parser.js` hợp lệ (`node -c js/parser.js`).
2. Khối JSON mẫu trích xuất từ template parse sạch qua `AIParser.parse()` với 0 lỗi.
3. Toàn bộ test suite trong `node tests/test-runner.js` đạt 100% Pass (0 failed).
4. `node scripts/build.js` hoàn thành thành công.
