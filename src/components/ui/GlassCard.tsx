import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  const isInteractive = !!onClick;
  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-[24px] overflow-hidden ${isInteractive ? 'cursor-pointer hover:shadow-ambient-dark dark:hover:shadow-ambient-light transition-shadow duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
