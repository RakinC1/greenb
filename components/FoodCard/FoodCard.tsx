'use client';
import Image from 'next/image';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import type { ListingWithProfile, UserRole } from '@/types';

const CATEGORY_EMOJI: Record<string, string> = {
  Produce:       '🥗',
  Meat:          '🍗',
  Dairy:         '🥛',
  Bakery:        '🍞',
  'Cooked Meals':'🍲',
  Beverages:     '☕',
  Other:         '📦',
};

function getUrgencyTag(expiresAt: string): 'fresh' | 'urgent' | 'expiring' {
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  const hoursLeft = msLeft / 3_600_000;
  if (hoursLeft <= 1.5) return 'expiring';
  if (hoursLeft <= 4)   return 'urgent';
  return 'fresh';
}

function formatExpiry(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h <= 0) return `${m}m left`;
  if (h < 24) return `${h}h ${m}m left`;
  return `${Math.floor(h / 24)}d left`;
}

interface FoodCardProps {
  listing: ListingWithProfile;
  role: UserRole;
  isClaimed?: boolean;
  onClaim?: (listingId: string) => void;
  onEdit?: (listingId: string) => void;
  claimLoading?: boolean;
}

export function FoodCard({
  listing,
  role,
  isClaimed = false,
  onClaim,
  onEdit,
  claimLoading = false,
}: FoodCardProps) {
  const urgency = getUrgencyTag(listing.expires_at);
  const urgencyLabel = { fresh: '✅ Fresh', urgent: '⚡ Urgent', expiring: '🔴 Expiring' }[urgency];

  return (
    <div className={`
      flex items-center gap-4 p-3 rounded-xl mb-2
      border transition-all duration-150 cursor-pointer
      ${isClaimed
        ? 'border-fern/30 bg-fern/5'
        : 'border-forest/7 bg-cream hover:border-fern hover:bg-fern/5'
      }
    `}>
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-moss/20 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
        {listing.photo_url ? (
          <Image src={listing.photo_url} alt={listing.name} width={56} height={56} className="object-cover w-full h-full" />
        ) : (
          <span>{CATEGORY_EMOJI[listing.category] ?? '📦'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-forest truncate">{listing.name}</div>
        <div className="text-xs text-muted mt-0.5 flex flex-wrap gap-x-3">
          <span>🏪 {listing.profiles?.org_name}</span>
          <span>🏷 {listing.category}</span>
          <span>⏰ {formatExpiry(listing.expires_at)}</span>
        </div>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Badge variant={urgency}>{urgencyLabel}</Badge>
          <span className="text-[10px] text-muted">🌱 saves {listing.co2_saved}kg CO₂</span>
          {listing.dietary_tags?.map(tag => (
            <span key={tag} className="text-[10px] bg-forest/5 text-muted px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right: quantity + action */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-right">
          <span className="font-fraunces text-xl font-bold text-forest">{listing.quantity}</span>
          <span className="text-[10px] text-muted ml-1">{listing.unit}</span>
        </div>

        {role === 'shelter' ? (
          isClaimed ? (
            <Badge variant="claimed">✓ Claimed</Badge>
          ) : (
            <Button size="sm" onClick={() => onClaim?.(listing.id)} loading={claimLoading}>
              Claim
            </Button>
          )
        ) : (
          <Button size="sm" variant="outline" onClick={() => onEdit?.(listing.id)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
