# Zazu

Zazu is a vocabulary alarm clock. You set a morning alarm, wake up to a new word, and learn it before the day starts. The Expo mobile app runs the gentle alarm flow: **reveal → learn → one morning task → dismiss**. Word Gym (3-round puzzle) is available from the gym tab and calendar. The word library lives in `zazu-words.json` and syncs to Supabase.

**The mobile app (`mobile/`) is the only shipped product.** `landing/` is a separate Next.js marketing site (zazu.org.uk) with the Privacy Policy, Terms of Service, and Accessibility Statement required for App Store/Play Store submission. An earlier browser-based prototype of the app itself used to live at the repo root; it's been removed now that the mobile app is feature-complete and the prototype had no users, no store presence, and duplicated logic that had drifted out of sync with mobile.

See [AUDIT.md](AUDIT.md), [ROADMAP.md](ROADMAP.md), and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for status and priorities.

## What works today

| Surface | Built |
|---------|--------|
| **Mobile** (Expo) | Word Gym tab, calendar, settings, onboarding, Gold subscription, scheduled notifications, Apple/Google sign-in |
| **Content** | Word library (A–Z), morning tasks, gym rounds, distractor pool |
| **Backend** | Supabase with alarm/gym RPCs, roots, morning tasks, user progress + entitlements schema, account deletion |
| **Landing site** (`landing/`) | Next.js marketing site + legal docs, deployed on **Vercel** (GitHub → auto-deploy) |

See [ROADMAP.md](ROADMAP.md) for what's not built yet.

Use an **EAS dev build or local release build** (see [mobile/BUILD.md](mobile/BUILD.md)) to test on a real device.

## Tech stack

| Layer | Tools |
|-------|--------|
| Mobile app | Expo 56, React Native, Expo Router, TypeScript |
| Backend | Supabase (Postgres, RLS, RPCs for alarm vs gym, Edge Functions) |
| Content | `zazu-words.json`, all `tier: free` for now |
| Landing site | Next.js, Tailwind, deployed to Vercel from `landing/` |
| Tooling | Node.js scripts for import, seed, morning-task generation |

## Project structure

```
zazu/
├── landing/                  Next.js marketing site + legal docs (zazu.org.uk)
│   ├── app/                  Routes: /, /privacy, /terms, /accessibility
│   ├── components/           Hero, Nav, Footer, GoldSection, etc.
│   └── ROADMAP.md            Landing site's own polish/audit backlog
├── zazu-words.json           Master word library
├── morning-distractors.json  Shared wrong-answer pool for morning tasks
├── WORDS.md                  Alphabetical index of all words
├── lib/                      Shared TS logic imported by the mobile app
│   ├── supabase.ts           Shared Supabase client (alarm + gym fetch)
│   ├── date-utils.ts         Local-timezone date-key helpers (Word of the Day, snooze, calendar)
│   ├── entitlements.ts       Gold tier helpers
│   ├── entitlements-sync.ts  Sync entitlements from Supabase
│   ├── progress-storage.ts   Local progress persistence helpers
│   ├── progress-sync.ts      Cloud progress sync (scaffold)
│   ├── morning-task.ts       Morning task runtime helpers
│   ├── adaptive-theme.ts     Gradual light/dark theme (30 min dusk/dawn)
│   └── shuffle.ts            Shared Fisher-Yates shuffle
├── New SS/                   Mobile UI screenshots (light + dark flows)
├── screenshots/ui-audit/     Full UI audit captures (Expo web)
├── scripts/
│   ├── capture-flow-screenshots.mjs   Capture alarm/gym flows (Expo web)
│   ├── capture-dark-screenshots.mjs   Re-capture dark mode screens
│   ├── capture-ui-screenshots.mjs     Audit all routes (desktop + mobile, Expo web)
│   ├── seed-words.mjs        Upload words to Supabase
│   ├── import-word-batch.mjs Merge batch JSON into zazu-words.json
│   └── generate-morning-tasks.mjs
├── mobile/                   Expo app (see mobile/BUILD.md for EAS dev build)
├── supabase/
│   ├── migrations/           Schema, morning tasks, entitlements
│   ├── functions/            Edge Functions (RevenueCat webhook, account deletion)
│   └── README.md             Setup, RPCs, re-seeding
├── writing-rules.md          Copy and voice guidelines
├── DESIGN_SYSTEM.md          Mobile design tokens + alignment status
├── AUDIT.md                  Product audit (latest scores and gaps)
├── ROADMAP.md                P0–P3 development priorities
└── .env.example              Environment variable template
```

**`index.html` is a placeholder** — a minimal page with the tagline and links to the legal docs, standing in until a real marketing landing page is wired in.

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

## Run the landing site locally

```bash
cd landing
npm install
npm run dev   # http://localhost:3000 — routes: /, /privacy, /terms, /accessibility
```

See [landing/README.md](landing/README.md) for more.

### Deploy to Vercel

The landing site is a Next.js app in `landing/`, deployed to `zazu.org.uk`.

1. In the Vercel project connected to [github.com/lewisjakewhite26/zazu](https://github.com/lewisjakewhite26/zazu), set **Root Directory** to `landing`. Vercel auto-detects Next.js — no custom build command needed.
2. Push to `main` — Vercel redeploys automatically.

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
npm run seed       # upload the word library to Supabase
```

More detail on schema, RPCs, and re-seeding: [supabase/README.md](supabase/README.md).

## Run the mobile app (Expo)

1. Complete the Supabase setup above, then copy `mobile/.env.example` to `mobile/.env` and fill in your Supabase and OAuth keys (see [mobile/BUILD.md](mobile/BUILD.md)).

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
| `/gym-success` | Word Gym completion recap (coins + mastery) |
| `/calendar` | Word history (free vs Gold preview toggle) |
| `/settings` | Account, theme, notifications |
| `/gold` | Zazu Gold paywall |
| `/(onboarding)/welcome` | Welcome screen |
| `/(onboarding)/sign-in` | OAuth sign-in |
| `/(onboarding)/name` | Display name entry |

The mobile app imports shared code from `lib/` via Metro. Words come from Supabase (`get_words_for_alarm` / `get_words_for_gym`) with demo fallbacks when offline or unconfigured. A WOTD error banner appears on fetch failure with a **Try again** button.

**Theme:** All screens use `useTheme()` from `mobile/context/ThemeContext.tsx` — a gradual dusk/dawn blend between light and dark (30 min at 20:30–21:00 and 5:30–6:00).

## npm scripts (root)

| Script | Purpose |
|--------|---------|
| `npm run seed` | Upload `zazu-words.json` to Supabase |
| `npm run seed:dry` | Validate JSON and morning tasks without writing |
| `npm run words:morning-tasks` | Regenerate morning-task blocks in JSON |
| `npm run words:morning-tasks:check` | Validate morning tasks only |

## Copy and voice

All user-facing text in this project follows [writing-rules.md](writing-rules.md). Read it before writing UI copy, marketing content, or app store descriptions.

## Roadmap and audit

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](ROADMAP.md) | P0–P3 priorities and what to build next |
| [AUDIT.md](AUDIT.md) | Round 9 scores, gaps, and revenue notes (2026-07-31, not yet re-scored against the 2026-08-09 test pass) |
| [POST_APP_TEST_ROADMAP.md](POST_APP_TEST_ROADMAP.md) | First real on-device test findings (2026-08-09) — bug fixes and the locked Coin Economy / Thematic Word Packs spec |
| [PRODUCT.md](PRODUCT.md) | Product definition — purpose, positioning, monetization, principles |

## Licence

Private project. See individual `LICENSE` files where present.
