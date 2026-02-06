'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  floatingLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      floatingLabel = false,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-13 px-5 text-lg',
    };

    const variants = {
      default: 'bg-gray-50 border-2 border-gray-200',
      filled: 'bg-gray-100 border-b-2 border-gray-300 rounded-t-xl rounded-b-none',
      outlined: 'bg-transparent border-2 border-gray-300',
    };

    const labelFloat = floatingLabel && (isFocused || hasValue);

    return (
      <div className="w-full">
        {!floatingLabel && label && (
          <motion.label
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            className={clsx(
              'flex w-full rounded-xl transition-all duration-200 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'hover:border-gray-300 focus:border-blue-500 focus:ring-blue-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              floatingLabel && 'pt-6 pb-2',
              variants[variant],
              sizes[size],
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              animate={{
                top: labelFloat ? '8px' : '50%',
                fontSize: labelFloat ? '0.75rem' : '1rem',
                y: labelFloat ? '0' : '-50%',
              }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'absolute left-4 pointer-events-none font-medium transition-colors',
                leftIcon && 'left-10',
                isFocused || hasValue ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              {label}
            </motion.label>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {/* Focus Border Animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-sm mt-2"
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
