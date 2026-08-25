import { renderHook, act } from '@testing-library/react-native';

import { AlarmFlowProvider, useAlarmFlow } from '../context/AlarmFlowContext';
import type { ZazuAlarmWord, ZazuGymWord } from '../../lib/supabase';

// AlarmFlowContext imports AlarmSoundId's default from alarm-sound.ts, which
// pulls in expo-audio -- not needed for this file's pure state-transition
// logic, and expo-audio throws when evaluated outside a real device.
jest.mock('../../lib/alarm-sound', () => ({
  DEFAULT_ALARM_SOUND_ID: 'susurrus',
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AlarmFlowProvider>{children}</AlarmFlowProvider>
);

const alarmWord = { id: 'w1', word: 'Mellifluous' } as ZazuAlarmWord;
const gymWord = { id: 'w2', word: 'Ephemeral' } as ZazuGymWord;

describe('AlarmFlowContext', () => {
  it('starts empty with no active session', async () => {
    const { result } = await renderHook(() => useAlarmFlow(), { wrapper });

    expect(result.current.sessionWord).toBeNull();
    expect(result.current.gymSessionWord).toBeNull();
    expect(result.current.gymSession).toBeNull();
    expect(result.current.isDemo).toBe(false);
    expect(result.current.alarmId).toBeNull();
    expect(result.current.soundId).toBe('susurrus');
  });

  it('startFlow sets the alarm session and clears any gym session', async () => {
    const { result } = await renderHook(() => useAlarmFlow(), { wrapper });

    await act(async () => {
      result.current.startGymFlow(gymWord);
    });
    expect(result.current.gymSessionWord).toEqual(gymWord);

    await act(async () => {
      result.current.startFlow(alarmWord, { isDemo: true, alarmId: 'alarm-1' });
    });

    expect(result.current.sessionWord).toEqual(alarmWord);
    expect(result.current.isDemo).toBe(true);
    expect(result.current.alarmId).toBe('alarm-1');
    // Starting an alarm flow must clear any leftover gym session -- these
    // are mutually exclusive flows sharing one context.
    expect(result.current.gymSessionWord).toBeNull();
  });

  it('a real (non-demo) alarm defaults isDemo to false and has no alarmId unless passed', async () => {
    const { result } = await renderHook(() => useAlarmFlow(), { wrapper });

    await act(async () => {
      result.current.startFlow(alarmWord);
    });

    expect(result.current.isDemo).toBe(false);
    expect(result.current.alarmId).toBeNull();
  });

  it('startGymFlow clears any alarm session and never sets an alarmId', async () => {
    const { result } = await renderHook(() => useAlarmFlow(), { wrapper });

    await act(async () => {
      result.current.startFlow(alarmWord, { alarmId: 'alarm-1' });
    });
    expect(result.current.alarmId).toBe('alarm-1');

    await act(async () => {
      result.current.startGymFlow(gymWord);
    });

    expect(result.current.gymSessionWord).toEqual(gymWord);
    expect(result.current.sessionWord).toBeNull();
    // Word Gym is reached voluntarily, never through a real alarm trigger --
    // an alarmId here would be meaningless and the snooze button relies on
    // this being null to know not to render itself.
    expect(result.current.alarmId).toBeNull();
  });

  it('clearFlow resets every field back to its default', async () => {
    const { result } = await renderHook(() => useAlarmFlow(), { wrapper });

    await act(async () => {
      result.current.startFlow(alarmWord, { isDemo: true, alarmId: 'alarm-1', soundId: 'penumbra' });
    });
    expect(result.current.sessionWord).not.toBeNull();

    await act(async () => {
      result.current.clearFlow();
    });

    expect(result.current.sessionWord).toBeNull();
    expect(result.current.gymSessionWord).toBeNull();
    expect(result.current.gymSession).toBeNull();
    expect(result.current.dailyRitualSession).toBeNull();
    expect(result.current.completionResult).toBeNull();
    expect(result.current.gymCompletionResult).toBeNull();
    expect(result.current.isDemo).toBe(false);
    expect(result.current.alarmId).toBeNull();
    expect(result.current.soundId).toBe('susurrus');
  });
});
