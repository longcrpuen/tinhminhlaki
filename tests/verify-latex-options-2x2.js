const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9229;
const TEST_PORT = 5183;
const USER_DATA_DIR = path.join(__dirname, '..', 'scratch', 'chrome-latex-options-profile');

let chromeProcess = null;
let serverProcess = null;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🧪 Starting Verification: LaTeX Options 2x2 Grid & Adaptive Layout...\n');

  // Build first
  console.log('📦 Rebuilding production assets...');
  const { execSync } = require('child_process');
  execSync('npm run build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });

  // 1. Launch server on TEST_PORT serving dist/
  console.log(`\n📡 Launching server on port ${TEST_PORT} serving dist/...`);
  serverProcess = spawn('node', ['server.js', 'dist', String(TEST_PORT)], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'ignore'
  });
  await sleep(1500);

  // 2. Launch Chrome Headless
  console.log(`🌐 Launching Chrome Headless on CDP port ${CDP_PORT}...`);
  chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1280,900',
    `http://localhost:${TEST_PORT}/`
  ]);
  await sleep(2500);

  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const tabs = await res.json();
  const targetTab = tabs.find(t => t.type === 'page') || tabs[0];
  assert(targetTab, 'Chrome tab must be available');

  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value !== undefined ? a.value : JSON.stringify(a.preview || a)).join(' ');
        if (text.includes('[DEBUG')) console.log('  [CHROME]', text);
      }
    } catch (_) {}
  });

  let passed = 0;
  let failed = 0;
  function check(label, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label} ${extra}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Question "Khái niệm ràng buộc tích cực" in Quiz View
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Quiz Taking View - Question "Khái niệm ràng buộc tích cực" ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(500);

  const quizResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      // Find or seed active constraint card
      const allDecks = await db.getAllDecks();
      const allCards = await db.getAllCards();
      let targetCard = allCards.find(c => c.topic && c.topic.includes('ràng buộc tích cực'));
      if (!targetCard) {
        targetCard = {
          id: 'test_card_rb_' + Date.now(),
          deckId: allDecks[0]?.id || 'default_deck',
          topic: 'Khái niệm ràng buộc tích cực',
          difficulty: 'medium',
          question: 'Một ràng buộc bất đẳng thức $g_i(x) \\\\le 0$ được gọi là **ràng buộc tích cực (active constraint)** khi nào?',
          options: [
            { id: 'a', text: '$g_i(x^*) = 0$' },
            { id: 'b', text: '$g_i(x^*) < 0$' },
            { id: 'c', text: '$g_i(x^*) > 0$' },
            { id: 'd', text: '\\\\nabla g_i(x^*) = 0$' }
          ],
          correct_option_id: 'a',
          answerIndex: 0,
          explanation: 'Ràng buộc tích cực khi dấu bằng xảy ra.',
          type: 'multiple_choice'
        };
        await db.saveCard(targetCard);
      }

      // Start quiz session with target card as current card
      App.activeSession = {
        deckId: targetCard.deckId,
        mode: 'free',
        title: 'Test Quiz Session',
        cards: [targetCard],
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        blindMode: false,
        blindRevealed: true,
        userAnswers: {},
        answeredList: []
      };

      App.navigateTo('study');
      App.renderActiveStudyCard();
      await new Promise(r => setTimeout(r, 400));

      const container = document.getElementById('quiz-options-container');
      const cardEl = document.querySelector('#study-quiz-area .quiz-card');
      const buttons = Array.from(container.querySelectorAll('.quiz-option-btn'));

      const containerStyle = window.getComputedStyle(container);
      const containerRect = container.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();

      const btnRects = buttons.map(b => {
        const r = b.getBoundingClientRect();
        return {
          text: b.textContent.trim(),
          top: r.top,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          insideCard: r.right <= cardRect.right + 2 && r.left >= cardRect.left - 2
        };
      });

      return {
        display: containerStyle.display,
        gridTemplateColumns: containerStyle.gridTemplateColumns,
        buttonsCount: buttons.length,
        btnRects,
        containerRect: { width: containerRect.width, height: containerRect.height },
        cardRect: { width: cardRect.width, right: cardRect.right }
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });

  const qVal = quizResult.result.value || {};
  check('Container uses display: grid', qVal.display === 'grid');
  check('Container has 4 option buttons (A, B, C, D)', qVal.buttonsCount === 4);

  // Check 2x2 grid layout: 2 buttons on row 1, 2 buttons on row 2
  const rects = qVal.btnRects || [];
  if (rects.length === 4) {
    const row1_A = rects[0];
    const row1_B = rects[1];
    const row2_C = rects[2];
    const row2_D = rects[3];

    const isRow1SameY = Math.abs(row1_A.top - row1_B.top) < 10;
    const isRow2SameY = Math.abs(row2_C.top - row2_D.top) < 10;
    const isRow2BelowRow1 = row2_C.top > row1_A.top + 20;
    const isBToRightOfA = row1_B.left > row1_A.left + 50;

    check('Option A and B are side-by-side on Row 1 (2x2 grid)', isRow1SameY && isBToRightOfA);
    check('Option C and D are side-by-side on Row 2 (2x2 grid)', isRow2SameY);
    check('Row 2 is below Row 1', isRow2BelowRow1);

    // CRITICAL: Option D must be fully inside card and visible, NOT pushed off screen
    check('Option D is 100% inside card boundaries (not pushed off or lost)', row2_D.insideCard);
    check('Option D has non-zero width and height', row2_D.width > 50 && row2_D.height > 30);
  } else {
    check('Four options detected for 2x2 grid test', false, `Got ${rects.length} buttons`);
  }

  // -------------------------------------------------------------
  // TEST 2: Question with Extra-Long Formula (Adaptive Layout)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Adaptive Sizing for Question with Long LaTeX Formula ---');
  const longMathResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const longCard = {
        id: 'test_card_long_' + Date.now(),
        deckId: 'default_deck',
        topic: 'Điều kiện KKT phức tạp',
        difficulty: 'hard',
        question: 'Điều kiện bù trượt bậc cao dạng ma trận:',
        options: [
          { id: 'a', text: '$\\\\sum_{i=1}^m \\\\lambda_i \\\\nabla g_i(x^*) + \\\\sum_{j=1}^p \\\\mu_j \\\\nabla h_j(x^*) + \\\\nabla f_0(x^*) = 0 \\\\text{ với mọi } i \\in \\{1,\\dots,m\\}, \\\\lambda_i \\\\ge 0$' },
          { id: 'b', text: '$\\\\sum_{i=1}^m \\\\lambda_i \\\\nabla g_i(x^*) - \\\\sum_{j=1}^p \\\\mu_j \\\\nabla h_j(x^*) = 0 \\\\text{ với } \\\\lambda_i \\\\le 0$' },
          { id: 'c', text: '$\\\\nabla f(x^*) + \\\\sum_{i=1}^m \\\\lambda_i \\\\nabla g_i(x^*) = 0 \\\\text{ với } \\\\lambda_i \\\\ge 0$' },
          { id: 'd', text: '$\\\\nabla f(x^*) - \\\\sum_{i=1}^m \\\\lambda_i \\\\nabla g_i(x^*) = 0 \\\\text{ với } \\\\lambda_i \\\\le 0$' }
        ],
        correct_option_id: 'a',
        answerIndex: 0,
        explanation: 'Hệ điều kiện KKT mở rộng.',
        type: 'multiple_choice'
      };

      App.activeSession = {
        deckId: 'default_deck',
        mode: 'free',
        title: 'Long Math Test',
        cards: [longCard],
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        blindMode: false,
        blindRevealed: true,
        userAnswers: {},
        answeredList: []
      };

      App.renderActiveStudyCard();
      await new Promise(r => setTimeout(r, 400));

      const container = document.getElementById('quiz-options-container');
      const cardEl = document.querySelector('#study-quiz-area .quiz-card');
      const buttons = Array.from(container.querySelectorAll('.quiz-option-btn'));

      const isSingleCol = container.classList.contains('layout-single-column');
      const hasScaledDown = container.querySelectorAll('.katex-scaled-down').length > 0;
      const cardRect = cardEl.getBoundingClientRect();

      const allVisibleInsideCard = buttons.every(b => {
        const r = b.getBoundingClientRect();
        return r.right <= cardRect.right + 2 && r.left >= cardRect.left - 2;
      });

      return {
        buttonsCount: buttons.length,
        isSingleCol,
        hasScaledDown,
        allVisibleInsideCard,
        measurements: buttons.map(b => {
          const wrap = b.querySelector('.katex-inline-wrap');
          const katex = b.querySelector('.katex');
          const html = b.querySelector('.katex-html');
          const content = b.querySelector('.quiz-option-content');
          return {
            text: b.textContent.trim().substring(0, 30),
            btnWidth: b.clientWidth,
            contentClient: content?.clientWidth,
            contentScroll: content?.scrollWidth,
            wrapClient: wrap?.clientWidth,
            wrapScroll: wrap?.scrollWidth,
            katexClient: katex?.clientWidth,
            katexScroll: katex?.scrollWidth,
            htmlClient: html?.clientWidth,
            htmlScroll: html?.scrollWidth
          };
        })
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });

  const lVal = longMathResult.result.value || {};
  check('Long formula question renders all 4 option buttons', lVal.buttonsCount === 4);
  check('Adaptive engine activates for long formula (either scaled font or single column fallback)', lVal.isSingleCol || lVal.hasScaledDown);
  check('All 4 buttons are 100% visible inside card boundaries (zero clipping/loss)', lVal.allVisibleInsideCard);

  // -------------------------------------------------------------
  // TEST 3: Question Bank View (2x2 Grid)
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Question Bank View 2x2 Grid ---');
  const bankResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      App.navigateTo('bank');
      await new Promise(r => setTimeout(r, 400));

      const firstGrid = document.querySelector('.bank-card-options-grid');
      if (!firstGrid) return { error: 'No bank-card-options-grid found' };

      const style = window.getComputedStyle(firstGrid);
      const cells = Array.from(firstGrid.children);

      const cellRects = cells.map(c => {
        const r = c.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      });

      return {
        display: style.display,
        cellsCount: cells.length,
        cellRects
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });

  const bVal = bankResult.result.value || {};
  check('Bank view options container has display: grid', bVal.display === 'grid');
  check('Bank card displays 4 option cells', bVal.cellsCount === 4);
  if (bVal.cellRects && bVal.cellRects.length === 4) {
    const b0 = bVal.cellRects[0];
    const b1 = bVal.cellRects[1];
    const isRow1SideBySide = Math.abs(b0.top - b1.top) < 10 && b1.left > b0.left + 50;
    check('Bank card options are in 2x2 grid (side-by-side columns)', isRow1SideBySide);
  }

  // -------------------------------------------------------------
  // TEST 4: Exam View (2x2 Grid)
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Exam View 2x2 Grid ---');
  const examResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const decks = await db.getAllDecks();
      if (!decks.length) return { error: 'No decks' };

      App.currentDeckIdForExam = decks[0].id;
      await App.startExamFromModal();
      const allDeckCards = await db.getCardsByDeck(decks[0].id);
      const stdCard = allDeckCards.find(c => c.topic && (c.topic.includes('Đạo hàm') || c.topic.includes('ràng buộc tích cực'))) || allDeckCards[0];
      App.activeSession.cards[0] = stdCard;
      App.renderExamQuestion(0);
      await new Promise(r => setTimeout(r, 400));

      const optContainer = document.getElementById('exam-options-container');
      const style = window.getComputedStyle(optContainer);
      const buttons = Array.from(optContainer.querySelectorAll('.quiz-option-btn'));

      const btnRects = buttons.map(b => {
        const r = b.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      });

      return {
        display: style.display,
        buttonsCount: buttons.length,
        btnRects
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });

  const eVal = examResult.result.value || {};
  check('Exam view options container has display: grid', eVal.display === 'grid');
  check('Exam view displays 4 option buttons', eVal.buttonsCount === 4);
  if (eVal.btnRects && eVal.btnRects.length === 4) {
    const e0 = eVal.btnRects[0];
    const e1 = eVal.btnRects[1];
    const isRow1SideBySide = Math.abs(e0.top - e1.top) < 10 && e1.left > e0.left + 50;
    check('Exam view options are in 2x2 grid (side-by-side columns)', isRow1SideBySide);
  }

  // -------------------------------------------------------------
  // TEST 5: Mobile Viewport 375x667 Responsive Stacking
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Mobile Viewport 375x667 Responsive Stacking ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(400);

  const mobileResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const allCards = await db.getAllCards();
      const card = allCards[0];
      App.activeSession = {
        deckId: card.deckId,
        mode: 'free',
        title: 'Mobile Test',
        cards: [card],
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        blindMode: false,
        blindRevealed: true,
        userAnswers: {},
        answeredList: []
      };

      App.navigateTo('study');
      App.renderActiveStudyCard();
      await new Promise(r => setTimeout(r, 400));

      const container = document.getElementById('quiz-options-container');
      const buttons = Array.from(container.querySelectorAll('.quiz-option-btn'));
      const quizCard = document.querySelector('#study-quiz-area .quiz-card');
      const cardRect = quizCard.getBoundingClientRect();

      const allVertical = buttons.every((b, idx) => {
        if (idx === 0) return true;
        return b.getBoundingClientRect().top > buttons[idx - 1].getBoundingClientRect().top + 20;
      });

      const zeroOverflow = buttons.every(b => {
        const r = b.getBoundingClientRect();
        return r.right <= cardRect.right + 2;
      });

      return {
        buttonsCount: buttons.length,
        allVertical,
        zeroOverflow
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });

  const mVal = mobileResult.result.value || {};
  check('Mobile view displays all 4 buttons', mVal.buttonsCount === 4);
  check('Mobile view options stack vertically (1 column)', mVal.allVertical);
  check('Mobile view options have 0px overflow beyond card', mVal.zeroOverflow);

  // Clean up
  ws.close();
  if (chromeProcess) chromeProcess.kill();
  if (serverProcess) serverProcess.kill();

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error during verification:', err);
  if (chromeProcess) chromeProcess.kill();
  if (serverProcess) serverProcess.kill();
  process.exit(1);
});
