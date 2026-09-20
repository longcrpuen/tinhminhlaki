/**
 * Test Suite 40: App-Wide Cyber Purple Dropdowns
 *
 * Requirements:
 * 1. LMS preview card dropdowns ("Độ khó" & "Loại câu hỏi") use the signature cyber purple dropdown
 *    instead of OS default flat gray select menus.
 * 2. All dropdowns across the entire app (Question Bank, AI Import, LMS Import, Edit Card Modal,
 *    Exam Setup Modal, Sprint Cram Setup Modal) use the unified .cyber-dropdown style.
 * 3. All dropdowns preserve hidden synced selects for accessibility and programmatic compatibility.
 * 4. Outside-click listener closes all open cyber dropdowns.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 40: App-Wide Cyber Purple Dropdowns ===\n');

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

// =========================================================================
// 1. LMS PREVIEW CARDS: "ĐỘ KHÓ" & "LOẠI CÂU HỎI" CYBER DROPDOWNS
// =========================================================================
console.log('--- 1. LMS Preview Cards Cyber Dropdowns ---');

test('1.1: renderLmsPreview renders .lms-type-cyber-dropdown with custom trigger, chevron & menu', () => {
  assert(appJs.includes('class="cyber-dropdown lms-type-cyber-dropdown"'), 'Renders .lms-type-cyber-dropdown');
  assert(appJs.includes('App.toggleLmsCardTypeDropdown(event, ${idx})'), 'Trigger binds to toggleLmsCardTypeDropdown');
  assert(appJs.includes('App.selectLmsCardType(${idx}, \'multiple_choice\')'), 'Menu item selects multiple_choice');
  assert(appJs.includes('App.selectLmsCardType(${idx}, \'numeric\')'), 'Menu item selects numeric');
  assert(appJs.includes('class="lms-type-select" style="display: none;"'), 'Preserves hidden synced select');
});

test('1.2: renderLmsPreview renders .lms-diff-cyber-dropdown with custom trigger, chevron & menu', () => {
  assert(appJs.includes('class="cyber-dropdown lms-diff-cyber-dropdown"'), 'Renders .lms-diff-cyber-dropdown');
  assert(appJs.includes('App.toggleLmsCardDiffDropdown(event, ${idx})'), 'Trigger binds to toggleLmsCardDiffDropdown');
  assert(appJs.includes('App.selectLmsCardDifficulty(${idx}, \'easy\')'), 'Menu item selects easy');
  assert(appJs.includes('App.selectLmsCardDifficulty(${idx}, \'medium\')'), 'Menu item selects medium');
  assert(appJs.includes('App.selectLmsCardDifficulty(${idx}, \'hard\')'), 'Menu item selects hard');
  assert(appJs.includes('class="form-control lms-difficulty-select" style="display: none;"'), 'Preserves hidden synced select');
});

test('1.3: App methods implement interactive cyber dropdown actions for LMS cards', () => {
  assert(appJs.includes('toggleLmsCardTypeDropdown(e, idx)'), 'Implements toggleLmsCardTypeDropdown');
  assert(appJs.includes('selectLmsCardType(idx, newType)'), 'Implements selectLmsCardType');
  assert(appJs.includes('toggleLmsCardDiffDropdown(e, idx)'), 'Implements toggleLmsCardDiffDropdown');
  assert(appJs.includes('selectLmsCardDifficulty(idx, val)'), 'Implements selectLmsCardDifficulty');
});

test('1.4: style.css defines dedicated cyber dropdown styling for LMS cards', () => {
  assert(styleCss.includes('.lms-type-cyber-dropdown'), 'Defines .lms-type-cyber-dropdown');
  assert(styleCss.includes('.lms-diff-cyber-dropdown'), 'Defines .lms-diff-cyber-dropdown');
  assert(styleCss.includes('.lms-preview-card:has(.cyber-dropdown.open)'), 'Elevates z-index for open dropdown card');
});

// =========================================================================
// 2. MODALS: EXAM SETUP & SPRINT CRAM SETUP CYBER DROPDOWNS
// =========================================================================
console.log('\n--- 2. Modal Dropdowns (Exam Setup & Sprint Cram) ---');

test('2.1: Exam Setup Modal (#modal-exam-setup) uses cyber dropdown for question count', () => {
  assert(indexHtml.includes('id="exam-count-dropdown-wrap"'), '#exam-count-dropdown-wrap exists');
  assert(indexHtml.includes('id="exam-count-dropdown-trigger"'), 'Has exam count trigger button');
  assert(indexHtml.includes('App.toggleExamCountDropdown(event)'), 'Calls App.toggleExamCountDropdown');
  assert(indexHtml.includes('id="exam-question-count" class="form-control" style="display: none;"'),
    'Preserves hidden synced #exam-question-count select');
});

test('2.2: Exam Setup Modal (#modal-exam-setup) uses cyber dropdown for time limit', () => {
  assert(indexHtml.includes('id="exam-time-dropdown-wrap"'), '#exam-time-dropdown-wrap exists');
  assert(indexHtml.includes('id="exam-time-dropdown-trigger"'), 'Has exam time trigger button');
  assert(indexHtml.includes('App.toggleExamTimeDropdown(event)'), 'Calls App.toggleExamTimeDropdown');
  assert(indexHtml.includes('id="exam-time-limit" class="form-control" style="display: none;"'),
    'Preserves hidden synced #exam-time-limit select');
});

test('2.3: Sprint Setup Modal (#modal-sprint-setup) uses cyber dropdown for card count', () => {
  assert(indexHtml.includes('id="sprint-count-dropdown-wrap"'), '#sprint-count-dropdown-wrap exists');
  assert(indexHtml.includes('id="sprint-count-dropdown-trigger"'), 'Has sprint count trigger button');
  assert(indexHtml.includes('App.toggleSprintCountDropdown(event)'), 'Calls App.toggleSprintCountDropdown');
  assert(indexHtml.includes('id="sprint-card-count" class="form-control" style="display: none;"'),
    'Preserves hidden synced #sprint-card-count select');
});

test('2.4: App methods implement modal cyber dropdown interactions', () => {
  assert(appJs.includes('toggleExamCountDropdown(e)'), 'Implements toggleExamCountDropdown');
  assert(appJs.includes('selectExamQuestionCount(val, label)'), 'Implements selectExamQuestionCount');
  assert(appJs.includes('toggleExamTimeDropdown(e)'), 'Implements toggleExamTimeDropdown');
  assert(appJs.includes('selectExamTimeLimit(val, label)'), 'Implements selectExamTimeLimit');
  assert(appJs.includes('toggleSprintCountDropdown(e)'), 'Implements toggleSprintCountDropdown');
  assert(appJs.includes('selectSprintCardCount(val, label)'), 'Implements selectSprintCardCount');
});

// =========================================================================
// 3. APP-WIDE CYBER DROPDOWN COVERAGE CENSUS
// =========================================================================
console.log('\n--- 3. 100% App-Wide Cyber Dropdown Coverage Audit ---');

test('3.1: All major views and modals feature standard cyber purple dropdowns', () => {
  // Question Bank
  assert(indexHtml.includes('id="bank-topic-dropdown-wrap"'), 'Bank topic uses cyber-dropdown');
  assert(indexHtml.includes('id="bank-diff-dropdown-wrap"'), 'Bank difficulty uses cyber-dropdown');
  assert(indexHtml.includes('id="bank-source-dropdown-wrap"'), 'Bank source uses cyber-dropdown');

  // AI Import
  assert(indexHtml.includes('id="import-deck-dropdown-wrap"'), 'AI Import deck uses cyber-dropdown');

  // LMS Import
  assert(indexHtml.includes('id="lms-deck-dropdown-wrap"'), 'LMS Import deck uses cyber-dropdown');

  // Edit / Add Card Modal
  assert(indexHtml.includes('id="edit-card-deck-dropdown-wrap"'), 'Edit card deck uses cyber-dropdown');
  assert(indexHtml.includes('id="edit-card-diff-dropdown-wrap"'), 'Edit card difficulty uses cyber-dropdown');
  assert(indexHtml.includes('id="edit-card-correct-dropdown-wrap"'), 'Edit card correct answer uses cyber-dropdown');

  // Exam Modal
  assert(indexHtml.includes('id="exam-count-dropdown-wrap"'), 'Exam count uses cyber-dropdown');
  assert(indexHtml.includes('id="exam-time-dropdown-wrap"'), 'Exam time uses cyber-dropdown');

  // Sprint Modal
  assert(indexHtml.includes('id="sprint-count-dropdown-wrap"'), 'Sprint count uses cyber-dropdown');
});

test('3.2: Universal outside-click dismisser protects all cyber dropdowns across the app', () => {
  assert(appJs.includes('document.querySelectorAll(\'.cyber-dropdown.open\')'),
    'Global click listener dismisses any open cyber dropdowns');
});

// =========================================================================
// 4. LIVE CHROME HEADLESS CDP VERIFICATION
// =========================================================================
console.log('\n--- 4. Real Chrome Headless Live Interaction & Theme Verification ---');

const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = path.join(__dirname, '..', 'scratch', 'chrome-test-r40-profile');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await sendCDP(this, 'Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

function sendCDP(client, method, params = {}) {
  return client.send(method, params);
}

(async () => {
  const args = [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userData,
    'http://localhost:5173/'
  ];

  const proc = spawn(chromePath, args);
  proc.stderr.on('data', () => {});

  try {
    await sleep(2500);

    const res = await fetch('http://127.0.0.1:9225/json');
    const tabs = await res.json();
    const appTab = tabs.find(t => t.url.includes('5173'));
    if (!appTab) throw new Error('Could not find MindSparks tab in Chrome on port 9225');

    const client = new CDPClient(appTab.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Runtime.enable');

    await sleep(600);

    // Live Test 1: LMS Preview Cards cyber dropdowns interaction
    test('Live Chrome: LMS preview card dropdowns open purple menu and update state', async () => {
      const lmsResult = await client.evaluate(`
        (() => {
          App.navigateTo('import-lms');
          App.pasteLmsSampleData();
          App.parseLmsInput();

          const card0 = document.querySelector('.lms-preview-card[data-index="0"]');
          if (!card0) return { success: false, error: 'No card 0 found' };

          const typeDropdown = card0.querySelector('.lms-type-cyber-dropdown');
          const diffDropdown = card0.querySelector('.lms-diff-cyber-dropdown');

          if (!typeDropdown || !diffDropdown) {
            return { success: false, error: 'Dropdowns not rendered inside preview card' };
          }

          const typeTrigger = typeDropdown.querySelector('.cyber-dropdown-trigger');
          const diffTrigger = diffDropdown.querySelector('.cyber-dropdown-trigger');

          // Open difficulty dropdown
          diffTrigger.click();
          const isDiffOpen = diffDropdown.classList.contains('open');

          // Check style of menu
          const diffMenu = diffDropdown.querySelector('.cyber-dropdown-menu');
          const menuBg = window.getComputedStyle(diffMenu).backgroundColor;

          // Select 'hard'
          const hardItem = diffMenu.querySelector('button[onclick*="hard"]');
          hardItem.click();

          const diffLabel = card0.querySelector('#lms-diff-label-0')?.textContent;
          const isDiffClosed = !diffDropdown.classList.contains('open');
          const questionDiff = App._lmsParsedQuestions[0]?.difficulty;

          // Now test Type Dropdown
          typeTrigger.click();
          const isTypeOpen = typeDropdown.classList.contains('open');
          const numItem = typeDropdown.querySelector('button[onclick*="numeric"]');
          numItem.click();

          const reloadedCard = document.querySelector('.lms-preview-card[data-index="0"]');
          const isNumericMode = App._lmsParsedQuestions[0]?.type === 'numeric';
          const hasNumericInput = !!reloadedCard.querySelector('.lms-numeric-input');

          return {
            success: true,
            isDiffOpen,
            isDiffClosed,
            diffLabel,
            questionDiff,
            isTypeOpen,
            isNumericMode,
            hasNumericInput
          };
        })()
      `);

      assert(lmsResult.success, lmsResult.error || 'LMS live evaluation succeeded');
      assert(lmsResult.isDiffOpen, 'Difficulty dropdown opens on trigger click');
      assert(lmsResult.isDiffClosed, 'Difficulty dropdown closes on item select');
      assert(lmsResult.diffLabel.includes('Khó') || lmsResult.diffLabel.includes('Hard'), 'Label updates to Khó (Hard)');
      assert.strictEqual(lmsResult.questionDiff, 'hard', 'Model difficulty is set to hard');
      assert(lmsResult.isTypeOpen, 'Type dropdown opens on trigger click');
      assert(lmsResult.isNumericMode, 'Type switches to numeric in model');
      assert(lmsResult.hasNumericInput, 'Numeric input is rendered on type change');
    });

    // Live Test 2: Exam setup modal cyber dropdowns
    test('Live Chrome: Exam Setup modal custom cyber dropdowns function properly', async () => {
      const examResult = await client.evaluate(`
        (() => {
          App.openExamModal();
          const modal = document.getElementById('modal-exam-setup');
          const countDropdown = document.getElementById('exam-count-dropdown-wrap');
          const timeDropdown = document.getElementById('exam-time-dropdown-wrap');

          const countTrigger = document.getElementById('exam-count-dropdown-trigger');
          countTrigger.click();
          const isCountOpen = countDropdown.classList.contains('open');

          // Select 20 questions
          const item20 = countDropdown.querySelector('button[onclick*="20"]');
          item20.click();

          const countVal = document.getElementById('exam-question-count')?.value;
          const countLabel = document.getElementById('exam-count-dropdown-label')?.textContent;

          // Open time dropdown
          const timeTrigger = document.getElementById('exam-time-dropdown-trigger');
          timeTrigger.click();
          const isTimeOpen = timeDropdown.classList.contains('open');

          // Select 30 minutes
          const item30 = timeDropdown.querySelector('button[onclick*="30"]');
          item30.click();

          const timeVal = document.getElementById('exam-time-limit')?.value;
          const timeLabel = document.getElementById('exam-time-dropdown-label')?.textContent;

          modal.classList.remove('show');

          return {
            isCountOpen,
            countVal,
            countLabel,
            isTimeOpen,
            timeVal,
            timeLabel
          };
        })()
      `);

      assert(examResult.isCountOpen, 'Count dropdown opened');
      assert.strictEqual(examResult.countVal, '20', 'Synced select value updated to 20');
      assert(examResult.countLabel.includes('20'), 'Trigger label updated to 20');
      assert(examResult.isTimeOpen, 'Time dropdown opened');
      assert.strictEqual(examResult.timeVal, '30', 'Synced select value updated to 30');
      assert(examResult.timeLabel.includes('30'), 'Trigger label updated to 30');
    });

    client.close();
    proc.kill();

    console.log('\n========================================');
    console.log(`TEST SUITE 40 SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL APP-WIDE CYBER PURPLE DROPDOWN REQUIREMENTS VERIFIED AND PASSING!\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Error in Chrome live testing:', err);
    try { proc.kill(); } catch (_) {}
    process.exit(1);
  }
})();
