# ĐẶC TẢ KỸ THUẬT ĐỢT 1Y (`promt1y.md`)
## Thêm Theme Mới **"ASCII Động"** (Giữ Chuẩn Liquid Glass), Mục Mở Rộng Chọn Animate ASCII & Hiệu Ứng **Cây Thông Noel 3D ASCII** Trên `<canvas>` (24 FPS, Dễ Nhìn, 0 Lag)

---

## 1. TỔNG QUAN KIẾN TRÚC & NGUYÊN TẮC THIẾT KẾ

1. **Giữ nguyên 100% ngôn ngữ thiết kế Liquid Glass hiện tại**:
   - Giao diện các thẻ (`.quiz-card`, `.bank-card-item`, `.app-sidebar`, popup modal, topbar pill) vẫn giữ nguyên kính mờ `backdrop-filter`, bo góc đồng tâm, tỷ lệ chữ và độ tương phản cao.
   - Theme mới **`ascii`** sử dụng bảng màu **Midnight Pine / Obsidian** (nền tối sâu `#070b0f`, chữ trắng sáng `#f1f5f9`, màu nhấn xanh ngọc/lá thông dịu mắt `#34d399` & `#10b981`) để đồng bộ với cây thông Noel ASCII phía sau mà không làm chói hay khó đọc câu hỏi.
2. **Tối ưu hiệu năng tuyệt đối (90–120 FPS cho UI)**:
   - Vẽ bằng **1 thẻ `<canvas id="ascii-bg-canvas">` duy nhất** đặt trong `#bg-layer` (`z-index: 0; pointer-events: none;`).
   - Khóa tốc độ vẽ nền riêng ở **24 FPS** (`~41.6ms/frame`) để vừa mượt mắt, vừa giảm tải tối đa cho GPU khi tính toán lớp mờ Liquid Glass phía trên.
   - Tự động tạm dừng vòng lặp `requestAnimationFrame` khi `document.hidden === true`, khi chuyển sang theme khác (`dark` / `bw` / `orange`), hoặc khi đang mở modal nặng (`document.body.classList.contains('modal-open')`).
   - Tự động co giãn mật độ lưới theo kích thước màn hình (Desktop & Mobile) và hỗ trợ `devicePixelRatio` vừa đủ (tối đa `1.5`) để sắc nét mà nhẹ máy.

---

## 2. MODULE ENGINE ASCII ĐỘNG (`js/ascii-bg.js`)

Tạo file mới `js/ascii-bg.js` (và nhúng `<script src="./js/ascii-bg.js"></script>` trước `js/app.js` trong `index.html`, cũng như thêm vào danh sách precache của `sw.js` và kiểm tra build trong `scripts/build.js`).

### 2.1. Cấu trúc Registry dễ mở rộng nhiều hiệu ứng
Thiết kế `window.AsciiBgEngine` theo mô hình danh sách preset (`PRESETS`), hiện tại có 1 preset mặc định là **`christmas-tree`**, sau này chỉ cần thêm key mới vào `PRESETS` là tự động hiển thị thêm option trong Cài đặt:

```javascript
const AsciiBgEngine = (() => {
  const PRESETS = {
    'christmas-tree': {
      id: 'christmas-tree',
      name: 'Cây Thông Noel 3D',
      icon: '🎄',
      description: 'Cây thông 3D xoay chậm cùng đèn nhấp nháy & tuyết rơi nhẹ'
    }
  };
  // ...
})();
```

### 2.2. Thuật toán Animate **Cây Thông Noel 3D ASCII** (Dễ nhìn, có chiều sâu & chuyển động liên tục)
Trong hàm render của preset `'christmas-tree'`:
1. **Lưới & Bố cục dễ nhìn**:
   - Kích thước ô chữ (`cellSize`): `14px` trên Desktop, `12px` trên Mobile; font `'JetBrains Mono', 'Fira Code', monospace`.
   - Cây thông đặt ở vùng **trung tâm-phải nhẹ** hoặc **giữa màn hình** (chiếm ~72% chiều cao viewport), với độ mờ tổng thể hài hòa (`alpha` khoảng `0.55–0.75` cho cây, `0.25–0.40` cho tuyết) + một lớp phủ gradient tối dịu ở `#bg-layer::after` để nội dung câu hỏi/flashcard phía trên luôn nổi bật, dễ đọc 100%.
2. **Hình học 3D xoay theo thời gian thực (`angle += 0.035` mỗi frame)**:
   - **Ngôi sao đỉnh cây** (`★` / `*` / `+`): Xoay và phát sáng nhịp nhàng (`pulse = 0.7 + 0.3 * sin(t * 3)`), màu vàng ấm `#fbbf24`.
   - **Tán lá thông 3D dạng tầng (multi-tiered cone)**:
     - Dùng phép chiếu 3D `(x, y, z) -> (screenX, screenY)` với Z-buffer (`zBuffer`) để mặt trước che mặt sau đúng chiều sâu thực.
     - Tạo **3–4 tầng tán lá** bằng cách biến thiên bán kính theo chu kỳ chiều cao `y` (`tierFactor = 0.75 + 0.25 * ((h * 4) % 1)`).
     - Chiếu sáng theo góc quay (`normal · lightDir`) để chọn ký tự đổ bóng từ tối đến sáng: `.,-~:;=!*#$@` với gam xanh thông dịu (`#065f46`, `#059669`, `#10b981`, `#34d399`).
   - **Dải đèn & Quả châu trang trí xoắn ốc quanh tán cây**:
     - Tính tọa độ xoắn ốc 3D `theta = y * 14 + angle` dọc thân nón; các điểm gần mặt trước hiển thị ký tự đèn/châu (`o`, `*`, `@`, `+`) đổi màu luân phiên đỏ ruby (`#f87171`), vàng ấm (`#fbbf24`), xanh băng (`#38bdf8`) và nhấp nháy nhẹ theo `sin(t * 4 + idx)`.
   - **Thân cây 3D** (`|#|` / `|||`): Màu nâu gỗ dịu (`#92400e` / `#b45309`) ở phần đáy.
   - **Tuyết ASCII rơi nhẹ toàn nền**:
     - ~45–60 hạt tuyết (`*`, `·`, `.`) trôi chéo nhẹ theo gió (`sin(t + seed)`), mật độ thưa và độ mờ thấp để tạo không khí Noel mà không gây rối chữ.

---

## 3. TÍCH HỢP THEME MỚI `"ascii"` & UI CÀI ĐẶT MỞ RỘNG

### 3.1. Định nghĩa Theme `"ascii"` trong `css/theme.css` & `css/style.css`
1. Thêm block `[data-theme="ascii"]` vào `css/theme.css`:
   - Kế thừa toàn bộ token Liquid Glass của theme tối (`--bg-base: #070b0f`, `--bg-surface: rgba(12, 18, 24, 0.62)`, `--bg-surface-elevated: rgba(18, 28, 36, 0.78)`).
   - Màu nhấn dịu mắt hợp Noel & terminal: `--accent: #34d399`, `--accent-strong: #10b981`, `--accent-glow: rgba(52, 211, 153, 0.32)`, `--border-color: rgba(52, 211, 153, 0.18)`.
   - Đảm bảo `#bg-layer.ascii-active` hiển thị `<canvas id="ascii-bg-canvas">` với nền `#070b0f` và lớp phủ vignette nhẹ để chữ câu hỏi luôn đạt độ tương phản cao.
2. **Đồng bộ trên mọi bộ chọn Theme (Topbar Pill & Settings)**:
   - Tại cụm chọn theme (Topbar Pill góc trên phải + phần Chọn Theme trong tab Cài đặt), bổ sung nút thứ 4 cho theme **`ASCII Động`** (icon `>_` hoặc `🎄` phong cách monochrome tối giản đồng bộ với 3 icon hiện có, giữ nguyên kích thước `32×32px` và `padding: 4px` đồng tâm).
   - Đảm bảo **giữ nguyên hoàn toàn** 3 theme cũ (`dark` / `bw` / `orange`) và hình nền mặc định của chúng; khi rời khỏi theme `ascii`, `AsciiBgEngine.stop()` tự động dừng canvas và khôi phục lại hình nền ảnh bình thường của theme đó.

### 3.2. Mục Setting Mở Rộng: **Tùy chọn Animate ASCII** (`index.html` & `js/app.js`)
Trong tab **Cài đặt (`#view-settings`)**, ngay bên dưới phần chọn Theme / Hình nền:
1. Thêm khối cài đặt mở rộng `#ascii-settings-panel` (mang phong cách thẻ Liquid Glass bo tròn, hiển thị rõ khi đang chọn theme `ascii` — hoặc có nhãn trạng thái gợi ý bật theme ASCII nếu đang ở theme khác):
   - **Danh sách chọn Animate ASCII (`#ascii-preset-grid`)**: Hiển thị dạng card chọn (hiện tại có 1 card active: **`🎄 Cây Thông Noel 3D`** kèm mô tả ngắn, thiết kế dạng lưới để dễ thêm Preset 2, 3... sau này).
   - **Thanh điều chỉnh độ nổi / độ mờ nền ASCII (`#ascii-opacity-slider`, mặc định `65%`)** và **nút bật/tắt Tuyết rơi** để người dùng tự tinh chỉnh mức độ dễ nhìn theo mắt mình.
2. **Lưu trạng thái bền vững vào IndexedDB (`db.setMeta`)**:
   - Lưu `theme: 'ascii'`, `asciiPreset: 'christmas-tree'`, `asciiOpacity: 0.65` vào `meta` store trong IndexedDB để khi F5 hoặc mở lại PWA, app tự khôi phục đúng theme và hiệu ứng ASCII đang chọn.

---

## 4. DANH SÁCH KIỂM THỬ BẮT BUỘC

1. **Chuyển theme qua lại mượt mà**: Chuyển `Tím Hồng` $\leftrightarrow$ `Trắng Đen` $\leftrightarrow$ `Trắng Cam` $\leftrightarrow$ `ASCII Động` không giật lag, không sót canvas khi chuyển sang 3 theme cũ, và bo góc topbar pill vẫn đều khít 4 phía.
2. **Hiệu năng & Khả năng đọc chữ**: Mở bài Quiz / Flashcard / Ngân hàng câu hỏi khi bật theme `ASCII Động` $\rightarrow$ Cây thông Noel 3D xoay mượt, đèn nhấp nháy & tuyết rơi nhẹ, chữ câu hỏi và đáp án trên thẻ Liquid Glass đọc rõ ràng, FPS UI ổn định.
3. **Lưu trữ & Build**: F5 tải lại trang giữ nguyên theme `ascii` và preset `christmas-tree`. Chạy `node tests/test-runner.js` và `node scripts/build.js` pass 100%.
