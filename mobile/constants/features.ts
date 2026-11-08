/**
 * Launch switches.
 *
 * Gold purchases stay off until Play billing, the merchant profile and the
 * live RevenueCat Google Play key are set up. While off, RevenueCat is never
 * configured (so the Test Store key can't end up in a release build) and the
 * paywall shows Gold as "coming soon".
 *
 * Turn on by setting EXPO_PUBLIC_GOLD_ENABLED=true in mobile/.env and rebuilding.
 */
export const GOLD_PURCHASES_ENABLED = process.env.EXPO_PUBLIC_GOLD_ENABLED === 'true';
