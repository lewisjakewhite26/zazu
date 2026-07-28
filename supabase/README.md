# Zazu × Supabase

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env` and add your API keys (Dashboard → **Settings** → **API**).
3. Run migrations in the SQL Editor (paste each file → **Run**), in order:
   - `migrations/001_create_words_schema.sql`
   - `migrations/002_morning_tasks_and_gym.sql`
4. Install and seed:

```bash
npm install
npm run words:morning-tasks    # generate morningTask blocks in zazu-words.json
npm run seed:dry               # validate JSON + morning tasks
npm run seed                   # upload words, roots, gym rounds, morning tasks, distractors
npm run config                 # write public/config.js for zazu.html
```

## Keys

| Variable | Where | Safe in browser? |
|----------|--------|------------------|
| `SUPABASE_URL` | `.env`, `public/config.js` | Yes |
| `SUPABASE_ANON_KEY` | `.env`, `public/config.js` | Yes (with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` only, seed script | **Never** |

## Schema

```
words ──< word_roots
words ──< word_morning_tasks (1:1)
words ──< word_rounds ──< word_pairs   (Word Gym only)
morning_task_distractors               (shared pool)
auth.users ──< user_word_progress      (alarm vs gym timestamps)
```

### App views and RPCs

| Name | Purpose |
|------|---------|
| `words_alarm_format` | Alarm path: word fields, `intro_etymology`, `morning_task` |
| `words_gym_format` | Word Gym: word fields + `gym_rounds` |
| `get_words_for_alarm()` | Fetch alarm library |
| `get_words_for_gym()` | Fetch gym puzzle rounds |
| `get_morning_task_distractors()` | Shared wrong-answer pool |

`words_app_format` was removed. Use the alarm or gym fetch instead.

## Re-seeding

`npm run seed` upserts by `word` text and replaces roots, rounds, pairs, and morning tasks. Safe to run after editing `zazu-words.json`.

After changing morning task rules, run `npm run words:morning-tasks` before seeding.

## User progress

`user_word_progress` stores per-user:

- `alarm_completed_at` — morning alarm done (maps to local `learnedWordIds`)
- `gym_completed_at` — Word Gym session done
- `gym_mastery` — separate mastery score (0–100)

Requires Supabase Auth. Local AsyncStorage mirrors this shape until auth ships.
