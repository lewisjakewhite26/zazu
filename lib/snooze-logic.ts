// Pure snooze logic - no React/AsyncStorage imports, so it can be unit
// tested under plain Node/Vitest. lib/useSnooze.ts wraps this in a hook.

/** Minutes a snoozed alarm is deferred by. Spec: 5-10 min, picked the midpoint. */
export const SNOOZE_MINUTES = 8;

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
