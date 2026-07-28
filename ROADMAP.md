# Zazu roadmap

Priority list for Zazu development. Last updated after web calendar, settings, PWA, and full web parity (June 2026).

**Overall score: ~93/100** · Vision-aligned product: ~85/100 · Details in [AUDIT.md](AUDIT.md)

---

## Priority overview

| Tier | Goal | Status |
|------|------|--------|
| **P0** | Daily-usable mobile alarm + puzzle flow | Complete |
| **P1** | TestFlight-ready foundations (notifications, persistence, audio, UI polish) | Code complete; **dev build + device sign-off open** |
| **P2** | Public-launch polish (web parity, CI, backend, Vercel, UI) | **Web parity complete**; auth wiring open on mobile |
| **P2b** | Product pivot (gentle alarm + Word Gym) | **Done** |
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
| 5 | Real alarm scheduling (`expo-notifications`, daily notifications) | Done |
| 6 | Alarm persistence (alarm list in AsyncStorage via `useAlarms`) | Done |
| 7 | Audio + haptics (`expo-av` chime, `expo-haptics` on puzzle/success) | Done |
| 8 | Expo branding pass (`app.json`: Zazu name, slug, dawn splash) | Done |
| 9 | Device verification (notifications, audio, kill/reopen persistence) | **Blocked on Expo Go — use P1 dev build (#31–35)** |

### P1 UI polish (pre-push gate — shipped `a82a724`)

| Task | Status |
|------|--------|
| Loading spinner on WOTD card + learn screen word display | **Done** |
| Morning task correct-answer animation + 500ms confirm pause | **Done** |
| WOTD error banner + retry when Supabase fetch fails | **Done** |

### Also shipped with P1

| Task | Status |
|------|--------|
| Add alarm screen (`/add-alarm`, time + label, schedules notification) | Done |
| Notification tap → opens alarm flow with today's word | Done |
| Alarm chime asset (`mobile/assets/sounds/alarm-chime.wav`) | Done |
| Progress debug panel (streak date testing, `__DEV__` only) | Done |

**P1 code is complete.** Only #9 needs a real device. **Expo Go from the Play Store (SDK 54) cannot run this project (SDK 56).** Use an **EAS development build** instead (see below).

### P1 — EAS development build (“Zazu Dev”)

Replaces Play Store Expo Go. One custom APK on your phone with full local notifications, haptics, and SDK 56 support. ~20 minutes one-time setup, then `npx expo start --dev-client` daily.

**Why not Expo Go?** SDK 56 is not on the Play Store; sideloaded Expo Go APKs may fail to install. A dev build is your own signed app and matches what you ship.

**Already in the codebase:** `expo-notifications`, `expo-haptics`, local alarm scheduling (`lib/alarm-notifications.ts`), permission requests, **`mobile/eas.json`** development profile, **`mobile/BUILD.md`** step-by-step guide.

| # | Task | Status |
|---|------|--------|
| 31 | Expo account + `eas login` (from `mobile/`) | Not started |
| 32 | Install `expo-dev-client` | Not started |
| 33 | `eas build:configure` + `mobile/eas.json` development profile (APK, internal) | **Done** (`eas.json` committed) |
| 34 | `eas build --profile development --platform android` → install APK on phone | Not started |
| 35 | Device verification (P1 #9) on dev build: notifications, audio, persistence, haptics | Not started |

See [mobile/BUILD.md](mobile/BUILD.md) for the full workflow.

**Partial testing without a dev build:** use the **Vercel deployment** on your phone — stable URL, gentle alarm flow, streak/coins persist in the browser. Does **not** replace a real alarm (no scheduled notifications on web).

### Verify without a phone

```bash
cd mobile
npx tsc --noEmit    # typecheck
npm run web         # full flow + web chimes + add alarm + calendar
```

### Verify on device (at home)

1. Toggle alarms, kill app, reopen (state should persist)
2. Enable an alarm, confirm notification permission prompt
3. Tap notification → should open alarm screen
4. Complete morning task → haptics + streak/coins update on home; correct answer shows scale animation before Dismiss
5. Use **Progress debug** panel to test streak date logic
6. Open **Calendar** → completed words appear; **Open in Word Gym** launches puzzle
7. Disable Supabase (or use offline) → home shows error banner with **Try again**; demo word still visible

---

## P2 — Should have for public launch

| # | Task | Status |
|---|------|--------|
| 10 | Extract shared game logic (`COPY`, puzzle engine, `mapWordRow` into `lib/`) | Not started |
| 11 | Supabase auth + Zazu Gold subscription (full calendar history, Word Gym) | **Scaffolded** — providers not mounted; migration 003 ready |
| 12 | Web progress persistence (`localStorage`: streak, coins, learned words) | Done |
| 13 | Accessibility on web puzzle (keyboard, ARIA, remove `user-scalable=no`) | Done |
| 14 | Error states (visible message when Supabase fetch fails) | **Done** (web + mobile) |
| 15 | CI baseline (GitHub Actions: `tsc`, `seed:dry`, morning-task check) | Done |
| 36 | **Finalise mobile UI for all pages** — match `index.html` per screen | **Done** (`a82a724`) |

### Also shipped with P2 (data + content)

| Task | Status |
|------|--------|
| Morning task schema (`002_morning_tasks_and_gym.sql`) | Done |
| `word_roots`, `word_morning_tasks`, distractor pool, seed pipeline | Done |
| Alarm vs Gym Supabase RPCs (`get_words_for_alarm`, `get_words_for_gym`) | Done |
| `user_word_progress` table (alarm vs gym timestamps) | Done |
| `user_entitlements` table (`003_user_entitlements.sql`) | Done (migration ready; run in Supabase) |
| Batch import script (`import-word-batch.mjs`) | Done |
| Re-seed reliability (clear morning tasks before replacing roots) | Done |
| **395 words** + morning tasks synced to Supabase | Done |
| Mobile calendar screen (`/calendar`, free/Gold preview, word detail sheet) | Done |
| Gradual adaptive theme (30 min dusk/dawn, web + mobile) | Done |
| Mobile home screen matches `index.html` prototype (light + dark) | Done |
| **All mobile screens** prototype-aligned (alarm, gym, onboarding, settings, gold, ad) | **Done** |
| Design system doc + full screenshot set (`New SS/`, `DESIGN_SYSTEM.md`) | Done |
| Gentle alarm flow (mobile + web) | Done |
| Vercel static deploy (`vercel.json`, `dist/` build, GitHub auto-deploy) | Done |
| Auth/IAP scaffolding (`AuthContext`, `SubscriptionContext`, RevenueCat, progress sync) | Done (unwired) |
| **Web Word Gym tab** + floating pill nav | **Done** |
| **Web alarm list persistence** (`lib/alarms-web.js`) | **Done** |
| **Web calendar** (history, Gold preview, word detail sheet) | **Done** |
| **Web settings** (notifications toggle, theme, guest account) | **Done** |
| **PWA** manifest + service worker (install + offline shell) | **Done** |

### P2 still open

| # | Task | Status |
|---|------|--------|
| — | Wire `AuthProvider` + `SubscriptionProvider` in `_layout.tsx` | Not started |
| — | Run migration `003_user_entitlements.sql` in Supabase | Not started |
| — | **Mobile** home navigation to calendar + settings | Not started |
| — | Connect calendar Gold toggle to real entitlements (web + mobile) | Not started |
| — | Web **scheduled** morning alarms (PWA notification scheduling) | Not started |
| — | Update `zazu-words.schema.json` to match current JSON shape | Not started |

---

## P2b — Product pivot (gentle alarm + Word Gym)

These match the agreed UX. Alarm flow and Word Gym are live on web and mobile.

| # | Task | Status |
|---|------|--------|
| 23 | New alarm flow: reveal → learn → one MCQ → dismiss | **Done** |
| 24 | Word Gym screen/tab (3-round puzzle on `gymRounds`, `completeGym`) | **Done** |
| 25 | Web alarm path on `fetchAlarmWords` + morning task UI | **Done** |

### Also shipped with P2b

| Task | Status |
|------|--------|
| `AlarmFlowContext` split: alarm session vs `gymSessionWord` | Done |
| Calendar “Open in Word Gym” → `startGymFlow()` + `/puzzle` | Done |
| Mock ad screen on gym path (`/ad`) | Done |
| Word Gym tab (`/(tabs)/gym`) + `/gym-success` recap | Done |
| `gymCompletedAt` in progress → calendar gym icon | Done |

---

## P3 — Nice to have / post-launch

| # | Task | Status |
|---|------|--------|
| 16 | Ad SDK integration (replace mock Huel card) | Not started |
| 17 | Coin shop + thematic word packs | Not started |
| 18 | PWA manifest + service worker + browser notifications | **Partial** — manifest + SW + install done; scheduled wake-up alarms not built |
| 19 | Night mode on mobile | **Done** — all screens use adaptive `useTheme()` |
| 20 | Reach 100 words | Done |
| 21 | Analytics + crash reporting | Not started |
| 22 | Remove `ProgressDebugPanel` once streak logic verified on device | Dev only |
| 26 | Spaced repetition in Word Gym | Not started |
| 27 | Snooze | Not started |
| 28 | Scale word library to 365+ | **Done (395 words)** |
| 29 | Wire Gold calendar toggle to auth/subscription | Not started (local preview only) |
| 30 | Cloud progress sync via Supabase Auth | Not started (schema + sync code scaffolded) |

### Word packs — monetisation model (planned, not built)

**Decision:** Defer the old free/premium per-word split. All 395 words in `zazu-words.json` are `tier: free` for now.

**Planned model:** Thematic **word packs** unlocked with **gold coins** earned from morning alarms.

| Pack theme (examples) | Notes |
|-------------------------|--------|
| Geography | Place names, landforms, travel vocabulary |
| Music | Instruments, genres, performance terms |
| (more TBD) | Science, food, literature, etc. |

**Zazu Gold** (subscription) stays separate: full word history, Word Gym access, etc.

Related: P3 #17 (shop UI), P2 #11 (auth so purchases persist across devices).

### Snooze (#27)

Not built today. The success screen shows a **+10 “No snooze”** coin line, but `completeWord` always passes `noSnooze: true`.

**Design when implemented:** Snooze reschedules the alarm (e.g. 5–10 min), same word session, no +10 coin bonus if snoozed, optional cap of one snooze per morning.

---

## Score impact estimate

| Milestone | Likely overall score |
|-----------|---------------------|
| After P0 | ~74 |
| After P1 code | ~79 |
| After P2 web/CI + morning-task backend | ~83 |
| After 395 words + Vercel + gentle alarm | ~88 |
| **Current (full web parity + PWA)** | **~93** |
| After auth wired + device verified (P1 #9) | ~94+ |
| After auth/paywall live + device verified | ~94+ |
| After word packs + coin shop | ~95+ |

Revenue estimates (low / medium / high): see [AUDIT.md](AUDIT.md). Current realistic revenue: **£0** (pre-monetisation, pre-store).

---

## Suggested next session

1. **P1 dev build:** `eas login` → `eas build --profile development --platform android` → install APK (see [mobile/BUILD.md](mobile/BUILD.md)).
2. **P1 #9:** device verification on dev build.
3. **Wire auth:** mount providers in `_layout.tsx`; run migration 003.
4. **Mobile home nav:** calendar + settings buttons on `HomeHeader`.
5. **Optional:** web scheduled alarm notifications via Service Worker (when API available).

For copy and voice on any new UI text, see [writing-rules.md](writing-rules.md).
