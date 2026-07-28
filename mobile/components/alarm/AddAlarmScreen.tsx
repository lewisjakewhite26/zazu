import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarms } from '@/hooks/useAlarms';

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function AddAlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addAlarm } = useAlarms();
  const [time, setTime] = useState('07:30');
  const [label, setLabel] = useState<string>(copy.home.weekdaysPack);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
        title: {
          ...typography.learnWord,
          fontSize: 32,
          color: colors.text,
          marginBottom: spacing.lg,
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
        error: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 13,
          color: colors.wrong,
          marginBottom: spacing.sm,
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
    if (!isValidTime(time)) {
      setError(copy.addAlarm.invalidTime);
      return;
    }

    setSaving(true);
    setError('');
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
            <Text style={styles.title}>{copy.addAlarm.title}</Text>

            <GlassCard borderRadius={radii.alarmCard} style={styles.card} contentStyle={styles.cardInner}>
              <Text style={styles.fieldLabel}>{copy.addAlarm.timeLabel}</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder={copy.addAlarm.timePlaceholder}
                placeholderTextColor={colors.subtext}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>{copy.addAlarm.labelLabel}</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder={copy.addAlarm.labelPlaceholder}
                placeholderTextColor={colors.subtext}
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

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
