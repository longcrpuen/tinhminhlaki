# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1N (BẢN ĐẦY ĐỦ 15 HẠNG MỤC) — KHÔI PHỤC POPUP CHUẨN & SỬA KHUNG MODE TÍM, QUY LUẬT ÁNH SÁNG LIQUID GLASS (ẢNH 3), 4 Ô TRẠNG THÁI CHỮ NHẬT 3 THEME, XÓA ĐỐM SÁNG ĐÁP ÁN QUIZ, SỬA TOÀN DIỆN MOBILE, CHỐNG TRÀN LATEX & ĐÈ NÚT Ở FLASHCARD, CHẠM LẦN ĐẦU BẬT NHẠC LOFI, ĐỒNG BỘ DROPDOWN/SLIDER NHẠC, SÓNG NĂNG LƯỢNG ĐỔI THEME TRONG CÀI ĐẶT & VẼ LẠI CÂY KIẾN TRÚC (`promt1n.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1n` (Nối tiếp sau `1a` -> `1m`)
> * **Mục tiêu cốt lõi:** Giải quyết dứt điểm toàn bộ **15 vấn đề UI/UX, Toán học LaTeX, Âm thanh Lofi & Thiết kế Tương tác trên Desktop + Mobile** từ 10 ảnh chụp màn hình mới nhất (`image_105ae0.jpg` đến `image_0f72de.png`), đồng thời **vẽ lại toàn bộ Cây Kiến Trúc (`docs/ARCHITECTURE_GRAPH.md` & `ARCHITECTURE_GRAPH.md`)** chuẩn xác 100% để chuẩn bị cho đợt tối ưu hóa cuối cùng trước khi push code.
> * **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn tuyệt đối 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **Selector Accuracy:** Trong dự án này, thuộc tính theme trên thẻ `<html>` / `<body>` là `data-theme="purple-pink"` (hoặc mặc định `data-theme="dark"`), `data-theme="monochrome"`, `data-theme="white-orange"`; khung Popup là `.modal-box`; khung Quote là `.hero-card`; 4 ô trạng thái là `.stat-card, .hero-stat-bento-card`. Phải dùng đúng các selector này!
>   3. **100% Test & Build Pass:** Đảm bảo `npm test` và `npm run build` đạt 100% PASS.

---

## PHẦN 1: CHI TIẾT 15 HẠNG MỤC SỬA LỖI & NÂNG CẤP TOÀN DIỆN

### 1. Khôi phục Thiết Kế Popup Chuẩn Cũ (Xóa Hiệu Ứng Kính Chia Sọc) & Sửa Khung Popup Mode Tím Hồng Học Theo 2 Mode Còn Lại
- **Hiện trạng**:
  - Hiệu ứng kính chia sọc (Fluted/Ribbed Glass `.modal-header::after`) thêm ở đợt `1m` làm mất vẻ trong trẻo vốn có của Popup cũ.
  - Ở 2 mode `monochrome` và `white-orange`, Popup cũ đã rất đẹp và chuẩn chỉ. Riêng ở **Mode Tím Hồng (`purple-pink` / `dark`)**, Popup lại bị mất khung viền và màu nền tím của Popup bị chìm ngang với màu nền tĩnh phía sau.
- **Nguyên nhân gốc rễ**:
  1. Khi ứng dụng khởi chạy mặc định, `index.html` có `<html lang="vi" data-theme="dark">`. Các biến `--popup-glass-*` chỉ khai báo ở `html[data-theme="purple-pink"]` sẽ không nhận khi `data-theme="dark"`.
  2. Màu nền Popup của `purple-pink` (`rgba(42, 32, 68, 0.62)`) quá giống màu nền trang (`#120b22`), không có độ tách sáng như `monochrome` (`rgba(48, 48, 56, 0.56)` + `brightness(1.10)`).
- **Giải pháp bắt buộc trong `css/theme.css` và `css/style.css`**:
  1. **XÓA BỎ HOÀN TOÀN** khối `.modal-overlay .modal-content .modal-header::after` và `.modal-box .modal-header::after` (hiệu ứng sọc kính chia Fluted Glass ở đợt `1m`).
  2. **Giữ nguyên** thiết kế Popup của `monochrome` và `white-orange`, đồng thời nâng cấp Popup của Mode Tím Hồng (`:root`, `html[data-theme="dark"]`, `html[data-theme="purple-pink"]`) học theo đúng cấu trúc tách lớp trong suốt + gờ sáng của `monochrome`:
     ```css
     /* Xóa bỏ hoàn toàn hiệu ứng kính chia sọc ở header popup */
     .modal-header::before,
     .modal-header::after,
     .modal-box .modal-header::after,
     .modal-content .modal-header::after {
       display: none !important;
       content: none !important;
       background: none !important;
     }

     /* Khôi phục Popup chuẩn chỉ trên cả 3 mode, sửa dứt điểm khung & độ tách nền của Mode Tím Hồng */
     :root,
     html,
     body,
     html[data-theme="dark"],
     html[data-theme="purple-pink"],
     body[data-theme="purple-pink"] {
       /* Học theo độ trong & độ sáng tách nền của Monochrome nhưng mang sắc tím khói lavender */
       --popup-glass-volume-bg: linear-gradient(145deg, rgba(64, 48, 98, 0.56) 0%, rgba(32, 22, 54, 0.46) 55%, rgba(44, 30, 74, 0.52) 100%);
       --popup-glass-rim-border: rgba(233, 213, 255, 0.34);
       --popup-glass-volume-shadow:
         inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.68),
         inset -1px -1.5px 2px rgba(216, 180, 254, 0.28),
         inset 0 18px 36px -12px rgba(255, 255, 255, 0.14),
         0 32px 72px -12px rgba(4, 2, 10, 0.78);
     }
     ```

---

### 2. Nghiên cứu & Áp dụng Quy Luật Ánh Sáng Định Hướng cho Liquid Glass theo chuẩn Ảnh 3 (`image_104c17.jpg`)
- **Phân tích Quy luật Ánh sáng từ Ảnh 3 (`image_104c17.jpg` — "MODERN Abstract Background")**:
  - Nếu không dùng hiệu ứng bóp méo vật thể ở viền (để giữ 144+ FPS), điều làm nên một tấm kính **Liquid Glass** chân thực như Ảnh 3 chính là **Quy Luật Ánh Sáng Chiếu Chéo (`135deg` — từ Đỉnh-Trái xuống Đáy-Phải)**:
    1. **Không bao giờ tô viền trắng sáng đều cả 4 cạnh**: Một đường `border` trắng đều 100% quanh 4 cạnh làm thẻ nhìn như khung vẽ 2D phẳng.
    2. **Đỉnh Trên & Góc Trên-Trái (Top & Top-Left)**: Đón trực diện nguồn sáng nên gờ viền sáng rõ nhất (`rgba(255, 255, 255, 0.68)`).
    3. **Hai Cạnh Bên (Giữa Thân Thẻ — Mid-Left & Mid-Right)**: Ánh sáng trượt qua nên **mờ dần và chìm xuống rất dịu (`rgba(255, 255, 255, 0.08)`)**.
    4. **Góc Dưới-Phải & Đáy Dưới (Bottom-Right Caustic Rim)**: Tia sáng xuyên qua khối thủy tinh và phản xạ lại ở góc đối diện tạo thành một gờ sáng thứ cấp nhẹ nhàng (`rgba(255, 255, 255, 0.28)`).
- **Giải pháp CSS chuẩn hóa Quy Luật Ánh Sáng Ảnh 3 cho Popup (`.modal-box`), Khung Quote (`.hero-card`), 7 Ô Chế Độ Học (`.study-mode-card`), và Thẻ Bộ Câu Hỏi (`.deck-card`)**:
  ```css
  /* Gờ khúc xạ ánh sáng định hướng 135deg theo đúng quy luật vật lý của Ảnh 3 */
  :root,
  html[data-theme="dark"],
  html[data-theme="purple-pink"],
  body[data-theme="purple-pink"] {
    --lg-directional-bevel:
      inset 1.5px 1.5px 1.5px rgba(255, 255, 255, 0.58),   /* Góc trên-trái đón sáng mạnh nhất */
      inset -1px -1.5px 2px rgba(216, 180, 254, 0.24),     /* Góc dưới-phải phản xạ thứ cấp */
      inset 0 12px 24px -10px rgba(255, 255, 255, 0.10);   /* Tán xạ sương mỏng ở đỉnh kính */
    --lg-directional-border-top: rgba(255, 255, 255, 0.38);
    --lg-directional-border-left: rgba(255, 255, 255, 0.28);
    --lg-directional-border-right: rgba(255, 255, 255, 0.08);
    --lg-directional-border-bottom: rgba(216, 180, 254, 0.18);
  }

  html[data-theme="monochrome"],
  body[data-theme="monochrome"] {
    --lg-directional-bevel:
      inset 1.5px 1.5px 1.5px rgba(255, 255, 255, 0.64),
      inset -1px -1.5px 2px rgba(255, 255, 255, 0.20),
      inset 0 12px 24px -10px rgba(255, 255, 255, 0.10);
    --lg-directional-border-top: rgba(255, 255, 255, 0.42);
    --lg-directional-border-left: rgba(255, 255, 255, 0.30);
    --lg-directional-border-right: rgba(255, 255, 255, 0.08);
    --lg-directional-border-bottom: rgba(255, 255, 255, 0.18);
  }

  html[data-theme="white-orange"],
  body[data-theme="white-orange"] {
    --lg-directional-bevel:
      inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.98),
      inset -1px -1.5px 2px rgba(255, 140, 66, 0.20),
      inset 0 12px 24px -10px rgba(255, 255, 255, 0.45);
    --lg-directional-border-top: rgba(255, 255, 255, 0.95);
    --lg-directional-border-left: rgba(255, 255, 255, 0.82);
    --lg-directional-border-right: rgba(255, 255, 255, 0.32);
    --lg-directional-border-bottom: rgba(255, 255, 255, 0.55);
  }

  /* Áp dụng viền bất đối xứng theo hướng ánh sáng cho thẻ & popup */
  .modal-box,
  .hero-card,
  #view-dashboard .study-mode-card,
  #dashboard-decks-grid .deck-card,
  #view-decks .deck-card,
  .deck-card,
  .study-mode-card {
    border-top: 1px solid var(--lg-directional-border-top) !important;
    border-left: 1px solid var(--lg-directional-border-left) !important;
    border-right: 1px solid var(--lg-directional-border-right) !important;
    border-bottom: 1px solid var(--lg-directional-border-bottom) !important;
  }
  ```

---

### 3. Giảm Quầng Sáng Khi Trỏ Vào Khung Quote (`.hero-card:hover` — Ảnh 1 `image_105ae0.jpg`): Chỉ Chiếu Nhẹ Ở Ngay Dưới Đáy Khung, Không Tõe Ra Các Phía
- **Hiện trạng (Ảnh 1 `image_105ae0.jpg`)**: Khi trỏ chuột vào khung Quote, ánh sáng màu tím bên dưới đang tỏa quá mạnh và lan rộng ra cả xung quanh.
- **Giải pháp**: Dùng `spread-radius` âm (`-12px`) và `offset-y` nhỏ (`14px`) để tia sáng **chỉ hắt nhẹ một dải mỏng ở đúng đáy dưới của khung Quote**, tuyệt đối không tõe sang 2 bên hay phía trên:
  ```css
  /* Mode Tím Hồng: Ánh sáng tím dịu chỉ nằm gọn ở đáy dưới khung Quote */
  :root .hero-card:hover,
  html[data-theme="dark"] .hero-card:hover,
  html[data-theme="purple-pink"] .hero-card:hover,
  body[data-theme="purple-pink"] .hero-card:hover {
    box-shadow:
      var(--lg-directional-bevel),
      0 14px 22px -12px rgba(192, 132, 252, 0.32),
      0 18px 36px -14px rgba(0, 0, 0, 0.65) !important;
  }

  /* Mode Trắng Đen: Ánh sáng trắng bạc dịu chỉ nằm gọn ở đáy dưới khung Quote */
  html[data-theme="monochrome"] .hero-card:hover,
  body[data-theme="monochrome"] .hero-card:hover {
    box-shadow:
      var(--lg-directional-bevel),
      0 14px 22px -12px rgba(255, 255, 255, 0.22),
      0 18px 36px -14px rgba(0, 0, 0, 0.80) !important;
  }

  /* Mode Trắng Cam: Ánh sáng cam dịu chỉ nằm gọn ở đáy dưới khung Quote */
  html[data-theme="white-orange"] .hero-card:hover,
  body[data-theme="white-orange"] .hero-card:hover {
    box-shadow:
      var(--lg-directional-bevel),
      0 14px 22px -12px rgba(255, 126, 54, 0.26),
      0 18px 36px -14px rgba(154, 52, 18, 0.14) !important;
  }
  ```

---

### 4, 5 & 6. Sửa Dứt Điểm 4 Ô Trạng Thái Tại Khung Quote Trên Cả 3 Theme (`.stat-card` / `.hero-stat-bento-card` — Ảnh 1 `image_105ae0.jpg`)
- **3 Yêu cầu bắt buộc từ người dùng**:
  1. **Chuyển góc bo về hình chữ nhật góc sắc gọn như bản cũ (`border-radius: 4px !important`)** trên cả 3 theme! (Ở đợt `1m`, selector `.hero-stat-pill` không khớp với `.stat-card` nên 4 ô vẫn bị bo tròn `22px` như Ảnh 1).
  2. **Sửa lỗi 4 ô ở Mode Tím Hồng trỏ vào không lên màu**: Do ở đợt `1l`, chỉ có rule `:hover` cho `white-orange`, còn `purple-pink` (và `dark`) bị mất rule `:hover`! Khi trỏ vào 4 ô ở Mode Tím Hồng phải lên màu **Tím Light Neon đơn sắc dịu sáng (`rgba(192, 132, 252, 0.28)`)**.
  3. **Sửa 4 ô ở Mode Trắng Cam khi trỏ vào**: **TUYỆT ĐỐI KHÔNG DÙNG GRADIENT** (xóa bỏ `radial-gradient` của đợt `1l`), chỉ dùng **1 màu Cam Light Neon ĐƠN SẮC, sáng nhẹ, nhạt dịu trong trẻo (`background: rgba(255, 158, 88, 0.28) !important`)**, giữ nguyên chữ đậm rõ nét để không bao giờ làm át thông tin!
- **Giải pháp CSS thống nhất cho 4 ô trạng thái ở cả 3 Theme**:
  ```css
  /* 1. Khung chữ nhật sắc gọn (border-radius: 4px) trên cả 3 theme */
  #view-dashboard .stats-grid > div,
  #view-dashboard .stat-card,
  .hero-card .stat-card,
  .stats-grid .stat-card,
  .hero-stat-bento-card,
  .hero-stat-card,
  .quote-stat-box {
    border-radius: 4px !important; /* Hình chữ nhật góc vát siêu nhỏ sắc sảo */
    overflow: hidden !important;
    background-clip: padding-box !important;
    position: relative !important;
    transition: background-color 0.22s ease,
                border-color 0.22s ease,
                box-shadow 0.22s ease,
                transform 0.22s ease !important;
  }

  /* 2. MODE TÍM HỒNG (purple-pink & dark mặc định):
        Nghỉ: Kính mờ tiệm cận khung Quote | Trỏ vào: Lên màu Tím Light Neon ĐƠN SẮC dịu sáng */
  :root #view-dashboard .stat-card,
  html[data-theme="dark"] #view-dashboard .stat-card,
  html[data-theme="purple-pink"] #view-dashboard .stat-card,
  body[data-theme="purple-pink"] #view-dashboard .stat-card,
  :root .stats-grid > div,
  html[data-theme="dark"] .stats-grid > div,
  html[data-theme="purple-pink"] .stats-grid > div {
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(16px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.24) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-bottom: 1px solid rgba(216, 180, 254, 0.14) !important;
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.20) !important;
    color: #f8f6fd !important;
  }

  :root #view-dashboard .stat-card:hover,
  html[data-theme="dark"] #view-dashboard .stat-card:hover,
  html[data-theme="purple-pink"] #view-dashboard .stat-card:hover,
  body[data-theme="purple-pink"] #view-dashboard .stat-card:hover,
  :root .stats-grid > div:hover,
  html[data-theme="dark"] .stats-grid > div:hover,
  html[data-theme="purple-pink"] .stats-grid > div:hover {
    background: rgba(192, 132, 252, 0.28) !important; /* Đơn sắc Tím Light Neon dịu sáng */
    border-top-color: rgba(245, 208, 254, 0.75) !important;
    border-left-color: rgba(232, 121, 249, 0.55) !important;
    border-right-color: rgba(192, 132, 252, 0.25) !important;
    border-bottom-color: rgba(232, 121, 249, 0.45) !important;
    box-shadow:
      inset 1px 1px 1.5px rgba(255, 255, 255, 0.55),
      0 10px 22px -8px rgba(192, 132, 252, 0.32) !important;
    transform: translateY(-2px) !important;
    color: #ffffff !important;
  }

  /* 3. MODE TRẮNG ĐEN (monochrome):
        Nghỉ: Kính khói mờ tiệm cận khung Quote | Trỏ vào: Lên màu Trắng Bạc ĐƠN SẮC dịu sáng */
  html[data-theme="monochrome"] #view-dashboard .stat-card,
  body[data-theme="monochrome"] #view-dashboard .stat-card,
  html[data-theme="monochrome"] .stats-grid > div {
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(16px) saturate(140%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(140%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.20) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
    box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.24) !important;
    color: #ffffff !important;
  }

  html[data-theme="monochrome"] #view-dashboard .stat-card:hover,
  body[data-theme="monochrome"] #view-dashboard .stat-card:hover,
  html[data-theme="monochrome"] .stats-grid > div:hover {
    background: rgba(255, 255, 255, 0.22) !important; /* Đơn sắc Trắng Bạc dịu sáng */
    border-top-color: rgba(255, 255, 255, 0.82) !important;
    border-left-color: rgba(255, 255, 255, 0.60) !important;
    border-right-color: rgba(255, 255, 255, 0.22) !important;
    border-bottom-color: rgba(255, 255, 255, 0.42) !important;
    box-shadow:
      inset 1px 1px 1.5px rgba(255, 255, 255, 0.68),
      0 10px 22px -8px rgba(255, 255, 255, 0.20) !important;
    transform: translateY(-2px) !important;
    color: #ffffff !important;
  }

  /* 4. MODE TRẮNG CAM (white-orange):
        Nghỉ: Kính trắng kem mờ tiệm cận khung Quote
        Trỏ vào: ĐƠN SẮC (KHÔNG GRADIENT!) màu Cam Light Neon sáng nhạt, dịu mắt, không át thông tin! */
  html[data-theme="white-orange"] #view-dashboard .stat-card,
  body[data-theme="white-orange"] #view-dashboard .stat-card,
  html[data-theme="white-orange"] .stats-grid > div {
    background: rgba(255, 255, 255, 0.30) !important;
    backdrop-filter: blur(16px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.88) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.72) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.28) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.48) !important;
    box-shadow:
      inset 1px 1px 1.5px rgba(255, 255, 255, 0.90),
      0 6px 18px -8px rgba(154, 52, 18, 0.06) !important;
    color: #1c1917 !important;
  }

  html[data-theme="white-orange"] #view-dashboard .stat-card:hover,
  body[data-theme="white-orange"] #view-dashboard .stat-card:hover,
  html[data-theme="white-orange"] .stats-grid > div:hover {
    background: rgba(255, 158, 88, 0.28) !important; /* Đơn sắc Cam Light Neon sáng nhạt, trong trẻo, KHÔNG gradient! */
    border-top-color: rgba(255, 255, 255, 0.96) !important;
    border-left-color: rgba(255, 168, 104, 0.75) !important;
    border-right-color: rgba(255, 148, 77, 0.30) !important;
    border-bottom-color: rgba(255, 148, 77, 0.50) !important;
    box-shadow:
      inset 1px 1px 2px rgba(255, 255, 255, 0.92),
      0 10px 22px -8px rgba(255, 132, 56, 0.22) !important;
    transform: translateY(-2px) !important;
    color: #1c1917 !important;
  }
  html[data-theme="white-orange"] #view-dashboard .stat-card:hover *,
  html[data-theme="white-orange"] .stats-grid > div:hover * {
    color: #1c1917 !important;
  }
  ```

---

### 7. Xóa Triệt Để Đốm Sáng Con Trỏ Nằm Giữa Các Lựa Chọn Của Quiz (`.quiz-option-btn::before` — Ảnh 2 `image_1053b6.jpg`)
- **Hiện trạng (Ảnh 2 `image_1053b6.jpg`)**: Khi trỏ chuột vào đáp án A (`.quiz-option-btn`), một đốm tròn trắng mờ (`150px circle at var(--mx, 50%) var(--my, 50%)`) hiện lên ngay chính giữa nút đáp án A.
- **Nguyên nhân chính xác**: Trong `css/style.css` (dòng `6897`), rule `.btn-primary::before, .btn-secondary::before, .btn-brand::before, .quiz-option-btn::before` vẫn đang vẽ `radial-gradient(150px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.24) 0%, transparent 80%)`!
- **Giải pháp bắt buộc**: Tắt hoàn toàn pseudo-element `::before` dùng `--mx, --my` trên **mọi nút bấm và đáp án Quiz**:
  ```css
  .quiz-option-btn::before,
  .quiz-option-btn:hover::before,
  .btn::before,
  .btn-primary::before,
  .btn-secondary::before,
  .btn-brand::before,
  .quiz-card::before,
  .glass-card::before,
  .study-mode-card::before,
  .deck-card::before,
  .stat-card::before,
  .bank-card-item::before,
  .subject-group::before,
  .neu-stat-well::before {
    display: none !important;
    content: none !important;
    background: none !important;
    opacity: 0 !important;
  }
  ```

---

### 8. Thiết Kế Lại Thanh Điều Hướng Dưới Cùng Trên Mobile (`.bottom-nav` / `#mobile-bottom-nav` — Ảnh 4 `image_104517.png` & Ảnh 5 `image_10447c.jpg`) Chuẩn Liquid Glass
- **Hiện trạng lỗi (Ảnh 4 & Ảnh 5)**:
  1. Thanh `.bottom-nav` hiện tại quá dày, trắng đục lờ nhờ, thiếu hẳn chất liệu kính trong suốt Liquid Glass.
  2. Khi tab **`Bộ thẻ`** hoặc **`Ngân hàng`** đang `.active`, nền pill của nút là màu hồng kem sáng nhưng **icon SVG bên trong lại bị tô màu trắng (`#ffffff`)**, khiến icon trắng chìm nghỉm vào nền kem, nhìn lóa và mất chi tiết!
- **Giải pháp toàn diện cho `.bottom-nav` trên Mobile (`@media (max-width: 768px)`)**:
  ```css
  @media (max-width: 768px) {
    .bottom-nav,
    #mobile-bottom-nav {
      display: flex !important;
      position: fixed !important;
      bottom: max(10px, env(safe-area-inset-bottom, 10px)) !important;
      left: 12px !important;
      right: 12px !important;
      width: calc(100% - 24px) !important;
      max-width: 460px !important;
      margin: 0 auto !important;
      height: 62px !important;
      padding: 6px 8px !important;
      border-radius: 20px !important; /* Squircle hiện đại, gọn gàng */
      backdrop-filter: blur(26px) saturate(190%) !important;
      -webkit-backdrop-filter: blur(26px) saturate(190%) !important;
      border-top: 1px solid var(--lg-directional-border-top) !important;
      border-left: 1px solid var(--lg-directional-border-left) !important;
      border-right: 1px solid var(--lg-directional-border-right) !important;
      border-bottom: 1px solid var(--lg-directional-border-bottom) !important;
      box-shadow:
        var(--lg-directional-bevel),
        0 14px 34px -6px rgba(0, 0, 0, 0.28) !important;
      z-index: 1000 !important;
    }

    /* Nền kính trong trẻo theo từng Theme cho Mobile Bottom Nav */
    :root .bottom-nav,
    html[data-theme="dark"] .bottom-nav,
    html[data-theme="purple-pink"] .bottom-nav {
      background: linear-gradient(145deg, rgba(34, 22, 58, 0.74) 0%, rgba(18, 12, 34, 0.66) 100%) !important;
    }
    html[data-theme="monochrome"] .bottom-nav {
      background: linear-gradient(145deg, rgba(32, 32, 38, 0.76) 0%, rgba(18, 18, 22, 0.68) 100%) !important;
    }
    html[data-theme="white-orange"] .bottom-nav {
      background: linear-gradient(145deg, rgba(255, 252, 248, 0.72) 0%, rgba(255, 242, 228, 0.62) 100%) !important;
      box-shadow:
        var(--lg-directional-bevel),
        0 12px 30px -6px rgba(154, 52, 18, 0.16) !important;
    }

    /* Từng nút trên thanh Mobile Bottom Nav */
    .bottom-nav .bottom-nav-item,
    #mobile-bottom-nav .bottom-nav-item {
      flex: 1 1 0% !important;
      min-width: 0 !important;
      min-height: 48px !important;
      height: 50px !important;
      padding: 4px 2px !important;
      border-radius: 14px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 3px !important;
      background: transparent !important;
      border: 1px solid transparent !important;
      box-shadow: none !important;
      transform: none !important;
      transition: background-color 0.2s ease, color 0.2s ease !important;
    }

    /* Khóa SVG hiển thị nét mảnh đơn sắc theo currentColor (KHÔNG bao giờ bị trắng lóa trên nền sáng!) */
    .bottom-nav .bottom-nav-item svg,
    .bottom-nav .bottom-nav-item.active svg,
    .bottom-nav .bottom-nav-item svg *,
    .bottom-nav .bottom-nav-item.active svg * {
      width: 20px !important;
      height: 20px !important;
      fill: none !important;
      stroke: currentColor !important;
      stroke-width: 1.9 !important;
      background: transparent !important;
      filter: none !important;
    }

    .bottom-nav .bottom-nav-item span {
      font-size: 0.68rem !important;
      font-weight: 500 !important;
      line-height: 1.1 !important;
      color: inherit !important;
    }
    .bottom-nav .bottom-nav-item.active span {
      font-weight: 700 !important;
    }

    /* MÀU TRẠNG THÁI NGHỈ & ACTIVE CHUẨN TƯƠNG PHẢN CHO TỪNG THEME */
    :root .bottom-nav .bottom-nav-item,
    html[data-theme="dark"] .bottom-nav .bottom-nav-item,
    html[data-theme="purple-pink"] .bottom-nav .bottom-nav-item {
      color: rgba(233, 213, 255, 0.68) !important;
    }
    :root .bottom-nav .bottom-nav-item.active,
    html[data-theme="dark"] .bottom-nav .bottom-nav-item.active,
    html[data-theme="purple-pink"] .bottom-nav .bottom-nav-item.active {
      background: rgba(192, 132, 252, 0.22) !important;
      border-top-color: rgba(255, 255, 255, 0.35) !important;
      color: #ffffff !important;
    }

    html[data-theme="monochrome"] .bottom-nav .bottom-nav-item {
      color: rgba(255, 255, 255, 0.62) !important;
    }
    html[data-theme="monochrome"] .bottom-nav .bottom-nav-item.active {
      background: rgba(255, 255, 255, 0.18) !important;
      border-top-color: rgba(255, 255, 255, 0.45) !important;
      color: #ffffff !important;
    }

    html[data-theme="white-orange"] .bottom-nav .bottom-nav-item {
      color: #57534e !important;
    }
    html[data-theme="white-orange"] .bottom-nav .bottom-nav-item.active {
      background: rgba(255, 148, 77, 0.22) !important;
      border-top-color: rgba(255, 255, 255, 0.85) !important;
      color: #ea580c !important; /* Icon & chữ màu Cam Đậm sắc nét tuyệt đối trên nền sáng! */
    }
  }
  ```

---

### 9. Sửa Triệt Để Lỗi Mobile Bị Lệch Khung Sang Phải & Tràn Chữ Nút Bấm (`image_10447c.jpg` & `image_10418f.png`)
- **Hiện trạng lỗi**:
  1. **Ảnh 5 (`image_10447c.jpg` — Thư viện thẻ Mobile)**: Các thẻ bộ câu hỏi (`tuh 1 4 (3)`) bị đẩy lệch hẳn sang mép phải màn hình (lề trái rất rộng, lề phải sát rìa).
  2. **Ảnh 6 (`image_10418f.png` — Ngân hàng câu hỏi Mobile)**:
     - Nút `"Sao chép Prompt AI viết lại"` bị tràn ra ngoài rìa phải màn hình, mất chữ `"ại"`.
     - Thanh HUD góc trên phải (`.topbar-hud-capsule`: 3 nút chọn theme + chuỗi ngày) bị đè sát lên tiêu đề.
- **Giải pháp căn chỉnh chuẩn đối xứng 100% trên Mobile (`@media (max-width: 840px)`)**:
  ```css
  @media (max-width: 840px) {
    /* 1. Căn giữa đối xứng tuyệt đối cho khung chính trên Mobile */
    html,
    body,
    .app-layout,
    .app-main,
    .app-main.sidebar-collapsed {
      width: 100% !important;
      max-width: 100vw !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
    }

    .content-wrapper {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 64px 12px 96px 12px !important; /* Đủ khoảng trống trên cho HUD và dưới cho Bottom Nav */
      box-sizing: border-box !important;
    }

    .view-section,
    #view-dashboard,
    #view-decks,
    #view-bank,
    #view-stats,
    #view-settings {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
    }

    /* 2. Sửa lỗi lệch phải của các thẻ trong Thư viện thẻ (#view-decks) & Trang chủ */
    #decks-list-container,
    #view-decks .subject-group,
    #view-decks .subject-group-block,
    .subject-group,
    .subject-group-block {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding: 12px !important;
      box-sizing: border-box !important;
    }

    #dashboard-decks-grid,
    #view-decks .decks-grid,
    .subject-group .decks-grid,
    .decks-grid,
    .study-modes-grid,
    .study-mode-cards-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 12px !important;
      box-sizing: border-box !important;
    }

    .deck-card,
    .study-mode-card {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }

    /* 3. Sửa lỗi tràn chữ các nút hành động ở Ngân hàng câu hỏi (#view-bank) & Thư viện thẻ */
    .bank-header-wrap,
    .section-title-wrap {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .bank-actions-row,
    #view-decks .section-title-wrap > div:last-child {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    .bank-actions-row > .btn,
    #view-decks .section-title-wrap > div:last-child > .btn {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      padding: 10px 8px !important;
      font-size: 0.78rem !important;
      line-height: 1.25 !important;
      white-space: normal !important;
      text-align: center !important;
      justify-content: center !important;
      word-break: break-word !important;
      box-sizing: border-box !important;
    }

    /* Nút thứ 3 ("Luyện tập câu trong danh sách") trải rộng 100% hàng dưới */
    .bank-actions-row > .btn:nth-child(3) {
      grid-column: 1 / -1 !important;
    }
  }
  ```

---

### 10. Xóa Sổ Lỗi 2 Thanh Cuộn (Double Scrollbar) Gây Khựng Khi Lướt Ở Tab Ngân Hàng Câu Hỏi Mobile (`image_10418f.png` & `image_1040f9.jpg`)
- **Nguyên nhân kỹ thuật chính xác 100%**:
  Nhìn vào cạnh phải của `image_10418f.png` và `image_1040f9.jpg`: Có **1 thanh cuộn màu cam** nằm bên trong `.app-main` / `body` VÀ **1 thanh cuộn màu xám** của trình duyệt (`html`) nằm sát mép ngoài!
  - Lý do: Trong `css/style.css`, khi cả `html` và `body` đều có `overflow-x: hidden` (hoặc `.app-main` trên mobile có `overflow-y: auto !important; min-height: 100dvh !important;`), trình duyệt biến `body` / `.app-main` thành một **Scroll Container thứ 2 nằm lồng bên trong `html`**! Khi người dùng vuốt tay trên màn hình cảm ứng ở `#view-bank`, 2 thanh cuộn này giằng co nhau khiến việc cuộn bị khựng cục bộ.
- **Giải pháp bắt buộc (Single Native Document Scroller)**:
  1. Chỉ cho phép duy nhất **`html`** làm vùng cuộn dọc của trang (`overflow-y: auto !important; overflow-x: clip !important;`).
  2. Trên `body`, `.app-layout`, `.app-main`, `.content-wrapper`, `.view-section`, `#view-bank`, `#bank-cards-list`: Bắt buộc đặt **`overflow-y: visible !important; overflow-x: clip !important; height: auto !important; max-height: none !important;`** (tuyệt đối không dùng `overflow-x: hidden` hay `overflow-y: auto` trên `body` và `.app-main`!).
  3. Cụ thể thêm vào cuối `css/style.css`:
     ```css
     /* TRIỆT TIÊU LỖI 2 THANH CUỘN LỒNG NHAU (DOUBLE SCROLLBAR) TRÊN TOÀN APP & MOBILE */
     html {
       overflow-x: clip !important;
       overflow-y: auto !important;
       height: auto !important;
     }

     body,
     .app-layout,
     .app-main,
     .content-wrapper,
     .view-section,
     #view-bank,
     #view-bank > div,
     #bank-cards-list {
       overflow-x: clip !important;
       overflow-y: visible !important;
       height: auto !important;
       max-height: none !important;
     }

     @media (max-width: 840px) {
       /* Trên Mobile, tắt thanh scrollbar tùy chỉnh bên trong để dùng duy nhất 1 thanh cuộn gốc mượt 120Hz của iOS/Android */
       body::-webkit-scrollbar,
       .app-main::-webkit-scrollbar,
       .view-section::-webkit-scrollbar,
       #view-bank::-webkit-scrollbar,
       #bank-cards-list::-webkit-scrollbar {
         display: none !important;
         width: 0 !important;
         height: 0 !important;
       }
     }
     ```

---

### 11 & 12. Sửa Triệt Để Lỗi Giải Thích Flashcard Bị Tràn Công Thức LaTeX Ra Ngoài (`image_0fd035.jpg`) & Lỗi Nút Mở Rộng/Thu Nhỏ Làm Đè Hộp Giải Thích Lên 4 Nút Đánh Giá SRS (`image_0f7a9a.jpg`)
- **Giải phẫu 2 nguyên nhân gốc rễ từ `image_0fd035.jpg` và `image_0f7a9a.jpg`**:
  1. **Tại sao công thức LaTeX dài trong giải thích Flashcard bị tràn ngang ra ngoài khung (Ảnh `image_0fd035.jpg`)?**
     - Mặc định trong `katex.min.css`, class `.katex` có `white-space: nowrap;`. Khi cả một chuỗi biến đổi toán học dài (`\nabla f(x_k - \alpha d_k) = 0 \iff -d_k^T(...) = 0 \implies \alpha_k = ...`) được viết trong cùng một cặp dấu `$ ... $`, KaTeX gom toàn bộ vào 1 khối `<span class="katex">` không cho phép xuống dòng!
     - Đồng thời, `.flashcard-content-wrap` đang căn giữa (`align-items: center`), làm khối LaTeX quá khổ trànทะลุ cả mép trái lẫn mép phải của `.flashcard-explanation-box`!
     - **Giải pháp kỹ thuật cho KaTeX Line-Wrapping**:
       Bên trong `.katex-html`, KaTeX vốn đã chia tự động mỗi vế sau các dấu `=`, `\iff`, `\implies`, `+`, `-` thành từng thẻ `<span class="base">` riêng biệt! Chỉ cần đặt `.katex, .katex-html { white-space: normal !important; }` và chèn điểm ngắt dòng mềm (`content: "\200B"; white-space: normal !important;`) vào `.katex-html > .base::after` trong khi giữ mỗi cụm `.base` (`display: inline-block; white-space: nowrap;`) nguyên vẹn: công thức dài sẽ **tự động xuống dòng mượt mà ngay sau các dấu `=`, `\iff`, `\implies`, `+`, `-`** như văn bản thường mà không bao giờ làm gãy phân số hay ma trận!
  2. **Tại sao tính năng Mở rộng / Thu gọn trên Flashcard bị "ngu" (chỉ đổi cỡ chữ và làm tràn cả hộp giải thích đè lên 4 nút `Chưa thuộc`, `Khó nhớ`, `Nhớ tốt`, `Rất dễ` như Ảnh `image_0f7a9a.jpg`)?**
     - Thứ nhất: Trong `css/style.css` (dòng `95190–95240`), `.flashcard-stage` và `.flashcard-card` đang bị khóa cứng `height: 320px; max-height: 340px;`, còn `.flashcard-face` đặt `position: absolute; inset: 0;`. Khi hộp giải thích ở mặt sau dài ra, `.flashcard-back` vượt quá `340px` nhưng `.flashcard-stage` không giãn theo, khiến mặt sau Flashcard **tràn thẳng xuống đè lên 4 nút đánh giá SRS bên dưới**!
     - Thứ hai: Ở đợt `1m`, việc bỏ `-webkit-line-clamp` nhưng vẫn giữ nút `#btn-flashcard-exp-toggle` khiến nút đó khi bấm chỉ làm thay đổi `font-size` từ `0.85rem` lên `1.06rem` (mở rộng = phóng to chữ, thu gọn = thu nhỏ chữ) hoàn toàn vô nghĩa!
- **Giải pháp triệt để 100% (CSS Grid Auto-Height 3D Card + KaTeX Smart Wrap + Bỏ Nút Thu Gọn Vô Nghĩa)**:
  1. **Bỏ hẳn nút `"Xem giải thích đầy đủ ▾ / Thu gọn ▴"` (`#btn-flashcard-exp-toggle`) trên mặt sau Flashcard**: Khi người học đã lật sang mặt sau của Flashcard, hiển thị trọn vẹn luôn lời giải thích với **1 cỡ chữ chuẩn duy nhất (`0.96rem`)** rõ ràng, sắc nét.
  2. **Chuyển `.flashcard-card` sang bố cục CSS Grid `1x1` tự động giãn chiều cao theo mặt đang hiển thị**:
     - Khi chưa lật (`.flashcard-card:not(.flipped)`): Mặt trước quyết định chiều cao thẻ (`min-height: 300px; height: auto;`), mặt sau thu gọn `height: 0; overflow: hidden;`.
     - Khi đã lật (`.flashcard-card.flipped`): Mặt sau quyết định chiều cao thẻ (`min-height: 300px; height: auto;`), tự động đẩy thanh 4 nút đánh giá SRS (`#flashcard-srs-bar`) xuống dưới một khoảng cách cố định `16px` — **TUYỆT ĐỐI KHÔNG BAO GIỜ ĐÈ LÊN 4 NÚT ĐÁNH GIÁ SRS**!
  3. **Áp dụng đoạn CSS chuẩn sau vào cuối `css/style.css`**:
     ```css
     /* ==========================================================================
        11 & 12. FLASHCARD AUTO-HEIGHT 3D STAGE & KATEX SMART LINE-WRAPPING
        ========================================================================== */

     /* 1. Cho phép khung Flashcard tự giãn chiều cao đẩy 4 nút SRS xuống dưới, không bao giờ đè lên nút! */
     .flashcard-player-container {
       display: flex !important;
       flex-direction: column !important;
       gap: 16px !important;
       height: auto !important;
       max-height: none !important;
       overflow: visible !important;
     }

     .flashcard-stage {
       height: auto !important;
       min-height: 300px !important;
       max-height: none !important;
       overflow: visible !important;
       margin-bottom: 4px !important;
     }

     .flashcard-card {
       display: grid !important;
       grid-template-columns: minmax(0, 1fr) !important;
       height: auto !important;
       min-height: 300px !important;
       max-height: none !important;
       position: relative !important;
     }

     .flashcard-face {
       grid-area: 1 / 1 !important;
       position: relative !important;
       inset: auto !important;
       width: 100% !important;
       max-width: 100% !important;
       box-sizing: border-box !important;
     }

     /* Khi đang ở mặt trước: Mặt sau ẩn chiều cao để không kéo dài mặt trước */
     .flashcard-card:not(.flipped) .flashcard-front {
       height: auto !important;
       min-height: 300px !important;
       max-height: none !important;
       overflow: visible !important;
     }
     .flashcard-card:not(.flipped) .flashcard-back {
       height: 0 !important;
       min-height: 0 !important;
       max-height: 0 !important;
       padding-top: 0 !important;
       padding-bottom: 0 !important;
       margin: 0 !important;
       border-width: 0 !important;
       overflow: hidden !important;
       pointer-events: none !important;
     }

     /* Khi đã lật sang mặt sau: Mặt sau tự giãn chiều cao theo toàn bộ công thức & giải thích */
     .flashcard-card.flipped .flashcard-front {
       height: 0 !important;
       min-height: 0 !important;
       max-height: 0 !important;
       padding-top: 0 !important;
       padding-bottom: 0 !important;
       margin: 0 !important;
       border-width: 0 !important;
       overflow: hidden !important;
       pointer-events: none !important;
     }
     .flashcard-card.flipped .flashcard-back {
       height: auto !important;
       min-height: 300px !important;
       max-height: none !important;
       padding: 24px 28px !important;
       overflow: visible !important;
     }

     /* 2. Hộp giải thích trên mặt sau Flashcard: Gói gọn 100% chiều ngang, bỏ nút Thu gọn/Mở rộng gây nhảy cỡ chữ */
     .flashcard-content-wrap {
       width: 100% !important;
       max-width: 100% !important;
       overflow: visible !important;
       align-items: stretch !important;
       box-sizing: border-box !important;
     }

     .flashcard-explanation-box,
     .flashcard-explanation-box.is-collapsible,
     .flashcard-explanation-box.is-expanded {
       width: 100% !important;
       max-width: 100% !important;
       margin-top: 14px !important;
       padding: 16px 20px !important;
       border-radius: 14px !important;
       max-height: none !important;
       overflow-x: auto !important;
       overflow-y: visible !important;
       box-sizing: border-box !important;
       text-align: left !important;
     }

     /* Ẩn hoàn toàn nút Xem giải thích đầy đủ / Thu gọn vô nghĩa */
     #btn-flashcard-exp-toggle,
     .flashcard-exp-toggle-btn {
       display: none !important;
     }

     /* Cố định 1 cỡ chữ chuẩn duy nhất cho giải thích Flashcard, hiển thị đầy đủ luôn */
     #flashcard-explanation-text,
     .flashcard-explanation-box .flashcard-explanation-text,
     .flashcard-explanation-box.is-collapsible:not(.is-expanded) .flashcard-explanation-text,
     .flashcard-explanation-box.is-expanded .flashcard-explanation-text {
       display: block !important;
       -webkit-line-clamp: unset !important;
       line-clamp: unset !important;
       max-height: none !important;
       overflow: visible !important;
       font-size: 0.96rem !important;
       line-height: 1.68 !important;
       text-align: left !important;
       width: 100% !important;
       max-width: 100% !important;
       overflow-wrap: break-word !important;
       word-break: break-word !important;
       box-sizing: border-box !important;
     }

     /* 3. Cho phép công thức LaTeX (.katex) dài tự động ngắt dòng thông minh sau các dấu =, \iff, \implies, +, - */
     .flashcard-explanation-text .katex,
     .quiz-explanation-box .katex,
     .flashcard-question-text .katex,
     .flashcard-answer-text .katex,
     .quiz-question-text .katex,
     .quiz-option-content .katex {
       font-size: 1.12em !important;
       white-space: normal !important;
       max-width: 100% !important;
     }

     .flashcard-explanation-text .katex-html,
     .quiz-explanation-box .katex-html,
     .flashcard-question-text .katex-html,
     .flashcard-answer-text .katex-html,
     .quiz-question-text .katex-html,
     .quiz-option-content .katex-html {
       white-space: normal !important;
       max-width: 100% !important;
     }

     /* Giữ nguyên vẹn từng phân số/ma trận bên trong .base nhưng cho phép xuống dòng giữa các cụm .base */
     .flashcard-explanation-text .katex-html > .base,
     .quiz-explanation-box .katex-html > .base {
       display: inline-block !important;
       white-space: nowrap !important;
       max-width: 100% !important;
       vertical-align: middle !important;
       margin: 2px 0 !important;
     }

     .flashcard-explanation-text .katex-html > .base::after,
     .quiz-explanation-box .katex-html > .base::after {
       content: "\200B";
       white-space: normal !important;
     }

     /* Thanh 4 nút đánh giá SRS luôn nằm tách biệt phía dưới thẻ Flashcard */
     .flashcard-bottom-actions {
       position: relative !important;
       z-index: 5 !important;
       margin-top: 8px !important;
       width: 100% !important;
     }
     ```

---

### 13. Tính Năng Mới: Vừa Chạm Vào Trình Duyệt (Thao Tác Đầu Tiên) Là Lập Tức Bật Nhạc Lofi
- **Yêu cầu từ người dùng**: Vì chính sách trình duyệt chặn tự phát nhạc khi chưa có tương tác, hãy thiết lập để **ngay khi người dùng vừa thực hiện thao tác chạm / click / gõ phím đầu tiên ở bất kỳ đâu trên trình duyệt là lập tức bật nhạc Lofi ngay**, còn khi muốn tắt thì bấm nút bật/tắt nhạc ở trang đầu (`#btn-lofi-toggle`).
- **Giải pháp trong `js/lofi-music.js` (hoặc `js/app.js` khi khởi tạo `LofiPlayer`)**:
  ```javascript
  // Tự động kích hoạt phát nhạc Lofi ngay ở thao tác chạm / click / phím bấm đầu tiên khi vào App
  setupFirstInteractionAutoPlay() {
    if (this._firstInteractionBound) return;
    this._firstInteractionBound = true;

    const onFirstUserGesture = (e) => {
      ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach((evtName) => {
        window.removeEventListener(evtName, onFirstUserGesture, true);
      });

      // Nếu thao tác đầu tiên của người dùng là bấm thẳng vào nút #btn-lofi-toggle
      // thì để sự kiện onclick của nút đó tự xử lý để không bị bật-tắt chồng nhau
      if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('#btn-lofi-toggle')) {
        return;
      }

      if (!this.isPlaying) {
        this.play();
      }
    };

    ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach((evtName) => {
      window.addEventListener(evtName, onFirstUserGesture, { capture: true, passive: true });
    });
  }
  ```
  - Gọi `this.setupFirstInteractionAutoPlay()` ngay cuối hàm `LofiPlayer.init()`.

---

### 14. Đồng Bộ Dropdown Chọn Nhạc Lofi & Thanh Kéo Âm Lượng (Volume Slider) Theo Đúng Hệ Thống CyberDropdown & Màu Theme
- **Hiện trạng**:
  - Trong tab `Cài đặt` (`#view-settings`), ô chọn bài nhạc Lofi đang dùng thẻ `<select>` mặc định của trình duyệt nhìn lạc quẻ so với các **CyberDropdown** trên toàn app, và thanh kéo âm lượng (`input[type="range"]`) chưa được đồng bộ màu theo 3 theme (`purple-pink`, `monochrome`, `white-orange`).
- **Giải pháp bắt buộc**:
  1. **Thay thế `<select>` chọn bài nhạc Lofi bằng cấu trúc `.cyber-dropdown` chuẩn của toàn app**:
     - Sử dụng `.cyber-dropdown` (`#lofi-track-dropdown-wrap`) với nút `.cyber-dropdown-trigger` (`#lofi-track-dropdown-trigger`) và menu `.cyber-dropdown-menu` (`#lofi-track-dropdown-menu`).
     - Mỗi bài nhạc trong danh sách (gồm 4 bài Lofi tích hợp sẵn + các bài `.mp3`/`.m4a` người dùng đã upload) được render thành `<button type="button" class="cyber-dropdown-item">` có đánh dấu `.active` ở bài đang phát!
  2. **Đồng bộ toàn bộ Thanh Kéo Âm Lượng (`input[type="range"]` cho Lofi & Âm thanh hiệu ứng) theo 3 Theme**:
     ```css
     /* ==========================================================================
        14. ĐỒNG BỘ THANH KÉO ÂM LƯỢNG (RANGE SLIDER) THEO 3 THEME LIQUID GLASS
        ========================================================================== */
     :root,
     html[data-theme="dark"],
     html[data-theme="purple-pink"],
     body[data-theme="purple-pink"] {
       --range-track-bg: rgba(255, 255, 255, 0.12);
       --range-fill-color: #c084fc;
       --range-thumb-bg: #f472b6;
       --range-thumb-border: #ffffff;
       --range-thumb-glow: rgba(232, 121, 249, 0.55);
     }

     html[data-theme="monochrome"],
     body[data-theme="monochrome"] {
       --range-track-bg: rgba(255, 255, 255, 0.14);
       --range-fill-color: #ffffff;
       --range-thumb-bg: #ffffff;
       --range-thumb-border: #27272a;
       --range-thumb-glow: rgba(255, 255, 255, 0.50);
     }

     html[data-theme="white-orange"],
     body[data-theme="white-orange"] {
       --range-track-bg: rgba(154, 52, 18, 0.14);
       --range-fill-color: #f97316;
       --range-thumb-bg: #ea580c;
       --range-thumb-border: #ffffff;
       --range-thumb-glow: rgba(249, 115, 22, 0.45);
     }

     input[type="range"].lofi-volume-slider,
     #view-settings input[type="range"] {
       -webkit-appearance: none !important;
       appearance: none !important;
       width: 100% !important;
       height: 8px !important;
       border-radius: 999px !important;
       background: var(--range-track-bg) !important;
       border: 1px solid rgba(255, 255, 255, 0.16) !important;
       outline: none !important;
       cursor: pointer !important;
       transition: background 0.2s ease, box-shadow 0.2s ease !important;
     }

     input[type="range"].lofi-volume-slider::-webkit-slider-thumb,
     #view-settings input[type="range"]::-webkit-slider-thumb {
       -webkit-appearance: none !important;
       appearance: none !important;
       width: 20px !important;
       height: 20px !important;
       border-radius: 50% !important;
       background: var(--range-thumb-bg) !important;
       border: 2.5px solid var(--range-thumb-border) !important;
       box-shadow: 0 0 14px var(--range-thumb-glow), 0 2px 6px rgba(0, 0, 0, 0.35) !important;
       cursor: grab !important;
       transition: transform 0.15s ease, box-shadow 0.15s ease !important;
     }

     input[type="range"].lofi-volume-slider::-webkit-slider-thumb:hover,
     #view-settings input[type="range"]::-webkit-slider-thumb:hover {
       transform: scale(1.15) !important;
     }
     ```

---

### 15. Thay Thế Bộ Thể Hiện Theme Cũ Trong `#view-settings` (`image_0f72de.png`) Bằng "Buồng Sóng Năng Lượng Quang Phổ Tương Tác (Interactive Resonance Energy Wave Tuner)" — Kéo Đến Đâu Sóng Đổi Màu & Chuyển Theme Đến Đấy (144+ FPS)
- **Hiện trạng (`image_0f72de.png` — Ảnh 3)**:
  - Phần `"Chế độ Giao diện (Theme Modes)"` trong `#view-settings` hiện tại chỉ là 3 hộp chữ nhật đơn điệu, bên trong mỗi hộp là một vạch xám tĩnh nhìn rất thô và thiếu sức sống.
- **Thiết kế Sáng Tạo Đột Phá (Interactive Resonance Energy Wave Tuner)**:
  Thay thế 3 hộp tĩnh đó bằng một **Buồng Sóng Năng Lượng Quang Phổ (`.theme-energy-wave-chamber`)** kết hợp **SVG Multi-Harmonic Sine Wave + Thanh Kéo Hạt Nhân Năng Lượng (`0% -> 100%`)**:
  1. **Cấu trúc HTML trong `#view-settings` (Thay cho 3 hộp Theme Modes cũ)**:
     ```html
     <div class="theme-energy-wave-chamber" id="theme-energy-chamber">
       <!-- Màn hình Sóng Năng Lượng SVG (100% GPU Transform, 0% lag) -->
       <div class="energy-wave-stage" id="energy-wave-stage">
         <svg class="energy-wave-svg" viewBox="0 0 900 130" preserveAspectRatio="none" aria-hidden="true">
           <defs>
             <linearGradient id="energy-wave-grad-primary" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop id="ew-stop-1" offset="0%" stop-color="#a855f7" />
               <stop id="ew-stop-2" offset="50%" stop-color="#ec4899" />
               <stop id="ew-stop-3" offset="100%" stop-color="#f472b6" />
             </linearGradient>
             <linearGradient id="energy-wave-area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop id="ew-area-top" offset="0%" stop-color="#c084fc" stop-opacity="0.38" />
               <stop id="ew-area-bot" offset="100%" stop-color="#c084fc" stop-opacity="0.0" />
             </linearGradient>
           </defs>
           <!-- Lớp sóng nền hài bậc 2 -->
           <path id="energy-wave-bg-path" class="energy-wave-path-secondary"
                 d="M 0 70 Q 112 20, 225 70 T 450 70 T 675 70 T 900 70 L 900 130 L 0 130 Z"
                 fill="url(#energy-wave-area-fill)" />
           <!-- Dải sóng năng lượng được thắp sáng theo vị trí kéo (--energy-clip-pct) -->
           <g id="energy-wave-active-group">
             <path id="energy-wave-main-path" class="energy-wave-path-main"
                   d="M 0 68 C 90 12, 180 124, 270 68 C 360 12, 450 124, 540 68 C 630 12, 720 124, 810 68 C 855 40, 880 55, 900 68"
                   fill="none" stroke="url(#energy-wave-grad-primary)" stroke-width="3.5" stroke-linecap="round" />
             <path id="energy-wave-harmonic-path" class="energy-wave-path-harmonic"
                   d="M 0 68 C 110 115, 200 20, 310 68 C 420 115, 510 20, 620 68 C 730 115, 820 20, 900 68"
                   fill="none" stroke="url(#energy-wave-grad-primary)" stroke-width="1.6" stroke-dasharray="6 6" opacity="0.7" />
           </g>
         </svg>

         <!-- Thông tin Tần số Theme hiện tại nổi trên mặt kính -->
         <div class="energy-wave-hud">
           <span class="energy-wave-badge" id="energy-wave-mode-badge">RESONANCE // VIOLET ROSE</span>
           <strong class="energy-wave-title" id="energy-wave-mode-title">Tím Hồng (Dreamy Liquid Glass)</strong>
         </div>
       </div>

       <!-- Thanh kéo Năng lượng liên tục (Kéo đến đâu sóng lan & đổi màu Theme đến đấy!) -->
       <div class="energy-slider-control-wrap">
         <input type="range" id="theme-energy-slider" class="theme-energy-slider"
                min="0" max="100" value="12" step="1"
                aria-label="Kéo để chuyển đổi sóng năng lượng giao diện"
                oninput="App.onThemeEnergySliderInput(this.value)"
                onchange="App.onThemeEnergySliderCommit(this.value)">
         <div class="energy-nodes-row">
           <button type="button" class="energy-node-btn" data-theme-opt="purple-pink" onclick="App.selectThemeViaEnergyWave('purple-pink')">
             <span class="energy-node-dot dot-purple"></span>
             <span class="energy-node-label">Tím Hồng</span>
           </button>
           <button type="button" class="energy-node-btn" data-theme-opt="monochrome" onclick="App.selectThemeViaEnergyWave('monochrome')">
             <span class="energy-node-dot dot-mono"></span>
             <span class="energy-node-label">Trắng Đen</span>
           </button>
           <button type="button" class="energy-node-btn" data-theme-opt="white-orange" onclick="App.selectThemeViaEnergyWave('white-orange')">
             <span class="energy-node-dot dot-orange"></span>
             <span class="energy-node-label">Trắng Cam</span>
           </button>
         </div>
       </div>
     </div>
     ```
  2. **Cơ chế hoạt động mượt 144+ FPS trong `js/app.js`**:
     - Khi người dùng **kéo thanh trượt `#theme-energy-slider` (`onThemeEnergySliderInput(val)`)**:
       - Sóng năng lượng `#energy-wave-active-group` mở rộng vùng phát sáng theo phần trăm kéo và uốn lượn theo vị trí con trượt.
       - Nếu `val <= 33`: Sóng chuyển sang phổ **Tím Hồng (`#a855f7 -> #ec4899`)** và kích hoạt ngay theme `purple-pink`!
       - Nếu `34 <= val <= 66`: Sóng chuyển sang phổ **Trắng Đen Bạc (`#a1a1aa -> #ffffff`)** và kích hoạt ngay theme `monochrome`!
       - Nếu `val >= 67`: Sóng bừng sáng phổ **Trắng Cam Năng Lượng (`#fb923c -> #ea580c`)** và kích hoạt ngay theme `white-orange`!
     - Khi người dùng **thả tay (`onThemeEnergySliderCommit(val)`)** hoặc bấm trực tiếp vào 1 trong 3 nút mốc bên dưới (`selectThemeViaEnergyWave(theme)`), con trượt tự hút nhẹ về điểm cộng hưởng chuẩn (`12` cho `purple-pink`, `50` cho `monochrome`, `88` cho `white-orange`) và đồng bộ luôn khi đổi theme từ cụm 3 icon góc trên phải!

---

## PHẦN 2: RÀ SOÁT TỐI ƯU HÓA CODEBASE & VẼ LẠI CÂY KIẾN TRÚC CHUẨN CHỈ (`ARCHITECTURE_GRAPH.md`)

Sau khi hoàn thành 15 mục trên, AI Coding Agent **BẮT BUỘC** thực hiện bước tổng kết kiến trúc sau đây:

1. **Dọn dẹp các đoạn CSS trùng lặp/đè nhau**:
   - Kiểm tra cuối file `css/theme.css` và `css/style.css`, hợp nhất các rule lặp lại của `.stat-card`, `.study-mode-card`, `.deck-card`, `.modal-box`, `.bottom-nav`, `.flashcard-card` từ các đợt `1f` -> `1n` thành một khối nguồn chuẩn duy nhất (Single Source of Truth), đảm bảo file CSS gọn sạch, tốc độ parse CSS nhanh nhất.
2. **Vẽ lại đầy đủ và chính xác 100% file `docs/ARCHITECTURE_GRAPH.md` (và đồng bộ ra `ARCHITECTURE_GRAPH.md` ở thư mục gốc nếu có)**:
   - Quét lại số dòng thực tế (`line numbers`) hiện tại của `index.html`, `js/app.js`, `js/db.js`, `js/lofi-music.js`, `css/theme.css`, `css/style.css`.
   - Cập nhật đầy đủ:
     - **Phần 1**: Sơ đồ cây `Root-to-Branch` (Mermaid `graph TD`) và Bảng tọa độ dòng code thực tế mới nhất của cả 9 Nhánh (Branch 1 -> Branch 9).
     - **Phần 2**: Ma trận liên kết Component dùng chung (CyberDropdown, Liquid Glass Modal Box, 4 Rectangular Stat Cards, 7 Study Mode Cards, Deck Cards Grid, Mobile Floating Liquid Glass Bottom Nav, Lofi Music Bar & First-Touch AutoPlay, Interactive Resonance Energy Wave Theme Tuner, Flashcard Auto-Height 3D Stage & KaTeX Smart Wrap).
     - **Phần 3**: Hệ thống Token 3 Theme (`purple-pink`, `monochrome`, `white-orange`) và Quy luật Ánh sáng Định hướng `135deg` (`--lg-directional-*`).
     - **Phần 4**: Đồ thị luồng dữ liệu & sự kiện (`Action -> Handler -> DB -> Render`) để người dùng gửi lại file cây kiến trúc mới này cho bước tối ưu hóa cuối cùng trước khi push code!

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST — 15 HẠNG MỤC)

- [ ] **1.** Đã xóa bỏ hoàn toàn hiệu ứng kính chia sọc (Fluted Glass) trên Popup; Popup ở Mode Tím Hồng có khung viền và độ tách sáng trong trẻo chuẩn như 2 mode kia.
- [ ] **2.** Đã áp dụng Quy luật Ánh sáng Định hướng `135deg` chuẩn Ảnh 3 (`image_104c17.jpg`): viền trên-trái đón sáng rõ, hai cạnh giữa mờ dịu, góc dưới-phải phản xạ nhẹ, không đánh viền trắng đều 4 cạnh.
- [ ] **3.** Quầng sáng khi trỏ vào khung Quote (`.hero-card:hover`) được thu gọn nhẹ nhàng và chỉ nằm ở ngay dưới đáy khung, không tõe ra các phía.
- [ ] **4, 5 & 6.** 4 ô trạng thái ở khung Quote có hình chữ nhật góc sắc gọn (`border-radius: 4px !important`) trên cả 3 mode; ở Mode Tím Hồng trỏ vào lên màu Tím Light Neon đơn sắc; ở Mode Trắng Cam trỏ vào lên màu Cam Light Neon **đơn sắc** (không gradient), sáng nhạt dịu mắt, không át chữ.
- [ ] **7.** Trỏ chuột vào các đáp án A, B, C, D trong Quiz (`.quiz-option-btn`) không còn đốm tròn trắng nằm ở giữa nút.
- [ ] **8.** Thanh điều hướng dưới cùng trên Mobile (`.bottom-nav`) mang thiết kế Liquid Glass nổi tinh tế; khi chọn tab `Bộ thẻ` hoặc `Ngân hàng` ở Mode Trắng Cam, icon và chữ mang màu Cam Đậm (`#ea580c`) sắc nét, không bị icon trắng chìm trên nền sáng.
- [ ] **9.** Giao diện Mobile ở mọi tab (`Thư viện thẻ`, `Ngân hàng câu hỏi`) căn giữa đối xứng hoàn hảo (không bị lệch sang phải), và các nút `"Thêm câu hỏi mới"` / `"Sao chép Prompt AI viết lại"` nằm gọn trong lưới 2 cột, không bao giờ tràn chữ ra ngoài màn hình.
- [ ] **10.** Tab Ngân hàng câu hỏi trên Mobile chỉ còn duy nhất 1 thanh cuộn gốc của trang (`html`), xóa sạch lỗi 2 scrollbar lồng nhau gây khựng khi vuốt.
- [ ] **11 & 12.** Giải thích ở mặt sau Flashcard chứa công thức LaTeX dài tự động ngắt dòng mượt mà tại các dấu `=`, `\iff`, `\implies` (không tràn ngang như `image_0fd035.jpg`); bỏ nút Thu gọn/Mở rộng làm nhảy cỡ chữ; thẻ Flashcard tự động giãn chiều cao đẩy 4 nút đánh giá SRS xuống dưới, tuyệt đối không bao giờ đè lên 4 nút `Chưa thuộc / Khó nhớ / Nhớ tốt / Rất dễ` (như `image_0f7a9a.jpg`).
- [ ] **13.** Ngay khi người dùng vừa chạm / click / bấm phím lần đầu tiên vào trình duyệt là nhạc nền Lofi tự động bật ngay lập tức.
- [ ] **14.** Ô chọn bài nhạc Lofi trong Cài đặt đã chuyển sang `.cyber-dropdown` đồng bộ toàn app, và thanh kéo âm lượng (`input[type="range"]`) đổi màu đồng bộ theo cả 3 theme.
- [ ] **15.** Phần chọn Theme trong `#view-settings` đã được nâng cấp thành **Buồng Sóng Năng Lượng Quang Phổ Tương Tác (`.theme-energy-wave-chamber`)**: kéo thanh năng lượng đến đâu sóng đổi màu và chuyển theme trực tiếp đến đó mượt 144+ FPS.
- [ ] **16.** Đã cập nhật và vẽ lại chuẩn chỉ file `docs/ARCHITECTURE_GRAPH.md` (và `ARCHITECTURE_GRAPH.md`) theo đúng code mới nhất; `npm test` và `npm run build` đạt 100% PASS.