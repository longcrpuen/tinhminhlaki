# PHASE 0 — Nền tảng thiết kế (1 agent, chạy TRƯỚC, branch `redesign/foundation`)

**Điều kiện tiên quyết:** hai lỗi hình nền và glow hover đã sửa và merge, app ổn định, đã gắn tag bản ổn định. Nếu chưa → dừng và báo.

Mục tiêu: dựng nền tảng để các agent sau chạy song song mà không đụng nhau.

1. Đọc `DESIGN-RULES.md`. Nếu chưa có trong dự án thì tạo từ nội dung tôi cung cấp.
2. Dùng skill đã cài:
   - Impeccable: chạy `/impeccable init` (nếu chưa có `PRODUCT.md`) và điền đúng theo `DESIGN-RULES.md`; dùng các lệnh của nó (vd `audit`, và các lệnh polish/typography/layout/motion nếu danh sách lệnh có) cho phần việc của bạn.
   - taste-skill: dùng `redesign-existing-projects` làm chính, `high-end-visual-design` để định hướng thẩm mỹ. Khi skill có núm chỉnh thì đặt: DESIGN_VARIANCE ≈ 5, MOTION_INTENSITY ≈ 3, VISUAL_DENSITY ≈ 4 (giao diện học tập: gọn, ít rối, chuyển động tiết chế).
   - **Khi skill mâu thuẫn với `DESIGN-RULES.md` thì `DESIGN-RULES.md` thắng** (tông tím, 1 font + heading pixel, hiệu năng, desktop/mobile tách biệt).
   - Đừng để skill đổi nhận diện sang phong cách khác (brutalist, minimalist trắng, v.v.).

3. **Gom token về một nguồn duy nhất**: màu (nền, bề mặt kính, viền, chữ, accent, trạng thái đúng/sai/cảnh báo), bán kính bo góc, thang khoảng cách, thang cỡ chữ (dùng `clamp()`), độ mờ/viền kính, thời lượng và easing animation. Thay giá trị hard-code lặp lại bằng token (chỉ làm ở file token và các class dùng chung, không sửa từng màn).
4. **Chuẩn hóa component dùng chung** (mỗi cái một chỗ): Card/GlassCard, Button (chính/phụ/ghost/nguy hiểm), Tag/Badge, Input, ThemedSelect, Modal/Dialog, Toggle/Checkbox, Tab/Nav, EmptyState, Skeleton. Đặt trạng thái hover/focus/active/disabled thống nhất theo quy tắc hiệu năng. Focus ring rõ ràng (truy cập bàn phím).
5. Thang typography: heading pixel (kích cỡ + khoảng cách chữ), thân bài 1 font, quy định cỡ chữ cho mobile/desktop. Kiểm tra độ tương phản chữ/nền đạt WCAG AA.
6. Kiểm tra: build production OK, mọi màn vẫn hiển thị đúng như trước (không hồi quy), FPS không giảm. Merge vào nhánh chính khi xong.
7. Báo cáo: bảng token, danh sách component chuẩn, cách dùng. Các agent sau CHỈ dùng những thứ này.

Quy tắc: không đổi logic; không sửa nội dung từng màn ngoài việc thay bằng token/component chuẩn.
