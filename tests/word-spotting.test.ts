import { describe, expect, it } from 'vitest';

import { candidateTokens, isValidPassage, tokenizePassage } from '../lib/word-spotting';

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

  it('candidateTokens drops grammatical filler and keeps real words plus the target', () => {
    const tokens = tokenizePassage(
      'She always did her best thinking during a quiet matutinal walk, before the street had woken up.',
      'matutinal',
    );
    const candidates = candidateTokens(tokens).map((c) => c.token.text);
    expect(candidates).toEqual([
      'always',
      'best',
      'thinking',
      'quiet',
      'matutinal',
      'walk',
      'street',
      'woken',
    ]);
    expect(candidates).not.toContain('She');
    expect(candidates).not.toContain('the');
  });

  it('candidateTokens preserves the original token index for each candidate', () => {
    const tokens = tokenizePassage('The plan was lucid.', 'lucid');
    const candidates = candidateTokens(tokens);
    for (const { token, index } of candidates) {
      expect(tokens[index]).toBe(token);
    }
  });

  it('candidateTokens always includes the target word', () => {
    const tokens = tokenizePassage('It was lucid.', 'lucid');
    const candidates = candidateTokens(tokens);
    expect(candidates.some((c) => c.token.isTarget)).toBe(true);
  });
});
