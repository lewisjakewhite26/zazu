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
  ink: '#1a1225',
  muted: '#9080a0',
  correct: '#a8d8b0',
  wrong: '#e8617a',
  gold: '#c9963a',
  white: '#fefcfb',
  card: 'rgba(255,255,255,0.72)',
  /** Lighter, airier glass-card fill/border — GlassCard only, not the shared `border` token. */
  glassCardFill: 'rgba(255,255,255,0.4)',
  glassCardBorder: 'rgba(255,255,255,0.8)',
  bgFrom: '#fde8d8',
  bgMid: '#dde8f8',
  bgTo: '#ede0f8',
  text: '#1a1225',
  subtext: '#9080a0',
  border: 'rgba(26,18,37,0.1)',
} as const;

/** index.html body.night overrides */
export const colorsDark = {
  card: 'rgba(255,255,255,0.11)',
  glassCardFill: 'rgba(255,255,255,0.11)',
  glassCardBorder: 'rgba(255,255,255,0.13)',
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
  posBadgeBg: 'rgba(26,18,37,0.07)',
  posBadgeBgNight: 'rgba(255,255,255,0.08)',
  /** Primary button dark — body.night .add-alarm-btn */
  primaryButtonBgNight: 'rgba(255,255,255,0.12)',
  /** Toggle thumb shadow */
  toggleThumbShadow: 'rgba(0,0,0,0.15)',
  correctIcon: '#5cbd8a',
  overlay: 'rgba(26,18,37,0.45)',
  appleButtonBg: '#000000',
  appleButtonText: '#ffffff',
  streakFlame: '#e8a040',
  /** Success word card — index.html .word-card-success */
  successWordGradientStart: 'rgba(249,201,168,0.28)',
  successWordGradientEnd: 'rgba(200,180,232,0.28)',
  successWordGradientStartNight: 'rgba(249,201,168,0.08)',
  successWordGradientEndNight: 'rgba(200,180,232,0.08)',
  /** Streak banner — index.html .streak-banner */
  streakBannerStart: 'rgba(249,201,168,0.22)',
  streakBannerEnd: 'rgba(240,160,188,0.22)',
  streakBannerBorder: 'rgba(240,160,188,0.28)',
  /** Wake / continue CTA at night — index.html .btn-wake */
  wakeButtonBgNight: 'rgba(255,255,255,0.9)',
  wakeButtonTextNight: '#1a1225',
  /** Ad pill — index.html .ad-pill */
  adPillBg: 'rgba(26,18,37,0.07)',
  adPillBgNight: 'rgba(255,255,255,0.08)',
  /** Alarm glow — index.html .alarm-glow */
  alarmGlowLight: 'rgba(249,201,168,0.25)',
  alarmGlowDark: 'rgba(200,180,232,0.15)',
  /** Success glow — index.html .success-glow */
  successGlow: 'rgba(168,216,176,0.3)',
} as const;

export const fonts = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  serif: 'DMSerifText_400Regular',
} as const;

/** index.html linear-gradient(160deg, …) */
export const backgroundGradientAngle = 160;
export const backgroundTransitionMs = 2000;
export const cardBlurIntensity = 20;

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
    fontSize: 12, // was 11 (.7rem)
    letterSpacing: 1.1, // .1em
  },
  wotdEyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11, // was 10 (.65rem)
    letterSpacing: 1.2, // .12em
  },
  wotdPron: {
    fontFamily: fonts.sans,
    fontSize: 13, // was 12 (.78rem)
    fontStyle: 'italic' as const,
  },
  wotdDef: {
    fontFamily: fonts.sans,
    fontSize: 15, // was 14 (.88rem)
    lineHeight: 23, // was 22
  },
  wotdOrigin: {
    fontFamily: fonts.sans,
    fontSize: 13, // was 12 (.75rem)
    lineHeight: 19, // was 18
  },
  posBadge: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11, // was 10 (.62rem)
    letterSpacing: 0.8,
  },
  alarmMeta: {
    fontFamily: fonts.sans,
    fontSize: 13, // was 12 (.72rem)
  },
  streakCount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15, // was 14 (.9rem)
    letterSpacing: -0.14,
  },
  streakLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10, // was 9 (.56rem)
    letterSpacing: 0.72,
  },
  coinAmount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15, // was 14
    letterSpacing: -0.14,
  },
  btnPrimary: {
    fontFamily: fonts.sansMedium,
    fontSize: 16, // was 15 (.95rem)
  },
  btnDemo: {
    fontFamily: fonts.sans,
    fontSize: 14, // was 13 (.82rem)
  },
  tagline: {
    fontFamily: fonts.serif,
    fontSize: 22,
    letterSpacing: -0.44,
    lineHeight: 28,
  },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12, // was 11 (.68rem)
    letterSpacing: 1.32, // .12em
  },
  learnWord: {
    fontFamily: fonts.serif,
    fontSize: 42, // clamp max ~8vw
    letterSpacing: -0.84,
  },
  learnPron: {
    fontFamily: fonts.sans,
    fontSize: 15, // was 14 (.88rem)
    fontStyle: 'italic' as const,
  },
  learnDef: {
    fontFamily: fonts.sans,
    fontSize: 17, // was 16
    lineHeight: 25, // was 24
  },
  etymLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11, // was 10 (.62rem)
    letterSpacing: 1,
  },
  etymBody: {
    fontFamily: fonts.sans,
    fontSize: 15, // was 14 (.88rem)
    lineHeight: 23, // was 22
  },
  mtQuestion: {
    fontFamily: fonts.sansMedium,
    fontSize: 18, // was 17 (1.05rem)
    lineHeight: 26, // was 25
  },
  mtOption: {
    fontFamily: fonts.sans,
    fontSize: 16, // was 15 (.92rem)
    lineHeight: 23, // was 22
  },
  alarmBigTime: {
    fontFamily: fonts.serif,
    fontSize: 40,
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  alarmLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14, // was 12 (.72rem)
    letterSpacing: 1.8, // .14em
  },
  /** The daily rotating alarm greeting — sentence case, not the tracked-out eyebrow style, since message length varies widely. */
  alarmGreeting: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  alarmWordEyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    letterSpacing: 1.6,
  },
  alarmWord: {
    fontFamily: fonts.serif,
    fontSize: 54,
    letterSpacing: -1.08,
  },
  alarmSub: {
    fontFamily: fonts.sans,
    fontSize: 16, // was 12 (.78rem)
    fontWeight: '300' as const,
  },
  btnWake: {
    fontFamily: fonts.sansMedium,
    fontSize: 18, // was 17 (1.05rem)
  },
  successHeading: {
    fontFamily: fonts.serif,
    fontSize: 36,
    letterSpacing: -0.72,
  },
  successSub: {
    fontFamily: fonts.sans,
    fontSize: 16, // was 15 (.92rem)
    fontWeight: '300' as const,
  },
  puzzleWordMain: {
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: -0.64,
  },
  puzzleWordRound: {
    fontFamily: fonts.sansMedium,
    fontSize: 12, // was 11 (.68rem)
    letterSpacing: 1.32,
  },
  adBrand: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
  },
  adCopy: {
    fontFamily: fonts.sans,
    fontSize: 14, // was 13 (.84rem)
    lineHeight: 21, // was 20
  },
} as const;

export type ThemeColors = typeof colors;
