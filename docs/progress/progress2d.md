# TIẾN ĐỘ THỰC HIỆN ĐỢT 2D (`docs/progress/progress2d.md`)
> **File đặc tả gốc**: `docs/promt/promt2d.md`  
> **Mục tiêu**: Tối ưu hóa và tinh gọn hàm `AIParser.generateAIPromptTemplate` trong `js/parser.js`, bổ sung 4 nguyên tắc cốt lõi giúp AI sinh đề không rối và triệt tiêu 2 lỗi JSON thực tế (cắt ngang dở chừng và nối chuỗi code `" + "`).

---

## Checklist Tiến Độ

- [x] **1. Cập nhật Template Prompt (`js/parser.js`)**
  - [x] Tinh gọn prompt theo 4 ý súc tích, dứt khoát.
  - [x] Bổ sung nguyên tắc 1: Vai trò & Đầu ra 1 block JSON chuẩn theo schema, không kèm văn bản ngoài.
  - [x] Bổ sung nguyên tắc 2: Tự động chia lô (batching 20–25 câu/phần) khi đề dài, mỗi phần là 1 block JSON hoàn chỉnh độc lập chống cắt ngang.
  - [x] Bổ sung nguyên tắc 3: Kỷ luật cú pháp JSON — cấm nối chuỗi `" + "`, `' + '`, cấm raw newline trong chuỗi, escape đúng `\"` và `\\` (`\\frac`, `\\le`, `\\0`), ưu tiên backtick `` `...` `` trong câu hỏi/giải thích; tích hợp chiến lược Hybrid xử lý ảnh.
  - [x] Bổ sung nguyên tắc 4: Chất lượng nội dung & giải thích (giữ nguyên câu hỏi + 4 đáp án; giải thích 2–3 câu vì sao đúng, vì sao nhiễu sai, cấm mẫu sáo rỗng, chống lười lặp khuôn).

- [x] **2. Kiểm thử & Build Verification**
  - [x] Kiểm tra cú pháp `node -c js/parser.js` hợp lệ 100%.
  - [x] Chạy `node tests/test-runner.js` — Pass 100% (675/675 tests passed, 0 failures).
  - [x] Chạy `node scripts/build.js` — Pass 100% (99 assets, bundle 4.54 MB).

---

## Nhật Ký Thực Thi (Agent cập nhật sau khi hoàn thành)
- **Trạng thái**: Hoàn thành 100% (Completed)
- **Chi tiết thực hiện**:
  + Tái cấu trúc hàm `AIParser.generateAIPromptTemplate({ topic, count, difficulty })` trong `js/parser.js`.
  + Prompt mới được cô đọng thành 4 mục đánh số rõ ràng, trực diện, loại bỏ các từ ngữ rườm rà nhưng bảo toàn đầy đủ các tiêu chuẩn sư phạm và schema JSON của hệ thống MindSparks.
  + Giải quyết triệt để 2 lỗi thực tế:
    1. Cơ chế chia lô (batching 20–25 câu) giúp tránh chạm giới hạn token của LLM, đảm bảo JSON luôn đóng thẻ đầy đủ.
    2. Chỉ thị cấm nối chuỗi (`" + "`, `' + '`) và cấm xuống dòng thô (raw newline) ngăn chặn triệt để lỗi parse JSON khi người dùng copy đề từ ChatGPT/Claude/DeepSeek.
  + Bảo toàn khả năng tương thích ngược và đáp ứng 100% các assertion của Test Suite 22, Suite 30 và Suite 31.
- **Kết quả `test-runner.js`**: **675/675 passed, 0 failed**.
- **Kết quả `build.js`**: **Pass 100%**.
