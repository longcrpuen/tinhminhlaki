# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1O — SÓNG NĂNG LƯỢNG KÉO TỰ DO & CHUYỂN CẢNH THEO NGƯỠNG, SỬA DROPDOWN ĐỔI NHẠC LOFI, CHUẨN HÓA POPUP LIQUID GLASS 3 THEME, ĐỔI MÀU LATEX ĐÁP ÁN ĐÚNG FLASHCARD LIGHT MODE, ĐỒNG BỘ MẪU ĐỊNH DẠNG LMS, THIẾT KẾ LẠI CHÂN MOBILE VỚI LỚP NỀN TĨNH DƯỚI STROKE & TỐI ƯU TOÀN DIỆN MOBILE XOAY NGANG (`promt1o.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1o` (Nối tiếp sau `1a` -> `1n`)
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **7 vấn đề kỹ thuật & trải nghiệm người dùng** vừa phát hiện sau đợt `1n`, đồng thời cập nhật lại `docs/ARCHITECTURE_GRAPH.md` (và `ARCHITECTURE_GRAPH.md` ở thư mục gốc).
> * **Ràng buộc An toàn (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn tuyệt đối 100% dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **Không làm hỏng các phần đã ổn định ở đợt `1n`:** Giữ nguyên các bản vá chống tràn LaTeX, tự giãn chiều cao Flashcard, 4 ô trạng thái chữ nhật, và quy luật ánh sáng định hướng `135deg`.
>   3. **100% Test & Build Pass:** Vượt qua toàn bộ `npm test` và `npm run build`.

---

## PHẦN 1: CHI TIẾT 7 HẠNG MỤC SỬA LỖI & NÂNG CẤP TRONG `promt1o.md`

### 1. Tối Ưu Hóa Buồng Sóng Năng Lượng Trong `#view-settings`: Kéo Tự Do Mượt Mà (`0 -> 100`), Sóng Biến Đổi Hình Thái Liên Tục, Tách Nền Chữ Rõ Nét & Chỉ Đổi Theme + Chuyển Cảnh Khi Vượt Ngưỡng (Threshold)
- **Hiện trạng & Nguyên nhân**:
  1. **Tương phản chữ kém, chữ bị rối**: Dòng chữ tiêu đề (`RESONANCE // ...`, `Tím Hồng...`) đang đè trực tiếp lên các đường sóng SVG phía sau, làm nét chữ và nét sóng cắt nhau gây rối mắt, khó đọc.
  2. **Cảm giác kéo bị gượng (3 mức cứng)**: Thanh trượt đang tự nhảy/ép về 3 vị trí cố định hoặc đổi theme giật cục ngay khi vừa chạm mà không có sự biến đổi hình học của sóng dẫn dắt đến ngưỡng (Threshold).
- **Giải pháp toàn diện (HTML + CSS + JS)**:
  1. **Tách biệt hoàn toàn Khu vực Chữ (Header Bar) và Khu vực Sóng (Wave Canvas) + Tăng tương phản chữ tuyệt đối**:
     - Đưa `.energy-wave-hud` lên làm một **Thanh Header Kính Mờ Độc Lập ở phía trên buồng sóng** (hoặc bọc trong một tấm Pill Scrim nền đục `backdrop-filter: blur(16px)` có viền rõ nét), và đẩy đường sóng SVG xuống nửa dưới của buồng kính (`y = 55..125`). Đường sóng **không bao giờ cắt ngang qua chữ**!
     - Đồng bộ màu chữ `.energy-wave-title` và `.energy-wave-badge` đạt chuẩn tương phản AAA trên cả 3 mode (chữ trắng `#ffffff` trên nền pill tối `rgba(12, 10, 22, 0.78)` ở Dark Mode; chữ đen than `#1c1917` trên nền pill trắng `rgba(255, 255, 255, 0.90)` ở Mode Trắng Cam).
  2. **Kéo tự do liên tục (`min="0" max="100" step="0.5"`) — KHÔNG ép nhảy về 3 nấc cố định khi thả tay**:
     - Con trượt `#theme-energy-slider` nằm ở đâu khi người dùng dừng kéo thì **giữ nguyên ở đúng vị trí đó** (như một thanh điều chỉnh tần số analog thực thụ), tuyệt đối không giật ngược về `12 / 50 / 88`!
     - Vạch chia 2 ngưỡng chuyển pha (**Threshold 1 tại `33.5%`** và **Threshold 2 tại `66.5%`**) được hiển thị rõ trên rãnh trượt để người dùng nhìn thấy điểm kích hoạt.
  3. **Biến đổi hình thái sóng (Wave Morphing) liên tục theo từng `1%` kéo & Kích hoạt Chuyển Cảnh Sóng (Theme Wave Transition) khi vượt ngưỡng**:
     - Trong lúc người dùng đang kéo (`oninput="App.onThemeEnergySliderInput(this.value)"`):
       - **Mọi vị trí từ `0` đến `100` đều làm biến đổi trực tiếp phương trình sóng SVG (`d="M 0 ..."`):**
         - Ở vùng `0 -> 33.5`: Sóng là **Sóng Sine Mộng Mơ (2 đỉnh sóng dài uốn lượn mềm mại)**, biên độ và pha sóng dịch chuyển mượt theo ngón tay.
         - Khi kéo tiến gần đến ngưỡng `33.5` và sang vùng `33.5 -> 66.5`: Sóng **nén tần số lại thành Sóng Giao Thoa Bậc Cao (4 đỉnh sóng sắc lạnh kiểu Oscilloscope)**, màu sóng chuyển mượt sang Trắng Bạc.
         - Khi kéo tiến gần đến ngưỡng `66.5` và sang vùng `66.5 -> 100`: Sóng **bùng nổ biên độ thành Sóng Năng Lượng Mặt Trời (6 đỉnh sóng cộng hưởng rực rỡ)**, màu sóng chuyển sang Cam Hổ Phách!
       - **Cơ chế Ngưỡng Chuyển Cảnh (Threshold Trigger + Screen Wave Transition)**:
         - Lưu `this._currentEnergyZone` (`'purple-pink'` nếu `< 33.5`, `'monochrome'` nếu `33.5..66.5`, `'white-orange'` nếu `> 66.5`).
         - Khi đang kéo trong cùng 1 vùng, chỉ có hình dạng sóng biến đổi mượt mà theo tay kéo.
         - **Ngay khoảnh khắc con trượt VƯỢT QUA NGƯỠNG (`33.5` hoặc `66.5`) sang vùng mới**:
           1. Kích hoạt hiệu ứng **Chuyển Cảnh Lan Tỏa Sóng Năng Lượng toàn màn hình (`this.triggerThemeWaveTransition(targetTheme)`)**: Tạo một lớp sóng ánh sáng mượt (`#theme-transition-ripple`) lan tỏa từ buồng năng lượng ra toàn màn hình trong `380ms` (`cubic-bezier(0.22, 1, 0.36, 1)`) đồng thời đổi sang theme mới (`this.setTheme(targetTheme, { fromEnergySlider: true })`)!
           2. Không ghi đè lại `slider.value` khi `setTheme` được gọi từ chính thanh trượt (`options.fromEnergySlider === true`), để con trượt đi theo tay người dùng mượt 100%!

  - **Mã JS chuẩn cho `js/app.js`**:
    ```javascript
    onThemeEnergySliderInput(rawVal) {
      const val = parseFloat(rawVal) || 0;
      this._updateEnergyWaveVisuals(val);

      // Xác định vùng năng lượng theo 2 ngưỡng Threshold: 33.5% và 66.5%
      const targetTheme = val < 33.5 ? 'purple-pink' : (val <= 66.5 ? 'monochrome' : 'white-orange');
      if (!this._lastEnergyZone) {
        this._lastEnergyZone = document.documentElement.getAttribute('data-theme') || 'purple-pink';
        if (this._lastEnergyZone === 'dark') this._lastEnergyZone = 'purple-pink';
      }

      // Chỉ khi kéo VƯỢT QUA NGƯỠNG sang vùng theme khác mới kích hoạt chuyển cảnh & đổi theme!
      if (targetTheme !== this._lastEnergyZone) {
        this._lastEnergyZone = targetTheme;
        this.triggerThemeWaveTransition(targetTheme);
        this.setTheme(targetTheme, { fromEnergySlider: true });
      }
    },

    onThemeEnergySliderCommit(rawVal) {
      // Giữ nguyên vị trí con trượt tự nhiên nơi người dùng thả tay, chỉ lưu lại vào localStorage
      const val = parseFloat(rawVal) || 0;
      localStorage.setItem('tinhminhlakey_energy_slider_val', String(val));
      this._updateEnergyWaveVisuals(val);
    },

    selectThemeViaEnergyWave(themeName) {
      const targetVal = themeName === 'purple-pink' ? 16 : (themeName === 'monochrome' ? 50 : 84);
      const slider = document.getElementById('theme-energy-slider');
      const startVal = slider ? parseFloat(slider.value) || 0 : targetVal;
      this._lastEnergyZone = themeName;
      this.triggerThemeWaveTransition(themeName);
      this.setTheme(themeName, { fromEnergySlider: true });
      localStorage.setItem('tinhminhlakey_energy_slider_val', String(targetVal));

      // Hoạt ảnh lướt con trượt & biến đổi sóng mượt mà tới vùng đã chọn
      const duration = 320;
      const startTime = performance.now();
      const animateSlider = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = startVal + (targetVal - startVal) * eased;
        if (slider) slider.value = String(cur);
        this._updateEnergyWaveVisuals(cur);
        if (t < 1) requestAnimationFrame(animateSlider);
      };
      requestAnimationFrame(animateSlider);
    },

    _updateEnergyWaveVisuals(val) {
      const pct = Math.max(0, Math.min(100, parseFloat(val) || 0));
      const t = pct / 100; // 0.0 -> 1.0

      // 1. Biến đổi hình thái sóng liên tục (Frequency, Amplitude & Phase Morphing)
      const mainPath = document.getElementById('energy-wave-main-path');
      const harmPath = document.getElementById('energy-wave-harmonic-path');
      const bgPath = document.getElementById('energy-wave-bg-path');

      if (mainPath && harmPath && bgPath) {
        // Tần số tăng dần từ 2.2 chu kỳ (mộng mơ) -> 4.0 chu kỳ (tối giản) -> 6.0 chu kỳ (năng lượng cao)
        const cycles = 2.2 + t * 3.8;
        const phase = t * Math.PI * 4.5;
        const ampMain = 22 + Math.sin(t * Math.PI) * 8 + (t > 0.665 ? 8 : 0);
        const baseY = 82; // Đặt ở nửa dưới buồng kính để KHÔNG BAO GIỜ chạm vào chữ ở trên!
        const width = 900;
        const steps = 60;

        let dMain = '';
        let dHarm = '';
        let dBg = '';

        for (let i = 0; i <= steps; i++) {
          const ratio = i / steps;
          const x = (ratio * width).toFixed(1);
          const angle = ratio * cycles * Math.PI * 2 + phase;
          // Pha trộn sóng cơ bản và sóng hài bậc 2, bậc 3 theo vị trí kéo t
          const yMain = (
            baseY +
            Math.sin(angle) * ampMain * (0.75 + 0.25 * Math.cos(ratio * Math.PI)) +
            Math.cos(angle * 1.5 - phase * 0.6) * (t * 9)
          ).toFixed(1);

          const yHarm = (
            baseY -
            Math.sin(angle * 1.25 - 0.8) * (ampMain * 0.72) +
            Math.sin(angle * 2.5) * (t * 6)
          ).toFixed(1);

          const yBg = (
            baseY +
            Math.cos(angle * 0.8 + 0.5) * (ampMain * 0.65)
          ).toFixed(1);

          const cmd = i === 0 ? 'M' : 'L';
          dMain += `${cmd} ${x} ${yMain} `;
          dHarm += `${cmd} ${x} ${yHarm} `;
          dBg += `${cmd} ${x} ${yBg} `;
        }
        dBg += `L ${width} 135 L 0 135 Z`;

        mainPath.setAttribute('d', dMain.trim());
        harmPath.setAttribute('d', dHarm.trim());
        bgPath.setAttribute('d', dBg.trim());
      }

      // 2. Nội suy màu sắc sóng mượt mà theo vùng và cập nhật HUD
      const stop1 = document.getElementById('ew-stop-1');
      const stop2 = document.getElementById('ew-stop-2');
      const stop3 = document.getElementById('ew-stop-3');
      const areaTop = document.getElementById('ew-area-top');
      const badgeEl = document.getElementById('energy-wave-mode-badge');
      const titleEl = document.getElementById('energy-wave-mode-title');

      if (pct < 33.5) {
        if (stop1) stop1.setAttribute('stop-color', '#a855f7');
        if (stop2) stop2.setAttribute('stop-color', '#ec4899');
        if (stop3) stop3.setAttribute('stop-color', '#f472b6');
        if (areaTop) areaTop.setAttribute('stop-color', '#c084fc');
        if (badgeEl) badgeEl.textContent = `NEBULA WAVE // ${Math.round(pct)}%`;
        if (titleEl) titleEl.textContent = 'Tím Hồng (Dreamy Liquid Glass)';
      } else if (pct <= 66.5) {
        if (stop1) stop1.setAttribute('stop-color', '#71717a');
        if (stop2) stop2.setAttribute('stop-color', '#e4e4e7');
        if (stop3) stop3.setAttribute('stop-color', '#ffffff');
        if (areaTop) areaTop.setAttribute('stop-color', '#ffffff');
        if (badgeEl) badgeEl.textContent = `CYBER NOIR // ${Math.round(pct)}%`;
        if (titleEl) titleEl.textContent = 'Trắng Đen (Monochrome Eclipse)';
      } else {
        if (stop1) stop1.setAttribute('stop-color', '#fb923c');
        if (stop2) stop2.setAttribute('stop-color', '#f97316');
        if (stop3) stop3.setAttribute('stop-color', '#ea580c');
        if (areaTop) areaTop.setAttribute('stop-color', '#f97316');
        if (badgeEl) badgeEl.textContent = `SOLAR FLARE // ${Math.round(pct)}%`;
        if (titleEl) titleEl.textContent = 'Trắng Cam (Warm Solar Glass)';
      }

      // Đánh dấu nút mốc tương ứng
      const activeZone = pct < 33.5 ? 'purple-pink' : (pct <= 66.5 ? 'monochrome' : 'white-orange');
      document.querySelectorAll('.energy-node-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-opt') === activeZone);
      });
    },

    triggerThemeWaveTransition(targetTheme) {
      let ripple = document.getElementById('theme-wave-transition-overlay');
      if (!ripple) {
        ripple = document.createElement('div');
        ripple.id = 'theme-wave-transition-overlay';
        document.body.appendChild(ripple);
      }
      const glowColor =
        targetTheme === 'white-orange'
          ? 'rgba(255, 148, 77, 0.32)'
          : targetTheme === 'monochrome'
          ? 'rgba(255, 255, 255, 0.22)'
          : 'rgba(192, 132, 252, 0.32)';
      ripple.style.setProperty('--wave-transition-color', glowColor);
      ripple.classList.remove('active');
      void ripple.offsetWidth; // Force reflow nhẹ trên 1 phần tử rỗng để kích hoạt lại animation
      ripple.classList.add('active');
      clearTimeout(this._waveTransTimer);
      this._waveTransTimer = setTimeout(() => {
        ripple.classList.remove('active');
      }, 420);
    }
    ```
  - **CSS cho `.energy-wave-hud` (tương phản cao, không đè sóng), Vạch Ngưỡng `33.5% / 66.5%` và `#theme-wave-transition-overlay`**:
    ```css
    .energy-wave-stage {
      position: relative !important;
      height: 136px !important;
      border-radius: 18px !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
      padding: 12px 16px !important;
    }

    /* Hộp chữ nằm gọn ở tầng trên cùng, có lớp đệm kính mờ bảo vệ tương phản 100%, không bị sóng cắt ngang chữ */
    .energy-wave-hud {
      position: relative !important;
      z-index: 3 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      width: 100% !important;
      padding: 6px 12px !important;
      border-radius: 10px !important;
      background: rgba(12, 10, 22, 0.72) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      pointer-events: none !important;
    }

    html[data-theme="white-orange"] .energy-wave-hud {
      background: rgba(255, 252, 248, 0.88) !important;
      border: 1px solid rgba(234, 88, 12, 0.25) !important;
    }

    .energy-wave-title {
      font-size: 0.92rem !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
    }

    html[data-theme="white-orange"] .energy-wave-title {
      color: #1c1917 !important;
      text-shadow: none !important;
    }

    .energy-wave-badge {
      font-family: var(--font-mono, monospace) !important;
      font-size: 0.72rem !important;
      font-weight: 700 !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      background: rgba(255, 255, 255, 0.12) !important;
      color: var(--accent) !important;
    }

    html[data-theme="white-orange"] .energy-wave-badge {
      background: rgba(234, 88, 12, 0.14) !important;
      color: #ea580c !important;
    }

    /* Vạch đánh dấu 2 ngưỡng Threshold (33.5% và 66.5%) trên rãnh trượt */
    .energy-slider-control-wrap {
      position: relative !important;
      padding-top: 10px !important;
    }
    .energy-slider-control-wrap::before,
    .energy-slider-control-wrap::after {
      content: '' !important;
      position: absolute !important;
      top: 6px !important;
      width: 2px !important;
      height: 16px !important;
      background: rgba(255, 255, 255, 0.45) !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 2 !important;
    }
    .energy-slider-control-wrap::before { left: 33.5% !important; }
    .energy-slider-control-wrap::after  { left: 66.5% !important; }
    html[data-theme="white-orange"] .energy-slider-control-wrap::before,
    html[data-theme="white-orange"] .energy-slider-control-wrap::after {
      background: rgba(234, 88, 12, 0.45) !important;
    }

    /* Lớp sóng lan tỏa toàn màn hình khi vượt ngưỡng đổi Theme */
    #theme-wave-transition-overlay {
      position: fixed !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: 9999 !important;
      opacity: 0;
      background: radial-gradient(circle at 50% 50%, var(--wave-transition-color, rgba(192, 132, 252, 0.3)), transparent 75%);
    }
    #theme-wave-transition-overlay.active {
      animation: themeWavePulse 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    @keyframes themeWavePulse {
      0%   { opacity: 0; transform: scale(0.85); }
      40%  { opacity: 1; }
      100% { opacity: 0; transform: scale(1.35); }
    }
    ```

---

### 2. Sửa Triệt Để Lỗi Chọn Bài Nhạc / Đổi Bài Hát Trong Dropdown Lofi (`js/lofi-music.js` & `js/app.js`)
- **Hiện trạng lỗi**: Trong tab `Cài đặt`, bấm vào Dropdown chọn bài nhạc Lofi thì hiện ra danh sách bài hát, nhưng bấm chọn 1 bài thì **không đổi được bài nhạc**!
- **Nguyên nhân gốc rễ**:
  1. Khi bấm vào `<button class="cyber-dropdown-item">` trong `#lofi-track-dropdown-menu`, sự kiện click bị listener đóng dropdown toàn cục can thiệp hoặc hàm `LofiPlayer.selectTrack(...)` chỉ gán lại biến chỉ số mà **chưa dừng bộ phát Procedural / Audio hiện tại và khởi chạy lại luồng âm thanh mới**!
  2. Hoặc tham số truyền vào `selectTrack(indexOrId)` là chuỗi ID/tên bài trong khi mảng `this.tracks` tra cứu bằng số nguyên `index` (dẫn đến `this.tracks[index]` bị `undefined` nên hàm `return` sớm!).
- **Giải pháp bắt buộc trong `js/lofi-music.js`**:
  - Viết lại hàm `selectTrack(trackKey, event)` và hàm render menu `#lofi-track-dropdown-menu` để xử lý chính xác 100% mọi trường hợp:
    ```javascript
    selectTrack(trackKey, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const allTracks = this.getAllTracks ? this.getAllTracks() : (this.tracks || []);
      if (!allTracks.length) return;

      // Hỗ trợ cả truyền vào index số (0, 1, 2...), chuỗi số ("0", "1"), hoặc id / title của bài nhạc
      let resolvedIdx = -1;
      if (typeof trackKey === 'number' && trackKey >= 0 && trackKey < allTracks.length) {
        resolvedIdx = trackKey;
      } else if (typeof trackKey === 'string' && /^\d+$/.test(trackKey.trim())) {
        const parsed = parseInt(trackKey.trim(), 10);
        if (parsed >= 0 && parsed < allTracks.length) resolvedIdx = parsed;
      }
      if (resolvedIdx === -1) {
        resolvedIdx = allTracks.findIndex(
          (t, i) => String(t.id) === String(trackKey) || String(t.title) === String(trackKey) || i === trackKey
        );
      }
      if (resolvedIdx === -1) resolvedIdx = 0;

      // 1. Dừng ngay lập tức bài nhạc đang phát (cả Procedural WebAudio lẫn thẻ <audio>)
      const wasPlaying = this.isPlaying;
      this.stop(); // Đảm bảo ngắt hết timer/oscillator cũ và pause audioElement

      // 2. Cập nhật index bài nhạc mới & lưu vào localStorage
      this.currentIndex = resolvedIdx;
      this.currentTrackIndex = resolvedIdx;
      localStorage.setItem('tinhminhlakey_lofi_track_idx', String(resolvedIdx));

      // 3. Phát ngay bài nhạc mới vừa chọn!
      this.play();

      // 4. Cập nhật toàn bộ nhãn tên bài hát trên Trang chủ + trong Cài đặt + đóng Dropdown
      this.updateUI();
      const wrap = document.getElementById('lofi-track-dropdown-wrap');
      if (wrap) wrap.classList.remove('open');
      const menu = document.getElementById('lofi-track-dropdown-menu');
      if (menu) menu.classList.remove('open', 'show');
    }
    ```
  - Khi render các mục trong `#lofi-track-dropdown-menu`, gắn trực tiếp:
    ```html
    <button type="button" class="cyber-dropdown-item ${i === currentIdx ? 'active' : ''}"
            onclick="LofiPlayer.selectTrack(${i}, event)">
      <span>${track.title}</span>
    </button>
    ```
  - Kiểm tra cả nút **Đổi bài tiếp theo (`LofiPlayer.nextTrack()`)** ở thanh `.hero-lofi-bar` dưới Quote để đảm bảo nó gọi `this.selectTrack((this.currentIndex + 1) % allTracks.length)`.

---

### 3. Sửa Toàn Bộ Hệ Thống Popup (`.modal-box`) Trên Cả 3 Theme: Lấy Mẫu Kính Đang Hiển Thị Ở 2 Mode Kia Chuyển Qua Tím, Và Thiết Kế Chuẩn Liquid Glass Cho Trắng Đen & Trắng Cam
- **Giải phẫu chính xác nguyên nhân lỗi Popup vừa xảy ra**:
  1. Ở đợt `1n`, trong `:root, html, body, html[data-theme="dark"], html[data-theme="purple-pink"]` có khai báo biến `--popup-glass-volume-bg: linear-gradient(145deg, rgba(64, 48, 98, 0.56) 0%, rgba(32, 22, 54, 0.46) 55%, rgba(44, 30, 74, 0.52) 100%)` trực tiếp trên thẻ **`body`**.
  2. Vì `body` là thẻ con của `html`, giá trị `--popup-glass-volume-bg` trên `body` đã **đè lên** giá trị khai báo trên `html[data-theme="monochrome"]` và `html[data-theme="white-orange"]`! Do đó, khi người dùng chuyển sang `Trắng Đen` và `Trắng Cam`, `.modal-box` lại hiển thị đúng khối kính tím trong suốt tuyệt đẹp đó!
  3. Trong khi đó, khi người dùng ở `Tím Hồng` (`purple-pink`), một rule `.modal-content` / `.modal-box` đặc xịt từ đợt `1m` (`rgba(22, 10, 42, 0.86)`) lại đè lên làm Popup của Tím Hồng bị tối đục và xấu!
- **Giải pháp thực thi chính xác 100% theo đúng yêu cầu của người dùng**:
  1. **XÓA SẠCH** mọi rule `.modal-box` / `.modal-content` riêng lẻ từ đợt `1m` đang làm tối đục Popup của Mode Tím Hồng!
  2. **Chuyển nguyên vẹn công thức kính trong suốt tuyệt đẹp kia sang cho Mode Tím Hồng (`purple-pink` / `dark`)**.
  3. **Không khai báo biến `--popup-glass-*` trên thẻ `body` chung nữa**, mà khai báo đồng cấp trên `html[data-theme="..."]` VÀ gắn trực tiếp lên `html[data-theme="..."] .modal-box` để:
     - **Mode Tím Hồng (`purple-pink` / `dark`)**: Giữ đúng 100% cái Popup kính tím khói trong suốt mà Trắng Đen & Trắng Cam vừa lấy nhầm (vì cái đó nhìn cực kỳ đẹp và chuẩn Liquid Glass!).
     - **Mode Trắng Đen (`monochrome`)**: Cùng độ trong suốt (`alpha 0.54 -> 0.44`), cùng `backdrop-filter: blur(28px) saturate(190%) brightness(1.08)`, cùng gờ khúc xạ ánh sáng định hướng `135deg`, nhưng mang **sắc Khói Bạc Noir thuần khiết (`rgba(48, 48, 56, 0.54)` -> `rgba(22, 22, 26, 0.44)` — 0% ánh tím!)**.
     - **Mode Trắng Cam (`white-orange`)**: Cùng cấu trúc khúc xạ Liquid Glass và gờ sáng `135deg`, mang **sắc Kính Trắng Kem Sữa Ấm trong trẻo (`rgba(255, 252, 248, 0.62)` -> `rgba(255, 240, 226, 0.48)`)** với gờ phản quang trắng tinh khiết + ánh cam dịu ở cạnh dưới!
- **Đoạn CSS chuẩn đặt ở cuối `css/theme.css` và `css/style.css`**:
  ```css
  /* ==========================================================================
     3. HỆ THỐNG POPUP LIQUID GLASS CHUẨN CHỈ CHO CẢ 3 THEME (KHÔNG LẪN MÀU!)
     ========================================================================== */

  .modal-overlay {
    background: rgba(0, 0, 0, 0.22) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Cấu trúc dùng chung cho mọi Popup (.modal-box & .confirm-dialog-box) */
  .modal-overlay .modal-box,
  .modal-box,
  .confirm-dialog-box {
    position: relative !important;
    border-radius: 32px !important;
    backdrop-filter: blur(28px) saturate(210%) brightness(1.08) !important;
    -webkit-backdrop-filter: blur(28px) saturate(210%) brightness(1.08) !important;
    overflow: hidden !important;
  }

  /* 1. MODE TÍM HỒNG (Lấy đúng mẫu kính trong suốt tuyệt đẹp đang hiện ở 2 mode kia áp vào Tím Hồng!) */
  :root .modal-box,
  html[data-theme="dark"] .modal-box,
  html[data-theme="purple-pink"] .modal-box,
  body[data-theme="purple-pink"] .modal-box {
    background: linear-gradient(
      145deg,
      rgba(64, 48, 98, 0.56) 0%,
      rgba(32, 22, 54, 0.46) 55%,
      rgba(44, 30, 74, 0.52) 100%
    ) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.44) !important;
    border-left: 1px solid rgba(233, 213, 255, 0.32) !important;
    border-right: 1px solid rgba(233, 213, 255, 0.10) !important;
    border-bottom: 1px solid rgba(216, 180, 254, 0.22) !important;
    box-shadow:
      inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.68),
      inset -1px -1.5px 2px rgba(216, 180, 254, 0.28),
      inset 0 18px 36px -12px rgba(255, 255, 255, 0.14),
      0 32px 72px -12px rgba(4, 2, 10, 0.78) !important;
  }

  /* 2. MODE TRẮNG ĐEN (100% Kính Khói Bạc Noir Liquid Glass — Không dính 1 giọt màu tím nào!) */
  html[data-theme="monochrome"] .modal-box,
  body[data-theme="monochrome"] .modal-box {
    background: linear-gradient(
      145deg,
      rgba(54, 54, 62, 0.56) 0%,
      rgba(22, 22, 26, 0.46) 55%,
      rgba(36, 36, 42, 0.52) 100%
    ) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.48) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.34) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.10) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.22) !important;
    box-shadow:
      inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.74),
      inset -1px -1.5px 2px rgba(255, 255, 255, 0.22),
      inset 0 18px 36px -12px rgba(255, 255, 255, 0.14),
      0 32px 72px -12px rgba(0, 0, 0, 0.84) !important;
  }

  /* 3. MODE TRẮNG CAM (100% Kính Trắng Kem Sữa Ấm Liquid Glass — Trong trẻo, chữ nâu đen sắc nét!) */
  html[data-theme="white-orange"] .modal-box,
  body[data-theme="white-orange"] .modal-box {
    background: linear-gradient(
      145deg,
      rgba(255, 253, 250, 0.66) 0%,
      rgba(255, 242, 228, 0.52) 55%,
      rgba(255, 248, 240, 0.58) 100%
    ) !important;
    backdrop-filter: blur(28px) saturate(200%) brightness(1.04) !important;
    -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.04) !important;
    border-top: 1.5px solid rgba(255, 255, 255, 0.96) !important;
    border-left: 1.5px solid rgba(255, 255, 255, 0.85) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.38) !important;
    border-bottom: 1px solid rgba(255, 148, 77, 0.35) !important;
    box-shadow:
      inset 2px 2px 3px rgba(255, 255, 255, 0.98),
      inset -1px -1.5px 3px rgba(255, 132, 56, 0.18),
      inset 0 20px 40px -12px rgba(255, 255, 255, 0.55),
      0 32px 72px -12px rgba(120, 53, 15, 0.22) !important;
    color: #1c1917 !important;
  }
  ```

---

### 4. Đồng Bộ Màu Xanh Cho Cả Chữ Thường Lẫn Công Thức LaTeX Ở Đáp Án Đúng Trên Mặt Sau Flashcard Khi Ở Light Mode (`white-orange`)
- **Hiện trạng lỗi**: Ở Dark Mode (`purple-pink`, `monochrome`), toàn bộ đáp án đúng trên mặt sau Flashcard (`#flashcard-answer-text`) gồm cả chữ thường và công thức LaTeX đều đổi sang màu xanh lá cây đẹp mắt. Nhưng sang Light Mode (`white-orange`), chỉ có chữ thường đổi sang màu xanh, còn công thức LaTeX (`.katex`) vẫn giữ nguyên màu đen!
- **Nguyên nhân chính xác**: Một rule CSS của Light Mode đang ép `html[data-theme="white-orange"] .katex, html[data-theme="white-orange"] .katex * { color: #1c1917 !important; }`, đè lên màu xanh của `#flashcard-answer-text`!
- **Giải pháp bắt buộc**:
  ```css
  /* Đảm bảo cả chữ thường lẫn mọi ký hiệu LaTeX (.katex, .katex *) trong Đáp án đúng của Flashcard & Quiz đều lên màu xanh đồng bộ ở cả 3 mode! */
  #flashcard-answer-text,
  .flashcard-answer-text,
  #flashcard-answer-text .katex,
  #flashcard-answer-text .katex *,
  .flashcard-answer-text .katex,
  .flashcard-answer-text .katex * {
    color: #10b981 !important;
  }

  html[data-theme="white-orange"] #flashcard-answer-text,
  html[data-theme="white-orange"] .flashcard-answer-text,
  html[data-theme="white-orange"] #flashcard-answer-text .katex,
  html[data-theme="white-orange"] #flashcard-answer-text .katex *,
  html[data-theme="white-orange"] .flashcard-answer-text .katex,
  html[data-theme="white-orange"] .flashcard-answer-text .katex *,
  body[data-theme="white-orange"] #flashcard-answer-text .katex,
  body[data-theme="white-orange"] #flashcard-answer-text .katex * {
    color: #059669 !important; /* Xanh lục bảo đậm sắc nét trên nền sáng */
  }
  ```

---

### 5. Đồng Bộ Toàn Diện Khung "Mẫu Định Dạng LMS (Moodle)" Trong Tab `Nhập từ LMS` (`#view-import-lms`) Theo Cả 3 Theme
- **Hiện trạng lỗi**: Trong `#view-import-lms`, khối `.lms-format-guide-card`, thẻ `.tech-tag` (`MẪU ĐỊNH DẠNG LMS (MOODLE)`), và hộp code `.lms-sample-snippet` đang bị gán cứng màu tím đen (`background: rgba(20, 14, 38, 0.70) !important; border: 1px solid rgba(192, 132, 252, 0.16) !important; color: #d0c4ea !important;`) và inline style `background: rgba(167, 139, 250, 0.15)` trong `index.html` dòng `91512`!
- **Giải pháp bắt buộc**:
  1. Trong `index.html` (trong `.lms-format-guide-header`), gỡ bỏ inline style màu tím trên `<span class="tech-tag">MẪU ĐỊNH DẠNG LMS (MOODLE)</span>`.
  2. Thêm CSS đồng bộ `.lms-format-guide-card`, `.lms-sample-snippet`, `.lms-sample-line`, và `#lms-raw-input::placeholder` cho cả 3 theme:
     ```css
     /* ==========================================================================
        5. ĐỒNG BỘ MẪU ĐỊNH DẠNG LMS (#view-import-lms) THEO CẢ 3 THEME
        ========================================================================== */

     /* Mode Tím Hồng */
     :root .lms-format-guide-card,
     html[data-theme="dark"] .lms-format-guide-card,
     html[data-theme="purple-pink"] .lms-format-guide-card {
       background: rgba(28, 20, 52, 0.62) !important;
       border: 1px dashed rgba(192, 132, 252, 0.35) !important;
     }
     :root .lms-sample-snippet,
     html[data-theme="dark"] .lms-sample-snippet,
     html[data-theme="purple-pink"] .lms-sample-snippet {
       background: rgba(14, 10, 26, 0.78) !important;
       border: 1px solid rgba(192, 132, 252, 0.18) !important;
       color: #d8cee8 !important;
     }

     /* Mode Trắng Đen (Monochrome — 0% Tím!) */
     html[data-theme="monochrome"] .lms-format-guide-card,
     body[data-theme="monochrome"] .lms-format-guide-card {
       background: rgba(32, 32, 38, 0.64) !important;
       border: 1px dashed rgba(255, 255, 255, 0.28) !important;
     }
     html[data-theme="monochrome"] .lms-format-guide-card .tech-tag,
     body[data-theme="monochrome"] .lms-format-guide-card .tech-tag {
       background: rgba(255, 255, 255, 0.12) !important;
       color: #ffffff !important;
       border-color: rgba(255, 255, 255, 0.28) !important;
     }
     html[data-theme="monochrome"] .lms-sample-snippet,
     body[data-theme="monochrome"] .lms-sample-snippet {
       background: rgba(14, 14, 18, 0.82) !important;
       border: 1px solid rgba(255, 255, 255, 0.16) !important;
       color: #d4d4d8 !important;
     }
     html[data-theme="monochrome"] .lms-sample-line.header-line { color: #ffffff !important; }
     html[data-theme="monochrome"] .lms-sample-line.q-line      { color: #f4f4f5 !important; }
     html[data-theme="monochrome"] .lms-sample-line.choice-line { color: #a1a1aa !important; }
     html[data-theme="monochrome"] #lms-raw-input::placeholder  { color: rgba(161, 161, 170, 0.72) !important; }

     /* Mode Trắng Cam (White-Orange — Sáng ấm, 0% Tím!) */
     html[data-theme="white-orange"] .lms-format-guide-card,
     body[data-theme="white-orange"] .lms-format-guide-card {
       background: rgba(255, 248, 240, 0.76) !important;
       border: 1px dashed rgba(234, 88, 12, 0.42) !important;
       box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
     }
     html[data-theme="white-orange"] .lms-format-guide-card .tech-tag,
     body[data-theme="white-orange"] .lms-format-guide-card .tech-tag {
       background: rgba(249, 115, 22, 0.15) !important;
       color: #ea580c !important;
       border-color: rgba(234, 88, 12, 0.35) !important;
     }
     html[data-theme="white-orange"] .lms-sample-snippet,
     body[data-theme="white-orange"] .lms-sample-snippet {
       background: rgba(255, 255, 255, 0.88) !important;
       border: 1px solid rgba(234, 88, 12, 0.22) !important;
       color: #44403c !important;
     }
     html[data-theme="white-orange"] .lms-sample-line.header-line { color: #ea580c !important; font-weight: 700 !important; }
     html[data-theme="white-orange"] .lms-sample-line.q-line      { color: #1c1917 !important; font-weight: 600 !important; }
     html[data-theme="white-orange"] .lms-sample-line.opt-line    { color: #d97706 !important; }
     html[data-theme="white-orange"] .lms-sample-line.choice-line { color: #57534e !important; }
     html[data-theme="white-orange"] #lms-raw-input::placeholder  { color: rgba(87, 83, 78, 0.68) !important; }
     ```

---

### 6. Thiết Kế Lại Chân Trang Mobile (`.bottom-nav` / `#mobile-bottom-nav`) Với Lớp Nền Màu Tĩnh Đặt Dưới Layer `stroke` Để Làm Nổi Bật Hẳn Icon Đang Chọn & Các Icon Khác
- **Yêu cầu chuẩn xác từ người dùng**:
  - Thanh `.bottom-nav` ở chân trang Mobile cần có **một lớp nền màu tĩnh (Static Solid Backing Layer) nằm ngay dưới layer nét vẽ `stroke` của icon**, giúp làm nổi bật hẳn nét vẽ `stroke` của các icon (không bị nền trang phía dưới xuyên qua làm rối nét) và phân biệt cực kỳ rõ ràng giữa nút đang chọn (`.active`) với các nút còn lại!
- **Giải pháp thiết kế 2 Tầng Nền Tĩnh (Dual-Layer Static Backing)**:
  1. **Tầng 1 (Thân thanh `.bottom-nav`)**: Dùng nền màu tĩnh có độ che phủ cao (`0.94` alpha) để chặn triệt để chữ/màu của các thẻ câu hỏi bên dưới không đâm xuyên lên làm mờ nét `stroke`.
  2. **Tầng 2 (Khung đệm dưới mỗi nút `.bottom-nav-item`)**:
     - Các nút chưa chọn (`.bottom-nav-item:not(.active)`): Có một lớp nền tĩnh nhẹ (`background: var(--bnav-idle-pill-bg)`) nằm dưới icon + nét `stroke` sắc sảo.
     - **Nút đang chọn (`.bottom-nav-item.active`)**: Có **Lớp Nền Màu Tĩnh Đặc Nổi Bật 100% (`background: var(--bnav-active-pill-bg)`)** nằm ngay dưới layer `stroke`, còn nét vẽ `stroke` của SVG và chữ bên trên đổi sang màu tương phản tuyệt đối (`stroke-width: 2.35px !important`):
       - **Mode Tím Hồng**: Nền tĩnh nút `.active` là **Tím Đặc `#9333ea`**, nét `stroke` và chữ là **Trắng Tinh `#ffffff`**!
       - **Mode Trắng Đen**: Nền tĩnh nút `.active` là **Trắng Tinh `#ffffff`**, nét `stroke` và chữ là **Đen Sâu `#09090b`**!
       - **Mode Trắng Cam**: Nền tĩnh nút `.active` là **Cam Tươi Đặc `#f97316`**, nét `stroke` và chữ là **Trắng Tinh `#ffffff`**!
  ```css
  /* ==========================================================================
     6. MOBILE BOTTOM NAV (PORTRAIT) — LỚP NỀN MÀU TĨNH DƯỚI LAYER STROKE RÕ NÉT
     ========================================================================== */
  @media (max-width: 840px) and (orientation: portrait) {
    :root,
    html[data-theme="dark"],
    html[data-theme="purple-pink"] {
      --bnav-shell-bg: rgba(20, 14, 36, 0.95);
      --bnav-shell-border: rgba(216, 180, 254, 0.28);
      --bnav-idle-bg: rgba(255, 255, 255, 0.06);
      --bnav-idle-stroke: #d8b4fe;
      --bnav-active-bg: #9333ea;       /* Màu tĩnh đặc dưới layer stroke khi active */
      --bnav-active-stroke: #ffffff;   /* Stroke trắng tinh nổi bật 100% trên nền tím đặc */
      --bnav-active-shadow: 0 6px 16px rgba(147, 51, 234, 0.45);
    }

    html[data-theme="monochrome"],
    body[data-theme="monochrome"] {
      --bnav-shell-bg: rgba(18, 18, 22, 0.96);
      --bnav-shell-border: rgba(255, 255, 255, 0.24);
      --bnav-idle-bg: rgba(255, 255, 255, 0.07);
      --bnav-idle-stroke: #d4d4d8;
      --bnav-active-bg: #ffffff;       /* Màu tĩnh trắng đặc dưới layer stroke khi active */
      --bnav-active-stroke: #09090b;   /* Stroke đen sâu nổi bật 100% trên nền trắng đặc */
      --bnav-active-shadow: 0 6px 16px rgba(255, 255, 255, 0.28);
    }

    html[data-theme="white-orange"],
    body[data-theme="white-orange"] {
      --bnav-shell-bg: rgba(255, 250, 244, 0.96);
      --bnav-shell-border: rgba(234, 88, 12, 0.28);
      --bnav-idle-bg: rgba(154, 52, 18, 0.07);
      --bnav-idle-stroke: #44403c;
      --bnav-active-bg: #f97316;       /* Màu tĩnh cam đặc dưới layer stroke khi active */
      --bnav-active-stroke: #ffffff;   /* Stroke trắng tinh nổi bật 100% trên nền cam đặc */
      --bnav-active-shadow: 0 6px 16px rgba(249, 115, 22, 0.40);
    }

    .bottom-nav,
    #mobile-bottom-nav {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 6px !important;
      position: fixed !important;
      bottom: max(10px, env(safe-area-inset-bottom, 10px)) !important;
      left: 12px !important;
      right: 12px !important;
      width: calc(100% - 24px) !important;
      max-width: 460px !important;
      margin: 0 auto !important;
      height: 64px !important;
      padding: 6px 8px !important;
      border-radius: 20px !important;
      background: var(--bnav-shell-bg) !important;
      border: 1.5px solid var(--bnav-shell-border) !important;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35) !important;
      z-index: 1000 !important;
    }

    /* Mỗi nút đều có lớp nền tĩnh (idle-bg) ở dưới layer stroke để làm nổi bật nét vẽ */
    .bottom-nav .bottom-nav-item,
    #mobile-bottom-nav .bottom-nav-item {
      flex: 1 1 0% !important;
      min-width: 0 !important;
      height: 50px !important;
      min-height: 48px !important;
      padding: 5px 4px !important;
      border-radius: 14px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 3px !important;
      background: var(--bnav-idle-bg) !important;
      color: var(--bnav-idle-stroke) !important;
      border: 1px solid transparent !important;
      transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease !important;
    }

    /* Khi nút ĐANG CHỌN (.active): Đổ màu nền tĩnh đặc rực rỡ dưới layer stroke! */
    .bottom-nav .bottom-nav-item.active,
    #mobile-bottom-nav .bottom-nav-item.active {
      background: var(--bnav-active-bg) !important;
      color: var(--bnav-active-stroke) !important;
      box-shadow: var(--bnav-active-shadow) !important;
      transform: translateY(-2px) !important;
    }

    .bottom-nav .bottom-nav-item svg,
    .bottom-nav .bottom-nav-item svg * {
      width: 20px !important;
      height: 20px !important;
      fill: none !important;
      stroke: currentColor !important;
      stroke-width: 1.95 !important;
      background: transparent !important;
    }

    .bottom-nav .bottom-nav-item.active svg,
    .bottom-nav .bottom-nav-item.active svg * {
      stroke: var(--bnav-active-stroke) !important;
      stroke-width: 2.35 !important; /* Nét stroke dày sắc sảo trên nền màu tĩnh */
    }

    .bottom-nav .bottom-nav-item span {
      font-size: 0.68rem !important;
      font-weight: 600 !important;
      line-height: 1.1 !important;
      color: inherit !important;
    }
    .bottom-nav .bottom-nav-item.active span {
      font-weight: 800 !important;
      color: var(--bnav-active-stroke) !important;
    }
  }
  ```

---

### 7. Khám & Sửa Toàn Diện Chế Độ Mobile Xoay Ngang (Mobile Landscape Ergonomics — `@media (max-width: 960px) and (orientation: landscape), (max-height: 550px) and (orientation: landscape)`)
- **Giải phẫu toàn bộ lỗi trên Mobile Xoay Ngang (khi chiều cao màn hình chỉ có `360px – 430px` và chiều ngang `667px – 932px`)**:
  1. **Xung đột Media Query giữa Portrait và Landscape**:
     - Ở đợt `1n`, `@media (max-width: 840px)` và `@media (max-width: 768px)` đặt ở cuối file `css/style.css` đã ghi đè lên khối `@media (max-height: 550px)` ở trên!
     - Hậu quả: Khi xoay ngang điện thoại (`width <= 840px, height <= 430px`), `.bottom-nav` vừa bị ép nằm ngang dưới đáy (chiếm mất `64px` trên màn hình cao chỉ `375px`), vừa bị xung đột với rule biến `.bottom-nav` thành thanh dọc bên trái (`width: 64px`), còn `.app-main` bị ép `margin-left: 0 !important` đè thẳng vào Sidebar trái!
     - Với điện thoại màn hình dài (`iPhone 14/15/16 Pro Max` xoay ngang: `width = 844px–932px, height = 390px–430px`), `max-width: 840px` không khớp nên cả `.app-sidebar` của Desktop lẫn `.bottom-nav` của Landscape cùng hiện ra chồng chéo nhau!
  2. **Màn hình Flashcard xoay ngang bị tràn & mất 4 nút đánh giá mức độ hiểu (`#flashcard-srs-bar`)**:
     - Trên màn hình xoay ngang cao chỉ `380px`, việc đặt `.flashcard-stage` / `.flashcard-face` có `min-height: 300px` (từ đợt `1n`) khiến riêng thẻ Flashcard đã chiếm hết 100% chiều cao màn hình, đẩy 4 nút mức độ hiểu (`Chưa thuộc (1)`, `Khó nhớ (2)`, `Nhớ tốt (3)`, `Rất dễ (4)`) tụt hẳn xuống dưới hoặc bị cắt khuất!
  3. **Màn hình Quiz xoay ngang & nút "Câu tiếp theo" (`#btn-next-question` / `#quiz-next-btn`)**:
     - Khoảng cách dọc (`padding`, `margin`, `min-height`) của câu hỏi và 4 đáp án quá lớn so với chiều cao `380px` của điện thoại xoay ngang, làm nút `"Câu tiếp theo"` và hộp giải thích bị đẩy quá sâu.
- **Giải pháp Tối Ưu Hóa Chuyên Biệt Cho Mobile Xoay Ngang (Đặt ở CUỐI CÙNG của `css/style.css` để ưu tiên cao nhất khi xoay ngang)**:
  ```css
  /* ==========================================================================
     7. TỐI ƯU HÓA TOÀN DIỆN CHẾ ĐỘ MOBILE XOAY NGANG (MOBILE LANDSCAPE)
        Áp dụng cho mọi điện thoại xoay ngang (chiều cao <= 550px, chiều rộng <= 960px)
     ========================================================================== */
  @media (orientation: landscape) and (max-height: 550px),
         (orientation: landscape) and (max-width: 960px) and (max-height: 600px) {

    /* 1. Ẩn hoàn toàn Sidebar Desktop trên Mobile xoay ngang */
    .app-sidebar {
      display: none !important;
    }

    /* 2. Biến .bottom-nav thành Thanh Dock Dọc Bên Trái (Slim Left Dock 64px) có lớp nền tĩnh dưới stroke */
    body:not(.quiz-active):not(.flashcard-active) .bottom-nav,
    body:not(.quiz-active):not(.flashcard-active) #mobile-bottom-nav {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      bottom: 0 !important;
      right: auto !important;
      width: 64px !important;
      max-width: 64px !important;
      height: 100dvh !important;
      margin: 0 !important;
      padding: 10px 8px !important;
      border-radius: 0 18px 18px 0 !important;
      background: var(--bnav-shell-bg, rgba(20, 14, 36, 0.95)) !important;
      border: none !important;
      border-right: 1.5px solid var(--bnav-shell-border, rgba(255, 255, 255, 0.22)) !important;
      box-shadow: 8px 0 24px rgba(0, 0, 0, 0.28) !important;
      z-index: 1000 !important;
    }

    body:not(.quiz-active):not(.flashcard-active) .bottom-nav .bottom-nav-item,
    body:not(.quiz-active):not(.flashcard-active) #mobile-bottom-nav .bottom-nav-item {
      width: 46px !important;
      min-width: 46px !important;
      max-width: 46px !important;
      height: 46px !important;
      min-height: 44px !important;
      flex: 0 0 46px !important;
      padding: 0 !important;
      border-radius: 13px !important;
      background: var(--bnav-idle-bg, rgba(255, 255, 255, 0.06)) !important;
      color: var(--bnav-idle-stroke, #d4d4d8) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    body:not(.quiz-active):not(.flashcard-active) .bottom-nav .bottom-nav-item.active,
    body:not(.quiz-active):not(.flashcard-active) #mobile-bottom-nav .bottom-nav-item.active {
      background: var(--bnav-active-bg, #9333ea) !important;
      color: var(--bnav-active-stroke, #ffffff) !important;
      box-shadow: var(--bnav-active-shadow, 0 4px 12px rgba(0, 0, 0, 0.35)) !important;
      transform: none !important;
    }

    body:not(.quiz-active):not(.flashcard-active) .bottom-nav .bottom-nav-item span {
      display: none !important; /* Chỉ hiện icon sắc nét khi ở thanh dọc xoay ngang */
    }

    /* Đẩy khung nội dung .app-main sang phải 64px để KHÔNG BAO GIỜ bị thanh Dock trái đè lên! */
    body:not(.quiz-active):not(.flashcard-active) .app-main {
      margin-left: 64px !important;
      width: calc(100% - 64px) !important;
      max-width: calc(100% - 64px) !important;
      padding-bottom: 24px !important;
    }

    body:not(.quiz-active):not(.flashcard-active) .content-wrapper {
      padding: 48px 16px 24px 16px !important;
      max-width: 100% !important;
    }

    /* Thu gọn cụm HUD góc trên phải khi xoay ngang */
    .topbar-hud-capsule {
      top: 8px !important;
      right: 12px !important;
      transform: scale(0.9) !important;
      transform-origin: top right !important;
    }

    /* 3. Khi vào chế độ học (Quiz hoặc Flashcard) trên Mobile xoay ngang:
          Ẩn hoàn toàn .bottom-nav để dành 100% diện tích màn hình cho bài học! */
    body.quiz-active .bottom-nav,
    body.quiz-active #mobile-bottom-nav,
    body.flashcard-active .bottom-nav,
    body.flashcard-active #mobile-bottom-nav {
      display: none !important;
    }

    body.quiz-active .app-main,
    body.flashcard-active .app-main {
      margin-left: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
    }

    body.quiz-active .content-wrapper,
    body.flashcard-active .content-wrapper {
      padding: 8px 16px 24px 16px !important;
      max-width: 100% !important;
    }

    /* 4. Tối ưu Màn hình Quiz trên Mobile Xoay Ngang:
          Bố cục 2x2 gọn gàng, nút "Câu tiếp theo" nằm ngay dưới tầm ngón tay cái! */
    body.quiz-active .quiz-container,
    #view-study .quiz-container {
      max-width: 100% !important;
      padding: 4px 8px 24px 8px !important;
    }

    body.quiz-active .quiz-header-bar,
    #view-study .quiz-header-bar {
      margin-bottom: 6px !important;
      padding: 4px 0 !important;
    }

    body.quiz-active .quiz-card,
    #view-study .quiz-card {
      padding: 12px 16px !important;
      border-radius: 16px !important;
      margin-bottom: 8px !important;
    }

    body.quiz-active .quiz-question-text,
    #view-study .quiz-question-text {
      font-size: 0.96rem !important;
      line-height: 1.4 !important;
      margin-bottom: 10px !important;
    }

    body.quiz-active .quiz-options-list,
    #view-study .quiz-options-list,
    #quiz-options-container {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px 10px !important;
      margin-bottom: 10px !important;
    }

    body.quiz-active .quiz-option-btn,
    #view-study .quiz-option-btn {
      min-height: 42px !important;
      padding: 8px 12px !important;
      font-size: 0.86rem !important;
      line-height: 1.32 !important;
      border-radius: 12px !important;
    }

    /* Nút Tiếp theo & Thanh hành động dưới câu hỏi Quiz luôn gọn và dễ bấm */
    .quiz-footer-actions,
    .study-action-bar,
    #quiz-next-btn,
    #btn-next-question {
      margin-top: 6px !important;
      min-height: 42px !important;
    }

    /* 5. Tối ưu Màn hình Flashcard 3D & 4 Nút Mức Độ Hiểu SRS trên Mobile Xoay Ngang:
          Vừa khít 1 màn hình ngang (~380px), tự giãn mượt khi có giải thích dài! */
    .flashcard-player-container {
      max-width: 100% !important;
      gap: 8px !important;
      padding: 0 4px !important;
    }

    .flashcard-stage,
    .flashcard-card,
    .flashcard-card:not(.flipped) .flashcard-front,
    .flashcard-card.flipped .flashcard-back {
      min-height: 165px !important;
      height: auto !important;
      max-height: none !important;
    }

    .flashcard-face {
      padding: 12px 18px !important;
      border-radius: 16px !important;
    }

    .flashcard-question-text,
    .flashcard-answer-text {
      font-size: 1.02rem !important;
      line-height: 1.4 !important;
      margin-bottom: 6px !important;
    }

    .flashcard-explanation-box {
      margin-top: 8px !important;
      padding: 10px 14px !important;
    }

    /* 4 nút đánh giá mức độ hiểu (Chưa thuộc / Khó nhớ / Nhớ tốt / Rất dễ) xếp thành 1 hàng 4 cột ngang gọn gàng */
    #flashcard-srs-bar,
    .srs-ratings-bar {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 8px !important;
      width: 100% !important;
      margin-top: 4px !important;
    }

    #flashcard-srs-bar .srs-btn,
    .srs-ratings-bar .srs-btn {
      min-height: 44px !important;
      height: auto !important;
      padding: 6px 8px !important;
      border-radius: 12px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 2px !important;
    }

    #flashcard-srs-bar .srs-label,
    .srs-ratings-bar .srs-label {
      font-size: 0.78rem !important;
      font-weight: 700 !important;
      line-height: 1.15 !important;
    }

    #flashcard-srs-bar .srs-interval,
    .srs-ratings-bar .srs-interval {
      font-size: 0.68rem !important;
      line-height: 1.1 !important;
    }
  }
  ```

---

## PHẦN 2: CẬP NHẬT LẠI CÂY KIẾN TRÚC (`docs/ARCHITECTURE_GRAPH.md` & `ARCHITECTURE_GRAPH.md`)

Sau khi thực hiện xong 7 hạng mục trên:
1. Cập nhật lại số dòng tham chiếu và sơ đồ trong `docs/ARCHITECTURE_GRAPH.md` (và `ARCHITECTURE_GRAPH.md` ở thư mục gốc nếu có) để phản ánh đầy đủ cơ chế **Sóng Năng Lượng Kéo Tự Do & Chuyển Cảnh Theo Ngưỡng (`33.5% / 66.5%`)**, **Hệ thống Popup Liquid Glass 3 Theme độc lập**, **Lofi Track Switcher**, và **Kiến trúc Responsive Tách Biệt Portrait vs. Landscape Mobile**.
2. Chạy `npm test` và `npm run build` đảm bảo đạt **100% PASS**.

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST)

- [ ] **1.** Thanh kéo Sóng Năng Lượng trong `#view-settings` kéo tự do mượt mà từ `0 -> 100` (không bị giật về 3 nấc cứng); khi kéo sóng biến đổi tần số/hình dạng liên tục; chữ tiêu đề nằm trong hộp nền kính tương phản cao tách biệt hẳn với đường sóng phía dưới; chỉ khi kéo vượt qua ngưỡng `33.5%` hoặc `66.5%` mới đổi sang Theme khác kèm hiệu ứng chuyển cảnh lan tỏa sóng.
- [ ] **2.** Bấm chọn bất kỳ bài nhạc nào trong Dropdown chọn nhạc Lofi ở `#view-settings` (hoặc bấm nút Next bài ở trang chủ) đều chuyển sang phát bài hát mới ngay lập tức.
- [ ] **3.** Popup ở Mode Tím Hồng (`purple-pink`) dùng đúng mẫu kính tím khói trong suốt tuyệt đẹp; Popup ở Mode Trắng Đen (`monochrome`) là kính khói bạc Noir trong suốt (0% tím); Popup ở Mode Trắng Cam (`white-orange`) là kính trắng kem ấm trong suốt (0% tím).
- [ ] **4.** Trên mặt sau Flashcard ở Light Mode (`white-orange`), cả chữ thường lẫn toàn bộ công thức toán học LaTeX (`.katex`) của Đáp án đúng đều đổi sang màu xanh lục bảo (`#059669`) đồng bộ 100%.
- [ ] **5.** Khung `"Mẫu định dạng LMS (Moodle)"` trong tab `#view-import-lms` đã đồng bộ màu hoàn toàn theo cả 3 theme (không còn nền/viền tím ở mode Trắng Đen và Trắng Cam).
- [ ] **6.** Thanh điều hướng chân trang Mobile (`.bottom-nav` ở chế độ dọc) có lớp nền màu tĩnh dưới layer `stroke`, đặc biệt nút đang chọn (`.active`) có nền màu tĩnh đặc (`#9333ea` / `#ffffff` / `#f97316`) làm nổi bật hẳn nét `stroke` của icon so với các nút còn lại.
- [ ] **7.** Khi xoay ngang màn hình điện thoại (Mobile Landscape): thanh điều hướng tự chuyển sang Dock dọc bên trái `64px` không đè lên nội dung; khi vào Quiz hoặc Flashcard thì tự ẩn thanh điều hướng, thu gọn chiều cao thẻ Flashcard (`min-height: 165px`) và xếp 4 nút đánh giá mức độ hiểu SRS thành 1 hàng 4 cột gọn gàng, bấm dễ dàng không bị tràn hay khuất nút.
