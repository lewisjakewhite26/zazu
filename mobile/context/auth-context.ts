import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  displayName: string | null;
  hasOnboarded: boolean;
  isAnonymous: boolean;
  needsName: boolean;
  authBusy: boolean;
  authError: string | null;
  continueAsGuest: () => Promise<void>;
  goToSignIn: () => void;
  signInApple: () => Promise<void>;
  signInGoogle: (idToken: string) => Promise<void>;
  saveName: (firstName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
