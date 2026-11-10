# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: PHASE 1Q (BẢN ĐẦY ĐỦ 6 HẠNG MỤC) — KHÔI PHỤC NÚT XÓA BỘ THẺ, CHẶN & QUÉT SẠCH `[cite: ...]` LÀM LỘ ĐÁP ÁN, GỢI Ý GỘP MÔN HỌC TRÙNG TÊN KHI NHẬP BACKUP JSON, CĂN CHỈNH THẲNG HÀNG ĐÁP ÁN QUIZ & PHÓNG TO GIẢI THÍCH, THU GỌN NÚT THOÁT TẬP TRUNG & THÊM TÍNH NĂNG QUAY LẠI CÂU TRƯỚC CHO CẢ ÔN TẬP VÀ LẬT THẺ (`promt1q.md`)

> **Tài liệu điều phối thực thi dành cho AI Coding Agent (Antigravity / Claude Code / Cursor)**
>
> * **Dự án:** TinhMinhLaKey — Hệ thống Ôn Tập Cá Nhân (Offline-First Vanilla JS + IndexedDB PWA)
> * **Phiên bản đặc tả:** `1q` (Nối tiếp sau `1a` -> `1p`)
> * **Mục tiêu cốt lõi:** Giải quyết triệt để **6 hạng mục chức năng & hiển thị** từ yêu cầu mới nhất của người dùng và 2 ảnh chụp màn hình (`image_c9ed19.jpg`, `image_c9ecc1.jpg`).
> * **Ràng buộc Bất Di Bất Dịch (Non-Negotiable Guardrails):**
>   1. **Zero Data Loss:** Bảo toàn tuyệt đối dữ liệu người dùng trong IndexedDB (`MindSparksQuizDB`) và `localStorage`.
>   2. **100% Test Suite Pass:** Giữ nguyên các chuỗi selector cần thiết để toàn bộ `npm test` (445/445 kiểm thử) và `npm run build` đạt 100% PASS.

---

## CHI TIẾT 6 HẠNG MỤC CẦN THỰC HIỆN NGAY TRONG `promt1q.md`

### 1. Sửa Dứt Điểm Lỗi Nút Xóa Bộ Thẻ Câu Hỏi (`.deck-delete-btn` / `confirmDeleteDeck`) Không Dùng Được
- **Nguyên nhân gốc rễ**:
  1. Trong `js/app.js`, hàm `confirmDeleteDeck(deckId)` đang sử dụng hộp thoại gốc `window.confirm(...)` của trình duyệt — vốn bị chặn hoặc tự trả về `false` trong môi trường WebView / Antigravity / PWA (tương tự lỗi nút Reset bộ thẻ trước đây)!
  2. Ngoài ra, khi xóa bộ thẻ, bộ đếm phiên bản cache (`db.revision` và `this._renderedViewRevision`) từ đợt `1p` cần được tăng/reset ngay lập tức để danh sách bộ thẻ tại `#view-decks` và `#view-dashboard` cập nhật tức thì.
- **Giải pháp bắt buộc trong `js/db.js` và `js/app.js`**:
  1. **Trong `js/db.js` (hàm `deleteDeck(id)`)**:
     - Đảm bảo sau khi xóa bộ thẻ trong bảng `decks` và các câu hỏi thuộc bộ thẻ đó trong bảng `cards`, luôn cập nhật:
       ```javascript
       this.revision = (this.revision || 1) + 1;
       this.invalidateSubjectCache();
       ```
  2. **Trong `js/app.js` (hàm `_createDeckCardHtml` / `renderDecks` và `confirmDeleteDeck`)**:
     - Trên nút thùng rác xóa bộ thẻ (`.deck-delete-btn`), gắn `onclick="event.stopPropagation(); App.confirmDeleteDeck('${deck.id}', event)"` và thêm CSS `position: relative; z-index: 5; pointer-events: auto !important;`.
     - Thay thế hoàn toàn `window.confirm(...)` trong `confirmDeleteDeck(deckId, event)` bằng một **Popup Xác Nhận Xóa Bộ Thẻ bằng Liquid Glass (`#modal-confirm-delete-deck`)** tự dựng (không bao giờ bị trình duyệt chặn!):
       ```javascript
       async confirmDeleteDeck(deckId, event) {
         if (event) {
           event.preventDefault();
           event.stopPropagation();
         }
         if (!deckId) return;
         const deck = await db.getDeck(deckId);
         if (!deck) {
           this.showToast('Không tìm thấy bộ thẻ cần xóa.', 'warning');
           return;
         }

         // Tạo hoặc mở Modal xác nhận xóa chuẩn Liquid Glass (thay cho window.confirm bị chặn)
         let modal = document.getElementById('modal-confirm-delete-deck');
         if (!modal) {
           modal = document.createElement('div');
           modal.id = 'modal-confirm-delete-deck';
           modal.className = 'modal-overlay';
           modal.innerHTML = `
             <div class="modal-box" style="max-width: 440px; padding: 24px;">
               <div class="modal-header" style="margin-bottom: 12px;">
                 <h3 class="modal-title" style="font-size: 1.15rem; font-weight: 800;">Xác nhận xóa bộ thẻ</h3>
                 <button type="button" class="icon-btn modal-close" onclick="App._closeModal(document.getElementById('modal-confirm-delete-deck'))">✕</button>
               </div>
               <div class="modal-body" style="padding: 8px 0 20px 0;">
                 <p id="confirm-delete-deck-msg" style="font-size: 0.96rem; line-height: 1.6; color: var(--text-secondary);"></p>
               </div>
               <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
                 <button type="button" class="btn btn-secondary" onclick="App._closeModal(document.getElementById('modal-confirm-delete-deck'))">Hủy</button>
                 <button type="button" id="btn-execute-delete-deck" class="btn btn-primary" style="background: #ef4444 !important; border-color: #ef4444 !important; color: #ffffff !important;">Xóa vĩnh viễn</button>
               </div>
             </div>
           `;
           document.body.appendChild(modal);
         }

         const msgEl = document.getElementById('confirm-delete-deck-msg');
         if (msgEl) {
           msgEl.innerHTML = `Bạn có chắc chắn muốn xóa bộ câu hỏi <b>"${this._escapeHtml(deck.name)}"</b> và toàn bộ các câu hỏi bên trong không? Hành động này không thể hoàn tác.`;
         }

         const execBtn = document.getElementById('btn-execute-delete-deck');
         if (execBtn) {
           execBtn.onclick = async () => {
             this._closeModal(modal);
             await this.executeDeleteDeck(deckId, deck.name);
           };
         }

         this._showModal(modal);
       },

       async executeDeleteDeck(deckId, deckName = '') {
         await db.deleteDeck(deckId);
         db.revision = (db.revision || 1) + 1;
         db.invalidateSubjectCache();
         if (this._renderedViewRevision) {
           this._renderedViewRevision = { dashboard: 0, decks: 0, bank: 0, stats: 0 };
         }
         // Xóa ngay thẻ trên DOM để phản hồi tức thì
         document.querySelectorAll(`.deck-card[data-deck-id="${deckId}"]`).forEach(el => el.remove());
         await Promise.all([
           this.renderDecks(),
           this.renderDashboard(),
           this.updateGlobalStats()
         ]);
         this.showToast(`Đã xóa bộ thẻ "${deckName}" thành công.`, 'info');
       },
       ```

---

### 2. Chặn & Quét Sạch 100% Các Ký Hiệu Trích Dẫn `[cite: 1, 2, 3]`, `[cite_start]`, `【...】` Khi Sinh Câu Hỏi AI Và Trong Toàn Bộ Kho Thẻ (`image_c9ed19.jpg`)
- **Hiện trạng (`image_c9ed19.jpg`)**:
  - Khi người dùng dùng Gemini / NotebookLM / ChatGPT để tạo câu hỏi từ tài liệu PDF/Slide, AI thường tự động chèn các nhãn dẫn chứng như `[cite: 1, 3]`, `[cite: 1, 2, 3, 5]`, `[cite_start]`, `【1†source】` vào câu hỏi và **đặc biệt là chỉ chèn vào đúng đáp án đúng** (như đáp án A trong Ảnh 1), làm người học nhìn vào biết ngay đáp án nào là đáp án đúng!
- **Giải pháp 3 Tầng Triệt Để 100%**:
  1. **Tầng 1 — Cập nhật Prompt tạo câu hỏi AI (`AIParser.generateAIPromptTemplate` trong `js/parser.js` & `App.copyFlaggedAIPrompt` trong `js/app.js`)**:
     - Bổ sung điều khoản cấm trích dẫn nghiêm ngặt vào cuối hàm `generateAIPromptTemplate`:
       ```text
       - CẤM TUYỆT ĐỐI việc chèn các ký hiệu trích dẫn nguồn tài liệu hoặc đánh dấu trang/đoạn (như [cite: 1, 2], [cite_start], [cite_end], [1], [2], [source], 【1†source】) vào trong nội dung câu hỏi ("question"), các lựa chọn trả lời ("options"), hay lời giải thích ("explanation"). Mọi lựa chọn A, B, C, D phải có văn phong đồng nhất 100%, tuyệt đối không để lộ dấu vết dẫn chứng ở đáp án đúng!
       ```
  2. **Tầng 2 — Tạo hàm `stripCitationArtifacts(text)` lọc tự động ngay khi Parse (`js/parser.js`) VÀ khi Render (`js/app.js`)**:
     - Thêm hàm tiện ích dùng chung vào cả `AIParser` (`js/parser.js`) và `App` (`js/app.js`):
       ```javascript
       stripCitationArtifacts(text) {
         if (!text || typeof text !== 'string') return text || '';
         return text
           // 1. Xóa mọi biến thể [cite: 1, 2, 3], [cite_start], [cite_end], [cite: ...]
           .replace(/\[\s*cite(?:_start|_end)?\s*(?::[^\]]*)?\]/gi, '')
           // 2. Xóa trích dẫn kiểu NotebookLM / OpenAI 【4:0†source】, 【1†...】
           .replace(/【[^】]*】/g, '')
           // 3. Xóa khoảng trắng thừa trước dấu câu sinh ra sau khi cắt [cite]
           .replace(/\s+([.,;:?!])/g, '$1')
           .replace(/[ \t]{2,}/g, ' ')
           .trim();
       }
       ```
     - Gọi `stripCitationArtifacts` cho mọi trường `question`, `explanation`, `topic`, và từng phần tử trong `options` khi parse câu hỏi mới trong `AIParser._normalizeJsonData` / `AIParser.parse` / `LMSParser.parse`.
     - Gọi `text = this.stripCitationArtifacts(text);` ngay ở dòng đầu tiên của hàm `App.renderLatexText(text)`!
  3. **Tầng 3 — Tự động làm sạch vĩnh viễn các câu hỏi cũ đã lưu trong IndexedDB (bao gồm câu hỏi trong Ảnh 1)**:
     - Trong `db.ensureDataIntegrity()` (`js/db.js`), thêm bước kiểm tra: nếu bất kỳ `card` nào đang lưu trong IndexedDB có `question`, `explanation`, hoặc `options` chứa chuỗi `[cite` hoặc `【`, tự động làm sạch bằng `stripCitationArtifacts` và cập nhật lại vào IndexedDB thông qua `saveCardsBatch(cleanedCards, { forceNew: false })`! Nhờ đó, toàn bộ các bộ câu hỏi đã tạo từ trước của người dùng sạch bóng `[cite: ...]` ngay lập tức khi mở app!

---

### 3. Tính Năng Thông Minh Khi Gộp Dữ Liệu Backup Từ JSON: Kiểm Tra Các Môn Học Cùng Tên & Đưa Ra Thông Báo Gợi Ý Gộp Môn Học
- **Yêu cầu từ người dùng**: Khi gộp dữ liệu backup từ file `.json` (`triggerImportBackup('merge')` / `handleBackupFileChosen`), kiểm tra các môn học (`subjects`); nếu có môn học nào trùng tên viết y hệt nhau (ví dụ máy hiện tại có môn `"tuh"` với ID `subj_1`, còn file JSON có môn `"tuh"` với ID `subj_2`, hoặc trong DB đang có 2 môn cùng tên `"tuh"`), hãy hiện thông báo / hộp thoại gợi ý người dùng **gộp các môn học trùng tên đó lại thành 1 môn duy nhất**!
- **Giải pháp trong `js/db.js` và `js/app.js`**:
  1. **Thêm hàm `findDuplicateSubjectGroups()` và `mergeDuplicateSubjectGroups(groups)` vào `js/db.js`**:
     ```javascript
     async findDuplicateSubjectGroups() {
       await this.init();
       const subjects = await this.getAllSubjects();
       const byName = new Map();

       for (const s of subjects) {
         if (!s || !s.name) continue;
         // So khớp tên môn học đã cắt khoảng trắng 2 đầu
         const key = s.name.trim();
         if (!byName.has(key)) byName.set(key, []);
         byName.get(key).push(s);
       }

       const duplicateGroups = [];
       for (const [name, list] of byName.entries()) {
         if (list.length > 1) {
           // Ưu tiên giữ lại môn được tạo sớm nhất làm môn gốc (primary)
           list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
           duplicateGroups.push({
             name,
             primary: list[0],
             duplicates: list.slice(1)
           });
         }
       }
       return duplicateGroups;
     }

     async mergeDuplicateSubjectGroups(groups = null) {
       const dupGroups = groups || await this.findDuplicateSubjectGroups();
       if (!dupGroups || dupGroups.length === 0) return 0;

       let mergedCount = 0;
       for (const group of dupGroups) {
         const targetId = group.primary.id;
         for (const dup of group.duplicates) {
           await this.mergeSubjects(dup.id, targetId);
           mergedCount++;
         }
       }
       this.revision = (this.revision || 1) + 1;
       this.invalidateSubjectCache();
       return mergedCount;
     }
     ```
  2. **Trong `handleBackupFileChosen(e)` (`js/app.js`)**:
     - Sau khi `await db.importAll(json, mode)` hoàn tất, gọi `const dupGroups = await db.findDuplicateSubjectGroups();`.
     - Nếu `dupGroups.length > 0`:
       - Hiển thị ngay **Notification Toast kèm Hộp Thoại Gợi Ý Gộp Môn Học Trùng Tên (`#modal-suggest-merge-subjects` chuẩn Liquid Glass)**:
         - Nội dung báo rõ: *"Phát hiện **N môn học có tên viết giống hệt nhau** sau khi gộp dữ liệu Backup: **[Danh sách tên môn, ví dụ: "tuh", "csdl"]**. Bạn có muốn tự động gộp các môn trùng tên này lại để các bộ thẻ nằm chung trong 1 môn học duy nhất không?"*
         - Nút **`"Gộp ngay các môn trùng tên"`**: Gọi `await db.mergeDuplicateSubjectGroups(dupGroups)`, làm mới toàn bộ giao diện (`renderDashboard`, `renderDecks`, `renderQuestionBank`, `renderStats`) và báo Toast `"Đã gộp thành công các môn học trùng tên!"`.
         - Nút **`"Để riêng"`**: Đóng hộp thoại và giữ nguyên.

---

### 4. Căn Chỉnh Thẳng Hàng Tuyệt Đối Nội Dung Trong Các Lựa Chọn Đáp Án (`.quiz-option-btn` — `image_c9ed19.jpg` & `image_c9ecc1.jpg`) Ở Cả 3 Theme & Phóng To Hộp Giải Thích + Chống Tràn Text
- **Giải phẫu 2 nguyên nhân gây lệch đáp án & chữ giải thích bé**:
  1. **Tại sao nội dung trong 4 lựa chọn A, B, C, D bị lệch trục dọc (`image_c9ecc1.jpg` & `image_c9ed19.jpg`)?**
     - Trong `css/style.css` dòng `94596–94635`:
       - `.quiz-option-btn` đang đặt `align-items: flex-start !important;` trong khi chiều cao nút là `min-height: 58px`, khiến các đáp án 1 dòng bị dính sát lên mép trên của nút!
       - Hơn nữa, `.quiz-option-letter` (`A.`, `B.`, `C.`, `D.`) lại có `margin-top: 2px; font-size: 1rem;` còn `.quiz-option-content` có `font-size: 0.95rem;`! Sự chênh lệch `margin-top: 2px` và `font-size` này làm chữ `A.` bị tụt thấp hơn hẳn so với chữ `"Cây cân bằng (B-cây)"` ở `image_c9ecc1.jpg`, và làm `A.` bị treo lệch ở mép trên khi gặp phân số $\frac{n-1}{n}$ ở `image_c9ed19.jpg`!
  2. **Tại sao phần Giải thích (`#quiz-explanation-text`) vẫn còn bé?**
     - Trong `index.html` dòng `91181`, thẻ `<div id="quiz-explanation-text">` đang có **inline style cứng `style="font-size: 0.875rem; line-height: 1.625; ..."`** VÀ trong `css/style.css` dòng `96699` có rule `body.quiz-active #quiz-explanation-text { font-size: 0.875rem !important; }` (độ ưu tiên `1, 1, 1` thắng `#quiz-explanation-text` đơn lẻ)!
- **Giải pháp bắt buộc trong `index.html` và `css/style.css`**:
  1. **Trong `index.html` (dòng `91181`)**:
     - Gỡ bỏ `font-size: 0.875rem; line-height: 1.625;` khỏi thuộc tính inline `style` của `#quiz-explanation-text` (giữ nguyên `id="quiz-explanation-text" class="text-sm leading-relaxed"` để tương thích 100% với unit test).
  2. **Thêm khối CSS chuẩn hóa căn giữa trục dọc cho `.quiz-option-btn` và phóng to `#quiz-explanation-text` vào cuối `css/style.css`**:
     ```css
     /* ==========================================================================
        4. CĂN CHỈNH THẲNG HÀNG TUYỆT ĐỐI CÁC LỰA CHỌN ĐÁP ÁN (.quiz-option-btn)
           & PHÓNG TO RÕ NÉT HỘP GIẢI THÍCH Ở CẢ 3 THEME (CHỐNG TRÀN TEXT 100%)
        ========================================================================== */

     /* 1. Căn giữa theo trục dọc (align-items: center) cho toàn bộ nút đáp án ở cả Quiz, Thi thử & Ngân hàng */
     html body #view-study .quiz-option-btn,
     html body #view-exam .quiz-option-btn,
     html body .quiz-option-btn {
       display: flex !important;
       flex-direction: row !important;
       align-items: center !important; /* Căn giữa hoàn hảo cả chữ 1 dòng lẫn phân số LaTeX */
       justify-content: flex-start !important;
       gap: 12px !important;
       min-height: 58px !important;
       height: auto !important;
       padding: 14px 20px !important;
       box-sizing: border-box !important;
       overflow: visible !important;
     }

     /* Đồng bộ hoàn toàn cỡ chữ, line-height và xóa margin-top: 2px gây lệch của chữ cái A. B. C. D. */
     html body .quiz-option-btn .quiz-option-letter {
       display: inline-flex !important;
       align-items: center !important;
       justify-content: flex-start !important;
       margin: 0 !important;
       padding: 0 !important;
       font-size: 1.02rem !important;
       font-weight: 800 !important;
       line-height: 1.5 !important;
       min-width: 24px !important;
       flex-shrink: 0 !important;
       align-self: center !important;
     }

     html body .quiz-option-btn .quiz-option-content {
       flex: 1 1 auto !important;
       min-width: 0 !important;
       max-width: 100% !important;
       margin: 0 !important;
       padding: 0 !important;
       font-size: 1.02rem !important;
       line-height: 1.55 !important;
       text-align: left !important;
       align-self: center !important;
       overflow-wrap: break-word !important;
       word-break: break-word !important;
       white-space: normal !important;
     }

     /* Căn chỉnh luôn các ô đáp án trong Ngân hàng câu hỏi (.bank-option-cell) */
     html body .bank-card-options-grid .bank-option-cell {
       display: flex !important;
       align-items: center !important;
       gap: 10px !important;
       padding: 12px 16px !important;
       font-size: 0.98rem !important;
       line-height: 1.55 !important;
       overflow-wrap: break-word !important;
       word-break: break-word !important;
     }

     /* 2. Phóng to chữ và công thức LaTeX trong Hộp Giải Thích (vượt qua độ ưu tiên của body.quiz-active) */
     html body #view-study #quiz-explanation-box.show,
     html body.quiz-active #quiz-explanation-box.show {
       padding: 20px 24px !important;
       border-radius: 16px !important;
       margin-top: 18px !important;
       gap: 10px !important;
       max-width: 100% !important;
       box-sizing: border-box !important;
       overflow-x: auto !important;
       overflow-y: visible !important;
     }

     html body #view-study .quiz-explanation-title,
     html body.quiz-active .quiz-explanation-title {
       font-size: 1.06rem !important;
       font-weight: 800 !important;
       margin-bottom: 4px !important;
     }

     html body #view-study #quiz-explanation-box #quiz-explanation-text,
     html body.quiz-active #view-study #quiz-explanation-text,
     html body.quiz-active #quiz-explanation-text,
     html body #quiz-explanation-text {
       font-size: 1.06rem !important;
       line-height: 1.74 !important;
       max-width: 100% !important;
       width: 100% !important;
       overflow-wrap: break-word !important;
       word-break: break-word !important;
       white-space: normal !important;
       box-sizing: border-box !important;
     }

     html body #quiz-explanation-text .katex,
     html body.quiz-active #quiz-explanation-text .katex {
       font-size: 1.22em !important;
       white-space: normal !important;
     }
     ```

---

### 5. Thu Gọn Nút Thoát Chế Độ Tập Trung (`#btn-focus-exit` / `.focus-exit-btn`) Thành Nút Icon + Nhãn Ngắn Tinh Tế
- **Hiện trạng**: Nút `#btn-focus-exit` hiện tại đang hiển thị cả câu dài `"✕ Thoát Chế Độ Tập Trung (Focus Mode)"` quá to và thô ở góc màn hình.
- **Giải pháp trong `index.html` và `css/style.css`**:
  1. **Trong `index.html` (dòng `90539`)**:
     - Thay nội dung bên trong `<button id="btn-focus-exit" ...>` thành icon thu nhỏ màn hình (Minimize SVG) kèm chữ ngắn gọn `"Thoát tập trung"`:
       ```html
       <button id="btn-focus-exit" class="btn btn-secondary focus-exit-btn" onclick="App.toggleFocusMode()" title="Thoát chế độ tập trung (ESC)" aria-label="Thoát chế độ tập trung">
         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
         </svg>
         <span>Thoát tập trung</span>
       </button>
       ```
  2. **Trong `css/style.css` (Thiết kế `#btn-focus-exit` nhỏ gọn, thanh lịch theo đúng 3 theme)**:
     ```css
     html body #btn-focus-exit.focus-exit-btn {
       position: fixed !important;
       top: 14px !important;
       right: 16px !important;
       height: 34px !important;
       min-height: 34px !important;
       padding: 0 12px !important;
       border-radius: 999px !important;
       font-size: 0.78rem !important;
       font-weight: 600 !important;
       display: none !important;
       align-items: center !important;
       justify-content: center !important;
       gap: 6px !important;
       z-index: 1100 !important;
       backdrop-filter: blur(16px) saturate(160%) !important;
       -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
     }

     html body.focus-mode-active #btn-focus-exit.focus-exit-btn,
     html body.focus-mode #btn-focus-exit.focus-exit-btn {
       display: inline-flex !important;
       visibility: visible !important;
       pointer-events: auto !important;
     }

     /* Trên màn hình nhỏ / Mobile: chỉ hiện nút tròn 34x34px chứa icon thu nhỏ cực gọn */
     @media (max-width: 640px) {
       html body #btn-focus-exit.focus-exit-btn {
         width: 36px !important;
         min-width: 36px !important;
         height: 36px !important;
         padding: 0 !important;
       }
       html body #btn-focus-exit.focus-exit-btn span {
         display: none !important;
       }
     }
     ```

---

### 6. Bổ Sung Tính Năng "Quay Lại Câu Trước (`prevStudyQuestion`)" Trong Cả Chế Độ Ôn Tập (Quiz) Và Chế Độ Lật Thẻ (Flashcard)
- **Yêu cầu từ người dùng**: Cho phép người học quay lại câu hỏi trước đó khi đang ở trong **Chế độ Ôn tập (Quiz)** cũng như khi đang ở trong **Chế độ Lật thẻ (Flashcard)**.
- **Thiết kế Giao Diện & Trải Nghiệm Người Dùng (Desktop + Mobile + Phím tắt bàn phím)**:
  1. **Nút `"← Câu trước"` trên Thanh Header bài học (`.quiz-header-bar` trong `#view-study`) VÀ trên Thanh công cụ / Footer**:
     - **Ở `.quiz-header-bar` (dùng chung cho cả Quiz và Flashcard trên cả Desktop lẫn Mobile)**:
       - Thêm nút viên thuốc gọn đẹp `#btn-study-prev` (`← Câu trước`) ngay bên trái bộ đếm `#study-counter` (`1 / 10`):
         ```html
         <button id="btn-study-prev" type="button" class="btn btn-secondary btn-study-prev" onclick="App.prevStudyQuestion()" title="Quay lại câu trước (Phím mũi tên trái ←)" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 999px; display: none;">
           ← Câu trước
         </button>
         ```
       - Khi `session.currentIndex > 0`: Hiển thị `#btn-study-prev` (`display: inline-flex`). Khi đang ở Câu 1 (`session.currentIndex === 0`): Ẩn hoặc làm mờ `disabled` `#btn-study-prev`.
     - **Ở chân thẻ Ôn tập Quiz (`.quiz-footer-actions` trong `#study-quiz-area`)**:
       - Bổ sung nút `#btn-quiz-prev` (`← Câu trước`) nằm bên trái nút `#btn-quiz-next` (`Câu tiếp theo →`):
         ```html
         <div class="quiz-footer-actions" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
           <button id="btn-quiz-prev" type="button" class="btn btn-secondary btn-quiz-prev" onclick="App.prevStudyQuestion()" style="display: none;">
             ← Câu trước
           </button>
           <button id="btn-quiz-next" type="button" class="btn btn-primary btn-quiz-next" onclick="App.nextStudyQuestion()" style="margin-left: auto;">
             Câu tiếp theo
           </button>
         </div>
         ```
     - **Ở chế độ Lật thẻ Flashcard (`#study-flashcard-area`)**:
       - Trên thanh `.flashcard-actions-toolbar` (ngay phía trên thẻ Flashcard), đặt nút **`← Câu trước`** (`#btn-flashcard-prev`) ở bên trái và nút **`Câu tiếp →`** (`#btn-flashcard-next`, hiện ra khi đang xem lại thẻ cũ đã đánh giá để tiến lên thẻ tiếp theo mà không bắt buộc phải chấm điểm lại) bên cạnh, trong khi 3 nút Bookmark / Flag / Edit nằm ở bên phải:
         ```html
         <div class="card-actions-toolbar flashcard-actions-toolbar" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
           <div style="display: flex; align-items: center; gap: 8px;">
             <button id="btn-flashcard-prev" type="button" class="btn btn-secondary" onclick="event.stopPropagation(); App.prevStudyQuestion()" title="Quay lại thẻ trước (←)" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 999px; display: none;">
               ← Câu trước
             </button>
             <button id="btn-flashcard-next" type="button" class="btn btn-secondary" onclick="event.stopPropagation(); App.nextFlashcardReview()" title="Sang thẻ tiếp theo (→)" style="padding: 5px 12px; font-size: 0.8rem; border-radius: 999px; display: none;">
               Câu tiếp →
             </button>
           </div>
           <div style="display: flex; align-items: center; gap: 8px;">
             <button id="btn-flashcard-bookmark" class="btn-card-action" title="Lưu thẻ quan trọng" onclick="event.stopPropagation(); App.toggleCurrentCardBookmark()">☆</button>
             <button id="btn-flashcard-flag" class="btn-card-action" title="Đánh dấu câu hỏi diễn đạt chưa rõ" onclick="event.stopPropagation(); App.toggleCurrentCardFlag()">⚑</button>
             <button id="btn-flashcard-edit" class="btn-card-action" title="Sửa nhanh nội dung câu hỏi" onclick="event.stopPropagation(); App.openEditCurrentCardModal()">✏️</button>
           </div>
         </div>
         ```
  2. **Logic xử lý `prevStudyQuestion()` và bảo toàn điểm số trong `js/app.js`**:
     - **Hàm `prevStudyQuestion()`**:
       ```javascript
       prevStudyQuestion() {
         const now = Date.now();
         if (this._lastPrevClick && now - this._lastPrevClick < 180) return;
         this._lastPrevClick = now;

         const session = this.activeSession;
         if (!session || session.currentIndex <= 0) return;

         this.clearPerQuestionTimer();
         session.currentIndex--;
         session.blindRevealed = true; // Khi lùi lại câu đã qua thì mở luôn không che Blind Veil

         window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
         const mainEl = document.querySelector('.app-main');
         if (mainEl) mainEl.scrollTop = 0;

         this.renderActiveStudyCard();
       },

       nextFlashcardReview() {
         const session = this.activeSession;
         if (!session) return;
         if (session.currentIndex < session.cards.length - 1) {
           session.currentIndex++;
           this.renderActiveStudyCard();
         }
       },
       ```
     - **Chống cộng điểm trùng lặp khi người dùng đánh giá lại một thẻ Flashcard đã đánh giá trước đó (`rateFlashcard(rating)`)**:
       - Trong `session`, lưu `session.flashcardHistory = session.flashcardHistory || {};` và `session.maxReachedIndex = Math.max(session.maxReachedIndex || 0, session.currentIndex);`.
       - Trong `rateFlashcard(rating)`:
         ```javascript
         session.flashcardHistory = session.flashcardHistory || {};
         const prevRating = session.flashcardHistory[session.currentIndex];
         const isCorrect = rating >= 3;

         if (prevRating !== undefined) {
           // Nếu thẻ này đã được đánh giá trước đó và người dùng quay lại chấm lại:
           // Khấu trừ kết quả cũ trước khi cộng kết quả mới để không bị tính đúp số câu!
           const wasCorrect = prevRating >= 3;
           if (wasCorrect) session.correctCount = Math.max(0, session.correctCount - 1);
           else session.incorrectCount = Math.max(0, session.incorrectCount - 1);
         }
         session.flashcardHistory[session.currentIndex] = rating;
         ```
     - **Cập nhật trạng thái ẩn/hiện của các nút `← Câu trước` trong `renderActiveStudyCard()`**:
       ```javascript
       const canGoPrev = session.currentIndex > 0;
       session.maxReachedIndex = Math.max(session.maxReachedIndex || 0, session.currentIndex);

       const headerPrevBtn = document.getElementById('btn-study-prev');
       if (headerPrevBtn) {
         headerPrevBtn.style.display = canGoPrev ? 'inline-flex' : 'none';
       }

       const quizPrevBtn = document.getElementById('btn-quiz-prev');
       if (quizPrevBtn) {
         quizPrevBtn.style.display = canGoPrev ? 'inline-flex' : 'none';
       }

       const fcPrevBtn = document.getElementById('btn-flashcard-prev');
       if (fcPrevBtn) {
         fcPrevBtn.style.display = canGoPrev ? 'inline-flex' : 'none';
       }

       const fcNextBtn = document.getElementById('btn-flashcard-next');
       if (fcNextBtn) {
         const canGoForward = session.currentIndex < (session.maxReachedIndex || 0) ||
                              (session.flashcardHistory && session.flashcardHistory[session.currentIndex] !== undefined);
         fcNextBtn.style.display = canGoForward ? 'inline-flex' : 'none';
       }
       ```
     - **Trong `_renderQuizContent(card)`**:
       - Khi `session.currentIndex > 0` (ngay cả khi câu hiện tại chưa trả lời `isAnswered === false`), vẫn cho phép `.quiz-footer-actions` hiển thị nút `#btn-quiz-prev` (`← Câu trước`) trong khi ẩn `#btn-quiz-next` (hoặc người dùng có thể bấm nút `#btn-study-prev` trên thanh Header bất kỳ lúc nào)!
     - **Hỗ trợ phím tắt bàn phím (`ArrowLeft`)**:
       - Trong trình lắng nghe `keydown` toàn cục: khi đang ở `#view-study.active` (và không focus trong `<input>` / `<textarea>`), nếu nhấn phím `ArrowLeft` thì gọi `this.prevStudyQuestion()`.

---

## DANH SÁCH KIỂM TRA NGHIỆM THU (VERIFICATION CHECKLIST — 6 HẠNG MỤC)

- [ ] **1.** Bấm nút thùng rác xóa bộ thẻ (`.deck-delete-btn`) trên bất kỳ bộ thẻ nào sẽ mở hộp thoại xác nhận Liquid Glass (`#modal-confirm-delete-deck`); khi bấm `"Xóa vĩnh viễn"`, bộ thẻ và các câu hỏi bên trong được xóa ngay lập tức khỏi IndexedDB và biến mất ngay trên giao diện.
- [ ] **2.** Prompt tạo câu hỏi AI (`copyAIPrompt`) đã có lệnh cấm sinh `[cite: ...]`; đồng thời hàm `stripCitationArtifacts` đã lọc sạch mọi `[cite: 1, 2, 3]`, `[cite_start]`, `【...】` cả khi parse câu mới, khi render, lẫn quét dọn sạch toàn bộ câu hỏi đã lưu trong IndexedDB (như câu trong Ảnh 1).
- [ ] **3.** Khi gộp dữ liệu Backup từ file `.json`, nếu phát hiện các môn học có cùng tên viết giống hệt nhau, hệ thống hiển thị thông báo & hộp thoại gợi ý gộp các môn trùng tên đó lại thành 1 môn duy nhất.
- [ ] **4.** Nội dung trong 4 lựa chọn đáp án A, B, C, D (`.quiz-option-btn`) căn giữa thẳng hàng trục dọc hoàn hảo ở cả 3 theme; hộp Giải thích (`#quiz-explanation-text`) hiển thị chữ và công thức LaTeX to rõ (`1.06rem` / `1.22em`), không bao giờ tràn chữ.
- [ ] **5.** Nút thoát chế độ tập trung (`#btn-focus-exit`) đã được thu gọn thành viên thuốc nhỏ (`34px`) gồm icon thu nhỏ + chữ `"Thoát tập trung"` (và chỉ hiện icon tròn `36px` trên Mobile).
- [ ] **6.** Trong cả **Chế độ Ôn tập (Quiz)** và **Chế độ Lật thẻ (Flashcard)**, khi đang ở câu thứ 2 trở đi, người học có thể bấm nút **`← Câu trước`** (hoặc nhấn phím mũi tên trái `←`) để quay lại xem câu/thẻ trước đó (giữ nguyên đáp án đã chọn và giải thích ở Quiz, hỗ trợ tiến lên lại câu đang làm, không bị cộng trùng điểm số).
- [ ] **7.** Cập nhật `docs/ARCHITECTURE_GRAPH.md` (và `ARCHITECTURE_GRAPH.md`), chạy `npm test` và `npm run build` đạt 100% PASS.