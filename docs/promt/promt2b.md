# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2B (`docs/promt/promt2b.md`)
## Nâng Cấp Chất Lượng Prompt Sinh Câu Hỏi AI (`AIParser.generateAIPromptTemplate` Trong `js/parser.js`) — Chống Giải Thích Sáo Rỗng & Lặp Lại Đáp Án

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2b.md`
> **Phạm vi**: Chỉ sửa `AIParser.generateAIPromptTemplate` trong `js/parser.js` (và cập nhật test liên quan nếu cần). Không đụng vào theme hay các chức năng khác.

---

## 1. VẤN ĐỀ CẦN SỬA

Hiện tại `AIParser.generateAIPromptTemplate` (`js/parser.js` dòng 86689–86723) chỉ ràng buộc cấu trúc JSON chứ **không ràng buộc chất lượng sư phạm của trường `"explanation"`**. Hậu quả là khi người dùng copy prompt này cho AI sinh bộ câu hỏi hàng loạt, model thường dùng văn mẫu sáo rỗng như:
> *"Theo cú pháp và quy tắc thực thi chuẩn của ngôn ngữ SQL (DDL/DML/DCL), phương án chính xác là: Hủy bỏ quyền đọc, ghi, cập nhật, xóa bảng NHANVIEN đối với người dùng là Aleck."*

Lời giải thích kiểu này chỉ chép lại đáp án đúng, không giúp người học hiểu bản chất hay biết vì sao các phương án nhiễu bị sai.

---

## 2. CẬP NHẬT `AIParser.generateAIPromptTemplate` TRONG `js/parser.js`

Thay thế toàn bộ nội dung hàm `generateAIPromptTemplate({ topic = '', count = 10, difficulty = 'medium' } = {})` bằng phiên bản chuẩn sau (giữ nguyên 100% schema JSON tương thích `AIParser.parse()`):

```javascript
  generateAIPromptTemplate({ topic = '', count = 10, difficulty = 'medium' } = {}) {
    return `Hãy đóng vai một giảng viên chuyên môn và biên soạn ${count} câu hỏi trắc nghiệm ôn tập chất lượng cao về chủ đề: "${topic || '[DÁN NỘI DUNG / CHỦ ĐỀ / TÀI LIỆU TẠI ĐÂY]'}".

Yêu cầu định dạng & chất lượng:
1. Trả về DUY NHẤT một khối mã JSON hợp lệ (không kèm lời chào hay giải thích ngoài khối mã JSON).
2. Hỗ trợ công thức Toán/Lý/Hóa LaTeX trong mọi trường text: dùng $...$ cho inline math và $$...$$ cho block math (ví dụ: $f(x) = x^2$, $\\frac{d}{dx}x^n = nx^{n-1}$).
3. Tuân thủ chính xác 100% cấu trúc JSON bên dưới:

\`\`\`json
{
  "quiz_title": "${topic || 'Chương 3: Đạo hàm'}",
  "questions": [
    {
      "id": "q1",
      "topic": "${topic || 'Đạo hàm'}",
      "difficulty": "${difficulty}",
      "question": "Đạo hàm của $f(x) = x^2$ là gì?",
      "options": [
        { "id": "a", "text": "$2x$" },
        { "id": "b", "text": "$x^2$" },
        { "id": "c", "text": "$2$" },
        { "id": "d", "text": "$x$" }
      ],
      "correct_option_id": "a",
      "explanation": "Áp dụng công thức đạo hàm lũy thừa $(x^n)' = n \\cdot x^{n-1}$ với $n = 2$, ta có $(x^2)' = 2x^{2-1} = 2x$. Loại B vì giữ nguyên hàm gốc chưa lấy đạo hàm; loại C vì đạo hàm bậc nhất của $2x$ mới bằng $2$; loại D vì thiếu hệ số $n = 2$."
    }
  ]
}
\`\`\`

Quy tắc BẮT BUỘC:
- "options" phải có ít nhất 2 lựa chọn (khuyến nghị 4 lựa chọn có id từ "a" đến "d"). Nội dung "text" KHÔNG tự thêm tiền tố "A.", "B." vào đầu.
- "correct_option_id" BẮT BUỘC phải khớp với một trong các "id" trong "options".
- "difficulty" nhận một trong ba giá trị: "easy", "medium", hoặc "hard".

Quy tắc BẮT BUỘC cho trường "explanation" (TUYỆT ĐỐI KHÔNG VI PHẠM):
1. Giải thích ngắn gọn nhưng có giá trị sư phạm thực sự (2–3 câu rõ ý):
   - Nêu rõ TẠI SAO đáp án đúng là đúng: trích dẫn đúng từ khóa cú pháp, định lý, công thức hoặc từng bước tính/suy diễn cụ thể của chính câu đó.
   - Nêu rõ TẠI SAO các phương án nhiễu còn lại sai (hoặc chỉ rõ điểm bẫy thường gặp như đảo thứ tự tham số, nhầm từ khóa, sai dấu/điều kiện).
2. CẤM TUYỆT ĐỐI viết câu mẫu sáo rỗng, chung chung hoặc chỉ chép lại nguyên văn đáp án đúng (ví dụ CẤM các mẫu: "Theo quy tắc chuẩn..., phương án chính xác là: ...", "Áp dụng định nghĩa..., đáp án đúng là: ...").
3. CHỐNG LƯỜI KHI SINH NHIỀU CÂU: Mỗi câu hỏi phải có lời giải thích riêng biệt, bám sát đúng tên bảng, biến số, câu lệnh hoặc biểu thức trong đề bài đó; không được lặp lại cùng một khuôn câu giải thích cho nhiều câu khác nhau.`;
  }
```

---

## 3. KIỂM THỬ BẮT BUỘC

1. Kiểm tra `App.copyAIPrompt()` hoạt động bình thường trên tab **Dán câu hỏi AI** và chuỗi copy ra chứa đầy đủ quy tắc `"explanation"` mới.
2. Kiểm tra JSON mẫu bên trong template vẫn hợp lệ 100% khi dán vào `AIParser.parse()`.
3. Chạy `node tests/test-runner.js` và `node scripts/build.js` đảm bảo pass 100%, cập nhật đầy đủ vào `docs/progress/progress2b.md`.
