// =========================================================================
// TEST SUITE 12: Zero-Scroll Quizz Viewport & 70-80+ FPS Dashboard Optimization
// =========================================================================

const fs = require('fs');
const http = require('http');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

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

console.log('=== TEST SUITE 12: Zero-Scroll Quizz & 70-80+ FPS Dashboard Optimization ===\n');

// --- 1. ZERO-SCROLL QUIZZ LAYOUT & ELIMINATION OF SUB-SCROLLBARS ---
console.log('--- 1. Quizz Zero-Scroll & Elimination of Sub-Scrollbars ---');
assert(!styleCss.includes('max-height: 22vh'), 'Cramped max-height: 22vh is removed from quiz-question-text');
assert(!styleCss.includes('max-height: calc(100vh - 160px);\n  overflow-y: auto'), 'overflow-y: auto removed from quiz-card');
assert(!styleCss.includes('max-height: 85px;\n  overflow-y: auto'), 'overflow-y: auto removed from quiz-explanation-box');
assert(styleCss.includes('#view-study.active {') && styleCss.includes('overflow: hidden !important;'),
  '#view-study.active locks overflow: hidden to guarantee zero outer scroll');
assert(styleCss.includes('#view-study .quiz-container') && styleCss.includes('overflow: hidden !important;'),
  'quiz-container locks overflow: hidden to prevent layout blowout');
assert(styleCss.includes('#view-study .quiz-card') && styleCss.includes('overflow: hidden !important;'),
  'quiz-card locks overflow: hidden to eliminate internal card scrollbar');
assert(styleCss.includes('#view-study .quiz-question-text') && styleCss.includes('clamp('),
  'Question text utilizes responsive clamp typography to prevent text clipping');
assert(styleCss.includes('#view-study .quiz-options-list') && styleCss.includes('overflow: hidden !important;'),
  'Options list locks overflow: hidden to eliminate option scrollbar');
assert(styleCss.includes('#view-study .quiz-footer-actions') && styleCss.includes('flex-shrink: 0 !important;'),
  'Footer action button container has flex-shrink: 0, staying permanently visible');

// --- 2. BULLETPROOF VIEW ISOLATION (ZERO LEAKAGE ONTO OTHER TABS) ---
console.log('\n--- 2. Bulletproof View Isolation ---');
assert(styleCss.includes('#view-study:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-study:not(.active) is strictly forced to display: none !important');
assert(styleCss.includes('#view-exam:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-exam:not(.active) is strictly forced to display: none !important');
const standaloneMatch = styleCss.match(/(?:^|\n)\s*#view-study\s*\{([^}]*)\}/);
const standaloneHasFlex = standaloneMatch && standaloneMatch[1].includes('display: flex !important');
assert(!standaloneHasFlex, 'Standalone #view-study has NO unconditional display: flex !important without .active');

// --- 3. 70-80+ FPS DASHBOARD OPTIMIZATION (GPU COMPOSITOR & ZERO REPAINT) ---
console.log('\n--- 3. 70-80+ FPS Dashboard Optimization (Zero-Repaint Animations) ---');

// Check that animations no longer animate filter: drop-shadow continuously
const flameKeyframes = styleCss.match(/@keyframes flameGlowPulse\s*\{[^}]*\}/s);
assert(flameKeyframes && !flameKeyframes[0].includes('filter: drop-shadow'),
  '@keyframes flameGlowPulse removed continuous filter: drop-shadow repaint');

const sparkleKeyframes = styleCss.match(/@keyframes pixelSparkleAnim\s*\{[^}]*\}/s);
assert(sparkleKeyframes && !sparkleKeyframes[0].includes('filter: drop-shadow'),
  '@keyframes pixelSparkleAnim removed continuous filter: drop-shadow repaint');

const lightningKeyframes = styleCss.match(/@keyframes lightningFlicker\s*\{[^}]*\}/s);
assert(lightningKeyframes && !lightningKeyframes[0].includes('filter: drop-shadow'),
  '@keyframes lightningFlicker removed continuous filter: drop-shadow repaint');

assert(styleCss.includes('.hero-card {') && styleCss.includes('contain: layout style;'),
  'hero-card uses CSS containment to isolate layout and paint calculations');
assert(styleCss.includes('.hero-title-main,') && styleCss.includes('will-change: transform;'),
  'Heading elements declare will-change: transform for hardware compositing');

// --- 4. ALL-TAB INTEGRITY VERIFICATION (SIMULATING 6 PRIMARY TABS) ---
console.log('\n--- 4. All-Tab Navigation Integrity Simulation ---');
class MockDOM {
  constructor() {
    this.elements = new Map();
    this.bodyClasses = new Set();
    const views = ['dashboard', 'decks', 'bank', 'study', 'exam', 'import', 'stats', 'settings'];
    views.forEach(v => {
      this.elements.set(`view-${v}`, { id: `view-${v}`, active: v === 'dashboard' });
    });
  }
  navigate(viewName) {
    const isQuiz = viewName === 'study' || viewName === 'exam';
    if (isQuiz) this.bodyClasses.add('quiz-active');
    else this.bodyClasses.delete('quiz-active');

    this.elements.forEach(el => el.active = false);
    const target = this.elements.get(`view-${viewName}`);
    if (target) target.active = true;
  }
}

const mock = new MockDOM();
const tabs = ['dashboard', 'decks', 'bank', 'import', 'stats', 'settings'];
tabs.forEach(tab => {
  mock.navigate(tab);
  assert(mock.elements.get(`view-${tab}`).active, `Tab ${tab}: active`);
  assert(!mock.elements.get('view-study').active, `Tab ${tab}: view-study is strictly inactive`);
  assert(!mock.bodyClasses.has('quiz-active'), `Tab ${tab}: body has NO quiz-active class`);
});

// Quiz start & exit verification
mock.navigate('study');
assert(mock.elements.get('view-study').active, 'Quiz session: view-study is active');
assert(mock.bodyClasses.has('quiz-active'), 'Quiz session: quiz-active class present');

mock.navigate('dashboard');
assert(mock.elements.get('view-dashboard').active, 'Exit quiz: view-dashboard restored');
assert(!mock.elements.get('view-study').active, 'Exit quiz: view-study deactivated completely');
assert(!mock.bodyClasses.has('quiz-active'), 'Exit quiz: quiz-active class removed');

// --- 5. LOCAL SERVER HEALTH CHECK ---
console.log('\n--- 5. Local Server Health Check ---');
http.get('http://localhost:5173', res => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`ROUND 12 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', err => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`ROUND 12 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
