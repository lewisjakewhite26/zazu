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
import { CONTENT_MAX_WIDTH, MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
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
  const showHintReveal = wrongAttempts >= 2;

  useEffect(() => {
    if (wrongAttempts === 2 && sessionWord) {
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
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          color: colors.subtext,
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        passageWrap: {
          marginTop: spacing.md,
          marginBottom: spacing.lg,
        },
        passageText: {
          fontFamily: fonts.serif,
          fontSize: 28,
          lineHeight: 42,
          color: colors.text,
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
          fontSize: 15,
          color: colors.subtext,
          marginTop: spacing.md,
          textAlign: 'center',
        },
        hintClue: {
          fontFamily: fonts.sans,
          fontSize: 16,
          color: colors.subtext,
          marginTop: spacing.sm,
        },
        candidateList: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: spacing.sm,
        },
        candidateOption: {
          minHeight: MIN_TOUCH_TARGET,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 20,
        },
        candidateOptionText: {
          fontFamily: fonts.sans,
          fontSize: 18,
          color: colors.text,
        },
        spacerTop: {
          flex: 0.5,
        },
        spacerBottom: {
          flex: 1,
          minHeight: spacing.xl,
        },
        cta: {
          marginBottom: spacing.md,
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
          <View style={styles.spacerTop} />

          <Text style={styles.eyebrow}>{copy.morningTask.eyebrow}</Text>

          <View style={styles.passageWrap}>
            <Text style={styles.passageText}>{sessionWord.morningTask.passage}</Text>
          </View>

          {!dismissReady && sessionWord ? (
            <Text style={styles.hintClue}>{copy.morningTask.hintClue(sessionWord.definition)}</Text>
          ) : null}

          <Text style={styles.prompt}>{copy.morningTask.findPrompt}</Text>

          <View style={styles.candidateList}>
            {candidates.map(({ token, index }) => (
              <Pressable
                key={index}
                onPress={() => handleTapToken(index)}
                disabled={checking || submitting || dismissReady}
                style={[
                  styles.candidateOption,
                  showHintReveal && index === targetIndex && styles.wordTokenHint,
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

          {showTryAgain ? <Text style={styles.tryAgain}>{copy.morningTask.tryAgain}</Text> : null}
          {!dismissReady && showHintReveal ? (
            <Text style={styles.hintClue}>
              {screenReaderEnabled
                ? copy.morningTask.hintRevealScreenReader(sessionWord.word)
                : copy.morningTask.hintReveal}
            </Text>
          ) : null}

          <View style={styles.spacerBottom} />

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
