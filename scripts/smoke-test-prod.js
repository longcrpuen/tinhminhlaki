/**
 * Comprehensive Smoke Test for MindSparks Production Build (dist/)
 * Tests all required user flows against http://localhost:5178/ (serving dist/)
 */

const http = require('http');
const path = require('path');
const assert = require('assert');
const { spawn } = require('child_process');

console.log('🧪 Starting Smoke Test on Production Build (dist/)...\n');

const PROD_PORT = 5178;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, '..', 'scratch', 'chrome-smoke-prod-profile');

let passedCount = 0;
let failedCount = 0;

function check(title, condition, extraInfo = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${title}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${title} ${extraInfo}`);
    failedCount++;
  }
}

async function main() {
  // 1. Start Server serving dist/
  console.log(`📡 Launching server on port ${PROD_PORT} serving dist/...`);
  const serverProcess = spawn('node', ['server.js', 'dist', String(PROD_PORT)], {
    cwd: path.resolve(__dirname, '..')
  });

  await new Promise(r => setTimeout(r, 1500));

  // 2. Launch Chrome Headless
  console.log('🌐 Launching Chrome Headless with remote debugging on port 9225...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--remote-debugging-port=9225',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1280,900',
    `http://localhost:${PROD_PORT}/`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const httpGet = (url) => new Promise((resolve, reject) => {
      http.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const targets = await httpGet('http://localhost:9225/json');
    const pageTarget = targets.find(t => t.type === 'page');
    assert(pageTarget, 'Page target must be available in Chrome');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === msgId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    const consoleErrors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text || 'Unknown Exception');
      }
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
        consoleErrors.push(msg.params.entry.text);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    await new Promise(r => setTimeout(r, 1200));

    console.log('\n--- Test 1: Navigation Tabs (7 Core Views) ---');
    const navResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        const views = ['dashboard', 'decks', 'bank', 'import', 'import-lms', 'stats', 'settings'];
        const results = {};
        for (const v of views) {
          App.navigateTo(v);
          await new Promise(r => setTimeout(r, 150));
          const el = document.getElementById('view-' + v);
          results[v] = el && el.classList.contains('active');
        }
        return results;
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    const viewsState = navResult.result.value || {};
    for (const v of ['dashboard', 'decks', 'bank', 'import', 'import-lms', 'stats', 'settings']) {
      check(`Navigation tab '${v}' loads and becomes active`, viewsState[v] === true);
    }

    console.log('\n--- Test 2: Full Quiz Session Flow ---');
    const quizResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        // Start a short quiz session with 3 questions
        await App.startSession(null, 'free');
        await new Promise(r => setTimeout(r, 400));

        let qCount = 0;
        const maxQuestions = App.activeSession ? App.activeSession.cards.length : 0;
        
        // Answer up to 5 questions or until complete
        while (App.activeSession && App.activeSession.currentIndex < maxQuestions && qCount < 5) {
          const curCard = App.activeSession.cards[App.activeSession.currentIndex];
          if (curCard.type === 'numeric') {
            const input = document.getElementById('quiz-numeric-input');
            if (input) input.value = String(curCard.correct_answer || '1');
            App.submitNumericAnswer();
          } else {
            const btn = document.querySelector('.quiz-option-btn');
            if (btn) btn.click();
          }
          await new Promise(r => setTimeout(r, 250));
          App.nextStudyQuestion();
          await new Promise(r => setTimeout(r, 250));
          qCount++;
        }

        const sessionActive = Boolean(App.activeSession);
        return { qCount, maxQuestions, sessionActive };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    check('Quiz session answers questions and transitions cleanly', quizResult.result.value.qCount >= 1);

    console.log('\n--- Test 3: Flashcard Flipping, Rating & Progression Flow ---');
    const fcResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        await App.startSession(null, 'flashcard');
        await new Promise(r => setTimeout(r, 400));

        const cardBeforeFlip = document.getElementById('active-flashcard');
        const isFlippedBefore = cardBeforeFlip ? cardBeforeFlip.classList.contains('flipped') : false;

        App.flipFlashcard();
        await new Promise(r => setTimeout(r, 300));

        const isFlippedAfter = cardBeforeFlip ? cardBeforeFlip.classList.contains('flipped') : false;
        const srsBar = document.getElementById('flashcard-srs-bar');
        const srsVisible = srsBar && window.getComputedStyle(srsBar).display === 'grid';

        // Rate card with rating 3 ("Nhớ tốt")
        const idxBefore = App.activeSession.currentIndex;
        await App.rateFlashcard(3);
        await new Promise(r => setTimeout(r, 300));
        const idxAfter = App.activeSession ? App.activeSession.currentIndex : -1;

        return {
          isFlippedBefore,
          isFlippedAfter,
          srsVisible,
          progressed: idxAfter > idxBefore || idxAfter === 0
        };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    const fcVal = fcResult.result.value;
    check('Flashcard starts unflipped', fcVal.isFlippedBefore === false);
    check('Flashcard flips to back face with 2x2 SRS ratings bar', fcVal.isFlippedAfter === true && fcVal.srsVisible === true);
    check('Rating flashcard records SRS rating and progresses to next card', fcVal.progressed === true);

    console.log('\n--- Test 4: LMS Import Sample & Parse Flow ---');
    const lmsResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        App.navigateTo('import-lms');
        await new Promise(r => setTimeout(r, 200));

        // Paste sample Moodle data
        App.pasteLmsSampleData();
        await new Promise(r => setTimeout(r, 100));

        const rawText = document.getElementById('lms-raw-input').value;
        const hasText = rawText.length > 50;

        // Parse questions
        App.parseLmsInput();
        await new Promise(r => setTimeout(r, 300));

        const parsedCount = (App._lmsParsedQuestions || []).length;
        const previewList = document.getElementById('lms-preview-list');
        const hasCardsInDom = previewList && previewList.children.length > 0;

        return { hasText, parsedCount, hasCardsInDom };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    const lmsVal = lmsResult.result.value;
    check('LMS sample button pastes authentic raw Moodle text', lmsVal.hasText === true);
    check('LMS parser successfully parses questions into preview cards', lmsVal.parsedCount >= 1 && lmsVal.hasCardsInDom === true);

    console.log('\n--- Test 5: Wallpaper Change & Reload Persistence ---');
    const wpResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        App.navigateTo('settings');
        await new Promise(r => setTimeout(r, 200));

        // Set background to starry garden
        await App.setBackground('./backgrounds/bg-starry-garden.webp');
        await new Promise(r => setTimeout(r, 300));

        const bgLayerBefore = document.getElementById('bg-layer');
        const styleBefore = bgLayerBefore ? bgLayerBefore.style.backgroundImage : '';
        return { styleBefore };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    check('Background sets successfully in session', wpResult.result.value.styleBefore.includes('bg-starry-garden.webp'));

    // Reload page to verify IndexedDB persistence
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1500));

    const reloadResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        await new Promise(r => setTimeout(r, 500));
        const bgLayerAfter = document.getElementById('bg-layer');
        return bgLayerAfter ? bgLayerAfter.style.backgroundImage : '';
      })()`,
      returnByValue: true,
      awaitPromise: true
    });

    check('Background persists after page reload from IndexedDB', (reloadResult.result.value || '').includes('bg-starry-garden.webp'));

    console.log('\n--- Test 6: Responsive Breakpoints (Desktop & Mobile) ---');
    // Desktop check
    const dtResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.querySelector('.app-sidebar');
        const bottomNav = document.querySelector('.bottom-nav');
        return {
          sidebarVisible: sidebar && window.getComputedStyle(sidebar).display !== 'none',
          bottomNavHidden: bottomNav && window.getComputedStyle(bottomNav).display === 'none'
        };
      })()`,
      returnByValue: true
    });

    check('Desktop (1280x900): Sidebar is visible, mobile bottom-nav is hidden', dtResult.result.value.sidebarVisible && dtResult.result.value.bottomNavHidden);

    // Mobile check at 375x667
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 400));

    const mbResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.querySelector('.app-sidebar');
        const bottomNav = document.querySelector('.bottom-nav');
        const visibleBottomItems = Array.from(document.querySelectorAll('.bottom-nav-item')).filter(
          item => window.getComputedStyle(item).display !== 'none'
        );
        return {
          sidebarHidden: sidebar && window.getComputedStyle(sidebar).display === 'none',
          bottomNavVisible: bottomNav && window.getComputedStyle(bottomNav).display !== 'none',
          visibleItemsCount: visibleBottomItems.length
        };
      })()`,
      returnByValue: true
    });

    const mbVal = mbResult.result.value;
    check('Mobile (375x667): Sidebar is hidden, bottom-nav is visible with exactly 5 items', mbVal.sidebarHidden && mbVal.bottomNavVisible && mbVal.visibleItemsCount === 5);

    console.log('\n--- Test 7: Zero Uncaught Console Errors Check ---');
    check('Zero uncaught exceptions or error logs during entire smoke test', consoleErrors.length === 0, `(errors: ${consoleErrors.join(', ')})`);

    ws.close();
  } catch (err) {
    console.error('Smoke test error:', err);
    failedCount++;
  } finally {
    try { chromeProcess.kill(); } catch (_) {}
    try { serverProcess.kill(); } catch (_) {}
  }

  console.log('\n==================================================');
  console.log(`SMOKE TEST SUMMARY: ${passedCount} passed, ${failedCount} failed.`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
  console.log('🎉 ALL PRODUCTION SMOKE TESTS PASSED WITH ZERO ERRORS!');
}

main();
