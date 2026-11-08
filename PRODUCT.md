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
- **Phong cách thị giác & Cấu trúc (Phase 1f):**
  - **Zero Hardcoded Purple Tokens:** Quét sạch 100% màu tím viết cứng trong CSS và JS; điều phối hoàn toàn qua biến trung tâm trong `css/theme.css`.
  - **Universal Monochrome SVG System (`App.getMonoSvg` & `App.renderSubjectIcon`):** Loại bỏ hoàn toàn emoji màu khỏi DOM; 100% biểu tượng môn học và bộ lọc là inline SVG nét mảnh `stroke="currentColor"`.
  - **Sidebar Pill Animation Chuẩn 44px:** Xóa notification badge khỏi nút "Tổng quan", loại bỏ vạch dọc `::before`, chuyển toàn bộ 7 nút sang hoạt ảnh pill đơn sắc đồng nhất.
  - **Thanh Pin Năng Lượng Đa Theme (`--battery-*`):** Khắc phục triệt để hộp đen xanh neon; hiển thị trắng/xám matte ở Trắng Đen và kem ấm + cam `#ea580c` ở Trắng Cam.
  - **Khôi Phục Chế Độ 5 & Đẩy 7 Chế Độ Lên Đầu Dashboard:** Khối 7 Chế Độ Ôn Tập xuất hiện ngay dưới Hero Quote, trước Bộ câu hỏi; Chế độ 5 mở popup chọn môn & chương mượt mà.
  - **Liquid Glass Popups & Topbar HUD Capsule:** Toàn bộ `.modal-box` áp dụng `var(--bg-glass-liquid)` kèm `backdrop-filter: blur(28px)`; `.topbar-hud-capsule` mờ kính 20px; nút Tiếp theo trên Mobile phẳng đơn sắc.
  - **Tương Phản Nghỉ & Typography Serif Cho Mode Trắng Cam:** Thẻ có viền cam nhạt và bóng đổ ấm ngay ở trạng thái nghỉ; Quote Hero dùng font Serif dày (`Playfair Display`, `font-weight: 700`) cho chữ thường và bỏ in đậm cho chữ nghiêng điểm nhấn.
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
