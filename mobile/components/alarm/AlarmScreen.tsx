import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { XIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmOrbs } from '@/components/ui/AlarmOrbs';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { IconButton } from '@/components/ui/IconButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarmSound } from '@/hooks/useAlarmSound';
import { useSnooze, SNOOZE_MINUTES } from '@/hooks/useSnooze';
import { scheduleSnoozeNotification } from '../../../lib/alarm-notifications';

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord, isDemo, soundId, alarmId, clearFlow } = useAlarmFlow();
  const { canSnooze, recordSnooze } = useSnooze();
  const [clock, setClock] = useState(formatClock(new Date()));
  const [snoozing, setSnoozing] = useState(false);

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
    router.replace('/');
  };

  const handleSnooze = async () => {
    if (!alarmId || snoozing) return;
    setSnoozing(true);
    try {
      await scheduleSnoozeNotification(alarmId, SNOOZE_MINUTES);
      await recordSnooze();
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
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        },
        bird: {
          width: 48,
          height: 63,
          marginBottom: spacing.md,
          zIndex: 1,
        },
        label: {
          ...typography.alarmLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 10,
          zIndex: 1,
        },
        time: {
          ...typography.alarmBigTime,
          color: colors.text,
          marginBottom: spacing.sm,
          zIndex: 1,
        },
        wordTease: {
          ...typography.alarmTease,
          color: colors.subtext,
          marginBottom: 6,
          zIndex: 1,
        },
        wordEmphasis: {
          fontFamily: typography.learnWord.fontFamily,
          fontStyle: 'italic',
          color: colors.text,
        },
        sub: {
          ...typography.alarmSub,
          color: colors.subtext,
          marginBottom: 44,
          zIndex: 1,
        },
        cta: {
          maxWidth: 320,
          zIndex: 1,
        },
        snoozeCta: {
          maxWidth: 320,
          marginTop: spacing.sm,
          zIndex: 1,
        },
        snoozeUsed: {
          ...typography.alarmSub,
          color: colors.subtext,
          marginBottom: 0,
          marginTop: spacing.sm,
          zIndex: 1,
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
          <Image
            source={require('@/assets/images/zazu-mark.png')}
            style={styles.bird}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.label}>{copy.alarm.goodMorning}</Text>
          <Text style={styles.time}>{clock}</Text>
          <Text style={styles.wordTease}>
            {copy.alarm.todaysWord}{' '}
            <Text style={styles.wordEmphasis}>{sessionWord.word}</Text>
          </Text>
          <Text style={styles.sub}>{copy.alarm.learnSub}</Text>
          <PrimaryButton
            label={copy.alarm.wakeCta}
            variant="wake"
            onPress={() => router.push('/learn')}
            style={styles.cta}
          />
          {showSnooze ? (
            canSnooze ? (
              <PrimaryButton
                label={copy.alarm.snoozeCta(SNOOZE_MINUTES)}
                variant="outline"
                onPress={handleSnooze}
                disabled={snoozing}
                loading={snoozing}
                style={styles.snoozeCta}
              />
            ) : (
              <Text style={styles.snoozeUsed}>{copy.alarm.snoozeUsed}</Text>
            )
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
