import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none rounded-xl';

  const variants = {
    primary:
      'bg-forest-900 text-white hover:bg-forest-950 active:scale-[0.99] shadow-subtle',
    secondary:
      'bg-teal-800 text-white hover:bg-teal-900 active:scale-[0.99] shadow-subtle',
    outline:
      'border border-border bg-white text-foreground hover:bg-stone-50 hover:border-stone-300 active:scale-[0.99]',
    ghost:
      'text-stone-600 hover:text-foreground hover:bg-stone-100/80 active:scale-[0.99]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:scale-[0.99] shadow-subtle',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 shadow-clinical',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
