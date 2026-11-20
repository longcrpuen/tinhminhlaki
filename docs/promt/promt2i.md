# ĐẶC TẢ & PROMPT THỰC THI ĐỢT 2I (`docs/promt/promt2i.md`)
## Audit Hiệu Năng & Kiến Trúc — Đợt 1 (High-Impact, Low-Risk)

> **File theo dõi tiến độ đi kèm**: `docs/progress/progress2i.md`  
> **Phạm vi tác động**: `sw.js`, `scripts/build.js`, `index.html`, `js/app.js`, `js/db.js`, `js/lofi-music.js`, `js/parser.js`, `tests/test-runner.js`, `ARCHITECTURE_GRAPH.md`, `docs/ARCHITECTURE_GRAPH.md`.  
> **Không chạm tới (giữ cho Đợt 2)**: Mục `#4` (Event delegation tab/modal), `#7` (`renderMath`/`adaptOptionsLayout`/scroll), `#9` (`_memCache` hợp nhất), `#11` (`css/style.css` & `css/theme.css`).

---

## 1. MỤC TIÊU & PHẠM VI 7 HẠNG MỤC ĐỢT 1

1. **#1 — Service Worker Network-First & Auto-Update an toàn (`sw.js`, `js/app.js`, `scripts/build.js`)**:
   - `setupPWA()` kiểm tra `document.readyState === 'complete'` để không bị lỡ sự kiện `window.load` sau các `await` trong `App.init()`.
   - Bắt `controllerchange` có cờ `hadController` & `refreshing` để tự reload một lần khi SW mới chiếm quyền (tránh vòng lặp reload khi cài lần đầu).
   - `sw.js` dùng **Network-First (fallback Cache)** cho `index.html`, JS, CSS, JSON; dùng Cache-First + `event.waitUntil()` SWR cho media/fonts.
   - `scripts/build.js` tự sinh `CACHE_NAME` gắn SHA-256 hash 8 ký tự của các file runtime + UTC timestamp vào `dist/sw.js` và chạy `node --check`.
2. **#2 — Version-Gated `ensureDataIntegrity()` (`js/db.js`)**:
   - Gắn cờ `integrityCheckVersion` trong `meta` (so với `this._integrityVersion = 2`) để bỏ qua quét lại toàn bộ thẻ ở các lần mở app thông thường; giữ `importAll()` gọi `{ force: true }`.
   - Loại bỏ `JSON.stringify` lặp trong `healCorruptedCardOptions(card)` và tránh cấp phát mảng mới khi không có citation artifacts.
   - Bảo toàn nguyên chữ ký `async ensureDataIntegrity() {` để tương thích tuyệt đối với các test slice/eval trong `tests/test-runner.js`.
3. **#3 — Tinh gọn tải trang `index.html` & Vô hiệu hóa `initLiquidGlassLensFilter()` (`js/app.js`)**:
   - Xóa link CDN `katex.min.css` trùng lặp (`https://cdn.jsdelivr.net/...`), chỉ giữ duy nhất `./lib/katex/katex.min.css` đồng bộ `katex@0.18.7` với `./lib/katex/katex.min.js`.
   - Cắt bỏ 3 họ Google Fonts không dùng (`Anton`, `Lora`, `Merriweather`) và chuyển nạp Google Fonts sang dạng non-blocking (`media="print" onload="this.media='all'"` + `<noscript>`).
   - Chuyển `initLiquidGlassLensFilter()` thành no-op nhẹ (ngưng vòng lặp 65.536 pixel `256×256` + `toDataURL` + chèn SVG filter không có rule CSS nào sử dụng).
4. **#5 — Vá 4 bug runtime thực tế (`js/app.js`, `js/lofi-music.js`)**:
   - Thay `sounds.playThud()` (không tồn tại) trong `startPerQuestionTimer()` bằng `sounds.playIncorrect()`.
   - Sửa `c.srs.repetitions` thành `c.srs.repetition ?? c.srs.repetitions ?? 0` trong `renderDashboard()` để tính đúng chỉ số ghi nhớ.
   - Sửa filter tìm kiếm ở `renderDecks()` bóc đúng `item?.deck || item` khi đọc `.name` và `.description`.
   - Khởi tạo `this.currentIndex = 0` trong `LofiMusicPlayer`, dọn `disconnect()` đầy đủ `masterGainNode` / `vinylFilter` / `vinylGain` ở `stopProceduralSynth()`, tái sử dụng kết nối `MindSparksLofiDB` qua `_openLofiDB()`, và `URL.revokeObjectURL()` qua `revokeCustomTrackUrls()`.
5. **#6 — Web Worker Resilience & Tối ưu `renderStatsView()` + Heatmap Local Date (`js/app.js`, `js/db.js`)**:
   - `_worker.onerror` reject toàn bộ `_workerCallbacks` đang chờ, dọn timer và reset `_worker = null`; `callWorker()` hỗ trợ timeout (mặc định `8000ms`) tránh treo Promise vĩnh viễn.
   - `renderStatsView()` gom truy vấn qua 1 `Promise.all`, chiếu dữ liệu nhẹ `lightCards`/`lightLogs` (không kèm `question`/`options`/ảnh base64) sang `COMPUTE_STATS` và tái sử dụng trực tiếp `heatmapMap`, `subjectStats`, `topicStats` mà worker trả về.
   - Thống nhất `_formatLocalDateKey()` theo múi giờ địa phương giữa `db.getContributionHeatmapData()`, `App.renderContributionHeatmap()` và `js/worker.js`.
6. **#8 — Energy Wave Chamber DOM Cache & Cancelable RAF (`js/app.js`)**:
   - Cache các node SVG/HUD buồng sóng qua `_getWaveDomCache()`, dùng mảng đệm dựng chuỗi `d`, chỉ cập nhật gradient/title/filter/node active khi `activeZone` thay đổi, và lưu `_sliderAnimRafId` để `cancelAnimationFrame` khi đổi theme liên tiếp.
7. **#10 — Tối ưu thuật toán `js/parser.js`**:
   - Giới hạn số lần thử sửa JSON cắt cụt trong `_tryRepairAndParseJson()` (`MAX_REPAIR_ATTEMPTS = 30`, từ chối nhanh chuỗi không có `"`).
   - Nâng cấp `_mergeParsedJsonBlocks()` dùng `Map` (`byExactNorm`, `byPrefix20`, `byId`) đạt độ phức tạp $O(N)$ thay cho vòng `findIndex` $O(N^2)$.

---

## 2. TIÊU CHÍ NGHIỆM THU
- `node tests/test-runner.js` đạt 100% PASS (bao gồm Test Suite 40 mới cho Đợt 2i).
- `node scripts/build.js` chạy thành công 100% và sinh `CACHE_NAME` gắn hash + timestamp trong `dist/sw.js`.
- Cập nhật `ARCHITECTURE_GRAPH.md` & `docs/ARCHITECTURE_GRAPH.md` (sửa vai trò Web Worker của `js/worker.js` và bổ sung `sw.js`).
