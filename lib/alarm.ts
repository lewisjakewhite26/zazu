import type { AlarmSoundId } from './alarm-sound';
import { DEFAULT_ALARM_SOUND_ID } from './alarm-sound';

export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  notificationId?: string;
  soundId: AlarmSoundId;
};

/** Default alarms shown on first launch before AsyncStorage is populated. */
export const DEFAULT_ALARMS: Alarm[] = [
  { id: '1', time: '07:30', label: 'Weekdays · Words pack', enabled: true, soundId: DEFAULT_ALARM_SOUND_ID },
  { id: '2', time: '09:00', label: 'Weekends · Words pack', enabled: false, soundId: DEFAULT_ALARM_SOUND_ID },
];
