# TIẾN ĐỘ THỰC HIỆN ĐỢT 2E (`docs/progress/progress2e.md`)
> **File đặc tả gốc**: `docs/promt/promt2e.md`  
> **Mục tiêu**: Nâng cấp `AIParser.generateAIPromptTemplate` và gia cố `AIParser.parse` trong `js/parser.js` để tự động sửa lỗi cú pháp JSON vặt, tự cứu block bị cắt cụt, hỗ trợ multi-block nối tiếp và khử trùng lặp câu hỏi thông minh.

---

## Checklist Tiến Độ

- [x] **1. Cập nhật `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Giữ nguyên trường `"image": ""` cho câu hỏi và từng đáp án.
  - [x] Xuất duy nhất 1 block JSON hợp lệ theo schema hiện tại, chỉ xuất tiếp ở lượt sau nếu chạm giới hạn độ dài của model (mỗi lượt là 1 block JSON hoàn chỉnh, không lặp câu cũ).
  - [x] Cấm tuyệt đối: nối chuỗi kiểu code (`" + "`, `' + '`), xuống dòng thô trong chuỗi JSON (dùng `\n`), hoặc tự ngắt để viết lại từ `q1` giữa chừng khi gặp câu có hình ảnh/bảng biểu.
  - [x] Hướng dẫn escape chuẩn `\"` và `\\` (`\\frac`, `\\le`, `\\0`), ưu tiên dùng backtick `` `...` `` trong văn bản.
  - [x] Giữ nguyên đủ câu hỏi và 4 đáp án; `explanation` 2–3 câu phân tích trực tiếp lý do đúng và lý do từng đáp án nhiễu sai.

- [x] **2. Gia cố `AIParser.parse(rawInput)` (`js/parser.js`)**
  - [x] Cài đặt `_sanitizeJsonString`: xóa phép nối chuỗi `" + "` giữa string literal, chuyển đổi raw newline/control char thành `\n`/`\t`, xóa trailing comma trước `}` hoặc `]`.
  - [x] Cài đặt `_tryRepairAndParseJson`: tự cứu JSON bị cắt cụt giữa chừng do token limit bằng cách dò ngược tìm dấu `}` của object hoàn chỉnh gần nhất và tự đóng ngoặc hợp lệ.
  - [x] Cài đặt `_extractJsonBlocks`: tách tất cả các block ```json hoặc các object JSON độc lập.
  - [x] Cài đặt `_mergeParsedJsonBlocks`: so sánh trùng lặp câu hỏi (`_areQuestionsDuplicate`), ưu tiên giữ bản đầy đủ hơn (`_isQuestionMoreComplete`), gộp nối tiếp các câu không trùng và đánh lại ID `q1..qN`.

- [x] **3. Kiểm thử & Build Verification**
  - [x] Test Case (a): chuỗi `" + "` ở `explanation` và trailing comma $\rightarrow$ Tự làm sạch và parse thành công.
  - [x] Test Case (b): JSON bị cắt cụt giữa câu `q10` rồi nối tiếp block thứ hai $\rightarrow$ Tự cứu `q1..q9`, gộp `q1..q11`, deduplicate và đánh lại ID tuần tự.
  - [x] Test Case (c): Multi-block nối tiếp 1–20 và 21–40 $\rightarrow$ Gộp chính xác 40 câu, renumber `q1..q40`.
  - [x] Chạy `node tests/test-runner.js` $\rightarrow$ Pass 100% (694/694 tests passed, 0 failures bao gồm Test Suite 32).
  - [x] Chạy `node scripts/build.js` $\rightarrow$ Pass 100% (99 assets, bundle 4.55 MB).

---

## Nhật Ký Thực Thi (Agent cập nhật sau khi hoàn thành)
- **Trạng thái**: Hoàn thành 100% (Completed)
- **Chi tiết thực hiện**:
  + Bổ sung 6 helper functions chuyên sâu vào `AIParser` trong `js/parser.js`: `_sanitizeJsonString`, `_tryRepairAndParseJson`, `_extractJsonBlocks`, `_normalizeQuestionForComparison`, `_areQuestionsDuplicate`, `_isQuestionMoreComplete`, và `_mergeParsedJsonBlocks`.
  + Tái cấu trúc hàm `AIParser.parse(rawInput)`: tự động nhận diện và xử lý linh hoạt mọi dạng đầu vào từ người dùng (single block, multi-block, truncated block, code-concatenated string, raw newline, trailing comma).
  + Tinh chỉnh `AIParser.generateAIPromptTemplate`: bổ sung chỉ thị cấm tự ngắt viết lại từ `q1` khi gặp hình ảnh/bảng biểu, quy định rõ cơ chế tiếp tục lượt sau khi chạm token limit.
  + Bổ sung Test Suite 32 vào `tests/test-runner.js` với 19 assertions kiểm tra toàn diện cả 3 case (a), (b), (c) cùng các quy tắc prompt mới.
- **Kết quả `test-runner.js`**: **694/694 passed, 0 failed**.
- **Kết quả `build.js`**: **Pass 100%**.
