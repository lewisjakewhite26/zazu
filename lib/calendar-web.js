/**
 * Browser calendar helpers for zazu.html.
 * Logic mirrors lib/calendar-utils.ts.
 */

(function () {
  const CARD_VARIANTS = ['lavender', 'blush', 'dawn', 'peach'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WEEKDAYS_LONG = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  function dayIndexFromDate(date) {
    return Math.floor(date.getTime() / 86400000);
  }

  function wordForDate(words, date) {
    if (!words?.length) return null;
    const dayIndex = dayIndexFromDate(date);
    return words[dayIndex % words.length] ?? null;
  }

  function startOfLocalDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function formatDateShort(date) {
    return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  }

  function formatDateLong(date) {
    return `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function formatDismissTime(seconds) {
    if (seconds == null || seconds <= 0) return '–';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }

  function cardVariantForOffset(dayOffset) {
    if (dayOffset <= 0) return 'peach';
    return CARD_VARIANTS[(dayOffset - 1) % CARD_VARIANTS.length];
  }

  function getWordId(word) {
    if (!word) return '';
    if (word.id) return word.id;
    return `word:${String(word.word).toLowerCase()}`;
  }

  function getWordProgressEntry(wordProgress, wordId) {
    return wordProgress.find((entry) => entry.wordId === wordId) ?? null;
  }

  function buildCalendarEntries(words, learnedWordIds, wordProgress, historyDays) {
    const today = startOfLocalDay();
    const entries = [];

    for (let offset = 0; offset < historyDays; offset += 1) {
      const date = addDays(today, -offset);
      const word = wordForDate(words, date);
      if (!word) continue;

      const wordId = getWordId(word);
      const progress = getWordProgressEntry(wordProgress, wordId);
      const completed = learnedWordIds.includes(wordId) || Boolean(progress?.alarmCompletedAt);

      entries.push({
        date,
        dayOffset: offset,
        word,
        wordId,
        variant: cardVariantForOffset(offset),
        dateLabelShort: formatDateShort(date),
        dateLabelLong: formatDateLong(date),
        completed,
        dismissSeconds: progress?.dismissSeconds ?? null,
        gymCompleted: Boolean(progress?.gymCompletedAt),
        coinsEarned: progress?.coinsEarned ?? null,
        firstTry: (progress?.coinsEarned ?? 0) >= 50,
      });
    }

    return entries;
  }

  function isDayAccessibleForFree(dayOffset) {
    return dayOffset <= 1;
  }

  function countLearnedForTier(entries, isGold) {
    if (isGold) {
      return entries.filter((entry) => entry.completed).length;
    }
    return entries.filter(
      (entry) => isDayAccessibleForFree(entry.dayOffset) && entry.completed,
    ).length;
  }

  function introEtymologyPlain(word) {
    if (word.introEtymology?.spans?.length) {
      return word.introEtymology.spans.map((span) => span.text).join('');
    }
    return String(word.origin ?? '').replace(/<[^>]+>/g, '');
  }

  function resolveGymDisplay(isGold, gymCompleted, alarmCompleted) {
    if (!alarmCompleted) return 'pending';
    if (gymCompleted) return 'done';
    if (!isGold) return 'locked';
    return 'open';
  }

  window.ZazuCalendar = {
    buildCalendarEntries,
    isDayAccessibleForFree,
    countLearnedForTier,
    formatDismissTime,
    introEtymologyPlain,
    resolveGymDisplay,
    getWordId,
  };
})();
