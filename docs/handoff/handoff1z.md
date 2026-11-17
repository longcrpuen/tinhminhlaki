# HANDOFF & TIẾN ĐỘ THỰC HIỆN ĐỢT 1Z (`docs/handoff/handoff1z.md`)
> **File đặc tả & prompt gốc**: `docs/promt/promt1z.md`
> **Mục tiêu**: Nâng cấp preset `'christmas-tree'` trong `js/ascii-bg.js` thành hiệu ứng Cây Thông Noel 3D ASCII 4 pha (xoắn ốc hiện hình $\rightarrow$ xoay 3D đèn kép & sao tỏa tia $\rightarrow$ sóng phát sáng & tan biến thành hạt $\rightarrow$ loop liên tục), giữ 24 FPS và 0 lag cho UI Liquid Glass.

---

## Checklist Tiến Độ

- [ ] **1. Chuẩn hóa bố cục & bảng màu (`js/ascii-bg.js`)**
  - [ ] Đặt độ mờ mặc định (`defaultOpacity`) lên `0.78` để tán cây nổi bật rõ trên nền tối `#070b0f` mà vẫn giữ chữ Liquid Glass dễ đọc.
  - [ ] Trên Desktop (`>= 1024px`), căn trục tâm cây thông lệch nhẹ sang phải (`~58%–62%` chiều rộng) để tránh bị khối chữ hero lớn che mất đỉnh/thân.
  - [ ] Thay gốc `######` bằng thân gỗ mảnh `||#||` (`#b45309` / `#d97706`) và vòng phản chiếu ánh sáng mờ dưới chân cây.

- [ ] **2. Cài đặt Chu kỳ 4 Pha Loop 11 Giây (`cycleTime = t % 11.0`)**
  - [ ] **Pha 1 (`0.0s–2.4s`)**: Vẽ dần cây thông từ đáy lên đỉnh theo đường xoắn ốc ánh sáng.
  - [ ] **Pha 2 (`2.4s–6.8s`)**: Tán thông 3D 5 tầng xoay mượt với Z-buffer, dải đèn xoắn ốc kép (vàng `#fde047`, xanh băng `#38bdf8`, hồng ngọc `#fb7185`) và ngôi sao đỉnh tỏa tia nhấp nháy.
  - [ ] **Pha 3 (`6.8s–9.8s`)**: Làn sóng ánh sáng quét từ gốc lên đỉnh làm ký tự bùng sáng rực rồi tách thành các hạt ASCII (`* + · .`) bay tản ra và tan biến mờ dần.
  - [ ] **Pha 4 (`9.8s–11.0s`)**: Khoảng lặng ngắn với tuyết rơi nhẹ trước khi lặp lại Pha 1 mượt mà.

- [ ] **3. Tối ưu Selective Glow 2 Pass (0 Lag, Giữ UI 90–120 FPS)**
  - [ ] **Pass 1 (`shadowBlur = 0`)**: Vẽ toàn bộ nền tán cây, thân cây và tuyết rơi.
  - [ ] **Pass 2 (`shadowBlur = 12`)**: Chỉ lọc ~50–90 điểm đèn xoắn ốc, ngôi sao đỉnh, đỉnh sóng phát sáng và hạt tan biến để vẽ hào quang.
  - [ ] Giữ nguyên cơ chế khóa 24 FPS và tự động `pause` khi ẩn tab (`document.hidden`), mở modal (`modal-open`), hoặc đổi sang theme khác (`dark` / `bw` / `orange`).

- [ ] **4. Kiểm thử & Build Verification**
  - [ ] Kiểm tra trực tiếp trên trình duyệt đủ 4 pha chuyển động mượt, chữ câu hỏi/thẻ Liquid Glass vẫn sắc nét dễ nhìn.
  - [ ] Chạy `node tests/test-runner.js` — Pass 100%.
  - [ ] Chạy `node scripts/build.js` — Pass 100%.

---

## Nhật Ký Handoff (Agent cập nhật sau khi chạy xong)
- **Trạng thái**: Chưa bắt đầu
- **Các file đã sửa**: _Chờ cập nhật_
- **Kết quả `test-runner.js`**: _Chờ chạy_
- **Kết quả `build.js`**: _Chờ chạy_
- **Ghi chú / Việc cần làm tiếp**: _Không có_