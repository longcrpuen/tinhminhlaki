/**
 * Test Suite: Stream 1 - Cyber Violet Dropdowns & Bulk Reassign Modal UI
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: Stream 1 (Cyber Dropdowns & Bulk Reassign) ===\n');

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

// 1. Bulk Reassign Modal Cyber Dropdown
test('1.1: Bulk reassign modal uses Cyber Violet dropdown wrap, trigger, and menu', () => {
  assert(indexHtml.includes('id="bulk-reassign-subject-dropdown-wrap"'), 'Has #bulk-reassign-subject-dropdown-wrap');
  assert(indexHtml.includes('id="bulk-reassign-subject-dropdown-trigger"'), 'Has #bulk-reassign-subject-dropdown-trigger');
  assert(indexHtml.includes('id="bulk-reassign-subject-dropdown-menu"'), 'Has #bulk-reassign-subject-dropdown-menu');
  assert(indexHtml.includes('id="bulk-reassign-target-subject" class="form-control" style="display: none;"'),
    'Preserves hidden synced #bulk-reassign-target-subject select');
  assert(appJs.includes('toggleBulkReassignSubjectDropdown(e)'), 'app.js defines toggleBulkReassignSubjectDropdown');
  assert(appJs.includes('selectBulkReassignSubject(subjectId, labelText, iconText)'), 'app.js defines selectBulkReassignSubject');
});

// 2. Manage Subject Modal Cyber Dropdowns
test('2.1: Manage Subject modal merge target uses Cyber Violet dropdown', () => {
  assert(indexHtml.includes('id="manage-subject-merge-dropdown-wrap"'), 'Has #manage-subject-merge-dropdown-wrap');
  assert(indexHtml.includes('id="manage-subject-merge-dropdown-trigger"'), 'Has #manage-subject-merge-dropdown-trigger');
  assert(indexHtml.includes('id="manage-subject-merge-dropdown-menu"'), 'Has #manage-subject-merge-dropdown-menu');
  assert(indexHtml.includes('id="manage-subject-merge-target" class="form-control" style="display: none;"'),
    'Preserves hidden synced #manage-subject-merge-target select');
  assert(appJs.includes('toggleManageSubjectMergeDropdown(e)'), 'app.js defines toggleManageSubjectMergeDropdown');
  assert(appJs.includes('selectManageSubjectMergeTarget(subjectId, labelText, iconText)'), 'app.js defines selectManageSubjectMergeTarget');
});

test('2.2: Manage Subject modal delete target uses Cyber Violet dropdown', () => {
  assert(indexHtml.includes('id="manage-subject-delete-dropdown-wrap"'), 'Has #manage-subject-delete-dropdown-wrap');
  assert(indexHtml.includes('id="manage-subject-delete-dropdown-trigger"'), 'Has #manage-subject-delete-dropdown-trigger');
  assert(indexHtml.includes('id="manage-subject-delete-dropdown-menu"'), 'Has #manage-subject-delete-dropdown-menu');
  assert(indexHtml.includes('id="manage-subject-delete-target" class="form-control" style="display: none;"'),
    'Preserves hidden synced #manage-subject-delete-target select');
  assert(appJs.includes('toggleManageSubjectDeleteDropdown(e)'), 'app.js defines toggleManageSubjectDeleteDropdown');
  assert(appJs.includes('selectManageSubjectDeleteTarget(subjectId, labelText, iconText)'), 'app.js defines selectManageSubjectDeleteTarget');
});

// 3. App-Wide Census: Zero Naked Selects
test('3.1: Zero naked select elements remain across index.html', () => {
  const selectMatches = indexHtml.match(/<select[^>]*>/g) || [];
  assert(selectMatches.length > 0, 'Found select elements in index.html');
  selectMatches.forEach(sel => {
    assert(sel.includes('display: none;'), `Select tag must have display: none;: ${sel}`);
  });
});

// 4. Bulk Deck List & Checkbox Enhancements
test('4.1: Bulk reassign modal features counter element and select all button', () => {
  assert(indexHtml.includes('id="bulk-reassign-count"'), 'Has #bulk-reassign-count');
  assert(indexHtml.includes('id="bulk-reassign-select-all-btn"'), 'Has #bulk-reassign-select-all-btn');
  assert(appJs.includes('updateBulkReassignCount()'), 'app.js defines updateBulkReassignCount');
  assert(appJs.includes('onBulkDeckCheckboxChange(inputEl)'), 'app.js defines onBulkDeckCheckboxChange');
});

test('4.2: Bulk reassign deck list renders custom cyber checkboxes and selected row highlights', () => {
  assert(appJs.includes('class="bulk-deck-row"'), 'Renders .bulk-deck-row');
  assert(appJs.includes('class="bulk-deck-checkbox cyber-checkbox"'), 'Uses .cyber-checkbox');
  assert(appJs.includes('class="subject-badge"'), 'Uses .subject-badge on the right');
  assert(styleCss.includes('.bulk-deck-row.selected'), 'style.css defines .bulk-deck-row.selected');
  assert(styleCss.includes('.cyber-checkbox:checked'), 'style.css defines .cyber-checkbox:checked');
});

// 5. Universal Keyboard Navigation & Dropup Support
test('5.1: Universal keyboard navigation handles ArrowDown, ArrowUp, Enter, Escape for .cyber-dropdown', () => {
  assert(appJs.includes('e.key === \'Escape\'') && appJs.includes('closeAllCyberDropdowns()'), 'Handles Escape key');
  assert(appJs.includes('e.key === \'ArrowDown\''), 'Handles ArrowDown key');
  assert(appJs.includes('e.key === \'ArrowUp\''), 'Handles ArrowUp key');
  assert(appJs.includes('aria-expanded'), 'Manages aria-expanded on triggers');
  assert(styleCss.includes('.cyber-dropdown.dropup .cyber-dropdown-menu'), 'Supports .cyber-dropdown.dropup');
});

// 6. Mobile 44px Touch Target Standard
test('6.1: style.css enforces min-height >= 44px on mobile for dropdown items', () => {
  assert(styleCss.includes('min-height: 44px;'), 'style.css sets min-height: 44px for touch accessibility');
});

console.log(`\nStream 1 Verification Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
