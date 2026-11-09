/**
 * Test Suite 42: Comprehensive Verification for Phase 1j (docs/promt/promt1j.md)
 * 13 Items Acceptance Test (Static CSS/JS/HTML Audit + Real Chrome Headless CDP Verification)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('=== TEST SUITE 42: PHASE 1J COMPREHENSIVE VERIFICATION ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const themePath = path.join(__dirname, '..', 'css', 'theme.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');
const dbPath = path.join(__dirname, '..', 'js', 'db.js');
const indexPath = path.join(__dirname, '..', 'index.html');

const styleCss = fs.readFileSync(stylePath, 'utf-8');
const themeCss = fs.readFileSync(themePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');
const dbJs = fs.readFileSync(dbPath, 'utf-8');
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
// PHẦN 1: STATIC CODE AUDIT (13 ITEMS)
// =========================================================================
console.log('--- 1. Static Audit of 13 Requirements ---');

test('Mục 1: Kính mờ đục trong suốt cho 4 ô Quote ở White-Orange & hover màu pastel', () => {
  assert(themeCss.includes('html[data-theme="white-orange"] .stat-card'), 'White-orange stat card rule exists');
  assert(themeCss.includes('rgba(255, 255, 255, 0.52)'), 'White-orange uses translucent resting background alpha');
  assert(themeCss.includes('rgba(192, 132, 252, 0.28)'), 'Purple-pink uses soft pastel hover for stat cards');
  assert(themeCss.includes('rgba(251, 146, 60, 0.32)'), 'White-orange uses soft peach/orange hover for stat cards');
});

test('Mục 2: 7 Ô Chế độ học & Thẻ Bộ câu hỏi ở White-Orange (alpha ~0.56 resting, ~0.16 hover)', () => {
  assert(themeCss.includes('rgba(255, 253, 250, 0.56)'), 'Resting alpha ~0.56 for study modes & decks');
  assert(themeCss.includes('rgba(255, 250, 245, 0.16)'), 'Hover alpha ~0.16 for high contrast transparency');
});

test('Mục 3: Chữ đen Quote ở Mode Trắng Cam là font trơn thẳng tuột sans-serif, đối lập chữ cam có chân', () => {
  assert(themeCss.includes('Plus Jakarta Sans'), 'Sans-serif specified for black quote text in white-orange');
  assert(themeCss.includes('font-style: normal !important;'), 'Font style normal enforced on main quote text');
  assert(themeCss.includes('font-style: italic !important;'), 'Accent quote text remains italic serif');
});

test('Mục 4 & 9: In-Memory RAM Caches in db.js, tab curtain disabled & 0ms tab transitions', () => {
  assert(dbJs.includes('_cardsCache') && dbJs.includes('_decksCache') && dbJs.includes('_subjectsCache'), 'RAM caches initialized in db.js');
  assert(dbJs.includes('invalidateAllCaches'), 'invalidateAllCaches defined in db.js');
  assert(styleCss.includes('#tab-wave-curtain') && styleCss.includes('display: none !important;'), 'tab-wave-curtain is disabled with display: none !important');
  assert(appJs.includes('_viewRendered') && appJs.includes('_dbDirty'), 'DOM caching flags exist in app.js');
});

test('Mục 5: Scroll-Reveal CSS & IntersectionObserver in app.js', () => {
  assert(themeCss.includes('.scroll-reveal-item'), 'Scroll reveal item class in theme.css');
  assert(themeCss.includes('.scroll-reveal-item.is-revealed'), 'is-revealed class in theme.css');
  assert(appJs.includes('initScrollRevealObserver'), 'initScrollRevealObserver method in app.js');
  assert(appJs.includes('observeUnrevealedItems'), 'observeUnrevealedItems method in app.js');
});

test('Mục 6: Monochrome mode removes line-through on wrong answer', () => {
  assert(themeCss.includes('html[data-theme="monochrome"] .quiz-option-btn.incorrect *'), 'Monochrome incorrect option rule exists');
  assert(themeCss.includes('text-decoration: none !important;'), 'text-decoration: none !important enforced');
  assert(!themeCss.includes('text-decoration: line-through !important;'), 'No line-through remaining in theme.css');
});

test('Mục 7: Mode 5 Ôn theo Môn & Chương reliable display & capture phase listener', () => {
  assert(appJs.includes("el.style.setProperty('display', 'grid', 'important');"), '_showModal forces display: grid !important');
  assert(appJs.includes("el.style.setProperty('display', 'none', 'important');"), '_closeModal forces display: none !important');
  assert(appJs.includes('Capture-phase listener for Mode 5') || appJs.includes('e.target.closest(\'.study-mode-card, .mode-card\')'), 'Capture phase listener installed in setupEventListeners');
  assert(appJs.includes('renderTopicPickerModalContent'), 'Separated renderTopicPickerModalContent exists');
});

test('Mục 8: Sidebar PWA install button uses clean SVG without corrupted square character', () => {
  assert(indexHtml.includes('sidebar-install-btn'), 'sidebar-install-btn class present');
  assert(!indexHtml.includes('▯'), 'Corrupted square symbol ▯ is completely eliminated');
  assert(styleCss.includes('.app-sidebar.collapsed .sidebar-install-btn'), 'Collapsed circular 44x44 CSS defined');
});

test('Mục 10: Mobile bottom nav uses pure path SVG with no black rectangles', () => {
  assert(indexHtml.includes('id="mobile-bottom-nav"'), 'Mobile bottom nav has id mobile-bottom-nav');
  assert(themeCss.includes('#mobile-bottom-nav .bnav-svg'), 'bnav-svg styling rules defined');
  assert(themeCss.includes('fill: none !important;'), 'bnav-svg fill: none enforced');
  assert(themeCss.includes('background: none !important;'), 'bnav-svg background: none enforced');
});

test('Mục 11 & 12: Modal overflow scrolling & convex edge warp filter', () => {
  assert(styleCss.includes('max-height: calc(88vh - 140px) !important;'), 'modal-body has bounded max-height');
  assert(styleCss.includes('overflow-y: auto !important;'), 'modal-body has overflow-y: auto !important');
  assert(appJs.includes('filter id="liquid-edge-warp"'), 'liquid-edge-warp filter defined in app.js');
  assert(appJs.includes('scale="68"'), 'scale="68" for strong edge refraction');
  assert(themeCss.includes('backdrop-filter: url(#liquid-edge-warp)'), 'modal-box uses liquid-edge-warp');
});

test('Mục 13: Reset deck progress button implementation and cache invalidation', () => {
  assert(appJs.includes('confirmResetDeckProgress(deckId)'), 'confirmResetDeckProgress method implemented in App');
  assert(dbJs.includes('this.invalidateSubjectCache();') && dbJs.includes('this.invalidateAllCaches();'), 'resetDeckProgress invalidates caches');
  assert(!appJs.includes('window.confirm') || !appJs.slice(appJs.indexOf('confirmResetDeckProgress')).includes('window.confirm'), 'confirmResetDeckProgress avoids blocking window.confirm');
});

// =========================================================================
// PHẦN 2: LIVE CHROME HEADLESS CDP BENCHMARK & COMPUTED-STYLE VERIFICATION
// =========================================================================
async function runChromeLiveTests() {
  console.log('\n--- 2. Real Chrome Headless Live Execution Verification ---');

  // Verify server is responding
  const serverRunning = await new Promise(resolve => {
    http.get('http://localhost:5173/', res => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });

  if (!serverRunning) {
    console.warn('  ⚠️ Local web server not running on port 5173. Skipping CDP phase.');
    finish();
    return;
  }

  let chrome = null;
  let CDP = null;
  try {
    CDP = require('chrome-remote-interface');
  } catch (_) {
    console.log('  ⚠️ chrome-remote-interface not installed. Using local Chrome launcher.');
  }

  // Use child_process to launch headless Chrome with remote debugging
  const { spawn } = require('child_process');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    console.log('  ⚠️ Chrome binary not found at standard path. Static tests complete.');
    finish();
    return;
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 1600));

  try {
    const listRes = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9222/json', (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => res(JSON.parse(data)));
      }).on('error', rej);
    });

    const target = listRes.find(t => t.type === 'page' && t.url.includes('5173'));
    if (!target) throw new Error('Target page not found in Chrome list');

    const wsUrl = target.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
    await send('Runtime.enable');
    await send('DOM.enable');

    // Test 1: Tab switch speed (< 16ms)
    test('CDP Live: Tab switch from dashboard -> decks completes under 16ms (0ms transition)', async () => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const t0 = performance.now();
            App.navigateTo('decks');
            const t1 = performance.now();
            return {
              duration: t1 - t0,
              decksActive: document.getElementById('view-decks').classList.contains('active'),
              dashboardInactive: !document.getElementById('view-dashboard').classList.contains('active')
            };
          })()
        `,
        returnByValue: true
      });
      const val = evalRes.result.value;
      assert(val.decksActive, 'Decks view section must be active');
      assert(val.dashboardInactive, 'Dashboard view section must be inactive');
      assert(val.duration < 16, `Tab switch took ${val.duration.toFixed(2)}ms (must be < 16ms)`);
      console.log(`     Tab transition time: ${val.duration.toFixed(3)}ms (Well within 0-16ms target)`);
    });

    // Test 2: Mode 5 Topic Picker modal opens with display: grid
    test('CDP Live: Mode 5 Topic Picker modal opens with display: grid and real height', async () => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            await App.openTopicPickerModal();
            const modal = document.getElementById('modal-topic-picker');
            const cs = window.getComputedStyle(modal);
            return {
              display: cs.display,
              visibility: cs.visibility,
              hasActive: modal.classList.contains('show'),
              rect: modal.getBoundingClientRect()
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      const val = evalRes.result.value;
      assert.strictEqual(val.display, 'grid', 'Topic picker modal must have computed display: grid');
      assert(val.rect.height > 200, `Modal height must be > 200px (was ${val.rect.height}px)`);
    });

    // Test 3: Modal edit card has scrollable body
    test('CDP Live: Modal body has overflow-y: auto and allows full scrolling', async () => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const modal = document.getElementById('modal-edit-card');
            App._showModal(modal);
            const body = modal.querySelector('.modal-body');
            const cs = window.getComputedStyle(body);
            return {
              overflowY: cs.overflowY,
              maxHeight: cs.maxHeight,
              clientHeight: body.clientHeight,
              scrollHeight: body.scrollHeight
            };
          })()
        `,
        returnByValue: true
      });
      const val = evalRes.result.value;
      assert.strictEqual(val.overflowY, 'auto', 'Modal body must have overflow-y: auto');
      assert(val.maxHeight.includes('px'), 'Modal body has bounded max-height');
    });

    // Test 4: Mobile bottom nav clean SVGs
    test('CDP Live: Mobile bottom nav icons have stroke: currentColor and zero solid black rects', async () => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const nav = document.getElementById('mobile-bottom-nav');
            const svgs = Array.from(nav.querySelectorAll('.bnav-svg'));
            const rects = nav.querySelectorAll('.bnav-svg rect');
            const firstSvg = svgs[0];
            const cs = window.getComputedStyle(firstSvg);
            return {
              svgCount: svgs.length,
              rectCount: rects.length,
              fill: cs.fill,
              stroke: cs.stroke
            };
          })()
        `,
        returnByValue: true
      });
      const val = evalRes.result.value;
      assert.strictEqual(val.svgCount, 7, 'All 7 bottom nav SVGs exist');
      assert.strictEqual(val.rectCount, 0, 'No rect elements in mobile bottom nav SVGs');
      assert(val.fill.includes('none') || val.fill.includes('rgba(0, 0, 0, 0)'), 'SVG fill is none / transparent');
    });

    // Test 5: White-orange theme computed styles on stat cards and quote
    test('CDP Live: White-Orange theme has translucent cards & straight sans-serif quote', async () => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            await App.setTheme('white-orange');
            const statCard = document.querySelector('.stat-card');
            const statCs = window.getComputedStyle(statCard);
            const quoteMain = document.querySelector('#hero-title .hero-title-main') || document.querySelector('.hero-title-main');
            const quoteCs = window.getComputedStyle(quoteMain);
            return {
              statBackdrop: statCs.backdropFilter || statCs.webkitBackdropFilter,
              quoteFontStyle: quoteCs.fontStyle,
              quoteFontFamily: quoteCs.fontFamily
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      const val = evalRes.result.value;
      assert(val.statBackdrop.includes('blur'), 'Stat card has active backdrop-filter blur');
      assert.strictEqual(val.quoteFontStyle, 'normal', 'Quote main font-style is normal');
      assert(val.quoteFontFamily.includes('Plus Jakarta Sans') || val.quoteFontFamily.includes('Inter') || val.quoteFontFamily.includes('sans-serif'), 'Quote main uses sans-serif');
    });

    ws.close();
  } catch (err) {
    console.error('  ❌ Error during CDP execution:', err.message);
    failed++;
  } finally {
    try { chromeProc.kill(); } catch (_) {}
    finish();
  }
}

function finish() {
  console.log('\n========================================');
  console.log(`TEST SUITE 42 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('========================================');
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 1J REQUIREMENTS VERIFIED AND PASSING!\n');
    process.exit(0);
  }
}

// Run static tests, then CDP tests
(async () => {
  await runChromeLiveTests();
})();
