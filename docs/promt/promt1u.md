# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1U — KHÓA CỐ ĐỊNH SIDEBAR ĐI THEO MÀN HÌNH KHI CUỘN (`position: fixed`), SỬA DỨT ĐIỂM LỖI LỆCH PHẢI LAYOUT TOÀN TRANG (`.app-main` DOUBLE-OFFSET), NÂNG CẤP BUỒNG SÓNG ÁNH SÁNG ĐẲNG CẤP (WAVE PACKET INTERFEROMETER + RESONANCE ORB) & THIẾT KẾ LẠI 2 CỔNG NGƯỠNG CHUYỂN THEME (`33.5%` / `66.5%` CRYSTAL PHASE GATES) (`promt1u.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1u` (Nối tiếp sau `1t`)
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **4 vấn đề bố cục & thẩm mỹ** từ phản hồi mới nhất của người dùng và 3 ảnh chụp màn hình (`image_855561.jpg`, `image_85553f.png`, `image_854d3d.jpg`), tuân thủ nghiêm ngặt **Luật Phân Tích Ảnh Hưởng & Chống Hồi Quy (System Impact & Regression Analysis Protocol)**.

---

## PHẦN 0: GIẢI PHẪU NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

### Tại sao ở bản `1t`, vừa thêm hiệu ứng kính nhám cho Sidebar thì xảy ra cùng lúc 2 lỗi: (1) Cuộn trang xuống Sidebar bị kẹt ở đầu trang VÀ (2) Toàn bộ layout thẻ bị đẩy lệch hẳn sang bên phải (`image_855561.jpg` & `image_854d3d.jpg`)?
- **Nguyên nhân chính xác 100%**:
  - Khi thêm lớp phủ phản quang `#app-sidebar.app-sidebar::after { position: absolute; inset: 0; }` ở đợt `1t`, AI Coding Agent đã vô tình thêm **`position: relative !important;`** vào `#app-sidebar.app-sidebar` (vì nghĩ rằng phần tử cha cần `position: relative` để neo `::after`, mà quên mất rằng bản thân `position: fixed` ĐÃ LÀ containing block cho mọi phần tử con `position: absolute`)!
  - Ngay khi `#app-sidebar` bị đổi từ `position: fixed` sang `position: relative`:
    1. **Lỗi 1 (Sidebar bị kẹt ở đầu trang khi cuộn — `image_855561.jpg`)**: Vì mất `position: fixed`, Sidebar nằm trong luồng cuộn của trang nên khi cuộn xuống dưới, Sidebar bị trôi tụt lên trên đầu trang thay vì đi theo màn hình chính!
    2. **Lỗi 2 (Toàn bộ layout bị đẩy lệch sang bên phải quá đà — `image_854d3d.jpg` & `image_855561.jpg`)**: Vì `.app-container` có `display: flex`, khi `.app-sidebar` biến thành `position: relative`, bản thân `.app-sidebar` chiếm `260px` chiều ngang trong flex container, CỘNG THÊM `.app-main` lại đang có `margin-left: var(--sidebar-width)` (`260px`)! Kết quả là `.app-main` bị đẩy lùi sang phải gấp đôi (`260px + 260px = 520px`), tạo ra một khoảng trống khổng lồ bên trái như trong `image_854d3d.jpg` và ép toàn bộ các thẻ câu hỏi/bộ thẻ dạt sát sang mép phải màn hình!

---

## PHẦN 1: CHI TIẾT 4 HẠNG MỤC CẦN THỰC HIỆN NGAY TRONG `promt1u.md`

### 1 & 2. Khóa Cố Định Sidebar Đi Theo Màn Hình (`position: fixed !important`) Khi Cuộn Trang & Căn Giữa Chuẩn Xác Toàn Bộ Layout `.app-main` (Chấm Dứt Hoàn Toàn Lỗi Lệch Phải — `image_855561.jpg` & `image_854d3d.jpg`)

#### 🛠️ Giải pháp bắt buộc trong `css/style.css` và `css/theme.css`:

1. **Khôi phục và khóa cứng `position: fixed !important` cho `#app-sidebar.app-sidebar` (cả khi mở rộng lẫn khi thu gọn `.collapsed`)**:
   - **TUYỆT ĐỐI XÓA BỎ mọi khai báo `position: relative` hoặc `position: static` trên `.app-sidebar` / `#app-sidebar`!**
   - Với `position: fixed !important`, lớp `::after` (`position: absolute; inset: 0;`) vẫn bám khít 100% bên trong Sidebar mà Sidebar vẫn cố định tuyệt đối theo màn hình khi cuộn!
2. **Đồng bộ toán học khoảng cách `margin-left` và `width` của `.app-main` để toàn bộ nội dung luôn nằm chính giữa vùng nhìn**:
   ```css
   /* ==========================================================================
      1 & 2. CỐ ĐỊNH SIDEBAR THEO MÀN HÌNH KHI CUỘN (POSITION: FIXED)
             & CĂN GIỮA CHUẨN XÁC LAYOUT .app-main (KHÔNG BỊ ĐẨY LỆCH PHẢI)
      ========================================================================== */

   @media (min-width: 841px) and (min-height: 551px) {
     html body .app-container {
       display: block !important; /* Không dùng flex đẩy kép khi sidebar đã là fixed */
       width: 100% !important;
       min-height: 100dvh !important;
       position: relative !important;
     }

     /* Sidebar luôn cố định theo màn hình (Floating Fixed Glass Capsule) khi cuộn trang */
     html body #app-sidebar.app-sidebar {
       position: fixed !important;
       top: 14px !important;
       left: 14px !important;
       bottom: 14px !important;
       height: calc(100dvh - 28px) !important;
       max-height: calc(100dvh - 28px) !important;
       width: 248px !important;
       min-width: 248px !important;
       margin: 0 !important;
       border-radius: 24px !important;
       z-index: 200 !important;
       overflow-y: auto !important;
       overflow-x: hidden !important;
       display: flex !important;
       flex-direction: column !important;
       box-sizing: border-box !important;
     }

     /* Khi thu gọn Sidebar (.collapsed): rộng 72px, vẫn giữ nguyên position: fixed */
     html body #app-sidebar.app-sidebar.collapsed {
       position: fixed !important;
       top: 14px !important;
       left: 14px !important;
       bottom: 14px !important;
       height: calc(100dvh - 28px) !important;
       max-height: calc(100dvh - 28px) !important;
       width: 72px !important;
       min-width: 72px !important;
       padding: 20px 10px !important;
       border-radius: 999px !important;
       z-index: 200 !important;
     }

     /* Khung màn hình chính (.app-main) khi Sidebar đang mở rộng (14px + 248px + 14px = 276px) */
     html body:not(.focus-mode-active) .app-main:not(.sidebar-collapsed) {
       margin-left: 276px !important;
       margin-right: 0 !important;
       width: calc(100% - 276px) !important;
       max-width: calc(100% - 276px) !important;
       box-sizing: border-box !important;
     }

     /* Khung màn hình chính (.app-main) khi Sidebar đang thu gọn (14px + 72px + 14px = 100px) */
     html body:not(.focus-mode-active) .app-main.sidebar-collapsed {
       margin-left: 100px !important;
       margin-right: 0 !important;
       width: calc(100% - 100px) !important;
       max-width: calc(100% - 100px) !important;
       box-sizing: border-box !important;
     }

     /* Căn giữa hoàn hảo .content-wrapper bên trong .app-main */
     html body .app-main > .content-wrapper {
       width: 100% !important;
       max-width: 1240px !important;
       margin-left: auto !important;
       margin-right: auto !important;
       padding: 24px 32px 60px 32px !important;
       box-sizing: border-box !important;
     }
   }
   ```

---

### 3. Nâng Cấp Đồ Họa Sóng Ánh Sáng Trong Buồng Năng Lượng (`#theme-energy-chamber` — `image_85553f.png`) Lên Chuẩn "Quantum Laser Interferometer" Sống Động & Sắc Nét

#### 🔍 Giải phẫu tại sao phần sóng trong `image_85553f.png` và `image_9122c6.png` nhìn nhạt nhòa, chưa ấn tượng:
1. **Độ tương phản quá thấp**: Ở theme `Trắng Cam` (`image_85553f.png`), đường sóng màu cam nhạt vẽ trên nền kem nhạt làm sóng chìm nghỉm vào nền, gần như không nhìn thấy đường sóng đâu! Ở theme `Tím Hồng` (`image_9122c6.png`), nét sóng cũng quá mảnh và mờ (`opacity` thấp).
2. **Hình học sóng đơn điệu & bị gãy khúc đa giác**: Sóng hiện tại lấy quá ít điểm mẫu theo trục X nên nhìn rõ các đoạn thẳng nối nhau gãy góc, và biên độ sóng đều chằn chặn từ trái qua phải thay vì hội tụ năng lượng tại điểm người dùng đang kéo!

#### 🛠️ Giải pháp nâng cấp toàn diện trong `js/app.js`, `index.html` và `css/style.css`:

1. **Thiết kế Toán Học Sóng Giao Thoa Hội Tụ Theo Vị Trí Con Trỏ (Focused Wave-Packet Interferometer) trong `_updateEnergyWaveVisuals(val)` (`js/app.js`)**:
   - **Độ phân giải siêu mịn (`POINTS = 160` điểm mẫu trên chiều rộng `800px`, tức `step = 5px`)**: Đảm bảo đường cong sóng uốn lượn mềm mại tuyệt đối như tia laser thật, không còn bất kỳ góc gãy đa giác nào!
   - **Hàm Bao Năng Lượng Hội Tụ Quanh Con Trỏ (Cursor-Tracked Gaussian Wave Packet)**:
     - Gọi $t = \text{val} / 100 \in [0, 1]$ là vị trí hiện tại của nút kéo sóng, và $u = x / W \in [0, 1]$ là tọa độ chuẩn hóa dọc theo buồng sóng.
     - Biên độ sóng tại mỗi điểm $u$ được điều biến bởi hàm bao hội tụ:
       $$A(u, t) = \sin(\pi u)^{0.65} \cdot \left(0.42 + 0.58 \cdot \exp\left(-\frac{(u - t)^2}{0.045}\right)\right)$$
     - **Hiệu ứng thị giác**: Ngay tại vị trí con trỏ $t$ mà người dùng đang kéo, **bó sóng ánh sáng dâng cao cực đại, giao thoa đa tầng và phát sáng mạnh nhất**! Khi người dùng kéo con trỏ từ trái sang phải, đỉnh bó sóng (Wave Packet Crest) lướt theo ngón tay mượt như sóng cơ học lượng tử, đồng thời tần số sóng ($f = 2.4 + t \cdot 4.2$ chu kỳ) tăng dần từ bước sóng dài trầm ấm sang bước sóng ngắn năng lượng cao!
   - **Hệ 4 Lớp Sóng + Tâm Quang Năng (`#wave-resonance-orb`)**:
     1. **Lớp 1 — Dải Cực Quang Đáy Sóng Kép (`#wave-area-primary` & `#wave-area-secondary`)**: Tô gradient đậm nét dưới đường sóng chính và sóng phụ.
     2. **Lớp 2 — Hai Sóng Giao Thoa Lệch Pha (`#wave-harmonic-2` & `#wave-harmonic-1`)**: Sóng đối pha $y_2(u)$ và $y_3(u)$ đan chéo vào sóng chính tạo hiệu ứng dải lụa 3D (Aurora Braid).
     3. **Lớp 3 — Lõi Laser Phát Quang (`#wave-primary-glow` dày `7px`, `blur(4px)` nằm dưới + `#wave-primary-core` dày `2.8px` sắc nét nằm trên)**: Tạo hiệu ứng tia laser có lõi sáng rực và quầng hào quang bao quanh!
     4. **Lớp 4 — Tâm Quang Năng & Tia Gióng Cộng Hưởng (`#wave-cursor-beam` + `#wave-cursor-halo` + `#wave-cursor-orb`)**:
        - Tại đúng hoành độ $x_c = t \cdot W$ và tung độ $y_c$ nằm ngay trên đỉnh sóng chính tại vị trí con trỏ, vẽ một **Tia Gióng Quang Phổ dọc (`<line id="wave-cursor-beam">`)** và một **Hạt Quang Năng phát sáng (`<circle id="wave-cursor-halo" r="11">` + `<circle id="wave-cursor-orb" r="4.5">`)** trượt ngay trên lưng sóng khi kéo!

2. **Bảng màu Tương Phản Cao Đẳng Cấp Cho Cả 3 Theme (Đặc biệt làm nổi bật rực rỡ trên `Trắng Cam` — `image_85553f.png`)**:
   ```css
   /* ==========================================================================
      3. BUỒNG SÓNG QUANG PHỔ ĐẲNG CẤP (HIGH-CONTRAST LASER WAVE CHAMBER)
      ========================================================================== */

   /* THEME 1: TÍM HỒNG (Ultraviolet Rose Wave) */
   :root,
   html[data-theme="violet"],
   html[data-theme="purple"] {
     --wave-chamber-bg:
       radial-gradient(120% 90% at var(--slider-pct, 25%) 65%, rgba(168, 85, 247, 0.24) 0%, transparent 65%),
       linear-gradient(180deg, #0d0818 0%, #1a0f30 60%, #241342 100%);
     --wave-grid-line: rgba(192, 132, 252, 0.08);
     --wave-primary-stroke: #f3e8ff;
     --wave-primary-glow-color: #c084fc;
     --wave-secondary-stroke: rgba(192, 132, 252, 0.65);
     --wave-tertiary-stroke: rgba(232, 121, 249, 0.40);
     --wave-area-stop-top: rgba(168, 85, 247, 0.48);
     --wave-area-stop-mid: rgba(126, 34, 206, 0.20);
     --wave-area-stop-bot: rgba(13, 8, 24, 0.0);
     --wave-orb-fill: #ffffff;
     --wave-orb-Ring: #d8b4fe;
   }

   /* THEME 2: TRẮNG ĐEN (Monochrome Laser Wave — 0% Tím) */
   html[data-theme="bw"],
   html[data-theme="monochrome"] {
     --wave-chamber-bg:
       radial-gradient(120% 90% at var(--slider-pct, 50%) 65%, rgba(255, 255, 255, 0.14) 0%, transparent 65%),
       linear-gradient(180deg, #070709 0%, #111115 60%, #18181d 100%);
     --wave-grid-line: rgba(255, 255, 255, 0.07);
     --wave-primary-stroke: #ffffff;
     --wave-primary-glow-color: rgba(255, 255, 255, 0.85);
     --wave-secondary-stroke: rgba(228, 228, 231, 0.58);
     --wave-tertiary-stroke: rgba(161, 161, 170, 0.36);
     --wave-area-stop-top: rgba(255, 255, 255, 0.34);
     --wave-area-stop-mid: rgba(161, 161, 170, 0.12);
     --wave-area-stop-bot: rgba(7, 7, 9, 0.0);
     --wave-orb-fill: #ffffff;
     --wave-orb-ring: #e4e4e7;
   }

   /* THEME 3: TRẮNG CAM (Solar Amber Wave — Tương phản cao, sắc cam hổ phách rực rỡ nổi bật hẳn trên nền kem ấm) */
   html[data-theme="orange"],
   html[data-theme="white-orange"] {
     --wave-chamber-bg:
       radial-gradient(120% 90% at var(--slider-pct, 84%) 65%, rgba(249, 115, 22, 0.25) 0%, transparent 65%),
       linear-gradient(180deg, #fff9f2 0%, #ffedd5 58%, #fed7aa 100%);
     --wave-grid-line: rgba(194, 65, 12, 0.08);
     --wave-primary-stroke: #ea580c;
     --wave-primary-glow-color: rgba(249, 115, 22, 0.75);
     --wave-secondary-stroke: rgba(234, 88, 12, 0.62);
     --wave-tertiary-stroke: rgba(251, 146, 60, 0.45);
     --wave-area-stop-top: rgba(249, 115, 22, 0.44);
     --wave-area-stop-mid: rgba(251, 146, 60, 0.20);
     --wave-area-stop-bot: rgba(255, 237, 213, 0.0);
     --wave-orb-fill: #ffffff;
     --wave-orb-ring: #ea580c;
   }
   ```

---

### 4. Nghiên Cứu & Thiết Kế Lại 2 Mức Threshold Chuyển Theme (`33.5%` & `66.5%`) Thành "Cổng Pha Tinh Thể Quang Học (Crystal Phase Gates)" Sang Trọng (`image_85553f.png`)

#### 🔍 Hiện trạng (`image_85553f.png` & `image_9122c6.png`):
- Hiện tại, 2 điểm ngưỡng chuyển theme (`33.5%` và `66.5%`) chỉ là 2 vạch kẻ dọc đơn điệu (`|`) thò xuống dưới thanh trượt, nhìn thô và lạc lõng.

#### 🛠️ Thiết kế mới: Hệ Thống "Cổng Pha Tinh Thể (Crystal Phase Gates)" Đồng Bộ Với 3 Vùng Quang Phổ:

1. **Cấu trúc HTML của Khu Vực Thanh Trượt Sóng (`.energy-slider-assembly` trong `index.html`)**:
   - Đặt thanh `<input type="range" id="theme-energy-slider">` nằm trong một rãnh `.energy-slider-track-wrap` có chứa **2 Cổng Pha Tinh Thể (`.energy-phase-gate`) tại đúng vị trí `left: 33.5%` và `left: 66.5%`**:
     ```html
     <div class="energy-slider-track-wrap" style="position: relative; display: flex; align-items: center; height: 38px; margin: 6px 0 10px 0;">
       <!-- Thanh kéo sóng -->
       <input type="range" id="theme-energy-slider" class="theme-energy-slider" min="0" max="100" step="1" value="18"
              oninput="App.onThemeEnergySliderInput(this.value)"
              onchange="App.onThemeEnergySliderCommit(this.value)"
              aria-label="Điều chỉnh bước sóng năng lượng giao diện">

       <!-- Cổng Pha 1 (33.5%: Ranh giới Tím Hồng <-> Trắng Đen) -->
       <div class="energy-phase-gate" id="phase-gate-1" style="left: 33.5%;" title="Ngưỡng chuyển pha I (33.5%): Tím Hồng ↔ Trắng Đen">
         <span class="phase-gate-notch top"></span>
         <span class="phase-gate-diamond"><span class="phase-gate-core"></span></span>
         <span class="phase-gate-notch bottom"></span>
       </div>

       <!-- Cổng Pha 2 (66.5%: Ranh giới Trắng Đen <-> Trắng Cam) -->
       <div class="energy-phase-gate" id="phase-gate-2" style="left: 66.5%;" title="Ngưỡng chuyển pha II (66.5%): Trắng Đen ↔ Trắng Cam">
         <span class="phase-gate-notch top"></span>
         <span class="phase-gate-diamond"><span class="phase-gate-core"></span></span>
         <span class="phase-gate-notch bottom"></span>
       </div>
     </div>
     ```

2. **Thiết kế CSS cho `.energy-phase-gate` (Tinh thể hình thoi xoay 45° có nhân phát sáng khi vượt ngưỡng, tuyệt đối không dùng vạch kẻ dọc thô kệch)**:
   ```css
   /* ==========================================================================
      4. CỔNG PHA TINH THỂ CHUYỂN THEME (CRYSTAL PHASE GATES AT 33.5% & 66.5%)
      ========================================================================== */

   /* Ẩn hoàn toàn các vạch dọc cũ nếu có */
   html body .threshold-tick,
   html body .energy-threshold-line,
   html body .wave-slider-tick {
     display: none !important;
   }

   html body .energy-slider-track-wrap {
     position: relative !important;
     display: flex !important;
     align-items: center !important;
     width: 100% !important;
     height: 36px !important;
     margin: 4px 0 10px 0 !important;
   }

   html body .energy-phase-gate {
     position: absolute !important;
     top: 50% !important;
     transform: translate(-50%, -50%) !important;
     display: flex !important;
     flex-direction: column !important;
     align-items: center !important;
     justify-content: center !important;
     gap: 3px !important;
     pointer-events: none !important;
     z-index: 3 !important;
   }

   /* Khung thoi tinh thể xoay 45 độ ôm lấy rãnh trượt */
   html body .energy-phase-gate .phase-gate-diamond {
     width: 14px !important;
     height: 14px !important;
     border-radius: 4px !important;
     transform: rotate(45deg) !important;
     background: var(--bg-surface-elevated, rgba(24, 24, 32, 0.92)) !important;
     border: 1.5px solid rgba(255, 255, 255, 0.28) !important;
     box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
     display: flex !important;
     align-items: center !important;
     justify-content: center !important;
     transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
   }

   html[data-theme="orange"] .energy-phase-gate .phase-gate-diamond,
   html[data-theme="white-orange"] .energy-phase-gate .phase-gate-diamond {
     background: #fff7ed !important;
     border-color: rgba(234, 88, 12, 0.38) !important;
     box-shadow: 0 2px 6px rgba(154, 52, 18, 0.14), inset 0 1px 1px #ffffff !important;
   }

   /* Nhân tinh thể bên trong */
   html body .energy-phase-gate .phase-gate-core {
     width: 5px !important;
     height: 5px !important;
     border-radius: 1.5px !important;
     background: rgba(255, 255, 255, 0.25) !important;
     transition: all 0.25s ease !important;
   }

   html[data-theme="orange"] .energy-phase-gate .phase-gate-core,
   html[data-theme="white-orange"] .energy-phase-gate .phase-gate-core {
     background: rgba(234, 88, 12, 0.28) !important;
   }

   /* Hai dấu ngắm vi mô đối xứng trên-dưới tinh thể */
   html body .energy-phase-gate .phase-gate-notch {
     width: 2px !important;
     height: 4px !important;
     border-radius: 999px !important;
     background: rgba(255, 255, 255, 0.22) !important;
     transition: all 0.25s ease !important;
   }

   html[data-theme="orange"] .energy-phase-gate .phase-gate-notch,
   html[data-theme="white-orange"] .energy-phase-gate .phase-gate-notch {
     background: rgba(234, 88, 12, 0.30) !important;
   }

   /* Trạng thái KÍCH HOẠT (.is-passed) khi thanh kéo đã vượt qua cổng pha (val >= 33.5% hoặc val >= 66.5%) */
   html body .energy-phase-gate.is-passed .phase-gate-diamond {
     border-color: var(--range-active-color) !important;
     box-shadow: 0 0 12px var(--range-active-glow), 0 2px 6px rgba(0, 0, 0, 0.3) !important;
     transform: rotate(45deg) scale(1.08) !important;
   }

   html body .energy-phase-gate.is-passed .phase-gate-core {
     background: var(--range-active-color) !important;
     box-shadow: 0 0 6px var(--range-active-glow) !important;
   }

   html body .energy-phase-gate.is-passed .phase-gate-notch {
     background: var(--range-active-color) !important;
     height: 5px !important;
   }

   /* Nâng z-index của nút tròn đang kéo (Thumb) lên trên Cổng Tinh Thể để lướt qua mượt mà */
   html body #theme-energy-slider::-webkit-slider-thumb {
     position: relative !important;
     z-index: 5 !important;
   }
   ```

3. **Cập nhật trạng thái `.is-passed` của 2 Cổng Pha trong `_updateEnergyWaveVisuals(val)` (`js/app.js`)**:
   ```javascript
   const gate1 = document.getElementById('phase-gate-1');
   const gate2 = document.getElementById('phase-gate-2');
   if (gate1) gate1.classList.toggle('is-passed', numericVal >= 33.5);
   if (gate2) gate2.classList.toggle('is-passed', numericVal >= 66.5);
   ```

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST — `promt1u.md`)

- [ ] **1. Sidebar cố định tuyệt đối khi cuộn trang (`position: fixed !important`):** Khi cuộn xuống ở bất kỳ tab nào (`Tổng quan`, `Thư viện thẻ`, `Ngân hàng câu hỏi`, `Cài đặt`), thanh Sidebar luôn bám cố định theo màn hình (`top: 14px; bottom: 14px; left: 14px;`), không bao giờ bị trôi hay kẹt lại ở đầu trang như `image_855561.jpg`.
- [ ] **2. Layout toàn trang căn giữa cân đối 100% (Không bị đẩy lệch phải):** Nhờ `.app-sidebar` là `position: fixed !important` và `.app-container` là `display: block !important`, `.app-main` không còn bị cộng dồn khoảng cách kép; toàn bộ các thẻ ở Trang chủ (`image_854d3d.jpg`) và Thư viện thẻ (`image_855561.jpg`) nằm chính giữa vùng màn hình chính với khoảng cách lề trái/phải cân xứng hoàn hảo.
- [ ] **3. Buồng Sóng Ánh Sáng đẳng cấp & sắc nét ở cả 3 Theme (`image_85553f.png`):** Sóng có độ phân giải mịn (`160` điểm mẫu), bó sóng hội tụ năng lượng (Gaussian Wave Packet) dâng cao tại đúng vị trí nút kéo kèm Hạt Quang Năng (`#wave-cursor-orb`) cưỡi trên đỉnh sóng và độ tương phản cao rõ nét trên cả nền sáng `Trắng Cam` lẫn nền tối `Tím Hồng` / `Trắng Đen`.
- [ ] **4. Hai Cổng Ngưỡng Chuyển Theme (`33.5%` & `66.5%`):** Thay thế hoàn toàn 2 vạch kẻ dọc đơn điệu bằng 2 Cổng Pha Tinh Thể hình thoi (`.energy-phase-gate`) tự động phát sáng nhân tinh thể (`.is-passed`) khi kéo vượt qua ngưỡng.
- [ ] **5. Cập nhật lại `ARCHITECTURE_GRAPH.md` (và `docs/ARCHITECTURE_GRAPH.md`), chạy `npm test` và `npm run build` đạt 100% PASS.**
