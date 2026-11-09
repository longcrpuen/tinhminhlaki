# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Học sinh, sinh viên, người tự học cần ôn tập kiến thức chuyên sâu (toán, khoa học, kỹ thuật, ngoại ngữ) thông qua flashcard và trắc nghiệm lặp lại ngắt quãng (SM-2).

## Product Purpose

Ứng dụng ôn tập và thi thử cá nhân hóa 100% Offline-First PWA (TinhMinhLaKey). Cho phép tạo/nhập bộ câu hỏi, ôn tập theo chu kỳ tối ưu trí nhớ dài hạn (SM-2), hiển thị công thức toán/lý/hóa LaTeX mượt mà, phân loại theo Môn học và Chương, theo dõi tiến độ học tập chi tiết với giao diện Google Material 3 Expressive, Token Architecture tập trung và 3-Theme Liquid Glass.

## Positioning

App học tập offline-first hoàn toàn không cần server hay tài khoản bên ngoài; dữ liệu lưu trữ 100% trên máy người dùng (IndexedDB), giao diện chuyển đổi linh hoạt giữa 3 chế độ (Tím Hồng mộng mơ, Trắng Đen Noir, và Trắng Cam 3D Liquid Glass kiểu Claude UI), tốc độ phản hồi tức thì 144+ FPS và hỗ trợ công thức KaTeX không bao giờ bị tràn ngang.

## Operating Context

- Trình duyệt Web Desktop (Chrome, Safari, Edge, Firefox).
- Thiết bị di động (Mobile PWA trên iPhone SE, iPhone 13/14/15/16, Android) cả hướng dọc và xoay ngang (landscape).
- Môi trường hoàn toàn không có internet (Offline-first PWA).

## Capabilities and Constraints

- **Bảo toàn dữ liệu tuyệt đối:** Dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) không được phép mất mát.
- **Phong cách thị giác & Cấu trúc (Phase 1g):**
  - **Zero Unicode Emoji Policy:** Quét sạch 100% ký tự emoji màu khỏi `index.html` và `js/app.js` (kiểm toán tự động đạt 0 emoji còn sót). Toàn bộ biểu tượng chức năng (Quiz toolbar, bookmark, flag, toast, modal) là inline SVG đơn sắc (`stroke="currentColor" fill="none"`).
  - **Kiến Trúc Token Trung Tâm Toàn Diện:** Card, Modal, Dropdown, Scrollbar, Toast, Session Restore Banner, Mobile Bottom Nav đều nhận biến trực tiếp từ `css/theme.css`. Chữ dropdown sắc nét, thanh cuộn đồng bộ thumb và toast mang phong cách glass đa theme.
  - **Lưới 20 Icon SVG Tối Giản Cho Môn Học:** Xóa bỏ hoàn toàn "Màu nhận diện (Vibe Swatches)", `<input type="color">` và ô xem trước emoji; chỉ giữ lại tên môn và lưới 20 nút icon SVG monochrome.
  - **Frosted Liquid Glass Modals:** Popup dạng kính mờ chất lỏng (`backdrop-filter: blur(28px) saturate(180%)`), gỡ bỏ blur nặng trên overlay (`backdrop-filter: none !important`), làm sạch màu nền viết cứng ở footer.
  - **Interactive Glass Tile Matrix (Dashboard Hero):** Lưới ô kính phản chiếu tương tác theo con trỏ chuột (`--mx`, `--my`) đạt trên 140 FPS nhờ tối ưu GPU radial gradient.
  - **Tối Ưu Chế Độ 5 ("Ôn theo môn học & chương"):** Khôi phục popup chọn môn và chương đa chọn với `dataset.topicVal`, hỗ trợ lọc `subjectId` sâu trong IndexedDB.
  - **Tương Phản Nghỉ & Typography Serif Cho Mode Trắng Cam:** Quote Hero dùng Serif thẳng đứng phẳng phiu (`Merriweather` / `Lora`, `font-style: normal !important`); các thẻ áp dụng Smoked Frosted Glass nghỉ (`rgba(34, 27, 22, 0.72)`) và hover trong suốt rực ánh cam.
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
