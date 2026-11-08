import type { AlarmSoundId } from './alarm-sound';
import { DEFAULT_ALARM_SOUND_ID } from './alarm-sound';

export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  soundId: AlarmSoundId;
};

/** Default alarms shown on first launch before AsyncStorage is populated. */
export const DEFAULT_ALARMS: Alarm[] = [
  // Off until the user turns it on: nothing should ring that they didn't set.
  // Alarms repeat daily (RepeatFrequency.DAILY), so the label says so.
  { id: '1', time: '07:30', label: 'Every day', enabled: false, soundId: DEFAULT_ALARM_SOUND_ID },
];
