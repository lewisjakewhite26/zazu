import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';

export function SettingsScreen() {
  const router = useRouter();
  const { colors, override, toggleOverride } = useTheme();
  const { session, displayName, isAnonymous, signOut, goToSignIn, authBusy } = useAuth();
  const { isGold, grantDevGold } = useSubscription();

  const themeToggleLabel =
    override === 'auto'
      ? copy.settings.themeAuto
      : override === 'light'
        ? copy.settings.themeLight
        : copy.settings.themeDark;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        header: {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        },
        body: {
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        card: {
          width: '100%',
        },
        cardInner: {
          padding: spacing.lg,
          gap: spacing.sm,
        },
        cardTitle: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 15,
          color: colors.text,
        },
        cardSub: {
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 21,
          color: colors.subtext,
        },
      }),
    [colors],
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ScreenHeader
          title={copy.settings.title}
          onBack={() => router.back()}
          backAccessibilityLabel={copy.settings.back}
        />
      </View>

      <View style={styles.body}>
        <GlassCard borderRadius={16} style={styles.card} contentStyle={styles.cardInner}>
          {session && displayName ? (
            <Text style={styles.cardTitle}>{copy.settings.signedInAs(displayName)}</Text>
          ) : (
            <>
              <Text style={styles.cardTitle}>{copy.settings.guestMode}</Text>
              <Text style={styles.cardSub}>{copy.settings.guestHint}</Text>
            </>
          )}
          <Text style={styles.cardSub}>
            {isGold ? copy.settings.goldMember : copy.settings.freePlan}
          </Text>
        </GlassCard>

        <PrimaryButton
          label={themeToggleLabel}
          variant="outline"
          onPress={toggleOverride}
          accessibilityHint={copy.settings.themeToggleHint}
        />

        <PrimaryButton
          label={isGold ? copy.settings.manageGold : copy.settings.upgradeGold}
          variant="outline"
          onPress={() => router.push('/gold')}
        />

        {session ? (
          <PrimaryButton
            label={copy.settings.signOut}
            variant="outline"
            onPress={() => void signOut()}
            loading={authBusy}
          />
        ) : isAnonymous ? (
          <PrimaryButton label={copy.settings.signIn} onPress={goToSignIn} />
        ) : null}

        {__DEV__ && session ? (
          <PrimaryButton
            label="Grant Gold (dev)"
            variant="outline"
            onPress={() => void grantDevGold()}
          />
        ) : null}
      </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
