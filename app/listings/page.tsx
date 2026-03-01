'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { FoodCard } from '@/components/FoodCard/FoodCard';
import { MapView } from '@/components/Map/MapView';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useClaims } from '@/hooks/useClaims';
import { useToast } from '@/components/UI/Toast';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import type { FoodCategory } from '@/types';

const CATEGORIES: Array<FoodCategory | 'All'> = ['All', 'Produce', 'Bakery', 'Cooked Meals', 'Meat', 'Dairy', 'Beverages'];

export default function ListingsPage() {
  const { profile }   = useAuth();
  const { toast }     = useToast();
  const [filter, setFilter]     = useState<FoodCategory | 'All'>('All');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [view, setView]         = useState<'list' | 'map'>('list');

  const { listings, loading } = useListings({
    restaurantId: profile?.role === 'restaurant' ? profile.id : undefined,
    statusFilter: 'available',
  });

  const { claimListing, claims } = useClaims(profile?.id);
  const claimedIds = new Set(claims.map(c => c.listing_id));

  const filtered = filter === 'All'
    ? listings
    : listings.filter(l => l.category === filter);

  const mapListings = listings
    .filter(l => l.lat && l.lng)
    .map(l => ({ id: l.id, lat: l.lat!, lng: l.lng!, name: l.name, status: l.status }));

  async function handleClaim(listingId: string) {
    if (!profile) return;
    setClaimingId(listingId);
    const { error } = await claimListing(listingId, profile.id);
    if (error) toast(error.message, 'error');
    else toast('✅ Claimed! See your Claims page for pickup details.');
    setClaimingId(null);
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <Topbar
        title={profile?.role === 'restaurant' ? 'My Listings 📋' : 'Available Food 🔍'}
        subtitle={
          profile?.role === 'restaurant'
            ? 'Manage your active surplus listings'
            : `${filtered.length} listings available near you`
        }
        actions={
          profile?.role === 'restaurant' ? (
            <Link href="/upload">
              <Button size="sm">+ Upload Surplus</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="p-8">
        {/* Filters + view toggle */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={filter === cat ? 'primary' : 'outline'}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}>☰ List</Button>
            <Button size="sm" variant={view === 'map' ? 'primary' : 'outline'} onClick={() => setView('map')}>🗺 Map</Button>
          </div>
        </div>

        {view === 'map' && (
          <Card className="p-0 overflow-hidden mb-5">
            <MapView listings={mapListings} height={380} />
          </Card>
        )}

        <Card className="p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="font-fraunces text-lg text-forest mb-2">No listings found</h3>
              <p className="text-sm text-muted">
                {profile?.role === 'restaurant'
                  ? 'Post your first surplus listing to get started.'
                  : 'No food available in this category right now. Check back soon!'}
              </p>
              {profile?.role === 'restaurant' && (
                <Link href="/upload" className="inline-block mt-4">
                  <Button>+ Upload Surplus</Button>
                </Link>
              )}
            </div>
          ) : (
            filtered.map(listing => (
              <FoodCard
                key={listing.id}
                listing={listing}
                role={profile?.role ?? 'shelter'}
                isClaimed={claimedIds.has(listing.id)}
                onClaim={handleClaim}
                claimLoading={claimingId === listing.id}
              />
            ))
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
