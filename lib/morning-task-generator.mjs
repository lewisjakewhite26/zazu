/**
 * Generate morning task metadata from zazu-words.json entries.
 * Used by seed validation and scripts/generate-morning-tasks.mjs.
 */

export const GENERATOR_VERSION = '1';

const SKIP_PAIR_A = /^(combined meaning|related|opposite|synonym|antonym|part of speech)/i;
const LANG_PREFIX =
  /^(Latin|Greek|Old English|French|German|Sanskrit|Arabic|Italian|Spanish|Norwegian|Proto-Germanic|Middle English|Persian|Hebrew|Dutch|Irish|Welsh|Scottish Gaelic)\s+(.+)$/i;

export function findEtymologyRound(entry) {
  return entry.rounds?.find((r) => /^etymology/i.test(r.type)) ?? entry.rounds?.[0];
}

export function findDefinitionRound(entry) {
  return entry.rounds?.find((r) => /^definition/i.test(r.type)) ?? entry.rounds?.[1];
}

export function extractRoots(entry) {
  const round = findEtymologyRound(entry);
  if (!round?.pairs?.length) return [];

  const roots = [];
  for (const pair of round.pairs) {
    const a = String(pair.a ?? '').trim();
    const b = String(pair.b ?? '').trim();
    if (!a || !b) continue;
    if (SKIP_PAIR_A.test(a)) continue;

    const langMatch = a.match(LANG_PREFIX);
    if (langMatch) {
      roots.push({
        rootText: langMatch[2].trim(),
        rootLanguage: langMatch[1],
        rootMeaning: b,
        showInIntro: true,
      });
      continue;
    }

    if (/^Root:/i.test(a)) {
      roots.push({
        rootText: a.replace(/^Root:\s*/i, '').trim(),
        rootLanguage: null,
        rootMeaning: b,
        showInIntro: true,
      });
    }
  }

  return roots;
}

export function buildIntroEtymology(roots, entry) {
  if (roots.length) {
    const spans = [{ text: 'From ', highlight: false }];
    roots.forEach((root, index) => {
      if (root.rootLanguage) {
        spans.push({ text: `${root.rootLanguage} `, highlight: false });
      }
      spans.push({ text: root.rootText, highlight: true });
      spans.push({ text: ` (${root.rootMeaning.toLowerCase()})`, highlight: false });
      if (index < roots.length - 1) {
        spans.push({ text: ' + ', highlight: false });
      }
    });
    spans.push({ text: '.', highlight: false });
    return { spans };
  }

  const plain = String(entry?.origin ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return null;

  return { spans: [{ text: plain, highlight: false }] };
}

export function definitionParaphrase(entry) {
  const defRound = findDefinitionRound(entry);
  const pair = defRound?.pairs?.find((p) => /means|describes/i.test(String(p.a ?? '')));
  if (pair?.b) return String(pair.b).trim();

  const firstSentence = String(entry.definition ?? '')
    .split(/[.;]/)[0]
    ?.trim();
  return firstSentence || String(entry.definition ?? '').trim();
}

export function generateMorningTask(entry, roots) {
  if (roots.length > 0) {
    const root = roots[0];
    return {
      taskType: 'root',
      sourceKind: 'root',
      sourceValue: root.rootText,
      correctAnswer: root.rootMeaning,
      hint: 'Check the highlighted roots in the etymology line.',
      generatorVersion: GENERATOR_VERSION,
    };
  }

  const etymRound = findEtymologyRound(entry);
  const combined = etymRound?.pairs?.find((p) => /^combined meaning/i.test(String(p.a ?? '')));
  if (combined) {
    return {
      taskType: 'etymology',
      sourceKind: 'origin_summary',
      sourceValue: String(combined.a).replace(/^combined meaning:?/i, '').trim() || entry.word,
      correctAnswer: String(combined.b).trim(),
      hint: 'Read the etymology line again.',
      generatorVersion: GENERATOR_VERSION,
    };
  }

  return {
    taskType: 'definition',
    sourceKind: 'definition',
    sourceValue: entry.word,
    correctAnswer: definitionParaphrase(entry),
    hint: 'Check the definition you just read.',
    generatorVersion: GENERATOR_VERSION,
  };
}

/** Collect answer-like strings from a word record for distractor exclusion. */
export function collectWordAnswerTexts(entry, roots, morningTask) {
  const texts = new Set();
  const add = (value) => {
    const normalised = String(value ?? '').trim().toLowerCase();
    if (normalised) texts.add(normalised);
  };

  add(entry.definition);
  add(morningTask?.correctAnswer);
  for (const root of roots) {
    add(root.rootMeaning);
    add(root.rootText);
  }
  for (const round of entry.rounds ?? []) {
    for (const pair of round.pairs ?? []) {
      add(pair.a);
      add(pair.b);
    }
  }

  if (entry.introEtymology?.spans) {
    for (const span of entry.introEtymology.spans) {
      add(span.text);
    }
  }

  return texts;
}

export function enrichWordEntry(entry) {
  const roots = extractRoots(entry);
  const introEtymology = buildIntroEtymology(roots, entry);
  const morningTask = generateMorningTask(entry, roots);

  return {
    ...entry,
    roots,
    introEtymology,
    morningTask,
  };
}

export function validateMorningTaskBlock(entry, index) {
  const label = entry.word ?? `#${index + 1}`;
  const required = ['taskType', 'sourceKind', 'sourceValue', 'correctAnswer', 'generatorVersion'];
  if (!entry.morningTask) {
    throw new Error(`Word "${label}": missing morningTask block`);
  }
  for (const key of required) {
    if (entry.morningTask[key] == null || entry.morningTask[key] === '') {
      throw new Error(`Word "${label}": morningTask missing "${key}"`);
    }
  }
  if (!['root', 'definition', 'etymology'].includes(entry.morningTask.taskType)) {
    throw new Error(`Word "${label}": morningTask.taskType must be root, definition, or etymology`);
  }
  if (!entry.introEtymology?.spans?.length) {
    throw new Error(`Word "${label}": missing introEtymology.spans`);
  }
  if (!Array.isArray(entry.roots)) {
    throw new Error(`Word "${label}": missing roots array`);
  }
}

export function validateMorningTaskMatchesRules(entry, index) {
  validateMorningTaskBlock(entry, index);
  const generated = enrichWordEntry({
    word: entry.word,
    definition: entry.definition,
    rounds: entry.rounds,
  });
  const g = generated.morningTask;
  const e = entry.morningTask;
  if (g.taskType !== e.taskType || g.correctAnswer !== e.correctAnswer) {
    throw new Error(
      `Word "${entry.word}": morningTask out of date (expected taskType=${g.taskType}, correctAnswer="${g.correctAnswer}"). Run npm run words:morning-tasks`,
    );
  }
}
