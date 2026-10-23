/**
 * ==============================================================================
 * SUPABASE CLIENT INITIALIZATION & SAFE FALLBACK
 * ==============================================================================
 * Initialized with client-side VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * NEVER imports or exposes the service_role key.
 * If credentials are not yet configured in .env, warns in console and provides
 * safe offline fallbacks so the site remains 100% functional for visitors.
 * ==============================================================================
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here'
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase Notice] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured yet in .env.\n' +
    'The portfolio is currently serving high-performance built-in content.\n' +
    'To enable the live admin editing system, add your project credentials to .env.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'arman_supabase_auth_token',
      },
    })
  : null;
