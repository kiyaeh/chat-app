'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  onClick,
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-gray-200 shadow-md',
    elevated: 'bg-white border border-gray-100 shadow-2xl shadow-gray-200/50',
  };

  const hoverEffects = hover ? {
    default: 'hover:shadow-lg hover:border-gray-300 hover:-translate-y-1',
    glass: 'hover:bg-white/20 hover:shadow-2xl hover:-translate-y-1',
    gradient: 'hover:shadow-xl hover:-translate-y-1',
    elevated: 'hover:shadow-3xl hover:-translate-y-2',
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        hover && hoverEffects[variant],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Shimmering effect overlay */}
      {variant === 'glass' && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: ['−100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />
        </div>
      )}

      {children}
    </motion.div>
  );
};

// Card Header Component
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx('px-6 py-5 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

// Card Body Component
export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={clsx('p-6', className)}>{children}</div>;
};

// Card Footer Component
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl', className)}>
      {children}
    </div>
  );
};
