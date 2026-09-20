/**
 * Test Suite 34: Mobile Flashcard Natural Placement (Under Card) & Collapsible Explanation
 *
 * Requirements:
 * 1. Gắn liền ngay dưới thẻ — không sticky/fixed đáy màn hình:
 *    - .flashcard-bottom-actions uses normal flow (position: relative !important;).
 *    - Neither position: fixed nor position: sticky is used.
 *    - Placed directly below the card stage with margin-top (14px).
 * 2. Giới hạn chiều cao nội dung mặt sau thẻ (Collapsible Explanation):
 *    - Default: answer + 1-line summary (-webkit-line-clamp: 1).
 *    - Toggle button #btn-flashcard-exp-toggle enables internal accordion scroll (.is-expanded).
 *    - Expanding does not push rating buttons away because stage has bounded height.
 *    - App.toggleFlashcardExplanation() toggles expansion state.
 * 3. Bảo đảm an toàn mép thiết bị (Safe Area Inset):
 *    - Container and action bar preserve env(safe-area-inset-bottom).
 * 4. Tách biệt thị giác nhẹ:
 *    - Subtle top border (border-top: 1px solid rgba(255, 255, 255, 0.08)) and margin-top.
 *    - Transparent background, no heavy fixed frosted overlays.
 * 5. Bố cục lưới 2x2, 4 màu phân biệt trực quan:
 *    - 2x2 grid (grid-template-columns: repeat(2, 1fr)).
 *    - Touch target >= 44x44px (height: 50px, min-height >= 48px).
 *    - Distinct harmonious dark/violet palette colors for 4 levels (again, hard, good, easy).
 * 6. Hiệu ứng xuất hiện mượt mà:
 *    - Keyframes flashcardActionsFadeInUp using transform (translateY 8px) and opacity.
 * 7. Cô lập Desktop (Desktop Isolated):
 *    - Desktop CSS is preserved and unaffected.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 34: Mobile Flashcard Natural Placement & Collapsible Explanation ===\n');

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
// 1. GẮN LIỀN NGAY DƯỚI THẺ — KHÔNG STICKY/FIXED ĐÁY MÀN HÌNH
// =========================================================================
console.log('--- 1. Natural Flow Directly Under Card (No Fixed/Sticky Dock) ---');

test('1.1: Mobile .flashcard-bottom-actions is in normal document flow (position: relative !important)', () => {
  const idx = mobileCss.indexOf('body.flashcard-active .flashcard-bottom-actions');
  assert(idx !== -1, 'body.flashcard-active .flashcard-bottom-actions must exist');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('position: relative !important;'), 'Actions must use position: relative');
  assert(!block.includes('position: fixed'), 'Actions must NOT be position: fixed');
  assert(!block.includes('position: sticky'), 'Actions must NOT be position: sticky');
  assert(block.includes('margin: 14px auto 0 auto !important;') || block.includes('margin: 14px'), 'Must have margin-top directly under card');
});

test('1.2: Mobile #study-flashcard-area positions stage and actions in vertical sequence', () => {
  const idx = mobileCss.indexOf('body.flashcard-active #study-flashcard-area');
  assert(idx !== -1, 'body.flashcard-active #study-flashcard-area must exist');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('justify-content: flex-start !important;'), 'Must align children from start (under card)');
  assert(block.includes('overflow-y: auto !important;'), 'Must allow scroll if viewport is very short');
});

// =========================================================================
// 2. GIỚI HẠN CHIỀU CAO MẶT SAU THẺ & COLLAPSIBLE EXPLANATION
// =========================================================================
console.log('--- 2. Bounded Back Face & Collapsible Explanation Accordion ---');

test('2.1: index.html defines #btn-flashcard-exp-toggle for explanation expansion', () => {
  assert(indexHtml.includes('id="btn-flashcard-exp-toggle"'), 'Must have #btn-flashcard-exp-toggle');
  assert(indexHtml.includes('App.toggleFlashcardExplanation()'), 'Toggle button must invoke App.toggleFlashcardExplanation()');
  assert(indexHtml.includes('event.stopPropagation()'), 'Must stopPropagation to avoid accidental card flip');
});

test('2.2: app.js handles long explanation detection and toggling in App.toggleFlashcardExplanation', () => {
  assert(appJs.includes('toggleFlashcardExplanation()'), 'App must define toggleFlashcardExplanation()');
  assert(appJs.includes("expWrap.classList.toggle('is-expanded')"), 'Method must toggle is-expanded class');

  const renderIdx = appJs.indexOf('_renderFlashcardContent(');
  const renderBlock = appJs.slice(renderIdx, appJs.indexOf('toggleFlashcardExplanation()', renderIdx));
  assert(renderBlock.includes('is-collapsible'), '_renderFlashcardContent must toggle is-collapsible for long text');
  assert(renderBlock.includes('btn-flashcard-exp-toggle'), '_renderFlashcardContent must manage toggle button visibility');
});

test('2.3: CSS clamps collapsed explanation to 1 line and bounds expanded explanation scroll', () => {
  assert(
    styleCss.includes('.flashcard-explanation-box.is-collapsible:not(.is-expanded) .flashcard-explanation-text') &&
    styleCss.includes('-webkit-line-clamp: 1'),
    'CSS must clamp collapsed explanation text to 1 line'
  );
  assert(
    styleCss.includes('.flashcard-explanation-box.is-collapsible.is-expanded') &&
    styleCss.includes('overflow-y: auto'),
    'CSS must enable internal scroll when explanation is expanded'
  );
});

// =========================================================================
// 3. AN TOÀN VÙNG ĐỆM THIẾT BỊ (SAFE AREA INSET)
// =========================================================================
console.log('--- 3. Safe Area Inset Preservation ---');

test('3.1: Mobile flashcard container and actions preserve env(safe-area-inset-bottom)', () => {
  const containerIdx = mobileCss.indexOf('body.flashcard-active .quiz-container');
  const containerBlock = mobileCss.slice(containerIdx, mobileCss.indexOf('}', containerIdx));
  assert(containerBlock.includes('env(safe-area-inset-bottom'), 'quiz-container must respect safe-area-inset-bottom');

  const actionsIdx = mobileCss.indexOf('body.flashcard-active .flashcard-bottom-actions');
  const actionsBlock = mobileCss.slice(actionsIdx, mobileCss.indexOf('}', actionsIdx));
  assert(actionsBlock.includes('env(safe-area-inset-bottom'), 'flashcard-bottom-actions must respect safe-area-inset-bottom');
});

// =========================================================================
// 4. TÁCH BIỆT THỊ GIÁC NHẸ VỚI NỘI DUNG PHÍA TRÊN
// =========================================================================
console.log('--- 4. Subtle Visual Separation (Top Border, No Heavy Overlays) ---');

test('4.1: Mobile .flashcard-bottom-actions has subtle top border and clean transparent background', () => {
  const idx = mobileCss.indexOf('body.flashcard-active .flashcard-bottom-actions');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('border-top: 1px solid rgba(255, 255, 255, 0.08) !important;'), 'Must have subtle 1px top border');
  assert(block.includes('background: transparent !important;'), 'Must have transparent background (in flow)');
  assert(block.includes('backdrop-filter: none !important;'), 'Must eliminate heavy backdrop-filter blur');
  assert(block.includes('box-shadow: none !important;'), 'Must eliminate heavy drop shadows');
});

// =========================================================================
// 5. BỐ CỤC LƯỚI 2X2 VÀ 4 MÀU PHÂN BIỆT TRỰC QUAN
// =========================================================================
console.log('--- 5. 2x2 Grid & 4 Distinct Harmonious Rating Colors ---');

test('5.1: Mobile SRS bar is a 2x2 grid with touch target >= 44x44px', () => {
  const barIdx = mobileCss.indexOf('body.flashcard-active #flashcard-srs-bar {');
  assert(barIdx !== -1, '#flashcard-srs-bar must exist in mobile CSS');
  const barBlock = mobileCss.slice(barIdx, mobileCss.indexOf('}', barIdx));
  assert(barBlock.includes('grid-template-columns: repeat(2, 1fr) !important;'), 'Must be 2x2 grid');

  const btnIdx = mobileCss.indexOf('body.flashcard-active .srs-btn {');
  assert(btnIdx !== -1, '.srs-btn must exist in mobile CSS');
  const btnBlock = mobileCss.slice(btnIdx, mobileCss.indexOf('}', btnIdx));
  assert(btnBlock.includes('min-height: 46px !important;') || btnBlock.includes('height: 46px !important;'), 'Touch target >= 44x44px');
});

test('5.2: 4 rating buttons have distinct, harmonious dark-palette colors', () => {
  assert(mobileCss.includes('.srs-btn.srs-btn-again'), 'Again button style defined');
  assert(mobileCss.includes('.srs-btn.srs-btn-hard'), 'Hard button style defined');
  assert(mobileCss.includes('.srs-btn.srs-btn-good'), 'Good button style defined');
  assert(mobileCss.includes('.srs-btn.srs-btn-easy'), 'Easy button style defined');

  // Again: red/crimson
  const againIdx = mobileCss.indexOf('body.flashcard-active .srs-btn.srs-btn-again');
  const againBlock = mobileCss.slice(againIdx, mobileCss.indexOf('}', againIdx));
  assert(againBlock.includes('239, 68, 68'), 'Again button uses crimson hue');

  // Hard: amber/orange
  const hardIdx = mobileCss.indexOf('body.flashcard-active .srs-btn.srs-btn-hard');
  const hardBlock = mobileCss.slice(hardIdx, mobileCss.indexOf('}', hardIdx));
  assert(hardBlock.includes('245, 158, 11') || hardBlock.includes('249, 115, 22'), 'Hard button uses amber hue');

  // Good: blue
  const goodIdx = mobileCss.indexOf('body.flashcard-active .srs-btn.srs-btn-good');
  const goodBlock = mobileCss.slice(goodIdx, mobileCss.indexOf('}', goodIdx));
  assert(goodBlock.includes('59, 130, 246'), 'Good button uses blue hue');

  // Easy: purple/violet
  const easyIdx = mobileCss.indexOf('body.flashcard-active .srs-btn.srs-btn-easy');
  const easyBlock = mobileCss.slice(easyIdx, mobileCss.indexOf('}', easyIdx));
  assert(easyBlock.includes('168, 85, 247'), 'Easy button uses violet hue');
});

// =========================================================================
// 6. HIỆU ỨNG XUẤT HIỆN MƯỢT KHI THẺ LẬT
// =========================================================================
console.log('--- 6. Smooth Fade + Slide-Up Animation ---');

test('6.1: Keyframes flashcardActionsFadeInUp smoothly animates transform and opacity', () => {
  assert(mobileCss.includes('@keyframes flashcardActionsFadeInUp'), 'Must define @keyframes flashcardActionsFadeInUp');
  const kfIdx = mobileCss.indexOf('@keyframes flashcardActionsFadeInUp');
  const kfBlock = mobileCss.slice(kfIdx, mobileCss.indexOf('}\n}', kfIdx) + 2);
  assert(kfBlock.includes('transform: translateY(8px)'), 'Animates from 8px offset');
  assert(kfBlock.includes('transform: translateY(0)'), 'Animates to 0 offset');
  assert(kfBlock.includes('opacity: 0') && kfBlock.includes('opacity: 1'), 'Animates opacity fade-in');
});

test('6.2: Flipping card triggers show animation on bottom actions', () => {
  const showIdx = mobileCss.indexOf('body.flashcard-active .flashcard-bottom-actions.show');
  assert(showIdx !== -1, 'Must have .flashcard-bottom-actions.show rule');
  const showBlock = mobileCss.slice(showIdx, mobileCss.indexOf('}', showIdx));
  assert(showBlock.includes('flashcardActionsFadeInUp'), 'Must apply flashcardActionsFadeInUp animation');
  assert(showBlock.includes('display: block !important;'), 'Must display: block');
});

// =========================================================================
// 7. CÔ LẬP DESKTOP (DESKTOP ISOLATION)
// =========================================================================
console.log('--- 7. Desktop Isolation Verification ---');

test('7.1: Desktop CSS remains untouched and isolated', () => {
  assert(desktopCss.includes('.flashcard-stage {'), 'Desktop flashcard stage exists');
  assert(desktopCss.includes('height: 320px;'), 'Desktop flashcard stage is 320px');
  assert(desktopCss.includes('max-height: 340px;'), 'Desktop flashcard stage is capped at 340px');
  assert(desktopCss.includes('.srs-ratings-bar {'), 'Desktop SRS ratings bar exists');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n========================================');
console.log(`TEST SUITE 34 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL MOBILE FLASHCARD NATURAL PLACEMENT & COLLAPSIBLE EXPLANATION CRITERIA VERIFIED!\n');
}
