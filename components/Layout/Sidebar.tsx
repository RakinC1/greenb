'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const restaurantNav: NavItem[] = [
  { icon: '📊', label: 'Dashboard',      href: '/dashboard'   },
  { icon: '📤', label: 'Upload Surplus', href: '/upload'      },
  { icon: '📋', label: 'My Listings',    href: '/listings'    },
  { icon: '🤖', label: 'AI Predictions', href: '/predictions' },
  { icon: '🌿', label: 'My Impact',      href: '/impact'      },
];

const shelterNav: NavItem[] = [
  { icon: '📊', label: 'Dashboard',     href: '/dashboard'   },
  { icon: '🔍', label: 'Browse Food',   href: '/listings'    },
  { icon: '📦', label: 'My Claims',     href: '/claims'      },
  { icon: '🤖', label: 'Predictions',   href: '/predictions' },
  { icon: '🌿', label: 'Our Impact',    href: '/impact'      },
];

interface SidebarProps {
  liveStats?: { meals: number; co2: number; waterL: number };
}

export function Sidebar({ liveStats }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const nav = profile?.role === 'shelter' ? shelterNav : restaurantNav;

  return (
    <aside className="w-[260px] min-w-[260px] bg-forest flex flex-col h-screen sticky top-0 overflow-hidden">

      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fern rounded-xl flex items-center justify-center text-xl shadow-md">
            🌉
          </div>
          <div>
            <div className="text-white font-fraunces text-xl font-medium leading-tight">GreenBridge</div>
            <div className="text-mint text-[10px] tracking-[2px] uppercase font-light mt-0.5">Food Rescue</div>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      {profile && (
        <div className="mx-4 mt-4 bg-white/6 rounded-xl px-4 py-3">
          <div className="text-[10px] text-mint/60 uppercase tracking-widest mb-1">Logged in as</div>
          <div className="text-white font-medium text-sm truncate">{profile.org_name}</div>
          <div className="text-mint/70 text-[11px] capitalize mt-0.5">
            {profile.role === 'restaurant' ? '🍽 Restaurant' : '🏠 Shelter'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-[10px] text-mint/40 uppercase tracking-widest px-3 mb-2">Menu</div>
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1
                text-sm transition-all duration-150
                ${active
                  ? 'bg-fern/20 text-mint'
                  : 'text-white/55 hover:text-white hover:bg-white/6'
                }
              `}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Live Impact Footer */}
      <div className="mx-4 mb-4 bg-fern/15 rounded-xl p-3">
        <div className="text-[10px] text-mint uppercase tracking-widest mb-2">Live Impact Today</div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">🌱 CO₂ Saved</span>
            <span className="text-amber-light text-xs font-medium">
              {liveStats ? `${liveStats.co2.toFixed(1)} kg` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">💧 Water</span>
            <span className="text-amber-light text-xs font-medium">
              {liveStats ? `${(liveStats.waterL / 1000).toFixed(1)}k L` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">🍽 Meals</span>
            <span className="text-amber-light text-xs font-medium">
              {liveStats ? liveStats.meals.toLocaleString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-4 pb-5 border-t border-white/8 pt-4">
        <button
          onClick={signOut}
          className="w-full text-left text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  );
}
