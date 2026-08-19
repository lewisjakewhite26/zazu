-- Adds the tap-to-find passage field to morning tasks. The passage is a
-- short, pre-authored sentence containing the word exactly once (see
-- lib/word-spotting.ts); never generated live at alarm-fire time.

alter table public.word_morning_tasks
  add column if not exists passage text;

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
    'hint', mt.hint,
    'passage', mt.passage
  ) as morning_task
from public.words w
join public.word_morning_tasks mt on mt.word_id = w.id;
