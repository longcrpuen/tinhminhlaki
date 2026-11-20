# TIẾN ĐỘ THỰC HIỆN ĐỢT 2Q (`docs/progress/progress2q.md`)
> **Nhánh**: `fix/mobile-full-audit` (tách từ `main`)  
> **Thời điểm hoàn thành**: 2026-11-21  
> **Trạng thái**: Hoàn tất 100% mục tiêu Đợt 2q (chưa merge vào `main`)

---

## 1. Kết Quả Thực Hiện Theo Màn Hình

| Hạng mục | Trạng thái | Chi tiết sửa lỗi tận gốc |
| :--- | :---: | :--- |
| **Toàn cục: Toast, Dock Xoay Ngang & Mobile-Native** | Hoàn thành | Đặt `.toast-container` cao hơn `#mobile-bottom-nav` ở Portrait (`bottom: calc(88px + env(safe-area-inset-bottom, 0px))`) và chừa lề trái `left: 76px` ở Landscape (tránh kẹp mép trái `-3.2px`). Thêm `box-sizing: border-box` cho dock trái để triệt tiêu tràn dọc `406.4px > 390px` và đồng bộ biến `--bnav-*` cho cả 4 theme (bao gồm `ascii` xanh ngọc `#10b981`) trên `667x375` và `844x390`. Bổ sung `touch-action: manipulation`, `-webkit-text-size-adjust: 100%`, `scroll-padding-bottom`, và ép `font-size: 16px` cho các ô nhập liệu mobile để chống iOS auto-zoom. |
| **1. Trang chủ (Dashboard / Hero & Topbar HUD)** | Hoàn thành | Mở rộng `.topbar-hud-capsule` (`height: 42px` Portrait, bỏ `scale(0.9)` ở Landscape), đồng bộ kích thước `#ascii-scene-cycle-btn` với `.theme-icon-btn` kèm vùng chạm mở rộng `::after { inset: -4px/-5px }` và giới hạn `max-height: calc(100dvh - 64px)` cho `#ascii-scene-popover`. Khóa `flex-shrink: 0` & `40x40px` cho `#hero-lofi-bar .lofi-ctrl-btn` trên Portrait. Thu gọn `.editorial-hero-stage` và `.hero-title` để 3 nút hành động nhanh hiển thị trọn vẹn trong màn hình đầu ở `375x667`, `667x375` và `844x390`. |
| **2. Bộ thẻ (Decks), Ngân hàng (Bank), Thống kê (Stats) & Modals** | Hoàn thành | Cho `.deck-card .deck-header` xuống dòng hợp lý trên `<= 640px` để `.deck-name` mở rộng từ `61.5px` lên `247.2px`. Bổ sung logic kiểm tra mép phải viewport trong `App._openCyberDropdown()` (`align-right` -> `right: 0`) chặn tràn `+32.3px` tại `667x375`. Đặt `min-width: 520px` cho các bảng `#view-stats` trong wrapper cuộn ngang tách biệt. Chuyển các grid 2 cột trong `#modal-edit-card` (`.modal-two-col-row`), `#modal-exam-setup` (`.exam-mode-grid`) và `#modal-manage-subject` sang 1 cột trên `<= 640px`, nâng nút `.modal-close` và `.btn-card-action` lên `>= 40x40px`. |
| **3. Import AI (Wave 2p) & Import LMS** | Hoàn thành | Chuẩn hóa cụm Wave 2p trên mobile: `.import-prompt-header`, `.import-prompt-controls`, `#import-prompt-count` (`16px`, cao `44px`), `.btn-import-copy-prompt` (`>= 44px`), `.btn-import-sample` (`>= 40px`), `.btn-import-submit` full-width (`46px`), `#import-validation-alert` wrap chữ sạch và `#lms-batch-answers` bỏ `min-width: 260px` cứng. |
| **4. Luyện tập (Study), Thi thử (Exam) & Flashcard** | Hoàn thành | Chuyển `.quiz-progress-track` xuống hàng thứ 2 full-width (`flex: 1 0 100%`) trên `<= 640px` để không bị bóp còn `8–10px` và giữ `#btn-toggle-blind` trên 1 dòng; khóa `#exam-q-counter` (`white-space: nowrap`) và nâng `.exam-palette-btn` lên `40x40px`. Khắc phục triệt để lỗi độ ưu tiên CSS của `body.flashcard-active .flashcard-stage` / `.flashcard-face` để thẻ tự giãn chiều cao (hết đè lên `#flashcard-srs-bar` ở `390x844`) và đổi `justify-content: flex-start` (hết cắt đầu `"ĐÁP ÁN ĐÚNG"` ở `667x375` & `844x390`). |
| **5. Cài đặt (Settings) & Nền ASCII 3D (`js/ascii-bg.js`)** | Hoàn thành | Nâng chiều cao `.energy-node-btn` & `.ascii-scene-pill-btn` lên `>= 40px`, chuyển 4 nút cảnh ASCII thành icon trên chữ ở `<= 480px` tránh gãy giữa từ (`Slideshow`, `Gargantua`), bỏ `min-width: 260px` của `#lofi-track-dropdown-wrap` và cho `.settings-option-row` wrap gọn. Trong `js/ascii-bg.js`, tách chính xác mobile qua `isDesktopViewport(width, height)` (`width > 840 && height > 500`), căn giữa và giới hạn khung an toàn cho cả **Cây thông**, **Hố đen Gargantua** và **Hiệp sĩ Mèo** (kể cả `startZoom: 1.18` trên mobile để mũi kiếm không chạm mép `y=0`), giảm mật độ cell mobile (`4.2x7.4`) và thêm cơ chế nhường blit khi người dùng đang vuốt cuộn (`_lastScrollMs`), vẫn giữ nguyên `DPR = 1` & `30 FPS`. |

---

## 2. Kết Quả Kiểm Thử, Đóng Gói & Xác Thực Trực Tiếp

### 2.1. Kiểm thử tự động (`node tests/test-runner.js`)
- Tổng số test case: **1,555 passed, 0 failed** (100% pass từ Suite 1 đến Suite 48).
- **Test Suite 48** (33 assertions) kiểm chứng:
  + Toàn bộ rule responsive Portrait & Landscape trong `PHASE 2Q` của `css/style.css` và các class hook trong `index.html`.
  + Hành vi `App._openCyberDropdown()` tự gắn `align-right` khi menu sát mép phải trên `667x375`.
  + `AsciiBg`: bảo toàn `DPR = 1`, `FPS_LIMIT = 30`, phân tách `isDesktopViewport`, quét bounding box pixel không đen của cả 3 cảnh (`tree`, `gargantua`, `cat`) trên cả 4 viewport (`375x667`, `390x844`, `667x375`, `844x390`) nằm gọn trong lề an toàn, và cơ chế nhường blit khi chạm vuốt cuộn trong `_tick`.

### 2.2. Kiểm tra trực tiếp trên trình duyệt local (`http://localhost:5173/`)
- **Đo tràn ngang (`scrollWidth <= clientWidth`)**: Đạt 100% trên cả 4 viewport di động (`375x667`, `390x844`, `667x375`, `844x390`) và Desktop (`1280x800`).
- **Flashcard Back vs `#flashcard-srs-bar`**: Không còn chồng lấn trên `390x844` (`overlapPx = -24.8px`), `667x375` (`-26.8px`), `844x390` (`-22.0px`), và không còn cắt phần đầu trên Landscape.
- **Toast & Popover & Dropdowns**: Toast nằm trên bottom-nav ở Portrait và cách lề trái `>= 76px` ở Landscape; `#bank-subject-dropdown-menu` lật `align-right` gọn trong `<= 667px`; `#ascii-scene-popover` gọn trong khung hình; các nút chọn cảnh ASCII ở Settings `375x667` hết gãy giữa từ; mũi kiếm Hiệp sĩ Mèo trên `667x375` (`y ≈ 48px`) và `844x390` (`y ≈ 64px`) nằm trọn bên dưới mép trên.
- **Desktop (`1280x800`)**: Sidebar `244px`, layout 2 cột, Flashcard (`overlapPx = -18px`) và tọa độ ASCII 3D bên phải (`~0.72`) giữ nguyên hoàn toàn.

### 2.3. Đóng gói sản phẩm (`node scripts/build.js`)
- Xác thực cú pháp toàn bộ core JS files (`node --check`): **100% Passed**.
- Đóng gói hoàn chỉnh **101 files** (`4.90 MB`) vào `dist/`, sẵn sàng PWA Offline.

---

## 3. Các Tệp Tin Đã Chỉnh Sửa & Bổ Sung
1. `index.html`: Bổ sung class hook nhẹ (`.import-prompt-header`, `.import-prompt-controls`, `.btn-import-copy-prompt`, `.import-textarea-header`, `.btn-import-sample`, `.import-submit-row`, `.btn-import-submit`, `.settings-option-row`, `.settings-timer-controls`, `.exam-mode-grid`, `.modal-two-col-row`, `.manage-subject-merge-row`).
2. `css/style.css`: Bổ sung khối `PHASE 2Q: FULL MOBILE AUDIT (PORTRAIT 375/390 & LANDSCAPE 667/844)` ở cuối file (chỉ kích hoạt trên mobile media queries, không đụng Desktop).
3. `js/app.js`: Cập nhật `closeAllCyberDropdowns()` và `_openCyberDropdown()` để tự động căn phải (`align-right`) khi menu sát mép phải viewport.
4. `js/ascii-bg.js`: Thêm `isDesktopViewport()`, căn giữa + chuẩn hóa tỷ lệ khung an toàn cho cả 3 cảnh trên mobile dọc/ngang, giảm mật độ cell mobile (`4.2x7.4`), và thêm cơ chế nhường blit khi vuốt cuộn chạm mà vẫn giữ `DPR = 1` và `30 FPS`.
5. `tests/test-runner.js`: Bổ sung **Test Suite 48** (33 assertions).
6. `docs/promt/promt2q.md` & `docs/progress/progress2q.md`: Hồ sơ đặc tả & tiến độ Đợt 2q.
