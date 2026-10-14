# DESIGN-RULES.md — Quy tắc thiết kế (đặt ở thư mục gốc dự án, mọi agent phải đọc trước khi làm)

## Nhận diện cố định (KHÔNG được đổi)
- Dark mode duy nhất. Tông tím dịu, mộng mơ (không tím gắt, không neon chói). Có thể phối thêm 1–2 màu accent phụ, dùng tiết chế.
- Heading: font pixel. Mọi thứ còn lại (nội dung, nút, câu hỏi, nhãn): **đúng 1 font thường**, dễ đọc. Không font script/viết tay.
- Phong cách: liquid glass, bo góc lớn/pill, card dạng lưới, hoạt hình mềm mại. Không popup sáng chói trên nền tối.
- Công thức LaTeX (KaTeX): không bao giờ có scrollbar ngang; thu nhỏ chữ hoặc chuyển 1 cột khi cần.

## Nguyên tắc hiệu năng (ràng buộc cứng, ưu tiên hơn thẩm mỹ)
- Chỉ animate `transform` và `opacity`. Không animate `box-shadow`, `filter`, `width/height`, `top/left`.
- `backdrop-filter`: tối đa ở vài bề mặt lớn (nền sidebar/header/modal), KHÔNG đặt trên từng card trong danh sách.
- Glow/hover: pseudo-element + opacity, chỉ trong `@media (hover: hover) and (pointer: fine)`. Glow trạng thái dùng inset hoặc đổi màu viền, không glow ra ngoài bị cắt.
- Không thêm `will-change` vĩnh viễn. Tôn trọng `prefers-reduced-motion`.
- Mục tiêu: FPS ≥ 80–90 (120 nếu màn 120Hz), PageSpeed mobile ≥ 90. Mọi thay đổi không được làm tụt các chỉ số này.

## Cấu trúc & layout
- **Desktop và Mobile là 2 layout tách biệt**, khoanh bằng breakpoint. Sửa 1 bên phải test cả 2 bên (desktop, iPhone SE 375x667, iPhone 16, landscape).
- Không scroll lồng nhau. Mobile: cuộn theo cả trang. Không tràn ngang (không dùng `overflow-x:hidden` làm cách duy nhất). Dùng `dvh` và safe-area inset.
- Modal/popup nằm trên thanh tab dưới (z-index) và vừa màn hình nhỏ.
- Mọi dropdown/select dùng component themed chung (nền tím tối, hover/selected màu tím), không dùng select gốc của trình duyệt.

## Token (nguồn duy nhất — chỉ sửa ở một chỗ)
Tất cả màu, bo góc, khoảng cách, cỡ chữ, thời lượng/easing animation, độ mờ kính nằm ở file token/CSS variables trung tâm. Component chỉ dùng token, không hard-code giá trị.

## Phạm vi cho agent thiết kế
- CHỈ đổi style/layout/chuyển động. KHÔNG đổi logic, dữ liệu, schema, routing, parser, SM-2.
- Không đổi tên/di chuyển file ngoài phạm vi được giao.
