import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Logged in → go to dashboard, else → login
  if (session) redirect('/dashboard');
  else redirect('/login');
}
