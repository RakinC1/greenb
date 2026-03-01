import React from 'react';

type Variant = 'primary' | 'outline' | 'amber' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-sage hover:bg-fern text-white border border-transparent',
  outline: 'bg-transparent hover:bg-sage/10 text-sage border border-sage',
  amber:   'bg-amber hover:bg-amber-light text-forest border border-transparent',
  ghost:   'bg-transparent hover:bg-forest/5 text-muted border border-transparent',
  danger:  'bg-rust hover:bg-rust/80 text-white border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⟳</span>
          Loading…
        </>
      ) : children}
    </button>
  );
}
