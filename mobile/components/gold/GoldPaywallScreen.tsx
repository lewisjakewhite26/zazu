import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { CheckIcon } from 'phosphor-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ShimmerText } from '@/components/ui/ShimmerText';
import { copy } from '@/constants/copy';
import { fonts, radii } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';
import { getRevenueCatOfferings } from '@/services/revenuecat';

const GLOW_SIZE = 340;
const LOGO_WIDTH = 42;
const LOGO_HEIGHT = 55;

export function GoldPaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;
  const { session, isAnonymous, goToSignIn } = useAuth();
  const { isGold, purchaseGold, restorePurchases, revenueCatReady, loading, entitlementError, refreshEntitlement } =
    useSubscription();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePricing, setLivePricing] = useState<{ monthly: string; yearly: string } | null>(null);

  const goldCardFill = isNight ? colors.goldCardFillDark : colors.goldCardFill;
  const goldCardBorder = isNight ? colors.goldCardBorderDark : colors.goldCardBorder;
  const goldGlow = isNight ? colors.goldGlowDark : colors.goldGlow;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        header: {
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
        },
        scroll: {
          flex: 1,
        },
        content: {
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        },
        glow: {
          position: 'absolute',
          top: -140,
          left: '50%',
          marginLeft: -GLOW_SIZE / 2,
          pointerEvents: 'none',
        },
        logo: {
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
          marginTop: spacing.md,
          tintColor: colors.gold,
        },
        eyebrow: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.gold,
          marginTop: spacing.sm,
        },
        title: {
          fontFamily: fonts.serif,
          fontSize: 32,
          color: colors.text,
          letterSpacing: -0.8,
          marginTop: 4,
        },
        sub: {
          fontFamily: fonts.sans,
          fontSize: 16,
          lineHeight: 23,
          color: colors.subtext,
        },
        card: {
          marginTop: spacing.xs,
          marginBottom: spacing.xs,
          borderColor: goldCardBorder,
        },
        cardInner: {
          padding: spacing.lg,
        },
        cardWash: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        featureRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 7,
        },
        featureCheck: {
          width: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        featureText: {
          fontFamily: fonts.sans,
          fontSize: 16,
          color: colors.text,
          flexShrink: 1,
        },
        divider: {
          height: 1,
          backgroundColor: goldCardBorder,
          opacity: 0.5,
          marginTop: 6,
          marginBottom: 10,
        },
        priceRow: {
          gap: 8,
        },
        priceMain: {
          fontFamily: fonts.serif,
          fontSize: 17,
          color: colors.text,
          lineHeight: 22,
        },
        trialBadge: {
          alignSelf: 'flex-start',
          fontFamily: fonts.sansSemiBold,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: colors.gold,
          backgroundColor: goldCardFill,
          borderWidth: 1,
          borderColor: goldCardBorder,
          paddingVertical: 4,
          paddingHorizontal: 9,
          borderRadius: 999,
          overflow: 'hidden',
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
        goldButton: {
          width: '100%',
          minHeight: MIN_TOUCH_TARGET,
          borderRadius: 999,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          shadowColor: colors.gold,
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        },
        goldButtonPressed: {
          opacity: 0.85,
        },
        goldButtonLabel: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 16,
          color: colors.ink,
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
    [colors, goldCardBorder, goldCardFill],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const offering = await getRevenueCatOfferings();
        const monthly = offering?.monthly?.product.priceString;
        const yearly = offering?.annual?.product.priceString;
        if (!cancelled && monthly && yearly) {
          setLivePricing({ monthly, yearly });
        }
      } catch {
        // Ignore offering lookup failures and keep the static fallback pricing text.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceText = livePricing
    ? `${livePricing.monthly}/month or ${livePricing.yearly}/year`
    : copy.calendar.goldPricing;

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
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      const restored = await restorePurchases();
      if (restored) {
        router.back();
      } else {
        setError(copy.gold.restoreNone);
        AccessibilityInfo.announceForAccessibility(copy.gold.restoreNone);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Restore failed';
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
    } finally {
      setBusy(false);
    }
  };

  if (isGold) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ScreenHeader onBack={() => router.back()} />
          </View>
          <View style={styles.content}>
            <ShimmerText style={styles.title}>{copy.gold.alreadyGold}</ShimmerText>
            <Text style={styles.sub}>{copy.gold.alreadyGoldSub}</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const ctaLabel = !session || isAnonymous ? copy.settings.signIn : copy.gold.subscribe;

  return (
    <GradientBackground>
      <Svg width={GLOW_SIZE} height={GLOW_SIZE} style={styles.glow}>
        <Defs>
          <RadialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.gold} stopOpacity={isNight ? 0.4 : 0.55} />
            <Stop offset="100%" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill="url(#goldGlow)" />
      </Svg>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ScreenHeader onBack={() => router.back()} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Image
            source={require('@/assets/images/zazu-mark.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />

          <ShimmerText style={styles.eyebrow} sweepColor={colors.goldLight}>
            {copy.gold.eyebrow}
          </ShimmerText>
          <Text style={styles.title}>{copy.gold.title}</Text>
          <Text style={styles.sub}>{copy.gold.subtitle}</Text>

          <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
            <LinearGradient
              colors={[goldCardFill, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardWash}
            />
            {copy.gold.features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <LinearGradient
                    colors={[colors.goldLight, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <CheckIcon size={11} color={colors.white} weight="bold" />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>{priceText}</Text>
              <Text style={styles.trialBadge}>{copy.gold.trialBadge}</Text>
            </View>
          </GlassCard>

          {!session || isAnonymous ? (
            <Text style={styles.sub}>{copy.gold.signInRequired}</Text>
          ) : null}

          {!revenueCatReady ? (
            <Text style={styles.sub}>{copy.gold.setupRequired}</Text>
          ) : null}

          {entitlementError ? (
            <>
              <Text style={styles.error} accessibilityRole="alert">
                {copy.gold.entitlementCheckFailed}
              </Text>
              <Pressable
                style={styles.link}
                onPress={() => void refreshEntitlement()}
                accessibilityRole="button"
                accessibilityLabel={copy.gold.retry}
              >
                <Text style={styles.linkText}>{copy.gold.retry}</Text>
              </Pressable>
            </>
          ) : null}

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.lg }]}>
          <Pressable
            onPress={() => void handlePurchase()}
            disabled={busy || loading}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            accessibilityState={{ disabled: busy || loading, busy: busy || loading }}
            style={({ pressed }) => [styles.goldButton, pressed && styles.goldButtonPressed]}
          >
            <LinearGradient
              colors={[colors.goldLight, colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {busy || loading ? (
              <ActivityIndicator color={colors.ink} />
            ) : (
              <Text style={styles.goldButtonLabel}>{ctaLabel}</Text>
            )}
          </Pressable>
          {revenueCatReady ? (
            <Pressable
              style={styles.link}
              onPress={() => void handleRestore()}
              accessibilityRole="button"
              accessibilityLabel={copy.gold.restore}
            >
              <Text style={styles.linkText}>{copy.gold.restore}</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
