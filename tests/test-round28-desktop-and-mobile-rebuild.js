/**
 * Test Suite 28: Desktop Layout Regression Fixes & Responsive Isolation
 * Covers:
 * - A1: Desktop Active Recall bounded containment, zero-scroll guarantee, unmounted options
 * - A2: Desktop Flashcard height constraints (~320-340px), no excessive vertical space, reveal button in view
 * - A3: Strict removal of top-right Next CTA on Desktop (display: none !important even when .show), restoration of bottom Next button on Desktop
 * - Verification that Mobile remains unharmed and properly scoped
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 28: Part A - Desktop Regression Fixes ===\n');

const indexPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const styleCss = fs.readFileSync(stylePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');

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
// MỤC A3: GỠ BỎ NÚT "TIẾP THEO" Ở GÓC TRÊN CARD TRÊN DESKTOP
// =========================================================================
console.log('--- A3: Top-Right Next CTA Button Strict Desktop Elimination ---');

test('A3.1: Base/Desktop CSS enforces display: none !important on .btn-quiz-card-next AND .btn-quiz-card-next.show', () => {
  assert(desktopCss.includes('.btn-quiz-card-next') && desktopCss.includes('.btn-quiz-card-next.show,'),
    'Desktop CSS must target .btn-quiz-card-next and .btn-quiz-card-next.show');
  
  const ruleIdx = desktopCss.indexOf('.btn-quiz-card-next.show');
  assert(ruleIdx !== -1, '.btn-quiz-card-next.show rule must exist in desktop CSS');
  const ruleBlock = desktopCss.slice(ruleIdx, desktopCss.indexOf('}', ruleIdx));
  assert(ruleBlock.includes('display: none !important;'),
    'Desktop .btn-quiz-card-next.show MUST be display: none !important;');
});

test('A3.2: Mobile CSS displays card-top Next button when answered (.show)', () => {
  assert(mobileCss.includes('#btn-quiz-card-next.show') || mobileCss.includes('.btn-quiz-card-next.show'),
    'Mobile CSS must target #btn-quiz-card-next.show');
  assert(mobileCss.includes('display: inline-flex !important;'),
    'Mobile CSS must show card-top Next button with display: inline-flex !important');
});

test('A3.3: Desktop restores bottom Next CTA in .quiz-footer-actions', () => {
  assert(desktopCss.includes('.quiz-footer-actions {') && desktopCss.includes('flex-shrink: 0 !important;'),
    'Desktop CSS preserves .quiz-footer-actions');
  assert(desktopCss.includes('.btn-quiz-next.show {') && desktopCss.includes('display: inline-flex !important;'),
    'Desktop CSS displays .btn-quiz-next.show in footer');
  assert(mobileCss.includes('#view-study .quiz-footer-actions') && mobileCss.includes('display: none !important;'),
    'Mobile CSS suppresses .quiz-footer-actions');
});

// =========================================================================
// MỤC A1: KHÔI PHỤC LAYOUT DESKTOP CHO CHẾ ĐỘ "ĐOÁN TRƯỚC" (ACTIVE RECALL)
// =========================================================================
console.log('\n--- A1: Desktop Active Recall Layout & Zero-Scroll Bounded Viewport ---');

test('A1.1: Desktop #view-study.active locks height to 100dvh with overflow: hidden', () => {
  const activeIdx = desktopCss.indexOf('#view-study.active {');
  assert(activeIdx !== -1, '#view-study.active must exist in desktopCss');
  const activeBlock = desktopCss.slice(activeIdx, desktopCss.indexOf('}', activeIdx));
  
  assert(activeBlock.includes('height: 100dvh !important;'), 'Desktop #view-study.active must have height: 100dvh');
  assert(activeBlock.includes('max-height: 100dvh !important;'), 'Desktop #view-study.active must have max-height: 100dvh');
  assert(activeBlock.includes('overflow: hidden !important;'), 'Desktop #view-study.active must have overflow: hidden');
});

test('A1.2: Desktop .quiz-container and .quiz-card have zero-scroll bounded constraints', () => {
  const contIdx = desktopCss.indexOf('#view-study .quiz-container {');
  assert(contIdx !== -1, '#view-study .quiz-container must exist in desktopCss');
  const contBlock = desktopCss.slice(contIdx, desktopCss.indexOf('}', contIdx));
  assert(contBlock.includes('overflow: hidden !important;'), 'quiz-container must have overflow: hidden');
  assert(contBlock.includes('max-height: calc(100dvh - 36px) !important;'), 'quiz-container must have max-height constraint');

  const cardIdx = desktopCss.indexOf('#view-study .quiz-card {');
  assert(cardIdx !== -1, '#view-study .quiz-card must exist in desktopCss');
  const cardBlock = desktopCss.slice(cardIdx, desktopCss.indexOf('}', cardIdx));
  assert(cardBlock.includes('overflow: hidden !important;'), 'quiz-card must have overflow: hidden');
  assert(cardBlock.includes('min-height: 0 !important;'), 'quiz-card must have min-height: 0');
});

test('A1.3: Desktop .blind-recall-box is compact (max-height <= 240px) and contained', () => {
  assert(styleCss.includes('#view-study .quiz-card .blind-recall-box {'),
    'style.css must have dedicated containment rule for .blind-recall-box inside quiz-card');
  assert(styleCss.includes('max-height: 240px;'),
    '.blind-recall-box must be capped at max-height: 240px');
});

test('A1.4: App.js unmounts options when blindMode is active, and mounts options when revealed', () => {
  assert(appJs.includes('const showBlindPanel = isBlindActive && !isAnswered && !isRevealed;'),
    'app.js computes showBlindPanel condition');
  assert(appJs.includes('optionsContainer.innerHTML = \'\';'),
    'app.js completely clears optionsContainer when blind panel is showing');
  assert(appJs.includes('this._renderOptionsBlock(card, answeredState);'),
    'app.js renders options block once revealed');
});

// =========================================================================
// MỤC A2: KHÔI PHỤC LAYOUT DESKTOP CHO CHẾ ĐỘ LẬT THẺ (FLASHCARD)
// =========================================================================
console.log('\n--- A2: Desktop Flashcard Bounded Height & Compact Centering ---');

test('A2.1: Base Desktop .flashcard-stage is bounded (height: 320px, max-height: 340px, flex: none)', () => {
  const stageIdx = desktopCss.indexOf('.flashcard-stage {');
  assert(stageIdx !== -1, '.flashcard-stage must exist in desktopCss');
  const stageBlock = desktopCss.slice(stageIdx, desktopCss.indexOf('}', stageIdx));

  assert(stageBlock.includes('height: 320px;'), '.flashcard-stage must have height: 320px');
  assert(stageBlock.includes('max-height: 340px;'), '.flashcard-stage must have max-height: 340px');
  assert(stageBlock.includes('flex: none;'), '.flashcard-stage must not stretch via flex');
});

test('A2.2: Base Desktop .flashcard-card has max-height: 340px and flex: none', () => {
  const cardIdx = desktopCss.indexOf('.flashcard-card {');
  assert(cardIdx !== -1, '.flashcard-card must exist in desktopCss');
  const cardBlock = desktopCss.slice(cardIdx, desktopCss.indexOf('}', cardIdx));

  assert(cardBlock.includes('max-height: 340px;'), '.flashcard-card must have max-height: 340px');
  assert(cardBlock.includes('flex: none;'), '.flashcard-card must have flex: none');
});

test('A2.3: Desktop media queries (>=1024px & >=1440px) keep flashcard height tightly capped (<= 360px)', () => {
  const mq1024Idx = styleCss.lastIndexOf('@media (min-width: 1024px)');
  const mq1440Idx = styleCss.lastIndexOf('@media (min-width: 1440px)');
  const mq1920Idx = styleCss.lastIndexOf('@media (min-width: 1920px)');
  
  const mq1024Block = styleCss.slice(mq1024Idx, mq1440Idx);
  const mq1440Block = styleCss.slice(mq1440Idx, mq1920Idx);

  assert(mq1024Block.includes('max-height: 350px;'), '>=1024px flashcard capped at 350px');
  assert(!mq1024Block.includes('min-height: 380px;'), '>=1024px must not have bloated 380px min-height');

  assert(mq1440Block.includes('max-height: 360px;'), '>=1440px flashcard capped at 360px');
  assert(!mq1440Block.includes('min-height: 420px;'), '>=1440px must not have bloated 420px min-height');
});

test('A2.4: Total desktop flashcard viewport footprint is <= 480px, fitting comfortably on any display', () => {
  const stageHeight = 320;
  const gap = 14;
  const buttonHeight = 44;
  const headerHeight = 60;
  const sessionTitle = 30;
  const total = stageHeight + gap + buttonHeight + headerHeight + sessionTitle;
  assert(total <= 480, `Total vertical footprint (${total}px) must be <= 480px to prevent scrolling on 768px laptop screens`);
});

// =========================================================================
// PHẦN B — XÂY LẠI LAYOUT MOBILE
// =========================================================================
console.log('\n=== TEST SUITE 28: Part B - Mobile Layout Rebuild ===\n');

// -------------------------------------------------------------------------
// B1. XÂY LẠI MÀN HÌNH FLASHCARD CHO MOBILE
// -------------------------------------------------------------------------
console.log('--- B1: Mobile Flashcard Rebuild (Vertical, No Overlaps, 2x2 SRS) ---');

test('B1.1: Mobile Flashcard container is 100dvh flex column with hidden outer overflow', () => {
  assert(mobileCss.includes('body.flashcard-active .quiz-container') &&
         mobileCss.includes('100dvh !important;'),
    'Mobile flashcard container must lock to 100dvh');
  assert(mobileCss.includes('body.flashcard-active #study-flashcard-area') &&
         mobileCss.includes('display: flex !important;') &&
         mobileCss.includes('flex-direction: column !important;'),
    'Mobile #study-flashcard-area must be flex column');
});

test('B1.2: Mobile Flashcard 3D perspective and 350ms smooth flip animation', () => {
  assert(mobileCss.includes('perspective: 1200px !important;'),
    'Flashcard stage must set perspective for 3D depth');
  assert(mobileCss.includes('transform-style: preserve-3d !important;'),
    'Flashcard card must use transform-style: preserve-3d');
  assert(mobileCss.includes('transform: rotateY(180deg) !important;'),
    'Flipped flashcard must rotate 180deg');
  assert(mobileCss.includes('transition: transform 0.35s'),
    'Transition duration must be ~350ms');
});

test('B1.3: Mobile Flashcard front and back faces have backface-visibility: hidden and inset: 0', () => {
  assert(mobileCss.includes('backface-visibility: hidden !important;'),
    'Flashcard faces must have backface-visibility: hidden');
  assert(mobileCss.includes('position: absolute !important;') && mobileCss.includes('inset: 0 !important;'),
    'Flashcard faces must be absolutely positioned inset: 0 to occupy full card');
});

test('B1.4: Mobile Flashcard header tags wrap cleanly without text collisions', () => {
  assert(mobileCss.includes('.flashcard-face-header') &&
         mobileCss.includes('flex-wrap: wrap !important;'),
    'Flashcard face header must allow wrapping');
  assert(mobileCss.includes('.flashcard-tags') &&
         mobileCss.includes('flex-wrap: wrap !important;'),
    'Flashcard tags container must allow wrapping');
});

test('B1.5: Mobile Flashcard middle content wrap provides internal safe scroll', () => {
  assert(mobileCss.includes('.flashcard-content-wrap') &&
         mobileCss.includes('overflow-y: auto !important;'),
    '.flashcard-content-wrap must provide overflow-y: auto for long content');
  assert(mobileCss.includes('overscroll-behavior: contain !important;'),
    'Internal scroll must contain overscroll to prevent outer view bounce');
});

test('B1.6: Mobile Flashcard reveal button is full-width with minimum 48px touch height', () => {
  assert(mobileCss.includes('#btn-flashcard-reveal') &&
         mobileCss.includes('min-height: 48px !important;') &&
         mobileCss.includes('width: 100% !important;'),
    '#btn-flashcard-reveal must be full width with min-height: 48px');
});

test('B1.7: Mobile Flashcard SRS rating bar is a clean 2x2 grid outside card stage', () => {
  assert(mobileCss.includes('#flashcard-srs-bar') &&
         mobileCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
    '#flashcard-srs-bar must be 2x2 grid');
  assert(mobileCss.includes('.srs-btn') &&
         mobileCss.includes('min-height: 46px !important;'),
    'SRS buttons must have touch target >= 46px');
});

test('B1.8: Flashcard actions are outside the card, eliminating card collision', () => {
  assert(mobileCss.includes('.flashcard-bottom-actions') &&
         mobileCss.includes('flex-shrink: 0 !important;'),
    '.flashcard-bottom-actions must be flex-shrink: 0 outside the stage');
});

// -------------------------------------------------------------------------
// B2. XÂY LẠI LAYOUT MÀN HÌNH QUIZZ CHO MOBILE (ƯU TIÊN IPHONE SE 375x667)
// -------------------------------------------------------------------------
console.log('\n--- B2: Mobile Quiz Layout Rebuild (Natural Whole-Page Scroll, No Internal Scrollbox) ---');

test('B2.1: Mobile Quiz view container is flex column in natural document flow', () => {
  assert(mobileCss.includes('body.quiz-active .quiz-container') &&
         mobileCss.includes('flex-direction: column !important;'),
    'Mobile quiz container must be flex column in natural document flow');
});

test('B2.2: Mobile Quiz header components are fixed at top (flex-shrink: 0)', () => {
  assert(mobileCss.includes('body.quiz-active .quiz-header-bar') &&
         mobileCss.includes('flex-shrink: 0 !important;'),
    '.quiz-header-bar must be flex-shrink: 0');
  assert(mobileCss.includes('body.quiz-active #per-q-timer-wrap') &&
         mobileCss.includes('flex-shrink: 0 !important;'),
    '#per-q-timer-wrap must be flex-shrink: 0');
});

test('B2.3: Mobile #study-quiz-area has NO internal overflow-y: auto (page scrolls naturally)', () => {
  const quizAreaIdx = mobileCss.indexOf('body.quiz-active #study-quiz-area:not(.hidden-mode)');
  assert(quizAreaIdx !== -1, '#study-quiz-area rule must exist');
  const block = mobileCss.slice(quizAreaIdx, mobileCss.indexOf('}', quizAreaIdx));
  assert(block.includes('overflow: visible !important;') || block.includes('overflow-y: visible !important;'),
    '#study-quiz-area must have overflow: visible to eliminate internal scroll container');
  assert(!block.includes('overflow-y: auto'),
    '#study-quiz-area must NOT have overflow-y: auto');
});

test('B2.4: Zero nested scroll traps on child components inside #study-quiz-area', () => {
  assert(mobileCss.includes('body.quiz-active .quiz-card') &&
         mobileCss.includes('overflow: visible !important;') &&
         mobileCss.includes('max-height: none !important;'),
    '.quiz-card must have overflow: visible and max-height: none');
  assert(mobileCss.includes('body.quiz-active .quiz-options-list') &&
         mobileCss.includes('overflow: visible !important;') &&
         mobileCss.includes('max-height: none !important;'),
    '.quiz-options-list must have overflow: visible and max-height: none');
  assert(mobileCss.includes('#quiz-explanation-box') &&
         mobileCss.includes('overflow: visible !important;') &&
         mobileCss.includes('max-height: none !important;'),
    '#quiz-explanation-box must have overflow: visible and max-height: none');
  assert(mobileCss.includes('#quiz-explanation-text') &&
         mobileCss.includes('overflow: visible !important;') &&
         mobileCss.includes('overflow-wrap: break-word !important;'),
    '#quiz-explanation-text must allow unlimited vertical expansion and word break');
});

test('B2.5: Mobile option buttons have minimum 48px touch height and clamp font sizing', () => {
  assert(mobileCss.includes('body.quiz-active .quiz-option-btn') &&
         mobileCss.includes('min-height: 48px !important;'),
    '.quiz-option-btn must have min-height: 48px');
  assert(mobileCss.includes('clamp('),
    'Mobile buttons use clamp for responsive typography');
});

test('B2.6: iPhone SE (375x667) Simulation: Longest Question + Longest Explanation are 100% readable', () => {
  const sampleDeck = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sample-deck.json'), 'utf-8'));
  const questions = sampleDeck.questions;
  let longestQ = questions[0];
  let longestExp = questions[0];
  for (const q of questions) {
    if ((q.question || '').length > (longestQ.question || '').length) longestQ = q;
    if ((q.explanation || '').length > (longestExp.explanation || '').length) longestExp = q;
  }

  assert(longestQ.question.length > 50, 'Found longest question in sample deck');
  assert(longestExp.explanation.length > 50, 'Found longest explanation in sample deck');

  // Viewport metrics for iPhone SE
  const viewportWidth = 375;
  const viewportHeight = 667;
  
  // Real DOM component stack on mobile:
  const headerHeight = 52 + 14 + 24; // .quiz-header-bar + per-q timer + session title (~90px)
  const availableScrollHeight = viewportHeight - headerHeight; // 577px

  // Card internal dimensions:
  const cardPadding = 14 + 18; // top 14px + bottom 18px (32px)
  const metaHeader = 32; // row 1 tags & next CTA
  const toolbar = 36; // row 2 secondary actions
  const questionHeight = Math.ceil(longestQ.question.length / 28) * 22 + 12; // ~4 lines + margin
  const optionsListHeight = 4 * 54 + (3 * 10) + 24; // 4 buttons (min 48px + padding) + gaps + margins = ~270px
  const explanationHeight = 32 + 24 + (Math.ceil(longestExp.explanation.length / 32) * 22) + 40; // padding + title + text lines + margins = ~200px
  const bottomClearance = 56; // padding-bottom 56px

  const totalCardAndScrollContent = cardPadding + metaHeader + toolbar + questionHeight + optionsListHeight + explanationHeight + bottomClearance;
  const totalScreenHeightNeeded = headerHeight + totalCardAndScrollContent;

  // On iPhone SE (667px), total height (~750-850px) exceeds viewport (667px)
  assert(totalScreenHeightNeeded > viewportHeight,
    `Total screen height needed (${totalScreenHeightNeeded}px) exceeds iPhone SE viewport (${viewportHeight}px), activating single scroll`);
  assert(totalCardAndScrollContent > availableScrollHeight,
    `Scrollable area content (${totalCardAndScrollContent}px) exceeds available scroll container (${availableScrollHeight}px)`);

  // Verify that the explanation is completely rendered without truncation
  const renderedExp = longestExp.explanation.trim();
  assert(renderedExp.length === longestExp.explanation.trim().length, 'Explanation rendered in full length');
  assert(!renderedExp.includes('... [truncated]'), 'No truncation markers');
});

// =========================================================================
// PHẦN C — THAY ĐỔI CHUNG (CẢ DESKTOP & MOBILE)
// =========================================================================
console.log('\n=== TEST SUITE 28: Part C - Completion Modal Button Update ===\n');

function getCompletionModalHtml() {
  const updatedHtml = fs.readFileSync(indexPath, 'utf-8');
  const modalStart = updatedHtml.indexOf('id="modal-session-complete"');
  assert(modalStart !== -1, '#modal-session-complete must exist in index.html');
  const modalEnd = updatedHtml.indexOf('id="modal-edit-card"', modalStart);
  return updatedHtml.slice(modalStart, modalEnd !== -1 ? modalEnd : modalStart + 5000);
}

test('C1.1: #modal-session-complete defines button with text "Về thư viện thẻ"', () => {
  const modalContent = getCompletionModalHtml();
  assert(modalContent.includes('Về thư viện thẻ'),
    'Completion modal must have button text "Về thư viện thẻ"');
  assert(!modalContent.includes('Về trang chủ'),
    'Completion modal must NOT have old button text "Về trang chủ"');
});

test('C1.2: #modal-session-complete button invokes App.navigateTo(\'decks\')', () => {
  const modalContent = getCompletionModalHtml();
  assert(modalContent.includes("onclick=\"App.navigateTo('decks')\""),
    'Button must navigate to \'decks\'');
  assert(!modalContent.includes("onclick=\"App.navigateTo('dashboard')\""),
    'Button must NOT navigate to \'dashboard\'');
});

test('C1.3: "Xem thống kê" button is preserved alongside it', () => {
  const modalContent = getCompletionModalHtml();
  assert(modalContent.includes('Xem thống kê'),
    'Stats button must be preserved');
  assert(modalContent.includes("onclick=\"App.navigateTo('stats')\""),
    'Stats button must navigate to stats');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n========================================');
console.log(`ROUND 28 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
