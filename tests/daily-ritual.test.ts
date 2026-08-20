import { describe, expect, it } from 'vitest';

import { buildDailyRitual } from '../lib/daily-ritual';
import type { ZazuAlarmWord, ZazuGymWord } from '../lib/supabase';

function makeAlarmWord(id: string, overrides: Partial<ZazuAlarmWord> = {}): ZazuAlarmWord {
  return {
    id,
    word: `Word${id}`,
    pronunciation: `pron-${id}`,
    pos: 'adjective',
    definition: `Definition of word ${id}`,
    origin: `Origin of word ${id}`,
    introEtymology: null,
    morningTask: {
      taskType: 'root',
      sourceKind: 'root',
      sourceValue: `root-${id}`,
      correctAnswer: `meaning-${id}`,
      hint: null,
    },
    ...overrides,
  };
}

function makeGymWord(id: string, overrides: Partial<ZazuGymWord> = {}): ZazuGymWord {
  return {
    id,
    word: `Word${id}`,
    pronunciation: `pron-${id}`,
    pos: 'adjective',
    definition: `Definition of word ${id}`,
    origin: `Origin of word ${id}`,
    gymRounds: [
      {
        type: 'Etymology',
        gymRoundType: 'etymology',
        label: 'Round 1',
        context: 'ctx',
        pairs: [{ a: `root-${id}`, b: `meaning-${id}` }],
      },
      {
        type: 'Usage',
        gymRoundType: 'usage',
        label: 'Round 2',
        context: 'ctx',
        pairs: [{ a: `fragment-${id}`, b: `completion-${id}` }],
      },
    ],
    ...overrides,
  };
}

describe('daily ritual', () => {
  it('builds a definition question with distractors sampled from other words', () => {
    const today = makeAlarmWord('1');
    const others = [makeAlarmWord('2'), makeAlarmWord('3'), makeAlarmWord('4')];
    const ritual = buildDailyRitual(today, [today, ...others], undefined, []);

    const defQuestion = ritual.mcqQuestions.find((q) => q.question.includes('mean'));
    expect(defQuestion).toBeDefined();
    expect(defQuestion?.options).toContain(today.definition);
    expect(defQuestion?.options[defQuestion.correctIndex]).toBe(today.definition);
  });

  it('omits the definition question when there are not enough other words for distractors', () => {
    const today = makeAlarmWord('1');
    const ritual = buildDailyRitual(today, [today], undefined, []);
    expect(ritual.mcqQuestions.some((q) => q.question.includes('mean'))).toBe(false);
  });

  it('includes roots and usage questions when a matching gym word with rounds exists', () => {
    const today = makeAlarmWord('1');
    const others = [makeAlarmWord('2'), makeAlarmWord('3')];
    const gymToday = makeGymWord('1');
    const gymOthers = [makeGymWord('2'), makeGymWord('3')];
    const ritual = buildDailyRitual(today, [today, ...others], gymToday, [gymToday, ...gymOthers]);

    expect(ritual.mcqQuestions.length).toBe(3);
  });
});
