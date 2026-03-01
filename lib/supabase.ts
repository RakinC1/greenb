import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackAnonKey = 'public-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(publicUrl && anonKey);

// Browser-side Supabase client (use in Client Components & hooks)
export const createClient = () =>
  createClientComponentClient({
    supabaseUrl: publicUrl ?? fallbackUrl,
    supabaseKey: anonKey ?? fallbackAnonKey,
  });

// Re-export for convenience
export { createClientComponentClient };
