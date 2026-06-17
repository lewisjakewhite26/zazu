import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';

import {
  getDisplayName,
  hydrateLocalProgressFromUser,
  migrateAnonymousProgressToAccount,
  saveUserFirstName,
  userNeedsName,
} from '../../lib/progress-sync';
import {
  readOnboardingFlags,
  setOnboardingFlags,
} from '../../lib/progress-storage';
import { getSupabase, initSupabaseAuth } from '../../lib/supabase';
import {
  signInWithApple,
  signInWithGoogle,
  signOut as authSignOut,
} from '@/services/auth';

import { AuthContext, type AuthContextValue } from './auth-context';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const router = useRouter();
  const segments = useSegments();

  const user = session?.user ?? null;
  const displayName = getDisplayName(user);
  const needsName = Boolean(session && userNeedsName(user));

  const refreshOnboardingFlags = useCallback(async () => {
    const flags = await readOnboardingFlags();
    setHasOnboarded(flags.hasOnboarded);
    setIsAnonymous(flags.isAnonymous);
    return flags;
  }, []);

  useEffect(() => {
    initSupabaseAuth(AsyncStorage);
    const supabase = getSupabase();
    if (!supabase) {
      void refreshOnboardingFlags().finally(() => setReady(true));
      return;
    }

    let cancelled = false;

    void (async () => {
      const flags = await readOnboardingFlags();
      if (cancelled) return;

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      setHasOnboarded(flags.hasOnboarded);
      setIsAnonymous(flags.isAnonymous);
      setSession(data.session);

      if (data.session?.user) {
        if (flags.isAnonymous) {
          await migrateAnonymousProgressToAccount(data.session.user);
        } else {
          await hydrateLocalProgressFromUser(data.session.user);
        }
        await setOnboardingFlags({ hasOnboarded: true, isAnonymous: false });
        setHasOnboarded(true);
        setIsAnonymous(false);
      }

      setReady(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.user) return;

      const flags = await readOnboardingFlags();
      if (event === 'SIGNED_IN') {
        if (flags.isAnonymous) {
          await migrateAnonymousProgressToAccount(nextSession.user);
        } else {
          await hydrateLocalProgressFromUser(nextSession.user);
        }
        await setOnboardingFlags({ hasOnboarded: true, isAnonymous: false });
        setHasOnboarded(true);
        setIsAnonymous(false);
        return;
      }

      if (!flags.isAnonymous) {
        await hydrateLocalProgressFromUser(nextSession.user);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [refreshOnboardingFlags]);

  useEffect(() => {
    if (!ready) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const onboardingScreen = segments[1];

    if (session && !needsName) {
      if (inOnboarding) {
        router.replace('/(tabs)');
      }
      return;
    }

    if (session && needsName) {
      if (!inOnboarding || onboardingScreen !== 'name') {
        router.replace('/(onboarding)/name');
      }
      return;
    }

    if (session || (hasOnboarded && isAnonymous)) {
      if (inOnboarding) {
        const screen = onboardingScreen;
        if (screen !== 'sign-in' && screen !== 'name') {
          router.replace('/(tabs)');
        }
      }
      return;
    }

    if (!hasOnboarded) {
      if (!inOnboarding || onboardingScreen !== 'welcome') {
        router.replace('/(onboarding)/welcome');
      }
      return;
    }

    if (!session && !isAnonymous) {
      if (!inOnboarding || onboardingScreen !== 'sign-in') {
        router.replace('/(onboarding)/sign-in');
      }
    }
  }, [
    ready,
    session,
    hasOnboarded,
    isAnonymous,
    needsName,
    segments,
    router,
  ]);

  const continueAsGuest = useCallback(async () => {
    setAuthError(null);
    await setOnboardingFlags({ hasOnboarded: true, isAnonymous: true });
    setHasOnboarded(true);
    setIsAnonymous(true);
    router.replace('/(tabs)');
  }, [router]);

  const goToSignIn = useCallback(() => {
    setAuthError(null);
    router.replace('/(onboarding)/sign-in');
  }, [router]);

  const handleOAuthSuccess = useCallback(
    async (signedInUser: User, wasAnonymous: boolean) => {
      if (wasAnonymous) {
        await migrateAnonymousProgressToAccount(signedInUser);
      } else {
        await hydrateLocalProgressFromUser(signedInUser);
      }

      await setOnboardingFlags({ hasOnboarded: true, isAnonymous: false });
      setHasOnboarded(true);
      setIsAnonymous(false);

      if (userNeedsName(signedInUser)) {
        router.replace('/(onboarding)/name');
      } else {
        router.replace('/(tabs)');
      }
    },
    [router],
  );

  const signInApple = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const flags = await readOnboardingFlags();
      await signInWithApple();
      const supabase = getSupabase();
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      if (!data.session?.user) throw new Error('Sign in failed');
      await handleOAuthSuccess(data.session.user, flags.isAnonymous);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      if (!message.toLowerCase().includes('cancel')) {
        setAuthError(message);
      }
    } finally {
      setAuthBusy(false);
    }
  }, [handleOAuthSuccess]);

  const signInGoogle = useCallback(
    async (idToken: string) => {
      setAuthBusy(true);
      setAuthError(null);
      try {
        const flags = await readOnboardingFlags();
        await signInWithGoogle(idToken);
        const supabase = getSupabase();
        const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
        if (!data.session?.user) throw new Error('Sign in failed');
        await handleOAuthSuccess(data.session.user, flags.isAnonymous);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign in failed';
        setAuthError(message);
        throw error;
      } finally {
        setAuthBusy(false);
      }
    },
    [handleOAuthSuccess],
  );

  const saveName = useCallback(
    async (firstName: string) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase is not configured');
      setAuthBusy(true);
      setAuthError(null);
      try {
        await saveUserFirstName(supabase, firstName);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        router.replace('/(tabs)');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not save name';
        setAuthError(message);
        throw error;
      } finally {
        setAuthBusy(false);
      }
    },
    [router],
  );

  const signOut = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await authSignOut();
      await setOnboardingFlags({ isAnonymous: false });
      setIsAnonymous(false);
      setSession(null);
      router.replace('/(onboarding)/sign-in');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setAuthError(message);
    } finally {
      setAuthBusy(false);
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      user,
      displayName,
      hasOnboarded,
      isAnonymous,
      needsName,
      authBusy,
      authError,
      continueAsGuest,
      goToSignIn,
      signInApple,
      signInGoogle,
      saveName,
      signOut,
      clearAuthError: () => setAuthError(null),
    }),
    [
      ready,
      session,
      user,
      displayName,
      hasOnboarded,
      isAnonymous,
      needsName,
      authBusy,
      authError,
      continueAsGuest,
      goToSignIn,
      signInApple,
      signInGoogle,
      saveName,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './auth-context';
