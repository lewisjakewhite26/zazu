import { createContext, useContext } from 'react';

import type { SubscriptionTier, UserEntitlement } from '../../lib/entitlements';

export type SubscriptionContextValue = {
  loading: boolean;
  tier: SubscriptionTier;
  isGold: boolean;
  entitlement: UserEntitlement | null;
  revenueCatReady: boolean;
  devGoldPreview: boolean | null;
  setDevGoldPreview: (value: boolean | null) => void;
  refreshEntitlement: () => Promise<void>;
  purchaseGold: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  grantDevGold: () => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
