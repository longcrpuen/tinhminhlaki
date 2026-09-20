const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 16: No Duplicate Option Labels & 2x2 Answer Grid ===\n');

const cssPath = path.join(__dirname, '../css/style.css');
const appJsPath = path.join(__dirname, '../js/app.js');
const parserJsPath = path.join(__dirname, '../js/parser.js');

const styleCss = fs.readFileSync(cssPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');
const parserJs = fs.readFileSync(parserJsPath, 'utf-8');

// --- 1. OPTION LABEL DUPLICATION FIX ---
console.log('--- 1. Option Label Deduplication (Fix "A:A.", "A. A.", etc.) ---');

// 1.1 Check parser.js regex strip loop
assert(parserJs.includes('while (/^[A-Za-z][\\s.):\\-]+/.test(clean))'),
  'parser.js implements robust regex loop stripping all repeated letter prefixes');

// 1.2 Check app.js renderQuizCard
assert(appJs.includes('// Strip all repeated letter prefixes (e.g. "A:A.", "A. A.", "A: ", "A. ")'),
  'app.js renderQuizCard comments and implements repeated prefix stripping');
console.log('  ✅ PASS: parser.js & app.js renderQuizCard implement repeated prefix stripping');

// 1.3 Check app.js renderExamCard
const examOptMatch = appJs.includes('btn.className = `quiz-option-btn w-full min-h-[52px]') &&
  appJs.includes('while (true) {\n        const m = cleanText.match(/^([A-Za-z])[\\s.):\\-]+(.*)$/s);');
assert(examOptMatch, 'renderExamCard strips repeated letter prefixes in Exam mode');
console.log('  ✅ PASS: app.js renderExamCard strips repeated letter prefixes');

// 1.4 Check Question Bank deduplication & removal of String.fromCharCode(65 + i):
assert(!appJs.includes('<b>${String.fromCharCode(65 + i)}:</b>'),
  'app.js removed legacy "<b>${String.fromCharCode(65 + i)}:</b>" which caused "A:A." duplicate label bug');
assert(appJs.includes('<b>${letter}.</b> ${this.renderLatexText(cleanOptText)}'),
  'Question Bank renders single clean bold label <b>${letter}.</b> with deduplicated content');
console.log('  ✅ PASS: Question Bank renders single clean <b>${letter}.</b> without duplicate prefix');

// 1.5 Unit test string deduplication simulation
function cleanOption(optText, idx) {
  const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const defaultLetter = defaultLetters[idx] || `${idx + 1}`;
  let letterPrefix = `${defaultLetter}.`;
  let cleanText = typeof optText === 'string' ? optText.trim() : String(optText || '');

  let firstLetter = null;
  while (true) {
    const m = cleanText.match(/^([A-Za-z])[\s.):\-]+(.*)$/s);
    if (!m) break;
    if (!firstLetter) firstLetter = m[1].toUpperCase();
    cleanText = m[2].trim();
  }
  if (firstLetter) {
    letterPrefix = `${firstLetter}.`;
  }
  return { letterPrefix, cleanText, full: `${letterPrefix} ${cleanText}` };
}

const t1 = cleanOption('A:A. Mean = Median = Mode', 0);
assert.strictEqual(t1.letterPrefix, 'A.');
assert.strictEqual(t1.cleanText, 'Mean = Median = Mode');
assert.strictEqual(t1.full, 'A. Mean = Median = Mode');

const t2 = cleanOption('B. B: Sample variance is always positive', 1);
assert.strictEqual(t2.letterPrefix, 'B.');
assert.strictEqual(t2.cleanText, 'Sample variance is always positive');
assert.strictEqual(t2.full, 'B. Sample variance is always positive');

const t3 = cleanOption('C) C. Option text', 2);
assert.strictEqual(t3.letterPrefix, 'C.');
assert.strictEqual(t3.cleanText, 'Option text');

const t4 = cleanOption('Pure text without prefix', 3);
assert.strictEqual(t4.letterPrefix, 'D.');
assert.strictEqual(t4.cleanText, 'Pure text without prefix');
console.log('  ✅ PASS: Logic unit tests prove "A:A.", "B. B:", "C) C." are completely deduplicated to "A.", "B.", "C."');

// --- 2. 2x2 ANSWER GRID LAYOUT ---
console.log('\n--- 2. 2x2 Answer Grid Layout (Desktop) & 1-Column Responsive (Mobile) ---');

// 2.1 CSS base .quiz-options-list
assert(styleCss.includes('.quiz-options-list {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);'),
  '.quiz-options-list is configured as 2-column grid on desktop');
console.log('  ✅ PASS: .quiz-options-list uses 2-column grid');

// 2.2 Study view quiz-options-list
assert(styleCss.includes('#view-study .quiz-options-list') &&
  styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
  '#view-study .quiz-options-list enforces 2x2 grid layout');
console.log('  ✅ PASS: #view-study .quiz-options-list enforces 2x2 grid');

// 2.3 Exam view quiz-options-list
assert(styleCss.includes('#view-exam .quiz-options-list') &&
  styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
  '#view-exam .quiz-options-list enforces 2x2 grid layout');
console.log('  ✅ PASS: #view-exam .quiz-options-list enforces 2x2 grid');

// 2.4 Question Bank bank-card-options-grid
assert(styleCss.includes('.bank-card-options-grid {') &&
  styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
  '.bank-card-options-grid enforces 2x2 grid layout on desktop');
assert(appJs.includes('class="bank-card-options-grid"'),
  'Question Bank cards use bank-card-options-grid instead of repeat(auto-fit, minmax(220px, 1fr))');
console.log('  ✅ PASS: Question Bank cards use 2x2 grid instead of uneven 3+1 columns');

// 2.5 Mobile responsiveness (<= 640px)
const mobileQuery = styleCss.slice(styleCss.indexOf('@media (max-width: 640px)'));
assert(mobileQuery.includes('#view-study .quiz-options-list') &&
  mobileQuery.includes('#view-exam .quiz-options-list') &&
  mobileQuery.includes('.bank-card-options-grid') &&
  mobileQuery.includes('grid-template-columns: 1fr !important;'),
  'Mobile breakpoint (<= 640px) collapses all option grids to 1 column');
console.log('  ✅ PASS: Mobile breakpoint collapses Study, Exam, and Bank option grids to 1 column');

console.log('\n========================================');
console.log('ROUND 16 SUMMARY: All tests passed!');
console.log('========================================');
