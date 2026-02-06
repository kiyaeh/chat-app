'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'dnd';
  image?: string;
  showStatusAnimation?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  status,
  image,
  showStatusAnimation = true,
  className,
  onClick,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    dnd: 'bg-red-500',
  };

  // Generate vibrant gradient based on name
  const getGradient = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-cyan-600',
      'from-amber-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className={clsx('relative inline-block', className)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={clsx(
          'flex items-center justify-center rounded-full font-semibold text-white bg-gradient-to-br shadow-lg',
          'ring-2 ring-white ring-offset-2',
          sizes[size],
          getGradient(name),
          onClick && 'cursor-pointer hover:shadow-xl transition-shadow duration-200'
        )}
        onClick={onClick}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="select-none">{initials}</span>
        )}
      </div>
      {status && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white shadow-sm',
            statusSizes[size],
            statusColors[status],
            showStatusAnimation && status === 'online' && 'animate-pulse'
          )}
        />
      )}
    </motion.div>
  );
};
