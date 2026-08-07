import { describe, expect, it } from 'vitest';

import { isSnoozeAvailable, SNOOZE_MINUTES } from '../lib/snooze-logic';

describe('isSnoozeAvailable', () => {
  it('is available when no snooze has ever been recorded', () => {
    expect(isSnoozeAvailable(null, '2026-08-07')).toBe(true);
  });

  it('is unavailable once used on the same calendar day', () => {
    expect(isSnoozeAvailable('2026-08-07', '2026-08-07')).toBe(false);
  });

  it('is available again once the date rolls over', () => {
    expect(isSnoozeAvailable('2026-08-07', '2026-08-08')).toBe(true);
  });
});

describe('SNOOZE_MINUTES', () => {
  it('falls within the 5-10 minute spec', () => {
    expect(SNOOZE_MINUTES).toBeGreaterThanOrEqual(5);
    expect(SNOOZE_MINUTES).toBeLessThanOrEqual(10);
  });
});
