-- Lock down Gold entitlements: only service_role can write.
-- Client-side writes are completely blocked.
-- Entitlement changes now come exclusively from the RevenueCat webhook.

-- Drop existing policies that allow authenticated users to modify their own entitlements
drop policy if exists "user_entitlements_upsert_own" on public.user_entitlements;
drop policy if exists "user_entitlements_update_own" on public.user_entitlements;

-- Restrict INSERT to service_role only (RevenueCat webhook will use this)
drop policy if exists "user_entitlements_insert_service_role" on public.user_entitlements;
create policy "user_entitlements_insert_service_role"
  on public.user_entitlements for insert
  to service_role
  with check (true);

-- Restrict UPDATE to service_role only (RevenueCat webhook will use this)
drop policy if exists "user_entitlements_update_service_role" on public.user_entitlements;
create policy "user_entitlements_update_service_role"
  on public.user_entitlements for update
  to service_role
  using (true)
  with check (true);

-- Keep the SELECT policy for users to read their own entitlement (already exists)
-- but verify it's set correctly
drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
create policy "user_entitlements_select_own"
  on public.user_entitlements for select
  to authenticated
  using (auth.uid() = user_id);
