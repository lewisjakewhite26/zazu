import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckIcon, XIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import type { GymMcqQuestion } from '../../../lib/gym-modes';
import type { LiteraryMcqQuestion } from '../../../lib/literary-words';
import { hapticCorrect, hapticSelect, hapticWrong } from '../../../lib/feedback';

type GymMcqSessionScreenProps = {
  modeLabel?: string;
};

type AnyQuestion = GymMcqQuestion | LiteraryMcqQuestion;

function isLiterary(question: AnyQuestion): question is LiteraryMcqQuestion {
  return 'roundTitle' in question;
}

export function GymMcqSessionScreen({ modeLabel = '' }: GymMcqSessionScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { gymSession, clearFlow } = useAlarmFlow();
  const { recordMcqAnswer, completeGymModeSession } = useProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [sessionWordIds, setSessionWordIds] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);

  const optionScales = useRef<Animated.Value[]>([]);
  const optionShakes = useRef<Animated.Value[]>([]);

  const questions: AnyQuestion[] = gymSession
    ? gymSession.mode === 'literary'
      ? gymSession.literaryQuestions
      : gymSession.mcqQuestions
    : [];
  const current = questions[questionIndex];
  const literary = current ? isLiterary(current) : false;

  useEffect(() => {
    if (!gymSession) {
      router.replace('/(tabs)/gym');
      return;
    }
    const empty =
      gymSession.mode === 'literary'
        ? gymSession.literaryQuestions.length === 0
        : gymSession.mcqQuestions.length === 0;
    if (empty) router.replace('/(tabs)/gym');
  }, [gymSession, router]);

  useEffect(() => {
    if (!current) return;
    optionScales.current = current.options.map(
      (_, index) => optionScales.current[index] ?? new Animated.Value(1),
    );
    optionShakes.current = current.options.map(
      (_, index) => optionShakes.current[index] ?? new Animated.Value(0),
    );
    setSelectedIndex(null);
    setChecked(false);
  }, [current?.wordId, current?.question]);

  const isCorrect = checked && selectedIndex !== null && current && selectedIndex === current.correctIndex;

  const finishSession = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    const ids = sessionWordIds.length > 0 ? sessionWordIds : questions.map((q) => q.wordId);
    await completeGymModeSession(ids, { coinsPerWord: 15 });
    clearFlow();
    router.replace('/(tabs)/gym');
  }, [finishing, sessionWordIds, questions, completeGymModeSession, clearFlow, router]);

  const goNextQuestion = useCallback(() => {
    const next = questionIndex + 1;
    if (next >= questions.length) {
      void finishSession();
      return;
    }
    setQuestionIndex(next);
  }, [questionIndex, questions.length, finishSession]);

  const runCorrectPop = (index: number) => {
    const scale = optionScales.current[index];
    if (!scale) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 0, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1.07,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runWrongShake = (index: number) => {
    const shake = optionShakes.current[index];
    if (!shake) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -7, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 7, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const handleSelect = (index: number) => {
    if (!current || checked || finishing) return;
    if (index !== selectedIndex) hapticSelect();
    setSelectedIndex(index);
  };

  const handleCheck = () => {
    if (!current || selectedIndex === null || checked || finishing) return;
    setChecked(true);

    if (selectedIndex === current.correctIndex) {
      hapticCorrect();
      runCorrectPop(selectedIndex);
      void recordMcqAnswer(current.wordId, true);
      setSessionWordIds((ids) => (ids.includes(current.wordId) ? ids : [...ids, current.wordId]));
      return;
    }

    hapticWrong();
    runWrongShake(selectedIndex);
    void recordMcqAnswer(current.wordId, false);
  };

  const handleRetry = () => {
    setSelectedIndex(null);
    setChecked(false);
  };

  const handlePrimaryAction = () => {
    if (!checked) {
      handleCheck();
      return;
    }
    if (isCorrect) {
      goNextQuestion();
      return;
    }
    handleRetry();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        scrollContent: { flexGrow: 1, paddingBottom: spacing.xl },
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
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 13,
          color: colors.subtext,
          marginBottom: spacing.sm,
        },
        progressTrack: {
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border,
          overflow: 'hidden',
          marginBottom: spacing.lg,
        },
        progressFill: {
          height: '100%',
          borderRadius: 2,
          backgroundColor: colors.ink,
        },
        banner: { alignItems: 'center', paddingBottom: 16 },
        wordMain: { ...typography.puzzleWordMain, color: colors.text },
        wordRound: {
          ...typography.puzzleWordRound,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginTop: 4,
        },
        progressRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
          marginTop: spacing.sm,
          marginBottom: spacing.lg,
        },
        progressDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.border,
        },
        progressDotDone: {
          backgroundColor: colors.blush,
          transform: [{ scale: 1.2 }],
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
        contextLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 4,
        },
        contextText: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 15,
          lineHeight: 21,
          color: colors.text,
        },
        excerptLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginTop: 10,
          marginBottom: 4,
        },
        excerptText: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 16,
          lineHeight: 22,
          color: colors.text,
          fontStyle: 'italic',
        },
        optionsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        },
        optionsList: {
          gap: spacing.sm,
        },
        optionSlotGrid: {
          flexBasis: '47%',
          flexGrow: 1,
        },
        option: {
          width: '100%',
          minHeight: MIN_TOUCH_TARGET,
          borderWidth: 1.5,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          justifyContent: 'center',
        },
        optionText: {
          ...typography.mtOption,
          fontSize: 15,
          lineHeight: 21,
        },
        spacer: {
          flex: 1,
          minHeight: spacing.lg,
        },
        footer: {
          borderRadius: radii.alarmCard,
          borderWidth: 1,
          padding: spacing.md,
          marginTop: spacing.lg,
          marginBottom: spacing.md,
        },
        feedbackRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: spacing.xs,
        },
        feedbackBadge: {
          width: 22,
          height: 22,
          borderRadius: 11,
          alignItems: 'center',
          justifyContent: 'center',
        },
        feedbackText: {
          fontFamily: typography.btnPrimary.fontFamily,
          fontSize: 14,
        },
        hint: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 15,
          lineHeight: 21,
          color: colors.subtext,
          marginBottom: spacing.sm,
        },
        actionBtn: {
          minHeight: MIN_TOUCH_TARGET,
          borderRadius: radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
        },
        actionBtnText: {
          ...typography.btnPrimary,
        },
      }),
    [colors],
  );

  if (!gymSession || !current) return null;

  const progressLabel = copy.gymModes.questionProgress(questionIndex + 1, questions.length);
  const progressDots = questions.map((_, index) => (
    <View key={index} style={[styles.progressDot, index <= questionIndex && styles.progressDotDone]} />
  ));

  const footerBg = !checked
    ? 'transparent'
    : isCorrect
      ? 'rgba(168,216,176,0.16)'
      : 'rgba(232,97,122,0.12)';
  const footerBorder = !checked ? colors.border : isCorrect ? colors.correct : colors.wrong;

  const actionLabel = !checked
    ? copy.gymModes.checkCta
    : isCorrect
      ? copy.gymModes.nextCta
      : copy.gymModes.retryCta;
  const actionDisabled = !checked && selectedIndex === null;
  const actionBg = !checked
    ? selectedIndex === null
      ? colors.border
      : colors.primaryButtonBg
    : isCorrect
      ? colors.correct
      : colors.wrong;
  const actionTextColor = !checked
    ? selectedIndex === null
      ? colors.subtext
      : colors.primaryButtonText
    : isCorrect
      ? colors.ink
      : '#ffffff';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            {literary ? (
              <>
                <View style={styles.banner}>
                  <Text style={styles.wordMain}>{current.word}</Text>
                  <Text style={styles.wordRound}>{(current as LiteraryMcqQuestion).roundTitle}</Text>
                  <View style={styles.progressRow}>{progressDots}</View>
                </View>
                <GlassCard borderRadius={16} contentStyle={styles.questionCard}>
                  <Text style={styles.contextLabel}>{(current as LiteraryMcqQuestion).roundTitle}</Text>
                  <Text style={styles.contextText}>{(current as LiteraryMcqQuestion).context}</Text>
                  {(current as LiteraryMcqQuestion).excerptText ? (
                    <>
                      <Text style={styles.excerptLabel}>{(current as LiteraryMcqQuestion).excerptLabel}</Text>
                      <Text style={styles.excerptText}>
                        "{(current as LiteraryMcqQuestion).excerptText}"
                      </Text>
                    </>
                  ) : null}
                </GlassCard>
              </>
            ) : (
              <>
                <Text style={styles.eyebrow}>{modeLabel}</Text>
                <Text style={styles.progress}>{progressLabel}</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((questionIndex + 1) / questions.length) * 100}%` },
                    ]}
                  />
                </View>
                <GlassCard borderRadius={16} contentStyle={styles.questionCard}>
                  <Text style={styles.question}>{current.question}</Text>
                </GlassCard>
              </>
            )}

            <View style={literary ? styles.optionsList : styles.optionsGrid}>
              {current.options.map((option, index) => {
                const scale = optionScales.current[index];
                const shake = optionShakes.current[index];
                if (!scale || !shake) return null;

                let backgroundColor = colors.card;
                let borderColor = colors.border;
                let textColor = colors.text;

                if (checked) {
                  if (index === current.correctIndex && isCorrect) {
                    backgroundColor = 'rgba(168,216,176,0.35)';
                    borderColor = colors.correct;
                  } else if (index === selectedIndex && !isCorrect) {
                    backgroundColor = 'rgba(232,97,122,0.15)';
                    borderColor = colors.wrong;
                  } else {
                    textColor = colors.subtext;
                  }
                } else if (index === selectedIndex) {
                  backgroundColor = 'rgba(200,180,232,0.22)';
                  borderColor = colors.lavender;
                }

                return (
                  <Animated.View
                    key={`${current.wordId}-${questionIndex}-${index}`}
                    style={[
                      literary ? undefined : styles.optionSlotGrid,
                      { transform: [{ scale }, { translateX: shake }] },
                    ]}
                  >
                    <Pressable
                      onPress={() => handleSelect(index)}
                      disabled={checked || finishing}
                      style={[styles.option, { backgroundColor, borderColor }]}
                      accessibilityRole="button"
                      accessibilityLabel={option}
                      accessibilityState={{
                        selected: selectedIndex === index,
                        disabled: checked || finishing,
                      }}
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.spacer} />

            <View style={[styles.footer, { backgroundColor: footerBg, borderColor: footerBorder }]}>
              {checked ? (
                <>
                  <View style={styles.feedbackRow}>
                    <View
                      style={[
                        styles.feedbackBadge,
                        { backgroundColor: isCorrect ? colors.correct : colors.wrong },
                      ]}
                    >
                      {isCorrect ? (
                        <CheckIcon size={13} weight="bold" color={colors.ink} />
                      ) : (
                        <XIcon size={13} weight="bold" color="#ffffff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.feedbackText,
                        { color: isCorrect ? colors.correctIcon : colors.wrong },
                      ]}
                    >
                      {isCorrect ? copy.gymModes.correctFeedback : copy.gymModes.wrongFeedback}
                    </Text>
                  </View>
                  {!isCorrect ? (
                    <Text style={styles.hint}>{copy.gymModes.mcqHint(current.word)}</Text>
                  ) : null}
                </>
              ) : null}

              <Pressable
                onPress={handlePrimaryAction}
                disabled={actionDisabled || finishing}
                style={[styles.actionBtn, { backgroundColor: actionBg }]}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
                accessibilityState={{ disabled: actionDisabled || finishing }}
              >
                <Text style={[styles.actionBtnText, { color: actionTextColor }]}>{actionLabel}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
