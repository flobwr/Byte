import { type Session, type User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../services/supabase';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (message.includes('User already registered')) return 'Un compte existe déjà avec cet email.';
  if (message.includes('Password should be at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirme ton adresse email avant de te connecter.';
  }
  if (message.includes('Unable to validate email')) return 'Cette adresse email n’est pas valide.';
  if (message.includes('For security purposes')) {
    return 'Trop de tentatives — réessaie dans quelques instants.';
  }
  if (message.toLowerCase().includes('network')) {
    return 'Impossible de se connecter. Vérifie ta connexion internet.';
  }
  return 'Une erreur est survenue. Réessaie.';
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  signUp: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      set({ error: mapAuthError(error.message) });
      throw error;
    }
    return { needsEmailConfirmation: data.session == null };
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      set({ error: mapAuthError(error.message) });
      throw error;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  clearError: () => set({ error: null }),
}));

// `onAuthStateChange` fires immediately with the current session (restored
// from SecureStore/AsyncStorage) before any user action, which is what
// resolves the initial 'loading' status — no separate getSession() call needed.
supabase.auth.onAuthStateChange((_event, session: Session | null) => {
  useAuthStore.setState({
    user: session?.user ?? null,
    status: session ? 'signedIn' : 'signedOut',
  });
});
