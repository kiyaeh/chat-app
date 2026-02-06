'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'soft';
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  children,
  dismissible = false,
  onClose,
  className,
  icon: customIcon,
  variant = 'soft',
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const variants = {
    filled: {
      success: 'bg-green-600 text-white border border-green-700',
      error: 'bg-red-600 text-white border border-red-700',
      warning: 'bg-orange-600 text-white border border-orange-700',
      info: 'bg-blue-600 text-white border border-blue-700',
    },
    outlined: {
      success: 'bg-white text-green-700 border-2 border-green-500',
      error: 'bg-white text-red-700 border-2 border-red-500',
      warning: 'bg-white text-orange-700 border-2 border-orange-500',
      info: 'bg-white text-blue-700 border-2 border-blue-500',
    },
    soft: {
      success: 'bg-green-50 text-green-800 border border-green-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-orange-50 text-orange-800 border border-orange-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200',
    },
  };

  const icon = customIcon || icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', damping: 25 }}
      className={clsx(
        'relative flex items-start gap-4 p-4 rounded-2xl shadow-sm',
        variants[variant][type],
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-sm leading-relaxed">
            {message}
          </p>
        )}
        {children && (
          <div className="text-sm leading-relaxed">
            {children}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className={clsx(
            'flex-shrink-0 p-1 rounded-lg transition-colors',
            variant === 'filled' ? 'hover:bg-white/20' : 'hover:bg-black/5'
          )}
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}

      {/* Animated border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={clsx(
          'absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl origin-left',
          type === 'success' && 'bg-green-500',
          type === 'error' && 'bg-red-500',
          type === 'warning' && 'bg-orange-500',
          type === 'info' && 'bg-blue-500'
        )}
      />
    </motion.div>
  );
};
