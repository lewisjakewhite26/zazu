/**
 * Browser morning task helper for zazu.html (mirrors lib/morning-task.ts).
 */
(function (global) {
  const QUESTION_TEMPLATES = {
    root: (_word, sourceValue) => `What does ${sourceValue} mean?`,
    definition: (word) => `What does ${word} mean?`,
    etymology: (word) => `Which best describes where ${word} comes from?`,
  };

  function normaliseAnswer(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  function morningQuestionText(word, task) {
    const template = QUESTION_TEMPLATES[task.taskType];
    return template ? template(word, task.sourceValue) : `What does ${word} mean?`;
  }

  function collectExcludedAnswers(word) {
    const excluded = new Set();
    const add = (value) => {
      const n = normaliseAnswer(value);
      if (n) excluded.add(n);
    };

    add(word.definition);
    if (word.morningTask) {
      add(word.morningTask.correctAnswer);
      add(word.morningTask.sourceValue);
    }
    add(word.word);

    if (word.introEtymology?.spans) {
      for (const span of word.introEtymology.spans) add(span.text);
    }

    return excluded;
  }

  function weightedSample(items) {
    if (!items.length) return null;
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }
    return items[items.length - 1] ?? null;
  }

  function pickMorningDistractors(taskType, pool, excluded, count) {
    const candidates = pool.filter(
      (d) =>
        d.taskType === taskType &&
        !excluded.has(normaliseAnswer(d.answerText)) &&
        d.answerText.trim().length > 0,
    );

    const picked = [];
    const used = new Set();

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

  function buildMorningOptions(word, pool, optionCount = 3) {
    const task = word.morningTask;
    const excluded = collectExcludedAnswers(word);
    excluded.add(normaliseAnswer(task.correctAnswer));

    const distractorCount = Math.max(1, optionCount - 1);
    const distractors = pickMorningDistractors(task.taskType, pool, excluded, distractorCount);

    const options = [task.correctAnswer, ...distractors];
    while (options.length < optionCount) options.push(task.correctAnswer);

    const shuffled = options.slice(0, optionCount);
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

  function ensureMorningTask(word) {
    if (word.morningTask) return word;
    return {
      ...word,
      introEtymology: word.introEtymology ?? null,
      morningTask: {
        taskType: 'definition',
        sourceKind: 'definition',
        sourceValue: word.word,
        correctAnswer: word.definition,
        hint: null,
      },
    };
  }

  function fallbackDistractorPool(words) {
    return words
      .filter((w) => w.definition)
      .map((w) => ({
        taskType: 'definition',
        answerText: w.definition,
        weight: 1,
      }));
  }

  global.ZazuMorningTask = {
    buildMorningOptions,
    ensureMorningTask,
    fallbackDistractorPool,
    morningQuestionText,
  };
})(typeof window !== 'undefined' ? window : globalThis);
