import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { extractFinalPolicies } from './lib/parse-rls-policies';

// Structural check, not a live-database integration test: there's no Docker
// or Supabase CLI available in this environment to run the migrations
// against a real Postgres and query as different JWT roles. This instead
// replays every `create policy` statement across all migration files (in
// order) and asserts on the *final* policy text. It catches the exact class
// of regression that 006_lock_remaining_premium_rls.sql had to fix — a
// premium table's select policy silently missing the Gold-entitlement check
// — but it cannot catch a bug in Postgres's own policy evaluation, or a
// policy that's syntactically fine but semantically wrong in a way the
// assertions below don't cover. Treat this as a guardrail, not proof the
// paywall is unbreakable.

const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');

const PREMIUM_GATED_TABLES = ['words', 'word_rounds', 'word_pairs', 'word_roots', 'word_morning_tasks'];

describe('premium RLS policies', () => {
  const policies = extractFinalPolicies(MIGRATIONS_DIR);

  it.each(PREMIUM_GATED_TABLES)('%s_select_premium requires an active Gold entitlement', (table) => {
    const policy = policies.get(`${table}.${table}_select_premium`);
    expect(policy, `${table}_select_premium policy not found`).toBeDefined();

    expect(policy!.body).toContain('user_entitlements');
    expect(policy!.body).toContain("tier = 'gold'");
    expect(policy!.body).toContain('gold_until');
  });

  it.each(PREMIUM_GATED_TABLES)('%s_select_premium is not readable by anonymous users', (table) => {
    const policy = policies.get(`${table}.${table}_select_premium`);
    expect(policy).toBeDefined();

    const roles = policy!.roles.split(',').map((r) => r.trim());
    expect(roles).not.toContain('anon');
  });

  it.each(PREMIUM_GATED_TABLES)('%s_select_free only allows free-tier rows', (table) => {
    const policy = policies.get(`${table}.${table}_select_free`);
    expect(policy, `${table}_select_free policy not found`).toBeDefined();

    expect(policy!.body).toContain("tier = 'free'");
    // A free policy that also references entitlements/gold would suggest it
    // was accidentally widened to cover premium rows too.
    expect(policy!.body).not.toContain('user_entitlements');
  });

  it.each(PREMIUM_GATED_TABLES)('row level security is enabled on %s', (table) => {
    const allSql = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .map((f) => readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
      .join('\n');

    expect(allSql).toMatch(new RegExp(`alter table public\\.${table} enable row level security`));
    expect(allSql).not.toMatch(new RegExp(`alter table public\\.${table} disable row level security`));
  });
});

describe('user_entitlements RLS', () => {
  const policies = extractFinalPolicies(MIGRATIONS_DIR);

  it('users can only write their own entitlement row via the service role, not directly', () => {
    // 004_lock_entitlements.sql intentionally removes user-writable
    // insert/update policies and replaces them with service-role-only ones,
    // so client-side code (or a malicious client) cannot self-grant Gold.
    expect(policies.get('user_entitlements.user_entitlements_insert_service_role')).toBeDefined();
    expect(policies.get('user_entitlements.user_entitlements_update_service_role')).toBeDefined();
    expect(policies.get('user_entitlements.user_entitlements_upsert_own')).toBeUndefined();
    expect(policies.get('user_entitlements.user_entitlements_update_own')).toBeUndefined();
  });

  it('service-role write policies are restricted to the service_role, not authenticated users', () => {
    const insertPolicy = policies.get('user_entitlements.user_entitlements_insert_service_role');
    const updatePolicy = policies.get('user_entitlements.user_entitlements_update_service_role');

    expect(insertPolicy!.roles).toContain('service_role');
    expect(insertPolicy!.roles).not.toContain('authenticated');
    expect(updatePolicy!.roles).toContain('service_role');
    expect(updatePolicy!.roles).not.toContain('authenticated');
  });

  it('users can read only their own entitlement row', () => {
    const policy = policies.get('user_entitlements.user_entitlements_select_own');
    expect(policy).toBeDefined();
    expect(policy!.body).toContain('auth.uid()');
  });
});
