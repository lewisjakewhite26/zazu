import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import type { LiteraryMcqQuestion } from '../../../lib/literary-words';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

const CORRECT_ADVANCE_MS = 500;

export function GymLiteraryRoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { gymSession, clearFlow } = useAlarmFlow();
  const { recordMcqAnswer, completeGymModeSession } = useProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [advanceReady, setAdvanceReady] = useState(false);
  const [sessionWordIds, setSessionWordIds] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);

  const optionScales = useRef<Animated.Value[]>([]);
  const optionShakes = useRef<Animated.Value[]>([]);

  const questions = gymSession && gymSession.mode === 'literary' ? gymSession.literaryQuestions : [];
  const current: LiteraryMcqQuestion | undefined = questions[questionIndex];

  useEffect(() => {
    if (!gymSession || gymSession.mode !== 'literary' || gymSession.literaryQuestions.length === 0) {
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
    runWrongShake(index);
    void recordMcqAnswer(current.wordId, false);
    setTimeout(() => setSelectedIndex(null), 700);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        scrollContent: { flexGrow: 1, paddingBottom: spacing.xl },
        inner: {
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
        },
        banner: { alignItems: 'center', paddingTop: 28, paddingBottom: 16 },
        wordMain: { ...typography.puzzleWordMain, color: colors.text },
        wordRound: {
          ...typography.puzzleWordRound,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginTop: 4,
        },
        contextContent: { paddingHorizontal: 16, paddingVertical: 13, marginBottom: 14 },
        contextLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 4,
        },
        contextText: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 13,
          lineHeight: 19,
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
          fontSize: 13,
          lineHeight: 20,
          color: colors.text,
          fontStyle: 'italic',
        },
        options: { gap: spacing.sm },
        option: {
          borderRadius: 14,
          borderWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        optionText: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 14,
          lineHeight: 20,
        },
        progressRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
          marginTop: spacing.sm,
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
      }),
    [colors],
  );

  if (!gymSession || gymSession.mode !== 'literary' || !current) return null;

  const progressDots = questions.map((_, index) => (
    <View key={index} style={[styles.progressDot, index <= questionIndex && styles.progressDotDone]} />
  ));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.banner}>
              <Text style={styles.wordMain}>{current.word}</Text>
              <Text style={styles.wordRound}>{current.roundTitle}</Text>
              <View style={styles.progressRow}>{progressDots}</View>
            </View>

            <GlassCard borderRadius={16} contentStyle={styles.contextContent}>
              <Text style={styles.contextLabel}>{current.roundTitle}</Text>
              <Text style={styles.contextText}>{current.context}</Text>
              {current.excerptText ? (
                <>
                  <Text style={styles.excerptLabel}>{current.excerptLabel}</Text>
                  <Text style={styles.excerptText}>"{current.excerptText}"</Text>
                </>
              ) : null}
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
                    key={`${current.wordId}-${questionIndex}-${index}`}
                    style={{ transform: [{ scale }, { translateX: shake }] }}
                  >
                    <Pressable
                      onPress={() => handleSelect(index)}
                      disabled={advanceReady || finishing}
                      style={[styles.option, { backgroundColor, borderColor }]}
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
