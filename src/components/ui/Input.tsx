import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {label && <label className="text-sm font-semibold tracking-wide ml-1 opacity-90">{label}</label>}
        <input
          ref={ref}
          className={`
            w-full px-5 py-4 rounded-[20px] bg-white/40 dark:bg-black/40
            border border-transparent 
            focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]
            placeholder:opacity-50 transition-all duration-300 backdrop-blur-md
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
        {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
