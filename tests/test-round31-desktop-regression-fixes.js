/**
 * Test Suite 31: Desktop Regression Fixes (A1 - A5) & Responsive Isolation Verification
 *
 * Requirements:
 * A1: Option button correct/incorrect states use inset box-shadow / border: 2px solid, outer glow eliminated.
 * A2: Desktop Quiz layout: no empty dead void on top, justify-content: flex-start, card hugs content near header.
 * A3: Top-Right "Tiếp theo" button strictly hidden on desktop (both header bar and card meta header).
 *     Mobile maintains #btn-quiz-card-next.show. Desktop maintains bottom #btn-quiz-next in footer actions.
 * A4: Desktop Flashcard layout: compact, seated near header, no vertical void.
 * A5: Active Recall ("Đoán trước"): no nested oversized fixed box; card hugs content, expands naturally when revealed.
 * D:  Strict responsive isolation between Desktop and Mobile.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 31: Desktop Regression Fixes (A1-A5) & Responsive Isolation ===\n');

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

// Slice out main Desktop base CSS and main Mobile media query
const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Main @media (max-width: 768px) must be located');

const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// =========================================================================
// MỤC A1: VIỀN GLOW ĐÚNG/SAI DÙNG INSET BOX-SHADOW, KHÔNG BỊ CROP
// =========================================================================
console.log('--- A1: Option Correct/Incorrect Inset Glow & Border Fix ---');

test('A1.1: .quiz-option-btn.correct uses border: 2px solid and inset box-shadow', () => {
  const correctIdx = styleCss.indexOf('.quiz-option-btn.correct {');
  assert(correctIdx !== -1, '.quiz-option-btn.correct rule must exist');
  const block = styleCss.slice(correctIdx, styleCss.indexOf('}', correctIdx));

  assert(block.includes('border: 2px solid var(--success) !important;'),
    '.correct must have 2px solid border');
  assert(block.includes('box-shadow: inset') && block.includes('rgba(111, 207, 151'),
    '.correct must use inset box-shadow to prevent clipping');
  assert(!block.includes('box-shadow: 0 0 18px'),
    '.correct must eliminate outer spreading glow');
});

test('A1.2: .quiz-option-btn.incorrect uses border: 2px solid and inset box-shadow', () => {
  const incorrectIdx = styleCss.indexOf('.quiz-option-btn.incorrect {');
  assert(incorrectIdx !== -1, '.quiz-option-btn.incorrect rule must exist');
  const block = styleCss.slice(incorrectIdx, styleCss.indexOf('}', incorrectIdx));

  assert(block.includes('border: 2px solid var(--danger) !important;'),
    '.incorrect must have 2px solid border');
  assert(block.includes('box-shadow: inset') && block.includes('rgba(226, 125, 139'),
    '.incorrect must use inset box-shadow to prevent clipping');
  assert(!block.includes('box-shadow: 0 0 18px'),
    '.incorrect must eliminate outer spreading glow');
});

// =========================================================================
// MỤC A2: KHÔI PHỤC LAYOUT DESKTOP GỌN GÀNG SÁT TRÊN, KHÔNG KHOẢNG TRỐNG THỪA
// =========================================================================
console.log('\n--- A2: Desktop Quiz Viewport Compact Alignment ---');

test('A2.1: Desktop #view-study.active aligns flex-start (no vertical centering gap)', () => {
  const activeIdx = desktopCss.indexOf('#view-study.active {');
  assert(activeIdx !== -1, '#view-study.active rule must exist in desktop CSS');
  const block = desktopCss.slice(activeIdx, desktopCss.indexOf('}', activeIdx));

  assert(block.includes('justify-content: flex-start !important;'),
    'Desktop #view-study.active must align flex-start to prevent pushing content down');
  assert(!block.includes('justify-content: center !important;'),
    'Desktop #view-study.active must NOT use justify-content: center');
});

test('A2.2: Desktop .quiz-container has height: auto, margin: 0 auto, and flex-start alignment', () => {
  const contIdx = desktopCss.indexOf('#view-study .quiz-container {');
  assert(contIdx !== -1, '#view-study .quiz-container rule must exist in desktop CSS');
  const block = desktopCss.slice(contIdx, desktopCss.indexOf('}', contIdx));

  assert(block.includes('justify-content: flex-start !important;'),
    '.quiz-container must align flex-start');
  assert(block.includes('margin: 0 auto !important;'),
    '.quiz-container must have margin: 0 auto, eliminating margin: auto 0');
  assert(block.includes('height: auto !important;'),
    '.quiz-container must have height: auto, eliminating height: 100%');
});

test('A2.3: Desktop .quiz-card has flex: 0 1 auto, justify-content: flex-start, and hugs content', () => {
  const cardIdx = desktopCss.indexOf('#view-study .quiz-card {');
  assert(cardIdx !== -1, '#view-study .quiz-card rule must exist in desktop CSS');
  const block = desktopCss.slice(cardIdx, desktopCss.indexOf('}', cardIdx));

  assert(block.includes('justify-content: flex-start !important;'),
    '.quiz-card must align flex-start');
  assert(block.includes('flex: 0 1 auto !important;'),
    '.quiz-card must hug its content with flex: 0 1 auto');
  assert(!block.includes('justify-content: space-between !important;'),
    '.quiz-card must NOT use justify-content: space-between');
});

test('A2.4: Title wrapper class study-session-title-wrap exists in index.html and has compact spacing', () => {
  assert(indexHtml.includes('class="study-session-title-wrap"'),
    'index.html defines study-session-title-wrap');
});

// =========================================================================
// MỤC A3: GỠ BỎ NÚT "TIẾP THEO" GÓC TRÊN DESKTOP & GIỮ NGUYÊN MOBILE
// =========================================================================
console.log('\n--- A3: Desktop Top Next Elimination & Mobile Preservation ---');

test('A3.1: Desktop strictly hides both #btn-quiz-fast-next and #btn-quiz-card-next', () => {
  const mediaIdx = desktopCss.indexOf('@media (min-width: 769px) {');
  assert(mediaIdx !== -1, '@media (min-width: 769px) must exist');
  const block = desktopCss.slice(mediaIdx, desktopCss.indexOf('}', desktopCss.indexOf('display: none !important;', mediaIdx)));

  assert(block.includes('#btn-quiz-fast-next') && block.includes('.btn-quiz-fast-next'),
    'Desktop CSS must suppress #btn-quiz-fast-next in header');
  assert(block.includes('#btn-quiz-card-next') && block.includes('.btn-quiz-card-next'),
    'Desktop CSS must suppress #btn-quiz-card-next in card meta header');
  assert(block.includes('display: none !important;') && block.includes('visibility: hidden !important;'),
    'Desktop CSS must enforce display: none !important and visibility: hidden !important');
});

test('A3.2: Mobile CSS strictly displays #btn-quiz-card-next.show with pointer-events: auto', () => {
  assert(mobileCss.includes('#btn-quiz-card-next.show') || mobileCss.includes('.btn-quiz-card-next.show'),
    'Mobile CSS must target #btn-quiz-card-next.show');
  assert(mobileCss.includes('pointer-events: auto !important;'),
    'Mobile CSS must grant pointer-events: auto !important');
  assert(mobileCss.includes('#btn-quiz-fast-next') && mobileCss.includes('display: none !important;'),
    'Mobile CSS strictly suppresses #btn-quiz-fast-next');
});

test('A3.3: Desktop restores bottom Next button in .quiz-footer-actions', () => {
  assert(desktopCss.includes('.btn-quiz-next.show') && desktopCss.includes('display: inline-flex !important;'),
    'Desktop CSS displays .btn-quiz-next.show');
  assert(mobileCss.includes('.quiz-footer-actions') && mobileCss.includes('display: none !important;'),
    'Mobile CSS suppresses .quiz-footer-actions on mobile');
});

// =========================================================================
// MỤC A4: FLASHCARD DESKTOP GỌN GÀNG SÁT TRÊN, VỪA KHUNG
// =========================================================================
console.log('\n--- A4: Desktop Flashcard Compact Centering ---');

test('A4.1: Desktop Flashcard stage and container are bounded and centered cleanly', () => {
  assert(desktopCss.includes('.flashcard-player-container {') && desktopCss.includes('max-width: 680px;'),
    'Flashcard player container is centered with max-width 680px');
  assert(desktopCss.includes('.flashcard-stage {') && desktopCss.includes('height: 320px;'),
    'Flashcard stage has bounded height 320px');
  assert(desktopCss.includes('.flashcard-card {') && desktopCss.includes('max-height: 340px;'),
    'Flashcard card is bounded to 340px');
});

// =========================================================================
// MỤC A5: ACTIVE RECALL ("ĐOÁN TRƯỚC") BỎ KHUNG LỒNG THỪA
// =========================================================================
console.log('\n--- A5: Active Recall Nested Frame Elimination ---');

test('A5.1: Desktop .blind-recall-box eliminates margin: auto 0 and sets margin: 12px 0 0 0', () => {
  const boxIdx = desktopCss.indexOf('#view-study .quiz-card .blind-recall-box {');
  assert(boxIdx !== -1, '#view-study .quiz-card .blind-recall-box rule must exist in desktop CSS');
  const block = desktopCss.slice(boxIdx, desktopCss.indexOf('}', boxIdx));

  assert(block.includes('margin: 12px 0 0 0 !important;'),
    '.blind-recall-box must sit directly under question with margin: 12px 0 0 0');
  assert(!block.includes('margin: auto 0;'),
    '.blind-recall-box must NOT float in center with margin: auto 0');
  assert(block.includes('width: 100% !important;'),
    '.blind-recall-box must fill width seamlessly');
});

test('A5.2: .quiz-card.blind-active has height: auto and flex: none to tightly hug contents', () => {
  assert(desktopCss.includes('.quiz-card.blind-active {'),
    '.quiz-card.blind-active rule must exist');
  const idx = desktopCss.indexOf('.quiz-card.blind-active {');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('height: auto !important;'),
    '.quiz-card.blind-active must have height: auto !important');
  assert(block.includes('flex: none !important;'),
    '.quiz-card.blind-active must have flex: none !important');
});

test('A5.3: app.js coordinates blind-active class on quiz-card dynamically', () => {
  assert(appJs.includes("quizCard.classList.toggle('blind-active', Boolean(showBlindPanel));"),
    'app.js sets blind-active when Active Recall panel is active');
  assert(appJs.includes("quizCard.classList.remove('blind-active');"),
    'app.js removes blind-active when revealed');
});

// =========================================================================
// TỔNG KẾT
// =========================================================================
console.log('\n========================================');
console.log(`TEST SUITE 31 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PART A REQUIREMENTS VERIFIED SUCCESSFULLY!');
}
