const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 5188;
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.webmanifest': 'application/manifest+json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function startServer() {
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    const filePath = path.join(distDir, reqUrl);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

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
    const res = await this.send('Runtime.evaluate', {
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

async function runBenchmarkForDevice(mode = 'desktop', cpuThrottlingRate = 1) {
  const isMobile = mode === 'mobile';
  const width = isMobile ? 375 : 1440;
  const height = isMobile ? 667 : 900;
  const cdpPort = 9300 + Math.floor(Math.random() * 500);
  const tempProfile = path.join(__dirname, '..', 'scratch', `cdp-profile-${cdpPort}`);

  if (fs.existsSync(tempProfile)) {
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeArgs = [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu-vsync',
    '--disable-frame-rate-limit',
    `--window-size=${width},${height}`,
    '--no-sandbox',
    '--no-first-run',
    '--disable-background-networking',
    `--user-data-dir=${tempProfile}`,
    `http://localhost:${PORT}/`
  ];

  const proc = spawn(chromePath, chromeArgs);
  proc.stderr.on('data', () => {});
  proc.stdout.on('data', () => {});

  await sleep(2000);

  const tabsRes = await fetch(`http://127.0.0.1:${cdpPort}/json`);
  const tabs = await tabsRes.json();
  const appTab = tabs.find(t => t.url.includes(String(PORT)));
  if (!appTab) throw new Error('MindSparks tab not found!');

  const client = new CDPClient(appTab.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Runtime.enable');
  await client.send('Page.enable');

  if (cpuThrottlingRate > 1) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate });
  }

  if (isMobile) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
      fitWindow: false
    });
    await client.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 1
    });
  }

  await sleep(1200);

  // Inject measurement harness with PerformanceObserver for LongTasks & Layout/Paint tracking
  const harnessScript = `
    window.__perfData = {
      longTasks: [],
      frameTimes: []
    };

    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              window.__perfData.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {}
    }

    window.__measureScreen = function(screenName, actionFn, duration = 1600) {
      return new Promise(async (resolve) => {
        window.__perfData.longTasks = [];
        let frames = 0;
        let deltas = [];
        let lastTime = performance.now();
        const startTime = lastTime;
        let isRunning = true;

        const tickEl = document.createElement('div');
        tickEl.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-999;';
        document.body.appendChild(tickEl);

        function frameLoop(now) {
          const dt = now - lastTime;
          lastTime = now;
          if (dt > 0) deltas.push(dt);
          frames++;
          tickEl.style.transform = 'translateZ(' + (frames % 2) + 'px)';
          if (isRunning) requestAnimationFrame(frameLoop);
        }
        requestAnimationFrame(frameLoop);

        // Execute action (scroll, interaction, or resting)
        let actionInterval = null;
        if (actionFn === 'scroll') {
          const scrollTarget = document.querySelector('.app-main') || window;
          actionInterval = setInterval(() => {
            try {
              if (scrollTarget === window) {
                window.scrollBy(0, 28);
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 40) window.scrollTo(0, 0);
              } else if (scrollTarget) {
                scrollTarget.scrollTop += 28;
                if (scrollTarget.scrollTop + scrollTarget.clientHeight >= scrollTarget.scrollHeight - 40) scrollTarget.scrollTop = 0;
              }
            } catch (e) {}
          }, 16);
        } else if (actionFn === 'flashcard_flip') {
          actionInterval = setInterval(() => {
            if (window.App && typeof window.App.flipFlashcard === 'function') {
              window.App.flipFlashcard();
            }
          }, 350);
        } else if (actionFn === 'tab_wave') {
          let tabIdx = 0;
          const tabNames = ['dashboard', 'decks', 'bank', 'stats', 'settings'];
          actionInterval = setInterval(() => {
            tabIdx = (tabIdx + 1) % tabNames.length;
            if (window.App) window.App.navigateTo(tabNames[tabIdx]);
          }, 380);
        }

        await new Promise(r => setTimeout(r, duration));
        isRunning = false;
        if (actionInterval) clearInterval(actionInterval);
        tickEl.remove();

        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        const avgFps = frames / (totalDuration / 1000);
        const avgFrameTime = totalDuration / frames;

        deltas.sort((a, b) => b - a);
        const maxDelta = deltas[0] || 16.6;
        const p99Index = Math.min(deltas.length - 1, Math.max(0, Math.floor(deltas.length * 0.01)));
        const p99Delta = deltas[p99Index] || maxDelta;
        const minFps = 1000 / maxDelta;

        const longTasks = window.__perfData.longTasks.slice();
        const longTaskCount = longTasks.length;
        const totalLongTaskDuration = Math.round(longTasks.reduce((acc, t) => acc + t.duration, 0));

        resolve({
          screen: screenName,
          frames,
          durationMs: Math.round(totalDuration),
          fps: Math.round(avgFps * 10) / 10,
          frameTimeMs: Math.round(avgFrameTime * 100) / 100,
          minFps: Math.round(minFps * 10) / 10,
          p99FrameTimeMs: Math.round(p99Delta * 100) / 100,
          longTasks: longTaskCount,
          longTaskDurationMs: totalLongTaskDuration
        });
      });
    };
  `;
  await client.evaluate(harnessScript);

  // Wait for IndexedDB auto-seed
  await sleep(600);

  const screensToTest = [
    {
      name: '1. Tổng quan (Dashboard)',
      setup: `App.navigateTo('dashboard');`,
      action: 'scroll'
    },
    {
      name: '2. Thư viện thẻ (Decks)',
      setup: `App.navigateTo('decks');`,
      action: 'scroll'
    },
    {
      name: '3. Ngân hàng câu hỏi (Bank - cuộn dài)',
      setup: `App.navigateTo('bank');`,
      action: 'scroll'
    },
    {
      name: '4. Màn làm bài quizz (Study)',
      setup: `
        const cards = await db.getAllCards();
        App.activeSession = {
          deckId: 'default_deck',
          mode: 'free',
          title: 'Quiz Test',
          cards: cards.slice(0, 10),
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
      `,
      action: 'resting'
    },
    {
      name: '5. Lật thẻ (Flashcard 3D flip)',
      setup: `
        const fcCards = await db.getAllCards();
        App.activeSession = {
          deckId: 'default_deck',
          mode: 'flashcard',
          title: 'Flashcard Test',
          cards: fcCards.slice(0, 10),
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
      `,
      action: 'flashcard_flip'
    },
    {
      name: '6. Nhập từ LMS (Import LMS preview)',
      setup: `
        App.navigateTo('import-lms');
        const sampleBtn = document.querySelector('#btn-lms-paste-sample');
        if (sampleBtn) sampleBtn.click();
        const parseBtn = document.querySelector('#btn-lms-parse');
        if (parseBtn) parseBtn.click();
      `,
      action: 'scroll'
    },
    {
      name: '7. Dán câu hỏi AI (Import text)',
      setup: `
        App.navigateTo('import');
        const txt = document.getElementById('input-import-text');
        if (txt) {
          txt.value = "1. AI là gì?\\nA. Trí tuệ nhân tạo\\nB. Phần mềm\\nC. Hệ điều hành\\nD. Ngôn ngữ\\nĐáp án: A\\n\\n2. Machine Learning là gì?\\nA. Học máy\\nB. Học sinh\\nC. Máy in\\nD. Mạng LAN\\nĐáp án: A";
        }
        const parseBtn = document.getElementById('btn-parse-import');
        if (parseBtn) parseBtn.click();
      `,
      action: 'scroll'
    },
    {
      name: '8. Thống kê (Stats - heatmap)',
      setup: `App.navigateTo('stats');`,
      action: 'scroll'
    },
    {
      name: '9. Cài đặt (Settings)',
      setup: `App.navigateTo('settings');`,
      action: 'scroll'
    },
    {
      name: '10. Chuyển tab (Hiệu ứng sóng curtain)',
      setup: `App.navigateTo('dashboard');`,
      action: 'tab_wave'
    },
    {
      name: '11. Màn kết quả (Pin pixel charging)',
      setup: `
        App._isCompletingSession = false;
        App.activeSession = {
          cards: [1,2,3,4,5,6,7,8,9,10],
          correctCount: 9,
          incorrectCount: 1,
          mode: 'free'
        };
        App.completeSession();
      `,
      action: 'resting'
    }
  ];

  const results = [];

  for (const s of screensToTest) {
    try {
      console.log(` -> Testing ${s.name}...`);
      await client.evaluate(`(async () => { ${s.setup} })()`);
      await sleep(350);
      const res = await client.evaluate(`window.__measureScreen("${s.name}", "${s.action}", 1200)`);
      results.push(res);
      console.log(`[${mode.toUpperCase()}${cpuThrottlingRate > 1 ? ' 4x' : ''}] ${s.name}: ${res.fps} FPS | ${res.frameTimeMs} ms/frame | Min: ${res.minFps} FPS | p99: ${res.p99FrameTimeMs}ms | LongTasks: ${res.longTasks} (${res.longTaskDurationMs}ms)`);
    } catch (err) {
      console.error(`Error testing ${s.name}:`, err.message);
      results.push({ screen: s.name, fps: 0, frameTimeMs: 999, error: err.message });
    }
  }

  client.close();
  proc.kill();

  return results;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 MINDSPARKS PRODUCTION BENCHMARK (PHASE 0 BASELINE)');
  console.log('====================================================\n');

  const server = await startServer();
  console.log(`Preview server listening on port ${PORT} serving dist/\n`);

  console.log('--- 1. BENCHMARKING DESKTOP (1440x900) ---');
  const desktopNormal = await runBenchmarkForDevice('desktop', 1);

  console.log('\n--- 2. BENCHMARKING MOBILE (375x667) ---');
  const mobileNormal = await runBenchmarkForDevice('mobile', 1);

  console.log('\n--- 3. BENCHMARKING DESKTOP (CPU 4x THROTTLING) ---');
  const desktop4x = await runBenchmarkForDevice('desktop', 4);

  console.log('\n--- 4. BENCHMARKING MOBILE (CPU 4x THROTTLING) ---');
  const mobile4x = await runBenchmarkForDevice('mobile', 4);

  server.close();

  const finalReport = {
    timestamp: new Date().toISOString(),
    desktopNormal,
    mobileNormal,
    desktop4x,
    mobile4x
  };

  const isOptimized = process.argv.includes('--optimized');
  const outPath = path.join(__dirname, isOptimized ? 'optimized-report.json' : 'baseline-report.json');
  fs.writeFileSync(outPath, JSON.stringify(finalReport, null, 2));
  console.log(`\n✅ Benchmark report written to: ${outPath}`);
}

main().catch(err => {
  console.error('Fatal Benchmark Error:', err);
  process.exit(1);
});
