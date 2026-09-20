const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = path.join(__dirname, '..', 'scratch', 'chrome-perf-profile');

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

async function runBenchmark() {
  console.log('--- Launching Chrome for Desktop FPS Benchmark ---');
  const args = [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-frame-rate-limit',
    '--disable-gpu-vsync',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userData,
    'http://localhost:5173/'
  ];

  const proc = spawn(chromePath, args);
  proc.stderr.on('data', () => {});

  try {
    await sleep(2500);

    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    const appTab = tabs.find(t => t.url.includes('5173'));
    if (!appTab) {
      throw new Error('Could not find MindSparks tab in Chrome!');
    }

    const client = new CDPClient(appTab.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Runtime.enable');

    // Wait for app initialization
    await sleep(1000);

    // Measure FPS helper in page context
    const measureFn = `
      window.__measureFPS = function(opts = {}) {
        return new Promise((resolve) => {
          const duration = opts.duration || 2000;
          const scroll = !!opts.scroll;
          const container = opts.containerSelector ? document.querySelector(opts.containerSelector) : window;

          let frameCount = 0;
          let deltas = [];
          let lastTime = performance.now();
          const startTime = lastTime;

          // Tiny zero-impact compositor tick trigger so Chromium's uncapped frame loop executes
          const testTickEl = document.createElement('div');
          testTickEl.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-999;';
          document.body.appendChild(testTickEl);

          function tick(now) {
            const dt = now - lastTime;
            lastTime = now;
            if (dt > 0) deltas.push(dt);
            frameCount++;

            // Trigger frame composition tick
            testTickEl.style.transform = 'translateZ(' + (frameCount % 2) + 'px)';

            if (scroll) {
              if (container === window) {
                window.scrollBy(0, 24);
                if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 60)) {
                  window.scrollTo(0, 0);
                }
              } else if (container) {
                container.scrollTop += 24;
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 60) {
                  container.scrollTop = 0;
                }
              }
            }

            if (now - startTime < duration) {
              requestAnimationFrame(tick);
            } else {
              testTickEl.remove();
              const totalMs = now - startTime;
              const avgFps = (frameCount / (totalMs / 1000));
              deltas.sort((a, b) => b - a);
              const maxDelta = deltas[0] || 16.6;
              const minFps = 1000 / maxDelta;
              const p99Index = Math.min(deltas.length - 1, Math.max(0, Math.floor(deltas.length * 0.01)));
              const p99Delta = deltas[p99Index] || maxDelta;
              const p99Fps = 1000 / p99Delta;

              resolve({
                frames: frameCount,
                durationMs: Math.round(totalMs),
                avgFps: Math.round(avgFps * 10) / 10,
                minFps: Math.round(minFps * 10) / 10,
                p99Fps: Math.round(p99Fps * 10) / 10
              });
            }
          }
          requestAnimationFrame(tick);
        });
      };
    `;

    await client.evaluate(measureFn);

    const views = [
      { name: 'Dashboard (Tổng quan) - Nghỉ (Resting)', view: 'dashboard', scroll: false },
      { name: 'Dashboard (Tổng quan) - Cuộn trang (Scroll)', view: 'dashboard', scroll: true },
      { name: 'Ngân hàng câu hỏi (Bank) - Nghỉ (Resting)', view: 'bank', scroll: false },
      { name: 'Ngân hàng câu hỏi (Bank) - Cuộn trang (Scroll)', view: 'bank', scroll: true },
      { name: 'Thống kê (Stats) - Nghỉ (Resting)', view: 'stats', scroll: false },
      { name: 'Thống kê (Stats) - Cuộn trang (Scroll)', view: 'stats', scroll: true },
      { name: 'Cài đặt (Settings) - Nghỉ (Resting)', view: 'settings', scroll: false },
      { name: 'Ôn tập Quizz (Study Quiz) - Nghỉ', view: 'study', scroll: false },
    ];

    const results = [];

    for (const v of views) {
      // Switch view
      await client.evaluate(`
        if (window.App && typeof window.App.navigateTo === 'function') {
          window.App.navigateTo('${v.view}');
        } else if (window.app && typeof window.app.navigateTo === 'function') {
          window.app.navigateTo('${v.view}');
        }
      `);
      await sleep(400);

      // Measure
      const metrics = await client.evaluate(`window.__measureFPS({ duration: 2000, scroll: ${v.scroll} })`);
      results.push({
        name: v.name,
        avgFps: metrics.avgFps,
        minFps: metrics.minFps,
        p99Fps: metrics.p99Fps,
        frames: metrics.frames,
        pass80: metrics.avgFps >= 80
      });
      console.log(`[Result] ${v.name}: Avg FPS = ${metrics.avgFps} (Min: ${metrics.minFps}, p99: ${metrics.p99Fps}) -> Pass 80+: ${metrics.avgFps >= 80}`);
    }

    client.close();
    return results;
  } finally {
    proc.kill();
  }
}

if (require.main === module) {
  runBenchmark().then(res => {
    console.log('\n--- SUMMARY BENCHMARK TABLE ---');
    console.table(res);
  }).catch(e => {
    console.error('Benchmark error:', e);
    process.exit(1);
  });
}

module.exports = { runBenchmark };
