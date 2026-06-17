import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';

export function GoldPaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { session, isAnonymous, goToSignIn } = useAuth();
  const { isGold, purchaseGold, restorePurchases, revenueCatReady, loading } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        header: {
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
        },
        backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        scroll: {
          flex: 1,
        },
        content: {
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        },
        title: {
          fontFamily: fonts.serif,
          fontSize: 34,
          color: colors.text,
          letterSpacing: -1,
          marginTop: spacing.md,
        },
        sub: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 22,
          color: colors.subtext,
        },
        card: {
          marginBottom: spacing.xs,
        },
        cardInner: {
          padding: spacing.lg,
          gap: spacing.sm,
        },
        feature: {
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 21,
          color: colors.text,
        },
        price: {
          fontFamily: fonts.sansMedium,
          fontSize: 13,
          color: colors.subtext,
          marginTop: spacing.sm,
        },
        error: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.wrong,
          textAlign: 'center',
        },
        footer: {
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
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

  const handlePurchase = async () => {
    if (!session || isAnonymous) {
      goToSignIn();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await purchaseGold();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      const restored = await restorePurchases();
      if (restored) router.back();
      else setError(copy.gold.restoreNone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setBusy(false);
    }
  };

  if (isGold) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{copy.gold.alreadyGold}</Text>
            <Text style={styles.sub}>{copy.gold.alreadyGoldSub}</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{copy.gold.title}</Text>
          <Text style={styles.sub}>{copy.gold.subtitle}</Text>

          <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
            {copy.gold.features.map((feature) => (
              <Text key={feature} style={styles.feature}>
                · {feature}
              </Text>
            ))}
            <Text style={styles.price}>{copy.calendar.goldPricing}</Text>
          </GlassCard>

          {!session || isAnonymous ? (
            <Text style={styles.sub}>{copy.gold.signInRequired}</Text>
          ) : null}

          {!revenueCatReady ? (
            <Text style={styles.sub}>{copy.gold.setupRequired}</Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.lg }]}>
          <PrimaryButton
            label={!session || isAnonymous ? copy.settings.signIn : copy.gold.subscribe}
            onPress={() => void handlePurchase()}
            loading={busy || loading}
            disabled={loading}
          />
          {revenueCatReady ? (
            <Pressable style={styles.link} onPress={() => void handleRestore()}>
              <Text style={styles.linkText}>{copy.gold.restore}</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
