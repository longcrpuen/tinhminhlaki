/**
 * Test Suite 32: Active Recall ("Đoán trước") Tight Contouring & Bottom Hugging Verification
 *
 * Verifies that in "Đoán trước" mode:
 * 1. Desktop & Mobile layouts hug content tightly with zero extra dangling space at the bottom.
 * 2. All lower elements (.quiz-options-list, #quiz-explanation-box, .quiz-footer-actions) are strictly display: none !important.
 * 3. #study-quiz-area has flex: 0 0 auto and padding-bottom: 0 in blind mode (no stretching).
 * 4. Desktop large-screen media queries preserve bounded padding-bottom (20px) without inflating.
 * 5. JS state synchronization (render, toggle, reveal, next) manages .blind-active cleanly across both card and area.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 32: Active Recall Tight Contouring & Zero-Void Bottom Fix ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');

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

const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Main mobile breakpoint must exist');

const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// --- 1. Desktop Contouring & Suppression ---
test('1.1: Desktop .quiz-card.blind-active has height: auto, flex: none, and padding-bottom: 20px', () => {
  const idx = desktopCss.indexOf('.quiz-card.blind-active {');
  assert(idx !== -1, '.quiz-card.blind-active must exist in desktop CSS');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('height: auto !important;'), 'height must be auto');
  assert(block.includes('flex: none !important;'), 'flex must be none');
  assert(block.includes('padding-bottom: 20px !important;'), 'padding-bottom must be 20px');
  assert(block.includes('margin-bottom: 0 !important;'), 'margin-bottom must be 0');
});

test('1.2: Desktop #study-quiz-area.blind-active has height: auto, flex: 0 0 auto, and padding-bottom: 0', () => {
  assert(desktopCss.includes('#study-quiz-area.blind-active'), 'blind-active rule for #study-quiz-area must exist');
  const idx = desktopCss.indexOf('#study-quiz-area.blind-active');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('height: auto !important;'), 'height must be auto');
  assert(block.includes('flex: 0 0 auto !important;'), 'flex must be 0 0 auto');
  assert(block.includes('padding-bottom: 0 !important;'), 'padding-bottom must be 0');
});

test('1.3: All lower elements under blind-active are display: none !important', () => {
  const idx = desktopCss.indexOf('.quiz-card.blind-active .quiz-options-list');
  assert(idx !== -1, 'Suppression rule for blind-active children must exist');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('display: none !important;'), 'must be display: none !important');
  assert(block.includes('height: 0 !important;'), 'must have height: 0 !important');
  assert(block.includes('margin: 0 !important;'), 'must have margin: 0 !important');
  assert(block.includes('padding: 0 !important;'), 'must have padding: 0 !important');
});

// --- 2. Mobile Contouring & Responsive Isolation ---
test('2.1: Mobile CSS overrides #study-quiz-area stretching in blind mode to flex: 0 0 auto and padding-bottom: 0', () => {
  assert(mobileCss.includes('body.quiz-active #study-quiz-area.blind-active'),
    'Mobile CSS must contain specialized blind-active rule for #study-quiz-area');
  const idx = mobileCss.indexOf('body.quiz-active #study-quiz-area.blind-active');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('flex: 0 0 auto !important;'), 'Mobile blind area must not stretch');
  assert(block.includes('padding-bottom: 0 !important;'), 'Mobile blind area must eliminate 56px bottom padding');
});

test('2.2: Mobile CSS hugs .quiz-card.blind-active with compact 16px bottom padding', () => {
  assert(mobileCss.includes('body.quiz-active .quiz-card.blind-active'),
    'Mobile CSS must contain specialized blind-active rule for .quiz-card');
  const idx = mobileCss.indexOf('body.quiz-active .quiz-card.blind-active');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('padding-bottom: 16px !important;'), 'Mobile blind card padding must be 16px');
  assert(block.includes('margin-bottom: 0 !important;'), 'Mobile blind card margin-bottom must be 0');
});

// --- 3. Large Desktop Media Queries ---
test('3.1: Large desktop media queries (1024px, 1440px, 1920px) maintain bounded 20px padding on blind card', () => {
  assert(styleCss.includes('#view-study .quiz-card.blind-active,\n  body.quiz-blind-active #view-study .quiz-card {\n    padding-bottom: 20px !important;'),
    'Large desktop queries must contain blind-active padding-bottom: 20px');
});

// --- 4. JS State Synchronization ---
test('4.1: app.js coordinates blind-active across both card and area in _renderQuizContent', () => {
  assert(appJs.includes("quizCard.classList.toggle('blind-active', Boolean(showBlindPanel));"),
    '_renderQuizContent toggles blind-active on card');
  assert(appJs.includes("quizArea.classList.toggle('blind-active', Boolean(showBlindPanel));"),
    '_renderQuizContent toggles blind-active on area');
  assert(appJs.includes("document.body.classList.toggle('quiz-blind-active', Boolean(showBlindPanel));"),
    '_renderQuizContent toggles quiz-blind-active on body');
});

test('4.2: app.js synchronizes blind-active in toggleBlindMode() for instant responsive toggle', () => {
  assert(appJs.includes("if (quizCard) quizCard.classList.add('blind-active');"),
    'toggleBlindMode adds blind-active to card when ON');
  assert(appJs.includes("if (quizArea) quizArea.classList.add('blind-active');"),
    'toggleBlindMode adds blind-active to area when ON');
  assert(appJs.includes("if (quizCard) quizCard.classList.remove('blind-active');"),
    'toggleBlindMode removes blind-active from card when OFF');
  assert(appJs.includes("if (quizArea) quizArea.classList.remove('blind-active');"),
    'toggleBlindMode removes blind-active from area when OFF');
});

test('4.3: app.js cleanses blind-active in revealBlindOptions() and nextStudyQuestion()', () => {
  assert(appJs.includes("revealBlindOptions() {\n    if (!this.activeSession) return;\n    this.activeSession.blindRevealed = true;\n\n    const veil = document.getElementById('quiz-blind-veil');\n    if (veil) {\n      veil.style.setProperty('display', 'none', 'important');\n      veil.classList.add('hidden-mode');\n    }\n\n    const quizCard = document.querySelector('#study-quiz-area .quiz-card');\n    if (quizCard) {\n      quizCard.classList.remove('blind-active');\n    }"),
    'revealBlindOptions removes blind-active cleanly');
  assert(appJs.includes("if (quizArea) {\n        quizArea.scrollTop = 0;\n        quizArea.classList.remove('blind-active');\n      }"),
    'nextStudyQuestion resets blind-active on quizArea');
});

console.log('\n========================================');
console.log(`TEST SUITE 32 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
