import type { ZazuAlarmWord } from './supabase';

/** Offline alarm-path fallback (Matutinal, Lucid, Ephemeral). */
export const DEMO_ALARM_WORDS: ZazuAlarmWord[] = [
  {
    id: 'demo-matutinal',
    word: 'Matutinal',
    pronunciation: 'mat·yoo·TY·nl',
    pos: 'adjective',
    definition: 'Of, relating to, or occurring in the morning.',
    origin:
      'From Latin <strong>matutinus</strong>, of the morning, from Matuta, the Roman goddess of the dawn.',
    introEtymology: {
      spans: [
        { text: 'From ', highlight: false },
        { text: 'Latin ', highlight: false },
        { text: 'matutinus', highlight: true },
        { text: ' (of the morning).', highlight: false },
      ],
    },
    morningTask: {
      taskType: 'root',
      sourceKind: 'root',
      sourceValue: 'matutinus',
      correctAnswer: 'Of the morning',
      hint: 'Check the highlighted roots in the etymology line.',
    },
  },
  {
    id: 'demo-lucid',
    word: 'Lucid',
    pronunciation: 'LOO·sid',
    pos: 'adjective',
    definition: 'Expressed clearly; easy to understand. Also: mentally clear, not confused.',
    origin: 'From Latin <strong>lucidus</strong>, bright, shining, clear. From <strong>lux</strong>, light.',
    introEtymology: {
      spans: [
        { text: 'From ', highlight: false },
        { text: 'Latin ', highlight: false },
        { text: 'lucidus', highlight: true },
        { text: ' (bright, shining) + ', highlight: false },
        { text: 'Latin ', highlight: false },
        { text: 'lux', highlight: true },
        { text: ' (light).', highlight: false },
      ],
    },
    morningTask: {
      taskType: 'root',
      sourceKind: 'root',
      sourceValue: 'lucidus',
      correctAnswer: 'Bright, shining',
      hint: 'Check the highlighted roots in the etymology line.',
    },
  },
  {
    id: 'demo-ephemeral',
    word: 'Ephemeral',
    pronunciation: 'ih·FEM·er·ul',
    pos: 'adjective',
    definition: 'Lasting for a very short time; transitory.',
    origin:
      'From Greek <strong>ephemeros</strong>, lasting only a day. From <strong>epi</strong> (on) + <strong>hemera</strong> (day).',
    introEtymology: {
      spans: [
        { text: 'From ', highlight: false },
        { text: 'Greek ', highlight: false },
        { text: 'ephemeros', highlight: true },
        { text: ' (lasting only a day) + ', highlight: false },
        { text: 'Greek ', highlight: false },
        { text: 'epi', highlight: true },
        { text: ' (on or upon) + ', highlight: false },
        { text: 'Greek ', highlight: false },
        { text: 'hemera', highlight: true },
        { text: ' (day).', highlight: false },
      ],
    },
    morningTask: {
      taskType: 'root',
      sourceKind: 'root',
      sourceValue: 'ephemeros',
      correctAnswer: 'Lasting only a day',
      hint: 'Check the highlighted roots in the etymology line.',
    },
  },
];
