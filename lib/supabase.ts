import { createClient } from '@supabase/supabase-js'

const fallbackSupabaseUrl = 'https://yqlxcjxmpjupmsqelqyo.supabase.co'
const fallbackSupabasePublishableKey =
  'sb_publishable_0K5GExvDtu_XsC5u_PYnXg_WBO8LNFb'

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || fallbackSupabaseUrl

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  fallbackSupabasePublishableKey

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
