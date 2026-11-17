# TIẾN ĐỘ THỰC HIỆN ĐỢT 2C (`docs/progress/progress2c.md`)
> **File đặc tả gốc**: `docs/promt/promt2c.md`
> **Mục tiêu**: Hỗ trợ ảnh nhẹ (WebP tự nén ~25–60KB) cho cả câu hỏi và từng đáp án A/B/C/D, hỗ trợ dán `Ctrl+V`, Lightbox phóng to và AI Prompt Hybrid.

---

## Checklist Tiến Độ

- [x] **1. Mở rộng Schema & Parser (`js/parser.js`)**
  - [x] Hỗ trợ `q.image` (`question_image` / `img`) và `options[].image` trong `AIParser._normalizeJsonData`.
  - [x] Cho phép option có ảnh không bị báo lỗi nếu `text` rỗng (hiển thị tiền tố tự động `A.`, `B.`, ...).
  - [x] Cập nhật `AIParser.generateAIPromptTemplate` theo hướng Hybrid (chữ/công thức/bảng $\rightarrow$ LaTeX/Text; sơ đồ ER/đồ thị $\rightarrow$ giữ `image`).

- [x] **2. Nén ảnh WebP & Bảo toàn Database (`js/db.js`, `js/app.js`)**
  - [x] Cài đặt `App.compressImageToWebP(fileOrBlob, maxWidth, quality)` tự resize (880px cho câu hỏi, 640px cho đáp án) + nén WebP (fallback JPEG) dung lượng ~25–60KB.
  - [x] Đảm bảo `db.syncOptionsFromRaw(card)` và `updateCardContent()` giữ nguyên `card.image` và `rawOptions[].image`.
  - [x] Đảm bảo `db.healCorruptedCardOptions(card)` bảo toàn trường `image` của từng option.

- [x] **3. UI Hiển thị, Lightbox & Dán `Ctrl+V` (`index.html`, `css/style.css`, `js/app.js`)**
  - [x] Hiển thị ảnh (`loading="lazy"`, `decoding="async"`) đồng bộ ở 4 chế độ: Ôn tập/Quiz, Thi thử (cả dạng 1 câu và danh sách tất cả câu hỏi), Flashcard 3D (mặt trước & mặt sau) và Ngân hàng câu hỏi.
  - [x] Thêm Lightbox phóng to ảnh (`#modal-lightbox`, `#lightbox-image`) khi click, đóng bằng `Esc` hoặc click nền/nút đóng.
  - [x] Thêm vùng dán `Ctrl+V` / chọn file ảnh + thumbnail xem trước + nút xóa ảnh cho Đề bài và từng đáp án A, B, C, D trong `#modal-edit-card`.
  - [x] Hỗ trợ tương thích giao diện dark mode và White Orange theme.

- [x] **4. Kiểm thử & Build Verification**
  - [x] Kiểm thử dán ảnh câu hỏi + đáp án, kiểm tra kích thước WebP và tương thích ngược 100% với bộ đề cũ không có ảnh.
  - [x] Chạy `node tests/test-runner.js` — Pass 100% (675/675 tests passed).
  - [x] Chạy `node scripts/build.js` — Pass 100% (99 assets, bundle 4.54 MB).

---

## Nhật Ký Thực Thi (Agent cập nhật sau khi hoàn thành)
- **Trạng thái**: Hoàn thành toàn diện (Completed)
- **Kết quả `test-runner.js`**: **675/675 passed, 0 failed** (bổ sung Suite 31 bao phủ toàn diện 40 kịch bản kiểm thử cho Đợt 2c).
- **Kết quả `build.js`**: **Pass 100%**, cấu trúc build PWA `dist/` hoàn chỉnh sẵn sàng production.
- **Tương thích ngược**: 100% tương thích với dữ liệu IndexedDB hiện hữu và các định dạng JSON/Text cũ. Thẻ không ảnh serialize sạch, không sinh `undefined`.
