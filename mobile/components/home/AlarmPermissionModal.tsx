import { useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  openBatteryOptimizationSettings,
  openExactAlarmSettings,
  type AlarmPermissionStatus,
} from '../../../lib/alarm-notifications';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

type AlarmPermissionModalProps = {
  visible: boolean;
  status: AlarmPermissionStatus;
  onDismiss: () => void;
};

/**
 * Popup nudging the user toward the Settings screens for permissions that have
 * no stock Android request dialog (exact alarm, battery optimization). The
 * notification permission is deliberately excluded here -- the OS's own
 * "Allow notifications?" dialog is more trustworthy than a custom popup, so
 * that one is re-triggered natively instead (see useAlarms' foreground effect).
 */
export function AlarmPermissionModal({ visible, status, onDismiss }: AlarmPermissionModalProps) {
  const { colors, blend } = useTheme();

  const rows = useMemo(() => {
    const items: { key: string; label: string; onPress: () => void }[] = [];
    if (Platform.OS === 'android' && !status.exactAlarmGranted) {
      items.push({
        key: 'exactAlarm',
        label: copy.alarmPermissions.exactAlarm,
        onPress: () => void openExactAlarmSettings(),
      });
    }
    if (Platform.OS === 'android' && !status.batteryUnrestricted) {
      items.push({
        key: 'battery',
        label: copy.alarmPermissions.battery,
        onPress: () => void openBatteryOptimizationSettings(),
      });
    }
    return items;
  }, [status]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
          ...(Platform.OS === 'web'
            ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as object)
            : null),
        },
        card: {
          width: '100%',
          maxWidth: 360,
          backgroundColor: colors.sheetBg,
        },
        content: {
          padding: spacing.lg,
        },
        title: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 17,
          color: colors.text,
          textAlign: 'center',
          marginBottom: 6,
        },
        body: {
          ...typography.wotdDef,
          color: colors.subtext,
          textAlign: 'center',
          lineHeight: 20,
          marginBottom: spacing.md,
        },
        rows: {
          gap: 10,
          marginBottom: spacing.lg,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        },
        rowLabel: {
          ...typography.wotdDef,
          flex: 1,
          color: colors.text,
        },
        btn: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 999,
        },
        btnText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          color: colors.text,
        },
      }),
    [colors],
  );

  if (!visible || rows.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss} accessible={false}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={30} tint={blend >= 0.5 ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : null}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 360 }}
          accessible={false}
          accessibilityViewIsModal
        >
          <GlassCard borderRadius={24} style={styles.card} contentStyle={styles.content}>
            <Text style={styles.title} accessibilityRole="header">
              {copy.alarmPermissions.bannerTitle}
            </Text>
            <Text style={styles.body}>{copy.alarmPermissions.bannerBody}</Text>
            <View style={styles.rows}>
              {rows.map((row) => (
                <View key={row.key} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Pressable
                    style={styles.btn}
                    onPress={row.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.alarmPermissions.fix}: ${row.label}`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.btnText}>{copy.alarmPermissions.fix}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <PrimaryButton label="Not now" variant="outline" onPress={onDismiss} />
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
