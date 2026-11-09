# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1I — ĐẠI PHẪU KIẾN TRÚC THEO `ARCHITECTURE_GRAPH.md`: XÂY LẠI TỪ GỐC CHẾ ĐỘ HỌC THEO MÔN/CHƯƠNG, THẤU KÍNH LỒI LIQUID GLASS (`<feDisplacementMap>`), FLASHCARD ĐẶC KHÔNG LỘ ĐÁP ÁN, KHÔI PHỤC KHUNG INPUT DARK MODE & HỆ THỐNG ÂM THANH MARIMBA HIỆN ĐẠI (promt1i.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
>
> * **Phiên bản đặc tả:** `1i` (Nối tiếp sau `1a` -> `1h`, tham chiếu trực tiếp bản đồ `docs/ARCHITECTURE_GRAPH.md`)
>
> * **Mục tiêu cốt lõi:** Xử lý triệt để **21 vấn đề tồn đọng** qua 4 nhóm (`1. Chung` — 13 mục, `2. Mode Trắng Cam` — 5 mục, `3. Dark Mode nói chung` — 2 mục, `4. Mode Trắng Đen` — 1 mục), đồng thời tạo mới Skill chuyên biệt `.agent/skills/liquid-glass-refraction/SKILL.md` và cập nhật lại `docs/ARCHITECTURE_GRAPH.md`.
>
> * **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>
>   1. **Zero Data Loss:** Bảo toàn 100% dữ liệu IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>
>   2. **Single Canonical Implementation:** Khi sửa bất kỳ tính năng nào (đặc biệt là Chế độ 5 Ôn theo môn/chương, Flashcard, Icon Sidebar/BottomNav), **phải tìm và xóa sạch toàn bộ các hàm/rule trùng lặp** ở cuối `js/app.js` (`L6600-7050`) và `css/style.css` trước khi viết bản chuẩn duy nhất.
>
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

## PHẦN 0: BÓC TÁCH NGUYÊN NHÂN GỐC RỄ TỪ `ARCHITECTURE_GRAPH.md` & 6 ẢNH CHỤP MÀN HÌNH

Nhờ đối chiếu file `docs/ARCHITECTURE_GRAPH.md` mà Agent vừa xuất ra ở đợt `1h` cùng 6 ảnh chụp màn hình mới nhất (`image_392a39.jpg` đến `image_3841c0.jpg`), chúng ta đã bắt tận tay **8 lỗi kiến trúc chéo** khiến các bản vá trước đây bị vô hiệu hóa:

1. **Tại sao Chế độ 5 ("Học theo chương / môn học") sửa bao nhiêu lần vẫn lỗi (`Mục 1.1`)?**

   * Nhìn vào `ARCHITECTURE_GRAPH.md` (Phần 1 & Phần 2):

     * File `js/app.js` đã phình lên tới **7.050 dòng** (`L6640-7050` là các hàm được Agent nối thêm vào cuối file qua từng đợt), dẫn đến **nhiều hàm `openTopicPickerModal`, `startTopicReview`, `startSubjectSession` bị định nghĩa chồng chéo nhau** ở dòng `~1633`, `~3147` và `~6700`!

     * Tệ hơn nữa, ở Phần 2 của `ARCHITECTURE_GRAPH.md` (`Study Mode Cards | index.html#L330-370 | App.startSession(deckId, mode)`): thẻ Mode 5 ở trang chủ đang gọi `App.startSession(null, 'topic')` mà không truyền `options.topics`. Khi vào `startSession`, nhánh `else if (mode === 'topic')` thấy `options.topics` rỗng nên trả về `cards = []`, báo lỗi `"Không tìm thấy câu hỏi phù hợp"` rồi thoát luôn thay vì mở Modal chọn Môn & Chương!

2. **Tại sao Mặt trước của Flashcard bị lộ mờ luôn cả Đáp án mặt sau (`image_392a39.jpg`), Light Mode vẫn dùng nền đen của Dark Mode (`image_392a1e.jpg`), và bấm mức độ hiểu bị biến mất rồi mới lật sang câu mới (`Mục 1.5, 1.6, 1.8, 2.4`)?**

   * **Lỗi lộ đáp án (`image_392a39.jpg`):** Do gộp chung `.flashcard-face` vào nhóm thẻ kính mờ bán trong suốt (`opacity < 1` + `backdrop-filter`). Trong không gian 3D (`transform-style: preserve-3d`), khi mặt trước (`.flashcard-front`) bán trong suốt, mặt sau (`.flashcard-back`) nằm ngay phía sau lưng sẽ hiện xuyên qua mặt trước!

   * **Lỗi Light Mode dùng nền đen (`image_392a1e.jpg`):** Trong `css/style.css` dòng `2746`, `2765`, `3919`, `3924`, `.flashcard-front` và `.flashcard-back` bị gán cứng `#1a1829` và `rgba(22, 21, 34, 0.92) !important`.

   * **Lỗi biến mất rồi mới lật khi bấm mức độ hiểu (`Mục 1.5`):** Trong `rateFlashcard()`, code đợt `1h` dùng `setTimeout(..., 145)` với class `.switching-out` (`opacity: 0` làm thẻ biến mất!), sau đó gỡ `.flipped` trong khi `transition: transform 0.44s` vẫn đang bật, khiến thẻ mới vừa hiện ra lại vừa tự quay lật một vòng!

3. **Tại sao Icon "Cài đặt" ở Sidebar Desktop và Icon "Ngân hàng / Bộ thẻ" ở Thanh Mobile dưới cùng vẫn bị tô đặc thành cục vuông (`image_38bd7b.png` — Mục 1.2 & 1.11)?**

   * Trong `css/theme.css` hoặc cuối `css/style.css` có một rule gán `fill: currentColor !important` lên `svg *` khi nút ở trạng thái `.active` (hoặc trên icon cài đặt). Vì icon Ngân hàng và Bộ thẻ có khung ngoài là `<rect width="18" height="18">`, còn icon Cài đặt có đường bao bánh răng `<path>`, việc gán `fill: currentColor` làm toàn bộ `<rect>` và `<path>` bị đổ đặc màu trắng/cam!

4. **Tại sao một số khung Input trong Dark Mode bị biến mất hoàn toàn (`Mục 3.1`: Ô tìm kiếm Ngân hàng câu hỏi; Tên bộ thẻ mới, Mô tả, Dán dữ liệu JSON trong Dán AI; Dán văn bản trong Dán LMS)?**

   * Khi đổi `.form-control, input, textarea` sang dùng `background: var(--input-bg) !important; border: 1.5px solid var(--input-border) !important;`, biến `--input-bg` và `--input-border` bị thiếu trong `:root` / Dark Mode hoặc có độ mờ quá thấp (`rgba(255,255,255,0.04)`), khiến các ô nhập liệu chìm nghỉm vào nền tối và mất hẳn khung viền!

5. **Tại sao Font chữ đen của Quote ở Mode Trắng Cam sửa 4 lần vẫn chưa đổi (`Mục 2.5`)?**

   * Nhìn vào dòng cuối cùng của `ARCHITECTURE_GRAPH.md` do chính Agent viết:
     `Montserrat 900 Black cho Chữ Quote To bản; Newsreader / PT Serif weight 600 đứng thẳng cho chữ quote phụ ở Trắng Cam`.

   * Agent đã hiểu nhầm yêu cầu: Agent giữ nguyên font không chân `Montserrat 900 Black` cho chữ Quote to bản (`.hero-title-main`, `.hero-title-sub`) và chỉ đổi font có chân cho dòng mô tả nhỏ bên dưới (`.hero-desc`)! Trong khi yêu cầu của người dùng là **đổi chính các chữ màu đen to đùng trong câu Quote (`#hero-title .hero-title-main`, `#hero-title .hero-title-sub`) ở Mode Trắng Cam sang font chữ có chân thẳng (`PT Serif` / `Newsreader`)**!

## PHẦN 1: TẠO SKILL CHUYÊN MÔN `.agent/skills/liquid-glass-refraction/SKILL.md` & TRIỂN KHAI HIỆU ỨNG KÍNH LỒI BÓP MÉO VIỀN CHO POPUP & SIDEBAR (MỤC 1.4, 1.9, 1.12, 2.1, 2.2)

### 1.1. Nghiên cứu chuyên sâu: Làm sao để Popup có không gian bên trong bị bóp méo, cong lồi ở các viền như Ảnh 5 (`image_38cc82.jpg`)?

Quan sát kỹ Ảnh 5 (`image_38cc82.jpg` — "Yeasy Run 29.60 KM / Contact time 270 MS"):

* Một tấm kính phẳng thông thường chỉ có `backdrop-filter: blur(...)` đồng nhất từ tâm ra rìa.

* Ngược lại, **Thấu Kính Lồi Chất Lỏng (3D Convex Meniscus Liquid Glass — chuẩn Apple iOS 26 / visionOS)** có độ dày vật lý cong tròn ở mép viền (`bezel curvature`). Khi ánh sáng từ hình nền phía sau đi qua vùng mép cong (`22px` tính từ viền vào trong), tia sáng bị **bẻ cong (khúc xạ / refraction) và kéo giãn theo hướng pháp tuyến của đường viền bo tròn**, kèm theo hiện tượng **tán sắc nhẹ ở rìa (chromatic rim)** và **phản xạ gương cạnh đón sáng (`specular highlight`)**.

* **Giải pháp kỹ thuật chạy trực tiếp trên trình duyệt Chromium/Edge/WebKit với 140+ FPS (Không cần phần mềm thứ 3):**
  Kết hợp **2 tầng quang học**:

  1. **Tầng 1 — Bộ lọc Khúc xạ Thấu kính Lồi SVG (`<svg><filter id="liquid-convex-lens">` với `<feDisplacementMap>`):**

     * Khi ứng dụng khởi chạy, một hàm JS siêu nhẹ (`initLiquidGlassLensFilter()`) vẽ một **Bản đồ Dịch chuyển Pháp tuyến Lồi (Radial Bezel Normal Map)** kích thước `256x256` trên `<canvas>`:

       * Vùng trung tâm (`72%` diện tích giữa popup): màu xám trung tính `rgb(128, 128, 128)` -> Độ dịch chuyển bằng `0`, giúp chữ và nút bấm bên trong popup thẳng nét 100%, không bị méo chữ.

       * Vùng vành mép cong (`28%` sát 4 cạnh và 4 góc bo tròn): kênh Đỏ (`R`) và Xanh lá (`G`) biến thiên mượt theo hàm mũ bậc 3 (`Math.pow(edgeRatio, 3)`) đẩy tia sáng cong lồi ra sát mép viền!

     * Bản đồ này được nạp vào `<feImage>` -> `<feDisplacementMap scale="34" xChannelSelector="R" yChannelSelector="G"/>` kết hợp `<feGaussianBlur stdDeviation="14"/>` và `<feColorMatrix type="saturate" values="1.85"/>`.

  2. **Tầng 2 — Vành Thấu Kính Kép CSS (`::before` Convex Meniscus Rim Ring):**

     * Tạo một lớp vành kính nổi `::before` chạy dọc theo chu vi bên trong của `.modal-box` và `.app-sidebar` với `padding: 14px` và `mask-composite: exclude` (chỉ giữ lại vành rộng `14px` sát mép viền), áp dụng `backdrop-filter: blur(6px) saturate(220%) contrast(118%) brightness(1.06)` và hệ thống bóng khúc xạ 5 lớp:
       `box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.92), inset 2px 0 3px rgba(255, 255, 255, 0.65), inset 0 -2px 4px rgba(255, 255, 255, 0.35), inset 0 0 22px rgba(255, 255, 255, 0.28)`!

     * Nhờ sự chênh lệch chiết suất giữa **Vành ngoài (`14px` sát viền — độ trong cao, bẻ cong ảnh nền)** và **Lõi trong (độ mờ sâu `blur(48px)`)**, mắt người nhìn vào sẽ thấy phần không gian sát mép viền popup uốn cong và lồi hẳn lên như một giọt thủy tinh dày đúng như Ảnh 5 (`image_38cc82.jpg`)!

### 1.2. Tạo Skill chuyên môn `.agent/skills/liquid-glass-refraction/SKILL.md` (và bản sao tại `.claude/skills/liquid-glass-refraction/SKILL.md`)

AI Agent **BẮT BUỘC** tạo file `.agent/skills/liquid-glass-refraction/SKILL.md` (và `.claude/skills/liquid-glass-refraction/SKILL.md`) chứa quy chuẩn và đoạn code khởi tạo bộ lọc SVG `<feDisplacementMap>` + CSS Meniscus Rim dưới đây, sau đó kích hoạt ngay trong `js/app.js` và `css/theme.css`:

```
// Hàm khởi tạo Bộ lọc Thấu kính Lồi Quang học (Thêm vào js/app.js và gọi trong App.init())
initLiquidGlassLensFilter() {
  if (document.getElementById('liquid-glass-svg-defs')) return;
  try {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    // Tạo trường vector khúc xạ vành thấu kính lồi (Convex Meniscus Bezel)
    const rimWidth = 0.24; // 24% vành ngoài bị uốn cong như thấu kính lồi
    for (let y = 0; y < size; y++) {
      const ny = (y / (size - 1)) * 2 - 1; // -1 .. 1
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2 - 1; // -1 .. 1
        // Khoảng cách Signed Distance tới đường viền bo góc (Squircle / Rounded Rect)
        const ax = Math.abs(nx);
        const ay = Math.abs(ny);
        const dist = Math.pow(Math.pow(ax, 4) + Math.pow(ay, 4), 0.25);

        let r = 128;
        let g = 128;
        if (dist > 1 - rimWidth) {
          const t = Math.min(1, (dist - (1 - rimWidth)) / rimWidth);
          // Đường cong khúc xạ bậc 3 tạo hiệu ứng mép kính lồi
          const curve = Math.pow(t, 2.6);
          r = Math.round(128 + nx * curve * 120);
          g = Math.round(128 + ny * curve * 120);
        }
        const idx = (y * size + x) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const mapUrl = canvas.toDataURL('image/png');

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'liquid-glass-svg-defs';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;z-index:-1;';
    svg.innerHTML = `
      <defs>
        <filter id="liquid-convex-lens" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feImage href="${mapUrl}" result="lensMap" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="32" xChannelSelector="R" yChannelSelector="G" result="refracted" />
          <feGaussianBlur in="refracted" stdDeviation="16" result="blurred" />
          <feColorMatrix in="blurred" type="saturate" values="1.85" result="saturated" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  } catch (e) {
    console.warn('Liquid glass SVG filter fallback to CSS blur:', e);
  }
},

```

Và CSS áp dụng cho **Popup (`.modal-box`)** và **Sidebar (`.app-sidebar` — Mục 1.9 & 1.12)**:

```
/* Popup (.modal-box): Thấu kính lồi khúc xạ viền + Vành Meniscus 3D như Ảnh 5 (image_38cc82.jpg) */
.modal-box {
  position: relative !important;
  background: var(--modal-convex-bg) !important;
  backdrop-filter: url(#liquid-convex-lens) blur(32px) saturate(190%) !important;
  -webkit-backdrop-filter: url(#liquid-convex-lens) blur(32px) saturate(190%) !important;
  border-radius: 32px !important;
  border: 1.5px solid var(--modal-convex-border) !important;
  box-shadow:
    inset 0 2.5px 4px rgba(255, 255, 255, 0.88),
    inset 2px 0 3px rgba(255, 255, 255, 0.55),
    inset 0 -2.5px 5px rgba(255, 255, 255, 0.28),
    inset 0 0 28px rgba(255, 255, 255, 0.22),
    0 28px 64px -12px rgba(0, 0, 0, 0.45) !important;
}

/* Vành kính lồi Meniscus chạy dọc mép trong của Popup tạo độ cong quang học */
.modal-box::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  padding: 12px !important;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    rgba(255, 255, 255, 0.04) 65%,
    rgba(255, 255, 255, 0.38) 100%
  ) !important;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask-composite: exclude !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

/* Mục 1.12: Biến Sidebar (.app-sidebar) thành Kính Mờ Đục Trong Suốt (Frosted Liquid Glass), KHÔNG PHẢI MÀU TRƠN! */
.app-sidebar {
  background: var(--sidebar-glass-bg) !important;
  backdrop-filter: blur(38px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(38px) saturate(190%) !important;
  border: 1.5px solid var(--sidebar-glass-border) !important;
  box-shadow:
    inset 0 2px 3px rgba(255, 255, 255, 0.60),
    inset -1.5px 0 2px rgba(255, 255, 255, 0.30),
    0 18px 42px -10px rgba(0, 0, 0, 0.28) !important;
}

```

Trong đó giá trị `--sidebar-glass-bg` và `--modal-convex-bg` trong `css/theme.css`:

* `purple-pink`:
  `--sidebar-glass-bg: linear-gradient(160deg, rgba(42, 32, 68, 0.54) 0%, rgba(24, 18, 42, 0.46) 100%);`
  `--modal-convex-bg: linear-gradient(145deg, rgba(44, 34, 72, 0.72) 0%, rgba(24, 18, 42, 0.64) 100%);`

* `monochrome`:
  `--sidebar-glass-bg: linear-gradient(160deg, rgba(38, 38, 44, 0.54) 0%, rgba(20, 20, 24, 0.46) 100%);`
  `--modal-convex-bg: linear-gradient(145deg, rgba(40, 40, 46, 0.72) 0%, rgba(20, 20, 24, 0.64) 100%);`

* `white-orange`:
  `--sidebar-glass-bg: linear-gradient(160deg, rgba(255, 252, 248, 0.58) 0%, rgba(255, 237, 213, 0.46) 100%);`
  `--modal-convex-bg: linear-gradient(145deg, rgba(255, 253, 250, 0.76) 0%, rgba(254, 243, 231, 0.66) 100%);`

## PHẦN 2: GIẢI QUYẾT DỨT ĐIỂM CÁC MỤC CÒN LẠI TRONG NHÓM 1 (`1. CHUNG`)

### Mục 1.1: Xóa sạch các bản vá rời rạc cũ & Xây lại từ gốc Chế độ "Ôn theo môn học & chương" (Mode 5 & Nút "Ôn cả môn")

1. **Bước 1 — Dọn dẹp triệt để trong `js/app.js`:**

   * Mở `js/app.js`, tìm tất cả các hàm có tên `openTopicPickerModal`, `renderTopicPickerModalContent`, `toggleTopicSelection`, `toggleAllTopicsInPicker`, `startTopicReview`, `startSubjectSession` ở khắp file (đặc biệt kiểm tra cả vùng dòng `1630–1740`, `3145–3190`, và vùng cuối file `6600–7050`).

   * **Xóa bỏ toàn bộ các bản trùng lặp**, chỉ giữ lại **1 định nghĩa duy nhất** cho mỗi hàm.

2. **Bước 2 — Chặn lỗi gọi `App.startSession(null, 'topic')` từ `index.html#L330-370`:**

   * Ngay dòng đầu tiên của hàm `async startSession(deckId, mode = 'srs', options = {})`:

     ```
     async startSession(deckId, mode = 'srs', options = {}) {
       // Nếu gọi mode 'topic' mà chưa truyền danh sách chương/chủ đề -> Mở ngay Modal Chọn Môn & Chương!
       if (mode === 'topic' && (!options || !Array.isArray(options.topics) || options.topics.length === 0)) {
         return this.openTopicPickerModal(deckId, options?.subjectId || null);
       }
     
     ```

   * Đồng thời kiểm tra thẻ Mode 5 trong `index.html`: gắn rõ `onclick="App.openTopicPickerModal()"` và đảm bảo không có phần tử con nào chặn sự kiện click.

3. **Bước 3 — Hoàn thiện luồng Chọn Môn Học & Chương trong `#modal-topic-picker`:**

   * Trong `openTopicPickerModal(deckId = null, preselectedSubjectId = null)`:

     * Hiển thị thanh chọn **Môn học** (`Tất cả môn`, các môn học hiện có, và `Chưa phân loại`).

     * Thêm ngay nút **`"Ôn toàn bộ môn đang chọn"`** bên cạnh thanh chọn môn để người dùng muốn học cả môn có thể vào học ngay lập tức chỉ với 1 cú nhấp chuột!

     * Bên dưới hiển thị danh sách tất cả các **Chương (`topic`)** của môn đang chọn (lấy qua `db.getAllTopics(deckId, subjectFilter)` đã sửa ở `1h` để lấy cả theo `card.subjectId` lẫn `deck.subjectId`).

     * Khi bấm **`"Bắt đầu ôn tập"`** (`startTopicReview()`):

       * Nếu người dùng đã chọn $\ge 1$ chương: lấy toàn bộ câu hỏi thuộc các chương đó và vào học ngay.

       * Nếu người dùng **chưa tích chọn chương nào** nhưng đã bấm `"Bắt đầu ôn tập"`: **tự động lấy toàn bộ câu hỏi của môn học đang chọn** (hoặc toàn bộ kho thẻ nếu đang ở `Tất cả môn`) và bắt đầu phiên học ngay lập tức — **tuyệt đối không bao giờ hiện thông báo lỗi chặn người dùng**!

### Mục 1.2 & 1.11: Sửa dứt điểm lỗi Icon "Cài đặt" ở Sidebar Desktop & Icon "Ngân hàng / Bộ thẻ" ở Thanh Mobile dưới cùng (`image_38bd7b.png`)

1. **Trong `css/style.css` và `css/theme.css`:**

   * Tìm và **XÓA BỎ HOÀN TOÀN** bất kỳ đoạn CSS nào gán `fill: currentColor` hoặc `background: var(--accent)` lên `.nav-item svg`, `.nav-item.active svg`, `.bottom-nav-item svg`, `.bottom-nav-item.active svg` (hoặc `svg *`).

   * Đặt đoạn CSS khóa bảo vệ sau vào cuối cùng của `css/theme.css`:

     ```
     /* KHÓA BẢO VỆ ICON SIDEBAR DESKTOP & BOTTOM NAV MOBILE — TUYỆT ĐỐI KHÔNG BỊ TÔ ĐẶC CỤC VUÔNG */
     .app-sidebar .nav-item svg,
     .app-sidebar .nav-item svg *,
     .app-sidebar .nav-item.active svg,
     .app-sidebar .nav-item.active svg *,
     .bottom-nav .bottom-nav-item svg,
     .bottom-nav .bottom-nav-item svg *,
     .bottom-nav .bottom-nav-item.active svg,
     .bottom-nav .bottom-nav-item.active svg * {
       fill: none !important;
       background: transparent !important;
       stroke: currentColor !important;
       stroke-width: 2px !important;
       stroke-linecap: round !important;
       stroke-linejoin: round !important;
     }
     
     .app-sidebar .nav-item button svg,
     .bottom-nav .bottom-nav-item svg {
       width: 20px !important;
       height: 20px !important;
       min-width: 20px !important;
       min-height: 20px !important;
       flex-shrink: 0 !important;
       display: block !important;
     }
     
     ```

2. **Trong `index.html` (dòng `103–108` ở `.app-sidebar` và dòng `1429–1432` ở `.bottom-nav`):**

   * Kiểm tra thẻ `<li class="nav-item" data-view="settings">` và `<button class="bottom-nav-item" data-view="settings">`, đảm bảo bên trong chỉ có duy nhất 1 thẻ `<svg>` bánh răng chuẩn (không bị lồng 2 thẻ `<svg>` hay chèn ký tự lạ):

     ```
     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <circle cx="12" cy="12" r="3" fill="none"></circle>
       <path fill="none" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
     </svg>
     
     ```

### Mục 1.3: Phóng to & Tối ưu hiển thị Công thức Toán LaTeX (`image_3841c0.jpg`) + Tự động sửa lỗi nuốt ký tự `\theta`, `\frac`, `\beta`

1. **Trong `css/style.css` và `css/theme.css`:**

   * Xóa bỏ hoàn toàn các rule thu nhỏ công thức `.katex-scaled-down`, `.katex-scaled-down-1`, `.katex-scaled-down-2` (`0.88em` / `0.82em` tại dòng `2160–2169` `css/style.css`).

   * Tăng kích thước công thức toán và độ thoáng của ô đáp án:

     ```
     .katex {
       font-size: 1.22em !important;
       line-height: 1.5 !important;
     }
     .quiz-question-text .katex,
     .flashcard-question-text .katex,
     .flashcard-answer-text .katex {
       font-size: 1.26em !important;
     }
     .quiz-option-content .katex {
       font-size: 1.20em !important;
     }
     /* Giúp tử số và mẫu số của phân số (\frac) luôn to rõ, không bị lí nhí */
     .katex .mfrac .mtight {
       font-size: 0.90em !important;
     }
     .quiz-option-btn {
       min-height: 62px !important;
       padding: 16px 22px !important;
       line-height: 1.6 !important;
     }
     
     ```

2. **Trong `js/app.js` (hàm `renderLatexText(text)` dòng `287` và `adaptOptionsLayout` dòng `2080`):**

   * Trong `adaptOptionsLayout`: Tắt hẳn việc gán class `.katex-scaled-down` (nếu công thức dài thì tự động chuyển lưới đáp án sang 1 cột dọc `.layout-single-column` để có toàn bộ chiều ngang màn hình thay vì ép nhỏ chữ!).

   * Trong `renderLatexText(text)`: Khôi phục các ký tự LaTeX bị `JSON.parse` biến thành ký tự điều khiển (`\t` + `heta` -> `\theta`, `\f` + `rac` -> `\frac`, `\b` + `eta` -> `\beta`, `\r` + `ho` -> `\rho`) và tự động nâng `\frac{` thành `\dfrac{` để phân số luôn hiển thị kích thước đầy đủ!

### Mục 1.4, 1.10, 2.1, 2.2, 2.3: Tăng Độ Mờ Đục (Heavy Frosted Opacity) Của Các Khối Ở Trạng Thái Nghỉ -> Trỏ Vào Thì Trong Suốt Nổi Bật & Đơn Sắc Hóa Hover 4 Ô Quote

1. **Mục 1.10 & 2.1 — 4 Ô Thống Kê tại Khung Quote (`.stat-card` / `.hero-stat-bento-card`):**

   * **Trạng thái bình thường (ở cả 3 theme, bao gồm cả Mode Trắng Cam):** Là khối kính mờ đục sâu (`backdrop-filter: blur(44px) saturate(180%)`, độ đục `0.85`):

     * `purple-pink`: `background: rgba(30, 23, 50, 0.85) !important;`

     * `monochrome`: `background: rgba(24, 24, 28, 0.85) !important;`

     * `white-orange`: `background: rgba(255, 250, 244, 0.85) !important; border: 1.5px solid rgba(255, 255, 255, 0.92) !important; color: #1c1917 !important;`

   * **Khi trỏ chuột vào (Hover — Mục 1.10): TUYỆT ĐỐI KHÔNG DÙNG GRADIENT! Chỉ dùng Màu Đơn Sắc (Solid Color) hiện đại:**

     * `purple-pink`: `background: #9333ea !important; color: #ffffff !important; border-color: #c084fc !important;`

     * `monochrome`: `background: #ffffff !important; color: #09090b !important; border-color: #ffffff !important;`

     * `white-orange`: `background: #ea580c !important; color: #ffffff !important; border-color: #ea580c !important;`

2. **Mục 1.4, 2.2 & 2.3 — 7 Ô Chế Độ Học (`.study-mode-card`) & Các Thẻ Bộ Câu Hỏi (`.deck-card`):**

   * **Trạng thái bình thường (Resting State):** Làm **MỜ HƠN NỮA, ĐỤC HƠN NỮA** (`backdrop-filter: blur(48px) saturate(180%) !important`, độ đục nền `0.88–0.90`):

     * `purple-pink`: `background: rgba(28, 22, 46, 0.90) !important; border: 1.5px solid rgba(255, 255, 255, 0.18) !important;`

     * `monochrome`: `background: rgba(22, 22, 26, 0.90) !important; border: 1.5px solid rgba(255, 255, 255, 0.20) !important;`

     * `white-orange`: `background: rgba(255, 251, 246, 0.90) !important; border: 1.5px solid rgba(255, 255, 255, 0.95) !important; box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.98), 0 12px 30px -8px rgba(120, 53, 15, 0.12) !important;`

   * **Khi trỏ chuột vào (Hover):** Trở nên **TRONG SUỐT HƠN HẲN (`opacity` nền giảm từ `0.90` xuống `0.34`)** để lộ rõ lớp nền phía dưới và tạo sự tương phản nổi bật so với các khối mờ đục xung quanh:

     * `purple-pink`: `background: rgba(44, 34, 72, 0.34) !important; border-color: #c084fc !important;`

     * `monochrome`: `background: rgba(40, 40, 46, 0.34) !important; border-color: #ffffff !important;`

     * `white-orange`: `background: rgba(255, 247, 237, 0.34) !important; border-color: #ea580c !important; box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.95), 0 18px 40px -8px rgba(234, 88, 12, 0.22) !important;`

   * **Mục 2.3 — Dòng nút hành động dưới cùng của 7 Chế độ học (`.study-mode-pill-btn`):**

     ```
     .study-mode-card:hover .study-mode-pill-btn {
       background: var(--btn-primary-bg) !important;
       color: var(--btn-primary-text) !important;
       border-color: var(--btn-primary-bg) !important;
     }
     html[data-theme="white-orange"] .study-mode-card:hover .study-mode-pill-btn {
       background: #ea580c !important;
       color: #ffffff !important;
       border-color: #ea580c !important;
       box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35) !important;
     }
     
     ```

### Mục 1.5, 1.6, 1.8 & 2.4: Đại Phẫu Toàn Diện Chế Độ Flashcard (Không Lộ Đáp Án, Xóa "Chạm Để Lật", Đồng Bộ Light Mode Trắng Cam & Chuyển Câu Tức Thì Không Khựng)

1. **Xóa dòng chữ `"Chạm để lật"` / `"Chạm để lật lại"` (`Mục 1.6`):**

   * Trong `index.html`, xóa hoàn toàn các phần tử `<span class="flashcard-flip-badge">...</span>` ở cả mặt trước và mặt sau của Flashcard.

   * Trong CSS: `.flashcard-flip-badge { display: none !important; }`.

2. **Tách riêng `.flashcard-face` khỏi nhóm thẻ trong suốt — Dùng Nền Đặc 100% + Khóa `visibility` để TUYỆT ĐỐI KHÔNG LỘ ĐÁP ÁN MẶT SAU (`image_392a39.jpg` — Mục 1.5, 1.8, 2.4):**

   ```
   /* Mặt trước & Mặt sau của Flashcard PHẢI ĐẶC 100% (opaque), không dùng backdrop-filter để tránh lỗi xuyên thấu 3D của Chromium */
   .flashcard-face,
   .flashcard-front,
   .flashcard-back,
   body.flashcard-active .flashcard-face,
   body.flashcard-active .flashcard-front,
   body.flashcard-active .flashcard-back {
     backdrop-filter: none !important;
     -webkit-backdrop-filter: none !important;
     backface-visibility: hidden !important;
     -webkit-backface-visibility: hidden !important;
     background: var(--flashcard-solid-bg) !important;
     border: 1.5px solid var(--flashcard-solid-border) !important;
     color: var(--text-primary) !important;
     box-shadow: var(--card-frosted-shadow) !important;
   }
   
   /* Khóa cứng visibility giữa mặt trước và mặt sau để 0% khả năng chữ mặt sau in bóng lên mặt trước */
   .flashcard-card:not(.flipped) .flashcard-back {
     visibility: hidden !important;
     opacity: 0 !important;
     pointer-events: none !important;
   }
   .flashcard-card.flipped .flashcard-back {
     visibility: visible !important;
     opacity: 1 !important;
     pointer-events: auto !important;
   }
   .flashcard-card.flipped .flashcard-front {
     visibility: hidden !important;
     opacity: 0 !important;
     pointer-events: none !important;
   }
   .flashcard-card:not(.flipped) .flashcard-front {
     visibility: visible !important;
     opacity: 1 !important;
     pointer-events: auto !important;
   }
   
   ```

   Trong `css/theme.css`, định nghĩa biến `--flashcard-solid-bg` và `--flashcard-solid-border` chuẩn cho từng theme (đặc biệt sửa lỗi Light Mode `white-orange` trong `image_392a1e.jpg`):

   * `purple-pink`: `--flashcard-solid-bg: #1a142c; --flashcard-solid-border: rgba(192, 132, 252, 0.42);`

   * `monochrome`: `--flashcard-solid-bg: #141418; --flashcard-solid-border: rgba(255, 255, 255, 0.30);`

   * `white-orange` (**Light Mode — Mục 1.8 & 2.4**):
     `--flashcard-solid-bg: #fffcf8; --flashcard-solid-border: rgba(234, 88, 12, 0.38);`
     Và 4 nút đánh giá SRS ở dưới Flashcard (`.srs-btn-again`, `.srs-btn-hard`, `.srs-btn-good`, `.srs-btn-easy`) trong `white-orange` được đồng bộ nền trắng kem thanh lịch, viền rõ nét, chữ đậm tương phản cao.

3. **Sửa dứt điểm lỗi bấm mức độ hiểu bị khựng / biến mất rồi mới lật sang câu mới (`Mục 1.5`):**

   * Trong `js/app.js`, cập nhật hàm `rateFlashcard(rating)`:

     * **Xóa bỏ hoàn toàn `setTimeout(..., 145)` và xóa bỏ class `.switching-out` / `.switching-in-start`!**

     * Khi người dùng bấm nút mức độ hiểu (`1, 2, 3, 4`):

       ```
       rateFlashcard(rating) {
         this.clearPerQuestionTimer();
         const session = this.activeSession;
         if (!session) return;
         const card = session.cards[session.currentIndex];
         if (!card) return;
       
         const isCorrect = rating >= 3;
         if (isCorrect) {
           sounds.playCorrect();
           session.correctCount++;
         } else {
           sounds.playIncorrect();
           session.incorrectCount++;
         }
       
         const nextSrs = SRS.calculateNext(card.srs, rating);
         card.srs = nextSrs;
         card.stats = card.stats || {};
         card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
         if (isCorrect) card.stats.correctCount = (card.stats.correctCount || 0) + 1;
         else card.stats.incorrectCount = (card.stats.incorrectCount || 0) + 1;
         card.stats.lastReviewed = Date.now();
       
         // Ghi DB ngầm không chặn UI
         Promise.all([
           db.saveCard(card),
           db.logReview({ deckId: card.deckId, cardId: card.id, rating, isCorrect, mode: 'flashcard' })
         ]).catch(() => {});
       
         this.saveActiveSessionState();
         session.currentIndex++;
       
         const flashcardEl = document.getElementById('active-flashcard');
         if (flashcardEl && session.currentIndex < session.cards.length) {
           // 1. Tắt transition 3D ngay lập tức để đặt thẻ về mặt trước (0deg) ở 0ms mà KHÔNG quay lật ngược!
           flashcardEl.style.transition = 'none';
           flashcardEl.classList.remove('flipped');
           // 2. Nạp ngay nội dung câu hỏi mới vào mặt trước
           this.renderActiveStudyCard();
           // 3. Đặt vị trí trượt nhẹ từ bên phải (không làm biến mất thẻ!)
           flashcardEl.style.transform = 'translate3d(26px, 0, 0) scale(0.985) rotateY(0deg)';
           void flashcardEl.offsetWidth; // Force sync layout
           // 4. Bật lại transition để thẻ mới lướt êm vào vị trí chuẩn ngay tức thì
           flashcardEl.style.transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
           flashcardEl.style.transform = '';
         } else {
           this.renderActiveStudyCard();
         }
       },
       
       ```

### Mục 1.7: Sửa lỗi căn chỉnh Chế độ Tập trung (Focus Mode — `image_38d49b.jpg`)

* Trong `css/style.css` (dòng `4933–4948` và `6442–6580`), khi `body.focus-mode-active` được bật:

  ```
  body.focus-mode-active .app-sidebar,
  body.focus-mode-active .app-topbar,
  body.focus-mode-active .bottom-nav {
    display: none !important;
  }
  
  body.focus-mode-active .app-container {
    display: block !important;
    width: 100vw !important;
    max-width: 100vw !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  body.focus-mode-active .app-main,
  body.focus-mode-active .content-wrapper,
  body.focus-mode-active #view-study.active {
    margin: 0 auto !important;
    padding: 32px 24px !important;
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
  }
  
  body.focus-mode-active .quiz-container {
    margin: 48px auto 0 auto !important;
    width: min(100%, 920px) !important;
    max-width: 920px !important;
  }
  
  /* Nút Thoát Chế Độ Tập Trung: cách mép trên 20px, mép trái 24px gọn gàng, không bao giờ bị cắt chữ */
  body.focus-mode-active .focus-exit-btn,
  body.focus-mode-active #btn-exit-focus {
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    position: fixed !important;
    top: 20px !important;
    left: 24px !important;
    right: auto !important;
    z-index: 1200 !important;
    padding: 10px 18px !important;
    border-radius: 999px !important;
    background: var(--glass-slab-bg) !important;
    backdrop-filter: blur(24px) !important;
    border: 1.5px solid var(--accent-border) !important;
    color: var(--text-primary) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
  }
  
  ```

### Mục 1.13: Thiết kế lại toàn bộ Hệ thống Âm thanh (`js/audio-config.js` & `js/audio.js`) — Chuyển từ Sóng Vuông 8-Bit Chát Chúa sang Âm Thanh Acoustic Glass / Marimba Hiện Đại, Êm Ái

* **Nguyên nhân âm thanh hiện tại nghe chán:** Toàn bộ `js/audio-config.js` đang dùng `waveType: 'square'` (tiếng điện tử 8-bit chát và rè như máy điện tử băng cũ).

* **Cách sửa bắt buộc trong `js/audio-config.js` và `js/audio.js`:**
  Thay thế hoàn toàn sang **Acoustic Glass & Wooden Marimba Harmonic Synthesis** (kết hợp sóng `sine` cơ bản + sóng hài `triangle` ở quãng tám trên với đường bao ADSR mượt như tiếng gõ phím cơ học cao cấp / chuông thủy tinh iOS):

  1. **`playTabWhoosh()` (Chuyển tab):** Tiếng "Soft Tactile Bubble Pop" (`sine` lướt nhẹ từ `320Hz -> 580Hz` trong `65ms` kèm tiếng gõ trầm ấm `140Hz` trong `35ms`, `volume: 0.08`).

  2. **`playFlip()` (Lật thẻ / Bấm nút):** Tiếng "Velvet Mechanical Switch / Card Snap" (`triangle` `520Hz -> 960Hz` siêu ngắn `42ms` qua bộ lọc thông thấp `1600Hz`, nghe giòn êm như lật thẻ giấy thật).

  3. **`playCorrect()` (Trả lời đúng):** Hợp âm đôi Marimba thủy tinh ấm áp (`E5: 659.25Hz` -> `B5: 987.77Hz` -> `E6: 1318.5Hz`, sóng `sine` + họa âm bậc 2 `triangle` nhẹ, ngân mượt `240ms`, nghe sang trọng như âm báo Apple Pay / Duolingo).

  4. **`playIncorrect()` (Trả lời sai):** Tiếng gõ gỗ trầm ấm hai nhịp (`Wooden Muted Double-Tap`: `220Hz -> 164.8Hz` sóng `triangle` lọc trầm `600Hz` trong `180ms` — thông báo sai nhẹ nhàng, lịch sự, không bao giờ kêu "rè rè" gây ức chế khi học lâu).

  5. **`playFanfare()` & `playBatteryCharged()` (Hoàn thành phiên học):** Hợp âm rải **Glass Harp Major 9th** (`C5 - E5 - G5 - B5 - D6`, sóng `sine` có độ ngân tự nhiên `450ms`).

## PHẦN 3: GIẢI QUYẾT DỨT ĐIỂM NHÓM 2 (`MODE TRẮNG CAM`), NHÓM 3 (`DARK MODE NÓI CHUNG`) & NHÓM 4 (`MODE TRẮNG ĐEN`)

### Mục 2.5: Đổi Font Chữ Đen To Bản Của Quote ở Mode Trắng Cam (Sửa Lỗi Agent Hiểu Nhầm Ở Lần Trước)

* **Lưu ý cực kỳ quan trọng cho AI Agent:**
  Ở đợt `1h`, Agent đã hiểu nhầm và giữ nguyên font `Montserrat 900 Black` cho chữ Quote lớn (`#hero-title`) mà chỉ đổi font cho dòng chữ nhỏ bên dưới!
  Yêu cầu của người dùng là: **Đổi chính các chữ màu đen to bản trong câu Quote (`#hero-title`, `.hero-title-main`, `.hero-title-sub`) ở Mode Trắng Cam sang font chữ có chân thẳng (`PT Serif` / `Newsreader` / `Lora`)!**

* **Đoạn CSS bắt buộc đặt ở cuối `css/theme.css`:**

  ```
  /* MỤC 2.5: BẮT BUỘC ĐỔI CHỮ ĐEN TO BẢN CỦA QUOTE Ở MODE TRẮNG CAM SANG FONT CÓ CHÂN THẲNG */
  html[data-theme="white-orange"] #hero-title,
  html[data-theme="white-orange"] .hero-title,
  html[data-theme="white-orange"] #hero-title .hero-title-main,
  html[data-theme="white-orange"] #hero-title .hero-title-sub,
  html[data-theme="white-orange"] .hero-title span:not(.hero-title-accent) {
    font-family: 'PT Serif', 'Newsreader', 'Noto Serif', Georgia, serif !important;
    font-weight: 700 !important;
    font-style: normal !important; /* Đứng thẳng 100%, không nghiêng */
    letter-spacing: -0.02em !important;
    color: #1c1917 !important;
  }
  
  /* Chữ màu cam điểm nhấn giữ nguyên in nghiêng thanh mảnh */
  html[data-theme="white-orange"] #hero-title .hero-title-accent,
  html[data-theme="white-orange"] .hero-title .hero-title-accent {
    font-family: 'Newsreader', 'PT Serif', Georgia, serif !important;
    font-weight: 400 !important;
    font-style: italic !important;
    color: #ea580c !important;
  }
  
  ```

### Mục 3.1: Khôi Phục Ngay Lập Tức Các Khung Nhập Liệu Bị Biến Mất Ở Dark Mode (`purple-pink` & `monochrome`)

* **Các khung bị mất viền/nền cần khôi phục rõ nét 100%:**

  1. Ô tìm kiếm trong tab Ngân hàng câu hỏi (`#bank-search-input`).

  2. Ô `Tên bộ thẻ mới` (`#import-deck-name`), `Mô tả` (`#import-deck-desc`), và `Dán dữ liệu JSON` (`#import-raw-input` / `#ai-raw-input`) trong tab Dán câu hỏi AI (`#view-import`).

  3. Ô `Dán văn bản` (`#lms-raw-input`) và các ô cấu hình bộ thẻ mới trong tab Nhập từ LMS (`#view-import-lms`).

* **Cách sửa bắt buộc trong `css/theme.css`:**

  ```
  /* KHÔI PHỤC RÕ NÉT 100% KHUNG INPUT, SEARCH & TEXTAREA TRÊN CẢ 3 THEME (MỤC 3.1) */
  input[type="text"],
  input[type="search"],
  input[type="number"],
  textarea,
  .form-control,
  .cyber-input,
  .cyber-textarea,
  #bank-search-input,
  #import-deck-name,
  #import-deck-desc,
  #import-raw-input,
  #ai-raw-input,
  #lms-raw-input,
  #create-subject-name,
  #manage-subject-name,
  #edit-card-topic,
  #edit-card-question,
  #edit-card-explanation {
    background: var(--input-box-bg, rgba(18, 14, 32, 0.88)) !important;
    border: 1.5px solid var(--input-box-border, rgba(192, 132, 252, 0.48)) !important;
    color: var(--text-primary, #f8fafc) !important;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.28), 0 1px 0 rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    padding: 12px 16px !important;
    font-family: var(--font-sans, 'Plus Jakarta Sans', 'Inter', sans-serif) !important;
    font-size: 0.95rem !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  html[data-theme="purple-pink"] {
    --input-box-bg: rgba(18, 14, 34, 0.88);
    --input-box-border: rgba(192, 132, 252, 0.48);
  }
  html[data-theme="monochrome"] {
    --input-box-bg: rgba(16, 16, 20, 0.92);
    --input-box-border: rgba(255, 255, 255, 0.42);
  }
  html[data-theme="white-orange"] {
    --input-box-bg: rgba(255, 255, 255, 0.92);
    --input-box-border: rgba(234, 88, 12, 0.42);
  }
  
  input:focus,
  textarea:focus,
  .form-control:focus,
  #bank-search-input:focus,
  #import-raw-input:focus,
  #lms-raw-input:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-soft), inset 0 2px 6px rgba(0, 0, 0, 0.18) !important;
    outline: none !important;
  }
  
  ```

### Mục 3.2: Tăng Độ Tương Phản Chữ "Đoán Trước" (`#btn-toggle-blind` & `.btn-reveal-options`) Ở 2 Theme Dark Mode

* **Nguyên nhân:** Khi nút `#btn-toggle-blind.active` (`Đoán trước: Bật`) hoặc nút `.btn-reveal-options` (`Hiện các lựa chọn & Đối chiếu`) đổi sang nền sáng (`#c084fc` ở `purple-pink` hoặc `#ffffff` ở `monochrome`), chữ bên trong vẫn giữ màu trắng (`#ffffff` / `var(--text-primary)`) nên chìm nghỉm vào nền nút!

* **Cách sửa bắt buộc:**

  ```
  /* Khi chưa bật: Nền tối viền rõ, chữ trắng sáng */
  #btn-toggle-blind,
  .blind-toggle-pill {
    background: var(--input-box-bg) !important;
    border: 1.5px solid var(--input-box-border) !important;
    color: var(--text-primary) !important;
  }
  #btn-toggle-blind *,
  .blind-toggle-pill * {
    color: inherit !important;
  }
  
  /* Khi ĐÃ BẬT (.active) hoặc Nút Hiện Lựa Chọn (.btn-reveal-options):
     Nền dùng --btn-primary-bg, chữ BẮT BUỘC dùng --btn-primary-text (#09090b đen đậm trên nền trắng/tím sáng!) */
  #btn-toggle-blind.active,
  .blind-toggle-pill.active,
  .btn-reveal-options {
    background: var(--btn-primary-bg) !important;
    color: var(--btn-primary-text) !important;
    border: 1.5px solid var(--btn-primary-bg) !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 16px var(--accent-glow) !important;
  }
  #btn-toggle-blind.active *,
  .blind-toggle-pill.active *,
  .btn-reveal-options * {
    color: var(--btn-primary-text) !important;
  }
  
  ```

### Mục 4.1: Tăng Độ Tương Phản Giữa Câu Sai & Câu Đúng Trong Quiz Ở Mode Trắng Đen (`monochrome`)

* **Hiện trạng lỗi:** Ở Mode Trắng Đen, khi chọn đáp án sai, ô đáp án sai chỉ hơi đỏ mờ nhạt (`rgba(239, 68, 68, 0.12)`), nhìn chưa khác biệt rõ rệt so với đáp án đúng.

* **Cách sửa bắt buộc cho `html[data-theme="monochrome"]`:**

  ```
  /* ĐÁP ÁN ĐÚNG ở Mode Trắng Đen: Nền Xanh Ngọc Lục Bảo Đậm Sắc Nét + Viền Dày Phát Sáng */
  html[data-theme="monochrome"] .quiz-option-btn.correct {
    background: rgba(16, 185, 129, 0.28) !important;
    border: 2.5px solid #34d399 !important;
    border-left: 8px solid #10b981 !important;
    color: #ecfdf5 !important;
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.35), inset 0 0 12px rgba(16, 185, 129, 0.18) !important;
    font-weight: 700 !important;
  }
  html[data-theme="monochrome"] .quiz-option-btn.correct .quiz-option-letter {
    background: #10b981 !important;
    color: #09090b !important;
    border-radius: 6px !important;
    padding: 2px 8px !important;
  }
  
  /* ĐÁP ÁN SAI ở Mode Trắng Đen: Nền Đỏ Thẫm Rõ Nét + Thanh Cạnh Trái 8px Đỏ Rực + Gạch Ngang Chữ Sai */
  html[data-theme="monochrome"] .quiz-option-btn.incorrect {
    background: repeating-linear-gradient(
      -45deg,
      rgba(239, 68, 68, 0.30),
      rgba(239, 68, 68, 0.30) 10px,
      rgba(185, 28, 28, 0.22) 10px,
      rgba(185, 28, 28, 0.22) 20px
    ) !important;
    border: 2.5px solid #f87171 !important;
    border-left: 8px solid #ef4444 !important;
    color: #fecaca !important;
    box-shadow: 0 0 24px rgba(239, 68, 68, 0.40), inset 0 0 14px rgba(239, 68, 68, 0.25) !important;
  }
  html[data-theme="monochrome"] .quiz-option-btn.incorrect .quiz-option-letter {
    background: #ef4444 !important;
    color: #ffffff !important;
    border-radius: 6px !important;
    padding: 2px 8px !important;
  }
  html[data-theme="monochrome"] .quiz-option-btn.incorrect .quiz-option-content {
    text-decoration: line-through !important;
    text-decoration-color: #f87171 !important;
    text-decoration-thickness: 2px !important;
    opacity: 0.92 !important;
  }
  
  ```

## PHẦN 4: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

 1. \[ \] **Mode 5 & Học Theo Môn/Chương (`1.1`):** Đã xóa sạch các hàm trùng lặp ở cuối `js/app.js`; đã thêm guard đầu `startSession` để mọi cú click vào Mode 5 đều mở `#modal-topic-picker`; chọn môn hoặc chương bấm bắt đầu là vào học ngay 100%.

 2. \[ \] **Icon Cài Đặt Sidebar & Thanh Trạng Thái Mobile (`1.2`, `1.11`):** Đã khóa `fill: none !important; stroke: currentColor !important;` cho toàn bộ SVG trong `.app-sidebar` và `.bottom-nav`; không còn bất kỳ icon nào bị tô đặc thành cục vuông.

 3. \[ \] **Kích Thước Công Thức LaTeX (`1.3`):** Đã bỏ `.katex-scaled-down`; cỡ chữ `.katex` đạt `1.22em–1.26em` rõ nét; đã khôi phục các ký tự `\theta`, `\frac`, `\beta` bị `JSON.parse` nuốt mất dấu `\`.

 4. \[ \] **Độ Mờ Đục Khối Thẻ & Hover Trong Suốt (`1.4`, `2.1`, `2.2`, `2.3`):** Các khối ở trạng thái bình thường có độ đục cao (`0.88–0.90`) và blur sâu (`48px`); khi trỏ vào thì trở nên trong suốt (`0.34`) nổi bật hẳn so với các khối xung quanh; ở Mode Trắng Cam trỏ vào 7 chế độ học thì nút dòng dưới đổi sang màu cam `#ea580c`.

 5. \[ \] **Flashcard Không Lộ Đáp Án, Xóa "Chạm Để Lật", Đồng Bộ Light Mode & Không Khựng (`1.5`, `1.6`, `1.8`, `2.4`):** `.flashcard-face` dùng nền đặc 100% (`--flashcard-solid-bg`, ở Mode Trắng Cam là `#fffcf8`), khóa `visibility: hidden` cho mặt úp để 0% lộ đáp án; đã xóa `"Chạm để lật"`; bấm mức độ hiểu chuyển câu mới ngay ở `0ms` không bị biến mất rồi lật lại.

 6. \[ \] **Chế Độ Tập Trung (`1.7`):** `.quiz-container` căn giữa hoàn hảo (`margin: 48px auto 0 auto !important`), nút Thoát đặt tại `top: 20px; left: 24px` không bị cắt chữ.

 7. \[ \] **Popup Thấu Kính Lồi Liquid Glass & Skill Mới (`1.9`):** Đã tạo `.agent/skills/liquid-glass-refraction/SKILL.md` và kích hoạt bộ lọc `<filter id="liquid-convex-lens">` (`<feDisplacementMap>`) + vành Meniscus `::before` để mép viền trong của Popup uốn cong quang học như Ảnh 5 (`image_38cc82.jpg`).

 8. \[ \] **Hover 4 Ô Khung Quote Đơn Sắc (`1.10`):** Không còn gradient khi hover 4 ô ở khung Quote; cả 3 theme đều dùng màu đơn sắc hiện đại (`#9333ea`, `#ffffff`, `#ea580c`).

 9. \[ \] **Sidebar Kính Mờ Trong Suốt (`1.12`):** `.app-sidebar` có độ đục `0.48–0.56` + `backdrop-filter: blur(38px) saturate(190%)`, nhìn xuyên mờ nền phía dưới thay vì màu trơn đặc.

10. \[ \] **Hệ Thống Âm Thanh Mới (`1.13`):** Đã thay thế sóng vuông 8-bit trong `js/audio-config.js` và `js/audio.js` bằng âm thanh Acoustic Glass / Marimba êm ái, hiện đại.

11. \[ \] **Font Chữ Đen To Bản Của Quote ở Mode Trắng Cam (`2.5`):** Chính các chữ đen lớn trong `#hero-title` (`.hero-title-main`, `.hero-title-sub`) đã đổi sang font có chân thẳng (`PT Serif` / `Newsreader`), không còn giữ `Montserrat`.

12. \[ \] **Khôi Phục Khung Input Dark Mode & Tương Phản Nút Đoán Trước (`3.1`, `3.2`):** Ô tìm kiếm Ngân hàng câu hỏi, Tên bộ thẻ, Mô tả, Dán JSON AI và Dán văn bản LMS hiển thị rõ khung viền trong cả 2 Dark Mode; chữ trên nút `Đoán trước` và `Hiện các lựa chọn` tương phản sắc nét (`#09090b` trên nền sáng).

13. \[ \] **Tương Phản Câu Sai / Câu Đúng Ở Mode Trắng Đen (`4.1`):** Câu đúng và câu sai trong Quiz ở Mode Trắng Đen khác biệt rõ rệt (thanh cạnh trái `8px`, nền sọc chéo đỏ thẫm + gạch ngang chữ sai).

14. \[ \] **Cập Nhật `docs/ARCHITECTURE_GRAPH.md` & Chạy Tests/Build:** Cập nhật lại `docs/ARCHITECTURE_GRAPH.md` phản ánh kiến trúc mới và chạy `npm test` + `npm run build` đạt 100% PASS.