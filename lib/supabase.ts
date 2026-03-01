import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

// Browser-side Supabase client (use in Client Components & hooks)
export const createClient = () =>
  createClientComponentClient<Database>();

// Re-export for convenience
export { createClientComponentClient };
