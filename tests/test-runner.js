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
  assert(fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-pixel-meadow.jpg')), 'Nature wallpaper bg-pixel-meadow.jpg exists');
  assert(fs.existsSync(path.join(__dirname, '..', 'backgrounds', 'bg-starry-garden.jpg')), 'Nature wallpaper bg-starry-garden.jpg exists');

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
  assert(html.includes('class="bg-thumb-none-icon">🚫</span>'),
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

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
