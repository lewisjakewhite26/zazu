import { useCallback, useMemo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

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
  const scrim = blend >= 0.5 ? 'rgba(14,12,26,0.55)' : 'rgba(254,252,251,0.55)';
  const cardScrim = blend >= 0.5 ? 'rgba(14,12,26,0.45)' : 'rgba(254,252,251,0.45)';
  const labelOnInk = blend >= 0.5 ? '#2c1f2e' : colors.white;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgFrom,
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
    navSub: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.subtext,
      marginTop: 2,
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
      color: colors.text,
      letterSpacing: -0.2,
    },
    cardIcons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    lockWrap: {
      position: 'relative',
      marginBottom: 12,
    },
    lockOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: scrim,
      borderRadius: 14,
      padding: 12,
      zIndex: 2,
    },
    lockTitle: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
      color: colors.text,
      textAlign: 'center',
    },
    lockSub: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.subtext,
      lineHeight: 16,
      textAlign: 'center',
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
    cardLockedOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: cardScrim,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
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
