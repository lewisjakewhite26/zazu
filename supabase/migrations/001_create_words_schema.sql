-- Zazu word library: normalized schema linked to puzzle rounds and pairs.
-- Run in Supabase SQL Editor (Dashboard → SQL → New query) or via Supabase CLI.
--
-- If you see "word_id and id are of incompatible types: uuid and integer",
-- an old words table already exists. The reset block below removes it first.

-- ── Reset (first-time setup or fixing a failed migration) ────────────────────

drop function if exists public.get_words_for_app(text);
drop view if exists public.words_app_format;
drop table if exists public.word_pairs cascade;
drop table if exists public.word_rounds cascade;
drop table if exists public.words cascade;

-- ── Types ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.word_tier as enum ('free', 'premium');
exception
  when duplicate_object then null;
end $$;

create extension if not exists "pgcrypto";

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.words (
  id            uuid primary key default gen_random_uuid(),
  word          text not null,
  pronunciation text not null,
  pos           text not null,
  definition    text not null,
  origin        text not null,
  tier          public.word_tier not null default 'free',
  display_order integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint words_word_unique unique (word)
);

create table if not exists public.word_rounds (
  id          uuid primary key default gen_random_uuid(),
  word_id     uuid not null references public.words (id) on delete cascade,
  round_index smallint not null check (round_index between 0 and 2),
  type        text not null,
  label       text not null,
  context     text not null,
  created_at  timestamptz not null default now(),
  constraint word_rounds_word_index_unique unique (word_id, round_index)
);

create table if not exists public.word_pairs (
  id         uuid primary key default gen_random_uuid(),
  round_id   uuid not null references public.word_rounds (id) on delete cascade,
  pair_index smallint not null check (pair_index between 0 and 9),
  side_a     text not null,
  side_b     text not null,
  created_at timestamptz not null default now(),
  constraint word_pairs_round_index_unique unique (round_id, pair_index)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists words_tier_idx on public.words (tier);
create index if not exists words_display_order_idx on public.words (display_order);
create index if not exists word_rounds_word_id_idx on public.word_rounds (word_id);
create index if not exists word_pairs_round_id_idx on public.word_pairs (round_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists words_set_updated_at on public.words;
create trigger words_set_updated_at
  before update on public.words
  for each row execute function public.set_updated_at();

-- ── App-facing view (matches zazu.html WORDS[] shape) ────────────────────────

create or replace view public.words_app_format
with (security_invoker = true)
as
select
  w.id,
  w.word,
  w.pronunciation,
  w.pos,
  w.definition,
  w.origin,
  w.tier::text as tier,
  w.display_order,
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'type', wr.type,
          'label', wr.label,
          'context', wr.context,
          'pairs', (
            select coalesce(
              jsonb_agg(
                jsonb_build_object('a', wp.side_a, 'b', wp.side_b)
                order by wp.pair_index
              ),
              '[]'::jsonb
            )
            from public.word_pairs wp
            where wp.round_id = wr.id
          )
        )
        order by wr.round_index
      ),
      '[]'::jsonb
    )
    from public.word_rounds wr
    where wr.word_id = w.id
  ) as rounds
from public.words w;

-- ── RPC: fetch words for the app (optional tier filter) ──────────────────────

create or replace function public.get_words_for_app(p_tier text default null)
returns table (
  id uuid,
  word text,
  pronunciation text,
  pos text,
  definition text,
  origin text,
  tier text,
  display_order integer,
  rounds jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    w.id,
    w.word,
    w.pronunciation,
    w.pos,
    w.definition,
    w.origin,
    w.tier::text,
    w.display_order,
    w.rounds
  from public.words_app_format w
  where p_tier is null or w.tier = p_tier
  order by w.display_order nulls last, w.word;
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.words enable row level security;
alter table public.word_rounds enable row level security;
alter table public.word_pairs enable row level security;

-- Free tier: readable by anyone (anon + authenticated)
drop policy if exists "words_select_free" on public.words;
create policy "words_select_free"
  on public.words for select
  to anon, authenticated
  using (tier = 'free');

drop policy if exists "word_rounds_select_free" on public.word_rounds;
create policy "word_rounds_select_free"
  on public.word_rounds for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_rounds.word_id and w.tier = 'free'
    )
  );

drop policy if exists "word_pairs_select_free" on public.word_pairs;
create policy "word_pairs_select_free"
  on public.word_pairs for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.word_rounds wr
      join public.words w on w.id = wr.word_id
      where wr.id = word_pairs.round_id and w.tier = 'free'
    )
  );

-- Premium tier: authenticated users only (extend with subscription check later)
drop policy if exists "words_select_premium" on public.words;
create policy "words_select_premium"
  on public.words for select
  to authenticated
  using (tier = 'premium');

drop policy if exists "word_rounds_select_premium" on public.word_rounds;
create policy "word_rounds_select_premium"
  on public.word_rounds for select
  to authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_rounds.word_id and w.tier = 'premium'
    )
  );

drop policy if exists "word_pairs_select_premium" on public.word_pairs;
create policy "word_pairs_select_premium"
  on public.word_pairs for select
  to authenticated
  using (
    exists (
      select 1
      from public.word_rounds wr
      join public.words w on w.id = wr.word_id
      where wr.id = word_pairs.round_id and w.tier = 'premium'
    )
  );

-- Service role bypasses RLS for admin/seed operations (no insert policies for anon).

grant usage on schema public to anon, authenticated;
grant select on public.words_app_format to anon, authenticated;
grant execute on function public.get_words_for_app(text) to anon, authenticated;
