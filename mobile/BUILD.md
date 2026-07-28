# Zazu mobile builds (Android + iOS)

Use an **EAS development build** for real alarms, OAuth, and subscriptions. Expo Go cannot run this project (SDK 56).

All commands run from `mobile/`.

## One-time setup

```bash
cd mobile
npm install
npm install -g eas-cli   # or: npx eas-cli …
eas login
eas build:configure
```

Copy `mobile/.env.example` to `mobile/.env` and fill in Supabase + OAuth keys.

Run Supabase migration `003_user_entitlements.sql` in the SQL Editor.

Enable **Apple** and **Google** in Supabase → Authentication → Providers. Add redirect URL:

```text
zazu://auth/callback
```

## Development build

### Android (APK, easiest to sideload)

```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```

Install the APK from the EAS build page on your phone.

### iOS (physical device)

Requires an Apple Developer account ($99/year).

```bash
eas build --profile development --platform ios
```

Install via the EAS link or register the device UDID when prompted.

### Daily workflow

```bash
npx expo start --dev-client
```

Open **Zazu** on the phone and scan the QR code.

## OAuth checklist

| Provider | Where to configure |
|----------|-------------------|
| Google | Google Cloud Console → OAuth clients (Web, iOS, Android). Add EAS SHA-1 for Android. |
| Apple | Apple Developer → Sign in with Apple. Supabase Auth → Apple provider. |
| Supabase | Redirect URLs include `zazu://auth/callback` |

### Web dev (Google sign-in)

On web, sign-in uses **Supabase OAuth** (not the native id-token flow), so Google only needs the Supabase callback URL you already added:

`https://<project-ref>.supabase.co/auth/v1/callback`

In **Supabase → Authentication → URL Configuration**, add redirect URLs for each local port you use, e.g.:

- `http://localhost:8087`
- `http://localhost:8086`

Set **Site URL** to the same origin while testing (e.g. `http://localhost:8087`). Restart Expo if you change ports.

## Zazu Gold tiers

| Tier | What unlocks |
|------|----------------|
| **Free** | Today + yesterday in calendar. Alarm flow. Guest or signed-in. |
| **Gold** | Full calendar history. Word Gym tab. |

Gold status is stored in `user_entitlements` (Supabase) and synced to `user_metadata.gold_tier`.

**Dev testing:** Settings → Grant Gold (dev) after signing in.

**Production:** Add RevenueCat keys to `.env`, create entitlement `gold`, wire App Store / Play products.

## Store builds (later)

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
eas submit --platform ios
eas submit --platform android
```
