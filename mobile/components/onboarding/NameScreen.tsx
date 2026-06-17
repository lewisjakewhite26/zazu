import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function NameScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { saveName, authBusy, authError } = useAuth();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        body: {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        },
        card: {
          width: '100%',
        },
        cardInner: {
          padding: spacing.lg,
        },
        heading: {
          ...typography.learnWord,
          fontSize: 28,
          color: colors.text,
          marginBottom: spacing.lg,
        },
        input: {
          fontFamily: fonts.sans,
          fontSize: 17,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          marginBottom: spacing.lg,
          backgroundColor: colors.card,
        },
        error: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.wrong,
          marginBottom: spacing.sm,
        },
        footer: {
          paddingHorizontal: spacing.lg,
        },
      }),
    [colors],
  );

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !authBusy;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <GlassCard borderRadius={radii.wotd} style={styles.card} contentStyle={styles.cardInner}>
            <Text style={styles.heading}>{copy.onboarding.nameHeading}</Text>
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              placeholder={copy.onboarding.namePlaceholder}
              placeholderTextColor={colors.subtext}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (canSubmit) void saveName(trimmed);
              }}
              style={styles.input}
            />
            {authError ? <Text style={styles.error}>{authError}</Text> : null}
            <PrimaryButton
              label={copy.onboarding.nameConfirm}
              onPress={() => void saveName(trimmed)}
              disabled={!canSubmit}
              loading={authBusy}
            />
          </GlassCard>
        </View>
        <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.lg }]} />
      </SafeAreaView>
    </GradientBackground>
  );
}
