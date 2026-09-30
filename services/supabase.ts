import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://klizeosctrqqgxmxsiif.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaXplb3NjdHJxcWd4bXhzaWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDgyOTMsImV4cCI6MjEwNjMyNDI5M30.RYfohBuUfovEATz0M6BaeNYgdmsf1Z3rwYNMbRP52-Q';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('demo-sakutrack')
);

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
