import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { hapticSuccess } from '../../../lib/feedback';
import { stripHtml } from '../../../lib/puzzle-utils';

export function GymSuccessScreen() {
  const router = useRouter();
  const { gymSessionWord, gymCompletionResult, clearFlow } = useAlarmFlow();

  useEffect(() => {
    if (!gymSessionWord || !gymCompletionResult) {
      router.replace('/(tabs)/gym');
      return;
    }
    hapticSuccess();
  }, [gymSessionWord, gymCompletionResult, router]);

  if (!gymSessionWord || !gymCompletionResult) {
    return null;
  }

  const { coinsEarned, gymMastery } = gymCompletionResult;

  const handleDone = () => {
    clearFlow();
    router.replace('/(tabs)/gym');
  };

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={48}
              color={colors.lavender}
              style={styles.icon}
            />
            <Text style={styles.heading}>{copy.gymSuccess.heading}</Text>
            <Text style={styles.sub}>{copy.gymSuccess.sub}</Text>

            <View style={styles.wordCard}>
              <Text style={styles.wordCardLabel}>{copy.gymSuccess.wordPractised}</Text>
              <Text style={styles.word}>{gymSessionWord.word}</Text>
              <Text style={styles.pronunciation}>{gymSessionWord.pronunciation}</Text>
              <Text style={styles.definition}>{gymSessionWord.definition}</Text>
              <Text style={styles.origin}>{stripHtml(gymSessionWord.origin)}</Text>
            </View>

            <View style={styles.masteryBanner}>
              <Text style={styles.masteryBannerLabel}>{copy.gymSuccess.masteryLabel}</Text>
              <Text style={styles.masteryBannerValue}>
                {copy.gymSuccess.masteryPercent(gymMastery)}
              </Text>
            </View>

            <View style={styles.coinsCard}>
              <Text style={styles.coinsTitle}>{copy.gymSuccess.coinsEarned}</Text>
              <View style={styles.coinRow}>
                <Text style={styles.coinLabel}>{copy.gymSuccess.gymCompleted}</Text>
                <Text style={styles.coinAmount}>+{coinsEarned} 🪙</Text>
              </View>
              <View style={[styles.coinRow, styles.coinRowTotal]}>
                <Text style={styles.coinLabelTotal}>{copy.gymSuccess.total}</Text>
                <Text style={styles.coinAmountTotal}>+{coinsEarned} 🪙</Text>
              </View>
            </View>

            <PrimaryButton label={copy.gymSuccess.done} onPress={handleDone} />
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
    backgroundColor: 'rgba(200,180,232,0.18)',
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
  icon: {
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
    backgroundColor: 'rgba(200,180,232,0.22)',
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
  masteryBanner: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(200,180,232,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(200,180,232,0.35)',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  masteryBannerLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.text,
  },
  masteryBannerValue: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.lavender,
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
