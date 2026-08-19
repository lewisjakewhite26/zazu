import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { XIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/ui/GradientBackground';
import { IconButton } from '@/components/ui/IconButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useProgress } from '@/hooks/useProgress';
import { useSnooze } from '@/hooks/useSnooze';
import { candidateTokens, tokenizePassage, type PassageToken } from '../../../lib/word-spotting';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';

const CORRECT_CONFIRM_MS = 500;
const WRONG_CLEAR_MS = 700;

export function MorningTaskScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord, isDemo, clearFlow, setCompletionResult } = useAlarmFlow();
  const { completeWord } = useProgress();
  // Not yet used today's snooze -> this alarm was dismissed clean, award the bonus.
  const { canSnooze: earnedNoSnoozeBonus } = useSnooze();
  const [dismissReady, setDismissReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    if (!sessionWord) {
      router.replace('/');
    }
  }, [sessionWord, router]);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    setDismissReady(false);
    setChecking(false);
    setCorrectIndex(null);
    setWrongIndex(null);
    setShowTryAgain(false);
    setWrongAttempts(0);
  }, [sessionWord]);

  const tokens: PassageToken[] = useMemo(() => {
    if (!sessionWord?.morningTask.passage) return [];
    return tokenizePassage(sessionWord.morningTask.passage, sessionWord.word);
  }, [sessionWord]);

  const targetIndex = useMemo(() => tokens.findIndex((token) => token.isTarget), [tokens]);
  const candidates = useMemo(() => candidateTokens(tokens), [tokens]);
  const showHintClue = wrongAttempts >= 1;
  const showHintReveal = wrongAttempts >= 2;

  useEffect(() => {
    if (wrongAttempts === 1 && sessionWord) {
      AccessibilityInfo.announceForAccessibility(copy.morningTask.hintClue(sessionWord.definition));
    } else if (wrongAttempts === 2 && sessionWord) {
      AccessibilityInfo.announceForAccessibility(
        screenReaderEnabled
          ? copy.morningTask.hintRevealScreenReader(sessionWord.word)
          : copy.morningTask.hintReveal,
      );
    }
  }, [wrongAttempts, sessionWord, screenReaderEnabled]);

  const handleExitDemo = () => {
    clearFlow();
    router.dismissTo('/add-alarm');
  };

  const handleTapToken = (index: number) => {
    const token = tokens[index];
    if (!token?.isWord || checking || dismissReady || submitting) return;

    if (token.isTarget) {
      setChecking(true);
      setShowTryAgain(false);
      setCorrectIndex(index);
      hapticCorrect();
      AccessibilityInfo.announceForAccessibility('Correct.');
      setTimeout(() => {
        setDismissReady(true);
        setChecking(false);
        AccessibilityInfo.announceForAccessibility('You can now dismiss the alarm.');
      }, CORRECT_CONFIRM_MS);
      return;
    }

    setWrongAttempts((count) => count + 1);
    setShowTryAgain(true);
    setWrongIndex(index);
    hapticWrong();
    AccessibilityInfo.announceForAccessibility(copy.morningTask.tryAgain);
    setTimeout(() => {
      setWrongIndex(null);
      setShowTryAgain(false);
    }, WRONG_CLEAR_MS);
  };

  const handleDismiss = async () => {
    if (!sessionWord || !dismissReady || submitting) return;
    setSubmitting(true);
    AccessibilityInfo.announceForAccessibility('Dismissing alarm…');
    try {
      const result = await completeWord(sessionWord.id, {
        noSnooze: earnedNoSnoozeBonus,
        firstTry: wrongAttempts === 0,
      });
      if (result) {
        setCompletionResult(result);
        router.replace('/success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        closeButton: {
          position: 'absolute',
          top: spacing.sm,
          right: spacing.lg,
          zIndex: 2,
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
        prompt: {
          ...typography.mtQuestion,
          color: colors.text,
          marginBottom: 8,
        },
        passageWrap: {
          marginBottom: spacing.xl,
        },
        passageText: {
          fontFamily: fonts.serif,
          fontSize: 24,
          lineHeight: 38,
          color: colors.text,
        },
        wordToken: {
          // Larger touch target than the glyphs alone need -- deliberately
          // generous, since precise taps are the wrong thing to demand right
          // after waking (see ALARM_DEBUG_SESSION notes on sleep inertia).
          paddingVertical: 4,
        },
        wordTokenCorrect: {
          backgroundColor: colors.correct,
          borderRadius: 6,
        },
        wordTokenWrong: {
          backgroundColor: colors.wrong,
          borderRadius: 6,
        },
        wordTokenHint: {
          backgroundColor: `${colors.gold}2e`,
          borderRadius: 6,
        },
        tryAgain: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
          marginTop: spacing.md,
          textAlign: 'center',
        },
        hintClue: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
          marginTop: spacing.sm,
          textAlign: 'center',
        },
        screenReaderPrompt: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.subtext,
          marginTop: spacing.sm,
          marginBottom: spacing.md,
        },
        candidateList: {
          gap: 8,
        },
        candidateOption: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
        },
        candidateOptionText: {
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.text,
        },
        cta: {
          marginTop: spacing.xl,
        },
      }),
    [colors],
  );

  if (!sessionWord) return null;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {isDemo ? (
          <IconButton
            onPress={handleExitDemo}
            accessibilityLabel="Exit demo alarm"
            variant="card"
            style={styles.closeButton}
          >
            <XIcon size={20} color={colors.text} />
          </IconButton>
        ) : null}
        <View style={styles.inner}>
          <Text style={styles.eyebrow}>{copy.morningTask.eyebrow}</Text>
          <Text style={styles.prompt}>{copy.morningTask.findPrompt}</Text>

          <View style={styles.passageWrap}>
            <Text style={styles.passageText}>
              {tokens.map((token, index) => {
                if (!token.isWord || screenReaderEnabled) {
                  return <Text key={index}>{token.text}</Text>;
                }
                return (
                  <Text
                    key={index}
                    onPress={() => handleTapToken(index)}
                    style={[
                      styles.wordToken,
                      showHintReveal && index === targetIndex && styles.wordTokenHint,
                      correctIndex === index && styles.wordTokenCorrect,
                      wrongIndex === index && styles.wordTokenWrong,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Word: ${token.text}`}
                  >
                    {token.text}
                  </Text>
                );
              })}
            </Text>
          </View>

          {screenReaderEnabled && !dismissReady ? (
            <>
              <Text style={styles.screenReaderPrompt}>{copy.morningTask.screenReaderPrompt}</Text>
              <View style={styles.candidateList}>
                {candidates.map(({ token, index }) => (
                  <Pressable
                    key={index}
                    onPress={() => handleTapToken(index)}
                    disabled={checking || submitting}
                    style={[
                      styles.candidateOption,
                      correctIndex === index && styles.wordTokenCorrect,
                      wrongIndex === index && styles.wordTokenWrong,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={token.text}
                  >
                    <Text style={styles.candidateOptionText}>{token.text}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {showTryAgain ? <Text style={styles.tryAgain}>{copy.morningTask.tryAgain}</Text> : null}
          {!dismissReady && showHintReveal ? (
            <Text style={styles.hintClue}>
              {screenReaderEnabled
                ? copy.morningTask.hintRevealScreenReader(sessionWord.word)
                : copy.morningTask.hintReveal}
            </Text>
          ) : !dismissReady && showHintClue && sessionWord ? (
            <Text style={styles.hintClue}>{copy.morningTask.hintClue(sessionWord.definition)}</Text>
          ) : null}

          {dismissReady ? (
            <PrimaryButton
              label={copy.morningTask.dismiss}
              variant="wake"
              onPress={() => void handleDismiss()}
              disabled={submitting}
              loading={submitting}
              style={styles.cta}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
