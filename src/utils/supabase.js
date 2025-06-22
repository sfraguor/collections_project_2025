import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Supabase URL and anon key
// You'll get these from your Supabase project settings
const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
