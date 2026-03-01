'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { geocodeAddress } from '@/lib/mapbox';
import { Button } from '@/components/UI/Button';
import { Input, Select } from '@/components/UI/Input';
import { useToast } from '@/components/UI/Toast';
import type { UserRole } from '@/types';
import type { Database } from '@/lib/database.types';

export default function RegisterPage() {
  const supabase  = createClient();
  const router    = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    email: '', password: '', org_name: '', role: 'restaurant' as UserRole, address: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up with Supabase Auth
    const { data, error: signupErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signupErr || !data.user) {
      toast(signupErr?.message ?? 'Sign up failed', 'error');
      setLoading(false);
      return;
    }

    // 2. Geocode address for map placement
    let lat: number | null = null;
    let lng: number | null = null;
    if (form.address) {
      const coords = await geocodeAddress(form.address);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    }

    // 3. Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id:       data.user.id,
      role:     form.role,
      org_name: form.org_name,
      address:  form.address || null,
      lat:      lat,
      lng:      lng,
    });

    if (profileErr) {
      toast(profileErr.message, 'error');
      setLoading(false);
      return;
    }

    toast('Account created! Welcome to GreenBridge 🌿');
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🌉
          </div>
          <h1 className="font-fraunces text-3xl font-medium text-forest">Join GreenBridge</h1>
          <p className="text-muted text-sm mt-1">Start rescuing food today</p>
        </div>

        <div className="bg-white rounded-2xl border border-forest/7 p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <Select label="I am a…" value={form.role} onChange={set('role')}>
              <option value="restaurant">🍽 Restaurant / Food Business</option>
              <option value="shelter">🏠 Shelter / Food Bank</option>
            </Select>

            <Input
              label="Organisation Name"
              value={form.org_name}
              onChange={set('org_name')}
              placeholder={form.role === 'restaurant' ? 'e.g. The Garden Bistro' : 'e.g. Sunrise Shelter'}
              required
            />
            <Input
              label="Address"
              value={form.address}
              onChange={set('address')}
              placeholder="123 Main St, New York, NY"
              hint="Used to place you on the map"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@org.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min 8 characters"
              minLength={8}
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              Create Account →
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-sage font-medium hover:text-fern">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
