# ĐẶC TẢ KỸ THUẬT ĐỢT 1M (`promt1m.md`) — XỬ LÝ TRIỆT ĐỂ 14 LỖI UI/UX, LIQUID GLASS POPUP, SPOTLIGHT CON TRỎ, Ô LỌC MẤT FOCUS & KẸT NÚT MODAL CUỐI BÀI

> **Mục tiêu tối thượng**: Giải quyết dứt điểm và chính xác 100% cả **14 vấn đề giao diện & tương tác** vừa phát hiện qua bộ ảnh kiểm thử thực tế, đồng thời bảo toàn tuyệt đối dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và không làm ảnh hưởng ngược tới các phần đã ổn định ở đợt `1l`.

---

## QUY TẮC BẤT DI BẤT DỊCH TRƯỚC KHI SỬA CODE

1. **TUYỆT ĐỐI KHÔNG XÓA DỮ LIỆU NGƯỜI DÙNG**: Không gọi `indexedDB.deleteDatabase`, `localStorage.clear()`, hay sửa đổi schema của `MindSparksQuizDB`.
2. **KHÔNG LÀM HỎNG CÁC THEME ĐÃ ỔN ĐỊNH**: Khi sửa một thuộc tính cho một theme cụ thể (ví dụ: Popup Blur của `purple-pink` hoặc nút Focus Mode của `white-orange`), phải scope selector chính xác theo `html[data-color-mode="..."]` để không làm mất hiệu ứng của các theme còn lại.
3. **SỬA TẬN GỐC TRONG `css/style.css`, `js/app.js`, `index.html`**: Ghi đè trực tiếp hoặc đặt khối CSS/JS cuối file với độ ưu tiên cao nhất để không bị các khối `#1f`–`#1l` trước đó đè ngược.

---

## CHI TIẾT 14 HẠNG MỤC CẦN THỰC HIỆN NGAY

### 1. Tối ưu Thanh Tiêu Đề Nhóm Môn Học (`.subject-group-header` trong `#view-decks`)
- **Hiện trạng (Ảnh 1)**: Tại đầu mỗi khung nhóm môn học (`.subject-group-block`), thanh tiêu đề `.subject-group-header` đang là một hình chữ nhật màu đơn sắc góc vuông/lạc quẻ nằm lọt thỏm bên trong khung bo tròn lớn, nhìn tách rời và thiếu tự nhiên.
- **Giải pháp chuẩn Liquid Glass**:
  - Chuyển `.subject-group-header` sang chất liệu **Frosted Translucent Glass (kính mờ nhám đồng bộ với khung cha nhưng có độ đục cao hơn một chút để tạo điểm nhấn tiêu đề)**, bo góc đồng tâm (`border-radius: 18px !important; margin: 4px 4px 18px 4px !important; padding: 14px 20px !important;`).
  - Cụ thể cho từng mode:
    ```css
    /* Mode Tím Hồng */
    html[data-color-mode="purple-pink"] .subject-group-block .subject-group-header {
      background: linear-gradient(135deg, rgba(64, 32, 108, 0.72) 0%, rgba(42, 20, 74, 0.62) 100%) !important;
      backdrop-filter: blur(24px) saturate(170%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(170%) !important;
      border: 1px solid rgba(216, 180, 254, 0.28) !important;
      border-radius: 18px !important;
      box-shadow:
        0 8px 24px rgba(10, 4, 24, 0.28),
        inset 0 1.5px 1px rgba(255, 255, 255, 0.22) !important;
    }

    /* Mode Trắng Đen */
    html[data-color-mode="bw-dark"] .subject-group-block .subject-group-header {
      background: linear-gradient(135deg, rgba(46, 46, 52, 0.76) 0%, rgba(30, 30, 35, 0.66) 100%) !important;
      backdrop-filter: blur(24px) saturate(140%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(140%) !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      border-radius: 18px !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.32),
        inset 0 1.5px 1px rgba(255, 255, 255, 0.24) !important;
    }

    /* Mode Trắng Cam */
    html[data-color-mode="white-orange"] .subject-group-block .subject-group-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.74) 0%, rgba(255, 244, 232, 0.64) 100%) !important;
      backdrop-filter: blur(24px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
      border: 1px solid rgba(255, 255, 255, 0.92) !important;
      border-radius: 18px !important;
      box-shadow:
        0 8px 22px rgba(234, 88, 12, 0.08),
        inset 0 1.5px 2px rgba(255, 255, 255, 0.98) !important;
    }
    ```

---

### 2. Hiệu ứng Đổ Bóng Light Neon Tím khi trỏ vào Khung Quote ở Mode Tím Hồng (`purple-pink`)
- **Hiện trạng (Ảnh 3)**: Khi di chuột vào khung Quote (`.dashboard-hero-banner`) ở Mode Tím Hồng, phần đổ bóng phía dưới đang chỉ là bóng tối màu đen đơn điệu.
- **Giải pháp**: Đổi hiệu ứng `:hover` của `.dashboard-hero-banner` ở `purple-pink` sang hào quang **Light Neon Tím** rực sáng nhẹ nhàng phía dưới và xung quanh viền:
  ```css
  html[data-color-mode="purple-pink"] .dashboard-hero-banner:hover {
    border-color: rgba(232, 121, 249, 0.68) !important;
    box-shadow:
      0 22px 58px -8px rgba(192, 132, 252, 0.52),
      0 10px 32px rgba(236, 72, 153, 0.34),
      0 0 28px rgba(216, 180, 254, 0.32),
      inset 0 1.5px 2px rgba(255, 255, 255, 0.42),
      inset 0 -1px 2px rgba(192, 132, 252, 0.28) !important;
  }
  ```

---

### 3. Khôi phục Khung Viền Khúc Xạ Liquid Glass cho các Popup Blur ở Theme Tím Hồng (`purple-pink`)
- **Hiện trạng (Ảnh 4)**: Các popup/modal ở Theme Tím Hồng đang bị mất khung viền phân tách nên nhìn chìm hẳn vào nền tối phía sau (kiểm tra giữ nguyên `bw-dark` và `white-orange` nếu đã ổn).
- **Giải pháp**: Bổ sung khung viền khúc xạ 3D rõ nét (`border` + `inset` rim light + `box-shadow` phân lớp) cho `.modal-content` và `.confirm-dialog-box` ở `html[data-color-mode="purple-pink"]`:
  ```css
  html[data-color-mode="purple-pink"] .modal-overlay .modal-content,
  html[data-color-mode="purple-pink"] .confirm-dialog-box {
    background: linear-gradient(155deg, rgba(38, 18, 68, 0.78) 0%, rgba(22, 10, 42, 0.86) 100%) !important;
    backdrop-filter: blur(36px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(36px) saturate(180%) !important;
    border: 1.5px solid rgba(216, 180, 254, 0.42) !important;
    border-radius: 24px !important;
    box-shadow:
      0 28px 72px rgba(6, 2, 16, 0.78),
      0 0 36px rgba(168, 85, 247, 0.24),
      inset 0 1.5px 2px rgba(255, 255, 255, 0.36),
      inset 0 -1.5px 2px rgba(192, 132, 252, 0.22) !important;
  }
  ```

---

### 4. Điểm nhấn Fluted / Ribbed Glass Blur (Sọc Kính Khúc Xạ Một Phần) trên các Popup như Ảnh 5
- **Hiện trạng & Mong muốn (Ảnh 5)**: Thêm hiệu ứng dải kính sọc khúc xạ ánh sáng (`Fluted / Ribbed Glass`) kèm vầng sáng màu chủ đạo phía sau vào các Popup để giao diện hiện đại, có chiều sâu hơn — **NHƯNG CHỈ ĐẶT Ở MỘT PHẦN CỦA POPUP (dải trang trí góc trên / vùng `.modal-header`)**, tuyệt đối không phủ kín toàn bộ popup gây rối chữ.
- **Giải pháp**:
  - Đảm bảo `.modal-content` có `position: relative; overflow: hidden;`.
  - Tạo dải kính sọc khúc xạ một phần ở vùng đỉnh phải của `.modal-header` (hoặc `::before` của `.modal-header`) cao khoảng `100%` chiều cao header và rộng `45%` ở nửa bên phải, kết hợp mặt nạ mờ dần (`mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, transparent 100%)`):
    ```css
    .modal-overlay .modal-content .modal-header {
      position: relative !important;
      overflow: hidden !important;
    }

    /* Điểm nhấn Fluted / Ribbed Glass ở 1 phần góc trên của Popup */
    .modal-overlay .modal-content .modal-header::after {
      content: "" !important;
      position: absolute !important;
      top: 0 !important;
      right: 0 !important;
      width: 52% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 0 !important;
      background-image:
        radial-gradient(circle at 78% 50%, var(--fluted-glow, rgba(192, 132, 252, 0.38)) 0%, transparent 68%),
        repeating-linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.14) 0px,
          rgba(255, 255, 255, 0.02) 6px,
          rgba(0, 0, 0, 0.12) 12px,
          rgba(255, 255, 255, 0.10) 14px
        ) !important;
      -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0.9) 15%, rgba(0, 0, 0, 0.35) 60%, transparent 100%) !important;
      mask-image: linear-gradient(to left, rgba(0, 0, 0, 0.9) 15%, rgba(0, 0, 0, 0.35) 60%, transparent 100%) !important;
    }

    html[data-color-mode="purple-pink"] .modal-overlay .modal-content .modal-header::after {
      --fluted-glow: rgba(216, 180, 254, 0.42);
    }
    html[data-color-mode="bw-dark"] .modal-overlay .modal-content .modal-header::after {
      --fluted-glow: rgba(255, 255, 255, 0.26);
    }
    html[data-color-mode="white-orange"] .modal-overlay .modal-content .modal-header::after {
      --fluted-glow: rgba(251, 146, 60, 0.40);
    }

    .modal-overlay .modal-content .modal-header > * {
      position: relative !important;
      z-index: 1 !important;
    }
    ```

---

### 5. Xử lý triệt để lỗi Vầng Sáng Con Trỏ (`--mx: 50%, --my: 50%`) nằm chết ở chính giữa Object khi Hover
- **Nguyên nhân gốc rễ**:
  Ở đợt `1l`, hàm `initSpotlightHover()` trong `js/app.js` đã bị `return;` sớm để chống giật lag, khiến biến CSS `--mx` và `--my` không còn được cập nhật theo chuột và rơi về giá trị mặc định `50%, 50%` (chính giữa phần tử). Trong khi đó, các quy tắc CSS `::before` dùng `radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), ...)` trên `.bank-card-item::before`, `.deck-card::before`, `.mode-card::before`, `.stat-card::before` vẫn bật `opacity: 1` khi `:hover`, tạo ra một cục sáng tròn nằm chết cứng ở ngay tâm object (đặc biệt lộ rõ ở Dark Mode và Ngân hàng câu hỏi).
- **Giải pháp triệt để**:
  - **Bước 1 (CSS)**: Tắt hoàn toàn toàn bộ lớp `::before` dùng `var(--mx, 50%) var(--my, 50%)` bị kẹt ở tâm trên mọi thẻ:
    ```css
    .deck-card::before,
    .mode-card::before,
    .stat-card::before,
    .bank-card-item::before,
    .chart-card::before,
    .subject-group-block::before,
    .hero-stat-pill::before {
      background: none !important;
      opacity: 0 !important;
      display: none !important;
    }
    ```
  - **Bước 2**: Hiệu ứng `:hover` của các thẻ chỉ sử dụng sự chuyển đổi độ trong suốt kính (Crystal Clear Glass) và viền sáng đồng đều toàn khung (`box-shadow` + `border-color`), không bao giờ hiện đốm tròn nằm chết giữa thẻ nữa.

---

### 6. Xóa bỏ hoàn toàn Phần Overlay Trắng bị lòi ra khi trỏ chuột ra ngoài rìa trái qua Sidebar (Ảnh 6)
- **Hiện trạng (Ảnh 6)**: Khi đưa con trỏ chuột sát ra ngoài rìa bên trái màn hình (vượt qua cả `.app-sidebar`), một vệt/mảng sáng trắng bất thường xuất hiện dọc bên trái hoặc hắt lên các khung bên phải.
- **Giải pháp**:
  - Kiểm tra và tắt mọi pseudo-element `::before`/`::after` phát sáng hoặc blur tràn biên trên `.app-sidebar`, `.app-layout`, `body`, `#bg-layer`, đồng thời đặt `overflow-x: clip !important;` trên `body, .app-layout` và giữ `.app-sidebar` không có `box-shadow` trắng tràn ra ngoài khi `:hover`:
    ```css
    .app-sidebar::before,
    .app-sidebar::after {
      display: none !important;
      content: none !important;
    }
    .app-sidebar,
    .app-sidebar:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.22) !important;
      overflow: hidden !important;
    }
    ```

---

### 7. Sửa dứt điểm lỗi Ô Lọc Nhanh ở Thư Viện Thẻ (`#view-decks`) bị mất Focus sau mỗi chữ cái gõ vào
- **Nguyên nhân kỹ thuật chính xác 100%**:
  Trong `js/app.js`, hàm `renderDecks()` đang tạo lại toàn bộ HTML của `#decks-container` (bao gồm cả thanh công cụ chứa `<input id="deck-quick-filter" ...>` hoặc gọi `renderDecks()` ngay trong sự kiện `input`). Mỗi khi người dùng gõ **1 ký tự**, `renderDecks()` chạy lệnh `container.innerHTML = ...`, xóa thẻ `<input>` đang gõ khỏi DOM và vẽ thẻ `<input>` mới tinh — khiến trình duyệt **mất focus ngay lập tức sau 1 chữ cái**!
- **Giải pháp bắt buộc trong `js/app.js`**:
  1. Nếu `<input>` lọc nhanh nằm trong HTML động của `renderDecks()`, hãy **kiểm tra xem thanh filter bar đã tồn tại chưa, hoặc lưu trạng thái focus + vị trí con trỏ (`selectionStart`, `selectionEnd`) trước khi cập nhật danh sách, rồi khôi phục lại ngay lập tức**, HOẶC tốt nhất là **chỉ cập nhật phần danh sách nhóm môn học/bộ thẻ (`.decks-list-wrapper`) chứ KHÔNG vẽ đè lại thẻ `<input>` khi đang gõ**!
  2. Cụ thể trong `renderDecks()` (hoặc hàm xử lý lọc nhanh bộ thẻ):
     ```javascript
     // Trước khi cập nhật DOM trong renderDecks():
     const activeEl = document.activeElement;
     const isSearchFocused = activeEl && (
       activeEl.id === 'deck-search-input' ||
       activeEl.id === 'decks-filter-input' ||
       activeEl.classList.contains('deck-filter-input') ||
       (activeEl.tagName === 'INPUT' && activeEl.closest('#view-decks'))
     );
     const cursorStart = isSearchFocused ? activeEl.selectionStart : null;
     const cursorEnd = isSearchFocused ? activeEl.selectionEnd : null;
     const activeId = isSearchFocused ? activeEl.id : null;
     const activeClass = isSearchFocused ? activeEl.className : null;

     // ... (sau khi render DOM xong) ...
     if (isSearchFocused) {
       const newInput = (activeId && document.getElementById(activeId))
         || document.querySelector('#view-decks input[type="text"], #view-decks input[type="search"]');
       if (newInput) {
         newInput.focus({ preventScroll: true });
         try {
           const len = newInput.value.length;
           newInput.setSelectionRange(cursorStart ?? len, cursorEnd ?? len);
         } catch (_) {}
       }
     }
     ```
  3. Tương tự, áp dụng cơ chế giữ focus này cho mọi ô tìm kiếm khác trong app (như ô tìm kiếm trong Ngân hàng câu hỏi `#bank-search-input`) để gõ liền mạch 100%.

---

### 8. Đồng bộ Nút `"✕ Thoát Chế Độ Tập Trung (Focus Mode)"` ở Light Mode (`white-orange` — Ảnh 7)
- **Hiện trạng (Ảnh 7)**: Khi bật Focus Mode ở giao diện Trắng Cam (`white-orange`), nút `✕ Thoát Chế Độ Tập Trung (Focus Mode)` ở góc trên trái (`.focus-exit-floating-btn` / `#btn-exit-focus`) vẫn đang có nền đen đặc và chữ tối đen rất khó đọc!
- **Giải pháp**: Style lại nút thoát Focus Mode theo đúng từng theme (đặc biệt ở `white-orange` phải là kính sáng trắng kem viền cam, chữ nâu đen `#1c1917` sắc nét):
  ```css
  html[data-color-mode="white-orange"] .focus-exit-floating-btn,
  html[data-color-mode="white-orange"] #btn-exit-focus,
  html[data-color-mode="white-orange"] [class*="focus-exit"] {
    background: rgba(255, 250, 244, 0.88) !important;
    backdrop-filter: blur(20px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
    color: #1c1917 !important;
    border: 1.5px solid rgba(251, 146, 60, 0.55) !important;
    box-shadow:
      0 8px 24px rgba(234, 88, 12, 0.15),
      inset 0 1px 1px rgba(255, 255, 255, 0.95) !important;
    font-weight: 600 !important;
  }
  html[data-color-mode="white-orange"] .focus-exit-floating-btn:hover,
  html[data-color-mode="white-orange"] #btn-exit-focus:hover {
    background: rgba(255, 237, 213, 0.96) !important;
    color: #ea580c !important;
    border-color: rgba(249, 115, 22, 0.85) !important;
  }
  ```

---

### 9. Phân tách Hành Vi Nút `"<- Thoát"` và Phím `ESC` ở Màn Hình Quiz / Luyện Tập (`#view-study`)
- **Yêu cầu chuẩn xác từ người dùng**:
  1. **Khi bấm chuột vào nút `"<- Thoát"` (`#btn-exit-study`) ở góc trên trái màn hình Quiz/Flashcard**: Chuyển về **Thư viện bộ thẻ (`App.navigateTo('decks')`)** (thay vì quay về Trang chủ như trước).
  2. **Khi nhấn phím `ESC` trên bàn phím** (lúc đang ở màn hình Quiz `#view-study` và không có modal/focus mode nào đang mở): Quay thẳng về **Trang chủ (`App.navigateTo('dashboard')`)**!
- **Giải pháp trong `js/app.js`**:
  - Cập nhật sự kiện click của `#btn-exit-study`:
    ```javascript
    // Khi click nút <- Thoát trên giao diện học:
    // (Nếu có hộp thoại xác nhận đang làm dở hoặc thoát trực tiếp, đích đến phải là 'decks')
    App.exitStudySession('decks'); // Chuyển về Thư viện thẻ ('decks')
    ```
  - Cập nhật trình lắng nghe phím `Escape` (`keydown`):
    ```javascript
    // Nếu đang ở #view-study (Quiz / Flashcard):
    // 1. Nếu đang mở modal -> đóng modal
    // 2. Nếu đang bật Focus Mode -> thoát Focus Mode
    // 3. Nếu đang ở màn hình học bình thường -> gọi App.exitStudySession('dashboard') để về Trang chủ!
    ```
  - Sửa hàm `exitStudySession(targetView = 'decks')` để nhận tham số `targetView` (`'decks'` khi bấm nút `<- Thoát`, và `'dashboard'` khi nhấn phím `ESC`).

---

### 10. Tăng kích thước Font Chữ & LaTeX trong Hộp Giải Thích Quiz (`.quiz-explanation-box`, `#quiz-explanation-text`)
- **Hiện trạng (Ảnh 7)**: Phần giải thích chi tiết bên dưới câu hỏi trắc nghiệm và các ký hiệu toán học/công thức LaTeX (`.katex`) bên trong hộp giải thích vẫn còn hơi nhỏ, nhiều khoảng trống dư thừa.
- **Giải pháp CSS**:
  ```css
  .quiz-explanation-box,
  #quiz-explanation-box {
    padding: 20px 24px !important;
    border-radius: 16px !important;
    margin-top: 18px !important;
  }
  .quiz-explanation-box .explanation-title {
    font-size: 1.05rem !important;
    font-weight: 700 !important;
    margin-bottom: 10px !important;
  }
  #quiz-explanation-text,
  .quiz-explanation-box .explanation-content,
  .quiz-explanation-box p {
    font-size: 1.08rem !important;
    line-height: 1.72 !important;
  }
  #quiz-explanation-text .katex,
  .quiz-explanation-box .katex,
  .flashcard-explanation-box .katex {
    font-size: 1.26em !important;
  }
  ```

---

### 11. Mở rộng Chiều Cao Thẻ Flashcard theo Phần Giải Thích (`.flashcard-explanation-box`) — Bỏ hẳn Thanh Cuộn Nhỏ
- **Hiện trạng**: Trong `css/style.css` (khoảng dòng `2882`), `.flashcard-explanation-box.is-expanded .flashcard-explanation-text` đang bị giới hạn `max-height: 120px; overflow-y: auto;`, khiến người dùng phải cuộn một thanh scrollbar bé tí bên trong thẻ Flashcard, đồng thời chữ giải thích còn nhỏ.
- **Giải pháp triệt để**:
  - Xóa bỏ hoàn toàn `max-height: 120px` và `overflow-y: auto` trên `.flashcard-explanation-text`!
  - Cho phép thẻ `.flashcard-container`, `.flashcard-inner`, `.flashcard-back`, và `.flashcard-explanation-box` tự động giãn chiều cao (`height: auto !important; min-height: 360px; max-height: none !important; overflow: visible !important;`) để hiển thị trọn vẹn toàn bộ lời giải thích mà không bao giờ sinh ra thanh cuộn con bên trong:
    ```css
    .flashcard-container,
    .flashcard-inner {
      min-height: 360px !important;
      height: auto !important;
      max-height: none !important;
    }
    .flashcard-face.flashcard-back {
      position: relative !important;
      height: auto !important;
      min-height: 360px !important;
      max-height: none !important;
      overflow: visible !important;
      padding: 28px 32px !important;
    }
    .flashcard-explanation-box {
      width: 100% !important;
      margin-top: 18px !important;
      padding: 18px 22px !important;
      border-radius: 16px !important;
      max-height: none !important;
      overflow: visible !important;
    }
    .flashcard-explanation-box .flashcard-explanation-text,
    .flashcard-explanation-box.is-expanded .flashcard-explanation-text {
      display: block !important;
      -webkit-line-clamp: unset !important;
      max-height: none !important;
      overflow: visible !important;
      font-size: 1.06rem !important;
      line-height: 1.7 !important;
    }
    ```

---

### 12 & 13. Sửa LỖI NGHIÊM TRỌNG ở Popup Kết Thúc Bài Làm (`#modal-session-complete` — cả Quiz lẫn Flashcard): Bấm `"Về thư viện thẻ"` hoặc `"Xem thống kê"` bị kẹt cứng ở câu hỏi cuối cùng
- **Nguyên nhân kỹ thuật chính xác 100% (Root Cause)**:
  1. Trong `index.html` (dòng `1632` và `1635`), 2 nút ở cuối popup `#modal-session-complete` được viết là:
     ```html
     <button class="btn btn-secondary modal-close" onclick="App.navigateTo('decks')">Về thư viện thẻ</button>
     <button class="btn btn-primary modal-close" onclick="App.navigateTo('stats')">Xem thống kê</button>
     ```
  2. Ở đợt `1k`, một trình lắng nghe sự kiện click ở **Capture Phase (`document.addEventListener('click', ..., true)`)** đã được thêm vào để bắt mọi nút có class `.modal-close`:
     ```javascript
     const closeBtn = e.target.closest('.modal-close, [data-dismiss="modal"], .btn-cancel-modal');
     if (closeBtn) {
       const parentModal = closeBtn.closest('.modal-overlay');
       if (parentModal) {
         e.preventDefault();
         e.stopPropagation(); // <--- THỦ PHẠM CHÍNH!
         this._closeModal(parentModal);
         return;
       }
     }
     ```
  3. Vì listener này chạy ở **Capture Phase (`true`)** và gọi **`e.stopPropagation()`**, sự kiện click bị **chặn đứt ngay trên `document`** trước khi kịp lan truyền xuống phần tử `<button>`! Do đó, thuộc tính `onclick="App.navigateTo('decks')"` và `onclick="App.navigateTo('stats')"` trên 2 nút đó **KHÔNG BAO GIỜ ĐƯỢC THỰC THI**!
  4. Hậu quả: Popup `#modal-session-complete` đóng lại, nhưng trang không hề chuyển sang `decks` hay `stats`, để lại người dùng bị kẹt cứng ở màn hình câu hỏi cuối cùng (đã làm xong nên mọi nút trả lời đều bị khóa)!
- **Giải pháp bắt buộc (Sửa cả ở Listener lẫn HTML/JS)**:
  1. **Trong trình lắng nghe `.modal-close` (`js/app.js`)**:
     - **BỎ NGAY `e.stopPropagation()` và `e.preventDefault()`**, hoặc kiểm tra nếu nút `closeBtn` nằm trong `#modal-session-complete` / có thuộc tính `onclick` thì phải thực thi điều hướng ngay lập tức sau khi đóng modal:
       ```javascript
       const closeBtn = e.target.closest('.modal-close, [data-dismiss="modal"], .btn-cancel-modal');
       if (closeBtn) {
         const parentModal = closeBtn.closest('.modal-overlay');
         if (parentModal) {
           this._closeModal(parentModal);
           // Nếu nút có thuộc tính data-nav hoặc nằm trong #modal-session-complete:
           const inlineOnClick = closeBtn.getAttribute('onclick') || '';
           if (inlineOnClick.includes("navigateTo('decks')")) {
             e.preventDefault();
             e.stopPropagation();
             this.navigateTo('decks');
             return;
           }
           if (inlineOnClick.includes("navigateTo('stats')")) {
             e.preventDefault();
             e.stopPropagation();
             this.navigateTo('stats');
             return;
           }
           // Với các nút đóng thông thường không có onclick điều hướng:
           if (!inlineOnClick) {
             e.preventDefault();
             e.stopPropagation();
           }
           return;
         }
       }
       ```
  2. **Đồng thời trong hàm `navigateTo(viewName)` (`js/app.js`)**:
     - Khi chuyển ra khỏi `'study'` sang `'decks'`, `'stats'`, hoặc `'dashboard'`, luôn đảm bảo đóng mọi `.modal-overlay.active`, tắt Focus Mode nếu đang bật (`document.body.classList.remove('focus-mode')`), và cuộn lên đầu trang để giao diện đích hiển thị mượt mà 100%.

---

### 14. Tinh chỉnh Góc Bo của 4 Ô Trạng Thái tại Khung Quote (`border-radius: 10px` chuẩn hiện đại như Ảnh 8)
- **Hiện trạng (Ảnh 2 vs. Ảnh 8)**: 4 ô trạng thái (`.hero-stat-pill` / `.quote-stat-card`) trong khung Quote đang bo tròn hơi quá (`20px–22px`), làm mất đi nét sắc sảo hiện đại như thiết kế mẫu ở Ảnh 8 (`image_1ab5fa.jpg`).
- **Giải pháp**: Chỉnh `border-radius` của 4 ô trạng thái trong khung Quote về đúng **`10px !important`** trên cả 3 mode màu (vừa sắc nét hiện đại vừa có độ vát góc tinh tế):
  ```css
  .hero-stats-row .hero-stat-pill,
  .dashboard-hero-banner .hero-stat-pill,
  .quote-stats-grid .quote-stat-item {
    border-radius: 10px !important;
  }
  ```

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST)

Sau khi hoàn tất chỉnh sửa, Agent cần tự kiểm tra đủ 14 điểm:
- [ ] **1.** Thanh tiêu đề nhóm môn học (`.subject-group-header`) bo góc `18px`, dùng kính mờ nhám có độ đục cao hơn khung thân một chút, hòa nhập hoàn toàn với khung ngoài.
- [ ] **2.** Khung Quote ở Mode Tím Hồng khi `:hover` tỏa hào quang **Light Neon Tím** rực rỡ thay vì bóng đen tối.
- [ ] **3.** Các Popup Blur ở Mode Tím Hồng có khung viền khúc xạ 3D rõ nét chuẩn Liquid Glass.
- [ ] **4.** Các Popup có điểm nhấn sọc kính khúc xạ (**Fluted / Ribbed Glass**) ở một phần góc trên (`.modal-header::after`), không phủ tràn toàn bộ popup.
- [ ] **5.** Không còn đốm sáng tròn nằm chết ở chính giữa (`50% 50%`) khi di chuột vào bất kỳ thẻ hay câu hỏi nào ở Dark Mode / Ngân hàng câu hỏi.
- [ ] **6.** Di chuột sát ra ngoài rìa trái qua cả Sidebar không còn làm hiện mảng/vệt overlay trắng.
- [ ] **7.** Gõ liên tục nhiều ký tự vào ô lọc nhanh ở Thư viện bộ thẻ (`#view-decks`) và Ngân hàng câu hỏi mượt mà, không bao giờ bị mất focus sau mỗi chữ cái.
- [ ] **8.** Nút `"✕ Thoát Chế Độ Tập Trung (Focus Mode)"` ở Mode Trắng Cam (`white-orange`) có nền kính sáng kem, chữ nâu đen rõ nét.
- [ ] **9.** Ở màn hình Quiz/Flashcard: bấm nút `"<- Thoát"` chuyển về **Thư viện thẻ (`decks`)**; nhấn phím **`ESC`** chuyển về **Trang chủ (`dashboard`)**.
- [ ] **10.** Chữ giải thích và công thức LaTeX (`.katex`) trong hộp giải thích Quiz to rõ (`1.08rem` / `1.26em`), dễ đọc.
- [ ] **11.** Mặt sau thẻ Flashcard tự giãn chiều cao theo toàn bộ nội dung giải thích, xóa bỏ hoàn toàn thanh cuộn dọc nhỏ bên trong hộp giải thích.
- [ ] **12 & 13.** Khi hoàn thành bài Quiz hoặc Flashcard và hiện popup `#modal-session-complete`, bấm `"Về thư viện thẻ"` chuyển ngay sang Thư viện thẻ (`#view-decks`), bấm `"Xem thống kê"` chuyển ngay sang Thống kê (`#view-stats`), tuyệt đối không bị kẹt lại ở câu hỏi cuối cùng.
- [ ] **14.** 4 ô trạng thái trong khung Quote có góc bo `border-radius: 10px !important` sắc sảo đúng chuẩn Ảnh 8 trên cả 3 mode màu.
