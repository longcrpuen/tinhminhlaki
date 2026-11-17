# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2C (`docs/promt/promt2c.md`)
## Hỗ Trợ Ảnh Nhẹ Cho Câu Hỏi & Đáp Án (Nén WebP Tự Động, Dán `Ctrl+V`, Lightbox Phóng To & AI Prompt Hybrid)

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2c.md`
> **Mục tiêu**: Hỗ trợ các bộ đề có hình vẽ thực sự (sơ đồ ER, đồ thị miền nghiệm Desmos, hình học...) ở cả phần **câu hỏi** lẫn **từng đáp án A/B/C/D** mà vẫn nhẹ ổ cứng, giữ nguyên 90–120 FPS và tương thích ngược 100% với toàn bộ thẻ cũ.

---

## 1. MỞ RỘNG SCHEMA DỮ LIỆU & PARSER (`js/parser.js`)

### 1.1. Schema JSON mở rộng (Tương thích ngược 100%)
Trong `AIParser._normalizeJsonData(data)`:
1. **Ảnh câu hỏi**: Đọc thêm trường tùy chọn `const questionImage = (q.image || q.question_image || q.img || '').trim() || null;`.
2. **Ảnh từng đáp án (`options[]`)**:
   - Nếu `opt` là object: đọc `optImg = (opt.image || opt.img || '').trim() || null;`.
   - **Quan trọng**: Nếu một đáp án có `optImg` (ví dụ Câu 15 Đề 1 có 4 đáp án là 4 hình sơ đồ ER), cho phép `optText` rỗng hoặc tự gán nhãn ngắn mặc định (ví dụ `""` hoặc `"Hình " + letter`) mà **không báo lỗi trống text**!
   - Lưu `image: optImg` vào cả `normalizedOptions[i]` (`rawOptions`) lẫn trả về cùng `card`.
3. **Lưu `image: questionImage`** vào từng phần tử trong `validCards`.

### 1.2. Cập nhật `AIParser.generateAIPromptTemplate` theo chiến lược Hybrid
Bổ sung quy tắc xử lý đề thi có ảnh vào `generateAIPromptTemplate`:
- **Ảnh chụp chữ, công thức Toán/Lý/Hóa, hoặc bảng số liệu/bảng đơn hình**: Bắt buộc OCR và chuyển toàn bộ sang **Text + LaTeX (`$...$`, `$$...$$`) + Bảng Markdown** (KHÔNG giữ dạng ảnh).
- **Ảnh sơ đồ (ER, UML, mạch điện) hoặc đồ thị hình học**: **KHÔNG diễn giải thay thế bằng văn bản** (làm mất ý nghĩa câu hỏi). Giữ cấu trúc `"image": ""` trên câu hỏi hoặc từng `options[].image` để người dùng dán ảnh trực tiếp trên app.

---

## 2. BỘ NÉN ẢNH WEBP SIÊU NHẸ & QUẢN LÝ MEDIA (`js/app.js` & `js/db.js`)

### 2.1. Hàm nén ảnh tự động `App.compressImageToWebP(fileOrBlob, maxWidth = 880, quality = 0.78)`
- Nhận `File` / `Blob` từ clipboard (`Ctrl+V`) hoặc `<input type="file">`.
- Dùng `createImageBitmap` (hoặc `Image`) vẽ lên `<canvas>` tạm với tỷ lệ giữ nguyên (`width <= maxWidth`, với ảnh đáp án dùng `maxWidth = 640`).
- Xuất ra `canvas.toDataURL('image/webp', quality)` (fallback sang `'image/jpeg'` nếu trình duyệt không hỗ trợ WebP).
- **Mục tiêu dung lượng**: Mỗi ảnh sơ đồ/đồ thị chỉ còn **~25–60 KB**, không làm đầy ổ cứng hay phình IndexedDB khi sao lưu JSON.

### 2.2. Tương thích Database (`js/db.js`)
- Trong `db.updateCardContent(cardId, updates)` và `db.syncOptionsFromRaw(card)`:
  - Bảo toàn đầy đủ `card.image` và `opt.image` trong `card.rawOptions` (không làm mất `image` khi `syncOptionsFromRaw` tái đồng bộ text đáp án!).
- `db.exportAll()` và `db.importAll()` tự động giữ nguyên `image` vì đã nằm gọn dạng WebP data-URL nhẹ trong `card` và `rawOptions`.

---

## 3. GIAO DIỆN HIỂN THỊ, LIGHTBOX & DÁN ẢNH `Ctrl+V` (`index.html`, `css/style.css`, `js/app.js`)

### 3.1. Hiển thị ảnh đồng bộ trên cả 4 chế độ (Lazy-load, mượt 90–120 FPS)
Tạo helper dùng chung `App.renderCardImageHtml(src, alt = 'Hình minh họa', compact = false)`:
- Trả về `<div class="card-media-wrap ..."><img src="..." loading="lazy" decoding="async" onclick="App.openImageLightbox(this.src)" title="Bấm để phóng to"></div>`.
- Áp dụng đồng bộ tại:
  1. **Ôn tập / Quiz (`renderActiveStudyCard` & `_renderOptionsBlock`)**: Hiển thị `card.image` dưới đề bài và `optObj.image` bên trong nút đáp án (khi đáp án có ảnh).
  2. **Thi thử (`renderExamQuestion`)**: Tương tự Quiz.
  3. **Flashcard 3D (`_renderFlashcardContent`)**: Hiển thị `card.image` ở mặt trước và ảnh đáp án đúng (nếu có) ở mặt sau.
  4. **Ngân hàng câu hỏi (`_generateBankCardHtml`)**: Hiển thị ảnh thu gọn (`max-height: 180px; object-fit: contain`) để lướt danh sách không bị choáng màn hình, bấm vào sẽ phóng to.
- **Lightbox phóng to (`App.openImageLightbox(src)`)**: Modal kính mờ đơn giản, bấm nền tối hoặc `Esc` để đóng ngay, giúp soi rõ từng chữ nhỏ trên sơ đồ ER hoặc đồ thị Desmos.

### 3.2. Nhập & Dán ảnh (`Ctrl+V`) trong Modal Thêm/Sửa Câu Hỏi (`#modal-edit-card`)
- Thêm vùng dán/upload ảnh gọn đẹp ngay dưới ô **Câu hỏi** và dưới **mỗi ô đáp án A, B, C, D**:
  - Hỗ trợ **bấm vào ô hoặc focus rồi `Ctrl+V` trực tiếp ảnh chụp màn hình** (Snipping Tool) $\rightarrow$ tự động gọi `compressImageToWebP`, hiện thumbnail xem trước + nút `✕ Xóa ảnh`.
  - Hỗ trợ nút chọn file `🖼️ Chọn ảnh` cho cả Mobile.
- Khi `saveCardEdit()` lưu thẻ: lưu đồng bộ `image` của câu hỏi và `image` của từng phương án vào `card` & `rawOptions`.

---

## 4. DANH SÁCH KIỂM THỬ BẮT BUỘC

1. **Dán ảnh `Ctrl+V` & Nén WebP**: Chụp màn hình 1 sơ đồ ER hoặc đồ thị Desmos $\rightarrow$ `Ctrl+V` vào Modal Thêm câu hỏi (và thử dán 4 ảnh vào A, B, C, D) $\rightarrow$ ảnh nén sang `data:image/webp` (< 80 KB), hiển thị rõ nét ở Quiz, Thi thử, Flashcard và Ngân hàng câu hỏi.
2. **Lightbox**: Bấm vào ảnh trên câu hỏi/đáp án $\rightarrow$ phóng to sắc nét, nhấn `Esc` hoặc click ngoài để đóng.
3. **Tương thích ngược & Build**: Các bộ đề cũ không có ảnh (như `mol_tinhminhlakey.json`) vẫn hoạt động 100%, không lỗi `undefined`. Chạy `node tests/test-runner.js` và `node scripts/build.js` pass 100%, cập nhật vào `docs/progress/progress2c.md`.
