import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          border-[1.5px] rounded-lg px-3 py-2.5
          font-sans text-sm text-forest bg-white
          outline-none transition-colors duration-150
          placeholder:text-muted/50
          ${error ? 'border-rust focus:border-rust' : 'border-forest/12 focus:border-sage'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, children, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          border-[1.5px] rounded-lg px-3 py-2.5
          font-sans text-sm text-forest bg-white
          outline-none transition-colors duration-150
          ${error ? 'border-rust' : 'border-forest/12 focus:border-sage'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={taId} className="text-[11px] font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={taId}
        className={`
          border-[1.5px] rounded-lg px-3 py-2.5
          font-sans text-sm text-forest bg-white
          outline-none transition-colors duration-150 resize-y min-h-[80px]
          placeholder:text-muted/50
          ${error ? 'border-rust' : 'border-forest/12 focus:border-sage'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}
