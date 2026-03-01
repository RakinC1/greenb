'use client';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { Card, CardHeader } from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useClaims } from '@/hooks/useClaims';
import { useToast } from '@/components/UI/Toast';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { formatCO2, formatWater } from '@/lib/impact';
import type { Claim } from '@/types';

function ClaimCard({ claim, onConfirm }: { claim: Claim; onConfirm: (id: string) => void }) {
  const listing = (claim as any).listings;
  if (!listing) return null;

  return (
    <div className={`
      flex gap-4 p-4 rounded-xl border transition-all mb-3
      ${claim.pickup_confirmed
        ? 'border-fern/30 bg-fern/5'
        : 'border-forest/8 bg-cream hover:border-fern/30'
      }
    `}>
      {/* Icon */}
      <div className="w-14 h-14 bg-moss/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        📦
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-forest">{listing.name}</div>
        <div className="text-xs text-muted mt-0.5">
          🏪 {listing.profiles?.org_name ?? 'Restaurant'}
          {listing.profiles?.address && ` • 📍 ${listing.profiles.address}`}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs text-muted">
            {listing.quantity} {listing.unit} •{' '}
            Claimed {new Date(claim.claimed_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2 mt-1.5 text-[10px] text-muted">
          <span>🌱 saves {formatCO2(listing.co2_saved)}</span>
          <span>💧 {formatWater(listing.water_saved)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        {claim.pickup_confirmed
          ? <Badge variant="claimed">✓ Picked Up</Badge>
          : <Badge variant="urgent">⏳ Pending</Badge>
        }
        {!claim.pickup_confirmed && (
          <Button size="sm" onClick={() => onConfirm(claim.id)}>
            Confirm Pickup
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  const { profile }            = useAuth();
  const { toast }              = useToast();
  const { claims, loading, confirmPickup } = useClaims(profile?.id);

  const pending   = claims.filter(c => !c.pickup_confirmed);
  const completed = claims.filter(c =>  c.pickup_confirmed);

  async function handleConfirm(claimId: string) {
    const { error } = await confirmPickup(claimId);
    if (error) toast(error.message, 'error');
    else toast('✅ Pickup confirmed! Thank you for rescuing food.');
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  // Impact totals from confirmed pickups
  const totalCO2   = completed.reduce((s, c) => s + ((c as any).listings?.co2_saved ?? 0), 0);
  const totalWater = completed.reduce((s, c) => s + ((c as any).listings?.water_saved ?? 0), 0);

  return (
    <AppLayout>
      <Topbar
        title="My Claims 📦"
        subtitle={`${pending.length} pending pickup${pending.length !== 1 ? 's' : ''}`}
      />

      <div className="p-8">
        {/* Impact summary */}
        {completed.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-forest/7 p-4 text-center">
              <div className="font-fraunces text-2xl font-bold text-forest">{completed.length}</div>
              <div className="text-xs text-muted mt-1">Completed Pickups</div>
            </div>
            <div className="bg-white rounded-2xl border border-forest/7 p-4 text-center">
              <div className="font-fraunces text-2xl font-bold text-forest">{formatCO2(totalCO2)}</div>
              <div className="text-xs text-muted mt-1">CO₂ Saved</div>
            </div>
            <div className="bg-white rounded-2xl border border-forest/7 p-4 text-center">
              <div className="font-fraunces text-2xl font-bold text-forest">{formatWater(totalWater)}</div>
              <div className="text-xs text-muted mt-1">Water Saved</div>
            </div>
          </div>
        )}

        {claims.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-fraunces text-lg text-forest mb-2">No claims yet</h3>
            <p className="text-sm text-muted">Browse available food and claim listings to see them here.</p>
          </Card>
        ) : (
          <>
            {pending.length > 0 && (
              <Card className="p-5 mb-5">
                <CardHeader title="⏳ Pending Pickup" />
                {pending.map(claim => (
                  <ClaimCard key={claim.id} claim={claim} onConfirm={handleConfirm} />
                ))}
              </Card>
            )}

            {completed.length > 0 && (
              <Card className="p-5">
                <CardHeader title="✅ Completed" />
                {completed.map(claim => (
                  <ClaimCard key={claim.id} claim={claim} onConfirm={handleConfirm} />
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
