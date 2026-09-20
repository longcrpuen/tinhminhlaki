const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = path.join(process.env.TEMP, 'chrome-snap-dropdowns');
const targetDir = 'C:\\Users\\baolo\\.gemini\\antigravity-ide\\brain\\f4a996eb-3cca-456d-a67f-ad77c82d6f89';

async function main() {
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1280,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userData,
    'http://localhost:5173/'
  ]);
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9226/json');
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

  // 1. LMS Preview card with cyber dropdowns
  await send('Runtime.evaluate', {
    expression: `
      App.navigateTo('import-lms');
      App.pasteLmsSampleData();
      App.parseLmsInput();
      const card0 = document.querySelector('.lms-preview-card[data-index="0"]');
      if (card0) card0.scrollIntoView({ behavior: 'instant', block: 'center' });
      // Open difficulty dropdown on card 0
      const diffTrigger = document.querySelector('#lms-diff-dropdown-0 .cyber-dropdown-trigger');
      if (diffTrigger) diffTrigger.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const lmsSnap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'screenshot_lms_cyber_dropdowns.png'), Buffer.from(lmsSnap.data, 'base64'));

  // 2. Exam Setup Modal cyber dropdowns
  await send('Runtime.evaluate', {
    expression: `
      App.closeAllCyberDropdowns();
      App.openExamModal();
      const countTrigger = document.getElementById('exam-count-dropdown-trigger');
      if (countTrigger) countTrigger.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const modalSnap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'screenshot_modal_cyber_dropdowns.png'), Buffer.from(modalSnap.data, 'base64'));

  ws.close();
  proc.kill();
  console.log('Dropdown screenshots captured successfully!');
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
