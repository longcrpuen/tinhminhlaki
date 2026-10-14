/**
 * Test Suite for Stream 1: Background & Offline Blob Storage
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: Stream 1 (Background & Offline Blob Storage) ===\n');

const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

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

// 1. Blob Storage & Compression Logic
test('1.1: App implements _compressImageToBlob with WebP export and JPEG fallback', () => {
  assert(appJs.includes('_compressImageToBlob(file, maxDim = 1920, quality = 0.80)'), 'Defines _compressImageToBlob with 1920px maxDim');
  assert(appJs.includes("canvas.toBlob") && appJs.includes("'image/webp'"), 'Exports to WebP blob via canvas.toBlob');
  assert(appJs.includes("'image/jpeg'"), 'Contains fallback to JPEG if WebP unsupported');
  assert(appJs.includes('URL.revokeObjectURL'), 'Revokes temporary load ObjectURL');
});

// 2. Background Manager with Blob and ObjectURL Lifecycle
test('2.1: App.setBackground manages Blob instances and revokes stale object URLs', () => {
  assert(appJs.includes('_currentBgBlobUrl'), 'Tracks active blob URL');
  assert(appJs.includes('URL.revokeObjectURL(this._currentBgBlobUrl)'), 'Revokes previous object URL on switch');
  assert(appJs.includes('src instanceof Blob'), 'Directly supports Blob instance as src');
  assert(appJs.includes("db.setMeta('customBackgroundBlob', src)"), 'Saves Blob in IndexedDB meta store');
  assert(appJs.includes("document.body.classList.add('has-custom-bg')"), 'Applies has-custom-bg class to body');
  assert(appJs.includes("document.body.classList.remove('has-custom-bg')"), 'Removes has-custom-bg when none');
});

// 3. App Initialization from IndexedDB Blob
test('3.1: App.init loads custom_blob from IndexedDB and recreates ObjectURL', () => {
  assert(appJs.includes("savedBg === 'custom_blob'"), 'Handles custom_blob storage marker');
  assert(appJs.includes("db.getMeta('customBackgroundBlob', null)"), 'Retrieves Blob from IndexedDB');
  assert(appJs.includes('blob instanceof Blob'), 'Validates Blob instance before setting');
});

// 4. CSS Stacking & Duotone Overlay
test('4.1: style.css defines safe z-index and transparent body when custom background is active', () => {
  assert(styleCss.includes('#bg-layer') && styleCss.includes('z-index: 0;'), '#bg-layer has z-index 0 behind app-container');
  assert(styleCss.includes('body.has-custom-bg') && styleCss.includes('background-color: transparent !important;'), 'Body background becomes transparent when background is active');
  assert(styleCss.includes('#bg-layer::before') && styleCss.includes('linear-gradient'), '#bg-layer retains duotone contrast overlay');
  assert(styleCss.includes('#bg-layer.active') && styleCss.includes('opacity: 1;'), '#bg-layer.active sets opacity 1');
});

console.log(`\nStream 1 Verification Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
