# ĐẶC TẢ KỸ THUẬT ĐỢT 1X (`promt1x.md`)
## Sửa Tận Gốc: (1) Bo Góc Đồng Tâm Đều Khít Trên Thanh Topbar Pill & (2) Phân Loại Đúng 3 Nguồn Câu Hỏi (`ai` / `lms` / `manual`)

---

## 1. SỬA LỖI BO GÓC KHÔNG ĐỀU TRÊN THANH TOPBAR PILL (CONCENTRIC BORDER RADIUS)

### 1.1. Nguyên nhân gốc rễ
Cụm pill góc trên bên phải (chứa 3 nút chuyển theme + vạch chia `|` + `.streak-chip` `🔥 X ngày`) đang bị lệch khoảng cách viền trên/dưới/trái/phải do:
1. **Padding ngoài không đồng đều** (ví dụ padding ngang lớn hơn padding dọc) khiến khe hở giữa phần tử trong và viền pill ngoài ở cạnh trên/dưới bị sát hơn cạnh trái/phải.
2. **Chiều cao của nút active theme (hình tròn trắng) và `.streak-chip` không bằng nhau**, làm đường cong bo góc bên trái và bên phải không đồng tâm với viền pill bao ngoài.

### 1.2. Công thức chuẩn toán học (Concentric Pill Geometry)
Để tại mọi góc bo (trên, dưới, trái, phải và 4 góc chéo 45°), khoảng cách từ phần tử bên trong ra viền pill ngoài **đều nhau tuyệt đối**:
- Gọi chiều cao thống nhất của tất cả phần tử con ở 2 đầu là **`H_inner = 32px`** (bán kính `R_inner = 16px`).
- Gọi padding đồng nhất cả 4 phía của pill bao ngoài là **`P = 4px`** (`padding: 4px;` — tuyệt đối không đặt `padding: 4px 10px`).
- Khi đó:
  - Chiều cao pill ngoài = `32px + 4px × 2 = 40px` (`R_outer = 20px`).
  - Hiệu bán kính ở mọi góc = `R_outer - R_inner = 20px - 16px = 4px` $\equiv$ đúng bằng `padding` trên/dưới/trái/phải!

### 1.3. Yêu cầu chỉnh sửa CSS (`css/style.css`)
Tìm khối CSS của cụm pill góc trên bên phải (topbar theme switcher + `.streak-chip` + container bao ngoài) và chuẩn hóa đồng bộ:
1. **Container bao ngoài** (pill chứa cụm chuyển theme & streak):
   - `display: inline-flex; align-items: center; gap: 6px;`
   - `padding: 4px;` *(bắt buộc bằng nhau cả 4 phía trên/dưới/trái/phải)*
   - `border-radius: 9999px;`
   - `box-sizing: border-box;`
2. **Các nút chọn theme bên trong**:
   - `width: 32px; height: 32px;` *(cố định hình tròn `32×32px`, `border-radius: 9999px`)*
   - `display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;`
3. **Vạch chia dọc `|`**:
   - `width: 1px; height: 18px; margin: 0 2px; flex-shrink: 0;`
4. **`.streak-chip` nằm bên phải**:
   - `height: 32px;` *(bắt buộc bằng đúng `32px` như nút theme)*
   - `padding: 0 12px;`
   - `display: inline-flex; align-items: center; gap: 5px;`
   - `border-radius: 9999px;`
   - `box-sizing: border-box; line-height: 1; white-space: nowrap;`
5. **Kiểm tra chéo toàn app**: Áp dụng cùng nguyên tắc đồng tâm `R_outer = R_inner + padding` cho mọi cặp container–item bo tròn lồng nhau trên cả Desktop và Mobile (`@media (max-width: 768px)` nếu thu nhỏ thì giữ tỉ lệ đồng nhất, ví dụ `H_inner = 28px`, `padding: 3px`).

---

## 2. SỬA TẬN GỐC LỖI PHÂN LOẠI NGUỒN CÂU HỎI (`ai` vs `lms` vs `manual`)

### 2.1. Nguyên nhân gốc rễ
Hệ thống quy định rõ 3 nguồn dữ liệu:
1. **`ai`** (`✨ Nguồn: AI`): Các câu hỏi được nhập từ tab **Dán câu hỏi AI** (qua `AIParser` / `processImport()`).
2. **`lms`** (`🎓 Nguồn: LMS`): Các câu hỏi được nhập từ tab **Nhập từ LMS** (qua `LMSParser` / `saveLmsToDeck()`).
3. **`manual`** (`✍️ Nguồn: Thủ công`): Các câu hỏi do người dùng **tự tạo/nhập tay** qua Modal **Thêm câu hỏi** (`saveCardEdit()`), hoặc thẻ mẫu hệ thống.

**Lỗi hiện tại**:
- `AIParser._normalizeJsonData` (`js/parser.js` dòng 86555) và `AIParser._parseTextFormat` (`js/parser.js` dòng 86597) **KHÔNG hề gán thuộc tính `source: 'ai'`**.
- `App.processImport()` (`js/app.js` dòng 103073) khi lưu các thẻ vừa parse từ tab AI cũng **KHÔNG gán `source: 'ai'`**.
- Khi render ở Ngân hàng câu hỏi (`js/app.js` dòng 104904 & 104998), mọi thẻ bị thiếu `source` (`undefined`) đều bị fallback thành **`Nguồn: Thủ công`**. Vì vậy toàn bộ câu hỏi nhập từ tab AI đều bị gắn nhầm thành `Thủ công`.

### 2.2. Sửa tận gốc ở cả 4 điểm

#### Bước 1: `js/parser.js` — Gán mặc định `source: 'ai'` trong `AIParser`
1. Trong `AIParser._normalizeJsonData(data)` (`validCards.push({...})`, khoảng dòng 86555):
   - Thêm: `source: (q.source && ['ai', 'lms', 'manual'].includes(q.source)) ? q.source : 'ai',`
2. Trong `AIParser._parseTextFormat(text)` (`cards.push({...})`, khoảng dòng 86597):
   - Thêm: `source: 'ai',`

#### Bước 2: `js/app.js` — Gán tường minh `source` tại tất cả các điểm tạo thẻ
1. Trong `processImport()` (tab **Dán câu hỏi AI**, khoảng dòng 103073):
   ```javascript
   const cardsToSave = parsed.cards.map(c => ({
     ...c,
     id: db.generateUniqueCardId(),
     deckId: targetDeckId,
     subjectId: targetSubjectId,
     source: c.source || 'ai'
   }));
   ```
2. Trong `saveCardEdit()` khi **tạo mới câu hỏi thủ công** (`newCard`, khoảng dòng 104326):
   - Thêm tường minh: `source: 'manual',`
   - Khi **cập nhật câu hỏi đã có** (`updates`, khoảng dòng 104284): **GIỮ NGUYÊN `source` gốc** của thẻ (tuyệt đối không ghi đè `source` của thẻ AI/LMS thành `manual` khi người dùng chỉ sửa chính tả hoặc chỉnh đáp án!).
3. Kiểm tra `saveLmsToDeck()` (tab **Nhập từ LMS**, khoảng dòng 103722): giữ nguyên `source: 'lms'`.

#### Bước 3: `js/db.js` — Tự động chuẩn hóa lại `source` cho các thẻ cũ trong IndexedDB
Trong `ensureDataIntegrity()` (hoặc `syncOptionsFromRaw(card)`), xử lý các thẻ cũ đang bị `source` trống (`undefined` / `null` / `''`) trong IndexedDB để không cần import lại:
- Nếu `card.id` bắt đầu bằng `'lms_'`: gán `card.source = 'lms'`.
- Nếu `card.source` đang trống (`!card.source`):
  - Nếu thẻ thuộc một batch import nhiều câu cùng lúc (có `Array.isArray(card.rawOptions)` và cùng `deckId` với các thẻ khác có `createdAt` chênh lệch `<= 5000ms`), hoặc có `correctOptionId` từ JSON parser (nhưng không phải `card_active_constraint_` / `card_ridge_regression_`): gán **`card.source = 'ai'`**.
  - Ngược lại (tạo đơn lẻ thủ công): gán **`card.source = 'manual'`**.
- Chỉ thực hiện chuẩn hóa cho các thẻ chưa có `source` (`!card.source`), **tuyệt đối không ghi đè** các thẻ đã có `source` hợp lệ (`'ai'`, `'lms'`, `'manual'`).

#### Bước 4: Cập nhật Test (`tests/test-runner.js`)
- Kiểm tra `AIParser.parse(...)` (cả JSON lẫn Plaintext) luôn trả về `card.source === 'ai'`.
- Kiểm tra `LMSParser.parse(...)` luôn trả về `card.source === 'lms'`.
- Kiểm tra bộ lọc nguồn trong Ngân hàng câu hỏi (`ai`, `lms`, `manual`) tách bạch chính xác 3 nhóm, không còn tình trạng thẻ AI rơi vào `manual`.
- Chạy `node tests/test-runner.js` và `node scripts/build.js` đảm bảo pass 100%.
