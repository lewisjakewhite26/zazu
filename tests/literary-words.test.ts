import { describe, expect, it } from 'vitest';

import { buildLiteraryQuestions } from '../lib/literary-words';
import type { LiteraryWord } from '../lib/literary-words';

function makeLiteraryWord(id: string, overrides: Partial<LiteraryWord> = {}): LiteraryWord {
  return {
    id,
    word: `Word${id}`,
    pronunciation: `pron-${id}`,
    pos: 'noun',
    definition: `Definition of ${id}`,
    origin: `Origin of ${id}`,
    authorGroup: 'milton',
    source: { author: 'John Milton', work: 'Paradise Lost', date: '1667', quote: 'A long quote.' },
    rounds: [
      {
        type: 'Etymology',
        format: 'match',
        label: 'Round 1 of 3 · Etymology',
        context: 'ctx',
        pairs: [{ a: 'root', b: 'meaning' }],
      },
      {
        type: 'QuoteCompletion',
        format: 'mcq',
        label: 'Round 2 of 3 · Quote Completion',
        context: `Complete <strong>${id}</strong>'s line.`,
        prompt: `…and call'd it <strong>${id}</strong>`,
        options: [`Correct completion ${id}`, 'Wrong A', 'Wrong B', 'Wrong C'],
        correctIndex: 0,
      },
      {
        type: 'ContextualDefinition',
        format: 'mcq',
        label: 'Round 3 of 3 · Contextual Definition',
        context: `What does <strong>${id}</strong> mean here?`,
        passage: `A passage mentioning ${id}.`,
        options: ['Wrong X', `Correct meaning ${id}`, 'Wrong Y', 'Wrong Z'],
        correctIndex: 1,
      },
    ],
    ...overrides,
  };
}

describe('buildLiteraryQuestions', () => {
  const words = Array.from({ length: 5 }, (_, i) => makeLiteraryWord(String(i)));

  it('produces exactly 2 questions per chosen word (Quote Completion + Contextual Definition)', () => {
    const questions = buildLiteraryQuestions(words, 3);
    expect(questions).toHaveLength(6);

    const byWordId = new Map<string, number>();
    for (const q of questions) {
      byWordId.set(q.wordId, (byWordId.get(q.wordId) ?? 0) + 1);
    }
    expect(byWordId.size).toBe(3);
    for (const count of byWordId.values()) {
      expect(count).toBe(2);
    }
  });

  it('never includes the Etymology (match-format) round as a question', () => {
    const questions = buildLiteraryQuestions(words, 5);
    expect(questions.every((q) => q.roundTitle !== 'Etymology')).toBe(true);
  });

  it('preserves the correct answer at correctIndex', () => {
    const questions = buildLiteraryQuestions([words[0]], 1);
    const quoteQ = questions.find((q) => q.roundTitle === 'Quote completion');
    const defQ = questions.find((q) => q.roundTitle === 'Contextual definition');

    expect(quoteQ?.options[quoteQ.correctIndex]).toBe('Correct completion 0');
    expect(defQ?.options[defQ.correctIndex]).toBe('Correct meaning 0');
  });

  it('strips HTML markup from context and excerpt text', () => {
    const questions = buildLiteraryQuestions([words[0]], 1);
    for (const q of questions) {
      expect(q.context).not.toContain('<strong>');
      expect(q.context).not.toContain('</strong>');
      expect(q.excerptText).not.toContain('<strong>');
    }
  });

  it('labels Quote Completion and Contextual Definition rounds distinctly', () => {
    const questions = buildLiteraryQuestions([words[0]], 1);
    const quoteQ = questions.find((q) => q.roundTitle === 'Quote completion');
    const defQ = questions.find((q) => q.roundTitle === 'Contextual definition');

    expect(quoteQ?.excerptLabel).toBe('Complete the line');
    expect(quoteQ?.excerptText).toContain("call'd it 0");
    expect(defQ?.excerptLabel).toBe('Read the passage');
    expect(defQ?.excerptText).toContain('A passage mentioning 0');
  });

  it('caps at the number of words available', () => {
    const questions = buildLiteraryQuestions(words.slice(0, 2), 10);
    const uniqueWordIds = new Set(questions.map((q) => q.wordId));
    expect(uniqueWordIds.size).toBe(2);
  });

  it('returns an empty array when given no words', () => {
    expect(buildLiteraryQuestions([], 3)).toHaveLength(0);
  });

  it('skips a word cleanly if it somehow has no mcq-format rounds', () => {
    const bare = makeLiteraryWord('bare', { rounds: [] });
    const questions = buildLiteraryQuestions([bare], 1);
    expect(questions).toHaveLength(0);
  });
});
