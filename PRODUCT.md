# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (MindSparks / TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học, và theo dõi tiến độ học tập chi tiết.

## Positioning

App học tập offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện Dark Mode tông tím dịu dreamy liquid glass, tốc độ phản hồi tức thì và hỗ trợ công thức KaTeX không bao giờ bị tràn ngang.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB không được phép mất mát.
- **Phong cách thị giác (Bắt buộc theo DESIGN-RULES.md):**
  - Dark mode duy nhất; tông tím dịu mộng mơ (soft dark violet liquid glass).
  - Heading font: Pixel font. Thân bài và toàn bộ UI: đúng 1 font sans-serif thường dễ đọc (Plus Jakarta Sans / Inter).
  - Bo góc mềm mại / pill shape, card dạng lưới, chuyển động tinh tế.
  - Công thức KaTeX: không bao giờ có thanh cuộn ngang (zero scrollbar).
- **Ràng buộc hiệu năng cứng:**
  - Chỉ animate `transform` và `opacity`.
  - Không animate trực tiếp `box-shadow` hay `filter`.
  - Hạn chế `backdrop-filter` ở danh sách card, chỉ dùng ở vài bề mặt lớn (topbar, sidebar, modal).
  - Không thêm `will-change` vĩnh viễn; tôn trọng `prefers-reduced-motion`.
  - Đảm bảo FPS $\ge 80-90$ (120Hz), PageSpeed mobile $\ge 90$.
- **Cấu trúc & Layout:**
  - Desktop và Mobile là 2 layout tách biệt, khoanh bằng breakpoint.
  - Mobile cuộn theo cả trang, không scroll lồng nhau, 0px tràn ngang. Dùng `dvh` và safe-area insets.
  - Modal nằm trên thanh tab dưới.
  - Dropdown/Select dùng component Cyber Violet Themed chung.
- **Không động vào `quotes.js`**.

## Brand Commitments

- Tên ứng dụng: MindSparks / TinhMinhLaKey.
- Mascot: `meo.png`.
- Tông màu: Dark violet dreamy theme (#0c0915, #161324, #a78bfa, #c084fc, #ec4899).

## Product Principles

1. **Hiệu năng và trải nghiệm học tập là tối thượng:** Không hy sinh tốc độ hiển thị và độ mượt mà vì trang trí thừa thãi.
2. **Khả năng đọc và tập trung (Readability & Focus):** Chữ rõ ràng, tương phản đạt chuẩn WCAG AA, không chói mắt, giảm tải nhận thức.
3. **Thống nhất token & component:** Mọi giá trị màu sắc, khoảng cách, bo góc xuất phát từ một nguồn duy nhất.
4. **Tách biệt và tối ưu hóa cho từng thiết bị:** Desktop rộng rãi, khoa học; Mobile tiện lợi thao tác một tay với nút bấm $\ge 44\text{px}$.

## Accessibility & Inclusion

- Tương phản màu chữ/nền đạt chuẩn WCAG AA ($\ge 4.5:1$).
- Vùng chạm tối thiểu $44 \times 44\text{px}$ trên mobile.
- Focus ring rõ ràng và điều hướng bàn phím hoàn chỉnh (Tab, Enter, Escape, Arrow keys).
- Hỗ trợ `prefers-reduced-motion` cho người dùng nhạy cảm với chuyển động.
