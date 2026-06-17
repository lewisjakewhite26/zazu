import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

import { getSupabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

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

export function getGoogleRedirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: 'zazu', path: 'auth/callback' });
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

/** Web: redirect through Supabase so Google uses the callback URL already in Google Cloud. */
export async function signInWithGoogleOAuth(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const redirectTo =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : AuthSession.makeRedirectUri({ scheme: 'zazu', path: 'auth/callback' });

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
    redirectUri: getGoogleRedirectUri(),
    isConfigured: Boolean(webClientId || iosClientId || androidClientId),
  };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
