'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  withRipple?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      fullWidth,
      withRipple = true,
      icon,
      iconPosition = 'left',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (ripples.length > 0) {
        const timer = setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 600);
        return () => clearTimeout(timer);
      }
    }, [ripples]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
      }
      onClick?.(e);
    };

    const variants = {
      primary:
        'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800',
      secondary:
        'bg-white/10 backdrop-blur-xl text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md',
      ghost:
        'text-gray-700 hover:bg-gray-100/80 backdrop-blur-sm',
      destructive:
        'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-red-800',
      outline:
        'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 backdrop-blur-sm',
      gradient:
        'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
    };

    const sizes = {
      xs: 'h-8 px-3 text-xs font-medium rounded-lg gap-1',
      sm: 'h-9 px-4 text-sm font-medium rounded-xl gap-1.5',
      md: 'h-11 px-6 text-sm font-semibold rounded-xl gap-2',
      lg: 'h-12 px-8 text-base font-semibold rounded-2xl gap-2',
      xl: 'h-14 px-10 text-lg font-semibold rounded-2xl gap-2.5',
      icon: 'h-10 w-10 rounded-xl p-0',
    };

    return (
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={clsx(
          'relative inline-flex items-center justify-center font-medium transition-all duration-200 overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Ripple Effect */}
        {withRipple && (
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute w-20 h-20 bg-white rounded-full pointer-events-none"
                style={{
                  left: ripple.x - 40,
                  top: ripple.y - 40,
                }}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Content */}
        <span className="relative flex items-center justify-center gap-inherit">
          {isLoading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              <span className="hidden sm:inline">Loading...</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && <span>{icon}</span>}
              {children}
              {icon && iconPosition === 'right' && <span>{icon}</span>}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
