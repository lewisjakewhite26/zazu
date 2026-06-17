# Zazu

Zazu is a vocabulary alarm clock. You set a morning alarm, wake up to a new word, and learn it before the day starts. The web prototype and Expo mobile app run the gentle alarm flow: **reveal → learn → one morning task → dismiss**. Word Gym (3-round puzzle) is available from the gym tab and calendar. The word library (395 words) lives in `zazu-words.json` and syncs to Supabase.

**Status (round 8):** ~93/100 platform score · ~85/100 vision-aligned · See [AUDIT.md](AUDIT.md), [ROADMAP.md](ROADMAP.md), and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## What works today

| Surface | Built |
|---------|--------|
| **Web** (`index.html`) | Home + **Word Gym tab**, alarm flow, calendar, settings, progress in `localStorage`, alarm list persistence, WOTD error banner, **PWA install + offline shell** |
| **Mobile** (Expo) | All screens prototype-aligned; Word Gym tab, calendar, settings, onboarding, Gold; scheduled notifications |
| **Content** | **395 words** (A–Z), morning tasks, gym rounds, distractor pool |
| **Backend** | Supabase with alarm/gym RPCs, roots, morning tasks, user progress + entitlements schema |
| **Hosting** | Static web on **Vercel** (GitHub → auto-deploy) |

**Not built yet:** auth wiring on mobile, live IAP, coin shop, **web scheduled wake-up alarms**, cloud progress sync.

### Web vs mobile — what persists

| | Web (browser / Vercel / PWA) | Mobile (Expo) |
|--|------------------------------|---------------|
| Streak, coins, learned words | Yes (`localStorage`) | Yes (AsyncStorage) |
| Alarm times and on/off | Yes (`localStorage` — UI only, no scheduled wake-up) | Yes — notifications fire at set time |
| Calendar / Word Gym | Yes | Yes |
| Install to home screen | Yes (PWA) | App store / dev build |

Use **Vercel on your phone** to test the learn → morning task flow and streak saving. Use an **EAS dev build** (see [mobile/BUILD.md](mobile/BUILD.md)) for a real daily alarm on device.

## Tech stack

| Layer | Tools |
|-------|--------|
| Web prototype | `index.html`, vanilla JS, Supabase JS (CDN) |
| Mobile app | Expo 56, React Native, Expo Router, TypeScript |
| Backend | Supabase (Postgres, RLS, RPCs for alarm vs gym) |
| Content | `zazu-words.json` (395 words, all `tier: free` for now) |
| Tooling | Node.js scripts for import, seed, morning-task generation, config |

## Project structure

```
zazu/
├── index.html                Web prototype (alarm, learn, morning task, ad, success)
├── zazu-words.json           Master word library (395 words)
├── morning-distractors.json  Shared wrong-answer pool for morning tasks
├── WORDS.md                  Alphabetical index of all words
├── lib/
│   ├── supabase.ts           Shared Supabase client (alarm + gym fetch)
│   ├── entitlements.ts       Gold tier helpers
│   ├── entitlements-sync.ts  Sync entitlements from Supabase
│   ├── progress-storage.ts   Local progress persistence helpers
│   ├── progress-sync.ts      Cloud progress sync (scaffold)
│   ├── morning-task.ts       Morning task runtime helpers
│   ├── morning-task.js       Browser morning-task helper for index.html
│   ├── adaptive-theme.ts     Gradual light/dark theme (30 min dusk/dawn)
│   ├── adaptive-theme.js     Browser theme helper for index.html
│   ├── alarms-web.js         Browser alarm list (localStorage)
│   ├── settings-web.js       Browser settings (theme, notifications pref)
│   ├── calendar-web.js       Calendar entry builder for index.html
│   ├── web-screens.js        Calendar + settings UI for index.html
│   ├── progress-web.js       Browser streak/coins store (localStorage)
│   └── words-api.js          Browser loader for index.html
├── public/
│   ├── manifest.webmanifest  PWA manifest
│   ├── sw.js                 Service worker (offline shell)
│   ├── icons/                PWA icons
│   └── config.js             Generated Supabase keys (gitignored)
├── New SS/                   Mobile UI screenshots (light + dark flows)
├── screenshots/ui-audit/     Full UI audit captures (prototype + Expo web)
├── vercel.json               Vercel static deploy config
├── scripts/
│   ├── vercel-build.mjs      Copies index.html + lib/ into dist/ for Vercel
│   ├── capture-flow-screenshots.mjs   Capture alarm/gym flows (Expo web)
│   ├── capture-dark-screenshots.mjs   Re-capture dark mode screens
│   ├── capture-ui-screenshots.mjs     Audit all routes (desktop + mobile)
│   ├── seed-words.mjs        Upload words to Supabase
│   ├── import-word-batch.mjs Merge batch JSON into zazu-words.json
│   ├── generate-morning-tasks.mjs
│   ├── generate-public-config.mjs
│   └── normalize-word-copy.mjs
├── mobile/                   Expo app (see mobile/BUILD.md for EAS dev build)
├── supabase/
│   ├── migrations/           001 schema + 002 morning tasks + 003 entitlements
│   └── README.md             Setup, RPCs, re-seeding
├── writing-rules.md          Copy and voice guidelines
├── DESIGN_SYSTEM.md          Mobile design tokens (from index.html) + alignment status
├── AUDIT.md                  Product audit (latest scores and gaps)
├── ROADMAP.md                P0–P3 development priorities
└── .env.example              Environment variable template
```

## Content pipeline

Words are authored in batch JSON files or edited directly in `zazu-words.json`, then uploaded to Supabase:

```bash
# Optional: import a batch file into zazu-words.json
node scripts/import-word-batch.mjs scripts/batch-015.json

# Regenerate morning-task blocks (after editing rounds/roots)
npm run words:morning-tasks
npm run words:morning-tasks:check

# Validate and upload to Supabase
npm run seed:dry
npm run seed
```

CI runs `seed:dry`, morning-task validation, and mobile `tsc` on every push and PR.

## Run the web prototype locally

1. Install root dependencies:

```bash
npm install
```

2. Set up Supabase (see below) and generate the browser config:

```bash
npm run config
```

3. Open `index.html` in your browser (or serve the folder locally).

The page loads alarm words from Supabase on start. Alarms, streak, and settings persist in the browser. Use **Try the alarm** or the **Word Gym** tab. Open **📅** for calendar and **⚙️** for settings. Install as a PWA from your browser menu for offline access to the app shell.

**PWA:** `manifest.webmanifest` + `sw.js` are copied to `dist/` on Vercel build. Add to home screen on iOS/Android for standalone mode. Scheduled morning alarms still require the mobile app.

Theme shifts gradually between light and dark over 30 minutes at dusk (20:30–21:00) and dawn (5:30–6:00). Use the theme button to override.

### Deploy to Vercel

The web app is **static HTML** deployed from `dist/` after `npm run vercel-build`. Repo config in `vercel.json` sets framework to **Other** (not Next.js).

1. Connect [github.com/lewisjakewhite26/zazu](https://github.com/lewisjakewhite26/zazu) at [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** blank (repo root, not `mobile/`).
3. **Environment variables** (recommended): `SUPABASE_URL`, `SUPABASE_ANON_KEY` — build writes `dist/public/config.js` for the full 395-word library. Without them, the 3-word demo fallback still works.
4. Push to `main` — Vercel redeploys automatically.

**Phone testing:** open your `*.vercel.app` URL on your phone. Progress (streak/coins) persists per browser. Use **Try the alarm** to run the flow; scheduled alarms require the mobile app.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).

2. Copy the environment template and add your keys from **Dashboard → Settings → API**:

```bash
cp .env.example .env
```

Fill in these values in `.env`:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Publishable anon key (safe in the browser with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key for seed scripts only. Never commit this. |
| `VITE_SUPABASE_URL` | Same URL as above (used by `lib/supabase.ts`) |
| `VITE_SUPABASE_ANON_KEY` | Same anon key as above |

3. Run all three migrations in the Supabase SQL Editor, in order:

   - `supabase/migrations/001_create_words_schema.sql`
   - `supabase/migrations/002_morning_tasks_and_gym.sql`
   - `supabase/migrations/003_user_entitlements.sql`

4. Seed the word library:

```bash
npm run seed:dry   # validate zazu-words.json only
npm run seed       # upload all 395 words to Supabase
npm run config     # write public/config.js and mobile/.env
```

More detail on schema, RPCs, and re-seeding: [supabase/README.md](supabase/README.md).

## Run the mobile app (Expo)

1. Complete the Supabase setup above and run `npm run config` from the project root. This writes `mobile/.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

2. Install mobile dependencies:

```bash
cd mobile
npm install
```

3. Start Expo:

```bash
npm run start        # LAN QR code
npm run web          # browser preview
npm run android      # Android emulator or device
npm run ios          # iOS simulator or device
```

On a restrictive network, try `npm run start:tunnel` or connect via USB with `npm run android:usb` (requires `adb`).

**Physical device:** Expo Go from the Play Store does not support SDK 56. Use an EAS development build — see [mobile/BUILD.md](mobile/BUILD.md).

### Mobile routes

| Route | Purpose |
|-------|---------|
| `(tabs)/` | Home — word of the day, streak, coins, alarms |
| `(tabs)/gym` | Word Gym tab — today's gym word, mastery, start puzzle |
| `/add-alarm` | Set time and label; schedules notification |
| `/alarm` | Wake screen with chime |
| `/learn` | Word, definition, and etymology |
| `/morning-task` | One MCQ to dismiss the alarm |
| `/success` | Streak and coin recap |
| `/puzzle` | Word Gym — 3-round matching game |
| `/ad` | Mock ad screen (gym path) |
| `/gym-success` | Word Gym completion recap (coins + mastery) |
| `/calendar` | Word history (free vs Gold preview toggle) |
| `/settings` | Account, theme, notifications |
| `/gold` | Zazu Gold paywall |
| `/(onboarding)/welcome` | Welcome screen |
| `/(onboarding)/sign-in` | OAuth sign-in |
| `/(onboarding)/name` | Display name entry |

The mobile app imports shared code from `lib/` via Metro. Words come from Supabase (`get_words_for_alarm` / `get_words_for_gym`) with demo fallbacks when offline or unconfigured. A WOTD error banner appears on fetch failure with a **Try again** button.

**Theme:** All screens use `useTheme()` from `mobile/context/ThemeContext.tsx` — the same gradual dusk/dawn blend as the web prototype (30 min at 20:30–21:00 and 5:30–6:00).

## npm scripts (root)

| Script | Purpose |
|--------|---------|
| `npm run config` | Generate `public/config.js` and `mobile/.env` from `.env` |
| `npm run vercel-build` | Build static site into `dist/` (used by Vercel) |
| `npm run seed` | Upload `zazu-words.json` to Supabase |
| `npm run seed:dry` | Validate JSON and morning tasks without writing |
| `npm run words:morning-tasks` | Regenerate morning-task blocks in JSON |
| `npm run words:morning-tasks:check` | Validate morning tasks only |
| `npm run words:normalize` | Fix em dashes and round labels in word copy |

## Copy and voice

All user-facing text in this project follows [writing-rules.md](writing-rules.md). Read it before writing UI copy, marketing content, or app store descriptions.

## Roadmap and audit

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](ROADMAP.md) | P0–P3 priorities and what to build next |
| [AUDIT.md](AUDIT.md) | Round 8 scores, gaps, and revenue notes |

## Licence

Private project. See individual `LICENSE` files where present.
