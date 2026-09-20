const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = path.join(process.env.TEMP, 'chrome-snap-profile');
const targetDir = 'C:\\Users\\baolo\\.gemini\\antigravity-ide\\brain\\f4a996eb-3cca-456d-a67f-ad77c82d6f89';

async function main() {
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userData,
    'http://localhost:5173/'
  ]);
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9224/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('5173'));

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });
  let id = 1;
  const send = (m, p = {}) => new Promise(r => {
    const cur = id++;
    const h = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === cur) { ws.removeEventListener('message', h); r(msg.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  await send('Runtime.enable');
  await send('Page.enable');

  // 1. Mobile dashboard screenshot
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Runtime.evaluate', { expression: "App.navigateTo('dashboard');" });
  await new Promise(r => setTimeout(r, 600));
  const mobileDashSnap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'screenshot_mobile_bottom_nav.png'), Buffer.from(mobileDashSnap.data, 'base64'));

  // 2. Mobile LMS screenshot
  await send('Runtime.evaluate', { expression: "App.navigateTo('import-lms');" });
  await new Promise(r => setTimeout(r, 600));
  const mobileSnap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'screenshot_mobile_lms.png'), Buffer.from(mobileSnap.data, 'base64'));

  // 3. Desktop LMS screenshot
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 600));
  const deskSnap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'screenshot_desktop_lms.png'), Buffer.from(deskSnap.data, 'base64'));

  ws.close();
  proc.kill();
  console.log('All screenshots captured successfully!');
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
