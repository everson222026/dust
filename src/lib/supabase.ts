import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Configure EXPO_PUBLIC_SUPABASE_URL e ' +
        'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.'
    );
  }

  if (!client) {
    client = createClient<Database>(
      supabaseUrl!,
      supabasePublishableKey!,
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return client;
}
