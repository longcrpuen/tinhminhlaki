/**
 * MindSparks Dedicated Background Web Worker
 * Offloads CPU-intensive tasks from the main thread:
 * 1. LMS Moodle Raw Text Parsing (via parser.js)
 * 2. SM-2 Spaced Repetition Calculations (via srs.js)
 * 3. AI Import JSON Parsing & Validation (via parser.js)
 * 4. Heatmap & Statistical Aggregation
 */

try {
  importScripts('./parser.js', './srs.js');
} catch (e) {
  console.warn('[Worker] importScripts failed:', e);
}

// --- 1. STATISTICAL AGGREGATION ---
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

// Fallback calculateSRS if srs.js wasn't loaded
function fallbackCalculateSRS(currentSrs = {}, rating = 3) {
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

// --- 2. MESSAGE DISPATCHER ---
self.onmessage = function (e) {
  const { id, action, payload } = e.data || {};

  try {
    let result = null;

    switch (action) {
      case 'PARSE_LMS': {
        let qs = null;
        if (typeof LMSParser !== 'undefined' && typeof LMSParser.parse === 'function') {
          qs = LMSParser.parse(payload.rawText || '');
        } else if (typeof parseQuestions === 'function' && typeof cleanRawText === 'function') {
          const cleaned = cleanRawText(payload.rawText || '');
          qs = parseQuestions(cleaned);
        }
        result = Array.isArray(qs) ? qs : (qs?.questions || []);
        break;
      }
      case 'PARSE_AI_JSON': {
        let res = null;
        if (typeof AIParser !== 'undefined' && typeof AIParser.parse === 'function') {
          res = AIParser.parse(payload.rawInput || '');
        }
        result = res;
        break;
      }
      case 'CALCULATE_SRS': {
        if (typeof SRS !== 'undefined' && typeof SRS.calculateNext === 'function') {
          result = SRS.calculateNext(payload.currentSrs, payload.rating);
        } else {
          result = fallbackCalculateSRS(payload.currentSrs, payload.rating);
        }
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
