import { Card, CardHeader } from '@/components/UI/Card';

interface ActivityItem {
  color: 'green' | 'amber' | 'blue';
  text: string;
  time: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { color: 'green', text: 'Sunrise Shelter claimed 24 sourdough loaves from Levain Bakery', time: '2m ago' },
  { color: 'amber', text: 'AI Alert: High pizza surplus predicted for Midtown tonight at 9 PM', time: '11m ago' },
  { color: 'blue',  text: 'Hope Community Center claimed 15 vegetable curry portions', time: '24m ago' },
  { color: 'green', text: 'City Food Bank claimed 20L organic milk from Farm Table', time: '1h ago' },
  { color: 'amber', text: 'AI Insight: Weekend brunch surplus expected — 3 restaurants flagged', time: '2h ago' },
  { color: 'green', text: "St. Mary's Kitchen claimed assorted pastries (36 pcs)", time: '3h ago' },
];

const dotColors = { green: 'bg-fern', amber: 'bg-amber', blue: 'bg-sky' };

export function ActivityFeed() {
  return (
    <Card className="p-5">
      <CardHeader title="📡 Live Activity" action="See map →" />
      <div className="space-y-1">
        {MOCK_ACTIVITY.map((item, i) => (
          <div key={i} className="flex gap-3 py-2.5 border-b border-forest/6 last:border-0">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[item.color]}`} />
            <p className="flex-1 text-sm text-forest leading-relaxed">{item.text}</p>
            <span className="text-[11px] text-muted whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
