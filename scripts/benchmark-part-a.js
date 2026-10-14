const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 5185;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, '..', 'scratch', 'chrome-benchmark-a-profile');

async function main() {
  console.log('⚡ Starting Part A Benchmark (Testing with 1,200 cards on dist/)...');

  // Start Server serving dist/
  const serverProcess = spawn('node', ['server.js', 'dist', String(PORT)], {
    cwd: path.resolve(__dirname, '..')
  });

  await new Promise(r => setTimeout(r, 1500));

  // Clean profile
  if (fs.existsSync(USER_DATA_DIR)) {
    try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeProcess = spawn(CHROME_PATH, [
    '--remote-debugging-port=9230',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--window-size=1280,900',
    `http://localhost:${PORT}/`
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

    const targets = await httpGet('http://localhost:9230/json');
    const pageTarget = targets.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(msg.error);
        else cb.resolve(msg.result);
      }
    };

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
      return res.result?.value;
    };

    // Wait for DB ready
    await evaluate(`new Promise(res => {
      const check = () => { if (window.db && window.App) res(true); else setTimeout(check, 50); };
      check();
    })`);

    // 1. Generate 1,200 cards across 6 decks
    console.log('📦 Seeding 1,200 cards across 6 decks...');
    const seedResult = await evaluate(`(async () => {
      const sampleDecks = [
        { name: 'Toán Cao Cấp 1', desc: 'Giải tích cổ điển, đạo hàm và chuỗi số' },
        { name: 'Đại Số Tuyến Tính', desc: 'Ma trận, không gian vector, trị riêng' },
        { name: 'Vật Lý Đại Cương', desc: 'Cơ học chất điểm và nhiệt động lực học' },
        { name: 'Cấu Trúc Dữ Liệu', desc: 'Cây, đồ thị, bảng băm và giải thuật tìm kiếm' },
        { name: 'Hệ Điều Hành & Mạng', desc: 'Tiến trình, bộ nhớ ảo, giao thức TCP/IP' },
        { name: 'Machine Learning Cơ Bản', desc: 'Hồi quy, phân lớp, gradient descent' }
      ];

      const createdDecks = [];
      for (const d of sampleDecks) {
        const deck = await db.saveDeck({ name: d.name, description: d.desc });
        createdDecks.push(deck);
      }

      const totalCards = 1200;
      const cardsPerDeck = Math.floor(totalCards / createdDecks.length);
      const generatedCards = [];

      for (let d = 0; d < createdDecks.length; d++) {
        const deck = createdDecks[d];
        for (let i = 0; i < cardsPerDeck; i++) {
          const cardId = 'bench_card_' + d + '_' + i;
          generatedCards.push({
            id: cardId,
            deckId: deck.id,
            question: 'Câu hỏi kiểm định hiệu năng #' + (d * cardsPerDeck + i + 1) + ': Tính đạo hàm cấp cao $f^{(n)}(x)$ của hàm số $f(x) = e^{2x} \\cos(3x)$?',
            options: [
              { id: 'a', text: 'Đáp án A: Phương án $2^n e^{2x} + C$' },
              { id: 'b', text: 'Đáp án B: Phương án giải tích đúng' },
              { id: 'c', text: 'Đáp án C: Giá trị tiệm cận $\\infty$' },
              { id: 'd', text: 'Đáp án D: Không xác định' }
            ],
            rawOptions: [
              { id: 'a', text: 'Đáp án A: Phương án $2^n e^{2x} + C$' },
              { id: 'b', text: 'Đáp án B: Phương án giải tích đúng' },
              { id: 'c', text: 'Đáp án C: Giá trị tiệm cận $\\infty$' },
              { id: 'd', text: 'Đáp án D: Không xác định' }
            ],
            answerIndex: 1,
            correctOptionId: 'b',
            explanation: 'Sử dụng công thức Leibniz cho đạo hàm của tích: $(uv)^{(n)} = \\sum_{k=0}^n \\binom{n}{k} u^{(k)} v^{(n-k)}$.',
            topic: 'Chương ' + ((i % 5) + 1),
            difficulty: (i % 3 === 0 ? 'hard' : (i % 3 === 1 ? 'medium' : 'easy')),
            type: 'multiple_choice',
            source: 'manual',
            createdAt: Date.now() - (i * 3600000),
            updatedAt: Date.now()
          });
        }
      }

      await db.saveCardsBatch(generatedCards, { forceNew: false });
      return { decksCount: createdDecks.length, cardsCount: generatedCards.length };
    })()`);

    console.log(`✅ Seeded ${seedResult.cardsCount} cards across ${seedResult.decksCount} decks.`);

    // 2. Measure Bank View open & render time (3 runs, take average)
    console.log('\n⏱️ Benchmarking Ngân Hàng Câu Hỏi (Bank View) with 1,200 cards:');
    const bankTimes = [];
    for (let r = 1; r <= 3; r++) {
      const time = await evaluate(`(async () => {
        App.navigateTo('dashboard');
        await new Promise(r => setTimeout(r, 200));

        const t0 = performance.now();
        App.navigateTo('bank');
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const t1 = performance.now();
        return t1 - t0;
      })()`);
      bankTimes.push(time);
      console.log(`   Run ${r}: ${time.toFixed(2)} ms`);
    }
    const avgBank = bankTimes.reduce((a, b) => a + b, 0) / bankTimes.length;

    // 3. Measure Decks View open & render time (3 runs, take average)
    console.log('\n⏱️ Benchmarking Thư Viện Thẻ (Decks View) with 1,200 cards:');
    const deckTimes = [];
    for (let r = 1; r <= 3; r++) {
      const time = await evaluate(`(async () => {
        App.navigateTo('dashboard');
        await new Promise(r => setTimeout(r, 200));

        const t0 = performance.now();
        App.navigateTo('decks');
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const t1 = performance.now();
        return t1 - t0;
      })()`);
      deckTimes.push(time);
      console.log(`   Run ${r}: ${time.toFixed(2)} ms`);
    }
    const avgDecks = deckTimes.reduce((a, b) => a + b, 0) / deckTimes.length;

    const result = {
      timestamp: new Date().toISOString(),
      totalCards: seedResult.cardsCount,
      decksCount: seedResult.decksCount,
      bankOpenTimeMs: avgBank,
      decksOpenTimeMs: avgDecks,
      bankRuns: bankTimes,
      decksRuns: deckTimes
    };

    fs.writeFileSync(path.join(__dirname, 'benchmark-part-a-baseline.json'), JSON.stringify(result, null, 2));
    console.log('\n📊 PART A BASELINE RESULTS:');
    console.log(`   • Ngân Hàng Câu Hỏi: ${avgBank.toFixed(2)} ms`);
    console.log(`   • Thư Viện Thẻ:      ${avgDecks.toFixed(2)} ms`);
    console.log('Saved to scripts/benchmark-part-a-baseline.json');

    ws.close();
  } catch (err) {
    console.error('Benchmark Error:', err);
  } finally {
    try { chromeProcess.kill(); } catch (e) {}
    try { serverProcess.kill(); } catch (e) {}
  }
}

main();
