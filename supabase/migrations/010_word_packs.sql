-- Thematic word packs (Games, Loan Words): pack_id/subpack_id on the core
-- words table, reusing the existing words/word_rounds/word_pairs schema.
-- Unlike Literary (008_literary_words.sql), which needed an isolated table
-- because its rounds mix MCQ and match-pairs shapes, Games/Loan Words are
-- match-pairs only -- identical in shape to the core word bank.
--
-- Pack words are never given a word_morning_tasks row (enforced at seed
-- time in scripts/seed-word-packs.mjs) so words_alarm_format's inner join
-- excludes them from the alarm automatically, and they seed with
-- gym_enabled = false so words_gym_format's `where gym_enabled = true`
-- excludes them from the general Gym pool automatically. No changes needed
-- to either existing view.

alter table public.words
  add column if not exists pack_id text,
  add column if not exists subpack_id text;

create index if not exists words_pack_id_idx on public.words (pack_id) where pack_id is not null;

create or replace view public.words_pack_format
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
  w.pack_id,
  w.subpack_id,
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
    where wr.word_id = w.id
  ) as gym_rounds
from public.words w
where w.pack_id is not null;

create or replace function public.get_words_for_pack(p_pack_id text)
returns table (
  id uuid,
  word text,
  pronunciation text,
  pos text,
  definition text,
  origin text,
  tier text,
  pack_id text,
  subpack_id text,
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
    w.pack_id,
    w.subpack_id,
    w.display_order,
    w.gym_rounds
  from public.words_pack_format w
  where w.pack_id = p_pack_id
  order by w.subpack_id nulls first, w.display_order nulls last, w.word;
$$;

-- RLS: no new policy needed. Every pack word is tier='premium', and
-- words/word_rounds/word_pairs already gate 'premium' rows on an active
-- Gold entitlement (005_lock_premium_words_rls.sql). security_invoker on
-- the view, plus `security invoker` on the function, means both inherit
-- that check for free automatically.

grant select on public.words_pack_format to anon, authenticated;
grant execute on function public.get_words_for_pack(text) to anon, authenticated;
