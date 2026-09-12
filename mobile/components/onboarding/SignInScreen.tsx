import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OAuthButton } from '@/components/auth/OAuthButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  buildGoogleAuthRequest,
  isAppleSignInAvailable,
  signInWithGoogleNative,
  signInWithGoogleOAuth,
} from '@/services/auth';

export function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signInApple, signInGoogle, authBusy, authError, session, needsName } = useAuth();
  const googleConfig = buildGoogleAuthRequest();
  const showApple = isAppleSignInAvailable();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (session && !needsName) {
      router.replace('/(tabs)');
    }
  }, [session, needsName, router]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        header: {
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
        },
        body: {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        muted: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 21,
          color: colors.subtext,
          textAlign: 'center',
          marginTop: spacing.sm,
        },
        error: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.wrong,
          textAlign: 'center',
        },
        footerSpacer: {
          height: insets.bottom || spacing.lg,
        },
      }),
    [colors, insets.bottom],
  );

  const handleGoogle = async () => {
    if (!googleConfig.isConfigured || googleBusy) return;

    if (Platform.OS === 'web') {
      void signInWithGoogleOAuth();
      return;
    }

    setGoogleError(null);
    setGoogleBusy(true);
    try {
      const outcome = await signInWithGoogleNative();
      if (outcome.type === 'cancelled') return;
      await signInGoogle(outcome.idToken);
    } catch {
      setGoogleError(copy.onboarding.googleSignInFailed);
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ScreenHeader onBack={() => router.back()} />
        </View>

        <View style={styles.body}>
          {showApple ? (
            <OAuthButton
              provider="apple"
              onPress={() => void signInApple()}
              loading={authBusy}
              disabled={authBusy}
            />
          ) : null}
          <OAuthButton
            provider="google"
            onPress={() => void handleGoogle()}
            loading={authBusy || googleBusy}
            disabled={authBusy || googleBusy || !googleConfig.isConfigured}
          />
          {!googleConfig.isConfigured ? (
            <Text style={styles.muted}>{copy.onboarding.googleNotConfigured}</Text>
          ) : (
            <Text style={styles.muted}>{copy.onboarding.progressSaved}</Text>
          )}
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
          {!authError && googleError ? <Text style={styles.error}>{googleError}</Text> : null}
        </View>

        <View style={styles.footerSpacer} />
      </SafeAreaView>
    </GradientBackground>
  );
}
