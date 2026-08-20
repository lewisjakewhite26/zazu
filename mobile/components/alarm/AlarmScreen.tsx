import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSnooze, SNOOZE_MINUTES, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES } from '@/hooks/useSnooze';
import { alarmGreetingForDate } from '../../../lib/alarm-greeting';
import { scheduleSnoozeNotification } from '../../../lib/alarm-notifications';
import { SnoozeSlider } from './SnoozeSlider';

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const SHIMMER_BAND_WIDTH = 90;
const SHIMMER_BAND_HEIGHT = 70;

export function AlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord, isDemo, soundId, alarmId, clearFlow } = useAlarmFlow();
  const { canSnooze, recordSnooze } = useSnooze();
  const [clock, setClock] = useState(formatClock(new Date()));
  const [snoozing, setSnoozing] = useState(false);
  const [snoozeMinutes, setSnoozeMinutes] = useState(SNOOZE_MINUTES);
  const [labelWidth, setLabelWidth] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const greeting = useMemo(() => alarmGreetingForDate(), []);

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!labelWidth) return;
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 2600,
      delay: 500,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [labelWidth, shimmerAnim]);

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

  const handleSnooze = async () => {
    if (!alarmId || snoozing) return;
    setSnoozing(true);
    try {
      await scheduleSnoozeNotification(alarmId, snoozeMinutes);
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
        shimmerBand: {
          position: 'absolute',
          top: -SHIMMER_BAND_HEIGHT / 3,
          height: SHIMMER_BAND_HEIGHT,
          width: SHIMMER_BAND_WIDTH,
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
        snoozeSlider: {
          maxWidth: 320,
          marginTop: spacing.md,
        },
        snoozeCta: {
          maxWidth: 320,
          marginTop: spacing.sm,
        },
        snoozeUsed: {
          ...typography.alarmSub,
          color: colors.subtext,
          marginBottom: 0,
          marginTop: spacing.sm,
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
            <View
              style={styles.labelWrap}
              onLayout={(event) => setLabelWidth(event.nativeEvent.layout.width)}
            >
              <Text style={styles.label}>{greeting}</Text>
              {labelWidth > 0 ? (
                <MaskedView
                  pointerEvents="none"
                  style={StyleSheet.absoluteFill}
                  maskElement={<Text style={styles.label}>{greeting}</Text>}
                >
                  <Animated.View
                    style={[
                      styles.shimmerBand,
                      {
                        transform: [
                          {
                            translateX: shimmerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-SHIMMER_BAND_WIDTH, labelWidth + SHIMMER_BAND_WIDTH],
                            }),
                          },
                          { rotate: '20deg' },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(255,255,255,0.9)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </MaskedView>
              ) : null}
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
              canSnooze ? (
                <>
                  <SnoozeSlider
                    value={snoozeMinutes}
                    min={SNOOZE_MIN_MINUTES}
                    max={SNOOZE_MAX_MINUTES}
                    onChange={setSnoozeMinutes}
                    disabled={snoozing}
                    style={styles.snoozeSlider}
                  />
                  <PrimaryButton
                    label={copy.alarm.snoozeCta(snoozeMinutes)}
                    variant="outline"
                    onPress={handleSnooze}
                    disabled={snoozing}
                    loading={snoozing}
                    style={styles.snoozeCta}
                  />
                </>
              ) : (
                <Text style={styles.snoozeUsed}>{copy.alarm.snoozeUsed}</Text>
              )
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
