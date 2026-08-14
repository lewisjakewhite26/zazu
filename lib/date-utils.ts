/**
 * Local (device) calendar date as YYYY-MM-DD. Deliberately not
 * `toISOString()` (which converts to UTC first) — that flips to the next/
 * previous day near midnight depending on the device's timezone offset,
 * which is exactly what a "same word for everyone, on their own calendar
 * day" feature needs to avoid.
 */
export function toLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic day count for a YYYY-MM-DD key. Pure calendar-date
 * arithmetic on the key's own year/month/day - not tied to `Date.now()` or
 * the caller's current timezone, so every device resolves the same key to
 * the same index.
 */
export function dateKeyToDayIndex(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}
