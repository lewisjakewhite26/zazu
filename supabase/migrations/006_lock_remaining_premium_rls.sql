-- Lock down the premium RLS gap missed by 005_lock_premium_words_rls.sql.
-- word_roots_select_premium and word_morning_tasks_select_premium (from
-- 002_morning_tasks_and_gym.sql) only checked `tier = 'premium'` for any
-- authenticated user, with no Gold-entitlement check. That let any signed-in
-- free user read premium roots and morning-task answers directly.

-- word_roots: readable only by users with active Gold entitlement
drop policy if exists "word_roots_select_premium" on public.word_roots;
create policy "word_roots_select_premium"
  on public.word_roots for select
  to authenticated
  using (
    exists (
      select 1
      from public.words w
      where w.id = word_roots.word_id
        and w.tier = 'premium'
        and exists (
          select 1
          from public.user_entitlements ue
          where ue.user_id = auth.uid()
            and ue.tier = 'gold'
            and (ue.gold_until is null or ue.gold_until > now())
        )
    )
  );

-- word_morning_tasks: readable only by users with active Gold entitlement
drop policy if exists "word_morning_tasks_select_premium" on public.word_morning_tasks;
create policy "word_morning_tasks_select_premium"
  on public.word_morning_tasks for select
  to authenticated
  using (
    exists (
      select 1
      from public.words w
      where w.id = word_morning_tasks.word_id
        and w.tier = 'premium'
        and exists (
          select 1
          from public.user_entitlements ue
          where ue.user_id = auth.uid()
            and ue.tier = 'gold'
            and (ue.gold_until is null or ue.gold_until > now())
        )
    )
  );
