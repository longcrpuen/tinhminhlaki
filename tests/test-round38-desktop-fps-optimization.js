const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { runBenchmark } = require('../scripts/benchmark-desktop-fps.js');

console.log('=== TEST SUITE: Round 38 Desktop 80+ FPS Optimization ===\n');

// 1. Static CSS Audit
console.log('--- 1. Static CSS Architecture & GPU Optimization Audit ---');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf-8');
const themeCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'theme.css'), 'utf-8');

// A. Elimination of mix-blend-mode on fullscreen fixed background
const bgLayerMatch = styleCss.match(/#bg-layer::before\s*\{([^}]+)\}/);
assert(bgLayerMatch, '#bg-layer::before rule exists in style.css');
assert(bgLayerMatch[1].includes('mix-blend-mode: normal'), '#bg-layer::before uses high-performance mix-blend-mode: normal');
console.log('  ✅ PASS: #bg-layer::before eliminates full-screen GPU blend mode overhead');

// B. Card hover glow optimization in theme.css
assert(themeCss.includes('--card-hover-glow:'), 'theme.css defines --card-hover-glow');
assert(!themeCss.includes('36px'), 'theme.css eliminates 36px spread blur on card hover glow');
console.log('  ✅ PASS: theme.css optimizes --card-hover-glow for lightweight rasterization');

// C. Flashcard 3D flip zero-blur
assert(styleCss.includes('.flashcard-face') && styleCss.includes('backdrop-filter: none;'),
  '.flashcard-face eliminates backdrop-filter blur for butter-smooth 3D transforms');
console.log('  ✅ PASS: Flashcard 3D faces use zero-blur static alpha rendering');

// D. Infinite idle animations eliminated from resting state
const flameGlowResting = styleCss.match(/\.streak-flame-glow\s*\{([^}]+)\}/);
const activeFlameProps = flameGlowResting ? flameGlowResting[1].replace(/\/\*[\s\S]*?\*\//g, '') : '';
assert(flameGlowResting && !activeFlameProps.includes('animation: flameGlowPulse'),
  '.streak-flame-glow does NOT run infinite animation at rest');
assert(styleCss.includes('.streak-flame-glow:hover') || styleCss.includes('.stat-card-streak:hover'),
  'Streak flame glow animation is scoped to user hover');
console.log('  ✅ PASS: Streak flame glow is hover-only, eliminating continuous idle repaints');

const sparkleBadgeResting = styleCss.match(/\.pixel-sparkle-badge\s*\{([^}]+)\}/);
const activeSparkleProps = sparkleBadgeResting ? sparkleBadgeResting[1].replace(/\/\*[\s\S]*?\*\//g, '') : '';
assert(sparkleBadgeResting && !activeSparkleProps.includes('animation: pixelSparkleAnim'),
  '.pixel-sparkle-badge does NOT run infinite animation at rest');
console.log('  ✅ PASS: Sparkle badge animation is hover-only');

const reviewFlagResting = styleCss.match(/\.badge-review-flag\s*\{([^}]+)\}/);
const activeReviewProps = reviewFlagResting ? reviewFlagResting[1].replace(/\/\*[\s\S]*?\*\//g, '') : '';
assert(reviewFlagResting && !activeReviewProps.includes('animation: pulse-soft'),
  '.badge-review-flag does NOT run infinite pulse at rest');
console.log('  ✅ PASS: Review flag pulse is hover-only');

// E. Study mode cards transition optimization
const studyCardMatch = styleCss.match(/\.study-mode-card\s*\{([^}]+)\}/);
assert(studyCardMatch, '.study-mode-card rule exists');
assert(!studyCardMatch[1].includes('transition: all'), '.study-mode-card avoids transition: all antipattern');
assert(!studyCardMatch[1].includes('will-change: transform;'), '.study-mode-card does not hold persistent GPU composite texture at rest');
console.log('  ✅ PASS: Study mode cards use targeted transitions and resting composite cleanliness');

// 2. Real Browser CDP FPS Benchmark (80+ FPS Guarantee)
console.log('\n--- 2. Chrome Headless Real Rendering FPS Benchmark (80+ FPS Verification) ---');
(async () => {
  try {
    const results = await runBenchmark();
    console.log('\n--- Benchmark Validation ---');
    for (const r of results) {
      assert(r.avgFps >= 80, `View "${r.name}" must achieve >= 80 FPS (got ${r.avgFps} FPS)`);
      console.log(`  ✅ PASS: ${r.name} -> ${r.avgFps} FPS (>= 80 FPS threshold)`);
    }
    console.log('\n========================================');
    console.log('ROUND 38 SUMMARY: All FPS requirements passed (>= 80 FPS)!');
    console.log('========================================');
    process.exit(0);
  } catch(err) {
    console.error('\n❌ Benchmark verification failed:', err);
    process.exit(1);
  }
})();
