import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckIcon, PauseIcon, PlayIcon } from 'phosphor-react-native';

import { Divider } from '@/components/ui/Divider';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { IconButton } from '@/components/ui/IconButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TimeWheelPicker } from '@/components/alarm/TimeWheelPicker';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarms } from '@/hooks/useAlarms';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import {
  ALARM_SOUNDS,
  DEFAULT_ALARM_SOUND_ID,
  previewAlarmSound,
  stopAlarmSoundPreview,
  type AlarmSoundId,
} from '../../../lib/alarm-sound';

export function AddAlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addAlarm } = useAlarms();
  const { startFlow } = useAlarmFlow();
  const { alarmWordOfDay } = useWordLibrary();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState('');
  const [soundId, setSoundId] = useState<AlarmSoundId>(DEFAULT_ALARM_SOUND_ID);
  const [previewingId, setPreviewingId] = useState<AlarmSoundId | null>(null);
  const [saving, setSaving] = useState(false);
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  useEffect(() => {
    return () => {
      if (previewingId) void stopAlarmSoundPreview(previewingId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          flexGrow: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
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
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          paddingVertical: spacing.sm + 2,
          marginBottom: spacing.lg,
        },
        timeWheel: {
          marginBottom: spacing.lg,
        },
        soundList: {
          marginBottom: spacing.lg,
        },
        soundRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: MIN_TOUCH_TARGET,
          paddingVertical: spacing.xs,
        },
        soundLabelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        },
        soundLabel: {
          ...typography.learnDef,
          fontSize: 15,
          color: colors.text,
        },
        soundLabelSelected: {
          fontFamily: fonts.sansSemiBold,
          color: colors.blush,
        },
        tryAlarmButton: {
          marginTop: spacing.sm,
        },
        saveButton: {
          marginTop: spacing.sm,
        },
      }),
    [colors],
  );

  const handleSave = async () => {
    if (previewingId) await stopAlarmSoundPreview(previewingId);
    setSaving(true);
    await addAlarm(time, label.trim() || copy.home.weekdaysPack, soundId);
    setSaving(false);
    router.back();
  };

  const handleTryAlarm = async () => {
    if (!alarmWordOfDay) return;
    if (previewingId) await stopAlarmSoundPreview(previewingId);
    startFlow(alarmWordOfDay, { isDemo: true, soundId });
    router.push('/alarm');
  };

  const handleTogglePreview = async (id: AlarmSoundId) => {
    if (previewingId === id) {
      setPreviewingId(null);
      await stopAlarmSoundPreview(id);
      return;
    }
    if (previewingId) await stopAlarmSoundPreview(previewingId);
    setPreviewingId(id);
    await previewAlarmSound(id);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            style={styles.keyboard}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ScreenHeader
              style={styles.header}
              title={copy.addAlarm.title}
              titleStyle={styles.title}
              onBack={() => router.back()}
              backAccessibilityLabel={copy.addAlarm.cancel}
            />

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

            <Text style={styles.fieldLabel}>{copy.addAlarm.soundLabel}</Text>
            <View style={styles.soundList}>
              {ALARM_SOUNDS.map((sound, index) => {
                const selected = sound.id === soundId;
                const previewing = previewingId === sound.id;
                return (
                  <View key={sound.id}>
                    {index > 0 ? <Divider /> : null}
                    <Pressable
                      onPress={() => setSoundId(sound.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={sound.label}
                      style={styles.soundRow}
                    >
                      <View style={styles.soundLabelRow}>
                        {selected ? <CheckIcon size={16} weight="bold" color={colors.blush} /> : null}
                        <Text style={[styles.soundLabel, selected && styles.soundLabelSelected]}>
                          {sound.label}
                        </Text>
                      </View>
                      <IconButton
                        onPress={() => void handleTogglePreview(sound.id)}
                        accessibilityLabel={copy.addAlarm.soundPreviewA11y(sound.label)}
                      >
                        {previewing ? (
                          <PauseIcon size={16} color={colors.text} />
                        ) : (
                          <PlayIcon size={16} color={colors.text} />
                        )}
                      </IconButton>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <PrimaryButton
              label={copy.home.tryTheAlarm}
              variant="outline"
              onPress={() => void handleTryAlarm()}
              disabled={!alarmWordOfDay}
              style={styles.tryAlarmButton}
            />

            <PrimaryButton
              label={copy.addAlarm.save}
              onPress={() => void handleSave()}
              loading={saving}
              style={styles.saveButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}
