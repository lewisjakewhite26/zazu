import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
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
  signInWithGoogleOAuth,
} from '@/services/auth';

export function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signInApple, signInGoogle, authBusy, authError, session, needsName } = useAuth();
  const googleConfig = buildGoogleAuthRequest();
  const showApple = isAppleSignInAvailable();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleConfig.webClientId,
    iosClientId: googleConfig.iosClientId,
    androidClientId: googleConfig.androidClientId,
  });

  useEffect(() => {
    if (session && !needsName) {
      router.replace('/(tabs)');
    }
  }, [session, needsName, router]);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params.id_token;
    if (!idToken) return;
    void signInGoogle(idToken);
  }, [response, signInGoogle]);

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

  const handleGoogle = () => {
    if (!googleConfig.isConfigured) return;
    if (Platform.OS === 'web') {
      void signInWithGoogleOAuth();
      return;
    }
    if (!request) return;
    void promptAsync();
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
            onPress={handleGoogle}
            loading={authBusy}
            disabled={authBusy || !googleConfig.isConfigured || (Platform.OS !== 'web' && !request)}
          />
          {!googleConfig.isConfigured ? (
            <Text style={styles.muted}>{copy.onboarding.googleNotConfigured}</Text>
          ) : (
            <Text style={styles.muted}>{copy.onboarding.progressSaved}</Text>
          )}
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
        </View>

        <View style={styles.footerSpacer} />
      </SafeAreaView>
    </GradientBackground>
  );
}
