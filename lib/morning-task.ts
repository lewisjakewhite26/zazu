/**
 * Morning task types, question templates, and distractor sampling.
 */

export type MorningTaskType = 'root' | 'definition' | 'etymology';

export type MorningSourceKind = 'root' | 'definition' | 'origin_summary';

export type IntroEtymologySpan = {
  text: string;
  highlight: boolean;
};

export type IntroEtymology = {
  spans: IntroEtymologySpan[];
};

export type MorningTask = {
  taskType: MorningTaskType;
  sourceKind: MorningSourceKind | string;
  sourceValue: string;
  correctAnswer: string;
  hint: string | null;
};

export type MorningTaskDistractor = {
  id?: string;
  taskType: MorningTaskType;
  answerText: string;
  weight: number;
};

export type ZazuAlarmWord = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  introEtymology: IntroEtymology | null;
  tier?: string;
  morningTask: MorningTask;
};

const QUESTION_TEMPLATES: Record<MorningTaskType, (word: string, sourceValue: string) => string> = {
  root: (_word, sourceValue) => `What does ${sourceValue} mean?`,
  definition: (word) => `What does ${word} mean?`,
  etymology: (word) => `Which best describes where ${word} comes from?`,
};

export function morningQuestionText(word: string, task: MorningTask): string {
  const template = QUESTION_TEMPLATES[task.taskType];
  return template(word, task.sourceValue);
}

function normaliseAnswer(value: string): string {
  return value.trim().toLowerCase();
}

/** Collect strings from a word that must not appear as distractors. */
export function collectExcludedAnswers(word: ZazuAlarmWord): Set<string> {
  const excluded = new Set<string>();
  const add = (value: string | null | undefined) => {
    const n = normaliseAnswer(String(value ?? ''));
    if (n) excluded.add(n);
  };

  add(word.definition);
  add(word.morningTask.correctAnswer);
  add(word.morningTask.sourceValue);
  add(word.word);

  if (word.introEtymology?.spans) {
    for (const span of word.introEtymology.spans) {
      add(span.text);
    }
  }

  return excluded;
}

function weightedSample<T extends { weight: number }>(items: T[]): T | null {
  if (!items.length) return null;
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

/** Pick distractors for a morning task, excluding today's word content. */
export function pickMorningDistractors(
  taskType: MorningTaskType,
  pool: MorningTaskDistractor[],
  excluded: Set<string>,
  count: number,
): string[] {
  const candidates = pool.filter(
    (d) =>
      d.taskType === taskType &&
      !excluded.has(normaliseAnswer(d.answerText)) &&
      d.answerText.trim().length > 0,
  );

  const picked: string[] = [];
  const used = new Set<string>();

  while (picked.length < count && candidates.length > 0) {
    const remaining = candidates.filter((c) => !used.has(normaliseAnswer(c.answerText)));
    if (!remaining.length) break;

    const choice = weightedSample(remaining);
    if (!choice) break;

    const key = normaliseAnswer(choice.answerText);
    used.add(key);
    picked.push(choice.answerText);
  }

  return picked;
}

/** Build 2–3 shuffled options including the correct answer. */
export function buildMorningOptions(
  word: ZazuAlarmWord,
  pool: MorningTaskDistractor[],
  optionCount = 3,
): { question: string; options: string[]; correctIndex: number } {
  const task = word.morningTask;
  const excluded = collectExcludedAnswers(word);
  excluded.add(normaliseAnswer(task.correctAnswer));

  const distractorCount = Math.max(1, optionCount - 1);
  const distractors = pickMorningDistractors(task.taskType, pool, excluded, distractorCount);

  const options = [task.correctAnswer, ...distractors];
  while (options.length < optionCount) {
    options.push(task.correctAnswer);
  }

  const shuffled = [...options.slice(0, optionCount)];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const correctIndex = shuffled.findIndex(
    (opt) => normaliseAnswer(opt) === normaliseAnswer(task.correctAnswer),
  );

  return {
    question: morningQuestionText(word.word, task),
    options: shuffled,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

export type UserWordProgressLocal = {
  wordId: string;
  alarmCompletedAt: string | null;
  gymCompletedAt: string | null;
  gymMastery: number;
  gymWrongCount: number;
  nextReviewAt: string | null;
  dismissSeconds?: number | null;
  coinsEarned?: number | null;
};
