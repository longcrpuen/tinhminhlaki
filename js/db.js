/**
 * Database Module for MindSparks
 * Uses IndexedDB for offline-first, virtually unlimited storage.
 */
const DB_NAME = 'MindSparksQuizDB';
const DB_VERSION = 1;

class QuizDatabase {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Decks store
        if (!db.objectStoreNames.contains('decks')) {
          const deckStore = db.createObjectStore('decks', { keyPath: 'id' });
          deckStore.createIndex('name', 'name', { unique: false });
          deckStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Cards store
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('deckId', 'deckId', { unique: false });
          cardStore.createIndex('dueDate', 'srs.dueDate', { unique: false });
          cardStore.createIndex('state', 'srs.state', { unique: false });
        }

        // Study Logs store
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
          logStore.createIndex('cardId', 'cardId', { unique: false });
        }

        // Meta / Settings store
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this._checkAndSeedDefaultData();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  async _loadSampleData() {
    let sampleData = null;
    // 1. Browser environment
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('./data/sample-deck.json');
        if (res.ok) sampleData = await res.json();
      } catch (e) {}
    }
    // 2. Node.js environment
    if (!sampleData && typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const candidates = [
          path.resolve(__dirname, '../data/sample-deck.json'),
          path.resolve(__dirname, './data/sample-deck.json'),
          path.resolve(process.cwd(), 'data/sample-deck.json')
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) {
            sampleData = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }
      } catch (e) {}
    }
    // 3. Fallback embedded questions if network or filesystem is inaccessible
    if (!sampleData) {
      sampleData = {
        quiz_title: "Toán Học & Khoa Học Tự Nhiên",
        questions: [
          {
            question: "Đạo hàm của hàm số $f(x) = x^2$ là gì?",
            options: [{ id: "a", text: "$2x$" }, { id: "b", text: "$x^2$" }, { id: "c", text: "$2$" }, { id: "d", text: "$x$" }],
            correct_option_id: "a",
            explanation: "Áp dụng quy tắc đạo hàm lũy thừa: f'(x) = 2x.",
            topic: "Đạo hàm",
            difficulty: "medium"
          },
          {
            question: "Giá trị của tích phân xác định $\\int_{0}^{1} 2x \\, dx$ bằng bao nhiêu?",
            options: [{ id: "a", text: "$0$" }, { id: "b", text: "$1$" }, { id: "c", text: "$2$" }, { id: "d", text: "$\\frac{1}{2}$" }],
            correct_option_id: "b",
            explanation: "Nguyên hàm của 2x là x^2: [x^2] từ 0 đến 1 bằng 1.",
            topic: "Tích phân",
            difficulty: "medium"
          }
        ]
      };
    }
    return sampleData;
  }

  async _checkAndSeedDefaultData() {
    const decks = await this.getAllDecks();
    if (decks.length === 0) {
      try {
        const sampleData = await this._loadSampleData();
        if (sampleData) {
          await this.importDeckWithCards(sampleData);
        }
      } catch (err) {
        console.warn('Could not load sample deck automatically:', err);
      }
    } else {
      // Ensure data integrity on existing decks (self-healing)
      await this.ensureDataIntegrity();
    }
  }

  // --- TRANSACTION HELPERS ---
  _tx(storeNames, mode = 'readonly') {
    return this.db.transaction(storeNames, mode);
  }

  _promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- DECKS ---
  async getAllDecks() {
    await this.init();
    const tx = this._tx('decks', 'readonly');
    const store = tx.objectStore('decks');
    return this._promisify(store.getAll());
  }

  async getDeck(id) {
    await this.init();
    const tx = this._tx('decks', 'readonly');
    const store = tx.objectStore('decks');
    return this._promisify(store.get(id));
  }

  async saveDeck(deck) {
    await this.init();
    if (!deck.id) {
      deck.id = 'deck_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    deck.updatedAt = Date.now();
    if (!deck.createdAt) deck.createdAt = Date.now();

    const tx = this._tx('decks', 'readwrite');
    const store = tx.objectStore('decks');
    await this._promisify(store.put(deck));
    return deck;
  }

  async deleteDeck(id) {
    await this.init();
    // Delete deck
    const tx = this._tx(['decks', 'cards'], 'readwrite');
    const deckStore = tx.objectStore('decks');
    const cardStore = tx.objectStore('cards');

    await this._promisify(deckStore.delete(id));

    // Delete associated cards
    const cardIndex = cardStore.index('deckId');
    const cards = await this._promisify(cardIndex.getAll(id));
    for (const card of cards) {
      cardStore.delete(card.id);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
    });
  }

  // --- CARDS ---
  async getAllCards() {
    await this.init();
    const tx = this._tx('cards', 'readonly');
    const store = tx.objectStore('cards');
    return this._promisify(store.getAll());
  }

  async getCard(id) {
    await this.init();
    const tx = this._tx('cards', 'readonly');
    const store = tx.objectStore('cards');
    return this._promisify(store.get(id));
  }

  async getCardsByDeck(deckId) {
    await this.init();
    const tx = this._tx('cards', 'readonly');
    const store = tx.objectStore('cards');
    const index = store.index('deckId');
    return this._promisify(index.getAll(deckId));
  }

  // --- UNIQUE ID GENERATION & SANITIZATION ---
  generateUniqueCardId(prefix = 'card') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    const t = Date.now().toString(36);
    const r1 = Math.random().toString(36).substring(2, 9);
    const r2 = Math.random().toString(36).substring(2, 7);
    const p = (typeof performance !== 'undefined' ? performance.now() : 0).toString(36).replace('.', '');
    return `${prefix}_${t}_${p}_${r1}_${r2}`;
  }

  _isGenericCardId(id) {
    if (!id) return true;
    const s = String(id).trim();
    // Generic IDs like "q1", "q02", "1", "0", "card_1", "item-1"
    return /^(q\d+|\d+|card_\d+|item[_-]?\d+)$/i.test(s);
  }

  async saveCard(card, options = {}) {
    await this.init();
    
    // Check if ID needs unique reassignment (forceNew, missing, or generic ID like q1, q2...)
    const needsNewId = options.forceNew || !card.id || this._isGenericCardId(card.id);

    if (needsNewId) {
      card.id = this.generateUniqueCardId();
    } else {
      // Check for cross-deck collision: if ID already exists under another deckId, reassign new ID
      const existing = await this.getCard(card.id);
      if (existing && existing.deckId && card.deckId && existing.deckId !== card.deckId) {
        card.id = this.generateUniqueCardId();
      }
    }

    if (!card.createdAt) card.createdAt = Date.now();
    card.updatedAt = Date.now();

    // Default SRS values
    if (!card.srs) {
      card.srs = {
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: Date.now(), // Due immediately for new cards
        state: 'new' // 'new', 'learning', 'review', 'mastered'
      };
    }

    // Default stats
    if (!card.stats) {
      card.stats = {
        reviewsCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null
      };
    }

    const tx = this._tx('cards', 'readwrite');
    const store = tx.objectStore('cards');
    await this._promisify(store.put(card));
    return card;
  }

  async saveCardsBatch(cards, options = {}) {
    await this.init();
    if (!Array.isArray(cards) || cards.length === 0) return [];

    // Pre-fetch all existing card IDs and their deckIds to prevent cross-deck ID collision
    const existingCards = await this.getAllCards();
    const existingMap = new Map();
    existingCards.forEach(c => existingMap.set(c.id, c.deckId));

    const usedBatchIds = new Set();

    for (const card of cards) {
      const isGeneric = this._isGenericCardId(card.id);
      const isCrossDeckCollision = card.id && existingMap.has(card.id) && card.deckId && existingMap.get(card.id) !== card.deckId;
      const isDuplicateInBatch = card.id && usedBatchIds.has(card.id);

      if (options.forceNew || !card.id || isGeneric || isCrossDeckCollision || isDuplicateInBatch) {
        card.id = this.generateUniqueCardId();
      }
      usedBatchIds.add(card.id);

      if (!card.createdAt) card.createdAt = Date.now();
      card.updatedAt = Date.now();

      if (!card.srs) {
        card.srs = {
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: Date.now(),
          state: 'new'
        };
      }
      if (!card.stats) {
        card.stats = {
          reviewsCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: null
        };
      }
    }

    const tx = this._tx('cards', 'readwrite');
    const store = tx.objectStore('cards');
    for (const card of cards) {
      store.put(card);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(cards);
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteCard(id) {
    await this.init();
    const tx = this._tx('cards', 'readwrite');
    const store = tx.objectStore('cards');
    return this._promisify(store.delete(id));
  }

  // --- DUE & WEAK QUERIES (7 STUDY MODES) ---
  async getDueCards(deckId = null) {
    const all = deckId ? await this.getCardsByDeck(deckId) : await this.getAllCards();
    const now = Date.now();
    return all.filter(c => !c.srs?.dueDate || c.srs.dueDate <= now);
  }

  /**
   * Mode 2: Lấy các câu hay sai, ưu tiên sai gần nhất hoặc sai nhiều lần nhất
   */
  async getMistakeCards(deckId = null, limit = 50) {
    const all = deckId ? await this.getCardsByDeck(deckId) : await this.getAllCards();
    
    // Filter cards that have been answered incorrectly at least once
    const mistakes = all.filter(c => c.stats && c.stats.incorrectCount > 0);

    // Sort by weighted mistake severity:
    // More incorrects + higher error ratio + recency bonus
    mistakes.sort((a, b) => {
      const aWeight = (a.stats.incorrectCount * 3) - a.stats.correctCount + (a.stats.lastReviewed ? (a.stats.lastReviewed / 1e11) : 0);
      const bWeight = (b.stats.incorrectCount * 3) - b.stats.correctCount + (b.stats.lastReviewed ? (b.stats.lastReviewed / 1e11) : 0);
      return bWeight - aWeight;
    });

    return mistakes.slice(0, limit);
  }

  /**
   * Mode 5: Lấy danh sách tất cả các topics/tags kèm số lượng câu & tỉ lệ đúng
   */
  async getAllTopics(deckId = null) {
    const all = deckId ? await this.getCardsByDeck(deckId) : await this.getAllCards();
    const topicMap = {};

    all.forEach(c => {
      const topic = (c.topic || c.tag || 'Chung').trim();
      if (!topicMap[topic]) {
        topicMap[topic] = {
          topic: topic,
          count: 0,
          totalReviews: 0,
          correctReviews: 0,
          incorrectReviews: 0
        };
      }
      topicMap[topic].count += 1;
      if (c.stats) {
        topicMap[topic].totalReviews += (c.stats.reviewsCount || 0);
        topicMap[topic].correctReviews += (c.stats.correctCount || 0);
        topicMap[topic].incorrectReviews += (c.stats.incorrectCount || 0);
      }
    });

    return Object.values(topicMap).map(t => {
      const acc = t.totalReviews > 0 ? Math.round((t.correctReviews / t.totalReviews) * 100) : null;
      return {
        ...t,
        accuracy: acc
      };
    });
  }

  /**
   * Mode 5: Lọc các câu theo danh sách topic cụ thể
   */
  async getCardsByTopics(topics = [], deckId = null) {
    const all = deckId ? await this.getCardsByDeck(deckId) : await this.getAllCards();
    const selectedSet = new Set(topics.map(t => t.trim().toLowerCase()));
    return all.filter(c => {
      const cardTopic = (c.topic || c.tag || 'Chung').trim().toLowerCase();
      return selectedSet.has(cardTopic);
    });
  }

  /**
   * Mode 7: Ôn nước rút - Tự động gom N câu từ các chủ đề yếu nhất
   */
  async getSprintCards(count = 15, deckId = null) {
    const all = deckId ? await this.getCardsByDeck(deckId) : await this.getAllCards();
    if (all.length <= count) return all;

    const topics = await this.getAllTopics(deckId);

    // Sort topics by weakness:
    // 1. Topics with lowest accuracy (e.g. 20% < 50%)
    // 2. Topics with high incorrect count
    // 3. Topics with unstudied cards
    topics.sort((a, b) => {
      const accA = a.accuracy !== null ? a.accuracy : 50;
      const accB = b.accuracy !== null ? b.accuracy : 50;
      if (accA !== accB) return accA - accB; // lowest first
      return b.incorrectReviews - a.incorrectReviews;
    });

    const sprintCards = [];
    const addedIds = new Set();

    // Pick cards from weakest topics first
    for (const top of topics) {
      const topicCards = all.filter(c => {
        const t = (c.topic || c.tag || 'Chung').trim();
        return t === top.topic && !addedIds.has(c.id);
      });

      // In each topic, prioritize hard questions or mistaken questions
      topicCards.sort((a, b) => {
        const aScore = (a.stats?.incorrectCount || 0) + (a.difficulty === 'hard' ? 2 : a.difficulty === 'medium' ? 1 : 0);
        const bScore = (b.stats?.incorrectCount || 0) + (b.difficulty === 'hard' ? 2 : b.difficulty === 'medium' ? 1 : 0);
        return bScore - aScore;
      });

      for (const card of topicCards) {
        sprintCards.push(card);
        addedIds.add(card.id);
        if (sprintCards.length >= count) break;
      }

      if (sprintCards.length >= count) break;
    }

    // If still need more to reach count, fill from remaining cards
    if (sprintCards.length < count) {
      for (const card of all) {
        if (!addedIds.has(card.id)) {
          sprintCards.push(card);
          addedIds.add(card.id);
          if (sprintCards.length >= count) break;
        }
      }
    }

    return sprintCards;
  }

  async getWeakCards(deckId = null, maxAccuracy = 0.6) {
    return this.getMistakeCards(deckId);
  }

  // --- CARD INTERACTION & EDITING (SECTION 5) ---
  async toggleBookmark(cardId) {
    const card = await this.getCard(cardId);
    if (!card) return null;
    let current = false;
    if (typeof card.bookmarked === 'boolean') current = card.bookmarked;
    else if (typeof card.isBookmarked === 'boolean') current = card.isBookmarked;
    else if (typeof card.bookmarked === 'object' && card.bookmarked !== null) {
      current = Boolean(card.bookmarked.isBookmarked ?? card.bookmarked.bookmarked ?? false);
    } else {
      current = Boolean(card.bookmarked || card.isBookmarked);
    }
    const nextState = !current;
    card.isBookmarked = nextState;
    card.bookmarked = nextState;
    await this.saveCard(card);
    return card;
  }

  async toggleFlag(cardId) {
    const card = await this.getCard(cardId);
    if (!card) return null;
    let current = false;
    if (typeof card.flagged === 'boolean') current = card.flagged;
    else if (typeof card.isFlagged === 'boolean') current = card.isFlagged;
    else if (typeof card.flagged === 'object' && card.flagged !== null) {
      current = Boolean(card.flagged.isFlagged ?? card.flagged.flagged ?? false);
    } else {
      current = Boolean(card.flagged || card.isFlagged);
    }
    const nextState = !current;
    card.isFlagged = nextState;
    card.flagged = nextState;
    await this.saveCard(card);
    return card;
  }

  async updateCardContent(cardId, updated) {
    const card = await this.getCard(cardId);
    if (!card) throw new Error('Không tìm thấy câu hỏi để cập nhật.');

    if (updated.question !== undefined) card.question = updated.question;
    if (updated.options !== undefined) card.options = updated.options;
    if (updated.rawOptions !== undefined) card.rawOptions = updated.rawOptions;
    if (updated.answerIndex !== undefined) card.answerIndex = updated.answerIndex;
    if (updated.correctOptionId !== undefined) card.correctOptionId = updated.correctOptionId;
    if (updated.explanation !== undefined) card.explanation = updated.explanation;
    if (updated.topic !== undefined) {
      card.topic = updated.topic;
      card.tag = updated.topic;
    }
    if (updated.difficulty !== undefined) card.difficulty = updated.difficulty;

    await this.saveCard(card);
    return card;
  }

  /**
   * Reset tiến trình ôn tập riêng biệt cho 1 bộ thẻ
   */
  async resetDeckProgress(deckId) {
    const cards = await this.getCardsByDeck(deckId);
    for (const c of cards) {
      c.srs = {
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: Date.now(),
        state: 'new'
      };
      c.stats = {
        reviewsCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null
      };
    }
    await this.saveCardsBatch(cards);
    return cards.length;
  }

  /**
   * Lấy dữ liệu Heatmap lịch đóng góp (past N days)
   * Luôn trả về danh sách dạng mảng: Array<{ date: string, count: number, level: number }>
   */
  async getContributionHeatmapData(days = 84) {
    try {
      await this.init();
      const logs = await this.getRecentLogs(2000);
      const reviewsByDate = {};

      // Accumulate logs safely
      if (Array.isArray(logs)) {
        logs.forEach(l => {
          if (l && l.timestamp) {
            const key = new Date(l.timestamp).toISOString().slice(0, 10);
            reviewsByDate[key] = (reviewsByDate[key] || 0) + 1;
          }
        });
      }

      const result = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400 * 1000);
        const dateStr = d.toISOString().slice(0, 10);
        const count = reviewsByDate[dateStr] || 0;
        let level = 0;
        if (count >= 10) level = 4;
        else if (count >= 6) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;
        result.push({ date: dateStr, count, level });
      }

      return result;
    } catch (err) {
      console.error('[db.getContributionHeatmapData] Lỗi truy vấn logs, trả về mảng rỗng mặc định:', err);
      const fallback = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400 * 1000);
        fallback.push({ date: d.toISOString().slice(0, 10), count: 0, level: 0 });
      }
      return fallback;
    }
  }

  /**
   * Tính toán tỉ lệ % đúng và tiến độ theo từng chủ đề
   */
  async getTopicPerformance() {
    return this.getAllTopics();
  }

  // --- LOGS & STATS ---
  async logReview(logData) {
    await this.init();
    const tx = this._tx('logs', 'readwrite');
    const store = tx.objectStore('logs');
    const entry = {
      ...logData,
      timestamp: Date.now()
    };
    await this._promisify(store.add(entry));
    await this.updateStreak();
    return entry;
  }

  async getRecentLogs(limit = 100) {
    try {
      await this.init();
      const tx = this._tx('logs', 'readonly');
      const store = tx.objectStore('logs');
      const index = store.index('timestamp');
      return new Promise((resolve) => {
        const results = [];
        const cursorReq = index.openCursor(null, 'prev');
        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorReq.onerror = () => resolve(results);
        tx.onerror = () => resolve(results);
      });
    } catch (err) {
      console.warn('[db.getRecentLogs] Lỗi đọc logs:', err);
      return [];
    }
  }

  // --- META & SETTINGS ---
  async getMeta(key, defaultValue = null) {
    await this.init();
    const tx = this._tx('meta', 'readonly');
    const store = tx.objectStore('meta');
    const result = await this._promisify(store.get(key));
    return result ? result.value : defaultValue;
  }

  async setMeta(key, value) {
    await this.init();
    const tx = this._tx('meta', 'readwrite');
    const store = tx.objectStore('meta');
    return this._promisify(store.put({ key, value }));
  }

  // --- STREAK CALCULATION ---
  async updateStreak() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const streakData = await this.getMeta('streak', {
      count: 0,
      lastDate: null,
      history: []
    });

    if (streakData.lastDate === todayStr) {
      // Already counted today
      return streakData;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (streakData.lastDate === yesterday) {
      streakData.count += 1;
    } else if (streakData.lastDate !== todayStr) {
      // Streak broken or started fresh
      streakData.count = 1;
    }

    streakData.lastDate = todayStr;
    if (!streakData.history.includes(todayStr)) {
      streakData.history.push(todayStr);
      // Keep last 60 days
      if (streakData.history.length > 60) streakData.history.shift();
    }

    await this.setMeta('streak', streakData);
    return streakData;
  }

  // --- IMPORT / EXPORT ---
  async importDeckWithCards(data) {
    let parsed;
    if (typeof data === 'string') {
      parsed = AIParser.parse(data);
    } else {
      parsed = AIParser._normalizeJsonData(data);
    }

    const deck = await this.saveDeck({
      name: parsed.deckName,
      description: parsed.description
    });

    const cards = parsed.cards.map(c => ({
      ...c,
      id: this.generateUniqueCardId(),
      deckId: deck.id,
      srs: {
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: Date.now(),
        state: 'new'
      },
      stats: {
        reviewsCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null
      }
    }));

    await this.saveCardsBatch(cards, { forceNew: true });
    return { deck, cardsCount: cards.length, errors: parsed.errors };
  }

  // --- SNAPSHOTS & SELF-HEALING FALLBACK ---
  async createSnapshot(label = 'auto') {
    try {
      await this.init();
      const decks = await this.getAllDecks();
      const cards = await this.getAllCards();
      const existingSnapshots = await this.getMeta('db_snapshots', []);
      
      const newSnapshot = {
        id: 'snap_' + Date.now(),
        timestamp: Date.now(),
        label,
        decksCount: decks.length,
        cardsCount: cards.length,
        decks,
        cards
      };

      const updated = [newSnapshot, ...(Array.isArray(existingSnapshots) ? existingSnapshots : [])].slice(0, 5); // Keep last 5 snapshots
      await this.setMeta('db_snapshots', updated);
      return newSnapshot;
    } catch (e) {
      console.warn('Could not create DB snapshot:', e);
      return null;
    }
  }

  async getSnapshots() {
    return this.getMeta('db_snapshots', []);
  }

  async restoreSnapshot(index = 0) {
    const snapshots = await this.getSnapshots();
    if (!snapshots || snapshots.length <= index) {
      throw new Error('Không tìm thấy bản sao lưu snapshot phù hợp.');
    }
    const snap = snapshots[index];
    return this.importAll({ decks: snap.decks, cards: snap.cards }, 'replace');
  }

  async recoverOrphanedCards() {
    await this.init();
    const decks = await this.getAllDecks();
    const cards = await this.getAllCards();
    if (decks.length === 0 || cards.length === 0) return 0;

    const deckIdSet = new Set(decks.map(d => d.id));
    const orphaned = cards.filter(c => !c.deckId || !deckIdSet.has(c.deckId));
    if (orphaned.length === 0) return 0;

    // Attach to first available deck
    const fallbackDeckId = decks[0].id;
    for (const card of orphaned) {
      card.deckId = fallbackDeckId;
      card.updatedAt = Date.now();
    }
    await this.saveCardsBatch(orphaned);
    return orphaned.length;
  }

  async ensureDataIntegrity() {
    await this.init();
    const decks = await this.getAllDecks();
    const allCards = await this.getAllCards();

    // 1. Recover orphaned cards if any
    await this.recoverOrphanedCards();

    // 2. If decks exist but total cards is 0 (or default deck is empty), auto heal
    if (decks.length > 0 && allCards.length === 0) {
      console.warn('[DB] Phát hiện dữ liệu bị rỗng ruột (0 câu hỏi). Bắt đầu kích hoạt cơ chế tự phục hồi...');
      try {
        const sampleData = await this._loadSampleData();
        if (sampleData) {
          const parsed = AIParser._normalizeJsonData(sampleData);
          const defaultDeck = decks[0];
          const restoredCards = parsed.cards.map(c => ({
            ...c,
            id: this.generateUniqueCardId(),
            deckId: defaultDeck.id,
            srs: { repetition: 0, interval: 0, easeFactor: 2.5, dueDate: Date.now(), state: 'new' },
            stats: { reviewsCount: 0, correctCount: 0, incorrectCount: 0, lastReviewed: null }
          }));
          await this.saveCardsBatch(restoredCards, { forceNew: true });
        }
      } catch (err) {
        console.error('[DB] Lỗi khi tự phục hồi dữ liệu rỗng:', err);
      }
    }
  }

  async exportAll() {
    const decks = await this.getAllDecks();
    const cards = await this.getAllCards();
    const streak = await this.getMeta('streak', { count: 0, lastDate: null, history: [] });
    const settings = {
      theme: await this.getMeta('theme', 'dark'),
      soundEnabled: await this.getMeta('soundEnabled', true),
      dailyGoal: await this.getMeta('dailyGoal', 20)
    };

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'MindSparks',
      decks,
      cards,
      streak,
      settings
    };
  }

  async importAll(data, mode = 'merge') {
    if (!data || !Array.isArray(data.decks) || !Array.isArray(data.cards)) {
      throw new Error('File JSON không đúng cấu trúc backup của MindSparks.');
    }

    if (mode === 'replace') {
      // Clear current data
      const tx = this._tx(['decks', 'cards', 'logs'], 'readwrite');
      tx.objectStore('decks').clear();
      tx.objectStore('cards').clear();
      tx.objectStore('logs').clear();
      await new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    }

    // Save decks
    for (const deck of data.decks) {
      await this.saveDeck(deck);
    }

    // Save cards
    await this.saveCardsBatch(data.cards);

    if (data.streak) {
      await this.setMeta('streak', data.streak);
    }
    if (data.settings) {
      if (data.settings.theme) await this.setMeta('theme', data.settings.theme);
      if (data.settings.soundEnabled !== undefined) await this.setMeta('soundEnabled', data.settings.soundEnabled);
      if (data.settings.dailyGoal) await this.setMeta('dailyGoal', data.settings.dailyGoal);
    }

    return {
      decksCount: data.decks.length,
      cardsCount: data.cards.length
    };
  }
}

// Global Singleton
const db = new QuizDatabase();
