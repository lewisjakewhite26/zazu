# Audit Fixes Summary

This document summarizes the fixes implemented to resolve the two highest-priority audit items: unmounted providers/missing dependencies, and the self-grantable Gold entitlement RLS vulnerability.

## Part 1: Providers & Dependencies Fixed

### 1.1 Missing Dependencies Installed

Added the following packages to `mobile/package.json`:
- `expo-auth-session` (~5.4.0) — Required for OAuth flows
- `expo-apple-authentication` (~6.4.0) — Required for Apple Sign-In  
- `expo-dev-client` (^3.3.8) — Required for development builds with custom native code
- `react-native-purchases` (^7.11.0) — Required for RevenueCat integration (subscription management)

### 1.2 Providers Mounted in Root Layout

Updated `mobile/app/_layout.tsx` to wrap the app tree with both `AuthProvider` and `SubscriptionProvider`, in the correct dependency order:

```
SafeAreaProvider
  → ThemeProvider
    → AuthProvider          (NEW: manages auth state, user session)
      → SubscriptionProvider (NEW: depends on auth, manages entitlements)
        → AlarmFlowProvider
          → NotificationBootstrap
            → Stack (routes)
```

**Why this order?**
- `AuthProvider` must be outermost so `SubscriptionProvider` can call `useAuth()` to get the current user
- `SubscriptionProvider` depends on `AuthProvider` being initialized first
- Both must be inside `ThemeProvider` but outside `AlarmFlowProvider` for dependency clarity

### 1.3 Environment Variables Updated

Updated `mobile/.env.example` with placeholders for:
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` — RevenueCat iOS API key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` — RevenueCat Android API key
- `EXPO_PUBLIC_APPLE_SIGN_IN_TEAM_ID` — Apple Developer Team ID
- `EXPO_PUBLIC_APPLE_SIGN_IN_KEY_ID` — Apple Sign-In Key ID
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth web client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — Google OAuth iOS client ID

**How to configure:**
1. Get RevenueCat API keys from [RevenueCat Dashboard](https://app.revenuecat.com) → Platform → API Keys
2. Get Apple keys from [Apple Developer](https://developer.apple.com) → Certificates, Identifiers & Profiles
3. Get Google keys from [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 Client IDs

---

## Part 2: Gold Entitlement RLS Locked Down

### 2.1 New Migration: `004_lock_entitlements.sql`

**What changed:**
- **Dropped** policies allowing authenticated users to INSERT/UPDATE their own `user_entitlements` rows
- **Replaced** with service_role-only policies for INSERT and UPDATE
- **Kept** the SELECT policy so users can still read their own entitlement row

**Result:** Authenticated clients can NO LONGER modify their own tier — all writes now require `service_role` (i.e., the RevenueCat webhook via Edge Function).

**Run this migration:**
```bash
supabase migration list
supabase db push  # in the supabase/ directory
```

### 2.2 New Migration: `005_lock_premium_words_rls.sql`

**What changed:**
- **Updated** `words_select_premium`, `word_rounds_select_premium`, `word_pairs_select_premium` policies
- **Old policy:** Any authenticated user could read `tier = 'premium'` words
- **New policy:** Only authenticated users with an active Gold entitlement (tier='gold' and gold_until is null OR gold_until > now()) can read premium words

**Result:** Premium content is now only readable by users with valid active subscriptions.

### 2.3 RevenueCat Webhook Handler

**New file:** `supabase/functions/revenuecat-webhook/index.ts`

This Supabase Edge Function:
1. **Receives** RevenueCat webhook events (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE)
2. **Verifies** the webhook signature using HMAC-SHA256 per [RevenueCat webhook docs](https://docs.revenuecat.com/docs/webhooks#signature-verification)
3. **Updates** the `user_entitlements` table via the service_role key:
   - INITIAL_PURCHASE / RENEWAL → tier='gold', gold_until=expiration_at_ms
   - CANCELLATION / EXPIRATION → tier='free', gold_until=null
   - BILLING_ISSUE → logs for review

**Deploy the function:**
```bash
supabase functions deploy revenuecat-webhook
supabase secrets set REVENUECAT_WEBHOOK_KEY=your-webhook-key-from-revenuecat
```

**Configure in RevenueCat Dashboard:**
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com) → App Settings → Webhooks
2. Add endpoint: `https://YOUR_SUPABASE_PROJECT.functions.supabase.co/revenuecat-webhook`
3. Copy the **Webhook Key** and set it as `REVENUECAT_WEBHOOK_KEY` environment variable (see above)
4. Select the events to send: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE

### 2.4 Client-Side Entitlement Updates Gated Behind `__DEV__`

**Updated:** `lib/entitlements-sync.ts`

Changes:
- **`grantGoldDevAccess()`** — Now throws an error in production (requires `__DEV__` flag)
- **`upsertUserEntitlement()`** — Now throws an error in production (requires `__DEV__` flag)
  - Internal function `upsertUserEntitlementInternal()` used by dev grant only
  - Client code cannot call this in production

**Why?** Prevents accidental or intentional client-side privilege escalation. In production, the ONLY path to granting Gold is:
1. User initiates purchase in the app → calls RevenueCat SDK
2. RevenueCat processes the transaction → sends webhook event
3. Edge Function receives webhook → updates `user_entitlements` via service_role
4. App fetches updated entitlement on next sync

**Dev testing:** Developers can still use `grantGoldDevAccess()` locally by keeping `__DEV__=true` in mobile/.env, but this is explicitly blocked in production builds.

---

## Deployment Checklist

### Prerequisites
- Supabase project with `supabase` CLI installed
- RevenueCat account (https://www.revenuecat.com)
- Apple Developer Account (for Apple Sign-In)
- Google Cloud Console project (for Google OAuth)

### Steps

1. **Install mobile dependencies:**
   ```bash
   cd mobile
   npm install  # or yarn install
   ```

2. **Update .env files:**
   - Copy `mobile/.env.example` to `mobile/.env`
   - Fill in all EXPO_PUBLIC_* values from step above
   - Set REVENUECAT_IOS_KEY and REVENUECAT_ANDROID_KEY

3. **Deploy Supabase migrations:**
   ```bash
   cd supabase
   supabase db push
   ```

4. **Deploy RevenueCat webhook function:**
   ```bash
   supabase functions deploy revenuecat-webhook
   supabase secrets set REVENUECAT_WEBHOOK_KEY=your-webhook-key
   ```

5. **Configure RevenueCat webhook:**
   - Get webhook endpoint from `supabase functions list` output
   - Add to RevenueCat Dashboard → App Settings → Webhooks
   - Copy webhook key and set as REVENUECAT_WEBHOOK_KEY secret

6. **Run TypeScript check:**
   ```bash
   cd mobile
   npx tsc --noEmit
   ```
   Should pass with no errors.

---

## What's Next

Once this is deployed, the next priority (item 5 from audit) is completing the RevenueCat integration end-to-end:
- Finish implementing the purchase flow UI in `GoldPaywallScreen`
- Test webhook delivery (RevenueCat sandbox environment)
- Implement receipt validation for restoring purchases
- Add analytics for purchase events

---

## References

- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **RevenueCat Webhooks:** https://docs.revenuecat.com/docs/webhooks
- **Expo Auth Session:** https://docs.expo.dev/versions/latest/sdk/auth-session/
- **React Native Purchases:** https://www.revenuecat.com/docs/react-native
