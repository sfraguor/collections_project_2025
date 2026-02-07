import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../utils/supabase';

// Ensure WebBrowser closes correctly after OAuth
WebBrowser.maybeCompleteAuthSession();

// Create the authentication context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on component mount
    checkUser();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Supabase auth event: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Check if there's an active user session
  async function checkUser() {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('🔐 Checking auth session...');
      console.log('   Session found:', currentSession ? 'YES' : 'NO');
      if (currentSession) {
        console.log('   User email:', currentSession.user?.email);
        console.log('   User ID:', currentSession.user?.id);
      }
      setSession(currentSession);
      setUser(currentSession?.user || null);
    } catch (error) {
      console.error('Error checking auth session:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Sign up with email and password
  async function signUp({ email, password, name }) {
    try {
      setLoading(true);
      
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  // Sign in with email and password
  async function signIn({ email, password }) {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  // Sign in with Google OAuth
  async function signInWithGoogle() {
    try {
      setLoading(true);
      console.log('🔵 Starting Google Sign-In...');

      // Get the correct redirect URL for the current environment
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'auth/callback',
      });
      
      console.log('🔵 Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      console.log('🔵 OAuth URL received:', data?.url);

      // Open the OAuth URL in browser
      if (data?.url) {
        console.log('🔵 Opening browser...');
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('🔵 Browser result:', result);

        if (result.type === 'success') {
          console.log('🟢 OAuth success! URL:', result.url);
          // Extract tokens from URL
          const url = result.url;
          const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          console.log('🔵 Access token found:', !!accessToken);

          if (accessToken) {
            // Set the session with the tokens
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) throw sessionError;
            console.log('🟢 Session set successfully!');
            return { data: sessionData, error: null };
          }
        } else {
          console.log('🔴 OAuth result type:', result.type);
        }

        return { data: null, error: new Error('OAuth was cancelled') };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error.message);
      Alert.alert('Error signing out', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Send password reset email
  async function forgotPassword(email) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'coleccionesapp://reset-password',
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  }

  // Reset password with new password
  async function resetPassword(newPassword) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  }

  // Update user profile
  async function updateProfile({ name, avatar_url }) {
    try {
      setLoading(true);
      
      const updates = {
        data: {
          full_name: name,
          avatar_url,
        },
      };
      
      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  }

  // The value passed to the Provider gives access to these functions and state to any components that use useAuth()
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
