import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { getSupabase } from '../../lib/supabase';

function readGoogleClientId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { googleWebClientId?: string } | undefined;
  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    extra?.googleWebClientId
  );
}

function readGoogleIosClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
}

function readGoogleAndroidClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
}

let googleSignInConfigured = false;

/**
 * Native Google Sign-In (Android Credential Manager / iOS native SDK) identifies the
 * app via package name + SHA-1 fingerprint (Android) or bundle ID (iOS) already
 * registered against the OAuth client in Google Cloud Console -- no redirect_uri
 * involved at all. This replaces the old expo-auth-session browser-redirect flow,
 * which Google has deprecated custom URI scheme redirects for on Android.
 */
export function configureGoogleSignIn(): void {
  if (googleSignInConfigured) return;
  const webClientId = readGoogleClientId();
  if (!webClientId) return;
  GoogleSignin.configure({
    webClientId,
    iosClientId: readGoogleIosClientId(),
  });
  googleSignInConfigured = true;
}

export type GoogleSignInOutcome =
  | { type: 'success'; idToken: string }
  | { type: 'cancelled' };

/** Runs the native Google Sign-In sheet and returns an ID token for Supabase. */
export async function signInWithGoogleNative(): Promise<GoogleSignInOutcome> {
  configureGoogleSignIn();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return { type: 'cancelled' };
    }
    const idToken = response.data.idToken;
    if (!idToken) {
      throw new Error('Google did not return an ID token');
    }
    return { type: 'success', idToken };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { type: 'cancelled' };
    }
    throw error;
  }
}

export function isAppleSignInAvailable(): boolean {
  return Platform.OS === 'ios';
}

export async function signInWithApple(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple Sign In is not available on this device');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign In did not return an identity token');
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;

  if (credential.fullName?.givenName) {
    const { data: sessionData } = await supabase.auth.getSession();
    const existingName = sessionData.session?.user.user_metadata?.first_name;
    if (!existingName) {
      await supabase.auth.updateUser({
        data: { first_name: credential.fullName.givenName },
      });
    }
  }
}

export async function signInWithGoogle(idToken: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) throw error;
}

/**
 * Web only: redirect through Supabase so Google uses the callback URL already
 * registered in Google Cloud. Native (Android/iOS) uses signInWithGoogleNative
 * above instead -- there's no browser redirect involved there at all.
 */
export async function signInWithGoogleOAuth(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) throw error;
}

export function buildGoogleAuthRequest() {
  const webClientId = readGoogleClientId();
  const iosClientId = readGoogleIosClientId();
  const androidClientId = readGoogleAndroidClientId();

  return {
    webClientId,
    iosClientId,
    androidClientId,
    // Native Google Sign-In (Android/iOS) needs no redirect_uri -- it's only web
    // (signInWithGoogleOAuth) that still redirects through Supabase.
    // webClientId specifically is required (configureGoogleSignIn needs it to mint
    // an ID token) -- iosClientId/androidClientId alone isn't enough to sign in.
    isConfigured: Boolean(webClientId),
  };
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
