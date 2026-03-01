'use client';
import { useEffect, useState } from 'react';
import type { GeminiPredictionResult, RiskLevel } from '@/types';

const riskStyles: Record<RiskLevel, string> = {
  high:   'bg-rust/30 text-orange-300',
  medium: 'bg-amber/30 text-amber-light',
  low:    'bg-fern/30 text-mint',
};

export function PredictionWidget() {
  const [result, setResult]   = useState<GeminiPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/predict')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-br from-forest to-moss rounded-2xl p-5 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-radial from-fern/30 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-fern animate-pulse" />
        <span className="text-[10px] text-mint tracking-widest uppercase font-medium">AI Prediction Engine</span>
      </div>

      <h3 className="font-fraunces text-[17px] font-medium mb-3">Tomorrow's Waste Forecast</h3>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between py-2 border-b border-white/8 animate-pulse">
              <div className="flex gap-3">
                <div className="w-6 h-4 bg-white/10 rounded" />
                <div>
                  <div className="h-3 w-32 bg-white/10 rounded mb-1" />
                  <div className="h-2 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && result && (
        <>
          <div className="divide-y divide-white/8">
            {result.predictions.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex gap-3">
                  <span className="text-lg w-7 text-center">
                    {p.category === 'Bakery' ? '🍞' :
                     p.category === 'Produce' ? '🥦' :
                     p.category === 'Meat' ? '🍗' :
                     p.category === 'Dairy' ? '🧀' : '🍽'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white/90">{p.item_name}</div>
                    <div className="text-[11px] text-white/40">{p.reason}</div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${riskStyles[p.risk_level]}`}>
                  {Math.round(p.confidence * 100)}% risk
                </span>
              </div>
            ))}
          </div>
          {result.summary && (
            <p className="mt-3 text-xs text-white/50 leading-relaxed border-t border-white/8 pt-3">
              {result.summary}
            </p>
          )}
        </>
      )}

      {!loading && !result && (
        <p className="text-sm text-white/40 py-4 text-center">
          Upload more listings to unlock AI predictions.
        </p>
      )}

      <button
        onClick={() => { setLoading(true); fetch('/api/predict').then(r => r.json()).then(d => { setResult(d); setLoading(false); }); }}
        className="mt-4 w-full text-xs text-mint/70 border border-mint/20 rounded-xl py-2 hover:bg-white/5 transition-colors"
      >
        Refresh Forecast ↻
      </button>
    </div>
  );
}
