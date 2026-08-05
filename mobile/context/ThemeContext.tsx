import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { THEME_DARK, THEME_LIGHT, type ThemePalette } from '../../lib/adaptive-theme';
import { colors as staticColors } from '@/constants/theme';

type ThemeOverride = 'light' | 'dark';

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
  const [override, setOverride] = useState<ThemeOverride>('dark');

  const blend = override === 'light' ? 0 : 1;

  const palette = useMemo<ThemePalette>(
    () => (override === 'light' ? THEME_LIGHT : THEME_DARK),
    [override],
  );

  const colors = useMemo(() => mergePalette(palette), [palette]);

  const toggleOverride = useCallback(() => {
    setOverride((current) => (current === 'light' ? 'dark' : 'light'));
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
      colors: mergePalette(THEME_DARK),
      blend: 1,
      override: 'dark' as ThemeOverride,
      toggleOverride: () => {},
    };
  }
  return context;
}

export type AppThemeColors = ThemeContextValue['colors'];
