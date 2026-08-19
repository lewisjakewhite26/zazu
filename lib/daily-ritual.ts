/**
 * Daily Ritual: a short, free, optional 3-4 question sequence about just
 * today's word, offered after the alarm is dismissed. Built entirely from
 * data every word already has -- no new content or backend fetch needed.
 * Word Gym (paid) stays the deeper, cross-word drilling experience.
 */
import type { GymMcqQuestion } from './gym-modes';
import { buildRootsDrillQuestions, buildUsageLabQuestions } from './gym-modes';
import type { ZazuAlarmWord, ZazuGymWord } from './supabase';
import { tokenizePassage } from './word-spotting';

const DEFINITION_OPTION_COUNT = 3;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** "What does [word] mean?" -- distractors sampled from other words' definitions, same pattern gym-modes.ts already uses. */
function buildDefinitionQuestion(
  alarmWord: ZazuAlarmWord,
  allAlarmWords: ZazuAlarmWord[],
): GymMcqQuestion | null {
  const correctAnswer = alarmWord.definition?.trim();
  if (!correctAnswer) return null;

  const distractorPool = allAlarmWords
    .filter((word) => word.id !== alarmWord.id)
    .map((word) => word.definition?.trim())
    .filter((definition): definition is string => Boolean(definition) && definition !== correctAnswer);

  const distractors = shuffle(Array.from(new Set(distractorPool))).slice(0, DEFINITION_OPTION_COUNT - 1);
  if (distractors.length < DEFINITION_OPTION_COUNT - 1) return null;

  const options = shuffle([correctAnswer, ...distractors]);
  return {
    wordId: alarmWord.id,
    word: alarmWord.word,
    question: `What does "${alarmWord.word}" mean?`,
    options,
    correctIndex: options.indexOf(correctAnswer),
  };
}

export type DailyRitualPassageStep = {
  passage: string;
  targetWord: string;
};

export type DailyRitual = {
  mcqQuestions: GymMcqQuestion[];
  /** Present only when the word has a pre-generated passage -- most words don't yet. */
  passageStep: DailyRitualPassageStep | null;
};

/**
 * Builds today's ritual from whatever this word already has: a definition
 * question, a roots question and a usage question when the matching gym
 * word/rounds exist, and a tap-to-find passage step when one's been
 * generated for this word. Silently omits any step whose source data is
 * missing rather than failing -- a 2-3 question ritual is fine.
 */
export function buildDailyRitual(
  alarmWord: ZazuAlarmWord,
  allAlarmWords: ZazuAlarmWord[],
  gymWord: ZazuGymWord | undefined,
  allGymWords: ZazuGymWord[],
): DailyRitual {
  const mcqQuestions: GymMcqQuestion[] = [];

  const definitionQuestion = buildDefinitionQuestion(alarmWord, allAlarmWords);
  if (definitionQuestion) mcqQuestions.push(definitionQuestion);

  if (gymWord) {
    const [rootsQuestion] = buildRootsDrillQuestions([gymWord], allGymWords);
    if (rootsQuestion) mcqQuestions.push(rootsQuestion);

    const [usageQuestion] = buildUsageLabQuestions([gymWord], allGymWords);
    if (usageQuestion) mcqQuestions.push(usageQuestion);
  }

  const passage = alarmWord.morningTask.passage;
  const passageStep: DailyRitualPassageStep | null =
    passage && tokenizePassage(passage, alarmWord.word).some((token) => token.isTarget)
      ? { passage, targetWord: alarmWord.word }
      : null;

  return { mcqQuestions, passageStep };
}
