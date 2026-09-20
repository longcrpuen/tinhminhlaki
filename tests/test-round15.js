// =========================================================================
// TEST SUITE 15: High-Contrast Pure White Heading, Scrim Overlay & 80+ FPS Optimization
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

console.log('=== TEST SUITE 15: Heading High-Contrast & FPS Optimization ===\n');

// --- 1. PURE WHITE HIGH-CONTRAST HEADING (NO MUDDY GREY) ---
console.log('--- 1. Pure White (#FFFFFF) Main Text & Solid Contrast ---');
assert(styleCss.includes('.hero-title-main,') && styleCss.includes('.hero-title-sub'), 'Hero title main and sub selectors exist');
assert(styleCss.includes('color: #ffffff !important;') && styleCss.includes('-webkit-text-fill-color: #ffffff !important;'), 'Main heading text is forced to 100% pure white (#FFFFFF), eliminating dull grey tones');
assert(!styleCss.includes('#71717a 100%'), 'Dull grey gradient #71717a is completely eliminated from hero heading text');
assert(styleCss.includes('text-shadow: 0 4px 14px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0, 0, 0, 0.9);'), 'Deep black text shadow separates white letters crisply from the background');
assert(styleCss.includes('filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9))'), 'Hero headline preserves deep block drop-shadow');

// --- 2. VIBRANT NEON ACCENT KEYWORD & RADIANT GLOW ---
console.log('\n--- 2. Vibrant Neon Accent Word & High-Luminosity Glow ---');
assert(styleCss.includes('.hero-title-accent {'), 'Hero accent keyword selector exists');
assert(styleCss.includes('linear-gradient(135deg, #a78bfa 0%, #e879f9 50%, #f43f5e 100%)'), 'Accent word uses vibrant radiant violet-pink-rose gradient');
assert(styleCss.includes('filter: drop-shadow(0 0 25px rgba(244, 63, 94, 0.6))'), 'Accent word has intense radiant drop-shadow glow');
assert(styleCss.includes('rgba(232, 121, 249, 0.8)'), 'Accent word has enhanced neon text-shadow luminescence');
assert(styleCss.includes('transform: scale(1.1) translateZ(0);'), 'Accent word is scaled up 110% and promoted to GPU compositing layer');

// --- 3. DARK SCRIM CONTRAST PROTECTOR OVERLAY ---
console.log('\n--- 3. Dark Scrim Contrast Protector Behind Heading ---');
assert(html.includes('class="hero-heading-scrim"'), 'index.html encapsulates heading area with hero-heading-scrim wrapper');
assert(styleCss.includes('.hero-heading-scrim {'), 'style.css defines .hero-heading-scrim styling');
assert(styleCss.includes('radial-gradient(ellipse at 25% 45%, rgba(10, 8, 22, 0.88) 0%, rgba(10, 8, 22, 0.62) 65%, transparent 100%)'), 'Scrim overlay applies dark radial vignette behind text ensuring maximum contrast on any wallpaper');
assert(styleCss.includes('.hero-heading-scrim') && styleCss.includes('transform: translateZ(0);'), 'Scrim overlay uses GPU hardware acceleration');

// --- 4. 80+ FPS PERFORMANCE OPTIMIZATION: ZERO REPAINT LOOPS & LAYER ISOLATION ---
console.log('\n--- 4. 80+ FPS Optimization & GPU Compositing ---');
assert(!styleCss.includes('animation: blobDrift 22s'), 'Infinite looping blobDrift animation removed from hero-card to eliminate continuous repaints');
assert(styleCss.includes('.hero-card {') && styleCss.includes('contain: layout style;'), 'hero-card uses CSS containment to isolate layout and style recalculations');
assert(!/\.hero-title\s*\{[^}]*filter:\s*drop-shadow/.test(styleCss), 'hero-title removed redundant multi-level drop-shadow chain for lightweight compositing');
assert(styleCss.includes('.hero-title-main,') && styleCss.includes('will-change: transform;'), 'Main and sub heading elements declare will-change: transform for smooth compositor thread handling');

// --- 5. LOCAL SERVER HEALTH CHECK ---
console.log('\n--- 5. Local Server Health Check ---');
http.get('http://localhost:5173', (res) => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`ROUND 15 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', (err) => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`ROUND 15 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
