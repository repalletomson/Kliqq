import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// 🔑 REPLACE THIS WITH YOUR ACTUAL SUPABASE ANON KEY
// Get it from: https://hwvomwowaqwlydyqkdig.supabase.co → Settings → API
const supabaseUrl = 'https://vsupqohqsgmpvzaszmtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdXBxb2hxc2dtcHZ6YXN6bXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjYzNjMsImV4cCI6MjA2NDYwMjM2M30.oo9u0aVp_mXugg6ZdrZuv2FDRZrRtz0Uy9IoextLOHc';

// Validate that you've replaced the placeholder
if (supabaseAnonKey === 'REPLACE_WITH_YOUR_ACTUAL_ANON_KEY_FROM_SUPABASE_DASHBOARD') {
  console.error('❌ PLEASE UPDATE YOUR SUPABASE API KEY!');
  console.error('📖 Go to: https://hwvomwowaqwlydyqkdig.supabase.co → Settings → API');
  console.error('📋 Copy the "anon public" key and replace the placeholder in supabaseConfig.js');
  Alert.alert('Setup Required', 'Please update your Supabase API key in config/supabaseConfig.js');
}

console.log('🔧 Connecting to Supabase at:', supabaseUrl);

// Create Supabase client FIRST
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
// const { data, error } = await supabase.functions.invoke('send-push-notification', {
//   body: { name: 'Functions' },
// });
// console.log(data);  
// Test connectivity function
const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // First test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth connection failed:', authError.message);
      throw authError;
    }
    console.log('✅ Auth connection successful');

    // Then test database connection
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connectivity failed:', error.message);
    Alert.alert(
      'Connection Error',
      'Failed to connect to Supabase. Please check your internet connection and API credentials.'
    );
    return false;
  }
};

// Test connection after client is created
testConnection();

// Export helper functions
export const supabaseStorage = supabase.storage;
export const supabaseAuth = supabase.auth;

// Handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  } else if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account.';
  } else if (error.message?.includes('Network request failed')) {
    return 'Network connection failed. Please check your internet connection.';
  } else if (error.code === 'auth/user-not-found') {
    return 'No account found with this email address.';
  } else if (error.code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  } else if (error.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  } else if (error.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters long.';
  } else if (error.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Auth helper functions
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: handleSupabaseError(error) };
  }
};

export const initializeAuth = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// --- Realtime Subscriptions ---
// Usage: subscribeToRealtime('posts', (payload) => { ... })
export const subscribeToRealtime = (table, callback) => {
  return supabase.channel('public:' + table)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
};

// Helper for posts, comments, likes
export const subscribeToPosts = (callback) => subscribeToRealtime('posts', callback);
export const subscribeToComments = (callback) => subscribeToRealtime('comments', callback);
export const subscribeToLikes = (callback) => subscribeToRealtime('likes', callback);

export default supabase; 