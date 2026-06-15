# Zazu

Zazu is a vocabulary alarm clock. You set a morning alarm, wake up to a new word, and learn it before the day starts. The web prototype and Expo mobile app run the gentle alarm flow: **reveal → learn → one morning task → dismiss**. Word Gym (3-round puzzle) is available from the calendar. The word library (395 words) lives in `zazu-words.json` and syncs to Supabase.

**Status (round 5):** ~88/100 platform score · ~78/100 vision-aligned · See [AUDIT.md](AUDIT.md) and [ROADMAP.md](ROADMAP.md).

## What works today

| Surface | Built |
|---------|--------|
| **Web** (`zazu.html`) | Home, alarm, **learn**, **morning task**, mock ad, success; `fetchAlarmWords`; gradual light/dark theme; localStorage progress |
| **Mobile** (Expo) | Home, add alarm, alarm, **learn**, **morning task**, success, **calendar**, Word Gym puzzle; notifications; adaptive theme on alarm flow; AsyncStorage progress |
| **Content** | **395 words** (A–Z), morning tasks, gym rounds, distractor pool |
| **Backend** | Supabase with alarm/gym RPCs, roots, morning tasks, user progress schema |

**Not built yet:** dedicated Word Gym tab on home, auth, paywall, and coin shop.

## Tech stack

| Layer | Tools |
|-------|--------|
| Web prototype | `zazu.html`, vanilla JS, Supabase JS (CDN) |
| Mobile app | Expo 56, React Native, Expo Router, TypeScript |
| Backend | Supabase (Postgres, RLS, RPCs for alarm vs gym) |
| Content | `zazu-words.json` (395 words, all `tier: free` for now) |
| Tooling | Node.js scripts for import, seed, morning-task generation, config |

## Project structure

```
zazu/
├── zazu.html                 Web prototype (alarm, learn, morning task, ad, success)
├── zazu-words.json           Master word library (395 words)
├── morning-distractors.json  Shared wrong-answer pool for morning tasks
├── WORDS.md                  Alphabetical index of all words
├── lib/
│   ├── supabase.ts           Shared Supabase client (alarm + gym fetch)
│   ├── useProgress.ts        Streak, coins, learned words (AsyncStorage)
│   ├── useAlarms.ts          Alarm list + notification sync
│   ├── morning-task.ts       Morning task runtime helpers
│   ├── morning-task.js       Browser morning-task helper for zazu.html
│   ├── adaptive-theme.ts     Gradual light/dark theme (30 min dusk/dawn)
│   ├── adaptive-theme.js     Browser theme helper for zazu.html
│   ├── calendar-utils.ts     Calendar grid and word history helpers
│   ├── demo-alarm-words.ts   Offline alarm fallback (3 words)
│   ├── demo-words.ts         Offline gym fallback (3 words)
│   └── words-api.js          Browser loader for zazu.html
├── mobile/                   Expo app (alarm flow, calendar, Word Gym puzzle)
├── supabase/
│   ├── migrations/           001 schema + 002 morning tasks and gym
│   └── README.md             Setup, RPCs, re-seeding
├── scripts/
│   ├── seed-words.mjs        Upload words to Supabase
│   ├── import-word-batch.mjs Merge batch JSON into zazu-words.json
│   ├── generate-morning-tasks.mjs
│   ├── generate-public-config.mjs
│   └── normalize-word-copy.mjs
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

3. Open `zazu.html` in your browser.

The page loads alarm words from Supabase on start (`get_words_for_alarm`). If the fetch fails, it falls back to three hardcoded demo words (Matutinal, Lucid, Ephemeral). Use **Try the alarm** to run through learn → morning task → success.

Theme shifts gradually between light and dark over 30 minutes at dusk (20:30–21:00) and dawn (5:30–6:00). Use the theme button to override.

If the browser blocks local file requests, serve the folder with any static server and open `zazu.html` from there.

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
| `/add-alarm` | Set time and label; schedules notification |
| `/alarm` | Wake screen with chime |
| `/learn` | Word, definition, and etymology |
| `/morning-task` | One MCQ to dismiss the alarm |
| `/success` | Streak and coin recap |
| `/puzzle` | Word Gym — 3-round matching game (calendar entry) |
| `/calendar` | Word history (free vs Gold preview toggle) |

The mobile app imports shared code from `lib/` via Metro. Words come from Supabase (`get_words_for_alarm` / `get_words_for_gym`) with demo fallbacks when offline or unconfigured.

## npm scripts (root)

| Script | Purpose |
|--------|---------|
| `npm run config` | Generate `public/config.js` and `mobile/.env` from `.env` |
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
