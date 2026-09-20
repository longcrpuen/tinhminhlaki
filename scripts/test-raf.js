const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--disable-frame-rate-limit',
  '--disable-gpu-vsync',
  '--window-size=1440,900',
  'http://localhost:5173/'
];
const proc = spawn(chromePath, args);
setTimeout(async () => {
  const res = await fetch('http://127.0.0.1:9223/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(m, p = {}) {
    return new Promise(r => {
      const mid = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === mid) {
          ws.removeEventListener('message', handler);
          r(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: mid, method: m, params: p }));
    });
  }
  await send('Runtime.enable');
  
  // Test 1: pure rAF
  const r1 = await send('Runtime.evaluate', {
    expression: `new Promise(res => {
      let f = 0;
      let start = performance.now();
      function loop(now) {
        f++;
        if (now - start < 1000) requestAnimationFrame(loop);
        else res({ f, fps: f / ((now - start)/1000) });
      }
      requestAnimationFrame(loop);
    })`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Pure rAF:', r1.result.value);

  // Test 2: Active frame with visual invalidation
  const r2 = await send('Runtime.evaluate', {
    expression: `new Promise(res => {
      let f = 0;
      let start = performance.now();
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;pointer-events:none;';
      document.body.appendChild(el);
      function loop(now) {
        f++;
        el.style.transform = 'translateZ(' + (f % 2) + 'px)';
        if (now - start < 1000) requestAnimationFrame(loop);
        else {
          el.remove();
          res({ f, fps: f / ((now - start)/1000) });
        }
      }
      requestAnimationFrame(loop);
    })`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Active rAF with invalidation:', r2.result.value);

  proc.kill();
  process.exit(0);
}, 2000);
