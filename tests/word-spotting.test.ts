import { describe, expect, it } from 'vitest';

import { isValidPassage, tokenizePassage } from '../lib/word-spotting';

describe('word spotting', () => {
  it('marks the single occurrence of the target word as the target token', () => {
    const tokens = tokenizePassage('The morning light was lucid and clear.', 'lucid');
    const targets = tokens.filter((t) => t.isTarget);
    expect(targets).toHaveLength(1);
    expect(targets[0].text).toBe('lucid');
  });

  it('matches case-insensitively but preserves original casing in the token text', () => {
    const tokens = tokenizePassage('Lucid dreams are rare.', 'lucid');
    const target = tokens.find((t) => t.isTarget);
    expect(target?.text).toBe('Lucid');
  });

  it('does not match a different inflection of the same root', () => {
    const tokens = tokenizePassage('Her lucidity impressed everyone.', 'lucid');
    expect(tokens.some((t) => t.isTarget)).toBe(false);
  });

  it('preserves punctuation and whitespace as non-word tokens', () => {
    const tokens = tokenizePassage('Hi, lucid!', 'lucid');
    const nonWord = tokens.filter((t) => !t.isWord).map((t) => t.text);
    expect(nonWord).toEqual([', ', '!']);
  });

  it('isValidPassage is true only when the target word appears exactly once', () => {
    expect(isValidPassage('The plan was lucid.', 'lucid')).toBe(true);
    expect(isValidPassage('No match here.', 'lucid')).toBe(false);
    expect(isValidPassage('Lucid, then lucid again.', 'lucid')).toBe(false);
  });
});
