import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarms } from '@/hooks/useAlarms';

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function AddAlarmScreen() {
  const router = useRouter();
  const { addAlarm } = useAlarms();
  const [time, setTime] = useState('07:30');
  const [label, setLabel] = useState<string>(copy.home.weekdaysPack);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View style={styles.inner}>
            <Text style={styles.title}>{copy.addAlarm.title}</Text>

            <Text style={styles.fieldLabel}>{copy.addAlarm.timeLabel}</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder={copy.addAlarm.timePlaceholder}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>{copy.addAlarm.labelLabel}</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={copy.addAlarm.labelPlaceholder}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              label={copy.addAlarm.save}
              onPress={() => void handleSave()}
              loading={saving}
              style={styles.saveButton}
            />
          </View>
        </KeyboardAvoidingView>
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
  keyboard: {
    flex: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 16,
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
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.wrong,
    marginBottom: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
