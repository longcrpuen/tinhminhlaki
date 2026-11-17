# TIẾN ĐỘ THỰC HIỆN ĐỢT 2C (`docs/progress/progress2c.md`)
> **File đặc tả gốc**: `docs/promt/promt2c.md`
> **Mục tiêu**: Hỗ trợ ảnh nhẹ (WebP tự nén ~25–60KB) cho cả câu hỏi và từng đáp án A/B/C/D, hỗ trợ dán `Ctrl+V`, Lightbox phóng to và AI Prompt Hybrid.

---

## Checklist Tiến Độ

- [ ] **1. Mở rộng Schema & Parser (`js/parser.js`)**
  - [ ] Hỗ trợ `q.image` (`question_image` / `img`) và `options[].image` trong `AIParser._normalizeJsonData`.
  - [ ] Cho phép option có ảnh không bị báo lỗi nếu `text` rỗng.
  - [ ] Cập nhật `AIParser.generateAIPromptTemplate` theo hướng Hybrid (chữ/công thức/bảng $\rightarrow$ LaTeX/Text; sơ đồ ER/đồ thị $\rightarrow$ giữ `image`).

- [ ] **2. Nén ảnh WebP & Bảo toàn Database (`js/db.js`, `js/app.js`)**
  - [ ] Cài đặt `App.compressImageToWebP(fileOrBlob, maxWidth, quality)` tự resize + nén WebP.
  - [ ] Đảm bảo `db.syncOptionsFromRaw(card)` và `updateCardContent()` giữ nguyên `card.image` và `rawOptions[].image`.

- [ ] **3. UI Hiển thị, Lightbox & Dán `Ctrl+V` (`index.html`, `css/style.css`, `js/app.js`)**
  - [ ] Hiển thị ảnh (`loading="lazy"`) đồng bộ ở Quiz, Thi thử, Flashcard 3D và Ngân hàng câu hỏi.
  - [ ] Thêm Lightbox phóng to ảnh khi click, đóng bằng `Esc` hoặc click nền.
  - [ ] Thêm vùng dán `Ctrl+V` / upload ảnh + nút xóa ảnh cho Đề bài và từng đáp án A, B, C, D trong `#modal-edit-card`.

- [ ] **4. Kiểm thử & Build Verification**
  - [ ] Test dán ảnh câu hỏi + 4 ảnh đáp án, kiểm tra kích thước WebP và tương thích ngược thẻ cũ.
  - [ ] Chạy `node tests/test-runner.js` — Pass 100%.
  - [ ] Chạy `node scripts/build.js` — Pass 100%.

---

## Nhật Ký Thực Thi (Agent cập nhật sau khi hoàn thành)
- **Trạng thái**: Chưa bắt đầu
- **Kết quả `test-runner.js`**: _Chờ chạy_
- **Kết quả `build.js`**: _Chờ chạy_
