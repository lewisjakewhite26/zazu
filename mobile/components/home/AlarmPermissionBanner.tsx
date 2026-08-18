import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  openBatteryOptimizationSettings,
  openExactAlarmSettings,
  openNotificationSettings,
  type AlarmPermissionStatus,
} from '../../../lib/alarm-notifications';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type AlarmPermissionBannerProps = {
  status: AlarmPermissionStatus;
};

/** Shown on Home whenever a permission the alarm needs to fire on a locked phone is missing. */
export function AlarmPermissionBanner({ status }: AlarmPermissionBannerProps) {
  const { colors } = useTheme();

  const rows = useMemo(() => {
    const items: { key: string; label: string; onPress: () => void }[] = [];
    if (!status.notificationsGranted) {
      items.push({
        key: 'notifications',
        label: copy.alarmPermissions.notifications,
        onPress: () => void openNotificationSettings(),
      });
    }
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
        banner: {
          width: '100%',
          marginBottom: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: 'rgba(232,97,122,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(232,97,122,0.35)',
          gap: 10,
        },
        title: {
          ...typography.wotdDef,
          fontFamily: fonts.sansSemiBold,
          color: colors.text,
        },
        body: {
          ...typography.wotdDef,
          color: colors.subtext,
          lineHeight: 20,
        },
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
        },
        rowLabel: {
          ...typography.wotdDef,
          flex: 1,
          minWidth: 160,
          color: colors.text,
        },
        btn: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 6,
          paddingHorizontal: 14,
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

  if (rows.length === 0) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.title}>{copy.alarmPermissions.bannerTitle}</Text>
      <Text style={styles.body}>{copy.alarmPermissions.bannerBody}</Text>
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
  );
}
