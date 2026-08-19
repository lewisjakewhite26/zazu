/**
 * Pure logic for the morning-task "find the word" screen: split a passage
 * into tappable word tokens and mark the one that matches the word of the
 * day. No React/RN imports, so it can be unit tested directly.
 */

export type PassageToken = {
  text: string;
  /** Tappable word token; false for whitespace/punctuation runs. */
  isWord: boolean;
  /** True for the single word token matching the target word (case-insensitive, exact form). */
  isTarget: boolean;
};

const WORD_PATTERN = /[A-Za-z'’]+/g;

/**
 * Standard English stop words (articles, pronouns, prepositions, auxiliary
 * verbs, etc.) -- grammatical filler a sighted user's eye discards
 * automatically while scanning a sentence. Used to shrink the passage down
 * to real candidate words for the screen-reader selection list; see
 * candidateTokens below.
 */
const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
]);

/**
 * Splits `passage` into tokens for rendering, preserving all original
 * whitespace/punctuation. Passages are expected to contain the target word
 * exactly once -- see isValidPassage.
 */
export function tokenizePassage(passage: string, targetWord: string): PassageToken[] {
  const target = targetWord.trim().toLowerCase();
  const tokens: PassageToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  WORD_PATTERN.lastIndex = 0;
  while ((match = WORD_PATTERN.exec(passage)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: passage.slice(lastIndex, match.index), isWord: false, isTarget: false });
    }
    const word = match[0];
    tokens.push({ text: word, isWord: true, isTarget: word.toLowerCase() === target });
    lastIndex = match.index + word.length;
  }
  if (lastIndex < passage.length) {
    tokens.push({ text: passage.slice(lastIndex), isWord: false, isTarget: false });
  }

  return tokens;
}

/** The shape every stored passage must satisfy: the target word appears exactly once. */
export function isValidPassage(passage: string, targetWord: string): boolean {
  return tokenizePassage(passage, targetWord).filter((token) => token.isTarget).length === 1;
}

export type PassageCandidate = {
  token: PassageToken;
  /** Index into the original tokens array, so selection re-uses the same tap-handling logic. */
  index: number;
};

/**
 * Content-word candidates for the screen-reader selection list: the target
 * word plus every other real word, minus grammatical filler (see
 * STOPWORDS). Screen-reader users can't visually skim past "the"/"was"/"her"
 * the way a sighted user does, so this does it for them -- same recognition
 * task, far fewer stops to swipe through.
 */
export function candidateTokens(tokens: PassageToken[]): PassageCandidate[] {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.isWord && !STOPWORDS.has(token.text.toLowerCase()));
}
