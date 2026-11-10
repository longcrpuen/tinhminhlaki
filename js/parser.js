/**
 * Pure function: Loại bỏ triệt để các ký hiệu trích dẫn AI ([cite: ...], [cite_start], [cite_end], 【...】)
 * để tránh làm lộ đáp án và làm sạch giao diện hiển thị câu hỏi.
 */
function stripCitationArtifacts(text) {
  if (!text || typeof text !== 'string') return text || '';
  if (text.indexOf('[') === -1 && text.indexOf('【') === -1) return text;
  return text
    // 1. Xóa mọi biến thể [cite: 1, 2, 3], [cite_start], [cite_end], [cite: ...]
    .replace(/\[\s*cite(?:_start|_end)?\s*(?::[^\]]*)?\]/gi, '')
    // 2. Xóa trích dẫn kiểu NotebookLM / OpenAI 【4:0†source】, 【1†...】
    .replace(/【[^】]*】/g, '')
    // 3. Xóa khoảng trắng thừa trước dấu câu sinh ra sau khi cắt [cite]
    .replace(/\s+([.,;:?!])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Smart AI Parser for MindSparks
 * Supports the Standard JSON Format (with LaTeX Math $...$ and $$...$$),
 * robust per-question validation without crashing the whole file,
 * and backwards-compatible plaintext/Markdown format.
 */
const AIParser = {
  stripCitationArtifacts(text) {
    return stripCitationArtifacts(text);
  },
  /**
   * Main parse function. Detects format and validates items.
   * @param {string} rawInput 
   * @returns {Object} { deckName, description, cards: [...validCards], errors: [...errorList], rawCardsCount }
   */
  parse(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') {
      throw new Error('Dữ liệu nhập vào trống hoặc không hợp lệ.');
    }

    const trimmed = rawInput.trim();

    // 1. Try parsing as JSON (including JSON wrapped in markdown ```json ... ```)
    let jsonCandidate = trimmed;
    if (jsonCandidate.includes('```')) {
      const match = jsonCandidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        jsonCandidate = match[1].trim();
      }
    }

    if ((jsonCandidate.startsWith('[') && jsonCandidate.endsWith(']')) ||
        (jsonCandidate.startsWith('{') && jsonCandidate.endsWith('}'))) {
      try {
        const parsed = JSON.parse(jsonCandidate);
        return this._normalizeJsonData(parsed);
      } catch (err) {
        if (err.name === 'SyntaxError') {
          throw new Error(`Cú pháp JSON không hợp lệ: ${err.message}. Hãy kiểm tra dấu phẩy hoặc dấu ngoặc kép.`);
        }
        throw err;
      }
    }

    // 2. Try parsing as Markdown / Text format
    const textCards = this._parseTextFormat(trimmed);
    if (textCards && textCards.length > 0) {
      return {
        deckName: 'Bộ thẻ nhập từ văn bản',
        description: `Nhập tự động ${textCards.length} câu hỏi`,
        cards: textCards,
        errors: [],
        rawCardsCount: textCards.length
      };
    }

    // 3. Fallback error
    throw new Error(
      'Không thể nhận diện định dạng câu hỏi! Vui lòng dán dữ liệu theo định dạng JSON chuẩn (có quiz_title và questions) hoặc văn bản trắc nghiệm.'
    );
  },

  /**
   * Normalizes parsed JSON data into standard structure with isolated per-question validation.
   */
  _normalizeJsonData(data) {
    let deckName = 'Bộ thẻ mới';
    let description = '';
    let subject = '';
    let rawQuestions = [];

    if (Array.isArray(data)) {
      rawQuestions = data;
    } else if (typeof data === 'object' && data !== null) {
      deckName = data.quiz_title || data.deckName || data.name || data.title || 'Bộ thẻ mới';
      description = data.description || '';
      subject = (typeof data.subject === 'string' ? data.subject : (typeof data.subjectName === 'string' ? data.subjectName : (typeof data.subject_name === 'string' ? data.subject_name : ''))).trim();
      rawQuestions = data.questions || data.cards || [];
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('Không tìm thấy danh sách câu hỏi ("questions") nào trong dữ liệu JSON.');
    }

    const validCards = [];
    const errors = [];

    rawQuestions.forEach((q, index) => {
      const qIndex = index + 1;
      const qId = q.id || `q${qIndex}`;

      // 1. Validate 'question' field
      if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") bị thiếu nội dung câu hỏi ('question').`
        });
        return; // skip this invalid question without crashing the rest
      }

      // 2. Validate 'options' field (must have >= 2 choices)
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") phải có ít nhất 2 phương án lựa chọn ('options'). Hiện có: ${Array.isArray(q.options) ? q.options.length : 0}.`
        });
        return;
      }

      // Normalize options to [{ id, text }]
      const normalizedOptions = [];
      const optionIds = new Set();
      const defaultLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        let optId = '';
        let optText = '';

        if (typeof opt === 'object' && opt !== null) {
          optId = opt.id !== undefined ? String(opt.id).trim().toLowerCase() : defaultLetters[i];
          optText = opt.text !== undefined ? String(opt.text).trim() : '';
        } else {
          optId = defaultLetters[i];
          optText = String(opt).trim();
        }

        if (!optText) {
          errors.push({
            index: qIndex,
            id: qId,
            message: `Câu hỏi số ${qIndex} (id: "${qId}") có phương án lựa chọn thứ ${i + 1} trống không có nội dung text.`
          });
          return;
        }

        optText = this.stripCitationArtifacts(optText);
        optionIds.add(optId);
        normalizedOptions.push({ id: optId, text: optText });
      }

      // 3. Validate 'correct_option_id' (or fallback answer)
      let correctId = q.correct_option_id !== undefined ? String(q.correct_option_id).trim().toLowerCase() : null;

      // Backward-compatible fallbacks for answer / correctAnswer
      if (!correctId && q.answer !== undefined) {
        if (typeof q.answer === 'number' && q.answer >= 0 && q.answer < normalizedOptions.length) {
          correctId = normalizedOptions[q.answer].id;
        } else if (typeof q.answer === 'string') {
          const cleanAns = q.answer.trim().toLowerCase();
          if (optionIds.has(cleanAns)) {
            correctId = cleanAns;
          } else {
            // Match letter A, B, C, D
            const letterMatch = cleanAns.match(/^([a-d])/i);
            if (letterMatch && optionIds.has(letterMatch[1].toLowerCase())) {
              correctId = letterMatch[1].toLowerCase();
            } else {
              // Try matching text
              const found = normalizedOptions.find(o => o.text.toLowerCase().includes(cleanAns));
              if (found) correctId = found.id;
            }
          }
        }
      }

      if (!correctId || !optionIds.has(correctId)) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") có 'correct_option_id' ("${q.correct_option_id || ''}") không khớp với bất kỳ id nào trong options: [${Array.from(optionIds).join(', ')}].`
        });
        return;
      }

      // Find answer index
      const answerIndex = normalizedOptions.findIndex(o => o.id === correctId);

      // 4. Extract optional fields (topic, difficulty, explanation)
      const topic = this.stripCitationArtifacts((q.topic || q.category || q.tag || 'Chung').trim());
      let difficulty = (q.difficulty || 'medium').trim().toLowerCase();
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        difficulty = 'medium';
      }

      const explanation = this.stripCitationArtifacts((q.explanation || q.explain || q.note || '').trim());
      const cleanQuestion = this.stripCitationArtifacts(q.question.trim());

      // Convert options for display: normalize to single clean "A. Text"
      const displayOptions = normalizedOptions.map((opt, idx) => {
        let clean = opt.text;
        let letter = (defaultLetters[idx] || `${idx + 1}`).toUpperCase();
        while (/^[A-Za-z][\s.):\-]+/.test(clean)) {
          const m = clean.match(/^([A-Za-z])[\s.):\-]+(.*)$/);
          if (m) {
            letter = m[1].toUpperCase();
            clean = m[2].trim();
          } else {
            break;
          }
        }
        return `${letter}. ${clean}`;
      });

      validCards.push({
        id: qId,
        question: cleanQuestion,
        options: displayOptions,
        rawOptions: normalizedOptions,
        answerIndex: answerIndex,
        correctOptionId: correctId,
        explanation: explanation,
        topic: topic,
        difficulty: difficulty,
        tag: topic // alias for UI compatibility
      });
    });

    return {
      deckName,
      description,
      subject,
      cards: validCards,
      errors: errors,
      rawCardsCount: rawQuestions.length
    };
  },

  /**
   * Parses plaintext / Markdown block format as fallback
   */
  _parseTextFormat(text) {
    const cards = [];
    const lines = text.split(/\r?\n/);
    let currentCard = null;

    const flushCurrent = () => {
      if (currentCard && currentCard.question && currentCard.options.length >= 2) {
        const defaultLetters = ['a', 'b', 'c', 'd', 'e'];
        let answerIndex = 0;
        const letterMatch = currentCard.rawAnswer.match(/^([A-Da-d])/);
        if (letterMatch) {
          const idx = 'abcd'.indexOf(letterMatch[1].toLowerCase());
          if (idx >= 0 && idx < currentCard.options.length) answerIndex = idx;
        }

        const cleanedOpts = currentCard.options.map(t => this.stripCitationArtifacts(t));
        cards.push({
          id: `q${cards.length + 1}`,
          question: this.stripCitationArtifacts(currentCard.question.trim()),
          options: cleanedOpts,
          rawOptions: cleanedOpts.map((t, i) => ({ id: defaultLetters[i], text: t })),
          answerIndex: answerIndex,
          correctOptionId: defaultLetters[answerIndex],
          explanation: this.stripCitationArtifacts((currentCard.explanation || '').trim()),
          topic: this.stripCitationArtifacts((currentCard.topic || 'Chung').trim()),
          difficulty: 'medium',
          tag: this.stripCitationArtifacts((currentCard.topic || 'Chung').trim())
        });
      }
      currentCard = null;
    };

    const qRegex = /^(?:#{1,6}\s*)?(?:Câu\s*\d+[\s:.-]*|\d+[\s:.-]+)\s*(.*)/i;
    const optRegex = /^\s*([A-Da-d])[\s.):-]+\s*(.*)/;
    const ansRegex = /^\s*(?:Đáp án|Đ\/A|Answer|Correct|Key)[\s:.-]+\s*(.*)/i;
    const expRegex = /^\s*(?:Giải thích|Explain|Lý do|Note)[\s:.-]+\s*(.*)/i;
    const tagRegex = /^\s*(?:Tag|Topic|Chủ đề|Chủ điểm|Category)[\s:.-]+\s*(.*)/i;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (!currentCard && /^#+\s+(.+)/.test(trimmed) && !qRegex.test(trimmed)) {
        continue;
      }

      const qMatch = trimmed.match(qRegex);
      if (qMatch && (!currentCard || currentCard.options.length >= 2)) {
        flushCurrent();
        currentCard = {
          question: qMatch[1] || trimmed,
          options: [],
          rawAnswer: 'A',
          explanation: '',
          topic: 'Chung'
        };
        continue;
      }

      if (!currentCard) {
        currentCard = {
          question: trimmed,
          options: [],
          rawAnswer: 'A',
          explanation: '',
          topic: 'Chung'
        };
        continue;
      }

      const optMatch = trimmed.match(optRegex);
      if (optMatch) {
        currentCard.options.push(trimmed);
        continue;
      }

      const ansMatch = trimmed.match(ansRegex);
      if (ansMatch) {
        currentCard.rawAnswer = ansMatch[1].trim();
        continue;
      }

      const expMatch = trimmed.match(expRegex);
      if (expMatch) {
        currentCard.explanation = expMatch[1].trim();
        continue;
      }

      const tagMatch = trimmed.match(tagRegex);
      if (tagMatch) {
        currentCard.topic = tagMatch[1].trim();
        continue;
      }

      if (currentCard.explanation) {
        currentCard.explanation += ' ' + trimmed;
      } else if (currentCard.options.length === 0) {
        currentCard.question += ' ' + trimmed;
      }
    }

    flushCurrent();
    return cards;
  },

  /**
   * Generates standard AI Prompt template adhering 100% to section 3 specifications
   */
  generateAIPromptTemplate({ topic = '', count = 10, difficulty = 'medium' } = {}) {
    return `Hãy đóng vai một chuyên gia giáo dục và biên soạn ${count} câu hỏi trắc nghiệm ôn tập từ tài liệu/nội dung: "${topic || '[DÁN NỘI DUNG / TÀI LIỆU HỌC TẬP TẠI ĐÂY]'}".

Yêu cầu định dạng:
1. Trả về DUY NHẤT một khối mã JSON hợp lệ (không kèm bất kỳ lời chào hay giải thích ngoài khối mã JSON).
2. Hỗ trợ công thức Toán/Lý/Hóa LaTeX trong mọi trường text: dùng $...$ cho inline math và $...$ cho block math (ví dụ: $f(x) = x^2$, $\\frac{d}{dx}x^n = nx^{n-1}$).
3. QUY TẮC PHÂN LOẠI CHƯƠNG (BẮT BUỘC CHO TRƯỜNG "topic"):
   - Trường "topic" của mỗi câu hỏi BẮT BUỘC phải ghi tên CHƯƠNG LỚN mà câu hỏi đó trực thuộc (ví dụ: "Chương 1: Tổng quan", "Chương 2: Đạo hàm và Vi phân").
   - TUYỆT ĐỐI KHÔNG tự đặt một chủ đề vụn vặt riêng cho từng câu hỏi! Các câu hỏi trong cùng một chương phải dùng CHÍNH XÁC CÙNG MỘT TÊN CHƯƠNG thống nhất để phục vụ gom nhóm và lọc câu hỏi theo chương.
4. Tuân thủ chính xác 100% cấu trúc JSON chuẩn TinhMinhLaKey bên dưới:

\`\`\`json
{
  "quiz_title": "${topic || 'Chương 1: Đạo hàm và Ứng dụng'}",
  "questions": [
    {
      "id": "q1",
      "topic": "${topic || 'Chương 1: Đạo hàm và Ứng dụng'}",
      "difficulty": "${difficulty}",
      "question": "Đạo hàm của $f(x) = x^2$ là gì?",
      "options": [
        { "id": "a", "text": "$2x$" },
        { "id": "b", "text": "$x^2$" },
        { "id": "c", "text": "$2$" },
        { "id": "d", "text": "$x$" }
      ],
      "correct_option_id": "a",
      "explanation": "Áp dụng quy tắc đạo hàm lũy thừa: $\\\\frac{d}{dx}x^n = nx^{n-1}$"
    }
  ]
}
\`\`\`

Quy tắc bắt buộc:
- "topic" chỉ ghi theo cấp độ Chương (VD: "Chương 1: ...", "Chương 2: ..."), đồng nhất giữa các câu cùng chương.
- "options" phải có ít nhất 2 lựa chọn (khuyến nghị 4 lựa chọn có id từ "a" đến "d").
- "correct_option_id" BẮT BUỘC phải khớp với một trong các "id" trong "options".
- "difficulty" nhận một trong ba giá trị: "easy", "medium", hoặc "hard".
- CẤM TUYỆT ĐỐI việc chèn các ký hiệu trích dẫn nguồn tài liệu hoặc đánh dấu trang/đoạn (như [cite: 1, 2], [cite_start], [cite_end], [1], [2], [source], 【1†source】) vào trong nội dung câu hỏi ("question"), các lựa chọn trả lời ("options"), hay lời giải thích ("explanation"). Mọi lựa chọn A, B, C, D phải có văn phong đồng nhất 100%, tuyệt đối không để lộ dấu vết dẫn chứng ở đáp án đúng!`;
  }
};

/**
 * Pure function: Làm sạch văn bản thô copy từ Moodle LMS.
 * Loại bỏ các dòng rác: Trạng thái hoàn thành, Đạt điểm (match fuzzy theo tiền tố),
 * Cờ đánh dấu, Nhãn đoạn văn.
 * Giữ nguyên các dòng trống (tín hiệu cấu trúc) và mốc câu hỏi / chọn đáp án.
 * @param {string} rawText
 * @returns {string} Cleaned text
 */
function cleanRawText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  const lines = rawText.split(/\r?\n/);
  const cleanedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Dòng trống: giữ nguyên — là tín hiệu cấu trúc quan trọng
    if (!trimmed) {
      cleanedLines.push('');
      continue;
    }

    // 1. Trạng thái hoàn thành: /^Hoàn thành$/, /^Chưa hoàn thành$/
    if (/^(?:Hoàn thành|Chưa hoàn thành)$/i.test(trimmed)) {
      continue;
    }

    // 2. Điểm số: match linh hoạt theo tiền tố /^Đạt điểm/ (bỏ qua mọi giá trị điểm cụ thể)
    if (/^Đạt điểm/i.test(trimmed)) {
      continue;
    }

    // 3. Cờ đánh dấu: /^(Không gắn cờ)?(Đặt cờ|Bỏ cờ|Gỡ cờ)$/
    if (/^(?:Không gắn cờ)?(?:Đặt cờ|Bỏ cờ|Gỡ cờ)$/i.test(trimmed)) {
      continue;
    }

    // 4. Nhãn đoạn văn: /^Đoạn văn câu hỏi$/
    if (/^Đoạn văn câu hỏi$/i.test(trimmed)) {
      continue;
    }

    cleanedLines.push(trimmed);
  }

  return cleanedLines.join('\n');
}

/**
 * Pure function: Tách cấu trúc câu hỏi và phương án từ văn bản đã được làm sạch.
 * @param {string} cleanedText
 * @returns {Array<Object>} Danh sách các câu hỏi đã bóc tách
 */
function parseQuestions(cleanedText) {
  if (!cleanedText || typeof cleanedText !== 'string' || !cleanedText.trim()) {
    console.warn('[LMSParser] Dữ liệu văn bản sau khi làm sạch bị trống.');
    return [];
  }

  const lines = cleanedText.split(/\r?\n/);
  const isQuestionBoundary = (str) => /^Câu hỏi\s+\d+$/i.test(str.trim());
  const hasQuestionBoundary = lines.some(l => isQuestionBoundary(l));

  const blocks = [];
  let currentBlock = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    let isBoundary = false;

    if (hasQuestionBoundary) {
      isBoundary = isQuestionBoundary(trimmed);
    } else {
      // Dự phòng khi không có mốc "Câu hỏi \d+"
      isBoundary = /^Câu\s+\d+[\s.:-]/i.test(trimmed);
    }

    if (isBoundary && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const parsedQuestions = [];

  blocks.forEach((blockLines, blockIdx) => {
    const blockNumber = blockIdx + 1;
    let hasMultipleCorrect = false;
    let needsReview = false;
    let reviewWarning = '';
    let numericCorrectAnswer = '';

    // Tìm vị trí bắt đầu của các phương án lựa chọn (option markers: a. hoặc a. Nội dung)
    const isOptionStart = (str) => /^([a-zA-Z])[\.:\)]\s*(.*)$/.test(str);
    let firstOptIdx = -1;

    for (let i = 0; i < blockLines.length; i++) {
      const t = blockLines[i].trim();
      if (isOptionStart(t)) {
        firstOptIdx = i;
        break;
      }
    }

    // Tách phần câu hỏi (các dòng trước firstOptIdx)
    const questionLines = [];
    const questionBoundaryLimit = firstOptIdx !== -1 ? firstOptIdx : blockLines.length;

    for (let i = 0; i < questionBoundaryLimit; i++) {
      const t = blockLines[i].trim();
      if (!t) continue; // bỏ qua dòng trống xen giữa câu hỏi

      // Bỏ qua mốc "Câu hỏi \d+"
      if (/^Câu hỏi\s+\d+$/i.test(t)) continue;

      // Kiểm tra nhãn chọn đáp án
      if (/^Select one or more:?$/i.test(t)) {
        hasMultipleCorrect = true;
        needsReview = true;
        reviewWarning = '⚠️ Câu hỏi nhiều đáp án đúng (Select one or more)';
        continue;
      }
      if (/^Select one:?$/i.test(t)) {
        continue;
      }

      // Kiểm tra dòng đáp án số nếu có (vd: "The correct answer is: 78.54")
      const numAnsMatch = t.match(/^The correct answer is:\s*(.*)/i);
      if (numAnsMatch) {
        numericCorrectAnswer = numAnsMatch[1].trim();
        continue;
      }

      // Loại bỏ các dòng rác phòng khi người dùng gọi trực tiếp parseQuestions
      if (/^(?:Hoàn thành|Chưa hoàn thành)$/i.test(t)) continue;
      if (/^Đạt điểm/i.test(t)) continue;
      if (/^(?:Không gắn cờ)?(?:Đặt cờ|Bỏ cờ|Gỡ cờ)$/i.test(t)) continue;
      if (/^Đoạn văn câu hỏi$/i.test(t)) continue;

      questionLines.push(t);
    }

    // Gộp câu hỏi nhiều dòng, ngăn cách bằng khoảng trắng
    let questionText = questionLines.join(' ').trim();

    // Cắt bỏ tiền tố "Câu <số> " (hoặc "Câu <số>: ") và làm sạch trích dẫn
    questionText = stripCitationArtifacts(questionText.replace(/^Câu\s+\d+[\s.:-]\s*/i, '').trim());

    if (!questionText) {
      console.warn(`[LMSParser] Bỏ qua khối câu hỏi số ${blockNumber}: Không tìm thấy nội dung câu hỏi.`);
      return;
    }

    // Tách các phương án lựa chọn (từ firstOptIdx đến hết)
    const options = [];
    let currentOpt = null;

    if (firstOptIdx !== -1) {
      for (let i = firstOptIdx; i < blockLines.length; i++) {
        const line = blockLines[i];
        const trimmed = line.trim();

        // Bỏ qua dòng trống trong lúc gộp đáp án
        if (!trimmed) continue;

        // Bỏ qua nếu có Select one or more / Select one lạc vào
        if (/^Select one or more:?$/i.test(trimmed)) {
          hasMultipleCorrect = true;
          needsReview = true;
          reviewWarning = '⚠️ Câu hỏi nhiều đáp án đúng (Select one or more)';
          continue;
        }
        if (/^Select one:?$/i.test(trimmed)) continue;

        // Dạng chuẩn Moodle: chữ cái đứng riêng "a." hoặc "a)"
        const standaloneMatch = trimmed.match(/^([a-zA-Z])[\.:\)]\s*$/);
        // Dạng biến thể dự phòng: chữ cái cùng dòng "a. Nội dung"
        const inlineMatch = trimmed.match(/^([a-zA-Z])[\.:\)]\s+(.+)$/);

        if (standaloneMatch) {
          currentOpt = {
            id: standaloneMatch[1].toLowerCase(),
            text: ''
          };
          options.push(currentOpt);
        } else if (inlineMatch) {
          currentOpt = {
            id: inlineMatch[1].toLowerCase(),
            text: inlineMatch[2].trim()
          };
          options.push(currentOpt);
        } else if (currentOpt) {
          // Gộp dòng nội dung tiếp theo vào đáp án hiện tại
          if (currentOpt.text) {
            currentOpt.text += ' ' + trimmed;
          } else {
            currentOpt.text = trimmed;
          }
        }
      }
    }

    // Làm sạch trích dẫn trong các phương án lựa chọn
    options.forEach(opt => {
      if (opt && opt.text) {
        opt.text = stripCitationArtifacts(opt.text);
      }
    });

    // Kiểm tra câu hỏi điền số (numeric) nếu không có phương án a/b/c/d
    if (options.length === 0) {
      const numericCard = {
        question: questionText,
        options: [],
        correct_option_id: null,
        explanation: '',
        difficulty: null,
        needs_review: needsReview,

        // Thuộc tính tương thích hệ thống
        id: `lms_q_${blockNumber}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        index: blockNumber,
        type: 'numeric',
        rawOptions: [],
        correctOptionId: null,
        answerIndex: -1,
        correct_answer: numericCorrectAnswer,
        source: 'lms',
        topic: '',
        needsReview: needsReview,
        reviewWarning: reviewWarning || (needsReview ? '⚠️ Cần kiểm tra' : ''),
        reviewReason: reviewWarning || (needsReview ? 'Cần kiểm tra' : '')
      };
      parsedQuestions.push(numericCard);
      return;
    }

    if (options.length < 2) {
      needsReview = true;
      if (!reviewWarning) reviewWarning = '⚠️ Có ít hơn 2 lựa chọn đáp án';
      console.warn(`[LMSParser] Khối câu hỏi số ${blockNumber}: Chỉ có ${options.length} phương án lựa chọn.`);
    }

    const questionCard = {
      question: questionText,
      options: options,
      correct_option_id: null,
      explanation: '',
      difficulty: null,
      needs_review: needsReview,

      // Thuộc tính tương thích giao diện và lưu trữ
      id: `lms_q_${blockNumber}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      index: blockNumber,
      type: 'multiple_choice',
      rawOptions: options,
      correctOptionId: null,
      answerIndex: -1,
      correct_answer: '',
      source: 'lms',
      topic: '',
      needsReview: needsReview,
      reviewWarning: reviewWarning,
      reviewReason: reviewWarning
    };

    parsedQuestions.push(questionCard);
  });

  if (parsedQuestions.length === 0) {
    console.error('[LMSParser] Không bóc tách được câu hỏi nào từ dữ liệu đầu vào. Vui lòng kiểm tra lại định dạng nguồn.');
  }

  // Gán thuộc tính .questions lên mảng để tương thích ngược 100% với app.js
  parsedQuestions.questions = parsedQuestions;
  return parsedQuestions;
}

/**
 * LMSParser - Object wrapper xuất các API xử lý dữ liệu Moodle LMS.
 */
const LMSParser = {
  cleanRawText,
  parseQuestions,

  /**
   * Phân tích văn bản thô từ Moodle qua 2 bước tách biệt: làm sạch rồi bóc tách cấu trúc.
   * @param {string} rawText
   * @returns {Array<Object>} Mảng danh sách câu hỏi
   */
  parse(rawText) {
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      console.warn('[LMSParser] Dữ liệu nhập vào trống hoặc không phải chuỗi văn bản hợp lệ.');
      const empty = [];
      empty.questions = empty;
      return empty;
    }

    // Bước 1: Làm sạch dữ liệu
    const cleaned = this.cleanRawText(rawText);

    // Bước 2: Tách cấu trúc câu hỏi và đáp án
    const questions = this.parseQuestions(cleaned);
    questions.questions = questions;
    return questions;
  },

  /**
   * Gán tự động chuỗi đáp án hàng loạt (VD: "b, a, c, d", "bacda", hoặc "1.b, 2.a")
   * @param {Array<Object>} cards
   * @param {string} answerSequenceStr
   * @returns {number} Số lượng câu đã gán đáp án thành công
   */
  applyBatchAnswers(cards, answerSequenceStr) {
    if (!Array.isArray(cards) || !answerSequenceStr || typeof answerSequenceStr !== 'string') {
      return 0;
    }

    let tokens = [];

    // Hỗ trợ dạng đánh số: "1.b", "1: a", "1-c"
    const numberedMatches = [...answerSequenceStr.matchAll(/\b\d+[\s.:\)-]+([a-zA-Z])\b/g)];
    if (numberedMatches.length > 0) {
      tokens = numberedMatches.map(m => m[1].toLowerCase());
    } else {
      // Tách chuỗi chữ cái
      const clean = answerSequenceStr.replace(/[^a-zA-Z]/g, '');
      tokens = clean.split('').map(c => c.toLowerCase());
    }

    if (tokens.length === 0) return 0;

    let assignedCount = 0;
    let tokenIdx = 0;

    cards.forEach(card => {
      if (card.type === 'numeric') return; // Bỏ qua câu hỏi điền số
      if (tokenIdx >= tokens.length) return;

      const targetLetter = tokens[tokenIdx++];
      const opts = card.options || card.rawOptions || [];
      const defaultLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      const foundIdx = opts.findIndex((o, idx) => {
        const id = (typeof o === 'object' && o !== null && o.id) ? o.id.toLowerCase() : defaultLetters[idx];
        return id === targetLetter;
      });

      if (foundIdx !== -1) {
        const chosenId = (typeof opts[foundIdx] === 'object' && opts[foundIdx].id)
          ? opts[foundIdx].id.toLowerCase()
          : defaultLetters[foundIdx];
        card.correct_option_id = chosenId;
        card.correctOptionId = chosenId;
        card.answerIndex = foundIdx;
        assignedCount++;
      }
    });

    return assignedCount;
  }
};

if (typeof window !== 'undefined') {
  window.AIParser = AIParser;
  window.LMSParser = LMSParser;
  window.cleanRawText = cleanRawText;
  window.parseQuestions = parseQuestions;
  window.stripCitationArtifacts = stripCitationArtifacts;
}
if (typeof self !== 'undefined') {
  self.AIParser = AIParser;
  self.LMSParser = LMSParser;
  self.cleanRawText = cleanRawText;
  self.parseQuestions = parseQuestions;
  self.stripCitationArtifacts = stripCitationArtifacts;
}
if (typeof global !== 'undefined') {
  global.LMSParser = LMSParser;
  global.cleanRawText = cleanRawText;
  global.parseQuestions = parseQuestions;
  global.stripCitationArtifacts = stripCitationArtifacts;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIParser, LMSParser, cleanRawText, parseQuestions, stripCitationArtifacts };
}
