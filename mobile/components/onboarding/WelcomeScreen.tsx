import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { continueAsGuest, goToSignIn, authBusy } = useAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        body: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        },
        wordmark: {
          ...typography.wordmark,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        tagline: {
          ...typography.tagline,
          color: colors.text,
          marginBottom: spacing.lg,
          textAlign: 'center',
        },
        muted: {
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 22,
          color: colors.subtext,
          textAlign: 'center',
        },
        footer: {
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        link: {
          alignItems: 'center',
          paddingVertical: spacing.sm,
        },
        linkText: {
          fontFamily: fonts.sansMedium,
          fontSize: 14,
          color: colors.subtext,
        },
      }),
    [colors],
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <Text style={styles.wordmark}>Zazu</Text>
          <Text style={styles.tagline}>{copy.brand.tagline}</Text>
          <Text style={styles.muted}>{copy.onboarding.noAccountNeeded}</Text>
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
        >
          <PrimaryButton
            label={copy.onboarding.getStarted}
            onPress={() => void continueAsGuest()}
            loading={authBusy}
          />
          <Pressable
            style={styles.link}
            onPress={goToSignIn}
            accessibilityRole="button"
            accessibilityLabel={copy.onboarding.alreadyHaveAccount}
          >
            <Text style={styles.linkText}>{copy.onboarding.alreadyHaveAccount}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
