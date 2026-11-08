# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học và Chương, theo dõi tiến độ học tập chi tiết với giao diện Google Material 3 Expressive & 3-Theme Liquid Glass.

## Positioning

App học tập offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện chuyển đổi linh hoạt giữa 3 chế độ (Tím Hồng mộng mơ, Trắng Đen Noir, và Trắng Cam 3D Liquid Glass kiểu Claude UI), tốc độ phản hồi tức thì và hỗ trợ công thức KaTeX không bao giờ bị tràn ngang.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) không được phép mất mát.
- **Phong cách thị giác (Phase 1d):**
  - Hệ thống 3 Theme hoàn chỉnh: `violet-rose` (Tím hồng mộng mơ), `monochrome` (Trắng đen 100% tương phản cao), `white-orange` (3D Liquid Glass xuyên thấu kèm chữ nhấn Quote kiểu Claude UI bằng font Instrument Serif / Playfair Display Italic).
  - Khung Hero Quote tối giản, tập trung truyền cảm hứng, loại bỏ toàn bộ tag rườm rà.
  - Tổ hợp Icon & Emoji Đơn Sắc (Monochrome Icon System) tự động áp bộ lọc màu theo từng Theme.
  - Toàn bộ Heading, Tiêu đề và UI/Thân bài: Đồng nhất sử dụng hệ thống font Sans-serif hiện đại, sắc nét, dễ đọc ('Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif); Tiêu đề Quote sử dụng 'Montserrat' 900 Black.
  - Thanh Quick-Jump Subject Bar ở tab Thư viện thẻ phục vụ chuyển nhanh đến Folder Môn học.
  - Nút câu hỏi tiếp theo trong Quiz không bị đóng khung hộp cồng kềnh.
  - Chế độ Lật thẻ (Flashcard) đạt chuẩn 120FPS mượt mà cả khi lật tại chỗ lẫn khi chuyển câu (0px layout shift, lưu DB nền không chặn UI).
- **Ràng buộc hiệu năng cứng:**
  - Chỉ animate `transform` và `opacity`.
  - Không animate trực tiếp `box-shadow` hay `filter`.
  - Đảm bảo FPS $\ge 80-90$ (120Hz), PageSpeed mobile $\ge 90$.
- **Cấu trúc & Layout:**
  - Topbar không còn dải băng nền tối, chỉ giữ cụm 3-Icon chọn Theme nổi gọn góc phải.
  - Sidebar dạng Floating Capsule tách rời mép màn hình, bấm vào icon chú mèo mascot để đóng/mở mượt mà 2 chiều.
  - Mobile Bottom Nav dạng thanh viên nang nổi với icon active hạ thấp độ nhô vừa vặn, không che khuất thao tác.
- **Không động vào `quotes.js`**.

## Brand Commitments

- Tên ứng dụng: TinhMinhLaKey.
- Mascot: `meo.png`.
- Tông màu: 3 Theme (`violet-rose`, `monochrome`, `white-orange`).

## Product Principles

1. **Hiệu năng và trải nghiệm học tập là tối thượng:** Không hy sinh tốc độ hiển thị và độ mượt mà vì trang trí thừa thãi.
2. **Khả năng đọc và tập trung (Readability & Focus):** Chữ rõ ràng, tương phản đạt chuẩn WCAG AA, không chói mắt, giảm tải nhận thức.
3. **Thống nhất token & component:** Mọi giá trị màu sắc, khoảng cách, bo góc xuất phát từ một nguồn duy nhất.
4. **Tách biệt và tối ưu hóa cho từng thiết bị:** Desktop rộng rãi, khoa học; Mobile tiện lợi thao tác một tay với nút bấm $\ge 44\text{px}$.

## Accessibility & Inclusion

- Tương phản màu chữ/nền đạt chuẩn WCAG AA ($\ge 4.5:1$).
- Vùng chạm tối thiểu $44 \times 44\text{px}$ trên mobile.
- Focus ring rõ ràng và điều hướng bàn phím hoàn chỉnh (Tab, Enter, Escape, Spacebar, 1-4).
- Hỗ trợ `prefers-reduced-motion` cho người dùng nhạy cảm với chuyển động.
