import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAlarms } from '../../lib/useAlarms';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// alarm.ts (imported by useAlarms.ts) pulls in alarm-sound.ts for its
// DEFAULT_ALARM_SOUND_ID constant, which in turn imports expo-audio --
// that native module throws when evaluated outside a real device/simulator,
// so it's mocked out here rather than pulled in for tests that don't touch
// sound playback at all.
jest.mock('../../lib/alarm-sound', () => ({
  DEFAULT_ALARM_SOUND_ID: 'susurrus',
  isAlarmSoundId: (value: unknown) => value === 'susurrus',
}));

jest.mock('../../lib/alarm-notifications', () => ({
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
  getAlarmPermissionStatus: jest.fn().mockResolvedValue({
    notificationsGranted: true,
    exactAlarmGranted: true,
    batteryUnrestricted: true,
  }),
  // Real syncAlarmNotifications is a passthrough that also schedules native
  // triggers as a side effect -- the native scheduling isn't what these
  // tests are checking, so this mock keeps only the passthrough behavior.
  syncAlarmNotifications: jest.fn().mockImplementation((alarms) => Promise.resolve(alarms)),
  cancelAlarmNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('useAlarms', () => {
  beforeEach(async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('loads the default alarms when nothing is persisted yet', async () => {
    const { result } = await renderHook(() => useAlarms());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.alarms).toHaveLength(2);
    expect(result.current.alarms[0].label).toBe('Weekdays · Words pack');
  });

  it('adding an alarm persists it and appears in state without a remount', async () => {
    const { result } = await renderHook(() => useAlarms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addAlarm('06:45', 'Test alarm');
    });

    expect(result.current.alarms).toHaveLength(3);
    const added = result.current.alarms.find((a) => a.label === 'Test alarm');
    expect(added).toBeDefined();
    expect(added?.time).toBe('06:45');
    expect(added?.enabled).toBe(true);

    // Confirms the write actually reached storage, not just in-memory state --
    // this is the exact class of bug AlarmsContext was introduced to fix
    // (a screen's own isolated hook instance holding a stale snapshot).
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const stored = JSON.parse(await AsyncStorage.getItem('zazu:alarms'));
    expect(stored).toHaveLength(3);
  });

  it('toggling an alarm flips only that alarm', async () => {
    const { result } = await renderHook(() => useAlarms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const target = result.current.alarms[0];
    await act(async () => {
      await result.current.toggleAlarm(target.id, false);
    });

    expect(result.current.alarms.find((a) => a.id === target.id)?.enabled).toBe(false);
    expect(result.current.alarms.find((a) => a.id !== target.id)?.enabled).toBe(
      result.current.alarms.find((a) => a.id !== target.id)!.enabled,
    );
  });

  it('deleting an alarm removes it and cancels its notification and snooze trigger', async () => {
    const { requestNotificationPermissions, ...mocked } = jest.requireMock(
      '../../lib/alarm-notifications',
    ) as { cancelAlarmNotification: jest.Mock; requestNotificationPermissions: jest.Mock };

    const { result } = await renderHook(() => useAlarms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const target = result.current.alarms[0];
    await act(async () => {
      await result.current.deleteAlarm(target.id);
    });

    expect(result.current.alarms.find((a) => a.id === target.id)).toBeUndefined();
    expect(result.current.alarms).toHaveLength(1);

    // Regression coverage for the notification-leak bug fixed 2026-08-22:
    // deleting an alarm must cancel both its own trigger and its snooze
    // trigger, or it keeps firing on the device after the app forgets it.
    expect(mocked.cancelAlarmNotification).toHaveBeenCalledWith(target.id);
    expect(mocked.cancelAlarmNotification).toHaveBeenCalledWith(`${target.id}-snooze`);
  });
});
