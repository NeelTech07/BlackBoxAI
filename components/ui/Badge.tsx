import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'neutral' | 'active';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight';

  const variants = {
    default: 'bg-forest-900/10 text-forest-900 border border-forest-900/20',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    info: 'bg-teal-50 text-teal-800 border border-teal-200/80',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200',
    active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
}
