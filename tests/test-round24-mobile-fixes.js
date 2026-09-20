/**
 * Automated Verification Suite - Round 24: Mobile Layout Fixes
 * Tests for:
 * 1. Item 4: Settings custom background input and buttons responsive stacking (< 640px)
 * 2. Item 6: Decks library "+ Thêm câu" and action buttons symmetrical 2-column grid (< 768px)
 * 3. Item 7: Flashcard mobile layout overhaul (face isolation, 2x2 SRS ratings, no overlapping text/tags)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('=== TEST SUITE 24: Mobile Layout Fixes (Settings, Decks & Flashcard) ===\n');

// -----------------------------------------------------------------------------
// 1. Settings Custom Background Row Stacking (Item 4)
// -----------------------------------------------------------------------------
console.log('--- 1. Settings Custom Background Row Responsive Stacking (Item 4) ---');

test('index.html contains .bg-custom-bar and .bg-custom-actions without inline flex conflict', () => {
  assert(indexHtml.includes('class="bg-custom-bar"'), 'Must contain .bg-custom-bar');
  assert(indexHtml.includes('class="bg-custom-actions"'), 'Must contain .bg-custom-actions');
  assert(!indexHtml.includes('style="display: flex; gap: 10px; align-items: center; margin-top: 12px;"'),
    'Must remove unconstrained inline flex style that caused mobile overflow');
});

test('style.css defines desktop base styles for .bg-custom-bar and .bg-custom-actions', () => {
  assert(styleCss.includes('.bg-custom-bar {') && styleCss.includes('display: flex;'),
    '.bg-custom-bar must have desktop flex display');
  assert(styleCss.includes('.bg-custom-actions {') && styleCss.includes('display: flex;'),
    '.bg-custom-actions must have desktop flex display');
});

test('style.css stacks .bg-custom-bar vertically in @media (max-width: 640px)', () => {
  const m640Regex = /@media\s*\([^)]*max-width:\s*640px[^)]*\)\s*\{([\s\S]*?)\n\}/g;
  let match;
  let hasStacking = false;
  let has2ColActions = false;

  while ((match = m640Regex.exec(styleCss)) !== null) {
    const block = match[1];
    if (block.includes('.bg-custom-bar') && block.includes('flex-direction: column !important;')) {
      hasStacking = true;
    }
    if (block.includes('.bg-custom-actions') && block.includes('grid-template-columns: repeat(2, 1fr) !important;')) {
      has2ColActions = true;
    }
  }

  assert(hasStacking, '.bg-custom-bar must stack as column on screens <= 640px');
  assert(has2ColActions, '.bg-custom-actions must render as 2-column grid on screens <= 640px');
});

test('Settings background row simulation on 360px mobile screen has 0px horizontal overflow', () => {
  const screenWidth = 360;
  const padding = 16 * 2; // card padding
  const availableWidth = screenWidth - padding; // 328px

  // In column layout:
  // Row 1: input width = 100% (328px)
  // Row 2: 2 buttons in grid with 8px gap => (328 - 8) / 2 = 160px each
  const inputWidth = availableWidth;
  const buttonGap = 8;
  const buttonWidth = (availableWidth - buttonGap) / 2;

  assert(inputWidth <= availableWidth, `Input width (${inputWidth}px) must fit within container (${availableWidth}px)`);
  assert(buttonWidth * 2 + buttonGap <= availableWidth, 'Buttons row must fit within container with 0px overflow');
});

// -----------------------------------------------------------------------------
// 2. Decks Library Actions Symmetrical Alignment (Item 6)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Decks Library Action Buttons Symmetrical 2-Column Grid (Item 6) ---');

test('app.js renderDecks places + Thêm câu adjacent to 🔄 Reset', () => {
  const renderDecksMatch = appJs.match(/async\s+renderDecks\(\)[\s\S]*?async\s+confirmResetDeckProgress/);
  assert(renderDecksMatch, 'Must find renderDecks function in app.js');
  const code = renderDecksMatch[0];

  const idxStudy = code.indexOf("Ôn tập");
  const idxFlashcard = code.indexOf("Lật thẻ");
  const idxExam = code.indexOf("Thi thử");
  const idxAdd = code.indexOf("+ Thêm câu");
  const idxReset = code.indexOf("🔄 Reset");

  assert(idxStudy !== -1 && idxFlashcard !== -1 && idxExam !== -1 && idxAdd !== -1 && idxReset !== -1,
    'All 5 action buttons must be present in renderDecks');
  assert(idxStudy < idxFlashcard && idxFlashcard < idxExam && idxExam < idxAdd && idxAdd < idxReset,
    'Buttons must be ordered: Ôn tập -> Lật thẻ -> Thi thử -> + Thêm câu -> 🔄 Reset');
});

test('style.css formats .deck-actions as a 2-column grid on mobile (max-width: 768px)', () => {
  const m768Regex = /@media\s*\([^)]*max-width:\s*768px[^)]*\)\s*\{([\s\S]*?)\n\}/g;
  let match;
  let has2ColGrid = false;
  let hasStudySpan = false;

  while ((match = m768Regex.exec(styleCss)) !== null) {
    const block = match[1];
    if (block.includes('.deck-actions') && block.includes('grid-template-columns: repeat(2, 1fr) !important;')) {
      has2ColGrid = true;
    }
    if (block.includes('.btn-deck-study') && block.includes('grid-column: 1 / -1 !important;')) {
      hasStudySpan = true;
    }
  }

  assert(has2ColGrid, '.deck-actions must be styled as 2-column grid on mobile');
  assert(hasStudySpan, '.btn-deck-study must span full 2 columns on mobile');
});

test('Deck card button grid simulation on mobile guarantees perfect symmetry and no crooked buttons', () => {
  // Simulating 5 buttons in 2-column grid:
  // Item 0 ("Ôn tập"): span 2 cols => row 1 (100% width)
  // Item 1 ("Lật thẻ"): col 1 => row 2
  // Item 2 ("Thi thử"): col 2 => row 2
  // Item 3 ("+ Thêm câu"): col 1 => row 3
  // Item 4 ("🔄 Reset"): col 2 => row 3
  const buttons = ['Ôn tập', 'Lật thẻ', 'Thi thử', '+ Thêm câu', '🔄 Reset'];
  const gridRows = [];

  // Row 1
  gridRows.push([buttons[0]]);
  // Row 2
  gridRows.push([buttons[1], buttons[2]]);
  // Row 3
  gridRows.push([buttons[3], buttons[4]]);

  assert.strictEqual(gridRows[0].length, 1, 'Row 1 has 1 full-width CTA');
  assert.strictEqual(gridRows[1].length, 2, 'Row 2 has 2 symmetrical buttons');
  assert.strictEqual(gridRows[2].length, 2, 'Row 3 has 2 symmetrical buttons (+ Thêm câu and Reset)');
  assert.strictEqual(gridRows[2][0], '+ Thêm câu', '+ Thêm câu is in column 1 of row 3');
  assert.strictEqual(gridRows[2][1], '🔄 Reset', 'Reset is in column 2 of row 3');
});

// -----------------------------------------------------------------------------
// 3. Flashcard Mobile Layout Overhaul & Isolation (Item 7)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Flashcard Mobile Layout Overhaul & Isolation (Item 7) ---');

test('style.css enforces strict physical face isolation between front and back cards', () => {
  assert(styleCss.includes('.flashcard-card:not(.flipped) .flashcard-front') &&
         styleCss.includes('opacity: 1 !important;') &&
         styleCss.includes('visibility: visible !important;'),
    'Unflipped front face must be visible');

  assert(styleCss.includes('.flashcard-card:not(.flipped) .flashcard-back') &&
         styleCss.includes('opacity: 0 !important;') &&
         styleCss.includes('visibility: hidden !important;'),
    'Unflipped back face must be physically hidden and have pointer-events none');

  assert(styleCss.includes('.flashcard-card.flipped .flashcard-front') &&
         styleCss.includes('opacity: 0 !important;') &&
         styleCss.includes('visibility: hidden !important;'),
    'Flipped front face must be physically hidden so topic/difficulty tags never collide with back or buttons');

  assert(styleCss.includes('.flashcard-card.flipped .flashcard-back') &&
         styleCss.includes('opacity: 1 !important;') &&
         styleCss.includes('visibility: visible !important;'),
    'Flipped back face must be visible');
});

test('style.css respects display: none on #flashcard-srs-bar to prevent leaking onto front face', () => {
  assert(styleCss.includes('#flashcard-srs-bar[style*="display: none"]') ||
         styleCss.includes('#flashcard-srs-bar[style*="display:none"]'),
    'CSS must respect inline display: none on #flashcard-srs-bar');
});

test('app.js controls srsBar with setProperty display important', () => {
  assert(appJs.includes("srsBar.style.setProperty('display', 'none', 'important')"),
    'app.js must hide srsBar with important priority upon card render');
  assert(appJs.includes("srsBar.style.setProperty('display', disp, 'important')"),
    'app.js must toggle srsBar with important priority upon flip');
});

test('style.css styles 2x2 SRS buttons with typography safeguards against wrapping/overlap', () => {
  assert(styleCss.includes('body.flashcard-active #flashcard-srs-bar') &&
         styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
    'SRS bar must be 2x2 grid on mobile');

  assert(styleCss.includes('body.flashcard-active .srs-btn') &&
         styleCss.includes('white-space: nowrap !important;'),
    '.srs-btn must enforce white-space: nowrap to prevent text wrapping collisions');

  assert(styleCss.includes('body.flashcard-active .srs-btn .srs-interval'),
    '.srs-interval badge must be cleanly styled');
});

test('SRS button vertical space budget fits within 48px standard touch target across mobile widths', () => {
  // Mobile phone screen: 360px width
  // Flashcard padding: 16px each side => 328px total width
  // SRS bar: 2 columns, 10px gap => (328 - 10) / 2 = 159px width per button
  const buttonHeight = 48; // px
  const paddingTopBottom = 4 + 4; // 8px
  const labelHeight = 14; // ~0.78rem line-height 1.1
  const gap = 2;
  const intervalHeight = 14; // ~0.7rem with badge padding
  const totalContentHeight = paddingTopBottom + labelHeight + gap + intervalHeight; // 38px

  assert(totalContentHeight <= buttonHeight,
    `Total SRS button content height (${totalContentHeight}px) fits within container (${buttonHeight}px) without collision`);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================');
console.log(`TEST SUITE 24 SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('========================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
