# Zazu roadmap

Priority list for Zazu development. Rewritten 2026-07-31 after a ground-truth re-audit (every item below was re-verified against the actual code, not carried forward from prior docs). Updated 2026-08-07 with a feature audit of an old, never-committed laptop copy (Pack Shop, Coin Shop, Gym Modes, Literary Gym Round, Word Reroll, Snooze, FloatingTabBar, AppIcon fallback) — see the new subsection under P3 and [ROADMAP_SIMPLE.md](ROADMAP_SIMPLE.md) for the short version.

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
| Automated tests | **Started 2026-08-07** — Vitest at root, 46 tests: webhook signature verification + entitlement-decision logic (`supabase/functions/revenuecat-webhook/logic.test.ts`), and a structural RLS-policy regression test (`tests/rls-policies.test.ts`, see #41 below). Still no tests for mobile UI or web. |
| CI coverage | `.github/workflows/ci.yml` runs `seed:dry`, `words:morning-tasks:check`, root `tsc --noEmit`, `npm test`, and mobile `tsc --noEmit` — still no web build/lint, no mobile UI tests |

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
| 39 | **Verify RevenueCat end-to-end** — `mobile/.env` exists and is populated (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`/`ANDROID_KEY` set to RevenueCat's public test key, matching `.env.example`), so `isRevenueCatConfigured()` passes and the purchase flow (`SubscriptionContext.tsx`, `react-native-purchases@^10.4.4`) is wired and mounted in `app/_layout.tsx`. **Not yet proven**: no evidence (code or git history) a sandbox purchase has ever been run end-to-end, and the test key being present doesn't confirm store products/offerings are configured on RevenueCat's side. Run one real sandbox purchase to confirm. | Keys configured; **sandbox purchase unverified** |
| 40 | **Fix `BILLING_ISSUE` webhook handling** — `supabase/functions/revenuecat-webhook/index.ts` correctly upgrades to `tier: 'gold'` on `INITIAL_PURCHASE`/`RENEWAL` and downgrades to `'free'` on `CANCELLATION`/`EXPIRATION` (with HMAC signature verification), but `BILLING_ISSUE` only logs — lapsed billing never downgrades a user. Add a grace period + eventual downgrade. | **Done** — `BILLING_ISSUE` now reads `grace_period_expiration_at_ms`; within the grace window it writes that timestamp to `gold_until` (existing RLS `gold_until > now()` checks make access self-expire, no cron/follow-up event needed), otherwise downgrades to `free` immediately |

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
| 41 | Add automated tests — start with webhook signature verification and RLS policy checks (the actual paywall enforcement layer) | **Done (partially)** — `supabase/functions/revenuecat-webhook/logic.ts` extracted from the Deno entrypoint (pure, no Deno/URL imports) with 23 Vitest tests covering signature verification (valid/tampered/wrong-secret/stale-timestamp/malformed-header) and the event→entitlement decision for every RevenueCat event type including both `BILLING_ISSUE` grace-period branches. RLS coverage (`tests/rls-policies.test.ts`, 23 tests) is **structural, not a live-database integration test** — no Docker/Supabase CLI in this environment, so it replays every migration's `create policy`/`drop policy` statement in order and asserts the *final* policy text requires `user_entitlements`/`gold`/`gold_until`, catching regressions of the exact bug #37 fixed. Verified it actually catches that bug by simulating the pre-#37 policy text. True integration testing (real Postgres, different JWT roles) still needs a Docker/Supabase-CLI environment. |
| 42 | Fix `zazu-words.schema.json` — stale (says "Target: 100 words," missing `roots`/`introEtymology`/`morningTask` fields), unused by any script today, so harmless but misleading | Not started |
| 43 | Reconcile git remote / deploy pipeline — `git remote -v` is empty despite README describing GitHub→Vercel auto-deploy; confirm how deploys actually happen today | Not started |
| 44 | Land or drop the in-flight icon migration — `mobile/package.json` has uncommitted additions of `phosphor-react-native` + `react-native-svg` alongside the existing `@expo/vector-icons`; two icon systems present mid-migration | **Done** — all 11 files migrated to `phosphor-react-native`, `@expo/vector-icons` removed from `package.json`, committed in `95306b0` |
| 45 | Demo-alarm exit affordance — `AlarmFlowContext.startFlow` takes `{ isDemo?: boolean }`; Home's "Try the alarm" preview sets it, and `AlarmScreen`/`LearnScreen`/`MorningTaskScreen` show a close `IconButton` only when `isDemo` is true, calling `clearFlow()` + `router.replace('/')`. Real (non-demo) alarms stay locked with no exit, by design. | **Done** — `PuzzleScreen.tsx`'s unconditional exit button is correct as-is: `/puzzle` is only ever reached via voluntary `startGymFlow` (Word Gym tab, calendar), never via `startFlow`'s alarm path, so `isDemo` is never in scope there. Confirmed no gap. |

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
| 17 | Coin shop + thematic word packs | **Audited 2026-08-07** — see below. UI exists in an old copy but has no data behind it; recommend rebuilding data-first, not porting the screen |
| 18 | PWA scheduled wake-up alarms | **Confirmed still not real** — `sw.js` has no `push`/`showNotification` handling; `enableNotifications()` only requests permission |
| 19 | Night mode on mobile | Done — all screens use adaptive `useTheme()` |
| 20 | Reach 100 words | Done (395) |
| 21 | Analytics + crash reporting | Not started |
| 22 | Remove `ProgressDebugPanel` once streak logic verified on device | Dev only |
| 26 | Spaced repetition in Word Gym (review queue, roots drill, usage lab) | **Audited 2026-08-07** — highest-value recoverable feature, see below. Not started in this repo |
| 27 | Snooze | Not started — design spec below; an old-copy hook exists but is an empty re-export, nothing to port |
| 28 | Scale word library to 365+ | Done (395 words) |
| 29 | Wire Gold calendar toggle to auth/subscription | **Done on mobile** (real entitlement check); web remains a local preview toggle by design |
| 30 | Cloud progress sync via Supabase Auth | Scaffolded (`user_word_progress` exists); not confirmed wired end-to-end from mobile UI |
| 46 | Word reroll (pick a different alarm word once/day) | Not started — new idea surfaced by old-copy audit, not previously tracked. Low priority |
| 47 | Native floating tab bar (blur pill on native, matching the existing web pill) | **Done** — `mobile/components/ui/FloatingTabBar.tsx` ported from the old copy, `AppIcon` swapped for direct `phosphor-react-native` imports (`HouseIcon`/`BarbellIcon`) to match this repo's icon pattern. Now floating on **all** platforms, not just web, so `HomeScreen`/`GymScreen` footer padding was switched from a `Platform.OS === 'web' ? 72 : 0` hack to `floatingTabBarClearance(insets.bottom)`, applied universally. Fixed one bug found during porting: the old copy used `accessibilityRole="button"` on each tab, which is both an accessibility regression (screen readers wouldn't announce it as a tab) and broke this repo's own Playwright screenshot script (`getByRole('tab', ...)` timed out) — changed to `accessibilityRole="tab"`. Verified visually via `scripts/capture-screenshots.mjs` in light + dark on web; `tsc --noEmit` passes. |

### Word packs, Gym Modes & related — old-copy audit (2026-08-07)

A never-committed laptop copy of this repo (given to Claude via `C:\Users\lewis\Downloads\Zazu (1)`) turned out to contain a chunk of unfinished work: a Pack Shop, a Coin Shop, new Word Gym practice modes, word reroll, and snooze. None of it compiles as-is — every screen imports from a root-level `lib/` folder (`word-packs.ts`, `pack-access.ts`, `gym-modes.ts`, `gym-session.ts`, `useSnooze.ts`, `alarm-word-reroll.ts`, `literary-word-types.ts`) that is missing from disk in *every* copy checked (both Downloads extractions, that repo's own git history and stash, both zip archives) — it was apparently deleted from the laptop before either copy was made and never committed. So this is UI scaffolding with no working data layer, not a finished feature waiting to be merged. Full scored breakdown (UI quality / UX value / app fit / import. / difficulty) was done feature-by-feature; verdicts:

| Feature | Verdict | Why |
|---|---|---|
| **Gym Modes** — review queue, roots drill, usage lab | **Rewrite** | Highest value: operates on words you already have (no missing content, unlike packs), directly closes roadmap #26. Needs `gym-modes.ts` rebuilt + `useProgress`/`useAlarmFlow` extended with session tracking. |
| **Literary Gym Round** (quote-completion, author attribution) | **Rewrite** | Second-highest value. Unlike the old copy, **you already have the real data** — `THEMATIC PACKS/zazu-words-literary.json` (270 words, matches its own schema) is sitting uncommitted in this repo. Needs `gym-session.ts` rebuilt + that JSON seeded into Supabase; the screens themselves only touch libs you already have (`feedback.ts`, `alarm-sound.ts`, `puzzle-utils.ts`). |
| **FloatingTabBar** (native blur pill tab bar) | **Ported — done (#47)** | Only dependency was `AppIcon` (see below) — swapped for direct `phosphor-react-native` imports. No backend/data dependency. Cheapest real win found, and it was: one bug fixed in the port (`accessibilityRole` was `"button"`, needed `"tab"`), verified visually in both themes. |
| **Snooze** | **Rewrite from spec** | The old copy's hook is an 8-line empty re-export — nothing to recover. Build fresh from the spec already below. |
| **Word reroll** | **Rewrite, low priority** | Not previously tracked; mild tension with "one word, no choice" product framing. Needs a new persisted "reroll used today" state. |
| **Pack Shop** (8 non-literary packs: Architecture, Eponym, Games, Geography, Law, Music, Mythology, Science) | **Rewrite, data-first** | Zero word content exists for any of these 8 — porting the screen means porting an empty storefront. Each pack is a Literary-pack-sized content job (150 words × full schema) on its own; treat as backlog, not a sprint. |
| **Coin Shop** | **Drop for now** | Screen is a literal `PLACEHOLDER_ITEMS` list with "more coming soon" copy — no missing dependency, but nothing to actually ship. Revisit once one real spendable item (streak freeze) exists. |
| **AppIcon fallback** (Phosphor + `@expo/vector-icons` runtime fallback) | **Drop** | Actively conflicts with #44 (icon migration), which already removed `@expo/vector-icons` from `package.json`. Resurrecting this means re-adding a dependency you deliberately dropped. |

Safe build order: FloatingTabBar → Gym Modes → Literary Gym Round → Snooze. Pack Shop (8 packs) and Word Reroll are backlog. Coin Shop and AppIcon fallback are not being pursued.

### Snooze (#27) — design spec

Not built. Success screen shows a "+10 No snooze" coin line, but `completeWord` always passes `noSnooze: true`. Design when implemented: reschedule 5–10 min, no +10 bonus if snoozed, cap one snooze/morning.

---

## Uncommitted work in this repo (as of 2026-08-07)

| What | Status |
|---|---|
| `WORDS.md` + `zazu-words.json` definition/spelling fixes (15 definitions, 3 POS fields) | **Done locally, matches Supabase** — a manual SQL pass was run directly against the live `words` table; this repo's seed source and doc were updated to match, so a future `seed-words.mjs` run won't regress them. Not yet committed. |
| `scripts/audit-word-bank.mjs` | New UK-spelling + definition-clarity auditor for the Supabase word bank. Not yet committed. |
| `THEMATIC PACKS/` folder | Only `zazu-words-literary.json` (270 words) + its schema are real, generated data. `WORDS-ALL.md` in the same folder also lists word names for 9 more packs, but those are name lists only — no schema, no definitions, no data files. Not yet committed. |

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
3. ~~Resolve the in-flight icon migration~~ — **done**, `phosphor-react-native` fully swapped in, committed in `95306b0`.
4. ~~Demo-alarm exit affordance (#45)~~ — **done**, confirmed no gap; nothing was left uncommitted.
5. ~~Commit the pending word-bank sync~~ — **done**, `WORDS.md`/`zazu-words.json`/`audit-word-bank.mjs`/`THEMATIC PACKS/` committed (`97478e6`).
6. **Configure RevenueCat:** populate `mobile/.env`, set up store products, run one sandbox purchase end-to-end. *(Needs your App Store Connect / Play Console / RevenueCat dashboard access — not something I can do directly.)*
7. **P1 dev build:** `eas login` → `eas build --profile development --platform android` → install APK (see [mobile/BUILD.md](mobile/BUILD.md)) → P1 #9 device verification. *(Needs your Expo account + a physical device.)*
8. ~~Add minimal tests: webhook signature verification + RLS policy checks~~ — **done**, see #41. RLS coverage is structural, not a live-Postgres integration test — no Docker/Supabase CLI available here.
9. ~~Port FloatingTabBar (#47)~~ — **done**, see #47.
10. **Rebuild Gym Modes (#26):** review queue, roots drill, usage lab — highest-value recoverable feature, works on words you already have. *(Code-only — can do end-to-end.)*
11. **Wire up the Literary pack + Literary Gym Round:** seed `THEMATIC PACKS/zazu-words-literary.json` into Supabase, rebuild `lib/gym-session.ts`, port `GymLiteraryRoundScreen`/`GymMcqSessionScreen`. *(Code + a Supabase seed run.)*
12. **Build Snooze (#27)** from the spec above once the higher-priority items land. *(Code-only.)*

For copy and voice on any new UI text, see [writing-rules.md](writing-rules.md).
