/**
 * Pure logic for the morning-task spelling puzzle: build a shuffled letter
 * bank (the word's own letters + a few decoys) and check completion/
 * correctness. No React/RN imports, so it can be unit tested directly.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export type SlotSpec = {
  /** The character this slot must hold, lowercase. */
  char: string;
  /** Non-letter slots (space, hyphen, apostrophe...) are pre-filled and not tappable. */
  interactive: boolean;
};

export type BankLetter = {
  id: string;
  char: string;
};

export type LetterBank = {
  slots: SlotSpec[];
  bankLetters: BankLetter[];
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

/** Splits `word` into slots and builds a shuffled bank of its letters plus `decoyCount` random decoys. */
export function buildLetterBank(word: string, decoyCount = 4): LetterBank {
  const chars = word.toLowerCase().split('');

  const slots: SlotSpec[] = chars.map((char) => ({
    char,
    interactive: /[a-z]/.test(char),
  }));

  const wordLetters = chars.filter((char) => /[a-z]/.test(char));
  const decoys = Array.from({ length: decoyCount }, randomLetter);

  const bankLetters: BankLetter[] = shuffle([...wordLetters, ...decoys]).map((char, index) => ({
    id: `letter-${index}-${char}`,
    char,
  }));

  return { slots, bankLetters };
}

/** True once every interactive slot holds a letter. */
export function isComplete(placed: (string | null)[], slots: SlotSpec[]): boolean {
  return slots.every((slot, index) => !slot.interactive || placed[index] !== null);
}

/** Case-insensitive full-word comparison of the placed letters against the target. */
export function isCorrect(placed: (string | null)[], slots: SlotSpec[], targetWord: string): boolean {
  const assembled = slots.map((slot, index) => (slot.interactive ? placed[index] ?? '' : slot.char)).join('');
  return assembled.toLowerCase() === targetWord.toLowerCase();
}
