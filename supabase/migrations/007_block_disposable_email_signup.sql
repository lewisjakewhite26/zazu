-- Defense-in-depth: reject signups whose email domain is a known disposable/
-- throwaway provider. Current signup is Apple/Google OAuth only (see
-- mobile/context/AuthContext.tsx) plus an anonymous guest mode -- neither
-- collects a user-typed email today, and Supabase Auth itself normalises
-- email case/whitespace for storage and uniqueness. This trigger guards
-- auth.users at the database level regardless of how a user is created
-- (OAuth today, any future email/password flow, admin invites, etc.).
--
-- Do NOT add privaterelay.appleid.com here -- that's Apple's own "Hide My
-- Email" relay domain for Sign in with Apple, not a throwaway service.

create table if not exists public.blocked_email_domains (
  domain text primary key
);

comment on table public.blocked_email_domains is
  'Email domains rejected at signup (auth.users insert). Service-role managed only.';

insert into public.blocked_email_domains (domain) values
  ('mailinator.com'),
  ('10minutemail.com'),
  ('10minutemail.net'),
  ('guerrillamail.com'),
  ('guerrillamail.info'),
  ('tempmail.com'),
  ('temp-mail.org'),
  ('yopmail.com'),
  ('trashmail.com'),
  ('throwawaymail.com'),
  ('getnada.com'),
  ('sharklasers.com'),
  ('dispostable.com'),
  ('fakeinbox.com'),
  ('maildrop.cc'),
  ('mintemail.com'),
  ('mytemp.email'),
  ('spamgourmet.com'),
  ('tempinbox.com'),
  ('mohmal.com'),
  ('emailondeck.com'),
  ('moakt.com'),
  ('discard.email'),
  ('mailnesia.com'),
  ('einrot.com'),
  ('spam4.me')
on conflict (domain) do nothing;

alter table public.blocked_email_domains enable row level security;
-- No policies: no anon/authenticated access at all. service_role (used by
-- migrations/admin tooling) bypasses RLS by default, so it can still manage
-- this table without an explicit policy.

create or replace function public.reject_disposable_email_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is not null and exists (
    select 1
    from public.blocked_email_domains d
    where d.domain = lower(split_part(new.email, '@', 2))
  ) then
    raise exception 'Disposable email domains are not allowed.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_disposable_email_signup on auth.users;
create trigger reject_disposable_email_signup
  before insert on auth.users
  for each row execute function public.reject_disposable_email_signup();
