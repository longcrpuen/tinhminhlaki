/**
 * Test Suite: Sidebar DOM Detachment, Meta tags & Console Cleanliness Verification
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const htmlContent = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const appJsContent = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE 7: Round 4 Meta tags & Console Cleanliness ===');

// 1. Check meta tags in HTML
assert(
  htmlContent.includes('<meta name="mobile-web-app-capable" content="yes">'),
  'Standard meta mobile-web-app-capable exists in index.html'
);
assert(
  htmlContent.includes('<meta name="apple-mobile-web-app-capable" content="yes">'),
  'Legacy meta apple-mobile-web-app-capable preserved for iOS backward compatibility'
);

// 2. Check no debug console.log in app.js
assert(
  !appJsContent.includes('[Background] Thiết lập hình nền'),
  'No [Background] debug log in app.js'
);
assert(
  !appJsContent.includes('[BG Upload]'),
  'No [BG Upload] debug logs in app.js'
);
assert(
  !appJsContent.includes('[Heatmap] Render thành công'),
  'No [Heatmap] success debug logs in app.js'
);
assert(
  !appJsContent.includes('[App.init] Nạp hình nền'),
  'No [App.init] debug log in app.js'
);

console.log('\n=== TEST SUITE 8: Sidebar DOM Detachment & Tooltip Verification ===');

// 3. Check data-tooltip attributes in index.html
const tooltipMatches = htmlContent.match(/data-tooltip="([^"]+)"/g) || [];
assert(
  tooltipMatches.length >= 6,
  `At least 6 data-tooltip attributes exist in sidebar (${tooltipMatches.length} found)`
);
assert(
  htmlContent.includes('data-tooltip="Tổng quan"'),
  'data-tooltip="Tổng quan" exists on dashboard nav item'
);
assert(
  htmlContent.includes('data-tooltip="Thư viện thẻ"'),
  'data-tooltip="Thư viện thẻ" exists on decks nav item'
);
assert(
  htmlContent.includes('data-tooltip="Ngân hàng câu hỏi"'),
  'data-tooltip="Ngân hàng câu hỏi" exists on bank nav item'
);
assert(
  htmlContent.includes('data-tooltip="Dán câu hỏi AI"'),
  'data-tooltip="Dán câu hỏi AI" exists on import nav item'
);
assert(
  htmlContent.includes('data-tooltip="Thống kê"'),
  'data-tooltip="Thống kê" exists on stats nav item'
);
assert(
  htmlContent.includes('data-tooltip="Cài đặt & Sao lưu"'),
  'data-tooltip="Cài đặt & Sao lưu" exists on settings nav item'
);

// 4. Check .nav-label class
const navLabelMatches = htmlContent.match(/class="nav-label"/g) || [];
assert(
  navLabelMatches.length >= 6,
  `At least 6 .nav-label elements defined in sidebar HTML (${navLabelMatches.length} found)`
);

// 5. Check CSS for tooltip pseudo-elements and transitions
assert(
  cssContent.includes('.app-sidebar.collapsed .nav-item button[data-tooltip]::after'),
  'CSS defines ::after tooltip on collapsed nav item hover'
);
assert(
  cssContent.includes('content: attr(data-tooltip);'),
  'Tooltip uses attr(data-tooltip) for dynamic label rendering'
);
assert(
  cssContent.includes('.app-sidebar.collapsing .nav-label'),
  'CSS defines smooth fade/transform during collapsing phase'
);

// 6. Test App DOM detachment methods in app.js
assert(
  appJsContent.includes('_detachSidebarLabels()'),
  'App implements _detachSidebarLabels()'
);
assert(
  appJsContent.includes('_attachSidebarLabels()'),
  'App implements _attachSidebarLabels()'
);
assert(
  appJsContent.includes('brandTitle.remove()'),
  '_detachSidebarLabels physically removes .brand-title from DOM'
);
assert(
  appJsContent.includes('label.remove()'),
  '_detachSidebarLabels physically removes .nav-label from DOM'
);
assert(
  appJsContent.includes('item.parent.insertBefore(item.node, item.nextSibling)'),
  '_attachSidebarLabels cleanly restores nodes to their exact original DOM hierarchy'
);

// 7. Verify PWA prompt check in app.js
assert(
  appJsContent.includes('this.deferredInstallPrompt.prompt()'),
  'PWA install button click triggers deferredInstallPrompt.prompt()'
);
assert(
  appJsContent.includes('window.addEventListener(\'appinstalled\''),
  'App listens for appinstalled event to auto-dismiss install UI'
);

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
