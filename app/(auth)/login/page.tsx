'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { useToast } from '@/components/UI/Toast';

export default function LoginPage() {
  const supabase       = createClient();
  const router         = useRouter();
  const { toast }      = useToast();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast(error.message, 'error');
      setLoading(false);
    } else {
      toast('Welcome back! 🌿');
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🌉
          </div>
          <h1 className="font-fraunces text-3xl font-medium text-forest">GreenBridge</h1>
          <p className="text-muted text-sm mt-1">Food Rescue Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-forest/7 p-8 shadow-sm">
          <h2 className="font-fraunces text-xl font-medium text-forest mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to continue rescuing food</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign In →
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-sage font-medium hover:text-fern">
                Join GreenBridge
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Every meal rescued saves water, reduces CO₂, and feeds someone in need.
        </p>
      </div>
    </div>
  );
}
