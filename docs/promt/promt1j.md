# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1J — TỐI ƯU HIỆU NĂNG 144+ FPS & 0MS TAB SWITCH, HOẠT ẢNH SCROLL-REVEAL TRÔI LÊN, SỬA TRIỆT ĐỂ POPUP CUỘN & KHÚC XẠ VIỀN KÍNH LỒI, KHÔI PHỤC MODE 5 + NÚT ĐẶT LẠI + ICON SIDEBAR/MOBILE & CHUẨN HÓA KÍNH MỜ TRẮNG CAM (promt1j.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
> - **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> - **Phiên bản đặc tả:** `1j` (Nối tiếp sau `1a` -> `1i`, tham chiếu bản đồ `docs/ARCHITECTURE_GRAPH.md`)
> - **Mục tiêu cốt lõi:** Giải quyết triệt để **13 vấn đề trực tiếp từ người dùng** qua 4 ảnh chụp màn hình mới nhất (`image_36e4a0.png`, `image_36e442.png`, `image_2d059f.png`, `image_2d021f.jpg`).
> - **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **Real Computed-Style Verification:** Không được chỉ kiểm tra `classList.contains('show')` trong unit test; bắt buộc kiểm tra `getComputedStyle(el).display !== 'none'`, `scrollHeight > clientHeight` (cho cuộn popup), và đo thời gian chuyển tab $< 16\text{ms}$!
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

---

## PHẦN 0: GIẢI PHẪU CHÍNH XÁC NGUYÊN NHÂN 8 LỖI NGHIÊM TRỌNG TRONG 4 ẢNH MỚI NHẤT

AI Coding Agent **BẮT BUỘC** đọc kỹ 8 nguyên nhân kỹ thuật dưới đây trước khi sửa code:

1. **Tại sao Popup "Thêm Câu Hỏi Mới" (`#modal-edit-card`) bị kẹt cứng KHÔNG THỂ SCROLL xuống để nhập đáp án B, C, D (`image_2d021f.jpg` — Mục 12)?**
   - Ở đợt `1h`, để tránh cắt menu dropdown, một rule CSS đã đặt `.modal-body { overflow: visible !important; }` trong khi thẻ cha `.modal-box` có `overflow: hidden !important; max-height: calc(100vh - 48px);`.
   - Khi `.modal-body` có `overflow: visible !important`, trình duyệt **tắt hoàn toàn thanh cuộn dọc của `.modal-body`**, khiến toàn bộ phần dưới của form Thêm/Sửa câu hỏi (`Đáp án B, C, D`, `Đáp án đúng`, `Giải thích`, nút `Lưu thay đổi`) bị cắt cụt bên dưới mép `.modal-box`!
   - **Cách sửa bắt buộc:** Đặt `.modal-body { overflow-y: auto !important; overflow-x: hidden !important; flex: 1 1 auto !important; min-height: 0 !important; max-height: calc(86vh - 140px) !important; overscroll-behavior: contain !important; }`!

2. **Tại sao Popup hiện lên vẫn chưa thấy hiệu ứng bóp méo, kéo dãn cong ở viền như kính lồi (`image_2d021f.jpg` — Mục 11)?**
   - Có **2 lỗi chí mạng** trong cách cài đặt filter ở đợt `1i`:
     1. Trong `<filter id="liquid-convex-lens">`, Agent đã đặt `<feGaussianBlur stdDeviation="16" />` **SAU** `<feDisplacementMap scale="32" />` trên toàn bộ `.modal-box`! Khi làm nhòe Gaussian 16px đè lên vùng ảnh vừa được bẻ cong, độ nhòe 16px xóa sạch mọi đường nét bị kéo dãn ở viền!
     2. Đồng thời `.modal-overlay` phía sau lại có nền đen đậm và `backdrop-filter: blur(6px)`, làm màn hình phía sau tối mù và nhòe sẵn trước khi đi qua mép kính của `.modal-box`!
   - **Cách sửa chuẩn quang học:**
     - `.modal-overlay` phía sau **TUYỆT ĐỐI KHÔNG BLUR** (`backdrop-filter: none !important; background: rgba(0, 0, 0, 0.16) !important;`) để các chữ và khối màu phía sau giữ nguyên độ sắc nét.
     - Tách `.modal-box` thành **2 vùng khúc xạ riêng biệt**:
       - **Vùng Vành Thấu Kính Lồi 24px sát viền (`.modal-box::before`):** Áp dụng `backdrop-filter: url(#liquid-convex-edge-lens) saturate(210%) contrast(115%)` với **độ nhòe cực thấp (`stdDeviation="0.8"`) và độ bẻ cong cực mạnh (`scale="64"`)**! Nhờ không bị blur làm nhòe ở vành 24px ngoài cùng, người dùng sẽ nhìn thấy rõ mồn một các dòng chữ và khối màu phía sau bị **uốn cong, kéo dãn và bóp méo dọc theo đường viền bo tròn của Popup**!
       - **Vùng Lõi Trung Tâm (`.modal-box`):** Áp dụng `backdrop-filter: blur(28px) saturate(180%)` để làm mờ mịn phần giữa giúp chữ trong Popup dễ đọc!

3. **Tại sao Chế độ 5 ("5. Ôn theo Môn & Chương" — `image_36e4a0.png`) vẫn KHÔNG ẤN VÀO ĐƯỢC dù unit test báo pass (`Mục 7`)?**
   - Trong `index.html`, thẻ `<div id="modal-topic-picker" class="modal-overlay" style="display: none;">` (hoặc sau khi `_closeModal` đóng lại) đang có thuộc tính inline `style="display: none;"`.
   - Trong khi đó, hàm `_showModal(modal)` chỉ chạy `modal.classList.add('show')` mà **không gỡ inline `style="display: none"`**, còn rule `.modal-overlay.show { display: grid; }` trong `css/style.css` dòng `3240` lại **không có `!important`**!
   - Kết quả: Inline `style="display: none"` thắng `.modal-overlay.show { display: grid }`, làm `#modal-topic-picker` luôn tàng hình trên màn hình thật dù `classList.contains('show')` là `true`!

4. **Tại sao Nút "Đặt lại" (Reset) trên các thẻ Bộ câu hỏi bị liệt (`Mục 13`)?**
   - Nguyên nhân 1: Trong `js/db.js` dòng `932`, hàm `resetDeckProgress(deckId)` cập nhật các thẻ về trạng thái `'new'` nhưng **quên gọi `this.invalidateSubjectCache()`**! Khi `this.renderDecks()` chạy ngay sau đó, `db.getSubjectSummaries()` trả về nguyên xi bộ nhớ đệm `_subjectCache` cũ (trong vòng 10 giây), nên con số `0 cần ôn` trên giao diện không hề thay đổi!
   - Nguyên nhân 2: Hộp thoại `window.confirm(...)` trong `confirmResetDeckProgress(deckId)` có thể bị chặn hoặc xung đột sự kiện trên thẻ `.deck-card`.

5. **Tại sao App bị cảm giác Delay khi bấm chuyển Tab và tụt xuống 60 FPS ở Trang chủ & Bộ câu hỏi (`Mục 4 & Mục 9`)?**
   - **Thủ phạm gây tụt FPS:** Đặt `backdrop-filter: blur(48px)` lên cùng lúc **25–30 thẻ** (`.stat-card`, `.study-mode-card`, `.deck-card`) trên cùng 1 trang khiến GPU phải chạy 30 lượt Gaussian Blur bán kính lớn mỗi khung hình!
   - **Thủ phạm gây Delay chuyển Tab:** Mỗi lần bấm vào tab `Tổng quan`, `Thư viện thẻ`, hay `Ngân hàng câu hỏi`, hàm `navigateTo(viewName)` lại chạy hiệu ứng rèm `#tab-wave-curtain` (380ms) VÀ gọi `renderDashboard()` / `renderDecks()` / `renderQuestionBank()` đọc lại toàn bộ IndexedDB từ ổ cứng (6–20 giao dịch nối tiếp nhau) rồi xóa trắng `innerHTML` vẽ lại từ đầu!

6. **Tại sao Icon "Cài đặt ứng dụng" ở đáy Sidebar Desktop bị lỗi ô vuông `▯` (`image_36e442.png` — Mục 8) và Icon "Ngân hàng" ở Thanh Mobile dưới cùng vẫn bị cục vuông đen (`image_2d059f.png` — Mục 10)?**
   - Ở đáy `.app-sidebar` (`index.html` dòng `112`), nút `#btn-pwa-install` vẫn chứa ký tự lỗi `▯` (do script xóa emoji `📲` để lại ký tự rỗng).
   - Ở `.bottom-nav` (`image_2d059f.png`), thẻ `<svg>` của nút `.bottom-nav-item.active` đang bị một rule trong `css/theme.css` hoặc `css/style.css` gán `background: var(--btn-primary-text)` / `fill: var(--btn-primary-text)` (`#09090b` đen đặc) hoặc `stroke-width` quá lớn lên thẻ `<svg>` / `<rect>`, biến icon thành một hình vuông đen đặc chỉ còn 1 chấm nhỏ ở giữa!

7. **Tại sao 4 ô ở khung Quote và 7 ô Chế độ học + Thẻ Bộ câu hỏi ở Mode Trắng Cam vẫn nhìn như màu trắng đơn sắc đặc chứ chưa đục mờ trong suốt (`image_36e4a0.png` — Mục 1 & Mục 2)?**
   - Vì ở đợt `1i`, độ đục (`alpha`) của thẻ ở Mode Trắng Cam bị đẩy lên `0.90` (`rgba(255, 251, 246, 0.90)`). Trên nền sáng, `90%` màu trắng che khuất hoàn toàn hình nền cam-trắng bên dưới, làm thẻ trông như một miếng nhựa trắng trơn đặc (`#ffffff`)!
   - Để tạo hiệu ứng **kính mờ đục trong suốt (Frosted Translucent Liquid Glass)** trên nền sáng của Mode Trắng Cam giống như ở Mode Trắng Đen và Tím Hồng: độ đục nền ở trạng thái nghỉ phải ở mức **`0.46 – 0.54`** kết hợp viền trắng sáng `1.5px solid rgba(255, 255, 255, 0.88)` và bóng sáng nội tâm `inset 0 2px 6px rgba(255, 255, 255, 0.95)`, để các ô gạch cam mờ ảo phía dưới ánh xuyên qua lớp kính đục; và khi trỏ chuột vào (Hover) thì độ đục giảm xuống **`0.16`** (trong suốt hẳn ra)!

8. **Tại sao chữ đen của Quote ở Mode Trắng Cam cần đổi sang font Trơn Thẳng Tuột (`Mục 3`)?**
   - Hiện tại chữ màu cam điểm nhấn (`.hero-title-accent`) đã là font có chân nghiêng ("râu râu, móc chân"). Nếu chữ màu đen (`.hero-title-main`, `.hero-title-sub`) cũng dùng font có chân thì cả câu đều có râu móc ở đầu chữ gây rối mắt. Người dùng yêu cầu rõ: **Chữ đen phải là chữ TRƠN, THẲNG TUỘT (Sans-serif đứng thẳng 100%, không râu ria)** để tương phản hoàn toàn với chữ cam có chân nghiêng!

---

## PHẦN 1: CHI TIẾT THỰC THI 13 MỤC THEO ĐÚNG THỨ TỰ YÊU CỦA NGƯỜI DÙNG

### Mục 1 & Mục 2: Chuẩn hóa Kính Mờ Đục Trong Suốt (Frosted Translucent Liquid Glass) cho 4 Ô Khung Quote, 7 Ô Chế Độ Học & Thẻ Bộ Câu Hỏi ở Mode Trắng Cam + Giảm Độ Đậm Màu Hover của Tím & Cam
```css
/* ==========================================================================
   MỤC 1 & MỤC 2: FROSTED TRANSLUCENT LIQUID GLASS CHO 4 Ô QUOTE, 7 MODE & DECKS
   ========================================================================== */

/* 1. Trạng thái bình thường của 4 ô ở khung Quote (.stat-card / .hero-stat-bento-card):
      Ở cả 3 theme (đặc biệt là Mode Trắng Cam), phải là Kính Mờ Đục Trong Suốt
      nhìn xuyên mờ thấy nền phía dưới (KHÔNG PHẢI MÀU TRẮNG ĐẶC!) */
html[data-theme="white-orange"] .stat-card,
html[data-theme="white-orange"] .hero-stat-bento-card {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.52) 0%,
    rgba(255, 245, 235, 0.38) 100%
  ) !important;
  backdrop-filter: blur(18px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.88) !important;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.95),
    inset 0 -1px 2px rgba(234, 88, 12, 0.08),
    0 10px 28px -8px rgba(154, 52, 18, 0.10) !important;
  color: #1c1917 !important;
}

/* Khi trỏ chuột vào 4 ô ở khung Quote: Lên màu đơn sắc NHẠT DỊU, HIỆN ĐẠI (Không đậm gắt, không gradient!) */
html[data-theme="purple-pink"] .stat-card:hover,
html[data-theme="purple-pink"] .hero-stat-bento-card:hover {
  background: rgba(192, 132, 252, 0.28) !important; /* Tím pastel dịu nhẹ */
  border-color: rgba(216, 180, 254, 0.75) !important;
  color: #ffffff !important;
  box-shadow: 0 14px 32px -8px rgba(192, 132, 252, 0.28),
              inset 0 1.5px 2px rgba(255, 255, 255, 0.45) !important;
}

html[data-theme="monochrome"] .stat-card:hover,
html[data-theme="monochrome"] .hero-stat-bento-card:hover {
  background: rgba(255, 255, 255, 0.22) !important;
  border-color: rgba(255, 255, 255, 0.85) !important;
  color: #ffffff !important;
}

html[data-theme="white-orange"] .stat-card:hover,
html[data-theme="white-orange"] .hero-stat-bento-card:hover {
  background: rgba(251, 146, 60, 0.32) !important; /* Cam đào nhạt dịu, trong trẻo */
  border-color: rgba(234, 88, 12, 0.65) !important;
  color: #7c2d12 !important;
  box-shadow: 0 14px 32px -8px rgba(234, 88, 12, 0.20),
              inset 0 1.5px 2px rgba(255, 255, 255, 0.85) !important;
}
html[data-theme="white-orange"] .stat-card:hover *,
html[data-theme="white-orange"] .hero-stat-bento-card:hover * {
  color: #7c2d12 !important;
}

/* 2. MỤC 2: 7 Ô Chế độ học (.study-mode-card) & Thẻ Bộ câu hỏi (.deck-card) ở Mode Trắng Cam:
      Trạng thái nghỉ: Kính mờ đục Liquid Glass (alpha ~0.54 + blur 18px + viền khúc xạ trắng sáng).
      Khi trỏ chuột vào (Hover): TRONG SUỐT HƠN HẲN (alpha giảm xuống 0.16) để nổi bật so với các thẻ xung quanh! */
html[data-theme="white-orange"] .study-mode-card,
html[data-theme="white-orange"] .mode-card,
html[data-theme="white-orange"] .deck-card {
  background: linear-gradient(
    145deg,
    rgba(255, 253, 250, 0.56) 0%,
    rgba(255, 242, 228, 0.44) 100%
  ) !important;
  backdrop-filter: blur(18px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.90) !important;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.96),
    inset 1px 0 2px rgba(255, 255, 255, 0.75),
    inset 0 -1.5px 3px rgba(234, 88, 12, 0.08),
    0 12px 32px -8px rgba(154, 52, 18, 0.11) !important;
  color: #1c1917 !important;
}

html[data-theme="white-orange"] .study-mode-card:hover,
html[data-theme="white-orange"] .mode-card:hover,
html[data-theme="white-orange"] .deck-card:hover {
  background: rgba(255, 250, 245, 0.16) !important; /* Trong suốt hẳn ra khi trỏ vào! */
  backdrop-filter: blur(8px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(8px) saturate(150%) !important;
  border-color: rgba(234, 88, 12, 0.72) !important;
  box-shadow:
    inset 0 2px 5px rgba(255, 255, 255, 0.98),
    0 18px 40px -8px rgba(234, 88, 12, 0.22) !important;
  transform: translateY(-3px) !important;
}
```

### Mục 3: Đổi Font Chữ Đen của Quote ở Mode Trắng Cam sang Chữ Trơn Thẳng Tuột (Không Râu Ria) — Đối Lập Với Chữ Cam Có Chân Móc Nghiêng
```css
/* MỤC 3: Chữ đen (.hero-title-main, .hero-title-sub) là FONT TRƠN THẲNG TUỘT (Sans-serif không chân, không râu móc),
   khác biệt hoàn toàn với chữ màu cam (.hero-title-accent) có chân móc nghiêng! */
html[data-theme="white-orange"] #hero-title,
html[data-theme="white-orange"] .hero-title,
html[data-theme="white-orange"] #hero-title .hero-title-main,
html[data-theme="white-orange"] #hero-title .hero-title-sub,
html[data-theme="white-orange"] .hero-title span:not(.hero-title-accent) {
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  font-style: normal !important; /* Thẳng tuột 100%, trơn nhẵn, không có râu móc ở trên */
  font-weight: 800 !important;
  letter-spacing: -0.035em !important;
  color: #1c1917 !important;
}

/* Chữ màu cam điểm nhấn giữ nguyên kiểu có chân nghiêng (râu móc nghệ thuật) */
html[data-theme="white-orange"] #hero-title .hero-title-accent,
html[data-theme="white-orange"] .hero-title .hero-title-accent {
  font-family: 'Playfair Display', 'Newsreader', 'Instrument Serif', Georgia, serif !important;
  font-style: italic !important;
  font-weight: 400 !important;
  letter-spacing: -0.01em !important;
  color: #ea580c !important;
}
```

### Mục 4 & Mục 9: Xóa Bỏ Hoàn Toàn Độ Trễ Khi Ấn Chuyển Tab (0ms Instant Tab Switch) & Tối Ưu Hiệu Năng Lên 144+ FPS
1. **Bộ nhớ đệm In-Memory (`_memCache`) trong `js/db.js` để triệt tiêu độ trễ đọc đĩa IndexedDB khi chuyển tab:**
   - Trong `js/db.js`, thêm bộ nhớ đệm RAM cho `getAllSubjects()`, `getAllDecks()`, `getAllCards()`:
     ```javascript
     // Lưu kết quả vào this._cardsCache, this._decksCache, this._subjectsCache sau lần đọc đầu tiên.
     // Chỉ xóa cache (this.invalidateAllCaches()) khi có thao tác GHI (saveCard, saveCardsBatch, deleteCard, saveDeck, deleteDeck, saveSubject, deleteSubject, resetDeckProgress, importAll).
     ```
   - Nhờ đó, khi người dùng chuyển giữa các tab `Tổng quan` <-> `Thư viện thẻ` <-> `Ngân hàng câu hỏi` <-> `Thống kê`, thời gian lấy dữ liệu giảm từ **80ms–200ms xuống 0.05ms**!
2. **Chuyển Tab Tức Thì (`0ms`) trong `navigateTo(viewName)` (`js/app.js` dòng `736`):**
   - **Tắt hẳn `#tab-wave-curtain`** (xóa hoặc đặt `display: none !important` cho `#tab-wave-curtain`) vì lớp phủ curtain chạy 380ms chính là nguyên nhân gây cảm giác khựng/delay khi bấm tab!
   - Đổi class `.active` trên `.nav-item`, `.bottom-nav-item`, và `.view-section` **ngay lập tức trong cùng 1 frame đồng bộ** khi người dùng bấm nút.
   - Thêm cờ `this._viewRendered = { dashboard: false, decks: false, bank: false, stats: false }`. Khi dữ liệu kho thẻ chưa có thay đổi (`!this._dbDirty`), chuyển qua lại giữa các tab sẽ **giữ nguyên DOM hiện có** mà không xóa `innerHTML` vẽ lại từ đầu!
3. **Tối ưu GPU Compositor 144+ FPS:**
   - Giới hạn bán kính `backdrop-filter` của các thẻ lặp lại nhiều lần (`.study-mode-card`, `.deck-card`, `.stat-card`) ở mức `blur(16px) saturate(180%)` (nhanh hơn gấp 9–16 lần so với `blur(48px)` trên GPU mà độ mịn tương đương nhờ lớp gradient sữa).
   - Trên `.bank-card-item` (Ngân hàng câu hỏi có hàng trăm thẻ), dùng nền kính tĩnh không `backdrop-filter` kèm `content-visibility: auto; contain-intrinsic-size: 0 220px;`.

### Mục 5: Hoạt Ảnh Trôi Lên Mượt Mà Khi Kéo Xuống (Scroll-Reveal Float-Up Animation cho các Object/Block chưa hiện sẵn)
1. **Thêm CSS Scroll-Reveal vào `css/theme.css`:**
   ```css
   .scroll-reveal-item {
     opacity: 0;
     transform: translate3d(0, 32px, 0) scale(0.985);
     transition:
       opacity 0.48s cubic-bezier(0.22, 1, 0.36, 1),
       transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
     transition-delay: var(--reveal-delay, 0ms);
     will-change: opacity, transform;
   }

   .scroll-reveal-item.is-revealed {
     opacity: 1;
     transform: translate3d(0, 0, 0) scale(1);
   }
   ```
2. **Thêm bộ quan sát `App.initScrollRevealObserver()` trong `js/app.js`:**
   ```javascript
   initScrollRevealObserver() {
     if (typeof IntersectionObserver === 'undefined') return;
     if (!this._scrollObserver) {
       this._scrollObserver = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
           if (entry.isIntersecting) {
             const el = entry.target;
             el.classList.add('is-revealed');
             setTimeout(() => {
               el.style.willChange = 'auto';
             }, 550);
             this._scrollObserver.unobserve(el);
           }
         });
       }, {
         root: null,
         rootMargin: '0px 0px -30px 0px',
         threshold: 0.08
       });
     }
     this.observeUnrevealedItems();
   },

   observeUnrevealedItems() {
     if (!this._scrollObserver) return;
     const selectors = '.study-mode-card, .deck-card, .subject-group, .bank-card-item, .stat-card, .lms-preview-card';
     document.querySelectorAll(selectors).forEach((el, idx) => {
       if (!el.classList.contains('scroll-reveal-bound')) {
         el.classList.add('scroll-reveal-bound', 'scroll-reveal-item');
         // Tạo độ trễ lệch nhịp nhẹ (stagger 0ms -> 120ms) theo cột để các thẻ trôi lên cực mượt
         const colDelay = (idx % 3) * 45;
         el.style.setProperty('--reveal-delay', `${colDelay}ms`);
         this._scrollObserver.observe(el);
       }
     });
   },
   ```
   Gọi `this.observeUnrevealedItems()` sau mỗi lần `renderDashboard()`, `renderDecks()`, `renderQuestionBank()`, và `renderStatsView()`.

### Mục 6: Mode Trắng Đen (`monochrome`) — Bỏ Gạch Ngang Chữ Khi Chọn Câu Sai Trong Quiz (Chỉ Cần Màu Đỏ Nổi Bật)
- Trong `css/theme.css`, cập nhật lại rule của `.quiz-option-btn.incorrect` ở Mode Trắng Đen:
  ```css
  html[data-theme="monochrome"] .quiz-option-btn.incorrect {
    background: rgba(239, 68, 68, 0.26) !important;
    border: 2px solid #ef4444 !important;
    border-left: 6px solid #ef4444 !important;
    color: #fca5a5 !important;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.30) !important;
  }
  html[data-theme="monochrome"] .quiz-option-btn.incorrect .quiz-option-content,
  html[data-theme="monochrome"] .quiz-option-btn.incorrect * {
    text-decoration: none !important; /* TUYỆT ĐỐI KHÔNG GẠCH NGANG CHỮ! */
  }
  ```

### Mục 7: Sửa Dứt Điểm Chế Độ 5 ("5. Ôn theo Môn & Chương" — `image_36e4a0.png`) Bấm Vào Phải Mở Ngay 100%
1. **Sửa lỗi `style="display: none"` chặn hiển thị `#modal-topic-picker` trong `_showModal` và `_closeModal` (`js/app.js`):**
   ```javascript
   _showModal(modal) {
     const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
     if (!el) return;
     el.style.removeProperty('display');
     el.style.setProperty('display', 'grid', 'important');
     el.style.setProperty('opacity', '1', 'important');
     el.style.setProperty('visibility', 'visible', 'important');
     el.style.setProperty('pointer-events', 'auto', 'important');
     el.classList.add('show', 'active');
     document.body.classList.add('modal-open');
   },

   _closeModal(modal) {
     const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
     if (!el) return;
     el.classList.remove('show', 'active');
     el.style.setProperty('display', 'none', 'important');
     if (document.querySelectorAll('.modal-overlay.show').length === 0) {
       document.body.classList.remove('modal-open');
     }
   },
   ```
2. **Gắn bộ bắt sự kiện Capture-Phase toàn cục trong `setupEventListeners()` (`js/app.js`):**
   Bất kể thẻ Mode 5 trong `index.html` có `onclick` gì hay bị đổi cấu trúc thế nào, bộ lắng nghe này sẽ bắt trúng 100% cú click vào thẻ số 5 (`5. Ôn theo Môn & Chương`) hoặc nút `Chọn môn / chương`:
   ```javascript
   document.addEventListener('click', (e) => {
     const modeCard = e.target.closest('.study-mode-card, .mode-card');
     if (modeCard) {
       const text = (modeCard.textContent || '').toLowerCase();
       const onclickAttr = modeCard.getAttribute('onclick') || '';
       if (
         text.includes('5.') ||
         text.includes('môn & chương') ||
         text.includes('môn / chương') ||
         text.includes('chủ đề/tag') ||
         onclickAttr.includes('Topic') ||
         onclickAttr.includes("'topic'")
       ) {
         e.preventDefault();
         e.stopPropagation();
         this.openTopicPickerModal();
       }
     }
   }, true); // Capture phase!
   ```
3. **Đảm bảo `openTopicPickerModal()` mở Modal TRƯỚC rồi mới nạp dữ liệu (tránh mọi lỗi async làm kẹt modal):**
   ```javascript
   async openTopicPickerModal(deckId = null, preselectedSubjectId = null) {
     this.currentDeckIdForTopic = deckId || null;
     this.selectedSubjectForTopicPicker = preselectedSubjectId || 'all';
     if (!this.selectedTopicsForReview) this.selectedTopicsForReview = new Set();
     this.selectedTopicsForReview.clear();

     const modal = document.getElementById('modal-topic-picker');
     if (modal) {
       this._showModal(modal); // Mở modal hiển thị ngay lập tức ở 0ms!
     }
     try {
       await this.renderTopicPickerModalContent();
     } catch (err) {
       console.error('Error rendering topic picker content:', err);
     }
   },
   ```

### Mục 8: Khắc Phục Icon Nút "Cài Đặt Ứng Dụng" (`#btn-pwa-install`) Ở Đáy Sidebar Desktop (`image_36e442.png`)
- Trong `index.html` (dòng `111–117`, khu vực `.sidebar-footer`), nút `#btn-pwa-install` đang hiển thị ký tự lỗi `▯`.
- Thay thế nội dung `#btn-pwa-install` trong `index.html` bằng icon SVG tải ứng dụng chuẩn:
  ```html
  <button id="btn-pwa-install" type="button" class="btn btn-secondary sidebar-install-btn" style="display: none;" title="Cài đặt ứng dụng" data-tooltip="Cài đặt ứng dụng">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none"></path>
      <polyline points="7 10 12 15 17 10" fill="none"></polyline>
      <line x1="12" y1="15" x2="12" y2="3" fill="none"></line>
    </svg>
    <span class="nav-label">Cài đặt ứng dụng</span>
  </button>
  ```
- Trong CSS: Khi `.app-sidebar` thu gọn (`width <= 88px`), `.sidebar-install-btn` có kích thước tròn `44px x 44px`, `padding: 0 !important`, căn giữa icon SVG hoàn hảo, không bị bóp méo thành hình viên thuốc dọc hẹp như trong `image_36e442.png`!

### Mục 10: Sửa Dứt Điểm Thanh Điều Hướng Dưới Cùng Trên Mobile (`.bottom-nav` — `image_2d059f.png`)
- **Nguyên nhân trong `image_2d059f.png`:** Nút `.bottom-nav-item.active` (`Ngân hàng`) có phần tử `<svg>` bị biến thành một hình vuông màu đen (`#09090b`) với 1 chấm nhỏ ở giữa!
- **Cách tìm và diệt tận gốc:**
  1. Trong `index.html` (`<nav class="bottom-nav">`), thay mới hoàn toàn 5 nút `.bottom-nav-item` và thay icon của `"Bộ thẻ"` + `"Ngân hàng"` bằng `<path>` thuần (không dùng thẻ `<rect>` để tránh mọi rule CSS gán `fill` hoặc `background` lên `rect`):
     ```html
     <nav class="bottom-nav" id="mobile-bottom-nav">
       <button type="button" class="bottom-nav-item active" data-view="dashboard">
         <svg class="bnav-svg" viewBox="0 0 24 24" width="20" height="20"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
         <span>Trang chủ</span>
       </button>
       <button type="button" class="bottom-nav-item" data-view="decks">
         <svg class="bnav-svg" viewBox="0 0 24 24" width="20" height="20"><path d="M4 4h6v16H4z"/><path d="M14 4h6v16h-6z"/></svg>
         <span>Bộ thẻ</span>
       </button>
       <button type="button" class="bottom-nav-item" data-view="bank">
         <svg class="bnav-svg" viewBox="0 0 24 24" width="20" height="20"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z"/><path d="M4 9h16"/><path d="M9 21V9"/></svg>
         <span>Ngân hàng</span>
       </button>
       <button type="button" class="bottom-nav-item" data-view="stats">
         <svg class="bnav-svg" viewBox="0 0 24 24" width="20" height="20"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
         <span>Thống kê</span>
       </button>
       <button type="button" class="bottom-nav-item" data-view="settings">
         <svg class="bnav-svg" viewBox="0 0 24 24" width="20" height="20"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
         <span>Cài đặt</span>
       </button>
     </nav>
     ```
  2. Trong `css/theme.css` (đặt ở dòng cuối cùng của file):
     ```css
     #mobile-bottom-nav .bottom-nav-item,
     #mobile-bottom-nav .bottom-nav-item.active {
       color: var(--text-secondary) !important;
       background: transparent !important;
     }
     #mobile-bottom-nav .bottom-nav-item.active {
       background: var(--accent-soft) !important;
       color: var(--text-primary) !important;
     }
     html[data-theme="white-orange"] #mobile-bottom-nav .bottom-nav-item.active {
       background: rgba(234, 88, 12, 0.16) !important;
       color: #ea580c !important;
     }
     #mobile-bottom-nav .bnav-svg,
     #mobile-bottom-nav .bnav-svg * {
       fill: none !important;
       background: none !important;
       background-color: transparent !important;
       border: none !important;
       box-shadow: none !important;
       padding: 0 !important;
       stroke: currentColor !important;
       stroke-width: 2px !important;
       stroke-linecap: round !important;
       stroke-linejoin: round !important;
     }
     ```
  3. Kiểm tra thêm trong `js/app.js` xem có hàm JS nào đang can thiệp sửa `innerHTML` hoặc `style` của `.bottom-nav-item svg` khi chuyển tab không — nếu có thì xóa bỏ ngay!

### Mục 11 & Mục 12: Sửa Lỗi Không Cuộn Được Popup Thêm Câu Hỏi Mới (`image_2d021f.jpg`) & Tạo Hiệu Ứng Bóp Méo Khúc Xạ Viền Kính Lồi Thực Thụ Cho Popup
1. **Khôi phục thanh cuộn dọc cho mọi Popup (`.modal-body` — Mục 12):**
   ```css
   .modal-box {
     display: flex !important;
     flex-direction: column !important;
     max-height: min(88vh, 820px) !important;
     max-height: min(88dvh, 820px) !important;
     overflow: hidden !important;
     position: relative !important;
   }

   .modal-header {
     flex-shrink: 0 !important;
     position: relative !important;
     z-index: 2 !important;
   }

   .modal-body {
     flex: 1 1 auto !important;
     min-height: 0 !important;
     max-height: calc(88vh - 140px) !important;
     overflow-y: auto !important;
     overflow-x: hidden !important;
     overscroll-behavior: contain !important;
     -webkit-overflow-scrolling: touch !important;
     position: relative !important;
     z-index: 2 !important;
     padding: 20px 24px !important;
   }

   .modal-footer {
     flex-shrink: 0 !important;
     position: relative !important;
     z-index: 2 !important;
   }
   ```
2. **Tạo hiệu ứng Bóp Méo / Kéo Dãn Khúc Xạ Viền Kính Lồi Thực Thụ cho Popup (`Mục 11`):**
   - Trong `initLiquidGlassLensFilter()` (`js/app.js`), tách riêng 2 bộ lọc SVG:
     - **`#liquid-edge-warp` (Dành riêng cho vành viền lồi 24px của Popup):** Chỉ chứa `<feImage>` + `<feDisplacementMap scale="68" xChannelSelector="R" yChannelSelector="G"/>` + `<feGaussianBlur stdDeviation="0.6"/>` (KHÔNG làm nhòe 16px để giữ nguyên hình ảnh các vật thể phía sau bị uốn cong và kéo dãn mạnh dọc theo mép viền!).
   - Trong CSS của `.modal-overlay` và `.modal-box`:
     ```css
     /* 1. Tuyệt đối KHÔNG làm blur .modal-overlay để giữ nét các vật thể phía sau cho vành kính của .modal-box bẻ cong! */
     .modal-overlay {
       background: rgba(0, 0, 0, 0.14) !important;
       backdrop-filter: none !important;
       -webkit-backdrop-filter: none !important;
     }

     /* 2. Lõi của .modal-box: Kính mờ đục trong suốt */
     .modal-box {
       background: var(--modal-convex-bg) !important;
       backdrop-filter: url(#liquid-edge-warp) blur(18px) saturate(190%) !important;
       -webkit-backdrop-filter: url(#liquid-edge-warp) blur(18px) saturate(190%) !important;
       border-radius: 34px !important;
       border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
       box-shadow:
         inset 0 2px 4px rgba(255, 255, 255, 0.85),
         inset 2px 0 3px rgba(255, 255, 255, 0.45),
         inset 0 -3px 6px rgba(255, 255, 255, 0.25),
         inset 0 0 32px rgba(255, 255, 255, 0.16),
         0 30px 70px -12px rgba(0, 0, 0, 0.50) !important;
     }

     /* 3. Vành thấu kính lồi 22px sát mép viền (.modal-box::before):
           Sử dụng backdrop-filter: url(#liquid-edge-warp) KHÔNG BLUR để bẻ cong và kéo dãn trực tiếp không gian sát mép viền! */
     .modal-box::before {
       content: '' !important;
       position: absolute !important;
       inset: 0 !important;
       border-radius: inherit !important;
       padding: 22px !important;
       backdrop-filter: url(#liquid-edge-warp) saturate(220%) contrast(115%) brightness(1.08) !important;
       -webkit-backdrop-filter: url(#liquid-edge-warp) saturate(220%) contrast(115%) brightness(1.08) !important;
       background: radial-gradient(
         closest-side,
         transparent calc(100% - 24px),
         rgba(255, 255, 255, 0.18) calc(100% - 8px),
         rgba(255, 255, 255, 0.42) 100%
       ) !important;
       -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
       -webkit-mask-composite: xor !important;
       mask-composite: exclude !important;
       pointer-events: none !important;
       z-index: 1 !important;
     }
     ```

### Mục 13: Khôi Phục 100% Nút "Đặt Lại" (Reset Tiến Trình) Tại Các Tập Thẻ Câu Hỏi
1. **Trong `js/db.js` (hàm `resetDeckProgress(deckId)` dòng `932`):**
   - Ngay sau `await this.saveCardsBatch(cards, { forceNew: false });`, **BẮT BUỘC gọi `this.invalidateSubjectCache();`** (và xóa mọi cache RAM)!
2. **Trong `js/app.js` (hàm `confirmResetDeckProgress(deckId)` dòng `1667`):**
   - Kiểm tra tất cả các nút `"Đặt lại"` / `"Reset"` trên thẻ bộ câu hỏi ở cả **Trang chủ (`#view-dashboard`)** và **Thư viện thẻ (`#view-decks`)**:
     - Đảm bảo thuộc tính `onclick="event.stopPropagation(); App.confirmResetDeckProgress('${deck.id}')"` được gắn chính xác.
     - Trong `confirmResetDeckProgress(deckId)`:
       ```javascript
       async confirmResetDeckProgress(deckId) {
         if (!deckId) return;
         const deck = await db.getDeck(deckId);
         if (!deck) {
           this.showToast('Không tìm thấy bộ thẻ cần đặt lại.', 'warning');
           return;
         }
         const resetCount = await db.resetDeckProgress(deckId);
         db.invalidateSubjectCache();
         this._dbDirty = true;
         await this.updateGlobalStats();
         await this.renderDashboard();
         await this.renderDecks();
         this.showToast(`Đã đặt lại tiến trình học của "${deck.name}" (${resetCount} câu hỏi về trạng thái Cần ôn).`, 'success');
       },
       ```
       *(Thực thi đặt lại ngay lập tức và báo Toast rõ ràng thay vì dùng `window.confirm()` vốn bị trình duyệt/webview chặn làm nút bị liệt!)*

---

## PHẦN 2: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

AI Coding Agent phải kiểm tra từng mục bằng script/headless browser thực tế trước khi kết thúc:

1. [ ] **4 Ô Khung Quote ở Mode Trắng Cam (`Mục 1`):** Trạng thái bình thường là kính mờ đục trong suốt (`alpha ~0.45–0.52` + `blur(18px)`), nhìn xuyên mờ thấy nền phía dưới; khi trỏ vào mới lên màu cam đào dịu nhẹ (`rgba(251, 146, 60, 0.32)`), và màu hover của Tím Hồng cũng đã giảm độ đậm xuống dịu nhẹ (`rgba(192, 132, 252, 0.28)`).
2. [ ] **7 Ô Chế Độ & Thẻ Bộ Câu Hỏi ở Mode Trắng Cam (`Mục 2`):** Trạng thái bình thường là kính mờ đục Liquid Glass (`alpha ~0.56` + `blur(18px)`), khi trỏ chuột vào thì trong suốt hẳn ra (`alpha ~0.16`) nổi bật so với các thẻ xung quanh.
3. [ ] **Font Chữ Đen Quote ở Mode Trắng Cam (`Mục 3`):** Chữ đen (`.hero-title-main`, `.hero-title-sub`) là font trơn thẳng tuột (`Plus Jakarta Sans` / `Inter` weight 800, `font-style: normal`), không có râu móc ở trên, đối lập hoàn toàn với chữ cam có chân nghiêng.
4. [ ] **0ms Tab Switch & 144+ FPS (`Mục 4 & Mục 9`):** Đã thêm RAM Cache trong `js/db.js`, tắt `#tab-wave-curtain`, bấm chuyển tab phản hồi ngay ở `0ms` không có độ trễ, cuộn trang chủ và thư viện thẻ mượt 144+ FPS.
5. [ ] **Hoạt Ảnh Scroll-Reveal Trôi Lên (`Mục 5`):** Khi kéo chuột xuống, các thẻ/khối bên dưới trôi mượt từ dưới lên (`translate3d(0, 32px, 0) -> 0`) nhờ `IntersectionObserver`.
6. [ ] **Câu Sai Quiz ở Mode Trắng Đen (`Mục 6`):** Đã bỏ gạch ngang chữ (`text-decoration: none !important`), chỉ hiển thị nền và viền đỏ nổi bật.
7. [ ] **Chế Độ 5 Ôn Theo Môn & Chương (`Mục 7`):** Đã sửa `_showModal()` gắn `display: grid !important` và thêm Capture-Phase Click Listener; bấm vào thẻ số 5 mở ngay `#modal-topic-picker` với chiều cao thực tế `> 200px`.
8. [ ] **Icon Cài Đặt Ứng Dụng Ở Đáy Sidebar (`Mục 8`):** Đã thay ký tự lỗi `▯` trong `#btn-pwa-install` bằng icon SVG tải ứng dụng chuẩn và căn chỉnh gọn gàng.
9. [ ] **Thanh Điều Hướng Dưới Cùng Trên Mobile (`Mục 10`):** Đã viết lại `<nav class="bottom-nav">` bằng `<path>` thuần và khóa `background: transparent !important; fill: none !important;`; nút `"Ngân hàng"` và `"Bộ thẻ"` khi active hiển thị sắc nét, không còn cục vuông đen/trắng.
10. [ ] **Hiệu Ứng Bóp Méo Viền Popup & Cuộn Dọc Trong Popup Thêm Câu Hỏi (`Mục 11 & Mục 12`):** `.modal-body` có `overflow-y: auto !important` cuộn xuống nhập đáp án B, C, D, Giải thích và bấm Lưu trơn tru; vành `.modal-box::before` áp dụng `url(#liquid-edge-warp)` bẻ cong/kéo dãn rõ nét các vật thể phía sau tại viền Popup.
11. [ ] **Nút Đặt Lại Trên Thẻ Bộ Câu Hỏi (`Mục 13`):** Bấm nút `"Đặt lại"` trên bất kỳ bộ thẻ nào lập tức reset toàn bộ thẻ về trạng thái mới, gọi `db.invalidateSubjectCache()`, cập nhật ngay số câu `Cần ôn` trên giao diện và hiện Toast báo thành công.
12. [ ] **Tests & Build:** Chạy `npm test` và `npm run build` đạt 100% PASS.
