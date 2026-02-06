'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface OnlineStatusProps {
  status: 'online' | 'offline' | 'away' | 'dnd';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  status,
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    dnd: 'bg-red-500',
  };

  const labels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    dnd: 'Do Not Disturb',
  };

  const textColors = {
    online: 'text-green-700',
    offline: 'text-gray-700',
    away: 'text-yellow-700',
    dnd: 'text-red-700',
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative">
        <motion.div
          className={clsx(
            'rounded-full',
            sizes[size],
            colors[status]
          )}
          animate={
            animated && status === 'online'
              ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
              : {}
          }
          transition={
            animated && status === 'online'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        />
        {animated && status === 'online' && (
          <motion.div
            className={clsx('absolute inset-0 rounded-full', colors[status])}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      {showLabel && (
        <span className={clsx('text-sm font-medium', textColors[status])}>
          {labels[status]}
        </span>
      )}
    </div>
  );
};

// Badge version for user cards
export const StatusBadge: React.FC<{ status: 'online' | 'offline' | 'away' | 'dnd' }> = ({
  status,
}) => {
  const colors = {
    online: 'bg-green-100 text-green-700 border-green-300',
    offline: 'bg-gray-100 text-gray-700 border-gray-300',
    away: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    dnd: 'bg-red-100 text-red-700 border-red-300',
  };

  const labels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    dnd: 'DND',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
        colors[status]
      )}
    >
      <OnlineStatus status={status} size="sm" animated={status === 'online'} />
      <span>{labels[status]}</span>
    </div>
  );
};
