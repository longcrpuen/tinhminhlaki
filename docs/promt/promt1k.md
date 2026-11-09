# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1K — KHẮC PHỤC KHẨN CẤP LỖI ĐÓNG POPUP & MODE 5 TRỐNG, TÁI THIẾT KẾ POPUP LIQUID GLASS THEO NGUYÊN LÝ THỊ GIÁC & `swiftui-expert-skill`, TRÌNH PHÁT NHẠC NỀN LOFI (.MP3/.M4A) THAY CHỮ AI SLOP DƯỚI QUOTE, KIẾN TRÚC LIGHT MODE ĐA SẮC & TỐI ƯU HIỆU NĂNG CẤU HÌNH THẤP (promt1k.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
> - **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> - **Phiên bản đặc tả:** `1k` (Nối tiếp sau `1a` -> `1j`, tham chiếu `docs/ARCHITECTURE_GRAPH.md`)
> - **Mục tiêu cốt lõi:** Giải quyết triệt để **13 yêu cầu mới nhất của người dùng** từ 7 ảnh chụp màn hình (`image_1def96.jpg` đến `image_1d6f97.png`), tích hợp triết lý Liquid Glass & tối ưu hiệu năng từ `swiftui-expert-skill`, và xây dựng hệ thống Nhạc nền Lofi (`js/lofi-music.js` + hỗ trợ `.mp3`/`.m4a`).
> - **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **Interactive Verification:** Bắt buộc kiểm thử thực tế việc **Mở VÀ Đóng mọi Popup** (bấm `✕`, bấm `Hủy`, bấm nền ngoài, bấm `ESC`), kiểm thử **Mode 5 hiển thị đầy đủ danh sách Môn & Chương và vào học hiển thị câu hỏi thật (không bao giờ kẹt ở `"Câu hỏi đang tải..."`)**.
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

---

## PHẦN 0: GIẢI PHẪU NGUYÊN NHÂN KỸ THUẬT CỦA CÁC LỖI KHẨN CẤP TRONG 7 ẢNH MỚI NHẤT

AI Coding Agent **BẮT BUỘC** đọc kỹ 5 chẩn đoán dưới đây trước khi sửa code:

1. **LỖI NGHIÊM TRỌNG 1 (Mục 6): Tại sao các Popup một khi bật lên là KHÔNG ĐÓNG ĐƯỢC (kể cả ấn `✕`, `Hủy`, hay `ESC`)?**
   - Ở đợt `1j`, hàm `_showModal(modal)` đã gán trực tiếp inline style:
     `el.style.setProperty('display', 'grid', 'important');`
   - Trong khi đó, hàm `closeModal()` (trong `setupEventListeners` tại `js/app.js` dòng `993`) khi bấm nút `.modal-close` (`✕`, `Hủy`) hoặc bấm phím `Escape` chỉ chạy:
     `document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));`
     mà **KHÔNG xóa inline style `display: grid !important`**!
   - Vì inline `style="display: grid !important"` có độ ưu tiên cao nhất, dù class `.show` đã bị gỡ bỏ thì `.modal-overlay` vẫn bị ép hiển thị `display: grid !important` vĩnh viễn trên màn hình!
   - **Cách sửa bắt buộc:**
     - Tuyệt đối KHÔNG gán `el.style.setProperty('display', 'grid', 'important')` trong `_showModal()`. Chỉ gọi `el.style.removeProperty('display'); el.classList.add('show', 'active');`.
     - Trong cả `_closeModal(el)` VÀ `closeModal()` (cũng như phím `Escape`), luôn luôn gọi:
       ```javascript
       el.classList.remove('show', 'active');
       el.style.removeProperty('display');
       ```
     - Và trong CSS (`css/theme.css`):
       ```css
       .modal-overlay:not(.show) {
         display: none !important;
         opacity: 0 !important;
         visibility: hidden !important;
         pointer-events: none !important;
       }
       .modal-overlay.show {
         display: grid !important;
         opacity: 1 !important;
         visibility: visible !important;
         pointer-events: auto !important;
       }
       ```

2. **LỖI NGHIÊM TRỌNG 2 (Mục 9): Tại sao Chế độ 5 ("5. Ôn Theo Môn Học & Chương") mở ra bị trống trơn (`image_1d8662.jpg`) và khi bấm "Bắt đầu ôn tập" lại kẹt cứng ở `"Câu hỏi đang tải..."` (`image_1d7b97.jpg`)?**
   - Nhìn vào `image_1d8662.jpg`: Trong `#modal-topic-picker`, dòng `1. Lọc theo Môn học:` không có thẻ `<div id="topic-picker-subjects">` (hoặc ID trong HTML không khớp với JS), và hàm `renderTopicPickerModalContent()` bị văng lỗi ngầm trong khối `try { ... } catch` trước khi kịp điền dữ liệu vào `#topic-picker-chips`!
   - Nhìn vào `image_1d7b97.jpg`: Khi bấm `"Bắt đầu ôn tập"`, màn hình chuyển sang `#view-study` nhưng hiện nguyên xi chữ tĩnh của HTML gốc (`ÔN TẬP | 1/10 | Câu hỏi đang tải...`). Lý do là:
     1. Trong `js/app.js`, vẫn còn **hàm `startTopicReview()` / `openTopicPickerModal()` cũ bị trùng lặp** ở cuối file (`dòng 6600–7050`) ghi đè lên hàm mới!
     2. Hàm `navigateTo('study')` chỉ bật hiển thị `<section id="view-study">` chứ không tự gọi `this.renderActiveStudyCard()`, hoặc `this.activeSession.cards` truyền vào rỗng / lỗi khiến `_renderQuizContent(card)` dừng trước khi gán `qTextEl.innerHTML`!

3. **LỖI NGHIÊM TRỌNG 3 (Mục 7): Tại sao các Popup trong `image_1d8e41.jpg` và `image_1d8662.jpg` nhìn rất xấu (có một viền xám dày 22px như khung ảnh đám tang bao quanh hộp đen bên trong kèm 1 hình tròn đen ở giữa)?**
   - Ở đợt `1j`, `.modal-box::before` dùng `padding: 22px` + `mask-composite: exclude` + `background: radial-gradient(closest-side, transparent calc(100% - 24px), rgba(255,255,255,0.42) 100%)`.
   - Thuộc tính `radial-gradient(closest-side, ...)` vẽ một **hình tròn tối** ngay giữa khung chữ nhật, còn `padding: 22px` tạo ra một **viền khung tranh màu xám đục rộng 22px tách biệt hẳn với phần ruột màu đen bên trong**!
   - **Nguyên lý thị giác con người (Human Visual Perception) đối với khối Liquid Glass thật:**
     Mắt người nhận diện một khối thủy tinh cong lồi (như trong iOS 26 / visionOS) khi:
     - **Không có ranh giới khung trong / khung ngoài tách rời:** Toàn bộ Popup phải là **1 khối vật chất trong mờ đồng nhất duy nhất** từ mép này sang mép kia (`padding: 0`, xóa bỏ hoàn toàn cái khung viền xám 22px của `.modal-box::before`!).
     - **Hiệu ứng Fresnel & Specular Rim ở sát mép 1.5px:** Ánh sáng môi trường chỉ phản xạ sáng sắc nét ở đúng đường viền cong ngoài cùng dày `1px–1.5px` (cạnh trên và cạnh trái sáng hơn cạnh dưới), kết hợp một lớp **tán sắc nội tâm mềm (`inset 0 1px 1px rgba(255,255,255,0.65), inset 0 16px 36px -12px rgba(255,255,255,0.14)`)** lan nhẹ từ mép vào trong mà không tạo thành vạch phân cách.
     - **Độ truyền sáng bão hòa cao (`backdrop-filter: blur(28px) saturate(200%) brightness(1.06)`):** Lớp kính hút màu sắc của các vật thể phía sau và làm chúng rực lên nhẹ nhàng xuyên qua lớp sương mờ.

4. **LỖI 4 (Mục 3): Tại sao ở Mode Trắng Đen (`image_1def7e.png`), khi trỏ chuột vào khung Quote, ánh sáng hắt ra ở cạnh dưới vẫn là màu Tím?**
   - Trong `css/style.css` dòng `897`, `.hero-card:hover` đang dùng `box-shadow: inset 0 1px 0 var(--glass-highlight), var(--card-hover-glow);`, trong đó `--card-hover-glow` ở `:root` là bóng màu tím `rgba(139, 92, 246, 0.28)` chưa được ghi đè ở `monochrome` và `white-orange`!

5. **LỖI 5 (Mục 1): Tại sao ở Mode Trắng Cam (`image_1def96.jpg`), khi trỏ vào 4 ô dưới Quote, màu cam bị xỉn nâu, chữ bị lu mờ và màu cam bị lẹm ra ngoài viền?**
   - Do `.stat-card` thiếu `overflow: hidden !important; border-radius: 20px !important; background-clip: padding-box !important;` khiến lớp nền/pseudo-element tràn ra góc nhọn ngoài viền, và màu cam `rgba(251, 146, 60, 0.32)` pha với chữ nâu tạo cảm giác đục xỉn.

---

## PHẦN 1: ĐÁNH GIÁ & TÍCH HỢP `swiftui-expert-skill` VÀO DỰ ÁN (MỤC 7, MỤC 8 & TỐI ƯU HIỆU NĂNG)

### 1.1. Nhận định về `benjaminasterA/antigravity-awesome-skills/skills/swiftui-expert-skill/SKILL.md`
Qua kiểm tra toàn bộ cấu trúc của `swiftui-expert-skill` (từ kho `antigravity-awesome-skills` / `AvdLee/SwiftUI-Agent-Skill`), skill này có 2 mô-đun kiến trúc cực kỳ giá trị có thể chuyển hóa và áp dụng trực tiếp vào dự án Web PWA **TinhMinhLaKey**:
1. **Mô-đun `references/liquid-glass.md` (Chuẩn thiết kế iOS 26+ Liquid Glass của Apple):**
   - **Quy tắc `GlassEffectContainer` (Gom nhóm bề mặt kính):** Các phần tử kính nằm gần nhau (như 4 ô thống kê trong khung Quote, hoặc các nút trên thanh công cụ) phải chia sẻ chung một ngữ cảnh lấy mẫu quang học thay vì mỗi phần tử con tự chồng thêm một lớp `backdrop-filter` nặng nề.
   - **Quy tắc `.interactive()` có chọn lọc:** Chỉ các phần tử thực sự tương tác (thẻ chế độ học, thẻ bộ câu hỏi, nút bấm) mới đổi trạng thái khúc xạ/độ trong suốt khi hover/tap; các khung bao tĩnh giữ nguyên độ mờ ổn định.
   - **Quy tắc đồng nhất hình học (`Continuous Squircle Curvature`):** Bán kính bo góc của phần tử con bên trong (`R_inner`) luôn tuân theo công thức đồng tâm với phần tử cha (`R_inner = max(8px, R_outer - padding)`) để không bao giờ bị lệch góc hay lẹm viền!
2. **Mô-đun `references/performance-patterns.md` (Tối ưu hóa đường nóng & chống giật lag cho máy cấu hình thấp):**
   - **Gating Geometry & Scroll/Hover Updates:** Không bao giờ chạy `getBoundingClientRect()` hoặc cập nhật biến CSS trên từng sự kiện `mousemove` nếu không cần thiết (chỉ dùng CSS `:hover` thuần do GPU Compositor xử lý 100%).
   - **Pre-filtered & Stable-Identity Virtualized Lists:** Không lọc mảng inline trong lúc render; tiền xử lý danh sách và chỉ render phần tử trong vùng nhìn thấy (`IntersectionObserver` + `content-visibility: auto`).

### 1.2. Cài đặt Skill vào dự án
AI Agent **BẮT BUỘC** tạo/cập nhật file `.agent/skills/swiftui-liquid-glass-web/SKILL.md` (và `.claude/skills/swiftui-liquid-glass-web/SKILL.md`) đúc kết toàn bộ quy tắc **iOS 26 Liquid Glass Optical Physics + Low-End Device Performance Patterns** từ `swiftui-expert-skill` để áp dụng xuyên suốt dự án.

---

## PHẦN 2: CHI TIẾT THỰC THI 13 MỤC THEO ĐÚNG YÊU CẦU CỦA NGƯỜI DÙNG

### Mục 1, Mục 2 & Mục 10: Kiến Trúc Light Mode Chuẩn Chỉ (Dễ Dàng Đổi Màu Mới Chỉ Từ 1 Biến Gốc) + Làm Sáng Màu Cam Light Neon & Mờ Trong Suốt 4 Ô Khung Quote (`image_1def96.jpg`)
1. **Mục 10 — Kiến trúc Light Mode Đa Sắc (`Parametric Light Mode Engine` trong `css/theme.css`):**
   Thiết kế `html[data-theme="white-orange"]` dựa trên **5 biến hạt nhân màu chủ đạo (`--light-neon-accent`)** ở đầu block. Sau này khi người dùng muốn thêm theme Trắng Xanh Dương, Trắng Xanh Lá hay Trắng Hồng, chỉ cần đổi đúng 5 dòng này là toàn bộ giao diện Light Mode tự động đổi theo 100%:
   ```css
   html[data-theme="white-orange"] {
     /* === BẢNG ĐIỀU KHIỂN HẠT NHÂN MÀU LIGHT MODE (Chỉ cần đổi 5 biến này để tạo màu Light Mode mới) === */
     --light-accent-neon: #ff6b2b;                  /* Cam Light Neon tươi sáng, rực rỡ */
     --light-accent-neon-hover: #ff5500;            /* Cam Neon đậm hơn nhẹ khi nhấn */
     --light-accent-rgb: 255, 107, 43;              /* Kênh RGB để tự động sinh toàn bộ độ trong suốt */
     --light-accent-soft: rgba(255, 107, 43, 0.14); /* Nền phủ nhẹ */
     --light-accent-glow: rgba(255, 107, 43, 0.38); /* Ánh sáng phát quang */

     /* Tự động dẫn xuất toàn bộ hệ thống từ 5 biến hạt nhân trên */
     --accent: var(--light-accent-neon);
     --accent-strong: var(--light-accent-neon-hover);
     --accent-soft: var(--light-accent-soft);
     --accent-border: rgba(var(--light-accent-rgb), 0.45);
     --accent-glow: var(--light-accent-glow);
     --btn-primary-bg: var(--light-accent-neon);
     --btn-primary-text: #ffffff;
     --btn-primary-hover-bg: var(--light-accent-neon-hover);
     --card-hover-glow: 0 18px 48px -8px var(--light-accent-glow);
   }
   ```
2. **Mục 1 & Mục 2 — Sửa 4 Ô Thống Kê dưới Khung Quote (`image_1def96.jpg`):**
   - **Trạng thái bình thường (Mục 2):** Làm **mờ nhẹ và trong suốt hơn nữa**, tiệm cận với độ trong của mặt kính khung Quote lớn (giống hệt cách làm của 2 theme Tím Hồng và Trắng Đen), tuyệt đối không để trắng đục đặc và khóa chặt `border-radius: 20px !important; overflow: hidden !important; background-clip: padding-box !important;` để **không bao giờ bị lẹm màu ra ngoài viền**:
     ```css
     .stat-card,
     .hero-stat-bento-card {
       border-radius: 20px !important;
       overflow: hidden !important;
       background-clip: padding-box !important;
       position: relative !important;
       transition: background-color 0.24s cubic-bezier(0.22, 1, 0.36, 1),
                   border-color 0.24s cubic-bezier(0.22, 1, 0.36, 1),
                   box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1),
                   transform 0.24s cubic-bezier(0.22, 1, 0.36, 1) !important;
     }

     /* Cả 4 ô bên trong ::before / ::after không được lẹm ra ngoài */
     .stat-card::before,
     .stat-card::after,
     .hero-stat-bento-card::before,
     .hero-stat-bento-card::after {
       display: none !important;
       content: none !important;
     }

     html[data-theme="white-orange"] .stat-card,
     html[data-theme="white-orange"] .hero-stat-bento-card {
       background: rgba(255, 255, 255, 0.24) !important; /* Mờ trong nhẹ nhàng tiệm cận khung Quote */
       backdrop-filter: blur(16px) saturate(160%) !important;
       -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
       border: 1.5px solid rgba(255, 255, 255, 0.68) !important;
       box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.85),
                   0 8px 24px -6px rgba(154, 52, 18, 0.08) !important;
       color: #1c1917 !important;
     }
     ```
   - **Khi trỏ chuột vào 4 ô ở Mode Trắng Cam (Mục 1):** Lên màu **Cam Sáng Light Neon (`#ff6b2b`)** tươi tắn, hiện đại, và **đổi toàn bộ chữ bên trong sang màu Trắng Tinh (`#ffffff`)** để chữ nổi bật sắc nét 100%, không bị chèn hay lu mờ:
     ```css
     html[data-theme="white-orange"] .stat-card:hover,
     html[data-theme="white-orange"] .hero-stat-bento-card:hover {
       background: var(--light-accent-neon, #ff6b2b) !important;
       border-color: rgba(255, 255, 255, 0.92) !important;
       box-shadow: 0 14px 32px -6px rgba(var(--light-accent-rgb, 255, 107, 43), 0.45),
                   inset 0 1.5px 2px rgba(255, 255, 255, 0.65) !important;
       transform: translateY(-3px) !important;
       color: #ffffff !important;
     }
     html[data-theme="white-orange"] .stat-card:hover *,
     html[data-theme="white-orange"] .hero-stat-bento-card:hover * {
       color: #ffffff !important;
       opacity: 1 !important;
     }
     ```

### Mục 3: Sửa Ánh Sáng Hắt Ra Dưới Khung Quote Khi Trỏ Chuột Vào Ở Mode Trắng Đen (`image_1def7e.png`) & Mode Trắng Cam
- **Hiện trạng lỗi (`image_1def7e.png`):** Trong `css/style.css` dòng `897` và `6845`, `.hero-card:hover` vẫn dùng biến `--card-hover-glow` mặc định màu tím!
- **Cách sửa bắt buộc trong `css/theme.css`:**
  ```css
  /* Đồng bộ ánh sáng hắt ra dưới khung Quote (.hero-card / .hero-inspiration-stage) khi trỏ chuột vào */
  html[data-theme="purple-pink"] .hero-card:hover,
  html[data-theme="purple-pink"] .hero-inspiration-stage:hover {
    border-color: rgba(192, 132, 252, 0.55) !important;
    box-shadow: 0 20px 52px -10px rgba(192, 132, 252, 0.35),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.25) !important;
  }

  /* Mode Trắng Đen: Ánh sáng trắng bạc tinh khiết, TUYỆT ĐỐI KHÔNG CÒN MÀU TÍM! */
  html[data-theme="monochrome"] .hero-card:hover,
  html[data-theme="monochrome"] .hero-inspiration-stage:hover {
    border-color: rgba(255, 255, 255, 0.60) !important;
    box-shadow: 0 20px 52px -10px rgba(255, 255, 255, 0.22),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.35) !important;
  }

  /* Mode Trắng Cam: Ánh sáng Cam Light Neon ấm áp hắt ra dưới khung Quote! */
  html[data-theme="white-orange"] .hero-card:hover,
  html[data-theme="white-orange"] .hero-inspiration-stage:hover {
    border-color: rgba(var(--light-accent-rgb, 255, 107, 43), 0.65) !important;
    box-shadow: 0 20px 52px -10px rgba(var(--light-accent-rgb, 255, 107, 43), 0.38),
                inset 0 2px 4px rgba(255, 255, 255, 0.90) !important;
  }
  ```

### Mục 4 & Mục 5: Đồng Bộ Hiệu Ứng "Bình Thường Mờ Đục (Blur) -> Trỏ Vào Trong Suốt" Cho Cả Mode Trắng Đen (`image_1def7d.jpg`) VÀ Toàn Bộ Thẻ Ở Thư Viện Thẻ (`#view-decks`)
- **Yêu cầu (Mục 4 & Mục 5):**
  1. Ở **Mode Trắng Đen (`monochrome` — `image_1def7d.jpg`)**, 7 ô Chế độ học hiện đang bị đen trơn và khi trỏ vào chưa chuyển sang trong suốt như 2 theme kia.
  2. Áp dụng cùng quy luật **"Ban đầu mờ đục (Frosted Blur), trỏ chuột vào thì trong suốt hẳn ra để phân biệt với các thẻ còn lại"** cho **cả 7 ô Chế độ học (`.study-mode-card`) LẪN toàn bộ các thẻ Bộ câu hỏi (`.deck-card` ở cả Trang chủ `#view-dashboard` và Thư viện thẻ `#view-decks`)** trên cả 3 theme!
- **Cách sửa bắt buộc trong `css/theme.css`:**
  ```css
  /* ==========================================================================
     MỤC 4 & MỤC 5: UNIFIED FROSTED-TO-CLEAR HOVER CHO 7 MODE CARDS & DECK CARDS
     (Áp dụng đồng bộ trên cả #view-dashboard và #view-decks cho cả 3 Theme)
     ========================================================================== */

  /* 1. Trạng thái bình thường (Resting State): Kính mờ đục (Frosted Blur) */
  .study-mode-card,
  .mode-card,
  .deck-card,
  #view-decks .deck-card,
  #dashboard-decks-grid .deck-card {
    background: var(--glass-block-rest-bg) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border: 1.5px solid var(--glass-block-rest-border) !important;
    box-shadow: var(--glass-block-rest-shadow) !important;
    transition: background 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                backdrop-filter 0.25s ease,
                border-color 0.25s ease,
                box-shadow 0.25s ease,
                transform 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
  }

  /* 2. Khi trỏ chuột vào (Hover State): TRONG SUỐT HẲN RA (Crystal Clear) để nổi bật so với các thẻ xung quanh! */
  .study-mode-card:hover,
  .mode-card:hover,
  .deck-card:hover,
  #view-decks .deck-card:hover,
  #dashboard-decks-grid .deck-card:hover {
    background: var(--glass-block-hover-bg) !important;
    backdrop-filter: blur(4px) saturate(120%) !important;
    -webkit-backdrop-filter: blur(4px) saturate(120%) !important;
    border-color: var(--glass-block-hover-border) !important;
    box-shadow: var(--glass-block-hover-shadow) !important;
    transform: translateY(-3px) !important;
  }

  /* Định nghĩa biến cho từng Theme */
  html[data-theme="purple-pink"] {
    --glass-block-rest-bg: rgba(30, 23, 52, 0.78);
    --glass-block-rest-border: rgba(255, 255, 255, 0.16);
    --glass-block-rest-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.18), 0 12px 30px -8px rgba(0, 0, 0, 0.55);
    --glass-block-hover-bg: rgba(192, 132, 252, 0.06); /* Trong suốt hẳn ra! */
    --glass-block-hover-border: rgba(192, 132, 252, 0.75);
    --glass-block-hover-shadow: inset 0 1.5px 3px rgba(255, 255, 255, 0.35), 0 18px 40px -8px rgba(192, 132, 252, 0.25);
  }

  html[data-theme="monochrome"] {
    --glass-block-rest-bg: rgba(28, 28, 34, 0.76); /* Đục mờ khói xám để thấy rõ hiệu ứng blur trên nền đen */
    --glass-block-rest-border: rgba(255, 255, 255, 0.20);
    --glass-block-rest-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.22), 0 12px 30px -8px rgba(0, 0, 0, 0.75);
    --glass-block-hover-bg: rgba(255, 255, 255, 0.03); /* Khi trỏ vào: Trong suốt nhìn xuyên thấu hình nền! */
    --glass-block-hover-border: rgba(255, 255, 255, 0.85);
    --glass-block-hover-shadow: inset 0 1.5px 3px rgba(255, 255, 255, 0.45), 0 18px 40px -8px rgba(255, 255, 255, 0.18);
  }

  html[data-theme="white-orange"] {
    --glass-block-rest-bg: rgba(255, 252, 248, 0.62);
    --glass-block-rest-border: rgba(255, 255, 255, 0.90);
    --glass-block-rest-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.96), 0 12px 30px -8px rgba(154, 52, 18, 0.10);
    --glass-block-hover-bg: rgba(255, 255, 255, 0.12); /* Khi trỏ vào: Trong suốt hẳn ra! */
    --glass-block-hover-border: var(--light-accent-neon, #ff6b2b);
    --glass-block-hover-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.98), 0 18px 40px -8px rgba(var(--light-accent-rgb, 255, 107, 43), 0.24);
  }
  ```

### Mục 6 & Mục 7: Sửa Ngay Lỗi Không Đóng Được Popup & Tái Thiết Kế Khối Bo Cong Liquid Glass Thật Sự (`image_1d8e41.jpg`, `image_1d8662.jpg`)
1. **Sửa lỗi không đóng được Popup (Mục 6):**
   - Trong `js/app.js`, cập nhật `_showModal`, `_closeModal` và toàn bộ sự kiện đóng modal:
     ```javascript
     _showModal(modal) {
       const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
       if (!el) return;
       el.style.removeProperty('display');
       el.style.removeProperty('opacity');
       el.style.removeProperty('visibility');
       el.style.removeProperty('pointer-events');
       el.classList.add('show', 'active');
       document.body.classList.add('modal-open');
     },

     _closeModal(modal) {
       if (!modal) {
         this.closeAllModals();
         return;
       }
       const el = typeof modal === 'string' ? document.getElementById(modal) : modal;
       if (el) {
         el.classList.remove('show', 'active');
         el.style.removeProperty('display');
         el.style.removeProperty('opacity');
         el.style.removeProperty('visibility');
         el.style.removeProperty('pointer-events');
       }
       if (document.querySelectorAll('.modal-overlay.show').length === 0) {
         document.body.classList.remove('modal-open');
       }
     },

     closeAllModals() {
       document.querySelectorAll('.modal-overlay').forEach(m => {
         m.classList.remove('show', 'active');
         m.style.removeProperty('display');
         m.style.removeProperty('opacity');
         m.style.removeProperty('visibility');
         m.style.removeProperty('pointer-events');
       });
       document.body.classList.remove('modal-open');
     },
     ```
   - Gắn bộ lắng nghe đóng Modal toàn cục (Capture Phase) cho mọi nút `.modal-close`, click ra ngoài `.modal-overlay`, và phím `Escape`:
     ```javascript
     document.addEventListener('click', (e) => {
       const closeBtn = e.target.closest('.modal-close');
       if (closeBtn) {
         e.preventDefault();
         e.stopPropagation();
         const parentModal = closeBtn.closest('.modal-overlay');
         if (parentModal) this._closeModal(parentModal);
         else this.closeAllModals();
         return;
       }
       if (e.target.classList && e.target.classList.contains('modal-overlay') && e.target.classList.contains('show')) {
         this._closeModal(e.target);
       }
     }, true);

     window.addEventListener('keydown', (e) => {
       if (e.key === 'Escape') {
         this.closeAllModals();
       }
     }, true);
     ```
2. **Tái thiết kế Khối Bo Cong Liquid Glass cho Popup theo Nguyên Lý Thị Giác (`Mục 7` — Xóa bỏ khung viền xám 22px xấu xí trong `image_1d8e41.jpg`):**
   - **XÓA BỎ HOÀN TOÀN `.modal-box::before` có `padding: 22px` và `radial-gradient(closest-side, ...)`!**
   - Áp dụng thiết kế **Continuous Curved Glass Volume (Khối Kính Lồi Đồng Nhất)** chuẩn Apple visionOS / iOS 26:
     ```css
     .modal-overlay {
       background: rgba(0, 0, 0, 0.22) !important;
       backdrop-filter: none !important;
       -webkit-backdrop-filter: none !important;
     }

     /* Khối Popup Liquid Glass: 1 thể tích kính cong duy nhất, không có khung viền xám tách rời! */
     .modal-box {
       position: relative !important;
       border-radius: 36px !important;
       background: var(--popup-glass-volume-bg) !important;
       backdrop-filter: blur(28px) saturate(210%) brightness(1.06) !important;
       -webkit-backdrop-filter: blur(28px) saturate(210%) brightness(1.06) !important;
       border: 1.5px solid var(--popup-glass-rim-border) !important;
       box-shadow: var(--popup-glass-volume-shadow) !important;
       overflow: hidden !important;
     }

     /* Ánh sáng Fresnel mềm mại uốn theo đường cong 36px của mép kính (không cắt vạch 22px!) */
     .modal-box::before {
       content: '' !important;
       position: absolute !important;
       inset: 0 !important;
       border-radius: inherit !important;
       padding: 0 !important;
       -webkit-mask: none !important;
       mask: none !important;
       background: radial-gradient(
         120% 100% at 50% 0%,
         rgba(255, 255, 255, 0.22) 0%,
         rgba(255, 255, 255, 0.04) 45%,
         transparent 75%
       ) !important;
       pointer-events: none !important;
       z-index: 0 !important;
     }

     html[data-theme="purple-pink"] {
       --popup-glass-volume-bg: linear-gradient(155deg, rgba(42, 32, 68, 0.62) 0%, rgba(22, 16, 38, 0.52) 100%);
       --popup-glass-rim-border: rgba(255, 255, 255, 0.32);
       --popup-glass-volume-shadow:
         inset 0 1.5px 2px rgba(255, 255, 255, 0.65),
         inset 1px 0 1.5px rgba(255, 255, 255, 0.35),
         inset 0 18px 38px -12px rgba(255, 255, 255, 0.12),
         inset 0 -18px 36px -14px rgba(192, 132, 252, 0.16),
         0 32px 72px -12px rgba(0, 0, 0, 0.65);
     }

     html[data-theme="monochrome"] {
       --popup-glass-volume-bg: linear-gradient(155deg, rgba(38, 38, 44, 0.58) 0%, rgba(18, 18, 22, 0.48) 100%);
       --popup-glass-rim-border: rgba(255, 255, 255, 0.36);
       --popup-glass-volume-shadow:
         inset 0 1.5px 2px rgba(255, 255, 255, 0.75),
         inset 1px 0 1.5px rgba(255, 255, 255, 0.40),
         inset 0 18px 38px -12px rgba(255, 255, 255, 0.14),
         inset 0 -18px 36px -14px rgba(255, 255, 255, 0.08),
         0 32px 72px -12px rgba(0, 0, 0, 0.78);
     }

     html[data-theme="white-orange"] {
       --popup-glass-volume-bg: linear-gradient(155deg, rgba(255, 252, 248, 0.68) 0%, rgba(255, 240, 226, 0.54) 100%);
       --popup-glass-rim-border: rgba(255, 255, 255, 0.92);
       --popup-glass-volume-shadow:
         inset 0 2px 3px rgba(255, 255, 255, 0.98),
         inset 1.5px 0 2px rgba(255, 255, 255, 0.80),
         inset 0 20px 40px -12px rgba(255, 255, 255, 0.55),
         inset 0 -18px 36px -14px rgba(var(--light-accent-rgb, 255, 107, 43), 0.12),
         0 32px 72px -12px rgba(120, 53, 15, 0.20);
     }
     ```

### Mục 9: Sửa Triệt Để Chế Độ 5 ("5. Ôn Theo Môn Học & Chương" — `image_1d8662.jpg` & `image_1d7b97.jpg`)
- **Tại sao `image_1d8662.jpg` bị trống và `image_1d7b97.jpg` bị kẹt ở `"Câu hỏi đang tải..."`?**
  - Trong `index.html`, cấu trúc bên trong `#modal-topic-picker` đang bị thiếu thẻ `#topic-picker-subjects` (chỉ có chữ `1. Lọc theo Môn học:` nằm ngang với nút `Ôn toàn bộ môn đang chọn`), và khi bấm `Bắt đầu ôn tập`, hàm `startTopicReview()` cũ gọi `startSession` mà không truyền câu hỏi hợp lệ hoặc `renderActiveStudyCard()` bị văng lỗi!
- **Cách sửa tự phục hồi 100% (Self-Healing DOM + Direct Session Launcher) trong `js/app.js`:**
  Thay thế toàn bộ `openTopicPickerModal` và `startTopicReview` bằng đoạn code **tự dựng lại toàn bộ `.modal-body` và `.modal-footer` của `#modal-topic-picker`** (không phụ thuộc vào HTML cũ trong `index.html` có bị thiếu thẻ hay không!):
  ```javascript
  async openTopicPickerModal(deckId = null, preselectedSubjectId = null) {
    this.currentDeckIdForTopic = deckId || null;
    this.selectedSubjectForTopicPicker = preselectedSubjectId || 'all';
    if (!this.selectedTopicsForReview) this.selectedTopicsForReview = new Set();
    this.selectedTopicsForReview.clear();

    const modal = document.getElementById('modal-topic-picker');
    if (!modal) return;

    // Bắt buộc tự tái tạo cấu trúc chuẩn bên trong #modal-topic-picker để không bao giờ bị thiếu phần tử!
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="form-group" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
            <label class="form-label" style="margin: 0; font-weight: 700;">1. Chọn Môn học:</label>
            <button type="button" class="btn btn-secondary" id="btn-topic-study-whole-subject" style="padding: 6px 14px; font-size: 0.82rem;">
              Ôn toàn bộ môn đang chọn
            </button>
          </div>
          <div id="topic-picker-subjects" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px;">
            <label class="form-label" style="margin: 0; font-weight: 700;">2. Chọn Chương / Chủ đề cần ôn:</label>
            <button type="button" class="btn btn-secondary" id="btn-topic-toggle-all" style="padding: 6px 14px; font-size: 0.82rem;">
              Chọn tất cả
            </button>
          </div>
          <div id="topic-picker-chips" class="topic-chips-container" style="max-height: 280px; overflow-y: auto; padding: 10px; border-radius: 16px; border: 1px solid var(--input-box-border); min-height: 72px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start;"></div>
        </div>
      `;
    }
    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary modal-close">Hủy</button>
        <button type="button" class="btn btn-primary" id="btn-topic-start-now">Bắt đầu ôn tập</button>
      `;
    }

    this._showModal(modal);
    await this.renderTopicPickerModalContent();

    const wholeSubjBtn = document.getElementById('btn-topic-study-whole-subject');
    if (wholeSubjBtn) {
      wholeSubjBtn.onclick = () => {
        this._closeModal(modal);
        this.startSubjectSession(this.selectedSubjectForTopicPicker || 'all', 'srs');
      };
    }
    const toggleAllBtn = document.getElementById('btn-topic-toggle-all');
    if (toggleAllBtn) {
      toggleAllBtn.onclick = () => this.toggleAllTopicsInPicker();
    }
    const startNowBtn = document.getElementById('btn-topic-start-now');
    if (startNowBtn) {
      startNowBtn.onclick = () => this.startTopicReview();
    }
  },

  async renderTopicPickerModalContent() {
    const subjContainer = document.getElementById('topic-picker-subjects');
    const chipsContainer = document.getElementById('topic-picker-chips');
    if (!chipsContainer) return;

    const allCards = await db.getAllCards();
    const allDecks = await db.getAllDecks();
    const subjects = await db.getAllSubjects();

    // Map deckId -> subjectId
    const deckToSubj = new Map();
    allDecks.forEach(d => deckToSubj.set(String(d.id), d.subjectId || 'subj_unassigned'));

    const getCardSubjectId = (c) => {
      if (c.subjectId && c.subjectId !== 'subj_unassigned') return c.subjectId;
      return deckToSubj.get(String(c.deckId)) || c.subjectId || 'subj_unassigned';
    };

    if (subjContainer) {
      const subjList = [
        { id: 'all', name: `Tất cả môn (${allCards.length})` },
        ...subjects.map(s => {
          const cnt = allCards.filter(c => getCardSubjectId(c) === s.id).length;
          return { id: s.id, name: `${s.name} (${cnt})` };
        })
      ];
      subjContainer.innerHTML = subjList.map(s => `
        <button type="button" class="subject-filter-pill ${String(this.selectedSubjectForTopicPicker) === String(s.id) ? 'active' : ''}" data-subj-id="${this._escapeHtml(String(s.id))}" style="padding: 6px 14px; border-radius: 999px; cursor: pointer;">
          ${this._escapeHtml(s.name)}
        </button>
      `).join('');

      subjContainer.querySelectorAll('button[data-subj-id]').forEach(btn => {
        btn.onclick = async (ev) => {
          ev.stopPropagation();
          this.selectedSubjectForTopicPicker = btn.getAttribute('data-subj-id') || 'all';
          this.selectedTopicsForReview.clear();
          await this.renderTopicPickerModalContent();
        };
      });
    }

    // Lọc danh sách câu hỏi theo môn đang chọn
    const filteredCards = this.selectedSubjectForTopicPicker === 'all'
      ? allCards
      : allCards.filter(c => getCardSubjectId(c) === this.selectedSubjectForTopicPicker);

    // Gom nhóm theo Chương / Chủ đề
    const topicCounts = new Map();
    filteredCards.forEach(c => {
      const tName = String(c.topic || c.tag || 'Chương chung').trim() || 'Chương chung';
      topicCounts.set(tName, (topicCounts.get(tName) || 0) + 1);
    });

    if (topicCounts.size === 0) {
      chipsContainer.innerHTML = '<p style="color: var(--text-secondary); margin: 8px 4px;">Môn học này hiện chưa có câu hỏi nào.</p>';
      return;
    }

    // Mặc định nếu người dùng chưa chọn chương nào, tự động chọn tất cả các chương của môn đó để bấm "Bắt đầu ôn tập" là vào học ngay!
    if (this.selectedTopicsForReview.size === 0) {
      for (const tName of topicCounts.keys()) {
        this.selectedTopicsForReview.add(tName);
      }
    }

    chipsContainer.innerHTML = Array.from(topicCounts.entries()).map(([tName, cnt]) => {
      const isSelected = this.selectedTopicsForReview.has(tName);
      return `
        <button type="button" class="topic-chip ${isSelected ? 'selected' : ''}" data-topic-val="${this._escapeHtml(tName)}">
          <span>${this._escapeHtml(tName)}</span>
          <span class="topic-chip-count">${cnt} câu</span>
        </button>
      `;
    }).join('');

    chipsContainer.querySelectorAll('.topic-chip').forEach(chip => {
      chip.onclick = (ev) => {
        ev.stopPropagation();
        const val = chip.getAttribute('data-topic-val');
        if (!val) return;
        if (this.selectedTopicsForReview.has(val)) {
          this.selectedTopicsForReview.delete(val);
          chip.classList.remove('selected');
        } else {
          this.selectedTopicsForReview.add(val);
          chip.classList.add('selected');
        }
      };
    });
  },

  async startTopicReview() {
    const allCards = await db.getAllCards();
    const allDecks = await db.getAllDecks();
    const deckToSubj = new Map();
    allDecks.forEach(d => deckToSubj.set(String(d.id), d.subjectId || 'subj_unassigned'));
    const getCardSubjectId = (c) => {
      if (c.subjectId && c.subjectId !== 'subj_unassigned') return c.subjectId;
      return deckToSubj.get(String(c.deckId)) || c.subjectId || 'subj_unassigned';
    };

    let candidateCards = this.selectedSubjectForTopicPicker === 'all'
      ? allCards
      : allCards.filter(c => getCardSubjectId(c) === this.selectedSubjectForTopicPicker);

    const selectedTopics = Array.from(this.selectedTopicsForReview || []);
    if (selectedTopics.length > 0) {
      const topicSet = new Set(selectedTopics.map(t => t.trim().toLowerCase()));
      const byTopic = candidateCards.filter(c => {
        const ct = String(c.topic || c.tag || 'Chương chung').trim().toLowerCase() || 'chương chung';
        return topicSet.has(ct);
      });
      if (byTopic.length > 0) candidateCards = byTopic;
    }

    if (!candidateCards || candidateCards.length === 0) {
      this.showToast('Không có câu hỏi nào trong mục đã chọn!', 'warning');
      return;
    }

    const modal = document.getElementById('modal-topic-picker');
    if (modal) this._closeModal(modal);

    const sessionCards = [...candidateCards];
    this._shuffleArray(sessionCards);

    this.activeSession = {
      mode: 'topic',
      deckId: this.currentDeckIdForTopic || null,
      subjectId: this.selectedSubjectForTopicPicker || 'all',
      title: selectedTopics.length > 0
        ? `5. Ôn Theo Chương (${selectedTopics.length} chương • ${sessionCards.length} câu)`
        : `5. Ôn Theo Môn (${sessionCards.length} câu)`,
      cards: sessionCards,
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      blindMode: false,
      blindRevealed: false,
      userAnswers: {},
      answeredList: []
    };

    this.navigateTo('study');
    this.renderActiveStudyCard();
  },
  ```
- **Và trong `navigateTo(viewName)` (`js/app.js` dòng `844`), BẮT BUỘC bổ sung nhánh `'study'`:**
  ```javascript
  } else if (viewName === 'study') {
    if (this.activeSession && Array.isArray(this.activeSession.cards) && this.activeSession.cards.length > 0) {
      this.renderActiveStudyCard();
    }
  }
  ```

### Mục 11: Chuyển Chữ Quote Đen Sang Kiểu Không In Hoa (Sentence Case / Lowercase) Có Hook Công Tắc Đổi Lại Ngay Khi Cần
- Trong `js/quotes.js` (hoặc đầu `js/app.js`) và `css/theme.css`:
  1. Tạo biến cấu hình `window.QUOTE_CASE_MODE = 'sentence';` (hỗ trợ 3 chế độ: `'sentence'` = chỉ viết hoa chữ cái đầu câu còn lại viết thường; `'lowercase'` = viết thường toàn bộ; `'uppercase'` = viết hoa toàn bộ như cũ).
  2. Trong `css/theme.css`:
     ```css
     :root {
       /* Đổi thành uppercase nếu muốn quay lại chữ in hoa toàn bộ */
       --quote-text-transform: none;
     }
     #hero-title,
     .hero-title,
     .hero-title-main,
     .hero-title-sub,
     .hero-title-accent {
       text-transform: var(--quote-text-transform, none) !important;
     }
     ```
  3. Trong `formatQuoteHtml(rawQuote)` (`js/app.js` dòng `1309`), nếu `window.QUOTE_CASE_MODE !== 'uppercase'`, tự động chuẩn hóa chuỗi `rawQuote` từ chữ IN HOA sang chữ thường / viết hoa chữ cái đầu câu (`rawQuote.toLowerCase()` với chữ cái đầu tiên viết hoa) trước khi tách `**...**`!

### Mục 12: Thay Thế Dòng Chữ AI Slop Dưới Quote Bằng Trình Phát Nhạc Nền Lofi Đẳng Cấp (`js/lofi-music.js` + Hỗ Trợ `.mp3` / `.m4a` + Upload Nhạc + Chỉnh Volume Trong Setting)
1. **Xóa bỏ câu mô tả AI Slop dưới Quote (`Hệ thống áp dụng thuật toán lặp lại ngắt quãng (SM-2)...`) và thay bằng Thanh Nhạc Nền Lofi Tinh Tế (`.hero-lofi-bar`):**
   - Trong `index.html` (ngay vị trí `.hero-desc` dưới `#hero-title`), thay thế bằng:
     ```html
     <div class="hero-lofi-bar" id="hero-lofi-bar">
       <button type="button" class="lofi-ctrl-btn" id="btn-lofi-toggle" onclick="LofiPlayer.togglePlay()" title="Phát / Tạm dừng nhạc nền học tập">
         <svg id="lofi-play-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
       </button>
       <div class="lofi-eq-bars" id="lofi-eq-bars" aria-hidden="true">
         <span></span><span></span><span></span>
       </div>
       <span class="lofi-status-text">
         Đang phát: <strong id="lofi-current-track-name">Midnight Rain in Hanoi (Lofi Chill)</strong>
       </span>
       <button type="button" class="lofi-ctrl-btn" onclick="LofiPlayer.nextTrack()" title="Đổi bài nhạc khác">
         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
       </button>
       <button type="button" class="lofi-ctrl-btn" onclick="LofiPlayer.triggerUpload()" title="Tải nhạc .mp3 / .m4a của bạn lên">
         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
       </button>
       <input type="file" id="lofi-file-upload" accept=".mp3,.m4a,.wav,.ogg,audio/mp3,audio/mpeg,audio/mp4,audio/x-m4a" multiple style="display: none;" onchange="LofiPlayer.handleFilesUpload(event)">
     </div>
     ```
2. **Tạo file module độc lập `js/lofi-music.js` (kèm hướng dẫn chi tiết bằng tiếng Việt ngay đầu file):**
   - **Tích hợp sẵn 4 bản nhạc Lofi Chill Procedural đa tầng (Web Audio API Warm Rhodes Electric Piano + Jazz 9th Chord Progressions + Mellow Sub-Bass + Soft Vinyl Atmosphere + Gentle Swing Beat)** có vòng hòa âm 16 ô nhịp biến thiên liên tục, êm dịu, có chiều sâu âm nhạc thực thụ (không lặp đơn điệu):
     1. `Midnight Rain in Hanoi` (Hòa âm Rhodes Jazz: `Fm9 — Bb13 — Ebmaj9 — C7b13`, 72 BPM)
     2. `Warm Espresso & Old Books` (Hòa âm Neo-Soul Lofi: `Dmaj9 — Bm11 — Em9 — A13sus4`, 68 BPM)
     3. `Starlight Study Session` (Hòa âm Dreamy Ambient: `Am9 — Fmaj9 — Cmaj9 — E7#9`, 64 BPM)
     4. `Autumn Leaves on West Lake` (Hòa âm Melodic Chillhop: `Gm9 — C13 — Fmaj9 — Dm11`, 74 BPM)
   - **Hỗ trợ thêm file nhạc `.mp3` / `.m4a` theo 2 cách siêu dễ:**
     - **Cách 1 (Upload trực tiếp trên giao diện):** Bấm nút Upload trên thanh Lofi dưới Quote hoặc trong tab `Cài đặt` để chọn file `.mp3` hoặc `.m4a` từ máy tính/điện thoại. File nhạc được lưu bền vững vào IndexedDB (`lofi_custom_tracks`), tự động phát qua `<audio>` chuẩn với tính năng tự chuyển bài / loop mượt mà!
     - **Cách 2 (Bỏ file vào thư mục `music/`):** Ở đầu file `js/lofi-music.js` có mảng `window.CUSTOM_LOFI_FILES = [ /* { title: 'Tên bài', url: './music/ten-bai.mp3' } */ ]` kèm hướng dẫn từng bước để người dùng chỉ việc ném file `.mp3` / `.m4a` vào thư mục `music/` và khai báo 1 dòng.
   - **Âm lượng mặc định nhỏ nhẹ để học bài (`defaultVolume = 0.14`, tức 14%):**
     - Bổ sung thanh kéo **"Âm lượng nhạc nền Lofi (0% – 100%)"** và danh sách chọn bài nhạc trong tab **Cài đặt & Sao lưu (`#view-settings`)**, lưu vào `localStorage` / IndexedDB.

### Mục 13: Đồng Bộ Icon Download Shortcut (`#btn-pwa-install`) Ở Đáy Sidebar (`image_1d6f97.png`)
- **Hiện trạng lỗi (`image_1d6f97.png`):** Các icon khác trên Sidebar khi chưa chọn chỉ hiện mỗi nét icon trong suốt, riêng nút `#btn-pwa-install` ở dưới cùng lại có vòng tròn nền trắng bao quanh nhìn lạc quẻ!
- **Cách sửa bắt buộc:**
  - Chuyển nút `#btn-pwa-install` vào chung cấu trúc `.nav-item` hoặc áp dụng đúng style của `.app-sidebar .nav-item:not(.active) button`:
    ```css
    #btn-pwa-install,
    .sidebar-install-btn {
      background: transparent !important;
      border: 1px solid transparent !important;
      box-shadow: none !important;
      color: var(--text-secondary) !important;
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      min-height: 44px !important;
      padding: 0 !important;
      border-radius: 999px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto !important;
    }
    #btn-pwa-install:hover,
    .sidebar-install-btn:hover {
      background: var(--accent-soft) !important;
      color: var(--text-primary) !important;
    }
    ```

### Mục Cuối: Các Thuật Toán Tối Ưu Hóa Hiệu Năng Chuyên Sâu Cho Máy Cấu Hình Thấp (Trang Chủ `#view-dashboard` & Thư Viện Câu Hỏi `#view-decks` / `#view-bank`)
Áp dụng **4 thuật toán tối ưu hiệu năng trình duyệt nâng cao** để máy cấu hình thấp/onboard GPU vẫn đạt 120–144 FPS:
1. **Viewport-Gated Backdrop Blur (`IntersectionObserver` Blur Culling):**
   - Các phần tử `.deck-card` và `.study-mode-card` nằm ngoài vùng nhìn thấy của màn hình (`!isIntersecting`) tự động tắt `backdrop-filter: none` và chỉ bật `backdrop-filter` cho đúng các thẻ đang nằm trong khung nhìn hiện tại (tối đa 6–8 thẻ cùng lúc trên màn hình). Điều này cắt giảm **85% tải GPU Shader** ở tab Trang chủ và Thư viện thẻ!
2. **Time-Sliced Incremental DOM Rendering (`requestIdleCallback` / `requestAnimationFrame` Chunking):**
   - Trong `renderDecks()` và `renderQuestionBank()`, khi có nhiều môn học hoặc hàng trăm câu hỏi, chia nhỏ việc chèn DOM thành:
     - **Chunk 0 (Đồng bộ ngay ở `0ms`):** Render ngay 6 bộ thẻ / 12 câu hỏi đầu tiên nằm trong màn hình đầu tiên (`Above-the-Fold`).
     - **Chunk 1..N (Chạy qua `requestAnimationFrame` / `MessageChannel`):** Nạp tiếp các nhóm thẻ phía dưới mỗi frame 10 thẻ mà không bao giờ giữ Main Thread quá `4ms` (Zero Long Tasks `> 50ms`)!
3. **Passive Event Delegation (1 Listener Duy Nhất Cho Toàn Bộ Danh Sách):**
   - Thay vì gắn hàng trăm hàm `onclick` riêng lẻ trên từng thẻ trong danh sách lớn, dùng Event Delegation ở cấp container (`#decks-list-container`, `#bank-questions-list`) để giảm 90% bộ nhớ cấp phát Closure JS.
4. **Pause Offscreen Animations & Compositor Layer Promotion Culling:**
   - Không đặt `will-change: transform` tĩnh trên hàng loạt thẻ (vì mỗi `will-change` ngốn hàng MB VRAM texture trên máy yếu); chỉ bật `will-change` khi thẻ đang trong quá trình chuyển động và gỡ ngay sau khi xong.

---

## PHẦN 3: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

1. [ ] **Đóng/Mở Popup Hoạt Động 100% (`Mục 6`):** Mở bất kỳ Popup nào và kiểm tra thực tế bằng cả 4 cách: bấm nút `✕`, bấm nút `Hủy`/`Đóng`, click ra vùng tối bên ngoài `.modal-overlay`, và nhấn phím `ESC` -> Popup phải đóng ngay lập tức (`getComputedStyle(modal).display === 'none'`).
2. [ ] **Chế Độ 5 Ôn Theo Môn & Chương Hoạt Động Thực Tế (`Mục 9`):** Mở `#modal-topic-picker` -> Phải hiển thị đầy đủ các nút Môn học và các chip Chương kèm số câu hỏi (không bao giờ bị trống như `image_1d8662.jpg`). Bấm `"Bắt đầu ôn tập"` -> Vào `#view-study` hiển thị ngay nội dung câu hỏi và 4 đáp án A, B, C, D (tuyệt đối không bị dừng ở `"Câu hỏi đang tải..."` như `image_1d7b97.jpg`).
3. [ ] **Thiết Kế Khối Kính Lồi Popup (`Mục 7` & `Mục 8`):** Đã xóa bỏ hoàn toàn cái khung viền xám dày 22px và hình tròn tối của `.modal-box::before` trong `image_1d8e41.jpg`; Popup là 1 khối kính bo cong `36px` đồng nhất, trong trẻo theo chuẩn `swiftui-expert-skill`.
4. [ ] **Mode Trắng Cam — 4 Ô Khung Quote & Light Mode Đa Sắc (`Mục 1`, `Mục 2`, `Mục 10`):** 4 ô ở trạng thái nghỉ mờ trong tiệm cận khung Quote (`rgba(255,255,255,0.24)`), khóa `overflow: hidden; border-radius: 20px` không bị lẹm màu ra ngoài viền; khi trỏ vào lên màu Cam Light Neon (`#ff6b2b`) tươi sáng với chữ trắng tinh `#ffffff` sắc nét. Đã gom biến hạt nhân `--light-accent-*` để dễ dàng thêm màu mới sau này.
5. [ ] **Ánh Sáng Dưới Khung Quote Ở Mode Trắng Đen & Trắng Cam (`Mục 3`):** Trỏ vào khung Quote ở Mode Trắng Đen hắt sáng trắng bạc (`rgba(255,255,255,0.22)` — 0% tím); ở Mode Trắng Cam hắt sáng cam ấm (`rgba(255,107,43,0.38)`).
6. [ ] **Hiệu Ứng Blur -> Trong Suốt Khi Trỏ Vào Ở Mode Trắng Đen & Thư Viện Thẻ (`Mục 4 & Mục 5`):** Cả 7 ô Chế độ học lẫn các thẻ Bộ câu hỏi (ở Trang chủ và Thư viện thẻ) trên cả 3 theme đều mờ đục ở trạng thái nghỉ và trở nên trong suốt hẳn ra khi trỏ chuột vào.
7. [ ] **Chữ Quote Đen Không In Hoa Có Hook Đổi Lại (`Mục 11`):** Chữ Quote hiển thị kiểu không in hoa (`sentence case`) kèm biến `window.QUOTE_CASE_MODE` và `--quote-text-transform` để đổi lại chỉ với 1 dòng nếu cần.
8. [ ] **Trình Phát Nhạc Nền Lofi Dưới Quote (`Mục 12`):** Đã thay dòng mô tả AI slop dưới Quote bằng thanh phát nhạc `.hero-lofi-bar` (`Đang phát: ...`), tạo file `js/lofi-music.js` với 4 bài Lofi Chill có chiều sâu hòa âm, hỗ trợ upload & phát file `.mp3` / `.m4a`, âm lượng mặc định nhỏ (`14%`) và chỉnh được trong `Cài đặt`.
9. [ ] **Đồng Bộ Icon Download Shortcut Ở Đáy Sidebar (`Mục 13`):** Nút `#btn-pwa-install` đã bỏ vòng tròn trắng bên ngoài, chỉ hiện icon đồng bộ 100% với các icon khác trên Sidebar.
10. [ ] **Tối Ưu Hiệu Năng Cấu Hình Thấp:** Đã áp dụng Viewport-Gated Blur Culling + Incremental Chunk Rendering; chạy `npm test` và `npm run build` đạt 100% PASS.
