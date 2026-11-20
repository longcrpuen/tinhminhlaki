# TIẾN ĐỘ THỰC HIỆN ĐỢT 2P (`docs/progress/progress2p.md`)
> **Nhánh**: `fix/quiz-prompt-quality` (tách từ `main`)  
> **Thời điểm hoàn thành**: 2026-11-21  
> **Trạng thái**: Hoàn tất 100% mục tiêu Đợt 2p

---

## 1. Kết Quả Thực Hiện

| Hạng mục | Trạng thái | Chi tiết triển khai |
| :--- | :---: | :--- |
| **Vấn đề 1: Chặn sinh nhiều block & sai định dạng** | Hoàn thành | Siết chặt biên giới đầu ra trong `AIParser.generateAIPromptTemplate` và `AIParser.generateFlaggedRewritePrompt` (bắt buộc duy nhất 1 khối ```` ```json ```` liền mạch, cấm lời dẫn/bình luận `//`, đưa ghi chú thiếu câu vào `"description"`, chuẩn hóa schema có `"total_questions"`). Viết lại tầng tách/làm sạch của `js/parser.js` gồm `_stripInvisibleChars`, `_sanitizeJsonString` (lọc JSONC `//` & `/* */`, `...`, `, ,`, bảo toàn URL trong chuỗi), `_normalizeStructuralSmartQuotes`, `_extractBalancedJsonCandidates` và `_extractJsonBlocks` 2 tầng (hỗ trợ block liền kề ```` ```\n```json ````, fence 3+ backtick, fence thụt lề, đóng cùng dòng `}``` `, pha trộn fence + JSON trần đúng thứ tự, nhiều object trong 1 fence, gộp block từng câu đơn lẻ). Sửa lỗi khử trùng lặp nhầm theo `byId` trên câu hoàn chỉnh chung tiền tố 20 ký tự, bổ sung khôi phục schema drift (`"B."`, `correctOptionId`, `correct_answer`, object-map `options`) và nâng cấp `_parseTextFormat` xử lý văn bản Markdown đa fence có chữ đậm/lời dẫn. |
| **Vấn đề 2: Chặn sinh thiếu số lượng câu yêu cầu** | Hoàn thành | Bổ sung cơ chế ép số lượng tường minh từ `1` đến `N` (`"q1"`..`"qN"`), khai báo `"total_questions": N`, checklist tự đối chiếu đếm đủ `N` câu trước khi đóng ```` ``` ````, cấm viết tắt `...`, cấm gộp câu hoặc dừng giữa chừng. Thêm ô nhập `#import-prompt-count` vào `index.html`, nối vào `App.copyAIPrompt()` (đồng thời sửa lỗi shadowing biến `window.prompt`), và bổ sung `expectedCount` / `missingCount` / `mergedBlockCount` trong kết quả `AIParser.parse()` để `App.processImport()` hiển thị cảnh báo ngay khi AI xuất thiếu câu. |
| **Vấn đề 3: Quét toàn văn & Combine kiến thức liên phần** | Hoàn thành | Tái thiết kế Nguyên tắc 1 của `generateAIPromptTemplate` với quy trình phân tích tài liệu nguồn 3 bước bắt buộc: (1) Quét toàn bộ từ đầu đến cuối mọi mục/chương/slide, bảng biểu, ví dụ và kết luận; (2) Phân bổ đều `N` câu hỏi phủ kín mọi phần và gắn `"topic"` theo Chương/Mục; (3) Phân tầng nhận thức và bắt buộc kết hợp (`combine`) kiến thức liên kết giữa các phần cho câu hỏi mức độ hiểu/vận dụng. |
| **Vấn đề 4: Nâng chất lượng câu hỏi & phương án nhiễu** | Hoàn thành | Bổ sung bộ quy chuẩn chống "sinh ngu" trong Nguyên tắc 5 và `generateFlaggedRewritePrompt`: yêu cầu 4 phương án đồng đều độ dài/cấu trúc ngữ pháp, 3 phương án nhiễu hợp lý về mặt học thuật bám sát tài liệu gốc, cấm nhiễu lộ liễu/vô lý/lặp y nguyên từ khóa/phương án lười biếng ("Tất cả đều đúng"), cân bằng `correct_option_id` giữa `a, b, c, d`, giữ trọn quy tắc `explanation` 1–2 câu súc tích bám tài liệu gốc và không gọi tên chữ cái đáp án. |

---

## 2. Kết Quả Kiểm Thử & Đóng Gói

### 2.1. Kiểm thử tự động (`node tests/test-runner.js`)
- Tổng số test case: **1,522 passed, 0 failed** (100% pass, không làm hỏng bất kỳ suite cũ nào từ Suite 1 đến Suite 46).
- Bổ sung **Test Suite 47** (31 assertions) kiểm định đầy đủ:
  + 4 trụ cột chất lượng của `AIParser.generateAIPromptTemplate` và parse sạch schema mẫu có `expectedCount`.
  + `AIParser.generateFlaggedRewritePrompt`, tích hợp `js/app.js` (`import-prompt-count`, `missingCount`, sửa shadowing `window.prompt`) và `index.html`.
  + Parser đa block & chống rớt câu: block ```` ```json ```` liền kề không dòng trống, block thụt lề + lời dẫn + `---` + `}``` `, pha trộn block có fence và JSON trần giữ nguyên thứ tự, mỗi câu 1 block riêng, 2 object trong 1 fence, bảo vệ câu khác nhau cùng `id: "q1"` chung tiền tố 20 ký tự.
  + Làm sạch nhiễu định dạng: JSON trần bọc lời dẫn chứa `{...}`/`[...]` và ma trận số `[[1,2],[3,4]]`, comment `//` & `/* */` kèm bảo toàn URL `https://...//...`, dấu `...`, `, ,`, BOM/zero-width, fence 4 backtick `` ````json ``, ngoặc kép cong `“ ”`, schema drift (`"B."`, `correctOptionId`, `correct_answer`, object-map `options`), Markdown text đa fence có chữ đậm `**Câu 1:**` và lời dẫn.
  + Cơ chế kiểm đếm số lượng: phát hiện chính xác `expectedCount` và `missingCount` khi AI xuất thiếu câu.

### 2.2. Đóng gói sản phẩm (`node scripts/build.js`)
- Xác thực cú pháp toàn bộ 14 core JS files (`node --check`): **100% Passed**.
- Đóng gói hoàn chỉnh **101 files** (`4.88 MB`) vào `dist/`, sẵn sàng PWA Offline.

---

## 3. Các Tệp Tin Đã Chỉnh Sửa & Bổ Sung
1. `js/parser.js`: Nâng cấp toàn diện `AIParser` (`_stripInvisibleChars`, `_sanitizeJsonString`, `_normalizeStructuralSmartQuotes`, `_isSingleQuestionObject`, `_extractExpectedCount`, `_extractBalancedJsonCandidates`, `_extractJsonBlocks`, `_mergeParsedJsonBlocks`, `parse`, `_normalizeJsonData`, `_parseTextFormat`, `generateAIPromptTemplate`) và bổ sung `generateFlaggedRewritePrompt`.
2. `js/app.js`: Cập nhật `pasteSampleData()`, `copyAIPrompt()` (đọc `#import-prompt-count`, sửa shadowing `window.prompt`), `processImport()` (cảnh báo `missingCount` & thông báo gộp `mergedBlockCount`), và `copyFlaggedAIPrompt()` (dùng `AIParser.generateFlaggedRewritePrompt`).
3. `index.html`: Thêm ô cấu hình số câu `#import-prompt-count` trong khung Mẫu Prompt AI chuẩn hóa và đồng bộ `"total_questions": 1` trong placeholder `#import-raw-input`.
4. `tests/test-runner.js`: Bổ sung **Test Suite 47** kiểm chứng toàn diện prompt chất lượng cao & parser đa block / nhiễu định dạng / đếm đủ câu.
5. `docs/promt/promt2p.md` & `docs/progress/progress2p.md`: Hồ sơ đặc tả & tiến độ Đợt 2p.
