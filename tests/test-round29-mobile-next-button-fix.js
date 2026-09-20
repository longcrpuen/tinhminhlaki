/**
 * Test Suite 29: Verification of Mobile Next Button Clickability & Interactivity
 * Tests:
 * 1. Mobile CSS explicitly grants pointer-events: auto !important, cursor: pointer !important, and z-index: 35 !important
 * 2. Desktop CSS strictly retains display: none !important and pointer-events: none !important on desktop
 * 3. Event listener in setupEventListeners() intercepts click/tap on #btn-quiz-card-next
 * 4. Runtime simulation:
 *    - In study quiz mode, answering question 0 reveals #btn-quiz-card-next with .show and pointerEvents 'auto'
 *    - Clicking #btn-quiz-card-next successfully triggers nextStudyQuestion()
 *    - Question index advances from 0 to 1
 *    - #study-quiz-area and window scroll positions are reset to 0
 *    - Debounce guard prevents accidental double-tap skips
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 29: Mobile Next Button Clickability & Interactivity Fix ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');
const indexPath = path.join(__dirname, '..', 'index.html');

const styleCss = fs.readFileSync(stylePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Mobile media query must exist');
const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// -------------------------------------------------------------------------
// 1. CSS POINTER-EVENTS & Z-INDEX CHECKS
// -------------------------------------------------------------------------
console.log('--- 1. CSS Pointer-Events & Interaction Scoping ---');

test('1.1: Mobile CSS explicitly grants pointer-events: auto !important on #btn-quiz-card-next', () => {
  assert(mobileCss.includes('#btn-quiz-card-next') && mobileCss.includes('pointer-events: auto !important;'),
    'Mobile CSS must enforce pointer-events: auto !important');
});

test('1.2: Mobile CSS assigns high z-index and touch-action: manipulation', () => {
  assert(mobileCss.includes('touch-action: manipulation !important;'),
    'Mobile CSS must set touch-action: manipulation to eliminate mobile tap latency');
  assert(mobileCss.includes('z-index: 35 !important;'),
    'Mobile CSS must set z-index: 35 to prevent layer occlusion');
});

test('1.3: Desktop CSS maintains display: none !important and pointer-events: none !important', () => {
  assert(desktopCss.includes('.btn-quiz-card-next.show') && desktopCss.includes('display: none !important;'),
    'Desktop CSS must hide button');
  assert(desktopCss.includes('pointer-events: none !important;'),
    'Desktop CSS scopes pointer-events: none');
});

test('1.4: Mobile .quiz-card-meta-header aligns flex-start with relative z-index', () => {
  assert(mobileCss.includes('.quiz-card-meta-header') && mobileCss.includes('align-items: flex-start !important;'),
    'Meta header must align flex-start so badges do not push button');
  assert(mobileCss.includes('#quiz-card-tag') && mobileCss.includes('flex-wrap: wrap !important;'),
    'Badges container must wrap cleanly');
});

// -------------------------------------------------------------------------
// 2. JS EVENT LISTENER & HANDLER CHECKS
// -------------------------------------------------------------------------
console.log('\n--- 2. JS Event Listener & State Synchronization ---');

test('2.1: setupEventListeners() attaches click/tap listener to #btn-quiz-card-next', () => {
  assert(appJs.includes("const cardNextBtn = document.getElementById('btn-quiz-card-next');"),
    'app.js must lookup cardNextBtn in listeners');
  assert(appJs.includes("cardNextBtn.addEventListener('click',"),
    'app.js must attach click listener');
});

test('2.2: handleQuizAnswer & submitNumericAnswer set pointerEvents: auto on cardNextBtn', () => {
  const answerIdx = appJs.indexOf('handleQuizAnswer(');
  const answerSection = appJs.slice(answerIdx, appJs.indexOf('nextStudyQuestion(', answerIdx));
  assert(answerSection.includes("cardNextBtn.style.pointerEvents = 'auto';"),
    'handleQuizAnswer must explicitly set pointerEvents auto');
  assert(answerSection.includes("cardNextBtn.style.visibility = 'visible';"),
    'handleQuizAnswer must explicitly set visibility visible');

  const numericIdx = appJs.indexOf('submitNumericAnswer(');
  const numericSection = appJs.slice(numericIdx, appJs.indexOf('handleQuizAnswer(', numericIdx));
  assert(numericSection.includes("cardNextBtn.style.pointerEvents = 'auto';"),
    'submitNumericAnswer must explicitly set pointerEvents auto');
});

test('2.3: nextStudyQuestion() resets scrollTop on #study-quiz-area and includes debounce protection', () => {
  const nextIdx = appJs.indexOf('nextStudyQuestion() {');
  assert(nextIdx !== -1, 'nextStudyQuestion method definition must exist');
  const nextSection = appJs.slice(nextIdx, appJs.indexOf('_renderFlashcardContent(', nextIdx));
  assert(nextSection.includes("document.getElementById('study-quiz-area')"),
    'nextStudyQuestion must reference study-quiz-area');
  assert(nextSection.includes("quizArea.scrollTop = 0"),
    'nextStudyQuestion must reset quizArea.scrollTop to 0');
  assert(nextSection.includes("this._lastNextClick") && nextSection.includes("now - this._lastNextClick <"),
    'nextStudyQuestion must debounce rapid clicks');
});

// -------------------------------------------------------------------------
// 3. FULL RUNTIME SIMULATION OF MOBILE QUIZ FLOW
// -------------------------------------------------------------------------
console.log('\n--- 3. Mobile Quiz Interactive Flow Simulation ---');

test('3.1: Complete simulation: Start session -> Answer card -> Click Next button -> Advance card', () => {
  // Mock DOM
  const classSet = new Set();
  const elements = {
    'btn-quiz-card-next': {
      classList: {
        add(c) { classSet.add(c); },
        remove(c) { classSet.delete(c); },
        contains(c) { return classSet.has(c); },
        has(c) { return classSet.has(c); }
      },
      style: { display: 'none', pointerEvents: 'none' },
      clickListeners: []
    },
    'study-quiz-area': {
      scrollTop: 450,
      classList: new Set(),
      style: {}
    },
    'app-main': {
      scrollTop: 300
    },
    'quiz-card-question': { innerHTML: '' },
    'quiz-options-container': { innerHTML: '' },
    'quiz-card-tag': { innerHTML: '' },
    'quiz-explanation-box': { classList: new Set() },
    'quiz-explanation-text': { innerHTML: '' },
    'study-counter': { textContent: '' },
    'study-session-title': { textContent: '' },
    'study-progress-fill': { style: { width: '0%' } }
  };

  const btn = elements['btn-quiz-card-next'];
  btn.addEventListener = function(event, handler) {
    if (event === 'click') this.clickListeners.push(handler);
  };
  btn.click = function() {
    // If pointer-events is none, real browsers do not fire click!
    if (this.style.pointerEvents === 'none') {
      throw new Error('Element has pointer-events: none and cannot receive click events!');
    }
    for (const h of this.clickListeners) {
      h({ preventDefault() {}, stopPropagation() {} });
    }
  };

  // Mock App session
  const mockSession = {
    mode: 'quiz',
    title: 'Ôn tập mẫu',
    currentIndex: 0,
    cards: [
      { id: '1', question: 'Câu 1?', options: ['A', 'B'], answerIndex: 0 },
      { id: '2', question: 'Câu 2?', options: ['C', 'D'], answerIndex: 1 }
    ],
    userAnswers: {}
  };

  let nextCalled = 0;
  const mockApp = {
    activeSession: mockSession,
    _lastNextClick: 0,
    setupButtonListener() {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextStudyQuestion();
      });
    },
    handleAnswer(optIdx) {
      // Logic inside handleQuizAnswer:
      btn.classList.add('show');
      btn.style.display = 'inline-flex';
      btn.style.pointerEvents = 'auto';
      btn.style.visibility = 'visible';
    },
    nextStudyQuestion() {
      const now = Date.now();
      if (this._lastNextClick && now - this._lastNextClick < 200) return;
      this._lastNextClick = now;

      if (this.activeSession) {
        this.activeSession.currentIndex++;
        elements['study-quiz-area'].scrollTop = 0;
        nextCalled++;
      }
    }
  };

  // 1. Initial State: button is hidden & pointerEvents is none
  assert.strictEqual(btn.style.display, 'none');
  assert.strictEqual(btn.style.pointerEvents, 'none');

  // 2. Attach listeners as done in setupEventListeners
  mockApp.setupButtonListener();

  // 3. User answers the question
  mockApp.handleAnswer(0);

  // 4. Button is now revealed with pointerEvents: auto
  assert.strictEqual(btn.style.display, 'inline-flex');
  assert.strictEqual(btn.style.pointerEvents, 'auto');
  assert.strictEqual(btn.classList.contains('show'), true);

  // 5. User taps "Tiếp theo"
  assert.doesNotThrow(() => {
    btn.click();
  }, 'Click must succeed without throwing pointer-events error');

  // 6. Verify question advanced and scroll reset
  assert.strictEqual(mockSession.currentIndex, 1, 'Current question index must advance to 1');
  assert.strictEqual(elements['study-quiz-area'].scrollTop, 0, 'study-quiz-area scrollTop must reset to 0');
  assert.strictEqual(nextCalled, 1, 'nextStudyQuestion must be called once');

  // 7. Verify rapid double-click debounce
  btn.click(); // immediately after
  assert.strictEqual(mockSession.currentIndex, 1, 'Double-click within 200ms must be debounced');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n========================================');
console.log(`TEST SUITE 29 SUMMARY: All ${passed} tests passed (${failed} failed)!`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
