import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackAnonKey = 'public-anon-key-placeholder';
const fallbackServiceRoleKey = 'service-role-key-placeholder';

const publicClientConfig = {
  supabaseUrl: publicUrl ?? fallbackUrl,
  supabaseKey: anonKey ?? fallbackAnonKey,
};

// Use in API Route Handlers
export const createRouteClient = () =>
  createRouteHandlerClient({ cookies }, publicClientConfig);

// Use in Server Components
export const createServerClient = () =>
  createServerComponentClient({ cookies }, publicClientConfig);

// Admin client — full access, server only, never expose to browser
export const createAdminClient = () =>
  createClient(
    publicUrl ?? fallbackUrl,
    serviceRoleKey ?? fallbackServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
