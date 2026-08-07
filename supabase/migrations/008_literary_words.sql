-- Literary word pack: a separate, isolated table rather than extending
-- words/word_rounds/word_pairs. Literary rounds mix two shapes - Etymology
-- is match-pairs like every other word, but Quote Completion and Contextual
-- Definition are MCQ (prompt/passage/options/correctIndex), which doesn't
-- fit word_pairs at all. Rather than generalise that core, already-shipped
-- schema, the whole word (word/pronunciation/definition/origin/source/
-- rounds/roots/introEtymology/morningTask/subpack) is stored as one row,
-- mirroring the shape already produced by THEMATIC PACKS/zazu-words-literary.json.

create table if not exists public.literary_words (
  id               uuid primary key default gen_random_uuid(),
  word             text not null,
  pronunciation    text not null,
  pos              text not null,
  definition       text not null,
  origin           text not null,
  tier             text not null default 'premium',
  pack_id          text not null default 'literary',
  author_group     text not null,
  source           jsonb not null,
  rounds           jsonb not null,
  roots            jsonb,
  intro_etymology  jsonb,
  morning_task     jsonb,
  subpack          jsonb,
  display_order    int,
  created_at       timestamptz not null default now(),
  constraint literary_words_word_unique unique (word)
);

create index if not exists literary_words_author_group_idx on public.literary_words (author_group);

alter table public.literary_words enable row level security;

-- Every row is premium - readable only by authenticated users with an
-- active Gold entitlement, same check as the existing premium policies on
-- words/word_roots/word_morning_tasks (005/006).
drop policy if exists "literary_words_select_premium" on public.literary_words;
create policy "literary_words_select_premium"
  on public.literary_words for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_entitlements ue
      where ue.user_id = auth.uid()
        and ue.tier = 'gold'
        and (ue.gold_until is null or ue.gold_until > now())
    )
  );
