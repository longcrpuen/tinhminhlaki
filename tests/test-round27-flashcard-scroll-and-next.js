// =========================================================================
// TEST SUITE 27: Flashcard Rewrite, Responsive Quiz Scroll & Next Button
// =========================================================================

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');
const sampleDeck = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'sample-deck.json'), 'utf8'));

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

function test(title, fn) {
  console.log(`\n--- ${title} ---`);
  try {
    fn();
  } catch (e) {
    console.error(`  ❌ EXCEPTION: ${e.message}`);
    failed++;
  }
}

console.log('=== TEST SUITE 27: Flashcard Rewrite, Responsive Quiz Scroll & Next Button ===\n');

// -------------------------------------------------------------------------
// 1. REWRITTEN FLASHCARD COMPONENT (MỤC 3)
// -------------------------------------------------------------------------
test('1.1: Flashcard HTML structure & clean DOM without inline display:none traps', () => {
  assert(indexHtml.includes('id="study-flashcard-area"'), '#study-flashcard-area must exist');
  assert(indexHtml.includes('class="flashcard-player-container"'), '.flashcard-player-container must exist');
  assert(indexHtml.includes('id="active-flashcard" class="flashcard-card"'), '#active-flashcard must have class flashcard-card');
  assert(indexHtml.includes('class="flashcard-face flashcard-front"'), 'Front face must exist');
  assert(indexHtml.includes('class="flashcard-face flashcard-back"'), 'Back face must exist');
  
  // Ensure no inline style="display: none;" on back face
  const backFaceIdx = indexHtml.indexOf('class="flashcard-face flashcard-back"');
  const backFaceTag = indexHtml.substring(backFaceIdx - 20, backFaceIdx + 50);
  assert(!backFaceTag.includes('display: none'), 'Back face must NOT have inline display: none');
  
  // Ensure content wraps exist on both faces
  const contentWrapMatches = indexHtml.match(/class="flashcard-content-wrap"/g) || [];
  assert(contentWrapMatches.length >= 2, 'Must have flashcard-content-wrap on both front and back faces');

  // Ensure answer and explanation IDs exist
  assert(indexHtml.includes('id="flashcard-answer-text"'), '#flashcard-answer-text must exist');
  assert(indexHtml.includes('id="flashcard-explanation-wrap"'), '#flashcard-explanation-wrap must exist');
  assert(indexHtml.includes('id="flashcard-explanation-text"'), '#flashcard-explanation-text must exist');
});

test('1.2: Flashcard 3D flip animation CSS & backface-visibility', () => {
  assert(styleCss.includes('.flashcard-card {') && styleCss.includes('transform-style: preserve-3d;'),
    '.flashcard-card must specify transform-style: preserve-3d');
  assert(styleCss.includes('.flashcard-card.flipped {') && styleCss.includes('transform: rotateY(180deg);'),
    '.flashcard-card.flipped must rotate 180deg');
  assert(styleCss.includes('.flashcard-face {') && styleCss.includes('backface-visibility: hidden;'),
    '.flashcard-face must specify backface-visibility: hidden');
  assert(styleCss.includes('.flashcard-back {') && styleCss.includes('transform: rotateY(180deg);'),
    '.flashcard-back must be pre-rotated 180deg');
  assert(styleCss.includes('transition: transform 0.35s') || styleCss.includes('0.35s cubic-bezier'),
    'Transition duration must be fast and smooth (~350ms)');
});

test('1.3: Flashcard 2x2 SRS ratings grid & buttons', () => {
  assert(indexHtml.includes('id="flashcard-srs-bar"'), '#flashcard-srs-bar must exist');
  assert(indexHtml.includes('class="srs-btn srs-btn-again"'), 'SRS Again button must exist');
  assert(indexHtml.includes('class="srs-btn srs-btn-hard"'), 'SRS Hard button must exist');
  assert(indexHtml.includes('class="srs-btn srs-btn-good"'), 'SRS Good button must exist');
  assert(indexHtml.includes('class="srs-btn srs-btn-easy"'), 'SRS Easy button must exist');

  assert(styleCss.includes('.srs-ratings-bar {') && styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
    '.srs-ratings-bar must enforce a clean 2x2 grid');
  assert(styleCss.includes('.srs-btn {') && styleCss.includes('height: 50px !important;'),
    '.srs-btn must have consistent, comfortable touch target height');
});

test('1.4: app.js Flashcard logic (render, flip, SM-2 rate)', () => {
  assert(appJs.includes('_renderFlashcardContent(card) {'), '_renderFlashcardContent method must exist');
  assert(appJs.includes('flipFlashcard() {'), 'flipFlashcard method must exist');
  assert(appJs.includes('rateFlashcard(rating) {'), 'rateFlashcard method must exist');
  assert(appJs.includes('SRS.calculateNext(card.srs, rating)'), 'rateFlashcard must integrate with SM-2');
  assert(appJs.includes('sounds.playFlip()'), 'flipFlashcard must play flip audio');

  // Verify flip toggles reveal button and srs bar
  assert(appJs.includes("revealBtn.style.setProperty('display', isFlipped ? 'none' : 'flex', 'important')"),
    'flipFlashcard must toggle revealBtn');
  assert(appJs.includes("srsBar.style.setProperty('display', disp, 'important')"),
    'flipFlashcard must toggle srsBar with important');
});

// -------------------------------------------------------------------------
// 2. RESPONSIVE QUIZ SCROLL STRATEGY (MỤC 2)
// -------------------------------------------------------------------------
test('2.1: Quiz area unlocks max-height and hidden overflow traps on all wrappers', () => {
  // Check that #view-study.active allows vertical scroll
  const activeViewIdx = styleCss.indexOf('#view-study.active {');
  assert(activeViewIdx !== -1, '#view-study.active must exist in style.css');
  const activeViewBlock = styleCss.substring(activeViewIdx, styleCss.indexOf('}', activeViewIdx));
  assert(activeViewBlock.includes('overflow-y: auto !important;'),
    '#view-study.active must have overflow-y: auto !important');
  assert(activeViewBlock.includes('max-height: none !important;'),
    '#view-study.active must have max-height: none !important');
  assert(!activeViewBlock.includes('overflow: hidden !important;'),
    '#view-study.active must NOT have overflow: hidden !important');

  // Check that .quiz-container and .quiz-card have overflow visible
  const quizContIdx = styleCss.indexOf('#view-study .quiz-container {');
  const quizContBlock = styleCss.substring(quizContIdx, styleCss.indexOf('}', quizContIdx));
  assert(quizContBlock.includes('overflow: visible !important;'),
    '#view-study .quiz-container must have overflow: visible !important');

  const quizCardIdx = styleCss.indexOf('#view-study .quiz-card {');
  const quizCardBlock = styleCss.substring(quizCardIdx, styleCss.indexOf('}', quizCardIdx));
  assert(quizCardBlock.includes('overflow: visible !important;'),
    '#view-study .quiz-card must have overflow: visible !important');

  const optionsIdx = styleCss.indexOf('#view-study .quiz-options-list,');
  const optionsBlock = styleCss.substring(optionsIdx, styleCss.indexOf('}', optionsIdx));
  assert(optionsBlock.includes('overflow: visible !important;'),
    '#view-study .quiz-options-list must have overflow: visible !important');
});

test('2.2: Single-level scroll guarantee on small viewports (<= 600px)', () => {
  // Mobile app-main and #view-study provide smooth single scroll
  const mobileIdx = styleCss.indexOf('@media (max-width: 768px)');
  const mobileCss = styleCss.slice(mobileIdx);
  assert(mobileCss.includes('body.quiz-active .app-main') && mobileCss.includes('overflow-y: auto !important;'),
    'Mobile app-main must have overflow-y: auto for smooth single scroll');
  assert(mobileCss.includes('body.quiz-active .quiz-container') && mobileCss.includes('overflow: visible !important;'),
    'Mobile quiz-container must have overflow: visible to avoid nested scrollbars');
});

// -------------------------------------------------------------------------
// 3. NEXT BUTTON REPOSITIONING & REMOVE ARROW (MỤC 1)
// -------------------------------------------------------------------------
test('3.1: HTML places #btn-quiz-card-next in row 1 (.quiz-card-meta-header) with text "Tiếp theo"', () => {
  const metaHeaderStart = indexHtml.indexOf('<div class="quiz-card-meta-header');
  assert(metaHeaderStart !== -1, 'quiz-card-meta-header must exist in index.html');
  const metaHeaderEnd = indexHtml.indexOf('class="card-actions-toolbar"', metaHeaderStart);
  const metaHeaderHtml = indexHtml.substring(metaHeaderStart, metaHeaderEnd);

  assert(metaHeaderHtml.includes('id="quiz-card-tag"'), '#quiz-card-tag must be in meta header (row 1)');
  assert(metaHeaderHtml.includes('id="btn-quiz-card-next"'), '#btn-quiz-card-next must be in meta header (row 1)');

  // Verify text is strictly "Tiếp theo", NO arrow "→"
  const btnStart = metaHeaderHtml.indexOf('id="btn-quiz-card-next"');
  const btnHtml = metaHeaderHtml.substring(btnStart, metaHeaderHtml.indexOf('</button>', btnStart));
  assert(btnHtml.includes('Tiếp theo'), 'Button text must be "Tiếp theo"');
  assert(!btnHtml.includes('→') && !btnHtml.includes('&rarr;'), 'Button text must NOT contain arrow "→"');
});

test('3.2: Secondary action toolbar (.card-actions-toolbar) is on row 2 without Next button', () => {
  const cardStart = indexHtml.indexOf('<div class="quiz-card">');
  const questionStart = indexHtml.indexOf('<h3 id="quiz-card-question"');
  const headerSection = indexHtml.substring(cardStart, questionStart);

  const toolbarStart = headerSection.indexOf('class="card-actions-toolbar"');
  assert(toolbarStart !== -1, '.card-actions-toolbar must exist in header section');
  const toolbarEnd = headerSection.indexOf('</div>', toolbarStart);
  const toolbarHtml = headerSection.substring(toolbarStart, toolbarEnd);

  assert(toolbarHtml.includes('id="btn-card-bookmark"'), 'Bookmark button in toolbar');
  assert(toolbarHtml.includes('id="btn-card-flag"'), 'Flag button in toolbar');
  assert(toolbarHtml.includes('id="btn-card-edit"'), 'Edit button in toolbar');
  assert(toolbarHtml.includes('id="btn-card-focus"'), 'Focus button in toolbar');
  assert(!toolbarHtml.includes('id="btn-quiz-card-next"'), '#btn-quiz-card-next must NOT be inside .card-actions-toolbar');
});

test('3.3: CSS styles #btn-quiz-card-next as purple gradient pill, right-aligned, and show on answered', () => {
  assert(styleCss.includes('.quiz-card-meta-header {') && styleCss.includes('justify-content: space-between !important;'),
    '.quiz-card-meta-header must justify-content: space-between to push button to right edge');
  assert(styleCss.includes('.btn-quiz-card-next {') && styleCss.includes('border-radius: var(--radius-full);'),
    '.btn-quiz-card-next must be bo tròn pill');
  assert(styleCss.includes('.btn-quiz-card-next.show {') && styleCss.includes('display: inline-flex !important;'),
    '.btn-quiz-card-next.show must display inline-flex');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 27 SUMMARY: All ${passed} tests passed (${failed} failed)!`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
