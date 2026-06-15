import type { ZazuAlarmWord } from './morning-task';
import type { UserWordProgressLocal } from './morning-task';

export type CalendarCardVariant = 'peach' | 'lavender' | 'blush' | 'dawn';

export type CalendarDayEntry = {
  date: Date;
  dayOffset: number;
  word: ZazuAlarmWord;
  variant: CalendarCardVariant;
  dateLabelShort: string;
  dateLabelLong: string;
  completed: boolean;
  dismissSeconds: number | null;
  gymCompleted: boolean;
  coinsEarned: number | null;
  firstTry: boolean;
};

const CARD_VARIANTS: CalendarCardVariant[] = ['lavender', 'blush', 'dawn', 'peach'];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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

export function dayIndexFromDate(date: Date): number {
  return Math.floor(date.getTime() / 86400000);
}

/** Word assigned to a calendar day (same rule as pickWordOfDay). */
export function wordForDate(words: ZazuAlarmWord[], date: Date): ZazuAlarmWord | null {
  if (!words.length) return null;
  const dayIndex = dayIndexFromDate(date);
  return words[dayIndex % words.length] ?? null;
}

export function startOfLocalDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDateShort(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${weekday} ${day} ${month}`;
}

export function formatDateLong(date: Date): string {
  const weekday = WEEKDAYS_LONG[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

export function formatHeroDate(date: Date): string {
  return formatDateLong(date);
}

export function formatDismissTime(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return '–';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function cardVariantForOffset(dayOffset: number): CalendarCardVariant {
  if (dayOffset <= 0) return 'peach';
  return CARD_VARIANTS[(dayOffset - 1) % CARD_VARIANTS.length];
}

export function getWordProgressEntry(
  wordProgress: UserWordProgressLocal[],
  wordId: string,
): UserWordProgressLocal | null {
  return wordProgress.find((entry) => entry.wordId === wordId) ?? null;
}

export function buildCalendarEntries(
  words: ZazuAlarmWord[],
  learnedWordIds: string[],
  wordProgress: UserWordProgressLocal[],
  historyDays: number,
): CalendarDayEntry[] {
  const today = startOfLocalDay();
  const entries: CalendarDayEntry[] = [];

  for (let offset = 0; offset < historyDays; offset += 1) {
    const date = addDays(today, -offset);
    const word = wordForDate(words, date);
    if (!word) continue;

    const progress = getWordProgressEntry(wordProgress, word.id);
    const completed =
      learnedWordIds.includes(word.id) || Boolean(progress?.alarmCompletedAt);

    entries.push({
      date,
      dayOffset: offset,
      word,
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

/** Free users can open today and yesterday only. */
export function isDayAccessibleForFree(dayOffset: number): boolean {
  return dayOffset <= 1;
}

export function countLearnedForTier(
  entries: CalendarDayEntry[],
  isGold: boolean,
): number {
  if (isGold) {
    return entries.filter((entry) => entry.completed).length;
  }
  return entries
    .filter((entry) => isDayAccessibleForFree(entry.dayOffset) && entry.completed)
    .length;
}

export function introEtymologyPlain(word: ZazuAlarmWord): string {
  if (word.introEtymology?.spans?.length) {
    return word.introEtymology.spans.map((span) => span.text).join('');
  }
  return word.origin.replace(/<[^>]+>/g, '');
}
