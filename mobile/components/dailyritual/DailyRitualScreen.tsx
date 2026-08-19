import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoinsIcon } from 'phosphor-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useProgress } from '@/hooks/useProgress';
import { tokenizePassage, type PassageToken } from '../../../lib/word-spotting';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

const ADVANCE_MS = 550;
const WRONG_CLEAR_MS = 700;

export function DailyRitualScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { dailyRitualSession, clearFlow } = useAlarmFlow();
  const { completeDailyRitual } = useProgress();

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [advanceReady, setAdvanceReady] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [passageFoundIndex, setPassageFoundIndex] = useState<number | null>(null);
  const [passageWrongIndex, setPassageWrongIndex] = useState<number | null>(null);
  const [passageDone, setPassageDone] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [reward, setReward] = useState<{ coinsEarned: number; alreadyCompletedToday: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!dailyRitualSession) {
      router.replace('/');
    }
  }, [dailyRitualSession, router]);

  const mcqQuestions = dailyRitualSession?.mcqQuestions ?? [];
  const passageStep = dailyRitualSession?.passageStep ?? null;
  const totalSteps = mcqQuestions.length + (passageStep ? 1 : 0);
  const onMcqStep = stepIndex < mcqQuestions.length;
  const onPassageStep = !onMcqStep && passageStep !== null && stepIndex === mcqQuestions.length;
  const current = onMcqStep ? mcqQuestions[stepIndex] : null;

  const passageTokens: PassageToken[] = useMemo(() => {
    if (!passageStep) return [];
    return tokenizePassage(passageStep.passage, passageStep.targetWord);
  }, [passageStep]);

  const finishRitual = useCallback(async () => {
    if (!dailyRitualSession || finishing) return;
    setFinishing(true);
    const result = await completeDailyRitual(dailyRitualSession.wordId);
    setReward(result);
  }, [dailyRitualSession, finishing, completeDailyRitual]);

  const goNextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      void finishRitual();
      return;
    }
    setStepIndex(next);
    setSelectedIndex(null);
    setAdvanceReady(false);
    setShowTryAgain(false);
  }, [stepIndex, totalSteps, finishRitual]);

  const handleSelectOption = (index: number) => {
    if (!current || advanceReady || finishing) return;

    if (index === current.correctIndex) {
      setSelectedIndex(index);
      hapticCorrect();
      setTimeout(() => {
        setAdvanceReady(true);
        setTimeout(goNextStep, ADVANCE_MS);
      }, ADVANCE_MS);
      return;
    }

    hapticWrong();
    setSelectedIndex(index);
    setShowTryAgain(true);
    setTimeout(() => setSelectedIndex(null), WRONG_CLEAR_MS);
  };

  const handleTapPassageToken = (index: number) => {
    if (!passageStep || passageDone || finishing) return;
    const token = passageTokens[index];
    if (!token?.isWord) return;

    if (token.isTarget) {
      setPassageFoundIndex(index);
      setPassageDone(true);
      hapticCorrect();
      AccessibilityInfo.announceForAccessibility('Correct.');
      setTimeout(goNextStep, ADVANCE_MS);
      return;
    }

    hapticWrong();
    setPassageWrongIndex(index);
    setTimeout(() => setPassageWrongIndex(null), WRONG_CLEAR_MS);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        inner: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: 28,
        },
        eyebrow: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
        progress: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.subtext,
          marginBottom: spacing.md,
        },
        questionCard: {
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: spacing.lg,
        },
        question: {
          ...typography.mtQuestion,
          color: colors.text,
        },
        options: { gap: 10 },
        option: {
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        optionText: { ...typography.mtOption },
        tryAgain: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
          marginTop: spacing.md,
          textAlign: 'center',
        },
        prompt: {
          ...typography.mtQuestion,
          color: colors.text,
          marginBottom: 20,
        },
        passageText: {
          fontFamily: fonts.serif,
          fontSize: 22,
          lineHeight: 34,
          color: colors.text,
        },
        wordToken: { paddingVertical: 3 },
        wordTokenCorrect: { backgroundColor: colors.correct, borderRadius: 6 },
        wordTokenWrong: { backgroundColor: colors.wrong, borderRadius: 6 },
        rewardWrap: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        rewardHeading: {
          ...typography.successHeading,
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        },
        rewardSub: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
          marginBottom: spacing.lg,
          textAlign: 'center',
        },
        coinsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: spacing.xl,
        },
        coinsText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 20,
          color: colors.gold,
        },
        doneCta: { width: '100%' },
      }),
    [colors],
  );

  if (!dailyRitualSession) return null;

  if (reward) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.inner, styles.rewardWrap]}>
            <Text style={styles.rewardHeading}>{copy.dailyRitual.heading}</Text>
            <Text style={styles.rewardSub}>
              {reward.alreadyCompletedToday ? copy.dailyRitual.alreadyDoneToday : copy.dailyRitual.sub}
            </Text>
            {reward.coinsEarned > 0 ? (
              <View style={styles.coinsRow}>
                <CoinsIcon size={20} color={colors.gold} weight="fill" />
                <Text style={styles.coinsText}>+{reward.coinsEarned}</Text>
              </View>
            ) : null}
            <PrimaryButton
              label={copy.dailyRitual.done}
              variant="wake"
              style={styles.doneCta}
              onPress={() => {
                clearFlow();
                router.replace('/');
              }}
            />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <Text style={styles.eyebrow}>{copy.dailyRitual.eyebrow}</Text>
          <Text style={styles.progress}>{copy.gymModes.questionProgress(stepIndex + 1, totalSteps)}</Text>

          {onMcqStep && current ? (
            <>
              <GlassCard borderRadius={16} contentStyle={styles.questionCard}>
                <Text style={styles.question}>{current.question}</Text>
              </GlassCard>

              <View style={styles.options}>
                {current.options.map((option, index) => {
                  const isCorrectSelected = selectedIndex !== null && selectedIndex === current.correctIndex;
                  let backgroundColor: string = colors.card;
                  let borderColor: string = colors.border;
                  let textColor: string = colors.text;

                  if (selectedIndex !== null) {
                    if (index === current.correctIndex && isCorrectSelected) {
                      backgroundColor = 'rgba(168,216,176,0.35)';
                      borderColor = colors.correct;
                    } else if (index === selectedIndex && !isCorrectSelected) {
                      backgroundColor = 'rgba(232,97,122,0.15)';
                      borderColor = colors.wrong;
                    } else if (!isCorrectSelected) {
                      textColor = colors.subtext;
                    }
                  }

                  return (
                    <Pressable
                      key={`${current.wordId}-${option}`}
                      onPress={() => handleSelectOption(index)}
                      disabled={advanceReady || finishing}
                      style={[styles.option, { backgroundColor, borderColor }]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {showTryAgain ? <Text style={styles.tryAgain}>{copy.morningTask.tryAgain}</Text> : null}
            </>
          ) : null}

          {onPassageStep && passageStep ? (
            <>
              <Text style={styles.prompt}>{copy.dailyRitual.findPrompt}</Text>
              <Text style={styles.passageText}>
                {passageTokens.map((token, index) => {
                  if (!token.isWord) {
                    return <Text key={index}>{token.text}</Text>;
                  }
                  return (
                    <Text
                      key={index}
                      onPress={() => handleTapPassageToken(index)}
                      style={[
                        styles.wordToken,
                        passageFoundIndex === index && styles.wordTokenCorrect,
                        passageWrongIndex === index && styles.wordTokenWrong,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Word: ${token.text}`}
                    >
                      {token.text}
                    </Text>
                  );
                })}
              </Text>
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
