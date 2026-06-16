# Zazu

Zazu is a vocabulary alarm clock. You set a morning alarm, wake up to a new word, and learn it before the day starts. The web prototype and Expo mobile app run the gentle alarm flow: **reveal → learn → one morning task → dismiss**. Word Gym (3-round puzzle) is available from the calendar. The word library (395 words) lives in `zazu-words.json` and syncs to Supabase.

**Status (round 5):** ~88/100 platform score · ~78/100 vision-aligned · See [AUDIT.md](AUDIT.md) and [ROADMAP.md](ROADMAP.md).

## What works today

| Surface | Built |
|---------|--------|
| **Web** (`index.html`) | Home, alarm demo, **learn**, **morning task**, mock ad, success; `fetchAlarmWords`; gradual light/dark theme; **progress** in `localStorage` (streak, coins, learned words) |
| **Mobile** (Expo) | Home + **Word Gym tab**, add alarm, alarm, **learn**, **morning task**, success, **calendar**; scheduled notifications; `completeGym()` + gym success screen; **adaptive theme** on home, calendar, gym tab, tab bar |
| **Content** | **395 words** (A–Z), morning tasks, gym rounds, distractor pool |
| **Backend** | Supabase with alarm/gym RPCs, roots, morning tasks, user progress schema |
| **Hosting** | Static web on **Vercel** (GitHub → auto-deploy) |

**Not built yet:** web alarm list persistence, real browser wake-up alarms (PWA), auth, paywall, and coin shop.

### Web vs mobile — what persists

| | Web (browser / Vercel) | Mobile (Expo) |
|--|------------------------|---------------|
| Streak, coins, learned words | Yes (`localStorage`, same origin) | Yes (AsyncStorage) |
| Alarm times and on/off | No — demo cards only; use **Try the alarm** | Yes — saved; notifications fire at set time |
| Calendar / Word Gym | No | Yes |

Use **Vercel on your phone** to test the learn → morning task flow and streak saving. Use the **mobile app** (eventually an EAS dev build) for a real daily alarm.

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
│   ├── useProgress.ts        Streak, coins, learned words (AsyncStorage)
│   ├── useAlarms.ts          Alarm list + notification sync
│   ├── morning-task.ts       Morning task runtime helpers
│   ├── morning-task.js       Browser morning-task helper for index.html
│   ├── adaptive-theme.ts     Gradual light/dark theme (30 min dusk/dawn)
│   ├── adaptive-theme.js     Browser theme helper for index.html
│   ├── progress-web.js       Browser streak/coins store (localStorage)
│   └── words-api.js          Browser loader for index.html
├── vercel.json               Vercel static deploy config
├── scripts/
│   ├── vercel-build.mjs      Copies index.html + lib/ into dist/ for Vercel
│   ├── seed-words.mjs        Upload words to Supabase
│   ├── import-word-batch.mjs Merge batch JSON into zazu-words.json
│   ├── generate-morning-tasks.mjs
│   ├── generate-public-config.mjs
│   └── normalize-word-copy.mjs
├── mobile/                   Expo app (alarm flow, calendar, Word Gym puzzle, ThemeProvider)
├── supabase/
│   ├── migrations/           001 schema + 002 morning tasks and gym
│   └── README.md             Setup, RPCs, re-seeding
├── public/
│   └── config.js             Generated Supabase keys for browser (gitignored)
├── writing-rules.md          Copy and voice guidelines
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

The page loads alarm words from Supabase on start (`get_words_for_alarm`). If the fetch fails, it falls back to three hardcoded demo words (Matutinal, Lucid, Ephemeral). Use **Try the alarm** to run through learn → morning task → success.

Theme shifts gradually between light and dark over 30 minutes at dusk (20:30–21:00) and dawn (5:30–6:00). Use the theme button to override.

If the browser blocks local file requests, serve the folder with any static server.

### Deploy to Vercel

The web app is **static HTML** deployed from `dist/` after `npm run vercel-build`. Repo config in `vercel.json` sets framework to **Other** (not Next.js).

1. Connect [github.com/lewisjakewhite26/zazu](https://github.com/lewisjakewhite26/zazu) at [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** blank (repo root, not `mobile/`).
3. **Environment variables** (recommended): `SUPABASE_URL`, `SUPABASE_ANON_KEY` — build writes `dist/public/config.js` for the full 395-word library. Without them, the 3-word demo fallback still works.
4. Push to `main` — Vercel redeploys automatically.

**Phone testing:** open your `*.vercel.app` URL on your phone. Progress (streak/coins) persists per browser. Use **Try the alarm** to run the flow; scheduled alarms require the mobile app.

If deployment 404s, check build logs show `npm run vercel-build` (not `next build`) and output directory `dist`.

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

3. Run both migrations in the Supabase SQL Editor, in order:

   - `supabase/migrations/001_create_words_schema.sql`
   - `supabase/migrations/002_morning_tasks_and_gym.sql`

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
| `/gym-success` | Word Gym completion recap (coins + mastery) |
| `/calendar` | Word history (free vs Gold preview toggle) |

The mobile app imports shared code from `lib/` via Metro. Words come from Supabase (`get_words_for_alarm` / `get_words_for_gym`) with demo fallbacks when offline or unconfigured.

**Theme:** Home, calendar, gym tab, and tab bar use `useTheme()` from `mobile/context/ThemeContext.tsx` — the same gradual dusk/dawn blend as the web prototype (30 min at 20:30–21:00 and 5:30–6:00). Alarm-flow screens still use a fixed palette for now.

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
| [AUDIT.md](AUDIT.md) | Round 5 scores, gaps, and revenue notes |

## Licence

Private project. See individual `LICENSE` files where present.
