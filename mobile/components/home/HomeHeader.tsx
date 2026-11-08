import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CoinsIcon, FireIcon, GearSixIcon } from 'phosphor-react-native';

import { IconButton } from '@/components/ui/IconButton';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { HomeStats } from '@/types/home';

export type HomeHeaderProps = HomeStats & {
  loading?: boolean;
};

/**
 * Brand on the left, a quiet typographic stat line on the right.
 * No capsules: the numbers sit straight on the gradient in the serif,
 * so the header reads like a masthead rather than a row of widgets.
 */
export function HomeHeader({ streak, coins, loading = false }: HomeHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const streakLabel = loading ? '–' : String(streak);
  const coinsLabel = loading ? '–' : String(coins);

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
          flexShrink: 1,
        },
        stat: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 10,
        },
        statValue: {
          fontFamily: fonts.serif,
          fontSize: 21,
          lineHeight: 26,
          letterSpacing: -0.3,
          color: colors.text,
          fontVariant: ['tabular-nums'],
        },
        rule: {
          width: StyleSheet.hairlineWidth,
          height: 18,
          backgroundColor: colors.subtext,
          opacity: 0.45,
        },
        gear: {
          marginLeft: 2,
          marginRight: -10,
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
        <View style={styles.stat} accessibilityRole="text" accessibilityLabel={copy.a11y.streak(streak)}>
          <FireIcon size={15} color={colors.streakFlame} weight="fill" />
          <Text style={styles.statValue}>{streakLabel}</Text>
        </View>

        <View style={styles.rule} />

        <View style={styles.stat} accessibilityRole="text" accessibilityLabel={copy.a11y.coins(coins)}>
          <CoinsIcon
            size={15}
            color={colors.coinGradientEnd}
            weight="duotone"
            duotoneColor={colors.coinGradientStart}
            duotoneOpacity={1}
          />
          <Text style={styles.statValue}>{coinsLabel}</Text>
        </View>

        <IconButton
          onPress={() => router.push('/settings')}
          accessibilityLabel={copy.settings.title}
          style={styles.gear}
        >
          <GearSixIcon size={22} color={colors.subtext} />
        </IconButton>
      </View>
    </View>
  );
}
