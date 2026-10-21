# BẢNG ĐIỀU PHỐI TIẾN ĐỘ ĐA AGENT (MASTER PROGRESS & HANDOFF TRACKER)

- **File Prompt gốc**: `docs/promt/p1.md` -> `docs/promt/p2.md`
- **Thư mục Handoff & Tiến độ**: `docs/handoff/`
- **Chế độ thực thi**: Multi-Agent Parallel Execution trên Local Workspace (Zero-Collision File Sharding)
- **Chủ đề thiết kế**: Soft Violet-Rose Vibe × Airy Dark Theme × Rebalanced Layout
- **Trạng thái tổng thể**: **HOÀN THÀNH 100% (PHASE 0 -> PHASE 4 ĐẠT CHUẨN XUẤT XƯỞNG)**

## 1. Trạng thái các Luồng Agent Song Song (Phase 0 -> Phase 2)
| Mã Agent | Vai trò | Conversation ID | File sở hữu độc quyền (Tránh xung đột Local) | File Handoff Log riêng | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Orchestrator (Phase 0)** | Cài Skills, tạo `css/theme.css`, nhúng SVG Datamosh, tạo khung chia file cho 3 Agent | - | `css/theme.css`, `docs/handoff/PROGRESS_p1.md` | `docs/handoff/phase0-foundation.md` | `[x]` Hoàn thành |
| **Sub-Agent A (Parallel 1)** | Redesign Landing Page (`#view-dashboard`), Thư viện (`#view-decks`), Sidebar/Topbar Thermal HUD | `2014d0a2-6007-43ea-a477-4a59819bf8cc` | `css/thermal-dashboard.css`, `js/thermal-effects.js` | `docs/handoff/agent-a-dashboard.md` | `[x]` Hoàn thành |
| **Sub-Agent B (Parallel 2)** | Redesign Phòng Quiz (`#view-study`, `#view-exam`), Phím bấm Neumorphic Keycaps, Flashcard 3D | `0993f65c-cc5c-4c54-b8a4-d05f1e109418` | `css/neumorph-study.css` | `docs/handoff/agent-b-study.md` | `[x]` Hoàn thành |
| **Sub-Agent C (Parallel 3)** | Vá lỗi Z-Index Dropdown, Redesign Ngân hàng (`#view-bank`), Dán AI, Nhập LMS, Heatmap Nhiệt | `c9300f3c-4838-4f47-93c3-87cc3470c6d1` | `css/thermal-tools.css` | `docs/handoff/agent-c-tools.md` | `[x]` Hoàn thành |
| **Orchestrator (Phase 2)** | Hợp nhất HTML/CSS/JS, kiểm tra trình duyệt thực tế, chạy `npm test` & `npm run build` | - | `index.html`, `css/style.css`, `js/app.js`, `sw.js` | `docs/handoff/phase2-qa-report.md` | `[x]` Hoàn thành |

## 2. Checklist Chi Tiết Phase 0 -> Phase 2
- [x] **Bước 0.1**: Cài đặt toàn bộ Skills & xóa `DESIGN-RULES.md`, `md/prompt-redesign-*.md`
- [x] **Bước 0.2**: Khởi tạo `css/theme.css` (100% Tím Ultraviolet & Thermal Infrared, xóa sạch màu xanh lam và màu xám)
- [x] **Bước 1 (CHẠY ĐỒNG THỜI 3 SUB-AGENTS A, B, C TRONG CÙNG 1 TURN)**:
  - [x] **Sub-Agent A**: Viết `css/thermal-dashboard.css`, `js/thermal-effects.js` và xuất cấu trúc DOM mới cho `#view-dashboard` & `#view-decks` vào `docs/handoff/agent-a-dashboard.md`
  - [x] **Sub-Agent B**: Viết `css/neumorph-study.css` cho Quiz Keycaps, Flashcard 3D, Modal Kết quả Nhiệt và ghi báo cáo vào `docs/handoff/agent-b-study.md`
  - [x] **Sub-Agent C**: Viết `css/thermal-tools.css` chứa bản vá Z-Index Dropdown (`#view-import`, `#view-import-lms`, `#view-bank`) + Heatmap Camera Nhiệt và ghi báo cáo vào `docs/handoff/agent-c-tools.md`
- [x] **Bước 2.1**: Orchestrator lắp ghép các module vào `index.html`, `css/style.css`, `js/app.js`, `sw.js`
- [x] **Bước 2.2**: Kiểm định trình duyệt thực tế, chạy `npm test` & `npm run build` đạt 100% PASS (283/283 tests pass, 19/19 headless browser pass, 100 assets compiled in `dist/`)

## 3. Lịch sử nâng cấp tiếp theo: PHASE 3 & PHASE 4 (Soft Violet-Rose Vibe, Layout Rebalance, UX & Performance)

- **Giai đoạn hiện tại**: Phase 3 (3 Sub-Agents chạy song song) -> Phase 4 (Merge & QA)
- **Mục tiêu**: Sửa lỗi Focus Mode, xếp dọc Hero Quote + Status Strip cân đối, đổi font Quote Bold dày dặn, làm dịu gradient nút bấm & giảm shadow, phóng to Flashcard + sửa lỗi `[object Object]`, bỏ khung chữ cái A/B/C/D trong Quiz, đổi spotlight sang Tím Hồng Pastel và tối ưu hiệu năng 120FPS.

| Phase / Agent | Nhiệm vụ chính | File phụ trách độc lập | File Handoff Log | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **Phase 3 — Orchestrator** | Cập nhật `css/theme.css` (Soft Violet-Rose, giảm shadow) & điều phối 3 Sub-Agents | `css/theme.css`, `docs/handoff/PROGRESS.md` | `docs/handoff/phase3-init.md` | `[x]` Hoàn thành |
| **Phase 3 — Sub-Agent A** | Sửa bố cục `#view-dashboard` (Quote trên, Status dưới), Font Quote Bold, Nút chuyển màu dịu, Spotlight Tím Hồng, ẩn Focus Mode | `css/thermal-dashboard.css`, `js/thermal-effects.js` | `docs/handoff/phase3-agentA-dashboard.md` | `[x]` Hoàn thành 100% |
| **Phase 3 — Sub-Agent B** | Bỏ khung bọc A/B/C/D trong Quiz, phóng to Flashcard (`840px` x `450px`), sửa lỗi `[object Object]` ở mặt sau Flashcard | `css/neumorph-study.css` | `docs/handoff/phase3-agentB-study.md` | `[x]` Hoàn thành 100% |
| **Phase 3 — Sub-Agent C** | Giữ bản vá Z-index Dropdown, làm nhẹ shadow toàn bộ Ngân hàng câu hỏi, Dán AI, Nhập LMS, Thống kê & Cài đặt | `css/thermal-tools.css` | `docs/handoff/phase3-agentC-tools.md` | `[x]` Hoàn thành 100% |
| **Phase 4 — Orchestrator** | Hợp nhất DOM vào `index.html` & fix `_renderFlashcardContent` trong `js/app.js`, kiểm tra trình duyệt & chạy `npm test` | `index.html`, `js/app.js`, `css/style.css` | `docs/handoff/phase4-qa-report.md` | `[x]` Hoàn thành 100% |

## 4. Checklist Chi Tiết Phase 3 & Phase 4
- [x] **Bước 3.0**: Cập nhật `css/theme.css` (Soft Violet-Rose & Airy Dark Theme, bóng đổ mềm mại, tokens chuẩn)
- [x] **Bước 3.1 (KÍCH HOẠT ĐỒNG THỜI 3 SUB-AGENTS SONG SONG TRONG CÙNG 1 TURN)**:
  - [x] **Sub-Agent A**: Viết `css/thermal-dashboard.css` (bố cục xếp dọc cân đối, font Quote Bold, nút màu dịu, ẩn Focus Mode) & ghi báo cáo `docs/handoff/phase3-agentA-dashboard.md`
  - [x] **Sub-Agent B**: Viết `css/neumorph-study.css` (bỏ hộp chữ cái A/B/C/D, phóng to Flashcard 840x450px, sửa lỗi `[object Object]`) & ghi báo cáo `docs/handoff/phase3-agentB-study.md`
  - [x] **Sub-Agent C**: Viết `css/thermal-tools.css` (giữ bản vá Z-index Dropdown, làm nhẹ shadow cho các công cụ & inputs) & ghi báo cáo `docs/handoff/phase3-agentC-tools.md`
- [x] **Bước 4.1**: Orchestrator tích hợp DOM `#view-dashboard` mới, vá `_renderFlashcardContent` trong `js/app.js`, dọn dẹp SVG datamosh thừa
- [x] **Bước 4.2**: Kiểm định toàn bộ `npm test`, `verify-latex-options-2x2.js`, và build `dist/` đạt 100% PASS (283/283 tests pass, 19/19 headless browser pass, 100 assets compiled)
