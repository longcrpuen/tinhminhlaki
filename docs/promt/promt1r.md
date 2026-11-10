# TÀI LIỆU ĐẶC TẢ KỸ THUẬT KHẨN CẤP: PHASE 1R — KHẮC PHỤC TRIỆT ĐỂ LỖI ĐƠ APP KHI KHỞI ĐỘNG (`App.init` CRASH), KHÔI PHỤC SIDEBAR & TRANG CHỦ & HÌNH NỀN MẶC ĐỊNH THEME TÍM, SỬA LỖI ĐÓNG POPUP (`ESC` / `HỦY` / `✕`), SỬA NÚT QUAY LẠI CÂU TRƯỚC TRONG QUIZ & FLASHCARD, SỬA THANH TIẾN TRÌNH BỊ LỆCH, THIẾT KẾ LẠI NÚT THOÁT TẬP TRUNG & THIẾT LẬP LUẬT ĐÁNH GIÁ ẢNH HƯỞNG HỆ THỐNG (`promt1r.md`)

> **Tài liệu điều phối thực thi khẩn cấp dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1r` (Hotfix toàn diện ngay sau `1q`)
> * **Mục tiêu cốt lõi:** Khắc phục triệt để **toàn bộ 7 lỗi hồi quy nghiêm trọng (Regressions)** phát sinh sau khi thêm nút Quay về câu trước ở `1q` (đối chiếu trực tiếp từ 2 ảnh chụp màn hình `image_c86e77.jpg`, `image_c81bc0.jpg` và phản hồi thực tế của người dùng), đồng thời ban hành **Luật Bắt Buộc: Phân Tích Ảnh Hưởng & Chống Hồi Quy (System Impact & Regression Analysis Protocol)** cho mọi thay đổi từ nay về sau.

---

## PHẦN 0: LUẬT BẮT BUỘC MỖI KHI THÊM HOẶC SỬA BẤT KỲ TÍNH NĂNG NÀO (SYSTEM IMPACT & REGRESSION ANALYSIS PROTOCOL)

Từ phiên bản `1r` trở đi, **trước khi thêm hoặc sửa bất kỳ tính năng, nút bấm, hàm JS hay rule CSS nào**, AI Coding Agent BẮT BUỘC phải thực hiện 5 bước kiểm tra ảnh hưởng dây chuyền sau đây (và ghi bổ sung quy chuẩn này vào cuối file `ARCHITECTURE_GRAPH.md`):

1. **Quy tắc 1 — Bảo vệ tuyệt đối luồng khởi tạo `App.init()` và `db.init()` (Fault-Tolerant Bootstrapping)**:
   - Không một hàm dọn dẹp dữ liệu, migration hay tiện ích phụ nào (như `ensureDataIntegrity`, `stripCitationArtifacts`, nạp hình nền...) được phép ném ra Uncaught Exception làm dừng `App.init()`.
   - `this.setupEventListeners()` BẮT BUỘC phải được gọi ngay đầu `App.init()` (trước cả các tác vụ bất đồng bộ nặng) và mọi khối `await` trong `App.init()` phải được bọc `try / catch` cô lập để Sidebar, Bottom Nav, các nút đóng Popup (`ESC`, `Hủy`, `✕`) và `renderDashboard()` **luôn luôn hoạt động 100% trong mọi hoàn cảnh**.
2. **Quy tắc 2 — Kiểm tra kiểu dữ liệu đa hình trong IndexedDB (`card.options` Polymorphism)**:
   - Trong cơ sở dữ liệu của ứng dụng, trường `card.options` của các câu hỏi có thể tồn tại dưới 2 dạng: mảng các chuỗi (`["Đáp án A", "Đáp án B"]`) HOẶC mảng các đối tượng (`[{ id: "a", text: "Đáp án A" }, ...]`). Mọi hàm xử lý chuỗi trên `card.options` bắt buộc phải kiểm tra `typeof opt === 'string' ? opt : (opt?.text || '')` trước khi gọi `.includes()` hay `.replace()`.
3. **Quy tắc 3 — Kiểm tra ma trận CSS hiện hữu trước khi thêm phần tử mới**:
   - Trước khi đặt một nút mới vào `.quiz-header-bar`, `.card-actions-toolbar`, hay `.quiz-footer-actions`, bắt buộc phải kiểm tra các rule CSS đang áp lên container đó ở cả Desktop lẫn Mobile (`@media (max-width: 768px)`, `body.quiz-active`, `body.flashcard-active`, `body.perf-compositor-anim`).
   - Tuyệt đối không để phần tử mới bị dính `pointer-events: none !important` từ container cha (như `.quiz-footer-actions`), bị kéo giãn `width: 100%` (như `#btn-focus-exit`), hoặc bị nhân đôi phép biến hình `width` + `transform: scaleX` (như `#study-progress-fill`).
4. **Quy tắc 4 — Đồng bộ 100% Ngôn ngữ Thiết kế Bản địa (Native Design Language)**:
   - Mọi nút công cụ thêm vào trong thẻ câu hỏi (`.card-actions-toolbar`) phải sử dụng đúng hệ thống class `.btn-card-action` (`height: 32px`, `border-radius: var(--radius-sm)` `8px`, viền mảnh `1px solid var(--border-color)`, nền kính trong suốt, chữ/icon tinh gọn) — tuyệt đối không nhét nút `.btn-secondary` to lệch cỡ vào cạnh các nút icon `32x32px`, và không tạo 2 nút cùng chức năng (`← Câu trước`) nằm chồng lên nhau ở 2 hàng liên tiếp.
5. **Quy tắc 5 — Kiểm tra Hồi quy Thực tế (End-to-End Regression Verification)**:
   - Sau khi sửa xong bất kỳ tính năng nào, bắt buộc phải kiểm tra đủ 6 luồng: (1) Mở app lên Trang chủ phải hiện đủ hình nền mặc định, 4 ô thống kê và danh sách bộ thẻ; (2) Bấm chuyển qua lại toàn bộ 7 mục trên Sidebar; (3) Mở bất kỳ Popup nào và bấm `✕`, `Hủy`, phím `ESC`, hoặc click ra ngoài nền để đóng; (4) Vào Quiz chọn đáp án, bấm `Câu trước` / `Câu tiếp theo`; (5) Vào Flashcard lật thẻ, bấm `Trước` / `Tiếp`; (6) Bật và thoát Chế độ tập trung (`Focus Mode`).

---

## PHẦN 1: GIẢI PHẪU NGUYÊN NHÂN GỐC RỄ & SỬA DỨT ĐIỂM 7 LỖI KHẨN CẤP

### 1. Sửa Dứt Điểm Lỗi Đơ App Khi Mới Vào (Không Bấm Được Sidebar, Trang Chủ Mất Sạch Dữ Liệu Như Mất Cache, Không Load Hình Nền Mặc Định Theme Tím, Chỉ Bấm Được Nút Logo Và Ôn Tập Hàng Ngày)

#### 🔍 Giải phẫu nguyên nhân gốc rễ (100% chính xác từ mã nguồn):
- Trong `index.html`:
  - Các nút điều hướng trên Sidebar (`.nav-item[data-view]`) và Bottom Nav (`.bottom-nav-item[data-view]`) **không có thuộc tính `onclick`**, mà phụ thuộc hoàn toàn vào hàm `this.setupEventListeners()` nằm ở dòng `99598` của `App.init()`.
  - Tương tự, các nút đóng Popup (`.modal-close`, dấu `✕`, nút `Hủy`, và phím `Escape`) cũng phụ thuộc hoàn toàn vào `this.setupEventListeners()`.
  - Ngược lại, nút thu/mở logo Sidebar (`id="btn-sidebar-toggle" onclick="App.toggleSidebar()"`) và nút `⚡ Ôn tập hôm nay` (`onclick="App.startSession(null, 'srs')"`) lại có `onclick` viết trực tiếp trong HTML!
- Khi mở ứng dụng, `App.init()` chạy dòng đầu tiên: `await db.init()` -> gọi `await this.ensureDataIntegrity()` trong `js/db.js`.
- Tại đây, đoạn code quét `[cite: ...]` vừa thêm vào ở đợt `1q` đã **ném ra lỗi Runtime Exception (`TypeError` / `ReferenceError`)** do:
  1. Gọi `stripCitationArtifacts` khi hàm này chưa được định nghĩa bên trong class/object `db` (`js/db.js`), HOẶC
  2. Gọi `.includes('[cite')` / `.replace(...)` trực tiếp trên các phần tử của `card.options` trong khi `card.options` của các câu hỏi trong DB là mảng các **Object `{ id: 'a', text: '...' }`** (xem dòng `89691` của `js/db.js`) chứ không phải chuỗi `string`!
- Vì `await db.init()` ném ra lỗi không được bắt (`Uncaught (in promise) TypeError`), **hàm `App.init()` chết đứng ngay tại dòng đầu tiên (`await db.init()`)**!
- **Hậu quả dây chuyền khớp 100% với những gì người dùng gặp phải**:
  1. Đoạn code nạp hình nền mặc định của Theme Tím (nằm dưới `await db.init()`) **không bao giờ được chạy** -> mất hình nền mặc định!
  2. Hàm `this.setupEventListeners()` **không bao giờ được chạy** -> toàn bộ các nút trên Sidebar bị liệt (chỉ bấm được nút logo có `onclick` inline), và toàn bộ các nút `✕`, `Hủy`, `ESC` trên mọi Popup đều bị liệt!
  3. Hai hàm `await this.updateGlobalStats()` và `await this.renderDashboard()` ở cuối `App.init()` **không bao giờ được chạy** -> Tab Trang chủ trống trơn như bị mất sạch cache, trong khi dữ liệu trong IndexedDB vẫn còn nguyên (nên khi người dùng bấm nút `⚡ Ôn tập hôm nay` có `onclick` inline rồi mò sang phần Thống kê thì vẫn thấy đầy đủ dữ liệu và lịch sử học)!

#### 🛠️ Giải pháp bắt buộc trong `js/db.js`, `js/app.js` và `index.html`:

1. **Trong `js/db.js` (Sửa hàm `ensureDataIntegrity()` và thêm helper `_cleanCitationText` an toàn tuyệt đối)**:
   - Thêm phương thức `_cleanCitationText(text)` ngay trong `db` (`js/db.js`):
     ```javascript
     _cleanCitationText(text) {
       if (!text || typeof text !== 'string') return text;
       return text
         .replace(/\[\s*cite(?:_start|_end)?\s*(?::[^\]]*)?\]/gi, '')
         .replace(/【[^】]*】/g, '')
         .replace(/\s+([.,;:?!])/g, '$1')
         .replace(/[ \t]{2,}/g, ' ')
         .trim();
     }
     ```
   - Trong `ensureDataIntegrity()` (`js/db.js`), bọc toàn bộ logic kiểm tra và làm sạch `[cite]` trong khối `try { ... } catch (err) { console.warn('[DB] Citation cleanup warning:', err); }` VÀ xử lý đúng cả 2 dạng `string` lẫn `object { id, text }` của `card.options`:
     ```javascript
     // 4. Tự động làm sạch các ký hiệu [cite: ...] hoặc 【...】 trong kho thẻ một cách an toàn tuyệt đối
     try {
       const hasCiteRegex = /\[\s*cite|【[^】]*】/i;
       const dirtyCiteCards = [];

       for (const c of allCards) {
         if (!c || typeof c !== 'object') continue;
         let changed = false;

         if (typeof c.question === 'string' && hasCiteRegex.test(c.question)) {
           c.question = this._cleanCitationText(c.question);
           changed = true;
         }
         if (typeof c.explanation === 'string' && hasCiteRegex.test(c.explanation)) {
           c.explanation = this._cleanCitationText(c.explanation);
           changed = true;
         }
         if (typeof c.topic === 'string' && hasCiteRegex.test(c.topic)) {
           c.topic = this._cleanCitationText(c.topic);
           changed = true;
         }
         if (Array.isArray(c.options)) {
           c.options = c.options.map(opt => {
             if (typeof opt === 'string') {
               if (hasCiteRegex.test(opt)) {
                 changed = true;
                 return this._cleanCitationText(opt);
               }
               return opt;
             } else if (opt && typeof opt === 'object' && typeof opt.text === 'string') {
               if (hasCiteRegex.test(opt.text)) {
                 changed = true;
                 return { ...opt, text: this._cleanCitationText(opt.text) };
               }
               return opt;
             }
             return opt;
           });
         }

         if (changed) {
           dirtyCiteCards.push(c);
         }
       }

       if (dirtyCiteCards.length > 0) {
         await this.saveCardsBatch(dirtyCiteCards, { forceNew: false });
       }
     } catch (citeCleanErr) {
       console.warn('[DB] Bỏ qua bước làm sạch citation tự động:', citeCleanErr);
     }
     ```

2. **Trong `js/app.js` (Tái cấu trúc `App.init()` chống sập 100% và khôi phục Hình nền Mặc định Theme Tím)**:
   - Trong `App.init()`, **gọi `this.setupEventListeners()` NGAY ĐẦU TIÊN** (trước cả `await db.init()`), dùng cờ `if (!this._listenersInitialized)` để không bao giờ gắn trùng sự kiện.
   - Bọc `await db.init()` và từng khối nạp Theme, nạp Background, nạp Settings, `updateGlobalStats()`, `renderDashboard()` trong các khối `try / catch` độc lập:
     ```javascript
     async init() {
       // 0. Gắn toàn bộ Event Listeners NGAY LẬP TỨC để Sidebar, Bottom Nav,
       //    nút đóng Popup (✕, Hủy, ESC) luôn hoạt động 100% kể cả khi DB đang khởi tạo
       try {
         this.setupEventListeners();
       } catch (listenerErr) {
         console.error('[App.init] Lỗi gắn sự kiện:', listenerErr);
       }

       // 1. Khởi tạo Performance Engine & Worker sớm
       try {
         if (typeof PERF_CONFIG !== 'undefined') {
           if (PERF_CONFIG.COMPOSITOR_ONLY_ANIM) {
             document.body.classList.add('perf-compositor-anim');
           }
           if (PERF_CONFIG.CONTENT_VISIBILITY === false) {
             document.body.classList.add('no-content-visibility');
           }
         }
         this.initWorker();
         this.setupIdleAndVisibilityListeners();
       } catch (perfErr) {
         console.warn('[App.init] Perf setup warning:', perfErr);
       }

       // 2. Khởi tạo IndexedDB an toàn
       try {
         await db.init();
       } catch (dbErr) {
         console.error('[App.init] Lỗi khởi tạo DB:', dbErr);
       }

       // 3. Khôi phục Theme & Hình nền mặc định (đặc biệt là hình nền mặc định của Theme Tím)
       try {
         const savedTheme = await db.getMeta('appTheme', null) || localStorage.getItem('tinhminhlakey_theme') || 'violet';
         if (typeof this.setTheme === 'function') {
           await this.setTheme(savedTheme, { skipWave: true, skipSave: true });
         } else {
           document.documentElement.setAttribute('data-theme', savedTheme);
         }

         let savedBg = await db.getMeta('backgroundSrc', null);
         if (savedBg === 'custom_blob') {
           const blob = await db.getMeta('customBackgroundBlob', null);
           if (blob instanceof Blob) {
             await this.setBackground(blob, true);
           } else {
             await this.setBackground('none', true);
           }
         } else if (typeof savedBg === 'string' && savedBg.startsWith('data:image/')) {
           try {
             const res = await fetch(savedBg);
             const blob = await res.blob();
             await this.setBackground(blob, false);
           } catch (_) {
             await this.setBackground('none', true);
           }
         } else if (savedBg && savedBg !== 'none') {
           if (typeof savedBg === 'string' && savedBg.startsWith('./backgrounds/') && /\.(jpg|jpeg|png)$/i.test(savedBg)) {
             savedBg = savedBg.replace(/\.(jpg|jpeg|png)$/i, '.webp');
           }
           await this.setBackground(savedBg, true);
         } else {
           // Nếu chưa lưu custom bg hoặc đang ở 'none', đảm bảo nền ambient mặc định của theme hiện tại (đặc biệt là Theme Tím) hiển thị đầy đủ
           await this.setBackground('none', true);
         }
       } catch (bgLoadErr) {
         console.error('[App.init] Lỗi khi nạp hình nền & theme:', bgLoadErr);
       }

       // 4. Khôi phục các cài đặt người dùng (Âm thanh, Mục tiêu ngày, Đếm ngược, Sidebar...)
       try {
         const notice = await db.getMeta('migration_notice', null);
         if (notice && !notice.shown) {
           this.showToast(notice.message, 'success');
           notice.shown = true;
           await db.setMeta('migration_notice', notice);
         }
       } catch (_) {}

       try {
         this.lastUsedSubjectId = localStorage.getItem('last_used_subject_id') || null;
       } catch (_) {}

       try {
         const soundEnabled = await db.getMeta('soundEnabled', true);
         sounds.setEnabled(soundEnabled);
         const soundToggle = document.getElementById('setting-sound');
         if (soundToggle) soundToggle.checked = soundEnabled;

         const tabSoundEnabled = await db.getMeta('tabSoundEnabled', true);
         sounds.setTabSoundEnabled(tabSoundEnabled);
         const tabSoundToggle = document.getElementById('setting-tab-sound');
         if (tabSoundToggle) tabSoundToggle.checked = tabSoundEnabled;

         const dailyGoal = await db.getMeta('dailyGoal', 20);
         const goalInput = document.getElementById('setting-daily-goal');
         if (goalInput) goalInput.value = dailyGoal;

         const perQTimer = await db.getMeta('perQTimerEnabled', false);
         const perQSec = await db.getMeta('perQSeconds', 30);
         const perQToggle = document.getElementById('setting-per-q-timer');
         const perQInput = document.getElementById('setting-per-q-seconds');
         if (perQToggle) perQToggle.checked = perQTimer;
         if (perQInput) perQInput.value = perQSec;

         const sidebarCollapsed = await db.getMeta('sidebarCollapsed', false);
         if (sidebarCollapsed) {
           const sidebar = document.getElementById('app-sidebar');
           const main = document.querySelector('.app-main');
           if (sidebar) sidebar.classList.add('collapsed');
           if (main) main.classList.add('sidebar-collapsed');
           this._detachSidebarLabels();
         }

         const savedSession = await db.getMeta('activeSessionBackup', null);
         if (savedSession && savedSession.cardIds && savedSession.cardIds.length > 0) {
           const banner = document.getElementById('session-restore-banner');
           if (banner) banner.style.display = 'flex';
         }
       } catch (settingsErr) {
         console.warn('[App.init] Lỗi nạp cài đặt:', settingsErr);
       }

       // 5. Khởi tạo PWA
       try {
         this.setupPWA();
       } catch (_) {}

       // 6. Render Trang chủ & Thống kê toàn cục (BẮT BUỘC LUÔN CHẠY)
       try {
         if (this._renderedViewRevision) {
           this._renderedViewRevision = { dashboard: 0, decks: 0, bank: 0, stats: 0 };
         }
         this.updateHeroQuote();
         await this.updateGlobalStats();
         await this.renderDashboard();
       } catch (renderErr) {
         console.error('[App.init] Lỗi render Dashboard:', renderErr);
       }
     },
     ```

3. **Trong `index.html` (Thêm `onclick="App.navigateTo('...')"` dự phòng trực tiếp cho toàn bộ nút Sidebar & Bottom Nav)**:
   - Trên mỗi `<li class="nav-item" data-view="...">` trong `#app-sidebar` và mỗi `<button class="bottom-nav-item" data-view="...">` trong `#mobile-bottom-nav`, gắn thêm `onclick="App.navigateTo('...')"` (ví dụ `onclick="App.navigateTo('dashboard')"`, `onclick="App.navigateTo('decks')"`, `onclick="App.navigateTo('bank')"`, `onclick="App.navigateTo('import')"`, `onclick="App.navigateTo('import-lms')"`, `onclick="App.navigateTo('stats')"`, `onclick="App.navigateTo('settings')"`).

---

### 2. Sửa Dứt Điểm Lỗi Các Nút Đóng Popup (`ESC`, `Hủy`, Dấu `✕` `.modal-close`) Không Dùng Được

#### 🔍 Giải phẫu nguyên nhân:
1. Do `setupEventListeners()` trước đó đặt ở cuối `App.init()` (sau `await db.init()`), khi `db.init()` gặp lỗi, các trình lắng nghe `.modal-close` và `Escape` chưa từng được đăng ký!
2. Hơn nữa, `document.querySelectorAll('.modal-close').forEach(...)` chỉ gắn sự kiện một lần cho các phần tử có sẵn lúc ban đầu, không tự bắt được các modal sinh động bằng JS (`#modal-confirm-delete-deck`, `#modal-suggest-merge-subjects`), hoặc khiAI Coding Agent sửa `keydown` listener đã làm ảnh hưởng đến nhánh `if (e.key === 'Escape')`.

#### 🛠️ Giải pháp bắt buộc trong `js/app.js`:
1. Tạo phương thức `closeAllModals()` chuẩn hóa trên `App`:
   ```javascript
   closeAllModals() {
     const wasCompletionOpen = document.getElementById('modal-session-complete')?.classList.contains('show');
     document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
     document.body.classList.remove('modal-open');
     this._batteryAnimToken = (this._batteryAnimToken || 0) + 1;
     if (this._batteryCountTimer) {
       clearInterval(this._batteryCountTimer);
       this._batteryCountTimer = null;
     }
     if (this._batterySegTimer) {
       clearInterval(this._batterySegTimer);
       this._batterySegTimer = null;
     }
     const resultContainer = document.getElementById('result-battery-container');
     if (resultContainer) {
       resultContainer.classList.remove('charged', 'overcharged');
       resultContainer.querySelectorAll('.pixel-battery-segment').forEach(s => {
         s.classList.remove('active', 'high', 'next-charging', 'unstable-pulse', 'reverse-wave');
       });
     }
     const modalBox = document.querySelector('#modal-session-complete .modal-box');
     if (modalBox) modalBox.classList.remove('overcharged-pulse');
     this._isCompletingSession = false;

     if (wasCompletionOpen && this.currentView === 'study') {
       this.navigateTo('decks');
     }
   },
   ```
2. Trong `setupEventListeners()`, bên cạnh việc giữ `.querySelectorAll('.modal-close')`, bổ sung **Event Delegation toàn cục trên `document` (Capture/Bubble)** cho mọi nút đóng modal (`.modal-close`, `[data-modal-close]`, click nền `.modal-overlay`) và phím **`Escape`**:
   ```javascript
   // Bắt mọi cú click vào nút ✕ (.modal-close), nút Hủy trong modal, hoặc click vào lớp nền .modal-overlay
   document.addEventListener('click', (e) => {
     const closeBtn = e.target.closest('.modal-close, [data-modal-close]');
     if (closeBtn) {
       e.preventDefault();
       e.stopPropagation();
       this.closeAllModals();
       return;
     }
     if (e.target && e.target.classList && e.target.classList.contains('modal-overlay') && e.target.classList.contains('show')) {
       this.closeAllModals();
     }
   });

   // Bắt phím Escape ở cấp độ toàn cục (đóng Dropdown -> đóng mọi Modal đang mở -> thoát Focus Mode)
   window.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       const openWrap = document.querySelector('.cyber-dropdown.open');
       if (openWrap) {
         e.preventDefault();
         this.closeAllCyberDropdowns();
         return;
       }
       const openModal = document.querySelector('.modal-overlay.show');
       if (openModal) {
         e.preventDefault();
         this.closeAllModals();
         return;
       }
       if (document.body.classList.contains('focus-mode-active') || document.body.classList.contains('focus-mode')) {
         e.preventDefault();
         this.toggleFocusMode();
         return;
       }
     }
   });
   ```

---

### 3. Sửa Dứt Điểm Lỗi Thanh Tiến Trình (`#study-progress-fill`) Bị Kéo Trôi Lơ Lửng Giữa Thanh (`image_c86e77.jpg`)

#### 🔍 Giải phẫu nguyên nhân từ ảnh `image_c86e77.jpg` và mã nguồn:
- Nhìn vào `image_c86e77.jpg`: Vạch màu cam trên thanh tiến trình (`.quiz-progress-track`) không bắt đầu từ mép trái `0%` mà bị tụt lơ lửng ở đoạn giữa, để lộ khoảng trắng ở cả bên trái lẫn bên phải vạch cam!
- **Nguyên nhân chính xác trong `js/app.js` dòng `101266–101269` và `css/style.css`**:
  - Trong `renderActiveStudyCard()`, code đang gán **cùng lúc cả 2 thuộc tính**:
    ```javascript
    progressFill.style.width = `${ratio * 100}%`;
    progressFill.style.transform = `scaleX(${ratio})`;
    ```
  - Khi `#study-progress-fill` bị gán `width: 30%` VÀ `transform: scaleX(0.3)`, nếu `transform-origin` là mặc định `50% 50%` (tâm ở giữa), thanh màu cam rộng `30%` lại bị `scaleX(0.3)` co rút vào chính giữa của đoạn 30% đó -> khiến cục màu cam co bé lại còn `9%` và trôi lơ lửng cách mép trái một đoạn trắng to tướng như trong ảnh `image_c86e77.jpg`!
  - Kể cả khi `transform-origin: 0% 50%` được áp dụng mà không có `width: 100%`, việc gán cả `width: 30%` lẫn `scaleX(0.3)` vẫn làm thanh tiến trình bị ngắn đi gấp đôi (`0.3 * 0.3 = 0.09` tức chỉ còn 9% thay vì 30% hay 40%)!

#### 🛠️ Giải pháp bắt buộc trong `js/app.js` và `css/style.css`:
1. **Trong `js/app.js` (`renderActiveStudyCard()`)**:
   - Tính tỷ lệ tiến trình theo câu hiện tại `current / total` (ví dụ câu `4/10` là `40%`, câu `10/10` là `100%`) và **CHỈ dùng `style.width`, XÓA BỎ hoàn toàn `style.transform = scaleX(...)`**:
     ```javascript
     const progressFill = document.getElementById('study-progress-fill');
     const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
     if (progressFill) {
       progressFill.style.width = `${(ratio * 100).toFixed(1)}%`;
       progressFill.style.removeProperty('transform');
     }
     ```
2. **Trong `css/style.css`**:
   - Khóa cứng `#study-progress-fill` luôn bám sát mép trái `left: 0`, `transform: none !important`, không bao giờ bị co lệch tâm:
     ```css
     html body .quiz-header-bar {
       display: flex !important;
       align-items: center !important;
       justify-content: space-between !important;
       gap: 12px !important;
       width: 100% !important;
     }

     html body .quiz-progress-track {
       flex: 1 1 auto !important;
       height: 8px !important;
       margin: 0 12px !important;
       background: var(--bg-surface-elevated) !important;
       border-radius: 999px !important;
       overflow: hidden !important;
       position: relative !important;
     }

     html body #study-progress-fill.quiz-progress-fill,
     html body.perf-compositor-anim #study-progress-fill.quiz-progress-fill {
       display: block !important;
       height: 100% !important;
       margin: 0 !important;
       left: 0 !important;
       top: 0 !important;
       transform: none !important;
       transform-origin: 0% 50% !important;
       border-radius: 999px !important;
       transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1) !important;
     }
     ```

---

### 4. Thiết Kế Lại Nút Thoát Chế Độ Tập Trung (`#btn-focus-exit`) Nhỏ Gọn, Tinh Tế Đúng Ngôn Ngữ Của App (`image_c81bc0.jpg`)

#### 🔍 Giải phẫu nguyên nhân từ ảnh `image_c81bc0.jpg`:
- Nhìn vào `image_c81bc0.jpg`: Nút `#btn-focus-exit` (`Thoát tập trung`) bị kéo giãn `width: 100%` thành một cái thanh đen dài ngoằng chắn ngang toàn bộ chiều rộng màn hình từ mép trái sang mép phải, đè lên cả phần đầu của `.quiz-card`!
- Nguyên nhân: Thẻ `<button id="btn-focus-exit" class="btn btn-secondary focus-exit-btn">` bị ăn theo rule `left: 16px; right: 16px;` hoặc `width: 100%` của `.btn` / `.focus-exit-btn`!
- Hơn nữa, hãy nhìn ngôn ngữ thiết kế của App ngay trong `image_c81bc0.jpg`:
  - Ở góc trên bên phải của `.quiz-card`, App đang có cụm 4 nút công cụ siêu nhỏ gọn **`.btn-card-action`** (`[☆] [⚑] [✏️] [🎯]`, kích thước `32px x 32px`, bo góc `8px`, viền mảnh `1px solid var(--border-color)`, nền kính trong suốt). Trong đó nút thứ 4 (`#btn-card-focus` `🎯`) chính là nút Bật/Tắt Chế độ tập trung!

#### 🛠️ Giải pháp thiết kế đúng chuẩn ngôn ngữ App trong `index.html` và `css/style.css`:
1. **Trong `index.html`**:
   - Bỏ class `btn btn-secondary` khỏi `#btn-focus-exit`, chỉ dùng class `btn-card-action focus-exit-btn` để nó mang **đúng ngôn ngữ thiết kế của cụm nút `.btn-card-action`** trong thẻ câu hỏi:
     ```html
     <button id="btn-focus-exit" type="button" class="btn-card-action focus-exit-btn" onclick="App.toggleFocusMode()" title="Thoát chế độ tập trung (ESC)" aria-label="Thoát chế độ tập trung">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
         <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
       </svg>
       <span>Thoát</span>
     </button>
     ```
2. **Trong `css/style.css`**:
   - Khóa chặt kích thước `#btn-focus-exit` chỉ là một **chip kính nhỏ gọn (`height: 30px`, `width: auto !important`, `max-width: max-content !important`, `left: auto !important`, `right: 18px !important`, `top: 14px !important`)** nằm gọn ở góc trên bên phải màn hình, tuyệt đối không bao giờ bị kéo ngang màn hình như `image_c81bc0.jpg`:
     ```css
     html body #btn-focus-exit,
     html body .focus-exit-btn {
       position: fixed !important;
       top: 14px !important;
       right: 18px !important;
       left: auto !important;
       bottom: auto !important;
       width: auto !important;
       min-width: 0 !important;
       max-width: max-content !important;
       height: 30px !important;
       min-height: 30px !important;
       max-height: 30px !important;
       padding: 0 10px !important;
       margin: 0 !important;
       border-radius: 8px !important;
       background: var(--glass-tint) !important;
       border: 1px solid var(--border-color) !important;
       box-shadow: var(--lg-directional-bevel), var(--shadow-sm) !important;
       color: var(--text-secondary) !important;
       font-size: 0.75rem !important;
       font-weight: 600 !important;
       line-height: 1 !important;
       display: none !important;
       align-items: center !important;
       justify-content: center !important;
       gap: 5px !important;
       z-index: 1100 !important;
       cursor: pointer !important;
       pointer-events: auto !important;
       backdrop-filter: blur(12px) saturate(150%) !important;
       -webkit-backdrop-filter: blur(12px) saturate(150%) !important;
       transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease !important;
     }

     html body #btn-focus-exit:hover,
     html body .focus-exit-btn:hover {
       color: var(--text-primary) !important;
       border-color: var(--border-focus) !important;
       background: var(--bg-surface-elevated) !important;
       transform: scale(1.04) !important;
     }

     html body.focus-mode-active #btn-focus-exit,
     html body.focus-mode-active .focus-exit-btn,
     html body.focus-mode #btn-focus-exit {
       display: inline-flex !important;
       visibility: visible !important;
       opacity: 1 !important;
     }

     /* Đồng thời làm nổi bật nút 🎯 (#btn-card-focus) ngay trong thẻ câu hỏi khi đang bật Focus Mode */
     html body.focus-mode-active #btn-card-focus {
       color: var(--accent) !important;
       border-color: var(--accent) !important;
       background: var(--bg-surface-elevated) !important;
     }
     ```

---

### 5. Sửa Dứt Điểm Lỗi Nút "Quay Về Câu Trước" Không Dùng Được Trong Cả Quiz Lẫn Flashcard & Thiết Kế Lại Đúng Ngôn Ngữ `.btn-card-action` Của App (`image_c86e77.jpg` & `image_c81bc0.jpg`)

#### 🔍 Giải phẫu nguyên nhân tại sao nút `← Câu trước` bị lỗi & nhìn lệch tông trong `image_c86e77.jpg` và `image_c81bc0.jpg`:
1. **Về mặt giao diện (`image_c86e77.jpg`)**:
   - Trong `image_c86e77.jpg`, nút `← Câu trước` bị đặt ở **cả 2 nơi chồng lên nhau**: một cái trên `.quiz-header-bar` cạnh `4/10`, và ngay dưới đó lại có thêm một cặp `[← Câu trước] [Câu tiếp →]` trong `.flashcard-actions-toolbar`!
   - Hơn nữa, trong `.flashcard-actions-toolbar`, 3 nút `[☆] [⚑] [✏️]` là các nút vuông kính `32x32px` (`.btn-card-action` bo góc `8px`, viền mảnh), còn 2 nút `[← Câu trước] [Câu tiếp →]` lại dùng class `.btn.btn-secondary` to phè, bo tròn kiểu khác, chiều cao khác hẳn nên nhìn cực kỳ lạc quẻ!
2. **Về mặt chức năng (Tại sao bấm không ăn ở cả Quiz lẫn Flashcard)**:
   - **Thứ nhất**: Trong `css/style.css` (dòng `96810–96821`), `.quiz-footer-actions` đang bị rule `#view-study .quiz-footer-actions, #view-study .quiz-footer-actions.show { display: none !important; pointer-events: none !important; }` khóa cứng `pointer-events: none !important`! Và khi sang câu mới chưa chọn đáp án (`isAnswered === false`), `_renderQuizContent` xóa class `.show` khỏi `.quiz-footer-actions`, làm `.quiz-footer-actions:not(.show)` bị `display: none !important`!
   - **Thứ hai**: Trong `_renderOptionsBlock(card, answeredState)` (`js/app.js` dòng `101648`), code gọi `this.shuffleArray(prepared)` trong khi tên hàm trong `App` là `this._shuffleArray(prepared)`!
   - **Thứ ba**: Nếu sự kiện click chỉ được gắn trong `setupEventListeners()` mà không có Event Delegation + inline `onclick` chuẩn, hoặc khi lùi câu ở chế độ Ôn tập hàng ngày (`srs`) / `flashcard` mà bị chặn bởi debounce / điều kiện, nút sẽ không phản hồi!

#### 🛠️ Giải pháp thiết kế & lập trình chuẩn xác 100% theo ngôn ngữ App:

1. **Chuẩn hóa vị trí và ngôn ngữ thiết kế trong `index.html`**:
   - **A. Trên `.quiz-header-bar` (Thanh trên cùng)**:
     - **XÓA BỎ hoàn toàn nút `#btn-study-prev` khỏi `.quiz-header-bar`!** Giữ `.quiz-header-bar` sạch sẽ nguyên bản: bên trái là `← Thoát`, ở giữa là thanh tiến trình `.quiz-progress-track`, bên phải là `#study-counter` (`4 / 10`). Không bao giờ bị 2 nút `Câu trước` nằm chồng lên nhau như `image_c86e77.jpg` nữa!
   - **B. Trên thanh công cụ của thẻ Quiz (`.card-actions-toolbar` trong `#study-quiz-area`) VÀ dưới chân thẻ (`.quiz-footer-actions`)**:
     - Ngay trên thanh `.card-actions-toolbar` của `.quiz-card` (cùng hàng với 4 nút `[☆] [⚑] [✏️] [🎯]`):
       - Đặt nhóm nút điều hướng câu hỏi ở bên trái thanh `.card-actions-toolbar`, sử dụng **đúng class `.btn-card-action btn-card-nav`** (cao đúng `32px`, bo góc `8px`, viền kính mảnh `1px solid var(--border-color)`, nền trong suốt đồng bộ 100% với `[☆] [⚑] [✏️] [🎯]`):
         ```html
         <div class="card-actions-toolbar">
           <div class="card-nav-actions-group">
             <button id="btn-quiz-card-prev" type="button" class="btn-card-action btn-card-nav" title="Quay lại câu trước (Phím ←)" onclick="event.stopPropagation(); App.prevStudyQuestion(event)" style="display: none;">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               <span>Câu trước</span>
             </button>
           </div>
           <div class="card-utility-actions-group">
             <button id="btn-card-bookmark" type="button" class="btn-card-action" title="Lưu thẻ quan trọng (⭐)" onclick="App.toggleCurrentCardBookmark()">☆</button>
             <button id="btn-card-flag" type="button" class="btn-card-action" title="Đánh dấu câu hỏi diễn đạt chưa rõ (🚩)" onclick="App.toggleCurrentCardFlag()">⚑</button>
             <button id="btn-card-edit" type="button" class="btn-card-action" title="Sửa nhanh nội dung câu hỏi (✏️)" onclick="App.openEditCurrentCardModal()">✏️</button>
             <button id="btn-card-focus" type="button" class="btn-card-action" title="Bật/Tắt Chế độ tập trung (Focus Mode 🎯)" onclick="App.toggleFocusMode()">🎯</button>
           </div>
         </div>
         ```
     - Đồng thời ở dưới chân thẻ `.quiz-footer-actions` (hiển thị sau khi chọn đáp án trên Desktop):
       - Giữ cặp nút đối xứng `#btn-quiz-prev` (`← Câu trước`) bên trái và `#btn-quiz-next` (`Câu tiếp theo →`) bên phải, cùng chiều cao `40px` và bo góc chuẩn:
         ```html
         <div class="quiz-footer-actions">
           <button id="btn-quiz-prev" type="button" class="btn btn-secondary btn-quiz-prev" onclick="event.stopPropagation(); App.prevStudyQuestion(event)" style="display: none;">
             ← Câu trước
           </button>
           <button id="btn-quiz-next" type="button" class="btn btn-primary btn-quiz-next" onclick="event.stopPropagation(); App.nextStudyQuestion(event)">
             Câu tiếp theo
           </button>
         </div>
         ```
   - **C. Trên thanh công cụ của thẻ Flashcard (`.flashcard-actions-toolbar` trong `#study-flashcard-area`)**:
     - Thay thế 2 nút `.btn-secondary` to thô trong `image_c86e77.jpg` bằng 2 nút **`.btn-card-action btn-card-nav`** (cao đúng `32px`, bo góc `8px`, viền kính mảnh `1px solid var(--border-color)` giống hệt `[☆] [⚑] [✏️]`):
       ```html
       <div class="card-actions-toolbar flashcard-actions-toolbar">
         <div class="card-nav-actions-group">
           <button id="btn-flashcard-prev" type="button" class="btn-card-action btn-card-nav" title="Quay lại thẻ trước (Phím ←)" onclick="event.stopPropagation(); App.prevStudyQuestion(event)" style="display: none;">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             <span>Câu trước</span>
           </button>
           <button id="btn-flashcard-next" type="button" class="btn-card-action btn-card-nav" title="Sang thẻ tiếp theo (Phím →)" onclick="event.stopPropagation(); App.nextFlashcardReview(event)" style="display: none;">
             <span>Câu tiếp</span>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
           </button>
         </div>
         <div class="card-utility-actions-group">
           <button id="btn-flashcard-bookmark" type="button" class="btn-card-action" title="Lưu thẻ quan trọng (⭐)" onclick="event.stopPropagation(); App.toggleCurrentCardBookmark()">☆</button>
           <button id="btn-flashcard-flag" type="button" class="btn-card-action" title="Đánh dấu câu hỏi diễn đạt chưa rõ (🚩)" onclick="event.stopPropagation(); App.toggleCurrentCardFlag()">⚑</button>
           <button id="btn-flashcard-edit" type="button" class="btn-card-action" title="Sửa nhanh nội dung câu hỏi (✏️)" onclick="event.stopPropagation(); App.openEditCurrentCardModal()">✏️</button>
         </div>
       </div>
       ```

2. **Chuẩn hóa CSS cho `.card-actions-toolbar`, `.btn-card-action.btn-card-nav` và `.quiz-footer-actions` trong `css/style.css`**:
   ```css
   /* Thanh công cụ trên thẻ Quiz & Flashcard: Bên trái là nút điều hướng 32px, bên phải là bộ nút icon 32px */
   html body #view-study .card-actions-toolbar {
     display: flex !important;
     align-items: center !important;
     justify-content: space-between !important;
     width: 100% !important;
     margin-left: 0 !important;
     margin-bottom: 10px !important;
     gap: 8px !important;
   }

   html body #view-study .card-nav-actions-group,
   html body #view-study .card-utility-actions-group {
     display: inline-flex !important;
     align-items: center !important;
     gap: 6px !important;
   }

   html body #view-study .card-utility-actions-group {
     margin-left: auto !important;
   }

   /* Nút Câu trước / Câu tiếp thiết kế đúng chuẩn ngôn ngữ .btn-card-action (cao 32px, bo góc 8px, kính mảnh) */
   html body #view-study .btn-card-action.btn-card-nav {
     width: auto !important;
     min-width: 0 !important;
     height: 32px !important;
     min-height: 32px !important;
     padding: 0 11px !important;
     border-radius: var(--radius-sm, 8px) !important;
     background: transparent !important;
     border: 1px solid var(--border-color) !important;
     color: var(--text-secondary) !important;
     font-size: 0.78rem !important;
     font-weight: 600 !important;
     line-height: 1 !important;
     display: inline-flex !important;
     align-items: center !important;
     justify-content: center !important;
     gap: 5px !important;
     cursor: pointer !important;
     pointer-events: auto !important;
     position: relative !important;
     z-index: 30 !important;
     user-select: none !important;
     transition: all var(--dur-fast) var(--ease-spring) !important;
   }

   html body #view-study .btn-card-action.btn-card-nav:hover {
     background: var(--bg-surface-elevated) !important;
     color: var(--text-primary) !important;
     border-color: var(--border-focus) !important;
     transform: translateY(-1px) !important;
   }

   html body #view-study .btn-card-action.btn-card-nav:active {
     transform: scale(0.95) !important;
   }

   /* Mở khóa hoàn toàn pointer-events cho .quiz-footer-actions và #btn-quiz-prev trên Desktop */
   @media (min-width: 769px) {
     html body #view-study .quiz-footer-actions.show,
     html body.quiz-active #view-study .quiz-footer-actions.show {
       display: flex !important;
       justify-content: space-between !important;
       align-items: center !important;
       gap: 12px !important;
       min-height: 48px !important;
       height: auto !important;
       margin-top: 16px !important;
       pointer-events: auto !important;
       position: relative !important;
       z-index: 25 !important;
     }

     html body #view-study #btn-quiz-prev {
       height: 40px !important;
       min-height: 40px !important;
       padding: 0 18px !important;
       border-radius: 999px !important;
       font-size: 0.88rem !important;
       font-weight: 600 !important;
       pointer-events: auto !important;
       cursor: pointer !important;
       z-index: 30 !important;
     }

     html body #view-study #btn-quiz-next {
       margin-left: auto !important;
       pointer-events: auto !important;
       cursor: pointer !important;
     }
   }
   ```

3. **Sửa hoàn chỉnh logic `prevStudyQuestion(event)` và `nextFlashcardReview(event)` trong `js/app.js`**:
   - Đảm bảo trong `App` có cả `shuffleArray(arr)` lẫn `_shuffleArray(arr)`:
     ```javascript
     shuffleArray(arr) {
       const copy = Array.isArray(arr) ? [...arr] : [];
       return this._shuffleArray(copy);
     },
     ```
   - Viết hàm `prevStudyQuestion(event)` và `nextFlashcardReview(event)` trực tiếp làm method của `App`, đồng thời gắn Event Delegation trong `setupEventListeners()` để bắt click trên `#btn-quiz-prev`, `#btn-quiz-card-prev`, `#btn-flashcard-prev`, `#btn-flashcard-next`:
     ```javascript
     prevStudyQuestion(event) {
       if (event && typeof event.stopPropagation === 'function') {
         event.stopPropagation();
       }
       const now = Date.now();
       if (this._lastPrevClick && now - this._lastPrevClick < 150) return;
       this._lastPrevClick = now;

       const session = this.activeSession;
       if (!session || !Array.isArray(session.cards) || session.currentIndex <= 0) {
         return;
       }

       this.clearPerQuestionTimer();
       session.currentIndex = Math.max(0, session.currentIndex - 1);
       session.blindRevealed = true;

       // Reset trạng thái blind-active khi chuyển câu
       const quizArea = document.getElementById('study-quiz-area');
       if (quizArea) {
         quizArea.scrollTop = 0;
         quizArea.classList.remove('blind-active');
       }
       const quizCard = document.querySelector('#study-quiz-area .quiz-card');
       if (quizCard) quizCard.classList.remove('blind-active');
       document.body.classList.remove('quiz-blind-active');

       window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
       const mainEl = document.querySelector('.app-main');
       if (mainEl) mainEl.scrollTop = 0;

       this.renderActiveStudyCard();
     },

     nextFlashcardReview(event) {
       if (event && typeof event.stopPropagation === 'function') {
         event.stopPropagation();
       }
       const session = this.activeSession;
       if (!session || !Array.isArray(session.cards)) return;
       if (session.currentIndex < session.cards.length - 1) {
         session.currentIndex++;
         this.renderActiveStudyCard();
       }
     },
     ```
   - Trong `renderActiveStudyCard()` (`js/app.js`), cập nhật trạng thái hiển thị của `#btn-quiz-card-prev`, `#btn-quiz-prev`, `#btn-flashcard-prev`, `#btn-flashcard-next`:
     ```javascript
     const canGoPrev = session.currentIndex > 0;
     session.maxReachedIndex = Math.max(session.maxReachedIndex || 0, session.currentIndex);

     ['btn-quiz-card-prev', 'btn-quiz-prev', 'btn-flashcard-prev'].forEach(btnId => {
       const el = document.getElementById(btnId);
       if (el) {
         if (canGoPrev) {
           el.style.setProperty('display', 'inline-flex', 'important');
           el.style.pointerEvents = 'auto';
           el.disabled = false;
         } else {
           el.style.setProperty('display', 'none', 'important');
         }
       }
     });

     const fcNextBtn = document.getElementById('btn-flashcard-next');
     if (fcNextBtn) {
       const canGoForward = session.currentIndex < (session.cards.length - 1);
       if (canGoForward) {
         fcNextBtn.style.setProperty('display', 'inline-flex', 'important');
         fcNextBtn.style.pointerEvents = 'auto';
       } else {
         fcNextBtn.style.setProperty('display', 'none', 'important');
       }
     }
     ```
   - Trong `setupEventListeners()`, hỗ trợ phím mũi tên trái `ArrowLeft` để lùi câu và `ArrowRight` để tiến câu trong `#view-study` (khi không focus trong ô `<input>` / `<textarea>` và không có modal đang mở):
     ```javascript
     if (this.currentView === 'study' && !document.querySelector('.modal-overlay.show')) {
       const activeTag = document.activeElement?.tagName?.toLowerCase();
       const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
       if (!isTyping) {
         if (e.key === 'ArrowLeft') {
           e.preventDefault();
           this.prevStudyQuestion();
           return;
         } else if (e.key === 'ArrowRight') {
           if (this.activeSession?.mode === 'flashcard') {
             e.preventDefault();
             this.nextFlashcardReview();
             return;
           } else if (this.activeSession?.userAnswers?.[this.activeSession.currentIndex]) {
             e.preventDefault();
             this.nextStudyQuestion();
             return;
           }
         }
       }
     }
     ```

---

## DANH SÁCH KIỂM TRA NGHIỆM THU BẮT BUỘC (VERIFICATION CHECKLIST — `promt1r.md`)

- [ ] **1. Khởi động App mượt mà 100% (Zero Init Crash):** Mở ứng dụng lên không có bất kỳ lỗi Console Error nào; hình nền mặc định của Theme Tím (hoặc hình nền đã lưu) tự động hiển thị ngay; Trang chủ (`#view-dashboard`) hiển thị đầy đủ 4 ô thống kê, các chế độ học và danh sách bộ thẻ.
- [ ] **2. Sidebar & Bottom Nav nhạy tức thì:** Bấm vào tất cả các mục trên Sidebar (`Tổng quan`, `Thư viện thẻ`, `Ngân hàng câu hỏi`, `Dán câu hỏi AI`, `Nhập từ LMS`, `Thống kê`, `Cài đặt & Sao lưu`) và nút thu/mở logo Sidebar đều chuyển trang mượt mà.
- [ ] **3. Đóng Popup hoạt động 100% ở mọi nơi:** Khi bất kỳ Popup nào hiện lên, bấm phím `ESC`, bấm nút `Hủy`, bấm dấu `✕` (`.modal-close`), hoặc click ra ngoài vùng nền tối (`.modal-overlay`) đều đóng Popup ngay lập tức.
- [ ] **4. Nút Thoát Chế Độ Tập Trung (`#btn-focus-exit`) nhỏ gọn đúng ngôn ngữ App:** Khi bật Focus Mode (`🎯`), nút `#btn-focus-exit` chỉ là một chip kính nhỏ gọn (`height: 30px`, `width: auto`) ở góc trên bên phải màn hình (tuyệt đối không bị kéo dài 100% chiều ngang màn hình như `image_c81bc0.jpg`); bấm vào nút đó, bấm lại nút `🎯` trên thẻ, hoặc nhấn phím `ESC` đều thoát Focus Mode ngay.
- [ ] **5. Nút Quay về câu trước (`prevStudyQuestion`) hoạt động hoàn hảo ở cả Quiz và Flashcard:**
  - Thiết kế đúng chuẩn `.btn-card-action.btn-card-nav` (`height: 32px`, bo góc `8px`, viền kính mảnh đồng bộ 100% với các nút `[☆] [⚑] [✏️] [🎯]`), không còn bị lặp 2 nút chồng nhau như `image_c86e77.jpg`.
  - Trong cả Ôn tập hàng ngày / Quiz và Lật thẻ Flashcard, từ câu số 2 trở đi, bấm nút `Câu trước` (hoặc nhấn phím `←`) lùi về ngay câu trước đó, giữ nguyên đáp án đã chọn và hộp giải thích.
- [ ] **6. Thanh tiến trình (`#study-progress-fill`) chuẩn xác:** Luôn bám sát mép trái `0%` của `.quiz-progress-track` và tăng mượt theo đúng tỷ lệ `current / total`, không còn bị co rút hay trôi lơ lửng ở giữa thanh như `image_c86e77.jpg`.
- [ ] **7. Ghi Luật Phân Tích Ảnh Hưởng Hệ Thống vào `ARCHITECTURE_GRAPH.md`**, chạy `npm test` và `npm run build` đạt 100% PASS.
