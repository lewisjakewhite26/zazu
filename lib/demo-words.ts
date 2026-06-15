import type { ZazuGymWord } from './supabase';

/** Offline Gym fallback when Supabase is unavailable. */
export const DEMO_GYM_WORDS: ZazuGymWord[] = [
  {
    id: 'demo-matutinal',
    word: 'Matutinal',
    pronunciation: 'mat·yoo·TY·nl',
    pos: 'adjective',
    definition: 'Of, relating to, or occurring in the morning.',
    origin:
      'From Latin <strong>matutinus</strong>, of the morning, from Matuta, the Roman goddess of the dawn.',
    gymRounds: [
      {
        type: 'Etymology',
        label: 'Round 1 of 3 · Etymology',
        context:
          'Where does <strong>Matutinal</strong> come from? Match each root to its meaning.',
        pairs: [
          { a: 'Latin matutinus', b: 'Of the morning' },
          { a: 'Matuta', b: 'Roman goddess of dawn' },
          { a: 'Root: mane', b: 'In the morning' },
          { a: 'Related word: mature', b: 'Early, timely' },
        ],
      },
      {
        type: 'Definition',
        label: 'Round 2 of 3 · Definition',
        context: 'What does <strong>Matutinal</strong> mean? Match each clue to the right answer.',
        pairs: [
          { a: 'Matutinal means', b: 'Of the morning' },
          { a: 'A matutinal bird sings', b: 'At dawn' },
          { a: 'Opposite of matutinal', b: 'Nocturnal' },
          { a: 'Part of speech', b: 'Adjective' },
        ],
      },
      {
        type: 'Usage',
        label: 'Round 3 of 3 · Usage',
        context:
          'How is <strong>Matutinal</strong> used? Match each sentence fragment to its correct completion.',
        pairs: [
          { a: 'She had a matutinal', b: 'Routine of stretching' },
          { a: 'His matutinal mood was', b: 'Unusually bright' },
          { a: "The robin's matutinal", b: 'Song woke the street' },
          { a: 'A matutinal cup of', b: 'Tea began every day' },
        ],
      },
    ],
  },
  {
    id: 'demo-lucid',
    word: 'Lucid',
    pronunciation: 'LOO·sid',
    pos: 'adjective',
    definition: 'Expressed clearly; easy to understand. Also: mentally clear, not confused.',
    origin: 'From Latin <strong>lucidus</strong>, bright, shining, clear. From <strong>lux</strong>, light.',
    gymRounds: [
      {
        type: 'Etymology',
        label: 'Round 1 of 3 · Etymology',
        context: 'Where does <strong>Lucid</strong> come from? Match each root to its meaning.',
        pairs: [
          { a: 'Latin lucidus', b: 'Bright, shining' },
          { a: 'Latin lux', b: 'Light' },
          { a: 'Related: elucidate', b: 'To make clear' },
          { a: 'Related: translucent', b: 'Letting light through' },
        ],
      },
      {
        type: 'Definition',
        label: 'Round 2 of 3 · Definition',
        context: 'What does <strong>Lucid</strong> mean? Match each clue to the right answer.',
        pairs: [
          { a: 'A lucid explanation is', b: 'Clear and easy to follow' },
          { a: 'A lucid dream means', b: 'You know you are dreaming' },
          { a: 'Lucid thinking is', b: 'Rational and clear' },
          { a: 'Synonym of lucid', b: 'Intelligible' },
        ],
      },
      {
        type: 'Usage',
        label: 'Round 3 of 3 · Usage',
        context: 'How is <strong>Lucid</strong> used? Match each fragment to its correct completion.',
        pairs: [
          { a: 'She gave a lucid', b: 'Account of events' },
          { a: 'Despite the fever he remained', b: 'Lucid and calm' },
          { a: "The professor's lucid", b: 'Style won praise' },
          { a: 'A lucid moment after', b: 'Weeks of confusion' },
        ],
      },
    ],
  },
  {
    id: 'demo-ephemeral',
    word: 'Ephemeral',
    pronunciation: 'ih·FEM·er·ul',
    pos: 'adjective',
    definition: 'Lasting for a very short time; transitory.',
    origin:
      'From Greek <strong>ephemeros</strong>, lasting only a day. From <strong>epi</strong> (on) + <strong>hemera</strong> (day).',
    gymRounds: [
      {
        type: 'Etymology',
        label: 'Round 1 of 3 · Etymology',
        context: 'Where does <strong>Ephemeral</strong> come from? Match each root to its meaning.',
        pairs: [
          { a: 'Greek ephemeros', b: 'Lasting only a day' },
          { a: 'Greek epi', b: 'On or upon' },
          { a: 'Greek hemera', b: 'Day' },
          { a: 'Related: ephemeris', b: 'A daily almanac' },
        ],
      },
      {
        type: 'Definition',
        label: 'Round 2 of 3 · Definition',
        context: 'What does <strong>Ephemeral</strong> mean? Match each clue to the right answer.',
        pairs: [
          { a: 'Ephemeral means', b: 'Lasting a very short time' },
          { a: 'An ephemeral trend', b: 'Fades quickly' },
          { a: 'Antonym of ephemeral', b: 'Enduring' },
          { a: 'Synonym of ephemeral', b: 'Fleeting' },
        ],
      },
      {
        type: 'Usage',
        label: 'Round 3 of 3 · Usage',
        context:
          'How is <strong>Ephemeral</strong> used? Match each fragment to its correct completion.',
        pairs: [
          { a: 'Cherry blossom is', b: 'Ephemeral but beloved' },
          { a: 'The fame proved', b: 'Entirely ephemeral' },
          { a: 'She captured the', b: 'Ephemeral morning light' },
          { a: 'Social media trends are', b: 'Inherently ephemeral' },
        ],
      },
    ],
  },
];

/** @deprecated Use DEMO_GYM_WORDS. */
export const DEMO_WORDS = DEMO_GYM_WORDS.map((word) => ({
  ...word,
  rounds: word.gymRounds,
}));
