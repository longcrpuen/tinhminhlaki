/**
 * Spaced Repetition Engine (SM-2 Algorithm)
 * Implements the SuperMemo-2 spaced repetition calculation.
 */
const SRS = {
  // Ratings:
  // 1 = AGAIN (Quên hoàn toàn)
  // 2 = HARD (Khó khăn, nhớ mơ hồ)
  // 3 = GOOD (Tốt, nhớ đúng với nỗ lực vừa phải)
  // 4 = EASY (Rất dễ, nhớ tức thì)
  
  RATING_MAP: {
    AGAIN: 1,
    HARD: 2,
    GOOD: 3,
    EASY: 4
  },

  /**
   * Calculate next SRS values based on user rating.
   * @param {Object} currentSrs - { repetition, interval, easeFactor, dueDate, state }
   * @param {Number} rating - 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   * @returns {Object} Updated SRS data
   */
  calculateNext(currentSrs = {}, rating = 3) {
    let rep = currentSrs.repetition || 0;
    let interval = currentSrs.interval || 0;
    let ef = currentSrs.easeFactor || 2.5;
    let state = currentSrs.state || 'new';

    // Map 1-4 scale to SM-2 0-5 scale
    // 1 -> 1, 2 -> 2, 3 -> 4, 4 -> 5
    const sm2Quality = rating === 1 ? 1 : rating === 2 ? 2 : rating === 3 ? 4 : 5;

    // Update Ease Factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ef = ef + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
    if (ef < 1.3) ef = 1.3;
    ef = Math.round(ef * 100) / 100;

    let nextDueDate;
    const now = Date.now();

    if (rating < 3) {
      // Again or Hard: reset repetition
      rep = 0;
      if (rating === 1) {
        // Again: Review again in 10 minutes
        interval = 0;
        nextDueDate = now + 10 * 60 * 1000;
        state = 'learning';
      } else {
        // Hard: Review tomorrow
        interval = 1;
        nextDueDate = now + 1 * 86400 * 1000;
        state = 'learning';
      }
    } else {
      // Successful recall
      if (rep === 0) {
        interval = 1; // 1 day
      } else if (rep === 1) {
        interval = rating === 4 ? 4 : 3; // 3 or 4 days
      } else {
        const bonus = rating === 4 ? 1.3 : 1.0;
        interval = Math.round(interval * ef * bonus);
      }

      rep += 1;
      nextDueDate = now + interval * 86400 * 1000;

      if (interval >= 21) {
        state = 'mastered';
      } else {
        state = 'review';
      }
    }

    return {
      repetition: rep,
      interval: interval,
      easeFactor: ef,
      dueDate: nextDueDate,
      state: state
    };
  },

  /**
   * Returns human-readable interval preview for UI buttons (e.g. "10 phút", "1 ngày", "4 ngày")
   */
  getIntervalPreview(currentSrs = {}, rating) {
    const next = this.calculateNext(currentSrs, rating);
    if (next.interval === 0) {
      return '< 10 phút';
    } else if (next.interval === 1) {
      return '1 ngày';
    } else if (next.interval < 30) {
      return `${next.interval} ngày`;
    } else {
      const months = Math.round(next.interval / 30);
      return `${months} tháng`;
    }
  },

  /**
   * Format due time human-readable
   */
  formatDueDate(timestamp) {
    if (!timestamp) return 'Ngay bây giờ';
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Đến hạn hôm nay';
    
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 60) return `Sau ${minutes} phút`;

    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 24) return `Sau ${hours} giờ`;

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `Sau ${days} ngày`;
  }
};
