-- Zazu Gold entitlements (subscription tier per user)
-- Synced from RevenueCat webhooks or manual grants until IAP is live.

create table if not exists public.user_entitlements (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  tier       text not null default 'free' check (tier in ('free', 'gold')),
  gold_until timestamptz,
  source     text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_entitlements_tier_idx
  on public.user_entitlements (tier);

drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
create trigger user_entitlements_set_updated_at
  before update on public.user_entitlements
  for each row execute function public.set_updated_at();

alter table public.user_entitlements enable row level security;

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
create policy "user_entitlements_select_own"
  on public.user_entitlements for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts/updates via service role (RevenueCat webhook) or authenticated upsert for dev
drop policy if exists "user_entitlements_upsert_own" on public.user_entitlements;
create policy "user_entitlements_upsert_own"
  on public.user_entitlements for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_entitlements_update_own" on public.user_entitlements;
create policy "user_entitlements_update_own"
  on public.user_entitlements for update
  to authenticated
  using (auth.uid() = user_id);
