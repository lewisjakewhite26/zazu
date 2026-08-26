# Roadmap to 90+ — from `auditlateaugst.md`

Target: every dimension in the late-August audit at 90+/100. Current composite is 64/100. This roadmap groups the work by what actually moves each score, in an order that front-loads shared fixes (several audit findings share one root cause, so fixing the root cause buys points in more than one dimension at once).

| Dimension | Audit score | Target |
|---|---|---|
| UI & Visual Craft | 74 | 90+ |
| UX & Responsive Ergonomics | 68 | 90+ |
| Accessibility & Inclusivity | 55 | 90+ |
| Frontend Architecture & State Management | 65 | 90+ |
| Security, Auth & Data Integrity | 70 | 90+ |
| Performance & Network Efficiency | 64 | 90+ |
| Code Maintainability & Clean Code | 63 | 90+ |
| Monetisation & Growth Readiness | 54 | 90+ |

---

## Phase 1 — Fix the three confirmed blockers — Done (2026-08-26)

These are launch-blocking on their own, and two of them also anchor a dimension score (Security, Monetisation) that can't hit 90 while they're open.

| # | Task | Dimensions it unblocks |
|---|---|---|
| 1 | **Account deletion** — Settings → "Delete account" action + a Supabase RPC/edge function that removes/anonymizes rows across `user_entitlements`, `user_word_progress`, `auth.users`. No in-app deletion flow today is a known App Store/Play Store rejection reason. | Security (70→~78) — **Done**: Settings UI + confirm dialog wired through `AuthContext.deleteAccount`, backed by `supabase/functions/delete-account` (resolves the caller's own user id from their session token, calls `auth.admin.deleteUser`; `user_word_progress`/`user_entitlements` cascade-delete). Deployed and smoke-tested (401 on an unauthenticated call, as expected). |
| 2 | **Fix the post-purchase error** — stop calling `upsertUserEntitlement()` from `SubscriptionContext.tsx`'s purchase path in production (it unconditionally throws there by design); set local entitlement state optimistically from the RevenueCat result and let the webhook reconcile it. Currently a paying user sees an error message at the moment of conversion. | Security (+), Monetisation (54→~66) — **Done**: `purchaseGold`/`restorePurchases`/`refreshEntitlement` now only call `upsertUserEntitlement` in `__DEV__`; production sets local state optimistically. `GoldPaywallScreen.handlePurchase`'s existing `router.back()` on success now actually runs. |
| 3 | **Harden Google Sign-In** — gate `Google.useIdTokenAuthRequest` behind `googleConfig.isConfigured` in `SignInScreen.tsx`, matching the existing `isAppleSignInAvailable()` pattern in the same file. Not currently broken (client IDs are set and EAS-synced), but this project has had two documented EAS-env-drift incidents already, and this path has zero fallback — an instant crash screen instead of a degraded state. | Security (+) — **Done**: the hook itself can't be called conditionally (rules of hooks), so instead `Google.useIdTokenAuthRequest` now always receives a defined client ID (real value or a `GOOGLE_CLIENT_ID_FALLBACK` placeholder) — a missing/drifted EAS env var can no longer throw synchronously during render. `googleConfig.isConfigured` still keeps the button disabled/inert either way. |

---

## Phase 2 — One root-cause fix that buys three dimensions — Done (2026-08-26)

| # | Task | Dimensions it unblocks |
|---|---|---|
| 4 | **Shared `useWordLibrary` context** — the hook is called independently in 7 components (`HomeScreen`, `GymScreen`, `VocabularyScreen`, `SuccessScreen`, `AddAlarmScreen`, `WordDetailSheet`, `NotificationBootstrap`), each re-fetching on its own mount with no shared cache. Wrap it in a context the same way `AlarmsContext` was already fixed to do for alarms — that fix is already in the codebase as a template, this is applying the identical pattern to the other hook that still has the bug. | Architecture (65→~78), Performance (64→~76), and indirectly UX (fewer loading-state flashes as screens stop independently re-fetching) — **Done**: `mobile/context/WordLibraryContext.tsx` added, `mobile/hooks/useWordLibrary.ts` collapsed to a context re-export (mirroring `hooks/useAlarms.ts`), provider mounted in `_layout.tsx`. None of the 7 call sites needed to change. Verified via `tsc --noEmit`, full test suite, and a headless smoke test of the real web build. |

This is worth doing early since Phases 3–5 add new screens/flows that would otherwise just add more uncached call sites to fix later.

---

## Phase 3 — Type safety and dead code — Done (2026-08-26)

| # | Task | Dimensions it unblocks |
|---|---|---|
| 5 | **Remove blanket `@ts-nocheck`** from `lib/useProgress.ts`, `lib/useAlarms.ts`, `lib/alarm-notifications.ts`, `lib/alarm-sound.ts`, `lib/feedback.ts`, `lib/useSnooze.ts`, `lib/progress-storage.ts` — core streak/coin/mastery/snooze logic currently ships with zero compiler checking despite `strict: true` everywhere else. Move into a real `tsconfig` reference (or into `mobile/` directly) and fix whatever the compiler surfaces. | Architecture (+), Maintainability (63→~72) — **Done**: kept the files at repo root (still shared with root's vitest suite) and added `mobile/tsconfig.typecheck.json`, a type-check-only config with explicit `paths` mappings for their RN/Expo imports. Deliberately *not* added to the real `tsconfig.json` — Jest and Metro both read that file's `paths` for actual module resolution, and an early attempt to add them there broke real bundling (confirmed via a failed Jest run) before being caught and moved to the isolated config. One real bug surfaced once `alarm-sound.ts` actually type-checked: a closure over a mutable module-level variable lost null-narrowing across the closure boundary. CI's mobile typecheck step now points at the typecheck config. |
| 6 | **Delete dead code** — `mobile/components/home/ProgressDebugPanel.tsx` (built, never imported) and `mobile/app/ad.tsx`/`AdScreen.tsx` (never routed to, hardcodes a real `huel.com` URL). Either delete both or, for the debug panel, wire it behind `__DEV__` if it's meant to stay as a dev shortcut. | Maintainability (+) — **Done**: both deleted, orphaned `Stack.Screen name="ad"` entry removed from `_layout.tsx`. |
| 7 | **Add mobile UI test coverage** — currently 0 tests for any screen/component (vs. 103 passing logic tests for `lib/`). Start with the highest-risk flows: purchase (`SubscriptionContext`), the alarm/gym session state machines, and the account-deletion flow from Phase 1. Doesn't need to be exhaustive to move the score — going from 0 to "critical paths covered" is the jump that matters. | Maintainability (72→~85+) — **Done, partial by design**: set up `jest-expo` + `@testing-library/react-native`, wrote coverage for `useAlarms` (CRUD + persistence + the notification-leak regression) and `AlarmFlowContext` (session state transitions). Purchase-flow tests deliberately deferred to Phase 1 so they're written against the *fixed* behavior rather than encoding the known bug as a passing test. CI now runs `npm test` for mobile. |

---

## Phase 4 — Accessibility pass — Contrast done (2026-08-26), screen-reader pass still open

| # | Task | Dimensions it unblocks |
|---|---|---|
| 8 | **Fix light-theme contrast failures** in `mobile/constants/theme.ts` — `colorsLight.subtext` (3.06:1), `colors.gold` (2.60:1), `colors.wrong` (3.20:1), `colors.correctIcon` (2.26:1) all fail WCAG AA's 4.5:1 minimum for normal text. Dark-theme equivalents already pass at 7.5–8:1, so darken the light-mode tokens to match that same design intent. | Accessibility (55→~72) — **Done**: all four recomputed via the real WCAG contrast formula (not approximated) and darkened for light mode only; dark mode untouched. `wrong`/`gold`/`correctIcon` had no light/dark split at all before this (not even `correctIcon`) — wired into `lib/adaptive-theme.ts`'s snap palette alongside the app's other theme-dependent-but-not-smoothly-blended tokens. Verified the new values are actually live via computed style in a real render, not just present in source. |
| 9 | **Real device screen-reader pass** — VoiceOver (iOS) and TalkBack (Android) walkthrough of the core flows (onboarding, alarm, Word Gym, settings, purchase). The audit found solid `accessibilityRole`/`Label`/`State` coverage in 35/51 component files by static grep, but that's not the same as confirming the actual reading order and announcements make sense — this needs a live pass, not more code reading. | Accessibility (72→~90) — **Still open**, needs a real device with a screen reader running; not something this environment can do. |

---

## Phase 5 — Layout QA and polish — Item #10 was a false positive (2026-08-26), #11–12 still open

| # | Task | Dimensions it unblocks |
|---|---|---|
| 10 | ~~Fix the three confirmed overlap bugs~~ — **Investigated and found to be false positives.** All three (Home's FAB/tab bar over the alarm list, Vocabulary's tab bar over the word grid, Gym's "Start practice" bar over the practice-mode cards) were re-tested against the live web build, including actually scrolling each list to its true end rather than trusting a single static screenshot. Every screen showed fully reachable content with correct clearance once scrolled — `floatingTabBarClearance` is already correctly applied everywhere it needs to be. What the original audit (and my own first, unscrolled screenshots) caught was just the normal, expected look of a floating translucent tab bar sitting over content before the user scrolls — the same thing almost any app with a floating bottom nav does. No code changed; nothing was broken. | UI/UX: no change needed |
| 11 | **On-device confirmation sweep** — every visual finding in `auditlateaugst.md` came from the Expo-web build, which shares layout code with native but isn't native. Re-shoot the same screens on a real device (iOS + Android) to confirm nothing web-only is hiding (safe-area insets, native gesture conflicts, real keyboard behavior) now that #10 is closed with no code change. | UI (74→~85), UX (68→~85) — still open, needs your device |
| 12 | **Full-app cognitive-load and empty/error-state review** — the audit only deep-dived a handful of screens. Do a screen-by-screen pass (using the existing `scripts/capture-screenshots.mjs` infrastructure, extended to more routes) checking every empty state, error state, and loading state for clarity, matching the "70-year-old user" bar already applied to the text-size work. | UI (85→90+), UX (85→90+) — **Done (2026-08-26)**, empty/error/loading pass: Home now shows "No alarms yet" instead of a blank gap; Gym and Vocabulary tabs now surface the word-library error banner they were already reading state for but never rendering; `fetchPackWords` now distinguishes a genuinely empty pack from a failed fetch (both used to silently render the same "no words" message); `SubscriptionContext` no longer silently denies Gold on a fetch failure — it keeps the last known entitlement and surfaces a retry; Settings' legal links now show a message instead of doing nothing if the device can't open a URL. The cognitive-load half (a full screen-by-screen "is this clear" pass beyond concrete bugs) is still open. |

---

## Phase 6 — Monetisation depth

Phase 1's purchase-bug fix gets Monetisation to ~66. The remaining gap to 90 is about depth, not bugs:

| # | Task |
|---|---|
| 13 | **Richer paywall copy/feature differentiation** — the current Gold paywall lists features but the audit flagged the copy as thin. Sharpen the value proposition per feature rather than a generic bullet list. |
| 14 | **At least one viral/sharing hook** — the audit found zero anywhere in the app. Lowest-effort candidates worth scoping: share a learned word's definition/etymology card, share a streak milestone, or a simple referral code tied to the existing coin economy. |
| 15 | **Multi-tier readiness review** — confirm the RevenueCat/entitlement architecture (currently single-tier Gold) wouldn't need a rebuild to add a second tier later, even if a second tier isn't built now. This is an architecture-readiness check, not necessarily new product surface. |
| 16 | **Retention trigger audit** — streak and coins exist; confirm push-notification re-engagement (lapsed-user nudges) is real and not just scaffolded, since that's a standard lever this category expects. |

---

## Suggested execution order

Phases 1 and 2 first — they're the only items that are both launch-blocking and multi-dimension. Phase 3 next (type safety + tests compound in value the earlier they land, since every subsequent phase adds more code that would otherwise ship untested/unchecked). Phases 4 and 5 can run in parallel with each other. Phase 6 last, since it's the only phase that's pure score-improvement with no launch-blocking component — reasonable to sequence after the app is otherwise submission-ready.
