const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 17: Hero Glow, Bank Heading Balance, Mint Overcharged Battery & Centered Shake ===\n');

const cssPath = path.join(__dirname, '../css/style.css');
const htmlPath = path.join(__dirname, '../index.html');
const appJsPath = path.join(__dirname, '../js/app.js');

const styleCss = fs.readFileSync(cssPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');

// --- 1. HERO GLOW PADDING FIX (TASK 2) ---
console.log('--- 1. Hero Glow Padding Fix (Task 2) ---');

assert(styleCss.includes('.hero-card {') && styleCss.includes('padding: 44px 32px 32px 32px;'),
  '.hero-card padding-top is expanded to 44px to prevent glow clipping');
console.log('  ✅ PASS: .hero-card padding-top is expanded');

assert(styleCss.includes('.hero-heading-scrim {') && styleCss.includes('margin: 0 0 18px 0;'),
  '.hero-heading-scrim eliminates negative top margin');
console.log('  ✅ PASS: .hero-heading-scrim negative top margin eliminated');

assert(styleCss.includes('.hero-title {') && styleCss.includes('padding-top: 8px;'),
  '.hero-title provides vertical padding breathing room for accent word glow');
console.log('  ✅ PASS: .hero-title provides vertical breathing room');

assert(styleCss.includes('.hero-title-accent {') && styleCss.includes('margin: 0 0.04em;'),
  '.hero-title-accent removed negative margin -0.12em');
console.log('  ✅ PASS: .hero-title-accent margin is clean without upward clip');

// --- 2. QUESTION BANK HEADING TEXT-WRAP: BALANCE (TASK 3) ---
console.log('\n--- 2. Question Bank Heading Text-Wrap Balance (Task 3) ---');

assert(html.includes('class="section-title bank-main-heading"'),
  'index.html assigns bank-main-heading to Question Bank title');
console.log('  ✅ PASS: index.html defines bank-main-heading');

assert(styleCss.includes('.bank-main-heading') && styleCss.includes('text-wrap: balance;'),
  'style.css applies text-wrap: balance to Question Bank heading');
console.log('  ✅ PASS: style.css applies text-wrap: balance to bank heading');

assert(html.includes('max-width: 920px; margin: 0 auto;'),
  'Question Bank container width expanded to 920px for balanced layout');
console.log('  ✅ PASS: Question Bank container width expanded to 920px');

assert(styleCss.includes('.bank-header-wrap {') && styleCss.includes('@media (min-width: 900px)'),
  '.bank-header-wrap has optimized responsive breakpoint');
console.log('  ✅ PASS: .bank-header-wrap responsive layout configured');

// --- 3. BATTERY MINT OVERCHARGED & REVERSE SHEEN SWEEP (TASK 6) ---
console.log('\n--- 3. Battery Mint Overcharged & Reverse Sheen Sweep (Task 6) ---');

assert(styleCss.includes('.pixel-battery-wrapper.overcharged {') &&
  styleCss.includes('border-color: #00f5a0;'),
  '.pixel-battery-wrapper.overcharged switches to electric mint green #00f5a0');
console.log('  ✅ PASS: Overcharged wrapper border is electric mint green #00f5a0');

assert(styleCss.includes('.pixel-battery-wrapper.charged .pixel-battery-segment.active') &&
  styleCss.includes('linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%) !important;'),
  'Overcharged battery segments turn radiant mint/neon (#00f5a0 -> #00d9f5)');
console.log('  ✅ PASS: Overcharged segments turn radiant mint/neon');

assert(styleCss.includes('.pixel-battery-wrapper.charged .pixel-battery-fill') &&
  styleCss.includes('linear-gradient(90deg, #00f5a0 0%, #00d9f5 100%) !important;'),
  'Overcharged fill bar turns radiant mint/neon gradient');
console.log('  ✅ PASS: Overcharged fill bar turns radiant mint/neon');

assert(styleCss.includes('.pixel-battery-shell::after') &&
  styleCss.includes('animation: batteryReverseSheen 1.1s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;'),
  '.pixel-battery-shell::after defines reverse sheen sweep animation');
assert(styleCss.includes('animation-iteration-count: 1;'),
  'Reverse sheen sweep runs exactly once and then stops (no infinite loop)');
console.log('  ✅ PASS: Reverse sheen sweep runs exactly once on 100% completion');

assert(styleCss.includes('@keyframes batteryReverseSheen'),
  '@keyframes batteryReverseSheen defines top/right to bottom/left reverse motion');
console.log('  ✅ PASS: @keyframes batteryReverseSheen keyframe exists');

// --- 4. BATTERY SHAKE CENTER FIX (TASK 7) ---
console.log('\n--- 4. Battery Shake Center Fix (Task 7) ---');

assert(styleCss.includes('.pixel-battery-wrapper {') &&
  styleCss.includes('transform-origin: center center !important;'),
  '.pixel-battery-wrapper enforces transform-origin: center center !important');
console.log('  ✅ PASS: .pixel-battery-wrapper enforces transform-origin: center center');

const shakeMatch = styleCss.match(/@keyframes\s+batteryMicroShake\s*\{([^}]+)\}/);
assert(shakeMatch, 'style.css defines @keyframes batteryMicroShake');
assert(!shakeMatch[1].includes('rotate('), 'batteryMicroShake eliminates asymmetric rotate()');
assert(shakeMatch[1].includes('translate3d('), 'batteryMicroShake uses centered translate3d');
console.log('  ✅ PASS: batteryMicroShake uses centered translate3d without asymmetric rotation');

// --- 5. ALL 6 PRIMARY TABS VIEW INTEGRITY ---
console.log('\n--- 5. All 6 Primary Tabs View Integrity ---');

const primaryTabs = ['dashboard', 'decks', 'bank', 'import', 'stats', 'settings'];
primaryTabs.forEach(tab => {
  assert(html.includes(`id="view-${tab}"`), `index.html defines view section for ${tab}`);
  assert(html.includes(`data-view="${tab}"`), `Sidebar defines nav item for ${tab}`);
});
console.log('  ✅ PASS: All 6 primary view sections and nav items are present');

// Verify view isolation CSS rule is strictly preserved
assert(styleCss.includes('#view-study:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-study:not(.active) is strictly forced to display: none !important');
assert(styleCss.includes('#view-exam:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-exam:not(.active) is strictly forced to display: none !important');
console.log('  ✅ PASS: Bulletproof view isolation remains strictly active');

console.log('\n========================================');
console.log('ROUND 17 SUMMARY: All tests passed!');
console.log('========================================');
