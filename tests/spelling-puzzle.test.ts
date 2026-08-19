import { describe, expect, it } from 'vitest';

import { buildLetterBank, isComplete, isCorrect } from '../lib/spelling-puzzle';

describe('spelling puzzle', () => {
  it('bank has the word letters plus the requested decoy count', () => {
    const { slots, bankLetters } = buildLetterBank('ember', 4);
    expect(slots).toHaveLength(5);
    expect(bankLetters).toHaveLength(5 + 4);
  });

  it('bank contains every letter needed to spell the target word', () => {
    const { bankLetters } = buildLetterBank('letter', 3);
    const bankChars = bankLetters.map((l) => l.char).sort();
    for (const char of 'letter'.split('')) {
      expect(bankChars).toContain(char);
    }
  });

  it('correctly evaluates a fully and correctly placed word with duplicate letters', () => {
    const { slots } = buildLetterBank('letter', 0);
    const placed = 'letter'.split('');
    expect(isComplete(placed, slots)).toBe(true);
    expect(isCorrect(placed, slots, 'letter')).toBe(true);
  });

  it('rejects an incorrect but fully placed arrangement', () => {
    const { slots } = buildLetterBank('ember', 0);
    const placed = 'rembe'.split('');
    expect(isComplete(placed, slots)).toBe(true);
    expect(isCorrect(placed, slots, 'ember')).toBe(false);
  });

  it('is not complete while any interactive slot is empty', () => {
    const { slots } = buildLetterBank('dawn', 0);
    const placed: (string | null)[] = ['d', 'a', null, 'n'];
    expect(isComplete(placed, slots)).toBe(false);
  });

  it('treats non-letter characters as pre-filled and non-interactive', () => {
    const { slots, bankLetters } = buildLetterBank('re-up', 2);
    expect(slots[2]).toEqual({ char: '-', interactive: false });
    expect(bankLetters).toHaveLength(4 + 2);

    const placed: (string | null)[] = ['r', 'e', null, 'u', 'p'];
    expect(isComplete(placed, slots)).toBe(true);
    expect(isCorrect(placed, slots, 're-up')).toBe(true);
  });

  it('case-insensitive correctness check', () => {
    const { slots } = buildLetterBank('Ember', 0);
    const placed = 'EMBER'.split('');
    expect(isCorrect(placed, slots, 'Ember')).toBe(true);
  });
});
