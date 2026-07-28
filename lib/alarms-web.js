/**
 * Browser alarm list for zazu.html (localStorage).
 * Mirrors lib/alarm.ts + lib/useAlarms.ts (without notification scheduling).
 */

(function () {
  const STORAGE_KEY = 'zazu:alarms';

  const DEFAULT_ALARMS = [
    { id: '1', time: '07:30', label: 'Weekdays · Words pack', enabled: true },
    { id: '2', time: '09:00', label: 'Weekends · Words pack', enabled: false },
  ];

  function parseAlarms(raw) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed.filter(
        (entry) =>
          entry &&
          typeof entry.id === 'string' &&
          typeof entry.time === 'string' &&
          typeof entry.label === 'string' &&
          typeof entry.enabled === 'boolean',
      );
    } catch {
      return null;
    }
  }

  function readAlarms() {
    const saved = parseAlarms(localStorage.getItem(STORAGE_KEY));
    return saved?.length ? saved : DEFAULT_ALARMS.slice();
  }

  function writeAlarms(alarms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }

  function toggleAlarm(id, enabled) {
    const next = readAlarms().map((alarm) =>
      alarm.id === id ? { ...alarm, enabled } : alarm,
    );
    writeAlarms(next);
    return next;
  }

  function addAlarm(time, label) {
    const id = `alarm-${Date.now()}`;
    const next = [...readAlarms(), { id, time, label, enabled: true }];
    writeAlarms(next);
    return next;
  }

  function removeAlarm(id) {
    const next = readAlarms().filter((alarm) => alarm.id !== id);
    writeAlarms(next.length ? next : DEFAULT_ALARMS.slice());
    return readAlarms();
  }

  window.ZazuAlarms = {
    readAlarms,
    writeAlarms,
    toggleAlarm,
    addAlarm,
    removeAlarm,
    DEFAULT_ALARMS,
  };
})();
