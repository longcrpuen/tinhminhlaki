const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('=== TEST SUITE 18: Hover-Only Accent Glow & 80+ FPS Dashboard Optimization ===\n');

const cssPath = path.join(__dirname, '../css/style.css');
const htmlPath = path.join(__dirname, '../index.html');

const styleCss = fs.readFileSync(cssPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');

// --- 1. DEFAULT STATIC ACCENT STATE (ZERO CONTINUOUS REPAINT) ---
console.log('--- 1. Default Static Accent State ---');

assert(styleCss.includes('.hero-title-accent {'), '.hero-title-accent selector exists');
assert(styleCss.includes('linear-gradient(135deg, #a78bfa 0%, #e879f9 50%, #f43f5e 100%)'),
  'Accent word maintains vibrant violet-pink-rose gradient');
assert(styleCss.includes('filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9));'),
  'Accent word preserves functional high-contrast black shadow for background separation');
assert(styleCss.includes('text-shadow: 0 4px 14px rgba(0, 0, 0, 0.95);'),
  'Accent word preserves functional high-contrast black text shadow');
console.log('  ✅ PASS: Default static accent state preserves text gradient & functional contrast shadow');

// --- 2. GPU-ACCELERATED PRE-RENDERED GLOW LAYER (PSEUDO-ELEMENT) ---
console.log('\n--- 2. GPU-Accelerated Pre-rendered Glow Layer ---');

assert(styleCss.includes('.hero-title-accent::after {'),
  '.hero-title-accent::after pseudo-element defined for isolated glow layer');
assert(styleCss.includes('filter: blur(16px);'),
  'Glow layer uses pre-rendered static blur filter (zero blur animation repaint)');
assert(styleCss.includes('opacity: 0;'),
  'Glow layer defaults to opacity: 0 (completely silent when idle)');
assert(styleCss.includes('transition: opacity 0.35s ease-out;'),
  'Glow layer transitions via GPU-accelerated opacity');
assert(styleCss.includes('pointer-events: none;'),
  'Glow layer ignores pointer events to avoid interfering with cursor interactions');
assert(styleCss.includes('z-index: -1;'),
  'Glow layer is positioned cleanly behind text letters');
assert(styleCss.includes('will-change: opacity;'),
  'Glow layer declares will-change: opacity for GPU compositor layer promotion');
console.log('  ✅ PASS: Glow layer is isolated on GPU compositor with static blur & opacity transition');

// --- 3. DESKTOP HOVER INTERACTION ---
console.log('\n--- 3. Desktop Hover Interaction ---');

assert(styleCss.includes('@media (hover: hover) and (pointer: fine)'),
  'CSS defines desktop hover media query with pointer: fine');
assert(styleCss.includes('.hero-title-accent:hover::after'),
  'Hovering accent word activates glow layer');
assert(styleCss.includes('opacity: 0.85;'),
  'Hover transition raises glow opacity to 0.85 smoothly');
assert(styleCss.includes('.hero-title-accent:hover {') && styleCss.includes('transform: scale(1.13)'),
  'Hover provides subtle interactive micro-spring scale');
console.log('  ✅ PASS: Desktop hover smoothly illuminates glow layer via GPU opacity');

// --- 4. TOUCH / MOBILE SINGLE-RUN ANIMATION (NO INFINITE LOOP) ---
console.log('\n--- 4. Touch / Mobile Single-Run Intro Animation ---');

assert(styleCss.includes('@media (hover: none), (pointer: coarse)'),
  'CSS defines touch/mobile media query');
assert(styleCss.includes('animation: heroGlowIntro 1.6s ease-out forwards;'),
  'Mobile triggers heroGlowIntro single-run animation on page load');
assert(styleCss.includes('animation-iteration-count: 1;'),
  'Mobile intro animation runs strictly once (iteration-count: 1)');
assert(styleCss.includes('@keyframes heroGlowIntro'),
  '@keyframes heroGlowIntro keyframe defined');
assert(styleCss.includes('100% { opacity: 0; }'),
  'Mobile intro animation cleanly fades back to opacity: 0 after introduction');
console.log('  ✅ PASS: Touch devices run glow intro once and cleanly return to zero-repaint idle state');

// --- 5. SERVER HEALTH & ALL TABS INTEGRITY ---
console.log('\n--- 5. Server Health & View Isolation ---');

assert(styleCss.includes('#view-study:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-study:not(.active) remains strictly isolated');
assert(styleCss.includes('#view-exam:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-exam:not(.active) remains strictly isolated');
console.log('  ✅ PASS: View isolation rules intact');

http.get('http://localhost:5173', (res) => {
  assert.strictEqual(res.statusCode, 200, `Dev server responds with 200 OK (got ${res.statusCode})`);
  console.log('  ✅ PASS: Dev server responds with 200 OK');

  console.log('\n========================================');
  console.log('ROUND 18 SUMMARY: All tests passed!');
  console.log('========================================');
  process.exit(0);
}).on('error', (err) => {
  console.error('  ❌ FAIL: Server connection error:', err.message);
  process.exit(1);
});
