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

---

# TIẾN ĐỘ THỰC HIỆN ĐỢT 2I (`docs/progress/progress2i.md`)
> **File đặc tả gốc**: `docs/promt/promt2i.md`  
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**: Khắc phục lỗi kẹt chuyển cảnh Slideshow, sửa lỗi mất chân vòng tròn photon, tái cấu trúc Hố đen dạng sợi khí mảnh đồng tâm dịu mắt chống chói, cập nhật bộ test suite 34 và hoàn tất đóng gói.

---

## Checklist Tiến Độ

- [x] **1. Khắc phục triệt để lỗi Slideshow bị kẹt 1 cảnh**
  - [x] Loại bỏ lệnh gọi `_loadStoredPreferences()` bên trong `_ensureScene()` (vốn bị kích hoạt ở mỗi frame render).
  - [x] Di chuyển `_loadStoredPreferences()` về chạy duy nhất 1 lần khi engine gọi `start()`, không ghi đè `_activeSceneId` khi chế độ phát đang là `slideshow`.
  - [x] Thêm thuộc tính `isDone: true` cho cả 2 renderer (`renderTreeScene` tại `cycleT >= 25.0s`, `renderGargantuaToBuffer` tại `cycleT >= 24.75s`).
  - [x] Cập nhật máy trạng thái trong `_tick()`: khi `res.isDone === true` (hoặc timeout `sceneElapsed >= curScene.duration`), nếu ở chế độ `slideshow`, tự động tăng `_activeSceneIndex = (_activeSceneIndex + 1) % SCENE_ORDER.length`, chuyển đổi luân phiên liên tục (Cây thông Noel -> Hố đen Gargantua -> Cây thông Noel...).
  - [x] Bổ sung phương thức `reset(now)` làm sạch toàn bộ mốc thời gian và xóa các buffer hiển thị/độ sâu (`_zBuf`, `_buf32`, `_activeCells`, `_winIdx`).
  - [x] Thêm bí danh `blackhole` trỏ tới `gargantua` trong bảng danh mục cảnh `SCENES` và hàm `setScene()` / `selectPreset()`.

- [x] **2. Khắc phục lỗi mất chân vòng tròn Hố đen**
  - [x] Nâng tâm dọc `cy` lên `height * 0.47` trên desktop và `height * 0.46` trên mobile.
  - [x] Giảm tỷ lệ `scale` ~15% (`scale = height * 0.85`), giữ cho bán kính photon ring và đĩa bồi tụ cách đáy màn hình > 34% chiều cao màn hình, hoàn toàn thoáng trên 4 thẻ thống kê.
  - [x] Bỏ hệ số nhân nén `* 0.65` ở `minGy` / `maxGy` trong tính toán bounding box, tránh cắt xén pixel ở biên trên/dưới.

- [x] **3. Thiết kế Hố đen dạng sợi khí mảnh đồng tâm & dịu mắt**
  - [x] Đồng tâm tuyệt đối: thống nhất tâm `(cx, cy)` cho chân trời sự kiện, đĩa bồi tụ, vành thấu kính Einstein và photon ring.
  - [x] Tạo sợi mảnh tách lớp: nhân hàm sóng xoáy lũy thừa bậc 3 `strand = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(rho * 42 - ang * 3 + t * 2.2), 3)`.
  - [x] Thu hẹp vành thấu kính Einstein `halo_band = Math.exp(-Math.pow(halo_dist / 0.055, 2.0))` kết hợp `halo_strand = 0.40 + 0.60 * Math.pow(...)` rõ từng đường cong khí.
  - [x] Chống chói mắt cho việc học tập: áp dụng `leftFade = isDesktop ? smoothstep(width * 0.22, width * 0.52, px) : 1.0` làm mờ dần ánh sáng nửa trái màn hình sau cụm chữ hero.
  - [x] Giới hạn độ sáng `heat <= 0.65` trong chu kỳ trình diễn thông thường.
  - [x] Áp dụng bảng màu cam cháy ấm dịu: `#8c2d0c` (nâu cam sẫm) → `#d95b16` (cam cháy) → `#f59e0b` (vàng hổ phách), sử dụng các ký tự thanh mảnh `.` `:` `-` `=` `+` `*`.

- [x] **4. Kiểm thử & Đóng gói sản xuất**
  - [x] `node tests/test-runner.js`: **1,215 passed, 0 failed** (100% test suites).
  - [x] `node scripts/build.js`: **100 files, 4.66 MB**, sẵn sàng PWA Offline.

---

## Báo Cáo Đo Đạc Hiệu Năng & Ký Tự Thực Tế
*(Thực hiện bằng benchmark tự động 60 frames trên màn hình Desktop chuẩn 1440×900, lưới điểm ảnh ASCII vi mô 5×8px, DPR = 1)*

| Cảnh hoạt ảnh | Số lượng ký tự trung bình (`letters`) | Thời gian dựng hình trung bình (`frame time`) | Đánh giá hiệu năng |
| :--- | :--- | :--- | :--- |
| **🌲 Cây thông Noel 3D** (`tree`) | **5,320 letters** | **5.20 ms / frame** | Sử dụng ~14.6% ngân sách 35.7 ms của 28 FPS |
| **🕳️ Hố đen Gargantua** (`gargantua`) | **5,812 letters** | **10.00 ms / frame** | Sử dụng ~28.0% ngân sách 35.7 ms của 28 FPS |

> **Nhận xét**: Cả 2 cảnh đều đạt độ phân giải ký tự cực mịn, hiển thị sắc nét các sợi khí uốn cong và tán lá cây thông 3D mà vẫn giữ thời gian dựng hình dưới 10 ms/frame, bảo đảm giao diện kính mờ Liquid Glass luôn phản hồi tức thì và không bị giật lag.
