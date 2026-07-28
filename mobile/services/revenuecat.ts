import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import type {
  PurchasesOffering as Offering,
  PurchasesPackage as Package,
} from '@revenuecat/purchases-typescript-internal/dist/offerings';

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
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.warn('[RevenueCat] logIn failed:', error);
  }
}

export async function resetRevenueCatUser(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (error) {
    console.warn('[RevenueCat] logOut failed:', error);
  }
}

export function customerHasGold(info: CustomerInfo): boolean {
  const active = info.entitlements.active[GOLD_ENTITLEMENT_ID];
  return Boolean(active?.isActive);
}

export async function fetchRevenueCatGoldStatus(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return customerHasGold(info);
  } catch (error) {
    console.warn('[RevenueCat] getCustomerInfo failed:', error);
    return false;
  }
}

export async function getRevenueCatOfferings(): Promise<Offering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.warn('[RevenueCat] getOfferings failed:', error);
    return null;
  }
}

export async function getRevenueCatPackageByIdentifier(identifier: string): Promise<Package | null> {
  const offering = await getRevenueCatOfferings();
  if (!offering) return null;

  if (identifier === 'yearly' || identifier === 'annual') {
    return offering.annual ?? offering.monthly ?? offering.availablePackages[0] ?? null;
  }

  if (identifier === 'monthly') {
    return offering.monthly ?? offering.annual ?? offering.availablePackages[0] ?? null;
  }

  return (
    offering.availablePackages.find((pkg: Package) => pkg.identifier === identifier) ??
    offering.availablePackages[0] ??
    null
  );
}

export async function restoreRevenueCatPurchases(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return customerHasGold(info);
  } catch (error) {
    console.warn('[RevenueCat] restorePurchases failed:', error);
    return false;
  }
}

export async function purchaseGoldPackage(packageIdentifier = 'yearly'): Promise<boolean> {
  if (!configured) return false;

  const packageToBuy = await getRevenueCatPackageByIdentifier(packageIdentifier);
  if (!packageToBuy) {
    throw new Error('No subscription packages are configured in RevenueCat');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
    return customerHasGold(customerInfo);
  } catch (error) {
    console.warn('[RevenueCat] purchasePackage failed:', error);
    throw error;
  }
}

export async function getRevenueCatCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.warn('[RevenueCat] getCustomerInfo failed:', error);
    return null;
  }
}
