// =========================================================================
// TEST SUITE 10: Mobile Quiz Zero-Scroll, Interlocking Headline & Topic Chips
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

console.log('=== TEST SUITE 10: Mobile Quiz UX, Desktop Hero & Topic Filter Chips ===\n');

// --- 1. MOBILE QUIZ UX: ZERO-SCROLL & STICKY BOTTOM ACTION BAR ---
console.log('--- 1. Mobile Quiz Zero-Scroll & Sticky Action Bar ---');
assert(appJs.includes("classList.toggle('quiz-active'"), 'app.js toggles quiz-active class on study/exam view');
assert(styleCss.includes('body.quiz-active .bottom-nav') && styleCss.includes('display: none !important;'), 'Bottom navigation is hidden during active quiz');
assert(styleCss.includes('body.quiz-active .app-topbar') && styleCss.includes('display: none !important;'), 'Top app bar is hidden during active quiz for maximum viewport');
assert(styleCss.includes('body.quiz-active .app-main') && styleCss.includes('100dvh !important;'), 'App main is locked to 100dvh zero-scroll layout');
assert(styleCss.includes('body.quiz-active #view-study') && styleCss.includes('overflow: hidden !important;'), 'Study view is locked to prevent layout blowout');
assert(styleCss.includes('body.quiz-active .quiz-container') && styleCss.includes('justify-content: space-between !important;'), 'Quiz container uses flex space-between');
assert(styleCss.includes('body.quiz-active .quiz-options-list') && styleCss.includes('scrollbar-width: none !important;'), 'Quiz options list hides scrollbar');
assert(styleCss.includes('body.quiz-active .quiz-footer-actions') && styleCss.includes('position: sticky !important;'), 'Next button container is sticky at bottom');
assert(styleCss.includes('body.quiz-active .btn-quiz-next') && styleCss.includes('width: 100% !important;'), 'Next button expands to full width on mobile for easy thumb reach');

// --- 2. DESKTOP HERO: HEADLINE "TÔI NGU BẠN CŨNG THẾ" & FULL-WIDTH BANNER ---
console.log('\n--- 2. Desktop Hero Interlocking Headline & Full-Width Banner ---');
assert(html.includes('hero-title-main') && html.includes('hero-title-accent') && html.includes('hero-title-sub'), 'Hero title contains main, accent, and sub spans');
assert(html.includes('TÔI') && html.includes('NGU') && html.includes('BẠN CŨNG THẾ'), 'Hero title text contains "TÔI NGU BẠN CŨNG THẾ"');
assert(styleCss.includes('.hero-title-main,') && styleCss.includes('.hero-title-sub'), 'style.css styles main and sub heading blocks with metallic styling');
assert(styleCss.includes('.hero-title-accent') && styleCss.includes('clamp(3.8rem, 8.5vw, 6.5rem)'), 'Word NGU is styled with prominent oversized display size');
assert(styleCss.includes('linear-gradient(135deg, #a78bfa 0%, #e879f9 50%, #f43f5e 100%)'), 'Word NGU uses radiant violet-pink-rose gradient');
assert(html.includes('class="dashboard-bento-metrics" style="display: none;"'), 'Duplicate dashboard metric widgets are hidden to create full-width hero');
assert(styleCss.includes('.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);'), 'Stats grid is arranged in 4 equal columns on desktop');

// --- 3. QUESTION BANK: HEADER UNWRAPPING & HORIZONTAL FILTER CHIPS ---
console.log('\n--- 3. Question Bank Header & Horizontal Filter Chips ---');
assert(html.includes('class="section-title-wrap bank-header-wrap"'), 'Question bank header uses dedicated responsive wrapper');
assert(html.includes('class="bank-title-block"') && html.includes('class="bank-actions-row"'), 'Bank title and action buttons are decoupled into independent blocks');
assert(styleCss.includes('.bank-header-wrap') && styleCss.includes('flex-direction: column;'), 'Bank header stacks title above action buttons on mobile to prevent squished text');
assert(html.includes('id="bank-topic-chips"'), 'index.html defines bank-topic-chips container');
assert(html.includes('id="bank-topic-filter" class="form-control" style="display: none;"'), 'Native select is preserved in DOM but hidden from view');
assert(styleCss.includes('.bank-topic-chips') && styleCss.includes('overflow-x: auto;'), 'Bank topic chips container scrolls horizontally');
assert(styleCss.includes('.topic-filter-chip') && styleCss.includes('border-radius: var(--radius-full);'), 'Topic filter chips use rounded-full pill styling');
assert(styleCss.includes('.topic-filter-chip.active') && styleCss.includes('background: rgba(124, 58, 237, 0.30);'), 'Active topic filter chip has glowing violet theme');
assert(appJs.includes('selectBankTopic('), 'app.js implements selectBankTopic function');
assert(appJs.includes('chipsContainer.innerHTML = chipsHtml;'), 'app.js dynamically renders horizontal filter chips');

// --- 4. STATS VIEW: STREAK BANNER & CYBER VIOLET PALETTE ---
console.log('\n--- 4. Stats Streak Banner & Cyber Violet Dark Palette ---');
assert(html.includes('stat-card stat-card-streak col-span-2'), 'Streak card has col-span-2 class in stats view');
assert(html.includes('class="stat-streak-banner"'), 'Streak card uses horizontal banner layout');
assert(styleCss.includes('.stat-card.col-span-2 {\n  grid-column: 1 / -1;'), 'Streak card spans full row width');
assert(styleCss.includes('background: rgba(18, 16, 28, 0.95);'), 'Form controls use Cyber Violet dark background');
assert(styleCss.includes('border: 1px solid rgba(255, 255, 255, 0.10);'), 'Form controls use refined translucent border');
assert(styleCss.includes('border-color: rgba(168, 85, 247, 0.50);'), 'Form focus states use violet glowing border');
assert(styleCss.includes('background: rgba(18, 16, 28, 0.98);'), 'Modal box uses Cyber Violet dark elevated surface');

// --- 5. LOCAL SERVER HEALTH CHECK ---
console.log('\n--- 5. Local Server Health Check ---');
http.get('http://localhost:5173', (res) => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`ROUND 10 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', (err) => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`ROUND 10 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
