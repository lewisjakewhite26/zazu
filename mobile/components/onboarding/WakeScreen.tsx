import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeWheelPicker } from '@/components/alarm/TimeWheelPicker';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarms } from '@/hooks/useAlarms';

/** Onboarding step 2: the first alarm is the product, so set it here, switched on. */
export function WakeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { alarms, replaceAlarms } = useAlarms();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [saving, setSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        body: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          justifyContent: 'center',
        },
        heading: {
          fontFamily: fonts.serif,
          fontSize: 34,
          lineHeight: 40,
          letterSpacing: -0.6,
          color: colors.text,
          textAlign: 'center',
        },
        body2: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 23,
          color: colors.subtext,
          textAlign: 'center',
          marginTop: spacing.sm,
          marginBottom: spacing.xl,
        },
        footer: {
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        },
        link: { alignItems: 'center', paddingVertical: spacing.sm },
        linkText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.subtext },
      }),
    [colors],
  );

  const setAlarm = async () => {
    setSaving(true);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    // Replace the placeholder 07:30 (off) with the user's real alarm, switched on.
    const existing = alarms[0];
    const first = {
      id: existing?.id ?? `alarm-${Date.now()}`,
      time,
      label: copy.addAlarm.defaultLabel,
      enabled: true,
      soundId: existing?.soundId ?? 'susurrus',
    } as (typeof alarms)[number];
    await replaceAlarms([first, ...alarms.slice(1)]);
    setSaving(false);
    router.push('/(onboarding)/ready');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <Text style={styles.heading} accessibilityRole="header">
            {copy.onboarding.wakeHeading}
          </Text>
          <Text style={styles.body2}>{copy.onboarding.wakeBody}</Text>
          <TimeWheelPicker hour={hour} minute={minute} onChangeHour={setHour} onChangeMinute={setMinute} />
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <PrimaryButton label={copy.onboarding.wakeCta} onPress={() => void setAlarm()} loading={saving} />
          <Pressable
            style={styles.link}
            onPress={() => router.push('/(onboarding)/ready')}
            accessibilityRole="button"
            accessibilityLabel={copy.onboarding.wakeSkip}
          >
            <Text style={styles.linkText}>{copy.onboarding.wakeSkip}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
