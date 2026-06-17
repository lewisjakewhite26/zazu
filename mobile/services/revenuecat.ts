import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

import { GOLD_ENTITLEMENT_ID } from '../../lib/entitlements';

function readRevenueCatApiKey(): string | undefined {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  }
  return undefined;
}

export function isRevenueCatConfigured(): boolean {
  const key = readRevenueCatApiKey();
  return Boolean(key && !key.includes('YOUR_'));
}

let configured = false;

export async function initRevenueCat(userId?: string): Promise<boolean> {
  const apiKey = readRevenueCatApiKey();
  if (!apiKey) return false;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
  return true;
}

export async function identifyRevenueCatUser(userId: string): Promise<void> {
  if (!configured) return;
  await Purchases.logIn(userId);
}

export async function resetRevenueCatUser(): Promise<void> {
  if (!configured) return;
  await Purchases.logOut();
}

export function customerHasGold(info: CustomerInfo): boolean {
  const active = info.entitlements.active[GOLD_ENTITLEMENT_ID];
  return Boolean(active?.isActive);
}

export async function fetchRevenueCatGoldStatus(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.getCustomerInfo();
  return customerHasGold(info);
}

export async function restoreRevenueCatPurchases(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  return customerHasGold(info);
}

export async function purchaseGoldPackage(): Promise<boolean> {
  if (!configured) return false;
  const offerings = await Purchases.getOfferings();
  const goldPackage =
    offerings.current?.annual ??
    offerings.current?.monthly ??
    offerings.current?.availablePackages[0];

  if (!goldPackage) {
    throw new Error('No subscription packages are configured in RevenueCat');
  }

  const { customerInfo } = await Purchases.purchasePackage(goldPackage);
  return customerHasGold(customerInfo);
}
