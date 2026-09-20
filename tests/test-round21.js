const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE 21: Flashcard Viewport Budgeting, Quiz Clearance & Mobile Landscape Focus ===\n');

const styleCss = fs.readFileSync('css/style.css', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err.message);
    process.exit(1);
  }
}

// --- TASK 1: FLASHCARD VIEWPORT BUDGETING PATTERN ---
console.log('--- 1. Flashcard Viewport Budgeting & Pinned Rating Bar ---');
test('HTML defines .flashcard-content-wrap on both front and back faces', () => {
  assert(indexHtml.includes('class="flashcard-content-wrap"'), 'flashcard-content-wrap must exist');
  const count = (indexHtml.match(/class="flashcard-content-wrap"/g) || []).length;
  assert(count >= 2, 'Must have at least 2 instances of flashcard-content-wrap (front & back)');
});

test('app.js toggles flashcard-active class on body when entering flashcard mode', () => {
  assert(appJs.includes("document.body.classList.toggle('flashcard-active', session.mode === 'flashcard')"),
    'app.js must toggle flashcard-active class');
  assert(appJs.includes("document.body.classList.remove('flashcard-active')"),
    'app.js must clean up flashcard-active on view change or complete');
});

test('CSS enforces 100dvh flex column and overflow hidden on body.flashcard-active', () => {
  assert(styleCss.includes('body.flashcard-active .app-main') && styleCss.includes('height: 100dvh !important;'),
    'body.flashcard-active .app-main must constrain to 100dvh');
  assert(styleCss.includes('body.flashcard-active .quiz-container') && styleCss.includes('overflow: hidden !important;'),
    'body.flashcard-active .quiz-container must budget viewport with overflow hidden');
});

test('CSS provides internal scroll on .flashcard-content-wrap for long math/text', () => {
  assert(styleCss.includes('body.flashcard-active .flashcard-content-wrap') && styleCss.includes('overflow-y: auto !important;'),
    '.flashcard-content-wrap must allow internal scrolling');
  assert(styleCss.includes('word-break: break-word !important;'),
    '.flashcard-content-wrap must break words cleanly');
});

test('CSS docks #flashcard-srs-bar in 2x2 grid without colliding with card', () => {
  assert(styleCss.includes('body.flashcard-active #flashcard-srs-bar') && styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
    '#flashcard-srs-bar must render as a 2x2 grid on mobile');
  assert(styleCss.includes('body.flashcard-active .srs-btn') && styleCss.includes('height: 48px !important;'),
    '.srs-btn must have solid 48px height');
});

// --- TASK 2: QUIZ EXPLANATION CLEARANCE & FLOATING NEXT BAR ---
console.log('\n--- 2. Quiz Explanation Clearance & Fast-Next Floating Dock ---');
test('CSS provides generous clearance (>=140px) on .quiz-container to prevent text trapping', () => {
  assert(styleCss.includes('padding: 12px 14px 160px 14px !important;'),
    '.quiz-container must have 160px bottom clearance for floating bar');
  assert(styleCss.includes('margin-bottom: 24px !important;'),
    '.quiz-explanation-box.show must have ample bottom margin');
});

test('CSS styles floating next dock with glassmorphism and active scale feedback', () => {
  assert(styleCss.includes('body.quiz-active .quiz-footer-actions.show') && styleCss.includes('backdrop-filter: blur(12px) !important;'),
    'Footer actions must have glassmorphism backdrop filter');
  assert(styleCss.includes('body.quiz-active .btn-quiz-next:active') && styleCss.includes('scale(0.98)'),
    'Next button must provide tactile active scale(0.98) feedback');
});

test('app.js removes jarring auto-scroll on quiz answer click', () => {
  const handleQuizAnswerMatch = appJs.match(/async handleQuizAnswer[\s\S]*?\n  \},/);
  assert(handleQuizAnswerMatch, 'handleQuizAnswer method exists');
  assert(!handleQuizAnswerMatch[0].includes('.scrollIntoView'),
    'handleQuizAnswer must NOT call scrollIntoView');
  assert(handleQuizAnswerMatch[0].includes('preventScroll: true'),
    'nextBtn.focus must use preventScroll: true');
});

// --- TASK 3: MOBILE LANDSCAPE FOCUS & CONSTRAINED HEIGHT ---
console.log('\n--- 3. Mobile Landscape Focus & Constrained Height ---');
test('CSS defines mobile landscape focus query @media (max-height: 550px)', () => {
  assert(styleCss.includes('@media (max-height: 550px), (orientation: landscape) and (max-height: 550px)'),
    'Must define landscape and low-height media query');
});

test('Landscape mode automatically hides sidebar and bottom nav to maximize vertical space', () => {
  const landscapeBlock = styleCss.match(/@media \(max-height: 550px\)[\s\S]*?\n\}/);
  assert(landscapeBlock, 'Landscape block found');
  assert(landscapeBlock[0].includes('.app-sidebar') && landscapeBlock[0].includes('display: none !important;'),
    'Sidebar must be hidden in landscape mode');
  assert(landscapeBlock[0].includes('.bottom-nav') && landscapeBlock[0].includes('display: none !important;'),
    'Bottom nav must be hidden in landscape mode');
});

test('Landscape mode unlocks natural vertical scrolling without overflow: hidden trap', () => {
  const landscapeBlock = styleCss.match(/@media \(max-height: 550px\)[\s\S]*?\n\}/);
  assert(landscapeBlock[0].includes('body.quiz-active .app-main') && landscapeBlock[0].includes('overflow-y: auto !important;'),
    'app-main must allow vertical scrolling in landscape');
  assert(landscapeBlock[0].includes('body.quiz-active .quiz-container') && landscapeBlock[0].includes('overflow: visible !important;'),
    'quiz-container must not be trapped in landscape');
});

test('Landscape mode adjusts Flashcard stage and renders 4-column SRS buttons', () => {
  const landscapeBlock = styleCss.match(/@media \(max-height: 550px\)[\s\S]*?\n\}/);
  assert(landscapeBlock[0].includes('body.flashcard-active #flashcard-srs-bar') && landscapeBlock[0].includes('grid-template-columns: repeat(4, 1fr) !important;'),
    'Flashcard SRS buttons must use 4 columns in landscape to conserve vertical height');
  assert(landscapeBlock[0].includes('body.flashcard-active .flashcard-stage') && landscapeBlock[0].includes('height: 240px !important;'),
    'Flashcard stage must be constrained to 240px in landscape');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 21 SUMMARY: All ${passed} tests passed 100%!`);
console.log(`========================================`);
