# AGENT A — Trang chủ, Thư viện thẻ, Môn học (branch `redesign/ui-library`) — chạy SAU Phase 0, song song với 2 agent khác

> Bạn là MỘT agent độc lập. Hai agent khác làm các màn khác cùng lúc trên branch khác. Đọc `DESIGN-RULES.md` trước. Chỉ dùng token và component chuẩn đã dựng ở Phase 0. **Không sửa file token/component dùng chung** (nếu thiếu → ghi vào báo cáo để bước hợp nhất xử lý).

## Màn hình thuộc phần của bạn
- Tổng quan (hero quote, thẻ thống kê nhanh, heatmap nếu nằm ở đây)
- Thư viện thẻ (danh sách theo Môn học → Bộ thẻ), điều hướng chung (sidebar desktop, tab dưới mobile)
- Popup chọn/gán môn học (kể cả Gán lại hàng loạt)

## File bạn sở hữu
- Component/page của Tổng quan, Thư viện thẻ, Môn học, Navigation/Layout gốc (chỉ phần style, tuyệt đối không mount nhầm component làm bài vào layout chung)

## Dùng skill đã cài
- Impeccable: chạy `/impeccable init` (nếu chưa có `PRODUCT.md`) và điền đúng theo `DESIGN-RULES.md`; dùng các lệnh của nó (vd `audit`, và các lệnh polish/typography/layout/motion nếu danh sách lệnh có) cho phần việc của bạn.
- taste-skill: dùng `redesign-existing-projects` làm chính, `high-end-visual-design` để định hướng thẩm mỹ. Khi skill có núm chỉnh thì đặt: DESIGN_VARIANCE ≈ 5, MOTION_INTENSITY ≈ 3, VISUAL_DENSITY ≈ 4 (giao diện học tập: gọn, ít rối, chuyển động tiết chế).
- **Khi skill mâu thuẫn với `DESIGN-RULES.md` thì `DESIGN-RULES.md` thắng** (tông tím, 1 font + heading pixel, hiệu năng, desktop/mobile tách biệt).
- Đừng để skill đổi nhận diện sang phong cách khác (brutalist, minimalist trắng, v.v.).

## Mục tiêu thẩm mỹ chung
Đẹp hơn rõ rệt nhưng vẫn là app này: thứ bậc thị giác rõ (heading pixel nổi bật, thân bài thoáng), khoảng cách nhịp nhàng, độ tương phản tốt, kính mờ tinh tế, trạng thái rỗng/đang tải/lỗi được thiết kế, chuyển động mềm và nhẹ. Giảm rối mắt, giảm số thứ cạnh tranh sự chú ý. Không thêm tính năng mới.

## Quy trình mỗi màn hình
1. Chụp ảnh "trước" (desktop + iPhone SE + iPhone 16) và ghi 3–5 điểm yếu thẩm mỹ cụ thể (thứ bậc chữ, khoảng cách, độ tương phản, mật độ, căn lề, trạng thái hover/active/empty/loading).
2. Chỉ sửa style/layout để khắc phục đúng các điểm đó, dùng token. Giữ nguyên chức năng.
3. Chụp "sau", so sánh. Kiểm tra: không tràn ngang, không scroll lồng, LaTeX ổn, FPS khi cuộn/hover ≥ 80, không lỗi console.
4. Mỗi màn xong → commit riêng trên branch của bạn với message rõ ràng. Không làm gộp nhiều màn trong một commit.
5. Cuối cùng báo cáo: danh sách màn đã làm, thay đổi chính, file đã sửa, kết quả kiểm tra. Nếu cần đổi token hoặc file ngoài quyền sở hữu: DỪNG và ghi vào báo cáo, không tự sửa.
