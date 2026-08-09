// Pure snooze logic - no React/AsyncStorage imports, so it can be unit
// tested under plain Node/Vitest. lib/useSnooze.ts wraps this in a hook.

/** Default minutes a snoozed alarm is deferred by, before the user drags the slider. */
export const SNOOZE_MINUTES = 8;

/** Slider bounds — kept well short of a full sleep cycle so a snooze stays a snooze. */
export const SNOOZE_MIN_MINUTES = 1;
export const SNOOZE_MAX_MINUTES = 20;

export function toIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** One snooze per calendar day. */
export function isSnoozeAvailable(snoozedDate: string | null, today: string): boolean {
  return snoozedDate !== today;
}
