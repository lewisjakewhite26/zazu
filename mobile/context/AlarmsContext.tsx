import { createContext, useContext, type ReactNode } from 'react';

import { useAlarms as useAlarmsState } from '../../lib/useAlarms';

type AlarmsContextValue = ReturnType<typeof useAlarmsState>;

const AlarmsContext = createContext<AlarmsContextValue | null>(null);

/**
 * Runs the alarms hook exactly once and shares it via context, so every
 * screen reads and writes the same state. Without this, each screen's own
 * `useAlarms()` call held an isolated snapshot from its own mount time --
 * adding an alarm in AddAlarmScreen wrote to storage correctly but never
 * appeared on Home until a full reload remounted it.
 */
export function AlarmsProvider({ children }: { children: ReactNode }) {
  const value = useAlarmsState();
  return <AlarmsContext.Provider value={value}>{children}</AlarmsContext.Provider>;
}

export function useAlarms(): AlarmsContextValue {
  const context = useContext(AlarmsContext);
  if (!context) {
    throw new Error('useAlarms must be used within AlarmsProvider');
  }
  return context;
}
