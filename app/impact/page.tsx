'use client';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { Card, CardHeader } from '@/components/UI/Card';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { formatCO2, formatWater, getEquivalences } from '@/lib/impact';

interface PlatformStats {
  total_meals: number;
  total_co2: number;
  total_water: number;
  total_rescues: number;
  active_restaurants: number;
  active_shelters: number;
  equivalences: ReturnType<typeof getEquivalences>;
}

export default function ImpactPage() {
  const [stats, setStats]   = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/impact')
      .then(r => r.json())
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Live counter animation
  const [live, setLive] = useState({ meals: 2841, co2: 4700, water: 18400 });
  useEffect(() => {
    const t = setInterval(() => {
      setLive(s => ({
        meals: s.meals + Math.floor(Math.random() * 2),
        co2:   s.co2 + Math.floor(Math.random() * 10),
        water: s.water + Math.floor(Math.random() * 40),
      }));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  const total_co2   = stats?.total_co2   ?? live.co2;
  const total_water = stats?.total_water ?? live.water;
  const total_meals = stats?.total_meals ?? live.meals;
  const equiv       = stats?.equivalences ?? getEquivalences(total_co2, total_water);

  return (
    <AppLayout>
      <Topbar
        title="Environmental Impact 🌍"
        subtitle="Real numbers. Real change. Every rescued meal matters."
      />

      <div className="p-8">
        {/* Hero stats */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {[
            { icon: '🌱', val: formatCO2(total_co2), label: 'CO₂ Prevented', accent: 'green' as const },
            { icon: '💧', val: formatWater(total_water), label: 'Water Saved', accent: 'blue' as const },
            { icon: '🍽', val: total_meals.toLocaleString(), label: 'Meals Rescued', accent: 'amber' as const },
            { icon: '🏪', val: `${stats?.active_restaurants ?? 84}`, label: 'Partner Restaurants', accent: 'rust' as const },
          ].map(item => (
            <div key={item.label} className={`
              bg-white rounded-2xl border border-forest/7 p-6 relative overflow-hidden
              hover:shadow-md transition-all
            `}>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                item.accent === 'green' ? 'from-sage to-fern' :
                item.accent === 'blue'  ? 'from-sky to-sky/50' :
                item.accent === 'amber' ? 'from-amber to-amber-light' :
                'from-rust to-rust/60'
              }`} />
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="font-fraunces text-4xl font-bold text-forest leading-none">{item.val}</div>
              <div className="font-medium text-sm text-forest mt-2">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-5">
            {/* Activity chart */}
            <Card className="p-5">
              <CardHeader title="🗓 Rescue Activity — Last 30 Days" />
              <div className="flex items-end gap-1 h-28">
                {Array.from({ length: 30 }, (_, i) => {
                  const h = 20 + Math.sin(i / 3) * 20 + Math.random() * 30 + (i > 20 ? 15 : 0);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-moss to-fern rounded-t-sm opacity-75 hover:opacity-100 transition-opacity"
                      style={{ height: `${Math.min(100, Math.max(10, h))}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted">30 days ago</span>
                <span className="text-xs text-muted">Today</span>
              </div>
            </Card>

            {/* Top contributors */}
            <Card className="p-5">
              <CardHeader title="🏆 Top Restaurant Contributors" />
              <div className="space-y-0">
                {[
                  { name: 'Farm Table',          meals: 312, icon: '🌾' },
                  { name: 'Ember Kitchen',        meals: 289, icon: '🔥' },
                  { name: 'Levain Bakery',        meals: 241, icon: '🍞' },
                  { name: 'The Garden Bistro',    meals: 198, icon: '🥗' },
                  { name: 'Spice Route',          meals: 176, icon: '🌶' },
                ].map((r, i) => (
                  <div key={r.name} className={`flex items-center gap-3 py-3 ${i < 4 ? 'border-b border-forest/6' : ''}`}>
                    <span className="text-sm font-bold text-muted w-5">#{i+1}</span>
                    <span className="text-xl">{r.icon}</span>
                    <span className="flex-1 text-sm font-medium text-forest">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-fern/20 overflow-hidden" style={{ width: 60 }}>
                        <div className="h-full bg-fern rounded-full" style={{ width: `${(r.meals / 312) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-sage">{r.meals} meals</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: equivalences */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-forest to-moss rounded-2xl p-5 text-white">
              <div className="text-[10px] text-mint uppercase tracking-widest mb-4">
                Real-world Equivalences
              </div>
              <div className="space-y-4">
                {[
                  { icon: '🌳', val: equiv.treesEquivalent.toLocaleString(), label: 'trees worth of CO₂ absorbed' },
                  { icon: '🚿', val: equiv.showersEquivalent.toLocaleString(), label: 'showers worth of water saved' },
                  { icon: '🚗', val: `${equiv.carKmEquivalent.toLocaleString()} km`, label: 'not driven by car' },
                  { icon: '✈️', val: `${equiv.flightsEquivalent} flights`, label: 'equivalent London→NYC' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3 items-start">
                    <span className="text-2xl w-8 flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-fraunces text-xl font-bold text-white">{item.val}</div>
                      <div className="text-xs text-white/50 mt-0.5">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-5">
              <CardHeader title="📊 Platform Stats" />
              <div className="space-y-3">
                {[
                  ['🏪 Active Restaurants',  stats?.active_restaurants ?? 84],
                  ['🏠 Partner Shelters',    stats?.active_shelters    ?? 32],
                  ['✅ Total Rescues',        stats?.total_rescues      ?? 187],
                  ['📍 Cities Covered',      14],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center py-2 border-b border-forest/6 last:border-0">
                    <span className="text-sm text-forest">{label}</span>
                    <span className="font-fraunces font-bold text-lg text-forest">{val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
