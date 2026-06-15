# Zazu × Supabase

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env` and add your API keys (Dashboard → **Settings** → **API**).
3. Run the migration in the SQL Editor: paste **all** of `migrations/001_create_words_schema.sql` → **Run**.  
   The file starts with a reset block that drops any partial/old `words` tables (fixes uuid vs integer errors).
4. Install and seed:

```bash
npm install
npm run seed:dry    # validate JSON only
npm run seed        # upload words to Supabase
npm run config      # write public/config.js for zazu.html
```

## Keys

| Variable | Where | Safe in browser? |
|----------|--------|------------------|
| `SUPABASE_URL` | `.env`, `public/config.js` | Yes |
| `SUPABASE_ANON_KEY` | `.env`, `public/config.js` | Yes (with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` only, seed script | **Never** |

## Schema

```
words ──< word_rounds ──< word_pairs
```

- **`words_app_format`** — view that returns the same JSON shape as `zazu-words.json`
- **`get_words_for_app(tier)`** — RPC for the frontend (`tier`: `null`, `'free'`, or `'premium'`)

## Re-seeding

`npm run seed` upserts by `word` text and replaces rounds/pairs. Safe to run after editing `zazu-words.json` (the single word library file).
