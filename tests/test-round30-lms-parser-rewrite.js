const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Load parser
const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserContent = fs.readFileSync(parserPath, 'utf8');
eval(parserContent);

console.log('=== TEST ROUND 30: REWRITTEN LMS PARSER & MOODLE SPECIFICATION ===\n');

let passedTests = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// Test 0: Pure Functions Existence & Independence
// -------------------------------------------------------------
test('Pure functions cleanRawText and parseQuestions are defined and exported', () => {
  assert.strictEqual(typeof LMSParser.cleanRawText, 'function', 'cleanRawText is defined on LMSParser');
  assert.strictEqual(typeof LMSParser.parseQuestions, 'function', 'parseQuestions is defined on LMSParser');
  assert.strictEqual(typeof LMSParser.parse, 'function', 'parse is defined on LMSParser');
  assert.strictEqual(typeof LMSParser.applyBatchAnswers, 'function', 'applyBatchAnswers is defined on LMSParser');
  assert.strictEqual(typeof cleanRawText, 'function', 'cleanRawText is exported globally');
  assert.strictEqual(typeof parseQuestions, 'function', 'parseQuestions is exported globally');
});

// -------------------------------------------------------------
// Test 1: Dữ liệu chuẩn đầy đủ (Test chính Bước 3)
// -------------------------------------------------------------
const rawTest1 = `Câu hỏi 1
Hoàn thành
Đạt điểm 1,00 trên 1,00
Không gắn cờĐặt cờ
Đoạn văn câu hỏi
Câu 39 Để thực hiện thắng lợi mục tiêu đưa Việt Nam trở thành một nước công nghiệp theo hướng hiện đại, xây dựng giai cấp công nhân Việt Nam trong thời kỳ mới cần thực hiện giải pháp chủ yếu nào?
Select one:

a.
Đào tạo, bồi dưỡng, nâng cao trình đọ mọi mặt của công nhân, không ngừng chuyên môn hóa giai cấp công nhân.

b.
Nâng cao nhận thức kiên định quan điểm giai cấp công nhân là giai cấp lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản Việt Nam.

c.
Xây dựng giai cấp công nhân lớn mạnh gắn với xây dựng và phát huy sức mạnh liên minh giai cấp nông dân và đội ngũ tri thức và doanh nhân.

d.
Thực hiện chiến lược xây dựng giai cấp công nhân lớn mạnh, gắn kết chặt với chiến lược phát triển kinh tế - xã hội, công nghiệp hóa đất nước, hội nhập quốc tế.
Câu hỏi 2
Hoàn thành
Đạt điểm 0,00 trên 1,00
Đặt cờ
Đoạn văn câu hỏi
Câu 27 Đâu là điều kiện khách quan quy định sứ mệnh lịch sử của giai cấp công nhân?
Select one:

a.
Sự liên minh giai cấp giữa giai cấp công nhân với giai cấp nông dân và các tầng lớp lao động khác do giai cấp công nhân thông qua đội tiên phong của nó là Đảng Cộng sản lãnh đạo.

b.
Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng.

c.
Đảng Cộng sản là nhân tố quan trọng để giai cấp công nhân thực hiện thắng lợi sứ mệnh lịch sử của mình.

d.
Do địa vị chính trị - xã hội của giai cấp công nhân quy định`;

test('Test 1: Dữ liệu chuẩn Bước 3 - Tách đúng 2 câu hỏi, đúng 4 đáp án mỗi câu, cấu trúc output khớp mẫu', () => {
  const cleaned = cleanRawText(rawTest1);

  // Kiểm tra sạch dòng rác nhưng giữ nguyên dòng trống và mốc câu hỏi
  assert(!cleaned.includes('Hoàn thành'), 'Hoàn thành must be cleaned');
  assert(!cleaned.includes('Đạt điểm'), 'Đạt điểm must be cleaned');
  assert(!cleaned.includes('Không gắn cờĐặt cờ'), 'Cờ must be cleaned');
  assert(!cleaned.includes('Đoạn văn câu hỏi'), 'Đoạn văn câu hỏi must be cleaned');
  assert(cleaned.includes('\n\n'), 'Blank lines must be preserved in cleaned text');

  const questions = LMSParser.parse(rawTest1);
  assert.strictEqual(questions.length, 2, 'Must parse exactly 2 questions');

  // Câu 1
  const q1 = questions[0];
  assert.strictEqual(
    q1.question,
    'Để thực hiện thắng lợi mục tiêu đưa Việt Nam trở thành một nước công nghiệp theo hướng hiện đại, xây dựng giai cấp công nhân Việt Nam trong thời kỳ mới cần thực hiện giải pháp chủ yếu nào?'
  );
  assert.strictEqual(q1.options.length, 4, 'Question 1 has 4 options');
  assert.strictEqual(q1.options[0].id, 'a');
  assert.strictEqual(q1.options[0].text, 'Đào tạo, bồi dưỡng, nâng cao trình đọ mọi mặt của công nhân, không ngừng chuyên môn hóa giai cấp công nhân.');
  assert.strictEqual(q1.options[1].id, 'b');
  assert.strictEqual(q1.options[1].text, 'Nâng cao nhận thức kiên định quan điểm giai cấp công nhân là giai cấp lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản Việt Nam.');
  assert.strictEqual(q1.options[2].id, 'c');
  assert.strictEqual(q1.options[2].text, 'Xây dựng giai cấp công nhân lớn mạnh gắn với xây dựng và phát huy sức mạnh liên minh giai cấp nông dân và đội ngũ tri thức và doanh nhân.');
  assert.strictEqual(q1.options[3].id, 'd');
  assert.strictEqual(q1.options[3].text, 'Thực hiện chiến lược xây dựng giai cấp công nhân lớn mạnh, gắn kết chặt với chiến lược phát triển kinh tế - xã hội, công nghiệp hóa đất nước, hội nhập quốc tế.');
  assert.strictEqual(q1.correct_option_id, null, 'correct_option_id is null');
  assert.strictEqual(q1.explanation, '', 'explanation is empty string');
  assert.strictEqual(q1.difficulty, null, 'difficulty is null');
  assert.strictEqual(q1.needs_review, false, 'needs_review is false');

  // Câu 2
  const q2 = questions[1];
  assert.strictEqual(q2.question, 'Đâu là điều kiện khách quan quy định sứ mệnh lịch sử của giai cấp công nhân?');
  assert.strictEqual(q2.options.length, 4, 'Question 2 has 4 options');
  assert.strictEqual(q2.options[0].id, 'a');
  assert.strictEqual(q2.options[0].text, 'Sự liên minh giai cấp giữa giai cấp công nhân với giai cấp nông dân và các tầng lớp lao động khác do giai cấp công nhân thông qua đội tiên phong của nó là Đảng Cộng sản lãnh đạo.');
  assert.strictEqual(q2.options[1].id, 'b');
  assert.strictEqual(q2.options[1].text, 'Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng.');
  assert.strictEqual(q2.options[2].id, 'c');
  assert.strictEqual(q2.options[2].text, 'Đảng Cộng sản là nhân tố quan trọng để giai cấp công nhân thực hiện thắng lợi sứ mệnh lịch sử của mình.');
  assert.strictEqual(q2.options[3].id, 'd');
  assert.strictEqual(q2.options[3].text, 'Do địa vị chính trị - xã hội của giai cấp công nhân quy định');
  assert.strictEqual(q2.correct_option_id, null);
  assert.strictEqual(q2.needs_review, false);
});

// -------------------------------------------------------------
// Test 2: Biến thể điểm số (Fuzzy prefix match)
// -------------------------------------------------------------
test('Test 2: Biến thể điểm số "Đạt điểm 10,00 trên 10,00" bị loại bỏ hoàn toàn bằng tiền tố', () => {
  const rawTest2 = `Câu hỏi 1
Hoàn thành
Đạt điểm 10,00 trên 10,00
Đoạn văn câu hỏi
Hàm số nào sau đây liên tục trên R?
Select one:

a.
y = sin(x)

b.
y = tan(x)

c.
y = 1/x

d.
y = sqrt(x)`;

  const cleaned = cleanRawText(rawTest2);
  assert(!cleaned.includes('Đạt điểm 10,00 trên 10,00'), 'Score line must be removed by cleanRawText');
  assert(!cleaned.includes('Đạt điểm'), 'Prefix Đạt điểm must not exist in cleaned text');

  const questions = LMSParser.parse(rawTest2);
  assert.strictEqual(questions.length, 1);
  assert.strictEqual(questions[0].question, 'Hàm số nào sau đây liên tục trên R?');
  assert.strictEqual(questions[0].options.length, 4);
});

// -------------------------------------------------------------
// Test 3: Biến thể cờ đánh dấu
// -------------------------------------------------------------
test('Test 3: Biến thể cờ "Không gắn cờĐặt cờ" và "Đặt cờ", "Bỏ cờ", "Gỡ cờ" đều bị loại bỏ', () => {
  const rawTest3 = `Câu hỏi 1
Không gắn cờĐặt cờ
Đoạn văn câu hỏi
Câu hỏi A
Select one:
a. Lựa chọn 1
b. Lựa chọn 2

Câu hỏi 2
Đặt cờ
Đoạn văn câu hỏi
Câu hỏi B
Select one:
a. Lựa chọn 3
b. Lựa chọn 4

Câu hỏi 3
Không gắn cờBỏ cờ
Đoạn văn câu hỏi
Câu hỏi C
Select one:
a. Lựa chọn 5
b. Lựa chọn 6`;

  const cleaned = cleanRawText(rawTest3);
  assert(!cleaned.includes('Không gắn cờĐặt cờ'), 'Không gắn cờĐặt cờ removed');
  assert(!cleaned.includes('Đặt cờ'), 'Đặt cờ removed');
  assert(!cleaned.includes('Bỏ cờ'), 'Bỏ cờ removed');

  const questions = LMSParser.parse(rawTest3);
  assert.strictEqual(questions.length, 3, 'All 3 questions parsed without flag pollution');
  assert.strictEqual(questions[0].question, 'Câu hỏi A');
  assert.strictEqual(questions[1].question, 'Câu hỏi B');
  assert.strictEqual(questions[2].question, 'Câu hỏi C');
});

// -------------------------------------------------------------
// Test 4: Không có dòng trống giữa đáp án
// -------------------------------------------------------------
test('Test 4: Không có dòng trống giữa các đáp án vẫn tách đúng 4 đáp án mỗi câu', () => {
  const rawTest4 = `Câu hỏi 1
Hoàn thành
Đạt điểm 1,00 trên 1,00
Không gắn cờĐặt cờ
Đoạn văn câu hỏi
Câu 39 Để thực hiện thắng lợi mục tiêu đưa Việt Nam trở thành một nước công nghiệp?
Select one:
a.
Đào tạo, bồi dưỡng công nhân.
b.
Nâng cao nhận thức kiên định.
c.
Xây dựng giai cấp công nhân.
d.
Thực hiện chiến lược xây dựng.`;

  const questions = LMSParser.parse(rawTest4);
  assert.strictEqual(questions.length, 1);
  assert.strictEqual(questions[0].options.length, 4, 'Must have 4 options even without empty lines');
  assert.strictEqual(questions[0].options[0].id, 'a');
  assert.strictEqual(questions[0].options[0].text, 'Đào tạo, bồi dưỡng công nhân.');
  assert.strictEqual(questions[0].options[1].id, 'b');
  assert.strictEqual(questions[0].options[1].text, 'Nâng cao nhận thức kiên định.');
  assert.strictEqual(questions[0].options[2].id, 'c');
  assert.strictEqual(questions[0].options[2].text, 'Xây dựng giai cấp công nhân.');
  assert.strictEqual(questions[0].options[3].id, 'd');
  assert.strictEqual(questions[0].options[3].text, 'Thực hiện chiến lược xây dựng.');
});

// -------------------------------------------------------------
// Test 5: Đáp án cùng 1 dòng (inline fallback)
// -------------------------------------------------------------
test('Test 5: Đáp án cùng 1 dòng (a. Nội dung) tách đúng 1 câu hỏi, 4 đáp án', () => {
  const rawTest5 = `Câu hỏi 1
Đoạn văn câu hỏi
Hệ điều hành là gì?
Select one:
a. Phần mềm hệ thống
b. Trình duyệt web
c. Phần cứng máy tính
d. Thiết bị ngoại vi`;

  const questions = LMSParser.parse(rawTest5);
  assert.strictEqual(questions.length, 1);
  assert.strictEqual(questions[0].question, 'Hệ điều hành là gì?');
  assert.strictEqual(questions[0].options.length, 4);
  assert.strictEqual(questions[0].options[0].id, 'a');
  assert.strictEqual(questions[0].options[0].text, 'Phần mềm hệ thống');
  assert.strictEqual(questions[0].options[1].id, 'b');
  assert.strictEqual(questions[0].options[1].text, 'Trình duyệt web');
  assert.strictEqual(questions[0].options[2].id, 'c');
  assert.strictEqual(questions[0].options[2].text, 'Phần cứng máy tính');
  assert.strictEqual(questions[0].options[3].id, 'd');
  assert.strictEqual(questions[0].options[3].text, 'Thiết bị ngoại vi');
});

// -------------------------------------------------------------
// Test 6: Select one or more: (Nhiều đáp án đúng)
// -------------------------------------------------------------
test('Test 6: Select one or more: gắn cờ needs_review: true, không tự chọn đáp án đúng', () => {
  const rawTest6 = `Câu hỏi 1
Đoạn văn câu hỏi
Các giao thức nào sau đây thuộc tầng Giao vận?
Select one or more:
a. TCP
b. UDP
c. HTTP
d. IP`;

  const questions = LMSParser.parse(rawTest6);
  assert.strictEqual(questions.length, 1);
  assert.strictEqual(questions[0].question, 'Các giao thức nào sau đây thuộc tầng Giao vận?');
  assert.strictEqual(questions[0].options.length, 4);
  assert.strictEqual(questions[0].needs_review, true, 'needs_review must be true for Select one or more');
  assert.strictEqual(questions[0].needsReview, true, 'needsReview alias must be true');
  assert.strictEqual(questions[0].correct_option_id, null, 'correct_option_id must be null');
});

// -------------------------------------------------------------
// Test 7: Batch Key Assignment
// -------------------------------------------------------------
test('Test 7: applyBatchAnswers gán chính xác theo chuỗi b, a, c, d', () => {
  const cards = [
    { type: 'multiple_choice', options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    { type: 'multiple_choice', options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    { type: 'numeric', options: [] },
    { type: 'multiple_choice', options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }
  ];

  const assigned = LMSParser.applyBatchAnswers(cards, 'b, a, c');
  assert.strictEqual(assigned, 3, 'Assigned 3 cards');
  assert.strictEqual(cards[0].correct_option_id, 'b');
  assert.strictEqual(cards[0].answerIndex, 1);
  assert.strictEqual(cards[1].correct_option_id, 'a');
  assert.strictEqual(cards[1].answerIndex, 0);
  assert.strictEqual(cards[3].correct_option_id, 'c');
  assert.strictEqual(cards[3].answerIndex, 2);
});

// -------------------------------------------------------------
// Test 8: Placeholder & Sample Data matching Bước 3
// -------------------------------------------------------------
test('Test 8: index.html textarea placeholder and app.js pasteLmsSampleData contain Step 3 sample format', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  assert(indexHtml.includes('Câu 39 Để thực hiện thắng lợi mục tiêu'), 'index.html placeholder updated with Step 3 text');
  assert(indexHtml.includes('a.\nĐào tạo, bồi dưỡng') || indexHtml.includes('a.&#10;Đào tạo') || indexHtml.includes('a.\r\nĐào tạo'), 'index.html placeholder uses standalone letter format');
  assert(appJs.includes('Câu 39 Để thực hiện thắng lợi mục tiêu'), 'app.js sample data updated with Step 3 text');
  assert(appJs.includes('Câu 27 Đâu là điều kiện khách quan'), 'app.js sample data has second question with 0,00 points');
});

// -------------------------------------------------------------
// Test 9: Logging on failure
// -------------------------------------------------------------
test('Test 9: LMSParser logs clear warning on failure and does not crash', () => {
  let warned = false;
  const originalWarn = console.warn;
  console.warn = (...args) => {
    warned = true;
    originalWarn(...args);
  };

  const emptyResult = LMSParser.parse('');
  console.warn = originalWarn;

  assert.strictEqual(emptyResult.length, 0);
  assert.strictEqual(warned, true, 'console.warn must be called when input is empty');
});

// -------------------------------------------------------------
// Test 10: App UI Preview Methods & Difficulty Selection
// -------------------------------------------------------------
test('Test 10: app.js implements onLmsDifficultyChange and preview with difficulty dropdown', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  assert(appJs.includes('onLmsDifficultyChange(cardIdx, val)'), 'app.js implements onLmsDifficultyChange');
  assert(appJs.includes('class="form-control lms-difficulty-select"'), 'renderLmsPreview renders lms-difficulty-select');
  assert(appJs.includes('App.onLmsDifficultyChange(${idx}, this.value)'), 'difficulty select binds to onLmsDifficultyChange');
  assert(appJs.includes('badge-review-flag'), 'renderLmsPreview renders badge-review-flag for needsReview questions');
  assert(appJs.includes('const questions = Array.isArray(parsed) ? parsed : (parsed?.questions || []);'), 'parseLmsInput handles array return and parsed.questions');
});

console.log(`\n========================================`);
console.log(`ALL TESTS PASSED: ${passedTests} test suites verified!`);
console.log(`========================================\n`);
