# ĐẶC TẢ YÊU CẦU ĐỢT 2P (`docs/promt/promt2p.md`)
> **Nhánh thực hiện**: `fix/quiz-prompt-quality` (tách từ `main`)  
> **Phạm vi**: `js/parser.js`, `js/app.js`, `index.html`, `tests/test-runner.js`, `docs/promt/promt2p.md`, `docs/progress/progress2p.md`

---

## Mục Tiêu Tổng Quan
Kiểm tra toàn diện và nâng cấp cấu trúc prompt sinh câu hỏi AI cùng bộ parser (`AIParser` trong `js/parser.js`, luồng copy prompt & import trong `js/app.js`, và UI cấu hình số câu trong `index.html`) nhằm khắc phục tận gốc 4 nguyên nhân khiến AI bên ngoài sinh câu hỏi kém chất lượng hoặc gây rớt câu khi nhập vào ứng dụng.

---

## Phân Tích Nguyên Nhân Gốc Rễ (Root Cause) & Giải Pháp Triệt Để

### Vấn Đề 1: Chặn Lỗi "Sinh Nhiều Block Trong 1 Lần" và Sai Định Dạng
#### Root Cause
1. **Prompt**: Mẫu `generateAIPromptTemplate` cũ có mâu thuẫn nội tại (yêu cầu cấm viết lời dẫn nhưng mục 2 lại dặn "ghi chú số câu bị thiếu ở cuối câu trả lời"), thiếu mệnh lệnh khóa cứng biên giới bắt đầu bằng ```` ```json ```` và kết thúc bằng ```` ``` ````, thiếu trường `total_questions`, và hàm `App.copyFlaggedAIPrompt()` không có quy tắc chống tách block / cấm lời dẫn / chuẩn hóa định dạng.
2. **Parser (`js/parser.js`)**:
   - `fenceRegex` trong `_extractJsonBlocks` nuốt ký tự xuống dòng sau thẻ đóng ```` ``` ````, khiến 2 block ```` ```json ```` nằm sát nhau (```` ```\n```json ````) bị bỏ sót hoàn toàn block thứ 2.
   - Code fence thụt lề, fence 4 backtick (`` ````json ``), thẻ đóng cùng dòng (`}``` `), hoặc JSON trần kèm lời dẫn đầu/cuối làm `_extractJsonBlocks` và `_tryRepairAndParseJson` parse thất bại.
   - Khi AI tách từng câu đơn lẻ vào từng block `{ "id": "q1", "question": "...", "options": [...] }`, `_isQuizJsonData` và `_mergeParsedJsonBlocks` từ chối toàn bộ.
   - `_sanitizeJsonString` chưa lọc comment JSONC (`// ...`, `/* ... */`), dấu chấm lửng `...` / `…` lạc ngoài chuỗi, dấu phẩy trùng `, ,`, BOM/ký tự zero-width (`\uFEFF`, `\u200B-\u200D`, `\u2060`) và ngoặc kép cong (`“ ”`).
   - `_mergeParsedJsonBlocks` có lỗi khử trùng lặp nhầm (`byId`): hai câu hoàn chỉnh khác nhau ở Phần 1 và Phần 2 có cùng `id: "q1"` và chung 20 ký tự mở đầu (ví dụ `"Trong lập trình hướng đối tượng..."`) bị gộp nhầm gây rớt câu.
   - `_normalizeJsonData` rớt câu khi AI sinh lệch nhẹ schema (`"correct_option_id": "B."`, `correctOptionId`, `correct_answer`, hoặc `options` dạng object map `{ a: "...", b: "..." }`).
   - `_parseTextFormat` bị hỏng hoặc nuốt Câu 1 khi văn bản có lời dẫn mở đầu, nhiều fence ```` ```markdown ````/```` ```text ````, đường kẻ `---`, hoặc chữ đậm `**Câu 1:**`, `- **A.**`, `**Đáp án đúng:** **B**`.

#### Giải Pháp
- **Siết chặt output trong prompt** (`AIParser.generateAIPromptTemplate` và `AIParser.generateFlaggedRewritePrompt`): bắt buộc xuất **duy nhất 1 khối ```` ```json ```` liền mạch** (bắt đầu ngay bằng ```` ```json ```` và kết thúc ngay bằng ```` ``` ````), cấm lời dẫn đầu/cuối, cấm chèn lời giải thích rườm rà hay comment `//` giữa các câu, chuyển ghi chú thiếu dữ kiện vào `"description"` trong JSON, kèm schema chuẩn tuyệt đối có `"total_questions"`.
- **Gia cố `js/parser.js`**:
  + Xây dựng bộ tách block 2 tầng (bộ quét code fence 3+ backtick theo từng dòng kết hợp bộ quét ngoặc cân bằng `_extractBalancedJsonCandidates` nhận biết chuỗi & comment), bảo toàn thứ tự tài liệu cho cả block có fence lẫn JSON trần, hỗ trợ tách nhiều object trong 1 fence và gộp các block câu hỏi đơn lẻ.
  + Siết `_isQuizJsonData` cho mảng (không bị mảng số minh họa kiểu `[[1, 2], [3, 4]]` trong lời dẫn làm nhiễu).
  + Nâng cấp `_sanitizeJsonString` + `_stripInvisibleChars` + `_normalizeStructuralSmartQuotes` (lọc comment JSONC mà vẫn giữ nguyên `https://...` trong chuỗi).
  + Khắc phục lỗi false-positive deduplication theo `byId` trong `_mergeParsedJsonBlocks` / `_areQuestionsDuplicate`.
  + Nâng cấp `_normalizeJsonData` chịu được biến thể `correctOptionId` / `correct_answer` / `"B."` / object-map `options`, và nâng cấp `_parseTextFormat` chịu được Markdown đa fence có chữ đậm & lời dẫn.

---

### Vấn Đề 2: Chặn Lỗi "Sinh Thiếu Số Lượng Câu Yêu Cầu"
#### Root Cause
- Prompt cũ chỉ nhắc `${count} câu hỏi` một lần sơ sài, không ép đánh số `q1..qN`, không có bước tự đối chiếu đếm số câu, không cấm viết tắt `...` hay gộp câu.
- Giao diện `#view-import` chưa có ô nhập số câu (`#import-prompt-count`), nên `App.copyAIPrompt()` luôn mặc định cứng `count = 10` (đồng thời có lỗi shadowing biến `prompt` trong nhánh `.catch()`).
- `AIParser.parse()` và `App.processImport()` chưa đối chiếu `total_questions` khai báo với số câu thực tế parse được.

#### Giải Pháp
- Bổ sung cơ chế ép số lượng tường minh trong prompt: đánh số thứ tự liên tục từ `1` đến `N` (`"q1"` -> `"qN"`), khai báo `"total_questions": N`, bắt buộc tự đối chiếu đếm đủ đúng `N` câu trước khi đóng mảng `questions`, cấm viết tắt kiểu `...`, `// các câu còn lại tương tự`, cấm gộp câu hoặc dừng giữa chừng.
- Bổ sung `#import-prompt-count` trong `index.html`, nối vào `App.copyAIPrompt()` (đồng thời sửa lỗi shadowing `window.prompt`), và xuất thêm `expectedCount`, `missingCount`, `mergedBlockCount` từ `AIParser.parse()` để `App.processImport()` cảnh báo ngay nếu AI xuất thiếu câu.

---

### Vấn Đề 3: Chặn Lỗi "Chưa Đọc Hết Tài Liệu / Chưa Combine Đủ Kiến Thức"
#### Root Cause
- Prompt cũ thiên nặng về OCR ảnh đề thi, thiếu hoàn toàn quy trình đọc tài liệu giáo trình/slide dài, khiến AI chỉ lấy câu hỏi từ vài trang đầu và sinh câu hỏi cắt dán đơn lẻ.

#### Giải Pháp
- Thiết kế **Quy trình phân tích tài liệu nguồn BẮT BUỘC 3 bước** trong Nguyên tắc 1 của `generateAIPromptTemplate`:
  1. **Bước 1 — Quét toàn văn**: đọc từ đầu đến cuối tất cả mục/chương/slide, định nghĩa, bảng biểu, ví dụ và kết luận (tuyệt đối không chỉ lấy vài trang/slide đầu).
  2. **Bước 2 — Phân bổ đều phủ kín mọi phần**: phân bổ đều `N` câu hỏi phủ kín 100% các phần quan trọng, ghi rõ tên Chương/Mục vào trường `"topic"`.
  3. **Bước 3 — Kết hợp (combine) kiến thức liên phần**: phân tầng nhận thức (Nhận biết ~25–30%, Thông hiểu ~35–40%, Vận dụng/Phân tích ~30–40%); bắt buộc câu mức độ hiểu/vận dụng phải kết hợp, so sánh, đối chiếu hoặc xâu chuỗi nhân-quả kiến thức từ nhiều mục/slide khác nhau.

---

### Vấn Đề 4: Nâng Chất Lượng Câu Hỏi & Phương Án Nhiễu (Chặn "Sinh Ngu")
#### Root Cause
- Prompt cũ chỉ cấm trùng đáp án và quy định giải thích, thiếu ràng buộc về cân bằng độ dài, tính học thuật của phương án nhiễu và chống lộ đáp án (lexical giveaway, đáp án lười kiểu "Tất cả đều đúng", dồn chữ cái đáp án).

#### Giải Pháp
- Bổ sung bộ tiêu chuẩn 4 phương án trong Nguyên tắc 5 (và `generateFlaggedRewritePrompt`):
  + 4 lựa chọn bắt buộc đồng đều độ dài, đồng nhất cấu trúc ngữ pháp và mức độ chi tiết.
  + 3 phương án nhiễu phải hợp lý về mặt học thuật (từ nhầm lẫn phổ biến, khái niệm gần nghĩa, sai điều kiện biên/bước tính bám sát tài liệu gốc).
  + Cấm đáp án nhiễu lộ liễu, vô lý, hài hước, lệch chủ đề; cấm lặp y nguyên cụm từ khóa đặc thù chỉ vào đáp án đúng; cấm phương án lười biếng ("Tất cả đều đúng", "Cả A và B", "Không có đáp án nào đúng"); cân bằng `correct_option_id` giữa `a, b, c, d`.
  + Giữ trọn quy tắc `explanation` 1–2 câu súc tích bám sát tài liệu gốc, nêu rõ đúng/sai và cấm gọi tên chữ cái đáp án vì tính năng shuffle.

---

## Tiêu Chuẩn Nghiệm Thu
1. Bổ sung **Test Suite 47** trong `tests/test-runner.js` kiểm chứng đầy đủ 4 trụ cột prompt, `generateFlaggedRewritePrompt`, parser đa code block, nhiễu định dạng, chống rớt câu và kiểm đếm `expectedCount`/`missingCount`.
2. `node tests/test-runner.js`: 100% test suites (Suite 1–47) pass, 0 failed.
3. `node scripts/build.js`: Đóng gói thành công PWA Offline không lỗi cú pháp.
