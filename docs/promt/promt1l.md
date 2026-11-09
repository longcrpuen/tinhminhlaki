# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1L — KHÔI PHỤC KHUNG KÍNH MỜ THEME TÍM, ĐỒNG BỘ 100% HIỆU ỨNG BLUR -> TRONG SUỐT CHO 7 Ô CHỨC NĂNG & THƯ VIỆN THẺ Ở MỌI MODE, GỜ KHÚC XẠ 3D THAY VIỀN KẺ CHỈ 2D, ÁNH SÁNG CAM LIGHT NEON KHÔNG LỘ VIỀN TRẮNG & TỐI ƯU SCROLL 144+ FPS (promt1l.md)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Claude Code / Cursor / Antigravity)**
> - **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> - **Phiên bản đặc tả:** `1l` (Nối tiếp sau `1a` -> `1k`, tham chiếu `docs/ARCHITECTURE_GRAPH.md`)
> - **Mục tiêu cốt lõi:** Giải quyết triệt để **8 vấn đề giao diện & hiệu năng** từ 5 ảnh chụp màn hình mới nhất (`image_1c2922.png`, `image_1c25e0.jpg`, `image_1c2162.jpg`, `image_1bc09d.jpg`, `image_1bc042.jpg`).
> - **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **CSS Specificity Supremacy:** Mọi rule đồng bộ thẻ (`.study-mode-card`, `.deck-card`, 4 ô thống kê Quote) phải kiểm tra và xóa bỏ các rule cũ có độ ưu tiên cao hơn ở cuối `css/theme.css` và `css/style.css` để không xảy ra tình trạng *"sửa được thẻ trang đầu nhưng 7 ô chức năng và thẻ trong thư viện lại không ăn"*.
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

---

## PHẦN 0: GIẢI PHẪU NGUYÊN NHÂN CHÍNH XÁC TỪ 5 ẢNH CHỤP MÀN HÌNH MỚI NHẤT

AI Coding Agent **BẮT BUỘC** đọc kỹ 5 chẩn đoán kỹ thuật dưới đây trước khi sửa code:

1. **Tại sao Theme Tím Hồng (`purple-pink`) tự nhiên bị mất sạch khung viền và mất độ mờ nhám ở cả Trang chủ lẫn Thư viện thẻ (`image_1c25e0.jpg`)?**
   - Ở đợt `1k`, các biến `--glass-block-rest-bg` và `--glass-block-rest-border` chỉ được khai báo bên trong selector `html[data-theme="purple-pink"]`, nhưng khi khởi chạy mặc định hoặc khi chuyển theme, thuộc tính `data-theme` được gắn trên `body` hoặc bị gỡ về `:root`, HOẶC thuật toán `Viewport-Gated Blur Culling` ở đợt `1k` đã tắt `backdrop-filter` và `background` của các thẻ!
   - Kết quả là trong `image_1c25e0.jpg`, các thẻ ở Theme Tím Hồng mất sạch nền kính mờ và viền, trơ ra chữ nổi trên hình nền tím!
   - **Cách khắc phục bắt buộc:**
     1. Khai báo đầy đủ bộ biến `--glass-block-*` ngay tại `:root`, `html`, `html[data-theme="purple-pink"]`, và `body[data-theme="purple-pink"]` (kèm giá trị fallback trực tiếp trong `var(...)`).
     2. **Gỡ bỏ hoàn toàn đoạn JS `Blur Culling` làm mất nền/khung thẻ**, thay bằng tối ưu GPU Compositor thuần CSS!

2. **Tại sao ở Mode Trắng Đen (`image_1c2162.jpg`) và Mode Trắng Cam, các thẻ Bộ câu hỏi ở trang đầu (`#dashboard-decks-grid`) đã có hiệu ứng "Bình thường Blur -> Trỏ vào Trong suốt", nhưng 7 Ô Chức Năng (`.study-mode-card`) và các Thẻ trong Tab Thư Viện Bộ Thẻ (`#view-decks`) lại CHƯA CÓ?**
   - Nhìn vào độ ưu tiên (Specificity) của CSS trong `promt1k.md`:
     - `#dashboard-decks-grid .deck-card` có chứa **ID selector `#dashboard-decks-grid`** (độ ưu tiên `1, 1, 0`), nên nó thắng các rule cũ và hoạt động hoàn hảo (như thấy trong `image_1bc09d.jpg` và `image_1bc042.jpg`)!
     - Ngược lại, `.study-mode-card` (độ ưu tiên `0, 1, 0`) và `#view-decks .deck-card` lại bị đè bởi các rule cũ từ đợt `1h`/`1i` vẫn còn nằm trong `css/theme.css` như `html[data-theme="white-orange"] .study-mode-card` (độ ưu tiên `0, 2, 1`) hoặc `.subject-group .decks-grid .deck-card`!
   - **Cách khắc phục bắt buộc:** Xóa toàn bộ các rule `.study-mode-card` và `.deck-card` rời rạc cũ trong `css/theme.css`, và dùng selector có độ ưu tiên cao đồng nhất cho **cả 7 ô chức năng (`#view-dashboard .study-mode-card`), các thẻ trang đầu (`#dashboard-decks-grid .deck-card`), VÀ các thẻ trong Thư viện thẻ (`#view-decks .deck-card`, `.subject-group .deck-card`)**!

3. **Tại sao khi trỏ chuột vào các Bộ thẻ (`image_1bc09d.jpg` — Ảnh 4 Light Mode & `image_1bc042.jpg` — Ảnh 5 Dark Mode), thẻ đã trong suốt nhưng lại hiện ra đường viền kẻ chỉ 2D làm mất cảm giác khối lồi Liquid Glass?**
   - Nhìn vào thẻ giữa (`Bộ câu hỏi LMS`) trong `image_1bc09d.jpg` và `image_1bc042.jpg`:
     - Khi chưa trỏ vào (`tkt2`, `cnxh`), thẻ không có viền kẻ chỉ cứng mà dùng bóng sáng nội tâm (`inset box-shadow`), nhìn như một khối kính lồi 3D dày dặn.
     - Nhưng khi trỏ chuột vào (`Bộ câu hỏi LMS`), CSS lại gán `border: 1.5px solid #ff6b2b !important` (ở Light Mode) và `border: 1.5px solid rgba(255,255,255,0.85) !important` (ở Dark Mode)! Đường kẻ chỉ mảnh dẹt 2D này phá vỡ hoàn toàn ảo giác quang học của khối kính lồi 3D!
   - **Giải pháp đột phá (Rimless 3D Meniscus Hover):** Khi trỏ chuột vào thẻ để thẻ trở nên trong suốt, **TUYỆT ĐỐI KHÔNG dùng đường viền `border` đậm nét** (`border-color: rgba(255, 255, 255, 0.18) !important`), mà định hình ranh giới khối kính trong suốt bằng **Gờ Khúc Xạ Ánh Sáng 3D Nội Tâm (`inset box-shadow` đa hướng)**!

4. **Tại sao 4 Ô ở Khung Quote của Mode Trắng Cam (`image_1c2922.png`) khi trỏ vào vẫn bị cam đậm đặc như sơn và vẫn lộ viền trắng vuông vức?**
   - Nhìn vào `image_1c2922.png` (`170 CẦN ÔN HÔM NAY`):
     1. 4 ô này trong HTML thực tế của bạn đang có `border: 1px solid rgba(255, 255, 255, 0.85)` và góc vuông nhọn (`border-radius: 0` hoặc selector `.stat-card` chưa trỏ trúng class thực tế của 4 ô trong khung Quote)!
     2. Khi `:hover`, `background: #ff6b2b !important` tô đặc một khối màu cam đậm lên toàn bộ ô.
   - **Cách sửa theo đúng ý người dùng:**
     - **Xóa bỏ hoàn toàn đường viền trắng lộ ra ngoài** (`border: none !important; outline: none !important; border-radius: 22px !important;`).
     - Khi trỏ chuột vào (Hover): Không tô màu cam đặc, mà tạo **hiệu ứng Ánh Sáng Cam Light Neon tỏa dịu bên trong tấm kính mờ (`radial-gradient` phát sáng mềm mại với độ trong suốt `0.32–0.38` + `box-shadow` ánh sáng neon lan nhẹ)**.

5. **Tại sao bật Chế độ 5 ("Ôn theo môn & chương") lên thì cuộn (scroll) bên trong popup hơi bị lag?**
   - Vì `.modal-box` đang gánh bộ lọc SVG `url(#liquid-edge-warp)` trong `backdrop-filter` (khiến trình duyệt Chromium phải đọc ngược bộ nhớ GPU về CPU mỗi frame khi cuộn danh sách `#topic-picker-chips` bên trong!), cộng với hàng chục nút `.topic-chip` có `transition: all`.
   - Khi gỡ `url(#liquid-edge-warp)` khỏi `backdrop-filter` (chuyển sang `backdrop-filter: blur(24px) saturate(190%)` chạy 100% bằng phần cứng GPU) và thêm `transform: translateZ(0); will-change: scroll-position; contain: content;` cho `#topic-picker-chips` + `.modal-body`, tốc độ cuộn trong Chế độ 5 sẽ đạt **144+ FPS mượt tuyệt đối**!

---

## PHẦN 1: CHI TIẾT CODE THỰC THI CHO TỪNG YÊU CẦU TRONG `promt1l.md`

### 1. Sửa 4 Ô Khung Quote ở Mode Trắng Cam (`image_1c2922.png`): Xóa Viền Trắng Lộ Ra Ngoài & Đổi Hover Sang Ánh Sáng Cam Light Neon Dịu Nhẹ
Kiểm tra trong `index.html` để lấy **tất cả các class thực tế** của 4 ô thống kê nằm trong khung Quote (ví dụ: `.stat-card`, `.hero-stat-bento-card`, `.hero-stat-card`, `.quote-stat-item`, `.stats-grid > div`, `.hero-bento-grid > div`) và áp dụng đoạn CSS sau vào cuối `css/theme.css`:

```css
/* ==========================================================================
   1. 4 Ô THỐNG KÊ KHUNG QUOTE: XÓA VIỀN TRẮNG LỘ RA NGOÀI & HOVER ÁNH SÁNG LIGHT NEON
   ========================================================================== */
.stats-grid > div,
.stat-card,
.hero-stat-bento-card,
.hero-stat-card,
.quote-stat-box {
  border-radius: 22px !important;
  border: none !important; /* Xóa sạch đường viền trắng vuông lộ ra ngoài như ảnh 1 */
  outline: none !important;
  overflow: hidden !important;
  background-clip: padding-box !important;
  transition: background 0.28s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.28s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* Trạng thái nghỉ ở Mode Trắng Cam: Mờ trong tiệm cận khung Quote, không lộ viền trắng */
html[data-theme="white-orange"] .stats-grid > div,
html[data-theme="white-orange"] .stat-card,
html[data-theme="white-orange"] .hero-stat-bento-card,
html[data-theme="white-orange"] .hero-stat-card {
  background: rgba(255, 255, 255, 0.20) !important;
  backdrop-filter: blur(16px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
  border: none !important;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.45),
    0 8px 24px -8px rgba(154, 52, 18, 0.06) !important;
  color: #1c1917 !important;
}

/* Khi trỏ vào ở Mode Trắng Cam: ÁNH SÁNG CAM LIGHT NEON TỎA RA NHẸ NHÀNG (Không đậm đặc, không lộ viền trắng!) */
html[data-theme="white-orange"] .stats-grid > div:hover,
html[data-theme="white-orange"] .stat-card:hover,
html[data-theme="white-orange"] .hero-stat-bento-card:hover,
html[data-theme="white-orange"] .hero-stat-card:hover {
  background: radial-gradient(
    120% 130% at 50% 85%,
    rgba(255, 132, 62, 0.44) 0%,
    rgba(255, 176, 118, 0.26) 55%,
    rgba(255, 255, 255, 0.22) 100%
  ) !important;
  border: none !important;
  box-shadow:
    inset 0 1.5px 3px rgba(255, 255, 255, 0.72),
    inset 0 -12px 28px -8px rgba(255, 120, 48, 0.35),
    0 14px 34px -8px rgba(255, 120, 48, 0.28) !important;
  transform: translateY(-2px) !important;
  color: #1c1917 !important;
}
html[data-theme="white-orange"] .stats-grid > div:hover *,
html[data-theme="white-orange"] .stat-card:hover *,
html[data-theme="white-orange"] .hero-stat-bento-card:hover * {
  color: #1c1917 !important;
}
```

### 2. Khôi Phục 100% Khung Kính Mờ Nhám Cho Theme Tím Hồng (`image_1c25e0.jpg`) + Đồng Bộ Hiệu Ứng "Bình Thường Mờ Đục -> Trỏ Vào Trong Suốt" Cho Cả 7 Ô Chức Năng & Thư Viện Bộ Thẻ Ở Cả 3 Mode (`image_1c2162.jpg`, `image_1bc09d.jpg`, `image_1bc042.jpg`) + Thay Viền Kẻ Chỉ 2D Bằng Gờ Khúc Xạ Kính Lồi 3D
1. **Bước 1 — Dọn sạch các rule xung đột cũ trong `css/theme.css` và `css/style.css`:**
   - Tìm tất cả các đoạn CSS cũ đang style riêng lẻ cho `.study-mode-card`, `.mode-card`, `.deck-card` ở cuối `css/theme.css` và **thay thế bằng 1 khối điều phối thống nhất duy nhất** dưới đây.
   - Đảm bảo xóa bỏ mọi đoạn JS tắt `backdrop-filter` / `background` của thẻ khi cuộn.
2. **Bước 2 — Áp dụng Hệ thống Khối Lồi Liquid Glass Đồng Nhất (Frosted-to-Clear + Rimless 3D Meniscus Bevel trên Hover) cho cả 3 Theme:**

```css
/* ==========================================================================
   2. HỆ THỐNG KHỐI KÍNH LỒI LIQUID GLASS ĐỒNG NHẤT CHO:
      - 7 Ô Chế độ học (#view-dashboard .study-mode-card, .mode-card)
      - Các Thẻ Bộ câu hỏi ở Trang chủ (#dashboard-decks-grid .deck-card)
      - Các Thẻ Bộ câu hỏi trong Thư viện thẻ (#view-decks .deck-card, .subject-group .deck-card)
      - Các Khung Nhóm Môn học (#view-decks .subject-group)
   ========================================================================== */

:root,
html,
body,
html[data-theme="purple-pink"],
body[data-theme="purple-pink"] {
  /* Trạng thái nghỉ: Kính tím khói mờ nhám có chiều sâu 3D */
  --lg-card-rest-bg: linear-gradient(145deg, rgba(38, 28, 66, 0.76) 0%, rgba(22, 16, 40, 0.68) 100%);
  --lg-card-rest-border: rgba(255, 255, 255, 0.14);
  --lg-card-rest-shadow:
    inset 0 1.5px 2.5px rgba(255, 255, 255, 0.24),
    inset 0 -1.5px 3px rgba(192, 132, 252, 0.10),
    0 14px 34px -8px rgba(0, 0, 0, 0.55);

  /* Khi trỏ vào: Trong suốt hẳn ra + Gờ khúc xạ kính lồi 3D (KHÔNG dùng viền kẻ chỉ 2D cứng!) */
  --lg-card-hover-bg: rgba(38, 28, 66, 0.14);
  --lg-card-hover-border: rgba(255, 255, 255, 0.20);
  --lg-card-hover-shadow:
    inset 0 2.5px 4px rgba(255, 255, 255, 0.52),
    inset 0 -3px 8px rgba(192, 132, 252, 0.24),
    inset 0 0 26px rgba(192, 132, 252, 0.10),
    0 22px 48px -10px rgba(0, 0, 0, 0.72),
    0 0 28px -6px rgba(192, 132, 252, 0.22);
}

html[data-theme="monochrome"],
body[data-theme="monochrome"] {
  /* Trạng thái nghỉ: Kính khói bạc mờ nhám rõ nét trên nền đen */
  --lg-card-rest-bg: linear-gradient(145deg, rgba(38, 38, 44, 0.76) 0%, rgba(22, 22, 26, 0.68) 100%);
  --lg-card-rest-border: rgba(255, 255, 255, 0.16);
  --lg-card-rest-shadow:
    inset 0 1.5px 2.5px rgba(255, 255, 255, 0.28),
    inset 0 -1.5px 3px rgba(255, 255, 255, 0.06),
    0 14px 34px -8px rgba(0, 0, 0, 0.75);

  /* Khi trỏ vào: Trong suốt nhìn xuyên thấu nền + Gờ kính lồi 3D mềm mại (như tối ưu cho Ảnh 5) */
  --lg-card-hover-bg: rgba(255, 255, 255, 0.03);
  --lg-card-hover-border: rgba(255, 255, 255, 0.22); /* Viền cực dịu, nhường chỗ cho gờ sáng 3D inset */
  --lg-card-hover-shadow:
    inset 0 2.5px 4px rgba(255, 255, 255, 0.58),
    inset 0 -2.5px 6px rgba(255, 255, 255, 0.14),
    inset 0 0 26px rgba(255, 255, 255, 0.07),
    0 22px 48px -10px rgba(0, 0, 0, 0.85);
}

html[data-theme="white-orange"],
body[data-theme="white-orange"] {
  /* Trạng thái nghỉ: Kính trắng sữa mờ nhám Liquid Glass */
  --lg-card-rest-bg: linear-gradient(145deg, rgba(255, 253, 250, 0.66) 0%, rgba(255, 242, 228, 0.54) 100%);
  --lg-card-rest-border: rgba(255, 255, 255, 0.78);
  --lg-card-rest-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.96),
    inset 0 -2px 4px rgba(255, 107, 43, 0.08),
    0 12px 32px -8px rgba(154, 52, 18, 0.10);

  /* Khi trỏ vào: Trong suốt hẳn ra + Gờ kính lồi 3D khúc xạ ánh sáng trắng/cam (Xóa bỏ viền kẻ chỉ cam 2D ở Ảnh 4!) */
  --lg-card-hover-bg: rgba(255, 252, 248, 0.14);
  --lg-card-hover-border: rgba(255, 255, 255, 0.52); /* Không dùng viền kẻ chỉ cam cứng! */
  --lg-card-hover-shadow:
    inset 0 2.5px 5px rgba(255, 255, 255, 0.98),
    inset 1.5px 0 3px rgba(255, 255, 255, 0.75),
    inset 0 -3px 8px rgba(255, 115, 36, 0.18),
    inset 0 0 24px rgba(255, 255, 255, 0.42),
    0 20px 44px -10px rgba(154, 52, 18, 0.18);
}

/* ÁP DỤNG ĐỒNG BỘ VỚI ĐỘ ƯU TIÊN CAO NHẤT CHO CẢ 7 Ô CHỨC NĂNG VÀ MỌI THẺ BỘ CÂU HỎI Ở MỌI TAB */
#view-dashboard .study-mode-card,
#view-dashboard .mode-card,
.study-modes-grid .study-mode-card,
#dashboard-decks-grid .deck-card,
#view-decks .deck-card,
#decks-list-container .deck-card,
.subject-group .decks-grid .deck-card,
.deck-card,
.study-mode-card {
  background: var(--lg-card-rest-bg, rgba(38, 28, 66, 0.76)) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid var(--lg-card-rest-border, rgba(255, 255, 255, 0.16)) !important;
  box-shadow: var(--lg-card-rest-shadow) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  background-clip: padding-box !important;
  transition:
    background 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    backdrop-filter 0.26s ease,
    border-color 0.26s ease,
    box-shadow 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* KHI TRỎ CHUỘT VÀO (HOVER): TRONG SUỐT HẲN RA + GIỮ NGUYÊN ĐỘ LỒI 3D LIQUID GLASS */
#view-dashboard .study-mode-card:hover,
#view-dashboard .mode-card:hover,
.study-modes-grid .study-mode-card:hover,
#dashboard-decks-grid .deck-card:hover,
#view-decks .deck-card:hover,
#decks-list-container .deck-card:hover,
.subject-group .decks-grid .deck-card:hover,
.deck-card:hover,
.study-mode-card:hover {
  background: var(--lg-card-hover-bg, rgba(38, 28, 66, 0.14)) !important;
  backdrop-filter: blur(5px) saturate(135%) !important;
  -webkit-backdrop-filter: blur(5px) saturate(135%) !important;
  border-color: var(--lg-card-hover-border, rgba(255, 255, 255, 0.24)) !important;
  box-shadow: var(--lg-card-hover-shadow) !important;
  transform: translateY(-3px) !important;
}

/* Khôi phục khung bao cho các Nhóm môn học (.subject-group) trong tab Thư viện thẻ (#view-decks) */
#view-decks .subject-group,
.subject-group {
  background: rgba(128, 128, 128, 0.05) !important;
  border: 1px solid var(--lg-card-rest-border, rgba(255, 255, 255, 0.14)) !important;
  border-radius: 26px !important;
  padding: 18px !important;
  margin-bottom: 24px !important;
  box-shadow: inset 0 1px 1.5px rgba(255, 255, 255, 0.12) !important;
}
```

### 3. Tối Ưu Hóa Triệt Để Độ Mượt Khi Scroll Trong Popup Chế Độ 5 (`#modal-topic-picker`) & Toàn Bộ Ứng Dụng (Locked 144+ FPS)
1. **Loại bỏ nguyên nhân gây lag khi cuộn bên trong `#modal-topic-picker`:**
   - Gỡ bỏ hoàn toàn `url(#liquid-edge-warp)` và `url(#liquid-convex-lens)` ra khỏi thuộc tính `backdrop-filter` của `.modal-box` (vì SVG filter trong `backdrop-filter` bắt trình duyệt phải thực hiện CPU-GPU texture readback trên mỗi sự kiện cuộn chuột trong modal!).
   - Thay bằng `backdrop-filter: blur(26px) saturate(195%) !important` được tăng tốc 100% bằng phần cứng GPU.
2. **Tách Lớp Ghép Kênh GPU (Compositor Layer Isolation) cho khung cuộn của Chế độ 5 và tất cả các danh sách cuộn:**
   ```css
   #topic-picker-chips,
   #bulk-reassign-deck-list,
   .modal-body {
     transform: translateZ(0) !important;
     will-change: scroll-position !important;
     contain: layout paint !important;
     overscroll-behavior: contain !important;
     -webkit-overflow-scrolling: touch !important;
   }

   /* Tối ưu các chip Chương trong Chế độ 5: Không dùng transition: all hay box-shadow nặng khi cuộn */
   .topic-chip {
     transition: background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease !important;
     contain: layout style !important;
     box-shadow: none !important;
   }
   ```
3. **Kỹ thuật "Passive Scroll Pointer-Freeze" (Mẹo tối ưu hóa chuẩn 144Hz của các Web App cao cấp như Linear / Raycast):**
   - Khi người dùng đang lăn chuột cuộn trang (`scroll`), con trỏ chuột đứng yên nhưng các thẻ lướt qua dưới con trỏ chuột liên tục kích hoạt `:hover` và tính toán lại `backdrop-filter` từ `blur(20px)` sang `blur(5px)` trên hàng loạt thẻ mỗi khung hình, gây rớt FPS!
   - Thêm 15 dòng JS siêu nhẹ vào `setupEventListeners()` trong `js/app.js`:
     ```javascript
     // Tạm khóa kích hoạt lại hover tốn kém trong lúc đang cuộn nhanh để giữ cứng 144+ FPS
     let scrollTimer = null;
     window.addEventListener('scroll', () => {
       if (!document.body.classList.contains('is-scrolling')) {
         document.body.classList.add('is-scrolling');
       }
       clearTimeout(scrollTimer);
       scrollTimer = setTimeout(() => {
         document.body.classList.remove('is-scrolling');
       }, 90);
     }, { passive: true });
     ```
   - Và tắt hoàn toàn listener `mousemove` của `initSpotlightHover()` (return ngay ở dòng đầu hàm `initSpotlightHover() { return; }`) để CPU chiếm `0%` khi di chuột và cuộn trang!

---

## PHẦN 2: CHECKLIST NGHIỆM THU BẮT BUỘC TRƯỚC KHI BÁO CÁO HOÀN THÀNH

1. [ ] **4 Ô Khung Quote ở Mode Trắng Cam (`image_1c2922.png`):** Đã xóa sạch đường viền trắng vuông lộ ra ngoài (`border: none !important; border-radius: 22px !important;`); khi trỏ vào tỏa ánh sáng Cam Light Neon dịu nhẹ trong lớp kính mờ (`radial-gradient` cam sáng bán trong suốt), không còn tô màu cam đậm đặc.
2. [ ] **Khôi Phục Khung & Nền Kính Mờ Nhám của Theme Tím Hồng (`image_1c25e0.jpg`):** Toàn bộ 7 ô Chế độ học, các thẻ Bộ câu hỏi ở Trang chủ và các thẻ/khung trong Thư viện thẻ ở Theme Tím Hồng đã có lại đầy đủ khung kính mờ nhám 3D và khi trỏ vào thì trong suốt.
3. [ ] **Đồng Bộ 7 Ô Chức Năng & Thư Viện Bộ Thẻ ở Mode Trắng Đen (`image_1c2162.jpg`) và Mode Trắng Cam:** Cả 7 ô Chế độ học (`.study-mode-card`) lẫn toàn bộ các thẻ Bộ câu hỏi trong tab Thư viện thẻ (`#view-decks .deck-card`) đều hoạt động đúng hiệu ứng *"Bình thường mờ đục (Frosted Blur) -> Trỏ vào trong suốt hẳn ra"* giống hệt các thẻ ở trang đầu.
4. [ ] **Thay Viền Kẻ Chỉ 2D Khi Hover Bằng Gờ Khúc Xạ Kính Lồi 3D (`image_1bc09d.jpg` & `image_1bc042.jpg`):** Khi trỏ chuột vào bất kỳ thẻ Bộ câu hỏi hay Chế độ học nào, thẻ trở nên trong suốt nhưng vẫn giữ nguyên cảm giác khối kính lồi 3D dày dặn nhờ `inset box-shadow` đa hướng, không còn đường viền kẻ chỉ cam/trắng 2D cứng nhắc.
5. [ ] **Scroll Mượt 144+ FPS Trong Chế Độ 5 & Toàn App:** Đã gỡ `url(#svg-filter)` khỏi `backdrop-filter`, thêm `contain: layout paint; transform: translateZ(0);` cho `#topic-picker-chips` và tắt `initSpotlightHover()` gây tốn CPU.
6. [ ] **Tests & Build:** Chạy `npm test` và `npm run build` đạt 100% PASS.
