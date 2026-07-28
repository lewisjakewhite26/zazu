/**
 * Browser settings store for zazu.html (localStorage).
 */

(function () {
  const STORAGE_KEYS = {
    goldPreview: 'zazu:goldPreview',
    notificationsEnabled: 'zazu:notificationsEnabled',
    displayName: 'zazu:displayName',
    themeOverride: 'zazu:themeOverride',
  };

  function readSettings() {
    return {
      goldPreview: localStorage.getItem(STORAGE_KEYS.goldPreview) === 'true',
      notificationsEnabled: localStorage.getItem(STORAGE_KEYS.notificationsEnabled) === 'true',
      displayName: localStorage.getItem(STORAGE_KEYS.displayName) || '',
      themeOverride: localStorage.getItem(STORAGE_KEYS.themeOverride) || '',
    };
  }

  function writeSetting(key, value) {
    localStorage.setItem(key, value);
  }

  function setGoldPreview(enabled) {
    writeSetting(STORAGE_KEYS.goldPreview, enabled ? 'true' : 'false');
  }

  function setNotificationsEnabled(enabled) {
    writeSetting(STORAGE_KEYS.notificationsEnabled, enabled ? 'true' : 'false');
  }

  function setDisplayName(name) {
    writeSetting(STORAGE_KEYS.displayName, name.trim());
  }

  function setThemeOverride(mode) {
    writeSetting(STORAGE_KEYS.themeOverride, mode);
  }

  function getThemeOverride() {
    const value = localStorage.getItem(STORAGE_KEYS.themeOverride);
    if (value === 'light' || value === 'dark' || value === 'auto') return value;
    return 'auto';
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      return { ok: false, reason: 'Notifications are not supported in this browser.' };
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      return { ok: true };
    }
    setNotificationsEnabled(false);
    return {
      ok: false,
      reason:
        permission === 'denied'
          ? 'Notification permission was denied. Enable it in browser settings.'
          : 'Notification permission was not granted.',
    };
  }

  function disableNotifications() {
    setNotificationsEnabled(false);
  }

  window.ZazuSettings = {
    readSettings,
    setGoldPreview,
    setNotificationsEnabled,
    setDisplayName,
    setThemeOverride,
    getThemeOverride,
    enableNotifications,
    disableNotifications,
    STORAGE_KEYS,
  };
})();
