import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getThemeBlend,
  resolveThemePalette,
  type ThemePalette,
} from '../../lib/adaptive-theme';
import { colors as staticColors } from '@/constants/theme';

type ThemeOverride = 'light' | 'dark' | null;

type ThemeContextValue = {
  colors: ReturnType<typeof mergePalette>;
  blend: number;
  override: ThemeOverride;
  toggleOverride: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STATIC_EXTRAS = {
  peach: staticColors.peach,
  blush: staticColors.blush,
  lavender: staticColors.lavender,
  dawn: staticColors.dawn,
  dusk: staticColors.dusk,
  muted: staticColors.muted,
  gold: staticColors.gold,
  white: staticColors.white,
  correct: staticColors.correct,
  correctIcon: staticColors.correctIcon,
  wrong: staticColors.wrong,
  overlay: staticColors.overlay,
  streakFlameStart: staticColors.streakFlameStart,
  streakFlameEnd: staticColors.streakFlameEnd,
  coinGradientStart: staticColors.coinGradientStart,
  coinGradientEnd: staticColors.coinGradientEnd,
  toggleThumbShadow: staticColors.toggleThumbShadow,
  appleButtonBg: staticColors.appleButtonBg,
  appleButtonText: staticColors.appleButtonText,
  cardPeach: staticColors.cardPeach,
  cardPeachBorder: staticColors.cardPeachBorder,
  cardLavender: staticColors.cardLavender,
  cardLavenderBorder: staticColors.cardLavenderBorder,
  cardBlush: staticColors.cardBlush,
  cardBlushBorder: staticColors.cardBlushBorder,
  cardDawn: staticColors.cardDawn,
  cardDawnBorder: staticColors.cardDawnBorder,
  sheetSecondary: staticColors.sheetSecondary,
  streakFlame: staticColors.streakFlame,
  successWordGradientStart: staticColors.successWordGradientStart,
  successWordGradientEnd: staticColors.successWordGradientEnd,
  successWordGradientStartNight: staticColors.successWordGradientStartNight,
  successWordGradientEndNight: staticColors.successWordGradientEndNight,
  streakBannerStart: staticColors.streakBannerStart,
  streakBannerEnd: staticColors.streakBannerEnd,
  streakBannerBorder: staticColors.streakBannerBorder,
  wakeButtonBgNight: staticColors.wakeButtonBgNight,
  wakeButtonTextNight: staticColors.wakeButtonTextNight,
  adPillBg: staticColors.adPillBg,
  adPillBgNight: staticColors.adPillBgNight,
  alarmGlowLight: staticColors.alarmGlowLight,
  alarmGlowDark: staticColors.alarmGlowDark,
  successGlow: staticColors.successGlow,
} as const;

function mergePalette(palette: ThemePalette) {
  return { ...STATIC_EXTRAS, ...palette };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [override, setOverride] = useState<ThemeOverride>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const blend = useMemo(() => {
    if (override === 'light') return 0;
    if (override === 'dark') return 1;
    return getThemeBlend(now);
  }, [now, override]);

  const palette = useMemo(
    () => resolveThemePalette(now, override),
    [now, override],
  );

  const colors = useMemo(() => mergePalette(palette), [palette]);

  const toggleOverride = useCallback(() => {
    setOverride((current) => {
      const currentBlend =
        current === 'light' ? 0 : current === 'dark' ? 1 : getThemeBlend(new Date());
      return currentBlend >= 0.5 ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      colors,
      blend,
      override,
      toggleOverride,
    }),
    [colors, blend, override, toggleOverride],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      colors: mergePalette(resolveThemePalette()),
      blend: getThemeBlend(),
      override: null as ThemeOverride,
      toggleOverride: () => {},
    };
  }
  return context;
}

export type AppThemeColors = ThemeContextValue['colors'];
