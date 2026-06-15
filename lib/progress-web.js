/**
 * Browser progress store for zazu.html (localStorage).
 * Logic mirrors lib/useProgress.ts.
 */

(function () {
  const STORAGE_KEYS = {
    streak: 'zazu:streak',
    lastCompletedDate: 'zazu:lastCompletedDate',
    coins: 'zazu:coins',
    learnedWordIds: 'zazu:learnedWordIds',
    wordProgress: 'zazu:wordProgress',
  };

  function toIsoDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function toIsoDateTime(date = new Date()) {
    return date.toISOString();
  }

  function daysBetween(earlier, later) {
    const start = new Date(`${earlier}T12:00:00`);
    const end = new Date(`${later}T12:00:00`);
    return Math.round((end.getTime() - start.getTime()) / 86400000);
  }

  function nextStreak(current, lastCompleted, today) {
    if (!lastCompleted) return 1;
    if (lastCompleted === today) return current;

    const gap = daysBetween(lastCompleted, today);
    if (gap === 1) return current + 1;
    if (gap > 1) return 1;

    return current;
  }

  function coinsBreakdown(streak, noSnooze) {
    const puzzle = 15;
    const noSnoozeCoins = noSnooze ? 10 : 0;
    const streakBonus = streak >= 7 ? 25 : 0;
    return {
      puzzle,
      noSnooze: noSnoozeCoins,
      streakBonus,
      total: puzzle + noSnoozeCoins + streakBonus,
    };
  }

  function parseWordProgress(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry) => entry && typeof entry.wordId === 'string');
    } catch {
      return [];
    }
  }

  function getWordProgress(state, wordId) {
    return (
      state.wordProgress.find((entry) => entry.wordId === wordId) ?? {
        wordId,
        alarmCompletedAt: null,
        gymCompletedAt: null,
        gymMastery: 0,
        gymWrongCount: 0,
        nextReviewAt: null,
      }
    );
  }

  function upsertWordProgress(entries, next) {
    const index = entries.findIndex((entry) => entry.wordId === next.wordId);
    if (index === -1) return [...entries, next];
    const copy = entries.slice();
    copy[index] = next;
    return copy;
  }

  function readProgress() {
    const streakRaw = localStorage.getItem(STORAGE_KEYS.streak);
    const coinsRaw = localStorage.getItem(STORAGE_KEYS.coins);
    const lastCompletedDate = localStorage.getItem(STORAGE_KEYS.lastCompletedDate);
    const learnedRaw = localStorage.getItem(STORAGE_KEYS.learnedWordIds);
    const wordProgressRaw = localStorage.getItem(STORAGE_KEYS.wordProgress);

    const streak = Number.parseInt(streakRaw ?? '0', 10);
    const coins = Number.parseInt(coinsRaw ?? '0', 10);

    let learnedWordIds = [];
    if (learnedRaw) {
      try {
        const parsed = JSON.parse(learnedRaw);
        learnedWordIds = Array.isArray(parsed)
          ? parsed.filter((id) => typeof id === 'string')
          : [];
      } catch {
        learnedWordIds = [];
      }
    }

    return {
      streak: Number.isFinite(streak) ? streak : 0,
      coins: Number.isFinite(coins) ? coins : 0,
      lastCompletedDate: lastCompletedDate || null,
      learnedWordIds,
      wordProgress: parseWordProgress(wordProgressRaw),
    };
  }

  function writeProgress(state) {
    localStorage.setItem(STORAGE_KEYS.streak, String(state.streak));
    localStorage.setItem(STORAGE_KEYS.coins, String(state.coins));
    localStorage.setItem(STORAGE_KEYS.lastCompletedDate, state.lastCompletedDate ?? '');
    localStorage.setItem(STORAGE_KEYS.learnedWordIds, JSON.stringify(state.learnedWordIds));
    localStorage.setItem(STORAGE_KEYS.wordProgress, JSON.stringify(state.wordProgress ?? []));
  }

  function getWordId(word) {
    if (!word) return '';
    if (word.id) return word.id;
    return `word:${String(word.word).toLowerCase()}`;
  }

  /** Morning alarm completion. Updates streak, coins, and learnedWordIds. */
  function completeWord(wordId, options = {}) {
    const noSnooze = options.noSnooze ?? true;
    const today = toIsoDate();
    const now = toIsoDateTime();

    const saved = readProgress();
    const newStreak = nextStreak(saved.streak, saved.lastCompletedDate, today);
    const breakdown = coinsBreakdown(newStreak, noSnooze);
    const earned = breakdown.total;
    const newLearned = saved.learnedWordIds.includes(wordId)
      ? saved.learnedWordIds
      : [...saved.learnedWordIds, wordId];

    const existing = getWordProgress(saved, wordId);
    const wordProgress = upsertWordProgress(saved.wordProgress, {
      ...existing,
      wordId,
      alarmCompletedAt: now,
    });

    const next = {
      streak: newStreak,
      lastCompletedDate: today,
      coins: saved.coins + earned,
      learnedWordIds: newLearned,
      wordProgress,
    };

    writeProgress(next);

    return {
      streak: next.streak,
      coinsEarned: earned,
      totalCoins: next.coins,
      breakdown,
    };
  }

  /** Word Gym completion. Updates gym mastery only. */
  function completeGym(wordId, options = {}) {
    const now = toIsoDateTime();
    const saved = readProgress();
    const existing = getWordProgress(saved, wordId);
    const gymCoins = 20;
    const gymMastery = Math.min(100, options.mastery ?? 100);

    const wordProgress = upsertWordProgress(saved.wordProgress, {
      ...existing,
      wordId,
      gymCompletedAt: now,
      gymMastery,
      gymWrongCount: (existing.gymWrongCount ?? 0) + (options.wrongCount ?? 0),
      nextReviewAt: null,
    });

    const next = {
      ...saved,
      coins: saved.coins + gymCoins,
      wordProgress,
    };

    writeProgress(next);

    return {
      coinsEarned: gymCoins,
      totalCoins: next.coins,
      gymMastery,
    };
  }

  window.ZazuProgress = {
    readProgress,
    writeProgress,
    completeWord,
    completeGym,
    getWordId,
    toIsoDate,
  };
})();
