// Pure snooze logic - no React/AsyncStorage imports, so it can be unit
// tested under plain Node/Vitest. lib/useSnooze.ts wraps this in a hook.

import { toLocalDateKey } from './date-utils';

/** Default minutes a snoozed alarm is deferred by, before the user drags the slider. */
export const SNOOZE_MINUTES = 8;

/** Slider bounds — kept well short of a full sleep cycle so a snooze stays a snooze. */
export const SNOOZE_MIN_MINUTES = 1;
export const SNOOZE_MAX_MINUTES = 20;

/** @deprecated Use toLocalDateKey from lib/date-utils.ts. Kept as an alias so existing imports don't break. */
export const toIsoDate = toLocalDateKey;

/** One snooze per calendar day. */
export function isSnoozeAvailable(snoozedDate: string | null, today: string): boolean {
  return snoozedDate !== today;
}
