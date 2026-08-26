import { getSupabase } from './supabase';
import { stripHtml } from './puzzle-utils';
import { shuffle } from './shuffle';

export type LiteraryMatchRound = {
  type: 'Etymology';
  format: 'match';
  label: string;
  context: string;
  pairs: { a: string; b: string }[];
};

export type LiteraryMcqRound = {
  type: 'QuoteCompletion' | 'ContextualDefinition';
  format: 'mcq';
  label: string;
  context: string;
  prompt?: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  targetWord?: string;
};

export type LiteraryRound = LiteraryMatchRound | LiteraryMcqRound;

export type LiteraryWord = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  authorGroup: string;
  source: { author: string; work: string; date: string; quote: string };
  rounds: LiteraryRound[];
};

/** The quiz card the Literary Gym Round screen renders one at a time. */
export type LiteraryMcqQuestion = {
  wordId: string;
  word: string;
  roundTitle: string;
  context: string;
  excerptLabel: string;
  excerptText: string;
  question: string;
  options: string[];
  correctIndex: number;
};

type LiteraryWordRow = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  author_group: string;
  source: LiteraryWord['source'];
  rounds: LiteraryRound[];
};

/** Above this, a hung fetch would otherwise block the Gym screen indefinitely. */
const FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function mapRow(row: LiteraryWordRow): LiteraryWord {
  return {
    id: row.id,
    word: row.word,
    pronunciation: row.pronunciation,
    pos: row.pos,
    definition: row.definition,
    origin: row.origin,
    authorGroup: row.author_group,
    source: row.source,
    rounds: row.rounds,
  };
}

/** RLS-gated to Gold entitlement holders - returns [] for free users, guests, or if Supabase isn't configured. */
export async function fetchLiteraryWords(): Promise<LiteraryWord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await withTimeout(
      supabase.from('literary_words').select('*').order('display_order'),
      FETCH_TIMEOUT_MS,
      'literary_words fetch',
    );

    if (error) {
      console.error('[Zazu] Literary word fetch failed:', error.message);
      return [];
    }

    return (data ?? []).map((row: LiteraryWordRow) => mapRow(row));
  } catch (error) {
    console.error('[Zazu] Literary word fetch failed:', error instanceof Error ? error.message : error);
    return [];
  }
}

const ROUND_TITLES: Record<LiteraryMcqRound['type'], string> = {
  QuoteCompletion: 'Quote completion',
  ContextualDefinition: 'Contextual definition',
};

const EXCERPT_LABELS: Record<LiteraryMcqRound['type'], string> = {
  QuoteCompletion: 'Complete the line',
  ContextualDefinition: 'Read the passage',
};

function mcqRoundToQuestion(word: LiteraryWord, round: LiteraryMcqRound): LiteraryMcqQuestion {
  const excerptSource = round.type === 'QuoteCompletion' ? round.prompt : round.passage;

  return {
    wordId: word.id,
    word: word.word,
    roundTitle: ROUND_TITLES[round.type],
    context: stripHtml(round.context),
    excerptLabel: EXCERPT_LABELS[round.type],
    excerptText: stripHtml(excerptSource ?? ''),
    question: stripHtml(round.context),
    options: round.options,
    correctIndex: round.correctIndex,
  };
}

/**
 * Picks a handful of literary words and turns their two MCQ rounds (Quote
 * Completion, Contextual Definition) into a flat quiz. The Etymology round
 * (match-pairs) isn't included here - it's a different interaction shape
 * from the rest of Word Gym's MCQ modes, and the word's own etymology is
 * already covered by the definition/origin text shown on the card.
 */
export function buildLiteraryQuestions(
  literaryWords: LiteraryWord[],
  count: number = 3,
): LiteraryMcqQuestion[] {
  const chosen = shuffle(literaryWords).slice(0, Math.min(count, literaryWords.length));
  const questions: LiteraryMcqQuestion[] = [];

  for (const word of chosen) {
    const mcqRounds = word.rounds.filter((round): round is LiteraryMcqRound => round.format === 'mcq');
    for (const round of mcqRounds) {
      questions.push(mcqRoundToQuestion(word, round));
    }
  }

  return questions;
}
