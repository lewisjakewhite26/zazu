# Google Play launch pack

Everything to paste into Play Console for the first release. Gold is switched off for launch (`EXPO_PUBLIC_GOLD_ENABLED` unset) and shows as "coming soon", so nothing below mentions payments. Revisit the **Data safety** and **listing** sections when Gold goes on sale.

Package name: `com.zazu.app` (no published app uses it as of 8 Nov 2026; Play will tell you on first upload if it's reserved).

---

## 1. Tonight's order of work

1. **Build:** in `mobile/`: `npx expo prebuild --clean -p android`, then `cd android && ./gradlew bundleRelease`. Or `eas build -p android --profile production`. Output is an `.aab`.
   - Prebuild is needed because the launcher icons, permissions and blocked permissions in `app.json` changed.
   - Keep your upload keystore and its passwords backed up somewhere other than this laptop.
2. **Phone test** (release build, not dev):
   - Set an alarm 2 minutes ahead, lock the phone, and check the full-screen alarm appears.
   - Repeat with the app swiped away, then after a reboot.
   - Go through reveal, learn, task, dismiss. Try snooze.
   - Open the Word Gym and tap a locked pack: the paywall should show "Coming soon" with no price and no working button.
   - In Settings the row should read "Zazu Gold: coming soon".
   - Check the launcher icon is the Zazu mark, not the blue Expo logo.
   - Sign in with Google, then delete the account.
3. **Screenshots** while the phone is plugged in: `adb exec-out screencap -p > shots/01-alarm.png` and so on (see section 5), then `python scripts/play-store/make_store_assets.py --shots shots`.
4. **Play Console:** create the app, fill in sections 2 to 5, then upload the `.aab` to **Internal testing**.
5. **Google Sign-In fix:** Play Console → Test and release → App integrity → App signing. Copy the **App signing key SHA-1** and add it as an Android OAuth client in Google Cloud Console (package `com.zazu.app`). Keep your upload-key SHA-1 there too. Install from the internal testing link and sign in again.
6. **Closed testing:** create a closed track, add 12 or more testers by email or Google Group, and send them the opt-in link. They must stay opted in for 14 days before you can apply for production (this applies to personal developer accounts made after November 2023).

---

## 2. Store listing

**App name** (27/30)
```
Zazu: Word of the Day Alarm
```

**Short description** (67/80)
```
Wake up to a new word every morning. Learn it, then start your day.
```

**Full description**
```
Zazu is an alarm clock that teaches you a word every morning.

When your alarm goes off, a new word is waiting. You see what it means and where it came from, then answer one short question to show it stuck. Alarm off. Day started, one word richer.

HOW IT WORKS
• Set your alarm like any other
• Wake up to your word of the day
• Learn its meaning and its roots
• Answer one quick question to switch the alarm off

WORDS WORTH KNOWING
Nearly 400 words, each with a clear definition, its etymology and a real example of it in use. Words like penultimate, adumbrate and languid. Words that help you say exactly what you mean.

THE WORD GYM
Want more? The Word Gym takes a word through three rounds: where it comes from, what it means and how to use it. Play it any time from the Gym tab or your calendar.

BUILT FOR MORNINGS
A gentle chime, not a siren. A calm screen that's easy to read half-awake. Snooze when you need it. The app shifts from light to dark at dusk and back at dawn.

STREAKS AND COINS
Keep a daily streak and earn coins every morning you show up.

YOUR PROGRESS
Use Zazu as a guest and your progress stays on your phone. Sign in with Google to keep it safe across devices.

NO ADS. NO TRACKING.
Zazu has no adverts and no analytics or tracking tools.

COMING SOON: ZAZU GOLD
Ten themed word packs with more than 1,700 extra words, your full word history and the Word Gym on every word you've learned.

One word. Every morning.
```

**App category:** Education. **Tags:** Vocabulary, Language learning, Alarm clock.
**Contact email:** hello@zazu.org.uk. **Website:** https://zazu.org.uk. **Privacy policy:** https://zazu.org.uk/privacy

**Graphics:** in `scripts/play-store/out/`
- App icon: `icon-512.png`
- Feature graphic: `feature-graphic.png`
- Phone screenshots: `shot-01.png` and up, 2 to 8 of them, from step 3

---

## 3. App content (Policy → App content)

| Section | Answer |
|---|---|
| Privacy policy | https://zazu.org.uk/privacy |
| App access | All functionality is available without special access. (Guest mode needs no account. Gold isn't on sale.) |
| Ads | No, my app does not contain ads |
| Content rating | Category: **Reference, News, or Educational**. Answer **No** to everything: violence, sexual content, language, drugs, gambling, user interaction/chat, sharing location, digital purchases. Expected result: PEGI 3 / Everyone. |
| Target audience | **13–15, 16–17, 18 and over.** Don't tick under-13 (the privacy policy says Zazu isn't for under-13s, and ticking it pulls you into the Families policy). "Could it unintentionally appeal to children?" No. |
| News app | No |
| Government app | No |
| Financial features | My app doesn't provide any financial features |
| Health | My app does not have any health features |
| Advertising ID | No, my app does not use advertising ID (the `AD_ID` permission is blocked in `app.json`) |
| Data safety | See section 4 |
| Account deletion | Yes, users can create an account. Deletion URL: **https://zazu.org.uk/delete-account** |

### Permission declarations

Play asks for these after the first `.aab` upload.

**Exact alarm (`USE_EXACT_ALARM`)**: choose **Alarm clock**.
```
Zazu is an alarm clock. Its core function is waking the user at the exact time they set. Alarms are scheduled with AlarmManager.setAlarmClock so they fire on time even in Doze mode.
```

**Full-screen intent (`USE_FULL_SCREEN_INTENT`)**: choose **Alarm clock**.
```
Zazu is an alarm clock. When an alarm the user has set goes off, Zazu shows a full-screen alarm over the lock screen so the user can see their word and dismiss or snooze the alarm. It is used for nothing else.
```

**Foreground service (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`)**: the manifest declares this (it comes from expo-audio). Choose **Media playback**.
```
When an alarm the user has set goes off, Zazu plays the alarm sound until the user dismisses or snoozes it. The media playback foreground service keeps that sound playing if the user leaves the alarm screen. It only runs while an alarm is ringing.
```
Play asks for a short video link: record the phone with the alarm ringing and dismissed (about 30 seconds), upload it to YouTube as unlisted, and paste the link.

---

## 4. Data safety

**Does your app collect or share any of the required user data types?** Yes
**Is all user data encrypted in transit?** Yes (HTTPS to Supabase)
**Do you provide a way for users to request that their data is deleted?** Yes: in the app (Settings → Delete account) and at https://zazu.org.uk/delete-account

Data collected. None of it is **shared**: Supabase and Google act as service providers, which Play doesn't count as sharing.

| Data type | Collected | Required or optional | Purpose |
|---|---|---|---|
| Personal info → **Name** | Yes | Optional (only if you sign in) | Account management |
| Personal info → **Email address** | Yes | Optional (only if you sign in) | Account management |
| Personal info → **User IDs** | Yes | Optional (only if you sign in) | Account management, App functionality |
| App activity → **App interactions** (streak, coins, words learned) | Yes | Optional (only synced if you sign in) | App functionality |

Not collected: location, contacts, photos, audio (microphone permission is blocked), files, calendar, health, financial info, messages, web history, device IDs, crash logs, diagnostics.

**When Gold goes on sale, add:** Financial info → Purchase history (collected via RevenueCat, App functionality), and Device or other IDs (RevenueCat app user ID).

---

## 5. Screenshots to take

Use a real phone, release build, light mode unless noted. Name them so they sort in this order:

| File | Screen | Caption |
|---|---|---|
| `01-alarm.png` | Alarm ringing / word reveal | Wake up to a new word |
| `02-learn.png` | Learn screen (definition + etymology) | Learn where it comes from |
| `03-task.png` | Morning task | One short task, then you're up |
| `04-gym-dark.png` | Word Gym round, dark mode | Practise in the Word Gym |
| `05-calendar.png` | Calendar / vocabulary tab | Every word you've learned, by day |
| `06-home-dark.png` | Home with alarms, dark mode | Light at dawn, dark at dusk |

Make sure no debug panels are visible. They only appear in dev builds, so use the release build. Don't reuse `New SS/`: those are old web captures that show a debug panel and a mock ad.

---

## 6. After launch: turning Gold on

1. Play Console: set up a payments profile, then create subscriptions `gold_monthly` and `gold_annual`, each with a 7-day free trial.
2. RevenueCat: add the Google Play app, upload a service account JSON, map the products to the `default` offering and the `gold` entitlement, and copy the **Google Play SDK key** (starts `goog_`).
3. `mobile/.env`: set `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...` and `EXPO_PUBLIC_GOLD_ENABLED=true`. Rebuild.
4. Run a test purchase with a licence-tester account, then update Data safety (section 4) and the listing.
5. Put prices back on the landing site's `GoldSection.tsx`. The app had £2.49/£14.99 and the site had £1.99/£14.99, so pick one.
