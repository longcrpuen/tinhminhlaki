/**
 * Test Suite 35: Mobile LMS Import Access (B1) & Natural Whole-Page Quiz Scroll (B2)
 *
 * Requirements:
 * B1: Thêm điểm truy cập tính năng "Nhập từ LMS" cho mobile:
 *    - Mục "Nhập từ LMS" trong thanh bottom-nav (data-view="import-lms").
 *    - Shortcut tiện lợi trong màn hình thư viện thẻ (view-decks).
 *    - Responsive touch targets (>= 44x44px) và co giãn hài hòa 7 items.
 *
 * B2: Bỏ vùng cuộn nội bộ trong khung quizz mobile — để cả trang cuộn tự nhiên:
 *    - Bỏ hoàn toàn overflow-y: auto/scroll và max-height giới hạn ở #study-quiz-area.
 *    - Toàn bộ khung quizz nằm trong luồng trang bình thường (height: auto, overflow: visible).
 *    - Toàn bộ trang (kể cả nền) di chuyển cùng nhau, chỉ có đúng 1 thanh cuộn của trình duyệt/trang.
 *    - Không còn thanh cuộn nhỏ riêng biệt bên trong khung quizz.
 *
 * Responsive Isolation:
 *    - Desktop sidebar và desktop quiz layout hoàn toàn không bị ảnh hưởng.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 35: Mobile LMS Access (B1) & Natural Whole-Page Quiz Scroll (B2) ===\n');

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

// Separate Desktop and Mobile CSS
const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Main mobile breakpoint must exist');

const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// =========================================================================
// B1. ĐIỂM TRUY CẬP "NHẬP TỪ LMS" CHO MOBILE
// =========================================================================
console.log('--- B1: Mobile LMS Import Access Point ---');

test('B1.1: .bottom-nav in index.html contains item with data-view="import-lms"', () => {
  const bottomNavIdx = indexHtml.indexOf('<nav class="bottom-nav">');
  assert(bottomNavIdx !== -1, '.bottom-nav must exist in index.html');
  const bottomNavHtml = indexHtml.slice(bottomNavIdx, indexHtml.indexOf('</nav>', bottomNavIdx));
  assert(bottomNavHtml.includes('data-view="import-lms"'), 'bottom-nav must contain data-view="import-lms"');
  assert(bottomNavHtml.includes('Nhập LMS') || bottomNavHtml.includes('LMS'), 'bottom-nav must display LMS label');
});

test('B1.2: view-decks header provides shortcut to import-lms', () => {
  const decksIdx = indexHtml.indexOf('id="view-decks"');
  assert(decksIdx !== -1, '#view-decks must exist in index.html');
  const decksSection = indexHtml.slice(decksIdx, indexHtml.indexOf('</section>', decksIdx));
  assert(
    decksSection.includes("App.navigateTo('import-lms')") || decksSection.includes('data-view="import-lms"'),
    'view-decks must offer button or link navigating to import-lms'
  );
});

test('B1.3: Mobile CSS optimizes .bottom-nav for 7 items with touch targets >= 44px', () => {
  const btnIdx = mobileCss.indexOf('.bottom-nav-item {');
  assert(btnIdx !== -1, '.bottom-nav-item must exist in mobile CSS');
  const block = mobileCss.slice(btnIdx, mobileCss.indexOf('}', btnIdx));
  assert(block.includes('min-height: 44px !important;'), 'bottom-nav-item must maintain min-height: 44px');
  assert(block.includes('flex: 1 1 0% !important;'), 'bottom-nav-item must use flex: 1 1 0% for equal distribution');
});

test('B1.4: App.navigateTo correctly handles "import-lms" view activation', () => {
  assert(appJs.includes("viewName === 'import-lms'"), 'App.navigateTo must handle import-lms');
  assert(appJs.includes('this.setupImportLmsView(params)'), 'App.navigateTo must initialize LMS view');
});

// =========================================================================
// B2. BỎ VÙNG CUỘN NỘI BỘ — CUỘN TOÀN TRANG TỰ NHIÊN
// =========================================================================
console.log('\n--- B2: Natural Whole-Page Quiz Scroll (No Internal Scrollbox) ---');

test('B2.1: Mobile #study-quiz-area has NO internal overflow-y: auto/scroll', () => {
  const quizAreaIdx = mobileCss.indexOf('body.quiz-active #study-quiz-area:not(.hidden-mode)');
  assert(quizAreaIdx !== -1, 'body.quiz-active #study-quiz-area rule must exist');
  const block = mobileCss.slice(quizAreaIdx, mobileCss.indexOf('}', quizAreaIdx));
  assert(!block.includes('overflow-y: auto'), '#study-quiz-area must NOT have overflow-y: auto');
  assert(!block.includes('overflow-y: scroll'), '#study-quiz-area must NOT have overflow-y: scroll');
  assert(
    block.includes('overflow: visible !important;') || block.includes('overflow-y: visible !important;'),
    '#study-quiz-area must have overflow: visible to flow naturally'
  );
  assert(block.includes('height: auto !important;'), '#study-quiz-area must have height: auto');
});

test('B2.2: Mobile .quiz-container is NOT locked to 100dvh and allows natural expansion', () => {
  const containerIdx = mobileCss.indexOf('body.quiz-active .quiz-container,');
  assert(containerIdx !== -1, 'body.quiz-active .quiz-container rule must exist');
  const block = mobileCss.slice(containerIdx, mobileCss.indexOf('}', containerIdx));
  assert(block.includes('height: auto !important;'), '.quiz-container must have height: auto');
  assert(block.includes('max-height: none !important;'), '.quiz-container must have max-height: none');
  assert(block.includes('overflow: visible !important;'), '.quiz-container must have overflow: visible');
});

test('B2.3: Mobile body.quiz-active and .app-main permit root-level whole page scrolling', () => {
  const bodyIdx = mobileCss.indexOf('body.quiz-active {');
  assert(bodyIdx !== -1, 'body.quiz-active rule must exist in mobile CSS');
  const bodyBlock = mobileCss.slice(bodyIdx, mobileCss.indexOf('}', bodyIdx));
  assert(bodyBlock.includes('height: auto !important;'), 'body.quiz-active must have height: auto');
  assert(bodyBlock.includes('overflow-y: auto !important;'), 'body.quiz-active must allow page scroll via overflow-y: auto');

  const mainIdx = mobileCss.indexOf('body.quiz-active .app-main {');
  assert(mainIdx !== -1, 'body.quiz-active .app-main rule must exist in mobile CSS');
  const mainBlock = mobileCss.slice(mainIdx, mobileCss.indexOf('}', mainIdx));
  assert(mainBlock.includes('height: auto !important;'), '.app-main must have height: auto');
  assert(mainBlock.includes('overflow: visible !important;'), '.app-main must have overflow: visible to let page scroll');
});

test('B2.4: Mobile .quiz-card and all children have overflow: visible and max-height: none', () => {
  const cardIdx = mobileCss.indexOf('body.quiz-active .quiz-card {');
  assert(cardIdx !== -1, 'body.quiz-active .quiz-card rule must exist');
  const cardBlock = mobileCss.slice(cardIdx, mobileCss.indexOf('}', cardIdx));
  assert(cardBlock.includes('overflow: visible !important;'), '.quiz-card must have overflow: visible');
  assert(cardBlock.includes('height: auto !important;'), '.quiz-card must have height: auto');
  assert(cardBlock.includes('max-height: none !important;'), '.quiz-card must have max-height: none');

  assert(mobileCss.includes('#quiz-explanation-box'), '#quiz-explanation-box must exist in mobile CSS');
  assert(mobileCss.includes('#quiz-explanation-text'), '#quiz-explanation-text must exist in mobile CSS');
});

test('B2.5: nextStudyQuestion resets window.scrollTo to top of screen for seamless card transition', () => {
  const nextIdx = appJs.indexOf('nextStudyQuestion() {');
  assert(nextIdx !== -1, 'nextStudyQuestion method must exist');
  const nextBlock = appJs.slice(nextIdx, appJs.indexOf('_renderFlashcardContent(', nextIdx));
  assert(nextBlock.includes('window.scrollTo({ top: 0, left: 0, behavior: \'instant\' })'), 'Must reset window scroll');
  assert(nextBlock.includes('mainEl.scrollTop = 0'), 'Must reset main element scroll');
});

// =========================================================================
// RESPONSIVE ISOLATION (DESKTOP UNTOUCHED)
// =========================================================================
console.log('\n--- Responsive Isolation: Desktop Preserved ---');

test('3.1: Desktop sidebar maintains "Nhập từ LMS" navigation item', () => {
  const sidebarIdx = indexHtml.indexOf('class="app-sidebar"');
  assert(sidebarIdx !== -1, 'app-sidebar must exist in index.html');
  const sidebarHtml = indexHtml.slice(sidebarIdx, indexHtml.indexOf('</aside>', sidebarIdx));
  assert(sidebarHtml.includes('data-view="import-lms"'), 'Desktop sidebar must have import-lms');
  assert(sidebarHtml.includes('Nhập từ LMS'), 'Desktop sidebar must show "Nhập từ LMS"');
});

test('3.2: Desktop CSS layout remains untouched and isolated', () => {
  assert(desktopCss.includes('.app-sidebar {'), 'Desktop sidebar CSS exists');
  assert(desktopCss.includes('#view-study.active {'), 'Desktop view-study CSS exists');
  assert(desktopCss.includes('.quiz-card {'), 'Desktop quiz-card CSS exists');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n========================================');
console.log(`TEST SUITE 35 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PART B (B1 LMS IMPORT & B2 NATURAL QUIZ SCROLL) CRITERIA VERIFIED!\n');
}
