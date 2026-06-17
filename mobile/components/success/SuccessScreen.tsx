import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { hapticSuccess } from '../../../lib/feedback';
import { getStreakTitle } from '../../../lib/streak-titles';

function CoinRow({ label, amount, colors }: { label: string; amount: number; colors: ReturnType<typeof useTheme>['colors'] }) {
  if (amount <= 0) return null;
  return (
    <View style={[coinRowStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[coinRowStyles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[coinRowStyles.amount, { color: colors.gold }]}>+{amount} 🪙</Text>
    </View>
  );
}

const coinRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  amount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
  },
});

export function SuccessScreen() {
  const router = useRouter();
  const { colors, blend } = useTheme();
  const { sessionWord, completionResult, clearFlow } = useAlarmFlow();
  const isNight = blend >= 0.5;

  useEffect(() => {
    if (!sessionWord || !completionResult) {
      router.replace('/');
      return;
    }
    hapticSuccess();
  }, [sessionWord, completionResult, router]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        glow: {
          ...StyleSheet.absoluteFill,
          backgroundColor: colors.successGlow,
          opacity: 0.85,
        },
        safeArea: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingVertical: 40,
        },
        inner: {
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
        },
        bird: {
          fontSize: 48,
          marginBottom: 14,
        },
        heading: {
          ...typography.successHeading,
          color: colors.text,
          marginBottom: 4,
          textAlign: 'center',
        },
        sub: {
          ...typography.successSub,
          color: colors.subtext,
          marginBottom: 24,
          textAlign: 'center',
        },
        wordCard: {
          width: '100%',
          maxWidth: 320,
          borderRadius: radii.wotd,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 22,
          paddingVertical: 20,
          marginBottom: 14,
          overflow: 'hidden',
        },
        wordCardLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
        word: {
          fontFamily: fonts.serif,
          fontSize: 27,
          color: colors.text,
          letterSpacing: -0.54,
          marginBottom: 3,
        },
        pronunciation: {
          fontFamily: fonts.sans,
          fontSize: 12,
          fontStyle: 'italic',
          color: colors.subtext,
          marginBottom: 8,
        },
        definition: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 20,
          color: colors.text,
          marginBottom: 8,
        },
        streakBanner: {
          width: '100%',
          maxWidth: 320,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.streakBannerBorder,
          paddingHorizontal: 16,
          paddingVertical: 11,
          marginBottom: 12,
          overflow: 'hidden',
        },
        streakIcon: {
          fontSize: 21,
        },
        streakText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.text,
        },
        streakSub: {
          fontFamily: fonts.sans,
          fontSize: 11,
          color: colors.subtext,
        },
        coinsCard: {
          width: '100%',
          maxWidth: 320,
          marginBottom: 18,
        },
        coinsContent: {
          paddingHorizontal: 20,
          paddingVertical: 16,
        },
        coinsTitle: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
        },
        totalLabel: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.text,
        },
        totalAmount: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.gold,
        },
        doneBtn: {
          maxWidth: 320,
        },
      }),
    [colors],
  );

  if (!sessionWord || !completionResult) {
    return null;
  }

  const streakTitle = getStreakTitle(completionResult.streak);
  const { breakdown, coinsEarned } = completionResult;

  const handleDone = () => {
    clearFlow();
    router.replace('/');
  };

  const wordGradient = isNight
    ? [colors.successWordGradientStartNight, colors.successWordGradientEndNight]
    : [colors.successWordGradientStart, colors.successWordGradientEnd];

  const streakGradient = [colors.streakBannerStart, colors.streakBannerEnd];

  return (
    <GradientBackground>
      <View style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <Text style={styles.bird}>🐦</Text>
            <Text style={styles.heading}>{copy.success.heading}</Text>
            <Text style={styles.sub}>{copy.success.sub}</Text>

            <LinearGradient colors={wordGradient as [string, string]} style={styles.wordCard}>
              <Text style={styles.wordCardLabel}>{copy.success.wordLearned}</Text>
              <Text style={styles.word}>{sessionWord.word}</Text>
              <Text style={styles.pronunciation}>{sessionWord.pronunciation}</Text>
              <Text style={styles.definition}>{sessionWord.definition}</Text>
              <OriginText origin={sessionWord.origin} />
            </LinearGradient>

            <LinearGradient colors={streakGradient as [string, string]} style={styles.streakBanner}>
              <Text style={styles.streakIcon}>🔥</Text>
              <View>
                <Text style={styles.streakText}>
                  {copy.success.streakCount(completionResult.streak)}
                </Text>
                <Text style={styles.streakSub}>
                  {copy.success.streakSubtitle(streakTitle)}
                </Text>
              </View>
            </LinearGradient>

            <GlassCard borderRadius={radii.alarmCard} style={styles.coinsCard} contentStyle={styles.coinsContent}>
              <Text style={styles.coinsTitle}>{copy.success.coinsEarned}</Text>
              <CoinRow label={copy.success.morningTaskCompleted} amount={breakdown.puzzle} colors={colors} />
              <CoinRow label={copy.success.noSnooze} amount={breakdown.noSnooze} colors={colors} />
              <CoinRow label={copy.success.streakBonus} amount={breakdown.streakBonus} colors={colors} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{copy.success.total}</Text>
                <Text style={styles.totalAmount}>+{coinsEarned} 🪙</Text>
              </View>
            </GlassCard>

            <PrimaryButton label={copy.success.done} variant="outline" onPress={handleDone} style={styles.doneBtn} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
