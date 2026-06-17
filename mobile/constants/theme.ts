/**
 * Design tokens extracted from index.html (:root + body.night).
 * Reference via useTheme().colors — never hardcode hex in components.
 */

/** index.html :root */
export const colorsLight = {
  peach: '#f9c9a8',
  blush: '#f0a0bc',
  lavender: '#c8b4e8',
  dawn: '#fde8d8',
  dusk: '#ede0f8',
  ink: '#2c1f2e',
  muted: '#9080a0',
  correct: '#a8d8b0',
  wrong: '#e8617a',
  gold: '#c9963a',
  white: '#fefcfb',
  card: 'rgba(255,255,255,0.72)',
  bgFrom: '#fde8d8',
  bgMid: '#dde8f8',
  bgTo: '#ede0f8',
  text: '#2c1f2e',
  subtext: '#9080a0',
  border: 'rgba(44,31,46,0.1)',
} as const;

/** index.html body.night overrides */
export const colorsDark = {
  card: 'rgba(255,255,255,0.11)',
  bgFrom: '#1a1225',
  bgMid: '#1a1830',
  bgTo: '#0e0c1a',
  text: '#f0e8f8',
  subtext: '#b0a0c8',
  border: 'rgba(255,255,255,0.13)',
  ink: '#f0e8f8',
} as const;

/** Static palette (:root) — peach/blush/etc. do not change at night */
export const colors = {
  ...colorsLight,
  /** Streak flame circle — index.html .streak-flame-wrap */
  streakFlameStart: 'rgba(249,180,80,0.35)',
  streakFlameEnd: 'rgba(240,100,80,0.25)',
  /** Coin chip — index.html .coin-chip-icon */
  coinGradientStart: '#f0c060',
  coinGradientEnd: '#c9963a',
  /** WOTD light — index.html .wotd-hero */
  wotdGradientStart: 'rgba(249,201,168,0.35)',
  wotdGradientEnd: 'rgba(200,180,232,0.35)',
  /** WOTD dark — body.night .wotd-hero */
  wotdGradientStartNight: 'rgba(249,201,168,0.08)',
  wotdGradientEndNight: 'rgba(200,180,232,0.08)',
  /** POS badge — index.html .wotd-pos */
  posBadgeBg: 'rgba(44,31,46,0.07)',
  posBadgeBgNight: 'rgba(255,255,255,0.08)',
  /** Primary button dark — body.night .add-alarm-btn */
  primaryButtonBgNight: 'rgba(255,255,255,0.12)',
  /** Toggle thumb shadow */
  toggleThumbShadow: 'rgba(0,0,0,0.15)',
  correctIcon: '#5cbd8a',
  overlay: 'rgba(44,31,46,0.45)',
  appleButtonBg: '#000000',
  appleButtonText: '#ffffff',
  /** Legacy calendar card tints — not in index.html home; kept for other screens */
  cardPeach: '#fde8d8',
  cardPeachBorder: 'rgba(249,201,168,0.5)',
  cardLavender: '#ede0f8',
  cardLavenderBorder: 'rgba(200,180,232,0.5)',
  cardBlush: '#fce8f0',
  cardBlushBorder: 'rgba(240,160,188,0.5)',
  cardDawn: '#e8f0fd',
  cardDawnBorder: 'rgba(168,196,232,0.5)',
  sheetSecondary: 'rgba(255,255,255,0.72)',
  streakFlame: '#e8a040',
} as const;

export const fonts = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  serif: 'DMSerifDisplay_400Regular',
} as const;

/** index.html linear-gradient(160deg, …) */
export const backgroundGradientAngle = 160;
export const backgroundTransitionMs = 2000;
export const cardBlurIntensity = 10;

export const radii = {
  wotd: 22,
  alarmCard: 18,
  cardMd: 18,
  pill: 999,
} as const;

/** Typography — 1rem = 16px, values from index.html */
export const typography = {
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 26, // 1.6rem
    letterSpacing: -0.52, // -.02em
  },
  wordHero: {
    fontFamily: fonts.serif,
    fontSize: 32, // 2rem
    letterSpacing: -0.64,
  },
  alarmTime: {
    fontFamily: fonts.serif,
    fontSize: 30, // 1.9rem
    letterSpacing: -0.9, // -.03em
    lineHeight: 30,
  },
  sectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11, // .7rem
    letterSpacing: 1.1, // .1em
  },
  wotdEyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10, // .65rem
    letterSpacing: 1.2, // .12em
  },
  wotdPron: {
    fontFamily: fonts.sans,
    fontSize: 12, // .78rem
    fontStyle: 'italic' as const,
  },
  wotdDef: {
    fontFamily: fonts.sans,
    fontSize: 14, // .88rem
    lineHeight: 22, // 1.55
  },
  wotdOrigin: {
    fontFamily: fonts.sans,
    fontSize: 12, // .75rem
    lineHeight: 18,
  },
  posBadge: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10, // .62rem
    letterSpacing: 0.8,
  },
  alarmMeta: {
    fontFamily: fonts.sans,
    fontSize: 12, // .72rem
  },
  streakCount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14, // .9rem
    letterSpacing: -0.14,
  },
  streakLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9, // .56rem
    letterSpacing: 0.72,
  },
  coinAmount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    letterSpacing: -0.14,
  },
  btnPrimary: {
    fontFamily: fonts.sansMedium,
    fontSize: 15, // .95rem
  },
  btnDemo: {
    fontFamily: fonts.sans,
    fontSize: 13, // .82rem
  },
} as const;

export type ThemeColors = typeof colors;
