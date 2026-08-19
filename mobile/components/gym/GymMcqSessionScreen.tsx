import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import type { GymMcqQuestion } from '../../../lib/gym-modes';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

const CORRECT_ADVANCE_MS = 500;

type GymMcqSessionScreenProps = {
  modeLabel: string;
};

export function GymMcqSessionScreen({ modeLabel }: GymMcqSessionScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { gymSession, clearFlow } = useAlarmFlow();
  const { recordMcqAnswer, completeGymModeSession } = useProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [advanceReady, setAdvanceReady] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [sessionWordIds, setSessionWordIds] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);

  const optionScales = useRef<Animated.Value[]>([]);
  const optionShakes = useRef<Animated.Value[]>([]);

  const questions = gymSession && gymSession.mode !== 'literary' ? gymSession.mcqQuestions : [];
  const current: GymMcqQuestion | undefined = questions[questionIndex];

  useEffect(() => {
    if (!gymSession || gymSession.mode === 'literary' || gymSession.mcqQuestions.length === 0) {
      router.replace('/(tabs)/gym');
    }
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
    setAdvanceReady(false);
    setHintShown(false);
  }, [current?.wordId, current?.question]);

  const isCorrect = selectedIndex !== null && current && selectedIndex === current.correctIndex;

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
    if (!current || advanceReady || finishing) return;

    if (index === current.correctIndex) {
      setSelectedIndex(index);
      hapticCorrect();
      runCorrectPop(index);
      void recordMcqAnswer(current.wordId, true);
      setSessionWordIds((ids) => (ids.includes(current.wordId) ? ids : [...ids, current.wordId]));
      setTimeout(() => {
        setAdvanceReady(true);
        setTimeout(goNextQuestion, CORRECT_ADVANCE_MS);
      }, CORRECT_ADVANCE_MS);
      return;
    }

    hapticWrong();
    setSelectedIndex(index);
    setHintShown(true);
    runWrongShake(index);
    void recordMcqAnswer(current.wordId, false);
    setTimeout(() => setSelectedIndex(null), 700);
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
          fontFamily: typography.btnDemo.fontFamily,
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
        optionText: {
          ...typography.mtOption,
        },
        hint: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 13,
          lineHeight: 20,
          color: colors.subtext,
          marginTop: 14,
        },
        tryAgain: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 14,
          color: colors.subtext,
          marginTop: spacing.md,
          textAlign: 'center',
        },
      }),
    [colors],
  );

  if (!gymSession || !current) return null;

  const progressLabel = copy.gymModes.questionProgress(questionIndex + 1, questions.length);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <Text style={styles.eyebrow}>{modeLabel}</Text>
          <Text style={styles.progress}>{progressLabel}</Text>

          <GlassCard borderRadius={16} contentStyle={styles.questionCard}>
            <Text style={styles.question}>{current.question}</Text>
          </GlassCard>

          <View style={styles.options}>
            {current.options.map((option, index) => {
              const scale = optionScales.current[index];
              const shake = optionShakes.current[index];
              if (!scale || !shake) return null;

              let backgroundColor = colors.card;
              let borderColor = colors.border;
              let textColor = colors.text;

              if (selectedIndex !== null) {
                if (index === current.correctIndex && isCorrect) {
                  backgroundColor = 'rgba(168,216,176,0.35)';
                  borderColor = colors.correct;
                } else if (index === selectedIndex && !isCorrect) {
                  backgroundColor = 'rgba(232,97,122,0.15)';
                  borderColor = colors.wrong;
                } else if (!isCorrect) {
                  textColor = colors.subtext;
                }
              }

              return (
                <Animated.View
                  key={`${current.wordId}-${option}`}
                  style={{ transform: [{ scale }, { translateX: shake }] }}
                >
                  <Pressable
                    onPress={() => handleSelect(index)}
                    disabled={advanceReady || finishing}
                    style={[styles.option, { backgroundColor, borderColor }]}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                    accessibilityState={{
                      selected: selectedIndex === index,
                      disabled: advanceReady || finishing,
                    }}
                  >
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {hintShown && selectedIndex !== null && !isCorrect ? (
            <Text style={styles.hint}>{copy.gymModes.mcqHint(current.word)}</Text>
          ) : null}

          {selectedIndex !== null && !isCorrect ? (
            <Text style={styles.tryAgain}>{copy.morningTask.tryAgain}</Text>
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
