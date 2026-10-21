# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ, y dược) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (Spaced Repetition SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (MindSparks / TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học $\rightarrow$ Bộ thẻ, nhập liệu từ AI & LMS Moodle, và theo dõi tiến độ học tập chi tiết với trải nghiệm người dùng cao cấp.

## Positioning

Không gian học tập và nghiên cứu cá nhân (Tactile & Calm Knowledge Workspace) offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện Obsidian Carbon / Warm Slate tinh tế mang đẳng cấp sản phẩm hàng đầu (Linear, Raycast, Readwise Reader), tốc độ phản hồi tức thì 120fps và hỗ trợ công thức KaTeX hoàn hảo không bao giờ tràn ngang hay scroll lồng nhau.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB` v2) không được phép mất mát hay thay đổi cấu trúc bảng (`subjects`, `decks`, `cards`, `logs`, `meta`).
- **Logic cốt lõi bảo toàn 100%:**
  - Thuật toán lặp lại ngắt quãng SM-2 (`js/srs.js`).
  - Bộ phân tích cú pháp AI JSON/Markdown và Moodle LMS (`js/parser.js`), bao gồm gán đáp án hàng loạt và câu hỏi điền số.
  - Đủ 7 chế độ học tập, tính năng Bookmark, Gắn cờ và AI Rewrite Prompt.
  - Bảo toàn 100% nội dung các câu trích dẫn trong `quotes.js`.
- **Phong cách thị giác (Editorial Study / High-Craft Workspace):**
  - Bảng màu Obsidian Carbon / Warm Slate điềm tĩnh, sâu sắc, giảm mỏi mắt khi học lâu. Màu nhấn Electric Indigo / Cobalt (`#5E6AD2`) hoặc Emerald Sage (`#10B981`) dùng tiết chế cho CTA chính và trạng thái học.
  - Hệ thống phông chữ 3 vai trò: `--font-sans` sắc nét cho câu hỏi và UI; `--font-display` thanh lịch cho tiêu đề/quote; `--font-mono` (`JetBrains Mono`) số liệu `tabular-nums` và code.
  - Biểu tượng SVG tối giản (Lucide / Phosphor style), loại bỏ emoji lòe loẹt và nhãn terminal giả tạo.
  - Công thức KaTeX: tự co giãn và đổi lưới 2x2 sang 1 cột, không bao giờ có scrollbar ngang và không scroll lồng nhau.
- **Ràng buộc hiệu năng cứng:**
  - Chỉ animate `transform` và `opacity`.
  - Không animate trực tiếp `box-shadow` hay `filter`.
  - Tối ưu hóa `backdrop-filter`, chỉ áp dụng ở các lớp bề mặt lớn (topbar, sidebar, modal scrim).
  - Tôn trọng `prefers-reduced-motion: reduce`.
  - Đạt FPS $\ge 80-90$ (120Hz trên màn hình hỗ trợ), PageSpeed mobile $\ge 90$.
- **Cấu trúc & Layout:**
  - Desktop và Mobile là 2 bố cục tối ưu riêng biệt.
  - Mobile cuộn tự nhiên theo toàn trang, 0px tràn ngang. Dùng `dvh` và safe-area insets.
  - Unified Dropdown component dùng chung, tự động định vị chống tràn mép và điều hướng phím hoàn chỉnh.

## Brand Commitments

- Tên ứng dụng: MindSparks / TinhMinhLaKey.
- Mascot: `meo.png`.
- Tinh thần sản phẩm: Nghiêm túc, thanh lịch, tập trung tối đa vào tri thức, không màu mè giả tạo.

## Product Principles

1. **Hiệu năng và chiều sâu tri thức là tối thượng:** Tốc độ tức thì, không giật lag, loại bỏ toàn bộ trang trí rườm rà cản trở sự tập trung.
2. **Khả năng đọc và công thái học nhận thức (Ergonomics & Readability):** Tương phản WCAG AA ($\ge 4.5:1$), cỡ chữ và khoảng cách dòng thoáng đãng, phân cấp thị giác rõ ràng.
3. **Thống nhất Design Tokens & Component:** Tất cả màu sắc, khoảng cách, bo góc, bóng đổ và easing xuất phát từ một hệ thống token duy nhất (`css/theme.css`).
4. **Trải nghiệm xúc giác và chuyển động tinh tế:** Nút bấm phản hồi co nhẹ (`scale(0.97)`), lật thẻ Flashcard 3D với vật lý tự nhiên (`cubic-bezier(0.22, 1, 0.36, 1)`).

## Accessibility & Inclusion

- Tương phản màu chữ/nền đạt chuẩn WCAG AA ($\ge 4.5:1$).
- Vùng chạm tối thiểu $44 \times 44\text{px}$ trên mobile.
- Focus ring sắc nét và điều hướng bàn phím đầy đủ (Tab, Enter, Escape, Arrow keys).
- Hỗ trợ toàn diện `prefers-reduced-motion`.
