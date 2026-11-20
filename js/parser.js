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
   * 0. Loại bỏ BOM & ký tự zero-width vô hình thường dính khi copy từ giao diện chat AI
   */
  _stripInvisibleChars(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[\uFEFF\u200B-\u200D\u2060]/g, '');
  },

  /**
   * 1. Làm sạch lỗi cú pháp phổ biến của LLM:
   *    - BOM / ký tự zero-width vô hình
   *    - Phép nối chuỗi kiểu code: " + " hoặc ' + '
   *    - Comment kiểu JS/JSONC (// ..., /* ... *\/) ngoài string literal
   *    - Dấu chấm lửng bỏ lửng (... / …) ngoài string literal
   *    - Xuống dòng thô (raw newline) / ký tự điều khiển trong chuỗi JSON literal
   *    - Dấu phẩy thừa (trailing comma, leading comma, duplicate comma) ngoài string
   */
  _sanitizeJsonString(str) {
    if (!str || typeof str !== 'string') return '';

    // Loại bỏ BOM & zero-width chars
    let cleaned = this._stripInvisibleChars(str);

    // Xóa phép nối chuỗi kiểu JS code: " + " hoặc ' + '
    cleaned = cleaned.replace(/(?<!\\)"\s*\+\s*"/g, '');
    cleaned = cleaned.replace(/(?<!\\)'\s*\+\s*'/g, '');

    // Helper: bỏ qua khoảng trắng, comment //, /* */ và dấu ... ngoài chuỗi để peek ký tự tiếp theo
    const peekNextSignificant = (src, startIdx) => {
      let j = startIdx;
      while (j < src.length) {
        const c = src[j];
        if (/\s/.test(c)) {
          j++;
        } else if (c === '/' && src[j + 1] === '/') {
          j += 2;
          while (j < src.length && src[j] !== '\n' && src[j] !== '\r') j++;
        } else if (c === '/' && src[j + 1] === '*') {
          j += 2;
          while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++;
          if (j < src.length) j += 2;
        } else if (c === '.' && src[j + 1] === '.' && src[j + 2] === '.') {
          while (j < src.length && src[j] === '.') j++;
        } else if (c === '\u2026') {
          j++;
        } else {
          break;
        }
      }
      return j < src.length ? src[j] : '';
    };

    const getLastNonWsChar = (s) => {
      for (let k = s.length - 1; k >= 0; k--) {
        if (!/\s/.test(s[k])) return s[k];
      }
      return '';
    };

    // State machine: xử lý raw newline/control char trong string literal và comment/ellipsis/comma ngoài string
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
        } else if (ch === '/' && cleaned[i + 1] === '/') {
          // Bỏ comment 1 dòng // ... ngoài string literal (giữ nguyên URL https://... trong string)
          i += 2;
          while (i < cleaned.length && cleaned[i] !== '\n' && cleaned[i] !== '\r') {
            i++;
          }
          if (i < cleaned.length) {
            result += cleaned[i];
          }
        } else if (ch === '/' && cleaned[i + 1] === '*') {
          // Bỏ comment khối /* ... */ ngoài string literal
          i += 2;
          while (i < cleaned.length && !(cleaned[i] === '*' && cleaned[i + 1] === '/')) {
            i++;
          }
          if (i < cleaned.length) {
            i++; // vượt qua ký tự '/' cuối '*/'
          }
        } else if (ch === '.' && cleaned[i + 1] === '.' && cleaned[i + 2] === '.') {
          // Bỏ dấu ... viết tắt lạc ngoài string literal
          while (i + 1 < cleaned.length && cleaned[i + 1] === '.') {
            i++;
          }
        } else if (ch === '\u2026') {
          // Bỏ ký tự … (Unicode ellipsis) lạc ngoài string literal
          continue;
        } else if (ch === ',') {
          const prevSig = getLastNonWsChar(result);
          const nextSig = peekNextSignificant(cleaned, i + 1);
          // Bỏ trailing comma trước }/], leading comma sau [/{, hoặc duplicate comma ,,
          if (
            !nextSig ||
            nextSig === '}' ||
            nextSig === ']' ||
            nextSig === ',' ||
            prevSig === '[' ||
            prevSig === '{' ||
            prevSig === ','
          ) {
            continue;
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
   * Chuẩn hóa dấu ngoặc kép cong (“ ”) dùng làm delimiter JSON khi copy từ Word/Notion (chỉ dùng ở fallback)
   */
  _normalizeStructuralSmartQuotes(str) {
    if (!str || typeof str !== 'string') return str || '';
    if (!/[“”]/.test(str)) return str;
    if (!/[“”]\s*(?:quiz_title|deckName|title|questions|cards|total_questions|id|question|options|correct_option_id|explanation|topic|difficulty|text)\s*[“”]\s*:/.test(str)) {
      return str;
    }
    return str.replace(/[“”]/g, '"');
  },

  _isSingleQuestionObject(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    const hasQuestion = typeof data.question === 'string' && data.question.trim().length > 0;
    const hasOptionsArray = Array.isArray(data.options) && data.options.length >= 2;
    const hasOptionsMap = Boolean(
      data.options &&
      typeof data.options === 'object' &&
      !Array.isArray(data.options) &&
      Object.keys(data.options).length >= 2
    );
    return hasQuestion && (hasOptionsArray || hasOptionsMap);
  },

  _extractExpectedCount(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const raw = data.total_questions ?? data.expected_count ?? data.question_count ?? data.expectedCount;
    if (raw === undefined || raw === null || raw === '') return null;
    const num = Number(raw);
    if (Number.isInteger(num) && num > 0) return num;
    return null;
  },

  /**
   * 2. Tự cứu JSON bị cắt cụt giữa chừng do chạm token limit:
   *    Dò ngược từ cuối chuỗi để tìm dấu } của object câu hỏi hoàn chỉnh gần nhất,
   *    cắt bỏ phần dở dang và đóng ngoặc hợp lệ.
   */
  _tryRepairAndParseJson(jsonStr) {
    if (!jsonStr || typeof jsonStr !== 'string') return null;
    let sanitized = this._sanitizeJsonString(jsonStr.trim());

    try {
      return JSON.parse(sanitized);
    } catch (e) {
      const smartNormalized = this._normalizeStructuralSmartQuotes(sanitized);
      if (smartNormalized !== sanitized) {
        sanitized = this._sanitizeJsonString(smartNormalized);
        try {
          return JSON.parse(sanitized);
        } catch (_) {}
      }
    }

    const trimmed = sanitized.trim();
    const isObject = trimmed.startsWith('{');
    const isArray = trimmed.startsWith('[');
    if ((!isObject && !isArray) || !trimmed.includes('"')) return null;

    const MAX_REPAIR_ATTEMPTS = 30;
    let attempts = 0;
    let lastIndex = trimmed.lastIndexOf('}');
    while (lastIndex > 0 && attempts < MAX_REPAIR_ATTEMPTS) {
      attempts++;
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
            if (parsed && (Array.isArray(parsed.questions) || Array.isArray(parsed.cards) || Array.isArray(parsed) || this._isSingleQuestionObject(parsed))) {
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

  _isQuizJsonData(data) {
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data)) {
      return data.length > 0 && data.some(item => item && typeof item === 'object' && !Array.isArray(item) && (
        typeof item.question === 'string' ||
        typeof item.q === 'string' ||
        Array.isArray(item.options) ||
        (item.options && typeof item.options === 'object')
      ));
    }
    return Boolean(
      (Array.isArray(data.questions) && data.questions.length > 0) ||
      (Array.isArray(data.cards) && data.cards.length > 0) ||
      (data.quiz_title && (Array.isArray(data.questions) || Array.isArray(data.cards))) ||
      (data.deckName && (Array.isArray(data.questions) || Array.isArray(data.cards))) ||
      this._isSingleQuestionObject(data)
    );
  },

  /**
   * Quét chuỗi theo ngoặc cân bằng (nhận biết string literal và comment JSONC) để tách mọi khối JSON hợp lệ hoặc bị cắt cụt,
   * bỏ qua hoàn toàn văn bản lời dẫn, { ngoặc minh họa } hay [nhãn] bên ngoài JSON.
   */
  _extractBalancedJsonCandidates(text) {
    if (!text || typeof text !== 'string') return [];
    const candidates = [];

    const peekNextNonWsNonComment = (src, idx) => {
      let j = idx;
      while (j < src.length) {
        const c = src[j];
        if (/\s/.test(c)) {
          j++;
        } else if (c === '/' && src[j + 1] === '/') {
          j += 2;
          while (j < src.length && src[j] !== '\n' && src[j] !== '\r') j++;
        } else if (c === '/' && src[j + 1] === '*') {
          j += 2;
          while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++;
          if (j < src.length) j += 2;
        } else {
          break;
        }
      }
      return j < src.length ? src[j] : '';
    };

    let startIdx = -1;
    let stack = [];
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (stack.length === 0) {
        if (ch === '/' && text[i + 1] === '/') {
          i += 2;
          while (i < text.length && text[i] !== '\n' && text[i] !== '\r') i++;
          continue;
        }
        if (ch === '/' && text[i + 1] === '*') {
          i += 2;
          while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
          if (i < text.length) i++;
          continue;
        }
        if (ch === '{') {
          const nextCh = peekNextNonWsNonComment(text, i + 1);
          if (nextCh === '"' || nextCh === '“' || nextCh === '}') {
            startIdx = i;
            stack = ['{'];
            inString = false;
            isEscaped = false;
          }
        } else if (ch === '[') {
          const nextCh = peekNextNonWsNonComment(text, i + 1);
          if (nextCh === '{' || nextCh === '[' || nextCh === ']') {
            startIdx = i;
            stack = ['['];
            inString = false;
            isEscaped = false;
          }
        }
        continue;
      }

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (ch === '\\') {
          isEscaped = true;
        } else if (ch === '"') {
          inString = false;
        }
      } else {
        if (ch === '/' && text[i + 1] === '/') {
          i += 2;
          while (i < text.length && text[i] !== '\n' && text[i] !== '\r') i++;
          continue;
        }
        if (ch === '/' && text[i + 1] === '*') {
          i += 2;
          while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
          if (i < text.length) i++;
          continue;
        }
        if (ch === '"') {
          inString = true;
        } else if (ch === '{' || ch === '[') {
          stack.push(ch);
        } else if (ch === '}' || ch === ']') {
          const top = stack[stack.length - 1];
          if ((ch === '}' && top === '{') || (ch === ']' && top === '[')) {
            stack.pop();
            if (stack.length === 0) {
              const snippet = text.slice(startIdx, i + 1).trim();
              if (snippet) candidates.push(snippet);
              startIdx = -1;
            }
          }
        }
      }
    }

    // Xử lý khối JSON bị cắt cụt (chưa đóng ngoặc) ở cuối chuỗi
    if (startIdx !== -1 && stack.length > 0) {
      const tail = text.slice(startIdx).trim();
      if (tail) {
        // Phòng trường hợp block 1 bị cụt không có code fence nhưng theo sau là block 2 không có code fence
        const nextRootMatch = tail.slice(1).match(/\r?\n[ \t]*(\{\s*"(?:quiz_title|deckName|questions|cards|total_questions)")/);
        if (nextRootMatch && typeof nextRootMatch.index === 'number') {
          const splitAt = nextRootMatch.index + 1;
          const part1 = tail.slice(0, splitAt).trim();
          const part2 = tail.slice(splitAt).trim();
          if (part1) candidates.push(part1);
          if (part2) {
            const subCandidates = this._extractBalancedJsonCandidates(part2);
            if (subCandidates.length > 0) {
              candidates.push(...subCandidates);
            } else {
              candidates.push(part2);
            }
          }
        } else {
          candidates.push(tail);
        }
      }
    }

    return candidates;
  },

  /**
   * 3. Tách toàn bộ các block JSON từ rawInput theo đúng thứ tự xuất hiện:
   *    - Hỗ trợ nhiều block ```json / ```JSON / ```jsonc / ``` liền kề nhau (không cần dòng trống)
   *    - Hỗ trợ code fence thụt lề, đóng fence cùng dòng (}```), và lời dẫn/tiêu đề xen giữa
   *    - Hỗ trợ pha trộn giữa block có fence và block JSON trần không có fence
   *    - Hỗ trợ nhiều object JSON nằm chung trong 1 code fence
   *    - Tuyệt đối không cắt nhầm các khối code ```c, ```text, ```python bên trong chuỗi JSON.
   */
  _extractJsonBlocks(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return [];
    const cleaned = this._stripInvisibleChars(rawInput).trim();
    if (!cleaned) return [];

    const allBlocks = [];
    const lines = cleaned.split(/\r?\n/);

    let inFence = false;
    let fenceTicks = 3;
    let innerFenceDepth = 0;
    let fenceLines = [];
    let outsideLines = [];

    const flushOutside = () => {
      if (outsideLines.length === 0) return;
      const outsideText = outsideLines.join('\n').trim();
      outsideLines = [];
      if (!outsideText) return;
      const found = this._extractBalancedJsonCandidates(outsideText);
      if (found.length > 0) {
        allBlocks.push(...found);
      }
    };

    const flushFence = () => {
      const content = fenceLines.join('\n').trim();
      fenceLines = [];
      inFence = false;
      fenceTicks = 3;
      innerFenceDepth = 0;
      if (!content) return;
      const found = this._extractBalancedJsonCandidates(content);
      if (found.length > 0) {
        allBlocks.push(...found);
      } else if (content.startsWith('{') || content.startsWith('[')) {
        allBlocks.push(content);
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!inFence) {
        // Trường hợp 1: cả mở fence, JSON và đóng fence trên cùng 1 dòng (hỗ trợ 3+ backtick)
        const singleLineFence = line.match(/^[ \t]*(`{3,})[ \t]*(?:jsonc?|json5)?[ \t]*([\{\[][\s\S]*?)`{3,}[ \t]*$/i);
        if (singleLineFence) {
          flushOutside();
          const inlineContent = singleLineFence[2].trim();
          const found = this._extractBalancedJsonCandidates(inlineContent);
          if (found.length > 0) {
            allBlocks.push(...found);
          } else if (inlineContent.startsWith('{') || inlineContent.startsWith('[')) {
            allBlocks.push(inlineContent);
          }
          continue;
        }

        // Trường hợp 2: dòng mở fence JSON chuẩn (```json, ````json, ```JSON, ```jsonc, ```json5 hoặc ``` đứng riêng)
        const openFenceBare = line.match(/^[ \t]*(`{3,})[ \t]*(?:jsonc?|json5)?[ \t]*$/i);
        if (openFenceBare) {
          flushOutside();
          inFence = true;
          fenceTicks = openFenceBare[1].length;
          innerFenceDepth = 0;
          fenceLines = [];
          continue;
        }

        // Trường hợp 3: dòng mở fence có sẵn dấu { hoặc [ ngay trên cùng dòng
        const openFenceInlineStart = line.match(/^[ \t]*(`{3,})[ \t]*(?:jsonc?|json5)?[ \t]+([\{\[].*)$/i);
        if (openFenceInlineStart) {
          flushOutside();
          inFence = true;
          fenceTicks = openFenceInlineStart[1].length;
          innerFenceDepth = 0;
          fenceLines = [openFenceInlineStart[2]];
          continue;
        }

        outsideLines.push(line);
      } else {
        // Nếu bên trong fence JSON (có raw newline) gặp opening fence ngôn ngữ khác (```c, ```text, ```python...)
        if (/^[ \t]*`{3,}[a-zA-Z0-9_+#.-]+[ \t]*$/.test(line) && !/^[ \t]*`{3,}(?:jsonc?|json5)[ \t]*$/i.test(line)) {
          innerFenceDepth++;
          fenceLines.push(line);
          continue;
        }

        // Dòng đóng fence đứng riêng (hoặc có lời chú thích theo sau dấu cách)
        const closeMatch = line.match(/^[ \t]*(`{3,})(?:[ \t]*$|[ \t]+[^`].*$)/);
        if (closeMatch) {
          if (innerFenceDepth > 0) {
            innerFenceDepth--;
            fenceLines.push(line);
          } else if (closeMatch[1].length >= fenceTicks) {
            flushFence();
          } else {
            fenceLines.push(line);
          }
          continue;
        }

        // Dòng JSON kết thúc bằng }``` hoặc ]``` ngay trên cùng dòng
        const inlineClose = innerFenceDepth === 0 ? line.match(/^(.*[\}\]])[ \t]*(`{3,})[ \t]*$/) : null;
        if (inlineClose && inlineClose[2].length >= fenceTicks) {
          fenceLines.push(inlineClose[1]);
          flushFence();
          continue;
        }

        fenceLines.push(line);
      }
    }

    if (inFence) {
      flushFence();
    }
    flushOutside();

    if (allBlocks.length > 0) {
      return allBlocks;
    }

    return [cleaned];
  },

  _normalizeQuestionForComparison(text) {
    return stripCitationArtifacts(text)
      .toLowerCase()
      .replace(/^câu\s*\d+[\s.:-]*/i, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  _isQuestionIncompleteForDedup(qObj) {
    if (!qObj || typeof qObj !== 'object') return false;
    const text = String(qObj.question || qObj.q || qObj.title || '').trim();
    const optsCount = Array.isArray(qObj.options)
      ? qObj.options.length
      : (qObj.options && typeof qObj.options === 'object' ? Object.keys(qObj.options).length : 0);
    if (optsCount < 2) return true;
    if (/\.\.\.$|…$/.test(text)) return true;
    return false;
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
    if (idA && idB && idA === idB && (this._isQuestionIncompleteForDedup(qA) || this._isQuestionIncompleteForDedup(qB))) {
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
   * 5. Gộp nhiều block JSON, khử trùng lặp an toàn và đánh lại ID q1..qN khi có gộp nhiều block
   */
  _mergeParsedJsonBlocks(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;
    if (blocks.length === 1) {
      if (this._isSingleQuestionObject(blocks[0])) {
        return {
          quiz_title: blocks[0].topic || 'Bộ thẻ mới',
          description: '',
          subject: '',
          questions: [blocks[0]]
        };
      }
      return blocks[0];
    }

    let deckName = 'Bộ thẻ mới';
    let description = '';
    let subject = '';
    const declaredCounts = [];

    const mergedQuestions = [];
    const mergedMeta = [];
    const byExactNorm = new Map();
    const byPrefix20 = new Map();
    const byId = new Map();

    const extractMeta = (qItem) => {
      if (!qItem) return { norm: '', id: '', incomplete: false };
      const text = (typeof qItem === 'object' ? (qItem.question || qItem.q || qItem.title || '') : String(qItem)).trim();
      if (!text) return { norm: '', id: '', incomplete: false };
      const norm = this._normalizeQuestionForComparison(text);
      const id = (typeof qItem === 'object' && qItem.id) ? String(qItem.id).trim().toLowerCase() : '';
      const incomplete = this._isQuestionIncompleteForDedup(qItem);
      return { norm, id, incomplete };
    };

    const indexQuestion = (idx, meta) => {
      if (!meta.norm) return;
      byExactNorm.set(meta.norm, idx);
      if (meta.norm.length >= 20) {
        const p20 = meta.norm.slice(0, 20);
        let bucket = byPrefix20.get(p20);
        if (!bucket) {
          bucket = [];
          byPrefix20.set(p20, bucket);
        }
        if (!bucket.includes(idx)) bucket.push(idx);
      }
      if (meta.id && meta.norm.length >= 15) {
        let idBucket = byId.get(meta.id);
        if (!idBucket) {
          idBucket = [];
          byId.set(meta.id, idBucket);
        }
        if (!idBucket.includes(idx)) idBucket.push(idx);
      }
    };

    for (const block of blocks) {
      if (typeof block === 'object' && block !== null && !Array.isArray(block)) {
        if (!deckName || deckName === 'Bộ thẻ mới') {
          deckName = block.quiz_title || block.deckName || block.name || block.title || deckName;
        }
        if (!description) description = block.description || '';
        if (!subject) subject = block.subject || block.subjectName || '';
        const blockDeclared = this._extractExpectedCount(block);
        if (blockDeclared !== null) {
          declaredCounts.push(blockDeclared);
        }
      }

      const qs = Array.isArray(block)
        ? block
        : (Array.isArray(block.questions)
          ? block.questions
          : (Array.isArray(block.cards)
            ? block.cards
            : (this._isSingleQuestionObject(block) ? [block] : [])));

      for (const q of qs) {
        const meta = extractMeta(q);
        let existingIdx = -1;

        if (meta.norm) {
          const exact = byExactNorm.get(meta.norm);
          if (exact !== undefined) {
            existingIdx = exact;
          } else {
            if (meta.norm.length >= 20) {
              const bucket = byPrefix20.get(meta.norm.slice(0, 20));
              if (bucket) {
                for (let b = 0; b < bucket.length; b++) {
                  const candIdx = bucket[b];
                  const mNorm = mergedMeta[candIdx].norm;
                  if (mNorm.length >= 20 && (mNorm.startsWith(meta.norm) || meta.norm.startsWith(mNorm))) {
                    existingIdx = candIdx;
                    break;
                  }
                }
              }
            }
            // Chỉ gộp theo cùng ID + 20 ký tự đầu khi ít nhất 1 câu bị dở dang/cụt,
            // tuyệt đối không làm rớt 2 câu hoàn chỉnh khác nhau dùng chung tiền tố "Trong lập trình..." ở Phần 1 & Phần 2
            if (existingIdx === -1 && meta.id && meta.norm.length >= 15) {
              const idBucket = byId.get(meta.id);
              if (idBucket) {
                const p20 = meta.norm.slice(0, 20);
                for (let b = 0; b < idBucket.length; b++) {
                  const candIdx = idBucket[b];
                  const mMeta = mergedMeta[candIdx];
                  if (
                    (meta.incomplete || mMeta.incomplete) &&
                    mMeta.norm.length >= 15 &&
                    mMeta.norm.slice(0, 20) === p20
                  ) {
                    existingIdx = candIdx;
                    break;
                  }
                }
              }
            }
          }
        }

        if (existingIdx !== -1) {
          if (this._isQuestionMoreComplete(q, mergedQuestions[existingIdx])) {
            mergedQuestions[existingIdx] = q;
            mergedMeta[existingIdx] = meta;
            indexQuestion(existingIdx, meta);
          }
        } else {
          const newIdx = mergedQuestions.length;
          mergedQuestions.push(q);
          mergedMeta.push(meta);
          indexQuestion(newIdx, meta);
        }
      }
    }

    mergedQuestions.forEach((q, idx) => {
      if (typeof q === 'object' && q !== null) {
        q.id = `q${idx + 1}`;
      }
    });

    let totalQuestions = null;
    if (declaredCounts.length === 1) {
      totalQuestions = declaredCounts[0];
    } else if (declaredCounts.length > 1) {
      const uniqueCounts = new Set(declaredCounts);
      if (uniqueCounts.size === 1 && declaredCounts[0] >= mergedQuestions.length) {
        totalQuestions = declaredCounts[0];
      } else {
        totalQuestions = declaredCounts.reduce((acc, n) => acc + n, 0);
      }
    }

    const mergedObj = {
      quiz_title: deckName,
      description: description,
      subject: subject,
      questions: mergedQuestions
    };
    if (totalQuestions !== null) {
      mergedObj.total_questions = totalQuestions;
    }
    return mergedObj;
  },

  /**
   * Main parse function. Detects format and validates items.
   * @param {string} rawInput 
   * @returns {Object} { deckName, description, cards: [...validCards], errors: [...errorList], rawCardsCount, expectedCount, missingCount, mergedBlockCount }
   */
  parse(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') {
      throw new Error('Dữ liệu nhập vào trống hoặc không hợp lệ.');
    }

    const trimmed = this._stripInvisibleChars(rawInput).trim();
    if (!trimmed) {
      throw new Error('Dữ liệu nhập vào trống hoặc không hợp lệ.');
    }

    // =========================================================================
    // FAST-PATH 1: Thử parse trực tiếp input gốc bằng JSON.parse chuẩn
    // Tuyệt đối không can thiệp chuỗi, không qua regex hay tách block nếu JSON đã chuẩn
    // =========================================================================
    try {
      const directParsed = JSON.parse(trimmed);
      if (this._isQuizJsonData(directParsed)) {
        return this._normalizeJsonData(directParsed, { mergedBlockCount: 1 });
      }
    } catch (_) {}

    // =========================================================================
    // FAST-PATH 2: Nếu toàn bộ input được bọc trong cặp ```json ... ``` ngoài cùng
    // Chỉ bóc cặp code fence ở đầu/cuối tuyệt đối (anchor ^ và $), không dùng regex global
    // =========================================================================
    if (trimmed.startsWith('```')) {
      const outerFenceMatch = trimmed.match(/^(`{3,})(?:jsonc?|json5)?\s*\r?\n([\s\S]*?)\r?\n\1\s*$/i);
      if (outerFenceMatch) {
        const unboxed = outerFenceMatch[2].trim();
        try {
          const directUnboxed = JSON.parse(unboxed);
          if (this._isQuizJsonData(directUnboxed)) {
            return this._normalizeJsonData(directUnboxed, { mergedBlockCount: 1 });
          }
        } catch (_) {}
      }
    }

    // =========================================================================
    // FALLBACK 1 & 2: Khi JSON.parse trực tiếp thất bại
    // Tách các khối JSON (tự sửa lỗi cú pháp, tự cứu block bị cụt, gộp multi-block & khử trùng lặp)
    // =========================================================================
    const jsonBlocks = this._extractJsonBlocks(trimmed);
    const parsedDataList = [];

    for (let i = 0; i < jsonBlocks.length; i++) {
      const repaired = this._tryRepairAndParseJson(jsonBlocks[i]);
      if (this._isQuizJsonData(repaired)) {
        parsedDataList.push(repaired);
      }
    }

    if (parsedDataList.length > 0) {
      const mergedJson = this._mergeParsedJsonBlocks(parsedDataList);
      if (this._isQuizJsonData(mergedJson)) {
        return this._normalizeJsonData(mergedJson, { mergedBlockCount: parsedDataList.length });
      }
    }

    // =========================================================================
    // FALLBACK 3: Thử phân tích định dạng Markdown / Text format (Câu 1: ... A. ... B. ...)
    // =========================================================================
    const textCards = this._parseTextFormat(trimmed);
    if (textCards && textCards.length > 0) {
      return {
        deckName: 'Bộ thẻ nhập từ văn bản',
        description: `Nhập tự động ${textCards.length} câu hỏi`,
        cards: textCards,
        errors: [],
        rawCardsCount: textCards.length,
        expectedCount: null,
        missingCount: 0,
        mergedBlockCount: 1
      };
    }

    // =========================================================================
    // FALLBACK 4: Báo lỗi nếu không nhận diện được định dạng nào
    // =========================================================================
    throw new Error(
      'Không thể nhận diện định dạng câu hỏi! Vui lòng dán dữ liệu theo định dạng JSON chuẩn (có quiz_title và questions) hoặc văn bản trắc nghiệm.'
    );
  },

  /**
   * Normalizes parsed JSON data into standard structure with isolated per-question validation.
   */
  _normalizeJsonData(data, meta = {}) {
    let deckName = 'Bộ thẻ mới';
    let description = '';
    let subject = '';
    let rawQuestions = [];
    let expectedCount = null;

    if (Array.isArray(data)) {
      rawQuestions = data;
    } else if (this._isSingleQuestionObject(data)) {
      deckName = data.topic || 'Bộ thẻ mới';
      rawQuestions = [data];
    } else if (typeof data === 'object' && data !== null) {
      deckName = data.quiz_title || data.deckName || data.name || data.title || 'Bộ thẻ mới';
      description = data.description || '';
      subject = (typeof data.subject === 'string' ? data.subject : (typeof data.subjectName === 'string' ? data.subjectName : (typeof data.subject_name === 'string' ? data.subject_name : ''))).trim();
      expectedCount = this._extractExpectedCount(data);
      rawQuestions = data.questions || data.cards || [];
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('Không tìm thấy danh sách câu hỏi ("questions") nào trong dữ liệu JSON.');
    }

    const validCards = [];
    const errors = [];

    rawQuestions.forEach((q, index) => {
      const qIndex = index + 1;
      const qId = (q && q.id) ? q.id : `q${qIndex}`;

      // 1. Validate 'question' field
      if (!q || !q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") bị thiếu nội dung câu hỏi ('question').`
        });
        return; // skip this invalid question without crashing the rest
      }

      // 1b. Extract optional question image (image / question_image / img)
      const questionImage = (typeof q.image === 'string' ? q.image : (typeof q.question_image === 'string' ? q.question_image : (typeof q.img === 'string' ? q.img : ''))).trim() || null;

      // 2. Validate 'options' field (must have >= 2 choices; also rescue object-map { a: "...", b: "..." })
      let rawOptionsList = q.options;
      if (!Array.isArray(rawOptionsList) && rawOptionsList && typeof rawOptionsList === 'object') {
        rawOptionsList = Object.entries(rawOptionsList).map(([k, v]) => {
          if (typeof v === 'object' && v !== null) {
            return { id: k, ...v };
          }
          return { id: k, text: String(v ?? '') };
        });
      }

      if (!Array.isArray(rawOptionsList) || rawOptionsList.length < 2) {
        errors.push({
          index: qIndex,
          id: qId,
          message: `Câu hỏi số ${qIndex} (id: "${qId}") phải có ít nhất 2 phương án lựa chọn ('options'). Hiện có: ${Array.isArray(rawOptionsList) ? rawOptionsList.length : 0}.`
        });
        return;
      }

      // Normalize options to [{ id, text, (image) }]
      const normalizedOptions = [];
      const optionIds = new Set();
      const defaultLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      for (let i = 0; i < rawOptionsList.length; i++) {
        const opt = rawOptionsList[i];
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

      // 2b. Kiểm tra phát hiện 2 đáp án trùng lặp nội dung (chuẩn hóa khoảng trắng và chữ thường)
      let hasDuplicateOptions = false;
      const seenOptTexts = new Set();
      for (let i = 0; i < normalizedOptions.length; i++) {
        const normOpt = (normalizedOptions[i].text || '').trim().replace(/\s+/g, ' ').toLowerCase();
        if (normOpt) {
          if (seenOptTexts.has(normOpt)) {
            hasDuplicateOptions = true;
            break;
          }
          seenOptTexts.add(normOpt);
        }
      }

      // 3. Validate 'correct_option_id' (or fallback camelCase / correct_answer / answer)
      const rawCorrectField = q.correct_option_id !== undefined
        ? q.correct_option_id
        : (q.correctOptionId !== undefined
          ? q.correctOptionId
          : (q.correct_answer !== undefined
            ? q.correct_answer
            : (q.correctAnswer !== undefined ? q.correctAnswer : undefined)));

      let correctId = null;
      if (rawCorrectField !== undefined && rawCorrectField !== null) {
        if (typeof rawCorrectField === 'number' && rawCorrectField >= 0 && rawCorrectField < normalizedOptions.length) {
          correctId = normalizedOptions[rawCorrectField].id;
        } else {
          const cleanedCorrect = String(rawCorrectField).trim().toLowerCase();
          if (optionIds.has(cleanedCorrect)) {
            correctId = cleanedCorrect;
          } else {
            // Cứu trường hợp AI thêm dấu chấm/ngoặc vào ID đáp án như "B." hoặc "D)" hoặc "option_a"
            const strippedLetterMatch = cleanedCorrect.match(/^(?:option[\s_-]*)?([a-g])(?:[\.\)\:]\s*|$)/i);
            if (strippedLetterMatch && optionIds.has(strippedLetterMatch[1].toLowerCase())) {
              correctId = strippedLetterMatch[1].toLowerCase();
            } else {
              correctId = cleanedCorrect;
            }
          }
        }
      }

      // Backward-compatible fallbacks for answer
      if ((!correctId || !optionIds.has(correctId)) && q.answer !== undefined) {
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
          message: `Câu hỏi số ${qIndex} (id: "${qId}") có 'correct_option_id' ("${rawCorrectField ?? ''}") không khớp với bất kỳ id nào trong options: [${Array.from(optionIds).join(', ')}].`
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
      let cleanQuestion = this.stripCitationArtifacts(q.question.trim());
      if (hasDuplicateOptions && !cleanQuestion.includes('[Cần kiểm tra: trùng đáp án]')) {
        cleanQuestion = `${cleanQuestion} [Cần kiểm tra: trùng đáp án]`;
      }

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
        source: (q.source && ['ai', 'lms', 'manual'].includes(q.source)) ? q.source : 'ai',
        hasDuplicateOptions: hasDuplicateOptions
      });
    });

    const missingCount = (expectedCount !== null && expectedCount > validCards.length)
      ? expectedCount - validCards.length
      : 0;

    return {
      deckName,
      description,
      subject,
      cards: validCards,
      errors: errors,
      rawCardsCount: rawQuestions.length,
      expectedCount: expectedCount,
      missingCount: missingCount,
      mergedBlockCount: meta.mergedBlockCount || 1
    };
  },

  /**
   * Parses plaintext / Markdown block format as fallback
   * Hỗ trợ nhiều block ```markdown / ```text, dấu đậm **Câu 1:** và **A.**, gạch đầu dòng và lọc lời dẫn đầu/giữa.
   */
  _parseTextFormat(text) {
    const cards = [];
    const cleanedText = this._stripInvisibleChars(text || '');
    const lines = cleanedText.split(/\r?\n/);
    let currentCard = null;

    const stripMdEmphasis = (str) => String(str || '')
      .replace(/^\s*(?:\*\*|__)+/, '')
      .replace(/(?:\*\*|__)+$/, '')
      .trim();

    const flushCurrent = () => {
      if (currentCard && currentCard.question && currentCard.options.length >= 2) {
        const defaultLetters = ['a', 'b', 'c', 'd', 'e'];
        let answerIndex = 0;
        const normalizedRawAns = stripMdEmphasis(currentCard.rawAnswer)
          .replace(/^(?:đáp án(?:\s+đúng)?|phương án|chọn|là)[\s:.-]*/i, '')
          .trim();
        const letterMatch = normalizedRawAns.match(/^([A-Da-d])(?:\b|[\.\)\:])/);
        if (letterMatch) {
          const idx = 'abcd'.indexOf(letterMatch[1].toLowerCase());
          if (idx >= 0 && idx < currentCard.options.length) answerIndex = idx;
        }

        const cleanedOpts = currentCard.options.map(t => this.stripCitationArtifacts(t));
        let hasDuplicateOptions = false;
        const seenOptTexts = new Set();
        for (let i = 0; i < cleanedOpts.length; i++) {
          let optText = cleanedOpts[i].trim();
          const prefixMatch = optText.match(/^(?:[A-Da-d])[\.\)\:]\s+(.*)$/s);
          if (prefixMatch && prefixMatch[1].trim()) optText = prefixMatch[1].trim();
          const normOpt = optText.replace(/\s+/g, ' ').toLowerCase();
          if (normOpt) {
            if (seenOptTexts.has(normOpt)) {
              hasDuplicateOptions = true;
              break;
            }
            seenOptTexts.add(normOpt);
          }
        }
        let qText = this.stripCitationArtifacts(stripMdEmphasis(currentCard.question.trim()));
        if (hasDuplicateOptions && !qText.includes('[Cần kiểm tra: trùng đáp án]')) {
          qText = `${qText} [Cần kiểm tra: trùng đáp án]`;
        }

        cards.push({
          id: `q${cards.length + 1}`,
          question: qText,
          options: cleanedOpts,
          rawOptions: cleanedOpts.map((t, i) => ({ id: defaultLetters[i], text: t })),
          answerIndex: answerIndex,
          correctOptionId: defaultLetters[answerIndex],
          explanation: this.stripCitationArtifacts(stripMdEmphasis((currentCard.explanation || '').trim())),
          topic: this.stripCitationArtifacts(stripMdEmphasis((currentCard.topic || 'Chung').trim())),
          difficulty: 'medium',
          tag: this.stripCitationArtifacts(stripMdEmphasis((currentCard.topic || 'Chung').trim())),
          source: 'ai',
          hasDuplicateOptions: hasDuplicateOptions
        });
      }
      currentCard = null;
    };

    const qRegex = /^(?:[-*•]\s+)?(?:#{1,6}\s*)?(?:\*\*|__)?(?:Câu(?:\s+hỏi)?\s*\d+|Question\s*\d+|Q\d+|\d+)(?:\*\*|__)?[\s:.)\-]+(?:\*\*|__)?\s*(.*)/i;
    const optRegex = /^(?:[-*•]\s+)?(?:\*\*|__)?([A-Da-d])[\.\)\:](?:\*\*|__)?\s+(.*)/;
    const ansRegex = /^(?:[-*•]\s+)?(?:\*\*|__)?(?:Đáp án(?:\s+đúng)?|Đ\/A|Answer|Correct(?:\s+Answer)?|Key)(?:\*\*|__)?[\s:.-]*(?:là\s+)?(?:\*\*|__)?\s*(.*)/i;
    const expRegex = /^(?:[-*•]\s+)?(?:\*\*|__)?(?:Giải thích|Explain|Explanation|Lý do|Note)(?:\*\*|__)?[\s:.-]+(?:\*\*|__)?\s*(.*)/i;
    const tagRegex = /^(?:[-*•]\s+)?(?:\*\*|__)?(?:Tag|Topic|Chủ đề|Chủ điểm|Category|Chương)(?:\*\*|__)?[\s:.-]+(?:\*\*|__)?\s*(.*)/i;
    const fenceLineRegex = /^```(?:markdown|md|text|txt|quiz)?\s*$/i;
    const dividerRegex = /^[-*_=]{3,}$/;
    const sectionNoiseRegex = /^(?:(?:#{1,6}\s*)|(?:\*\*|__))?(?:Phần|Part|Tiếp tục(?:\s+Phần)?|Section|Đợt)\s+\d+[^?]*$/i;

    const hasExplicitQuestions = lines.some(l => qRegex.test(l.trim()));

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (fenceLineRegex.test(trimmed) || dividerRegex.test(trimmed)) continue;
      if (sectionNoiseRegex.test(trimmed)) continue;

      if (!currentCard && /^#+\s+(.+)/.test(trimmed) && !qRegex.test(trimmed)) {
        continue;
      }

      const qMatch = trimmed.match(qRegex);
      if (qMatch && (!currentCard || currentCard.options.length >= 2 || currentCard.options.length === 0)) {
        flushCurrent();
        currentCard = {
          question: stripMdEmphasis(qMatch[1] || trimmed),
          options: [],
          rawAnswer: 'A',
          explanation: '',
          topic: 'Chung'
        };
        continue;
      }

      if (!currentCard) {
        if (hasExplicitQuestions) {
          continue; // Bỏ qua lời dẫn mở đầu trước Câu 1
        }
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
        const letter = optMatch[1].toUpperCase();
        const optBody = stripMdEmphasis(optMatch[2]);
        currentCard.options.push(`${letter}. ${optBody}`);
        continue;
      }

      const ansMatch = trimmed.match(ansRegex);
      if (ansMatch) {
        currentCard.rawAnswer = stripMdEmphasis(ansMatch[1]);
        continue;
      }

      const expMatch = trimmed.match(expRegex);
      if (expMatch) {
        currentCard.explanation = stripMdEmphasis(expMatch[1]);
        continue;
      }

      const tagMatch = trimmed.match(tagRegex);
      if (tagMatch) {
        currentCard.topic = stripMdEmphasis(tagMatch[1]);
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
    const parsedCount = parseInt(count, 10);
    const safeCount = Number.isFinite(parsedCount) && parsedCount >= 1 ? parsedCount : 10;
    const rawDiff = String(difficulty || 'medium').trim().toLowerCase();
    const safeDifficulty = ['easy', 'medium', 'hard'].includes(rawDiff) ? rawDiff : 'medium';

    return `CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json CHỨA TOÀN BỘ 100% CÂU HỎI TRONG 1 LẦN TRẢ LỜI. Toàn bộ phản hồi PHẢI bắt đầu ngay bằng \`\`\`json và kết thúc ngay bằng \`\`\` duy nhất; CẤM TUYỆT ĐỐI tự ý chia thành Phần 1/Phần 2, CẤM mở block \`\`\`json thứ hai, CẤM dừng giữa chừng bảo người dùng gõ 'tiếp', CẤM viết lời dẫn đầu/cuối, CẤM chèn lời giải thích rườm rà hay bình luận // giữa các câu hỏi.

Hãy đóng vai một chuyên gia giáo dục và biên soạn CHÍNH XÁC ${safeCount} câu hỏi trắc nghiệm ôn tập chất lượng cao (đánh số thứ tự rõ ràng từ 1 đến ${safeCount}, tương ứng \`"id": "q1"\` đến \`"q${safeCount}"\`) về chủ đề: "${topic || '[DÁN NỘI DUNG / CHỦ ĐỀ / TÀI LIỆU TẠI ĐÂY]'}".

Yêu cầu thực hiện nghiêm ngặt 5 nguyên tắc sau:

1. QUY TRÌNH ĐỌC HẾT TÀI LIỆU, COMBINE KIẾN THỨC & ÉP ĐỦ 100% SỐ CÂU (1 -> ${safeCount}):
- Quy trình phân tích tài liệu nguồn BẮT BUỘC trước khi sinh câu hỏi:
  + Bước 1 — Quét toàn văn: Bắt buộc quét toàn bộ từ đầu đến cuối tất cả các mục/chương/slide, định nghĩa, bảng biểu, ví dụ và phần kết luận của tài liệu nguồn; tuyệt đối không chỉ lấy vài trang/slide đầu rồi bỏ sót phần giữa và phần cuối.
  + Bước 2 — Phân bổ đều phủ kín mọi phần: Phân bổ đều ${safeCount} câu hỏi phủ kín 100% các mục/chương/slide trọng tâm của tài liệu nguồn; ghi rõ tên Chương/Mục cụ thể vào trường \`"topic"\` của từng câu để không dồn cục một phần.
  + Bước 3 — Kết hợp kiến thức liên phần: Phân tầng tư duy hợp lý (Nhận biết ~25–30%, Thông hiểu ~35–40%, Vận dụng/Phân tích ~30–40%). Với các câu hỏi mức độ hiểu và vận dụng/phân tích, BẮT BUỘC kết hợp (combine) kiến thức liên kết giữa các phần/chương/slide khác nhau (so sánh cơ chế, đối chiếu điều kiện, xâu chuỗi nhân-quả hoặc áp dụng nguyên lý ở mục này vào tình huống ở mục khác), tuyệt đối không cắt dán nguyên văn 1 câu đơn lẻ.
- Cơ chế ép đủ chính xác ${safeCount} câu hỏi:
  + Đánh số thứ tự liên tục từ \`"q1"\` đến \`"q${safeCount}"\` và khai báo \`"total_questions": ${safeCount}\`.
  + Trước khi kết thúc mảng \`questions\`, BẮT BUỘC tự đối chiếu đếm đủ đúng ${safeCount} câu (không thiếu dù chỉ 1 câu); CẤM viết tắt kiểu \`...\`, \`// các câu còn lại tương tự\`, CẤM gộp câu, CẤM tự ý giảm số lượng câu hoặc dừng giữa chừng.
- Ghép ảnh & Đủ 100% số câu: Xuất toàn bộ câu hỏi trong 1 khối \`\`\`json duy nhất. Nếu input gồm nhiều ảnh chụp lộn xộn thứ tự, phải tự đối chiếu số câu và ngữ cảnh để ghép nối phần đầu - phần cuối bị cắt qua mép ảnh lại thành câu hoàn chỉnh trước khi xuất. Mỗi câu phải có đủ 4 đáp án (a, b, c, d), 4 đáp án (a, b, c, d) bắt buộc phải khác nhau hoàn toàn, cấm trùng lặp nội dung; bảng số liệu chuyển thành bảng Markdown (\`|...|\`). Với bài toán lời văn dài quen thuộc từ sách giáo khoa/đề mẫu, hãy diễn đạt lại câu dẫn ngắn gọn, tự nhiên (giữ nguyên 100% số liệu, bảng biểu, công thức và đáp án) để tránh bị bộ lọc hệ thống ngắt giữa chừng.

Schema JSON chuẩn tuyệt đối tương thích 100% với bộ parser (bắt buộc giữ nguyên tên trường):
\`\`\`json
{
  "quiz_title": "${topic || 'Chương 3: Đạo hàm'}",
  "total_questions": ${safeCount},
  "questions": [
    {
      "id": "q1",
      "topic": "${topic || 'Đạo hàm'}",
      "difficulty": "${safeDifficulty}",
      "question": "Đạo hàm của $f(x) = x^2$ là gì?",
      "image": "",
      "options": [
        { "id": "a", "text": "$2x$", "image": "" },
        { "id": "b", "text": "$x^2$", "image": "" },
        { "id": "c", "text": "$2$", "image": "" },
        { "id": "d", "text": "$x$", "image": "" }
      ],
      "correct_option_id": "a",
      "explanation": "Áp dụng công thức $(x^n)' = n \\\\cdot x^{n-1}$ với $n = 2$, ta có $(x^2)' = 2x$. Phương án $x^2$ sai do giữ nguyên hàm gốc; phương án $2$ sai do nhầm sang đạo hàm cấp hai; phương án $x$ sai do thiếu hệ số nhân $2$."
    }
  ]
}
\`\`\`

2. Xử lý câu bị thiếu dữ kiện/ảnh:
   - Nếu vẫn thiếu phần đề bài sau khi đã ghép các ảnh: ưu tiên dùng tìm kiếm (nếu có) theo dữ kiện sẵn có; chỉ lấy bổ sung khi tìm được câu gốc khớp chính xác 100% số liệu/ngữ cảnh (cấm tự bịa số liệu). Nếu không tìm được, bỏ câu đó khỏi mảng \`questions\` và ghi chú số câu bị thiếu vào trường \`"description"\` ngay bên trong JSON (tuyệt đối không viết văn bản ngoài khối \`\`\`json).
   - Nếu đã đủ đề bài và đáp án đúng nhưng chỉ bị cắt mất 1 đáp án nhiễu: tự bổ sung 1 phương án nhiễu hợp lý cho đủ 4 lựa chọn và ghi \`[Đã bổ sung nhiễu]\` ở cuối \`question\`.
   - Nếu câu cần xem hình vẽ/đồ thị gốc mà không đọc được tọa độ: giữ nguyên câu hỏi, để "image": "" và ghi \`[Cần hình minh họa]\` ở cuối \`question\`.

3. KỶ LUẬT CÚ PHÁP JSON & ĐẦU RA DUY NHẤT 1 BLOCK (CHỐNG LỖI PARSE):
- Xuất duy nhất 1 khối \`\`\`json ... \`\`\` liền mạch, không viết văn bản trước/sau khối, không chèn comment \`//\` hoặc \`/* */\`, không thêm dấu phẩy thừa ở phần tử cuối.
- CẤM TUYỆT ĐỐI: nối chuỗi kiểu code (" + ", ' + '), xuống dòng thô trong chuỗi JSON (mọi xuống dòng phải dùng \\n), hoặc tự ngắt để viết lại từ q1 giữa chừng khi gặp câu có hình ảnh/bảng biểu.
- CẤM TUYỆT ĐỐI việc chèn các ký hiệu trích dẫn nguồn hoặc đánh dấu trang/đoạn (như [cite: 1, 2], [cite_start], [cite_end], [1], [2], [source], 【1†source】). Mọi lựa chọn và câu hỏi phải có văn phong đồng nhất.
- Chỉ xuất tiếp ở lượt sau nếu chạm giới hạn độ dài của model (mỗi lượt là 1 block JSON hoàn chỉnh, nối tiếp thứ tự câu, tuyệt đối không lặp lại câu cũ).
- Escape đúng \\" và \\\\ (đặc biệt với LaTeX như \\\\frac, \\\\le, \\\\ge và ký tự C như \\\\0, \\\\n). Trong văn bản giải thích/câu hỏi, ưu tiên dùng backtick \`...\` thay cho ngoặc kép " để hạn chế lỗi escape.
- Nếu đề bài hoặc phương án có ký hiệu đô-la tiền tệ (ví dụ $50), bắt buộc ghi chữ USD (ví dụ: 50 USD) thay vì ký hiệu $ để không làm vỡ bộ render công thức toán LaTeX ($...$, $$...$$) của app.
- Với mã nguồn/lệnh máy tính trong câu hỏi hoặc giải thích:
  + Đoạn code nhiều dòng dùng block \`\`\`c\\n...\\n\`\`\` hoặc \`\`\`text\\n...\\n\`\`\` (có \\n tách khỏi câu hỏi, tuyệt đối không dính liền 1 dòng).
  + Tên biến hoặc lệnh ngắn 1 dòng (như \`printf()\`, \`int _dem2;\`, \`SELECT\`) ưu tiên dùng inline backtick \`...\`.

4. CHIẾN LƯỢC HYBRID XỬ LÝ HÌNH ẢNH & BẢNG BIỂU:
- Chiến lược Hybrid xử lý đề thi có hình ảnh:
  + Bắt buộc OCR và chuyển toàn bộ sang Text + LaTeX ($...$, $$...$$) + Bảng Markdown đối với ảnh chụp chữ, công thức Toán/Lý/Hóa, bảng số liệu (KHÔNG giữ dạng ảnh).
  + Ảnh sơ đồ (ER, UML, mạch điện) hoặc đồ thị hình học: KHÔNG diễn giải thay thế bằng văn bản (làm mất ý nghĩa câu hỏi); giữ cấu trúc "image": "" trên câu hỏi hoặc options[].image để người dùng dán ảnh trực tiếp trên app.

5. CHẤT LƯỢNG CÂU HỎI, PHƯƠNG ÁN NHIỄU & GIẢI THÍCH CHI TIẾT:
- Giữ nguyên vẹn nội dung câu hỏi và đủ 4 đáp án (không tự ý rút gọn).
- Tiêu chuẩn 4 phương án lựa chọn (chặn phương án nhiễu kém chất lượng):
  + 4 lựa chọn phải đồng đều độ dài, đồng nhất cấu trúc ngữ pháp và mức độ chi tiết (CẤM đáp án đúng quá dài/chi tiết trong khi 3 đáp án nhiễu quá ngắn sơ sài hoặc ngược lại).
  + 3 phương án nhiễu phải hợp lý về mặt học thuật: xây dựng từ lỗi sai nhận thức phổ biến, khái niệm gần nghĩa, nhầm điều kiện biên hoặc sai bước suy luận bám sát tài liệu gốc.
  + CẤM tạo đáp án nhiễu lộ liễu, vô lý, hài hước hoặc lệch chủ đề; CẤM lặp y nguyên cụm từ khóa đặc trưng từ đề bài chỉ vào đáp án đúng; CẤM dùng lựa chọn lười biếng kiểu "Tất cả đều đúng", "Cả A và B", "Không có đáp án nào đúng" (trừ khi trích nguyên văn từ đề thi gốc); phân bổ cân bằng \`correct_option_id\` giữa \`a, b, c, d\`.
- Quy tắc BẮT BUỘC cho trường "explanation" (1–2 câu cực ngắn gọn, đi thẳng vào công thức/lỗi sai, bám sát tài liệu gốc):
  + CẤM GỌI TÊN CHỮ CÁI ĐÁP ÁN (như A, B, C, D, "phương án A", "loại B, C, D") vì app có tính năng đảo thứ tự đáp án (shuffle); bắt buộc phải giải thích trực tiếp bằng nội dung, giá trị hoặc đặc điểm của phương án (ví dụ: "Phương án $x^2$ sai do...", "Loại các phương án trừ $x_4$ hoặc thêm biến giả $x_1^g$...").
  + Nêu rõ TẠI SAO đáp án đúng là đúng dựa trên kiến thức/công thức trong tài liệu gốc (1 câu súc tích).
  + Nêu rõ TẠI SAO các phương án nhiễu còn lại sai (chỉ ra ngắn gọn lỗi sai cốt lõi trong 1 câu; không viết dài dòng để tiết kiệm token tối đa).
  + CẤM TUYỆT ĐỐI viết câu mẫu sáo rỗng hoặc chung chung kiểu "Theo quy tắc chuẩn, đáp án đúng là...".
  + CHỐNG LƯỜI KHI SINH NHIỀU CÂU: Mỗi câu hỏi phải có lời giải thích riêng biệt bám sát ngữ cảnh đề bài, không lặp lại khuôn mẫu câu.

KIỂM TRA BẮT BUỘC TRƯỚC KHI ĐÓNG \`\`\`: (1) Duy nhất 1 khối \`\`\`json hợp lệ, không văn bản ngoài khối; (2) Tự đối chiếu đếm đủ đúng ${safeCount} câu từ "q1" đến "q${safeCount}" khớp "total_questions": ${safeCount}, không viết tắt \`...\`; (3) Đã quét toàn bộ từ đầu đến cuối tài liệu, phân bổ đều mọi phần và có câu combine kiến thức liên phần; (4) 4 lựa chọn đồng đều độ dài, nhiễu hợp lý học thuật, giải thích bám sát tài liệu gốc và không gọi chữ cái đáp án.`;
  },

  /**
   * Generates strict AI Prompt for rewriting flagged questions (Question Bank)
   */
  generateFlaggedRewritePrompt(flaggedCards = []) {
    const list = Array.isArray(flaggedCards) ? flaggedCards : [];
    const total = list.length;
    const defaultLetters = ['a', 'b', 'c', 'd'];

    const payload = {
      role_instruction: `Bạn là chuyên gia giáo dục. Viết lại CHÍNH XÁC ${total} câu hỏi trắc nghiệm bị người học gắn cờ dưới đây cho thật mạch lạc, chính xác học thuật và chuẩn sư phạm, bảo toàn công thức LaTeX ($...$, $$...$$), bảng Markdown và khối code. CẤM TUYỆT ĐỐI chèn ký hiệu trích dẫn ([cite: ...], [cite_start], [cite_end], [1], 【...】).`,
      quality_rules: [
        `CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json LIỀN MẠCH (bắt đầu ngay bằng \`\`\`json và kết thúc ngay bằng \`\`\`), không chia nhiều phần, không lời dẫn đầu/cuối, không comment //.`,
        `Đánh số tuần tự từ "q1" đến "q${total}", khai báo "total_questions": ${total}, tự đối chiếu đếm đủ đúng ${total} câu trước khi đóng mảng; CẤM viết tắt \`...\`, CẤM gộp câu hoặc bỏ sót câu.`,
        `4 lựa chọn (a, b, c, d) bắt buộc khác nhau hoàn toàn, đồng đều độ dài và cấu trúc ngữ pháp; phương án nhiễu phải hợp lý về mặt học thuật, CẤM tạo đáp án nhiễu lộ liễu hoặc lặp y nguyên từ khóa dễ đoán.`,
        `Trường "explanation" dài 1–2 câu ngắn gọn bám sát kiến thức gốc: nêu lý do đúng và lỗi sai của phương án nhiễu; CẤM GỌI TÊN CHỮ CÁI ĐÁP ÁN (A, B, C, D) vì app đảo thứ tự đáp án (shuffle).`,
        `Trường "topic" bắt buộc phân loại theo Chương ('Chương 1: ...', 'Chương 2: ...') đồng nhất.`
      ],
      output_format: `Trả về duy nhất 1 khối \`\`\`json chuẩn cấu trúc { "quiz_title": "...", "total_questions": ${total}, "questions": [{ "id": "q1", "topic": "...", "difficulty": "easy|medium|hard", "question": "...", "image": "", "options": [{ "id": "a", "text": "...", "image": "" }, ...], "correct_option_id": "a", "explanation": "..." }] } để dán trực tiếp vào app.`,
      questions_to_improve: list.map((c, qIdx) => {
        const cleanOptions = (Array.isArray(c.rawOptions) && c.rawOptions.length >= 2)
          ? c.rawOptions.map((o, idx) => ({
            id: (o && o.id ? String(o.id).toLowerCase() : defaultLetters[idx]) || `opt_${idx + 1}`,
            text: (o && o.text !== undefined) ? String(o.text).trim() : ''
          }))
          : (c.options || []).map((opt, idx) => ({
            id: defaultLetters[idx] || `opt_${idx + 1}`,
            text: String(opt || '').replace(/^[A-Da-d][\.\)\:]\s+/, '').trim()
          }));
        const correctId = (c.correctOptionId || defaultLetters[c.answerIndex] || 'a').toLowerCase();
        return {
          id: `q${qIdx + 1}`,
          original_id: c.id,
          topic: c.topic || c.tag || 'Chung',
          difficulty: c.difficulty || 'medium',
          question: c.question || '',
          options: cleanOptions,
          correct_option_id: correctId,
          explanation: c.explanation || ''
        };
      })
    };

    return `CHỈ XUẤT DUY NHẤT 1 KHỐI \`\`\`json CHỨA ĐỦ ${total} CÂU HỎI ("q1" ĐẾN "q${total}") TRONG 1 LẦN TRẢ LỜI. CẤM viết lời dẫn đầu/cuối, CẤM chia nhiều block, CẤM viết tắt \`...\`, CẤM bỏ sót câu.

Hãy viết lại toàn bộ ${total} câu hỏi trắc nghiệm sau đây cho thật chuẩn xác, sư phạm, đồng đều độ dài 4 phương án và mạch lạc theo đúng quy tắc trong JSON đầu vào:

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\``;
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
