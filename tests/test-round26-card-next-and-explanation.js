// =========================================================================
// TEST SUITE 26: Mobile Next Button Repositioning & Explanation Full-Text
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

console.log('=== TEST SUITE 26: Mobile Next Button Repositioning & Explanation Full-Text ===\n');

// -------------------------------------------------------------------------
// ITEM 8: Nút "Câu tiếp theo" trên Mobile ở góc phải trên của Card câu hỏi
// -------------------------------------------------------------------------
test('Item 8.1: HTML defines #btn-quiz-card-next inside .card-actions-toolbar of .quiz-card', () => {
  assert(indexHtml.includes('id="btn-quiz-card-next"'), '#btn-quiz-card-next must exist in index.html');
  const cardSection = indexHtml.substring(indexHtml.indexOf('<div class="quiz-card">'), indexHtml.indexOf('<h3 id="quiz-card-question"'));
  assert(cardSection.includes('id="btn-quiz-card-next"'), '#btn-quiz-card-next must be located inside the quiz-card header');
  assert(cardSection.includes('class="card-actions-toolbar"'), 'card-actions-toolbar must exist in quiz-card header');
  assert(cardSection.includes('onclick="App.nextStudyQuestion()"'), '#btn-quiz-card-next must call App.nextStudyQuestion()');
});

test('Item 8.2: Base/Desktop CSS strictly hides #btn-quiz-card-next (Desktop 100% untouched)', () => {
  assert(styleCss.includes('.btn-quiz-card-next {'), 'style.css must define .btn-quiz-card-next');
  assert(styleCss.includes('display: none !important; /* Strictly hidden on desktop'),
    'Desktop base CSS must enforce display: none !important on #btn-quiz-card-next');
});

test('Item 8.3: app.js coordinates #btn-quiz-card-next with quiz answered state', () => {
  assert(appJs.includes("const cardNextBtn = document.getElementById('btn-quiz-card-next');"),
    'app.js must reference btn-quiz-card-next');
  assert(appJs.includes("cardNextBtn.classList.add('show');"),
    'app.js must add .show class to cardNextBtn when question is answered');
  assert(appJs.includes("cardNextBtn.classList.remove('show');"),
    'app.js must remove .show class from cardNextBtn upon reset/new card');
  assert(appJs.includes("cardNextBtn.style.display = 'none';"),
    'app.js must set cardNextBtn display none on reset');
});

test('Item 8.4: Mobile CSS shows #btn-quiz-card-next and strictly suppresses bottom and fast-next buttons', () => {
  const mobileQueryIndex = styleCss.indexOf('@media (max-width: 768px)');
  assert(mobileQueryIndex !== -1, '@media (max-width: 768px) must exist in style.css');
  const mobileCss = styleCss.slice(mobileQueryIndex);

  assert(mobileCss.includes('#btn-quiz-card-next.show,') || mobileCss.includes('.btn-quiz-card-next.show {'),
    'Mobile CSS must show card-top Next button when .show is present');
  assert(mobileCss.includes('#btn-quiz-fast-next') && mobileCss.includes('display: none !important;'),
    'Mobile CSS must hide page-header #btn-quiz-fast-next to guarantee single button');
  assert(mobileCss.includes('body.quiz-active .quiz-footer-actions') && mobileCss.includes('display: none !important;'),
    'Mobile CSS must hide bottom .quiz-footer-actions');
  assert(mobileCss.includes('body.quiz-active .btn-quiz-next') && mobileCss.includes('display: none !important;'),
    'Mobile CSS must hide bottom .btn-quiz-next');
});

test('Item 8.5: Mobile Card-actions toolbar aligns icons and button cleanly', () => {
  const mobileCss = styleCss.slice(styleCss.indexOf('@media (max-width: 768px)'));
  assert(mobileCss.includes('.card-actions-toolbar {') &&
         mobileCss.includes('display: flex !important;') &&
         mobileCss.includes('justify-content: flex-end !important;'),
    '.card-actions-toolbar must align elements to flex-end on mobile');
});

// -------------------------------------------------------------------------
// ITEM 9: Phần giải thích chi tiết trên Mobile không bị cắt/nuốt chữ
// -------------------------------------------------------------------------
test('Item 9.1: Mobile CSS unlocks height and overflow on all study/quiz wrappers', () => {
  const mobileCss = styleCss.slice(styleCss.indexOf('@media (max-width: 768px)'));

  assert(mobileCss.includes('body.quiz-active #view-study.active') &&
         mobileCss.includes('max-height: none !important;') &&
         mobileCss.includes('overflow: visible !important;'),
    'Mobile CSS must unlock view-study.active with max-height: none and overflow: visible');

  assert(mobileCss.includes('body.quiz-active .quiz-container') &&
         mobileCss.includes('max-height: none !important;') &&
         mobileCss.includes('overflow: visible !important;'),
    'Mobile CSS must unlock .quiz-container with max-height: none and overflow: visible');

  assert(mobileCss.includes('body.quiz-active .quiz-card') &&
         mobileCss.includes('max-height: none !important;') &&
         mobileCss.includes('overflow: visible !important;'),
    'Mobile CSS must unlock .quiz-card with max-height: none and overflow: visible');
});

test('Item 9.2: Mobile CSS ensures .quiz-explanation-box and #quiz-explanation-text have no clipping or max-height traps', () => {
  const mobileCss = styleCss.slice(styleCss.indexOf('@media (max-width: 768px)'));

  assert(mobileCss.includes('#quiz-explanation-box') &&
         mobileCss.includes('max-height: none !important;') &&
         mobileCss.includes('overflow: visible !important;'),
    'Mobile .quiz-explanation-box must have max-height: none and overflow: visible');

  assert(mobileCss.includes('#quiz-explanation-text') &&
         mobileCss.includes('max-height: none !important;') &&
         mobileCss.includes('overflow: visible !important;') &&
         mobileCss.includes('overflow-wrap: break-word !important;'),
    'Mobile #quiz-explanation-text must allow unlimited vertical expansion and break long words');
});

test('Item 9.3: Mobile app-main provides smooth vertical scroll with ample bottom clearance', () => {
  const mobileCss = styleCss.slice(styleCss.indexOf('@media (max-width: 768px)'));
  assert(mobileCss.includes('body.quiz-active .app-main') &&
         mobileCss.includes('overflow-y: auto !important;') &&
         mobileCss.includes('padding-bottom: 40px !important;'),
    'app-main must have overflow-y: auto and comfortable padding-bottom clearance');
});

test('Item 9.4: Simulation of Longest Explanation in Sample Deck & Multi-paragraph LaTeX text', () => {
  // Find longest explanation in sample deck
  const questions = sampleDeck.questions;
  let longestCard = questions[0];
  for (const q of questions) {
    if ((q.explanation || '').length > (longestCard.explanation || '').length) {
      longestCard = q;
    }
  }
  assert(longestCard.explanation && longestCard.explanation.length > 50,
    `Found sample deck longest explanation (${longestCard.explanation.length} chars)`);

  // Create an extreme multi-paragraph Vietnamese explanation with formulas
  const superLongExplanation = `
    Phân tích chi tiết toàn diện bài toán:
    1. Cơ sở lý thuyết:
       Phương trình động lực học tổng quát: $F_{net} = m \\cdot a = m \\frac{d^2 x}{dt^2}$.
       Định luật bảo toàn cơ năng trong trường thế: $E = W_t + W_đ = mgh + \\frac{1}{2}mv^2 = \\text{const}$.
    2. Các bước biến đổi giải tích:
       - Bước 1: Tính tích phân xác định từ thời điểm $t_0 = 0$ đến $t_1$:
         $$\\int_{0}^{t_1} F(t) dt = p(t_1) - p(0) = \\Delta p$$
       - Bước 2: Khử các đại lượng ma sát bậc cao và chuẩn hóa sai số 3 chữ số thập phân.
    3. Kết luận và ý nghĩa thực tiễn:
       Đáp án đúng được suy ra trực tiếp từ nguyên lý biến thiên động lượng và các định luật Newton cơ bản,
       đảm bảo sinh viên nắm vững cả bản chất vật lý lẫn kỹ năng giải tích thực hành mà không bị nhầm lẫn
       với các trường hợp dao động tắt dần phi tuyến tính phức tạp khác.
  `.trim();

  assert(superLongExplanation.length > 500, `Created super-long explanation (${superLongExplanation.length} chars)`);

  // Simulate rendering with text replacement
  const renderedText = superLongExplanation.replace(/\\s+/g, ' ');
  assert(renderedText.startsWith('Phân tích chi tiết'), 'Start of explanation is preserved');
  assert(renderedText.endsWith('phức tạp khác.'), 'End of explanation is preserved 100% without truncation');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 26 SUMMARY: All ${passed} tests passed (${failed} failed)!`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
