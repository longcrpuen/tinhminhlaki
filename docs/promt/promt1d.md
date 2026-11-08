# PROMPT 1D: HOÀN THIỆN TOÀN DIỆN UI/UX TINHMINHLAKEY — XÓA TOPBAR THỪA, HỆ THỐNG ICON ĐƠN SẮC, SIDEBAR KÍNH MỜ CHUẨN MẪU, LẬT THẺ 120FPS, AI PROMPT THEO CHƯƠNG, ĐỒNG BỘ 3 THEME (LIQUID GLASS TRẮNG CAM / TRẮNG ĐEN / TÍM HỒNG) & TỐI ƯU MOBILE

> **ĐƯỜNG DẪN LƯU FILE TRONG DỰ ÁN**: `docs/promt/promt1d.md`
> **PHIÊN BẢN**: `1d` (Bản tinh chỉnh sâu & hoàn thiện toàn diện sau `1c`)
> **FILE THEO DÕI TIẾN ĐỘ**: `docs/handoff/PROGRESS-1D.md`
> **MỤC TIÊU CỐT LÕI**: Giải quyết triệt để toàn bộ **24 điểm tồn đọng** được chia làm 5 nhóm (Chung, Mode Tím Hồng, Mode Trắng Đen, Mode Trắng Cam Liquid Glass, và Mobile) trên ứng dụng **TinhMinhLaKey**, đảm bảo độ mượt 120FPS, không sót bất kỳ màu tím/chữ chìm nào khi chuyển mode, bảo toàn 100% dữ liệu IndexedDB và vượt qua toàn bộ bài test (`npm test`, `npm run build`).

## BƯỚC 0: SAO LƯU GIT TRƯỚC KHI THỰC THI

```bash
git status
git add -A
git commit -m "backup: state after prompt 1c before 1d comprehensive polish"
git branch backup-before-1d
```

## PHẦN 1: KÍCH HOẠT BỘ SKILLS TRONG ĐỢT `1D`

AI Agent **BẮT BUỘC** kích hoạt và áp dụng quy trình từ các bộ Skills đã cài đặt:

```bash
sh .agent/skills/impeccable/scripts/impeccable context || npx impeccable context
# Phối hợp:
# - impeccable: distill, colorize, typeset, animate, optimize, harden, polish, audit
# - ui-ux-pro-max-skill & design-taste-frontend: Liquid Glass UI, Monochrome Icon System, Mobile Ergonomics
# - superpowers: systematic-debugging, verification-before-completion
```

## PHẦN 2: ĐẶC TẢ KỸ THUẬT CHI TIẾT 5 NHÓM YÊU CẦU (24 HẠNG MỤC)

---

### NHÓM 1: CÁC THAY ĐỔI CHUNG TRÊN TOÀN BỘ ỨNG DỤNG (13 HẠNG MỤC)

#### 1.1. Bỏ khung thanh Topbar (`.app-topbar`), chỉ giữ cụm Icon nổi góc trên phải
- **Hiện trạng**: Thanh `.app-topbar` đang là một dải băng tối màu cắt ngang đỉnh màn hình, khi đổi sang mode Trắng Cam hay Trắng Đen thì thanh này không khớp màu nền và nhìn rất lệch lạc.
- **Cách sửa trong `index.html` và `css/style.css`**:
  - Ẩn hoàn toàn khối `.topbar-left` (chứa avatar mèo và chữ `"Ôn Tập Cá Nhân"` bị lặp với Sidebar): `.topbar-left { display: none !important; }`.
  - Xóa bỏ khung nền, viền và chiều cao choán chỗ của `.app-topbar`:
    ```css
    .app-topbar {
      position: fixed !important;
      top: 16px !important;
      right: 24px !important;
      left: auto !important;
      width: auto !important;
      height: auto !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      z-index: 900 !important;
      pointer-events: none !important;
    }
    .topbar-right {
      pointer-events: auto !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    }
    ```
  - Nhờ đó, phần nội dung trang (`.content-wrapper`) được đẩy sát lên trên thoáng đãng, không còn thanh ngang chắn tầm nhìn, trong khi các icon ở góc trên phải vẫn nổi gọn gàng.

#### 1.2. Thu gọn chọn Mode màu về 1 cụm Icon duy nhất + trong Setting, và XÓA HẲN nút `↻ Đổi cảm hứng`
- **Hiện trạng**: Bộ chọn 3 mode màu (`Tím Hồng | Trắng Đen | Trắng Cam`) đang xuất hiện tới 2 lần trên cùng 1 màn hình (1 trên Topbar, 1 trong khung Hero Quote), kèm nút `↻ Đổi cảm hứng` dư thừa.
- **Cách sửa**:
  - **Xóa hoàn toàn** cụm chọn theme thứ 2 và nút `↻ Đổi cảm hứng` bên trong `.hero-card` / `.editorial-hero-stage`.
  - Tại `.topbar-right` (góc trên phải màn hình), biến bộ chọn 3 chế độ màu thành **1 cụm 3 Nút Icon Đơn Sắc nhỏ gọn (`34px × 34px`)** nằm trong viên nang kính mờ (`.theme-icon-switcher`), mỗi nút chỉ hiển thị **1 SVG Icon tinh tế** (có `title` tooltip khi di chuột):
    1. `violet-rose`: SVG Icon Mặt trăng khuyết & Sao (`title="Chế độ Tím Hồng"`)
    2. `monochrome`: SVG Icon Vòng tròn tương phản Trắng Đen `◐` (`title="Chế độ Trắng Đen"`)
    3. `white-orange`: SVG Icon Mặt trời tỏa sáng `☀` (`title="Chế độ Trắng Cam Liquid Glass"`)
  - Trong trang **Cài Đặt (`#view-settings`)**, vẫn giữ khu vực chọn nhanh 3 chế độ Theme rõ ràng.

#### 1.3. Xóa bỏ hoàn toàn 2 dòng tag `MINDSPARKS / SM-2 ACTIVE / OFFLINE PWA` trên khung Quote
- **Hiện trạng**: Phía trên câu Quote đang có tới 2 dòng chữ nhỏ: `[ MINDSPARKS ] • [ ACTIVE RECALL ] • [ SM-2 ]` và hàng badge `SYSTEM // SM-2 ACTIVE` + `OFFLINE PWA`.
- **Cách sửa**: Xóa (hoặc `display: none !important`) toàn bộ 2 hàng nhãn này trong `#view-dashboard` để khung Quote mở đầu hoàn toàn sạch sẽ, tập trung 100% vào câu nói truyền cảm hứng.

#### 1.4. Đổi toàn bộ tên `MindSparks` sang `TinhMinhLaKey` trên toàn dự án
- Quét toàn bộ mã nguồn (`index.html`, `js/app.js`, `js/parser.js`, `js/db.js`, `css/theme.css`, `css/fonts.css`, `css/style.css`, `PRODUCT.md`, `DESIGN.md`, `manifest.json`, `package.json`) và đổi mọi chuỗi hiển thị, tiêu đề, mô tả, comment, tên file xuất backup (`tinhminhlakey-backup-${dateStr}.json`) từ `MindSparks` / `MINDSPARKS` sang **`TinhMinhLaKey`**.
- **Quy tắc bảo toàn dữ liệu bắt buộc**: Trong `js/db.js`, giữ nguyên tên kết nối IndexedDB nội bộ `const DB_NAME = 'MindSparksQuizDB';` để toàn bộ dữ liệu câu hỏi hiện có của người dùng không bị mất, và trong `importAll()` hỗ trợ đọc cả file backup có `appName: 'TinhMinhLaKey'` lẫn `'MindSparks'`.

#### 1.5. Xây dựng Tổ Hợp Icon & Emoji Đơn Sắc (Monochrome Icon System) Trên Toàn App
- **Hiện trạng**: Các emoji nhiều màu của hệ điều hành (`📚`, `⚡`, `🎯`, `✨`, `🔥`, `⏰`, `🏆`, `🚩`, `⭐`, `✏️`, `🗑️`, `🔄`, `📁`, `🏷️`, `💡`, `🟢`, `🟡`, `🔴`) xuất hiện khắp nơi, gây lệch tông nghiêm trọng khi chuyển sang mode Trắng Đen hoặc Trắng Cam.
- **Cách sửa**:
  1. Tạo bộ helper **`App.icons` (Inline SVG Monochrome dùng `stroke="currentColor"` / `fill="currentColor"`)** hoặc dùng ký tự/SVG đơn sắc cho toàn bộ nút bấm, nhãn thống kê, badge độ khó, nguồn câu hỏi, nút hành động trên thẻ (Lưu sao, Gắn cờ, Sửa, Xóa, Reset, Lật thẻ, Thi thử, Thêm câu, Giải thích).
  2. Đối với mọi nơi còn hiển thị biểu tượng môn học (Subject Emoji do người dùng chọn như `📚`, `🥀`, `📐`, `💻`...) hoặc các icon trong `.cyber-dropdown-icon`, bọc trong class `.mono-emoji` và áp dụng bộ lọc màu tự động theo từng Theme trong `css/style.css`:
     ```css
     /* Biến mọi emoji thành đơn sắc hòa quyện 100% với từng chế độ Theme */
     .mono-emoji,
     .cyber-dropdown-icon,
     .subject-icon,
     .deck-subject-icon,
     .stat-icon-wrap,
     .flame-icon {
       filter: var(--emoji-mono-filter, grayscale(100%) contrast(1.15));
       display: inline-flex;
       align-items: center;
       justify-content: center;
     }
     [data-theme="monochrome"] .mono-emoji,
     [data-theme="monochrome"] .cyber-dropdown-icon,
     [data-theme="monochrome"] .subject-icon,
     [data-theme="monochrome"] .deck-subject-icon,
     [data-theme="monochrome"] .stat-icon-wrap,
     [data-theme="monochrome"] .flame-icon,
     [data-theme="monochrome"] .emoji-preset-btn {
       filter: grayscale(100%) contrast(1.25) brightness(1.1) !important;
     }
     [data-theme="white-orange"] .mono-emoji,
     [data-theme="white-orange"] .cyber-dropdown-icon,
     [data-theme="white-orange"] .subject-icon,
     [data-theme="white-orange"] .deck-subject-icon,
     [data-theme="white-orange"] .stat-icon-wrap,
     [data-theme="white-orange"] .flame-icon {
       filter: grayscale(100%) sepia(85%) hue-rotate(345deg) saturate(320%) contrast(1.05) !important;
     }
     [data-theme="violet-rose"] .mono-emoji,
     [data-theme="violet-rose"] .cyber-dropdown-icon,
     [data-theme="violet-rose"] .subject-icon,
     [data-theme="violet-rose"] .deck-subject-icon,
     [data-theme="violet-rose"] .stat-icon-wrap,
     [data-theme="violet-rose"] .flame-icon {
       filter: grayscale(100%) sepia(60%) hue-rotate(245deg) saturate(260%) brightness(1.08) !important;
     }
     ```
  3. Thay toàn bộ emoji cứng trên các nút (`.hero-actions`, `.deck-actions`, `.bank-card-header`, `.study-mode-icon`, `.stat-icon-wrap`) bằng **SVG đường nét đơn sắc (`stroke="currentColor"`)** sắc nét, tinh tế.

#### 1.6. Điều chỉnh Harness Khung Tạo Câu Hỏi AI (`js/parser.js` & `js/app.js`): Phân loại theo CHƯƠNG thay vì Chủ đề vụn vặt
- **Hiện trạng**: Khi dùng Prompt AI hiện tại, mỗi câu hỏi AI lại tự sáng tác ra một `"topic"` riêng lẻ, khiến danh sách lọc Chương/Chủ đề bị loạn và vô nghĩa khi tìm kiếm.
- **Cách sửa trong `js/parser.js` (`generateAIPromptTemplate`), `js/app.js` (`pasteSampleData`, `copyFlaggedAIPrompt`) và `index.html`**:
  - Cập nhật nội dung `generateAIPromptTemplate` trong `js/parser.js`:
    ```javascript
    generateAIPromptTemplate({ topic = '', count = 10, difficulty = 'medium' } = {}) {
      return `Hãy đóng vai một chuyên gia giáo dục và biên soạn ${count} câu hỏi trắc nghiệm ôn tập từ tài liệu/nội dung: "${topic || '[DÁN NỘI DUNG / TÀI LIỆU HỌC TẬP TẠI ĐÂY]'}".

    Yêu cầu định dạng:
    1. Trả về DUY NHẤT một khối mã JSON hợp lệ (không kèm bất kỳ lời chào hay giải thích ngoài khối mã JSON).
    2. Hỗ trợ công thức Toán/Lý/Hóa LaTeX trong mọi trường text: dùng $...$ cho inline math và $$...$$ cho block math (ví dụ: $f(x) = x^2$, $\frac{d}{dx}x^n = nx^{n-1}$).
    3. QUY TẮC PHÂN LOẠI CHƯƠNG (BẮT BUỘC CHO TRƯỜNG "topic"):
       - Trường "topic" của mỗi câu hỏi BẮT BUỘC phải ghi tên CHƯƠNG LỚN mà câu hỏi đó trực thuộc (ví dụ: "Chương 1: Tổng quan", "Chương 2: Đạo hàm và Vi phân").
       - TUYỆT ĐỐI KHÔNG tự đặt một chủ đề vụn vặt riêng cho từng câu hỏi! Các câu hỏi trong cùng một chương phải dùng CHÍNH XÁC CÙNG MỘT TÊN CHƯƠNG thống nhất để phục vụ gom nhóm và lọc câu hỏi theo chương.
    4. Tuân thủ chính xác 100% cấu trúc JSON chuẩn TinhMinhLaKey bên dưới:

    \`\`\`json
    {
      "quiz_title": "${topic || 'Chương 1: Đạo hàm và Ứng dụng'}",
      "questions": [
        {
          "id": "q1",
          "topic": "${topic || 'Chương 1: Đạo hàm và Ứng dụng'}",
          "difficulty": "${difficulty}",
          "question": "Đạo hàm của $f(x) = x^2$ là gì?",
          "options": [
            { "id": "a", "text": "$2x$" },
            { "id": "b", "text": "$x^2$" },
            { "id": "c", "text": "$2$" },
            { "id": "d", "text": "$x$" }
          ],
          "correct_option_id": "a",
          "explanation": "Áp dụng quy tắc đạo hàm lũy thừa: $\\frac{d}{dx}x^n = nx^{n-1}$"
        }
      ]
    }
    \`\`\`

    Quy tắc bắt buộc:
    - "topic" chỉ ghi theo cấp độ Chương (VD: "Chương 1: ...", "Chương 2: ..."), đồng nhất giữa các câu cùng chương.
    - "options" phải có ít nhất 2 lựa chọn (khuyến nghị 4 lựa chọn có id từ "a" đến "d").
    - "correct_option_id" BẮT BUỘC phải khớp với một trong các "id" trong "options".
    - "difficulty" nhận một trong ba giá trị: "easy", "medium", hoặc "hard".`;
    }
    ```

#### 1.7, 1.8 & 1.9. Bỏ nút mũi tên Sidebar, Bấm vào Con Mèo để Đóng/Mở mượt 2 chiều, và Thiết kế lại Sidebar chuẩn Ảnh 3 (`image_d3c413.png`)
1. **Bỏ nút mũi tên `#btn-sidebar-toggle`, bấm vào Icon Con Mèo (`meo.png`) để đóng/mở**:
   - Trong `css/style.css`, ẩn nút `#btn-sidebar-toggle` (`display: none !important;` — vẫn giữ thẻ trong `index.html` để không gãy test).
   - Trong `index.html`, gắn `onclick="App.toggleSidebar()"` và `title="Bấm để mở rộng / thu gọn thanh điều hướng"` vào `.brand-header` / `.brand-info`.
   - Bọc `.brand-icon` (`meo.png`) trong một vòng tròn kính nổi `46px × 46px` (`cursor: pointer; transition: transform 0.2s ease;`), khi hover phóng nhẹ `scale(1.06)`.
2. **Sửa hiệu ứng đóng/mở Sidebar mượt mà, đồng nhất cả 2 chiều mở ra và đóng vào**:
   - **Nguyên nhân gây lệch nhịp**: Hiện tại khi đóng thì đợi `280ms` mới gọi `_detachSidebarLabels()`, còn khi mở thì gọi `_attachSidebarLabels()` ngay lập tức làm chữ bị ép dẹp trong lúc Sidebar đang giãn rộng.
   - **Giải pháp**:
     - Giữ các phần tử `.nav-item button` có cấu trúc Flexbox cố định vị trí icon ở đầu (`padding: 0; display: flex; align-items: center; overflow: hidden; white-space: nowrap;`).
     - Đặt icon SVG bên trong một khung vuông cố định `44px × 44px` (`flex: 0 0 44px; display: inline-flex; align-items: center; justify-content: center;`).
     - Dùng cùng một đường cong chuyển động `transition: width 260ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 260ms cubic-bezier(0.22, 1, 0.36, 1), padding 260ms cubic-bezier(0.22, 1, 0.36, 1)` trên `.app-sidebar` và `transition: margin-left 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1)` trên `.app-main`.
     - Phần nhãn `.nav-label` và `.brand-title` chuyển động bằng `opacity` + `transform: translateX(...)` mượt mà trong đúng `220ms` ở cả hai chiều đóng và mở!
3. **Thiết kế Sidebar chuẩn 100% theo Ảnh 3 (`image_d3c413.png`)**:
   - **Bề mặt Sidebar**: Kính mờ xuyên thấu (`background: var(--sidebar-glass-bg); backdrop-filter: blur(24px) saturate(150%); -webkit-backdrop-filter: blur(24px) saturate(150%); border: 1px solid var(--sidebar-glass-border); box-shadow: var(--sidebar-glass-shadow);`).
   - **Khi thu gọn (`.app-sidebar.collapsed` — Cột trái Ảnh 3)**:
     - Thanh thuốc nang dọc rộng `70px`, mỗi nút `.nav-item button` là một **vòng tròn kính mờ độc lập `44px × 44px`** (`border-radius: 50%; background: var(--sidebar-item-bg); border: 1px solid var(--sidebar-item-border);`).
     - Mục đang chọn (`.nav-item.active button`) biến thành **Vòng Tròn Đặc Tương Phản Cao** (`background: var(--sidebar-active-bg) !important; color: var(--sidebar-active-text) !important; box-shadow: 0 4px 16px var(--sidebar-active-glow);`).
     - Badge số câu đến hạn (`.due-count-badge`) gắn gọn ở góc trên phải của vòng tròn (`position: absolute; top: -3px; right: -3px; min-width: 18px; height: 18px; padding: 0 5px; font-size: 0.65rem; border-radius: 999px;`), tuyệt đối không đè lên biểu tượng ngôi nhà như ở Ảnh 2!
   - **Khi mở rộng (`.app-sidebar:not(.collapsed)` — Cột phải Ảnh 3)**:
     - Khung kính bo tròn `28px`, rộng `248px`.
     - Mỗi mục chưa chọn là một viên nang kính mờ (`height: 44px; border-radius: 999px; background: var(--sidebar-item-bg); border: 1px solid var(--sidebar-item-border); padding: 0 16px 0 0;`).
     - Mục đang chọn (`.nav-item.active button`) là một **Viên Nang Đặc Tương Phản Cao** (`background: var(--sidebar-active-bg) !important; color: var(--sidebar-active-text) !important; font-weight: 700; box-shadow: 0 6px 20px var(--sidebar-active-glow);`) nối liền mạch và nổi bật rõ rệt như mục `"Reduce"` trong Ảnh 3!

#### 1.10. Tối ưu Tab Thư Viện Thẻ (`#view-decks`): Thêm Thanh Chuyển Nhanh Đến Folder Môn Học (Quick-Jump Subject Navigator)
- **Hiện trạng**: Khi người dùng có nhiều môn học trong `#view-decks`, muốn tìm một môn ở dưới phải cuộn trang rất mỏi tay.
- **Cách sửa trong `index.html` và `js/app.js` (`renderDecks`)**:
  - Ngay đầu trang `#view-decks` (phía trên `#decks-list-container`), tự động render **Thanh Điều Hướng Nhanh Môn Học (`.decks-subject-quickbar`)** gồm:
    - Các nút viên nang (Subject Pills): `[ Tất cả môn (N) ]`, kèm từng môn học `[ Tên môn (số bộ thẻ) ]` và một ô tìm kiếm nhanh bộ thẻ (`🔍 Lọc nhanh môn / bộ thẻ...`).
    - Khi bấm vào một môn học trên thanh Quick-Jump:
      - Tự động lọc chỉ hiển thị đúng Folder Môn Học đó (hoặc mở khóa thu gọn `collapsedSubjectIds.delete(subjectId)` và cuộn mượt ngay tới folder môn đó), bấm lại hoặc bấm `Tất cả môn` sẽ hiện lại toàn bộ!

#### 1.11. Căn chỉnh lại Cụm Nút Hành Động ở Ngân Hàng Câu Hỏi (`#view-bank` - Ảnh 4) và Thư Viện Thẻ
- **Hiện trạng**: Ở Ảnh 4 (`image_d3bc56.jpg`), 3 nút góc trên phải của `#view-bank` (`+ Thêm câu hỏi mới`, `Sao chép Prompt AI viết lại`, `Luyện tập câu trong danh sách`) bị rớt thành 2 hàng lệch nhau rất mất thẩm mỹ.
- **Cách sửa**:
  - Thiết kế lại `.section-title-wrap` trong `#view-bank` và `#view-decks` thành thanh Header hiện đại:
    - Khối tiêu đề bên trái, khối nút hành động (`.bank-header-actions`) bên phải xếp trên **1 hàng ngang duy nhất (`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`)**.
    - Cả 3 nút có cùng chiều cao chuẩn `height: 40px; padding: 0 16px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;`.
    - Sắp xếp thứ tự hợp lý: 2 nút công cụ Tonal (`+ Thêm câu hỏi`, `Sao chép Prompt sửa câu`) đứng trước, nút hành động chính Solid (`Luyện tập danh sách này`) đứng ngoài cùng bên phải.

#### 1.12. Bỏ khung hộp to dài bao quanh nút `Câu tiếp theo` sau khi trả lời Quiz
- **Hiện trạng**: Khi chọn xong đáp án trong Quiz, nút `Câu tiếp theo ➔` bị bọc trong một khung `.quiz-footer-actions.show` to dài có nền, viền và bóng đổ thừa thãi.
- **Cách sửa trong `css/style.css`**:
  - Gỡ bỏ hoàn toàn nền, viền, bóng đổ và padding của `.quiz-footer-actions` và `body.quiz-active .quiz-footer-actions.show` trên cả Desktop và Mobile:
    ```css
    .quiz-footer-actions,
    body.quiz-active .quiz-footer-actions,
    body.quiz-active .quiz-footer-actions.show {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0 !important;
      margin-top: 16px !important;
      display: none;
      justify-content: flex-end !important;
      pointer-events: none !important;
    }
    .quiz-footer-actions.show,
    body.quiz-active .quiz-footer-actions.show {
      display: flex !important;
    }
    .quiz-footer-actions .btn-quiz-next {
      pointer-events: auto !important;
      border-radius: 999px !important;
      padding: 12px 28px !important;
      font-weight: 700 !important;
      box-shadow: var(--shadow-md) !important;
    }
    ```

#### 1.13. Sửa triệt để hiện tượng khựng / giật ở Chế Độ Lật Thẻ (Flashcard) — Mượt hóa cả Lật tại chỗ lẫn Chuyển câu
- **Nguyên nhân**:
  1. Khi bấm lật thẻ (`flipFlashcard`), `#flashcard-srs-bar` đổi từ `display: none` sang `display: grid` làm toàn bộ khung nhảy bố cục (reflow) đúng lúc thẻ đang xoay 3D.
  2. Khi bấm đánh giá để sang câu tiếp theo (`rateFlashcard`), hàm đợi `await db.saveCard()` + `await db.logReview()` xong mới render câu mới, đồng thời gỡ `.flipped` ngay khi thẻ còn đang bật `transition: transform 0.35s`, khiến thẻ vừa xoay ngược vừa vẽ lại công thức KaTeX gây khựng.
- **Cách sửa trong `js/app.js` và `css/style.css`**:
  1. **Không bao giờ dùng `display: none` cho `#flashcard-srs-bar`**:
     - Luôn giữ `#flashcard-srs-bar { display: grid !important; }` cố định trong bố cục để giữ chỗ trước (0px layout shift).
     - Khi chưa lật thẻ, ẩn thanh SRS bằng compositor properties: `opacity: 0; visibility: hidden; transform: translateY(6px); pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease;`.
     - Khi thẻ đã lật (`.card-flipped`), chuyển sang `opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto;`.
  2. **Tối ưu `flipFlashcard()`**:
     - Xóa `Date.now()` throttle cứng nếu gây cảm giác trễ tay, dùng `transform: rotateY(180deg) translateZ(0)` với `transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)` thuần GPU.
  3. **Tối ưu `rateFlashcard(rating)` (Chuyển câu tức thì < 16ms)**:
     - Chạy `Promise.all([db.saveCard(card), db.logReview(...)])` ngầm trong background (không `await` chặn luồng giao diện).
     - Trong `_renderFlashcardContent(card)`:
       - Tạm ngắt transition của `#active-flashcard` (`flashcard.style.transition = 'none'`), gỡ class `flipped`, ép reflow nhẹ `void flashcard.offsetWidth;`, rồi khôi phục `flashcard.style.transition = ''` trước khi điền nội dung câu mới và chạy hiệu ứng trượt mượt mà (`animation: flashcardNextFade 200ms cubic-bezier(0.22, 1, 0.36, 1)`).

---

### NHÓM 2: TINH CHỈNH MODE TÍM HỒNG (`violet-rose` — 2 HẠNG MỤC)

1. **Làm khung Quote (`.hero-card`) trong suốt hơn để thấy rõ hình nền phía sau**:
   - Trong `[data-theme="violet-rose"]`, giảm độ đặc của `--hero-bg` xuống `rgba(20, 15, 36, 0.44)` kết hợp `backdrop-filter: blur(16px) saturate(140%)` và giảm độ tối lớp phủ `#bg-layer::after` xuống `rgba(12, 9, 22, 0.42)` để hình nền phía sau hiện lên trong trẻo, có chiều sâu.
2. **Đổi hình nền mặc định của Mode Tím Hồng thành `./backgrounds/bg-2.webp` (`Background 2`)**:
   - Trong `js/app.js` (hàm `init()` và `setTheme('violet-rose')`), đặt hình nền mặc định của mode `violet-rose` là **`./backgrounds/bg-2.webp`** (thay cho `bg-pixel-meadow.webp`).

---

### NHÓM 3: SỬA TRIỆT ĐỂ MODE TRẮNG ĐEN (`monochrome` — 3 HẠNG MỤC)

1. **Làm thanh Sidebar và các khung thẻ trong suốt xuyên thấu thấy được hình nền (`bg-noir-mono.webp`)**:
   - Trong `[data-theme="monochrome"]`:
     - Đặt `--sidebar-glass-bg: rgba(12, 12, 12, 0.40) !important;` kèm `backdrop-filter: blur(20px) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important;` (không dùng nền đen đặc nuốt mất hình nền nữa).
     - Đặt `--hero-bg: rgba(10, 10, 10, 0.42) !important;`, `--bg-card: rgba(14, 14, 14, 0.56) !important;`, và lớp phủ `#bg-layer::after` thật nhẹ `rgba(0, 0, 0, 0.32)` để bức ảnh nền trắng đen `bg-noir-mono.webp` hiện lên sắc nét xuyên qua cả Sidebar lẫn các thẻ!
2. **Xóa sạch 100% hiệu ứng trỏ chuột ánh tím, bóng tím, viền tím và màu đáp án Quiz còn sót lại**:
   - **Nguyên nhân**: Cuối file `css/style.css` (dòng 6801–6890) và các rule `.quiz-option-letter`, `.topic-badge`, `.subject-badge`, `.cyber-dropdown` đang viết cứng mã màu tím `rgba(192, 132, 252, ...)` và `rgba(167, 139, 250, ...)`.
   - **Cách sửa bắt buộc**:
     - Thay toàn bộ các mã màu tím viết cứng trong `css/style.css` bằng biến động của Theme:
       ```css
       /* Spotlight & Hover theo biến Theme (Tuyệt đối không hardcode màu tím) */
       .deck-card::before,
       .subject-group::before,
       .stat-card::before,
       .quiz-card::before,
       .bank-card-item::before,
       .glass-card::before,
       .study-mode-card::before {
         background: radial-gradient(
           380px circle at var(--mx, 50%) var(--my, 50%),
           var(--spotlight-primary, rgba(255, 255, 255, 0.12)) 0%,
           var(--spotlight-secondary, rgba(255, 255, 255, 0.03)) 45%,
           transparent 75%
         ) !important;
       }

       .deck-card:hover,
       .stat-card:hover,
       .quiz-card:hover,
       .glass-card:hover,
       .bank-card-item:hover,
       .study-mode-card:hover {
         border-color: var(--card-hover-border) !important;
         box-shadow: var(--card-hover-shadow) !important;
       }
       ```
     - Trong `[data-theme="monochrome"]`:
       - `--spotlight-primary: rgba(255, 255, 255, 0.14);`
       - `--spotlight-secondary: rgba(255, 255, 255, 0.04);`
       - `--card-hover-border: rgba(255, 255, 255, 0.55);`
       - `--card-hover-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 10px 28px rgba(0, 0, 0, 0.65);`
       - Toàn bộ `.deck-subject-badge`, `.subject-badge`, `.topic-badge`, `.difficulty-badge`, `.source-badge`: Chuyển về tông Trắng - Xám Bạc - Đen Khói (`background: rgba(255, 255, 255, 0.10) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;`).
       - Trong Quiz & Ngân hàng câu hỏi: `.quiz-option-letter` màu `#ffffff !important`; `.quiz-option-btn:hover` viền `#ffffff !important`; `.quiz-option-btn.correct` nền `rgba(255, 255, 255, 0.18) !important`, viền `2px solid #ffffff !important`, chữ `#ffffff !important`; `.quiz-option-btn.incorrect` nền `rgba(120, 120, 120, 0.16) !important`, viền `1.5px dashed rgba(255, 255, 255, 0.45) !important`, chữ `#a3a3a3 !important`.

---

### NHÓM 4: ĐẠI TU MODE TRẮNG CAM (`white-orange`) THEO PHONG CÁCH "LIQUID GLASS" XUYÊN THẤU & FONT NGHỆ THUẬT CLAUDE UI (5 HẠNG MỤC)

1. **Thiết kế lại Mode Trắng Cam mang đậm chất "Liquid Glass" xuyên thấu, mờ ảo, thanh thoát như 2 ảnh mẫu cuối (`image_d3a5ee.jpg` & `image_d3a5b0.jpg`)**:
   - **Loại bỏ hoàn toàn các mảng màu trắng/kem đặc quánh nặng nề**:
     - Lớp phủ nền `#bg-layer::after` trong `[data-theme="white-orange"]` đặt siêu trong (`background: linear-gradient(180deg, rgba(255, 250, 245, 0.08) 0%, rgba(255, 245, 235, 0.18) 100%) !important;`) để các ô gạch kính cam-trắng của hình nền `bg-white-orange.webp` hiện rõ mồn một phía sau.
     - Mọi bề mặt thẻ (`.hero-card`, `.deck-card`, `.study-mode-card`, `.quiz-card`, `.stat-card`, `.bank-card-item`, `.app-sidebar`, `.modal-box`) dùng hiệu ứng **Thủy Tinh Lỏng 3D (Translucent Frosted Liquid Glass)**:
       ```css
       [data-theme="white-orange"] {
         --bg-base: #f7f3ee;
         --bg-surface: rgba(255, 255, 255, 0.38);
         --bg-surface-elevated: rgba(255, 255, 255, 0.52);
         --bg-card: rgba(255, 255, 255, 0.36);
         --glass-tint: linear-gradient(135deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 246, 238, 0.26) 100%);
         --glass-border: rgba(255, 255, 255, 0.72);
         --glass-highlight: rgba(255, 255, 255, 0.95);
         --text-primary: #181512;
         --text-secondary: #4a433c;
         --text-muted: #786e65;
         --accent: #ea580c;
         --accent-secondary: #f97316;
         --spotlight-primary: rgba(251, 146, 60, 0.22);
         --spotlight-secondary: rgba(254, 215, 170, 0.08);
         --card-hover-border: rgba(249, 115, 22, 0.55);
         --card-hover-shadow: 0 16px 36px rgba(154, 52, 18, 0.10), inset 0 1.5px 1px rgba(255, 255, 255, 0.95);
       }

       [data-theme="white-orange"] .hero-card,
       [data-theme="white-orange"] .deck-card,
       [data-theme="white-orange"] .study-mode-card,
       [data-theme="white-orange"] .stat-card,
       [data-theme="white-orange"] .quiz-card,
       [data-theme="white-orange"] .bank-card-item,
       [data-theme="white-orange"] .subject-group,
       [data-theme="white-orange"] .app-sidebar {
         background: linear-gradient(135deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 248, 240, 0.28) 100%) !important;
         backdrop-filter: blur(22px) saturate(160%) !important;
         -webkit-backdrop-filter: blur(22px) saturate(160%) !important;
         border: 1px solid rgba(255, 255, 255, 0.75) !important;
         box-shadow:
           0 12px 32px rgba(124, 45, 18, 0.07),
           inset 0 1.5px 1px rgba(255, 255, 255, 0.92),
           inset 0 -1px 1px rgba(234, 88, 12, 0.08) !important;
       }
       ```
     - Các nút bấm trong `white-orange` được thiết kế dạng **Tactile Liquid Glass Pill** như Ảnh 9 (`image_d3a5ee.jpg`):
       - Nút chính (`.btn-primary`, `.btn-deck-study`): Nền Cam Tươi trong trẻo `rgba(249, 115, 22, 0.92)`, viền sáng đỉnh `inset 0 1.5px 1px rgba(255, 255, 255, 0.55)`, bóng cam dịu `0 8px 20px rgba(234, 88, 12, 0.25)`, chữ Trắng `#ffffff`.
       - Nút phụ (`.btn-secondary`): Kính kem trong mờ `rgba(255, 255, 255, 0.52)`, `backdrop-filter: blur(12px)`, viền trắng sáng `1px solid rgba(255, 255, 255, 0.82)`, bóng đổ nhẹ `0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 #ffffff`, chữ Đen Nâu `#181512`.

2. **Chữ nhấn màu Cam trong Quote (`.hero-title-accent`) ở Mode Trắng Cam chuyển sang Font chữ viết nghiêng uốn lượn kiểu Claude UI / Ảnh 10**:
   - Đảm bảo `index.html` nạp font **`Instrument Serif:ital@0;1`** và **`Playfair Display:ital,wght@1,600;1,700`** (cùng `@font-face` `Caveat` có sẵn).
   - Trong `[data-theme="white-orange"]`:
     ```css
     [data-theme="white-orange"] .hero-title-accent {
       font-family: 'Instrument Serif', 'Playfair Display', 'Caveat', Georgia, serif !important;
       font-style: italic !important;
       font-weight: 600 !important;
       text-transform: none !important;
       font-size: 1.14em !important;
       letter-spacing: 0em !important;
       color: #ea580c !important;
       -webkit-text-fill-color: #ea580c !important;
       -webkit-text-stroke: 0.4px #ea580c !important;
       padding: 0 6px !important;
       text-shadow: 0 4px 16px rgba(234, 88, 12, 0.18) !important;
     }
     ```

3. **Sửa toàn bộ lỗi chữ bị chìm / trùng màu nền trong Mode Trắng Cam (Light Mode) ở Quiz, Lật Thẻ (SRS Buttons), Ngân Hàng & Dropdown**:
   - **Trong Quiz & Ngân hàng câu hỏi**:
     - `.quiz-option-btn`: Nền kính sáng `rgba(255, 255, 255, 0.58) !important`, viền `1.5px solid rgba(234, 88, 12, 0.22) !important`, chữ `#181512 !important`.
     - `.quiz-option-content`: Đổi `color: #e4e4e7` (trắng xám bị chìm) thành `color: var(--text-primary) !important` (`#181512` đen sắc nét).
     - `.quiz-option-letter`: `color: #ea580c !important; font-weight: 800 !important;`.
     - `.quiz-option-btn.correct`: Nền `rgba(16, 185, 129, 0.18) !important`, viền `2px solid #059669 !important`, chữ `#065f46 !important` (Xanh lục đậm cực rõ trên nền sáng!).
     - `.quiz-option-btn.incorrect`: Nền `rgba(239, 68, 68, 0.16) !important`, viền `2px solid #dc2626 !important`, chữ `#991b1b !important` (Đỏ đậm cực rõ trên nền sáng!).
   - **Trong Chế độ Lật Thẻ (Flashcard & 4 nút mức độ hiểu `.srs-btn`)**:
     - Mặt trước và mặt sau thẻ (`.flashcard-face`, `.flashcard-front`, `.flashcard-back`): Nền kính sáng `rgba(255, 255, 255, 0.65) !important; backdrop-filter: blur(22px) !important; border: 1px solid rgba(255, 255, 255, 0.85) !important; color: #181512 !important;`.
     - `.flashcard-question-text`: `color: #181512 !important;`.
     - `.flashcard-answer-label` & `.flashcard-answer-text`: `color: #047857 !important;` (Xanh ngọc lục bảo đậm, không dùng `#10b981` nhạt trên nền trắng).
     - `.flashcard-explanation-box`: Nền `rgba(255, 247, 237, 0.75) !important; border: 1px solid rgba(234, 88, 12, 0.22) !important;`, chữ `.flashcard-explanation-text` màu `#3f3a34 !important`.
     - **4 nút chọn mức độ hiểu (`.srs-btn`) trong `[data-theme="white-orange"]`** (thay thế hoàn toàn màu chữ pastel nhạt bị chìm):
       ```css
       [data-theme="white-orange"] .srs-btn-again {
         background: rgba(254, 226, 226, 0.78) !important;
         color: #991b1b !important;
         border: 1px solid rgba(220, 38, 38, 0.35) !important;
       }
       [data-theme="white-orange"] .srs-btn-hard {
         background: rgba(255, 237, 213, 0.82) !important;
         color: #9a3412 !important;
         border: 1px solid rgba(234, 88, 12, 0.38) !important;
       }
       [data-theme="white-orange"] .srs-btn-good {
         background: rgba(219, 234, 254, 0.82) !important;
         color: #1e40af !important;
         border: 1px solid rgba(37, 99, 235, 0.35) !important;
       }
       [data-theme="white-orange"] .srs-btn-easy {
         background: rgba(209, 250, 229, 0.82) !important;
         color: #065f46 !important;
         border: 1px solid rgba(5, 150, 105, 0.35) !important;
       }
       [data-theme="white-orange"] .srs-btn .srs-interval {
         background: rgba(0, 0, 0, 0.06) !important;
         color: inherit !important;
       }
       ```

---

### NHÓM 5: TỐI ƯU HÓA CHẾ ĐỘ MOBILE (`@media (max-width: 768px)`)

1. **Hạ thấp độ nhô của Icon Active trên thanh `.bottom-nav` ở dưới cùng**:
   - **Hiện trạng**: Phần icon nổi lên của trang đang chọn trên thanh `.bottom-nav` đang nhô quá cao (`translateY(-16px)` / `-18px`), làm vướng mắt và cản trở một phần vùng thao tác/hiển thị bên trên.
   - **Cách sửa**:
     - Giảm độ nhô của icon active trên `.bottom-nav-item.active` xuống mức vừa vặn, tinh tế (`transform: translateY(-4px) !important;`), kích thước vòng tròn active gọn gàng (`width: 38px; height: 38px; border-radius: 50%;`), viền khuyết nhẹ (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18)`), nằm gọn trong phạm vi thanh `.bottom-nav` mà **không bao giờ trồi cao che khuất nút bấm hay nội dung phía trên**.
2. **Đồng bộ toàn bộ cải tiến lên Mobile**:
   - Cụm 3 icon chọn Theme nổi gọn ở góc trên phải Mobile.
   - Thanh Quick-Jump chọn nhanh môn học ở `#view-decks` hỗ trợ vuốt ngang mượt mà (`overflow-x: auto; white-space: nowrap;`).
   - Bỏ khung bọc nút `Câu tiếp theo` trên Mobile, chỉ hiện nút viên nang nổi gọn gàng.
   - Đảm bảo cả 3 mode (`violet-rose`, `monochrome`, `white-orange` Liquid Glass) hiển thị rõ chữ, trong trẻo và mượt 120FPS trên Mobile.

## PHẦN 3: KIỂM ĐỊNH CHẤT LƯỢNG & NGHIỆM THU (VERIFICATION)

Sau khi thực hiện đầy đủ 24 hạng mục trên, AI Agent **BẮT BUỘC** chạy kiểm tra và tắt mọi tiến trình `node server.js` chạy ngầm trước khi hoàn tất:

```bash
# 1. Chạy toàn bộ Unit & Integration Tests
npm test

# 2. Chạy Build Production
npm run build
```

### Checklist Nghiệm Thu Đợt `1d` (Ghi vào `docs/handoff/PROGRESS-1D.md`):
- [ ] **1.1 - 1.4**: Đã bỏ khung thanh Topbar (chỉ giữ icon góc phải), xóa chọn mode màu bị lặp, xóa nút `↻ Đổi cảm hứng`, xóa 2 dòng tag trên khung Quote, và đổi toàn bộ `MindSparks` sang `TinhMinhLaKey` (giữ an toàn dữ liệu IndexedDB).
- [ ] **1.5 - 1.6**: Toàn bộ icon/emoji trên app đã được đơn sắc hóa theo từng Theme; Prompt AI tạo câu hỏi đã ép buộc phân loại theo **Chương (`Chương 1: ...`)** thay vì chủ đề vụn vặt.
- [ ] **1.7 - 1.9**: Đã bỏ nút mũi tên ngang, bấm vào icon con mèo để đóng/mở Sidebar mượt mà cả 2 chiều; giao diện Sidebar kính mờ chuẩn Ảnh 3.
- [ ] **1.10 - 1.13**: Tab Thư viện thẻ có thanh nhảy/lọc nhanh đến folder môn học; cụm nút ở Ngân hàng câu hỏi thẳng hàng đẹp mắt; nút `Câu tiếp theo` không còn khung to dài bao quanh; chế độ Lật thẻ mượt mà 120FPS cả khi lật tại chỗ lẫn khi chuyển câu.
- [ ] **2.1 - 2.2 (Mode Tím Hồng)**: Khung Quote trong suốt hơn thấy rõ nền; hình nền mặc định đổi thành `./backgrounds/bg-2.webp`.
- [ ] **3.1 - 3.3 (Mode Trắng Đen)**: Sidebar trong suốt thấy nền; xóa sạch 100% ánh tím ở con trỏ chuột, bóng đổ, viền thẻ và đáp án Quiz.
- [ ] **4.1 - 4.5 (Mode Trắng Cam)**: Đạt chuẩn **Liquid Glass** xuyên thấu, mờ ảo như 2 ảnh mẫu cuối; chữ nhấn màu cam trong Quote dùng font nghiêng nghệ thuật kiểu Claude UI; toàn bộ chữ ở Lật thẻ (SRS buttons) và Quiz tương phản rõ nét, không còn chữ chìm.
- [ ] **5.1 (Mobile)**: Thanh `.bottom-nav` ở dưới có icon active hạ thấp tinh tế, không cản trở thao tác; `npm test` và `npm run build` đạt **100% PASS**.
