// scripts/reorder-dashboard.js
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const isCrlf = html.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

// Normalize for finding indices
const startTag = '<div id="dashboard-content-below" class="dashboard-content-below">';
const startIndex = html.indexOf(startTag);

const endMarker = '<!-- 2. DECKS VIEW -->';
const endSectionIndex = html.indexOf(endMarker);

if (startIndex === -1 || endSectionIndex === -1) {
  console.error('Could not find dashboard content bounds');
  process.exit(1);
}

// Find the '</section>' just before endMarker
const closeSectionTag = '</section>';
const lastCloseSectionIndex = html.lastIndexOf(closeSectionTag, endSectionIndex);

const before = html.substring(0, startIndex);
const after = html.substring(lastCloseSectionIndex);

const modesHtml = `            <!-- Section 1: 7 Chế Độ Ôn Tập Thông Minh -->
            <div class="section-title-wrap" id="dashboard-modes-section">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <h3 class="section-title">7 Chế Độ Ôn Tập Thông Minh</h3>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Tự động phân bổ và tối ưu hóa dựa trên nguồn câu hỏi của bạn</p>
              </div>
            </div>

            <div class="study-modes-grid" id="study-modes-grid">
              <!-- Mode 1: Luyện tập tự do -->
              <div class="study-mode-card mode-card" data-mode="free" onclick="App.startSession(null, 'free')">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">1. Luyện tập tự do</h4>
                  <p class="study-mode-desc">Trộn ngẫu nhiên tất cả câu hỏi trong kho kiến thức để rèn luyện phản xạ không giới hạn.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Bắt đầu luyện tập</span>
                </div>
              </div>

              <!-- Mode 2: Ôn lại câu sai -->
              <div class="study-mode-card mode-card" data-mode="mistakes" onclick="App.startSession(null, 'mistakes')">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">2. Ôn lại câu sai</h4>
                  <p class="study-mode-desc">Ưu tiên các câu vừa làm sai gần nhất hoặc sai nhiều lần nhất để khắc phục lỗ hổng.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Luyện câu hay sai</span>
                </div>
              </div>

              <!-- Mode 3: Spaced Repetition SM-2 -->
              <div class="study-mode-card mode-card" data-mode="srs" onclick="App.startSession(null, 'srs')">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">3. Spaced Repetition</h4>
                  <p class="study-mode-desc">Xếp lịch ôn lại theo độ nhớ SM-2. Câu nhớ tốt giãn ngày ra, câu hay quên xuất hiện dày hơn.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Ôn theo chu kỳ</span>
                </div>
              </div>

              <!-- Mode 4: Kiểm tra có giới hạn thời gian -->
              <div class="study-mode-card mode-card" data-mode="exam" onclick="App.openExamModal()">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">4. Kiểm tra tính giờ</h4>
                  <p class="study-mode-desc">Mô phỏng phòng thi thật với đồng hồ đếm ngược (có thể bật/tắt), tổng kết điểm số chi tiết.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Vào phòng thi</span>
                </div>
              </div>

              <!-- Mode 5: Ôn theo Môn & Chương -->
              <div class="study-mode-card mode-card" data-mode="topic" id="btn-mode-topic" onclick="App.openTopicPickerModal()">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">5. Ôn theo Môn & Chương</h4>
                  <p class="study-mode-desc">Lựa chọn ôn tập toàn diện theo từng Môn học hoặc đi sâu vào từng Chương cụ thể.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Chọn môn / chương</span>
                </div>
              </div>

              <!-- Mode 6: Đoán trước khi xem đáp án -->
              <div class="study-mode-card mode-card" data-mode="blind" onclick="App.startSession(null, 'blind')">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">6. Đoán trước đáp án</h4>
                  <p class="study-mode-desc">Ẩn các lựa chọn, người học tự tư duy đáp án trong đầu trước, bấm để hiện đáp án đối chiếu.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Luyện phản xạ</span>
                </div>
              </div>

              <!-- Mode 7: Ôn nước rút trước thi -->
              <div class="study-mode-card mode-card" data-mode="sprint" onclick="App.openSprintModal()">
                <div>
                  <div class="study-mode-topbar">
                    <div class="study-mode-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
                    </div>
                  </div>
                  <h4 class="study-mode-title">7. Ôn nước rút</h4>
                  <p class="study-mode-desc">Tập trung các câu thuộc chủ đề bạn hay trả lời sai nhất để lấy lại điểm số cấp tốc.</p>
                </div>
                <div class="study-mode-footer">
                  <span class="study-mode-pill-btn">Cấu hình nước rút</span>
                </div>
              </div>
            </div>`;

const decksHtml = `            <!-- Section 2: Bộ câu hỏi theo Môn học -->
            <div class="section-title-wrap" id="dashboard-decks-section" style="margin-top: 36px;">
              <div>
                <h3 class="section-title">Bộ câu hỏi của bạn</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Phân loại theo từng Môn học và tiến độ ôn tập</p>
              </div>
              <button class="btn btn-secondary" style="font-size: 0.85rem;" onclick="App.navigateTo('decks')">
                Xem tất cả
              </button>
            </div>

            <div id="dashboard-subject-filters" class="dashboard-subject-filters"></div>
            <div id="dashboard-decks-grid" class="decks-grid"></div>`;

const newMiddle = `${startTag}${nl}${modesHtml}${nl}${nl}${decksHtml}${nl}          </div>${nl}        `;

html = before + newMiddle + after;
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('[reorder-dashboard] Successfully placed 7 Study Modes above Decks in index.html.');
