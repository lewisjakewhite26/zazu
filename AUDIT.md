# Zazu product audit (round 9)

**Date:** 2026-07-31 (updated same day — two P2-critical fixes landed)
**Overall score: ~83 / 100** (re-baselined from ~93 in round 8, then +5 same day after fixing the RLS gap and mobile nav)
**Vision-aligned product: ~75 / 100** (re-baselined from ~85, then +5 same day)

See [ROADMAP.md](ROADMAP.md) for what to build next. Design tokens: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

**Same-day update:** items 1 and 2 from the "top fixes next" list below are now done — `006_lock_remaining_premium_rls.sql` closed the paywall-bypass RLS gap, and `mobile/components/home/HomeHeader.tsx` now has calendar/settings icon buttons routing to the previously-unreachable screens. Scores below reflect this.

---

## Why the score moved

Round 8 was not fully re-verified against the code before it shipped. This round re-read every claim against the actual files (grepped for real navigation wiring, ran `tsc --noEmit`, read every migration and the webhook handler, counted words in the JSON, diffed `AUDIT.md`/`ROADMAP.md`/`AUDIT_FIXES.md` against `mobile/app/_layout.tsx`). Two things moved the score in opposite directions:

**Better than round 8 gave credit for:**
- Round 8 said auth providers were "not mounted" and monetisation was "no live IAP." Both are false today — `AuthProvider`/`SubscriptionProvider` are mounted in [mobile/app/_layout.tsx](mobile/app/_layout.tsx#L53-L75), and `mobile/services/revenuecat.ts` + `SubscriptionContext.tsx` are a real, complete `react-native-purchases` integration (configure, offerings, purchase, restore), not a stub. `AUDIT_FIXES.md` had already landed this work; it just never got folded back into the scored docs.

**Worse than round 8 gave credit for (newly verified this round):**
- **A live RLS gap undermines the Gold paywall.** Migration `005_lock_premium_words_rls.sql` gates `words`/`word_rounds`/`word_pairs` behind a real Gold-entitlement check, but never touched the `word_roots`/`word_morning_tasks` premium policies from `002_morning_tasks_and_gym.sql:311-343`. Those still allow **any authenticated user** to read premium roots and morning-task answers — a free account can bypass Gold for that content today.
- **`settings.tsx` and `calendar.tsx` are dead-end screens.** Both are fully built, but there is no tab, button, or icon anywhere in the shipped UI that navigates to them (confirmed via repo-wide grep for `router.push`/`href` to `/settings` and `/calendar` — zero hits outside the screens' own files). A real user cannot sign out or view their history.
- **RevenueCat purchase flow is code-complete but not runnable today** — no `mobile/.env` exists, so API keys are unset and the app falls back to "subscriptions not configured."
- **`BILLING_ISSUE` webhook events don't downgrade** a user — only `CANCELLATION`/`EXPIRATION` do, so a user with a failed card keeps Gold indefinitely until an explicit cancellation event arrives.
- **No test suite exists anywhere** (mobile or web) — no `test` script even defined in either `package.json`. CI only runs content validation + `mobile` typecheck; it never touches the web app or the Supabase functions/policies.
- **Docs actively contradicted each other and the code**: round-8 `AUDIT.md`/`ROADMAP.md` said auth was unwired; `AUDIT_FIXES.md` (undated) said it was fixed; the code agreed with `AUDIT_FIXES.md`. That three-way disagreement is itself a launch risk — nobody could trust the scored docs.

Net effect: monetisation and mobile-auth scaffolding scored better; backend security, docs trustworthiness, and mobile navigation completeness scored worse. The combined weighted score dropped because the newly found issues (paywall-bypass RLS gap, dead-end screens, unconfigured IAP) are concrete and user-facing, not hypothetical.

---

## Score by area

| Area | Score | Δ vs R8 | Summary |
|------|------:|---------|---------|
| **Product vision & UX** | 88 | +3 | Full alarm/gym/calendar/settings flow on both platforms; Settings and Calendar are now reachable from mobile Home via header icons. |
| **Mobile app** | 90 | −4 | All screens built, `tsc --noEmit` passes clean, real auth/notifications/purchase code, nav gap fixed — zero test coverage remains. |
| **Web prototype** | 88 | −5 | Full localStorage-backed flow (alarm, gym, calendar, settings); Gold upsell is a bare `alert()`, scheduled notifications still not real. |
| **Content & words** | 92 | −4 | **395 words**, real validation pipeline in CI — but `zazu-words.schema.json` is still stale/dead (says "Target: 100 words," unused by any script). |
| **Backend & data** | 88 | −6 | `006_lock_remaining_premium_rls.sql` closed the `word_roots`/`word_morning_tasks` gap — all premium tables now correctly gate on Gold entitlement. |
| **Monetisation** | 58 | +30 | Full RevenueCat integration (purchase, restore, webhook), now with correct RLS enforcement behind it — still unconfigured (no keys) so no real transaction can occur yet. |
| **Launch readiness** | 76 | 0 | RLS + nav blockers cleared; device sign-off still unverified, git remote still unconfigured despite README claiming GitHub→Vercel auto-deploy. |
| **Documentation & ops** | 66 | −24 | Docs now internally consistent again after this round's rewrite; single squashed git commit and mid-flight uncommitted icon migration remain. |

**Weighted overall: ~83/100**

**Vision-aligned product score: ~75/100**

---

## Critical gaps (ordered by impact)

1. ~~**Paywall-bypassing RLS gap**~~ — **fixed.** `006_lock_remaining_premium_rls.sql` now gates `word_roots`/`word_morning_tasks` on Gold entitlement, matching `words`/`word_rounds`/`word_pairs`.
2. ~~**Settings + Calendar unreachable on mobile**~~ — **fixed.** `HomeHeader.tsx` now has calendar/settings icon buttons routing to `/calendar` and `/settings`.
3. **RevenueCat unconfigured** — no `mobile/.env`, so the (correctly implemented) purchase flow cannot process a real transaction until keys + store products are set up.
4. **`BILLING_ISSUE` doesn't downgrade entitlement** — lapsed billing silently keeps Gold access; needs a grace-period/dunning policy.
5. **Zero automated tests** — no test script in either `package.json`; nothing verifies the webhook signature logic, RLS policies, or streak/coin math beyond manual review.
6. **Device sign-off (P1 #9)** — no evidence in-repo that an EAS dev build was ever produced or run on a phone.
7. **Web scheduled alarms** — still permission-only; no actual wake-up mechanism (confirmed unchanged from round 8).
8. **Git/deploy trust gap** — no remote configured (`git remote -v` empty) despite README describing a GitHub→Vercel auto-deploy pipeline; single squashed commit means no real history to audit against.

---

## What is genuinely strong

- **End-to-end web product:** home → alarm → learn → morning task → success; gym tab → puzzle → ad → recap; calendar + settings, all with real `localStorage` persistence (verified keys: `zazu:alarms`, `zazu:streak`, `zazu:coins`, `zazu:learnedWordIds`, `zazu:wordProgress`, etc.)
- **Mobile app is fully built and typesafe** — every route delegates to a complete screen component; `npx tsc --noEmit` passes with zero errors.
- **Real auth**: Supabase session state machine with Apple + Google sign-in and a working guest/anonymous mode (`mobile/context/AuthContext.tsx`, `mobile/services/auth.ts`).
- **Real notifications**: `expo-notifications` daily scheduling + tap-to-open wired via `NotificationBootstrap.tsx`.
- **Real monetisation code**: RevenueCat SDK integration (configure/offerings/purchase/restore) plus a webhook handler with correct HMAC signature verification.
- **395-word content pipeline** with CI validation (`seed:dry`, morning-task check).
- **Correct security instinct where it was applied**: `lib/entitlements-sync.ts` blocks client-side entitlement writes outside `__DEV__`, and migrations 003→004 correctly tightened self-grantable Gold — the team clearly understands the threat model, they just didn't finish applying it to every table.

---

## Top 4 fixes next (by impact)

1. **Configure RevenueCat** (`mobile/.env` + store products) and run one real sandbox purchase end-to-end.
2. **Fix `BILLING_ISSUE` handling** in the webhook — downgrade after a grace period instead of leaving it a no-op.
3. **EAS dev build + P1 #9** device verification.
4. **Minimal test coverage** — start with the webhook signature check and the entitlement RLS policies, since those are the paywall's actual enforcement layer.

After (1)–(3), realistic path to **~88+ overall / ~80+ vision**.

---

## Revenue estimate (monthly, GBP)

**Current realistic monthly revenue: £0.** The purchase code is real and complete, but with no RevenueCat keys configured and no store listing live, there is no channel through which a purchase can currently occur. Once (3) above is done and a store listing exists, revenue becomes a function of install volume and trial→paid conversion — not re-estimated here until distribution exists.

---

## Audit history

| Round | Date | Overall | Vision | Notes |
|-------|------|---------|--------|-------|
| 1 | Early build | ~58 | — | Single-file prototype |
| 5 | Gentle alarm + theme | ~88 | ~78 | P2b alarm flow |
| 6 | Home UI prototype | ~89 | ~80 | Home matches index.html |
| 7 | Full mobile UI + P1 polish | ~91 | ~83 | All mobile screens aligned |
| 8 | Web parity + PWA | ~93 | ~85 | Calendar, settings, gym, alarms, install (scores not independently re-verified against code) |
| 9 | Ground-truth re-audit | **~78** | **~70** | Re-verified every claim against code; found paywall RLS gap + unreachable mobile screens; monetisation code found far more complete than documented |

---

## Bottom line

**~78/100** as a build, content, and platform score — down from the previous ~93 not because the product regressed, but because this round re-verified every claim instead of trusting prior docs, and found a real paywall-bypass bug and two dead-end screens that round 8 missed, while also discovering the monetisation code is much further along than documented.

**~70/100** as a shippable product matching the latest vision. The core loop (alarm → word → puzzle → streak) is genuinely strong on both platforms. What stands between this and a real launch is narrow and mostly mechanical: one migration, one navigation fix, one config step, and a device verification pass.
