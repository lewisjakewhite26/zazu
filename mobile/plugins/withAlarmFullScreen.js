const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * A full-screen-intent notification wakes the screen, but Android still won't
 * launch the target Activity over a locked screen without these two flags on
 * it -- without them the OS just turns the display on to the ordinary lock
 * screen and leaves the notification sitting in the tray/heads-up area.
 */
module.exports = function withAlarmFullScreen(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    const mainActivity = application.activity.find((activity) =>
      activity.$['android:name'].endsWith('MainActivity'),
    );

    if (mainActivity) {
      mainActivity.$['android:showWhenLocked'] = 'true';
      mainActivity.$['android:turnScreenOn'] = 'true';
    }

    return config;
  });
};
