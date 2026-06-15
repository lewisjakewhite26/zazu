import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { hapticSuccess } from '../../../lib/feedback';
import { getStreakTitle } from '../../../lib/streak-titles';
import { stripHtml } from '../../../lib/puzzle-utils';

function CoinRow({ label, amount }: { label: string; amount: number }) {
  if (amount <= 0) return null;
  return (
    <View style={styles.coinRow}>
      <Text style={styles.coinLabel}>{label}</Text>
      <Text style={styles.coinAmount}>+{amount} 🪙</Text>
    </View>
  );
}

export function SuccessScreen() {
  const router = useRouter();
  const { sessionWord, completionResult, clearFlow } = useAlarmFlow();

  useEffect(() => {
    if (!sessionWord || !completionResult) {
      router.replace('/');
      return;
    }
    hapticSuccess();
  }, [sessionWord, completionResult, router]);

  if (!sessionWord || !completionResult) {
    return null;
  }

  const streakTitle = getStreakTitle(completionResult.streak);
  const { breakdown, coinsEarned } = completionResult;

  const handleDone = () => {
    clearFlow();
    router.replace('/');
  };

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <Text style={styles.bird}>🐦</Text>
            <Text style={styles.heading}>{copy.success.heading}</Text>
            <Text style={styles.sub}>{copy.success.sub}</Text>

            <View style={styles.wordCard}>
              <Text style={styles.wordCardLabel}>{copy.success.wordLearned}</Text>
              <Text style={styles.word}>{sessionWord.word}</Text>
              <Text style={styles.pronunciation}>{sessionWord.pronunciation}</Text>
              <Text style={styles.definition}>{sessionWord.definition}</Text>
              <Text style={styles.origin}>{stripHtml(sessionWord.origin)}</Text>
            </View>

            <View style={styles.streakBanner}>
              <Text style={styles.streakIcon}>🔥</Text>
              <View>
                <Text style={styles.streakText}>
                  {copy.success.streakCount(completionResult.streak)}
                </Text>
                <Text style={styles.streakSub}>
                  {copy.success.streakSubtitle(streakTitle)}
                </Text>
              </View>
            </View>

            <View style={styles.coinsCard}>
              <Text style={styles.coinsTitle}>{copy.success.coinsEarned}</Text>
              <CoinRow label={copy.success.morningTaskCompleted} amount={breakdown.puzzle} />
              <CoinRow label={copy.success.noSnooze} amount={breakdown.noSnooze} />
              <CoinRow label={copy.success.streakBonus} amount={breakdown.streakBonus} />
              <View style={[styles.coinRow, styles.coinRowTotal]}>
                <Text style={styles.coinLabelTotal}>{copy.success.total}</Text>
                <Text style={styles.coinAmountTotal}>+{coinsEarned} 🪙</Text>
              </View>
            </View>

            <PrimaryButton label={copy.success.done} onPress={handleDone} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(168,216,176,0.2)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xl,
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
    marginBottom: spacing.md,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.subtext,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  wordCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(249,201,168,0.28)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  wordCardLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  word: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pronunciation: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  definition: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  origin: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.subtext,
  },
  streakBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(249,201,168,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(240,160,188,0.28)',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  streakIcon: {
    fontSize: 20,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  coinsTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  coinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coinRowTotal: {
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
  },
  coinLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
  },
  coinLabelTotal: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.text,
  },
  coinAmount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.gold,
  },
  coinAmountTotal: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.gold,
  },
});
