import React from 'react';

type BadgeVariant = 'fresh' | 'urgent' | 'expiring' | 'claimed' | 'green' | 'amber' | 'blue' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  fresh:    'bg-fern/15 text-sage',
  urgent:   'bg-amber/15 text-amber/80',
  expiring: 'bg-rust/15 text-rust',
  claimed:  'bg-sky/15 text-sky/80',
  green:    'bg-fern/15 text-sage',
  amber:    'bg-amber text-forest',
  blue:     'bg-sky/15 text-sky/80',
  default:  'bg-forest/10 text-muted',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 text-[10px] font-semibold
      px-2 py-0.5 rounded-md tracking-wide
      ${variantStyles[variant]} ${className}
    `}>
      {children}
    </span>
  );
}
