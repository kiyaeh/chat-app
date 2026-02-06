'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface SkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  variant?: 'default' | 'circular' | 'rectangular';
  animated?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = 'h-4',
  width,
  variant = 'default',
  animated = true,
  className,
}) => {
  const shapes = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={clsx(
            'relative overflow-hidden bg-gray-200',
            animated && 'animate-pulse',
            shapes[variant],
            height,
            width,
            className
          )}
        >
          {animated && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  );
};

// Avatar skeleton component
export const SkeletonAvatar: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }> = ({
  size = 'md',
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton variant="circular" height={sizes[size]} width={sizes[size]} />;
};

// Text skeleton component
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

// Card skeleton component
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('p-4 bg-white rounded-xl border border-gray-200', className)}>
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <Skeleton height="h-5" width="w-2/3" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
};
