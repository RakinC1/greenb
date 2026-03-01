'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { Card } from '@/components/UI/Card';
import { MapView } from '@/components/Map/MapView';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useClaims } from '@/hooks/useClaims';
import { useToast } from '@/components/UI/Toast';
import { formatCO2, formatWater } from '@/lib/impact';
import type { ListingWithProfile } from '@/types';

export default function ListingDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { profile } = useAuth();
  const { toast }   = useToast();
  const { claimListing, claims } = useClaims(profile?.id);
  const [listing, setListing] = useState<ListingWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const supabase = createClient();
  const isClaimed = claims.some(c => c.listing_id === id);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, profiles(org_name, lat, lng, address)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setListing(data as ListingWithProfile); setLoading(false); });
  }, [id]);

  async function handleClaim() {
    if (!profile || !listing) return;
    setClaiming(true);
    const { error } = await claimListing(listing.id, profile.id);
    if (error) toast(error.message, 'error');
    else { toast('✅ Claimed successfully!'); router.push('/claims'); }
    setClaiming(false);
  }

  if (loading || !listing) {
    return <AppLayout><div className="p-8 text-muted">Loading…</div></AppLayout>;
  }

  const mapListings = listing.lat && listing.lng
    ? [{ id: listing.id, lat: listing.lat, lng: listing.lng, name: listing.name, status: listing.status }]
    : [];

  return (
    <AppLayout>
      <Topbar
        title={listing.name}
        subtitle={`From ${listing.profiles?.org_name}`}
        actions={
          <Link href="/listings">
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
        }
      />

      <div className="p-8 grid grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          {/* Main info */}
          <Card className="p-6">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-moss/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                📦
              </div>
              <div className="flex-1">
                <h2 className="font-fraunces text-2xl font-medium text-forest">{listing.name}</h2>
                <p className="text-muted text-sm mt-1">
                  🏪 {listing.profiles?.org_name} • 📍 {listing.profiles?.address ?? 'Address not set'}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge variant="default">🏷 {listing.category}</Badge>
                  {listing.dietary_tags?.map(tag => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-forest/7">
              <div className="text-center">
                <div className="font-fraunces text-3xl font-bold text-forest">{listing.quantity}</div>
                <div className="text-xs text-muted mt-1">{listing.unit}</div>
              </div>
              <div className="text-center border-x border-forest/7">
                <div className="font-fraunces text-3xl font-bold text-forest">
                  {Math.max(0, Math.round((new Date(listing.expires_at).getTime() - Date.now()) / 3_600_000))}h
                </div>
                <div className="text-xs text-muted mt-1">Until Expiry</div>
              </div>
              <div className="text-center">
                <div className="font-fraunces text-3xl font-bold text-forest capitalize">{listing.status}</div>
                <div className="text-xs text-muted mt-1">Status</div>
              </div>
            </div>
          </Card>

          {/* Map */}
          {mapListings.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <MapView listings={mapListings} height={300} />
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Action card */}
          <Card className="p-5">
            {profile?.role === 'shelter' ? (
              <>
                <h3 className="font-fraunces text-lg font-medium text-forest mb-3">Claim this listing</h3>
                <p className="text-sm text-muted mb-4 leading-relaxed">
                  Claiming reserves this food for your organisation. Coordinate pickup directly with the restaurant.
                </p>
                {isClaimed ? (
                  <Badge variant="claimed" className="w-full justify-center py-2">✓ You claimed this</Badge>
                ) : listing.status !== 'available' ? (
                  <Badge variant="urgent" className="w-full justify-center py-2">No longer available</Badge>
                ) : (
                  <Button className="w-full" onClick={handleClaim} loading={claiming}>
                    🤝 Claim Food
                  </Button>
                )}
              </>
            ) : (
              <>
                <h3 className="font-fraunces text-lg font-medium text-forest mb-3">Manage listing</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">✏️ Edit Details</Button>
                  <Button variant="danger" className="w-full">🗑 Remove Listing</Button>
                </div>
              </>
            )}
          </Card>

          {/* Environmental impact */}
          <div className="bg-gradient-to-br from-forest to-moss rounded-2xl p-5 text-white">
            <div className="text-[10px] text-mint uppercase tracking-widest mb-3">If Rescued</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🌱', val: formatCO2(listing.co2_saved), label: 'CO₂ Saved' },
                { icon: '💧', val: formatWater(listing.water_saved), label: 'Water Saved' },
                { icon: '🍽', val: `~${Math.floor(listing.quantity / 0.35)}`, label: 'Meals' },
                { icon: '♻️', val: '0 kg', label: 'To Landfill' },
              ].map(item => (
                <div key={item.label} className="bg-white/8 rounded-xl p-3 text-center">
                  <div className="text-xl">{item.icon}</div>
                  <div className="font-fraunces text-lg font-bold text-white mt-1">{item.val}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
