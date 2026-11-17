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
   * 1. Làm sạch lỗi cú pháp phổ biến của LLM:
   *    - Phép nối chuỗi kiểu code: " + " hoặc ' + '
   *    - Xuống dòng thô (raw newline) / ký tự điều khiển trong chuỗi JSON literal
   *    - Dấu phẩy thừa (trailing comma) trước } hoặc ]
   */
  _sanitizeJsonString(str) {
    if (!str || typeof str !== 'string') return '';

    // Xóa phép nối chuỗi kiểu JS code: " + " hoặc ' + '
    let cleaned = str.replace(/(?<!\\)"\s*\+\s*"/g, '');
    cleaned = cleaned.replace(/(?<!\\)'\s*\+\s*'/g, '');

    // State machine: xử lý raw newline/control char trong string literal và trailing comma ngoài string
    let result = '';
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];

      if (inString) {
        if (isEscaped) {
          result += ch;
          isEscaped = false;
        } else if (ch === '\\') {
          result += ch;
          isEscaped = true;
        } else if (ch === '"') {
          result += ch;
          inString = false;
        } else if (ch === '\n') {
          result += '\\n';
        } else if (ch === '\r') {
          if (cleaned[i + 1] === '\n') {
            i++;
          }
          result += '\\n';
        } else if (ch === '\t') {
          result += '\\t';
        } else if (ch.charCodeAt(0) < 0x20) {
          result += ' ';
        } else {
          result += ch;
        }
      } else {
        if (ch === '"') {
          result += ch;
          inString = true;
        } else if (ch === ',') {
          let j = i + 1;
          while (j < cleaned.length && /\s/.test(cleaned[j])) {
            j++;
          }
          if (j < cleaned.length && (cleaned[j] === '}' || cleaned[j] === ']')) {
            continue; // Bỏ trailing comma
          }
          result += ch;
        } else {
          result += ch;
        }
      }
    }

    return result;
  },

  /**
   * 2. Tự cứu JSON bị cắt cụt giữa chừng do chạm token limit:
   *    Dò ngược từ cuối chuỗi để tìm dấu } của object câu hỏi hoàn chỉnh gần nhất,
   *    cắt bỏ phần dở dang và đóng ngoặc hợp lệ.
   */
  _tryRepairAndParseJson(jsonStr) {
    if (!jsonStr || typeof jsonStr !== 'string') return null;
    const sanitized = this._sanitizeJsonString(jsonStr.trim());

    try {
      return JSON.parse(sanitized);
    } catch (e) {}

    const trimmed = sanitized.trim();
    const isObject = trimmed.startsWith('{');
    const isArray = trimmed.startsWith('[');
    if (!isObject && !isArray) return null;

    let lastIndex = trimmed.lastIndexOf('}');
    while (lastIndex > 0) {
      const sliced = trimmed.slice(0, lastIndex + 1);

      if (isObject) {
        try {
          const parsed = JSON.parse(sliced + '\n]}');
          if (parsed && (Array.isArray(parsed.questions) || Array.isArray(parsed.cards) || Array.isArray(parsed))) {
            return parsed;
          }
        } catch (err1) {
          try {
            const parsed = JSON.parse(sliced + '\n}');
            if (parsed && (Array.isArray(parsed.questions) || Array.isArray(parsed.cards) || Array.isArray(parsed))) {
              return parsed;
            }
          } catch (err2) {}
        }
      } else if (isArray) {
        try {
          const parsed = JSON.parse(sliced + '\n]');
          if (parsed && Array.isArray(parsed)) {
            return parsed;
          }
        } catch (err3) {}
      }

      lastIndex = trimmed.lastIndexOf('}', lastIndex - 1);
    }

    return null;
  },

  /**
   * 3. Tách các block JSON từ rawInput (hỗ trợ nhiều block ```json hoặc nhiều object { "quiz_title": ... })
   */
  _extractJsonBlocks(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return [];
    const trimmed = rawInput.trim();

    if (trimmed.includes('```')) {
      const blocks = [];
      const regex = /```(?:json)?\s*([\s\S]*?)(?:```|$)/gi;
      let m;
      while ((m = regex.exec(trimmed)) !== null) {
        const content = m[1].trim();
        if (content && (content.includes('{') || content.includes('['))) {
          blocks.push(content);
        }
      }
      if (blocks.length > 0) return blocks;
    }

    const objectSplitRegex = /(?<=\})\s*(?=\{\s*"(?:quiz_title|questions|id)")/g;
    if (objectSplitRegex.test(trimmed)) {
      const parts = trimmed.split(objectSplitRegex);
      const validParts = parts.map(p => p.trim()).filter(p => p.startsWith('{') || p.startsWith('['));
      if (validParts.length > 1) {
        return validParts;
      }
    }

    return [trimmed];
  },

  _normalizeQuestionForComparison(text) {
    return stripCitationArtifacts(text)
      .toLowerCase()
      .replace(/^câu\s*\d+[\s.:-]*/i, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * 4. So sánh xem 2 câu hỏi có trùng lặp không (do AI viết lại từ đầu)
   */
  _areQuestionsDuplicate(qA, qB) {
    if (!qA || !qB) return false;

    const textA = (typeof qA === 'object' ? (qA.question || qA.q || qA.title || '') : String(qA)).trim();
    const textB = (typeof qB === 'object' ? (qB.question || qB.q || qB.title || '') : String(qB)).trim();

    if (!textA || !textB) return false;

    const normA = this._normalizeQuestionForComparison(textA);
    const normB = this._normalizeQuestionForComparison(textB);

    if (normA === normB) return true;

    if (normA.length >= 20 && normB.length >= 20) {
      if (normA.startsWith(normB) || normB.startsWith(normA)) {
        return true;
      }
    }

    const idA = qA.id ? String(qA.id).trim().toLowerCase() : '';
    const idB = qB.id ? String(qB.id).trim().toLowerCase() : '';
    if (idA && idB && idA === idB) {
      const minLen = Math.min(normA.length, normB.length);
      if (minLen >= 15 && normA.slice(0, 20) === normB.slice(0, 20)) {
        return true;
      }
    }

    return false;
  },

  _isQuestionMoreComplete(newQ, oldQ) {
    if (!oldQ) return true;
    if (!newQ) return false;

    const optsNew = Array.isArray(newQ.options) ? newQ.options.length : 0;
    const optsOld = Array.isArray(oldQ.options) ? oldQ.options.length : 0;
    if (optsNew !== optsOld) return optsNew > optsOld;

    const expNew = typeof newQ.explanation === 'string' ? newQ.explanation.length : 0;
    const expOld = typeof oldQ.explanation === 'string' ? oldQ.explanation.length : 0;
    if (Math.abs(expNew - expOld) > 10) return expNew > expOld;

    const qNew = typeof newQ.question === 'string' ? newQ.question.length : 0;
    const qOld = typeof oldQ.question === 'string' ? oldQ.question.length : 0;
    if (Math.abs(qNew - qOld) > 5) return qNew > qOld;

    return true;
  },

  /**
   * 5. Gộp nhiều block JSON, khử trùng lặp và đánh lại ID q1..qN khi có gộp/trùng
   */
  _mergeParsedJsonBlocks(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;
    if (blocks.length === 1) {
      return blocks[0];
    }

    let deckName = 'Bộ thẻ mới';
    let description = '';
    let subject = '';

    const mergedQuestions = [];
    let wasDeduplicated = false;

    for (const block of blocks) {
      if (typeof block === 'object' && block !== null && !Array.isArray(block)) {
        if (!deckName || deckName === 'Bộ thẻ mới') {
          deckName = block.quiz_title || block.deckName || block.name || block.title || deckName;
        }
        if (!description) description = block.description || '';
        if (!subject) subject = block.subject || block.subjectName || '';
      }

      const qs = Array.isArray(block) ? block : (Array.isArray(block.questions) ? block.questions : (Array.isArray(block.cards) ? block.cards : []));
      for (const q of qs) {
        const existingIdx = mergedQuestions.findIndex(m => this._areQuestionsDuplicate(m, q));
        if (existingIdx !== -1) {
          wasDeduplicated = true;
          if (this._isQuestionMoreComplete(q, mergedQuestions[existingIdx])) {
            mergedQuestions[existingIdx] = q;
          }
        } else {
          mergedQuestions.push(q);
        }
      }
    }

    mergedQuestions.forEach((q, idx) => {
      if (typeof q === 'object' && q !== null) {
        q.id = `q${idx + 1}`;
      }
    });

    return {
      quiz_title: deckName,
      description: description,
      subject: subject,
      questions: mergedQuestions
    };
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

    // 1. Phân tích các khối JSON (tự sửa lỗi cú pháp, tự cứu block bị cụt, gộp multi-block & khử trùng lặp)
    const jsonBlocks = this._extractJsonBlocks(trimmed);
    const parsedDataList = [];

    for (let i = 0; i < jsonBlocks.length; i++) {
      const repaired = this._tryRepairAndParseJson(jsonBlocks[i]);
      if (repaired) {
        parsedDataList.push(repaired);
      }
    }

    if (parsedDataList.length > 0) {
      const mergedJson = this._mergeParsedJsonBlocks(parsedDataList);
      if (mergedJson && (Array.isArray(mergedJson.questions) || Array.isArray(mergedJson.cards) || Array.isArray(mergedJson))) {
        return this._normalizeJsonData(mergedJson);
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

      // 1b. Extract optional question image (image / question_image / img)
      const questionImage = (typeof q.image === 'string' ? q.image : (typeof q.question_image === 'string' ? q.question_image : (typeof q.img === 'string' ? q.img : ''))).trim() || null;

      // 2. Validate 'options' field (must have >= 2 choices)
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") phải có ít nhất 2 phương án lựa chọn ('options'). Hiện có: ${Array.isArray(q.options) ? q.options.length : 0}.`
        });
        return;
      }

      // Normalize options to [{ id, text, (image) }]
      const normalizedOptions = [];
      const optionIds = new Set();
      const defaultLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        let optId = '';
        let optText = '';
        let optImg = null;

        if (typeof opt === 'object' && opt !== null) {
          optId = opt.id !== undefined ? String(opt.id).trim().toLowerCase() : defaultLetters[i];
          optText = opt.text !== undefined ? String(opt.text).trim() : '';
          optImg = (typeof opt.image === 'string' ? opt.image : (typeof opt.img === 'string' ? opt.img : '')).trim() || null;
        } else {
          optId = defaultLetters[i];
          optText = String(opt).trim();
        }

        // Cho phép option có ảnh (optImg) thì text có thể rỗng, không báo lỗi
        if (!optText && !optImg) {
          errors.push({
            index: qIndex,
            id: qId,
            message: `Câu hỏi số ${qIndex} (id: "${qId}") có phương án lựa chọn thứ ${i + 1} trống không có nội dung text.`
          });
          return;
        }

        optText = this.stripCitationArtifacts(optText);
        optionIds.add(optId);
        const optEntry = { id: optId, text: optText };
        if (optImg) {
          optEntry.image = optImg;
        }
        normalizedOptions.push(optEntry);
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
            // Match letter A, B, C, D (chỉ match nhãn đơn hoặc có dấu phân cách rõ ràng)
            const letterMatch = cleanAns.match(/^([a-d])(?:[\.\)\:]\s*|$)/i);
            if (letterMatch && optionIds.has(letterMatch[1].toLowerCase())) {
              correctId = letterMatch[1].toLowerCase();
            } else {
              // Try matching text: ưu tiên khớp chính xác trước
              const exactFound = normalizedOptions.find(o => o.text.trim().toLowerCase() === cleanAns);
              const found = exactFound || normalizedOptions.find(o => o.text.toLowerCase().includes(cleanAns));
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
        let clean = String(opt.text ?? '').trim();
        const letter = (defaultLetters[idx] || `${idx + 1}`).toUpperCase();
        // Chỉ bóc tiền tố nếu chuỗi thực sự chứa định dạng trắc nghiệm rõ ràng: "A. ", "b) ", "C: "
        // Tuyệt đối không dùng while hay regex nuốt biến đơn như "r x s", "r – s" hay mũi tên "A -> BC"
        const prefixMatch = clean.match(/^(?:[A-Da-d])[\.\)\:]\s+(.*)$/s);
        if (prefixMatch && prefixMatch[1].trim().length > 0) {
          clean = prefixMatch[1].trim();
        }
        return clean ? `${letter}. ${clean}` : `${letter}.`;
      });

      validCards.push({
        id: qId,
        question: cleanQuestion,
        image: questionImage,
        options: displayOptions,
        rawOptions: normalizedOptions,
        answerIndex: answerIndex,
        correctOptionId: correctId,
        explanation: explanation,
        topic: topic,
        difficulty: difficulty,
        tag: topic, // alias for UI compatibility
        source: (q.source && ['ai', 'lms', 'manual'].includes(q.source)) ? q.source : 'ai'
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
          tag: this.stripCitationArtifacts((currentCard.topic || 'Chung').trim()),
          source: 'ai'
        });
      }
      currentCard = null;
    };

    const qRegex = /^(?:#{1,6}\s*)?(?:Câu\s*\d+[\s:.-]*|\d+[\s:.-]+)\s*(.*)/i;
    const optRegex = /^\s*([A-Da-d])[\.\)\:]\s+(.*)/;
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
   * Generates standard AI Prompt template adhering to JSON schema & pedagogical standards
   */
  generateAIPromptTemplate({ topic = '', count = 10, difficulty = 'medium' } = {}) {
    return `Hãy đóng vai một chuyên gia giáo dục và biên soạn ${count} câu hỏi trắc nghiệm ôn tập chất lượng cao về chủ đề: "${topic || '[DÁN NỘI DUNG / CHỦ ĐỀ / TÀI LIỆU TẠI ĐÂY]'}".

Yêu cầu thực hiện nghiêm ngặt 4 nguyên tắc sau:

1. VAI TRÒ & ĐẦU RA JSON CHUẨN:
- Trả về DUY NHẤT 1 block JSON hợp lệ theo đúng schema dưới đây, tuyệt đối không kèm lời chào, lời dẫn hay bình luận ngoài JSON.
- Mỗi câu hỏi gồm đầy đủ các trường: "id", "topic", "difficulty" ("easy"|"medium"|"hard"), "question", "image": "", "options" (mảng object [{"id", "text", "image": ""}]), "correct_option_id" (khớp với "id" trong "options"), "explanation".
- Nội dung "text" của options KHÔNG tự thêm tiền tố "A.", "B.". Hỗ trợ LaTeX ($...$ hoặc $$...$$).
- CẤM TUYỆT ĐỐI việc chèn các ký hiệu trích dẫn nguồn hoặc đánh dấu trang/đoạn (như [cite: 1, 2], [cite_start], [cite_end], [1], [2], [source], 【1†source】). Mọi lựa chọn và câu hỏi phải có văn phong đồng nhất.

\`\`\`json
{
  "quiz_title": "${topic || 'Chương 3: Đạo hàm'}",
  "questions": [
    {
      "id": "q1",
      "topic": "${topic || 'Đạo hàm'}",
      "difficulty": "${difficulty}",
      "question": "Đạo hàm của $f(x) = x^2$ là gì?",
      "image": "",
      "options": [
        { "id": "a", "text": "$2x$", "image": "" },
        { "id": "b", "text": "$x^2$", "image": "" },
        { "id": "c", "text": "$2$", "image": "" },
        { "id": "d", "text": "$x$", "image": "" }
      ],
      "correct_option_id": "a",
      "explanation": "Áp dụng công thức đạo hàm lũy thừa $(x^n)' = n \\\\cdot x^{n-1}$ với $n = 2$, ta có $(x^2)' = 2x^{2-1} = 2x$. Loại B vì giữ nguyên hàm gốc chưa lấy đạo hàm; loại C vì đạo hàm bậc nhất của $2x$ mới bằng $2$; loại D vì thiếu hệ số $n = 2$."
    }
  ]
}
\`\`\`

2. CHỐNG CẮT NGANG & KHÔNG LẶP CÂU:
- Xuất toàn bộ câu hỏi trong 1 block JSON hoàn chỉnh.
- Chỉ xuất tiếp ở lượt sau nếu chạm giới hạn độ dài của model (mỗi lượt là 1 block JSON hoàn chỉnh, nối tiếp thứ tự câu, tuyệt đối không lặp lại câu cũ).

3. KỶ LUẬT CÚ PHÁP JSON (CHỐNG LỖI PARSE):
- CẤM TUYỆT ĐỐI: nối chuỗi kiểu code (" + ", ' + '), xuống dòng thô trong chuỗi JSON (mọi xuống dòng phải dùng \\n), hoặc tự ngắt để viết lại từ q1 giữa chừng khi gặp câu có hình ảnh/bảng biểu.
- Escape đúng \\" và \\\\ (đặc biệt với LaTeX như \\\\frac, \\\\le, \\\\ge và ký tự C như \\\\0, \\\\n). Trong văn bản giải thích/câu hỏi, ưu tiên dùng backtick \`...\` thay cho ngoặc kép " để hạn chế lỗi escape.
- Chiến lược Hybrid xử lý đề thi có hình ảnh:
  + Bắt buộc OCR và chuyển toàn bộ sang Text + LaTeX ($...$, $$...$$) + Bảng Markdown đối với ảnh chụp chữ, công thức Toán/Lý/Hóa, bảng số liệu (KHÔNG giữ dạng ảnh).
  + Ảnh sơ đồ (ER, UML, mạch điện) hoặc đồ thị hình học: KHÔNG diễn giải thay thế bằng văn bản (làm mất ý nghĩa câu hỏi); giữ cấu trúc "image": "" trên câu hỏi hoặc options[].image để người dùng dán ảnh trực tiếp trên app.

4. CHẤT LƯỢNG NỘI DUNG & GIẢI THÍCH:
- Giữ nguyên vẹn nội dung câu hỏi và đủ 4 đáp án (không tự ý rút gọn).
- Quy tắc BẮT BUỘC cho trường "explanation" (dài 2–3 câu):
  + Nêu rõ TẠI SAO đáp án đúng là đúng (nêu công thức, quy tắc hoặc trace từng bước tính/suy diễn cụ thể).
  + Nêu rõ TẠI SAO các phương án nhiễu còn lại sai (chỉ rõ lỗi sai bản chất hoặc bẫy thường gặp).
  + CẤM TUYỆT ĐỐI viết câu mẫu sáo rỗng hoặc chung chung kiểu "Theo quy tắc chuẩn, đáp án đúng là...".
  + CHỐNG LƯỜI KHI SINH NHIỀU CÂU: Mỗi câu hỏi phải có lời giải thích riêng biệt bám sát ngữ cảnh đề bài, không lặp lại khuôn mẫu câu.`;
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
