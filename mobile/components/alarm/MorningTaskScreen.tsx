import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useProgress } from '@/hooks/useProgress';
import { buildMorningOptions } from '../../../lib/morning-task';
import { fetchMorningTaskDistractors } from '../../../lib/supabase';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

const CORRECT_CONFIRM_MS = 500;

export function MorningTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord, setCompletionResult } = useAlarmFlow();
  const { completeWord } = useProgress();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dismissReady, setDismissReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const optionScales = useRef<Animated.Value[]>([]);
  const optionShakes = useRef<Animated.Value[]>([]);

  useEffect(() => {
    if (!sessionWord) {
      router.replace('/');
    }
  }, [sessionWord, router]);

  useEffect(() => {
    if (!sessionWord) return;

    let cancelled = false;

    (async () => {
      const pool = await fetchMorningTaskDistractors();
      if (cancelled) return;

      const built = buildMorningOptions(sessionWord, pool, 3);
      setQuestion(built.question);
      setOptions(built.options);
      setCorrectIndex(built.correctIndex);
      setHint(sessionWord.morningTask.hint);
      setSelectedIndex(null);
      setDismissReady(false);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionWord]);

  useEffect(() => {
    optionScales.current = options.map((_, index) => optionScales.current[index] ?? new Animated.Value(1));
    optionShakes.current = options.map((_, index) => optionShakes.current[index] ?? new Animated.Value(0));
    setDismissReady(false);
    setSelectedIndex(null);
  }, [options]);

  const isCorrect = selectedIndex === correctIndex;

  const optionStyles = useMemo(
    () =>
      options.map((_, index) => {
        if (selectedIndex === null) {
          return {
            backgroundColor: colors.card,
            borderColor: colors.border,
            textColor: colors.text,
          };
        }
        if (index === correctIndex && isCorrect) {
          return {
            backgroundColor: 'rgba(168,216,176,0.35)',
            borderColor: colors.correct,
            textColor: colors.text,
          };
        }
        if (index === selectedIndex && !isCorrect) {
          return {
            backgroundColor: 'rgba(232,97,122,0.15)',
            borderColor: colors.wrong,
            textColor: colors.text,
          };
        }
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
          textColor: colors.subtext,
        };
      }),
    [colors, correctIndex, isCorrect, options, selectedIndex],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
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
          marginBottom: 10,
        },
        word: {
          ...typography.learnWord,
          color: colors.text,
          marginBottom: spacing.lg,
        },
        loader: {
          marginTop: spacing.xl,
        },
        question: {
          ...typography.mtQuestion,
          color: colors.text,
          marginBottom: 18,
        },
        options: {
          gap: 10,
        },
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
        cta: {
          marginTop: spacing.xl,
        },
      }),
    [colors],
  );

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
      Animated.timing(shake, { toValue: -4, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 4, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const handleSelect = (index: number) => {
    if (submitting || dismissReady || isCorrect) return;

    if (index === correctIndex) {
      setSelectedIndex(index);
      hapticCorrect();
      runCorrectPop(index);
      setTimeout(() => setDismissReady(true), CORRECT_CONFIRM_MS);
      return;
    }

    hapticWrong();
    setSelectedIndex(index);
    runWrongShake(index);
    setTimeout(() => {
      setSelectedIndex((current) => (current === index ? null : current));
    }, 700);
  };

  const handleDismiss = async () => {
    if (!sessionWord || !dismissReady || submitting) return;
    setSubmitting(true);
    try {
      const result = await completeWord(sessionWord.id, { noSnooze: true });
      if (result) {
        setCompletionResult(result);
        router.replace('/success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionWord) return null;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <Text style={styles.eyebrow}>{copy.morningTask.eyebrow}</Text>
          <Text style={styles.word}>{sessionWord.word}</Text>

          {loading ? (
            <ActivityIndicator color={colors.subtext} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.question}>{question}</Text>

              <View style={styles.options}>
                {options.map((option, index) => {
                  const scale = optionScales.current[index];
                  const shake = optionShakes.current[index];
                  if (!scale || !shake) return null;
                  return (
                    <Animated.View
                      key={`${option}-${index}`}
                      style={{
                        transform: [{ scale }, { translateX: shake }],
                      }}
                    >
                      <Pressable
                        onPress={() => handleSelect(index)}
                        disabled={dismissReady}
                        style={[
                          styles.option,
                          {
                            backgroundColor: optionStyles[index].backgroundColor,
                            borderColor: optionStyles[index].borderColor,
                          },
                        ]}
                      >
                        <Text style={[styles.optionText, { color: optionStyles[index].textColor }]}>
                          {option}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {selectedIndex !== null && !isCorrect && hint ? (
                <Text style={styles.hint}>{hint}</Text>
              ) : null}

              {dismissReady ? (
                <PrimaryButton
                  label={copy.morningTask.dismiss}
                  variant="wake"
                  onPress={() => void handleDismiss()}
                  disabled={submitting}
                  style={styles.cta}
                />
              ) : null}

              {selectedIndex !== null && !isCorrect ? (
                <Text style={styles.tryAgain}>{copy.morningTask.tryAgain}</Text>
              ) : null}
            </>
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
