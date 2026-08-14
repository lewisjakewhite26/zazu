import { describe, expect, it } from 'vitest';

import { toLocalDateKey, dateKeyToDayIndex } from '../lib/date-utils';
import { pickWordOfDay } from '../lib/supabase';

describe('word of the day', () => {
  const words = Array.from({ length: 20 }, (_, i) => ({ id: `w${i}`, word: `word${i}` }));

  it('same date key always resolves to the same word', () => {
    const a = pickWordOfDay(words, '2026-08-10');
    const b = pickWordOfDay(words, '2026-08-10');
    expect(a?.id).toBe(b?.id);
  });

  it('consecutive local days produce different, sequential indices', () => {
    const i1 = dateKeyToDayIndex('2026-08-10');
    const i2 = dateKeyToDayIndex('2026-08-11');
    expect(i2 - i1).toBe(1);
  });

  it('a Date object at 23:30 local time keys to that local calendar day, not a shifted UTC day', () => {
    const lateNightLocal = new Date(2026, 7, 10, 23, 30);
    expect(toLocalDateKey(lateNightLocal)).toBe('2026-08-10');
  });

  it('a Date object just after local midnight keys to the new day', () => {
    const justAfterMidnightLocal = new Date(2026, 7, 11, 0, 5);
    expect(toLocalDateKey(justAfterMidnightLocal)).toBe('2026-08-11');
  });

  it('resolves to a real word for a normal-sized pool', () => {
    const word = pickWordOfDay(words, '2026-08-10');
    expect(word).toBeDefined();
  });
});
