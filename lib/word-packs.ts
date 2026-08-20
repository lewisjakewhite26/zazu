/**
 * Static registry for Vocabulary's "Word packs" shelf. Content status is
 * tracked here by hand, not derived from a database query, since most packs
 * have no content yet -- see THEMATIC PACKS/ for what's actually drafted.
 */

export type WordPackStatus = 'available' | 'coming_soon';

export type WordPack = {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  status: WordPackStatus;
  /** Literary already has its own shipped Gym Round flow (MCQ, `literary_words` table) -- routes there instead of the generic pack-detail screen. */
  kind: 'literary' | 'standard';
};

export const WORD_PACKS: WordPack[] = [
  {
    id: 'literary',
    title: 'Literary',
    description: 'Words drawn from classic literature, with the quote that made them famous.',
    wordCount: 270,
    status: 'available',
    kind: 'literary',
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Chess, cards, and the language of play.',
    wordCount: 30,
    status: 'available',
    kind: 'standard',
  },
  {
    id: 'loan-words',
    title: 'Loan Words',
    description: 'Borrowed from African, American, classical, East Asian, and French roots.',
    wordCount: 180,
    status: 'available',
    kind: 'standard',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'The vocabulary of buildings and the people who design them.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'eponym',
    title: 'Eponyms',
    description: 'Words named after real people.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'geography',
    title: 'Geography',
    description: 'Landscapes, borders, and the words that describe them.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'law',
    title: 'Law',
    description: 'Legal terms worth actually understanding.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'music',
    title: 'Music',
    description: 'From tempo to timbre.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'mythology',
    title: 'Mythology',
    description: 'Gods, monsters, and the words they left behind.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
  {
    id: 'science',
    title: 'Science',
    description: 'Precise language for a precise subject.',
    wordCount: 0,
    status: 'coming_soon',
    kind: 'standard',
  },
];
