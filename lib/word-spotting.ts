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
