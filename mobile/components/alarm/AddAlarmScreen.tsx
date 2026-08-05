import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TimeWheelPicker } from '@/components/alarm/TimeWheelPicker';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarms } from '@/hooks/useAlarms';

export function AddAlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addAlarm } = useAlarms();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        keyboard: {
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
        header: {
          marginBottom: spacing.lg,
        },
        title: {
          ...typography.learnWord,
          fontSize: 32,
          color: colors.text,
        },
        fieldLabel: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: spacing.xs,
        },
        input: {
          ...typography.learnDef,
          color: colors.text,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          marginBottom: spacing.md,
        },
        timeWheel: {
          marginBottom: spacing.md,
        },
        card: {
          marginBottom: spacing.lg,
        },
        cardInner: {
          padding: spacing.lg,
        },
        saveButton: {
          marginTop: spacing.sm,
        },
      }),
    [colors],
  );

  const handleSave = async () => {
    setSaving(true);
    await addAlarm(time, label.trim() || copy.home.weekdaysPack);
    setSaving(false);
    router.back();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View style={styles.inner}>
            <ScreenHeader
              style={styles.header}
              title={copy.addAlarm.title}
              titleStyle={styles.title}
              onBack={() => router.back()}
              backAccessibilityLabel={copy.addAlarm.cancel}
            />

            <GlassCard borderRadius={radii.alarmCard} style={styles.card} contentStyle={styles.cardInner}>
              <Text style={styles.fieldLabel}>{copy.addAlarm.timeLabel}</Text>
              <TimeWheelPicker
                hour={hour}
                minute={minute}
                onChangeHour={setHour}
                onChangeMinute={setMinute}
                style={styles.timeWheel}
              />

              <Text style={styles.fieldLabel}>{copy.addAlarm.labelLabel}</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder={copy.addAlarm.labelPlaceholder}
                placeholderTextColor={colors.subtext}
                style={styles.input}
              />

              <PrimaryButton
                label={copy.addAlarm.save}
                onPress={() => void handleSave()}
                loading={saving}
                style={styles.saveButton}
              />
            </GlassCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
