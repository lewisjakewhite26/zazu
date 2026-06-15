/** User-facing copy. See writing-rules.md at project root. */
export const copy = {
  brand: {
    wordmark: 'zazu',
    tagline: 'A new word. Every morning.',
    pageTitle: 'Zazu. Wake up. Learn something.',
  },
  home: {
    wordOfDayEyebrow: 'Word of the day',
    yourAlarms: 'Your alarms',
    addAlarm: '+ Add alarm',
    tryTheAlarm: 'Try the alarm',
    dayStreak: 'day streak',
    weekdaysPack: 'Weekdays · Words pack',
    weekendsPack: 'Weekends · Words pack',
  },
  alarm: {
    goodMorning: 'Good morning',
    todaysWord: "Today's word:",
    threeRounds: 'Three rounds to learn it properly',
    wakeCta: "I'm awake. Let's go.",
  },
  ad: {
    eyebrow: 'One quick message',
    pill: 'Ad. Keeps Zazu free.',
  },
  success: {
    heading: "You're up.",
    sub: 'One new word. Carry it with you today.',
    wordLearned: 'Word learned',
    coinsEarned: 'Coins earned',
    puzzleCompleted: 'Puzzle completed',
    noSnooze: 'No snooze',
    streakBonus: 'Streak bonus',
    total: 'Total',
    done: 'Done',
    streakCount: (n: number) => `${n} day streak!`,
    streakSubtitle: (title: string) => `${title}. Keep it going tomorrow.`,
  },
  puzzle: {
    roundLabel: (round: number, type: string) => `Round ${round} of 3 · ${type}`,
    emptyPlaceholder: '–',
  },
  placeholder: {
    matutinalOrigin:
      'From Latin matutinus, of the morning, from Matuta, the Roman goddess of the dawn.',
  },
  a11y: {
    streak: (n: number) => `${n} day streak`,
    coins: (n: number) => `${n} coins`,
    wordOfDay: (word: string, definition: string) => `Word of the day: ${word}. ${definition}`,
    alarmToggle: (time: string, enabled: boolean) => `Alarm ${time}, ${enabled ? 'on' : 'off'}`,
  },
} as const;
