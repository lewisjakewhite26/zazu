import { useEffect } from 'react';

import { startAlarmSound, stopAlarmSound, DEFAULT_ALARM_SOUND_ID, type AlarmSoundId } from '../../lib/alarm-sound';

/** Starts gentle alarm chimes while `active` is true. Cleans up on unmount. */
export function useAlarmSound(active: boolean, soundId: AlarmSoundId = DEFAULT_ALARM_SOUND_ID) {
  useEffect(() => {
    if (!active) return;

    void startAlarmSound(soundId);
    return () => {
      void stopAlarmSound();
    };
  }, [active, soundId]);
}
