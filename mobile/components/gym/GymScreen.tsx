import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowsClockwiseIcon,
  BarbellIcon,
  BookOpenIcon,
  QuotesIcon,
  TreeStructureIcon,
} from 'phosphor-react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { WordLibraryErrorBanner } from '@/components/home/WordLibraryErrorBanner';
import { Divider } from '@/components/ui/Divider';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GymModeCard } from '@/components/gym/GymModeCard';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { floatingTabBarClearance } from '@/components/ui/FloatingTabBar';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { useLiteraryWords } from '@/hooks/useLiteraryWords';
import {
  buildRootsDrillQuestions,
  buildUsageLabQuestions,
  countReviewQueueDue,
  pickDrillWords,
  pickNextReviewWord,
} from '../../../lib/gym-modes';
import { buildLiteraryQuestions } from '../../../lib/literary-words';
import type { UserWordProgressLocal } from '../../../lib/morning-task';

export function GymScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { startGymFlow, startGymModeSession } = useAlarmFlow();
  const { isGold, loading: subscriptionLoading } = useSubscription();
  const { loading: progressLoading, streak, coins, learnedWordIds, getGymMastery, wordProgress } =
    useProgress();
  const {
    loading: wordsLoading,
    fetchFailed: wordsFetchFailed,
    retry: retryWordLibrary,
    retrying: wordsRetrying,
    gymWordOfDay,
    gymWords,
  } = useWordLibrary();
  const { literaryWords } = useLiteraryWords(isGold);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          flex: 1,
        },
        safeArea: {
          flex: 1,
        },
        inner: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingBottom: spacing.sm,
          alignItems: 'center',
        },
        heroIcon: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.cardLavender,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.md,
          marginBottom: spacing.md,
        },
        eyebrow: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: spacing.xs,
        },
        subtitle: {
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.subtext,
          marginBottom: spacing.lg,
          textAlign: 'center',
        },
        wordCard: {
          width: '100%',
        },
        wordCardInner: {
          padding: spacing.lg,
        },
        wordLabel: {
          ...typography.wotdEyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: spacing.sm,
        },
        word: {
          ...typography.wordHero,
          color: colors.text,
          marginBottom: spacing.xs,
        },
        pron: {
          ...typography.wotdPron,
          color: colors.subtext,
          marginBottom: spacing.md,
        },
        def: {
          ...typography.wotdDef,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        masteryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.md,
        },
        masteryLabel: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          color: colors.subtext,
        },
        masteryValue: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          color: colors.text,
        },
        footer: {
          width: '100%',
          paddingTop: spacing.sm,
        },
        modesSection: {
          width: '100%',
          marginTop: spacing.lg,
        },
        modesEyebrow: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: spacing.xs,
        },
        modesSubtitle: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 20,
          color: colors.subtext,
          marginBottom: spacing.md,
        },
        goldLink: {
          alignSelf: 'center',
          paddingVertical: spacing.md,
          marginTop: spacing.sm,
        },
        goldLinkText: {
          fontFamily: fonts.sansMedium,
          fontSize: 13,
          color: colors.gold,
        },
      }),
    [colors],
  );

  const loading = progressLoading || wordsLoading || subscriptionLoading;
  const word = gymWordOfDay;
  const mastery = word ? getGymMastery(word.id) : 0;
  const gymEntry = word
    ? wordProgress.find((entry: UserWordProgressLocal) => entry.wordId === word.id)
    : null;
  const gymDoneToday = (() => {
    const at = gymEntry?.gymCompletedAt;
    if (!at) return false;
    const completed = new Date(at);
    const now = new Date();
    return (
      completed.getFullYear() === now.getFullYear() &&
      completed.getMonth() === now.getMonth() &&
      completed.getDate() === now.getDate()
    );
  })();

  const reviewDueCount = countReviewQueueDue(gymWords, learnedWordIds, wordProgress);
  const hasLearnedWords = learnedWordIds.length > 0;
  const canDrill = hasLearnedWords;

  const handleStart = useCallback(() => {
    if (!word) return;
    if (!isGold) {
      router.push('/gold');
      return;
    }
    startGymFlow(word);
    router.push('/puzzle');
  }, [word, isGold, startGymFlow, router]);

  const handleReviewQueue = useCallback(() => {
    const reviewWord = pickNextReviewWord(gymWords, learnedWordIds, wordProgress);
    if (!reviewWord) return;
    startGymFlow(reviewWord);
    router.push('/puzzle');
  }, [gymWords, learnedWordIds, wordProgress, startGymFlow, router]);

  const handleRootsDrill = useCallback(() => {
    const drillWords = pickDrillWords(gymWords, learnedWordIds, word?.id);
    if (drillWords.length === 0) return;
    const questions = buildRootsDrillQuestions(drillWords, gymWords);
    if (questions.length === 0) return;
    startGymModeSession({ mode: 'roots_drill', mcqQuestions: questions });
    router.push({ pathname: '/gym-mcq', params: { mode: 'roots' } } as unknown as Href);
  }, [gymWords, learnedWordIds, word?.id, startGymModeSession, router]);

  const handleUsageLab = useCallback(() => {
    const drillWords = pickDrillWords(gymWords, learnedWordIds, word?.id);
    if (drillWords.length === 0) return;
    const questions = buildUsageLabQuestions(drillWords, gymWords);
    if (questions.length === 0) return;
    startGymModeSession({ mode: 'usage_lab', mcqQuestions: questions });
    router.push({ pathname: '/gym-mcq', params: { mode: 'usage' } } as unknown as Href);
  }, [gymWords, learnedWordIds, word?.id, startGymModeSession, router]);

  const handleLiteraryRound = useCallback(() => {
    const questions = buildLiteraryQuestions(literaryWords, 3);
    if (questions.length === 0) return;
    startGymModeSession({ mode: 'literary', literaryQuestions: questions });
    router.push('/gym-literary-round');
  }, [literaryWords, startGymModeSession, router]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.inner}>
          <HomeHeader streak={streak} coins={coins} loading={progressLoading} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {wordsFetchFailed ? (
              <WordLibraryErrorBanner onRetry={retryWordLibrary} retrying={wordsRetrying} />
            ) : null}

            <View style={styles.heroIcon}>
              <BarbellIcon size={28} color={colors.ink} />
            </View>
            <Text style={styles.eyebrow}>{copy.gym.eyebrow}</Text>
            <Text style={styles.subtitle}>{copy.gym.subtitle}</Text>

            {loading || !word ? (
              <GlassCard
                borderRadius={radii.wotd}
                style={styles.wordCard}
                contentStyle={styles.wordCardInner}
              >
                <View accessibilityRole="progressbar" accessibilityLabel={copy.home.wordOfDayLoading}>
                  <Skeleton width={90} height={11} style={{ marginBottom: spacing.sm }} />
                  <Skeleton width={160} height={32} style={{ marginBottom: spacing.xs }} />
                  <Skeleton width={110} height={13} style={{ marginBottom: spacing.md }} />
                  <Skeleton width="92%" height={15} style={{ marginBottom: 8 }} />
                  <Skeleton width="68%" height={15} style={{ marginBottom: spacing.sm }} />
                </View>
              </GlassCard>
            ) : (
              <GlassCard borderRadius={radii.wotd} style={styles.wordCard} contentStyle={styles.wordCardInner}>
                <Text style={styles.wordLabel}>{copy.gym.todaysWord}</Text>
                <Text style={styles.word}>{word.word}</Text>
                <Text style={styles.pron}>
                  {word.pronunciation} · {word.pos}
                </Text>
                <Text style={styles.def}>{word.definition}</Text>
                <OriginText origin={word.origin} style={{ marginBottom: spacing.md }} />

                <View style={styles.masteryRow}>
                  <Text style={styles.masteryLabel}>{copy.gym.mastery}</Text>
                  <Text style={styles.masteryValue}>
                    {gymDoneToday
                      ? copy.gym.masteryComplete
                      : mastery > 0
                        ? copy.gymSuccess.masteryPercent(mastery)
                        : copy.gym.masteryNew}
                  </Text>
                </View>
              </GlassCard>
            )}

            {isGold ? (
              <View style={styles.modesSection}>
                <Text style={styles.modesEyebrow}>{copy.gym.goldModesTitle}</Text>
                <Text style={styles.modesSubtitle}>{copy.gym.goldModesSub}</Text>

                <GlassCard borderRadius={radii.alarmCard}>
                  <GymModeCard
                    title={copy.gymModes.reviewTitle}
                    description={
                      reviewDueCount > 0 ? copy.gymModes.reviewDescription : copy.gymModes.reviewEmpty
                    }
                    icon={ArrowsClockwiseIcon}
                    badgeLabel={reviewDueCount > 0 ? copy.gymModes.reviewBadge(reviewDueCount) : undefined}
                    disabled={reviewDueCount === 0}
                    onPress={handleReviewQueue}
                  />
                  <Divider />
                  <GymModeCard
                    title={copy.gymModes.rootsTitle}
                    description={canDrill ? copy.gymModes.rootsDescription : copy.gymModes.needLearnedWords}
                    icon={TreeStructureIcon}
                    disabled={!canDrill}
                    onPress={handleRootsDrill}
                  />
                  <Divider />
                  <GymModeCard
                    title={copy.gymModes.usageTitle}
                    description={canDrill ? copy.gymModes.usageDescription : copy.gymModes.needLearnedWords}
                    icon={QuotesIcon}
                    disabled={!canDrill}
                    onPress={handleUsageLab}
                  />
                  <Divider />
                  <GymModeCard
                    title={copy.gymModes.literaryTitle}
                    description={
                      literaryWords.length > 0 ? copy.gymModes.literaryDescription : copy.gymModes.literaryEmpty
                    }
                    icon={BookOpenIcon}
                    disabled={literaryWords.length === 0}
                    onPress={handleLiteraryRound}
                  />
                </GlassCard>
              </View>
            ) : (
              <Pressable
                style={styles.goldLink}
                onPress={() => router.push('/gold')}
                accessibilityRole="button"
                accessibilityLabel={copy.gym.unlockGoldLink}
              >
                <Text style={styles.goldLinkText}>{copy.gym.unlockGoldLink}</Text>
              </Pressable>
            )}
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: floatingTabBarClearance(insets.bottom) },
            ]}
          >
            <PrimaryButton
              label={gymDoneToday ? copy.gym.continue : copy.gym.start}
              onPress={handleStart}
              disabled={loading || !word}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
