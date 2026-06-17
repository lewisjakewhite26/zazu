import {
  createElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchUserEntitlement,
  grantGoldDevAccess,
  upsertUserEntitlement,
} from '../../lib/entitlements-sync';
import { isGoldTier, type UserEntitlement } from '../../lib/entitlements';
import { useAuth } from '@/context/auth-context';
import {
  fetchRevenueCatGoldStatus,
  identifyRevenueCatUser,
  initRevenueCat,
  isRevenueCatConfigured,
  purchaseGoldPackage,
  resetRevenueCatUser,
  restoreRevenueCatPurchases,
} from '@/services/revenuecat';

import { SubscriptionContext, type SubscriptionContextValue } from './subscription-context';

const FREE_ENTITLEMENT: UserEntitlement = {
  tier: 'free',
  goldUntil: null,
  source: 'default',
};

type SubscriptionProviderProps = {
  children: ReactNode;
};

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, session, isAnonymous } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [revenueCatReady, setRevenueCatReady] = useState(false);
  const [devGoldPreview, setDevGoldPreview] = useState<boolean | null>(null);

  const refreshEntitlement = useCallback(async () => {
    if (!user || isAnonymous) {
      setEntitlement(FREE_ENTITLEMENT);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let next = await fetchUserEntitlement(user);

      if (revenueCatReady) {
        const rcGold = await fetchRevenueCatGoldStatus();
        if (rcGold && !isGoldTier(next)) {
          next = {
            tier: 'gold',
            goldUntil: null,
            source: 'revenuecat',
          };
          await upsertUserEntitlement(user.id, next);
        }
      }

      setEntitlement(next);
    } finally {
      setLoading(false);
    }
  }, [user, isAnonymous, revenueCatReady]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!session?.user || isAnonymous) {
        if (!cancelled) {
          setEntitlement(FREE_ENTITLEMENT);
          setRevenueCatReady(false);
          setLoading(false);
        }
        return;
      }

      const rcConfigured = isRevenueCatConfigured();
      if (rcConfigured) {
        const ready = await initRevenueCat(session.user.id);
        if (!cancelled) setRevenueCatReady(ready);
        if (ready) {
          await identifyRevenueCatUser(session.user.id);
        }
      } else if (!cancelled) {
        setRevenueCatReady(false);
      }

      if (!cancelled) {
        await refreshEntitlement();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, isAnonymous, refreshEntitlement]);

  useEffect(() => {
    if (!session?.user) {
      void resetRevenueCatUser();
    }
  }, [session?.user]);

  const purchaseGold = useCallback(async () => {
    if (!user) return false;

    if (revenueCatReady) {
      const purchased = await purchaseGoldPackage();
      if (purchased) {
        const next: UserEntitlement = {
          tier: 'gold',
          goldUntil: null,
          source: 'revenuecat',
        };
        await upsertUserEntitlement(user.id, next);
        setEntitlement(next);
      }
      return purchased;
    }

    throw new Error('Subscriptions are not configured yet. Add RevenueCat keys to mobile/.env.');
  }, [user, revenueCatReady]);

  const restorePurchases = useCallback(async () => {
    if (!user || !revenueCatReady) return false;
    const restored = await restoreRevenueCatPurchases();
    if (restored) {
      const next: UserEntitlement = {
        tier: 'gold',
        goldUntil: null,
        source: 'revenuecat',
      };
      await upsertUserEntitlement(user.id, next);
      setEntitlement(next);
    }
    return restored;
  }, [user, revenueCatReady]);

  const grantDevGold = useCallback(async () => {
    if (!user) return;
    const next = await grantGoldDevAccess(user.id);
    setEntitlement(next);
    setDevGoldPreview(null);
  }, [user]);

  const realIsGold = isGoldTier(entitlement);
  const isGold = devGoldPreview ?? realIsGold;
  const tier = isGold ? 'gold' : 'free';

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      loading,
      tier,
      isGold,
      entitlement,
      revenueCatReady,
      devGoldPreview,
      setDevGoldPreview,
      refreshEntitlement,
      purchaseGold,
      restorePurchases,
      grantDevGold,
    }),
    [
      loading,
      tier,
      isGold,
      entitlement,
      revenueCatReady,
      devGoldPreview,
      refreshEntitlement,
      purchaseGold,
      restorePurchases,
      grantDevGold,
    ],
  );

  return createElement(SubscriptionContext.Provider, { value }, children);
}

export { useSubscription } from './subscription-context';
