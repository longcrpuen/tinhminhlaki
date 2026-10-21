# Design System: Editorial Study & Tactile Knowledge Workspace

## 1. Tầm nhìn & Triết lý Thiết kế (Art Direction)
Chuyển đổi MindSparks từ giao diện "AI Slop" (tím neon, kính mờ đục, emoji tràn lan, tag terminal giả tạo) sang **không gian học tập điềm tĩnh, xúc giác và cao cấp (Tactile & Calm Knowledge Workspace)** lấy cảm hứng từ các công cụ chuyên nghiệp hàng đầu như Linear, Raycast, Readwise Reader và Craft Docs.

Mỗi chi tiết thiết kế đều phục vụ một mục đích duy nhất: **tối đa hóa khả năng tập trung, ghi nhớ và tư duy sâu của người học**.

---

## 2. Bảng màu & Bề mặt (Color Palette & Tactile Surfaces)

### Nền chính (Canvas & Surfaces)
- **`--bg-canvas`**: `#0B0C0E` — Nền tối tự nhiên sâu, dịu mắt khi đọc lâu ban đêm.
- **`--bg-surface`**: `#12141A` — Bề mặt thẻ, thanh điều hướng, modal.
- **`--bg-surface-elevated`**: `#181B23` — Trạng thái nổi, menu dropdown, tooltip.
- **`--bg-surface-hover`**: `rgba(255, 255, 255, 0.04)` — Phản hồi di chuột êm dịu.
- **`--border-subtle`**: `rgba(255, 255, 255, 0.07)` — Viền ngăn cách sắc nét 1px.
- **`--border-focus`**: `rgba(94, 106, 210, 0.6)` — Viền tương tác và viền active.
- **`--surface-highlight`**: `inset 0 1px 0 rgba(255, 255, 255, 0.05)` — Đường sáng mép trên tinh xảo tạo cảm giác xúc giác thực.

### Màu nhấn (Accent & Brand)
- **`--accent-primary`**: `#5E6AD2` (Electric Indigo / Cobalt) — Dành riêng cho nút CTA chính, trạng thái active của tab, tiến độ học.
- **`--accent-hover`**: `#6E7BE2`
- **`--accent-surface`**: `rgba(94, 106, 210, 0.12)` — Nền badge và highlight đã chọn.
- **`--accent-emerald`**: `#10B981` — Màu tri thức vững chắc và chỉ số thành thạo.

### Màu ngữ nghĩa phản hồi (Semantic Status)
- **`--semantic-success`**: `#34D399` (Xanh lục bảo dịu) | Nền: `rgba(52, 211, 153, 0.10)`
- **`--semantic-error`**: `#F87171` (Đỏ san hô trầm) | Nền: `rgba(248, 113, 113, 0.10)`
- **`--semantic-warning`**: `#FBBF24` (Hổ phách ấm) | Nền: `rgba(251, 191, 36, 0.10)`
- **`--semantic-info`**: `#60A5FA` (Xanh lam nhạt) | Nền: `rgba(96, 165, 250, 0.10)`

### Thang chữ (Typography Scale & Contrast)
- **`--text-primary`**: `#F3F4F6` (Độ tương phản $\ge 12:1$ trên nền tối, vượt chuẩn WCAG AAA).
- **`--text-secondary`**: `#9CA3AF` (Tương phản $\ge 5:1$, đạt chuẩn WCAG AA).
- **`--text-tertiary`**: `#6B7280` — Nhãn phụ, shortcut phím, timestamp.

---

## 3. Hệ thống Phông chữ (3 Phông chữ Rõ Ràng)
1. **`--font-sans`**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
   - Dùng cho 90% giao diện: Câu hỏi, nội dung đáp án, nút bấm, hướng dẫn.
2. **`--font-display`**: `'Plus Jakarta Sans', serif` (hoặc font Display tinh tế)
   - Tiêu đề Hero, trích dẫn danh ngôn Editorial, điểm số tổng kết.
3. **`--font-mono`**: `'JetBrains Mono', SFMono-Regular, Consolas, monospace`
   - `font-variant-numeric: tabular-nums` cho đồng hồ đếm ngược, tỷ lệ %, mã câu hỏi, JSON/LMS editor.

---

## 4. Hệ thống Chuyển động & Micro-interactions (Emil Kowalski Physics)
- **Nguyên tắc cốt lõi**: Chỉ can thiệp vào `transform` và `opacity`. Tuyệt đối không animate `box-shadow`, `width`, `height`, `left`, `margin`.
- **Hành động bấm nút**:
  - `transform: scale(0.97)` trong `80ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Chuyển view / Tab**:
  - `opacity` chuyển đổi kết hợp `translateY(4px) -> translateY(0)` trong `150ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Lật Flashcard 3D**:
  - `transform: rotateY(180deg)` với `perspective: 1200px` và timing lò xo `500ms cubic-bezier(0.22, 1, 0.36, 1)`.
- **Tôn trọng người dùng**:
  - Khi `@media (prefers-reduced-motion: reduce)` kích hoạt: Tắt toàn bộ chuyển động, chuyển sang `opacity` tức thì ($< 50\text{ms}$).

---

## 5. Quy tắc Bố cục & Công thái học (Layout Ergonomics)
- **Desktop (1024px trở lên)**:
  - Sidebar cố định 240px thu gọn mượt mà về 64px icon-only có tooltip hiển thị tự nhiên.
  - Vùng nội dung có `max-width: 1400px` căn giữa cân đối, không để khoảng trống rỗng vô nghĩa.
  - Lưới đáp án Quiz: Tự động chia 2 cột khi rộng và xếp 1 cột khi hẹp hoặc khi chứa công thức KaTeX phức tạp.
- **Mobile (< 768px)**:
  - Thanh Bottom Navigation 4–5 mục với vùng chạm $\ge 48\text{px}$.
  - Cuộn toàn trang tự nhiên (Natural viewport scroll), **0px horizontal scroll**.
  - Dropdown tự động nhận diện mép màn hình: nếu mép dưới hẹp sẽ tự động lật lên (drop-up).
- **Công thức Toán/Lý/Hóa KaTeX**:
  - `overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%`.
  - Phông chữ tự động co giãn (`font-size: clamp(0.9rem, 2vw, 1.15rem)`) để tránh cuộn ngang.

---

## 6. Thống nhất Component (Design Components)
- **`UnifiedDropdown`**: Một cấu trúc thẻ thống nhất với thuộc tính `data-dropdown`, bàn phím `ArrowUp/ArrowDown/Enter/Escape`, ARIA `aria-expanded` và backdrop click detection.
- **`btn`**: Nút bấm với 4 biến thể rõ ràng: `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`.
- **`card`**: Thẻ nền `var(--bg-surface)` viền `var(--border-subtle)` kèm highlight `var(--surface-highlight)`.
- **`badge`**: Thẻ nhãn trạng thái nhỏ gọn với chữ sắc nét, bo góc chuẩn, không màu chói.
