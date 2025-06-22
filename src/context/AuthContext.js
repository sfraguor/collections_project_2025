import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';

// Create the authentication context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
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
