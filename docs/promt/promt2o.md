# ĐẶC TẢ YÊU CẦU ĐỢT 2O (`docs/promt/promt2o.md`)
> **Nhánh thực hiện**: `fix/settings-mobile-ascii` (tách từ `main`)  
> **Phạm vi**: `index.html`, `css/theme.css`, `css/style.css`, `js/app.js`, `tests/test-runner.js`

---

## Nhiệm Vụ 1: Thanh Trượt Theme Modes 4 Mốc & Đồng Bộ Liquid Glass Buồng Sóng Năng Lượng

### Nguyên Nhân Gốc Rễ (Root Cause)
1. Thanh trượt `#theme-energy-slider` trong `index.html` và `js/app.js` vẫn giữ cấu trúc 3 vùng cũ (2 cổng pha tại `33.333%`, `66.667%` và ngưỡng JS `33.5` / `66.5`), nên kéo hoặc bấm mốc thứ 4 (`ASCII 3D`) bị lệch pha so với 4 nút chọn theme phía dưới (`Tím Hồng`, `Trắng Đen`, `Trắng Cam`, `ASCII 3D`).
2. Vùng `.energy-slider-control-wrap` và cụm `.ascii-scene-settings-bar` / `.ascii-scene-pill-btn` trong `css/style.css` dùng màu nền tối/xám cứng (`rgba(0, 0, 0, 0.12)`, `rgba(28, 31, 39, 0.55)`, `#94a3b8`, `#cbd5e1`) thay vì biến CSS theo từng theme, gây mảng xám lạc tông khi chuyển sang `Trắng Cam` (`white-orange`) hay các theme khác.
3. Độ đặc hiệu CSS giữa `html[data-theme="white-orange"] .energy-wave-hud` và `html body .energy-wave-hud` khiến HUD buồng sóng không đồng bộ nhất quán qua biến CSS.

### Giải Pháp Triệt Để
- **Nâng thanh trượt lên đủ 4 mốc / 3 cổng pha**:
  + `index.html`: bố trí 3 cổng pha `#phase-gate-1` (`25%`), `#phase-gate-2` (`50%`), `#phase-gate-3` (`75%`); giá trị mặc định ban đầu của slider là `12.5` (`Năng lượng • 13%`).
  + `js/app.js`: bổ sung `_resolveEnergyThemeFromVal(val)` (4 vùng `<25`, `<50`, `<75`, `>=75`) và `_getEnergyMilestoneForTheme(theme)` (`12.5`, `37.5`, `62.5`, `87.5`). Cập nhật `syncThemeEnergyChamber`, `onThemeEnergySliderInput`, `onThemeEnergySliderCommit`, `selectThemeViaEnergyWave` và `_updateEnergyWaveVisuals` (đồng bộ cả 3 cổng pha, chữ `%` qua `#energy-wave-badge-text`, tiêu đề `ASCII 3D (Terminal Matrix)`, lưu và khôi phục `localStorage` cho cả 4 theme, và giữ hình nền người dùng khi vào `ascii`).
- **Đồng bộ biến CSS Liquid Glass 4 theme**:
  + `css/theme.css`: bổ sung đầy đủ bộ token `--energy-control-bg`, `--energy-control-border`, `--energy-node-*`, `--ascii-bar-*`, `--ascii-pill-*` cho cả 4 theme (`violet-rose`, `monochrome`, `white-orange`, `ascii`), dẫn xuất từ `var(--surface-...)`, `var(--glass-...)`, `var(--text-...)`, `var(--accent...)`.
  + `css/style.css`: thay toàn bộ màu cứng trên `.energy-slider-control-wrap`, `.energy-node-btn`, `.energy-wave-hud`, `.ascii-scene-settings-bar`, `.ascii-scene-settings-label`, `.ascii-scene-pill-btn` sang biến CSS theo theme.

---

## Nhiệm Vụ 2: Logic Hiển Thị Thông Minh Cụm "Chế Độ Phát Hoạt Ảnh ASCII 3D"

### Yêu Cầu & Thiết Kế
1. Khi đang ở theme `ascii` (`.is-ascii-active`): cụm 4 nút chọn cảnh (`Slideshow tự chuyển`, `Cây thông Noel`, `Hố đen Gargantua`, `Hiệp sĩ Mèo`) hiển thị đầy đủ ngay dưới thanh theme.
2. Khi đang ở 3 theme còn lại (`.is-ascii-inactive`): cụm chọn cảnh thu gọn sạch sẽ thành thanh tiêu đề bấm mở nhanh `#ascii-scene-bar-toggle` (`.is-expanded`) với độ mờ nhẹ (`opacity: 0.78`), giữ giao diện Cài đặt gọn gàng.
3. Khi bấm chọn trực tiếp bất kỳ cảnh nào qua `App.setAsciiScenePreset(preset)`: hệ thống tự động gọi `setTheme('ascii', { syncDefaultBg: false })` + `triggerThemeWaveTransition('ascii')`, khởi chạy hoạt ảnh và phát đúng cảnh vừa chọn ngay lập tức, đồng thời mở đầy đủ thanh điều khiển ASCII và icon nhanh trên topbar.

---

## Nhiệm Vụ 3: Sửa Triệt Để Responsive Mobile Dọc & Xoay Ngang

### 1. Mobile Dọc (`<= 768px` và `<= 480px`)
- Trên `<= 480px` (iPhone SE `375px`): chuyển `.energy-nodes-row` sang lưới 2×2 (`grid-template-columns: repeat(2, 1fr)`), và lưới 2 cột cho `.ascii-scene-pill-group` khi mở, không cắt mất nút `ASCII 3D`.
- Trên `<= 768px`: tháo giới hạn chiều cao cứng `84px` khỏi `.energy-wave-stage` (`height: auto; max-height: none;`) để sóng SVG (`74px`) hiển thị tách biệt dưới HUD; gỡ `white-space: nowrap; text-overflow: ellipsis` ở `#energy-wave-mode-title` / `.energy-wave-title` và áp dụng `min-width: 0`, `overflow-wrap: break-word` để tên theme không bị cắt cụt (`ASCII Gián...`).

### 2. Mobile Xoay Ngang (`orientation: landscape` và `max-height: 500px` / `550px`)
- **Sidebar bên trái**: thêm nút logo thương hiệu `.bottom-nav-brand` (`./meo.png`) ở đỉnh thanh dock trái `#mobile-bottom-nav`; đặt `justify-content: flex-start` (không căn giữa gây tràn khuất đỉnh khi cuộn), `overflow-y: auto` kèm ẩn scrollbar (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`), `overscroll-behavior: contain` và thu gọn padding/gap (`42px`/`38px`, gap `6px`) để logo và cả 5 nút điều hướng luôn hiển thị đầy đủ ở chiều cao `375px` (`667×375`). Đồng thời thu gọn & bật `overflow-y: auto` ẩn thanh cuộn cho `#app-sidebar` khi chiều cao thấp (`<= 620px`).
- **Thanh filter môn học phía trên**: ép `justify-content: flex-start !important` (tuyệt đối không `justify-content: center` trên vùng `overflow-x: auto`), dùng `padding-inline: 10px` và `scroll-padding-inline: 10px`, `flex: 0 0 auto; flex-shrink: 0` cho các pill (`.subject-jump-pill`, `.dashboard-subject-pill`, `.topic-filter-chip`) và xếp dọc `.decks-subject-quickbar` trên màn hình thấp để thanh filter không bị cắt xén mép trái khi cuộn ngang.

---

## Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ các suite (bao gồm Suite 46 mới) pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công PWA Offline không lỗi cú pháp.
