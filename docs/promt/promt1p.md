# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1P (BẢN GỘP ĐẦY ĐỦ: SỬA DỨT ĐIỂM 7 BUG MỚI + TỐI ƯU HÓA TỔNG THỂ 144+ FPS) — CHẾ ĐỘ THI THỬ, CHỌN ICON MÔN HỌC, XỬ LÝ TEXT ICON DROPDOWN AI/LMS, ĐỒNG BỘ CHÂN MOBILE LIQUID GLASS NHƯ SIDEBAR DESKTOP, XOÁ LAG ĐỔI THEME MOBILE, SÓNG ÁNH SÁNG QUANG HỌC & TỐI ƯU GPU/DB/KATEX (`promt1p.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1p` (Gộp **Phần 1: Sửa 7 Bug mới phát hiện** + **Phần 2: 6 Hạng mục tối ưu hóa FPS kịch trần** trên nền `ARCHITECTURE_GRAPH.md`)
> * **Ràng buộc Bất Di Bất Dịch (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn tuyệt đối 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **100% Test Suite Compatibility (445/445 PASS):** Đảm bảo toàn bộ `npm test` và `npm run build` đạt 100% PASS.

---

## PHẦN 1: SỬA DỨT ĐIỂM 7 BUG GIAO DIỆN & TƯƠNG TÁC (THỰC HIỆN TRƯỚC TIÊN)

### Bug 1: Mode Thi Thử (`#view-exam` — `image_e266a2.jpg`) — Thanh Câu Hỏi Trên Cùng (`#exam-palette-bar` / `.exam-palette-bar`) Vẫn Bị Màu Tím Ở Cả Mode Trắng Đen Và Trắng Cam
- **Hiện trạng (`image_e266a2.jpg`)**: Thanh ngang chứa các ô số thứ tự câu hỏi `1, 2, 3... 10` (`.exam-palette-bar`) vẫn đang dùng nền màu tím than tối (`#363147` / `rgba(26, 22, 42, 0.88)`) ở cả Mode Trắng Đen và Mode Trắng Cam.
- **Giải pháp bắt buộc trong `css/theme.css` và `css/style.css`**:
  Đồng bộ `.exam-palette-bar` và các nút số `.exam-palette-btn` sang chuẩn **Liquid Glass `135deg`** theo từng theme:
  ```css
  /* ==========================================================================
     BUG 1: ĐỒNG BỘ THANH CÂU HỎI CHẾ ĐỘ THI THỬ (.exam-palette-bar) THEO 3 THEME
     ========================================================================== */
  #exam-palette-bar,
  .exam-palette-bar {
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border-radius: 18px !important;
    padding: 10px 14px !important;
    transition: background 0.2s ease, border-color 0.2s ease !important;
  }

  /* 1. Mode Tím Hồng */
  :root #exam-palette-bar,
  html[data-theme="dark"] #exam-palette-bar,
  html[data-theme="purple-pink"] #exam-palette-bar,
  :root .exam-palette-bar,
  html[data-theme="purple-pink"] .exam-palette-bar {
    background: linear-gradient(145deg, rgba(42, 28, 74, 0.72) 0%, rgba(24, 16, 44, 0.62) 100%) !important;
    border: 1px solid rgba(216, 180, 254, 0.26) !important;
    box-shadow: inset 1px 1px 1.5px rgba(255, 255, 255, 0.24), 0 10px 24px rgba(0, 0, 0, 0.35) !important;
  }
  :root .exam-palette-btn,
  html[data-theme="purple-pink"] .exam-palette-btn {
    background: rgba(255, 255, 255, 0.10) !important;
    color: #e9d5ff !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
  }
  :root .exam-palette-btn.answered,
  :root .exam-palette-btn.active,
  html[data-theme="purple-pink"] .exam-palette-btn.answered,
  html[data-theme="purple-pink"] .exam-palette-btn.active {
    background: #9333ea !important;
    color: #ffffff !important;
    border-color: #f472b6 !important;
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.45) !important;
  }

  /* 2. Mode Trắng Đen (Monochrome — 0% Tím!) */
  html[data-theme="monochrome"] #exam-palette-bar,
  body[data-theme="monochrome"] #exam-palette-bar,
  html[data-theme="monochrome"] .exam-palette-bar {
    background: linear-gradient(145deg, rgba(38, 38, 44, 0.76) 0%, rgba(20, 20, 24, 0.66) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.22) !important;
    box-shadow: inset 1px 1px 1.5px rgba(255, 255, 255, 0.30), 0 10px 24px rgba(0, 0, 0, 0.50) !important;
  }
  html[data-theme="monochrome"] .exam-palette-btn,
  body[data-theme="monochrome"] .exam-palette-btn {
    background: rgba(255, 255, 255, 0.10) !important;
    color: #e4e4e7 !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
  }
  html[data-theme="monochrome"] .exam-palette-btn.answered,
  html[data-theme="monochrome"] .exam-palette-btn.active,
  body[data-theme="monochrome"] .exam-palette-btn.answered {
    background: #ffffff !important;
    color: #09090b !important;
    border-color: #ffffff !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.28) !important;
  }

  /* 3. Mode Trắng Cam (White-Orange — Kính sáng kem ấm, 0% Tím!) */
  html[data-theme="white-orange"] #exam-palette-bar,
  body[data-theme="white-orange"] #exam-palette-bar,
  html[data-theme="white-orange"] .exam-palette-bar {
    background: linear-gradient(145deg, rgba(255, 252, 248, 0.78) 0%, rgba(255, 240, 226, 0.66) 100%) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.92) !important;
    box-shadow:
      inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.98),
      0 10px 24px -6px rgba(154, 52, 18, 0.12) !important;
  }
  html[data-theme="white-orange"] .exam-palette-btn,
  body[data-theme="white-orange"] .exam-palette-btn {
    background: rgba(255, 255, 255, 0.85) !important;
    color: #44403c !important;
    border: 1px solid rgba(234, 88, 12, 0.24) !important;
    font-weight: 700 !important;
  }
  html[data-theme="white-orange"] .exam-palette-btn:hover {
    background: rgba(255, 237, 213, 0.95) !important;
    color: #ea580c !important;
    border-color: rgba(249, 115, 22, 0.55) !important;
  }
  html[data-theme="white-orange"] .exam-palette-btn.answered,
  html[data-theme="white-orange"] .exam-palette-btn.active,
  body[data-theme="white-orange"] .exam-palette-btn.answered {
    background: #f97316 !important;
    color: #ffffff !important;
    border-color: #ea580c !important;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35) !important;
  }
  ```

---

### Bug 2: Popup Tạo Môn Học Mới (`#modal-create-subject` & `#modal-manage-subject` — `image_e26699.jpg`) — Ấn Chọn Biểu Tượng Không Có Dấu Hiệu Đánh Dấu (Active Mark)
- **Hiện trạng (`image_e26699.jpg`)**: Khi bấm vào 1 trong 20 biểu tượng môn học, nút được bấm không đổi màu nền/viền nên người dùng không biết mình đang chọn biểu tượng nào.
- **Nguyên nhân**:
  1. Hàm `selectSubjectEmoji(mode, iconKey)` hoặc sự kiện click trên các nút icon trong `#modal-create-subject` / `#modal-manage-subject` chưa gắn class `.active` / `.selected` đồng bộ với thuộc tính `data-icon-key` / `data-emoji`.
  2. Hoặc rule CSS `.modal-box button` ở Light Mode / Dark Mode đang dùng `!important` đè mất màu nền `.active` của nút icon!
- **Giải pháp bắt buộc (Cả JS lẫn CSS)**:
  1. **Trong `js/app.js` (Hàm chọn icon trong `#modal-create-subject` và `#modal-manage-subject`)**:
     - Khi người dùng click vào bất kỳ nút icon nào trong lưới 20 icon (hoặc khi mở modal):
       ```javascript
       // Gắn sự kiện ủy quyền (delegation) hoặc trực tiếp trong selectSubjectEmoji(mode, iconVal, clickedBtn):
       const gridId = mode === 'manage' ? 'manage-subject-emoji-grid' : 'create-subject-emoji-grid';
       const modalId = mode === 'manage' ? 'modal-manage-subject' : 'modal-create-subject';
       const container = document.getElementById(gridId) || document.getElementById(modalId);
       if (container) {
         const allIconBtns = container.querySelectorAll('.emoji-preset-btn, .subject-icon-btn, [data-icon-key], [data-emoji]');
         allIconBtns.forEach((btn) => {
           const btnVal = btn.getAttribute('data-icon-key') || btn.getAttribute('data-emoji') || btn.dataset.icon || '';
           const isMatch = clickedBtn ? (btn === clickedBtn) : (btnVal === String(iconVal));
           btn.classList.toggle('active', isMatch);
           btn.classList.toggle('selected', isMatch);
           btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
         });
       }
       ```
  2. **Trong `css/style.css` (Đánh dấu `.active` / `.selected` cực kỳ nổi bật trên cả 3 theme)**:
     ```css
     /* ==========================================================================
        BUG 2: HIỆU ỨNG ĐÁNH DẤU (ACTIVE MARK) RÕ NÉT KHI CHỌN ICON MÔN HỌC MỚI
        ========================================================================== */
     #modal-create-subject .emoji-preset-btn.active,
     #modal-create-subject .emoji-preset-btn.selected,
     #modal-create-subject .subject-icon-btn.active,
     #modal-create-subject [data-icon-key].active,
     #modal-manage-subject .emoji-preset-btn.active,
     #modal-manage-subject .emoji-preset-btn.selected,
     #modal-manage-subject .subject-icon-btn.active,
     #modal-manage-subject [data-icon-key].active {
       transform: translateY(-2px) scale(1.05) !important;
       position: relative !important;
     }

     /* Mode Tím Hồng */
     :root #modal-create-subject .emoji-preset-btn.active,
     html[data-theme="purple-pink"] #modal-create-subject .emoji-preset-btn.active,
     :root #modal-create-subject [data-icon-key].active,
     html[data-theme="purple-pink"] #modal-create-subject [data-icon-key].active,
     :root #modal-manage-subject .emoji-preset-btn.active,
     html[data-theme="purple-pink"] #modal-manage-subject [data-icon-key].active {
       background: #9333ea !important;
       color: #ffffff !important;
       border: 2px solid #f472b6 !important;
       box-shadow: 0 6px 16px rgba(147, 51, 234, 0.48), inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
     }

     /* Mode Trắng Đen */
     html[data-theme="monochrome"] #modal-create-subject .emoji-preset-btn.active,
     html[data-theme="monochrome"] #modal-create-subject [data-icon-key].active,
     html[data-theme="monochrome"] #modal-manage-subject .emoji-preset-btn.active,
     html[data-theme="monochrome"] #modal-manage-subject [data-icon-key].active {
       background: #ffffff !important;
       color: #09090b !important;
       border: 2px solid #ffffff !important;
       box-shadow: 0 6px 16px rgba(255, 255, 255, 0.35) !important;
     }

     /* Mode Trắng Cam */
     html[data-theme="white-orange"] #modal-create-subject .emoji-preset-btn.active,
     html[data-theme="white-orange"] #modal-create-subject [data-icon-key].active,
     html[data-theme="white-orange"] #modal-manage-subject .emoji-preset-btn.active,
     html[data-theme="white-orange"] #modal-manage-subject [data-icon-key].active {
       background: #f97316 !important;
       color: #ffffff !important;
       border: 2px solid #ea580c !important;
       box-shadow: 0 6px 16px rgba(249, 115, 22, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
     }

     /* Đảm bảo nét vẽ SVG bên trong nút đang chọn đổi sang đúng màu tương phản */
     #modal-create-subject .active svg,
     #modal-create-subject .active svg *,
     #modal-manage-subject .active svg,
     #modal-manage-subject .active svg * {
       stroke: currentColor !important;
       color: inherit !important;
     }
     ```

---

### Bug 3: Dropdown Chọn Môn Học Ở Trang Thêm Câu Hỏi AI (`#view-import`) & Thêm Câu Hỏi LMS (`#view-import-lms` — `image_e262dd.png`) Bị Hiện Chữ Tên Icon (`"brain tuh"`) Và Icon Cuốn Sách Tĩnh
- **Hiện trạng (`image_e262dd.png`)**:
  - Trên nút bấm mở Dropdown (`#import-subject-dropdown-trigger` và `#lms-subject-dropdown-trigger`), bên trái luôn hiện cố định icon 1 cuốn sách (`#import-subject-dropdown-icon`), còn nhãn chữ bên cạnh lại ghi **`"brain tuh"`** (in thẳng tên mã icon `'brain'`, `'code'`, `'ruler'` thành chữ văn bản!).
- **Nguyên nhân chính xác trong `js/app.js`**:
  - Khi gán nhãn cho `#import-subject-dropdown-label` và `#lms-subject-dropdown-label` (và trong `selectImportSubject` / `selectLmsSubject`), code đang viết:
    `subjLabel.textContent = curSubjObj ? "${curSubjObj.icon || '📚'} ${curSubjObj.name}" : 'Chọn môn học...';`
    và `onclick="App.selectImportSubject('${s.id}', '${s.icon} ${s.name}')"`!
    Vì `s.icon` lưu tên khóa SVG (`'brain'`, `'code'`, `'math'`, `'zap'`), `.textContent` đã in thẳng chữ `"brain "` ra trước tên môn `"tuh"`, trong khi thẻ `<span id="import-subject-dropdown-icon">` bên cạnh lại không được cập nhật SVG!
- **Giải pháp triệt để trong `js/app.js` (Áp dụng cho cả 4 Dropdown Môn Học: `import`, `lms`, `bank`, `edit-card`)**:
  1. Khi khởi tạo và khi chọn môn học trong `selectImportSubject(subjectId, subjectName)`, `selectLmsSubject(subjectId, subjectName)`, `selectEditCardSubject(subjectId, subjectName)`, `selectBankSubject(subjectId, subjectName)`:
     - **Tuyệt đối KHÔNG nối `${s.icon}` vào chuỗi `subjectLabelText`**! Chỉ truyền duy nhất tên môn học sạch: `this._escapeHtml(s.name)`.
     - Nếu `subjectLabelText` truyền vào lỡ có tiền tố tên icon (`brain `, `code `, `math `, `ruler `, `flask `, `dna `, `globe `, `landmark `, `scale `, `palette `, `music `, `pulse `, `chart `, `rocket `, `zap `, `flame `, `bulb `, `target `, `trophy `, `star `, `book `, `folder `), dùng hàm làm sạch hoặc lấy trực tiếp `subjObj.name` từ danh sách môn học!
     - Cập nhật thẻ icon bên trái nút trigger (`#import-subject-dropdown-icon`, `#lms-subject-dropdown-icon`, `#bank-subject-dropdown-icon`, `#edit-card-subject-dropdown-icon`) bằng `iconEl.innerHTML = this.renderSubjectIcon(subjObj.icon)` để nó hiển thị đúng hình vẽ SVG của môn học đó (ví dụ môn `tuh` hiện đúng icon bộ não `<svg>`, chữ bên cạnh chỉ hiện đúng `"tuh"`!).

---

### Bug 4: Chế Độ Thi Thử (`#view-exam` — Cả Chế Độ Từng Câu `single` Lẫn Chế Độ Cuộn Toàn Bộ `all`) Chưa Có Hiệu Ứng Nổi Bật Cho Câu Trả Lời Đang Được Chọn
- **Hiện trạng**: Trong chế độ Thi thử (`#view-exam`), vì không hiện đáp án Đúng/Sai ngay lúc làm bài nên khi người học bấm chọn đáp án A, B, C, hoặc D, nút đáp án đó chưa có hiệu ứng đánh dấu rõ ràng để người học biết mình đã chọn phương án nào.
- **Giải pháp bắt buộc (JS + CSS)**:
  1. **Trong `js/app.js` (`renderExamQuestion` cho mode `single` và `renderExamAllQuestions` / `selectExamAllOption` cho mode `all`)**:
     - Khi người dùng bấm chọn một phương án `idx` của câu hỏi `qIdx`:
       - Lưu `session.userAnswers[qIdx] = idx;`.
       - Gắn class **`.exam-option-selected`** và **`.selected`** lên nút `.quiz-option-btn` được chọn (gỡ khỏi 3 nút còn lại của câu đó).
       - Cập nhật ngay lập tức nút số thứ tự câu hỏi tương ứng trên `#exam-palette-bar` (`.exam-palette-btn[data-qidx="${qIdx}"]`) thêm class **`.answered`** và cập nhật bộ đếm `"Đã làm: X / N"`!
  2. **Trong `css/style.css` (Làm nổi bật rõ rệt đáp án đang được chọn trong `#view-exam` ở cả 3 Theme)**:
     ```css
     /* ==========================================================================
        BUG 4: HIỆU ỨNG ĐÁNH DẤU ĐÁP ÁN ĐANG CHỌN TRONG CHẾ ĐỘ THI THỬ (#view-exam)
        ========================================================================== */
     #view-exam .quiz-option-btn.exam-option-selected,
     #view-exam .quiz-option-btn.selected,
     #view-exam .quiz-option-btn.correct {
       transform: translateX(4px) !important;
       font-weight: 700 !important;
     }

     /* 1. Mode Tím Hồng */
     :root #view-exam .quiz-option-btn.exam-option-selected,
     html[data-theme="purple-pink"] #view-exam .quiz-option-btn.exam-option-selected,
     :root #view-exam .quiz-option-btn.selected,
     html[data-theme="purple-pink"] #view-exam .quiz-option-btn.selected,
     :root #view-exam .quiz-option-btn.correct,
     html[data-theme="purple-pink"] #view-exam .quiz-option-btn.correct {
       background: rgba(147, 51, 234, 0.32) !important;
       border: 2px solid #e879f9 !important;
       box-shadow: 0 6px 20px rgba(168, 85, 247, 0.32), inset 0 1px 1.5px rgba(255, 255, 255, 0.35) !important;
       color: #ffffff !important;
     }
     :root #view-exam .quiz-option-btn.exam-option-selected .quiz-option-letter,
     html[data-theme="purple-pink"] #view-exam .quiz-option-btn.selected .quiz-option-letter,
     html[data-theme="purple-pink"] #view-exam .quiz-option-btn.correct .quiz-option-letter {
       color: #f472b6 !important;
       font-weight: 900 !important;
     }

     /* 2. Mode Trắng Đen */
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.exam-option-selected,
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.selected,
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.correct {
       background: rgba(255, 255, 255, 0.22) !important;
       border: 2px solid #ffffff !important;
       box-shadow: 0 6px 20px rgba(255, 255, 255, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
       color: #ffffff !important;
     }
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.exam-option-selected .quiz-option-letter,
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.selected .quiz-option-letter,
     html[data-theme="monochrome"] #view-exam .quiz-option-btn.correct .quiz-option-letter {
       color: #ffffff !important;
       text-decoration: underline !important;
     }

     /* 3. Mode Trắng Cam */
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.exam-option-selected,
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.selected,
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.correct {
       background: rgba(251, 146, 60, 0.24) !important;
       border: 2px solid #ea580c !important;
       box-shadow: 0 8px 20px -4px rgba(234, 88, 12, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
       color: #1c1917 !important;
     }
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.exam-option-selected .quiz-option-letter,
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.selected .quiz-option-letter,
     html[data-theme="white-orange"] #view-exam .quiz-option-btn.correct .quiz-option-letter {
       color: #ea580c !important;
       font-weight: 900 !important;
     }
     ```

---

### Bug 5: Thiết Kế Lại Chân Trạng Thái Mobile (`#mobile-bottom-nav.bottom-nav` — `image_e25afd.png`) Bo Cong Liquid Glass Giống Hệt Phong Cách `.app-sidebar` Trên Desktop & Không Bao Giờ Cắt Chữ `"Ngân h..."`
- **Giải phẫu nguyên nhân tại sao `image_e25afd.png` vẫn bị xấu và mất chữ**:
  1. Trong `css/theme.css` (từ đợt `1j`), vẫn còn rule dùng ID `#mobile-bottom-nav`:
     `html[data-theme="white-orange"] #mobile-bottom-nav .bottom-nav-item.active { background: rgba(251, 146, 60, 0.22) !important; color: #ffffff !important; }`
     Vì `#mobile-bottom-nav` là ID selector (độ ưu tiên `1, 3, 1`), nó **đè lên** rule `.bottom-nav .bottom-nav-item.active` (`0, 3, 0`) của đợt `1o`! Hậu quả là nền nút active vẫn là màu cam nhạt nhưng chữ và icon lại bị ép thành màu trắng `#ffffff`, nhìn trắng lóa không đọc được!
  2. Việc nhét 5 hộp vuông nhỏ (`--bnav-idle-bg`) vào trong thanh bar làm thanh bar bị chật, khiến chữ `"Ngân hàng"` bị cắt cụt thành `"Ngân h..."`!
- **Giải pháp: Thiết kế `#mobile-bottom-nav.bottom-nav` đồng bộ 100% với `.app-sidebar` trên Desktop**:
  - Nhìn lại `.app-sidebar` trên Desktop:
    - Toàn bộ thanh bar là **1 viên thuốc bo cong tròn trịa (`border-radius: 999px !important`) bằng kính mờ nhám Liquid Glass (`backdrop-filter: blur(28px) saturate(190%)`)** có gờ sáng `135deg`.
    - Các mục chưa chọn (`.bottom-nav-item:not(.active)`) nằm **trong suốt tự nhiên** trên mặt kính (không chia 5 ô vuông lặt vặt), với nét vẽ `stroke` đậm đà rõ nét.
    - Duy nhất mục đang chọn (`.bottom-nav-item.active`) nổi lên thành **1 viên thuốc tròn/squircle sắc nét** đồng bộ y hệt nút `.nav-item.active` trên Sidebar Desktop, và hiển thị **đầy đủ 100% chữ `"Ngân hàng"`** (bỏ `text-overflow: ellipsis` gây cắt chữ!).
  - **Đoạn CSS có độ ưu tiên tuyệt đối (`html body #mobile-bottom-nav.bottom-nav`)**:
    ```css
    /* ==========================================================================
       BUG 5: ĐỒNG BỘ CHÂN TRẠNG THÁI MOBILE (#mobile-bottom-nav) CHUẨN LIQUID GLASS
              BO CONG VIÊN THUỐC GIỐNG HỆT SIDEBAR DESKTOP & HIỂN THỊ RÕ 100%
       ========================================================================== */
    @media (max-width: 840px) and (orientation: portrait) {
      html body #mobile-bottom-nav.bottom-nav,
      html body .bottom-nav {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 2px !important;
        position: fixed !important;
        bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
        left: 12px !important;
        right: 12px !important;
        width: calc(100% - 24px) !important;
        max-width: 440px !important;
        margin: 0 auto !important;
        height: 64px !important;
        padding: 6px 8px !important;
        border-radius: 999px !important; /* Bo cong viên thuốc Liquid Glass giống hệt Sidebar Desktop */
        backdrop-filter: blur(28px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
        z-index: 1000 !important;
      }

      /* 1. Mode Tím Hồng */
      :root body #mobile-bottom-nav.bottom-nav,
      html[data-theme="dark"] body #mobile-bottom-nav.bottom-nav,
      html[data-theme="purple-pink"] body #mobile-bottom-nav.bottom-nav {
        background: linear-gradient(145deg, rgba(36, 24, 64, 0.86) 0%, rgba(20, 14, 38, 0.80) 100%) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.38) !important;
        border-left: 1px solid rgba(233, 213, 255, 0.26) !important;
        border-right: 1px solid rgba(233, 213, 255, 0.10) !important;
        border-bottom: 1px solid rgba(216, 180, 254, 0.20) !important;
        box-shadow:
          inset 1px 1.5px 2px rgba(255, 255, 255, 0.35),
          0 16px 36px rgba(4, 2, 12, 0.65) !important;
      }

      /* 2. Mode Trắng Đen */
      html[data-theme="monochrome"] body #mobile-bottom-nav.bottom-nav {
        background: linear-gradient(145deg, rgba(36, 36, 42, 0.88) 0%, rgba(18, 18, 22, 0.82) 100%) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.42) !important;
        border-left: 1px solid rgba(255, 255, 255, 0.28) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.10) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.18) !important;
        box-shadow:
          inset 1px 1.5px 2px rgba(255, 255, 255, 0.42),
          0 16px 36px rgba(0, 0, 0, 0.75) !important;
      }

      /* 3. Mode Trắng Cam */
      html[data-theme="white-orange"] body #mobile-bottom-nav.bottom-nav {
        background: linear-gradient(145deg, rgba(255, 252, 248, 0.86) 0%, rgba(255, 240, 226, 0.78) 100%) !important;
        border-top: 1.5px solid rgba(255, 255, 255, 0.96) !important;
        border-left: 1.5px solid rgba(255, 255, 255, 0.82) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.38) !important;
        border-bottom: 1px solid rgba(251, 146, 60, 0.32) !important;
        box-shadow:
          inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.98),
          0 14px 34px -4px rgba(154, 52, 18, 0.20) !important;
      }

      /* Các mục bên trong thanh Bottom Nav: Phẳng gọn trong suốt khi chưa chọn, không cắt chữ */
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item {
        flex: 1 1 0% !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 50px !important;
        min-height: 48px !important;
        padding: 4px 2px !important;
        border-radius: 999px !important;
        background: transparent !important;
        border: 1px solid transparent !important;
        box-shadow: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        transform: none !important;
      }

      /* Chữ dưới icon hiển thị ĐẦY ĐỦ 100% ("Ngân hàng"), tuyệt đối không bị cắt "..." */
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item span {
        font-size: 0.65rem !important;
        font-weight: 600 !important;
        line-height: 1.1 !important;
        letter-spacing: -0.02em !important;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        width: auto !important;
        color: inherit !important;
      }

      /* Màu chữ & icon khi CHƯA CHỌN */
      :root body #mobile-bottom-nav.bottom-nav .bottom-nav-item,
      html[data-theme="dark"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item,
      html[data-theme="purple-pink"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item {
        color: #d8b4fe !important;
      }
      html[data-theme="monochrome"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item {
        color: #a1a1aa !important;
      }
      html[data-theme="white-orange"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item {
        color: #44403c !important;
      }

      /* Mục ĐANG CHỌN (.active): Giống hệt nút Active trên Sidebar Desktop — Rõ nét 100%! */
      :root body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active,
      html[data-theme="dark"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active,
      html[data-theme="purple-pink"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active {
        background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.35) !important;
        box-shadow: 0 4px 14px rgba(147, 51, 234, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
      }

      html[data-theme="monochrome"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active {
        background: #ffffff !important;
        color: #09090b !important;
        border: 1px solid #ffffff !important;
        box-shadow: 0 4px 14px rgba(255, 255, 255, 0.30) !important;
      }

      html[data-theme="white-orange"] body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.55) !important;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
      }

      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item svg,
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item svg * {
        width: 20px !important;
        height: 20px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
        background: transparent !important;
      }

      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active svg,
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active svg *,
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active span {
        color: inherit !important;
        stroke: currentColor !important;
        font-weight: 700 !important;
      }
      html body #mobile-bottom-nav.bottom-nav .bottom-nav-item.active span {
        stroke: none !important;
      }
    }
    ```

---

### Bug 6: Xóa Bỏ Hoàn Toàn Hiện Tượng Lag Khi Chuyển Theme Trên Mobile (& Desktop)
- **Nguyên nhân gốc rễ gây lag khi đổi Theme trên Mobile**:
  - Khi bấm đổi Theme, toàn bộ 30–50 thẻ trên trang đang gắn `transition: background 0.26s, backdrop-filter 0.26s, box-shadow 0.26s, border-color 0.26s`. Trình duyệt trên điện thoại phải tính toán nội suy (interpolate) lại 30 lớp `box-shadow` đa tầng và `backdrop-filter` trong suốt 260ms, cộng thêm lớp phủ `#theme-wave-transition-overlay` phóng to toàn màn hình khiến GPU Mobile bị nghẽn khung hình!
- **Giải pháp triệt để (Đổi Theme Tức Thì `0ms` Không Rớt 1 Frame Nào)**:
  1. **Trong `css/style.css`**:
     ```css
     /* Tạm khóa mọi transition nặng trong đúng 1 frame khi chuyển đổi hệ màu Theme */
     html.theme-switching,
     html.theme-switching *,
     html.theme-switching *::before,
     html.theme-switching *::after {
       transition: none !important;
       animation-duration: 0.01ms !important;
     }
     ```
  2. **Trong `js/app.js` (Hàm `setTheme(themeName, options)`)**:
     - Trước khi đổi thuộc tính `data-theme`:
       ```javascript
       document.documentElement.classList.add('theme-switching');
       // ... thực hiện đổi data-theme trên html và body ...
       requestAnimationFrame(() => {
         requestAnimationFrame(() => {
           document.documentElement.classList.remove('theme-switching');
         });
       });
       ```
     - Trên thiết bị Mobile (`window.innerWidth <= 840`), tắt hoàn toàn việc tạo/chạy `#theme-wave-transition-overlay` để việc bấm chuyển đổi giữa 3 theme diễn ra **tức thì, nhẹ bẫng 120Hz**!

---

### Bug 7: Vẽ Lại Sóng Chuyển Theme Trong `#view-settings` Theo Đúng Quy Luật Vật Lý "Sóng Ánh Sáng Quang Học (Optical Light Wave Packet & Chromatic Dispersion)" — Trượt Siêu Mượt
- **Nguyên lý Sóng Ánh Sáng Quang Học (Optical Light Wave Physics)**:
  - Khác với sóng dây cơ học cao đều từ trái sang phải, một **Bó Sóng Ánh Sáng (Gaussian Optical Wave Packet)** có:
    1. **Đường bao năng lượng Gaussian $E(x) = \exp\left(-\frac{(x - x_0)^2}{2\sigma^2}\right)$ hội tụ ngay tại vị trí con trượt $x_0$**: Kéo con trượt đến đâu, **tâm hội tụ ánh sáng (Focal Light Crest)** lướt mượt theo ngón tay đến đó — tại tâm con trượt, biên độ giao thoa ánh sáng đạt cực đại rực rỡ nhất và thuôn dần thanh mảnh về hai đầu giống như phổ giao thoa laser!
    2. **Tán sắc 3 bước sóng ánh sáng ($\lambda_1, \lambda_2, \lambda_3$ — 3 tia sáng lệch pha $120^\circ$ đan quyện vào nhau)**: Tạo thành các nút giao thoa (nodes) và bụng sóng ánh sáng (antinodes) cực kỳ nghệ thuật, hiện đại và mượt mà!
- **Mã thực thi siêu mượt (60–144 FPS qua `requestAnimationFrame`) cho `_updateEnergyWaveVisuals(val)` trong `js/app.js`**:
  ```javascript
  _updateEnergyWaveVisuals(val) {
    const pct = Math.max(0, Math.min(100, parseFloat(val) || 0));
    const t = pct / 100; // 0.0 -> 1.0

    const mainPath = document.getElementById('energy-wave-main-path');
    const harmPath = document.getElementById('energy-wave-harmonic-path');
    const bgPath = document.getElementById('energy-wave-bg-path');

    if (mainPath && harmPath && bgPath) {
      const width = 900;
      const baseY = 88; // Nằm gọn ở nửa dưới buồng kính, tách biệt hoàn toàn với chữ ở trên
      const focalX = 60 + t * (width - 120); // Tâm hội tụ bó sóng ánh sáng đi theo đúng tay kéo!
      const sigma = 210; // Độ rộng đường bao Gaussian của bó sóng ánh sáng
      const k = 0.028 + t * 0.014; // Số sóng (bước sóng ánh sáng ngắn dần khi năng lượng tăng)
      const phase = t * Math.PI * 6; // Pha dịch chuyển mượt như tia sáng trượt
      const maxAmp = 28;
      const steps = 48;

      let dRay1 = '';
      let dRay2 = '';
      let dCaustic = '';

      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const x = ratio * width;
        const dx = x - focalX;
        // Đường bao Gaussian của Bó sóng ánh sáng (cao nhất tại vị trí con trượt focalX, thuôn mượt về 2 bên)
        const envelope = 0.22 + 0.78 * Math.exp(-(dx * dx) / (2 * sigma * sigma));

        // Tia sáng chính (Chromatic Ray 1)
        const y1 = baseY - Math.sin(x * k - phase) * (maxAmp * envelope);
        // Tia sáng tán sắc bậc 2 (Chromatic Ray 2 lệch pha 120 độ)
        const y2 = baseY - Math.sin(x * k * 1.18 - phase + 2.094) * (maxAmp * 0.68 * envelope);
        // Quầng tán xạ ánh sáng nền (Optical Caustic Envelope)
        const yBg = baseY - Math.abs(Math.cos(x * k * 0.5 - phase * 0.5)) * (maxAmp * 0.85 * envelope);

        const cmd = i === 0 ? 'M' : 'L';
        dRay1 += `${cmd} ${x.toFixed(1)} ${y1.toFixed(1)} `;
        dRay2 += `${cmd} ${x.toFixed(1)} ${y2.toFixed(1)} `;
        dCaustic += `${cmd} ${x.toFixed(1)} ${yBg.toFixed(1)} `;
      }
      dCaustic += `L ${width} 136 L 0 136 Z`;

      mainPath.setAttribute('d', dRay1.trim());
      harmPath.setAttribute('d', dRay2.trim());
      bgPath.setAttribute('d', dCaustic.trim());
      harmPath.removeAttribute('stroke-dasharray'); // Để tia sáng thứ 2 liền mạch mượt mà như dải lụa quang học
    }

    // Nội suy màu quang phổ ánh sáng liên tục & cập nhật HUD
    const stop1 = document.getElementById('ew-stop-1');
    const stop2 = document.getElementById('ew-stop-2');
    const stop3 = document.getElementById('ew-stop-3');
    const areaTop = document.getElementById('ew-area-top');
    const badgeEl = document.getElementById('energy-wave-mode-badge');
    const titleEl = document.getElementById('energy-wave-mode-title');

    if (pct < 33.5) {
      if (stop1) stop1.setAttribute('stop-color', '#8b5cf6');
      if (stop2) stop2.setAttribute('stop-color', '#ec4899');
      if (stop3) stop3.setAttribute('stop-color', '#f472b6');
      if (areaTop) areaTop.setAttribute('stop-color', '#d946ef');
      if (badgeEl) badgeEl.textContent = `LIGHT SPECTRUM // 420nm (${Math.round(pct)}%)`;
      if (titleEl) titleEl.textContent = 'Tím Hồng (Ultraviolet Rose Wave)';
    } else if (pct <= 66.5) {
      if (stop1) stop1.setAttribute('stop-color', '#71717a');
      if (stop2) stop2.setAttribute('stop-color', '#ffffff');
      if (stop3) stop3.setAttribute('stop-color', '#a1a1aa');
      if (areaTop) areaTop.setAttribute('stop-color', '#ffffff');
      if (badgeEl) badgeEl.textContent = `LIGHT SPECTRUM // 550nm (${Math.round(pct)}%)`;
      if (titleEl) titleEl.textContent = 'Trắng Đen (Monochrome Laser Wave)';
    } else {
      if (stop1) stop1.setAttribute('stop-color', '#f59e0b');
      if (stop2) stop2.setAttribute('stop-color', '#f97316');
      if (stop3) stop3.setAttribute('stop-color', '#ea580c');
      if (areaTop) areaTop.setAttribute('stop-color', '#fb923c');
      if (badgeEl) badgeEl.textContent = `LIGHT SPECTRUM // 620nm (${Math.round(pct)}%)`;
      if (titleEl) titleEl.textContent = 'Trắng Cam (Solar Amber Wave)';
    }

    const activeZone = pct < 33.5 ? 'purple-pink' : (pct <= 66.5 ? 'monochrome' : 'white-orange');
    document.querySelectorAll('.energy-node-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-opt') === activeZone);
    });
  }
  ```

---

## PHẦN 2: 6 HẠNG MỤC TỐI ƯU HÓA TỔNG THỂ ĐỂ ĐẠT FPS CAO NHẤT (120–144+ FPS)

### Hạng mục 8 (Tối ưu 1): Triệt Tiêu GPU Blur Overdraw & Khóa Hover Khi Cuộn
1. **Gỡ bỏ Nested `backdrop-filter` trên 4 ô `.stat-card` bên trong `.hero-card`**:
   - Vì `.hero-card` phía sau đã có `backdrop-filter: blur(28px)`, 4 ô `.stat-card` nằm bên trong nó không cần chạy thêm `backdrop-filter: blur(16px)` nữa (giữ nguyên `background`, viền `135deg`, và `box-shadow` của `.stat-card` — nhìn giống hệt 100% nhưng giảm 4 lượt chép Framebuffer GPU!).
2. **Tối ưu bán kính Blur của các thẻ danh sách (`blur(12px) saturate(165%)`) và khóa `:hover` khi đang cuộn (`body.is-scrolling`)**:
   ```css
   .hero-card .stat-card,
   #view-dashboard .stats-grid > div,
   #view-dashboard .stat-card {
     backdrop-filter: none !important;
     -webkit-backdrop-filter: none !important;
   }

   #view-dashboard .study-mode-card,
   #dashboard-decks-grid .deck-card,
   #view-decks .deck-card,
   .subject-group .decks-grid .deck-card,
   .deck-card,
   .study-mode-card {
     backdrop-filter: blur(12px) saturate(165%) !important;
     -webkit-backdrop-filter: blur(12px) saturate(165%) !important;
     contain: layout paint style !important;
   }

   .glass-card::after,
   .card-base::after {
     animation: none !important;
     display: none !important;
     content: none !important;
   }

   body.is-scrolling .deck-card,
   body.is-scrolling .study-mode-card,
   body.is-scrolling .bank-card-item,
   body.is-scrolling .stat-card {
     pointer-events: none !important;
     transition: none !important;
   }
   ```

---

### Hạng mục 9 (Tối ưu 2): Bộ Nhớ Đệm Phiên Bản Dữ Liệu (`Data Revision Cache`) — Chuyển Tab Tức Thì Trong `0.2ms` (`js/db.js` & `js/app.js`)
- Thêm biến đếm phiên bản dữ liệu `db.revision = 1` trong `js/db.js`. Tăng `this.revision++` mỗi khi có thao tác ghi/sửa/xóa dữ liệu (`saveDeck`, `deleteDeck`, `saveCard`, `saveCardsBatch`, `deleteCard`, `updateCardSRS`, `resetDeckProgress`, `saveSubject`, `deleteSubject`, `reassignDecksSubject`, `logStudySession`, `importBackupData`).
- Trong `js/app.js`, lưu `this._renderedViewRevision = { dashboard: 0, decks: 0, bank: 0, stats: 0 }`: nếu khi `navigateTo(viewName)` mà `this._renderedViewRevision[viewName] === db.revision` và container đã có DOM, bật thẳng `.view-section.active` trong `0.2ms` mà không query lại IndexedDB hay dựng lại DOM!

---

### Hạng mục 10 (Tối ưu 3): Bộ Nhớ Đệm KaTeX LRU (`_katexCache`) & Ảo Hóa Danh Sách Lớn (`content-visibility: auto`)
1. **Cache kết quả biên dịch LaTeX trong `js/app.js`**:
   - Tạo `this._katexCache = new Map()` (tối đa `2500` mục). Trong `renderLatexText(text)` và `renderMath(container)`, lưu và tái sử dụng chuỗi HTML đầu ra của `katex.renderToString(expr, opts)` để không bao giờ phải parse lại cùng một công thức toán học.
2. **Ảo hóa CSS (`content-visibility: auto`) cho Ngân hàng câu hỏi (`#view-bank`) và Thi thử toàn bộ (`#view-exam`)**:
   ```css
   #bank-cards-list .bank-card-item,
   #exam-all-questions-list .exam-lms-item {
     content-visibility: auto !important;
     contain-intrinsic-size: auto 190px !important;
     contain: layout style paint !important;
   }
   ```

---

### Hạng mục 11 (Tối ưu 4): Khóa Nhịp `requestAnimationFrame` Cho Sóng Ánh Sáng (`onThemeEnergySliderInput`)
- Bọc lệnh gọi `this._updateEnergyWaveVisuals(this._pendingWaveVal)` bên trong `requestAnimationFrame` trong hàm `onThemeEnergySliderInput(rawVal)` để dù chuột có tần số 1000Hz thì SVG chỉ tính toán đúng 1 lần mỗi khung hình màn hình!

---

### Hạng mục 12 (Tối ưu 5): Giải Phóng Bộ Nhớ Web Audio Trong `js/lofi-music.js`
- Gắn `osc.onended = () => { try { osc.disconnect(); gainNode.disconnect(); } catch (_) {} };` cho mọi node âm thanh tạo động trong `js/lofi-music.js`.

---

### Hạng mục 13 (Tối ưu 6): Dọn Dẹp Các Rule CSS Xung Đột Cũ Cuối `css/theme.css` & `css/style.css`
- Xóa các rule `#mobile-bottom-nav` cũ ở đợt `1j` đang gây lỗi chữ trắng trên nền cam nhạt, và gộp gọn các rule trùng lặp ở cuối `css/theme.css` / `css/style.css` mà vẫn giữ nguyên 100% các chuỗi selector phục vụ `445/445` bài kiểm thử trong `tests/`.

---

## PHẦN 3: CẬP NHẬT `ARCHITECTURE_GRAPH.md` & CHECKLIST NGHIỆM THU (13 ĐIỂM)

- [ ] **1 (Bug 1).** Thanh câu hỏi trên cùng ở chế độ Thi thử (`#exam-palette-bar`) đã đồng bộ chuẩn Liquid Glass ở cả Mode Trắng Đen và Mode Trắng Cam (không còn màu tím).
- [ ] **2 (Bug 2).** Trong Popup Tạo/Sửa Môn Học (`#modal-create-subject`, `#modal-manage-subject`), bấm chọn icon nào là nút icon đó nổi bật rõ rệt (nền cam `#f97316` / trắng `#ffffff` / tím `#9333ea` + viền sáng).
- [ ] **3 (Bug 3).** Dropdown chọn môn học ở trang Thêm câu hỏi AI (`#view-import`) và Thêm câu hỏi LMS (`#view-import-lms`) hiển thị đúng hình vẽ SVG của môn học và chỉ hiện tên môn (`"tuh"`, `"csdl"`), xóa sạch lỗi in chữ tên icon (`"brain tuh"`).
- [ ] **4 (Bug 4).** Trong chế độ Thi thử (`#view-exam`), bấm chọn đáp án nào thì đáp án đó sáng viền + đổi màu nền (`.exam-option-selected`) rõ ràng trên cả 3 theme, đồng thời nút số câu hỏi trên thanh palette đổi sang màu đã làm (`.answered`).
- [ ] **5 (Bug 5).** Chân trạng thái Mobile (`#mobile-bottom-nav.bottom-nav`) bo cong viên thuốc Liquid Glass đồng bộ với `.app-sidebar` trên Desktop, nút đang chọn nổi bật sắc nét và hiển thị trọn vẹn chữ `"Ngân hàng"` (không bị cắt `"Ngân h..."` hay trắng lóa).
- [ ] **6 (Bug 6).** Chuyển đổi qua lại giữa 3 Theme trên Mobile (và Desktop) mượt tức thì `0ms` nhờ cơ chế `html.theme-switching` tạm ngắt transition nặng.
- [ ] **7 (Bug 7).** Sóng chuyển theme trong `#view-settings` được vẽ theo đúng quy luật **Sóng Ánh Sáng Quang Học (Gaussian Light Wave Packet + 2 tia tán sắc lệch pha)**, tâm bó sóng lướt mượt theo ngón tay.
- [ ] **8–13 (Tối ưu 1–6).** Hoàn tất gỡ Nested Blur trên `.stat-card`, thêm `db.revision` cache chuyển tab `0.2ms`, thêm `_katexCache` LRU, bật `content-visibility: auto`, bọc `requestAnimationFrame` cho sóng ánh sáng, giải phóng node Web Audio, cập nhật `ARCHITECTURE_GRAPH.md`, và vượt qua 100% `npm test` (445/445) & `npm run build`.