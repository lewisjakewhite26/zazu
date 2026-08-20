import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretRightIcon } from 'phosphor-react-native';

import { Divider } from '@/components/ui/Divider';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';

const GOLD_BADGE_BG = 'rgba(201,150,58,0.16)';

type SettingsRowProps = {
  label: string;
  value?: string;
  valueTone?: 'neutral' | 'gold';
  onPress?: () => void;
  showChevron?: boolean;
  colors: AppThemeColors;
};

/** A single tappable, opaque-backed settings row — never a floating label on the gradient. */
function SettingsRow({ label, value, valueTone = 'neutral', onPress, showChevron, colors }: SettingsRowProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: MIN_TOUCH_TARGET,
          paddingHorizontal: spacing.lg,
          paddingVertical: 12,
          gap: spacing.sm,
        },
        pressed: {
          opacity: 0.6,
        },
        label: {
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          color: colors.text,
        },
        right: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        badge: {
          borderRadius: radii.pill,
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: valueTone === 'gold' ? GOLD_BADGE_BG : colors.border,
        },
        badgeText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          color: valueTone === 'gold' ? colors.gold : colors.text,
        },
      }),
    [colors, valueTone],
  );

  const content = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{value}</Text>
          </View>
        ) : null}
        {showChevron ? <CaretRightIcon size={16} color={colors.subtext} /> : null}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const { colors, override, toggleOverride } = useTheme();
  const { session, displayName, isAnonymous, signOut, goToSignIn, authBusy } = useAuth();
  const { isGold, grantDevGold } = useSubscription();

  const themeValueLabel =
    override === 'auto' ? 'Auto (Dawn/Dusk)' : override === 'light' ? 'Light' : 'Dark';

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
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.xl,
        },
        section: {
          gap: spacing.sm,
        },
        sectionLabel: {
          ...typography.sectionLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginLeft: 4,
        },
        card: {
          width: '100%',
        },
        cardInner: {
          paddingVertical: 4,
        },
        infoRow: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: 6,
        },
        cardTitle: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 15,
          color: colors.text,
        },
        cardSub: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 19,
          color: colors.subtext,
        },
        divider: {
          marginHorizontal: spacing.lg,
        },
        footer: {
          gap: spacing.sm,
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account</Text>
            <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
              <View style={styles.infoRow}>
                {session && displayName ? (
                  <Text style={styles.cardTitle}>{copy.settings.signedInAs(displayName)}</Text>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>{copy.settings.guestMode}</Text>
                    <Text style={styles.cardSub}>{copy.settings.guestHint}</Text>
                  </>
                )}
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferences</Text>
            <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
              <SettingsRow
                label="Theme"
                value={themeValueLabel}
                onPress={toggleOverride}
                colors={colors}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Subscription</Text>
            <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
              <SettingsRow
                label="Plan"
                value={isGold ? copy.settings.goldMember : copy.settings.freePlan}
                valueTone={isGold ? 'gold' : 'neutral'}
                colors={colors}
              />
              <Divider style={styles.divider} />
              <SettingsRow
                label={isGold ? copy.settings.manageGold : copy.settings.upgradeGold}
                onPress={() => router.push('/gold')}
                showChevron
                colors={colors}
              />
              {__DEV__ && session ? (
                <>
                  <Divider style={styles.divider} />
                  <SettingsRow
                    label="Grant Gold (dev)"
                    onPress={() => void grantDevGold()}
                    colors={colors}
                  />
                </>
              ) : null}
            </GlassCard>
          </View>

          <View style={styles.footer}>
            {session ? (
              <PrimaryButton
                label={copy.settings.signOut}
                variant="outline"
                labelColor={colors.text}
                onPress={() => void signOut()}
                loading={authBusy}
              />
            ) : isAnonymous ? (
              <PrimaryButton label={copy.settings.signIn} onPress={goToSignIn} />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
