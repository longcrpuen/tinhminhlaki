# TinhMinhLaKey — Bản Đồ Kiến Trúc Toàn Bộ Ứng Dụng (Architecture Graph)

> **Tài liệu tham chiếu chuẩn hóa kiến trúc ứng dụng TinhMinhLaKey (Phiên bản Phase 1n)**  
> Dùng làm bản đồ điều phối gốc cho toàn bộ các phiên bản nâng cấp, sửa đổi tính năng, tái cấu trúc UI/UX và bảo trì hệ thống.
>
> * **Tổng số tệp cốt lõi:** 11 tệp chính + 20 bộ kiểm thử hồi quy (Test Suites).
> * **Tổng số dòng code thực tế:** `index.html` (2,236 dòng), `js/app.js` (7,817 dòng), `js/db.js` (1,458 dòng), `js/lofi-music.js` (611 dòng), `js/parser.js` (763 dòng), `js/srs.js` (123 dòng), `js/audio.js` (326 dòng), `css/style.css` (9,487 dòng), `css/theme.css` (2,847 dòng), `tests/test-runner.js` (1,421 dòng).
> * **Kết quả kiểm thử tự động:** 100% PASS (421/421 kiểm thử trên 20 Test Suites).

---

## PHẦN 1: SƠ ĐỒ CÂY ROOT-TO-BRANCH (Root-to-Branch Tree)

```mermaid
graph TD
    Root["App Root<br/>(index.html: 2,236 dòng | js/app.js: 7,817 dòng | js/db.js: 1,458 dòng | css/theme.css: 2,847 dòng | css/style.css: 9,487 dòng | js/lofi-music.js: 611 dòng)"]

    Root --> B1["Branch 1: Global Shell & Lens Optical Layer<br/>(135deg Liquid Glass Directional Light, Sidebar, Mobile Squircle Floating Bottom Nav, Topbar HUD, Lofi AutoPlay & Theme Tuner, Toaster)"]
    Root --> B2["Branch 2: #view-dashboard<br/>(Hero Quote Stage với bóng hắt chân gọn nhẹ, 4 Ô Trạng Thái Chữ Nhật 4px Light Neon Đơn Sắc, 7 Study Modes, Decks Grid)"]
    Root --> B3["Branch 3: #view-decks<br/>(Subject Filter Pills, Action Bar [Ôn cả môn / Quản lý], Subject Groups Bevel 18px, Deck Cards 135deg Liquid Glass)"]
    Root --> B4["Branch 4: #view-bank<br/>(Single Native Scroller, Search Bar, 4 CyberDropdowns, Filter Pills [Bookmark/Flag/Review], 2-col Mobile Action Grid)"]
    Root --> B5["Branch 5: #view-study<br/>(Quiz Player không đốm trắng ::before, Blind Recall Box, Numeric Box, Flashcard Auto-Height Grid 1x1, KaTeX Smart Wrap, SRS Bar)"]
    Root --> B6["Branch 6: #view-exam<br/>(Dual Exam: Single Question Mode & All-Questions LMS Scroll + Sticky Palette)"]
    Root --> B7["Branch 7: #view-import & #view-import-lms<br/>(AI Paste Parser, Moodle LMS Parser, Preview Cards Grid, Inputs & Textareas với High Contrast Borders)"]
    Root --> B8["Branch 8: #view-stats & #view-settings<br/>(365-day Heatmap, Subject Table, Theme Energy Wave Chamber 144+ FPS, Lofi CyberDropdown & Range Sliders, DB Backup)"]
    Root --> B9["Branch 9: Modal System (8 Modals) with 135deg Directional Light Bevel<br/>(Create Subject, Manage Subject, Bulk Reassign, Topic Picker Mode 5, Exam Setup, Sprint, Edit Card, Session Complete)"]
```

### Danh Mục 9 Nhánh Kiến Trúc (9 Architectural Branches) & Tọa Độ Code Thực Tế

| Nhánh | Định danh (View ID / Scope) | Vai trò & Thành phần chính | File & Dòng tham chiếu chính |
| :--- | :--- | :--- | :--- |
| **Branch 1** | **Global Shell & Lens Layer** | Vỏ ứng dụng toàn cục: Quy luật ánh sáng định hướng `135deg` (`--lg-directional-*`), Sidebar desktop (`.app-sidebar`), Mobile bottom bar (`.bottom-nav` squircle nổi 62px, màu cam `#ea580c` ở White-Orange), Khóa bảo vệ SVG icon nét mảnh đơn sắc, Single Document Scroller (`html`), Lofi Player chạm lần đầu tự phát | `index.html#L54-159, L1618-1660`<br/>`js/app.js#L315-460, L904-1060`<br/>`js/lofi-music.js#L112-160`<br/>`css/theme.css#L2530-2590`<br/>`css/style.css#L8840-8960` |
| **Branch 2** | `#view-dashboard` | Trang chủ điều hành: Khung Quote (`.hero-card`) với quầng sáng hover thu gọn mỏng dưới đáy, 4 ô thống kê chữ nhật góc sắc nét (`border-radius: 4px !important`, Tím Light Neon và Cam Light Neon ĐƠN SẮC không gradient), 7 ô chế độ học và lưới bộ thẻ | `index.html#L160-482`<br/>`js/app.js#L465-890`<br/>`css/theme.css#L2595-2740`<br/>`css/style.css#L850-1350` |
| **Branch 3** | `#view-decks` | Thư viện thẻ học: Thanh lọc môn học (`.subject-filter-bar`), khung tiêu đề nhóm môn bo 18px (`.subject-group-header`), các thẻ bộ thẻ mang hiệu ứng viền bất đối xứng 135deg (`.deck-card`), giữ nguyên focus và vị trí con trỏ khi lọc nhanh | `index.html#L483-509`<br/>`js/app.js#L2232-2480`<br/>`css/theme.css#L2200-2259`<br/>`css/style.css#L8980-9040` |
| **Branch 4** | `#view-bank` | Ngân hàng câu hỏi: Cuộn dọc duy nhất qua gốc `html` (loại bỏ triệt để double scrollbar), lưới hành động 2 cột trên Mobile (không tràn chữ "Sao chép Prompt AI viết lại"), 4 CyberDropdown, bảng lọc câu hỏi ảo hóa | `index.html#L510-666`<br/>`js/app.js#L6200-6700`<br/>`css/style.css#L9045-9120` |
| **Branch 5** | `#view-study` | Phòng học tương tác: Quiz trắc nghiệm đã xóa sạch đốm trắng trung tâm (`::before`), Flashcard bố cục CSS Grid `1x1` auto-height co giãn tự do không đè thanh SRS, KaTeX tự động ngắt dòng thông minh (`.katex-html > .base::after { content: "\200B"; }`), cỡ chữ giải thích chuẩn `0.96rem` | `index.html#L667-849`<br/>`js/app.js#L2580-3380`<br/>`css/style.css#L7138-7150, L9125-9275` |
| **Branch 6** | `#view-exam` | Chế độ thi thử 2-Mode: (1) `single`: Từng câu đơn lẻ kèm nút Trước/Sau; (2) `all`: Cuộn dọc như Moodle LMS kèm thanh Palette nhảy câu và nút nộp bài | `index.html#L850-907`<br/>`js/app.js#L4150-4550`<br/>`css/style.css#L8780-8830` |
| **Branch 7** | `#view-import` & `#view-import-lms` | Nhập liệu thông minh: Prompt harness cho AI, bóc tách cấu trúc Moodle LMS raw text, thẻ xem trước câu hỏi có CyberDropdown chọn kiểu/độ khó, các khung nhập liệu và textarea viền sáng sắc nét trên nền tối | `index.html#L908-1199`<br/>`js/parser.js#L1-763`<br/>`css/style.css#L3380-3850` |
| **Branch 8** | `#view-stats` & `#view-settings` | Thống kê & Thiết lập: Heatmap 365 ngày, Buồng Sóng Năng Lượng Quang Phổ Tương Tác (`.theme-energy-wave-chamber`) kéo thanh trượt đổi theme 144+ FPS không lag, chọn bài Lofi bằng CyberDropdown đồng bộ toàn app, thanh kéo âm lượng đổi màu theo 3 theme | `index.html#L1200-1610`<br/>`js/app.js#L950-1070`<br/>`js/lofi-music.js#L540-600`<br/>`css/theme.css#L2745-2810`<br/>`css/style.css#L9280-9485` |
| **Branch 9** | **Modal System** | Hệ thống 8 modal: Đã xóa sạch sọc kính chia Fluted Glass, Popup Theme Tím Hồng được nâng cấp nền tách lớp (`--popup-glass-volume-bg`) và gờ viền sáng (`--popup-glass-rim-border`) như 2 theme kia; sự kiện Capture Phase cho phép chuyển trang trực tiếp khi hoàn thành bài | `index.html#L1661-2236`<br/>`js/app.js#L1400-1550, L3900-4100`<br/>`css/theme.css#L2515-2530` |

---

## PHẦN 2: MA TRẬN LIÊN KẾT COMPONENT DÙNG CHUNG (Cross-Branch Component Matrix)

Khi chỉnh sửa bất kỳ Component dùng chung nào, kỹ sư / Agent **phải đối chiếu toàn bộ các nhánh trong bảng ma trận này** để không làm sót giao diện hoặc gây gãy vỡ layout chéo.

| Component Dùng Chung | Vị trí HTML Template (index.html) | Hàm JavaScript Điều Phối (js/) | Rule CSS Desktop & Mobile (css/) | Nhánh Phụ Thuộc |
| :--- | :--- | :--- | :--- | :--- |
| **135deg Directional Liquid Glass (Cards & Modals)** | `index.html#L160-482` (`.hero-card`, `.stat-card`, `.study-mode-card`)<br/>`index.html#L1661-2236` (8 Modal Boxes) | `App.updateHeroQuote`<br/>`App._showModal`<br/>`App._closeModal` | `css/theme.css#L2530-2590`<br/>`border-top`, `border-left`, `border-right`, `border-bottom` bất đối xứng theo hướng sáng; viền trên-trái đón sáng rực rỡ, hai cạnh bên mờ dịu, góc dưới-phải phản xạ nhẹ | B1, B2, B3, B9 |
| **4 Rectangular Stat Cards (Solid Light Neon)** | `index.html#L180-240` (4 ô thống kê dưới Quote) | `App.renderStatsOverview`<br/>`App.updateHeroQuote` | `css/theme.css#L2625-2740`<br/>`border-radius: 4px !important;` trên cả 3 theme. Hover Purple-Pink: Tím Light Neon (`rgba(192, 132, 252, 0.28)`). Hover White-Orange: Cam Light Neon **đơn sắc** (`rgba(255, 158, 88, 0.28)`), zero gradient | B2 |
| **Mobile Floating Squircle Bottom Nav** | `index.html#L1618-1660` (`#mobile-bottom-nav`) | `App.navigateTo`<br/>`App.updateBottomNav` | `css/style.css#L8850-8960`<br/>Cao 62px, bo squircle 20px, `backdrop-filter: blur(26px)`. Ở White-Orange, nút active mang chữ và icon màu Cam Đậm (`#ea580c`), không chìm lóa trên nền sáng | B1 |
| **Flashcard Auto-Height Grid 1x1 & KaTeX Smart Wrap** | `index.html#L750-815` (`#flashcard-player-wrap`) | `App.flipFlashcard`<br/>`App.rateFlashcard`<br/>`App.renderFlashcardBack` | `css/style.css#L9125-9275`<br/>`.flashcard-card` grid 1x1 auto-height giãn nở theo nội dung giải thích, đẩy 4 nút SRS xuống dưới (tuyệt đối không bao giờ đè lên nút). KaTeX tự ngắt dòng sau `=`, `\iff`, `\implies` qua `\200B` | B5 |
| **CyberDropdown System** | `index.html#L510-580` (Bank)<br/>`index.html#L920-960` (Import)<br/>`index.html#L1550-1560` (Lofi Track Settings)<br/>`index.html#L1700-2100` (Modals) | `App._toggleCyberDropdownById`<br/>`App.closeAllCyberDropdowns`<br/>`LofiPlayer.initCyberDropdown` | `css/style.css#L7230-7350`<br/>Dropdown tùy chỉnh nổi bật với z-index cao nhất, hỗ trợ keyboard accessibility và đánh dấu `.active` bài hát/mục được chọn | B1, B4, B7, B8, B9 |
| **Interactive Resonance Energy Wave Theme Tuner** | `index.html#L1373-1430` (`#theme-energy-chamber`) | `App.syncThemeEnergyChamber`<br/>`App.onThemeEnergySliderInput`<br/>`App.onThemeEnergySliderCommit`<br/>`App.selectThemeViaEnergyWave` | `css/style.css#L9280-9485`<br/>Sóng SVG Multi-Harmonic uốn lượn đổi màu tức thời theo vị trí con trượt, chuyển theme mượt 144+ FPS và tự hút về các mốc cộng hưởng chuẩn (12, 50, 88) | B8 |
| **Lofi Background Music & First-Touch AutoPlay** | `index.html#L210-230` (`.hero-lofi-bar`)<br/>`index.html#L1540-1570` (`#view-settings`) | `LofiPlayer.init`<br/>`LofiPlayer.setupFirstInteractionAutoPlay`<br/>`LofiPlayer.selectTrack` | `js/lofi-music.js#L112-160, L540-600`<br/>`css/theme.css#L2745-2810`<br/>Tự động phát nhạc ngay khi người dùng chạm/click/gõ phím đầu tiên vào trình duyệt. Thanh slider âm lượng đồng bộ màu theo 3 theme | B1, B2, B8 |

---

## PHẦN 3: HỆ THỐNG TOKEN 3 THEME VÀ QUY LUẬT ÁNH SÁNG ĐỊNH HƯỚNG 135DEG

Toàn bộ hệ thống giao diện được điều phối qua 3 theme tại `css/theme.css`. Mọi linh kiện UI đều phải sử dụng các biến CSS dưới đây, tuyệt đối không được viết mã màu cố định.

| Nhóm Token | Tên Biến CSS (`var(...)`) | Ý Nghĩa Vật Lý & Quy Chuẩn Áp Dụng |
| :--- | :--- | :--- |
| **Gờ Vát Ánh Sáng Định Hướng 135deg** | `--lg-directional-bevel` | Tạo chiều sâu 3D chân thực theo Ảnh 3: Đỉnh-Trái đón sáng trực diện mạnh nhất (`inset 1.5px 1.5px 1.5px rgba(255, 255, 255, 0.58-0.98)`), góc Dưới-Phải phản xạ thứ cấp nhẹ (`inset -1px -1.5px 2px`), đỉnh trên tán xạ sương mỏng |
| **Viền Bất Đối Xứng 4 Cạnh 135deg** | `--lg-directional-border-top`<br/>`--lg-directional-border-left`<br/>`--lg-directional-border-right`<br/>`--lg-directional-border-bottom` | Thay thế hoàn toàn viền trắng đều 4 cạnh phẳng 2D: Cạnh trên và trái sáng rõ; 2 cạnh sườn mờ dịu (`0.08`); cạnh đáy phản xạ nhẹ |
| **Khung Tách Nền Popup Liquid Glass** | `--popup-glass-volume-bg`<br/>`--popup-glass-rim-border`<br/>`--popup-glass-volume-shadow` | Mode Tím Hồng dùng gradient `rgba(64, 48, 98, 0.56) -> rgba(44, 30, 74, 0.52)` tạo độ tương phản tách khỏi nền trang; viền sáng lavender `rgba(233, 213, 255, 0.34)`. Monochrome và White-Orange giữ nguyên sự trong trẻo |
| **Quầng Sáng Chân Quote Hắt Nhẹ** | `.hero-card:hover box-shadow` | Dùng `spread-radius` âm (`-12px`) và `offset-y: 14px`: ánh sáng chỉ nằm gọn ở dải mỏng dưới chân khung Quote, không tõe sang 2 bên hay phía trên |
| **4 Ô Thống Kê Chữ Nhật Đơn Sắc** | `#view-dashboard .stat-card`<br/>`#view-dashboard .stat-card:hover` | Góc vát sắc sảo `border-radius: 4px !important;`. Hover Tím Hồng: Tím Light Neon (`rgba(192, 132, 252, 0.28)`). Hover White-Orange: Cam Light Neon **đơn sắc** (`rgba(255, 158, 88, 0.28)`), chữ `#1c1917` sắc nét |
| **Thanh Kéo Âm Lượng & Năng Lượng** | `--range-track-bg`<br/>`--range-fill-color`<br/>`--range-thumb-bg`<br/>`--range-thumb-glow` | Tím Hồng: vệt tím pastel `#f472b6`. Monochrome: vệt bạc trắng `#ffffff`. White-Orange: vệt cam đậm `#ea580c` viền trắng |

---

## PHẦN 4: ĐỒ THỊ LUỒNG DỮ LIỆU & SỰ KIỆN (Action -> Handler -> DB -> Render)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant DOM as Giao diện HTML (index.html)
    participant App as Bộ điều phối (js/app.js)
    participant Lofi as Trình phát Lofi (js/lofi-music.js)
    participant DB as Tầng dữ liệu (js/db.js / IndexedDB)

    Note over User,DB: LUỒNG 1: CHẠM LẦN ĐẦU VÀO TRÌNH DUYỆT TỰ ĐỘNG BẬT NHẠC LOFI (ITEM 13)
    User->>DOM: Chạm / Click / Nhấn phím bất kỳ lần đầu tiên khi vào app
    DOM->>Lofi: Sự kiện PointerDown / TouchStart (Capture Phase)
    Lofi->>Lofi: Kiểm tra !this.isPlaying & mục tiêu không phải nút #btn-lofi-toggle
    Lofi->>Lofi: Tự động gỡ bỏ các event listener để không bắt lại
    Lofi->>Lofi: LofiPlayer.play() phát bài hòa âm Lofi Chill
    Lofi->>DOM: LofiPlayer.updateUI() cập nhật tên bài hát & EQ Bars nhảy theo nhạc

    Note over User,DB: LUỒNG 2: KÉO BUỒNG SÓNG NĂNG LƯỢNG ĐỔI THEME 144+ FPS (ITEM 15)
    User->>DOM: Kéo thanh trượt #theme-energy-slider
    DOM->>App: App.onThemeEnergySliderInput(val)
    App->>DOM: documentElement.setAttribute('data-theme', targetTheme) (0ms lag, không ghi đĩa)
    App->>DOM: Uốn lượn độ dày dải sóng chính (#energy-wave-main-path)
    App->>DOM: Đổi màu dải màu SVG (#energy-wave-grad-primary & #energy-wave-area-fill)
    App->>DOM: Cập nhật nhãn HUD badge ("RESONANCE // WHITE ORANGE", v.v.)
    User->>DOM: Thả tay khỏi thanh trượt (onchange)
    DOM->>App: App.onThemeEnergySliderCommit(val)
    App->>App: Hút con trượt về điểm cộng hưởng chuẩn (12 cho Tím, 50 cho Trắng Đen, 88 cho Trắng Cam)
    App->>DB: db.setMeta('appTheme', theme) lưu trạng thái bền vững
    App->>DOM: App.setBackground(...) đồng bộ hình nền mặc định tương ứng

    Note over User,DB: LUỒNG 3: FLASHCARD CO GIÃN THEO GIẢI THÍCH LATEX & ĐẨY THANH SRS (ITEMS 11 & 12)
    User->>DOM: Bấm lật thẻ Flashcard (hoặc phím Space)
    DOM->>App: App.flipFlashcard()
    App->>DOM: Thêm class .flipped vào #active-flashcard
    DOM->>DOM: CSS Grid 1x1 tự động đặt mặt trước height: 0, mặt sau height: auto
    DOM->>DOM: KaTeX ngắt dòng mềm mại các chuỗi toán học dài tại dấu =, \iff, \implies
    DOM->>DOM: Mặt sau thẻ tự giãn chiều cao trọn vẹn với cỡ chữ 0.96rem
    DOM->>DOM: Đẩy thanh 4 nút đánh giá SRS (#flashcard-srs-bar) xuống dưới, bảo đảm không bao giờ bị đè!
```

---

*Tài liệu được cập nhật, đồng bộ và nghiệm thu hoàn tất trong Phase 1n.*
