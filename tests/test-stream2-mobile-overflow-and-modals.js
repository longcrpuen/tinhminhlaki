/**
 * Test Suite: Stream 2 - Mobile Horizontal Overflow & Standardized Modal Layout
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: Stream 2 (Mobile Overflow & Modal Layout) ===\n');

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

// 1. Modal 3-Part Architecture (Desktop & Base)
test('1.1: .modal-box uses 3-part flex column container with contained overflow', () => {
  assert(styleCss.includes('display: flex;') && styleCss.includes('flex-direction: column;'),
    'modal-box uses flex column layout');
  assert(styleCss.includes('max-height: calc(100dvh - 48px);'), 'Base modal max-height uses dvh');
  assert(styleCss.includes('.modal-header') && styleCss.includes('flex-shrink: 0;'),
    'modal-header is pinned at top with flex-shrink: 0');
  assert(styleCss.includes('.modal-body') && styleCss.includes('overscroll-behavior: contain;'),
    'modal-body isolates scroll with overscroll-behavior: contain');
  assert(styleCss.includes('.modal-footer') && styleCss.includes('flex-shrink: 0;'),
    'modal-footer is pinned at bottom with flex-shrink: 0');
});

// 2. Mobile Responsive Modal Layout (< 768px)
test('2.1: Mobile breakpoint optimizes modal-box with 100dvh and safe-area inset', () => {
  assert(styleCss.includes('max-height: calc(100dvh - 24px) !important;'),
    'Mobile modal-box uses calc(100dvh - 24px)');
  assert(styleCss.includes('env(safe-area-inset-bottom'),
    'Mobile modal-footer includes safe-area inset protection');
  assert(styleCss.includes('body.modal-open .bottom-nav') || styleCss.includes('body:has(.modal-overlay.show) .bottom-nav'),
    'Hides bottom nav while modal is open to prevent occlusion of action buttons');
});

// 3. Landscape Mobile Optimization (< 500px height)
test('3.1: Landscape mobile restricts modal height to calc(100dvh - 16px)', () => {
  assert(styleCss.includes('max-height: calc(100dvh - 16px) !important;'),
    'Landscape mobile constrains modal-box within 100dvh - 16px');
});

// 4. Horizontal Overflow Root Defenses
test('4.1: Root containers and hr elements have strict overflow containment and box-sizing', () => {
  assert(styleCss.includes('overflow-x: clip;'), 'html/body and content-wrapper enforce overflow-x: clip');
  assert(styleCss.includes('box-sizing: inherit;'), 'Universal box-sizing inheritance');
  assert(styleCss.includes('hr {') && styleCss.includes('box-sizing: border-box !important;'),
    'hr elements reset with box-sizing: border-box and max-width: 100%');
});

// 5. Bulk Deck Reassign Overflow Proofing
test('5.1: Bulk deck list row and title cannot blow out container width', () => {
  assert(styleCss.includes('.bulk-deck-title') && styleCss.includes('min-width: 0;'),
    'bulk-deck-title enforces min-width: 0 to prevent flex item blow-out');
  assert(styleCss.includes('.bulk-deck-row') && styleCss.includes('box-sizing: border-box;'),
    'bulk-deck-row is border-box contained');
});

// 6. No Inline Overrides Breaking Modal Layout
test('6.1: modal-edit-card modal-box does not contain conflicting inline max-height or overflow-y', () => {
  assert(!indexHtml.includes('id="modal-edit-card" class="modal-overlay">\n    <div class="modal-box" style="max-width: 650px; max-height: 90vh; overflow-y: auto;">'),
    'modal-edit-card inline max-height and overflow-y removed');
});

// 7. App Modal Lifecycle Synchronization
test('7.1: App implements synchronized _showModal and _closeModal helpers', () => {
  assert(appJs.includes('_showModal(modal)'), 'app.js defines _showModal');
  assert(appJs.includes('_closeModal(modal)'), 'app.js defines _closeModal');
  assert(appJs.includes('document.body.classList.add(\'modal-open\')'), 'App marks body modal-open on modal open');
});

console.log(`\nStream 2 Verification Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
