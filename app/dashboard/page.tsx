'use client';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { StatsGrid } from '@/components/Dashboard/StatsGrid';
import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { PredictionWidget } from '@/components/AI/PredictionWidget';
import { FoodCard } from '@/components/FoodCard/FoodCard';
import { Card, CardHeader } from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useClaims } from '@/hooks/useClaims';
import { useToast } from '@/components/UI/Toast';
import { PageLoader } from '@/components/UI/LoadingSpinner';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ meals: 2841, co2: 4.7, waterL: 18400, rescues: 187 });
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Listings: show urgent ones on dashboard
  const { listings, loading } = useListings({
    statusFilter: 'available',
    limit: 5,
  });

  const { claimListing } = useClaims(profile?.id);

  // Tick up live counters
  useEffect(() => {
    const t = setInterval(() => {
      setStats(s => ({
        meals:   s.meals + Math.floor(Math.random() * 2),
        co2:     parseFloat((s.co2 + 0.01).toFixed(2)),
        waterL:  s.waterL + Math.floor(Math.random() * 25),
        rescues: s.rescues,
      }));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  async function handleClaim(listingId: string) {
    if (!profile) return;
    setClaimingId(listingId);
    const { error } = await claimListing(listingId, profile.id);
    if (error) toast(error.message, 'error');
    else toast('✅ Claimed! Check your claims page for pickup details.');
    setClaimingId(null);
  }

  const urgentListings = listings.filter(l => {
    const hoursLeft = (new Date(l.expires_at).getTime() - Date.now()) / 3_600_000;
    return hoursLeft <= 4;
  });

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <Topbar
        title={`Welcome back, ${profile?.org_name ?? '…'} 👋`}
        subtitle={
          profile?.role === 'restaurant'
            ? `You have ${listings.length} active listings`
            : `${listings.length} food listings are available near you`
        }
        urgentCount={urgentListings.length}
      />

      <div className="p-8">
        <StatsGrid
          meals={stats.meals}
          co2Kg={stats.co2}
          waterL={stats.waterL}
          rescues={stats.rescues}
        />

        <div className="grid grid-cols-[1fr_340px] gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <Card className="p-5">
              <CardHeader title="🔥 Urgent Listings" action="View all →" />
              {urgentListings.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No urgent listings right now.</p>
              ) : (
                urgentListings.map(listing => (
                  <FoodCard
                    key={listing.id}
                    listing={listing}
                    role={profile?.role ?? 'shelter'}
                    isClaimed={false}
                    onClaim={handleClaim}
                    claimLoading={claimingId === listing.id}
                  />
                ))
              )}
            </Card>
            <ActivityFeed />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <PredictionWidget />
            {/* Quick impact card */}
            <Card className="p-5">
              <CardHeader title="🌍 Platform Impact" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🌱', val: `${stats.co2}t`, label: 'CO₂ Saved' },
                  { icon: '💧', val: `${(stats.waterL / 1000).toFixed(0)}k L`, label: 'Water Saved' },
                  { icon: '🍽', val: `${(stats.meals / 1000).toFixed(1)}k`, label: 'Meals' },
                  { icon: '🏪', val: '84', label: 'Restaurants' },
                ].map(item => (
                  <div key={item.label} className="bg-cream rounded-xl p-3 text-center border border-forest/7">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-fraunces text-xl font-bold text-forest">{item.val}</div>
                    <div className="text-[10px] text-muted mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Monthly Goal</span>
                  <span className="font-medium text-sage">73%</span>
                </div>
                <div className="h-1.5 bg-forest/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sage to-fern rounded-full w-[73%]" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
