# MASTER PROMPT: TÁI CẤU TRÚC TOÀN DIỆN & THIẾT KẾ LẠI UI CHỐNG "AI SLOP" (MINDSPARKS / TINHMINHLAKEY)

> **HƯỚNG DẪN DÀNH CHO AI CODING AGENT (Claude Code / Cursor / Codex / Antigravity):**
> Bạn là **Lead Design Engineer & Principal Frontend Architect**. Nhiệm vụ của bạn là đọc toàn bộ dự án này, **hủy bỏ hoàn toàn giao diện "AI Slop" hiện tại** (tím neon, kính mờ giả tạo, viền phát sáng, emoji tràn lan, tag giả lập terminal `SYSTEM // MODE // 01`, và hơn 480 lệnh `!important` chồng chéo), đồng thời **tối ưu hóa toàn bộ kiến trúc code** và **thiết kế lại UI/UX từ gốc** theo tiêu chuẩn sản phẩm học tập cao cấp (Editorial Study / Tactile Knowledge Workspace).
>
> **QUY TẮC BẮT BUỘC TRƯỚC KHI BẮT ĐẦU:**
> 1. Đọc kỹ toàn bộ tài liệu này từ đầu đến cuối.
> 2. Khởi tạo ngay file `PROGRESS.md` ở thư mục gốc và cập nhật trạng thái (`[ ]` -> `[/]` -> `[x]`) sau mỗi bước hoàn thành.
> 3. Thực thi theo kiến trúc **Đa Agent (Multi-Agent Orchestration)** hoặc phân luồng Sub-agent độc lập theo đúng ranh giới file đã quy định ở Phần 5.

## PHẦN 1: CÀI ĐẶT & KÍCH HOẠT BỘ SKILLS (CHẠY TRƯỚC TIÊN)

Trước khi lên kế hoạch hay chạm vào code, hãy mở terminal tại thư mục gốc của dự án và kiểm tra/cài đặt đầy đủ bộ kỹ năng thiết kế, kiến trúc và chuyển động sau:

```bash
# 1. Cập nhật Impeccable (Design Language & 61 Detector Rules chống AI Slop)
npx impeccable update || npx impeccable install

# 2. Cài đặt Taste-Skill v2.1 (Art Direction, Anti-Slop & App Screen Inspector)
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "high-end-visual-design"
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "minimalist-ui"

# 3. Cài đặt Matt Pocock Engineering Skills (Kiến trúc Deep Modules, Chia Ticket, TDD & Code Review đa Agent)
npx skills@latest add mattpocock/skills

# 4. Cài đặt bộ đôi Animation & Design Engineering đỉnh cao (Emil Kowalski & LottieFiles Motion)
npx skills add emilkowalski/skill
npx skills add LottieFiles/motion-design-skill
```

### Cách phối hợp các Skill trong suốt quá trình thực thi:
| Tên Skill / Công cụ | Nguồn | Vai trò bắt buộc trong dự án |
| :--- | :--- | :--- |
| **`design-taste-frontend`** & **`high-end-visual-design`** | `Leonxlnx/taste-skill` | Định hình Art Direction, loại bỏ bố cục AI rập khuôn, kiểm tra khung hình thực tế bằng trình duyệt ở 3 kích thước màn hình. |
| **`impeccable`** (`/impeccable init`, `distill`, `typeset`, `layout`, `animate`, `audit`, `polish`) | `pbakaus/impeccable` | Khởi tạo lại `PRODUCT.md` sạch, tạo `DESIGN.md` mới, tinh giản chi tiết thừa (`distill`), chuẩn hóa chữ (`typeset`) và chạy 61 quy tắc kiểm định tự động (`audit`). |
| **`emilkowalski/skill`** | `emilkowalski/skill` | Thiết kế micro-interactions, vật lý lò xo (spring physics), phản hồi xúc giác khi lật thẻ Flashcard, chọn đáp án, mở modal/drawer. |
| **`motion-design-skill`** | `LottieFiles/motion-design-skill` | Xây dựng hệ thống Choreography đồng nhất 60–120fps chỉ dùng GPU compositor (`transform`, `opacity`). |
| **`improve-codebase-architecture`**, **`to-tickets`**, **`implement-spec`**, **`code-review`** | `mattpocock/skills` | Bóc tách God Object `js/app.js` và `css/style.css` thành các Deep Modules, chia việc cho các Sub-agent và chạy Code Review 2 trục (Standards + Spec). |

## PHẦN 2: DỌN DẸP RÀO CẢN SÁNG TẠO & CHẨN ĐOÁN BỆNH "AI SLOP"

 Dự án hiện tại đang chứa các file quy tắc cũ ép buộc AI phải giữ nguyên giao diện tím neon / liquid glass. **Agent ở Phase 0 BẮT BUỘC phải xử lý triệt để các mục sau:**

### 2.1. Hủy bỏ các file thiết kế cũ đang khóa chặt sự sáng tạo
1. **Xóa hoặc viết đè hoàn toàn `DESIGN-RULES.md`**: File hiện tại đang chứa dòng *"Nhận diện cố định (KHÔNG được đổi): Dark mode duy nhất. Tông tím dịu, mộng mơ... Phong cách: liquid glass"*. **Hãy xóa bỏ toàn bộ nội dung này** và thay bằng `DESIGN.md` mới (sinh qua `/impeccable document` hoặc `/impeccable craft`).
2. **Làm sạch `PRODUCT.md`**: Giữ lại phần mô tả nghiệp vụ cốt lõi (Offline-First PWA, thuật toán SM-2, hỗ trợ công thức KaTeX, phân loại Môn học -> Bộ thẻ, nhập liệu từ AI & LMS Moodle, bảo toàn 100% dữ liệu IndexedDB và giữ nguyên nội dung `quotes.js`), nhưng **XÓA BỎ HOÀN TOÀN** mục ép buộc màu tím `#0c0915`, `#a78bfa`, `#c084fc`, `Cyber Violet Dropdown` và tham chiếu tới `DESIGN-RULES.md`.
3. **Xóa toàn bộ các file prompt cũ trong thư mục `md/`**:
   - Xóa `md/prompt-redesign-phase0-foundation.md`
   - Xóa `md/prompt-redesign-agentA-library.md`
   - Xóa `md/prompt-redesign-agentB-study.md`
   - Xóa `md/prompt-redesign-agentC-tools.md`
   - Xóa `md/prompt-redesign-phase2-merge.md`

### 2.2. Danh sách các triệu chứng "AI Slop" và Nợ Kỹ Thuật (Technical Debt) cần diệt tận gốc
1. **Bội thực Tím Neon & Kính mờ giả tạo (Purple Glow Slop)**:
   - Mọi thẻ, nút, viền đều dùng gradient tím-hồng (`#a78bfa` -> `#c084fc` -> `#f472b6`), bóng phát sáng (`--neon-glow-primary`), và hiệu ứng quét sáng giả (`glassRefract`).
2. **Tag giả lập Terminal & Bội thực Emoji**:
   - Xóa bỏ các nhãn vô nghĩa kiểu `SYSTEM // SM-2 ACTIVE`, `MODE // 01`..`07`, `LIBRARY // ALL`, `LMS // AUTO-PARSER`, `ANALYTICS // SM-2`, `REF//MS-8X4`.
   - Thay thế hệ thống emoji lòe loẹt (`⚡`, `🎯`, `✨`, `📚`, `⏰`, `🏆`, `🔥`, `🎲`, `🚀`, `🎴`, `🗑️`, `🔄`) bằng bộ **SVG Icon đường nét tối giản, đồng bộ (Lucide / Phosphor style)** với `stroke-width: 1.75` hoặc `2`.
3. **Hỗn loạn Phông chữ (Typography Chaos)**:
   - Hiện tại `index.html` và `css/fonts.css` đang tải tới 9 họ font (`Pixelify Sans`, `VT323`, `Caveat`, `Anton`, `Be Vietnam Pro`, `Montserrat`, `Playfair Display`, `Plus Jakarta Sans`, `JetBrains Mono`).
   - **Giải pháp**: Gỡ bỏ link Google Fonts thừa trong `index.html` để đảm bảo 100% Offline-first thực sự và tối ưu tốc độ tải. Chỉ sử dụng hệ thống 3 vai trò font rõ ràng:
     - `--font-sans`: 1 font Sans-serif hiện đại, sắc nét cho toàn bộ UI & câu hỏi (VD: `Plus Jakarta Sans` hoặc `Be Vietnam Pro` / `Inter`).
     - `--font-display`: 1 font Display/Editorial hoặc Pixel tinh tế (dùng cực kỳ tiết chế cho tiêu đề lớn / điểm số, không lạm dụng tràn lan).
     - `--font-mono`: `JetBrains Mono` cho số liệu thống kê (`tabular-nums`), đồng hồ đếm ngược, mã JSON/LMS.
4. **Rác CSS `!important` và Inline Styles (`css/style.css` dài 2.350+ dòng)**:
   - Có hơn **480 lệnh `!important`** đè chồng lên nhau giữa Desktop, Mobile và Landscape.
   - Đầy rẫy các đoạn comment giữ chuỗi cho test cũ (`/* Compatibility comment for legacy test assertions */`) và các khối DOM ẩn vô dụng trong `index.html` (`<div class="dashboard-bento-metrics" style="display: none;">`, `<div id="dashboard-battery-container" style="display: none;">`).
   - Hàng loạt thẻ HTML trong `index.html` và template string trong `js/app.js` đang viết cứng `style="..."`.
5. **God Object `js/app.js` (1.850+ dòng) & Lặp code**:
   - Có tới **18 hàm `toggle...Dropdown` và `select...`** viết lặp đi lặp lại cho từng dropdown (`bank-subject`, `bank-topic`, `bank-diff`, `bank-source`, `import-subject`, `import-deck`, `lms-subject`, `lms-deck`, `exam-count`, `exam-time`, `sprint-count`, `edit-card-*`, `manage-subject-*`, `bulk-reassign-*`).
   - `js/worker.js` đang copy-paste lại logic của `js/parser.js` và `js/srs.js` với regex lệch nhau thay vì dùng chung một nguồn.
   - File `quotes.js` bị nhân bản ở cả thư mục gốc `./quotes.js` và `./js/quotes.js`.

## PHẦN 3: ĐỊNH HƯỚNG THIẾT KẾ MỚI (HIGH-CRAFT STUDY WORKSPACE)

Áp dụng **`design-taste-frontend`** (`Leonxlnx/taste-skill`), **`impeccable`**, và **`emilkowalski/skill`** để kiến tạo một không gian học tập mang đẳng cấp của **Linear, Raycast, Readwise Reader, và Craft Docs**:

### 3.1. Bảng màu & Bề mặt (Tactile & Calm Surfaces)
- **Từ bỏ màu tím neon AI Slop**. Chuyển sang bảng màu **Obsidian Carbon / Warm Slate** (hoặc hỗ trợ song song **Adaptive Dark Obsidian & Warm Paper Light Mode**):
  - **Nền chính (Canvas)**: Tối sâu tự nhiên, dịu mắt khi đọc lâu (`#0B0C0E` hoặc `#0E1015`), kết hợp viền mảnh tinh tế `1px solid rgba(255, 255, 255, 0.07)` và `inset 0 1px 0 rgba(255, 255, 255, 0.04)`.
  - **Màu nhấn (Primary Accent)**: Chọn màu nhấn mang tính học thuật, điềm tĩnh và sắc sảo — ví dụ **Electric Indigo / Cobalt (`#5E6AD2`)**, **Emerald Sage (`#10B981`)**, hoặc **Warm Amber (`#F59E0B`)** chỉ xuất hiện ở CTA chính, trạng thái active và dữ liệu biểu đồ.
  - **Ngữ nghĩa trạng thái (Semantic Feedback)**:
    - Đúng / Thành thạo: Xanh lục bảo dịu (`#34D399`, nền `rgba(52, 211, 153, 0.10)`).
    - Sai / Cần học lại: Đỏ san hô trầm (`#F87171`, nền `rgba(248, 113, 113, 0.10)`).
    - Cảnh báo / Đến hạn: Cam hổ phách (`#FBBF24`, nền `rgba(251, 191, 36, 0.10)`).
- **Hỗ trợ Hình nền tùy chọn (Custom Wallpapers)**: Khi người dùng bật hình nền trong Cài đặt, sử dụng lớp phủ Scrim thông minh có độ tương phản cao để mặt thẻ câu hỏi luôn đạt chuẩn đọc WCAG AA ($\ge 4.5:1$) mà không cần lạm dụng `backdrop-filter` trên từng thẻ con.

### 3.2. Bố cục, Nhịp điệu & Trải nghiệm từng màn hình
1. **Tổng quan (Dashboard)**:
   - Thiết kế theo bố cục **Bento Grid bất đối xứng có chủ đích**:
     - Khối **Hero & Focus Action**: Hiển thị câu Quote từ `quotes.js` với nghệ thuật sắp chữ (Editorial Typography) tinh tế, đi kèm nút hành động chính **"Ôn tập hôm nay (N câu đến hạn)"** nổi bật rõ ràng.
     - Khối **Chỉ số cốt lõi (Metrics Strip)**: Số liệu dùng `font-variant-numeric: tabular-nums`, căn lề sắc nét, không dùng icon hộp màu lòe loẹt.
     - Khối **Chế độ học (7 Study Modes)**: Gom nhóm thông minh thành **Chế độ Cốt lõi** (Spaced Repetition SM-2, Ôn câu hay sai, Ôn nước rút) và **Chế độ Luyện tập / Kiểm tra** (Tự do, Theo chủ đề, Đoán trước Active Recall, Phòng thi tính giờ) thay vì dàn trải 7 thẻ giống hệt nhau gây mỏi mắt.
2. **Thư viện Bộ thẻ & Môn học (Decks & Subjects)**:
   - Cấu trúc phân cấp rõ ràng: **Môn học (Subject Accordion / Tabs)** $\rightarrow$ **Danh sách Bộ thẻ (Decks)**.
   - Mỗi thẻ Deck hiển thị thanh tiến độ thu nhỏ (Mastered / Review / New), số câu cần ôn hôm nay, và nhóm nút thao tác gọn gàng (Ôn tập, Flashcard, Thi thử, Menu `...` cho Sửa/Reset/Xóa thay vì nhồi 6 nút ngang hàng).
3. **Không gian Làm bài Quiz & Flashcard (Study & Exam Player)**:
   - **Tối đa hóa sự tập trung (Zero-Distraction Player)**: Thanh điều hướng trên cùng tối giản (Nút Thoát, Thanh tiến độ mượt mà, Bộ đếm `tabular-nums`, Nút bật/tắt Đoán trước).
   - **Thẻ câu hỏi & Công thức KaTeX**: Cỡ chữ thoải mái, khoảng cách dòng thoáng (`line-height: 1.6`). Công thức Toán/Lý/Hóa KaTeX tự động co giãn hoặc chuyển layout 2x2 $\rightarrow$ 1 cột mượt mà, **tuyệt đối không có thanh cuộn ngang** và **không bao giờ có scroll lồng nhau (nested scrollbars)**.
   - **Flashcard 3D**: Chạm trực tiếp vào thẻ để lật với đường cong vật lý tự nhiên (`cubic-bezier(0.22, 1, 0.36, 1)`), 4 nút đánh giá SM-2 (`Chưa thuộc`, `Khó nhớ`, `Nhớ tốt`, `Rất dễ`) hiển thị kèm thời gian lặp lại dự kiến (`< 10p`, `1 ngày`, `3 ngày`, `6 ngày`) ngay bên dưới.
4. **Ngân hàng câu hỏi & Công cụ Nhập liệu (Question Bank, AI Paste & LMS Moodle)**:
   - Thanh công cụ lọc (Filter Bar) tinh gọn trên 1 hàng ở Desktop và thu gọn thông minh trên Mobile.
   - Màn hình **Nhập từ LMS (Moodle)** và **Dán AI**: Giao diện 2 bước hoặc Split-pane trực quan (Bên trái: Dán văn bản thô & Gán đáp án hàng loạt; Bên phải/Bên dưới: Danh sách thẻ Preview cho phép sửa trực tiếp inline).

### 3.3. Hệ thống Chuyển động & Micro-interactions (Emil Kowalski & Motion Design)
- Tuân thủ tuyệt đối nguyên tắc hiệu năng cao: **Chỉ animate `transform` và `opacity`**.
- Phản hồi xúc giác tức thì: Nút bấm thu nhỏ nhẹ khi nhấn (`transform: scale(0.97)` trong `80ms`), danh sách thẻ xuất hiện mượt mà, chuyển tab không dùng màn chắn tím rườm rà (`#tab-wave-curtain`) mà thay bằng chuyển cảnh Fade + Slide siêu tốc (`160ms cubic-bezier(0.16, 1, 0.3, 1)`).
- Tôn trọng hoàn toàn `prefers-reduced-motion: reduce`.

## PHẦN 4: TỐI ƯU HÓA KIẾN TRÚC CODE & HIỆU NĂNG TOÀN DIỆN

Sử dụng **`improve-codebase-architecture`** và **`codebase-design`** từ bộ skill của Matt Pocock để tái cấu trúc code nhưng **bảo toàn 100% dữ liệu người dùng và tính năng hiện có**:

1. **Mô-đun hóa CSS (Xóa sổ `!important` spaghetti)**:
   - Tách `css/style.css` (2.350+ dòng) thành kiến trúc CSS sạch, phân tách rõ ràng:
     - `css/theme.css`: Chứa toàn bộ Design Tokens (màu sắc, thang chữ `clamp()`, khoảng cách, bo góc, bóng đổ, easing).
     - `css/style.css` (hoặc chia thành các phần có cấu trúc rõ ràng trong `css/`): Reset, Layout Shell (Sidebar Desktop / Bottom Nav Mobile), Components dùng chung (Button, Card, Unified Dropdown, Modal, Input, Badge, Toast), và View-specific styles.
   - **Mục tiêu kỹ thuật**: Giảm số lượng `!important` từ >480 xuống **dưới 10** (chỉ dùng cho utility ẩn/hiện `[hidden]` hoặc `prefers-reduced-motion`). Xóa sạch inline styles trong `index.html`.
2. **Tái cấu trúc JavaScript & Xóa bỏ 18 hàm Dropdown lặp lại**:
   - Xây dựng **1 bộ điều khiển Dropdown dùng chung duy nhất (`UnifiedDropdown`)** bằng Event Delegation (`data-dropdown`, `data-action`), tự động xử lý đóng/mở, định vị chống tràn mép màn hình (drop-up/drop-down) và điều hướng bàn phím (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`). Xóa bỏ 18 hàm `toggle...Dropdown` rời rạc trong `js/app.js`.
   - Loại bỏ các đoạn nối chuỗi HTML dài kèm `style="..."` trong `js/app.js`, thay bằng các hàm render component sạch sẽ, dùng class CSS chuẩn.
3. **Đồng bộ hóa Web Worker, Parser & File trùng lặp**:
   - Trong `js/worker.js`, sử dụng `importScripts('./parser.js', './srs.js')` làm nguồn chân lý duy nhất thay vì copy-paste lại hàm `cleanRawText`, `parseLmsQuestions` và `calculateSRS`.
   - Chuyển `App.processImport()` (AI JSON/Text parse) sang gọi bất đồng bộ qua `callWorker('PARSE_AI_JSON')` để không bao giờ gây đơ luồng chính (Main Thread) khi dán bộ đề lớn.
   - Hợp nhất `quotes.js` và `js/quotes.js` (giữ nguyên 100% mảng `QUOTES` của người dùng, không sửa nội dung câu quote) và cập nhật `sw.js` cho khớp.
4. **Cập nhật bộ Test (`tests/`)**:
   - Kiểm tra thư mục `tests/`. Nếu có các bài test cũ kiểm tra chuỗi CSS cứng lỗi thời (như kiểm tra mã màu tím cũ hoặc comment giả trong `style.css`), hãy cập nhật các bài test đó để kiểm tra **hành vi thực tế, cấu trúc DOM chuẩn, thuật toán SM-2, LMS/AI Parser và IndexedDB** thay vì ép giữ lại rác CSS cũ.

## PHẦN 5: QUẢN LÝ TIẾN ĐỘ (`PROGRESS.md`) & ĐIỀU PHỐI ĐA AGENT (MULTI-AGENT ORCHESTRATION)

### 5.1. Yêu cầu bắt buộc về file `PROGRESS.md`
Ngay khi bắt đầu, Agent điều phối (Orchestrator) **phải tạo ngay file `PROGRESS.md` tại thư mục gốc của dự án** theo cấu trúc sau và yêu cầu mọi Agent cập nhật liên tục sau mỗi task:

```markdown
# TIẾN ĐỘ TỐI ƯU HÓA & REDESIGN DỰ ÁN (PROGRESS TRACKER)

- **Trạng thái tổng thể**: Đang thực thi (In Progress)
- **Cập nhật lần cuối**: [Timestamp]

## 1. Bảng điều phối Các Giai đoạn & Agent
| Phase / Agent | Nhiệm vụ chính | Nhánh / Phạm vi File | Trạng thái | Ghi chú / Kết quả |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0: Architect** | Cài đặt Skills, xóa rào cản thiết kế cũ, dựng Design System (`theme.css`), gom Dropdown & Worker | `css/theme.css`, `js/worker.js`, `PRODUCT.md`, `DESIGN.md` | `[ ]` | |
| **Agent A: Shell & Library** | Redesign Sidebar, Topbar, Bottom Nav, Dashboard, Thư viện Môn học & Bộ thẻ | `index.html` (Shell/Dashboard/Decks), phần CSS & JS tương ứng | `[ ]` | |
| **Agent B: Study & Exam** | Redesign Quiz Player, Flashcard 3D, Active Recall, Exam Mode, Màn kết quả, KaTeX | `index.html` (Study/Exam/Result), phần CSS & JS tương ứng | `[ ]` | |
| **Agent C: Bank & Tools** | Redesign Ngân hàng câu hỏi, Nhập AI, Nhập LMS, Thống kê Heatmap, Cài đặt | `index.html` (Bank/Import/Stats/Settings), phần CSS & JS tương ứng | `[ ]` | |
| **Phase 2: QA & Polish** | Hợp nhất, chạy `/impeccable audit`, kiểm tra Mobile/Desktop, chạy `npm test` & `npm run build` | Toàn bộ dự án | `[ ]` | |

## 2. Nhật ký thực thi chi tiết (Execution Log)
- [ ] Bước 0.1: Cài đặt và xác nhận bộ Skills (`impeccable`, `taste-skill`, `mattpocock/skills`, `emilkowalski/skill`, `motion-design-skill`)
- [ ] Bước 0.2: Xóa `DESIGN-RULES.md`, xóa `md/prompt-redesign-*.md`, cập nhật `PRODUCT.md` và khởi tạo `DESIGN.md` mới
- [ ] Bước 0.3: Thiết kế lại `css/theme.css` (Design Tokens mới, dọn sạch `css/fonts.css`)
- [ ] Bước 0.4: Đồng bộ `js/worker.js` với `js/parser.js` & `js/srs.js`, tạo `UnifiedDropdown`
- [ ] Bước 1.A: Hoàn thiện UI/UX nhánh Agent A (Shell, Dashboard, Decks, Subjects)
- [ ] Bước 1.B: Hoàn thiện UI/UX nhánh Agent B (Quiz, Flashcard 3D, Exam, Result Modal)
- [ ] Bước 1.C: Hoàn thiện UI/UX nhánh Agent C (Question Bank, AI/LMS Import, Stats, Settings)
- [ ] Bước 2.1: Chạy `/impeccable audit`, `/impeccable polish` và kiểm tra trình duyệt thực tế (Desktop, iPhone SE, iPhone 16)
- [ ] Bước 2.2: Chạy `npm test` & `npm run build`, đảm bảo 0 lỗi Console và 100% tính năng hoạt động hoàn hảo
```

### 5.2. Quy trình thực thi Đa Agent (Multi-Agent Execution Flow)

Nếu môi trường của bạn hỗ trợ **Sub-agents song song** (như Claude Code Task/Subagents, `/implement-spec` của Matt Pocock, hoặc nhiều phiên làm việc trên Git worktree/branch), hãy chạy theo đúng 3 pha dưới đây. Nếu chạy đơn luồng, hãy thực thi tuần tự từng vai trò nhưng **tuyệt đối không bỏ bước**:

#### GIAI ĐOẠN 0 — FOUNDATION & ARCHITECTURE AGENT (Chạy độc lập đầu tiên)
1. Chạy các lệnh cài đặt skill ở Phần 1.
2. Xóa `DESIGN-RULES.md` và toàn bộ `md/prompt-redesign-*.md`. Chạy `/impeccable init` để làm sạch `PRODUCT.md` và tạo `DESIGN.md` mới mang phong cách **Editorial Study / Tactile Knowledge Workspace**.
3. Xây dựng lại toàn bộ `css/theme.css` và `css/fonts.css`:
   - Thiết lập hệ thống biến màu mới, thang chữ `clamp()`, khoảng cách, bo góc, bóng đổ tinh tế và đường cong chuyển động chuẩn `emilkowalski/skill`.
4. Xây dựng khung `css/style.css` nền tảng: Reset, Layout Shell, hệ thống Component chuẩn (`btn`, `card`, `badge`, `unified-dropdown`, `modal`, `input`, `toast`, `empty-state`) **không dùng `!important`**.
5. Tối ưu hóa `js/worker.js` (dùng chung `parser.js` và `srs.js`) và viết bộ xử lý `UnifiedDropdown` trong `js/app.js` để thay thế 18 hàm dropdown trùng lặp.
6. Cập nhật `PROGRESS.md` (đánh dấu xong Phase 0) và commit mốc nền tảng trước khi gọi 3 Agent song song.

#### GIAI ĐOẠN 1 — 3 AGENT CHUYÊN BIỆT CHẠY SONG SONG (A, B, C)
> **Quy tắc phân quyền chống xung đột (Zero-Conflict Rule)**: Mỗi Agent chỉ chỉnh sửa các section HTML, vùng hàm JS và vùng class CSS thuộc phạm vi của mình. Không tự ý sửa `css/theme.css` đã khóa ở Phase 0.

- **AGENT A — Navigation Shell, Dashboard & Thư viện Môn học (`view-dashboard`, `view-decks`, Modals Môn học)**:
  - Thiết kế lại Sidebar Desktop (thu gọn mượt mà không cần tháo gỡ node DOM thủ công gây giật), Topbar tinh gọn, và Bottom Navigation trên Mobile.
  - Làm mới hoàn toàn `view-dashboard`: Xóa các khối DOM ẩn dư thừa (`dashboard-bento-metrics`, `dashboard-battery-container`), thiết kế Hero Quote sắc sảo, thanh chỉ số `tabular-nums`, và khu vực 7 Chế độ ôn tập phân cấp rõ ràng.
  - Làm mới `view-decks` và các Modal Quản lý Môn học / Gán lại môn hàng loạt: Giao diện danh sách Môn học $\rightarrow$ Bộ thẻ thanh lịch, rõ ràng, thao tác 1 chạm mượt mà.
  - Cập nhật `PROGRESS.md` mục `Bước 1.A`.

- **AGENT B — Trải nghiệm Học tập: Quiz, Flashcard 3D, Phòng thi & Kết quả (`view-study`, `view-exam`, `modal-session-complete`, `modal-exam-setup`, `modal-topic-picker`, `modal-sprint-setup`)**:
  - Thiết kế lại `view-study` và `view-exam`: Khung làm bài tập trung cao độ, xóa sạch các đoạn CSS chồng chéo `body.quiz-active` đầy `!important`.
  - Đảm bảo lưới đáp án 2x2 trên Desktop và 1 cột trên Mobile tự động co giãn khi gặp công thức KaTeX dài mà không bao giờ sinh thanh cuộn ngang hay scroll lồng nhau.
  - Thiết kế lại Flashcard 3D (`#study-flashcard-area`): Lật thẻ 3D mượt mà với vật lý lò xo, 4 nút đánh giá SM-2 bố cục cân đối ngay dưới thẻ.
  - Thiết kế lại `modal-session-complete`: Thay thế thanh pin 8-bit lòe loẹt cũ bằng biểu đồ kết quả & hiệu ứng hoàn thành tinh tế, sang trọng.
  - Cập nhật `PROGRESS.md` mục `Bước 1.B`.

- **AGENT C — Ngân hàng câu hỏi, Công cụ Nhập AI/LMS, Thống kê & Cài đặt (`view-bank`, `view-import`, `view-import-lms`, `view-stats`, `view-settings`, `modal-edit-card`)**:
  - Thiết kế lại `view-bank`: Thanh lọc (Filter Bar) gọn gàng sử dụng `UnifiedDropdown`, danh sách thẻ câu hỏi sử dụng `content-visibility: auto` cho tốc độ cuộn 120fps, hiển thị rõ trạng thái đến hạn SRS và đáp án đúng.
  - Thiết kế lại `view-import` (Dán AI) và `view-import-lms` (Nhập từ LMS Moodle): Bố cục nhập liệu và kiểm duyệt câu hỏi trực quan, rõ ràng trên cả Desktop và Mobile.
  - Thiết kế lại `view-stats` (Biểu đồ Heatmap đóng góp 365 ngày, Bảng hiệu suất theo Môn học & Chủ đề) và `view-settings` (Chọn hình nền, Âm thanh, Sao lưu/Khôi phục JSON).
  - Cập nhật `PROGRESS.md` mục `Bước 1.C`.

#### GIAI ĐOẠN 2 — HỢP NHẤT, KIỂM ĐỊNH THẨM MỸ & QA (Chạy sau khi A, B, C hoàn tất)
1. Hợp nhất toàn bộ thay đổi từ Agent A, B, C. Kiểm tra tính đồng nhất của mọi nút bấm, thẻ, dropdown, modal, icon SVG và chuyển động trên toàn ứng dụng.
2. Chạy lệnh kiểm định tự động:
   - `/impeccable audit` và `/impeccable polish` để quét và xử lý triệt để mọi lỗi tương phản màu, tràn chữ, lệch lề hoặc dấu hiệu AI slop.
   - Chạy kiểm tra trình duyệt thực tế (theo quy trình của `design-taste-frontend` / Playwright / Puppeteer nếu có) trên 4 kích thước: **Desktop (1440x900)**, **iPhone SE (375x667)**, **iPhone 16 (393x852)**, và **Mobile Landscape (844x390)**.
   - Chạy `/code-review` của `mattpocock/skills` để rà soát chất lượng code và kiến trúc.
3. Kiểm tra và cập nhật bộ test trong `tests/`, chạy `npm test` và `npm run build` đảm bảo **PASS 100%**, không có bất kỳ lỗi Console nào, Service Worker (`sw.js`) hoạt động chuẩn Offline-first.
4. Cập nhật `PROGRESS.md` sang trạng thái **Hoàn tất (100% Completed)** kèm bảng tổng kết các cải tiến về Thiết kế, Kiến trúc và Hiệu năng.

## PHẦN 6: RÀNG BUỘC BẢO TOÀN DỮ LIỆU & TÍNH NĂNG (KHÔNG ĐƯỢC VI PHẠM)

1. **Bảo toàn 100% dữ liệu IndexedDB (`MindSparksQuizDB` v2)**: Không làm mất hay hỏng bất kỳ bảng dữ liệu nào (`subjects`, `decks`, `cards`, `logs`, `meta`), giữ nguyên cơ chế tự động sao lưu và khôi phục JSON.
2. **Bảo toàn 100% logic cốt lõi**:
   - Thuật toán lặp lại ngắt quãng SM-2 (`js/srs.js`).
   - Bộ phân tích cú pháp AI JSON/Markdown và Moodle LMS (`js/parser.js`), bao gồm cả tính năng gán đáp án hàng loạt (`applyBatchAnswers`) và câu hỏi điền số (`type: 'numeric'`).
   - Đủ 7 chế độ học tập, tính năng Bookmark, Gắn cờ câu hỏi lỗi và xuất Prompt nhờ AI viết lại câu gắn cờ.
   - Không sửa đổi nội dung các câu trích dẫn trong `quotes.js`.

**BẮT ĐẦU NGAY BÂY GIỜ:** Hãy khởi tạo file `PROGRESS.md` và tiến hành thực thi từ **Phần 1 & Giai đoạn 0**!
