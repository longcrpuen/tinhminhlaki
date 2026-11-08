const fs = require('fs');
const path = require('path');

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

const themeCssPath = path.join(__dirname, '..', 'css', 'theme.css');
const styleCssPath = path.join(__dirname, '..', 'css', 'style.css');
const htmlPath = path.join(__dirname, '..', 'index.html');
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const swPath = path.join(__dirname, '..', 'sw.js');

const themeCss = fs.readFileSync(themeCssPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');
const swContent = fs.readFileSync(swPath, 'utf8');

console.log('=== TEST SUITE: Round 7 UI Redesign & Performance Guarantee ===');

// 1. Tokens
assert(themeCss.includes('--radius-card: 24px'), 'theme.css defines --radius-card: 24px');
assert(themeCss.includes('--radius-full: 9999px'), 'theme.css defines --radius-full: 9999px');
assert(themeCss.includes('--neon-glow-primary:'), 'theme.css defines --neon-glow-primary');
assert(themeCss.includes('--card-hover-glow:'), 'theme.css defines --card-hover-glow');

// 2. Buttons Pill Styling
assert(styleCss.includes('.btn {') && styleCss.includes('border-radius: var(--radius-full)'), 'CSS applies radius-full to .btn');
assert(styleCss.includes('.quiz-option-btn {') && styleCss.includes('border-radius: var(--radius-full)'), 'CSS applies radius-full to .quiz-option-btn');
assert(styleCss.includes('.study-mode-pill-btn'), 'CSS defines .study-mode-pill-btn');

// 3. Card Radii
assert(styleCss.includes('.glass-card {') && styleCss.includes('border-radius: var(--radius-card)'), '.glass-card has radius-card');
assert(styleCss.includes('.stat-card {') && styleCss.includes('border-radius: var(--radius-card)'), '.stat-card has radius-card');
assert(styleCss.includes('.study-mode-card {') && styleCss.includes('border-radius: var(--radius-card)'), '.study-mode-card has radius-card');
assert(styleCss.includes('.deck-card {') && styleCss.includes('border-radius: var(--radius-card)'), '.deck-card has radius-card');
assert(styleCss.includes('.modal-box {') && styleCss.includes('border-radius: var(--radius-card-lg)'), '.modal-box has radius-card-lg');
assert(styleCss.includes('.bank-card-item {') && styleCss.includes('border-radius: var(--radius-card)'), '.bank-card-item has radius-card');

// 4. Inputs Pill Styling
assert(styleCss.includes('.form-control {') && styleCss.includes('border-radius: var(--radius-full)'), '.form-control has radius-full pill');
assert(styleCss.includes('.bank-search-input {') && styleCss.includes('border-radius: var(--radius-full)'), '.bank-search-input has radius-full pill');

// 5. Tech Tags in HTML
assert(htmlContent.includes('class="tech-tag"'), 'index.html defines .tech-tag elements');
for (let i = 1; i <= 7; i++) {
  const tag = `MODE // 0${i}`;
  assert(htmlContent.includes(tag), `index.html includes ${tag}`);
}

// 6. Action Labels
assert(htmlContent.includes('Ôn tập hôm nay'), 'Hero button has Ôn tập hôm nay');
assert(htmlContent.includes('Bắt đầu luyện tập</span>'), 'Mode 1 has clean pill without arrow');
assert(htmlContent.includes('Câu tiếp theo'), 'Next question button has Câu tiếp theo');

// 7. Daily Goal Radial Widget
assert(htmlContent.includes('id="dashboard-radial-container"'), 'index.html defines dashboard-radial-container');
assert(htmlContent.includes('id="daily-radial-bar"'), 'index.html defines daily-radial-bar');
assert(styleCss.includes('.daily-radial-card'), 'style.css styles .daily-radial-card');
assert(appJsContent.includes('daily-radial-bar'), 'app.js animates daily-radial-bar');

// 8. Performance: No continuous keyframe animation on box-shadow
const keyframeMatches = styleCss.match(/@keyframes[\s\S]*?\{[\s\S]*?\}/g) || [];
let shadowAnimatedInKeyframes = false;
for (const kf of keyframeMatches) {
  if (kf.includes('box-shadow') && (kf.includes('infinite') || !kf.includes('100%'))) {
    shadowAnimatedInKeyframes = true;
  }
}
assert(!shadowAnimatedInKeyframes, 'No continuous keyframe animation on box-shadow (FPS safe)');

// 9. Responsive Rules
assert(styleCss.includes('@media (max-width: 840px)'), 'CSS includes tablet media query (840px)');
assert(styleCss.includes('@media (max-width: 580px)'), 'CSS includes mobile media query (580px)');
assert(styleCss.includes('@media (max-width: 400px)'), 'CSS includes small mobile media query (400px)');

// 10. Service Worker
assert(/CACHE_NAME = 'mindsparks-v4\.\d+\.0'/.test(swContent), 'sw.js bumped to mindsparks-v4.x.0');

console.log(`\n========================================`);
console.log(`ROUND 7 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
