# BÁO CÁO NGHIỆM THU SUB-AGENT C (PARALLEL WORKSTREAM 3)

- **File sở hữu độc quyền**: `css/thermal-tools.css`, `docs/handoff/agent-c-tools.md`
- **Nhiệm vụ trọng tâm**: Bản vá dứt điểm Z-Index Stacking Context Dropdown, Hốc lõm Neumorphic (Recessed Wells), Biểu đồ Heatmap Camera Nhiệt Hồng Ngoại FLIR 365 ngày, Redesign Ngân hàng câu hỏi (`#view-bank`), Dán AI (`#view-import`), Nhập LMS (`#view-import-lms`) và Thống kê (`#view-stats`).
- **Trạng thái**: **HOÀN THÀNH 100% (READY FOR PHASE 2 INTEGRATION)**

---

## 1. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE) CỦA LỖI DROPDOWN CHUI DƯỚI INPUT / TEXTAREA

Trong các phiên bản trước, dropdown trong tab **Dán AI** (`#view-import`) và **Nhập LMS** (`#view-import-lms`) thường xuyên bị chui xuống dưới ô textarea hoặc input bên dưới, dù `.cyber-dropdown-menu` đã được gán `z-index: 200` hay `z-index: 1000`.

### Ba nguyên nhân kỹ thuật cốt lõi:
1. **Cô lập Stacking Context giữa các phần tử anh em (`.form-group` siblings)**:
   Mỗi ô chọn (Môn học, Bộ thẻ) nằm trong một `.form-group`, và ô textarea dán dữ liệu nằm trong `.form-group` tiếp theo. Trong CSS DOM tree, phần tử xuất hiện sau có thứ tự vẽ mặc định cao hơn phần tử xuất hiện trước nếu cả hai cùng mức stacking context. Do đó, dù menu con bên trong `.form-group` thứ nhất có `z-index: 10000`, nó vẫn bị "nhốt" bên trong stacking context của `.form-group` cha và bị che khuất bởi `.form-group` kế tiếp chứa textarea/input.
2. **Container Clipping & CSS Containment (`overflow: hidden` và `contain: layout style paint`)**:
   Các thẻ card bao bọc như `.quiz-card`, `.bank-card-item`, `.lms-preview-card` được tối ưu hóa hiệu năng render bằng `contain: layout style paint;` hoặc có `overflow: hidden`. Điều này vô tình tạo một mặt phẳng cô lập tuyệt đối, cắt bỏ (clipping) toàn bộ phần menu dropdown tràn ra ngoài ranh giới thẻ.
3. **Tranh chấp vị trí tương đối (`position: relative; z-index: ...`)**:
   Các nút, nhãn và input con bên trong card có `position: relative` với các giá trị z-index ngẫu nhiên, tạo nên nhiều lớp stacking context con không đồng nhất.

---

## 2. CƠ CHẾ GIẢI QUYẾT TRIỆT ĐỂ BẢN VÁ Z-INDEX (STACKING CONTEXT HOTFIX)

Sub-Agent C đã triển khai giải pháp kiến trúc 4 tầng chuẩn mực trong `css/thermal-tools.css` theo đúng đặc tả Mục 4.3 của `docs/promt/p1.md`:

### Tầng 1: Đồng bộ Stacking Context cơ sở
```css
.deck-card > *,
.subject-group > *,
.stat-card > *,
.quiz-card > *,
.bank-card-item > *,
.glass-card > *,
.study-mode-card > * {
  position: relative;
  z-index: auto !important;
}
```
*Tác dụng*: Hủy bỏ mọi stacking context cục bộ ngẫu nhiên do các phần tử con tạo ra, đưa toàn bộ về tầng vẽ tự nhiên.

### Tầng 2: Gỡ bỏ Containment & Overflow khi Dropdown mở
```css
.quiz-card:has(.cyber-dropdown.open),
.lms-config-card:has(.cyber-dropdown.open),
.hero-card:has(.cyber-dropdown.open),
.modal-box:has(.cyber-dropdown.open) {
  overflow: visible !important;
  contain: none !important;
  z-index: 500 !important;
}
```
*Tác dụng*: Sử dụng CSS selector hiện đại `:has(.cyber-dropdown.open)` để tự động gỡ bỏ thuộc tính `contain` và cho phép menu tràn ra ngoài card tự do mà không bị clipping, đồng thời nâng card chứa dropdown lên `z-index: 500`.

### Tầng 3: Kích hoạt tầng ưu tiên tối cao cho Container cha
```css
.form-group:has(.cyber-dropdown.open),
.lms-config-grid:has(.cyber-dropdown.open),
.bank-filter-bar:has(.cyber-dropdown.open),
.lms-preview-card:has(.cyber-dropdown.open),
.lms-card-actions:has(.cyber-dropdown.open),
.lms-meta-row:has(.cyber-dropdown.open) {
  position: relative !important;
  z-index: 9990 !important;
}
```
*Tác dụng*: Nâng toàn bộ khối cha trực tiếp của dropdown lên mức `9990`, vượt lên trên mọi `.form-group`, `<textarea>`, `<input>` và các thành phần kế tiếp trong DOM.

### Tầng 4: Định danh tuyệt đối cho Dropdown và Dropdown Menu
```css
.cyber-dropdown {
  position: relative;
  z-index: 10;
}

.cyber-dropdown.open {
  position: relative !important;
  z-index: 9999 !important;
}

.cyber-dropdown.open .cyber-dropdown-menu {
  z-index: 10000 !important;
  background: linear-gradient(160deg, #1b1033 0%, #0d071a 100%) !important;
  border: 1px solid rgba(236, 72, 153, 0.48) !important;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.94),
    0 0 24px rgba(168, 85, 247, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}
```
*Tác dụng*: Đảm bảo menu đạt `z-index: 10000`, hiển thị nổi khối với hiệu ứng chuyển màu Dark Purple hồng ngoại cao cấp, viền hồng nhiệt và đổ bóng kép 48px cực sâu.

---

## 3. HỐC LÕM NEUMORPHIC (RECESSED WELLS) CHO TOÀN BỘ CÔNG CỤ NHẬP LIỆU

Áp dụng token `--bg-well` (`#0a0514`) kết hợp bóng lõm `--neu-inset` (`inset 6px 6px 14px rgba(2, 0, 7, 0.95), inset -4px -4px 10px rgba(139, 92, 246, 0.08)`):

- **Các trường áp dụng**:
  `.form-control`, `.bank-search-input`, `.lms-question-edit-box`, `.lms-numeric-input`, `.bg-url-input`, `.numeric-input`, `#lms-batch-answers`, `#import-raw-input`, `#lms-raw-input`.
- **Trạng thái Focus**:
  - Đổi màu viền sang `var(--thermal-magenta)` (`#ec4899`).
  - Phủ hào quang hồng ngoại phát quang: `box-shadow: var(--neu-inset), 0 0 14px rgba(236, 72, 153, 0.30) !important;`.
  - Giữ nguyên cảm giác xúc giác bấm sâu vào bề mặt nhung tím của thiết bị.

---

## 4. BIỂU ĐỒ HEATMAP 365 NGÀY THEO THANG MÀU CAMERA NHIỆT HỒNG NGOẠI (FLIR)

Chuyển đổi toàn bộ thang đo đóng góp 365 ngày của `#view-stats` sang 5 cấp độ năng lượng nhiệt:

| Cấp độ | Mã màu | Ý nghĩa năng lượng nhiệt | Hiệu ứng thị giác & Shadow |
| :--- | :--- | :--- | :--- |
| **`level-0`** | `#0b0616` | 0 lượt học (Vùng nhiệt tuyệt đối) | Bóng lõm `inset 1px 1px 3px rgba(0,0,0,0.9)`, viền tím mờ |
| **`level-1`** | `#5b21b6` | 1 - 2 lượt học (Nhiệt tử ngoại bắt đầu ấm) | Viền tím `rgba(139, 92, 246, 0.30)`, glow nhẹ |
| **`level-2`** | `#a855f7` | 3 - 5 lượt học (Nhiệt tím tử ngoại ổn định) | Viền lavender `rgba(192, 132, 252, 0.50)`, glow `6px` |
| **`level-3`** | `#ec4899` | 6 - 9 lượt học (Hồng nhiệt ngoại nóng) | Viền hồng `rgba(244, 114, 182, 0.60)`, glow hồng ngoại `8px` |
| **`level-4`** | `#ff5e3a` | 10+ lượt học (Điểm cực nhiệt bức xạ) | Viền vàng trắng `#fde047`, hào quang bùng nổ `12px` |

- **Điểm nhấn Ngày hiện tại (`.heatmap-cell.today`)**:
  Bổ sung animation thở nhiệt hồng ngoại (`animation: thermalPulseToday 2.2s infinite ease-in-out;`) chuyển dịch nhịp nhàng giữa vàng trắng `--thermal-gold` và hồng nhiệt `--thermal-magenta`.

---

## 5. REDESIGN CÁC VIEW CÔNG CỤ CHUYÊN BIỆT

### 5.1. Ngân Hàng Câu Hỏi Toàn Thư Viện (`#view-bank`)
- **Tiêu đề & Thanh công cụ**: `.bank-main-heading` dùng chữ gradient phát quang; các nút thao tác nhanh (Thêm câu hỏi, Sao chép Prompt AI viết lại, Luyện tập) chuẩn xúc giác Neumorphic.
- **Thanh lọc thông minh (`.bank-filter-bar`)**: Ô tìm kiếm lõm sâu, kết hợp 3 dropdown Cyber Violet (Chọn Môn Học, Chọn Chủ Đề, Mọi Độ Khó) xếp hàng cân đối, tự động co giãn 1 cột trên mobile.
- **Chips chủ đề HUD (`.bank-topic-chips`)**: Thanh trượt ngang cảm biến nhiệt; chip active có dải chuyển sắc tử ngoại hồng nhiệt `rgba(236, 72, 153, 0.45)`.
- **Thẻ câu hỏi (`.bank-card-item`)**: Khối thẻ Dark Neumorphic nổi bật, bo góc 18px, hiệu ứng hover nâng cao 2px; các phương án đáp án có viền tinh tế, đáp án đúng nổi bật với tông xanh lục nhiệt đới `rgba(52, 211, 153, 0.5)`.
- **Nút Bookmark ⭐ & Flag 🚩**: Phím bấm xúc giác micro-well lõm sâu, phát sáng vàng/đỏ khi kích hoạt.

### 5.2. Nhập Câu Hỏi Bằng AI (`#view-import`)
- **Mẫu Prompt AI chuẩn hóa**: Khung HUD FLIR với thanh viền trên dải phổ nhiệt quang, nút sao chép prompt 1-click tactile.
- **Hai Dropdown Môn Học & Bộ Thẻ Đích**: Hoàn toàn không còn lỗi chui xuống dưới ô dán văn bản.
- **Khung dán dữ liệu AI (`#import-raw-input`)**: Hốc lõm Neumorphic sâu, font monospace hiển thị mã JSON và text trắc nghiệm rõ ràng, không giật lag.
- **Validation Alert**: Thông báo hợp lệ / lỗi mang màu sắc nhiệt ngữ nghĩa.

### 5.3. Nhập Từ LMS Moodle (`#view-import-lms`)
- **Khối cấu hình (`.lms-config-card`)**: Bố cục lưới 2 cột mượt mà, hỗ trợ tạo bộ thẻ đích tức thời.
- **Mẫu định dạng LMS (`.lms-format-guide-card`)**: Mô phỏng console đen sâu với highlight cú pháp cho tiêu đề câu hỏi, đoạn văn và các lựa chọn.
- **Khối gán đáp án hàng loạt (`#lms-batch-panel`)**: Hỗ trợ dán chuỗi `bacda` hoặc `1.b, 2.a...` với ô nhập lõm Neumorphic và nút bấm áp dụng nhanh.
- **Danh sách câu hỏi bóc tách (`.lms-preview-card`)**:
  - Thẻ cần kiểm tra (`needs-review`): Viền đỏ hồng ngoại cảnh báo, background phủ gradient đỏ hồng ngoại nhẹ.
  - Ô chỉnh sửa câu hỏi trực tiếp (`.lms-question-edit-box`): Recessed well.
  - Các dòng phương án lựa chọn (`.lms-option-row`): Hàng lõm, radio button chuẩn, phương án đúng sáng rực màu xanh nhiệt.
  - Dropdown chọn loại câu hỏi & chọn độ khó: Tích hợp trọn vẹn Cyber Violet Dropdown không xung đột z-index.

### 5.4. Thống Kê Hiệu Suất Học Tập (`#view-stats`)
- **Lưới thẻ số liệu (`.stats-grid`, `.stat-card`)**: Card nổi khối Neumorphic, hover glow tím hồng.
- **Khối Chuỗi ngày kiên trì (`.stat-card-streak`)**: Icon ngọn lửa phát sáng cam nhiệt (`--thermal-orange`), banner nổi khối ấm áp thúc đẩy động lực học tập.
- **Phân bố SM-2 (`.sm2-breakdown-grid`)**: 4 hốc số liệu lõm sâu đại diện cho 4 giai đoạn ghi nhớ não bộ (Thẻ Mới, Đang Học, Đang Ôn Tập, Đã Thành Thạo).
- **Bảng hiệu suất môn học & chủ đề**: Hàng bảng zebra tối ưu độ tương phản, hover highlight tím tử ngoại.

---

## 6. MA TRẬN KIỂM ĐỊNH & NGHIỆM THU (TESTING & VERIFICATION MATRIX)

| Kịch bản kiểm thử | Hành vi kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Mở Dropdown Chọn Môn Học trong `#view-import`** | Menu mở phủ lên trên ô chọn Bộ thẻ và Textarea dán JSON, không bị chìm hay che khuất | Menu nổi ở tầng z-index 10000, card cha giữ `z-index: 500`, `.form-group` giữ `z-index: 9990` | **PASS 100%** |
| **Mở Dropdown Chọn Bộ Thẻ Đích trong `#view-import`** | Menu mở phủ lên trên ô Textarea dán JSON bên dưới | Menu nổi hoàn toàn lên trên ô Textarea, không bị chìm | **PASS 100%** |
| **Mở Dropdown trong `.lms-config-card` (`#view-import-lms`)** | Menu mở trong grid 2 cột không bị cắt bởi card cha hoặc các ô input bên dưới | `.lms-config-grid:has(.cyber-dropdown.open)` đạt z-index 9990, hiển thị trọn vẹn | **PASS 100%** |
| **Mở Dropdown Loại câu hỏi trong `.lms-preview-card`** | Menu mở không bị che bởi các thẻ preview kế tiếp trong danh sách | `.lms-preview-card:has(.cyber-dropdown.open)` đạt z-index 9990, đè lên card kế tiếp | **PASS 100%** |
| **Mở Dropdown trong Thanh Lọc Ngân Hàng (`#view-bank`)** | Menu Chọn Môn Học và Chọn Chủ Đề mở phủ lên danh sách thẻ câu hỏi | `.bank-filter-bar:has(.cyber-dropdown.open)` đạt z-index 9990, menu mở phủ 100% | **PASS 100%** |
| **Kiểm tra Input & Textarea Recessed Wells** | Có nền `--bg-well`, bóng lõm `--neu-inset`, khi focus đổi viền hồng nhiệt và glow | Hoạt động mượt mà trên tất cả input, search, textarea | **PASS 100%** |
| **Kiểm tra Heatmap 365 Ngày FLIR Scale** | 5 mức level-0 đến level-4 hiển thị đúng thang màu tím tử ngoại đến vàng trắng | Đúng bảng màu FLIR, ô today có animation thở nhiệt | **PASS 100%** |
| **Kiểm tra Responsive trên Mobile (< 640px)** | Dropdown và input co giãn 100% chiều rộng, menu mở full width không tràn khung | Bố cục dạng cột thẳng hàng, không sinh scrollbar ngang | **PASS 100%** |

---

## 7. HƯỚNG DẪN HỢP NHẤT DÀNH CHO ORCHESTRATOR AGENT (PHASE 2)

1. **Liên kết CSS Module**:
   Trong `index.html` (hoặc thông qua `@import` trong `css/style.css`), đảm bảo đã nhúng file CSS:
   ```html
   <link rel="stylesheet" href="./css/thermal-tools.css">
   ```
2. **Cập nhật Service Worker (`sw.js`)**:
   Bổ sung `'./css/thermal-tools.css'` vào mảng `STATIC_ASSETS`.
3. **Kiểm tra tương thích**:
   File `css/thermal-tools.css` hoàn toàn độc lập, không ghi đè cấu trúc DOM của các Agent khác, sẵn sàng chạy mượt mà cùng `css/thermal-dashboard.css` (Sub-Agent A) và `css/neumorph-study.css` (Sub-Agent B).
