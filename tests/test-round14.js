// =========================================================================
// TEST SUITE 14: PC Question Bank Dropdown, Stats Bento Grid & Heatmap Alignment
// =========================================================================

const fs = require('fs');
const http = require('http');

const html = fs.readFileSync('./index.html', 'utf8');
const styleCss = fs.readFileSync('./css/style.css', 'utf8');
const appJs = fs.readFileSync('./js/app.js', 'utf8');

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

console.log('=== TEST SUITE 14: Cyber Violet Dropdowns, Balanced Stats Bento & Heatmap ===\n');

// --- 1. QUESTION BANK: CYBER VIOLET DROPDOWNS & CHIPS REMOVAL ---
console.log('--- 1. Question Bank Cyber Violet Dropdown & No Native Select ---');
assert(html.includes('id="bank-topic-dropdown-wrap"') && html.includes('id="bank-diff-dropdown-wrap"'), 'Question bank defines custom Cyber Violet dropdowns for topic and difficulty');
assert(html.includes('id="bank-topic-dropdown-trigger"') && html.includes('id="bank-diff-dropdown-trigger"'), 'Dropdown trigger buttons are present in Question Bank');
assert(html.includes('id="bank-topic-dropdown-menu"') && html.includes('id="bank-diff-dropdown-menu"'), 'Dropdown popover menus are defined in HTML');
assert(html.includes('class="bank-topic-chips-wrapper" style="display: none;"'), 'Topic chips container is removed from visible view (hidden) to prevent clutter');

// Verify Dark Cyber Violet palette in CSS
assert(styleCss.includes('.cyber-dropdown-trigger {') && styleCss.includes('background-color: #131122 !important;'), 'Dropdown trigger uses deep dark purple #131122');
assert(styleCss.includes('border: 1px solid rgba(255, 255, 255, 0.10) !important;'), 'Dropdown trigger uses translucent border');
assert(styleCss.includes('border-color: rgba(139, 92, 246, 0.40) !important;'), 'Dropdown trigger has violet-500/40 glow on hover & open');
assert(styleCss.includes('.cyber-dropdown-menu {') && styleCss.includes('background-color: #12101e !important;'), 'Dropdown popover menu uses dark cyber violet #12101e');
assert(styleCss.includes('border: 1px solid rgba(139, 92, 246, 0.20) !important;'), 'Dropdown popover menu uses violet border');
assert(styleCss.includes('box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.80)'), 'Dropdown popover menu has deep shadow-2xl');
assert(styleCss.includes('background-color: rgba(124, 58, 237, 0.20) !important;') && styleCss.includes('color: #c4b5fd !important;'), 'Dropdown item hover/active uses fluorescent violet bg and text');
assert(styleCss.includes('border-radius: 8px;'), 'Dropdown item uses rounded-lg bo góc nhẹ');

// Verify JS dropdown interactivity
assert(appJs.includes('toggleBankTopicDropdown(') && appJs.includes('toggleBankDiffDropdown('), 'app.js implements dropdown toggle functions');
assert(appJs.includes('selectBankDifficulty('), 'app.js implements selectBankDifficulty function');
assert(appJs.includes('topicMenu.innerHTML = menuHtml;'), 'app.js dynamically populates topic options in Cyber Violet dropdown');

// --- 2. STATS VIEW: 3-COLUMN BENTO GRID & 4-COLUMN SM-2 DISTRIBUTION ---
console.log('\n--- 2. Balanced 3-Column Stats Bento Grid & 4-Column SM-2 Distribution ---');
assert(html.includes('id="stat-acc-pct"') && html.includes('id="stat-total-reviews"') && html.includes('id="stat-view-streak"'), 'Key metrics elements (Acc %, Total reviews, Streak) exist in Stats view');
assert(styleCss.includes('#view-stats .stats-grid {') && styleCss.includes('grid-template-columns: repeat(3, 1fr) !important;'), 'Stats grid on PC uses 3 balanced equal columns');
assert(styleCss.includes('#view-stats .stats-grid .stat-card.stat-card-streak') && styleCss.includes('grid-column: span 1 !important;'), 'Streak card occupies 1 column in balanced 3-card row on PC');
assert(html.includes('streak-flame-glow'), 'Streak flame has glowing animation class');
assert(styleCss.includes('.streak-flame-glow {') && styleCss.includes('animation: flameGlowPulse'), 'Streak flame glow animation is styled');
assert(html.includes('class="sm2-breakdown-grid"') || html.includes("sm2-breakdown-grid"), 'SM-2 distribution uses dedicated grid class');
assert(styleCss.includes('.sm2-breakdown-grid {') && styleCss.includes('grid-template-columns: repeat(4, 1fr);'), 'SM-2 breakdown card spans evenly across 4 columns');

// --- 3. HEATMAP: RIGHT PADDING SAFETY MARGIN & NO-SCROLLBAR ---
console.log('\n--- 3. Heatmap Right Padding Buffer (>=32px) & Clean Scrollbar ---');
assert(html.includes('id="heatmap-scroll-wrap"') && html.includes('padding-right: 32px;'), 'Heatmap scroll wrapper has 32px safe right padding in HTML');
assert(html.includes('no-scrollbar'), 'Heatmap scroll wrapper has no-scrollbar class to hide ugly scrollbar');
assert(styleCss.includes('.no-scrollbar {') && styleCss.includes('scrollbar-width: none !important;'), 'no-scrollbar class removes scrollbar on Firefox');
assert(styleCss.includes('.no-scrollbar::-webkit-scrollbar {') && styleCss.includes('display: none !important;'), 'no-scrollbar class removes scrollbar on Webkit');
assert(styleCss.includes('#heatmap-scroll-wrap {') && styleCss.includes('padding-right: 32px !important;'), 'Heatmap scroll wrapper has 32px padding-right enforced in CSS');
assert(styleCss.includes('.heatmap-grid {') && styleCss.includes('padding: 12px 32px 12px 0;'), 'Heatmap grid maintains 32px right safety margin to prevent edge collision');
assert(appJs.includes('scrollHeatmapToToday('), 'app.js includes scrollHeatmapToToday function');

// --- 4. LOCAL SERVER RESPONSE CHECK ---
console.log('\n--- 4. Local Server Health Check ---');
http.get('http://localhost:5173', (res) => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`ROUND 14 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', (err) => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`ROUND 14 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
