import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Use in API Route Handlers
export const createRouteClient = () =>
  createRouteHandlerClient({ cookies });

// Use in Server Components
export const createServerClient = () =>
  createServerComponentClient({ cookies });

// Admin client — full access, server only, never expose to browser
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
