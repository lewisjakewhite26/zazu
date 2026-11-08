import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useWordLibrary } from '@/hooks/useWordLibrary';

/**
 * First screen a new user sees. It shows the product rather than describing
 * it: the real word of the day, set the way the alarm will show it.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { goToSignIn } = useAuth();
  const { alarmWordOfDay, loading } = useWordLibrary();

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
        mark: { width: 34, height: 44, alignSelf: 'center', marginBottom: spacing.lg },
        tagline: {
          fontFamily: fonts.serif,
          fontSize: 34,
          lineHeight: 40,
          letterSpacing: -0.6,
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing.xl,
        },
        taglineItalic: { fontFamily: fonts.serifItalic },
        cardInner: { paddingVertical: 26, paddingHorizontal: 24 },
        word: {
          fontFamily: fonts.serif,
          fontSize: 44,
          lineHeight: 50,
          letterSpacing: -0.8,
          color: colors.text,
        },
        meta: {
          fontFamily: fonts.serifItalic,
          fontSize: 16,
          color: colors.subtext,
          marginTop: 2,
          marginBottom: spacing.md,
        },
        definition: {
          fontFamily: fonts.sans,
          fontSize: 17,
          lineHeight: 25,
          color: colors.text,
        },
        how: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 23,
          color: colors.subtext,
          textAlign: 'center',
          marginTop: spacing.lg,
          paddingHorizontal: spacing.sm,
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

  const showPreview = !loading && alarmWordOfDay;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <Image
            source={require('@/assets/images/zazu-mark.png')}
            style={styles.mark}
            resizeMode="contain"
            accessibilityLabel="Zazu"
          />
          {/* One sentence, set on two lines so it never breaks mid-phrase. */}
          <Text style={styles.tagline} accessibilityRole="header" accessibilityLabel={copy.brand.tagline}>
            A new word{'\n'}
            <Text style={styles.taglineItalic}>every morning.</Text>
          </Text>

          {showPreview ? (
            <View
              accessible
              accessibilityLabel={`${copy.onboarding.previewLabel}: ${alarmWordOfDay.word}. ${alarmWordOfDay.definition}`}
            >
              <GlassCard borderRadius={radii.cardMd} contentStyle={styles.cardInner}>
                <Text style={styles.word}>{alarmWordOfDay.word}</Text>
                <Text style={styles.meta}>
                  {alarmWordOfDay.pronunciation} · {alarmWordOfDay.pos}
                </Text>
                <Text style={styles.definition}>{alarmWordOfDay.definition}</Text>
              </GlassCard>
            </View>
          ) : null}

          <Text style={styles.how}>{copy.onboarding.welcomeHow}</Text>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <PrimaryButton label={copy.onboarding.getStarted} onPress={() => router.push('/(onboarding)/wake')} />
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
