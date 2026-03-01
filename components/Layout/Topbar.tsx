'use client';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  urgentCount?: number;
}

export function Topbar({ title, subtitle, actions, urgentCount = 0 }: TopbarProps) {
  return (
    <header className="bg-white border-b border-forest/7 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="font-fraunces text-2xl font-medium text-forest leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {urgentCount > 0 && (
          <span className="bg-amber text-forest text-[11px] font-semibold px-3 py-1 rounded-full">
            ⚡ {urgentCount} urgent
          </span>
        )}
        <span className="bg-fern text-white text-[11px] font-semibold px-3 py-1 rounded-full">
          🤖 AI active
        </span>
        {actions}
        <div className="w-9 h-9 bg-moss rounded-full flex items-center justify-center text-mint text-base cursor-pointer hover:bg-sage transition-colors">
          👤
        </div>
      </div>
    </header>
  );
}
