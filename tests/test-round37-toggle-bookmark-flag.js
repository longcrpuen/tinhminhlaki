/**
 * Test Suite 37: 2-Way Toggle for Bookmark (Star) and Flag (Flagged Question)
 * Verified per requirements:
 * 1. db.toggleBookmark and db.toggleFlag perform true 2-way toggle (on -> off -> on).
 * 2. Icon reflects active vs inactive states clearly (⭐ vs ☆, 🚩 vs ⚑).
 * 3. Consistent across Quiz, Flashcard, and Question Bank.
 * 4. Question bank counter badges (bookmarkCount, flagCount) increment on enable, decrement on disable.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf-8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');

console.log('=== TEST SUITE 37: 2-Way Toggle for Bookmark & Flag ===\n');

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }
}

// --- 1. DB LAYER 2-WAY TOGGLE LOGIC ---
console.log('--- 1. DB Layer 2-Way Toggle Logic ---');
test('1.1: db.toggleBookmark performs reliable 2-way boolean inversion', () => {
  const match = dbJs.match(/async toggleBookmark\(cardId\)[\s\S]*?\n  \}/);
  assert(match, 'toggleBookmark method found in db.js');
  const code = match[0];
  assert(code.includes('const nextState = !current;'), 'Must negate current boolean state');
  assert(code.includes('card.isBookmarked = nextState;'), 'Must assign nextState to isBookmarked');
  assert(code.includes('card.bookmarked = nextState;'), 'Must assign nextState to bookmarked');
  assert(code.includes('await this.saveCard(card);'), 'Must persist card to DB');
});

test('1.2: db.toggleFlag performs reliable 2-way boolean inversion', () => {
  const match = dbJs.match(/async toggleFlag\(cardId\)[\s\S]*?\n  \}/);
  assert(match, 'toggleFlag method found in db.js');
  const code = match[0];
  assert(code.includes('const nextState = !current;'), 'Must negate current boolean state');
  assert(code.includes('card.isFlagged = nextState;'), 'Must assign nextState to isFlagged');
  assert(code.includes('card.flagged = nextState;'), 'Must assign nextState to flagged');
  assert(code.includes('await this.saveCard(card);'), 'Must persist card to DB');
});

// --- 2. APP STUDY ACTIONS 2-WAY TOGGLE & TOAST NOTIFICATION ---
console.log('\n--- 2. App Study Actions 2-Way Toggle & Toast ---');
test('2.1: App.toggleCurrentCardBookmark stores boolean and shows 2-way toast message', () => {
  const match = appJs.match(/async toggleCurrentCardBookmark\(\)[\s\S]*?\n  \},/);
  assert(match, 'toggleCurrentCardBookmark found');
  const code = match[0];
  assert(code.includes('Boolean(updated?.isBookmarked ?? updated?.bookmarked ?? false)'),
    'Must evaluate updated state as strict boolean');
  assert(code.includes('card.bookmarked = nextState;'), 'Must assign boolean nextState');
  assert(code.includes("nextState ? 'Đã lưu câu hỏi vào danh sách ⭐' : 'Đã bỏ lưu câu hỏi'"),
    'Must toggle toast message between saved and unsaved');
});

test('2.2: App.toggleCurrentCardFlag stores boolean and shows 2-way toast message', () => {
  const match = appJs.match(/async toggleCurrentCardFlag\(\)[\s\S]*?\n  \},/);
  assert(match, 'toggleCurrentCardFlag found');
  const code = match[0];
  assert(code.includes('Boolean(updated?.isFlagged ?? updated?.flagged ?? false)'),
    'Must evaluate updated state as strict boolean');
  assert(code.includes('card.flagged = nextState;'), 'Must assign boolean nextState');
  assert(code.includes("nextState ? 'Đã gắn cờ \"Diễn đạt chưa rõ\" 🚩' : 'Đã bỏ gắn cờ'"),
    'Must toggle toast message between flagged and unflagged');
});

// --- 3. DYNAMIC ICON DISPLAY (⭐ vs ☆, 🚩 vs ⚑) ---
console.log('\n--- 3. Dynamic Icon Display Across States ---');
test('3.1: updateStudyCardActionsUI switches icons between filled and outline states', () => {
  const match = appJs.match(/updateStudyCardActionsUI\(card\)[\s\S]*?async toggleCurrentCardBookmark/);
  assert(match, 'updateStudyCardActionsUI found');
  const code = match[0];
  assert(code.includes("btn.innerHTML = isBookmarked ? '⭐' : '☆';"),
    'Bookmark button must show filled star ⭐ when active and outline star ☆ when inactive');
  assert(code.includes("btn.innerHTML = isFlagged ? '🚩' : '⚑';"),
    'Flag button must show red flag 🚩 when active and outline flag ⚑ when inactive');
  assert(code.includes("btn.classList.toggle('active-bookmark', isBookmarked);"),
    'Bookmark button must toggle active-bookmark class');
  assert(code.includes("btn.classList.toggle('active-flag', isFlagged);"),
    'Flag button must toggle active-flag class');
});

test('3.2: updateStudyCardActionsUI synchronizes both Quiz and Flashcard action buttons', () => {
  const match = appJs.match(/updateStudyCardActionsUI\(card\)[\s\S]*?async toggleCurrentCardBookmark/);
  assert(match, 'updateStudyCardActionsUI found');
  const code = match[0];
  assert(code.includes("'btn-card-bookmark'") && code.includes("'btn-flashcard-bookmark'"),
    'Must update both quiz and flashcard bookmark buttons');
  assert(code.includes("'btn-card-flag'") && code.includes("'btn-flashcard-flag'"),
    'Must update both quiz and flashcard flag buttons');
});

// --- 4. QUESTION BANK 2-WAY TOGGLE & LIVE COUNTER UPDATES ---
console.log('\n--- 4. Question Bank 2-Way Toggle & Live Counters ---');
test('4.1: toggleBankCardBookmark and toggleBankCardFlag toggle 2-way and re-render bank', () => {
  const bMatch = appJs.match(/async toggleBankCardBookmark\(cardId\)[\s\S]*?\n  \},/);
  assert(bMatch, 'toggleBankCardBookmark found');
  assert(bMatch[0].includes("nextState ? 'Đã lưu câu hỏi ⭐' : 'Đã bỏ lưu câu hỏi'"),
    'Bank bookmark toast must toggle 2-way');
  assert(bMatch[0].includes('await this.renderQuestionBank();'),
    'Must re-render question bank to refresh counters');

  const fMatch = appJs.match(/async toggleBankCardFlag\(cardId\)[\s\S]*?\n  \},/);
  assert(fMatch, 'toggleBankCardFlag found');
  assert(fMatch[0].includes("nextState ? 'Đã gắn cờ \"Diễn đạt chưa rõ\" 🚩' : 'Đã bỏ gắn cờ'"),
    'Bank flag toast must toggle 2-way');
  assert(fMatch[0].includes('await this.renderQuestionBank();'),
    'Must re-render question bank to refresh counters');
});

test('4.2: renderQuestionBank uses strict boolean predicates for counter calculations', () => {
  const match = appJs.match(/async renderQuestionBank\(\)[\s\S]*?toggleBankTopicDropdown/);
  assert(match, 'renderQuestionBank found');
  const code = match[0];
  assert(code.includes('isCardBookmarked'), 'Must use isCardBookmarked predicate');
  assert(code.includes('isCardFlagged'), 'Must use isCardFlagged predicate');
  assert(code.includes('bCountEl.textContent = bookmarkCount;'), 'Must update bookmark counter badge');
  assert(code.includes('fCountEl.textContent = flagCount;'), 'Must update flag counter badge');
  assert(code.includes("isBookmarked ? '⭐' : '☆'"), 'Bank card item must switch star icon');
  assert(code.includes("isFlagged ? '🚩' : '⚑'"), 'Bank card item must switch flag icon');
});

// --- 5. DOM TEMPLATE INTEGRATION ---
console.log('\n--- 5. DOM Template Integration ---');
test('5.1: index.html defines bookmark and flag buttons in both Quiz and Flashcard views', () => {
  assert(indexHtml.includes('id="btn-card-bookmark"'), 'Quiz bookmark button exists');
  assert(indexHtml.includes('id="btn-card-flag"'), 'Quiz flag button exists');
  assert(indexHtml.includes('id="btn-flashcard-bookmark"'), 'Flashcard bookmark button exists');
  assert(indexHtml.includes('id="btn-flashcard-flag"'), 'Flashcard flag button exists');
});

console.log(`\n========================================`);
console.log(`TEST SUITE 37 SUMMARY: All ${passed} tests passed 100%!`);
console.log(`========================================\n`);
