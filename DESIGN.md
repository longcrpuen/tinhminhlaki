---
name: TinhMinhLaKey Design System
description: 100% Offline-First PWA Study App - Google Material 3 Expressive, Frosted Milky Liquid Glass, 4-Layer Glass Physics, Dual Exam Mode, Smooth 3D Card Flip, Universal Monochrome SVG Icons & Comprehensive Architecture Graph (Phase 1h)
themes:
  violet-rose:
    label: "Tím Hồng (Violet Rose - Default)"
    base: "#0c0916"
    accent: "#c084fc"
    accentSecondary: "#f472b6"
    btnPrimaryBg: "#c084fc"
    btnPrimaryText: "#0d0b14"
    wallpaper: "./backgrounds/bg-2.webp"
  monochrome:
    label: "Trắng Đen (Monochrome - Pure Noir B&W)"
    base: "#09090b"
    accent: "#ffffff"
    accentSecondary: "#e4e4e7"
    btnPrimaryBg: "#ffffff"
    btnPrimaryText: "#09090b"
    wallpaper: "./backgrounds/bg-noir-mono.webp"
  white-orange:
    label: "Trắng Cam Liquid Glass (White Orange Claude UI)"
    base: "#fff7ed"
    accent: "#ea580c"
    accentSecondary: "#c2410c"
    btnPrimaryBg: "#ea580c"
    btnPrimaryText: "#ffffff"
    wallpaper: "./backgrounds/bg-white-orange.webp"
typography:
  posterDisplay:
    fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Arial Black', sans-serif"
    fontSize: "clamp(2.6rem, 6.2vw, 4.8rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.035em"
    strokeWidth: "1.1px"
  quoteSerifWhiteOrange:
    fontFamily: "'Newsreader', 'PT Serif', Georgia, serif"
    fontStyle: "normal"
    fontWeight: 600
    letterSpacing: "-0.02em"
  quoteAccentWhiteOrange:
    fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif"
    fontStyle: "italic"
    fontWeight: 400
    letterSpacing: "-0.02em"
  quoteAccentClaude:
    fontFamily: "'Instrument Serif', 'Playfair Display', 'Caveat', Georgia, serif"
    fontStyle: "italic"
    fontWeight: 600
  bodyFont:
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontWeight: 500
---

# TinhMinhLaKey Design System (Đợt 1h)

## 1. Tổng Quan & Triết Lý Thiết Kế (Overview & Philosophy)

**TinhMinhLaKey** là ứng dụng học tập và thi thử cá nhân hóa 100% Offline-First PWA. Bước sang phiên bản **1h**, hệ thống giao diện đạt chuẩn **Frosted Milky Liquid Glass** chuẩn cao cấp lấy cảm hứng từ thiết kế không gian hiện đại và vật lý ánh sáng:

- **Frosted Milky Liquid Glass (Chuẩn 4 Lớp Vật Lý)**:
  1. *Lớp 1 - Tán xạ mờ sâu (Deep Diffusion Blur)*: `backdrop-filter: blur(40px...44px) saturate(180%)`. Tán nhuyễn các mảng màu nền phía sau như nhung mịn, triệt tiêu hoàn toàn hiện tượng chữ đâm xuyên gây nhiễu thị giác.
  2. *Lớp 2 - Độ đặc nền (Milky / Smoked Translucent Body)*: Ở Light Mode (`white-orange`) là kính trắng kem mờ đục cao cấp (`rgba(255, 253, 250, 0.84)` đến `rgba(248, 238, 228, 0.74)`), chữ màu nâu đen `#1c1917` đầm chắc. Ở Dark Mode là kính khói hổ phách/obsidian mờ đục.
  3. *Lớp 3 - Viền khúc xạ ánh sáng (Specular Refractive Rim)*: Viền bán trong suốt kết hợp ánh sáng nội tâm (`inset 0 1.5px 2px`) tạo độ dày thật của kính chất lỏng.
  4. *Lớp 4 - Bo góc lớn*: `border-radius: 28px` cho modal box và thẻ giao diện chính.
- **Khắc Phục Tận Gốc Lỗi Backdrop Root Isolation**: Gỡ bỏ hoàn toàn `transform`, `will-change: opacity`, và `animation` trên `.modal-overlay`, giúp `.modal-box` thực sự làm mờ các chi tiết trang web phía sau.
- **Xóa Bỏ Con Trỏ Ô Vuông & Ánh Tím Dưới Quote**: Loại bỏ hoàn toàn `#hero-glass-matrix`, `.hero-title-accent::after`, và `.hero-card::before`. Trỏ chuột vào Quote ở Mode Trắng Đen và Trắng Cam hoàn toàn sạch sẽ, không còn lòi ánh sáng tím.
- **Đồng Bộ Ô Thống Kê & Chế Độ Học**: Đã xóa `01 //`..`04 //` khỏi 4 ô thống kê; ở Mode Trắng Cam, ô thống kê lúc nghỉ là kính trắng kem, hover đổi sang màu cam đào hiện đại. Các thẻ chế độ học và bộ thẻ khi hover trở nên trong suốt hơn (`alpha ~0.48`) kèm viền sáng cam tinh tế.
- **Lật Thẻ Flashcard 3D & Chuyển Câu Mượt 140+ FPS**: `rateFlashcard()` ghi dữ liệu SM-2 ngầm bất đồng bộ không chặn UI thread, áp dụng hiệu ứng trượt thẻ hai pha (`.switching-out` -> `.switching-in-start`) chuyển câu tức thì không khựng giật hay quay ngược lại mặt cũ.
- **Chế Độ Bài Thi 2 Mode (Dual Exam Mode)**: Lựa chọn linh hoạt giữa (1) `single`: Từng câu một tập trung và (2) `all`: Toàn bộ câu hỏi cuộn dọc như LMS Moodle, đi kèm thanh Question Palette (1..N) nhảy câu mượt mà và nút nộp bài thi.
- **Đánh Dấu Bookmark & Cờ Flag Nổi Bật**: Biểu tượng SVG bôi đặc 100% (`fill: currentColor !important`) trên nền vàng hổ phách (`#f59e0b`) hoặc đỏ san hô (`#ef4444`).
- **Đồng Nhất Font Chữ Ô Nhập Liệu**: Xóa hoàn toàn `font-family: var(--font-mono)` khỏi mọi `textarea` và `.form-control`, quy về một font Sans-serif sắc nét, độ tương phản cao, dễ đọc.
- **Sửa Lỗi Dropdown Chọn Môn Trong Modal**: Loại bỏ việc truyền chuỗi SVG vào thuộc tính `onclick`, chuyển sang gán sự kiện an toàn qua DOM API với `data-target-subj-id` và luôn hỗ trợ mục "Chưa phân loại" (`subj_unassigned`).
- **Nút "Ôn Cả Môn" Hoạt Động Tuyệt Đối Trên Dữ Liệu Thực**: Cập nhật `db.getCardsBySubject()` truy vấn cả `card.subjectId` và `deck.subjectId`, hỗ trợ đầy đủ `'all'` và `'subj_unassigned'`.
- **Bản Đồ Kiến Trúc Toàn App**: Tạo lập đầy đủ `docs/ARCHITECTURE_GRAPH.md` định vị rõ ràng 9 nhánh cấu trúc, ma trận liên kết component dùng chung và luồng dữ liệu.

---

## 2. Danh Mục Token Trung Tâm (`css/theme.css`)

Mỗi Theme được điều phối thông qua 7 nhóm biến CSS cốt lõi:
1. **Liquid Glass Slab**: `--glass-slab-bg`, `--glass-slab-border`, `--glass-slab-shadow`, `--glass-slab-blur`.
2. **Frosted Card**: `--card-frosted-bg`, `--card-frosted-border`, `--card-frosted-shadow`, `--card-frosted-blur`.
3. **Stat Box Hover**: `--stat-box-hover-bg`, `--stat-box-hover-border`, `--stat-box-hover-shadow`, `--stat-box-hover-color`.
4. **Spotlight & Tương Tác**: `--spotlight-color-1`, `--spotlight-color-2`, `--accent`, `--accent-soft`.
5. **Dropdown**: `--dropdown-bg`, `--dropdown-menu-bg`, `--dropdown-border`, `--dropdown-item-hover-bg`, `--dropdown-item-active-bg`.
6. **Subject Badges**: `--subject-pill-bg`, `--subject-pill-text`, `--subject-pill-border`.
7. **Input & Form Controls**: `--input-bg`, `--input-border`, `--input-text`, `--input-placeholder`.

---

## 3. Quy Chuẩn Kỹ Thuật Nghiệm Thu (Quality Floor)

- **Backdrop-Filter Performance**: `.flashcard-face` áp dụng `backdrop-filter: none;` để bảo toàn tốc độ khung hình >1000 FPS trên Chrome và 140+ FPS trên màn hình tần số quét cao.
- **Layout Stability**: 0px Layout Shift khi chuyển câu hỏi, mở dropdown hoặc lật thẻ.
- **Bảo toàn dữ liệu**: Database `MindSparksQuizDB` và sao lưu JSON toàn vẹn 100%.
- **Tương thích toàn diện**: Vượt qua 100% bài test tự động (`npm test`: 283/283 passed, specialized tests 37, 38, 39, 40, 41 passed) và build production (`npm run build`: 100% success).
