import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretDownIcon, CaretRightIcon, CaretUpIcon, CheckIcon } from 'phosphor-react-native';

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
import { useTheme, type AppThemeColors, type ThemeOverride } from '@/context/ThemeContext';
import { useSnooze, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES } from '@/hooks/useSnooze';
import { SnoozeDurationSlider } from '@/components/settings/SnoozeDurationSlider';

const THEME_OPTIONS: { value: ThemeOverride; label: string }[] = [
  { value: 'auto', label: 'Auto (Dawn/Dusk)' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LEGAL_URLS = {
  privacy: 'https://zazu.org.uk/privacy',
  terms: 'https://zazu.org.uk/terms',
  accessibility: 'https://zazu.org.uk/accessibility',
};

type SettingsRowProps = {
  label: string;
  hint?: string;
  value?: string;
  valueTone?: 'neutral' | 'gold';
  onPress?: () => void;
  showChevron?: boolean;
  colors: AppThemeColors;
};

/** A single tappable, opaque-backed settings row — never a floating label on the gradient. Values render as plain text, not a filled pill, so a row never reads as a card nested inside a card. */
function SettingsRow({ label, hint, value, valueTone = 'neutral', onPress, showChevron, colors }: SettingsRowProps) {
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
        left: {
          flexShrink: 1,
          gap: 2,
        },
        label: {
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          color: colors.text,
        },
        hint: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
        },
        right: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        valueText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 14,
          color: valueTone === 'gold' ? colors.gold : colors.subtext,
        },
      }),
    [colors, valueTone],
  );

  const content = (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={styles.right}>
        {value ? <Text style={styles.valueText}>{value}</Text> : null}
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
  const { colors, override, setOverride } = useTheme();
  const { session, displayName, isAnonymous, signOut, goToSignIn, authBusy, authError, deleteAccount } =
    useAuth();
  const { isGold, grantDevGold } = useSubscription();
  const { snoozeMinutes, setSnoozeMinutes } = useSnooze();
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const themeValueLabel = THEME_OPTIONS.find((option) => option.value === override)?.label ?? '';

  const confirmDeleteAccount = () => {
    Alert.alert(
      copy.settings.deleteAccountConfirmTitle,
      copy.settings.deleteAccountConfirmBody,
      [
        { text: copy.settings.deleteAccountCancel, style: 'cancel' },
        { text: copy.settings.deleteAccountConfirm, style: 'destructive', onPress: () => void deleteAccount() },
      ],
    );
  };

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
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing.xl,
        },
        sections: {
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
          fontSize: 15,
          lineHeight: 21,
          color: colors.subtext,
        },
        divider: {
          marginHorizontal: spacing.lg,
        },
        errorText: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.wrong,
          marginTop: spacing.sm,
          marginLeft: 4,
        },
        footer: {
          gap: spacing.sm,
        },
        themeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: MIN_TOUCH_TARGET,
          paddingHorizontal: spacing.lg,
          paddingVertical: 12,
          gap: spacing.sm,
        },
        themeRowLeft: {
          flexShrink: 1,
          gap: 2,
        },
        themeRowRight: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        label: {
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          color: colors.text,
        },
        hint: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.subtext,
        },
        valueText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 14,
          color: colors.subtext,
        },
        pressed: {
          opacity: 0.6,
        },
        optionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: MIN_TOUCH_TARGET,
          paddingHorizontal: spacing.lg,
          paddingVertical: 12,
        },
        optionLabel: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.text,
        },
        optionLabelActive: {
          fontFamily: fonts.sansSemiBold,
          color: colors.gold,
        },
        snoozeLabelRow: {
          paddingHorizontal: spacing.lg,
          paddingTop: 12,
          gap: 2,
        },
        snoozeSliderRow: {
          paddingHorizontal: spacing.lg,
          paddingTop: 6,
          paddingBottom: 12,
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
          <View style={styles.sections}>
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
                {session ? (
                  <>
                    <Divider style={styles.divider} />
                    <SettingsRow
                      label={copy.settings.deleteAccount}
                      onPress={confirmDeleteAccount}
                      showChevron
                      colors={colors}
                    />
                  </>
                ) : null}
              </GlassCard>
              {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Preferences</Text>
              <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
                <Pressable
                  onPress={() => setThemePickerOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityLabel={`Theme: ${themeValueLabel}`}
                  accessibilityState={{ expanded: themePickerOpen }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <View style={styles.themeRow}>
                    <View style={styles.themeRowLeft}>
                      <Text style={styles.label}>Theme</Text>
                      <Text style={styles.hint}>{copy.settings.themeToggleHint}</Text>
                    </View>
                    <View style={styles.themeRowRight}>
                      <Text style={styles.valueText}>{themeValueLabel}</Text>
                      {themePickerOpen ? (
                        <CaretUpIcon size={16} color={colors.subtext} />
                      ) : (
                        <CaretDownIcon size={16} color={colors.subtext} />
                      )}
                    </View>
                  </View>
                </Pressable>

                {themePickerOpen
                  ? THEME_OPTIONS.map((option) => {
                      const active = option.value === override;
                      return (
                        <View key={option.value}>
                          <Divider style={styles.divider} />
                          <Pressable
                            onPress={() => {
                              setOverride(option.value);
                              setThemePickerOpen(false);
                            }}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            style={({ pressed }) => pressed && styles.pressed}
                          >
                            <View style={styles.optionRow}>
                              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                                {option.label}
                              </Text>
                              {active ? <CheckIcon size={16} color={colors.gold} /> : null}
                            </View>
                          </Pressable>
                        </View>
                      );
                    })
                  : null}

                <Divider style={styles.divider} />

                <View style={styles.snoozeLabelRow}>
                  <Text style={styles.label}>Snooze duration</Text>
                  <Text style={styles.hint}>How long "Hold to snooze" defers the alarm by.</Text>
                </View>
                <View style={styles.snoozeSliderRow}>
                  <SnoozeDurationSlider
                    value={snoozeMinutes}
                    min={SNOOZE_MIN_MINUTES}
                    max={SNOOZE_MAX_MINUTES}
                    onChange={(next) => void setSnoozeMinutes(next)}
                  />
                </View>
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

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Legal</Text>
              <GlassCard borderRadius={radii.cardMd} style={styles.card} contentStyle={styles.cardInner}>
                <SettingsRow
                  label={copy.settings.privacyPolicy}
                  onPress={() => void Linking.openURL(LEGAL_URLS.privacy)}
                  showChevron
                  colors={colors}
                />
                <Divider style={styles.divider} />
                <SettingsRow
                  label={copy.settings.termsOfService}
                  onPress={() => void Linking.openURL(LEGAL_URLS.terms)}
                  showChevron
                  colors={colors}
                />
                <Divider style={styles.divider} />
                <SettingsRow
                  label={copy.settings.accessibilityStatement}
                  onPress={() => void Linking.openURL(LEGAL_URLS.accessibility)}
                  showChevron
                  colors={colors}
                />
              </GlassCard>
            </View>
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
