# Zazu roadmap

Priority list for Zazu development. Rewritten 2026-07-31 after a ground-truth re-audit (every item below was re-verified against the actual code, not carried forward from prior docs).

**Overall score: ~78/100** · Vision-aligned product: ~70/100 · Details in [AUDIT.md](AUDIT.md)

---

## Priority overview

| Tier | Goal | Status |
|------|------|--------|
| **P0** | Daily-usable mobile alarm + puzzle flow | Complete |
| **P1** | TestFlight-ready foundations (notifications, persistence, audio, UI polish) | Code complete; **dev build + device sign-off open** |
| **P2** | Public-launch polish (web parity, CI, backend, Vercel, UI) | Web parity complete; **two real bugs found this round (see P2 Critical)** |
| **P2b** | Product pivot (gentle alarm + Word Gym) | Done |
| **P3** | Post-launch (ads, shop, PWA, analytics) | Backlog |

---

## P0 — Must have before anyone uses this daily

| # | Task | Status |
|---|------|--------|
| 1 | Mobile puzzle screen (3-round matching game) | Done |
| 2 | Wire `completeWord(wordId)` at puzzle end | Done |
| 3 | Mobile alarm + success screens | Done |
| 4 | Navigation from **Try the alarm** into the flow | Done |

**P0 is complete.**

---

## P1 — Must have before TestFlight / Play internal testing

| # | Task | Status |
|---|------|--------|
| 5 | Real alarm scheduling (`expo-notifications`, daily notifications) | Done — verified real in `lib/alarm-notifications.ts` (native only; correctly no-ops on web) |
| 6 | Alarm persistence (alarm list in AsyncStorage via `useAlarms`) | Done |
| 7 | Audio + haptics (`expo-av` chime, `expo-haptics` on puzzle/success) | Done |
| 8 | Expo branding pass (`app.json`: Zazu name, slug, dawn splash) | Done |
| 9 | Device verification (notifications, audio, kill/reopen persistence) | **No evidence in-repo this has happened.** `mobile/eas.json` + `mobile/BUILD.md` are ready; nothing indicates a dev build was actually produced/installed. |

### P1 code quality (verified this round)

| Check | Status |
|---|---|
| `npx tsc --noEmit` (mobile) | **Passes clean, zero errors** |
| Automated tests (mobile or web) | **None exist** — no `test` script in either `package.json`, no test files anywhere |
| CI coverage | `.github/workflows/ci.yml` runs `seed:dry`, `words:morning-tasks:check`, and mobile `tsc --noEmit` only — no tests, no web build/lint, no Supabase policy checks |

**P1 code is complete and typesafe. Only #9 (real device) and test coverage remain.**

### P1 — EAS development build ("Zazu Dev")

Replaces Play Store Expo Go. One custom APK on your phone with full local notifications, haptics, and SDK 56 support.

| # | Task | Status |
|---|------|--------|
| 31 | Expo account + `eas login` (from `mobile/`) | Not started |
| 32 | Install `expo-dev-client` | Not started |
| 33 | `eas build:configure` + `mobile/eas.json` development profile | Done (`eas.json` committed, profiles present: development/preview/production) |
| 34 | `eas build --profile development --platform android` → install APK on phone | Not started |
| 35 | Device verification (P1 #9) on dev build | Not started |

See [mobile/BUILD.md](mobile/BUILD.md) for the full workflow.

### Verify without a phone

```bash
cd mobile
npx tsc --noEmit    # typecheck — currently passing
npm run web         # full flow + web chimes + add alarm + calendar
```

---

## P2 — Should have for public launch

### P2 Critical (new findings this round — fix first)

| # | Task | Status |
|---|------|--------|
| 37 | **Ship `006_lock_remaining_premium_rls.sql`** — `word_roots`/`word_morning_tasks` premium policies (from `002_morning_tasks_and_gym.sql:311-343`) still let any authenticated user read Gold-only content. Migration `005` only fixed `words`/`word_rounds`/`word_pairs`. | **Done** — `supabase/migrations/006_lock_remaining_premium_rls.sql` written and pushed |
| 38 | **Add Settings + Calendar navigation on mobile** — both screens are fully built (`mobile/app/settings.tsx`, `mobile/app/calendar.tsx`) but unreachable: no tab, icon, or button anywhere links to them. Users currently cannot sign out. | **Done** — calendar/settings icon buttons added to `mobile/components/home/HomeHeader.tsx`, routing to `/calendar` and `/settings` (mirrors web's 📅/⚙️ header icons); `tsc --noEmit` passes |
| 39 | **Configure RevenueCat** — no `mobile/.env` exists; `EXPO_PUBLIC_REVENUECAT_IOS_KEY`/`ANDROID_KEY` are unset so the (correctly coded) purchase flow can't run. Populate real keys + set up store products, then do one sandbox purchase end-to-end. | Not started |
| 40 | **Fix `BILLING_ISSUE` webhook handling** — currently only logs; lapsed billing never downgrades a user. Add a grace period + eventual downgrade. | Not started |

### P2 — Everything else

| # | Task | Status |
|---|------|--------|
| 10 | Extract shared game logic (`COPY`, puzzle engine, `mapWordRow` into `lib/`) | Not started |
| 11 | Supabase auth + Zazu Gold subscription (full calendar history, Word Gym) | **Done** — `AuthProvider`/`SubscriptionProvider` mounted in `mobile/app/_layout.tsx`; migrations 003–005 applied in-repo (verify they're pushed to your live Supabase project with `supabase migration list`) |
| 12 | Web progress persistence (`localStorage`: streak, coins, learned words) | Done |
| 13 | Accessibility on web puzzle (keyboard, ARIA, remove `user-scalable=no`) | Done |
| 14 | Error states (visible message when Supabase fetch fails) | Done (web + mobile) |
| 15 | CI baseline (GitHub Actions: `tsc`, `seed:dry`, morning-task check) | Done — **but does not cover web app, tests, or Supabase policies** |
| 36 | Finalise mobile UI for all pages — match `index.html` per screen | Done |
| 41 | Add automated tests — start with webhook signature verification and RLS policy checks (the actual paywall enforcement layer) | Not started |
| 42 | Fix `zazu-words.schema.json` — stale (says "Target: 100 words," missing `roots`/`introEtymology`/`morningTask` fields), unused by any script today, so harmless but misleading | Not started |
| 43 | Reconcile git remote / deploy pipeline — `git remote -v` is empty despite README describing GitHub→Vercel auto-deploy; confirm how deploys actually happen today | Not started |
| 44 | Land or drop the in-flight icon migration — `mobile/package.json` has uncommitted additions of `phosphor-react-native` + `react-native-svg` alongside the existing `@expo/vector-icons`; two icon systems present mid-migration | In progress, uncommitted |

### Also shipped with P2 (data + content)

| Task | Status |
|---|------|
| Morning task schema (`002_morning_tasks_and_gym.sql`) | Done |
| `word_roots`, `word_morning_tasks`, distractor pool, seed pipeline | Done |
| Alarm vs Gym Supabase RPCs (`get_words_for_alarm`, `get_words_for_gym`) | Done |
| `user_word_progress` table (alarm vs gym timestamps) | Done |
| `user_entitlements` table + lockdown (`003`–`005`) | Done, **incompletely** — see #37 above |
| Batch import script (`import-word-batch.mjs`) | Done |
| **395 words** + morning tasks synced to Supabase | Done — count re-verified this round |
| Mobile calendar screen (`/calendar`, free/Gold preview, word detail sheet) | Done — **but unreachable from UI, see #38** |
| Gradual adaptive theme (30 min dusk/dawn, web + mobile) | Done |
| **All mobile screens** prototype-aligned (alarm, gym, onboarding, settings, gold, ad) | Done |
| Design system doc + full screenshot set | Done |
| Gentle alarm flow (mobile + web) | Done |
| Vercel static deploy (`vercel.json`, `dist/` build) | Config present; **actual deploy trigger unverified, no git remote configured** |
| Auth/IAP integration (`AuthContext`, `SubscriptionContext`, RevenueCat, entitlements sync) | **Done and wired** — previously documented as "scaffolded/unwired," confirmed otherwise this round |
| Web Word Gym tab + floating pill nav | Done |
| Web alarm list persistence (`lib/alarms-web.js`) | Done |
| Web calendar (history, Gold preview, word detail sheet) | Done |
| Web settings (notifications toggle, theme, guest account) | Done |
| PWA manifest + service worker (install + offline shell) | Done |

---

## P2b — Product pivot (gentle alarm + Word Gym)

| # | Task | Status |
|---|------|--------|
| 23 | New alarm flow: reveal → learn → one MCQ → dismiss | Done |
| 24 | Word Gym screen/tab (3-round puzzle on `gymRounds`, `completeGym`) | Done |
| 25 | Web alarm path on `fetchAlarmWords` + morning task UI | Done |

**P2b is complete.**

---

## P3 — Nice to have / post-launch

| # | Task | Status |
|---|------|--------|
| 16 | Ad SDK integration (replace mock Huel card) | Not started — `screenAd` in `index.html` is explicitly a hardcoded mock |
| 17 | Coin shop + thematic word packs | Not started |
| 18 | PWA scheduled wake-up alarms | **Confirmed still not real** — `sw.js` has no `push`/`showNotification` handling; `enableNotifications()` only requests permission |
| 19 | Night mode on mobile | Done — all screens use adaptive `useTheme()` |
| 20 | Reach 100 words | Done (395) |
| 21 | Analytics + crash reporting | Not started |
| 22 | Remove `ProgressDebugPanel` once streak logic verified on device | Dev only |
| 26 | Spaced repetition in Word Gym | Not started |
| 27 | Snooze | Not started |
| 28 | Scale word library to 365+ | Done (395 words) |
| 29 | Wire Gold calendar toggle to auth/subscription | **Done on mobile** (real entitlement check); web remains a local preview toggle by design |
| 30 | Cloud progress sync via Supabase Auth | Scaffolded (`user_word_progress` exists); not confirmed wired end-to-end from mobile UI |

### Word packs — monetisation model (planned, not built)

All 395 words in `zazu-words.json` are `tier: free` today. **Zazu Gold** (subscription) covers full word history + Word Gym access — this part is real and coded (mobile), pending config (#39) and the RLS fix (#37).

### Snooze (#27)

Not built. Success screen shows a "+10 No snooze" coin line, but `completeWord` always passes `noSnooze: true`. Design when implemented: reschedule 5–10 min, no +10 bonus if snoozed, cap one snooze/morning.

---

## Score impact estimate

| Milestone | Likely overall score |
|-----------|---------------------|
| After P0 | ~74 |
| After P1 code | ~79 |
| After P2 web/CI + morning-task backend | ~83 |
| After 395 words + Vercel + gentle alarm | ~88 |
| Round 8 (claimed, not independently verified) | ~93 |
| **Round 9 (ground-truth re-audit, current)** | **~78** |
| After P2 Critical (#37–40) fixed | ~85+ |
| After device verification (P1 #9) + tests (#41) | ~90+ |
| After word packs + coin shop | ~92+ |

Revenue estimates: see [AUDIT.md](AUDIT.md). Current realistic revenue: **£0** (RevenueCat code complete but unconfigured; no store listing live).

---

## Suggested next session

1. ~~Fix the paywall bypass~~ — **done**, `006_lock_remaining_premium_rls.sql` shipped.
2. ~~Add mobile nav~~ — **done**, Settings + Calendar icons on Home header.
3. **Configure RevenueCat:** populate `mobile/.env`, set up store products, run one sandbox purchase end-to-end.
4. **P1 dev build:** `eas login` → `eas build --profile development --platform android` → install APK (see [mobile/BUILD.md](mobile/BUILD.md)) → P1 #9 device verification.
5. **Add minimal tests:** webhook signature verification + RLS policy checks first, since those are the paywall's actual enforcement layer.
6. **Resolve the in-flight icon migration** (`phosphor-react-native` vs `@expo/vector-icons`) — commit or revert, don't leave both mid-flight.

For copy and voice on any new UI text, see [writing-rules.md](writing-rules.md).
