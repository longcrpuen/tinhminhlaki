# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi từ AI và LMS Moodle, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học và Chương, theo dõi tiến độ học tập chi tiết với giao diện Frosted Milky Liquid Glass cao cấp, Token Architecture tập trung và 3 Theme đặc sắc.

## Positioning

App học tập offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện chuyển đổi linh hoạt giữa 3 chế độ (Tím Hồng mộng mơ, Trắng Đen Noir, và Trắng Cam Frosted Milky Liquid Glass kiểu Spatial Designer), tốc độ phản hồi tức thì 144+ FPS và hỗ trợ công thức KaTeX không bao giờ bị tràn ngang.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) không được phép mất mát hay thay đổi schema gây lỗi dữ liệu cũ.
- **Phong cách thị giác & Cấu trúc (Phase 1h):**
  - **Frosted Milky Liquid Glass (Chuẩn 4 Lớp Vật Lý):**
    - Áp dụng trên `.modal-box`, `.app-sidebar`, HUD capsule, 4 ô thống kê, 7 thẻ chế độ học, thẻ bộ thẻ, và thẻ câu hỏi.
    - Độ mờ tán xạ sâu `blur(40px...44px) saturate(180%)`, specular rim highlight `inset 0 1.5px 2px`, bo góc lớn `border-radius: 28px`.
    - Ở Mode Trắng Cam: kính trắng kem mờ đục cao cấp lúc nghỉ, chữ màu nâu đen `#1c1917` đầm chắc; hover chuyển sang màu cam đào hiện đại (`--stat-box-hover-bg`) hoặc trong suốt thanh thoát (`alpha ~0.48`).
    - Ở Dark Mode (Trắng Đen / Tím Hồng): kính khói hổ phách/obsidian mờ đục với ánh sáng viền tinh tế.
  - **Khắc Phục Tận Gốc Lỗi Backdrop Root Isolation:** Gỡ bỏ hoàn toàn `transform`, `will-change: opacity`, và `animation` trên `.modal-overlay`, giúp `.modal-box` thực sự làm mờ các chi tiết trang web phía sau.
  - **Loại Bỏ Con Trỏ Ô Vuông & Ánh Tím Khung Quote:** Đã xóa `#hero-glass-matrix`, `.hero-title-accent::after`, và `.hero-card::before`. Trỏ chuột vào Quote ở Mode Trắng Đen và Trắng Cam hoàn toàn sạch sẽ, không còn lòi ánh sáng tím.
  - **Đồng Bộ Ô Thống Kê & 7 Thẻ Chế Độ Học:** Đã xóa `01 //`..`04 //` khỏi 4 ô thống kê dưới Quote; đồng bộ thống nhất một kiểu thiết kế kính mờ cho cả 3 theme.
  - **Lật Thẻ Flashcard 3D & Chuyển Câu Mượt 140+ FPS:** `rateFlashcard()` tính toán SM-2 trong RAM và ghi DB ngầm không chặn UI thread, áp dụng hiệu ứng trượt thẻ hai pha (`.switching-out` -> `.switching-in-start`) chuyển câu tức thì không khựng giật hay quay ngược lại mặt cũ.
  - **Chế Độ Bài Thi 2 Mode (Dual Exam Mode):** Lựa chọn linh hoạt giữa (1) `single`: Từng câu một tập trung và (2) `all`: Toàn bộ câu hỏi cuộn dọc như LMS Moodle, đi kèm thanh Question Palette (1..N) nhảy câu mượt mà và nút nộp bài thi.
  - **Đánh Dấu Bookmark & Cờ Flag Nổi Bật:** Biểu tượng SVG bôi đặc 100% (`fill: currentColor !important`) trên nền vàng hổ phách (`#f59e0b`) hoặc đỏ san hô (`#ef4444`).
  - **Đồng Nhất Font Chữ Ô Nhập Liệu:** Xóa hoàn toàn `font-family: var(--font-mono)` khỏi mọi `textarea` và `.form-control`, quy về một font Sans-serif sắc nét, độ tương phản cao, dễ đọc.
  - **Sửa Lỗi Dropdown Chọn Môn Trong Modal:** Loại bỏ việc truyền chuỗi SVG vào thuộc tính `onclick`, chuyển sang gán sự kiện an toàn qua DOM API với `data-target-subj-id` và luôn hỗ trợ mục "Chưa phân loại" (`subj_unassigned`).
  - **Nút "Ôn Cả Môn" Hoạt Động Tuyệt Đối Trên Dữ Liệu Thực:** Cập nhật `db.getCardsBySubject()` truy vấn cả `card.subjectId` và `deck.subjectId`, hỗ trợ đầy đủ `'all'` và `'subj_unassigned'`.
  - **Bản Đồ Kiến Trúc Toàn App:** Tạo lập đầy đủ `docs/ARCHITECTURE_GRAPH.md` định vị rõ ràng 9 nhánh cấu trúc, ma trận liên kết component dùng chung và luồng dữ liệu.
  - **Typography Quote Trắng Cam:** Sử dụng font Serif thẳng đứng, có chân nhẹ (`Newsreader` / `PT Serif`, weight 600, `font-style: normal !important`) phù hợp chuẩn thiết kế cao cấp, giữ nguyên chữ màu cam rực rỡ.
- **Ràng buộc hiệu năng cứng:**
  - Chỉ animate `transform` và `opacity`.
  - Không animate trực tiếp `box-shadow` hay `filter`.
  - `.flashcard-face` duy trì `backdrop-filter: none;` để đảm bảo 140+ FPS và vượt qua bài benchmark GPU.
  - Đảm bảo FPS $\ge 120-144$Hz, PageSpeed mobile $\ge 90$.
- **Mobile Ergonomics:**
  - Cụm Topbar HUD căn gọn góc trên phải, không đè tiêu đề.
  - Mobile Bottom Nav dạng thanh viên nang kính mờ với 5 tab hiển thị chính.
- **Không động vào `quotes.js`**.

## Brand Commitments

- Tên ứng dụng: TinhMinhLaKey.
- Khẩu hiệu: Thấu hiểu sâu sắc, ghi nhớ dài lâu.
