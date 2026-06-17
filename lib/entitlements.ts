export type SubscriptionTier = 'free' | 'gold';

export type UserEntitlement = {
  tier: SubscriptionTier;
  goldUntil: string | null;
  source: string;
};

export const GOLD_ENTITLEMENT_ID = 'gold';

export function isGoldTier(entitlement: UserEntitlement | null | undefined): boolean {
  if (!entitlement || entitlement.tier !== 'gold') return false;
  if (!entitlement.goldUntil) return true;
  return new Date(entitlement.goldUntil).getTime() > Date.now();
}

export function parseEntitlementFromMetadata(
  metadata: Record<string, unknown> | undefined,
): UserEntitlement {
  const tier = metadata?.gold_tier === 'gold' ? 'gold' : 'free';
  const goldUntil =
    typeof metadata?.gold_until === 'string' ? metadata.gold_until : null;
  return {
    tier,
    goldUntil,
    source: 'metadata',
  };
}

export function entitlementFromRow(row: {
  tier: string;
  gold_until: string | null;
  source?: string;
}): UserEntitlement {
  return {
    tier: row.tier === 'gold' ? 'gold' : 'free',
    goldUntil: row.gold_until,
    source: row.source ?? 'database',
  };
}
