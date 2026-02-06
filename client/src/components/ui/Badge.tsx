'use client';

import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-600',
    warning: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-600',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-600',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200',
        variants[variant],
        sizes[size],
        'hover:scale-105',
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'rounded-full bg-current animate-pulse',
            dotSizes[size]
          )}
        />
      )}
      {children}
    </span>
  );
};
