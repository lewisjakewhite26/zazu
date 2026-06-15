-- Morning tasks, Word Gym split, user word progress.
-- Run after 001_create_words_schema.sql.

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.morning_task_type as enum ('root', 'definition', 'etymology');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.morning_source_kind as enum ('root', 'definition', 'origin_summary');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.gym_round_type as enum ('etymology', 'definition', 'usage');
exception
  when duplicate_object then null;
end $$;

-- ── words: intro + gym flag ───────────────────────────────────────────────────

alter table public.words
  add column if not exists intro_etymology jsonb,
  add column if not exists gym_enabled boolean not null default true;

comment on column public.words.intro_etymology is
  'Alarm Learn step etymology with highlight spans: { "spans": [{ "text", "highlight" }] }.';

-- ── Structured roots (seed-generated) ────────────────────────────────────────

create table if not exists public.word_roots (
  id            uuid primary key default gen_random_uuid(),
  word_id       uuid not null references public.words (id) on delete cascade,
  root_index    smallint not null check (root_index >= 0),
  root_text     text not null,
  root_language text,
  root_meaning  text not null,
  show_in_intro boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint word_roots_word_index_unique unique (word_id, root_index)
);

create index if not exists word_roots_word_id_idx on public.word_roots (word_id);

-- ── One morning task per word ─────────────────────────────────────────────────

create table if not exists public.word_morning_tasks (
  word_id           uuid primary key references public.words (id) on delete cascade,
  task_type         public.morning_task_type not null,
  source_kind       public.morning_source_kind not null,
  source_value      text not null,
  correct_answer    text not null,
  hint              text,
  source_root_id    uuid references public.word_roots (id) on delete set null,
  generator_version text not null default '1',
  generated_at      timestamptz not null default now(),
  constraint word_morning_tasks_source_check check (
    (source_kind = 'root' and source_root_id is not null)
    or (source_kind in ('definition', 'origin_summary'))
  )
);

-- ── Shared distractor pool ────────────────────────────────────────────────────

create table if not exists public.morning_task_distractors (
  id          uuid primary key default gen_random_uuid(),
  task_type   public.morning_task_type not null,
  answer_text text not null,
  weight      smallint not null default 1 check (weight between 1 and 10),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint morning_task_distractors_unique unique (task_type, answer_text)
);

create index if not exists morning_task_distractors_type_active_idx
  on public.morning_task_distractors (task_type)
  where active;

-- ── Word Gym columns on existing round tables ────────────────────────────────

alter table public.word_rounds
  add column if not exists gym_round_type public.gym_round_type,
  add column if not exists gym_only boolean not null default true;

alter table public.word_pairs
  add column if not exists pair_role text not null default 'match'
    check (pair_role in ('match', 'distractor'));

-- Backfill gym_round_type from legacy type labels
update public.word_rounds wr
set gym_round_type = case
  when wr.type ilike 'etymology%' then 'etymology'::public.gym_round_type
  when wr.type ilike 'definition%' then 'definition'::public.gym_round_type
  when wr.type ilike 'usage%' then 'usage'::public.gym_round_type
  else 'etymology'::public.gym_round_type
end
where wr.gym_round_type is null;

-- ── User word progress (auth-backed; alarm vs gym separate) ───────────────────

create table if not exists public.user_word_progress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  word_id            uuid not null references public.words (id) on delete cascade,
  alarm_completed_at timestamptz,
  gym_completed_at   timestamptz,
  gym_mastery        smallint not null default 0 check (gym_mastery between 0 and 100),
  gym_wrong_count    integer not null default 0 check (gym_wrong_count >= 0),
  next_review_at     timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint user_word_progress_user_word_unique unique (user_id, word_id)
);

create index if not exists user_word_progress_user_id_idx
  on public.user_word_progress (user_id);

create index if not exists user_word_progress_next_review_idx
  on public.user_word_progress (user_id, next_review_at)
  where next_review_at is not null;

drop trigger if exists user_word_progress_set_updated_at on public.user_word_progress;
create trigger user_word_progress_set_updated_at
  before update on public.user_word_progress
  for each row execute function public.set_updated_at();

-- ── Replace words_app_format with alarm + gym views ──────────────────────────

drop function if exists public.get_words_for_app(text);
drop view if exists public.words_app_format;

create or replace view public.words_alarm_format
with (security_invoker = true)
as
select
  w.id,
  w.word,
  w.pronunciation,
  w.pos,
  w.definition,
  w.origin,
  w.intro_etymology,
  w.tier::text as tier,
  w.display_order,
  jsonb_build_object(
    'taskType', mt.task_type,
    'sourceKind', mt.source_kind,
    'sourceValue', mt.source_value,
    'correctAnswer', mt.correct_answer,
    'hint', mt.hint
  ) as morning_task
from public.words w
join public.word_morning_tasks mt on mt.word_id = w.id;

create or replace view public.words_gym_format
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
          'gymRoundType', wr.gym_round_type,
          'label', wr.label,
          'context', wr.context,
          'pairs', (
            select coalesce(
              jsonb_agg(
                jsonb_build_object(
                  'a', wp.side_a,
                  'b', wp.side_b,
                  'pairRole', wp.pair_role
                )
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
    where wr.word_id = w.id and wr.gym_only = true
  ) as gym_rounds
from public.words w
where w.gym_enabled = true;

-- ── RPCs ─────────────────────────────────────────────────────────────────────

create or replace function public.get_words_for_alarm(p_tier text default null)
returns table (
  id uuid,
  word text,
  pronunciation text,
  pos text,
  definition text,
  origin text,
  intro_etymology jsonb,
  tier text,
  display_order integer,
  morning_task jsonb
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
    w.intro_etymology,
    w.tier,
    w.display_order,
    w.morning_task
  from public.words_alarm_format w
  where p_tier is null or w.tier = p_tier
  order by w.display_order nulls last, w.word;
$$;

create or replace function public.get_words_for_gym(p_tier text default null)
returns table (
  id uuid,
  word text,
  pronunciation text,
  pos text,
  definition text,
  origin text,
  tier text,
  display_order integer,
  gym_rounds jsonb
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
    w.tier,
    w.display_order,
    w.gym_rounds
  from public.words_gym_format w
  where p_tier is null or w.tier = p_tier
  order by w.display_order nulls last, w.word;
$$;

create or replace function public.get_morning_task_distractors(p_task_type text default null)
returns table (
  id uuid,
  task_type public.morning_task_type,
  answer_text text,
  weight smallint
)
language sql
stable
security invoker
set search_path = public
as $$
  select d.id, d.task_type, d.answer_text, d.weight
  from public.morning_task_distractors d
  where d.active
    and (p_task_type is null or d.task_type::text = p_task_type)
  order by d.task_type, d.answer_text;
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.word_roots enable row level security;
alter table public.word_morning_tasks enable row level security;
alter table public.morning_task_distractors enable row level security;
alter table public.user_word_progress enable row level security;

-- word_roots: visible when parent word is visible
drop policy if exists "word_roots_select_free" on public.word_roots;
create policy "word_roots_select_free"
  on public.word_roots for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_roots.word_id and w.tier = 'free'
    )
  );

drop policy if exists "word_roots_select_premium" on public.word_roots;
create policy "word_roots_select_premium"
  on public.word_roots for select
  to authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_roots.word_id and w.tier = 'premium'
    )
  );

-- word_morning_tasks: same tier visibility as parent word
drop policy if exists "word_morning_tasks_select_free" on public.word_morning_tasks;
create policy "word_morning_tasks_select_free"
  on public.word_morning_tasks for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_morning_tasks.word_id and w.tier = 'free'
    )
  );

drop policy if exists "word_morning_tasks_select_premium" on public.word_morning_tasks;
create policy "word_morning_tasks_select_premium"
  on public.word_morning_tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.words w
      where w.id = word_morning_tasks.word_id and w.tier = 'premium'
    )
  );

-- morning_task_distractors: global read (generic wrong answers)
drop policy if exists "morning_task_distractors_select_all" on public.morning_task_distractors;
create policy "morning_task_distractors_select_all"
  on public.morning_task_distractors for select
  to anon, authenticated
  using (active);

-- user_word_progress: own rows only
drop policy if exists "user_word_progress_select_own" on public.user_word_progress;
create policy "user_word_progress_select_own"
  on public.user_word_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_word_progress_insert_own" on public.user_word_progress;
create policy "user_word_progress_insert_own"
  on public.user_word_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_word_progress_update_own" on public.user_word_progress;
create policy "user_word_progress_update_own"
  on public.user_word_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select on public.words_alarm_format to anon, authenticated;
grant select on public.words_gym_format to anon, authenticated;
grant execute on function public.get_words_for_alarm(text) to anon, authenticated;
grant execute on function public.get_words_for_gym(text) to anon, authenticated;
grant execute on function public.get_morning_task_distractors(text) to anon, authenticated;
