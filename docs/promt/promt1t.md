# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1T — ĐẢO CHIỀU VỆT MÀU RÃNH TRƯỢT CHUẨN TỪ TRÁI SANG PHẢI (`0% -> VAL%`), TÁI TẠO CHẤT LIỆU KÍNH NHÁM XUYÊN THẤU LIQUID GLASS CHO SIDEBAR & CẬP NHẬT TOÀN DIỆN `ARCHITECTURE_GRAPH.md` (`promt1t.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1t` (Nối tiếp sau `1s`)
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **3 yêu cầu tinh chỉnh & đồng bộ kiến trúc** từ phản hồi mới nhất của người dùng và 3 ảnh chụp màn hình (`image_9122c6.png`, `image_9122c4.jpg`, `image_911aab.png`), tuân thủ nghiêm ngặt **Luật Phân Tích Ảnh Hưởng & Chống Hồi Quy (System Impact & Regression Analysis Protocol)**.

---

## PHẦN 1: CHI TIẾT 3 HẠNG MỤC CẦN THỰC HIỆN TRONG `promt1t.md`

### 1. Sửa Lại Chiều Vệt Màu Rãnh Trượt (Slider Track Fill) Chuẩn Từ Trái Sang Phải (`0% -> --slider-pct`) Cho Cả Thanh Kéo Sóng Và Thanh Kéo Âm Lượng Lofi (`image_9122c6.png` & `image_9122c4.jpg`)

#### 🔍 Hiện trạng (`image_9122c6.png` & `image_9122c4.jpg`):
- Nhìn vào `image_9122c6.png` (nút kéo sóng ở mức `17%`) và `image_9122c4.jpg` (nút kéo âm lượng Lofi ở mức `40%`):
  - Hiện tại vệt màu sáng đang nằm ở **phía bên phải nút kéo (`--slider-pct -> 100%`)**, còn phía bên trái nút kéo (`0% -> --slider-pct`) lại tối màu — bị ngược so với quy luật kéo tự nhiên từ trái (`0%`) sang phải (`100%`)!
- **Yêu cầu chuẩn xác từ người dùng**:
  - Khi kéo từ trái (`0%`) sang phải (`100%`), **phía bên trái nút kéo (`0% -> --slider-pct`) BẮT BUỘC phải là phần có màu sáng rực rỡ (`var(--range-active-color)`) tượng trưng cho mức âm lượng / mức năng lượng sóng đang có**, còn phía bên phải nút kéo (`--slider-pct -> 100%`) là phần rãnh tối chưa đạt tới (`var(--range-inactive-bg)`)!

#### 🛠️ Giải pháp bắt buộc trong `css/style.css`, `js/lofi-music.js` và `js/app.js`:

1. **Trong `css/style.css` (Đảo lại thứ tự `linear-gradient` trên toàn bộ thanh kéo Sóng và thanh kéo Âm lượng Lofi)**:
   ```css
   /* ==========================================================================
      1. RÃNH TRƯỢT CHUẨN TỪ TRÁI SANG PHẢI (0% -> --slider-pct CÓ MÀU SÁNG ACTIVE)
      ========================================================================== */

   html body #theme-energy-slider,
   html body .theme-energy-slider,
   html body #lofi-volume-slider,
   html body #setting-lofi-volume,
   html body .lofi-volume-slider,
   html body input[type="range"].lofi-volume-range {
     -webkit-appearance: none !important;
     appearance: none !important;
     width: 100% !important;
     height: 8px !important;
     border-radius: 999px !important;
     outline: none !important;
     cursor: pointer !important;
     /* Chuẩn 100%: Phía bên trái nút kéo (0% -> --slider-pct) có màu sáng tượng trưng cho mức đang có;
        phía bên phải nút kéo (--slider-pct -> 100%) là rãnh tối chưa kéo tới */
     background: linear-gradient(
       90deg,
       var(--range-active-color) 0%,
       var(--range-active-color) var(--slider-pct, 40%),
       var(--range-inactive-bg) var(--slider-pct, 40%),
       var(--range-inactive-bg) 100%
     ) !important;
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35) !important;
   }

   /* Đảm bảo cả Firefox (::-moz-range-progress / ::-moz-range-track) cũng đồng bộ từ trái sang phải */
   html body #theme-energy-slider::-webkit-slider-runnable-track,
   html body .theme-energy-slider::-webkit-slider-runnable-track,
   html body #lofi-volume-slider::-webkit-slider-runnable-track,
   html body #setting-lofi-volume::-webkit-slider-runnable-track,
   html body .lofi-volume-slider::-webkit-slider-runnable-track {
     height: 8px !important;
     border-radius: 999px !important;
     background: transparent !important;
     border: none !important;
   }
   ```
2. **Kiểm tra trong `js/app.js` và `js/lofi-music.js`**:
   - Nếu trong hàm `syncRangeSliderVisual` hoặc `onThemeEnergySliderInput` / `setVolume` có gán trực tiếp `sliderEl.style.background = ...` bằng JS, hãy **xóa bỏ việc gán `style.background` ngược chiều trong JS** (hoặc sửa lại đúng `linear-gradient(90deg, var(--range-active-color) 0%, var(--range-active-color) ${pct}%, var(--range-inactive-bg) ${pct}%, var(--range-inactive-bg) 100%)`) và chỉ cần cập nhật `sliderEl.style.setProperty('--slider-pct', `${pct.toFixed(1)}%`)`!
   - Đảm bảo ở mức `17%` (`image_9122c6.png`), đúng đoạn `0% -> 17%` bên trái nút tròn có màu tím sáng; ở mức `40%` (`image_9122c4.jpg`), đúng đoạn `0% -> 40%` bên trái nút tròn có màu sáng!

---

### 2. Tái Tạo Chất Liệu Kính Nhám Xuyên Thấu (Frosted Translucent Liquid Glass) Cho Sidebar (`.app-sidebar` — `image_911aab.png`)

#### 🔍 Giải phẫu nguyên nhân từ ảnh `image_911aab.png`:
- Nhìn vào `image_911aab.png`: Thanh Sidebar (`.app-sidebar`) hiện tại đang dùng nền quá đặc/đục (alpha cao `~0.88–0.95`), khiến toàn bộ các ô gạch/hình nền phía sau bị che khuất hoàn toàn, nhìn giống một thanh nhựa đục phẳng lì chứ chưa có độ **nhám mờ xuyên thấu (frosted translucency)** và độ **khúc xạ ánh sáng cạnh kính (Liquid Glass edge refraction)**.
- **Yêu cầu từ người dùng**:
  - *"sidebar cảm giác đục đục, nhám nhưng vẫn có cảm giác xuyên thấu đi, 1 chút liquid glass"*

#### 🛠️ Giải pháp vật lý quang học (Frosted Translucent Satin + `135deg` Liquid Glass Bevel) trên cả 3 Theme trong `css/theme.css` và `css/style.css`:

1. **Giảm độ đục (Alpha `0.38 -> 0.50`) để hình nền và màu sắc phía sau ánh xuyên qua lớp kính nhám, kết hợp `backdrop-filter: blur(20px) saturate(185%)` và viền khúc xạ 3D `135deg`**:
   ```css
   /* ==========================================================================
      2. SIDEBAR KÍNH NHÁM XUYÊN THẤU + KHÚC XẠ LIQUID GLASS 135DEG (3 THEME)
      ========================================================================== */

   /* 1. THEME TÍM HỒNG (Violet Rose): Kính tím khói nhám xuyên thấu */
   :root .app-sidebar,
   html[data-theme="violet"] .app-sidebar,
   html[data-theme="purple"] .app-sidebar {
     --sidebar-glass-bg: linear-gradient(
       135deg,
       rgba(46, 30, 78, 0.44) 0%,
       rgba(26, 16, 48, 0.34) 55%,
       rgba(38, 22, 68, 0.40) 100%
     );
     --sidebar-glass-border-top: rgba(255, 255, 255, 0.38);
     --sidebar-glass-border-left: rgba(233, 213, 255, 0.32);
     --sidebar-glass-border-right: rgba(168, 85, 247, 0.16);
     --sidebar-glass-border-bottom: rgba(168, 85, 247, 0.22);
     --sidebar-glass-bevel:
       inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.36),
       inset -1px -1.5px 3px rgba(168, 85, 247, 0.18),
       inset 0 12px 24px rgba(255, 255, 255, 0.06),
       0 14px 34px rgba(8, 4, 20, 0.38);
   }

   /* 2. THEME TRẮNG ĐEN (Monochrome): Kính khói bạc nhám xuyên thấu */
   html[data-theme="bw"] .app-sidebar,
   html[data-theme="monochrome"] .app-sidebar {
     --sidebar-glass-bg: linear-gradient(
       135deg,
       rgba(42, 42, 48, 0.44) 0%,
       rgba(20, 20, 24, 0.34) 55%,
       rgba(34, 34, 40, 0.40) 100%
     );
     --sidebar-glass-border-top: rgba(255, 255, 255, 0.42);
     --sidebar-glass-border-left: rgba(255, 255, 255, 0.32);
     --sidebar-glass-border-right: rgba(255, 255, 255, 0.12);
     --sidebar-glass-border-bottom: rgba(255, 255, 255, 0.18);
     --sidebar-glass-bevel:
       inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.40),
       inset -1px -1.5px 3px rgba(255, 255, 255, 0.12),
       inset 0 12px 24px rgba(255, 255, 255, 0.05),
       0 14px 34px rgba(0, 0, 0, 0.42);
   }

   /* 3. THEME TRẮNG CAM (White-Orange — image_911aab.png): Kính sương kem ấm xuyên thấu rõ nền gạch cam phía sau */
   html[data-theme="orange"] .app-sidebar,
   html[data-theme="white-orange"] .app-sidebar {
     --sidebar-glass-bg: linear-gradient(
       135deg,
       rgba(255, 252, 248, 0.46) 0%,
       rgba(255, 244, 232, 0.32) 52%,
       rgba(255, 236, 216, 0.42) 100%
     );
     --sidebar-glass-border-top: rgba(255, 255, 255, 0.92);
     --sidebar-glass-border-left: rgba(255, 255, 255, 0.85);
     --sidebar-glass-border-right: rgba(249, 115, 22, 0.22);
     --sidebar-glass-border-bottom: rgba(249, 115, 22, 0.26);
     --sidebar-glass-bevel:
       inset 2px 2px 3px rgba(255, 255, 255, 0.88),
       inset -1.5px -1.5px 3px rgba(249, 115, 22, 0.14),
       inset 0 14px 28px rgba(255, 255, 255, 0.38),
       0 12px 30px rgba(154, 52, 18, 0.10);
   }

   /* Áp dụng chất liệu Frosted Liquid Glass lên cả Sidebar mở rộng lẫn Sidebar thu gọn (.collapsed) */
   html body #app-sidebar.app-sidebar,
   html body #app-sidebar.app-sidebar.collapsed {
     background: var(--sidebar-glass-bg) !important;
     backdrop-filter: blur(20px) saturate(185%) !important;
     -webkit-backdrop-filter: blur(20px) saturate(185%) !important;
     border-top: 1px solid var(--sidebar-glass-border-top) !important;
     border-left: 1px solid var(--sidebar-glass-border-left) !important;
     border-right: 1px solid var(--sidebar-glass-border-right) !important;
     border-bottom: 1px solid var(--sidebar-glass-border-bottom) !important;
     box-shadow: var(--sidebar-glass-bevel) !important;
   }

   /* Lớp phản quang bề mặt kính nhám (Frosted Specular Sheen) chạy dọc mép trên-trái của Sidebar */
   html body #app-sidebar.app-sidebar::after {
     content: '' !important;
     position: absolute !important;
     inset: 0 !important;
     border-radius: inherit !important;
     pointer-events: none !important;
     background: linear-gradient(
       135deg,
       rgba(255, 255, 255, 0.22) 0%,
       rgba(255, 255, 255, 0.04) 32%,
       transparent 60%,
       rgba(255, 255, 255, 0.08) 100%
     ) !important;
     z-index: 0 !important;
   }

   /* Các nút .nav-item bên trong Sidebar khi hover cũng mang hiệu ứng giọt kính trong suốt */
   html[data-theme="orange"] #app-sidebar .nav-item:not(.active) button:hover,
   html[data-theme="white-orange"] #app-sidebar .nav-item:not(.active) button:hover {
     background: rgba(255, 255, 255, 0.42) !important;
     box-shadow: inset 1px 1px 1.5px rgba(255, 255, 255, 0.85), 0 4px 12px rgba(234, 88, 12, 0.08) !important;
   }
   ```

---

### 3. Cập Nhật Toàn Diện File Bản Đồ Kiến Trúc `ARCHITECTURE_GRAPH.md` (Và `docs/ARCHITECTURE_GRAPH.md`) Chuẩn Bị Cho Đợt Tối Ưu Hóa Cuối Cùng

Người dùng sẽ gửi lại file `ARCHITECTURE_GRAPH.md` ở lượt tiếp theo để thực hiện đợt tối ưu hóa tổng thể cuối cùng cho toàn bộ ứng dụng. Do đó, AI Coding Agent BẮT BUỘC phải cập nhật đầy đủ và chính xác **cả 2 bản `ARCHITECTURE_GRAPH.md` (ở thư mục gốc) và `docs/ARCHITECTURE_GRAPH.md`** bao gồm:

1. **Cập nhật thông số thực tế ở Phần Mở Đầu & Sơ Đồ Cây `mermaid` (Phần 1)**:
   - Đếm và ghi chính xác **số dòng code thực tế hiện tại** của từng file cốt lõi (`index.html`, `js/app.js`, `js/db.js`, `js/lofi-music.js`, `js/parser.js`, `js/srs.js`, `js/audio.js`, `js/worker.js`, `css/style.css`, `css/theme.css`, `tests/test-runner.js`).
   - Cập nhật **Bảng 9 Nhánh Kiến Trúc (9 Architectural Branches)** với tọa độ dòng (`#L...`) chính xác của phiên bản mới nhất (`Phase 1t`), bao gồm:
     - **Branch 1 (Global Shell & Responsive Architecture)**: Sidebar kính nhám xuyên thấu Liquid Glass `135deg` (`--sidebar-glass-*`), Mobile Bottom Nav 2 lớp, Mobile Landscape Slim Left Dock 64px, khóa `html.theme-switching-lock` 60FPS trên Mobile.
     - **Branch 2 (`#view-dashboard`)**: Khung Quote, 4 ô thống kê, 7 chế độ học, Lofi Bar kèm thanh kéo âm lượng có vệt màu chuẩn từ trái sang phải (`0% -> --slider-pct`).
     - **Branch 3 (`#view-decks`)**: Thư viện thẻ, bộ lọc môn học, xóa bộ thẻ qua hộp thoại Liquid Glass `#modal-confirm-delete-deck`.
     - **Branch 4 (`#view-bank`)**: Ngân hàng câu hỏi với cơ chế `INITIAL_BATCH = 8` Float-Up Entrance (`.bank-card-float-item.is-visible`) + `IntersectionObserver` Lazy Scroll Reveal + Skeleton Shimmer (`.bank-lazy-sentinel`).
     - **Branch 5 (`#view-study`)**: Phòng học Quiz & Flashcard: nút Quay lại câu trước (`prevStudyQuestion`, `#btn-quiz-card-prev`, `#btn-quiz-prev`, `#btn-flashcard-prev`, `#btn-flashcard-next`) chuẩn ngôn ngữ `.btn-card-action.btn-card-nav` (`32px`), nút Thoát tập trung thu gọn (`#btn-focus-exit`), thanh tiến trình `--study-progress-pct`, căn chỉnh thẳng hàng 4 đáp án `.quiz-option-btn` và phóng to hộp Giải thích `#quiz-explanation-text`.
     - **Branch 6 (`#view-exam`)**: Thi thử 2 chế độ (`single` & `all`), đồng bộ thanh câu hỏi và hiệu ứng chọn đáp án theo 3 theme.
     - **Branch 7 (`#view-import` & `#view-import-lms`)**: Bộ lọc tự động `stripCitationArtifacts` chặn và quét sạch `[cite: ...]`, `[cite_start]`, `【...】` ở cả Prompt, Parser, Renderer và IndexedDB.
     - **Branch 8 (`#view-stats` & `#view-settings`)**: Heatmap 365 ngày, Buồng Sóng Năng Lượng đồng bộ màu 100% theo 3 theme (0% ám tím ở Trắng Đen & Trắng Cam), HUD Mobile tách dòng phía trên sóng, thanh kéo sóng chuẩn trái-sang-phải (`0% -> --slider-pct`), và tính năng phát hiện + gợi ý gộp các môn học trùng tên (`findDuplicateSubjectGroups` / `mergeDuplicateSubjectGroups`) khi gộp Backup JSON.
     - **Branch 9 (Modal System)**: Hệ thống Modal Liquid Glass 3 theme + cơ chế đóng Popup bất tử `closeAllModals()` qua Event Delegation (`.modal-close`, `.modal-overlay`, phím `Escape`).
2. **Cập nhật Phần 2 (Ma Trận Liên Kết Component Dùng Chung) & Phần 3 (Bảng Token CSS 3 Theme)**:
   - Bổ sung các biến `--sidebar-glass-*`, `--wave-chamber-*`, `--wave-area-stop-*`, `--range-active-color`, `--study-progress-pct`.
3. **Bổ sung Phần 5 (Danh Mục Các Điểm Nóng Hiệu Năng & Bản Đồ Phục Vụ Đợt Tối Ưu Hóa Cuối Cùng + Luật Phân Tích Ảnh Hưởng Hệ Thống)**:
   - Liệt kê rõ tọa độ các hàm render chính (`App.init`, `renderDashboard`, `renderDecks`, `renderQuestionBank`, `renderActiveStudyCard`, `_renderQuizContent`, `_renderFlashcardContent`, `renderLatexText`, `setTheme`, `_updateEnergyWaveVisuals`) và kích thước/độ phức tạp của từng file CSS/JS để phục vụ lượt tối ưu hóa FPS cuối cùng.

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST — `promt1t.md`)

- [ ] **1. Rãnh trượt chuẩn từ trái sang phải (`0% -> --slider-pct`):** Trên cả Thanh kéo Sóng (`#theme-energy-slider`) và Thanh kéo Âm lượng Lofi (`#lofi-volume-slider`, `#setting-lofi-volume`), phần bên trái nút kéo (`0%` đến vị trí nút kéo) hiển thị màu sáng active tượng trưng cho mức đang có, còn phần bên phải nút kéo (`vị trí nút kéo` đến `100%`) là rãnh tối chưa đạt tới.
- [ ] **2. Sidebar Kính Nhám Xuyên Thấu Liquid Glass (`.app-sidebar`):** Sidebar trên cả 3 theme (`violet`, `bw`, `orange`) có độ nhám mờ xuyên thấu tự nhiên (`alpha 0.34–0.46`, `backdrop-filter: blur(20px) saturate(185%)`), nhìn thấy rõ sắc độ hình nền phía sau ánh qua lớp kính kèm gờ vát sáng `135deg` sắc sảo, không còn bị đục đặc như `image_911aab.png`.
- [ ] **3. Cập nhật đầy đủ `ARCHITECTURE_GRAPH.md` (và `docs/ARCHITECTURE_GRAPH.md`):** Phản ánh chính xác 100% cấu trúc cây, số dòng code, tọa độ hàm/CSS và các cơ chế mới nhất đến hết Phase `1t`.
- [ ] **4. Chạy `npm test` và `npm run build` đạt 100% PASS.**
