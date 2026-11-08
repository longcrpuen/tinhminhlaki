# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học và Chương, theo dõi tiến độ học tập chi tiết với giao diện Google Material 3 Expressive, 6 nhóm Token tập trung và 3-Theme Liquid Glass.

## Positioning

App học tập offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện chuyển đổi linh hoạt giữa 3 chế độ (Tím Hồng mộng mơ, Trắng Đen Noir, và Trắng Cam 3D Liquid Glass kiểu Claude UI), tốc độ phản hồi tức thì 144+ FPS và hỗ trợ công thức KaTeX không bao giờ bị tràn ngang.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) không được phép mất mát.
- **Phong cách thị giác & Cấu trúc (Phase 1e):**
  - Hệ thống 3 Theme điều phối bởi 6 nhóm Token chuẩn: `violet-rose` (Tím hồng mộng mơ), `monochrome` (Trắng đen 100% tương phản cao), `white-orange` (3D Liquid Glass xuyên thấu kèm chữ nhấn Quote kiểu Claude UI bằng font Instrument Serif / Playfair Display Italic).
  - Khung Hero Quote tối giản, tập trung truyền cảm hứng, loại bỏ toàn bộ tag rườm rà.
  - Tổ hợp Icon & Emoji Đơn Sắc (Monochrome SVG System) dạng vector thanh mảnh (`stroke="currentColor"`).
  - Toàn bộ Heading, Tiêu đề và UI/Thân bài: Đồng nhất sử dụng hệ thống font Sans-serif hiện đại, sắc nét, dễ đọc ('Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', system-ui, sans-serif); Tiêu đề Quote sử dụng 'Montserrat' 900 Black.
  - Viên nang kính đồng nhất Topbar HUD (`.topbar-hud-capsule`) tích hợp Theme Switcher và Chuỗi ngày học, chuyển theme có hiệu ứng Morph icon xoay co giãn tâm.
  - Sidebar chuẩn Liquid Glass (Ảnh 8/9): Cột icon 44px cố định, nhãn trượt mờ mượt mà, viền specular phản quang sáng.
  - Chế độ Lật thẻ (Flashcard) 360° 3D Card Flip (`perspective: 1600px`, nhấc thẻ trục Z và lật tròn không đứt đoạn).
  - Chế độ 5: Ôn theo Môn & Chương (Dual Picker) với danh sách môn tương tác (kèm nút "Ôn cả môn") và danh sách chương đa chọn.
  - Khối Phân bố cấp độ ghi nhớ SM-2: Thanh Phổ Trí Nhớ Tổng Thể 14px và 4 thẻ cấp độ lớn đẳng cấp với font cỡ lớn và badge tỷ lệ %.
  - Loại bỏ hoàn toàn `backdrop-filter` trên thẻ lặp, chuyển sang Optical Liquid Glass Surface đạt 144+ FPS mượt mà.
  - Mode Trắng Cam chuẩn hóa tương phản tuyệt đối (Chữ Nâu Đen Espresso `#1c1410`, Cam Đậm `#c2410c`, Xanh Rừng Đậm `#064e3b`, Đỏ Đậm `#7f1d1d`).
- **Ràng buộc hiệu năng cứng:**
  - Chỉ animate `transform` và `opacity`.
  - Không animate trực tiếp `box-shadow` hay `filter`.
  - Đảm bảo FPS $\ge 120-144$Hz, PageSpeed mobile $\ge 90$.
- **Mobile Ergonomics:**
  - Cụm Topbar HUD căn gọn góc trên phải, không đè tiêu đề.
  - Mobile Bottom Nav dạng thanh viên nang kính mờ với mục active nổi bằng pill kính gọn gàng trong lòng thanh.
- **Không động vào `quotes.js`**.

## Brand Commitments

- Tên ứng dụng: TinhMinhLaKey.
- Khẩu hiệu: Thấu hiểu sâu sắc, ghi nhớ dài lâu.
