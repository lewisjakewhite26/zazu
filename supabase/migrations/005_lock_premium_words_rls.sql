-- Lock down premium words RLS: only readable by users with active Gold entitlement.
-- Replaces the "any authenticated user" policy with one that checks user_entitlements.

-- Premium tier: readable only by authenticated users with active Gold entitlement
drop policy if exists "words_select_premium" on public.words;
create policy "words_select_premium"
  on public.words for select
  to authenticated
  using (
    tier = 'premium'
    and exists (
      select 1
      from public.user_entitlements ue
      where ue.user_id = auth.uid()
        and ue.tier = 'gold'
        and (ue.gold_until is null or ue.gold_until > now())
    )
  );

-- Premium tier word_rounds: readable only by users with active Gold entitlement
drop policy if exists "word_rounds_select_premium" on public.word_rounds;
create policy "word_rounds_select_premium"
  on public.word_rounds for select
  to authenticated
  using (
    exists (
      select 1
      from public.words w
      where w.id = word_rounds.word_id
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

-- Premium tier word_pairs: readable only by users with active Gold entitlement
drop policy if exists "word_pairs_select_premium" on public.word_pairs;
create policy "word_pairs_select_premium"
  on public.word_pairs for select
  to authenticated
  using (
    exists (
      select 1
      from public.word_rounds wr
      join public.words w on w.id = wr.word_id
      where wr.id = word_pairs.round_id
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
