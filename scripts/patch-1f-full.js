// scripts/patch-1f-full.js
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. UPDATE index.html
// ==========================================
const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const bookSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
const zapSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
const tagSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
const plusSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const copySvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`;
const cardsSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="14" rx="2" ry="2"></rect><path d="M6 3h12a2 2 0 0 1 2 2v12"></path></svg>`;
const chartSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
const shuffleSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`;
const inboxSvg = `<svg class="mono-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`;

// Decks top action buttons
html = html.replace('➕ Môn học mới', `${plusSvg} Môn học mới`);
html = html.replace('🔀 Gán lại môn', `${shuffleSvg} Gán lại môn`);
html = html.replace('📥 Nhập từ LMS', `${inboxSvg} Nhập từ LMS`);

// Question bank actions
html = html.replace('➕ Thêm câu hỏi mới', `${plusSvg} Thêm câu hỏi mới`);
html = html.replace('🚩 Sao chép Prompt AI viết lại', `${copySvg} Sao chép Prompt AI viết lại`);
html = html.replace('⚡ Luyện tập câu trong danh sách', `${zapSvg} Luyện tập câu trong danh sách`);

// Dropdown icons in question bank
html = html.replace('<span class="cyber-dropdown-icon" id="bank-subject-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="bank-subject-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="import-subject-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="import-subject-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="lms-subject-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="lms-subject-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="edit-card-subject-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="edit-card-subject-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="manage-subject-merge-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="manage-subject-merge-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="manage-subject-delete-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="manage-subject-delete-dropdown-icon">${bookSvg}</span>`);
html = html.replace('<span class="cyber-dropdown-icon" id="bulk-reassign-subject-dropdown-icon">📚</span>', `<span class="cyber-dropdown-icon" id="bulk-reassign-subject-dropdown-icon">${bookSvg}</span>`);

// Question bank difficulty/source triggers
html = html.replace(
  /<button type="button" class="cyber-dropdown-trigger" id="bank-diff-dropdown-trigger"[\s\S]*?<span class="cyber-dropdown-icon">⚡<\/span>/,
  (m) => m.replace('<span class="cyber-dropdown-icon">⚡</span>', `<span class="cyber-dropdown-icon">${zapSvg}</span>`)
);
html = html.replace(
  /<button type="button" class="cyber-dropdown-trigger" id="bank-source-dropdown-trigger"[\s\S]*?<span class="cyber-dropdown-icon">🏷️<\/span>/,
  (m) => m.replace('<span class="cyber-dropdown-icon">🏷️</span>', `<span class="cyber-dropdown-icon">${tagSvg}</span>`)
);

// Question bank difficulty options (strip emoji color circles)
html = html.replace('<span>🟢 Dễ (Easy)</span>', '<span>Dễ (Easy)</span>');
html = html.replace('<span>🟡 Vừa (Medium)</span>', '<span>Vừa (Medium)</span>');
html = html.replace('<span>🔴 Khó (Hard)</span>', '<span>Khó (Hard)</span>');

// Question bank source options
html = html.replace('<span>🎓 Nguồn: LMS</span>', '<span>Nguồn: LMS</span>');
html = html.replace('<span>✨ Nguồn: AI</span>', '<span>Nguồn: AI</span>');
html = html.replace('<span>✍️ Nguồn: Thủ công</span>', '<span>Nguồn: Thủ công</span>');

// Modal Session complete
html = html.replace(
  '<span class="pixel-battery-title"><span class="pixel-battery-icon">⚡</span> PIN NĂNG LƯỢNG</span>',
  `<span class="pixel-battery-title"><span class="pixel-battery-icon">${zapSvg}</span> PIN NĂNG LƯỢNG</span>`
);
html = html.replace('Xem thống kê 📊', `Xem thống kê ${chartSvg}`);

// Modal Create & Manage Subject preview icon
html = html.replace(
  '<span class="deck-subject-icon" id="create-subject-preview-icon">📚</span>',
  `<span class="deck-subject-icon" id="create-subject-preview-icon">${bookSvg}</span>`
);
html = html.replace(
  '<span class="deck-subject-icon" id="manage-subject-preview-icon">📚</span>',
  `<span class="deck-subject-icon" id="manage-subject-preview-icon">${bookSvg}</span>`
);
html = html.replace('Emoji (Emoji 1-Click):', 'Biểu tượng (Icon 1-Click):');
html = html.replace('Biểu tượng (Emoji 1-Click):', 'Biểu tượng (Icon 1-Click):');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('[patch-1f-full] index.html updated successfully.');

// ==========================================
// 2. UPDATE js/app.js
// ==========================================
const appPath = path.join(__dirname, '..', 'js', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// 2.1 Replace inline subject color and raw emoji in renderDashboardDecks
app = app.replace(
  /<span>📚 Tất cả môn<\/span>/g,
  `<span>\${this.getMonoSvg('globe')} Tất cả môn</span>`
);

app = app.replace(
  /<button type="button" class="dashboard-subject-pill \${isActive \? 'active' : ''}" style="--pill-color: \${s\.color \|\| '#a855f7'};" onclick="App\.filterDashboardDecks\('\${s\.id}'\)">\s*<span>\${s\.icon \|\| '📚'} \${this\._escapeHtml\(s\.name\)}<\/span>/g,
  `<button type="button" class="dashboard-subject-pill \${isActive ? 'active' : ''}" onclick="App.filterDashboardDecks('\${s.id}')">
              <span>\${this.renderSubjectIcon(s.icon)} \${this._escapeHtml(s.name)}</span>`
);

// 2.2 In _createDeckCardHtml, render subject badge with monochrome icon
app = app.replace(
  /<span class="deck-subject-badge">\${this\._escapeHtml\(subjName\)}<\/span>/g,
  `<span class="deck-subject-badge"><span class="deck-subject-icon">\${this.renderSubjectIcon(subject?.icon)}</span> <span class="deck-subject-name">\${this._escapeHtml(subjName)}</span></span>`
);

// 2.3 In renderDecks
app = app.replace(
  /<span class="mono-emoji">\${s\.icon \|\| '📚'}<\/span>/g,
  `<span class="mono-emoji">\${this.renderSubjectIcon(s.icon)}</span>`
);
app = app.replace(
  /<span class="subject-icon">\${s\.icon \|\| '📚'}<\/span>\s*<span class="subject-name" style="color: \${s\.color \|\| 'var\(--text-primary\)'};">\${this\._escapeHtml\(s\.name\)}<\/span>/g,
  `<span class="subject-icon">\${this.renderSubjectIcon(s.icon)}</span>
              <span class="subject-name">\${this._escapeHtml(s.name)}</span>`
);
app = app.replace(
  /🎯 Ôn cả môn/g,
  `\${this.getMonoSvg('target')} Ôn cả môn`
);
app = app.replace(
  /⚙️ Quản lý/g,
  `\${this.getMonoSvg('settings')} Quản lý`
);

// 2.4 In openTopicPickerModal
app = app.replace(
  /<span class="subject-badge" style="background: \${s\.subject\.color}15; color: \${s\.subject\.color}; border-color: \${s\.subject\.color}40;">\s*<span class="subject-badge-icon">\${s\.subject\.icon \|\| '📚'}<\/span>\s*<span>\${this\._escapeHtml\(s\.subject\.name\)}<\/span>\s*<\/span>/g,
  `<span class="subject-badge">
                <span class="subject-badge-icon">\${this.renderSubjectIcon(s.subject.icon)}</span>
                <span>\${this._escapeHtml(s.subject.name)}</span>
              </span>`
);

// 2.5 In renderSubjectPerformanceTable
app = app.replace(
  /<span style="margin-right: 6px;">\${stat\.subject\.icon \|\| '📚'}<\/span>\s*<span style="color: \${stat\.subject\.color \|\| 'var\(--text-primary\)'};">\${this\._escapeHtml\(stat\.subject\.name\)}<\/span>/g,
  `<span style="margin-right: 6px;">\${this.renderSubjectIcon(stat.subject.icon)}</span>
            <span>\${this._escapeHtml(stat.subject.name)}</span>`
);

// 2.6 In openBulkReassignModal
app = app.replace(
  /<span class="subject-badge" style="background: \${s\.color \|\| '#8b5cf6'}22; color: \${s\.color \|\| '#a78bfa'}; border: 1px solid \${s\.color \|\| '#8b5cf6'}44; margin-left: auto; flex-shrink: 0;">\${s\.icon \|\| '📁'} \${this\._escapeHtml\(s\.name\)}<\/span>/g,
  `<span class="subject-badge" style="margin-left: auto; flex-shrink: 0;"><span class="subject-badge-icon">\${this.renderSubjectIcon(s.icon)}</span> <span>\${this._escapeHtml(s.name)}</span></span>`
);

// 2.7 In renderQuestionBank: subject dropdown label & icon
app = app.replace(
  /const bankSubjLabel = document\.getElementById\('bank-subject-dropdown-label'\);\s*if \(bankSubjLabel\) \{[\s\S]*?bankSubjLabel\.textContent = curSubj \? `\${curSubj\.icon \|\| '📚'} \${curSubj\.name}` : 'Chọn môn học\.\.\.';\s*\}\s*\}/,
  `const bankSubjLabel = document.getElementById('bank-subject-dropdown-label');
    const bankSubjIcon = document.getElementById('bank-subject-dropdown-icon');
    if (bankSubjIcon) {
      bankSubjIcon.innerHTML = this.currentBankSubjectId === '__all__' ? this.getMonoSvg('globe') : this.renderSubjectIcon(curSubj?.icon);
    }
    if (bankSubjLabel) {
      if (this.currentBankSubjectId === '__all__') {
        bankSubjLabel.textContent = 'Tất cả môn';
      } else {
        bankSubjLabel.textContent = curSubj ? curSubj.name : 'Chọn môn học...';
      }
    }`
);

// 2.8 In renderQuestionBank: menu items
app = app.replace(
  /<span>\${s\.icon \|\| '📚'} \${this\._escapeHtml\(s\.name\)}<\/span>/g,
  `<span>\${this.renderSubjectIcon(s.icon)} \${this._escapeHtml(s.name)}</span>`
);
app = app.replace(
  /<span>🌐 Tất cả môn<\/span>/g,
  `<span>\${this.getMonoSvg('globe')} Tất cả môn</span>`
);
app = app.replace(
  /<span>➕ Tạo môn mới\.\.\.<\/span>/g,
  `<span>\${this.getMonoSvg('plus')} Tạo môn mới...</span>`
);

// 2.9 Replace purple divider border in dropdowns
app = app.replace(/rgba\(139,\s*92,\s*246,\s*0\.2\)/g, 'var(--accent-soft)');

fs.writeFileSync(appPath, app, 'utf8');
console.log('[patch-1f-full] js/app.js updated successfully.');
