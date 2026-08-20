import { dateKeyToDayIndex, toLocalDateKey } from './date-utils';
import greetingData from '../mobile/components/alarm/AlarmGreeting.json';

/** Messages that name a specific weekday — only eligible on that real weekday, never shown on a mismatched day. */
const DAY_SPECIFIC_MESSAGES: Record<number, string[]> = {
  0: ['Sunday slowdown.', 'Sunday word wisdom.'],
  1: ["Monday's here.", 'Monday motivation starts with a word.'],
  2: ["Tuesday's turned up.", "Tuesday's treasure hunt."],
  3: ['Wednesday wisdom.', "Wednesday's word walk."],
  4: ['Thursday already.', "Thursday's theme."],
  5: ['Friday feeling.', "Friday's final push."],
  6: ["Saturday's slow start."],
};

const DAY_SPECIFIC_SET = new Set(Object.values(DAY_SPECIFIC_MESSAGES).flat());

const GENERIC_MESSAGES = greetingData.wakeUpMessages.filter((message) => !DAY_SPECIFIC_SET.has(message));

/**
 * A greeting for the given date — stable for the whole local calendar day (not re-randomized on
 * every render), but a different pseudo-random pick from one day to the next. Weekday-specific
 * messages only enter the pool on their matching real weekday.
 */
export function alarmGreetingForDate(date: Date = new Date()): string {
  const pool = [...GENERIC_MESSAGES, ...(DAY_SPECIFIC_MESSAGES[date.getDay()] ?? [])];
  const dayIndex = dateKeyToDayIndex(toLocalDateKey(date));
  // Multiplicative hash decorrelates the pick from the word-of-day's own (dayIndex % length) rotation.
  const pick = Math.abs(dayIndex * 2654435761) % pool.length;
  return pool[pick];
}
