import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarBlankIcon, CoinsIcon, FireIcon, GearIcon } from 'phosphor-react-native';

import { IconButton } from '@/components/ui/IconButton';
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
  const router = useRouter();
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
        brandRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          flexShrink: 0,
        },
        mark: {
          width: 22,
          height: 29,
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
          gap: 7,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingVertical: 7,
          paddingRight: 12,
          paddingLeft: 8,
        },
        coinPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingVertical: 7,
          paddingRight: 12,
          paddingLeft: 8,
        },
        statValue: {
          ...typography.streakCount,
          color: colors.text,
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
      <View style={styles.brandRow}>
        <Image
          source={require('@/assets/images/zazu-mark.png')}
          style={styles.mark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.wordmark}>{copy.brand.wordmark}</Text>
      </View>

      <View style={styles.statsRow}>
        <View
          style={styles.streakPill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.streak(streak)}
        >
          <FireIcon size={18} color={colors.streakFlame} weight="fill" />
          <Text style={styles.statValue}>{streakLabel}</Text>
        </View>

        <View
          style={styles.coinPill}
          accessibilityRole="text"
          accessibilityLabel={copy.a11y.coins(coins)}
        >
          <CoinsIcon
            size={15}
            color={colors.coinGradientEnd}
            weight="duotone"
            duotoneColor={colors.coinGradientStart}
            duotoneOpacity={1}
          />
          <Text style={styles.coinValue}>{coinsLabel}</Text>
        </View>

        <IconButton
          variant="card"
          onPress={() => router.push('/calendar')}
          accessibilityLabel={copy.calendar.title}
        >
          <CalendarBlankIcon size={18} color={colors.text} />
        </IconButton>

        <IconButton
          variant="card"
          onPress={() => router.push('/settings')}
          accessibilityLabel={copy.settings.title}
        >
          <GearIcon size={18} color={colors.text} />
        </IconButton>
      </View>
    </View>
  );
}
