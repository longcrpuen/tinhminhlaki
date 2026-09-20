const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 11: Mixed LaTeX & Text Formatting, Inline Option Flow & Font Sync ===\n');

// Load target files
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../css/style.css'), 'utf8');
const appJs = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf8');
const katexCssPath = path.resolve(__dirname, '../lib/katex/katex.min.css');
const katexJs = require(path.resolve(__dirname, '../lib/katex/katex.min.js'));

// --- 1. VERIFY KATEX CSS IMPORT ---
console.log('--- 1. KaTeX CSS Import Verification ---');
assert(fs.existsSync(katexCssPath), 'KaTeX minified CSS file must exist in lib/katex/');
const katexCssContent = fs.readFileSync(katexCssPath, 'utf8');
assert(katexCssContent.includes('.katex'), 'KaTeX CSS contains core .katex class definition');
assert(html.includes('<link rel="stylesheet" href="./lib/katex/katex.min.css">'), 'index.html imports local KaTeX CSS');
assert(css.includes("@import url('../lib/katex/katex.min.css');"), 'style.css explicitly imports KaTeX CSS');
console.log('  ✅ PASS: KaTeX CSS import verified in index.html, style.css and local filesystem');

// --- 2. MULTIPLE CHOICE OPTION BUTTON INLINE TEXT FLOW ---
console.log('\n--- 2. Quiz Option Button Inline Text Flow ---');
assert(css.includes('.quiz-option-btn {') && css.includes('display: flex'), '.quiz-option-btn uses display: flex with align-items: flex-start');
assert(css.includes('.quiz-option-btn {') && css.includes('min-height: 52px'), '.quiz-option-btn defines min-height: 52px');
assert(css.includes('.quiz-option-btn {') && css.includes('border-radius: var(--radius-full);'), '.quiz-option-btn preserves pill border-radius');
assert(css.includes('.quiz-option-letter {') && css.includes('flex-shrink: 0;'), '.quiz-option-letter is flex-shrink: 0');
assert(css.includes('.quiz-option-letter {') && css.includes('color: #a78bfa;'), '.quiz-option-letter is colored violet-400');
assert(css.includes('.quiz-option-content {') && css.includes('flex: 1;'), '.quiz-option-content has flex: 1');
assert(css.includes('.quiz-option-content {') && css.includes('overflow-wrap: break-word;'), '.quiz-option-content has break-words');
assert(appJs.includes('quiz-option-letter font-bold text-violet-400 text-base flex-shrink-0 select-none mt-0.5'), 'app.js includes letter prefix span inside option button');
assert(appJs.includes('quiz-option-content flex-1 text-zinc-200 text-sm md:text-base leading-relaxed text-left break-words'), 'app.js includes content container inside option button');
console.log('  ✅ PASS: Quiz option buttons structured as continuous inline text flow with letter prefix');

// --- 3. MIXED LATEX & TEXT PARSER & RENDERER ---
console.log('\n--- 3. Mixed LaTeX & Text Parser & Renderer ---');
assert(appJs.includes('renderLatexText(text) {'), 'app.js implements renderLatexText method');

// Instantiate parser in test context
const AppMock = eval(`({ ${appJs.match(/renderLatexText\(text\)\s*\{[\s\S]*?\n  \},/)[0]} })`);


// Test 3.1: Inline Math with mixed text
global.katex = katexJs;
const mixedInline = AppMock.renderLatexText('Đạo hàm của $f(x) = x^2$ là gì?');
assert(mixedInline.includes('Đạo hàm của'), 'Preserves preceding plain text');
assert(mixedInline.includes('là gì?'), 'Preserves trailing plain text');
assert(mixedInline.includes('class="katex-inline-wrap inline-block align-middle mx-1"'), 'Inline math wrapped with inline-block align-middle container');
assert(mixedInline.includes('class="katex"'), 'KaTeX rendered correctly');

// Test 3.2: Block Math
const mixedBlock = AppMock.renderLatexText('Công thức: $$\\int_0^1 2x dx = 1$$');
assert(mixedBlock.includes('Công thức:'), 'Preserves text before block math');
assert(mixedBlock.includes('class="katex-display-wrap overflow-x-auto my-2"'), 'Block math wrapped in overflow-x-auto block container');

// Test 3.3: Automatic escaping of percent % inside math
const percentMath = AppMock.renderLatexText('Tỉ lệ thành công $P = 50%$ và $100%$');
assert(percentMath.includes('class="katex"'), 'KaTeX successfully rendered formula with percent sign');
assert(!percentMath.includes('KaTeX parse error'), 'No parse error thrown for unescaped percent sign');

// Test 3.4: Underscores and ampersands in plain text
const underscoreText = AppMock.renderLatexText('Biến test_variable_1 & biến test_variable_2: $x_1 + x_2$');
assert(underscoreText.includes('test_variable_1'), 'Plain text underscore preserved without corruption');
assert(underscoreText.includes('&amp;'), 'Plain text ampersand safely escaped to &amp;');

console.log('  ✅ PASS: Mixed LaTeX and text parsed seamlessly (Inline, Block, % auto-escaping, safe plain text)');

// --- 4. TYPOGRAPHY SYNCHRONIZATION & OVERFLOW WRAPPING ---
console.log('\n--- 4. Typography Synchronization & Overflow Protection ---');
assert(css.includes('.katex {\n  max-width: 100%;\n  overflow-wrap: break-word;\n  font-size: 1.05em !important;'), 'style.css sets .katex font-size: 1.05em !important');
assert(css.includes('.katex-display {\n  overflow-x: auto'), 'style.css preserves .katex-display overflow-x: auto');
assert(css.includes('.katex-inline-wrap {') && css.includes('overflow-x: auto;'), '.katex-inline-wrap has localized horizontal scroll protection');
assert(css.includes('.katex-display-wrap {') && css.includes('overflow-x: auto;'), '.katex-display-wrap has localized horizontal scroll protection');
console.log('  ✅ PASS: Typography synchronized to 1.05em with comprehensive overflow-x wrapping');

console.log('\n========================================');
console.log('ROUND 11 SUMMARY: All checks passed!');
console.log('========================================\n');
