'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/UI/LoadingSpinner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ meals: 2841, co2: 4.7, waterL: 18400 });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Animate live counters
  useEffect(() => {
    const t = setInterval(() => {
      setStats(s => ({
        meals:  s.meals + Math.floor(Math.random() * 2),
        co2:    parseFloat((s.co2 + 0.01).toFixed(2)),
        waterL: s.waterL + Math.floor(Math.random() * 30),
      }));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar liveStats={stats} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
