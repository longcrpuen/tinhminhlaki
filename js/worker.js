/**
 * MindSparks Dedicated Background Web Worker (Part B)
 * Offloads CPU-intensive tasks from the main thread:
 * 1. LMS Moodle Raw Text Parsing
 * 2. SM-2 Spaced Repetition Calculations
 * 3. AI Import JSON Parsing & Validation
 * 4. Heatmap & Statistical Aggregation
 */

// --- 1. LMS TEXT PARSER UTILITIES ---
function cleanRawText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/^(\s*(\r?\n))+/, '')
    .replace(/(\r?\n\s*)+$/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      const lower = line.toLowerCase();
      if (lower.startsWith('câu hỏi ') && !lower.includes('?')) return false;
      if (lower.startsWith('hoàn thành')) return false;
      if (/^đạt điểm\s+\d+([,\.]\d+)?\s+trên\s+\d+([,\.]\d+)?/i.test(lower)) return false;
      if (lower.includes('không gắn cờ') || lower.includes('đặt cờ')) return false;
      if (lower.startsWith('đoạn văn câu hỏi')) return false;
      return true;
    })
    .join('\n');
}

function parseLmsQuestions(cleanedText) {
  if (!cleanedText || typeof cleanedText !== 'string') return [];
  const rawBlocks = cleanedText.split(/(?=(?:^|\n)Select one(?::|\s+or\s+more:))/i);
  const questions = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i].trim();
    if (!block) continue;

    if (!/^Select one(?::|\s+or\s+more:)/i.test(block)) {
      if (i + 1 < rawBlocks.length) {
        rawBlocks[i + 1] = block + '\n' + rawBlocks[i + 1];
      }
      continue;
    }

    const prevBlock = i > 0 ? rawBlocks[i - 1] : '';
    const prevLines = prevBlock.split('\n').map(l => l.trim()).filter(Boolean);
    let qText = prevLines.length > 0 ? prevLines[prevLines.length - 1] : `Câu hỏi ${questions.length + 1}`;
    qText = qText.replace(/^câu\s+\d+[\.:\s]*/i, '').trim();

    const isMultipleSelect = /^Select one or more:/i.test(block);
    const content = block.replace(/^Select one(?::|\s+or\s+more:)/i, '').trim();
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    const options = [];
    let currentOpt = null;

    for (const line of lines) {
      const optMatch = line.match(/^([a-gA-G])[\.:\s]+(.*)$/);
      if (optMatch) {
        if (currentOpt) options.push(currentOpt);
        currentOpt = {
          id: optMatch[1].toLowerCase(),
          text: (optMatch[2] || '').trim()
        };
      } else if (currentOpt) {
        currentOpt.text += ' ' + line;
      }
    }
    if (currentOpt) options.push(currentOpt);

    const isNumeric = options.length === 0;

    questions.push({
      id: `lms_q_${Date.now()}_${questions.length + 1}`,
      type: isNumeric ? 'numeric' : 'multiple_choice',
      question: qText,
      options: options,
      correct_option_id: null,
      correct_answer: null,
      needs_review: isMultipleSelect,
      reviewReason: isMultipleSelect ? '⚠️ Câu hỏi có nhiều đáp án (Select one or more:), vui lòng kiểm tra lại.' : ''
    });
  }

  return questions;
}

// --- 2. SM-2 SRS ALGORITHM ---
function calculateSRS(currentSrs = {}, rating = 3) {
  let rep = currentSrs.repetition || 0;
  let interval = currentSrs.interval || 0;
  let ef = currentSrs.easeFactor || 2.5;
  let state = currentSrs.state || 'new';

  const sm2Quality = rating === 1 ? 1 : rating === 2 ? 2 : rating === 3 ? 4 : 5;
  ef = ef + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
  if (ef < 1.3) ef = 1.3;
  ef = Math.round(ef * 100) / 100;

  let nextDueDate;
  const now = Date.now();

  if (rating < 3) {
    rep = 0;
    if (rating === 1) {
      interval = 0;
      nextDueDate = now + 10 * 60 * 1000;
      state = 'learning';
    } else {
      interval = 1;
      nextDueDate = now + 1 * 86400 * 1000;
      state = 'learning';
    }
  } else {
    if (rep === 0) {
      interval = 1;
    } else if (rep === 1) {
      interval = rating === 4 ? 4 : 3;
    } else {
      const bonus = rating === 4 ? 1.3 : 1.0;
      interval = Math.round(interval * ef * bonus);
    }
    rep += 1;
    nextDueDate = now + interval * 86400 * 1000;
    state = interval >= 21 ? 'mastered' : 'review';
  }

  return {
    repetition: rep,
    interval: interval,
    easeFactor: ef,
    dueDate: nextDueDate,
    state: state
  };
}

// --- 3. STATISTICAL AGGREGATION ---
function computeStatsData(cards = [], logs = []) {
  const states = { new: 0, learning: 0, review: 0, mastered: 0 };
  const topicMap = {};
  const subjectMap = {};
  const now = Date.now();

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const s = c.srs?.state || 'new';
    states[s] = (states[s] || 0) + 1;

    // Topic aggregation
    const topic = (c.topic || c.tag || 'Chung').trim();
    if (!topicMap[topic]) {
      topicMap[topic] = { topic, total: 0, reviewed: 0, correct: 0, incorrect: 0 };
    }
    topicMap[topic].total++;
    if (c.stats?.reviewsCount > 0) topicMap[topic].reviewed++;
    topicMap[topic].correct += (c.stats?.correctCount || 0);
    topicMap[topic].incorrect += (c.stats?.incorrectCount || 0);

    // Subject aggregation
    const subjId = c.subjectId || 'subj_unassigned';
    if (!subjectMap[subjId]) {
      subjectMap[subjId] = { totalCards: 0, dueCards: 0, reviewsCount: 0, correctCount: 0, incorrectCount: 0 };
    }
    subjectMap[subjId].totalCards++;
    if (!c.srs?.dueDate || c.srs.dueDate <= now) subjectMap[subjId].dueCards++;
    if (c.stats) {
      subjectMap[subjId].reviewsCount += (c.stats.reviewsCount || 0);
      subjectMap[subjId].correctCount += (c.stats.correctCount || 0);
      subjectMap[subjId].incorrectCount += (c.stats.incorrectCount || 0);
    }
  }

  // Logs aggregation for heatmap
  const heatmapMap = {};
  for (let i = 0; i < logs.length; i++) {
    const l = logs[i];
    if (!l.timestamp) continue;
    const d = new Date(l.timestamp);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    heatmapMap[dateKey] = (heatmapMap[dateKey] || 0) + 1;
  }

  const totalReviews = logs.length;
  const correctReviews = logs.filter(l => l.isCorrect).length;
  const accPct = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  return {
    states,
    totalReviews,
    correctReviews,
    accPct,
    topicStats: Object.values(topicMap),
    subjectStats: subjectMap,
    heatmapMap
  };
}

// --- 4. MESSAGE DISPATCHER ---
self.onmessage = function (e) {
  const { id, action, payload } = e.data || {};

  try {
    let result = null;

    switch (action) {
      case 'PARSE_LMS': {
        let qs = null;
        try {
          if (typeof LMSParser === 'undefined' && typeof importScripts === 'function') {
            importScripts('./parser.js');
          }
          if (typeof LMSParser !== 'undefined' && typeof LMSParser.parse === 'function') {
            qs = LMSParser.parse(payload.rawText || '');
          }
        } catch (_) {}
        if (!qs) {
          const cleaned = cleanRawText(payload.rawText || '');
          qs = parseLmsQuestions(cleaned);
        }
        result = Array.isArray(qs) ? qs : (qs?.questions || []);
        break;
      }
      case 'PARSE_AI_JSON': {
        let res = null;
        try {
          if (typeof AIParser === 'undefined' && typeof importScripts === 'function') {
            importScripts('./parser.js');
          }
          if (typeof AIParser !== 'undefined' && typeof AIParser.parse === 'function') {
            res = AIParser.parse(payload.rawInput || '');
          }
        } catch (_) {}
        result = res;
        break;
      }
      case 'CALCULATE_SRS': {
        result = calculateSRS(payload.currentSrs, payload.rating);
        break;
      }
      case 'COMPUTE_STATS': {
        result = computeStatsData(payload.cards || [], payload.logs || []);
        break;
      }
      default:
        throw new Error(`Unknown Worker action: ${action}`);
    }

    self.postMessage({ id, success: true, result });
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message || String(err) });
  }
};
