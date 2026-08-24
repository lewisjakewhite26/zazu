import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { XIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmOrbs } from '@/components/ui/AlarmOrbs';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { IconButton } from '@/components/ui/IconButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ShimmerText } from '@/components/ui/ShimmerText';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarmSound } from '@/hooks/useAlarmSound';
import { useSnooze } from '@/hooks/useSnooze';
import { alarmGreetingForDate } from '../../../lib/alarm-greeting';
import { scheduleSnoozeNotification } from '../../../lib/alarm-notifications';
import { HoldToSnooze } from './HoldToSnooze';

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord, isDemo, soundId, alarmId, clearFlow } = useAlarmFlow();
  const { recordSnooze, snoozeMinutes } = useSnooze();
  const [clock, setClock] = useState(formatClock(new Date()));
  const [snoozing, setSnoozing] = useState(false);
  const greeting = useMemo(() => alarmGreetingForDate(), []);

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sessionWord) {
      router.replace('/');
    }
  }, [sessionWord, router]);

  useAlarmSound(Boolean(sessionWord), soundId);

  const handleExitDemo = () => {
    clearFlow();
    router.dismissTo('/add-alarm');
  };

  // Long enough to see the ring's own bounce + ripple + checkmark play out
  // (and read "Snoozing N minutes…") before the screen changes underneath it.
  const SNOOZE_CONFIRM_DISPLAY_MS = 1400;

  const handleSnooze = async () => {
    if (!alarmId || snoozing) return;
    setSnoozing(true);
    try {
      await scheduleSnoozeNotification(alarmId, snoozeMinutes);
      await recordSnooze();
      await new Promise((resolve) => setTimeout(resolve, SNOOZE_CONFIRM_DISPLAY_MS));
      clearFlow();
      router.replace('/');
    } finally {
      setSnoozing(false);
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
        content: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        },
        spacerTop: {
          flex: 0.6,
        },
        spacerBottom: {
          flex: 1,
        },
        header: {
          alignItems: 'center',
          zIndex: 1,
        },
        bird: {
          width: 76,
          height: 100,
          marginBottom: spacing.sm,
        },
        labelWrap: {
          marginBottom: 6,
        },
        label: {
          ...typography.alarmGreeting,
          color: colors.subtext,
        },
        time: {
          ...typography.alarmBigTime,
          color: colors.text,
        },
        hero: {
          alignItems: 'center',
          zIndex: 1,
        },
        wordEyebrow: {
          ...typography.alarmWordEyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 14,
        },
        word: {
          ...typography.alarmWord,
          color: colors.text,
          textAlign: 'center',
        },
        sub: {
          ...typography.alarmSub,
          color: colors.subtext,
          marginTop: 18,
          textAlign: 'center',
        },
        footer: {
          width: '100%',
          alignItems: 'center',
          zIndex: 1,
        },
        cta: {
          maxWidth: 320,
        },
        snoozeControl: {
          marginTop: spacing.md,
        },
      }),
    [colors],
  );

  if (!sessionWord) return null;

  const showSnooze = !isDemo && Boolean(alarmId);

  return (
    <GradientBackground>
      <AlarmOrbs />
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/zazu-mark.png')}
              style={styles.bird}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.labelWrap}>
              <ShimmerText style={styles.label}>{greeting}</ShimmerText>
            </View>
            <Text style={styles.time}>{clock}</Text>
          </View>

          <View style={styles.spacerTop} />

          <View style={styles.hero}>
            <Text style={styles.wordEyebrow}>{copy.alarm.todaysWord}</Text>
            <Text style={styles.word}>{sessionWord.word}</Text>
            <Text style={styles.sub}>{copy.alarm.learnSub}</Text>
          </View>

          <View style={styles.spacerBottom} />

          <View style={styles.footer}>
            <PrimaryButton
              label={copy.alarm.wakeCta}
              variant="wake"
              onPress={() => router.push('/learn')}
              style={styles.cta}
            />
            {showSnooze ? (
              <HoldToSnooze
                minutes={snoozeMinutes}
                onConfirm={handleSnooze}
                disabled={snoozing}
                style={styles.snoozeControl}
              />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
