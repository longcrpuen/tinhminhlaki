# ĐẶC TẢ KỸ THUẬT ĐỢT 1W (`promt1w.md`)
## Sửa Triệt Để Lỗi Cắt Nhầm Đáp Án Ở Cả 3 Tầng: Parser (`js/parser.js`), Render (`js/app.js`) & Tự Động Khôi Phục Dữ Liệu Đã Hỏng Trong IndexedDB (`js/db.js`)

---

## 0. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (TẠI SAO SỬA `app.js` VẪN CHƯA HẾT LỖI?)

Qua đối chiếu trực tiếp ảnh chụp màn hình (`q61`, `q4`, `q77`) với mã nguồn `js/parser.js`, `js/app.js`, `js/db.js` và file dữ liệu gốc `mol_tinhminhlakey.json`, nguyên nhân khiến đáp án vẫn hiển thị sai (`A. R. – s`, `B. X. s ✓`, `C. U. s`, `D. R. + s` và `B. > AB`, `C. > BC ✓`, `A. > B`, `D. > B và A-> C ✓`) nằm ở **3 mắt xích liên hoàn**:

### 1. Thủ phạm chính nằm ở `AIParser._normalizeJsonData` trong `js/parser.js` (Dòng 86539–86553)
Ngay tại thời điểm import file `mol_tinhminhlakey.json`, trước khi lưu vào IndexedDB, `js/parser.js` thực thi vòng lặp chuẩn hóa `displayOptions`:
```javascript
// CODE LỖI HIỆN TẠI TRONG js/parser.js:
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
```
Vòng lặp `while (/^[A-Za-z][\s.):\-]+/.test(clean))` này đã **phá hủy dữ liệu gốc ngay lúc import**:
- **Với câu `q61`** (`options`: `"r – s"`, `"r x s"`, `"r U s"`, `"r + s"`):
  - `"r – s"` bắt đầu bằng `"r "` (`[A-Za-z]` + khoảng trắng `\s`). Vòng lặp xóa mất `"r "`, gán `letter = "R"`, `clean = "– s"` $\rightarrow$ tạo ra `"R. – s"`.
  - `"r x s"`: Vòng 1 xóa `"r "`, vòng 2 xóa tiếp `"x "`, gán `letter = "X"`, `clean = "s"` $\rightarrow$ tạo ra `"X. s"`.
  - `"r U s"`: Vòng 1 xóa `"r "`, vòng 2 xóa tiếp `"U "`, gán `letter = "U"`, `clean = "s"` $\rightarrow$ tạo ra `"U. s"`.
  - `"r + s"`: Xóa `"r "`, gán `letter = "R"`, `clean = "+ s"` $\rightarrow$ tạo ra `"R. + s"`.
- **Với câu `q4` & `q77`** (`options`: `"A -> AB"`, `"A-> BC"`, `"A-> B"`, `"A -> C"`, `"A -> B và A-> C"`):
  - Vì tập ký tự `[\s.):\-]+` chứa cả **khoảng trắng (`\s`)** lẫn **dấu gạch ngang (`\-`)**, mọi biểu thức phụ thuộc hàm bắt đầu bằng `"A ->"` hoặc `"A->"` đều bị khớp phần đầu `"A -"` / `"A-"`.
  - Vòng lặp nuốt mất chữ `"A"` và dấu `"-"`, chỉ để lại phần đuôi `"> AB"`, `"> BC"`, `"> B"`, `"> C"`, `"> B và A-> C"`, rồi ghép thành `"A. > AB"`, `"A. > BC"`, `"A. > B"`, `"A. > C"`, `"A. > B và A-> C"`.

### 2. Tại sao sau khi sửa `cleanOptionText` ở `js/app.js`, màn hình lại hiện `A. R. – s`, `B. X. s ✓` và `B. > AB`?
- Bởi vì bộ thẻ trong **IndexedDB (`MindSparksQuizDB -> cards`)** đã lưu mảng `card.options` bị cắt hỏng từ lần import trước:
  - `q61` đang lưu trong IndexedDB: `card.options = ["R. – s", "X. s", "U. s", "R. + s"]`. Khi `cleanOptionText` mới chỉ cắt tiền tố `A-D`, các chữ `R.`, `X.`, `U.` không bị cắt mà được ghép thêm nhãn vị trí `A.`, `B.`, `C.`, `D.` vào trước $\rightarrow$ thành **`A. R. – s`**, **`B. X. s`**, **`C. U. s`**, **`D. R. + s`**!
  - `q4` & `q77` đang lưu trong IndexedDB: `card.options = ["A. AA-> C", "A. > AB", "A. > BC", "D. AB-> BC"]`. Khi `cleanOptionText` cắt bỏ `"A. "` và gắn nhãn vị trí `B.`, `C.` vào, phần `"A -"` đã bị mất từ trong DB nên màn hình chỉ còn **`B. > AB`**, **`C. > BC ✓`**!

### 3. Cơ chế Tự Phục Hồi 100% Dữ Liệu Gốc Không Cần Xóa Học Lại (`card.rawOptions` + `card.explanation`)
Khi kiểm tra `js/parser.js` (dòng 86463–86490 & 86559), mỗi thẻ được tạo từ `AIParser._normalizeJsonData` đều đã lưu kèm trường **`card.rawOptions: normalizedOptions`** chứa **100% chuỗi `opt.text` nguyên bản từ JSON chưa qua vòng lặp cắt chuỗi** (`{ id: "a", text: "r – s" }`, `{ id: "b", text: "r x s" }`, `{ id: "b", text: "A -> AB" }`, `{ id: "c", text: "A-> BC" }`...).
Do đó, ta sẽ:
1. **Sửa tận gốc `js/parser.js`** để mọi lần import về sau không bao giờ cắt nhầm biến đơn hay mũi tên `->`.
2. **Sửa `js/app.js`** để ưu tiên đọc nội dung gốc từ `card.rawOptions` (nếu có) và chuẩn hóa việc bóc tách/hiển thị đáp án trên mọi chế độ.
3. **Bổ sung hàm Tự Phục Hồi (`healCorruptedCardOptions`) ngay trong `db.ensureDataIntegrity()` (`js/db.js`)**: Khi mở hoặc F5 ứng dụng, hệ thống tự động quét toàn bộ thẻ trong IndexedDB, khôi phục lại `card.options` nguyên vẹn từ `card.rawOptions` (kèm bộ quy tắc phục hồi dự phòng từ `card.explanation` và mẫu mũi tên `> ` / đại số quan hệ nếu thẻ không có `rawOptions`), lưu đè lại vào IndexedDB mà **giữ nguyên 100% lịch sử học tập SRS (`card.srs`, `card.stats`)**.

---

## 1. CẬP NHẬT TẦNG PARSER (`js/parser.js`)

### 1.1. Sửa `AIParser._normalizeJsonData(data)` trong `js/parser.js`
Tìm đoạn xử lý `correctId` (khoảng dòng 86500–86516) và đoạn tạo `displayOptions` (khoảng dòng 86539–86554) trong `js/parser.js`, thay thế bằng code chuẩn sau:

```javascript
      // Backward-compatible fallbacks for answer / correctAnswer
      if (!correctId && q.answer !== undefined) {
        if (typeof q.answer === 'number' && q.answer >= 0 && q.answer < normalizedOptions.length) {
          correctId = normalizedOptions[q.answer].id;
        } else if (typeof q.answer === 'string') {
          const cleanAns = q.answer.trim().toLowerCase();
          if (optionIds.has(cleanAns)) {
            correctId = cleanAns;
          } else {
            // CHỈ khớp chữ cái đơn A, B, C, D nếu chuỗi là chữ cái độc lập hoặc có dấu chấm/ngoặc ("A", "A.", "B)")
            // Tuyệt đối KHÔNG dùng /^([a-d])/i vì sẽ khớp nhầm chữ "A" ở đầu đáp án "A -> BC" hoặc "AB-> BC"!
            const letterMatch = cleanAns.match(/^([a-d])(?:[\.\)\:]\s*|$)/i);
            if (letterMatch && optionIds.has(letterMatch[1].toLowerCase())) {
              correctId = letterMatch[1].toLowerCase();
            } else {
              // Ưu tiên khớp chính xác toàn bộ nội dung trước, sau đó mới khớp includes
              const exactFound = normalizedOptions.find(o => o.text.trim().toLowerCase() === cleanAns);
              const found = exactFound || normalizedOptions.find(o => o.text.toLowerCase().includes(cleanAns));
              if (found) correctId = found.id;
            }
          }
        }
      }
```

Và ngay bên dưới (khoảng dòng 86539–86554), **XÓA BỎ hoàn toàn vòng lặp `while (/^[A-Za-z][\s.):\-]+/.test(clean))`** và thay thế đoạn tạo `displayOptions` bằng:

```javascript
      // Convert options for display: normalize to single clean "A. Text"
      // TUYỆT ĐỐI KHÔNG dùng /^[A-Za-z][\s.):\-]+/ vì sẽ nuốt mất biến đơn ("r – s", "r x s", "r U s", "r + s")
      // và nuốt mất vế trái mũi tên suy diễn ("A -> AB", "A-> BC", "A -> B và A-> C")!
      const displayOptions = normalizedOptions.map((opt, idx) => {
        let clean = String(opt.text ?? '').trim();
        const letter = (defaultLetters[idx] || `${idx + 1}`).toUpperCase();
        // Chỉ bóc tiền tố nhãn trắc nghiệm nếu là chữ cái A-D theo sau bởi dấu chấm (.), ngoặc đơn ()) hoặc hai chấm (:) VÀ khoảng trắng
        const prefixMatch = clean.match(/^(?:[A-Da-d])[\.\)\:]\s+(.*)$/s);
        if (prefixMatch && prefixMatch[1].trim().length > 0) {
          clean = prefixMatch[1].trim();
        }
        return `${letter}. ${clean}`;
      });
```

### 1.2. Sửa `_parseTextFormat(text)` trong `js/parser.js` (Khoảng dòng 86614)
Trong hàm `_parseTextFormat(text)` của `js/parser.js`, tìm dòng:
```javascript
const optRegex = /^\s*([A-Da-d])[\s.):-]+\s*(.*)/;
```
Thay thế bằng biểu thức chính quy chặt chẽ (bắt buộc phải có dấu `.`, `)` hoặc `:` sau `A-D`, không dùng `\s` hay `-` để tránh cắt nhầm dòng công thức `A -> BC`):
```javascript
const optRegex = /^\s*([A-Da-d])[\.\)\:]\s+(.*)/;
```

---

## 2. CẬP NHẬT TẦNG DATABASE (`js/db.js`) — TỰ ĐỘNG KHÔI PHỤC 100% THẺ ĐÃ BỊ CẮT HỎNG TRONG INDEXEDDB

Mở file `js/db.js`, thêm phương thức `healCorruptedCardOptions(card)` vào class `QuizDatabase` và gọi tự động ngay trong `ensureDataIntegrity()` để toàn bộ các câu hỏi đã lưu trong IndexedDB (như `q61`, `q4`, `q77`, `q103`... của bộ đề Cơ sở dữ liệu) được phục hồi nguyên trạng ngay lập tức khi tải trang mà không cần xóa dữ liệu hay mất tiến độ học:

```javascript
  /**
   * Tự động phát hiện và khôi phục các phương án đáp án (options) đã bị vòng lặp regex cũ
   * trong parser.js cắt hỏng ("R. – s", "X. s", "U. s", "R. + s", "A. > AB", "A. > BC", "> B"...).
   * Giữ nguyên 100% tiến độ học SRS và thống kê của thẻ.
   * @param {Object} card
   * @returns {boolean} true nếu thẻ vừa được sửa và cần lưu lại vào IndexedDB
   */
  healCorruptedCardOptions(card) {
    if (!card || card.type === 'numeric' || !Array.isArray(card.options) || card.options.length === 0) {
      return false;
    }

    const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const lowerLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    let mutated = false;

    // Bước 1: Giải quyết index đáp án đúng chuẩn xác từ correct_option_id / correctOptionId / answerIndex
    let resolvedAnswerIdx = typeof card.answerIndex === 'number' && card.answerIndex >= 0 ? card.answerIndex : 0;
    const rawCid = card.correct_option_id ?? card.correctOptionId ?? null;
    if (rawCid !== null && rawCid !== undefined && String(rawCid).trim() !== '') {
      const cid = String(rawCid).trim().toLowerCase();
      const letterIdx = lowerLetters.indexOf(cid);
      if (letterIdx !== -1 && letterIdx < card.options.length) {
        resolvedAnswerIdx = letterIdx;
      }
    }
    if (card.answerIndex !== resolvedAnswerIdx) {
      card.answerIndex = resolvedAnswerIdx;
      mutated = true;
    }
    const expectedCid = lowerLetters[resolvedAnswerIdx] || 'a';
    if (card.correct_option_id !== expectedCid) {
      card.correct_option_id = expectedCid;
      mutated = true;
    }
    if (card.correctOptionId !== expectedCid) {
      card.correctOptionId = expectedCid;
      mutated = true;
    }

    // Helper: Làm sạch tiền tố hợp lệ duy nhất (A. / B) / C:) mà không bao giờ ăn vào nội dung
    const normalizeSingleText = (rawStr) => {
      let s = String(rawStr ?? '').trim();
      const m = s.match(/^(?:[A-Da-d])[\.\)\:]\s+(.*)$/s);
      if (m && m[1].trim().length > 0) {
        s = m[1].trim();
      }
      return s;
    };

    // Helper: Kiểm tra xem một chuỗi rawOption có còn nguyên vẹn (không bị dính lỗi "> " hay "X. s") hay không
    const isCleanRawText = (txt) => {
      if (!txt || typeof txt !== 'string') return false;
      const t = txt.trim();
      if (/^(?:[A-Za-z]\.\s*)?>\s*\S/.test(t)) return false;
      if (/^(?:R\.\s*[–\-+]\s*s|X\.\s*s|U\.\s*s)$/i.test(t)) return false;
      return true;
    };

    // Bước 2: Khôi phục ưu tiên từ card.rawOptions (nơi lưu nguyên bản opt.text từ JSON lúc import)
    if (Array.isArray(card.rawOptions) && card.rawOptions.length === card.options.length) {
      const rawTexts = card.rawOptions.map(ro => (typeof ro === 'object' && ro !== null) ? String(ro.text ?? '').trim() : String(ro ?? '').trim());
      if (rawTexts.every(isCleanRawText)) {
        const rebuiltOptions = rawTexts.map((rt, idx) => {
          const clean = normalizeSingleText(rt);
          const letter = defaultLetters[idx] || `${idx + 1}`;
          return `${letter}. ${clean}`;
        });

        const currentJoined = JSON.stringify(card.options);
        const rebuiltJoined = JSON.stringify(rebuiltOptions);
        if (currentJoined !== rebuiltJoined) {
          card.options = rebuiltOptions;
          mutated = true;
        }
        return mutated;
      }
    }

    // Bước 3: Cơ chế khôi phục dự phòng (Fallback Heuristics) nếu thẻ không có rawOptions hoặc rawOptions bị ghi đè
    // Trích xuất đáp án đúng từ câu giải thích (VD: "... phương án chính xác là: r x s." hoặc "... phương án chính xác là: A-> BC.")
    let expAnswerHint = '';
    if (typeof card.explanation === 'string' && card.explanation.includes('phương án chính xác là:')) {
      const parts = card.explanation.split('phương án chính xác là:');
      expAnswerHint = parts[parts.length - 1].trim().replace(/\.$/, '').trim();
    }

    // Nhận diện quy luật mũi tên trong câu hỏi ("A->" hay "A ->")
    const qText = String(card.question || '');
    const prefersSpacedArrow = /([A-Za-z])\s+->/.test(qText) || /([A-Za-z])\s+->/.test(expAnswerHint);
    const defaultArrowPrefix = prefersSpacedArrow ? 'A -> ' : 'A-> ';

    const healedTexts = card.options.map((opt, idx) => {
      let raw = (typeof opt === 'object' && opt !== null) ? String(opt.text ?? '').trim() : String(opt ?? '').trim();

      // 3.1. Khôi phục bộ câu hỏi đại số quan hệ bị biến thành "R. – s", "X. s", "U. s", "R. + s"
      const strippedLead = raw.replace(/^[A-Da-d]\.\s+/, '').trim();
      if (/^R\.\s*[–\-]\s*s$/i.test(strippedLead)) return 'r – s';
      if (/^X\.\s*s$/i.test(strippedLead)) return 'r x s';
      if (/^U\.\s*s$/i.test(strippedLead)) return 'r U s';
      if (/^R\.\s*\+\s*s$/i.test(strippedLead)) return 'r + s';

      // 3.2. Khôi phục các đáp án phụ thuộc hàm bị cắt mất "A -" / "A-" thành "> AB", "A. > BC", "> B và A-> C"
      const brokenArrowMatch = strippedLead.match(/^(?:[A-Za-z]\.\s*)?>\s*(.+)$/);
      if (brokenArrowMatch) {
        const rhs = brokenArrowMatch[1].trim();
        // Nếu đây là phương án đúng và trong explanation có ghi rõ đáp án gốc, lấy chính xác từ explanation
        if (idx === resolvedAnswerIdx && expAnswerHint && expAnswerHint.endsWith(rhs)) {
          return expAnswerHint;
        }
        return `${defaultArrowPrefix}${rhs}`;
      }

      // 3.3. Nếu đây là phương án đúng và bị lệch với expAnswerHint do cắt nhầm ký tự đầu
      const clean = normalizeSingleText(strippedLead);
      if (idx === resolvedAnswerIdx && expAnswerHint && clean !== expAnswerHint && expAnswerHint.endsWith(clean)) {
        return expAnswerHint;
      }

      return clean;
    });

    const finalOptions = healedTexts.map((clean, idx) => {
      const letter = defaultLetters[idx] || `${idx + 1}`;
      return `${letter}. ${clean}`;
    });

    if (JSON.stringify(card.options) !== JSON.stringify(finalOptions)) {
      card.options = finalOptions;
      card.rawOptions = healedTexts.map((clean, idx) => ({
        id: lowerLetters[idx] || `${idx + 1}`,
        text: clean
      }));
      mutated = true;
    }

    return mutated;
  }
```

Tiếp theo, ngay trong hàm `ensureDataIntegrity()` của `js/db.js` (khoảng dòng 89641–89652), cập nhật vòng lặp kiểm tra `allCards` để gọi `this.healCorruptedCardOptions(c)`:

```javascript
    const allCards = await this.getAllCards();
    const cardsToFix = [];
    for (const c of allCards) {
      let needsSave = false;
      const expectedSubj = deckSubjMap.get(c.deckId) || defaultSubject.id;
      if (c.subjectId !== expectedSubj) {
        c.subjectId = expectedSubj;
        needsSave = true;
      }
      // Tự động khôi phục các đáp án bị cắt hỏng trong IndexedDB ("R. – s", "X. s", "> BC"...)
      if (this.healCorruptedCardOptions(c)) {
        needsSave = true;
      }
      if (needsSave) {
        cardsToFix.push(c);
      }
    }
    if (cardsToFix.length > 0) {
      await this.saveCardsBatch(cardsToFix, { forceNew: false });
      this.invalidateSubjectCache();
      console.log(`[DB Self-Healing] Đã tự động khôi phục dữ liệu đáp án cho ${cardsToFix.length} câu hỏi.`);
    }
```

---

## 3. CẬP NHẬT TẦNG HIỂN THỊ & ĐỒNG BỘ TRONG `js/app.js`

### 3.1. Chuẩn hóa `cleanOptionText`, `getCorrectOptionIndex` và thêm `getCardOptionDisplay` trong `js/app.js`
Tại `js/app.js` (khoảng dòng 101512), thay thế hàm `cleanOptionText(rawOpt, index = 0)` bằng cụm 3 hàm chuẩn hóa đồng bộ sau:

```javascript
  // Normalize option text: strip leading "A. ", "B) ", "C: " ONLY when followed by whitespace
  // Never strip single-letter variables ("r – s", "r x s", "r U s") or functional dependency arrows ("A -> BC", "A-> B")
  cleanOptionText(rawOpt, index = 0) {
    const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const fallbackLetter = defaultLetters[index] || String.fromCharCode(65 + index);

    if (rawOpt === null || rawOpt === undefined) {
      return { letter: fallbackLetter, cleanText: '' };
    }

    let text = '';
    if (typeof rawOpt === 'object') {
      text = String(rawOpt.text ?? rawOpt.content ?? rawOpt.value ?? '').trim();
    } else {
      text = String(rawOpt).trim();
    }

    // CHỈ bóc tiền tố nhãn trắc nghiệm nếu là chữ cái A-D theo sau bởi '.', ')' hoặc ':' VÀ khoảng trắng
    const prefixMatch = text.match(/^(?:[A-Da-d])[\.\)\:]\s+(.*)$/s);
    if (prefixMatch && prefixMatch[1].trim().length > 0) {
      text = prefixMatch[1].trim();
    }

    return { letter: fallbackLetter, cleanText: text };
  },

  // Lấy nội dung phương án thứ idx của card, ưu tiên lấy từ card.rawOptions (nếu sạch) để miễn nhiễm với lỗi cắt chuỗi cũ
  getCardRawOptionAt(card, idx = 0) {
    if (!card) return '';
    if (Array.isArray(card.rawOptions) && card.rawOptions[idx] !== undefined) {
      const ro = card.rawOptions[idx];
      const txt = (typeof ro === 'object' && ro !== null) ? String(ro.text ?? '').trim() : String(ro ?? '').trim();
      if (txt) return txt;
    }
    const opt = card.options?.[idx];
    return (typeof opt === 'object' && opt !== null) ? String(opt.text ?? '').trim() : String(opt ?? '').trim();
  },

  // Single Source of Truth để xác định index đáp án đúng (0 = A, 1 = B, 2 = C, 3 = D)
  getCorrectOptionIndex(card) {
    if (!card || card.type === 'numeric') return -1;
    const opts = card.options || card.rawOptions || [];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

    const rawId = card.correct_option_id ?? card.correctOptionId ?? null;
    if (rawId !== null && rawId !== undefined && String(rawId).trim() !== '') {
      const targetId = String(rawId).trim().toLowerCase();
      const byObjId = opts.findIndex((o, idx) => {
        if (typeof o === 'object' && o !== null && o.id !== undefined) {
          return String(o.id).trim().toLowerCase() === targetId;
        }
        return letters[idx] === targetId;
      });
      if (byObjId !== -1) return byObjId;

      const letterIdx = letters.indexOf(targetId);
      if (letterIdx !== -1 && letterIdx < opts.length) return letterIdx;
    }

    if (typeof card.answerIndex === 'number' && card.answerIndex >= 0 && card.answerIndex < opts.length) {
      return card.answerIndex;
    }

    return 0;
  },
```

### 3.2. Đồng bộ hiển thị đáp án ở cả 4 nơi trong `js/app.js`

1. **Trong `_renderOptionsBlock(card, answeredState)` (Chế độ Ôn tập / Quiz / Thi thử — khoảng dòng 101625)**:
   Sửa đoạn chuẩn bị mảng `prepared` để lấy nội dung sạch qua `this.getCardRawOptionAt(card, idx)` và `this.getCorrectOptionIndex(card)`:
   ```javascript
      const originalOptions = card.options || [];
      const correctIdx = this.getCorrectOptionIndex(card);
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      const prepared = originalOptions.map((optItem, idx) => {
        const rawText = this.getCardRawOptionAt(card, idx);
        const optId = (typeof optItem === 'object' && optItem !== null && optItem.id)
          ? String(optItem.id).trim().toLowerCase()
          : letters[idx];
        return {
          id: optId,
          text: rawText,
          originalIdx: idx,
          isCorrect: idx === correctIdx
        };
      });
   ```

2. **Trong `_renderFlashcardContent(card)` (Mặt sau thẻ Flashcard 3D — khoảng dòng 102118)**:
   Sửa đoạn lấy `correctOpt` để dùng `getCorrectOptionIndex` và `cleanOptionText`:
   ```javascript
    let correctOpt;
    if (card.type === 'numeric') {
      correctOpt = '🔢 ' + (card.correct_answer !== undefined ? card.correct_answer : '');
    } else {
      const cIdx = this.getCorrectOptionIndex(card);
      const rawAns = this.getCardRawOptionAt(card, cIdx);
      const { letter, cleanText } = this.cleanOptionText(rawAns, cIdx);
      correctOpt = `${letter}. ${cleanText}`;
    }
   ```

3. **Trong `_createBankCardElement(c, decksMap)` (Tab Ngân hàng câu hỏi — khoảng dòng 105064)**:
   Sửa đoạn render danh sách đáp án để dùng `getCorrectOptionIndex` và `getCardRawOptionAt`:
   ```javascript
      const correctIdx = this.getCorrectOptionIndex(c);
      const optsHtml = (c.options || []).map((opt, idx) => {
        const isCorrect = idx === correctIdx;
        const rawText = this.getCardRawOptionAt(c, idx);
        const { letter, cleanText } = this.cleanOptionText(rawText, idx);
        return `
          <div class="bank-option-pill ${isCorrect ? 'is-correct' : ''}">
            <span class="opt-letter">${letter}.</span>
            <span class="opt-content">${this.renderLatexText(cleanText)}</span>
            ${isCorrect ? '<span style="margin-left: auto; font-weight: 700;">✓</span>' : ''}
          </div>
        `;
      }).join('');
   ```

4. **Trong `openEditCardModal(cardId)` & `saveCardEdit()` (Modal Sửa Câu Hỏi — khoảng dòng 105232 & 104282)**:
   - Khi mở modal sửa câu hỏi (`openEditCardModal`), lấy nội dung từng ô input qua `this.cleanOptionText(this.getCardRawOptionAt(card, idx), idx).cleanText` và lấy đáp án đúng qua `const correctIdx = this.getCorrectOptionIndex(card);`.
   - Khi lưu chỉnh sửa câu hỏi (`saveCardEdit`), cập nhật đồng bộ cả `options`, `rawOptions`, `answerIndex`, `correct_option_id`, và `correctOptionId` để dữ liệu luôn nhất quán 100%:
   ```javascript
      const defaultLetters = ['a', 'b', 'c', 'd'];
      const cleanOpts = options.map((t, idx) => this.cleanOptionText(t, idx).cleanText);
      const formattedOpts = cleanOpts.map((t, idx) => `${defaultLetters[idx].toUpperCase()}. ${t}`);
      const rawOpts = cleanOpts.map((t, idx) => ({ id: defaultLetters[idx], text: t }));
      const chosenId = defaultLetters[answerIndex] || 'a';

      const updates = {
        topic,
        tag: topic,
        difficulty,
        question,
        options: formattedOpts,
        rawOptions: rawOpts,
        answerIndex,
        correct_option_id: chosenId,
        correctOptionId: chosenId,
        explanation,
        needsReview: false
      };
   ```

---

## 4. DANH SÁCH KIỂM THỬ BẮT BUỘC TRƯỚC KHI HOÀN TẤT (VERIFICATION CHECKLIST)

1. **Kiểm thử câu `q61` (`mol_tinhminhlakey.json`)**:
   - Dữ liệu gốc: `a: "r – s"`, `b: "r x s"`, `c: "r U s"`, `d: "r + s"`, `correct_option_id: "b"`.
   - Hiển thị bắt buộc:
     - `A. r – s`
     - `B. r x s ✓`
     - `C. r U s`
     - `D. r + s`
   - Tuyệt đối KHÔNG còn `A. R. – s`, `B. X. s`, `C. U. s`, `D. R. + s`.
2. **Kiểm thử câu `q4` & `q77` (`mol_tinhminhlakey.json`)**:
   - Câu `q4` ("Nếu A->B và A->C thì suy ra:") hiển thị đúng:
     - `A. AA-> C`
     - `B. A -> AB`
     - `C. A-> BC ✓`
     - `D. AB-> BC`
   - Câu `q77` ("Nếu A -> BC suy ra:") hiển thị đúng:
     - `A. A-> B`
     - `B. A -> C`
     - `C. AC -> B và A -> CC`
     - `D. A -> B và A-> C ✓`
   - Tuyệt đối KHÔNG còn hiện tượng mất chữ `A -` biến thành `> AB`, `> BC`, `> B`, `> C`.
3. **Kiểm thử Tự Động Khôi Phục Dữ Liệu Cũ Trong IndexedDB**:
   - Chỉ cần F5 tải lại trang (không cần xóa bộ thẻ hay import lại file JSON), hàm `db.ensureDataIntegrity()` tự động khôi phục toàn bộ các thẻ đã bị cắt hỏng trong IndexedDB về đúng nội dung gốc mà vẫn giữ nguyên 100% lịch sử ôn tập SRS.
4. **Kiểm thử Unit Tests**:
   - Chạy `node tests/test-runner.js` đảm bảo pass 100% toàn bộ các test suite hiện có.
