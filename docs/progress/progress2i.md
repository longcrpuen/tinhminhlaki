# TIẾN ĐỘ THỰC HIỆN ĐỢT 2I (`docs/progress/progress2i.md`)
> **File đặc tả gốc**: `docs/promt/promt2i.md`  
> **Mục tiêu**: Triển khai 7 hạng mục Đợt 1 (High-impact, Low-risk: `#1, #2, #3, #5, #6, #8, #10`) từ báo cáo audit hiệu năng và kiến trúc.

---

## Checklist Tiến Độ

- [x] **#1 — Service Worker Network-First, Auto-Update & Build Cache Hashing**
  - [x] `sw.js`: Nâng `CACHE_NAME = 'mindsparks-v4.15.0'`; áp dụng Network-First (`cache: 'no-cache'`, fallback cache) cho HTML/JS/CSS/JSON; bọc mọi thao tác ghi cache nền (cả SWR) vào `event.waitUntil()`.
  - [x] `js/app.js`: `setupPWA()` kiểm tra `document.readyState === 'complete'` trước khi đăng ký `./sw.js`, truyền `{ updateViaCache: 'none' }`, lắng nghe `updatefound` để kích hoạt `SKIP_WAITING` và lắng nghe `controllerchange` với cờ `hadController` + `refreshing` tránh lặp reload vô hạn.
  - [x] `scripts/build.js`: Tính SHA-256 (8 hex) trên các file runtime cốt lõi + timestamp UTC, ghi đè `CACHE_NAME` thành `mindsparks-v4.15.0-<hash>-<stamp>` trong `dist/sw.js` và kiểm tra bằng `node --check`.

- [x] **#2 — Version-Gated `ensureDataIntegrity()` trong `js/db.js`**
  - [x] Bổ sung `this._integrityVersion = 2` và kiểm tra `meta` key `integrityCheckVersion` trong `ensureDataIntegrity()` (bảo toàn nguyên chữ ký `async ensureDataIntegrity() {` cho `tests/test-runner.js`).
  - [x] `importAll()` gọi `await this.ensureDataIntegrity({ force: true })`.
  - [x] Thay thế 2 chỗ `JSON.stringify` trong `healCorruptedCardOptions()` bằng so sánh mảng trực tiếp và tránh `.map()` cấp phát mảng thừa trên `c.options` nếu không có citation.

- [x] **#3 — Tinh gọn `index.html` & No-Op `initLiquidGlassLensFilter()`**
  - [x] Xóa link CDN `katex.min.css` trùng lặp ở `index.html`, chỉ giữ `./lib/katex/katex.min.css` đồng bộ `katex@0.18.7`.
  - [x] Loại bỏ 3 họ Google Fonts không dùng (`Anton`, `Lora`, `Merriweather`) và chuyển Google Fonts sang nạp non-blocking (`media="print" onload="this.media='all'"` + `<noscript>`).
  - [x] Chuyển `App.initLiquidGlassLensFilter()` thành no-op an toàn, cập nhật assertion tương thích tiến hóa tại Test Suite 16 (`tests/test-runner.js#L1180`).

- [x] **#5 — Sửa 4 Bug Runtime Thực Tế (`js/app.js`, `js/lofi-music.js`)**
  - [x] Thay `sounds.playThud()` bằng `sounds.playIncorrect()` trong `startPerQuestionTimer()`.
  - [x] Sửa `c.srs.repetitions` thành `c.srs.repetition ?? c.srs.repetitions ?? 0` trong `renderDashboard()`.
  - [x] Sửa tìm kiếm nhanh ở `renderDecks()` để bóc `item?.deck || item` khi đọc `.name` và `.description`.
  - [x] Khởi tạo `this.currentIndex = 0` trong `LofiMusicPlayer`, dọn `disconnect()` `masterGainNode` / `vinylFilter` / `vinylGain`, tái sử dụng kết nối `MindSparksLofiDB` qua `_openLofiDB()` và thu hồi `ObjectURL` qua `revokeCustomTrackUrls()`.

- [x] **#6 — Web Worker Resilience, Lightweight Stats & Local Heatmap Date**
  - [x] `initWorker()` / `callWorker()`: `_worker.onerror` reject và dọn toàn bộ `_workerCallbacks` đang chờ; thêm timeout `8000ms`.
  - [x] `renderStatsView()`: Chiếu `lightCards` / `lightLogs` (bỏ `question`, `options`, ảnh base64), tái sử dụng `heatmapMap`, `subjectStats`, `topicStats` từ worker thay vì truy vấn và duyệt lại trên main thread.
  - [x] Đồng bộ `_formatLocalDateKey()` theo giờ địa phương trong `js/db.js` và `js/app.js`.

- [x] **#8 — Cache DOM Buồng Sóng & Cancelable RAF (`js/app.js`)**
  - [x] Thêm `_getWaveDomCache()` thay cho 25 lần query DOM mỗi frame trong `_updateEnergyWaveVisuals()`.
  - [x] Dùng mảng đệm dựng path SVG, chỉ cập nhật gradient/nhãn/filter khi đổi vùng theme, và lưu `_sliderAnimRafId` để `cancelAnimationFrame` khi đổi theme liên tiếp.

- [x] **#10 — Tối ưu `js/parser.js`**
  - [x] Giới hạn vòng lặp sửa cắt cụt `_tryRepairAndParseJson()` tối đa `MAX_REPAIR_ATTEMPTS = 30`.
  - [x] Chuyển `_mergeParsedJsonBlocks()` sang index bằng `Map` (`byExactNorm`, `byPrefix20`, `byId`) đạt độ phức tạp $O(N)$.

- [x] **Kiểm thử, Đóng gói & Tài liệu**
  - [x] Bổ sung Test Suite 40 vào `tests/test-runner.js`.
  - [x] `node tests/test-runner.js` $\rightarrow$ **888 passed, 0 failed (100% PASS)**.
  - [x] `node scripts/build.js` $\rightarrow$ **Thành công (99 files, 4.61 MB, `CACHE_NAME` = `mindsparks-v4.15.0-7171a792-202611200622`)**.
  - [x] Cập nhật `ARCHITECTURE_GRAPH.md` & `docs/ARCHITECTURE_GRAPH.md` (phân định rõ Web Worker `js/worker.js` và Service Worker `sw.js`).
