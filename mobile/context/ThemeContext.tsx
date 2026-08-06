import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { THEME_DARK, getThemeBlend, resolveThemePalette, type ThemePalette } from '../../lib/adaptive-theme';
import { colors as staticColors } from '@/constants/theme';

/** 'auto' follows the real-time dawn/dusk blend; 'light'/'dark' is an explicit user override. */
type ThemeOverride = 'light' | 'dark' | 'auto';

const AUTO_TICK_MS = 60_000;
const THEME_OVERRIDE_STORAGE_KEY = 'zazu:themeOverride';

function isThemeOverride(value: string | null): value is ThemeOverride {
  return value === 'auto' || value === 'light' || value === 'dark';
}

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
  const [override, setOverrideState] = useState<ThemeOverride>('auto');
  const [now, setNow] = useState(() => new Date());

  // Restore the user's last explicit theme choice on cold start.
  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(THEME_OVERRIDE_STORAGE_KEY).then((stored) => {
      if (!cancelled && isThemeOverride(stored)) {
        setOverrideState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setOverride = useCallback((next: ThemeOverride) => {
    setOverrideState(next);
    void AsyncStorage.setItem(THEME_OVERRIDE_STORAGE_KEY, next);
  }, []);

  // While in auto mode, re-check the dawn/dusk clock periodically so the
  // gradual light<->dark blend actually moves during a long-open session.
  useEffect(() => {
    if (override !== 'auto') return;
    const id = setInterval(() => setNow(new Date()), AUTO_TICK_MS);
    return () => clearInterval(id);
  }, [override]);

  const blend = useMemo(() => {
    if (override === 'light') return 0;
    if (override === 'dark') return 1;
    return getThemeBlend(now);
  }, [override, now]);

  const palette = useMemo<ThemePalette>(
    () => resolveThemePalette(now, override === 'auto' ? null : override),
    [now, override],
  );

  const colors = useMemo(() => mergePalette(palette), [palette]);

  // Sequential three-way cycle: auto (dawn/dusk) -> light -> dark -> auto.
  const toggleOverride = useCallback(() => {
    const next: ThemeOverride = override === 'auto' ? 'light' : override === 'light' ? 'dark' : 'auto';
    setOverride(next);
  }, [override, setOverride]);

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
