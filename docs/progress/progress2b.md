# TIẾN ĐỘ THỰC HIỆN ĐỢT 2B (`docs/progress/progress2b.md`)
> **File đặc tả gốc**: `docs/promt/promt2b.md`
> **Mục tiêu**: Nâng cấp `AIParser.generateAIPromptTemplate` trong `js/parser.js` để bắt buộc AI sinh `"explanation"` phân tích rõ vì sao đúng, vì sao nhiễu sai, và cấm tuyệt đối văn mẫu sáo rỗng lặp lại đáp án.

---

## Checklist Tiến Độ

- [x] **1. Cập nhật `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Giữ nguyên 100% schema JSON tương thích với `AIParser.parse()`.
  - [x] Bổ sung quy tắc bắt buộc cho `"explanation"` (nêu rõ lý do đúng + lý do loại phương án nhiễu, cấm câu mẫu lặp lại đáp án, cấm copy-paste cùng khuôn câu cho nhiều câu).
  - [x] Cập nhật ví dụ `"explanation"` trong khối JSON mẫu thành lời giải chuẩn mực.

- [x] **2. Kiểm thử & Build Verification**
  - [x] Kiểm tra `App.copyAIPrompt()` hoạt động đúng và output JSON mẫu parse sạch qua `AIParser.parse()`.
  - [x] Chạy `node tests/test-runner.js` — Pass 100% (633/633 tests passed, 0 failures).
  - [x] Chạy `node scripts/build.js` — Pass 100% (99 assets, 4.48 MB, syntax OK).

---

## Nhật Ký Thực Thi (Agent cập nhật sau khi hoàn thành)
- **Trạng thái**: Hoàn thành 100% (Completed)
- **Chi tiết thực hiện**:
  + Thay thế toàn bộ nội dung template prompt sinh câu hỏi AI trong `AIParser.generateAIPromptTemplate()` (`js/parser.js`).
  + Ràng buộc cấu trúc giải thích sư phạm 2 chiều: (1) Nêu rõ lý do đáp án đúng là đúng kèm trích dẫn cú pháp/định lý/bước suy diễn; (2) Nêu rõ lý do các phương án nhiễu sai / điểm bẫy thường gặp.
  + Cấm tuyệt đối văn mẫu sáo rỗng lặp lại nguyên văn đáp án đúng hoặc khuôn câu "Theo quy tắc chuẩn..., phương án chính xác là:...".
  + Cấm lười biếng khi sinh nhiều câu (mỗi câu phải bám sát biến số, bảng, câu lệnh riêng biệt).
  + Khối JSON mẫu được cập nhật lời giải chuẩn mực cho câu hỏi đạo hàm bậc 2, giải thích chi tiết bước tính và lý do loại từng phương án B, C, D.
  + Bổ sung Test Suite 30 vào `tests/test-runner.js`, xác thực toàn diện template generation, trích xuất JSON mẫu và parse thành công không lỗi.
- **Kết quả `test-runner.js`**: 633/633 passed (100% PASS)
- **Kết quả `build.js`**: 100% PASS (99 files, 4.48 MB)
