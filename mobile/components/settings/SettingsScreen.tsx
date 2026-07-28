import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';

export function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { session, displayName, isAnonymous, signOut, goToSignIn, authBusy } = useAuth();
  const { isGold, grantDevGold } = useSubscription();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        },
        backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        title: {
          fontFamily: fonts.sansMedium,
          fontSize: 17,
          color: colors.text,
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
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={copy.settings.back}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{copy.settings.title}</Text>
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
