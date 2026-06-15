# Zazu roadmap

Priority list for Zazu development. Last updated after P2b alarm flow and adaptive theme (June 2025).

**Overall score: ~88/100** · Vision-aligned product: ~78/100 · Details in [AUDIT.md](AUDIT.md)

---

## Priority overview

| Tier | Goal | Status |
|------|------|--------|
| **P0** | Daily-usable mobile alarm + puzzle flow | Complete |
| **P1** | TestFlight-ready foundations (notifications, persistence, audio) | Code complete; **dev build + device sign-off open** |
| **P2** | Public-launch polish (web parity, CI, backend) | Mostly complete |
| **P2b** | Product pivot (gentle alarm + Word Gym) | **Partial — alarm flow shipped** |
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

**Already in the codebase:** `expo-notifications`, `expo-haptics`, local alarm scheduling (`lib/alarm-notifications.ts`), permission requests. The dev build unlocks testing them on a physical device.

| # | Task | Status |
|---|------|--------|
| 31 | Expo account + `eas login` (from `mobile/`) | Not started |
| 32 | Install `expo-dev-client` | Not started |
| 33 | `eas build:configure` + `mobile/eas.json` development profile (APK, internal) | Not started |
| 34 | `eas build --profile development --platform android` → install APK on phone | Not started |
| 35 | Device verification (P1 #9) on dev build: notifications, audio, persistence, haptics | Not started |

#### Step-by-step (all commands from `mobile/`)

**1. Prepare environment**

```bash
cd mobile
npm install -g eas-cli    # or: npx eas-cli …
eas login
eas build:configure       # select Android
```

**2. Install development client**

```bash
npx expo install expo-dev-client
```

**3. Development profile in `mobile/eas.json`**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**4. Cloud build and install**

```bash
eas build --profile development --platform android
```

When the build finishes, open the download URL on your phone, install the APK (allow unknown sources / Play Protect “Install anyway” if prompted).

**5. Daily dev workflow**

```bash
npx expo start --dev-client
```

Open **Zazu Dev** on the phone → scan QR code. Code changes on your laptop reload in the installed app.

**Partial testing without a dev build:** deploy `index.html` to Vercel for stable phone browser testing (UI + persistence). Does not test native notifications.

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
4. Complete morning task → haptics + streak/coins update on home
5. Use **Progress debug** panel to test streak date logic
6. Open **Calendar** → completed words appear; **Open in Word Gym** launches puzzle

---

## P2 — Should have for public launch

| # | Task | Status |
|---|------|--------|
| 10 | Extract shared game logic (`COPY`, puzzle engine, `mapWordRow` into `lib/`) | Not started |
| 11 | Supabase auth + Zazu Gold subscription (full calendar history, Word Gym) | Not started |
| 12 | Web persistence parity (`localStorage` in `index.html`) | Done |
| 13 | Accessibility on web puzzle (keyboard, ARIA, remove `user-scalable=no`) | Done |
| 14 | Error states (visible message when Supabase fetch fails) | Done (web); mobile still silent fallback |
| 15 | CI baseline (GitHub Actions: `tsc`, `seed:dry`, morning-task check) | Done |

### Also shipped with P2 (data + content)

| Task | Status |
|------|--------|
| Morning task schema (`002_morning_tasks_and_gym.sql`) | Done |
| `word_roots`, `word_morning_tasks`, distractor pool, seed pipeline | Done |
| Alarm vs Gym Supabase RPCs (`get_words_for_alarm`, `get_words_for_gym`) | Done |
| `user_word_progress` table (alarm vs gym timestamps) | Done |
| Batch import script (`import-word-batch.mjs`) | Done |
| Re-seed reliability (clear morning tasks before replacing roots) | Done |
| **395 words** + morning tasks synced to Supabase | Done |
| Mobile calendar screen (`/calendar`, free/Gold preview, word detail sheet) | Done |
| README and roadmap refresh (round 4) | Done |
| Gradual adaptive theme (30 min dusk/dawn, web + mobile) | Done |
| Gentle alarm flow (mobile + web) | Done |

### P2 still open

| Task | Status |
|------|--------|
| Mobile Supabase error banner (match web retry UX) | Not started |
| Update `zazu-words.schema.json` to match current JSON shape | Not started |
| Migrate home/calendar screens to `useTheme()` for full adaptive palette | Not started |

---

## P2b — Product pivot (gentle alarm + Word Gym)

These match the agreed UX. Alarm flow is live on web and mobile; Word Gym tab is still open.

| # | Task | Status |
|---|------|--------|
| 23 | New alarm flow: reveal → learn → one MCQ → dismiss | **Done** (mobile `/learn`, `/morning-task`; web learn + morning task screens) |
| 24 | Word Gym screen/tab (3-round puzzle on `gymRounds`, `completeGym`) | **Partial** — calendar deep link + `completeGym()` wired; no home Gym tab yet |
| 25 | Web alarm path on `fetchAlarmWords` + morning task UI | **Done** |

### Also shipped with P2b

| Task | Status |
|------|--------|
| `AlarmFlowContext` split: alarm session vs `gymSessionWord` | Done |
| Calendar “Open in Word Gym” → `startGymFlow()` + `/puzzle` | Done |
| `lib/morning-task.js` for browser MCQ builder | Done |
| Copy refresh (`learnSub`, morning task labels) | Done |

### P2b still open

| Task | Status |
|------|--------|
| Word Gym tab or entry point on home | Not started |
| Gym completion success screen (coins/mastery recap) | Not started |
| Wire `completeGym()` progress to calendar `gymCompleted` display | Not started |

### P2b dependencies (already in place)

- `morningTask` on every word in JSON and Supabase
- `get_morning_task_distractors()` RPC + 50-entry distractor pool
- `fetchAlarmWords()` / `fetchGymWords()` in `lib/supabase.ts`
- `completeGym()` in `useProgress.ts` (local; mirrors DB design)

---

## P3 — Nice to have / post-launch

| # | Task | Status |
|---|------|--------|
| 16 | Ad SDK integration (replace mock Huel card on web) | Not started |
| 17 | Coin shop + thematic word packs (see below) | Not started |
| 18 | PWA manifest + service worker for `index.html` | Not started |
| 19 | Night mode on mobile | **Partial** — gradual adaptive theme on alarm flow; home/calendar still static palette |
| 20 | Reach 100 words | Done |
| 21 | Analytics + crash reporting | Not started |
| 22 | Remove `ProgressDebugPanel` once streak logic verified on device | Dev only |
| 26 | Spaced repetition in Word Gym | Not started |
| 27 | Snooze (see note below) | Not started |
| 28 | Scale word library to 365+ (one word per calendar day) | **Done (395 words)** |
| 29 | Wire Gold calendar toggle to auth/subscription (currently local preview) | Not started |
| 30 | Cloud progress sync via Supabase Auth | Not started |

### Word packs — monetisation model (planned, not built)

**Decision:** Defer the old free/premium per-word split. All 395 words in `zazu-words.json` are `tier: free` for now.

**Planned model:** Thematic **word packs** unlocked with **gold coins** earned from morning alarms (not real-money IAP for individual packs in the first version).

| Pack theme (examples) | Notes |
|-------------------------|--------|
| Geography | Place names, landforms, travel vocabulary |
| Music | Instruments, genres, performance terms |
| (more TBD) | Science, food, literature, etc. |

**How it should work (design only):**

1. **Base library** stays free in the daily rotation (395 core words today).
2. **Packs** are optional add-ons: curated subsets tagged by theme, bought once with gold from the coin shop.
3. **Owned packs** add their words to the user's pool (alarm, calendar, Word Gym). Unowned pack words stay hidden or teased in the shop.
4. **Zazu Gold** (subscription) stays separate: full word history, Word Gym access, etc. Pack purchases use coins, not the Gold subscription.

**Future tasks when we build this:**

| Task | Status |
|------|--------|
| Pack metadata (id, name, theme, gold price, word ids) in JSON or Supabase | Not started |
| `user_owned_packs` (or equivalent) in progress/auth | Not started |
| Coin shop UI: browse packs, preview sample words, purchase with balance | Not started |
| Alarm/Gym word picker respects owned packs + free core library | Not started |
| Copy and art per pack theme (shop cards, unlock celebration) | Not started |

Related: P3 #17 (shop UI), P2 #11 (auth so purchases persist across devices).

### Snooze (#27)

Not built today. The success screen shows a **+10 “No snooze”** coin line, but `completeWord` always passes `noSnooze: true`, so the bonus is automatic with no snooze button.

**Design when implemented (post P2b #23):**

- Snooze reschedules the alarm (e.g. 5 or 10 minutes), chime returns, same word session.
- Snooze must not dismiss the alarm or skip the morning task.
- Completing after snooze: no **+10 no-snooze** coins (`completeWord(..., { noSnooze: false })`).
- Optional: cap snoozes per morning (e.g. once) so it stays a nudge, not a bypass.
- Wire on mobile + web alarm screens; track snooze count in progress if needed.

---

## Score impact estimate

| Milestone | Likely overall score |
|-----------|---------------------|
| After P0 | ~74 |
| After P1 code | ~79 |
| After P2 web/CI + morning-task backend | ~83 |
| **Current (395 words + calendar + gentle alarm flow)** | **~88** |
| After Word Gym tab + full theme on all screens (P2b #24) | ~90+ |
| After auth/paywall + device verified | ~92+ |
| After word packs + coin shop | ~94+ |

Revenue estimates (low / medium / high): see [AUDIT.md](AUDIT.md). Current realistic revenue: **£0** (pre-monetisation, pre-store).

---

## Suggested next session

1. **P1 dev build:** `eas login` → install `expo-dev-client` → configure `eas.json` → first Android development build → install on phone.
2. **P1 #9:** device verification on the dev build (notifications, audio, kill/reopen, haptics, new alarm flow).
3. **Optional:** deploy to Vercel for stable web-on-phone testing without tunnels.
4. **P2b #24:** Word Gym tab on home + gym success recap; wire `gymCompleted` in calendar.
5. **P2:** migrate home and calendar to `useTheme()` for full adaptive palette.

For copy and voice on any new UI text, see [writing-rules.md](writing-rules.md).
