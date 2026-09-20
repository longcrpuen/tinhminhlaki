/**
 * Test Suite 41: Desktop Flashcard Compact & Anchored Layout Verification
 *
 * Verifies:
 * 1. Top space reduction on Desktop (content-wrapper, view-study, header-bar, title-wrap, toolbar).
 * 2. Entire flashcard block (card front/back + explanation + 4 SRS rating buttons) fits within standard desktop viewport (~900px) with 0 scroll.
 * 3. Both row 1 ("Chưa thuộc", "Khó nhớ") and row 2 ("Nhớ tốt", "Rất dễ") are fully visible inside viewport.
 * 4. Safe scrollability for long explanations without rating buttons being clipped or trapped.
 * 5. Strict breakpoint isolation: Mobile layout (@media (max-width: 768px)) remains intact.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');
const { spawn } = require('child_process');

console.log('=== TEST SUITE 41: Desktop Flashcard Compact Layout ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');

const styleCss = fs.readFileSync(stylePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');

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

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// Slice out main Desktop base CSS and main Mobile media query
const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Main @media (max-width: 768px) must be located');

const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// =========================================================================
// 1. STATIC CSS AUDIT: DESKTOP FLASHCARD SCOPING & TOP CLEARANCE
// =========================================================================
console.log('--- 1. Desktop Flashcard CSS Rules & Spacing Audit ---');

test('1.1: Desktop CSS has dedicated @media (min-width: 769px) rules for body.flashcard-active', () => {
  assert(desktopCss.includes('@media (min-width: 769px)'), 'Must have @media (min-width: 769px)');
  assert(desktopCss.includes('body.flashcard-active .content-wrapper'), 'Must scope .content-wrapper for flashcard');
  assert(desktopCss.includes('body.flashcard-active #view-study.active'), 'Must scope #view-study.active for flashcard');
  assert(desktopCss.includes('body.flashcard-active .quiz-container'), 'Must scope .quiz-container for flashcard');
});

test('1.2: Desktop CSS reduces top clearance before flashcard stage', () => {
  const cwIdx = desktopCss.indexOf('body.flashcard-active .content-wrapper {');
  assert(cwIdx !== -1, 'body.flashcard-active .content-wrapper rule must exist');
  const cwBlock = desktopCss.slice(cwIdx, desktopCss.indexOf('}', cwIdx));
  assert(cwBlock.includes('padding-top: 8px !important;') || cwBlock.includes('padding-top: 10px !important;'),
    'Desktop flashcard content-wrapper must have tightened top padding (8-10px)');

  const vsIdx = desktopCss.indexOf('body.flashcard-active #view-study.active {');
  assert(vsIdx !== -1, 'body.flashcard-active #view-study.active rule must exist');
  const vsBlock = desktopCss.slice(vsIdx, desktopCss.indexOf('}', vsIdx));
  assert(vsBlock.includes('padding-top: 4px !important;') || vsBlock.includes('padding-top: 6px !important;'),
    'Desktop flashcard #view-study must have tightened top padding');

  const qhbIdx = desktopCss.indexOf('body.flashcard-active .quiz-header-bar {');
  assert(qhbIdx !== -1, 'body.flashcard-active .quiz-header-bar rule must exist');
  const qhbBlock = desktopCss.slice(qhbIdx, desktopCss.indexOf('}', qhbIdx));
  assert(qhbBlock.includes('margin-bottom: 6px !important;') || qhbBlock.includes('margin-bottom: 8px !important;'),
    'Desktop flashcard quiz-header-bar must have tightened margin-bottom');

  const titleIdx = desktopCss.indexOf('body.flashcard-active .study-session-title-wrap {');
  assert(titleIdx !== -1, 'body.flashcard-active .study-session-title-wrap rule must exist');
  const titleBlock = desktopCss.slice(titleIdx, desktopCss.indexOf('}', titleIdx));
  assert(titleBlock.includes('margin-bottom: 4px !important;') || titleBlock.includes('margin-bottom: 6px !important;'),
    'Desktop flashcard title wrap must have tightened margin-bottom');
});

test('1.3: Desktop flashcard view prevents scroll traps and unlocks natural auto overflow', () => {
  const vsIdx = desktopCss.indexOf('body.flashcard-active #view-study.active {');
  const vsBlock = desktopCss.slice(vsIdx, desktopCss.indexOf('}', vsIdx));
  assert(vsBlock.includes('max-height: none !important;'), '#view-study must remove 100dvh hard max-height in flashcard mode');
  assert(vsBlock.includes('height: auto !important;'), '#view-study must have height: auto in flashcard mode');
  assert(vsBlock.includes('overflow-y: visible !important;') || vsBlock.includes('overflow-y: auto !important;'),
    '#view-study must allow overflow in flashcard mode');

  const qcIdx = desktopCss.indexOf('body.flashcard-active .quiz-container {');
  const qcBlock = desktopCss.slice(qcIdx, desktopCss.indexOf('}', qcIdx));
  assert(qcBlock.includes('overflow: visible !important;') || qcBlock.includes('overflow-y: auto !important;'),
    'quiz-container must not clip children in flashcard mode');
});

test('1.4: Desktop flashcard stage and SRS buttons have compact bounded dimensions', () => {
  const stageIdx = desktopCss.indexOf('body.flashcard-active .flashcard-stage {');
  assert(stageIdx !== -1, 'body.flashcard-active .flashcard-stage rule must exist');
  const stageBlock = desktopCss.slice(stageIdx, desktopCss.indexOf('}', stageIdx));
  assert(stageBlock.includes('height: 310px !important;') || stageBlock.includes('height: 300px !important;'),
    'Desktop stage must be compactly budgeted (300-310px)');

  const srsIdx = desktopCss.indexOf('body.flashcard-active .srs-btn {');
  assert(srsIdx !== -1, 'body.flashcard-active .srs-btn rule must exist');
  const srsBlock = desktopCss.slice(srsIdx, desktopCss.indexOf('}', srsIdx));
  assert(srsBlock.includes('height: 44px !important;') || srsBlock.includes('height: 46px !important;'),
    'Desktop SRS button height must be 44-46px');
});

test('1.5: Strict mobile isolation - Mobile CSS under @media (max-width: 768px) is unaffected', () => {
  assert(mobileCss.includes('body.flashcard-active .quiz-container'), 'Mobile flashcard rules remain intact');
  assert(mobileCss.includes('body.flashcard-active #study-flashcard-area'), 'Mobile #study-flashcard-area rules remain intact');
  assert(mobileCss.includes('.srs-btn'), 'Mobile srs-btn rules remain intact');
});

// =========================================================================
// 2. LIVE CHROME HEADLESS CDP TESTS (DESKTOP 1280x900 & MOBILE 375x667)
// =========================================================================
async function runChromeLiveTests() {
  console.log('\n--- 2. Real Chrome Headless Live Viewport & Rating Buttons Verification ---');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch', 'chrome-test-r41-profile');

  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9224',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1280,900',
    'http://localhost:5173'
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

    const targets = await httpGet('http://localhost:9224/json');
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

    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1000));

    // TEST 2.1: Desktop 1280x900 normal card flipped - All 4 rating buttons visible without scrolling
    await asyncTest('2.1: Desktop 1280x900 - Flipped flashcard with standard explanation fits 100% in viewport without scroll', async () => {
      const res = await send('Runtime.evaluate', {
        expression: `(async () => {
          await App.startSession(null, 'flashcard');
          await new Promise(r => setTimeout(r, 400));

          // Set typical explanation
          const curCard = App.activeSession.cards[App.activeSession.currentIndex];
          curCard.explanation = "Công thức này dựa trên tính chất đối xứng của hàm lượng giác trong tam giác vuông.";
          App._renderFlashcardContent(curCard);

          // Flip card
          App.flipFlashcard();
          await new Promise(r => setTimeout(r, 400));

          const stage = document.querySelector('.flashcard-stage').getBoundingClientRect();
          const srsBar = document.getElementById('flashcard-srs-bar').getBoundingClientRect();
          const againBtn = document.querySelector('.srs-btn-again').getBoundingClientRect();
          const hardBtn = document.querySelector('.srs-btn-hard').getBoundingClientRect();
          const goodBtn = document.querySelector('.srs-btn-good').getBoundingClientRect();
          const easyBtn = document.querySelector('.srs-btn-easy').getBoundingClientRect();

          return {
            windowInnerHeight: window.innerHeight,
            scrollY: window.scrollY,
            stageTop: stage.top,
            stageBottom: stage.bottom,
            srsBarTop: srsBar.top,
            srsBarBottom: srsBar.bottom,
            againBottom: againBtn.bottom,
            hardBottom: hardBtn.bottom,
            goodBottom: goodBtn.bottom,
            easyBottom: easyBtn.bottom
          };
        })()`,
        returnByValue: true,
        awaitPromise: true
      });

      assert(!res.exceptionDetails, `Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
      const val = res.result.value;

      assert(val.scrollY === 0, `Page must not require scroll (scrollY is ${val.scrollY})`);
      assert(val.stageTop <= 230, `Flashcard stage top must be pulled up close to header (actual: ${val.stageTop}px)`);
      assert(val.goodBottom <= val.windowInnerHeight, `"Nhớ tốt" button must be within viewport (bottom: ${val.goodBottom}px <= ${val.windowInnerHeight}px)`);
      assert(val.easyBottom <= val.windowInnerHeight, `"Rất dễ" button must be within viewport (bottom: ${val.easyBottom}px <= ${val.windowInnerHeight}px)`);
      
      const bottomHeadroom = val.windowInnerHeight - val.easyBottom;
      assert(bottomHeadroom >= 100, `Must have comfortable breathing headroom below buttons (headroom: ${bottomHeadroom}px)`);
    });

    // TEST 2.2: 4 rating buttons immediately follow back-face content
    await asyncTest('2.2: 4 rating buttons are anchored immediately below the card face (natural flow, no disconnected float)', async () => {
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const stage = document.querySelector('.flashcard-stage').getBoundingClientRect();
          const srsBar = document.getElementById('flashcard-srs-bar').getBoundingClientRect();
          const gap = srsBar.top - stage.bottom;
          const srsPosition = window.getComputedStyle(document.getElementById('flashcard-srs-bar')).position;
          const containerPosition = window.getComputedStyle(document.querySelector('.flashcard-bottom-actions')).position;
          return { gap, srsPosition, containerPosition };
        })()`,
        returnByValue: true
      });

      const val = res.result.value;
      assert(val.gap >= 0 && val.gap <= 30, `SRS bar must be immediately adjacent to card (gap: ${val.gap}px)`);
      assert(val.srsPosition !== 'fixed' && val.containerPosition !== 'fixed', 'SRS bar must not be fixed');
      assert(val.srsPosition !== 'sticky' && val.containerPosition !== 'sticky', 'SRS bar must not be sticky');
    });

    // TEST 2.3: Unusually long explanation - Card face remains bounded & page supports natural smooth scroll
    await asyncTest('2.3: Unusually long explanation remains accessible with internal or natural scroll, rating buttons never vanish', async () => {
      const res = await send('Runtime.evaluate', {
        expression: `(async () => {
          const curCard = App.activeSession.cards[App.activeSession.currentIndex];
          curCard.explanation = "Đoạn giải thích rất dài: ".repeat(25) + "Hết giải thích.";
          App._renderFlashcardContent(curCard);
          App.flipFlashcard();
          await new Promise(r => setTimeout(r, 300));
          App.toggleFlashcardExplanation(); // expand
          await new Promise(r => setTimeout(r, 300));

          const easyBtn = document.querySelector('.srs-btn-easy');
          const isInteractable = easyBtn && !easyBtn.disabled;
          const overflowY = window.getComputedStyle(document.body).overflowY;
          const mainOverflowY = window.getComputedStyle(document.querySelector('.app-main')).overflowY;

          return { isInteractable, overflowY, mainOverflowY };
        })()`,
        returnByValue: true,
        awaitPromise: true
      });

      const val = res.result.value;
      assert(val.isInteractable, 'Rating buttons must remain accessible and interactive');
      assert(val.overflowY !== 'hidden', 'Body must not trap scroll with overflow: hidden');
    });

    // TEST 2.4: Mobile emulation test at 375x667
    await asyncTest('2.4: Mobile viewport (375x667) emulation confirms mobile layout remains intact', async () => {
      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 500));

      const res = await send('Runtime.evaluate', {
        expression: `(async () => {
          await App.startSession(null, 'flashcard');
          await new Promise(r => setTimeout(r, 300));
          App.flipFlashcard();
          await new Promise(r => setTimeout(r, 300));

          const srsBar = document.getElementById('flashcard-srs-bar');
          const srsDisplay = window.getComputedStyle(srsBar).display;
          const topbarDisplay = window.getComputedStyle(document.querySelector('.app-topbar')).display;
          const bottomNavDisplay = window.getComputedStyle(document.querySelector('.bottom-nav')).display;

          return {
            srsDisplay,
            topbarDisplay,
            bottomNavDisplay
          };
        })()`,
        returnByValue: true,
        awaitPromise: true
      });

      const val = res.result.value;
      assert(val.srsDisplay === 'grid', 'Mobile SRS bar must display 2x2 grid');
      assert(val.topbarDisplay === 'none', 'Mobile topbar is hidden during flashcard session');
      assert(val.bottomNavDisplay === 'none', 'Mobile bottomNav is hidden during flashcard session');
    });

    ws.close();
  } catch (err) {
    console.error('Chrome CDP Test failed:', err);
    failed++;
  } finally {
    try {
      chrome.kill();
    } catch (_) {}
  }
}

async function main() {
  await runChromeLiveTests();

  console.log('\n========================================');
  console.log(`TEST SUITE 41 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  console.log('🎉 ALL DESKTOP FLASHCARD LAYOUT REQUIREMENTS VERIFIED AND PASSING!');
}

main();
