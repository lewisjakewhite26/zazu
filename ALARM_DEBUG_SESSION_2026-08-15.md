# Alarm notification debugging session — 2026-08-15 evening → 2026-08-16 early morning

Goal at the start: alarm wasn't waking a locked phone at all. By the end of this session that's mostly fixed, but the very last fix (foreground-resume re-check) is built and installed but **not yet tested**. Read the "Where things stand" section first, then the rest is the full trail if you need to understand *why* something was done.

---

## Where things stand right now (read this first)

**Confirmed working, verified with real device tests + logs:**
- Screen wakes and unlocks over the lock screen (not just a black screen)
- Custom alarm chime sound plays on loop (not the generic system ping)
- Routes to the real `/alarm` screen (not home) — **but only confirmed for the specific case of a genuine fresh app launch**, not yet confirmed for the "app already running in background" case (see below)

**Still unconfirmed / the open problem:**
Every alarm fire goes through Android's **background/headless delivery path** (`NotifeeHeadlessJS` in the logs), not the foreground path — this happens whether the phone is locked *or* just backgrounded via the home button. It's the same code path either way. The headless context has no live navigation, so a JS-side "breadcrumb" pattern was built to bridge it: the background handler writes a small note to storage, and the main app checks for that note.

Problem found: that check only ran once, on the app's very first mount. If the app was already alive in memory (which it usually is — Android rarely fully kills it), pressing home or locking the phone doesn't unmount it, so the breadcrumb check never ran again when the app came back to the foreground.

**Fix just built (2026-08-16 00:44, build succeeded, installed):** added a second check that re-fires every time the app returns to the foreground (`AppState` listener), not just on first mount. **This has not been tested yet** — that's the very next thing to do.

### To test tomorrow
1. Open the app (Quick test alarm button is on the home screen: "Quick test alarm (+2 min)" — schedules a real alarm 2 minutes out, no need to fight the time-wheel picker).
2. Press the home button (or lock the phone) so Zazu is backgrounded.
3. Wait for it to fire.
4. Check: does it now land on the actual `/alarm` screen with the chosen sound playing, instead of home screen + generic ping?

If yes — the whole alarm pipeline should finally be solid end to end. If still landing on home screen, the breadcrumb/AppState approach needs rethinking (see "Ideas not yet tried" at the bottom).

---

## Everything that was actually broken, and what fixed each one

### 1. Screen not waking / not unlocking over the lock screen
**Cause:** Android's `showWhenLocked` + `turnScreenOn` Activity flags were never set. Without them, a full-screen-intent notification just turns the display on to the ordinary lock screen — it doesn't actually launch the app's Activity over it.
**Fix:** `mobile/plugins/withAlarmFullScreen.js` — a small Expo config plugin that injects both flags onto `MainActivity` in the generated `AndroidManifest.xml`. Wired into `mobile/app.json` plugins list.

### 2. Screen sometimes woke but showed a black screen, other times worked
**Cause:** the app process usually survives between alarm firings (rarely fully killed), so Android was just **resuming** the existing Activity instead of creating a fresh one — and `turnScreenOn` only takes effect on genuine Activity *creation*, not resume.
**Fix:** added `launchActivityFlags: [NEW_TASK, CLEAR_TASK]` to the notification's `fullScreenAction` in `lib/alarm-notifications.ts`, forcing a fresh Activity launch every time.

### 3. Sound never played (any of the 5 chime options), only worked in the in-app preview button
**Cause:** traced directly into the `expo-audio` library's own source. `preload()`/`createAudioPlayer()` resolve a local `require()`'d asset by reconstructing an expected native resource name (e.g. `assets_sounds_susurrus`). Metro renames local assets to short opaque names (e.g. `qS.wav`) when packaging for an Android **release** build — that naive name-reconstruction never matches, on every sound file, every release build. This is why it only ever worked via the in-app preview (different resolution code path) and never on the actual firing alarm.
**Fix:** in `lib/alarm-sound.ts`, resolve the asset through `expo-asset`'s `Asset.fromModule(id).downloadAsync()` first to get a genuine local file:// URI, then hand that to the player — sidesteps the broken native lookup entirely. This is the same trick `expo-audio`'s own library code uses internally for `downloadFirst`-style remote URLs, just not applied to local files by default.
**Dead-end tried first:** disabling Android resource shrinking via `expo-build-properties` — verified via decompiling the actual built APK that this did nothing (files were already short-named regardless of the shrink setting). Reverted that change since it was just extra APK bloat for no benefit.

### 4. Default "Chime" sound specifically also had its own separate bug
**Cause:** `alarm-chime.wav` had a hyphen in the filename. Android/Metro asset packaging can choke on non-alphanumeric characters in bundled asset names.
**Fix:** renamed to `alarm_chime.wav` (`lib/alarm-sound.ts`, `scripts/generate-alarm-chime.mjs`, and the actual file via `git mv`). Turned out this wasn't the actual root cause of the broader sound bug (that was #3 above) but is still worth keeping — avoiding special characters in bundled asset filenames is correct practice regardless.

### 5. Alarm timing was unreliable / used to silently fall back to inexact scheduling
**Cause:** the original notifee migration (done in a previous session) used `TriggerType.TIMESTAMP` without specifying `alarmManager`. Per notifee's own docs, trigger notifications default to Android's **WorkManager** API, not the real **AlarmManager** — WorkManager triggers can be delayed arbitrarily by Doze/battery restrictions, especially when the app isn't actively running. The original `expo-notifications` code (before that migration) used a trigger type that used AlarmManager by default, so this was a silent regression introduced by the library swap.
**Fix:** added `alarmManager: { type: AlarmType.SET_ALARM_CLOCK }` to both the main alarm and snooze triggers in `lib/alarm-notifications.ts`. `SET_ALARM_CLOCK` is the real "alarm clock" API — exempt from Doze entirely, same mechanism the stock Clock app uses.

### 6. `SCHEDULE_EXACT_ALARM` permission not granted
**Cause:** Android 13+ requires the user to explicitly grant this via Settings — it's not auto-granted just because it's declared in the manifest. Confirmed directly in the logs: `NotifeeAlarmManager: SCHEDULE_EXACT_ALARM permission not granted. Falling back to inexact alarm.`
**Fix:** no code fix needed beyond what already existed — the in-app permission banner (see below) already has a "Fix" button that deep-links to the right Settings screen. Just needs to actually be granted after each fresh install (permissions don't carry over to a newly-signed/reinstalled build in all cases).

### 7. App landed on the **home screen** instead of the **alarm screen** when the notification fired
This was the hardest one and went through several wrong turns before finding the real cause(s):
- **First real bug found:** `NotificationBootstrap.tsx` called `notifee.getInitialNotification()` immediately on mount, before `alarmWordOfDay` (fetched async) had loaded. `openAlarmFlow()` silently bails via `if (!alarmWordOfDay) return`, so the one read of the launch notification got thrown away before the data was ready. **Fixed** by gating the call behind `if (alarmWordOfDay)`.
- **Second real bug found:** even with that fixed, routing still failed specifically when the app was already alive in the background (not a fresh cold start). `getInitialNotification()` only ever captures data from a genuine `onCreate` — when Android resumes an existing Activity via `onNewIntent` instead (very common, see bug #2), it stays silent. **Fixed** by also listening for the `DELIVERED` notifee event (fires the instant the trigger executes, regardless of press/launch semantics) in `onForegroundEvent`.
- **Third real bug found:** `DELIVERED` doesn't always route through `onForegroundEvent` — when the app is deeply backgrounded (confirmed via `NotifeeHeadlessJS` in the logs), it routes through the **background** handler instead, which was just an empty no-op left over from the original notifee migration (`notifee.onBackgroundEvent(async () => {})` in `mobile/app/_layout.tsx`). That context has no live React tree to navigate with. **Fixed** with a breadcrumb pattern: the background handler now writes `{alarmId, notificationId, deliveredAt}` to AsyncStorage (`PENDING_ALARM_OPEN_KEY`, defined in `lib/alarm-notifications.ts`), and `NotificationBootstrap.tsx` checks for it.
- **Fourth bug found (the one just fixed, untested):** that breadcrumb check only ran once, on mount — see "Where things stand" above.

### 8. Library itself was a dead end
Partway through this session it came out that **notifee (`@notifee/react-native`) is archived** — Invertase officially archived the repo 2026-04-07, last release was v9.1.8 (the exact version this project had installed), stopped receiving updates back in December 2024. The maintainer's own migration guidance points to `react-native-notify-kit`, a community fork that's a genuine drop-in replacement (same API, just change the import) and explicitly fixes "35+ upstream bugs" including Android 14-15 compatibility issues — matching the exact bug class being fought here.
**Action taken:** swapped `@notifee/react-native` → `react-native-notify-kit` everywhere (`lib/alarm-notifications.ts`, `mobile/app/_layout.tsx`, `mobile/components/NotificationBootstrap.tsx`, `mobile/app.json` plugins list, `mobile/package.json`). Confirmed 100% type-compatible via a clean `tsc --noEmit` pass with zero changes needed to call sites.

---

## New in-app tooling added along the way

- **`mobile/components/home/AlarmPermissionBanner.tsx`** — shows on the home screen when notification / exact-alarm / battery-optimization permissions aren't granted, each with a "Fix" button that deep-links straight to the right Settings screen. Wired into `lib/useAlarms.ts` (`permissionStatus`, `refreshPermissionStatus`, re-checked on every `AppState` foreground transition) and `HomeScreen.tsx`.
- **"Quick test alarm (+2 min)" button** on the home screen (`HomeScreen.tsx`) — schedules a real alarm notification 2 minutes out with one tap, so testing doesn't require fighting the custom time-wheel picker every time. This was added specifically because manually operating the phone via `adb input swipe` to scroll the wheel picker turned out extremely fiddly and slow.

---

## Build/tooling situation

- **EAS cloud builds got used up.** The Android builds on the free EAS plan ran out partway through this session — resets 2026-09-01 (16 days from tonight). ~10 cloud builds were burned before hitting the wall, several wasted on the wrong build profile or on fixes that turned out not to be the real problem.
- **Switched to fully local builds** to get around the quota and remove the ~10-25 min cloud round-trip per iteration. Set up on this machine tonight:
  - JDK 17 (Temurin), installed via `winget`, at `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot`
  - Android SDK (platform-tools, platform 35, build-tools 35.0.0, cmake, NDK) at `C:\Users\lewis\android-sdk` — **note:** originally tried putting this in a deep temp scratchpad path, then at `C:\android-sdk` (drive root) — both caused real problems (Windows 260-character path limit blew up on the temp path; something about drive-root broke a few modules' Android classpath, still not fully understood). Settled on `C:\Users\lewis\android-sdk`, which has worked reliably since.
  - Local build command (from `mobile/`):
    ```
    export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.20.8-hotspot"
    export ANDROID_HOME="/c/Users/lewis/android-sdk"
    export ANDROID_SDK_ROOT="/c/Users/lewis/android-sdk"
    export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
    npx expo run:android --variant release --no-bundler
    ```
  - `mobile/app.json` → `expo-build-properties` plugin has `"buildArchs": ["arm64-v8a"]` — restricts the native build to just the architecture the actual test phone (Pixel 10 Pro) uses. Cuts build time roughly 4x and was also needed to dodge a genuine Windows 260-character path-length bug that only hit the 32-bit ARM build variant.
  - **Important gotcha hit tonight:** `expo run:android` does **not** re-sync config-plugin changes (app.json edits) into an already-generated `android/` folder on later runs — it only applies them on the very first `prebuild`. Several config changes (buildArchs, plugin additions) silently did nothing until running `npx expo prebuild --clean --platform android` to force a full regeneration. If a future app.json/plugin change doesn't seem to take effect, this is almost certainly why.
  - First build after any native/config change: ~7-25 min depending on what changed. Once cached, a **pure JS-only change rebuilds in ~1.5 minutes** — most of tonight's later iterations were this fast.

- **Live device testing setup:** phone connected via USB debugging. `adb` at `C:\Users\lewis\android-sdk\platform-tools\adb.exe`. Live logcat capture + a background "Monitor" watcher (pings progress every N build steps, instant alert on failure) made it possible to watch builds and device behavior in real time instead of guessing.

---

## Dead ends / wrong guesses along the way (for context, don't repeat these)

- Assumed the WAV filename hyphen was the whole sound bug — it was real but only explained one of five sound files.
- Assumed disabling Android resource shrinking would fix sound loading — verified via APK decompilation that it changed nothing.
- Assumed moving the local Android SDK to `C:\` drive root would be safely short — it broke a few modules' classpath resolution for reasons not fully understood; moved to `C:\Users\lewis\android-sdk` instead, which has been stable.
- Assumed `expo run:android` would always regenerate `android/` from current `app.json` — it doesn't, silently, unless `prebuild --clean` is run explicitly.
- Assumed the very first successful "screen wakes, right sound, right screen" test proved the whole pipeline was fixed — it only proved the **fresh cold-launch** path was fixed; the far more common "app already running in background" path had (and until tomorrow's test, may still have) a separate bug.

---

## Ideas not yet tried (if tomorrow's AppState-resume test still fails)

- Log/alert directly inside the `checkPendingAlarm()` function and the background `onBackgroundEvent` handler temporarily (same technique used earlier for the sound bug) to get concrete confirmation of whether the breadcrumb is actually being written and read, rather than inferring from silence.
- Consider whether `AppState`'s `'active'` event is actually firing reliably on this exact resume path (full-screen-intent-driven Activity relaunch) — it's possible this specific transition doesn't trigger a standard AppState change event the same way a normal app-switch does.
- Worth checking whether Android is rate-limiting/suppressing repeated full-screen-intents from the same app after many rapid test firings in a short window (a real, documented Android anti-abuse behavior) — if so, spacing out tests (or a fresh reinstall) might be needed to get a clean read.

---

## Everything is still uncommitted

Nothing from tonight has been committed to git. `git status` at end of session shows all of the above as modified/new files still sitting in the working tree. Worth committing once tomorrow's test confirms things actually work end to end — no point committing a fix that turns out to need another round.
