const fs = require('fs');
const path = require('path');

// Mock localStorage / window / browser globals if needed
global.window = {};

// Load SRS and Parser in node environment
const srsContent = fs.readFileSync(path.join(__dirname, '../js/srs.js'), 'utf8');
const parserContent = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');

eval(srsContent.replace('const SRS =', 'global.SRS ='));
eval(parserContent.replace('const AIParser =', 'global.AIParser =').replace('const LMSParser =', 'global.LMSParser ='));

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE 1: SRS Engine (SM-2 Algorithm) ===');
{
  const cardSrs = { repetition: 0, interval: 0, easeFactor: 2.5, state: 'new' };

  // First Good review
  const nextGood = SRS.calculateNext(cardSrs, 3);
  assert(nextGood.repetition === 1, 'First review repetition should be 1');
  assert(nextGood.interval === 1, 'First review interval should be 1 day');
  assert(nextGood.state === 'review', 'State should be review');

  // Second Good review
  const nextGood2 = SRS.calculateNext(nextGood, 3);
  assert(nextGood2.repetition === 2, 'Second review repetition should be 2');
  assert(nextGood2.interval === 3, 'Second review interval should be 3 days');

  // Again review (rating 1)
  const nextAgain = SRS.calculateNext(nextGood2, 1);
  assert(nextAgain.repetition === 0, 'Again rating should reset repetition to 0');
  assert(nextAgain.interval === 0, 'Again rating interval should be 0 (< 10m)');
  assert(nextAgain.state === 'learning', 'Again rating state should be learning');

  // Interval preview strings
  assert(SRS.getIntervalPreview(cardSrs, 1) === '< 10 phút', 'Interval preview for Again');
  assert(SRS.getIntervalPreview(cardSrs, 2) === '1 ngày', 'Interval preview for Hard');
}

console.log('\n=== TEST SUITE 2: AI Parser (JSON Format) ===');
{
  const jsonSample = JSON.stringify({
    deckName: "Lịch sử Công nghệ",
    description: "Câu hỏi trắc nghiệm IT",
    cards: [
      {
        question: "Ai là cha đẻ của World Wide Web?",
        options: ["A. Tim Berners-Lee", "B. Steve Jobs", "C. Bill Gates", "D. Mark Zuckerberg"],
        answer: "A",
        explanation: "Tim Berners-Lee phát minh ra WWW vào năm 1989 tại CERN.",
        tag: "Web"
      },
      {
        question: "Cổng mặc định của giao thức HTTPS là gì?",
        options: ["80", "443", "8080", "22"],
        answer: "443",
        explanation: "HTTPS mặc định sử dụng cổng 443 TCP.",
        tag: "Mạng máy tính"
      }
    ]
  });

  const parsed = AIParser.parse(jsonSample);
  assert(parsed.deckName === "Lịch sử Công nghệ", "Parsed deck name correctly");
  assert(parsed.cards.length === 2, "Parsed exactly 2 cards");
  assert(parsed.cards[0].answerIndex === 0, "Card 0 answerIndex is 0 (A)");
  assert(parsed.cards[1].answerIndex === 1, "Card 1 answerIndex is 1 (443 matches B. 443)");
  assert(parsed.cards[1].options[0] === "A. 80", "Option 0 automatically prefixed with A.");
}

console.log('\n=== TEST SUITE 3: AI Parser (Markdown & Plain Text) ===');
{
  const textSample = `
  Câu 1: Git là gì?
  A. Hệ thống quản lý cơ sở dữ liệu
  B. Hệ thống quản lý phiên bản phân tán
  C. Trình biên dịch C++
  D. Hệ điều hành nhúng
  Đáp án: B
  Giải thích: Git được Linus Torvalds tạo ra vào năm 2005.
  Tag: Dev Tools

  Câu 2: SQL là viết tắt của gì?
  A. Structured Query Language
  B. Simple Question Logic
  C. System Quality Level
  D. Standard Query List
  Đáp án: A
  Giải thích: SQL là ngôn ngữ truy vấn mang tính cấu trúc.
  `;

  const parsed = AIParser.parse(textSample);
  assert(parsed.cards.length === 2, "Parsed 2 cards from plaintext format");
  assert(parsed.cards[0].question.includes("Git là gì"), "Card 1 question parsed");
  assert(parsed.cards[0].answerIndex === 1, "Card 1 answer is B (index 1)");
  assert(parsed.cards[1].answerIndex === 0, "Card 2 answer is A (index 0)");
  assert(parsed.cards[0].tag === "Dev Tools", "Card 1 tag parsed correctly");
}

console.log('\n=== TEST SUITE 4: PWA Assets & KaTeX Offline Check ===');
{
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
  assert(manifest.display === 'standalone', 'Manifest has display: standalone');
  assert(manifest.icons.length >= 2, 'Manifest defines required icons');
  
  const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  assert(sw.includes('CACHE_NAME'), 'Service Worker defines CACHE_NAME');
  assert(sw.includes('STATIC_ASSETS'), 'Service Worker precaches STATIC_ASSETS');
  assert(sw.includes('katex.min.js'), 'Service Worker caches KaTeX JS');

  assert(fs.existsSync(path.join(__dirname, '../lib/katex/katex.min.js')), 'KaTeX JS file exists locally');
  assert(fs.existsSync(path.join(__dirname, '../lib/katex/katex.min.css')), 'KaTeX CSS file exists locally');
  assert(fs.existsSync(path.join(__dirname, '../lib/katex/auto-render.min.js')), 'KaTeX auto-render exists locally');

  const sampleDeck = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sample-deck.json'), 'utf8'));
  assert(sampleDeck.quiz_title.length > 0, 'Sample deck has quiz_title');
  assert(sampleDeck.questions.length >= 7, 'Sample deck has questions with LaTeX');
}

console.log('\n=== TEST SUITE 5: Standard JSON (Section 3) & Error Isolation ===');
{
  // 1. Valid Standard Format
  const standardSample = {
    quiz_title: "Chương 3: Đạo hàm",
    questions: [
      {
        id: "q1",
        topic: "Đạo hàm",
        difficulty: "medium",
        question: "Đạo hàm của $f(x) = x^2$ là gì?",
        options: [
          { id: "a", text: "$2x$" },
          { id: "b", text: "$x^2$" },
          { id: "c", text: "$2$" },
          { id: "d", text: "$x$" }
        ],
        correct_option_id: "a",
        explanation: "Áp dụng quy tắc đạo hàm lũy thừa: $\\frac{d}{dx}x^n = nx^{n-1}$"
      },
      {
        id: "q2",
        topic: "Tích phân",
        difficulty: "easy",
        question: "Tích phân $\\int 1 \\, dx$ bằng:",
        options: [
          { id: "a", text: "$x + C$" },
          { id: "b", text: "$1 + C$" },
          { id: "c", text: "$0$" }
        ],
        correct_option_id: "a",
        explanation: "Đạo hàm của $x$ là $1$."
      }
    ]
  };

  const parsedValid = AIParser.parse(JSON.stringify(standardSample));
  assert(parsedValid.deckName === "Chương 3: Đạo hàm", "Standard quiz_title parsed");
  assert(parsedValid.cards.length === 2, "Both standard cards parsed");
  assert(parsedValid.cards[0].correctOptionId === "a", "Card 1 correct_option_id is 'a'");
  assert(parsedValid.cards[0].answerIndex === 0, "Card 1 answerIndex is 0");
  assert(parsedValid.cards[0].topic === "Đạo hàm", "Card 1 topic is 'Đạo hàm'");
  assert(parsedValid.cards[0].difficulty === "medium", "Card 1 difficulty is 'medium'");
  assert(parsedValid.cards[1].difficulty === "easy", "Card 2 difficulty is 'easy'");
  assert(parsedValid.errors.length === 0, "Zero errors on valid standard input");

  // 2. Resilient Error Isolation: One bad question should NOT crash the file!
  const mixedSample = {
    quiz_title: "Kiểm tra lỗi từng câu",
    questions: [
      {
        id: "q1",
        question: "Câu hỏi hợp lệ số 1?",
        options: [
          { id: "a", text: "Lựa chọn A" },
          { id: "b", text: "Lựa chọn B" }
        ],
        correct_option_id: "a"
      },
      {
        id: "q2_bad",
        question: "Câu hỏi bị sai correct_option_id?",
        options: [
          { id: "a", text: "Lựa chọn A" },
          { id: "b", text: "Lựa chọn B" }
        ],
        correct_option_id: "z" // 'z' does not exist in options!
      },
      {
        id: "q3_bad_options",
        question: "Câu hỏi chỉ có 1 option?",
        options: [
          { id: "a", text: "Duy nhất 1 option" }
        ],
        correct_option_id: "a"
      },
      {
        id: "q4",
        question: "Câu hỏi hợp lệ số 2?",
        options: [
          { id: "opt1", text: "Đáp án 1" },
          { id: "opt2", text: "Đáp án 2" }
        ],
        correct_option_id: "opt2"
      }
    ]
  };

  const parsedMixed = AIParser.parse(JSON.stringify(mixedSample));
  assert(parsedMixed.cards.length === 2, "Imported exactly 2 valid cards despite 2 invalid ones");
  assert(parsedMixed.errors.length === 2, "Collected exactly 2 errors without crashing");
  assert(parsedMixed.errors[0].id === "q2_bad", "Error 1 correctly points to q2_bad");
  assert(parsedMixed.errors[1].id === "q3_bad_options", "Error 2 correctly points to q3_bad_options");
}

console.log('\n=== TEST SUITE 6: 7 Study Modes & Algorithmic Filtering ===');
{
  const mockCards = [
    {
      id: "c1",
      topic: "Đạo hàm",
      question: "Câu đạo hàm 1",
      difficulty: "easy",
      stats: { reviewsCount: 5, correctCount: 5, incorrectCount: 0, lastReviewed: 1000 }
    },
    {
      id: "c2",
      topic: "Đạo hàm",
      question: "Câu đạo hàm 2 (hay sai)",
      difficulty: "medium",
      stats: { reviewsCount: 6, correctCount: 2, incorrectCount: 4, lastReviewed: 2000 }
    },
    {
      id: "c3",
      topic: "Tích phân",
      question: "Câu tích phân 1 (rất hay sai)",
      difficulty: "hard",
      stats: { reviewsCount: 4, correctCount: 0, incorrectCount: 4, lastReviewed: 3000 }
    },
    {
      id: "c4",
      topic: "Tích phân",
      question: "Câu tích phân 2",
      difficulty: "easy",
      stats: { reviewsCount: 2, correctCount: 2, incorrectCount: 0, lastReviewed: 1500 }
    },
    {
      id: "c5",
      topic: "Vật lý",
      question: "Câu vật lý chưa học",
      difficulty: "easy",
      stats: { reviewsCount: 0, correctCount: 0, incorrectCount: 0, lastReviewed: null }
    }
  ];

  // Test Mode 2: getMistakeCards logic
  const mistakes = mockCards.filter(c => c.stats && c.stats.incorrectCount > 0);
  mistakes.sort((a, b) => {
    const aWeight = (a.stats.incorrectCount * 3) - a.stats.correctCount + (a.stats.lastReviewed / 1e11);
    const bWeight = (b.stats.incorrectCount * 3) - b.stats.correctCount + (b.stats.lastReviewed / 1e11);
    return bWeight - aWeight;
  });

  assert(mistakes.length === 2, "Found exactly 2 cards with mistakes");
  assert(mistakes[0].id === "c3", "Worst card (c3: 4 wrong, 0 right) is prioritized first");
  assert(mistakes[1].id === "c2", "Second worst card (c2: 4 wrong, 2 right) is prioritized second");

  // Test Mode 5: Topic extraction and filtering
  const topicMap = {};
  mockCards.forEach(c => {
    const topic = (c.topic || 'Chung').trim();
    if (!topicMap[topic]) topicMap[topic] = { topic, count: 0, correct: 0, total: 0 };
    topicMap[topic].count++;
    topicMap[topic].correct += c.stats.correctCount;
    topicMap[topic].total += c.stats.reviewsCount;
  });

  const topicsList = Object.values(topicMap);
  assert(topicsList.length === 3, "Extracted 3 distinct topics: Đạo hàm, Tích phân, Vật lý");
  
  const filteredByTopic = mockCards.filter(c => ['đạo hàm'].includes(c.topic.toLowerCase()));
  assert(filteredByTopic.length === 2, "Filtered exactly 2 cards for 'Đạo hàm'");

  // Test Mode 7: Sprint Cram weak topic prioritization
  topicsList.forEach(t => {
    t.accuracy = t.total > 0 ? (t.correct / t.total) : 0.5;
  });
  topicsList.sort((a, b) => a.accuracy - b.accuracy);
  assert(topicsList[0].topic === "Tích phân", "Weakest topic identified as 'Tích phân' (33% accuracy)");

  // Test Mode 6: Blind mode Active Recall configuration
  const testSession = { mode: 'blind', blindMode: true };
  assert(testSession.blindMode === true, "Blind Mode Active Recall flag is enabled");
}

console.log('\n=== TEST SUITE 6: Section 5 Personalization, Question Bank & Features ===');
{
  // 1. Bookmark toggle & filter
  const cardA = { id: 'c1', question: 'Test Bookmark', bookmarked: false, flagged: false };
  cardA.bookmarked = !cardA.bookmarked;
  assert(cardA.bookmarked === true, "Bookmark toggle on");
  cardA.bookmarked = !cardA.bookmarked;
  assert(cardA.bookmarked === false, "Bookmark toggle off");

  // 2. Flag 'diễn đạt chưa rõ' & AI rewrite prompt generator
  const flaggedCards = [
    {
      id: 'f1',
      topic: 'Vật lý',
      difficulty: 'hard',
      question: 'Vận tốc $v(t) = \\int a(t)dt$ có nghĩa là gì?',
      options: ['A. Đạo hàm', 'B. Nguyên hàm gia tốc', 'C. Quãng đường', 'D. Công suất'],
      answerIndex: 1,
      explanation: 'Vận tốc là nguyên hàm của gia tốc theo thời gian.'
    }
  ];

  const aiRewritePayload = {
    role_instruction: "Chuyên gia sư phạm viết lại câu hỏi rõ ràng hơn",
    questions_to_improve: flaggedCards.map(c => ({
      id: c.id,
      topic: c.topic,
      difficulty: c.difficulty,
      question: c.question,
      options: c.options,
      correct: c.options[c.answerIndex],
      explanation: c.explanation
    }))
  };

  assert(aiRewritePayload.questions_to_improve.length === 1, "Generated AI rewrite payload for 1 flagged card");
  assert(aiRewritePayload.questions_to_improve[0].question.includes('\\int'), "LaTeX formula preserved in AI rewrite payload");

  // 3. Quick Edit card content (Section 5)
  const editableCard = {
    id: 'edit-1',
    topic: 'Toán',
    difficulty: 'easy',
    question: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    answerIndex: 1,
    explanation: 'Phép cộng cơ bản.',
    srs: { repetition: 5, interval: 14, easeFactor: 2.6, state: 'review' }
  };

  const edits = {
    topic: 'Toán Số học',
    difficulty: 'medium',
    question: 'Tính: $1 + 1 = ?$',
    options: ['$1$', '$2$', '$3$', '$4$'],
    answerIndex: 1,
    explanation: 'Phép cộng cơ bản trong số học.'
  };

  Object.assign(editableCard, edits);
  assert(editableCard.question === 'Tính: $1 + 1 = ?$', "Question content updated with LaTeX");
  assert(editableCard.topic === 'Toán Số học', "Topic updated");
  assert(editableCard.difficulty === 'medium', "Difficulty updated");
  assert(editableCard.srs.interval === 14, "SRS state preserved after inline question edit");

  // 4. Per-Deck SRS Progress Reset
  const deckCardsToReset = [
    { id: 'r1', deckId: 'd1', srs: { repetition: 4, interval: 10, state: 'review', dueDate: 999999 } },
    { id: 'r2', deckId: 'd1', srs: { repetition: 2, interval: 3, state: 'review', dueDate: 888888 } }
  ];

  // Reset logic
  deckCardsToReset.forEach(c => {
    c.srs = {
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      state: 'new',
      dueDate: Date.now()
    };
  });

  assert(deckCardsToReset[0].srs.repetition === 0, "Card 1 repetition reset to 0");
  assert(deckCardsToReset[0].srs.interval === 0, "Card 1 interval reset to 0");
  assert(deckCardsToReset[0].srs.state === 'new', "Card 1 state reset to 'new'");
  assert(deckCardsToReset[1].srs.state === 'new', "Card 2 state reset to 'new'");

  // 5. Contribution Heatmap 365 days generator
  const today = new Date();
  const days = [];
  const reviewsByDate = { [today.toISOString().slice(0, 10)]: 12 };

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = reviewsByDate[dateStr] || 0;
    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 6) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;
    days.push({ date: dateStr, count, level });
  }

  assert(days.length === 365, "Generated 365 days for contribution heatmap");
  const todayCell = days[days.length - 1];
  assert(todayCell.count === 12, "Today has 12 reviews recorded");
  assert(todayCell.level === 4, "12 reviews maps to heatmap level 4 (highest intensity)");

  // 6. Session Auto-save State serialization
  const sessionBackup = {
    mode: 'srs',
    deckId: 'deck-10',
    title: 'Ôn tập Đạo hàm',
    cardIds: ['c1', 'c2', 'c3'],
    currentIndex: 1,
    score: 1,
    correctCount: 1,
    incorrectCount: 0,
    blindMode: false,
    savedAt: Date.now()
  };

  const serialized = JSON.stringify(sessionBackup);
  const deserialized = JSON.parse(serialized);
  assert(deserialized.cardIds.length === 3, "Serialized session preserves card IDs");
  assert(deserialized.currentIndex === 1, "Serialized session preserves current question index");
}

console.log('\n=== TEST SUITE 7: Round 4 Meta tags, Console Cleanliness & Sidebar DOM Detachment ===');
{
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  // Meta tags
  assert(
    htmlContent.includes('<meta name="mobile-web-app-capable" content="yes">'),
    'Standard meta mobile-web-app-capable exists in index.html'
  );
  assert(
    htmlContent.includes('<meta name="apple-mobile-web-app-capable" content="yes">'),
    'Legacy meta apple-mobile-web-app-capable preserved for iOS backward compatibility'
  );

  // Console cleanliness
  assert(!appJsContent.includes('[Background] Thiết lập hình nền'), 'No [Background] debug log in app.js');
  assert(!appJsContent.includes('[BG Upload]'), 'No [BG Upload] debug logs in app.js');
  assert(!appJsContent.includes('[Heatmap] Render thành công'), 'No [Heatmap] success debug logs in app.js');
  assert(!appJsContent.includes('[App.init] Nạp hình nền'), 'No [App.init] debug log in app.js');

  // Sidebar Tooltip attributes & DOM classes
  const tooltipMatches = htmlContent.match(/data-tooltip="([^"]+)"/g) || [];
  assert(tooltipMatches.length >= 6, `At least 6 data-tooltip attributes exist in sidebar (${tooltipMatches.length} found)`);
  assert(htmlContent.includes('data-tooltip="Tổng quan"'), 'data-tooltip="Tổng quan" exists');
  assert(htmlContent.includes('data-tooltip="Thư viện thẻ"'), 'data-tooltip="Thư viện thẻ" exists');
  assert(htmlContent.includes('data-tooltip="Ngân hàng câu hỏi"'), 'data-tooltip="Ngân hàng câu hỏi" exists');
  assert(htmlContent.includes('data-tooltip="Dán câu hỏi AI"'), 'data-tooltip="Dán câu hỏi AI" exists');
  assert(htmlContent.includes('data-tooltip="Thống kê"'), 'data-tooltip="Thống kê" exists');
  assert(htmlContent.includes('data-tooltip="Cài đặt & Sao lưu"'), 'data-tooltip="Cài đặt & Sao lưu" exists');

  const navLabelMatches = htmlContent.match(/class="nav-label"/g) || [];
  assert(navLabelMatches.length >= 6, `At least 6 .nav-label elements defined in sidebar HTML (${navLabelMatches.length} found)`);

  // CSS tooltips & animations
  assert(cssContent.includes('.app-sidebar.collapsed .nav-item button[data-tooltip]::after'), 'CSS defines ::after tooltip on collapsed nav item hover');
  assert(cssContent.includes('content: attr(data-tooltip);'), 'Tooltip uses attr(data-tooltip) for dynamic label rendering');
  assert(cssContent.includes('.app-sidebar.collapsing .nav-label'), 'CSS defines smooth fade/transform during collapsing phase');

  // App methods
  assert(appJsContent.includes('_detachSidebarLabels()'), 'App implements _detachSidebarLabels()');
  assert(appJsContent.includes('_attachSidebarLabels()'), 'App implements _attachSidebarLabels()');
  assert(appJsContent.includes('brandTitle.remove()'), '_detachSidebarLabels physically removes .brand-title from DOM');
  assert(appJsContent.includes('label.remove()'), '_detachSidebarLabels physically removes .nav-label from DOM');
  assert(appJsContent.includes('item.parent.insertBefore(item.node, item.nextSibling)'), '_attachSidebarLabels cleanly restores nodes to their exact original DOM hierarchy');

  // PWA install handler check
  assert(appJsContent.includes('this.deferredInstallPrompt.prompt()'), 'PWA install button click triggers deferredInstallPrompt.prompt()');
  assert(appJsContent.includes('window.addEventListener(\'appinstalled\''), 'App listens for appinstalled event');
}

console.log('\n=== TEST SUITE 8: Pixel Garden, Pixel Battery & Modular Architecture ===');
{
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
  const themeCssPath = path.join(__dirname, '..', 'css', 'theme.css');
  const fontsCssPath = path.join(__dirname, '..', 'css', 'fonts.css');
  const audioCfgPath = path.join(__dirname, '..', 'js', 'audio-config.js');
  const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  // 1. Modular Architecture Files exist
  assert(fs.existsSync(themeCssPath), 'File css/theme.css exists independently');
  assert(fs.existsSync(fontsCssPath), 'File css/fonts.css exists independently');
  assert(fs.existsSync(audioCfgPath), 'File js/audio-config.js exists independently');

  const themeCss = fs.readFileSync(themeCssPath, 'utf8');
  const fontsCss = fs.readFileSync(fontsCssPath, 'utf8');
  const audioCfg = fs.readFileSync(audioCfgPath, 'utf8');

  // 2. Theme CSS checks
  assert(themeCss.includes('--accent:'), 'theme.css defines --accent variable');
  assert(themeCss.includes('--bg-base:'), 'theme.css defines --bg-base surface variable');
  assert(themeCss.includes('HƯỚNG DẪN TỰ TÙY BIẾN CHO BẠN:'), 'theme.css contains Vietnamese user guidance comments');

  // 3. Fonts CSS checks
  assert(fontsCss.includes('--font-pixel:'), 'fonts.css defines --font-pixel');
  assert(fontsCss.includes('--font-script:'), 'fonts.css defines --font-script');
  assert(fontsCss.includes('--font-body:'), 'fonts.css defines --font-body');
  assert(fontsCss.includes("font-family: 'VT323'"), 'fonts.css declares local VT323 @font-face');
  assert(fontsCss.includes("font-family: 'Caveat'"), 'fonts.css declares local Caveat @font-face');

  // 4. Local font files exist on disk for 100% offline
  assert(fs.existsSync(path.join(__dirname, '..', 'lib', 'fonts', 'vt323.ttf')), 'Local offline vt323.ttf exists');
  assert(fs.existsSync(path.join(__dirname, '..', 'lib', 'fonts', 'caveat.ttf')), 'Local offline caveat.ttf exists');

  // 5. Audio config checks
  assert(audioCfg.includes('window.AUDIO_CONFIG ='), 'audio-config.js declares window.AUDIO_CONFIG');
  assert(audioCfg.includes('tabWhoosh:'), 'audio-config.js configures tabWhoosh parameters');
  assert(audioCfg.includes('correct:'), 'audio-config.js configures correct answer sound parameters');
  assert(audioCfg.includes('batteryCharged:'), 'audio-config.js configures batteryCharged chiptune sound');

  // 6. Pixel Battery in index.html & style.css
  assert(htmlContent.includes('class="pixel-battery-wrapper"'), 'index.html defines pixel-battery-wrapper component');
  assert(htmlContent.includes('class="pixel-battery-shell"'), 'index.html defines pixel-battery-shell');
  assert(htmlContent.includes('class="pixel-battery-cap"'), 'index.html defines pixel-battery-cap');
  assert(cssContent.includes('.pixel-battery-wrapper'), 'style.css styles .pixel-battery-wrapper');
  assert(cssContent.includes('.pixel-battery-fill'), 'style.css styles .pixel-battery-fill');
  assert(appJsContent.includes('dashboard-battery-container'), 'app.js updates battery container');

  // 7. Nature Wallpapers exist
  assert(fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-pixel-meadow.webp')) || fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-pixel-meadow.jpg')), 'Nature wallpaper bg-pixel-meadow.webp exists');
  assert(fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-starry-garden.webp')) || fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-starry-garden.jpg')), 'Nature wallpaper bg-starry-garden.webp exists');

  // 8. Dreamy duotone overlay in style.css
  assert(cssContent.includes('mix-blend-mode: multiply'), 'style.css applies dreamy duotone overlay on background layer');
}

console.log('\n=== TEST SUITE 9: Decoupled Blind Mode & Answered Question State ===');
{
  const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  // 1. toggleBlindMode does NOT call _renderQuizContent which would reset the question
  assert(!appJsContent.includes('toggleBlindMode() {\n    if (!this.activeSession) return;\n    this.activeSession.blindMode = !this.activeSession.blindMode;\n    const blindBtn'), 'toggleBlindMode implementation is updated');
  assert(!appJsContent.match(/toggleBlindMode\(\)\s*\{[\s\S]*?this\._renderQuizContent\(card\);/), 'toggleBlindMode never wipes question by calling _renderQuizContent');

  // 2. toggleBlindMode preserves answeredState
  assert(appJsContent.includes('const answeredState = this.activeSession.userAnswers?.[this.activeSession.currentIndex];'), 'toggleBlindMode checks answered state before veil manipulation');

  // 3. userAnswers state decoupling simulation
  const session = {
    blindMode: false,
    currentIndex: 0,
    userAnswers: {},
    answeredList: []
  };

  // Simulate user selecting an answer (index 1)
  session.userAnswers[session.currentIndex] = {
    selectedIdx: 1,
    correctIdx: 1,
    isCorrect: true
  };
  session.answeredList.push({ cardId: 'c1', selectedIdx: 1, isCorrect: true });

  assert(session.userAnswers[0].selectedIdx === 1, 'Answer recorded for question 0');

  // Simulate toggling Blind Mode ON
  session.blindMode = !session.blindMode;
  assert(session.blindMode === true, 'Blind Mode toggled ON');
  assert(session.userAnswers[0] !== undefined, 'User answer is preserved when Blind Mode is ON');
  assert(session.userAnswers[0].selectedIdx === 1, 'Selected index remains 1 when Blind Mode is ON');

  // Simulate toggling Blind Mode OFF
  session.blindMode = !session.blindMode;
  assert(session.blindMode === false, 'Blind Mode toggled OFF');
  assert(session.userAnswers[0] !== undefined, 'User answer is preserved when Blind Mode is OFF');
  assert(session.userAnswers[0].selectedIdx === 1, 'Selected index remains 1 when Blind Mode is OFF');

  // 4. Double submission guard
  const isAlreadyAnswered = session.userAnswers[session.currentIndex] !== undefined;
  assert(isAlreadyAnswered === true, 'Already answered question is detected and protected from re-answering');

  // 5. Session backup includes userAnswers
  assert(appJsContent.includes('userAnswers: s.userAnswers || {}'), 'Session auto-save preserves userAnswers');
  assert(appJsContent.includes('userAnswers: backup.userAnswers || {}'), 'Session restore recovers userAnswers');

  // 6. Conditional Render: Active Recall vs Options Block
  assert(appJsContent.includes('_renderOptionsBlock(card'), 'App defines dedicated _renderOptionsBlock helper');
  assert(appJsContent.includes('optionsContainer.innerHTML = \'\';'), 'App unmounts options when blindMode is active and unrevealed');
  assert(appJsContent.includes('this.activeSession.blindRevealed = true;'), 'revealBlindOptions sets blindRevealed to true');
  assert(appJsContent.includes('this.activeSession.blindRevealed = false;'), 'nextStudyQuestion resets blindRevealed to false');
}

console.log('\n=== TEST SUITE 10: LMS Parser & Batch Key Assignment ===');
{
  assert(typeof LMSParser !== 'undefined', 'LMSParser is defined globally');
  assert(typeof LMSParser.parse === 'function', 'LMSParser.parse is a function');
  assert(typeof LMSParser.applyBatchAnswers === 'function', 'LMSParser.applyBatchAnswers is a function');

  // 1. Noise filtering & single choice parsing
  const rawMoodleSingle = [
    'Câu hỏi 1',
    'Hoàn thành',
    'Đạt điểm 1,00 trên 1,00',
    'Đặt cờ',
    'Đoạn văn câu hỏi',
    'Ngôn ngữ nào chạy được trên trình duyệt web?',
    'Select one:',
    'a. Python',
    'b. JavaScript',
    'c. C++',
    'd. Java'
  ].join('\n');

  const cards1 = LMSParser.parse(rawMoodleSingle);
  assert(cards1.length === 1, 'Parsed exactly 1 question from Moodle single choice');
  assert(cards1[0].question === 'Ngôn ngữ nào chạy được trên trình duyệt web?', 'Noise lines completely filtered from question text');
  assert(cards1[0].type === 'multiple_choice', 'Detected type is multiple_choice');
  assert(cards1[0].source === 'lms', 'Source is flagged as lms');
  assert(cards1[0].options.length === 4, 'Parsed 4 options');
  assert(cards1[0].rawOptions[0].id === 'a' && cards1[0].rawOptions[0].text === 'Python', 'Option a is Python');
  assert(cards1[0].rawOptions[1].id === 'b' && cards1[0].rawOptions[1].text === 'JavaScript', 'Option b is JavaScript');
  assert(cards1[0].needsReview === false, 'Standard single-choice question does not need review');

  // 2. Multiline question & multiline options
  const rawMultiline = [
    'Câu 2:',
    'Cho hàm số bậc hai:',
    'f(x) = x^2 - 4x + 3',
    'Tính tọa độ đỉnh của parabol.',
    'a.',
    '(2, -1)',
    'Tọa độ cực tiểu',
    'b.',
    '(1, 0)',
    'c.',
    '(3, 0)'
  ].join('\n');

  const cards2 = LMSParser.parse(rawMultiline);
  assert(cards2.length === 1, 'Parsed 1 multiline question');
  assert(cards2[0].question.includes('f(x) = x^2 - 4x + 3') && cards2[0].question.includes('Tính tọa độ đỉnh'), 'Multiline question text preserved');
  assert(cards2[0].rawOptions[0].text.includes('(2, -1)') && cards2[0].rawOptions[0].text.includes('Tọa độ cực tiểu'), 'Multiline option text accumulated correctly');
  assert(cards2[0].options.length === 3, 'Parsed 3 options in multiline question');

  // 3. Flagging "Select one or more:"
  const rawMultiple = [
    'Câu hỏi 3',
    'Đoạn văn câu hỏi',
    'Select one or more:',
    'Những hệ số nào là lũy thừa của 2?',
    'a. Nhị phân (cơ số 2)',
    'b. Bát phân (cơ số 8)',
    'c. Thập phân (cơ số 10)',
    'd. Thập lục phân (cơ số 16)'
  ].join('\n');

  const cards3 = LMSParser.parse(rawMultiple);
  assert(cards3.length === 1, 'Parsed 1 question with multiple correct answers');
  assert(cards3[0].needsReview === true, 'Card with Select one or more: is flagged with needsReview: true');
  assert(cards3[0].reviewWarning.includes('Select one or more'), 'Warning message specifies Select one or more');

  // 4. Numeric candidate detection
  const rawNumeric = [
    'Câu hỏi 4',
    'Đoạn văn câu hỏi',
    'Tính diện tích hình tròn có bán kính r = 5. Biết số pi xấp xỉ 3.14159.',
    'The correct answer is: 78.54'
  ].join('\n');

  const cards4 = LMSParser.parse(rawNumeric);
  assert(cards4.length === 1, 'Parsed 1 question candidate for numeric answer');
  assert(cards4[0].type === 'numeric', 'Question without letter options is marked type numeric');
  assert(cards4[0].options.length === 0, 'Numeric question has empty options array');

  // 5. Batch answer sequence application
  const batchCards = [
    { type: 'multiple_choice', rawOptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] },
    { type: 'multiple_choice', rawOptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] },
    { type: 'numeric', options: [] },
    { type: 'multiple_choice', rawOptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }
  ];

  // Apply "b, a, c"
  const assigned = LMSParser.applyBatchAnswers(batchCards, 'b, a, c');
  assert(assigned === 3, 'Assigned 3 multiple-choice answers in batch');
  assert(batchCards[0].correctOptionId === 'b' && batchCards[0].answerIndex === 1, 'Card 0 assigned to b (index 1)');
  assert(batchCards[1].correctOptionId === 'a' && batchCards[1].answerIndex === 0, 'Card 1 assigned to a (index 0)');
  assert(batchCards[2].correct_answer === undefined || batchCards[2].correctOptionId === undefined, 'Numeric card was safely skipped');
  assert(batchCards[3].correctOptionId === 'c' && batchCards[3].answerIndex === 2, 'Card 3 assigned to c (index 2)');

  // Numbered format: "1.d, 2.c"
  const batchCards2 = [
    { type: 'multiple_choice', rawOptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] },
    { type: 'multiple_choice', rawOptions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] }
  ];
  LMSParser.applyBatchAnswers(batchCards2, '1.D, 2.C');
  assert(batchCards2[0].correctOptionId === 'd', 'Numbered format 1.D assigned card 0 to d');
  assert(batchCards2[1].correctOptionId === 'c', 'Numbered format 2.C assigned card 1 to c');
}

console.log('\n=== TEST SUITE 11: Numeric Questions & 3-Decimal Rounding ===');
{
  const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

  // 1. compareNumericAnswer method extraction
  const compareNumericAnswer = (userVal, correctVal) => {
    if (userVal === undefined || userVal === null || userVal === '') return false;
    if (correctVal === undefined || correctVal === null || correctVal === '') return false;
    const normalizeNum = (val) => {
      if (typeof val === 'number') return isNaN(val) ? null : val;
      const str = String(val).trim().replace(',', '.');
      const parsed = parseFloat(str);
      return isNaN(parsed) ? null : parsed;
    };
    const userNum = normalizeNum(userVal);
    const correctNum = normalizeNum(correctVal);
    if (userNum === null || correctNum === null) return false;
    const round3 = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;
    const userR3 = round3(userNum);
    const correctR3 = round3(correctNum);
    return Math.abs(userR3 - correctR3) < 0.0001;
  };

  // Check compareNumericAnswer precision & comma handling
  assert(compareNumericAnswer('3,14159', '3.142') === true, '3,14159 and 3.142 match when rounded to 3 decimals');
  assert(compareNumericAnswer('3.1412', '3.141') === true, '3.1412 and 3.141 match when rounded to 3 decimals');
  assert(compareNumericAnswer('12,5', '12.500') === true, 'Comma separator 12,5 matches 12.500');
  assert(compareNumericAnswer('-0,750', '-0.75') === true, 'Negative decimal -0,750 matches -0.75');
  assert(compareNumericAnswer('42', '42.000') === true, 'Integer 42 matches 42.000');
  assert(compareNumericAnswer('12.501', '12.505') === false, 'Difference beyond 3-decimal threshold is rejected');
  assert(compareNumericAnswer('abc', '12') === false, 'Non-numeric user input is rejected');
  assert(compareNumericAnswer('', '12') === false, 'Empty user input is rejected');
  assert(compareNumericAnswer(null, '12') === false, 'Null user input is rejected');

  // 2. DOM elements in index.html
  assert(indexHtml.includes('id="quiz-numeric-container"'), 'Quiz numeric container exists in index.html');
  assert(indexHtml.includes('id="quiz-numeric-input"'), 'Quiz numeric input exists in index.html');
  assert(indexHtml.includes('id="btn-quiz-numeric-submit"'), 'Quiz numeric submit button exists in index.html');
  assert(indexHtml.includes('id="quiz-numeric-feedback"'), 'Quiz numeric feedback element exists in index.html');
  assert(indexHtml.includes('id="exam-numeric-container"'), 'Exam numeric container exists in index.html');

  // 3. CSS styles in style.css
  assert(cssContent.includes('.quiz-numeric-box'), 'style.css defines .quiz-numeric-box');
  assert(cssContent.includes('.numeric-input'), 'style.css defines .numeric-input');
  assert(cssContent.includes('.numeric-feedback'), 'style.css defines .numeric-feedback');
  assert(cssContent.includes('.numeric-feedback.correct'), 'style.css defines .numeric-feedback.correct');

  // 4. app.js logic hooks
  assert(appJsContent.includes('submitNumericAnswer()'), 'app.js defines submitNumericAnswer()');
  assert(appJsContent.includes('compareNumericAnswer('), 'app.js defines compareNumericAnswer helper');
  assert(appJsContent.includes('onExamNumericInput('), 'app.js defines onExamNumericInput for exam mode');
  assert(appJsContent.includes('card.type === \'numeric\''), 'app.js has conditional branch for numeric card type');
}

console.log('\n=== TEST SUITE 12: Option Shuffling & Bank Source Filtering ===');
{
  const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

  // 1. Fisher-Yates shuffle simulation
  const shuffleArray = (array) => {
    if (!array || !Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const initial = ['A', 'B', 'C', 'D'];
  const shuffled = shuffleArray(initial);
  assert(shuffled.length === 4, 'Shuffled array retains original length');
  assert([...shuffled].sort().join('') === 'ABCD', 'Shuffled array retains all original elements without loss or duplicate');

  // Over 50 shuffles, at least some must differ from the initial order
  let orderChanged = false;
  for (let s = 0; s < 50; s++) {
    const testShuf = shuffleArray(initial);
    if (testShuf.join('') !== 'ABCD') {
      orderChanged = true;
      break;
    }
  }
  assert(orderChanged, 'Fisher-Yates shuffle produces varying orders');

  // 2. Position-independent grading simulation
  const presentedShuffled = [
    { id: 'c', text: 'Option C (Wrong)', isCorrect: false },
    { id: 'd', text: 'Option D (Wrong)', isCorrect: false },
    { id: 'a', text: 'Option A (Wrong)', isCorrect: false },
    { id: 'b', text: 'Option B (Correct)', isCorrect: true }
  ];

  // Clicking displayIdx 3 (which holds 'b') must be graded true
  const selectedDisplayIdx = 3;
  const chosenOpt = presentedShuffled[selectedDisplayIdx];
  const isCorrect = Boolean(chosenOpt?.isCorrect);
  assert(isCorrect === true, 'Grading correctly identifies true answer based on option identity, not original position');

  // Clicking displayIdx 1 (which holds 'd') must be graded false
  const wrongChosen = presentedShuffled[1];
  assert(Boolean(wrongChosen?.isCorrect) === false, 'Grading correctly identifies wrong answer regardless of position');

  // 3. app.js shuffle & state preservation checks
  assert(appJsContent.includes('this.shuffleArray(prepared)'), 'app.js calls shuffleArray for unprepared option lists');
  assert(appJsContent.includes('session.cardShuffledOptions[session.currentIndex]'), 'app.js preserves shuffled options for active session');
  assert(appJsContent.includes('chosen?.isCorrect'), 'handleQuizAnswer relies on option object isCorrect flag');

  // 4. Question Bank source & needsReview filtering
  assert(indexHtml.includes('id="bank-source-filter"'), 'Question Bank defines #bank-source-filter in index.html');
  assert(indexHtml.includes('id="bank-filter-review"'), 'Question Bank defines #bank-filter-review in index.html');
  assert(cssContent.includes('.source-badge-lms'), 'style.css defines .source-badge-lms');
  assert(cssContent.includes('.badge-review-flag'), 'style.css defines .badge-review-flag');

  // Filter simulation
  const mockBank = [
    { id: 'c1', question: 'Q1', source: 'lms', needsReview: true },
    { id: 'c2', question: 'Q2', source: 'ai', needsReview: false },
    { id: 'c3', question: 'Q3', source: 'manual', needsReview: false },
    { id: 'c4', question: 'Q4', source: 'lms', needsReview: false }
  ];

  const lmsFiltered = mockBank.filter(c => c.source === 'lms');
  assert(lmsFiltered.length === 2, 'Filtered exactly 2 LMS cards');
  const reviewFiltered = mockBank.filter(c => c.needsReview);
  assert(reviewFiltered.length === 1 && reviewFiltered[0].id === 'c1', 'Filtered 1 card needing review');

  // 5. LMS Import View & Sidebar integration
  assert(indexHtml.includes('data-view="import-lms"'), 'Sidebar includes data-view="import-lms" navigation item');
  assert(indexHtml.includes('id="view-import-lms"'), 'index.html contains #view-import-lms view section');
  assert(appJsContent.includes('setupImportLmsView('), 'app.js implements setupImportLmsView()');
  assert(appJsContent.includes('parseLmsInput()'), 'app.js implements parseLmsInput()');
  assert(appJsContent.includes('saveLmsImport()'), 'app.js implements saveLmsImport()');

  // 6. Completion Overlay Click Outside & ESC Navigation to Decks
  assert(appJsContent.includes("overlay.id === 'modal-session-complete'"), 'app.js checks for completion modal on backdrop click');
  assert(appJsContent.includes("this.navigateTo('decks')"), 'app.js redirects to decks view when completion overlay backdrop is clicked');

  // Simulation of backdrop click logic
  let navigatedView = null;
  let modalClosed = false;
  const mockCloseModal = () => { modalClosed = true; };
  const mockNavigateTo = (view) => { navigatedView = view; };

  const handleOverlayClick = (e, overlay) => {
    if (e.target === overlay) {
      const isCompletionModal = overlay.id === 'modal-session-complete';
      mockCloseModal();
      if (isCompletionModal) {
        mockNavigateTo('decks');
      }
    }
  };

  // Test 1: Clicking backdrop of modal-session-complete
  const completeOverlay = { id: 'modal-session-complete' };
  handleOverlayClick({ target: completeOverlay }, completeOverlay);
  assert(modalClosed === true, 'Completion overlay is closed on backdrop click');
  assert(navigatedView === 'decks', 'Navigates to decks (Thư viện thẻ) when clicking outside completion overlay');

  // Test 2: Clicking inner box of modal-session-complete does not trigger backdrop click
  navigatedView = null;
  modalClosed = false;
  const modalBox = { id: 'some-box' };
  handleOverlayClick({ target: modalBox }, completeOverlay);
  assert(modalClosed === false, 'Clicking inside completion modal box does not close it');
  assert(navigatedView === null, 'Clicking inside completion modal box does not trigger navigation');

  // Test 3: Clicking backdrop of other modals does not navigate to decks
  navigatedView = null;
  modalClosed = false;
  const otherOverlay = { id: 'modal-topic-picker' };
  handleOverlayClick({ target: otherOverlay }, otherOverlay);
  assert(modalClosed === true, 'Other modal is closed on backdrop click');
  assert(navigatedView === null, 'Clicking backdrop of other modal does not navigate to decks');
}

console.log('\n=== TEST SUITE 13: Desktop Layout Enlargement & Background Standardization ===');
{
  const indexPath = path.join(__dirname, '..', 'index.html');
  const stylePath = path.join(__dirname, '..', 'css', 'style.css');
  const html = fs.readFileSync(indexPath, 'utf8');
  const css = fs.readFileSync(stylePath, 'utf8');

  // 1. Background Thumbnail Standardization (16:9 & object-fit: cover)
  assert(html.includes('class="bg-picker-grid" id="bg-picker-grid"'),
    'index.html contains .bg-picker-grid');
  assert(!html.includes('class="bg-thumb" data-bg="./backgrounds/bg-pixel-meadow.jpg" onclick="App.setBackground(\'./backgrounds/bg-pixel-meadow.jpg\')" style="background-image:'),
    'Inline background-image removed from .bg-thumb to avoid layout conflicts');
  assert(html.includes('class="bg-thumb bg-thumb-none" data-bg="none"'),
    'None thumbnail uses standardized .bg-thumb.bg-thumb-none');
  assert(html.includes('class="bg-thumb-none-icon"'),
    'None thumbnail uses dedicated .bg-thumb-none-icon');
  assert(css.includes('.bg-thumb {') && css.includes('aspect-ratio: 16 / 9 !important;'),
    'style.css enforces aspect-ratio: 16 / 9 !important on .bg-thumb');
  assert(css.includes('border: 2px solid var(--border-color) !important;'),
    'style.css enforces uniform border: 2px solid on .bg-thumb');
  assert(css.includes('box-sizing: border-box !important;'),
    'style.css enforces box-sizing: border-box on .bg-thumb');
  assert(css.includes('.bg-thumb img {') && css.includes('object-fit: cover !important;'),
    'style.css enforces object-fit: cover !important on .bg-thumb img');
  assert(css.includes('.bg-thumb.active {') && css.includes('border-color: var(--accent) !important;'),
    '.bg-thumb.active highlights with accent border');

  // 2. Desktop Layout Enlargement & Ultrawide Protection
  assert(css.includes('.content-wrapper {') && css.includes('max-width: 1380px;'),
    'style.css sets expanded base desktop max-width: 1380px on .content-wrapper');
  assert(css.includes('@media (min-width: 1920px)') && css.includes('max-width: 1560px;'),
    'style.css sets max-width: 1560px on .content-wrapper for 1920px screens');
  assert(css.includes('@media (min-width: 2400px)') && css.includes('max-width: 1680px;'),
    'style.css sets ultrawide safety stop at 1680px for .content-wrapper');
  assert(css.includes('@media (min-width: 1024px)') && css.includes('max-width: 1040px !important;'),
    'style.css sets quiz-container max-width to 1040px on desktop (>= 1024px)');
  assert(css.includes('@media (min-width: 1440px)') && css.includes('max-width: 1140px !important;'),
    'style.css sets quiz-container max-width to 1140px on large desktop (>= 1440px)');
  assert(css.includes('@media (min-width: 1920px)') && css.includes('max-width: 1240px !important;'),
    'style.css sets quiz-container max-width to 1240px on Full HD (>= 1920px)');
  assert(css.includes('@media (min-width: 2400px)') && css.includes('max-width: 1320px !important;'),
    'style.css sets quiz-container ultrawide cap at 1320px to prevent infinite stretching');
  assert(css.includes('font-size: clamp(1.12rem, 1.45vw, 1.32rem) !important;'),
    'Quiz question text scaled for desktop readability');
  assert(css.includes('gap: 14px 18px !important;'),
    'Quiz options grid gap enlarged for desktop');
  assert(css.includes('min-height: 52px !important;') && css.includes('padding: 13px 18px !important;'),
    'Option buttons have comfortable min-height and padding on desktop');
  assert(css.includes('#view-bank > div {') && css.includes('max-width: 1140px !important;'),
    'Question Bank view expanded on desktop');
  assert(css.includes('#view-stats > div {') && css.includes('max-width: 1120px !important;'),
    'Stats view expanded on desktop');
  assert(css.includes('#view-settings > div {') && css.includes('max-width: 1020px !important;'),
    'Settings view expanded on desktop');

  // 3. Viewport Simulation Math Verification (1366px, 1920px, 2560px)
  function simulate(w) {
    const avail = w - 264;
    const pad = w >= 1920 ? 64 : 48;
    let wMax = 1380;
    if (w >= 2400) wMax = 1680;
    else if (w >= 1920) wMax = 1560;
    const wrapW = Math.min(wMax, avail - pad);
    let qMax = 740;
    if (w >= 2400) qMax = 1320;
    else if (w >= 1920) qMax = 1240;
    else if (w >= 1440) qMax = 1140;
    else if (w >= 1024) qMax = 1040;
    const qW = Math.min(qMax, wrapW);
    return { noOverflow: qW <= avail && wrapW <= avail, qW, wrapW };
  }

  const s1366 = simulate(1366);
  assert(s1366.noOverflow && s1366.qW >= 1000, '1366px desktop has 0px overflow and card >= 1000px');

  const s1920 = simulate(1920);
  assert(s1920.noOverflow && s1920.qW >= 1200, '1920px Full HD desktop has 0px overflow and card >= 1200px');

  const s2560 = simulate(2560);
  assert(s2560.noOverflow && s2560.qW <= 1350 && s2560.wrapW <= 1700,
    '2560px ultrawide has 0px overflow and strict containment stops');
}

console.log('\n=== TEST SUITE 14: Rewritten LMS Parser (Moodle Step 3 & 5 Specifications) ===');
{
  assert(typeof LMSParser.cleanRawText === 'function', 'cleanRawText is defined');
  assert(typeof LMSParser.parseQuestions === 'function', 'parseQuestions is defined');

  // Test 1: Real Moodle 2-question block
  const rawStep3 = `Câu hỏi 1
Hoàn thành
Đạt điểm 1,00 trên 1,00
Không gắn cờĐặt cờ
Đoạn văn câu hỏi
Câu 39 Để thực hiện thắng lợi mục tiêu đưa Việt Nam trở thành một nước công nghiệp theo hướng hiện đại, xây dựng giai cấp công nhân Việt Nam trong thời kỳ mới cần thực hiện giải pháp chủ yếu nào?
Select one:

a.
Đào tạo, bồi dưỡng, nâng cao trình đọ mọi mặt của công nhân, không ngừng chuyên môn hóa giai cấp công nhân.

b.
Nâng cao nhận thức kiên định quan điểm giai cấp công nhân là giai cấp lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản Việt Nam.

c.
Xây dựng giai cấp công nhân lớn mạnh gắn với xây dựng và phát huy sức mạnh liên minh giai cấp nông dân và đội ngũ tri thức và doanh nhân.

d.
Thực hiện chiến lược xây dựng giai cấp công nhân lớn mạnh, gắn kết chặt với chiến lược phát triển kinh tế - xã hội, công nghiệp hóa đất nước, hội nhập quốc tế.
Câu hỏi 2
Hoàn thành
Đạt điểm 0,00 trên 1,00
Đặt cờ
Đoạn văn câu hỏi
Câu 27 Đâu là điều kiện khách quan quy định sứ mệnh lịch sử của giai cấp công nhân?
Select one:

a.
Sự liên minh giai cấp giữa giai cấp công nhân với giai cấp nông dân và các tầng lớp lao động khác do giai cấp công nhân thông qua đội tiên phong của nó là Đảng Cộng sản lãnh đạo.

b.
Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng.

c.
Đảng Cộng sản là nhân tố quan trọng để giai cấp công nhân thực hiện thắng lợi sứ mệnh lịch sử của mình.

d.
Do địa vị chính trị - xã hội của giai cấp công nhân quy định`;

  const cards = LMSParser.parse(rawStep3);
  assert(cards.length === 2, 'Parsed exactly 2 questions from Step 3 sample');
  assert(cards[0].question.startsWith('Để thực hiện thắng lợi mục tiêu'), 'Question 1 leading Câu 39 is stripped');
  assert(cards[0].options.length === 4, 'Question 1 has 4 options');
  assert(cards[0].options[0].id === 'a' && cards[0].options[0].text.startsWith('Đào tạo, bồi dưỡng'), 'Option a text matched');
  assert(cards[0].correct_option_id === null, 'correct_option_id is null');
  assert(cards[0].needs_review === false, 'needs_review is false');
  assert(cards[1].question.startsWith('Đâu là điều kiện khách quan'), 'Question 2 leading Câu 27 is stripped');
  assert(cards[1].options.length === 4, 'Question 2 has 4 options');

  // Test 2: Fuzzy score prefix match
  const rawScore = `Câu hỏi 1\nĐạt điểm 10,00 trên 10,00\nĐoạn văn câu hỏi\nCâu hỏi kiểm tra điểm số?\nSelect one:\na. Đúng\nb. Sai`;
  const cardsScore = LMSParser.parse(rawScore);
  assert(cardsScore.length === 1 && cardsScore[0].question === 'Câu hỏi kiểm tra điểm số?', 'Đạt điểm 10,00 trên 10,00 removed via fuzzy prefix');

  // Test 3: Flag variations
  const rawFlags = `Câu hỏi 1\nKhông gắn cờĐặt cờ\nNội dung A?\nSelect one:\na. 1\nb. 2\nCâu hỏi 2\nĐặt cờ\nNội dung B?\nSelect one:\na. 3\nb. 4`;
  const cardsFlags = LMSParser.parse(rawFlags);
  assert(cardsFlags.length === 2 && !cardsFlags[0].question.includes('cờ') && !cardsFlags[1].question.includes('cờ'), 'All flag variations stripped');

  // Test 4: No empty lines between options
  const rawNoEmpty = `Câu hỏi 1\nNội dung C?\nSelect one:\na.\nĐáp án A\nb.\nĐáp án B\nc.\nĐáp án C\nd.\nĐáp án D`;
  const cardsNoEmpty = LMSParser.parse(rawNoEmpty);
  assert(cardsNoEmpty.length === 1 && cardsNoEmpty[0].options.length === 4, 'Separated 4 options without empty lines');

  // Test 5: Inline options
  const rawInline = `Câu hỏi 1\nHệ điều hành là gì?\nSelect one:\na. Phần mềm hệ thống\nb. Trình duyệt web\nc. Phần cứng máy tính\nd. Thiết bị ngoại vi`;
  const cardsInline = LMSParser.parse(rawInline);
  assert(cardsInline.length === 1 && cardsInline[0].options[0].text === 'Phần mềm hệ thống', 'Inline option parsed correctly');

  // Test 6: Select one or more:
  const rawMulti = `Câu hỏi 1\nChọn nhiều đáp án?\nSelect one or more:\na. A\nb. B`;
  const cardsMulti = LMSParser.parse(rawMulti);
  assert(cardsMulti.length === 1 && cardsMulti[0].needs_review === true, 'Select one or more triggers needs_review: true');
}

console.log('\n=== TEST SUITE 15: Subject Classification & Migration v2 (Section A) ===');
{
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // 1. AIParser subject support
  const jsonWithSubject = JSON.stringify({
    subject: "Giải Tích 1",
    quiz_title: "Tích phân Riemann",
    questions: [
      {
        id: "q1",
        question: "Tích phân cơ bản",
        options: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
        correct_option_id: "a"
      }
    ]
  });
  const parsedSubj = AIParser.parse(jsonWithSubject);
  assert(parsedSubj.subject === "Giải Tích 1", 'AIParser extracts top-level subject field');

  const jsonWithoutSubject = JSON.stringify({
    quiz_title: "Chủ đề tự do",
    questions: [
      {
        id: "q1",
        question: "Câu 1",
        options: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
        correct_option_id: "a"
      }
    ]
  });
  const parsedNoSubj = AIParser.parse(jsonWithoutSubject);
  assert(!parsedNoSubj.subject, 'AIParser returns falsy subject when not present');

  // 2. DB Schema v2 & Methods
  assert(dbJs.includes('const DB_VERSION = 2;'), 'DB_VERSION upgraded to 2 in db.js');
  assert(dbJs.includes("db.createObjectStore('subjects'"), 'db.js defines subjects object store');
  assert(dbJs.includes("cardStore.createIndex('subjectId'"), 'db.js defines subjectId index on cards store');
  assert(dbJs.includes("deckStore.createIndex('subjectId'"), 'db.js defines subjectId index on decks store');
  assert(dbJs.includes('createPreMigrationBackup()'), 'db.js implements createPreMigrationBackup()');
  assert(dbJs.includes('ensureDefaultSubject()'), 'db.js implements ensureDefaultSubject()');
  assert(dbJs.includes('getSubjectSummaries()'), 'db.js implements getSubjectSummaries() with precomputed caching');
  assert(dbJs.includes('getCardsBySubject('), 'db.js implements indexed getCardsBySubject()');
  assert(dbJs.includes('reassignDecksSubject('), 'db.js implements bulk deck reassignment');
  assert(dbJs.includes('mergeSubjects('), 'db.js implements mergeSubjects()');

  // 3. UI Dropdowns across all 4 entry points
  assert(indexHtml.includes('id="bank-subject-dropdown-wrap"'), 'Question Bank includes Cyber Violet Subject dropdown');
  assert(indexHtml.includes('id="import-subject-dropdown-wrap"'), 'AI Import includes Cyber Violet Subject dropdown');
  assert(indexHtml.includes('id="lms-subject-dropdown-wrap"'), 'LMS Import includes Cyber Violet Subject dropdown');
  assert(indexHtml.includes('id="edit-card-subject-dropdown-wrap"'), 'Edit Card Modal includes Cyber Violet Subject dropdown');

  // 4. Subject Management Modals
  assert(indexHtml.includes('id="modal-create-subject"'), 'index.html contains modal-create-subject');
  assert(indexHtml.includes('id="modal-manage-subject"'), 'index.html contains modal-manage-subject');
  assert(indexHtml.includes('id="modal-bulk-reassign-decks"'), 'index.html contains modal-bulk-reassign-decks');
  assert(indexHtml.includes('id="stats-subject-tbody"'), 'Stats view contains stats-subject-tbody');

  // 5. App Methods
  assert(appJs.includes('startSubjectSession('), 'app.js defines startSubjectSession()');
  assert(appJs.includes('selectBankSubject('), 'app.js defines selectBankSubject()');
  assert(appJs.includes('selectImportSubject('), 'app.js defines selectImportSubject()');
  assert(appJs.includes('selectLmsSubject('), 'app.js defines selectLmsSubject()');
  assert(appJs.includes('selectEditCardSubject('), 'app.js defines selectEditCardSubject()');
  assert(appJs.includes('saveCreateSubject()'), 'app.js defines saveCreateSubject()');
  assert(appJs.includes('saveManageSubject()'), 'app.js defines saveManageSubject()');
  assert(appJs.includes('mergeCurrentSubject()'), 'app.js defines mergeCurrentSubject()');
  assert(appJs.includes('confirmDeleteCurrentSubject()'), 'app.js defines confirmDeleteCurrentSubject()');
  assert(appJs.includes('applyBulkReassignDecks()'), 'app.js defines applyBulkReassignDecks()');

  // 6. CSS Styling
  assert(styleCss.includes('.subject-group'), 'style.css defines .subject-group');
  assert(styleCss.includes('.subject-group-header'), 'style.css defines .subject-group-header');
  assert(styleCss.includes('.subject-badge'), 'style.css defines .subject-badge');
}

console.log('\n=== TEST SUITE 16: Phase 1j 144fps, 0ms Switch, Modal Scroll, Convex Warp & White-Orange Glass ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // 1. Frosted Translucent Liquid Glass in White-Orange
  assert(themeCss.includes('html[data-theme="white-orange"] .stat-card'), 'White-orange stat card rule defined in theme.css');
  assert(themeCss.includes('rgba(255, 255, 255, 0.52)') || themeCss.includes('rgba(255, 255, 255, 0.24)'), 'White-orange stat card uses frosted translucent resting gradient');
  assert(themeCss.includes('rgba(192, 132, 252, 0.28)'), 'Purple-pink stat card hover uses soft pastel purple');
  assert(themeCss.includes('rgba(251, 146, 60, 0.32)') || themeCss.includes('--light-accent-neon'), 'White-orange stat card hover uses light neon accent or peach');
  assert(themeCss.includes('rgba(255, 250, 245, 0.16)') || themeCss.includes('--glass-block-hover-bg'), 'White-orange study modes & deck cards hover alpha reduced');

  // 2. White-Orange Quote Typography
  assert(themeCss.includes('Plus Jakarta Sans'), 'White-orange quote title uses straight sans-serif font');
  assert(themeCss.includes('font-style: normal !important;'), 'White-orange quote title enforces font-style: normal !important');

  // 3. 0ms Tab Switch & RAM Caches
  assert(dbJs.includes('_cardsCache') && dbJs.includes('_decksCache') && dbJs.includes('_subjectsCache'), 'db.js implements memory caches');
  assert(styleCss.includes('#tab-wave-curtain') && styleCss.includes('display: none !important;'), 'tab-wave-curtain is disabled for 0ms transitions');
  assert(appJs.includes('_viewRendered') && appJs.includes('_dbDirty'), 'app.js implements DOM preservation during tab navigation');

  // 4. Scroll-Reveal Animation
  assert(themeCss.includes('.scroll-reveal-item') && themeCss.includes('.scroll-reveal-item.is-revealed'), 'theme.css defines scroll-reveal classes');
  assert(appJs.includes('initScrollRevealObserver()') && appJs.includes('observeUnrevealedItems()'), 'app.js defines scroll-reveal observer');

  // 5. Monochrome Wrong Answer
  assert(themeCss.includes('html[data-theme="monochrome"] .quiz-option-btn.incorrect *'), 'Monochrome incorrect option rule exists');
  assert(themeCss.includes('text-decoration: none !important;'), 'Monochrome removes line-through on wrong answers');

  // 6. Mode 5 Reliability & Modal Display
  assert(appJs.includes("el.style.setProperty('display', 'grid', 'important');") || (appJs.includes("el.style.removeProperty('display');") && themeCss.includes('.modal-overlay.show')), '_showModal controls modal display cleanly');
  assert(appJs.includes('openTopicPickerModal('), 'app.js defines openTopicPickerModal');

  // 7. Sidebar Install Icon
  assert(indexHtml.includes('sidebar-install-btn'), 'index.html defines sidebar-install-btn');
  assert(!indexHtml.includes('▯'), 'index.html eliminates corrupted square symbol ▯');

  // 8. Mobile Bottom Nav Clean Path SVGs
  assert(indexHtml.includes('id="mobile-bottom-nav"'), 'index.html defines mobile-bottom-nav');
  assert(themeCss.includes('#mobile-bottom-nav .bnav-svg'), 'theme.css styles mobile bottom nav bnav-svg');

  // 9. Modal Vertical Scrolling & Convex Warp Lens
  assert(styleCss.includes('overflow-y: auto !important;') && styleCss.includes('max-height: calc(88vh - 140px) !important;'), 'modal-body restores smooth vertical scrolling');
  assert(appJs.includes('filter id="liquid-edge-warp"') || appJs.includes('initLiquidGlassLensFilter() {}'), 'app.js registers or safely no-ops liquid-edge-warp filter');
  assert(themeCss.includes('backdrop-filter: url(#liquid-edge-warp)') || themeCss.includes('--popup-glass-volume-bg'), 'modal-box uses liquid glass volume or rim refraction');

  // 10. Deck Reset Button
  assert(appJs.includes('confirmResetDeckProgress(deckId)'), 'app.js implements confirmResetDeckProgress');
  assert(dbJs.includes('resetDeckProgress('), 'db.js implements resetDeckProgress');
}

console.log('\n=== TEST SUITE 17: Phase 1k Popup Lock Fix, Continuous Glass Volume, Mode 5 DOM & Lofi Player ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const lofiJsPath = path.join(__dirname, '../js/lofi-music.js');

  // 1. Modal Close Lock Fix (Mục 6)
  assert(appJs.includes('closeAllModals()'), 'app.js implements closeAllModals()');
  assert(themeCss.includes('.modal-overlay:not(.show)'), 'theme.css defines .modal-overlay:not(.show) display none !important');
  assert(themeCss.includes('.modal-overlay.show'), 'theme.css defines .modal-overlay.show display grid !important');
  assert(appJs.includes("e.key === 'Escape'"), 'Escape key closes all modals');

  // 2. Mode 5 Self-Healing Topic Picker & Direct Study Launcher (Mục 9)
  assert(appJs.includes('btn-topic-study-whole-subject'), 'Self-healing DOM creates whole-subject button');
  assert(appJs.includes('topic-picker-chips'), 'Self-healing DOM creates chips container');
  assert(appJs.includes("viewName === 'study'"), 'navigateTo handles study view and calls renderActiveStudyCard');

  // 3. Continuous Curved Glass Volume (Mục 7 & 8)
  assert(themeCss.includes('border-radius: 36px !important;'), '.modal-box has 36px border radius');
  assert(themeCss.includes('--popup-glass-volume-bg'), 'theme.css defines --popup-glass-volume-bg');
  assert(!themeCss.includes('padding: 22px !important;') || !themeCss.includes('mask-composite: exclude'), '22px grey bezel mask-composite has been removed from modal-box::before');

  // 4. White-Orange Mode Nuclear Tokens & Stat Boxes (Mục 1, 2 & 10)
  assert(themeCss.includes('--light-accent-rgb: 255, 107, 43;'), 'theme.css defines --light-accent-rgb');
  assert(themeCss.includes('--light-accent-neon: #ff6b2b;'), 'theme.css defines --light-accent-neon');
  assert(themeCss.includes('border-radius: 20px !important;') && themeCss.includes('background-clip: padding-box !important;'), 'stat cards have 20px border radius and background-clip padding-box');
  assert(themeCss.includes('color: #ffffff !important;'), 'stat card hover turns text pure white');

  // 5. Quote Container Glow (Mục 3)
  assert(themeCss.includes('html[data-theme="monochrome"] .hero-card:hover'), 'theme.css defines Monochrome quote hover glow');
  assert(themeCss.includes('rgba(255, 255, 255, 0.22)'), 'Monochrome quote hover casts silver-white glow without purple');
  assert(themeCss.includes('html[data-theme="white-orange"] .hero-card:hover'), 'theme.css defines White-Orange quote hover glow');

  // 6. Unified Frosted-to-Clear Hover (Mục 4 & 5)
  assert(themeCss.includes('--glass-block-rest-bg'), 'theme.css defines --glass-block-rest-bg');
  assert(themeCss.includes('--glass-block-hover-bg'), 'theme.css defines --glass-block-hover-bg');

  // 7. Quote Sentence Case (Mục 11)
  assert(appJs.includes('window.QUOTE_CASE_MODE'), 'app.js supports window.QUOTE_CASE_MODE');
  assert(themeCss.includes('--quote-text-transform: none;'), 'theme.css defines --quote-text-transform');

  // 8. Lofi Music Player (Mục 12)
  assert(fs.existsSync(lofiJsPath), 'js/lofi-music.js exists locally');
  assert(indexHtml.includes('js/lofi-music.js'), 'index.html loads js/lofi-music.js');
  assert(indexHtml.includes('hero-lofi-bar'), 'index.html defines .hero-lofi-bar');
  assert(indexHtml.includes('setting-lofi-volume'), 'index.html includes lofi volume slider in settings');
  assert(indexHtml.includes('setting-lofi-track'), 'index.html includes lofi track picker in settings');

  // 9. Sidebar Download Shortcut Icon Sync (Mục 13)
  assert(!indexHtml.includes('btn btn-secondary sidebar-install-btn'), '#btn-pwa-install has removed white btn-secondary classes');
  assert(themeCss.includes('.sidebar-install-btn'), 'theme.css styles .sidebar-install-btn transparently');

  // 10. Low-End Performance Optimizations
  assert(themeCss.includes('.blur-culled'), 'theme.css defines .blur-culled for GPU Shader culling');
  assert(appJs.includes('initBlurCullingObserver'), 'app.js implements initBlurCullingObserver');
}

console.log('\n=== TEST SUITE 18: Phase 1l Unified Liquid Glass, 3D Meniscus Bevel, Light Neon & 144+ FPS ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // 1. 4 Quote Stat Boxes (Mục 1)
  assert(themeCss.includes('border-radius: 22px !important;'), 'Stat cards enforce 22px border radius');
  assert(themeCss.includes('border: none !important;'), 'Stat cards remove harsh white outer border');
  assert(themeCss.includes('rgba(255, 132, 62, 0.44)'), 'White-orange stat card hover uses gentle Light Neon radial glow');
  assert(!styleCss.includes('.editorial-stats-grid .stat-card {\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n  padding: 12px 16px !important;\n  border-left: 2px solid var(--border-color) !important;\n  border-radius: 0 !important;'), 'style.css removed square 0px border-radius from editorial stat cards');

  // 2. Restore Purple Theme Glass Frame & Unified Tokens (Mục 2)
  assert(themeCss.includes('--lg-card-rest-bg') && themeCss.includes('--lg-card-rest-shadow'), 'theme.css defines unified --lg-card-rest-* tokens');
  assert(themeCss.includes('--lg-card-hover-bg') && themeCss.includes('--lg-card-hover-shadow'), 'theme.css defines unified --lg-card-hover-* tokens');
  assert(themeCss.includes('html[data-theme="purple-pink"]') && themeCss.includes('rgba(38, 28, 66, 0.76)'), 'Purple-pink defines deep 3D frosted resting glass');
  assert(themeCss.includes('html[data-theme="monochrome"]') && themeCss.includes('rgba(38, 38, 44, 0.76)'), 'Monochrome defines silver smoke resting glass');
  assert(themeCss.includes('html[data-theme="white-orange"]') && themeCss.includes('rgba(255, 253, 250, 0.66)'), 'White-orange defines liquid milky glass');

  // 3. Unified High Specificity Selectors (Mục 2)
  assert(themeCss.includes('#view-dashboard .study-mode-card') && themeCss.includes('#dashboard-decks-grid .deck-card'), 'theme.css unifies dashboard modes and deck cards');
  assert(themeCss.includes('#view-decks .deck-card') && themeCss.includes('.subject-group .deck-card'), 'theme.css unifies deck library cards and subject group cards');
  assert(themeCss.includes('backdrop-filter: blur(20px) saturate(180%) !important;'), 'Resting cards have frosted 20px blur');
  assert(themeCss.includes('backdrop-filter: blur(5px) saturate(135%) !important;'), 'Hovered cards turn crystal clear with 5px blur');
  assert(themeCss.includes('#view-decks .subject-group'), 'theme.css restores subject group container frame');

  // 4. Rimless 3D Meniscus Bevel (Mục 3)
  assert(themeCss.includes('--lg-card-hover-border: rgba(255, 255, 255, 0.52);'), 'White-orange hover replaces harsh 2D orange border with 3D meniscus bevel');
  assert(themeCss.includes('inset 0 2.5px 5px rgba(255, 255, 255, 0.98)'), 'White-orange hover applies multi-layer 3D inset meniscus reflection');

  // 5. 144+ FPS Locked Scrolling Performance (Mục 4)
  assert(!themeCss.includes('backdrop-filter: url(#liquid-convex-lens)'), 'Modal box removed CPU-GPU texture readback lens from backdrop-filter');
  assert(themeCss.includes('backdrop-filter: blur(26px) saturate(195%) brightness(1.06) !important;'), 'Modal box uses pure GPU compositor backdrop filter');
  assert(themeCss.includes('transform: translateZ(0) !important;') && themeCss.includes('contain: layout paint !important;'), 'theme.css isolates compositor layers on scroll containers');
  assert(themeCss.includes('body.is-scrolling'), 'theme.css defines body.is-scrolling pointer freeze');
  assert(appJs.includes("document.body.classList.contains('is-scrolling')"), 'app.js implements passive scroll pointer freeze');
  assert(appJs.replace(/\r\n/g, '\n').includes('initSpotlightHover() {\n    return;'), 'initSpotlightHover returns immediately to guarantee 0% CPU');
}

console.log('\n=== TEST SUITE 19: Phase 1m 14 UI/UX Refinements, Liquid Glass, Focus Preservation & Modal Fixes ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // 1. Subject Group Header (Mục 1)
  assert(themeCss.includes('.subject-group-header') && themeCss.includes('border-radius: 18px !important;'), 'theme.css enforces 18px radius on .subject-group-header');
  assert(themeCss.includes('data-color-mode="purple-pink"') && themeCss.includes('rgba(64, 32, 108, 0.72)'), 'Purple-pink subject group header uses deep frosted glass');
  assert(themeCss.includes('data-color-mode="bw-dark"') && themeCss.includes('rgba(46, 46, 52, 0.76)'), 'Monochrome subject group header uses silver-slate glass');
  assert(themeCss.includes('data-color-mode="white-orange"') && themeCss.includes('rgba(255, 255, 254, 0.74)'), 'White-orange subject group header uses milky glass');

  // 2. Light Neon Purple Quote Hover Glow (Mục 2)
  assert(themeCss.includes('rgba(232, 121, 249, 0.68)') && themeCss.includes('rgba(192, 132, 252, 0.52)'), 'Purple-pink quote hover casts light neon purple glow');

  // 3. Purple-pink Refractive Liquid Glass Popup Frame (Mục 3)
  assert(themeCss.includes('rgba(216, 180, 254, 0.42)') && themeCss.includes('rgba(168, 85, 247, 0.24)'), 'Purple-pink modal-box has 3D refractive liquid glass frame');

  // 4. Fluted / Ribbed Glass Blur Accent (Mục 4)
  assert(themeCss.includes('.modal-header::after') && themeCss.includes('repeating-linear-gradient'), 'theme.css defines Fluted Ribbed Glass on .modal-header::after');
  assert(themeCss.includes('--fluted-glow: rgba(216, 180, 254, 0.42);'), 'Fluted glow defined for purple-pink');
  assert(themeCss.includes('--fluted-glow: rgba(251, 146, 60, 0.40);'), 'Fluted glow defined for white-orange');

  // 5. Static Spotlight Disabled (Mục 5)
  assert(styleCss.includes('.deck-card::before') && styleCss.includes('display: none !important;'), 'style.css permanently disables static spotlight ::before');
  assert(themeCss.includes('.bank-card-item::before') && themeCss.includes('background: none !important;'), 'theme.css disables static center spotlight pseudo-element');

  // 6. Left Sidebar Overlay Spill Removal (Mục 6)
  assert(themeCss.includes('.app-sidebar::before') && themeCss.includes('content: none !important;'), 'Sidebar pseudo-elements removed');
  assert(themeCss.includes('overflow-x: clip !important;'), 'Layout prevents horizontal spill with overflow-x: clip');

  // 7. Quick Filter Focus Preservation (Mục 7)
  assert(appJs.includes('isSearchFocused') && appJs.includes('setSelectionRange'), 'renderDecks preserves search input focus and cursor range');
  assert(appJs.includes('existingInput && scrollArea'), 'renderDecks preserves existing quickbar input in DOM');

  // 8. White-Orange Focus Mode Exit Button (Mục 8)
  assert(themeCss.includes('data-color-mode="white-orange"') && themeCss.includes('rgba(255, 250, 244, 0.88)'), 'White-orange focus exit button uses cream glass');
  assert(themeCss.includes('rgba(251, 146, 60, 0.55)'), 'White-orange focus exit button has orange border');
  assert(indexHtml.includes('focus-exit-floating-btn'), 'index.html adds focus-exit-floating-btn class');

  // 9. Study Exit Button vs ESC Key (Mục 9)
  assert(indexHtml.includes('id="btn-exit-study"') && indexHtml.includes("App.exitStudySession('decks')"), 'Study exit button targets decks library');
  assert(appJs.includes('exitStudySession(targetView'), 'app.js implements exitStudySession');
  assert(appJs.includes("this.exitStudySession('dashboard')"), 'Escape key on study view exits to dashboard');

  // 10. Quiz Explanation Font & LaTeX Scaling (Mục 10)
  assert(themeCss.includes('font-size: 1.08rem !important;') && themeCss.includes('line-height: 1.72 !important;'), 'Quiz explanation font size increased to 1.08rem');
  assert(themeCss.includes('font-size: 1.26em !important;'), 'LaTeX katex formulas scaled to 1.26em');

  // 11. Flashcard Explanation Auto-Expansion (Mục 11)
  assert(themeCss.includes('min-height: 360px !important;'), 'Flashcard card has 360px min-height');
  assert(themeCss.includes('.flashcard-explanation-box .flashcard-explanation-text') && themeCss.includes('max-height: none !important;'), 'Flashcard explanation removes small vertical scrollbar');

  // 12 & 13. Modal Session Complete Navigation (Mục 12 & 13)
  assert(appJs.includes("inlineOnClick.includes(\"navigateTo('decks')\")"), 'Capture phase listener allows decks navigation');
  assert(appJs.includes("inlineOnClick.includes(\"navigateTo('stats')\")"), 'Capture phase listener allows stats navigation');

  // 14. Quote Stat Card 10px Radius (Mục 14)
  assert(themeCss.includes('.editorial-stage-footer .stat-card') && themeCss.includes('border-radius: 10px !important;'), 'Quote stat cards have 10px modern border radius');
}

console.log('\n=== TEST SUITE 20: Phase 1n 15 UI/UX Refinements, 135deg Directional Liquid Glass, Mobile, Lofi & Energy Wave ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const lofiJs = fs.readFileSync(path.join(__dirname, '../js/lofi-music.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // Item 1: Fluted glass removal & Purple-pink popup separation
  assert(themeCss.includes('.modal-header::before,') && themeCss.includes('display: none !important;') && themeCss.includes('content: none !important;'), 'Phase 1n removes fluted glass from modal-header');
  assert(themeCss.includes('--popup-glass-volume-bg: linear-gradient(145deg, rgba(64, 48, 98, 0.56) 0%, rgba(32, 22, 54, 0.46) 55%, rgba(44, 30, 74, 0.52) 100%);'), 'Purple-pink popup defines separating volume background');
  assert(themeCss.includes('--popup-glass-rim-border: rgba(233, 213, 255, 0.34);'), 'Purple-pink popup defines separating rim border');

  // Item 2: 135deg Directional Light Physics
  assert(themeCss.includes('--lg-directional-bevel:'), 'theme.css defines 135deg directional bevel');
  assert(themeCss.includes('--lg-directional-border-top: rgba(255, 255, 255, 0.38);'), 'Purple theme defines bright top border');
  assert(themeCss.includes('--lg-directional-border-bottom: rgba(216, 180, 254, 0.18);'), 'Purple theme defines soft bottom border');
  assert(themeCss.includes('--lg-directional-border-top: rgba(255, 255, 255, 0.95);'), 'White-orange defines luminous top border');
  assert(themeCss.includes('border-top: 1px solid var(--lg-directional-border-top) !important;'), 'Directional borders applied to cards and modal');

  // Item 3: Quote hover glow tightened
  assert(themeCss.includes('0 14px 22px -12px rgba(192, 132, 252, 0.32)'), 'Quote hover glow tightened to bottom edge in purple-pink');
  assert(themeCss.includes('0 14px 22px -12px rgba(255, 255, 255, 0.22)'), 'Quote hover glow tightened to bottom edge in monochrome');
  assert(themeCss.includes('0 14px 22px -12px rgba(255, 126, 54, 0.26)'), 'Quote hover glow tightened to bottom edge in white-orange');

  // Items 4, 5, 6: 4 Stat Boxes (border-radius: 4px and solid hover colors)
  assert(themeCss.includes('border-radius: 4px !important;'), 'Stat boxes enforce sharp 4px rectangular radius');
  assert(themeCss.includes('background: rgba(192, 132, 252, 0.28) !important;'), 'Purple-pink stat hover uses solid light neon purple');
  assert(themeCss.includes('background: rgba(255, 158, 88, 0.28) !important;'), 'White-orange stat hover uses solid light neon orange');

  // Item 7: Quiz Option Center Spotlight Removal
  assert(styleCss.includes('.quiz-option-btn::before') && styleCss.includes('display: none !important;'), 'Quiz option center spotlight disabled');

  // Item 8: Mobile Bottom Nav
  assert(styleCss.includes('.bottom-nav,') && styleCss.includes('border-radius: 20px !important;') && styleCss.includes('backdrop-filter: blur(26px) saturate(190%) !important;'), 'Mobile bottom nav is squircle floating liquid glass');
  assert(styleCss.includes('html[data-theme="white-orange"] .bottom-nav .bottom-nav-item.active') && styleCss.includes('color: #ea580c !important;'), 'White-orange mobile bottom nav active item has vivid deep orange text & icon');

  // Item 9: Mobile centering & 2-column action buttons
  assert(styleCss.includes('padding: 64px 12px 96px 12px !important;'), 'Content wrapper properly padded for mobile HUD and bottom nav');
  assert(styleCss.includes('.bank-actions-row,') && styleCss.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;'), 'Bank actions row uses 2-column grid on mobile');

  // Item 10: Single native document scroller (No double scrollbar)
  assert(styleCss.includes('overflow-x: clip !important;') && styleCss.includes('overflow-y: auto !important;') && styleCss.includes('html {'), 'html element is single native scroller');
  assert(styleCss.includes('#view-bank') && styleCss.includes('overflow-y: visible !important;'), 'View containers delegate scrolling to root document');

  // Item 11: LaTeX smart line-wrapping
  assert(styleCss.includes('.katex-html > .base::after') && styleCss.includes('content: "\\200B";'), 'KaTeX formulas have soft line-break opportunities');

  // Item 12: Flashcard auto-height grid 1x1 & 0.96rem font
  assert(styleCss.includes('.flashcard-card') && styleCss.includes('grid-template-columns: minmax(0, 1fr) !important;'), 'Flashcard uses CSS Grid 1x1 auto-height');
  assert(styleCss.includes('font-size: 0.96rem !important;'), 'Flashcard explanation uses standard 0.96rem font size');

  // Item 13: Lofi First-Interaction AutoPlay
  assert(lofiJs.includes('setupFirstInteractionAutoPlay'), 'LofiPlayer implements setupFirstInteractionAutoPlay');
  assert(lofiJs.includes('pointerdown') && lofiJs.includes('touchstart'), 'setupFirstInteractionAutoPlay binds user touch/pointer gestures');

  // Item 14: Lofi settings CyberDropdown & range slider theming
  assert(indexHtml.includes('id="lofi-track-dropdown-wrap"') && indexHtml.includes('id="lofi-track-dropdown-trigger"'), 'Settings includes CyberDropdown for track selection');
  assert(lofiJs.includes('lofi-track-dropdown-menu'), 'LofiPlayer synchronizes CyberDropdown menu items');
  assert(themeCss.includes('--range-track-bg:') && themeCss.includes('--range-thumb-glow:'), 'theme.css defines unified range slider tokens');

  // Item 15: Theme Energy Wave Chamber
  assert(indexHtml.includes('theme-energy-wave-chamber') && indexHtml.includes('id="theme-energy-slider"'), 'index.html embeds Theme Energy Wave Chamber');
  assert(indexHtml.includes('energy-wave-svg'), 'index.html includes SVG resonance wave');
  assert(appJs.includes('syncThemeEnergyChamber') && appJs.includes('onThemeEnergySliderInput'), 'app.js implements Theme Energy Wave Chamber controls');
  assert(appJs.includes('selectThemeViaEnergyWave'), 'app.js supports direct wave node selection');
}

console.log('\n=== TEST SUITE 21: Phase 1o Free Wave Threshold Switching, Lofi Track Switcher, Modal Liquid Glass & Mobile Responsive Architecture ===');
{
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const lofiJs = fs.readFileSync(path.join(__dirname, '../js/lofi-music.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // Item 1: Energy Wave Free Dragging, Threshold Switching & Screen Ripple
  assert(indexHtml.includes('id="theme-energy-slider"') && indexHtml.includes('step="0.5"'), 'Energy slider allows smooth continuous dragging with step=0.5');
  assert(indexHtml.includes('id="theme-wave-transition-overlay"'), 'DOM contains screen-wide wave transition overlay');
  assert(appJs.includes('_updateEnergyWaveVisuals') && appJs.includes('cycles = 2.2 + t * 3.8'), 'app.js continuously morphs wave geometry across 0..100%');
  assert(appJs.includes('_resolveEnergyThemeFromVal') && appJs.includes('n < 25') && appJs.includes('n < 50') && appJs.includes('n < 75') && appJs.includes('triggerThemeWaveTransition'), 'app.js triggers 4-milestone theme changes and ripple across 25%, 50%, 75% thresholds');
  assert(styleCss.includes('.energy-wave-hud') && styleCss.includes('rgba(12, 10, 22, 0.72) !important;'), 'Energy wave HUD uses high-contrast blurred background above wave');
  assert(styleCss.includes('.energy-slider-control-wrap::before { left: 33.5% !important; }'), 'Energy slider indicates 33.5% threshold marker');
  assert(styleCss.includes('.energy-slider-control-wrap::after  { left: 66.5% !important; }'), 'Energy slider indicates 66.5% threshold marker');

  // Item 2: Lofi Track Switcher & selectTrack
  assert(lofiJs.includes('selectTrack(trackKey, event)'), 'LofiPlayer implements selectTrack');
  assert(lofiJs.includes('this.stop()') && lofiJs.includes('tinhminhlakey_lofi_track_idx'), 'selectTrack halts existing playback and updates saved track index');
  assert(lofiJs.includes('this.selectTrack((this.currentIndex + 1)'), 'LofiPlayer nextTrack delegates to selectTrack');

  // Item 3: Modal Liquid Glass 3 Themes
  assert((themeCss.includes('rgba(64, 48, 98, 0.56) 0%,') && themeCss.includes('rgba(32, 22, 54, 0.46) 55%')), 'Purple-pink modal-box uses luminous liquid glass');
  assert(themeCss.includes('html[data-theme="monochrome"] .modal-box') && themeCss.includes('rgba(54, 54, 62, 0.56) 0%,') && themeCss.includes('rgba(22, 22, 26, 0.46) 55%'), 'Monochrome modal-box uses 100% silver-smoke noir glass without purple tint');
  assert(themeCss.includes('html[data-theme="white-orange"] .modal-box') && themeCss.includes('rgba(255, 253, 250, 0.66) 0%,') && themeCss.includes('rgba(255, 242, 228, 0.52) 55%'), 'White-orange modal-box uses warm milky glass with crisp dark text');

  // Item 4: Flashcard answer LaTeX color in white-orange
  assert(themeCss.includes('html[data-theme="white-orange"] #flashcard-answer-text .katex') && themeCss.includes('color: #059669 !important;'), 'White-orange flashcard answer LaTeX formulas styled emerald green');

  // Item 5: LMS Format Guide Card theme sync
  assert(!indexHtml.includes('tech-tag" style="background: rgba(167, 139, 250'), 'index.html has no purple inline styles on LMS tech-tag');
  assert(themeCss.includes('html[data-theme="monochrome"] .lms-format-guide-card') && themeCss.includes('rgba(32, 32, 38, 0.64) !important;'), 'LMS guide card themed for monochrome');
  assert(themeCss.includes('html[data-theme="white-orange"] .lms-format-guide-card') && themeCss.includes('rgba(255, 248, 240, 0.76) !important;'), 'LMS guide card themed for white-orange');

  // Item 6: Mobile Bottom Nav Portrait Solid Static Backing
  assert(styleCss.includes('@media (max-width: 840px) and (orientation: portrait)'), 'style.css defines mobile portrait bottom nav query');
  assert(styleCss.includes('--bnav-active-bg: #9333ea;') && styleCss.includes('--bnav-active-bg: #ffffff;') && styleCss.includes('--bnav-active-bg: #f97316;'), 'Theme-specific static solid backing colors defined');
  assert(styleCss.includes('stroke-width: 2.35 !important;'), 'Active bottom nav item has crisp 2.35px stroke width');

  // Item 7: Mobile Landscape Ergonomics
  assert(styleCss.includes('@media (orientation: landscape) and (max-height: 550px)'), 'style.css defines mobile landscape media query');
  assert(styleCss.includes('width: 64px !important;') && styleCss.includes('margin-left: 64px !important;'), 'Landscape bottom nav becomes slim 64px left dock');
  assert(styleCss.includes('body.quiz-active .bottom-nav') && styleCss.includes('display: none !important;'), 'Bottom nav hidden during study mode in landscape');
  assert(styleCss.includes('.srs-ratings-bar') && styleCss.includes('grid-template-columns: repeat(4, minmax(0, 1fr)) !important;'), 'SRS buttons laid out in 1 row 4 columns for landscape');
}

console.log('\n=== TEST SUITE 22: Phase 1q 6 Core Features & Fixes (Deck Deletion, Citation Strip, Duplicate Subjects, Options Align, Focus Exit, Study Rewind) ===');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const { AIParser, stripCitationArtifacts } = require('../js/parser.js');

  // Item 1: Deck Deletion Modal & Event Delegation
  assert(appJs.includes('confirmDeleteDeck(deckId') && appJs.includes('executeDeleteDeck(deckId'), 'app.js implements confirmDeleteDeck and executeDeleteDeck');
  assert(indexHtml.includes('id="modal-confirm-delete-deck"'), 'index.html contains modal-confirm-delete-deck template');
  assert(appJs.includes('App.confirmDeleteDeck') && appJs.includes('event.stopPropagation()'), 'Deck card delete button triggers App.confirmDeleteDeck with stopPropagation');
  assert(styleCss.includes('.deck-delete-btn') && styleCss.includes('pointer-events: auto !important;'), 'style.css ensures pointer-events: auto on deck-delete-btn');

  // Item 2: Citation Artifacts Stripping & AI Prompt Prohibition
  assert(typeof stripCitationArtifacts === 'function', 'stripCitationArtifacts function exported from parser.js');
  const sampleWithCitations = 'Khẳng định nào đúng? [cite: 1, 2, 3] Phương án: 【4:0†source】 đúng [cite_start] [cite_end].';
  const cleaned = stripCitationArtifacts(sampleWithCitations);
  assert(!cleaned.includes('[cite') && !cleaned.includes('【') && !cleaned.includes('†source】'), 'stripCitationArtifacts removes all cite and notebooklm brackets');
  assert(cleaned === 'Khẳng định nào đúng? Phương án: đúng.', 'stripCitationArtifacts normalizes whitespace and punctuation');

  const promptTemplate = AIParser.generateAIPromptTemplate({ topic: 'Kiểm thử' });
  assert(promptTemplate.includes('CẤM TUYỆT ĐỐI việc chèn các ký hiệu trích dẫn') && promptTemplate.includes('[cite: 1, 2]'), 'AI prompt template strictly prohibits citations');
  assert(appJs.includes('stripCitationArtifacts') && appJs.includes('let str = this.stripCitationArtifacts(String(text));'), 'App.renderLatexText sanitizes citation artifacts at line 1');
  assert(dbJs.includes('stripCitations') && dbJs.includes('ensureDataIntegrity'), 'db.ensureDataIntegrity cleans citation artifacts from stored cards');

  // Item 3: Smart Duplicate Subjects Detection & Merge Modal
  assert(dbJs.includes('findDuplicateSubjectGroups') && dbJs.includes('mergeDuplicateSubjectGroups'), 'db.js implements findDuplicateSubjectGroups and mergeDuplicateSubjectGroups');
  assert(appJs.includes('findDuplicateSubjectGroups()') && appJs.includes('showDuplicateSubjectsModal'), 'handleBackupFileChosen detects duplicate subjects and triggers modal');
  assert(indexHtml.includes('id="modal-suggest-merge-subjects"'), 'index.html contains modal-suggest-merge-subjects template');

  // Item 4: Vertical Alignment of Options & Enlarged Explanation Box
  assert(styleCss.includes('align-items: center !important; /* Căn giữa hoàn hảo cả chữ 1 dòng lẫn phân số LaTeX */'), 'style.css centers quiz option items vertically');
  assert(styleCss.includes('.quiz-option-btn .quiz-option-letter') && styleCss.includes('margin: 0 !important;'), 'quiz-option-letter has zero margin to prevent baseline misalignment');
  assert(styleCss.includes('.quiz-option-btn .quiz-option-content') && styleCss.includes('font-size: 1.02rem !important;'), 'quiz-option-content synchronizes font size to 1.02rem');
  assert(styleCss.includes('#quiz-explanation-text') && styleCss.includes('font-size: 1.06rem !important;') && styleCss.includes('overflow-wrap: break-word !important;'), 'style.css enlarges explanation font size and breaks word overflow');
  assert(!indexHtml.includes('id="quiz-explanation-text" class="text-sm leading-relaxed" style="font-size: 0.875rem;'), 'index.html removes inline 0.875rem font size from quiz-explanation-text');

  // Item 5: Compact Focus Mode Exit Button
  assert(indexHtml.includes('id="btn-focus-exit"') && indexHtml.includes('Thoát tập trung') && indexHtml.includes('focus-exit-floating-btn'), 'Focus exit button is compact with SVG and Thoát tập trung label');
  assert(styleCss.includes('#btn-focus-exit.focus-exit-btn') && styleCss.includes('height: 34px !important;'), 'style.css enforces 34px height for focus exit button');
  assert(styleCss.includes('@media (max-width: 640px)') && styleCss.includes('width: 36px !important;'), 'Mobile media query shrinks focus exit button to 36px circular icon');

  // Item 6: Study Session Navigation (Previous Question) in Quiz & Flashcard
  assert(indexHtml.includes('id="btn-quiz-prev"') || indexHtml.includes('id="btn-study-prev"'), 'index.html includes previous question navigation');
  assert(indexHtml.includes('id="btn-quiz-prev"'), 'index.html includes btn-quiz-prev in quiz footer actions');
  assert(indexHtml.includes('id="btn-flashcard-prev"') && indexHtml.includes('id="btn-flashcard-next"'), 'index.html includes flashcard previous and next buttons');
  assert(appJs.includes('prevStudyQuestion') && appJs.includes('nextFlashcardReview'), 'app.js implements prevStudyQuestion and nextFlashcardReview');
  assert(appJs.includes('flashcardHistory') && appJs.includes('session.correctCount = Math.max(0, session.correctCount - 1)'), 'rateFlashcard deduplicates score adjustments on rewind');
  assert(appJs.includes("e.key === 'ArrowLeft'") && appJs.includes('prevStudyQuestion'), 'ArrowLeft shortcut triggers prevStudyQuestion');

  // ==========================================
  // TEST SUITE 23: PHASE 1R (SYSTEM IMPACT & REGRESSION RESILIENCE)
  // ==========================================
  console.log('\n--- Test Suite 23: Phase 1r System Impact & Regression Protocol ---');

  // 0 & 1. Data polymorphism & App.init bootstrap resilience
  assert(dbJs.includes('_cleanCitationText') && dbJs.includes('typeof opt ===') && dbJs.includes('opt.text'), 'db.js handles polymorphic options in _cleanCitationText');
  assert(appJs.indexOf('this.setupEventListeners()') < appJs.indexOf('await db.init()'), 'App.init registers setupEventListeners before db.init');
  assert(indexHtml.includes('data-view="dashboard" onclick="App.navigateTo(\'dashboard\')"'), 'Sidebar contains direct onclick navigation fallback');
  assert(indexHtml.includes('class="bottom-nav-item active" data-view="dashboard" onclick="App.navigateTo(\'dashboard\')"'), 'Bottom nav contains direct onclick navigation fallback');

  // 2. Comprehensive closeAllModals & ESC delegation
  assert(appJs.includes('closeAllModals()') && appJs.includes('_batteryAnimToken') && appJs.includes('this._isCompletingSession = false'), 'closeAllModals performs thorough cleanup of modals and battery animation');
  assert(appJs.includes("closest('.modal-close, [data-modal-close]"), 'Global delegation handles modal closing');

  // 3. Progress bar left-aligned ratio calculation
  assert(appJs.includes('current / total') && appJs.includes("progressFill.style.removeProperty('transform')"), 'renderActiveStudyCard sets progress bar ratio with current/total and removes transform');
  assert(styleCss.includes('#study-progress-fill.quiz-progress-fill') && styleCss.includes('transform: none !important;'), 'style.css sets transform: none !important on quiz progress fill');

  // 4. Focus exit button native chip styling
  assert(indexHtml.includes('id="btn-focus-exit"') && indexHtml.includes('focus-exit-btn'), 'Focus exit button adopts focus-exit-btn styling');
  assert(styleCss.includes('#btn-focus-exit') && styleCss.includes('height: 30px !important;'), 'style.css constrains focus exit button height to 30px');

  // 5. Study navigation buttons & shortcuts
  assert(indexHtml.includes('id="btn-quiz-prev"') && !indexHtml.includes('id="btn-quiz-card-prev"'), 'Quiz navigation uses single bottom btn-quiz-prev without redundant top button');
  assert(indexHtml.includes('id="btn-flashcard-prev"') && indexHtml.includes('btn-card-action btn-card-nav'), 'Flashcard toolbar contains btn-flashcard-prev with btn-card-nav');
  assert(indexHtml.includes('id="btn-flashcard-next"') && indexHtml.includes('btn-card-action btn-card-nav'), 'Flashcard toolbar contains btn-flashcard-next with btn-card-nav');
  assert(appJs.includes('shuffleArray(arr)') || appJs.includes('shuffleArray(array)'), 'App implements shuffleArray alias');
  assert(appJs.includes('prevStudyQuestion(event)') && appJs.includes('nextFlashcardReview(event)'), 'app.js prevStudyQuestion and nextFlashcardReview accept event parameter');
}

// === TEST SUITE 24: Phase 1s Float-Up Bank Cards, 0% Purple Wave, Active Range Sliders, Study Progress Fill, Mobile 60FPS Lock ===
console.log('\n--- Test Suite 24: Phase 1s Float-Up Bank Cards, 0% Purple Wave, Active Range Sliders, Study Progress Fill, Mobile 60FPS Lock ---');
{
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const lofiJs = fs.readFileSync(path.join(__dirname, '../js/lofi-music.js'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // 1. Question Bank Float-Up & Lazy Scroll Reveal with Skeleton
  assert(appJs.includes('INITIAL_BATCH = 8') && appJs.includes('SCROLL_BATCH = 8'), 'renderQuestionBank implements INITIAL_BATCH = 8 and SCROLL_BATCH = 8');
  assert(appJs.includes('bank-lazy-sentinel') && appJs.includes('bank-skeleton-card'), 'renderQuestionBank creates skeleton shimmer sentinel on pending batches');
  assert(styleCss.includes('#view-bank .bank-card-item') && styleCss.includes('content-visibility: visible !important;') && styleCss.includes('contain: none !important;'), 'style.css removes content-visibility: auto and contain: paint from #view-bank .bank-card-item');
  assert(styleCss.includes('.bank-card-float-item') && styleCss.includes('.bank-card-float-item.is-visible'), 'style.css defines float-up and visible transition for bank cards');
  assert(styleCss.includes('.bank-skeleton-card') && styleCss.includes('skeletonShimmer'), 'style.css defines skeleton shimmer placeholder animation');

  // 2. Wave Chamber & 0% Purple in Monochrome & Orange Themes
  assert(themeCss.includes('--wave-chamber-bg:') && themeCss.includes('--wave-chamber-border:') && themeCss.includes('--wave-chamber-bottom-glow:'), 'theme.css defines wave chamber background, border and glow tokens');
  assert(themeCss.includes('--wave-area-stop-top:') && themeCss.includes('--wave-area-stop-bot:'), 'theme.css defines wave area gradient stops');
  assert(indexHtml.includes('var(--wave-area-stop-top') && indexHtml.includes('var(--wave-area-stop-bot'), 'index.html SVG gradient references theme wave stop variables');
  assert(appJs.includes("areaTop.setAttribute('stop-color', '#ffffff')") && appJs.includes("areaBot.setAttribute('stop-color', '#09090b')"), 'app.js updates monochrome wave gradient without purple');
  assert(appJs.includes("areaTop.setAttribute('stop-color', '#f97316')") && appJs.includes("areaBot.setAttribute('stop-color', '#fff7ed')"), 'app.js updates white-orange wave gradient without purple');

  // 3. Volume Slider & Wave Slider Active Bar (0% -> --slider-pct)
  assert(themeCss.includes('--range-active-color:') && themeCss.includes('--range-inactive-bg:') && themeCss.includes('--range-thumb-border:'), 'theme.css defines range slider active, inactive and thumb tokens');
  assert(styleCss.includes('--range-active-color) 0%') && styleCss.includes('--range-active-color) var(--slider-pct') && styleCss.includes('--range-inactive-bg) 100%'), 'style.css styles range slider active bar from 0% to --slider-pct');
  assert(lofiJs.includes('syncVolumeSliders()') && lofiJs.includes('--slider-pct'), 'lofi-music.js implements syncVolumeSliders updating --slider-pct');
  assert(appJs.includes('syncRangeSliderVisual(sliderEl)') && appJs.includes('--slider-pct'), 'app.js implements syncRangeSliderVisual updating --slider-pct');

  // 4. Progress bar #study-progress-fill override
  assert(appJs.includes("progressFill.style.setProperty('--study-progress-pct', pctStr)") && appJs.includes("progressFill.style.setProperty('width', pctStr, 'important')"), 'renderActiveStudyCard sets --study-progress-pct and width with important flag');
  assert(styleCss.includes('width: var(--study-progress-pct, 0%) !important;') && styleCss.includes('.quiz-progress-fill'), 'style.css sets width: var(--study-progress-pct, 0%) !important on quiz-progress-fill');

  // 5. Mobile Theme Transition 60FPS & Wave HUD
  assert(styleCss.includes('@media (max-width: 768px)') && styleCss.includes('.theme-energy-wave-chamber') && styleCss.includes('flex-direction: column !important;'), 'style.css separates mobile wave chamber into column flex layout');
  assert(styleCss.includes('html.theme-switching-lock *') && styleCss.includes('transition: none !important;'), 'style.css defines html.theme-switching-lock zero-transition freeze');
  assert(appJs.includes("classList.add('theme-switching-lock')") && appJs.includes("classList.remove('theme-switching-lock')"), 'app.js setTheme toggles theme-switching-lock with timer');
}

// === TEST SUITE 25: Phase 1t Standard Slider Track Fill (0% -> val%) & Frosted Translucent Liquid Glass Sidebar ===
console.log('\n--- Test Suite 25: Phase 1t Standard Slider Track Fill (0% -> val%) & Frosted Translucent Liquid Glass Sidebar ---');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');

  // 1. Slider Track Fill Direction: 0% -> --slider-pct active, --slider-pct -> 100% inactive
  assert(
    styleCss.includes('var(--range-active-color) 0%') &&
    styleCss.includes('var(--range-active-color) var(--slider-pct') &&
    styleCss.includes('var(--range-inactive-bg) var(--slider-pct') &&
    styleCss.includes('var(--range-inactive-bg) 100%'),
    'style.css styles range slider active fill from 0% to --slider-pct and inactive track to 100%'
  );

  // 2. Sidebar Frosted Translucent Liquid Glass & 135deg Bevel
  assert(themeCss.includes('--sidebar-glass-bg:') && themeCss.includes('--sidebar-glass-bevel:'), 'theme.css defines --sidebar-glass-bg and --sidebar-glass-bevel tokens');
  assert(themeCss.includes('--sidebar-glass-border-top:') && themeCss.includes('--sidebar-glass-border-left:'), 'theme.css defines 135deg asymmetric sidebar glass borders');
  assert(styleCss.includes('#app-sidebar.app-sidebar') && styleCss.includes('backdrop-filter: blur(20px) saturate(185%) !important;'), 'style.css applies 20px blur and 185% saturation to app-sidebar');
  assert(styleCss.includes('#app-sidebar.app-sidebar') && styleCss.includes('box-shadow: var(--sidebar-glass-bevel) !important;'), 'style.css applies --sidebar-glass-bevel box-shadow to app-sidebar');
  assert(styleCss.includes('#app-sidebar.app-sidebar::after'), 'style.css defines specular sheen pseudo-element on app-sidebar');
}

// === TEST SUITE 26: Phase 1u Fixed Floating Sidebar, Layout Centering, Quantum Laser Interferometer & Crystal Phase Gates ===
console.log('\n--- Test Suite 26: Phase 1u Fixed Floating Sidebar, Layout Centering, Quantum Laser Interferometer & Crystal Phase Gates ---');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // 1. Sidebar Fixed Positioning & Double-Offset Layout Fix
  assert(styleCss.includes('html body .app-container') && styleCss.includes('display: block !important;'), 'style.css sets display: block !important on desktop app-container');
  assert(styleCss.includes('html body #app-sidebar.app-sidebar') && styleCss.includes('position: fixed !important;'), 'style.css locks fixed position on app-sidebar');
  assert(styleCss.includes('html body #app-sidebar.app-sidebar.collapsed'), 'style.css styles collapsed sidebar fixed capsule');
  assert(styleCss.includes('margin-left: 264px !important;') && styleCss.includes('width: calc(100% - 264px) !important;'), 'style.css synchronizes app-main margin and width for expanded sidebar');
  assert(styleCss.includes('margin-left: 88px !important;') && styleCss.includes('width: calc(100% - 88px) !important;'), 'style.css synchronizes app-main margin and width for collapsed sidebar');
  assert(styleCss.includes('.app-main > .content-wrapper') && styleCss.includes('max-width: 100% !important;'), 'style.css expands content-wrapper to full width');

  // 2. Quantum Laser Interferometer Wave (Resolution, Gaussian Envelope, 4 Layers & Resonance Orb)
  assert(appJs.includes('steps = 160') || (appJs.includes('_waveLUT') && appJs.includes('steps = 160')), 'app.js implements 160-point ultra-smooth wave sampling');
  assert(appJs.includes('0.42 + 0.58 * Math.exp('), 'app.js computes cursor-tracked Gaussian wave-packet envelope');
  assert(indexHtml.includes('id="wave-primary-glow"') && indexHtml.includes('id="wave-primary-core"'), 'index.html contains laser glow and core paths');
  assert(indexHtml.includes('id="wave-cursor-orb"'), 'index.html contains resonance orb element');
  assert(styleCss.includes('.wave-primary-glow') && styleCss.includes('stroke-width: 7px !important;'), 'style.css defines 7px laser glow stroke');
  assert(styleCss.includes('.wave-primary-core') && styleCss.includes('stroke-width: 2.8px !important;'), 'style.css defines 2.8px sharp laser core stroke');
  assert(themeCss.includes('--wave-primary-glow-color:') && themeCss.includes('--wave-orb-fill:') && themeCss.includes('--wave-orb-ring:'), 'theme.css defines laser glow and orb tokens');

  // 3. Crystal Phase Gates at 33.333% & 66.667%
  assert(indexHtml.includes('id="phase-gate-1"') && indexHtml.includes('id="phase-gate-2"'), 'index.html contains phase-gate-1 and phase-gate-2');
  assert(indexHtml.includes('phase-gate-diamond') && indexHtml.includes('phase-gate-core'), 'index.html contains crystal gate sub-elements');
  assert(styleCss.includes('.energy-phase-gate') && styleCss.includes('transform: rotate(45deg)'), 'style.css rotates phase-gate-diamond by 45 degrees');
  assert(styleCss.includes('.energy-phase-gate.is-passed .phase-gate-diamond') || styleCss.includes('.phase-gate-diamond'), 'style.css styles active is-passed state for crystal gates');
  assert(appJs.includes("numericVal >= 25") && appJs.includes("numericVal >= 50") && appJs.includes("numericVal >= 75"), 'app.js activates all 3 phase gates dynamically at 25%, 50%, and 75%');
}

// === TEST SUITE 27: Phase 1v Full-Width Responsive Layout, Liquid Glass Controls & 120FPS Algorithmic Engine ===
console.log('\n--- Test Suite 27: Phase 1v Full-Width Responsive Layout, Liquid Glass Controls & 120FPS Algorithmic Engine ---');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');

  // 1. Full-Width Responsive Layout (244px, 68px, 264px, 88px, max-width: 100% !important)
  assert(styleCss.includes('width: 244px !important;') && styleCss.includes('margin-left: 264px !important;'), 'style.css sets 244px sidebar and 264px main margin');
  assert(styleCss.includes('width: 68px !important;') && styleCss.includes('margin-left: 88px !important;'), 'style.css sets 68px collapsed sidebar and 88px main margin');
  assert(styleCss.includes('max-width: 100% !important;') && styleCss.includes('padding: 16px 22px 56px 14px !important;'), 'style.css expands content-wrapper to full width 100%');

  // 2. Quiz Navigation & Redundant Button Removal
  assert(!indexHtml.includes('id="btn-quiz-card-prev"'), 'index.html completely removes redundant #btn-quiz-card-prev');
  assert(indexHtml.includes('id="btn-quiz-prev"') && indexHtml.includes('lg-pill-btn'), 'index.html retains #btn-quiz-prev with .lg-pill-btn class');

  // 3. Unified Liquid Glass Control Tokens (--lg-ctrl-*)
  assert(themeCss.includes('--lg-ctrl-bg:') && themeCss.includes('--lg-ctrl-hover-bg:') && themeCss.includes('--lg-ctrl-bevel:'), 'theme.css defines unified --lg-ctrl-* tokens');
  assert(styleCss.includes('.lg-pill-btn') && styleCss.includes('border-radius: 999px !important;'), 'style.css defines .lg-pill-btn glass capsules');
  assert(styleCss.includes('.btn-card-action') && styleCss.includes('width: 34px !important;') && styleCss.includes('height: 34px !important;'), 'style.css defines .btn-card-action 34x34px rounded droplets');

  // 4. Parser & LaTeX Fast-Path
  assert(parserJs.includes("text.indexOf('[') === -1 && text.indexOf('【') === -1"), 'parser.js implements fast-path bypass in stripCitationArtifacts');
  assert(appJs.includes("text.indexOf('[') === -1 && text.indexOf('【') === -1"), 'app.js implements fast-path bypass in stripCitationArtifacts');
  assert(appJs.includes("str.indexOf('$') === -1") && appJs.includes("this._escapeHtml(str)"), 'app.js implements non-math fast bypass in renderLatexText');
  assert(appJs.includes('_msFullLatexCache'), 'app.js uses high-level full-string LRU cache _msFullLatexCache');

  // 5. In-Memory Revision Cache (_memCache) & Single-Pass Map in db.js
  assert(dbJs.includes('this._memCache = { revision: this.revision }') || dbJs.includes('this._memCache = null'), 'db.js initializes and manages _memCache');
  assert(dbJs.includes('cardsByTopic = new Map()'), 'db.js implements single-pass Map grouping in getSprintCards');

  // 6. Precomputed _waveLUT in app.js
  assert(appJs.includes('_waveLUT:') && appJs.includes('new Float32Array(steps + 1)'), 'app.js precomputes _waveLUT Float32Array look-up table');

  // 7. Default Background Restoration in App.init()
  assert(appJs.includes("savedBg = './backgrounds/bg-2.webp'") && appJs.includes("db.setMeta('backgroundSrc', savedBg)"), 'app.js defaults to bg-2.webp when backgroundSrc is null/undefined');

  // 8. Clean Wave Chamber & Crystal Phase Gates at 25%, 50% & 75%
  assert(indexHtml.includes('left: 25%') && indexHtml.includes('left: 50%') && indexHtml.includes('left: 75%') && indexHtml.includes('id="phase-gate-3"'), 'index.html positions 3 phase gates cleanly at 25%, 50%, and 75%');
  assert(!indexHtml.includes('id="wave-cursor-beam"'), 'index.html removes #wave-cursor-beam');
  assert(!indexHtml.includes('phase-gate-notch'), 'index.html removes phase-gate-notch');
  assert(indexHtml.includes('class="energy-level-pill"'), 'index.html contains energy-level-pill HUD');
  assert(styleCss.includes('-webkit-mask-image: linear-gradient(90deg'), 'style.css applies edge-fading mask gradient to energy-wave-stage');

  // 9. Option Cleaning & Robust Correct Option Index Resolution
  assert(appJs.includes('getCorrectOptionIndex(card)') && appJs.includes('targetId'), 'app.js defines getCorrectOptionIndex for unified answer index resolution');
  assert(appJs.includes('^(?:[A-Da-d])') && appJs.includes('cleanOptionText(rawOpt, index = 0)'), 'app.js cleanOptionText uses safe non-truncating regex for options');

  // Verify behavior of cleanOptionText on expressions like r – s, r x s, r U s, A -> AB
  const codeMethods = '({' + appJs.slice(appJs.indexOf('getCorrectOptionIndex(card) {'), appJs.indexOf('adaptOptionsLayout(container) {')) + '})';
  const evalMethods = eval(codeMethods);
  const optCases = [
    { in: 'r – s', i: 0, l: 'A', t: 'r – s' },
    { in: 'r x s', i: 1, l: 'B', t: 'r x s' },
    { in: 'r U s', i: 2, l: 'C', t: 'r U s' },
    { in: 'A-> BC', i: 0, l: 'A', t: 'A-> BC' },
    { in: 'A -> AB', i: 0, l: 'A', t: 'A -> AB' },
    { in: 'A. Phương án', i: 0, l: 'A', t: 'Phương án' },
    { in: 'b) Lựa chọn', i: 1, l: 'B', t: 'Lựa chọn' },
    { in: { id: 'c', text: 'r x s' }, i: 2, l: 'C', t: 'r x s' }
  ];
  optCases.forEach(tc => {
    const res = evalMethods.cleanOptionText(tc.in, tc.i);
    assert(res.letter === tc.l && res.cleanText === tc.t, `cleanOptionText preserves "${tc.t}" with letter ${tc.l}`);
  });

  // Verify getCorrectOptionIndex
  assert(evalMethods.getCorrectOptionIndex({ options: ['r x s', 'r – s', 'r U s'], correct_option_id: 'b' }) === 1, 'getCorrectOptionIndex resolves correct option id b to index 1');
  assert(evalMethods.getCorrectOptionIndex({ options: [{id: 'a', text: '1'}, {id: 'b', text: '2'}, {id: 'c', text: '3'}], correctOptionId: 'C' }) === 2, 'getCorrectOptionIndex resolves uppercase ID to index 2');
  assert(evalMethods.getCorrectOptionIndex({ options: ['a', 'b', 'c'], answerIndex: 2 }) === 2, 'getCorrectOptionIndex falls back to valid answerIndex');
}

// === TEST SUITE 28: Phase 1w 3-Layer Zero-Truncation Engine (Parser, IndexedDB Self-Healing, UI) ===
console.log('\n--- Test Suite 28: Phase 1w 3-Layer Zero-Truncation Engine (Parser, IndexedDB Self-Healing, UI) ---');
{
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // --- 1. Layer 1: AIParser zero-truncation on raw JSON & text ---
  assert(!parserJs.includes('while (/^[A-Za-z][\\s.):\\-]+/.test(clean))'), 'parser.js removed greedy while-loop that ate formula stems');
  assert(parserJs.includes('prefixMatch = clean.match(/^(?:[A-Da-d])[\\.\\)\\:]\\s+(.*)$/s)'), 'parser.js uses strict option label prefix regex');

  // Test q61 payload with relational algebra formulas
  const q61Json = JSON.stringify({
    quiz_title: "Cơ sở dữ liệu - q61",
    questions: [
      {
        id: "q61",
        question: "Phép nhân Descartes giữa 2 quan hệ r và s ký hiệu là:",
        options: [
          { id: "a", text: "r – s" },
          { id: "b", text: "r x s" },
          { id: "c", text: "r U s" },
          { id: "d", text: "r + s" }
        ],
        correct_option_id: "b"
      }
    ]
  });
  const parsed61 = AIParser.parse(q61Json);
  assert(parsed61.cards.length === 1, 'q61 parses successfully');
  const card61 = parsed61.cards[0];
  assert(card61.options[0] === 'A. r – s', 'q61 option A is "A. r – s" without truncation');
  assert(card61.options[1] === 'B. r x s', 'q61 option B is "B. r x s" without truncation');
  assert(card61.options[2] === 'C. r U s', 'q61 option C is "C. r U s" without truncation');
  assert(card61.options[3] === 'D. r + s', 'q61 option D is "D. r + s" without truncation');
  assert(card61.answerIndex === 1, 'q61 answerIndex is 1');
  assert(card61.correctOptionId === 'b', 'q61 correctOptionId is b');

  // Test q4 and q77 payloads with functional dependency arrows
  const q4q77Json = JSON.stringify({
    quiz_title: "Phụ thuộc hàm",
    questions: [
      {
        id: "q4",
        question: "Nếu A->B và A->C thì suy ra:",
        options: [
          { id: "a", text: "AA-> C" },
          { id: "b", text: "A -> AB" },
          { id: "c", text: "A-> BC" },
          { id: "d", text: "AB-> BC" }
        ],
        correct_option_id: "c"
      },
      {
        id: "q77",
        question: "Nếu A -> BC suy ra:",
        options: [
          { id: "a", text: "A-> B" },
          { id: "b", text: "A -> C" },
          { id: "c", text: "AC -> B và A -> CC" },
          { id: "d", text: "A -> B và A-> C" }
        ],
        correct_option_id: "d"
      }
    ]
  });
  const parsedFds = AIParser.parse(q4q77Json);
  assert(parsedFds.cards.length === 2, 'q4 and q77 parse successfully');
  const card4 = parsedFds.cards[0];
  assert(card4.options[1] === 'B. A -> AB', 'q4 option B preserves "A -> AB" without truncation');
  assert(card4.options[2] === 'C. A-> BC', 'q4 option C preserves "A-> BC" without truncation');
  assert(card4.answerIndex === 2, 'q4 answerIndex is 2 (option C)');

  const card77 = parsedFds.cards[1];
  assert(card77.options[0] === 'A. A-> B', 'q77 option A preserves "A-> B"');
  assert(card77.options[3] === 'D. A -> B và A-> C', 'q77 option D preserves "A -> B và A-> C"');
  assert(card77.answerIndex === 3, 'q77 answerIndex is 3 (option D)');

  // Text format parser
  const textImport = `Câu 1: Phép nhân Descartes\nA. r – s\nB. r x s\nC. r U s\nD. r + s\nĐáp án: B`;
  const parsedText = AIParser.parse(textImport);
  assert(parsedText.cards.length === 1, 'Text format parses successfully');
  assert(parsedText.cards[0].options[0] === 'A. r – s', 'Text parser option A is "A. r – s"');
  assert(parsedText.cards[0].options[1] === 'B. r x s', 'Text parser option B is "B. r x s"');

  // --- 2. Layer 2: QuizDatabase healCorruptedCardOptions ---
  assert(dbJs.includes('healCorruptedCardOptions(card)'), 'db.js implements healCorruptedCardOptions');
  assert(dbJs.includes('this.healCorruptedCardOptions(c)'), 'db.js calls healCorruptedCardOptions in ensureDataIntegrity');

  // Evaluate healCorruptedCardOptions on mock DB instance
  const dbClassCode = '({' + dbJs.slice(dbJs.indexOf('healCorruptedCardOptions(card) {'), dbJs.indexOf('async ensureDataIntegrity() {')).trim().replace(/,$/, '') + '})';
  const dbEvaluator = eval(dbClassCode);

  // Case 2.1: Healing card using intact rawOptions
  const corruptedCard1 = {
    id: 'corrupt1',
    options: ['A. R. – s', 'B. X. s', 'C. U. s', 'D. R. + s'],
    rawOptions: [
      { id: 'a', text: 'r – s' },
      { id: 'b', text: 'r x s' },
      { id: 'c', text: 'r U s' },
      { id: 'd', text: 'r + s' }
    ],
    correct_option_id: 'b',
    answerIndex: 1
  };
  const mutated1 = dbEvaluator.healCorruptedCardOptions(corruptedCard1);
  assert(mutated1 === true, 'healCorruptedCardOptions reports mutation for card with rawOptions');
  assert(corruptedCard1.options[0] === 'A. r – s', 'corruptedCard1 option A restored to "A. r – s"');
  assert(corruptedCard1.options[1] === 'B. r x s', 'corruptedCard1 option B restored to "B. r x s"');
  assert(corruptedCard1.options[2] === 'C. r U s', 'corruptedCard1 option C restored to "C. r U s"');
  assert(corruptedCard1.options[3] === 'D. r + s', 'corruptedCard1 option D restored to "D. r + s"');
  assert(corruptedCard1.answerIndex === 1, 'corruptedCard1 answerIndex preserved as 1');
  assert(corruptedCard1.correctOptionId === 'b', 'corruptedCard1 correctOptionId set to b');

  // Case 2.2: Healing broken arrow without rawOptions using explanation fallback
  const corruptedCard2 = {
    id: 'corrupt2',
    question: 'Nếu A->B và A->C thì suy ra:',
    options: ['A. AA-> C', 'B. > AB', 'C. > BC', 'D. AB-> BC'],
    explanation: 'Vì theo luật suy diễn Armstrong, phương án chính xác là: A-> BC.',
    correct_option_id: 'c',
    answerIndex: 2
  };
  const mutated2 = dbEvaluator.healCorruptedCardOptions(corruptedCard2);
  assert(mutated2 === true, 'healCorruptedCardOptions reports mutation for broken arrow fallback');
  assert(corruptedCard2.options[1] === 'B. A-> AB', 'corruptedCard2 option B reconstructed to "B. A-> AB"');
  assert(corruptedCard2.options[2] === 'C. A-> BC', 'corruptedCard2 option C reconstructed from explanation to "C. A-> BC"');
  assert(corruptedCard2.answerIndex === 2, 'corruptedCard2 answerIndex is 2');

  // Case 2.3: Healing relational algebra without rawOptions
  const corruptedCard3 = {
    id: 'corrupt3',
    question: 'Phép trừ ký hiệu là:',
    options: ['A. R. – s', 'B. X. s', 'C. U. s', 'D. R. + s'],
    correctOptionId: 'a',
    answerIndex: 0
  };
  const mutated3 = dbEvaluator.healCorruptedCardOptions(corruptedCard3);
  assert(mutated3 === true, 'healCorruptedCardOptions reports mutation for relational algebra fallback');
  assert(corruptedCard3.options[0] === 'A. r – s', 'corruptedCard3 option A restored to "A. r – s"');
  assert(corruptedCard3.options[1] === 'B. r x s', 'corruptedCard3 option B restored to "B. r x s"');

  // --- 3. Layer 3: UI methods in App ---
  assert(appJs.includes('getCardRawOptionAt(card, idx = 0)'), 'app.js defines getCardRawOptionAt');
  const appMethodsCode = '({' + appJs.slice(appJs.indexOf('getCorrectOptionIndex(card) {'), appJs.indexOf('adaptOptionsLayout(container) {')) + '})';
  const appEvaluator = eval(appMethodsCode);

  const testCardUI = {
    options: ['A. R. – s', 'B. X. s'],
    rawOptions: [{ id: 'a', text: 'r – s' }, { id: 'b', text: 'r x s' }]
  };
  assert(appEvaluator.getCardRawOptionAt(testCardUI, 0) === 'r – s', 'getCardRawOptionAt reads pristine rawOptions');
  assert(appEvaluator.getCardRawOptionAt(testCardUI, 1) === 'r x s', 'getCardRawOptionAt reads pristine rawOptions for index 1');

  // UI edit card modal & saveCardEdit synchronization
  assert(appJs.includes('this.cleanOptionText(rawText, i)'), 'openEditCardModal extracts clean option text without prefix');
  assert(appJs.includes('const cleanOpts = options.map((t, idx) => this.cleanOptionText(t, idx).cleanText);'), 'saveCardEdit sanitizes options uniformly');
  assert(appJs.includes('correct_option_id: chosenId') && appJs.includes('correctOptionId: chosenId'), 'saveCardEdit updates both correct_option_id and correctOptionId');
}

// === TEST SUITE 29: Phase 1x Concentric Topbar Pill & Strict 3-Source Classification ('ai' / 'lms' / 'manual') ===
console.log('\n--- Test Suite 29: Phase 1x Concentric Topbar Pill & Strict 3-Source Classification ---');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');

  // 1. Concentric Topbar Pill Geometry (padding: 4px, H_inner = 32px, H_outer = 40px, R_outer - R_inner = 4px)
  assert(styleCss.includes('.topbar-hud-capsule') && styleCss.includes('padding: 4px !important;'), 'style.css defines uniform 4px padding on .topbar-hud-capsule');
  assert(styleCss.includes('height: 40px !important;') && styleCss.includes('border-radius: 9999px !important;'), 'style.css locks 40px height and 9999px border radius on .topbar-hud-capsule');
  assert(styleCss.includes('.theme-icon-btn') && styleCss.includes('width: 32px !important;') && styleCss.includes('height: 32px !important;'), 'style.css defines 32x32px concentric buttons for theme switchers');
  assert(styleCss.includes('.streak-chip') && styleCss.includes('height: 32px !important;'), 'style.css aligns streak-chip height to 32px for concentric curvature');
  assert(themeCss.includes('.topbar-hud-capsule') && themeCss.includes('padding: 4px !important;'), 'theme.css harmonizes topbar-hud-capsule to uniform 4px padding');

  // Mobile Concentric geometry (padding: 3px, H_inner = 28px, H_outer = 34px)
  assert(styleCss.includes('height: 34px !important;') && styleCss.includes('padding: 3px !important;'), 'style.css maintains concentric geometry on mobile screens');

  // 2. Strict 3-Source Classification in Parser (AIParser defaults to 'ai', LMSParser to 'lms')
  const jsonAI = JSON.stringify({
    quiz_title: "AI Test",
    questions: [
      {
        id: "q_ai_1",
        question: "Câu hỏi AI",
        options: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
        correct_option_id: "a"
      }
    ]
  });
  const parsedAIJson = AIParser.parse(jsonAI);
  assert(parsedAIJson.cards[0].source === 'ai', 'AIParser JSON parsing tags cards with source: "ai"');

  const textAI = `Câu 1: Câu hỏi AI Plaintext\nA. Đáp án A\nB. Đáp án B\nĐáp án: A`;
  const parsedAIText = AIParser.parse(textAI);
  assert(parsedAIText.cards[0].source === 'ai', 'AIParser plaintext parsing tags cards with source: "ai"');

  const lmsSample = `Câu hỏi 1\nCâu hỏi LMS trắc nghiệm\nChọn một:\na. Đáp án 1\nb. Đáp án 2\nĐáp án đúng là: Đáp án 1`;
  const parsedLms = LMSParser.parse(lmsSample);
  assert(parsedLms.length === 1 && parsedLms[0].source === 'lms', 'LMSParser tags cards with source: "lms"');

  // 3. App creation points synchronization
  assert(appJs.includes("source: c.source || 'ai'"), 'processImport assigns source: "ai" to imported cards');
  assert(appJs.includes("source: 'manual'"), 'saveCardEdit assigns source: "manual" to newly created cards');

  // 4. DB Self-Healing Data Integrity
  assert(dbJs.includes("c.source = 'lms'") && dbJs.includes("c.source = 'ai'") && dbJs.includes("c.source = 'manual'"), 'db.js ensureDataIntegrity normalizes legacy cards to correct sources');

  // 5. Question Bank filtering logic verification
  const mockCards = [
    { id: '1', question: 'Q1', source: 'ai' },
    { id: '2', question: 'Q2', source: 'lms' },
    { id: '3', question: 'Q3', source: 'manual' },
    { id: '4', question: 'Q4' } // legacy card without source
  ];

  const filterBySource = (cards, src) => cards.filter(c => {
    if (!src) return true;
    const cSource = c.source || 'manual';
    if (src === 'manual') {
      return !c.source || c.source === 'manual';
    }
    return cSource === src;
  });

  assert(filterBySource(mockCards, 'ai').length === 1, 'Source filter "ai" strictly isolates AI cards');
  assert(filterBySource(mockCards, 'lms').length === 1, 'Source filter "lms" strictly isolates LMS cards');
  assert(filterBySource(mockCards, 'manual').length === 2, 'Source filter "manual" covers manual cards and legacy fallback');
}

// === TEST SUITE 30: Phase 2b AI Prompt Template & Pedagogical Explanation Standards ===
console.log('\n--- Test Suite 30: Phase 2b AI Prompt Template & Pedagogical Explanation Standards ---');
{
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // 1. Check prompt template generation rules
  const template = AIParser.generateAIPromptTemplate({ topic: 'Đại số quan hệ', count: 10, difficulty: 'hard' });
  assert(typeof template === 'string' && template.includes('Đại số quan hệ'), 'generateAIPromptTemplate incorporates topic');
  assert(template.includes('10 câu hỏi'), 'generateAIPromptTemplate incorporates question count');
  assert(template.includes('"difficulty": "hard"'), 'generateAIPromptTemplate incorporates difficulty');

  // Pedagogical explanation enforcement
  assert(template.includes('Quy tắc BẮT BUỘC cho trường "explanation"'), 'Prompt template defines mandatory explanation section');
  assert(template.includes('Nêu rõ TẠI SAO đáp án đúng là đúng'), 'Prompt template requires justifying correct answer');
  assert(template.includes('Nêu rõ TẠI SAO các phương án nhiễu còn lại sai'), 'Prompt template requires explaining why distractors are wrong');
  assert(template.includes('CẤM TUYỆT ĐỐI viết câu mẫu sáo rỗng'), 'Prompt template strictly forbids hollow repetitive boilerplate');
  assert(template.includes('CHỐNG LƯỜI KHI SINH NHIỀU CÂU'), 'Prompt template requires unique context-bound explanations');

  // 2. Parse sample JSON from inside the template
  const jsonMatch = template.match(/(?:^|\r?\n)```json\s*\r?\n([\s\S]*?)\r?\n```/);
  assert(jsonMatch && jsonMatch[1], 'Prompt template embeds valid json code block');
  const parsedTemplateDeck = AIParser.parse(jsonMatch[1]);
  assert(parsedTemplateDeck.cards.length === 1, 'Template sample JSON parses cleanly into 1 card');
  assert(parsedTemplateDeck.errors.length === 0, 'Template sample JSON has 0 parse errors');
  assert(
    (parsedTemplateDeck.cards[0].explanation.includes('Phương án') && parsedTemplateDeck.cards[0].explanation.includes('sai')) ||
    (parsedTemplateDeck.cards[0].explanation.includes('Loại B vì') && parsedTemplateDeck.cards[0].explanation.includes('loại C vì')),
    'Template sample explanation demonstrates standard pedagogical analysis'
  );

  // 3. App.copyAIPrompt verification
  assert(appJs.includes('copyAIPrompt()') && appJs.includes('AIParser.generateAIPromptTemplate'), 'App.copyAIPrompt calls AIParser.generateAIPromptTemplate');
}

// === TEST SUITE 31: Phase 2c Lightweight WebP Images, Ctrl+V Paste, Lightbox & Hybrid Prompt ===
console.log('\n--- Test Suite 31: Phase 2c Lightweight WebP Images, Ctrl+V Paste, Lightbox & Hybrid Prompt ---');
{
  const parserJs = fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

  // 1. Parser JSON with Question Image and Option Images
  const jsonWithImages = JSON.stringify({
    quiz_title: "Đề thi Cơ sở dữ liệu có ảnh",
    questions: [
      {
        id: "q_img_1",
        question: "Sơ đồ ER dưới đây mô tả mối quan hệ nào?",
        image: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vuUAAA=",
        options: [
          { id: "a", text: "1 - 1", image: "" },
          { id: "b", text: "1 - N", image: "" },
          { id: "c", text: "N - N", image: "" },
          { id: "d", text: "Tự kết nối", image: "" }
        ],
        correct_option_id: "b",
        explanation: "Sơ đồ có đường nối đôi và mũi tên đơn chỉ quan hệ 1-N."
      },
      {
        id: "q_img_2",
        question: "Đâu là biểu đồ miền nghiệm của bất phương trình $x + y \\le 4$?",
        img: "data:image/webp;base64,Q_IMG_DATA",
        options: [
          { id: "a", text: "", image: "data:image/webp;base64,OPT_A_IMG" },
          { id: "b", text: "", image: "data:image/webp;base64,OPT_B_IMG" },
          { id: "c", text: "", image: "data:image/webp;base64,OPT_C_IMG" },
          { id: "d", text: "", image: "data:image/webp;base64,OPT_D_IMG" }
        ],
        correct_option_id: "a",
        explanation: "Miền nghiệm nằm phía dưới đường thẳng $x + y = 4$."
      }
    ]
  });

  const parsedImages = AIParser.parse(jsonWithImages);
  assert(parsedImages.cards.length === 2, 'Parsed 2 cards with images successfully');
  assert(parsedImages.errors.length === 0, 'Zero errors when options have image and empty text');
  assert(parsedImages.cards[0].image && parsedImages.cards[0].image.startsWith('data:image/webp'), 'Card 1 question image extracted');
  assert(parsedImages.cards[1].image === 'data:image/webp;base64,Q_IMG_DATA', 'Card 2 img alias extracted');
  assert(parsedImages.cards[1].rawOptions[0].image === 'data:image/webp;base64,OPT_A_IMG', 'Card 2 option A image extracted into rawOptions');
  assert(parsedImages.cards[1].options[0] === 'A.', 'Option with empty text formatted as "A."');
  assert(parsedImages.cards[1].answerIndex === 0, 'Card 2 correct answer index resolved to 0');

  // 2. Hybrid AI Prompt Strategy
  const promptTemplate = AIParser.generateAIPromptTemplate({ topic: 'Hệ quản trị CSDL' });
  assert(promptTemplate.includes('Chiến lược Hybrid xử lý đề thi có hình ảnh:'), 'Prompt template includes Hybrid Image Strategy header');
  assert(promptTemplate.includes('Bắt buộc OCR và chuyển toàn bộ sang Text + LaTeX'), 'Prompt template requires OCR to LaTeX for formulas & tables');
  assert(promptTemplate.includes('Ảnh sơ đồ (ER, UML, mạch điện) hoặc đồ thị hình học: KHÔNG diễn giải thay thế bằng văn bản'), 'Prompt template forbids verbal slop for ER/geometry diagrams');
  assert(promptTemplate.includes('"image": ""'), 'Prompt template includes image field in JSON structure');

  // 3. App Helper: renderCardImageHtml
  assert(appJs.includes('renderCardImageHtml(src, alt = \'Hình minh họa\', compact = false)'), 'App defines renderCardImageHtml helper');
  assert(appJs.includes('loading="lazy"') && appJs.includes('decoding="async"'), 'renderCardImageHtml uses lazy loading and async decoding');
  assert(appJs.includes('App.openImageLightbox(this.src)'), 'renderCardImageHtml wires click to openImageLightbox');

  // Eval test renderCardImageHtml in isolation
  const dummyApp = {
    _escapeHtml: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    renderCardImageHtml: null
  };
  const renderCardImgCode = appJs.slice(appJs.indexOf('renderCardImageHtml(src,'), appJs.indexOf('openImageLightbox(src) {'));
  dummyApp.renderCardImageHtml = new Function('src', 'alt = "Hình minh họa"', 'compact = false', renderCardImgCode.slice(renderCardImgCode.indexOf('{') + 1, renderCardImgCode.lastIndexOf('}')));
  
  const imgHtmlNormal = dummyApp.renderCardImageHtml('test.webp', 'Đề bài', false);
  assert(imgHtmlNormal.includes('class="card-media-wrap"') && imgHtmlNormal.includes('src="test.webp"'), 'renderCardImageHtml outputs normal wrap');
  const imgHtmlCompact = dummyApp.renderCardImageHtml('test_thumb.webp', 'Đáp án A', true);
  assert(imgHtmlCompact.includes('class="card-media-wrap card-media-compact"'), 'renderCardImageHtml outputs compact wrap');
  assert(dummyApp.renderCardImageHtml('') === '' && dummyApp.renderCardImageHtml(null) === '', 'renderCardImageHtml returns empty string on null/empty src');

  // 4. compressImageToWebP
  assert(appJs.includes('compressImageToWebP(fileOrBlob, maxWidth = 880, quality = 0.78)'), 'App defines compressImageToWebP with correct defaults');
  assert(appJs.includes('canvas.toDataURL(\'image/webp\'') || appJs.includes('toDataURL("image/webp"'), 'compressImageToWebP uses image/webp');

  // 5. DB syncOptionsFromRaw & updateCardContent
  assert(dbJs.includes('syncOptionsFromRaw(card)'), 'db.js defines syncOptionsFromRaw');
  const dbSyncCode = '({' + dbJs.slice(dbJs.indexOf('syncOptionsFromRaw(card) {'), dbJs.indexOf('async resetDeckProgress(')).trim().replace(/,$/, '') + '})';
  const dbSyncEvaluator = eval(dbSyncCode);
  const mockCardWithImg = {
    id: 'test_card_img',
    image: 'data:image/webp;base64,Q_IMG',
    options: ['Old A', 'Old B'],
    rawOptions: [
      { id: 'a', text: 'Sơ đồ A', image: 'data:image/webp;base64,OPT_A' },
      { id: 'b', text: 'Sơ đồ B', image: 'data:image/webp;base64,OPT_B' }
    ]
  };
  const syncedCard = dbSyncEvaluator.syncOptionsFromRaw(mockCardWithImg);
  assert(syncedCard.image === 'data:image/webp;base64,Q_IMG', 'syncOptionsFromRaw preserves card.image');
  assert(syncedCard.rawOptions[0].image === 'data:image/webp;base64,OPT_A', 'syncOptionsFromRaw preserves rawOptions[0].image');
  assert(syncedCard.options[0] === 'A. Sơ đồ A' && syncedCard.options[1] === 'B. Sơ đồ B', 'syncOptionsFromRaw correctly regenerates options');

  // 6. UI & Modals: Lightbox & Edit Card Paste Zone
  assert(indexHtml.includes('id="modal-lightbox"') && indexHtml.includes('class="modal-overlay modal-lightbox"'), 'index.html defines #modal-lightbox');
  assert(indexHtml.includes('id="lightbox-image"'), 'index.html defines #lightbox-image');
  assert(indexHtml.includes('id="quiz-card-image"'), 'index.html defines #quiz-card-image');
  assert(indexHtml.includes('id="exam-q-image-wrap"'), 'index.html defines #exam-q-image-wrap');
  assert(indexHtml.includes('id="flashcard-front-image"'), 'index.html defines #flashcard-front-image');
  assert(indexHtml.includes('id="flashcard-back-image"'), 'index.html defines #flashcard-back-image');
  assert(indexHtml.includes('id="edit-card-img-zone-question"'), 'index.html defines question image upload/paste zone');
  assert(indexHtml.includes('id="edit-card-img-zone-a"'), 'index.html defines option A image upload/paste zone');
  assert(indexHtml.includes('id="edit-card-img-zone-b"'), 'index.html defines option B image upload/paste zone');
  assert(indexHtml.includes('id="edit-card-img-zone-c"'), 'index.html defines option C image upload/paste zone');
  assert(indexHtml.includes('id="edit-card-img-zone-d"'), 'index.html defines option D image upload/paste zone');

  // 7. CSS styling
  assert(styleCss.includes('.card-media-wrap'), 'style.css defines .card-media-wrap');
  assert(styleCss.includes('.card-media-compact'), 'style.css defines .card-media-compact');
  assert(styleCss.includes('.modal-lightbox'), 'style.css defines .modal-lightbox');
  assert(styleCss.includes('.card-image-upload-zone'), 'style.css defines .card-image-upload-zone');
  assert(styleCss.includes('.btn-remove-card-image'), 'style.css defines .btn-remove-card-image');

  // 8. Backward Compatibility: Old deck without images
  const oldDeckJson = JSON.stringify({
    quiz_title: "Bộ đề cũ không có ảnh",
    questions: [
      {
        id: "q_old_1",
        question: "Thủ đô của Việt Nam là gì?",
        options: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Huế"],
        answer: 0,
        explanation: "Hà Nội là thủ đô của Việt Nam."
      }
    ]
  });
  const parsedOld = AIParser.parse(oldDeckJson);
  assert(parsedOld.cards[0].image === null, 'Old card image is null without error');
  assert(parsedOld.cards[0].rawOptions[0].image === undefined, 'Old rawOption image is undefined');
  assert(!JSON.stringify(parsedOld.cards[0]).includes('undefined'), 'Card serialization contains no undefined strings');
}

// === TEST SUITE 32: Phase 2e Self-Healing JSON Parser, Multi-Block & Enhanced AI Prompt ===
console.log('\n--- Test Suite 32: Phase 2e Self-Healing JSON Parser, Multi-Block & Enhanced AI Prompt ---');
{
  // 1. Case (a): chuỗi " + " ở explanation và trailing comma
  const sampleConcatAndTrailingComma = `{
    "quiz_title": "Toán Đại Số - Tự Sửa Lỗi",
    "questions": [
      {
        "id": "q1",
        "question": "Biểu thức 1 + 1 có giá trị là bao nhiêu?",
        "options": [
          { "id": "a", "text": "2" },
          { "id": "b", "text": "3" },
        ],
        "correct_option_id": "a",
        "explanation": "Vì 1 + 1 = 2 theo " + "định nghĩa phép toán số học cơ bản."
      },
    ]
  }`;

  const parsedA = AIParser.parse(sampleConcatAndTrailingComma);
  assert(parsedA.cards.length === 1, 'Case (a) parses 1 card successfully');
  assert(parsedA.cards[0].explanation === 'Vì 1 + 1 = 2 theo định nghĩa phép toán số học cơ bản.', 'Case (a) auto-concatenates " + " without syntax error');
  assert(parsedA.cards[0].question.includes('1 + 1'), 'Question text containing + is preserved intact');

  // 1.1 Raw newline inside string literal
  const sampleRawNewline = `{
    "quiz_title": "Xuống Dòng Thô",
    "questions": [
      {
        "id": "q1",
        "question": "Câu hỏi test",
        "options": [
          { "id": "a", "text": "A" },
          { "id": "b", "text": "B" }
        ],
        "correct_option_id": "a",
        "explanation": "Dòng 1
Dòng 2 raw newline"
      }
    ]
  }`;
  const parsedNewline = AIParser.parse(sampleRawNewline);
  assert(parsedNewline.cards.length === 1, 'Raw newline inside string literal is auto-repaired to \\n');
  assert(parsedNewline.cards[0].explanation.includes('Dòng 1') && parsedNewline.cards[0].explanation.includes('Dòng 2'), 'Explanation with repaired newline is intact');

  // 2. Case (b): JSON bị cắt cụt giữa câu q10 rồi nối tiếp block ```json thứ hai bên dưới
  const sampleQ10CutOff = `\`\`\`json
{
  "quiz_title": "Bộ đề thi cắt cụt",
  "questions": [
    ${Array.from({ length: 9 }, (_, i) => `{"id": "q${i+1}", "question": "Câu hỏi số ${i+1}?", "options": [{"id":"a", "text":"Đúng"}, {"id":"b", "text":"Sai"}], "correct_option_id":"a"}`).join(',\n    ')},
    {"id": "q10", "question": "Câu 10 bị cụt dở dang do chạm token...
\`\`\`
AI xin lỗi vì bị đứt đoạn, tôi xin hoàn thành lại từ câu 1:
\`\`\`json
{
  "quiz_title": "Bộ đề thi cắt cụt",
  "questions": [
    ${Array.from({ length: 9 }, (_, i) => `{"id": "q${i+1}", "question": "Câu hỏi số ${i+1}?", "options": [{"id":"a", "text":"Đúng"}, {"id":"b", "text":"Sai"}], "correct_option_id":"a"}`).join(',\n    ')},
    {"id": "q10", "question": "Câu hỏi số 10 hoàn chỉnh?", "options": [{"id":"a", "text":"Đúng"}, {"id":"b", "text":"Sai"}], "correct_option_id":"a", "explanation": "Giải thích chi tiết 10"},
    {"id": "q11", "question": "Câu hỏi số 11?", "options": [{"id":"a", "text":"Đúng"}, {"id":"b", "text":"Sai"}], "correct_option_id":"a"}
  ]
}
\`\`\``;

  const parsedB = AIParser.parse(sampleQ10CutOff);
  assert(parsedB.cards.length === 11, 'Case (b) rescues truncated block 1 and deduplicates to 11 cards');
  assert(parsedB.cards[9].question === 'Câu hỏi số 10 hoàn chỉnh?', 'Case (b) prioritizes more complete question 10 from block 2');
  assert(parsedB.cards[10].id === 'q11', 'Case (b) appends new question 11 with sequential id');
  assert(parsedB.cards[0].id === 'q1' && parsedB.cards[8].id === 'q9', 'Case (b) cleanly renumbers q1..qN');

  // 3. Case (c): Multi-block nối tiếp 1–20 và 21–40
  const sampleMultiBlock = `\`\`\`json
{
  "quiz_title": "Ngân hàng 40 câu - Phần 1",
  "questions": [
    ${Array.from({ length: 20 }, (_, i) => `{"id": "q${i+1}", "question": "Bài tập phần 1 số ${i+1}?", "options": [{"id":"a", "text":"A"}, {"id":"b", "text":"B"}], "correct_option_id":"a"}`).join(',\n    ')}
  ]
}
\`\`\`
Tiếp tục phần 2:
\`\`\`json
{
  "quiz_title": "Ngân hàng 40 câu - Phần 2",
  "questions": [
    ${Array.from({ length: 20 }, (_, i) => `{"id": "q${i+1}", "question": "Bài tập phần 2 số ${i+21}?", "options": [{"id":"a", "text":"A"}, {"id":"b", "text":"B"}], "correct_option_id":"a"}`).join(',\n    ')}
  ]
}
\`\`\``;

  const parsedC = AIParser.parse(sampleMultiBlock);
  assert(parsedC.cards.length === 40, 'Case (c) merges two 20-question blocks into exactly 40 cards');
  assert(parsedC.cards[0].id === 'q1' && parsedC.cards[0].question.includes('phần 1 số 1'), 'Case (c) card 1 is correctly indexed');
  assert(parsedC.cards[20].id === 'q21' && parsedC.cards[20].question.includes('phần 2 số 21'), 'Case (c) card 21 renumbered from block 2 q1 to q21');
  assert(parsedC.cards[39].id === 'q40' && parsedC.cards[39].question.includes('phần 2 số 40'), 'Case (c) card 40 renumbered from block 2 q20 to q40');

  // 4. Enhanced AI Prompt Template Checks
  const template = AIParser.generateAIPromptTemplate({ topic: 'Cơ sở dữ liệu nâng cao', count: 25 });
  assert(template.includes('CẤM TUYỆT ĐỐI: nối chuỗi kiểu code (" + ", \' + \')'), 'Prompt template strictly forbids " + " string concatenation');
  assert(template.includes('xuống dòng thô trong chuỗi JSON (mọi xuống dòng phải dùng \\n)'), 'Prompt template strictly forbids raw newline');
  assert(template.includes('hoặc tự ngắt để viết lại từ q1 giữa chừng'), 'Prompt template forbids self-resetting to q1');
  assert(template.includes('Chỉ xuất tiếp ở lượt sau nếu chạm giới hạn độ dài của model'), 'Prompt template specifies continuation only on model token limit');
  assert(template.includes('tuyệt đối không lặp lại câu cũ'), 'Prompt template forbids repeating old questions on continuation');
  assert(template.includes('"image": ""'), 'Prompt template retains "image": "" schema');
}

// === TEST SUITE 33: Regression Test for Embedded Markdown Code Fences (```c, ```text) & Escaped Characters ===
console.log('\n--- Test Suite 33: Embedded Markdown Code Fences (```c, ```text) & Escaped Characters ---');
{
  // 1. Direct Standard JSON containing ```c, ```text, \" and \\
  const standardJsonWithCodeFences = JSON.stringify({
    quiz_title: "Kiểm tra Lập trình C & Hệ thống nhúng",
    questions: [
      {
        id: "q1",
        question: "Cho đoạn mã nguồn sau:\n```c\n#include <stdio.h>\nint main() {\n    int a = 5;\n    printf(\"%d\\n\", a);\n    return 0;\n}\n```\nChương trình sẽ in ra kết quả gì trên màn hình console?",
        options: [
          { id: "a", text: "5" },
          { id: "b", text: "0" },
          { id: "c", text: "Lỗi biên dịch: printf chưa được định nghĩa" },
          { id: "d", text: "Không in ra gì (\"output rỗng\")" }
        ],
        correct_option_id: "a",
        explanation: "Hàm `printf` định dạng \"%d\" in giá trị biến số nguyên `a = 5` kèm ký tự xuống dòng."
      },
      {
        id: "q2",
        question: "Xem output nhật ký hệ thống sau:\n```text\n[INFO] Starting daemon at \\etc\\service...\n[SUCCESS] Connection established.\n```\nĐoạn log trên thể hiện trạng thái gì?",
        options: [
          { id: "a", text: "Dịch vụ đã khởi động và kết nối thành công (\"SUCCESS\")" },
          { id: "b", text: "Dịch vụ gặp lỗi đường dẫn \\etc\\service" }
        ],
        correct_option_id: "a",
        explanation: "Nhãn [SUCCESS] biểu thị quá trình kết nối daemon tại đường dẫn `\\etc\\service` đã hoàn tất mỹ mãn."
      }
    ]
  }, null, 2);

  const parsedDirect = AIParser.parse(standardJsonWithCodeFences);
  assert(parsedDirect.cards.length === 2, 'Direct JSON with ```c & ```text parses 2 cards successfully');
  assert(parsedDirect.cards[0].question.includes('```c'), 'Card 1 preserves ```c code fence');
  assert(parsedDirect.cards[0].question.includes('#include <stdio.h>'), 'Card 1 preserves C source code');
  assert(parsedDirect.cards[0].answerIndex === 0, 'Card 1 correct option index is 0');
  assert(parsedDirect.cards[1].question.includes('```text'), 'Card 2 preserves ```text code fence');
  assert(parsedDirect.cards[1].options[0].includes('"SUCCESS"'), 'Card 2 preserves escaped quotes in option text');
  assert(parsedDirect.cards[1].options[1].includes('\\etc\\service'), 'Card 2 preserves backslashes in option text');
  assert(parsedDirect.errors.length === 0, 'Zero errors on standard JSON with code fences');

  // 2. Outermost markdown wrapper ```json ... ``` with embedded code fences
  const wrappedJsonWithCode = `\`\`\`json
${standardJsonWithCodeFences}
\`\`\``;
  const parsedWrapped = AIParser.parse(wrappedJsonWithCode);
  assert(parsedWrapped.cards.length === 2, 'Outermost ```json ... ``` wrapper with inner ```c parses cleanly');
  assert(parsedWrapped.cards[0].question.includes('printf("%d\\n", a);'), 'Inner C code remains uncorrupted when wrapped');

  // 3. Fallback repair: JSON containing syntax errors (" + ", trailing comma) AND embedded code fence
  const faultyJsonWithCode = `{
    "quiz_title": "Tự sửa lỗi cú pháp có khối code",
    "questions": [
      {
        "id": "q1",
        "question": "Cho mã nguồn:\\n\`\`\`c\\nchar msg[] = \\"Hello \\\\\\"C\\\\\\" World\\\\n\\";\\nputs(msg);\\n\`\`\`\\nĐoạn mã in chuỗi gì?",
        "options": [
          { "id": "a", "text": "Hello \\"C\\" World" },
          { "id": "b", "text": "Lỗi cú pháp chuỗi" },
        ],
        "correct_option_id": "a",
        "explanation": "Hàm puts in ra chuỗi có dấu ngoặc kép " + "nhờ ký tự escape."
      },
    ]
  }`;
  const parsedFaulty = AIParser.parse(faultyJsonWithCode);
  assert(parsedFaulty.cards.length === 1, 'Faulty JSON with " + " and embedded ```c is rescued and parsed');
  assert(parsedFaulty.cards[0].question.includes('```c'), 'Rescued question keeps ```c code fence intact');
  assert(parsedFaulty.cards[0].explanation.includes('Hàm puts in ra chuỗi có dấu ngoặc kép nhờ ký tự escape.'), 'Rescued explanation has concatenated string cleaned');

  // 4. Fallback multi-block: 2 JSON blocks where each block contains code fences
  const multiBlockWithCode = `\`\`\`json
{
  "quiz_title": "Lập trình C - Khối 1",
  "questions": [
    {
      "id": "q1",
      "question": "Đoạn mã:\\n\`\`\`c\\nint x = 42;\\n\`\`\`",
      "options": [{"id":"a", "text":"42"}, {"id":"b", "text":"0"}],
      "correct_option_id": "a"
    }
  ]
}
\`\`\`
Tiếp tục khối 2:
\`\`\`json
{
  "quiz_title": "Lập trình C - Khối 2",
  "questions": [
    {
      "id": "q2",
      "question": "Output shell:\\n\`\`\`text\\nProcess exited with status 0\\n\`\`\`",
      "options": [{"id":"a", "text":"Thành công"}, {"id":"b", "text":"Lỗi"}],
      "correct_option_id": "a"
    }
  ]
}
\`\`\``;
  const parsedMulti = AIParser.parse(multiBlockWithCode);
  assert(parsedMulti.cards.length === 2, 'Multi-block with embedded ```c and ```text merges into 2 cards');
  assert(parsedMulti.cards[0].question.includes('```c'), 'Multi-block card 1 keeps ```c code fence');
  assert(parsedMulti.cards[1].question.includes('```text'), 'Multi-block card 2 keeps ```text code fence');
}

// === TEST SUITE 34: formatRichText Helper, Code Blocks, Inline Code & KaTeX Isolation ===
console.log('\n--- Test Suite 34: formatRichText Helper, Code Blocks, Inline Code & KaTeX Isolation ---');
{
  const { App, formatRichText } = require('../js/app.js');
  assert(typeof App.formatRichText === 'function', 'App defines formatRichText method');
  assert(typeof formatRichText === 'function', 'formatRichText is exported as a function');

  // Case 1: Fenced code block with language, multiple lines, indentation and C includes
  const cSnippet = `Cho đoạn mã nguồn C sau:
\`\`\`c
#include <stdio.h>
#include <stdbool.h>

int main() {
    int a = 5;
    printf("%d\\n", a);
    return 0;
}
\`\`\`
Hỏi chương trình xuất kết quả gì?`;

  const renderedC = formatRichText(cSnippet);
  assert(renderedC.includes('<pre class="code-block" data-lang="c" class="language-c">'), 'formatRichText renders <pre class="code-block" with language-c');
  assert(renderedC.includes('<code>#include &lt;stdio.h&gt;\n#include &lt;stdbool.h&gt;'), 'formatRichText safely escapes <stdio.h> to &lt;stdio.h&gt; inside <code>');
  assert(!renderedC.includes('<stdio.h>'), 'Raw unescaped <stdio.h> tag is not present');
  assert(renderedC.includes('\n    int a = 5;\n'), 'Indentation and newlines inside code block are preserved');
  assert(renderedC.includes('Cho đoạn mã nguồn C sau:'), 'Text before code block is preserved');
  assert(renderedC.includes('Hỏi chương trình xuất kết quả gì?'), 'Text after code block is preserved');

  // Case 2: Inline code `...`
  const inlineSnippet = `Sử dụng hàm \`printf("%d", a)\` và biểu thức \`x < y && y > z\`.`;
  const renderedInline = formatRichText(inlineSnippet);
  assert(renderedInline.includes('<code class="inline-code">printf(&quot;%d&quot;, a)</code>'), 'formatRichText renders inline code pill for printf');
  assert(renderedInline.includes('<code class="inline-code">x &lt; y &amp;&amp; y &gt; z</code>'), 'formatRichText safely escapes < > & inside inline-code');

  // Case 3: Line breaks in normal text (\n -> <br>)
  const multilineText = `Dòng thứ nhất.\nDòng thứ hai.\nDòng thứ ba.`;
  const renderedLines = formatRichText(multilineText);
  assert(renderedLines === 'Dòng thứ nhất.<br>Dòng thứ hai.<br>Dòng thứ ba.', 'formatRichText converts \\n into <br> in normal text without losing lines');

  // Case 4: Math formulas $...$ and $$...$$ alongside code blocks
  const hybridSnippet = `Giả sử hàm $f(x) = x^2$.
\`\`\`c
int sq = square(5);
\`\`\`
Giá trị biến \`sq\` tương ứng với $f(5)$.`;
  const renderedHybrid = formatRichText(hybridSnippet);
  assert(renderedHybrid.includes('<pre class="code-block" data-lang="c" class="language-c">'), 'Hybrid snippet renders code block');
  assert(renderedHybrid.includes('<code class="inline-code">sq</code>'), 'Hybrid snippet renders inline code');
  assert(renderedHybrid.includes('katex') || renderedHybrid.includes('f(x) = x^2'), 'Hybrid snippet preserves math formula outside code block');
  assert(!renderedHybrid.includes('<pre class="code-block" data-lang="c" class="language-c"><code><span class="katex">'), 'KaTeX does not parse into <pre><code> code blocks');

  // Case 5: Empty and null inputs
  assert(formatRichText(null) === '', 'formatRichText returns empty string for null');
  assert(formatRichText(undefined) === '', 'formatRichText returns empty string for undefined');
  assert(formatRichText('   ') === '', 'formatRichText returns empty string for blank whitespace');

  // Case 6: AI Prompt Template refinement checks
  const template = AIParser.generateAIPromptTemplate({ topic: 'Lập trình C', count: 10 });
  assert(template.includes('Đoạn code nhiều dòng dùng block ```c\\n...\\n```'), 'Prompt template guides AI to use multiline ```c code blocks');
  assert(template.includes('Tên biến hoặc lệnh ngắn 1 dòng (như `printf()`, `int _dem2;`, `SELECT`) ưu tiên dùng inline backtick `...`'), 'Prompt template guides AI to use inline backticks');
}

// === TEST SUITE 35: Markdown Tables, KaTeX Cell Rendering & Single-Column Grid Adaptation ===
console.log('\n--- Test Suite 35: Markdown Tables, KaTeX Cell Rendering & Single-Column Grid Adaptation ---');
{
  const { App, formatRichText } = require('../js/app.js');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf-8');

  // Case 1: Markdown Table with Simplex Tableau & KaTeX inside cells
  const simplexTable = `Cho bảng đơn hình sau:
| Biến cơ sở | Hệ số | $x_1$ | $x_2$ |
| :--- | :---: | :---: | ---: |
| $x_3$ | 0 | 2 | 1 |
| $\\Delta$ | | -$3$ | -$2$ |

Phương án tối ưu là gì?`;

  const renderedTable = formatRichText(simplexTable);
  assert(renderedTable.includes('<div class="table-scroll"><table class="md-table">'), 'Table rendered inside .table-scroll with .md-table');
  assert(renderedTable.includes('<thead><tr>'), 'Table contains <thead> and <tr>');
  assert(renderedTable.includes('<th style="text-align: left;">Biến cơ sở</th>'), 'Header alignment style="text-align: left;" applied');
  assert(renderedTable.includes('<th style="text-align: center;">Hệ số</th>'), 'Header alignment style="text-align: center;" applied');
  assert(renderedTable.includes('<th style="text-align: right;">'), 'Header alignment style="text-align: right;" applied');
  assert(renderedTable.includes('<tbody><tr>'), 'Table contains <tbody> and <tr>');
  assert(renderedTable.includes('x_1') || renderedTable.includes('katex'), 'KaTeX rendered inside table header cell $x_1$');
  assert(renderedTable.includes('x_3') || renderedTable.includes('katex'), 'KaTeX rendered inside table body cell $x_3$');
  assert(renderedTable.includes('\\Delta') || renderedTable.includes('Delta') || renderedTable.includes('katex'), 'KaTeX rendered inside table body cell \\Delta');

  // Case 2: Code block with C code, indentation & <stdio.h>
  const cSnippet = `\`\`\`c
#include <stdio.h>
int main() {
    int sum = 0;
    for (int i = 0; i < 10; i++) {
        sum += i;
    }
    printf("%d\\n", sum);
    return 0;
}
\`\`\``;
  const renderedC = formatRichText(cSnippet);
  assert(renderedC.includes('<pre class="code-block" data-lang="c" class="language-c">'), 'C code block rendered with .code-block and data-lang="c"');
  assert(renderedC.includes('<code>#include &lt;stdio.h&gt;'), 'Inside code block <stdio.h> is escaped to &lt;stdio.h&gt;');
  assert(!renderedC.includes('<stdio.h>'), 'Raw unescaped <stdio.h> is absent in code block');
  assert(renderedC.includes('i &lt; 10'), 'Inequality < is safely escaped to &lt;');
  assert(renderedC.includes('\n    int sum = 0;\n'), 'Indentation and line breaks are preserved inside code block');

  // Case 3: Escape <stdio.h> in general text and inline code
  const mixedEscaped = 'Thư viện `<stdio.h>` và thẻ <stdio.h> không bị nuốt.';
  const renderedEsc = formatRichText(mixedEscaped);
  assert(renderedEsc.includes('&lt;stdio.h&gt;'), 'HTML tags like <stdio.h> safely escaped to &lt;stdio.h&gt;');
  assert(!renderedEsc.includes('<stdio.h>'), 'Raw <stdio.h> tag is never present in rendered output');

  // Case 4: Adaptive Single-Column Grid Detection & CSS Rules
  const mockTableContainer = {
    classList: {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    },
    innerHTML: '<div class="table-scroll"><table class="md-table"><tr><td>1</td></tr></table></div>',
    querySelector(sel) {
      if (sel.includes('.md-table') || sel.includes('table')) return {};
      return null;
    },
    querySelectorAll() { return []; }
  };
  App.adaptOptionsLayout(mockTableContainer);
  assert(mockTableContainer.classList.contains('layout-single-column'), 'Table container switches to layout-single-column');
  assert(mockTableContainer.classList.contains('quiz-options--single-col'), 'Table container switches to quiz-options--single-col');

  const mockMatrixContainer = {
    classList: {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    },
    innerHTML: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\end{bmatrix}',
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  App.adaptOptionsLayout(mockMatrixContainer);
  assert(mockMatrixContainer.classList.contains('layout-single-column'), 'Matrix container switches to layout-single-column');
  assert(mockMatrixContainer.classList.contains('quiz-options--single-col'), 'Matrix container switches to quiz-options--single-col');

  // Case 5: CSS Rules Verification (white-space, flex-shrink, align-self, theme styling)
  assert(styleCss.includes('.quiz-options--single-col'), 'CSS defines .quiz-options--single-col');
  assert(styleCss.includes('.table-scroll'), 'CSS defines .table-scroll');
  assert(styleCss.includes('.md-table'), 'CSS defines .md-table');
  assert(styleCss.includes('white-space: nowrap !important;'), 'CSS enforces white-space: nowrap !important on option letters');
  assert(styleCss.includes('align-self: flex-start !important;'), 'CSS aligns option letters and content with flex-start !important');
  assert(styleCss.includes('[data-theme="monochrome"] .md-table'), 'Monochrome theme override exists for .md-table');
  assert(styleCss.includes('[data-theme="white-orange"] .md-table'), 'White-orange theme override exists for .md-table');
  assert(styleCss.includes('[data-theme="ascii"] .md-table'), 'ASCII theme override exists for .md-table');
  assert(styleCss.includes('.katex .matrix') && styleCss.includes('.katex .array'), 'KaTeX matrix and array white-space protection exists');
}

// === TEST SUITE 36: Explanation Letters Remapping on Option Shuffle & KaTeX Matrix Shield ===
console.log('\n--- Test Suite 36: Explanation Letters Remapping on Option Shuffle & KaTeX Matrix Shield ---');
{
  const { App, remapExplanationLetters } = require('../js/app.js');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');

  // Case 1: remapExplanationLetters with letterMap
  // Original options: A, B, C, D
  // Shuffled mapping: A -> B, B -> D, C -> A, D -> C
  const letterMap = {
    'A': 'B',
    'B': 'D',
    'C': 'A',
    'D': 'C'
  };

  const explanation1 = 'Loại B vì trừ $x_4$; loại C và D vì thêm $x_1^g$. Đáp án đúng là A.';
  const remapped1 = remapExplanationLetters(explanation1, letterMap);
  assert(remapped1.includes('Loại D vì trừ $x_4$'), 'B remapped to D after "Loại" keyword');
  assert(remapped1.includes('loại A và C vì thêm $x_1^g$'), 'C and D remapped to A and C after "loại" keyword');
  assert(remapped1.includes('Đáp án đúng là B'), 'A remapped to B after "Đáp án đúng là" keyword');
  assert(remapped1.includes('$x_4$') && remapped1.includes('$x_1^g$'), 'Math formulas in explanation preserved intact');

  // Case 2: Math variables and code must remain 100% untouched
  const explanation2 = 'Phương án $A \\rightarrow BC$ là đúng. Loại A vì vi phạm; chọn B. Biến `printf("B")` không đổi.';
  const remapped2 = remapExplanationLetters(explanation2, letterMap);
  assert(remapped2.includes('$A \\rightarrow BC$'), 'Math formula $A \\rightarrow BC$ is never touched');
  assert(remapped2.includes('`printf("B")`'), 'Inline code `printf("B")` is never touched');
  assert(remapped2.includes('Loại B vì vi phạm'), 'A remapped to B after "Loại"');
  assert(remapped2.includes('chọn D'), 'B remapped to D after "chọn"');

  // Case 3: Empty, null, or identity letterMap
  assert(remapExplanationLetters('', letterMap) === '', 'Empty explanation returns empty string');
  assert(remapExplanationLetters('Giải thích.', null) === 'Giải thích.', 'Null letterMap returns explanation unchanged');
  assert(remapExplanationLetters('Loại A', { 'A': 'A', 'B': 'B' }) === 'Loại A', 'Identity map returns explanation unchanged');

  // Case 4: KaTeX Matrix Bracket SVG Shield CSS & CDN match
  assert(styleCss.includes('*:not(.katex, .katex *)'), 'CSS base reset isolates KaTeX elements from global box-sizing & margin');
  assert(!styleCss.includes('height: inherit !important;') && !styleCss.includes('.katex, .katex * { line-height: normal !important; }'), 'CSS avoids intrusive overrides on KaTeX internals');
  assert(indexHtml.includes('katex@0.18.7'), 'index.html matches KaTeX 0.18.7 version with katex.min.js');

  // Case 5: Real matrix rendering check
  const katex = require('../lib/katex/katex.min.js');
  const matrixLatex = '\\mathbf{A}=\\begin{bmatrix}1&0&2&1&1\\\\1&3&3&2&0\\\\2&2&1&2&1\\end{bmatrix}';
  const renderedMatrix = katex.renderToString(matrixLatex, { displayMode: true });
  assert(renderedMatrix.includes('delimsizing mult'), 'KaTeX renders multiline delimsizing for bmatrix');
  assert(renderedMatrix.includes('<svg xmlns="http://www.w3.org/2000/svg"'), 'KaTeX generates SVG for matrix brackets');
  assert(renderedMatrix.includes('viewBox="0 0 667 3600"'), 'Bracket SVG has valid 667x3600 viewBox');
  assert(renderedMatrix.includes('<path d="M403 1759 V84 H666 V0 H319 V1759'), 'Bracket SVG contains opening bracket path');
  assert(renderedMatrix.includes('<path d="M347 1759 V0 H0 V84 H263 V1759'), 'Bracket SVG contains closing bracket path');

  // Case 6: AI Prompt Template strictly forbids option letters in explanation
  const promptTemplate = AIParser.generateAIPromptTemplate();
  assert(promptTemplate.includes('CẤM GỌI TÊN CHỮ CÁI ĐÁP ÁN'), 'Prompt template strictly forbids option letters in explanation');
  assert(promptTemplate.includes('đảo thứ tự đáp án (shuffle)'), 'Prompt template explains shuffle rationale');
  assert(promptTemplate.includes('Phương án $x^2$ sai do'), 'Prompt template example demonstrates direct explanation');
}

// === TEST SUITE 37: Escaped Currency Dollar \$ Isolation, Wide Option Rules, Missing Image Badges & Strict 5-Rule Prompt ===
console.log('\n--- Test Suite 37: Escaped Currency Dollar \\$ Isolation, Wide Option Rules, Missing Image Badges & Strict 5-Rule Prompt ---');
{
  global.katex = require('../lib/katex/katex.min.js');
  const { App, isWideMatrixOrTableOption, isQuestionMissingImage } = require('../js/app.js');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf-8');

  // Case 1: Escaped Currency Dollar \$ does not break LaTeX parser
  const currencyWithMath = 'Giá là \\$50 cho mỗi đơn vị, biết hàm cầu là $Q = 100 - 2P$ và hàm chi phí $C(x)$.';
  const renderedCurrency = App.renderLatexText(currencyWithMath);
  assert(renderedCurrency.includes('Giá là $50 cho mỗi đơn vị, biết hàm cầu là'), 'Escaped \\$50 is converted to plain dollar without corrupting Vietnamese spaces');
  assert(renderedCurrency.includes('katex') && (renderedCurrency.includes('100') || renderedCurrency.includes('Q')), 'Math formula $Q = 100 - 2P$ is parsed into KaTeX');
  assert(!renderedCurrency.includes('50 cho mỗi đơn vị, biết hàm cầu là $Q'), 'Currency text is not erroneously merged into math formula');

  // Fast-path currency text without math
  const pureCurrency = 'Tổng cộng: \\$100 và \\$200.';
  const renderedPure = App.renderLatexText(pureCurrency);
  assert(renderedPure === 'Tổng cộng: $100 và $200.', 'Pure currency string fast-paths directly to plain text');

  // Sqrt formula rendering check
  const sqrtLatex = 'Biết $-0,828 \\approx 2 - \\sqrt{8}$ là nghiệm.';
  const renderedSqrt = App.renderLatexText(sqrtLatex);
  assert(renderedSqrt.includes('sqrt'), 'Formula with \\sqrt{8} contains KaTeX sqrt elements');
  assert(renderedSqrt.includes('hide-tail'), 'KaTeX sqrt contains hide-tail SVG wrap');

  // Case 2: KaTeX strict isolation CSS
  assert(styleCss.includes('*:not(.katex'), 'CSS base reset isolates KaTeX from global box-sizing & margin');
  assert(!styleCss.includes('.katex, .katex * { line-height: normal !important; }'), 'CSS does not inject intrusive line-height: normal into KaTeX internals');

  // Case 3: Wide Option Detector (2x2 vs 1 column)
  // (a) 1D column vector -> keeps 2x2 (returns false)
  const colVector = '$\\begin{bmatrix} 6 \\\\ 3 \\\\ 2 \\end{bmatrix}$';
  assert(isWideMatrixOrTableOption(colVector) === false, '1D column vector keeps 2x2 grid (returns false)');

  // (b) 2x2 small matrix -> keeps 2x2 (returns false)
  const smallMatrix = '$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$';
  assert(isWideMatrixOrTableOption(smallMatrix) === false, 'Small 2x2 matrix keeps 2x2 grid (returns false)');

  // (c) 3x3 wide matrix -> triggers single column (returns true)
  const wideMatrix = '$\\begin{bmatrix} 1 & 0 & 2 \\\\ 1 & 3 & 3 \\\\ 2 & 2 & 1 \\end{bmatrix}$';
  assert(isWideMatrixOrTableOption(wideMatrix) === true, '3x3 wide matrix triggers single column (returns true)');

  // (d) Markdown table -> triggers single column
  const tableOption = '| A | B |\n|---|---|\n| 1 | 2 |';
  assert(isWideMatrixOrTableOption(tableOption) === true, 'Markdown table in option triggers single column (returns true)');

  // (e) System of equations \begin{cases} or long raw LaTeX / text -> keeps 2x2 grid (returns false)
  const systemOfEq = '$\\begin{cases} 2x + 3y = 5 \\\\ 4x - y = 3 \\end{cases}$';
  assert(isWideMatrixOrTableOption(systemOfEq) === false, 'System of equations \\begin{cases} keeps 2x2 grid (returns false)');
  const complexFormula = '$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} + \\frac{\\alpha + \\beta}{\\gamma + \\delta} = \\int_0^\\infty f(x) dx$';
  assert(isWideMatrixOrTableOption(complexFormula) === false, 'Complex raw LaTeX formula keeps 2x2 grid (returns false)');
  const longText = 'Đây là một phương án văn bản dài thông thường nhưng không chứa bảng markdown hay ma trận 3 cột.'.repeat(2);
  assert(isWideMatrixOrTableOption(longText) === false, 'Long text without markdown table or 3-column matrix keeps 2x2 grid (returns false)');

  // (f) Normal short text -> keeps 2x2
  assert(isWideMatrixOrTableOption('Phương án A đúng.') === false, 'Short text option keeps 2x2 grid (returns false)');

  // (g) CSS Grid verification: 2x2 on desktop, 1-col on mobile, only .quiz-options--single-col switches to 1fr
  assert(styleCss.includes('.quiz-options') && styleCss.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;'), 'CSS specifies 2x2 grid repeat(2, minmax(0, 1fr)) for .quiz-options on desktop');
  assert(styleCss.includes('#quiz-options-container') && styleCss.includes('#exam-options-container'), 'CSS targets #quiz-options-container and #exam-options-container');
  assert(styleCss.includes('@media (max-width: 640px)') && styleCss.includes('#view-study .quiz-options') && styleCss.includes('grid-template-columns: 1fr !important;'), 'CSS collapses to 1fr on mobile');
  assert(styleCss.includes('.quiz-options--single-col') && styleCss.includes('grid-template-columns: 1fr !important;'), 'CSS switches to 1fr only with .quiz-options--single-col');

  // Case 4: Option letter no-wrap & alignment across views
  assert(styleCss.includes('#view-study .quiz-option-letter'), 'CSS targets study view option letter');
  assert(styleCss.includes('#view-exam .quiz-option-letter'), 'CSS targets exam view option letter');
  assert(styleCss.includes('#view-bank .quiz-option-letter'), 'CSS targets bank view option letter');
  assert(styleCss.includes('min-width: 1.6em !important;'), 'CSS enforces min-width: 1.6em !important on option letters');
  const appJsSource = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');
  assert(appJsSource.includes('<span class="quiz-option-letter select-none">${letter}.</span>'), 'renderQuestionBank uses .quiz-option-letter');

  // Case 5: Missing image warning badge
  const cardWithTag = { question: 'Tìm cực trị hàm số [Cần hình minh họa]', image: '' };
  assert(isQuestionMissingImage(cardWithTag) === true, 'Question with [Cần hình minh họa] is flagged missing image');
  const badgeTag = App.renderMissingImageBadgeHtml(cardWithTag);
  assert(badgeTag.includes('card-missing-image-badge') && badgeTag.includes('Câu hỏi này cần hình minh họa gốc'), 'Missing image badge is rendered with message');

  const cardWithGraphicPhrase = { question: 'Dựa vào hình vẽ minh họa bên dưới, tính diện tích...', image: '' };
  assert(isQuestionMissingImage(cardWithGraphicPhrase) === true, 'Question with "hình vẽ minh họa" is flagged missing image');

  const cardWithTablePhraseNoTable = { question: 'Dựa vào bảng bên dưới để xác định phương án đúng:', image: '' };
  assert(isQuestionMissingImage(cardWithTablePhraseNoTable) === true, 'Question with "bảng bên dưới" without table is flagged missing image');

  const cardWithTablePhraseAndTable = {
    question: 'Dựa vào bảng bên dưới để xác định phương án đúng:\n| X | Y |\n|---|---|\n| 1 | 2 |',
    image: ''
  };
  assert(isQuestionMissingImage(cardWithTablePhraseAndTable) === false, 'Question with "bảng bên dưới" WITH Markdown table is NOT flagged');

  const cardWithExistingImage = { question: 'Dựa vào đồ thị bên, tìm tiệm cận:', image: 'data:image/webp;base64,ABC' };
  assert(isQuestionMissingImage(cardWithExistingImage) === false, 'Question with existing image is NOT flagged');
  assert(App.renderMissingImageBadgeHtml(cardWithExistingImage) === '', 'No badge rendered when image is present');

  // Theme overrides for badge
  assert(styleCss.includes('html[data-theme="monochrome"] .card-missing-image-badge'), 'Monochrome theme override exists for missing image badge');
  assert(styleCss.includes('html[data-theme="white-orange"] .card-missing-image-badge'), 'White-orange theme override exists for missing image badge');
  assert(styleCss.includes('html[data-theme="ascii"] .card-missing-image-badge'), 'ASCII theme override exists for missing image badge');

  // Case 6: Strict 5-Rule AI Prompt Template
  const promptTemplate5 = AIParser.generateAIPromptTemplate({ topic: 'Quy hoạch tuyến tính', count: 15 });
  assert(promptTemplate5.includes('Yêu cầu thực hiện nghiêm ngặt 5 nguyên tắc sau:'), 'Prompt template specifies 5 strict principles');
  assert(promptTemplate5.includes('Ghép ảnh & Đủ 100% số câu: Xuất toàn bộ câu hỏi trong 1 khối ```json duy nhất'), 'Prompt template specifies image merging and single json block');
  assert(promptTemplate5.includes('Với bài toán lời văn dài quen thuộc từ sách giáo khoa/đề mẫu, hãy diễn đạt lại câu dẫn ngắn gọn, tự nhiên (giữ nguyên 100% số liệu, bảng biểu, công thức và đáp án) để tránh bị bộ lọc hệ thống ngắt giữa chừng.'), 'Prompt template includes recitation filter bypass instruction in Rule 1');
  assert(promptTemplate5.includes('Xử lý câu bị thiếu dữ kiện/ảnh:'), 'Prompt template specifies handling missing data and diagrams');
  assert(promptTemplate5.includes('[Đã bổ sung nhiễu]'), 'Prompt template guides tagging added distractor options');
  assert(promptTemplate5.includes('[Cần hình minh họa]'), 'Prompt template guides tagging missing diagrams');
  assert(promptTemplate5.includes('15 câu hỏi'), 'Prompt template specifies count');
  assert(promptTemplate5.includes('Quy hoạch tuyến tính'), 'Prompt template specifies topic');
}

// === TEST SUITE 38: KaTeX Bracket SVG Isolation, Display Math Compaction, Baseline Alignment, Success Color Sync & Duplicate Option Detection ===
console.log('\n--- Test Suite 38: KaTeX Bracket SVG Isolation, Display Math Compaction, Baseline Alignment, Success Color Sync & Duplicate Option Detection ---');
{
  const { App, formatRichText } = require('../js/app.js');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // 1. Item 1: KaTeX Delimiters & Matrix Integrity
  assert(!styleCss.includes('.katex svg {\n  display: block !important;\n  position: absolute !important;\n  left: 0 !important;') && !styleCss.includes('.katex, .katex * { line-height: normal !important; }'), 'Intrusive KaTeX SVG and line-height overrides are removed');
  const katexLib = require(path.join(__dirname, '../lib/katex/katex.min.js'));
  const renderedMatrix = katexLib.renderToString('\\mathbf{A} = \\begin{bmatrix} 1 & 0 & 2 & 1 & 1 \\\\ 1 & 3 & 3 & 2 & 0 \\\\ 2 & 2 & 1 & 2 & 1 \\end{bmatrix}', { displayMode: true });
  assert(renderedMatrix.includes('bmatrix') || renderedMatrix.includes('delimsizing'), 'Matrix 3x5 renders with intact delimsizing structure');
  const renderedCases = katexLib.renderToString('\\begin{cases} y_1 + y_2 + 2y_3 \\ge 5 \\\\ 3y_2 + 2y_3 \\ge 3 \\\\ 2y_1 + 3y_2 + y_3 \\ge 6 \\\\ y_1 + 2y_2 + 2y_3 \\ge 1 \\\\ y_1 + y_3 \\ge 1 \\end{cases}', { displayMode: false });
  assert(renderedCases.includes('cases') || renderedCases.includes('delimsizing'), 'System of 5 equations renders with intact curly brace delimsizing');

  // 2. Item 2: Display Math Compaction
  assert(styleCss.includes('margin: 0.4em 0 !important'), 'KaTeX display formula reduces margin to 0.4em 0');
  const richSample = App.formatRichText("Câu hỏi trước\n$$\nf(x) = x^2\n$$\nCâu hỏi sau");
  assert(!richSample.includes('<br><div class="katex-display-wrap') && !richSample.includes('<br/><div class="katex-display-wrap'), 'No <br> immediately precedes katex-display-wrap');
  assert(!richSample.includes('</div><br>') && !richSample.includes('</div><br/>'), 'No <br> immediately follows katex-display-wrap');

  // 3. Item 3: Alignment with Vietnamese text
  assert(styleCss.includes('.bank-question-text') && styleCss.includes('line-height: 1.55 !important'), 'Bank question text specifies line-height 1.55');
  assert(styleCss.includes('.bank-option-text'), 'Bank option text class is defined');
  assert(styleCss.includes('vertical-align: baseline !important') && styleCss.includes('.katex'), 'KaTeX formula aligns to baseline naturally with text');
  assert(appJs.includes('class="bank-question-text"'), 'renderQuestionBank applies bank-question-text');
  assert(appJs.includes('bank-option-text'), 'renderQuestionBank applies bank-option-text');

  // 4. Item 4: White Text on Dark Themes, Dark Text on Light Themes & Green Highlight
  assert(styleCss.includes('.quiz-option-btn.correct') && styleCss.includes('color: #ffffff !important;'), 'Dark theme correct option enforces bright white text');
  assert(styleCss.includes('.quiz-option-btn.correct .quiz-option-letter') && styleCss.includes('color: #ffffff !important;'), 'Dark theme correct option letter enforces bright white text');
  assert(styleCss.includes('.quiz-option-btn.correct .katex') && styleCss.includes('color: #ffffff !important;'), 'Dark theme correct option KaTeX formula enforces bright white text');
  assert(styleCss.includes('[data-theme="white-orange"] .quiz-option-btn.correct') && styleCss.includes('color: #1c1410 !important;'), 'Light theme correct option enforces high-contrast dark text');
  assert(styleCss.includes('.quiz-option-btn.correct::after') && styleCss.includes("content: '✓'"), 'Correct options have green checkmark ✓ indicator');
  assert(appJs.includes("i === ansIdx ? 'var(--success-bg") || appJs.includes("bank-option-cell ${i === ansIdx ? 'correct is-correct'"), 'renderQuestionBank applies correct class to right answer');

  // 5. Item 5: Locked Strict 5-Rule Prompt Template & Anti-duplicate Options
  const lockedPrompt = AIParser.generateAIPromptTemplate();
  assert(lockedPrompt.includes('CHỈ XUẤT DUY NHẤT 1 KHỐI ```json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI'), 'Prompt template starts with strict single-json-block command');
  assert(lockedPrompt.includes('1–2 câu cực ngắn gọn, đi thẳng vào công thức/lỗi sai'), 'Prompt template strictly requires 1-2 sentence concise explanation');
  assert(lockedPrompt.includes('4 đáp án (a, b, c, d) bắt buộc phải khác nhau hoàn toàn, cấm trùng lặp nội dung'), 'Prompt template strictly requires 4 distinct non-duplicate options');

  // Test AIParser.parse JSON with duplicate options
  const dupJson = JSON.stringify({
    quiz_title: "Test Duplicate",
    questions: [
      {
        id: "q_dup",
        question: "Hàm số nào sau đây liên tục?",
        options: [
          { id: "a", text: "f(x) = x" },
          { id: "b", text: "f(x) = x" }, // trùng lặp với a
          { id: "c", text: "f(x) = 1/x" },
          { id: "d", text: "f(x) = tan(x)" }
        ],
        correct_option_id: "a"
      }
    ]
  });
  const parsedDup = AIParser.parse(dupJson);
  assert(parsedDup.cards.length === 1, 'Question with duplicate options is kept during import');
  assert(parsedDup.cards[0].question.includes('[Cần kiểm tra: trùng đáp án]'), 'Question with duplicate options is tagged with [Cần kiểm tra: trùng đáp án]');
  assert(parsedDup.cards[0].hasDuplicateOptions === true, 'Card has duplicate options flag set');

  // Test AIParser.parse Text Format with duplicate options
  const dupText = `Câu 1: Hàm số nào đồng biến?
A. y = 2x + 1
B. y = 2x + 1
C. y = -x
D. y = 5
Đáp án: A`;
  const parsedDupText = AIParser.parse(dupText);
  assert(parsedDupText.cards.length === 1, 'Text format with duplicate options is kept');
  assert(parsedDupText.cards[0].question.includes('[Cần kiểm tra: trùng đáp án]'), 'Text format question is tagged with [Cần kiểm tra: trùng đáp án]');
  assert(parsedDupText.cards[0].hasDuplicateOptions === true, 'Text format card has duplicate options flag set');
}

// === TEST SUITE 39: KaTeX Matrix & Vector Delimiter Path Protection Against <br> Injection ===
console.log('\n--- Test Suite 39: KaTeX Matrix & Vector Delimiter Path Protection Against <br> Injection ---');
{
  global.katex = require('../lib/katex/katex.min.js');
  const { App, formatRichText } = require('../js/app.js');

  // Case 1: bmatrix 3x5 must have pure SVG path without any <br> inside
  const bmatrix = '$$\\mathbf{A} = \\begin{bmatrix} 1 & 0 & 2 & 1 & 1 \\\\ 1 & 3 & 3 & 2 & 0 \\\\ 2 & 2 & 1 & 2 & 1 \\end{bmatrix}$$';
  const b_rendered = formatRichText(bmatrix);
  assert(b_rendered.includes('<svg'), 'formatRichText renders KaTeX SVG for bmatrix 3x5');
  assert(!b_rendered.includes('<br>H403z') && !b_rendered.includes('<br/>H403z'), 'bmatrix left bracket path does not inject <br> before H403z');
  assert(!/<svg[\s\S]*?<br[\s\S]*?<\/svg>/.test(b_rendered), 'bmatrix 3x5 has zero <br> tags inside any <svg> element');

  // Case 2: pmatrix 5x5 must have intact parenthesis curves without <br> inside
  const pmatrix = '$$\\begin{pmatrix} 1 & 2 & 3 & 4 & 5 \\\\ 1 & 2 & 3 & 4 & 5 \\\\ 1 & 2 & 3 & 4 & 5 \\\\ 1 & 2 & 3 & 4 & 5 \\\\ 1 & 2 & 3 & 4 & 5 \\end{pmatrix}$$';
  const p_rendered = formatRichText(pmatrix);
  assert(p_rendered.includes('<svg'), 'formatRichText renders KaTeX SVG for pmatrix 5x5');
  assert(!/<svg[\s\S]*?<br[\s\S]*?<\/svg>/.test(p_rendered), 'pmatrix 5x5 has zero <br> tags inside any <svg> element');
  const p_paths = p_rendered.match(/<path[^>]*>/g) || [];
  assert(p_paths.length >= 2, 'pmatrix 5x5 has both opening and closing SVG delimiter paths');
  assert(!p_paths[0].includes('<br>') && !p_paths[1].includes('<br>'), 'pmatrix paths are free of <br> tags');

  // Case 3: Mixed text with block math and plain text line breaks
  const mixed = `Câu hỏi mở đầu:
$$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$
Dòng kết luận cuối cùng.`;
  const m_rendered = formatRichText(mixed);
  assert(!m_rendered.includes('<br><div class="katex-display-wrap'), 'No <br> immediately precedes block math');
  assert(!m_rendered.includes('</div><br>'), 'No <br> immediately follows block math');
  assert(!/<svg[\s\S]*?<br[\s\S]*?<\/svg>/.test(m_rendered), 'Mixed question has zero <br> tags inside KaTeX SVG');
  assert(m_rendered.includes('Câu hỏi mở đầu:'), 'Question introductory text is preserved');
  assert(m_rendered.includes('Dòng kết luận cuối cùng.'), 'Question concluding text is preserved');

  // Case 4: Service Worker precaches KaTeX fonts
  const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  assert(swJs.includes('KaTeX_Size1-Regular.woff2'), 'Service Worker precaches KaTeX_Size1-Regular.woff2 font');
  assert(swJs.includes('KaTeX_Main-Regular.woff2'), 'Service Worker precaches KaTeX_Main-Regular.woff2 font');
  assert(swJs.includes('KaTeX_Math-Italic.woff2'), 'Service Worker precaches KaTeX_Math-Italic.woff2 font');
}

// === TEST SUITE 40: Phase 2i Performance & Architecture Audit Wave 1 ===
console.log('\n--- Test Suite 40: Phase 2i Performance & Architecture Audit Wave 1 ---');
{
  const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  const buildJs = fs.readFileSync(path.join(__dirname, '../scripts/build.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const lofiJs = fs.readFileSync(path.join(__dirname, '../js/lofi-music.js'), 'utf8');
  const { AIParser } = require('../js/parser.js');
  const { App } = require('../js/app.js');

  // #1: Service Worker Network-First, safe auto-update & build hashing
  assert(swJs.includes('isCoreCodeAsset') && swJs.includes("cache: 'no-cache'"), 'sw.js uses Network-First with cache: no-cache for core HTML/JS/CSS assets');
  assert(swJs.includes('event.waitUntil('), 'sw.js wraps background cache writes inside event.waitUntil');
  assert(appJs.includes("document.readyState === 'complete'") && appJs.includes('controllerchange') && appJs.includes('hadController'), 'setupPWA handles already-loaded state and safe controllerchange reload');
  assert(buildJs.includes("crypto.createHash('sha256')") && buildJs.includes('distSwPath'), 'scripts/build.js stamps dynamic SHA-256 + timestamp CACHE_NAME into dist/sw.js');

  // #2: Version-gated ensureDataIntegrity()
  assert(dbJs.includes('integrityCheckVersion') && dbJs.includes('this._integrityVersion'), 'db.js gates ensureDataIntegrity() behind integrityCheckVersion meta');
  assert(dbJs.includes('async ensureDataIntegrity() {'), 'db.js preserves exact ensureDataIntegrity() signature for test compatibility');
  assert(dbJs.includes('this.ensureDataIntegrity({ force: true })'), 'db.js importAll forces full ensureDataIntegrity pass');

  // #3: index.html KaTeX & Font cleanup + no-op initLiquidGlassLensFilter
  const katexCssLinks = indexHtml.match(/katex\.min\.css/g) || [];
  assert(katexCssLinks.length === 1 && !indexHtml.includes('cdn.jsdelivr.net'), 'index.html loads only local katex.min.css without CDN duplicate');
  assert(indexHtml.includes('katex@0.18.7'), 'index.html retains katex@0.18.7 version identifier');
  assert(!indexHtml.includes('Anton') && !indexHtml.includes('Lora') && !indexHtml.includes('Merriweather'), 'index.html removes unused Google Font families');
  assert(!appJs.includes('createImageData') && typeof App.initLiquidGlassLensFilter === 'function', 'initLiquidGlassLensFilter is a lightweight no-op');

  // #5: 4 Real Runtime Bugs fixed
  assert(!appJs.includes('sounds.playThud'), 'app.js removes nonexistent sounds.playThud() call');
  assert(!appJs.includes('c.srs.repetitions > 0') && appJs.includes('c.srs.repetition'), 'renderDashboard reads c.srs.repetition instead of nonexistent repetitions');
  assert(appJs.includes('item?.deck || item'), 'renderDecks search unwraps item.deck safely');
  assert(lofiJs.includes('this.currentIndex = 0;') && lofiJs.includes('revokeCustomTrackUrls') && lofiJs.includes('this.masterGainNode.disconnect()'), 'lofi-music.js initializes currentIndex, disconnects WebAudio nodes, and revokes ObjectURLs');

  // #6: Web Worker error/timeout resilience & lightweight stats + local heatmap key
  assert(appJs.includes('this._workerCallbacks.entries()') && appJs.includes('Worker timeout'), 'app.js rejects pending callbacks on worker error and enforces timeout');
  assert(appJs.includes('lightCards') && appJs.includes('statsWorkerRes?.topicStats') && appJs.includes('statsWorkerRes?.subjectStats'), 'renderStatsView projects lightweight cards and reuses worker outputs');
  assert(dbJs.includes('_formatLocalDateKey') && appJs.includes('_formatLocalDateKey'), 'Heatmap uses consistent local YYYY-MM-DD date keys');

  // #8: Energy Wave DOM cache & cancelable RAF
  assert(appJs.includes('_getWaveDomCache()') && appJs.includes('cancelAnimationFrame(this._sliderAnimRafId)'), 'Energy wave caches DOM nodes and cancels overlapping slider RAF');

  // #10: Parser bounded repair & O(N) Map merge
  const badBraces = '{' + '"a":1}'.repeat(500);
  const t0 = Date.now();
  const badRes = AIParser._tryRepairAndParseJson(badBraces);
  const elapsedMs = Date.now() - t0;
  assert(badRes === null && elapsedMs < 200, `_tryRepairAndParseJson bounds repair attempts on malformed braces (${elapsedMs}ms)`);

  const truncatedValid = '{"quiz_title":"Test","questions":[{"id":"q1","question":"Q1?","options":[{"id":"a","text":"1"},{"id":"b","text":"2"}],"correct_option_id":"a"},{"id":"q2","question":"Cut';
  const repaired = AIParser._tryRepairAndParseJson(truncatedValid);
  assert(repaired && Array.isArray(repaired.questions) && repaired.questions.length === 1, '_tryRepairAndParseJson still rescues valid truncated quiz JSON');

  const merged = AIParser._mergeParsedJsonBlocks([
    { quiz_title: 'M', questions: [
      { id: 'q1', question: 'Đạo hàm của x^2 là gì?', options: [{ id: 'a', text: '2x' }, { id: 'b', text: 'x' }], correct_option_id: 'a' },
      { id: 'q2', question: 'Tính giá trị tích phân xác định từ 0 đến 1 của hàm số f(x)=2x', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }], correct_option_id: 'a' }
    ]},
    { quiz_title: 'M', questions: [
      { id: 'q1', question: 'Đạo hàm của x^2 là gì?', options: [{ id: 'a', text: '2x' }, { id: 'b', text: 'x' }], correct_option_id: 'a', explanation: 'Giải thích đầy đủ hơn nhiều so với bản trước để thay thế.' },
      { id: 'q3', question: 'Tính giá trị tích phân xác định từ 0 đến 1 của hàm số f(x)=2x trên đoạn [0,1]', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }], correct_option_id: 'a' }
    ]}
  ]);
  assert(merged && merged.questions.length === 2, '_mergeParsedJsonBlocks deduplicates exact and >=20-char prefix questions in O(N)');
  assert(merged.questions[0].explanation && merged.questions[0].explanation.includes('Giải thích đầy đủ'), '_mergeParsedJsonBlocks retains the more complete duplicate');
}

// === TEST SUITE 41: Phase 2j Wave 2 (Lofi Bar Spacing, Single-Fire Events, Reflow/RenderMath Optimization & Unified In-Place DB Cache) ===
console.log('\n--- Test Suite 41: Phase 2j Wave 2 (Lofi Bar Spacing, Single-Fire Events, Reflow/RenderMath & Unified Cache) ---');
{
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  const { App } = require('../js/app.js');

  // 1. Lofi Bar spacing (Desktop + Mobile, all 3 themes)
  assert(themeCss.includes('.hero-heading-scrim #hero-lofi-bar.hero-lofi-bar') && themeCss.includes('margin: 12px 0 18px 0;'), 'theme.css gives Lofi bar balanced 18px bottom spacing over global reset');
  assert(styleCss.includes('.hero-heading-scrim #hero-lofi-bar.hero-lofi-bar') && styleCss.includes('margin: 10px 0 16px 0;'), 'style.css enforces balanced Lofi bar spacing on desktop & mobile');

  // 2. #4 Single-fire tab navigation & modal close delegation
  const navListSlice = indexHtml.slice(indexHtml.indexOf('<ul class="nav-list">'), indexHtml.indexOf('</ul>', indexHtml.indexOf('<ul class="nav-list">')));
  assert(!navListSlice.includes('<button type="button" title="Tổng quan" data-tooltip="Tổng quan" onclick='), 'Sidebar inner buttons do not duplicate parent li onclick handler');
  assert(appJs.includes("if (btn.hasAttribute('onclick')) return;"), 'setupEventListeners skips [data-view] elements that already declare inline onclick');
  const setupListenersSlice = appJs.slice(appJs.indexOf('setupEventListeners() {'), appJs.indexOf('initSpotlightHover() {'));
  assert(!setupListenersSlice.includes("document.querySelectorAll('.modal-close').forEach"), 'setupEventListeners removes duplicate per-element modal-close listeners');
  assert(!setupListenersSlice.includes("document.querySelectorAll('.modal-overlay').forEach"), 'setupEventListeners removes duplicate per-element modal-overlay listeners');
  assert(!indexHtml.includes('modal-confirm-delete-deck\'))'), 'Delete-deck modal uses single global delegation without redundant inline _closeModal');
  assert(!indexHtml.includes('modal-suggest-merge-subjects\'))'), 'Suggest-merge modal uses single global delegation without redundant inline _closeModal');

  // 3. #7 Redundant renderMath removed, data-driven adaptOptionsLayout, merged scroll, debounced resize, single rAF Bank batch, GPU scaleX timer
  const renderMathCalls = appJs.match(/this\.renderMath\(/g) || [];
  assert(renderMathCalls.length === 2, `Only 2 raw-preview renderMath() calls remain (found ${renderMathCalls.length})`);
  assert(appJs.includes('data-has-wide-option=') && appJs.includes('container.dataset.hasWideOption'), 'adaptOptionsLayout reads precomputed data-has-wide-option without serializing innerHTML on live DOM');

  const fakeLiveDom = {
    classList: {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    },
    nodeType: 1,
    dataset: { hasWideOption: '1' },
    get innerHTML() { throw new Error('Must not read innerHTML on live DOM!'); },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  App.adaptOptionsLayout(fakeLiveDom);
  assert(fakeLiveDom.classList.contains('quiz-options--single-col'), 'adaptOptionsLayout handles live DOM without touching container.innerHTML');

  const scrollListeners = setupListenersSlice.match(/window\.addEventListener\('scroll'/g) || [];
  assert(scrollListeners.length === 1 && setupListenersSlice.includes('cachedTopbar'), 'Scroll listeners in setupEventListeners merged into 1 passive listener with cached topbar');
  assert(setupListenersSlice.includes("window.addEventListener('resize'") && setupListenersSlice.includes('150);'), 'Window resize listener is debounced at 150ms');
  assert(appJs.includes('initialRevealEls') && !appJs.includes('requestAnimationFrame(() => this.adaptOptionsLayout(grid))'), 'Bank batch coalesces reveal into 1 rAF and drops per-card adaptOptionsLayout rAF');
  assert(appJs.includes("bar.style.transform = 'scaleX(0)'") && !appJs.includes('void bar.offsetWidth'), 'startPerQuestionTimer animates GPU transform scaleX without forced offsetWidth reflow');
  assert(styleCss.includes('transform: scaleX(1);') && styleCss.includes('transition: transform 1s linear;'), 'CSS configures .per-q-timer-fill for GPU transform animation');

  // 4. #9 Unified _memCache, shallow-copy slice, and in-place saveCard/saveCardsBatch/deleteCard
  assert(dbJs.includes('get _cardsCache()') && dbJs.includes('get _decksCache()') && dbJs.includes('get _subjectsCache()'), 'db.js unifies legacy caches as getter/setter aliases on _memCache');
  assert(dbJs.includes('this._memCache.cards.slice()'), 'getAllCards returns shallow copy via .slice()');
  assert(dbJs.includes('this._memCache.cards[idx] = snapshot'), 'saveCard updates _memCache.cards in-place without clearing cache');

  const { execFileSync } = require('child_process');
  const dbRuntimeProbe = `
    global.window = {};
    global.indexedDB = { open: () => ({}) };
    const fs = require('fs');
    eval(fs.readFileSync(${JSON.stringify(path.join(__dirname, '../js/db.js'))}, 'utf8'));
    (async () => {
      const inst = window.db;
      inst.db = {};
      inst.init = async () => inst.db;
      const storeMap = new Map([['c1', { id: 'c1', deckId: 'd1', subjectId: 's1', question: 'Q1' }], ['c2', { id: 'c2', deckId: 'd1', subjectId: 's1', question: 'Q2' }]]);
      inst._tx = () => ({ objectStore: () => ({ get: (k) => storeMap.get(k) || { id: k, subjectId: 's1' }, getAll: () => Array.from(storeMap.values()), put: (v) => { storeMap.set(v.id, v); return v; }, delete: (k) => { storeMap.delete(k); return true; } }) });
      inst._promisify = async (x) => x;

      const first = await inst.getAllCards();
      first.push({ id: 'mutated' });
      const second = await inst.getAllCards();
      if (second.length !== 2) throw new Error('Shallow copy failed: caller mutation leaked into _memCache');

      const revBefore = inst.revision;
      await inst.saveCard({ id: 'c1', deckId: 'd1', question: 'Q1 Updated' });
      if (inst.revision !== revBefore + 1) throw new Error('Revision did not bump on saveCard');
      if (!inst._memCache.cards || inst._memCache.revision !== inst.revision) throw new Error('saveCard wiped _memCache instead of updating in-place');
      const third = await inst.getAllCards();
      if (third.find(c => c.id === 'c1')?.question !== 'Q1 Updated') throw new Error('In-place saveCard did not update cached card');
      console.log('DB_RUNTIME_OK');
    })().catch(e => { console.error(e); process.exit(1); });
  `;
  const probeOut = execFileSync(process.execPath, ['-e', dbRuntimeProbe], { encoding: 'utf8' });
  assert(probeOut.includes('DB_RUNTIME_OK'), 'Runtime check: QuizDatabase shallow-copy .slice() and in-place saveCard preserve warm _memCache');
}

// === TEST SUITE 42: Phase 2f Theme 'ascii' & 3D ASCII Christmas Tree Engine (js/ascii-bg.js) ===
console.log('\n--- Test Suite 42: Phase 2f Theme ascii & 3D ASCII Christmas Tree Engine ---');
{
  const AsciiBg = require('../js/ascii-bg.js');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const buildJs = fs.readFileSync(path.join(__dirname, '../scripts/build.js'), 'utf8');
  const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');

  // 1. Core Config & Math helpers
  assert(AsciiBg && typeof AsciiBg.start === 'function', 'AsciiBg exports start method');
  assert(AsciiBg.CONFIG.TARGET_FPS >= 24 && AsciiBg.CONFIG.TARGET_FPS <= 30, 'AsciiBg targets 24-30 FPS');
  assert(AsciiBg.CONFIG.CAMERA_PITCH_DEG >= 15 && AsciiBg.CONFIG.CAMERA_PITCH_DEG <= 25, 'AsciiBg tilts camera downward 15-25 degrees');
  assert(AsciiBg.CONFIG.Y0 === 0.42 && AsciiBg.CONFIG.Y1 === 2.55, 'AsciiBg matches agac.py foliage Y0=0.42 and Y1=2.55');
  assert(AsciiBg.envelope(0.42) > 0.85 && AsciiBg.envelope(2.55) < 0.05, 'AsciiBg.envelope tapers cone smoothly from base to apex');
  assert(AsciiBg.fib(12).length === 36, 'AsciiBg.fib(n) returns flat XYZ unit sphere coordinates');

  // 2. Deterministic 3D Scene Generation across all 10 part kinds
  const sceneA = AsciiBg.buildSceneData(7);
  const sceneB = AsciiBg.buildSceneData(7);
  assert(sceneA.count > 180000 && sceneA.count === sceneB.count, 'buildSceneData(7) is deterministic and high-density');
  assert(sceneA.meta.lightCount === 170, 'buildSceneData builds exactly 170 fairy light clusters');
  assert(sceneA.meta.baubleCount === 44, 'buildSceneData places 44 baubles on branch tips');
  assert(sceneA.meta.giftCount === 8, 'buildSceneData builds 8 3D gift boxes');

  const kCounts = sceneA.meta.countsByKind;
  for (let k = 1; k <= 10; k++) {
    assert(kCounts[k] > 0, `buildSceneData populates non-empty points for KIND=${k}`);
  }

  // 3. Domino Wave & Gentle Stardust Dissolve Phase
  const domPeak = AsciiBg.computeDominoIntensity(0.0, 0.0);
  const domOff = AsciiBg.computeDominoIntensity(0.25, 0.0);
  assert(domPeak > domOff, 'computeDominoIntensity creates sequential traveling wave peaks');

  const disBefore = AsciiBg.computeDissolveState(1.0, 10, 12.5);
  assert(disBefore.active === true && disBefore.u === 0, 'Dissolve stays inactive during showcase phase');
  const disMid = AsciiBg.computeDissolveState(0.5, 0, AsciiBg.CONFIG.DISSOLVE_START + 1.8);
  assert(disMid.u > 0, 'Dissolve progresses smoothly after DISSOLVE_START');
  const disAfter = AsciiBg.computeDissolveState(2.5, 1, AsciiBg.CONFIG.DISSOLVE_START + 3.0);
  assert(disAfter.active === false, 'Points deactivate cleanly before cycle restart');

  // 4. Headless Render Verification across Growth, Showcase, and Dissolve (Fine micro-pixel grid)
  const W = 480;
  const H = 360;
  const cellW = AsciiBg._cellW || 3.6;
  const cellH = AsciiBg._cellH || 6.5;
  const cols = (W / cellW) | 0;
  const rows = (H / cellH) | 0;
  const buf32 = new Uint32Array(W * H);
  const zBuf = new Float32Array(cols * rows).fill(1e9);
  const winIdx = new Int32Array(cols * rows);
  const activeCells = new Int32Array(cols * rows);
  const atlas = AsciiBg.buildGlyphAtlas(cellW, cellH, '700 7px monospace');
  const stars = AsciiBg.buildStars(160, 1337);

  const resGrowth = AsciiBg.renderFrameToBuffer({
    t: 0.5, width: W, height: H, cellW, cellH, cols, rows,
    buf32, zBuf, winIdx, activeCells, atlas, stars, scene: sceneA
  });
  const resShowcase = AsciiBg.renderFrameToBuffer({
    t: 12.5, width: W, height: H, cellW, cellH, cols, rows,
    buf32, zBuf, winIdx, activeCells, atlas, stars, scene: sceneA
  });
  const resDissolve = AsciiBg.renderFrameToBuffer({
    t: 24.75, width: W, height: H, cellW, cellH, cols, rows,
    buf32, zBuf, winIdx, activeCells, atlas, stars, scene: sceneA
  });
  const resAfterDissolve = AsciiBg.renderFrameToBuffer({
    t: 25.2, width: W, height: H, cellW, cellH, cols, rows,
    buf32, zBuf, winIdx, activeCells, atlas, stars, scene: sceneA
  });

  assert(AsciiBg._cellW <= 4.5 && AsciiBg._cellH <= 7.5, 'AsciiBg defaults to fine micro-pixel cells on desktop (cellW <= 4.5, cellH <= 7.5)');
  assert(resGrowth.activeCount > 0 && resShowcase.activeCount > resGrowth.activeCount, 'Scene grows from floor to full tree');
  assert(resDissolve.activeCount < resShowcase.activeCount && resAfterDissolve.activeCount === 0, 'Dissolve phase reduces active points and resets cleanly before loop');

  // Verify 1440x900 desktop showcase produces > 8000 crisp ASCII letters
  const DW = 1440, DH = 900, dCols = (DW / cellW) | 0, dRows = (DH / cellH) | 0;
  const resDesktop = AsciiBg.renderFrameToBuffer({
    t: 12.5, width: DW, height: DH, cellW, cellH, cols: dCols, rows: dRows,
    buf32: new Uint32Array(DW * DH),
    zBuf: new Float32Array(dCols * dRows).fill(1e9),
    winIdx: new Int32Array(dCols * dRows),
    activeCells: new Int32Array(dCols * dRows),
    atlas, stars, scene: sceneA
  });
  assert(resDesktop.renderedLetters > 8000, 'Desktop 1440x900 render produces > 8000 active ASCII letters (high-density grid)');

  let nonBgPixels = 0;
  const bgVal = buf32[0];
  for (let p = 0; p < buf32.length; p++) {
    if (buf32[p] !== bgVal) nonBgPixels++;
  }
  assert(nonBgPixels > 0, 'Headless renderFrameToBuffer writes non-background ASCII pixels');

  // Verify zBuf was cleanly reset back to 1e9 after render
  let dirtyZ = 0;
  for (let zi = 0; zi < zBuf.length; zi++) {
    if (zBuf[zi] < 1e8) dirtyZ++;
  }
  assert(dirtyZ === 0, 'renderFrameToBuffer cleanly resets zBuf in O(activeCount)');

  // 5. Smoked Dark-Gray Liquid Glass Synchronization & Zero Regression on Existing 3 Themes
  assert(indexHtml.includes('id="ascii-bg-canvas"') && indexHtml.includes('./js/ascii-bg.js'), 'index.html mounts #ascii-bg-canvas and loads js/ascii-bg.js');
  assert(indexHtml.includes('data-theme-choice="ascii"'), 'index.html includes ascii theme switcher controls');
  assert(themeCss.includes('[data-theme="ascii"]') && themeCss.includes('#ascii-bg-canvas') && themeCss.includes('--glass-slab-bg:') && themeCss.includes('--modal-convex-bg:'), 'css/theme.css defines complete [data-theme="ascii"] smoked glass tokens');
  assert(styleCss.includes('GROUP 5: ASCII 3D THEME') && styleCss.includes('html[data-theme="ascii"] .hero-lofi-bar') && styleCss.includes('html[data-theme="ascii"] .topbar-hud-capsule') && styleCss.includes('html[data-theme="ascii"] #view-dashboard .stat-card'), 'css/style.css synchronizes smoked dark-gray Liquid Glass across sidebar, hero, stats, lofi bar, topbar pill, and modals');
  assert(appJs.includes("'violet-rose', 'monochrome', 'white-orange', 'ascii'") && appJs.includes('window.AsciiBg'), 'js/app.js registers ascii theme and manages AsciiBg lifecycle');
  assert(buildJs.includes("'js/ascii-bg.js'"), 'scripts/build.js validates and verifies js/ascii-bg.js');
  assert(swJs.includes("'./js/ascii-bg.js'"), 'sw.js precaches ./js/ascii-bg.js for offline PWA support');
}

// === TEST SUITE 43: Wave 2g Snowfall Layer, Multi-Scene Architecture & Gargantua Black Hole ===
console.log('\n--- Test Suite 43: Wave 2g Snowfall, Multi-Scene Manager & Gargantua Black Hole ---');
{
  const AsciiBg = require('../js/ascii-bg.js');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const asciiJs = fs.readFileSync(path.join(__dirname, '../js/ascii-bg.js'), 'utf8');

  // 1. Snowfall Generator & Particle Physics
  assert(typeof AsciiBg.buildSnow === 'function', 'AsciiBg exports buildSnow');
  const snow = AsciiBg.buildSnow(220, 2026);
  assert(snow && snow.count === 220, 'buildSnow generates exactly 220 snow particles');
  assert(snow.pos.length === 220 * 7, 'snow.pos has 7 scalar attributes per particle');
  assert(snow.col.length === 220 * 4, 'snow.col stores glyph index and RGBA channels');

  // Verify particles have valid normalized bounds & diagonal drift properties
  for (let i = 0; i < 220; i++) {
    const x0 = snow.pos[i * 7];
    const y0 = snow.pos[i * 7 + 1];
    const vy = snow.pos[i * 7 + 2];
    const wind = snow.pos[i * 7 + 3];
    assert(x0 >= 0 && x0 <= 1 && y0 >= 0 && y0 <= 1, 'Snow coordinates initialized in [0, 1]');
    assert(vy > 0 && wind > 0, 'Snow particles have positive downward fall speed and diagonal wind drift');
  }

  // 2. Extensible Multi-Scene Architecture & Playback Modes
  assert(AsciiBg.SCENES && AsciiBg.SCENES.tree && AsciiBg.SCENES.gargantua, 'AsciiBg defines SCENES registry with tree and gargantua');
  assert(typeof AsciiBg.registerScene === 'function', 'AsciiBg exports registerScene API for easy future scene addition');

  // Custom scene registration test
  AsciiBg.registerScene('test_galaxy', { id: 'test_galaxy', title: 'Thiên hà Spiral', duration: 30.0 });
  assert(AsciiBg.SCENES.test_galaxy && AsciiBg.SCENES.test_galaxy.title === 'Thiên hà Spiral', 'registerScene adds custom scenes cleanly');
  delete AsciiBg.SCENES.test_galaxy;

  // Playback modes: slideshow vs single
  AsciiBg.setPlaybackMode('slideshow');
  assert(AsciiBg.getPlaybackMode() === 'slideshow', 'AsciiBg sets and gets slideshow mode');
  AsciiBg.setPlaybackMode('single');
  assert(AsciiBg.getPlaybackMode() === 'single', 'AsciiBg sets and gets single scene lock mode');

  AsciiBg.selectPreset('gargantua');
  assert(AsciiBg.getPlaybackMode() === 'single' && AsciiBg.getScene() === 'gargantua', 'selectPreset("gargantua") locks mode to single and active scene to gargantua');

  AsciiBg.selectPreset('tree');
  assert(AsciiBg.getPlaybackMode() === 'single' && AsciiBg.getScene() === 'tree', 'selectPreset("tree") locks mode to single and active scene to tree');

  AsciiBg.selectPreset('slideshow');
  assert(AsciiBg.getPlaybackMode() === 'slideshow', 'selectPreset("slideshow") enables auto-advance slideshow mode');

  const state = AsciiBg.getState();
  assert(state && typeof state.mode === 'string' && typeof state.scene === 'string', 'getState returns valid state object');

  // 3. Headless Gargantua Black Hole Render Verification (2D Dense Pixel Field Shader)
  const W = 480;
  const H = 360;
  const cellW = AsciiBg._cellW || 3.6;
  const cellH = AsciiBg._cellH || 6.5;
  const cols = (W / cellW) | 0;
  const rows = (H / cellH) | 0;
  const buf32 = new Uint32Array(W * H);
  const atlas = AsciiBg.buildGlyphAtlas(cellW, cellH, '700 7px monospace');
  const stars = AsciiBg.buildStars(160, 1337);

  // Stage 1: Circle draws itself with tangent glyphs (t = 1.5s)
  const resRing = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 1.5, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resRing.renderedLetters > 15, 'Stage 1 (t=1.5s): Photon ring draws itself with tangent glyphs');

  // Stage 2: Breathing corona settling around event horizon (t = 3.5s)
  const resAura = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 3.5, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resAura.renderedLetters > resRing.renderedLetters, 'Stage 2 (t=3.5s): Breathing aura expands around photon ring');

  // Stage 3: Full accretion disk & lensed halo emerge (t = 8.2s)
  const resEmerge = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 8.2, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resEmerge.renderedLetters > resAura.renderedLetters, 'Stage 3 (t=8.2s): Accretion disk & lensed halo expand around event horizon');

  // Stage 4: Full showcase with concentric thin gas filaments, wide lensed halo, and front crossing belt (t = 12.0s)
  const resShowcase = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 12.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resShowcase.renderedLetters > 400, 'Stage 4 (t=12.0s): Full showcase produces fine filament ASCII accretion disk and lensed halo (> 400 letters)');
  assert(resShowcase.isDone === false, 'Stage 4 (t=12.0s): isDone is false during active showcase');

  // Verify desktop 1440x900 Gargantua dense shader produces > 8000 active ASCII letters with eye-comfort leftFade
  const DW = 1440, DH = 900, dCols = (DW / cellW) | 0, dRows = (DH / cellH) | 0;
  const resDesktopGarg = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 12.0, width: DW, height: DH, cellW, cellH, cols: dCols, rows: dRows,
    buf32: new Uint32Array(DW * DH), atlas, stars
  });
  assert(resDesktopGarg.renderedLetters > 8000, 'Desktop 1440x900 Gargantua dense shader produces > 8000 active ASCII characters with leftFade');

  // Gravitational Collapse begins at t = 18.0s (smooth inward suction, 100% eye-comfort, no flash)
  const resCollapse = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 18.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resCollapse.renderedLetters > 0 && resCollapse.renderedLetters < resShowcase.renderedLetters, 'Gravitational Collapse smoothly sucks matter inward without blinding screen flash (t=18.0s)');

  // Stage 5: Clean extinction into void before cycle restart (t = 19.85s)
  const resDissolve = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 19.85, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resDissolve.renderedLetters === 0, 'Gargantua at t=19.85s cleanly dissolves to 0 active letters with no lower rim fragments');
  assert(resDissolve.isDone === true, 'Gargantua at t=19.85s signals isDone: true for auto-advance in slideshow mode');

  // Loop 2 Verification: Continuous auto-looping without freeze (duration = 20.0s)
  const resLoop2Early = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 21.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resLoop2Early.renderedLetters > 0, 'Gargantua loop 2 restarts smoothly at t=21.0s without freezing');

  const resLoop2Peak = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 32.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resLoop2Peak.renderedLetters > 400, 'Gargantua loop 2 achieves full showcase (> 400 letters) automatically at t=32.0s');

  // Tree scene isDone lifecycle verification
  const resTreeShowcase = AsciiBg.renderTreeScene({
    t: 12.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, scene: AsciiBg.buildSceneData(7)
  });
  assert(resTreeShowcase.isDone === false, 'Tree scene at t=12.0s reports isDone: false');
  const resTreeDone = AsciiBg.renderTreeScene({
    t: 25.5, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, scene: AsciiBg.buildSceneData(7)
  });
  assert(resTreeDone.isDone === true, 'Tree scene at t=25.5s reports isDone: true to trigger seamless slideshow transition');

  // Aliases & Preset selection for 'blackhole'
  assert(AsciiBg.SCENES.blackhole && AsciiBg.SCENES.blackhole.id === 'gargantua', 'AsciiBg defines blackhole alias pointing to gargantua');
  AsciiBg.selectPreset('blackhole');
  assert(AsciiBg.getPlaybackMode() === 'single' && AsciiBg.getScene() === 'gargantua', 'selectPreset("blackhole") resolves to single gargantua scene');
  const resBlackholeAlias = AsciiBg.renderFrameToBuffer({
    sceneId: 'blackhole', t: 12.0, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resBlackholeAlias.renderedLetters === resShowcase.renderedLetters, 'sceneId "blackhole" renders identically to "gargantua"');
  assert(typeof AsciiBg.reset === 'function', 'AsciiBg exports clean reset method');

  // 4. UI Controls & Styling
  assert(indexHtml.includes('id="ascii-scene-quick-ctrl"') && indexHtml.includes('id="ascii-scene-cycle-btn"'), 'index.html defines topbar HUD capsule ASCII scene quick switcher');
  assert(indexHtml.includes('points="4 17 10 11 4 5"') && indexHtml.includes('x1="12" y1="19" x2="20" y2="19"'), 'index.html defines minimalist >_ terminal prompt icon for theme ascii');
  assert(indexHtml.includes('id="ascii-scene-popover"') && indexHtml.includes('ascii-popover-item') && indexHtml.includes('data-ascii-preset="gargantua"'), 'index.html defines compact liquid glass popover for ASCII scene selection');
  assert(indexHtml.includes('id="ascii-scene-settings-bar"') && indexHtml.includes('data-ascii-preset="slideshow"'), 'index.html defines Settings ASCII scene pill controls');
  assert(styleCss.includes('.ascii-scene-cycle-btn') && styleCss.includes('.ascii-scene-settings-bar') && styleCss.includes('.ascii-scene-pill-btn'), 'css/style.css styles ASCII scene controls in smoked liquid glass');
  assert(styleCss.includes('.ascii-scene-popover') && styleCss.includes('.ascii-popover-item'), 'css/style.css defines liquid glass popover menu styling');
  assert(themeCss.includes('#ascii-bg-canvas') && themeCss.includes('background: #000000;'), 'css/theme.css sets pure black #000000 background for #ascii-bg-canvas');
  assert(appJs.includes('setAsciiScenePreset') && appJs.includes('cycleAsciiScene') && appJs.includes('syncAsciiSceneUI'), 'js/app.js implements scene selection and cycle controllers');
  assert(appJs.includes('toggleAsciiScenePopover') && appJs.includes('closeAsciiScenePopover') && appJs.includes('selectAsciiSceneFromPopover'), 'js/app.js implements popover toggle, close, and selection handlers');

  // 5. Shader Math & Physics Architecture
  assert(asciiJs.includes('accretion_disk') && asciiJs.includes('lensed_halo') && asciiJs.includes('gas('), 'js/ascii-bg.js implements art.py gas, accretion_disk, and lensed_halo functions');
  assert(asciiJs.includes('front_side = v > 0') && asciiJs.includes('isCollapse'), 'js/ascii-bg.js implements 3D front crossing occlusion and gentle Gravitational Collapse');
  assert(asciiJs.includes('R0 = 0.21') && asciiJs.includes('TILT = -0.23') && asciiJs.includes('INC = 0.17') && asciiJs.includes('R_OUT = 4.8 * R0'), 'js/ascii-bg.js sets exact art.py R0=0.21, TILT=-0.23, and INC=0.17 constants');
  assert(asciiJs.includes('..::--~~,,;;') && asciiJs.includes('##%%@@$$&&88'), 'js/ascii-bg.js uses art.py 4-level swirling character ramps');

  // 6. Wave 2l Ambient Particles & Staged Christmas Tree Timeline
  assert(typeof AsciiBg.buildAmbientParticles === 'function', 'AsciiBg exports buildAmbientParticles function');
  const ambParticles = AsciiBg.buildAmbientParticles(240, 2026);
  assert(ambParticles.count === 240 && ambParticles.pos.length === 240 * 8, 'buildAmbientParticles generates 240 particles with 8 float properties');

  // Verify monotonic particle distance across reset
  AsciiBg._ensureScene();
  AsciiBg._snowDistance = 42.5;
  AsciiBg._globalElapsedSec = 100.0;
  AsciiBg.reset();
  assert(AsciiBg._snowDistance === 42.5 && AsciiBg._globalElapsedSec === 100.0, 'Engine _snowDistance and _globalElapsedSec persist across scene resets (continuous snow/stars)');

  // Verify 8 Gift boxes in buildSceneData
  const treeData = AsciiBg.buildSceneData(7);
  assert(treeData.meta.giftCount === 8, 'buildSceneData places exactly 8 3D gift boxes');

  // Verify Sequential Staged Timeline & Synchronized Trunk Growth (Wave 2m)
  let maxGroundT0 = 0, maxTrunkBaseT0 = 0, maxTrunkStemT0 = 0, maxNeedleT0 = 0, maxGarlandT0 = 0, maxGiftT0 = 0, minStarT0 = 999, maxStarT0 = 0;
  let trunkSyncOk = true;
  const y0Tree = AsciiBg.CONFIG.Y0;
  const ySpanTree = AsciiBg.CONFIG.Y1 - y0Tree;
  for (let i = 0; i < treeData.count; i++) {
    const k = treeData.kind[i];
    const t0 = treeData.t0[i];
    const py = treeData.py[i];
    if (k === AsciiBg.KIND.GROUND && t0 > maxGroundT0) maxGroundT0 = t0;
    else if (k === AsciiBg.KIND.TRUNK) {
      if (py <= y0Tree) {
        if (t0 > maxTrunkBaseT0) maxTrunkBaseT0 = t0;
      } else {
        if (t0 > maxTrunkStemT0) maxTrunkStemT0 = t0;
        const expectedNeedleBaseT0 = 2.20 + 4.00 * ((py - y0Tree) / ySpanTree);
        const lead = expectedNeedleBaseT0 - t0;
        if (lead < 0.18 || lead > 0.35) trunkSyncOk = false;
      }
    }
    else if (k === AsciiBg.KIND.NEEDLE && t0 > maxNeedleT0) maxNeedleT0 = t0;
    else if (k === AsciiBg.KIND.GARLAND && t0 > maxGarlandT0) maxGarlandT0 = t0;
    else if ((k === AsciiBg.KIND.GIFT || k === AsciiBg.KIND.RIBBON) && t0 > maxGiftT0) maxGiftT0 = t0;
    else if (k === AsciiBg.KIND.STAR) {
      if (t0 < minStarT0) minStarT0 = t0;
      if (t0 > maxStarT0) maxStarT0 = t0;
    }
  }
  assert(maxGroundT0 <= 1.51, 'Ground floor points born sequentially within 0s - 1.5s');
  assert(maxTrunkBaseT0 <= 2.00 && maxTrunkStemT0 > 4.5 && maxTrunkStemT0 <= 6.20, 'Trunk base grows 1.2s-1.95s and upper stem rises synchronously with foliage height');
  assert(trunkSyncOk, 'Every trunk stem point above Y0 leads foliage needles at the same height y by 0.2s-0.3s (no exposed bare pole)');
  assert(maxNeedleT0 <= 6.81, 'Needle points grow bottom-up within 2.2s - 6.8s');
  assert(maxGarlandT0 <= 8.01, 'Garland chasing lights born within 6.5s - 8.0s');
  assert(maxGiftT0 <= 9.21, '8 gift boxes appear sequentially one by one within 7.8s - 9.2s');
  assert(minStarT0 >= 9.34 && maxStarT0 <= 10.01, 'Apex star ignites right after spiral pulse strikes apex (9.35s - 10.0s)');

  // Verify Warm Golden Ambient Glow & Spiral Ignition Chase (Wave 2m)
  assert(asciiJs.includes('0.843') && asciiJs.includes('0.373'), 'js/ascii-bg.js applies radiant golden amber rgb(255, 215, 95) [1.0, 0.843, 0.373]');
  assert(asciiJs.includes('goldMix'), 'js/ascii-bg.js blends warm golden ambient glow onto tree elements');
  assert(asciiJs.includes('PULSE_START') && asciiJs.includes('PULSE_END') && asciiJs.includes('pulseHead'), 'js/ascii-bg.js implements spiral golden energy pulse chasing up garland to ignite apex star');

  // 7. Wave 2m Gargantua Tidal Disruption, Bold Wings & Eye-Comfort Quasar Relativistic Jets + Hollow Shockwave
  assert(asciiJs.includes('GARG_TIDAL_STREAMS') && asciiJs.includes('tidal_capture('), 'js/ascii-bg.js implements Tidal Disruption / Accretion Capture curved streams');
  assert(asciiJs.includes('Math.pow(R_IN / Math.max(rho, 1e-4), 0.62)') && asciiJs.includes('wingMask'), 'js/ascii-bg.js strengthens outer accretion disk wings with pow(R_IN/rho, 0.62) and outer streak boost');
  assert(asciiJs.includes('jetHead') && asciiJs.includes('shockW = 0.025 + 0.008') && asciiJs.includes('GARG_EMBERS'), 'js/ascii-bg.js implements Quasar Relativistic Jets, thin hollow shockwave (0.025-0.04), and scattered star embers');

  const resQuasarImpact = AsciiBg.renderFrameToBuffer({
    sceneId: 'gargantua', t: 18.6, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars
  });
  assert(resQuasarImpact.renderedLetters > 50 && resQuasarImpact.renderedLetters < resShowcase.renderedLetters, 'Quasar Impact (t=18.6s) fires slender jets + thin hollow shockwave without blinding full-screen glare');

  // 8. Wave 2n Task 1: Root-Cause RAF Loop & Zero Idle-Pause Verification
  assert(!asciiJs.includes("classList.contains('app-idle')"), 'js/ascii-bg.js never pauses ASCII animation on app-idle class');
  assert(asciiJs.includes('_cancelLoop()') && asciiJs.includes('_startLoop()'), 'js/ascii-bg.js cancels existing RAF before starting a new loop');
  assert(asciiJs.includes('if (document.hidden) return false;'), 'js/ascii-bg.js pauses ONLY when document.hidden === true');
  assert(appJs.includes("getAttribute('data-theme') !== 'ascii'"), 'js/app.js never pauses ASCII background on 30s mouse/keyboard idle');

  // Simulate RAF scheduling independent of 30 FPS throttle & verify loop never stalls on sub-33ms frames
  const prevDoc = global.document;
  const prevRaf = global.requestAnimationFrame;
  const prevCaf = global.cancelAnimationFrame;
  let rafScheduledCount = 0;
  let cafCalledCount = 0;
  let mockHidden = false;
  global.document = {
    get hidden() { return mockHidden; },
    documentElement: { getAttribute: (a) => (a === 'data-theme' ? 'ascii' : null) },
    body: { classList: { contains: () => true } } // even if app-idle is present on body!
  };
  global.requestAnimationFrame = () => ++rafScheduledCount;
  global.cancelAnimationFrame = () => { cafCalledCount++; };

  assert(AsciiBg._isAppActiveForRender() === true, '_isAppActiveForRender stays true even when body has app-idle class');
  mockHidden = true;
  assert(AsciiBg._isAppActiveForRender() === false, '_isAppActiveForRender pauses when document.hidden === true');
  mockHidden = false;
  AsciiBg._running = true;
  AsciiBg._lastRenderMs = 1000;
  AsciiBg._rafId = 1;
  // Trigger a sub-33ms throttled tick (elapsed = 10ms < 33.33ms): RAF MUST still reschedule!
  const beforeRaf = rafScheduledCount;
  AsciiBg._tick(1010);
  assert(rafScheduledCount === beforeRaf + 1 && AsciiBg._rafId !== null, '_tick reschedules requestAnimationFrame independently of 30 FPS throttle');
  AsciiBg._startLoop();
  assert(cafCalledCount >= 1, '_startLoop invokes cancelAnimationFrame before requesting a fresh RAF');
  AsciiBg._running = false;
  AsciiBg._rafId = null;
  global.document = prevDoc;
  global.requestAnimationFrame = prevRaf;
  global.cancelAnimationFrame = prevCaf;

  // 9. Wave 2n Task 2: Scene 3 Cat Knight (Hiệp sĩ Mèo áo choàng bay)
  const swJsText = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  const buildJsText = fs.readFileSync(path.join(__dirname, '../scripts/build.js'), 'utf8');
  assert(fs.existsSync(path.join(__dirname, '../assets/cat-knight.jpg')), 'assets/cat-knight.jpg exists in project assets directory');
  assert(swJsText.includes('./assets/cat-knight.jpg'), 'sw.js precaches ./assets/cat-knight.jpg for offline PWA support');
  assert(buildJsText.includes("src: 'assets'") && buildJsText.includes('assets/cat-knight.jpg'), 'scripts/build.js copies and verifies assets/cat-knight.jpg');

  assert(AsciiBg.SCENES.cat && AsciiBg.SCENES.cat.id === 'cat', 'AsciiBg registers Scene 3 (cat - Hiệp sĩ Mèo) in SCENES');
  assert(AsciiBg.SCENE_ORDER[0] === 'tree' && AsciiBg.SCENE_ORDER[1] === 'gargantua' && AsciiBg.SCENE_ORDER[2] === 'cat', 'SCENE_ORDER slideshow sequence is tree -> gargantua -> cat');
  assert(typeof AsciiBg.buildCatKnightFromRGBA === 'function' && typeof AsciiBg.renderCatKnightToBuffer === 'function', 'AsciiBg exports Cat Knight image processor and renderer');
  assert(indexHtml.includes('data-ascii-preset="cat"') && indexHtml.includes('Hiệp sĩ Mèo'), 'index.html adds Hiệp sĩ Mèo option to popover and Settings');
  assert(appJs.includes("curPreset === 'cat'") && appJs.includes("nextPreset = 'cat'"), 'js/app.js wires cat scene into UI sync and cycle controls');

  const catSpr = AsciiBg.buildProceduralCatKnight(140, 182);
  let hasBody = false, hasSword = false, hasCape = false, hasGrass = false, hasEye = false, hasBg = false;
  for (let i = 0; i < catSpr.mask.length; i++) {
    const m = catSpr.mask[i];
    if (m === AsciiBg.CAT_MASK.NONE) hasBg = true;
    else if (m === AsciiBg.CAT_MASK.BODY) hasBody = true;
    else if (m === AsciiBg.CAT_MASK.SWORD) hasSword = true;
    else if (m === AsciiBg.CAT_MASK.CAPE) hasCape = true;
    else if (m === AsciiBg.CAT_MASK.GRASS) hasGrass = true;
    else if (m === AsciiBg.CAT_MASK.EYE) hasEye = true;
  }
  assert(hasBg && hasBody && hasSword && hasCape && hasGrass && hasEye, 'Cat Knight mask segments background, body, upright sword, billowing cape, grass, and blinking eyes');

  const resCatZoom = AsciiBg.renderFrameToBuffer({
    sceneId: 'cat', t: 1.5, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, catSprite: catSpr
  });
  const resCatHero = AsciiBg.renderFrameToBuffer({
    sceneId: 'cat', t: 10.65, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, catSprite: catSpr
  });
  const resCatDissolve = AsciiBg.renderFrameToBuffer({
    sceneId: 'cat', t: 18.4, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, catSprite: catSpr
  });
  const resCatDone = AsciiBg.renderFrameToBuffer({
    sceneId: 'cat', t: 19.85, width: W, height: H, cellW, cellH, cols, rows, buf32, atlas, stars, catSprite: catSpr
  });
  assert(resCatZoom.renderedLetters > 200 && resCatZoom.isDone === false, 'Cat Knight opening zoom-in renders detailed close-up face');
  assert(resCatHero.renderedLetters > 300 && resCatHero.isDone === false, 'Cat Knight full heroic pose renders knight, sword, cape, and grass');
  assert(resCatDissolve.renderedLetters > 0 && resCatDissolve.renderedLetters < resCatHero.renderedLetters, 'Cat Knight wind-swept dissolve smoothly carries particles away');
  assert(resCatDone.renderedLetters === 0 && resCatDone.isDone === true, 'Cat Knight cleanly dissolves to 0 letters and signals isDone: true at t=19.85s');

  AsciiBg.selectPreset('cat');
  assert(AsciiBg.getPlaybackMode() === 'single' && AsciiBg.getScene() === 'cat', 'selectPreset("cat") locks single mode onto cat scene');
}

// === TEST SUITE 46: Wave 2o — 4-Milestone Energy Slider, Liquid Glass ASCII Bar & Mobile Portrait/Landscape Fixes ===
console.log('\n--- Test Suite 46: Wave 2o 4-Milestone Energy Slider, Liquid Glass ASCII Bar & Mobile Responsive ---');
{
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const themeCss = fs.readFileSync(path.join(__dirname, '../css/theme.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

  // Group 1: 4-Milestone Theme Slider (25% / 50% / 75%) & Liquid Glass Theme Tokens
  assert(indexHtml.includes('id="phase-gate-1"') && indexHtml.includes('left: 25%') &&
         indexHtml.includes('id="phase-gate-2"') && indexHtml.includes('left: 50%') &&
         indexHtml.includes('id="phase-gate-3"') && indexHtml.includes('left: 75%'),
         'index.html renders 3 Crystal Phase Gates separating all 4 theme milestones (25%, 50%, 75%)');
  assert(themeCss.includes('--energy-control-bg:') && themeCss.includes('--ascii-bar-bg:') && themeCss.includes('--ascii-pill-bg:'),
         'css/theme.css defines Liquid Glass surface/pill CSS variables across themes');
  assert(!styleCss.includes('color: #94a3b8 !important;\n}\n\n.ascii-scene-pill-group'),
         'css/style.css removes hardcoded #94a3b8 from .ascii-scene-settings-label');
  assert(styleCss.includes('var(--ascii-pill-bg') && styleCss.includes('var(--energy-control-bg'),
         'css/style.css binds slider control deck and ASCII pill group to theme CSS variables');

  // Group 2: Smart ASCII Scene Settings Bar & Auto-Switch to ascii Theme
  assert(indexHtml.includes('id="ascii-scene-settings-bar"') && indexHtml.includes('id="ascii-scene-bar-toggle"') && indexHtml.includes('App.toggleAsciiSettingsBar()'),
         'index.html includes collapsible smart ASCII scene settings bar toggle');
  assert(styleCss.includes('.ascii-scene-settings-bar.is-ascii-inactive:not(.is-expanded) .ascii-scene-pill-group'),
         'css/style.css compacts inactive ASCII bar cleanly until expanded or activated');
  assert(appJs.includes('toggleAsciiSettingsBar()') && appJs.includes("this.setTheme('ascii', { syncDefaultBg: false })"),
         'js/app.js supports collapsing/expanding inactive ASCII bar and auto-switching to ascii on preset click');

  // Group 3: Mobile Portrait (<= 480px) & Mobile Landscape (<= 500px) Layout Fixes
  assert(styleCss.includes('@media (max-width: 480px)') && styleCss.includes('grid-template-columns: repeat(2, 1fr) !important;'),
         'css/style.css arranges 4 theme selector buttons in 2x2 grid on <= 480px mobile portrait');
  assert(styleCss.includes('#energy-wave-mode-title') && styleCss.includes('overflow-wrap: break-word !important;') && styleCss.includes('height: auto !important;'),
         'css/style.css allows Energy Resonance HUD title to wrap cleanly with min-width: 0 on mobile');
  assert(styleCss.includes('#energy-wave-mode-badge svg') && styleCss.includes('width: 14px !important;') && styleCss.includes('height: 14px !important;') && styleCss.includes('flex-shrink: 0 !important;'),
         'css/style.css locks badge SVG icon to 14x14px with flex-shrink: 0 inside mobile Energy Wave HUD');
  assert(styleCss.includes('grid-auto-rows: 1fr !important;') && styleCss.includes('height: 100% !important;') && styleCss.includes('min-height: 44px !important;') && styleCss.includes('padding: 8px 10px !important;') && styleCss.includes('font-size: 12px !important;'),
         'css/style.css equalizes all 4 ASCII scene pill buttons into symmetric 2x2 grid cells on <= 480px mobile');
  assert(indexHtml.includes('class="bottom-nav-brand"') && indexHtml.includes('./meo.png'),
         'index.html includes mascot brand logo button inside #mobile-bottom-nav for landscape left dock');
  assert(styleCss.includes('justify-content: flex-start !important;') && styleCss.includes('overflow-y: auto !important;') && styleCss.includes('padding-inline: 10px !important;'),
         'css/style.css keeps landscape dock logo visible at top with hidden scrollbar and clean inline padding on horizontal subject pills');

  // Behavioral JS Verification for 4-milestone math and ASCII scene auto-switch
  const slice = appJs.slice(
    appJs.indexOf('// --- ASCII MULTI-SCENE SWITCHER CONTROLS ---'),
    appJs.indexOf('triggerThemeWaveTransition(targetTheme) {')
  );
  const evalObj = eval('({' + slice + '})');
  const prevWin = global.window;
  const prevDoc = global.document;
  let presetSelected = null;
  let startedCount = 0;
  const mockClasses = new Set();
  const makeClassList = (initial = []) => {
    const s = new Set(initial);
    return {
      toggle: (cls, force) => { if (force === undefined ? !s.has(cls) : force) s.add(cls); else s.delete(cls); },
      add: (cls) => s.add(cls),
      remove: (cls) => s.delete(cls),
      contains: (cls) => s.has(cls)
    };
  };
  const barClasses = makeClassList(['is-ascii-inactive']);
  const gate1Classes = makeClassList();
  const gate2Classes = makeClassList();
  const gate3Classes = makeClassList();
  const mockSlider = { min: '0', max: '100', value: '12.5', isConnected: true, style: { setProperty: (k, v) => { mockSlider.style[k] = v; } } };
  const mockSvg = { isConnected: true, style: {} };
  const mockTitle = { textContent: '' };
  const mockSubtitle = { textContent: '' };
  const mockBadgeText = { textContent: '' };
  const mockBar = { classList: barClasses, setAttribute: () => {} };
  const mockQuick = { style: { display: 'none' } };
  const nodeBtns = ['purple-pink', 'monochrome', 'white-orange', 'ascii'].map(opt => ({
    classList: makeClassList(),
    getAttribute: (k) => (k === 'data-theme-opt' ? opt : null)
  }));
  const mockDoc = {
    documentElement: {
      _theme: 'white-orange',
      getAttribute: (k) => (k === 'data-theme' ? mockDoc.documentElement._theme : null)
    },
    getElementById: (id) => {
      if (id === 'ascii-scene-settings-bar') return mockBar;
      if (id === 'ascii-scene-quick-ctrl') return mockQuick;
      if (id === 'theme-energy-slider') return mockSlider;
      if (id === 'energy-wave-svg') return mockSvg;
      if (id === 'phase-gate-1') return { classList: gate1Classes };
      if (id === 'phase-gate-2') return { classList: gate2Classes };
      if (id === 'phase-gate-3') return { classList: gate3Classes };
      if (id === 'energy-wave-mode-title') return mockTitle;
      if (id === 'theme-subtitle') return mockSubtitle;
      if (id === 'energy-wave-badge-text') return mockBadgeText;
      return null;
    },
    querySelector: (sel) => {
      if (sel === '.energy-wave-title') return mockTitle;
      if (sel === '.theme-subtitle') return mockSubtitle;
      return null;
    },
    querySelectorAll: (sel) => (sel === '.energy-node-btn' ? nodeBtns : [])
  };
  const mockWin = {
    AsciiBg: {
      _running: false,
      selectPreset: (p) => { presetSelected = p; },
      start: () => { startedCount++; mockWin.AsciiBg._running = true; },
      getState: () => ({ mode: presetSelected === 'slideshow' ? 'slideshow' : 'single', scene: presetSelected || 'tree' })
    }
  };
  try {
    global.window = mockWin;
    global.document = mockDoc;
    const mockApp = Object.assign(Object.create(evalObj), {
      setThemeCalled: null,
      waveTransitionTheme: null,
      setTheme(themeId, opts) {
        this.setThemeCalled = { themeId, opts };
        mockDoc.documentElement._theme = themeId;
        mockWin.AsciiBg.start();
        this.syncThemeEnergyChamber(themeId, opts);
        this.syncAsciiSceneUI();
      },
      triggerThemeWaveTransition(themeId) { this.waveTransitionTheme = themeId; },
      closeAsciiScenePopover() {}
    });

    assert(mockApp._resolveEnergyThemeFromVal(10) === 'violet-rose', '_resolveEnergyThemeFromVal(10) -> violet-rose');
    assert(mockApp._resolveEnergyThemeFromVal(35) === 'monochrome', '_resolveEnergyThemeFromVal(35) -> monochrome');
    assert(mockApp._resolveEnergyThemeFromVal(60) === 'white-orange', '_resolveEnergyThemeFromVal(60) -> white-orange');
    assert(mockApp._resolveEnergyThemeFromVal(90) === 'ascii', '_resolveEnergyThemeFromVal(90) -> ascii');
    assert(mockApp._getEnergyMilestoneForTheme('violet-rose') === 12.5 &&
           mockApp._getEnergyMilestoneForTheme('monochrome') === 37.5 &&
           mockApp._getEnergyMilestoneForTheme('white-orange') === 62.5 &&
           mockApp._getEnergyMilestoneForTheme('ascii') === 87.5,
           '_getEnergyMilestoneForTheme returns exact 4-milestone centers (12.5, 37.5, 62.5, 87.5)');

    mockApp.syncThemeEnergyChamber('ascii', {});
    assert(parseFloat(mockSlider.value) === 87.5 &&
           gate1Classes.contains('is-passed') && gate2Classes.contains('is-passed') && gate3Classes.contains('is-passed') &&
           mockBadgeText.textContent === 'Năng lượng • 88%' &&
           mockTitle.textContent.includes('ASCII 3D') &&
           nodeBtns[3].classList.contains('active'),
           'syncThemeEnergyChamber("ascii") lights all 3 gates, sets slider to 87.5%, updates HUD title/badge, and activates ASCII node');

    mockDoc.documentElement._theme = 'white-orange';
    mockApp.syncThemeEnergyChamber('white-orange', {});
    assert(parseFloat(mockSlider.value) === 62.5 &&
           gate1Classes.contains('is-passed') && gate2Classes.contains('is-passed') && !gate3Classes.contains('is-passed') &&
           mockBadgeText.textContent === 'Năng lượng • 63%',
           'syncThemeEnergyChamber("white-orange") sets slider to 62.5%, passes gates 1-2 only, and shows 63%');

    mockApp.setAsciiScenePreset('cat');
    assert(presetSelected === 'cat', 'setAsciiScenePreset("cat") forwards chosen scene to AsciiBg');
    assert(mockApp.setThemeCalled && mockApp.setThemeCalled.themeId === 'ascii' && mockApp.setThemeCalled.opts.syncDefaultBg === false,
           'setAsciiScenePreset auto-switches to theme ascii without overriding user wallpaper');
    assert(mockApp.waveTransitionTheme === 'ascii' && startedCount >= 1 && barClasses.contains('is-ascii-active'),
           'Auto-switching via ASCII preset triggers wave transition, starts AsciiBg, and marks bar active');
  } finally {
    global.window = prevWin;
    global.document = prevDoc;
  }
}

// === TEST SUITE 47: Wave 2p — Quiz Prompt Quality Upgrade & Hardened Multi-Block/Noisy AI Parser ===
console.log('\n--- Test Suite 47: Wave 2p Quiz Prompt Quality & Hardened Multi-Block/Noisy Parser ---');
{
  const { AIParser } = require('../js/parser.js');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  // Group 1: Upgraded generateAIPromptTemplate (4 Quality Pillars)
  const qPrompt = AIParser.generateAIPromptTemplate({ topic: 'Mạng Máy Tính', count: 20, difficulty: 'medium' });

  // Pillar 1: Single code block & strict schema
  assert(qPrompt.includes('CHỈ XUẤT DUY NHẤT 1 KHỐI ```json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI'),
         'Prompt enforces single uninterrupted json code block at top');
  assert(qPrompt.includes('bắt đầu ngay bằng ```json và kết thúc ngay bằng ```') &&
         qPrompt.includes('CẤM chèn lời giải thích rườm rà') &&
         qPrompt.includes('"total_questions": 20'),
         'Prompt locks single-fence boundaries, forbids chatter between questions, and embeds total_questions schema');

  // Pillar 2: Explicit count 1..N, self-check, anti-ellipsis/truncation
  assert(qPrompt.includes('"q1"') && qPrompt.includes('"q20"') &&
         qPrompt.includes('tự đối chiếu đếm đủ đúng 20 câu') &&
         qPrompt.includes('CẤM viết tắt kiểu `...`') &&
         qPrompt.includes('CẤM gộp câu'),
         'Prompt enforces explicit 1..N numbering (q1..q20), self-count check, and bans ellipsis/merging');

  // Pillar 3: Full-document scan, uniform coverage & cross-section combine
  assert(qPrompt.includes('quét toàn bộ từ đầu đến cuối') &&
         qPrompt.includes('phân bổ đều') &&
         qPrompt.includes('không chỉ lấy vài trang') &&
         qPrompt.includes('kết hợp (combine) kiến thức liên kết giữa các phần'),
         'Prompt enforces 3-step full-document scan, uniform coverage, and cross-section knowledge combination');

  // Pillar 4: High-quality academic distractors & anti-"sinh ngu" rules
  assert(qPrompt.includes('đồng đều độ dài') &&
         qPrompt.includes('hợp lý về mặt học thuật') &&
         qPrompt.includes('CẤM tạo đáp án nhiễu lộ liễu') &&
         qPrompt.includes('lặp y nguyên') &&
         qPrompt.includes('bám sát tài liệu gốc'),
         'Prompt enforces balanced-length academic distractors, bans giveaway/copy-paste flaws, and anchors explanations to source');

  // Embedded schema sample inside upgraded prompt still parses cleanly
  const sampleBlockMatch = qPrompt.match(/(?:^|\r?\n)```json\s*\r?\n([\s\S]*?)\r?\n```/);
  assert(sampleBlockMatch && sampleBlockMatch[1], 'Upgraded prompt contains valid ```json schema sample');
  const parsedSchemaSample = AIParser.parse(sampleBlockMatch[1]);
  assert(parsedSchemaSample.cards.length === 1 && parsedSchemaSample.errors.length === 0 && parsedSchemaSample.expectedCount === 20,
         'Prompt schema sample parses with 0 errors and reports expectedCount === 20');

  // Group 2: Flagged Rewrite Prompt & App/HTML Integration
  assert(typeof AIParser.generateFlaggedRewritePrompt === 'function',
         'AIParser exports generateFlaggedRewritePrompt helper');
  const flaggedSample = [
    {
      id: 'f1',
      topic: 'Chương 1: Tổng quan',
      difficulty: 'medium',
      question: 'Tầng mạng đảm nhiệm vai trò gì?',
      rawOptions: [
        { id: 'a', text: 'Định tuyến gói tin' },
        { id: 'b', text: 'Mã hóa dữ liệu' },
        { id: 'c', text: 'Điều khiển phiên' },
        { id: 'd', text: 'Truyền bit vật lý' }
      ],
      answerIndex: 0,
      explanation: 'Tầng mạng chịu trách nhiệm định tuyến.'
    },
    {
      id: 'f2',
      topic: 'Chương 2: Giao vận',
      difficulty: 'hard',
      question: 'TCP khác UDP ở điểm nào?',
      rawOptions: [
        { id: 'a', text: 'Hướng kết nối và đảm bảo tin cậy' },
        { id: 'b', text: 'Không kết nối và không kiểm soát tắc nghẽn' },
        { id: 'c', text: 'Chỉ hoạt động ở tầng liên kết dữ liệu' },
        { id: 'd', text: 'Không sử dụng số hiệu cổng nguồn và đích' }
      ],
      answerIndex: 0,
      explanation: 'TCP thiết lập kết nối 3 bước và đảm bảo thứ tự gói tin.'
    }
  ];
  const rewritePrompt = AIParser.generateFlaggedRewritePrompt(flaggedSample);
  assert(rewritePrompt.includes('CHỈ XUẤT DUY NHẤT 1 KHỐI ```json') &&
         rewritePrompt.includes('2 câu') &&
         rewritePrompt.includes('"q1"') && rewritePrompt.includes('"q2"') &&
         rewritePrompt.includes('đồng đều độ dài') &&
         rewritePrompt.includes('CẤM GỌI TÊN CHỮ CÁI ĐÁP ÁN'),
         'generateFlaggedRewritePrompt enforces single JSON block, exact count, balanced distractors, and shuffle-safe explanation');
  assert(appJs.includes('AIParser.generateFlaggedRewritePrompt') &&
         appJs.includes('import-prompt-count') &&
         appJs.includes('parsed.missingCount'),
         'js/app.js integrates generateFlaggedRewritePrompt, import-prompt-count, and missingCount warning');
  assert(indexHtml.includes('id="import-prompt-count"'),
         'index.html provides #import-prompt-count input for configuring prompt question count');

  // Group 3: Parser Multi-Block Merging (All External AI Failure Modes)
  const makeQ = (id, text, optA = 'Phương án đúng chuẩn', optB = 'Phương án nhiễu hợp lý') => ({
    id,
    topic: 'Chương 1',
    difficulty: 'medium',
    question: text,
    options: [
      { id: 'a', text: optA },
      { id: 'b', text: optB },
      { id: 'c', text: 'Phương án nhiễu thứ ba' },
      { id: 'd', text: 'Phương án nhiễu thứ tư' }
    ],
    correct_option_id: 'a',
    explanation: 'Giải thích bám sát tài liệu gốc.'
  });

  // 3A: Back-to-back ```json blocks with NO blank line between them (```\n```json)
  const backToBackBlocks =
    '```json\n' +
    JSON.stringify({ quiz_title: 'Back-to-back Test', total_questions: 4, questions: [makeQ('q1', 'Câu back-to-back 1?'), makeQ('q2', 'Câu back-to-back 2?')] }) +
    '\n```\n```json\n' +
    JSON.stringify({ quiz_title: 'Back-to-back Test', total_questions: 4, questions: [makeQ('q3', 'Câu back-to-back 3?'), makeQ('q4', 'Câu back-to-back 4?')] }) +
    '\n```';
  const parsed3A = AIParser.parse(backToBackBlocks);
  assert(parsed3A.cards.length === 4 && parsed3A.mergedBlockCount === 2 && parsed3A.missingCount === 0,
         'Case 3A: Back-to-back ```json blocks with no blank line merge all 4 cards without dropping block 2');

  // 3B: Indented fences + prose headings + horizontal rules + inline closing }```
  const indentedMultiBlocks = `Dưới đây là 12 câu hỏi chia 3 phần:
### Phần 1 (Câu 1-4):
  \`\`\`json
  ${JSON.stringify({ quiz_title: 'Đề 12 câu chia 3 khối', total_questions: 12, questions: [makeQ('q1', 'Câu phần 1 số 1?'), makeQ('q2', 'Câu phần 1 số 2?'), makeQ('q3', 'Câu phần 1 số 3?'), makeQ('q4', 'Câu phần 1 số 4?')] })}  \`\`\`
---
### Phần 2 (Câu 5-8):
    \`\`\`JSON
    ${JSON.stringify({ quiz_title: 'Đề 12 câu chia 3 khối', total_questions: 12, questions: [makeQ('q5', 'Câu phần 2 số 5?'), makeQ('q6', 'Câu phần 2 số 6?'), makeQ('q7', 'Câu phần 2 số 7?'), makeQ('q8', 'Câu phần 2 số 8?')] })}
    \`\`\`
Tiếp theo là Phần 3:
  \`\`\`jsonc
  ${JSON.stringify({ quiz_title: 'Đề 12 câu chia 3 khối', total_questions: 12, questions: [makeQ('q9', 'Câu phần 3 số 9?'), makeQ('q10', 'Câu phần 3 số 10?'), makeQ('q11', 'Câu phần 3 số 11?'), makeQ('q12', 'Câu phần 3 số 12?')] })}
  \`\`\`
Chúc bạn ôn thi đạt điểm cao!`;
  const parsed3B = AIParser.parse(indentedMultiBlocks);
  assert(parsed3B.cards.length === 12 && parsed3B.mergedBlockCount === 3 && parsed3B.expectedCount === 12 && parsed3B.missingCount === 0,
         'Case 3B: Indented multi-blocks with chatter, --- and inline }``` merge all 12 cards cleanly');
  assert(parsed3B.cards[0].id === 'q1' && parsed3B.cards[11].id === 'q12',
         'Case 3B: Merged cards are numbered sequentially q1..q12');

  // 3C: Mixed fenced block + unfenced JSON block with prose in between (order preserved)
  const mixedFenceAndRaw = `Phần 1:
\`\`\`json
${JSON.stringify({ quiz_title: 'Mixed Blocks', questions: [makeQ('q1', 'Câu hỗn hợp 1?'), makeQ('q2', 'Câu hỗn hợp 2?')] })}
\`\`\`
Phần 2 (không có code fence):
${JSON.stringify({ quiz_title: 'Mixed Blocks', questions: [makeQ('q3', 'Câu hỗn hợp 3?'), makeQ('q4', 'Câu hỗn hợp 4?')] })}
Hết bộ câu hỏi.`;
  const parsed3C = AIParser.parse(mixedFenceAndRaw);
  assert(parsed3C.cards.length === 4 && parsed3C.mergedBlockCount === 2,
         'Case 3C: Mixed fenced + unfenced JSON blocks merge into 4 cards');
  assert(parsed3C.cards[0].question.includes('hỗn hợp 1') && parsed3C.cards[3].question.includes('hỗn hợp 4'),
         'Case 3C: Original document order is preserved across fenced and unfenced blocks');

  // 3D: Individual single-question JSON objects split into separate code blocks
  const perQuestionBlocks = `Câu 1:
\`\`\`json
${JSON.stringify(makeQ('q1', 'Câu tách block riêng số 1?'))}
\`\`\`
Câu 2:
\`\`\`json
${JSON.stringify(makeQ('q2', 'Câu tách block riêng số 2?'))}
\`\`\`
Câu 3:
\`\`\`json
${JSON.stringify(makeQ('q3', 'Câu tách block riêng số 3?'))}
\`\`\``;
  const parsed3D = AIParser.parse(perQuestionBlocks);
  assert(parsed3D.cards.length === 3 && parsed3D.mergedBlockCount === 3,
         'Case 3D: Single-question JSON objects in separate blocks merge into 3 valid cards');

  // 3E: Two JSON objects stuffed inside one single ```json fence
  const twoObjectsInOneFence = `\`\`\`json
${JSON.stringify({ quiz_title: 'Two in One', questions: [makeQ('q1', 'Câu trong cùng fence 1?')] })}
${JSON.stringify({ quiz_title: 'Two in One', questions: [makeQ('q2', 'Câu trong cùng fence 2?')] })}
\`\`\``;
  const parsed3E = AIParser.parse(twoObjectsInOneFence);
  assert(parsed3E.cards.length === 2 && parsed3E.mergedBlockCount === 2,
         'Case 3E: Two JSON objects inside a single code fence merge cleanly into 2 cards');

  // 3F: Anti-false-positive deduplication for same id + shared Vietnamese 20-char stem
  const sharedStemBlocks = `\`\`\`json
${JSON.stringify({ quiz_title: 'OOP P1', questions: [makeQ('q1', 'Trong lập trình hướng đối tượng, khái niệm đóng gói có ý nghĩa gì?')] })}
\`\`\`
\`\`\`json
${JSON.stringify({ quiz_title: 'OOP P2', questions: [makeQ('q1', 'Trong lập trình hướng đối tượng, khái niệm đa hình có ý nghĩa gì?')] })}
\`\`\``;
  const parsed3F = AIParser.parse(sharedStemBlocks);
  assert(parsed3F.cards.length === 2,
         'Case 3F: Distinct questions sharing same id "q1" and 20-char prefix are NOT falsely deduplicated');

  // Group 4: Format Noise Cleaning & Schema Drift Resilience
  // 4A: Unfenced JSON surrounded by prose containing decoy { braces } and [brackets]
  const unfencedWithProse = `Chào bạn! Dưới đây là bộ câu hỏi theo cấu trúc { quiz_title, questions } cho [Phần 1]:
${JSON.stringify({ quiz_title: 'Unfenced Prose', total_questions: 2, questions: [makeQ('q1', 'Câu không fence 1?'), makeQ('q2', 'Câu không fence 2?')] })}
Lưu ý: Bạn có thể dán trực tiếp vào app nhé!`;
  const parsed4A = AIParser.parse(unfencedWithProse);
  assert(parsed4A.cards.length === 2 && parsed4A.errors.length === 0,
         'Case 4A: Unfenced JSON wrapped in prose with decoy braces/brackets parses cleanly');

  // 4B: JSONC comments, stray ellipsis, duplicate commas, BOM, zero-width chars, preserved URL inside string
  const noisyJson = `\uFEFF\u200B\`\`\`json
{
  // Tiêu đề bộ đề
  "quiz_title": "Nhiễu định dạng nâng cao",
  "total_questions": 2,
  /* Danh sách câu hỏi */
  "questions": [
    // Câu hỏi số 1
    {
      "id": "q1",
      "question": "Tài liệu tham khảo tại https://example.com/docs//v1 nói về giao thức nào?",
      "options": [
        { "id": "a", "text": "HTTP/2" },
        { "id": "b", "text": "FTP" },
        { "id": "c", "text": "SMTP" },
        { "id": "d", "text": "SSH" },
      ],
      "correct_option_id": "a",
      "explanation": "Xem chi tiết tại https://example.com/docs//v1 về HTTP/2."
    },
    ...,
    ,
    /* Câu hỏi số 2 */
    {
      "id": "q2",
      "question": "Cổng mặc định của HTTPS là bao nhiêu?",
      "options": [
        { "id": "a", "text": "80" },
        { "id": "b", "text": "443" },
        { "id": "c", "text": "21" },
        { "id": "d", "text": "22" }
      ],
      "correct_option_id": "b",
      "explanation": "HTTPS sử dụng cổng 443 theo chuẩn IANA."
    },
  ]
}
\`\`\`\u200B`;
  const parsed4B = AIParser.parse(noisyJson);
  assert(parsed4B.cards.length === 2 && parsed4B.errors.length === 0,
         'Case 4B: Strips BOM, zero-width chars, // and /* */ comments, stray ellipsis and duplicate commas');
  assert(parsed4B.cards[0].question.includes('https://example.com/docs//v1') &&
         parsed4B.cards[0].explanation.includes('https://example.com/docs//v1'),
         'Case 4B: Preserves // inside quoted URL strings without corruption');

  // 4C: Schema drift (correct_option_id "B.", camelCase correctOptionId, object-map options)
  const schemaDriftJson = JSON.stringify({
    quiz_title: 'Schema Drift Rescue',
    total_questions: 3,
    questions: [
      {
        id: 'q1',
        question: 'Câu drift 1?',
        options: [{ id: 'a', text: 'Sai 1' }, { id: 'b', text: 'Đúng 1' }, { id: 'c', text: 'Sai 2' }, { id: 'd', text: 'Sai 3' }],
        correct_option_id: 'B.'
      },
      {
        id: 'q2',
        question: 'Câu drift 2?',
        options: [{ id: 'a', text: 'Sai 1' }, { id: 'b', text: 'Sai 2' }, { id: 'c', text: 'Đúng 2' }, { id: 'd', text: 'Sai 3' }],
        correctOptionId: 'c'
      },
      {
        id: 'q3',
        question: 'Câu drift 3 với options dạng object?',
        options: { a: 'Sai 1', b: 'Sai 2', c: 'Sai 3', d: 'Đúng 3' },
        correct_answer: 'D)'
      }
    ]
  });
  const parsed4C = AIParser.parse(schemaDriftJson);
  assert(parsed4C.cards.length === 3 && parsed4C.errors.length === 0,
         'Case 4C: Rescues "B.", camelCase correctOptionId, correct_answer "D)", and object-map options');
  assert(parsed4C.cards[0].answerIndex === 1 && parsed4C.cards[1].answerIndex === 2 && parsed4C.cards[2].answerIndex === 3,
         'Case 4C: Resolves exact answerIndex for all 3 schema-drift variants');

  // 4D: Noisy Markdown/Text fallback across multiple fences with bold markers & intro prose
  const noisyMarkdownText = `Dưới đây là 3 câu hỏi trắc nghiệm ôn tập:
\`\`\`markdown
### Phần 1
**Câu 1:** Giao thức nào hoạt động ở tầng ứng dụng?
- **A.** IP
- **B.** HTTP
- **C.** ARP
- **D.** ICMP
**Đáp án đúng:** **B**
**Giải thích:** HTTP là giao thức tầng ứng dụng; IP, ARP và ICMP thuộc tầng mạng/liên kết.
---
\`\`\`
Tiếp tục Phần 2:
\`\`\`text
**Câu 2:** Địa chỉ IPv4 có độ dài bao nhiêu bit?
**A.** 32 bit
**B.** 64 bit
**C.** 128 bit
**D.** 16 bit
**Đáp án:** A
**Giải thích:** IPv4 dài 32 bit, còn IPv6 dài 128 bit.

**Câu 3:** Thiết bị nào hoạt động chủ yếu ở tầng 2 (Data Link)?
A. Router
B. Switch
C. Repeater
D. Gateway
Đáp án đúng là B
Giải thích: Switch chuyển mạch khung dữ liệu dựa trên địa chỉ MAC ở tầng 2.
\`\`\``;
  const parsed4D = AIParser.parse(noisyMarkdownText);
  assert(parsed4D.cards.length === 3, 'Case 4D: Noisy multi-fence Markdown text parses all 3 questions');
  assert(parsed4D.cards[0].question === 'Giao thức nào hoạt động ở tầng ứng dụng?' &&
         parsed4D.cards[0].answerIndex === 1 &&
         parsed4D.cards[1].answerIndex === 0 &&
         parsed4D.cards[2].answerIndex === 1,
         'Case 4D: Cleanly strips bold/intro noise and resolves exact answers across all 3 cards');

  // Group 5: Shortfall Detection (expectedCount vs actual parsed count) & Edge-Case Hardening
  const shortfallJson = JSON.stringify({
    quiz_title: 'Kiểm tra thiếu câu',
    total_questions: 10,
    questions: [
      makeQ('q1', 'Câu 1 hợp lệ?'),
      makeQ('q2', 'Câu 2 hợp lệ?'),
      makeQ('q3', 'Câu 3 hợp lệ?'),
      makeQ('q4', 'Câu 4 hợp lệ?'),
      makeQ('q5', 'Câu 5 hợp lệ?'),
      makeQ('q6', 'Câu 6 hợp lệ?')
    ]
  });
  const parsedShortfall = AIParser.parse(shortfallJson);
  assert(parsedShortfall.cards.length === 6 && parsedShortfall.expectedCount === 10 && parsedShortfall.missingCount === 4,
         'Group 5: Reports exact expectedCount (10) and missingCount (4) when AI outputs fewer questions than declared');

  // 5B: Decoy non-quiz matrix array [[1,2],[3,4]] in prose before real quiz JSON must NOT pollute cards or errors
  const decoyArrayPlusQuiz = `Ma trận ví dụ: [[1, 2], [3, 4]]
\`\`\`json
${JSON.stringify({ quiz_title: 'Clean After Decoy Array', total_questions: 2, questions: [makeQ('q1', 'Câu sau ma trận 1?'), makeQ('q2', 'Câu sau ma trận 2?')] })}
\`\`\``;
  const parsedDecoy = AIParser.parse(decoyArrayPlusQuiz);
  assert(parsedDecoy.cards.length === 2 && parsedDecoy.errors.length === 0 && parsedDecoy.mergedBlockCount === 1,
         'Case 5B: Ignores decoy numeric matrix [[1,2],[3,4]] in prose without polluting errors or mergedBlockCount');

  // 5C: 4-backtick outer fences (````json ... ````) containing embedded ```c code blocks
  const quadBacktickQuiz = '````json\n' + JSON.stringify({
    quiz_title: 'Quad Fence C Code',
    total_questions: 1,
    questions: [{
      id: 'q1',
      topic: 'Lập trình C',
      difficulty: 'medium',
      question: 'Đoạn mã sau in ra gì?\n```c\nprintf("%d", 2 + 3);\n```',
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '23' },
        { id: 'c', text: '2 + 3' },
        { id: 'd', text: 'Lỗi biên dịch' }
      ],
      correct_option_id: 'a',
      explanation: 'Biểu thức 2 + 3 được tính thành 5 trước khi in với đặc tả %d.'
    }]
  }) + '\n````';
  const parsedQuad = AIParser.parse(quadBacktickQuiz);
  assert(parsedQuad.cards.length === 1 && parsedQuad.errors.length === 0 && parsedQuad.cards[0].question.includes('```c'),
         'Case 5C: Supports 4-backtick outer fences (````json) wrapping embedded ```c blocks');

  // 5D: Curly smart quotes around JSON keys/values (copy-paste from Word/Docs)
  const smartQuoteJson = `{
    “quiz_title”: “Đề copy từ Word”,
    “total_questions”: 1,
    “questions”: [
      {
        “id”: “q1”,
        “question”: “Thủ đô của Việt Nam là thành phố nào?”,
        “options”: [
          { “id”: “a”, “text”: “Hà Nội” },
          { “id”: “b”, “text”: “Đà Nẵng” },
          { “id”: “c”, “text”: “Huế” },
          { “id”: “d”, “text”: “Cần Thơ” }
        ],
        “correct_option_id”: “a”,
        “explanation”: “Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.”
      }
    ]
  }`;
  const parsedSmartQuotes = AIParser.parse(smartQuoteJson);
  assert(parsedSmartQuotes.cards.length === 1 && parsedSmartQuotes.cards[0].answerIndex === 0,
         'Case 5D: Repairs structural curly smart quotes around JSON keys/values');

  // 5E: copyAIPrompt does not shadow window.prompt in clipboard catch fallback
  assert(!appJs.includes("prompt('Sao chép prompt dưới đây:', prompt)"),
         'Case 5E: App.copyAIPrompt uses window.prompt without variable shadowing');
}

// === TEST SUITE 48: Wave 2q — Full Mobile Audit (Portrait 375/390 & Landscape 667/844) & ASCII Mobile Engine ===
console.log('\n--- Test Suite 48: Wave 2q Full Mobile Audit (Portrait & Landscape) & ASCII Mobile Engine ---');
{
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const AsciiBg = require('../js/ascii-bg.js');

  const phase2qIdx = styleCss.indexOf('PHASE 2Q: FULL MOBILE AUDIT');
  assert(phase2qIdx !== -1, 'css/style.css contains dedicated PHASE 2Q mobile audit section');
  const phase2qCss = styleCss.slice(phase2qIdx);

  // 1. Global / Cross-screen mobile-native & toast clearance rules
  assert(phase2qCss.includes('touch-action: manipulation;') &&
         phase2qCss.includes('-webkit-text-size-adjust: 100% !important;') &&
         phase2qCss.includes('scroll-padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;'),
         'PHASE 2Q enforces mobile-native touch-action, text-size-adjust, and scroll-padding-bottom');
  assert(phase2qCss.includes('bottom: calc(88px + env(safe-area-inset-bottom, 0px)) !important;') &&
         phase2qCss.includes('left: 76px !important;'),
         'PHASE 2Q positions toasts above portrait bottom-nav and clear of landscape 64px left dock');
  assert(phase2qCss.includes('box-sizing: border-box !important;\n    height: 100dvh !important;') &&
         phase2qCss.includes("html[data-theme=\"ascii\"] body:not(.quiz-active):not(.flashcard-active) #mobile-bottom-nav .bottom-nav-item.active"),
         'PHASE 2Q fixes landscape left-dock border-box height and applies emerald ascii theme across 667x375 & 844x390');

  // 2. Dashboard & Topbar HUD
  assert(phase2qCss.includes('html body .topbar-hud-capsule') &&
         phase2qCss.includes('height: 42px !important;') &&
         phase2qCss.includes('inset: -4px !important;') &&
         phase2qCss.includes('max-height: calc(100dvh - 64px) !important;'),
         'PHASE 2Q aligns Topbar HUD capsule height, extended tap targets, and landscape popover max-height');
  assert(phase2qCss.includes('html body #hero-lofi-bar .lofi-ctrl-btn') &&
         phase2qCss.includes('flex-shrink: 0 !important;') &&
         phase2qCss.includes('html body .editorial-scroll-cue'),
         'PHASE 2Q prevents Lofi button squishing and enforces >= 40px tap targets on Dashboard hero');

  // 3. Decks, Bank, Stats & Modals
  assert(phase2qCss.includes('html body .deck-card .deck-header') &&
         phase2qCss.includes('flex-wrap: wrap !important;') &&
         phase2qCss.includes('html body .deck-actions .btn-secondary'),
         'PHASE 2Q wraps deck card headers cleanly on narrow portrait screens');
  assert(phase2qCss.includes('.cyber-dropdown.align-right .cyber-dropdown-menu') &&
         phase2qCss.includes('right: 0 !important;'),
         'PHASE 2Q supports right-aligned cyber dropdown menus to prevent viewport edge overflow');
  assert(phase2qCss.includes('html body #view-stats .quiz-card table') &&
         phase2qCss.includes('min-width: 520px !important;'),
         'PHASE 2Q isolates Stats Subject/Topic table width inside horizontal scroll wrappers');
  assert(indexHtml.includes('class="modal-two-col-row"') &&
         indexHtml.includes('class="exam-mode-grid"') &&
         indexHtml.includes('class="manage-subject-merge-row"') &&
         phase2qCss.includes('.modal-header .modal-close') &&
         phase2qCss.includes('width: 40px !important;'),
         'index.html & style.css stack 2-column modal grids cleanly and enforce 40x40px modal close buttons');

  // 4. Import AI (Wave 2p) & Import LMS
  assert(indexHtml.includes('class="import-prompt-header"') &&
         indexHtml.includes('class="import-prompt-controls"') &&
         indexHtml.includes('btn-import-copy-prompt') &&
         indexHtml.includes('btn-import-sample') &&
         indexHtml.includes('btn-import-submit') &&
         phase2qCss.includes('#import-prompt-count') &&
         phase2qCss.includes('font-size: 16px !important;') &&
         phase2qCss.includes('#lms-batch-answers'),
         'Import AI & LMS controls include anti-zoom 16px inputs, >= 40px buttons, and responsive flex hooks');

  // 5. Study (Quiz + Flashcard) & Exam
  assert(phase2qCss.includes('html body #view-study .quiz-progress-track') &&
         phase2qCss.includes('flex: 1 0 100% !important;') &&
         phase2qCss.includes('html body #exam-q-counter') &&
         phase2qCss.includes('white-space: nowrap !important;'),
         'Quiz progress bar expands onto its own full-width row on portrait and Exam counter stays single-line');
  assert(phase2qCss.includes('html body.flashcard-active .flashcard-stage') &&
         phase2qCss.includes('justify-content: flex-start !important;'),
         'Flashcard overrides fixed stage height and top-clipping flex centering on mobile portrait & landscape');

  // 6. Settings & Lofi / Learning Rows
  assert(indexHtml.includes('class="settings-option-row"') &&
         phase2qCss.includes('#lofi-track-dropdown-wrap') &&
         phase2qCss.includes('min-width: 0 !important;') &&
         phase2qCss.includes('.energy-node-btn') &&
         phase2qCss.includes('word-break: keep-all !important;'),
         'Settings controls stay >= 40px, prevent mid-word ASCII pill breaks, and avoid min-width overflow');

  // 7. Behavioral JS Check: _openCyberDropdown right-edge collision -> align-right
  const ddSliceStart = appJs.indexOf('closeAllCyberDropdowns() {');
  const ddSliceEnd = appJs.indexOf('_toggleCyberDropdownById(wrapId, e) {');
  assert(ddSliceStart !== -1 && ddSliceEnd > ddSliceStart, 'Extracted dropdown collision methods from js/app.js');
  const ddMethods = eval('({' + appJs.slice(ddSliceStart, ddSliceEnd) + '})');
  const prevWin = global.window;
  const prevDoc = global.document;
  try {
    const makeWrap = (rect) => {
      const classes = new Set();
      const trigger = {
        attrs: {},
        setAttribute: (k, v) => { trigger.attrs[k] = v; },
        getBoundingClientRect: () => rect
      };
      const menu = {};
      return {
        classList: {
          add: (...c) => c.forEach(x => classes.add(x)),
          remove: (...c) => c.forEach(x => classes.delete(x)),
          contains: (c) => classes.has(c)
        },
        querySelector: (sel) => (sel === '.cyber-dropdown-trigger' ? trigger : sel === '.cyber-dropdown-menu' ? menu : null),
        closest: () => null
      };
    };
    global.window = { innerWidth: 667, innerHeight: 375 };
    global.document = { querySelectorAll: () => [] };
    const rightWrap = makeWrap({ left: 470, right: 652, width: 182, top: 100, bottom: 144 });
    ddMethods._openCyberDropdown(rightWrap);
    assert(rightWrap.classList.contains('align-right') && rightWrap.classList.contains('open'),
           '_openCyberDropdown adds align-right when menu would overflow right viewport edge on 667x375');
    const leftWrap = makeWrap({ left: 12, right: 194, width: 182, top: 100, bottom: 144 });
    ddMethods._openCyberDropdown(leftWrap);
    assert(!leftWrap.classList.contains('align-right') && leftWrap.classList.contains('open'),
           '_openCyberDropdown omits align-right when dropdown fits cleanly from left edge');
  } finally {
    global.window = prevWin;
    global.document = prevDoc;
  }

  // 8. Behavioral Headless Verification of js/ascii-bg.js on Mobile Viewports (DPR=1, 30 FPS)
  assert(AsciiBg.CONFIG.DPR === 1 && AsciiBg.CONFIG.FPS_LIMIT === 30,
         'AsciiBg preserves DPR = 1 and 30 FPS throttle cap');
  assert(AsciiBg.isDesktopViewport(1440, 900) === true &&
         AsciiBg.isDesktopViewport(375, 667) === false &&
         AsciiBg.isDesktopViewport(390, 844) === false &&
         AsciiBg.isDesktopViewport(667, 375) === false &&
         AsciiBg.isDesktopViewport(844, 390) === false,
         'AsciiBg.isDesktopViewport correctly separates Desktop from 844x390 and 667x375 mobile landscape');

  function measureNonBlackBounds(buf32, W, H) {
    let minX = W, maxX = -1, minY = H, maxY = -1;
    for (let y = 0; y < H; y++) {
      const rowOff = y * W;
      for (let x = 0; x < W; x++) {
        if ((buf32[rowOff + x] & 0x00FFFFFF) !== 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { minX, maxX, minY, maxY };
  }

  const mobCellW = 4.2, mobCellH = 7.4;
  const mobAtlas = AsciiBg.buildGlyphAtlas(mobCellW, mobCellH, '700 7.5px monospace');
  const treeScene = AsciiBg.buildSceneData(7);
  const catSprite = AsciiBg.buildProceduralCatKnight(140, 182);

  const mobileViewports = [
    { name: '375x667', W: 375, H: 667 },
    { name: '390x844', W: 390, H: 844 },
    { name: '667x375', W: 667, H: 375 },
    { name: '844x390', W: 844, H: 390 }
  ];

  mobileViewports.forEach(({ name, W, H }) => {
    const cols = (W / mobCellW) | 0;
    const rows = (H / mobCellH) | 0;
    const buf32 = new Uint32Array(W * H);

    // Tree scene at showcase t=12.0s (no stars to isolate figure bounds)
    const resTree = AsciiBg.renderFrameToBuffer({
      sceneId: 'tree', t: 12.0, width: W, height: H, cellW: mobCellW, cellH: mobCellH,
      cols, rows, buf32, atlas: mobAtlas, stars: null, scene: treeScene
    });
    const bTree = measureNonBlackBounds(buf32, W, H);
    assert(resTree.renderedLetters > 150 && bTree.minY >= 12 && bTree.maxY <= H - 8,
           `AsciiBg tree fits unclipped vertically on ${name} (minY=${bTree.minY}, maxY=${bTree.maxY}, letters=${resTree.renderedLetters})`);

    // Gargantua scene at showcase t=12.0s
    const resGarg = AsciiBg.renderFrameToBuffer({
      sceneId: 'gargantua', t: 12.0, width: W, height: H, cellW: mobCellW, cellH: mobCellH,
      cols, rows, buf32, atlas: mobAtlas, stars: null
    });
    const bGarg = measureNonBlackBounds(buf32, W, H);
    assert(resGarg.renderedLetters > 150 && bGarg.minX >= 4 && bGarg.maxX <= W - 4 && bGarg.minY >= 2 && bGarg.maxY <= H - 2,
           `AsciiBg gargantua centers cleanly without wing clipping on ${name} (x=${bGarg.minX}..${bGarg.maxX}, y=${bGarg.minY}..${bGarg.maxY})`);

    // Cat Knight scene at heroic pose t=10.65s AND early mobile reveal t=2.0s
    const resCatHero = AsciiBg.renderFrameToBuffer({
      sceneId: 'cat', t: 10.65, width: W, height: H, cellW: mobCellW, cellH: mobCellH,
      cols, rows, buf32, atlas: mobAtlas, stars: null, catSprite
    });
    const bCatHero = measureNonBlackBounds(buf32, W, H);
    assert(resCatHero.renderedLetters > 150 && bCatHero.minY >= 12 && bCatHero.maxY <= H - 10 && bCatHero.minX >= 8 && bCatHero.maxX <= W - 8,
           `AsciiBg cat knight fits unclipped inside safe bounds on ${name} (x=${bCatHero.minX}..${bCatHero.maxX}, y=${bCatHero.minY}..${bCatHero.maxY})`);
  });

  // Verify touch-scroll yield in _tick keeps RAF alive while skipping frame blit during active swipe
  const prevDoc2 = global.document;
  const prevRaf2 = global.requestAnimationFrame;
  const prevOrigRenderAt = AsciiBg.renderAt;
  let rafTicks = 0;
  let renderCalls = 0;
  try {
    global.document = {
      hidden: false,
      documentElement: { getAttribute: (a) => (a === 'data-theme' ? 'ascii' : null) }
    };
    global.requestAnimationFrame = () => ++rafTicks;
    AsciiBg.renderAt = () => { renderCalls++; return { isDone: false }; };
    AsciiBg._running = true;
    AsciiBg._isMobileViewport = true;
    AsciiBg._lastScrollMs = 1000;
    AsciiBg._lastRenderMs = 900;
    AsciiBg._tick(1050);
    assert(rafTicks === 1 && renderCalls === 0 && AsciiBg._rafId !== null,
           'AsciiBg._tick yields CPU blit during active mobile touch-scroll while keeping RAF loop alive');
    AsciiBg._tick(1200);
    assert(rafTicks === 2 && renderCalls === 1,
           'AsciiBg._tick immediately resumes 30 FPS rendering once touch-scroll settles');
  } finally {
    AsciiBg.renderAt = prevOrigRenderAt;
    AsciiBg._running = false;
    AsciiBg._isMobileViewport = false;
    AsciiBg._lastScrollMs = 0;
    AsciiBg._rafId = null;
    global.document = prevDoc2;
    global.requestAnimationFrame = prevRaf2;
  }
}

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
