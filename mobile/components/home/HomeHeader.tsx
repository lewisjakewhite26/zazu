import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { HomeStats } from '@/types/home';

export type HomeHeaderProps = HomeStats & {
  loading?: boolean;
};

export function HomeHeader({ streak, coins, loading = false }: HomeHeaderProps) {
  const { colors } = useTheme();
  const streakLabel = loading ? '—' : String(streak);
  const coinsLabel = loading ? '—' : String(coins);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingTop: 12,
          paddingBottom: spacing.lg,
        },
        wordmark: {
          ...typography.wordmark,
          color: colors.text,
          flexShrink: 0,
        },
        statsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexShrink: 1,
        },
        streakPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingVertical: 7,
          paddingRight: 13,
          paddingLeft: 8,
        },
        coinPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingVertical: 7,
          paddingRight: 12,
          paddingLeft: 7,
        },
        flameCircle: {
          width: 26,
          height: 26,
          borderRadius: 13,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        coinCircle: {
          width: 22,
          height: 22,
          borderRadius: 11,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        emoji: {
          fontSize: 14,
        },
        coinEmoji: {
          fontSize: 11,
        },
        statValue: {
          ...typography.streakCount,
          color: colors.text,
        },
        statLabel: {
          ...typography.streakLabel,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginTop: 1,
        },
        coinValue: {
          ...typography.coinAmount,
          color: colors.text,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>{copy.brand.wordmark}</Text>

      <View style={styles.statsRow}>
        <View
          style={styles.streakPill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.streak(streak)}
        >
          <View style={styles.flameCircle}>
            <LinearGradient
              colors={[colors.streakFlameStart, colors.streakFlameEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.emoji}>🔥</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{streakLabel}</Text>
            <Text style={styles.statLabel}>{copy.home.dayStreak}</Text>
          </View>
        </View>

        <View
          style={styles.coinPill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.coins(coins)}
        >
          <View style={styles.coinCircle}>
            <LinearGradient
              colors={[colors.coinGradientStart, colors.coinGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
          <Text style={styles.coinValue}>{coinsLabel}</Text>
        </View>
      </View>
    </View>
  );
}
