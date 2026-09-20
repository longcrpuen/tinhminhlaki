const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE 22: Fast-Next CTA, Strict Mode Isolation, Adaptive Landscape Sidebar & Natural Quiz Scroll ===\n');

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

// --- TASK 1: TOP HEADER "FAST-NEXT" ACTION & RELAXED EXPLANATION PADDING ---
console.log('--- 1. Top Header Fast-Next CTA & Relaxed Explanation Spacing ---');
test('HTML defines #btn-quiz-fast-next in .quiz-header-bar', () => {
  assert(indexHtml.includes('id="btn-quiz-fast-next"'), 'btn-quiz-fast-next must exist in HTML');
  assert(indexHtml.includes('class="btn-quiz-fast-next px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-md active:scale-95 transition-all"'),
    'btn-quiz-fast-next must have high-contrast compact styling classes');
  assert(indexHtml.includes('onclick="App.nextStudyQuestion()"'),
    'btn-quiz-fast-next must trigger App.nextStudyQuestion()');
});

test('app.js shows #btn-quiz-fast-next only when question is answered and hides upon new card', () => {
  assert(appJs.includes("const fastNextBtn = document.getElementById('btn-quiz-fast-next');"),
    'app.js must reference btn-quiz-fast-next');
  assert(appJs.includes("fastNextBtn.classList.add('show');") && appJs.includes("fastNextBtn.style.display = 'inline-flex';"),
    'app.js must display fastNextBtn in handleQuizAnswer');
  assert(appJs.includes("fastNextBtn.classList.remove('show');") && appJs.includes("fastNextBtn.style.display = 'none';"),
    'app.js must hide fastNextBtn when rendering new question');
});

test('CSS styles .btn-quiz-fast-next with compact high-contrast gradient pill', () => {
  assert(styleCss.includes('.btn-quiz-fast-next {'), 'CSS must define .btn-quiz-fast-next');
  assert(styleCss.includes('linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)'),
    'Fast-next button must have primary-to-accent gradient');
  assert(styleCss.includes('.btn-quiz-fast-next:active') && styleCss.includes('scale(0.95)'),
    'Fast-next button must have active:scale-95 tactile feedback');
});

test('Explanation container has relaxed padding (p-4), gap (space-y-2), top margin (mt-4), and leading-relaxed text-sm', () => {
  assert(indexHtml.includes('class="quiz-explanation-box p-4 space-y-2 mt-4"'),
    'HTML quiz-explanation-box must include p-4 space-y-2 mt-4');
  assert(indexHtml.includes('class="text-sm leading-relaxed"'),
    'HTML quiz-explanation-text must include text-sm leading-relaxed');
  assert(styleCss.includes('padding: 16px !important;') && styleCss.includes('gap: 8px !important;'),
    'CSS must enforce 16px padding (p-4) and 8px gap (space-y-2) on active explanation');
  assert(styleCss.includes('font-size: 0.875rem !important;') && styleCss.includes('line-height: 1.625 !important;'),
    'CSS must enforce text-sm (0.875rem) and leading-relaxed (1.625) typography');
});

// --- TASK 2: ELIMINATE COMPONENT LEAK & MODE COLLISIONS ---
console.log('\n--- 2. Eliminate Component Leak & Strict Mode Isolation ---');
test('CSS enforces strict mutual exclusivity between #view-study and #view-exam', () => {
  assert(styleCss.includes('body.quiz-active #view-study:not(.active)') &&
         styleCss.includes('body.quiz-active #view-exam:not(.active)') &&
         styleCss.includes('display: none !important;'),
    'Inactive views in quiz-active state must be display: none !important');
  assert(styleCss.includes('body.quiz-active #view-study.active'),
    'view-study in quiz-active must be conditioned on .active class');
  assert(styleCss.includes('body.quiz-active #view-exam.active'),
    'view-exam in quiz-active must be conditioned on .active class');
});

test('app.js startExamFromModal completely resets active quiz state and scrolls viewport to top', () => {
  const startExamMatch = appJs.match(/async startExamFromModal\(\)[\s\S]*?\n  \},/);
  assert(startExamMatch, 'startExamFromModal exists');
  const code = startExamMatch[0];
  assert(code.includes('this.clearPerQuestionTimer()'), 'Must clear per-question timer');
  assert(code.includes("quizOptions.innerHTML = ''"), 'Must unmount quiz options DOM completely');
  assert(code.includes('this.clearActiveSessionState()'), 'Must clear backup quiz state');
  assert(code.includes("this.navigateTo('exam')"), 'Must navigate to exam');
});

test('app.js navigateTo handles strict isolation between exam and study views', () => {
  assert(appJs.includes("if (viewName === 'exam')"), 'navigateTo must have explicit exam isolation branch');
  assert(appJs.includes("studySec.style.setProperty('display', 'none', 'important')"),
    'navigateTo must hide view-study with display: none !important when entering exam');
  assert(appJs.includes("window.scrollTo({ top: 0, left: 0, behavior: 'instant' })"),
    'navigateTo must reset scroll to top: 0');
});

// --- TASK 3: ADAPTIVE LEFT SIDEBAR FOR MOBILE LANDSCAPE ---
console.log('\n--- 3. Adaptive Left Sidebar for Mobile Landscape ---');
test('CSS transforms .bottom-nav into slim Left Sidebar on non-quiz landscape viewports', () => {
  const landscapeQuery = '@media (max-height: 550px), (orientation: landscape) and (max-height: 550px)';
  assert(styleCss.includes(landscapeQuery), 'Landscape query must exist');
  assert(styleCss.includes('body:not(.quiz-active) .bottom-nav'), 'Must style bottom-nav when not quiz-active in landscape');
  assert(styleCss.includes('width: 64px !important;') && styleCss.includes('flex-direction: column !important;'),
    'Bottom nav must morph into 64px (w-16) column on landscape');
  assert(styleCss.includes('background: rgba(15, 14, 23, 0.95) !important;'),
    'Sidebar must use #0f0e17/95 background');
  assert(styleCss.includes('border-right: 1px solid rgba(255, 255, 255, 0.1) !important;'),
    'Sidebar must use border-r border-white/10');
});

test('Content wrapper adjusts margin (ml-16) and padding (pb-0) for landscape sidebar', () => {
  assert(styleCss.includes('body:not(.quiz-active) .app-main') &&
         styleCss.includes('margin-left: 64px !important;') &&
         styleCss.includes('padding-bottom: 0 !important;'),
    'app-main must adjust with ml-16 and pb-0 for adaptive left sidebar');
});

test('In quiz-active mode on landscape, bottom nav is hidden and quiz gets full width', () => {
  assert(styleCss.includes('body.quiz-active .bottom-nav') && styleCss.includes('display: none !important;'),
    'bottom-nav must hide during quiz in landscape');
  assert(styleCss.includes('body.quiz-active .app-main') && styleCss.includes('margin-left: 0 !important;'),
    'app-main margin-left must be 0 during quiz in landscape');
});

// --- TASK 4: FIX LANDSCAPE QUIZ TRUNCATION & NATURAL SCROLLING ---
console.log('\n--- 4. Fix Landscape Quiz Truncation & Natural Vertical Scroll ---');
test('Landscape quiz unlocks natural vertical scroll (overflow-y: auto, pb-24, min-h-100%)', () => {
  assert(styleCss.includes('body.quiz-active .quiz-card') &&
         styleCss.includes('overflow-y: auto !important;') &&
         styleCss.includes('overscroll-behavior-y: contain !important;') &&
         styleCss.includes('padding-bottom: 96px !important;'),
    'Quiz card in landscape must allow vertical scroll with pb-24 (96px) clearance');
});

test('Landscape quiz maintains 2-column options grid with intrinsic button heights (min-h-[44px] shrink-0)', () => {
  assert(styleCss.includes('body.quiz-active .quiz-options-list') &&
         styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;') &&
         styleCss.includes('gap: 10px !important;'),
    'Quiz options list must use 2-column grid with gap-2.5 (10px)');
  assert(styleCss.includes('body.quiz-active .quiz-option-btn') &&
         styleCss.includes('min-height: 44px !important;') &&
         styleCss.includes('flex-shrink: 0 !important;'),
    'Option buttons must maintain intrinsic min-height 44px and shrink-0');
});

// --- TASK 5: DESKTOP LAYOUT INTEGRITY (>= 1024px) ---
console.log('\n--- 5. Desktop Layout Integrity Guardrail ---');
test('Desktop monitor styles remain pristine and untouched', () => {
  assert(styleCss.includes('.app-sidebar {'), 'Desktop .app-sidebar must exist');
  assert(styleCss.includes('.bottom-nav {\n  display: none;'),
    'Bottom nav default display must remain none for desktop');
  assert(!styleCss.includes('@media (min-width: 1024px) {\n  .bottom-nav { display: flex'),
    'Bottom nav must NEVER display on desktop monitors');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 22 SUMMARY: All ${passed} tests passed 100%!`);
console.log(`========================================`);
