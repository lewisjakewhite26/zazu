export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  notificationId?: string;
};

/** Default alarms shown on first launch before AsyncStorage is populated. */
export const DEFAULT_ALARMS: Alarm[] = [
  { id: '1', time: '07:30', label: 'Weekdays · Words pack', enabled: true },
  { id: '2', time: '09:00', label: 'Weekends · Words pack', enabled: false },
];
