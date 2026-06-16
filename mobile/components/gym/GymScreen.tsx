import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { stripHtml } from '../../../lib/puzzle-utils';
import type { UserWordProgressLocal } from '../../../lib/morning-task';

export function GymScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { startGymFlow } = useAlarmFlow();
  const { loading: progressLoading, streak, coins, learnedWordIds, getGymMastery, wordProgress } =
    useProgress();
  const { loading: wordsLoading, gymWordOfDay } = useWordLibrary(learnedWordIds);

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
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: spacing.xs,
        },
        subtitle: {
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.subtext,
          marginBottom: spacing.lg,
          textAlign: 'center',
        },
        loading: {
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.subtext,
          marginTop: spacing.xl,
        },
        wordCard: {
          width: '100%',
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: spacing.lg,
        },
        wordLabel: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: spacing.sm,
        },
        word: {
          fontFamily: fonts.serif,
          fontSize: 32,
          color: colors.text,
          marginBottom: spacing.xs,
        },
        pron: {
          fontFamily: fonts.sans,
          fontSize: 13,
          fontStyle: 'italic',
          color: colors.subtext,
          marginBottom: spacing.md,
        },
        def: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 22,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        origin: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 20,
          color: colors.subtext,
          marginBottom: spacing.md,
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
      }),
    [colors],
  );

  const loading = progressLoading || wordsLoading;
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

  const handleStart = useCallback(() => {
    if (!word) return;
    startGymFlow(word);
    router.push('/puzzle');
  }, [word, startGymFlow, router]);

  return (
    <LinearGradient
      colors={[colors.bgFrom, colors.bgMid, colors.bgTo]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.inner}>
          <HomeHeader streak={streak} coins={coins} loading={progressLoading} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="dumbbell" size={28} color={colors.ink} />
            </View>
            <Text style={styles.eyebrow}>{copy.gym.eyebrow}</Text>
            <Text style={styles.subtitle}>{copy.gym.subtitle}</Text>

            {loading || !word ? (
              <Text style={styles.loading}>{copy.home.wordOfDayLoading}</Text>
            ) : (
              <View style={styles.wordCard}>
                <Text style={styles.wordLabel}>{copy.gym.todaysWord}</Text>
                <Text style={styles.word}>{word.word}</Text>
                <Text style={styles.pron}>
                  {word.pronunciation} · {word.pos}
                </Text>
                <Text style={styles.def}>{word.definition}</Text>
                <Text style={styles.origin}>{stripHtml(word.origin)}</Text>

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
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
            <PrimaryButton
              label={gymDoneToday ? copy.gym.continue : copy.gym.start}
              onPress={handleStart}
              disabled={loading || !word}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
