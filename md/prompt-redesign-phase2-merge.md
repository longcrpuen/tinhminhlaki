# PHASE 2 — Hợp nhất & kiểm tra thẩm mỹ tổng thể (1 agent, SAU khi A, B, C xong)

1. Merge theo thứ tự: `redesign/ui-library` → `redesign/ui-study` → `redesign/ui-tools`. Xử lý xung đột (chủ yếu CSS/token/z-index), ưu tiên token Phase 0.
2. Nếu agent nào ghi "cần đổi token/component chung", xử lý tập trung tại đây (sửa một chỗ, áp cho mọi màn).
3. Rà tính nhất quán toàn app: cùng một kiểu card, nút, tag, dropdown, modal, khoảng cách, bo góc, nhịp chuyển động giữa các màn. Chạy `/impeccable audit` toàn app và sửa các điểm còn lại trong phạm vi style.
4. Kiểm tra bắt buộc:
   - Desktop, iPhone SE, iPhone 16, landscape: không tràn ngang, không scroll lồng, không bị cắt, modal nằm trên tab dưới.
   - LaTeX không scrollbar ngang; câu hỏi dài nhất ở trạng thái đã trả lời + mở giải thích vẫn xem hết được.
   - Hover glow, hình nền, dropdown themed, flashcard chạm để lật, nút Tiếp theo (mobile góc trên, desktop ở dưới) đều đúng.
   - FPS khi cuộn/hover ≥ 80 (Performance panel); Lighthouse mobile không tụt so với bản tag ổn định (mục tiêu ≥ 90).
   - Build production + PWA offline OK, console sạch.
5. Nếu có hồi quy nghiêm trọng không sửa nhanh được: quay về tag ổn định và báo cáo. Không merge vào nhánh chính khi chưa qua hết kiểm tra.
6. Báo cáo cuối: trước/sau, thay đổi chính, các điểm còn tồn đọng.
