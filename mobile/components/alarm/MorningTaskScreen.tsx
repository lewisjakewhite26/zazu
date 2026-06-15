import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useProgress } from '@/hooks/useProgress';
import { buildMorningOptions } from '../../../lib/morning-task';
import { fetchMorningTaskDistractors } from '../../../lib/supabase';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

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
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

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
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionWord]);

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

  const handleSelect = (index: number) => {
    if (submitting || isCorrect) return;
    if (index === correctIndex) {
      setSelectedIndex(index);
      hapticCorrect();
      return;
    }
    hapticWrong();
    setSelectedIndex(index);
    setTimeout(() => {
      setSelectedIndex((current) => (current === index ? null : current));
    }, 700);
  };

  const handleDismiss = async () => {
    if (!sessionWord || !isCorrect || submitting) return;
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
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <Text style={[styles.eyebrow, { color: colors.subtext }]}>{copy.morningTask.eyebrow}</Text>
          <Text style={[styles.word, { color: colors.text }]}>{sessionWord.word}</Text>

          {loading ? (
            <ActivityIndicator color={colors.subtext} style={styles.loader} />
          ) : (
            <>
              <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

              <View style={styles.options}>
                {options.map((option, index) => (
                  <Pressable
                    key={`${option}-${index}`}
                    onPress={() => handleSelect(index)}
                    disabled={isCorrect}
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
                ))}
              </View>

              {selectedIndex !== null && !isCorrect && hint ? (
                <Text style={[styles.hint, { color: colors.subtext }]}>{hint}</Text>
              ) : null}

              {isCorrect ? (
                <PrimaryButton
                  label={copy.morningTask.dismiss}
                  onPress={() => void handleDismiss()}
                  disabled={submitting}
                  style={styles.cta}
                />
              ) : null}

              {selectedIndex !== null && !isCorrect ? (
                <Text style={[styles.tryAgain, { color: colors.subtext }]}>
                  {copy.morningTask.tryAgain}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  word: {
    fontFamily: fonts.serif,
    fontSize: 32,
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.xl,
  },
  question: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  tryAgain: {
    fontFamily: fonts.sans,
    fontSize: 14,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.xl,
  },
});
