# ĐẶC TẢ YÊU CẦU ĐỢT 2Q (`docs/promt/promt2q.md`)
> **Nhánh thực hiện**: `fix/mobile-full-audit` (tách từ `main`)  
> **Phạm vi**: `index.html`, `css/style.css`, `js/app.js`, `js/ascii-bg.js`, `tests/test-runner.js`, `docs/promt/promt2q.md`, `docs/progress/progress2q.md`

---

## Mục Tiêu Tổng Quan
Thực hiện tổng kiểm tra toàn diện (Full Mobile Audit) trên trình duyệt thực tế và mã nguồn cho toàn bộ ứng dụng **TinhMinhLaKey** ở cả 2 chế độ màn hình nhỏ:
- **Mobile dọc (Portrait)**: `375x667` (iPhone SE) và `390x844` (iPhone 14).
- **Mobile xoay ngang (Landscape)**: `667x375` và `844x390`.

Sửa tận gốc toàn bộ lỗi tràn ngang (`scrollWidth > clientWidth`), chồng lấn (`overlap`), cắt chữ, che khuất nút bấm bởi `#mobile-bottom-nav` hoặc `.toast-container`, vùng chạm dưới 40px, và căn chỉnh/hiệu năng nền ASCII 3D trên mobile mà **không làm ảnh hưởng layout Desktop**.

---

## Kết Quả Audit & Nguyên Nhân Gốc Theo Từng Màn Hình

### 0. Lỗi Toàn Cục (Toasts, Dock Xoay Ngang, Mobile-Native Platform)
1. **Thông báo `.toast` đè lên `#mobile-bottom-nav` (375x667, 390x844) & tràn mép trái `-3.2px` (844x390)**
   - **Root Cause**: `.toast-container` cố định `bottom: 24px; right: 24px;` không có phần bù cho thanh điều hướng dưới đáy (64px + safe-area) ở chế độ dọc, cũng không chừa lề trái cho thanh dock 64px ở chế độ xoay ngang.
2. **Thanh dock trái `#mobile-bottom-nav` bị tràn chiều cao `+16.4px` và sai màu theme `ascii` ở `844x390`**
   - **Root Cause**: Rule `height: 100dvh; padding: 8px 6px` thiếu `box-sizing: border-box` khiến chiều cao thực tế `406.4px > 390px`. Ngoài ra, biến `--bnav-*` và rule theme `ascii` chỉ bọc trong `@media (max-width: 840px)`, bỏ sót iPhone 14 xoay ngang rộng `844px`.
3. **Thiếu cấu hình cảm ứng/viewport chuẩn mobile-native**
   - **Root Cause**: Thiếu `scroll-padding-bottom` trên `html`, thiếu `-webkit-text-size-adjust: 100%`, thiếu `touch-action: manipulation`, và các ô nhập số/text (`#import-prompt-count`, v.v.) dùng font `< 16px` dễ gây auto-zoom trên iOS Safari.

### 1. Trang Chủ (Dashboard / Hero)
1. **Cụm Topbar HUD `.topbar-hud-capsule` bị nút ASCII tràn viền trên mobile & vùng chạm nhỏ (`25.2–33.6px`)**
   - **Root Cause**: Ở `max-width: 767px`, vỏ capsule bị ép `height: 34px; padding: 3px`, trong khi `.ascii-scene-cycle-btn` giữ nguyên `32x32px`; chế độ landscape dùng `transform: scale(0.9)` làm co nhỏ và mờ icon. `#ascii-scene-popover` chưa giới hạn `max-height` khi xoay ngang `375px`.
2. **Thanh nhạc `#hero-lofi-bar` ép bẹp nút `.lofi-ctrl-btn` xuống `19.5x28px`**
   - **Root Cause**: Các nút `.lofi-ctrl-btn` không có `flex-shrink: 0` nên bị `.lofi-status-text` ép co chiều ngang trên 375px/390px.
3. **Nút hành động Hero & 4 thẻ thống kê bị che khuất/cắt nửa ở màn hình đầu (375x667, 667x375, 844x390)**
   - **Root Cause**: `.editorial-hero-stage` giữ `min-height` và padding lớn, `.hero-title` quá cao khi quote dài hoặc khi xoay ngang chỉ cao 375–390px; `.editorial-scroll-cue` (`37.2px`) và `#dashboard-subject-filters button` (`29.5px`) dưới 40px.

### 2. Bộ Thẻ (Decks), Ngân Hàng Câu Hỏi (Bank), Thống Kê (Stats) & Modals
1. **Tiêu đề bộ thẻ `.deck-name` bị bóp còn `61.5px` chiều rộng trên Mobile dọc (375x667, 390x844)**
   - **Root Cause**: `.deck-header` là flex không wrap (`justify-content: space-between`) với cụm badge môn học + nút xóa `flex-shrink: 0` chiếm ~185px. Nút phụ `.deck-actions .btn-secondary` chỉ cao `38px`.
2. **Dropdown `.cyber-dropdown-menu` trong `#view-bank` tràn mép phải `+32.3px` trên `667x375`**
   - **Root Cause**: `.cyber-dropdown-menu` neo cứng `left: 0; min-width: 230px;` mà `_openCyberDropdown()` chưa kiểm tra va chạm mép phải viewport (`rect.left + estimatedMenuWidth > window.innerWidth - 12`). Nút icon trong thẻ bank chỉ `34x34px`.
3. **Bảng "Hiệu suất theo từng Chủ đề" trong `#view-stats` không cuộn ngang tách biệt trên 375px/390px**
   - **Root Cause**: `<table>` dùng `width: 100%` không có `min-width` nên bị ép 5 cột vào `285.6px` (kéo bảng dài 892px), đồng thời `.sm2-stage-header` bị gãy dòng `"Đang / học"`.
4. **Modals (`#modal-edit-card`, `#modal-exam-setup`, `#modal-manage-subject`, `.modal-close`) chật hẹp trên Mobile dọc**
   - **Root Cause**: Grid 2 cột inline trong `#modal-edit-card` ép `#edit-card-topic` còn `103.7px`; grid radio trong `#modal-exam-setup` chật ở 375px; nút `.modal-close` inline `32x32px`.

### 3. Màn Hình Import / Dán Câu Hỏi AI (Wave 2p) & Import LMS
1. **Tap target & chống zoom iOS cho cụm Wave 2p (`#import-prompt-count`, "Dán mẫu thử", nút Lưu)**
   - **Root Cause**: `#import-prompt-count` dùng `font-size: 0.85rem` (< 16px); nút `"Dán mẫu thử"` có `padding: 4px 10px` (chiều cao ~28px < 40px); nút `"Lưu vào kho thẻ & Ôn tập"` không full-width trên mobile dọc; `#lms-batch-answers` gắn inline `min-width: 260px`.

### 4. Luyện Tập (Study), Thi Thử (Exam) & Flashcard
1. **Thanh header `.quiz-header-bar` bóp `.quiz-progress-track` còn `8–10px` & gãy dòng `"Đoán trước: Tắt"` (375x667, 390x844)**
   - **Root Cause**: Cả 4 thành phần (Thoát, thanh tiến độ, nút Đoán trước, bộ đếm) nằm chung 1 hàng flex không wrap trên bề rộng ~351px.
2. **Mặt sau Flashcard đè lên `#flashcard-srs-bar` (`+23.9px` ở `390x844`) & cắt đầu `"ĐÁP ÁN ĐÚNG"` (`667x375`, `844x390`)**
   - **Root Cause**: Lỗi độ ưu tiên CSS (specificity): `body.flashcard-active .flashcard-stage` (`0,2,1`) và `body.flashcard-active .flashcard-face` (`0,2,1`) ở CSS cũ ép chiều cao cứng `310px` (dọc) / `240px` (ngang) và `100dvh; overflow: hidden`, thắng rule `.flashcard-stage { height: auto }` (`0,1,0`) ở cuối file, trong khi `.flashcard-content-wrap { justify-content: center; overflow-y: auto }` cắt phần đầu nội dung tràn lên trên `scrollTop = 0`.
3. **Padding đáy màn hình Quiz dọc & header Exam `#exam-q-counter`**
   - **Root Cause**: `body.quiz-active .quiz-container` chỉ đặt `padding-bottom: 36px` (< `#mobile-bottom-nav`); `#exam-q-counter` bị bóp còn `74.1px` và gãy 2 dòng trên 375px/390px; `.btn-card-action` `34x34px` và `.exam-palette-btn` `36x36px` nhỏ hơn 40px.

### 5. Cài Đặt (Settings) & Nền ASCII 3D (`js/ascii-bg.js`)
1. **Tap target & wrap ở Settings (`#view-settings`)**
   - **Root Cause**: `.energy-node-btn` (`32px`) và `.ascii-scene-pill-btn` landscape (`28.8px`) dưới 40px; `#lofi-track-dropdown-wrap` đặt inline `min-width: 260px` và trigger cao `38.4px`; các hàng tùy chọn học tập chưa `flex-wrap: wrap`.
2. **Cân giữa, cắt viền & hiệu năng cuộn chạm của `js/ascii-bg.js` trên Mobile**
   - **Root Cause**:
     + `isDesktop = width > 840` nhận nhầm mobile xoay ngang `844x390` là Desktop (đẩy cảnh sang phải `0.70–0.74`).
     + `Cat Knight` không giới hạn theo bề rộng & vùng an toàn trên/dưới nên bị cắt mũi kiếm ở `y=0` và phần chân ở đáy trên cả 4 viewport.
     + `Gargantua` chỉ chia tỷ lệ theo chiều cao (`rows * 0.5`) nên 2 cánh đĩa bồi tụ bị xén mép trái/phải trên màn hình dọc hẹp `375px`/`390px`.
     + `Tree` xoay ngang chạm sát mép trên `y < 44px`; lưới cell mobile (`3.2x5.8`) dày hơn cả Desktop (`3.6x6.5`) và vẫn blit liên tục khi người dùng đang vuốt cuộn chạm.

---

## Tiêu Chuẩn Nghiệm Thu
1. Sửa tận gốc trong `index.html`, `css/style.css`, `js/app.js`, `js/ascii-bg.js` mà **giữ nguyên 100% layout Desktop**.
2. Kiểm tra trực tiếp trên trình duyệt local qua cả 4 viewport (`375x667`, `390x844`, `667x375`, `844x390`) + Desktop (`1280x800`): `scrollWidth <= clientWidth` trên mọi màn hình, không chồng lấn/cắt chữ/che nút.
3. Giữ nguyên `CONFIG.DPR = 1` và `CONFIG.FPS_LIMIT = 30` trong `js/ascii-bg.js`.
4. Bổ sung **Test Suite 48** trong `tests/test-runner.js`.
5. `node tests/test-runner.js` pass 100% (0 failed) và `node scripts/build.js` đóng gói thành công.
6. Tạo cặp tài liệu `docs/promt/promt2q.md` và `docs/progress/progress2q.md`, giữ toàn bộ thay đổi trên nhánh `fix/mobile-full-audit` (chưa merge vào `main`).
