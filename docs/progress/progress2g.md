# TIẾN ĐỘ THỰC HIỆN ĐỢT 2G (`docs/progress/progress2g.md`)
> **File đặc tả gốc**: `docs/promt/promt2g.md`  
> **Mục tiêu**: Xử lý dứt điểm 4 lỗi về màu sắc đáp án đúng, lỗi phân mảnh dấu ngoặc KaTeX, và khóa cứng Prompt mẫu AI.

---

## Checklist Tiến Độ

- [x] **1. Khôi phục màu chữ trắng cho đáp án đúng trên theme tối (`css/style.css`, `css/theme.css`)**
  - [x] Khôi phục chữ màu trắng sáng `#ffffff !important` cho nhãn `A./B./C./D.`, text phương án và công thức `.katex` bên trong `.quiz-option-btn.correct`, `.bank-option-cell.correct` trên tất cả theme tối (`dark`, `monochrome`/`bw`, `ascii`, `purple-pink`, `violet-rose`).
  - [x] Chỉ dùng viền xanh lá nổi bật `#10b981 !important`, nền phủ xanh nhẹ `rgba(16, 185, 129, 0.16) !important` và dấu tích `✓` xanh qua `::after`.
  - [x] Trên theme sáng (`white-orange`, `orange`): giữ chữ màu tối `#1c1410 !important` tương phản cao, kèm viền xanh lá `#059669 !important` và dấu tích `✓` xanh.

- [x] **2. Fix triệt để lỗi đứt gãy dấu `{` (`\begin{cases}`) và tam giác trắng / co ngắn ở `[` (`\begin{bmatrix}`) (`css/style.css`)**
  - [x] Xóa bỏ triệt để các rule can thiệp thô bạo vào metric nội bộ KaTeX: `.katex, .katex * { line-height: normal !important; }` và `.katex svg { height: inherit !important; position: absolute !important; left: 0 !important; }`.
  - [x] Loại trừ `.katex` khỏi CSS base reset: `*:not(.katex, .katex *), *:not(.katex, .katex *)::before, *:not(.katex, .katex *)::after { box-sizing: border-box; }` để `katex.min.css` tự quản lý layout và box-sizing chính xác.
  - [x] Kiểm tra ma trận 3x5 và hệ phương trình 5 dòng render chuẩn xác 100%, không bị tam giác trắng hay đứt khúc curly brace.

- [x] **3. Khóa cứng Prompt mẫu trong `AIParser.generateAIPromptTemplate` (`js/parser.js`)**
  - [x] Đặt lệnh mở đầu nghiêm ngặt:
    `"CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI. CẤM TUYỆT ĐỐI tự ý chia thành Phần 1/Phần 2, CẤM dừng giữa chừng bảo người dùng gõ 'tiếp', CẤM viết lời dẫn đầu/cuối, CẤM mở block \`\`\`json thứ hai."`
  - [x] Rút gọn yêu cầu `explanation` xuống 1–2 câu cực ngắn gọn, đi thẳng vào công thức và lỗi sai bản chất để tiết kiệm token tối đa.
  - [x] Giữ nguyên đầy đủ: ghép ảnh lộn xộn, 4 đáp án hoàn toàn khác nhau, `[Cần hình minh họa]`, `[Đã bổ sung nhiễu]`, dùng `USD` thay cho `\$`, cấm gọi tên chữ cái A/B/C/D trong `explanation`.

- [x] **4. Kiểm thử & Đóng gói sản phẩm**
  - [x] Cập nhật các assertions trong `tests/test-runner.js` tương thích với các quy tắc mới.
  - [x] Chạy `node tests/test-runner.js` $\rightarrow$ **849 passed, 0 failed (100% PASS)**.
  - [x] Chạy `node scripts/build.js` $\rightarrow$ **100% hoàn thành (99 assets, 4.59 MB)**.
