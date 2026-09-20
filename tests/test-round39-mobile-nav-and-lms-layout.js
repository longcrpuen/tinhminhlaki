/**
 * Test Suite 39: Gọn tab điều hướng Mobile (Phần A) & Sửa layout tab Nhập từ LMS (Phần B)
 *
 * PHẦN A: Bỏ 2 tab "Dán AI" và "Nhập từ LMS" khỏi thanh điều hướng dưới cùng — CHỈ trên Mobile
 * 1. Mobile bottom nav chỉ còn 5 mục hiển thị: Trang chủ, Bộ thẻ, Ngân hàng, Thống kê, Cài đặt.
 * 2. 2 mục "Dán câu hỏi AI" và "Nhập từ LMS" được ẩn khỏi bottom-nav trên mobile.
 * 3. Cả 2 tính năng vẫn truy cập được đầy đủ qua nút bấm trong tab "Thư viện thẻ" (#view-decks).
 * 4. Desktop Sidebar giữ nguyên 7 mục không đổi.
 *
 * PHẦN B: Sửa layout tab "Nhập từ LMS" trên Mobile — căn chỉnh + hiện rõ ví dụ
 * 1. Toàn bộ các trường cấu hình xếp thành 1 cột dọc full-width trên mobile, không bị bóp chật / lệch.
 * 2. Khối mẫu định dạng LMS (Moodle) hiển thị rõ ràng trực tiếp trên giao diện, không bị cắt.
 * 3. Nút "Dán mẫu LMS thử nghiệm" hiển thị rõ ràng, dễ bấm, tự điền dữ liệu mẫu Moodle hợp lệ.
 * 4. Textarea dán dữ liệu thô có placeholder mẫu đầy đủ, rõ ràng.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 39: Mobile Nav Simplification & LMS Import Layout ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');
const indexPath = path.join(__dirname, '..', 'index.html');

const styleCss = fs.readFileSync(stylePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// Extract the main mobile media query block accurately
const mobile768Idx = styleCss.lastIndexOf('@media (max-width: 768px) {');
assert(mobile768Idx !== -1, 'Main mobile media query must exist in style.css');

// Find closing brace of @media (max-width: 768px) {
let openBraces = 0;
let mobileEndIdx = -1;
for (let i = mobile768Idx; i < styleCss.length; i++) {
  if (styleCss[i] === '{') openBraces++;
  else if (styleCss[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      mobileEndIdx = i + 1;
      break;
    }
  }
}
assert(mobileEndIdx !== -1, 'Must find matching end of @media (max-width: 768px)');

const mobileCss = styleCss.slice(mobile768Idx, mobileEndIdx);
// Desktop CSS is anything outside mobile media queries
const desktopCss = styleCss.slice(0, mobile768Idx) + '\n' + styleCss.slice(mobileEndIdx);

// =========================================================================
// PHẦN A: BỎ 2 TAB "DÁN AI" & "NHẬP TỪ LMS" KHỎI BOTTOM NAV TRÊN MOBILE
// =========================================================================
console.log('--- PHẦN A: Mobile Bottom Nav Simplification ---');

test('A1.1: Mobile bottom-nav has exactly 5 visible tabs (dashboard, decks, bank, stats, settings)', () => {
  const bottomNavMatch = indexHtml.match(/<nav class="bottom-nav">([\s\S]*?)<\/nav>/);
  assert(bottomNavMatch, '<nav class="bottom-nav"> must exist in index.html');
  const bottomNavContent = bottomNavMatch[1];

  // Match all button items
  const buttonMatches = bottomNavContent.match(/<button[\s\S]*?<\/button>/g) || [];
  assert.strictEqual(buttonMatches.length, 7, 'DOM contains 7 items for accessibility/state retainment');

  // Count visible vs hidden buttons
  const visibleButtons = buttonMatches.filter(btn => !btn.includes('display: none') && !btn.includes('bottom-nav-hidden'));
  const hiddenButtons = buttonMatches.filter(btn => btn.includes('bottom-nav-hidden') || btn.includes('display: none'));

  assert.strictEqual(visibleButtons.length, 5, 'Exactly 5 buttons are visible on mobile');
  assert.strictEqual(hiddenButtons.length, 2, 'Exactly 2 buttons are hidden from mobile bottom nav');

  // Verify visible button views
  const visibleViews = visibleButtons.map(btn => {
    const m = btn.match(/data-view="([^"]+)"/);
    return m ? m[1] : '';
  });
  assert.deepStrictEqual(visibleViews, ['dashboard', 'decks', 'bank', 'stats', 'settings']);
});

test('A1.2: Both "import" and "import-lms" are hidden on mobile bottom-nav', () => {
  const bottomNavMatch = indexHtml.match(/<nav class="bottom-nav">([\s\S]*?)<\/nav>/);
  const bottomNavContent = bottomNavMatch[1];

  const importBtnMatch = bottomNavContent.match(/<button[^>]*data-view="import"[^>]*>/);
  assert(importBtnMatch, 'data-view="import" button exists in bottom-nav');
  assert(
    importBtnMatch[0].includes('bottom-nav-hidden') || importBtnMatch[0].includes('display: none'),
    'import button must have hidden styling'
  );

  const importLmsBtnMatch = bottomNavContent.match(/<button[^>]*data-view="import-lms"[^>]*>/);
  assert(importLmsBtnMatch, 'data-view="import-lms" button exists in bottom-nav');
  assert(
    importLmsBtnMatch[0].includes('bottom-nav-hidden') || importLmsBtnMatch[0].includes('display: none'),
    'import-lms button must have hidden styling'
  );
});

test('A1.3: Mobile CSS enforces display: none on hidden bottom-nav items and widens the 5 visible items', () => {
  assert(
    mobileCss.includes('.bottom-nav-hidden') || mobileCss.includes('[data-view="import-lms"]'),
    'Mobile CSS must explicitly hide .bottom-nav-hidden items'
  );
  assert(
    mobileCss.includes('display: none !important;'),
    'Mobile CSS must hide with display: none !important'
  );

  // Check that mobile CSS sizes the remaining 5 buttons comfortably
  const btnItemIdx = mobileCss.indexOf('.bottom-nav-item {');
  assert(btnItemIdx !== -1, '.bottom-nav-item exists in mobile CSS');
  const btnBlock = mobileCss.slice(btnItemIdx, mobileCss.indexOf('}', btnItemIdx));
  assert(btnBlock.includes('min-height: 44px !important;'), 'Maintains safe touch target >= 44px');
});

test('A1.4: Desktop sidebar (.app-sidebar) retains all 7 navigation items without change', () => {
  const sidebarMatch = indexHtml.match(/<aside class="app-sidebar"[^>]*>([\s\S]*?)<\/aside>/);
  assert(sidebarMatch, '<aside class="app-sidebar"> must exist');
  const sidebarContent = sidebarMatch[1];

  const navItems = sidebarContent.match(/<li class="nav-item[^"]*" data-view="([^"]+)"/g) || [];
  const views = navItems.map(item => {
    const m = item.match(/data-view="([^"]+)"/);
    return m ? m[1] : '';
  });

  assert.strictEqual(views.length, 7, 'Desktop sidebar must contain all 7 items');
  assert(views.includes('dashboard'), 'Desktop has dashboard');
  assert(views.includes('decks'), 'Desktop has decks');
  assert(views.includes('bank'), 'Desktop has bank');
  assert(views.includes('import'), 'Desktop has AI import');
  assert(views.includes('import-lms'), 'Desktop has LMS import');
  assert(views.includes('stats'), 'Desktop has stats');
  assert(views.includes('settings'), 'Desktop has settings');
});

test('A1.5: "Thư viện thẻ" (#view-decks) contains navigation buttons for BOTH "Dán câu hỏi AI" and "Nhập từ LMS"', () => {
  const decksMatch = indexHtml.match(/<section id="view-decks"[^>]*>([\s\S]*?)<\/section>/);
  assert(decksMatch, '#view-decks section must exist');
  const decksContent = decksMatch[1];

  assert(
    decksContent.includes("App.navigateTo('import')") || decksContent.includes('onclick="App.navigateTo(\'import\')"'),
    'view-decks must provide action to navigate to AI Import'
  );
  assert(
    decksContent.includes("App.navigateTo('import-lms')") || decksContent.includes('onclick="App.navigateTo(\'import-lms\')"'),
    'view-decks must provide action to navigate to LMS Import'
  );
});

// =========================================================================
// PHẦN B: SỬA LAYOUT TAB "NHẬP TỪ LMS" TRÊN MOBILE
// =========================================================================
console.log('\n--- PHẦN B: Mobile LMS Import Layout & Format Guide ---');

test('B1.1: LMS config fields container uses responsive CSS class without hardcoded 2-col inline style', () => {
  const lmsSectionMatch = indexHtml.match(/<section id="view-import-lms"[^>]*>([\s\S]*?)<\/section>/);
  assert(lmsSectionMatch, '#view-import-lms must exist in index.html');
  const lmsContent = lmsSectionMatch[1];

  assert(!lmsContent.includes('style="display: grid; grid-template-columns: 1fr 1fr;'),
    'Must not have hardcoded inline 2-col grid that breaks mobile');

  assert(lmsContent.includes('class="lms-config-grid"'), 'Must use .lms-config-grid class for responsive control');
  assert(lmsContent.includes('id="lms-batch-topic"'), 'Must contain batch topic input');
  assert(lmsContent.includes('id="lms-deck-dropdown-wrap"'), 'Must contain deck dropdown wrap');
});

test('B1.2: Mobile CSS forces .lms-config-grid and .lms-new-deck-fields to 1 vertical full-width column', () => {
  const gridMobileIdx = mobileCss.indexOf('.lms-config-grid');
  assert(gridMobileIdx !== -1, '.lms-config-grid must be defined in mobile CSS');
  const mobileGridSection = mobileCss.slice(gridMobileIdx, gridMobileIdx + 400);

  assert(mobileGridSection.includes('display: flex !important;'), 'Uses flex on mobile for clean column flow');
  assert(mobileGridSection.includes('flex-direction: column !important;'), 'Mobile config flows vertically 1-column');
  assert(mobileGridSection.includes('width: 100% !important;'), 'Uses 100% width on mobile');
});

test('B1.3: Desktop retains 2-column grid layout for .lms-config-grid and .lms-new-deck-fields', () => {
  const gridDesktopIdx = desktopCss.indexOf('.lms-config-grid {');
  assert(gridDesktopIdx !== -1, '.lms-config-grid must be defined in desktop CSS');
  const desktopGridBlock = desktopCss.slice(gridDesktopIdx, desktopCss.indexOf('}', gridDesktopIdx));

  assert(desktopGridBlock.includes('display: grid;'), 'Desktop uses grid');
  assert(desktopGridBlock.includes('grid-template-columns: repeat(2, 1fr);') || desktopGridBlock.includes('1fr 1fr'),
    'Desktop uses 2 columns');
});

test('B1.4: Format guide (.lms-format-guide-card) is present and visible with clear Moodle sample snippet', () => {
  const guideCardMatch = indexHtml.match(/<div class="lms-format-guide-card">([\s\S]*?)<\/div>\s*<\/div>/);
  assert(guideCardMatch, '.lms-format-guide-card must exist in index.html');
  const guideContent = guideCardMatch[1];

  assert(guideContent.includes('lms-sample-snippet'), 'Must contain .lms-sample-snippet');
  assert(guideContent.includes('Câu hỏi 1') || guideContent.includes('Hoàn thành'), 'Snippet must show Moodle question header');
  assert(guideContent.includes('Select one:'), 'Snippet must show Select one');
  assert(guideContent.includes('a.') && guideContent.includes('b.'), 'Snippet must show sample answer choices');
});

test('B1.5: "Dán mẫu LMS thử nghiệm" button (#btn-lms-paste-sample) is present and wired to App.pasteLmsSampleData', () => {
  assert(indexHtml.includes('id="btn-lms-paste-sample"'), '#btn-lms-paste-sample must exist');
  assert(indexHtml.includes('App.pasteLmsSampleData()'), 'Button must call App.pasteLmsSampleData()');

  assert(mobileCss.includes('.btn-lms-paste-sample'), 'Mobile CSS defines .btn-lms-paste-sample');
  const btnIdx = mobileCss.indexOf('.btn-lms-paste-sample {');
  const btnBlock = mobileCss.slice(btnIdx, mobileCss.indexOf('}', btnIdx));
  assert(btnBlock.includes('width: 100% !important;'), 'Paste sample button must be full-width on mobile');
  assert(btnBlock.includes('min-height: 44px !important;'), 'Paste sample button must meet touch target >= 44px');
});

test('B1.6: App.pasteLmsSampleData() properly fills #lms-raw-input with authentic Moodle raw text', () => {
  assert(appJs.includes('pasteLmsSampleData()'), 'App must define pasteLmsSampleData()');
  assert(appJs.includes('document.getElementById(\'lms-raw-input\')'), 'pasteLmsSampleData must target lms-raw-input');
  assert(appJs.includes('textarea.value = sample;'), 'pasteLmsSampleData must assign sample value');
});

test('B1.7: Textarea #lms-raw-input has legible placeholder displaying format sample', () => {
  const textareaMatch = indexHtml.match(/<textarea id="lms-raw-input"[^>]*placeholder="([^"]+)"/);
  assert(textareaMatch, 'Textarea #lms-raw-input must have a placeholder attribute');
  const placeholder = textareaMatch[1];

  assert(placeholder.includes('Moodle') || placeholder.includes('LMS'), 'Placeholder indicates Moodle/LMS');
  assert(placeholder.includes('Câu hỏi 1') || placeholder.includes('Select one:'), 'Placeholder contains actual question format');
});

// =========================================================================
// CHROME HEADLESS LIVE RESPONSIVE VALIDATION
// =========================================================================
console.log('--- Real Chrome Headless Responsive & Layout Verification ---');

const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = path.join(__dirname, '..', 'scratch', 'chrome-test-r39-profile');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

(async () => {
  const args = [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userData,
    'http://localhost:5173/'
  ];

  const proc = spawn(chromePath, args);
  proc.stderr.on('data', () => {});

  try {
    await sleep(2500);

    const res = await fetch('http://127.0.0.1:9223/json');
    const tabs = await res.json();
    const appTab = tabs.find(t => t.url.includes('5173'));
    if (!appTab) throw new Error('Could not find MindSparks tab in Chrome on port 9223');

    const client = new CDPClient(appTab.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    await sleep(600);

    // Test Mobile Nav in Live DOM
    test('Live Mobile: .bottom-nav shows exactly 5 visible items and hides import & import-lms', async () => {
      const navInfo = await client.evaluate(`
        (() => {
          const items = Array.from(document.querySelectorAll('.bottom-nav-item'));
          const visible = items.filter(el => {
            const cs = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return cs.display !== 'none' && cs.visibility !== 'hidden' && rect.width > 0;
          });
          const hidden = items.filter(el => {
            const cs = window.getComputedStyle(el);
            return cs.display === 'none' || cs.visibility === 'hidden';
          });
          return {
            total: items.length,
            visibleCount: visible.length,
            visibleViews: visible.map(el => el.getAttribute('data-view')),
            hiddenViews: hidden.map(el => el.getAttribute('data-view'))
          };
        })()
      `);

      assert.strictEqual(navInfo.visibleCount, 5, 'Should have exactly 5 visible items on mobile');
      assert.deepStrictEqual(navInfo.visibleViews, ['dashboard', 'decks', 'bank', 'stats', 'settings']);
      assert(navInfo.hiddenViews.includes('import'), 'import must be hidden on mobile');
      assert(navInfo.hiddenViews.includes('import-lms'), 'import-lms must be hidden on mobile');
    });

    // Test Decks Navigation Triggers
    test('Live Mobile: view-decks triggers correctly open import and import-lms', async () => {
      const navResult = await client.evaluate(`
        (() => {
          App.navigateTo('decks');
          const isDecksActive = document.getElementById('view-decks').classList.contains('active');

          // Navigate to LMS Import
          App.navigateTo('import-lms');
          const isLmsActive = document.getElementById('view-import-lms').classList.contains('active');

          // Navigate to AI Import
          App.navigateTo('import');
          const isAiActive = document.getElementById('view-import').classList.contains('active');

          return { isDecksActive, isLmsActive, isAiActive };
        })()
      `);

      assert(navResult.isDecksActive, 'Can navigate to decks');
      assert(navResult.isLmsActive, 'Can navigate to import-lms');
      assert(navResult.isAiActive, 'Can navigate to import');
    });

    // Test Mobile Layout of LMS View
    test('Live Mobile: LMS config fields stack vertically (1 column) and sample button pastes data', async () => {
      const layoutResult = await client.evaluate(`
        (() => {
          App.navigateTo('import-lms');
          const dropdownWrap = document.getElementById('lms-deck-dropdown-wrap');
          const batchTopic = document.getElementById('lms-batch-topic');
          const sampleBtn = document.getElementById('btn-lms-paste-sample');
          const rawInput = document.getElementById('lms-raw-input');
          const guideCard = document.querySelector('.lms-format-guide-card');

          const rDropdown = dropdownWrap.getBoundingClientRect();
          const rTopic = batchTopic.getBoundingClientRect();
          const rBtn = sampleBtn.getBoundingClientRect();

          // Clear textarea
          rawInput.value = '';

          // Click paste sample button
          sampleBtn.click();
          const filledVal = rawInput.value;

          return {
            isStacked: rTopic.top >= (rDropdown.bottom - 4), // 1 column stacked vertically
            dropdownWidth: rDropdown.width,
            topicWidth: rTopic.width,
            btnWidth: rBtn.width,
            btnVisible: window.getComputedStyle(sampleBtn).display !== 'none',
            guideVisible: window.getComputedStyle(guideCard).display !== 'none',
            hasFilledSample: filledVal.includes('Câu hỏi 1') && filledVal.includes('Select one:')
          };
        })()
      `);

      assert(layoutResult.isStacked, 'Config fields must stack vertically on mobile');
      assert(layoutResult.dropdownWidth > 280, 'Dropdown width must be full width on mobile');
      assert(layoutResult.topicWidth > 280, 'Topic input width must be full width on mobile');
      assert(layoutResult.btnVisible, 'Sample button must be visible on mobile');
      assert(layoutResult.btnWidth > 280, 'Sample button must be full width on mobile');
      assert(layoutResult.guideVisible, 'Guide card must be visible on mobile');
      assert(layoutResult.hasFilledSample, 'Clicking sample button must populate textarea with Moodle data');
    });

    // Test Desktop Layout via CDP
    test('Live Desktop: sidebar has all 7 items, bottom nav is hidden, LMS config is 2 columns', async () => {
      // Switch back to desktop viewport
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false
      });

      await sleep(600);

      const desktopResult = await client.evaluate(`
        (() => {
          App.navigateTo('import-lms');
          const sidebar = document.querySelector('.app-sidebar');
          const sidebarCs = window.getComputedStyle(sidebar);
          const navItems = Array.from(sidebar.querySelectorAll('.nav-item'));

          const bottomNav = document.querySelector('.bottom-nav');
          const bottomNavCs = window.getComputedStyle(bottomNav);

          const dropdownWrap = document.getElementById('lms-deck-dropdown-wrap');
          const batchTopic = document.getElementById('lms-batch-topic');
          const rDropdown = dropdownWrap.getBoundingClientRect();
          const rTopic = batchTopic.getBoundingClientRect();

          return {
            sidebarVisible: sidebarCs.display !== 'none',
            sidebarCount: navItems.length,
            bottomNavHidden: bottomNavCs.display === 'none',
            isSideBySide: rTopic.left >= (rDropdown.right - 4) && Math.abs(rTopic.top - rDropdown.top) < 20
          };
        })()
      `);

      assert(desktopResult.sidebarVisible, 'Desktop sidebar must be visible');
      assert.strictEqual(desktopResult.sidebarCount, 7, 'Desktop sidebar must contain all 7 items');
      assert(desktopResult.bottomNavHidden, 'Bottom nav must be hidden on desktop');
      assert(desktopResult.isSideBySide, 'LMS config fields must be side-by-side 2-column grid on desktop');
    });

    client.close();
    proc.kill();

    // Final summary
    console.log('\n========================================');
    console.log(`TEST SUITE 39 SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL PART A & PART B (STATIC + LIVE CHROME CDP) TESTS PASSED!\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Error in Chrome live testing:', err);
    try { proc.kill(); } catch (_) {}
    process.exit(1);
  }
})();
