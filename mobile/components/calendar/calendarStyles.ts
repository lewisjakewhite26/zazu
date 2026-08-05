import { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import type { CalendarCardVariant } from '../../../lib/calendar-utils';

function cardVariantStyleFor(colors: AppThemeColors, variant: CalendarCardVariant): ViewStyle {
  switch (variant) {
    case 'lavender':
      return {
        backgroundColor: colors.cardLavender,
        borderColor: colors.cardLavenderBorder,
      };
    case 'blush':
      return {
        backgroundColor: colors.cardBlush,
        borderColor: colors.cardBlushBorder,
      };
    case 'dawn':
      return {
        backgroundColor: colors.cardDawn,
        borderColor: colors.cardDawnBorder,
      };
    case 'peach':
    default:
      return {
        backgroundColor: colors.cardPeach,
        borderColor: colors.cardPeachBorder,
      };
  }
}

function createCalendarStyles(colors: AppThemeColors, blend: number) {
  const cardScrim = blend >= 0.5 ? 'rgba(14,12,26,0.45)' : 'rgba(254,252,251,0.45)';
  const labelOnInk = blend >= 0.5 ? '#2c1f2e' : colors.white;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      maxWidth: 390,
      width: '100%',
      alignSelf: 'center',
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    navTitle: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 17,
      color: colors.text,
    },
    streakPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.sheetSecondary,
      borderWidth: 0.5,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 100,
    },
    streakPillText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      color: colors.text,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 20,
      padding: 12,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    toggleLabel: {
      flex: 1,
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.subtext,
    },
    toggleWrap: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 100,
      padding: 2,
      gap: 2,
    },
    toggleOpt: {
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 100,
    },
    toggleOptActive: {
      backgroundColor: colors.ink,
    },
    toggleOptText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      color: colors.subtext,
    },
    toggleOptTextActive: {
      color: labelOnInk,
    },
    sectionLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginBottom: 10,
    },
    heroCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.cardPeach,
      borderColor: colors.cardPeachBorder,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      fontFamily: 'DMSans_500Medium',
      fontSize: 10,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.subtext,
      backgroundColor: colors.card,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 100,
      overflow: 'hidden',
      marginBottom: 8,
    },
    heroWord: {
      fontFamily: 'DMSerifDisplay_400Regular',
      fontSize: 26,
      lineHeight: 32,
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    heroDate: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.subtext,
    },
    heroIcons: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
    },
    gridItem: {
      width: '48%',
    },
    dayCard: {
      borderRadius: 14,
      padding: 14,
      minHeight: 100,
      borderWidth: 0.5,
      justifyContent: 'space-between',
    },
    cardDate: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 10,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginBottom: 5,
    },
    cardWord: {
      fontFamily: 'DMSerifDisplay_400Regular',
      fontSize: 17,
      lineHeight: 21,
      color: colors.text,
      letterSpacing: -0.2,
    },
    cardIcons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    monthSection: {
      marginBottom: 12,
    },
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.sheetSecondary,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    monthHeaderLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
      color: colors.text,
    },
    monthHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    monthHeaderCount: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.subtext,
    },
    monthHeaderBlurWeb: {
      ...StyleSheet.absoluteFill,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: cardScrim,
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as object)
        : null),
    },
    monthHeaderBlurNative: {
      ...StyleSheet.absoluteFill,
      borderRadius: 12,
      overflow: 'hidden',
    },
    monthHeaderLockWrap: {
      position: 'absolute',
      right: 14,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    goldBtn: {
      width: '100%',
      paddingVertical: 13,
      backgroundColor: colors.ink,
      borderRadius: 100,
      alignItems: 'center',
      marginBottom: 8,
    },
    goldBtnText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
      color: labelOnInk,
    },
    goldSub: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.subtext,
      textAlign: 'center',
    },
    cardLockedBlurWeb: {
      ...StyleSheet.absoluteFill,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: cardScrim,
      zIndex: 2,
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as object)
        : null),
    },
    cardLockedBlurNative: {
      ...StyleSheet.absoluteFill,
      borderRadius: 14,
      overflow: 'hidden',
      zIndex: 2,
    },
    cardLockedIconWrap: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3,
    },
    cardLockedIconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.sheetBg,
      borderWidth: 0.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function useCalendarStyles() {
  const { colors, blend } = useTheme();
  const styles = useMemo(() => createCalendarStyles(colors, blend), [colors, blend]);
  const cardVariantStyle = useCallback(
    (variant: CalendarCardVariant) => cardVariantStyleFor(colors, variant),
    [colors],
  );
  return { styles, cardVariantStyle, colors, blend };
}
