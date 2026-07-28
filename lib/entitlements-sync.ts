import type { User } from '@supabase/supabase-js';

import {
  entitlementFromRow,
  isGoldTier,
  parseEntitlementFromMetadata,
  type UserEntitlement,
} from './entitlements';
import { getSupabase } from './supabase';

export async function fetchUserEntitlement(user: User): Promise<UserEntitlement> {
  const supabase = getSupabase();
  if (!supabase) {
    return parseEntitlementFromMetadata(user.user_metadata as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from('user_entitlements')
    .select('tier, gold_until, source')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!error && data) {
    const fromDb = entitlementFromRow(data);
    if (isGoldTier(fromDb)) return fromDb;
  }

  return parseEntitlementFromMetadata(user.user_metadata as Record<string, unknown>);
}

/**
 * PRODUCTION: This function is disabled in production builds.
 * Entitlements are now exclusively managed by the RevenueCat webhook (via Edge Function).
 * 
 * DEVELOPMENT ONLY: Used internally by grantGoldDevAccess for testing.
 * Must never be called from client code in production.
 */
async function upsertUserEntitlementInternal(
  userId: string,
  entitlement: UserEntitlement,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error: dbError } = await supabase.from('user_entitlements').upsert(
    {
      user_id: userId,
      tier: entitlement.tier,
      gold_until: entitlement.goldUntil,
      source: entitlement.source,
    },
    { onConflict: 'user_id' },
  );
  if (dbError) throw dbError;

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      gold_tier: entitlement.tier,
      gold_until: entitlement.goldUntil,
    },
  });
  if (metaError) throw metaError;
}

/**
 * Public interface for upserting entitlements — PRODUCTION VERSION.
 * In production, this is disabled and returns an error to prevent client-side modification.
 * Entitlements come exclusively from the RevenueCat webhook.
 */
export async function upsertUserEntitlement(
  userId: string,
  entitlement: UserEntitlement,
): Promise<void> {
  if (!__DEV__) {
    throw new Error(
      'Client-side entitlement updates are disabled in production. ' +
      'Entitlements are managed exclusively via RevenueCat webhooks.'
    );
  }

  // Development mode: allow internal updates for testing
  await upsertUserEntitlementInternal(userId, entitlement);
}

/**
 * DEVELOPMENT ONLY: Grant temporary Gold access for testing.
 * 
 * USAGE: 
 * - Only available when __DEV__ is true
 * - Used for testing Gold-tier features locally
 * - Never shipped to production
 * 
 * PRODUCTION: This function throws an error and must never be called.
 */
export async function grantGoldDevAccess(userId: string, days = 30): Promise<UserEntitlement> {
  if (!__DEV__) {
    throw new Error(
      'grantGoldDevAccess is only available in development mode. ' +
      'Production entitlements must be purchased via RevenueCat.'
    );
  }

  const until = new Date();
  until.setDate(until.getDate() + days);
  const entitlement: UserEntitlement = {
    tier: 'gold',
    goldUntil: until.toISOString(),
    source: 'dev_grant',
  };
  await upsertUserEntitlementInternal(userId, entitlement);
  return entitlement;
}
