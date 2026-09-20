/**
 * Automated Verification Suite - Round 25: Unified Theme & Cyber Violet Dropdowns
 * Tests for:
 * 1. Modal Add/Edit Card custom Cyber Violet dropdowns:
 *    - Deck selector (#edit-card-deck-dropdown-wrap)
 *    - Difficulty selector (#edit-card-diff-dropdown-wrap)
 *    - Correct answer selector (#edit-card-correct-dropdown-wrap)
 * 2. Question Bank source filter Cyber Violet dropdown (#bank-source-dropdown-wrap)
 * 3. Import AI & LMS deck selectors Cyber Violet dropdowns
 * 4. App.js event handlers, dynamic population, and global outside-click dismissal
 * 5. Universal CSS form & select styling with color-scheme: dark and custom purple SVG chevron
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

console.log('=== TEST SUITE 25: Unified Cyber Violet Theme & Custom Dropdowns ===\n');

// -----------------------------------------------------------------------------
// 1. Modal Add/Edit Card Dropdowns (#modal-edit-card)
// -----------------------------------------------------------------------------
console.log('--- 1. Modal Add/Edit Card Cyber Violet Dropdowns ---');

test('index.html defines #edit-card-deck-dropdown-wrap as a .cyber-dropdown', () => {
  assert(indexHtml.includes('id="edit-card-deck-dropdown-wrap"') && indexHtml.includes('class="cyber-dropdown"'),
    'Modal deck selector must be wrapped in .cyber-dropdown component');
  assert(indexHtml.includes('id="edit-card-deck-dropdown-trigger"'),
    'Must define #edit-card-deck-dropdown-trigger button');
  assert(indexHtml.includes('id="edit-card-deck-dropdown-label"'),
    'Must define #edit-card-deck-dropdown-label for dynamic deck title display');
  assert(indexHtml.includes('id="edit-card-deck-dropdown-menu"'),
    'Must define #edit-card-deck-dropdown-menu for floating item list');
  assert(indexHtml.includes('id="edit-card-deck-select"') && indexHtml.includes('style="display: none;"'),
    'Hidden select preserved for form submission compatibility');
});

test('index.html defines #edit-card-diff-dropdown-wrap as a .cyber-dropdown', () => {
  assert(indexHtml.includes('id="edit-card-diff-dropdown-wrap"'),
    'Modal difficulty selector must use .cyber-dropdown component');
  assert(indexHtml.includes('id="edit-card-diff-dropdown-trigger"'),
    'Must define difficulty trigger button');
  assert(indexHtml.includes('id="edit-card-diff-dropdown-menu"'),
    'Must define difficulty dropdown menu');
  assert(indexHtml.includes("App.selectEditCardDifficulty('easy')") &&
         indexHtml.includes("App.selectEditCardDifficulty('medium')") &&
         indexHtml.includes("App.selectEditCardDifficulty('hard')"),
    'Difficulty menu must offer easy, medium, and hard choices');
});

test('index.html defines #edit-card-correct-dropdown-wrap as a .cyber-dropdown', () => {
  assert(indexHtml.includes('id="edit-card-correct-dropdown-wrap"'),
    'Modal correct answer selector must use .cyber-dropdown component');
  assert(indexHtml.includes('id="edit-card-correct-dropdown-trigger"'),
    'Must define correct answer trigger button');
  assert(indexHtml.includes('id="edit-card-correct-dropdown-menu"'),
    'Must define correct answer dropdown menu');
  assert(indexHtml.includes("App.selectEditCardCorrect('a')") &&
         indexHtml.includes("App.selectEditCardCorrect('d')"),
    'Correct answer menu must offer A, B, C, D choices');
});

// -----------------------------------------------------------------------------
// 2. Question Bank & Import Views Custom Dropdowns
// -----------------------------------------------------------------------------
console.log('\n--- 2. Question Bank & Import Views Cyber Violet Dropdowns ---');

test('index.html defines #bank-source-dropdown-wrap as a .cyber-dropdown in Question Bank', () => {
  assert(indexHtml.includes('id="bank-source-dropdown-wrap"'),
    'Question Bank source filter must use .cyber-dropdown component');
  assert(indexHtml.includes('id="bank-source-dropdown-label"'),
    'Must define #bank-source-dropdown-label');
  assert(indexHtml.includes('id="bank-source-dropdown-menu"'),
    'Must define #bank-source-dropdown-menu');
  assert(indexHtml.includes('id="bank-source-filter"') && indexHtml.includes('style="display: none;"'),
    'Underlying #bank-source-filter preserved for query compatibility');
});

test('index.html defines #import-deck-dropdown-wrap in AI Import tab', () => {
  assert(indexHtml.includes('id="import-deck-dropdown-wrap"'),
    'AI Import tab must use .cyber-dropdown for destination deck');
  assert(indexHtml.includes('id="import-deck-dropdown-label"'),
    'Must define #import-deck-dropdown-label');
  assert(indexHtml.includes('id="import-deck-dropdown-menu"'),
    'Must define #import-deck-dropdown-menu');
});

test('index.html defines #lms-deck-dropdown-wrap in LMS Import tab', () => {
  assert(indexHtml.includes('id="lms-deck-dropdown-wrap"'),
    'LMS Import tab must use .cyber-dropdown for destination deck');
  assert(indexHtml.includes('id="lms-deck-dropdown-label"'),
    'Must define #lms-deck-dropdown-label');
  assert(indexHtml.includes('id="lms-deck-dropdown-menu"'),
    'Must define #lms-deck-dropdown-menu');
});

// -----------------------------------------------------------------------------
// 3. App.js Dynamic Population & Outside-Click Dismissal
// -----------------------------------------------------------------------------
console.log('\n--- 3. App.js Logic, Event Handlers & Outside-Click Dismissal ---');

test('app.js implements openAddCardModal populating the custom deck dropdown', () => {
  assert(appJs.includes("document.getElementById('edit-card-deck-dropdown-menu')"),
    'openAddCardModal must populate custom deck dropdown menu');
  assert(appJs.includes("document.getElementById('edit-card-deck-dropdown-label')"),
    'openAddCardModal must update custom deck dropdown label');
  assert(appJs.includes("this.selectEditCardDifficulty('medium')"),
    'openAddCardModal initializes difficulty to medium');
  assert(appJs.includes("this.selectEditCardCorrect('a')"),
    'openAddCardModal initializes correct answer to a');
});

test('app.js implements openEditCardModal synchronizing difficulty and correct answer', () => {
  assert(appJs.includes("this.selectEditCardDifficulty(card.difficulty || 'medium')"),
    'openEditCardModal syncs card difficulty');
  assert(appJs.includes("this.selectEditCardCorrect(curCorrect)"),
    'openEditCardModal syncs card correct answer');
});

test('app.js implements deck, difficulty, and correct answer dropdown handlers', () => {
  assert(appJs.includes('toggleEditCardDeckDropdown('), 'Must implement toggleEditCardDeckDropdown');
  assert(appJs.includes('selectEditCardDeck('), 'Must implement selectEditCardDeck');
  assert(appJs.includes('toggleEditCardDiffDropdown('), 'Must implement toggleEditCardDiffDropdown');
  assert(appJs.includes('selectEditCardDifficulty('), 'Must implement selectEditCardDifficulty');
  assert(appJs.includes('toggleEditCardCorrectDropdown('), 'Must implement toggleEditCardCorrectDropdown');
  assert(appJs.includes('selectEditCardCorrect('), 'Must implement selectEditCardCorrect');
});

test('app.js closeAllCyberDropdowns dismisses all open .cyber-dropdown elements', () => {
  assert(appJs.includes("document.querySelectorAll('.cyber-dropdown.open').forEach"),
    'closeAllCyberDropdowns must generically close all open cyber-dropdown elements');
  assert(appJs.includes("document.addEventListener('click', (e) => {") &&
         appJs.includes("!wrap.contains(e.target)"),
    'Global click handler must dismiss any open dropdown when clicking outside');
});

// -----------------------------------------------------------------------------
// 4. Universal CSS & Dark Color-Scheme Protection
// -----------------------------------------------------------------------------
console.log('\n--- 4. Universal CSS Form & Select Styling with Dark Color Scheme ---');

test('index.html and style.css specify color-scheme: dark for OS form control rendering', () => {
  assert(indexHtml.includes('<meta name="color-scheme" content="dark">'),
    'index.html must include meta name="color-scheme" content="dark"');
  assert(styleCss.includes('color-scheme: dark;'),
    'style.css must declare color-scheme: dark on :root, html, and body');
});

test('style.css eliminates native OS select styling and injects custom violet SVG chevron', () => {
  assert(styleCss.includes('appearance: none !important;') &&
         styleCss.includes('-webkit-appearance: none !important;'),
    'All select elements must force appearance: none to strip OS gray style');
  assert(styleCss.includes("background-color: #131122 !important;"),
    'Select elements must have Cyber Violet dark background');
  assert(styleCss.includes("data:image/svg+xml") && styleCss.includes("%23a78bfa"),
    'Select elements must embed purple (#a78bfa) SVG chevron icon');
});

test('style.css enforces form-group full width and modal z-index for cyber dropdowns', () => {
  assert(styleCss.includes('.form-group .cyber-dropdown') && styleCss.includes('width: 100% !important;'),
    '.form-group .cyber-dropdown must expand to full width');
  assert(styleCss.includes('.modal-box .cyber-dropdown-menu') && styleCss.includes('z-index: 300 !important;'),
    'Modal dropdown menus must have high z-index (300) to float above all form fields');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================');
console.log(`TEST SUITE 25 SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('========================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
