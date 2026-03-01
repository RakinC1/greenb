import { Card } from '@/components/UI/Card';

interface StatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  delta?: string;
  accent: 'green' | 'amber' | 'blue' | 'rust';
}

function StatCard({ emoji, value, label, delta, accent }: StatCardProps) {
  return (
    <Card accent={accent} className="p-5">
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="font-fraunces text-[32px] font-bold text-forest leading-none">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      {delta && <div className="text-xs font-medium text-sage mt-1.5">↑ {delta}</div>}
    </Card>
  );
}

interface StatsGridProps {
  meals: number;
  co2Kg: number;
  waterL: number;
  rescues: number;
}

export function StatsGrid({ meals, co2Kg, waterL, rescues }: StatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-7">
      <StatCard
        emoji="🍽"
        value={meals.toLocaleString()}
        label="Meals Rescued"
        delta="+48 today"
        accent="green"
      />
      <StatCard
        emoji="🌱"
        value={`${co2Kg.toFixed(1)}t`}
        label="CO₂ Prevented"
        delta="+0.3t this week"
        accent="amber"
      />
      <StatCard
        emoji="💧"
        value={`${(waterL / 1000).toFixed(1)}k L`}
        label="Water Saved"
        delta="+2.4k today"
        accent="blue"
      />
      <StatCard
        emoji="🤝"
        value={rescues}
        label="Successful Rescues"
        delta="+12 this week"
        accent="rust"
      />
    </div>
  );
}
