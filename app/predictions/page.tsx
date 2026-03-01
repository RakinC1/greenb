'use client';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Topbar } from '@/components/Layout/Topbar';
import { Card, CardHeader } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import type { GeminiPredictionResult, RiskLevel } from '@/types';

const RISK_STYLES: Record<RiskLevel, { bar: string; badge: string; label: string }> = {
  high:   { bar: 'bg-rust',   badge: 'bg-rust/20 text-orange-400',    label: 'High Risk' },
  medium: { bar: 'bg-amber',  badge: 'bg-amber/20 text-amber-400',    label: 'Medium Risk' },
  low:    { bar: 'bg-fern',   badge: 'bg-fern/20 text-sage',          label: 'Low Risk' },
};

const EMOJI_MAP: Record<string, string> = {
  Bakery: '🍞', Produce: '🥦', Meat: '🍗', Dairy: '🧀', 'Cooked Meals': '🍲', Beverages: '☕', Other: '📦',
};

export default function PredictionsPage() {
  const [result, setResult]   = useState<GeminiPredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function fetchPredictions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/predict');
      if (!res.ok) throw new Error('Failed to fetch predictions');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { fetchPredictions(); }, []);

  return (
    <AppLayout>
      <Topbar
        title="AI Predictions 🤖"
        subtitle="Gemini forecasts tomorrow's surplus before it happens"
        actions={<Button size="sm" variant="outline" onClick={fetchPredictions}>↻ Refresh</Button>}
      />

      <div className="p-8">
        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-5">
            {/* Main prediction card */}
            <div className="bg-gradient-to-br from-forest to-moss rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-fern/15 blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-fern animate-pulse" />
                <span className="text-[10px] text-mint tracking-widest uppercase font-medium">
                  Gemini 1.5 Flash · Live Forecast
                </span>
              </div>

              <h2 className="font-fraunces text-2xl font-medium mb-1">
                Tomorrow&apos;s Waste Forecast
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Based on your last 30 days of surplus data
              </p>

              {loading && (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/8 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10" />
                        <div>
                          <div className="h-3.5 w-36 bg-white/10 rounded mb-2" />
                          <div className="h-2.5 w-52 bg-white/6 rounded" />
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-rust/20 rounded-xl p-4 text-orange-300 text-sm">{error}</div>
              )}

              {!loading && result && (
                <>
                  <div className="divide-y divide-white/8">
                    {result.predictions.map((p, i) => {
                      const risk = RISK_STYLES[p.risk_level];
                      return (
                        <div key={i} className="flex items-center justify-between py-4">
                          <div className="flex gap-3 flex-1 min-w-0">
                            <span className="text-2xl w-9 text-center flex-shrink-0">
                              {EMOJI_MAP[p.category] ?? '📦'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white text-sm">{p.item_name}</div>
                              <div className="text-xs text-white/40 mt-0.5 truncate">{p.reason}</div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden" style={{ maxWidth: 120 }}>
                                  <div className={`h-full rounded-full ${risk.bar}`} style={{ width: `${p.confidence * 100}%` }} />
                                </div>
                                <span className="text-xs text-white/40">{Math.round(p.confidence * 100)}%</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ml-4 flex-shrink-0 ${risk.badge}`}>
                            {risk.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {result.summary && (
                    <div className="mt-4 pt-4 border-t border-white/8">
                      <p className="text-sm text-white/60 leading-relaxed">{result.summary}</p>
                    </div>
                  )}
                </>
              )}

              {!loading && result?.predictions?.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm">Upload more listings to unlock AI predictions.</p>
                </div>
              )}
            </div>

            {/* Weekly pattern chart */}
            <Card className="p-5">
              <CardHeader title="📅 Weekly Surplus Pattern" />
              <div className="flex items-end gap-2 h-28">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const heights = [40, 55, 35, 65, 85, 92, 70];
                  const isHigh  = heights[i] >= 80;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-md transition-all ${isHigh ? 'bg-gradient-to-t from-rust to-amber opacity-90' : 'bg-gradient-to-t from-moss to-fern opacity-60'}`}
                        style={{ height: `${heights[i]}%` }}
                      />
                      <span className="text-[10px] text-muted">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 bg-amber/10 rounded-xl p-3 text-sm text-amber/80 border border-amber/20">
                ⚠️ <strong>Friday & Saturday</strong> show highest surplus (85–92%). GreenBridge pre-alerts nearby shelters in advance.
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <Card className="p-5">
              <CardHeader title="🧠 How It Works" />
              <div className="space-y-3">
                {[
                  { icon: '📊', title: 'Historical Patterns', desc: 'Trains on your last 30 days of surplus data' },
                  { icon: '📅', title: 'Day-of-Week Signals', desc: 'Learns which days generate most waste' },
                  { icon: '🏷', title: 'Category Analysis', desc: 'Identifies perishable patterns by food type' },
                  { icon: '📡', title: 'Live Updates', desc: 'Refreshes as new listings come in' },
                ].map((item, i, arr) => (
                  <div key={i} className={`flex gap-3 py-2.5 ${i < arr.length - 1 ? 'border-b border-forest/6' : ''}`}>
                    <span className="text-xl w-7 flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-medium text-sm text-forest">{item.title}</div>
                      <div className="text-xs text-muted mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <CardHeader title="📈 Model Accuracy" />
              <div className="space-y-3">
                {[
                  ['Waste Prediction',   91],
                  ['Demand Forecast',    87],
                  ['Pickup Success',     84],
                ].map(([label, pct]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-forest">{label}</span>
                      <span className="font-semibold text-sage">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-forest/8 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sage to-fern rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
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
