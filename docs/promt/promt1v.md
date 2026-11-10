# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1V (BẢN HỢP NHẤT HOÀN CHỈNH: 6 TINH CHỈNH GIAO DIỆN LIQUID GLASS & LAYOUT TOÀN MÀN HÌNH + 7 ĐỘT PHÁ TỐI ƯU HÓA THUẬT TOÁN "MAX PING" 120FPS) (`promt1v.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1v` (Bản Hợp Nhất Hoàn Chỉnh: Giải quyết triệt để **6 yêu cầu tinh chỉnh UI/UX mới nhất** từ 5 ảnh chụp màn hình `image_76c862.jpg`, `image_76c59c.jpg`, `image_76c4a9.png`, `image_76c181.png`, `image_76bd9a.png` **KẾT HỢP** **7 trụ cột tối ưu hóa thuật toán & hiệu năng "Max Ping" cuối cùng**).
> * **Mục tiêu cốt lõi:**
>   1. **Phần A (6 Tinh chỉnh UI/UX Bắt Buộc Trước Khi Tối Ưu):** Khôi phục diện tích hiển thị rộng thoáng tối đa như bản gốc (`image_76c862.jpg`); xóa nút `Câu trước` bị thừa ở trên câu hỏi Quiz (`image_76c4a9.png`); tái thiết kế nút `Câu trước` / `Câu tiếp` ở cả Quiz và Flashcard (`image_76c181.png`) theo đúng chuẩn Liquid Glass của Sidebar & Popup; đồng bộ toàn bộ hệ thống linh kiện sang chung 1 chuẩn Liquid Glass; làm lại khung Buồng Sóng & Thanh Trượt không còn lem/nham nhở hay chữ `LIGHT SPECTRUM` giả tạo (`image_76bd9a.png`); và gán **Background 2 (`./backgrounds/bg-2.webp`)** làm hình nền mặc định cho người dùng mới (cache trắng, theme Tím mặc định).
>   2. **Phần B (7 Đột Phá Thuật Toán "Max Ping" 120FPS):** Tối ưu hóa $O(1)$ In-Memory Revision Cache cho IndexedDB, $O(N)$ Single-Pass Aggregation, Fast-Path KaTeX Memoization, Pre-computed Search Index `_searchBlob`, và `Float32Array` Wave Lookup Table.

---

## PHẦN A: 6 HẠNG MỤC TINH CHỈNH GIAO DIỆN & TRẢI NGHIỆM (THỰC HIỆN TRƯỚC TIÊN)

### A1. Khôi Phục Diện Tích Hiển Thị Rộng Thoáng Tối Đa Như Bản Chuẩn Trước Kia (`image_76c862.jpg` vs `image_76c59c.jpg`)

#### 🔍 Giải phẫu nguyên nhân từ 2 ảnh đối chiếu (`image_76c862.jpg` là bản chuẩn trước kia vs `image_76c59c.jpg` là bản hiện tại):
- Nhìn vào `image_76c862.jpg` (bản chuẩn trước kia):
  - Khi Sidebar thu gọn (`72px`), khung `.hero-card` và toàn bộ các ô thống kê, bộ thẻ trải rộng hết chiều ngang vùng màn hình chính: mép trái của `.hero-card` nằm cách Sidebar chỉ `~18px`, và mép phải của `.hero-card` thẳng hàng sát với mép phải của cụm HUD `🔥 4 ngày` ở góc trên phải!
- Nhìn vào `image_76c59c.jpg` (bản hiện tại):
  - Do `.content-wrapper` bị giới hạn `max-width: 1240px !important; padding: 24px 32px !important;` (và các media query giới hạn `max-width` hẹp), hai bên trái/phải của `.hero-card` bị thừa ra 2 khoảng trống đen khổng lồ (`~110px` mỗi bên), làm diện tích hiển thị bị bó hẹp lại đáng kể!

#### 🛠️ Giải pháp bắt buộc trong `css/style.css` và `css/theme.css`:
- Mở rộng `.content-wrapper` trên Desktop chiếm **toàn bộ chiều rộng khả dụng của `.app-main` (`max-width: 100% !important; width: 100% !important;`)** với khoảng đệm lề gọn gàng (`padding: 18px 22px 60px 18px !important`), khớp 100% với tỷ lệ hiển thị rộng thoáng của `image_76c862.jpg`:
  ```css
  /* ==========================================================================
     A1. KHÔI PHỤC DIỆN TÍCH HIỂN THỊ RỘNG THOÁNG TỐI ĐA NHƯ BẢN GỐC (image_76c862.jpg)
     ========================================================================== */
  @media (min-width: 841px) and (min-height: 551px) {
    html body .app-container {
      display: block !important;
      width: 100% !important;
      min-height: 100dvh !important;
    }

    /* Sidebar cố định bên trái */
    html body #app-sidebar.app-sidebar {
      position: fixed !important;
      top: 14px !important;
      left: 14px !important;
      bottom: 14px !important;
      height: calc(100dvh - 28px) !important;
      max-height: calc(100dvh - 28px) !important;
      width: 244px !important;
      min-width: 244px !important;
      z-index: 200 !important;
    }

    html body #app-sidebar.app-sidebar.collapsed {
      position: fixed !important;
      top: 14px !important;
      left: 14px !important;
      bottom: 14px !important;
      height: calc(100dvh - 28px) !important;
      max-height: calc(100dvh - 28px) !important;
      width: 68px !important;
      min-width: 68px !important;
      padding: 20px 10px !important;
      border-radius: 999px !important;
      z-index: 200 !important;
    }

    /* .app-main bám sát ngay cạnh Sidebar (14px left + 244px width + 6px gap = 264px) */
    html body:not(.focus-mode-active) .app-main:not(.sidebar-collapsed) {
      margin-left: 264px !important;
      margin-right: 0 !important;
      width: calc(100% - 264px) !important;
      max-width: calc(100% - 264px) !important;
    }

    /* Khi Sidebar thu gọn: 14px left + 68px width + 6px gap = 88px */
    html body:not(.focus-mode-active) .app-main.sidebar-collapsed {
      margin-left: 88px !important;
      margin-right: 0 !important;
      width: calc(100% - 88px) !important;
      max-width: calc(100% - 88px) !important;
    }

    /* Mở rộng tối đa diện tích hiển thị của .content-wrapper và các view chính như image_76c862.jpg */
    html body .app-main > .content-wrapper,
    html body .content-wrapper {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 16px 22px 56px 14px !important;
      box-sizing: border-box !important;
    }

    html body #view-dashboard,
    html body #view-decks,
    html body #view-bank > div,
    html body #view-stats > div,
    html body #view-import > div,
    html body #view-import-lms > div {
      max-width: 100% !important;
      width: 100% !important;
    }
  }
  ```

---

### A2, A3 & A4. Xóa Nút `Câu trước` Bị Thừa Ở Trên Câu Hỏi Quiz (`image_76c4a9.png`), Thiết Kế Lại Nút `Câu trước` / `Câu tiếp` Ở Quiz & Flashcard (`image_76c181.png`) Và Đồng Bộ Toàn Bộ Linh Kiện Sang Chuẩn Liquid Glass Của Sidebar & Popup

#### 🔍 Giải phẫu nguyên nhân từ `image_76c4a9.png` và `image_76c181.png`:
1. **Trong Chế độ Ôn tập Quiz (`image_76c4a9.png`)**:
   - Đang có **tận 2 nút quay về câu trước** xuất hiện cùng lúc: một nút `< Câu trước` (`#btn-quiz-card-prev`) nằm ngay dưới badge `Chương 1...`, và một nút `← Câu trước` (`#btn-quiz-prev`) nằm ở dưới đáy thẻ!
   - **Cách xử lý**: **XÓA BỎ HOÀN TOÀN nút `#btn-quiz-card-prev` ở phía trên câu hỏi** (trong `.card-actions-toolbar` của `#study-quiz-area`)! Chỉ giữ lại **DUY NHẤT 1 nút `#btn-quiz-prev` (`← Câu trước`) ở dưới chân thẻ (`.quiz-footer-actions`)** (và đảm bảo khi `session.currentIndex > 0`, `.quiz-footer-actions` luôn hiển thị để người dùng bấm lùi câu được ngay cả khi chưa chọn đáp án câu hiện tại!).
2. **Trong Chế độ Lật thẻ Flashcard (`image_76c181.png`) & Đồng bộ Liquid Glass toàn App**:
   - Nhìn vào `image_76c181.png`: Hai nút `< Câu trước` và `Câu tiếp >` ở trên thẻ Flashcard hiện chỉ là 2 cái khung đen viền xám mỏng phẳng lì, góc bo vuông 8px, hoàn toàn **chưa có chất liệu kính nhám xuyên thấu (Frosted Liquid Glass), chưa có gờ vát ánh sáng `135deg`, và chưa bo tròn viên thuốc `999px`** như Sidebar và Popup!
   - Người dùng yêu cầu rõ: **"hiện tại, các popup, hay sidebar đều mang vibe liquid glass khá ổn, nếu yêu cầu cái gì cần vibe đó, hãy nhìn vào đó mà học tập, sync hết đi, cho đồng bộ, đừng bị mỗi cái 1 nơi"**.

#### 🛠️ Giải pháp: Thiết lập Hệ Thống Class & Biến Chuẩn "Unified Liquid Glass Control (`--lg-ctrl-*`)" Kế Thừa Trực Tiếp Từ Sidebar & Popup:

1. **Trong `index.html` và `js/app.js`**:
   - **Xóa bỏ phần tử `#btn-quiz-card-prev`** khỏi `.card-actions-toolbar` trong `#study-quiz-area` (trả `.card-actions-toolbar` của Quiz về chỉ chứa 4 nút công cụ `[☆] [⚑] [✏️] [🎯]` nằm gọn bên phải).
   - Trong `renderActiveStudyCard()` và `_renderQuizContent(card)` (`js/app.js`):
     - Khi `session.currentIndex > 0`, luôn bật `.quiz-footer-actions` (`footerActions.classList.add('show'); footerActions.style.removeProperty('display');`) và hiển thị `#btn-quiz-prev` (`← Câu trước`) ở bên trái, còn `#btn-quiz-next` (`Câu tiếp theo →`) ở bên phải chỉ hiện khi `isAnswered === true`!
     - Nhờ đó, trong Quiz **chỉ có đúng 1 nút `← Câu trước` duy nhất** nằm ở dưới chân thẻ, luôn sẵn sàng để bấm ở mọi câu từ câu số 2 trở đi!
   - Trong `#study-flashcard-area` (`index.html`), cập nhật 2 nút `#btn-flashcard-prev` và `#btn-flashcard-next` dùng class `.lg-pill-btn`:
     ```html
     <div class="card-actions-toolbar flashcard-actions-toolbar">
       <div class="card-nav-actions-group">
         <button id="btn-flashcard-prev" type="button" class="lg-pill-btn" title="Quay lại thẻ trước (Phím ←)" onclick="event.stopPropagation(); App.prevStudyQuestion(event)" style="display: none;">
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           <span>Câu trước</span>
         </button>
         <button id="btn-flashcard-next" type="button" class="lg-pill-btn" title="Sang thẻ tiếp theo (Phím →)" onclick="event.stopPropagation(); App.nextFlashcardReview(event)" style="display: none;">
           <span>Câu tiếp</span>
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
         </button>
       </div>
       <div class="card-utility-actions-group">
         <button id="btn-flashcard-bookmark" type="button" class="btn-card-action" title="Lưu thẻ quan trọng (⭐)" onclick="event.stopPropagation(); App.toggleCurrentCardBookmark()">☆</button>
         <button id="btn-flashcard-flag" type="button" class="btn-card-action" title="Đánh dấu câu hỏi diễn đạt chưa rõ (🚩)" onclick="event.stopPropagation(); App.toggleCurrentCardFlag()">⚑</button>
         <button id="btn-flashcard-edit" type="button" class="btn-card-action" title="Sửa nhanh nội dung câu hỏi (✏️)" onclick="event.stopPropagation(); App.openEditCurrentCardModal()">✏️</button>
       </div>
     </div>
     ```

2. **Trong `css/theme.css` và `css/style.css` — Đồng bộ 100% chất liệu Kính Nhám Xuyên Thấu `135deg` của Sidebar & Popup sang toàn bộ các nút điều khiển (`.lg-pill-btn`, `#btn-quiz-prev`, `#btn-flashcard-prev`, `#btn-flashcard-next`, `.btn-card-action`, `.quiz-header-bar .btn-secondary`, `.blind-toggle-pill`, `#btn-focus-exit`)**:
   ```css
   /* ==========================================================================
      A2, A3 & A4. HỆ THỐNG LINH KIỆN LIQUID GLASS ĐỒNG BỘ 100% VỚI SIDEBAR & POPUP
      ========================================================================== */

   /* Ẩn vĩnh viễn nút #btn-quiz-card-prev bị thừa ở phía trên câu hỏi Quiz */
   html body #btn-quiz-card-prev {
     display: none !important;
   }

   /* Kế thừa trực tiếp công thức kính nhám xuyên thấu 135deg từ Sidebar & Popup cho cả 3 Theme */
   :root,
   html[data-theme="violet"],
   html[data-theme="purple"] {
     --lg-ctrl-bg: linear-gradient(135deg, rgba(64, 44, 104, 0.52) 0%, rgba(36, 22, 64, 0.42) 100%);
     --lg-ctrl-hover-bg: linear-gradient(135deg, rgba(82, 56, 132, 0.66) 0%, rgba(48, 30, 84, 0.54) 100%);
     --lg-ctrl-border-top: rgba(255, 255, 255, 0.42);
     --lg-ctrl-border-left: rgba(233, 213, 255, 0.34);
     --lg-ctrl-border-right: rgba(168, 85, 247, 0.18);
     --lg-ctrl-border-bottom: rgba(168, 85, 247, 0.24);
     --lg-ctrl-bevel:
       inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.38),
       inset -1px -1px 2px rgba(168, 85, 247, 0.20),
       0 6px 18px rgba(10, 5, 24, 0.32);
     --lg-ctrl-text: #f3e8ff;
   }

   html[data-theme="bw"],
   html[data-theme="monochrome"] {
     --lg-ctrl-bg: linear-gradient(135deg, rgba(52, 52, 60, 0.54) 0%, rgba(28, 28, 34, 0.42) 100%);
     --lg-ctrl-hover-bg: linear-gradient(135deg, rgba(72, 72, 82, 0.68) 0%, rgba(38, 38, 46, 0.56) 100%);
     --lg-ctrl-border-top: rgba(255, 255, 255, 0.46);
     --lg-ctrl-border-left: rgba(255, 255, 255, 0.34);
     --lg-ctrl-border-right: rgba(255, 255, 255, 0.14);
     --lg-ctrl-border-bottom: rgba(255, 255, 255, 0.20);
     --lg-ctrl-bevel:
       inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.42),
       inset -1px -1px 2px rgba(255, 255, 255, 0.12),
       0 6px 18px rgba(0, 0, 0, 0.38);
     --lg-ctrl-text: #fafafa;
   }

   html[data-theme="orange"],
   html[data-theme="white-orange"] {
     --lg-ctrl-bg: linear-gradient(135deg, rgba(255, 253, 250, 0.62) 0%, rgba(255, 243, 230, 0.46) 100%);
     --lg-ctrl-hover-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 237, 213, 0.68) 100%);
     --lg-ctrl-border-top: rgba(255, 255, 255, 0.95);
     --lg-ctrl-border-left: rgba(255, 255, 255, 0.88);
     --lg-ctrl-border-right: rgba(249, 115, 22, 0.22);
     --lg-ctrl-border-bottom: rgba(249, 115, 22, 0.28);
     --lg-ctrl-bevel:
       inset 1.5px 1.5px 2.5px rgba(255, 255, 255, 0.92),
       inset -1px -1px 2px rgba(249, 115, 22, 0.14),
       0 6px 16px rgba(154, 52, 18, 0.10);
     --lg-ctrl-text: #271206;
   }

   /* Áp dụng chuẩn Viên Thuốc Kính Nhám Xuyên Thấu (Liquid Glass Pill) cho:
      - Nút Câu trước (#btn-quiz-prev) ở chân thẻ Quiz
      - Nút Câu trước & Câu tiếp (#btn-flashcard-prev, #btn-flashcard-next) ở Flashcard
      - Nút Thoát & Đoán trước trên .quiz-header-bar
      - Nút Thoát tập trung (#btn-focus-exit) */
   html body #view-study #btn-quiz-prev,
   html body #view-study #btn-flashcard-prev,
   html body #view-study #btn-flashcard-next,
   html body #view-study .lg-pill-btn,
   html body #view-study .quiz-header-bar > .btn-secondary,
   html body #view-study .blind-toggle-pill,
   html body #btn-focus-exit {
     height: 36px !important;
     min-height: 36px !important;
     padding: 0 16px !important;
     border-radius: 999px !important;
     background: var(--lg-ctrl-bg) !important;
     backdrop-filter: blur(18px) saturate(180%) !important;
     -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
     border-top: 1px solid var(--lg-ctrl-border-top) !important;
     border-left: 1px solid var(--lg-ctrl-border-left) !important;
     border-right: 1px solid var(--lg-ctrl-border-right) !important;
     border-bottom: 1px solid var(--lg-ctrl-border-bottom) !important;
     box-shadow: var(--lg-ctrl-bevel) !important;
     color: var(--lg-ctrl-text) !important;
     font-size: 0.84rem !important;
     font-weight: 650 !important;
     letter-spacing: 0.01em !important;
     display: inline-flex !important;
     align-items: center !important;
     justify-content: center !important;
     gap: 6px !important;
     cursor: pointer !important;
     pointer-events: auto !important;
     transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), background 0.18s ease, box-shadow 0.18s ease !important;
   }

   html body #view-study #btn-quiz-prev:hover,
   html body #view-study #btn-flashcard-prev:hover,
   html body #view-study #btn-flashcard-next:hover,
   html body #view-study .lg-pill-btn:hover,
   html body #view-study .quiz-header-bar > .btn-secondary:hover,
   html body #view-study .blind-toggle-pill:hover,
   html body #btn-focus-exit:hover {
     background: var(--lg-ctrl-hover-bg) !important;
     transform: translateY(-1.5px) !important;
   }

   html body #view-study #btn-quiz-prev:active,
   html body #view-study #btn-flashcard-prev:active,
   html body #view-study #btn-flashcard-next:active {
     transform: scale(0.96) !important;
   }

   /* Đồng bộ luôn các nút icon [☆] [⚑] [✏️] [🎯] (.btn-card-action) sang chuẩn giọt kính Liquid Glass 36x36px */
   html body .btn-card-action {
     width: 34px !important;
     height: 34px !important;
     min-width: 34px !important;
     min-height: 34px !important;
     border-radius: 11px !important;
     background: var(--lg-ctrl-bg) !important;
     backdrop-filter: blur(16px) saturate(175%) !important;
     -webkit-backdrop-filter: blur(16px) saturate(175%) !important;
     border-top: 1px solid var(--lg-ctrl-border-top) !important;
     border-left: 1px solid var(--lg-ctrl-border-left) !important;
     border-right: 1px solid var(--lg-ctrl-border-right) !important;
     border-bottom: 1px solid var(--lg-ctrl-border-bottom) !important;
     box-shadow: var(--lg-ctrl-bevel) !important;
     color: var(--lg-ctrl-text) !important;
   }
   ```

---

### A5. Thiết Kế Lại Toàn Bộ Khung Buồng Sóng & Thanh Trượt (`#theme-energy-chamber` — `image_76bd9a.png`) Chuẩn Chỉnh, Liền Mạch, Không Bị Lem Và Bỏ Phần Chú Thích Giả Tạo

#### 🔍 Giải phẫu từng chi tiết bị lem & giả tạo trong `image_76bd9a.png`:
1. **Thanh chú thích ở trên (`Trắng Đen (Monochrome Laser Wave) | LIGHT SPECTRUM // 550nm (44%)`)**:
   - Đang là một cái khung đen viền xám nhét cứng bên trong buồng sóng, chữ `LIGHT SPECTRUM // 550nm (44%)` dùng font monospace kiểu máy tính cũ nhìn tạm bợ, giả tạo, lệch hẳn với vẻ sang trọng của Liquid Glass.
2. **Vết lem và cắt khúc ở khung sóng (`image_76bd9a.png`)**:
   - Hai đầu trái/phải của đường sóng có lớp `blur` bị tràn và cắt ngang ở mép khung; đường nét đứt dọc dưới hạt tròn rơi lửng lơ; và phần đáy của vùng sóng bị tách rời khỏi vùng thanh kéo bởi một đường viền cắt ngang.
3. **Vết lem ở 2 hình thoi trên thanh trượt & Lệch trục với 3 nút chọn Theme bên dưới**:
   - Hai dấu chấm `.phase-gate-notch` ở trên/dưới hình thoi bị dính lem vào đỉnh hình thoi; vệt trắng của rãnh trượt đè xuyên qua hình thoi; và vị trí của 2 cổng không thẳng hàng với 2 khe hở giữa 3 nút `Tím Hồng` | `Trắng Đen` | `Trắng Cam`!

#### 🛠️ Giải pháp thiết kế lại chuẩn chỉnh 100% trong `index.html`, `css/style.css` và `js/app.js`:

1. **Hợp nhất toàn bộ `#theme-energy-chamber` thành 1 Khối Kính Liquid Glass `135deg` Liền Mạch (Unified Glass Console)**:
   - Không đóng khung đen rời rạc bên trong nữa! Toàn bộ `#theme-energy-chamber` dùng đúng chất liệu kính nhám xuyên thấu `135deg` của Sidebar & Popup (`padding: 20px 22px; border-radius: 22px; overflow: hidden;`).
2. **Thiết kế lại Tầng Header Chú Thích Theme (Sang trọng, Tinh tế, Không dùng chữ `LIGHT SPECTRUM // 550nm` giả tạo)**:
   - Bên trái: Hiển thị **Điểm Ngọc Phát Sáng (`.theme-live-dot`)** + **Tên Theme Tiếng Việt rõ đẹp** (`Tím Hồng`, `Trắng Đen`, `Trắng Cam`) kèm phụ đề ngắn tinh tế (`Kính tím khói mộng mơ`, `Kính khói bạc tương phản cao`, `Kính sương kem cam ấm`).
   - Bên phải: Một **Viên Thuốc Kính Liquid Glass (`.energy-level-pill`)** dùng font chữ hệ thống sắc nét (`font-family: inherit; font-weight: 700; font-size: 0.8rem;`) hiển thị biểu tượng sóng mảnh + phần trăm năng lượng thực tế (ví dụ: `Năng lượng • 44%`).
3. **Làm sạch 100% Vết Lem ở Sân Khấu Sóng SVG & 2 Cổng Ngưỡng**:
   - **Trên vùng sóng SVG (`.energy-wave-stage`)**:
     - Áp mặt nạ mờ dần mềm mại ở 2 đầu trái/phải và mép đáy (`-webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);`) để hai đầu mút đường sóng vuốt mịn vào không gian kính, **không bao giờ bị lem hay cắt cụt ở mép khung**!
     - **Xóa bỏ đường nét đứt dọc (`#wave-cursor-beam`)** bị lơ lửng dưới hạt sáng! Chỉ giữ **Hạt Tâm Quang Năng đồng tâm (`#wave-cursor-halo` + `#wave-cursor-orb`)** trượt mượt mà ngay trên đỉnh sóng!
   - **Trên Thanh Trượt & 2 Cổng Ngưỡng (`#phase-gate-1` tại `33.33%`, `#phase-gate-2` tại `66.67%`)**:
     - **Xóa bỏ hoàn toàn 2 chấm `.phase-gate-notch` trên/dưới hình thoi gây lem!**
     - Thiết kế mỗi Cổng Pha thành một **Viên Nang Kính Đứng Tinh Tế (`width: 8px; height: 18px; border-radius: 999px; transform: translate(-50%, -50%);`)** (hoặc nút tròn đôi đồng tâm `14px x 14px`) có viền tách nền dày `2.5px` bao quanh để **cắt ngọt rãnh trượt, tuyệt đối không cho vệt màu của thanh trượt lem đè lên cổng**!
     - Đặt tại `left: calc(33.333% - 2px)` và `left: calc(66.667% + 2px)` để **thẳng hàng 100% theo trục dọc với 2 khe ngăn cách giữa 3 nút `[ Tím Hồng ]  [ Trắng Đen ]  [ Trắng Cam ]` ở ngay bên dưới**!

---

### A6. Gán "Background 2" (`./backgrounds/bg-2.webp`) Làm Hình Nền Mặc Định Khi Người Dùng Mới Vào Lần Đầu (Cache Trắng, Theme Tím Mặc Định)

#### 🔍 Hiện trạng:
- Khi người dùng mới mở ứng dụng lần đầu tiên (cache trắng, chưa có khóa `backgroundSrc` trong IndexedDB `meta`), `await db.getMeta('backgroundSrc', null)` trả về `null`, khiến ứng dụng gọi `setBackground('none', true)` làm Theme Tím mặc định không có hình nền!

#### 🛠️ Giải pháp bắt buộc trong `js/app.js` (Hàm `App.init()`):
- Trong `App.init()`, khi đọc `let savedBg = await db.getMeta('backgroundSrc', null);`:
  - Nếu `savedBg === null` hoặc `savedBg === undefined` (tức là người dùng mới hoàn toàn / cache trắng, chưa từng chủ động chọn `'none'`):
    ```javascript
    let savedBg = await db.getMeta('backgroundSrc', null);
    if (savedBg === null || savedBg === undefined) {
      // Người dùng mới / cache trắng: Gán Background 2 làm hình nền mặc định cho Theme Tím
      savedBg = './backgrounds/bg-2.webp';
      await db.setMeta('backgroundSrc', savedBg);
    }
    ```
  - Sau đó chạy tiếp khối nạp `this.setBackground(savedBg, true)` như bình thường!
  - Kết quả: Ngay khi mở app trên trình duyệt mới hoặc sau khi xóa sạch cache, Theme Tím mặc định sẽ tự động khoác lên mình hình nền **Background 2 (`./backgrounds/bg-2.webp`)** và đánh dấu `.active` đúng vào ô `Background 2` trong phần Cài đặt! (Nếu người dùng chủ động bấm vào ô `"🚫 Không nền"` thì `savedBg` mới được lưu thành `'none'`).

---

## PHẦN B: 7 ĐỘT PHÁ TỐI ƯU HÓA THUẬT TOÁN & HIỆU NĂNG "MAX PING" 120FPS (THỰC HIỆN NGAY SAU PHẦN A)

1. **Tầng Cơ Sở Dữ Liệu (`js/db.js`) — In-Memory Revision Cache $O(1)$ & Gộp Truy Vấn $O(N)$**:
   - Bổ sung bộ nhớ đệm `_memCache` (`cards`, `decks`, `subjects`, `metaMap`) gắn với `this.revision`. Khi `this.revision` chưa đổi, trả về dữ liệu từ RAM trong `< 0.05ms` (0 I/O IndexedDB); khi có bất kỳ thao tác ghi/sửa/xóa nào (`invalidateSubjectCache()`), tăng `this.revision++` và xóa `_memCache` để dữ liệu luôn mới 100%.
   - Tối ưu `getSubjectSummaries()` bằng `Promise.all([getAllSubjects(), getAllDecks(), getAllCards()])` và gom nhóm qua `Map` trong **1 vòng lặp $O(N)$ duy nhất** (thay vì mở 20 transactions nối tiếp trong vòng lặp `for`).
   - Tối ưu `getSprintCards()` (Ôn nước rút) bằng `Map` gom nhóm theo chủ đề trong 1 lần duyệt $O(N)$.
2. **Bộ Lọc Trích Dẫn & Toán Học KaTeX (`stripCitationArtifacts` & `renderLatexText` trong `js/app.js`, `js/parser.js`)**:
   - Trong `stripCitationArtifacts(text)`: kiểm tra nhanh `if (text.indexOf('[') === -1 && text.indexOf('【') === -1) return text;`.
   - Trong `renderLatexText(text)`: kiểm tra nhanh Non-Math Bypass `if (str.indexOf('$') === -1 && str.indexOf('\\(') === -1 && str.indexOf('\\[') === -1) return this._escapeHtml(str);` và lưu đệm kết quả toàn chuỗi vào `globalThis._msFullLatexCache` (LRU 1,500 mục).
3. **Chỉ Mục Tìm Kiếm Tiền Xử Lý `_searchBlob` ($O(1)$ String Scan) Cho Ngân Hàng Câu Hỏi (`#view-bank`)**:
   - Tạo helper `_getCardSearchBlob(card)` lưu chuỗi chữ thường vào thuộc tính ẩn `Object.defineProperty(card, '_searchBlob', { enumerable: false, ... })` theo `card.updatedAt` kết hợp debounce `90ms` cho ô tìm kiếm `#bank-search-input`.
4. **Single-Pass Aggregation $O(N)$ Cho `renderDashboard()` Và `renderStatsView()` (`js/app.js`)**:
   - Gom `logs` theo ngày vào `Map` trong 1 vòng lặp duy nhất để tính `todayReviews` và 7 chấm Mini Heatmap; gom `allCards` theo `deckId` trong 1 vòng lặp duy nhất; chạy song song 3 bảng thống kê ở `#view-stats` bằng `Promise.all`.
5. **Bảng Tra Cứu Tĩnh `Float32Array` (`_waveLUT`) Cho Buồng Sóng (`_updateEnergyWaveVisuals`)**:
   - Lưu sẵn mảng tĩnh `u`, `x` và hàm bao nền `Math.pow(Math.sin(Math.PI * u), 0.65)` cho 161 điểm mẫu vào `Float32Array`, loại bỏ phép tính `Math.pow` trong mỗi frame kéo thanh trượt.
6. **Chuyển Tab Tức Thì Bằng `_renderedViewRevision` (`navigateTo` trong `js/app.js`)**:
   - Ghi nhận `_renderedViewRevision` theo `db.revision` cho `decks` và `stats`; khi chuyển lại tab đó mà `db.revision` chưa đổi và container đã có DOM, hiển thị tức thì trong `< 0.1ms`.
7. **Cập Nhật Hoàn Chỉnh `ARCHITECTURE_GRAPH.md` (Và `docs/ARCHITECTURE_GRAPH.md`) Lên Phiên Bản Phase 1v**.

---

## DANH SÁCH KIỂM TRA NGHIỆM THU CUỐI CÙNG (VERIFICATION CHECKLIST — `promt1v.md`)

- [ ] **1. Layout rộng thoáng tối đa như `image_76c862.jpg`:** `.content-wrapper` mở rộng 100% chiều ngang `.app-main`, mép trái của `.hero-card` nằm gần Sidebar và mép phải thẳng hàng với cụm HUD `🔥 4 ngày`, không còn bị bó hẹp thừa khoảng đen 2 bên như `image_76c59c.jpg`.
- [ ] **2. Chỉ còn duy nhất 1 nút `← Câu trước` chuẩn Liquid Glass trong Quiz (`image_76c4a9.png`):** Đã xóa nút `< Câu trước` bị thừa ở trên câu hỏi; nút `← Câu trước` ở chân thẻ Quiz và cặp nút `← Câu trước` / `Câu tiếp →` ở Flashcard (`image_76c181.png`) đều mang thiết kế viên thuốc kính nhám xuyên thấu `135deg` đồng bộ 100% với Sidebar & Popup.
- [ ] **3. Khung Buồng Sóng & Thanh Trượt liền mạch, chuẩn chỉnh (`image_76bd9a.png`):** Không còn vết lem ở 2 đầu sóng hay dưới đáy; bỏ dòng chữ `LIGHT SPECTRUM // 550nm` giả tạo và khung đen tạm bợ; xóa 2 chấm lem trên/dưới cổng ngưỡng và căn 2 cổng thẳng hàng tuyệt đối với khe giữa 3 nút chọn Theme bên dưới.
- [ ] **4. Hình nền mặc định Theme Tím khi Cache trắng:** Mở ứng dụng trên trình duyệt mới / xóa sạch dữ liệu trang web sẽ tự động hiển thị hình nền **Background 2 (`./backgrounds/bg-2.webp`)** cho Theme Tím mặc định.
- [ ] **5. Tốc độ "Max Ping" 120FPS & 100% Test Pass:** Toàn bộ 7 trụ cột tối ưu hóa thuật toán hoạt động mượt mà, `npm test` và `npm run build` đạt 100% PASS.