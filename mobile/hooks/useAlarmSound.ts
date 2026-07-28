import { useEffect } from 'react';

import { startAlarmSound, stopAlarmSound } from '../../lib/alarm-sound';

/** Starts gentle alarm chimes while `active` is true. Cleans up on unmount. */
export function useAlarmSound(active: boolean) {
  useEffect(() => {
    if (!active) return;

    void startAlarmSound();
    return () => {
      void stopAlarmSound();
    };
  }, [active]);
}
