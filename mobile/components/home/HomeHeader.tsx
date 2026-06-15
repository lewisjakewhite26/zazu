import { StyleSheet, Text, View } from 'react-native';

import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import type { HomeStats } from '@/types/home';

export type HomeHeaderProps = HomeStats & {
  loading?: boolean;
};

export function HomeHeader({ streak, coins, loading = false }: HomeHeaderProps) {
  const streakLabel = loading ? '—' : String(streak);
  const coinsLabel = loading ? '—' : String(coins);
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>{copy.brand.wordmark}</Text>

      <View style={styles.statsRow}>
        <View
          style={styles.pill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.streak(streak)}
        >
          <View style={styles.flameCircle}>
            <Text style={styles.emoji}>🔥</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{streakLabel}</Text>
            <Text style={styles.statLabel}>{copy.home.dayStreak}</Text>
          </View>
        </View>

        <View
          style={styles.pill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.coins(coins)}
        >
          <View style={styles.coinCircle}>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
          <Text style={styles.statValue}>{coinsLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.5,
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  flameCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(249,180,80,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0c060',
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
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.subtext,
  },
});
