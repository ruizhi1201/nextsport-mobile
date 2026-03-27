import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    []
  );

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // For pilot: skip email confirmation by using emailRedirectTo that auto-confirms
        emailRedirectTo: undefined,
      },
    });
    if (error) throw error;
    // If email confirmation is required, session will be null but user exists
    // We attempt to sign in immediately for pilot convenience
    if (!data.session && data.user) {
      // Try signing in immediately — works if Supabase has email confirmation disabled
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // Email confirmation still required — throw helpful message
        throw new Error('Account created! Check your email to confirm before logging in.');
      }
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
