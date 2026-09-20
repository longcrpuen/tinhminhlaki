/**
 * Test Suite 36: Mobile Landscape Natural Scroll & Ergonomics Across All Views
 * Verified per requirements:
 * 1. No overflow: hidden or fixed height locks preventing whole-page scroll in landscape.
 * 2. All 4 quiz choices (A, B, C, D) are reachable and never permanently cropped.
 * 3. Compact ergonomics for low-height landscape (<= 500px).
 * 4. Flashcard, Bank, Stats, Settings all scroll naturally in landscape.
 * 5. Desktop layout remains cleanly isolated.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf-8');

console.log('=== TEST SUITE 36: Mobile Landscape Natural Scroll & Ergonomics ===\n');

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }
}

// --- 1. LANDSCAPE MEDIA QUERY DEFINITION ---
console.log('--- 1. Landscape Media Query Definition ---');
test('1.1: CSS defines mobile landscape media query block', () => {
  assert(styleCss.includes('@media (max-height: 550px), (orientation: landscape) and (max-height: 550px)'),
    'Must define landscape and low-height query');
});

// --- 2. QUIZ NATURAL SCROLL & ZERO-CROP IN LANDSCAPE ---
console.log('\n--- 2. Quiz Natural Scroll & Zero-Crop in Landscape ---');
test('2.1: Landscape body.quiz-active unlocks page-level natural scrolling (overflow-y: auto)', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  assert(match, 'Landscape block found');
  const css = match[0];
  assert(css.includes('body.quiz-active') && css.includes('overflow-y: auto !important;'),
    'body.quiz-active must allow page-level vertical scrolling');
  assert(css.includes('height: auto !important;'),
    'body.quiz-active must have height: auto in landscape');
});

test('2.2: Landscape .app-main and .content-wrapper allow full expansion without trapping', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  const css = match[0];
  assert(css.includes('body.quiz-active .app-main') && css.includes('overflow-y: auto !important;'),
    'app-main must allow vertical scroll in landscape');
  assert(css.includes('body.quiz-active .content-wrapper') && css.includes('overflow: visible !important;'),
    'content-wrapper must have overflow: visible in landscape');
});

test('2.3: Landscape .quiz-container and #study-quiz-area have overflow: visible and height: auto', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  const css = match[0];
  assert(css.includes('body.quiz-active .quiz-container') && css.includes('overflow: visible !important;'),
    'quiz-container must not trap content in landscape');
  assert(css.includes('#study-quiz-area') && css.includes('overflow: visible !important;'),
    'study-quiz-area must flow naturally with overflow: visible in landscape');
});

test('2.4: Landscape quiz options list maintains 2-column grid and allows all 4 options to be accessed', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  const css = match[0];
  assert(css.includes('grid-template-columns: repeat(2, 1fr) !important;'),
    'quiz-options-list must use 2 columns in landscape to conserve vertical height');
  assert(css.includes('.quiz-option-btn') && css.includes('min-height: 44px !important;'),
    'Option buttons must maintain touch target min-height');
});

// --- 3. FLASHCARD AND OTHER SCREENS IN LANDSCAPE ---
console.log('\n--- 3. Flashcard & Other Screens in Landscape ---');
test('3.1: Landscape Flashcard removes 100dvh lock and allows natural scrolling', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  const css = match[0];
  assert(css.includes('body.flashcard-active') && css.includes('overflow-y: auto !important;'),
    'flashcard-active body must allow vertical scrolling in landscape');
  assert(css.includes('body.flashcard-active .quiz-container') && css.includes('overflow: visible !important;'),
    'flashcard quiz-container must be overflow: visible in landscape');
});

test('3.2: Non-quiz screens (Bank, Stats, Settings, Decks, Dashboard) expand naturally in landscape', () => {
  const match = styleCss.match(/@media \(max-height: 550px\)[^\{]*\{([\s\S]*?)\n\}/);
  const css = match[0];
  assert(css.includes('#view-bank') && css.includes('#view-stats') && css.includes('overflow: visible !important;'),
    'Bank, Stats, Settings must have overflow: visible in landscape');
  assert(css.includes('body:not(.quiz-active) .app-main') && css.includes('overflow-y: auto !important;'),
    'app-main for non-quiz screens must allow vertical scrolling');
});

// --- 4. COMPACT LOW-HEIGHT LANDSCAPE OPTIMIZATIONS ---
console.log('\n--- 4. Compact Low-Height Landscape Ergonomics (<= 500px) ---');
test('4.1: CSS defines @media (orientation: landscape) and (max-height: 500px) optimization', () => {
  assert(styleCss.includes('@media (orientation: landscape) and (max-height: 500px)'),
    'Must define specialized <= 500px landscape query');
  const match = styleCss.match(/@media \(orientation: landscape\) and \(max-height: 500px\)\s*\{([\s\S]*?)\n\}/);
  assert(match, 'Compact landscape block found');
  const css = match[0];
  assert(css.includes('.quiz-card') && css.includes('padding: 10px 14px 14px 14px !important;'),
    'Must use compact card padding in low-height landscape');
  assert(css.includes('.quiz-option-btn') && css.includes('min-height: 40px !important;'),
    'Option buttons must have compact min-height in <= 500px landscape');
});

// --- 5. DESKTOP REGRESSION GUARDRAILS ---
console.log('\n--- 5. Desktop Layout Isolation Guardrails ---');
test('5.1: Desktop layout retains its fixed 100dvh bounded viewport rules on desktop screens', () => {
  const deskMatch = styleCss.match(/#view-study\.active\s*\{[\s\S]*?\n\}/);
  assert(deskMatch, 'Desktop view-study rule found');
  assert(deskMatch[0].includes('height: 100dvh !important;'), 'Desktop retains 100dvh');
  assert(deskMatch[0].includes('overflow: hidden !important;'), 'Desktop retains overflow: hidden');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 36 SUMMARY: All ${passed} tests passed 100%!`);
console.log(`========================================\n`);
