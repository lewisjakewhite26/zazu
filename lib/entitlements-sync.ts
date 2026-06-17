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

export async function upsertUserEntitlement(
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

export async function grantGoldDevAccess(userId: string, days = 30): Promise<UserEntitlement> {
  const until = new Date();
  until.setDate(until.getDate() + days);
  const entitlement: UserEntitlement = {
    tier: 'gold',
    goldUntil: until.toISOString(),
    source: 'dev_grant',
  };
  await upsertUserEntitlement(userId, entitlement);
  return entitlement;
}
