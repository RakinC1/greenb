import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'green' | 'amber' | 'blue' | 'rust';
}

const accentColors: Record<string, string> = {
  green: 'from-sage to-fern',
  amber: 'from-amber to-amber-light',
  blue:  'from-sky to-sky/60',
  rust:  'from-rust to-rust/60',
};

export function Card({ children, className = '', accent }: CardProps) {
  return (
    <div className={`
      bg-white rounded-2xl border border-forest/7
      relative overflow-hidden
      transition-all duration-200 hover:shadow-md
      ${className}
    `}>
      {accent && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentColors[accent]}`} />
      )}
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="font-fraunces text-[17px] font-medium text-forest">{title}</h3>
      {action && <div className="text-sm text-sage cursor-pointer hover:text-fern">{action}</div>}
    </div>
  );
}
