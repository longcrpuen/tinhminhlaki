# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2G (`docs/promt/promt2g.md`)
## Khôi Phục Màu Chữ Trắng Cho Đáp Án Đúng Theme Tối, Cách Ly KaTeX Delimiter & Khóa Cứng Prompt AI

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2g.md`  
> **Phạm vi tác động**: `css/style.css`, `css/theme.css`, `js/parser.js`, `js/app.js`, `tests/test-runner.js`.

---

## 1. MỤC TIÊU & BỐI CẢNH

1. **Khôi phục màu chữ trắng cho đáp án đúng trên theme tối (`css/style.css`, `css/theme.css`)**:
   - Trên các theme tối (`dark`, `bw`/`monochrome` tối, `ascii`, `purple-pink`, `violet-rose`): khi đáp án có trạng thái đúng (`.correct` / `.is-correct`), giữ nguyên màu chữ trắng sáng bình thường (`#ffffff`) cho cả nhãn `A./B./C./D.`, nội dung text và công thức `.katex` bên trong (không tô xanh chữ nữa), chỉ dùng viền xanh lá nổi bật (`#10b981`), nền phủ xanh nhẹ (`rgba(16, 185, 129, 0.16)`) và dấu tích `✓` xanh.
   - Trên các theme sáng (`white-orange`, `orange`): giữ chữ tối tương phản cao (`#1c1410`) kèm viền xanh lá rõ nét (`#059669`) và dấu tích `✓` xanh.

2. **Fix triệt để lỗi đứt gãy dấu `{` (`\begin{cases}`) và lỗi tam giác trắng / co ngắn ở dấu `[` (`\begin{bmatrix}`)**:
   - Xóa ngay các rule tự thêm ở đợt trước đang phá vỡ cấu trúc nội bộ của KaTeX: xóa `.katex, .katex * { line-height: normal !important; }` và xóa các rule ép vị trí / kích thước SVG thô bạo (`.katex svg { height: inherit !important; position: absolute !important; left: 0 !important; }`).
   - Loại trừ `.katex` và `.katex *` khỏi CSS base reset (`*:not(.katex, .katex *)`) để các metric font và SVG của `katex.min.css` tự điều phối tự nhiên.
   - Đảm bảo ma trận 3x5 và hệ phương trình 5 dòng render liền mạch 100%, không bị tam giác trắng, vỡ hay tách khúc.

3. **Khóa cứng Prompt mẫu trong `AIParser.generateAIPromptTemplate` (`js/parser.js`)**:
   - Mở đầu bằng chỉ thị cứng:
     `"CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI. CẤM TUYỆT ĐỐI tự ý chia thành Phần 1/Phần 2, CẤM dừng giữa chừng bảo người dùng gõ 'tiếp', CẤM viết lời dẫn đầu/cuối, CẤM mở block \`\`\`json thứ hai."`
   - Rút gọn yêu cầu `explanation` xuống 1–2 câu cực ngắn gọn, đi thẳng vào công thức/lỗi sai để tiết kiệm token tối đa.
   - Giữ nguyên các quy tắc: ghép ảnh lộn xộn, đủ 4 đáp án khác nhau hoàn toàn, `[Cần hình minh họa]`, `[Đã bổ sung nhiễu]`, dùng `USD` thay cho `\$`, cấm gọi tên chữ cái A/B/C/D trong `explanation`.

4. **Kiểm thử và Đóng gói**:
   - `node tests/test-runner.js` pass 100% (849/849 tests).
   - `node scripts/build.js` hoàn thành 100%.
