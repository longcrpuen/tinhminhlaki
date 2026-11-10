# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1S — KHÔI PHỤC HIỆU ỨNG FLOAT-UP & LAZY SCROLL REVEAL CHO NGÂN HÀNG CÂU HỎI, KHỬ SẠCH ÁM TÍM ĐÁY SÓNG ĐỒNG BỘ 3 THEME, LÀM NỔI VỆT MÀU ĐANG BẬT TRÊN THANH KÉO ÂM LƯỢNG & THANH KÉO SÓNG, SỬA THANH TIẾN TRÌNH BỊ CỨNG 100%, VÀ TỐI ƯU CHUYỂN THEME & BUỒNG SÓNG MOBILE (`promt1s.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1s` (Nối tiếp sau `1r`)
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **5 vấn đề giao diện & hiệu năng** từ phản hồi mới nhất của người dùng và 3 ảnh chụp màn hình (`image_c69d72.jpg`, `image_c646e0.png`, `image_c6469b.png`), tuân thủ nghiêm ngặt **Luật Phân Tích Ảnh Hưởng & Chống Hồi Quy (System Impact & Regression Analysis Protocol)**.

---

## PHẦN 0: KIỂM TRA ẢNH HƯỞNG HỆ THỐNG TRƯỚC KHI SỬA (IMPACT & REGRESSION CHECK)

1. **Tại sao ở bản `1r`, thanh tiến trình (`#study-progress-fill` trong `image_c69d72.jpg`) lại bị cứng ở 100% ngay từ câu `1/13`?**
   - Vì trong `css/style.css` (dòng `99223`) có sẵn rule `body.perf-compositor-anim .quiz-progress-fill { width: 100% !important; }`. Khi `App.init()` được khôi phục ở `1r`, class `perf-compositor-anim` được gắn lại vào `body`, khiến `width: 100% !important` trong CSS đè lên `progressFill.style.width` (vốn không có `!important`), trong khi `transform: scaleX` đã bị tắt!
   - **Bài học & Cách khóa chặt**: Phải ghi đè trực tiếp selector `html body.perf-compositor-anim #study-progress-fill.quiz-progress-fill { width: var(--study-progress-pct, 0%) !important; transform: none !important; }` VÀ dùng `progressFill.style.setProperty('width', pctStr, 'important')` trong JS!
2. **Bảo toàn 100% Test Suite (`npm test`)**:
   - Giữ nguyên selector `.bank-card-item { border-radius: var(--radius-card); ... }` và `.bank-card-item::before` trong `css/style.css`.
   - Giữ nguyên chữ ký `async renderQuestionBank()` trong `js/app.js`.

---

## PHẦN 1: CHI TIẾT 5 HẠNG MỤC CẦN THỰC HIỆN TRONG `promt1s.md`

### 1. Sửa Dứt Điểm Lỗi Giật, Nháy, Khựng Khi Ấn Vào Tab Ngân Hàng Câu Hỏi (`#view-bank`) + Khôi Phục Hiệu Ứng Float-Up Mượt Như Các Tab Khác & Hiệu Ứng Sinh Dần Khi Kéo Xuống (Lazy Scroll Reveal + Skeleton)

#### 🔍 Giải phẫu nguyên nhân gốc rễ:
1. **Tại sao khi ấn vào tab Ngân hàng câu hỏi (`#view-bank`), các câu hỏi không float lên mượt như các block ở tab khác mà bị giật, nháy rồi khựng?**
   - Trong `renderQuestionBank()` (`js/app.js` dòng `104956–104972`), code hiện tại đang chạy vòng lặp:
     ```javascript
     const CHUNK_SIZE = 15;
     listContainer.innerHTML = '';
     for (let i = 0; i < filtered.length; i += CHUNK_SIZE) {
       if (i > 0) await this.yieldToMain();
       ...
       listContainer.insertAdjacentHTML('beforeend', chunkHtml);
     }
     ```
   - Khi kho thẻ có 150–300 câu hỏi, ngay lúc người dùng vừa bấm sang tab `#view-bank` (trong khi trình duyệt đang chạy hiệu ứng mở tab), vòng lặp này liên tục gọi `insertAdjacentHTML` 10–20 lần liên tiếp, mỗi lần nhồi 15 thẻ phức tạp (chứa đầy công thức KaTeX) vào DOM!
   - Hệ quả: Trình duyệt bị ép phải tính toán lại Layout + Style + Paint dồn dập 20 lần trong 300ms đầu tiên $\rightarrow$ gây ra hiện tượng **nháy màn hình, giật cục rồi khựng đứng**, và hoàn toàn không có hiệu ứng trượt nổi (float-up) khi xuất hiện!
2. **Tại sao mất animation sinh dần ra khi kéo xuống & hiệu ứng tối ưu khi chưa kịp load?**
   - Do toàn bộ câu hỏi bị nhồi hết vào DOM ngay từ đầu cùng với `content-visibility: auto; contain-intrinsic-size: 0 160px; contain: layout style paint;` trên `.bank-card-item`. Thuộc tính `contain: paint` cắt mất bóng đổ, còn chiều cao ước lượng cứng `160px` lệch với chiều cao thật của thẻ (`220px–280px`) làm thanh cuộn bị nhảy giật khi kéo xuống, không có `IntersectionObserver` để nạp dần từng lô kèm hiệu ứng Skeleton & Float-Up!

#### 🛠️ Giải pháp bắt buộc trong `js/app.js` và `css/style.css`:

1. **Trong `js/app.js` (Cập nhật phần render danh sách cuối hàm `renderQuestionBank()`)**:
   - Thay thế vòng lặp `for (let i = 0; i < filtered.length; i += CHUNK_SIZE)` bằng cơ chế **Render Tức Thì Lô Đầu Tiên (`INITIAL_BATCH = 8` câu) + `IntersectionObserver` Lazy Scroll Reveal + Skeleton Shimmer Placeholder**:
     ```javascript
     // Hủy observer cũ nếu đang tồn tại từ lần lọc trước
     if (this._bankScrollObserver) {
       this._bankScrollObserver.disconnect();
       this._bankScrollObserver = null;
     }
     if (this._bankCardRevealObserver) {
       this._bankCardRevealObserver.disconnect();
       this._bankCardRevealObserver = null;
     }

     const INITIAL_BATCH = 8;
     const SCROLL_BATCH = 8;
     let renderedCount = 0;

     // Observer kích hoạt hiệu ứng float-up mượt mà khi từng thẻ lướt vào vùng nhìn
     if (typeof IntersectionObserver !== 'undefined') {
       this._bankCardRevealObserver = new IntersectionObserver((entries, obs) => {
         entries.forEach(entry => {
           if (entry.isIntersecting) {
             const el = entry.target;
             el.classList.add('is-visible');
             obs.unobserve(el);
           }
         });
       }, { root: null, rootMargin: '60px 0px', threshold: 0.05 });
     }

     const appendNextBankBatch = (batchSize, isInitial = false) => {
       if (renderedCount >= filtered.length) return;
       const slice = filtered.slice(renderedCount, renderedCount + batchSize);
       const startIdx = renderedCount;
       renderedCount += slice.length;

       const fragment = document.createDocumentFragment();
       const tempWrap = document.createElement('div');
       tempWrap.innerHTML = slice.map((card, idx) =>
         this._generateBankCardHtml(card, decksMap, isCardBookmarked, isCardFlagged, isInitial ? idx : idx % 4)
       ).join('');

       const newCards = Array.from(tempWrap.children);
       newCards.forEach((cardEl, localIdx) => {
         const delayMs = isInitial ? Math.min(localIdx * 42, 260) : Math.min(localIdx * 35, 160);
         cardEl.style.setProperty('--bank-float-delay', `${delayMs}ms`);
         cardEl.classList.add('bank-card-float-item');
         if (isInitial) {
           // Các thẻ đầu tiên trong màn hình float lên ngay lập tức như các block ở tab khác
           requestAnimationFrame(() => {
             cardEl.classList.add('is-visible');
           });
         } else if (this._bankCardRevealObserver) {
           this._bankCardRevealObserver.observe(cardEl);
         } else {
           cardEl.classList.add('is-visible');
         }

         const grid = cardEl.querySelector('.bank-card-options-grid');
         if (grid && grid.querySelector('.katex-inline-wrap, .katex')) {
           requestAnimationFrame(() => this.adaptOptionsLayout(grid));
         }
         fragment.appendChild(cardEl);
       });

       const sentinel = listContainer.querySelector('.bank-lazy-sentinel');
       if (sentinel) {
         listContainer.insertBefore(fragment, sentinel);
       } else {
         listContainer.appendChild(fragment);
       }
     };

     // 1. Xóa danh sách cũ và render ngay 8 thẻ đầu tiên trong 1 thao tác DOM duy nhất (Zero Flicker)
     listContainer.innerHTML = '';
     appendNextBankBatch(INITIAL_BATCH, true);

     // 2. Nếu còn câu hỏi phía dưới, gắn khung Skeleton Shimmer tối ưu và nạp dần khi kéo xuống
     if (renderedCount < filtered.length) {
       const sentinel = document.createElement('div');
       sentinel.className = 'bank-lazy-sentinel';
       sentinel.innerHTML = `
         <div class="bank-skeleton-card">
           <div class="bank-skeleton-row short"></div>
           <div class="bank-skeleton-row long"></div>
           <div class="bank-skeleton-grid">
             <div class="bank-skeleton-pill"></div>
             <div class="bank-skeleton-pill"></div>
             <div class="bank-skeleton-pill"></div>
             <div class="bank-skeleton-pill"></div>
           </div>
         </div>
       `;
       listContainer.appendChild(sentinel);

       if (typeof IntersectionObserver !== 'undefined') {
         this._bankScrollObserver = new IntersectionObserver((entries) => {
           const entry = entries[0];
           if (!entry || !entry.isIntersecting) return;
           if (this.currentView !== 'bank' || this.currentFilteredBankCards !== filtered) return;

           // Hiệu ứng nạp mượt khi cuộn xuống
           requestAnimationFrame(() => {
             appendNextBankBatch(SCROLL_BATCH, false);
             if (renderedCount >= filtered.length) {
               if (this._bankScrollObserver) {
                 this._bankScrollObserver.disconnect();
                 this._bankScrollObserver = null;
               }
               sentinel.remove();
             }
           });
         }, { root: null, rootMargin: '320px 0px', threshold: 0.01 });

         this._bankScrollObserver.observe(sentinel);
       } else {
         // Fallback nếu môi trường test không có IntersectionObserver
         appendNextBankBatch(filtered.length - renderedCount, false);
         sentinel.remove();
       }
     }
     ```

2. **Trong `css/style.css` (Thêm hiệu ứng Float-Up mượt mà cho `.bank-card-item` & Skeleton Shimmer khi cuộn xuống)**:
   ```css
   /* ==========================================================================
      1. HIỆU ỨNG FLOAT-UP MƯỢT MÀ & SKELETON LAZY REVEAL CHO NGÂN HÀNG CÂU HỎI
      ========================================================================== */

   /* Gỡ bỏ content-visibility: auto & contain: paint gây nháy và cắt bóng đổ trên .bank-card-item */
   html body #view-bank .bank-card-item {
     content-visibility: visible !important;
     contain: none !important;
   }

   /* Trạng thái khởi đầu trước khi float lên */
   html body #view-bank .bank-card-item.bank-card-float-item {
     opacity: 0;
     transform: translate3d(0, 22px, 0) scale(0.985);
     transition:
       opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1) var(--bank-float-delay, 0ms),
       transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) var(--bank-float-delay, 0ms),
       border-color 0.2s ease,
       box-shadow 0.2s ease !important;
     will-change: transform, opacity;
   }

   /* Khi lướt vào khung nhìn hoặc mở tab: float mượt lên vị trí chuẩn */
   html body #view-bank .bank-card-item.bank-card-float-item.is-visible {
     opacity: 1;
     transform: translate3d(0, 0, 0) scale(1);
   }

   html body #view-bank .bank-card-item.bank-card-float-item.is-visible:hover {
     transform: translate3d(0, -3px, 0) scale(1) !important;
   }

   /* Khung Skeleton Shimmer hiển thị khi người dùng kéo nhanh xuống dưới mà câu hỏi đang sinh ra */
   .bank-lazy-sentinel {
     width: 100%;
     padding: 4px 0 20px 0;
   }

   .bank-skeleton-card {
     background: var(--glass-tint);
     border: 1px solid var(--glass-border);
     border-radius: var(--radius-card, 18px);
     padding: 22px;
     margin-bottom: 16px;
     overflow: hidden;
     position: relative;
   }

   .bank-skeleton-row,
   .bank-skeleton-pill {
     background: linear-gradient(
       90deg,
       rgba(255, 255, 255, 0.05) 25%,
       rgba(255, 255, 255, 0.14) 50%,
       rgba(255, 255, 255, 0.05) 75%
     );
     background-size: 200% 100%;
     animation: skeletonShimmer 1.4s ease-in-out infinite;
     border-radius: 8px;
   }

   html[data-theme="orange"] .bank-skeleton-row,
   html[data-theme="orange"] .bank-skeleton-pill,
   html[data-theme="white-orange"] .bank-skeleton-row,
   html[data-theme="white-orange"] .bank-skeleton-pill {
     background: linear-gradient(
       90deg,
       rgba(234, 88, 12, 0.06) 25%,
       rgba(234, 88, 12, 0.15) 50%,
       rgba(234, 88, 12, 0.06) 75%
     );
     background-size: 200% 100%;
   }

   .bank-skeleton-row.short {
     width: 38%;
     height: 18px;
     margin-bottom: 14px;
   }

   .bank-skeleton-row.long {
     width: 82%;
     height: 22px;
     margin-bottom: 16px;
   }

   .bank-skeleton-grid {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 10px;
   }

   .bank-skeleton-pill {
     height: 40px;
     border-radius: 10px;
   }
   ```

---

### 2. Khử Sạch 100% Vết Ám Tím Ở Phần Viền & Đáy Sóng (`image_c646e0.png`, `image_c6469b.png`), Đồng Bộ Tuyệt Đối Theo Từng Theme (`violet`, `bw`, `orange`)

#### 🔍 Giải phẫu nguyên nhân từ `image_c646e0.png` và `image_c6469b.png`:
- Nhìn vào `image_c646e0.png`: Dù đang ở theme **Trắng Đen (`Monochrome Laser Wave`)**, phần vùng gradient bên dưới đường sóng trắng và phần đáy của khung `.theme-energy-wave-chamber` vẫn bị **ám một lớp màu tím (`rgba(139, 92, 246, ...)` / `rgba(88, 28, 135, ...)`)**!
- Nguyên nhân:
  1. Trong SVG của buồng sóng (`index.html`), thẻ `<linearGradient>` tô màu cho phần diện tích dưới sóng (`.wave-area-fill` / `#energy-wave-grad`) hoặc CSS của `.theme-energy-wave-chamber` đang chứa mã màu tím cố định (`#a855f7`, `#7c3aed`, `rgba(139, 92, 246, ...)`).
  2. Hoặc trong `js/app.js` (hàm `_updateEnergyWaveVisuals`), thuật toán đang lấy màu theo vị trí thanh trượt hoặc giữ mặc định stop-color màu tím!

#### 🛠️ Giải pháp bắt buộc trong `css/theme.css`, `css/style.css`, `index.html` và `js/app.js`:

1. **Định nghĩa bộ biến CSS chuẩn cho Buồng Sóng theo từng Theme (0% sắc tím ở Trắng Đen và Trắng Cam)**:
   ```css
   /* ==========================================================================
      2. ĐỒNG BỘ MÀU SÓNG, ĐÁY SÓNG & VIỀN BUỒNG SÓNG 100% THEO 3 THEME (0% ÁM TÍM)
      ========================================================================== */

   /* THEME 1: TÍM HỒNG (Violet Rose) */
   :root,
   html[data-theme="violet"],
   html[data-theme="purple"] {
     --wave-chamber-bg: linear-gradient(180deg, rgba(16, 11, 28, 0.95) 0%, rgba(28, 16, 48, 0.92) 100%);
     --wave-chamber-border: rgba(168, 85, 247, 0.28);
     --wave-chamber-bottom-glow: inset 0 -16px 28px rgba(139, 92, 246, 0.16);
     --wave-primary-stroke: #d8b4fe;
     --wave-secondary-stroke: rgba(192, 132, 252, 0.42);
     --wave-tertiary-stroke: rgba(168, 85, 247, 0.24);
     --wave-area-stop-top: rgba(168, 85, 247, 0.30);
     --wave-area-stop-mid: rgba(126, 34, 206, 0.12);
     --wave-area-stop-bot: rgba(16, 11, 28, 0);
     --wave-stroke-glow: drop-shadow(0 0 8px rgba(192, 132, 252, 0.45));
   }

   /* THEME 2: TRẮNG ĐEN (Monochrome Laser Wave) — TUYỆT ĐỐI 0% SẮC TÍM (Thuần Trắng Bạc & Xám Đen) */
   html[data-theme="bw"],
   html[data-theme="monochrome"] {
     --wave-chamber-bg: linear-gradient(180deg, #09090b 0%, #141417 100%);
     --wave-chamber-border: rgba(255, 255, 255, 0.20);
     --wave-chamber-bottom-glow: inset 0 -16px 28px rgba(255, 255, 255, 0.06);
     --wave-primary-stroke: #ffffff;
     --wave-secondary-stroke: rgba(255, 255, 255, 0.38);
     --wave-tertiary-stroke: rgba(161, 161, 170, 0.24);
     --wave-area-stop-top: rgba(255, 255, 255, 0.22);
     --wave-area-stop-mid: rgba(161, 161, 170, 0.08);
     --wave-area-stop-bot: rgba(9, 9, 11, 0);
     --wave-stroke-glow: drop-shadow(0 0 8px rgba(255, 255, 255, 0.38));
   }

   /* THEME 3: TRẮNG CAM (White-Orange Warm Amber) — TUYỆT ĐỐI 0% SẮC TÍM (Thuần Cam Hổ Phách & Kem Ấm) */
   html[data-theme="orange"],
   html[data-theme="white-orange"] {
     --wave-chamber-bg: linear-gradient(180deg, rgba(255, 251, 245, 0.96) 0%, rgba(255, 237, 213, 0.88) 100%);
     --wave-chamber-border: rgba(249, 115, 22, 0.30);
     --wave-chamber-bottom-glow: inset 0 -16px 28px rgba(249, 115, 22, 0.12);
     --wave-primary-stroke: #ea580c;
     --wave-secondary-stroke: rgba(249, 115, 22, 0.42);
     --wave-tertiary-stroke: rgba(251, 146, 60, 0.25);
     --wave-area-stop-top: rgba(249, 115, 22, 0.26);
     --wave-area-stop-mid: rgba(251, 146, 60, 0.10);
     --wave-area-stop-bot: rgba(255, 247, 237, 0);
     --wave-stroke-glow: drop-shadow(0 0 8px rgba(249, 115, 22, 0.35));
   }

   /* Áp dụng trực tiếp lên Buồng Sóng và các phần tử SVG bên trong */
   html body #theme-energy-chamber,
   html body .theme-energy-wave-chamber,
   html body .energy-wave-stage {
     background: var(--wave-chamber-bg) !important;
     border-color: var(--wave-chamber-border) !important;
     box-shadow: var(--wave-chamber-bottom-glow) !important;
   }

   /* Khóa màu các thẻ <stop> của SVG LinearGradient dưới đáy sóng theo đúng biến Theme */
   html body #theme-energy-chamber svg linearGradient stop:nth-child(1),
   html body .theme-energy-wave-chamber svg linearGradient stop:nth-child(1) {
     stop-color: var(--wave-area-stop-top) !important;
   }
   html body #theme-energy-chamber svg linearGradient stop:nth-child(2),
   html body .theme-energy-wave-chamber svg linearGradient stop:nth-child(2) {
     stop-color: var(--wave-area-stop-mid) !important;
   }
   html body #theme-energy-chamber svg linearGradient stop:nth-child(3),
   html body .theme-energy-wave-chamber svg linearGradient stop:nth-child(3) {
     stop-color: var(--wave-area-stop-bot) !important;
   }
   ```

2. **Trong `js/app.js` (Hàm `_updateEnergyWaveVisuals`)**:
   - Kiểm tra nơi JS cập nhật màu cho các đường sóng SVG và gradient dưới đáy sóng:
     - **Tuyệt đối KHÔNG dùng mã màu tím cố định hay pha màu tím vào vùng Trắng Đen (`bw`) hoặc Trắng Cam (`orange`)**!
     - Khi theme hiện hành là `bw` (`monochrome`), dùng bảng màu thuần trắng-xám (`#ffffff`, `rgba(255, 255, 255, 0.22)`, `rgba(161, 161, 170, 0.08)`, `rgba(9, 9, 11, 0)`).
     - Khi theme hiện hành là `orange` (`white-orange`), dùng bảng màu thuần cam ấm (`#ea580c`, `rgba(249, 115, 22, 0.26)`, `rgba(251, 146, 60, 0.10)`, `rgba(255, 247, 237, 0)`).
     - Khi theme hiện hành là `violet`, dùng bảng màu tím hồng (`#d8b4fe`, `rgba(168, 85, 247, 0.30)`, `rgba(126, 34, 206, 0.12)`, `rgba(16, 11, 28, 0)`).

---

### 3. Nâng Cấp Thanh Kéo Âm Lượng (`Lofi Volume Slider`) Và Thanh Kéo Sóng (`#theme-energy-slider`): Làm Nổi Bật Phần Đang Bật Trên Rãnh Kéo (Chứ Không Để Trơ Mỗi Nút Tròn Đang Kéo Như `image_c646e0.png`)

#### 🔍 Giải phẫu nguyên nhân từ `image_c646e0.png` và yêu cầu của người dùng:
- Nhìn vào thanh kéo trong `image_c646e0.png` và `image_c6469b.png`:
  - Hiện tại, cả rãnh trượt (`track`) từ đầu trái sang đầu phải đều chỉ có một màu xám tối xỉn duy nhất, trên đó **chỉ có trơ trọi mỗi cục nút tròn trắng (`nút đang kéo`)**! Người dùng nhìn vào không thấy phần vệt màu biểu thị mức âm lượng / mức sóng đang bật!
  - Người dùng yêu cầu rõ: **"nút kéo âm lượng chưa đạt như mong muốn, muốn bên phải tượng trưng cho âm lượng đang bật, chứ không để mỗi nút đang kéo, nút kéo sóng tương tự"**.
  - Lưu ý kỹ yêu cầu này:
    - Trong `::-webkit-slider-runnable-track`, trước đây do CSS đặt `background: rgba(255, 255, 255, 0.14)` đè lên `<input type="range">`, nên mọi gradient biểu thị trạng thái đang bật trên thanh kéo bị che khuất hoàn toàn, chỉ còn lại mỗi nút tròn đang kéo!
    - Người dùng muốn trên thanh kéo phải có **vệt màu sáng rõ rệt biểu thị phần đang bật (Active Bar)** (và đặc biệt lưu ý: người dùng nhấn mạnh *"muốn bên phải tượng trưng cho âm lượng đang bật, chứ không để mỗi nút đang kéo, nút kéo sóng tương tự"* — hãy kiểm tra xem hiện tại vệt màu đang bị ẩn hay đang nằm ngược bên, và thiết kế rãnh trượt có **vệt màu phát sáng theo theme** kèm **hiển thị mức % + vạch sóng âm đang bật ở bên phải thanh kéo**!).
    - Cụ thể hơn:
      - Nếu nhìn vào rãnh trượt chia làm 2 phía quanh nút kéo (`[ Phía Trái | (O) | Phía Phải ]`):
        - Hãy nhìn kỹ câu chữ của người dùng: *"muốn bên phải tượng trưng cho âm lượng đang bật, chứ không để mỗi nút đang kéo, nút kéo sóng tương tự"*.
        - Tại sao trong `image_c646e0.png` cả 2 bên nút kéo đều tối thui? Vì `::-webkit-slider-runnable-track` đang có một màu xám đồng nhất!
        - Nếu tô sáng phần rãnh trượt theo đúng ý người dùng:
          1. **Phần vệt sáng Active trên rãnh trượt (`::-webkit-slider-runnable-track` & `::-moz-range-track`)**:
             - Để đáp ứng chính xác ý người dùng: hãy kiểm tra cách người dùng cảm nhận thanh trượt — khi kéo nút tròn, **một nửa thanh trượt sáng rực màu Theme (`--slider-active-fill`: Tím `#c084fc`, Trắng `#ffffff`, Cam `#f97316`) và nửa còn lại là rãnh tối (`--slider-inactive-track`)**, tuyệt đối không bao giờ để cả 2 bên cùng một màu xám tối chỉ có mỗi cục nút tròn như `image_c646e0.png`!
             - **Đặc biệt chú ý**: Người dùng viết rõ *"muốn bên phải tượng trưng cho âm lượng đang bật, chứ không để mỗi nút đang kéo, nút kéo sóng tương tự"*:
               - Trong `image_c646e0.png`, hãy nhìn kỹ nửa bên trái (`0% -> 48%`) và nửa bên phải (`48% -> 100%`) của nút tròn trắng: ở `image_c646e0.png`, nửa bên trái có màu xám hơi sáng hơn một chút xíu (`rgba(255,255,255,0.18)`), còn nửa bên phải tối hơn (`rgba(255,255,255,0.10)`), nhưng cả hai đều quá mờ nhạt nên nhìn như chỉ có mỗi nút tròn! VÀ người dùng muốn **phần bên phải nút kéo (`var(--slider-pct) -> 100%`)** (hoặc vệt màu sáng rực trên thanh kéo ở phía bên phải) **sáng rõ lên để tượng trưng cho mức âm lượng / mức sóng đang bật**!
               - Hãy nhìn lại `image_c646e0.png` thật kỹ (zoom 400% vào thanh trượt trong `image_c646e0.png`):
                 - Bên trái cục tròn trắng (`0% -> 48%`): màu xám `#3f3f46`!
                 - Bên phải cục tròn trắng (`48% -> 100%`): màu xám `#27272a`!
                 - Người dùng nhìn vào đó và nói: **"muốn bên phải tượng trưng cho âm lượng đang bật, chứ không để mỗi nút đang kéo, nút kéo sóng tương tự"**!
                 - Nghĩa là người dùng muốn: **Phần BÊN PHẢI của nút kéo (`từ vị trí nút kéo val% đến 100%` — hoặc phần vệt sáng rõ rệt ở bên phải)** phải được tô màu sáng rực rỡ theo Theme (`#d8b4fe` ở Tím Hồng, `#ffffff` ở Trắng Đen, `#f97316` ở Trắng Cam) tượng trưng cho phần âm lượng/năng lượng đang bật, thay vì để cả thanh xám xịt chỉ có mỗi cục nút tròn đang kéo!

#### 🛠️ Giải pháp bắt buộc trong `css/style.css`, `js/lofi-music.js` và `js/app.js`:

1. **Hàm đồng bộ biến `--slider-pct` cho mọi thanh kéo Âm lượng (`#lofi-volume-slider`, `#setting-lofi-volume`, `.lofi-volume-slider`) và Thanh kéo Sóng (`#theme-energy-slider`)**:
   - Trong `js/lofi-music.js` (hàm `setVolume` / `updateUI` / `init`) và `js/app.js` (hàm `onThemeEnergySliderInput` / `_updateEnergyWaveVisuals`):
     ```javascript
     // Cập nhật tỷ lệ phần trăm thực tế (0%..100%) lên biến CSS --slider-pct của thanh kéo
     function syncRangeSliderVisual(sliderEl) {
       if (!sliderEl) return;
       const min = parseFloat(sliderEl.min) || 0;
       const max = parseFloat(sliderEl.max) || 100;
       const val = parseFloat(sliderEl.value) || 0;
       const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
       sliderEl.style.setProperty('--slider-pct', `${pct.toFixed(1)}%`);
     }
     ```
   - Gọi `syncRangeSliderVisual(sliderEl)` ngay khi khởi tạo (`init`), khi đổi bài/đổi âm lượng, và trong sự kiện `input` của cả thanh kéo Âm lượng lẫn thanh kéo Sóng `#theme-energy-slider`!

2. **Trong `css/style.css` (Tô sáng rực rỡ vệt năng lượng bên phải nút kéo `var(--slider-pct) -> 100%` theo đúng yêu cầu của người dùng và đồng bộ 3 Theme)**:
   ```css
   /* ==========================================================================
      3. THANH KÉO ÂM LƯỢNG & THANH KÉO SÓNG: VỆT SÁNG ACTIVE BÊN PHẢI NÚT KÉO
         ĐỒNG BỘ RỰC RỠ THEO 3 THEME (KHÔNG ĐỂ TRƠ MỖI NÚT KÉO)
      ========================================================================== */

   :root,
   html[data-theme="violet"],
   html[data-theme="purple"] {
     --range-active-color: #c084fc;
     --range-active-glow: rgba(192, 132, 252, 0.55);
     --range-inactive-bg: rgba(255, 255, 255, 0.12);
     --range-thumb-bg: #f3e8ff;
     --range-thumb-border: #a855f7;
   }

   html[data-theme="bw"],
   html[data-theme="monochrome"] {
     --range-active-color: #ffffff;
     --range-active-glow: rgba(255, 255, 255, 0.50);
     --range-inactive-bg: rgba(255, 255, 255, 0.14);
     --range-thumb-bg: #ffffff;
     --range-thumb-border: #71717a;
   }

   html[data-theme="orange"],
   html[data-theme="white-orange"] {
     --range-active-color: #f97316;
     --range-active-glow: rgba(249, 115, 22, 0.45);
     --range-inactive-bg: rgba(234, 88, 12, 0.16);
     --range-thumb-bg: #ffffff;
     --range-thumb-border: #ea580c;
   }

   /* Áp dụng cho cả Thanh kéo Sóng (#theme-energy-slider) và mọi Thanh kéo Âm lượng Lofi */
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
     /* Phần bên phải nút kéo (từ --slider-pct đến 100%) sáng rực màu active tượng trưng cho mức đang bật */
     background: linear-gradient(
       90deg,
       var(--range-inactive-bg) 0%,
       var(--range-inactive-bg) var(--slider-pct, 50%),
       var(--range-active-color) var(--slider-pct, 50%),
       var(--range-active-color) 100%
     ) !important;
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35) !important;
   }

   /* Đảm bảo ::-webkit-slider-runnable-track trong suốt để hiển thị rõ vệt màu active của thanh kéo */
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

   /* Nút tròn đang kéo (Thumb) nổi khối sắc nét */
   html body #theme-energy-slider::-webkit-slider-thumb,
   html body .theme-energy-slider::-webkit-slider-thumb,
   html body #lofi-volume-slider::-webkit-slider-thumb,
   html body #setting-lofi-volume::-webkit-slider-thumb,
   html body .lofi-volume-slider::-webkit-slider-thumb {
     -webkit-appearance: none !important;
     appearance: none !important;
     width: 20px !important;
     height: 20px !important;
     margin-top: -6px !important;
     border-radius: 50% !important;
     background: var(--range-thumb-bg) !important;
     border: 2.5px solid var(--range-thumb-border) !important;
     box-shadow: 0 0 12px var(--range-active-glow), 0 2px 6px rgba(0, 0, 0, 0.45) !important;
     cursor: grab !important;
     transition: transform 0.15s ease, box-shadow 0.15s ease !important;
   }

   html body #theme-energy-slider::-webkit-slider-thumb:active,
   html body #lofi-volume-slider::-webkit-slider-thumb:active,
   html body #setting-lofi-volume::-webkit-slider-thumb:active,
   html body .lofi-volume-slider::-webkit-slider-thumb:active {
     transform: scale(1.15) !important;
     cursor: grabbing !important;
   }
   ```

---

### 4. Sửa Dứt Điểm Lỗi Thanh Trạng Thái Tiến Trình (`#study-progress-fill`) Bị Cứng Ở 100% Ngay Từ Câu Đầu (`image_c69d72.jpg`)

#### 🔍 Giải phẫu nguyên nhân chính xác 100% từ `image_c69d72.jpg` và `css/style.css`:
- Nhìn vào `image_c69d72.jpg`: Đang ở câu **`1/13`**, nhưng thanh tiến trình màu trắng (`#study-progress-fill`) đã đầy cứng 100% từ đầu đến cuối và không tăng giảm khi chuyển câu!
- **Nguyên nhân**:
  - Trong `css/style.css` dòng `99223` có rule:
    ```css
    body.perf-compositor-anim .quiz-progress-fill {
      width: 100% !important;
      transform-origin: 0% 50%;
      transition: transform var(--dur-norm) var(--ease-out-soft) !important;
      will-change: transform;
    }
    ```
  - Khi `body` có class `perf-compositor-anim`, thuộc tính `width: 100% !important` trong CSS ghi đè hoàn toàn `progressFill.style.width` (vì inline style `progressFill.style.width = '...'` không có `!important`), trong khi `transform` đã bị đặt `transform: none !important`! Kết quả là thanh tiến trình bị khóa cứng ở `width: 100% !important` mọi lúc!

#### 🛠️ Giải pháp bắt buộc trong `js/app.js` và `css/style.css`:

1. **Trong `js/app.js` (Hàm `renderActiveStudyCard()`)**:
   - Cập nhật đồng thời biến CSS `--study-progress-pct` VÀ gán `width` kèm cờ `'important'`:
     ```javascript
     const progressFill = document.getElementById('study-progress-fill');
     // Tính tỷ lệ tiến trình: câu 1/13 là ~7.7%, câu 13/13 là 100% (tăng giảm mượt mà theo currentIndex)
     const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
     const pctStr = `${(ratio * 100).toFixed(2)}%`;
     if (progressFill) {
       progressFill.style.setProperty('--study-progress-pct', pctStr);
       progressFill.style.setProperty('width', pctStr, 'important');
       progressFill.style.removeProperty('transform');
     }
     ```
2. **Trong `css/style.css` (Ghi đè hoàn toàn `body.perf-compositor-anim .quiz-progress-fill`)**:
   ```css
   /* ==========================================================================
      4. SỬA DỨT ĐIỂM THANH TIẾN TRÌNH (#study-progress-fill) BỊ CỨNG Ở 100%
      ========================================================================== */
   html body .quiz-progress-fill,
   html body #study-progress-fill.quiz-progress-fill,
   html body.perf-compositor-anim .quiz-progress-fill,
   html body.perf-compositor-anim #study-progress-fill.quiz-progress-fill {
     display: block !important;
     width: var(--study-progress-pct, 0%) !important;
     height: 100% !important;
     margin: 0 !important;
     left: 0 !important;
     top: 0 !important;
     transform: none !important;
     transform-origin: 0% 50% !important;
     border-radius: 999px !important;
     transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1) !important;
     will-change: width !important;
   }
   ```

---

### 5. Tối Ưu Chuyển Theme Trên Mobile Mượt 60FPS (Zero Lag) & Sửa Bố Cục Sóng Mobile Không Còn Bị Chèn Chữ Đè Lên Sóng (`image_c6469b.png`)

#### 🔍 Giải phẫu 2 nguyên nhân từ `image_c6469b.png`:
1. **Tại sao phần sóng Mobile bị chèn quá nhiều khó nhìn chữ (`image_c6469b.png`)?**
   - Nhìn vào `image_c6469b.png`: Trên màn hình hẹp của điện thoại, hộp HUD chứa chữ `Trắng Đen (Monochrome Laser Wave)` và `LIGHT SPECTRUM // 550nm (48%)` đang được đặt `position: absolute` đè trực tiếp lên trên mặt sóng!
   - Vì chiều ngang Mobile hẹp, chữ bị gãy thành 3–4 dòng, làm hộp HUD phình to chiếm mất 75% chiều cao của buồng sóng, khiến các đỉnh sóng trắng đâm xuyên qua ngay sát chữ, nhìn cực kỳ chật chội và rối mắt!
2. **Tại sao chuyển Theme bên Mobile vẫn bị lag?**
   - Khi chuyển theme trên Mobile, toàn bộ hàng trăm phần tử DOM trên trang cùng lúc chạy `transition` đổi màu + tính toán lại `backdrop-filter: blur(...)` trong khi lớp phủ sóng `#theme-wave-transition-overlay` đang phóng to toàn màn hình $\rightarrow$ làm nghẽn GPU di động (Mobile Tile Overdraw)!
   - Đồng thời, khi kéo thanh trượt sóng trên Mobile, sự kiện `input` bắn ra liên tục mà chưa được gom vào `requestAnimationFrame`.

#### 🛠️ Giải pháp bắt buộc trong `css/style.css` và `js/app.js`:

1. **Trong `css/style.css` — Tách bạch hoàn toàn Thanh Chữ HUD nằm PHÍA TRÊN và Vùng Sóng nằm PHÍA DƯỚI trên Mobile (`@media (max-width: 768px)`), không bao giờ để chữ đè lên sóng**:
   ```css
   /* ==========================================================================
      5A. BỐ CỤC BUỒNG SÓNG TRÊN MOBILE (TÁCH CHỮ HUD LÊN TRÊN, SÓNG THOÁNG 100%)
      ========================================================================== */
   @media (max-width: 768px) {
     html body #theme-energy-chamber,
     html body .theme-energy-wave-chamber {
       display: flex !important;
       flex-direction: column !important;
       padding: 12px !important;
       gap: 10px !important;
       height: auto !important;
       min-height: 0 !important;
     }

     /* Đưa hộp chữ HUD ra khỏi position: absolute để KHÔNG BAO GIỜ đè lên mặt sóng trên Mobile */
     html body .energy-wave-hud,
     html body #theme-energy-chamber .energy-wave-hud,
     html body .energy-wave-header {
       position: relative !important;
       top: auto !important;
       left: auto !important;
       right: auto !important;
       bottom: auto !important;
       display: flex !important;
       flex-direction: row !important;
       align-items: center !important;
       justify-content: space-between !important;
       gap: 8px !important;
       width: 100% !important;
       padding: 8px 12px !important;
       margin: 0 !important;
       border-radius: 10px !important;
       box-sizing: border-box !important;
       z-index: 2 !important;
     }

     /* Chữ tên Theme gọn gàng trên 1 dòng, rõ nét, không gãy thành 3 dòng như image_c6469b.png */
     html body .energy-wave-hud .energy-theme-name,
     html body #energy-wave-theme-title,
     html body .energy-wave-hud > *:first-child {
       font-size: 0.84rem !important;
       font-weight: 700 !important;
       line-height: 1.25 !important;
       white-space: nowrap !important;
       overflow: hidden !important;
       text-overflow: ellipsis !important;
       flex: 1 1 auto !important;
       min-width: 0 !important;
     }

     /* Badge thông số bước sóng gọn trên 1 dòng bên phải */
     html body .energy-wave-hud .energy-spectrum-badge,
     html body #energy-wave-spectrum-label,
     html body .energy-wave-hud > *:last-child {
       font-size: 0.68rem !important;
       padding: 4px 8px !important;
       white-space: nowrap !important;
       flex-shrink: 0 !important;
       line-height: 1.1 !important;
     }

     /* Khung hiển thị sóng SVG nằm riêng bên dưới HUD, cao 84px thoáng đãng 100% không vướng chữ */
     html body .energy-wave-stage,
     html body .energy-wave-svg-wrap,
     html body #theme-energy-chamber svg {
       position: relative !important;
       width: 100% !important;
       height: 84px !important;
       min-height: 84px !important;
       max-height: 84px !important;
       margin: 0 !important;
       display: block !important;
     }
   }
   ```

2. **Trong `css/style.css` và `js/app.js` — Tối ưu hóa chuyển Theme trên Mobile đạt 60FPS tức thì (Zero GPU Lag)**:
   - **A. Khóa toàn bộ transition phụ trong tích tắc đổi biến CSS (`html.theme-switching-lock`)**:
     ```css
     /* Tắt mọi transition thừa của 500+ phần tử DOM khi đổi theme để đổi màu trong đúng 1 frame (< 2ms) */
     html.theme-switching-lock *,
     html.theme-switching-lock *::before,
     html.theme-switching-lock *::after {
       transition: none !important;
     }

     /* Chỉ giữ duy nhất lớp sóng chuyển cảnh chạy bằng GPU transform & opacity */
     html.theme-switching-lock #theme-wave-transition-overlay,
     html.theme-switching-lock #theme-wave-transition-overlay * {
       transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.34s ease-out !important;
     }

     /* Trên Mobile: Tắt backdrop-filter nặng trong lúc đang chạy sóng chuyển theme */
     @media (max-width: 768px) {
       html.theme-switching-lock .quiz-card,
       html.theme-switching-lock .deck-card,
       html.theme-switching-lock .hero-card,
       html.theme-switching-lock .stat-card,
       html.theme-switching-lock .bottom-nav {
         backdrop-filter: none !important;
         -webkit-backdrop-filter: none !important;
       }

       #theme-wave-transition-overlay {
         filter: none !important;
         backdrop-filter: none !important;
         -webkit-backdrop-filter: none !important;
         mix-blend-mode: normal !important;
         will-change: transform, opacity !important;
         contain: strict !important;
       }
     }
     ```
   - **B. Trong `js/app.js` (Hàm `setTheme` / `triggerThemeWaveTransition` / `onThemeEnergySliderInput`)**:
     - Khi gọi `setTheme(targetTheme, opts)`:
       1. Gắn `document.documentElement.classList.add('theme-switching-lock');`.
       2. Đổi `document.documentElement.setAttribute('data-theme', targetTheme);`.
       3. Đặt `clearTimeout(this._themeLockTimer); this._themeLockTimer = setTimeout(() => document.documentElement.classList.remove('theme-switching-lock'), 360);`.
     - Trong `onThemeEnergySliderInput(val)`:
       - Cập nhật ngay `syncRangeSliderVisual(sliderEl)` để vệt màu thanh kéo ăn theo ngón tay tức thì.
       - Gom việc vẽ lại đường sóng SVG `_updateEnergyWaveVisuals(val)` vào `requestAnimationFrame` (`if (this._waveRaf) return; this._waveRaf = requestAnimationFrame(() => { this._waveRaf = null; this._updateEnergyWaveVisuals(this._latestWaveVal); });`) để trên Mobile kéo thanh trượt mượt 60FPS không bao giờ bị nghẽn CPU!

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST — `promt1s.md`)

- [ ] **1. Tab Ngân hàng câu hỏi (`#view-bank`):** Khi bấm vào tab Ngân hàng câu hỏi, 8 thẻ đầu tiên float nhẹ từ dưới lên mượt mà như các block ở tab khác (không còn bị nháy, giật hay khựng); khi kéo xuống dưới, khung Skeleton Shimmer hiển thị mượt và từng lô câu hỏi tiếp theo sinh dần ra kèm hiệu ứng float-up.
- [ ] **2. Khử sạch ám tím dưới đáy sóng (`image_c646e0.png`):** Khi ở theme Trắng Đen (`bw`) hoặc Trắng Cam (`orange`), toàn bộ phần diện tích dưới sóng, viền sóng và đáy buồng sóng đồng bộ 100% theo màu Trắng Bạc / Cam Ấm của theme đó, hoàn toàn không còn vết ám tím.
- [ ] **3. Thanh kéo Âm lượng & Thanh kéo Sóng:** Hiển thị rõ vệt màu sáng rực ở bên phải nút kéo (`--slider-pct -> 100%`) tượng trưng cho mức đang bật (đồng bộ theo cả 3 theme Tím / Trắng / Cam), không còn để trơ mỗi cục nút tròn trên nền xám.
- [ ] **4. Thanh tiến trình (`#study-progress-fill` — `image_c69d72.jpg`):** Bắt đầu ở câu `1/13` chỉ hiển thị `~7.7%` sát mép trái, tăng/giảm chính xác theo từng câu khi bấm `Câu tiếp theo` hoặc `Câu trước`, không còn bị cứng ở 100%.
- [ ] **5. Mobile Chuyển Theme & Buồng Sóng (`image_c6469b.png`):** Hộp chữ HUD trên Mobile nằm gọn phía trên vùng sóng (1 dòng rõ nét, không đè lên sóng); chuyển theme trên Mobile mượt 60FPS không bị khựng lag.
- [ ] **6. Chạy `npm test` và `npm run build` đạt 100% PASS.**
