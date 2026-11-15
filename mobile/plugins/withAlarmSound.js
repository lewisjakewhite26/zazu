const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

/**
 * Notification channel sounds must be native raw resources (res/raw), not JS
 * assets. Copies the alarm chime in so the notification itself can ring
 * (and loop) without the app's JS running.
 */
module.exports = function withAlarmSound(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const source = path.join(config.modRequest.projectRoot, 'assets', 'sounds', 'alarm_chime.wav');
      const rawDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'raw');
      fs.mkdirSync(rawDir, { recursive: true });
      fs.copyFileSync(source, path.join(rawDir, 'alarm_chime.wav'));
      return config;
    },
  ]);
};
