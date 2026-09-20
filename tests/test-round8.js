/**
 * Test Suite Round 8: Bento/Glassmorphism, Retro Cyber Battery & 70-80+ FPS Performance
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const fontsCss = fs.readFileSync(path.join(rootDir, 'css/fonts.css'), 'utf-8');
const themeCss = fs.readFileSync(path.join(rootDir, 'css/theme.css'), 'utf-8');
const styleCss = fs.readFileSync(path.join(rootDir, 'css/style.css'), 'utf-8');
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const appJs = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf-8');
const srsJs = fs.readFileSync(path.join(rootDir, 'js/srs.js'), 'utf-8');

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

console.log('=== TEST SUITE: Round 8 Retro Cyber Battery, 70-80+ FPS & Bento Layout ===');

// --- 1. RETRO CYBER HORIZONTAL BATTERY ---
console.log('\n--- 1. Retro Cyber Segmented Battery ---');
assert(styleCss.includes('.pixel-battery-wrapper'), 'style.css styles .pixel-battery-wrapper');
assert(styleCss.includes('.pixel-battery-shell'), 'style.css styles .pixel-battery-shell');
assert(styleCss.includes('.pixel-battery-cap'), 'style.css styles .pixel-battery-cap');
assert(styleCss.includes('border-left: none'), 'Battery cap is on the right with border-left: none');

// Continuous multi-stop violet gradient stops
assert(styleCss.includes('#4c1d95'), 'Gradient includes Violet 900 (#4c1d95) at left root');
assert(styleCss.includes('#7c3aed'), 'Gradient includes Violet 600 (#7c3aed) in mid body');
assert(styleCss.includes('#9333ea'), 'Gradient includes Purple 600 (#9333ea) in mid-high body');
assert(styleCss.includes('#c084fc'), 'Gradient includes Purple 400 (#c084fc) at upper charge');
assert(styleCss.includes('#e879f9'), 'Gradient includes Fuchsia 400 (#e879f9) at peak charge');

// Fade & Glow effects
assert(styleCss.includes('opacity: 0.1'), 'Empty blocks have opacity: 0.1');
assert(styleCss.includes('rgba(255, 255, 255, 0.1)'), 'Empty blocks have translucent border-white/10');
assert(styleCss.includes('box-shadow: 0 0 10px rgba(168, 85, 247, 0.3)'), 'Filled blocks have ambient violet glow box-shadow: 0 0 10px rgba(168, 85, 247, 0.3)');

// --- 2. 70-80+ FPS HIGH REFRESH RATE ZERO-LAG SCROLL ---
console.log('\n--- 2. High Refresh Rate Performance (70-80+ FPS) ---');
// Zero backdrop-filter: blur
const blurMatches = styleCss.match(/backdrop-filter:\s*blur\([^)]+\)/gi) || [];
assert(blurMatches.length === 0, `No backdrop-filter: blur(...) in style.css (found ${blurMatches.length})`);

// Static alpha channel background
assert(themeCss.includes('rgba(18, 19, 26, 0.85)'), 'theme.css uses static alpha background rgba(18, 19, 26, 0.85)');
assert(styleCss.includes('rgba(18, 19, 26, 0.85)'), 'style.css applies rgba(18, 19, 26, 0.85) for lag-free surfaces');

// content-visibility: auto & contain-intrinsic-size
assert(styleCss.includes('content-visibility: auto'), 'style.css uses content-visibility: auto for long card lists');
assert(styleCss.includes('contain-intrinsic-size:'), 'style.css defines contain-intrinsic-size for smooth scroll virtualization');

// GPU render promotion
assert(styleCss.includes('transform: translateZ(0)'), 'style.css forces GPU rendering with transform: translateZ(0)');
assert(styleCss.includes('will-change: transform, opacity'), 'style.css optimizes animated containers with will-change');

// Passive scroll listeners
assert(appJs.includes('{ passive: true }'), 'app.js attaches scroll listener with { passive: true }');

// --- 3. ZERO HORIZONTAL SCROLLBAR & RESPONSIVE LAYOUT ---
console.log('\n--- 3. Zero Horizontal Scrollbar & Responsive Alignment ---');
assert(styleCss.includes('min-height: 100dvh'), 'style.css locks root container with min-height: 100dvh');
assert(styleCss.includes('overflow-x: hidden'), 'style.css locks root container with overflow-x: hidden');
assert(styleCss.includes('.katex-display') && styleCss.includes('overflow-x: auto'), 'KaTeX display has localized overflow-x: auto');
assert(styleCss.includes('@media (max-width: 768px)'), 'style.css includes responsive breakpoint for mobile (< 768px)');
assert(styleCss.includes('grid-template-columns: repeat(2, 1fr)'), 'Mobile layout converts stats grid to 2 columns');
assert(styleCss.includes('min-height: 44px') || styleCss.includes('min-width: 44px'), 'Mobile touch targets meet minimum 44px standard');

// --- 4. TECH TYPOGRAPHY & DEEP BLACK BACKGROUND ---
console.log('\n--- 4. Tech Typography & Deep Black Palette ---');
assert(fontsCss.includes('Plus Jakarta Sans') || fontsCss.includes('Inter'), 'fonts.css uses modern Plus Jakarta Sans / Inter font');
assert(htmlContent.includes('Plus+Jakarta+Sans'), 'index.html imports Plus Jakarta Sans font');
assert(styleCss.includes('letter-spacing: -0.025em'), 'style.css applies tech letter-spacing: -0.025em');
assert(themeCss.includes('#090A0F'), 'theme.css sets Deep Black #090A0F background');
assert(styleCss.includes('rgba(168, 85, 247, 0.15)'), 'style.css uses 15% opacity purple radial ambient spot');

// --- 5. LOGIC & SM-2 ALGORITHM PRESERVATION ---
console.log('\n--- 5. SM-2 Algorithm & Logic Preservation ---');
assert(srsJs.includes('calculateNext') && srsJs.includes('SuperMemo-2'), 'srs.js preserves calculateNext SM-2 spaced repetition logic');
assert(appJs.includes('SRS.calculateNext'), 'app.js connects spaced repetition SM-2 engine');
assert(appJs.includes('renderDashboard'), 'app.js preserves dashboard state update pipeline');

console.log(`\n========================================`);
console.log(`ROUND 8 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
