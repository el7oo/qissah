import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[var(--color-gold)] text-[#121414] shadow-ambient-dark dark:shadow-ambient-light hover:brightness-110",
    secondary: "bg-[var(--color-emerald)] text-white shadow-ambient-dark hover:brightness-110",
    glass: "glass-panel text-[var(--color-foreground)] hover:bg-white/10 dark:hover:bg-white/5",
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
