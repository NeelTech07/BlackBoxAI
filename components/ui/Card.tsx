import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'bordered' | 'interactive';
}

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-5 transition-all duration-200';

  const variants = {
    default: 'border border-border/80 shadow-subtle',
    subtle: 'bg-stone-50/60 border border-stone-200/60',
    bordered: 'border border-stone-200 shadow-none',
    interactive: 'border border-border/80 shadow-subtle hover:border-forest-900/30 hover:shadow-clinical cursor-pointer',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
