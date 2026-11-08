import { useEffect, useMemo, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon } from 'phosphor-react-native';

import { Divider } from '@/components/ui/Divider';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAlarms } from '@/hooks/useAlarms';
import {
  openBatteryOptimizationSettings,
  requestNotificationPermissions,
} from '../../../lib/alarm-notifications';

/**
 * Onboarding step 3. Permissions are asked for here, with the reason next to
 * each one, instead of as a cold system prompt on first launch.
 */
export function ReadyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { continueAsGuest } = useAuth();
  const { permissionStatus, refreshPermissionStatus } = useAlarms();
  const [finishing, setFinishing] = useState(false);

  // Battery access is granted in system Settings; re-read when the user comes back.
  useEffect(() => {
    void refreshPermissionStatus();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPermissionStatus();
    });
    return () => sub.remove();
  }, [refreshPermissionStatus]);

  const rows = [
    {
      key: 'notifications',
      title: copy.onboarding.ringNotifications,
      why: copy.onboarding.ringNotificationsWhy,
      granted: permissionStatus.notificationsGranted,
      onAllow: async () => {
        await requestNotificationPermissions();
        await refreshPermissionStatus();
      },
    },
    ...(Platform.OS === 'android'
      ? [
          {
            key: 'battery',
            title: copy.onboarding.ringBattery,
            why: copy.onboarding.ringBatteryWhy,
            granted: permissionStatus.batteryUnrestricted,
            onAllow: async () => {
              await openBatteryOptimizationSettings();
            },
          },
        ]
      : []),
  ];
  const allGranted = rows.every((row) => row.granted);

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
        heading: {
          fontFamily: fonts.serif,
          fontSize: 34,
          lineHeight: 40,
          letterSpacing: -0.6,
          color: colors.text,
        },
        intro: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 23,
          color: colors.subtext,
          marginTop: spacing.sm,
          marginBottom: spacing.xl,
        },
        row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
        rowText: { flex: 1 },
        rowTitle: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, color: colors.text },
        rowWhy: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.subtext, marginTop: 2 },
        allow: {
          minHeight: MIN_TOUCH_TARGET,
          minWidth: 88,
          paddingHorizontal: 18,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.text,
          alignItems: 'center',
          justifyContent: 'center',
        },
        allowText: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.text },
        allowed: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 88, justifyContent: 'center' },
        allowedText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.subtext },
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

  const finish = async () => {
    setFinishing(true);
    await continueAsGuest();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <Text style={styles.heading} accessibilityRole="header">
            {copy.onboarding.ringHeading}
          </Text>
          <Text style={styles.intro}>{copy.onboarding.ringBody}</Text>

          {rows.map((row, index) => (
            <View key={row.key}>
              {index > 0 ? <Divider /> : null}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowWhy}>{row.why}</Text>
                </View>
                {row.granted ? (
                  <View style={styles.allowed} accessibilityLabel={`${row.title}: ${copy.onboarding.ringAllowed}`}>
                    <CheckIcon size={16} color={colors.subtext} weight="bold" />
                    <Text style={styles.allowedText}>{copy.onboarding.ringAllowed}</Text>
                  </View>
                ) : (
                  <Pressable
                    style={styles.allow}
                    onPress={() => void row.onAllow()}
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.onboarding.ringAllow} ${row.title}`}
                  >
                    <Text style={styles.allowText}>{copy.onboarding.ringAllow}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <PrimaryButton label={copy.onboarding.ringDone} onPress={() => void finish()} loading={finishing} />
          {!allGranted ? (
            <Pressable
              style={styles.link}
              onPress={() => void finish()}
              accessibilityRole="button"
              accessibilityLabel={copy.onboarding.ringLater}
            >
              <Text style={styles.linkText}>{copy.onboarding.ringLater}</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
