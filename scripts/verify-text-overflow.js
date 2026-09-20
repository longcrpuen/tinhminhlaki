const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9227;
const TEST_PORT = 5179;

let chromeProcess = null;
let serverProcess = null;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🧪 Starting Responsive Brand Header & Topbar Verification...\n');

  // Start test server on 5179
  serverProcess = spawn('node', ['server.js', 'dist', String(TEST_PORT)], {
    stdio: 'ignore'
  });
  await sleep(1500);

  // Start Chrome Headless on CDP_PORT
  chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${path.join(__dirname, '../scratch/test-chrome-profile-brand')}`
  ]);
  await sleep(2500);

  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const tabs = await res.json();
  const targetTab = tabs.find(t => t.type === 'page') || tabs[0];

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

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: `http://localhost:${TEST_PORT}/` });
  await sleep(1500);

  let passed = 0;
  let failed = 0;
  function check(label, condition) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // TEST 1: Desktop 1366x768 Check
  console.log('--- Test 1: Desktop 1366x768 Layout ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(500);

  const desktopBrand = await send('Runtime.evaluate', {
    expression: `(() => {
      const brandTitle = document.querySelector('.brand-title');
      const brandHeader = document.querySelector('.brand-header');
      const brandIcon = document.querySelector('.brand-icon');
      const toggleBtn = document.querySelector('.sidebar-toggle-btn');
      return {
        brandText: brandTitle ? brandTitle.textContent.trim() : '',
        titleScrollWidth: brandTitle ? brandTitle.scrollWidth : 0,
        titleClientWidth: brandTitle ? brandTitle.clientWidth : 0,
        brandHeaderWidth: brandHeader ? brandHeader.clientWidth : 0,
        brandIconWidth: brandIcon ? brandIcon.clientWidth : 0,
        toggleBtnWidth: toggleBtn ? toggleBtn.clientWidth : 0,
        isTruncated: brandTitle ? brandTitle.scrollWidth > brandTitle.clientWidth : false
      };
    })()`,
    returnByValue: true
  });

  const brandVal = desktopBrand.result?.value || {};
  check('Desktop 1366px: Brand text is exactly "TinhMinhLaKey"', brandVal.brandText === 'TinhMinhLaKey');
  check('Desktop 1366px: Brand text is 100% visible with zero clipping (scrollWidth <= clientWidth)', !brandVal.isTruncated);

  // TEST 1B: Desktop 1920x1080 Check
  console.log('--- Test 1B: Desktop 1920x1080 Layout ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(300);

  const desktop1920Brand = await send('Runtime.evaluate', {
    expression: `(() => {
      const brandTitle = document.querySelector('.brand-title');
      return {
        brandText: brandTitle ? brandTitle.textContent.trim() : '',
        isTruncated: brandTitle ? brandTitle.scrollWidth > brandTitle.clientWidth : false
      };
    })()`,
    returnByValue: true
  });
  const brand1920Val = desktop1920Brand.result?.value || {};
  check('Desktop 1920px: Brand text is exactly "TinhMinhLaKey"', brand1920Val.brandText === 'TinhMinhLaKey');
  check('Desktop 1920px: Brand text is 100% visible with zero clipping (scrollWidth <= clientWidth)', !brand1920Val.isTruncated);

  // TEST 2: Topbar Header Across All Views on Desktop
  console.log('\n--- Test 2: Topbar Header Titles on Desktop ---');
  const views = ['dashboard', 'decks', 'bank', 'import', 'import-lms', 'stats', 'settings'];
  for (const v of views) {
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        App.navigateTo('${v}');
        const topbarTitle = document.querySelector('.topbar-title');
        return {
          titleText: topbarTitle ? topbarTitle.textContent.trim() : '',
          isTruncated: topbarTitle ? topbarTitle.scrollWidth > topbarTitle.clientWidth : false
        };
      })()`,
      returnByValue: true
    });
    const val = evalRes.result?.value || {};
    check(`Topbar title on view "${v}" ("${val.titleText}") has 0 truncation`, !val.isTruncated);
  }

  // TEST 3: Sidebar Toggle Collapse & Re-expansion
  console.log('\n--- Test 3: Sidebar Toggle Collapse & Expansion ---');
  // Click collapse
  await send('Runtime.evaluate', {
    expression: `App.toggleSidebar();`
  });
  await sleep(400);

  const colEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const sidebar = document.querySelector('.app-sidebar');
      const brandTitle = document.querySelector('.brand-title');
      const brandIcon = document.querySelector('.brand-icon');
      const rect = sidebar.getBoundingClientRect();
      const style = window.getComputedStyle(sidebar);
      return {
        isCollapsed: sidebar.classList.contains('collapsed'),
        rectWidth: rect.width,
        offsetWidth: sidebar.offsetWidth,
        clientWidth: sidebar.clientWidth,
        computedWidth: style.width,
        boxSizing: style.boxSizing,
        borderRightWidth: style.borderRightWidth,
        sidebarWidth: Math.round(rect.width),
        titleInDom: !!brandTitle,
        brandTitleParent: brandTitle ? brandTitle.parentElement?.className : null,
        brandTitleHtml: brandTitle ? brandTitle.outerHTML : null,
        iconVisible: !!brandIcon && brandIcon.clientWidth > 0
      };
    })()`,
    returnByValue: true
  });
  const colVal = colEval.result?.value || {};

  console.log(`  [Debug] Collapsed details:`, colVal);
  check('Sidebar has .collapsed class', colVal.isCollapsed);
  check('Sidebar width is 72px when collapsed', Math.abs(colVal.rectWidth - 72) <= 1);
  check('Brand text is detached/hidden in collapsed state', !colVal.titleInDom);
  check('Brand avatar/icon remains visible and centered', colVal.iconVisible);

  // Click re-expand
  await send('Runtime.evaluate', {
    expression: `App.toggleSidebar();`
  });
  await sleep(400);

  const expEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const sidebar = document.querySelector('.app-sidebar');
      const brandTitle = document.querySelector('.brand-title');
      return {
        isCollapsed: sidebar.classList.contains('collapsed'),
        sidebarWidth: Math.round(sidebar.getBoundingClientRect().width),
        brandText: brandTitle ? brandTitle.textContent.trim() : '',
        isTruncated: brandTitle ? brandTitle.scrollWidth > brandTitle.clientWidth : false
      };
    })()`,
    returnByValue: true
  });
  const expVal = expEval.result?.value || {};
  console.log(`  [Debug] Expanded sidebarWidth: ${expVal.sidebarWidth}px`);

  check('Sidebar restored to expanded width (280px)', expVal.sidebarWidth === 280);
  check('Brand title restored to "TinhMinhLaKey"', expVal.brandText === 'TinhMinhLaKey');
  check('Re-expanded brand title has 0 truncation', !expVal.isTruncated);

  // TEST 4: Mobile Viewport 375x667 Topbar Test
  console.log('\n--- Test 4: Mobile Viewport 375x667 Topbar ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(500);

  for (const v of views) {
    const mbEval = await send('Runtime.evaluate', {
      expression: `(() => {
        App.navigateTo('${v}');
        const topbarTitle = document.querySelector('.topbar-title');
        const topbar = document.querySelector('.app-topbar');
        return {
          titleText: topbarTitle ? topbarTitle.textContent.trim() : '',
          isTruncated: topbarTitle ? topbarTitle.scrollWidth > topbarTitle.clientWidth : false,
          hasHorizontalOverflow: topbar ? topbar.scrollWidth > topbar.clientWidth : false
        };
      })()`,
      returnByValue: true
    });
    const mbVal = mbEval.result?.value || {};
    check(`Mobile Topbar on view "${v}" ("${mbVal.titleText}"): no truncation & no topbar overflow`,
      !mbVal.isTruncated && !mbVal.hasHorizontalOverflow
    );
  }

  // TEST 5: Narrow Mobile Viewport 360x640 Topbar Test
  console.log('\n--- Test 5: Narrow Mobile Viewport 360x640 Topbar ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(300);

  const narrowEval = await send('Runtime.evaluate', {
    expression: `(() => {
      App.navigateTo('settings'); // longest title: "Cài đặt & Sao lưu"
      const topbarTitle = document.querySelector('.topbar-title');
      const topbar = document.querySelector('.app-topbar');
      return {
        titleText: topbarTitle ? topbarTitle.textContent.trim() : '',
        isTruncated: topbarTitle ? topbarTitle.scrollWidth > topbarTitle.clientWidth : false,
        hasHorizontalOverflow: topbar ? topbar.scrollWidth > topbar.clientWidth : false
      };
    })()`,
    returnByValue: true
  });
  const narrowVal = narrowEval.result?.value || {};
  check('Narrow mobile 360px: Longest title "Cài đặt & Sao lưu" displays without truncation or overflow',
    !narrowVal.isTruncated && !narrowVal.hasHorizontalOverflow
  );

  // Clean up
  ws.close();
  if (chromeProcess) chromeProcess.kill();
  if (serverProcess) serverProcess.kill();

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  if (chromeProcess) chromeProcess.kill();
  if (serverProcess) serverProcess.kill();
  process.exit(1);
});
